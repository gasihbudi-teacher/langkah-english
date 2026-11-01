import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const load=p=>JSON.parse(read(p));
const cat=load('data/catalog.json');
const i18nSource=read('js/i18n.js')+'\nexport {dictionary};';
const {dictionary}=await import('data:text/javascript;base64,'+Buffer.from(i18nSource).toString('base64'));
assert.deepEqual(Object.keys(dictionary.en).sort(),Object.keys(dictionary.id).sort(),'EN/ID interface dictionaries must remain in parity');
for(const k of ['mainNavigation','homeLink','interfaceLanguage','levelBeginner','levelIntermediate','levelAdvanced','difficultyBeginner','difficultyIntermediate','difficultyAdvanced','lessonPracticeInstruction','modelTranslationLabel','checkpointInstruction','checkpointEnglishVersion','checkpointChoiceHelp','reflectionEnglishVersion','explanationHeading','learningSections','modelPassage','guidedLearning','questionGroup','answerPractice','visualSupport','tkaOrientationKicker','tkaModulesKicker','tkaSupportKicker','tkaRoadmapKicker','tkaPracticeKicker','tkaSimulationsKicker'])assert.ok(dictionary.id[k],`Missing Indonesian language-support key ${k}`);
assert.match(read('js/i18n.js'),/let current='id'/,'First-visit interface language must be Indonesian');
assert.match(read('js/i18n.js'),/data-i18n-aria/,'Accessible labels must follow the selected interface language');

const lessons=cat.resources.filter(r=>r.type==='lesson');
const quizzes=cat.resources.filter(r=>r.type==='quiz');
assert.equal(lessons.length,66);assert.equal(quizzes.length,57);
let steps=0,stepTranslations=0,checks=0,models=0,modelTranslations=0,exampleItems=0,exampleTranslations=0;
let checkpoints=0,checkpointTranslations=0,checkpointChoiceTranslations=0,reflections=0,reflectionTranslations=0,selfChecks=0,selfCheckTranslations=0;
const englishInstructionStart=/^(?:read\b|write\b|choose\b|which\b|what\b|how\b|why\b|select\b|identify\b|find\b|describe\b|compare\b|explain\b|use\b|independent transfer\b)/i;
function walk(blocks){
 for(const b of blocks||[]){
  if(b.type==='scaffold'){
   if(b.modelEnglish){models++;if(b.modelIndonesian?.trim())modelTranslations++;}
   for(const s of b.steps||[]){steps++;if(s.indonesian?.trim())stepTranslations++;if(s.check){checks++;assert.match(s.check,/\b(?:yang|dan|untuk|dengan|apa|apakah|bolehkah|mana|kapan|mengapa|bagaimana|bahwa|siswa|telah|menghasilkan|banyak|pilihan|pernyataan|baca|pilih|sebutkan|tuliskan|gunakan|jelaskan|tentukan|kutip|berikan|apakah|kalimat|kata|teks|bacaan|rincian|simpulan|penggunaan|tempat|hari|jawaban)\b/i,`English-only scaffold instruction remains: ${s.check}`);assert.match(s.checkAnswer,/\b(?:yang|dan|untuk|dengan|apa|apakah|bolehkah|mana|kapan|mengapa|bagaimana|bahwa|siswa|telah|menghasilkan|banyak|pilihan|pernyataan|baca|pilih|sebutkan|tuliskan|gunakan|jelaskan|tentukan|kutip|berikan|apakah|kalimat|kata|teks|bacaan|rincian|simpulan|penggunaan|tempat|hari|jawaban|tidak|karena|pada|adalah|menunjukkan|berarti|tersebut|menjadi|dengan|berfungsi|menyatakan|merupakan|disebut|menerangkan|menggantikan|membantu|menjelaskan|hasil|kesiapan|dinyatakan|akibat|pemeriksaan|tokohnya|peristiwa|berlangsung|bazar|sekolah|cerita|narator|orang|ketiga|mendukung|berdasarkan|sedangkan|sehingga)\b/i,`English-only scaffold feedback remains: ${s.checkAnswer}`);}}
  }
  if(b.type==='example_group')for(const item of b.items||[]){exampleItems++;if(item.indonesian?.trim())exampleTranslations++;}
  if(b.type==='checkpoint'){
   checkpoints++;if(b.translation?.trim())checkpointTranslations++;
   if(b.translationChoices?.length===b.choices?.length&&b.translationChoices.every(x=>typeof x==='string'&&x.trim()))checkpointChoiceTranslations++;
   assert.ok(b.translation&&!b.translation.startsWith('Pilih jawaban bahasa Inggris yang paling tepat'),`Generic checkpoint translation remains: ${b.id}`);
  }
  if(b.type==='reflection'){reflections++;if(b.translation?.trim())reflectionTranslations++;}
  if(b.type==='self_check'){
   selfChecks++;if(b.modelTranslation?.trim())selfCheckTranslations++;
   assert.ok(!englishInstructionStart.test(b.title||''),`English self-check title remains: ${b.title}`);
   assert.ok(!englishInstructionStart.test(b.prompt||''),`English self-check instruction remains: ${b.prompt}`);
  }
  if(b.type==='reference')walk(b.blocks);
 }
}
for(const r of lessons)walk(load(r.file).blocks);
assert.equal(steps,601);assert.equal(stepTranslations,601,'Every scaffold English example must have visible Indonesian meaning');assert.equal(checks,162,'Purposeful scaffold questions remain optional, with no quota imposed');
assert.equal(models,45);assert.equal(modelTranslations,45,'Every connected model passage must have Indonesian support');
assert.equal(exampleItems,641);assert.equal(exampleTranslations,641,'Every worked-example card must have Indonesian meaning');
assert.equal(checkpoints,65);assert.equal(checkpointTranslations,65);assert.equal(checkpointChoiceTranslations,65);
assert.equal(reflections,65);assert.equal(reflectionTranslations,65);
assert.equal(selfChecks,66);assert.equal(selfCheckTranslations,66);

const core=read('js/core.js');
assert.match(core,/function pairedTranslation\(text\)/);
assert.match(core,/class="lesson-translation"/);
assert.match(core,/pairedTranslation\(step\.indonesian\)/);
assert.match(core,/pairedTranslation\(b\.modelIndonesian\)/);
assert.match(core,/pairedTranslation\(item\.indonesian\)/);
assert.match(core,/pairedTranslation\(b\.modelTranslation\)/);
assert.match(core,/checkpoint-prompt-id" lang="id">\$\{formatIdText\(b\.translation\)\}/);
assert.match(core,/reflection-question" lang="id">\$\{formatIdText\(b\.translation\)\}/);
assert.match(core,/checkpointEnglishVersion/);
assert.match(core,/reflectionEnglishVersion/);
assert.doesNotMatch(core,/function optionalTranslation/,'Teaching translations must not be hidden by default');
assert.match(read('js/lesson.js'),/lessonPracticeInstruction/);
assert.match(read('js/pathway.js'),/t\('level'\+level\)/);
assert.match(read('js/pathway.js'),/t\('difficulty'\+r\.difficulty\)/);
assert.match(read('js/tka.js'),/t\('difficulty'\+r\.difficulty\)/);

// English per-option feedback is retained for the optional English interface but never shown as the default Indonesian explanation.
assert.match(read('js/quiz.js'),/choiceExplanations&&language\(\)==='en'/);
assert.match(read('js/quiz.js'),/s\.explanation&&language\(\)==='en'/);
assert.match(read('js/results.js'),/choiceExplanations&&language\(\)==='en'/);
assert.match(read('js/results.js'),/row\.explanation&&language\(\)==='en'/);
assert.match(read('js/results.js'),/t\('explanationHeading'\)/);

const idMarker=/\b(?:yang|dan|di|ke|dari|untuk|dengan|pada|adalah|ini|itu|kita|siswa|bacaan|kalimat|dapat|akan|sebagai|karena|jika|maka|namun|tetapi|setelah|sebelum|ketika|oleh|dalam|tidak|bukan|sudah|telah|serta|atau|agar|sehingga|pilihan|jawaban|teks|bukti|benar|salah|kata|frasa|bagian|pernyataan|menunjukkan|berarti|merupakan|disebut|tersebut|menerangkan|berfungsi|tujuan|tujuannya|menekankan|keterbatasan|para|kurator|menyusun|mengembangkan|memeriksa|melestarikan|sekaligus|konteks|membuat|membantu|menjelaskan|menggunakan|menyatakan|menggambarkan|menghubungkan|mendukung|mengacu|merujuk|menentukan|menyimpulkan|memperkenalkan|menandai|menguraikan|menerima|tindakan|perbaikan|bentuk|pola|struktur|subjek|verba|objek|nomina|klausa|infinitif|sejajar|alasan|simpulan|kesimpulan|rincian|kelompok|pengunjung|keluarga|anak|tempat|menyediakan|informasi|hasil|proses|langkah|aturan|waktu|tempat|peristiwa|ungkapan|urutan|pertanyaan|instruksi|petunjuk|penjelasan|pembahasan|fakta|opini|klaim|sumber|penulis|pembaca|tokoh|cerita|paragraf|istilah|makna|arti|fungsi|menulis|membaca|menjawab|menilai|memilih|mengenali|membandingkan|menafsirkan|menarik|perbedaan|persamaan|hubungan|menempatkan|mempertahankan|melakukan|dilakukan|digunakan|dijelaskan|disebutkan|diperiksa|dilaporkan|dicatat|diperlukan|diberikan|diketahui|berada|terjadi|menjadi|menurut|refleksi|akhir|menunjukkan|tujuannya|menerangkan|kemudian|sedangkan|saat|selama|terdapat|berdasarkan|sesuai|tepat|benar|salah|perlu|masih|belum|sudah|telah|lebih|kurang|paling|semua|setiap|kedua|pertama|ketiga|terakhir|berikut|sebelumnya|sebab|akibat|meskipun|sementara|apabila|maka|agar|supaya|sehingga|terhadap|sebagai|yakni|yaitu|bahwa|tersebut|mereka|kami|kamu|Anda|dia|ia|saya|guru|sekolah|kegiatan|proyek|laporan|catatan|survei|data|contoh|model|bahasa|Inggris|Indonesia|terjemahan|digunakan|menyebutkan|menyimpulkan|mengembangkan|melestarikan|menekankan)\b/i;
let qCount=0,embeddedCount=0,untranslatedOverall=0;
for(const r of lessons){const d=load(r.file);embeddedCount+=d.practice?.length||0;}
for(const r of quizzes){const qz=load(r.file);for(const q of qz.questions){qCount++;if(!idMarker.test(q.explanation||''))untranslatedOverall++;}}
assert.equal(qCount,522,'Standalone quiz question count must remain unchanged');
assert.equal(qCount+embeddedCount,698,'Standalone and embedded practice inventory must remain unchanged');
assert.equal(untranslatedOverall,0,'Every main quiz explanation shown in Indonesian must be written in Indonesian');

for(const page of ['grammar.html','school.html','search.html','tka.html','utbk.html','lesson.html','quiz.html','results.html']){
 const html=read(page);assert.match(html,/<html lang="id"/);assert.match(html,/data-i18n-aria="mainNavigation"/);assert.match(html,/data-i18n-aria="interfaceLanguage"/);
}
assert.match(read('grammar.html'),/data-i18n="levelBeginner"/);
for(const k of ['tkaOrientationKicker','tkaModulesKicker','tkaSupportKicker','tkaRoadmapKicker','tkaPracticeKicker','tkaSimulationsKicker'])assert.match(read('tka.html'),new RegExp(`data-i18n="${k}"`));
assert.match(read('tka.html'),/Sepuluh modul TKA dan tiga simulasi latihan tersedia/);
console.log(`PASS R4 language-of-instruction: ${lessons.length} lessons, ${steps} scaffold steps (${checks} purposeful checks), ${models} bilingual models, ${exampleItems} bilingual example cards, ${checkpoints} Indonesian-first checkpoints, ${reflections} Indonesian-first reflections, ${selfChecks} Indonesian self-checks, ${qCount} standalone quiz questions + ${embeddedCount} embedded practice items; default-ID feedback and navigation verified.`);
