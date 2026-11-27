"""Run with python3 -m unittest discover -s tests -p 'test_*.py'."""
import json
import sys
import unittest
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
from validate import content_errors


class AuthoringTests(unittest.TestCase):
    def setUp(self):
        self.step = {"title": "Compare forms", "explanation": "Identify the verb.", "english": "Mira swims."}
        self.lesson = {
            "id": "grammar", "objectives": ["Identify verb forms."], "assessments": [],
            "blocks": [
                {"type": "scaffold", "steps": [self.step, dict(self.step, english="The birds sing.")]},
                {"type": "breakdown", "sentence": "Although it rained, we went.",
                 "parts": [{"english": "Although", "meaning": "meskipun"},
                           {"english": "it rained", "meaning": "hari hujan"}]},
                {"type": "reflection", "prompt": "What helped you find the verb?",
                 "translation": "Apa yang membantumu menemukan kata kerja?", "answer": "Jawaban beragam."},
            ],
            "practice": [{"id": "verb", "prompt": "She ___ daily.", "choices": ["reads", "read"],
                          "explanation": "Use the singular form.", "answer": 0}],
        }

    def test_grammar_examples_and_open_reflection(self):
        self.assertEqual(list(content_errors("lesson", self.lesson)), [])

    def test_numbering_and_exact_duplicate(self):
        self.step["title"] = "2) Compare forms"
        self.lesson["blocks"][0]["steps"].append(dict(reversed(self.step.items())))
        issues = dict(content_errors("lesson", self.lesson))
        self.assertIn("blocks[0].steps[0].title", issues)
        self.assertIn("identical to steps[0]", issues["blocks[0].steps[2]"])

    def test_invalid_practice(self):
        for change, field in [
            ({"choices": ["read"]}, "choices"),
            ({"answer": 2}, "answer"),
            ({"answer": True}, "answer"),
            ({"translationId": {"choices": []}}, "translationId.choices"),
            ({"translationId": {"choices": "ab"}}, "translationId.choices"),
        ]:
            with self.subTest(change=change):
                lesson = deepcopy(self.lesson)
                lesson["practice"][0].update(change)
                paths = [p for p, _ in content_errors("lesson", lesson)]
                self.assertTrue(any(p.endswith("practice[0]." + field) for p in paths), paths)

    def test_checkpoint_requires_three_translated_choices(self):
        checkpoint = {"type": "checkpoint", "id": "check", "prompt": "Choose a verb.",
                      "choices": ["read", "eye", "bus"], "answer": 0, "translation": "Pilih kata kerja.",
                      "translationChoices": ["membaca", "mata", "bus"], "explanation": "Aksi.", "hint": "Tindakan."}
        self.lesson["blocks"] = [checkpoint]
        self.assertEqual(list(content_errors("lesson", self.lesson)), [])
        checkpoint["translationChoices"].pop()
        checkpoint["answer"] = 3
        paths = dict(content_errors("lesson", self.lesson))
        self.assertIn("$.blocks[0].translationChoices", paths)
        self.assertIn("$.blocks[0].answer", paths)

    def test_published_four_choice_format(self):
        quiz = json.loads((ROOT / "data/quizzes/utbk-reading-lab.json").read_text())
        question = quiz["questions"][0]
        question["choices"].pop()
        question["translationId"]["choices"].pop()
        issues = dict(content_errors("quiz", quiz))
        self.assertIn("questions[0].choices", issues)
        self.assertIn("questions[0].translationId.choices", issues)

    def test_mixed_quiz_formats(self):
        fixture = ROOT / "tests/fixtures/v13b-mixed-formats.json"
        quiz = json.loads(fixture.read_text())
        self.assertEqual(list(content_errors("quiz", quiz)), [])
        quiz["questions"][1]["answers"][1] = 99
        quiz["questions"][2]["statements"][0]["answerCategory"] = "missing"
        issues = dict(content_errors("quiz", quiz))
        self.assertIn("questions[1].answers", issues)
        self.assertIn("questions[2].statements[0]", issues)

    def test_asas_grammar_sections_cover_questions(self):
        quiz = json.loads((ROOT / "data/quizzes/grade10-asas-grammar-test-1.json").read_text())
        self.assertEqual(list(content_errors("quiz", quiz)), [])
        quiz["sections"][1]["questionStart"] = 6
        issues = dict(content_errors("quiz", quiz))
        self.assertIn("sections[1].questionStart", issues)

    def test_asas_grammar_sections_reject_duplicate_ids(self):
        quiz = json.loads((ROOT / "data/quizzes/grade11-asas-grammar-test-1.json").read_text())
        quiz["sections"][1]["id"] = quiz["sections"][0]["id"]
        issues = dict(content_errors("quiz", quiz))
        self.assertIn("sections[1].id", issues)
