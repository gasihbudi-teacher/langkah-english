import {t} from "./i18n.js";
import {validateQuestion,score as scoreResponses} from "./question-types.mjs";
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const params=new URLSearchParams(location.search);
export const link=(id,type='lesson')=>`${type==='lesson'?'lesson':'quiz'}.html?id=${encodeURIComponent(id)}`;
export function error(e){(document.querySelector('#content, #resources')||document.querySelector('main')).innerHTML=`<div class="error" role="alert"><h2>${t('errorTitle')}</h2><p>${esc(e.message)}</p><a href="index.html">${t('errorBack')}</a></div>`;}
export async function load(path){const r=await fetch(path);if(!r.ok)throw Error(`Missing content (${r.status}). Please check the catalog and deployed files.`);try{return await r.json()}catch{throw Error('Format JSON tidak valid. Periksa file materi.')}}
let catalog;
export async function getCatalog(){if(!catalog){catalog=await load('data/catalog.json');if(!Array.isArray(catalog.resources))throw Error('Katalog tidak valid: resources harus berupa daftar.');const ids=new Set;for(const r of catalog.resources){if(!r.id||ids.has(r.id)||!['lesson','quiz'].includes(r.type)||!/^data\/(lessons|quizzes)\/[a-zA-Z0-9_/-]+\.json$/.test(r.file))throw Error('Entri katalog tidak valid atau terduplikasi.');ids.add(r.id)}}return catalog}
export async function resource(id,type){const c=await getCatalog(),m=c.resources.find(r=>r.id===id);if(!m||m.type!==type)throw Error('Materi tidak ditemukan. Silakan pilih materi yang sudah terbit dari perpustakaan.');const d=await load(m.file);if(d.id!==m.id)throw Error('ID materi tidak sesuai dengan katalog.');if(type==='quiz')validateQuiz(d);else if(!Array.isArray(d.blocks))throw Error('Bagian isi pelajaran tidak ditemukan.');return {meta:m,data:d,catalog:c}}
export function validateQuiz(d){
 if(!Array.isArray(d.questions)||!d.questions.length||d.questionCount!==d.questions.length)throw Error('Jumlah soal tidak sesuai dengan daftar soal.');
 if(!Number.isInteger(d.durationSeconds)||d.durationSeconds<0)throw Error('Durasi kuis tidak valid.');
 const ids=new Set(),passageIds=new Set((d.passages||[]).map(p=>p.id));
 for(const q of d.questions){
  validateQuestion(q);
  if(ids.has(q.id))throw Error('ID soal terduplikasi.');
  if(q.passageId&&!passageIds.has(q.passageId))throw Error('Soal mengacu pada teks bacaan yang tidak ditemukan.');
  ids.add(q.id);
 }
}
export const score=scoreResponses;
const key='langkah.progress.v1';let memory;
export const progress={read(){try{return JSON.parse(localStorage.getItem(key))||{lessons:{},attempts:[],activity:[]}}catch{return memory||{lessons:{},attempts:[],activity:[]}}},write(v){memory=v;try{localStorage.setItem(key,JSON.stringify(v))}catch{const n=document.createElement('p');n.className='notice';n.textContent=t('storageWarning');document.querySelector('main').prepend(n)}},complete(id,title){const p=this.read();p.lessons??={};p.activity??=[];p.lessons[id]=Date.now();p.activity.unshift({title,at:Date.now(),kind:'Lesson completed'});p.activity=p.activity.slice(0,30);this.write(p)},save(attempt){const p=this.read();p.attempts??=[];p.activity??=[];p.attempts.unshift(attempt);p.attempts=p.attempts.slice(0,100);p.activity.unshift({title:attempt.title,at:Date.now(),kind:`Examination: ${attempt.result.percentage}%`});p.activity=p.activity.slice(0,30);this.write(p)}};
export const time=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
// V6: explicit [[English term]] syntax inside Indonesian teaching prose.
// Every character from authored JSON is HTML-escaped. Only our own span markup is inserted.
export function formatIdText(source){
  return String(source??'').split(/(\[\[[^\[\]\n]{1,120}\]\])/g).map(part=>
    part.startsWith('[[')&&part.endsWith(']]')
      ? `<span class="english-term" lang="en">${esc(part.slice(2,-2))}</span>`
      : esc(part)).join('');
}
// R4 language-of-instruction rule: Indonesian teaching support is visible by default.
// English remains the target language in examples and passages; Indonesian meaning is paired directly below it.
function pairedTranslation(text){
 if(!text)return '';
 return `<p class="lesson-translation" lang="id"><span class="translation-label">${t('modelTranslationLabel')}:</span> ${formatIdText(text)}</p>`;
}
function lessonExampleCard(item,index){
 return `<li class="worked-example"><span class="example-index">Contoh ${index+1}</span>
   <p class="example-english" lang="en">${esc(item.english)}</p>
   ${pairedTranslation(item.indonesian)}
   <p class="example-reason" lang="id">${formatIdText(item.note)}</p></li>`;
}
/** Each step teaches its own skill. No automatic translation/reason/check headings. */
function scaffoldCard(step,i){
 const sample=step.english?`<div class="scaffold-sample"><p lang="en" class="example-english">${esc(step.english)}</p>${pairedTranslation(step.indonesian)}${step.why?`<p class="scaffold-insight" lang="id">${formatIdText(step.why)}</p>`:''}</div>`:'';
 const check=step.check?`<div class="scaffold-review"><p class="scaffold-question" lang="id">${formatIdText(step.check)}</p><details><summary lang="id">Periksa jawaban</summary><p lang="id">${formatIdText(step.checkAnswer)}</p></details></div>`:'';
 return `<section class="scaffold-step" id="belajar-langkah-${i+1}"><h3 lang="id"><span class="scaffold-count">${i+1}</span>${esc(step.title)}</h3><p lang="id">${formatIdText(step.explanation)}</p>${sample}${check}</section>`;
}
function phasedScaffold(b){
 if(!b.steps.some(s=>s.phase))return b.steps.map(scaffoldCard).join('');
 const groups=[];
 for(const [i,step] of b.steps.entries()){
  let g=groups.at(-1);
  if(!g||g.label!==step.phase){g={label:step.phase,items:[]};groups.push(g);}
  g.items.push([step,i]);
 }
 return `<nav class="scaffold-phase-links" aria-label="${t('learningSections')}">${groups.map((g,i)=>`<a href="#scaffold-phase-${i+1}">${esc(g.label)}</a>`).join('')}</nav>${groups.map((g,i)=>`<details class="scaffold-phase" id="scaffold-phase-${i+1}" open><summary lang="id">${esc(g.label)}</summary>${g.items.map(([step,index])=>scaffoldCard(step,index)).join('')}</details>`).join('')}`;
}
function scaffoldModel(b){return b.modelEnglish?`<section class="scaffold-model" aria-label="${t('modelPassage')}">${b.modelTitle?`<h3 lang="id">${formatIdText(b.modelTitle)}</h3>`:''}<p lang="en" class="example-english">${esc(b.modelEnglish)}</p>${pairedTranslation(b.modelIndonesian)}${b.modelImage?`<figure class="scaffold-graphic"><img src="${esc(b.modelImage)}" alt="${esc(b.modelImageAlt||t('visualSupport'))}" loading="lazy"></figure>`:''}${b.modelNote?`<p class="scaffold-model-note" lang="id">${formatIdText(b.modelNote)}</p>`:''}</section>`:''}
function lessonBlock(b,context){switch(b.type){
 case 'definition':return `<section class="concept-definition" aria-label="Definisi materi"><h2 lang="id">${formatIdText(b.title)}</h2><p lang="id">${formatIdText(b.text)}</p></section>`;
 case 'synthesis':return `<section class="concept-synthesis"><h2 lang="id">${formatIdText(b.title)}</h2><p lang="id">${formatIdText(b.text)}</p></section>`;
 case 'self_check':return `<section class="writing-self-check"><h3 lang="id">${esc(b.title)}</h3><p lang="id">${formatIdText(b.prompt)}</p><textarea rows="3" aria-label="${t('answerPractice')}" placeholder="Tulis jawaban bahasa Inggris di sini. Jawaban tidak disimpan atau dinilai otomatis."></textarea><details><summary lang="id">Lihat contoh jawaban dan hal yang perlu diperiksa</summary><p class="example-english" lang="en">${esc(b.model)}</p>${pairedTranslation(b.modelTranslation)}<p lang="id"><strong>Yang perlu diperiksa:</strong> ${formatIdText(b.criteria)}</p></details></section>`;
 case 'scaffold':{
  const heading=b.title?`<div class="scaffold-heading"><h2 lang="id">${formatIdText(b.title)}</h2>${b.intro?`<p lang="id">${formatIdText(b.intro)}</p>`:''}</div>`:`${b.intro?`<p class="scaffold-intro" lang="id">${formatIdText(b.intro)}</p>`:''}`;
  return `<section class="scaffold-guide" aria-label="${esc(b.title||t('guidedLearning'))}">${heading}${b.modelPosition==='after'?'':scaffoldModel(b)}${phasedScaffold(b)}${b.modelPosition==='after'?scaffoldModel(b):''}</section>`;
 }
 case 'reference':return `<details class="lesson-reference"><summary lang="id">Penjelasan lebih lengkap, aturan, dan kesalahan umum (opsional)</summary><div class="reference-content">${b.blocks.map(item=>lessonBlock(item,context)).join('')}</div></details>`;
 case 'checkpoint':return `<section class="guided-checkpoint" data-guided-check="${esc(b.id)}"><h3 lang="id">Latihan terarah · tanpa nilai</h3><p class="checkpoint-instruction" lang="id">${t('checkpointInstruction')}</p><p class="checkpoint-prompt-id" lang="id">${formatIdText(b.translation)}</p><details class="translation-detail"><summary lang="id">${t('checkpointEnglishVersion')}</summary><p class="checkpoint-prompt" lang="en">${esc(b.prompt)}</p></details><div class="checkpoint-options" role="group" aria-label="${t('questionGroup')}">${b.choices.map((v,i)=>`<button type="button" data-check-choice="${i}" aria-pressed="false">${esc(v)}</button>`).join('')}</div><details class="translation-detail checkpoint-choice-help"><summary lang="id">${t('checkpointChoiceHelp')}</summary><ol type="A" lang="id">${(b.translationChoices||[]).map(x=>`<li>${formatIdText(x)}</li>`).join('')}</ol></details><p class="checkpoint-result" role="status" aria-live="polite" hidden></p><button type="button" class="checkpoint-hint" data-check-hint aria-expanded="false">Butuh petunjuk?</button><p class="checkpoint-hint-text" hidden lang="id">${formatIdText(b.hint)}</p><template class="checkpoint-solution">${formatIdText(b.explanation)}</template><span data-check-answer="${b.answer}" hidden></span></section>`;
 case 'reflection':return `<section class="reflection"><h3 lang="id">Berhenti sejenak dan bandingkan</h3><p class="reflection-question" lang="id">${formatIdText(b.translation)}</p><details><summary lang="id">${t('reflectionEnglishVersion')}</summary><p lang="en">${esc(b.prompt)}</p></details><details><summary lang="id">Lihat panduan setelah mencoba sendiri</summary><p lang="id">${formatIdText(b.answer)}</p></details></section>`;
 case 'heading':return `<h2 lang="id">${formatIdText(b.text)}</h2>`;
 case 'subheading':return `<h3 lang="id">${formatIdText(b.text)}</h3>`;
 case 'text':return `<p lang="id">${formatIdText(b.text)}</p>${b.idText?`<p class="bilingual" lang="id">${formatIdText(b.idText)}</p>`:''}`;
 case 'rule':return `<div class="rule" lang="id">${formatIdText(b.text)}</div>`;
 case 'example':return `<blockquote class="legacy-example"><span lang="en">${esc(b.text)}</span>${b.note?`<br><small lang="id">${formatIdText(b.note)}</small>`:''}</blockquote>`;
 case 'mistake':return `<div class="panel mistake-panel"><p class="bad" lang="en">✗ ${esc(b.incorrect)}</p><p class="good" lang="en">✓ ${esc(b.correct)}</p><p lang="id">${formatIdText(b.explanation)}</p></div>`;
 case 'table':return `<div class="tablewrap"><table><thead><tr>${b.headers.map(h=>`<th scope="col" lang="id">${formatIdText(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(r=>`<tr>${r.map(c=>`<td>${formatIdText(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 case 'vocabulary':return `<section class="vocab-section" aria-label="Bekal kosakata"><h3 lang="id">${esc(b.title)}</h3><dl class="vocab-grid">${b.items.map(v=>`<div class="vocab-pair"><dt lang="en">${esc(v.english)}</dt><dd lang="id">${formatIdText(v.indonesian)}</dd></div>`).join('')}</dl></section>`;
 case 'example_group':{
    const cards=`<ol class="worked-examples">${b.items.map(item=>lessonExampleCard(item,context.counter++)).join('')}</ol>`;
    return b.collapsed
      ? `<details class="more-examples"><summary lang="id">${esc(b.title)} · Buka ${b.items.length} contoh tambahan</summary>${cards}</details>`
      : `<section class="example-section"><h3 lang="id">${esc(b.title)}</h3>${cards}</section>`;
 }
 case 'breakdown':return `<section class="sentence-breakdown"><h3 lang="id">Bedah kalimat, langkah demi langkah</h3><p class="example-english" lang="en">${esc(b.sentence)}</p><dl class="breakdown-grid">${b.parts.map(p=>`<div><dt lang="en">${esc(p.english)}</dt><dd lang="id">${formatIdText(p.meaning)}</dd></div>`).join('')}</dl></section>`;
 case 'summary':return `<aside class="lesson-summary"><h3 lang="id">${esc(b.title)}</h3><ul lang="id">${b.items.map(item=>`<li>${formatIdText(item)}</li>`).join('')}</ul></aside>`;
 default:throw Error(`Jenis blok pelajaran tidak didukung: ${b.type}`);
}}
export function blocks(items){const context={counter:0};return items.map(item=>lessonBlock(item,context)).join('')}
