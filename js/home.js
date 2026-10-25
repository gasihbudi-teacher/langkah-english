import {getCatalog,esc,link,progress,params,error} from './core.js';
import {t,initI18n,onLanguageChange,language} from './i18n.js';
import {setupBackup} from './backup.js';
initI18n();
try{
  const catalog=await getCatalog();
  const c=catalog;
  const priority=r=>Number.isInteger(r.order)?r.order:1000;
  const sorted=(a,b)=>priority(a)-priority(b)||a.title.localeCompare(b.title);
  function renderStats(){const p=progress.read();const completed=c.resources.filter(r=>r.type==='lesson'&&p.lessons[r.id]).length;const lessons=c.resources.filter(r=>r.type==='lesson').length;const attempts=Array.isArray(p.attempts)?p.attempts:[];const avg=attempts.length?Math.round(attempts.reduce((s,a)=>s+(a.result?.percentage||0),0)/attempts.length)+'%':'—';const stats=[[completed,'statLessons'],[attempts.length,'statExams'],[avg,'statAverage'],[lessons?Math.round(completed/lessons*100)+'%':'0%','statProgress']];document.querySelector('#stats').innerHTML=stats.map(([v,k])=>`<div class="stat"><strong>${v}</strong><span>${t(k)}</span></div>`).join('');
    const drafts=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!k.startsWith('langkah.draft.'))continue;const id=k.slice('langkah.draft.'.length);const r=c.resources.find(r=>r.id===id&&r.type==='quiz');if(!r)continue;const d=JSON.parse(localStorage.getItem(k));if(d?.answers?.length)drafts.push({r,d})}}catch{}drafts.sort((a,b)=>(b.d.start||0)-(a.d.start||0));
    const lastDiagnostic=(p.attempts||[]).find(a=>a.resourceId==='grammar-diagnostic');
    let diagnosticId=null;
    if(lastDiagnostic?.questions?.length){
      const groups=new Map();lastDiagnostic.questions.forEach((q,i)=>{if(!q.skill)return;const v=groups.get(q.skill)||{right:0,total:0};v.total++;if(q.answer===lastDiagnostic.answers[i])v.right++;groups.set(q.skill,v)});
      const ranked=[...groups.entries()].filter(([,v])=>v.right<v.total).sort((a,b)=>(a[1].right/a[1].total)-(b[1].right/b[1].total));
      const skill=ranked[0]?.[0];diagnosticId=({'Sentence foundations':'sentence-structure','Vocabulary in Context':'grade12-academic-vocab','Reference Questions':'reading-bridge','Text Organization':'reading-bridge','Critical Reading':'reading-strategies','Author’s Purpose':'reading-strategies'})[skill]||null;
    }
    const next=(diagnosticId&&c.resources.find(r=>r.id===diagnosticId))||c.resources.filter(r=>r.type==='lesson'&&!p.lessons?.[r.id]&&r.placements.some(x=>x.pathway==='grammar')).sort(sorted)[0];const panel=document.querySelector('#continue');
    if(drafts.length){const r=drafts[0].r;panel.innerHTML=`<div class="continue-panel"><div><span class="section-kicker">${t('continueTitle')}</span><strong>${esc(r.title)}</strong><p>${t('continueDesc')}</p></div><a class="button" href="${link(r.id,'quiz')}">${t('resume')} ↗</a></div>`}
    else if(next){panel.innerHTML=`<div class="continue-panel"><div><span class="section-kicker">${t('recommended')}</span><strong>${esc(next.title)}</strong><p>${t('continueDesc')}</p></div><a class="button" href="${link(next.id,'lesson')}">${t('startHere')} ↗</a></div>`}
    else{panel.innerHTML=`<div class="continue-panel"><div><strong>${t('continueTitle')}</strong><p>${t('noActivity')}</p></div><a class="button" href="grammar.html">${t('startHere')} ↗</a></div>`}
    const acts=Array.isArray(p.activity)?p.activity:[];document.querySelector('#activity').innerHTML=acts.length?acts.slice(0,6).map(a=>`<div class="activity-row"><span class="activity-marker">${a.kind?.startsWith('Lesson')?'✓':'◎'}</span><div><strong>${esc(a.title)}</strong><small>${a.kind?.startsWith('Lesson')?t('lessonCompleted'):t('examActivity')}${a.kind?.startsWith('Examination:')?' · '+esc(a.kind.slice('Examination:'.length).trim()):''} · ${new Date(a.at).toLocaleDateString(language()==='id'?'id-ID':'en-US')}</small></div></div>`).join(''):`<p class="muted" style="padding:18px 0">${t('noActivity')}</p>`;
  }
  function renderRoadmap(){const keys=Object.entries(c.grammarLevels);const progressData=progress.read().lessons;document.querySelector('#roadmap').innerHTML=keys.map(([level,topics],i)=>`<article class="roadmap-card"><div class="roadmap-number">0${i+1}</div><h3>${esc(level)}</h3><p class="roadmap-subtitle">${t(['roadmapBeginner','roadmapIntermediate','roadmapAdvanced'][i])}</p><ul>${topics.map(topic=>{const rs=c.resources.filter(r=>r.type==='lesson'&&r.placements.some(p=>p.pathway==='grammar')&&r.grammarTopics.includes(topic)).sort(sorted);const r=rs[0];return `<li>${r?`<a href="${link(r.id,'lesson')}">${esc(topic)}</a><span class="topic-symbol">${progressData[r.id]?'✓':t('available')}</span>`:`<span class="soon">${esc(topic)}</span><span class="topic-symbol" style="background:#f2f4f7;color:#8f9bab">${t('comingSoon')}</span>`}</li>`}).join('')}</ul><a class="quiet-link roadmap-cta" href="grammar.html#${encodeURIComponent(level.toLowerCase())}">${t('viewAllGrammar')} ↗</a></article>`).join('')}
  function renderGrades(){document.querySelector('#grade-cards').innerHTML=[9,10,11,12].map(g=>{const n=c.resources.filter(r=>r.placements.some(x=>x.pathway==='school'&&x.grade===g)).length;return `<a class="grade-card" href="school.html#grade-${g}"><span class="section-kicker">${t('grade')}</span><span class="grade-number">${g}</span><p>${n?n+' '+t('resources'):t('gradeEmpty')}</p><span class="grade-link">${t('gradeExplore')} ↗</span></a>`}).join('')}
  setupBackup(()=>renderAll());
  function renderAll(){renderStats();renderRoadmap();renderGrades()};renderAll();onLanguageChange(renderAll);
}catch(e){error(e)}
