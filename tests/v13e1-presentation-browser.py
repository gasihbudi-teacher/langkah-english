"""Browser-level regression: no compulsory labels and optional bilingual aids across pathways."""
import asyncio
import json
from playwright.async_api import async_playwright
from importlib import import_module

original=import_module('v13e1-browser-smoke')
setup=original.setup

async def main():
 results=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for lesson_id in ['grade9-reading','grade10-descriptive','grade12-caption-text','tka-reading-foundations']:
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
   aids=page.locator('.scaffold-step .lesson-translation-help')
   assert await aids.count()>=5,lesson_id
   first=aids.first
   assert not await first.evaluate('(el)=>el.open'),(lesson_id,'Translation should be optional')
   await first.locator('summary').click()
   assert await first.evaluate('(el)=>el.open'),(lesson_id,'Translation should open')
   assert len((await first.locator('p').inner_text()).strip())>5,lesson_id
   checks=page.locator('.scaffold-review details')
   if await checks.count():
    first_check=checks.first
    assert not await first_check.evaluate('(el)=>el.open')
    await first_check.locator('summary').click()
    assert await first_check.evaluate('(el)=>el.open')
    assert len((await first_check.locator('p').inner_text()).strip())>=10
   overflow=await page.evaluate('Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth')
   assert overflow==0,(lesson_id,overflow)
   if lesson_id=='grade9-reading':
    assert await page.locator('#belajar-langkah-4 .scaffold-review').count()==0
    await page.screenshot(path='/mnt/data/langkah-renderer-grade9-mobile.png',full_page=False)
   assert not errors,(lesson_id,errors)
   results.append({'lesson':lesson_id,'optional_translations':await aids.count(),'authored_checks':await checks.count(),'overflow_px':overflow,'errors':errors})
   await page.close()
  await browser.close()
 print(json.dumps({'status':'PASS','pages':results},ensure_ascii=False,indent=2))

if __name__=='__main__':asyncio.run(main())
