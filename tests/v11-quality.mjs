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
const promptLocations=new Map();
let steps=0,checks=0,models=0,scaffoldLessons=0;
const trivial=/^(perhatikan (kalimat|contoh) ini|sekarang baca contoh|coba jawab)/i;
for(const entry of lessons){
 const lesson=JSON.parse(read(entry.file));
 const guides=lesson.blocks.filter(b=>b.type==='scaffold');
 assert.ok(guides.length<=1,`${entry.id}: unexpected duplicate scaffold container`);
 if(!guides.length)continue;
 scaffoldLessons++;
 const guide=guides[0];
 assert.ok(Array.isArray(guide.steps),`${entry.id}: scaffold steps must be an array`);
 for(const [i,step] of guide.steps.entries()){
  assert.ok(step.title?.trim()&&step.explanation?.trim(),`${entry.id}: missing authored title/explanation at ${i}`);
  assert.ok(!trivial.test(step.explanation),`${entry.id}: generic pedagogical placeholder`);
  for(const field of ['english','indonesian','why'])if(field in step)assert.ok(typeof step[field]==='string'&&step[field].trim(),`${entry.id}: empty optional ${field} at ${i}`);
  if(step.indonesian)assert.ok(step.english,`${entry.id}: translation without an English example at ${i}`);
  if(step.english)assert.ok(!step.english.includes('[['),`${entry.id}: English sample contains inline markup`);
  const hasCheck=typeof step.check==='string'&&step.check.trim().length>0;
  const hasAnswer=typeof step.checkAnswer==='string'&&step.checkAnswer.trim().length>0;
  assert.equal(hasCheck,hasAnswer,`${entry.id}: check and answer must be paired at ${i}`);
  if(hasCheck){
   assert.ok(step.check.length>=20&&step.checkAnswer.length>=10,`${entry.id}: authored check/answer too short at ${i}`);
   const key=step.check.replace(/\s+/g,' ').trim().toLocaleLowerCase('id');
   const prior=promptLocations.get(key)||[];prior.push(`${entry.id}[${i}]`);promptLocations.set(key,prior);
   const norm=x=>String(x??'').replace(/\s+/g,' ').trim().toLocaleLowerCase('id');
   for(const field of ['why','explanation'])if(step[field])assert.notEqual(norm(step.checkAnswer),norm(step[field]),`${entry.id}: answer repeats visible ${field} at ${i}`);
   checks++;
  }
  steps++;
 }
 if(guide.modelEnglish){
  assert.ok(typeof guide.modelEnglish==='string'&&guide.modelEnglish.trim().length>90,`${entry.id}: connected model too short`);
  if(guide.modelIndonesian)assert.ok(guide.modelIndonesian.trim().length>80,`${entry.id}: model translation too short`);
  models++;
 }else assert.ok(!guide.modelIndonesian,`${entry.id}: model translation exists without a model`);
}
for(const [prompt,locations] of promptLocations)assert.equal(locations.length,1,`Identical scaffold prompt reused: ${locations.join(', ')}`);
const core=read('js/core.js');
assert.ok(core.includes('scaffoldModel(b)')&&core.includes('scaffold-review'),'Model passage or optional checks not rendered');
assert.ok(core.includes('formatIdText(step.checkAnswer)'),'Self-check answer must use safe escaping');
assert.ok(core.includes("'langkah.progress.v1'"),'Existing progress key changed');
const schema=JSON.parse(read('data/schemas/lesson.schema.json'));
const s=schema.properties.blocks.items.oneOf.find(x=>x.properties.type.const==='scaffold');
assert.equal(s.properties.steps.minItems,1,'A scaffold may contain the number of steps the objective needs');
assert.equal('maxItems' in s.properties.steps,false,'Schema must not impose a fixed upper step quota');
for(const k of ['check','checkAnswer'])assert.ok(s.properties.steps.items.properties[k],`Schema omits ${k}`);
assert.deepEqual(s.properties.steps.items.dependentRequired,{check:['checkAnswer'],checkAnswer:['check']},'Optional scaffold checks must be paired');
assert.deepEqual(s.required,['type','steps'],'A scaffold intro is optional when the surrounding lesson already supplies context');
console.log(`PASS V11 flexible authoring: ${lessons.length} lessons; ${scaffoldLessons} currently use scaffold blocks; ${steps} authored steps, ${checks} optional checks and ${models} connected models. No fixed step/example/check quota is imposed by the generic authoring contract.`);
