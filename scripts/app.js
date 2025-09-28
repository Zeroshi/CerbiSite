/* CerbiSite core enhancements — keeps your HTML intact */

(function () {
  const $  = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));

  // Year
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  // Scroll progress
  (function(){
    const bar=$("#progress"); if(!bar) return;
    const on=()=>{ const h=document.documentElement; const max=h.scrollHeight-h.clientHeight; const sc=h.scrollTop||document.body.scrollTop; const pct=max?(100*(sc/max)):0; bar.style.setProperty('--progress', pct+'%'); };
    on(); addEventListener('scroll',on,{passive:true}); addEventListener('resize',on,{passive:true});
  })();

  // Theme cycle button
  (function(){ const b=document.getElementById('themeBtn'); b?.addEventListener('click', ()=>window.CerbiTheme?.toggle()); })();

  // Keep CSS custom heights in sync (avoids random top gaps)
  (function(){
    const nav = document.getElementById('siteNav');
    const ribbon = document.getElementById('topRibbon');
    function setHeights(){
      const nh = nav?.offsetHeight || 64;
      const rh = ribbon?.offsetHeight || 0;
      document.documentElement.style.setProperty('--nav-h', nh+'px');
      document.documentElement.style.setProperty('--ribbon-h', rh+'px');
    }
    setHeights(); addEventListener('resize', setHeights, {passive:true});
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(setHeights).catch(()=>{}); }
    new MutationObserver(setHeights).observe(document.body, { attributes:true, childList:true, subtree:true });
  })();

  // Glyph clock — faint, behind content
  (function(){
    const el=document.getElementById('bg-clock'); if(!el) return;
    const glyphs = ['◴','◵','◶','◷','●'];
    function size(){
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth||0);
      const factor = vw < 820 ? 0.44 : 0.34;
      el.style.fontSize = Math.min(Math.max(vw*factor,96),900)+'px';
      const t = document.documentElement.getAttribute('data-theme') || '';
      const lighty = /mist-light|celadon|champagne|greige|lilac/.test(t);
      el.style.color = lighty ? 'var(--glyph-strong)' : 'var(--glyph)';
    }
    function render(){
      const d=new Date();
      const t=`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      el.textContent = (d.getSeconds()%8===0) ? glyphs[(d.getSeconds()/8|0)%glyphs.length] : t;
    }
    function fade(){
      const h=document.documentElement; const max=h.scrollHeight-h.clientHeight;
      const sc = (h.scrollTop||document.body.scrollTop);
      const t = Math.min(1, sc / (max*0.35));
      const base = 0.14, range = 0.22;
      document.documentElement.style.setProperty('--clock-opacity', (base + t*range).toFixed(3));
    }
    size(); render(); fade();
    addEventListener('resize',size,{passive:true});
    addEventListener('scroll',fade,{passive:true});
    window.addEventListener('theme-changed', size);
    setInterval(render,1000);
  })();

  // WHY slider dots
  (function(){
    const slider=document.getElementById('whySlider'); if(!slider) return;
    const slides=[...slider.querySelectorAll('.slide')];
    const dotsBox=slider.querySelector('.dots'); dotsBox.innerHTML=slides.map((_,i)=>`<button aria-label="Slide ${i+1}"></button>`).join('');
    const dots=[...dotsBox.querySelectorAll('button')];
    let i=slides.findIndex(s=>s.classList.contains('active')); if(i<0)i=0;
    const show=n=>{slides.forEach((s,idx)=>s.classList.toggle('active',idx===n)); dots.forEach((d,idx)=>d.classList.toggle('active',idx===n));};
    dots.forEach((d,idx)=>d.addEventListener('click',()=>show(idx))); show(i);
  })();

  // Dashboards slider + lightbox
  (function(){
    const slider=document.getElementById('dashSlider'); if(!slider) return;
    const slides=[...slider.querySelectorAll('.slide')];
    const dotsBox=slider.querySelector('.dots');
    const prevBtn=slider.querySelector('[data-prev]');
    const nextBtn=slider.querySelector('[data-next]');
    const sr=slider.querySelector('[aria-live]');
    let i=slides.findIndex(s=>s.classList.contains('active')); if(i<0)i=0;

    dotsBox.innerHTML = slides.map((_,n)=>`<button aria-label="Go to slide ${n+1}"></button>`).join('');
    const dots=[...dotsBox.querySelectorAll('button')];

    function show(n,announce=true){
      i=(n+slides.length)%slides.length;
      slides.forEach((s,idx)=>s.classList.toggle('active', idx===i));
      dots.forEach((d,idx)=>d.classList.toggle('active', idx===i));
      if(announce && sr) sr.textContent=`Slide ${i+1} of ${slides.length}`;
    }
    dots.forEach((d,idx)=>d.addEventListener('click',()=>show(idx)));
    prevBtn?.addEventListener('click', ()=>show(i-1));
    nextBtn?.addEventListener('click', ()=>show(i+1));
    show(i,false);

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer=null;
    const start=()=>{ if(reduced) return; stop(); timer=setInterval(()=>show(i+1,false),5000); };
    const stop =()=>{ if(timer) clearInterval(timer); timer=null; };
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', start);
    slider.addEventListener('keydown', (e)=>{ if(e.key==='ArrowLeft'){e.preventDefault();show(i-1);} if(e.key==='ArrowRight'){e.preventDefault();show(i+1);} });
    let x0=null;
    slider.addEventListener('touchstart', e=>{x0=e.touches[0].clientX;},{passive:true});
    slider.addEventListener('touchend', e=>{ if(x0==null) return; const dx=e.changedTouches[0].clientX-x0; if(Math.abs(dx)>40){ dx>0?show(i-1):show(i+1); } x0=null; },{passive:true});

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
      img.style.objectFit = 'contain';
    });
    start();
  })();

  // POP-ART rotator (single active)
  (function(){
    const el = document.getElementById('sigRotator'); if(!el || el.__cerbiPopArtInit) return; el.__cerbiPopArtInit = true;
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
      im.loading = idx === 0 ? 'eager' : 'lazy';
      im.src = src;
      im.alt = 'Cerbi pop-art ' + (idx+1);
      if (idx === 0) im.className = 'is-active';
      el.appendChild(im);
      return im;
    });
    let i = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced && imgs.length > 1) {
      setInterval(() => {
        imgs[i].classList.remove('is-active');
        i = (i + 1) % imgs.length;
        imgs[i].classList.add('is-active');
      }, 3500);
    }
  })();

  // Docs modal (Markdown) for .doc-link
  (function(){
    const modal   = document.getElementById('docbox');
    const content = document.getElementById('docboxContent');
    if(!modal || !content) return;
    function openModal(){ modal.hidden=false; modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
    function closeModal(){ modal.setAttribute('aria-hidden','true'); modal.hidden=true; content.innerHTML=''; document.body.style.overflow=''; }
    modal.querySelector('.close')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && modal.getAttribute('aria-hidden')==='false') closeModal(); });

    async function waitForMarked(){
      if (window.marked && typeof window.marked.parse === 'function') return;
      await new Promise(r=>{
        if (document.readyState !== 'loading') {
          const i = setInterval(()=>{ if(window.marked){ clearInterval(i); r(); } }, 30);
        } else {
          window.addEventListener('DOMContentLoaded', ()=>{
            const i = setInterval(()=>{ if(window.marked){ clearInterval(i); r(); } }, 30);
          }, { once:true });
        }
        setTimeout(r, 800);
      });
    }
    async function fetchMd(path){
      const local = path.replace(/^\/+/, '');
      try{ const r = await fetch(local, { cache:'no-store' }); if(r.ok) return await r.text(); }catch{}
      try{
        const gh = `https://raw.githubusercontent.com/Zeroshi/CerbiSite/main/${local}`;
        const r2 = await fetch(gh, { cache:'no-store' }); if(r2.ok) return await r2.text();
      }catch{}
      return '# Not found';
    }
    function mdPathFromHref(href){
      try{ const u=new URL(href, location.href); if(u.pathname.endsWith('.md')) return u.pathname.replace(/^\//,''); }catch{}
      return null;
    }
    function onDocClick(e){
      e.preventDefault();
      const a = e.currentTarget;
      const mdRel = mdPathFromHref(a.getAttribute('href'));
      if(!mdRel){ return; }
      openModal();
      content.innerHTML = '<div style="display:grid;place-items:center;min-height:240px;padding:24px"><div class="k">Loading…</div></div>';
      (async ()=>{
        const text = await fetchMd(mdRel);
        await waitForMarked();
        if (window.marked && typeof window.marked.parse === 'function'){
          content.innerHTML = window.marked.parse(text, { mangle:false, headerIds:true });
          if (!content.classList.contains('prose-doc')) content.classList.add('prose-doc');
          content.scrollTop = 0;
        } else {
          content.innerHTML = '<pre class="kbd" style="white-space:pre-wrap"></pre>';
          if (!content.classList.contains('prose-doc')) content.classList.add('prose-doc');
          content.querySelector('pre').textContent = text;
        }
      })();
    }
    function attach(){ document.querySelectorAll('a.doc-link').forEach(a=>{ a.removeEventListener('click', onDocClick); a.addEventListener('click', onDocClick); }); }
    if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', attach, { once:true }); } else { attach(); }
  })();

  // Theme diag (optional badge in your HTML)
  (function(){
    const badge = document.getElementById('theme-diag'); if(!badge) return;
    const name = document.getElementById('theme-name');
    const cyc  = document.getElementById('theme-cycle');
    const set = ()=>{ name.textContent = 'Theme: ' + (window.CerbiTheme?.get?.() || 'mist-light'); };
    cyc?.addEventListener('click', ()=>{ window.CerbiTheme?.toggle?.(); set(); });
    window.addEventListener('theme-changed', set);
    set();
  })();

})();
