import assert from 'node:assert/strict';
import fs from 'node:fs';

const catalog = JSON.parse(fs.readFileSync('data/catalog.json', 'utf8'));
const renderer = fs.readFileSync('js/quiz.js', 'utf8');
const results = fs.readFileSync('js/results.js', 'utf8');
const validator = fs.readFileSync('tools/validate.py', 'utf8');
const expectedAnswers = [0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4];
const expectedSkills = [
  'Meaning in Context','Meaning in Context','Meaning in Context','Meaning in Context',
  'Synonym','Synonym','Antonym','Antonym',
  'Word Formation','Word Formation','Word Formation','Word Formation',
  'Phrasal Verb','Phrasal Verb','Phrasal Verb','Collocation',
  'Phrasal Expression','Expression in Context','Commonly Confused Words','Commonly Confused Words'
];
const cases = [
  { grade:10, id:'grade10-asas-vocabulary-test-1', duration:2700, skills:expectedSkills },
  { grade:11, id:'grade11-asas-vocabulary-test-1', duration:3000, skills:[
    'Meaning in Context','Meaning in Context','Meaning in Context','Meaning in Context',
    'Synonym','Synonym','Antonym','Antonym',
    'Word Formation','Word Formation','Word Formation','Word Formation',
    'Phrasal Verb','Collocation','Phrasal Verb','Collocation',
    'Expression in Context','Expression in Context','Commonly Confused Words','Commonly Confused Words'
  ]},
  { grade:12, id:'grade12-asas-vocabulary-test-1', duration:3300, skills:[
    'Meaning in Context','Meaning in Context','Meaning in Context','Meaning in Context',
    'Synonym','Synonym','Antonym','Antonym',
    'Word Formation','Word Formation','Word Formation','Word Formation',
    'Collocation','Collocation','Phrasal Verb','Collocation',
    'Expression in Context','Expression in Context','Commonly Confused Words','Commonly Confused Words'
  ]},
];

for (const test of cases) {
  const data = JSON.parse(fs.readFileSync(`data/quizzes/${test.id}.json`, 'utf8'));
  const entry = catalog.resources.find(resource => resource.id === test.id);
  assert.ok(entry, `${test.id} must be registered in the catalog`);
  assert.equal(entry.type, 'quiz');
  assert.equal(entry.kind, 'test');
  assert.deepEqual(entry.placements, [{ pathway:'sas', grade:test.grade, semester:1 }]);
  assert.equal(entry.file, `data/quizzes/${test.id}.json`);
  assert.equal(data.id, test.id);
  assert.equal(data.questionCount, 20);
  assert.equal(data.questions.length, 20);
  assert.equal(data.durationSeconds, test.duration);
  assert.deepEqual(data.passages, []);
  assert.equal(data.sections.length, 5);
  assert.deepEqual(data.sections.map(section => [section.questionStart, section.questionEnd]), [[1,4],[5,8],[9,12],[13,16],[17,20]]);
  assert.deepEqual(data.questions.map(question => question.answer), expectedAnswers);
  assert.deepEqual(data.questions.map(question => question.explanation.match(/^Skill: ([^.]+)\./)?.[1]), test.skills);
  for (const question of data.questions) {
    assert.equal(question.choices.length, 5);
    assert.ok(question.explanation.startsWith('Skill: '), `${test.id}/${question.id} must retain its skill label in the answer discussion`);
    assert.equal('skill' in question, false, 'the source says vocabulary skills belong in answer discussions, not beside questions');
    assert.equal('topic' in question, false, 'do not add a topic badge before answering');
    assert.equal('passageId' in question, false);
    assert.equal('evidence' in question, false);
    assert.equal('translationId' in question, false, 'avoid translating vocabulary prompts in a way that could reveal the target word meaning');
  }
}

assert.match(renderer, /quiz-section-context/);
assert.match(renderer, /sections:d\.sections\|\|\[\]/);
assert.match(results, /a\.sections\?\.find/);
assert.match(validator, /quiz_section_errors/);
console.log('PASS: three ASAS Vocabulary Test 1 quizzes, section rendering, answer-discussion skill labels, and answer indices.');
