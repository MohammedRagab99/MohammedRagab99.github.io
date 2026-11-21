"""Single-user, server-side tracker for an authorized Microsoft work account."""

import base64
from collections import deque
from datetime import date, datetime, timedelta, timezone
from getpass import getpass
import hashlib
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
import json
import os
from pathlib import Path, PurePosixPath
import re
import secrets
import sys
from threading import Lock
import time
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, quote, urlencode, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener
from uuid import UUID
from xml.etree import ElementTree
from zipfile import BadZipFile, ZipFile

ROOT = Path(__file__).resolve().parent
GRAPH = "https://graph.microsoft.com/v1.0"
SCOPES = "https://graph.microsoft.com/User.Read https://graph.microsoft.com/Files.ReadWrite"
UNITS = ("A01", "A02A", "A02B")
STATUSES = ("Open", "In progress", "Complete", "Blocked")
HEADERS = ("Entry ID", "Date", "Unit", "Equipment tag", "Work order", "EPTW", "Activity",
           "Status", "Progress", "Hours", "Remarks")
TABLE = "RagabVerseDaily"
SESSION_COOKIE = "rv_tracker"
SESSIONS = {}
SESSION_LOCK = Lock()
PASSWORD_ATTEMPTS = deque()
WRITE_LOCK = Lock()
CACHE = {}
XLS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
REL = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"


class ServiceError(Exception):
    def __init__(self, message, code=502):
        super().__init__(message)
        self.code = code


class SafeRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if urlsplit(newurl).scheme != "https":
            raise ServiceError("A workbook download was redirected to an insecure address.")
        redirected = super().redirect_request(req, fp, code, msg, headers, newurl)
        if redirected and urlsplit(req.full_url).netloc != urlsplit(newurl).netloc:
            redirected.remove_header("Authorization")
        return redirected


HTTP = build_opener(SafeRedirect())


def request(url, token=None, data=None, form=False, download=False):
    headers = {"Accept": "application/json"}
    body = None
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if data is not None:
        headers["Content-Type"] = "application/x-www-form-urlencoded" if form else "application/json"
        body = (urlencode(data) if form else json.dumps(data)).encode()
    try:
        with HTTP.open(Request(url, data=body, headers=headers), timeout=30) as response:
            limit = 16_000_000
            result = response.read(limit + 1)
        if len(result) > limit:
            raise ServiceError("The source returned more data than the tracker can load.")
        return result if download else json.loads(result)
    except HTTPError as exc:
        if not download:
            try:
                error = json.loads(exc.read(32768)).get("error", {})
                codes = (error.get("code"), (error.get("innerError") or {}).get("code"))
                if any(code in {"unsupportedWorkbook", "invalidSessionUnsupportedWorkbook"} for code in codes):
                    raise ServiceError("Microsoft Excel cannot open this workbook through Graph. Ask the workbook owner to check it in Excel for the web.", 409) from None
            except (AttributeError, ValueError):
                pass
        messages = {
            401: "Microsoft sign-in has expired. Sign in again.",
            403: "Your Microsoft account does not have permission for this workbook.",
            404: "The workbook, worksheet, or tracker table could not be found.",
            409: "The workbook is busy. Wait briefly and try again.",
            429: "Microsoft is limiting requests. Wait briefly and try again.",
        }
        raise ServiceError(messages.get(exc.code, "Microsoft could not complete the workbook request."), exc.code) from None
    except (OSError, URLError, ValueError):
        raise ServiceError("Could not read a response from Microsoft.") from None


def graph(path, token, body=None):
    return request(GRAPH + path, token, body)


def workbook_item(config, which, token):
    share = config[which]
    encoded = "u!" + base64.urlsafe_b64encode(share.encode()).decode().rstrip("=")
    item = graph(f"/shares/{encoded}/driveItem", token)
    parent = item.get("parentReference") or {}
    if not item.get("id") or not parent.get("driveId"):
        raise ServiceError("Microsoft did not return the workbook's drive reference.")
    return f"/drives/{quote(parent['driveId'], safe='')}/items/{quote(item['id'], safe='')}"


def read_master(content):
    """Read values from one OOXML worksheet. VBA and external links are ignored."""
    with ZipFile(BytesIO(content)) as archive:
        def read(part):
            if archive.getinfo(part).file_size > 32_000_000:
                raise ServiceError("The equipment library is too large for this tracker.")
            return ElementTree.fromstring(archive.read(part))

        workbook = read("xl/workbook.xml")
        relationships = {el.get("Id"): el.get("Target") for el in read("xl/_rels/workbook.xml.rels")}
        source = next((el for el in workbook.iter(XLS + "sheet") if el.get("name") == "Master_Equipment"), None)
        if source is None:
            raise ServiceError("The Master_Equipment worksheet is missing.")
        target = relationships[source.get(REL + "id")]
        part = target.lstrip("/") if target.startswith("/") else str(PurePosixPath("xl", target))
        if not re.fullmatch(r"xl/worksheets/sheet\d+\.xml", part):
            raise ServiceError("The equipment worksheet layout is unsupported.")
        strings = []
        if "xl/sharedStrings.xml" in archive.namelist():
            strings = ["".join(t.text or "" for t in node.iter(XLS + "t")) for node in read("xl/sharedStrings.xml")]
        wanted = {"A", "B", "C", "D", "E", "F", "Q", "Y"}
        rows = []
        for row in read(part).iter(XLS + "row"):
            if row.get("r") == "1":
                continue
            cells = {}
            for cell in row.findall(XLS + "c"):
                column = re.sub(r"\d+$", "", cell.get("r", ""))
                if column not in wanted:
                    continue
                value = cell.findtext(XLS + "v", "").strip()
                if cell.get("t") == "s" and value.isdigit():
                    value = strings[int(value)].strip()
                elif cell.get("t") == "inlineStr":
                    value = "".join(t.text or "" for t in cell.iter(XLS + "t")).strip()
                cells[column] = value
            tag = cells.get("C") or cells.get("B") or cells.get("A")
            if tag:
                rows.append({
                    "tag": tag, "description": cells.get("D", ""), "location": cells.get("E", ""),
                    "locationDescription": cells.get("F", ""), "family": cells.get("Q", ""), "type": cells.get("Y", "")
                })
        return rows


def equipment(config, token):
    cached = CACHE.get("equipment")
    if cached and time.monotonic() - cached[0] < 600:
        return cached[1]
    path = workbook_item(config, "master", token)
    content = request(GRAPH + path + "/content", token, download=True)
    try:
        rows = read_master(content)
    except (BadZipFile, ValueError, KeyError, IndexError, ElementTree.ParseError) as exc:
        raise ServiceError("The equipment workbook could not be parsed.") from exc
    CACHE["equipment"] = time.monotonic(), rows
    return rows


def excel_date(value, display):
    if isinstance(value, (int, float)) and 0 < value <= 100000:
        return (date(1899, 12, 30) + timedelta(days=int(value))).isoformat()
    return str(display or value or "")[:32]


def history(base, token, unit):
    # The shared report uses different date and activity columns in A02B.
    result = graph(f"{base}/worksheets/{unit}/usedRange(valuesOnly=true)?$select=values,text", token)
    values = result.get("values") or []
    texts = result.get("text") or values
    logs = []
    for row, display in zip(values[1:], texts[1:]):
        cells = list(row) + [""] * 6
        shown = list(display) + [""] * 6
        offset = int(unit == "A02B")
        activity = str(shown[3 + offset] or "").strip()
        if activity:
            logs.append({
                "date": excel_date(cells[2 + offset], shown[2 + offset]), "unit": unit,
                "tag": str(shown[1] or ""), "order": str(shown[0] or ""),
                "permit": str(shown[2] or "") if offset else "", "activity": activity,
                "status": "", "progress": "", "hours": "",
                "remarks": str(shown[4 + offset] or ""), "source": unit,
            })
    return logs[-100:][::-1]


def tracked_rows(base, token):
    result = graph(f"{base}/tables/{TABLE}/range?$select=values", token)
    rows = result.get("values") or []
    if not rows or tuple(rows[0]) != HEADERS:
        raise ServiceError("The daily tracker table headings do not match the setup guide.", 409)
    return rows[1:]


def activity_data(config, token, unit):
    cached = CACHE.get(unit)
    if cached and time.monotonic() - cached[0] < 90:
        return cached[1]
    base = workbook_item(config, "daily", token) + "/workbook"
    log = history(base, token, unit)
    ready = True
    try:
        rows = tracked_rows(base, token)
    except ServiceError as exc:
        if exc.code != 404:
            raise
        rows = []
        ready = False
    fields = ("entryId", "date", "unit", "tag", "order", "permit", "activity", "status", "progress", "hours", "remarks")
    tracked = [
        dict(zip(fields, row), date=excel_date(row[1], row[1]), source="Tracker")
        for row in reversed(rows) if len(row) == len(fields) and row[2] == unit
    ]
    result = {"entries": tracked[:150] + log, "writeReady": ready}
    CACHE[unit] = time.monotonic(), result
    return result


def text_cell(value, limit, required=False):
    if not isinstance(value, str):
        raise ValueError
    value = value.strip()
    if (required and not value) or len(value) > limit or "\0" in value:
        raise ValueError
    return "'" + value if value.startswith(("=", "+", "-", "@")) else value


def entry_values(data):
    entry = str(UUID(data["entryId"]))
    day = date.fromisoformat(data["date"]).isoformat()
    unit = data["unit"]
    status = data["status"]
    if unit not in UNITS or status not in STATUSES:
        raise ValueError
    hours, progress = data["hours"], data["progress"]
    if type(hours) not in (int, float) or not 0 <= hours <= 24 or type(progress) is not int or not 0 <= progress <= 100:
        raise ValueError
    return [entry, day, unit, text_cell(data["tag"], 90, True), text_cell(data["order"], 90),
            text_cell(data["permit"], 90), text_cell(data["activity"], 1500, True), status,
            progress, hours, text_cell(data["remarks"], 1500)]


def save_activity(config, token, data):
    try:
        row = entry_values(data)
    except (ValueError, TypeError, KeyError, AttributeError):
        raise ServiceError("Check the activity fields, date, hours, and progress.", 400) from None
    base = workbook_item(config, "daily", token) + "/workbook"
    with WRITE_LOCK:
        try:
            rows = tracked_rows(base, token)
        except ServiceError as exc:
            if exc.code == 404:
                raise ServiceError("Create the RagabVerseDaily table in the daily workbook first.", 409) from None
            raise
        if not any(current and current[0] == row[0] for current in rows):
            graph(f"{base}/tables/{TABLE}/rows/add", token, {"values": [row]})
        CACHE.pop(row[2], None)
    return {"entryId": row[0]}


def hash_password(password, salt):
    return hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=2**14, r=8, p=1).hex()


def configure():
    required = {
        "origin": "TRACKER_ORIGIN", "tenant": "TRACKER_TENANT_ID", "client": "TRACKER_CLIENT_ID",
        "secret": "TRACKER_CLIENT_SECRET", "user": "TRACKER_USER_ID", "password": "TRACKER_PASSWORD_HASH",
        "master": "TRACKER_MASTER_SHARE_URL", "daily": "TRACKER_DAILY_SHARE_URL",
    }
    config = {key: os.environ.get(name, "").strip() for key, name in required.items()}
    missing = [required[key] for key, value in config.items() if not value]
    if missing:
        raise SystemExit("Set: " + ", ".join(missing))
    config["origin"] = config["origin"].rstrip("/")
    origin = urlsplit(config["origin"])
    loopback = origin.hostname in {"localhost", "127.0.0.1"}
    if origin.path or origin.query or origin.fragment or not origin.hostname or origin.username or (
        origin.scheme != "https" and not (loopback and origin.scheme == "http")
    ):
        raise SystemExit("Use an HTTPS origin or an HTTP loopback origin.")
    try:
        for key in ("tenant", "client", "user"):
            config[key] = str(UUID(config[key]))
    except ValueError:
        raise SystemExit("Tenant, app, and user IDs must be Microsoft GUIDs.") from None
    if not re.fullmatch(r"[a-f0-9]{32}:[a-f0-9]{128}", config["password"]):
        raise SystemExit("Generate TRACKER_PASSWORD_HASH using python server.py password.")
    for key in ("master", "daily"):
        link = urlsplit(config[key])
        if link.scheme != "https" or not link.hostname or not link.hostname.endswith(".sharepoint.com") or link.username:
            raise SystemExit("Use the original HTTPS SharePoint workbook links.")
    return config


class TrackerHandler(BaseHTTPRequestHandler):
    def setup(self):
        super().setup()
        self.connection.settimeout(35)

    def log_message(self, *_args):
        # Callback authorization codes and workbook details never enter access logs.
        pass

    def send(self, code, body=b"", mime="text/plain; charset=utf-8", extra=()):
        self.send_response(code)
        for key, value in (
            ("Content-Type", mime), ("Content-Length", str(len(body))), ("Cache-Control", "no-store"),
            ("Referrer-Policy", "no-referrer"), ("X-Content-Type-Options", "nosniff"),
            ("X-Frame-Options", "DENY"),
            ("Content-Security-Policy", "default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"),
            *extra,
        ):
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)

    def result(self, code, data):
        self.send(code, json.dumps(data).encode(), "application/json; charset=utf-8")

    def redirect(self, location, cookie=None):
        headers = [("Location", location)]
        if cookie is not None:
            secure = "; Secure" if self.server.config["origin"].startswith("https:") else ""
            age = 3600 if cookie else 0
            headers.append(("Set-Cookie", f"{SESSION_COOKIE}={cookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age={age}{secure}"))
        self.send(303, extra=headers)

    def session(self):
        try:
            cookies = SimpleCookie(self.headers.get("Cookie", ""))
            cookie = cookies[SESSION_COOKIE].value
        except (KeyError, ValueError):
            return "", None
        with SESSION_LOCK:
            found = SESSIONS.get(cookie)
            if found and found["expires"] > time.monotonic():
                return cookie, found
            SESSIONS.pop(cookie, None)
        return "", None

    def file(self, name, mime):
        self.send(200, (ROOT / name).read_bytes(), mime)

    def do_GET(self):
        route = urlsplit(self.path)
        cookie, session = self.session()
        config = self.server.config
        path = route.path
        if path == "/":
            self.file("index.html" if session and session.get("token") else "locked.html", "text/html; charset=utf-8")
            return
        if path == "/tracker.css":
            self.file("tracker.css", "text/css; charset=utf-8")
            return
        if path == "/oauth/callback":
            if not session or "verifier" not in session:
                self.send(400, b"Start again from the tracker login.")
                return
            query = parse_qs(route.query)
            with SESSION_LOCK:
                state = session.pop("state", "")
                verifier = session.pop("verifier", "")
            if not verifier or query.get("state") != [state] or not query.get("code"):
                self.send(400, b"Sign-in could not be verified. Return to the tracker and try again.")
                return
            try:
                endpoint = f"https://login.microsoftonline.com/{config['tenant']}/oauth2/v2.0/token"
                token = request(endpoint, data={
                    "client_id": config["client"], "client_secret": config["secret"], "grant_type": "authorization_code",
                    "code": query["code"][0], "code_verifier": verifier, "redirect_uri": config["origin"] + "/oauth/callback",
                    "scope": SCOPES,
                }, form=True)
                access = token["access_token"]
                profile = graph("/me?$select=id", access)
                if profile.get("id", "").lower() != config["user"]:
                    self.send(403, b"This Microsoft account is not authorized for the tracker.")
                    return
                new = secrets.token_urlsafe(32)
                with SESSION_LOCK:
                    SESSIONS.pop(cookie, None)
                    SESSIONS[new] = {"token": access, "expires": time.monotonic() + min(3600, int(token.get("expires_in", 3600)))}
                self.redirect("/", new)
            except (ServiceError, KeyError, ValueError, TypeError):
                self.send(502, b"Microsoft sign-in failed. Return to the tracker and try again.")
            return

        if path not in {"/tracker.js", "/api/equipment", "/api/activities"}:
            self.send(404, b"Not found.")
            return
        if not session or "token" not in session:
            self.result(401, {"error": "Sign in to access this tracker."})
            return
        if path == "/tracker.js":
            self.file("tracker.js", "text/javascript; charset=utf-8")
            return
        try:
            if path == "/api/equipment":
                output = equipment(config, session["token"])
            else:
                unit = parse_qs(route.query).get("unit", [""])[0]
                if unit not in UNITS:
                    raise ServiceError("Choose a valid unit.", 400)
                output = activity_data(config, session["token"], unit)
            self.result(200, output)
        except ServiceError as exc:
            self.result(exc.code, {"error": str(exc)})

    def do_POST(self):
        config = self.server.config
        cookie, session = self.session()
        path = urlsplit(self.path).path
        if self.headers.get("Origin") != config["origin"]:
            self.result(403, {"error": "Invalid request origin."})
            return
        if path == "/logout":
            with SESSION_LOCK:
                SESSIONS.pop(cookie, None)
            self.redirect("/", "")
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 12000:
                raise ValueError
            raw = self.rfile.read(length).decode()
        except (ValueError, OSError):
            self.result(400, {"error": "Invalid request body."})
            return

        if path == "/unlock":
            candidate = parse_qs(raw).get("password", [""])[0]
            salt, expected = config["password"].split(":")
            now = time.monotonic()
            with SESSION_LOCK:
                while PASSWORD_ATTEMPTS and PASSWORD_ATTEMPTS[0] < now - 300:
                    PASSWORD_ATTEMPTS.popleft()
                if len(PASSWORD_ATTEMPTS) >= 12:
                    self.send(429, b"Too many sign-in attempts. Try again in a few minutes.")
                    return
                PASSWORD_ATTEMPTS.append(now)
            if not candidate or len(candidate) > 256 or not secrets.compare_digest(hash_password(candidate, salt), expected):
                self.send(401, b"Incorrect password. Return to the tracker and try again.")
                return
            new = secrets.token_urlsafe(32)
            verifier, state = secrets.token_urlsafe(48), secrets.token_urlsafe(24)
            challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip("=")
            with SESSION_LOCK:
                for expired in [sid for sid, item in SESSIONS.items() if item["expires"] <= now]:
                    SESSIONS.pop(expired)
                SESSIONS.pop(cookie, None)
                SESSIONS[new] = {"state": state, "verifier": verifier, "expires": now + 600}
            parameters = urlencode({
                "client_id": config["client"], "response_type": "code", "response_mode": "query",
                "redirect_uri": config["origin"] + "/oauth/callback", "scope": SCOPES,
                "state": state, "code_challenge": challenge, "code_challenge_method": "S256",
            })
            self.redirect(f"https://login.microsoftonline.com/{config['tenant']}/oauth2/v2.0/authorize?{parameters}", new)
            return
        if path != "/api/activities":
            self.result(404, {"error": "Not found."})
            return
        if not session or "token" not in session:
            self.result(401, {"error": "Sign in to access this tracker."})
            return
        try:
            result = save_activity(config, session["token"], json.loads(raw))
            self.result(200, result)
        except json.JSONDecodeError:
            self.result(400, {"error": "Invalid activity."})
        except ServiceError as exc:
            self.result(exc.code, {"error": str(exc)})


def main():
    if sys.argv[1:] == ["password"]:
        password = getpass("Choose a tracker password (at least 14 characters): ")
        if len(password) < 14 or password != getpass("Repeat the password: "):
            raise SystemExit("Use a matching password of at least 14 characters.")
        salt = secrets.token_hex(16)
        print(f"{salt}:{hash_password(password, salt)}")
        return
    config = configure()
    port = int(os.environ.get("TRACKER_PORT", "8768"))
    # Serve behind an approved TLS reverse proxy for shared access.
    with ThreadingHTTPServer(("127.0.0.1", port), TrackerHandler) as server:
        server.config = config
        print(f"Private tracker listening on loopback port {port}.", flush=True)
        server.serve_forever()


if __name__ == "__main__":
    main()
