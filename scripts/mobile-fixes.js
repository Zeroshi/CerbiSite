/* Mobile & UX guards: nav toggle, cmdk state, FAB pin, skip link visibility */
(() => {
  const $ = (s, el=document) => el.querySelector(s);

  /* Mobile nav toggle */
  (function navToggle(){
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('primaryNav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', ()=>{
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', e=>{
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
      }
    });
  })();

  /* Command palette starts hidden (no auto-open) */
  (function cmdkGuard(){
    const overlay = document.getElementById('cmdkOverlay');
    if (!overlay) return;
    overlay.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  })();

  /* iOS vh fix */
  (function iosVhFix(){
    const set = () => document.documentElement.style.setProperty('--vh', innerHeight * 0.01 + 'px');
    set(); addEventListener('resize', set, { passive:true });
  })();

  /* Skip to content: ensure hidden until focus */
  (function skipGuard(){
    const a = document.querySelector('a[href="#main"]');
    if (!a) return;
    a.classList.add('visually-hidden-focusable');
  })();

  /* Contact FAB: force CSS position, clear any inline overrides */
  (function fabGuard(){
    const fab = document.querySelector('.contact-fab');
    if (!fab) return;
    ['top','transform','bottom','right','left'].forEach(k => fab.style[k] = '');
  })();

})();
