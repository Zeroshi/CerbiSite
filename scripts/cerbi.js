// Cerbi Forest JS — stars, gradient scroll, interactions
(() => {
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
    progress.style.width = (pct * 100) + '%';
  };
  document.addEventListener('scroll', setProgress, { passive: true });
  setProgress();

  // Reveal-on-scroll
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) e.target.classList.add('in');
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => io.observe(el));

  // Tilt + glare
  $$('.tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--gx', ((e.clientX - r.left) / r.width) * 100 + '%');
      card.style.setProperty('--gy', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
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
  const cmdBtn = $('#cmdBtn');
  const overlay = $('#cmdkOverlay');
  const cmdk = $('.cmdk', overlay);
  const input = $('#cmdkInput');
  const list = $('#cmdkList');
  const commands = [
    { label: '📦 View Packages', action: () => location.hash = '#packages' },
    { label: '🔐 Governance', action: () => location.hash = '#governance' },
    { label: '🧭 Architecture', action: () => location.hash = '#architecture' },
    { label: '📣 Contact', action: () => location.hash = '#contact' },
  ];
  function openCmd(){ overlay.style.display='block'; cmdk.style.display='block'; input.value=''; renderCmd(''); setTimeout(()=>input.focus(),0); }
  function closeCmd(){ overlay.style.display='none'; cmdk.style.display='none'; }
  function renderCmd(q){
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
  const filterBtns = $$('.filter');
  const rows = compareTable ? $$('tbody tr', compareTable) : [];
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tag = btn.dataset.tag;
      rows.forEach(tr => {
        if (tag === 'all') { tr.style.display = ''; return; }
        const tags = tr.dataset.tags || '';
        tr.style.display = tags.includes(tag) ? '' : 'none';
      });
    });
  });

  // Governance demo logic
  const piiSwitch = $('#piiSwitch');
  const inputJson = $('#inputJson');
  const evalJson = $('#evalJson');
  const baseLog = {
    Timestamp: new Date().toISOString(),
    Level: "Information",
    Message: "Checkout complete",
    Properties: { OrderId: "A-102934", Amount: 129.99, UserId: "u-4821" }
  };
  const policies = {
    RequiredFields: ["Timestamp", "Level", "Message", "Properties.OrderId"],
    ForbiddenFields: ["Properties.SSN", "Properties.CreditCardNumber", "Properties.DOB"]
  };
  function has(path, obj){ return path.split('.').reduce((o,k)=> (o && k in o) ? o[k] : undefined, obj) !== undefined; }
  function evaluate(log){
    const violations = [];
    for(const f of policies.RequiredFields) if(!has(f, log)) violations.push({ field:f, type:"RequiredMissing", severity:"Error" });
    for(const f of policies.ForbiddenFields) if(has(f, log)) violations.push({ field:f, type:"ForbiddenPresent", severity:"Error" });
    return { outcome: violations.length ? "NonCompliant" : "Compliant", violations };
  }
  function renderDemo(includePII){
    const sample = JSON.parse(JSON.stringify(baseLog));
    if(includePII){ sample.Properties.CreditCardNumber = "4111 1111 1111 1111"; sample.Properties.DOB = "1990-01-01"; }
    inputJson.textContent = JSON.stringify(sample, null, 2);
    evalJson.textContent = JSON.stringify(evaluate(sample), null, 2);
  }
  if (piiSwitch && inputJson && evalJson) {
    renderDemo(false);
    const setSwitch = (on) => { piiSwitch.classList.toggle('on', on); piiSwitch.setAttribute('aria-checked', on ? 'true' : 'false'); renderDemo(on); };
    piiSwitch.addEventListener('click', () => setSwitch(!piiSwitch.classList.contains('on')));
    piiSwitch.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setSwitch(!piiSwitch.classList.contains('on')); }});
  }

  // ================== Stars & Constellations ==================
  const canvas = document.getElementById('stars');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, DPR;
    const stars = [];
    const N = 220; // stars count
    const constellations = [
      // simple triangles/lines across thirds of the sky
      [{x:.15,y:.20},{x:.22,y:.28},{x:.30,y:.24},{x:.38,y:.30}],
      [{x:.55,y:.18},{x:.62,y:.26},{x:.70,y:.22},{x:.78,y:.30},{x:.86,y:.24}],
      [{x:.30,y:.08},{x:.40,y:.12},{x:.50,y:.10},{x:.60,y:.14}],
    ];

    function size() {
      DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      W = canvas.width = Math.floor(innerWidth * DPR);
      H = canvas.height = Math.floor(innerHeight * DPR);
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
    }
    size(); addEventListener('resize', size, { passive:true });

    function initStars(){
      stars.length = 0;
      for(let i=0;i<N;i++){
        stars.push({
          x: Math.random()*W,
          y: Math.random()*H,
          r: Math.random()*1.6 + 0.2,
          a: Math.random()*0.6 + 0.2,
          p: Math.random()*Math.PI*2,
          s: Math.random()*0.002 + 0.0005 // twinkle speed
        });
      }
    }
    initStars();

    let last = 0;
    function draw(t){
      const dt = t - last; last = t;
      const scrollMax = Math.max(1, document.body.scrollHeight - innerHeight);
      const p = Math.max(0, Math.min(1, scrollY / scrollMax));
      const brightness = 0.35 + 0.65 * p; // stars brighten as you scroll

      ctx.clearRect(0,0,W,H);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // stars
      for(const st of stars){
        st.p += st.s * dt;
        const alpha = st.a * (0.6 + 0.4*Math.sin(st.p)) * brightness;
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r*DPR, 0, Math.PI*2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      // constellations
      ctx.globalAlpha = Math.min(1, p * 1.2); // fade in with scroll
      ctx.lineWidth = 1.2 * DPR;
      const grad = ctx.createLinearGradient(0,0,W,0);
      grad.addColorStop(0, 'rgba(255,90,49,0.9)');
      grad.addColorStop(1, 'rgba(255,138,58,0.5)');
      ctx.strokeStyle = grad;
      ctx.shadowColor = 'rgba(255,90,49,0.35)';
      ctx.shadowBlur = 6 * DPR;

      for(const group of constellations){
        ctx.beginPath();
        for(let i=0;i<group.length;i++){
          const px = group[i].x * W;
          const py = group[i].y * H;
          if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
          // star nodes
          ctx.moveTo(px,py);
          ctx.lineTo(px,py);
        }
        ctx.stroke();
      }
      ctx.restore();
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  // ================== Scroll‑driven background palette ==================
  const palettes = [
    { start: "#081b18", end: "#0d2b27" }, // dusk
    { start: "#0b2a24", end: "#0a1f1c" }, // deep forest
    { start: "#09151d", end: "#071014" }  // near-night with teal/indigo tint
  ];
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const hexToRgb = (hex) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) } : { r:0,g:0,b:0 };
  };
  const rgbToHex = ({r,g,b}) => `#${[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')}`;
  const lerp = (a,b,t) => a + (b - a) * t;
  const lerpColor = (c1, c2, t) => ({
    r: Math.round(lerp(c1.r, c2.r, t)),
    g: Math.round(lerp(c1.g, c2.g, t)),
    b: Math.round(lerp(c1.b, c2.b, t))
  });
  const ease = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;

  const startRGB = palettes.map(p => hexToRgb(p.start));
  const endRGB   = palettes.map(p => hexToRgb(p.end));
  (() => { const first = palettes[0]; html.style.setProperty('--bg-start', first.start); html.style.setProperty('--bg-end', first.end); })();

  let ticking = false;
  function updateBg(){
    const docHeight = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const p = clamp(window.scrollY / docHeight, 0, 1);
    const segs = Math.max(1, palettes.length - 1);
    const pos = p * segs;
    const i = Math.min(segs - 1, Math.floor(pos));
    const t = ease(clamp(pos - Math.floor(pos), 0, 1));
    const i2 = Math.min(segs, i + 1);
    const s = lerpColor(startRGB[i], startRGB[i2], t);
    const e = lerpColor(endRGB[i],   endRGB[i2],   t);
    html.style.setProperty('--bg-start', rgbToHex(s));
    html.style.setProperty('--bg-end',   rgbToHex(e));
    ticking = false;
  }
  function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(updateBg); } }
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', () => requestAnimationFrame(updateBg), { passive:true });
  window.addEventListener('load', updateBg, { once:true });
  updateBg();
})();
