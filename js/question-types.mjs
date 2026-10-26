/** V13-B question contracts and unofficial exact-match scoring. No browser dependencies. */
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const nonempty=s=>typeof s==='string'&&s.trim().length>0;
const distinct=values=>new Set(values).size===values.length;
export const questionType=q=>q?.questionType??'single';
const validOptions=v=>Array.isArray(v)&&v.length>=2&&v.length<=8&&v.every(nonempty)&&distinct(v);

export function validateQuestion(q){
 if(!q||typeof q!=='object'||!nonempty(q.id)||!nonempty(q.prompt)||!nonempty(q.explanation))throw Error('Pertanyaan harus memiliki ID, prompt dan penjelasan.');
 const type=questionType(q);
 if(!['single','multiple','category'].includes(type))throw Error('Jenis soal tidak dikenal: '+type);
 if(type==='category'){
  if(own(q,'choices')||own(q,'answer')||own(q,'answers')||!Array.isArray(q.categories)||q.categories.length<2||q.categories.length>6||!q.categories.every(nonempty)||!distinct(q.categories)||!Array.isArray(q.statements)||q.statements.length<2||q.statements.length>12)throw Error('Format kategori tidak valid.');
  for(const s of q.statements)if(!s||!nonempty(s.text)||!q.categories.includes(s.answerCategory)||('explanation' in s&&!nonempty(s.explanation)))throw Error('Baris atau jawaban kategori tidak valid.');
  if(q.translationId?.categories&&(!Array.isArray(q.translationId.categories)||q.translationId.categories.length!==q.categories.length||!q.translationId.categories.every(nonempty)))throw Error('Terjemahan kategori tidak sesuai.');
  if(q.translationId?.statements&&(!Array.isArray(q.translationId.statements)||q.translationId.statements.length!==q.statements.length||!q.translationId.statements.every(nonempty)))throw Error('Terjemahan pernyataan tidak sesuai.');
 }else{
  if(!validOptions(q.choices)||own(q,'categories')||own(q,'statements'))throw Error('Pilihan jawaban tidak valid.');
  if(type==='single'){
   if(own(q,'answers')||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.choices.length)throw Error('Kunci pilihan tunggal tidak valid.');
  }else if(own(q,'answer')||!Array.isArray(q.answers)||q.answers.length<2||q.answers.length>q.choices.length||!q.answers.every(i=>Number.isInteger(i)&&i>=0&&i<q.choices.length)||!distinct(q.answers))throw Error('Kunci pilihan jamak tidak valid.');
  if(q.choiceExplanations&&(!Array.isArray(q.choiceExplanations)||q.choiceExplanations.length!==q.choices.length||!q.choiceExplanations.every(nonempty)))throw Error('Penjelasan tiap pilihan tidak valid.');
  if(q.translationId?.choices&&(!Array.isArray(q.translationId.choices)||q.translationId.choices.length!==q.choices.length||!q.translationId.choices.every(nonempty)))throw Error('Terjemahan pilihan tidak sesuai.');
 }
 if(q.translationId&& (typeof q.translationId!=='object'||Array.isArray(q.translationId)||('prompt' in q.translationId&&!nonempty(q.translationId.prompt))))throw Error('Terjemahan pertanyaan tidak valid.');
 return true;
}
/** Accept partial category responses for draft storage, but do not count them as answered. */
export function validResponse(q,a){
 const type=questionType(q);
 if(a===null)return true;
 if(type==='single')return Number.isInteger(a)&&a>=0&&a<q.choices.length;
 if(!Array.isArray(a))return false;
 if(type==='multiple')return a.length<=q.choices.length&&a.every(i=>Number.isInteger(i)&&i>=0&&i<q.choices.length)&&distinct(a);
 if(type==='category')return a.length===q.statements.length&&a.every(v=>v===null||q.categories.includes(v));
 return false;
}
export function isAnswered(q,a){
 if(!validResponse(q,a)||a===null)return false;
 const type=questionType(q);
 return type==='single'||type==='multiple'&&a.length>0||type==='category'&&a.every(v=>v!==null);
}
export function isCorrect(q,a){
 if(!isAnswered(q,a))return false;
 const type=questionType(q);
 if(type==='single')return a===q.answer;
 if(type==='multiple')return a.length===q.answers.length&&a.every(v=>q.answers.includes(v));
 return a.every((v,i)=>v===q.statements[i].answerCategory);
}
export function score(questions,answers){
 if(!Array.isArray(questions)||!questions.length||!Array.isArray(answers)||answers.length!==questions.length)throw Error('Soal dan jawaban tidak sesuai.');
 let correct=0,unanswered=0;
 questions.forEach((q,i)=>{if(!isAnswered(q,answers[i]))unanswered++;else if(isCorrect(q,answers[i]))correct++});
 return {correct,incorrect:questions.length-correct-unanswered,unanswered,total:questions.length,percentage:Math.round(correct/questions.length*100)};
}
