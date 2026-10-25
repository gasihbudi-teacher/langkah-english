import {params,progress,esc,link,time,error,getCatalog} from './core.js';
import {t,initI18n,onLanguageChange} from './i18n.js';
import {translationDetails} from './translations.js';
initI18n();
try{
 let a=progress.read().attempts?.find(x=>x.attemptId===params.get('attempt'));if(!a){try{const v=JSON.parse(sessionStorage.getItem('langkah.last'));if(v?.attemptId===params.get('attempt'))a=v}catch{}}
 if(!a)throw Error('Hasil kuis ini tidak tersedia di browser. Kerjakan kuis terlebih dahulu untuk melihat nilainya.');
 if(!a.pathway){try{const catalog=await getCatalog();a.pathway=catalog.resources.find(r=>r.id===a.resourceId)?.placements?.[0]?.pathway||'grammar'}catch{a.pathway='grammar'}}
 const r=a.result;
 function skillSummary(){const groups=new Map();a.questions.forEach((q,i)=>{if(!q.skill)return;const g=groups.get(q.skill)||{correct:0,total:0};g.total++;if(a.answers[i]===q.answer)g.correct++;groups.set(q.skill,g)});if(!groups.size)return '';const rows=[...groups].sort((x,y)=>(x[1].correct/x[1].total)-(y[1].correct/y[1].total));return `<section class="panel" aria-label="${t('skillBreakdown')}"><h2>${t('skillBreakdown')}</h2><p class="muted">${t('skillHint')}</p><div class="skill-list">${rows.map(([skill,g])=>`<div><span>${esc(skill)}</span><strong>${g.correct}/${g.total}</strong><progress max="${g.total}" value="${g.correct}" aria-label="${esc(skill)}"></progress></div>`).join('')}</div>${a.resourceId==='grammar-diagnostic'?diagnosticRecommendations(groups):''}</section>`}
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
 function render(){document.querySelector('#content').innerHTML=`<article class="reading" style="max-width:960px"><div class="result-hero"><span class="section-kicker">${t('resultsEyebrow')}</span><h1>${t('resultsTitle',{n:r.percentage})}</h1><p>${esc(a.title)} · ${t(a.mode==='practice'?'practiceMode':'simulationMode')} · ${t('unofficial')}</p><p>${t('resultsScore',{correct:r.correct,total:r.total})}</p><div class="toolbar"><a class="button" href="${link(a.resourceId,'quiz')}">${t('retake')} ↗</a><a class="button button-outline" href="${a.pathway==='utbk'?'utbk.html':a.pathway==='school'?'school.html':'grammar.html'}">${t('backLearning')}</a></div></div><div class="stats result-stats">${[[r.correct,'scoreCorrect'],[r.incorrect,'scoreIncorrect'],[r.unanswered,'scoreUnanswered'],[time(a.elapsed),'timeSpent']].map(([n,k])=>`<div class="stat"><strong>${n}</strong><span>${t(k)}</span></div>`).join('')}</div>${skillSummary()}<h2>${t('questionReview')}</h2>${a.questions.map((q,i)=>{const p=a.passages.find(x=>x.id===q.passageId);const status=a.answers[i]===q.answer?t('scoreCorrect'):Number.isInteger(a.answers[i])?t('scoreIncorrect'):t('scoreUnanswered');return `<details class="panel review" open><summary>${i+1}. ${esc(q.prompt)} — ${status}${a.flags?.[i]?' · '+t('flagged'):''}</summary>${translationDetails(q)}${p?`<details><summary>${t('readPassage')}: ${esc(p.title)}</summary><p style="white-space:pre-line">${esc(p.text)}</p></details>`:''}<ol type="A">${q.choices.map((v,n)=>`<li class="${n===q.answer?'correct-choice':''}">${esc(v)}${n===q.answer?' ✓ '+t('rightChoice'):''}${n===a.answers[i]?' — '+t('yourChoice'):''}</li>`).join('')}</ol><p class="answer-explanation">${esc(q.explanation)}</p>${q.evidence?`<blockquote>${t('textEvidence')}: ${esc(q.evidence)}</blockquote>`:''}</details>`}).join('')}</article>`}
 render();onLanguageChange(render);
}catch(e){error(e)}
