// 答題紀錄試算表
var SHEET_ID = '1Ol2HGyu5I3Q6lq9VvIEoAiq-swgohYfX-f2uA91PiwY';

// 題庫試算表（單一維護來源）
var QUESTION_SHEET_ID = '1tKUNfT2mBUTG-RdwGN6Tbn5BHFSb50AU-N5rklyfPoY';

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

  if (action === 'questions') {
    result = getQuestions(e.parameter.grade || '', e.parameter.year || '');
  } else if (action === 'students') {
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

function getQuestions(gradeFilter, yearFilter) {
  var ss = SpreadsheetApp.openById(QUESTION_SHEET_ID);
  var ws = ss.getSheets()[0];
  var rows = ws.getDataRange().getValues();
  var header = rows[0];

  var colIdx = {};
  header.forEach(function(h, i) { colIdx[h] = i; });

  var questions = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    var grade = String(r[colIdx['grade']] || '');
    var year = String(r[colIdx['year']] || '');

    if (gradeFilter && grade !== String(gradeFilter)) continue;
    if (yearFilter && year !== String(yearFilter)) continue;

    // 解析選項
    var options = {};
    ['option1','option2','option3','option4'].forEach(function(col, idx) {
      var val = r[colIdx[col]];
      if (val !== '' && val !== null && val !== undefined) {
        options[String(idx + 1)] = String(val);
      }
    });

    // 解析答案：支援 "1或2" -> [1,2] 或單一數字
    var answerRaw = String(r[colIdx['answer']] || '');
    var answer;
    if (answerRaw.indexOf('或') !== -1) {
      answer = answerRaw.split('或').map(function(x) { return parseInt(x.trim(), 10); });
    } else {
      answer = parseInt(answerRaw, 10);
    }

    // 解析 indicators：可能是 JSON 陣列字串或逗號分隔純文字
    var indRaw = String(r[colIdx['indicators']] || '');
    var indicators = [];
    if (indRaw) {
      if (indRaw.charAt(0) === '[') {
        try { indicators = JSON.parse(indRaw); } catch(e) { indicators = [indRaw]; }
      } else {
        indicators = indRaw.split(',').map(function(x) { return x.trim(); }).filter(function(x) { return x; });
      }
    }

    var hasImage = r[colIdx['has_image']];
    hasImage = (hasImage === true || hasImage === 'TRUE' || hasImage === 'true' || hasImage === 1 || hasImage === '1');

    var domainRaw = colIdx['assessment_domain'] !== undefined ? String(r[colIdx['assessment_domain']] || '') : '';
    var typeRaw   = colIdx['assessment_type']   !== undefined ? String(r[colIdx['assessment_type']]   || '') : '';

    questions.push({
      year: parseInt(year, 10),
      grade: parseInt(grade, 10),
      q_no: parseInt(r[colIdx['q_no']], 10),
      stem: String(r[colIdx['stem']] || ''),
      options: options,
      answer: answer,
      indicators: indicators,
      indicator_unit: String(r[colIdx['indicator_unit']] || ''),
      has_image: hasImage,
      image_url: String(r[colIdx['image_url']] || ''),
      assessment_domain: domainRaw || null,
      assessment_type: typeRaw || null
    });
  }

  return { questions: questions, total: questions.length };
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
  if (!sheet) return { indicatorHeatmap: [], studentMatrix: [], hardestQuestions: [], domainBreakdown: [], typeBreakdown: [] };

  // Build question lookup: "year_qno" -> {domain, type}
  var qss = SpreadsheetApp.openById(QUESTION_SHEET_ID);
  var qws = qss.getSheets()[0];
  var qrows = qws.getDataRange().getValues();
  var qheader = qrows[0];
  var qcol = {};
  qheader.forEach(function(h, i) { qcol[h] = i; });
  var qLookup = {};
  for (var qi = 1; qi < qrows.length; qi++) {
    var qr = qrows[qi];
    var qyear = String(qr[qcol['year']] || '');
    var qqno  = String(qr[qcol['q_no']] || '');
    var domain = (qcol['assessment_domain'] !== undefined) ? (String(qr[qcol['assessment_domain']] || '') || null) : null;
    var atype  = (qcol['assessment_type']   !== undefined) ? (String(qr[qcol['assessment_type']]   || '') || null) : null;
    if (qyear && qqno) qLookup[qyear + '_' + qqno] = { domain: domain, type: atype };
  }

  var rows = sheet.getDataRange().getValues();
  var indMap = {};        // indicator -> {total, correct}
  var domainMap = {};     // domain -> {total, correct}
  var typeMap = {};       // type -> {total, correct}
  var studentIndMap = {}; // name -> indicator -> {total, correct}
  var qMap = {};          // year_qno -> {year, q_no, indicator, total, correct}

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

      var qInfo = qLookup[String(year) + '_' + String(qno)] || {};
      if (qInfo.domain) {
        if (!domainMap[qInfo.domain]) domainMap[qInfo.domain] = { total: 0, correct: 0 };
        domainMap[qInfo.domain].total++; domainMap[qInfo.domain].correct += correct;
      }
      if (qInfo.type) {
        if (!typeMap[qInfo.type]) typeMap[qInfo.type] = { total: 0, correct: 0 };
        typeMap[qInfo.type].total++; typeMap[qInfo.type].correct += correct;
      }
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

  var domainOrder = ['數與計算','量與實測','幾何','空間與形狀','代數','關係','統計與機率','統計'];
  var domainBreakdown = Object.entries(domainMap).map(function(kv) {
    return { domain: kv[0], total: kv[1].total, correct: kv[1].correct,
             rate: kv[1].total ? kv[1].correct / kv[1].total : null };
  }).sort(function(a, b) {
    var ia = domainOrder.indexOf(a.domain), ib = domainOrder.indexOf(b.domain);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

  var typeOrder = ['概念理解','程序執行','解題思考'];
  var typeBreakdown = Object.entries(typeMap).map(function(kv) {
    return { type: kv[0], total: kv[1].total, correct: kv[1].correct,
             rate: kv[1].total ? kv[1].correct / kv[1].total : null };
  }).sort(function(a, b) {
    return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
  });

  return {
    indicatorHeatmap: indicatorHeatmap,
    studentMatrix: studentMatrix,
    hardestQuestions: hardestQuestions,
    allIndicators: allIndicators,
    domainBreakdown: domainBreakdown,
    typeBreakdown: typeBreakdown
  };
}
