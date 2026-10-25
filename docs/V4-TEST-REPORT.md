# V4 verification report (25 October 2026)

Commands executed from the V4 root:

```
python tools/validate.py
# PASS: 45 resources, 234 questions including embedded practice; JSON, paths, references, choices and evidence checked.

node tests/scoring.mjs
# PASS: real scoring exports, answer-count validation, invalid answer and timer rejection.

node tests/v4-quality.mjs
# PASS: 45 resources, all 20 grammar topics, three unique 20-question UTBK mocks, school grades, links, translations, backup round trip.
```

`tests/v4-quality.mjs` checks: unique catalogue IDs, 20 published grammar topics, school-grade lesson presence, 20-question/1200-second format and distinct passages for each full mock, links and duplicate IDs, translation-key parity, old progress key preservation, backup serialization and malformed-file rejection.

`tools/validate.py` additionally checks referenced passage evidence is a verbatim substring of each passage, answer indices are in range, declared question counts equal actual counts, content links and placements exist, plus 2026 full-format metadata consistency.

**Browser limitation:** A local HTTP server and Chromium/Playwright were attempted, but page navigation failed with `net::ERR_BLOCKED_BY_ADMINISTRATOR` in this environment. A second route-interception attempt also failed. There is **no claim of passing interactive browser tests**. Run the manual checklist below against a Cloudflare preview deployment.

## Required manual preview acceptance

1. Navigate the home page at 390px mobile and desktop width; check no clipped links or horizontal overflow. Open pathway cards and grade filters (especially Grade 11).
2. Open a new intermediate lesson. Answer an embedded exercise and switch ID→EN→ID; the answer and feedback should remain.
3. Open each of the three UTBK full simulations. Check 20 questions, 20 minutes, passage navigation, flagging, timed simulation and returning to a saved draft.
4. In practice mode, select an answer and show its explanation; toggle language and verify the explanation persists.
5. Submit with one correct, one incorrect, and one unanswered item; verify the review, all result subtotals and skill progress bars. Check old results still open.
6. Start a timed simulation, close/reopen the tab near expiry, verify time does not reset and the expired attempt submits automatically.
7. In homepage progress area, download a JSON backup and import it back using a non-critical test browser profile. Confirm that restoring **replaces**, not merges, progress; verify no unexpected errors.
8. Test keyboard focus and screen-reader labels on buttons, answer choices and backup input. Repeat in Chrome, Firefox and mobile Safari if students use them.
9. Invite an English teacher to review answer keys, passage level and explanation clarity before publicly assigning the mocks.

## Out of scope / not verified

Cloudflare account settings, GitHub repository permissions, deployment branch association, real live production content state, external accounts, accessibility certification, and official exam item equivalence cannot be independently established from the ZIP alone.
