# Make a Langkah English mock test with any AI

Give the other AI this guide. It contains the quiz and catalogue formats used by the site. You supply the topic or approved test and make the GitHub edits yourself. No existing site files are needed as input.

## School topic tests — Grade 12 Argumentative Text example

For a school topic, use the two prompts below in place of the UTBK/TKA prompts. The quiz file uses the same question formats shown later in this guide.

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

**Reuse for another topic.** Copy the lesson ID from the part after `?id=` in its website address. Give the AI that ID, the grade, the learning objectives in your own words, and a fresh quiz ID. For another test on the same topic, use a new suffix such as `-test-02`. Choose the timer yourself (0 for untimed, 1800 for 30 minutes). For questions about an exact passage already taught, paste just that passage into your prompt. For fresh texts assessing the same skills, the learning objectives are enough.

## First message to the AI — write the test

> Write an original, unofficial [UTBK or TKA] English reading mock test for [learners], with [number] questions in [minutes] minutes. Cover [skills or topics]. Use [question formats and choice counts]. Write the student paper first, then a separate answer key with an exact supporting quotation and a short Indonesian explanation for each item. Include plausible distractors and check that each key follows from the passage. Wait for my content approval before converting it.

The site's existing UTBK mocks use 20 questions in 20 minutes. Its existing TKA mocks use 30 questions in 45 minutes. These are site examples. The teacher can choose a different length. For reading tests, include a mix of locating evidence, connecting ideas, inference and evaluation suited to the requested level. Keep English prompts and options free of hints from the answer key.

## Second message to the AI — package the approved test

> Follow this guide to convert the approved paper. My new quiz ID is [ID], the pathway is [utbk or tka], and the title is [title]. Give me (1) the complete quiz JSON, (2) one catalogue resource object to paste, and (3) for TKA, the ID token to add to the mock list. Keep the question order, option order, passages and keys I approved. Check every quotation, index, translation and count. Stop and identify the exact question if the approved paper has an ambiguous key or missing evidence. Return complete, separate, copyable outputs. Never reconstruct the site's catalogue from memory. If the test is long, provide a downloadable JSON file if possible. Never abbreviate questions with ellipses.

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

The site discovers quizzes through the `resources` array in `data/catalog.json`. Return just **one object** like this, customized for the new quiz. The owner inserts it into the current file. Use existing lesson IDs for `relatedLessons` only if supplied by the owner. An empty array works.

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

## Output 3 — TKA only

The dedicated TKA simulations list reads `mockIds` in `js/tka.js`. Give the owner the new ID as a quoted token with a leading comma, for example `, 'tka-library-trial-demo'`. They paste it immediately before the closing bracket of the existing `const mockIds=[...];` line. Keep all current IDs. Some descriptive text also mentions the old total in `js/i18n.js` and `tka.html`; the owner can update that wording when increasing the total.

## Publish from a phone

1. Open the repository on GitHub in your browser. Create a branch from the latest `main` using the branch selector. Make the following edits on that same branch.
2. Check that the proposed filename is unused under `data/quizzes/`. If it exists, choose a fresh ID and ask the AI to update both outputs. Open that folder, choose **Add file → Create new file**, enter the filename and paste only the quiz JSON. Commit the change to your branch. If you downloaded the JSON, **Upload files** in that folder also works.
3. Open `data/catalog.json` and tap the edit pencil. Find `"resources": [`. Immediately after that opening bracket, paste the new catalogue object, then type **one comma** between it and the first existing object. Commit. The entry snippet belongs inside this file.
4. For TKA, edit the mock ID list as described above and commit on the same branch.
5. Open a pull request from your branch into `main`. If Cloudflare supplies a preview link, open the appropriate pathway there. Find the mock, check the timer, read a passage, answer each format, submit, and compare the result with your approved key. If a local checkout is available, the project check is `python3 -B tools/validate.py` from its root (dependency in `tools/requirements.txt`).
6. Merge when satisfied. After the Pages deployment completes, open the quiz from the public pathway. Its direct address also works at `https://langkah-english.pages.dev/quiz?id=YOUR-ID`.

This guide describes the site's November 2026 quiz format. Reuse it for subsequent tests as long as the quiz and catalogue formats stay the same.
