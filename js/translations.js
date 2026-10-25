import {esc} from './core.js';
import {t} from './i18n.js';
/** Optional translated prompt and individually numbered choices. Nothing opens by default. */
export function translationDetails(q){
 const tr=q.translationId;
 if(!tr || (!tr.prompt && !(tr.choices?.length))) return '';
 const opts=Array.isArray(tr.choices) && tr.choices.length===q.choices.length?`<ol type="A" lang="id">${tr.choices.map(c=>`<li>${esc(c)}</li>`).join('')}</ol>`:'';
 return `<details class="translation-detail"><summary>${t('showTranslation')}</summary>${tr.prompt?`<p lang="id">${esc(tr.prompt)}</p>`:''}${opts}${!opts?`<p class="translation-note">${t('grammarChoicesNote')}</p>`:''}<p class="translation-note">${t('translationHint')}</p></details>`;
}
