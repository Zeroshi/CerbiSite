/* ===== Utilities ===== */
const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];
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

/* ===== Theme toggle (persist) ===== */
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

/* ===== Command palette (simple) ===== */
(() => {
  const overlay = qs('#cmdkOverlay');
  const input = qs('#cmdkInput');
  const list = qs('#cmdkList');
  const items = [
    {label:'Why', href:'#why'},{label:'Ecosystem', href:'#ecosystem'},{label:'Governance', href:'#governance'},
    {label:'Packages', href:'#packages'},{label:'Repositories', href:'#repos'},{label:'Compare', href:'#compare'},
    {label:'Architecture', href:'#architecture'},{label:'Contact', href:'#contact'},
  ];
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

/* ===== Governance demo (toy) ===== */
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
  const update = (on) => {
    const log = make(on);
    input.textContent = render(log);
    evalEl.textContent = render(evaluate(log));
  };
  update(false);

  const toggle = () => { sw.classList.toggle('on'); sw.setAttribute('aria-checked', sw.classList.contains('on')); update(sw.classList.contains('on')); };
  sw.addEventListener('click', toggle);
  sw.addEventListener('keydown', e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); toggle(); }});
})();

/* ===== Compare filters ===== */
(() => {
  const table = qs('#compareTable'); if(!table) return;
  const rows = [...table.tBodies[0].rows];
  const set = tag => {
    rows.forEach(r=>{
      if (tag==='all') r.style.display='';
      else r.style.display = r.dataset.tags?.includes(tag) ? '' : 'none';
    });
    qsa('.filter').forEach(b=>b.classList.toggle('active', b.dataset.tag===tag));
  };
  qsa('.filter').forEach(b=>b.addEventListener('click', ()=>set(b.dataset.tag)));
})();

/* ===== Contact form ===== */
/* Default: mailto (no backend). To use Formspree/Netlify, set FORM_ENDPOINT to your URL. */
(() => {
  const form = qs('#contactForm'); if(!form) return;
  const status = qs('#contactStatus');
  const FORM_ENDPOINT = ''; // e.g., "https://formspree.io/f/xxxxxx"

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (FORM_ENDPOINT){
      try{
        const res = await fetch(FORM_ENDPOINT, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
        if (!res.ok) throw 0;
        status.textContent = 'Thanks! We’ll get back to you shortly.';
        form.reset();
      }catch{
        status.textContent = 'Hmm, something went wrong. Email us at hello@cerbi.io.';
      }
    }else{
      const body = encodeURIComponent(
        `Name: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company||''}\nDemo: ${data.demo?'Yes':'No'}\n\n${data.message}`
      );
      window.location.href = `mailto:hello@cerbi.io?subject=Cerbi inquiry — ${encodeURIComponent(data.name)}&body=${body}`;
      status.textContent = 'Opening your email client…';
    }
  });
})();

/* ===== Starfield + shooting stars (angled) ===== */
(() => {
  const canvas = qs('#sky'); if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  window.addEventListener('resize', ()=>{ w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; });

  const stars = [];
  const meteors = [];
  const STAR_COUNT = Math.min(800, Math.floor(w*h/3000));
  const rand = (a,b)=>a + Math.random()*(b-a);

  for(let i=0;i<STAR_COUNT;i++){
    stars.push({ x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.2+0.2, a: Math.random()*0.6+0.4, tw: Math.random()*0.02+0.005 });
  }

  const spawnMeteor = () => {
    const angle = (-24 * Math.PI/180); // -24° down-right
    const speed = rand(9,14);
    const len = rand(140,220);
    const x = rand(-w*0.2, w*0.8);
    const y = rand(-h*0.1, h*0.3);
    meteors.push({x,y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, len, life: 1});
  };

  let last = 0;
  const tick = (t=0) => {
    const dt = (t-last)||16; last = t;
    ctx.clearRect(0,0,w,h);

    // stars
    ctx.save();
    for(const s of stars){
      s.a += s.tw;
      ctx.globalAlpha = 0.5 + 0.5*Math.sin(s.a);
      ctx.fillStyle = '#dfe9ff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();

    // meteors
    if (Math.random() < 0.012 && meteors.length < 3) spawnMeteor();
    for (let i=meteors.length-1;i>=0;i--){
      const m = meteors[i];
      m.x += m.vx; m.y += m.vy; m.life -= dt*0.0009;
      if (m.life<=0 || m.x> w+300 || m.y> h+300) { meteors.splice(i,1); continue; }
      const tx = m.x - m.vx*8, ty = m.y - m.vy*8;
      const grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
      grad.addColorStop(0, 'rgba(255,255,255,.85)');
      grad.addColorStop(1, 'rgba(78,163,255,0)');
      ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
    }
    requestAnimationFrame(tick);
  };
  tick();
})();

/* ===== Tilt glare follow ===== */
qsa('.tilt').forEach(card=>{
  card.addEventListener('pointermove', e=>{
    const r = card.getBoundingClientRect();
    card.style.setProperty('--gx', ((e.clientX - r.left)/r.width*100).toFixed(2)+'%');
    card.style.setProperty('--gy', ((e.clientY - r.top)/r.height*100).toFixed(2)+'%');
  });
});

/* Year */
qs('#year')?.appendChild(document.createTextNode(new Date().getFullYear()));
