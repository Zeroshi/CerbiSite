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

/* ===== Command palette ===== */
(() => {
  const overlay = qs('#cmdkOverlay');
  if(!overlay) return;
  const input = qs('#cmdkInput');
  const list = qs('#cmdkList');
  const items = [
    {label:'Why', href:'#why'},
    {label:'Ecosystem', href:'#ecosystem'},
    {label:'Governance', href:'#governance'},
    {label:'Performance', href:'#performance'},
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

/* ===== Spotlight follow (soft blue) ===== */
document.addEventListener('pointermove', e=>{
  document.documentElement.style.setProperty('--mx', e.clientX+'px');
  document.documentElement.style.setProperty('--my', e.clientY+'px');
}, {passive:true});

/* ===== Random bottom background loader ===== */
(function loadSceneBackground(){
  const holder = qs('.scene-bg'); if(!holder) return;
  const maxN = 50; // you said you'll add background1.png … background50.png (or fewer)
  const n = Math.max(1, Math.floor(1 + Math.random()*maxN));
  const candidates = [
    `assets/background/background${n}.png`,
    `assets/background/background${(n%maxN)+1}.png`,
    `assets/background/background.png`
  ];
  const tryNext = (i) => {
    if (i >= candidates.length) return;
    const url = candidates[i];
    const img = new Image();
    img.onload = () => holder.style.backgroundImage = `url("${url}")`;
    img.onerror = () => tryNext(i+1);
    img.src = url;
  };
  tryNext(0);
})();

/* ===== Starfield + angled meteors (downward) ===== */
(function starfield(){
  const canvas = qs('#sky'); if(!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  let w=canvas.width=window.innerWidth, h=canvas.height=window.innerHeight;
  window.addEventListener('resize', ()=>{w=canvas.width=window.innerWidth; h=canvas.height=window.innerHeight;});

  const stars = [];
  const meteors = [];
  const STAR_COUNT = Math.min(220, Math.floor(w*h/9000));

  function addStar(){
    stars.push({
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*1.2 + 0.2,
      vx: 0.18 + Math.random()*0.15,    // slight rightward drift
      vy: 0.8 + Math.random()*0.4       // downward drift
    });
  }
  for(let i=0;i<STAR_COUNT;i++) addStar();

  function spawnMeteor(){
    // 15–22 degrees downward
    const angle = (Math.PI/180) * (15 + Math.random()*7);
    const speed = 6 + Math.random()*4;
    meteors.push({
      x: Math.random()*(-w*0.2), y: Math.random()*(-h*0.3),
      vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
      life: 0, max: 140 + Math.random()*80
    });
  }

  let meteorTicker = 0;

  function step(){
    ctx.clearRect(0,0,w,h);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    for(const s of stars){
      s.x += s.vx; s.y += s.vy;
      if (s.y > h+2 || s.x > w+2){ s.x = Math.random()*w*0.2; s.y = -2; }
      ctx.globalAlpha = 0.6 + Math.sin((s.x+s.y)*0.02)*0.2;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Meteors
    meteorTicker++;
    if (meteorTicker % 160 === 0) spawnMeteor();

    for (let i=meteors.length-1;i>=0;i--){
      const m = meteors[i];
      m.x += m.vx; m.y += m.vy; m.life++;

      const trail = 90;
      const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx*trail, m.y - m.vy*trail);
      grad.addColorStop(0, 'rgba(175,200,255,.85)');
      grad.addColorStop(1, 'rgba(175,200,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx*trail, m.y - m.vy*trail);
      ctx.stroke();

      if (m.life > m.max || m.x > w+200 || m.y > h+200) meteors.splice(i,1);
    }

    requestAnimationFrame(step);
  }
  step();
})();

/* ===== Dashboard rotator ===== */
(function rotator(){
  const root = qs('#dashRotator'); if(!root) return;
  const slides = qsa('.dash-slide', root);
  const dots = qsa('.dash-dots button', root);
  let i = 0, timer;

  const show = (idx)=>{
    slides[i].classList.remove('current'); dots[i].setAttribute('aria-selected','false');
    i = (idx + slides.length) % slides.length;
    slides[i].classList.add('current'); dots[i].setAttribute('aria-selected','true');
  };
  const start = ()=>timer = setInterval(()=>show(i+1), 4200);
  const stop = ()=>clearInterval(timer);
  dots.forEach((d,di)=>d.addEventListener('click', ()=>{ stop(); show(di); start(); }));
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  start();
})();

/* ===== Performance chart (vanilla canvas; fixed) ===== */
(function perf(){
  const c = qs('#perfChart'); if(!c) return;
  const ctx = c.getContext('2d');

  // sample data (writes/sec; higher is better)
  const labels = ['10k','20k','30k','40k','50k','60k'];
  const cerbi    = [16000, 30000, 42000, 52000, 60000, 66000];
  const seriplug = [13000, 24500, 34000, 42000, 49000, 54500];
  const plain    = [14000, 25500, 35000, 43500, 51000, 56000];

  const all = [...cerbi, ...seriplug, ...plain];
  const min = Math.min(...all) * 0.9;
  const max = Math.max(...all) * 1.05;

  const P = 44; const W = c.width - P*2; const H = c.height - P*2;
  ctx.clearRect(0,0,c.width,c.height);

  // grid
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1;
  ctx.strokeRect(P,P,W,H);
  ctx.font = '12px Inter'; ctx.fillStyle='rgba(255,255,255,.6)';
  for(let t=0;t<=5;t++){
    const y = P + (t/5)*H;
    ctx.beginPath(); ctx.moveTo(P,y); ctx.lineTo(P+W,y); ctx.strokeStyle='rgba(255,255,255,.08)'; ctx.stroke();
    const v = Math.round(max - (t/5)*(max-min));
    ctx.fillText(v.toLocaleString(), 6, y+4);
  }

  function yScale(v){ return P + (1 - (v-min)/(max-min)) * H; }
  function xScale(i,n){ return P + (i/(n-1)) * W; }

  function plot(series, color) {
    ctx.beginPath();
    series.forEach((v, i) => {
      const x = xScale(i, series.length);
      const y = yScale(v);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
  }
  plot(plain,   'rgba(180,200,255,.8)');
  plot(seriplug,'rgba(110,170,255,.9)');
  plot(cerbi,   'rgba(255,120,40,1)');

  // legend
  const Lx = P+10, Ly = P+10;
  const legends = [
    ['CerbiStream (with validation)', 'rgba(255,120,40,1)'],
    ['Serilog + Governance Plugin',   'rgba(110,170,255,.9)'],
    ['Serilog (plain)',               'rgba(180,200,255,.8)'],
  ];
  legends.forEach((l,idx)=>{
    ctx.fillStyle = l[1]; ctx.fillRect(Lx, Ly+idx*18, 10, 10);
    ctx.fillStyle='rgba(255,255,255,.75)';
    ctx.fillText(l[0], Lx+16, Ly+9+idx*18);
  });
})();

/* ===== Compare filters ===== */
qsa('.filter').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    qsa('.filter').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const tag = btn.dataset.tag;
    qsa('#compareTable tbody tr').forEach(tr=>{
      if(tag==='all'){ tr.style.display=''; return; }
      const tags = (tr.dataset.tags||'').split(' ');
      tr.style.display = tags.includes(tag) ? '' : 'none';
    });
  });
});

/* ===== Legacy gallery → rotator fallback ===== */
(() => {
  if (qs('#dashRotator')) return;
  const legacy = qs('.dash-gallery');
  if (!legacy) return;

  const imgs = [...legacy.querySelectorAll('img')];
  if (!imgs.length) return;

  const rot = document.createElement('div');
  rot.id = 'dashRotator';
  rot.className = 'dash-rotator';
  rot.innerHTML =
    imgs.map((im,i)=>`
      <figure class="dash-slide ${i===0?'current':''}">
        <img src="${im.currentSrc || im.src}" alt="${im.alt || 'Screenshot'}">
        <figcaption>${im.alt || ''}</figcaption>
      </figure>`).join('') +
    `<div class="dash-dots">${imgs.map((_,i)=>`<button aria-selected="${i===0}"></button>`).join('')}</div>`;

  legacy.replaceWith(rot);

  const slides = rot.querySelectorAll('.dash-slide');
  const dots = rot.querySelectorAll('.dash-dots button');
  let i = 0, timer;
  const show = (idx)=>{
    slides[i].classList.remove('current'); dots[i].setAttribute('aria-selected','false');
    i = (idx + slides.length) % slides.length;
    slides[i].classList.add('current'); dots[i].setAttribute('aria-selected','true');
  };
  const start = ()=>timer = setInterval(()=>show(i+1), 4000);
  const stop = ()=>clearInterval(timer);
  dots.forEach((d,di)=>d.addEventListener('click', ()=>{ stop(); show(di); start(); }));
  rot.addEventListener('mouseenter', stop);
  rot.addEventListener('mouseleave', start);
  start();
})();

/* ===== Set year ===== */
(() => { const y = qs('#year'); if (y) y.textContent = new Date().getFullYear(); })();
