// Cerbi — Locked Light Behavior (no theme cycling, stable visuals)

// 1) Sticky sizing + progress bar remain compatible with existing scripts.
//    Only adding glyph clock + sliders stabilization.

// Glyph clock: subtle, behind modules, adaptive size & color
(function(){
  const el=document.getElementById('bg-clock'); if(!el) return;

  function size(){
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth||0);
    const factor = vw < 820 ? 0.42 : 0.34;
    el.style.fontSize = Math.min(Math.max(vw*factor, 120), 820) + 'px';
    // Always light theme now; keep strong tint
    el.style.color = 'var(--glyph-strong)';
  }
  function render(){
    const d=new Date();
    const hh=String(d.getHours()).padStart(2,'0');
    const mm=String(d.getMinutes()).padStart(2,'0');
    el.textContent = `${hh}:${mm}`;
  }
  function fade(){
    const h=document.documentElement, max=h.scrollHeight-h.clientHeight;
    const sc=h.scrollTop||document.body.scrollTop||0;
    const t=Math.min(1, sc/(max*0.35));
    const base=0.14, range=0.18;
    document.documentElement.style.setProperty('--clock-opacity', (base+t*range).toFixed(3));
  }

  size(); render(); fade();
  addEventListener('resize', size, {passive:true});
  addEventListener('scroll', fade, {passive:true});
  setInterval(render, 1000);
})();

// WHY slider: dots + auto-advance, pause on hover/focus
(function(){
  const slider=document.getElementById('whySlider'); if(!slider) return;
  const slides=[...slider.querySelectorAll('.slide')];
  const dotsBox=slider.querySelector('.dots');
  dotsBox.innerHTML=slides.map((_,i)=>`<button aria-label="Slide ${i+1}"></button>`).join('');
  const dots=[...dotsBox.querySelectorAll('button')];
  let i=slides.findIndex(s=>s.classList.contains('active')); if(i<0)i=0;

  const show=n=>{
    i=(n+slides.length)%slides.length;
    slides.forEach((s,idx)=>s.classList.toggle('active',idx===i));
    dots.forEach((d,idx)=>d.classList.toggle('active',idx===i));
  };
  dots.forEach((d,idx)=>d.addEventListener('click',()=>show(idx)));
  show(i);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t=null;
  const start=()=>{ if(reduce) return; stop(); t=setInterval(()=>show(i+1), 4200); };
  const stop =()=>{ if(t) clearInterval(t); t=null; };
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusin', stop);
  slider.addEventListener('focusout', start);
  start();
})();

// Pop-art rotator: one image visible, calm fade
(function(){
  const el = document.getElementById('sigRotator'); if(!el) return;
  const imgs = [...el.querySelectorAll('img')];
  if(!imgs.length) return;
  imgs.forEach((im,idx)=> im.classList.toggle('is-active', idx===0));
  let i=0;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce && imgs.length>1){
    setInterval(()=>{
      imgs[i].classList.remove('is-active');
      i=(i+1)%imgs.length;
      imgs[i].classList.add('is-active');
    }, 3600);
  }
})();

// Dashboard slider: full-width autoplay, pause on interaction, lightbox open
(function(){
  const slider=document.getElementById('dashSlider'); if(!slider) return;
  const slides=[...slider.querySelectorAll('.slide')];
  const dotsBox=slider.querySelector('.dots');
  const prevBtn=slider.querySelector('[data-prev]');
  const nextBtn=slider.querySelector('[data-next]');
  const live=slider.querySelector('[aria-live]');

  if(!dotsBox.querySelector('button')){
    dotsBox.innerHTML = slides.map((_,n)=>`<button aria-label="Go to slide ${n+1}"></button>`).join('');
  }
  const dots=[...dotsBox.querySelectorAll('button')];

  let i=slides.findIndex(s=>s.classList.contains('active')); if(i<0)i=0;

  function show(n,announce=true){
    i=(n+slides.length)%slides.length;
    slides.forEach((s,idx)=>s.classList.toggle('active', idx===i));
    dots.forEach((d,idx)=>d.classList.toggle('active', idx===i));
    if(announce && live) live.textContent = `Slide ${i+1} of ${slides.length}`;
  }

  dots.forEach((d,idx)=>d.addEventListener('click',()=>show(idx)));
  prevBtn?.addEventListener('click', ()=>show(i-1));
  nextBtn?.addEventListener('click', ()=>show(i+1));
  show(i,false);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t=null;
  const start=()=>{ if(reduce) return; stop(); t=setInterval(()=>show(i+1,false), 4800); };
  const stop =()=>{ if(t) clearInterval(t); t=null; };

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusin', stop);
  slider.addEventListener('focusout', start);

  // Swipe
  let x0=null;
  slider.addEventListener('touchstart', e=>{ x0=e.touches[0].clientX; }, {passive:true});
  slider.addEventListener('touchend', e=>{
    if(x0==null) return;
    const dx=e.changedTouches[0].clientX - x0;
    if(Math.abs(dx)>40){ dx>0?show(i-1):show(i+1); }
    x0=null;
  }, {passive:true});

  // Lightbox
  const overlay=document.getElementById('lightbox');
  const big=document.getElementById('lightboxImg');
  let prevOverflow='';
  const open=(src)=>{ if(!overlay||!big) return; big.src=src; overlay.hidden=false; overlay.setAttribute('aria-hidden','false'); prevOverflow=document.body.style.overflow||''; document.body.style.overflow='hidden'; };
  const close=()=>{ if(!overlay||!big) return; overlay.setAttribute('aria-hidden','true'); overlay.hidden=true; big.removeAttribute('src'); document.body.style.overflow=prevOverflow; };
  overlay?.querySelector('.close')?.addEventListener('click', close);
  overlay?.addEventListener('click', (e)=>{ if(e.target===overlay) close(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && overlay?.getAttribute('aria-hidden')==='false') close(); });
  slider.querySelectorAll('img').forEach(img=>{
    img.addEventListener('click', ()=> open(img.dataset.full || img.currentSrc || img.src));
    img.style.objectFit='contain';
  });

  start();
})();
