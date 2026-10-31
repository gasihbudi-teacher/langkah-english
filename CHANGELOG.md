# Langkah English --- Changelog

## 2026-10-31 --- V13-E1: Grade 9 Lesson 1

### Educational content

-   Rewrote `grade9-reading` with four measurable objectives and eight
    topic-specific steps.
-   Made scaffold checks optional and purposeful: seven steps have
    paired check/reveal fields; one step has no check.
-   Added a 128-word connected bilingual descriptive passage.
-   Added ten explained examples, four guided practice questions, an
    independent writing prompt and eight end-of-lesson vocabulary items.
-   Added `grade9-place-reading-check`, a dedicated eight-question
    assessment on an unfamiliar descriptive passage.

### Platform and quality assurance

-   Updated catalogue metadata and registered the Grade 9-only
    assessment.
-   Updated lesson schema and Python authoring validator to allow
    omitted scaffold checks while requiring check/reveal pairs.
-   Updated historical regression tests to exempt only the intentionally
    revised Grade 9 Lesson 1 content; the V13-E1 test protects the
    replacement and verifies Grade 10/shared reading resources remain
    unchanged.
-   Added Chromium DOM browser smoke test.

### Verification

-   `python tools/validate.py`: PASS.
-   All 21 Node regression suites: PASS.
-   `tests/v13e1-browser-smoke.py`: PASS; desktop/mobile overflow 0px;
    no page errors.
-   Live GitHub/Cloudflare deployment: not performed.

### Next

-   User previews and reviews Grade 9 Lesson 1.
-   Apply requested corrections before starting Grade 9 Lesson 2.
