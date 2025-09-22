// Cerbi Forest JS — stars, gradient scroll, interactions
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  // Year
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  // Theme - support multiple named themes and persist selection
  const prefersLight = matchMedia('(prefers-color-scheme: light)').matches;
  const html = document.documentElement;
  const themeBtn = $('#themeBtn');

  const THEMES = ['dark','light','dusk','emerald','violet','sand','mint','rose','slate'];
  function applyTheme(t){
    if (!t) return;
    html.setAttribute('data-theme', t);
    html.dataset.theme = t;
    try{
      localStorage.setItem('theme', t);
      localStorage.setItem('cerbi-theme', t);
    }catch(e){ console.warn('Failed to persist theme', e); }
    if (themeBtn) themeBtn.textContent = `Theme: ${t}`;
    const ev = new CustomEvent('theme-changed', { detail: { theme: t } });
    window.dispatchEvent(ev);
    html.dispatchEvent(ev);
  }

  // expose global API for other scripts
  window.CerbiTheme = {
    list: THEMES.slice(),
    get(){ return document.documentElement.getAttribute('data-theme') || document.documentElement.dataset.theme || 'dark'; },
    set(t){ if (!t) return; if (!THEMES.includes(t)) return; applyTheme(t); },
    toggle(){
      const cur = this.get();
      const idx = THEMES.indexOf(cur);
      const next = THEMES[(idx + 1) % THEMES.length] || THEMES[0];
      applyTheme(next);
    }
  };

  // initialize theme from storage or system preference
  const saved = (()=>{ try{ return localStorage.getItem('theme') || localStorage.getItem('cerbi-theme'); }catch(e){ return null; } })();
  const initial = saved || (prefersLight ? 'light' : 'dark');
  if (!THEMES.includes(initial)) applyTheme('dark');
  else applyTheme(initial);

  // cycle themes on button click
  if (themeBtn){
    themeBtn.addEventListener('click', ()=>{
      window.CerbiTheme.toggle();
    });
  }

  // Mobile nav
  const navToggle = $('#navToggle');
  const nav = $('#primaryNav');
  navToggle?.addEventListener('click', () => {
    nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', nav.classList.contains('open'));
  });

  // Spotlight follows cursor
  const spotlight = $('.spotlight');
  document.addEventListener('pointermove', (e) => {
    spotlight?.style.setProperty('--mx', e.clientX + 'px');
    spotlight?.style.setProperty('--my', e.clientY + 'px');
  }, { passive: true });

  // Progress bar
  const progress = $('#progress');
  const setProgress = () => {
    const max = document.body.scrollHeight - innerHeight;
    const pct = Math.max(0, Math.min(1, scrollY / (max || 1)));
    if(progress) progress.style.width = (pct * 100) + '%';
  };
  document.addEventListener('scroll', setProgress, { passive: true });
  setProgress();

  // Reveal-on-scroll
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) e.target.classList.add('in');
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => io.observe(el));

  // Tilt + glare
  $$('.tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--gx', ((e.clientX - r.left) / r.width) * 100 + '%');
      card.style.setProperty('--gy', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
  });

  // Copy buttons
  $$('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sel = document.querySelector(btn.getAttribute('data-copy'))?.textContent;
      if (!sel) return;
      navigator.clipboard?.writeText(sel).then(()=>{
        const prev = btn.textContent; btn.textContent = 'Copied'; setTimeout(()=>btn.textContent=prev,1200);
      }).catch(()=>{});
    });
  });

})();
