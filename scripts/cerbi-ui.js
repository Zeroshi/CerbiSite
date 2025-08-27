/* ====== Utilities ====== */
const qs = (sel, el = document) => el.querySelector(sel);
const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];
const setTheme = t => {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('cerbi-theme', t);
  const meta = qs('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t === 'light' ? '#ffffff' : '#0a1224');
};

/* ====== Sticky progress ====== */
const progressBar = qs('#progress');
const onScroll = () => {
  const h = document.documentElement;
  const scrolled = h.scrollHeight > h.clientHeight
    ? (h.scrollTop) / (h.scrollHeight - h.clientHeight)
    : 0;
  if (progressBar) progressBar.style.width = (scrolled * 100).toFixed(2) + '%';
};
window.addEventListener('scroll', onScroll, { passive: true });

/* ====== Theme toggle (persisted) ====== */
(() => {
  const saved = localStorage.getItem('cerbi-theme');
  if (saved) setTheme(saved);
  qs('#themeBtn')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(cur === 'dark' ? 'light' : 'dark');
  });
})();

/* ====== Mobile nav ====== */
qs('#navToggle')?.addEventListener('click', () => {
  const nav = qs('#primaryNav');
  const open = nav.classList.toggle('open');
  qs('#navToggle').setAttribute('aria-expanded', String(open));
});

/* ====== Command palette ====== */
(() => {
  const overlay = qs('#cmdkOverlay');
  const input = qs('#cmdkInput');
  const list = qs('#cmdkList');
  if (!overlay || !input || !list) return;

  const items = [
    { label: 'Why', href: '#why' }, { label: 'Ecosystem', href: '#ecosystem' },
    { label: 'Governance', href: '#governance' }, { label: 'Packages', href: '#packages' },
    { label: 'Repositories', href: '#repos' }, { label: 'Compare', href: '#compare' },
    { label: 'Architecture', href: '#architecture' }, { label: 'Contact', href: '#contact' },
  ];
  list.innerHTML = items.map(i => `<div class="item"><span>${i.label}</span><span>${i.href}</span></div>`).join('');

  list.addEventListener('click', e => {
    const item = e.target.closest('.item'); if (!item) return;
    const href = item.lastChild.textContent.trim();
    overlay.classList.remove('open');
    window.location.hash = href;
  });

  const open = () => { overlay.classList.add('open'); input.value = ''; input.focus(); };
  const close = () => overlay.classList.remove('open');

  qs('#cmdBtn')?.addEventListener('click', open);
  window.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
    if (e.key === 'Escape') close();
  });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
})();

/* ====== Copy buttons ====== */
qsa('[data-copy]').forEach(btn => {
  btn.addEventListener('click', () => {
    const el = qs(btn.getAttribute('data-copy'));
    if (!el) return;
    const text = el.innerText || el.textContent || '';
    navigator.clipboard.writeText(text);
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 1200);
  });
});

/* ====== Reveal on scroll ====== */
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: .12 });
qsa('.reveal').forEach(el => obs.observe(el));

/* ====== Spotlight track ====== */
document.addEventListener('pointermove', e => {
  document.documentElement.style.setProperty('--mx', e.clientX + 'px');
  document.documentElement.style.setProperty('--my', e.clientY + 'px');
}, { passive: true });

/* ====== Governance demo ====== */
(() => {
  const sw = qs('#piiSwitch');
  const input = qs('#inputJson');
  const evalEl = qs('#evalJson');
  if (!sw || !input || !evalEl) return;

  const make = on => ({
    timestamp: new Date().toISOString(),
    level: "Information",
    user: { id: "12345", ...(on ? { email: "jane@example.com" } : {}) },
    action: "UserLoggedIn"
  });

  const render = obj => JSON.stringify(obj, null, 2);

  const evaluate = obj => {
    const violations = [];
    if (obj.user?.email) violations.push({ field: "user.email", type: "PII", rule: "Forbidden" });
    return { ok: violations.length === 0, violations };
  };

  const update = (on) => {
    const data = make(on);
    const verdict = evaluate(data);
    input.textContent = render(data);
    evalEl.textContent = render(verdict);
    sw.classList.toggle('on', on);
    sw.setAttribute('aria-checked', String(on));
  };

  sw.addEventListener('click', () => update(!sw.classList.contains('on')));
  sw.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); update(!sw.classList.contains('on')); }
  });
  update(false);
})();

/* ====== Compare filters ====== */
(() => {
  const rows = qsa('#compareTable tbody tr');
  const buttons = qsa('.filter');
  if (!rows.length || !buttons.length) return;

  const apply = tag => {
    rows.forEach(r => {
      if (tag === 'all') { r.style.display = ''; return; }
      const tags = (r.dataset.tags || '');
      r.style.display = tags.includes(tag) ? '' : 'none';
    });
  };

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      apply(btn.getAttribute('data-tag'));
    });
  });
})();

/* ====== Footer year & img error hints ====== */
(() => {
  const y = qs('#year');
  if (y) y.textContent = new Date().getFullYear();

  qsa('img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.opacity = '.3';
      if (img.alt) img.title = `${img.alt} not found: ${img.getAttribute('src')}`;
    }, { once: true });
  });
})();

/* ====== Contact form (mailto + spark burst) ====== */
(() => {
  const form = qs('#contactForm');
  const status = qs('#formStatus');
  if (!form) return;

  const burst = (x, y) => {
    for (let i = 0; i < 16; i++){
      const s = document.createElement('span');
      s.className = 'spark';
      const dx = (Math.random()*2-1) * 140 + 'px';
      const dy = (Math.random()*2-1) * 80 + 'px';
      s.style.setProperty('--x', x + 'px');
      s.style.setProperty('--y', y + 'px');
      s.style.setProperty('--dx', dx);
      s.style.setProperty('--dy', dy);
      document.body.appendChild(s);
      s.addEventListener('animationend', ()=> s.remove());
    }
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = fd.get('name') || '';
    const email = fd.get('email') || '';
    const company = fd.get('company') || '';
    const message = fd.get('message') || '';

    const subject = encodeURIComponent(`Cerbi.io contact — ${name} (${company || 'no company'})`);
    const body = encodeURIComponent(
      `From: ${name}\nEmail: ${email}\nCompany: ${company}\n\nMessage:\n${message}`
    );

    // Try opening mail client
    const href = `mailto:hello@cerbi.io?subject=${subject}&body=${body}`;
    window.location.href = href;

    // Feedback + sparkle
    status.textContent = 'Opening your email client…';
    const rect = e.target.getBoundingClientRect();
    burst(rect.left + rect.width - 40, rect.top + window.scrollY + 12);

    // Copy fallback
    navigator.clipboard.writeText(
      `To: hello@cerbi.io\nSubject: ${decodeURIComponent(subject)}\n\n${decodeURIComponent(body)}`
    ).catch(()=>{});
  });
})();
