import {getCatalog,esc,link,progress} from './core.js';
import {t,initI18n,onLanguageChange} from './i18n.js';
initI18n();
const pathway=document.body.dataset.pathway;
const target=document.querySelector('#pathway-resources');
const sorted=(a,b)=>(a.order??1000)-(b.order??1000)||a.title.localeCompare(b.title,'id');
try{
 const c=await getCatalog(),p=progress.read();
 const resources=c.resources.filter(r=>r.placements.some(x=>x.pathway===pathway));
 function card(r){return `<li class="simple-resource"><div><h3><a href="${link(r.id,r.type)}">${esc(r.title)}</a></h3><p>${esc(r.description)}</p><span class="resource-meta"><small>${esc(r.difficulty)} · ${t(r.type==='lesson'?'studyMaterials':r.kind==='test'?'topicTests':'practiceExercises')}</small>${p.lessons?.[r.id]?`<span class="badge badge-mint">✓ ${t('completed')}</span>`:''}</span></div><a class="simple-arrow" href="${link(r.id,r.type)}" aria-label="${t(r.type==='lesson'?'openLesson':'openQuiz')}: ${esc(r.title)}">↗</a></li>`}
 function group(id,title,items){return `<section class="topic-section" id="${esc(id)}"><div class="topic-section-head"><h2>${esc(title)}</h2><span class="badge">${items.length} ${t('resources')}</span></div>${items.length?`<ul class="simple-resources">${items.sort(sorted).map(card).join('')}</ul>`:`<p>${t('gradeEmpty')}</p>`}</section>`}
 function draw(){document.querySelector('[data-pathway-title]').textContent=t(({grammar:'pathGrammar',utbk:'pathUtbk',school:'pathSchool'})[pathway]);document.querySelector('[data-pathway-description]').textContent=t(({grammar:'pathwayIntroGrammar',utbk:'pathwayIntroUtbk',school:'pathwayIntroSchool'})[pathway]);let html='';
 if(pathway==='grammar'){
  for(const level of ['Beginner','Intermediate','Advanced'])html+=group(level.toLowerCase(),level,resources.filter(r=>r.type==='lesson'&&r.difficulty===level));
  html+=group('grammar-quizzes',t('topicTests'),resources.filter(r=>r.type==='quiz'));
 }else if(pathway==='school'){
  for(const grade of [9,10,11,12]){
   const here=resources.filter(r=>r.placements.some(p=>p.pathway==='school'&&p.grade===grade));
   html+=group('grade-'+grade,t('grade')+' '+grade,here);
  }
 }else{
  const lessons=resources.filter(r=>r.type==='lesson');const quizzes=resources.filter(r=>r.type==='quiz');
  html+=group('utbk-lessons',t('studyMaterials'),lessons);
  html+=group('utbk-practice',t('practiceExercises'),quizzes.filter(r=>r.examFormat!=='full'));
  html+=group('utbk-mocks',t('quizFull'),quizzes.filter(r=>r.examFormat==='full'));
 }
 target.innerHTML=html;
 }
 draw();onLanguageChange(draw);
 const scrollSection=()=>{const targetId=decodeURIComponent(location.hash.slice(1));if(targetId)document.getElementById(targetId)?.scrollIntoView({block:'start'})};
 requestAnimationFrame(scrollSection);addEventListener('hashchange',scrollSection);
 // Old external links pointing at ?grade= or ?difficulty= land in the correct section.
 const legacy=new URLSearchParams(location.search);
 if(!location.hash){const section=pathway==='school'&&/^(9|10|11|12)$/.test(legacy.get('grade')||'')?'grade-'+legacy.get('grade'):pathway==='grammar'&&['beginner','intermediate','advanced'].includes((legacy.get('difficulty')||'').toLowerCase())?legacy.get('difficulty').toLowerCase():null;if(section)location.replace(location.pathname+'#'+section)}
}catch(e){target.innerHTML=`<div class="error" role="alert"><h2>${t('errorTitle')}</h2><p>${esc(e.message)}</p></div>`}
