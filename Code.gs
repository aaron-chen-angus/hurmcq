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
  const firstPassed = (prev && prev.firstPassed) || (passedNow ? nowStr_() : '');

  const modeLabel = { full: 'Full test', retry: 'Retry missed questions', redo: 'Full test (re-attempt)' }[sess.mode];
  const note = [];
  if (timedOut) note.push('Time limit reached');
  if (late) note.push('Submitted ' + (elapsed - TIME_LIMIT_SEC) + 's after the deadline');

  const sheets = ensureSheets_();
  const row = [nowStr_(), sess.id, attempts, modeLabel, fmtDur_(elapsed), timedOut ? 'Yes' : 'No',
               score + '/' + total, pct, passedNow ? 'PASS' : 'NOT YET', sess.qids.length, note.join('; ')];
  cells.forEach(function (c) { row.push(c[0], c[1]); });
  const rs = sheets.results;
  const r = rs.getLastRow() + 1;
  rs.getRange(r, 2, 1, 1).setNumberFormat('@');
  rs.getRange(r, 1, 1, row.length).setValues([row]);

  const srow = [sess.id, attempts, score + '/' + total, pct, best, everPassed ? 'Yes' : 'No', firstPassed,
                stillWrong.map(function (q) { return q + 1; }).join(', '), nowStr_(), modeLabel];
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
const RESULT_FIXED = ['Timestamp', 'Student ID', 'Attempt No.', 'Mode', 'Time Taken (mm:ss)', 'Timed Out',
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
}

// ====================== HELPERS ======================
function normId_(v) {
  const id = String(v == null ? '' : v).replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z0-9_-]{3,20}$/.test(id)) throw new Error('INVALID_ID');
  return id;
}
function opt_(item, i) { return 'ABCD'.charAt(i) + '. ' + item.o[i]; }
function fmtDur_(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
function nowStr_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

/** Run once from the editor: authorises access to the sheet and creates the two tabs. */
function setupSheets() {
  ensureSheets_();
  Logger.log('Sheets ready: ' + RESULTS_SHEET + ', ' + STUDENTS_SHEET);
}
