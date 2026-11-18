import {getCatalog,esc,link,progress,error,quizDrafts,icon} from './core.js';
import {t,initI18n,onLanguageChange,language} from './i18n.js';
import {setupBackup} from './backup.js';

initI18n();
try{
  const catalog=await getCatalog();
  const resources=catalog.resources;
  const priority=r=>Number.isInteger(r.order)?r.order:1000;
  const sorted=(a,b)=>priority(a)-priority(b)||a.title.localeCompare(b.title);

  function renderHome(){
    const p=progress.read();
    const lessonProgress=p.lessons||{};
    const attempts=Array.isArray(p.attempts)?p.attempts:[];
    const completed=resources.filter(r=>r.type==='lesson'&&lessonProgress[r.id]).length;
    const lessonCount=resources.filter(r=>r.type==='lesson').length;
    const average=attempts.length
      ? Math.round(attempts.reduce((sum,a)=>sum+(a.result?.percentage||0),0)/attempts.length)+'%'
      : '—';
    const stats=document.querySelector('#stats');
    if(stats){
      const values=[[completed,'statLessons'],[attempts.length,'statExams'],[average,'statAverage'],[lessonCount?Math.round(completed/lessonCount*100)+'%':'0%','statProgress']];
      stats.innerHTML=values.map(([value,key])=>`<div class="stat"><strong>${value}</strong><span>${t(key)}</span></div>`).join('');
    }

    const drafts = [...quizDrafts()].map(([id,draft]) => ({
      resource: resources.find(r => r.id === id && r.type === 'quiz'), draft
    })).filter(item => item.resource).sort((a,b) => b.draft.start - a.draft.start);
    const lastLesson = resources.filter(r => r.type === 'lesson' && lessonProgress[r.id])
      .sort((a,b) => lessonProgress[b.id] - lessonProgress[a.id])[0];
    const lastAttempt = attempts[0];
    const continueSection=document.querySelector('#continue-section');
    const continuePanel=document.querySelector('#continue');
    const hasProgress=Boolean(drafts.length || lastLesson || lastAttempt || p.activity?.length);
    continueSection.hidden=!hasProgress;
    document.querySelector('.home-hero').hidden = hasProgress;
    if (hasProgress) {
      let title, href, description, action;
      if (drafts.length) {
        const {resource} = drafts[0];
        title = resource.title;
        href = link(resource.id,'quiz') + '#resume';
        description = 'draftIntro';
        action = 'resume';
      } else if (lastAttempt?.attemptId && (!lastLesson || lastAttempt.at >= lessonProgress[lastLesson.id])) {
        title = lastAttempt.title;
        href = 'results.html?attempt=' + encodeURIComponent(lastAttempt.attemptId);
        description = 'reviewIntro';
        action = 'openReview';
      } else if (lastLesson) {
        const primary = lastLesson.placements[0];
        const course = resources.filter(r => r.type === 'lesson' && r.placements[0].pathway === primary.pathway &&
          r.placements[0].grade === primary.grade).sort(sorted);
        const following = course.slice(course.findIndex(r => r.id === lastLesson.id) + 1)
          .find(r => !lessonProgress[r.id]);
        const target = following || lastLesson;
        title = target.title;
        href = link(target.id);
        description = following ? 'lessonIntroNext' : 'lessonReopen';
        action = following ? 'continueAction' : 'reopen';
      } else {
        const item = resources.find(r => r.id === lastAttempt?.resourceId || r.title === p.activity?.[0]?.title)
          || resources.find(r => r.id === 'parts-of-speech');
        title = item.title;
        href = link(item.id,item.type);
        action = 'continueAction';
      }
      continuePanel.innerHTML = `<div class="hero-copy continue-panel">
        <p class="hero-overline">${icon('history')}${t('continueKicker')}</p>
        <h2>${esc(title)}</h2>${description ? `<p class="hero-lead">${t(description)}</p>` : ''}
        <div class="hero-actions"><a class="button" href="${esc(href)}">${t(action)}${icon('arrow')}</a></div>
      </div>`;
    } else {
      continuePanel.replaceChildren();
    }

    const activity=document.querySelector('#activity');
    if(activity){
      const items=Array.isArray(p.activity)?p.activity:[];
      activity.innerHTML=items.length
        ? items.slice(0,6).map(item=>`<div class="activity-row"><span class="activity-marker">${item.kind?.startsWith('Lesson')?'✓':'◎'}</span><div><strong>${esc(item.title)}</strong><small>${item.kind?.startsWith('Lesson')?t('lessonCompleted'):t('examActivity')}${item.kind?.startsWith('Examination:')?' · '+esc(item.kind.slice('Examination:'.length).trim()):''} · ${new Date(item.at).toLocaleDateString(language()==='id'?'id-ID':'en-US')}</small></div></div>`).join('')
        : `<p class="muted" style="padding:18px 0">${t('noActivity')}</p>`;
    }
  }

  setupBackup(renderHome);
  renderHome();
  onLanguageChange(renderHome);
  const progressDetails=document.querySelector('#my-progress');
  if(progressDetails&&location.hash==='#my-progress')progressDetails.open=true;
  addEventListener('hashchange',()=>{
    if(progressDetails&&location.hash==='#my-progress')progressDetails.open=true;
  });
}catch(e){error(e)}
