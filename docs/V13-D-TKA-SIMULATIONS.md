# V13-D · Three full TKA-style practice simulations

**Baseline:** user-accepted V13-C5 combined source, including the separate homepage redesign and all ten TKA modules.  
**Release date:** 31 October 2026.  
**Status:** source package prepared and automated checks recorded; live deployment is not claimed.

## Scope

V13-D completes the TKA pathway by adding three original, unofficial practice simulations:

| Resource | Theme | Questions | Passages | Timer |
|---|---|---:|---:|---:|
| `tka-mock-a` | Everyday Communities | 30 | 6 | 45 minutes |
| `tka-mock-b` | Communication and Change | 30 | 6 | 45 minutes |
| `tka-mock-c` | Stories, Science and Sustainability | 30 | 6 | 45 minutes |

Each simulation contains three A2-targeted passages (200–300 words) and three B1-targeted passages (250–350 words). The six texts use descriptive, recount, narrative, procedure, analytical exposition and informational-report contexts. All 18 passages are newly authored for this release.

Each simulation contains ten single-answer, ten multiple-answer and ten category questions. Correct positions for the single-answer items are balanced across A–D (3, 3, 2, 2). Questions assess explicit comprehension, main idea and purpose, vocabulary in context, inference, text structure, genre, narrative appreciation, fact/opinion distinctions, evidence sufficiency and limits of data.

All questions include an Indonesian prompt translation. The question-level explanation and category-row feedback are in Indonesian; choice-specific explanations follow the existing English choice-feedback convention. Every question points to an exact evidence excerpt in its passage. The three simulations are available in both untimed Practice mode and timed Simulation mode; the 45-minute timer applies to Simulation mode.

## Format boundary

The 30-question / 45-minute arrangement is a Langkah English editorial practice specification. It is **not** represented as the official TKA question count, official duration, official scoring rule or a prediction of an official result. The catalogue marks the resources `unofficial: true`; the descriptions and page introduction repeat this boundary. Local exact-set multiple-answer scoring and all-rows-correct category scoring remain platform practice mechanics.

## Integration

- The TKA page lists the three simulations in a dedicated section after the ten topic-practice quizzes.
- Each resource opens the existing `quiz.html` engine; no separate assessment engine or new progress key is introduced.
- Existing TKA topic lessons/quizzes, Grammar, School English, UTBK, the three legacy UTBK mocks, progress snapshots, local drafts and backup/import-export behaviour remain in place.
- The redesigned homepage is inherited from the accepted combined V13-C5 source and its core files are protected by SHA-256 tests.

## Cumulative totals

| Measure | V13-C5 | V13-D |
|---|---:|---:|
| Lessons | 66 | 66 |
| Quizzes | 51 | 54 |
| Catalogue resources | 117 | 120 |
| Scaffold steps | 608 | 608 |
| Explained bilingual cards | 671 | 671 |
| Scored / embedded items | 569 | 659 |
| Published TKA modules | 10 | 10 |
| New full TKA practice simulations | 0 | 3 |
| Existing UTBK mocks | 3 | 3 (unchanged) |

The 90 new questions raise the combined scored/embedded item total from 569 to 659. They do not add lesson steps or example cards.

## Verification

- `python tools/validate.py` validates the catalogue, file paths, JSON structures, question formats, answer indices and evidence references.
- `node tests/v13d-content.mjs` validates the three complete simulations, all 90 keys, passage lengths, mixed question types, Indonesian explanations, balanced single-answer positions, the V13-C5 SHA-256 content baseline and homepage-core preservation.
- All prior Node regression suites remain part of the release check. Their current-page assertions are updated to accept the V13-D stage while retaining the older milestone-specific content checks.
- `python tests/v13d-browser-smoke.py` checks the TKA page, all three mock cards, the 30-question navigator, the 45-minute timer, all three response formats and mobile overflow.
- ZIP integrity and exact patch reconstruction are checked during packaging.

Automated checks do not certify CEFR level, independent teacher approval, learning outcomes, formal accessibility compliance, real-device behaviour or live deployment. A bilingual teacher review and a small learner pilot remain recommended before high-stakes or classroom-wide use.

## Installation

Use `langkah-english-v13d-combined-update-from-v13c5.zip` on the accepted corrected combined V13-C5 Git repository. Extract the patch outside the repository and overlay its contents while preserving `.git`. The complete-site ZIP is for a separate preview/restoration copy; do not extract it over an existing Git repository.
