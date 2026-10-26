import {resource,params,esc,score,progress,time,error} from './core.js';
import {questionType,isAnswered,isCorrect,validResponse} from './question-types.mjs';
import {t,initI18n,onLanguageChange} from './i18n.js';
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
 function renderIntro(){phase='intro';content.innerHTML=`<article class="exam-intro">
  <a class="page-back" href="${back[m.placements[0].pathway]||'index.html'}">← ${t('backPath')}</a>
  <span class="section-kicker">${t('quizWelcome')}</span><h1>${esc(m.title)}</h1><p>${esc(m.description)}</p>
  <div class="learning-meta"><span class="badge">${presentation()}</span><span class="badge badge-mint">${t('quizCount',{n:count})}</span><span class="badge badge-sun">${d.durationSeconds?t('quizMinutes',{n:d.durationSeconds/60}):t('quizNoTimer')}</span></div>
  <div class="notice">${t('quizNotice')} ${m.examFormat!=='full'&&d.referenceFormat?t('referenceInfo',{n:d.referenceFormat.questionCount,minutes:d.referenceFormat.durationSeconds/60}):''}</div>
  <p class="quiz-language-note">${t('quizEnglishNotice')}</p><p class="muted">${t('simulationLanguageNote')}</p><p class="muted">${t('tkaScoringRule')}</p>
  <h2>${t('quizModes')}</h2><div class="mode-grid"><section class="mode-card"><span class="mode-icon">✎</span><h3>${t('practiceMode')}</h3><p>${t('practiceDetails')}</p><button class="button" id="practice" type="button">${t('startPractice')} ↗</button></section><section class="mode-card"><span class="mode-icon">◷</span><h3>${t('simulationMode')}</h3><p>${t('simulationDetails')}</p><button class="button" id="simulation" type="button">${t('startSimulation')} ↗</button></section></div>
  ${draft?`<div class="panel"><div class="continue-panel"><div><strong>${t('continueTitle')}</strong><p>${t('quizModesHint')}</p></div><button id="resume" type="button">${t('resumeSaved')} ↗</button></div></div>`:''}
  <p class="muted" style="font-size:13px;margin-top:20px">${t('quizModesHint')}</p></article>`;
  document.querySelector('#practice').onclick=()=>begin('practice');document.querySelector('#simulation').onclick=()=>begin('simulation');if(draft)document.querySelector('#resume').onclick=()=>begin(draft.mode,true);
 }
 function save(){try{localStorage.setItem(draftKey,JSON.stringify({quizSnapshot:JSON.stringify(d),mode,answers,flags,index,start,deadline}))}catch{const el=document.querySelector('#save-status');if(el)el.textContent=t('saveFailure')}}
 function begin(chosen,resume=false){if(tick)clearInterval(tick);finished=false;phase='active';mode=chosen;
  if(resume){({answers,flags,index,start,deadline}=draft);index=Math.min(Math.max(0,index),count-1)}
  else{answers=Array(count).fill(null);flags=Array(count).fill(false);index=0;start=Date.now();deadline=mode==='simulation'&&d.durationSeconds?start+d.durationSeconds*1000:null}
  revealed.clear();if(deadline&&deadline<=Date.now()){finish();return}renderActive();clock();if(!finished)tick=setInterval(clock,1000);
 }
 function renderActive(){phase='active';content.innerHTML=`<div class="exam-header"><span class="section-kicker">${t('unofficial')} · ${t(mode==='practice'?'practiceMode':'simulationMode')}</span><h1>${esc(m.title)}</h1><div class="toolbar exam-toolbar"><span id="position"></span><span class="spacer timer" id="timer" role="timer"></span><button id="submit" type="button">${t('finishExam')}</button></div><progress id="progress" max="${count}" value="0" aria-label="${t('answered')}"></progress><p id="save-status" class="muted" role="status" style="font-size:11px;margin:2px 0 0">${t('saveStatus')}</p></div>
  <div class="quizgrid"><section id="passage" class="panel passage" aria-label="${t('readingPassage')}"></section><section class="panel question-panel"><div id="question"></div><div class="toolbar"><button id="prev" class="button button-outline" type="button">← ${t('previous')}</button><button id="next" class="button button-outline" type="button">${t('next')} →</button><button id="flag" class="button button-outline" type="button">${t('flag')}</button></div></section></div><section class="panel navigator-panel"><h2>${t('navigator')}</h2><p class="muted" style="font-size:12px">${t('navHint')}</p><nav class="numbers" id="numbers" aria-label="${t('navigator')}"></nav></section>`;
  document.querySelector('#prev').onclick=()=>{index--;renderQuestion()};document.querySelector('#next').onclick=()=>{index++;renderQuestion()};document.querySelector('#flag').onclick=()=>{flags[index]=!flags[index];renderQuestion()};
  document.querySelector('#submit').onclick=()=>{document.querySelector('#submit-message').textContent=t('submitMessage',{n:answeredCount(),total:count});document.querySelector('#submit-dialog').showModal()};
  document.querySelector('#cancel-submit').onclick=()=>document.querySelector('#submit-dialog').close();document.querySelector('#confirm-submit').onclick=finish;
  renderQuestion();showTime();
 }
 function clock(){if(finished||phase!=='active')return;const remaining=deadline?Math.max(0,Math.ceil((deadline-Date.now())/1000)):null;showTime(remaining);if(deadline&&remaining===0)finish()}
 function showTime(remaining){const el=document.querySelector('#timer');if(!el)return;if(remaining===undefined)remaining=deadline?Math.max(0,Math.ceil((deadline-Date.now())/1000)):null;el.textContent=remaining===null?t('elapsed')+' '+time(Math.max(0,Math.floor((Date.now()-start)/1000))):t('remaining')+' '+time(remaining)}
 function inputHtml(q,a){const type=questionType(q),n=index;
  if(type==='single')return `<div class="choices" role="group" aria-label="${t('question')} ${n+1}">${q.choices.map((v,i)=>`<button type="button" class="choice" data-answer="${i}" aria-pressed="${a===i}">${String.fromCharCode(65+i)}. ${esc(v)}</button>`).join('')}</div>`;
  if(type==='multiple')return `<p class="response-hint">${t('multiInstruction')}</p><fieldset class="tka-response"><legend class="sr-only">${t('multiInstruction')}</legend>${q.choices.map((v,i)=>`<label class="tka-option"><input type="checkbox" data-multi="${i}" ${Array.isArray(a)&&a.includes(i)?'checked':''}><span>${String.fromCharCode(65+i)}. ${esc(v)}</span></label>`).join('')}</fieldset>`;
  return `<p class="response-hint">${t('categoryInstruction')}</p><div class="category-rows">${q.statements.map((s,j)=>`<fieldset class="tka-response tka-category"><legend>${j+1}. ${esc(s.text)}</legend><div class="category-controls">${q.categories.map((v,k)=>`<label class="tka-option"><input type="radio" name="category-${n}-${j}" data-row="${j}" value="${k}" ${Array.isArray(a)&&a[j]===v?'checked':''}><span>${esc(v)}</span></label>`).join('')}<button type="button" class="clear-row" data-clear-row="${j}">${t('clearRow')}</button></div></fieldset>`).join('')}</div>`;
 }
 function feedbackHtml(q,a){let rows='';const type=questionType(q);
  if(type==='single'||type==='multiple'){
   const correct=new Set(type==='single'?[q.answer]:q.answers),chosen=new Set(type==='single'?[a]:a);
   rows=`<p><strong>${t('correctAnswer')}:</strong> ${q.choices.filter((_,i)=>correct.has(i)).map(esc).join(' · ')}</p>`;
   if(q.choiceExplanations)rows+=`<ul class="feedback-rows">${q.choices.map((v,i)=>`<li>${String.fromCharCode(65+i)}. ${esc(v)} ${correct.has(i)?'✓':''}${chosen.has(i)?' · '+t('yourChoice'):''}<br>${esc(q.choiceExplanations[i])}</li>`).join('')}</ul>`;
  }else rows=`<ul class="feedback-rows">${q.statements.map((s,j)=>`<li>${esc(s.text)}<br><strong>${t('correctAnswer')}:</strong> ${esc(s.answerCategory)} · <strong>${t('yourChoice')}:</strong> ${esc(a[j])}${s.explanation?`<br>${esc(s.explanation)}`:''}</li>`).join('')}</ul>`;
  return `<div class="inline-feedback"><strong>${isCorrect(q,a)?t('correct'):t('notQuite')}</strong>${rows}<p>${esc(q.explanation)}</p>${q.evidence?`<blockquote>${t('textEvidence')}: ${esc(q.evidence)}</blockquote>`:''}</div>`;
 }
 function renderQuestion(){const q=d.questions[index],a=answers[index],passage=d.passages?.find(p=>p.id===q.passageId),complete=isAnswered(q,a);
  document.querySelector('#position').textContent=`${t('question')} ${index+1} / ${count} · ${answeredCount()} ${t('answered')}`;document.querySelector('#progress').value=answeredCount();
  document.querySelector('#passage').innerHTML=passage?`<h2>${t('readingPassage')}: ${esc(passage.title)}</h2><p>${esc(passage.text)}</p>`:`<h2>${t('readCarefully')}</h2><p>${t('readTip')}</p>`;
  document.querySelector('#question').innerHTML=`<h2 id="question-title" tabindex="-1">${index+1}. ${esc(q.prompt)}</h2>${mode==='practice'?translationDetails(q):''}${inputHtml(q,a)}<button id="clear-response" class="button button-outline clear-answer" type="button" ${a===null?'disabled':''}>${t('clearAnswer')}</button>${mode==='practice'&&complete?`<button id="explain" class="button button-outline" type="button">${t('checkAnswer')}</button><div id="feedback" role="status"></div>`:''}`;
  const update=(value,focusSelector)=>{answers[index]=value;revealed.delete(index);renderQuestion();if(focusSelector)document.querySelector(focusSelector)?.focus()};
  document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>update(Number(b.dataset.answer)));
  document.querySelectorAll('[data-multi]').forEach(el=>el.onchange=()=>{const current=Array.isArray(answers[index])?answers[index]:[];const value=Number(el.dataset.multi);update(el.checked?[...current,value].sort((x,y)=>x-y):current.filter(x=>x!==value),`[data-multi="${value}"]`)});
  document.querySelectorAll('[data-row]').forEach(el=>el.onchange=()=>{const current=Array.isArray(answers[index])?answers[index]:Array(q.statements.length).fill(null);const next=[...current];next[Number(el.dataset.row)]=q.categories[Number(el.value)];update(next,`[data-row="${el.dataset.row}"][value="${el.value}"]`)});
  document.querySelectorAll('[data-clear-row]').forEach(b=>b.onclick=()=>{const current=Array.isArray(answers[index])?answers[index]:Array(q.statements.length).fill(null);const next=[...current];next[Number(b.dataset.clearRow)]=null;update(next,`[data-clear-row="${b.dataset.clearRow}"]`)});
  document.querySelector('#clear-response').onclick=()=>update(null);
  const explain=document.querySelector('#explain');if(explain)explain.onclick=()=>{revealed.add(index);document.querySelector('#feedback').innerHTML=feedbackHtml(q,answers[index])};if(explain&&revealed.has(index))explain.click();
  document.querySelector('#prev').disabled=index===0;document.querySelector('#next').disabled=index===count-1;document.querySelector('#flag').textContent=t(flags[index]?'unflag':'flag');document.querySelector('#flag').setAttribute('aria-pressed',String(flags[index]));
  document.querySelector('#numbers').innerHTML=d.questions.map((item,i)=>`<button type="button" class="${isAnswered(item,answers[i])?'answered ':''}${flags[i]?'flagged':''}" data-index="${i}" ${i===index?'aria-current="true"':''} aria-label="${t('question')} ${i+1}${isAnswered(item,answers[i])?', '+t('answered'):''}${flags[i]?', '+t('flagged'):''}">${i+1}</button>`).join('');
  document.querySelectorAll('[data-index]').forEach(b=>b.onclick=()=>{index=Number(b.dataset.index);renderQuestion();document.querySelector('#question-title').focus()});save();
 }
 function finish(){if(finished)return;finished=true;clearInterval(tick);const elapsed=Math.max(0,Math.floor((Math.min(deadline||Date.now(),Date.now())-start)/1000));const a={attemptId:globalThis.crypto?.randomUUID?.()||String(Date.now()),resourceId:m.id,pathway:m.placements?.[0]?.pathway||'grammar',title:m.title,at:Date.now(),mode,elapsed,answers:structuredClone(answers),flags:[...flags],questions:d.questions,passages:d.passages||[],result:score(d.questions,answers)};progress.save(a);try{localStorage.removeItem(draftKey);sessionStorage.setItem('langkah.last',JSON.stringify(a))}catch{}location.href='results.html?attempt='+encodeURIComponent(a.attemptId)}
 renderIntro();onLanguageChange(()=>{if(phase==='intro')renderIntro();else if(phase==='active'){renderActive();clock()}});
}catch(e){error(e)}
