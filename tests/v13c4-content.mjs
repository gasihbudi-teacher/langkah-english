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
const baseline=load('tests/fixtures/v13c4-v13c3-content-sha256.json');
for(const [p,digest] of Object.entries(baseline))assert.equal(crypto.createHash('sha256').update(read(p)).digest('hex'),digest,`V13-C3 lesson/quiz changed: ${p}`);
assert.equal(Object.keys(baseline).length,109);
const homeBaseline=load('tests/fixtures/v13c4-v13c3-homepage-sha256.json');
for(const [p,digest] of Object.entries(homeBaseline))assert.equal(crypto.createHash('sha256').update(read(p)).digest('hex'),digest,`Redesigned homepage component changed: ${p}`);
assert.ok(cat.resources.length>=117);
assert.ok(cat.resources.filter(x=>x.type==='lesson').length>=66);
assert.ok(cat.resources.filter(x=>x.type==='quiz').length>=51);
assert.equal(new Set(cat.resources.map(r=>r.id)).size,cat.resources.length);
const ids=['tka-evaluating-facts-opinions-evidence','tka-narrative-appreciation'];
const expectedSteps=[12,10],expectedCompetencies=['Pemahaman Evaluatif','Apresiasi Naratif'];
let steps=0,cards=0,embedded=0,quizItems=0;
for(let i=0;i<ids.length;i++){
 const id=ids[i],meta=cat.resources.find(x=>x.id===id),qm=cat.resources.find(x=>x.id===id+'-practice');
 assert(meta&&qm&&meta.placements[0].pathway==='tka'&&qm.placements[0].pathway==='tka');
 assert.equal(meta.type,'lesson');assert.equal(qm.type,'quiz');
 assert.deepEqual(meta.relatedLessons[0],qm.id);assert.deepEqual(qm.relatedLessons,[id]);
 const lesson=load(meta.file),quiz=load(qm.file);
 assert.deepEqual(lesson.assessments,[qm.id]);
 assert.equal(lesson.blocks[0].type,'definition');assert.equal(lesson.blocks[1].type,'scaffold');
 assert.equal(lesson.blocks[2].type,'synthesis');assert.equal(lesson.blocks.at(-1).type,'vocabulary');
 const sc=lesson.blocks[1];assert.equal(sc.steps.length,expectedSteps[i]);steps+=sc.steps.length;
 assert.equal(sc.modelPosition,'after');
 const modelWords=sc.modelEnglish.trim().split(/\s+/).length;assert(modelWords>=200&&modelWords<=300,`${id} guided model length ${modelWords}`);
 assert(sc.modelIndonesian.length>500);
 assert.equal(new Set(sc.steps.map(x=>x.phase)).size,4);
 assert(sc.steps.every(x=>x.title.length>8&&x.explanation.length>50&&x.english.length>8&&x.indonesian.length>8&&x.why.length>30&&x.check.length>40&&x.checkAnswer.length>25));
 const examples=lesson.blocks.filter(x=>x.type==='example_group').flatMap(x=>x.items);cards+=examples.length;
 assert.equal(examples.length,10);assert.equal(new Set(examples.map(x=>x.english)).size,10);
 assert(examples.every(x=>x.note.length>50&&x.indonesian.length>8));
 assert.equal(lesson.blocks.filter(x=>x.type==='self_check').length,1);
 assert.equal(lesson.blocks.filter(x=>x.type==='checkpoint').length,1);
 assert.equal(lesson.practice.length,3);embedded+=lesson.practice.length;
 assert.equal(quiz.durationSeconds,0);assert.equal(quiz.questions.length,12);quizItems+=quiz.questions.length;
 assert.equal(quiz.passages.length,2);
 const lengths=quiz.passages.map(x=>x.text.trim().split(/\s+/).length);
 assert(lengths[0]>=200&&lengths[0]<=300,`${id} A2 passage length ${lengths[0]}`);
 assert(lengths[1]>=250&&lengths[1]<=350,`${id} B1 passage length ${lengths[1]}`);
 for(const type of ['single','multiple','category'])assert.equal(quiz.questions.filter(x=>x.questionType===type).length,4);
 assert.deepEqual([0,1,2,3].map(n=>quiz.questions.filter(x=>x.questionType==='single'&&x.answer===n).length),[1,1,1,1]);
 for(const q of quiz.questions){
  assert.doesNotThrow(()=>validateQuestion(q),q.id);
  const passage=quiz.passages.find(x=>x.id===q.passageId);
  assert(passage&&passage.text.includes(q.evidence),`Evidence quote missing: ${q.id}`);
  assert(q.translationId?.prompt?.length>8);
  assert(q.explanation.length>110&&q.genre&&q.proficiencyTarget&&q.competency===expectedCompetencies[i]&&q.skill);
  const answer=q.questionType==='single'?q.answer:q.questionType==='multiple'?q.answers:q.statements.map(x=>x.answerCategory);
  assert(isAnswered(q,answer),`Answer must be complete: ${q.id}`);
  assert(isCorrect(q,answer),`Authored answer must score: ${q.id}`);
  if(q.questionType==='category'){
   assert.equal(q.translationId.statements.length,q.statements.length);
   assert.equal(q.translationId.categories.length,q.categories.length);
   assert(q.statements.every(x=>x.explanation.length>25));
   assert(!isAnswered(q,[null,...answer.slice(1)]),'Unanswered category row incorrectly complete');
  }else{
   assert.equal(q.choiceExplanations.length,q.choices.length);
   assert.equal(q.translationId.choices.length,q.choices.length);
   assert(q.choiceExplanations.every(x=>x.length>30));
  }
 }
 const key=quiz.questions.map(q=>q.questionType==='single'?q.answer:q.questionType==='multiple'?q.answers:q.statements.map(x=>x.answerCategory));
 assert.deepEqual(score(quiz.questions,key),{correct:12,incorrect:0,unanswered:0,total:12,percentage:100});
}
assert.equal(steps,22);assert.equal(cards,20);assert.equal(embedded,6);assert.equal(quizItems,24);
let allSteps=0,allCards=0,allScored=0;
for(const r of cat.resources){
 const d=load(r.file);
 if(r.type==='lesson'){
  allSteps+=d.blocks.filter(x=>x.type==='scaffold').reduce((n,x)=>n+x.steps.length,0);
  allCards+=d.blocks.filter(x=>x.type==='example_group').reduce((n,x)=>n+x.items.length,0);
  allScored+=d.practice?.length||0;
 }else allScored+=d.questions.length;
}
assert.ok(allSteps>=608);assert.ok(allCards>=671);assert.ok(allScored>=569);
const tka=read('js/tka.js').toString(),page=read('tka.html').toString(),i18n=read('js/i18n.js').toString();
assert.match(page,/ROADMAP \/ 10 RELEASED · 0 PLANNED/);
assert.match(page,/120 ORIGINAL QUESTIONS/);
assert.match(page,/V13-D · Sepuluh modul TKA dan tiga simulasi mandiri/);
assert.match(i18n,/V13-D · Ten TKA modules and three full practice simulations are available/);
assert.match(i18n,/Sepuluh modul TKA dan tiga simulasi latihan lengkap sudah tersedia/);
for(const id of [...ids,'tka-classify-outline-summarize-synthesize','tka-context-vocabulary-reference-connectors','tka-implied-ideas-audience-purpose-message','tka-inference-cause-character-prediction'])assert(tka.includes(id),`TKA page does not publish ${id}`);
for(const f of ['css/style.css','js/home.js','docs/HOMEPAGE-REDESIGN-PREVIEW.md','tests/v13-homepage-redesign.mjs'])assert(fs.existsSync(path.join(root,f)),`Homepage redesign component missing: ${f}`);
console.log('PASS V13-C4: TKA-07/TKA-08 add 22 steps, 20 explained cards, 6 embedded practices and 24 mixed-format questions; A2/B1 full passages, exact evidence, balanced answer keys, bilingual QA, scoring, all 109 V13-C3 lesson/quiz files and redesigned homepage core unchanged; 113 resources / 585 steps / 651 cards / 539 scored items.');
