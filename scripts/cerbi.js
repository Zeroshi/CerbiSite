/* ===== Utilities ===== */
const qs  = (sel, el=document)=>el.querySelector(sel);
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

/* ===== Command palette (demo) ===== */
(() => {
  const overlay = qs('#cmdkOverlay');
  const input = qs('#cmdkInput');
  const list = qs('#cmdkList');
  const items = [
    {label:'Why', href:'#why'},
    {label:'Quick Start', href:'#quickstart'},
    {label:'Ecosystem', href:'#ecosystem'},
    {label:'Governance', href:'#governance'},
    {label:'Dashboards', href:'#dashboards'},
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

/* ===== Random bottom illustration loader ===== */
(() => {
  const el = qs('#bg-illustration'); if (!el) return;
  const MAX = 50;         // name as background1.png ... background50.png
  const pick = 1 + Math.floor(Math.random()*MAX);
  const url = `assets/background/background${pick}.png`;
  const img = new Image();
  img.onload = () => {
    el.style.setProperty('--bg-illustration', `url("${url}")`);
    el.classList.add('show');
  };
  img.onerror = () => { /* silently ignore when file absent */ };
  img.src = url;
})();

/* ===== Dashboard slider (auto-rotate, dots, pause on hover) ===== */
(() => {
  const slider = qs('#dashSlider');
  if (!slider) return;
  const slides = qsa('.slide', slider);
  const dotsWrap = qs('.dots', slider);
  let idx = 0, timer;

  dotsWrap.innerHTML = slides.map((_,i)=>`<button aria-label="Go to slide ${i+1}"></button>`).join('');
  const dots = qsa('button', dotsWrap);

  function show(i){
    slides.forEach((s,j)=>s.classList.toggle('active', j===i));
    dots.forEach((d,j)=>d.classList.toggle('active', j===i));
    idx = i;
  }
  function next(){ show((idx+1)%slides.length); }
  function start(){ timer = setInterval(next, 5200); }
  function stop(){ clearInterval(timer); }

  dots.forEach((d,i)=>d.addEventListener('click', ()=>{ stop(); show(i); start(); }));
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);

  show(0); start();
})();

/* ===== Compare filter buttons ===== */
(() => {
  const table = qs('#compareTable'); if(!table) return;
  qsa('.filter').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      qsa('.filter').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const tag = btn.dataset.tag;
      qsa('#compareTable tbody tr').forEach(row=>{
        if(tag==='all'){ row.style.display=''; return; }
        const tags = row.getAttribute('data-tags')||'';
        row.style.display = tags.includes(tag) ? '' : 'none';
      });
    });
  });
})();

/* ===== Perf chart ===== */
(() => {
  const el = qs('#perfChart'); if (!el || !window.Chart) return;
  const styles = getComputedStyle(document.documentElement);
  const text = styles.getPropertyValue('--text').trim() || '#e9edf6';
  const grid = 'rgba(255,255,255,.10)';

  const ctx = el.getContext('2d');
  new Chart(ctx, {
    type:'line',
    data:{
      labels:['Baseline','With Fallback','Runtime Gov.','Build+Runtime','+Encryption'],
      datasets:[{
        label:'Throughput (relative)',
        data:[1.00, 0.98, 0.97, 0.96, 0.94],
        tension:0.35,
        borderWidth:2,
        pointRadius:3
      },{
        label:'p95 Latency (relative, lower=better)',
        data:[1.00, 1.02, 1.04, 1.05, 1.07],
        tension:0.35,
        borderWidth:2,
        pointRadius:3
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{ legend:{ labels:{ color:text } } },
      scales:{
        x:{ ticks:{ color:text }, grid:{ color:grid } },
        y:{ ticks:{ color:text }, grid:{ color:grid } }
      }
    }
  });
})();

/* ===== Governance live demo (toy) ===== */
(() => {
  const sw = qs('#piiSwitch'); if (!sw) return;
  const input = qs('#inputJson');
  const evalEl = qs('#evalJson');
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
    return { ok: violations.length === 0, violations };
  };
  function refresh(on){
    const payload = make(on);
    input.textContent = render(payload);
    evalEl.textContent = render(evaluate(payload));
  }
  let on = false;
  refresh(on);
  const toggle = ()=>{ on = !on; sw.setAttribute('aria-checked', String(on)); refresh(on); };
  sw.addEventListener('click', toggle);
  sw.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); toggle(); }});
})();

/* ===== Year ===== */
(() => { const y = qs('#year'); if (y) y.textContent = new Date().getFullYear(); })();
