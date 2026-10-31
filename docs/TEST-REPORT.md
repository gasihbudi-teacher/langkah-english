# V13-C3 current acceptance report

- Current source: corrected combined V13-C2 baseline plus TKA-05 and TKA-06.
- Catalogue: 109 resources (62 lessons, 47 quizzes).
- TKA-05/TKA-06: 25 new scaffold steps, 20 explained cards, 6 embedded practice items, and 24 quiz questions.
- Current aggregate: 563 scaffold steps, 631 explained cards, 509 scored/embedded items; three original UTBK mocks unchanged.
- Content tests require A2 (200–300 words) and B1 (250–350 words) passages, exact evidence quotes, 4/4/4 response formats, balanced single-answer keys, Indonesian explanations and translated prompts/options.
- `tests/v13c3-content.mjs` verifies SHA-256 preservation of all 105 V13-C2 lesson/quiz files.
- `tests/v13c3-browser-smoke.py` exercises all six published TKA lessons/quizzes, the two new lesson renderers, all three response formats and 390px mobile layout.
- The automated checks do not certify external CEFR levels, teacher approval, classroom outcomes, WCAG compliance, live deployment or real-device behaviour.
