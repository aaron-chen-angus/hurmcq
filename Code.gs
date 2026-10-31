/**
 * HUR SmartTouch Technology Health Coaching Certification Assessment
 * Google Apps Script backend  (deploy as a Web App)
 *
 *  - Holds the question bank AND the answer key (the key never reaches the browser).
 *  - Student ID is the only key. Past results are looked up in the "Students" sheet.
 *  - Every attempt is logged in the "Results" sheet with each response and its mark.
 *
 * SETUP: see the steps in the chat / README. Run setupSheets() once to authorise.
 */

// ====================== CONFIG ======================
const SPREADSHEET_ID = '153vaUwx0JHADJMWZbkiQVvHYb_awrq5o6b8IMAWkDrY';
const RESULTS_SHEET  = 'Results';    // one row per attempt
const STUDENTS_SHEET = 'Students';   // one row per student ID (summary / state)
const TIME_LIMIT_SEC = 15 * 60;      // 15 minutes, counted from the first question being shown
const GRACE_SEC      = 60;           // network allowance before a submission is flagged as late
const PASS_PERCENT   = 90;           // minimum % to meet the assessment requirement
const TZ             = 'Asia/Singapore';

// ====================== QUESTION BANK ======================
// a = index of the correct option (0 = A, 1 = B, 2 = C, 3 = D)
const BANK = [
  { q: "Which of these modalities should ideally precede resistance training for frail seniors?",
    o: ["Balance training", "Interval running", "Aerobic exercises", "High-intensity workouts"],
    a: 0 }, // Q1 = A
  { q: "What is the recommended frequency for strength training for older adults?",
    o: ["Daily", "Once per week", "2–3 days per week", "4–5 days per week"],
    a: 2 }, // Q2 = C
  { q: "What is a key benefit of resistance training for seniors?",
    o: ["Improves hearing", "Increases metabolism", "Reduces eyesight issues", "Enhances liver function"],
    a: 1 }, // Q3 = B
  { q: "Which principle ensures gradual increases in strength training load?",
    o: ["Balance", "Overload", "Flexibility", "Specificity"],
    a: 1 }, // Q4 = B
  { q: "What initiates a muscle contraction?",
    o: ["ATP", "Glycogen", "Nerve impulse", "Lactic acid"],
    a: 2 }, // Q5 = C
  { q: "Which muscle fibers are primarily lost with aging?",
    o: ["Type I fibers", "Type II fibers", "Both Type I and II equally", "None are lost"],
    a: 1 }, // Q6 = B
  { q: "Which muscle fiber type has high fatigue resistance and slow contraction?",
    o: ["Type I", "Type IIa", "Type IIb", "Type III"],
    a: 0 }, // Q7 = A
  { q: "What type of resistance technology does HUR use?",
    o: ["Weight stack", "Free weights", "Pneumatic", "Springs"],
    a: 2 }, // Q8 = C
  { q: "What muscle group does the HUR Leg Press target?",
    o: ["Hamstrings", "Glutes", "Calves", "Triceps"],
    a: 1 }, // Q9 = B
  { q: "Which HUR machine primarily strengthens the chest muscles?",
    o: ["Leg Extension", "Abduction", "Seated Chest Press", "Low Back"],
    a: 2 }, // Q10 = C
  { q: "Which machine is used to target the back and shoulders?",
    o: ["Abduction", "Pull Down / Push Up", "Leg Curl", "Leg Press"],
    a: 1 }, // Q11 = B
  { q: "The HUR Leg Curl machine targets which muscle group?",
    o: ["Glutes", "Quadriceps", "Hamstrings", "Biceps"],
    a: 2 }, // Q12 = C
  { q: "What is the main muscle group targeted by the HUR Abduction machine?",
    o: ["Glutes", "Quadriceps", "Biceps", "Pectorals"],
    a: 0 }, // Q13 = A
  { q: "Which muscle group does the HUR Back Extension primarily target?",
    o: ["Biceps", "Lower Back", "Abdominals", "Chest"],
    a: 1 }, // Q14 = B
  { q: "What muscle group is the focus of the HUR Push Up machine?",
    o: ["Abdominals", "Shoulders", "Hamstrings", "Pectorals"],
    a: 1 }, // Q15 = B
  { q: "Which muscle group is primarily targeted by the HUR Leg Extension machine?",
    o: ["Pectorals", "Quadriceps", "Biceps", "Triceps"],
    a: 1 }, // Q16 = B
  { q: "The HUR Lat Pulldown machine primarily works which muscle group?",
    o: ["Hamstrings", "Latissimus Dorsi", "Abdominals", "Gluteals"],
    a: 1 }, // Q17 = B
  { q: "Which muscle group does the HUR Optimal Rhomb machine focus on?",
    o: ["Pectorals", "Biceps", "Back", "Quadriceps"],
    a: 2 }, // Q18 = C
  { q: "The HUR Abdominal Crunch machine primarily targets which muscle group?",
    o: ["Calves", "Abdominals", "Deltoids", "Trapezius"],
    a: 1 }, // Q19 = B
  { q: "What percentage of 1RM is typically used for muscular strength training?",
    o: ["30-40%", "40-50%", "60-70%", "80-90%"],
    a: 3 }, // Q20 = D
  { q: "For muscular endurance training, what percentage of 1RM is usually recommended?",
    o: ["30-40%", "50-60%", "70-80%", "90-100%"],
    a: 1 }, // Q21 = B
  { q: "Before using any HUR resistance machine, what should be done first to ensure safety?",
    o: ["Start lifting immediately", "Check and adjust the machine settings", "Ignore the machine settings", "Ask a friend to demonstrate"],
    a: 1 }, // Q22 = B
  { q: "Which of the following is a crucial safety tip while using HUR resistance machines?",
    o: ["Lift as heavy as possible", "Hold your breath during lifts", "Use a smooth and controlled motion", "Perform quick and jerky movements"],
    a: 2 }, // Q23 = C
  { q: "Which feature in the HUR SmartCloud system allows for tracking individual user performance over time?",
    o: ["Profile Details", "Training Programs", "Exercise Progress", "Questionnaires"],
    a: 2 }, // Q24 = C
  { q: "What feature of the HUR SmartCloud system helps in creating personalized workout programs?",
    o: ["Visits / Home Trainings", "Training Manager", "Training Programs", "Client Reports"],
    a: 2 }, // Q25 = C
  { q: "What is the purpose of the Romberg Test?",
    o: ["Measure body sway", "Test reaction time", "Measure heart rate", "Evaluate flexibility"],
    a: 0 }, // Q26 = A
  { q: "What does the Limits of Stability (LoS) Test assess?",
    o: ["Maximum leaning angles", "Step length", "Grip strength", "Joint flexibility"],
    a: 0 }, // Q27 = A
  { q: "Which phase is included in the Romberg Test protocol?",
    o: ["Walking backward", "Jumping on one leg", "Eyes open", "Eyes closed on one leg"],
    a: 2 }, // Q28 = C
  { q: "What is a key safety check before a balance test?",
    o: ["Tight clothing", "High ambient lighting", "Use of a fitness tracker", "Clean and stable platform surface"],
    a: 3 }, // Q29 = D
  { q: "What does the stabilogram graph in the test represent?",
    o: ["Reaction time trends", "Change in body weight", "Blood pressure variability", "Movement of the center of pressure"],
    a: 3 }, // Q30 = D
];

// ====================== WEB APP ENTRY POINTS ======================
function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.action === 'status') return json_(withLock_(function () { return status_(p.id); }));
    if (p.action === 'start')  return json_(withLock_(function () { return start_(p.id, p.redo === '1'); }));
    return json_({ ok: true, service: 'HUR assessment', questions: BANK.length });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action === 'submit') return json_(withLock_(function () { return submit_(body); }));
    throw new Error('Unknown action');
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

// ====================== ACTIONS ======================
function status_(rawId) {
  const id = normId_(rawId);
  const base = { ok: true, id: id, total: BANK.length, timeLimit: TIME_LIMIT_SEC, passPercent: PASS_PERCENT };
  closeStale_(id);

  const live = liveSession_(id);
  if (live) base.inProgress = { remaining: Math.max(0, Math.round(live.sess.startedAt / 1000 + TIME_LIMIT_SEC - Date.now() / 1000)), mode: live.sess.mode, count: live.sess.qids.length };

  const st = getStudent_(id);
  if (!st) { base.status = 'new'; return base; }

  base.attempts = st.attempts;
  base.latestPct = st.latestPct;
  base.bestPct = st.bestPct;
  if (st.passed) { base.status = 'passed'; return base; }
  if (st.outstanding.length) { base.status = 'retry'; base.outstandingCount = st.outstanding.length; return base; }
  base.status = 'new';
  return base;
}

function start_(rawId, redo) {
  const id = normId_(rawId);
  closeStale_(id);

  // Resume a running attempt (the clock never resets)
  const live = liveSession_(id);
  if (live) return sessionPayload_(live.sid, live.sess, true);

  const st = getStudent_(id);
  let mode = 'full';
  let qids = BANK.map(function (_, i) { return i; });
  if (st && st.passed) {
    if (!redo) throw new Error('ALREADY_PASSED');
    mode = 'redo';
  } else if (st && st.outstanding.length) {
    mode = 'retry';
    qids = st.outstanding.slice();
  }

  const sid = Utilities.getUuid();
  const sess = { id: id, mode: mode, qids: qids, startedAt: Date.now() };
  const cache = CacheService.getScriptCache();
  cache.put('s_' + sid, JSON.stringify(sess), 21600);
  cache.put('a_' + id, sid, 21600);
  return sessionPayload_(sid, sess, false);
}

function submit_(body) {
  const cache = CacheService.getScriptCache();
  const done = cache.get('r_' + body.sid);
  if (done) return JSON.parse(done);                       // idempotent (double click / retry)

  const raw = cache.get('s_' + body.sid);
  if (!raw) throw new Error('SESSION_EXPIRED');
  const sess = JSON.parse(raw);
  const result = finalize_(body.sid, sess, body.answers || {}, !!body.timedOut);
  return result;
}

// ====================== CORE ======================
function finalize_(sid, sess, answers, clientTimedOut) {
  const cache = CacheService.getScriptCache();
  const total = BANK.length;
  const ts = new Date();
  const elapsed = Math.max(0, Math.round((Date.now() - sess.startedAt) / 1000));
  const timedOut = clientTimedOut || elapsed > TIME_LIMIT_SEC;
  const late = elapsed > TIME_LIMIT_SEC + GRACE_SEC;
  const presented = {};
  sess.qids.forEach(function (q) { presented[q] = true; });

  const stillWrong = [];
  const wrong = [];
  const cells = [];                                         // per-question [response, mark]
  for (let q = 0; q < total; q++) {
    if (!presented[q]) { cells.push(['', 'Previously correct']); continue; }
    const v = answers[q];
    const sel = (v === 0 || v === 1 || v === 2 || v === 3) ? v : null;
    const item = BANK[q];
    if (sel === null) {
      cells.push(['No answer', 'Not answered']);
      stillWrong.push(q);
      wrong.push({ n: q + 1, q: item.q, selected: null });
    } else if (sel === item.a) {
      cells.push([opt_(item, sel), 'Correct']);
    } else {
      cells.push([opt_(item, sel), 'Wrong']);
      stillWrong.push(q);
      wrong.push({ n: q + 1, q: item.q, selected: opt_(item, sel) });
    }
  }

  const score = total - stillWrong.length;
  const pct = Math.round(score / total * 1000) / 10;
  const passedNow = pct >= PASS_PERCENT;

  const prev = getStudent_(sess.id);
  const attempts = (prev ? prev.attempts : 0) + 1;
  const best = Math.max(prev ? prev.bestPct : 0, pct);
  const everPassed = (prev && prev.passed) || passedNow;
  const firstPassed = (prev && prev.firstPassed) || (passedNow ? ts : '');

  const modeLabel = { full: 'Full test', retry: 'Retry missed questions', redo: 'Full test (re-attempt)' }[sess.mode];
  const note = [];
  if (timedOut) note.push('Time limit reached');
  if (late) note.push('Submitted ' + (elapsed - TIME_LIMIT_SEC) + 's after the deadline');

  const sheets = ensureSheets_();
  const row = [ts, sess.id, attempts, modeLabel, elapsed / 86400, timedOut ? 'Yes' : 'No',
               score + '/' + total, pct, passedNow ? 'PASS' : 'NOT YET', sess.qids.length, note.join('; ')];
  cells.forEach(function (c) { row.push(c[0], c[1]); });
  const rs = sheets.results;
  const r = rs.getLastRow() + 1;
  rs.getRange(r, 2, 1, 1).setNumberFormat('@');
  rs.getRange(r, 1, 1, row.length).setValues([row]);
  rs.getRange(r, 1, 1, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  rs.getRange(r, 5, 1, 1).setNumberFormat('[m]:ss');

  const srow = [sess.id, attempts, score + '/' + total, pct, best, everPassed ? 'Yes' : 'No', firstPassed,
                stillWrong.map(function (q) { return q + 1; }).join(', '), ts, modeLabel];
  saveStudent_(sheets.students, prev ? prev.row : 0, srow);

  const result = {
    ok: true, mode: sess.mode, total: total, score: score, pct: pct, passed: passedNow,
    passPercent: PASS_PERCENT, timedOut: timedOut, late: late, elapsed: elapsed, attempts: attempts,
    bestPct: best, presented: sess.qids.length, wrong: wrong
  };
  cache.put('r_' + sid, JSON.stringify(result), 21600);
  cache.remove('s_' + sid);
  if (cache.get('a_' + sess.id) === sid) cache.remove('a_' + sess.id);
  return result;
}

// A session that ran out of time and was never submitted (browser closed) is recorded as timed out.
function closeStale_(id) {
  const cache = CacheService.getScriptCache();
  const sid = cache.get('a_' + id);
  if (!sid) return;
  const raw = cache.get('s_' + sid);
  if (!raw) { cache.remove('a_' + id); return; }
  const sess = JSON.parse(raw);
  if (Date.now() > sess.startedAt + (TIME_LIMIT_SEC + GRACE_SEC) * 1000) finalize_(sid, sess, {}, true);
}

function liveSession_(id) {
  const cache = CacheService.getScriptCache();
  const sid = cache.get('a_' + id);
  if (!sid) return null;
  const raw = cache.get('s_' + sid);
  if (!raw) return null;
  return { sid: sid, sess: JSON.parse(raw) };
}

function sessionPayload_(sid, sess, resumed) {
  return {
    ok: true, sid: sid, id: sess.id, mode: sess.mode, resumed: resumed,
    startedAt: sess.startedAt, serverNow: Date.now(), timeLimit: TIME_LIMIT_SEC,
    total: BANK.length,
    questions: sess.qids.map(function (q) { return { id: q, n: q + 1, q: BANK[q].q, o: BANK[q].o }; })
  };
}

// ====================== SHEETS ======================
const RESULT_FIXED = ['Timestamp', 'Student ID', 'Attempt No.', 'Mode', 'Time Taken (m:ss)', 'Timed Out',
                      'Score', 'Percentage (%)', 'Result (pass ≥ ' + PASS_PERCENT + '%)', 'Questions Presented', 'Notes'];
const STUDENT_HEAD = ['Student ID', 'Attempts', 'Latest Score', 'Latest %', 'Best %', 'Passed (≥ ' + PASS_PERCENT + '%)',
                      'First Passed On', 'Outstanding Questions', 'Last Attempt', 'Last Mode'];

function ensureSheets_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let rs = ss.getSheetByName(RESULTS_SHEET);
  if (!rs) {
    rs = ss.insertSheet(RESULTS_SHEET);
    const head = RESULT_FIXED.slice();
    for (let i = 1; i <= BANK.length; i++) head.push('Q' + i + ' Response', 'Q' + i + ' Result');
    rs.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#0b3a6f').setFontColor('#ffffff').setWrap(true).setVerticalAlignment('middle');
    rs.setFrozenRows(1);
    rs.setFrozenColumns(2);
    const rng = rs.getRange(2, 1, 2000, head.length);
    rs.setConditionalFormatRules([
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Wrong').setBackground('#f8d7da').setFontColor('#842029').setRanges([rng]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Not answered').setBackground('#fff3cd').setFontColor('#664d03').setRanges([rng]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Correct').setBackground('#d1e7dd').setFontColor('#0f5132').setRanges([rng]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('PASS').setBackground('#d1e7dd').setFontColor('#0f5132').setRanges([rng]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('NOT YET').setBackground('#f8d7da').setFontColor('#842029').setRanges([rng]).build()
    ]);
  }
  let ss2 = ss.getSheetByName(STUDENTS_SHEET);
  if (!ss2) {
    ss2 = ss.insertSheet(STUDENTS_SHEET);
    ss2.getRange(1, 1, 1, STUDENT_HEAD.length).setValues([STUDENT_HEAD]).setFontWeight('bold').setBackground('#0b3a6f').setFontColor('#ffffff').setWrap(true);
    ss2.setFrozenRows(1);
    ss2.getRange(2, 1, 2000, 1).setNumberFormat('@');
  }
  try { ensureDashboard_(ss); } catch (err) { Logger.log('Dashboard not built: ' + err); }
  return { results: rs, students: ss2 };
}

function getStudent_(id) {
  const sh = ensureSheets_().students;
  const last = sh.getLastRow();
  if (last < 2) return null;
  const vals = sh.getRange(2, 1, last - 1, STUDENT_HEAD.length).getValues();
  for (let i = 0; i < vals.length; i++) {
    if (normId_(vals[i][0]) === id) {
      const v = vals[i];
      return {
        row: i + 2, attempts: Number(v[1]) || 0, latestPct: Number(v[3]) || 0, bestPct: Number(v[4]) || 0,
        passed: String(v[5]) === 'Yes', firstPassed: v[6] || '',
        outstanding: String(v[7]).split(',').map(function (x) { return parseInt(x, 10) - 1; }).filter(function (x) { return x >= 0 && x < BANK.length; })
      };
    }
  }
  return null;
}

function saveStudent_(sh, row, values) {
  const r = row || sh.getLastRow() + 1;
  sh.getRange(r, 1, 1, 1).setNumberFormat('@');
  sh.getRange(r, 1, 1, values.length).setValues([values]);
  sh.getRange(r, 7, 1, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sh.getRange(r, 9, 1, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
}

// ====================== HELPERS ======================
function normId_(v) {
  const id = String(v == null ? '' : v).replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z0-9_-]{3,20}$/.test(id)) throw new Error('INVALID_ID');
  return id;
}
function opt_(item, i) { return 'ABCD'.charAt(i) + '. ' + item.o[i]; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

/** Run once from the editor: authorises access to the sheet and creates the two tabs. */
function setupSheets() {
  ensureSheets_();
  Logger.log('Sheets ready: ' + RESULTS_SHEET + ', ' + STUDENTS_SHEET + ', ' + DASH_SHEET);
}

/** Run from the editor to rebuild the Dashboard tab from scratch (e.g. after updating this script). */
function setupDashboard() {
  ensureSheets_();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const old = ss.getSheetByName(DASH_SHEET);
  if (old) ss.deleteSheet(old);
  buildDashboard_(ss);
  Logger.log('Dashboard rebuilt.');
}


// ====================== ADMIN DASHBOARD ======================
// Built once; every number and chart is a live formula over the Students and Results tabs,
// so it refreshes by itself each time a student submits.
const DASH_SHEET = 'Dashboard';
const MAXR = 5000;           // formulas look at rows 2..5000 of Results / Students
const ROSTER_ROWS = 200;     // student rows shown in the roster

function colLetter_(n) { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }

function ensureDashboard_(ss) {
  if (!ss.getSheetByName(DASH_SHEET)) buildDashboard_(ss);
}

function buildDashboard_(ss) {
  const sh = ss.insertSheet(DASH_SHEET);          // appended: always the final tab
  ss.setSpreadsheetTimeZone(TZ);                   // so TODAY() / "per day" counts follow Singapore time
  sh.setHiddenGridlines(true);
  sh.setTabColor('#0e9f8a');

  const S = function (c) { return STUDENTS_SHEET + '!$' + c + '$2:$' + c + '$' + MAXR; };
  const R = function (c) { return RESULTS_SHEET + '!$' + c + '$2:$' + c + '$' + MAXR; };
  const NAVY = '#0b3a6f', TEAL = '#0e9f8a', BLUE = '#14589f', AMBER = '#d98a00';
  const N = BANK.length;

  // ---- layout: A..L = dashboard, N.. = chart data
  for (let c = 1; c <= 12; c++) sh.setColumnWidth(c, 95);
  sh.setColumnWidth(11, 130); sh.setColumnWidth(12, 190);
  sh.setColumnWidth(13, 40);
  for (let c = 14; c <= 33; c++) sh.setColumnWidth(c, 105);
  sh.setColumnWidth(30, 320);

  // ---- title
  sh.getRange(1, 1, 1, 12).merge().setValue('HUR SmartTouch Certification Assessment · Administrator Dashboard')
    .setFontSize(20).setFontWeight('bold').setFontColor('#ffffff').setBackground(NAVY).setVerticalAlignment('middle').setHorizontalAlignment('left');
  sh.setRowHeight(1, 52);
  sh.getRange(2, 1, 1, 12).merge()
    .setFormula('="Live view · updates automatically as students submit · Last submission: "&IF(COUNT(' + R('A') + ')=0,"none yet",TEXT(MAX(' + R('A') + '),"d mmm yyyy hh:mm"))')
    .setFontColor('#5a6a80').setFontSize(10).setVerticalAlignment('middle');
  sh.setRowHeight(2, 26);

  // ---- KPI tiles (2 columns wide each)
  function tile(row, col, label, formula, fmt) {
    sh.getRange(row, col, 1, 2).merge().setValue(label).setFontSize(9).setFontWeight('bold').setFontColor('#5a6a80')
      .setHorizontalAlignment('center').setVerticalAlignment('bottom').setBackground('#eef3fa');
    sh.getRange(row + 1, col, 1, 2).merge().setFormula(formula).setNumberFormat(fmt).setFontSize(22).setFontWeight('bold')
      .setFontColor(NAVY).setHorizontalAlignment('center').setVerticalAlignment('middle').setBackground('#eef3fa');
  }
  [3, 6, 9].forEach(function (r) { sh.setRowHeight(r, 10); });
  sh.setRowHeight(4, 26); sh.setRowHeight(5, 46); sh.setRowHeight(7, 26); sh.setRowHeight(8, 46);
  const nStu = 'COUNTA(' + S('A') + ')', nPass = 'COUNTIF(' + S('F') + ',"Yes")';
  tile(4, 1,  'STUDENTS ATTEMPTED', '=' + nStu, '0');
  tile(4, 3,  'TOTAL ATTEMPTS', '=COUNTA(' + R('B') + ')', '0');
  tile(4, 5,  'PASSED (≥ ' + PASS_PERCENT + '%)', '=' + nPass, '0');
  tile(4, 7,  'PASS RATE', '=IFERROR(' + nPass + '/' + nStu + ',0)', '0%');
  tile(4, 9,  'NOT YET PASSED', '=' + nStu + '-' + nPass, '0');
  tile(4, 11, 'AVERAGE BEST SCORE', '=IFERROR(AVERAGE(' + S('E') + '),0)', '0.0"%"');
  tile(7, 1,  'SCORED 100%', '=COUNTIF(' + S('E') + ',100)', '0');
  tile(7, 3,  'AVG ATTEMPTS / STUDENT', '=IFERROR(AVERAGE(' + S('B') + '),0)', '0.0');
  tile(7, 5,  'AVG TIME TAKEN', '=IFERROR(AVERAGE(' + R('E') + '),0)', '[m]:ss');
  tile(7, 7,  'TIMED-OUT ATTEMPTS', '=COUNTIF(' + R('F') + ',"Yes")', '0');
  tile(7, 9,  'SUBMISSIONS TODAY', '=COUNTIFS(' + R('A') + ',">="&TODAY(),' + R('A') + ',"<"&(TODAY()+1))', '0');
  tile(7, 11, 'MOST-MISSED QUESTION', '=IF(MAX(AF4:AF' + (3 + N) + ')=0,"—",INDEX(AC4:AC' + (3 + N) + ',MATCH(MAX(AF4:AF' + (3 + N) + '),AF4:AF' + (3 + N) + ',0)))', '@');

  // ---- chart data (columns N onward)
  sh.getRange(1, 14, 1, 1).setValue('CHART DATA · calculated automatically, please do not edit').setFontWeight('bold').setFontColor('#5a6a80');
  function head(row, col, labels) { sh.getRange(row, col, 1, labels.length).setValues([labels]).setFontWeight('bold').setBackground('#eef3fa').setFontColor(NAVY); }
  function labelsAndFormulas(row, col, rows) {          // rows: [label, formula]
    rows.forEach(function (r, i) { sh.getRange(row + i, col).setValue(r[0]); sh.getRange(row + i, col + 1).setFormula(r[1]); });
  }

  // pass status (N:O)
  head(3, 14, ['Pass status', 'Students']);
  labelsAndFormulas(4, 14, [['Passed', '=' + nPass], ['Not yet passed', '=' + nStu + '-' + nPass]]);

  // best-score bands (Q:R)
  head(3, 17, ['Best score band', 'Students']);
  const bands = [['Below 50%', 0, 50], ['50–59%', 50, 60], ['60–69%', 60, 70], ['70–79%', 70, 80], ['80–89%', 80, 90], ['90–99%', 90, 100]];
  const bandRows = bands.map(function (b) { return [b[0], '=COUNTIFS(' + S('E') + ',">="&' + b[1] + ',' + S('E') + ',"<"&' + b[2] + ')']; });
  bandRows.push(['100%', '=COUNTIF(' + S('E') + ',100)']);
  labelsAndFormulas(4, 17, bandRows);

  // attempts per student (T:U)
  head(3, 20, ['Attempts', 'Students']);
  labelsAndFormulas(4, 20, [
    ['1 attempt', '=COUNTIF(' + S('B') + ',1)'], ['2 attempts', '=COUNTIF(' + S('B') + ',2)'],
    ['3 attempts', '=COUNTIF(' + S('B') + ',3)'], ['4+ attempts', '=COUNTIF(' + S('B') + ',">=4")']]);

  // submissions per day, last 14 days (W:X)
  head(3, 23, ['Day', 'Submissions']);
  const dayRows = [];
  for (let n = 0; n < 14; n++) {
    const d0 = 'TODAY()-' + (13 - n), d1 = 'TODAY()-' + (12 - n);
    dayRows.push(['=TEXT(' + d0 + ',"d mmm")', '=COUNTIFS(' + R('A') + ',">="&(' + d0 + '),' + R('A') + ',"<"&(' + d1 + '))']);
  }
  dayRows.forEach(function (r, i) { sh.getRange(4 + i, 23).setFormula(r[0]); sh.getRange(4 + i, 24).setFormula(r[1]); });

  // attempt type (Z:AA)
  head(3, 26, ['Attempt type', 'Attempts']);
  labelsAndFormulas(4, 26, [
    ['Full test', '=COUNTIF(' + R('D') + ',"Full test")'],
    ['Retry missed questions', '=COUNTIF(' + R('D') + ',"Retry missed questions")'],
    ['Full test (re-attempt)', '=COUNTIF(' + R('D') + ',"Full test (re-attempt)")']]);

  // question analysis (AC:AG)
  head(3, 29, ['Question', 'Question text', 'Times presented', 'Times wrong', '% correct']);
  BANK.forEach(function (item, k) {
    const row = 4 + k, rng = R(colLetter_(11 + 2 * (k + 1)));
    sh.getRange(row, 29).setValue('Q' + (k + 1));
    sh.getRange(row, 30).setValue(item.q);
    sh.getRange(row, 31).setFormula('=COUNTIF(' + rng + ',"Correct")+COUNTIF(' + rng + ',"Wrong")+COUNTIF(' + rng + ',"Not answered")');
    sh.getRange(row, 32).setFormula('=COUNTIF(' + rng + ',"Wrong")+COUNTIF(' + rng + ',"Not answered")');
    sh.getRange(row, 33).setFormula('=IFERROR((AE' + row + '-AF' + row + ')/AE' + row + ',0)');
  });
  sh.getRange(4, 33, N, 1).setNumberFormat('0%');
  sh.getRange(3, 14, 1, 20).setFontSize(10);
  sh.getRange(4, 14, 40, 20).setFontColor('#5a6a80').setFontSize(10);

  // ---- charts
  function chart(type, a1s, title, row, col, w, h, colors, extra) {
    let b = sh.newChart().setChartType(type);
    a1s.forEach(function (a) { b = b.addRange(sh.getRange(a)); });
    b = b.setNumHeaders(1).setPosition(row, col, 0, 0)
      .setOption('title', title).setOption('width', w).setOption('height', h)
      .setOption('colors', colors).setOption('titleTextStyle', { fontSize: 13, bold: true, color: NAVY });
    Object.keys(extra || {}).forEach(function (k) { b = b.setOption(k, extra[k]); });
    sh.insertChart(b.build());
  }
  const noLegend = { legend: { position: 'none' } };
  chart(Charts.ChartType.PIE, ['N3:O5'], 'Pass status (students)', 12, 1, 370, 300, [TEAL, AMBER], { pieHole: 0.5, legend: { position: 'bottom' } });
  chart(Charts.ChartType.COLUMN, ['Q3:R10'], 'Best score distribution (students)', 12, 5, 370, 300, [BLUE], noLegend);
  chart(Charts.ChartType.COLUMN, ['T3:U7'], 'Attempts per student', 12, 9, 370, 300, [NAVY], noLegend);
  chart(Charts.ChartType.COLUMN, ['W3:X17'], 'Submissions per day (last 14 days)', 28, 1, 560, 300, [TEAL], noLegend);
  chart(Charts.ChartType.PIE, ['Z3:AA6'], 'Attempt type', 28, 7, 560, 300, [BLUE, TEAL, AMBER], { pieHole: 0.5, legend: { position: 'bottom' } });
  chart(Charts.ChartType.COLUMN, ['AC3:AC' + (3 + N), 'AG3:AG' + (3 + N)], '% correct by question (all attempts) · lower = harder', 44, 1, 1130, 320, [BLUE],
        Object.assign({ vAxis: { minValue: 0, maxValue: 1, format: '0%' } }, noLegend));

  // ---- most-missed questions
  sh.getRange(61, 1, 1, 12).merge().setValue('Top 5 most-missed questions').setFontWeight('bold').setFontSize(13).setFontColor(NAVY);
  sh.getRange(62, 1, 1, 3).setValues([['Question', 'Times wrong', 'Question text']]).setFontWeight('bold').setBackground('#eef3fa').setFontColor(NAVY);
  sh.getRange(62, 4, 1, 9).setBackground('#eef3fa');
  sh.getRange(63, 1).setFormula('=IFERROR(ARRAY_CONSTRAIN(SORT({AC4:AC' + (3 + N) + ',AF4:AF' + (3 + N) + ',AD4:AD' + (3 + N) + '},2,FALSE),5,3),"")');

  // ---- student roster
  sh.getRange(70, 1, 1, 12).merge().setValue('Student roster · who has attempted, and how they are doing').setFontWeight('bold').setFontSize(13).setFontColor(NAVY);
  sh.getRange(71, 1, 1, 12).setValues([['Student ID', 'Attempts', 'Latest %', 'Best %', 'Best (bar)', 'Status', 'Questions still to fix', '', '', '', 'Last attempt', 'Last mode']])
    .setFontWeight('bold').setBackground('#eef3fa').setFontColor(NAVY);
  const roster = [];
  for (let i = 0; i < ROSTER_ROWS; i++) {
    const s = i + 2, A = STUDENTS_SHEET + '!$A$' + s, g = function (c) { return '=IF(' + A + '="","",' + STUDENTS_SHEET + '!$' + c + '$' + s + ')'; };
    roster.push([
      g('A'), g('B'), g('D'), g('E'),
      '=IF(' + A + '="","",SPARKLINE(' + STUDENTS_SHEET + '!$E$' + s + ',{"charttype","bar";"max",100;"color1","' + TEAL + '"}))',
      '=IF(' + A + '="","",IF(' + STUDENTS_SHEET + '!$F$' + s + '="Yes","Passed","Not yet"))',
      '=IF(' + A + '="","",IF(' + STUDENTS_SHEET + '!$H$' + s + '="","—",' + STUDENTS_SHEET + '!$H$' + s + '))',
      '', '', '', g('I'), g('J')
    ]);
  }
  sh.getRange(72, 1, ROSTER_ROWS, 12).setFormulas(roster);
  sh.getRange(72, 3, ROSTER_ROWS, 2).setNumberFormat('0.0"%"');
  sh.getRange(72, 11, ROSTER_ROWS, 1).setNumberFormat('d mmm yyyy hh:mm');
  sh.getRange(72, 1, ROSTER_ROWS, 12).setVerticalAlignment('middle');

  const rosterStatus = sh.getRange(72, 6, ROSTER_ROWS, 1);
  sh.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Passed').setBackground('#d1e7dd').setFontColor('#0f5132').setRanges([rosterStatus]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Not yet').setBackground('#fff3cd').setFontColor('#664d03').setRanges([rosterStatus]).build()
  ]);

  try { ss.setActiveSheet(sh); ss.moveActiveSheet(ss.getNumSheets()); } catch (e) { /* already last */ }
  return sh;
}
