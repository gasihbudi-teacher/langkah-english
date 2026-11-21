"""Validate catalogue links, content schemas and authoring invariants from any directory."""
import json
import re
import sys
from pathlib import Path

try:
    from jsonschema import Draft202012Validator
except ImportError:
    sys.exit("Install the authoring dependency: python3 -m pip install -r tools/requirements.txt")

ROOT = Path(__file__).resolve().parents[1]
NUMBERED_TITLE = re.compile(r"^\s*(?:[0-9]+[.)]|\([0-9]+\))\s+")
# These published assessments have explicit bilingual four-choice contracts in
# tests/v5-quality.mjs and tests/v12-caption-cv.mjs.
FOUR_CHOICE_QUIZZES = {
    "utbk-mock-a", "utbk-mock-b", "utbk-mock-c", "utbk-reading-lab",
    "grade12-caption-text-practice", "grade12-curriculum-vitae-practice",
}
SCHEMAS = {
    kind: Draft202012Validator(json.loads((ROOT / f"data/schemas/{kind}.schema.json").read_text()))
    for kind in ("catalog", "lesson", "quiz", "glossary")
}


def field_path(parts):
    path = "$"
    for part in parts:
        path += f"[{part}]" if isinstance(part, int) else f".{part}"
    return path


def schema_errors(kind, data):
    for error in SCHEMAS[kind].iter_errors(data):
        # The lesson schema selects block shapes by type. Show just the relevant branch.
        if error.validator == "oneOf" and isinstance(error.instance, dict):
            block_type = error.instance.get("type")
            variants = [s["properties"]["type"]["const"] for s in error.validator_value]
            if block_type not in variants:
                yield field_path(error.path) + ".type", f"unknown block type {block_type!r}"
                continue
            for detail in error.context:
                if detail.schema_path[0] == variants.index(block_type):
                    yield field_path(detail.absolute_path), detail.message
        else:
            yield field_path(error.path), error.message


def scaffold_errors(block, path):
    seen = {}
    for i, step in enumerate(block["steps"]):
        here = f"{path}.steps[{i}]"
        if NUMBERED_TITLE.match(step["title"]):
            yield here + ".title", "remove the list marker; the step badge supplies the number"
        signature = json.dumps(step, sort_keys=True)
        if signature in seen:
            yield here, f"identical to steps[{seen[signature]}]"
        else:
            seen[signature] = i
        for key, value in step.items():
            if isinstance(value, str) and not value.strip():
                yield f"{here}.{key}", "expected nonblank text"
        if "indonesian" in step and "english" not in step:
            yield here + ".english", "missing English sample for translation"
        if "check" in step:
            if len(step["check"].strip()) < 20 or re.match(r"^Pada contoh tersebut\b", step["check"].strip(), re.I):
                yield here + ".check", "expected a specific question of at least 20 characters"
            answer = " ".join(step["checkAnswer"].casefold().split())
            if len(step["checkAnswer"].strip()) < 10 or any(
                answer == " ".join(step.get(key, "").casefold().split()) for key in ("why", "explanation")
            ):
                yield here + ".checkAnswer", "expected a distinct answer of at least 10 characters"
    if "modelIndonesian" in block and "modelEnglish" not in block:
        yield path + ".modelEnglish", "missing English model for translation"


def lesson_errors(data):
    for field in ("objectives", "blocks"):
        if not data[field]:
            yield field, "expected at least one item"
    for i, block in enumerate(data["blocks"]):
        path = f"blocks[{i}]"
        if block["type"] == "scaffold":
            yield from scaffold_errors(block, path)
        elif block["type"] == "checkpoint":
            for key in ("choices", "translationChoices"):
                if not all(s.strip() for s in block[key]):
                    yield f"{path}.{key}", "each option must contain text"
            if type(block["answer"]) is not int:
                yield path + ".answer", "expected an integer index"
        elif block["type"] == "table":
            for j, row in enumerate(block["rows"]):
                if len(row) != len(block["headers"]):
                    yield f"{path}.rows[{j}]", "expected one cell per header"


def question_errors(data, kind):
    field = "practice" if kind == "lesson" else "questions"
    passages = {p["id"]: p["text"] for p in data.get("passages", [])} if kind == "quiz" else {}
    seen = set()
    for i, q in enumerate(data[field]):
        path = f"{field}[{i}]"
        if q["id"] in seen:
            yield path + ".id", "duplicate question ID"
        seen.add(q["id"])
        for key in ("id", "prompt", "explanation"):
            if not q[key].strip():
                yield f"{path}.{key}", "expected nonblank text"
        form = q.get("questionType", "single")
        if kind == "quiz" and data["id"] in FOUR_CHOICE_QUIZZES:
            if form != "single" or len(q.get("choices", [])) != 4:
                yield path + ".choices", "this assessment requires four single-answer options"
            if len(q.get("translationId", {}).get("choices", [])) != 4:
                yield path + ".translationId.choices", "this assessment requires four ordered translations"
        if kind == "lesson" and (form != "single" or any(k in q for k in ("answers", "categories", "statements"))):
            yield path, "embedded lesson practice requires a single-answer question"
        elif form == "category":
            if not 2 <= len(q["categories"]) <= 6 or not all(s.strip() for s in q["categories"]):
                yield path + ".categories", "expected 2 to 6 nonblank categories"
            for j, row in enumerate(q["statements"]):
                if not row["text"].strip() or row["answerCategory"] not in q["categories"]:
                    yield f"{path}.statements[{j}]", "expected text and an answerCategory from categories"
        else:
            if "categories" in q or "statements" in q:
                yield path, "only category questions can contain categories or statements"
            choices = q["choices"]
            if not 2 <= len(choices) <= 8 or len(set(choices)) != len(choices) or not all(s.strip() for s in choices):
                yield path + ".choices", "expected 2 to 8 distinct, nonblank choices"
            keys = q["answers"] if form == "multiple" else [q["answer"]]
            if any(type(n) is not int or not 0 <= n < len(choices) for n in keys):
                yield path + (".answers" if form == "multiple" else ".answer"), "expected zero-based indices within choices"
            if "choiceExplanations" in q and not matching_text(q["choiceExplanations"], choices):
                yield path + ".choiceExplanations", "expected one explanation per choice"
        for key in ("choices", "categories", "statements"):
            translations = q.get("translationId", {})
            if key in translations and not matching_text(translations[key], q.get(key, [])):
                yield f"{path}.translationId.{key}", f"expected one nonblank translation per entry in {key}"
        if "passageId" in q and (q["passageId"] not in passages or not q.get("evidence") or q["evidence"] not in passages[q["passageId"]]):
            yield path + ".passageId", "expected a referenced passage containing the evidence quotation"


def matching_text(entries, originals):
    return isinstance(entries, list) and len(entries) == len(originals) and all(
        isinstance(s, str) and s.strip() for s in entries
    )


def content_errors(kind, data, meta=None, by_id=None):
    errors = list(schema_errors(kind, data))
    if errors:
        yield from errors
        return
    if meta is not None:
        if data["id"] != meta["id"]:
            yield "id", "content ID must match the catalogue or filename"
        if kind == "lesson":
            for i, ref in enumerate(data["assessments"]):
                if by_id.get(ref, {}).get("type") != "quiz":
                    yield f"assessments[{i}]", f"unknown quiz {ref}"
        elif meta.get("examFormat") == "full":
            reference = data.get("referenceFormat", {})
            for key in ("questionCount", "durationSeconds"):
                if reference.get(key) != data[key] or data[key] <= 0:
                    yield f"referenceFormat.{key}", "must match the positive full simulation value"
    if kind == "lesson":
        yield from lesson_errors(data)
    elif data["questionCount"] != len(data["questions"]):
        yield "questionCount", "must match the number of questions"
    yield from question_errors(data, kind)


def glossary_errors(glossary, quiz):
    findings = list(schema_errors("glossary", glossary))
    if findings:
        yield from findings
        return
    if glossary["quizId"] != quiz["id"]:
        yield "$.quizId", "must match the linked quiz ID"
    passages = {p["id"]: p["text"] for p in quiz["passages"]}
    seen_passages = set()
    for i, section in enumerate(glossary["sections"]):
        path = f"$.sections[{i}]"
        passage_id = section["passageId"]
        if passage_id not in passages:
            yield path + ".passageId", "unknown passage in linked quiz"
            continue
        if passage_id in seen_passages:
            yield path + ".passageId", "duplicate glossary section"
        seen_passages.add(passage_id)
        seen_entries = set()
        for j, entry in enumerate(section["entries"]):
            expression = entry["expression"]
            field = f"{path}.entries[{j}].expression"
            if expression not in passages[passage_id]:
                yield field, "must occur verbatim in the referenced passage"
            key = (" ".join(expression.split()).casefold(), entry["meaningId"].strip().casefold())
            if key in seen_entries:
                yield field, "duplicate expression and meaning in this passage"
            seen_entries.add(key)


def validate(root):
    errors = []
    def report(file, path, reason):
        errors.append(f"{file}: {path}: {reason}")

    def read(file):
        try:
            return json.loads((root / file).read_text(encoding="utf-8"))
        except (OSError, ValueError) as error:
            report(file, "$", str(error))
            return None

    catalog_file = "data/catalog.json"
    catalog = read(catalog_file)
    for path, reason in schema_errors("catalog", catalog):
        report(catalog_file, path, reason)
    if errors:
        return errors
    resources = catalog["resources"]
    by_id = {r["id"]: r for r in resources}
    pathways = set()
    if not isinstance(catalog["pathways"], list):
        report(catalog_file, "pathways", "expected an array")
        return errors
    for i, pathway in enumerate(catalog["pathways"]):
        if isinstance(pathway, dict) and isinstance(pathway.get("id"), str):
            pathways.add(pathway["id"])
        else:
            report(catalog_file, f"pathways[{i}].id", "expected a pathway ID")
    seen = set()
    files = {}
    glossary_files = {}
    for i, r in enumerate(resources):
        path = f"resources[{i}]"
        if r["id"] in seen:
            report(catalog_file, path + ".id", "duplicate resource ID")
        seen.add(r["id"])
        directory = "lessons" if r["type"] == "lesson" else "quizzes"
        if r["file"] != f"data/{directory}/{r['id']}.json":
            report(catalog_file, path + ".file", "expected the resource type directory and ID as filename")
        files[r["file"]] = r
        if "glossaryFile" in r:
            glossary_file = r["glossaryFile"]
            if r["type"] != "quiz" or glossary_file != f"data/glossaries/{r['id']}.json":
                report(catalog_file, path + ".glossaryFile", "expected a quiz glossary at data/glossaries/<quiz-id>.json")
            else:
                glossary_files[r["file"]] = glossary_file
        for j, placement in enumerate(r["placements"]):
            if placement["pathway"] == "sas":
                if r["type"] != "quiz":
                    report(catalog_file, f"{path}.placements[{j}]", "SAS placement requires a quiz")
                for field in ("grade", "semester"):
                    if field not in placement:
                        report(catalog_file, f"{path}.placements[{j}].{field}", "required for SAS placement")
            if placement["pathway"] not in pathways:
                report(catalog_file, f"{path}.placements[{j}].pathway", "unknown pathway")
        for ref in r["relatedLessons"]:
            if ref not in by_id:
                report(catalog_file, path + ".relatedLessons", f"unknown resource {ref}")
        for ref in r.get("prerequisites", []):
            if r["type"] != "lesson" or ref == r["id"] or by_id.get(ref, {}).get("type") != "lesson":
                report(catalog_file, path + ".prerequisites", f"invalid lesson prerequisite {ref}")
        if r["type"] == "quiz" and "kind" not in r:
            report(catalog_file, path + ".kind", "missing quiz kind")
        if "examFormat" in r and r["type"] != "quiz":
            report(catalog_file, path + ".examFormat", "only quizzes have an exam format")

    count = 0
    content_files = set(files)
    for directory in ("lessons", "quizzes"):
        content_files.update(str(p.relative_to(root)) for p in (root / "data" / directory).rglob("*.json"))
    for file in sorted(content_files):
        data = read(file)
        kind = "lesson" if file.startswith("data/lessons/") else "quiz"
        meta = files.get(file, {"id": Path(file).stem})
        findings = list(content_errors(kind, data, meta, by_id))
        for path, reason in findings:
            report(file, path, reason)
        if not findings and file in glossary_files:
            glossary_file = glossary_files[file]
            glossary = read(glossary_file)
            if glossary is not None:
                for path, reason in glossary_errors(glossary, data):
                    report(glossary_file, path, reason)
        if not findings:
            count += len(data["practice" if kind == "lesson" else "questions"])

    for file in (root / "data/glossaries").glob("*.json"):
        relative = str(file.relative_to(root))
        if relative not in glossary_files.values():
            report(relative, "$", "glossary must be linked from its quiz catalogue entry")
    for file in root.rglob("*.json"):
        relative = str(file.relative_to(root))
        if relative not in content_files and relative != catalog_file:
            read(relative)
    for html in root.glob("*.html"):
        for path in re.findall(r'(?:href|src)="([^"#?]+)', html.read_text()):
            if "://" not in path and not (root / path).is_file():
                report(html.name, path, "missing internal asset")
    if not errors:
        print(f"PASS: {len(resources)} resources, {count} questions including embedded practice.")
    return errors


if __name__ == "__main__":
    findings = validate(ROOT)
    for finding in findings:
        print(finding, file=sys.stderr)
    sys.exit(bool(findings))
