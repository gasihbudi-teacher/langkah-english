# V8 automated validation and production-preview checklist
Date: 25 October 2026. Source: `langkah-english-v8/`.

## Automated checks — PASSED

- `python tools/validate.py`: **91** catalogue resources, **372** graded/embedded practice questions, IDs, referential integrity, JSON syntax, question keys and exact passage evidence.
- JSON Schema validation: **1 catalogue**, **53 lesson files**, **38 quiz files**.
- `node tests/scoring.mjs`: scoring, invalid question count/keys/duration.
- `node tests/v2-quality.mjs` through `node tests/v7-quality.mjs`: backwards-compatibility checks against **the original V7 resource ID list**. Checks cover bilingual interface, navigation, local backups, old UTBK mocks, older content fingerprints, translations and progressive scaffolding.
- `node tests/v8-quality.mjs`: 20 school modules + 20 matching quizzes, 3 UTBK skills modules + 3 matching quizzes, five grade-specific lessons per school grade, required scaffolding/vocabulary/worked examples, 23 original passages, 23 formative checkpoints, **138 newly assessed/embedded questions**, English question/choice language, Indonesian option gloss alignment/count, four-option answer distribution, passage evidence, and test-mode language-help policy.
- `node --check js/*.js`: JavaScript syntax.
- Original **45 V7 lesson/quiz JSON files remain byte-for-byte unchanged**; historical content tests verify the original 234 graded or embedded questions have the same answer keys and choice positions.

## Production/browser testing — NOT VERIFIED HERE

Chromium was installed and launched. Navigation to a local preview at `127.0.0.1` returned `net::ERR_BLOCKED_BY_ADMINISTRATOR` from the testing environment. Thus no full navigation, interactive layout, or mobile accessibility pass is claimed.

### Checklist on a Cloudflare Pages preview (desktop and mobile)

1. `school.html#grade-9-materi` / `school.html#grade-12-latihan`: confirm matching collapsible sections expand, all five new modules per grade appear, and cards open without 404s.
2. Open `lesson.html?id=grade9-report-animals`; read the three step-by-step scaffold stages and examples; verify English terminology is highlighted and quoted in Indonesian explanatory text.
3. Open a guided checkpoint, click an answer, reveal Indonesian glosses, and confirm the explanation appears without recording a quiz score.
4. Expand the two longer examples; open `lesson.html?id=grade12-argumentative-text`; confirm example passages, vocabulary, recap and both embedded practice tasks work.
5. Use the link at the end of a lesson to open `quiz.html?id=grade12-argumentative-text-practice`. In **Practice Mode**, verify the collapsible Indonesian question/answer glosses and instant explanations; submit and view results.
6. Retake the same quiz in **Simulation Mode**; confirm no translated hints or immediate feedback show before submission, and that results provide explanations and glosses afterward.
7. Open `utbk.html#utbk-lessons`, then all three new lab lessons/quizzes. Confirm the older `utbk-mock-a`, `utbk-mock-b`, `utbk-mock-c` are still 20 questions / 20 minutes.
8. Confirm Search finds new grade-topic titles and that there are no unexpected filters.
9. Check small-screen scrolling, focus outlines, native details keyboard handling, long text wrapping, browser console errors and empty/fresh browser-storage cases.
10. Test old saved progress / exported progress backup from V7. Check that uncompleted V7 quiz drafts can still resume without losing answers.

## Content review still required

The original AI-assisted V8 passages, grammatical guidance, option translations, difficulty and correct-answer explanations have been structurally checked, **not independently reviewed by a classroom teacher**. Before formal assignment to students, ask a bilingual English teacher to proofread grade-level alignment, textbook interpretation, accessibility and plausible distractors. These assessments are unofficial and do not predict UTBK results.
