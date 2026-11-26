import {error, getCatalog, progress, quizDrafts, resourceRow, byResourceTitle, compareTitles} from './core.js';
import {initI18n, onLanguageChange, t} from './i18n.js';

const pathway = 'text-based';
const groups = [
  ['central-meaning', 'textCentralMeaning'],
  ['writer-purpose', 'textWriterPurpose'],
  ['information', 'textInformation'],
  ['inference', 'textInference'],
  ['words-references', 'textWordsReferences'],
  ['organization', 'textOrganization'],
];
const bands = ['Pre-A1', 'A1', 'A2', 'B1', 'B1–B2'];
const container = document.querySelector('#resources');

initI18n();

try {
  const catalog = await getCatalog();
  const quizzesBySkill = new Map(groups.map(([code]) => [code, []]));
  for (const quiz of catalog.resources) {
    for (const placement of quiz.placements) {
      if (placement.pathway === pathway) {
        quizzesBySkill.get(placement.skillGroup).push({quiz, level: placement.level});
      }
    }
  }
  const hasUpcomingLevels = [...quizzesBySkill.values()].some(quizzes => quizzes.length < bands.length);

  function render() {
    const openGroups = new Set([...container.querySelectorAll('details[open]')].map(panel => panel.id));
    const record = progress.read();
    const drafts = quizDrafts();
    const sortedGroups = [...groups].sort((a,b) => compareTitles(t(a[1]),t(b[1])));
    container.innerHTML = sortedGroups.map(([code, label]) => {
      const quizzes = [...quizzesBySkill.get(code)].sort((a,b) => byResourceTitle(a.quiz,b.quiz));
      const rows = quizzes.map(({quiz, level}) =>
        resourceRow(quiz, record, drafts, pathway, t('textLevel', {level, band: bands[level - 1]}))
      ).join('');
      return `<details id="${code}" class="topic-fold" ${openGroups.has(code) ? 'open' : ''}>
        <summary><span class="topic-title">${t(label)}</span></summary>
        <div class="topic-fold-body">
          <p>${t(label + 'Desc')}</p>
          ${rows ? `<ul class="simple-resources">${rows}</ul>` : ''}
        </div>
      </details>`;
    }).join('') + (hasUpcomingLevels ? `<p>${t('textUpcoming')}</p>` : '');
  }

  render();
  onLanguageChange(render);
  addEventListener('pageshow', event => { if (event.persisted) render(); });
} catch (e) {
  error(e);
}
