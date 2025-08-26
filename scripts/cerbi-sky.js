(() => {
  const html = document.documentElement;
  const body = document.body;
  const byId = (id) => document.getElementById(id);

  /* ================== STARFIELD ================== */
  const canvas = byId('sky');
  const ctx = canvas.getContext('2d');

  let stars = [];
  let meteors = [];
  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    w = canvas.clientWidth = window.innerWidth;
    h = canvas.clientHeight = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initStars();
  }

  function initStars() {
    const count = Math.floor((w * h) / 9000); // density
    stars = Array.from({length: count}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.4,
      base: Math.random() * 0.6 + 0.4,
      tw: Math.random() * 0.02 + 0.005, // twinkle speed
      phase: Math.random() * Math.PI * 2
    }));
  }

  function spawnMeteor() {
    // Randomly create a shooting star near the top
    const chance = 0.008; // tweak for frequency
    if (Math.random() > chance) return;

    const fromLeft = Math.random() < 0.5;
    const startX = fromLeft ? -50 : w + 50;
    const startY = Math.random() * (h * 0.45);
    const speed = Math.random() * 4 + 3;
    const angle = fromLeft ? (Math.random() * 0.4 + 0.2) : (Math.PI - (Math.random() * 0.4 + 0.2));
    meteors.push({
      x: startX, y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0, maxLife: 120 + Math.random()*60
    });
  }

  function drawStars(t) {
    ctx.clearRect(0, 0, w, h);

    // Stars (twinkle)
    ctx.save();
    for (const s of stars) {
      const lum = s.base + 0.35 * Math.sin(s.phase + t * s.tw);
      ctx.globalAlpha = Math.max(0, Math.min(1, lum));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = '#cfe1ff';
      ctx.fill();
    }
    ctx.restore();

    // Meteors
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.life++;

      // trail
      const trail = 14;
      const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * trail, m.y - m.vy * trail);
      grad.addColorStop(0, 'rgba(255,255,255,0.9)');
      grad.addColorStop(0.5, 'rgba(21,195,255,0.55)');
      grad.addColorStop(1, 'rgba(21,195,255,0.0)');

      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * trail, m.y - m.vy * trail);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();

      // head
      ctx.beginPath();
      ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      if (m.life > m.maxLife || m.x < -100 || m.x > w + 100 || m.y > h + 100) {
        meteors.splice(i, 1);
      }
    }
  }

  let rafId;
  function loop(time) {
    spawnMeteor();
    drawStars(time / 1000);
    rafId = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize, {passive:true});
  resize();
  rafId = requestAnimationFrame(loop);

  /* ================== BG GRADIENT ON SCROLL ================== */
  const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
  function updateGradient() {
    const p = clamp(window.scrollY / (document.body.scrollHeight - window.innerHeight), 0, 1);
    // Interpolate between deep and brighter blues
    const c1 = [8,19,42],  c2 = [12,26,59];   // start
    const d1 = [12,32,70], d2 = [16,40,88];   // end
    const lerp = (a,b,t)=>Math.round(a+(b-a)*t);
    const s = `rgb(${lerp(c1[0],d1[0],p)} ${lerp(c1[1],d1[1],p)} ${lerp(c1[2],d1[2],p)})`;
    const e = `rgb(${lerp(c2[0],d2[0],p)} ${lerp(c2[1],d2[1],p)} ${lerp(c2[2],d2[2],p)})`;
    html.style.setProperty('--bg-start', s);
    html.style.setProperty('--bg-end', e);
  }
  document.addEventListener('scroll', updateGradient, {passive:true});
  updateGradient();

  /* ================== SPOTLIGHT ================== */
  const spotlight = document.querySelector('.spotlight');
  document.addEventListener('pointermove', (e) => {
    html.style.setProperty('--mx', `${e.clientX}px`);
    html.style.setProperty('--my', `${e.clientY}px`);
  });

  /* ================== HEADER / NAV (sticky + mobile) ================== */
  const nav = document.querySelector('.nav');
  const navLinks = byId('primaryNav');
  const navToggle = byId('navToggle');
  navToggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  /* ================== THEME TOGGLE (persistent) ================== */
  const themeBtn = byId('themeBtn');
  const saved = localStorage.getItem('cerbi-theme');
  if (saved) html.setAttribute('data-theme', saved);
  themeBtn?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('cerbi-theme', next);
  });

  /* ================== SCROLL PROGRESS ================== */
  const progress = byId('progress');
  function setProgress() {
    const max = document.body.scrollHeight - window.innerHeight;
    const val = Math.max(0, Math.min(1, window.scrollY / max));
    progress.style.width = (val * 100).toFixed(2) + '%';
  }
  document.addEventListener('scroll', setProgress, {passive:true});
  setProgress();

  /* ================== REVEAL ON VIEW ================== */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ================== TILT GLARE ================== */
  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const gx = ((e.clientX - r.left) / r.width) * 100;
      const gy = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--gx', gx + '%');
      card.style.setProperty('--gy', gy + '%');
    });
  });

  /* ================== COMMAND PALETTE (⌘K / Ctrl+K) ================== */
  const overlay = byId('cmdkOverlay');
  const cmdBtn = byId('cmdBtn');
  const input = byId('cmdkInput');
  const list = byId('cmdkList');
  const cmds = [
    {label:'Why', href:'#why'},
    {label:'Ecosystem', href:'#ecosystem'},
    {label:'Governance', href:'#governance'},
    {label:'Packages', href:'#packages'},
    {label:'Repos', href:'#repos'},
    {label:'Compare', href:'#compare'},
    {label:'Architecture', href:'#architecture'},
    {label:'Contact', href:'#contact'}
  ];
  function openCmd() {
    overlay.classList.add('open');
    input.value = '';
    renderList('');
    input.focus();
  }
  function closeCmd() { overlay.classList.remove('open'); }
  function renderList(q){
    const f = q.toLowerCase();
    list.innerHTML = '';
    cmds.filter(c => c.label.toLowerCase().includes(f)).forEach(c => {
      const item = document.createElement('div');
      item.className = 'item';
      item.innerHTML = `<span>${c.label}</span><span class="kbd">↵</span>`;
      item.addEventListener('click', ()=>{ location.hash = c.href; closeCmd(); });
      list.appendChild(item);
    });
  }
  cmdBtn?.addEventListener('click', openCmd);
  input?.addEventListener('input', (e)=>renderList(e.target.value));
  overlay?.addEventListener('click', (e)=>{ if (e.target === overlay) closeCmd(); });
  document.addEventListener('keydown', (e)=>{
    if ((e.key.toLowerCase()==='k' && (e.metaKey || e.ctrlKey))) { e.preventDefault(); openCmd(); }
    if (e.key === 'Escape') closeCmd();
  });

  /* ================== YEAR ================== */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ================== COPY BUTTONS ================== */
  document.querySelectorAll('[data-copy]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const sel = btn.getAttribute('data-copy');
      const el = document.querySelector(sel);
      if (!el) return;
      const txt = el.innerText || el.textContent || '';
      navigator.clipboard.writeText(txt).then(()=>{
        const orig = btn.textContent;
        btn.textContent = 'Copied ✓';
        setTimeout(()=>btn.textContent = orig, 1200);
      });
    });
  });

  /* ================== GOVERNANCE DEMO ================== */
  const piiSwitch = byId('piiSwitch');
  const inputJson = byId('inputJson');
  const evalJson = byId('evalJson');
  function renderDemo(hasPii){
    const log = { Event:'UserLogin', UserId:'12345', Timestamp:new Date().toISOString() };
    if (hasPii) log.Email='jane@example.com';
    inputJson.textContent = JSON.stringify(log, null, 2);

    const violations = [];
    if (hasPii) violations.push({ field:'Email', rule:'Forbidden', severity:'error' });
    const result = { valid: violations.length === 0, violations };
    evalJson.textContent = JSON.stringify(result, null, 2);
  }
  renderDemo(false);
  const toggle = ()=> {
    piiSwitch.classList.toggle('on');
    const on = piiSwitch.classList.contains('on');
    piiSwitch.setAttribute('aria-checked', String(on));
    renderDemo(on);
  };
  piiSwitch?.addEventListener('click', toggle);
  piiSwitch?.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); } });

})();
