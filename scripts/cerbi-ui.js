/* ====== Utilities ====== */
const qs = (sel, el=document)=>el.querySelector(sel);
const qsa = (sel, el=document)=>[...el.querySelectorAll(sel)];
const setTheme = t => {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('cerbi-theme', t);
  // update meta theme-color for mobile UI
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

/* ====== Command palette (simple) ====== */
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
  if(list) {
    list.innerHTML = items.map(i=>`<div class="item"><span>${i.label}</span><span>${i.href}</span></div>`).join('');
    list.addEventListener('click', e=>{
      const item = e.target.closest('.item'); if(!item) return;
      location.hash = item.lastChild.textContent.trim();
      overlay.classList.remove('open');
    });
  }
  const open = ()=>{ overlay?.classList.add('open'); input?.focus(); if(input) input.value=''; };
  const close = ()=>overlay?.classList.remove('open');
  qs('#cmdBtn')?.addEventListener('click', open);
  window.addEventListener('keydown', e=>{
    if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k') { e.preventDefault(); open(); }
    if (e.key==='Escape') close();
  });
  overlay?.addEventListener('click', e=>{ if(e.target===overlay) close(); });
})();

/* ====== Copy buttons ====== */
qsa('[data-copy]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const el = qs(btn.getAttribute('data-copy'));
    if (!el) return;
    const text = el.innerText || el.textContent || '';
    navigator.clipboard.writeText(text);
    const old = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(()=>btn.textContent=old, 1200);
  });
});

/* ====== Reveal on scroll ====== */
const obs = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
},{threshold:.12});
qsa('.reveal').forEach(el=>obs.observe(el))

/* ====== Spotlight follow ====== */
document.addEventListener('pointermove', e=>{
  document.documentElement.style.setProperty('--mx', e.clientX+'px');
  document.documentElement.style.setProperty('--my', e.clientY+'px');
}, {passive:true});

/* ====== Footer year & image error diagnostics ====== */
(() => {
  const y = qs('#year');
  if (y) y.textContent = new Date().getFullYear();

  qsa('img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.opacity = '.35';
      const src = img.getAttribute('src');
      console.warn('[cerbi.io] Missing image:', src);
      if (img.alt) img.title = `Missing image: ${src}`;
    }, { once: true });
  });
})();

/* ====== Governance live demo (toy) ====== */
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
    const data = make(on);
    input.textContent = render(data);
    evalEl.textContent = render(evaluate(data));
  };
  update();

  const toggle = () => { on = !on; sw.classList.toggle('on', on); sw.setAttribute('aria-checked', String(on)); update(); };
  sw.addEventListener('click', toggle);
  sw.addEventListener('keydown', e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); toggle(); }});
})();

/* ====== Contact form (serverless: opens email compose) ====== */
(() => {
  const form = qs('#contactForm');
  if (!form) return;
  const note = qs('#formNote', form);
  form.addEventListener('submit', (e)=>{
    e.preventDefault();

    const fd = new FormData(form);
    // honeypot
    if (fd.get('website')) return;

    const name = (fd.get('name')||'').toString().trim();
    const email = (fd.get('email')||'').toString().trim();
    const company = (fd.get('company')||'').toString().trim();
    const message = (fd.get('message')||'').toString().trim();

    if (!name || !email || !message){
      note.textContent = 'Please complete name, email, and message.';
      return;
    }

    const subject = encodeURIComponent(`CerbiSite inquiry — ${name}${company? ` @ ${company}`:''}`);
    const body = encodeURIComponent([
      `Name: ${name}`,
      `Email: ${email}`,
      company ? `Company: ${company}` : '',
      '',
      message
    ].filter(Boolean).join('\n'));

    // Open the user’s email client
    window.location.href = `mailto:hello@cerbi.io?subject=${subject}&body=${body}`;

    // UX feedback
    note.textContent = 'Opening your email app…';
    const btn = qs('button[type="submit"]', form);
    if (btn) {
      btn.disabled = true;
      const t0 = btn.textContent;
      btn.textContent = 'Launching…';
      setTimeout(()=>{ btn.disabled=false; btn.textContent=t0; }, 2000);
    }
  });
})();

/* ====== Random veil overlays (top & bottom) ====== */
/* Place optional PNGs in assets/veil/ :
   - top-01.png, top-02.png … (light clouds, moon, nebula wisps)
   - bottom-01.png, bottom-02.png … (silhouettes, people looking up)
   Black = transparent when mixed (screen blend).
*/
(() => {
  const topEl = qs('.veil-top');
  const bottomEl = qs('.veil-bottom');
  if (!topEl || !bottomEl) return;

  const tops = [
    'assets/veil/top-01.png',
    'assets/veil/top-02.png',
    'assets/veil/top-03.png'
  ];
  const bottoms = [
    'assets/veil/bottom-01.png',
    'assets/veil/bottom-02.png',
    'assets/veil/bottom-03.png'
  ];

  // pick existing ones (basic HEAD check via Image load)
  const pickExisting = (arr, cb) => {
    let tried = 0;
    const pick = arr[Math.floor(Math.random()*arr.length)];
    const img = new Image();
    img.onload = () => cb(pick);
    img.onerror = () => {
      tried++;
      if (tried < arr.length) {
        const next = arr[(arr.indexOf(pick)+1)%arr.length];
        arr.splice(arr.indexOf(pick),1);
        pickExisting(arr, cb);
      } else cb(null);
    };
    img.src = pick + '?v=' + Date.now();
  };

  pickExisting([...tops], src => {
    if (src) topEl.style.backgroundImage = `url("${src}")`;
    else if (window.matchMedia('(min-width:1px)').matches) topEl.style.backgroundImage = 'url("assets/background.png")';
  });
  pickExisting([...bottoms], src => {
    if (src) bottomEl.style.backgroundImage = `url("${src}")`;
  });
})();
