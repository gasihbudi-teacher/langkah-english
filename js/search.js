import {getCatalog,esc,link,progress,params,quizDrafts,resourceStatus,pathIllustration,icon} from './core.js';
import {t,initI18n,onLanguageChange} from './i18n.js';

initI18n();
const input = document.querySelector('#search-input');
const results = document.querySelector('#search-results');
const pathKeys = {grammar:'navGrammar',school:'navSchool',utbk:'navUtbk',tka:'navTka'};
const featuredIds = ['parts-of-speech','simple-present','reading-bridge','grade12-adverbial-phrase-vs-clause','utbk-critical-inference','grammar-diagnostic'];

try {
  const catalog = await getCatalog();
  const record = progress.read();
  const drafts = quizDrafts();
  input.value = params.get('q') || '';
  let showAll = false;
  const chips = document.createElement('div');
  chips.className = 'search-chips';
  document.querySelector('.search-field').after(chips);
  chips.addEventListener('click', event => {
    const chip = event.target.closest('[data-term]');
    if (!chip) return;
    input.value = chip.dataset.term;
    showAll = false;
    render();
    input.focus();
  });
  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'button button-outline search-show-all';
  results.after(more);
  more.addEventListener('click', () => {
    showAll = true;
    render();
    document.querySelector('#search-count').focus();
  });

  function placementLabel(p) {
    return t(pathKeys[p.pathway]) + (p.grade ? ' · '+t('grade')+' '+p.grade : '');
  }
  function card(r) {
    const primary = r.placements[0];
    const placements = r.placements.map(placementLabel).join(' / ');
    return `<article class="resource-card" data-track="${esc(primary.pathway)}">
      <a class="result-link" href="${link(r.id,r.type)}">
        <span class="result-path">${pathIllustration(primary.pathway)}<span>${esc(placements)}</span></span>
        <h2>${esc(r.title)}</h2><p>${esc(r.description)}</p>
        <div class="card-bottom"><span>${t(r.type==='lesson'?'openLesson':'openQuiz')} ${icon('arrow')}</span>${resourceStatus(r,record,drafts)}</div>
      </a></article>`;
  }
  function render() {
    const term = input.value.trim().toLocaleLowerCase('id');
    const initial = !term && !showAll;
    const hits = catalog.resources.filter(r => {
      const words = [r.title,r.description,r.difficulty,r.type,...(r.tags||[]),...(r.grammarTopics||[]),...(r.readingSkills||[])];
      for(const p of r.placements) words.push(p.pathway, t(pathKeys[p.pathway]), p.grade ? 'kelas '+p.grade+' grade '+p.grade : '');
      return !term || words.join(' ').toLocaleLowerCase('id').includes(term);
    }).sort((a,b)=>(a.order??1000)-(b.order??1000)||a.title.localeCompare(b.title));
    const items = initial ? featuredIds.map(id=>catalog.resources.find(r=>r.id===id)).filter(Boolean) : hits;
    input.placeholder = t('searchPlaceholder');
    const count = document.querySelector('#search-count');
    count.tabIndex = -1;
    count.textContent = initial ? t('searchSuggestions') : t('searchFound',{n:hits.length});
    chips.hidden = !initial;
    const terms = ['simple present','reading','adverbial',t('grade')+' 12','UTBK'];
    chips.innerHTML = initial ? terms.map(word => `<button type="button" data-term="${esc(word)}">${esc(word)}</button>`).join('') : '';
    more.hidden = !initial;
    more.textContent = t('viewAllResults',{n:catalog.resources.length});
    results.innerHTML = items.map(card).join('') || `<div class="search-empty"><h2>${t('noMatches')}</h2><p>${t('noMatchesHint')}</p><button type="button" data-reset>${t('searchReset')}</button></div>`;
    const url = new URL(location.href);
    if(term) url.searchParams.set('q', input.value.trim()); else url.searchParams.delete('q');
    history.replaceState({},'',url.pathname+url.search);
  }
  results.addEventListener('click', event => {
    if (!event.target.closest('[data-reset]')) return;
    input.value = '';
    showAll = false;
    render();
    input.focus();
  });
  input.addEventListener('input', () => { showAll = false; render(); });
  render();
  onLanguageChange(render);
} catch(e) {
  results.innerHTML = `<p class="error" role="alert">${esc(e.message)}</p>`;
}
