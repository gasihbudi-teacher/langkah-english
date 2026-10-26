# V11 — Topic-specific scaffolding for struggling learners

Release date: 26 October 2026. Baseline: **langkah-english-v10-redesign.zip**.

## Goal and decisions

The previous 54 lesson guides typically contained three or four generic steps, regardless of the prerequisite knowledge or reasoning needed for the topic. This revision changes the **teaching sequences** rather than merely increasing their length. The number of steps is determined by the topic; a longer guide may be appropriate when meaning, structure, comparison, errors, and independent application each require separate attention. This is an educational redesign, not a claim of externally validated learning outcomes.

All 54 lesson scaffolds now have original Indonesian microstep explanations addressing the actual topic, one English example with Indonesian meaning and specific reasoning per step, and an ungraded reveal-after-thinking comprehension prompt. Thirty-four language/text-focused lessons also have connected bilingual model passages (including a poster-style visual in Grade 10). The mini-check is intentionally **not scored or saved**; there is no change to quiz questions or student progress records.

## 54-lesson step distribution

| Steps per lesson | Lessons |
|:--|--:|
| 5 | 1 |
| 6 | 7 |
| 7 | 5 |
| 8 | 4 |
| 9 | 15 |
| 10 | 22 |
| **Total** | **54 lessons / 469 steps** |

There are 469 revealable, low-stakes comprehension explanations and 34 bilingual connected examples. There is no pedagogical requirement to use exactly ten steps. The schema now accepts 3–20 authored steps so more demanding future lessons are supported without imposing a uniform step count. New lessons should choose their steps through an analysis of learner prerequisites, not by copying the counts above.

## Teaching decisions worth preserving

- **Parts of Speech:** progress from nouns and verbs toward modifiers, connectives, and words whose functions depend on context.
- **Simple Present / Past / Questions:** teach *be* and ordinary verbs separately before introducing *do/does/did* and form-changing questions.
- **Perfect Tenses:** establish reference time and show timelines before contrasting present, past and perfect forms.
- **Inversion:** ordinary order → auxiliaries → familiar question inversion → negative/limiting triggers → do-support → exceptions.
- **Adverbial Phrase vs. Clause:** begin with adverbial *function*, isolate the adverbial rather than the main clause, then examine phrase and finite-clause *structure*; acknowledge non-finite clauses as a later qualification.
- **Narrative vs. Recount:** teach conflict and character motive differently from chronology and reflection.
- **Analytical Exposition vs. Evidence Evaluation:** teach organization in the first lesson, argument quality in the second.
- **Discussion vs. Hortatory Exposition:** weigh alternatives in the first, derive a recommendation for action in the second.
- **UTBK reading labs:** define what data represent before making inferences; distinguish correlation from causation, denominators from raw counts, and possibility from supported inference.

## Implementation and authoring contract

The original lesson order remains `definition → scaffold → synthesis → existing lesson blocks → practice → vocabulary`. Source lessons and examples outside the scaffold are preserved. Inside each scaffold:

```json
{
  "type": "scaffold",
  "intro": "Instruksi berbahasa Indonesia …",
  "modelTitle": "Teks model … (optional)",
  "modelEnglish": "A connected short English text … (optional)",
  "modelIndonesian": "Terjemahan utuh … (optional)",
  "modelImage": "assets/some-graphic.svg (optional)",
  "modelImageAlt": "Keterangan gambar … (optional)",
  "steps": [{
    "title": "Tujuan satu langkah",
    "explanation": "Penjelasan berbahasa Indonesia, lengkap dan spesifik …",
    "english": "A focused English sentence.",
    "indonesian": "Terjemahan yang benar.",
    "why": "Alasan mengapa contoh ini menunjukkan prinsip …",
    "check": "Pertanyaan refleksi kecil tentang contoh …",
    "checkAnswer": "Jawaban atau petunjuk yang muncul setelah dicoba …"
  }]
}
```

`model*` fields and step `check*` fields are schema-optional for backward compatibility with archived lesson files. For **new** V11-quality lessons, provide the step questions, explanations, and bilingual samples; they are enforced by `tests/v11-quality.mjs`. Avoid reusing unrelated example sentences simply to fill a quota; check that each example demonstrates the microstep's actual learning objective. A single connected text is useful for genre lessons. Essential explanations remain visible; only the self-check answer is hidden until learners choose to reveal it.

The new illustrative SVG poster lives at `assets/reading-week-poster.svg`, with readable labels and an alternative text description. It is an example, not real registration data.

## Preservation and publication

The following are unchanged from V10: 54 lesson IDs, all 39 quiz JSON files, scored questions and answers, 543 pre-existing explained example cards, the resource catalogue, 3 timed UTBK mock sets, and existing localStorage progress/backup identifiers. There is no migration step and no database. Static Cloudflare Pages + GitHub Desktop publishing remains the same.

To update an existing V10 Git clone, **extract the V11 changed-files ZIP elsewhere, then copy the contents into your existing clone**. Keep the `.git` directory. Run `python3 tools/validate.py` and `node tests/v11-quality.mjs` (and all older Node tests), review the diff, commit and push a **preview** branch when possible, and inspect on mobile before promoting to production.

## Review caveats

The new pedagogical explanations and translations are AI-assisted and have not been professionally reviewed by an English-language teacher. Structural checks cannot certify sentence-to-step relevance, cognitive load, the accuracy of every educational example, or actual student learning. Teach with real students, starting with Parts of Speech, Inversion, Grade 12 adverbials, Grade 11 analytical exposition, and UTBK critical inference. Observe whether learners can explain each step. Review potentially repetitive mini-check wording and the overall length of ten-step lessons. Unofficial UTBK simulations remain unaffected; no official scoring predictions are made.
