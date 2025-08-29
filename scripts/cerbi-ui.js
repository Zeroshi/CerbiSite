/* ===== Utilities ===== */
const qs = (sel, el=document)=>el.querySelector(sel);
const qsa = (sel, el=document)=>[...el.querySelectorAll(sel)];

/* ===== Year stamp ===== */
(() => {
  const y = qs('#year'); if (y) y.textContent = new Date().getFullYear();
})();

/* ===== Theme toggle (persisted) ===== */
const setTheme = t => {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('cerbi-theme', t);
  const meta = qs('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t==='light' ? '#ffffff' : '#0a1224');
};
(() => {
  const saved = localStorage.getItem('cerbi-theme');
  if (saved) setTheme(saved);
  qs('#themeBtn')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(cur === 'dark' ? 'light' : 'dark');
  });
})();

/* ===== Sticky progress ===== */
const progressBar = qs('#progress');
const onScroll = () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
  if (progressBar) progressBar.style.width = (scrolled * 100).toFixed(2) + '%';
};
window.addEventListener('scroll', onScroll, {passive:true});

/* ===== Mobile nav ===== */
qs('#navToggle')?.addEventListener('click', () => {
  const nav = qs('#primaryNav');
  const open = nav.classList.toggle('open');
  qs('#navToggle').setAttribute('aria-expanded', String(open));
});

/* ===== Command palette (simple) ===== */
(() => {
  const overlay = qs('#cmdkOverlay');
  if (!overlay) return;
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

/* ===== Pop-Art crossfade ===== */
(() => {
  const slides = qsa('.popart-slide');
  if (slides.length <= 1) return;
  let i = 0, t = null;

  const show = (idx) => {
    slides.forEach((s, n) => s.classList.toggle('active', n === idx));
  };

  const play = () => {
    stop();
    t = setInterval(() => {
      i = (i + 1) % slides.length;
      show(i);
    }, 5000);
  };
  const stop = () => { if (t) { clearInterval(t); t = null; } };

  const stage = qs('.popart-stage');
  const io = new IntersectionObserver((ents)=>{
    ents.forEach(ent => ent.isIntersecting ? play() : stop());
  }, {threshold:.15});
  if (stage) io.observe(stage);

  // pause on hover
  const block = qs('#brand-canvas');
  block?.addEventListener('mouseenter', stop);
  block?.addEventListener('mouseleave', play);
})();
