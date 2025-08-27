/* ===== Utilities ===== */
const qs = (sel, el=document)=>el.querySelector(sel);
const qsa = (sel, el=document)=>[...el.querySelectorAll(sel)];
const setTheme = t => {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('cerbi-theme', t);
  const meta = qs('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t==='light' ? '#ffffff' : '#0a1224');
};

/* ===== Sticky progress ===== */
const progressBar = qs('#progress');
const onScroll = () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
  progressBar.style.width = (scrolled * 100).toFixed(2) + '%';
};
window.addEventListener('scroll', onScroll, {passive:true});

/* ===== Theme toggle (persisted) ===== */
(() => {
  const saved = localStorage.getItem('cerbi-theme');
  if (saved) setTheme(saved);
  qs('#themeBtn')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(cur === 'dark' ? 'light' : 'dark');
  });
})();

/* ===== Mobile nav ===== */
qs('#navToggle')?.addEventListener('click', () => {
  const nav = qs('#primaryNav');
  const open = nav.classList.toggle('open');
  qs('#navToggle').setAttribute('aria-expanded', String(open));
});

/* ===== Command palette (tiny demo) ===== */
(() => {
  const overlay = qs('#cmdkOverlay');
  const input = qs('#cmdkInput');
  const list = qs('#cmdkList');
  const items = [
    {label:'Why', href:'#why'},
    {label:'Ecosystem', href:'#ecosystem'},
    {label:'Governance', href:'#governance'},
    {label:'Packages', href:'#packages'},
    {label:'Repositories', href:'#repos'},
    {label:'Compare', href:'#compare'},
    {label:'Architecture', href:'#architecture'},
    {label:'Contact', href:'#contact'},
  ];
  if (list) {
    list.innerHTML = items.map(i=>`<div class="item"><span>${i.label}</span><span>${i.href}</span></div>`).join('');
    list.addEventListener('click', e=>{
      const item = e.target.closest('.item'); if(!item) return;
      location.hash = item.lastChild.textContent.trim();
      overlay.classList.remove('open');
    });
  }
  const open = ()=>{ overlay.classList.add('open'); input.value=''; input.focus(); };
  const close = ()=>overlay.classList.remove('open');
  qs('#cmdBtn')?.addEventListener('click', open);
  window.addEventListener('keydown', e=>{
    if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k') { e.preventDefault(); open(); }
    if (e.key==='Escape') close();
  });
  overlay?.addEventListener('click', e=>{ if(e.target===overlay) close(); });
})();

/* ===== Copy buttons ===== */
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

/* ===== Reveal on scroll ===== */
const obs = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
},{threshold:.12});
qsa('.reveal').forEach(el=>obs.observe(el));

/* ===== Spotlight follow ===== */
document.addEventListener('pointermove', e=>{
  document.documentElement.style.setProperty('--mx', e.clientX+'px');
  document.documentElement.style.setProperty('--my', e.clientY+'px');
}, {passive:true});

/* ===== Starfield (canvas) ===== */
(() => {
  const canvas = qs('#sky');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let dpr = Math.max(1, window.devicePixelRatio || 1);
  let stars = [];
  const STAR_DENSITY = 0.12; // per 1000px^2

  function resize() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(900, Math.floor((w*h)/1000 * STAR_DENSITY));
    stars = Array.from({length: count}, ()=>({
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*1.2 + 0.3,
      a: Math.random()*0.6 + 0.2,
      tw: (Math.random()*0.8 + 0.2) * (Math.random()<0.5?-1:1)
    }));
  }

  function draw() {
    const w = canvas.width/dpr, h = canvas.height/dpr;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = '#ffffff';
    for (const s of stars){
      s.a += s.tw*0.015;
      if (s.a>1){ s.a=1; s.tw*=-1; } else if (s.a<0.15){ s.a=0.15; s.tw*=-1; }
      ctx.globalAlpha = s.a;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize(); requestAnimationFrame(draw);
})();

/* ===== Governance live demo (toy) ===== */
(() => {
  const sw = qs('#piiSwitch');
  const input = qs('#inputJson');
  const evalEl = qs('#evalJson');
  if (!sw || !input || !evalEl) return;

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
  const update = () => {
    const obj = make(on);
    input.textContent = render(obj);
    evalEl.textContent = render(evaluate(obj));
  };
  sw.addEventListener('click', ()=>{ on=!on; sw.classList.toggle('on', on); sw.setAttribute('aria-checked', String(on)); update(); });
  sw.addEventListener('keydown', e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); sw.click(); }});
  update();
})();

/* ===== Compare filters ===== */
(() => {
  const buttons = qsa('.filter');
  const rows = qsa('#compareTable tbody tr');
  if (!buttons.length || !rows.length) return;

  const apply = (tag) => {
    rows.forEach(r=>{
      const tags = (r.getAttribute('data-tags')||'').split(/\s+/);
      const show = tag==='all' || tags.includes(tag);
      r.style.display = show ? '' : 'none';
    });
  };

  buttons.forEach(b=>{
    b.addEventListener('click', ()=>{
      buttons.forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      apply(b.dataset.tag || 'all');
    });
  });
})();

/* ===== Contact form (mailto fallback) ===== */
(() => {
  const form = qs('#contactForm');
  const status = qs('#formStatus');
  if (!form) return;

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get('name')?.toString().trim();
    const email = data.get('email')?.toString().trim();
    const company = data.get('company')?.toString().trim();
    const message = data.get('message')?.toString().trim();

    if (!name || !email || !message){
      status.textContent = 'Please fill name, email, and message.';
      return;
    }

    const subject = encodeURIComponent(`Cerbi.io inquiry — ${name} (${company||'no company'})`);
    const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}${company?`\n${company}`:''}`);
    window.location.href = `mailto:hello@cerbi.io?subject=${subject}&body=${body}`;
    status.textContent = 'Opening your email client…';
    form.reset();
  });
})();

/* ===== Year ===== */
(() => {
  const y = qs('#year');
  if (y) y.textContent = new Date().getFullYear().toString();
})();

/* ===== Comets every so often (top-left → bottom-right descent) ===== */
(() => {
  const layer = qs('#comets');
  if (!layer) return;
  const mk = ()=>{
    const s = document.createElement('span');
    s.className = 'comet';
    // start near the top-left quadrant
    const startX = -200 + Math.random()* (window.innerWidth*0.2);
    const startY = -120 + Math.random()* (window.innerHeight*0.3);
    s.style.setProperty('--x', startX + 'px');
    s.style.setProperty('--y', startY + 'px');
    layer.appendChild(s);
    setTimeout(()=>s.remove(), 3000);
  };
  setInterval(()=>{ if (Math.random() < 0.35) mk(); }, 4000);
})();
