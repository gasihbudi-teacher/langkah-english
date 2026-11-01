"""Browser-level regression: no compulsory labels and optional bilingual aids across pathways."""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright
from importlib import import_module

original=import_module('v13e1-browser-smoke')
setup=original.setup

async def main():
 results=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for lesson_id in ['sentence-structure','grade9-reading','grade10-descriptive','grade10-healthy-procedure','grade10-recount','grade12-critical-reading','grade12-caption-text','utbk-critical-inference','tka-evaluating-facts-opinions-evidence','tka-reading-foundations']:
   page=await browser.new_page(viewport={'width':390,'height':844})
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   await setup(page,'lesson.html','lesson.js','?id='+lesson_id)
   await page.locator('.scaffold-guide').wait_for()
   generic=await page.locator('.scaffold-guide strong, .scaffold-guide .example-label').all_inner_texts()
   for label in ['Artinya:', 'Mengapa?', 'Coba pahami:']:
    assert label not in generic,(lesson_id,label)
   summaries=await page.locator('.scaffold-guide summary').all_inner_texts()
   assert 'Lihat penjelasan setelah mencoba sendiri' not in summaries,lesson_id
   scaffold_text=await page.locator('.scaffold-guide').inner_text()
   for boilerplate in ['Mulai dari dasar, pelan-pelan','langkah bertahap · Boleh dibaca','Jika masih bingung, baca kembali contoh']:
    assert boilerplate not in scaffold_text,(lesson_id,boilerplate)
   aids=page.locator('.scaffold-step .lesson-translation')
   lesson_data=json.loads((original.ROOT/'data/lessons'/f'{lesson_id}.json').read_text())
   guide=next((b for b in lesson_data['blocks'] if b['type']=='scaffold'),None)
   expected_aids=sum(bool(step.get('english') and step.get('indonesian')) for step in guide['steps']) if guide else 0
   assert await aids.count()==expected_aids,(lesson_id,await aids.count(),expected_aids)
   if expected_aids:
    first=aids.first
    assert await first.is_visible(),(lesson_id,'Indonesian translation should be visible by default')
    assert len((await first.inner_text()).strip())>5,lesson_id
   if lesson_id=='grade10-recount':
    model_translation=page.locator('.scaffold-model .lesson-translation')
    white_space=await model_translation.evaluate('(el)=>getComputedStyle(el).whiteSpace')
    assert white_space=='pre-line',('Grade 10 Indonesian translation must preserve authored newlines',white_space)
    rendered_translation=await model_translation.inner_text()
    assert rendered_translation.count('\n')>=3,('Indonesian model paragraph breaks are not visible',repr(rendered_translation))
   checks=page.locator('.scaffold-review details')
   if await checks.count():
    first_check=checks.first
    assert not await first_check.evaluate('(el)=>el.open')
    await first_check.locator('summary').focus()
    await first_check.locator('summary').press('Enter')
    assert await first_check.evaluate('(el)=>el.open')
    assert len((await first_check.locator('p').inner_text()).strip())>=10
   overflow=await page.evaluate('Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth')
   assert overflow==0,(lesson_id,overflow)
   if lesson_id=='grade9-reading':
    assert await page.locator('#belajar-langkah-2 .scaffold-review').count()==0
    await page.screenshot(path='/mnt/data/langkah-r3-grade9-mobile.png',full_page=False)
   if lesson_id in ['grade12-critical-reading','utbk-critical-inference']:
    assert await checks.count()==0,(lesson_id,'Explanation-only pilot should not show an answer disclosure')
   if lesson_id=='grade10-descriptive':
    assert await checks.count()==3,(lesson_id,'Three authored descriptive-text checks should be rendered')
    model_translation=page.locator('.scaffold-model .lesson-translation')
    white_space=await model_translation.evaluate('(el)=>getComputedStyle(el).whiteSpace')
    assert white_space=='pre-line',('Grade 10 descriptive Indonesian translation must preserve paragraph breaks',white_space)
    rendered_translation=await model_translation.inner_text()
    assert rendered_translation.count('\n')>=3,('Descriptive translation paragraph breaks are not visible',repr(rendered_translation))
   if lesson_id=='grade10-healthy-procedure':
    assert await page.locator('.scaffold-step').count()==8
    assert await checks.count()==3,(lesson_id,'Three authored healthy-procedure checks should be rendered')
    assert await page.locator('.worked-example').count()==10
    model_translation=page.locator('.scaffold-model .lesson-translation')
    white_space=await model_translation.evaluate('(el)=>getComputedStyle(el).whiteSpace')
    assert white_space=='pre-line',('Grade 10 healthy-procedure Indonesian translation must preserve paragraph breaks',white_space)
    rendered_translation=await model_translation.inner_text()
    assert rendered_translation.count('\n')>=3,('Healthy-procedure translation paragraph breaks are not visible',repr(rendered_translation))
    assert 'must not' in scaffold_text.lower() and 'should' in scaffold_text.lower()
   if lesson_id=='sentence-structure':
    assert await checks.count()==1,(lesson_id,'Only the purposeful object-contrast check should remain')
    assert 'direct object' in (await page.locator('.scaffold-review').inner_text()).lower()
   if lesson_id=='grade10-recount':
    assert await page.locator('.scaffold-step').count()==6
    assert await checks.count()==4
    assert await page.locator('.worked-example').count()==10
    assert 'A Community Art Market in the Rain' in (await page.locator('.scaffold-model').inner_text())
    assert 'past continuous' in scaffold_text.lower()
   assert not errors,(lesson_id,errors)
   results.append({'lesson':lesson_id,'visible_indonesian_translations':await aids.count(),'authored_checks':await checks.count(),'overflow_px':overflow,'errors':errors})
   await page.close()
  # Grade 10 independent transfer quiz: load the separate passage and all seven questions in practice mode.
  page=await browser.new_page(viewport={'width':390,'height':844})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await setup(page,'quiz.html','quiz.js','?id=grade10-recount-practice')
  assert 'Grade 10 recount' in (await page.locator('#content h1').inner_text())
  await page.locator('#practice').click()
  await page.locator('#question-title').wait_for()
  assert 'A Community Repair Workshop' in (await page.locator('#passage').inner_text())
  assert await page.locator('#numbers button').count()==7
  assert await page.locator('.translation-detail').count()>=1
  quiz_overflow=await page.evaluate('Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth')
  assert quiz_overflow==0,quiz_overflow
  assert not errors,errors
  results.append({'lesson':'grade10-recount-practice','visible_questions':7,'indonesian_question_support':await page.locator('.translation-detail').count(),'overflow_px':quiz_overflow,'errors':errors})
  await page.close()
  # Grade 10 descriptive independent transfer: a new text and seven evidence-based questions.
  page=await browser.new_page(viewport={'width':390,'height':844})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await setup(page,'quiz.html','quiz.js','?id=grade10-descriptive-practice')
  assert 'Grade 10 descriptive' in (await page.locator('#content h1').inner_text())
  await page.locator('#practice').click()
  await page.locator('#question-title').wait_for()
  assert 'The School Theatre' in (await page.locator('#passage').inner_text())
  assert await page.locator('#numbers button').count()==7
  assert await page.locator('.translation-detail').count()>=1
  descriptive_overflow=await page.evaluate('Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth')
  assert descriptive_overflow==0,descriptive_overflow
  assert not errors,errors
  results.append({'lesson':'grade10-descriptive-practice','visible_questions':7,'indonesian_question_support':await page.locator('.translation-detail').count(),'overflow_px':descriptive_overflow,'errors':errors})
  await page.close()
  # Grade 10 healthy-procedure transfer: a new supervised school-walk procedure and seven questions.
  page=await browser.new_page(viewport={'width':390,'height':844})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await setup(page,'quiz.html','quiz.js','?id=grade10-healthy-procedure-practice')
  assert 'Grade 10 Healthy Procedure' in (await page.locator('#content h1').inner_text())
  await page.locator('#practice').click()
  await page.locator('#question-title').wait_for()
  assert 'Preparing for a Safe School Walk' in (await page.locator('#passage').inner_text())
  assert await page.locator('#numbers button').count()==7
  assert await page.locator('.translation-detail').count()>=1
  procedure_overflow=await page.evaluate('Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth')
  assert procedure_overflow==0,procedure_overflow
  assert not errors,errors
  results.append({'lesson':'grade10-healthy-procedure-practice','visible_questions':7,'indonesian_question_support':await page.locator('.translation-detail').count(),'overflow_px':procedure_overflow,'errors':errors})
  await page.close()
  await browser.close()
 print(json.dumps({'status':'PASS','pages':results},ensure_ascii=False,indent=2))

if __name__=='__main__':asyncio.run(main())
