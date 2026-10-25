# Langkah English V2 — Change log

## Improvements

- Modern responsive homepage with four student entry choices, three learning pathways, suggested grammar roadmap, grade cards, and a refined searchable resource library.
- English/Indonesian interface toggle (saved in `langkah.language.v2`). Lesson content and quiz questions are not translated.
- More informative student progress dashboard, recent activity list, unfinished-quiz resume link, and recommended lesson.
- Cleaner lesson layout, optional time estimates/prerequisite notices, related content, previous/next navigation, and preserved lesson-completion state.
- Updated quiz-introduction cards, clearer timed/untimed modes, question interface, navigation, and results review.
- Dynamic quiz type labels (`examFormat`) rather than an always-present “not full length” label. Full-length labels must match the quiz's declared reference configuration.
- All 9 existing content resources, lesson/quiz IDs, JSON content and v1 saved progress data preserved.

## Original files preserved

All content under `data/lessons/` and `data/quizzes/` remains unchanged. Existing URL parameters for lessons, quizzes and filters are kept.

## Files modified

`index.html`, `lesson.html`, `quiz.html`, `results.html`, `css/style.css`, `js/core.js`, `js/home.js`, `js/lesson.js`, `js/quiz.js`, `js/results.js`, `data/catalog.json`, `data/schemas/catalog.schema.json`, `tools/validate.py`, `README.md`, and `docs/AUTHORING.md`.

## Files added

`js/i18n.js`, `docs/V2-CHANGES.md`, `docs/V2-TEST-REPORT.md`.

## Compatibility notes

No authentication, database, build tools, external font requests, or runtime packages were added. Browser progress continues to use `langkah.progress.v1`; quiz drafts continue using `langkah.draft.*`. A single resource file and catalog record still publishes a lesson or quiz.
