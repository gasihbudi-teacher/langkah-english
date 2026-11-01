import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const catalogue=JSON.parse(read('data/catalog.json'));
const source=read('js/core.js');
const excerpt=source.slice(source.indexOf('// V6: explicit'));
const esc=`const t=key=>key;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));\n`;
const {blocks}=await import('data:text/javascript;base64,'+Buffer.from(esc+excerpt).toString('base64'));

const schoolIds=new Set(catalogue.resources.filter(r=>r.type==='lesson'&&/^grade(?:9|10|11|12)-/.test(r.id)).map(r=>r.id));
assert.equal(schoolIds.size,31,'All 31 School English lessons must still be present');
let validated=0,schoolChecked=0;
for(const meta of catalogue.resources.filter(r=>r.type==='lesson')){
 const lesson=JSON.parse(read(meta.file));
 const rendered=blocks(lesson.blocks);
 assert.doesNotMatch(rendered,/<(?:strong|span)[^>]*>\s*(?:Artinya:|Mengapa\?|Coba pahami:)/i,`${meta.id}: repeated labels returned`);
 assert.doesNotMatch(rendered,/Lihat penjelasan setelah mencoba sendiri/,`${meta.id}: compulsory reveal heading returned`);
 assert.doesNotMatch(rendered,/Mulai dari dasar, pelan-pelan|langkah bertahap · Boleh dibaca|Jika masih bingung, baca kembali contoh|Tahap dibagi menjadi bagian kecil|Lanjutkan saat sudah memahami contoh/,`${meta.id}: compulsory scaffold boilerplate returned`);
 assert.doesNotMatch(rendered,/class="scaffold-total"|class="scaffold-next"|class="scaffold-phase-guide"|class="scaffold-phase-check"/,`${meta.id}: generic scaffold wrapper returned`);
 const scaffold=lesson.blocks.find(x=>x.type==='scaffold');
 const authoredChecks=scaffold?scaffold.steps.filter(x=>x.check).length:0;
 const visibleChecks=(rendered.match(/class="scaffold-review"/g)||[]).length;
 assert.equal(visibleChecks,authoredChecks,`${meta.id}: invented or missing check`);
 const examples=lesson.blocks.filter(b=>b.type==='example_group').flatMap(b=>b.items);
 const translations=(rendered.match(/class="lesson-translation"/g)||[]).length;
 const translationMinimum=examples.length+(scaffold?scaffold.steps.filter(x=>x.english&&x.indonesian).length+(scaffold.modelIndonesian?1:0):0);
 assert(translations>=translationMinimum,`${meta.id}: Indonesian assistance disappeared`);
 const authoredInsights=scaffold?scaffold.steps.filter(x=>x.why).length:0;
 assert((rendered.match(/class="scaffold-insight"/g)||[]).length===authoredInsights,`${meta.id}: authored teaching explanations were lost or invented`);
 validated++;
 if(schoolIds.has(meta.id))schoolChecked++;
}
assert.equal(schoolChecked,31);
const noScaffold=blocks([{type:'definition',title:'A focused concept',text:'A short concept introduction.'},{type:'text',text:'A lesson may be taught through a passage, comparison, table, or writing task without a scaffold block.'}]);
assert.doesNotMatch(noScaffold,/scaffold-guide|Mulai dari dasar/,'A lesson without a scaffold must not receive a scaffold wrapper automatically');
const model=JSON.parse(read('data/lessons/grade9-reading.json'));
const guide=model.blocks.find(b=>b.type==='scaffold');
const expectedChecks=guide.steps.filter(s=>s.check).length;
const html=blocks(model.blocks);
assert.equal((html.match(/class="scaffold-review"/g)||[]).length,expectedChecks);
assert.match(html,/class="lesson-translation"/);
assert.match(html,/Taman sekolah berada di belakang ruang sains/);
assert.match(html,/Periksa jawaban/);
assert(!html.includes('Coba pahami:'),'Old Grade 9 instructional label is visible');


// Grade 9 Lesson 2: a distinct narrative-reading progression and unfamiliar transfer text.
const narrativeMeta=catalogue.resources.find(r=>r.id==='grade9-narrative');
const narrativeQuizMeta=catalogue.resources.find(r=>r.id==='grade9-narrative-practice');
assert(narrativeMeta&&narrativeQuizMeta,'Grade 9 Narrative lesson and independent practice must be registered');
assert.deepEqual(narrativeMeta.placements[0],{pathway:'school',grade:9});
assert(narrativeMeta.placements.some(p=>p.pathway==='grammar')&&narrativeMeta.placements.some(p=>p.pathway==='tka'),'Existing cross-listings must remain available');
assert.equal(narrativeMeta.order,215);
assert.equal(narrativeQuizMeta.type,'quiz');
assert.equal(narrativeQuizMeta.title,'Grade 9 Narrative Check: The Missing Exhibition Lantern');
assert.deepEqual(narrativeQuizMeta.placements[0],{pathway:'school',grade:9});
assert.deepEqual(narrativeQuizMeta.relatedLessons,['grade9-narrative']);
assert.equal(narrativeQuizMeta.kind,'practice');
assert.equal(narrativeQuizMeta.examFormat,'topic');
const narrative=JSON.parse(read(narrativeMeta.file));
assert.equal(narrative.id,'grade9-narrative','The stable lesson ID must be preserved');
assert.equal(narrative.objectives.length,5,'The five narrative-reading objectives must remain explicit');
assert.deepEqual(narrative.assessments,['grade9-narrative-practice']);
assert.equal(narrative.blocks[0].type,'definition');
assert.equal(narrative.blocks.at(-1).type,'vocabulary');
const narrativeGuide=narrative.blocks.find(b=>b.type==='scaffold');
assert(narrativeGuide&&narrativeGuide.modelEnglish&&narrativeGuide.modelIndonesian);
assert.equal(narrativeGuide.steps.length,5);
assert.equal(new Set(narrativeGuide.steps.map(s=>s.phase)).size,4);
assert(narrativeGuide.steps.every(s=>s.title&&s.explanation&&s.english&&s.indonesian&&s.why));
assert(narrativeGuide.steps.every(s=>(!!s.check)===(!!s.checkAnswer)));
assert.equal(narrativeGuide.steps.filter(s=>s.check).length,3);
assert(narrative.blocks.some(b=>b.type==='table'));
assert(narrative.blocks.some(b=>b.type==='mistake'));
assert.equal(narrative.blocks.filter(b=>b.type==='self_check').length,1);
assert.equal(narrative.blocks.filter(b=>b.type==='checkpoint').length,1);
assert.equal(narrative.blocks.filter(b=>b.type==='reflection').length,1);
assert.equal(narrative.practice.length,3);
assert(narrative.practice.every(q=>q.translationId?.prompt&&q.translationId.choices?.length===q.choices.length));
const narrativeHtml=blocks(narrative.blocks);
assert.match(narrativeHtml,/Maya membawa sekotak benih kacang/);
assert.match(narrativeHtml,/Hilangnya kotak benih/);
assert.match(narrativeHtml,/class="lesson-translation"/);
const narrativeQuiz=JSON.parse(read(narrativeQuizMeta.file));
assert.equal(narrativeQuiz.id,'grade9-narrative-practice');
assert.equal(narrativeQuiz.questionCount,7);
assert.equal(narrativeQuiz.durationSeconds,420);
assert.equal(narrativeQuiz.passages.length,1);
assert.notEqual(narrativeQuiz.passages[0].text,narrativeGuide.modelEnglish,'The assessment must use an unfamiliar transfer story');
assert.deepEqual(narrativeQuiz.questions.map(q=>q.answer),[0,1,2,3,0,1,2]);
for(const q of narrativeQuiz.questions){
 assert(q.translationId?.prompt&&q.translationId.choices?.length===q.choices.length);
 assert(q.evidence&&narrativeQuiz.passages[0].text.includes(q.evidence),`Narrative evidence must be exact: ${q.id}`);
 assert(q.explanation&&q.explanation.length>40);
}
// All learner-controlled instructional text must remain safely escaped.
const adversarial=blocks([{type:'scaffold',intro:'Baca',steps:[{
 title:'<script>alert(1)</script>',explanation:'& observe',english:'<img src=x>',
 indonesian:'<b>terjemahan</b>',why:'<svg onload=alert(1)>',
 check:'<img src=x>?',checkAnswer:'<iframe src=x>'
 }]}]);
for(const fragment of ['&lt;script&gt;','&lt;img src=x&gt;','&lt;b&gt;','&lt;svg','&lt;iframe'])assert(adversarial.includes(fragment),`Unsafe or lost escaping: ${fragment}`);
assert.doesNotMatch(adversarial,/<(?:script|img|iframe|svg|b)(?:\s|>)/i);
// Scaffold headings and model notes are authored only when a lesson needs them.
const tailored=blocks([{type:'scaffold',title:'Menguji bukti',intro:'Baca kalimat berikut.',modelTitle:'Short model',modelEnglish:'A quiet garden stands near the hall.',modelIndonesian:'Taman yang tenang berada dekat aula.',modelNote:'Perhatikan kata yang menunjukkan lokasi.',steps:[{title:'Locate the place',explanation:'Cari nama tempat.',english:'A quiet garden stands near the hall.',indonesian:'Taman yang tenang berada dekat aula.',why:'The noun phrase names the place.'}]}]);
assert.match(tailored,/Menguji bukti/);
assert.match(tailored,/Perhatikan kata yang menunjukkan lokasi/);
const plain=blocks([{type:'scaffold',intro:'Baca contoh ini.',steps:[{title:'Observe',explanation:'Perhatikan kalimat.',english:'The gate is open.',indonesian:'Gerbang terbuka.',why:'Open describes the gate.'}]}]);
assert.match(plain,/Baca contoh ini/);
assert.doesNotMatch(plain,/Mulai dari dasar, pelan-pelan|langkah bertahap|Jika masih bingung/);
const untitledModel=blocks([{type:'scaffold',steps:[{title:'Observe',explanation:'Perhatikan kalimat.'}],modelEnglish:'A garden stands beside the hall.'}]);
assert.doesNotMatch(untitledModel,/<h3[^>]*>Teks model<\/h3>/,'An unauthored model heading must not be injected');
const phased=blocks([{type:'scaffold',intro:'Ikuti bagian yang relevan.',steps:[{title:'One',explanation:'First.',english:'A.',indonesian:'A.',why:'A.',phase:'Read'},{title:'Two',explanation:'Next.',english:'B.',indonesian:'B.',why:'B.',phase:'Read'},{title:'Three',explanation:'Then.',english:'C.',indonesian:'C.',why:'C.',phase:'Apply'}]}]);
assert.match(phased,/Read/);assert.match(phased,/Apply/);
assert.doesNotMatch(phased,/Tahap dibagi menjadi bagian kecil|2 langkah|Lanjutkan saat sudah memahami/);

// Grade 9 Lesson 3: report-text reading with an unfamiliar wildlife transfer passage.
const reportMeta=catalogue.resources.find(r=>r.id==='grade9-report-animals');
const reportQuizMeta=catalogue.resources.find(r=>r.id==='grade9-report-animals-practice');
assert(reportMeta&&reportQuizMeta,'Grade 9 Report Text lesson and independent practice must be registered');
assert.deepEqual(reportMeta.placements[0],{pathway:'school',grade:9});
assert.equal(reportMeta.order,300);
assert.equal(reportQuizMeta.type,'quiz');
assert.equal(reportQuizMeta.title,'Grade 9 Report Text Check: The Bali Myna');
assert.deepEqual(reportQuizMeta.placements[0],{pathway:'school',grade:9});
assert.deepEqual(reportQuizMeta.relatedLessons,['grade9-report-animals']);
assert.equal(reportQuizMeta.kind,'practice');
assert.equal(reportQuizMeta.examFormat,'topic');
const report=JSON.parse(read(reportMeta.file));
assert.equal(report.id,'grade9-report-animals','The stable report lesson ID must be preserved');
assert.equal(report.objectives.length,4);
assert.deepEqual(report.assessments,['grade9-report-animals-practice']);
assert.equal(report.blocks[0].type,'definition');
assert.equal(report.blocks.at(-1).type,'vocabulary','Bekal Kosakata must remain at the end');
const reportGuide=report.blocks.find(b=>b.type==='scaffold');
assert(reportGuide&&reportGuide.modelEnglish&&reportGuide.modelIndonesian);
assert.equal(reportGuide.steps.length,5);
assert.equal(new Set(reportGuide.steps.map(s=>s.phase)).size,4);
assert(reportGuide.steps.every(s=>s.title&&s.explanation&&s.english&&s.indonesian&&s.why));
assert(reportGuide.steps.every(s=>(!!s.check)===(!!s.checkAnswer)));
assert.equal(reportGuide.steps.filter(s=>s.check).length,3);
assert(report.blocks.some(b=>b.type==='table'));
assert(report.blocks.some(b=>b.type==='mistake'));
assert.equal(report.blocks.filter(b=>b.type==='self_check').length,1);
assert.equal(report.blocks.filter(b=>b.type==='checkpoint').length,1);
assert.equal(report.blocks.filter(b=>b.type==='reflection').length,1);
assert.equal(report.blocks.filter(b=>b.type==='example_group').flatMap(b=>b.items).length,2);
assert.equal(report.practice.length,3);
assert(report.practice.every(q=>q.translationId?.prompt&&q.translationId.choices?.length===q.choices.length));
const reportHtml=blocks(report.blocks);
assert.match(reportHtml,/Orangutan Sumatra adalah kera besar/);
assert.match(reportHtml,/mainly in the northern part of the island/);
assert.match(reportHtml,/class="lesson-translation"/);
const reportQuiz=JSON.parse(read(reportQuizMeta.file));
assert.equal(reportQuiz.id,'grade9-report-animals-practice');
assert.equal(reportQuiz.questionCount,7);
assert.equal(reportQuiz.durationSeconds,420);
assert.equal(reportQuiz.passages.length,1);
assert.notEqual(reportQuiz.passages[0].text,reportGuide.modelEnglish,'The assessment must use an unfamiliar transfer report');
assert.deepEqual(reportQuiz.questions.map(q=>q.answer),[0,3,1,2,1,3,2]);
for(const q of reportQuiz.questions){
 assert(q.translationId?.prompt&&q.translationId.choices?.length===q.choices.length);
 assert(q.evidence&&reportQuiz.passages[0].text.includes(q.evidence),`Report-text evidence must be exact: ${q.id}`);
 assert(q.explanation&&q.explanation.length>40);
}


// Grade 9 Lesson 7: noun groups as a reading skill, with an unfamiliar transfer passage.
const nounMeta=catalogue.resources.find(r=>r.id==='grade9-noun-groups');
const nounQuizMeta=catalogue.resources.find(r=>r.id==='grade9-noun-groups-practice');
assert(nounMeta&&nounQuizMeta,'Grade 9 Noun Groups lesson and independent practice must be registered');
assert.deepEqual(nounMeta.placements[0],{pathway:'school',grade:9});
assert.equal(nounMeta.order,340);
assert.deepEqual(nounMeta.prerequisites,['parts-of-speech']);
assert.deepEqual(nounMeta.relatedLessons,['grade9-noun-groups-practice','parts-of-speech']);
assert.equal(nounQuizMeta.type,'quiz');
assert.equal(nounQuizMeta.title,'Grade 9 Noun Groups Check: A New Reading Corner');
assert.deepEqual(nounQuizMeta.placements[0],{pathway:'school',grade:9});
assert.deepEqual(nounQuizMeta.relatedLessons,['grade9-noun-groups']);
assert.equal(nounQuizMeta.kind,'practice');
assert.equal(nounQuizMeta.examFormat,'topic');
const noun=JSON.parse(read(nounMeta.file));
assert.equal(noun.id,'grade9-noun-groups','The stable lesson ID must be preserved');
assert.equal(noun.objectives.length,5);
assert.deepEqual(noun.assessments,['grade9-noun-groups-practice']);
assert.equal(noun.blocks[0].type,'definition');
assert.equal(noun.blocks.at(-1).type,'vocabulary','Bekal Kosakata must remain at the end');
const nounGuide=noun.blocks.find(b=>b.type==='scaffold');
assert(nounGuide&&nounGuide.modelEnglish&&nounGuide.modelIndonesian);
assert.equal(nounGuide.steps.length,6);
assert.equal(new Set(nounGuide.steps.map(s=>s.phase)).size,4);
assert(nounGuide.steps.every(s=>s.title&&s.explanation&&s.english&&s.indonesian&&s.why));
assert(nounGuide.steps.every(s=>(!!s.check)===(!!s.checkAnswer)));
assert.equal(nounGuide.steps.filter(s=>s.check).length,2);
assert(noun.blocks.some(b=>b.type==='table'));
assert(noun.blocks.some(b=>b.type==='mistake'));
assert.equal(noun.blocks.filter(b=>b.type==='self_check').length,1);
assert.equal(noun.blocks.filter(b=>b.type==='checkpoint').length,1);
assert.equal(noun.blocks.filter(b=>b.type==='reflection').length,1);
assert.equal(noun.blocks.filter(b=>b.type==='example_group').flatMap(b=>b.items).length,10);
assert.equal(noun.practice.length,2);
assert(noun.practice.every(q=>q.translationId?.prompt&&q.translationId.choices?.length===q.choices.length));
const nounHtml=blocks(noun.blocks);
assert.match(nounHtml,/nomina inti/);
assert.match(nounHtml,/a small wooden clock with a round white face/);
assert.match(nounHtml,/Catatan itu menggunakan kelompok kata benda yang jelas/);
assert.match(nounHtml,/class="lesson-translation"/);
const nounQuiz=JSON.parse(read(nounQuizMeta.file));
assert.equal(nounQuiz.id,'grade9-noun-groups-practice');
assert.equal(nounQuiz.questionCount,7);
assert.equal(nounQuiz.durationSeconds,420);
assert.equal(nounQuiz.passages.length,1);
assert.notEqual(nounQuiz.passages[0].text,nounGuide.modelEnglish,'The assessment must use an unfamiliar transfer passage');
assert.deepEqual(nounQuiz.questions.map(q=>q.answer),[0,2,2,3,0,1,2]);
for(const q of nounQuiz.questions){
 assert(q.translationId?.prompt&&q.translationId.choices?.length===q.choices.length);
 assert(q.evidence&&nounQuiz.passages[0].text.includes(q.evidence),`Noun-group evidence must be exact: ${q.id}`);
 assert(q.explanation&&q.explanation.length>40);
}

console.log(`PASS V13-E1-R3 presentation: ${validated} lessons rendered, including all ${schoolChecked} core School lessons; scaffold headings, model notes and phases follow authored lesson data; no compulsory scaffold boilerplate; authored checks rendered only when present; translations and explanations remain accessible; HTML escaped.`);
