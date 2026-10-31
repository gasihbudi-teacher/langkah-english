# Optional visual/DOM regression harness. Requires Python playwright + Chromium.
# Administrator restrictions on browser navigation make this an isolated in-memory
# approximation, not a replacement for a real HTTP/Cloudflare preview test.
from pathlib import Path
import re, json, asyncio
from urllib.parse import urlparse
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parent.parent
JS=ROOT/'js'
mods=['i18n.js','question-types.mjs','backup-format.mjs','core.js','translations.js','backup.js']

def module_wrap(name):
 raw=(JS/name).read_text()
 imports=[]
 def rewrite_import(match):
  members=re.sub(r'\b(\w+)\s+as\s+(\w+)\b',r'\1: \2',match.group(1));src=match.group(2).split('/')[-1]
  return f"const {{{members}}}=window.__testModules[{json.dumps(src)}];"
 raw=re.sub(r'^import \{([^}]+)\} from [\'"]([^\'"]+)[\'"];',rewrite_import,raw,flags=re.M)
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
 imports=[]
 def rewrite_import(match):
  members=re.sub(r'\b(\w+)\s+as\s+(\w+)\b',r'\1: \2',match.group(1))
  return f"const {{{members}}}=window.__testModules[{json.dumps(match.group(2).split('/')[-1])}];"
 raw=(JS/entry).read_text()
 raw=re.sub(r'^import \{([^}]+)\} from [\'"]([^\'"]+)[\'"];',rewrite_import,raw,flags=re.M)
 assert not re.search(r'^import ',raw,re.M),entry
 return '\n'.join(module_wrap(name) for name in mods)+f'''\nwindow.__testReady=(async()=>{{
 const location=window.__testLocation;
 const localStorage=window.__testStorage;
 const sessionStorage=window.__testSession;
 const history=window.__testHistory;
 {raw}
}})();'''

def prepare(page,query=''):
 h=(ROOT/page).read_text()
 h=re.sub(r'<script type="module"[^>]*></script>','',h)
 h=h.replace('<link rel="stylesheet" href="css/style.css">', '<style>'+(ROOT/'css/style.css').read_text()+'</style>')
 return h

async def run():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  errors=[]
  async def setup(page,pathname,entry,query='',store=None,viewport=None, screenshot=None):
   if viewport:await page.set_viewport_size(viewport)
   if store is None:store={}
   await page.set_content(prepare(pathname),wait_until='load')
   init=f'''(()=>{{
    const d={json.dumps(store)};
    function storage(dict){{return {{ get length(){{return Object.keys(dict).length}}, key(i){{return Object.keys(dict)[i]||null}},getItem(k){{return Object.prototype.hasOwnProperty.call(dict,k)?dict[k]:null}},setItem(k,v){{dict[k]=String(v)}},removeItem(k){{delete dict[k]}},clear(){{for(const k in dict)delete dict[k]}} }} }}
    window.__storageBacking=d;window.__testStorage=storage(d);window.__testSession=storage({{}});
    window.__testLocation={{search:{json.dumps(query)},hash:'',pathname:{json.dumps('/'+pathname)},href:{json.dumps('https://langkah.test/'+pathname+query)}}};
    window.__testHistory={{replaceState(){{}},pushState(){{}}}};
    window.__testModules={{}};
    window.__fakeFetch=async path=>{{
      const data=window.__allData[path];
      return {{ok:data!==undefined,status:data===undefined?404:200,async json(){{return data}}}};
    }};
    window.fetch=window.__fakeFetch;
  }})()'''
   await page.evaluate(init)
   js_resources={f.relative_to(ROOT).as_posix():json.loads(f.read_text()) for f in (ROOT/'data').rglob('*.json') if f.relative_to(ROOT).parts[1]!='schemas'}
   await page.evaluate('(data)=>window.__allData=data',js_resources)
   try:
    await page.add_script_tag(content=bundle(entry))
    await page.evaluate('window.__testReady')
   except Exception as e:
    errors.append(f'{pathname}: {e}')
   if screenshot:await page.screenshot(path=screenshot,full_page=False)
   return await page.evaluate('window.__storageBacking')

  page=await browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
  page.on('pageerror',lambda e:errors.append('pageerror: '+str(e)))
  test_counts={}
  await setup(page,'index.html','home.js',screenshot='/tmp/langkah_v10_home_browser.png')
  test_counts['home_stats']=await page.locator('#stats .stat').count()
  test_counts['home_path_cards']=await page.locator('.home-choice-section .choice-card').count()
  test_counts['home_duplicate_sections']=await page.locator('.path-section,.journey-section,.grade-section,.roadmap-section').count()
  test_counts['home_continue']=await page.locator('#continue .button').count()
  await page.locator('.lang-button[data-lang="en"]').click(timeout=4000)
  test_counts['english_toggle']=await page.locator('#hero-title').inner_text()
  await page.locator('.lang-button[data-lang="id"]').click()
  await setup(page,'grammar.html','pathway.js')
  test_counts['grammar_first_open']=await page.locator('#beginner-materi').get_attribute('open') is not None
  test_counts['grammar_groups']=await page.locator('.topic-fold').count()
  test_counts['grammar_progress_summary']=await page.locator('.pathway-progress-summary').count()
  await setup(page,'school.html','pathway.js')
  test_counts['school_first_open']=await page.locator('#grade-9-materi').get_attribute('open') is not None
  await setup(page,'utbk.html','pathway.js')
  test_counts['utbk_first_open']=await page.locator('#utbk-lessons').get_attribute('open') is not None
  await setup(page,'search.html','search.js')
  test_counts['search_initial_cards']=await page.locator('#search-results .resource-card').count()
  await page.locator('.search-show-all').click()
  test_counts['search_all_cards']=await page.locator('#search-results .resource-card').count()
  await page.locator('#search-input').fill('adverbial')
  test_counts['search_adverbial_cards']=await page.locator('#search-results .resource-card').count()
  await setup(page,'lesson.html','lesson.js',query='?id=inversion',screenshot='/tmp/langkah_v10_lesson_browser.png')
  test_counts['lesson_heading']=await page.locator('h1').first.inner_text()
  test_counts['lesson_nav_links']=await page.locator('.lesson-toc a').count()
  test_counts['lesson_examples']=await page.locator('.worked-example').count()
  await page.locator('.focus-button').click()
  test_counts['lesson_focus']=await page.locator('body').get_attribute('class')
  await page.locator('.focus-button').click()
  await page.locator('#complete').click()
  test_counts['lesson_done_storage']=await page.evaluate('JSON.parse(window.__testStorage.getItem("langkah.progress.v1")).lessons.inversion>0')
  await setup(page,'quiz.html','quiz.js',query='?id=grammar-diagnostic')
  test_counts['quiz_intro']=await page.locator('#practice').count()
  await page.locator('#practice').click()
  test_counts['quiz_question_visible']=await page.locator('#question').count()
  test_counts['quiz_answer_choices']=await page.locator('#question .choice').count()
  await page.locator('#question .choice').first.click()
  test_counts['quiz_progress']=await page.locator('progress#progress').get_attribute('value')
  await page.locator('#submit').click()
  test_counts['quiz_confirm_modal']=await page.locator('#submit-dialog').evaluate('(el)=>el.open')
  await page.locator('#cancel-submit').click()
  await page.locator('#submit').click()
  await page.locator('#confirm-submit').click()
  store_after_quiz=await page.evaluate('window.__storageBacking')
  attempt=json.loads(store_after_quiz['langkah.progress.v1'])['attempts'][0]
  test_counts['quiz_attempt_saved']=attempt['resourceId']=='grammar-diagnostic' and attempt['result']['total']==12
  await setup(page,'results.html','results.js',query='?attempt='+attempt['attemptId'],store=store_after_quiz)
  test_counts['results_rendered']=await page.locator('.result-hero h1').count()
  test_counts['results_review_items']=await page.locator('.review').count()
  await setup(page,'index.html','home.js',viewport={'width':390,'height':844})
  test_counts['mobile_overflow']=await page.evaluate('Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth')
  # The site shell is a self-contained module without imports.
  await page.add_script_tag(content=(JS/'shell.js').read_text())
  await page.locator('.nav-toggle').click()
  test_counts['mobile_menu_expanded']=await page.locator('.nav-toggle').get_attribute('aria-expanded')
  test_counts['mobile_menu_visible']=await page.locator('.nav-links').evaluate('(el)=>getComputedStyle(el).display')
  await page.screenshot(path='/tmp/langkah_v10_home_mobile_browser.png')
  await page.keyboard.press('Escape')
  test_counts['mobile_escape_close']=await page.locator('.nav-toggle').get_attribute('aria-expanded')
  print(json.dumps(test_counts,ensure_ascii=False,indent=2))
  print('ERRORS',errors)
  await browser.close()
  return not errors and test_counts['home_stats']==4 and test_counts['home_path_cards']==4 and test_counts['home_duplicate_sections']==0 and test_counts['lesson_done_storage'] and test_counts['search_all_cards']==101 and test_counts['mobile_overflow']==0 and test_counts['quiz_attempt_saved'] and test_counts['results_review_items']==12
if __name__=='__main__':
 ok=asyncio.run(run())
 if not ok:raise SystemExit(1)
