/* Tilt + glare + reveal-on-scroll (lightweight, no deps) */
(function(){
  const tilts = document.querySelectorAll('.tilt');
  tilts.forEach(card=>{
    let rAF = null;
    const glare = card.querySelector('.glare');
    function onMove(e){
      if(rAF) return;
      rAF = requestAnimationFrame(()=>{
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        card.style.setProperty('--gx', (x*100).toFixed(1) + '%');
        card.style.setProperty('--gy', (y*100).toFixed(1) + '%');
        rAF = null;
      });
    }
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', ()=>{ if(glare){ glare.style.opacity = '0'; }});
    card.addEventListener('pointerenter', ()=>{ if(glare){ glare.style.opacity = '0.35'; }});
  });

  // Reveal-on-scroll
  const revealer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        revealer.unobserve(entry.target);
      }
    });
  }, {rootMargin:'-5% 0px'});
  document.querySelectorAll('.reveal').forEach(el=>revealer.observe(el));
})();
