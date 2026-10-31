import {getCatalog,esc,link,progress} from './core.js';
import {t,initI18n,onLanguageChange} from './i18n.js';
initI18n();
// Planned sequence from the 2026-10-26 blueprint. V13-C2 publishes TKA-01 through TKA-04.
export const tkaModules=[
 ['TKA-01','Jembatan TKA: Dari Kalimat ke Bacaan',12,'tkaFoundations'],
 ['TKA-02','Menemukan Informasi Tersurat dan Parafrasa',9,'tkaTextual'],
 ['TKA-03','Mengelompokkan, Membuat Kerangka, Meringkas, dan Mensintesis',11,'tkaTextual'],
 ['TKA-04','Kosakata, Kata Rujukan, dan Penghubung dalam Konteks',10,'tkaTextual'],
 ['TKA-05','Menyimpulkan Ide Utama Tersirat, Tujuan, Pembaca, dan Pesan',11,'tkaInferential'],
 ['TKA-06','Inferensi Hubungan, Sebab–Akibat, Karakter, dan Prediksi',14,'tkaInferential'],
 ['TKA-07','Mengevaluasi Fakta, Opini, dan Kecukupan Bukti',12,'tkaEvaluation'],
 ['TKA-08','Mengapresiasi Tokoh, Makna, dan Pilihan Bahasa',10,'tkaEvaluation'],
 ['TKA-09','Membaca Lima Jenis Teks TKA',14,'tkaTransfer'],
 ['TKA-10','Memahami Bentuk Soal dan Berlatih Mandiri',9,'tkaTransfer'],
];
const order=['sentence-structure','reading-bridge','reading-strategies','grade12-critical-reading','grade11-exposition-evidence','grade12-compare-arguments','grade10-descriptive','grade9-narrative'];
const modules=document.querySelector('#tka-module-list');
const target=document.querySelector('#tka-support-list');
const newLessons=document.querySelector('#tka-new-lessons');
const newQuizzes=document.querySelector('#tka-new-quizzes');
const published={
 'TKA-01':['tka-reading-foundations','tka-reading-foundations-practice'],
 'TKA-02':['tka-explicit-information','tka-explicit-information-practice'],
 'TKA-03':['tka-classify-outline-summarize-synthesize','tka-classify-outline-summarize-synthesize-practice'],
 'TKA-04':['tka-context-vocabulary-reference-connectors','tka-context-vocabulary-reference-connectors-practice'],
};
let items=[],tkaLessons=[],tkaQuizzes=[];
const card=(r,type,done=false)=>`<li class="simple-resource"><div><h3><a href="${link(r.id,type)}">${esc(r.title)}</a></h3><p>${esc(r.description)}</p><span class="resource-meta"><small>${esc(r.difficulty)}</small>${done?`<span class="badge badge-mint">✓ ${t('completed')}</span>`:''}</span></div><a class="simple-arrow" href="${link(r.id,type)}" aria-label="${esc(t('tkaStudy'))}: ${esc(r.title)}">↗</a></li>`;
function draw(){
 const p=progress.read();
 const groups=[...new Set(tkaModules.map(m=>m[3]))];
 modules.innerHTML=groups.map(key=>`<section class="tka-module-group"><h3>${esc(t(key))}</h3><ol class="tka-module-grid">${tkaModules.filter(m=>m[3]===key).map(([id,title,steps])=>{
  const paths=published[id];
  const lesson=paths?tkaLessons.find(x=>x.id===paths[0]):null;
  const quiz=paths?tkaQuizzes.find(x=>x.id===paths[1]):null;
  return `<li class="tka-module"><span class="tka-module-code">${esc(id)}</span><strong>${esc(title)}</strong><small>${esc(t('tkaSteps',{n:steps}))}</small>${lesson&&quiz?`<div class="tka-available"><a href="${link(lesson.id,'lesson')}">${esc(t('tkaOpenLesson'))} ↗</a><a href="${link(quiz.id,'quiz')}">${esc(t('tkaOpenQuiz'))} ↗</a></div><span class="tka-released">✓ ${esc(t('tkaPublished'))}</span>`:`<span class="tka-pending">${esc(t('tkaComing'))}</span>`}</li>`;
 }).join('')}</ol></section>`).join('');
 document.querySelector('#tka-support-progress').textContent=t('tkaSupportCount',{done:items.filter(r=>p.lessons?.[r.id]).length,total:items.length});
 target.innerHTML=items.length?`<ul class="simple-resources tka-support-items">${items.map(r=>card(r,'lesson',!!p.lessons?.[r.id])).join('')}</ul>`:`<p class="notice" role="alert">${esc(t('tkaEmpty'))}</p>`;
 newLessons.innerHTML=`<ul class="simple-resources tka-support-items">${tkaLessons.map(r=>card(r,'lesson',!!p.lessons?.[r.id])).join('')}</ul>`;
 newQuizzes.innerHTML=`<ul class="simple-resources tka-support-items">${tkaQuizzes.map(r=>card(r,'quiz')).join('')}</ul>`;
}
try{
 const c=await getCatalog();
 if(!c.pathways.some(p=>p.id==='tka'))throw Error('TKA pathway is not registered');
 items=order.map(id=>c.resources.find(r=>r.id===id&&r.type==='lesson'&&r.placements.some(p=>p.pathway==='tka'))).filter(Boolean);
 tkaLessons=Object.values(published).map(([id])=>c.resources.find(r=>r.id===id&&r.type==='lesson'&&r.placements.some(p=>p.pathway==='tka'))).filter(Boolean);
 tkaQuizzes=Object.values(published).map(([,id])=>c.resources.find(r=>r.id===id&&r.type==='quiz'&&r.placements.some(p=>p.pathway==='tka'))).filter(Boolean);
 draw();onLanguageChange(draw);
}catch(e){target.innerHTML=`<p class="error" role="alert">${esc(e.message)}</p>`;newLessons.innerHTML=`<p class="error" role="alert">${esc(e.message)}</p>`;newQuizzes.innerHTML='';}
