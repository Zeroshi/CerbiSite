/* ======================================================================
   Cerbi Motion (additive)
   - Floating stars on #sky (cheap canvas)
   - Pointer spotlight (updates CSS vars --mx/--my)
   - Small utilities: progress bar + mobile nav toggle + theme toggle save
   ====================================================================== */
(() => {
  const prefersReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Stars on #sky (skip if reduced motion) ---
  const sky = document.getElementById('sky');
  if (sky && !prefersReduce){
    const ctx = sky.getContext('2d', { alpha: true });
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    let w = 0, h = 0;

    const PARTICLES = matchMedia('(max-width: 900px)').matches ? 24 : 36;
    const stars = Array.from({ length: PARTICLES }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.6 + Math.random() * 1.6,
      vx: (Math.random() * 0.04 - 0.02),
      vy: (-0.02 - Math.random() * 0.05),
      p: Math.random() * Math.PI * 2
    }));

    function resize(){
      const cw = sky.clientWidth || innerWidth;
      const ch = sky.clientHeight || innerHeight;
      if (cw === w && ch === h) return;
      w = cw; h = ch;
      sky.width = w * DPR; sky.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize(); addEventListener('resize', resize);

    let last = 0;
    function tick(t){
      if (t - last < 33){ requestAnimationFrame(tick); return; } // ~30fps
      last = t; resize();
      ctx.clearRect(0, 0, w, h);
      for (const s of stars){
        s.x += s.vx * 0.2; s.y += s.vy * 0.2; s.p += 0.02;
        if (s.y < -0.05){ s.y = 1.05; s.x = Math.random(); }
        if (s.x < -0.05) s.x = 1.05; else if (s.x > 1.05) s.x = -0.05;
        const a = 0.35 + Math.sin(s.p) * 0.25;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${a})`;
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // --- Pointer spotlight (updates CSS vars for .spotlight gradient) ---
  const spot = document.querySelector('.spotlight');
  if (spot){
    let raf = 0, mx = innerWidth / 2, my = innerHeight / 2;
    const update = () => {
      document.documentElement.style.setProperty('--mx', mx + 'px');
      document.documentElement.style.setProperty('--my', my + 'px');
      raf = 0;
    };
    addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });
  }

  // --- Progress bar (#progress) ---
  const prog = document.getElementById('progress');
  if (prog){
    const onScroll = () => {
      const sTop = document.documentElement.scrollTop || document.body.scrollTop;
      const sHeight = (document.documentElement.scrollHeight - document.documentElement.clientHeight) || 1;
      const pct = Math.min(100, Math.max(0, (sTop / sHeight) * 100));
      prog.style.width = pct + '%';
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Mobile menu toggle (uses existing #navToggle / #primaryNav) ---
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');
  if (navToggle && primaryNav){
    navToggle.addEventListener('click', () => {
      const open = primaryNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  // --- Theme toggle persistence (uses existing #themeBtn) ---
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn){
    themeBtn.addEventListener('click', () => {
      const root = document.documentElement;
      const current = root.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch {}
    });
  }
})();
