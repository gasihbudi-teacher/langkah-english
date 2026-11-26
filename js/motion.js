// Lightweight, progressive motion for the static Langkah English interface.
// No animation framework, network calls, or persistent state is used.
const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
if (reducedMotion?.matches || !('IntersectionObserver' in window)) {
  // CSS hover/focus feedback remains available; scroll reveals stay disabled.
} else {
  document.documentElement.classList.add('motion-ready');

  const revealSelector = [
    '.site-header .logo', '.site-header .nav-actions', '.site-header .nav-toggle',
    '.dashboard-welcome', '.home-search', '#learning-choices', '.dashboard-grid > *',
    '.home-choice-section', '#my-progress', '.pathway-hero', '.path-library',
    '.pathway-sections > *', '.catalog-group', '.topic-fold', '.tka-directory',
    '.tka-overview', '.search-intro', '.search-screen', '.reading-intro',
    '.lesson-tools', '.concept-definition', '.concept-synthesis', '.scaffold-guide',
    '.guided-checkpoint', '.reflection', '.lesson-summary', '.lesson-vocabulary',
    '.complete-box', '.lesson-links', '.exam-intro', '.exam-header', '.exam-toolbar',
    '.quizgrid', '.navigator-panel', '.result-hero', '.result-stats > .stat',
    '.results-reading > section', '.site-footer'
  ].join(',');

  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }, { threshold: 0.01, rootMargin: '0px 0px -20px 0px' });

  function scan(root = document) {
    if (!root || !root.querySelectorAll) return;
    const candidates = [];
    if (root.nodeType === Node.ELEMENT_NODE && root.matches(revealSelector)) candidates.push(root);
    candidates.push(...root.querySelectorAll(revealSelector));

    for (const element of candidates) {
      if (element.dataset.motionBound === 'true') continue;
      // Skip content hidden by a closed disclosure or an inactive panel; a
      // later toggle/hash change will scan it again when it becomes visible.
      if (!element.getClientRects().length) continue;
      element.dataset.motionBound = 'true';
      element.classList.add('motion-reveal');
      const siblings = [...(element.parentElement?.children || [])].filter(node => node.matches?.(revealSelector));
      const index = siblings.indexOf(element);
      element.style.setProperty('--motion-delay', `${Math.max(0, Math.min(index, 5)) * 65}ms`);
      revealObserver.observe(element);
    }
  }

  scan();

  function attachTimerMotion() {
    const timer = document.getElementById('timer');
    if (!timer || timer.dataset.motionTimerBound === 'true') return;
    timer.dataset.motionTimerBound = 'true';
    const updateTimerMotion = () => {
      const match = timer.textContent.match(/(?:^|\s)(\d{1,2}):(\d{2})\s*$/);
      const urgent = Boolean(match && Number(match[1]) === 0 && Number(match[2]) <= 60);
      timer.classList.toggle('is-urgent', urgent);
    };
    const timerObserver = new MutationObserver(updateTimerMotion);
    timerObserver.observe(timer, { childList: true, characterData: true, subtree: true });
    updateTimerMotion();
  }

  const contentObserver = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) scan(node);
      }
    }
    attachTimerMotion();
  });
  contentObserver.observe(document.body, { childList: true, subtree: true });
  attachTimerMotion();

  // Re-scan content made visible by native disclosures and in-page anchors.
  document.addEventListener('toggle', event => {
    if (event.target instanceof HTMLDetailsElement && event.target.open) scan(event.target);
  }, true);
  window.addEventListener('hashchange', () => requestAnimationFrame(() => scan()));
  window.addEventListener('pageshow', () => requestAnimationFrame(() => scan()));
}
