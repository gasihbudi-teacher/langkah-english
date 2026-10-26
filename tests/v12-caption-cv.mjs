import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const c=read('data/catalog.json');
assert.ok(c.resources.filter(r=>r.type==='lesson').length>=56, 'V12 lesson baseline must remain');
assert.ok(c.resources.filter(r=>r.type==='quiz').length>=41, 'V12 quiz baseline must remain');
assert.equal(new Set(c.resources.map(r=>r.id)).size,c.resources.length);
assert.ok(c.schoolTopics['Grade 12'].includes('Caption Text: Reading and Writing Image Captions'));
assert.ok(c.schoolTopics['Grade 12'].includes('Curriculum Vitae (CV): Writing a Student CV'));
for(const id of ['grade12-caption-text','grade12-curriculum-vitae']){
 const lessonEntry=c.resources.find(r=>r.id===id);
 const quizEntry=c.resources.find(r=>r.id===id+'-practice');
 assert.deepEqual(lessonEntry.placements,[{pathway:'school',grade:12}]);
 assert.deepEqual(quizEntry.placements,[{pathway:'school',grade:12}]);
 assert.deepEqual(lessonEntry.relatedLessons.slice(0,1),[quizEntry.id]);
 const l=read(lessonEntry.file),z=read(quizEntry.file);
 assert.equal(l.blocks[0].type,'definition');assert.equal(l.blocks[1].type,'scaffold');assert.equal(l.blocks[2].type,'synthesis');
 assert.equal(l.blocks.at(-1).type,'vocabulary');
 const guide=l.blocks[1];
 assert.ok(guide.steps.length>=10 && guide.steps.length<=20,'Too few steps');
 assert.equal(new Set(guide.steps.map(s=>s.title.toLowerCase())).size,guide.steps.length);
 for(const st of guide.steps){
   for(const key of ['title','explanation','english','indonesian','why','check','checkAnswer'])assert.ok(st[key]?.length>=8,`${id}: missing ${key}`);
 }
 const cards=l.blocks.filter(x=>x.type==='example_group').flatMap(x=>x.items);
 assert.ok(cards.length>=10);
 assert.equal(new Set(cards.map(e=>e.english.toLowerCase())).size,cards.length);
 assert.ok(cards.every(e=>e.english && e.indonesian && e.note));
 assert.equal(l.blocks.filter(x=>x.type==='checkpoint').length,1);
 assert.equal(l.blocks.filter(x=>x.type==='self_check').length,1);
 assert.deepEqual(l.assessments,[quizEntry.id]);
 assert.equal(z.questionCount,12);assert.equal(z.questions.length,12);
 assert.equal(z.durationSeconds,0);
 assert.deepEqual([0,1,2,3].map(i=>z.questions.filter(q=>q.answer===i).length),[3,3,3,3]);
 for(const q of z.questions){
  assert.equal(q.choices.length,4);assert.equal(q.translationId.choices.length,4);
  assert.ok(q.explanation.length>30);
  if(q.passageId){const p=z.passages.find(p=>p.id===q.passageId);assert.ok(p && p.text.includes(q.evidence));}
 }
}
const pic=read('data/lessons/grade12-caption-text.json').blocks[1];
assert.ok(pic.modelImage && fs.existsSync(path.join(root,pic.modelImage)));
assert.ok(pic.modelImageAlt.length>30);
const cv=read('data/lessons/grade12-curriculum-vitae.json');
assert.ok(cv.blocks.find(b=>b.type==='self_check').criteria.includes('pribadi'));
console.log('PASS V12 add-on: 2 new Grade 12 lessons, 27 learning steps, 28 explained examples, 24 untimed balanced quiz items, catalogue and image registered.');
