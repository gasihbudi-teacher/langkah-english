# Langkah English V5 — verification report (25 October 2026)

## Automated checks

Run from the ZIP's extracted website root:

```sh
python tools/validate.py
node tests/scoring.mjs
node tests/v2-quality.mjs
node tests/v3-quality.mjs
node tests/v4-quality.mjs
node tests/v5-quality.mjs
```

The V5 checks verify: 45 published resources and 234 embedded/quiz questions; all English question stems and answer options; an Indonesian question gloss per item; matching Indonesian option-array lengths; full bilingual coverage for 70 UTBK mock/reading-lab questions; evenly distributed correct-answer indices across four-choice quizzes; 8 HTML pages with working relative asset paths, unique IDs and Search navigation; absence of home/pathway filter panels; accessible details markup with escaping; skill-specific diagnostic recommendations; bilingual UI dictionary parity; and continued V4 backup/scoring compatibility.

The standard validator also confirms existing passage-evidence quotes are exact substrings of their passages. V5 does not automatically verify the *meaning* of the bilingual text, the plausibility of distractors, or the equivalence of the practice to official examinations.

## Browser testing limitation

Chromium with Playwright was attempted against a local HTTP site in this environment, but navigation returned `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Therefore automated **real-browser flows were NOT completed** here. Javascript syntax and static code/data tests passed, but please run the manual acceptance checklist in `V5-CHANGES.md` against a Cloudflare Pages preview, especially quiz timer/resume, dynamic topic lists, translations, and iOS/Android scrolling.

## Compatibility details

Old completed attempts contain full snapshots of the questions they were answered against and remain valid. Since the V5 answer choices were intentionally reordered, saved unfinished V4 drafts have an outdated quiz snapshot: quiz.js intentionally refuses to reuse them. Back up the V4 site before deployment and advise students to finish any important pending quiz attempts first.
