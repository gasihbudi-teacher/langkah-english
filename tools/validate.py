"""Optional authoring validation. Run from any directory with Python 3."""
import json, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parents[1]
def read(p):
    return json.loads((ROOT / p).read_text(encoding='utf-8'))
c = read('data/catalog.json')
resources = c['resources']
by_id = {r['id']: r for r in resources}
assert len(by_id) == len(resources), 'Duplicate resource IDs'
pathways = {p['id'] for p in c['pathways']}
count = 0
for r in resources:
    assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', r['id']), r['id']
    assert r['type'] in ('lesson', 'quiz')
    assert r['difficulty'] in ('Beginner', 'Intermediate', 'Advanced')
    for k in ('title','description','file','grammarTopics','readingSkills','tags','relatedLessons','placements','aiGenerated','unofficial'):
        assert k in r, (r['id'], k)
    assert r['file'] == f"data/{'lessons' if r['type']=='lesson' else 'quizzes'}/{r['id']}.json"
    assert r['placements']
    for p in r['placements']:
        assert p['pathway'] in pathways
        assert 'grade' not in p or p['grade'] in (9,10,11,12)
    for ref in r['relatedLessons']:
        assert ref in by_id, ('Missing related resource', ref)
    d = read(r['file'])
    assert d['id'] == r['id'], 'Catalog/content ID mismatch'
    if r['type'] == 'lesson':
        assert d['objectives'] and d['blocks']
        for b in d['blocks']:
            required = {'heading':['text'],'subheading':['text'],'text':['text'],'example':['text'],'rule':['text'],'mistake':['incorrect','correct','explanation'],'table':['headers','rows']}
            assert b['type'] in required
            assert all(k in b for k in required[b['type']])
            if b['type']=='table':
                assert all(len(row)==len(b['headers']) for row in b['rows'])
        for ref in d.get('assessments',[]):
            assert ref in by_id and by_id[ref]['type']=='quiz'
        questions = d.get('practice',[])
        passages = {}
    else:
        assert r['kind'] in ('practice','test')
        assert d['questionCount'] == len(d['questions']) > 0
        assert isinstance(d['durationSeconds'],int) and d['durationSeconds'] >= 0
        assert len({p['id'] for p in d['passages']}) == len(d['passages'])
        passages = {p['id']:p['text'] for p in d['passages']}
        questions = d['questions']
    assert len({q['id'] for q in questions}) == len(questions)
    for q in questions:
        assert q['prompt'] and q['explanation']
        assert len(q['choices']) >= 2 and all(isinstance(v,str) for v in q['choices'])
        assert type(q['answer']) is int and 0 <= q['answer'] < len(q['choices'])
        if 'passageId' in q:
            assert q['passageId'] in passages
            assert q.get('evidence') and q['evidence'] in passages[q['passageId']], ('Evidence quote missing from passage',q['id'])
        count += 1
for f in ROOT.rglob('*.json'):
    json.loads(f.read_text(encoding='utf-8'))
for html in ROOT.glob('*.html'):
    for path in re.findall(r'(?:href|src)="([^"#?]+)', html.read_text()):
        if '://' not in path:
            assert (ROOT / path).is_file(), ('Missing internal asset',path)
print(f'PASS: {len(resources)} resources, {count} questions including embedded practice; JSON, paths, references, choices and evidence checked.')
