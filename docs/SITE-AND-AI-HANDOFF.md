# Langkah English site and AI handoff

Verified against repository revision `50dddd4`, 21 November 2026. Give another AI this file and your brief to generate compatible content without sharing repository files. Refresh the guide when routes, schemas, renderer behavior, or publishing steps change.

## Start here

> Identify whether I need a lesson, an embedded practice item, a topic test, an SAS exercise, a full simulation, or another listing for an existing resource. Confirm the pathway, grade and semester when relevant, the learning goals, the question count and timer, and the passage theme for reading tasks. Ask for the exact lesson or quiz ID if linking to an existing resource. Draft the student material and separate answer key for my review. After approval, return each complete new UTF-8 JSON file with its destination path and small paste-ready edits for existing files. Check the formats and relationships against this guide. If you cannot run the actual validator, say which checks you performed. Use current originals only if I ask for complete replacement files.

A lesson or quiz ID is the value after `?id=` in its URL. The existing [mock-test handoff](MOCK-TEST-HANDOFF.md) has a topic index and prompts for building assessment papers. The formats and examples below also work independently of that guide.

## Repository and page map

Langkah English is a static HTML, CSS, and vanilla JavaScript site served by Cloudflare Pages. Use a local HTTP server to preview it because the browser loads JavaScript modules and fetches JSON. HTML files provide the page structure, shared navigation, and containers that the page modules fill.

| Where | Responsibility and dependencies |
|---|---|
| `index.html` and `js/home.js` | Homepage, pathway shortcuts, continuation and progress dashboard. Reads the catalogue and the browser’s progress. Backup controls use `js/backup.js` and `js/backup-format.mjs`. |
| `grammar.html`, `school.html`, `sas.html`, `utbk.html` and `js/pathway.js` | Lists catalogue resources by difficulty, school grade, SAS grade and semester, or UTBK resource type. |
| `tka.html` and `js/tka.js` | Lists the TKA modules, support lessons, and simulations. Dedicated lists use IDs declared in the script alongside catalogue placements. |
| `search.html` and `js/search.js` | Searches catalogue metadata such as titles, descriptions, topics, skills, and tags. |
| `lesson.html`, `js/lesson.js` and `js/core.js` | Loads a lesson by catalogue ID. Shared JS renders the teaching blocks. The lesson module runs formative checks and embedded practice and displays links from `assessments`. |
| `quiz.html`, `js/quiz.js` and `js/question-types.mjs` | Loads a standalone quiz by catalogue ID, runs practice or simulation, validates responses, computes scores, and saves drafts and attempts. |
| `results.html` and `js/results.js` | Reads the attempt saved by the quiz, and displays score and review using its saved question and passage data. |
| `js/core.js`, `js/i18n.js`, `js/shell.js`, `js/translations.js` | Shared data loading, links and progress, ID/EN interface strings, navigation, and quiz translation disclosures. Authored content carries its own English and Indonesian text. |
| `css/style.css` and `assets/` | Shared styling, responsive layouts, icons, artwork and content images. Use existing repository-relative paths and add any new referenced asset with the content. |
| `data/catalog.json`, `data/lessons/`, `data/quizzes/` | Resource index, lesson bodies, and standalone quizzes. Catalogue metadata controls where and how each resource appears. |
| `data/schemas/`, `tools/`, `tests/`, `AGENTS.md`, `docs/` | Schemas, validator and its dependency list, regression tests, authoring rules and guidance. Use current schemas and runtime behavior when dated release notes differ. |

## How the files connect

- Every resource needs a unique lowercase ID using letters, digits and single hyphens. The catalogue ID, JSON `id` and filename stem must match. Add one object inside the existing catalogue’s `resources` array. Its `file` must be `data/lessons/<id>.json` or `data/quizzes/<id>.json`. Links take the form `lesson.html?id=<id>` or `quiz.html?id=<id>`.
- The catalogue entry contains `id`, `title`, `description`, `type`, `placements`, `difficulty`, `grammarTopics`, `readingSkills`, `tags`, `relatedLessons`, `file`, `aiGenerated` and `unofficial`. Each quiz also needs `kind` of `practice` or `test`. Difficulty is `Beginner`, `Intermediate` or `Advanced`. Use empty arrays for unused lists. If supplied, `relatedLessons` and lesson `prerequisites` must use existing IDs. The first placement supplies the primary track for navigation and presentation.
- A lesson’s `assessments` array creates buttons leading to registered quizzes. A quiz’s `relatedLessons` is catalogue metadata. To add the button on the lesson, append the quiz ID to that lesson’s `assessments`.
- A quiz question’s `passageId` points to an ID inside that quiz’s `passages`. Its `evidence` quotes an exact substring of the passage. The question belongs in the quiz’s `questions` array even when several questions use the same passage.
- Published resource IDs anchor lesson completion, quiz drafts, and attempts in browser storage. Keep them when making editorial updates and use a fresh ID for a new paper. A changed quiz JSON can invalidate an in-progress draft because resuming checks the quiz snapshot. The results page uses a saved attempt. Interface language and quiz spacing are device preferences with separate storage.

## Add content

| Request | Files and placement |
|---|---|
| New lesson | Write the complete lesson JSON and its catalogue entry. For school, use `{"pathway":"school","grade":12}` with the correct grade from 9 to 12. Use `{"pathway":"grammar"}` or `{"pathway":"utbk"}` as appropriate. Ask for the intended TKA module or support list if applicable. |
| Embedded practice | Append a single-answer item with a fresh question ID to the lesson’s `practice` array. Keep this for short practice with immediate feedback inside the lesson. |
| School topic test | Write one quiz JSON and one catalogue entry with a school placement, `kind: "test"` and `examFormat: "topic"`. For an optional lesson button, append the ID to `assessments`. |
| SAS exercise | Use the same quiz format and a placement such as `{"pathway":"sas","grade":12,"semester":1}`. The site lists it automatically. Choose the grade and semester based on the school’s teaching sequence. Add a school placement to show the same exercise on both pages. |
| Full UTBK or TKA mock | Use a quiz entry with the appropriate pathway, `kind: "test"` and `examFormat: "full"`. Set a positive timer and matching `referenceFormat` values. For TKA, append the quiz ID to `mockIds` in `js/tka.js` and review any fixed simulation count in page copy. |
| Another listing for an existing quiz | Add a placement to the existing catalogue entry. The listing uses the same file, ID, and progress. |

For a feature that changes the interface or introduces a new format, inspect the current files involved. A new lesson block, for example, requires a compatible schema, renderer and validation checks. A new pathway needs the catalogue, listing behavior, navigation and translations to agree. The content recipes here use features the site already supports.

## Lesson format

A lesson requires `id`, `objectives`, `blocks`, `practice`, and `assessments`. The last two can be empty arrays. Each block needs a `type`. These are the supported blocks and their fields.

| Type | Required fields in addition to `type` | Optional fields |
|---|---|---|
| `heading`, `subheading`, `rule` | `text` | |
| `text` | `text` | `idText` |
| `definition`, `synthesis` | `title`, `text` | |
| `example` | `text` | `note` |
| `mistake` | `incorrect`, `correct`, `explanation` | |
| `table` | `headers` (strings), `rows` (arrays of strings, one cell per header) | |
| `vocabulary` | `title`, `items` with `english` and `indonesian` | |
| `example_group` | `title`, `collapsed` (boolean), `items` with `english`, `indonesian`, `note` | |
| `breakdown` | `sentence`, `parts` with `english` and `meaning` | |
| `summary` | `title`, `items` (strings) | |
| `scaffold` | `steps` with `title` and `explanation` | Block fields `title`, `intro`, `modelEnglish`, `modelIndonesian`, `modelTitle`, `modelPosition` (`before` or `after`), `modelNote`, `modelImage`, `modelImageAlt`. Step fields `english`, `indonesian`, `why`, `phase`, and paired `check` and `checkAnswer`. |
| `checkpoint` | `id`, `prompt`, `translation`, three `choices`, three ordered `translationChoices`, integer `answer`, `hint`, `explanation` | |
| `reflection` | `prompt`, `translation`, `answer` | |
| `self_check` | `title`, `prompt`, `model`, `modelTranslation`, `criteria` | |

Use natural Indonesian for instructional prose. Mark English terms in Indonesian prose with `[[double brackets]]` where the renderer formats those fields. Use plain text for English passages, prompts and choices. Keep English and Indonesian models aligned in meaning and paragraph breaks. Use the same scenario through connected reading instruction. Use independent examples or minimal pairs when they serve a grammar objective. Write step titles without list numbering and give each step a distinct purpose. Show both A and B in comparison reflections, including in the visible Indonesian prompt. Provide a model that completes every part of a self-check. For breakdowns, choose the smallest unit that teaches the point, including a single word when appropriate.

Embedded `practice` items require `id`, `prompt`, `choices`, `answer`, and `explanation`. Use an integer choice index starting from zero. Optional `translationId` contains `prompt` and ordered `choices`. If translating options would erase a grammar distinction, omit the translated choices. Keep passage-linked questions in a standalone quiz with its own passage records.

### Complete example lesson

```json
{
  "id": "library-notices-demo",
  "objectives": [
    "Menemukan informasi yang disebut langsung dalam pengumuman."
  ],
  "blocks": [
    {
      "type": "definition",
      "title": "Informasi tersurat",
      "text": "Informasi tersurat dapat ditunjuk langsung dalam bacaan."
    },
    {
      "type": "scaffold",
      "intro": "Cari hari yang disebut dalam pengumuman.",
      "steps": [
        {
          "title": "Temukan keterangan hari",
          "explanation": "Cari hari perpustakaan buka.",
          "english": "The library opens on Saturday.",
          "indonesian": "Perpustakaan buka pada Sabtu.",
          "why": "Bagian [[on Saturday]] menyebut hari secara langsung."
        }
      ]
    },
    {
      "type": "summary",
      "title": "Yang perlu diingat",
      "items": [
        "Tunjukkan kata yang mendukung jawabanmu.",
        "Periksa apakah kata itu benar-benar menyebut hari yang ditanyakan."
      ]
    }
  ],
  "practice": [
    {
      "id": "q1",
      "prompt": "Which phrase names the day in “The library opens on Monday”?",
      "choices": [
        "the library",
        "on Monday",
        "opens",
        "the library opens"
      ],
      "answer": 1,
      "explanation": "Bagian [[on Monday]] menunjukkan bahwa hari yang dimaksud adalah Senin."
    }
  ],
  "assessments": [
    "tka-library-trial-demo"
  ]
}
```

### Catalogue entry for the sample lesson

```json
{
  "id": "library-notices-demo",
  "title": "Membaca Pengumuman Perpustakaan",
  "description": "Contoh membaca pengumuman perpustakaan.",
  "type": "lesson",
  "placements": [
    {
      "pathway": "school",
      "grade": 12
    }
  ],
  "difficulty": "Intermediate",
  "grammarTopics": [],
  "readingSkills": [
    "Supporting Details"
  ],
  "tags": [
    "reading"
  ],
  "relatedLessons": [],
  "file": "data/lessons/library-notices-demo.json",
  "aiGenerated": true,
  "unofficial": true
}
```


## Standalone quiz format

At the top level, use `id`, `questionCount`, `durationSeconds`, `passages`, and `questions`. Set the count to the number of questions and the timer in seconds, with 0 for an untimed quiz. For a full simulation, include `referenceFormat.questionCount` and `referenceFormat.durationSeconds` matching the positive top-level values. A passage has an `id`, `title`, and `text`. Use unique passage and question IDs within the quiz and use JSON newline escapes for paragraph breaks. Independent items can omit `passageId` and `evidence`. Supply an empty `passages` array when the quiz has no passages.

Every question requires `id`, `prompt`, and `explanation`. Choose one answer format.

| Format | Fields and scoring |
|---|---|
| Single answer | `questionType: "single"` or omit the type. Use `choices` and one integer `answer` from 0 to the last choice index. |
| Multiple answer | `questionType: "multiple"`, `choices`, and `answers` with at least two distinct valid indices. The full set must match. |
| Category | `questionType: "category"`, 2–6 distinct `categories`, and 2–12 `statements` with `text` and `answerCategory` matching an exact label. Each row may have an `explanation`. All rows must match. |

Choice-based items support 2–8 distinct options, except assessments with a stricter four-choice contract. Keep approved choice order and use A = 0, B = 1, and so on. For choice-based items, optional `choiceExplanations` must match the choice order and count. Use `translationId.prompt` and, where appropriate, `translationId.choices` or `translationId.categories` and `translationId.statements`. Translated lists must match their English counterparts in length and order. Keep translations neutral. Explain answers in Indonesian and review the source evidence manually. Practice shows translation support. Simulation uses the English test items.

### Complete example quiz showing all three formats

```json
{
  "id": "tka-library-trial-demo",
  "questionCount": 3,
  "durationSeconds": 300,
  "referenceFormat": {
    "questionCount": 3,
    "durationSeconds": 300
  },
  "passages": [
    {
      "id": "text-1",
      "title": "A library trial",
      "text": "For two weeks, the library will open on Saturdays. Volunteers will record visitor numbers.\n\nAfter the trial, the head librarian will use the records to decide whether to keep the new hours."
    }
  ],
  "questions": [
    {
      "id": "q1",
      "questionType": "single",
      "passageId": "text-1",
      "skill": "Author’s Purpose",
      "prompt": "Why will volunteers count visitors?",
      "choices": [
        "To assign seats",
        "To inform a decision about Saturday opening",
        "To set a limit on membership",
        "To decide who may borrow books"
      ],
      "answer": 1,
      "evidence": "the head librarian will use the records to decide whether to keep the new hours",
      "explanation": "Catatan kunjungan dipakai untuk memutuskan apakah perpustakaan akan tetap buka pada Sabtu. Bacaan tidak menyebut pembagian kursi atau pembatasan anggota.",
      "translationId": {
        "prompt": "Mengapa relawan akan menghitung pengunjung?",
        "choices": [
          "Untuk menentukan tempat duduk",
          "Sebagai bahan pertimbangan untuk membuka perpustakaan pada Sabtu",
          "Untuk membatasi jumlah anggota",
          "Untuk menentukan siapa yang boleh meminjam buku"
        ]
      }
    },
    {
      "id": "q2",
      "questionType": "multiple",
      "passageId": "text-1",
      "prompt": "Which two details describe the trial?",
      "choices": [
        "It lasts two weeks.",
        "It includes Sunday mornings.",
        "Volunteers count visitors.",
        "Teachers choose the opening hours."
      ],
      "answers": [
        0,
        2
      ],
      "evidence": "For two weeks, the library will open on Saturdays. Volunteers will record visitor numbers.",
      "explanation": "Dua rincian disebut langsung, yaitu durasi dua minggu dan tugas relawan mencatat jumlah pengunjung. Hari yang disebut adalah Sabtu, dan keputusan ada pada kepala perpustakaan.",
      "translationId": {
        "prompt": "Dua rincian mana yang menggambarkan uji coba?",
        "choices": [
          "Uji coba berlangsung dua minggu.",
          "Uji coba mencakup Minggu pagi.",
          "Relawan menghitung pengunjung.",
          "Guru menentukan jam buka."
        ]
      }
    },
    {
      "id": "q3",
      "questionType": "category",
      "passageId": "text-1",
      "prompt": "Classify each claim according to the notice.",
      "categories": [
        "Supported",
        "Contradicted"
      ],
      "statements": [
        {
          "text": "The final decision comes after the trial.",
          "answerCategory": "Supported"
        },
        {
          "text": "The Saturday hours are already permanent.",
          "answerCategory": "Contradicted"
        }
      ],
      "evidence": "After the trial, the head librarian will use the records to decide whether to keep the new hours.",
      "explanation": "Keputusan akhir baru diambil sesudah uji coba. Karena itu, pernyataan bahwa jam buka Sabtu sudah permanen bertentangan dengan pengumuman.",
      "translationId": {
        "prompt": "Kelompokkan setiap pernyataan berdasarkan pengumuman.",
        "categories": [
          "Didukung",
          "Bertentangan"
        ],
        "statements": [
          "Keputusan akhir diambil setelah uji coba.",
          "Jam buka Sabtu sudah ditetapkan secara permanen."
        ]
      }
    }
  ]
}
```

### Catalogue entry for the sample quiz

```json
{
  "id": "tka-library-trial-demo",
  "title": "Simulasi TKA · Uji Coba Perpustakaan",
  "description": "Contoh membaca pengumuman perpustakaan.",
  "type": "quiz",
  "placements": [
    {
      "pathway": "tka"
    }
  ],
  "difficulty": "Intermediate",
  "grammarTopics": [],
  "readingSkills": [
    "Supporting Details"
  ],
  "tags": [
    "reading"
  ],
  "relatedLessons": [
    "library-notices-demo"
  ],
  "file": "data/quizzes/tka-library-trial-demo.json",
  "aiGenerated": true,
  "unofficial": true,
  "kind": "test",
  "examFormat": "full"
}
```

## Validate and publish

1. Review the draft paper before conversion. Verify the answer keys, evidence, translations, and fit with the lesson objectives. Keep the JSON valid UTF-8 with double quotes, no comments, and no trailing commas.
2. In your phone browser, create a GitHub branch from the current `main`. In `data/lessons/` or `data/quizzes/`, choose **Add file → Create new file** and paste the complete new JSON under its exact filename. Use **Upload files** if you already have the JSON on your phone.
3. Open `data/catalog.json` on the same branch. Paste the new resource object immediately after the opening bracket of `resources`, followed by a comma before the next object. Add any recipe-specific links to existing arrays, preserving their other entries. If requesting complete replacements from the AI, supply the latest exact originals and review the resulting diff.
4. With a local checkout, install the validator dependency using `python3 -m pip install -r tools/requirements.txt`, then run `python3 -B tools/validate.py` from the repository root. To preview locally serve the root with `python3 -m http.server 8000`. Content edits should pass schema and relationship checks. For changes to quiz behavior, also run `node tests/scoring.mjs` and `node tests/v13b-assessment.mjs`.
5. Open a pull request. In the Cloudflare preview if available, find the resource from the intended pathway and search, open the lesson link if one was added, check phone-width rendering and the ID/EN interface, and try an answer and submit a quiz to confirm the result and timer. The validator checks structure and references. Preview and editorial review check what students see and whether the questions teach or assess the intended skill.
6. Review the diff before merging and open the deployed page after Cloudflare Pages finishes.
