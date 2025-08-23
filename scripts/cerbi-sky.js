/* Cerbi “Sky” runtime (no-trees edition)
   - Smooth scroll-driven background (no abrupt change)
   - Fixed starfield w/ twinkle + real constellations (Big Dipper, Cassiopeia, Orion, Cygnus, Scorpius)
   - Optional PNG layer between stars and content (#bgImage tries /background.png then /assets/background.png)
   - Theme toggle, mobile nav, progress bar, reveal, tilt, copy buttons, command palette, compare filters, governance demo
*/

(() => {
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const html = document.documentElement;

  /* ---------------- Year ---------------- */
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------------- Theme ---------------- */
  const themeBtn = $('#themeBtn');
  const prefersLight = matchMedia('(prefers-color-scheme: light)').matches;
  const initTheme = localStorage.getItem('theme') || (prefersLight ? 'light' : 'dark');
  html.setAttribute('data-theme', initTheme);
  themeBtn?.addEventListener('click', () => {
    const now = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', now);
    localStorage.setItem('theme', now);
  });

  /* ---------------- Mobile nav ---------------- */
  const navToggle = $('#navToggle');
  const primaryNav = $('#primaryNav');
  navToggle?.addEventListener('click', () => {
    primaryNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', primaryNav.classList.contains('open') ? 'true' : 'false');
  });

  /* ---------------- Cursor spotlight ---------------- */
  const spotlight = $('.spotlight');
  document.addEventListener('pointermove', (e) => {
    spotlight?.style.setProperty('--mx', e.clientX + 'px');
    spotlight?.style.setProperty('--my', e.clientY + 'px');
  }, { passive: true });

  /* ---------------- Progress bar ---------------- */
  const progress = $('#progress');
  function setProgress() {
    const max = document.body.scrollHeight - innerHeight;
    const pct = Math.max(0, Math.min(1, scrollY / (max || 1)));
    if (progress) progress.style.width = (pct * 100) + '%';
  }
  document.addEventListener('scroll', setProgress, { passive: true });
  setProgress();

  /* ---------------- Reveal-on-scroll ---------------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) e.target.classList.add('in');
    }, { threshold: 0.12 });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('in'));
  }

  /* ---------------- Tilt + glare ---------------- */
  $$('.tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const gx = ((e.clientX - r.left) / r.width) * 100;
      const gy = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--gx', gx + '%');
      card.style.setProperty('--gy', gy + '%');
    }, { passive: true });
  });

  /* ---------------- Copy buttons ---------------- */
  $$('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-copy');
      const el = target ? document.querySelector(target) : null;
      const text = el ? el.textContent : '';
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        const old = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => (btn.textContent = old), 1000);
      });
    });
  });

  /* ---------------- Command palette ---------------- */
  const cmdBtn = $('#cmdBtn');
  const overlay = $('#cmdkOverlay');
  const cmdk = $('.cmdk', overlay || undefined);
  const input = $('#cmdkInput');
  const list = $('#cmdkList');
  const commands = [
    { label: '📦 View Packages', action: () => location.hash = '#packages' },
    { label: '🔐 Governance', action: () => location.hash = '#governance' },
    { label: '🧭 Architecture', action: () => location.hash = '#architecture' },
    { label: '📣 Contact', action: () => location.hash = '#contact' },
  ];
  function renderCmd(q){
    const ql = (q||'').trim().toLowerCase();
    if (!list) return;
    list.innerHTML = '';
    commands.filter(c => !ql || c.label.toLowerCase().includes(ql)).forEach(c => {
      const item = document.createElement('div'); item.className='item';
      item.innerHTML = `<span>${c.label}</span><span class="kbd">Enter</span>`; item.tabIndex=0;
      item.addEventListener('click', ()=>{ c.action(); closeCmd(); });
      item.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ c.action(); closeCmd(); }});
      list.appendChild(item);
    });
    if(!list.children.length){
      const none = document.createElement('div'); none.className='item'; none.textContent='No results';
      list.appendChild(none);
    }
  }
  function openCmd(){ if(!overlay || !cmdk || !input) return; overlay.style.display='block'; cmdk.style.display='block'; input.value=''; renderCmd(''); setTimeout(()=>input.focus(),0); }
  function closeCmd(){ if(!overlay || !cmdk) return; overlay.style.display='none'; cmdk.style.display='none'; }
  cmdBtn?.addEventListener('click', openCmd);
  overlay?.addEventListener('click', (e)=>{ if(e.target===overlay) closeCmd(); });
  input?.addEventListener('input', (e)=> renderCmd(e.target.value));
  document.addEventListener('keydown', (e)=>{
    if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openCmd(); }
    if(e.key==='Escape') closeCmd();
  });

  /* ---------------- Compare filters ---------------- */
  const compareTable = $('#compareTable');
  if (compareTable){
    const filterBtns = $$('.filter');
    const rows = $$('tbody tr', compareTable);
    filterBtns.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        filterBtns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const tag = btn.dataset.tag || 'all';
        rows.forEach(tr=>{
          if(tag==='all'){ tr.style.display=''; return; }
          const tags = tr.dataset.tags || '';
          tr.style.display = tags.includes(tag) ? '' : 'none';
        });
      });
    });
  }

  /* ---------------- Governance demo ---------------- */
  const piiSwitch = $('#piiSwitch');
  const inputJson = $('#inputJson');
  const evalJson = $('#evalJson');
  const baseLog = { Timestamp:new Date().toISOString(), Level:"Information", Message:"Checkout complete", Properties:{ OrderId:"A-102934", Amount:129.99, UserId:"u-4821" } };
  const policies = { RequiredFields:["Timestamp","Level","Message","Properties.OrderId"], ForbiddenFields:["Properties.SSN","Properties.CreditCardNumber","Properties.DOB"] };
  const hasPath = (path,obj)=> path.split('.').reduce((o,k)=> (o&&k in o)?o[k]:undefined, obj)!==undefined;
  const evaluate = (log)=>{ const violations=[]; for(const f of policies.RequiredFields) if(!hasPath(f,log)) violations.push({field:f,type:"RequiredMissing",severity:"Error"}); for(const f of policies.ForbiddenFields) if(hasPath(f,log)) violations.push({field:f,type:"ForbiddenPresent",severity:"Error"}); return { outcome:violations.length?"NonCompliant":"Compliant", violations }; };
  const renderDemo = (includePII)=>{ const sample=JSON.parse(JSON.stringify(baseLog)); if(includePII){ sample.Properties.CreditCardNumber="4111 1111 1111 1111"; sample.Properties.DOB="1990-01-01"; } if(inputJson) inputJson.textContent=JSON.stringify(sample,null,2); if(evalJson) evalJson.textContent=JSON.stringify(evaluate(sample),null,2); };
  if (piiSwitch && inputJson && evalJson){
    const setSwitch = (on)=>{ piiSwitch.classList.toggle('on', on); piiSwitch.setAttribute('aria-checked', on?'true':'false'); renderDemo(on); };
    renderDemo(false);
    piiSwitch.addEventListener('click', ()=>setSwitch(!piiSwitch.classList.contains('on')));
    piiSwitch.addEventListener('keydown', (e)=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); setSwitch(!piiSwitch.classList.contains('on')); }});
  }

  /* ---------------- Scroll-driven background palette ---------------- */
  const palettes = [
    { start: "#09120f", end: "#0e1b15" },
    { start: "#0a1a14", end: "#0b2a21" },
    { start: "#0b2a21", end: "#0c2333" },
    { start: "#0c2333", end: "#140f1a" }
  ];
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const hexToRgb = (hex) => {
    const m = /^#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i.exec(hex);
    return m ? { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) } : { r:0,g:0,b:0 };
  };
  const rgbToHex = ({r,g,b}) => `#${[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')}`;
  const lerp = (a,b,t) => a + (b - a) * t;
  const lerpColor = (c1, c2, t) => ({ r: Math.round(lerp(c1.r, c2.r, t)), g: Math.round(lerp(c1.g, c2.g, t)), b: Math.round(lerp(c1.b, c2.b, t)) });
  const ease = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;

  const startRGB = palettes.map(p => hexToRgb(p.start));
  const endRGB   = palettes.map(p => hexToRgb(p.end));
  (function initBgVars(){ const first = palettes[0]; html.style.setProperty('--bg-start', first.start); html.style.setProperty('--bg-end', first.end); })();

  let ticking = false;
  function updateBg(){
    const docHeight = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const p = clamp(window.scrollY / docHeight, 0, 1);
    const segs = Math.max(1, palettes.length - 1);
    const pos = p * segs;
    const i = Math.min(segs - 1, Math.floor(pos));
    const t = ease(clamp(pos - i, 0, 1));
    const i2 = Math.min(segs, i + 1);
    const s = lerpColor(startRGB[i], startRGB[i2], t);
    const e = lerpColor(endRGB[i],   endRGB[i2],   t);
    html.style.setProperty('--bg-start', rgbToHex(s));
    html.style.setProperty('--bg-end',   rgbToHex(e));
    ticking = false;
  }
  function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(updateBg); } }
  addEventListener('scroll', onScroll, { passive:true });
  addEventListener('resize', () => requestAnimationFrame(updateBg), { passive:true });
  addEventListener('load', updateBg, { once:true });
  updateBg();

  /* ---------------- Optional Background PNG Loader ---------------- */
  (function loadBgPNG(){
    const bg = $('#bgImage');
    if (!bg) return;
    const tryUrls = ['/background.png', '/assets/background.png'];
    let idx = 0;
    const tryNext = () => {
      if (idx >= tryUrls.length) return; // fall back to glow (CSS)
      const url = tryUrls[idx++] + `?v=${Date.now()}`; // bust cache once
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 40) {
          html.style.setProperty('--bg-img', `url("${url.replace(/"/g, '\\"')}")`);
          bg.classList.add('show');
        }
      };
      img.onerror = tryNext;
      img.src = url;
    };
    tryNext();
  })();

  /* ---------------- Stars & Constellations ---------------- */
  const canvas = $('#sky');
  if (canvas) {
    const ctx = canvas.getContext('2d', { alpha: true });
    const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let dpr = Math.max(1, Math.min(2, devicePixelRatio || 1));
    let W = 0, H = 0;
    let stars = [];
    let constellations = [];

    function resize(){
      dpr = Math.max(1, Math.min(2, devicePixelRatio || 1));
      W = Math.floor(innerWidth * dpr);
      H = Math.floor(innerHeight * dpr);
      canvas.width = W;
      canvas.height = H;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      buildField();
    }

    function rnd(min,max){ return Math.random()*(max-min)+min; }

    function buildField(){
      // Star count scales with area; cap for perf
      const base = 200;
      const scale = (innerWidth*innerHeight) / (1280*720);
      const count = Math.min(500, Math.max(140, Math.floor(base * scale)));

      stars = new Array(count).fill(0).map(() => ({
        x: Math.random()*W,
        y: Math.random()*H,
        r: rnd(0.6,1.9) * dpr,
        a: rnd(0.45,0.95),
        tw: rnd(0.0008,0.0030),
        p: Math.random()*Math.PI*2
      }));

      constellations = makeConstellations();
    }

    function norm(pt){ return { x: pt.x * W, y: pt.y * H }; }

    // Approximate shapes in normalized screen space (not astronomically exact, but recognizable)
    function makeConstellations(){
      const sets = [
        // Big Dipper (Ursa Major)
        [{x:.08,y:.18},{x:.12,y:.16},{x:.17,y:.18},{x:.22,y:.22},{x:.30,y:.20},{x:.36,y:.16},{x:.42,y:.18}],
        // Cassiopeia (W shape)
        [{x:.55,y:.12},{x:.58,y:.16},{x:.62,y:.12},{x:.66,y:.16},{x:.70,y:.12}],
        // Orion (belt + shoulders)
        [{x:.72,y:.26},{x:.76,y:.28},{x:.80,y:.30},{x:.76,y:.22},{x:.72,y:.26},{x:.78,y:.20}],
        // Cygnus (Northern Cross)
        [{x:.48,y:.10},{x:.50,y:.20},{x:.52,y:.30},{x:.44,y:.22},{x:.56,y:.18}],
        // Scorpius (tail curve)
        [{x:.18,y:.30},{x:.22,y:.34},{x:.26,y:.38},{x:.30,y:.36},{x:.33,y:.41}]
      ];
      return sets.map(arr => arr.map(norm));
    }

    function draw(now){
      // clear
      ctx.clearRect(0,0,W,H);

      // faint vertical gradient to lift stars off bg
      const g = ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0, 'rgba(0,0,0,0.10)');
      g.addColorStop(1, 'rgba(0,0,0,0.00)');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,W,H);

      // stars
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (const s of stars){
        const tw = prefersReduced ? 0 : (Math.sin(now*s.tw + s.p) * 0.25);
        const a = Math.max(0, Math.min(1, s.a + tw));
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,244,230,0.95)';
        ctx.fill();
      }
      ctx.restore();

      // constellation lines + brighter nodes
      ctx.save();
      ctx.globalAlpha = 0.20;
      ctx.strokeStyle = '#ffe0c2';
      ctx.lineWidth = Math.max(0.6, 1 * dpr);
      ctx.shadowColor = 'rgba(255,200,160,0.35)';
      ctx.shadowBlur = 6 * dpr;
      for (const group of constellations){
        if (!group.length) continue;
        ctx.beginPath();
        ctx.moveTo(group[0].x, group[0].y);
        for (let i=1;i<group.length;i++){
          const p = group[i];
          ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();

        // bright star nodes
        for (const p of group){
          ctx.beginPath();
          ctx.globalAlpha = 0.9;
          ctx.arc(p.x, p.y, 1.6 * dpr, 0, Math.PI*2);
          ctx.fillStyle = '#fff2dd';
          ctx.fill();
        }
      }
      ctx.restore();
    }

    let raf = 0;
    let last = performance.now();
    function loop(now){
      const dt = now - last; // unused but kept for potential future use
      last = now;
      draw(now * 0.001);
      raf = requestAnimationFrame(loop);
    }

    function onVis(){
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { last = performance.now(); raf = requestAnimationFrame(loop); }
    }

    addEventListener('resize', () => { clearTimeout(resize._t); resize._t = setTimeout(resize, 120); }, { passive:true });
    document.addEventListener('visibilitychange', onVis);

    resize();
    raf = requestAnimationFrame(loop);
  }
})();
