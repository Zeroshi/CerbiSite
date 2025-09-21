/* ==========================================================================
   - Fixes theme init/toggle (syncs head script key + meta theme-color)
   - Adds robust mobile nav (open/close, scroll lock, outside click, ESC)
   - Keeps all existing functionality intact
   ========================================================================== */

/* ===== Utilities ===== */
const qs  = (sel, el=document)=>el.querySelector(sel);
const qsa = (sel, el=document)=>[...el.querySelectorAll(sel)];

/* ===== Theme helpers (migrate + sync) ===== */
const THEME_KEY   = 'cerbi-theme'; // this file’s key
const LEGACY_KEY  = 'theme';       // key used in the inline <head> script
const getSysTheme = () => matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

function setTheme(t, {persist = true, fromUser = false} = {}) {
  const theme = (t === 'light' || t === 'dark') ? t : getSysTheme();
  document.documentElement.setAttribute('data-theme', theme);

  // keep both keys in sync so the <head> boot script and this file agree
  if (persist) {
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem(LEGACY_KEY, theme);
  }

  // update meta theme-color to match UI chrome on mobile
  const meta = qs('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#ffffff' : '#0a1224');

  // let dependents (e.g., sky canvas) react if they want
  window.dispatchEvent(new CustomEvent('cerbi:theme', { detail: { theme, fromUser } }));
}

/* ===== Initial theme boot (migrate legacy key if needed) ===== */
(() => {
  const saved = localStorage.getItem(THEME_KEY) || localStorage.getItem(LEGACY_KEY);
  // If only legacy exists, copy to our key too (but keep legacy for the head script)
  if (saved && !localStorage.getItem(THEME_KEY)) {
    localStorage.setItem(THEME_KEY, saved);
  }
  setTheme(saved || getSysTheme(), { persist: !saved }); // persist only if first run
})();

/* Follow system changes ONLY if the user hasn't explicitly toggled */
(() => {
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const onChange = e => {
    const userSet = !!localStorage.getItem(THEME_KEY);
    if (!userSet) setTheme(e.matches ? 'dark' : 'light', { persist: false });
  };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else mq.addListener(onChange); // Safari
})();

/* Cross-tab/theme sync */
window.addEventListener('storage', e => {
  if (e.key === THEME_KEY || e.key === LEGACY_KEY) {
    const val = e.newValue;
    if (val && (val === 'light' || val === 'dark')) {
      setTheme(val, { persist: false });
    }
  }
});

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
  qs('#themeBtn')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || getSysTheme();
    const next = cur === 'dark' ? 'light' : 'dark';
    setTheme(next, { persist: true, fromUser: true });
  });
})();

/* ===== Mobile nav (robust) ===== */
(() => {
  const toggleBtn = qs('#navToggle');
  const nav = qs('#primaryNav');
  if (!toggleBtn || !nav) return;

  const openClass = 'open';          // applied to #primaryNav
  const scrollLockClass = 'menu-open'; // applied to <html> for scroll lock (CSS should handle)

  const isOpen = () => nav.classList.contains(openClass);
  const setExpanded = (v) => toggleBtn.setAttribute('aria-expanded', String(!!v));

  function openMenu() {
    nav.classList.add(openClass);
    document.documentElement.classList.add(scrollLockClass);
    setExpanded(true);
    // focus first link for a11y
    const firstLink = nav.querySelector('a,button');
    firstLink && firstLink.focus({ preventScroll: true });
  }
  function closeMenu() {
    nav.classList.remove(openClass);
    document.documentElement.classList.remove(scrollLockClass);
    setExpanded(false);
  }
  function toggleMenu() { isOpen() ? closeMenu() : openMenu(); }

  toggleBtn.addEventListener('click', toggleMenu);

  // Close when clicking a nav link (anchor navigation)
  nav.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (a) closeMenu();
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!isOpen()) return;
    const withinNav = e.target.closest('#primaryNav');
    const withinButton = e.target.closest('#navToggle');
    if (!withinNav && !withinButton) closeMenu();
  });

  // Escape to close
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen()) closeMenu();
  });

  // On resize to desktop, ensure menu is reset
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    // if crossing typical mobile breakpoint, reset
    if ((lastW <= 900 && w > 900) || (lastW > 900 && w <= 900)) {
      closeMenu();
    }
    lastW = w;
  }, { passive: true });
})();

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

/* ===== Spotlight follow (skip on touch) ===== */
(() => {
  if (matchMedia('(pointer: coarse)').matches) return;
  document.addEventListener('pointermove', e=>{
    const R = document.documentElement.style;
    R.setProperty('--mx', e.clientX+'px');
    R.setProperty('--my', e.clientY+'px');
  }, {passive:true});
})();

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
    // Resize hook if present
    window.__cerbiResizeDash && window.__cerbiResizeDash();
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
(function(){
  const fab = document.querySelector('.contact-fab');
  const contact = document.querySelector('#contact');
  if (!fab || !contact) return;

  // Keep the FAB always visible on small screens—too easy to hide by accident
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  if (isMobile) return;

  // Desktop: hide only when most of the contact section is in view
  const io = new IntersectionObserver(([entry])=>{
    if (!entry) return;
    const mostlyVisible = entry.isIntersecting && entry.intersectionRatio >= 0.6;
    fab.classList.toggle('is-hidden', mostlyVisible);
  }, { threshold: [0, 0.6], rootMargin: '0px 0px -10% 0px' });

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

// cerbi.js — site glue

// Nav scrolled state
(() => {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const on = () => nav.classList.toggle('scrolled', window.scrollY > 6);
  on();
  addEventListener('scroll', on, { passive: true });
})();

// Command palette (existing)
(() => {
  const overlay = document.getElementById('cmdkOverlay');
  const shell = overlay?.querySelector('.cmdk');
  const input = document.getElementById('cmdkInput');
  const list = document.getElementById('cmdkList');
  const btn = document.getElementById('cmdBtn');
  if (!overlay || !input || !list || !btn) return;

  const scrollToSel = sel => () => document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const openUrl = url => () => window.open(url, '_blank', 'noopener,noreferrer');

  const commands = [
    { label: 'Why', action: scrollToSel('#why'), keywords: 'problem approach value' },
    { label: 'Use Cases', action: scrollToSel('#usecases'), keywords: 'outcomes cases' },
    { label: 'Quick Start', action: scrollToSel('#quickstart'), keywords: 'install nuget setup' },
    { label: 'Ecosystem', action: scrollToSel('#ecosystem'), keywords: 'suite components' },
    { label: 'Governance', action: scrollToSel('#governance'), keywords: 'policy rules pii' },
    { label: 'Dashboards', action: scrollToSel('#dashboards'), keywords: 'ui screenshots' },
    { label: 'Packages', action: scrollToSel('#packages'), keywords: 'nuget libraries' },
    { label: 'Compare', action: scrollToSel('#compare'), keywords: 'table differences' },
    { label: 'Architecture', action: scrollToSel('#architecture'), keywords: 'diagram flow' },
    { label: 'Contact', action: scrollToSel('#contact'), keywords: 'email form' }
  ];

  let filtered = [...commands];
  let idx = 0;
  const render = () => list.innerHTML = filtered.map((c, i) => `<button class="item${i===idx?' active':''}" data-idx="${i}">${c.label}</button>`).join('');
  function open(){ overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false'); input.value=''; filtered=[...commands]; idx=0; render(); setTimeout(()=>input.focus(),0); document.body.style.overflow='hidden'; }
  function close(){ overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  function choose(i=idx){ const cmd=filtered[i]; if(!cmd) return; close(); setTimeout(()=>cmd.action(),0); }

  btn.addEventListener('click', open);
  addEventListener('keydown', (e) => {
    const mac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    if ((mac && e.metaKey && e.key.toLowerCase()==='k') || (!mac && e.ctrlKey && e.key.toLowerCase()==='k')) { e.preventDefault(); open(); }
    if (overlay.classList.contains('open')) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); idx=(idx+1)%filtered.length; render(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); idx=(idx-1+filtered.length)%filtered.length; render(); }
      if (e.key === 'Enter') { e.preventDefault(); choose(); }
    }
  });
  input.addEventListener('input', () => { const q=input.value.trim().toLowerCase(); filtered=!q?[...commands]:commands.filter(c=>c.label.toLowerCase().includes(q)||c.keywords.includes(q)); idx=0; render(); });
  list.addEventListener('click', (e) => { const b=e.target.closest('button.item'); if(!b) return; idx=Number(b.dataset.idx)||0; choose(idx); });
  overlay.addEventListener('click', (e) => { if (!shell.contains(e.target)) close(); });
})();

// Copy buttons delight (small confetti-like glow)
(() => {
  addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-copy]');
    if (!btn) return;
    const sel = btn.getAttribute('data-copy');
    const el = document.querySelector(sel);
    if (!el) return;
    const text = el.innerText || el.textContent || '';
    try {
      await navigator.clipboard.writeText(text);
      const prev = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Copied!';
      btn.animate([{boxShadow:'0 0 0px rgba(255,77,0,0)'},{boxShadow:'0 0 24px rgba(255,77,0,.6)'},{boxShadow:'0 0 0px rgba(255,77,0,0)'}],{duration:600});
      setTimeout(() => { btn.textContent = prev; btn.disabled = false; }, 1000);
    } catch {}
  });
})();

/* Cerbi site JS (safe theme handling removed from here — handled inline) */
(() => {
  // Tilt & reveal (no-ops if classes not present)
  const tilts = document.querySelectorAll('.tilt');
  tilts.forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(800px) rotateX(${(-y*4).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg)`;
    });
    el.addEventListener('mouseleave', () => el.style.transform = '');
  });

  // Copy buttons
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const sel = btn.getAttribute('data-copy');
      const code = document.querySelector(sel)?.innerText ?? '';
      try { await navigator.clipboard.writeText(code); btn.textContent = 'Copied!'; setTimeout(()=>btn.textContent='Copy',900); }
      catch { /* ignore */ }
    });
  });
})();


