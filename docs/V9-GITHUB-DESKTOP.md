# Install V9 with GitHub Desktop on Linux Mint

## Recommended: full V9 ZIP (works whether your clone is V7 or V8)

1. In GitHub Desktop click **Fetch origin**, then **Pull origin** if shown. Make a backup copy of the cloned project folder or create a separate branch for a preview.
2. Download the full `langkah-english-v9.zip`. Unzip it into a **separate** Downloads folder. Do not replace your repository's `.git` directory.
3. Open the cloned Langkah English repository via GitHub Desktop > Repository > Show in File Manager. Copy the **contents** of the extracted V9 ZIP into the cloned repository, preserving folder names and selecting **Merge / Replace** for matching files. Do not delete your `.git` folder. Do not replace the whole repository directory.
4. If you see the older temporary `APPLY-THIS-UPDATE.py` from the Grade 12 adverbial add-on, you may delete it; V9 already contains that lesson and its catalog entry.
5. In the repository folder run `python3 tools/validate.py`. If Node.js is installed, also run `node tests/v9-quality.mjs`. No dependency installation is needed for the website itself.
6. In GitHub Desktop inspect changes, then **Commit to your active deployment branch** and **Push origin**. If using a preview branch, open Cloudflare Pages preview deployment first and merge when ready. The pushed commit only transfers Git differences, not a web-form upload of every file.
7. Test the curriculum pages and two corrected Grade 9 quizzes before publishing to students. Existing progress remains in each student's current browser localStorage, not the downloaded ZIP.

## Smaller changed-files ZIP

`langkah-english-v9-update-from-v8-adverbials.zip` contains **only changed/new files relative to V8 with the Grade 12 adverbial add-on already registered**. Use it only if your local clone contains V8 school modules such as `data/lessons/grade12-argumentative-text.json` AND the adverbial file `data/lessons/grade12-adverbial-phrase-vs-clause.json`.

If either of those files is missing, use the full V9 ZIP instead. The changed-files ZIP does not automatically supply all V8 quizzes to a V7-only clone. The full ZIP is also Git-friendly when copied into an existing cloned repository.

Never copy a `langkah-english-v9` parent folder into the repository; copy what is **inside** it: `index.html`, `data`, `js`, etc. Leave `.git` untouched.
