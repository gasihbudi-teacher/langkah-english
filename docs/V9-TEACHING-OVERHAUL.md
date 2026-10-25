# V9 — Pedagogical review and editorial guidance

Date: 25 October 2026. This replaces the rigid V7/V8 lesson-opening template while retaining static GitHub + Cloudflare hosting.

## Revised learning sequence

1. **Visible definition, first** — a short Indonesian definition naming and introducing the concept; terms in `[[double brackets]]` are displayed with quoted English styling.
2. **Topic-appropriate guided scaffold** — the lesson considers the actual difficulty: grammar identification, direct comparison, genre organization, procedure sequencing, reading evidence, or UTBK inference/causality. Scaffolds use three or four meaningful steps, with explicit English examples, Indonesian meanings, and explanations. The JSON Schema allows 2–5 steps for future authoring.
3. **Fuller synthesis immediately afterward** — 'Jadi, apa inti konsep ini?' explains how the form/function/strategy works and highlights important limits. Essential definitions, mistakes and rules are not tucked away inside an optional reference panel.
4. **Further demonstrations** — at least 10 **distinct bilingual explained example cards** in every lesson, visible instead of folded by default, plus existing sentence breakdowns, contrast comparisons, readings and guided checkpoints. Some lessons contain additional older unglossed legacy examples, which should not be confused with the counted bilingual cards.
5. **Recall and production** — formative checkpoints, reflections, an ungraded free-text self-check with a model answer, and existing scored English-only lesson exercises. Students must decide themselves whether their written response meets the criteria; the browser does not claim to grade it.
6. **Bekal Kosakata last** — vocabulary is rendered after the lesson's independent exercise section. Critical terms can still be defined inline when they first matter.

## Lesson methods

- Grammar structure: locate the subject/predicate/verb form and identify the construction.
- Comparison: compare two legitimate forms before learning when each is appropriate.
- Genre/text: identify purpose and organization, then connect sentences to the text's larger meaning.
- Procedure: follow the action, conditions, safety and order.
- Reading: verify statements against actual textual evidence and recognize information limits.
- UTBK reading: distinguish observation from inference, evaluation from speculation, and count from proportion. UTBK material is unofficial practice, not an official item bank.

## Important assessment correction

Two V8 Grade 9 passage quizzes had main-purpose answer keys pointing at demonstrably wrong alternatives. V9 corrects `grade9-trip-recount-practice` question `q1` to **A class visit to a history museum**, and `grade9-upcycling-procedure-practice` `q1` to **To show how to make a pencil holder**. An additional question's answer options and Indonesian option translations were reordered in each quiz to retain a balanced four-position answer distribution without changing the correct answer's meaning. All V7 historical question fingerprints remain unchanged.

## Authoring conventions for future lessons

- Start with `definition` and supply `title` + `text` in plain, kind Indonesian.
- Follow with `scaffold` comprising as many steps as needed within 2–5, not a fixed three-stage template. Only include a full `english` sample if it also has a meaningful `indonesian` translation and a specific `why` note.
- Put `synthesis` immediately after scaffold; add context and common misconceptions rather than merely repeating objectives.
- Keep 10+ **different** fully translated and explained items inside `example_group` blocks. All essential worked examples should remain uncollapsed.
- Add an open-response `self_check` with a topical prompt, English model, Indonesian model translation, and transparent criteria. It is ungraded and unsaved.
- Keep exactly one `vocabulary` block, located last in JSON; the UI renders it below existing graded exercises.
- Maintain `id`, referenced quizzes and historical student progress keys; future additions should not assume lesson/question counts are fixed.

## Review still recommended

This project is AI-assisted, unofficial teaching content. Educators should inspect grammar terminology, age-appropriate examples, how English texts support conclusions, Indonesian glosses, and actual responses from struggling students. All 23 expanded V8 short quizzes still have four questions, apart from the separate twelve-question Grade 12 adverbial add-on. They are formative mini-quizzes, not broad proficiency tests. Full real-browser interaction and a Cloudflare preview must be verified before production.
