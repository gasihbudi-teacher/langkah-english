// Keep the same links in the desktop pathway picker and the compact mobile menu.
const header = document.querySelector('.site-header');
const menu = header.querySelector('.nav-toggle');
const navigation = header.querySelector('.nav-links');
const paths = header.querySelector('.route-toggle');

function closePaths() {
  paths.setAttribute('aria-expanded', 'false');
}
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
  closePaths();
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
  closePaths();
});
paths.addEventListener('click', () => {
  paths.setAttribute('aria-expanded', String(paths.getAttribute('aria-expanded') !== 'true'));
});
header.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('click', event => {
  if (!header.contains(event.target)) closeMenu();
  else if (!event.target.closest('.route-picker')) closePaths();
});
document.addEventListener('focusin', event => {
  if (!header.contains(event.target)) closeMenu();
  else if (!event.target.closest('.route-picker')) closePaths();
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (paths.getAttribute('aria-expanded') === 'true') {
    closePaths();
    paths.focus();
  } else if (menu.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});
matchMedia('(max-width: 810px)').addEventListener('change', closeMenu);
const current = location.pathname.split('/').pop() || 'index.html';
for (const anchor of navigation.querySelectorAll('a[href]')) {
  if (anchor.getAttribute('href') === current) {
    anchor.setAttribute('aria-current', 'page');
    if (anchor.closest('.route-menu')) paths.classList.add('current-path');
  }
}
