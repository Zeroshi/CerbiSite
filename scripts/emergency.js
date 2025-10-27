/* ============================================================
   CerbiSite — EMERGENCY JS HOTFIX (safe to run after your scripts)
   - Stabilize glyph clock rendering + sizing
   - Ensure pop-art rotator shows one image at a time
   - Make dashboard slider auto-advance, pause on hover/focus
   ============================================================ */

/* 1) Glyph clock: visible, scaled, and color-adaptive */
(function(){
  const el = document.getElementById('bg-clock');
  if(!el) return;

  function size(){
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth||0);
    const factor = vw < 820 ? 0.42 : 0.34;
    el.style.fontSize = Math.min(Math.max(vw*factor, 120), 820) + 'px';
    const t = document.documentElement.getAttribute('data-theme') || '';
    const light = /mist-light|celadon|champagne|greige|lilac|powder|pearl|sand|mint|rose|iceberg|peach|slate-light|violet/.test(t);
    el.style.color = light ? 'var(--glyph-strong)' : 'var(--glyph)';
  }
  function render(){
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    el.textContent = `${hh}:${mm}`;
  }
  function fade(){
    const h=document.documentElement;
    const max=h.scrollHeight - h.clientHeight;
    const sc = h.scrollTop || document.body.scrollTop || 0;
    const t = Math.min(1, sc / (max*0.35));
    const base = 0.14, range = 0.18;
    document.documentElement.style.setProperty('--clock-opacity', (base + t*range).toFixed(3));
  }

  size(); render(); fade();
  addEventListener('resize', size, { passive:true });
  addEventListener('scroll', fade, { passive:true });
  window.addEventListener('theme-changed', size);
  setInterval(render, 1000);
})();

/* 2) Pop-art: guard against multi-init, keep single visible */
(function(){
  const el = document.getElementById('sigRotator');
  if(!el || el.__emergencyInit) return; el.__emergencyInit = true;
  const imgs = [...el.querySelectorAll('img')];
  if(!imgs.length) return;

  // Ensure only one is visible
  imgs.forEach((im,idx)=> im.classList.toggle('is-active', idx===0));
  let i = 0;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce && imgs.length > 1){
    setInterval(()=>{
      imgs[i].classList.remove('is-active');
      i = (i + 1) % imgs.length;
      imgs[i].classList.add('is-active');
    }, 3600);
  }
})();

/* 3) Dashboard slider: autoplay, pause on hover/focus, keep dots in sync */
(function(){
  const slider = document.getElementById('dashSlider');
  if(!slider || slider.__emergencyInit) return; slider.__emergencyInit = true;

  const slides = [...slider.querySelectorAll('.slide')];
  const dotsBox = slider.querySelector('.dots');
  const prevBtn = slider.querySelector('[data-prev]');
  const nextBtn = slider.querySelector('[data-next]');
  const live = slider.querySelector('[aria-live]');
  if(!slides.length) return;

  // Build dots if missing
  if(!dotsBox.querySelector('button')){
    dotsBox.innerHTML = slides.map((_,n)=>`<button aria-label="Go to slide ${n+1}"></button>`).join('');
  }
  const dots = [...dotsBox.querySelectorAll('button')];

  let i = slides.findIndex(s=>s.classList.contains('active')); if(i<0) i=0;

  function show(n, announce=true){
    i = (n + slides.length) % slides.length;
    slides.forEach((s,idx)=>s.classList.toggle('active', idx===i));
    dots.forEach((d,idx)=>d.classList.toggle('active', idx===i));
    if(announce && live) live.textContent = `Slide ${i+1} of ${slides.length}`;
  }

  dots.for
