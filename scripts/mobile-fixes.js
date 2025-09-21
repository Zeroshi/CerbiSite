/* ============ Cerbi mobile stability fixes (non-destructive) ============ */
/* Runs LAST to patch behavior after your existing scripts have loaded. */

(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // 1) Never leave the page in a scroll-locked state
  function unlockScroll() {
    document.documentElement.classList.remove('no-scroll', 'lock-scroll');
    document.body.classList.remove('no-scroll', 'lock-scroll');
    // If any inline style left overflow hidden, undo it
    if (document.body.style && /hidden/.test(document.body.style.overflow || '')) {
      document.body.style.overflow = '';
    }
  }
  unlockScroll();

  // Defensive: if any runtime error happens, ensure scroll remains unlocked
  window.addEventListener('error', unlockScroll, { passive: true });

  // 2) Passive listeners so scroll/touch never blocks on iOS/Android
  ['touchstart','touchmove','wheel'].forEach(ev =>
    window.addEventListener(ev, () => {}, { passive: true })
  );

  // 3) Mobile 100vh address-bar fix (sync --vh)
  function setVH() {
    document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
  }
  setVH();
  window.addEventListener('resize', setVH, { passive: true });

  // 4) If you have heavy visual effects, pause them on small screens
  function shouldReduce() {
    return window.matchMedia('(max-width: 640px)').matches ||
           window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function disableHeavyVisualsIfNeeded() {
    if (!shouldReduce()) return;
    const stars = $('#stars');
    if (stars) stars.style.display = 'none';
    const clock = document.getElementById('clock');
    if (clock) clock.style.display = 'none';
    $$('canvas[data-bg], [data-heavy-anim="true"]').forEach(el => el.style.display = 'none');
  }
  disableHeavyVisualsIfNeeded();
  window.matchMedia('(max-width: 640px)').addEventListener('change', disableHeavyVisualsIfNeeded);
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', disableHeavyVisualsIfNeeded);

  // 5) Make menus safe (no scroll trap) and cheap to toggle
  const menuToggle = document.getElementById('menuToggle');
  const nav = $('#nav') || $('nav[aria-label="Primary"]') || $('nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      nav.setAttribute('aria-hidden', open ? 'false' : 'true');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }, { passive: true });
    // Ensure nav can’t trap scroll when closed
    nav.setAttribute('aria-hidden', nav.classList.contains('open') ? 'false' : 'true');
    nav.style.webkitOverflowScrolling = 'touch';
  }

  // 6) Theme meta color sync (prevents odd status-bar colors on mobile)
  const setThemeMeta = () => {
    const meta = document.querySelector('meta[name="theme-color"]');
    const isLight = (document.documentElement.getAttribute('data-theme') || '').toLowerCase() === 'light';
    if (meta) meta.setAttribute('content', isLight ? '#ffffff' : '#0a1224');
  };
  setThemeMeta();
  // If your site toggles theme later, expose a helper:
  window.cerbiSetTheme = function (mode) {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('cerbi-theme', mode);
    setThemeMeta();
  };

  // 7) Defer heavy initializers if your scripts expose them
  // If your existing code defines window.cerbiInit (or similar), run it “idle”
  function runIdle(fn) {
    if ('requestIdleCallback' in window) {
      return requestIdleCallback(fn, { timeout: 800 });
    }
    return setTimeout(fn, 0);
  }
  if (typeof window.cerbiInit === 'function') {
    runIdle(() => {
      try { window.cerbiInit(); } catch { /* keep UI responsive even if it fails */ }
    });
  }

  // 8) Handle “section hydration” lazily if you have heavy blocks
  const sections = $$('[data-section]');
  if ('IntersectionObserver' in window && sections.length) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      }
    }, { rootMargin: '200px 0px' });
    sections.forEach(s => io.observe(s));
  }
})();
