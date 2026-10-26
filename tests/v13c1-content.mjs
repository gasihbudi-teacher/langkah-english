import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {validateQuestion,score,isCorrect,isAnswered} from '../js/question-types.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=p=>fs.readFileSync(path.join(root,p));
const load=p=>JSON.parse(file(p));
const cat=load('data/catalog.json');
const historical=load('tests/fixtures/v13c1-v13b-content-sha256.json');
for(const [p,digest] of Object.entries(historical))assert.equal(crypto.createHash('sha256').update(file(p)).digest('hex'),digest,`Legacy content changed: ${p}`);
assert.equal(Object.keys(historical).length,97,'Expected original V13-B content manifest');
assert.equal(cat.resources.length,101);
assert.equal(cat.resources.filter(x=>x.type==='lesson').length,58);
assert.equal(cat.resources.filter(x=>x.type==='quiz').length,43);
assert.equal(new Set(cat.resources.map(r=>r.id)).size,101);
const ids=['tka-reading-foundations','tka-explicit-information'];
let cards=0,steps=0,items=0;
for(const [n,id] of ids.entries()){
 const meta=cat.resources.find(r=>r.id===id),qm=cat.resources.find(r=>r.id===id+'-practice');
 assert(meta&&qm&&meta.placements[0].pathway==='tka'&&qm.placements[0].pathway==='tka');
 assert.equal(meta.type,'lesson');assert.equal(qm.type,'quiz');
 assert.deepEqual(meta.relatedLessons[0],qm.id);
 assert.deepEqual(qm.relatedLessons,[id]);
 const lesson=load(meta.file),quiz=load(qm.file);
 assert.deepEqual(lesson.assessments,[qm.id]);
 assert.equal(lesson.blocks[0].type,'definition');assert.equal(lesson.blocks[1].type,'scaffold');
 assert.equal(lesson.blocks[2].type,'synthesis');assert.equal(lesson.blocks.at(-1).type,'vocabulary');
 const sc=lesson.blocks[1];assert.equal(sc.steps.length,n===0?12:9);steps+=sc.steps.length;
 assert.equal(sc.modelPosition,'after');assert(sc.modelEnglish.split(/\s+/).length>=150);assert(sc.modelIndonesian.length>300);
 const phases=[...new Set(sc.steps.map(s=>s.phase))];assert.equal(phases.length,n===0?4:3);
 assert(sc.steps.every(s=>Object.values(s).every(x=>typeof x==='string'&&x.trim().length>8)));
 assert(sc.steps.every(s=>s.check.length>40));
 const examples=lesson.blocks.filter(x=>x.type==='example_group').flatMap(x=>x.items);
 cards+=examples.length;assert.equal(examples.length,10);assert.equal(new Set(examples.map(x=>x.english)).size,10);
 assert(examples.every(e=>e.note.length>50&&e.indonesian.length>8));
 assert.equal(lesson.blocks.filter(b=>b.type==='self_check').length,1);
 assert.equal(lesson.blocks.filter(b=>b.type==='checkpoint').length,1);
 assert.equal(lesson.practice.length,3);items+=3;
 assert.equal(quiz.durationSeconds,0);assert.equal(quiz.questions.length,12);items+=12;
 assert.equal(quiz.passages.length,2);
 const lengths=quiz.passages.map(p=>p.text.split(/\s+/).length);
 assert(lengths.every(n=>n>=200&&n<=350),id+': target passage length missed');
 if(n===1)assert(lengths.some(n=>n>=250),'Expected B1-length passage');
 for(const typ of ['single','multiple','category'])assert.equal(quiz.questions.filter(q=>q.questionType===typ).length,4);
 assert.deepEqual([0,1,2,3].map(i=>quiz.questions.filter(q=>q.questionType==='single'&&q.answer===i).length),[1,1,1,1]);
 for(const q of quiz.questions){
  assert.doesNotThrow(()=>validateQuestion(q),q.id);
  const passage=quiz.passages.find(p=>p.id===q.passageId);
  assert(passage&&passage.text.includes(q.evidence),'Question evidence missing '+q.id);
  assert.equal(q.translationId.prompt.length>8,true);
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
assert.equal(steps,21);assert.equal(cards,20);assert.equal(items,30);
assert.match(file('js/tka.js').toString(),/tka-reading-foundations-practice/);
assert.match(file('tka.html').toString(),/id="tka-new-lessons"/);
assert.match(file('tka.html').toString(),/id="tka-new-quizzes"/);
assert.match(file('js/core.js').toString(),/phasedScaffold\(b\)/);
assert.match(file('js/core.js').toString(),/modelPosition==='after'/);
assert.match(file('.github/workflows/validate.yml').toString(),/v13c1-content\.mjs/);
console.log('PASS V13-C1: 2 new lessons/21 phased steps/20 explained cards/6 embedded items; 24 mixed-format questions, evidence, answer balance, bilingual QA, scoring, original 97 content files SHA-identical.');
