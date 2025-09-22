/* Subtle starfield / particles on <canvas id="sky"> */
(function(){
  const cvs = document.getElementById('sky'); if(!cvs) return;
  const ctx = cvs.getContext('2d');
  let w=0,h=0, stars=[];
  function resize(){
    w = cvs.width = window.innerWidth;
    h = cvs.height = window.innerHeight;
    // more stars for visibility
    const count = Math.min(320, Math.floor((w*h)/9000));
    stars = Array.from({length: count}, ()=>({
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*1.6 + 0.4,
      a: Math.random()*0.7 + 0.2,
      s: Math.random()*0.5 + 0.1
    }));
  }
  function tick(){
    ctx.clearRect(0,0,w,h);
    ctx.save();
    for(const s of stars){
      s.a += (Math.random()-0.5)*0.02;
      const alpha = Math.max(0.10, Math.min(0.6, s.a));
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = '#c7d8ff';
      ctx.fill();
      s.x += s.s*0.06;
      if(s.x> w+5) s.x = -5;
    }
    ctx.restore();
    requestAnimationFrame(tick);
  }
  window.addEventListener('resize', resize, {passive:true});
  resize(); tick();
})();
