import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateQuestion,questionType,validResponse,isAnswered,isCorrect,score} from '../js/question-types.mjs';
import {parseBackup,makeBackup} from '../js/backup-format.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const sample=read('./fixtures/v13b-mixed-formats.json');
const [single,multiple,category]=sample.questions;
for(const q of sample.questions)assert.ok(validateQuestion(q));
assert.equal(questionType({}), 'single');
assert.equal(isCorrect(single,1),true);
assert.equal(isCorrect(single,0),false);
assert.equal(isCorrect(multiple,[2,0]),true,'order must not affect MCMA correctness');
assert.equal(isCorrect(multiple,[0]),false);
assert.equal(isCorrect(multiple,[0,1,2]),false);
assert.equal(isAnswered(multiple,[]),false);
assert.equal(isAnswered(category,['Supported',null,'Not supported']),false);
assert.equal(isCorrect(category,['Supported','Not supported','Not supported']),true);
assert.equal(isCorrect(category,['Supported','Supported','Not supported']),false);
assert.equal(validResponse(category,['Supported',null,'Not supported']),true);
assert.equal(validResponse(category,['Supported','FALSE','Not supported']),false);
const good=[1,[0,2],['Supported','Not supported','Not supported']];
assert.deepEqual(score(sample.questions,good),{correct:3,incorrect:0,unanswered:0,total:3,percentage:100});
assert.deepEqual(score(sample.questions,[1,[0],['Supported',null,'Not supported']]),{correct:1,incorrect:1,unanswered:1,total:3,percentage:33});
assert.deepEqual(score(sample.questions,[null,[],[null,null,null]]),{correct:0,incorrect:0,unanswered:3,total:3,percentage:0});
const invalid=[
 {...multiple,answers:[0,0]}, {...multiple,answers:[0,4]}, {...multiple,answer:0},
 {...category,statements:[...category.statements.slice(0,2),{text:'Broken',answerCategory:'Unknown'}]},
 {...category,choices:['A','B']}, {...single,questionType:'mystery'},
 {...single,answer:4}, {...single,choices:['same','same']},
 {...category,translationId:{statements:['too short']}}
];
for(const q of invalid)assert.throws(()=>validateQuestion(q),`Invalid model was accepted: ${q.id}`);
assert.throws(()=>score(sample.questions,[0]));
const at=1710000000000;
const attempt={attemptId:'unit-check',resourceId:'tka-engine-fixture',title:'Fixture only',at,mode:'practice',elapsed:23,questions:sample.questions,answers:good,flags:[false,true,false],passages:sample.passages,result:score(sample.questions,good)};
const progress={lessons:{'reading-bridge':at},attempts:[attempt],activity:[{title:'Fixture only',kind:'Examination',at}]};
const draft={quizSnapshot:JSON.stringify(sample),mode:'practice',answers:[1,[0,2],['Supported',null,'Not supported']],flags:[false,false,true],index:2,start:at,deadline:null};
const data={format:'langkah-progress-backup',version:1,exportedAt:new Date().toISOString(),progress,drafts:{'tka-engine-fixture':draft}};
assert.deepEqual(parseBackup(data).progress.attempts[0].answers,good);
const storage={length:1,key:i=>'langkah.draft.tka-engine-fixture',getItem:()=>JSON.stringify(draft)};
assert.deepEqual(makeBackup(storage,progress).drafts['tka-engine-fixture'].answers,draft.answers);
assert.throws(()=>parseBackup({...data,drafts:{'tka-engine-fixture':{...draft,answers:[1,[99],null]}}}));
assert.throws(()=>parseBackup({...data,progress:{...progress,attempts:[{...attempt,answers:[1,[0,0],good[2]]}]}}));
// Legacy records and unversioned questions remain importable unchanged.
const old=read('../data/quizzes/grammar-foundations.json');
const oldAttempt={...attempt,resourceId:old.id,questions:old.questions,answers:old.questions.map(q=>q.answer),result:score(old.questions,old.questions.map(q=>q.answer)),flags:old.questions.map(()=>false)};
assert.ok(parseBackup({...data,progress:{...progress,attempts:[oldAttempt]},drafts:{}}));
console.log('PASS V13-B: 3 formats, exact-set/row scoring, unanswered detection, invalid keys, draft/backup round trips, legacy records.');
