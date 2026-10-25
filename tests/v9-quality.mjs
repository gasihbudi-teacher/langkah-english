import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const c=JSON.parse(read('data/catalog.json'));
const lessons=c.resources.filter(x=>x.type==='lesson');
const quizzes=c.resources.filter(x=>x.type==='quiz');
assert.equal(lessons.length,54);
assert.equal(quizzes.length,39);
assert.equal(new Set(c.resources.map(x=>x.id)).size,93);
const uniqueScaffolds=new Set();
let totalCards=0,totalSelfChecks=0,totalScaffolds=0;
for(const m of lessons){
 const d=JSON.parse(read(m.file));
 const bs=d.blocks;
 assert.equal(bs[0]?.type,'definition',m.id+': missing opening definition');
 assert.equal(bs[1]?.type,'scaffold',m.id+': missing guided scaffold');
 assert.equal(bs[2]?.type,'synthesis',m.id+': missing visible detailed synthesis');
 assert.equal(bs[bs.length-1]?.type,'vocabulary',m.id+': vocabulary must be last');
 assert.ok(bs[0].text.trim().length>=70&&bs[2].text.trim().length>=150,m.id+': insufficient definitions');
 assert.notEqual(bs[0].text,bs[2].text,m.id+': summary is a repeated definition');
 const guided=bs[1];assert.ok(guided.steps.length>=2&&guided.steps.length<=5);
 assert.ok(guided.steps.filter(s=>s.english&&s.indonesian&&s.why).length>=2,m.id+': missing worked mini-examples');
 assert.ok(guided.steps.every(s=>s.title&&s.explanation),m.id+': incomplete guided step');
 uniqueScaffolds.add(guided.steps[0].title);totalScaffolds++;
 const groups=bs.filter(b=>b.type==='example_group');
 const examples=groups.flatMap(g=>g.items);totalCards+=examples.length;
 assert.ok(groups.length>=3&&examples.length>=10,m.id+': fewer than ten explained cards');
 assert.ok(groups.every(g=>g.collapsed===false),m.id+': a core example is hidden');
 assert.equal(new Set(examples.map(e=>e.english.trim().toLowerCase())).size,examples.length,m.id+': duplicate example');
 assert.ok(examples.every(e=>e.english&&e.indonesian&&e.note),m.id+': card missing explanation');
 assert.ok(examples.every(e=>!e.english.includes('[[')),m.id+': English example contains inline markup');
 assert.equal(bs.filter(b=>b.type==='self_check').length,1,m.id+': ungraded production practice missing');
 totalSelfChecks++;
 const write=bs.find(b=>b.type==='self_check');
 assert.ok(write.prompt.length>40&&write.model&&write.modelTranslation&&write.criteria,m.id+': open-response model incomplete');
 assert.equal(bs.filter(b=>b.type==='vocabulary').length,1);
 assert.equal(bs.filter(b=>b.type==='checkpoint').length,1);
 assert.ok(bs.indexOf(bs.find(b=>b.type==='self_check'))>bs.findIndex(b=>b.type==='summary'),m.id+': write task before recap');
}
assert.ok(uniqueScaffolds.size>=6,'Scaffold is still too uniform');
assert.ok(totalCards>=540,'Insufficient total explained examples');
assert.equal(totalScaffolds,54);assert.equal(totalSelfChecks,54);
const lessonJs=read('js/lesson.js');
assert.doesNotMatch(lessonJs,/const marker=items\.findIndex/,'Essential theory still auto-collapsed');
assert.ok(lessonJs.indexOf('id="practice"')<lessonJs.indexOf('lesson-vocabulary'),'Vocabulary should render after scored practice');
const core=read('js/core.js');
for(const s of ["case 'definition'","case 'synthesis'","case 'self_check'","formatIdText(b.text)"])assert.ok(core.includes(s),'Missing safe renderer '+s);
const schema=JSON.parse(read('data/schemas/lesson.schema.json'));
const variants=schema.properties.blocks.items.oneOf;
for(const k of ['definition','synthesis','self_check'])assert.ok(variants.some(x=>x.properties.type.const===k),'Missing new JSON Schema block '+k);
for(const [id,expected] of [['grade9-trip-recount-practice','A class visit to a history museum'],['grade9-upcycling-procedure-practice','To show how to make a pencil holder']]){
 const d=JSON.parse(read('data/quizzes/'+id+'.json'));
 assert.equal(d.questions[0].choices[d.questions[0].answer],expected,id+': original wrong answer was not corrected');
 assert.deepEqual(d.questions.map(x=>x.answer).sort(),[0,1,2,3]);
 for(const q of d.questions)assert.equal(q.translationId.choices.length,q.choices.length);
}
for(const id of ['utbk-mock-a','utbk-mock-b','utbk-mock-c']){
 const d=JSON.parse(read('data/quizzes/'+id+'.json'));
 assert.equal(d.questionCount,20);assert.equal(d.durationSeconds,1200);
}
assert.ok(read('js/core.js').includes("'langkah.progress.v1'"),'Student progress key altered');
console.log(`PASS V9: ${lessons.length} revised lessons, ${totalCards} unique bilingual cards, ${uniqueScaffolds.size} scaffold families, ${totalSelfChecks} ungraded open responses, vocab last, key repairs and compatible UTBK mocks.`);
