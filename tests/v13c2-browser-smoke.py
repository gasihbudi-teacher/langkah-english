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
  page=await browser.new_page(viewport={'width':390,'height':844})
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  # TKA pathway
  await setup(page,'tka.html','tka.js')
  lessons=await page.locator('#tka-new-lessons .simple-resource').count()
  quizzes=await page.locator('#tka-new-quizzes .simple-resource').count()
  modules=await page.locator('#tka-module-list .tka-module').count()
  stage=await page.locator('.tka-stage').inner_text()
  overflow=await page.evaluate('Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth')
  assert (lessons,quizzes,modules)==(4,4,10),(lessons,quizzes,modules,errors)
  assert 'V13-C2' in stage and overflow==0,(stage,overflow)
  # TKA-03 lesson
  await setup(page,'lesson.html','lesson.js','?id=tka-classify-outline-summarize-synthesize')
  await page.wait_for_selector('.scaffold-step')
  s3=await page.locator('.scaffold-step').count(); e3=await page.locator('.worked-example').count(); m3=len((await page.locator('.scaffold-model .example-english').inner_text()).split())
  assert (s3,e3)==(11,10) and 200<=m3<=300,(s3,e3,m3,errors)
  # TKA-04 lesson
  await setup(page,'lesson.html','lesson.js','?id=tka-context-vocabulary-reference-connectors')
  await page.wait_for_selector('.scaffold-step')
  s4=await page.locator('.scaffold-step').count(); e4=await page.locator('.worked-example').count(); m4=len((await page.locator('.scaffold-model .example-english').inner_text()).split())
  assert (s4,e4)==(10,10) and 200<=m4<=300,(s4,e4,m4,errors)
  # TKA-03 quiz controls: single, multiple, category.
  await setup(page,'quiz.html','quiz.js','?id=tka-classify-outline-summarize-synthesize-practice')
  await page.locator('#practice').click()
  await page.wait_for_selector('#question .choice')
  single=await page.locator('#question .choice').count()
  await page.locator('#next').click()
  multi=await page.locator('#question [data-multi]').count()
  await page.locator('#next').click()
  category=await page.locator('#question [data-row]').count()
  assert (single,multi,category)==(4,4,9),(single,multi,category,errors)
  # TKA-04 quiz also renders the three response formats in sequence.
  await setup(page,'quiz.html','quiz.js','?id=tka-context-vocabulary-reference-connectors-practice')
  await page.locator('#practice').click()
  await page.wait_for_selector('#question .choice')
  tka04_single=await page.locator('#question .choice').count()
  await page.locator('#next').click()
  tka04_multi=await page.locator('#question [data-multi]').count()
  await page.locator('#next').click()
  tka04_category=await page.locator('#question [data-row]').count()
  assert (tka04_single,tka04_multi,tka04_category)==(4,4,9),(tka04_single,tka04_multi,tka04_category,errors)
  print(json.dumps({'tka_lessons':lessons,'tka_quizzes':quizzes,'roadmap_modules':modules,'mobile_overflow':overflow,'tka03_steps':s3,'tka03_examples':e3,'tka03_guided_model_words':m3,'tka04_steps':s4,'tka04_examples':e4,'tka04_guided_model_words':m4,'tka03_quiz_controls':[single,multi,category],'tka04_quiz_controls':[tka04_single,tka04_multi,tka04_category],'page_errors':errors},ensure_ascii=False,indent=2))
  assert not errors,errors
  await browser.close()

asyncio.run(main())
