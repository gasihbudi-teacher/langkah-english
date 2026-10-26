import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const catalogue=JSON.parse(read('data/catalog.json'));
const lessons=catalogue.resources.filter(x=>x.type==='lesson');
const quizzes=catalogue.resources.filter(x=>x.type==='quiz');
assert.ok(lessons.length>=54,'V9/V11 lessons missing');
assert.ok(quizzes.length>=39,'V9/V11 quizzes missing');
const distribution=new Map();let steps=0,models=0,checks=0;
const trivial=/^(perhatikan (kalimat|contoh) ini|sekarang baca contoh|coba jawab)/i;
for(const entry of lessons){
 const lesson=JSON.parse(read(entry.file));
 const guide=lesson.blocks.find(b=>b.type==='scaffold');
 assert.ok(guide,`${entry.id}: scaffold missing`);
 assert.ok(guide.steps.length>=5 && guide.steps.length<=20,`${entry.id}: unexpected step count`);
 assert.ok(new Set(guide.steps.map(s=>s.title.toLowerCase())).size===guide.steps.length,`${entry.id}: repeated step titles`);
 assert.ok(guide.intro.length>=110,`${entry.id}: instructions missing`);
 assert.equal(lesson.blocks[0].type,'definition');
 assert.equal(lesson.blocks[1].type,'scaffold');
 assert.equal(lesson.blocks[2].type,'synthesis');
 assert.equal(lesson.blocks.at(-1).type,'vocabulary');
 for(const [i,step] of guide.steps.entries()){
  assert.ok(step.title.length>=3 && step.explanation.length>=35,`${entry.id}: empty explanation at ${i}`);
  assert.ok(!trivial.test(step.explanation),`${entry.id}: generic pedagogical placeholder`);
  for(const k of ['english','indonesian','why','check','checkAnswer'])assert.ok(typeof step[k]==='string' && step[k].trim().length>=(k==='english'?3:8),`${entry.id}: missing ${k} at ${i}`);
  assert.ok(!step.english.includes('[['),`${entry.id}: English mini-example contains inline markup`);
  assert.ok(step.check.length>40,`${entry.id}: no meaningful check at ${i}`);
  steps++;checks++;
 }
 if(guide.modelEnglish){
  assert.ok(guide.modelEnglish.length>90 && guide.modelIndonesian.length>80,`${entry.id}: model too short`);
  assert.ok(guide.modelTitle,`${entry.id}: missing model heading`);
  models++;
 }
 distribution.set(guide.steps.length,(distribution.get(guide.steps.length)||0)+1);
}
assert.ok(steps>=420 && models>=30 && checks===steps);
assert.ok(distribution.size>=5,'The step counts are still too uniform');
const core=read('js/core.js');
assert.ok(core.includes('scaffoldModel(b)')&&core.includes('scaffold-review'),'Model passage or checks not rendered');
assert.ok(core.includes('formatIdText(step.checkAnswer)'),'Self-check answer must use safe escaping');
assert.ok(core.includes("'langkah.progress.v1'"),'Existing progress key changed');
const schema=JSON.parse(read('data/schemas/lesson.schema.json'));
const s=schema.properties.blocks.items.oneOf.find(x=>x.properties.type.const==='scaffold');
assert.ok(s.properties.steps.maxItems>=20,'Schema still rejects longer scaffolds');
for(const k of ['check','checkAnswer'])assert.ok(s.properties.steps.items.properties[k],`Schema omits ${k}`);
console.log(`PASS V11: ${lessons.length} lessons, ${steps} individualized learning steps, ${checks} revealable comprehension checks, ${models} bilingual connected models, ${quizzes.length} registered quizzes. Distribution: ${[...distribution].sort((a,b)=>a[0]-b[0]).map(([k,v])=>`${k} steps × ${v}`).join(', ')}`);
