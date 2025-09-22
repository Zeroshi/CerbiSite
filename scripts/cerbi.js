/* CerbiSite core interactions
   - Theme guard + button hookup (index already boots theme)
   - Background effects (mouse spotlight, progressive clock)
   - Reveal on scroll
   - Signature pop-art rotator (robust path fallback)
   - Dashboard slider + clickable lightbox (click to open/close; Esc supported)
   - Governance demo (live rule check toggle)
   - Sticky progress bar
*/
(function(){
  // ---- Spotlight follows mouse
  const root = document.documentElement;
  document.addEventListener('mousemove', (e)=>{
    root.style.setProperty('--mx', e.clientX + 'px');
    root.style.setProperty('--my', e.clientY + 'px');
  }, {passive:true});

/* Background clock — time, cipher, braille, morse + easter egg */
(() => {
  const root = document.documentElement;
  const el = document.getElementById('bg-clock');
  if (!el) return;

  // a11y label (real time) so screen readers aren't confused by glyphs
  const sr = document.createElement('span');
  sr.className = 'sr-time';
  el.appendChild(sr);

  // modes
  const MODES = ['time','cipher','braille','morse'];
  const MODE_KEY = 'cerbi-clock-mode';

  // cute easter egg trigger (Konami), also Alt/Option+C cycles modes, and clicking the clock toggles
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let kBuf = [];

  // glyph sets
  const CIPHER = new Map(Object.entries({
    '0':'ϴ','1':'ι','2':'Ƨ','3':'ϟ','4':'҂','5':'۵','6':'Ϭ','7':'𐌚','8':'∞','9':'ϡ',':':'∷'
  }));
  // braille digits (⠁..⠉ for 1..9, ⠚ for 0), colon ≈ ⠒
  const BRAILLE = new Map(Object.entries({
    '1':'⠁','2':'⠃','3':'⠉','4':'⠙','5':'⠑','6':'⠋','7':'⠛','8':'⠓','9':'⠊','0':'⠚',':':'⠒'
  }));
  // morse helpers
  const MORSE_DIGIT = {
    '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
    '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'
  };
  const DOT = '•', DASH = '—', SEP = ' '; // thin space

  function getMode(){
    try { const v = localStorage.getItem(MODE_KEY); if (MODES.includes(v)) return v; } catch {}
    return 'cipher'; // default fun mode
  }
  function setMode(m){
    const mode = MODES.includes(m) ? m : 'time';
    MODES.forEach(mm => root.classList.toggle('clock-mode-'+mm, mm===mode));
    try { localStorage.setItem(MODE_KEY, mode); } catch {}
    // show tiny hint once
    el.setAttribute('data-hint','true');
    setTimeout(()=>el.removeAttribute('data-hint'), 2500);
  }

  function fmtTime(){
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    return `${hh}:${mm}`;
  }

  function toCipher(s, map){
    let out = '';
    for (const ch of s) out += (map.get(ch) || ch);
    return out;
  }

  function toMorse(s){
    // HH:MM (ignore colon visually, keep spacing)
    return s.split('').map(ch=>{
      if (ch === ':') return SEP.repeat(2);
      const pat = MORSE_DIGIT[ch] || '';
      return [...pat].map(c=> c==='.'?DOT:DASH).join(SEP);
    }).join(SEP.repeat(3));
  }

  function render(){
    const t = fmtTime();
    const mode = getMode();

    // a11y label always has true time
    sr.textContent = `Current time ${t}`;

    // hidden nod: on 13:37 show CERBI in runes for 10s (after render tick)
    const now = new Date();
    const easter = now.getHours()===13 && now.getMinutes()===37 && now.getSeconds()<10;

    // pick display
    let display;
    if (easter){
      // Elder Futhark-ish runes spelling CERBI (stylized)
      display = 'ᚳᛖᚱᛒᛁ';
    } else if (mode === 'cipher'){
      display = toCipher(t, CIPHER);
    } else if (mode === 'braille'){
      display = toCipher(t, BRAILLE);
    } else if (mode === 'morse'){
      display = toMorse(t);
    } else {
      display = t;
    }

    // responsive size + theme-aware color
    const read=(n,f)=>getComputedStyle(root).getPropertyValue(n).trim()||f;
    const vw=Math.max(document.documentElement.clientWidth, window.innerWidth||0);
    el.style.fontSize = Math.min(Math.max(vw*0.36,96),900)+'px';
    el.style.lineHeight='1';
    const theme=root.getAttribute('data-theme')||'dark';
    el.style.color = theme==='light' ? read('--text','#0a0a0a') : read('--muted','#a7b4cf');

    // render
    el.firstChild && (el.firstChild.nodeType===Node.TEXT_NODE) ? (el.firstChild.nodeValue = '') : null;
    // keep sr label as child #last, so set textContent on element minus last child
    // simple approach: set innerHTML to display + sr span outerHTML
    el.innerHTML = display + sr.outerHTML;
  }

  // init
  setMode(getMode());
  render();
  const clockTick = setInterval(render, 1000);

  // grow opacity with scroll (unchanged from your version)
  function fade(){
    const h=document.documentElement; const max=h.scrollHeight-h.clientHeight;
    const sc = (h.scrollTop||document.body.scrollTop);
    const t = Math.min(1, sc / (max*0.35));
    root.style.setProperty('--clock-opacity', (0.05 + t*0.25).toFixed(3));
  }
  addEventListener('scroll',fade,{passive:true});
  addEventListener('resize',render,{passive:true});
  new MutationObserver(render).observe(root,{attributes:true,attributeFilter:['data-theme']});

  // interactions: Alt/Option + C cycles; click to toggle; Konami → "runes" burst then back to cipher
  function cycle(dir=1){
    const cur = getMode();
    const i = MODES.indexOf(cur);
    const next = MODES[(i + dir + MODES.length) % MODES.length];
    setMode(next); render();
  }
  document.addEventListener('keydown', (e)=>{
    // buffer for konami
    kBuf.push(e.key);
    if (kBuf.length > KONAMI.length) kBuf.shift();
    if (KONAMI.every((v,idx)=>kBuf[idx]===v)){
      // flash easter egg immediately for a few seconds by faking time 13:37:00..09
      let n=0;
      const fake = setInterval(()=>{
        const theme=root.getAttribute('data-theme')||'dark';
        el.style.color = theme==='light' ? '#0b1530' : '#a7b4cf';
        el.innerHTML = 'ᚳᛖᚱᛒᛁ' + sr.outerHTML;
        if(++n>10){ clearInterval(fake); kBuf=[]; setMode('cipher'); render(); }
      }, 350);
      return;
    }
    // Alt/Option + C to cycle
    if ((e.altKey || e.metaKey) && (e.key.toLowerCase()==='c')) {
      e.preventDefault(); cycle(1);
    }
  });
  el.addEventListener('click', ()=> cycle(1));
})();


  // ---- Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(ent => { if(ent.isIntersecting){ ent.target.classList.add('in'); io.unobserve(ent.target); } });
    }, {rootMargin:'0px 0px -10% 0px', threshold:0.15});
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // ---- Pop-art signature rotator
  (function(){
    const host = document.getElementById('sigRotator');
    if(!host) return;

    // Known filenames (robust, absolute paths); add more if you upload more art
    // If some don't exist, onerror will skip them.
    const candidates = [
      '/assets/popart/cerbi-pop-01.jpg',
      '/assets/popart/cerbi-pop-02.jpg',
      '/assets/popart/cerbi-pop-03.jpg',
      '/assets/popart/cerbi-pop-04.jpg',
      '/assets/popart/cerbi-pop-05.jpg',
      '/assets/popart/cerbi-pop-06.jpg',
      '/assets/popart/cerbi-pop-07.jpg',
      '/assets/popart/cerbi-pop-08.jpg',
      '/assets/popart/cerbi-pop-09.jpg',
      '/assets/popart/cerbi-pop-10.jpg',
      // fallbacks: png/webp variants commonly used
      '/assets/popart/cerbi-pop-01.png',
      '/assets/popart/cerbi-pop-02.png',
      '/assets/popart/cerbi-pop-03.png',
      '/assets/popart/cerbi-pop-04.png',
      '/assets/popart/cerbi-pop-05.png',
      '/assets/popart/cerbi-pop-06.png',
      '/assets/popart/cerbi-pop-07.png',
      '/assets/popart/cerbi-pop-08.png',
      '/assets/popart/cerbi-pop-09.png',
      '/assets/popart/cerbi-pop-10.png',
      '/assets/popart/cerbi-pop-01.webp',
      '/assets/popart/cerbi-pop-02.webp',
      '/assets/popart/cerbi-pop-03.webp',
      '/assets/popart/cerbi-pop-04.webp'
    ];

    const imgs = [];
    let loaded = 0;
    function add(src){
      const im = new Image();
      im.decoding = 'async';
      im.loading = 'lazy';
      im.alt = 'Cerbi signature art';
      im.src = src;
      im.onerror = () => { /* skip */ };
      im.onload = () => {
        imgs.push(im);
        loaded++;
        if (loaded === 6 || imgs.length >= 6){ // cap at 6 for performance
          init();
        }
      };
    }
    // Try first 12 candidates aggressively
    candidates.slice(0,12).forEach(add);

    function init(){
      if (!imgs.length) return;
      host.innerHTML = '';
      imgs.slice(0,6).forEach((im, idx)=>{
        im.className = idx === 0 ? 'show' : '';
        im.style.transition = 'opacity .5s ease';
        host.appendChild(im);
      });
      let i = 0;
      setInterval(()=>{
        const all = host.querySelectorAll('img');
        if (!all.length) return;
        all.forEach(el => el.classList.remove('show'));
        i = (i + 1) % all.length;
        all[i].classList.add('show');
      }, 3200);
    }
  })();

  // ---- Dashboard slider + Lightbox (click to open/close)
  (function(){
    const slider = document.getElementById('dashSlider');
    if(!slider) return;
    const slides = [...slider.querySelectorAll('.slide')];
    const dotsBox = slider.querySelector('.dots');
    dotsBox.innerHTML = slides.map((_,i)=>`<button aria-label="Slide ${i+1}"></button>`).join('');
    const dots = [...dotsBox.querySelectorAll('button')];
    let i = slides.findIndex(s=>s.classList.contains('active')); if(i<0) i=0;
    const show = n => {
      slides.forEach((s,idx)=>s.classList.toggle('active', idx===n));
      dots.forEach((d,idx)=>d.classList.toggle('active', idx===n));
    };
    dots.forEach((d,idx)=>d.addEventListener('click', ()=>show(idx)));
    show(i);

    // Lightbox (no extra HTML required)
    let overlay = document.getElementById('cerbiLightbox');
    if (!overlay){
      overlay = document.createElement('div');
      overlay.id = 'cerbiLightbox';
      Object.assign(overlay.style, {
        position:'fixed', inset:'0', zIndex:'1300',
        display:'none', alignItems:'center', justifyContent:'center',
        background:'rgba(0,0,0,.7)', backdropFilter:'blur(4px)'
      });
      overlay.innerHTML = `<img alt="Screenshot" style="max-width:min(96vw,1600px);max-height:92vh;border-radius:14px;border:1px solid rgba(255,255,255,.22);box-shadow:0 18px 60px rgba(0,0,0,.55);display:block" />`;
      document.body.appendChild(overlay);
    }
    const lbImg = overlay.querySelector('img');
    const open = (src, srcset, sizes) => {
      lbImg.src = src; if(srcset) lbImg.srcset = srcset; if(sizes) lbImg.sizes = sizes;
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    };
    const close = () => { overlay.style.display = 'none'; document.body.style.overflow = ''; };

    // close on click (overlay or image) and Esc
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && overlay.style.display !== 'none') close(); });

    // make any click on the dashboard images open the lightbox
    slides.forEach(slide=>{
      const img = slide.querySelector('img');
      if(!img) return;
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', ()=>{
        open(img.currentSrc || img.src, img.srcset, img.sizes);
      });
    });
  })();

  // ---- Governance "Live Rule Check" demo (resilient)
  (function(){
    const sw = document.getElementById('piiSwitch');
    const inputBox = document.getElementById('inputJson');
    const evalBox = document.getElementById('evalJson');
    if(!sw || !inputBox || !evalBox) return;

    const base = {
      timestamp: new Date().toISOString(),
      level: 'Information',
      app: 'identity-api',
      env: 'prod',
      action: 'UserLoggedIn',
      user: { id: '7' },
      traceId: 'a1b2c3',
      tags: ['auth','success']
    };

    const render = () => {
      const hasPII = sw.getAttribute('aria-checked') === 'true';
      const input = Object.assign({}, base, hasPII ? { email: 'jane@ex.com' } : {});
      inputBox.textContent = JSON.stringify(input, null, 2);

      // pretend eval
      const evalRes = { ok: !hasPII, violations: [] };
      if (hasPII){
        evalRes.violations.push({ field:'email', rule:'PII.Redact', action:'redacted' });
      }
      evalBox.textContent = JSON.stringify(evalRes, null, 2);
    };

    sw.addEventListener('click', ()=>{
      const cur = sw.getAttribute('aria-checked') === 'true';
      sw.setAttribute('aria-checked', String(!cur));
      render();
    });
    sw.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sw.click(); }
    });

    render();
  })();

  // ---- Progress bar
  (function(){
    const bar = document.getElementById('progress'); if(!bar) return;
    const on = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max ? (100 * ((h.scrollTop || document.body.scrollTop) / max)) : 0;
      bar.style.setProperty('--progress', pct + '%');
      bar.style.width = pct + '%';
    };
    on(); addEventListener('scroll', on, {passive:true}); addEventListener('resize', on, {passive:true});
  })();

  // ---- Ensure theme toggle button works regardless of load order
  (function(){
    const btn = document.getElementById('themeBtn');
    if (btn){
      btn.addEventListener('click', ()=>{
        if (window.CerbiTheme && typeof window.CerbiTheme.toggle === 'function'){
          window.CerbiTheme.toggle();
        } else {
          // soft fallback: cycle data-theme directly
          const order = ['dark','light','dusk','emerald','violet'];
          const cur = document.documentElement.getAttribute('data-theme') || 'dark';
          const next = order[(order.indexOf(cur)+1) % order.length];
          document.documentElement.setAttribute('data-theme', next);
        }
      });
    }
  })();

})();

