# V6 Test report — 25 October 2026

## Automated validation

Run from the extracted project root:

```sh
python tools/validate.py
node tests/scoring.mjs
node tests/v2-quality.mjs
node tests/v3-quality.mjs
node tests/v4-quality.mjs
node tests/v5-quality.mjs
node tests/v6-quality.mjs
```

`.github/workflows/validate.yml` runs these same commands with Node 22 and Python 3.12. The new lesson JSON also passes Draft 2020-12 `jsonschema` validation when that optional Python package is available.

The V6 test verifies all 30 lessons have eight additional English examples with nonempty Indonesian translations and specific explanations, 3 groups with progressive display (3/3/2), 4 vocabulary definitions, a sentence breakdown, and a three-point summary. It also verifies the safe escaping and HTML semantics of the renderer, the new inline-term style, and a pinned SHA-256 fingerprint of all 234 V5 question stems, options, translations and answer positions. V5's checks confirm English-only practice prompts and choices, Indonesian question glosses, and consistent answer translation order.

## Verification limitation

A local static HTTP server responded successfully, but Chromium could not reliably load the test site and produce a DOM/screenshot in this environment. **Do not interpret source-level success as full browser verification.** Independent language-teacher review is also outstanding.

## Required Cloudflare preview checklist

1. Open Grammar → Simple Present. Verify that English words such as *verb* are highlighted in Indonesian prose while full example sentences display as separate English text.
2. Verify vocabulary, six visible guided examples, sentence breakdown, and a closed disclosure labelled as two additional examples. Open the disclosure and check both longer examples.
3. Check translations and teaching notes beneath **all eight** examples; check the three-point recap and the practice section after the lesson.
4. Answer a lesson practice question incorrectly and correctly. Confirm feedback displays Indonesian text correctly and optional question translation remains collapsed until clicked.
5. Switch the EN/ID interface language mid-practice. Confirm current choice/feedback is retained.
6. Open one advanced grammar, a Grade 9, Grade 11 and Grade 12 lesson, plus an UTBK reading lesson; check consistent formatting and no overflowing text on a narrow Android/iPhone viewport.
7. Visit UTBK mocks, confirm three 20-question / 20-minute sessions still run and correct answers have not shifted. Try Reading Lab translation choices.
8. Test keyboard focus for `<details>` example disclosures, text contrast, screen reader language switching, and zoom to 200%.
9. Verify site search, existing completed lesson state, quiz history and progress export/import using a disposable browser profile.
10. Arrange bilingual English teacher review before assigning V6 materials or advertising realism/official alignment.
