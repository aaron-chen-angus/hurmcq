# HUR SmartTouch Technology Health Coaching Certification Assessment

An online, timed 30-question multiple-choice assessment for the HUR SmartTouch Health Coaching Technology Certification. Results are written to Google Sheets so assessors can track every student.

## Links

| | |
|---|---|
| **Assessment site** | https://aaron-chen-angus.github.io/hurmcq/ |
| **Student results (Google Sheets)** | https://docs.google.com/spreadsheets/d/153vaUwx0JHADJMWZbkiQVvHYb_awrq5o6b8IMAWkDrY/ |

## At a glance

| | |
|---|---|
| Questions | 30 multiple-choice (A–D), one correct answer each |
| Time limit | **15 minutes**, counted down from the moment the first question appears; auto-submits at 0:00 |
| Pass mark | **at least 90%** (27 of 30) |
| Identification | Student ID only — it is the key used to look up past results |
| Retries | Below 90%: log in again with the same ID and redo **only the questions missed**, working towards 100% |
| Already passed | Shown the earlier result and asked whether to take the assessment again |

## For students

1. Open the [assessment site](https://aaron-chen-angus.github.io/hurmcq/) and enter your **Student ID**.
2. Read the instructions and press **Begin**. The 15-minute clock starts immediately.
3. Answer using the options (or keys A–D / 1–4). You can move back and forth and use the question navigator.
4. **Submit**, or let the timer run out and your answers are submitted automatically. Unanswered questions count as incorrect.
5. You will see your **% score**, whether you met the 90% requirement, and every question you got wrong with **your selected answer** (the correct answer is not shown).
6. Not yet at 90%? Log in again with the same ID — you will be given only the questions you missed. Your score is cumulative.

## For administrators

Open the [results workbook](https://docs.google.com/spreadsheets/d/153vaUwx0JHADJMWZbkiQVvHYb_awrq5o6b8IMAWkDrY/). It has three tabs:

| Tab | Purpose |
|---|---|
| **Results** | One row per attempt: timestamp, Student ID, attempt no., mode, time taken, timed-out flag, score, %, PASS / NOT YET, and for all 30 questions the student’s response plus *Correct / Wrong / Not answered*. Wrong answers are shaded red. |
| **Students** | One row per Student ID: attempts, latest and best %, passed flag, date first passed, and the questions still outstanding. The app checks this tab on every login. |
| **Dashboard** | Live admin view (below). Always the last tab. |

### Dashboard

Everything refreshes automatically as students submit — no manual steps.

- **Headline numbers:** students attempted, total attempts, passed, pass rate, not yet passed, average best score, students at 100%, average attempts per student, average time taken, timed-out attempts, submissions today, most-missed question.
- **Charts:** pass status; best-score distribution; attempts per student; submissions per day (last 14 days); attempt type (full / retry / re-attempt); **% correct by question** (shows which topics need re-teaching).
- **Top 5 most-missed questions**, with the question text.
- **Student roster:** every student who has attempted, with latest %, best % (with a bar), pass status, the questions still to fix, and last attempt time. Shows up to 200 students.

> The Dashboard keeps its chart data in columns N onward (grey text) — please leave these untouched.

## How it works

```
Student browser (GitHub Pages)  ──►  Google Apps Script web app  ──►  Google Sheets
        index.html                      Code.gs (question bank,           Results · Students · Dashboard
                                        answer key, grading, timer)
```

- **`index.html`** — the student interface. It contains no questions and no answers; everything is fetched from the Apps Script back end.
- **`Code.gs`** — holds the question bank and the answer key, runs the server-side clock, grades every submission and writes to the sheet. It is deployed from Apps Script, not hosted in this repository.
- The timer is enforced by the server (the start time is recorded when the first question is served); refreshing the page does not reset the clock, and an abandoned attempt is recorded as timed out.

### Updating the back end

1. Paste the new `Code.gs` into the Apps Script project.
2. Run `setupDashboard` once from the editor (rebuilds the Dashboard tab) and approve any permission prompt.
3. **Deploy → Manage deployments → Edit → New version** so the live `/exec` URL serves the new code.

## Competency framework

Each question is mapped to one of eight competencies that a certified HUR SmartTouch health coach is expected to demonstrate. *This mapping was derived from the content of each question; please confirm it against the official HUR certification learning outcomes.*

| Code | Competency | What the coach can do | Questions | Count |
|---|---|---|---|---|
| **C1** | Exercise prescription for older adults | Applies sound resistance-training principles (sequencing, dosage, progression) when coaching older and frail adults. | Q1–Q4 | 4 |
| **C2** | Neuromuscular & ageing physiology | Explains how muscle contracts and how ageing changes muscle, so programme choices can be justified to clients. | Q5–Q7 | 3 |
| **C3** | HUR resistance technology | Understands how HUR equipment delivers resistance. | Q8 | 1 |
| **C4** | HUR equipment & muscle targeting | Selects the correct HUR machine for a target muscle group. | Q9–Q19 | 11 |
| **C5** | Intensity prescription (%1RM) | Matches training intensity to the training goal (strength vs endurance). | Q20, Q21 | 2 |
| **C6** | Safe equipment operation | Sets up equipment and coaches technique so clients train safely. | Q22, Q23 | 2 |
| **C7** | HUR SmartCloud & digital coaching | Uses SmartCloud features to build programmes and track client progress. | Q24, Q25 | 2 |
| **C8** | Balance assessment & interpretation | Administers and interprets HUR balance tests (Romberg, Limits of Stability). | Q26–Q30 | 5 |

## Question bank

### Q1. Which of these modalities should ideally precede resistance training for frail seniors?

- A. Balance training
- B. Interval running
- C. Aerobic exercises
- D. High-intensity workouts

**Competency:** C1 — Exercise prescription for older adults  
**Basis:** Sequencing: orders training modalities safely for frail seniors.

### Q2. What is the recommended frequency for strength training for older adults?

- A. Daily
- B. Once per week
- C. 2–3 days per week
- D. 4–5 days per week

**Competency:** C1 — Exercise prescription for older adults  
**Basis:** Dosage: knows the recommended weekly frequency of strength training for older adults.

### Q3. What is a key benefit of resistance training for seniors?

- A. Improves hearing
- B. Increases metabolism
- C. Reduces eyesight issues
- D. Enhances liver function

**Competency:** C1 — Exercise prescription for older adults  
**Basis:** Client communication: can explain a key benefit of resistance training.

### Q4. Which principle ensures gradual increases in strength training load?

- A. Balance
- B. Overload
- C. Flexibility
- D. Specificity

**Competency:** C1 — Exercise prescription for older adults  
**Basis:** Progression: applies the principle that governs gradual increases in training load.

### Q5. What initiates a muscle contraction?

- A. ATP
- B. Glycogen
- C. Nerve impulse
- D. Lactic acid

**Competency:** C2 — Neuromuscular & ageing physiology  
**Basis:** Motor control: understands what initiates a muscle contraction.

### Q6. Which muscle fibers are primarily lost with aging?

- A. Type I fibers
- B. Type II fibers
- C. Both Type I and II equally
- D. None are lost

**Competency:** C2 — Neuromuscular & ageing physiology  
**Basis:** Ageing: knows which muscle fibre type is preferentially lost with age.

### Q7. Which muscle fiber type has high fatigue resistance and slow contraction?

- A. Type I
- B. Type IIa
- C. Type IIb
- D. Type III

**Competency:** C2 — Neuromuscular & ageing physiology  
**Basis:** Fibre types: recognises the characteristics of slow, fatigue-resistant fibres.

### Q8. What type of resistance technology does HUR use?

- A. Weight stack
- B. Free weights
- C. Pneumatic
- D. Springs

**Competency:** C3 — HUR resistance technology  
**Basis:** Technology: identifies the resistance mechanism used by HUR machines.

### Q9. What muscle group does the HUR Leg Press target?

- A. Hamstrings
- B. Glutes
- C. Calves
- D. Triceps

**Competency:** C4 — HUR equipment & muscle targeting  
**Basis:** Machine selection: matches the HUR Leg Press to the muscle group it targets.

### Q10. Which HUR machine primarily strengthens the chest muscles?

- A. Leg Extension
- B. Abduction
- C. Seated Chest Press
- D. Low Back

**Competency:** C4 — HUR equipment & muscle targeting  
**Basis:** Machine selection: identifies the HUR machine that trains the chest.

### Q11. Which machine is used to target the back and shoulders?

- A. Abduction
- B. Pull Down / Push Up
- C. Leg Curl
- D. Leg Press

**Competency:** C4 — HUR equipment & muscle targeting  
**Basis:** Machine selection: identifies the HUR machine that addresses the back and shoulders.

### Q12. The HUR Leg Curl machine targets which muscle group?

- A. Glutes
- B. Quadriceps
- C. Hamstrings
- D. Biceps

**Competency:** C4 — HUR equipment & muscle targeting  
**Basis:** Machine selection: matches the HUR Leg Curl to the muscle group it targets.

### Q13. What is the main muscle group targeted by the HUR Abduction machine?

- A. Glutes
- B. Quadriceps
- C. Biceps
- D. Pectorals

**Competency:** C4 — HUR equipment & muscle targeting  
**Basis:** Machine selection: matches the HUR Abduction machine to the muscle group it targets.

### Q14. Which muscle group does the HUR Back Extension primarily target?

- A. Biceps
- B. Lower Back
- C. Abdominals
- D. Chest

**Competency:** C4 — HUR equipment & muscle targeting  
**Basis:** Machine selection: matches the HUR Back Extension to the muscle group it targets.

### Q15. What muscle group is the focus of the HUR Push Up machine?

- A. Abdominals
- B. Shoulders
- C. Hamstrings
- D. Pectorals

**Competency:** C4 — HUR equipment & muscle targeting  
**Basis:** Machine selection: matches the HUR Push Up machine to the muscle group it targets.

### Q16. Which muscle group is primarily targeted by the HUR Leg Extension machine?

- A. Pectorals
- B. Quadriceps
- C. Biceps
- D. Triceps

**Competency:** C4 — HUR equipment & muscle targeting  
**Basis:** Machine selection: matches the HUR Leg Extension to the muscle group it targets.

### Q17. The HUR Lat Pulldown machine primarily works which muscle group?

- A. Hamstrings
- B. Latissimus Dorsi
- C. Abdominals
- D. Gluteals

**Competency:** C4 — HUR equipment & muscle targeting  
**Basis:** Machine selection: matches the HUR Lat Pulldown to the muscle group it works.

### Q18. Which muscle group does the HUR Optimal Rhomb machine focus on?

- A. Pectorals
- B. Biceps
- C. Back
- D. Quadriceps

**Competency:** C4 — HUR equipment & muscle targeting  
**Basis:** Machine selection: matches the HUR Optimal Rhomb to the region it focuses on.

### Q19. The HUR Abdominal Crunch machine primarily targets which muscle group?

- A. Calves
- B. Abdominals
- C. Deltoids
- D. Trapezius

**Competency:** C4 — HUR equipment & muscle targeting  
**Basis:** Machine selection: matches the HUR Abdominal Crunch to the muscle group it targets.

### Q20. What percentage of 1RM is typically used for muscular strength training?

- A. 30-40%
- B. 40-50%
- C. 60-70%
- D. 80-90%

**Competency:** C5 — Intensity prescription (%1RM)  
**Basis:** Intensity for strength: applies the course’s load band (% of 1RM) for strength training.

### Q21. For muscular endurance training, what percentage of 1RM is usually recommended?

- A. 30-40%
- B. 50-60%
- C. 70-80%
- D. 90-100%

**Competency:** C5 — Intensity prescription (%1RM)  
**Basis:** Intensity for endurance: applies the course’s load band (% of 1RM) for muscular endurance.

### Q22. Before using any HUR resistance machine, what should be done first to ensure safety?

- A. Start lifting immediately
- B. Check and adjust the machine settings
- C. Ignore the machine settings
- D. Ask a friend to demonstrate

**Competency:** C6 — Safe equipment operation  
**Basis:** Pre-use safety: knows the first thing to do before using a HUR machine.

### Q23. Which of the following is a crucial safety tip while using HUR resistance machines?

- A. Lift as heavy as possible
- B. Hold your breath during lifts
- C. Use a smooth and controlled motion
- D. Perform quick and jerky movements

**Competency:** C6 — Safe equipment operation  
**Basis:** Technique: coaches safe movement quality on HUR machines.

### Q24. Which feature in the HUR SmartCloud system allows for tracking individual user performance over time?

- A. Profile Details
- B. Training Programs
- C. Exercise Progress
- D. Questionnaires

**Competency:** C7 — HUR SmartCloud & digital coaching  
**Basis:** SmartCloud: knows the feature used to track a client’s performance over time.

### Q25. What feature of the HUR SmartCloud system helps in creating personalized workout programs?

- A. Visits / Home Trainings
- B. Training Manager
- C. Training Programs
- D. Client Reports

**Competency:** C7 — HUR SmartCloud & digital coaching  
**Basis:** SmartCloud: knows the feature used to create personalised workout programmes.

### Q26. What is the purpose of the Romberg Test?

- A. Measure body sway
- B. Test reaction time
- C. Measure heart rate
- D. Evaluate flexibility

**Competency:** C8 — Balance assessment & interpretation  
**Basis:** Test purpose: knows what the Romberg Test measures.

### Q27. What does the Limits of Stability (LoS) Test assess?

- A. Maximum leaning angles
- B. Step length
- C. Grip strength
- D. Joint flexibility

**Competency:** C8 — Balance assessment & interpretation  
**Basis:** Test purpose: knows what the Limits of Stability (LoS) test assesses.

### Q28. Which phase is included in the Romberg Test protocol?

- A. Walking backward
- B. Jumping on one leg
- C. Eyes open
- D. Eyes closed on one leg

**Competency:** C8 — Balance assessment & interpretation  
**Basis:** Test protocol: knows which phase is part of the Romberg protocol.

### Q29. What is a key safety check before a balance test?

- A. Tight clothing
- B. High ambient lighting
- C. Use of a fitness tracker
- D. Clean and stable platform surface

**Competency:** C8 — Balance assessment & interpretation  
**Basis:** Test safety: knows a key check to make before a balance test.

### Q30. What does the stabilogram graph in the test represent?

- A. Reaction time trends
- B. Change in body weight
- C. Blood pressure variability
- D. Movement of the center of pressure

**Competency:** C8 — Balance assessment & interpretation  
**Basis:** Interpretation: reads what the stabilogram graph represents.

## Items worth a content review

| Question(s) | Note |
|---|---|
| Q9, Q15, Q20, Q21, Q28 | Wording and keyed answers depend on the HUR course material and the options offered; flagged for periodic content review. |

## Notes

- Student ID is the only identifier; anyone who knows an ID can start an attempt under it.
- Source: question set adapted from the *HUR SmartTouch Health Coaching Technology Certification MCQ Test Revision* Kahoot.
