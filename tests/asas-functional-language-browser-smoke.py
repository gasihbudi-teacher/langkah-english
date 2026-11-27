import asyncio
import importlib.util
import json
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('smoke', ROOT / 'tests' / 'v13e1-browser-smoke.py')
smoke = importlib.util.module_from_spec(spec)
spec.loader.exec_module(smoke)

EXPECTED_SECTIONS = {
    10: [
        'OPINIONS, AGREEMENT, AND DISAGREEMENT',
        'SUGGESTIONS AND ADVICE',
        'REQUESTS, OFFERS, AND INVITATIONS',
        'APOLOGIES, THANKS, COMPLIMENTS, AND CONGRATULATIONS',
        'CLARIFICATION, PREFERENCES, AND POSSIBILITY',
    ],
    11: [
        'OPINIONS, AGREEMENT, AND DISAGREEMENT',
        'SUGGESTIONS AND ADVICE',
        'REQUESTS, OFFERS, AND INVITATIONS',
        'APOLOGIES, THANKS, COMPLIMENTS, AND CONGRATULATIONS',
        'CLARIFICATION, PREFERENCES, AND POSSIBILITY',
    ],
    12: [
        'NUANCED OPINIONS AND DISCUSSION',
        'SUGGESTIONS AND ADVICE',
        'FORMAL REQUESTS, OFFERS, AND INVITATIONS',
        'APOLOGIES, THANKS, COMPLIMENTS, AND CONGRATULATIONS',
        'CLARIFICATION, PREFERENCES, AND PROBABILITY',
    ],
}


async def setup_quiz(page, quiz_id):
    await page.set_content(smoke.prepare('quiz.html'), wait_until='domcontentloaded')
    query = f'?id={quiz_id}'
    init = f'''(()=>{{
      const d={{}};
      function storage(dict){{return {{get length(){{return Object.keys(dict).length}},key(i){{return Object.keys(dict)[i]||null}},getItem(k){{return Object.prototype.hasOwnProperty.call(dict,k)?dict[k]:null}},setItem(k,v){{dict[k]=String(v)}},removeItem(k){{delete dict[k]}},clear(){{for(const k in dict)delete dict[k]}}}}}}
      window.__testStorage=storage(d);window.__testSession=storage({{}});
      window.__testLocation={{search:{json.dumps(query)},hash:'',pathname:'/quiz.html',href:{json.dumps('https://langkah.test/quiz.html'+query)}}};
      window.__testHistory={{replaceState(){{}},pushState(){{}}}};window.__testModules={{}};
      window.__fakeFetch=async path=>{{const data=window.__allData[path];return {{ok:data!==undefined,status:data===undefined?404:200,async json(){{return data}}}}}};
      window.fetch=window.__fakeFetch;
    }})()'''
    await page.evaluate(init)
    data = {f.relative_to(ROOT).as_posix(): json.loads(f.read_text()) for f in (ROOT / 'data').rglob('*.json') if 'schemas' not in f.parts}
    await page.evaluate('(data)=>window.__allData=data', data)
    await page.add_script_tag(content=smoke.bundle('quiz.js'))
    await page.evaluate('window.__testReady')


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
        reports = []
        for grade in (10, 11, 12):
            page = await browser.new_page(viewport={'width': 390, 'height': 844})
            page.set_default_timeout(10000)
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            quiz_id = f'grade{grade}-asas-functional-language-test-1'
            await setup_quiz(page, quiz_id)
            await page.locator('.exam-intro').wait_for()
            await page.locator('#practice').click()
            await page.locator('#question-title').wait_for()
            assert await page.locator('#numbers button').count() == 20
            assert await page.locator('#question .choice').count() == 5
            assert await page.locator('#question .question-tags').count() == 0
            assert await page.locator('#passage').is_hidden()
            first_prompt = await page.locator('#question-title').inner_text()
            assert 'A:' in first_prompt and 'B:' in first_prompt and '\n' in first_prompt, first_prompt
            await page.locator('#question [data-answer="0"]').click()
            await page.locator('#explain').click()
            feedback = await page.locator('#feedback').inner_text()
            assert 'Skill:' in feedback and 'Penjelasan:' in feedback, feedback

            section_checks = [(0, 0), (4, 1), (8, 2), (12, 3), (16, 4)]
            for question_index, section_index in section_checks:
                await page.locator('#numbers button').nth(question_index).click()
                title = await page.locator('#question .quiz-section-context h3').inner_text()
                assert title == EXPECTED_SECTIONS[grade][section_index], (grade, question_index, title)
                assert await page.locator('#question .choice').count() == 5
                prompt = await page.locator('#question-title').inner_text()
                assert 'A:' in prompt and 'B:' in prompt, prompt

            overflow = await page.evaluate('Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth')
            assert overflow == 0, overflow
            assert not errors, errors
            reports.append({
                'grade': grade,
                'questions': 20,
                'sections_checked': 5,
                'choices_per_question': 5,
                'speaker_turns_preserved': True,
                'mobile_horizontal_overflow_px': overflow,
                'page_errors': errors,
            })
            await page.close()
        await browser.close()
        print(json.dumps({'status': 'PASS', 'results': reports}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    asyncio.run(main())
