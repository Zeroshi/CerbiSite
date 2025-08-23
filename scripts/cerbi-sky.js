/* Cerbi Sky v2 — fixed background image, twinkling stars, random shooting stars.
   - No constellation lines
   - Works even if main CSS didn’t load (applies critical inline styles)
   - Removes nothing else on your page
*/

(function () {
  // ----- tiny safety: hide command palette overlay even if CSS failed -----
  try {
    const guard = document.createElement('style');
    guard.textContent = '.cmdk-overlay{display:none!important}';
    document.head.appendChild(guard);
  } catch {}

  // ----- ensure fixed layers exist & are correctly stacked -----
  function ensureEl({ selector, tag, parent = document.body, before = true }) {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement(tag);
      if (selector.startsWith('#')) el.id = selector.slice(1);
      else if (selector.startsWith('.')) el.className = selector.slice(1);
      if (before) parent.prepend(el); else parent.appendChild(el);
    }
    return el;
  }

  const tiles = ensureEl({ selector: '.tiles', tag: 'div' }); // if you already have one, this is a no-op
  const sky = ensureEl({ selector: '#sky', tag: 'canvas' });
  const bg = ensureEl({ selector: '.bg-art', tag: 'div' });

  // ----- critical inline styles (so visuals still work if CSS missing) -----
  Object.assign(tiles.style, {
    position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '-5'
  });
  Object.assign(sky.style, {
    position: 'fixed', inset: '0', zIndex: '-4', display: 'block', pointerEvents: 'none'
  });
  Object.assign(bg.style, {
    position: 'fixed', inset: '0', zIndex: '-3', pointerEvents: 'none',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'cover',
    // backgroundAttachment fixed is ignored by iOS; since we're fixed-position this is fine.
  });

  // ----- background image (with automatic higher-res variants if present) -----
  // REQUIRED: assets/background.png  (PNG/JPG/WEBP — any works)
  const base = 'assets/background';
  const fallbackUrl = `${base}.png`; // <- This is the required one you asked for
  // If you also provide the optional sizes, we can prefer them; otherwise we’ll use fallback.
  // (We can’t *check* existence from JS without 404 fetches, so we set image-set and a fallback)
  const srcSet = `image-set(
    url("${base}-3840.jpg") 3x,
    url("${base}-2560.jpg") 2x,
    url("${base}-1920.jpg") 1.5x,
    url("${base}-1280.jpg") 1x
  )`;
  bg.style.backgroundImage = `${srcSet}, url("${fallbackUrl}")`;

  // ----- scroll-driven gradient (very subtle, no abrupt jump) -----
  const root = document.documentElement;
  const start = { r: 9, g: 18, b: 15 };  // #09120f
  const end   = { r: 14, g: 27, b: 21 }; // #0e1b15
  const lerp  = (a, b, t) => a + (b - a) * t;
  const toHex = (n) => n.toString(16).padStart(2, '0');
  function setBg(t) {
    const r1 = Math.round(lerp(start.r, end.r, t));
    const g1 = Math.round(lerp(start.g, end.g, t));
    const b1 = Math.round(lerp(start.b, end.b, t));
    const r2 = Math.round(lerp(end.r,   start.r, t * 0.6));
    const g2 = Math.round(lerp(end.g,   start.g, t * 0.6));
    const b2 = Math.round(lerp(end.b,   start.b, t * 0.6));
    root.style.setProperty('--bg-start', `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`);
    root.style.setProperty('--bg-end',   `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`);
    // Also set the html background directly in case your CSS variables aren’t present yet:
    document.documentElement.style.background =
      `linear-gradient(to bottom, #${toHex(r1)}${toHex(g1)}${toHex(b1)} 0%, #${toHex(r2)}${toHex(g2)}${toHex(b2)} 100%)`;
  }
  function onScroll() {
    const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
    // clamp to 0..0.9 to prevent any “snap” at absolute bottom on very short pages
    const t = Math.min(0.9, Math.max(0, window.scrollY / max));
    setBg(t);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ----- starfield + shooting stars -----
  const ctx = sky.getContext('2d');
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let dpr = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0;

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.floor(innerWidth * dpr);
    H = Math.floor(innerHeight * dpr);
    sky.width = W; sky.height = H;
    sky.style.width = innerWidth + 'px';
    sky.style.height = innerHeight + 'px';
    buildStars();
  }

  const stars = [];
  const BASE = 180; // base density for ~1280x720; scales with area
  const rand = (a, b) => Math.random() * (b - a) + a;

  function buildStars() {
    stars.length = 0;
    const count = Math.floor(BASE * (innerWidth * innerHeight) / (1280 * 720));
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.9, // avoid very bottom edge
        r: rand(0.6, 1.6) * dpr,
        baseA: rand(0.35, 0.85),
        tw: rand(0.8, 2.2),       // twinkle rate
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  const shooting = [];
  let nextShootIn = 0;

  function scheduleShootingStar(now) {
    const minDelay = prefersReduced ? 12000 : 7000;  // 7–18s normally, longer if reduced-motion
    const maxDelay = prefersReduced ? 20000 : 18000;
    nextShootIn = now + rand(minDelay, maxDelay);
  }

  function spawnShootingStar() {
    // spawn from a random top/left region heading down-right
    const startX = rand(-0.1 * W, 0.3 * W);
    const startY = rand(-0.05 * H, 0.35 * H);
    const speed = rand(600, 1100) * dpr; // px/sec
    const life = rand(500, 900); // ms
    const angle = rand(Math.PI * 0.12, Math.PI * 0.28); // 22°–50°
    shooting.push({
      x: startX, y: startY, vx: Math.cos(angle) * speed / 1000, vy: Math.sin(angle) * speed / 1000,
      life, born: performance.now(), len: rand(80, 180) * dpr
    });
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);

    // faint vertical glow so stars feel embedded
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(0,0,0,0.10)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // stars (twinkle)
    ctx.globalCompositeOperation = 'screen';
    for (const s of stars) {
      const a = s.baseA * (0.7 + 0.3 * Math.sin(s.phase + now * 0.001 * s.tw));
      ctx.globalAlpha = Math.max(0, Math.min(1, a));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,244,230,0.95)';
      ctx.fill();
    }

    // shooting stars
    ctx.globalAlpha = 1;
    for (let i = shooting.length - 1; i >= 0; i--) {
      const m = shooting[i];
      const t = now - m.born;
      if (t > m.life) { shooting.splice(i, 1); continue; }
      // position
      const px = m.x + m.vx * t;
      const py = m.y + m.vy * t;
      // trail
      const tail = Math.min(m.len, (t / m.life) * m.len);
      const tx = px - Math.cos(Math.atan2(m.vy, m.vx)) * tail;
      const ty = py - Math.sin(Math.atan2(m.vy, m.vx)) * tail;
      const grad = ctx.createLinearGradient(tx, ty, px, py);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(1, 'rgba(255, 230, 200, 0.9)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = Math.max(1, 1.2 * dpr);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(px, py);
      ctx.stroke();
      // head
      ctx.beginPath();
      ctx.arc(px, py, 1.2 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 248, 240, 0.95)';
      ctx.fill();
    }

    // schedule spawns
    if (!prefersReduced) {
      if (nextShootIn === 0) scheduleShootingStar(now);
      if (now > nextShootIn) {
        spawnShootingStar();
        scheduleShootingStar(now);
      }
    }

    requestAnimationFrame(draw);
  }

  // init
  addEventListener('resize', () => { clearTimeout(resize._t); resize._t = setTimeout(resize, 100); }, { passive: true });
  resize();
  requestAnimationFrame(draw);
})();
