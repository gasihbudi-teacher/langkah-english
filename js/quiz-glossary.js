import {esc} from './core.js';
import {t} from './i18n.js';

const levels = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function quizGlossary(glossary, quiz) {
  if (glossary.quizId !== quiz.id || !Array.isArray(glossary.sections)) return '';
  const passages = new Map(quiz.passages.map(passage => [passage.id, passage.title]));
  const sections = glossary.sections.map((section, index) => {
    if (!passages.has(section.passageId)) return '';
    const groups = levels.map(level => {
      const entries = section.entries.filter(entry => entry.level === level)
        .sort((a, b) => Number(b.priority) - Number(a.priority));
      if (!entries.length) return '';
      return `<h3>${level}</h3><dl>${entries.map(entry => `
        <div><dt><span lang="en">${esc(entry.expression)}</span>
          ${entry.priority ? `<span class="glossary-priority">${t('quizGlossaryPriority')}</span>` : ''}
        </dt><dd lang="id">${esc(entry.meaningId)}</dd></div>`).join('')}</dl>`;
    }).join('');
    return groups ? `<details class="glossary-section" data-passage="${esc(section.passageId)}">
      <summary><span>${t('quizGlossarySection', {n: index + 1})}</span>
      <span lang="en">${esc(passages.get(section.passageId))}</span></summary>${groups}</details>` : '';
  }).join('');
  return sections ? `<details class="quiz-glossary panel">
    <summary>${t('quizGlossary')}</summary>
    <p>${t('quizGlossaryIntro')}</p>${sections}</details>` : '';
}
