/* ===== Starfield (angled downward) ===== */
(() => {
  const canvas = document.getElementById('sky');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, dpi = window.devicePixelRatio || 1;
  function resize(){
    w = canvas.width = Math.round(innerWidth * dpi);
    h = canvas.height = Math.round(innerHeight * dpi);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  }
  resize();
  addEventListener('resize', resize);

  const stars = [];
  const baseCount = 180;
  for (let i=0;i<baseCount;i++){
    stars.push({
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*1.4 + 0.3,
      vx: 0.25 + Math.random()*0.25, // slight right
      vy: 0.7 + Math.random()*0.7,   // downwards
      tw: Math.random()*Math.PI*2
    });
  }

  const meteors = [];

  function shoot(){
    const sx = Math.random()*w*0.35;
    const sy = Math.random()*h*0.25;
    const speed = 8 + Math.random()*6;
    const angle = (22 + Math.random()*10) * Math.PI/180; // 22–32 degrees
    meteors.push({
      x:sx, y:sy, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed,
      life: 0, max: 60 + Math.random()*40
    });
  }
  setInterval(()=>{ if (meteors.length<3) shoot(); }, 2600 + Math.random()*2400);

  function tick(){
    ctx.clearRect(0,0,w,h);

    // stars
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (const s of stars){
      s.x += s.vx; s.y += s.vy; s.tw += 0.02;
      if (s.x > w || s.y > h) { s.x = Math.random()*w*0.5; s.y = -10; }
      const alpha = 0.5 + Math.sin(s.tw)*0.4;
      ctx.globalAlpha = alpha;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();

    // meteors (streaks)
    for (let i=meteors.length-1;i>=0;i--){
      const m = meteors[i];
      m.life++;
      const tx = m.x - m.vx*4;
      const ty = m.y - m.vy*4;

      const grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
      grad.addColorStop(0, 'rgba(180,210,255,0.9)');
      grad.addColorStop(1, 'rgba(180,210,255,0)');

      ctx.strokeStyle = grad; ctx.lineWidth = dpi*2;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();

      m.x += m.vx; m.y += m.vy;
      if (m.life > m.max || m.x > w+160 || m.y > h+160) meteors.splice(i,1);
    }

    requestAnimationFrame(tick);
  }
  tick();
})();
