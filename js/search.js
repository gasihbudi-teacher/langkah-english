import {getCatalog,esc,link,progress,params} from './core.js';
import {t,initI18n,onLanguageChange} from './i18n.js';
initI18n();
const input=document.querySelector('#search-input');
try{
 const c=await getCatalog(),p=progress.read();const q=params.get('q');if(q)input.value=q;
 const featuredIds=['parts-of-speech','simple-present','reading-bridge','grade12-adverbial-phrase-vs-clause','utbk-critical-inference','grammar-diagnostic'];
 let showAll=false;
 const chips=document.createElement('div');chips.className='search-chips';
 input.insertAdjacentElement('afterend',chips);
 chips.addEventListener('click',e=>{const button=e.target.closest('button[data-search-term]');if(!button)return;input.value=button.dataset.searchTerm;showAll=false;render();input.focus();});
 const more=document.createElement('button');more.type='button';more.className='button button-outline search-show-all';more.hidden=true;
 document.querySelector('#search-results').insertAdjacentElement('afterend',more);
 more.addEventListener('click',()=>{showAll=true;render();});
 function render(){
  const term=input.value.trim().toLocaleLowerCase('id');
  const hits=c.resources.filter(r=>!term||[r.title,r.description,r.difficulty,r.type,...(r.tags||[]),...(r.grammarTopics||[]),...(r.readingSkills||[]),...(r.placements||[]).map(pl=>`${pl.pathway} ${pl.grade?'kelas '+pl.grade+' grade '+pl.grade:''}`)].join(' ').toLocaleLowerCase('id').includes(term)).sort((a,b)=>(a.order??1000)-(b.order??1000)||a.title.localeCompare(b.title));
  const initial=!term&&!showAll;
  const items=initial?featuredIds.map(id=>c.resources.find(r=>r.id===id)).filter(Boolean):hits;
  document.querySelector('#search-count').textContent=initial?t('searchSuggestions')+' · '+t('searchTry'):t('searchFound',{n:hits.length});
  chips.hidden=!initial;
  chips.innerHTML=initial?['simple present','reading','adverbial','kelas 12','UTBK'].map(term=>`<button type="button" data-search-term="${esc(term)}">${esc(term)} ↗</button>`).join(''):'';
  more.hidden=!initial;more.textContent=t('viewAllResults',{n:c.resources.length});
  document.querySelector('#search-results').innerHTML=items.map(r=>`<article class="resource-card"><span class="badge">${t(r.type==='lesson'?'studyMaterials':r.kind==='test'?'topicTests':'practiceExercises')}</span><h2>${esc(r.title)}</h2><p>${esc(r.description)}</p><small>${esc(r.placements.map(p=>p.pathway+(p.grade?' / '+t('grade')+' '+p.grade:'')).join(' · '))}</small><div class="card-bottom"><a href="${link(r.id,r.type)}">${t(r.type==='lesson'?'openLesson':'openQuiz')} ↗</a>${p.lessons?.[r.id]?`<span class="badge badge-mint">✓ ${t('completed')}</span>`:''}</div></article>`).join('')||`<p class="notice">${t('noMatches')}</p>`;
  const url=new URL(location.href);if(term)url.searchParams.set('q',input.value.trim());else url.searchParams.delete('q');history.replaceState({},'',url.pathname+url.search);
 }
 input.addEventListener('input',render);render();onLanguageChange(render);
}catch(e){document.querySelector('#search-results').innerHTML=`<p class="error">${esc(e.message)}</p>`}
