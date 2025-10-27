/* Cerbi — minimal JS for a stable, professional site */

(function(){
  const $  = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));

  // Footer year
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  // Progress bar
  (function(){
    const bar = $("#progress"); if (!bar) return;
    const on = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const sc = h.scrollTop || document.body.scrollTop;
      const pct = max ? (100 * (sc / max)) : 0;
      bar.style.setProperty("--progress", pct + "%");
    };
    addEventListener("scroll", on, {passive:true});
    addEventListener("resize", on, {passive:true});
    on();
  })();

  // Mobile menu
  (function(){
    const btn = $(".hamburger");
    const menu = $("#mobileMenu");
    if (!btn || !menu) return;
    btn.addEventListener("click", () => {
      const open = menu.hasAttribute("hidden");
      if (open) menu.removeAttribute("hidden");
      else menu.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", String(open));
    });
    // Close on nav click
    menu.addEventListener("click", e => {
      if (e.target.tagName === "A") {
        menu.setAttribute("hidden",""); btn.setAttribute("aria-expanded","false");
      }
    });
  })();

  // Glyph Clock (subtle, background)
  (function(){
    const el = $("#bg-clock"); if (!el) return;
    const glyphs = ["◴","◵","◶","◷","●"];
    function size(){
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth||0);
      el.style.fontSize = Math.min(Math.max(vw * 0.28, 120), 800) + "px";
    }
    function tick(){
      const d = new Date();
      const t = `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
      // alternate between time and a glyph for subtle motion
      el.textContent = (d.getSeconds() % 8 === 0) ? glyphs[(d.getSeconds()/8)|0 % glyphs.length] : t;
    }
    size(); tick();
    addEventListener("resize", size, {passive:true});
    setInterval(tick, 1000);
  })();

  // Live Rule Check demo
  (function(){
    const sw = $("#piiSwitch");
    const input = $("#inputJson");
    const evalOut = $("#evalJson");
    if (!sw || !input || !evalOut) return;

    function render(){
      const pii = sw.getAttribute("aria-pressed") === "true";
      const payload = {
        app: "claims-api",
        level: "Information",
        user: pii ? { id: "12345", email: "alice@example.com" } : { id: "12345" },
        route: "/claims/submit",
        durationMs: 182
      };
      input.textContent = JSON.stringify(payload, null, 2);

      const violations = [];
      if (pii) violations.push({ field:"user.email", rule:"PII.Email", action:"redact" });

      const evaluated = JSON.parse(JSON.stringify(payload));
      if (pii) evaluated.user.email = "██████";

      evalOut.textContent = JSON.stringify({
        ok: violations.length === 0,
        violations,
        output: evaluated
      }, null, 2);
    }
    sw.addEventListener("click", () => {
      const cur = sw.getAttribute("aria-pressed") === "true";
      sw.setAttribute("aria-pressed", String(!cur));
      render();
    });
    render();
  })();

  // Pop-art rotator (one active image)
  (function(){
    const el = $("#sigRotator"); if (!el) return;
    const imgs = [
      "assets/popart/popart-01.png","assets/popart/popart-02.png","assets/popart/popart-03.png",
      "assets/popart/popart-04.png","assets/popart/popart-05.png","assets/popart/popart-06.png",
      "assets/popart/popart-07.png","assets/popart/popart-08.png","assets/popart/popart-09.png",
      "assets/popart/popart-10.png"
    ].map((src,i)=>{ const im=new Image(); im.src=src; im.alt="Cerbi pop-art "+(i+1); im.decoding="async"; im.loading = i===0 ? "eager" : "lazy"; if(i===0) im.className="active"; el.appendChild(im); return im; });
    let i = 0;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced && imgs.length>1){
      setInterval(()=>{ imgs[i].classList.remove("active"); i=(i+1)%imgs.length; imgs[i].classList.add("active"); }, 3500);
    }
  })();

  // Dashboards slider (full width, auto-rotating)
  (function(){
    const vp = $("#dashViewport"); if (!vp) return;
    const slides = $$(".slide", vp);
    const dotsBox = $("#dashDots");
    const prevBtn = document.querySelector("[data-prev]");
    const nextBtn = document.querySelector("[data-next]");
    if (!slides.length || !dotsBox) return;

    dotsBox.innerHTML = slides.map((_,n)=>`<button aria-label="Go to slide ${n+1}"></button>`).join("");
    const dots = Array.from(dotsBox.children);

    let i = Math.max(0, slides.findIndex(s => s.classList.contains("active")));
    function show(n){
      i = (n + slides.length) % slides.length;
      slides.forEach((s,idx)=>s.classList.toggle("active", idx===i));
      dots.forEach((d,idx)=>d.classList.toggle("active", idx===i));
    }
    dots.forEach((d,idx)=>d.addEventListener("click",()=>show(idx)));
    prevBtn?.addEventListener("click", ()=>show(i-1));
    nextBtn?.addEventListener("click", ()=>show(i+1));
    show(i);

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer=null;
    const start=()=>{ if(reduced) return; stop(); timer=setInterval(()=>show(i+1), 5000); };
    const stop =()=>{ if(timer) clearInterval(timer); timer=null; };
    start();
    const showcase = vp.closest(".showcase");
    showcase?.addEventListener("mouseenter", stop);
    showcase?.addEventListener("mouseleave", start);

    // Lightbox on image click
    const overlay = $("#lightbox"), big = $("#lightImg");
    const open = (src)=>{ if(!overlay||!big) return; big.src=src; overlay.hidden=false; overlay.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; };
    const close= ()=>{ if(!overlay||!big) return; overlay.hidden=true; overlay.setAttribute("aria-hidden","true"); big.removeAttribute("src"); document.body.style.overflow=""; };
    overlay?.querySelector(".close")?.addEventListener("click", close);
    overlay?.addEventListener("click", e=>{ if(e.target===overlay) close(); });
    document.addEventListener("keydown", e=>{ if(e.key==="Escape" && overlay?.getAttribute("aria-hidden")==="false") close(); });
    $$("img", vp).forEach(img => img.addEventListener("click", ()=>open(img.currentSrc || img.src)));
  })();

  // Docs modal (Markdown) — progressive enhancement without blocking
  (function(){
    const docLinks = $$(".doc-link");
    if (!docLinks.length) return;
    function openMd(text){
      const box = document.createElement("div");
      box.className = "lightbox";
      box.innerHTML = `<button class="close btn ghost" aria-label="Close">✕</button><article class="doc-article"></article>`;
      document.body.appendChild(box);
      box.querySelector(".doc-article").innerText = text; // raw for safety
      const close = ()=>{ box.remove(); };
      box.querySelector(".close").addEventListener("click", close);
      box.addEventListener("click", e=>{ if(e.target===box) close(); });
      document.addEventListener("keydown", e=>{ if(e.key==="Escape") close(); }, { once:true });
    }
    async function getText(url){
      try{ const r=await fetch(url, {cache:"no-store"}); if(r.ok) return await r.text(); }catch{}
      try{ const gh = "https://raw.githubusercontent.com/Zeroshi/CerbiSite/main/" + url.replace(/^\//,''); const r2=await fetch(gh,{cache:"no-store"}); if(r2.ok) return await r2.text(); }catch{}
      return "Not found.";
    }
    docLinks.forEach(a=>{
      a.addEventListener("click", async (e)=>{
        if (!a.href.endsWith(".md")) return; // let non-md behave normally
        e.preventDefault();
        const path = a.getAttribute("href").replace(/^\//,'');
        const txt = await getText(path);
        openMd(txt);
      });
    });
  })();

})();
