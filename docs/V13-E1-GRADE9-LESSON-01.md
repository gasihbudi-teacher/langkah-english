# V13-E1 — Grade 9 Lesson 1 Release and QA Notes

**Date:** 31 October 2026  
**Base:** prepared V13-D complete-site source  
**Scope:** Grade 9 Lesson 1 only, plus the dedicated assessment, authoring validation, tests and release documentation.

## Implemented

- Rewrote `grade9-reading` while preserving its stable resource ID.
- Added four measurable objectives and eight topic-specific scaffold steps.
- Seven steps include meaningful optional comprehension checks; one step is explanation-only.
- Added a 128-word connected bilingual school-garden model passage.
- Added ten distinct explained examples, a sentence breakdown, one formative checkpoint, a reflection, a self-check and eight vocabulary items at the end.
- Expanded embedded guided practice from two to four questions.
- Added `grade9-place-reading-check`: eight English-first questions on a new descriptive passage, with exact evidence and Indonesian explanations.
- Updated the Grade 9 lesson metadata and registered the new assessment for Grade 9 only.
- Updated the JSON schema and validator so scaffold checks are optional but must be paired.
- Updated the historical regression tests to exempt only the intentionally revised Grade 9 lesson and its old practice questions; the new dedicated test covers the replacement.

## Explicitly unchanged

- `data/lessons/grade10-recount.json`
- `data/quizzes/school-reading-check.json`
- `data/quizzes/school-reading-practice.json`
- Existing `grade9-reading` resource ID and the browser-local progress key `langkah.progress.v1`.
- Existing backup/export format and all unrelated content.

## Source totals

| Measure | V13-D | V13-E1 |
|---|---:|---:|
| Lessons | 66 | 66 |
| Quizzes | 54 | 55 |
| Catalogue resources | 120 | 121 |
| Scaffold steps | 608 | 610 |
| Explained example cards | 671 | 671 |
| Scored / embedded items | 659 | 669 |

The ten additional scored/embedded items are two new embedded practice questions and eight questions in the dedicated quiz.

## Automated verification

- `python tools/validate.py`: PASS — 121 resources, 669 questions including embedded practice; JSON, paths, references, choices and evidence checked.
- All 21 `tests/*.mjs` suites: PASS.
- New `tests/v13e1-grade9-reading.mjs`: PASS — objectives, step/check structure, example count, practice, quiz evidence, answer keys and unchanged Grade 10/shared quiz files.
- The revised global scaffold test confirms 610 steps and 609 optional checks.
- `tests/v13e1-browser-smoke.py`: PASS in an isolated Chromium DOM harness. The lesson and quiz rendered, the guided checkpoint and quiz feedback worked, desktop/mobile horizontal overflow was 0px, and no page errors were recorded.
- `tests/v13d-browser-smoke.py`: PASS after correcting a timing-sensitive assertion that expected the timer to remain exactly at 45:00 after the simulation had started. All three pre-existing TKA mocks rendered with their expected controls and no mobile overflow.

Automated checks do not replace independent bilingual teacher review or a learner pilot.

## Browser and deployment status

Chromium navigation to a local HTTP server was blocked by the execution environment, so the browser smoke test uses an isolated DOM harness with the actual HTML, CSS, JavaScript and JSON content. This is useful render/interaction coverage but is not a live Cloudflare preview or physical-device test. The package has not been pushed to the user's GitHub repository or deployed to Cloudflare Pages.

Generated previews: `v13e1-grade9-lesson-desktop-top.png`, `v13e1-grade9-assessment-desktop.png`, and `v13e1-grade9-lesson-mobile.png`.

## Install / preview

1. Back up the existing repository and any local work.
2. Use the V13-D incremental update package, not the complete-site package, if updating the accepted V13-D repository.
3. Extract the patch outside the repository and overlay its files into the existing Git clone. Never replace `.git`.
4. Run `python3 tools/validate.py` and `node tests/v13e1-grade9-reading.mjs`; preferably run all Node tests.
5. Preview `school.html#grade-9-materi`, open `lesson.html?id=grade9-reading`, complete guided practice, and open the dedicated assessment.
6. Review desktop and mobile layouts before committing and publishing.
