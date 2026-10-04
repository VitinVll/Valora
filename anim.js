(()=>{const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
// headline palavra por palavra
const h=$('.hero h1');if(h){let i=0;const w=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t.trim())return f.append(t);const s=document.createElement('span');s.className='w';s.style.setProperty('--i',i++);s.textContent=t;f.append(s)});c.replaceWith(f)}else w(c)})};w(h)}
// desenhos do hero: vapor, órbitas, frutas
const art=$('.hero-art');
if(art){art.insertAdjacentHTML('afterbegin',`<span class="orbit"><i></i></span><span class="orbit o2"><i></i></span>`);
 art.insertAdjacentHTML('beforeend',`<svg class="steam" viewBox="0 0 110 200"><path d="M30 190C10 150 55 130 35 90S60 30 40 5"/><path d="M55 195C35 160 80 135 60 95S85 35 65 8"/><path d="M80 190C62 155 100 130 82 92S100 40 88 12"/></svg>
 <span class="deco d1"><svg viewBox="0 0 80 80"><circle cx="40" cy="44" r="28" fill="#4B5BFF"/><circle cx="40" cy="44" r="28" fill="url(#g2)" opacity=".25"/><path d="M40 28l5 5-5 5-5-5z" fill="#1A0F45"/><circle cx="30" cy="36" r="5" fill="#fff" opacity=".45"/></svg></span>
 <span class="deco d2"><svg viewBox="0 0 80 80"><g fill="#9B3DDB" stroke="#1A0F45" stroke-width="2.5"><circle cx="28" cy="30" r="12"/><circle cx="52" cy="30" r="12"/><circle cx="40" cy="48" r="12"/><circle cx="22" cy="52" r="10"/><circle cx="58" cy="52" r="10"/></g><path d="M40 20c0-9 6-14 14-14" stroke="#C6FF3D" stroke-width="4" fill="none" stroke-linecap="round"/></svg></span>
 <span class="deco d3"><svg viewBox="0 0 80 80"><path d="M8 52C8 24 34 10 70 14c2 34-14 58-42 56C16 69 8 62 8 52z" fill="#F2A900" stroke="#1A0F45" stroke-width="2.5"/><path d="M20 56C30 38 44 28 60 24" stroke="#fff" stroke-opacity=".5" stroke-width="4" fill="none" stroke-linecap="round"/></svg></span>
 <span class="deco d4"><svg viewBox="0 0 80 80"><path d="M40 70C14 62 10 30 40 8c30 22 26 54 0 62z" fill="#1FB28A" stroke="#1A0F45" stroke-width="2.5"/><path d="M40 14v54M40 36l-12-10M40 50l14-12" stroke="#1A0F45" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg></span>
 <span class="deco d5"><svg viewBox="0 0 80 80"><path d="M40 6C58 30 66 40 66 52a26 26 0 01-52 0C14 40 22 30 40 6z" fill="url(#g2)" stroke="#1A0F45" stroke-width="2.5"/><ellipse cx="30" cy="52" rx="5" ry="9" fill="#fff" opacity=".5" transform="rotate(20 30 52)"/></svg></span>`);
 $('.hero').insertAdjacentHTML('afterbegin','<span class="hero-glow"></span>');
 if(!calm)for(let i=0;i<16;i++){const b=document.createElement('span'),s=8+Math.random()*30;b.className='bub';b.style.cssText=`left:${Math.random()*100}%;width:${s}px;height:${s}px;--dx:${(Math.random()-.5)*120}px;animation-duration:${9+Math.random()*12}s;animation-delay:${-Math.random()*18}s`;$('.hero').append(b)}
 // parallax + brilho que segue o mouse
 const hero=$('.hero');hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  hero.style.setProperty('--mx',x*100+'%');hero.style.setProperty('--my',y*100+'%');art.style.setProperty('--px',(x-.5)*2);art.style.setProperty('--py',(y-.5)*2)})}
// faixa extra + contadores (dados reais da loja)
const mq=$('.marquee');if(mq){const m=mq.cloneNode(true);m.classList.add('m2');m.querySelector('div').innerHTML=['Sabores gelados','Cupons toda semana','Estoque em tempo real','Entrega até você'].concat(['Sabores gelados','Cupons toda semana','Estoque em tempo real','Entrega até você']).map(t=>`<span>${t}</span>`).join('');mq.after(m);
 const ps=Store.produtos(),sab=ps.reduce((a,p)=>a+(p.sabores||[]).length,0),cn=[[ps.length,'produtos no catálogo'],[sab||ps.length,'sabores e opções'],[ps.filter(p=>p.desc>0).length,'ofertas ativas'],[ps.reduce((a,p)=>a+p.estoque,0),'unidades em estoque']];
 m.insertAdjacentHTML('afterend',`<section class="wrap stats-s">${cn.map(([n,t])=>`<div class="rv"><b data-n="${n}">0</b><span>${t}</span></div>`).join('')}</section>`)}
// entrada ao rolar (uma vez)
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);
 const n=e.target.querySelector('[data-n]');if(n){const to=+n.dataset.n,t0=performance.now(),f=t=>{const k=Math.min(1,(t-t0)/1400);n.textContent=Math.round(to*(1-Math.pow(1-k,3)));k<1&&requestAnimationFrame(f)};calm?n.textContent=to:requestAnimationFrame(f)}}}),{threshold:.15});
const watch=()=>$$('.bar,.feat>div,.steps,.steps li,.faq details,.stats-s .rv,.card:not(.rv)').forEach((el,i)=>{if(!el.classList.contains('rv')){el.classList.add('rv');el.style.setProperty('--i',i%5)}io.observe(el)});
watch();new MutationObserver(()=>watch()).observe($('#grid'),{childList:true});
// card 3D + brilho
document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.card');if(!c||calm)return;if(!c.querySelector('.shine'))c.insertAdjacentHTML('beforeend','<span class="shine"></span>');
 const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;c.classList.add('tilt');c.style.setProperty('--ry',(x-.5)*10+'deg');c.style.setProperty('--rx',(.5-y)*10+'deg');c.style.setProperty('--sx',x*100+'%');c.style.setProperty('--sy',y*100+'%')});
document.addEventListener('pointerout',e=>{const c=e.target.closest&&e.target.closest('.card');if(c&&!c.contains(e.relatedTarget)){c.classList.remove('tilt');c.style.removeProperty('--rx');c.style.removeProperty('--ry')}});
// ripple + voar para o carrinho
document.addEventListener('click',e=>{const b=e.target.closest('.btn.solid');if(!b||calm)return;const r=b.getBoundingClientRect(),s=Math.max(r.width,r.height)*2,p=document.createElement('span');p.className='rip';p.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;b.append(p);setTimeout(()=>p.remove(),600);
 if(b.dataset.add&&!b.disabled){const c=$('#open-cart').getBoundingClientRect(),f=document.createElement('span');f.className='fly';f.style.left=e.clientX-28+'px';f.style.top=e.clientY-28+'px';document.body.append(f);
  requestAnimationFrame(()=>{f.style.transform=`translate(${c.left+c.width/2-e.clientX}px,${c.top+c.height/2-e.clientY}px) scale(.2)`;f.style.opacity='.2'});setTimeout(()=>f.remove(),800)}});
window.pulse=()=>{const b=$('#open-cart');b.classList.remove('pulse');void b.offsetWidth;b.classList.add('pulse')};
// confete ao confirmar pedido
window.confete=()=>{if(calm)return;const c=document.createElement('canvas');c.id='confete';c.width=innerWidth;c.height=innerHeight;document.body.append(c);const x=c.getContext('2d'),cor=['#FF3D81','#8B4DFF','#22E4FF','#C6FF3D'],
 p=Array.from({length:140},()=>({x:innerWidth/2,y:innerHeight*.6,vx:(Math.random()-.5)*16,vy:-8-Math.random()*12,s:5+Math.random()*7,c:cor[Math.random()*4|0],r:Math.random()*6,vr:(Math.random()-.5)*.4}));let t=0;
 (function f(){x.clearRect(0,0,c.width,c.height);p.forEach(q=>{q.vy+=.35;q.x+=q.vx;q.y+=q.vy;q.r+=q.vr;x.save();x.translate(q.x,q.y);x.rotate(q.r);x.fillStyle=q.c;x.fillRect(-q.s/2,-q.s/4,q.s,q.s/2);x.restore()});++t<130?requestAnimationFrame(f):c.remove()})()};
})();
