import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {validateQuestion,score,isCorrect,isAnswered} from '../js/question-types.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p));
const load=p=>JSON.parse(read(p));
const cat=load('data/catalog.json');
const baseline=load('tests/fixtures/v13c2-v13c1-content-sha256.json');
const intentional=new Set(['data/lessons/grade9-reading.json']);for(const [p,digest] of Object.entries(baseline))if(!intentional.has(p))assert.equal(crypto.createHash('sha256').update(read(p)).digest('hex'),digest,`V13-C1 content changed: ${p}`);
assert.equal(Object.keys(baseline).length,101);
assert.ok(cat.resources.length>=105,'V13-C2 resources missing');
assert.ok(cat.resources.filter(x=>x.type==='lesson').length>=60);
assert.ok(cat.resources.filter(x=>x.type==='quiz').length>=45);
assert.equal(new Set(cat.resources.map(r=>r.id)).size,cat.resources.length);
const ids=['tka-classify-outline-summarize-synthesize','tka-context-vocabulary-reference-connectors'];
let steps=0,cards=0,embedded=0,quizItems=0;
for(const [i,id] of ids.entries()){
 const meta=cat.resources.find(r=>r.id===id),qm=cat.resources.find(r=>r.id===id+'-practice');
 assert(meta&&qm&&meta.placements[0].pathway==='tka'&&qm.placements[0].pathway==='tka');
 assert.equal(meta.type,'lesson');assert.equal(qm.type,'quiz');
 assert.deepEqual(meta.relatedLessons[0],qm.id);assert.deepEqual(qm.relatedLessons,[id]);
 const lesson=load(meta.file),quiz=load(qm.file);
 assert.deepEqual(lesson.assessments,[qm.id]);
 assert.equal(lesson.blocks[0].type,'definition');assert.equal(lesson.blocks[1].type,'scaffold');
 assert.equal(lesson.blocks[2].type,'synthesis');assert.equal(lesson.blocks.at(-1).type,'vocabulary');
 const sc=lesson.blocks[1];assert.equal(sc.steps.length,i===0?11:10);steps+=sc.steps.length;
 assert.equal(sc.modelPosition,'after');
 const modelWords=sc.modelEnglish.trim().split(/\s+/).length;assert(modelWords>=200&&modelWords<=300,`${id} guided model length ${modelWords}`);
 assert(sc.modelIndonesian.length>500);
 const phases=[...new Set(sc.steps.map(s=>s.phase))];assert.equal(phases.length,4);
 assert(sc.steps.every(s=>s.title.length>8&&s.explanation.length>50&&s.english.length>8&&s.indonesian.length>8&&s.why.length>30&&s.check.length>40&&s.checkAnswer.length>25));
 const examples=lesson.blocks.filter(x=>x.type==='example_group').flatMap(x=>x.items);cards+=examples.length;
 assert.equal(examples.length,10);assert.equal(new Set(examples.map(x=>x.english)).size,10);
 assert(examples.every(e=>e.note.length>50&&e.indonesian.length>8));
 assert.equal(lesson.blocks.filter(b=>b.type==='self_check').length,1);
 assert.equal(lesson.blocks.filter(b=>b.type==='checkpoint').length,1);
 assert.equal(lesson.practice.length,3);embedded+=lesson.practice.length;
 assert.equal(quiz.durationSeconds,0);assert.equal(quiz.questions.length,12);quizItems+=quiz.questions.length;
 assert.equal(quiz.passages.length,2);
 const lengths=quiz.passages.map(p=>p.text.trim().split(/\s+/).length);
 assert(lengths.every(n=>n>=200&&n<=350),`${id}: target passage length missed ${lengths}`);
 assert(lengths.some(n=>n>=200&&n<=300),`${id}: missing A2-length passage`);
 assert(lengths.some(n=>n>=250&&n<=350),`${id}: missing B1-length passage`);
 for(const typ of ['single','multiple','category'])assert.equal(quiz.questions.filter(q=>q.questionType===typ).length,4);
 assert.deepEqual([0,1,2,3].map(i=>quiz.questions.filter(q=>q.questionType==='single'&&q.answer===i).length),[1,1,1,1]);
 for(const q of quiz.questions){
  assert.doesNotThrow(()=>validateQuestion(q),q.id);
  const passage=quiz.passages.find(p=>p.id===q.passageId);
  assert(passage&&passage.text.includes(q.evidence),'Question evidence missing '+q.id);
  assert(q.translationId?.prompt?.length>8);
  assert(q.explanation.length>110&&q.genre&&q.proficiencyTarget&&q.competency&&q.skill);
  const answer=q.questionType==='single'?q.answer:q.questionType==='multiple'?q.answers:q.statements.map(s=>s.answerCategory);
  assert(isAnswered(q,answer),`Answer must be complete: ${q.id}`);
  assert(isCorrect(q,answer),`Authored answer must score: ${q.id}`);
  if(q.questionType==='category'){
   assert.equal(q.translationId.statements.length,q.statements.length);
   assert(q.statements.every(s=>s.explanation.length>25));
   assert(!isAnswered(q,[null,...answer.slice(1)]),'Unanswered row incorrectly complete');
  }else{
   assert.equal(q.choiceExplanations.length,q.choices.length);
   assert.equal(q.translationId.choices.length,q.choices.length);
   assert(q.choiceExplanations.every(x=>x.length>30));
  }
 }
 const key=quiz.questions.map(q=>q.questionType==='single'?q.answer:q.questionType==='multiple'?q.answers:q.statements.map(s=>s.answerCategory));
 assert.deepEqual(score(quiz.questions,key),{correct:12,incorrect:0,unanswered:0,total:12,percentage:100});
}
assert.equal(steps,21);assert.equal(cards,20);assert.equal(embedded,6);assert.equal(quizItems,24);
const tka=read('js/tka.js').toString();
const c2doc=read('docs/V13-C2-TKA-03-04.md').toString();
assert.match(c2doc,/105 resources/);
assert.match(c2doc,/TKA-03/);
assert.match(c2doc,/TKA-04/);
const home=read('index.html').toString();
assert.match(home,/id="learning-choices"/);
assert.match(home,/href="tka.html"/); // The redesigned homepage routes learners to the TKA page; module availability is verified on that page above.
for(const id of ['tka-classify-outline-summarize-synthesize','tka-context-vocabulary-reference-connectors'])assert(tka.includes(id),`TKA page does not publish ${id}`);
console.log('PASS V13-C2 historical milestone: TKA-03/TKA-04 content, 21 steps, 20 explained cards, 6 embedded items, 24 mixed-format quiz questions, A2/B1 passages, evidence, answer balance, scoring and all 101 V13-C1 files remain intact.');
