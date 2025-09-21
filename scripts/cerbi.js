/* Core page behaviors:
   - THEME: persistent + toggle
   - CLOCKS: background + badge
   - SLIDERS: why + dashboards
   - LIGHTBOX: dashboard zoom
   - POPART: centered rotator
   - GOVERNANCE DEMO: live rule check
   - PROGRESS BAR + CMDK (closed by default)
   - SMALL UTILS: copy buttons, mouse spotlight
*/

/* ---------- Utils ---------- */
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

/* ---------- Theme button ---------- */
(function initThemeButton(){
  const b = $('#themeBtn');
  if (b && window.CerbiTheme) b.addEventListener('click', ()=>window.CerbiTheme.toggle());
})();

/* ---------- Command Palette (kept closed by default) ---------- */
(function initCmdK(){
  const overlay = $('#cmdkOverlay');
  const input = $('#cmdkInput');
  if(!overlay) return;
  const open = () => { overlay.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; setTimeout(()=>input?.focus(), 0); };
  const close = () => { overlay.setAttribute('aria-hidden','true'); document.body.style.overflow=''; };
  $('#cmdBtn')?.addEventListener('click', open);
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) close(); });
  document.addEventListener('keydown', (e)=>{
    const k = e.key.toLowerCase();
    if ((e.metaKey || e.ctrlKey) && k === 'k') { e.preventDefault(); (overlay.getAttribute('aria-hidden')==='true'?open:close)(); }
    if (k === 'escape' && overlay.getAttribute('aria-hidden')==='false') close();
  });
  overlay.setAttribute('aria-hidden','true');
})();

/* ---------- Background Clock (large) ---------- */
(function initBgClock(){
  const el = $('#bg-clock'); if(!el) return;
  const read=(n,f)=>getComputedStyle(document.documentElement).getPropertyValue(n).trim()||f;
  function size(){
    const vw=Math.max(document.documentElement.clientWidth, window.innerWidth||0);
    el.style.fontSize=Math.min(Math.max(vw*0.36,96),900)+'px';
    el.style.lineHeight='1';
    const theme=document.documentElement.getAttribute('data-theme')||'dark';
    el.style.color = (theme==='light' || theme==='mint' || theme==='rose') ? read('--text','#0a0a0a') : read('--muted','#a7b4cf');
  }
  function render(){const d=new Date(); el.textContent=`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;}
  function fade(){
    const h=document.documentElement; const max=h.scrollHeight-h.clientHeight;
    const sc = (h.scrollTop||document.body.scrollTop);
    const t = Math.min(1, max? sc / (max*0.35) : 0); // stronger by ~1/3 scroll
    document.documentElement.style.setProperty('--clock-opacity', (0.05 + t*0.25).toFixed(3));
  }
  size(); render(); fade(); addEventListener('resize',size,{passive:true}); addEventListener('scroll',fade,{passive:true});
  new MutationObserver(size).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  setInterval(render,1000);
})();

/* ---------- Badge clock (top-right) ---------- */
(function initBadgeClock(){
  const el=$('#clock'); if(!el) return;
  const fmt=()=>{const d=new Date();const date=d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'2-digit'});const time=d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit'});return `${date} ${time}`;};
  const tick=()=>el.textContent=fmt(); tick(); setInterval(tick,1000);
})();

/* ---------- WHY slider ---------- */
(function initWhySlider(){
  const slider=$('#whySlider'); if(!slider) return;
  const slides=$$('.slide', slider);
  const dotsBox=$('.dots', slider); dotsBox.innerHTML=slides.map((_,i)=>`<button aria-label="Slide ${i+1}"></button>`).join('');
  const dots=$$('button', dotsBox);
  let i=slides.findIndex(s=>s.classList.contains('active')); if(i<0)i=0;
  const show=n=>{slides.forEach((s,idx)=>s.classList.toggle('active',idx===n)); dots.forEach((d,idx)=>d.classList.toggle('active',idx===n));};
  dots.forEach((d,idx)=>d.addEventListener('click',()=>show(idx))); show(i);
})();

/* ---------- Progress bar ---------- */
(function initProgress(){
  const bar=$('#progress'); if(!bar) return;
  const on=()=>{const h=document.documentElement; const max=h.scrollHeight-h.clientHeight; const pct=max?(100*((h.scrollTop||document.body.scrollTop)/max)):0; bar.style.setProperty('--progress',pct+'%');};
  on(); addEventListener('scroll',on,{passive:true}); addEventListener('resize',on,{passive:true});
})();

/* ---------- Footer year ---------- */
(function(){ const y=$('#year'); if(y) y.textContent=new Date().getFullYear(); })();

/* ---------- Dashboard slider + lightbox ---------- */
(function initDashboards(){
  const slider=$('#dashSlider'); if(!slider) return;
  const slides=$$('.slide', slider);
  const dotsBox=$('.dots', slider); dotsBox.innerHTML=slides.map((_,i)=>`<button aria-label="Screenshot ${i+1}"></button>`).join('');
  const dots=$$('button', dotsBox);
  let i=slides.findIndex(s=>s.classList.contains('active')); if(i<0)i=0;
  const show=n=>{slides.forEach((s,idx)=>s.classList.toggle('active',idx===n)); dots.forEach((d,idx)=>d.classList.toggle('active',idx===n));};
  dots.forEach((d,idx)=>d.addEventListener('click',()=>show(idx))); show(i);

  // Lightbox
  const overlay=$('#lightbox');
  const big=$('#lightboxImg');
  if(overlay && big){
    const open=(src)=>{ big.src=src; overlay.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; };
    const close=()=>{ overlay.setAttribute('aria-hidden','true'); big.removeAttribute('src'); document.body.style.overflow=''; };
    overlay.addEventListener('click', (e)=>{ if(e.target===overlay) close(); });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && overlay.getAttribute('aria-hidden')==='false') close(); });
    $$('img', slider).forEach(img=>{
      // Ensure correct asset paths (force absolute-from-root to avoid relative dir issues)
      if (img.src.includes('assets/')) {
        const url = new URL(img.getAttribute('src'), location.origin);
        img.setAttribute('src', url.pathname); // normalize to /assets/...
      }
      const full = img.dataset.full || img.src;
      img.addEventListener('click', ()=> open(full));
      img.style.cursor='zoom-in';
    });
  }
})();

/* ---------- Pop-art rotator ---------- */
(function initPopArt(){
  const el=$('#sigRotator'); if(!el) return;

  // Hard-coded list to match repo: /assets/popart/*.jpg (falls back to .png if a .jpg 404s)
  const names = [
    'cerbi-pop-1','cerbi-pop-2','cerbi-pop-3',
    'cerbi-pop-4','cerbi-pop-5','cerbi-pop-6',
    'cerbi-pop-7','cerbi-pop-8'
  ];
  const makeImg = (base, idx) => {
    const img = new Image();
    img.alt = 'Cerbi pop-art ' + (idx+1);
    img.decoding = 'async';
    img.loading = 'lazy';
    img.src = `/assets/popart/${base}.jpg`;
    img.addEventListener('error', ()=>{ img.src = `/assets/popart/${base}.png`; }, {once:true});
    if(idx===0) img.className='show';
    return img;
  };
  names.forEach((n,i)=> el.appendChild(makeImg(n,i)));

  let i=0;
  const step=()=>{ const imgs=$$('img', el); imgs.forEach((im,idx)=>im.classList.toggle('show', idx===i)); i=(i+1)%imgs.length; };
  setInterval(step, 3500);
})();

/* ---------- Governance Live Rule Check (restored) ---------- */
(function initGovernanceDemo(){
  const s=$('#piiSwitch');
  const input=$('#inputJson');
  const evalEl=$('#evalJson');
  if(!s||!input||!evalEl) return;

  function render(){
    const hasPII = s.getAttribute('aria-checked')==='true';
    input.textContent = JSON.stringify({
      timestamp:new Date().toISOString(),
      level:'Information',
      action:'UserLoggedIn',
      app:'identity-api',
      env:'prod',
      user: hasPII ? { id:'123', email:'jane@example.com' } : { id:'123' }
    }, null, 2);
    evalEl.textContent = hasPII
      ? JSON.stringify({ status:'redacted', violations:['PII: email'], policyVersion:'v1.3.2' }, null, 2)
      : JSON.stringify({ status:'ok', policyVersion:'v1.3.2' }, null, 2);
  }
  s.addEventListener('click', ()=>{
    const v=s.getAttribute('aria-checked')==='true';
    s.setAttribute('aria-checked', v?'false':'true');
    render();
  });
  s.addEventListener('keydown', (e)=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); s.click(); }});
  render();
})();

/* ---------- Copy button in code blocks ---------- */
(function initCopyButtons(){
  $$('[data-copy]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = btn.getAttribute('data-copy');
      const el = document.querySelector(target);
      if(!el) return;
      const text = el.innerText || el.textContent || '';
      navigator.clipboard.writeText(text).then(()=>{
        const old = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(()=>btn.textContent = old, 1200);
      }).catch(()=>{ /* ignore */ });
    });
  });
})();

/* ---------- Spotlight cursor ---------- */
(function initSpotlight(){
  const root = document.documentElement;
  document.addEventListener('pointermove', (e)=>{
    root.style.setProperty('--mx', e.clientX + 'px');
    root.style.setProperty('--my', e.clientY + 'px');
  }, {passive:true});
})();
