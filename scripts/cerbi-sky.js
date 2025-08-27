/* ====== Utilities ====== */
const qs = (sel, el=document)=>el.querySelector(sel);
const qsa = (sel, el=document)=>[...el.querySelectorAll(sel)];
const setTheme = t => {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('cerbi-theme', t);
  const meta = qs('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t==='light' ? '#ffffff' : '#0a1224');
};

/* ====== Sticky progress ====== */
const progressBar = qs('#progress');
const onScroll = () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
  progressBar.style.width = (scrolled * 100).toFixed(2) + '%';
};
window.addEventListener('scroll', onScroll, {passive:true});

/* ====== Theme toggle (persisted) ====== */
(() => {
  const saved = localStorage.getItem('cerbi-theme');
  if (saved) setTheme(saved);
  qs('#themeBtn')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(cur === 'dark' ? 'light' : 'dark');
  });
})();

/* ====== Mobile nav ====== */
qs('#navToggle')?.addEventListener('click', () => {
  const nav = qs('#primaryNav');
  const open = nav.classList.toggle('open');
  qs('#navToggle').setAttribute('aria-expanded', String(open));
});

/* ====== Command palette ====== */
(() => {
  const overlay = qs('#cmdkOverlay');
  const input = qs('#cmdkInput');
  const list = qs('#cmdkList');
  const items = [
    {label:'Why', href:'#why'}, {label:'Ecosystem', href:'#ecosystem'},
    {label:'Governance', href:'#governance'}, {label:'Packages', href:'#packages'},
    {label:'Repositories', href:'#repos'}, {label:'Compare', href:'#compare'},
    {label:'Architecture', href:'#architecture'}, {label:'Contact', href:'#contact'},
  ];
  if (!overlay) return;
  list.innerHTML = items.map(i=>`<div class="item"><span>${i.label}</span><span>${i.href}</span></div>`).join('');
  list.addEventListener('click', e=>{
    const item = e.target.closest('.item'); if(!item) return;
    location.hash = item.lastChild.textContent.trim();
    overlay.classList.remove('open');
  });
  const open = ()=>{ overlay.classList.add('open'); input.value=''; input.focus(); };
  const close = ()=>overlay.classList.remove('open');
  qs('#cmdBtn')?.addEventListener('click', open);
  window.addEventListener('keydown', e=>{
    if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k') { e.preventDefault(); open(); }
    if (e.key==='Escape') close();
  });
  overlay.addEventListener('click', e=>{ if(e.target===overlay) close(); });
})();

/* ====== Copy buttons ====== */
qsa('[data-copy]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const el = qs(btn.getAttribute('data-copy'));
    if (!el) return;
    const text = el.innerText || el.textContent || '';
    navigator.clipboard.writeText(text);
    btn.textContent = 'Copied!';
    setTimeout(()=>btn.textContent='Copy', 1200);
  });
});

/* ====== Reveal on scroll ====== */
const obs = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
},{threshold:.12});
qsa('.reveal').forEach(el=>obs.observe(el));

/* ====== Spotlight follow ====== */
document.addEventListener('pointermove', e=>{
  document.documentElement.style.setProperty('--mx', e.clientX+'px');
  document.documentElement.style.setProperty('--my', e.clientY+'px');
}, {passive:true});

/* ====== Random bottom background (background1.png, background2.png, ...) ====== */
(function loadRandomBottomBackground(){
  const maxTry = 50;
  const base = 'assets/background/background';
  const el = qs('#bgBottom'); if (!el) return;
  const img = new Image();
  const order = Array.from({length:maxTry}, (_,i)=>i+1).sort(()=>Math.random()-0.5);
  let k = 0;
  const tryNext = () => {
    if (k >= order.length) { el.style.display='none'; return; }
    img.src = `${base}${order[k++]}.png`;
  };
  img.onload = () => { el.style.backgroundImage = `url("${img.src}")`; };
  img.onerror = tryNext;
  tryNext();
})();

/* ====== Starfield with angled shooting stars (down-right) ====== */
(function starfield(){
  const canvas = qs('#sky'); if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;

  const DPR = Math.min(2, devicePixelRatio || 1);
  canvas.width = w * DPR; canvas.height = h * DPR; ctx.scale(DPR, DPR);

  const stars = [];
  const SHOT_MAX = 3;
  function makeStar(){
    return {
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*1.2 + .2,
      tw: Math.random()*1,
      s: Math.random() * .3 + .05
    };
  }
  for(let i=0;i<220;i++) stars.push(makeStar());

  const shots = [];
  function spawnShot(){
    if (shots.length >= SHOT_MAX) return;
    const x = -50 + Math.random()*150;
    const y = -40 + Math.random()*80;
    const speed = 6 + Math.random()*4;
    const angle = Math.PI/10; // ~18deg downward
    shots.push({
      x, y,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed*2,  // more downward component
      life: 0,
      maxLife: 120 + Math.random()*60
    });
  }

  let lastT = 0, acc = 0;
  function tick(t){
    requestAnimationFrame(tick);
    const dt = Math.min(50, t - lastT || 16); lastT = t;
    acc += dt;

    ctx.clearRect(0,0,w,h);

    // static stars (twinkle)
    ctx.fillStyle = '#d9e6ff';
    for(const s of stars){
      s.tw += s.s*dt*0.002;
      const a = 0.5 + Math.sin(s.tw)*0.5;
      ctx.globalAlpha = 0.2 + a*0.6;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (acc > 1200 + Math.random()*1200){ acc = 0; spawnShot(); }

    for (let i=shots.length-1;i>=0;i--){
      const s = shots[i];
      s.x += s.vx; s.y += s.vy; s.life += 1;

      const tx = s.x - s.vx*3, ty = s.y - s.vy*3;
      const grad = ctx.createLinearGradient(s.x, s.y, tx, ty);
      grad.addColorStop(0, 'rgba(197,219,255,.95)');
      grad.addColorStop(1, 'rgba(197,219,255,0)');
      ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(s.x, s.y); ctx.lineTo(tx, ty); ctx.stroke();

      if (s.x > w+60 || s.y > h+60 || s.life > s.maxLife) shots.splice(i,1);
    }
  }
  requestAnimationFrame(tick);

  window.addEventListener('resize', ()=>{
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    canvas.width = w * DPR; canvas.height = h * DPR; ctx.scale(DPR, DPR);
  }, {passive:true});
})();

/* ====== Governance live demo (toy) ====== */
(() => {
  const sw = qs('#piiSwitch');
  const input = qs('#inputJson');
  const evalEl = qs('#evalJson');
  if(!sw || !input || !evalEl) return;

  const make = on => ({
    timestamp: new Date().toISOString(),
    level: "Information",
    user: { id: "12345", email: on ? "jane@example.com" : undefined },
    action: "UserLoggedIn"
  });
  const render = obj => JSON.stringify(obj, null, 2);
  const evaluate = obj => {
    const violations = [];
    if (obj.user?.email) violations.push({ field:"user.email", type:"PII", rule:"Forbidden" });
    return { ok: violations.length===0, violations };
  };

  let on = false;
  function refresh(){
    const obj = make(on);
    input.textContent = render(obj);
    evalEl.textContent = render(evaluate(obj));
    sw.classList.toggle('on', on);
    sw.setAttribute('aria-checked', String(on));
  }
  refresh();
  const toggle = ()=>{ on = !on; refresh(); };
  sw.addEventListener('click', toggle);
  sw.addEventListener('keydown', e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); toggle(); }});
})();

/* ====== Compare table filters ====== */
(() => {
  const table = qs('#compareTable'); if(!table) return;
  const rows = qsa('tbody tr', table);
  const buttons = qsa('.filter');
  function apply(tag){
    buttons.forEach(b=>b.classList.toggle('active', b.dataset.tag===tag));
    rows.forEach(r=>{
      const tags = (r.getAttribute('data-tags')||'').split(/\s+/);
      r.style.display = (tag==='all'||tags.includes(tag)) ? '' : 'none';
    });
  }
  buttons.forEach(b=>b.addEventListener('click', ()=>apply(b.dataset.tag)));
  apply('all');
})();

/* ====== Enterprise tiles hover fallback if :has() unsupported ====== */
(() => {
  const supportsHas = CSS && CSS.supports && CSS.supports('selector(:has(*))');
  if (supportsHas) return;
  const container = document.querySelector('.cred-grid:not(.cred-tight)');
  if (!container) return;
  const cards = [...container.querySelectorAll('.cred')];

  const clear = () => cards.forEach(c => c.classList.remove('is-hover'));
  container.addEventListener('mouseleave', () => { container.classList.remove('hovering'); clear(); });
  container.addEventListener('mouseenter', () => container.classList.add('hovering'));
  cards.forEach(c => c.addEventListener('mouseenter', () => { clear(); c.classList.add('is-hover'); }));
})();

/* ====== Contact form (Formspree) ====== */
(() => {
  const form = qs('#contactForm'); if(!form) return;
  const status = qs('#formStatus');
  const endpoint = form.getAttribute('data-endpoint');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Sending…';
    const data = new FormData(form);
    try{
      const res = await fetch(endpoint, { method:'POST', body:data, headers:{ 'Accept':'application/json' }});
      if (res.ok){
        status.textContent = 'Thanks! We’ll be in touch shortly.';
        form.reset();
      } else {
        status.textContent = 'Hmm, something went wrong. Email hello@cerbi.io instead?';
      }
    }catch(err){
      status.textContent = 'Network issue—please try again or email us directly.';
    }
  });
})();

/* ====== Dashboard auto-rotate (expands to ~80%) ====== */
(() => {
  const gallery = qs('#dashGallery'); if(!gallery) return;
  const shots = qsa('.dash-shot', gallery);
  const dotsWrap = qs('#dashDots');
  let i = 0, timer = null;

  const setActive = (idx) => {
    i = (idx + shots.length) % shots.length;
    shots.forEach((s,k)=>s.classList.toggle('active', k===i));
    if (dotsWrap){
      const dots = qsa('button', dotsWrap);
      dots.forEach((d,k)=>d.classList.toggle('active', k===i));
    }
  };

  // dots
  if (dotsWrap){
    shots.forEach((_,k)=>{
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Show slide ${k+1}`);
      b.addEventListener('click', ()=>{ setActive(k); restart(); });
      dotsWrap.appendChild(b);
    });
  }

  const next = ()=> setActive(i+1);
  const start = ()=> timer = setInterval(next, 4500);
  const stop = ()=> timer && clearInterval(timer);
  const restart = ()=>{ stop(); start(); };

  // pause on hover
  gallery.addEventListener('mouseenter', stop);
  gallery.addEventListener('mouseleave', start);

  // click to focus a shot
  shots.forEach((s,k)=> s.addEventListener('click', ()=>{ setActive(k); restart(); }));

  setActive(0); start();
})();

/* ====== Year ====== */
(() => { const y = qs('#year'); if (y) y.textContent = new Date().getFullYear(); })();
