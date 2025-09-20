/* ==========================================================================
   Cerbi extras (background clock + micro-orbs + sparkles + confetti)
   - Respects reduced motion
   - Zero dependencies
   ========================================================================== */
(() => {
  const prefersReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== Big background HH:MM clock ==================================== */
  const bgClock = document.getElementById('bg-clock');
  if (bgClock) {
    const setColor = () => {
      try {
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        const cs = getComputedStyle(document.documentElement);
        const dark = cs.getPropertyValue('--muted').trim() || '#a7b4cf';
        const light = cs.getPropertyValue('--text').trim() || '#0a0a0a';
        bgClock.style.color = theme === 'light' ? light : dark;
      } catch {}
    };
    new MutationObserver(setColor).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    setColor();

    const render = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      bgClock.textContent = `${hh}:${mm}`;
    };
    render();

    if (prefersReduce) {
      const syncToMinute = () => {
        const wait = 60000 - (Date.now() % 60000);
        setTimeout(() => { render(); syncToMinute(); }, wait);
      };
      syncToMinute();
    } else {
      setInterval(render, 1000);
    }
  }

  /* ===== Make primary CTAs sparkle gently =============================== */
  document.querySelectorAll('.btn.btn-primary').forEach(b => b.classList.add('btn-sparkle'));

  /* ===== Micro-orbs drifting in the background ========================== */
  (function microOrbs() {
    if (prefersReduce) return;
    const layer = document.querySelector('.bg-orbs') || document.body;
    const count = Math.min(16, Math.max(8, Math.floor((innerWidth * innerHeight) / 120000)));
    const orbs = [];
    for (let i = 0; i < count; i++) {
      const e = document.createElement('div');
      e.setAttribute('aria-hidden', 'true');
      Object.assign(e.style, {
        position: 'fixed',
        zIndex: -1,
        pointerEvents: 'none',
        borderRadius: '50%',
        opacity: '0.08',
        width: `${6 + Math.random() * 12}px`,
        height: `${6 + Math.random() * 12}px`,
        background: 'radial-gradient(circle at 30% 30%, var(--accent, #ff4d00), transparent 65%)',
        left: `${Math.random() * 100}vw`,
        top: `${Math.random() * 100}vh`,
        filter: 'blur(1px)'
      });
      layer.appendChild(e);
      const speed = 12 + Math.random() * 24;
      orbs.push({ el: e, x: parseFloat(e.style.left), y: parseFloat(e.style.top), s: speed * (Math.random() > 0.5 ? 1 : -1) });
    }
    let raf;
    const tick = () => {
      orbs.forEach(o => {
        o.y += o.s * 0.02;
        if (o.y > 100) o.y = -2;
        if (o.y < -2) o.y = 100;
        o.el.style.top = `${o.y}vh`;
      });
      raf = requestAnimationFrame(tick);
    };
    tick();
    addEventListener('beforeunload', () => cancelAnimationFrame(raf));
  })();

  /* ===== Confetti on Ctrl/Cmd + B (Bonus!) ============================= */
  (function confetti() {
    if (prefersReduce) return;
    let coolDown = false;
    const shoot = () => {
      if (coolDown) return; coolDown = true; setTimeout(() => (coolDown = false), 1600);

      const c = document.createElement('canvas');
      c.width = innerWidth; c.height = innerHeight;
      Object.assign(c.style, { position: 'fixed', inset: 0, zIndex: 1200, pointerEvents: 'none' });
      document.body.appendChild(c);
      const ctx = c.getContext('2d');

      const N = 120, parts = [];
      for (let i = 0; i < N; i++) {
        parts.push({
          x: innerWidth / 2,
          y: innerHeight * 0.25,
          vx: (Math.random() - 0.5) * 6,
          vy: Math.random() *  -6 - 3,
          g: 0.12 + Math.random() * 0.08,
          s: 4 + Math.random() * 3,
          r: Math.random() * Math.PI,
          cr: Math.random() * 255 | 0,
          cg: Math.random() * 255 | 0,
          cb: Math.random() * 255 | 0
        });
      }

      let t = 0, raf;
      const step = () => {
        ctx.clearRect(0, 0, c.width, c.height);
        parts.forEach(p => {
          p.vy += p.g;
          p.x += p.vx;
          p.y += p.vy;
          p.r += 0.12;
          ctx.fillStyle = `rgba(${p.cr},${p.cg},${p.cb},${1 - Math.min(1, t/90)})`;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.r);
          ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s);
          ctx.restore();
        });
        t++;
        if (t < 120) raf = requestAnimationFrame(step);
        else { cancelAnimationFrame(raf); c.remove(); }
      };
      step();
    };

    addEventListener('keydown', (e) => {
      const keyB = e.key.toLowerCase() === 'b';
      if ((e.metaKey || e.ctrlKey) && keyB) {
        e.preventDefault();
        shoot();
      }
    }, { passive: false });
  })();

  /* ===== Dash slider aspect ratio sync (no layout jumps) =============== */
  (function dashAR() {
    const frame = document.querySelector('#dashboards .img-frame.showcase') || document.querySelector('#dashboards .img-frame');
    const slider = document.getElementById('dashSlider');
    if (!frame || !slider) return;

    const active = () => slider.querySelector('.slide.active img') || slider.querySelector('.slide img');
    const setAR = () => {
      const img = active();
      if (!img) return;
      const ar = (img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (16/9);
      frame.style.setProperty('--ar', `${ar}`);
    };
    setAR();
    addEventListener('resize', setAR, { passive: true });
    slider.querySelectorAll('img').forEach(img => img.addEventListener('load', setAR));
  })();
})();
