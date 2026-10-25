# Langkah English V6 — what's changed

**Release:** 25 October 2026. **Based on:** the full V5 ZIP. The project remains a no-build, dependency-free static website for GitHub + Cloudflare Pages. V6 does not modify the live hosted site by itself.

## User-requested changes

1. **Clear English words in Indonesian teaching text.** English terminology is now explicitly annotated in lesson explanatory paragraphs, rules, objectives, old example notes, common-mistake explanations, new example notes, summaries and inline practice feedback. Its blue/italic style differs from plain Indonesian. Technical implementation: safe plain-text `[[term]]` marker interpreted by `formatIdText` in `js/core.js` (escaped output, not unrestricted HTML).
2. **Many more examples before practice.** Each of the 30 lessons now has eight original additional English worked examples, each with Indonesian translation plus a topic-specific explanation. Examples are divided into 3 basic, 3 compare/contrast, and 2 optional longer/contextual items. The last group is initially collapsed to keep lengthy lessons approachable; students may expand it without leaving the page.

## Further improvements consistent with the V6 plan

- Every lesson includes four curated vocabulary glosses, one short word/phrase-by-phrase sentence breakdown, and a short end-of-lesson recap.
- New blocks are data-driven and editable directly in `data/lessons/*.json`. The JSON Schema, writing instructions, CI checks and content validator were extended accordingly.
- Estimated lesson time has a minimum of 15 minutes to reflect the longer reading and examples; estimates are approximations, not measured completion time.
- Existing older examples and explanations were retained. This is an **augmentation**, not a claim that all older examples and assessments have received teacher review.

## Unchanged compatibility contract

- 30 lessons + 15 quizzes; 234 questions including lesson practice. Existing IDs, URLs, local lesson completion data, stored quiz attempts and backup format are untouched.
- All quiz prompts, answer choices, order/keys, Indonesian expandable question translations, and existing answer explanations are unchanged. Practice feedback on lesson pages may contain presentational `[[...]]` markup but the assessment content is identical.
- No login, database, framework, API key, paid service, or Cloudflare configuration change.
- Homepage, Grammar Academy, UTBK Preparation, School English and dedicated Search remain as V5.

## Limitations and review requirements

- These examples and glosses were authored with AI assistance and remain **unofficial**. Teacher review should check grammar, precise Indonesian translations, appropriateness of academic claims, readability and difficulty progression.
- Some older lesson tables retain their original format. Their content has not been replaced with the new guided-example cards.
- Audio, smart hints, personal accounts, student analytics and full Grades 9–12 curriculum coverage are **not** included in V6.
- Browser automation in this environment could not navigate the local HTTP test page reliably. Automated source, content schema and rendering-safety tests pass, but hands-on end-to-end browser and mobile tests are still required.

## Deployment

Extract ZIP and publish its **contents** (not its enclosing folder) in your existing GitHub repository's Cloudflare Pages production/preview branch. Keep a V5 backup first. Test a Cloudflare preview deployment before replacing production. Existing student progress should continue to work because storage keys and assessment answer positions have not changed.
