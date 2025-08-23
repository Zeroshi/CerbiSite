/* Cerbi Sky — twinkling stars + occasional shooting stars (no constellations)
   - Slow, per-star sine twinkle
   - Random shooting stars with short tails
   - DPR capped for perf; pauses on background tabs
   - Respects prefers-reduced-motion
*/

(() => {
  const canvas = document.getElementById('sky');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // ====== Tunables ==========================================================
  const MAX_DPR = 2;                 // cap device pixel ratio for perf
  const BASE_DENSITY = 1 / 6500;     // stars per screen pixel (lower = fewer)
  const STAR_SIZE_MIN = 0.7;         // device-space px (before DPR applied)
  const STAR_SIZE_MAX = 1.8;
  const TWINKLE_SPEED_MIN = 0.03;    // cycles per second
  const TWINKLE_SPEED_MAX = 0.10;
  const SHOOTING_STAR_EVERY = [6,14]; // seconds (min,max) between spawns
  const SHOOT_SPEED_PX = [900, 1500]; // px/sec head speed (in CSS px)
  const SHOOT_LEN_PX = [120, 220];    // trail length (in CSS px)
  const SHOOT_ANGLE_DEG = [18, 32];   // shallow angle for "meteor" vibe
  const SHOOT_ALPHA = 0.85;
  const SKY_TINT = [0, 0, 0, 0.06];   // subtle vertical tint overlay (rgba)

  // Reduced motion adjustments
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TWINKLE_AMPL_MIN = REDUCED ? 0.05 : 0.18;
  const TWINKLE_AMPL_MAX = REDUCED ? 0.10 : 0.30;
  const ENABLE_SHOOTING = !REDUCED;

  // ====== State =============================================================
  let dpr = Math.max(1, Math.min(MAX_DPR, window.devicePixelRatio || 1));
  let Wcss = 0, Hcss = 0;   // CSS pixel size
  let W = 0, H = 0;         // canvas pixel size
  let stars = [];
  let meteors = [];
  let rafId = 0;
  let lastTs = performance.now();
  let nextMeteorAt = scheduleNextMeteor();

  // ====== Helpers ===========================================================
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const randInt = (a, b) => Math.floor(rand(a, b + 1));
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
        // positions in device pixels for tight drawing
        x: Math.random() * W,
        y: Math.random() * H,
        r: rCss * dpr * rand(0.8, 1.2),
        // alpha = base + amp * sin(phase + t*omega)
        base: rand(0.35, 0.70),
        amp: rand(TWINKLE_AMPL_MIN, TWINKLE_AMPL_MAX),
        w: rand(TWINKLE_SPEED_MIN, TWINKLE_SPEED_MAX) * 2 * Math.PI, // rad/s
        phase: Math.random() * Math.PI * 2
      };
    });
  }

  function spawnMeteor() {
    // Choose a spawn edge & direction that goes generally down-right
    // We'll spawn near top-left or left edge for a pleasing diagonal.
    const edge = Math.random() < 0.65 ? 'top' : 'left';
    const angle = toRad(rand(SHOOT_ANGLE_DEG[0], SHOOT_ANGLE_DEG[1])); // from horizontal
    const speedCss = rand(SHOOT_SPEED_PX[0], SHOOT_SPEED_PX[1]); // px/sec (CSS px)
    const speed = speedCss * dpr;
    const lenCss = rand(SHOOT_LEN_PX[0], SHOOT_LEN_PX[1]);
    const len = lenCss * dpr;

    let x, y, vx, vy;
    if (edge === 'top') {
      x = rand(-0.10 * W, 0.35 * W); // slightly off-screen to left → left third
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
      ttl: rand(0.7, 1.2),   // seconds visible
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

      // subtle glow (very cheap)
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

    // spawn?
    const now = performance.now();
    if (now >= nextMeteorAt) {
      spawnMeteor();
      nextMeteorAt = scheduleNextMeteor();
    }

    // update & render
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.life += dt;

      // progress 0..1, fade-in then fade-out
      const p = m.life / m.ttl;
      if (p >= 1) { meteors.splice(i, 1); continue; }

      // move
      const move = dt * (m.vx ** 2 + m.vy ** 2) ** 0.5; // not used but can be
      m.x += m.vx * dt;
      m.y += m.vy * dt;

      // tail points (from head back along velocity)
      const nx = m.vx / (Math.hypot(m.vx, m.vy) || 1);
      const ny = m.vy / (Math.hypot(m.vx, m.vy) || 1);
      const headX = m.x, headY = m.y;
      const tailX = headX - nx * m.len;
      const tailY = headY - ny * m.len;

      // alpha envelope: quick-in, smooth-out
      const a = m.alpha * (p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8);
      ctx.globalAlpha = clamp(a, 0, 1);

      // line width
      ctx.lineWidth = m.width;

      // gradient along the trail (bright head → transparent tail)
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
    const dt = (ts - lastTs) / 1000; // seconds
    lastTs = ts;

    // clear
    ctx.clearRect(0, 0, W, H);

    // very subtle vertical tint to add depth
    drawTint();

    // time base for twinkle
    const tSec = ts / 1000;

    // stars & shooting stars
    drawStars(tSec);
    drawMeteors(dt);

    rafId = requestAnimationFrame(draw);
  }

  // ====== Lifecycle =========================================================
  sizeCanvas();
  lastTs = performance.now();
  rafId = requestAnimationFrame(draw);

  // pause when hidden to save battery
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      lastTs = performance.now();
      rafId = requestAnimationFrame(draw);
    }
  });

  // resize (debounced)
  let rto;
  window.addEventListener('resize', () => {
    clearTimeout(rto);
    rto = setTimeout(() => {
      sizeCanvas();
      // reschedule meteor soon after resize to avoid immediate spawn pops
      if (ENABLE_SHOOTING) nextMeteorAt = scheduleNextMeteor();
    }, 120);
  }, { passive: true });
})();
