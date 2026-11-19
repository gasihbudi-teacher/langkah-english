import {resource,params,esc,blocks,formatIdText,link,progress,error,icon,pathIllustration} from './core.js';
import {t,initI18n,onLanguageChange,language} from './i18n.js';
import {translationDetails} from './translations.js';
initI18n();
try{
  const {meta:m,data:d,catalog:c}=await resource(params.get('id'),'lesson');
  document.title=m.title+' · Langkah English';
  const practiceAnswers=new Map();
  const guidedAnswers=new Map();
  const sort=(a,b)=>(a.order??1000)-(b.order??1000)||a.title.localeCompare(b.title);
  const primary=m.placements[0];
  const pathLabels={grammar:'navGrammar',school:'navSchool',utbk:'navUtbk',tka:'navTka'};
  const pathUrl=Object.hasOwn(pathLabels,primary.pathway) ? primary.pathway+'.html' : 'index.html';
  const backUrl=pathUrl+(primary.pathway==='school' && primary.grade ? '#grade-'+encodeURIComponent(primary.grade) : '');
  const same=c.resources.filter(r=>r.type==='lesson'&&r.placements.some(x=>x.pathway===primary.pathway&&(primary.pathway!=='school'||x.grade===primary.grade))).sort(sort);
  const here=same.findIndex(x=>x.id===m.id);
  const previous=here>0?same[here-1]:null;
  const following=here>=0&&here<same.length-1?same[here+1]:null;
  const assessments=(d.assessments||[]).map(id=>c.resources.find(r=>r.id===id&&r.type==='quiz')).filter(Boolean);
  const related=(m.relatedLessons||[]).map(id=>c.resources.find(r=>r.id===id)).filter(Boolean);
  const prerequisite=(m.prerequisites||[]).map(id=>c.resources.find(r=>r.id===id&&r.type==='lesson')).filter(Boolean);
  function render(){
    const oldIndex = document.querySelector('.reader-index');
    const showIndex = oldIndex ? oldIndex.open : matchMedia('(min-width: 760px)').matches;
    document.querySelector('#content').innerHTML=`<article class="reading" data-track="${esc(primary.pathway)}">
    <a href="${esc(backUrl)}" class="page-back">← ${t('backPath')}</a>
    <div class="reading-intro">
      <div class="reading-path">${pathIllustration(primary.pathway)}<span>${t(pathLabels[primary.pathway])}${primary.grade ? ' · '+t('grade')+' '+esc(primary.grade) : ''}</span></div>
      <h1>${esc(m.title)}</h1><p>${esc(m.description)}</p>
      <div class="learning-meta"><span>${esc(t('difficulty'+m.difficulty))}</span>${m.estimatedMinutes?`<span>${icon('clock')} ${esc(m.estimatedMinutes)} ${t('minute')}</span>`:''}<span>${t('unofficial')}</span></div>
    </div>
    <div class="article-body lesson-opening">${blocks(d.blocks.filter(b=>b.type==='definition'))}</div>
    <details class="panel objectives-panel"><summary>${t('objectives')}</summary><ul>${d.objectives.map(o=>`<li lang="id">${formatIdText(o)}</li>`).join('')}</ul></details>
    ${prerequisite.length?`<div class="notice">${t('prerequisite')}: ${prerequisite.map(r=>`<a href="${link(r.id,r.type)}">${esc(r.title)}</a>`).join(', ')}</div>`:''}
    <div class="article-body">${blocks(d.blocks.filter(b=>b.type!=='definition'&&b.type!=='vocabulary'))}</div>
    <section aria-label="${t('tryIt')}"><h2>${t('tryIt')}</h2><p class="lesson-practice-instruction" lang="id">${t('lessonPracticeInstruction')}</p><div id="practice"></div></section>
    <div class="article-body lesson-vocabulary">${blocks(d.blocks.filter(b=>b.type==='vocabulary'))}</div>
    <section class="panel complete-box"><h2>${t('nextStep')}</h2>${assessments.map(r=>`<p><a class="button button-outline" href="${link(r.id,'quiz')}">${esc(r.title)} ${icon('arrow')}</a></p>`).join('')}
    <div class="toolbar"><button type="button" id="complete">${icon('check')} ${t('completeLesson')}</button></div><p id="completion" role="status" class="muted"></p></section>
    <nav class="lesson-links" aria-label="${t('related')}">${previous?`<a href="${link(previous.id)}" class="button button-outline">← ${t('previousLesson')}</a>`:'<span></span>'}${following?`<a href="${link(following.id)}" class="button button-outline">${t('nextLesson')} →</a>`:''}</nav>
    ${related.length?`<section class="panel"><h2>${t('related')}</h2>${related.map(r=>`<p><a href="${link(r.id,r.type)}">${esc(r.title)} ${icon('arrow')}</a></p>`).join('')}</section>`:''}</article>`;


    // V10 reader tools operate on the rendered V9 blocks without changing lesson content.
    const reading=document.querySelector('#content .reading');
    const intro=reading.querySelector('.reading-intro');
    const targets=[
      ['readOverview',reading.querySelector('.concept-definition')],
      ['readGuide',reading.querySelector('.scaffold-guide')],
      ['readExamples',reading.querySelector('.example-section')],
      ['readPractice',reading.querySelector('#practice')],
      ['readVocabulary',reading.querySelector('.lesson-vocabulary')],
      ['readNext',reading.querySelector('.complete-box')]
    ].filter(([,element])=>element);
    for(const [key,element] of targets)if(!element.id)element.id='read-'+key;
    const tools=document.createElement('nav');tools.className='lesson-tools';
    tools.setAttribute('aria-label',t('readingContents'));
    tools.innerHTML=`<details class="reader-index" ${showIndex?'open':''}><summary><span class="lesson-tools-text">${t('readingContents')}</span></summary><div class="lesson-toc">${targets.map(([key,element])=>`<a href="#${element.id}">${t(key)}</a>`).join('')}</div></details><button class="focus-button" type="button" aria-pressed="false"></button>`;
    intro.insertAdjacentElement('afterend',tools);
    const focusButton=tools.querySelector('.focus-button');
    const activeFocus=()=>{
      focusButton.textContent=document.body.classList.contains('focus-reading')?t('exitFocus'):t('focusMode');
      focusButton.setAttribute('aria-pressed',String(document.body.classList.contains('focus-reading')));
    };
    activeFocus();focusButton.addEventListener('click',()=>{document.body.classList.toggle('focus-reading');activeFocus();});
    if(!document.querySelector('#reading-progress')){
      const bar=document.createElement('div');bar.id='reading-progress';bar.setAttribute('aria-hidden','true');bar.innerHTML='<span></span>';document.body.append(bar);
    }
    const updateReadingProgress=()=>{
      const rect=reading.getBoundingClientRect();
      const total=Math.max(1,reading.offsetHeight-innerHeight*.55);
      const passed=Math.min(total,Math.max(0,-rect.top+innerHeight*.28));
      const bar=document.querySelector('#reading-progress span');if(bar)bar.style.width=Math.round(passed/total*100)+'%';
    };
    if(window.__langkahReadingScrollHandler){removeEventListener('scroll',window.__langkahReadingScrollHandler);removeEventListener('resize',window.__langkahReadingScrollHandler);}
    window.__langkahReadingScrollHandler=()=>requestAnimationFrame(updateReadingProgress);
    addEventListener('scroll',window.__langkahReadingScrollHandler,{passive:true});addEventListener('resize',window.__langkahReadingScrollHandler);
    updateReadingProgress();

    // Guided checks are formative only: no exam score, no persistence, no time pressure.
    document.querySelectorAll('[data-guided-check]').forEach(box=>{
      const output=box.querySelector('.checkpoint-result');const correct=Number(box.querySelector('[data-check-answer]').dataset.checkAnswer);
      const id=box.dataset.guidedCheck;
      const showAnswer=(choice)=>{
        box.querySelectorAll('[data-check-choice]').forEach(other=>other.setAttribute('aria-pressed',String(Number(other.dataset.checkChoice)===choice)));
        output.hidden=false;output.dataset.correct=String(choice===correct);
        output.innerHTML=`<strong>${t(choice===correct?'guidedRight':'guidedRetry')}</strong> ${box.querySelector('.checkpoint-solution').innerHTML}`;
      };
      box.querySelectorAll('[data-check-choice]').forEach(button=>button.addEventListener('click',()=>{
        const choice=Number(button.dataset.checkChoice);
        guidedAnswers.set(id,choice);showAnswer(choice);
      }));
      if(guidedAnswers.has(id))showAnswer(guidedAnswers.get(id));
      const hint=box.querySelector('[data-check-hint]'),tip=box.querySelector('.checkpoint-hint-text');
      hint.addEventListener('click',()=>{tip.hidden=!tip.hidden;hint.setAttribute('aria-expanded',String(!tip.hidden))});
    });
    const target=document.querySelector('#practice');
    if(!(d.practice||[]).length)target.innerHTML=`<p class="muted">${t('noPractice')}</p>`;
    (d.practice||[]).forEach((q,i)=>{const section=document.createElement('div');section.className='panel';section.innerHTML=`<h3>${i+1}. ${esc(q.prompt)}</h3>${translationDetails(q)}<div class="choices" role="group" aria-label="${t('question')} ${i+1}">${q.choices.map((v,n)=>`<button type="button" class="choice" data-answer="${n}" aria-pressed="${practiceAnswers.get(q.id)===n}">${esc(v)}</button>`).join('')}</div><p class="inline-feedback" role="status" hidden></p>`;
      const feedback=section.querySelector('[role="status"]');const showFeedback=()=>{const value=practiceAnswers.get(q.id);feedback.hidden=!Number.isInteger(value);feedback.dataset.correct=String(value===q.answer);if(!feedback.hidden)feedback.innerHTML='<strong>'+esc(value===q.answer?t('correct'):t('notQuite'))+'</strong> '+formatIdText(q.explanation)};section.querySelectorAll('[data-answer]').forEach(btn=>btn.onclick=()=>{practiceAnswers.set(q.id,Number(btn.dataset.answer));section.querySelectorAll('[data-answer]').forEach(x=>x.setAttribute('aria-pressed',String(x===btn)));showFeedback()});showFeedback();target.append(section)});
    const completion=document.querySelector('#completion');function status(){if(progress.read().lessons?.[m.id])completion.textContent=t('alreadyComplete');else completion.textContent=''}status();document.querySelector('#complete').onclick=()=>{if(!progress.read().lessons?.[m.id])progress.complete(m.id,m.title);completion.textContent=t('justComplete')};
  }
  render();onLanguageChange(render);
}catch(e){error(e)}
