import {getCatalog,esc,link,progress,params} from './core.js';
import {t,initI18n,onLanguageChange} from './i18n.js';
initI18n();
const input=document.querySelector('#search-input');
try{
 const c=await getCatalog(),p=progress.read();const q=params.get('q');if(q)input.value=q;
 function render(){const term=input.value.trim().toLocaleLowerCase('id');const items=c.resources.filter(r=>!term||[r.title,r.description,r.difficulty,r.type,...(r.tags||[]),...(r.grammarTopics||[]),...(r.readingSkills||[])].join(' ').toLocaleLowerCase('id').includes(term)).sort((a,b)=>(a.order??1000)-(b.order??1000)||a.title.localeCompare(b.title));
 document.querySelector('#search-count').textContent=t('searchFound',{n:items.length});
 document.querySelector('#search-results').innerHTML=items.map(r=>`<article class="resource-card"><span class="badge">${t(r.type==='lesson'?'studyMaterials':r.kind==='test'?'topicTests':'practiceExercises')}</span><h2>${esc(r.title)}</h2><p>${esc(r.description)}</p><small>${esc(r.placements.map(p=>p.pathway+(p.grade?' / '+t('grade')+' '+p.grade:'')).join(' · '))}</small><div class="card-bottom"><a href="${link(r.id,r.type)}">${t(r.type==='lesson'?'openLesson':'openQuiz')} ↗</a>${p.lessons?.[r.id]?`<span class="badge badge-mint">✓ ${t('completed')}</span>`:''}</div></article>`).join('')||`<p class="notice">${t('noMatches')}</p>`;
 const url=new URL(location.href);if(term)url.searchParams.set('q',input.value.trim());else url.searchParams.delete('q');history.replaceState({},'',url.pathname+url.search);}
 input.addEventListener('input',render);render();onLanguageChange(render);
}catch(e){document.querySelector('#search-results').innerHTML=`<p class="error">${esc(e.message)}</p>`}
