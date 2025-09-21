/* Cerbi core interactions (sliders, reveal, tilt, lightbox, theme glue, clocks, scroll FX) */
(() => {
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  /* ---------------- Theme Glue (supports ?theme=) ---------------- */
  (function themeGlue(){
    const ORDER = ['dark','light','sand','mint','rose','slate','dusk','emerald','violet'];
    const VALID = new Set(ORDER);
    const params = new URLSearchParams(location.search);
    const q = params.get('theme');
    if (q && VALID.has(q)) {
      document.documentElement.setAttribute('data-theme', q);
      try { localStorage.setItem('cerbi-theme', q); } catch {}
    }
    const syncThemeColor = () => {
      const t = document.documentElement.getAttribute('data-theme') || 'dark';
      let m = document.querySelector('meta[name="theme-color"]');
      if(!m){ m=document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
      m.setAttribute('content', /^(light|sand|mint|rose|slate)$/.test(t) ? '#ffffff' : '#0a1224');
    };
    syncThemeColor();
    new MutationObserver(syncThemeColor).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  })();

  /* ---------------- Mouse spotlight ---------------- */
  (function spotlight(){
    const root = document.documentElement;
    const on = (e) => {
      const x = (e.clientX || innerWidth/2) + 'px';
      const y = (e.clientY || innerHeight/2) + 'px';
      root.style.setProperty('--mx', x);
      root.style.setProperty('--my', y);
    };
    window.addEventListener('mousemove', on, { passive:true });
    window.addEventListener('touchmove', (e)=> on(e.touches[0]), { passive:true });
  })();

  /* ---------------- Reveal on scroll ---------------- */
  (function reveal(){
    const els = $$('.reveal');
    if (!els.length) return;
    const io = new IntersectionObserver((entries)=>{
      for (const it of entries) {
        if (it.isIntersecting) { it.target.classList.add('in'); io.unobserve(it.target); }
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    els.forEach(el => io.observe(el));
  })();

  /* ---------------- Subtle tilt glare ---------------- */
  (function tilt(){
    const cards = $$('.tilt');
    if (!cards.length) return;
    function move(e){
      const r = this.getBoundingClientRect();
      const gx = ((e.clientX - r.left) / r.width) * 100;
      const gy = ((e.clientY - r.top) / r.height) * 100;
      this.style.setProperty('--gx', `${gx}%`);
      this.style.setProperty('--gy', `${gy}%`);
    }
    cards.forEach(c=>{
      c.addEventListener('pointermove', move);
      c.addEventListener('pointerleave', ()=> c.style.removeProperty('--gx'));
    });
  })();

  /* ---------------- WHY slider (dots + autoplay) ---------------- */
  (function whySlider(){
    const wrap = $('#whySlider'); if (!wrap) return;
    const slides = $$('.slide', wrap);
    const dotsBox = $('.dots', wrap) || (()=>{ const d=document.createElement('div'); d.className='dots'; wrap.appendChild(d); return d; })();
    dotsBox.innerHTML = slides.map((_,i)=>`<button aria-label="Slide ${i+1}"></button>`).join('');
    const dots = $$('button', dotsBox);
    let idx = slides.findIndex(s=>s.classList.contains('active')); if (idx<0) idx=0;
    const show = (n) => { slides.forEach((s,i)=>s.classList.toggle('active', i===n)); dots.forEach((d,i)=>d.classList.toggle('active', i===n)); idx = n; };
    dots.forEach((d,i)=>d.addEventListener('click', ()=>{ show(i); reset(); }));
    show(idx);
    let timer;
    const tick = () => show((idx+1)%slides.length);
    const start = () => { timer = setInterval(tick, 5200); };
    const stop = () => clearInterval(timer);
    const reset = () => { stop(); start(); };
    start();
    wrap.addEventListener('pointerenter', stop);
    wrap.addEventListener('pointerleave', start);
  })();

  /* ---------------- Dashboard slider + LIGHTBOX (HD + arrows) ---------------- */
  (function dashboards(){
    const slider = $('#dashSlider'); if (!slider) return;
    const slides = $$('.slide', slider);
    const dotsBox = $('.dots', slider) || (()=>{ const d=document.createElement('div'); d.className='dots'; slider.appendChild(d); return d; })();
    dotsBox.innerHTML = slides.map((_,i)=>`<button aria-label="Slide ${i+1}"></button>`).join('');
    const dots = $$('button', dotsBox);
    let i = slides.findIndex(s=>s.classList.contains('active')); if (i<0) i=0;

    const show = (n) => { slides.forEach((s,idx)=>s.classList.toggle('active', idx===n)); dots.forEach((d,idx)=>d.classList.toggle('active', idx===n)); i = n; };
    dots.forEach((d,idx)=>d.addEventListener('click',()=>{ show(idx); reset(); }));
    show(i);

    let timer;
    const tick = () => show((i+1)%slides.length);
    const start = () => { timer = setInterval(tick, 4800); };
    const stop = () => clearInterval(timer);
    const reset = () => { stop(); start(); };
    start(); slider.addEventListener('pointerenter', stop); slider.addEventListener('pointerleave', start);

    // swipe
    let sx=0;
    slider.addEventListener('pointerdown', e=>{ sx=e.clientX; slider.setPointerCapture(e.pointerId); });
    slider.addEventListener('pointerup', e=>{
      const dx=e.clientX - sx;
      if (Math.abs(dx) > 40) { const next = (i + (dx<0?1:-1) + slides.length) % slides.length; show(next); reset(); }
    });

    // lightbox
    function ensureLightbox(){
      let lb = document.getElementById('cerbiLightbox');
      if (lb) return lb;
      lb = document.createElement('div');
      lb.id = 'cerbiLightbox';
      lb.className = 'lightbox';
      lb.innerHTML = `
        <div class="lightbox-inner">
          <button class="lightbox-close" aria-label="Close">✕</button>
          <button class="lightbox-arrow prev" aria-label="Previous">‹</button>
          <img alt="">
          <button class="lightbox-arrow next" aria-label="Next">›</button>
        </div>`;
      document.body.appendChild(lb);
      const close = ()=> lb.classList.remove('open');
      lb.addEventListener('click', e=>{ if(e.target===lb) close(); });
      $('.lightbox-close', lb).addEventListener('click', close);
      document.addEventListener('keydown', e=>{
        if (!lb.classList.contains('open')) return;
        if (e.key==='Escape') close();
        if (e.key==='ArrowRight') go(1);
        if (e.key==='ArrowLeft') go(-1);
      });
      $('.lightbox-arrow.prev', lb).addEventListener('click', ()=> go(-1));
      $('.lightbox-arrow.next', lb).addEventListener('click', ()=> go(1));
      return lb;
    }

    function currentImageSrc(fig){
      const img = $('img', fig);
      // Prefer highest-res candidate from srcset if available
      if (img && img.srcset) {
        const last = img.srcset.split(',').map(s=>s.trim()).pop();
        if (last) return last.split(' ')[0];
      }
      return img?.currentSrc || img?.src || '';
    }

    function go(delta){
      const lb = document.getElementById('cerbiLightbox');
      if (!lb) return;
      const list = slides;
      i = (i + delta + list.length) % list.length;
      show(i);
      const src = currentImageSrc(list[i]);
      $('.lightbox-inner img', lb).src = src;
    }

    slider.addEventListener('click', e=>{
      const fig = e.target.closest('.slide'); if (!fig) return;
      const lb = ensureLightbox();
      $('.lightbox-inner img', lb).src = currentImageSrc(fig);
      lb.classList.add('open');
    });
  })();

  /* ---------------- Copy helper ---------------- */
  (function copier(){
    $$('[data-copy]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const target = btn.getAttribute('data-copy');
        const el = document.querySelector(target);
        if (!el) return;
        const text = el.innerText || el.textContent || '';
        navigator.clipboard.writeText(text).then(()=>{
          const orig = btn.textContent;
          btn.textContent = 'Copied ✓';
          setTimeout(()=> btn.textContent = orig, 1200);
        });
      });
    });
  })();

  /* ---------------- Governance demo (PII toggle) ---------------- */
  (function govDemo(){
    const sw = $('#piiSwitch'); if (!sw) return;
    const input = $('#inputJson'); const evalJson = $('#evalJson');
    const base = { timestamp: new Date().toISOString(), level:'Information', action:'UserLoggedIn', app:'identity-api', env:'prod', traceId:'a1b2c3', tags:['auth','success'] };
    const render = () => {
      const has = sw.getAttribute('aria-checked') === 'true';
      const payload = { ...base, user: { id: '7' } };
      if (has) payload.user.email = 'jane@ex.com';
      input.textContent = JSON.stringify(payload, null, 2);
      const violations = has ? [{ field:'user.email', rule:'PII', action:'redacted' }] : [];
      evalJson.textContent = JSON.stringify({ ok: violations.length===0, violations }, null, 2);
    };
    sw.addEventListener('click', ()=>{
      const v = sw.getAttribute('aria-checked') === 'true';
      sw.setAttribute('aria-checked', v ? 'false' : 'true');
      render();
    });
    sw.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); sw.click(); }});
    render();
  })();

  /* ---------------- Background clock (size + scroll fade) ---------------- */
  (function bgClock(){
    const el = document.getElementById('bg-clock'); if (!el) return;
    const root = document.documentElement;
    const read = (name, fallback) => getComputedStyle(root).getPropertyValue(name).trim() || fallback;
    function size(){
      const vw = Math.max(root.clientWidth, window.innerWidth || 0);
      el.style.fontSize = Math.min(Math.max(vw * 0.36, 96), 900) + 'px';
      el.style.lineHeight = '1';
      const theme = root.getAttribute('data-theme') || 'dark';
      el.style.color = /^(light|sand|mint|rose|slate)$/.test(theme) ? read('--text','#0a0a0a') : read('--muted','#a7b4cf');
    }
    function render(){
      const d = new Date();
      el.textContent = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    }
    function fade(){
      const h = root.scrollHeight - root.clientHeight;
      const y = Math.max(root.scrollTop || document.body.scrollTop, 0);
      // map 0..h*0.35 → 0.03..0.12
      const t = Math.min(y / (h*0.35), 1);
      const alpha = 0.03 + (0.12 - 0.03) * t;
      root.style.setProperty('--clockAlpha', alpha.toFixed(3));
    }
    size(); render(); fade();
    addEventListener('resize', size, { passive:true });
    addEventListener('scroll', fade, { passive:true });
    new MutationObserver(size).observe(root, { attributes:true, attributeFilter:['data-theme'] });
    setInterval(render, 1000);
  })();

  /* ---------------- Scroll ornaments (subtle glints/orbs per section) ---------------- */
  (function ornaments(){
    const sections = $$('main .section, .hero');
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if (e.isIntersecting) {
          e.target.style.setProperty('box-shadow', '0 10px 60px rgba(100,160,255,.10) inset');
        } else {
          e.target.style.removeProperty('box-shadow');
        }
      });
    }, { rootMargin:'-10% 0px -10% 0px', threshold:0.2 });
    sections.forEach(s=> io.observe(s));
  })();

})();
