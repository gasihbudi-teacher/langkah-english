# V10 redesign — changes, QA and release notes

**Baseline:** the supplied 25 October 2026 V9 ZIP.  
**Release character:** interface redesign/UX improvements; no educational-content or scoring-schema changes.  
**Format:** static HTML + existing CSS, vanilla JS and JSON for GitHub/Cloudflare Pages.

## Changes implemented

- Rebuilt `index.html` around a calm learning dashboard, next suggested lesson, four goals, three pathways, grade links, guided journey, learner progress, local activity and portable backup.
- Added `js/shell.js` for small-screen expandable navigation, Escape / outside-click dismissal, and page-current navigation indication.
- Harmonized header markup across eight HTML pages; global style refactor uses CSS-only abstract artwork, not external images/fonts.
- Kept existing course sections, but added useful course jump links; library starts with the first Materi section open. Visible pathway completion counts use **existing local lesson completion flags**, not skill mastery.
- Kept a dedicated Search page with no filtering controls: initial six curated starters, suggested search terms, an explicit **show all 93** button, immediate typing search, grade-aware text matching. Existing `?q=` links work.
- Added lesson table-of-contents shortcuts, a thin scroll-progress indicator and reversible focus-reading mode, without changing any JSON or hiding key teaching blocks.
- Harmonized reading typography, quiz selection states, mobile spacing, cards, keyboard focus and reduced-motion preferences.
- Added bilingual interface strings for the new UI only. V9 lesson translation, question language, and test mode behavior remain as authored.

## Compatibility invariants

| Invariant | Result |
|:--|:--|
| Content inventory | 54 lesson JSON + 39 quiz JSON = 93 resource entries, unchanged |
| V9 explained examples | 543 distinct worked example cards, unchanged |
| Embedded and scored items | 389 items, unchanged |
| Full UTBK simulation sets | Three sets, 20 questions / 20 minutes each, unchanged |
| `data/catalog.json` and individual lesson/quiz JSON | Byte-for-byte unchanged from V9 |
| Existing resource IDs, progress key `langkah.progress.v1`, quiz draft key prefix `langkah.draft.` | Unchanged |
| Browser backup format and snapshot rules | Unchanged |
| Study content order and optional translations | Unchanged |
| GitHub Pages/Cloudflare compatibility | No build step or new runtime dependency added |

## Executed checks

**Static/assessment checks (all passed):**

- `python3 tools/validate.py`: 93 resources and 389 questions/embedded practice items, structural and reference checks.
- `node tests/v2-quality.mjs` through `node tests/v9-quality.mjs`: every legacy regression suite passed.
- `node --check` on every `js/*.js` script: passed.

**Isolated Chromium DOM interaction smoke checks (passed):**

The environment blocks navigation from Chromium to even loopback HTTP via administrator policy. We therefore used Playwright's `page.set_content` to render the real HTML/CSS and a small *test-only in-memory module/data bridge* to run the real page JavaScript without network access. This is **not equivalent to full real-origin runtime testing**. Observed:

- Home: 4 progress stats, 3 grammar roadmap groups, single continue CTA, EN/ID switch updates hero.
- Course libraries: 6 Grammar accordion groups, expected School/UTBK first sections open, pathway progress displayed.
- Search: 6 initial starter cards, show-all reveals 93, term “adverbial” finds 3 entries.
- Inversion lesson: 6 table-of-contents shortcuts, all 10 worked examples, reversible focus mode, successful lesson completion saved under the old progress key.
- Quiz/results: practice mode starts, question and four choices visible, answer updates progress, submission dialog opens, completed 12-question attempt persists under the existing progress format, results page renders 12 review cards.
- Mobile viewport 390px: no page-level horizontal overflow after header adjustment; menu opens and Escape closes it.
- No JavaScript runtime exceptions during these isolated smoke checks.
- Reproducible optional harness: `python3 tests/v10-browser-smoke.py` (requires Python Playwright and system Chromium, both **test-only**).

**Still necessary before production approval:** actual HTTP/Cloudflare navigation, real-mobile touch and back/forward behavior, quiz draft reload and results, a complete timed UTBK mock under live conditions, backup export/import through browser downloads, screen reader + keyboard auditing, and bilingual teacher/learner review. There are no independently measured Core Web Vitals or certified WCAG results.

## Publishing through GitHub Desktop (Linux Mint)

1. Open the **existing** Langkah English clone in GitHub Desktop. Fetch/Pull origin first. Consider a new preview branch.
2. Extract `langkah-english-v10-update-from-v9.zip` **outside** the repository. Copy its enclosed files/directories into the existing clone, preserving their relative paths. This patch assumes the supplied V9 is already installed. If unsure of the baseline, use the full V10 ZIP contents instead.
3. **Never remove or replace the repository's `.git` folder** or overwrite an entire directory without checking.
4. Run `python3 tools/validate.py` and `node tests/v9-quality.mjs`; inspect the diff to verify content JSON has not changed.
5. Commit a message such as `V10: redesign study dashboard and navigation` and push the preview branch to GitHub.
6. Open the Cloudflare Pages preview on a phone and desktop. Confirm header menu, EN/ID switch, Grade 12 adverbial lesson, search all, quizzes, one full UTBK simulation, results and saved progress. Merge/push to production after QA.

## Suggested acceptance journeys

- First-time learner: Home → beginner goal → Parts of Speech → read definitions and examples → mark complete → return home and see 1 completion.
- Returning learner: Home → recommended next step or saved quiz → continue without losing answers.
- School: School → Kelas 12 anchor → Adverbial Phrase vs. Adverbial Clause → optional translations and practice.
- UTBK: UTBK → Simulasi → 20-question mock in simulation mode → result and review; verify unofficial status and no premature explanations.
- Discovery: Search → type `inference` or `kelas 12` → open a result → return → use show-all for the full catalog.
- Mobile: Menu toggle, Escape/close, keyboard tab focus, long content scroll, focus reading and exit.

**Release philosophy:** V10 redesign changes interaction and visual hierarchy, not the patient bilingual teaching contract. The PDF handover through V9 remains authoritative for the educational and technical guardrails.
