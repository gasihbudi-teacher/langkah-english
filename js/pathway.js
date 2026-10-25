import {getCatalog,esc,link,progress,params,error} from './core.js';
import {t,initI18n,onLanguageChange} from './i18n.js';
initI18n();
const pathway=document.body.dataset.pathway;
const levels=['Beginner','Intermediate','Advanced'];
const sorting=(a,b)=>(a.order??1000)-(b.order??1000)||a.title.localeCompare(b.title,'id');
const get=(id)=>document.getElementById(id);
try {
 const catalog=await getCatalog();
 const resources=catalog.resources.filter(r=>r.placements.some(p=>p.pathway===pathway));
 function translatedName(){return pathway==='grammar'?t('pathGrammar'):pathway==='utbk'?t('pathUtbk'):t('pathSchool')}
 function headline(){get('pathway-count').textContent=t(resources.length===1?'resourceCountOne':'resourceCount',{n:resources.length})}
 const filterKeys=['q','grade','difficulty','type'];
 const state=Object.fromEntries(filterKeys.map(k=>[k,params.get(k)||'']));
 if(pathway!=='school')state.grade='';
 function getValue(k){return (get('lib-'+k)||{}).value||''}
 function option(value,label){return `<option value="${esc(value)}">${esc(label)}</option>`}
 function buildFilters(){
 const old={...state};filterKeys.forEach(k=>{const el=get('lib-'+k);if(el)old[k]=el.value});
 get('pathway-filters').innerHTML=`<label for="lib-q">${t('searchLabel')}<input id="lib-q" type="search" placeholder="${t('searchPlaceholder')}"></label>`+
 (pathway==='school'?`<label for="lib-grade">${t('gradeLabel')}<select id="lib-grade">${option('',t('all'))}${[9,10,11,12].map(g=>option(String(g),t('grade')+' '+g)).join('')}</select></label>`:'')+
 `<label for="lib-difficulty">${t('difficultyLabel')}<select id="lib-difficulty">${option('',t('all'))}${levels.map(x=>option(x,x)).join('')}</select></label>`+
 `<label for="lib-type">${t('typeLabel')}<select id="lib-type">${option('',t('all'))}${option('lesson',t('studyMaterials'))}${option('practice',t('practiceExercises'))}${option('test',t('topicTests'))}</select></label>`;
 filterKeys.forEach(k=>{const el=get('lib-'+k);if(el){el.value=old[k]||'';el.addEventListener('input',render)}});
 }
 function topicGroup(){
 const groups=pathway==='grammar'?catalog.grammarLevels:pathway==='utbk'?{'Kemampuan membaca':catalog.readingSkills}:catalog.schoolTopics;
 get('pathway-topics').innerHTML=Object.entries(groups).map(([group,topics])=>`<details><summary>${esc(group)}</summary><div class="topiclist">${topics.map(topic=>`<button class="topic" type="button" data-topic="${esc(topic)}">${esc(topic)}</button>`).join('')}</div></details>`).join('');
 get('pathway-topics').querySelectorAll('[data-topic]').forEach(btn=>btn.addEventListener('click',()=>{get('lib-q').value=btn.dataset.topic;render()}));
 }
 function quickPicks(){
 if(pathway==='grammar'){
  get('level-list').hidden=false;
  get('level-list').innerHTML=levels.map((level,index)=>{const available=resources.filter(r=>r.type==='lesson'&&r.difficulty===level).length;return `<button class="quick-pick" type="button" data-level="${esc(level)}"><span class="quick-pick-symbol">0${index+1}</span><strong>${esc(level)}</strong><small>${available} ${t('resources')}</small></button>`}).join('');
  get('level-list').querySelectorAll('[data-level]').forEach(btn=>btn.onclick=()=>{get('lib-difficulty').value=btn.dataset.level;render();get('pathway-resources').scrollIntoView({behavior:'smooth',block:'start'})});
 }
 if(pathway==='school'){
  get('grade-list').hidden=false;
  get('grade-list').innerHTML=[9,10,11,12].map(g=>{const total=resources.filter(r=>r.placements.some(p=>p.pathway==='school'&&p.grade===g)).length;return `<button class="grade-card grade-card-button" type="button" data-grade="${g}"><span class="section-kicker">${t('grade')}</span><span class="grade-number">${g}</span><p>${total} ${t('resources')}</p><span class="grade-link">${t('gradeExplore')} ↗</span></button>`}).join('');
  get('grade-list').querySelectorAll('[data-grade]').forEach(btn=>btn.onclick=()=>{get('lib-grade').value=btn.dataset.grade;render();get('pathway-resources').scrollIntoView({behavior:'smooth',block:'start'})});
 }
 }
 function render(){
 const f=Object.fromEntries(filterKeys.map(k=>[k,getValue(k)]));
 const q=f.q.trim().toLocaleLowerCase();
 const filtered=resources.filter(r=>(!q||[r.title,r.description,...r.tags,...r.grammarTopics,...r.readingSkills].join(' ').toLocaleLowerCase().includes(q))&&(!f.grade||r.placements.some(p=>p.pathway==='school'&&String(p.grade)===f.grade))&&(!f.difficulty||r.difficulty===f.difficulty)&&(!f.type||(f.type==='lesson'?r.type==='lesson':r.type==='quiz'&&r.kind===f.type))).sort(sorting);
 const p=progress.read();
 get('pathway-count').textContent=t(filtered.length===1?'resourceCountOne':'resourceCount',{n:filtered.length});
 get('pathway-resources').innerHTML=filtered.length?filtered.map(r=>`<article class="resource-card"><div class="resource-meta"><span class="badge">${esc(r.difficulty)}</span><span class="badge ${r.type==='lesson'?'badge-mint':'badge-sun'}">${r.type==='lesson'?t('studyMaterials'):r.kind==='test'?t('topicTests'):t('practiceExercises')}</span>${p.lessons?.[r.id]?`<span class="badge badge-mint">✓ ${t('completed')}</span>`:''}</div><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p><div class="card-bottom"><a href="${link(r.id,r.type)}">${t(r.type==='lesson'?'openLesson':'openQuiz')} ↗</a>${r.estimatedMinutes?`<span class="muted">${r.estimatedMinutes} ${t('minute')}</span>`:''}</div></article>`).join(''):`<div class="empty"><strong>${t('noMatches')}</strong><p>${t('noMatchesHint')}</p></div>`;
 const next=new URLSearchParams();Object.entries(f).forEach(([k,v])=>{if(v)next.set(k,v)});history.replaceState(null,'',location.pathname+(next.size?'?'+next:''));
 }
 function draw(){document.querySelector('[data-pathway-title]').textContent=translatedName();document.querySelector('[data-pathway-description]').textContent=t(({grammar:'pathwayIntroGrammar',utbk:'pathwayIntroUtbk',school:'pathwayIntroSchool'})[pathway]);buildFilters();quickPicks();topicGroup();render()}
 // Ensure a language switch also rebuilds filter option labels, keeping active values.
 get('path-reset').addEventListener('click',()=>{filterKeys.forEach(k=>{const el=get('lib-'+k);if(el)el.value=''});render()});
 draw();onLanguageChange(draw);
} catch(err){const el=get('pathway-resources');if(el)el.innerHTML=`<div class="error"><h2>${t('errorTitle')}</h2><p>${esc(err.message)}</p></div>`;else error(err)}
