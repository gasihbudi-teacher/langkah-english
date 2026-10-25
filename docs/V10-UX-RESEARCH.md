# Langkah English V10 — UX research and design rationale

**Research and implementation date:** 25 October 2026  
**Scope:** Learning experience, interface architecture, discoverability, readability, mobile navigation, motivation, and accessibility. **Not** a bilingual teaching-content review, a randomized learning-outcomes study, or a formal WCAG certification.

## 1. Executive recommendation

Langkah English should be a **patient, self-directed study companion**: students recognize the next useful action without having to remember where they were, can discover content without a wall of 93 cards, and can concentrate on explaining *why* an English expression or answer works. The product should not imitate the pressure mechanics of a language game or hide its existing substantial explanations to create artificial “bite-size” units.

The new visual direction is **warm academic**: clear editorial typography, soft evergreen/blue/cream backgrounds, restrained illustrations, calm encouragement, familiar cards, generous reading width, visible keyboard focus, and a low-friction mobile navigation menu. The site stays static and works without third-party fonts, accounts, trackers, build tools, or paid APIs.

**Important evidence distinction:** Platform features below are documented primarily in the platforms' own published material. These are **design-pattern references**, not independently verified rankings, endorsements, claims of learning effectiveness for Langkah English, or proof of favorable student reviews. Education and accessibility sources are cited separately. Observations about the V9 source are based on direct inspection of the provided V9 ZIP; they do **not** establish usability problems experienced by real students.

## 2. What we researched — professional learning products

| Platform | Documented product pattern | Useful design interpretation for Langkah English | What NOT to copy |
|:--|:--|:--|:--|
| **Khan Academy** | A structured course/unit hierarchy, progress reporting and visible mastery summaries; learners can understand what they have worked on. | Show a quiet, reliable progress summary, a sensible next step, and organized course entry points. | Do not call lesson completion **mastery**: V9 has no validated mastery model. |
| **Duolingo** | Short learning chunks, a visible path, easy-to-understand progress, habits and practice mechanics. Its 2025 account of product changes describes smaller course chunks and flashcard retrieval. | Offer approachable first steps and short entry routes, with an uncluttered main action. | No streak pressure, competitive leaderboard, artificial points, or motivational guilt. Students need time to understand complex topics. |
| **Brilliant** | Sequenced concepts, guided questions, interactive practice and feedback; the platform emphasizes understanding rather than passive content consumption. | Make guided steps, examples, checkpoints, and practice feel like a natural sequence; keep explanations visible. | Do not imply the static site provides a personalized AI tutor or adaptivity. |
| **Quizlet Learn** | Focused study sets, varied questions, practice based on difficulty/previous activity and active recall. | Help students find a topic quickly, then revisit it through meaningful practice; consider spaced reviews later. | Do not fake adaptive recommendations from a learner profile that is not present. |
| **British Council LearnEnglish** | Grammar grouped by ability, clear explanations, practice tasks, revisiting topics. The A1–A2 section explicitly describes a *test–teach–test* sequence. | Organize material by level and keep the practice connected to its explanation. Encourage frequent, low-stakes practice. | Do not change V9's pedagogical agreement to teach before testing simply to copy a different model. |

### Source material for platform patterns

1. Khan Academy, **How can I understand my progress?** (updated September 18, 2024): https://support.khanacademy.org/hc/en-us/articles/360032987591  
2. Khan Academy, **What are Course and Unit Mastery?**: https://support.khanacademy.org/hc/en-us/articles/115002552631-What-are-Course-and-Unit-Mastery  
3. Duolingo, **2025 Duolingo Highlights**: https://blog.duolingo.com/product-highlights/  
4. Duolingo, **Product overview**: https://en.duolingo.com/  
5. Brilliant, **How does interactive learning work?**: https://brilliant.org/faq/  
6. Quizlet, **Learn practice questions**: https://quizlet.com/features/learn  
7. British Council, **Grammar**: https://learnenglish.britishcouncil.org/free-resources/grammar  
8. British Council, **A1–A2 grammar**: https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2  
9. British Council, **How to use the LearnEnglish grammar section**: https://learnenglish.britishcouncil.org/english-levels/improve-your-english-level/how-use-learnenglish-grammar-section

### Independent evidence and UX guardrails

- **Jakob Nielsen's usability heuristics** support visibility of status, consistent navigation, reduced reliance on memory, error prevention, and user control. The first step and returning-student recommendation are discoverable; the same header appears on every page. See Nielsen Norman Group, *10 Usability Heuristics* (reviewed 2024): https://www.nngroup.com/articles/ten-usability-heuristics/ .
- **WCAG 2.2** provides testable accessibility criteria relevant to this project: keyboard navigation, clear focus, sufficiently sized interaction targets, distinguishable controls, focus not obscured, and reduced motion. Target conformance should be checked, not assumed. See W3C: https://www.w3.org/TR/WCAG22/ .
- **Spacing and retrieval practice** have a substantial research base. Langkah English already offers quizzes and modelled self-checks; future versions can use optional spaced recall without forcing streaks. Carpenter, Pan & Butler, *Nature Reviews Psychology* (2022): https://www.nature.com/articles/s44159-022-00089-1 ; Weinstein, Madan & Sumeracki (2018): https://link.springer.com/article/10.1186/s41235-017-0087-y .
- **Real-world web experience** should be checked with Core Web Vitals rather than assumed from a small ZIP. Google's reference targets for the 75th-percentile experience are LCP ≤ 2.5 seconds, INP ≤ 200 ms, CLS ≤ 0.1: https://developers.google.com/search/docs/appearance/core-web-vitals .

## 3. Source-derived V9 audit, then redesign choices

Directly observed in the supplied V9 files:

| V9 implementation | Design risk inferred (not user-tested) | V10 change |
|:--|:--|:--|
| The homepage showed a hero, four initial choices, four journey stages, repeated three-track promotion, grades, three long grammar roadmaps, local stats and activity. | First-time learners might feel overwhelmed before identifying a single action. | Put **recommended next action inside the hero**, bring local progress near the top, simplify hierarchy and visual repetition. |
| At mobile widths, nav links sat in a horizontally scrollable row below the main nav. | More header height and easy-to-miss destinations on narrow screens. | Compact accessible **Menu** button with all four primary links, Escape-close and outside-click-close. |
| Grammar, School and UTBK topic groups used expandable Materi/Latihan lists, initially all collapsed. | Another click required to find the first resource; first step not clearly indicated. | Open the first relevant **Materi** group by default while preserving hashed navigation and all existing sections. |
| Search listed the whole catalogue for an empty query. | Ninety-three cards create a high scanning burden. | Show **six editorial starting points** and example search terms; one explicit button reveals all 93. No catalogue filter controls added. |
| Lessons showed full teaching blocks, helpful scaffolds, checks, and completion. | Long material could be hard to scan after opening or when returning later. | Provide in-page **section shortcuts**, a subtle reading position indicator, and a reversible focus mode. |
| Progress was already stored in `langkah.progress.v1`; quiz drafts under `langkah.draft.<id>`. | Changing keys would erase or hide existing study history. | Do not rename progress keys, format, resource IDs, exam flows, drafts, or backup shapes. |
| Written self-check answers are not saved or scored. | Learners might assume automatic marking. | Preserve explicit self-evaluation; do not invent grading or new scoring claims. |

## 4. New information architecture

**Global:** Logo → Home; Grammar; UTBK; School; Search; Progress shortcut; EN/ID interface switch. At ≤810px the navigation becomes a compact menu, not an awkward horizontal scroll. At very narrow widths, Progress is accessible inside the menu instead of cramming the header.

**Home:** (1) clear introduction + *one next action*; (2) real local progress; (3) four empathetic learner intentions; (4) three formal pathways; (5) guided beginner-to-UTBK route; (6) grade shortcuts; (7) optional grammar overview; (8) history and portable backup. No fixed streak or misleading mastery percentage.

**Pathway pages:** short identity/introduction; jump chips; existing Materi, Latihan, Simulasi groups; visible count of lessons marked complete for the pathway; first Materi group open. Page anchors and links remain stable.

**Search:** focused search bar; topic examples; initially curated starting points; clear “show all” action. Typing immediately searches titles/descriptions/tags and now also indexes pathway and grade text. No advanced filters, no server-side search.

**Lesson:** unchanged authored V9 sequence: Indonesian definition → guided scaffold → deeper synthesis → ≥10 bilingual, explained examples → practice/recall → vocabulary → completion. Added nonintrusive skip links across rendered blocks, reversible distraction-free mode, and a thin reading-position indicator; no content removed, hidden, or generated on the fly.

**Quiz/results:** preserve English-first options, optional Indonesian translations, practice/simulation differences, timer conditions, scoring, and saved drafts. Improve control size, readability, choice focus and color differentiation via CSS; no timer or scoring rules changed.

## 5. Accessibility and mobile acceptance targets

- Keyboard: header menu, language switch, pathway details, search field, example translations, lesson section links, focus-mode toggle, quizzes, confirmation modal, and backup controls should be operable without a mouse.
- Visible focus with at least a noticeable contrasting ring, in line with WCAG 2.2 expectations; do not rely on color alone for correct/selected states.
- Touch: aim for comfortable controls around 44 CSS pixels when possible; no tiny hamburger-only interaction.
- Responsive widths: 320, 360, 390, 768, 1024, 1440 px; avoid page-level horizontal scrolling. Check long Indonesian and English titles.
- Avoid animated parallax, flashing interactions and forced gamification; respect `prefers-reduced-motion`.
- Screen reader: a clear page H1, skip link, form labels, ARIA-expanded state for menu, aria-pressed states and live status feedback.
- Respect the user's existing bilingual pedagogical boundary: interface toggle **does not** change lesson writing into unreviewed English or automatically translate exam text.

**QA caveat:** The automated checks reported in V10-REDESIGN-TEST-REPORT.md are helpful but do not constitute an accessibility audit with assistive technology, a classroom learner trial, or a real-device Cloudflare Pages test.

## 6. Deliberately deferred ideas (recommended V10.1+)

1. **Short, teacher-reviewed quiz expansion** for V8's four-question topic checks; prioritize misconceptions, near-miss distractors and textual evidence. The UI cannot compensate for insufficient assessment coverage.
2. **Voluntary spaced review** for lessons a student chooses to revisit. Prioritize recall prompts and explanations, not streak points.
3. **Writing support:** preserve student drafts intentionally and privately if a future feature adds persistence; V9's ungraded written self-check is not currently stored.
4. **Audio/listening/speaking**, preferably downloadable, low-bandwidth and teacher-reviewed, with transcripts and captions.
5. **Live accessibility and student usability study:** observe struggling Grade 9, 12, and UTBK learners locating a lesson, answering a checkpoint, explaining the lesson in their words, recovering from mistakes, exporting a backup, and resuming a draft.
6. **Field performance monitoring** after opt-in/privacy review; use PageSpeed Insights/Chrome DevTools, not fictional benchmark scores.

## 7. Suggested evaluation study

Recruit a small mix of students with different English confidence levels. Give them realistic tasks without demonstrating where to click: “Begin from zero,” “Find Grade 12 adverbial phrase vs clause,” “Continue your last quiz,” “Find a lesson to understand why the answer is correct,” “Switch interface language,” “Export your history.” Track task success, number of navigation detours, sources of confusion, perceived workload, and whether each student can explain one new idea. Ask separately about readability, search terms, pace, and whether content feels too long. Do not treat task completion alone as improved learning outcomes; conduct teacher-led content evaluation.

## 8. Product limitations and integrity

No proprietary images, code, lesson material or UX assets were copied from competitor products. The redesign borrows high-level, commonly established interaction patterns. It adds **no** analytics, accounts, surveillance, server persistence, audio assets, downloads, paid services, learning-outcome claims, scoring predictors or unreviewed new questions. All existing educational content remains unofficial and requires teacher review.
