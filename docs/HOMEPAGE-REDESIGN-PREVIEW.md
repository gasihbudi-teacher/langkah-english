# Langkah English — Homepage Redesign Preview

**Baseline:** `langkah-english-v13c1-complete-site.zip` (V13-C1)  
**Status:** Local preview proposal; not yet deployed or user-accepted as a release.

## Intent

Reduce first-visit decision load for Indonesian secondary-school learners who may lack confidence in English. The homepage should make the next action obvious without repeating the same choices across multiple sections.

## What changed

- Replaced the long homepage with one short hero and one primary action.
- Consolidated the main destinations into four cards: Grammar basics, School English, UTBK preparation, and TKA preparation.
- Removed repeated pathway cards, the homepage-only four-step journey/diagnostic block, duplicated grade cards, and the detailed grammar roadmap. Those resources remain available on their dedicated pathway pages and through navigation/search.
- Shows a single continuation card only when browser-local progress or activity already exists.
- Moved progress statistics, recent activity, and backup/restore controls into a collapsed “My learning progress” section.
- Kept Indonesian and English interface copy in sync.

## Preservation

No lesson or quiz JSON, catalogue data, resource IDs, question scoring rules, progress storage keys, backup format, or UTBK mock content was changed. The existing local progress and backup features remain in place.

## Validation recorded for this preview

- `python3 tools/validate.py` — passed: 101 catalogue resources and 449 scored/embedded items.
- All `tests/*.mjs` regression suites — passed.
- `python tests/v10-browser-smoke.py` — passed in its isolated in-memory Chromium harness, including homepage card count, language toggle, mobile navigation, quiz flow, and zero horizontal overflow.
- Desktop and mobile screenshots were captured from the local preview markup. This is not a live Cloudflare Pages audit, real-phone test, or evidence of learning gains.

## Applying the preview

The small patch ZIP is intended for a repository already at the V13-C1 baseline. Extract it outside the repository, copy the included files into the existing clone while preserving relative paths, inspect the diff, run the checks above, and preview before committing. Do not apply this patch to an older baseline.

For local preview, run `python3 -m http.server 8000` from the project root and open `http://localhost:8000` in a browser. Opening the HTML directly with `file://` may block JSON loading.
