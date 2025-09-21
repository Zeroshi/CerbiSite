/* Hero “pop-art” rotator — auto-detects files in /assets/popart and centers them */
(() => {
  const host = document.getElementById('sigRotator');
  if (!host) return;

  // Build a robust candidate list matching your repo: assets/popart/pop-01..20.(jpg|png|webp)
  const nums = Array.from({length:20}, (_,i)=>String(i+1).padStart(2,'0'));
  const exts = ['webp','jpg','png','jpeg'];
  const candidates = [];
  for (const n of nums) for (const ext of exts) candidates.push(`assets/popart/pop-${n}.${ext}`);

  function tryLoad(src){
    return new Promise(resolve=>{
      const img = new Image();
      img.onload = ()=> resolve(img);
      img.onerror = ()=> resolve(null);
      img.decoding = 'async';
      img.loading = 'lazy';
      img.alt = 'Cerbi signature art';
      img.src = src;
      img.style.objectFit = 'contain';
      img.style.objectPosition = 'center';
    });
  }

  Promise.all(candidates.map(tryLoad)).then(list=>{
    const images = list.filter(Boolean);
    if (!images.length) {
      // No popart found → hide section
      const section = host.closest('section');
      if (section) section.style.display = 'none';
      return;
    }

    images.forEach((img, i) => {
      if (i === 0) img.classList.add('show');
      host.appendChild(img);
    });

    let idx = 0;
    const next = () => {
      const cur = host.querySelectorAll('img')[idx];
      idx = (idx + 1) % images.length;
      const nxt = host.querySelectorAll('img')[idx];
      if (cur) cur.classList.remove('show');
      if (nxt) nxt.classList.add('show');
    };

    let timer = setInterval(next, 3600);
    host.addEventListener('pointerenter', () => clearInterval(timer));
    host.addEventListener('pointerleave', () => { timer = setInterval(next, 3600); });
  });
})();
