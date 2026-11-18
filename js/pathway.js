import {getCatalog,esc,progress,quizDrafts,resourceRow} from './core.js';
import {t,initI18n,onLanguageChange} from './i18n.js';
initI18n();
const pathway=document.body.dataset.pathway;
const target=document.querySelector('#pathway-resources');
const sorted=(a,b)=>(a.order??1000)-(b.order??1000)||a.title.localeCompare(b.title,'id');
try{
 const c=await getCatalog(),p=progress.read();
 const resources=c.resources.filter(r=>r.placements.some(x=>x.pathway===pathway));
 const drafts=quizDrafts();
 const card=r=>resourceRow(r,p,drafts,pathway,t('difficulty'+r.difficulty));
 let firstDraw=true;
 function group(id,title,items){return `<details class="topic-fold" id="${esc(id)}"><summary><span class="topic-title">${esc(title)}</span><span class="badge">${items.length} ${t('resources')}</span></summary><div class="topic-fold-body">${items.length?`<ul class="simple-resources">${[...items].sort(sorted).map(card).join('')}</ul>`:`<p>${t('gradeEmpty')}</p>`}</div></details>`}
 function draw(){
  const previousOpen=new Set([...target.querySelectorAll('details[open]')].map(d=>d.id));
  document.querySelector('[data-pathway-title]').textContent=t(({grammar:'pathGrammar',utbk:'pathUtbk',school:'pathSchool'})[pathway]);
  document.querySelector('[data-pathway-description]').textContent=t(({grammar:'pathwayIntroGrammar',utbk:'pathwayIntroUtbk',school:'pathwayIntroSchool'})[pathway]);
  let html='';
  if(pathway==='grammar'){
   for(const level of ['Beginner','Intermediate','Advanced']){
    const id=level.toLowerCase(),label=t('level'+level); const here=resources.filter(r=>r.difficulty===level);
    html+=`<h2 class="topic-divider" id="${id}">${esc(label)}</h2>`;
    html+=group(id+'-materi',label+' · '+t('groupLessons'),here.filter(r=>r.type==='lesson'));
    html+=group(id+'-latihan',label+' · '+t('groupPractice'),here.filter(r=>r.type==='quiz'));
   }
  }else if(pathway==='school'){
   for(const grade of [9,10,11,12]){
    const here=resources.filter(r=>r.placements.some(p=>p.pathway==='school'&&p.grade===grade));
    html+=`<h2 class="topic-divider" id="grade-${grade}">${t('grade')} ${grade}</h2>`;
    html+=group('grade-'+grade+'-materi',t('grade')+' '+grade+' · '+t('groupLessons'),here.filter(r=>r.type==='lesson'));
    html+=group('grade-'+grade+'-latihan',t('grade')+' '+grade+' · '+t('groupPractice'),here.filter(r=>r.type==='quiz'));
   }
  }else{
   const lessons=resources.filter(r=>r.type==='lesson');const quizzes=resources.filter(r=>r.type==='quiz');
   html+=group('utbk-lessons','UTBK · '+t('groupLessons'),lessons);
   html+=group('utbk-practice','UTBK · '+t('groupPractice'),quizzes.filter(r=>r.examFormat!=='full'));
   html+=group('utbk-mocks','UTBK · '+t('groupMocks'),quizzes.filter(r=>r.examFormat==='full'));
  }
  target.innerHTML=html;
  const firstGroup=pathway==='grammar'?'beginner-materi':pathway==='school'?'grade-9-materi':'utbk-lessons';
  if(firstDraw && !location.hash){const first=document.getElementById(firstGroup);if(first)first.open=true;}
  firstDraw=false;
  const relevant=resources.filter(r=>r.type==='lesson');
  const completed=relevant.filter(r=>p.lessons?.[r.id]).length;
  const hero=document.querySelector('.pathway-hero');
  let summary=hero.querySelector('.pathway-progress-summary');
  if(!summary){summary=document.createElement('div');summary.className='pathway-progress-summary';hero.append(summary);}
  summary.innerHTML=`<span>${t('pathwayProgress',{done:completed,total:relevant.length})}</span><span class="pathway-progress-track" aria-hidden="true"><span style="width:${relevant.length?Math.round(100*completed/relevant.length):0}%"></span></span>`;
  for(const id of previousOpen){const section=document.getElementById(id);if(section?.tagName==='DETAILS')section.open=true;}
  openForHash(false);
 }
 function openForHash(shouldScroll=true){
  const id=decodeURIComponent(location.hash.slice(1));if(!id)return;
  let node=document.getElementById(id);
  if(node && node.tagName!=='DETAILS'){
   const first=document.getElementById(id+'-materi');if(first)first.open=true;
  }else if(node?.tagName==='DETAILS')node.open=true;
  if(shouldScroll)requestAnimationFrame(()=>node?.scrollIntoView({block:'start'}));
 }
 draw();onLanguageChange(draw);
 document.querySelector('.pathway-hero-links').addEventListener('click',event=>{
  if(event.target.closest('a')?.hash===location.hash)openForHash();
 });
 requestAnimationFrame(()=>openForHash());addEventListener('hashchange',()=>openForHash());
 // Preserve older URL parameters and #grade-X / #beginner anchors.
 const legacy=new URLSearchParams(location.search);
 if(!location.hash){const section=pathway==='school'&&/^(9|10|11|12)$/.test(legacy.get('grade')||'')?'grade-'+legacy.get('grade'):pathway==='grammar'&&['beginner','intermediate','advanced'].includes((legacy.get('difficulty')||'').toLowerCase())?legacy.get('difficulty').toLowerCase():null;if(section)location.replace(location.pathname+'#'+section)}
}catch(e){target.innerHTML=`<div class="error" role="alert"><h2>${t('errorTitle')}</h2><p>${esc(e.message)}</p></div>`}
