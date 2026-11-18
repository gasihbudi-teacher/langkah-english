import {resource,params,esc,score,progress,time,error,icon,pathIllustration} from './core.js';
import {questionType,isAnswered,isCorrect,validResponse} from './question-types.mjs';
import {t,initI18n,onLanguageChange,language} from './i18n.js';
import {translationDetails} from './translations.js';
initI18n();
try{
 const {meta:m,data:d}=await resource(params.get('id'),'quiz');document.title=m.title+' · Langkah English';
 const content=document.querySelector('#content'),count=d.questionCount;
 let mode='practice',answers=[],flags=[],index=0,start=0,deadline=null,tick=null,finished=false,phase='intro';
 const revealed=new Set(),draftKey='langkah.draft.'+m.id;let draft=null;
 try{
  draft=JSON.parse(localStorage.getItem(draftKey));
  if(draft&&(!Array.isArray(draft.answers)||!Array.isArray(draft.flags)||draft.quizSnapshot!==JSON.stringify(d)||draft.answers.length!==count||draft.flags.length!==count||!draft.answers.every((a,i)=>validResponse(d.questions[i],a))||!draft.flags.every(v=>typeof v==='boolean')||!['practice','simulation'].includes(draft.mode)||!Number.isInteger(draft.index)||!Number.isFinite(draft.start)||!(draft.deadline===null||Number.isFinite(draft.deadline))))draft=null;
 }catch{draft=null}
 const answeredCount=()=>answers.filter((a,i)=>isAnswered(d.questions[i],a)).length;
 const back={grammar:'grammar.html',utbk:'utbk.html',school:'school.html',tka:'tka.html'};
 function presentation(){return m.examFormat==='full'?t('quizFull'):m.examFormat==='topic'||m.kind==='test'?t('quizTopic'):t('quizShort')}
 const track=m.placements[0].pathway;
 const trackLabel={grammar:'navGrammar',school:'navSchool',utbk:'navUtbk',tka:'navTka'}[track];
 function renderIntro(){
  phase='intro';
  content.innerHTML=`<article class="exam-intro" data-track="${esc(track)}">
    <a class="page-back" href="${back[track]||'index.html'}">← ${t('backPath')}</a>
    <div class="reading-path">${pathIllustration(track)} ${t(trackLabel)}</div>
    <h1>${esc(m.title)}</h1><p>${esc(m.description)}</p>
    <div class="learning-meta"><span>${presentation()}</span><span>${t('quizCount',{n:count})}</span><span>${icon('clock')} ${d.durationSeconds?t('quizMinutes',{n:d.durationSeconds/60}):t('quizNoTimer')}</span></div>
    ${draft?`<section class="draft-resume"><div><strong>${t('resumeSaved')}</strong><p>${t('draftIntro')}</p></div><button id="resume" type="button">${t('resume')} ${icon('arrow')}</button></section>`:''}
    <h2>${t('quizModes')}</h2><div class="mode-grid">
      <section class="mode-card"><span class="mode-icon">${icon('pen')}</span><h3>${t('practiceMode')}</h3><p>${t('practiceDetails')}</p><button class="button${draft?' button-outline':''}" id="practice" type="button">${t('startPractice')} ${icon('arrow')}</button></section>
      <section class="mode-card"><span class="mode-icon">${icon('clock')}</span><h3>${t('simulationMode')}</h3><p>${t('simulationDetails')}</p><button class="button button-outline" id="simulation" type="button">${t('startSimulation')} ${icon('arrow')}</button></section>
    </div>
    <p class="save-note">${t('quizModesHint')}</p>
    <details class="quiz-rules"><summary>${t('quizRules')}</summary>
      <p>${t('quizEnglishNotice')}</p><p>${t('simulationLanguageNote')}</p><p>${t('tkaScoringRule')}</p>
      <p>${t('quizNotice')} ${m.examFormat!=='full'&&d.referenceFormat?t('referenceInfo',{n:d.referenceFormat.questionCount,minutes:d.referenceFormat.durationSeconds/60}):''}</p>
    </details></article>`;
  document.querySelector('#practice').onclick=()=>begin('practice');
  document.querySelector('#simulation').onclick=()=>begin('simulation');
  if(draft)document.querySelector('#resume').onclick=()=>begin(draft.mode,true);
 }
 function save(){try{localStorage.setItem(draftKey,JSON.stringify({quizSnapshot:JSON.stringify(d),mode,answers,flags,index,start,deadline}))}catch{const el=document.querySelector('#save-status');if(el)el.textContent=t('saveFailure')}}
 function begin(chosen,resume=false){if(tick)clearInterval(tick);finished=false;phase='active';mode=chosen;
  if(resume){({answers,flags,index,start,deadline}=draft);index=Math.min(Math.max(0,index),count-1)}
  else{answers=Array(count).fill(null);flags=Array(count).fill(false);index=0;start=Date.now();deadline=mode==='simulation'&&d.durationSeconds?start+d.durationSeconds*1000:null}
  revealed.clear();if(deadline&&deadline<=Date.now()){finish();return}renderActive();clock();if(!finished)tick=setInterval(clock,1000);
 }
 function goToQuestion(number) {
  const previousPassage=d.questions[index].passageId;
  index=number;
  renderQuestion();
  const target=previousPassage!==d.questions[index].passageId && d.questions[index].passageId ? '#passage summary' : '#question-title';
  document.querySelector(target).focus();
 }
 function requestSubmit(){
  document.querySelector('#submit-message').textContent=t('submitMessage',{n:answeredCount(),total:count});
  document.querySelector('#submit-dialog').showModal();
 }
 function renderActive(){
  phase='active';
  content.innerHTML=`<div class="exam-header" data-track="${esc(track)}">
    <div class="reading-path">${pathIllustration(track)} ${t(trackLabel)} · ${t(mode==='practice'?'practiceMode':'simulationMode')}</div>
    <h1>${esc(m.title)}</h1></div>
    <div class="exam-toolbar" data-mode="${mode}"><span id="position"></span><span class="timer" id="timer" role="timer"></span><button id="submit" class="button-outline" type="button">${t('finishExam')}</button><progress id="progress" max="${count}" value="0" aria-label="${t('answered')}"></progress></div>
    <p id="save-status" class="save-note" role="status">${t('saveStatus')}</p>
    <div class="quizgrid"><section id="passage" class="panel passage" aria-label="${t('readingPassage')}"></section>
    <section class="panel question-panel"><div id="question"></div><div class="toolbar question-actions">
      <button id="prev" class="button button-outline" type="button">← ${t('previous')}</button>
      <button id="next" class="button" type="button"></button>
      <button id="flag" class="button button-outline" type="button"></button></div></section></div>
    <section class="panel navigator-panel"><h2>${t('navigator')}</h2>
      <div class="navigator-key"><span><i class="current-dot"></i>${t('activeQuestion')}</span><span>${icon('check')}${t('answeredState')}</span><span>${icon('flag')}${t('flagged')}</span></div>
      <nav class="numbers" id="numbers" aria-label="${t('navigator')}"></nav></section>`;
  document.querySelector('#prev').onclick=()=>goToQuestion(index-1);
  document.querySelector('#next').onclick=()=>index===count-1 ? requestSubmit() : goToQuestion(index+1);
  document.querySelector('#flag').onclick=()=>{flags[index]=!flags[index];renderQuestion()};
  document.querySelector('#submit').onclick=requestSubmit;
  document.querySelector('#cancel-submit').onclick=()=>document.querySelector('#submit-dialog').close();document.querySelector('#confirm-submit').onclick=finish;
  renderQuestion();showTime();
 }
 function clock(){if(finished||phase!=='active')return;const remaining=deadline?Math.max(0,Math.ceil((deadline-Date.now())/1000)):null;showTime(remaining);if(deadline&&remaining===0)finish()}
 function showTime(remaining){const el=document.querySelector('#timer');if(!el)return;if(remaining===undefined)remaining=deadline?Math.max(0,Math.ceil((deadline-Date.now())/1000)):null;el.textContent=remaining===null?t('elapsed')+' '+time(Math.max(0,Math.floor((Date.now()-start)/1000))):t('remaining')+' '+time(remaining)}
 function answerState(selected,right,reviewed) {
  let key;
  if(reviewed && right) key='rightChoice';
  else if(reviewed && selected) key='tryAgainState';
  else if(selected) key='selectedState';
  if(!key)return '';
  const symbol=key==='tryAgainState'?'history':'check';
  return `<span class="answer-state" data-state="${key}">${icon(symbol)}${t(key)}</span>`;
 }
 function inputHtml(q,a){
  const type=questionType(q),n=index;
  const reviewed=mode==='practice' && revealed.has(index);
  if(type==='single'){
   return `<div class="choices" role="group" aria-label="${t('question')} ${n+1}">${q.choices.map((v,i)=>
    `<button type="button" class="choice" data-answer="${i}" aria-pressed="${a===i}"><span class="answer-letter" aria-hidden="true">${String.fromCharCode(65+i)}</span><span class="answer-copy" lang="en">${esc(v)}</span>${answerState(a===i,q.answer===i,reviewed)}</button>`).join('')}</div>`;
  }
  if(type==='multiple'){
   return `<p class="response-hint">${t('multiInstruction')}</p><fieldset class="tka-response"><legend class="sr-only">${t('multiInstruction')}</legend>${q.choices.map((v,i)=>{
    const selected=Array.isArray(a)&&a.includes(i);
    return `<label class="tka-option"><input type="checkbox" data-multi="${i}" ${selected?'checked':''}><span class="answer-copy" lang="en">${String.fromCharCode(65+i)}. ${esc(v)}</span>${answerState(selected,q.answers.includes(i),reviewed)}</label>`;
   }).join('')}</fieldset>`;
  }
  return `<p class="response-hint">${t('categoryInstruction')}</p><div class="category-rows">${q.statements.map((s,j)=>
   `<fieldset class="tka-response tka-category"><legend lang="en">${j+1}. ${esc(s.text)}</legend><div class="category-controls">${q.categories.map((v,k)=>{
    const selected=Array.isArray(a)&&a[j]===v;
    return `<label class="tka-option"><input type="radio" name="category-${n}-${j}" data-row="${j}" value="${k}" ${selected?'checked':''}><span class="answer-copy" lang="en">${esc(v)}</span>${answerState(selected,v===s.answerCategory,reviewed)}</label>`;
   }).join('')}<button type="button" class="clear-row" data-clear-row="${j}">${t('clearRow')}</button></div></fieldset>`).join('')}</div>`;
 }
 function feedbackHtml(q,a){let rows='';const type=questionType(q);
  if(type==='single'||type==='multiple'){
   const correct=new Set(type==='single'?[q.answer]:q.answers),chosen=new Set(type==='single'?[a]:a);
   rows=`<p><strong>${t('correctAnswer')}:</strong> ${q.choices.filter((_,i)=>correct.has(i)).map(esc).join(' · ')}</p>`;
   if(q.choiceExplanations&&language()==='en')rows+=`<ul class="feedback-rows">${q.choices.map((v,i)=>`<li>${String.fromCharCode(65+i)}. ${esc(v)} ${correct.has(i)?'✓':''}${chosen.has(i)?' · '+t('yourChoice'):''}<br>${esc(q.choiceExplanations[i])}</li>`).join('')}</ul>`;
  }else rows=`<ul class="feedback-rows">${q.statements.map((s,j)=>`<li>${esc(s.text)}<br><strong>${t('correctAnswer')}:</strong> ${esc(s.answerCategory)} · <strong>${t('yourChoice')}:</strong> ${esc(a[j])}${s.explanation&&language()==='en'?`<br>${esc(s.explanation)}`:''}</li>`).join('')}</ul>`;
  return `<div class="inline-feedback" data-correct="${isCorrect(q,a)}"><strong>${isCorrect(q,a)?t('correct'):t('notQuite')}</strong>${rows}<h4>${t('explanationHeading')}</h4><p>${esc(q.explanation)}</p>${q.evidence?`<blockquote>${t('textEvidence')}: ${esc(q.evidence)}</blockquote>`:''}</div>`;
 }
 function renderQuestion(){const q=d.questions[index],a=answers[index],passage=d.passages?.find(p=>p.id===q.passageId),complete=isAnswered(q,a);
  document.querySelector('#position').textContent=`${t('question')} ${index+1} / ${count} · ${answeredCount()} ${t('answered')}`;document.querySelector('#progress').value=answeredCount();
  const source=document.querySelector('#passage');
  source.hidden=!passage;
  if(passage && source.dataset.passage!==passage.id){
   source.dataset.passage=passage.id;
   source.innerHTML=`<a class="passage-jump" href="#question-title">${t('goQuestion')} ↓</a><details open><summary><span class="section-kicker">${t('readingPassage')}</span><strong lang="en">${esc(passage.title)}</strong></summary><p lang="en">${esc(passage.text)}</p></details>`;
  }
  document.querySelector('#question').innerHTML=`${passage?`<a class="passage-jump" href="#passage">↑ ${t('goPassage')}</a>`:''}
    <h2 id="question-title" lang="en" tabindex="-1">${index+1}. ${esc(q.prompt)}</h2>${mode==='practice'?translationDetails(q):''}${inputHtml(q,a)}
    <button id="clear-response" class="button button-outline clear-answer" type="button" ${a===null?'disabled':''}>${t('clearAnswer')}</button>
    ${mode==='practice'&&complete?`<button id="explain" class="button button-outline" type="button">${t('checkAnswer')}</button><div id="feedback" role="status" tabindex="-1">${revealed.has(index)?feedbackHtml(q,a):''}</div>`:''}`;
  const update=(value,focusSelector)=>{answers[index]=value;revealed.delete(index);renderQuestion();if(focusSelector)document.querySelector(focusSelector)?.focus()};
  document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>update(Number(b.dataset.answer),`[data-answer="${b.dataset.answer}"]`));
  document.querySelectorAll('[data-multi]').forEach(el=>el.onchange=()=>{const current=Array.isArray(answers[index])?answers[index]:[];const value=Number(el.dataset.multi);update(el.checked?[...current,value].sort((x,y)=>x-y):current.filter(x=>x!==value),`[data-multi="${value}"]`)});
  document.querySelectorAll('[data-row]').forEach(el=>el.onchange=()=>{const current=Array.isArray(answers[index])?answers[index]:Array(q.statements.length).fill(null);const next=[...current];next[Number(el.dataset.row)]=q.categories[Number(el.value)];update(next,`[data-row="${el.dataset.row}"][value="${el.value}"]`)});
  document.querySelectorAll('[data-clear-row]').forEach(b=>b.onclick=()=>{const current=Array.isArray(answers[index])?answers[index]:Array(q.statements.length).fill(null);const next=[...current];next[Number(b.dataset.clearRow)]=null;update(next,`[data-clear-row="${b.dataset.clearRow}"]`)});
  document.querySelector('#clear-response').onclick=()=>update(null,'#question-title');
  const explain=document.querySelector('#explain');
  if(explain)explain.onclick=()=>{revealed.add(index);renderQuestion();document.querySelector('#feedback').focus()};
  document.querySelector('#prev').disabled=index===0;
  document.querySelector('#next').innerHTML=index===count-1?t('finishExam'):t('next')+' '+icon('arrow');
  document.querySelector('#flag').innerHTML=icon('flag')+' '+t(flags[index]?'unflag':'flag');
  document.querySelector('#flag').setAttribute('aria-pressed',String(flags[index]));
  document.querySelector('#numbers').innerHTML=d.questions.map((item,i)=>`<button type="button" class="${isAnswered(item,answers[i])?'answered ':''}${flags[i]?'flagged':''}" data-index="${i}" ${i===index?'aria-current="true"':''} aria-label="${t('question')} ${i+1}${isAnswered(item,answers[i])?', '+t('answered'):''}${flags[i]?', '+t('flagged'):''}"><span>${i+1}</span><span class="nav-symbols" aria-hidden="true">${isAnswered(item,answers[i])?icon('check'):''}${flags[i]?icon('flag'):''}</span></button>`).join('');
  document.querySelectorAll('[data-index]').forEach(b=>b.onclick=()=>goToQuestion(Number(b.dataset.index)));save();
 }
 function finish(){if(finished)return;finished=true;clearInterval(tick);const elapsed=Math.max(0,Math.floor((Math.min(deadline||Date.now(),Date.now())-start)/1000));const a={attemptId:globalThis.crypto?.randomUUID?.()||String(Date.now()),resourceId:m.id,pathway:m.placements?.[0]?.pathway||'grammar',title:m.title,at:Date.now(),mode,elapsed,answers:structuredClone(answers),flags:[...flags],questions:d.questions,passages:d.passages||[],result:score(d.questions,answers)};progress.save(a);try{localStorage.removeItem(draftKey);sessionStorage.setItem('langkah.last',JSON.stringify(a))}catch{}location.href='results.html?attempt='+encodeURIComponent(a.attemptId)}
 renderIntro();
 if(location.hash==='#resume' && draft)begin(draft.mode,true);
 onLanguageChange(()=>{if(phase==='intro')renderIntro();else if(phase==='active'){renderActive();clock()}});
}catch(e){error(e)}
