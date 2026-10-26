# Langkah English V13-A — TKA pathway foundation

Release: 26 October 2026. Baseline: working V12 (full V11 website + V12 Caption/CV add-on).

## What this release does

- Registers a **fourth, distinct `tka` pathway** for TKA Bahasa Inggris Wajib; UTBK remains separate.
- Adds `tka.html` / `js/tka.js`: introductory TKA reading orientation, explicit stage label, a 10-module curriculum roadmap (112 **planned** scaffold steps), and Materi / Latihan / Simulasi areas.
- Cross-lists **eight existing V12 lesson IDs** in the TKA support area, without duplicating or editing those lessons. Completing them uses the *same* progress record as before.
- Adds TKA to navigation, home pathway cards, and both interface languages. The existing search indexes the cross-listed V12 resources.
- Improves navigation spacing for an extra link on wider screens.

## What it does NOT do

- **No new TKA lessons, worked examples, lesson scaffolds, TKA quiz items or simulation content** have been authored or released yet. The module roadmap is not clickable lesson content.
- **No multi-answer/category quiz engine**: the original one-answer quiz schema, scoring, results, backup format, quiz drafts and existing UTBK mocks are unchanged.
- This package does not make any TKA format, time limit or score claim as official. Text is original, unofficial instructional preparation, not a government product or admissions prediction.

## Apply using GitHub Desktop (small changed-files ZIP)

1. Keep your **working V12 repository**. In GitHub Desktop, fetch/pull and ideally create a separate branch or local backup first.
2. Extract `langkah-english-v13a-tka-foundation-from-v12.zip` outside the repository, then copy **the ZIP's file contents** into the root of your repository, preserving folder paths. Don't replace or delete `.git`.
3. Review the changes. Expect `tka.html` and `js/tka.js` as new files, plus existing pages, stylesheet, catalogue, translations, a historical test adjustment and this document.
4. Run `python3 tools/validate.py` and `node tests/v13a-foundation.mjs`. Optionally run `for f in tests/*.mjs; do node "$f" || break; done`.
5. Local preview: from your repo root `python3 -m http.server 8000`, then open `http://localhost:8000/tka.html`. Test the navbar (including phone), TKA cards, a shared lesson link, locale buttons, and old UTBK quizzes/progress.
6. Commit/push; check Cloudflare Pages deployment and the published TKA link.

**IMPORTANT:** The V13-A ZIP is a **patch**, not a complete website. Apply it on the V12 repository only; it isn't suitable for fresh deployment by itself. Save the ZIP for subsequent V13-B and V13-C releases.

## Release checks

- Python validator: 97 resources / 419 existing scored and embedded questions.
- Existing Node test suites plus V13-A foundation test: pass against assembled V13-A source.
- A browser smoke test may be performed separately. Automated checks are not a substitute for phone and classroom QA.

## Next increment

V13-B should implement single/multiple/category schemas, response input, scoring and accessibility tests while preserving legacy single-answer quizzes. Then publish full TKA instructional content in manageable blocks, subject to bilingual teacher review.

- GitHub Actions validator includes `tests/v13a-foundation.mjs`.
