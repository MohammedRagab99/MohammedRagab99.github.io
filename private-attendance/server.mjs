import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer, ServerResponse } from 'node:http';

const username = 'attendance';
const digest = (password) => createHash('sha256').update(password).digest();

if (process.argv[2] === '--generate-password') {
  const password = randomBytes(32).toString('base64url');
  console.log(`Username: ${username}\nPassword: ${password}`);
  console.log(`ATTENDANCE_PASSWORD_SHA256=${digest(password).toString('hex')}`);
  process.exit(0);
}

const passwordHash = process.env.ATTENDANCE_PASSWORD_SHA256 ?? '';
if (!/^[0-9a-f]{64}$/i.test(passwordHash)) {
  console.error('Set ATTENDANCE_PASSWORD_SHA256 from npm run password.');
  process.exit(1);
}
const expected = Buffer.from(passwordHash, 'hex');
const port = Number(process.env.ATTENDANCE_PORT || 3100);
const hostname = '127.0.0.1';
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('ATTENDANCE_PORT must be an integer between 1 and 65535.');
}

function authorized(header) {
  const encoded = /^Basic ([A-Za-z0-9+/]{72})$/i.exec(header ?? '')?.[1];
  if (!encoded) return false;
  const value = Buffer.from(encoded, 'base64').toString('utf8');
  const password = value.startsWith(`${username}:`) ? value.slice(username.length + 1) : '';
  return /^[A-Za-z0-9_-]{43}$/.test(password) && timingSafeEqual(digest(password), expected);
}

class PrivateResponse extends ServerResponse {
  writeHead(status, ...args) {
    const headers = args.find((arg) => arg && typeof arg === 'object');
    if (headers) {
      for (const name of Object.keys(headers)) {
        if (/^(cache-control|x-robots-tag)$/i.test(name)) delete headers[name];
      }
    }
    this.setHeader('Cache-Control', 'private, no-store');
    this.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return super.writeHead(status, ...args);
  }
}

const { default: next } = await import('next');
const app = next({ dev: false, hostname, port });
await app.prepare();
const handle = app.getRequestHandler();

createServer({ ServerResponse: PrivateResponse }, async (request, response) => {
  if (!authorized(request.headers.authorization)) {
    response.writeHead(401, {
      'WWW-Authenticate': 'Basic realm="RagabVerse Attendance", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
    });
    response.end('Private Attendance requires a username and password.');
    return;
  }
  delete request.headers.authorization;
  try {
    await handle(request, response);
  } catch {
    if (response.headersSent) {
      response.destroy();
      return;
    }
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Attendance is temporarily unavailable.');
  }
}).listen(port, hostname, () => {
  console.log(`Private Attendance listening on http://${hostname}:${port}/`);
});
