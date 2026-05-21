// 修改這裡填入你的 Sheets ID
var SHEET_ID = '1Ol2HGyu5I3Q6lq9VvIEoAiq-swgohYfX-f2uA91PiwY';

var RECORD_SHEET = '答題紀錄';
var STUDENT_SHEET = '學生名單';

// 答題紀錄欄位標題（共 8 + 25*4 = 108 欄）
function getRecordHeaders() {
  var headers = ['時間戳', '姓名', '班級', '年級', '出題模式', '出題條件', '題數', '得分'];
  for (var i = 1; i <= 25; i++) {
    headers.push('Q' + i + '_year', 'Q' + i + '_qno', 'Q' + i + '_indicator', 'Q' + i + '_correct');
  }
  return headers;
}

function setupSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(RECORD_SHEET);
  if (!sheet) sheet = ss.insertSheet(RECORD_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(getRecordHeaders());
    sheet.setFrozenRows(1);
  }
  Logger.log('Setup complete');
}

function doGet(e) {
  var action = e.parameter.action || '';
  var result;

  if (action === 'students') {
    result = getStudents(e.parameter.class || '');
  } else if (action === 'myrecord') {
    result = getMyRecord(e.parameter.class || '', e.parameter.name || '');
  } else if (action === 'dashboard') {
    result = getDashboard(e.parameter.class || '');
  } else {
    result = { error: 'unknown action' };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    writeRecord(data);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getStudents(className) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(STUDENT_SHEET);
  if (!sheet) return { students: [] };
  var rows = sheet.getDataRange().getValues();
  var students = [];
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(className)) {
      students.push({ name: rows[i][1], id: rows[i][2] });
    }
  }
  return { students: students };
}

function writeRecord(data) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(RECORD_SHEET);
  if (!sheet) { setupSheet(); sheet = ss.getSheetByName(RECORD_SHEET); }

  var row = [
    data.timestamp || new Date().toISOString(),
    data.name || '',
    data.class || '',
    data.grade || '',
    data.mode || '',
    data.condition || '',
    data.total || 0,
    data.score || 0
  ];

  var answers = data.answers || [];
  if (answers.length > 25) {
    throw new Error('answers length exceeds 25: ' + answers.length);
  }
  for (var i = 0; i < 25; i++) {
    if (i < answers.length) {
      var a = answers[i];
      row.push(a.year || '', a.q_no || '', a.indicator || '', a.is_correct ? 1 : 0);
    } else {
      row.push('', '', '', '');
    }
  }
  sheet.appendRow(row);
}

function getMyRecord(className, name) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(RECORD_SHEET);
  if (!sheet) return { history: [], indicatorStats: [], wrongQuestions: [] };

  var rows = sheet.getDataRange().getValues();
  var history = [];
  var indMap = {};   // indicator -> {total, correct}
  var wrongMap = {}; // year_qno -> {year, q_no, indicator, count}

  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (String(r[2]) !== String(className) || String(r[1]) !== name) continue;

    history.push({
      timestamp: r[0], mode: r[4], condition: r[5],
      total: r[6], score: r[7]
    });

    // parse Q1..Q25
    for (var q = 0; q < 25; q++) {
      var base = 8 + q * 4;
      var indicator = String(r[base + 2] || '');
      var correct = Number(r[base + 3]);
      if (!indicator) continue;
      if (!indMap[indicator]) indMap[indicator] = { total: 0, correct: 0 };
      indMap[indicator].total++;
      indMap[indicator].correct += correct;

      if (!correct && r[base] && r[base + 1]) {
        var key = r[base] + '_' + r[base + 1];
        if (!wrongMap[key]) wrongMap[key] = { year: r[base], q_no: r[base + 1], indicator: indicator, count: 0 };
        wrongMap[key].count++;
      }
    }
  }

  var indicatorStats = Object.entries(indMap).map(function(kv) {
    return { indicator: kv[0], total: kv[1].total, correct: kv[1].correct };
  }).sort(function(a, b) {
    var ra = a.total ? a.correct / a.total : 0;
    var rb = b.total ? b.correct / b.total : 0;
    return ra - rb;
  });

  var wrongQuestions = Object.values(wrongMap).sort(function(a, b) { return b.count - a.count; });

  return { history: history, indicatorStats: indicatorStats, wrongQuestions: wrongQuestions };
}

function getDashboard(className) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(RECORD_SHEET);
  if (!sheet) return { indicatorHeatmap: [], studentMatrix: [], hardestQuestions: [] };

  var rows = sheet.getDataRange().getValues();
  var indMap = {};       // indicator -> {total, correct}
  var studentIndMap = {}; // name -> indicator -> {total, correct}
  var qMap = {};         // year_qno -> {year, q_no, indicator, total, correct}

  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (String(r[2]) !== String(className)) continue;
    var studentName = String(r[1]);
    if (!studentIndMap[studentName]) studentIndMap[studentName] = {};

    for (var q = 0; q < 25; q++) {
      var base = 8 + q * 4;
      var year = r[base]; var qno = r[base + 1];
      var indicator = String(r[base + 2] || '');
      var correct = Number(r[base + 3]);
      if (!indicator) continue;

      if (!indMap[indicator]) indMap[indicator] = { total: 0, correct: 0 };
      indMap[indicator].total++; indMap[indicator].correct += correct;

      if (!studentIndMap[studentName][indicator])
        studentIndMap[studentName][indicator] = { total: 0, correct: 0 };
      studentIndMap[studentName][indicator].total++;
      studentIndMap[studentName][indicator].correct += correct;

      var key = year + '_' + qno;
      if (!qMap[key]) qMap[key] = { year: year, q_no: qno, indicator: indicator, total: 0, correct: 0 };
      qMap[key].total++; qMap[key].correct += correct;
    }
  }

  var indicatorHeatmap = Object.entries(indMap).map(function(kv) {
    return { indicator: kv[0], rate: kv[1].total ? kv[1].correct / kv[1].total : null };
  }).sort(function(a, b) { return a.rate - b.rate; });

  var allIndicators = indicatorHeatmap.map(function(x) { return x.indicator; });
  var studentMatrix = Object.entries(studentIndMap).map(function(kv) {
    var studentName = kv[0];
    var indData = kv[1];
    var row = { name: studentName };
    allIndicators.forEach(function(ind) {
      var d = indData[ind];
      row[ind] = d ? (d.total ? d.correct / d.total : null) : null;
    });
    return row;
  });

  var hardestQuestions = Object.values(qMap)
    .filter(function(q) { return q.total >= 3; })
    .sort(function(a, b) { return a.correct / a.total - b.correct / b.total; })
    .slice(0, 10)
    .map(function(q) {
      return { year: q.year, q_no: q.q_no, indicator: q.indicator,
               rate: q.total ? q.correct / q.total : null, total: q.total };
    });

  return {
    indicatorHeatmap: indicatorHeatmap,
    studentMatrix: studentMatrix,
    hardestQuestions: hardestQuestions,
    allIndicators: allIndicators
  };
}
