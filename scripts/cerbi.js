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
(() => {
  const progressBar = qs('#progress');
  if (!progressBar) return;
  const onScroll = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
    progressBar.style.width = (scrolled * 100).toFixed(2) + '%';
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();

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

/* ===== Command palette (optional demo) ===== */
(() => {
  const overlay = qs('#cmdkOverlay');
  const input = qs('#cmdkInput');
  const list = qs('#cmdkList');
  const trig = qs('#cmdBtn');
  if (!overlay || !input || !list || !trig) return;

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

  const render = (rows) => {
    list.innerHTML = rows.map(i=>`<div class="item" data-href="${i.href}"><span>${i.label}</span><span>${i.href}</span></div>`).join('');
  };
  render(items);

  list.addEventListener('click', e=>{
    const item = e.target.closest('.item'); if(!item) return;
    const dest = item.getAttribute('data-href') || item.lastChild?.textContent?.trim();
    if (dest) location.hash = dest;
    overlay.classList.remove('open');
  });

  const open = ()=>{ overlay.classList.add('open'); input.value=''; input.focus(); render(items); };
  const close = ()=>overlay.classList.remove('open');

  trig.addEventListener('click', open);
  window.addEventListener('keydown', e=>{
    if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k') { e.preventDefault(); open(); }
    if (e.key==='Escape') close();
  });
  overlay.addEventListener('click', e=>{ if(e.target===overlay) close(); });

  input.addEventListener('input', ()=>{
    const q = input.value.trim().toLowerCase();
    if (!q) return render(items);
    const filtered = items.filter(i=>i.label.toLowerCase().includes(q) || i.href.toLowerCase().includes(q));
    render(filtered);
  });
})();

/* ===== Copy buttons ===== */
qsa('[data-copy]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const el = qs(btn.getAttribute('data-copy'));
    if (!el) return;
    const text = el.innerText || el.textContent || '';
    navigator.clipboard.writeText(text);
    const old = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(()=>btn.textContent = old || 'Copy', 1200);
  });
});

/* ===== Reveal on scroll ===== */
(() => {
  const els = qsa('.reveal'); if (!els.length) return;
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
  },{threshold:.12});
  els.forEach(el=>obs.observe(el));
})();

/* ===== Spotlight follow ===== */
document.addEventListener('pointermove', e=>{
  document.documentElement.style.setProperty('--mx', e.clientX+'px');
  document.documentElement.style.setProperty('--my', e.clientY+'px');
}, {passive:true});

/* ===== Random bottom illustration loader ===== */
(() => {
  const el = qs('#bg-illustration'); if (!el) return;
  const MAX = 50;         // expects assets/background/background1.png ... background50.png
  const pick = 1 + Math.floor(Math.random()*MAX);
  const url = `assets/background/background${pick}.png`;
  const img = new Image();
  img.onload = () => {
    el.style.setProperty('--bg-illustration', `url("${url}")`);
    el.classList.add('show');
  };
  img.onerror = () => { /* silently ignore */ };
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
  function start(){ stop(); timer = setInterval(next, 5200); }
  function stop(){ if (timer) clearInterval(timer); }

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

/* ===== Perf chart (Chart.js) ===== */
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

/* ===== Floating Contact FAB: hide when contact section visible ===== */
(() => {
  const fab = document.querySelector('.contact-fab');
  const contact = document.querySelector('#contact');
  if (!fab || !contact || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries)=>{
    for (const e of entries){
      if (e.target === contact){
        if (e.isIntersecting) fab.classList.add('is-hidden');
        else fab.classList.remove('is-hidden');
      }
    }
  }, { rootMargin: '0px 0px -20% 0px', threshold: 0.05 });

  io.observe(contact);
})();

/* ===== Cerbi pop-art rotator v2 =====
   - Looks for assets/popart/popart-01..50.(png|jpg|jpeg|webp)
   - Randomizes order & starting slide
   - Crossfade + random motion per slide
*/
(() => {
  const MAX = 50;
  const DURATION = 6000; // ms per slide
  const rot = document.getElementById('sigRotator');
  if (!rot) return;

  const variants = ['sigZoom','sigPanLeft','sigPanRight','sigTiltIn','sigDriftUp','sigDriftDown'];
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

  // Fisher-Yates shuffle
  const shuffle = a => { for (let i=a.length-1; i>0; i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

  let found = [];
  let probes = 0;

  function finalize(){
    if (!found.length){
      rot.innerHTML = '<div style="display:grid;place-items:center;height:100%;color:var(--muted)">Drop images into <code>assets/popart/</code> like <em>popart-01.png</em>…</div>';
      return;
    }
    found = shuffle(found);
    const startIndex = Math.floor(Math.random() * found.length);

    const els = found.map((src,i)=>{
      const img = new Image();
      img.decoding = 'async';
      img.alt = 'Cerbi pop-art panel ' + (i+1);
      img.src = src;
      rot.appendChild(img);
      return img;
    });

    let idx = startIndex;
    let timer = null;

    function applyMotion(el){
      const name = pick(variants);
      const secs = (DURATION/1000).toFixed(2) + 's';
      el.style.animation = 'none';
      requestAnimationFrame(()=>{ el.style.animation = `${name} ${secs} ease-in-out both`; });
    }
    function show(n){
      els.forEach((el,j)=>{
        const on = (j===n);
        el.classList.toggle('show', on);
        if (on) applyMotion(el);
      });
    }

    show(idx);
    timer = setInterval(()=>{ idx = (idx+1)%els.length; show(idx); }, DURATION);
  }

  // Probe files (png/jpg/jpeg/webp)
  for (let i=1; i<=MAX; i++){
    const n = String(i).padStart(2,'0');
    ['png','jpg','jpeg','webp'].forEach(ext=>{
      const url = `assets/popart/popart-${n}.${ext}`;
      const probe = new Image();
      probe.onload  = ()=>{ found.push(url); if(++probes===MAX*4) finalize(); };
      probe.onerror = ()=>{ if(++probes===MAX*4) finalize(); };
      probe.src = url + `?cb=${Date.now()}`; // bust cache first load
    });
  }
})();
