# Langkah English V7 — Verification and preview checklist

## Automated validation

- `python tools/validate.py`: catalogue links, 45 resources, 234 graded questions, lesson schemas and V7 blocks.
- `node tests/scoring.mjs`, `node tests/v2-quality.mjs` ... through `node tests/v7-quality.mjs`: all passing at release time.
- V7-specific assertions: all 30 lessons start with a 3-step teaching guide, contain a formative English checkpoint after simple examples and a reflection after contrastive examples, use 90 matching Indonesian checkpoint choice glosses and preserve the original 234-question SHA-256 fingerprint.
- Renderer XSS escaping tests, optional `<details>` teaching content, collapser source checks, inline English labels and quotation-mark fallbacks.
- No changes to storage keys, quiz timer, existing resource IDs or deployed build requirements.

## Real browser limitation

Chromium starts successfully in this environment, but navigating to the local HTTP test site returns `net::ERR_BLOCKED_BY_ADMINISTRATOR`. **Do not claim browser smoke tests passed.** This is an environment limitation, not evidence of a live-site bug. All preview checks below remain essential.

## Cloudflare Pages preview checklist

1. Open `school.html`: check **Kelas 9–12**, each with separately collapsible **Materi** and **Latihan**. Confirm default closed state and independent expansion.
2. Open `school.html#grade-9-latihan` and `school.html#grade-9` and confirm the appropriate section opens; check `?grade=9` backward compatibility.
3. Open Grammar, check beginner/intermediate/advanced Materi and Latihan; check UTBK Materi, Latihan and Simulasi. Confirm dedicated Search still works.
4. Open `lesson.html?id=simple-present` on mobile: read three Indonesian teaching stages and mini-English examples; check English terms have *both* visible quote marks and coloured labels.
5. Open optional detailed rules. Confirm the six visible worked examples, two collapsed advanced examples, vocab, breakdown and lesson summary are still available.
6. Answer formative checkpoint incorrectly then correctly; verify feedback in Indonesian, helpful hint disclosure, optional Indonesian question/choice translations, and no changes to scored quiz results.
7. Change ID ↔ EN while a formative answer and an original lesson-practice answer are selected; check the two choices remain selected.
8. Open a Grade 9, Grade 11, Grade 12, advanced grammar and UTBK reading lesson; verify language distinctions and no horizontal scroll at 320–390 px width.
9. Try keyboard-only controls (`Tab`, `Enter`, `Space`), zoom, screen reader language changes and forced-colours settings.
10. Check completed lesson state, saved quizzes and progress export/import against the same browser's V6 data. Review content with a bilingual English teacher before broad deployment.

The new 30 checkpoints are original AI-assisted educational content and **not** official UTBK questions.
