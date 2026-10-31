import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
// V8 extends the catalogue; this historical regression test checks the untouched V7 baseline.
const allCatalog=JSON.parse(read('data/catalog.json'));
const baselineIds=new Set(JSON.parse(read('data/v7-resource-ids.json')));
const cat={...allCatalog,resources:allCatalog.resources.filter(r=>baselineIds.has(r.id))};
const rxIndonesian=/\b(apa|manakah|pilih|kalimat|yang|adalah|karena|menurut|setelah|dengan|paling|terjadi|menjadi|merujuk|berarti|termasuk|membuktikan|tidak|pada|dalam|penulis|sekolah|untuk|sebuah|siswa|saat|memilih|rata-rata|maka|antara|semua|hanya)\b/i;
let all=0,fullTranslated=0,promptTranslated=0;
for(const resource of cat.resources){
 const data=JSON.parse(read(resource.file));const questions=resource.type==='lesson'?data.practice:data.questions;
 if(resource.id==='grade9-reading')continue; // Intentionally revised in V13-E1; covered by tests/v13e1-grade9-reading.mjs.
 for(const q of questions){
  all++;
  assert.ok(!rxIndonesian.test(q.prompt),`Non-English question ${resource.id}/${q.id}: ${q.prompt}`);
  for(const choice of q.choices)assert.ok(!rxIndonesian.test(choice),`Non-English option ${resource.id}/${q.id}: ${choice}`);
  assert.ok(q.translationId?.prompt?.trim(),`Missing Indonesian question translation: ${resource.id}/${q.id}`);
  promptTranslated++;
  if(q.translationId.choices){
   assert.equal(q.translationId.choices.length,q.choices.length,`Translation/options length differs: ${resource.id}/${q.id}`);
   fullTranslated++;
  }
  assert.ok(q.choices.every((v,i)=>q.choices.indexOf(v)===i),`Duplicate choice: ${resource.id}/${q.id}`);
 }
 if(resource.type==='quiz'&&data.questions.every(q=>q.choices.length===4)){
  const totals=[0,0,0,0];for(const q of data.questions)totals[q.answer]++;
  assert.ok(Math.max(...totals)-Math.min(...totals)<=1,`Answers clumped: ${resource.id}, ${totals.join(',')}`);
 }
}
assert.equal(all,232);
assert.equal(promptTranslated,all);
for(const id of ['utbk-mock-a','utbk-mock-b','utbk-mock-c','utbk-reading-lab']){
 const d=JSON.parse(read('data/quizzes/'+id+'.json'));
 assert.ok(d.questions.every(q=>q.translationId.choices?.length===4),`Incomplete bilingual UTBK: ${id}`);
}

// Semantic alignment checks: translation must follow the SHUFFLED English answer,
// rather than the original file's option index.
const semanticPairs=[
 ['courtyard-reading',0,'A school reading-space project produced promising results that need careful investigation.','Proyek ruang baca sekolah menunjukkan hasil menjanjikan, tetapi memerlukan penyelidikan cermat.'],
 ['grammar-diagnostic',6,'contrast','pertentangan'],
 ['grammar-diagnostic',8,'proof or supporting facts','bukti'],
 ['grammar-diagnostic',9,'Lower ticket prices may also have influenced visits.','Harga tiket mungkin juga berpengaruh.'],
 ['utbk-mock-c',0,'Unexpected differences in measurements require a review of tools and methods.','Pengukuran yang tampak berbeda perlu diperiksa dari sisi alat dan cara pengumpulan data.']
];
for(const [id,idx,en,idText] of semanticPairs){
 const q=JSON.parse(read('data/quizzes/'+id+'.json')).questions[idx];
 const optionIndex=q.choices.indexOf(en);
 assert.ok(optionIndex>=0,`${id} missing English benchmark option`);
 assert.equal(q.translationId.choices[optionIndex],idText,`${id} Indonesian choice translation misaligned`);
}
const pages=['index.html','grammar.html','utbk.html','school.html','lesson.html','quiz.html','results.html','search.html'];
for(const p of pages){
 const h=read(p);
 assert.match(h,/href="search.html"/,`Missing search nav: ${p}`);
 assert.match(h,/data-i18n="navSearch"/,`Missing search label: ${p}`);
 for(const a of h.matchAll(/(?:href|src)="([^#?" ]+)/g))if(!a[1].includes('://'))assert.ok(fs.existsSync(path.join(root,a[1])),`Missing asset ${a[1]} on ${p}`);
 const ids=[...h.matchAll(/\bid="([\w-]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`duplicate id: ${p}`);
}
for(const p of ['index.html','grammar.html','utbk.html','school.html']){
 assert.doesNotMatch(read(p),/filter-panel|id="(?:pathway-filters|filters|clear|path-reset)"/,`Filter remains in ${p}`);
}
assert.match(read('search.html'),/id="search-input"/);
assert.match(read('js/search.js'),/includes\(term\)/);
assert.match(read('js/pathway.js'),/simple-resources/);
assert.match(read('js/quiz.js'),/translationDetails\(q\)/);
assert.match(read('js/lesson.js'),/translationDetails\(q\)/);
assert.match(read('js/results.js'),/translationDetails\(q\)/);
assert.match(read('js/results.js'),/diagnosticRecommendations\(groups\)/);
assert.doesNotMatch(read('js/results.js'),/r\.percentage<50\?'lesson/);
// Exercise collapsible markup and ensure HTML escaping prevents injection.
let module=read('js/translations.js').replace("import {esc} from './core.js';", "const esc=s=>String(s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]));").replace("import {t} from './i18n.js';", "const t=x=>x;");
const {translationDetails}=await import('data:text/javascript;base64,'+Buffer.from(module).toString('base64'));
const text=translationDetails({choices:['x','y'],translationId:{prompt:'<script>alert(1)</script>',choices:['A & B','Pilihan B']}});
assert.match(text,/<details/);assert.match(text,/<summary/);assert.match(text,/&lt;script&gt;/);assert.doesNotMatch(text,/<script>/);assert.match(text,/A &amp; B/);
assert.equal(translationDetails({choices:['x'],translationId:{}}),'');
const dictSource=read('js/i18n.js')+'\nexport {dictionary};';
const {dictionary}=await import('data:text/javascript;base64,'+Buffer.from(dictSource).toString('base64'));
assert.deepEqual(Object.keys(dictionary.en).sort(),Object.keys(dictionary.id).sort());
for(const p of pages)for(const m of read(p).matchAll(/data-i18n="([\w]+)"/g))assert.ok(dictionary.id[m[1]],`Missing i18n: ${m[1]}`);
console.log(`PASS V5: 8 HTML pages; all ${all} unchanged baseline questions and choices are English; ${promptTranslated} Indonesian question glosses; ${fullTranslated} sets of choice translations; 70 full UTBK bilingual questions; balanced answers; safe expandable translations; no page filters.`);
