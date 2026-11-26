import {getCatalog,esc,link,progress,quizDrafts,resourceRow,icon,byResourceTitle,compareTitles} from './core.js';
import {t,initI18n,onLanguageChange} from './i18n.js';
initI18n();
// Planned sequence from the 2026-10-26 blueprint. V13-C5 publishes all ten modules; V13-D adds three full practice simulations.
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
const supportIds=['sentence-structure','reading-bridge','reading-strategies','grade12-critical-reading','grade11-exposition-evidence','grade12-compare-arguments','grade10-descriptive','grade9-narrative'];
const modules=document.querySelector('#tka-module-list');
const target=document.querySelector('#tka-support-list');
const newLessons=document.querySelector('#tka-new-lessons');
const newQuizzes=document.querySelector('#tka-new-quizzes');
const newMocks=document.querySelector('#tka-mock-list');
const mockIds=['tka-mock-a','tka-mock-b','tka-mock-c'];
let tkaMocks=[];
const published={
 'TKA-01':['tka-reading-foundations','tka-reading-foundations-practice'],
 'TKA-02':['tka-explicit-information','tka-explicit-information-practice'],
 'TKA-03':['tka-classify-outline-summarize-synthesize','tka-classify-outline-summarize-synthesize-practice'],
 'TKA-04':['tka-context-vocabulary-reference-connectors','tka-context-vocabulary-reference-connectors-practice'],
 'TKA-05':['tka-implied-ideas-audience-purpose-message','tka-implied-ideas-audience-purpose-message-practice'],
 'TKA-06':['tka-inference-cause-character-prediction','tka-inference-cause-character-prediction-practice'],
 'TKA-07':['tka-evaluating-facts-opinions-evidence','tka-evaluating-facts-opinions-evidence-practice'],
 'TKA-08':['tka-narrative-appreciation','tka-narrative-appreciation-practice'],
 'TKA-09':['tka-five-text-genres','tka-five-text-genres-practice'],
 'TKA-10':['tka-question-formats-independent-practice','tka-question-formats-independent-practice-practice'],
};
let items=[],tkaLessons=[],tkaQuizzes=[];
function draw(){
 const p=progress.read(),drafts=quizDrafts();
 const card=r=>resourceRow(r,p,drafts,'tka',t('difficulty'+r.difficulty));
 const groups=[...new Set(tkaModules.map(m=>m[3]))].sort((a,b)=>compareTitles(t(a),t(b)));
 modules.innerHTML=groups.map(key=>`<section class="tka-module-group"><h3>${esc(t(key))}</h3><ol class="tka-module-grid">${tkaModules.filter(m=>m[3]===key).sort((a,b)=>compareTitles(a[1],b[1])).map(([id,title])=>{
  const paths=published[id];
  const lesson=paths?tkaLessons.find(x=>x.id===paths[0]):null;
  const quiz=paths?tkaQuizzes.find(x=>x.id===paths[1]):null;
  return `<li class="tka-module"><span class="tka-module-code">${esc(id)}</span><strong>${esc(title)}</strong>${lesson&&quiz?`<div class="tka-available"><a href="${link(lesson.id,'lesson')}">${esc(t('tkaOpenLesson'))} ${icon('arrow')}</a><a href="${link(quiz.id,'quiz')}">${esc(t('tkaOpenQuiz'))} ${icon('arrow')}</a></div><span class="tka-released">✓ ${esc(t('tkaPublished'))}</span>`:`<span class="tka-pending">${esc(t('tkaComing'))}</span>`}</li>`;
 }).join('')}</ol></section>`).join('');
 document.querySelector('#tka-support-progress').textContent=t('tkaSupportCount',{done:items.filter(r=>p.lessons?.[r.id]).length,total:items.length});
 target.innerHTML=items.length?`<ul class="simple-resources tka-support-items">${items.map(card).join('')}</ul>`:`<p class="notice" role="alert">${esc(t('tkaEmpty'))}</p>`;
 newLessons.innerHTML=`<ul class="simple-resources tka-support-items">${tkaLessons.map(card).join('')}</ul>`;
 newQuizzes.innerHTML=`<ul class="simple-resources tka-support-items">${tkaQuizzes.map(card).join('')}</ul>`;
 newMocks.innerHTML=tkaMocks.length?`<ul class="simple-resources tka-support-items">${tkaMocks.map(card).join('')}</ul>`:`<p class="notice">${esc(t('tkaMockEmpty'))}</p>`;
}
try{
 const c=await getCatalog();
 if(!c.pathways.some(p=>p.id==='tka'))throw Error('TKA pathway is not registered');
 items=supportIds.map(id=>c.resources.find(r=>r.id===id&&r.type==='lesson'&&r.placements.some(p=>p.pathway==='tka'))).filter(Boolean).sort(byResourceTitle);
 tkaLessons=Object.values(published).map(([id])=>c.resources.find(r=>r.id===id&&r.type==='lesson'&&r.placements.some(p=>p.pathway==='tka'))).filter(Boolean).sort(byResourceTitle);
 tkaQuizzes=Object.values(published).map(([,id])=>c.resources.find(r=>r.id===id&&r.type==='quiz'&&r.placements.some(p=>p.pathway==='tka'))).filter(Boolean).sort(byResourceTitle);
 tkaMocks=mockIds.map(id=>c.resources.find(r=>r.id===id&&r.type==='quiz'&&r.placements.some(p=>p.pathway==='tka'))).filter(Boolean).sort(byResourceTitle);
 draw();onLanguageChange(draw);
 function revealGroup(){
  const group=document.getElementById(location.hash.slice(1));
  if(group?.matches('details.tka-directory'))group.open=true;
 }
 revealGroup();
 addEventListener('hashchange',revealGroup);
 document.querySelector('.pathway-hero-links').addEventListener('click',event=>{
  const anchor=event.target.closest('a');
  const group=anchor && document.getElementById(anchor.hash.slice(1));
  if(group?.matches('details.tka-directory'))group.open=true;
 });
}catch(e){target.innerHTML=`<p class="error" role="alert">${esc(e.message)}</p>`;newLessons.innerHTML=`<p class="error" role="alert">${esc(e.message)}</p>`;newQuizzes.innerHTML='';newMocks.innerHTML='';}
