import {getCatalog,esc,link,progress,error} from './core.js';
import {t,initI18n,onLanguageChange,language} from './i18n.js';
import {setupBackup} from './backup.js';

initI18n();
try{
  const catalog=await getCatalog();
  const resources=catalog.resources;
  const priority=r=>Number.isInteger(r.order)?r.order:1000;
  const sorted=(a,b)=>priority(a)-priority(b)||a.title.localeCompare(b.title);

  function renderHome(){
    const p=progress.read();
    const lessonProgress=p.lessons||{};
    const attempts=Array.isArray(p.attempts)?p.attempts:[];
    const completed=resources.filter(r=>r.type==='lesson'&&lessonProgress[r.id]).length;
    const lessonCount=resources.filter(r=>r.type==='lesson').length;
    const average=attempts.length
      ? Math.round(attempts.reduce((sum,a)=>sum+(a.result?.percentage||0),0)/attempts.length)+'%'
      : '—';
    const stats=document.querySelector('#stats');
    if(stats){
      const values=[[completed,'statLessons'],[attempts.length,'statExams'],[average,'statAverage'],[lessonCount?Math.round(completed/lessonCount*100)+'%':'0%','statProgress']];
      stats.innerHTML=values.map(([value,key])=>`<div class="stat"><strong>${value}</strong><span>${t(key)}</span></div>`).join('');
    }

    const drafts=[];
    try{
      for(let i=0;i<localStorage.length;i++){
        const key=localStorage.key(i);
        if(!key.startsWith('langkah.draft.'))continue;
        const id=key.slice('langkah.draft.'.length);
        const resource=resources.find(r=>r.id===id&&r.type==='quiz');
        if(!resource)continue;
        const draft=JSON.parse(localStorage.getItem(key));
        if(draft?.answers?.length)drafts.push({resource,draft});
      }
    }catch{}
    drafts.sort((a,b)=>(b.draft.start||0)-(a.draft.start||0));

    const lastDiagnostic=attempts.find(a=>a.resourceId==='grammar-diagnostic');
    let diagnosticId=null;
    if(lastDiagnostic?.questions?.length){
      const groups=new Map();
      lastDiagnostic.questions.forEach((question,index)=>{
        if(!question.skill)return;
        const value=groups.get(question.skill)||{right:0,total:0};
        value.total++;
        if(question.answer===lastDiagnostic.answers[index])value.right++;
        groups.set(question.skill,value);
      });
      const ranked=[...groups.entries()]
        .filter(([,value])=>value.right<value.total)
        .sort((a,b)=>(a[1].right/a[1].total)-(b[1].right/b[1].total));
      const skill=ranked[0]?.[0];
      diagnosticId=({'Sentence foundations':'sentence-structure','Vocabulary in Context':'grade12-academic-vocab','Reference Questions':'reading-bridge','Text Organization':'reading-bridge','Critical Reading':'reading-strategies','Author’s Purpose':'reading-strategies'})[skill]||null;
    }
    const next=(diagnosticId&&resources.find(r=>r.id===diagnosticId))||resources
      .filter(r=>r.type==='lesson'&&!lessonProgress[r.id]&&r.placements.some(place=>place.pathway==='grammar'))
      .sort(sorted)[0];

    const continueSection=document.querySelector('#continue-section');
    const continuePanel=document.querySelector('#continue');
    const hasProgress=completed>0||attempts.length>0||drafts.length>0||(Array.isArray(p.activity)&&p.activity.length>0);
    if(continueSection&&continuePanel){
      continueSection.hidden=!hasProgress;
      if(!hasProgress){
        continuePanel.innerHTML='';
      }else if(drafts.length){
        const resource=drafts[0].resource;
        continuePanel.innerHTML=`<div class="continue-panel"><div><span class="section-kicker">${t('continueTitle')}</span><strong>${esc(resource.title)}</strong><p>${t('continueDesc')}</p></div><a class="button" href="${link(resource.id,'quiz')}">${t('resume')} ↗</a></div>`;
      }else if(next){
        continuePanel.innerHTML=`<div class="continue-panel"><div><span class="section-kicker">${t('continueTitle')}</span><strong>${esc(next.title)}</strong><p>${t('continueDesc')}</p></div><a class="button" href="${link(next.id,'lesson')}">${t('startHere')} ↗</a></div>`;
      }else{
        continuePanel.innerHTML=`<div class="continue-panel"><div><span class="section-kicker">${t('continueTitle')}</span><strong>${t('noActivity')}</strong></div><a class="button" href="grammar.html">${t('startHere')} ↗</a></div>`;
      }
    }

    const activity=document.querySelector('#activity');
    if(activity){
      const items=Array.isArray(p.activity)?p.activity:[];
      activity.innerHTML=items.length
        ? items.slice(0,6).map(item=>`<div class="activity-row"><span class="activity-marker">${item.kind?.startsWith('Lesson')?'✓':'◎'}</span><div><strong>${esc(item.title)}</strong><small>${item.kind?.startsWith('Lesson')?t('lessonCompleted'):t('examActivity')}${item.kind?.startsWith('Examination:')?' · '+esc(item.kind.slice('Examination:'.length).trim()):''} · ${new Date(item.at).toLocaleDateString(language()==='id'?'id-ID':'en-US')}</small></div></div>`).join('')
        : `<p class="muted" style="padding:18px 0">${t('noActivity')}</p>`;
    }
  }

  setupBackup(renderHome);
  renderHome();
  onLanguageChange(renderHome);
  const progressDetails=document.querySelector('#my-progress');
  if(progressDetails&&location.hash==='#my-progress')progressDetails.open=true;
  addEventListener('hashchange',()=>{
    if(progressDetails&&location.hash==='#my-progress')progressDetails.open=true;
  });
}catch(e){error(e)}
