# Langkah English V4 — changes and release notes

Date: 25 October 2026. **This ZIP contains source files; it does not update the live Cloudflare Pages site automatically.**

## What's new

- **Three full-length practice simulations:** `utbk-mock-a`, `utbk-mock-b` and `utbk-mock-c`. Each contains 20 distinct original questions across four different passages with a 20-minute timer. Contexts include science, society and personal narratives. All reading questions include evidence quotes, answer keys and Indonesian explanations. They are **unofficial practice**, not copied SNPMB questions or score predictors.
- **UTBK reading lab:** 10 questions and two additional shorter passages to practise reasoning with evidence before attempting full simulations.
- **Diagnostic:** 12 foundation/reading questions with an approximate next-step recommendation. The results screen shows a skill breakdown where questions have skill tags. This is formative feedback, not a psychometric placement test.
- **All 20 grammar roadmap topics now have a lesson:** the existing seven Beginner topics plus seven Intermediate and six Advanced topics. New lessons contain Indonesian teaching text, English examples, a common error explanation and three interactive checks. An additional 12-question advanced grammar topic test is included. Most intermediate lessons direct students to the general diagnostic; dedicated topic tests for every intermediate lesson remain future work.
- **Grade-specific content:** new Grade 9 narrative and Grade 10 descriptive lessons; Grade 11 exposition and explanation lessons; Grade 12 critical reading and academic vocabulary lessons. Some shared grammar and UTBK resources appear under more than one grade. Curriculum breadth and individual textbook alignment remain partial.
- **Learning journey on homepage:** four clickable steps from beginner reading to a full mock and an entry point to the diagnostic quiz.
- **Local progress backup and restore:** JSON export/import of completed lessons, saved attempts and unfinished quiz drafts. Imports validate expected structure and ask permission before replacing this browser's data. Students should keep the exported file private because it includes their quiz answers and activity.
- **Less disruptive language switching:** current inline practice selections and feedback survive EN/ID interface changes; checked answers in an active practice quiz stay visible when language changes.
- **GitHub Actions workflow:** `.github/workflows/validate.yml` runs Python content validation and Node-based tests before new changes are accepted. It does not modify Cloudflare settings or create deployment credentials.

## Totals

45 catalogue resources: 30 lessons and 15 quizzes. 234 assessable items in quiz files and inline lesson practice combined. There are 60 questions across the three full-length UTBK simulations. These figures are generated from the catalogue and content files and are not unique published-question counts across all placements (several resources are shared).

## Compatibility

The site remains static HTML, CSS, vanilla JS and JSON, with no build process, accounts, databases, payments or external runtime dependencies. Old catalog IDs and `langkah.progress.v1` and `langkah.draft.*` storage keys were retained. Existing attempts are not migrated or overwritten by a normal redeployment. **Do not delete student browser storage during deployment.**

## How to publish to the existing GitHub + Cloudflare Pages site

1. In GitHub, create a backup branch or tag for V3 before modifying the site.
2. Extract V4. Copy the **contents** (including `index.html`, `.github/`, `css/`, `data/`, `js/`) into the repository root. Do not put the full site inside another nested directory.
3. Run `python tools/validate.py`, `node tests/scoring.mjs`, `node tests/v4-quality.mjs` and check the GitHub Actions workflow. Use a preview branch/build to inspect content on phones and desktops, then merge to the Cloudflare Pages production branch.
4. Leave Cloudflare Pages framework preset **None**, build command `exit 0`, output directory `.` (or the equivalent current settings). This package doesn't need environment variables, Workers, D1, KV or new third-party services.
5. On the resulting `https://langkah-english.pages.dev`, test the homepage, grades, all three full mocks, practice/simulation, timer expiry, language switching, results, and backup export/import. The full mock result must show skill breakdown. Preview and independent teacher review are recommended before classroom use.

**Important:** Updating local ZIP files does not grant access to or automatically update the GitHub repository or Cloudflare account.

## Known limits and planned follow-ups

- Teaching content is AI-assisted and has passed *structural and internal answer/evidence checks*, not external subject-specialist review. Have teachers check question validity, appropriate difficulty, source framing and alignment to any specific current school curriculum.
- Three 20-question UTBK simulations match the cited **2026 English Literacy section question-count/duration**, not necessarily the official exam's exact style or difficulty. Format source: https://snpmb.id/fr/. This is not affiliated with SNPMB.
- Grade-specific coverage is uneven. Some older entries are shared across Grades 9–10. Intermediate grammar and Grade 11–12 curricula are still less thorough than a full yearly course.
- Progress uses browser localStorage, without account synchronization or cloud backup. Export/import is intentionally manual. Storage may be lost if a browser or device is reset. Scores are practice percentages, not scaled UTBK scores.
- No audio pronunciation, vocabulary flashcards, full teacher dashboard, learning-management-system integration, content editor, or secure high-stakes exam mode is implemented.
- No interactive local Chromium run could be completed in the generation environment: navigation was rejected with `ERR_BLOCKED_BY_ADMINISTRATOR`. Automated content, scoring, backup and static-link checks passed. A human should complete cross-browser testing on the preview URL before publishing to students.
