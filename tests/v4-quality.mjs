import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseBackup,makeBackup} from '../js/backup-format.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const cat=JSON.parse(read('data/catalog.json'));
const ids=new Set(cat.resources.map(r=>r.id));
assert.equal(ids.size,cat.resources.length);
assert.equal(cat.resources.length,45);
assert.equal(cat.resources.filter(r=>r.type==='lesson').length,30);
assert.equal(cat.resources.filter(r=>r.type==='quiz').length,15);
for(const term of Object.values(cat.grammarLevels).flat())assert.ok(cat.resources.some(r=>r.type==='lesson'&&r.placements.some(p=>p.pathway==='grammar')&&r.grammarTopics.includes(term)),`Not published: ${term}`);
for(const grade of [9,10,11,12])assert.ok(cat.resources.some(r=>r.placements.some(p=>p.pathway==='school'&&p.grade===grade)&&r.type==='lesson'),`Missing Grade ${grade}`);
for(const qid of ['utbk-mock-a','utbk-mock-b','utbk-mock-c']){
 const q=JSON.parse(read(`data/quizzes/${qid}.json`));
 assert.equal(q.questionCount,20);assert.equal(q.durationSeconds,1200);assert.equal(q.passages.length,4);
 assert.ok(q.questions.every(x=>x.passageId&&x.evidence&&x.skill));
 assert.equal(new Set(q.questions.map(x=>x.id)).size,20);
 assert.equal(new Set(q.passages.map(x=>x.text)).size,4);
 assert.ok(q.questions.some(x=>x.skill==='Critical Reading'));
 const ref=cat.resources.find(x=>x.id===qid);assert.equal(ref.examFormat,'full');
}
for(const id of ['reading-bridge','utbk-reading-lab','grammar-diagnostic','grade11-exposition','grade12-critical-reading'])assert.ok(ids.has(id));
for(const html of ['index.html','grammar.html','school.html','utbk.html','lesson.html','quiz.html','results.html']){
 const s=read(html);
 const els=[...s.matchAll(/\bid="([a-z0-9-]+)"/gi)].map(m=>m[1]);
 assert.equal(els.length,new Set(els).size,`${html}: duplicate ID`);
 for(const m of s.matchAll(/(?:href|src)="([^#?" ]+)/g))if(!m[1].includes('://'))assert.ok(fs.existsSync(path.join(root,m[1])),`${html}: missing ${m[1]}`);
}
assert.match(read('index.html'),/backup-import/);assert.match(read('index.html'),/utbk-mock-a/);
assert.ok(read('js/core.js').includes("'langkah.progress.v1'"));
assert.ok(read('js/quiz.js').includes("'langkah.draft.'"));
const i18nSource=read('js/i18n.js')+'\nexport {dictionary};';
const {dictionary}=await import('data:text/javascript;base64,'+Buffer.from(i18nSource).toString('base64'));
assert.deepEqual(Object.keys(dictionary.en).sort(),Object.keys(dictionary.id).sort());
for(const file of ['js/home.js','js/pathway.js','js/lesson.js','js/quiz.js','js/results.js','js/backup.js']){
 for(const m of read(file).matchAll(/\bt\('([A-Za-z]+)'/g))assert.ok(dictionary.en[m[1]],`Missing translation ${m[1]} in ${file}`);
}
for(const file of ['index.html','grammar.html','school.html','utbk.html','lesson.html','quiz.html','results.html'])for(const m of read(file).matchAll(/data-i18n="([a-zA-Z]+)"/g))assert.ok(dictionary.en[m[1]],`Missing page translation ${m[1]} in ${file}`);
assert.ok(read('js/lesson.js').includes('practiceAnswers=new Map()'));
assert.ok(read('js/results.js').includes('skillSummary()'));
// Representative real localStorage round-trip and refusal of malicious/corrupt backups.
const empty={lessons:{},attempts:[],activity:[]};
const storage=new Map();const storageMock={get length(){return storage.size},key:i=>[...storage.keys()][i],getItem:k=>storage.get(k)};
const output=makeBackup(storageMock,empty);
assert.deepEqual(parseBackup(JSON.stringify(output)).progress,empty);
assert.throws(()=>parseBackup('{invalid'));
assert.throws(()=>parseBackup({...output,version:999}));
assert.throws(()=>parseBackup({...output,progress:{...empty,lessons:{'__proto__':7,bad:-1}}}));
const quiz=JSON.parse(read('data/quizzes/utbk-reading-lab.json'));
const draft={quizSnapshot:JSON.stringify(quiz),mode:'practice',answers:Array(10).fill(null),flags:Array(10).fill(false),index:0,start:Date.now(),deadline:null};
storage.set('langkah.draft.utbk-reading-lab',JSON.stringify(draft));
const copy=makeBackup(storageMock,empty);assert.equal(parseBackup(JSON.stringify(copy)).drafts['utbk-reading-lab'].answers.length,10);
console.log('PASS V4: 45 resources, all 20 grammar topics, three unique 20-question UTBK mocks, school grades, links, translations, backup round trip.');
