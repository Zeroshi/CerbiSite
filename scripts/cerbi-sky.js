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

/* ====== Command palette (demo) ====== */
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
qsa('.copy-btn').forEach(btn=>{
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

/* ====== Compare filters ====== */
qsa('.filter').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    qsa('.filter').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const tag = btn.dataset.tag;
    const rows = qsa('#compareTable tbody tr');
    rows.forEach(r=>{
      if (tag==='all') { r.style.display=''; return; }
      const tags = (r.dataset.tags||'').split(' ');
      r.style.display = tags.includes(tag) ? '' : 'none';
    });
  });
});

/* ====== Footer year ====== */
const y = new Date().getFullYear();
const yEl = qs('#year'); if (yEl) yEl.textContent = y;

/* ====== Random fixed-bottom background (assets/background/background{1..50}.png) ====== */
(function(){
  const target = qs('#bg-fixed'); if(!target) return;
  // Try up to 50, pick a random first, if not found try a few others
  const max = 50;
  const order = Array.from({length:max}, (_,i)=>i+1)
    .map(n=>({n, r: Math.random()}))
    .sort((a,b)=>a.r-b.r)
    .map(x=>x.n);
  let applied = false;
  function trySet(i){
    const img = new Image();
    img.onload = () => { if (applied) return; target.style.backgroundImage = `url(assets/background/background${i}.png)`; applied = true; };
    img.onerror = ()=>{};
    img.src = `assets/background/background${i}.png`;
  }
  // test the first 6 randoms to keep perf snappy
  order.slice(0,6).forEach(trySet);
})();

/* ====== Star field + angled meteors ====== */
(() => {
  const c = qs('#sky'); if(!c) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const ctx = c.getContext('2d');

  let W, H, stars=[], meteors=[];
  const STAR_CT = 180;
  const METEOR_CT = 6; // a few at a time
  const ANGLE = Math.PI * (68/180); // ~68° down-right

  function resize(){
    W = c.width = Math.floor(window.innerWidth * dpr);
    H = c.height = Math.floor(window.innerHeight * dpr);
    c.style.width = '100%'; c.style.height = '100%';
  }
  resize(); window.addEventListener('resize', resize);

  function seed(){
    stars = Array.from({length: STAR_CT}, ()=>({
      x: Math.random()*W,
      y: Math.random()*H,
      r: Math.random()*1.8 + 0.2,
      a: Math.random()*0.6 + 0.2,
      tw: Math.random()*0.02 + 0.005
    }));
    meteors = Array.from({length:METEOR_CT}, ()=>newMeteor());
  }
  function newMeteor(){
    // start slightly above/left so they streak down-right
    const speed = Math.random()*1.2 + 0.6;
    const len = Math.random()*140*dpr + 80*dpr;
    const off = Math.random()*W*0.6;
    return {
      x: -100*dpr + off,
      y: -60*dpr + Math.random()*H*0.25,
      vx: Math.cos(ANGLE)*speed*3.2*dpr,
      vy: Math.sin(ANGLE)*speed*3.2*dpr,
      len, life: 1
    };
  }

  function step(){
    ctx.clearRect(0,0,W,H);

    // stars
    stars.forEach(s=>{
      s.a += s.tw;
      const alpha = 0.3 + Math.sin(s.a)*0.3;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    });

    // meteors
    meteors.forEach(m=>{
      m.x += m.vx; m.y += m.vy; m.life -= 0.003;
      const tx = m.x - Math.cos(ANGLE)*m.len;
      const ty = m.y - Math.sin(ANGLE)*m.len;
      const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
      g.addColorStop(0, 'rgba(160,200,255,.9)');
      g.addColorStop(1, 'rgba(160,200,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 2*dpr;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
      if (m.x > W+120*dpr || m.y > H+80*dpr || m.life<=0) {
        Object.assign(m, newMeteor());
      }
    });

    requestAnimationFrame(step);
  }

  seed(); step();
})();

/* ====== Tilt glare tracking ====== */
qsa('.tilt').forEach(el=>{
  el.addEventListener('pointermove', e=>{
    const r = el.getBoundingClientRect();
    el.style.setProperty('--gx', ((e.clientX-r.left)/r.width*100)+'%');
    el.style.setProperty('--gy', ((e.clientY-r.top)/r.height*100)+'%');
  }, {passive:true});
});

/* ====== Make enterprise tiles keyboard-focus scalable ====== */
qsa('.enterprise-strip .tile').forEach(tile=>{
  tile.tabIndex = 0;
  tile.addEventListener('focus', ()=> tile.classList.add('focus'));
  tile.addEventListener('blur', ()=> tile.classList.remove('focus'));
});

/* ====== Initialize command list content ====== */
(() => {
  const overlay = qs('#cmdkOverlay'); if(!overlay) return;
  const list = qs('#cmdkList');
  if (list && !list.children.length) list.innerHTML = '<div class="item"><span>Jump to</span><span>#why</span></div>';
})();
