import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const allCatalog=JSON.parse(read('data/catalog.json'));
const v7Ids=new Set(JSON.parse(read('data/v7-resource-ids.json')));
const catalog={...allCatalog,resources:allCatalog.resources.filter(r=>v7Ids.has(r.id))};
const rxId=/\b(apa|manakah|pilih|kalimat|yang|adalah|karena|menurut|setelah|dengan|paling|terjadi|menjadi|merujuk|berarti|termasuk|membuktikan|tidak|pada|dalam|penulis|sekolah|untuk|sebuah|siswa|saat|memilih|maka|antara|semua|hanya)\b/i;
let lessonCount=0, checkpointCount=0, answerItems=0, marked=0;
const fingerprint=[];
for(const m of catalog.resources){
 const d=JSON.parse(read(m.file));
 const questions=m.type==='lesson'?d.practice:d.questions;
 for(const q of questions){
  if(m.id==='grade9-reading')continue; // Re-authored in V13-E1; covered by the dedicated E1 regression.
  fingerprint.push({resource:m.id,id:q.id,prompt:q.prompt,choices:q.choices,answer:q.answer,translationId:q.translationId??null});
 }
 if(m.type!=='lesson')continue;
 lessonCount++;
 const [scaffold]=d.blocks.filter(b=>b.type==='scaffold');
 assert.ok(scaffold,`${m.id}: missing scaffold`);
 assert.equal(d.blocks[0].type,'definition',`${m.id}: definition must introduce lesson`);
 assert.ok(scaffold.steps.length>=2&&scaffold.steps.length<=20);
 assert.ok(scaffold.intro.length>=65,`${m.id}: introductory explanation too short`);
 assert.ok(scaffold.steps.every(x=>x.explanation.length>=35),`${m.id}: one microstep is too brief`);
 assert.ok(scaffold.steps.filter(s=>s.english).length>=2&&scaffold.steps.filter(s=>s.english).every(s=>s.indonesian&&s.why),`${m.id}: untranslated mini-example`);
 assert.ok(new Set(scaffold.steps.filter(s=>s.english).map(s=>s.english)).size>=2,`${m.id}: no progression`);
 assert.ok(!scaffold.steps.some(x=>rxId.test(x.english||'')),`${m.id}: Indonesian exercise example`);
 const baseIndex=d.blocks.findIndex(x=>x.type==='example_group'&&x.title.startsWith('1'));
 const compareIndex=d.blocks.findIndex(x=>x.type==='example_group'&&x.title.startsWith('2'));
 const checkIndex=d.blocks.findIndex(x=>x.type==='checkpoint');
 const reflectIndex=d.blocks.findIndex(x=>x.type==='reflection');
 assert.ok(baseIndex<checkIndex&&checkIndex<compareIndex&&compareIndex<reflectIndex,`${m.id}: guided content not scaffolded`);
 const [check]=d.blocks.filter(x=>x.type==='checkpoint');
 assert.equal(check.id,'guided-'+m.id);
 assert.ok(check.prompt&&!rxId.test(check.prompt),`${m.id}: checkpoint prompt not in English`);
 assert.equal(check.choices.length,3);assert.equal(check.translationChoices.length,3);
 assert.ok(check.choices.every(x=>x.trim()&&!rxId.test(x)),`${m.id}: checkpoint choices not in English`);
 assert.ok(check.translationChoices.every(x=>x.trim()),`${m.id}: untranslated formative choice`);
 assert.ok(check.translation.trim()&&check.hint.trim()&&check.explanation.trim(),`${m.id}: missing support text`);
 assert.ok(Number.isInteger(check.answer)&&check.answer>=0&&check.answer<3);
 assert.equal(new Set(check.choices).size,3,`${m.id}: duplicate check option`);
 assert.equal(d.blocks.filter(x=>x.type==='checkpoint').length,1);
 assert.equal(d.blocks.filter(x=>x.type==='reflection').length,1);
 const markerCount=JSON.stringify(d.blocks).match(/\[\[/g)?.length||0;
 marked+=markerCount;assert.ok(markerCount>=5,`${m.id}: missing labelled terminology`);
 checkpointCount++;answerItems+=check.translationChoices.length;
}
assert.equal(lessonCount,30);assert.equal(checkpointCount,30);assert.equal(answerItems,90);
assert.equal(fingerprint.length,232);
assert.equal(crypto.createHash('sha256').update(JSON.stringify(fingerprint)).digest('hex'),'582f4dd18eabeead8ab70100b9fd56a0bddde726c0617829b0a5996730de5291');
// Test renderer: V7 markup must escape input, keep terms in English and hide solutions until answered.
const excerpt=read('js/core.js').split('// V6: explicit')[1];
assert.ok(excerpt);
const esc=`const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));\n`;
const {blocks}=await import('data:text/javascript;base64,'+Buffer.from(esc+'// V6: explicit'+excerpt).toString('base64'));
const rendered=blocks([
 {type:'scaffold',intro:'Mulai [[verb]] satu per satu.',steps:[{title:'Satu',explanation:'Kenali subjek.'},{title:'Dua',explanation:'Coba contoh.',english:'She reads.',indonesian:'Dia membaca.',why:'[[She]] adalah subjek.'},{title:'Tiga',explanation:'Bandingkan.',english:'They read.',indonesian:'Mereka membaca.',why:'[[They]] adalah subjek.'}]},
 {type:'checkpoint',id:'guided-test',prompt:'Which sentence is correct?',choices:['<img>','He reads.','He readed.'],answer:1,translation:'Pilih kalimat yang benar.',translationChoices:['gambar','Dia membaca.','Bentuk keliru.'],hint:'Periksa pelakunya.',explanation:'Gunakan [[reads]].'},
 {type:'reflection',prompt:'What changes?',translation:'Apa yang berubah?',answer:'Bentuk kata kerja.'},
 {type:'reference',blocks:[{type:'text',text:'Penjelasan tentang [[verb]].'}]}
]);
assert.match(rendered,/class="scaffold-guide"/);
assert.match(rendered,/data-guided-check="guided-test"/);
assert.match(rendered,/<details class="lesson-reference"/);
assert.match(rendered,/<details class="translation-detail"/);
assert.match(rendered,/<span class="english-term" lang="en">verb<\/span>/);
assert.match(rendered,/&lt;img&gt;/);assert.doesNotMatch(rendered,/<img>/);
assert.match(read('css/style.css'),/\.english-term::before\{content:'“'\}/);
assert.match(read('css/style.css'),/\.english-term::after\{content:'”'\}/);
const pathway=read('js/pathway.js');
for(const s of ['grade-', '-materi','-latihan','utbk-mocks','previousOpen','openForHash','<details class="topic-fold"'])assert.ok(pathway.includes(s),`Missing directory behavior ${s}`);
assert.ok(pathway.includes('if(node && node.tagName'), 'Legacy grade hash not preserved');
const lesson=read('js/lesson.js');
assert.match(lesson,/const guidedAnswers=new Map\(\)/);
assert.match(lesson,/d\.blocks\.filter\(b=>b\.type==='definition'\)/);
assert.match(lesson,/guidedAnswers\.set/);
assert.match(lesson,/formatIdText\(q.explanation\)/);
console.log(`PASS V7: ${lessonCount} new slow-start lesson guides, ${checkpointCount} English formative checks with ${answerItems} Indonesian option glosses, 30 reflections, expandable study/practice lists, quoted terms; ${marked} markers; 232 unaffected baseline questions unchanged.`);
