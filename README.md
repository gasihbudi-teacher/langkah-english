# Langkah English — static learning platform

A complete HTML5/CSS3/vanilla JavaScript application for Indonesian secondary-school learners. No account, build step, server-side code, database, or third-party runtime dependency is required. Educational content is loaded at runtime from JSON.

## Version 6.0 — expanded and clearer lessons (25 October 2026)

**V6 builds directly on V5.** All 45 resource IDs, 234 English-first practice questions and answer choices, Indonesian expandable quiz translations, dedicated Search page, static GitHub/Cloudflare Pages deployment, progress/backup keys and answer positions are preserved.

- **240 new fully explained English examples**: all 30 lessons gain three guided example groups containing 3 beginner examples, 3 contrast/comparison examples and 2 optional longer examples. Each new example has a visible Indonesian translation and a specific Indonesian explanation. Six are displayed by default; two longer examples open in an accessible disclosure.
- **English terminology highlighted in Indonesian educational text** with a consistently coloured/italic label, using explicit `[[English term]]` markers rather than general language detection. Example sentences remain English in separate cards, Indonesian translations and notes are labelled distinctly.
- **30 sentence breakdowns**, **120 vocabulary definitions** (four per lesson), and **30 three-point recaps**. Reading time estimates are updated for expanded lessons.
- **No change to any practice question or correct-answer position.** Lesson feedback retains answer selection during EN/ID interface changes and uses safe markup for highlighted terms.
- **New V6 tests** cover all lesson expansions, escaping, language labelling, protected V5 question fingerprint and source schema; run `node tests/v6-quality.mjs` alongside existing checks.

This is an **unofficial, original AI-assisted educational resource**. The new Indonesian glosses and English grammar examples need independent bilingual teacher review, and the full site still needs manual real-device and interactive browser testing before a production rollout. The authoring environment blocked Chromium navigation, so browser tests could not be completed. Deploy to a Cloudflare preview first.

See `docs/V6-CHANGES.md` and `docs/V6-TEST-REPORT.md` for details and verification steps.

## Version 5.0 — English-first practice, optional Indonesian support, simple lists (25 October 2026)

**This is the full site, ready to upload to a Cloudflare Pages preview (not yet deployed).** It keeps the same GitHub + Cloudflare static configuration, all 45 existing resource IDs, and the browser-local progress/backup format.

- **English-only assessment prompts and answer choices** in all 234 questions. Indonesian explanations and answer discussions are retained.
- **Closed-by-default Indonesian glosses** for all 234 question prompts. **116 question sets** also have manually authored Indonesian choice translations, including all 70 questions in the three complete UTBK mocks and 10-question reading lab. Some grammar-choice forms intentionally remain in English; additional teacher-reviewed choice translations may be added without JavaScript changes.
- **No catalogue filters on the homepage or Grammar/UTBK/School pages.** Every pathway is a grouped list. A standalone `search.html` performs simple text search across the full catalogue.
- **Balanced A–D answer distribution** in four-choice quizzes; full mocks have five answers at each position. This does not substitute for a distractor-quality review.
- **Diagnostic recommendations by weak skill** on results and homepage, with an explicit warning about small diagnostic samples.
- **Automated V5 content-quality checks** integrated with GitHub Actions. Run `node tests/v5-quality.mjs` after editing quizzes or translations.

**Upgrade caution:** unfinished V4 quiz drafts become invalid because answer positions have changed, but saved completed V4 results and lesson progress remain on the original storage keys. Students should finish or back up outstanding attempts before deployment. Independent bilingual teacher review and actual mobile browser testing remain required. Chromium browser navigation was blocked in the authoring environment, so no claim is made that real-browser tests have passed.

See `docs/V5-CHANGES.md` and `docs/V5-TEST-REPORT.md` for precise coverage, limitations and preview acceptance checklist.

## Historical: Version 4.0 — expanded learning catalogue and student tools (25 October 2026)

**V4 is ready to upload for preview but has not been deployed by this ZIP.** It keeps the V3 static Cloudflare Pages + GitHub setup and all old resource and local progress IDs. New files extend rather than replace existing content. A V3 backup is recommended before deploying.

**45 published resources:** 30 lessons and 15 quizzes, totalling 234 scored questions (including embedded lesson practice). Three original, unofficial **20-question / 20-minute UTBK English Literacy practice simulations** (`utbk-mock-a` to `utbk-mock-c`) plus a 10-question reading lab, a 12-question entry diagnostic, a 12-question advanced grammar check, and new teaching materials. All 20 grammar roadmap topics now have lessons. Grades 9–12 have at least one dedicated lesson each, though this is not a full year-by-year curriculum.

**New student experience:** four-stage beginner-to-UTBK learning route; skill breakdown in quiz results; approximate diagnostic recommendations; JSON download/restore of this browser's progress and unfinished drafts; improved preservation of inline exercise selections and quiz feedback during ID/EN interface changes. Restoring a backup **replaces** local browser progress after explicit confirmation. Backup files contain personal answers and activity; treat them as private.

**Validation:** `python tools/validate.py`, `node tests/scoring.mjs` and `node tests/v4-quality.mjs` passed. `.github/workflows/validate.yml` runs the same checks in GitHub Actions. Browser navigation in the generation environment was blocked by administration policy, so all interactive flows still require preview testing. See `docs/V4-CHANGES.md` and `docs/V4-TEST-REPORT.md` for release notes, deployment steps, limits and a manual acceptance checklist.

**Curriculum/accuracy notice:** Original AI-assisted lessons and questions are unofficial. Structural answer/evidence checks do not replace independent English-teacher review. The three full simulations match 2026 English Literacy *question count and duration* at https://snpmb.id/fr/ but are not official exam predictions. The project remains free, static, local-first and without accounts or paid dependencies.

## Historical: Version 3.0 — grammar starter pack + dedicated libraries

**Default interface language is Bahasa Indonesia** for new visitors; the EN/ID selector remains available. Lesson instructions, grammatical explanations, inline exercise feedback, quiz questions/instructions and answer discussions are written in Indonesian. English sentences, answer options where students must evaluate English, and English reading passages intentionally remain in English. A previously saved EN/ID preference is retained. There is no automatic translation of educational content.

**Dedicated pathway pages:** `grammar.html`, `utbk.html`, and `school.html`. Homepage cards and navigation now open these individual pages instead of scrolling to `#library`. Their collections, grades, search and filters read the same central `data/catalog.json`; each actual lesson and quiz still uses `lesson.html?id=...` or `quiz.html?id=...`.

**Beginner pack:** Five new lessons with Indonesian explanations, three embedded exercises each, and five quizzes with eight questions each: Parts of Speech, Sentence Structure, Simple Past Tense, Present Continuous Tense, and Basic Questions & Negatives. Two existing grammar lessons (Simple Present and Subject–Verb Agreement) were also translated to Indonesian, along with existing UTBK/School teaching explanations. The existing IDs and local progress key have not changed. Total: **10 lessons, 9 quizzes, 80 questions** including embedded lesson exercises.

**Remaining scope:** This is a substantial beginner-content update, not a finished Grade 9–12 or complete UTBK curriculum. Intermediate/advanced grammar, additional school lessons, and full-length UTBK mock examinations still need to be authored and teacher-reviewed. Preview and manually test the new project before publishing it to students.

**Validation:** `python tools/validate.py`, `node tests/scoring.mjs`, and `node tests/v3-quality.mjs` (now checking V3) passed. A browser navigation test was blocked by environment policy; a static mobile rendering preview was checked at 390px width with zero horizontal overflow. See `docs/V3-TEST-REPORT.md`.

## Start locally

Do not open index.html through file://: browsers restrict JSON fetching in that context. Serve this directory over HTTP, for example:

```sh
python -m http.server 8000
```

Open http://localhost:8000. Python is only a local preview convenience, not a production requirement. Any static HTTP server works.

## Pages and modules

- index.html — homepage, lesson pathway links, progress, diagnostics and recent activity.
- grammar.html, utbk.html, school.html — grouped lists for all published materials; no on-page filters.
- search.html — dedicated sitewide text search (the only main search field).
- lesson.html?id=RESOURCE_ID — universal lesson renderer and embedded English-first practice with optional Indonesian glosses.
- quiz.html?id=RESOURCE_ID — shared practice/simulation engine, passage view, timer, navigator, flags, confirmation, saved draft.
- results.html?attempt=ATTEMPT_ID — locally stored results with answer choices, explanations, evidence and passages.
- css/style.css — shared responsive styles, keyboard focus, mobile layout.
- js/core.js — loading, validation, escaping, block rendering, scoring and progress repository.
- js/home.js, pathway.js, search.js, lesson.js, quiz.js, results.js, translations.js — page controllers and optional translation renderer.
- data/catalog.json — the sole resource index and editable topic taxonomy.
- data/lessons and data/quizzes — educational files.
- data/schemas — JSON schemas describing the authoring contract.
- docs/AUTHORING.md — detailed AI content prompt and publishing process.
- tools/validate.py — optional standard-library content validator.
- tests/scoring.mjs — Node-based test of the real scoring/quiz validation exports.

## Starter library

Ten lessons: seven beginner grammar lessons, one UTBK reading strategies lesson, and one Grade 9 / one Grade 10 reading lesson.
Nine quiz resources: five new eight-question grammar topic tests, plus the original grammar assessment, UTBK-style reading practice, and two school reading exercises.
The courtyard passage is original. All sample educational material is AI-generated and unofficial. Keys were checked against grammar rules or explicit passage evidence; this is internal content review, not independent official certification. Content remains subject to teacher review before high-stakes use.

All requested grammar levels, reading skills, grade topic suggestions and search filters are configured. Unpublished topics are deliberately not disguised as completed lessons. Grades 11–12 are expandable catalog destinations; Grade 12 already includes the reading guide and reading lab. Grade 11 initially shows an honest empty state. Each school grade can list materials, practice and tests via the same metadata; the Grade 9–10 samples demonstrate all three.

## Learning modes

Learning mode uses the reading strategy lesson with guided examples and interactive questions. Every quiz can run in untimed Practice (optional immediate feedback) or Simulation (feedback only after submission). Timed simulations use an absolute deadline; leaving/closing the page does not pause the clock. Reopening the quiz offers Resume; an expired resumed attempt auto-submits. Starting again intentionally discards that quiz’s unfinished draft.

The official SNPMB framework lists English Literacy as 20 questions / 20 minutes and emphasizes finding, understanding, evaluating and reflecting on information in science, social-humanities and personal contexts. Reference: https://snpmb.id/fr/ (consulted 25 October 2026). The five-question demo uses a proportional five-minute timer, not a misleading full-length simulation. `referenceFormat` records the official reference, whereas `questionCount` and `durationSeconds` control the actual quiz. To publish a full practice simulation, supply 20 distinct reviewed questions and set questionCount=20 and durationSeconds=1200. Do not repeat five questions to pretend to provide twenty.

## Publish new content — no HTML or core JS changes

1. Copy a corresponding JSON example in data/lessons or data/quizzes.
2. Give it a unique stable lowercase-hyphenated ID. Keep the content ID equal to the catalog ID.
3. Register one metadata object in catalog.resources, with the relative file path.
4. Assign any number of placements, e.g. grammar, school Grade 11, UTBK grammar foundations. One file serves every placement.
5. Add appropriate grammarTopics, readingSkills, tags, relatedLessons. The dedicated search.html page searches title, description, skills, topics and tags.
6. Set quiz kind to practice or test. The catalogue lists all lesson, practice and test resources without requiring type filters.
7. Validate with `python tools/validate.py`; review wording, answers and explanations; preview all views; redeploy.

Adding a resource never requires a new HTML page or a JavaScript edit. Adding a new renderer block type does require code because components define the supported content format. Use the existing blocks for routine expansion. JSON is plain text, not arbitrary HTML; markup is escaped to reduce injection risks.

## Deployment: Cloudflare Pages

Git-based deployment:
1. Extract the ZIP and push the contents of english-learning-platform to a GitHub or GitLab repository. index.html must be at the published root.
2. Cloudflare dashboard → Workers & Pages → Create application → Pages → Import an existing Git repository.
3. Select the repository and production branch (usually main).
4. Framework preset: None. Build command: `exit 0`. Build output directory: `.` (this project’s root, containing index.html). Do not choose js/ or data/ as the output directory.
5. Save and deploy. Test the production URL, a lesson, a quiz, a refresh and results.
6. Commit new JSON and the updated catalog to publish later additions.

Alternatively create a Pages Direct Upload project and upload the extracted site folder, or a site ZIP with index.html at its root. Deployment UI wording can change. Official static HTML guide: https://developers.cloudflare.com/pages/framework-guides/deploy-anything/ .

For Tiiny.host, upload a ZIP with index.html, css/, js/, and data/ directly at its root. Do not upload the parent ZIP layout if its only top-level entry is a directory. The included project ZIP has index.html directly at its root and can be used for this.

## Local storage and privacy

There is no registration, telemetry, remote AI API, or progress transmission. `langkah.progress.v1` holds completed lesson timestamps, up to 100 scored attempts and up to 30 recent activities. Each attempt includes a snapshot of its questions and passages so a future content edit does not rewrite old results. Unfinished quiz drafts use `langkah.draft.ID`. Last-result fallback uses sessionStorage. Browser/device changes, private browsing and clearing site data can lose progress. Storage failures show a warning; durable recovery is not guaranteed when storage is blocked or full. For classroom shared devices, clear site data between students.

Scores = correct / total × 100, rounded to the nearest integer. All items have equal weight. Incorrect and unanswered are separate counts; unanswered earns zero. This is a practice percentage, not an official UTBK scaled score. Local tests are not secure high-stakes examinations: keys and local progress are visible and editable in browser tools.

## Accessibility and future integration

Semantic headings, labeled filters, keyboard-operable buttons, visible focus, skip navigation, text-based progress and responsive passage layouts are included. Test with your target screen readers and mobile devices before a large rollout; no formal WCAG certification is claimed. No external fonts or images are required.

The progress repository interface in core.js isolates storage access for a future cloud adapter. Catalog IDs, explicit placements, lesson blocks, question IDs and attempt snapshots provide boundaries for recommendations, accounts, analytics, flashcards and an admin CMS. These features are not implemented. Cloud sync should handle consent, user identity, migration, conflict resolution and access controls rather than simply copying localStorage to a public database.

## Validation and acceptance

Run `python tools/validate.py` for file, link, ID, block, answer-range and evidence checks. If Node is available, `node tests/scoring.mjs` tests scoring with all-correct, all-wrong, mixed and unanswered submissions plus invalid quiz rejection. Neither tool is required for hosting.

Manual checks: filter pathways and grades; open both lesson styles; read Indonesian teaching explanations; answer inline practice; mark completed and refresh; choose both quiz modes; navigate, flag and resume; submit with unanswered items; inspect review and retake; let a timer expire; test a nonexistent resource; inspect 390px and desktop widths. Missing/invalid resources display an actionable library link rather than a blank page.


## Version 2.0 (2026-10-25)

Langkah English V2 keeps the original static HTML/CSS/JavaScript structure, all original learning resources, their IDs, quiz scoring, and the `langkah.progress.v1` localStorage key. There is no build system, runtime CDN dependency, or server requirement.

**Interface language:** select **EN / ID** in the header. The setting is saved under `langkah.language.v2` and translates interface labels. Educational materials remain in their original language; optional Indonesian lesson explanations remain independently show/hide-able.

**Learning path:** grammar roadmap, grade cards, a student-friendly entry area, and the searchable library are generated from `data/catalog.json`. A blank category clearly says that content is coming soon. The existing library URL and `lesson.html?id=...` / `quiz.html?id=...` links still work.

**Optional catalog metadata:**

- `order`: non-negative integer ordering lessons within a pathway (smaller comes first).
- `estimatedMinutes`: positive integer display estimate for lessons.
- `prerequisites`: array of existing lesson IDs recommended before this one (nothing is locked).
- `examFormat`: `sample`, `topic`, or `full` for quiz cards/intros; if `full`, the JSON quiz `referenceFormat.questionCount` and `referenceFormat.durationSeconds` must exactly match the actual quiz. Do not label a quiz `full` unless it truly matches the reference format.

All fields above are **optional**. Adding any new lesson or test continues to require only the new JSON file and a `catalog.json` entry. See `docs/AUTHORING.md`.

**Deployment:** With the GitHub repository root containing `index.html`, Cloudflare **Pages** requires no framework, build command `exit 0` and output directory `.`. Push all updated files to the existing repository to redeploy. Do not upload the ZIP itself into the repository. Back up or tag the previous working commit before replacing files.

**Testing:** Run `python tools/validate.py` and `node tests/scoring.mjs` locally. Preview with `python -m http.server 8000` from the project root to allow JSON to load via `fetch`. An interactive browser check of lesson/quiz flows is recommended before deploying. See `docs/V2-CHANGES.md` for changes.
