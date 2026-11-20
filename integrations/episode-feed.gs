// Deploy as a Google Apps Script web app. Set EPISODE_SHEET_ID in Script Properties.
function doGet() {
  const sheetId = PropertiesService.getScriptProperties().getProperty("EPISODE_SHEET_ID");
  const sheet = sheetId && SpreadsheetApp.openById(sheetId).getSheetByName("Public Episodes");
  const episodes = [];

  if (sheet && sheet.getLastRow() > 1) {
    const timeZone = sheet.getParent().getSpreadsheetTimeZone();
    const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
    for (const [number, rawStatus, rawDate, rawVideo] of rows) {
      const ep = Number(number);
      const status = String(rawStatus).trim().toLowerCase();
      if (!Number.isInteger(ep) || ep < 1 || !["planned", "filming", "published"].includes(status)) continue;

      const date = rawDate instanceof Date
        ? Utilities.formatDate(rawDate, timeZone, "yyyy-MM-dd")
        : String(rawDate).trim();
      const video = String(rawVideo).trim();
      episodes.push({
        ep,
        status,
        date: status === "published" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
        youtubeId: status === "published" && /^[\w-]{11}$/.test(video) ? video : ""
      });
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ episodes })).setMimeType(ContentService.MimeType.JSON);
}
