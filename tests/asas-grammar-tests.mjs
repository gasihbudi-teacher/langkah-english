import assert from 'node:assert/strict';
import fs from 'node:fs';

const catalog = JSON.parse(fs.readFileSync('data/catalog.json', 'utf8'));
const renderer = fs.readFileSync('js/quiz.js', 'utf8');
const results = fs.readFileSync('js/results.js', 'utf8');
const validator = fs.readFileSync('tools/validate.py', 'utf8');

const cases = [
  { grade: 10, id: 'grade10-asas-grammar-test-1', duration: 2700, answers: [0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4] },
  { grade: 11, id: 'grade11-asas-grammar-test-1', duration: 3000, answers: [0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4] },
  { grade: 12, id: 'grade12-asas-grammar-test-1', duration: 3300, answers: [0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4] },
];

for (const test of cases) {
  const data = JSON.parse(fs.readFileSync(`data/quizzes/${test.id}.json`, 'utf8'));
  const entry = catalog.resources.find(resource => resource.id === test.id);
  assert.ok(entry, `${test.id} must be registered in the catalog`);
  assert.equal(entry.type, 'quiz');
  assert.equal(entry.kind, 'test');
  assert.deepEqual(entry.placements, [{ pathway: 'sas', grade: test.grade, semester: 1 }]);
  assert.equal(entry.file, `data/quizzes/${test.id}.json`);
  assert.equal(data.id, test.id);
  assert.equal(data.questionCount, 20);
  assert.equal(data.questions.length, 20);
  assert.equal(data.durationSeconds, test.duration);
  assert.deepEqual(data.passages, []);
  assert.equal(data.sections.length, 5);
  assert.deepEqual(data.sections.map(section => [section.questionStart, section.questionEnd]), [[1,4],[5,8],[9,12],[13,16],[17,20]]);
  assert.deepEqual(data.questions.map(question => question.answer), test.answers);
  for (const question of data.questions) {
    assert.equal(question.choices.length, 5);
    assert.ok(question.translationId?.prompt, `${test.id}/${question.id} needs Indonesian prompt support`);
    assert.ok(question.explanation.startsWith('Grammar focus:'));
    assert.equal('skill' in question, false, 'grammar focus must remain in the post-answer explanation');
    assert.equal('topic' in question, false, 'do not add a topic badge before answering');
    assert.equal('passageId' in question, false);
    assert.equal('evidence' in question, false);
    assert.equal('translationId' in question && 'choices' in question.translationId, false, 'keep grammar-form choices in English');
  }
}

assert.match(renderer, /quiz-section-context/);
assert.match(renderer, /sections:d\.sections\|\|\[\]/);
assert.match(results, /a\.sections\?\.find/);
assert.match(validator, /quiz_section_errors/);
console.log('PASS: three ASAS Grammar Test 1 quizzes, section rendering, translations, and answer indices.');
