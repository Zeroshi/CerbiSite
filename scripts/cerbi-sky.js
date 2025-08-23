// Cerbi “Sky” runtime
};
test(0);
})();


// ================== Stars & Constellations ==================
const canvas = $('#sky');
if (canvas) {
const ctx = canvas.getContext('2d');
let dpr = Math.max(1, Math.min(2, devicePixelRatio||1));
let W=0, H=0;
const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;


function resize(){
dpr = Math.max(1, Math.min(2, devicePixelRatio||1));
W = Math.floor(innerWidth * dpr); H = Math.floor(innerHeight * dpr);
canvas.width=W; canvas.height=H; canvas.style.width=innerWidth+'px'; canvas.style.height=innerHeight+'px';
makeStars();
}


const stars=[]; let constellations=[];
function rnd(min,max){ return Math.random()*(max-min)+min; }


function makeStars(){
stars.length = 0;
const count = Math.floor(200 * (innerWidth*innerHeight) / (1280*720));
for(let i=0;i<count;i++){
stars.push({ x:Math.random()*W, y:Math.random()*H, r:rnd(0.6,1.8)*dpr, a:rnd(0.4,0.9), tw:rnd(0.0008,0.0028), p:Math.random()*Math.PI*2 });
}
constellations = buildConstellations();
}


function norm(pt){ return { x: pt.x * W, y: pt.y * H }; }
function buildConstellations(){
// Normalized coordinates (rough layouts)
const sets = [
// Big Dipper (Ursa Major)
[{x:.08,y:.18},{x:.12,y:.16},{x:.17,y:.18},{x:.22,y:.22},{x:.30,y:.20},{x:.36,y:.16},{x:.42,y:.18}],
// Cassiopeia
[{x:.55,y:.12},{x:.58,y:.16},{x:.62,y:.12},{x:.66,y:.16},{x:.70,y:.12}],
// Orion (belt & shoulders)
[{x:.72,y:.26},{x:.76,y:.28},{x:.80,y:.30},{x:.76,y:.22},{x:.72,y:.26},{x:.78,y:.20}],
// Cygnus (Northern Cross)
[{x:.48,y:.10},{x:.50,y:.20},{x:.52,y:.30},{x:.44,y:.22},{x:.56,y:.18}],
// Scorpius (tail curve)
[{x:.18,y:.30},{x:.22,y:.34},{x:.26,y:.38},{x:.30,y:.36},{x:.32,y:.40}]
];
return sets.map(arr => arr.map(norm));
}


function draw(t){
ctx.clearRect(0,0,W,H);


// soft dark overlay to lift stars
const g=ctx.createLinearGradient(0,0,0,H);
g.addColorStop(0,'rgba(0,0,0,0.12)'); g.addColorStop(1,'rgba(0,0,0,0)');
ctx.fillStyle=g; ctx.fillRect(0,0,W,H);


ctx.save(); ctx.globalCompositeOperation='screen';
for(const s of stars){
const tw = prefersReduced ? 0 : (Math.sin(t*s.tw+s.p)*0.25);
const a=Math.max(0, Math.min(1, s.a + tw));
ctx.globalAlpha=a; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle='rgba(255,244,230,0.95)'; ctx.fill();
}
ctx.restore();


// Constellation lines
ctx.save(); ctx.globalAlpha=0.18; ctx.strokeStyle='#ffe0c2'; ctx.lineWidth=Math.max(0.6,1*dpr);
ctx.shadowColor='rgba(255,200,160,0.35)'; ctx.shadowBlur=6*dpr;
for(const group of constellations){
ctx.beginPath(); const p0=group[0]; if(!p0) continue; ctx.moveTo(p0.x, p0.y);
for(let i=1;i<group.length;i++){ const p=group[i]; ctx.lineTo(p.x,p.y); }
ctx.stroke();
}
ctx.restore();


requestAnimationFrame(loop);
}


let last=0; function loop(now){ const t=(now-last)*0.001; last=now; draw(now*0.001); }


addEventListener('resize', ()=>{ clearTimeout(resize._t); resize._t=setTimeout(resize,120); }, { passive:true });
resize(); requestAnimationFrame(loop);
}
})();
