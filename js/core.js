import {t} from "./i18n.js";
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const params=new URLSearchParams(location.search);
export const link=(id,type='lesson')=>`${type==='lesson'?'lesson':'quiz'}.html?id=${encodeURIComponent(id)}`;
export function error(e){(document.querySelector('#content, #resources')||document.querySelector('main')).innerHTML=`<div class="error" role="alert"><h2>${t('errorTitle')}</h2><p>${esc(e.message)}</p><a href="index.html">${t('errorBack')}</a></div>`;}
export async function load(path){const r=await fetch(path);if(!r.ok)throw Error(`Missing content (${r.status}). Please check the catalog and deployed files.`);try{return await r.json()}catch{throw Error('Format JSON tidak valid. Periksa file materi.')}}
let catalog;
export async function getCatalog(){if(!catalog){catalog=await load('data/catalog.json');if(!Array.isArray(catalog.resources))throw Error('Katalog tidak valid: resources harus berupa daftar.');const ids=new Set;for(const r of catalog.resources){if(!r.id||ids.has(r.id)||!['lesson','quiz'].includes(r.type)||!/^data\/(lessons|quizzes)\/[a-zA-Z0-9_/-]+\.json$/.test(r.file))throw Error('Entri katalog tidak valid atau terduplikasi.');ids.add(r.id)}}return catalog}
export async function resource(id,type){const c=await getCatalog(),m=c.resources.find(r=>r.id===id);if(!m||m.type!==type)throw Error('Materi tidak ditemukan. Silakan pilih materi yang sudah terbit dari perpustakaan.');const d=await load(m.file);if(d.id!==m.id)throw Error('ID materi tidak sesuai dengan katalog.');if(type==='quiz')validateQuiz(d);else if(!Array.isArray(d.blocks))throw Error('Bagian isi pelajaran tidak ditemukan.');return {meta:m,data:d,catalog:c}}
export function validateQuiz(d){if(!Array.isArray(d.questions)||!d.questions.length||d.questionCount!==d.questions.length)throw Error('Jumlah soal tidak sesuai dengan daftar soal.');if(!Number.isFinite(d.durationSeconds)||d.durationSeconds<0)throw Error('Durasi kuis tidak valid.');const ids=new Set;for(const q of d.questions){if(!q.id||ids.has(q.id)||!q.prompt||!Array.isArray(q.choices)||q.choices.length<2||q.choices.some(v=>typeof v!=='string')||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.choices.length||!q.explanation)throw Error('Soal atau kunci jawaban tidak valid.');if(q.passageId&&!d.passages?.some(p=>p.id===q.passageId))throw Error('Soal mengacu pada teks bacaan yang tidak ditemukan.');ids.add(q.id)}}
export function score(questions,answers){const correct=questions.filter((q,i)=>answers[i]===q.answer).length;const unanswered=questions.filter((q,i)=>!Number.isInteger(answers[i])).length;return {correct,incorrect:questions.length-correct-unanswered,unanswered,total:questions.length,percentage:Math.round(correct/questions.length*100)}}
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
function lessonExampleCard(item,index){
  return `<li class="worked-example"><span class="example-index">Contoh ${index+1}</span>
    <p class="example-english" lang="en">${esc(item.english)}</p>
    <p class="example-id" lang="id"><span class="example-label">Arti:</span> ${esc(item.indonesian)}</p>
    <p class="example-reason" lang="id"><span class="example-label">Mengapa?</span> ${formatIdText(item.note)}</p></li>`;
}
function lessonBlock(b){switch(b.type){
 case 'heading':return `<h2 lang="id">${formatIdText(b.text)}</h2>`;
 case 'subheading':return `<h3 lang="id">${formatIdText(b.text)}</h3>`;
 case 'text':return `<p lang="id">${formatIdText(b.text)}</p>${b.idText?`<p class="bilingual" lang="id">${formatIdText(b.idText)}</p>`:''}`;
 case 'rule':return `<div class="rule" lang="id">${formatIdText(b.text)}</div>`;
 case 'example':return `<blockquote class="legacy-example"><span lang="en">${esc(b.text)}</span>${b.note?`<br><small lang="id">${formatIdText(b.note)}</small>`:''}</blockquote>`;
 case 'mistake':return `<div class="panel mistake-panel"><p class="bad" lang="en">✗ ${esc(b.incorrect)}</p><p class="good" lang="en">✓ ${esc(b.correct)}</p><p lang="id">${formatIdText(b.explanation)}</p></div>`;
 case 'table':return `<div class="tablewrap"><table><thead><tr>${b.headers.map(h=>`<th scope="col">${formatIdText(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(r=>`<tr>${r.map(c=>`<td>${formatIdText(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 case 'vocabulary':return `<section class="vocab-section" aria-label="Bekal kosakata"><h3 lang="id">${esc(b.title)}</h3><dl class="vocab-grid">${b.items.map(v=>`<div class="vocab-pair"><dt lang="en">${esc(v.english)}</dt><dd lang="id">${esc(v.indonesian)}</dd></div>`).join('')}</dl></section>`;
 case 'example_group':{
    const cards=`<ol class="worked-examples">${b.items.map(lessonExampleCard).join('')}</ol>`;
    return b.collapsed
      ? `<details class="more-examples"><summary lang="id">${esc(b.title)} · Buka ${b.items.length} contoh tambahan</summary>${cards}</details>`
      : `<section class="example-section"><h3 lang="id">${esc(b.title)}</h3>${cards}</section>`;
 }
 case 'breakdown':return `<section class="sentence-breakdown"><h3 lang="id">Bedah kalimat, langkah demi langkah</h3><p class="example-english" lang="en">${esc(b.sentence)}</p><dl class="breakdown-grid">${b.parts.map(p=>`<div><dt lang="en">${esc(p.english)}</dt><dd lang="id">${formatIdText(p.meaning)}</dd></div>`).join('')}</dl></section>`;
 case 'summary':return `<aside class="lesson-summary"><h3 lang="id">${esc(b.title)}</h3><ul lang="id">${b.items.map(item=>`<li>${formatIdText(item)}</li>`).join('')}</ul></aside>`;
 default:throw Error(`Jenis blok pelajaran tidak didukung: ${b.type}`);
}}
export function blocks(items){return items.map(lessonBlock).join('')}
