// 2d0: Might be as well moved to a spreadsheet.
function glueCampaignName(country, placement) {
  // Example of a name: RMKT-G1Retail-UK-TTT
  return ("RMKT-" + placement + "-" + country + "-TTT").toLowerCase();
}

// 2d0: Check what exactly happens when sheet does not exist.
function sheetConnector(SPREADSHEET_URL, sheet_control_name) {
  Logger.log("Opening the sheet...");
  // var sheet = spreadsheet.getActiveSheet();
  var spreadsheet = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
  var sheet = spreadsheet.getActiveSheet()
  Logger.log(sheet.getName());
  if (sheet.getName() == sheet_control_name)
    return sheet;
  else
    return false;
}
