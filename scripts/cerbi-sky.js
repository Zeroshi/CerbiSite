/* Cerbi Forest JS — stars, gradient scroll, interactions */
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  // Year
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  // Theme
  const prefersLight = matchMedia('(prefers-color-scheme: light)').matches;
  const html = document.documentElement;
  const themeBtn = $('#themeBtn');
  html.setAttribute('data-theme', localStorage.getItem('theme') || (prefersLight ? 'light' : 'dark'));
  themeBtn?.addEventListener('click', () => {
    const now = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', now); localStorage.setItem('theme', now);
  });

  // Mobile nav
  const navToggle = $('#navToggle');
  const nav = $('#primaryNav');
  navToggle?.addEventListener('click', () => {
    nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', nav.classList.contains('open'));
  });

  // Spotlight follows cursor
  const spotlight = $('.spotlight');
  document.addEventListener('pointermove', (e) => {
    spotlight?.style.setProperty('--mx', e.clientX + 'px');
    spotlight?.style.setProperty('--my', e.clientY + 'px');
  }, { passive: true });

  // Progress bar
  const progress = $('#progress');
  const setProgress = () => {
    const max = document.body.scrollHeight - innerHeight;
    const pct = Math.max(0, Math.min(1, scrollY / (max || 1)));
    progress.style.width = (pct * 100) + '%';
  };
  document.addEventListener('scroll', setProgress, { passive: true });
  setProgress();

  // Reveal-on-scroll
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) e.target.classList.add('in');
  }, { threshold: 0.12 }) : null;
  $$('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  // Tilt + glare
  $$('.tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--gx', ((e.clientX - r.left) / r.width) * 100 + '%');
      card.style.setProperty('--gy', ((e.clientY - r.top) / r.height) * 100 + '%');
    }, { passive: true });
  });

  // Copy buttons
  $$('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-copy');
      const el = document.querySelector(target);
      const text = el ? el.textContent : '';
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        const old = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => (btn.textContent = old), 1000);
      });
    });
  });

  // Command palette
  const cmdBtn = $('#cmdBtn');
  const overlay = $('#cmdkOverlay');
  const cmdk = $('.cmdk', overlay);
  const input = $('#cmdkInput');
  const list = $('#cmdkList');
  const commands = [
    { label: '📦 View Packages', action: () => location.hash = '#packages' },
    { label: '🔐 Governance', action: () => location.hash = '#governance' },
    { label: '🧭 Architecture', action: () => location.hash = '#architecture' },
    { label: '📣 Contact', action: () => location.hash = '#contact' },
  ];
  function openCmd(){ overlay.style.display='block'; cmdk.style.display='block'; input.value=''; renderCmd(''); setTimeout(()=>input.focus(),0); }
  function closeCmd(){ overlay.style.display='none'; cmdk.style.display='none'; }
  function renderCmd(q){
    const ql = q.trim().toLowerCase(); list.innerHTML='';
    commands.filter(c => !ql || c.label.toLowerCase().includes(ql)).forEach(c => {
      const item = document.createElement('div'); item.className='item';
      item.innerHTML = `<span>${c.label}</span><span class="kbd">Enter</span>`; item.tabIndex=0;
      item.addEventListener('click', ()=>{ c.action(); closeCmd(); });
      item.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ c.action(); closeCmd(); }});
      list.appendChild(item);
    });
    if(!list.children.length){ const none = document.createElement('div'); none.className='item'; none.textContent='No results'; list.appendChild(none); }
  }
  cmdBtn?.addEventListener('click', openCmd);
  overlay?.addEventListener('click', (e)=>{ if(e.target===overlay) closeCmd(); });
  input?.addEventListener('input', (e)=> renderCmd(e.target.value));
  document.addEventListener('keydown', (e)=>{
    if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openCmd(); }
    if(e.key==='Escape') closeCmd();
  });

  // Compare filters
  const compareTable = $('#compareTable');
  const filterBtns = $$('.filter');
  const rows = compareTable ? $$('tbody tr', compareTable) : [];
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tag = btn.dataset.tag;
      rows.forEach(tr => {
        if (tag === 'all') { tr.style.display = ''; return; }
        const tags = tr.dataset.tags || '';
        tr.style.display = tags.includes(tag) ? '' : 'none';
      });
    });
  });

  // Governance demo logic
  const piiSwitch = $('#piiSwitch');
  const inputJson = $('#inputJson');
  const evalJson = $('#evalJson');
  const baseLog = {
    Timestamp: new Date().toISOString(),
    Level: "Information",
    Message: "Checkout complete",
    Properties: { OrderId: "A-102934", Amount: 129.99, UserId: "u-4821" }
  };
  const policies = {
    RequiredFields: ["Timestamp", "Level", "Message", "Properties.OrderId"],
    ForbiddenFields: ["Properties.SSN", "Properties.CreditCardNumber", "Properties.DOB"]
  };
  function has(path, obj){ return path.split('.').reduce((o,k)=> (o && k in o) ? o[k] : undefined, obj) !== undefined; }
  function evaluate(log){
    const violations = [];
    for(const f of policies.RequiredFields) if(!has(f, log)) violations.push({ field:f, type:"RequiredMissing", severity:"Error" });
    for(const f of policies.ForbiddenFields) if(has(f, log)) violations.push({ field:f, type:"ForbiddenPresent", severity:"Error" });
    return { outcome: violations.length ? "NonCompliant" : "Compliant", violations };
  }
  function renderDemo(includePII){
    const sample = JSON.parse(JSON.stringify(baseLog));
    if(includePII){ sample.Properties.CreditCardNumber = "4111 1111 1111 1111"; sample.Properties.DOB = "1990-01-01"; }
    if (inputJson) inputJson.textContent = JSON.stringify(sample, null, 2);
    if (evalJson)  evalJson.textContent  = JSON.stringify(evaluate(sample), null, 2);
  }
  if (piiSwitch && inputJson && evalJson) {
    renderDemo(false);
    const setSwitch = (on) => { piiSwitch.classList.toggle('on', on); piiSwitch.setAttribute('aria-checked', on ? 'true' : 'false'); renderDemo(on); };
    piiSwitch.addEventListener('click', () => setSwitch(!piiSwitch.classList.contains('on')));
    piiSwitch.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setSwitch(!piiSwitch.classList.contains('on')); }});
  }

  // ================== Scroll‑driven background palette ==================
  const palettes = [
    { start: "#09120f", end: "#0e1b15" },
    { start: "#0a1a14", end: "#0b2a21" },
    { start: "#0b2a21", end: "#0c2333" },
    { start: "#0c2333", end: "#140f1a" }
  ];
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const hexToRgb = (hex) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) } : { r:0,g:0,b:0 };
  };
  const rgbToHex = ({r,g,b}) => `#${[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')}`;
  const lerp = (a,b,t) => a + (b - a) * t;
  const lerpColor = (c1, c2, t) => ({
    r: Math.round(lerp(c1.r, c2.r, t)),
    g: Math.round(lerp(c1.g, c2.g, t)),
    b: Math.round(lerp(c1.b, c2.b, t))
  });
  const ease = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;

  const startRGB = palettes.map(p => hexToRgb(p.start));
  const endRGB   = palettes.map(p => hexToRgb(p.end));
  (() => { const first = palettes[0]; html.style.setProperty('--bg-start', first.start); html.style.setProperty('--bg-end', first.end); })();

  let ticking = false;
  function updateBg(){
    const docHeight = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const p = clamp(window.scrollY / docHeight, 0, 1);
    const segs = Math.max(1, palettes.length - 1);
    const pos = p * segs;
    const i = Math.min(segs - 1, Math.floor(pos));
    const t = ease(Math.min(1, Math.max(0, pos - Math.floor(pos))));
    const i2 = Math.min(segs, i + 1);
    const s = i2 >= startRGB.length ? startRGB[i] : {
      r: Math.round(startRGB[i].r + (startRGB[i2].r - startRGB[i].r) * t),
      g: Math.round(startRGB[i].g + (startRGB[i2].g - startRGB[i].g) * t),
      b: Math.round(startRGB[i].b + (startRGB[i2].b - startRGB[i].b) * t)
    };
    const e = i2 >= endRGB.length ? endRGB[i] : {
      r: Math.round(endRGB[i].r + (endRGB[i2].r - endRGB[i].r) * t),
      g: Math.round(endRGB[i].g + (endRGB[i2].g - endRGB[i].g) * t),
      b: Math.round(endRGB[i].b + (endRGB[i2].b - endRGB[i].b) * t)
    };
    html.style.setProperty('--bg-start', rgbToHex(s));
    html.style.setProperty('--bg-end',   rgbToHex(e));
    ticking = false;
  }
  function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(updateBg); } }
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', () => requestAnimationFrame(updateBg), { passive:true });
  window.addEventListener('load', updateBg, { once:true });
  updateBg();

  // ================== Starfield ==================
  const canvas = $('#sky');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W=0, H=0, DPR=1;
    const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let stars=[], lines=[];
    const STAR_COUNT_BASE = 180;

    function resize(){
      DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      W = Math.floor(innerWidth * DPR); H = Math.floor(innerHeight * DPR);
      canvas.width=W; canvas.height=H; canvas.style.width=innerWidth+'px'; canvas.style.height=innerHeight+'px';
      makeStars();
    }
    function rnd(min,max){ return Math.random()*(max-min)+min; }
    function makeStars(){
      const count = Math.floor(STAR_COUNT_BASE * (innerWidth*innerHeight) / (1280*720));
      stars = new Array(count).fill(0).map(()=>({ x:Math.random()*W, y:Math.random()*H, r:rnd(0.5,1.6)*DPR, a:rnd(0.35,0.85), tw:rnd(0.001,0.004), p:Math.random()*Math.PI*2 }));
      const CL=Math.max(1, Math.floor(count/180)); lines=[];
      for(let c=0;c<CL;c++){ const start=Math.floor(Math.random()*(count-5)); const len=3+Math.floor(Math.random()*3); const idxs=[]; for(let i=0;i<len;i++) idxs.push(start+i); lines.push(idxs); }
    }
    function draw(t){
      ctx.clearRect(0,0,W,H);
      ctx.save(); ctx.globalCompositeOperation='screen';
      for(const s of stars){
        const tw = prefersReduced ? 0 : (Math.sin(s.p + t*0.001*s.tw)*0.25);
        const a = Math.max(0, Math.min(1, s.a + tw));
        ctx.globalAlpha=a;
        ctx.beginPath();
        ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle='#ffffff';
        ctx.fill();
      }
      ctx.restore();
      ctx.save(); ctx.globalAlpha=0.08; ctx.strokeStyle='#ffe0c2'; ctx.lineWidth=Math.max(0.5,1*DPR);
      for(const group of lines){
        ctx.beginPath();
        const s0=stars[group[0]]; if(!s0) continue;
        ctx.moveTo(s0.x,s0.y);
        for(let i=1;i<group.length;i++){ const sn=stars[group[i]]; if(!sn) continue; ctx.lineTo(sn.x,sn.y); }
        ctx.stroke();
      }
      ctx.restore();
    }
    let rafId=0;
    function loop(now){ draw(now); rafId=requestAnimationFrame(loop); }
    document.addEventListener('visibilitychange', ()=>{ if(document.hidden) cancelAnimationFrame(rafId); else rafId=requestAnimationFrame(loop); });
    window.addEventListener('resize', ()=>{ clearTimeout(resize._t); resize._t=setTimeout(resize,120); }, { passive:true });
    resize(); rafId=requestAnimationFrame(loop);
  }
})();
