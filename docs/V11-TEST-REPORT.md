# V11 — Test report (26 October 2026)

**Baseline:** exact uploaded `langkah-english-v10-redesign.zip`.

### Automated checks

- `python3 tools/validate.py`: PASS; 93 resources and 389 scored/embedded questions, references and links.
- `node tests/scoring.mjs`: PASS.
- `node tests/v2-quality.mjs` through `node tests/v9-quality.mjs`: PASS; historic content and progress compatibility invariants.
- `node tests/v11-quality.mjs`: PASS; all 54 unique scaffolds have 5–10 distinct topic steps, total 469, with 469 bilingual worked mini-examples, 469 revealable feedback prompts, and 34 connected bilingual texts; single Grade 10 poster asset included.
- `node --check js/core.js`: PASS.
- Python `jsonschema` against `data/schemas/lesson.schema.json`: PASS for all 54 lessons.
- Isolated Chromium DOM/CSS smoke harness: PASS on five representative lesson renderings at **390px and 1280px**; 10 microstep cards, revealable feedback, poster graphic, no horizontal overflow in those fixtures. These are **in-memory rendering fixtures**, not full navigation.
- JSON Schema validation can be run using the local `jsonschema` library; the schema accepts a variable-length scaffold (3–20 steps), optional connected models and comprehension feedback.

### Scope retained

The catalogue, all 39 quizzes, lesson question IDs, grading and answers, existing `example_group` cards, embedded graded practice, the three UTBK mocks, resource IDs and the local progress storage key are unchanged. No score/history migration is required.

### Manual and browser caveats

Full Chromium navigation to localhost and `file://` was blocked by the authoring environment (`ERR_BLOCKED_BY_ADMINISTRATOR`). Therefore this report **does not claim a passing end-to-end browser navigation test**. HTML/CSS and the expanded 10-step pages still require real-phone and preview-site checking: horizontal overflow, reading fatigue, keyboard-accessible self-check disclosures, normal quiz navigation, backup import/export, and passage/image readability. The next acceptance test should inspect at least the four representative subjects specified in the release guide.

### Teacher-review caveat

Examples and explanations are original or adapted from V10's AI-assisted authoring content. Internal checks do not substitute for a bilingual English teacher reviewing translations, grammatical precision, connected-passage coherence, step-to-example relevance, and potential misconceptions. No third-party classroom study, accessibility audit, or official exam equivalence is claimed.
