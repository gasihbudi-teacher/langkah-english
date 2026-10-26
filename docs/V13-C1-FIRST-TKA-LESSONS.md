# Langkah English V13-C1 · First TKA lesson release

Release: 26 October 2026. Base: **user-confirmed working V13-B**. Installation: **overlay the V13-C1 update ZIP on your existing V13-B repository**, preserving all folders. Do not replace or delete `.git`.

## What is included

| Lesson | New scaffold steps | Explained bilingual cards | Embedded practice | Linked topic quiz |
| --- | ---: | ---: | ---: | ---: |
| TKA-01 · Jembatan TKA: Dari Kalimat ke Bacaan | 12 | 10 | 3 | 12 items |
| TKA-02 · Menemukan Informasi Tersurat dan Parafrasa | 9 | 10 | 3 | 12 items |

The lesson flow is definition → small bilingual teaching steps with revealable non-graded checks → connected mini text → deeper synthesis and ten explained cards → supported independent check → vocabulary last. The new 11–12-step material uses 3–4 named, collapsible-by-learner phases; all phases start open. Model texts are placed **after** the steps for the new TKA lessons. Existing lesson format stays unchanged.

Each quiz is original, untimed TKA-style **topic practice**, containing four single-answer, four multi-answer and four category items. All questions are English-first. Optional Indonesian question/choice translations and immediate explanations appear only in practice mode; simulation-style mode hides help until results. The four unseen quiz passages are approximately 229, 249, 240 and 266 words. CEFR/A2/B1 targets are editorial approximations, not independently validated proficiency labels. The two quizzes are *not* official TKA papers or score predictors.

### Integration and cumulative counts

* Four new catalogue entries, with stable IDs `tka-reading-foundations`, `tka-reading-foundations-practice`, `tka-explicit-information`, `tka-explicit-information-practice`.
* TKA Materi and Latihan display two live items each; the ten-item roadmap now shows two live and eight planned modules. Existing eight shared preparatory lessons remain unchanged.
* V13-C1 assembled source has **58 lesson files, 43 quiz files, 101 catalogue resources, 517 scaffold steps, 591 worked-example cards, 449 scored/embedded questions**. Three existing timed UTBK mock sets remain unchanged.
* **No existing lesson or quiz JSON file was changed**. The regression test checks SHA-256 digests of all 97 original lesson and quiz files against V13-B. Original browser-local progress keys, IDs, drafts and export/import format are preserved.

### Files changed / technical implications

* Content: 2 lesson JSON + 2 quiz JSON, `data/catalog.json`.
* Interface: `tka.html`, `js/tka.js`, `js/i18n.js`, `css/style.css`.
* Optional scaffold phase model: `js/core.js` plus `data/schemas/lesson.schema.json`. Old scaffolds render exactly as before if phase metadata is absent.
* Tests: historical V12/V13-A count assertions amended to validate their original milestone even when subsequent legitimate resources have been added; V13-C1 test and baseline SHA-256 manifest added; GitHub validation workflow updated.

### GitHub Desktop update on Linux Mint

1. Make a backup, open the **V13-B** repository, Fetch/Pull origin and confirm the right branch.
2. Extract the V13-C1 update ZIP **outside** the repository.
3. Copy the extracted files into the repository, keeping relative paths (`data/`, `js/`, `tests/`, etc.). Never replace or remove `.git`.
4. Review the changed files in GitHub Desktop. In particular, check four new JSONs and catalogue additions. No legacy lesson/quiz JSON should show as edited.
5. From repository root, run:

```sh
python3 tools/validate.py
node tests/v13c1-content.mjs
node tests/v13b-assessment.mjs
```

6. Commit and Push. Wait for the Cloudflare Pages deployment to finish, then open `tka.html` on the public site and test both Materi and both Latihan links.
7. On a real phone, test a complete lesson, answer the three question formats (including clearing/changing selections), view the results, refresh to check locally saved progress, and check an original UTBK mock and backup export/import.

### Recorded acceptance and outstanding checks

* **Passed in development:** `python3 tools/validate.py`; all historical and V13-C1 Node regression suites; Draft 2020-12 lesson/quiz JSON Schema validation; preservation SHA-256 check; ZIP integrity and patch reconstruction; isolated Chromium in-memory tests at mobile width for the TKA page, two lessons, single/multi/category quiz controls, saving, scoring, category feedback and simulation help restrictions.
* **Not verified:** full deployed-origin journeys, independent real-phone usability, bilingual subject-teacher review of all lesson interpretations/translations/distractors, and student learning outcomes. These must be checked before treating the release as classroom-ready.
* **Boundary:** Only TKA-01/TKA-02 are published. TKA-03–10 and dedicated full TKA simulations are **not** included in this release.

### Editorial review priorities

1. Read aloud step explanations with beginning-level students; note any unfamiliar grammar vocabulary.
2. Ask learners to explain why a plausible answer is wrong; note whether they can quote relevant evidence.
3. Review category rows for real ambiguity (supported / contradicted / not mentioned), and verify all passage details.
4. Check all English-first questions and Indonesian glosses with an English teacher before a classroom pilot.
5. Observe pacing through phases and whether learners can reach the A2/B1-length quizzes without guessing.

Original TKA framework mapping and module ordering remain in the supplied V13 instructional blueprint. This update does not claim official TKA accreditation, official item weights, or admission prediction.
