/* ============================================================
   Cerbi UI helpers — small, targeted JS to fix UX without DOM churn
   - Priority+ nav: auto-collapses into a “More” menu as space shrinks
   - Dashboard auto-slider: full-width autoplay with pause on hover/focus
   - Safe to load after your existing scripts; no HTML changes required
   ============================================================ */

(function priorityNav(){
  const nav = document.getElementById('primaryNav');
  if(!nav) return;

  // Build (or reuse) a “More” dropdown at the end of #primaryNav
  let more = nav.querySelector('.nav-more');
  if(!more){
    more = document.createElement('div');
    more.className = 'nav-more';
    more.innerHTML = `
      <button type="button" aria-haspopup="true" aria-expanded="false">More ▾</button>
      <div class="menu" role="menu"></div>
    `;
    nav.appendChild(more);
  }
  const moreBtn = more.querySelector('button');
  const menu = more.querySelector('.menu');

  // Keep a stable list of link items (skip the “More” itself)
  const items = [...nav.querySelectorAll('a')].filter(a => !a.closest('.nav-more'));
  const hidden = new Set();

  function layout(){
    // Put everything back first
    for(const a of items){
      if(hidden.has(a)){
        menu.removeChild(a);
        hidden.delete(a);
        nav.insertBefore(a, more);
      }
    }

    // If width overflows, move items (from right to left) into More
    const navRect = nav.getBoundingClientRect();
    const max = navRect.width - (more.offsetWidth + 12); // leave room for "More"
    let needMore = false;

    // Measure by cumulative width
    let total = 0;
    for(const a of items){
      total += a.offsetWidth + 10;
      if(total > max){
        needMore = true;
        // move this and the rest into menu
        const startIdx = items.indexOf(a);
        for(let i=items.length-1;i>=startIdx;i--){
          const it = items[i];
          if(!hidden.has(it)){
            hidden.add(it);
            menu.insertBefore(it, menu.firstChild);
          }
        }
        break;
      }
    }

    more.style.display = needMore ? 'inline-block' : 'none';
    moreBtn.setAttribute('aria-expanded', 'false');
    more.classList.remove('open');
  }

  layout();
  window.addEventListener('resize', ()=>requestAnimationFrame(layout), { passive:true });

  // simple open/close
  moreBtn.addEventListener('click', ()=>{
    const open = !more.classList.contains('open');
    more.classList.toggle('open', open);
    moreBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e)=>{
    if(!more.contains(e.target)) more.classList.remove('open');
  });
})();

/* ---------- Dashboard: full-width auto slider (uses existing markup) ---------- */
(function dashboardAutoSlider(){
  const slider = document.getElementById('dashSlider');
  if(!slider) return;

  const slides = [...slider.querySelectorAll('.slide')];
  const dotsBox = slider.querySelector('.dots');
  const prevBtn = slider.querySelector('[data-prev]');
  const nextBtn = slider.querySelector('[data-next]');
  const live = slider.querySelector('[aria-live]');

  if(!slides.length) return;

  // Dots
  dotsBox.innerHTML = slides.map((_,i)=>`<button aria-label="Go to slide ${i+1}"></button>`).join('');
  const dots = [...dotsBox.querySelectorAll('button')];

  let i = slides.findIndex(s=>s.classList.contains('active')); if(i<0) i=0;

  function show(n, announce=true){
    i = (n + slides.length) % slides.length;
    slides.forEach((s,idx)=>s.classList.toggle('active', idx===i));
    dots.forEach((d,idx)=>d.classList.toggle('active', idx===i));
    if(announce && live) live.textContent = `Slide ${i+1} of ${slides.length}`;
  }

  dots.forEach((d,idx)=>d.addEventListener('click', ()=>show(idx)));
  prevBtn?.addEventListener('click', ()=>show(i-1));
  nextBtn?.addEventListener('click', ()=>show(i+1));
  show(i,false);

  // Autoplay with pause on hover/focus
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t = null;
  const start = ()=>{ if(prefersReduced) return; stop(); t = setInterval(()=>show(i+1,false), 4800); };
  const stop  = ()=>{ if(t) clearInterval(t); t=null; };

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusin', stop);
  slider.addEventListener('focusout', start);

  // Swipe support
  let x0=null;
  slider.addEventListener('touchstart', e=>{ x0=e.touches[0].clientX; }, { passive:true });
  slider.addEventListener('touchend', e=>{
    if(x0==null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if(Math.abs(dx) > 40){ dx>0 ? show(i-1) : show(i+1); }
    x0=null;
  }, { passive:true });

  start();
})();
