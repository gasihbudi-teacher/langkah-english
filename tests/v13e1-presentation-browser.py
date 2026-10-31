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
  for lesson_id in ['sentence-structure','grade9-reading','grade10-descriptive','grade12-critical-reading','grade12-caption-text','utbk-critical-inference','tka-evaluating-facts-opinions-evidence','tka-reading-foundations']:
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
   aids=page.locator('.scaffold-step .lesson-translation-help')
   lesson_data=json.loads((original.ROOT/'data/lessons'/f'{lesson_id}.json').read_text())
   guide=next((b for b in lesson_data['blocks'] if b['type']=='scaffold'),None)
   expected_aids=sum(bool(step.get('english') and step.get('indonesian')) for step in guide['steps']) if guide else 0
   assert await aids.count()==expected_aids,(lesson_id,await aids.count(),expected_aids)
   if expected_aids:
    first=aids.first
    assert not await first.evaluate('(el)=>el.open'),(lesson_id,'Translation should be optional')
    await first.locator('summary').focus()
    await first.locator('summary').press('Enter')
    assert await first.evaluate('(el)=>el.open'),(lesson_id,'Keyboard activation should open translation')
    assert len((await first.locator('p').inner_text()).strip())>5,lesson_id
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
   if lesson_id in ['grade10-descriptive','grade12-critical-reading','utbk-critical-inference']:
    assert await checks.count()==0,(lesson_id,'Explanation-only pilot should not show an answer disclosure')
   if lesson_id=='sentence-structure':
    assert await checks.count()==1,(lesson_id,'Only the purposeful object-contrast check should remain')
    assert 'direct object' in (await page.locator('.scaffold-review').inner_text()).lower()
   assert not errors,(lesson_id,errors)
   results.append({'lesson':lesson_id,'optional_translations':await aids.count(),'authored_checks':await checks.count(),'overflow_px':overflow,'errors':errors})
   await page.close()
  await browser.close()
 print(json.dumps({'status':'PASS','pages':results},ensure_ascii=False,indent=2))

if __name__=='__main__':asyncio.run(main())
