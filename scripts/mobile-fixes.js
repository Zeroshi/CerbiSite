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

/* =========================
   Cerbi — Image Enhancements
   (lazy safety, slider polish, and optional lightbox zoom)
   ========================= */
(function(){
  const $ = (s, el=document)=>el.querySelector(s);
  const $$ = (s, el=document)=>[...el.querySelectorAll(s)];

  /* 1) Ensure all content images are lazy and decoding async (cheap wins) */
  $$('img:not([loading])').forEach(img => img.setAttribute('loading','lazy'));
  $$('img:not([decoding])').forEach(img => img.setAttribute('decoding','async'));

  /* 2) Dashboard slider: keep dots synced; allow autoplay (paused on interaction) */
  const slider = $('#dashSlider');
  if (slider){
    const slides = $$('.slide', slider);
    const dotsBox = slider.querySelector('.dots');
    if (dotsBox && slides.length){
      dotsBox.innerHTML = slides.map((_,i)=>`<button aria-label="Slide ${i+1}"></button>`).join('');
      const dots = $$('.dots button', slider);
      let i = Math.max(0, slides.findIndex(s => s.classList.contains('active')));
      const show = n => {
        slides.forEach((s, idx)=> s.classList.toggle('active', idx===n));
        dots.forEach((d, idx)=> d.classList.toggle('active', idx===n));
        i = n;
      };
      dots.forEach((d, idx)=>{
        d.addEventListener('click', ()=>{ show(idx); stop(); }, { passive:true });
      });
      show(i);

      // optional, gentle autoplay
      let timer;
      const start = ()=> timer = setInterval(()=> show((i+1) % slides.length), 5000);
      const stop  = ()=> timer && clearInterval(timer);
      start();
      slider.addEventListener('pointerdown', stop, { passive:true });
      slider.addEventListener('pointerenter', stop, { passive:true });
      slider.addEventListener('pointerleave', start, { passive:true });
      document.addEventListener('visibilitychange', ()=> document.hidden ? stop() : start());
    }
  }

  /* 3) Optional lightbox zoom: add data-zoom to any <img> to enable */
  function openLightbox(src, alt){
    const wrap = document.createElement('div');
    wrap.className = 'lightbox';
    wrap.innerHTML = `
      <button class="close" aria-label="Close (Esc)">Close ✕</button>
      <img src="${src}" alt="${alt || ''}">
    `;
    document.body.appendChild(wrap);
    const close = () => { wrap.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (e)=> (e.key === 'Escape') && close();
    wrap.addEventListener('click', (e)=> (e.target === wrap) && close(), { passive:true });
    wrap.querySelector('.close').addEventListener('click', close, { passive:true });
    document.addEventListener('keydown', onKey);
  }

  $$('img[data-zoom], #dashboards .img-frame.showcase img').forEach(img=>{
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', ()=> openLightbox(img.currentSrc || img.src, img.alt), { passive:true });
  });

  /* 4) Prevent accidental layout shifts from very tall images in text flows */
  $$('figure:not([style*="aspect-ratio"]) img').forEach(img=>{
    if (!img.complete || img.naturalWidth === 0) return;
    // If image is wider than tall, gently apply object-fit to avoid overflow
    if (img.naturalWidth >= img.naturalHeight){
      img.style.objectFit = 'cover';
      img.style.width = '100%';
      img.style.height = 'auto';
    }
  });
})();

