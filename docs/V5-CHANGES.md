# Langkah English V5 — release notes (25 October 2026)

V5 is based on the complete V4 static website. No framework, server, database, student account, Cloudflare Function, API key, or runtime dependency has been introduced. Deploy the contents of this ZIP to the existing GitHub repository's Cloudflare Pages output root. `index.html` is at the root.

## Requested changes

**Questions in English:** all 234 authored assessment items (150 quiz questions and 84 embedded lesson exercises) now have English question stems and English answer choices, independently of the chosen **EN/ID interface** setting. Indonesian explanations/feedback remain available. The three full UTBK mocks, reading lab, and other quizzes keep their original answer meaning and passage evidence. All three full mocks still contain 20 questions with a 20-minute timer. No official exam status is implied.

**Expand/collapse Indonesian assistance:** native HTML `<details>` blocks are initially closed, appear below the English question, and do not reveal the correct answer. All 234 questions have an authored Indonesian question gloss. Curated Indonesian choice translations are included for **116 of 234 question sets**, including **all 70 questions** in the three UTBK mocks and 10-item UTBK Reading Lab; all translated choices stay in precisely the same order as their corresponding English choices. For isolated English grammar forms (`is`, `are`, `go`, etc.), leaving answer options in English is deliberate: translating them can remove the distinction being assessed. Some other short exercises still need manually reviewed translations of their answer sentences; the UI does not fabricate translations where none has been authored. Author the optional `translationId: {"prompt":"…", "choices":["…"]}` in the question JSON to add them. Choice translations must have the same length and order as English choices.

**Remove filters from normal browsing:** homepage and pathway pages no longer contain filtering UI. `grammar.html` lists lessons by Beginner, Intermediate, Advanced followed by quizzes; `utbk.html` lists lessons, practice, and full simulations; `school.html` lists material for each Grade 9–12. Every published item is visible and linked, with no selection required. Old links such as `school.html?grade=11` or `grammar.html?difficulty=Intermediate` redirect to the matching section where possible; homepage links point to anchors directly.

**Dedicated search page:** `search.html` has one ordinary search input. It searches title, description, tags, topics, and skills over the full published catalogue. There are no filters or account requirements. Search runs locally in the browser and updates `?q=...` so queries can be shared. A Search link has been added to every page's main navigation.

## Additional quality improvements

- Answer-position biases corrected in all four-option quizzes, including Mock A, B, C, Reading Lab, diagnostic, and advanced grammar check. For the full mocks, five correct choices appear at each of A, B, C and D. Order is fixed within the published quiz (it does not move between attempts), and Indonesian translations were reordered to match. This avoids trivial all-A strategies; it does **not** prove the distractors are academically equivalent to official UTBK material.
- The diagnostic results page now recommends up to two next lessons based on the learner's **weakest skill groups**, rather than only the overall percentage. Results explicitly warn about small sample sizes. The homepage's next-lesson suggestion also considers the learner's most recent diagnostic attempt.
- Translation markup is escaped to protect HTML injection, accessible via keyboard, and collapsed by default. Preview on actual student devices before production release.
- Existing local storage progress key (`langkah.progress.v1`), backups, old results and quiz drafts are preserved. Because the question JSON has changed, **unfinished V4 quizzes cannot safely resume with V5 answer positions**. The app detects that mismatch and starts the updated version as a new attempt. **Completed V4 results remain available**, with their original snapshot/answer history.
- New quality checks and documentation added. See `docs/V5-TEST-REPORT.md`.

## Not completed by V5

Not every option has a curated Indonesian translation yet; the remaining answer-form items and longer lesson distractors should be reviewed by a bilingual English teacher. School Grades 9–12 are still an evolving set of lessons rather than a full formal curriculum. No audio/pronunciation player, adaptive question generator, account sync, or official UTBK content has been added. Distractor quality, language accuracy and passage difficulty require independent teacher review.

## Before publication

1. Deploy the ZIP to a Cloudflare **preview deployment** first. Never replace the existing live site until student journeys have been checked.
2. Open each topic list and verify Grade 9–12 links and deep-link anchors work; test Search on mobile.
3. Open `quiz.html?id=utbk-mock-c` in Practice mode. Verify English prompts/options, expand the Indonesian help for a question, confirm the four translations line up, answer, and check the explanation.
4. Attempt a full timed simulation and complete it; verify result details, skill summary, and translations.
5. Try a lesson's embedded questions and expand their Indonesian help. Some grammar choice forms remain in English intentionally.
6. Test the diagnostic with known incorrect skills and verify the recommended links match the weak skills.
7. Test local progress backup export/import on a disposable browser profile. Check old V4 completed results remain readable.
8. Inspect on a real phone in Chrome/Safari/Firefox where available, and arrange independent English-teacher review before assigning exam practice.
