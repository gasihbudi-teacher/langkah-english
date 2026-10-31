# V13-E1-R1 — Renderer correction

**Status:** source update prepared from the uploaded V13-E1 complete-site
package; not deployed. **Date:** 31 October 2026.

## Cause

The `lessonExampleCard()`, `scaffoldCard()`, `scaffoldModel()` and
`self_check` renderer paths inserted fixed headings irrespective of a
lesson's topic or objectives. Grade 9 lesson content had improved, but
these shared headings remained visible.

## Changes

- `js/core.js`: render the actual English example and authored reasoning
  without mandatory generic labels. Leave translations available under
  accessible `<details>` controls. Show a scaffold review only when an
  authored `check` exists. Use a short `Periksa jawaban` disclosure rather
  than an instruction that is repeated everywhere. Keep exercise scoring,
  answer positions and IDs unchanged.
- `css/style.css`: append styles for optional translations and factual
  reading questions; existing styles (including the homepage) are untouched.
- `tests/v13e1-presentation.mjs`: inspect all 66 lesson renders, the
  31 School English lessons, the authored check count, translation access,
  safe HTML escaping, and absence of compulsory labels.
- `tests/v13e1-presentation-browser.py`: verify keyboard-disclosable content,
  check reveal behaviour, labels, and no overflow in Grade 9, Grade 10,
  Grade 12 Caption Text, and TKA reading foundations at 390px width.
- Historical tests for the homepage now check a SHA-256 of the unchanged
  stylesheet prefix, rather than incorrectly requiring the appended lesson
  styles to match the older file's complete checksum.

## Important limitation

This is a presentation correction; other School lessons still contain
previously authored explanations and questions. A renderer change alone
cannot certify that their actual teaching tasks are pedagogically varied.
A bilingual teacher review, real-device inspection and site acceptance
remain necessary. Do not start Lesson 2 on the strength of this fix alone.

## Installing

**Fresh source:** extract `langkah-english-v13e1-r1-complete-site.zip`
into a new directory, not over your Git repository.

**Already using V13-E1:** back up the repository, extract
`langkah-english-v13e1-r1-update-from-v13e1.zip` outside the repository,
then overlay the contained relative paths into the correct V13-E1 tree.
Review the Git diff before committing. Never overwrite `.git`.

To confirm this package, run:

```sh
python tools/validate.py
for f in tests/*.mjs; do node "$f"; done
python tests/v13e1-browser-smoke.py
python tests/v13e1-presentation-browser.py
```

The Chromium harness uses an isolated DOM environment rather than the
live Cloudflare deployment; browser tests may require the installed
Playwright dependencies and `/usr/bin/chromium` in that environment.

## Documentation delivery

Every release must provide the complete-site ZIP, its baseline-specific
incremental patch ZIP, and a standalone updated `PROJECT-HANDOVER.md`
together. Matching handover and changelog copies must also be included
in the archives. This requirement is recorded in the living handover.
