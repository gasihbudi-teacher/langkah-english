import assert from 'node:assert/strict';
import fs from 'node:fs';

const catalog = JSON.parse(fs.readFileSync('data/catalog.json', 'utf8'));
const renderer = fs.readFileSync('js/quiz.js', 'utf8');
const results = fs.readFileSync('js/results.js', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');
const expectedAnswers = [0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4];
const cases = [
  {
    grade: 10,
    id: 'grade10-asas-functional-language-test-1',
    duration: 2700,
    difficulty: 'Intermediate',
    titles: [
      'OPINIONS, AGREEMENT, AND DISAGREEMENT',
      'SUGGESTIONS AND ADVICE',
      'REQUESTS, OFFERS, AND INVITATIONS',
      'APOLOGIES, THANKS, COMPLIMENTS, AND CONGRATULATIONS',
      'CLARIFICATION, PREFERENCES, AND POSSIBILITY',
    ],
    skills: [
      'Giving an Opinion','Agreeing with an Opinion','Disagreeing Politely','Asking for an Opinion',
      'Giving Advice','Making a Suggestion','Responding to a Suggestion','Giving Advice',
      'Making a Polite Request','Offering Help','Accepting an Invitation','Declining an Invitation Politely',
      'Responding to an Apology','Responding to Thanks','Responding to a Compliment','Responding to Congratulations',
      'Asking for Clarification','Asking Someone to Repeat','Expressing a Preference','Expressing Possibility',
    ],
  },
  {
    grade: 11,
    id: 'grade11-asas-functional-language-test-1',
    duration: 3000,
    difficulty: 'Advanced',
    titles: [
      'OPINIONS, AGREEMENT, AND DISAGREEMENT',
      'SUGGESTIONS AND ADVICE',
      'REQUESTS, OFFERS, AND INVITATIONS',
      'APOLOGIES, THANKS, COMPLIMENTS, AND CONGRATULATIONS',
      'CLARIFICATION, PREFERENCES, AND POSSIBILITY',
    ],
    skills: [
      'Qualified Agreement','Polite Disagreement','Expressing a Tentative Opinion','Expressing Reservation',
      'Giving Advice','Making a Suggestion','Giving Cautious Advice','Responding to a Suggestion',
      'Making a Polite Request','Offering Assistance','Accepting a Formal Invitation','Declining an Invitation Politely',
      'Responding to an Apology','Responding to Gratitude','Responding to a Compliment','Responding to Congratulations',
      'Asking for Clarification','Asking for Further Explanation','Expressing a Preference','Expressing Probability',
    ],
  },
  {
    grade: 12,
    id: 'grade12-asas-functional-language-test-1',
    duration: 3300,
    difficulty: 'Advanced',
    titles: [
      'NUANCED OPINIONS AND DISCUSSION',
      'SUGGESTIONS AND ADVICE',
      'FORMAL REQUESTS, OFFERS, AND INVITATIONS',
      'APOLOGIES, THANKS, COMPLIMENTS, AND CONGRATULATIONS',
      'CLARIFICATION, PREFERENCES, AND PROBABILITY',
    ],
    skills: [
      'Qualified Agreement','Tactful Disagreement','Expressing a Tentative Opinion','Acknowledging a Concern',
      'Giving Diplomatic Advice','Making a Practical Suggestion','Responding to a Suggestion with Reservation','Giving a Recommendation',
      'Making a Formal Request','Offering Assistance','Accepting a Formal Invitation','Declining an Invitation Politely',
      'Responding to an Apology','Responding Modestly to Thanks','Responding to a Compliment','Responding to Congratulations',
      'Asking for Clarification','Checking Understanding','Expressing a Considered Preference','Expressing Probability',
    ],
  },
];

for (const test of cases) {
  const data = JSON.parse(fs.readFileSync(`data/quizzes/${test.id}.json`, 'utf8'));
  const entry = catalog.resources.find(resource => resource.id === test.id);
  assert.ok(entry, `${test.id} must be registered in the catalog`);
  assert.equal(entry.type, 'quiz');
  assert.equal(entry.kind, 'test');
  assert.equal(entry.difficulty, test.difficulty);
  assert.equal(entry.estimatedMinutes, test.duration / 60);
  assert.ok(entry.tags.includes('Functional Language'));
  assert.ok(entry.tags.includes('Everyday Communication'));
  assert.deepEqual(entry.placements, [{ pathway: 'sas', grade: test.grade, semester: 1 }]);
  assert.equal(entry.file, `data/quizzes/${test.id}.json`);
  assert.equal(data.id, test.id);
  assert.equal(data.questionCount, 20);
  assert.equal(data.questions.length, 20);
  assert.equal(data.durationSeconds, test.duration);
  assert.deepEqual(data.passages, []);
  assert.equal(data.sections.length, 5);
  assert.deepEqual(data.sections.map(section => section.title), test.titles);
  assert.deepEqual(data.sections.map(section => [section.questionStart, section.questionEnd]), [[1,4],[5,8],[9,12],[13,16],[17,20]]);
  assert.deepEqual(data.questions.map(question => question.answer), expectedAnswers);
  assert.deepEqual(data.questions.map(question => question.explanation.match(/^Skill: ([^.]+)\./)?.[1]), test.skills);
  for (const question of data.questions) {
    assert.equal(question.choices.length, 5);
    assert.ok(question.prompt.includes('\n'), `${test.id}/${question.id} must preserve speaker turns`);
    assert.ok(question.explanation.startsWith('Skill: '), `${test.id}/${question.id} must retain its skill label in the answer discussion`);
    assert.ok(question.explanation.includes('\n\nPenjelasan: '));
    assert.equal('skill' in question, false, 'communication skills belong in post-answer discussions');
    assert.equal('topic' in question, false, 'do not add a pre-answer topic badge');
    assert.equal('passageId' in question, false);
    assert.equal('evidence' in question, false);
    assert.equal('translationId' in question, false, 'retain the source English dialogue without adding answer-cue translations');
  }
}

assert.match(renderer, /quiz-section-context/);
assert.match(renderer, /sections:d\.sections\|\|\[\]/);
assert.match(results, /a\.sections\?\.find/);
assert.match(css, /\.question-panel h2\s*\{[^}]*white-space:\s*pre-line/s, 'speaker turns must render on separate lines');
console.log('PASS: three ASAS Functional Language Test 1 quizzes, source answer keys, answer-discussion skills, sections, and speaker-turn layout.');
