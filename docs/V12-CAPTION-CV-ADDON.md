# Langkah English — Caption Text + CV Add-on (V11 → V12 pilot)

This is a small **changed-files release**, not a replacement for the whole website. Source baseline: `langkah-english-v11-scaffolding-complete.zip`.

## What is included

- 2 new Grade 12 lessons: `grade12-caption-text` (15 scaffold steps, 16 distinct explained cards) and `grade12-curriculum-vitae` (12 steps, 12 cards).
- 2 linked 12-question English-first untimed quizzes, with optional Indonesian translations, explanations, passage evidence and balanced answer positions.
- 1 original SVG illustration to support caption reading.
- `data/catalog.json` updated to register 4 resources and list both in Grade 12 School English.
- Historical V9/V11 regression tests made expansion-safe; new V12 content test added and run by GitHub Actions.

## Pedagogy

The scaffold is deliberately more gradual than prior four-step lessons. Caption Text develops observation, verification, wording, reader purpose, and accessibility. CV introduces the document, audience, safe contact information, realistic student experience, verifiable skills, layout, and review. Essential explanations stay in Indonesian; examples, exercises and quizzes are in English with Indonesian support.

## Safe update on Linux Mint / GitHub Desktop

1. Fetch/Pull the existing **V11** repository and keep the `.git` directory intact.
2. Extract this ZIP **outside** your repository. Copy its contents, keeping directories, into the root of the existing clone. Do not copy the enclosing ZIP folder.
3. Review the GitHub Desktop diff. The catalogue, tests/workflow, and new learning files should be the only changed paths.
4. Run `python3 tools/validate.py` and `node tests/v12-caption-cv.mjs` (and optionally all `.mjs` tests).
5. Commit (e.g. `Add caption text and student CV materials`) then Push origin. Confirm the new Grade 12 lesson and quiz cards appear on Cloudflare preview.
6. Check lesson rendering, quiz results, mobile layout and existing saved progress on a real device.

## Release invariants / limitations

The existing 54 lessons, 39 quizzes and IDs, and three UTBK simulations are **not modified**. No JS renderer or stylesheet change was necessary because V11 already renders up to 20 scaffold steps and supports optional model images. All new people, student data and scenarios in this add-on are fictional. This release is not an official mandatory curriculum placement or a bilingual teacher-certified resource. Feedback from actual students and teacher editorial review are still advised.

## Content reference and limitations

For the six familiar school caption categories and caption types beyond photos, see the historical government-published Grade XII captions teaching module: https://repositori.kemendikdasmen.go.id/20024/ . This is a pedagogical reference, not a claim of a mandatory national chapter in 2026. Live Chromium navigation was blocked by the environment; JSON/JS validation and renderer-generated HTML checks were completed instead. Test the new pages on a real phone and Cloudflare preview before treating the pilot as accepted.
