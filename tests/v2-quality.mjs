import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const i18nSource=read('js/i18n.js')+'\nexport {dictionary};';
const {dictionary}=await import('data:text/javascript;base64,'+Buffer.from(i18nSource).toString('base64'));
const allKeys=new Set(Object.keys(dictionary.en));
assert.deepEqual(Object.keys(dictionary.en).sort(),Object.keys(dictionary.id).sort(),'Translation key parity');
for(const file of ['index.html','lesson.html','quiz.html','results.html']){
  const contents=read(file);
  for(const key of contents.matchAll(/data-i18n="([^"]+)"/g)) assert.ok(allKeys.has(key[1]),file+' missing translation '+key[1]);
  for(const attr of contents.matchAll(/(?:href|src)="([^#?" ]+)/g)){
    const target=attr[1];if(target.includes('://')||target.startsWith('#'))continue;
    assert.ok(fs.existsSync(path.join(ROOT,target)),file+' broken link to '+target);
  }
  assert.match(contents,/data-lang="en"/);assert.match(contents,/data-lang="id"/);
  assert.match(contents,/\bid="main"/);assert.match(contents,/js\/(home|lesson|quiz|results)\.js/);
  const ids=[...contents.matchAll(/\bid="([a-z0-9-]+)"/gi)].map(x=>x[1]);
  assert.equal(ids.length,new Set(ids).size,file+' duplicate ID');
}
for(const file of ['js/home.js','js/lesson.js','js/quiz.js','js/results.js']){
  const source=read(file);
  for(const k of source.matchAll(/\bt\('([A-Za-z]+)'/g))assert.ok(allKeys.has(k[1]),file+' undefined translation '+k[1]);
}
const catalog=JSON.parse(read('data/catalog.json'));
assert.equal(catalog.resources.length,9);
assert.equal(catalog.resources.filter(x=>x.type==='lesson').length,5);
assert.equal(catalog.resources.filter(x=>x.type==='quiz').length,4);
assert.ok(read('js/core.js').includes("'langkah.progress.v1'"),'Old progress key retained');
assert.ok(read('js/quiz.js').includes("'langkah.draft.'"),'Old draft key retained');
console.log('PASS: complete bilingual dictionary parity, HTML asset links, DOM IDs, catalog integrity, original progress/draft keys.');
