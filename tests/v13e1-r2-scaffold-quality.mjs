import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const catalogue=JSON.parse(read('data/catalog.json'));
const lessons=catalogue.resources.filter(x=>x.type==='lesson');
assert.equal(lessons.length,66,'The 66-lesson inventory must remain intact');
const norm=value=>String(value??'').replace(/\s+/g,' ').trim().toLocaleLowerCase('id');
const promptLocations=new Map();
let steps=0,checks=0,explanationOnly=0;
for(const meta of lessons){
 const lesson=JSON.parse(read(meta.file));
 const guides=lesson.blocks.filter(b=>b.type==='scaffold');
 assert.ok(guides.length<=1,`${meta.id}: duplicate scaffold container`);
 if(!guides.length)continue;
 for(const [index,step] of guides[0].steps.entries()){
  steps++;
  assert(step.title?.trim()&&step.explanation?.trim(),`${meta.id}[${index}]: missing authored title/explanation`);
  const hasCheck=typeof step.check==='string'&&step.check.trim().length>0;
  const hasAnswer=typeof step.checkAnswer==='string'&&step.checkAnswer.trim().length>0;
  assert.equal(hasCheck,hasAnswer,`${meta.id}[${index}]: check and answer must be paired`);
  if(!hasCheck){explanationOnly++;continue;}
  checks++;
  assert(!/^Pada contoh tersebut\b/i.test(step.check.trim()),`${meta.id}[${index}]: generic placeholder check returned`);
  const answer=norm(step.checkAnswer);
  for(const field of ['why','explanation'])if(step[field])assert.notEqual(answer,norm(step[field]),`${meta.id}[${index}]: answer repeats visible ${field}`);
  const key=norm(step.check);
  const previous=promptLocations.get(key)||[];previous.push(`${meta.id}[${index}]`);promptLocations.set(key,previous);
 }
}
for(const [prompt,locations] of promptLocations)assert.equal(locations.length,1,`Identical scaffold prompt reused: ${locations.join(', ')}`);
assert.equal(steps,600,'Release inventory changed; update only after reviewing the source diff');
assert.equal(checks,158,'Release inventory changed; update only after reviewing the source diff');
assert.equal(explanationOnly,442,'Release inventory changed; update only after reviewing the source diff');

const grammar=JSON.parse(read('data/lessons/sentence-structure.json'));
const grammarSteps=grammar.blocks.find(b=>b.type==='scaffold').steps;
assert.equal(grammarSteps[3].english,'He sleeps.','S–V model must not contain an object');
assert.equal(grammarSteps[4].english,'The door opened. Someone opened the door.','Object lesson must contrast intransitive and transitive uses');
assert.match(grammarSteps[4].check,/direct object/i);
assert.match(grammarSteps[4].checkAnswer,/the door/i);
assert.equal(grammarSteps[4].checkAnswer.includes(grammarSteps[4].why),false);
assert.match(grammarSteps[7].english,/quietly in the library after lunch/);
assert.match(grammarSteps[8].english,/who arrived early/);

const format=JSON.parse(read('data/lessons/tka-question-formats-independent-practice.json'));
const formatWhy=format.blocks.find(b=>b.type==='scaffold').steps[7].why;
assert.match(formatWhy,/Setiap pernyataan pada soal kategori/);
assert.doesNotMatch(formatWhy,/perbaikan bertahan/);
const inference=JSON.parse(read('data/lessons/tka-inference-cause-character-prediction.json'));
const inferenceWhy=inference.blocks.find(b=>b.type==='scaffold').steps[9].why;
assert.match(inferenceWhy,/Persetujuan guru belum diberikan/);
assert.doesNotMatch(inferenceWhy,/Rani merasa senang/);

console.log(`PASS V13-E1-R3 scaffold quality: ${lessons.length} lessons, ${steps} scaffold steps, ${checks} optional purposeful checks, ${explanationOnly} explanation-only steps; no generic prompts, exact feedback duplicates, or repeated prompt strings.`);
