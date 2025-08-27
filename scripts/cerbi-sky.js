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

/* ===== Contact form (mailto fallback, no backend required) ===== */
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

/* ===== Comets every so often ===== */
(() => {
  const layer = qs('#comets');
  if (!layer) return;
  const mk = ()=>{
    const s = document.createElement('span');
    s.className = 'comet';
    s.style.setProperty('--x', (-200 + Math.random()*200) + 'px');
    s.style.setProperty('--y', (Math.random()*window.innerHeight) + 'px');
    layer.appendChild(s);
    setTimeout(()=>s.remove(), 3000);
  };
  setInterval(()=>{ if (Math.random() < 0.35) mk(); }, 4000);
})();
