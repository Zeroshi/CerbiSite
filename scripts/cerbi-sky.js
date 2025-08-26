/* Cerbi Sky — stars + gentle twinkle + random shooting stars (no constellation lines) */
(() => {
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const canvas = document.getElementById('sky');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  let W = 0, H = 0, stars = [], meteors = [];
  let lastT = 0;

  function resize() {
    W = canvas.width = Math.floor(window.innerWidth * DPR);
    H = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    // rebuild stars to maintain density
    buildStars();
  }

  function rand(min, max) { return min + Math.random() * (max - min); }

  function buildStars() {
    const area = (W * H) / (DPR * DPR);
    const density = 0.00012; // stars per pixel
    const count = Math.floor(area * density);
    stars = new Array(count).fill(0).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: rand(0.5, 1.8) * DPR,
      b: rand(0.2, 0.8),          // base brightness
      tw: rand(0.6, 2.2),         // twinkle speed
      phase: Math.random() * Math.PI * 2
    }));
  }

  function drawStars(t) {
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const s of stars) {
      const twinkle = 0.45 + 0.55 * Math.sin(s.phase + t * 0.001 * s.tw);
      const a = Math.min(1, Math.max(0, s.b * twinkle));
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
    ctx.restore();
  }

  function maybeSpawnMeteor() {
    // low probability per frame
    if (Math.random() < 0.006) {
      const fromTop = Math.random() < 0.7;
      const startX = rand(-0.1 * W, 1.1 * W);
      const startY = fromTop ? rand(-0.05 * H, 0.15 * H) : rand(0.15 * H, 0.4 * H);
      const speed = rand(600, 1200) * DPR; // px/sec
      const angle = rand(Math.PI * 0.15, Math.PI * 0.35); // down-right
      meteors.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(450, 900),   // ms
        age: 0,
        len: rand(120, 220) * DPR
      });
    }
  }

  function drawMeteors(dt) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.age += dt;
      if (m.age > m.life) { meteors.splice(i, 1); continue; }
      const f = m.age / m.life;
      m.x += m.vx * (dt / 1000);
      m.y += m.vy * (dt / 1000);
      // trail
      const trailX = m.x - (m.vx / 1000) * (m.len);
      const trailY = m.y - (m.vy / 1000) * (m.len);
      const grad = ctx.createLinearGradient(trailX, trailY, m.x, m.y);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(1, 'rgba(255,255,255,' + (1 - f) + ')');
      ctx.strokeStyle = grad;
      ctx.lineWidth = Math.max(1, (1 - f) * 2 * DPR);
      ctx.beginPath();
      ctx.moveTo(trailX, trailY);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();

      // head
      ctx.globalAlpha = 1 - f;
      ctx.beginPath();
      ctx.arc(m.x, m.y, Math.max(1.5, (1 - f) * 2.5) * DPR, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function loop(ts) {
    if (!lastT) lastT = ts;
    const dt = ts - lastT;
    lastT = ts;

    drawStars(ts);
    maybeSpawnMeteor();
    drawMeteors(dt);

    requestAnimationFrame(loop);
  }

  // pointer spotlight coordinates for CSS var
  window.addEventListener('pointermove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty('--mx', x + 'vw');
    document.documentElement.style.setProperty('--my', y + 'vh');
  }, { passive: true });

  // ensure nav always above canvas
  const nav = document.getElementById('siteNav');
  if (nav) nav.style.zIndex = '10000';

  // prevent overlay “block” unless explicitly opened
  const overlay = document.getElementById('cmdkOverlay');
  if (overlay) overlay.classList.remove('open');

  // init
  resize();
  window.addEventListener('resize', resize);
  buildStars();
  requestAnimationFrame(loop);
})();
