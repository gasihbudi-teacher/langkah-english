import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const pages = fs.readdirSync(new URL('../', import.meta.url)).filter(name => name.endsWith('.html'));
const css = read('css/motion.css');
const js = read('js/motion.js');

assert.equal(pages.length, 11, 'Expected all 11 website pages to be present.');
for (const page of pages) {
  const html = read(page);
  assert.match(html, /href="css\/motion\.css"/, `${page} must load the shared motion stylesheet.`);
  assert.match(html, /src="js\/motion\.js"/, `${page} must load the shared motion behavior.`);
}

for (const animation of [
  'le-rise-in', 'le-menu-drop', 'le-accordion-in', 'le-question-in',
  'le-feedback-in', 'le-pop-in', 'le-float-art'
]) {
  assert.ok(css.includes(`@keyframes ${animation}`), `Missing ${animation} animation.`);
}
for (const surface of [
  '.dashboard-welcome', '.route-menu', '.lesson-translation[open]',
  '.question-panel #question > h2', '.result-hero h1'
]) {
  assert.ok(css.includes(surface), `Missing motion styling for ${surface}.`);
}
assert.match(css, /prefers-reduced-motion:\s*no-preference/, 'Reduced-motion CSS support is required.');
assert.match(js, /prefers-reduced-motion/, 'Reduced-motion preference must be checked before scroll reveals.');
assert.match(js, /IntersectionObserver/, 'Scroll reveals must use IntersectionObserver.');
assert.match(js, /MutationObserver/, 'Dynamically rendered lesson and quiz UI must be observed.');

console.log('PASS motion UI: shared animation assets are wired into all 11 pages; homepage, navigation, lesson, quiz, results and reduced-motion hooks are present.');
