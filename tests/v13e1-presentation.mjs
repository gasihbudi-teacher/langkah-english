import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const catalogue=JSON.parse(read('data/catalog.json'));
const source=read('js/core.js');
const excerpt=source.slice(source.indexOf('// V6: explicit'));
const esc=`const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));\n`;
const {blocks}=await import('data:text/javascript;base64,'+Buffer.from(esc+excerpt).toString('base64'));

const schoolIds=new Set(catalogue.resources.filter(r=>r.type==='lesson'&&/^grade(?:9|10|11|12)-/.test(r.id)).map(r=>r.id));
assert.equal(schoolIds.size,31,'All 31 School English lessons must still be present');
let validated=0,schoolChecked=0;
for(const meta of catalogue.resources.filter(r=>r.type==='lesson')){
 const lesson=JSON.parse(read(meta.file));
 const rendered=blocks(lesson.blocks);
 assert.doesNotMatch(rendered,/<(?:strong|span)[^>]*>\s*(?:Artinya:|Mengapa\?|Coba pahami:)/i,`${meta.id}: repeated labels returned`);
 assert.doesNotMatch(rendered,/Lihat penjelasan setelah mencoba sendiri/,`${meta.id}: compulsory reveal heading returned`);
 const scaffold=lesson.blocks.find(x=>x.type==='scaffold');
 const authoredChecks=scaffold.steps.filter(x=>x.check).length;
 const visibleChecks=(rendered.match(/class="scaffold-review"/g)||[]).length;
 assert.equal(visibleChecks,authoredChecks,`${meta.id}: invented or missing check`);
 const examples=lesson.blocks.filter(b=>b.type==='example_group').flatMap(b=>b.items);
 const translations=(rendered.match(/class="lesson-translation-help"/g)||[]).length;
 const translationMinimum=examples.length+scaffold.steps.filter(x=>x.english&&x.indonesian).length+(scaffold.modelIndonesian?1:0);
 assert(translations>=translationMinimum,`${meta.id}: Indonesian assistance disappeared`);
 assert.match(rendered,/<p class="scaffold-insight" lang="id">/,`${meta.id}: teaching explanations disappeared`);
 validated++;
 if(schoolIds.has(meta.id))schoolChecked++;
}
assert.equal(schoolChecked,31);
const model=JSON.parse(read('data/lessons/grade9-reading.json'));
const guide=model.blocks.find(b=>b.type==='scaffold');
assert.equal(guide.steps.filter(s=>s.check).length,7);
const html=blocks(model.blocks);
assert.equal((html.match(/class="scaffold-review"/g)||[]).length,7);
assert.match(html,/Baca terjemahan teks model/);
assert.match(html,/Periksa jawaban/);
assert(!html.includes('Coba pahami:'),'Old Grade 9 instructional label is visible');
// All learner-controlled instructional text must remain safely escaped.
const adversarial=blocks([{type:'scaffold',intro:'Baca',steps:[{
 title:'<script>alert(1)</script>',explanation:'& observe',english:'<img src=x>',
 indonesian:'<b>terjemahan</b>',why:'<svg onload=alert(1)>',
 check:'<img src=x>?',checkAnswer:'<iframe src=x>'
 }]}]);
for(const fragment of ['&lt;script&gt;','&lt;img src=x&gt;','&lt;b&gt;','&lt;svg','&lt;iframe'])assert(adversarial.includes(fragment),`Unsafe or lost escaping: ${fragment}`);
assert.doesNotMatch(adversarial,/<(?:script|img|iframe|svg|b)(?:\s|>)/i);
console.log(`PASS V13-E1 presentation: ${validated} lessons rendered, including all ${schoolChecked} core School lessons; no compulsory four-label scaffold; authored checks rendered only when present; optional translations and explanations accessible; HTML escaped.`);
