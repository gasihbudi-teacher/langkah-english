# Langkah English V2 — Validation report

Date: 25 October 2026.

## Checks actually executed

- **PASS:** `python tools/validate.py` — 9 resources, 25 questions including embedded lesson practice; verified JSON parsing, resource references, link paths, choices, answer ranges, and reading evidence.
- **PASS:** `node tests/scoring.mjs` — actual scoring function tested for correct, incorrect, blank, invalid answer and invalid timer scenarios. The test adapts the unchanged scoring export to the new UI translation import.
- **PASS:** `node tests/v2-quality.mjs` — all static interface labels have English and Indonesian translations; HTML file and asset references resolve; no duplicate static element IDs; the original progress and quiz draft keys are retained.
- **PASS:** JavaScript syntax checks of every module using Node `--check --input-type=module`.
- **PASS:** JSON Schema 2020-12 validation of the new catalog metadata using the Python `jsonschema` library, plus original lesson and quiz validators.
- **PASS:** Source-level comparison confirms that all 9 original educational JSON files under `data/lessons/` and `data/quizzes/` are byte-for-byte unchanged.
- **PASS:** ZIP archive integrity and root-file structure verification.

## Not independently completed

Interactive Chromium navigation was attempted using Playwright, but the testing environment blocked browser navigation (`net::ERR_BLOCKED_BY_ADMINISTRATOR`) even on local pages. Therefore, live clicking, mobile visual layout, actual persistence across page transitions, and exam time auto-submission have **not** been independently verified for V2; please test these on the deployed preview before giving the site to students. The successful V1 browser tests described in the original document are not a substitute for V2 browser testing.

## Suggested manual smoke test after preview deployment

1. On a phone and desktop, open `index.html` over HTTP and verify no horizontal scrolling.
2. Switch EN/ID; refresh and confirm the interface choice is remembered without translating the English lesson text.
3. Filter Grammar Academy / Beginner and open Simple Present Tense.
4. Show/hide Indonesian lesson explanations; answer an embedded practice question; complete a lesson and reload to confirm the progress indicator.
5. Open the Courtyard reading quiz and try Practice Mode. Answer several questions, use Next/Previous, show an explanation, and finish the quiz.
6. Retake in Simulation Mode, flag a question, refresh or leave and reopen the quiz to verify a saved draft. Submit and review score, explanations and textual evidence.
7. Revisit the homepage and confirm the completed lesson and exam appear in recent activity.
8. Check Grade 11 gracefully reports that material is coming soon rather than linking to nonexistent pages.
9. Check the site from a second device and understand that browser-local progress will not transfer.
