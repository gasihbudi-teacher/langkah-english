import {resource,params,esc,blocks,formatIdText,link,progress,error} from './core.js';
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
  const same=c.resources.filter(r=>r.type==='lesson'&&r.placements.some(x=>x.pathway===primary.pathway&&(primary.pathway!=='school'||x.grade===primary.grade))).sort(sort);
  const here=same.findIndex(x=>x.id===m.id);
  const previous=here>0?same[here-1]:null;
  const following=here>=0&&here<same.length-1?same[here+1]:null;
  const assessments=(d.assessments||[]).map(id=>c.resources.find(r=>r.id===id&&r.type==='quiz')).filter(Boolean);
  const related=(m.relatedLessons||[]).map(id=>c.resources.find(r=>r.id===id)).filter(Boolean);
  const prerequisite=(m.prerequisites||[]).map(id=>c.resources.find(r=>r.id===id&&r.type==='lesson')).filter(Boolean);
  function render(){
    document.querySelector('#content').innerHTML=`<article class="reading">
    <a href="${({grammar:"grammar.html",utbk:"utbk.html",school:"school.html"})[m.placements[0].pathway]}" class="page-back">← ${t('backPath')}</a>
    <div class="reading-intro"><span class="section-kicker">${t('lessonType')} · ${esc(m.difficulty)}</span><h1>${esc(m.title)}</h1><p>${esc(m.description)}</p><div class="learning-meta"><span class="badge">${esc(m.difficulty)}</span>${m.estimatedMinutes?`<span class="badge badge-sun">◷ ${m.estimatedMinutes} ${t('minute')}</span>`:''}<span class="badge badge-mint">${t('unofficial')}</span></div></div>
    <div class="article-body lesson-opening">${blocks(d.blocks.filter(b=>b.type==='definition'))}</div>
    <details class="panel objectives-panel"><summary lang="id">${t('objectives')} · lihat jika diperlukan</summary><ul>${d.objectives.map(o=>`<li lang="id">${formatIdText(o)}</li>`).join('')}</ul></details>
    ${prerequisite.length?`<div class="notice">${t('prerequisite')}: ${prerequisite.map(r=>`<a href="${link(r.id,r.type)}">${esc(r.title)}</a>`).join(', ')}</div>`:''}
    <p class="language-legend" lang="id">Istilah bahasa Inggris, seperti ${formatIdText("[[verb]]")}, ditandai dengan warna khusus. Contoh kalimat bahasa Inggris ditampilkan terpisah dari arti dan penjelasannya dalam bahasa Indonesia.</p>
    <div class="article-body">${blocks(d.blocks.filter(b=>b.type!=='definition'&&b.type!=='vocabulary'))}</div>
    <section aria-label="${t('tryIt')}"><h2>${t('tryIt')}</h2><div id="practice"></div></section>
    <div class="article-body lesson-vocabulary">${blocks(d.blocks.filter(b=>b.type==='vocabulary'))}</div>
    <section class="panel complete-box"><h2>${t('nextStep')}</h2>${assessments.map(r=>`<p><a class="button button-outline" href="${link(r.id,'quiz')}">${esc(r.title)} ↗</a></p>`).join('')}
    <div class="toolbar"><button type="button" id="complete">✓ ${t('completeLesson')}</button></div><p id="completion" role="status" class="muted"></p></section>
    <nav class="lesson-links" aria-label="${t('related')}">${previous?`<a href="${link(previous.id)}" class="button button-outline">← ${t('previousLesson')}</a>`:'<span></span>'}${following?`<a href="${link(following.id)}" class="button button-outline">${t('nextLesson')} →</a>`:''}</nav>
    ${related.length?`<section class="panel"><h2>${t('related')}</h2>${related.map(r=>`<p><a href="${link(r.id,r.type)}">${esc(r.title)} ↗</a></p>`).join('')}</section>`:''}</article>`;


    // Guided checks are formative only: no exam score, no persistence, no time pressure.
    document.querySelectorAll('[data-guided-check]').forEach(box=>{
      const output=box.querySelector('.checkpoint-result');const correct=Number(box.querySelector('[data-check-answer]').dataset.checkAnswer);
      const id=box.dataset.guidedCheck;
      const showAnswer=(choice)=>{
        box.querySelectorAll('[data-check-choice]').forEach(other=>other.setAttribute('aria-pressed',String(Number(other.dataset.checkChoice)===choice)));
        output.hidden=false;output.dataset.correct=String(choice===correct);
        output.innerHTML=`<strong>${choice===correct?'Benar! Bagus, kamu sudah menangkap idenya.':'Belum tepat. Tidak apa-apa, mari lihat alasannya.'}</strong> ${box.querySelector('.checkpoint-solution').innerHTML}`;
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
      const feedback=section.querySelector('[role="status"]');const showFeedback=()=>{const value=practiceAnswers.get(q.id);feedback.hidden=!Number.isInteger(value);if(!feedback.hidden)feedback.innerHTML='<strong>'+esc(value===q.answer?t('correct'):t('notQuite'))+'</strong> '+formatIdText(q.explanation)};section.querySelectorAll('[data-answer]').forEach(btn=>btn.onclick=()=>{practiceAnswers.set(q.id,Number(btn.dataset.answer));section.querySelectorAll('[data-answer]').forEach(x=>x.setAttribute('aria-pressed',String(x===btn)));showFeedback()});showFeedback();target.append(section)});
    const completion=document.querySelector('#completion');function status(){if(progress.read().lessons?.[m.id])completion.textContent=t('alreadyComplete');else completion.textContent=''}status();document.querySelector('#complete').onclick=()=>{if(!progress.read().lessons?.[m.id])progress.complete(m.id,m.title);completion.textContent=t('justComplete')};
  }
  render();onLanguageChange(render);
}catch(e){error(e)}
