/* Cerbi UI glue — sliders, pop-art rotator, helpers */
(() => {
  "use strict";
  const $  = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  // Theme badge
  (function(){
    const nameEl = $("#theme-name");
    const cycle  = $("#theme-cycle");
    if (!nameEl) return;
    const refresh = () => {
      const t = (window.CerbiTheme && window.CerbiTheme.get && window.CerbiTheme.get())
             || document.documentElement.getAttribute("data-theme") || "mist-light";
      nameEl.textContent = "Theme: " + t;
    };
    cycle?.addEventListener("click", () => { window.CerbiTheme?.toggle(); setTimeout(refresh, 80); });
    window.addEventListener("theme-changed", refresh);
    setTimeout(refresh, 150);
  })();

  // WHY slider
  (function(){
    const slider = $("#whySlider"); if(!slider) return;
    const slides = $$(".slide", slider);
    const dotsBox = $(".dots", slider);
    if (!slides.length || !dotsBox) return;
    dotsBox.innerHTML = slides.map((_,i)=>`<button aria-label="Slide ${i+1}"></button>`).join("");
    const dots = $$("button", dotsBox);
    let i = Math.max(0, slides.findIndex(s => s.classList.contains("active")));
    const show = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
      dots.forEach((d, idx) => d.classList.toggle("active", idx === i));
    };
    dots.forEach((d, idx) => d.addEventListener("click", () => show(idx)));
    show(i);
  })();

  // Dash carousel + lightbox (autoplay)
  (function(){
    const slider = $("#dashSlider"); if(!slider) return;
    const slides = $$(".slide", slider);
    const dotsBox= $(".dots", slider);
    const prevBtn= slider.querySelector("[data-prev]");
    const nextBtn= slider.querySelector("[data-next]");
    const sr     = slider.querySelector('[aria-live]');
    if(!slides.length || !dotsBox) return;

    dotsBox.innerHTML = slides.map((_,n)=>`<button aria-label="Go to slide ${n+1}"></button>`).join("");
    const dots = $$("button", dotsBox);

    let i = Math.max(0, slides.findIndex(s => s.classList.contains("active")));
    const show = (n, announce=true) => {
      i=(n + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
      dots.forEach((d, idx) => d.classList.toggle("active", idx === i));
      if (announce && sr) sr.textContent = `Slide ${i+1} of ${slides.length}`;
    };
    dots.forEach((d, idx) => d.addEventListener("click", () => show(idx)));
    prevBtn?.addEventListener("click", () => show(i-1));
    nextBtn?.addEventListener("click", () => show(i+1));
    show(i, false);

    const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer=null;
    const start=()=>{ if(prefersReduced) return; stop(); timer=setInterval(()=>show(i+1,false),5000); };
    const stop =()=>{ if(timer) clearInterval(timer); timer=null; };
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    slider.addEventListener("focusin", stop);
    slider.addEventListener("focusout", start);
    slider.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft")  { e.preventDefault(); show(i-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); show(i+1); }
    });

    let x0=null;
    slider.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, {passive:true});
    slider.addEventListener("touchend", e => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { dx > 0 ? show(i-1) : show(i+1); }
      x0 = null;
    }, {passive:true});

    const overlay=$("#lightbox"), big=$("#lightboxImg");
    let prevOverflow='';
    const open=(src)=>{ if(!overlay||!big) return; big.src=src; overlay.hidden=false; overlay.setAttribute('aria-hidden','false'); prevOverflow=document.body.style.overflow||''; document.body.style.overflow='hidden';};
    const close=()=>{ if(!overlay||!big) return; overlay.setAttribute('aria-hidden','true'); overlay.hidden=true; big.removeAttribute('src'); document.body.style.overflow=prevOverflow;};
    overlay?.querySelector('.close')?.addEventListener('click', close);
    overlay?.addEventListener('click', e=>{ if(e.target===overlay) close(); });
    document.addEventListener('keydown', e=>{ if(e.key==='Escape' && overlay?.getAttribute('aria-hidden')==='false') close(); });
    $$("img", slider).forEach(img => {
      img.addEventListener("click", () => open(img.dataset.full || img.currentSrc || img.src));
      img.style.objectFit = "contain";
    });

    start();
  })();

  // Pop-art rotator (guard against double init)
  (function initPopArt(){
    const el = document.getElementById('sigRotator');
    if (!el || el.__cerbiPopArtInit) return;
    el.__cerbiPopArtInit = true;

    const sources = [
      'assets/popart/popart-01.png','assets/popart/popart-02.png','assets/popart/popart-03.png',
      'assets/popart/popart-04.png','assets/popart/popart-05.png','assets/popart/popart-06.png',
      'assets/popart/popart-07.png','assets/popart/popart-08.png','assets/popart/popart-09.png',
      'assets/popart/popart-10.png'
    ];
    el.innerHTML = '';
    const imgs = sources.map((src, idx) => {
      const im = new Image();
      im.decoding = 'async';
      im.loading  = idx === 0 ? 'eager' : 'lazy';
      im.src = src;
      im.alt = 'Cerbi pop-art ' + (idx+1);
      if (idx === 0) im.className = 'is-active';
      el.appendChild(im);
      return im;
    });

    let i = 0;
    const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced && imgs.length > 1) {
      setInterval(() => {
        imgs[i].classList.remove('is-active');
        i = (i + 1) % imgs.length;
        imgs[i].classList.add('is-active');
      }, 3500);
    }
  })();

})();
