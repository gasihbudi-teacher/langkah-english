// Presentation and global navigation only: no changes to progress keys or assessment logic.
const nav=document.querySelector('.site-header');
const toggle=nav?.querySelector('.nav-toggle');
const links=nav?.querySelector('.nav-links');
if(nav&&toggle&&links){
  const close=()=>{toggle.setAttribute('aria-expanded','false');links.classList.remove('is-open');};
  toggle.addEventListener('click',()=>{
    const opened=toggle.getAttribute('aria-expanded')!=='true';
    toggle.setAttribute('aria-expanded',String(opened));links.classList.toggle('is-open',opened);
  });
  links.addEventListener('click',event=>{if(event.target.closest('a'))close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){close();toggle.focus();}});
  document.addEventListener('click',event=>{if(!nav.contains(event.target))close();});
  const current=location.pathname.split('/').pop()||'index.html';
  nav.querySelectorAll('a[href]').forEach(a=>{
    const dest=a.getAttribute('href').split('#')[0];
    if(dest===current && (current==='index.html'?a.classList.contains('logo'):!a.classList.contains('nav-progress')))a.setAttribute('aria-current','page');
  });
}
