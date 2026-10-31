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
assert.equal(lesson.blocks[0].type,'definition');
assert.equal(lesson.blocks.at(-1).type,'vocabulary');
const guide=lesson.blocks.find(b=>b.type==='scaffold');
assert(guide,'The lesson needs a model-led reading guide');
assert(guide.title&&guide.intro,'The scaffold has its own authored purpose and introduction');
assert(guide.steps.length>0,'The lesson should include only as many guided moves as the objectives require');
assert(guide.steps.every(s=>s.english&&s.indonesian&&s.why));
assert(guide.steps.every(s=>(!!s.check)===(!!s.checkAnswer)),'Checks and answers must be paired');
assert(guide.steps.some(s=>/which words identify the place/i.test(s.check||'')),'Explicit identification/location evidence must be practised');
assert(guide.steps.some(s=>/learner says|claim/i.test(s.check||'')),'Supported statements and assumptions must be distinguished');
assert(guide.steps.some(s=>/what does .narrow.|context/i.test(s.check||'')),'Vocabulary-in-context inference must be practised');
assert(guide.steps.some(s=>/what can you conclude|purpose/i.test(s.check||'')),'The place purpose/use objective must be practised');
const modelWords=guide.modelEnglish.trim().split(/\s+/).length;
assert(modelWords>=120&&modelWords<=140,`Connected model passage length: ${modelWords}`);
assert(guide.modelIndonesian.length>500);
assert(guide.modelNote.length>20,'The model note must explain why this text is being read');
assert(!lesson.blocks.some(b=>b.type==='example_group'&&b.items.some(x=>guide.modelEnglish.includes(x.english))), 'Worked examples must not simply duplicate the connected model passage');
const selfCheck=lesson.blocks.find(b=>b.type==='self_check');
assert(selfCheck,'The lesson must include an independent transfer task');
assert.match(selfCheck.prompt,/place you know/i);
assert(lesson.practice.length>0,'Guided practice should be present where it adds value');
assert.equal(new Set(lesson.practice.map(q=>q.id)).size,lesson.practice.length);
assert(lesson.practice.every(q=>q.prompt&&q.choices.length>=2&&Number.isInteger(q.answer)&&q.translationId?.prompt));
assert(lesson.blocks.at(-1).items.length>0,'Relevant vocabulary should remain at the end');

const quiz=load(quizMeta.file);
assert.equal(quiz.id,'grade9-place-reading-check');
assert(quiz.questions.length>0);
assert.equal(quiz.questionCount,quiz.questions.length);
assert.equal(quiz.durationSeconds,480);
assert.equal(quiz.passages.length,1);
assert(quiz.passages[0].text.length>300);
assert.equal(new Set(quiz.questions.map(q=>q.id)).size,quiz.questions.length);
for(const q of quiz.questions){
 assert.doesNotThrow(()=>validateQuestion(q),q.id);
 assert.equal(q.questionType||'single','single');
 assert(q.choices.length>=2);
 assert(q.translationId?.prompt?.length>8);
 assert(quiz.passages.find(p=>p.id===q.passageId)?.text.includes(q.evidence),`Evidence must be exact: ${q.id}`);
 assert(q.explanation.length>70);
}
const purposeQuestion=quiz.questions.find(q=>/main purpose/i.test(q.prompt));
assert(purposeQuestion,'The independent assessment must measure the place-purpose objective');
assert.equal(purposeQuestion.answer,1);
const key=quiz.questions.map(q=>q.answer);
assert.deepEqual(score(quiz.questions,key),{correct:quiz.questions.length,incorrect:0,unanswered:0,total:quiz.questions.length,percentage:100});
assert(quiz.questions.every(q=>isAnswered(q,q.answer)&&isCorrect(q,q.answer)));

// Protect the shared cross-grade reading resources; they are outside this lesson revision.
const protectedHashes={
 'data/quizzes/school-reading-check.json':'ab3404f02d50848032ae98c829e89cdd61323d26f99fc5637dff6379c66332ff',
 'data/quizzes/school-reading-practice.json':'fc77507ce859f87c64c2881edaab028c0b39acc1124b844ae8f8144386d93b8a'
};
for(const [file,digest] of Object.entries(protectedHashes))assert.equal(crypto.createHash('sha256').update(read(file)).digest('hex'),digest,`${file} must remain unchanged`);

console.log(`PASS Grade 9 Lesson 1 editorial contract: objective-led scaffold, optional checks, connected model, independent transfer, and evidence-based assessment; no fixed example/check/card quota is enforced.`);
