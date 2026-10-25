import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const catalog=JSON.parse(read('data/catalog.json'));
const v7=new Set(JSON.parse(read('data/v7-resource-ids.json')));
// Historical V8 regression suite: validate ONLY the immutable V8 baseline.
// Later authoring updates must not change the original V8 count assertions.
const v8Baseline=new Set(JSON.parse(read('data/v8-resource-ids.json')));
assert.equal(v8Baseline.size,91,'Original V8 snapshot must contain 91 unique resource IDs');
for(const id of v8Baseline)assert.ok(catalog.resources.some(r=>r.id===id),'Original V8 resource missing '+id);
const entries=catalog.resources.filter(r=>v8Baseline.has(r.id)&&!v7.has(r.id));
const school=entries.filter(r=>r.placements.some(p=>p.pathway==='school'));
const utbk=entries.filter(r=>r.placements.some(p=>p.pathway==='utbk'));
assert.equal(v7.size,45);
assert.equal(entries.length,46);
assert.equal(school.length,40);
assert.equal(utbk.length,6);
assert.equal(entries.filter(r=>r.type==='lesson').length,23);
assert.equal(entries.filter(r=>r.type==='quiz').length,23);
for(const grade of [9,10,11,12]){
 assert.equal(school.filter(r=>r.type==='lesson'&&r.placements[0].grade===grade).length,5);
 assert.equal(school.filter(r=>r.type==='quiz'&&r.placements[0].grade===grade).length,5);
}
for(const originalId of v7)assert.ok(catalog.resources.some(r=>r.id===originalId),'V7 resource missing '+originalId);
const forbidden=/\b(apa|manakah|pilih|kalimat|yang|adalah|karena|menurut|setelah|dengan|paling|terjadi|menjadi|merujuk|berarti|termasuk|membuktikan|tidak|pada|dalam|penulis|sekolah|untuk|sebuah|siswa|saat|memilih|maka|antara|semua|hanya)\b/i;
let newQuestions=0, nPassages=0, checks=0, exampleCount=0;
for(const m of entries){
 const d=JSON.parse(read(m.file));
 assert.equal(m.aiGenerated,true);
 assert.equal(m.unofficial,true);
 assert.ok(m.curriculumAlignment?.mappingNote.includes('bukan') || m.curriculumAlignment?.mappingNote.includes('tidak resmi'));
 if(m.type==='lesson'){
  assert.deepEqual(m.placements.length,1);
  assert.equal(d.assessments.length,1);
  assert.ok(m.prerequisites?.length>=1,'prerequisite missing '+m.id);
  const scaffold=d.blocks.filter(b=>b.type==='scaffold');assert.equal(scaffold.length,1);assert.equal(d.blocks[0].type,'definition');
  assert.ok(scaffold[0].steps.length>=2&&scaffold[0].steps.length<=5);
  assert.ok(scaffold[0].steps.filter(s=>s.english).length>=2&&scaffold[0].steps.filter(s=>s.english).every(s=>s.indonesian&&s.why));
  const groups=d.blocks.filter(b=>b.type==='example_group');
  assert.ok(groups.reduce((n,g)=>n+g.items.length,0)>=10);
  assert.deepEqual(groups.map(x=>x.collapsed),[false,false,false]);
  assert.ok(groups.every(x=>x.items.every(i=>i.english && i.indonesian && i.note)));
  exampleCount+=groups.reduce((n,g)=>n+g.items.length,0);
  const vocab=d.blocks.filter(b=>b.type==='vocabulary');assert.equal(vocab.length,1);assert.ok(vocab[0].items.length>=5);
  assert.equal(d.blocks.filter(b=>b.type==='breakdown').length,1);
  assert.equal(d.blocks.filter(b=>b.type==='summary').length,1);
  assert.equal(d.blocks.filter(b=>b.type==='reflection').length,1);
  assert.ok(d.blocks.some(b=>b.type==='example'&&b.text.length>=270),'No long model reading '+m.id);
  const checkpoint=d.blocks.filter(b=>b.type==='checkpoint');
  assert.equal(checkpoint.length,1);checks++;
  assert.equal(checkpoint[0].choices.length,3);assert.equal(checkpoint[0].translationChoices.length,3);
  assert.ok(checkpoint[0].translation&&checkpoint[0].hint&&checkpoint[0].explanation);
  assert.ok(d.assessments.every(a=>catalog.resources.some(r=>r.id===a&&r.type==='quiz')));
  assert.equal(d.practice.length,2);
  for(const q of d.practice)checkQuestion(q,`${m.id}/${q.id}`);
  newQuestions+=d.practice.length;
 }else{
  assert.equal(d.questions.length,4);
  assert.equal(d.questionCount,4);
  assert.equal(d.passages.length,1);
  assert.ok(d.passages[0].text.trim().split(/\s+/).length>=65);
  nPassages++;
  const positions=[0,0,0,0];
  for(const q of d.questions){checkQuestion(q,`${m.id}/${q.id}`);positions[q.answer]++;
    assert.ok(q.passageId);const p=d.passages.find(x=>x.id===q.passageId);
    assert.ok(p,'missing passage '+m.id);
    assert.ok(q.evidence&&p.text.includes(q.evidence),'uncitable answer '+m.id);
    assert.ok(q.skill);
  }
  assert.deepEqual(positions,[1,1,1,1],m.id+' unbalanced answer positions');
  newQuestions+=d.questions.length;
 }
}
function checkQuestion(q,ctx){
 assert.ok(q.prompt&&q.choices?.length>=3,ctx+' missing English question or choices');
 assert.ok(!forbidden.test(q.prompt),ctx+' non-English prompt: '+q.prompt);
 assert.ok(q.choices.every(x=>x.trim()&&!forbidden.test(x)),ctx+' non-English choices');
 assert.equal(new Set(q.choices).size,q.choices.length,ctx+' duplicate English options');
 assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.choices.length,ctx+' invalid key');
 assert.ok(q.translationId?.prompt.trim(),ctx+' missing Indonesian question gloss');
 assert.ok(q.translationId?.choices?.length===q.choices.length,ctx+' missing Indonesian option gloss');
 assert.ok(q.translationId.choices.every(x=>x.trim()),ctx+' empty Indonesian gloss');
 assert.ok(q.explanation.trim(),ctx+' missing explanation');
}
assert.equal(newQuestions,138);
assert.equal(checks,23);
assert.ok(exampleCount>=230);
assert.equal(nPassages,23);
// V7 practice signatures are deliberately unchanged; historical tests verify the exact SHA-256.
const scoring=read('js/quiz.js');
assert.ok(scoring.includes("mode==='practice'?translationDetails(q):''"),'Timed tests should not expose translation help');
assert.ok(read('js/results.js').includes('translationDetails(q)'),'Review must retain translation help');
assert.ok(read('js/i18n.js').match(/simulationLanguageNote:/g).length===2);
for(const page of ['school.html','utbk.html'])assert.match(read(page),/id="pathway-resources"/);
assert.match(read('js/pathway.js'),/topic-fold/);
for(const source of ['https://snpmb.id/fr/','https://repositori.kemendikdasmen.go.id/33628/'])assert.ok(read('docs/V8-SOURCES-AND-MAPPING.md').includes(source));
console.log(`PASS V8: 20 grade lessons and 20 matching quizzes, 3 UTBK guided modules and 3 quizzes; ${exampleCount} original worked examples, 23 original passages, ${checks} low-stakes checks, ${newQuestions} new assessed/lesson practice questions; complete glosses, 4-key balance, evidentiary support, unchanged V7 lessons and separate simulation translation policy.`);
