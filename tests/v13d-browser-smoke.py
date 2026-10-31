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
  await setup(page,'tka.html','tka.js')
  lessons=await page.locator('#tka-new-lessons .simple-resource').count()
  topic_quizzes=await page.locator('#tka-new-quizzes .simple-resource').count()
  modules=await page.locator('#tka-module-list .tka-module').count()
  mocks=await page.locator('#tka-mock-list .simple-resource').count()
  stage=await page.locator('.tka-stage').inner_text()
  overflow=await page.evaluate('Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth')
  assert (lessons,topic_quizzes,modules,mocks)==(10,10,10,3),(lessons,topic_quizzes,modules,mocks,errors)
  assert 'V13-D' in stage and overflow==0,(stage,overflow)
  results=[]
  for mock_id in ['tka-mock-a','tka-mock-b','tka-mock-c']:
   await setup(page,'quiz.html','quiz.js','?id='+mock_id)
   await page.wait_for_selector('.exam-intro')
   await page.locator('#simulation').click()
   await page.wait_for_selector('#question .choice')
   navigator=await page.locator('#numbers button').count()
   first_choices=await page.locator('#question .choice').count()
   timer=await page.locator('#timer').inner_text()
   passage=await page.locator('#passage').inner_text()
   await page.locator('#next').click()
   multi=await page.locator('#question [data-multi]').count()
   await page.locator('#next').click()
   category=await page.locator('#question [data-row]').count()
   mobile_overflow=await page.evaluate('Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth')
   assert (navigator,first_choices,multi,category)==(30,4,4,9),(mock_id,navigator,first_choices,multi,category)
   assert re.search(r'(?:44|45):\d{2}',timer) and len(passage)>250,(mock_id,timer,len(passage))
   assert mobile_overflow==0,(mock_id,mobile_overflow)
   results.append({'id':mock_id,'navigator':navigator,'single_choices':first_choices,'multiple_choices':multi,'category_rows':category,'timer':timer,'mobile_overflow':mobile_overflow})
  assert not errors,errors
  print(json.dumps({'tka_lessons':lessons,'topic_quizzes':topic_quizzes,'modules':modules,'full_simulations':mocks,'tka_page_overflow':overflow,'simulations':results,'page_errors':errors},ensure_ascii=False,indent=2))
  await browser.close()

asyncio.run(main())
