# Generate a pre-quiz glossary for Langkah English

Attach this guide and the original quiz JSON to the other AI. The quiz JSON supplies all the text needed for the glossary. This guide specifies the proposed glossary format for the **Bekal kosakata** pilot. The output is ready for editorial review before the site gains support for the separate glossary file.

## Prompt to give the AI

> Use the attached quiz JSON to prepare **Bekal kosakata** for Indonesian Pre-A1 and A1 learners reading test-level English. Follow the workflow and output format in this guide. Use the original wording from the passages and write simple Indonesian meanings that fit the context. Review every original passage section. Return a complete glossary JSON file and brief review notes separately. Preserve the input quiz file.

## Select the entries

1. Read the quiz’s top-level `id` and each record in `passages`. Work from its `text`. Use the passage ID exactly as supplied. Derive entries from the passages themselves, independently of the questions, answer choices, and keys.
2. Keep the original reading order. If the quiz stores paragraphs separately and also includes a full passage repeating them, use the individual records. For the pilot `grade12-sas-argumentative-text-1`, use `passage-1` through `passage-4`. Check whether any text appears only in the full passage. If a future quiz stores a single full passage, use its ID and group the vocabulary under it.
3. Aim for **roughly 15–25 useful entries per paragraph** in a dense test passage. Add more when needed for comprehension and use fewer for simple text. Look for vocabulary that blocks the main idea, key details, reasons, contrasts, and conclusions. Include difficult phrases and familiar words with unfamiliar meanings. For instance, treat “turn down a request” as a phrase when the text uses it to mean “menolak permintaan”.
4. Copy the English expression exactly as it appears in the passage, including the inflection and spelling. Keep it a contiguous excerpt. Translate the meaning **in that context** into short, student-friendly Indonesian. Use plain text in both fields. Keep names, sentence-specific interpretations, and quiz answers out of the meanings unless a name is necessary to understand the vocabulary itself.
5. Assign one approximate level from `Pre-A1`, `A1`, `A2`, `B1`, `B2`, `C1`, or `C2`. Consider the expression and its contextual sense. A phrase can be harder than its component words suggest. Choose the closest level and mention uncertain calls in the review notes. Treat the levels as study guides.
6. Use `priority: true` for words students should **Pelajari dulu**, based on how much they matter for understanding the passage. A word can be both high-priority and advanced. Within a passage, order entries by level from Pre-A1 upward, with priority entries first in each level. Keep a repeated term once when the meaning is the same. If it has a genuinely different sense in a later passage, include it there with the appropriate meaning.

## Return the glossary

Return a complete JSON object with the quiz’s `quizId` and an ordered `sections` array. Each section has a `passageId` and an `entries` array. Each entry has `expression`, `meaningId`, `level`, and the Boolean `priority`. Suggest the filename `<quiz-id>.json` for the separate glossary. Keep review notes outside the JSON.

This invented example assumes the source paragraph contains “keep in touch” and “adds pressure”.

```json
{
  "quizId": "example-quiz",
  "sections": [
    {
      "passageId": "paragraph-1",
      "entries": [
        {
          "expression": "keep in touch",
          "meaningId": "tetap berhubungan",
          "level": "B1",
          "priority": true
        },
        {
          "expression": "adds pressure",
          "meaningId": "menambah tekanan",
          "level": "B2",
          "priority": false
        }
      ]
    }
  ]
}
```

## Check before returning

- Confirm every expression occurs verbatim in its referenced passage and every passage ID exists in the uploaded quiz.
- Confirm all distinct source paragraphs are represented and repeated full-passage records have been accounted for. Check for duplicate entries and basic words whose contextual meanings deserve support.
- Review the Indonesian meanings in the surrounding sentences. Check that priority entries are genuinely useful before reading and that the glossary gives neither answer letters nor explanations of which quiz option is correct.
- Check that the output is valid JSON with the actual quiz ID and no placeholders. If the uploaded quiz has no passage text, report that and ask for the source text.
- After the JSON, give the teacher the number of entries per section and note any uncertain levels, ambiguous meanings, or unique text in a combined passage that needs a separate section.
