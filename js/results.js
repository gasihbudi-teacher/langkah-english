import {params,progress,esc,link,time,error,getCatalog,icon,pathIllustration} from './core.js';
import {t,initI18n,onLanguageChange,language} from './i18n.js';
import {translationDetails} from './translations.js';
import {questionType,isAnswered,isCorrect} from './question-types.mjs';
initI18n();
try{
 let a=progress.read().attempts?.find(x=>x.attemptId===params.get('attempt'));if(!a){try{const v=JSON.parse(sessionStorage.getItem('langkah.last'));if(v?.attemptId===params.get('attempt'))a=v}catch{}}
 if(!a){
  function renderEmpty(){
   document.querySelector('#content').innerHTML=`<article class="reading result-hero"><h1>${t('resultEmptyTitle')}</h1><p>${t('resultsMissing')}</p><a class="button" href="index.html#my-progress">${t('resultsHome')} ${icon('arrow')}</a></article>`;
  }
  renderEmpty();onLanguageChange(renderEmpty);
 }else{
 if(!a.pathway){try{const catalog=await getCatalog();a.pathway=catalog.resources.find(r=>r.id===a.resourceId)?.placements?.[0]?.pathway||'grammar'}catch{a.pathway='grammar'}}
 const r=a.result;
 function skillSummary(){const groups=new Map();a.questions.forEach((q,i)=>{if(!q.skill)return;const g=groups.get(q.skill)||{correct:0,total:0};g.total++;if(isCorrect(q,a.answers[i]))g.correct++;groups.set(q.skill,g)});if(!groups.size)return '';const rows=[...groups].sort((x,y)=>(x[1].correct/x[1].total)-(y[1].correct/y[1].total));return `<section class="panel" aria-label="${t('skillBreakdown')}"><h2>${t('skillBreakdown')}</h2><p class="muted">${t('skillHint')}</p><div class="skill-list">${rows.map(([skill,g])=>`<div><span>${esc(skill)}</span><strong>${g.correct}/${g.total}</strong><progress max="${g.total}" value="${g.correct}" aria-label="${esc(skill)}"></progress></div>`).join('')}</div>${a.resourceId==='grammar-diagnostic'?diagnosticRecommendations(groups):''}</section>`}
 function diagnosticRecommendations(groups){
 const sections=[
  {skills:['Sentence foundations'],id:'sentence-structure',label:'Sentence Structure · Grammar dasar'},
  {skills:['Vocabulary in Context'],id:'grade12-academic-vocab',label:'Academic Vocabulary · Kosakata dalam konteks'},
  {skills:['Reference Questions','Text Organization'],id:'reading-bridge',label:'Reading Bridge · Hubungan antarkalimat'},
  {skills:['Critical Reading',"Author’s Purpose"],id:'reading-strategies',label:'Reading Strategies · Bukti dan simpulan'}
 ];
 const ranked=sections.map(s=>{let correct=0,total=0;for(const k of s.skills){const g=groups.get(k);if(g){correct+=g.correct;total+=g.total}}return {...s,correct,total,percentage:total?correct/total:1}}).filter(x=>x.total).sort((x,y)=>x.percentage-y.percentage||y.total-x.total);
 // When a weak skill has only one question, show as a *starting suggestion*, not a diagnosis.
 const next=ranked.filter(x=>x.correct<x.total).slice(0,2);
 if(!next.length)return `<div class="notice diagnostic-recommendations">${t('diagnosticNext')} <a href="quiz.html?id=utbk-reading-lab">${t('diagnosticLink')}</a></div>`;
 return `<div class="notice diagnostic-recommendations"><strong>${t('diagnosticSuggestions')}</strong><ol>${next.map(x=>`<li><a href="lesson.html?id=${encodeURIComponent(x.id)}">${esc(x.label)}</a> <small>(${x.correct}/${x.total})</small></li>`).join('')}</ol><small>${t('skillHint')}</small></div>`;
 }
 function reviewResponse(q,a){
  const kind=questionType(q);
  if(kind==='single'||kind==='multiple'){
   const selected=new Set(kind==='single'?[a]:(Array.isArray(a)?a:[]));
   const correct=new Set(kind==='single'?[q.answer]:q.answers);
   return `<ol type="A">${q.choices.map((v,n)=>`<li class="${correct.has(n)?'correct-choice':selected.has(n)?'retry-choice':''}">${esc(v)}${correct.has(n)?' '+icon('check')+' '+t('rightChoice'):selected.has(n)?' '+icon('history')+' '+t('tryAgainState'):''}${selected.has(n)?' · '+t('yourChoice'):''}${q.choiceExplanations&&language()==='en'?`<p class="review-reason">${esc(q.choiceExplanations[n])}</p>`:''}</li>`).join('')}</ol>`;
  }
  return `<div class="category-review-wrap"><table class="category-review"><thead><tr><th>${t('statementLabel')}</th><th>${t('yourChoice')}</th><th>${t('correctAnswer')}</th></tr></thead><tbody>${q.statements.map((row,j)=>`<tr><th scope="row">${esc(row.text)}${row.explanation&&language()==='en'?`<p class="review-reason">${esc(row.explanation)}</p>`:''}</th><td>${esc(Array.isArray(a)?a[j]??t('scoreUnanswered'):t('scoreUnanswered'))}</td><td>${esc(row.answerCategory)}</td></tr>`).join('')}</tbody></table></div>`;
 }
 const pathNames={grammar:'navGrammar',school:'navSchool',utbk:'navUtbk',tka:'navTka',sas:'navSas','text-based':'navTextBased'};
 const track=Object.hasOwn(pathNames,a.pathway)?a.pathway:'grammar';
 function reviewCard(q,i,open){
  const passage=a.passages?.find(x=>x.id===q.passageId);
  const activeSection=a.sections?.find(s=>i+1>=s.questionStart&&i+1<=s.questionEnd);
  const status=isCorrect(q,a.answers[i])?'scoreCorrect':isAnswered(q,a.answers[i])?'scoreIncorrect':'scoreUnanswered';
  const symbol=status==='scoreCorrect'?'check':status==='scoreIncorrect'?'history':'pen';
  return `<details class="panel review" data-review="${i}" ${open?'open':''}>
    <summary><span class="review-heading"><span lang="en">${i+1}. ${esc(q.prompt)}</span>
      <span class="review-tag ${status}">${icon(symbol)}${t(status)}</span>${a.flags?.[i]?`<span class="review-tag">${icon('flag')}${t('flagged')}</span>`:''}</span></summary>
    <div class="review-body">${activeSection?`<div class="quiz-section-context review-section-context"><span class="section-kicker">Section ${activeSection.number}</span><h3>${esc(activeSection.title)}</h3></div>`:''}${translationDetails(q)}
      ${passage?`<details class="review-passage"><summary>${t('readPassage')} · ${esc(passage.title)}</summary><p lang="en">${esc(passage.text)}</p></details>`:''}
      ${reviewResponse(q,a.answers[i])}
      <h4>${t('explanationHeading')}</h4><p class="answer-explanation">${esc(q.explanation)}</p>
      ${q.evidence?`<blockquote>${t('textEvidence')}: <span lang="en">${esc(q.evidence)}</span></blockquote>`:''}
    </div></details>`;
 }
 function render(){
  const content=document.querySelector('#content');
  const openCards=new Set([...content.querySelectorAll('.review[open]')].map(card=>Number(card.dataset.review)));
  content.innerHTML=`<article class="reading results-reading" data-track="${esc(track)}">
    <div class="result-hero"><div class="reading-path">${pathIllustration(track)}${t(pathNames[track])} · ${t('resultsEyebrow')}</div>
      <h1>${t('resultsTitle',{n:esc(r.percentage)})}</h1><p class="result-name">${esc(a.title)}</p>
      <p>${t('resultsScore',{correct:esc(r.correct),total:esc(r.total)})}</p>
      <div class="learning-meta"><span>${t(a.mode==='practice'?'practiceMode':'simulationMode')}</span><span>${t('unofficial')}</span></div>
      <a class="button" href="#review-title">${t('openReview')} ${icon('arrow')}</a>
    </div>
    <div class="stats result-stats">${[[r.correct,'scoreCorrect'],[r.incorrect,'scoreIncorrect'],[r.unanswered,'scoreUnanswered'],[time(a.elapsed),'timeSpent']].map(([n,k])=>`<div class="stat"><strong>${esc(n)}</strong><span>${t(k)}</span></div>`).join('')}</div>
    ${skillSummary()}
    <h2 id="review-title" tabindex="-1">${t('questionReview')}</h2>
    ${a.questions.map((q,i)=>reviewCard(q,i,openCards.has(i))).join('')}
    <details class="quiz-rules"><summary>${t('quizRules')}</summary><p>${t('tkaScoringRule')}</p></details>
    <div class="toolbar results-actions"><a class="button button-outline" href="${link(a.resourceId,'quiz')}">${t('retake')}</a><a class="button button-outline" href="${track}.html">${t('backLearning')}</a></div>
  </article>`;
 }
 render();onLanguageChange(render);
 }
}catch(e){error(e)}
