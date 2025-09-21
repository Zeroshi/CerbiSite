/* Mobile & UX guards: nav toggle, cmdk behavior, sticky offsets */
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
    // Close on navigation
    nav.addEventListener('click', e=>{
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
      }
    });
  })();

  /* Prevent Cmd-K from being auto-active; index.html attaches listeners,
     but ensure overlay starts hidden and focus does not jump */
  (function cmdkGuard(){
    const overlay = document.getElementById('cmdkOverlay');
    if (!overlay) return;
    overlay.setAttribute('aria-hidden','true');
  })();

  /* iOS vh fix to prevent jumping content */
  (function iosVhFix(){
    const set = () => document.documentElement.style.setProperty('--vh', innerHeight * 0.01 + 'px');
    set(); addEventListener('resize', set, { passive:true });
  })();

  /* Ensure “Skip to content” stays hidden until focused (defense-in-depth) */
  (function skipGuard(){
    const a = document.querySelector('a[href="#main"]');
    if (!a) return;
    a.classList.add('visually-hidden-focusable');
  })();

  /* Contact FAB is CSS-positioned; ensure no conflicting inline style sneaks in */
  (function fabGuard(){
    const fab = document.querySelector('.contact-fab');
    if (!fab) return;
    fab.style.top = '';
    fab.style.transform = '';
    fab.style.bottom = '';
    fab.style.right = '';
  })();

})();
