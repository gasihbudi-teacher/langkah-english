# Acceptance test report

Tested with headless Chromium through Playwright over a local HTTP server.

- PASS: Homepage loads all 9 resources
- PASS: Grade 11 honest empty state
- PASS: Search and reset filters
- PASS: Lesson rendering, bilingual toggle, inline practice, persistent completion
- PASS: Practice feedback, flags, navigation, refresh/resume, partial submission and 20% scoring
- PASS: Simulation passage, hidden feedback, perfect score and evidence review
- PASS: Expired absolute deadline auto-submits resumed attempt
- PASS: Unknown-resource error handling
- PASS: 390px mobile layout: homepage, lesson, and simulation have no horizontal page overflow
- PASS: No uncaught JavaScript browser errors during acceptance checks

- PASS: Python authoring validator: 9 resources, 25 questions including embedded practice; JSON parsing, IDs, paths, related links, answer ranges and exact evidence quotations.
- PASS: JSON Schema validation of catalog and every educational file.
- PASS: Node syntax validation for all five JavaScript modules.
- PASS: Tests of the actual scoring function for correct, incorrect, mixed and unanswered responses, and rejection of invalid quiz counts, timers and keys.

Content review: answer keys checked against the sample grammar patterns and original passage evidence; not independently certified. Browser testing is a representative functional acceptance pass, not exhaustive cross-browser, security or WCAG certification.
