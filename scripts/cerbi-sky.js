/* Cerbi Sky — stars, shooting stars, UI helpers, scroll gradient, overlay control */
(() => {
  const $  = (s, r=document) => r.querySelector(s);
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
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => { for (const e of entries) if (e.isIntersecting) e.target.classList.add('in'); }, { threshold: 0.12 })
    : null;
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

  // Command palette (overlay hidden by default; toggled via .open)
  const cmdBtn = $('#cmdBtn');
  const overlay = $('#cmdkOverlay');
  const input = $('#cmdkInput');
  const list = $('#cmdkList');
  const commands = [
    { label: '📦 View Packages', action: () => location.hash = '#packages' },
    { label: '🔐 Governance', action: () => location.hash = '#governance' },
    { label: '🧭 Architecture', action: () => location.hash = '#architecture' },
    { label: '📣 Contact', action: () => location.hash = '#contact' },
  ];
  function openCmd(){ overlay.classList.add('open'); input.value=''; renderCmd(''); setTimeout(()=>input.focus(),0); }
  function closeCmd(){ overlay.classList.remove('open'); }
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

  // Compare filters (show/hide rows by tag)
  const compareTable = $('#compareTable');
  if (compareTable){
    const filterBtns = $$('.filter');
    const rows = $$('tbody tr', compareTable);
    filterBtns.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        filterBtns.forEach(b=>b.classList.remove('active')); btn.classList.add('active');
        const tag = btn.dataset.tag;
        rows.forEach(tr=>{
          if(tag==='all'){ tr.style.display=''; return; }
          const tags = tr.dataset.tags || '';
          tr.style.display = tags.includes(tag) ? '' : 'none';
        });
      });
    });
  }

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

  // ================== Scroll-driven background palette ==================
  const palettes = [
    { start: "#09120f", end: "#0e1b15" },
    { start: "#0a1a14", end: "#0b2a21" },
    { start: "#0b2a21", end: "#0c2333" },
    { start: "#0c2333", end: "#140f1a" }
  ];
  const clamp = (v,min,max)=>Math.min(max,Math.max(min,v));
  const hexToRgb = (h)=>{ const m=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h); return m?{r:parseInt(m[1],16),g:parseInt(m[2],16),b:parseInt(m[3],16)}:{r:0,g:0,b:0}; };
  const rgbToHex = ({r,g,b})=>`#${[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')}`;
  const lerp=(a,b,t)=>a+(b-a)*t;
  const lerpColor=(c1,c2,t)=>({r:Math.round(lerp(c1.r,c2.r,t)),g:Math.round(lerp(c1.g,c2.g,t)),b:Math.round(lerp(c1.b,c2.b,t))});
  const ease=t=> t<0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

  const startRGB = palettes.map(p=>hexToRgb(p.start));
  const endRGB   = palettes.map(p=>hexToRgb(p.end));
  function updateBg(){
    const docHeight = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const p = clamp(window.scrollY / docHeight, 0, 1);
    const segs=Math.max(1, palettes.length-1);
    const pos=p*segs; const i=Math.min(segs-1, Math.floor(pos));
    const t=ease(clamp(pos-i,0,1)); const i2=Math.min(segs, i+1);
    const s=lerpColor(startRGB[i], startRGB[i2], t); const e=lerpColor(endRGB[i], endRGB[i2], t);
    html.style.setProperty('--bg-start', rgbToHex(s));
    html.style.setProperty('--bg-end',   rgbToHex(e));
  }
  addEventListener('scroll', ()=>requestAnimationFrame(updateBg), { passive:true });
  addEventListener('resize', ()=>requestAnimationFrame(updateBg), { passive:true });
  addEventListener('load', updateBg, { once:true });
  updateBg();

  // ================== Stars & Shooting Stars ==================
  const canvas = $('#sky'); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let dpr = Math.max(1, Math.min(2, devicePixelRatio||1));
  let W=0, H=0;
  function resize(){
    dpr = Math.max(1, Math.min(2, devicePixelRatio||1));
    W = Math.floor(innerWidth * dpr); H = Math.floor(innerHeight * dpr);
    canvas.width=W; canvas.height=H; canvas.style.width=innerWidth+'px'; canvas.style.height=innerHeight+'px';
    makeStars();
  }
  addEventListener('resize', ()=>{ clearTimeout(resize._t); resize._t=setTimeout(resize,120); }, { passive:true });

  const stars=[]; const STAR_COUNT_BASE = 180;
  const rnd=(a,b)=>Math.random()*(b-a)+a;
  function makeStars(){
    stars.length=0;
    const count = Math.floor(STAR_COUNT_BASE * (innerWidth*innerHeight) / (1280*720));
    for(let i=0;i<count;i++){
      stars.push({
        x: Math.random()*W,
        y: Math.random()*H*0.92,
        r: rnd(0.6,1.6)*dpr,
        a: rnd(0.35,0.85),
        tw: rnd(0.8,2.2),   // twinkle rate
        p: Math.random()*Math.PI*2
      });
    }
  }

  const shooting=[]; let nextShootAt=0;
  function schedule(now){ const min=prefersReduced?12000:7000, max=prefersReduced?20000:18000; nextShootAt = now + rnd(min,max); }
  function spawn(){
    const sx = rnd(-0.1*W, 0.3*W), sy = rnd(-0.05*H, 0.35*H);
    const speed = rnd(600,1100)*dpr; const life = rnd(500,900); const ang = rnd(Math.PI*0.12, Math.PI*0.28);
    shooting.push({ x:sx, y:sy, vx:Math.cos(ang)*speed/1000, vy:Math.sin(ang)*speed/1000, born:performance.now(), life, len:rnd(80,180)*dpr });
  }

  function draw(now){
    ctx.clearRect(0,0,W,H);
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'rgba(0,0,0,0.10)'); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation='screen';

    for(const s of stars){
      const alpha = s.a * (0.7 + 0.3 * Math.sin(s.p + now*0.001*s.tw));
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle='rgba(255,244,230,0.95)'; ctx.fill();
    }

    ctx.globalAlpha = 1;
    for(let i=shooting.length-1;i>=0;i--){
      const m=shooting[i], t=now - m.born; if(t>m.life){ shooting.splice(i,1); continue; }
      const px=m.x + m.vx*t, py=m.y + m.vy*t;
      const tail = Math.min(m.len, (t/m.life)*m.len);
      const ang = Math.atan2(m.vy, m.vx);
      const tx = px - Math.cos(ang)*tail, ty = py - Math.sin(ang)*tail;
      const grad = ctx.createLinearGradient(tx,ty,px,py);
      grad.addColorStop(0,'rgba(255,255,255,0)');
      grad.addColorStop(1,'rgba(255,230,200,0.9)');
      ctx.strokeStyle=grad; ctx.lineWidth=Math.max(1,1.2*dpr);
      ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(px,py); ctx.stroke();
      ctx.beginPath(); ctx.arc(px,py,1.2*dpr,0,Math.PI*2); ctx.fillStyle='rgba(255,248,240,0.95)'; ctx.fill();
    }

    if (!prefersReduced) {
      if (nextShootAt === 0) schedule(now);
      if (now > nextShootAt) { spawn(); schedule(now); }
    }

    requestAnimationFrame(draw);
  }

  resize(); requestAnimationFrame(draw);
})();
