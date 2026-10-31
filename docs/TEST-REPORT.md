# V13-C4 current acceptance report

- Current source: user-accepted corrected combined V13-C3 baseline plus TKA-07 and TKA-08.
- Catalogue: 113 resources (64 lessons, 49 quizzes).
- TKA-07/TKA-08: 22 new scaffold steps, 20 explained cards, 6 embedded practice items and 24 quiz questions.
- Current aggregate: 585 scaffold steps, 651 explained cards, 539 scored/embedded items; three original UTBK mocks unchanged.
- Content tests require A2 (200–300 words) and B1 (250–350 words) full passages, exact evidence quotations, 4/4/4 response formats, balanced single-answer keys, Indonesian explanations and translated prompts/options.
- `tests/v13c4-content.mjs` verifies SHA-256 preservation of all 109 V13-C3 lesson/quiz files.
- `tests/v13c4-browser-smoke.py` exercises all eight published TKA lessons/quizzes, both new lesson renderers, all three response formats and 390px mobile layout.
- Automated checks do not certify external CEFR levels, teacher approval, classroom outcomes, WCAG compliance, live deployment or real-device behaviour.
