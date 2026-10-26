import {esc} from './core.js';
import {t} from './i18n.js';
/** Indonesian help is collapsed; timed simulation never calls this function. */
export function translationDetails(q){
 const tr=q.translationId;
 if(!tr||(!tr.prompt&&!(tr.choices?.length)&&!(tr.statements?.length)))return '';
 const isCategory=q.questionType==='category';
 const opts=!isCategory&&Array.isArray(tr.choices)&&tr.choices.length===q.choices.length?`<ol type="A" lang="id">${tr.choices.map(c=>`<li>${esc(c)}</li>`).join('')}</ol>`:'';
 const categoryRows=isCategory?`${tr.statements?.length===q.statements.length?`<ol lang="id">${tr.statements.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`:''}${tr.categories?.length===q.categories.length?`<p lang="id">${q.categories.map((c,i)=>`${esc(c)}: ${esc(tr.categories[i])}`).join(' · ')}</p>`:''}`:'';
 return `<details class="translation-detail"><summary>${t('showTranslation')}</summary>${tr.prompt?`<p lang="id">${esc(tr.prompt)}</p>`:''}${opts}${categoryRows}${!isCategory&&!opts?`<p class="translation-note">${t('grammarChoicesNote')}</p>`:''}<p class="translation-note">${t('translationHint')}</p></details>`;
}
