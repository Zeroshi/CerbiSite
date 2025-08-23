/* Cerbi runtime: UI interactions + twinkling sky + random shooting stars
   - Keeps all original UI behaviors (year, theme, mobile nav, progress,
     reveal, tilt glare, copy, command palette, compare filters, governance demo,
     scroll-driven gradient) in ONE file so nothing conflicts.
   - Starfield: slow twinkle, NO constellations, random meteors.
*/

(() => {
  /* ------------------------- UI / Shell behaviors ------------------------- */
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  // Year
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  // Theme
  const prefersLight = matchMedia('(prefers-color-scheme: light)').matches;
  const html = document.documentElement;
  const themeBtn = $('#themeBtn');
  html.setAttribute('data-theme', localStorage.getItem('theme') || (prefersLight ? 'light' : 'dark'));
  themeBtn?.addEventListener('click', () => {
    const now = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', now); localStorage.setItem('theme', now);
  });

  // Mobile nav
  const navToggle = $('#navToggle');
  const nav = $('#primaryNav');
  navToggle?.addEventListener('click', () => {
    nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', nav.classList.contains('open'));
  });

  // Spotlight follows cursor
  const spotlight = $('.spotlight');
  document.addEventListener('pointermove', (e) => {
    spotlight?.style.setProperty('--mx', e.clientX + 'px');
    spotlight?.style.setProperty('--my', e.clientY + 'px');
  }, { passive: true });

  // Progress bar
  const progress = $('#progress');
  const setProgress = () => {
    const max = document.body.scrollHeight - innerHeight;
    const pct = Math.max(0, Math.min(1, scrollY / (max || 1)));
    if (progress) progress.style.width = (pct * 100) + '%';
  };
  document.addEventListener('scroll', setProgress, { passive: true });
  setProgress();

  // Reveal-on-scroll
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) e.target.classList.add('in');
    }, { threshold: 0.12 });
    $$('.reveal').forEach(el => io.observe(el));
  } else { $$('.reveal').forEach(el => el.classList.add('in')); }

  // Tilt + glare
  $$('.tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--gx', ((e.clientX - r.left) / r.width) * 100 + '%');
      card.style.setProperty('--gy', ((e.clientY - r.top) / r.height) * 100 + '%');
    }, { passive: true });
  });

  // Copy buttons
  $$('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-copy');
      const el = document.querySelector(target);
      const text = el ? el.textContent : '';
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        const old = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => (btn.textContent = old), 1000);
      });
    });
  });

  // Command palette
  const cmdBtn = $('#cmdBtn'), overlay = $('#cmdkOverlay'), cmdk = $('.cmdk', overlay),
        input = $('#cmdkInput'), list = $('#cmdkList');
  const commands = [
    { label: '📦 View Packages', action: () => location.hash = '#packages' },
    { label: '🔐 Governance', action: () => location.hash = '#governance' },
    { label: '🧭 Architecture', action: () => location.hash = '#architecture' },
    { label: '📣 Contact', action: () => location.hash = '#contact' },
  ];
  function openCmd(){ if(!overlay||!cmdk) return; overlay.style.display='block'; cmdk.style.display='block'; if(input){ input.value=''; renderCmd(''); setTimeout(()=>input.focus(),0); } }
  function closeCmd(){ if(!overlay||!cmdk) return; overlay.style.display='none'; cmdk.style.display='none'; }
  function renderCmd(q){
    if(!list) return;
    const ql = q.trim().toLowerCase(); list.innerHTML='';
    commands.filter(c => !ql || c.label.toLowerCase().includes(ql)).forEach(c => {
      const item = document.createElement('div'); item.className='item';
      item.innerHTML = `<span>${c.label}</span><span class="kbd">Enter</span>`; item.tabIndex=0;
      item.addEventListener('click', ()=>{ c.action(); closeCmd(); });
      item.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ c.action(); closeCmd(); }});
      list.appendChild(item);
    });
    if(!list.children.length){ const none = document.createElement('div'); none.className='item'; none.textContent='No results'; list.appendChild(none); }
  }
  cmdBtn?.addEventListener('click', openCmd);
  overlay?.addEventListener('click', (e)=>{ if(e.target===overlay) closeCmd(); });
  input?.addEventListener('input', (e)=> renderCmd(e.target.value));
  document.addEventListener('keydown', (e)=>{
    if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openCmd(); }
    if(e.key==='Escape') closeCmd();
  });

  // Compare filters
  const compareTable = $('#compareTable');
  if (compareTable){
    const filterBtns = $$('.filter');
    const rows = $$('tbody tr', compareTable);
    filterBtns.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        filterBtns.forEach(b=>b.classList.remove('active')); btn.classList.add('active');
        const tag = btn.dataset.tag;
        rows.forEach(tr=>{
          if(tag==='all'){ tr.style.display=''; return; }
          const tags = tr.dataset.tags || '';
          tr.style.display = tags.includes(tag) ? '' : 'none';
        });
      });
    });
  }

  // Back-to-top
  const toTop = document.createElement('button');
  toTop.id='toTop'; toTop.className='btn'; toTop.type='button'; toTop.title='Back to top';
  toTop.setAttribute('aria-label','Back to top'); toTop.textContent='↑'; document.body.appendChild(toTop);
  const toggleToTop = () => toTop.classList.toggle('show', scrollY>300);
  document.addEventListener('scroll', toggleToTop, { passive:true }); toggleToTop();
  toTop.addEventListener('click', ()=>scrollTo({ top:0, behavior:'smooth' }));

  // Governance demo
  const piiSwitch = $('#piiSwitch'), inputJson = $('#inputJson'), evalJson = $('#evalJson');
  const baseLog = { Timestamp:new Date().toISOString(), Level:"Information", Message:"Checkout complete", Properties:{ OrderId:"A-102934", Amount:129.99, UserId:"u-4821" } };
  const policies = { RequiredFields:["Timestamp","Level","Message","Properties.OrderId"], ForbiddenFields:["Properties.SSN","Properties.CreditCardNumber","Properties.DOB"] };
  const has = (path,obj)=> path.split('.').reduce((o,k)=> (o&&k in o)?o[k]:undefined, obj)!==undefined;
  const evaluate = (log)=>{ const violations=[]; for(const f of policies.RequiredFields) if(!has(f,log)) violations.push({field:f,type:"RequiredMissing",severity:"Error"}); for(const f of policies.ForbiddenFields) if(has(f,log)) violations.push({field:f,type:"ForbiddenPresent",severity:"Error"}); return { outcome:violations.length?"NonCompliant":"Compliant", violations }; };
  const renderDemo = (inc)=>{ const sample=JSON.parse(JSON.stringify(baseLog)); if(inc){ sample.Properties.CreditCardNumber = "4111 1111 1111 1111"; sample.Properties.DOB = "1990-01-01"; } if(inputJson) inputJson.textContent=JSON.stringify(sample,null,2); if(evalJson) evalJson.textContent=JSON.stringify(evaluate(sample),null,2); };
  if (piiSwitch && inputJson && evalJson){
    const setSwitch = (on)=>{ piiSwitch.classList.toggle('on', on); piiSwitch.setAttribute('aria-checked', on?'true':'false'); renderDemo(on); };
    renderDemo(false);
    piiSwitch.addEventListener('click', ()=>setSwitch(!piiSwitch.classList.contains('on')));
    piiSwitch.addEventListener('keydown', (e)=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); setSwitch(!piiSwitch.classList.contains('on')); }});
  }

  // Scroll-driven background palette (smooth; prevents end-of-page jump)
  const palettes = [
    { start: "#09120f", end: "#0e1b15" },
    { start: "#0a1a14", end: "#0b2a21" },
    { start: "#0b2a21", end: "#0c2333" },
    { start: "#0c2333", end: "#140f1a" }
  ];
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const hexToRgb = (h)=>{ const m=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h); return m?{r:parseInt(m[1],16),g:parseInt(m[2],16),b:parseInt(m[3],16)}:{r:0,g:0,b:0}; };
  const rgbToHex = ({r,g,b})=>`#${[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')}`;
  const lerp=(a,b,t)=>a+(b-a)*t;
  const lerpColor=(c1,c2,t)=>({r:Math.round(lerp(c1.r,c2.r,t)),g:Math.round(lerp(c1.g,c2.g,t)),b:Math.round(lerp(c1.b,c2.b,t))});
  const ease=t=> t<0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
  const startRGB = palettes.map(p=>hexToRgb(p.start));
  const endRGB   = palettes.map(p=>hexToRgb(p.end));
  (function initVars(){ const first=palettes[0]; html.style.setProperty('--bg-start', first.start); html.style.setProperty('--bg-end', first.end); })();
  let ticking=false;
  function updateBg(){
    const docHeight = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const pScroll = clamp(window.scrollY / docHeight, 0, 1);
    const segs=Math.max(1, palettes.length-1);
    const pos=pScroll*segs; const i=Math.min(segs-1, Math.floor(pos)); const t=ease(clamp(pos-i,0,1)); const i2=Math.min(segs, i+1);
    const s=lerpColor(startRGB[i], startRGB[i2], t); const e=lerpColor(endRGB[i], endRGB[i2], t);
    html.style.setProperty('--bg-start', rgbToHex(s));
    html.style.setProperty('--bg-end',   rgbToHex(e));
    ticking=false;
  }
  function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(updateBg); } }
  addEventListener('scroll', onScroll, { passive:true });
  addEventListener('resize', ()=>requestAnimationFrame(updateBg), { passive:true });
  addEventListener('load', updateBg, { once:true });
  updateBg();
})();

/* -------------------------- Sky: stars + meteors -------------------------- */
(() => {
  const canvas = document.getElementById('sky');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Tunables
  const MAX_DPR = 2;
  const BASE_DENSITY = 1 / 6500;
  const STAR_SIZE_MIN = 0.7;
  const STAR_SIZE_MAX = 1.8;
  const TWINKLE_SPEED_MIN = 0.03;
  const TWINKLE_SPEED_MAX = 0.10;
  const SHOOTING_STAR_EVERY = [6,14]; // seconds between spawns
  const SHOOT_SPEED_PX = [900, 1500]; // px/sec (CSS px)
  const SHOOT_LEN_PX = [120, 220];
  const SHOOT_ANGLE_DEG = [18, 32];
  const SHOOT_ALPHA = 0.85;
  const SKY_TINT = [0, 0, 0, 0.06];

  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TWINKLE_AMPL_MIN = REDUCED ? 0.05 : 0.18;
  const TWINKLE_AMPL_MAX = REDUCED ? 0.10 : 0.30;
  const ENABLE_SHOOTING = !REDUCED;

  // State
  let dpr = Math.max(1, Math.min(MAX_DPR, window.devicePixelRatio || 1));
  let Wcss = 0, Hcss = 0;   // CSS pixel size
  let W = 0, H = 0;         // canvas pixel size
  let stars = [];
  let meteors = [];
  let rafId = 0;
  let lastTs = performance.now();
  let nextMeteorAt = scheduleNextMeteor();

  // Helpers
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const toRad = (deg) => deg * Math.PI / 180;

  function scheduleNextMeteor() {
    const s = rand(SHOOTING_STAR_EVERY[0], SHOOTING_STAR_EVERY[1]) * 1000;
    return performance.now() + s;
  }

  function sizeCanvas() {
    dpr = Math.max(1, Math.min(MAX_DPR, window.devicePixelRatio || 1));
    Wcss = window.innerWidth;
    Hcss = window.innerHeight;
    W = Math.floor(Wcss * dpr);
    H = Math.floor(Hcss * dpr);
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = Wcss + 'px';
    canvas.style.height = Hcss + 'px';
    makeStars();
  }

  function makeStars() {
    const target = clamp(Math.round(Wcss * Hcss * BASE_DENSITY), 120, 420);
    stars = new Array(target).fill(0).map(() => {
      const rCss = rand(STAR_SIZE_MIN, STAR_SIZE_MAX);
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: rCss * dpr * rand(0.8, 1.2),
        base: rand(0.35, 0.70),
        amp: rand(TWINKLE_AMPL_MIN, TWINKLE_AMPL_MAX),
        w: rand(TWINKLE_SPEED_MIN, TWINKLE_SPEED_MAX) * 2 * Math.PI,
        phase: Math.random() * Math.PI * 2
      };
    });
  }

  function spawnMeteor() {
    const edge = Math.random() < 0.65 ? 'top' : 'left';
    const angle = toRad(rand(SHOOT_ANGLE_DEG[0], SHOOT_ANGLE_DEG[1]));
    const speedCss = rand(SHOOT_SPEED_PX[0], SHOOT_SPEED_PX[1]);
    const speed = speedCss * dpr;
    const lenCss = rand(SHOOT_LEN_PX[0], SHOOT_LEN_PX[1]);
    const len = lenCss * dpr;

    let x, y, vx, vy;
    if (edge === 'top') {
      x = rand(-0.10 * W, 0.35 * W);
      y = rand(-0.08 * H, 0.12 * H);
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    } else {
      x = rand(-0.08 * W, 0.05 * W);
      y = rand(0.05 * H, 0.35 * H);
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    }

    meteors.push({
      x, y, vx, vy, len,
      life: 0,
      ttl: rand(0.7, 1.2),
      width: Math.max(1.1 * dpr, 1.6 * dpr),
      alpha: SHOOT_ALPHA
    });
  }

  function drawTint() {
    if (!SKY_TINT) return;
    const [r, g, b, a] = SKY_TINT;
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, `rgba(${r},${g},${b},${a})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawStars(tSec) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const s of stars) {
      const alpha = clamp(s.base + s.amp * Math.sin(s.phase + s.w * tSec), 0, 1);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 245, 235, 0.95)';
      ctx.fill();

      if (!REDUCED) {
        ctx.globalAlpha = alpha * 0.25;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 240, 220, 0.6)';
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawMeteors(dt) {
    if (!ENABLE_SHOOTING) return;

    const now = performance.now();
    if (now >= nextMeteorAt) {
      spawnMeteor();
      nextMeteorAt = scheduleNextMeteor();
    }

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.life += dt;

      const p = m.life / m.ttl;
      if (p >= 1) { meteors.splice(i, 1); continue; }

      m.x += m.vx * dt;
      m.y += m.vy * dt;

      const mag = Math.hypot(m.vx, m.vy) || 1;
      const nx = m.vx / mag, ny = m.vy / mag;
      const headX = m.x, headY = m.y;
      const tailX = headX - nx * m.len;
      const tailY = headY - ny * m.len;

      const a = m.alpha * (p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8);
      ctx.globalAlpha = clamp(a, 0, 1);
      ctx.lineWidth = m.width;

      const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.35, 'rgba(255, 245, 230, 0.25)');
      grad.addColorStop(0.75, 'rgba(255, 250, 240, 0.9)');
      grad.addColorStop(1.0, 'rgba(255, 255, 255, 1.0)');
      ctx.strokeStyle = grad;

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(headX, headY);
      ctx.stroke();
    }
    ctx.restore();
  }

  function draw(ts) {
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;

    ctx.clearRect(0, 0, W, H);
    drawTint();

    const tSec = ts / 1000;
    drawStars(tSec);
    drawMeteors(dt);

    rafId = requestAnimationFrame(draw);
  }

  // Lifecycle
  sizeCanvas();
  lastTs = performance.now();
  rafId = requestAnimationFrame(draw);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      lastTs = performance.now();
      rafId = requestAnimationFrame(draw);
    }
  });

  let rto;
  window.addEventListener('resize', () => {
    clearTimeout(rto);
    rto = setTimeout(() => {
      sizeCanvas();
      if (ENABLE_SHOOTING) nextMeteorAt = scheduleNextMeteor();
    }, 120);
  }, { passive: true });
})();
