/* Lightweight tilt + glare and simple in-view motion */

(function(){
  // Tilt cards with mouse (adds CSS variables for glare)
  const tiltEls = document.querySelectorAll('.tilt');
  tiltEls.forEach(el=>{
    el.addEventListener('mousemove', (e)=>{
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--gx', (x*100) + '%');
      el.style.setProperty('--gy', (y*100) + '%');
    });
    el.addEventListener('mouseleave', ()=>{
      el.style.setProperty('--gx', '50%');
      el.style.setProperty('--gy', '50%');
    });
  });
})();
