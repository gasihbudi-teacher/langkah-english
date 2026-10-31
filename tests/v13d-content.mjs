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

const baseline=load('tests/fixtures/v13d-v13c5-content-sha256.json');
for(const [p,digest] of Object.entries(baseline))assert.equal(crypto.createHash('sha256').update(read(p)).digest('hex'),digest,`V13-C5 content changed: ${p}`);
assert.equal(Object.keys(baseline).length,117);
const home=load('tests/fixtures/v13d-v13c5-homepage-sha256.json');
for(const [p,digest] of Object.entries(home))assert.equal(crypto.createHash('sha256').update(read(p)).digest('hex'),digest,`Homepage core changed: ${p}`);

assert.equal(cat.resources.length,120);
assert.equal(cat.resources.filter(r=>r.type==='lesson').length,66);
assert.equal(cat.resources.filter(r=>r.type==='quiz').length,54);
assert.equal(new Set(cat.resources.map(r=>r.id)).size,120);
const ids=['tka-mock-a','tka-mock-b','tka-mock-c'];
const expectedTitles=['TKA Practice Simulation 1 · Everyday Communities','TKA Practice Simulation 2 · Communication and Change','TKA Practice Simulation 3 · Stories, Science and Sustainability'];
let totalQuestions=0;
for(let n=0;n<ids.length;n++){
 const id=ids[n],meta=cat.resources.find(r=>r.id===id);
 assert(meta,`Missing catalogue entry ${id}`);assert.equal(meta.type,'quiz');assert.equal(meta.examFormat,'full');assert.equal(meta.kind,'test');assert.equal(meta.unofficial,true);assert(meta.description.toLowerCase().includes('unofficial'));assert(meta.placements.some(p=>p.pathway==='tka'&&p.section==='Simulasi'));assert.deepEqual(meta.relatedLessons,cat.resources.filter(r=>r.type==='lesson'&&r.id.startsWith('tka-')).map(r=>r.id));assert.equal(meta.title,expectedTitles[n]);
 const quiz=load(meta.file);assert.equal(quiz.id,id);assert.equal(quiz.questionCount,30);assert.equal(quiz.questions.length,30);assert.equal(quiz.durationSeconds,2700);assert.deepEqual(quiz.referenceFormat,{questionCount:30,durationSeconds:2700,source:'Langkah English V13-D editorial practice specification; unofficial and not an official TKA format.'});assert.equal(quiz.passages.length,6);assert.equal(new Set(quiz.passages.map(p=>p.id)).size,6);assert.equal(new Set(quiz.questions.map(q=>q.id)).size,30);assert.deepEqual(quiz.questions.map(q=>q.id),Array.from({length:30},(_,i)=>`q${String(i+1).padStart(2,'0')}`));
 const levels=quiz.passages.map(p=>p.proficiencyTarget);assert.equal(levels.filter(x=>x==='A2').length,3);assert.equal(levels.filter(x=>x==='B1').length,3);
 for(const p of quiz.passages){const words=p.text.trim().split(/\s+/).length;if(p.proficiencyTarget==='A2')assert(words>=200&&words<=300,`${id}/${p.id} A2 length ${words}`);else assert(words>=250&&words<=350,`${id}/${p.id} B1 length ${words}`);assert(p.genre&&p.title&&p.text.length>1000);}
 const typeCounts=Object.fromEntries(['single','multiple','category'].map(t=>[t,quiz.questions.filter(q=>q.questionType===t).length]));assert.deepEqual(typeCounts,{single:10,multiple:10,category:10});assert.deepEqual([0,1,2,3].map(i=>quiz.questions.filter(q=>q.questionType==='single'&&q.answer===i).length),[3,3,2,2]);
 const passageCounts={};
 for(const q of quiz.questions){
  passageCounts[q.passageId]=(passageCounts[q.passageId]||0)+1;assert.doesNotThrow(()=>validateQuestion(q),`${id}/${q.id}`);const passage=quiz.passages.find(p=>p.id===q.passageId);assert(passage&&passage.text.includes(q.evidence),`Evidence missing ${id}/${q.id}`);assert(q.translationId?.prompt?.length>8);assert(q.explanation.length>100);assert(q.proficiencyTarget===passage.proficiencyTarget&&q.genre===passage.genre&&q.competency&&q.skill);
  const answer=q.questionType==='single'?q.answer:q.questionType==='multiple'?q.answers:q.statements.map(s=>s.answerCategory);assert(isAnswered(q,answer),`Incomplete authored key ${id}/${q.id}`);assert(isCorrect(q,answer),`Incorrect authored key ${id}/${q.id}`);
  if(q.questionType==='category'){assert.equal(q.translationId.categories.length,q.categories.length);assert.equal(q.translationId.statements.length,q.statements.length);assert(q.statements.every(s=>s.explanation.length>35));assert(!isAnswered(q,[null,...answer.slice(1)]));}
  else{assert.equal(q.translationId.choices.length,q.choices.length);assert.equal(q.choiceExplanations.length,q.choices.length);assert(q.choiceExplanations.every(x=>x.length>=40));}
 }
 assert.deepEqual(Object.values(passageCounts),[5,5,5,5,5,5]);
 const key=quiz.questions.map(q=>q.questionType==='single'?q.answer:q.questionType==='multiple'?q.answers:q.statements.map(s=>s.answerCategory));assert.deepEqual(score(quiz.questions,key),{correct:30,incorrect:0,unanswered:0,total:30,percentage:100});totalQuestions+=quiz.questions.length;
}
assert.equal(totalQuestions,90);
let steps=0,cards=0,scored=0,quizItems=0;
for(const r of cat.resources){const d=load(r.file);if(r.type==='lesson'){steps+=d.blocks.filter(b=>b.type==='scaffold').reduce((n,b)=>n+b.steps.length,0);cards+=d.blocks.filter(b=>b.type==='example_group').reduce((n,b)=>n+b.items.length,0);scored+=d.practice?.length||0;}else{scored+=d.questions.length;quizItems+=d.questions.length;}}
assert.equal(steps,608);assert.equal(cards,671);assert.equal(scored,659);assert.equal(quizItems,488);
const page=read('tka.html').toString(),tka=read('js/tka.js').toString(),i18n=read('js/i18n.js').toString();
assert.match(page,/id="tka-mock-list"/);assert.match(page,/V13-D \/ THREE ORIGINAL SIMULATIONS/);assert.match(page,/30 soal, enam bacaan, dan timer 45 menit/);assert.match(tka,/mockIds=\['tka-mock-a','tka-mock-b','tka-mock-c'\]/);for(const id of ids)assert(tka.includes(id),`TKA page does not publish ${id}`);assert.match(i18n,/Three original, unofficial simulations/);assert.match(i18n,/Tiga simulasi orisinal dan tidak resmi/);assert.match(i18n,/V13-D · Ten TKA modules and three full practice simulations are available/);assert.match(i18n,/V13-D · Sepuluh modul TKA dan tiga simulasi latihan lengkap sudah tersedia/);
for(const f of ['index.html','css/style.css','js/home.js','docs/HOMEPAGE-REDESIGN-PREVIEW.md','tests/v13-homepage-redesign.mjs'])assert(fs.existsSync(path.join(root,f)),`Homepage component missing: ${f}`);
console.log('PASS V13-D: three original 30-question/45-minute unofficial simulations; 18 original A2/B1 passages; 90 mixed-format items; exact evidence, Indonesian feedback, balanced single-answer keys, scoring; all 117 V13-C5 lesson/quiz files and redesigned homepage core SHA-identical; 120 resources / 608 steps / 671 cards / 659 scored items.');
