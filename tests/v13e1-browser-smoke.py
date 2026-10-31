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

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  desktop=await browser.new_page(viewport={'width':1440,'height':1000})
  errors=[]
  desktop.on('pageerror',lambda e:errors.append(str(e)))
  await setup(desktop,'lesson.html','lesson.js','?id=grade9-reading')
  await desktop.locator('.scaffold-guide').wait_for()
  title=await desktop.locator('article.reading h1').inner_text()
  steps=await desktop.locator('.scaffold-step').count()
  checks=await desktop.locator('.scaffold-review').count()
  examples=await desktop.locator('.worked-example').count()
  practices=await desktop.locator('#practice .panel').count()
  model=await desktop.locator('.scaffold-model').inner_text()
  assert 'Reading a Place' in title,title
  assert (steps,checks,examples,practices)==(8,7,10,4),(steps,checks,examples,practices)
  assert 'Our School Garden' in model and 'science room' in model
  await desktop.locator('[data-guided-check="guided-grade9-reading"] [data-check-choice="0"]').click()
  feedback=await desktop.locator('[data-guided-check="guided-grade9-reading"] .checkpoint-result').inner_text()
  assert 'Benar' in feedback,feedback
  await desktop.locator('#practice [data-answer="0"]').first.click()
  practice_feedback=await desktop.locator('#practice .inline-feedback').first.inner_text()
  assert 'Benar' in practice_feedback,practice_feedback
  lesson_overflow=await desktop.evaluate('Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth')
  assert lesson_overflow==0,lesson_overflow
  await desktop.screenshot(path='/mnt/data/v13e1-grade9-lesson-desktop.png',full_page=True)

  quiz_page=await browser.new_page(viewport={'width':1440,'height':1000})
  quiz_errors=[]
  quiz_page.on('pageerror',lambda e:quiz_errors.append(str(e)))
  await setup(quiz_page,'quiz.html','quiz.js','?id=grade9-place-reading-check')
  await quiz_page.locator('.exam-intro').wait_for()
  quiz_title=await quiz_page.locator('.exam-intro h1').inner_text()
  await quiz_page.locator('#practice').click()
  await quiz_page.locator('#question .choice').first.wait_for()
  passage=await quiz_page.locator('#passage').inner_text()
  qcount=await quiz_page.locator('#numbers button').count()
  assert 'village reading hut' in passage.lower()
  assert qcount==8,qcount
  await quiz_page.locator('#question [data-answer="0"]').click()
  await quiz_page.locator('#explain').click()
  quiz_feedback=await quiz_page.locator('#feedback').inner_text()
  assert 'Benar' in quiz_feedback and 'small reading hut' in quiz_feedback.lower(),quiz_feedback
  quiz_overflow=await quiz_page.evaluate('Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth')
  assert quiz_overflow==0,quiz_overflow
  await quiz_page.screenshot(path='/mnt/data/v13e1-grade9-assessment-desktop.png',full_page=True)

  mobile=await browser.new_page(viewport={'width':390,'height':844})
  mobile_errors=[]
  mobile.on('pageerror',lambda e:mobile_errors.append(str(e)))
  await setup(mobile,'lesson.html','lesson.js','?id=grade9-reading')
  await mobile.locator('.scaffold-guide').wait_for()
  mobile_overflow=await mobile.evaluate('Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth')
  assert mobile_overflow==0,mobile_overflow
  await mobile.screenshot(path='/mnt/data/v13e1-grade9-lesson-mobile.png',full_page=True)
  assert not errors,errors
  assert not quiz_errors,quiz_errors
  assert not mobile_errors,mobile_errors
  print(json.dumps({
   'status':'PASS',
   'lesson_title':title,
   'scaffold_steps':steps,
   'optional_checks':checks,
   'worked_examples':examples,
   'guided_practices':practices,
   'assessment_title':quiz_title,
   'assessment_questions':qcount,
   'desktop_horizontal_overflow_px':lesson_overflow,
   'quiz_horizontal_overflow_px':quiz_overflow,
   'mobile_horizontal_overflow_px':mobile_overflow,
   'page_errors':errors+quiz_errors+mobile_errors,
   'screenshots':['v13e1-grade9-lesson-desktop.png','v13e1-grade9-assessment-desktop.png','v13e1-grade9-lesson-mobile.png']
  },ensure_ascii=False,indent=2))
  await browser.close()

asyncio.run(main())
