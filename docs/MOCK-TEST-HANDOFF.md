# Make a Langkah English mock test with any AI

**MOCK-TEST-HANDOFF v3 — updated 20 November 2026**

Give the other AI this guide. It contains the quiz and catalogue formats used by the site, the lesson index, and a phone-friendly publishing workflow. You choose the lesson, question count, and reading-passage theme, then approve the paper before conversion. Existing site files are not needed to draft a test. However, to create complete replacement copies of `data/catalog.json` and a lesson JSON for the easier delete-and-upload method, upload the current versions of those exact files to the AI. The AI must preserve their existing content and must not reconstruct them from memory.

## Choose a lesson, question count, and passage theme

> Help me choose a lesson for a mock test. Start with a menu of Grade 9, Grade 10, Grade 11, Grade 12, Grammar, UTBK, TKA, and SAS. For SAS, use the grade and semester workflow below. When I choose a group, list its lesson titles alphabetically from the topic index at the end of this guide. If I ask for all topics, list each lesson once and show all its groups. When I choose a lesson, confirm its exact ID and ask how many questions I want. After I choose the question count, ask what topic or theme I want the reading passages to cover. Do not assume the passages should be about school, classrooms, students, or canteens. The passage theme is separate from the lesson skill or text type: for example, a Hortatory Exposition test can use passages about climate change, artificial intelligence, health, sports, business, history, culture, or social issues. Use the theme I choose. If I give one broad theme, create varied passages about related aspects of it. If I give a specific topic, keep all passages focused on it. Do not start drafting until the passage theme is clear.

## Persiapan SAS — semester exercises

> Ask for my grade (9–12), semester (1 or 2), and the topics my school covered. Show lessons from that grade in the topic index if I want suggestions. Ask whether I want one topic or a mixed semester test, then ask for question count, passage theme if relevant, and timer. Base the paper on my chosen topics. Wait for content approval before packaging.

For example, a teacher might choose Grade 12, Semester 1, argumentative texts, 20 questions, and an environmental theme. This is an example of a teacher's selection. Confirm the semester with the teacher for each new test.

Use the school topic catalogue object below as a template. Choose a fresh ID such as `sas-grade12-sem1-arguments-01` and use it in the quiz JSON, catalogue ID and quiz filename. Update the title, description, skills, related lessons and tags to match the paper. Use `kind: "test"` and `examFormat: "topic"` for a focused or mixed school exercise. Set the agreed timer in seconds (0 for untimed) and omit `referenceFormat`.

For a SAS-only listing, set the catalogue entry's placements to:

```json
[{"pathway":"sas","grade":12,"semester":1}]
```

To also list the same paper under Materi Sekolah, use:

```json
[{"pathway":"sas","grade":12,"semester":1},{"pathway":"school","grade":12}]
```

Upload one quiz JSON and add one catalogue entry. The SAS page lists it automatically under the assigned grade and semester. Open **Persiapan SAS → Kelas 12 → Semester 1** on the preview and try the quiz. Updating a lesson's assessments is optional and only adds a button inside that lesson. For a standalone mixed test, skip all lesson-file editing, uploading and replacement steps below. Existing quizzes can also be listed by adding the SAS placement to their current entry, keeping their ID and file.

## Example: School topic test — Grade 12 Argumentative Text

This is one school-based example, not the default setting for every mock test. Use this canteen context only when the user chooses a school-life theme. For other user-selected themes, create fresh passages in the requested real-world context while retaining the lesson objectives and quiz schema. For a school topic, use the two prompts below in place of the UTBK/TKA prompts. The quiz file uses the same question formats shown later in this guide.

**1. Ask the AI to write the student paper**

> Write an original, unofficial 20-question Grade 12 English test on argumentative texts. Write four short English passages with five questions each. Include a canteen policy trial where the evidence comes from a limited group and a student raises an access concern. Use three fresh contexts for the other passages. Across the test, ask students to identify the writer’s position, distinguish reasons from evidence, judge how far trial results support a wider policy, and choose a response that addresses a counterargument using evidence. Give each question four plausible choices with one best answer. Put the key, supporting quotations and student-friendly Indonesian explanations after the paper. Wait for my approval before converting.

**2. After reviewing the questions, ask for the site outputs**

> Package my approved paper as an untimed school topic test. Use quiz ID `grade12-argumentative-text-test-01`, lesson ID `grade12-argumentative-text`, 20 questions, and `durationSeconds: 0`. Follow this guide’s quiz, evidence, answer-index and Indonesian translation rules. Omit `referenceFormat`. Give me the complete quiz JSON, the single catalogue object below, and the quoted quiz ID to append to the lesson’s assessments. Preserve my approved keys and check each one against its final choices and passage.

Catalogue object for this example:

```json
{
  "id": "grade12-argumentative-text-test-01",
  "title": "Tes Teks Argumentatif · Kelas 12 · Paket 1",
  "description": "Latihan mandiri 20 soal tentang posisi penulis, kekuatan bukti, dan tanggapan terhadap keberatan.",
  "type": "quiz",
  "kind": "test",
  "examFormat": "topic",
  "placements": [{"pathway": "school", "grade": 12}],
  "difficulty": "Advanced",
  "grammarTopics": [],
  "readingSkills": ["Main Idea", "Supporting Details", "Critical Reading"],
  "tags": ["teks argumentatif", "kelas 12"],
  "relatedLessons": ["grade12-argumentative-text"],
  "file": "data/quizzes/grade12-argumentative-text-test-01.json",
  "aiGenerated": true,
  "unofficial": true
}
```

**3. Publish from your phone.** On one GitHub branch, create the quiz file at the path above and insert the catalogue object into the existing `resources` array as described under “Publish from a phone.” That puts the test under Materi Sekolah → Kelas 12 → Latihan. To also give students a button at the end of the lesson, open `data/lessons/grade12-argumentative-text.json`, find `assessments`, and append the new quiz ID. For a lesson with the original practice link, the result looks like this:

```json
"assessments": [
  "grade12-argumentative-text-practice",
  "grade12-argumentative-text-test-01"
]
```

Keep any other IDs already present. Preview both entry points and submit a trial attempt before merging. The TKA mock-list step applies only to TKA simulations.

**Reuse for another test.** Copy the lesson ID from the part after `?id=` in its website address. Give the AI that ID, the grade or pathway, the learning objectives in your own words, and a fresh quiz ID. For another test on the same lesson, use a new suffix such as `-test-02`. Choose the timer yourself (0 for an untimed school topic test, 1800 for 30 minutes). The AI must ask for the passage theme after you choose the question count; never silently default to school-life passages. For questions about an exact passage already taught, paste just that passage into your prompt. For fresh texts assessing the same skills, the learning objectives are enough.

## First message to the AI — write the test

> Write an original, unofficial [school topic / UTBK / TKA] English reading mock test for [learners], with [number] questions in [minutes] minutes. Lesson or text type: [selected lesson and ID]. Passage theme: [the theme I selected after choosing the question count]. Do not default to school-life contexts unless I selected that theme. Use [number of passages and questions per passage]. Cover [lesson skills or learning objectives]. Use [question formats and choice counts]. Write the student paper first, then a separate answer key with an exact supporting quotation and a short Indonesian explanation for each item. Include plausible distractors and check that each key follows from the passage. Wait for my content approval before converting it.

The site's existing UTBK mocks use 20 questions in 20 minutes. Its existing TKA mocks use 30 questions in 45 minutes. These are site examples. The teacher can choose a different length. For reading tests, include a mix of locating evidence, connecting ideas, inference and evaluation suited to the requested level. Keep English prompts and options free of hints from the answer key.

## Second message to the AI — package the approved test

> Follow this guide to convert the approved paper. My new quiz ID is [ID], lesson ID is [lesson ID], pathway is [school, utbk, tka, or sas], grade is [grade if school or SAS], semester is [1 or 2 for SAS], examFormat is [topic or full], and durationSeconds is [number]. For an untimed school topic test, use `durationSeconds: 0` and omit `referenceFormat`. Give me (1) the complete quiz JSON, (2) one catalogue resource object, (3) the quoted quiz ID to append to the lesson's `assessments` array for a school lesson, and (4) for TKA only, the ID token to add to the mock list. Keep the question order, option order, passages, selected passage theme, and keys I approved. Check every quotation, index, translation and count. Stop and identify the exact question if the approved paper has an ambiguous key or missing evidence. Return complete, separate, copyable outputs. Never reconstruct the site's catalogue from memory. If I upload the current `catalog.json` and current lesson JSON, also create complete updated replacement files based on those exact originals, preserving every unrelated resource and existing assessment ID. If the current files are not supplied, return only the catalogue object and assessment ID; do not invent a full replacement file. If the test is long, provide a downloadable JSON file if possible. Never abbreviate questions with ellipses.

## Output 1 — the quiz file

Use UTF-8 JSON with double quotes, no comments and no trailing commas. The destination is `data/quizzes/<id>.json`. Choose a new ID consisting of lowercase letters, digits and single hyphens. Keep the filename, quiz ID and catalogue ID identical. Use distinct passage IDs and distinct question IDs within the quiz.

The following small working example illustrates all three supported formats. Use the teacher's requested number of passages and questions for the actual mock.

```json
{
  "id": "tka-library-trial-demo",
  "questionCount": 3,
  "durationSeconds": 300,
  "referenceFormat": {"questionCount": 3, "durationSeconds": 300},
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
      "choices": ["To assign seats", "To inform a decision about Saturday opening", "To set a limit on membership", "To decide who may borrow books"],
      "answer": 1,
      "evidence": "the head librarian will use the records to decide whether to keep the new hours",
      "explanation": "Catatan kunjungan dipakai untuk memutuskan apakah perpustakaan akan tetap buka pada Sabtu. Bacaan tidak menyebut pembagian kursi atau pembatasan anggota.",
      "translationId": {"prompt": "Mengapa relawan akan menghitung pengunjung?", "choices": ["Untuk menentukan tempat duduk", "Sebagai bahan pertimbangan untuk membuka perpustakaan pada Sabtu", "Untuk membatasi jumlah anggota", "Untuk menentukan siapa yang boleh meminjam buku"]}
    },
    {
      "id": "q2",
      "questionType": "multiple",
      "passageId": "text-1",
      "prompt": "Which two details describe the trial?",
      "choices": ["It lasts two weeks.", "It includes Sunday mornings.", "Volunteers count visitors.", "Teachers choose the opening hours."],
      "answers": [0, 2],
      "evidence": "For two weeks, the library will open on Saturdays. Volunteers will record visitor numbers.",
      "explanation": "Dua rincian disebut langsung, yaitu durasi dua minggu dan tugas relawan mencatat jumlah pengunjung. Hari yang disebut adalah Sabtu, dan keputusan ada pada kepala perpustakaan.",
      "translationId": {"prompt": "Dua rincian mana yang menggambarkan uji coba?", "choices": ["Uji coba berlangsung dua minggu.", "Uji coba mencakup Minggu pagi.", "Relawan menghitung pengunjung.", "Guru menentukan jam buka."]}
    },
    {
      "id": "q3",
      "questionType": "category",
      "passageId": "text-1",
      "prompt": "Classify each claim according to the notice.",
      "categories": ["Supported", "Contradicted"],
      "statements": [
        {"text": "The final decision comes after the trial.", "answerCategory": "Supported"},
        {"text": "The Saturday hours are already permanent.", "answerCategory": "Contradicted"}
      ],
      "evidence": "After the trial, the head librarian will use the records to decide whether to keep the new hours.",
      "explanation": "Keputusan akhir baru diambil sesudah uji coba. Karena itu, pernyataan bahwa jam buka Sabtu sudah permanen bertentangan dengan pengumuman.",
      "translationId": {"prompt": "Kelompokkan setiap pernyataan berdasarkan pengumuman.", "categories": ["Didukung", "Bertentangan"], "statements": ["Keputusan akhir diambil setelah uji coba.", "Jam buka Sabtu sudah ditetapkan secara permanen."]}
    }
  ]
}
```

### Conversion rules

- A full mock needs a positive integer timer in seconds (minutes × 60). Set both counts to the actual length of the questions array. The count and timer inside `referenceFormat` must equal the top-level values.
- A passage is stored once. Each linked question gets its exact `passageId` and a nonempty `evidence` quotation that occurs verbatim inside that passage's `text`. Preserve spelling, punctuation and case. Use JSON `\n\n` for paragraph breaks. For a genuinely independent item, omit both passage fields on that question. The top-level `passages` array is always required.
- Single answer uses `choices` and one integer `answer`. Convert A to 0, B to 1, C to 2 and so on. Multiple answer uses `choices` and `answers` with at least two distinct in-range indices. An exact match earns the point. Both formats support 2–8 distinct, nonblank choices. Use the count the teacher requested.
- Category uses 2–6 distinct labels and 2–12 statements. Each `answerCategory` must match an English label exactly. All rows must be correct for the point. Omit `choices`, `answer` and `answers` on these items.
- Give every item a nonblank English prompt and student-friendly Indonesian `explanation`. Explain the evidence and the most tempting error. The site supports `[[English terms]]` in Indonesian explanations. Leave English passages, options, exact evidence and answer labels as plain text.
- Supply `translationId.prompt` and translate each choice, category or statement into Indonesian in the same order. Preserve the strength of words such as “may”, “must” and “all”. Do not mark an option correct in its translation. For optional `choiceExplanations`, supply one entry per choice if used.
- The answer keys are indices or labels, never option letters, translated labels, or strings containing numbers. Confirm every key against the final ordering.

## Output 2 — one catalogue entry

The site discovers quizzes through the `resources` array in `data/catalog.json`. Return just **one object** like this, customized for the new quiz. The owner can insert it into the current file. Use existing lesson IDs for `relatedLessons` only if supplied by the owner. An empty array works. If the owner supplies the current complete `catalog.json` and requests the phone-friendly replacement workflow, additionally return a complete updated `catalog.json` file based on that exact upload, preserving every existing resource and adding the new object once. Never rebuild the catalogue from memory or from the Topic Index.

```json
{
  "id": "tka-library-trial-demo",
  "title": "Simulasi TKA · Uji Coba Perpustakaan",
  "description": "Latihan mandiri membaca pengumuman. Tiga soal dalam lima menit.",
  "type": "quiz",
  "kind": "test",
  "examFormat": "full",
  "placements": [{"pathway": "tka"}],
  "difficulty": "Intermediate",
  "grammarTopics": [],
  "readingSkills": ["Supporting Details", "Author’s Purpose"],
  "tags": ["TKA", "simulasi"],
  "relatedLessons": [],
  "file": "data/quizzes/tka-library-trial-demo.json",
  "aiGenerated": true,
  "unofficial": true,
  "estimatedMinutes": 5
}
```

For UTBK use `{"pathway":"utbk"}` and UTBK-specific metadata. The UTBK page automatically lists registered quizzes with `examFormat` set to `full`. Difficulty is one of `Beginner`, `Intermediate`, or `Advanced`. To also list the quiz in Grade 12 school materials, add `{"pathway":"school","grade":12}` as another placement only if requested.

## Output 3 — lesson assessment ID for school topic tests

For a school topic test, append the new quiz ID to the `assessments` array in `data/lessons/<lesson-id>.json`. Keep every existing assessment ID. For example:

```json
"assessments": [
  "grade12-hortatory-exposition-practice",
  "grade12-hortatory-exposition-test-01"
]
```

Return the quiz ID as a quoted token so the owner can append it. If the owner uploads the current lesson JSON, also provide a complete updated lesson JSON file for the delete-and-upload method. Do not create a full lesson replacement from a lesson ID or topic index alone.

## Output 4 — TKA only

The dedicated TKA simulations list reads `mockIds` in `js/tka.js`. Give the owner the new ID as a quoted token with a leading comma, for example `, 'tka-library-trial-demo'`. They paste it immediately before the closing bracket of the existing `const mockIds=[...];` line. Keep all current IDs. Some descriptive text also mentions the old total in `js/i18n.js` and `tka.html`; the owner can update that wording when increasing the total.

## Publish from a phone — beginner-friendly workflow

**Important:** Do every change on one new branch created from the latest `main`. Never delete or replace files while the `main` branch is selected. The delete-and-upload method below avoids opening large JSON files, selecting all their text, or copying and pasting thousands of lines.

### Prepare the files

1. Download the new quiz JSON. Its filename must be `<id>.json`, without extra suffixes.
2. For the easiest full-file replacement method, upload the current `data/catalog.json` and the current `data/lessons/<lesson-id>.json` to the AI before asking it to package the approved test. Ask it to return complete updated copies of both files, preserving all existing resources, lesson content, and assessment IDs. The AI must use the supplied originals, not reconstruct the files from memory.
3. Rename the downloaded full replacement files on the phone so their filenames exactly match the repository files: `catalog.json` and `<lesson-id>.json`. Remove suffixes such as `.updated` from the local filenames. Keep the new quiz filename unchanged.

### Make the GitHub changes

1. Open the repository on GitHub in the phone browser. Create a branch from the latest `main`, for example `add-<lesson-id>-test-01`. Confirm that this new branch is selected before editing.
2. Open `data/quizzes/`. Check that `<id>.json` does not already exist. If it exists, stop and choose a fresh quiz ID. Use **Add file → Upload files**, select the new quiz JSON from Downloads, and commit it to the new branch.
3. Replace the catalogue without editing its text: open the existing `data/catalog.json`, use GitHub's **Delete file** action, and commit that deletion to the new branch. Return to the `data/` folder, choose **Add file → Upload files**, upload the complete replacement file named exactly `catalog.json` into that folder so its path is `data/catalog.json`, and commit it to the same branch. The replacement must contain the full catalogue, not just the new resource object.
4. Replace the lesson file the same way: open `data/lessons/<lesson-id>.json`, delete it and commit the deletion on the new branch. Then upload the complete replacement file named exactly `<lesson-id>.json` into `data/lessons/` and commit it to the same branch. The replacement must preserve all existing lesson content and assessment IDs, adding only the new quiz ID to `assessments`.
5. For TKA only, edit the mock ID list as described in Output 4 and commit on the same branch.

**If complete replacement files were not prepared:** Do not delete the existing files. Instead, edit `data/catalog.json` and insert the single catalogue object inside its existing `resources` array. Then edit the lesson JSON and append the quoted quiz ID to its existing `assessments` array, preserving all other entries.

### Review, test, and publish

6. Open a pull request from your branch into `main`. Check that the PR contains the new quiz file and the two updated files (plus the TKA list change if applicable).
7. If Cloudflare supplies a preview link, open it. Test both entry points: the quiz in Materi Sekolah → the selected grade → Latihan, and the assessment link at the end of the lesson. Read each passage, answer questions in every format, submit, and compare the result with the approved answer key. Check the timer and Indonesian explanations. If a local checkout is available, run `python3 -B tools/validate.py` from its root (dependency in `tools/requirements.txt`).
8. Merge only after the preview works. After the Pages deployment completes, open the quiz from the public pathway. Its direct address also works at `https://langkah-english.pages.dev/quiz?id=YOUR-ID`.

### Final publishing checklist

- [ ] The new quiz JSON is in `data/quizzes/` and its filename matches the quiz ID.
- [ ] The full `data/catalog.json` includes exactly one resource entry for the new quiz.
- [ ] The lesson's `assessments` array includes the new quiz ID and retains all previous IDs.
- [ ] The pull request targets `main` from the intended feature branch.
- [ ] The preview loads the quiz from the catalogue and from the lesson.
- [ ] The passage theme matches the user's choice; it was not silently changed to a school setting.
- [ ] The quiz submits and scores correctly against the approved key.
- [ ] The live public URL works after deployment.

This guide describes the site's November 2026 quiz format. Reuse it for subsequent tests as long as the quiz and catalogue formats stay the same.

## Version 2 changes

- The AI now asks for the reading-passage theme after the user chooses the lesson and question count. School-life settings are never assumed; the passage theme is user-selected and distinct from the lesson skill or text type.
- The guide supports full-file JSON replacements when the user supplies the current catalogue and lesson files. This enables the phone-friendly delete-and-upload workflow without manual copy/paste.
- The publishing checklist now covers the quiz file, catalogue registration, lesson assessment link, pull request, preview, scoring, and live deployment.
- The original quiz schema, conversion rules, catalogue example, and Topic Index are retained.

## Topic index

Catalogue snapshot from 20 November 2026. The 66 distinct lessons below include cross-listed materials. A shared lesson has the same ID wherever it appears. New catalogue additions will need to be added to this snapshot.

### Grade 10 (15)

- Basic Questions and Negatives — `basic-questions-negatives`
- Expressing Opinions and Supporting Reasons — `grade10-opinions-reasons`
- Fractured Stories: Changing Perspectives — `grade10-fractured-stories`
- Grade 10: Descriptive Text — Details, Space, and Atmosphere — `grade10-descriptive`
- Grade 10: Healthy Procedure — Preparing a Safe Snack Box — `grade10-healthy-procedure`
- Grade 10: Recounting Events and Time Relationships — `grade10-recount`
- Jembatan membaca · dari kalimat ke paragraf — `reading-bridge`
- Parts of Speech (Jenis Kata) — `parts-of-speech`
- Present Continuous Tense — `present-continuous`
- Reading Posters and Infographics — `grade10-visual-information`
- Sentence Structure (Struktur Kalimat) — `sentence-structure`
- Simple Past Tense — `simple-past`
- Simple Present Tense — `simple-present`
- Sports Event Recount — `grade10-sports-recount`
- Subject–Verb Agreement — `subject-verb-agreement`

### Grade 11 (10)

- Analytical exposition · Kelas 11 — `grade11-exposition`
- Analytical Exposition: Claims and Evidence — `grade11-exposition-evidence`
- Biography: Environmental Changemakers — `grade11-environmental-biography`
- Complex Sentence Structures — `complex-sentences`
- Conditional Sentences — `conditional-sentences`
- Describing Environmental Conditions — `grade11-environment-description`
- Digital Identity and Transactional Messages — `grade11-online-identity`
- Explanation texts · Kelas 11 — `grade11-explanation`
- Passive Voice — `passive-voice`
- Procedure Text: Personal Budgeting — `grade11-money-procedure`

### Grade 12 (12)

- Academic vocabulary in context · Kelas 12 — `grade12-academic-vocab`
- Advanced Grammar Analysis — `advanced-grammar-analysis`
- Advanced Narrative: Motives and Themes — `grade12-advanced-narrative`
- Adverbial Phrase vs. Adverbial Clause · Kelas 12 — `grade12-adverbial-phrase-vs-clause`
- Argumentative Text: Claims and Counterarguments — `grade12-argumentative-text`
- Caption Text: Reading and Writing Image Captions — `grade12-caption-text`
- Comparing Arguments and Evaluating Evidence — `grade12-compare-arguments`
- Critical reading · Kelas 12 — `grade12-critical-reading`
- Curriculum Vitae (CV): Writing a Student CV — `grade12-curriculum-vitae`
- Discussion Text: Weighing Two Sides — `grade12-discussion-text`
- Hortatory Exposition: Arguing for Action — `grade12-hortatory-exposition`
- Read with evidence: a strategy toolkit — `reading-strategies`

### Grade 9 (15)

- Basic Questions and Negatives — `basic-questions-negatives`
- Digital Safety: Protecting Personal Information — `grade9-digital-safety`
- Grade 9: Reading a Place — Descriptive Text — `grade9-reading`
- Grade 9: Recount Text — A School Trip — `grade9-trip-recount`
- Grade 9: Understanding a Narrative — Characters and Plot — `grade9-narrative`
- Jembatan membaca · dari kalimat ke paragraf — `reading-bridge`
- Noun Groups: Build and Describe — `grade9-noun-groups`
- Parts of Speech (Jenis Kata) — `parts-of-speech`
- Present Continuous Tense — `present-continuous`
- Procedure Text: Upcycling Materials — `grade9-upcycling-procedure`
- Report Text: Indonesian Wildlife — `grade9-report-animals`
- Sentence Structure (Struktur Kalimat) — `sentence-structure`
- Simple Past Tense — `simple-past`
- Simple Present Tense — `simple-present`
- Subject–Verb Agreement — `subject-verb-agreement`

### Grammar (23)

- Advanced Conditionals — `advanced-conditionals`
- Advanced Grammar Analysis — `advanced-grammar-analysis`
- Adverbial Phrase vs. Adverbial Clause · Kelas 12 — `grade12-adverbial-phrase-vs-clause`
- Basic Questions and Negatives — `basic-questions-negatives`
- Complex Sentence Structures — `complex-sentences`
- Conditional Sentences — `conditional-sentences`
- Gerunds and Infinitives — `gerunds-infinitives`
- Grade 10: Descriptive Text — Details, Space, and Atmosphere — `grade10-descriptive`
- Grade 9: Understanding a Narrative — Characters and Plot — `grade9-narrative`
- Inversion — `inversion`
- Modal Verbs — `modal-verbs`
- Parallel Structures — `parallel-structures`
- Parts of Speech (Jenis Kata) — `parts-of-speech`
- Passive Voice — `passive-voice`
- Perfect Tenses — `perfect-tenses`
- Present Continuous Tense — `present-continuous`
- Reduced Relative Clauses — `reduced-relative-clauses`
- Relative Clauses — `relative-clauses`
- Reported Speech — `reported-speech`
- Sentence Structure (Struktur Kalimat) — `sentence-structure`
- Simple Past Tense — `simple-past`
- Simple Present Tense — `simple-present`
- Subject–Verb Agreement — `subject-verb-agreement`

### TKA (18)

- Analytical Exposition: Claims and Evidence — `grade11-exposition-evidence`
- Comparing Arguments and Evaluating Evidence — `grade12-compare-arguments`
- Critical reading · Kelas 12 — `grade12-critical-reading`
- Grade 10: Descriptive Text — Details, Space, and Atmosphere — `grade10-descriptive`
- Grade 9: Understanding a Narrative — Characters and Plot — `grade9-narrative`
- Jembatan membaca · dari kalimat ke paragraf — `reading-bridge`
- Read with evidence: a strategy toolkit — `reading-strategies`
- Sentence Structure (Struktur Kalimat) — `sentence-structure`
- TKA-01 · Jembatan TKA: Dari Kalimat ke Bacaan — `tka-reading-foundations`
- TKA-02 · Informasi Tersurat dan Parafrasa — `tka-explicit-information`
- TKA-03 · Mengelompokkan, Membuat Kerangka, Meringkas, dan Mensintesis — `tka-classify-outline-summarize-synthesize`
- TKA-04 · Kosakata, Kata Rujukan, dan Penghubung dalam Konteks — `tka-context-vocabulary-reference-connectors`
- TKA-05 · Ide Tersirat, Pembaca, Tujuan, dan Pesan — `tka-implied-ideas-audience-purpose-message`
- TKA-06 · Inferensi, Sebab-Akibat, Karakter, dan Prediksi — `tka-inference-cause-character-prediction`
- TKA-07 · Mengevaluasi Fakta, Opini, dan Kecukupan Bukti — `tka-evaluating-facts-opinions-evidence`
- TKA-08 · Apresiasi Tokoh, Makna, dan Pilihan Bahasa — `tka-narrative-appreciation`
- TKA-09 · Mengenali Lima Genre Teks — `tka-five-text-genres`
- TKA-10 · Format Soal dan Latihan Mandiri — `tka-question-formats-independent-practice`

### UTBK (8)

- Academic vocabulary in context · Kelas 12 — `grade12-academic-vocab`
- Critical reading · Kelas 12 — `grade12-critical-reading`
- Jembatan membaca · dari kalimat ke paragraf — `reading-bridge`
- Read with evidence: a strategy toolkit — `reading-strategies`
- Subject–Verb Agreement — `subject-verb-agreement`
- UTBK Lab: Inference and Alternative Explanations — `utbk-critical-inference`
- UTBK Lab: Reading Scientific Evidence — `utbk-science-evidence`
- UTBK Lab: Reading Social-Science Data — `utbk-social-science`
