import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const c=JSON.parse(read('data/catalog.json'));
const lessons=c.resources.filter(x=>x.type==='lesson');
const quizzes=c.resources.filter(x=>x.type==='quiz');
assert.ok(lessons.length>=54,'V9/V11 lessons missing');
assert.ok(quizzes.length>=39,'V9/V11 quizzes missing');
assert.equal(new Set(c.resources.map(x=>x.id)).size,c.resources.length,'Duplicate resources');
let totalScaffolds=0,totalSteps=0,totalChecks=0,totalExamples=0,totalSelfChecks=0;
const prompts=new Set();
for(const m of lessons){
 const d=JSON.parse(read(m.file));
 const bs=d.blocks;
 assert.ok(Array.isArray(bs)&&bs.length>0,m.id+': lesson content is empty');
 const vocab=bs.filter(b=>b.type==='vocabulary');
 assert.ok(vocab.length<=1,m.id+': duplicate vocabulary sections');
 if(vocab.length)assert.equal(bs.at(-1),vocab[0],m.id+': vocabulary should remain at the end when included');
 const guided=bs.filter(b=>b.type==='scaffold');
 assert.ok(guided.length<=1,m.id+': duplicate scaffold containers');
 if(guided.length){
  totalScaffolds++;
  for(const [i,step] of guided[0].steps.entries()){
   totalSteps++;
   assert.ok(step.title?.trim()&&step.explanation?.trim(),m.id+': incomplete authored learning move '+i);
   const hasCheck=Boolean(step.check?.trim()),hasAnswer=Boolean(step.checkAnswer?.trim());
   assert.equal(hasCheck,hasAnswer,m.id+': check/answer must be paired '+i);
   if(hasCheck){
    totalChecks++;
    const key=step.check.replace(/\s+/g,' ').trim().toLowerCase();
    assert(!prompts.has(key),m.id+': repeated generic prompt '+key);prompts.add(key);
    const norm=x=>String(x??'').replace(/\s+/g,' ').trim().toLowerCase();
    for(const field of ['why','explanation'])if(step[field])assert.notEqual(norm(step.checkAnswer),norm(step[field]),m.id+': answer repeats teaching explanation '+i);
   }
   if(step.indonesian)assert.ok(step.english,m.id+': translation without English sample '+i);
  }
 }
 for(const group of bs.filter(b=>b.type==='example_group')){
  const examples=group.items||[];totalExamples+=examples.length;
  const unique=new Set(examples.map(e=>(e.english||'').trim().toLowerCase()));
  assert.equal(unique.size,examples.length,m.id+': duplicate examples within a group');
  assert(examples.every(e=>e.english&&e.note),m.id+': example without a learning point');
 }
 for(const task of bs.filter(b=>b.type==='self_check')){
  totalSelfChecks++;
  assert.ok(task.prompt&&task.criteria,m.id+': incomplete independent task');
 }
 for(const cp of bs.filter(b=>b.type==='checkpoint'))assert.ok(cp.prompt&&cp.explanation&&cp.choices?.length>=2,m.id+': incomplete guided checkpoint');
}
const lessonJs=read('js/lesson.js');
assert.doesNotMatch(lessonJs,/const marker=items\.findIndex/,'Essential theory still auto-collapsed');
assert.ok(lessonJs.indexOf('id="practice"')<lessonJs.indexOf('lesson-vocabulary'),'Vocabulary should render after scored practice');
const core=read('js/core.js');
for(const s of ["case 'definition'","case 'synthesis'","case 'self_check'","formatIdText(b.text)"])assert.ok(core.includes(s),'Missing safe renderer '+s);
const schema=JSON.parse(read('data/schemas/lesson.schema.json'));
const variants=schema.properties.blocks.items.oneOf;
for(const k of ['definition','synthesis','self_check'])assert.ok(variants.some(x=>x.properties.type.const===k),'Missing lesson block '+k);
for(const [id,expected] of [['grade9-trip-recount-practice','To retell the English club’s visit to an art studio.'],['grade9-upcycling-procedure-practice','To show how to make a pencil holder']]){
 const d=JSON.parse(read('data/quizzes/'+id+'.json'));
 assert.equal(d.questions[0].choices[d.questions[0].answer],expected,id+': original wrong answer was not corrected');
 if(id==='grade9-trip-recount-practice'){
  assert.equal(d.questionCount,7);assert.equal(d.questions.length,7);assert.equal(d.durationSeconds,420);
  assert.deepEqual(d.questions.map(x=>x.answer),[0,1,2,3,0,1,2]);
  assert.equal(d.passages.length,1);assert.equal(d.passages[0].original,true);
  for(const q of d.questions){assert.equal(q.passageId,d.passages[0].id);assert(d.passages[0].text.includes(q.evidence),q.id+': evidence must be exact');}
 }else assert.deepEqual(d.questions.map(x=>x.answer).sort(),[0,1,2,3]);
 for(const q of d.questions)assert.equal(q.translationId.choices.length,q.choices.length);
}
const recount=JSON.parse(read('data/lessons/grade9-trip-recount.json'));
assert.equal(recount.id,'grade9-trip-recount');assert.equal(recount.assessments[0],'grade9-trip-recount-practice');
assert.equal(recount.blocks.at(-1).type,'vocabulary');
assert.equal(recount.blocks.filter(b=>b.type==='self_check').length,1);
assert.equal(recount.practice.length,3);
const recountGuide=recount.blocks.find(b=>b.type==='scaffold');
assert.equal(recountGuide.steps.length,6);
assert(recountGuide.modelEnglish.trim().split(/\s+/).length>=130);
assert(recountGuide.steps.every(s=>s.english&&s.indonesian&&s.why&&s.check&&s.checkAnswer));
for(const id of ['utbk-mock-a','utbk-mock-b','utbk-mock-c']){
 const d=JSON.parse(read('data/quizzes/'+id+'.json'));
 assert.equal(d.questionCount,20);assert.equal(d.durationSeconds,1200);
}
assert.ok(core.includes("'langkah.progress.v1'"),'Student progress key altered');
console.log(`PASS V9 flexible structure regression: ${lessons.length} lessons; ${totalScaffolds} scaffold containers, ${totalSteps} authored steps, ${totalChecks} optional checks, ${totalExamples} authored examples, ${totalSelfChecks} independent tasks. No fixed block/check/example quota is imposed.`);
