/* Hero “signature pop-art” rotator — loads images, centers them, and auto-rotates */
(() => {
  const host = document.getElementById('sigRotator');
  if (!host) return;

  // Try several likely filename patterns; use whichever actually load
  const candidates = [
    // Common repo paths — adjust/add if you place new files
    'assets/hero/cerbi-pop-1.jpg',
    'assets/hero/cerbi-pop-2.jpg',
    'assets/hero/cerbi-pop-3.jpg',
    'assets/hero/cerbi-pop-4.jpg',
    'assets/hero/cerbi-pop-5.jpg',
    'assets/hero/cerbi-pop-1.png',
    'assets/hero/cerbi-pop-2.png',
    'assets/hero/cerbi-pop-3.png',
    // Fallback alt folders
    'assets/hero-art/cerbi-pop-1.jpg',
    'assets/hero-art/cerbi-pop-2.jpg',
    'assets/hero-art/cerbi-pop-3.jpg'
  ];

  function loadImages(paths){
    return Promise.all(paths.map(src => new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.decoding = 'async';
      img.loading = 'lazy';
      img.alt = 'Cerbi signature art';
      img.src = src;
      img.style.objectFit = 'contain';
      img.style.objectPosition = 'center';
    }))).then(list => list.filter(Boolean));
  }

  loadImages(candidates).then(images => {
    if (!images.length) {
      // Hide the section if nothing loads
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

    let timer = setInterval(next, 3800);
    host.addEventListener('pointerenter', () => clearInterval(timer));
    host.addEventListener('pointerleave', () => { timer = setInterval(next, 3800); });
  });
})();
