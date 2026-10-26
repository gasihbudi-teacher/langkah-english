# Langkah English V13-B — TKA Assessment Engine

**26 October 2026 · Incremental release from V13-A.** This is an **engine-only** update, not a new TKA topic-quiz or simulation content release. Install on top of an existing V13-A repository (or use the complete V13-B site ZIP as a restoration baseline). Do not apply the small update directly to V12.

## Scope and publication status

- Supports ordinary single-answer multiple choice (legacy format, no `questionType` field required), **multiple-answer MCMA**, and **category-by-statement** question forms.
- Adds responsive, labelled checkbox and radio controls; per-row clearing, change/remove selection, keyboard focus recovery, ungraded practice feedback, and post-submission evidence/reasoning review.
- Practice may reveal optional Indonesian translations and immediate reasoning. Simulation hides these until results; timing is based on each local quiz's `durationSeconds`, not a claimed official TKA time limit.
- Completed MCMA responses use **exact set matching**, while completed category items require **every row** to match. No partial-credit marks. A category with any unselected row, or a multiple-choice item with no chosen option, counts as **unanswered**. Results remain unofficial local practice scores, not TKA grade predictions.
- Saves incomplete category selections in browser drafts; supports review, backup export/import and resumption of valid V13-B answer arrays. Legacy answer indices, quiz snapshots, progress IDs, backups (`version:1`), catalog entries, mock flags and UTBK data are retained.
- Keeps the published catalogue at **56 lessons, 41 quizzes, 97 entries, 419 scored/practice items**. The 3-item file `tests/fixtures/v13b-mixed-formats.json` is a **QA fixture only**. It is not catalogued or published as a student quiz. The 10 proposed TKA lessons, 120 proposed questions, and three proposed new TKA mocks are **not included**.

## Question schema for new authored quizzes

The shared schema is `data/schemas/quiz.schema.json` and the runtime engine is `js/question-types.mjs`. Missing `questionType` is treated as `single`; all existing quiz JSONs can be left unchanged. Every question needs `id`, `prompt`, `explanation`; passage-linked questions may include `passageId`, `evidence`, and `skill`.

**Single (existing):**

```json
{"id":"q1","prompt":"When did it start?","choices":["In March","In June"],"answer":0,"explanation":"Teks menyebut March."}
```

**Multiple (MCMA):**

```json
{"id":"q2","questionType":"multiple","prompt":"Select all supported statements.","choices":["Statement A","Statement B","Statement C"],"answers":[0,2],"explanation":"A dan C sesuai dengan bukti.","choiceExplanations":["Didukung.","Tidak didukung.","Didukung."]}
```

**Category:**

```json
{"id":"q3","questionType":"category","prompt":"Classify each statement.","categories":["Supported","Not supported"],"statements":[{"text":"The event was on Monday.","answerCategory":"Supported","explanation":"Teks menuliskan Monday."},{"text":"It happened on Friday.","answerCategory":"Not supported","explanation":"Friday tidak disebut."}],"explanation":"Cocokkan setiap pernyataan dengan teks."}
```

The sample fragments above illustrate the per-question contract; for an executable three-format quiz, see `tests/fixtures/v13b-mixed-formats.json` (not a published assessment). `translationId.prompt` is optional; `translationId.choices` corresponds to single/multiple choices. For category questions, `translationId.statements` and `translationId.categories` correspond positionally to English rows/categories. Keep questions and answers English-first; translations start closed. Provide `choiceExplanations` and `statements[].explanation` for meaningful per-option/row feedback. Multiple-answer keys require at least two unique indices. Category answer values must exactly match one of the `categories` strings.

**Response storage:** single → index or `null`; multiple → selected index array (possibly empty during an unfinished attempt) or `null`; category → category-name array matching statement order (with `null` for unset rows) or `null`. Reordering selected indexes does not change scoring. The original backup format number remains `1`.

## Files changed from V13-A

- `js/question-types.mjs` (new pure question validation/response/scoring module)
- `js/core.js`, `js/quiz.js`, `js/results.js`, `js/translations.js`, `js/backup-format.mjs`, `js/i18n.js`
- `data/schemas/quiz.schema.json`, `tools/validate.py`, `css/style.css`, `tka.html`
- `.github/workflows/validate.yml`, `tests/scoring.mjs`, `tests/v13b-assessment.mjs` (new), `tests/fixtures/v13b-mixed-formats.json` (new)
- This guide.

## Test/acceptance instructions

From the repository root:

```sh
python3 tools/validate.py
node tests/scoring.mjs
node tests/v13b-assessment.mjs
for f in tests/*.mjs; do node "$f" || exit 1; done
```

QA done in the build environment: Python validator PASS (97 resources, 419 items); all available Node `.mjs` suites PASS; JSON Schema check PASS for the 41 original quiz files and test fixture; a Chromium **isolated in-memory** smoke test on mobile-sized viewport passed for all three response types, result display, hidden simulation help, local saving and a legacy quiz. An administrator restriction blocked real localhost navigation, so **no live production browser or real-phone end-to-end pass is claimed**. Classroom feedback, subject-teacher checks, keyboard/screen-reader testing on a real device and Cloudflare-preview smoke tests remain outstanding.

## Safe installation using GitHub Desktop on Linux Mint

1. Ensure your repository already contains the confirmed working V13-A version. Fetch/Pull before changing files. Export a browser-local progress backup if desired.
2. Extract **the V13-B *update* ZIP outside** the repository. Copy the included file paths into the repository without deleting `.git`. Do not delete or replace your original `data/lessons/*.json` or `data/quizzes/*.json` files.
3. Review the diff; run the Python validator and all Node test suites shown above.
4. Commit/push to your deployment branch; check Cloudflare Pages build/deploy and your old quizzes/results on phone. Confirm existing progress and backup export/import still work.
5. To start V13-C1, work from the updated V13-B source. Do not advertise MCMA or category TKA quizzes as published until authored and verified in a later content release.

No tracking, accounts, paid API, build system, or official scoring claims have been introduced.
