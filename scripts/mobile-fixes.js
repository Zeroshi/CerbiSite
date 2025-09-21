/* Mobile nav toggle + small safe tweaks */
(function(){
  const nav = document.getElementById('primaryNav');
  const toggle = document.getElementById('navToggle'); // if you add a hamburger later
  if(toggle && nav){
    toggle.addEventListener('click', ()=>{
      nav.classList.toggle('open');
    });
  }

  // Ensure contact iframe stays full width on some mobile browsers
  const fixIframes = ()=>{
    document.querySelectorAll('iframe').forEach(f=>{
      f.style.maxWidth = '100%';
      f.style.width = '100%';
    });
  };
  fixIframes();
  window.addEventListener('resize', fixIframes, {passive:true});
})();
