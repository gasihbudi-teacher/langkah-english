# Authoring content, including AI-generated material

## Catalog contract

Each catalog resource requires `id`, `title`, `description`, `type` (lesson/quiz), `placements`, `difficulty` (Beginner/Intermediate/Advanced), `grammarTopics`, `readingSkills`, `tags`, `relatedLessons`, `file`, `aiGenerated`, and `unofficial`. A quiz also requires `kind` (practice/test). Empty arrays are valid. Stable IDs should match the filename.

Example of ONE lesson listed in THREE destinations:

```json
{
  "id": "relative-clauses",
  "title": "Relative Clauses",
  "description": "Connect ideas with defining and non-defining clauses.",
  "type": "lesson",
  "placements": [
    {"pathway": "grammar"},
    {"pathway": "school", "grade": 11},
    {"pathway": "utbk", "section": "Grammar foundations"}
  ],
  "difficulty": "Intermediate",
  "grammarTopics": ["Relative Clauses"],
  "readingSkills": [],
  "tags": ["grammar foundations", "complex sentence structures"],
  "relatedLessons": ["subject-verb-agreement"],
  "file": "data/lessons/relative-clauses.json",
  "aiGenerated": true,
  "unofficial": true
}
```

This is an authoring example, not a published starter resource. Place its lesson file first, then register it. Do not register nonexistent content. Grades are numbers 9–12; the School page lists each grade without filters. `difficulty` determines grouping under Beginner, Intermediate or Advanced on the Grammar page; `grammarTopics` describes topics independently.

## Universal lesson format

```json
{
  "id": "your-lesson-id",
  "objectives": ["One measurable learning objective"],
  "blocks": [
    {"type": "heading", "text": "A clear main heading"},
    {"type": "text", "text": "English explanation.", "idText": "Penjelasan opsional dalam bahasa Indonesia."},
    {"type": "subheading", "text": "A smaller heading"},
    {"type": "rule", "text": "A concise highlighted rule."},
    {"type": "example", "text": "An original example.", "note": "Optional annotation."},
    {"type": "table", "headers": ["Pattern", "Example"], "rows": [["One", "Two"]]},
    {"type": "mistake", "incorrect": "She go.", "correct": "She goes.", "explanation": "Third-person singular takes -s."}
  ],
  "practice": [
    {"id": "p1", "prompt": "She ___ every day.", "choices": ["reads", "read"], "answer": 0, "explanation": "She is singular; use reads."}
  ],
  "assessments": ["existing-quiz-id"]
}
```

IDs in assessments must resolve to existing catalog quizzes. Related resources use relatedLessons in metadata, not hard-coded HTML links. All block values are plain text. Optional Indonesian text is supported on text blocks. Repeat text, example and rule blocks as needed. Short assessments are reusable quiz links; embedded practice gives immediate feedback without recording an examination attempt. Lesson completion is a deliberate student action, not a claim that the learner mastered the topic.

## V6 bilingual formatting and structured teaching blocks

In **Indonesian explanation fields only**, surround literal English terminology with `[[...]]`; the renderer escapes the data then applies blue/italic `<span lang="en">` styling. For example, `"Dalam [[Simple Present]], [[she]] memakai [[verb]] dengan -s."` is safe and is distinguishable from Indonesian words. **Do not** use HTML `<em>` or `<span>` in JSON. Do not wrap complete English example sentences: they have their own `<p lang="en">` and are not translated automatically. Explanations and notes default to Indonesian, regardless of the interface language.

The new JSON block shapes are illustrated below. These blocks are supported in `data/schemas/lesson.schema.json` and rendered by `js/core.js`. Lessons can still use older headings, tables, rules, examples and mistake blocks.

```json
{
  "type": "example_group",
  "title": "1 · Contoh dasar",
  "collapsed": false,
  "items": [
    {"english": "She reads every day.", "indonesian": "Dia membaca setiap hari.", "note": "Karena [[she]] tunggal, kata kerja [[read]] mendapat -s."},
    {"english": "They read every day.", "indonesian": "Mereka membaca setiap hari.", "note": "Untuk [[they]], gunakan [[read]] tanpa -s."}
  ]
}
```

Use `collapsed:true` for the optional longer-example group (rendered with a native accessible `<details>` element, initially closed). Typically provide at least 3 basics, 3 contrasts, and 2 contextual examples per lesson; verify every English sentence, translation, and teaching note individually.

```json
{"type":"vocabulary","title":"Bekal kosakata","items":[{"english":"habit","indonesian":"kebiasaan"}]}
```

```json
{"type":"breakdown","sentence":"She reads every day.","parts":[{"english":"She","meaning":"[[subject]] tunggal"},{"english":"reads","meaning":"kata kerja berakhiran -s"},{"english":"every day","meaning":"keterangan frekuensi"}]}
```

```json
{"type":"summary","title":"Yang perlu kamu ingat","items":["Cari [[subject]] sebelum menentukan bentuk kata kerja.","Periksa waktu yang dimaksud."]}
```

**Preserve English-first assessments:** `practice[].prompt` and `practice[].choices[]` must remain entirely English; `practice[].translationId.prompt` is the optional Indonesian hint that starts collapsed. `practice[].explanation` may contain `[[term]]` markers for the feedback display; never reveal the answer in a translation. The quiz engine's JSON contract is unchanged.

After changing lesson content, run `python tools/validate.py`, `node tests/v6-quality.mjs`, and all prior `tests/*.mjs`, then preview on desktop and mobile. Human teaching review is essential; automatic validation cannot verify that examples are pedagogically sound.

## Quiz format

```json
{
  "id": "new-quiz-id",
  "questionCount": 1,
  "durationSeconds": 60,
  "passages": [{"id": "text-a", "title": "An original text", "text": "Maya planted two trees beside the library."}],
  "questions": [
    {
      "id": "q1",
      "passageId": "text-a",
      "prompt": "How many trees did Maya plant?",
      "choices": ["One", "Two", "Three"],
      "answer": 1,
      "explanation": "The text directly states that Maya planted two trees.",
      "evidence": "Maya planted two trees beside the library.",
      "skill": "Supporting Details"
    }
  ]
}
```

`answer` is ZERO-BASED: 0=A, 1=B, 2=C, and so on. At least two string choices are required; the engine supports arbitrary counts. Do not use answer letters. `questionCount` must equal questions.length; it is a validation contract, not an instruction to invent or sample missing questions. For untimed simulation set durationSeconds=0. Practice is always untimed. One passage can be referenced by many questions; multiple passages are supported. Each question references one passage; combined-text questions should store both texts in a single combined passage. No HTML or rich media in choices.

Evidence should quote an exact substring of the passage. Explanations should connect that quote to the answer and, where useful, explain why a distractor fails. For grammar items, omit passageId and evidence. Optional `referenceFormat` records a source format but does not override the quiz configuration.

## Prompt to give a future AI author

“Produce valid UTF-8 JSON only, using the supplied existing lesson or quiz format. Target Indonesian Grades 9–12. Write original, age-appropriate material. Use only documented block types. Use stable unique lowercase IDs. For every question provide one unambiguously correct answer as a zero-based integer, plausible distractors, and an accurate explanation. For passage questions include the matching passageId and an exact supporting evidence quotation. Include optional Indonesian explanations in idText on text blocks. For lessons include objectives, clear explanations, examples, common mistakes, interactive practice and an assessment ID only if that quiz exists. Return a separate catalog metadata object with placements, tags and the relative file path. Do not claim official affiliation, official curriculum alignment or independent verification. Do not include Markdown fences in the JSON files. Do not use copied examination passages. Never invent a citation.”

## Human publishing checklist

- Parse the JSON, run the validator, and inspect the catalog destinations.
- Check that every key is correct, every distractor is actually incorrect, and only one answer is defensible.
- Check tenses, names, pronouns, quantities and inference strength against the text.
- Check evidence quotes exactly and ensure explanations do not add unstated facts.
- Check bilingual wording, accessibility, age appropriateness, copyright and cultural sensitivity.
- Verify official formats against current SNPMB guidance before changing reference metadata.
- Preview lesson, practice, simulation, results, mobile view and empty filters.
- Keep IDs stable after publication. If a quiz changes substantially, consider publishing a new version ID.


## V2 optional catalog fields

The V2 interface accepts optional metadata on each entry in `data/catalog.json`:

```json
{
  "order": 10,
  "estimatedMinutes": 8,
  "prerequisites": ["simple-present"]
}
```

Use `order` and `estimatedMinutes` for lessons; include `prerequisites` only when the referenced IDs identify published lessons. They do not lock content. Existing lessons work without these fields.

For a quiz, set `"examFormat": "sample"` or `"examFormat": "topic"`, and use `"full"` only when you deliberately created a full-length practice simulation. A quiz with `"examFormat": "full"` must also provide `referenceFormat` whose question count and duration match the actual quiz data. The validator checks this. AI-generated practice remains unofficial.

A lesson can appear in multiple grade/pathway sections using the existing `placements` array. Do not duplicate its lesson JSON just to display it in different places.

Major interface labels are translated in `js/i18n.js`. English content text is not machine-translated by switching the interface to Indonesian. Continue to supply optional lesson `idText` explanations where needed.


## V5 authoring requirement: English questions + Indonesian help

For every quiz `questions[]` item and lesson `practice[]` item, write the main `prompt` and every `choices[]` string in **English**. Explanations may be written in Indonesian. Provide optional `translationId` with Indonesian wording of the same question:

```json
{
  "prompt": "Why did the researcher repeat the measurements?",
  "choices": ["To check consistency", "To increase ticket prices", "To replace the instruments"],
  "answer": 0,
  "explanation": "Peneliti mengulang pengukuran untuk memeriksa apakah hasilnya konsisten.",
  "translationId": {
    "prompt": "Mengapa peneliti mengulang pengukuran?",
    "choices": ["Untuk memeriksa konsistensi", "Untuk menaikkan harga tiket", "Untuk mengganti alat ukur"]
  }
}
```

The example above is a fragment, not an entire quiz. Translations must match the **current choice order exactly**. The English choices must retain the correct answer index (`answer` is zero-based); Indonesian glosses should never contain the answer key or explanations shown before submission. The accordion is initially closed. For exercises that specifically compare English verb forms or intentionally incorrect English word order, you may omit `translationId.choices`: replacing *is/are*, *do/does*, etc. with Indonesian can erase the grammatical distinction. The UI explains that choice forms are then left in English. Add reviewed translations for sentences and reading options whenever meaningful.

All questions should have a translated Indonesian `translationId.prompt` (enforced by the V5 quality test). Run `node tests/v5-quality.mjs` after any modification; its language heuristic only catches common Indonesian words, so a human bilingual review is still essential. Never add filter widgets to ordinary pathway pages: update `data/catalog.json` to publish topics and let the existing pathway list/search render them.
