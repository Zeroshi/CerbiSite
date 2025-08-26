/* ========== tiny UI helpers ========== */
(function () {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');
  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => primaryNav.classList.toggle('open'));
  }

  // Maintain body padding to match fixed header height
  function setNavOffset() {
    const nav = document.getElementById('siteNav');
    if (!nav) return;
    const h = Math.round(nav.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--navH', h + 'px');
  }
  window.addEventListener('load', setNavOffset);
  window.addEventListener('resize', setNavOffset);
  setNavOffset();

  // Progress bar
  const bar = document.getElementById('progress');
  const updateBar = () => {
    const s = window.scrollY;
    const d = document.body.scrollHeight - innerHeight;
    const p = d > 0 ? (s / d) * 100 : 0;
    if (bar) bar.style.width = p + '%';
  };
  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();

  // Spotlight cursor
  const root = document.documentElement;
  window.addEventListener('mousemove', (e) => {
    root.style.setProperty('--mx', e.clientX + 'px');
    root.style.setProperty('--my', e.clientY + 'px');
  }, { passive: true });
})();

/* ========== stars: twinkle + occasional shooting star ========== */
(function () {
  const canvas = document.getElementById('sky');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  let w, h, dpr;

  function resize() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // Stars
  const STAR_COUNT = 220;
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.4 + 0.2,
    a: Math.random() * 0.6 + 0.2,
    t: Math.random() * Math.PI * 2
  }));

  // Shooting star state
  let shoot = null; // {x,y,vx,vy,life}

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // twinkling stars
    for (const s of stars) {
      s.t += 0.02 + Math.random() * 0.01;
      const tw = (Math.sin(s.t) + 1) / 2; // 0..1
      const alpha = s.a * (0.4 + tw * 0.6);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,240,225,${alpha})`;
      ctx.fill();
    }

    // shooting star
    if (!shoot && Math.random() < 0.008) { // spawn occasionally
      const startX = Math.random() < 0.5 ? -40 : w + 40;
      const startY = Math.random() * (h * 0.5);
      const dir = startX < 0 ? 1 : -1;
      shoot = { x: startX, y: startY, vx: 8 * dir, vy: 2.5, life: 0.9 };
    }
    if (shoot) {
      const len = 140;
      ctx.save();
      const grad = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * len, shoot.y - shoot.vy * len);
      grad.addColorStop(0, 'rgba(255,200,150,0.9)');
      grad.addColorStop(1, 'rgba(255,200,150,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(shoot.x, shoot.y);
      ctx.lineTo(shoot.x - shoot.vx * len, shoot.y - shoot.vy * len);
      ctx.stroke();
      ctx.restore();

      shoot.x += shoot.vx;
      shoot.y += shoot.vy;
      shoot.life -= 0.02;
      if (shoot.life <= 0 || shoot.x < -200 || shoot.x > w + 200) shoot = null;
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
