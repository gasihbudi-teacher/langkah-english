# V9 quality and release verification

Baseline: V8 plus the successfully registered Grade 12 adverbial add-on (93 total catalogue resources).

Automated checks cover original legacy scoring, content-file references, JSON parsing, JSON Schema validity, English-only question/choice presentation, source-passage references, question-option translations, site navigation script contracts, HTML/JavaScript syntax, and the V9 curriculum content structure.

**Content invariants:** all 54 lessons begin with a definition, have topic-specific guide steps, an immediate deeper synthesis, at least 10 distinct fully translated and explained worked-example cards, a self-check, and one last-position vocabulary block. Vocabulary displays after scored lesson practice. 54 lessons + 39 quizzes = 93 resources. 543 bilingual example cards. 389 scored/embedded practice questions (V8 372 + the 17 from the adverbial add-on); 54 ungraded lesson checkpoints and 54 newly added ungraded self-checks. The 3 full UTBK mock tests remain 20 questions and 20 minutes each.

**Corrected question keys:** `grade9-trip-recount-practice/q1` and `grade9-upcycling-procedure-practice/q1`, with aligned option translations and maintained answer-position balance. Older V7 scored questions retain their original fingerprint.

**Limitations:** JSON Schema and regression checks do not verify whether pedagogical explanations suit every individual pupil. An independent teacher review is required. Real device/cloud browser interactions, offline storage behavior and deployment preview appearance are not certified by automated content validation. Short four-question V8 topic quizzes were not extended to eight or more questions in this release; they should be expanded editorially in a later update.

**Suggested Cloudflare preview checklist:** Grade 12 Inversion and Adverbial Phrase vs Clause; Kelas 9 School Trip and Upcycling answer feedback; Grade 11 Analytical Exposition; Grade 12 Argumentative Text; UTBK Scientific Evidence; open all 10 example cards; verify vocabulary appears after practice; check page widths at 390px and laptop; practise and open Indonesian translations; ensure timed simulation hides translation until results; verify completion and backup import/export from V8.
