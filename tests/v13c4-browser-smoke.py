from pathlib import Path
import json,re,asyncio
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parent.parent
JS=ROOT/'js'
MODS=['i18n.js','question-types.mjs','core.js','translations.js']

def module_wrap(name):
 raw=(JS/name).read_text()
 def rewrite(m):
  members=re.sub(r'\b(\w+)\s+as\s+(\w+)',r'\1: \2',m.group(1))
  return f"const {{{members}}}=window.__testModules[{json.dumps(m.group(2).split('/')[-1])}];"
 raw=re.sub(r'^import \{([^}]+)\} from [\'\"]([^\'\"]+)[\'\"];',rewrite,raw,flags=re.M)
 exports=re.findall(r'^export (?:const|function|async function|class|let)\s+(\w+)',raw,re.M)
 raw=re.sub(r'^export ','',raw,flags=re.M)
 return f'''window.__testModules[{json.dumps(name)}]=(()=>{{
 const location=window.__testLocation;
 const localStorage=window.__testStorage;
 const sessionStorage=window.__testSession;
 const history=window.__testHistory;
 {raw}
 return {{{','.join(exports)}}};
}})();'''

def bundle(entry):
 raw=(JS/entry).read_text()
 def rewrite(m):
  members=re.sub(r'\b(\w+)\s+as\s+(\w+)',r'\1: \2',m.group(1))
  return f"const {{{members}}}=window.__testModules[{json.dumps(m.group(2).split('/')[-1])}];"
 raw=re.sub(r'^import \{([^}]+)\} from [\'\"]([^\'\"]+)[\'\"];',rewrite,raw,flags=re.M)
 assert not re.search(r'^import ',raw,re.M),entry
 raw=re.sub(r'^export ','',raw,flags=re.M)
 return '\n'.join(module_wrap(n) for n in MODS)+f'''
 window.__testReady=(async()=>{{
 const location=window.__testLocation;
 const localStorage=window.__testStorage;
 const sessionStorage=window.__testSession;
 const history=window.__testHistory;
 {raw}
 }})();'''

def prepare(page):
 h=(ROOT/page).read_text()
 h=re.sub(r'<script type="module"[^>]*></script>','',h)
 h=h.replace('<link rel="stylesheet" href="css/style.css">','<style>'+(ROOT/'css/style.css').read_text()+'</style>')
 return h

async def setup(page,pathname,entry,query=''):
 await page.set_content(prepare(pathname),wait_until='load')
 init=f'''(()=>{{
 const d={{}};
 function storage(dict){{return {{get length(){{return Object.keys(dict).length}},key(i){{return Object.keys(dict)[i]||null}},getItem(k){{return Object.prototype.hasOwnProperty.call(dict,k)?dict[k]:null}},setItem(k,v){{dict[k]=String(v)}},removeItem(k){{delete dict[k]}},clear(){{for(const k in dict)delete dict[k]}}}}}}
 window.__testStorage=storage(d);window.__testSession=storage({{}});
 window.__testLocation={{search:{json.dumps(query)},hash:'',pathname:{json.dumps('/'+pathname)},href:{json.dumps('https://langkah.test/'+pathname+query)}}};
 window.__testHistory={{replaceState(){{}},pushState(){{}}}};window.__testModules={{}};
 window.__fakeFetch=async path=>{{const data=window.__allData[path];return {{ok:data!==undefined,status:data===undefined?404:200,async json(){{return data}}}}}};
 window.fetch=window.__fakeFetch;
 }})()'''
 await page.evaluate(init)
 data={f.relative_to(ROOT).as_posix():json.loads(f.read_text()) for f in (ROOT/'data').rglob('*.json') if 'schemas' not in f.parts}
 await page.evaluate('(data)=>window.__allData=data',data)
 await page.add_script_tag(content=bundle(entry))
 await page.evaluate('window.__testReady')

async def check_lesson(page,lesson_id,expected_steps):
 await setup(page,'lesson.html','lesson.js','?id='+lesson_id)
 await page.wait_for_selector('.scaffold-step')
 steps=await page.locator('.scaffold-step').count()
 examples=await page.locator('.worked-example').count()
 words=len((await page.locator('.scaffold-model .example-english').inner_text()).split())
 assert (steps,examples)==(expected_steps,10) and 200<=words<=300,(lesson_id,steps,examples,words)
 return {'steps':steps,'examples':examples,'model_words':words}

async def check_quiz(page,quiz_id):
 await setup(page,'quiz.html','quiz.js','?id='+quiz_id)
 await page.locator('#practice').click()
 await page.wait_for_selector('#question .choice')
 single=await page.locator('#question .choice').count()
 await page.locator('#next').click()
 multi=await page.locator('#question [data-multi]').count()
 await page.locator('#next').click()
 category=await page.locator('#question [data-row]').count()
 assert (single,multi,category)==(4,4,9),(quiz_id,single,multi,category)
 return [single,multi,category]

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':390,'height':844})
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  await setup(page,'tka.html','tka.js')
  lessons=await page.locator('#tka-new-lessons .simple-resource').count()
  quizzes=await page.locator('#tka-new-quizzes .simple-resource').count()
  modules=await page.locator('#tka-module-list .tka-module').count()
  stage=await page.locator('.tka-stage').inner_text()
  overflow=await page.evaluate('Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth')
  assert (lessons,quizzes,modules)==(8,8,10),(lessons,quizzes,modules,errors)
  assert 'V13-C4' in stage and overflow==0,(stage,overflow)
  l05=await check_lesson(page,'tka-implied-ideas-audience-purpose-message',11)
  l06=await check_lesson(page,'tka-inference-cause-character-prediction',14)
  q05=await check_quiz(page,'tka-implied-ideas-audience-purpose-message-practice')
  q06=await check_quiz(page,'tka-inference-cause-character-prediction-practice')
  l07=await check_lesson(page,'tka-evaluating-facts-opinions-evidence',12)
  l08=await check_lesson(page,'tka-narrative-appreciation',10)
  q07=await check_quiz(page,'tka-evaluating-facts-opinions-evidence-practice')
  q08=await check_quiz(page,'tka-narrative-appreciation-practice')
  assert not errors,errors
  print(json.dumps({'tka_lessons':lessons,'tka_quizzes':quizzes,'roadmap_modules':modules,'mobile_overflow':overflow,'tka05_lesson':l05,'tka06_lesson':l06,'tka05_quiz_controls':q05,'tka06_quiz_controls':q06,'tka07_lesson':l07,'tka08_lesson':l08,'tka07_quiz_controls':q07,'tka08_quiz_controls':q08,'page_errors':errors},ensure_ascii=False,indent=2))
  await browser.close()

asyncio.run(main())
