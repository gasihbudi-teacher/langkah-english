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

This is an authoring example, not a published starter resource. Place its lesson file first, then register it. Do not register nonexistent content. Grades are numbers 9–12; UI values are strings converted during matching. `difficulty` determines grammar level grouping when used with the difficulty filter; `grammarTopics` describes topics independently.

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
