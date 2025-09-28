/* Star/sky canvas kept firmly in the background */

(function(){
  const canvas = document.getElementById('sky');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let dpr = Math.max(1, window.devicePixelRatio || 1);

  function resize(){
    const w = Math.max(document.documentElement.clientWidth, window.innerWidth||0);
    const h = Math.max(document.documentElement.clientHeight, window.innerHeight||0);
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    initStars(w, h);
  }

  function initStars(w,h){
    const count = Math.round((w*h)/24000);
    stars = Array.from({length: count}, ()=>({
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*1.6 + 0.2,
      a: Math.random()*0.5 + 0.2,
      tw: Math.random()*0.02 + 0.005
    }));
  }

  function draw(){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0,0,w,h);
    for (const s of stars){
      s.a += s.tw; const op = 0.15 + 0.15*Math.sin(s.a*3.14);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(220,235,255,${op})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize(); draw();
  addEventListener('resize', resize, {passive:true});
})();
