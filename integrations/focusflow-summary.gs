// Use a separate Apps Script project. Set FOCUSFLOW_SHEET_ID and FOCUSFLOW_SYNC_KEY in Script Properties.
const FOCUSFLOW_TAB = "FocusFlow Summary";
const FOCUSFLOW_HEADERS = ["Date (UTC)", "Open tasks", "Completed tasks", "Focus minutes", "Updated (UTC)"];

function doPost(e) {
  const properties = PropertiesService.getScriptProperties();
  const expectedKey = properties.getProperty("FOCUSFLOW_SYNC_KEY");
  const sheetId = properties.getProperty("FOCUSFLOW_SHEET_ID");
  const contents = e && e.postData && e.postData.contents;
  let request;
  try {
    request = contents && contents.length < 4096 ? JSON.parse(contents) : null;
  } catch {
    return focusFlowReceipt({ status: "error" });
  }
  if (!sheetId || !expectedKey || expectedKey.length < 32 || !request || request.syncKey !== expectedKey) {
    return focusFlowReceipt({ status: "error" });
  }

  const summary = request.summary;
  if (!summary || typeof summary.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(summary.date)
      || !["open", "completed", "focusMinutes"].every(key => Number.isSafeInteger(summary[key]) && summary[key] >= 0)) {
    return focusFlowReceipt({ status: "error" });
  }
  const parsedDate = new Date(`${summary.date}T00:00:00Z`);
  if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== summary.date) {
    return focusFlowReceipt({ status: "error" });
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return focusFlowReceipt({ status: "error" });
  try {
    const book = SpreadsheetApp.openById(sheetId);
    const tab = book.getSheetByName(FOCUSFLOW_TAB) || book.insertSheet(FOCUSFLOW_TAB);
    let rowCount = tab.getLastRow();
    if (!rowCount) {
      tab.getRange(1, 1, 1, FOCUSFLOW_HEADERS.length).setValues([FOCUSFLOW_HEADERS]);
      rowCount = 1;
    } else {
      const actual = tab.getRange(1, 1, 1, FOCUSFLOW_HEADERS.length).getDisplayValues()[0];
      if (actual.some((value, column) => value !== FOCUSFLOW_HEADERS[column])) {
        return focusFlowReceipt({ status: "error" });
      }
    }

    const match = rowCount > 1
      ? tab.getRange(2, 1, rowCount - 1, 1).createTextFinder(summary.date).matchEntireCell(true).findNext()
      : null;
    const row = match ? match.getRow() : rowCount + 1;
    tab.getRange(row, 1).setNumberFormat("@");
    tab.getRange(row, 1, 1, FOCUSFLOW_HEADERS.length).setValues([[
      summary.date, summary.open, summary.completed, summary.focusMinutes, new Date().toISOString()
    ]]);
    SpreadsheetApp.flush();
    return focusFlowReceipt({ status: "ok", date: summary.date });
  } catch {
    return focusFlowReceipt({ status: "error" });
  } finally {
    lock.releaseLock();
  }
}

function focusFlowReceipt(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
