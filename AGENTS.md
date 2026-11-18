# Authoring lesson JSON

Use the block definitions in `data/schemas/lesson.schema.json` and the current guidance in `docs/AUTHORING.md`. Preserve published IDs, scoring and saved progress.

- Write scaffold step titles without manual list numbers. Give each step a distinct teaching purpose. Revisit an example when a new question helps the learner notice a different feature.
- Pair English and Indonesian models by meaning. Preserve names, facts, sequence and meaningful paragraph breaks.
- When learners follow or construct one connected passage, keep the introduction, steps and model consistent in setting, characters and relevant details. Write the model as the finished passage. Put commentary about its construction in the teaching explanation.
- Grammar, vocabulary and contrast tasks can use independent examples, minimal pairs, isolated words and changes of context. Introduce a new model example when the instructions call for one.
- In a breakdown, select the smallest unit that explains the feature. A conjunction such as “although” can stand alone. Require a multi-word unit when the task explicitly asks for a phrase.
- At a comparison reflection, make both A and B visible to the learner. Include both in the prompt if the renderer would otherwise omit or hide them. Open-ended reflections can stand on their own.
- Follow the authored question format. Lesson practice uses a single zero-based integer answer within its choices. Checkpoints use three choices and three ordered entries in `translationChoices`. Use four choices wherever the specific assessment requires four. Where translations are required or supplied, match each choice in the same order. Grammar practice may omit `translationId.choices` when translation would erase the distinction. Preserve the separate multiple-answer and category quiz formats.

Install the authoring dependency with `python3 -m pip install -r tools/requirements.txt` and run `python3 tools/validate.py` from the repository root. Review scenario continuity, translation fidelity and order, breakdown units, reflection visibility, purposeful repetition and passage commentary in context.
