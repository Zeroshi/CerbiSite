/* ===================== Cerbi Core Page JS ===================== */

/* Theme toggle */
(() => {
  const b = document.getElementById('themeBtn');
  if (b && window.CerbiTheme) b.addEventListener('click', () => window.CerbiTheme.toggle());
})();

/* CmdK palette */
(() => {
  const overlay = document.getElementById('cmdkOverlay');
  const input = document.getElementById('cmdkInput');
  if (!overlay) return;
  const open = () => { overlay.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; setTimeout(()=>input?.focus(), 0); };
  const close = () => { overlay.setAttribute('aria-hidden','true'); document.body.style.overflow=''; };
  document.getElementById('cmdBtn')?.addEventListener('click', open);
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) close(); });
  overlay.querySelector('.cmdk')?.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });
  document.addEventListener('keydown', (e)=>{ if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); (overlay.getAttribute('aria-hidden')==='true'?open:close)(); } });
  overlay.setAttribute('aria-hidden','true');
})();

/* ===== Header manager (nav fixed + ribbon-aware, no gap) ===== */
(() => {
  const root = document.documentElement;
  const body = document.body;
  const ribbon = document.querySelector('.ribbon');
  const nav = document.querySelector('.nav');

  if (!nav) return;

  function measure(){
    const nv = nav.offsetHeight || 64;
    const rb = ribbon ? (ribbon.offsetHeight || 0) : 0;
    root.style.setProperty('--nav-h', nv + 'px');
    root.style.setProperty('--ribbon-h', rb + 'px');
  }
  function onScroll(){
    const sc = (window.scrollY || document.documentElement.scrollTop || 0);
    const atTop = sc <= 6;
    body.classList.toggle('scrolled', !atTop);
    root.style.setProperty('--ribbon-visible', atTop ? '1' : '0');
  }

  measure(); onScroll();
  addEventListener('resize', () => requestAnimationFrame(measure), {passive:true});
  addEventListener('load', measure, {once:true});
  addEventListener('scroll', () => requestAnimationFrame(onScroll), {passive:true});
})();

/* ===== LDR GLITCH CLOCK (safe boot + autocreate) ===== */
(() => {
  function bootClock(){
    const root = document.documentElement;

    // Ensure node exists even if HTML forgot it
    let el = document.getElementById('bg-clock');
    if (!el){
      el = document.createElement('div');
      el.id = 'bg-clock';
      el.setAttribute('aria-hidden','true');
      document.body.appendChild(el);
    }

    // Activate RGB-split layers even when idle
    el.classList.add('glitch');
    if (!el.querySelector('.scan')){
      const scan = document.createElement('div');
      scan.className = 'scan';
      el.appendChild(scan);
    }

    // Ensure visibility immediately (inline style to beat any race/caching issues)
    try {
      el.style.opacity = getComputedStyle(root).getPropertyValue('--clock-opacity') || '0.36';
      el.style.mixBlendMode = 'screen';
      // Add a body-level class we can target from CSS to force visibility in stubborn browsers
      document.body.classList.add('show-clock');
    } catch (e) { /* ignore */ }

    const GLYPHS = '█▓▒░#@%&*+≣≡≠≈~^°˙•◦·○●◯◎◇◆△▲▽▼▣▤▥▦▧▨▩◢◣◤◥▰▱▄▀▗▖▝▘╳╱╲│┃─━┼┤┘┐┌└┴┬├╭╮╯╰◤◥◣◢';
    const randGlyph = () => GLYPHS[Math.floor(Math.random()*GLYPHS.length)];
    const timeHM = () => {
      const d = new Date();
      return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    };
    const setClockText = (s) => {
      el.dataset.text = s;
      el.textContent  = s;
      el.setAttribute('aria-label', `Current time ${s}`);
    };

    let burstId, nextBurstAt = Date.now() + 2500;

    function render(){
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth||0);
      el.style.fontSize = Math.min(Math.max(vw*0.36,96),900) + 'px';
      el.style.lineHeight = '1';
      const cs = getComputedStyle(root);
      el.style.color = (root.getAttribute('data-theme') || 'dark') === 'light'
        ? (cs.getPropertyValue('--text').trim() || '#0b1530')
        : (cs.getPropertyValue('--muted').trim() || '#a7b4cf');

      // opacity ramps with scroll (fallback keeps it visible)
      const h=document.documentElement, max=h.scrollHeight-h.clientHeight;
      const sc=(h.scrollTop||document.body.scrollTop);
      const t = Math.min(1, max ? sc/(max*0.35) : 0);
      root.style.setProperty('--clock-opacity', (0.20 + t*0.25).toFixed(3));
      // reflect to inline style so browsers rendering old CSS still see it
      el.style.opacity = getComputedStyle(root).getPropertyValue('--clock-opacity') || el.style.opacity;

      if (!el.classList.contains('bursting')) setClockText(timeHM());
    }

    function burst(){
      el.classList.add('bursting');
      const start = performance.now();
      const dur = 350 + Math.random()*400;

      cancelAnimationFrame(burstId);
      const step = (now) => {
        const p = (now - start) / dur;
        if (p >= 1){
          el.classList.remove('bursting');
          setClockText(timeHM());
          nextBurstAt = Date.now() + (2500 + Math.random()*5500);
          return;
        }
        const arr = timeHM().split('');
        const swaps = 2 + Math.floor(Math.random()*4);
        for (let i=0;i<swaps;i++){
          const idx = Math.floor(Math.random()*arr.length);
          if (arr[idx] === ':') continue;
          arr[idx] = randGlyph();
        }
        setClockText(arr.join(''));
        burstId = requestAnimationFrame(step);
      };
      burstId = requestAnimationFrame(step);
    }

    render(); setClockText(timeHM());
    setInterval(() => { render(); if (Date.now() >= nextBurstAt) burst(); }, 1000);
    el.addEventListener('click', burst);
    addEventListener('resize', render, {passive:true});
    new MutationObserver(render).observe(root, {attributes:true, attributeFilter:['data-theme']});
  }

  // Safe boot regardless of where the script is loaded
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bootClock, {once:true});
  } else {
    // If DOM is already ready, run ASAP on next frame
    requestAnimationFrame(bootClock);
  }
})();


/* Small badge clock (top-right mini clock) */
(() => {
  const el=document.getElementById('clock'); if(!el) return;
  const fmt=()=>{const d=new Date();const date=d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'2-digit'});const time=d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit'});return `${date} ${time}`;};
  const tick=()=>el.textContent=fmt(); tick(); setInterval(tick,1000);
})();

/* WHY slider dots + control */
(() => {
  const slider=document.getElementById('whySlider'); if(!slider) return;
  const slides=[...slider.querySelectorAll('.slide')];
  const dotsBox=slider.querySelector('.dots'); dotsBox.innerHTML=slides.map((_,i)=>`<button aria-label="Slide ${i+1}"></button>`).join('');
  const dots=[...dotsBox.querySelectorAll('button')];
  let i=slides.findIndex(s=>s.classList.contains('active')); if(i<0)i=0;
  const show=n=>{slides.forEach((s,idx)=>s.classList.toggle('active',idx===n)); dots.forEach((d,idx)=>d.classList.toggle('active',idx===n));};
  dots.forEach((d,idx)=>d.addEventListener('click',()=>show(idx))); show(i);
})();

/* Progress bar */
(() => {
  const bar=document.getElementById('progress'); if(!bar) return;
  const on=()=>{const h=document.documentElement; const max=h.scrollHeight-h.clientHeight; const pct=max?(100*((h.scrollTop||document.body.scrollTop)/max)):0; bar.style.setProperty('--progress',pct+'%');};
  on(); addEventListener('scroll',on,{passive:true}); addEventListener('resize',on,{passive:true});
})();

/* Footer year */
(() => { const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear(); })();

/* ===== DASHBOARD SLIDER (full-bleed, cross-fade) ===== */
(() => {
  const slider = document.getElementById('dashSlider');
  if (!slider) return;

  const viewport = slider.querySelector('.showcase-viewport');
  const slides = [...slider.querySelectorAll('.slide')];
  const dotsBox = slider.querySelector('.dots') || (() => {
    const d = document.createElement('div'); d.className = 'dots'; slider.appendChild(d); return d;
  })();
  const sr = slider.querySelector('[aria-live]');
  const prevBtn = slider.querySelector('[data-prev]');
  const nextBtn = slider.querySelector('[data-next]');

  if (viewport && !viewport.style.minHeight) viewport.style.minHeight = '360px';
  if (!slides.some(s => s.classList.contains('active')) && slides[0]) slides[0].classList.add('active');
  let i = Math.max(0, slides.findIndex(s => s.classList.contains('active')));

  dotsBox.innerHTML = slides.map((_, n) => `<button aria-label="Go to slide ${n+1}"></button>`).join('');
  const dots = [...dotsBox.querySelectorAll('button')];

  slides.forEach((s, idx) => {
    const img = s.querySelector('img');
    img?.addEventListener('error', () => console.warn(`[Cerbi] Dashboard image failed to load (slide ${idx+1}):`, img.currentSrc || img.src), {once:true});
  });

  function show(n, announce = true){
    i = (n + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
    if (announce && sr) sr.textContent = `Slide ${i+1} of ${slides.length}`;
  }

  dots.forEach((d, idx) => d.addEventListener('click', () => show(idx)));
  prevBtn?.addEventListener('click', () => show(i - 1));
  nextBtn?.addEventListener('click', () => show(i + 1));
  show(i, false);

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer = null;
  const start = () => { if (prefersReduced) return; stop(); timer = setInterval(() => show(i+1, false), 5000); };
  const stop  = () => { if (timer) clearInterval(timer); timer = null; };
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusin',   stop);
  slider.addEventListener('focusout',  start);
  start();

  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft'){ e.preventDefault(); show(i-1); }
    if (e.key === 'ArrowRight'){ e.preventDefault(); show(i+1); }
  });
  let x0 = null;
  slider.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, {passive:true});
  slider.addEventListener('touchend', e => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) dx > 0 ? show(i-1) : show(i+1);
    x0 = null;
  }, {passive:true});

  /* Lightbox */
  const overlay = document.getElementById('lightbox');
  const big = document.getElementById('lightboxImg');
  if (overlay && big){
    const open = (src) => { big.src = src; overlay.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; };
    const close = () => { overlay.setAttribute('aria-hidden','true'); big.removeAttribute('src'); document.body.style.overflow=''; };
    overlay.querySelector('.close')?.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.getAttribute('aria-hidden') === 'false') close(); });
    slides.forEach(s => s.querySelector('img')?.addEventListener('click', () => open(s.querySelector('img').dataset.full || s.querySelector('img').currentSrc || s.querySelector('img').src)));
  }
})();

/* ===== POP-ART (single source of truth: uses .is-active) ===== */
(() => {
  const el=document.getElementById('sigRotator'); if(!el) return;
  const sources=[
    'assets/popart/popart-01.png','assets/popart/popart-02.png','assets/popart/popart-03.png',
    'assets/popart/popart-04.png','assets/popart/popart-05.png','assets/popart/popart-06.png',
    'assets/popart/popart-07.png','assets/popart/popart-08.png','assets/popart/popart-09.png',
    'assets/popart/popart-10.png'
  ];
  const imgs = sources.map((src,idx)=>{ const im=new Image(); im.src=src; im.alt=`Cerbi pop-art ${idx+1}`; if(idx===0) im.className='is-active'; el.appendChild(im); return im; });
  let i=0, t=null;
  const next=()=>{ imgs[i].classList.remove('is-active'); i=(i+1)%imgs.length; imgs[i].classList.add('is-active'); };
  const start=()=>{ stop(); t=setInterval(next,3500); };
  const stop =()=>{ if(t) clearInterval(t); t=null; };
  el.addEventListener('mouseenter', stop);
  el.addEventListener('mouseleave', start);
  start();
})();

/* IntersectionObserver — smooth reveals on scroll */
(() => {
  const els=[...document.querySelectorAll('.reveal')];
  if (!('IntersectionObserver' in window) || els.length===0){ els.forEach(e=>e.classList.add('in')); return; }
  const io=new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      if(ent.isIntersecting){ ent.target.classList.add('in'); io.unobserve(ent.target); }
    });
  },{root:null, rootMargin:'0px 0px -10% 0px', threshold:.15});
  els.forEach(el=>io.observe(el));
})();

/* Logo → scroll to top */
(() => {
  const brand = document.querySelector('.brand');
  if (!brand) return;
  brand.style.cursor = 'pointer';
  brand.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

