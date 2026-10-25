// Portable, versioned user-owned backup of local progress. No network requests.
const allowedId=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const validDate=v=>Number.isSafeInteger(v)&&v>0;
const smallString=(v,n=12000)=>typeof v==='string'&&v.length<=n;
const validQuestion=q=>object(q)&&smallString(q.id,100)&&smallString(q.prompt)&&Array.isArray(q.choices)&&q.choices.length>=2&&q.choices.length<=8&&q.choices.every(x=>smallString(x))&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.choices.length&&smallString(q.explanation);
const validAttempt=a=>object(a)&&smallString(a.attemptId,100)&&allowedId.test(a.resourceId)&&smallString(a.title,500)&&validDate(a.at)&&['practice','simulation'].includes(a.mode)&&Number.isSafeInteger(a.elapsed)&&a.elapsed>=0&&a.elapsed<1e8&&Array.isArray(a.questions)&&a.questions.length>=1&&a.questions.length<=100&&a.questions.every(validQuestion)&&Array.isArray(a.answers)&&a.answers.length===a.questions.length&&a.answers.every((v,i)=>v===null||(Number.isInteger(v)&&v>=0&&v<a.questions[i].choices.length))&&Array.isArray(a.passages)&&a.passages.length<=100&&a.passages.every(p=>object(p)&&smallString(p.id,100)&&smallString(p.title,400)&&smallString(p.text,100000))&&(!a.flags||Array.isArray(a.flags)&&a.flags.length===a.questions.length&&a.flags.every(v=>typeof v==='boolean'))&&object(a.result)&&Number.isInteger(a.result.correct)&&Number.isInteger(a.result.incorrect)&&Number.isInteger(a.result.unanswered)&&Number.isInteger(a.result.total)&&a.result.total===a.questions.length&&Number.isInteger(a.result.percentage)&&a.result.percentage>=0&&a.result.percentage<=100;
export function parseBackup(input){
  const b=typeof input==='string'?JSON.parse(input):input;
  if(!object(b)||b.format!=='langkah-progress-backup'||b.version!==1||!object(b.progress)||!object(b.drafts))throw Error('Unknown backup format');
  const p=b.progress;
  if(!object(p.lessons)||!Array.isArray(p.attempts)||p.attempts.length>100||!Array.isArray(p.activity)||p.activity.length>30)throw Error('Invalid progress structure');
  if(Object.keys(p.lessons).length>500||!Object.entries(p.lessons).every(([id,date])=>allowedId.test(id)&&validDate(date)))throw Error('Invalid lesson dates');
  if(!p.attempts.every(validAttempt)||!p.activity.every(a=>object(a)&&smallString(a.title,500)&&validDate(a.at)&&smallString(a.kind,200)))throw Error('Invalid activity/attempt');
  if(Object.keys(b.drafts).length>100)throw Error('Too many drafts');
  for(const [id,d] of Object.entries(b.drafts)){
    if(!allowedId.test(id)||!object(d)||!['practice','simulation'].includes(d.mode)||!smallString(d.quizSnapshot,1000000)||!Array.isArray(d.answers)||!Array.isArray(d.flags)||d.answers.length>100||d.answers.length!==d.flags.length||!d.flags.every(v=>typeof v==='boolean')||!Number.isInteger(d.index)||d.index<0||d.index>=d.answers.length||!validDate(d.start)||!(d.deadline===null||d.deadline===undefined||validDate(d.deadline))||!d.answers.every(v=>v===null||(Number.isInteger(v)&&v>=0&&v<=7)))throw Error('Invalid quiz draft');
    const snapshot=JSON.parse(d.quizSnapshot);
    if(snapshot.id!==id||!Array.isArray(snapshot.questions)||snapshot.questions.length!==d.answers.length||!snapshot.questions.every(validQuestion)||!d.answers.every((v,i)=>v===null||v<snapshot.questions[i].choices.length))throw Error('Draft quiz does not match');
  }
  return {format:b.format,version:b.version,exportedAt:b.exportedAt,progress:p,drafts:b.drafts};
}
export function makeBackup(localStorage,progress){
  const drafts=Object.create(null);
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(!key?.startsWith('langkah.draft.'))continue;
    const id=key.slice('langkah.draft.'.length);
    if(allowedId.test(id)){try{drafts[id]=JSON.parse(localStorage.getItem(key))}catch{/* Ignore corrupted old drafts, preserve valid completed progress. */}}
  }
  const source={format:'langkah-progress-backup',version:1,exportedAt:new Date().toISOString(),progress,drafts};
  return parseBackup(source);
}
