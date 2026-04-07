function createShmirahSheet() {
  var ui = SpreadsheetApp.getUi();

  // ── Prompts ───────────────────────────────────────────────────────────────
  var meitName     = ui.prompt("Shmirah Scheduler", "Name of Meit/Meitah (first & last):", ui.ButtonSet.OK).getResponseText();
  var genderResp   = ui.prompt("Shmirah Scheduler", "Gender: type M for Meit or F for Meitah:", ui.ButtonSet.OK).getResponseText().toUpperCase();
  var titleWord    = genderResp === "F" ? "Meitah" : "Meit";
  var hebrewName   = ui.prompt("Shmirah Scheduler", "Hebrew name (optional — press OK to skip):", ui.ButtonSet.OK).getResponseText();
  var scheduler    = ui.prompt("Shmirah Scheduler", "Scheduler name & phone number:", ui.ButtonSet.OK).getResponseText();
  var funeralHome  = ui.prompt("Shmirah Scheduler", "Funeral home name:", ui.ButtonSet.OK).getResponseText();
  var fhAddress    = ui.prompt("Shmirah Scheduler", "Funeral home address:", ui.ButtonSet.OK).getResponseText();
  var fhPhone      = ui.prompt("Shmirah Scheduler", "Funeral home phone number:", ui.ButtonSet.OK).getResponseText();
  var fhDirections = ui.prompt("Shmirah Scheduler", "Brief directions (optional — press OK to skip):", ui.ButtonSet.OK).getResponseText();
  var startDateStr = ui.prompt("Shmirah Scheduler", "Date Shmirah begins (e.g. April 11, 2025):", ui.ButtonSet.OK).getResponseText();
  var startTime    = ui.prompt("Shmirah Scheduler", "Time Shmirah begins — when Taharah ends (e.g. 3:00 PM):", ui.ButtonSet.OK).getResponseText().trim();
  var endDateStr   = ui.prompt("Shmirah Scheduler", "Date of funeral (e.g. April 13, 2025):", ui.ButtonSet.OK).getResponseText();
  var endTime      = ui.prompt("Shmirah Scheduler", "Time of funeral — when Shmirah ends (e.g. 11:00 AM):", ui.ButtonSet.OK).getResponseText().trim();

  // ── Date & time helpers ──────────────────────────────────────────────────
  var MONTH_NAMES = ["January","February","March","April","May","June",
                     "July","August","September","October","November","December"];
  var DAY_NAMES   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  function parseDate(str) {
    // Accepts "April 11, 2025" or "April 11 2025"
    var m = str.match(/([A-Za-z]+)\s+(\d+),?\s+(\d{4})/);
    if (!m) return null;
    var month = MONTH_NAMES.indexOf(m[1]);
    if (month < 0) {
      // Try abbreviated
      for (var i = 0; i < MONTH_NAMES.length; i++) {
        if (MONTH_NAMES[i].toLowerCase().indexOf(m[1].toLowerCase()) === 0) { month = i; break; }
      }
    }
    return new Date(parseInt(m[3]), month, parseInt(m[2]));
  }

  function formatDate(date) {
    // Returns "Friday, April 11"
    return DAY_NAMES[date.getDay()] + ", " + MONTH_NAMES[date.getMonth()] + " " + date.getDate();
  }

  function parseTime(timeStr) {
    // Returns minutes from midnight
    var m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!m) return 0;
    var h = parseInt(m[1]);
    var min = parseInt(m[2]);
    var ampm = m[3].toUpperCase();
    if (ampm === "AM" && h === 12) h = 0;
    if (ampm === "PM" && h !== 12) h += 12;
    return h * 60 + min;
  }

  function formatTime(mins) {
    // mins may be >= 1440 if crossing midnight — normalise
    mins = ((mins % 1440) + 1440) % 1440;
    var h = Math.floor(mins / 60);
    var min = mins % 60;
    var ampm = h >= 12 ? "PM" : "AM";
    var displayH = h % 12;
    if (displayH === 0) displayH = 12;
    var displayMin = min < 10 ? "0" + min : "" + min;
    return displayH + ":" + displayMin + " " + ampm;
  }

  function addDays(date, n) {
    var d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  }

  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth()    === b.getMonth()    &&
           a.getDate()     === b.getDate();
  }

  // ── Build shift list ─────────────────────────────────────────────────────
  var startDate = parseDate(startDateStr);
  var endDate   = parseDate(endDateStr);
  var startMins = parseTime(startTime);
  var endMins   = parseTime(endTime);

  var shifts = [];
  var curDate = new Date(startDate);
  var curMins = startMins;

  for (var safety = 0; safety < 100; safety++) {
    // Are we past the funeral?
    if (curDate > endDate) break;
    if (sameDay(curDate, endDate) && curMins >= endMins) break;

    var nextMins = curMins + 120;
    var nextDate = new Date(curDate);
    if (nextMins >= 1440) {
      nextMins -= 1440;
      nextDate = addDays(curDate, 1);
    }

    // Would next shift end go past funeral?
    var isLast = false;
    if (nextDate > endDate) {
      isLast = true;
    } else if (sameDay(nextDate, endDate) && nextMins > endMins) {
      isLast = true;
    }

    var shiftLabel;
    if (isLast) {
      shiftLabel = formatTime(curMins) + " \u2013 " + endTime + " (funeral)";
    } else {
      shiftLabel = formatTime(curMins) + " \u2013 " + formatTime(nextMins);
    }

    var isOvernight = (curMins >= 0 && curMins < 360); // midnight to 6am

    shifts.push({
      date:        new Date(curDate),
      dateLabel:   formatDate(curDate),
      shiftLabel:  shiftLabel,
      isOvernight: isOvernight,
      isLast:      isLast
    });

    if (isLast) break;

    curDate = nextDate;
    curMins = nextMins;
  }

  // ── Create spreadsheet ───────────────────────────────────────────────────
  var sheetTitle = "Shmirah \u2014 " + meitName + " \u2014 " + formatDate(startDate);
  var ss = SpreadsheetApp.create(sheetTitle);
  var ssId = ss.getId();

  // ── Helper functions ─────────────────────────────────────────────────────
  function navyGoldHeader(sheet, row, text) {
    sheet.setRowHeight(row, 26);
    var r = sheet.getRange(row, 2, 1, 2);
    r.merge();
    r.setValue("  " + text);
    r.setBackground("#1B3A6B");
    r.setFontColor("#FFFFFF");
    r.setFontSize(12);
    r.setFontWeight("bold");
    r.setFontFamily("Arial");
    r.setVerticalAlignment("middle");
  }

  function detailRow(sheet, row, label, detail) {
    sheet.setRowHeight(row, 52);
    var lc = sheet.getRange(row, 2);
    lc.setValue("  \u2022 " + label);
    lc.setBackground("#F5E9C8");
    lc.setFontColor("#1B3A6B");
    lc.setFontSize(10);
    lc.setFontWeight("bold");
    lc.setFontFamily("Arial");
    lc.setWrap(true);
    lc.setVerticalAlignment("middle");
    var dc = sheet.getRange(row, 3);
    dc.setValue(detail);
    dc.setBackground("#FAFAF5");
    dc.setFontSize(10);
    dc.setFontFamily("Arial");
    dc.setWrap(true);
    dc.setVerticalAlignment("middle");
  }

  function fullRow(sheet, row, text, height) {
    sheet.setRowHeight(row, height || 72);
    var r = sheet.getRange(row, 2, 1, 2);
    r.merge();
    r.setValue(text);
    r.setBackground("#FAFAF5");
    r.setFontSize(10);
    r.setFontFamily("Arial");
    r.setWrap(true);
    r.setVerticalAlignment("middle");
  }

  // ── INSTRUCTIONS SHEET ───────────────────────────────────────────────────
  var inst = ss.getActiveSheet();
  inst.setName("Instructions");
  inst.setTabColor("#1B3A6B");
  inst.setColumnWidth(1, 20);
  inst.setColumnWidth(2, 200);
  inst.setColumnWidth(3, 520);

  inst.setRowHeight(1, 8);
  inst.setRowHeight(2, 44);
  var titleRange = inst.getRange(2, 2, 1, 2);
  titleRange.merge();
  titleRange.setValue("\u2721  Shmirah \u2014 Keeping Watch  \u2721");
  titleRange.setBackground("#1B3A6B");
  titleRange.setFontColor("#FFFFFF");
  titleRange.setFontSize(18);
  titleRange.setFontWeight("bold");
  titleRange.setFontFamily("Arial");
  titleRange.setHorizontalAlignment("center");
  titleRange.setVerticalAlignment("middle");

  inst.setRowHeight(3, 26);
  var subTitle = inst.getRange(3, 2, 1, 2);
  subTitle.merge();
  subTitle.setValue("Kalamazoo Chevrah Kadisha");
  subTitle.setBackground("#C9A84C");
  subTitle.setFontColor("#FFFFFF");
  subTitle.setFontSize(12);
  subTitle.setFontStyle("italic");
  subTitle.setFontFamily("Arial");
  subTitle.setHorizontalAlignment("center");
  subTitle.setVerticalAlignment("middle");

  inst.setRowHeight(4, 8);

  navyGoldHeader(inst, 5, "What is Shmirah?");
  fullRow(inst, 6,
    'Shmirah (\u05e9\u05de\u05d9\u05e8\u05d4) means "watching" or "guarding." When a member of our community dies, ' +
    'we do not leave the body alone from the time of death until burial. A shomer (guardian) ' +
    'sits with the Meit/Meitah in a spirit of respect, prayer, and companionship for the soul. ' +
    'This is one of the greatest mitzvot \u2014 a true chesed shel emet, an act of loving-kindness ' +
    'that can never be repaid.', 90);

  inst.setRowHeight(7, 8);

  navyGoldHeader(inst, 8, "What to Bring");
  detailRow(inst, 9,  "Dress WARM \u2014 layers", "The funeral home is kept cold out of respect for the Meit/Meitah. Wear warm, modest layers. Simple and comfortable.");
  detailRow(inst, 10, "Bring a blanket", "A lap blanket or small throw is strongly recommended, especially for overnight shifts. You will be sitting still for 2 hours.");
  detailRow(inst, 11, "Thermos of hot tea or coffee", "Warm yourself from the inside. A thermos is ideal \u2014 quiet, no need to leave the room. Avoid strong smells.");
  detailRow(inst, 12, "Siddur or Tehillim", "A prayer book or Psalms. You will spend much of your time reading Psalms softly near the Meit/Meitah.");
  detailRow(inst, 13, "Something quiet to read or write", "Study, journaling, or reflection is welcome. Avoid anything loud or distracting.");
  detailRow(inst, 14, "Phone (on silent)", "Keep it silenced. Use quietly for Tehillim or Jewish texts. Notify the scheduler if anything comes up.");

  inst.setRowHeight(15, 8);

  navyGoldHeader(inst, 16, "What To Do");
  detailRow(inst, 17, "Read Tehillim (Psalms)", "Read aloud softly or silently. Traditionally the entire book of Tehillim is read during Shmirah.");
  detailRow(inst, 18, "Remain present", "Stay in or immediately near the room. Do not leave the Meit/Meitah unattended \u2014 that is the core obligation.");
  detailRow(inst, 19, "Maintain a quiet, respectful atmosphere", "Speak softly if you must speak. This is a sacred space. Refrain from loud conversation or laughter.");
  detailRow(inst, 20, "Greet and orient the next shomer", "Briefly show the incoming shomer where everything is. Transition smoothly so there is no gap in coverage.");
  detailRow(inst, 21, "Call the scheduler if you cannot make your shift", "Give as much notice as possible. The scheduler\u2019s number is at the top of the Schedule tab.");
  detailRow(inst, 22, "Do NOT touch or move the Meit/Meitah", "This is the role of the Chevrah Kadisha. Your role is presence and prayer only.");

  inst.setRowHeight(23, 8);

  navyGoldHeader(inst, 24, "Funeral Home Location");
  detailRow(inst, 25, "Funeral Home", funeralHome);
  detailRow(inst, 26, "Address", fhAddress);
  detailRow(inst, 27, "Phone", fhPhone);
  detailRow(inst, 28, "Directions", fhDirections || "See Google Maps");

  inst.setRowHeight(29, 8);

  navyGoldHeader(inst, 30, "How to Sign Up");
  fullRow(inst, 31,
    "Go to the SCHEDULE tab. Find an open shift (shown in green). Type your name and phone " +
    "number in the columns for that row. Your entry is saved instantly \u2014 everyone sees it in " +
    "real time. You can return at any time to check who is serving and whether shifts have " +
    "changed. Empty shifts will be filled by the scheduler via individual calls. " +
    "Thank you for this sacred service.", 90);

  inst.setRowHeight(32, 8);

  var footer = inst.getRange(33, 2, 1, 2);
  footer.merge();
  footer.setValue("\u05d1\u05e8\u05d5\u05da \u05d3\u05d9\u05d9\u05df \u05d4\u05d0\u05de\u05ea \u2014 Blessed is the True Judge");
  footer.setBackground("#F5E9C8");
  footer.setFontColor("#1B3A6B");
  footer.setFontSize(11);
  footer.setFontStyle("italic");
  footer.setFontFamily("Arial");
  footer.setHorizontalAlignment("center");
  footer.setVerticalAlignment("middle");
  inst.setRowHeight(33, 26);

  inst.getRange(5, 2, 29, 2).setBorder(true, true, true, true, true, true, "#CCCCCC", SpreadsheetApp.BorderStyle.SOLID);

  // ── SCHEDULE SHEET ───────────────────────────────────────────────────────
  var sched = ss.insertSheet("Schedule", 1);
  sched.setTabColor("#C9A84C");
  sched.setColumnWidth(1, 20);
  sched.setColumnWidth(2, 155);  // date
  sched.setColumnWidth(3, 185);  // shift time
  sched.setColumnWidth(4, 180);  // vol 1 name
  sched.setColumnWidth(5, 130);  // vol 1 phone
  sched.setColumnWidth(6, 180);  // vol 2 name
  sched.setColumnWidth(7, 130);  // vol 2 phone
  sched.setColumnWidth(8, 220);  // notes
  sched.setFrozenRows(8);

  sched.setRowHeight(1, 8);
  sched.setRowHeight(2, 44);
  var schedTitle = sched.getRange(2, 2, 1, 7);
  schedTitle.merge();
  schedTitle.setValue("\u2721  Kalamazoo Chevrah Kadisha \u2014 Shmirah Schedule  \u2721");
  schedTitle.setBackground("#1B3A6B");
  schedTitle.setFontColor("#FFFFFF");
  schedTitle.setFontSize(16);
  schedTitle.setFontWeight("bold");
  schedTitle.setFontFamily("Arial");
  schedTitle.setHorizontalAlignment("center");
  schedTitle.setVerticalAlignment("middle");

  // Meit row
  sched.setRowHeight(3, 26);
  var meitLabel = sched.getRange(3, 2, 1, 2);
  meitLabel.merge();
  meitLabel.setValue(titleWord + " (Deceased):");
  meitLabel.setBackground("#F5E9C8");
  meitLabel.setFontColor("#1B3A6B");
  meitLabel.setFontWeight("bold");
  meitLabel.setFontSize(11);
  meitLabel.setFontFamily("Arial");
  meitLabel.setVerticalAlignment("middle");

  var meitVal = sched.getRange(3, 4, 1, 2);
  meitVal.merge();
  meitVal.setValue(meitName + (hebrewName ? "  (" + hebrewName + ")" : ""));
  meitVal.setBackground("#F5E9C8");
  meitVal.setFontColor("#1B3A6B");
  meitVal.setFontWeight("bold");
  meitVal.setFontSize(11);
  meitVal.setFontFamily("Arial");
  meitVal.setVerticalAlignment("middle");

  var schedVal = sched.getRange(3, 6, 1, 3);
  schedVal.merge();
  schedVal.setValue("Scheduler: " + scheduler);
  schedVal.setBackground("#FAFAF5");
  schedVal.setFontSize(10);
  schedVal.setFontFamily("Arial");
  schedVal.setVerticalAlignment("middle");

  // Shmirah period row
  sched.setRowHeight(4, 26);
  var periodLabel = sched.getRange(4, 2, 1, 2);
  periodLabel.merge();
  periodLabel.setValue("Shmirah Period:");
  periodLabel.setBackground("#F5E9C8");
  periodLabel.setFontColor("#1B3A6B");
  periodLabel.setFontWeight("bold");
  periodLabel.setFontSize(10);
  periodLabel.setFontFamily("Arial");
  periodLabel.setVerticalAlignment("middle");

  var periodVal = sched.getRange(4, 4, 1, 5);
  periodVal.merge();
  periodVal.setValue("Begins: " + formatDate(startDate) + " at " + startTime + "   |   Funeral: " + formatDate(endDate) + " at " + endTime);
  periodVal.setBackground("#FAFAF5");
  periodVal.setFontSize(10);
  periodVal.setFontFamily("Arial");
  periodVal.setVerticalAlignment("middle");

  // Funeral home row
  sched.setRowHeight(5, 26);
  var fhLabel = sched.getRange(5, 2, 1, 2);
  fhLabel.merge();
  fhLabel.setValue("Funeral Home:");
  fhLabel.setBackground("#F5E9C8");
  fhLabel.setFontColor("#1B3A6B");
  fhLabel.setFontWeight("bold");
  fhLabel.setFontSize(10);
  fhLabel.setFontFamily("Arial");
  fhLabel.setVerticalAlignment("middle");

  var fhVal = sched.getRange(5, 4, 1, 5);
  fhVal.merge();
  fhVal.setValue(funeralHome + "  |  " + fhAddress + "  |  " + fhPhone);
  fhVal.setBackground("#FAFAF5");
  fhVal.setFontSize(10);
  fhVal.setFontFamily("Arial");
  fhVal.setVerticalAlignment("middle");

  // Directions row
  sched.setRowHeight(6, 26);
  var dirLabel = sched.getRange(6, 2, 1, 2);
  dirLabel.merge();
  dirLabel.setValue("Directions:");
  dirLabel.setBackground("#F5E9C8");
  dirLabel.setFontColor("#1B3A6B");
  dirLabel.setFontWeight("bold");
  dirLabel.setFontSize(10);
  dirLabel.setFontFamily("Arial");
  dirLabel.setVerticalAlignment("middle");

  var dirVal = sched.getRange(6, 4, 1, 5);
  dirVal.merge();
  dirVal.setValue(fhDirections || "See Google Maps or call funeral home above");
  dirVal.setBackground("#FAFAF5");
  dirVal.setFontSize(10);
  dirVal.setFontStyle("italic");
  dirVal.setFontFamily("Arial");
  dirVal.setVerticalAlignment("middle");

  // Legend
  sched.setRowHeight(7, 28);
  var legendOpen = sched.getRange(7, 2, 1, 2);
  legendOpen.merge();
  legendOpen.setValue("Open \u2014 please sign up!");
  legendOpen.setBackground("#D9EAD3");
  legendOpen.setFontColor("#2D7A2D");
  legendOpen.setFontWeight("bold");
  legendOpen.setFontSize(10);
  legendOpen.setFontFamily("Arial");
  legendOpen.setHorizontalAlignment("center");
  legendOpen.setVerticalAlignment("middle");

  var legendFilled = sched.getRange(7, 4, 1, 2);
  legendFilled.merge();
  legendFilled.setValue("Filled \u2014 thank you!");
  legendFilled.setBackground("#E8F0FE");
  legendFilled.setFontColor("#1A56A0");
  legendFilled.setFontWeight("bold");
  legendFilled.setFontSize(10);
  legendFilled.setFontFamily("Arial");
  legendFilled.setHorizontalAlignment("center");
  legendFilled.setVerticalAlignment("middle");

  var legendNote = sched.getRange(7, 6, 1, 3);
  legendNote.merge();
  legendNote.setValue("Type your name & phone in any green row. Scheduler changes row to blue when confirmed.");
  legendNote.setBackground("#FAFAF5");
  legendNote.setFontSize(10);
  legendNote.setFontStyle("italic");
  legendNote.setFontFamily("Arial");
  legendNote.setVerticalAlignment("middle");

  // Column headers — now 7 data columns (no separate Day column)
  sched.setRowHeight(8, 34);
  var headers = ["Date", "Shift Time", "Volunteer 1 \u2014 Name", "Phone", "Volunteer 2 \u2014 Name", "Phone", "Notes"];
  for (var h = 0; h < headers.length; h++) {
    var hCell = sched.getRange(8, 2 + h);
    hCell.setValue(headers[h]);
    hCell.setBackground("#1B3A6B");
    hCell.setFontColor("#FFFFFF");
    hCell.setFontWeight("bold");
    hCell.setFontSize(10);
    hCell.setFontFamily("Arial");
    hCell.setHorizontalAlignment("center");
    hCell.setVerticalAlignment("middle");
    hCell.setWrap(true);
  }

  // ── Shift rows ───────────────────────────────────────────────────────────
  var lastDateLabel = "";
  for (var i = 0; i < shifts.length; i++) {
    var rowNum = 9 + i;
    sched.setRowHeight(rowNum, 34);
    var shift = shifts[i];

    var note = "";
    if (shift.isOvernight) note = "Overnight \u2014 thank you for this precious mitzvah";
    if (shift.isLast)      note = "Last shift \u2014 ends at funeral";

    // Date cell — show date on first shift of each new day, blank after
    var dateCell = sched.getRange(rowNum, 2);
    if (shift.dateLabel !== lastDateLabel) {
      dateCell.setValue(shift.dateLabel);
      lastDateLabel = shift.dateLabel;
    } else {
      dateCell.setValue("");
    }
    dateCell.setBackground("#F5E9C8");
    dateCell.setFontColor("#1B3A6B");
    dateCell.setFontWeight("bold");
    dateCell.setFontSize(10);
    dateCell.setFontFamily("Arial");
    dateCell.setHorizontalAlignment("left");
    dateCell.setVerticalAlignment("middle");

    // Green background across all volunteer columns
    sched.getRange(rowNum, 3, 1, 5).setBackground("#D9EAD3");

    // Shift time
    var shiftCell = sched.getRange(rowNum, 3);
    shiftCell.setValue(shift.shiftLabel);
    shiftCell.setFontWeight("bold");
    shiftCell.setFontSize(10);
    shiftCell.setFontFamily("Arial");
    shiftCell.setHorizontalAlignment("center");
    shiftCell.setVerticalAlignment("middle");

    // Volunteer cells (blank, ready to fill in)
    for (var c = 4; c <= 7; c++) {
      var vCell = sched.getRange(rowNum, c);
      vCell.setFontSize(10);
      vCell.setFontFamily("Arial");
      vCell.setVerticalAlignment("middle");
    }

    // Notes
    var noteCell = sched.getRange(rowNum, 8);
    noteCell.setValue(note);
    noteCell.setFontSize(9);
    noteCell.setFontStyle("italic");
    noteCell.setFontColor("#1B3A6B");
    noteCell.setFontFamily("Arial");
    noteCell.setVerticalAlignment("middle");
    noteCell.setWrap(true);
  }

  // Borders
  sched.getRange(2, 2, 7 + shifts.length, 7).setBorder(
    true, true, true, true, true, true,
    "#CCCCCC", SpreadsheetApp.BorderStyle.SOLID
  );

  // ── Share & finish ───────────────────────────────────────────────────────
  DriveApp.getFileById(ssId).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);

  var url = "https://docs.google.com/spreadsheets/d/" + ssId + "/edit";
  Logger.log("Done! URL: " + url);

  var resultSheet = ss.insertSheet("--- SHARE THIS LINK ---");
  resultSheet.getRange(1, 1).setValue("Share this link with the group:");
  resultSheet.getRange(1, 1).setFontWeight("bold");
  resultSheet.getRange(1, 1).setFontSize(12);
  resultSheet.getRange(1, 1).setFontFamily("Arial");
  resultSheet.getRange(2, 1).setValue(url);
  resultSheet.getRange(2, 1).setFontSize(12);
  resultSheet.getRange(2, 1).setFontColor("#1B3A6B");
  resultSheet.getRange(2, 1).setFontWeight("bold");
  resultSheet.getRange(2, 1).setFontFamily("Arial");
  resultSheet.setColumnWidth(1, 700);
  resultSheet.setRowHeight(2, 30);
  resultSheet.getRange(4, 1).setValue("Shmirah begins: " + formatDate(startDate) + " at " + startTime);
  resultSheet.getRange(5, 1).setValue("Funeral: " + formatDate(endDate) + " at " + endTime);
  resultSheet.getRange(4, 1).setFontFamily("Arial");
  resultSheet.getRange(5, 1).setFontFamily("Arial");

  ss.setActiveSheet(resultSheet);
}
