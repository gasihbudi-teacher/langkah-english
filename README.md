# Langkah English — static learning platform

A complete HTML5/CSS3/vanilla JavaScript application for Indonesian secondary-school learners. No account, build step, server-side code, database, or third-party runtime dependency is required. Educational content is loaded at runtime from JSON.

## Start locally

Do not open index.html through file://: browsers restrict JSON fetching in that context. Serve this directory over HTTP, for example:

```sh
python -m http.server 8000
```

Open http://localhost:8000. Python is only a local preview convenience, not a production requirement. Any static HTTP server works.

## Pages and modules

- index.html — pathway cards, catalog search/filtering, progress and recent activity.
- lesson.html?id=RESOURCE_ID — universal lesson renderer and embedded practice.
- quiz.html?id=RESOURCE_ID — shared practice/simulation engine, passage view, timer, navigator, flags, confirmation, saved draft.
- results.html?attempt=ATTEMPT_ID — locally stored results with answer choices, explanations, evidence and passages.
- css/style.css — shared responsive styles, keyboard focus, mobile layout.
- js/core.js — loading, validation, escaping, block rendering, scoring and progress repository.
- js/home.js, lesson.js, quiz.js, results.js — page controllers.
- data/catalog.json — the sole resource index and editable topic taxonomy.
- data/lessons and data/quizzes — educational files.
- data/schemas — JSON schemas describing the authoring contract.
- docs/AUTHORING.md — detailed AI content prompt and publishing process.
- tools/validate.py — optional standard-library content validator.
- tests/scoring.mjs — Node-based test of the real scoring/quiz validation exports.

## Starter library

Five lessons: Simple Present Tense, Subject–Verb Agreement, reading strategies, Grade 9 descriptive reading, Grade 10 recount reading.
Four quiz resources: five-question grammar assessment, five-question UTBK-style reading practice, four-question school topic test, two-question school practice.
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
5. Add appropriate grammarTopics, readingSkills, tags, relatedLessons. Search uses title, description, skills, topics and tags.
6. Set quiz kind to practice or test. The Content type filter maps lesson to Study Materials, quiz/practice to Practice Exercises, quiz/test to Topic Tests.
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

Manual checks: filter pathways and grades; open both lesson styles; toggle Indonesian text; answer inline practice; mark completed and refresh; choose both quiz modes; navigate, flag and resume; submit with unanswered items; inspect review and retake; let a timer expire; test a nonexistent resource; inspect 390px and desktop widths. Missing/invalid resources display an actionable library link rather than a blank page.


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
