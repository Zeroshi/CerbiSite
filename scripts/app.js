/* scripts/app.js — robust theme manager (cycle-safe, idempotent) */
(function () {
  // Prevent double-initialization if this file is included twice
  if (window.CerbiTheme && window.CerbiTheme.__v === '2.0.0') return;

  const KEY   = 'cerbi-theme';
  const ORDER = ['dark','light','dusk','emerald','violet','sand','mint','rose','slate'];
  const DOC   = document.documentElement;

  // Utilities
  const clampTheme = (t) => ORDER.includes(t) ? t : null;
  const getSaved   = () => clampTheme(localStorage.getItem(KEY));
  const getAttr    = () => clampTheme(DOC.getAttribute('data-theme'));

  // Initialization: decide the starting theme exactly once
  function initTheme() {
    // 1) saved
    let t = getSaved();
    if (t) return setTheme(t, { announce:false, persist:false });

    // 2) attribute already set by inline boot script (validate)
    t = getAttr();
    if (t) return setTheme(t, { announce:false, persist:true });

    // 3) system preference → light if media matches, else dark
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return setTheme('light', { announce:false, persist:true });
      }
    } catch (_) {}
    return setTheme('dark', { announce:false, persist:true });
  }

  let busy = false;
  function setTheme(theme, opts) {
    const { announce = true, persist = true } = (opts || {});
    const t = clampTheme(theme);
    if (!t) return false;

    if (busy) return false;
    busy = true;

    const prev = DOC.getAttribute('data-theme');
    DOC.setAttribute('data-theme', t);
    if (persist) {
      try { localStorage.setItem(KEY, t); } catch (_) {}
    }
    if (announce) {
      try {
        window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: t, prev } }));
      } catch (_) {}
    }

    // re-entrancy guard releases on next tick
    setTimeout(() => { busy = false; }, 0);
    return true;
  }

  function getTheme() {
    return getAttr() || getSaved() || ORDER[0];
  }

  function indexOf(t) {
    const i = ORDER.indexOf(t);
    return i >= 0 ? i : 0;
  }

  function nextTheme() {
    const cur = getTheme();
    const i   = indexOf(cur);
    return ORDER[(i + 1) % ORDER.length];
  }

  function toggle() {
    return setTheme(nextTheme(), { announce: true, persist: true });
  }

  // Public API
  window.CerbiTheme = {
    __v: '2.0.0',
    ORDER: ORDER.slice(),
    get: getTheme,
    set: setTheme,
    toggle,
    next: nextTheme
  };

  // Initialize once DOM is ready enough to set attributes
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme, { once: true });
  } else {
    initTheme();
  }

  // Optional: keep a *single* listener to system changes, but only if user has never chosen a theme
  // If a user picked a theme (we have localStorage), we respect that and ignore OS flips.
  try {
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)');
    if (mq && !getSaved()) {
      const onChange = () => {
        if (!getSaved()) setTheme(mq.matches ? 'light' : 'dark', { announce: true, persist: false });
      };
      if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange);
      else if (typeof mq.addListener === 'function') mq.addListener(onChange);
    }
  } catch (_) {}

  // Wire up any buttons that might exist (idempotent; safe to run even if buttons absent)
  (function wireButtons(){
    const btn = document.getElementById('themeBtn');
    const cyc = document.getElementById('theme-cycle');
    const updateBadge = () => {
      const label = document.getElementById('theme-name');
      if (label) label.textContent = 'Theme: ' + getTheme();
    };
    if (btn) btn.addEventListener('click', () => { toggle(); updateBadge(); });
    if (cyc) cyc.addEventListener('click', () => { toggle(); updateBadge(); });
    window.addEventListener('theme-changed', updateBadge);
    // Initial badge render (after initTheme runs)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateBadge, { once:true });
    } else {
      setTimeout(updateBadge, 0);
    }
  })();
})();
