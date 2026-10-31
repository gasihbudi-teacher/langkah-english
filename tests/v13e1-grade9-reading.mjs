import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {validateQuestion,score,isCorrect,isAnswered} from '../js/question-types.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p));
const load=p=>JSON.parse(read(p));
const catalog=load('data/catalog.json');
const lessonMeta=catalog.resources.find(r=>r.id==='grade9-reading');
const quizMeta=catalog.resources.find(r=>r.id==='grade9-place-reading-check');
assert(lessonMeta&&quizMeta,'Grade 9 Lesson 1 and its dedicated assessment must be registered');
assert.equal(lessonMeta.type,'lesson');
assert.deepEqual(lessonMeta.placements,[{pathway:'school',grade:9}]);
assert.equal(lessonMeta.title,'Grade 9: Reading a Place — Descriptive Text');
assert.equal(quizMeta.type,'quiz');
assert.deepEqual(quizMeta.placements,[{pathway:'school',grade:9}]);
assert.deepEqual(quizMeta.relatedLessons,['grade9-reading']);
assert.equal(quizMeta.kind,'test');
assert.equal(quizMeta.examFormat,'topic');

const lesson=load(lessonMeta.file);
assert.equal(lesson.id,'grade9-reading','Stable lesson ID must be preserved');
assert.equal(lesson.objectives.length,4);
assert.deepEqual(lesson.assessments,['grade9-place-reading-check']);
assert.deepEqual(lesson.blocks.slice(0,3).map(b=>b.type),['definition','scaffold','synthesis']);
assert.equal(lesson.blocks.at(-1).type,'vocabulary');
const guide=lesson.blocks.find(b=>b.type==='scaffold');
assert.equal(guide.steps.length,8);
assert.equal(guide.steps.filter(s=>s.check).length,7,'Only meaningful steps should carry optional checks');
assert(guide.steps.every(s=>s.english&&s.indonesian&&s.why));
assert(guide.steps.every(s=>(!!s.check)===(!!s.checkAnswer)),'Checks and reveals must be paired');
assert.equal(new Set(guide.steps.map(s=>s.check).filter(Boolean)).size,7,'Checks must be specific, not repeated generic prompts');
assert(!guide.steps.some(s=>/pada contoh tersebut, apa petunjuk/i.test(s.check||'')),'Generic repeated prompt must not return');
const modelWords=guide.modelEnglish.trim().split(/\s+/).length;
assert(modelWords>=120&&modelWords<=140,`Connected model passage length: ${modelWords}`);
assert(guide.modelIndonesian.length>500);
assert(guide.modelEnglish.includes('Their branches create shade'));
const examples=lesson.blocks.filter(b=>b.type==='example_group').flatMap(b=>b.items);
assert.equal(examples.length,10);
assert.equal(new Set(examples.map(x=>x.english)).size,10);
assert(examples.every(x=>x.english&&x.indonesian&&x.note.length>50));
assert.equal(lesson.blocks.filter(b=>b.type==='checkpoint').length,1);
assert.equal(lesson.blocks.filter(b=>b.type==='self_check').length,1);
assert.equal(lesson.practice.length,4);
assert(lesson.practice.every(q=>q.prompt&&q.choices.length===3&&Number.isInteger(q.answer)&&q.translationId?.prompt));
assert(lesson.blocks.some(b=>b.type==='vocabulary'&&b.items.length>=8));

const quiz=load(quizMeta.file);
assert.equal(quiz.id,'grade9-place-reading-check');
assert.equal(quiz.questionCount,8);
assert.equal(quiz.questions.length,8);
assert.equal(quiz.durationSeconds,480);
assert.equal(quiz.passages.length,1);
assert(quiz.passages[0].text.length>300);
assert.equal(new Set(quiz.questions.map(q=>q.id)).size,8);
for(const q of quiz.questions){
 assert.doesNotThrow(()=>validateQuestion(q),q.id);
 assert.equal(q.questionType||'single','single');
 assert.equal(q.choices.length,3);
 assert(q.translationId?.prompt?.length>8);
 assert(quiz.passages.find(p=>p.id===q.passageId)?.text.includes(q.evidence),`Evidence must be exact: ${q.id}`);
 assert(q.explanation.length>70);
}
const key=quiz.questions.map(q=>q.answer);
assert.deepEqual(key,[0,1,2,0,1,2,0,1]);
assert.deepEqual(score(quiz.questions,key),{correct:8,incorrect:0,unanswered:0,total:8,percentage:100});
assert(quiz.questions.every(q=>isAnswered(q,q.answer)&&isCorrect(q,q.answer)));

// Explicitly protect the Grade 10 recount and shared cross-grade reading resources.
const protectedHashes={
 'data/lessons/grade10-recount.json':'7ef81be8a038d61ac26b316daf0ccfaf994a79224d3917566a61128388658282',
 'data/quizzes/school-reading-check.json':'ab3404f02d50848032ae98c829e89cdd61323d26f99fc5637dff6379c66332ff',
 'data/quizzes/school-reading-practice.json':'fc77507ce859f87c64c2881edaab028c0b39acc1124b844ae8f8144386d93b8a'
};
for(const [file,digest] of Object.entries(protectedHashes))assert.equal(crypto.createHash('sha256').update(read(file)).digest('hex'),digest,`${file} must remain unchanged`);

console.log(`PASS V13-E1: Grade 9 Lesson 1 has ${guide.steps.length} steps (${guide.steps.filter(s=>s.check).length} meaningful optional checks), ${examples.length} worked examples, ${lesson.practice.length} guided practices and a dedicated ${quiz.questionCount}-question evidence-based assessment; Grade 10 recount and shared reading quizzes unchanged.`);
