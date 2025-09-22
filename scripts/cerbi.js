/* ===================== Cerbi Core Page JS (Glitch clock + robust slider) ===================== */

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

/* ===== LDR GLITCH CLOCK (glyph bursts + RGB split + scanlines) ===== */
(() => {
  const root = document.documentElement;
  const el = document.getElementById('bg-clock');
  if (!el) return;

  // internal state
  let tId, burstId, nextBurstAt = Date.now() + 3000;

  // add scanlines layer
  const scan = document.createElement('div');
  scan.className = 'scan';
  el.appendChild(scan);

  function timeHM(){
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  // glitch alphabet (LD&R vibe)
  const GLYPHS = '█▓▒░#@%&*+≣≡≠≈~^°˙•◦·○●◯◎◇◆△▲▽▼▣▤▥▦▧▨▩◢◣◤◥▰▱▄▀▗▖▝▘╳╱╲│┃─━┼┤┘┐┌└┴┬├╭╮╯╰◤◥◣◢';
  const randGlyph = () => GLYPHS[Math.floor(Math.random()*GLYPHS.length)];

  function setClockText(s){
    el.dataset.text = s;   // used by ::before/::after chromatic layers
    el.textContent = s;
    el.setAttribute('aria-label', `Current time ${s}`);
  }

  function render(){
    // responsive font size + theme tint
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth||0);
    el.style.fontSize = Math.min(Math.max(vw*0.36,96),900)+'px';
    el.style.lineHeight = '1';
    const theme = root.getAttribute('data-theme') || 'dark';
    const cs = getComputedStyle(root);
    el.style.color = theme==='light'
      ? (cs.getPropertyValue('--text').trim() || '#0b1530')
      : (cs.getPropertyValue('--muted').trim() || '#a7b4cf');

    // idle state = real time; bursts override text briefly
    if (!el.classList.contains('bursting')) {
      setClockText(timeHM());
    }
  }

  function tick(){
    render();

    // scroll → opacity ramp
    const h=document.documentElement;
    const max=h.scrollHeight-h.clientHeight;
    const sc=(h.scrollTop||document.body.scrollTop);
    const t=Math.min(1, max ? sc/(max*0.35) : 0);
    root.style.setProperty('--clock-opacity', (0.05 + t*0.25).toFixed(3));

    // schedule bursts
    if (Date.now() >= nextBurstAt) burst();
  }

  function startTicks(){
    clearInterval(tId);
    tId = setInterval(tick, 1000);
    tick();
  }

  function burst(){
    // 350–700ms chaos then snap back
    el.classList.add('glitch', 'bursting');
    const duration = 350 + Math.random()*400;
    const start = performance.now();

    cancelAnimationFrame(burstId);
    const animate = (now) => {
      const p = (now - start) / duration;
      if (p >= 1) {
        el.classList.remove('bursting');
        setClockText(timeHM());
        nextBurstAt = Date.now() + (2500 + Math.random()*5500); // 2.5–8s
        return;
      }
      const base = timeHM().split('');
      // swap 2–5 random positions to glyphs (skip colon)
      const swaps = 2 + Math.floor(Math.random()*4);
      for (let i=0;i<swaps;i++){
        const idx = Math.floor(Math.random()*base.length);
        if (base[idx] === ':') continue;
        base[idx] = randGlyph();
      }
      setClockText(base.join(''));
      burstId = requestAnimationFrame(animate);
    };
    burstId = requestAnimationFrame(animate);
  }

  // interactions
  el.addEventListener('click', () => burst()); // force burst on click
  addEventListener('resize', render, {passive:true});
  new MutationObserver(render).observe(root, {attributes:true, attributeFilter:['data-theme']});

  // boot
  startTicks();
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

/* ===== DASHBOARD SLIDER (full-bleed, crossfade, robust) ===== */
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

  // Ensure viewport has height even if images not yet loaded
  if (viewport && !viewport.style.minHeight) viewport.style.minHeight = '360px';

  // Ensure an active slide exists
  if (!slides.some(s => s.classList.contains('active')) && slides[0]) slides[0].classList.add('active');
  let i = Math.max(0, slides.findIndex(s => s.classList.contains('active')));

  // Build dots
  dotsBox.innerHTML = slides.map((_, n) => `<button aria-label="Go to slide ${n+1}"></button>`).join('');
  const dots = [...dotsBox.querySelectorAll('button')];

  // Image sanity checker to catch path/case issues quickly
  slides.forEach((s, idx) => {
    const img = s.querySelector('img');
    if (!img) return;
    img.addEventListener('error', () => {
      console.warn(`[Cerbi] Dashboard image failed to load (slide ${idx+1}):`, img.currentSrc || img.src);
    }, {once:true});
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

  // autoplay with pause on hover/focus; respect reduced motion
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer = null;
  const start = () => { if (prefersReduced) return; stop(); timer = setInterval(() => show(i+1, false), 5000); };
  const stop  = () => { if (timer) clearInterval(timer); timer = null; };
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusin',   stop);
  slider.addEventListener('focusout',  start);
  start();

  // keyboard + swipe
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

  // Lightbox if present
  const overlay = document.getElementById('lightbox');
  const big = document.getElementById('lightboxImg');
  if (overlay && big){
    const open = (src) => { big.src = src; overlay.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; };
    const close = () => { overlay.setAttribute('aria-hidden','true'); big.removeAttribute('src'); document.body.style.overflow=''; };
    overlay.querySelector('.close')?.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.getAttribute('aria-hidden') === 'false') close(); });
    slides.forEach(s => {
      const img = s.querySelector('img');
      img?.addEventListener('click', () => open(img.dataset.full || img.currentSrc || img.src));
    });
  }
})();

/* POP-ART rotator (full-bleed cover) */
(() => {
  const el=document.getElementById('sigRotator'); if(!el) return;
  const images=[
    'assets/popart/popart-01.png','assets/popart/popart-02.png','assets/popart/popart-03.png',
    'assets/popart/popart-04.png','assets/popart/popart-05.png','assets/popart/popart-06.png',
    'assets/popart/popart-07.png','assets/popart/popart-08.png','assets/popart/popart-09.png',
    'assets/popart/popart-10.png'
  ];
  if (!el.querySelector('img')){
    images.forEach((src,idx)=>{
      const img=new Image(); img.src=src; img.alt='Cerbi pop-art '+(idx+1);
      if(idx===0) img.className='show';
      el.appendChild(img);
    });
  }
  let i=0;
  const next=()=> {
    const imgs=[...el.querySelectorAll('img')];
    imgs.forEach((im,idx)=>im.classList.toggle('show', idx===i));
    i=(i+1)%imgs.length;
  };
  setInterval(next, 3500);
})();

/* Live governance demo (PII toggle) */
(() => {
  const btn=document.getElementById('piiSwitch');
  const input=document.getElementById('inputJson');
  const evalEl=document.getElementById('evalJson');
  if(!btn||!input||!evalEl) return;
  function render(){
    const on=btn.getAttribute('aria-pressed')==='true';
    input.textContent=JSON.stringify({
      timestamp:new Date().toISOString(),
      action:'UserLoggedIn',
      user: on ? { id:'123', email:'jane@example.com' } : { id:'123' }
    }, null, 2);
    evalEl.textContent = on
      ? '{ "status":"redacted", "violations":["PII: email"], "policyVersion":"v1.3.2" }'
      : '{ "status":"ok", "policyVersion":"v1.3.2" }';
  }
  btn.addEventListener('click', ()=>{
    const now=btn.getAttribute('aria-pressed')==='true';
    btn.setAttribute('aria-pressed', now?'false':'true');
    render();
  });
  btn.addEventListener('keydown', (e)=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); btn.click(); } });
  render();
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
