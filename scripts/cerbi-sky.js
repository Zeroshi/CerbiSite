/* Cerbi starfield / background canvas — stays behind content */
(function(){
  const sky = document.getElementById('sky');
  if (!sky) return;
  const ctx = sky.getContext('2d');

  function resize(){
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    sky.width  = Math.floor(innerWidth  * dpr);
    sky.height = Math.floor(innerHeight * dpr);
    sky.style.width  = innerWidth + 'px';
    sky.style.height = innerHeight + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  // build a light starfield with slight twinkle
  const stars = [];
  function initStars(){
    stars.length = 0;
    const count = Math.max(120, Math.floor((innerWidth * innerHeight) / 12000));
    for (let i=0;i<count;i++){
      stars.push({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random() * 0.5 + 0.3,
        s: Math.random() * 0.8 + 0.2
      });
    }
  }

  function draw(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    // subtle vignette (keeps stars “in background” on light themes)
    ctx.fillStyle = 'rgba(6,10,20,0.35)';
    ctx.fillRect(0,0,innerWidth,innerHeight);

    for (const st of stars){
      st.a += (Math.random() - 0.5) * 0.04;
      const alpha = Math.max(0.08, Math.min(0.45, st.a));
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(230,240,255,${alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  function start(){
    resize(); initStars(); draw();
  }

  addEventListener('resize', ()=>{ resize(); initStars(); }, {passive:true});
  start();
})();
