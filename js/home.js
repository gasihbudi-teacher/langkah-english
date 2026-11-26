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
    const average = attempts.length ? Math.round(attempts.reduce((sum, attempt) =>
      sum + (attempt.result?.percentage || 0), 0) / attempts.length) + '%' : '—';
    document.querySelector('#stats').innerHTML = [[attempts.length, 'statExams'], [average, 'statAverage']]
      .map(([value, key]) => `<div class="stat"><strong>${value}</strong><span>${t(key)}</span></div>`).join('');

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
      continuePanel.innerHTML = `<a class="dashboard-action" href="${esc(href)}">
        <span class="dashboard-action-icon">${icon('history')}</span>
        <span class="dashboard-action-copy"><small>${t(action)}</small><strong>${esc(title)}</strong>${description ? `<small>${t(description)}</small>` : ''}</span>
        <span class="dashboard-arrow">${icon('arrow')}</span>
      </a>`;
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
  addEventListener('pageshow', renderHome);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) renderHome();
  });
}catch(e){error(e)}
