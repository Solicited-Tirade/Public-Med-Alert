const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
const mk=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!==undefined)e.innerHTML=html;return e};
const ECG='<svg class="ecg" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><path class="tr" pathLength="1" d="M0 30H110L130 30L145 6L160 54L175 18L190 30H400"/><path class="pl" pathLength="1" d="M0 30H110L130 30L145 6L160 54L175 18L190 30H400"/></g></svg>';
$$('.ol .t').forEach(t=>{const g=mk('span','ring',t.innerHTML);g.setAttribute('aria-hidden','true');t.append(g)});
$$('.ecgl .t').forEach(t=>t.insertAdjacentHTML('beforeend',ECG));
$$('.hud').forEach(h=>{for(let k=0;k<4;k++)h.append(mk('i'))});
$$('.sub').forEach(s=>{const txt=s.textContent;s.setAttribute('aria-label',txt);s.textContent='';[...txt].forEach((ch,k)=>{const q=mk('span','ch',ch===' '?'&nbsp;':ch);q.style.setProperty('--k',k);q.setAttribute('aria-hidden','true');s.append(q)})});
const scenes=$$('.scene');
scenes.forEach(s=>{let i=0;$$('.ln,.rv',s).forEach(e=>e.style.setProperty('--i',i++))});
const dots=$('.dots'),menu=$$('.menu a'),bar=$('.bar');
let cur=0,lock=false;
const behavior=()=>RM?'auto':'smooth';
const go=k=>{k=Math.max(0,Math.min(scenes.length-1,k));scenes[k].scrollIntoView({behavior:behavior(),block:'start'})};
scenes.forEach((s,k)=>{const d=mk('button','dot');d.type='button';d.setAttribute('aria-label',s.dataset.label);d.title=s.dataset.label;d.addEventListener('click',()=>go(k));dots.append(d)});
const reveal=new IntersectionObserver(es=>es.forEach(e=>{e.target.classList.toggle('on',e.isIntersecting);e.target.dispatchEvent(new CustomEvent('scene',{detail:e.isIntersecting}))}),{threshold:.3});
const track=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;cur=scenes.indexOf(e.target);$$('.dot',dots).forEach((d,j)=>d.setAttribute('aria-current',j===cur?'true':'false'));menu.forEach(a=>a.setAttribute('aria-current',a.hash==='#'+e.target.id?'true':'false'));bar.classList.toggle('min',cur>0)}),{threshold:.55});
scenes.forEach(s=>{reveal.observe(s);track.observe(s)});
let wTimer=0,minT=0;
const release=()=>{const r=minT-performance.now();if(r>0)wTimer=setTimeout(release,r+10);else lock=false};
addEventListener('wheel',e=>{
if(e.ctrlKey)return;
e.preventDefault();
clearTimeout(wTimer);wTimer=setTimeout(release,160);
if(lock||Math.abs(e.deltaY)<6)return;
lock=true;minT=performance.now()+700;go(cur+(e.deltaY>0?1:-1));
},{passive:false});
addEventListener('keydown',e=>{
if(e.altKey||e.ctrlKey||e.metaKey)return;
const t=e.target;
if(t.matches('input,textarea,select'))return;
const k=e.key;
let d=0;
if(k==='ArrowDown'||k==='PageDown'||k==='ArrowRight')d=1;
else if(k==='ArrowUp'||k==='PageUp'||k==='ArrowLeft')d=-1;
else if(k===' '){if(t.matches('button,a'))return;d=e.shiftKey?-1:1}
else if(k==='Home'){e.preventDefault();go(0);return}
else if(k==='End'){e.preventDefault();go(scenes.length-1);return}
if(!d)return;
if(t.closest('.qs')&&(k==='ArrowLeft'||k==='ArrowRight'))return;
e.preventDefault();go(cur+d);
});
$$('.cue,.menu a,.brand').forEach(a=>a.addEventListener('click',e=>{
const id=a.getAttribute('href');
if(!id||id[0]!=='#'||id.length<2)return;
const s=$(id);if(!s)return;
e.preventDefault();
const k=scenes.indexOf(s);if(k>-1)go(k)
}));
const counters=$$('.num');
const fmt=n=>Math.round(n).toLocaleString('en-US');
let raf=0;
const run=()=>{cancelAnimationFrame(raf);if(RM){counters.forEach(c=>c.textContent=fmt(+c.dataset.to));return}
const t0=performance.now()+500;
const step=t=>{const p=Math.max(0,Math.min(1,(t-t0)/1700)),e=1-Math.pow(1-p,3);counters.forEach(c=>c.textContent=fmt(c.dataset.to*e));if(p<1)raf=requestAnimationFrame(step)};
counters.forEach(c=>c.textContent='0');raf=requestAnimationFrame(step)};
$('#s7').addEventListener('scene',e=>{if(e.detail)run();else{cancelAnimationFrame(raf);counters.forEach(c=>c.textContent=fmt(+c.dataset.to))}});
const quotes=$$('.q'),segs=$$('.qs button'),qc=$('.qc'),pauseB=$('.qpz');
quotes.forEach(q=>{const b=$('blockquote',q);const words=b.textContent.trim().split(/\s+/);b.setAttribute('aria-label',b.textContent.trim());b.textContent='';words.forEach((w,k)=>{const s=mk('span','w',w);s.style.setProperty('--k',k);s.setAttribute('aria-hidden','true');b.append(s);if(k<words.length-1)b.append(document.createTextNode(' '))})});
let qi=0,qOn=false;
const paint=()=>{segs.forEach((s,k)=>{s.classList.remove('run','done');s.setAttribute('aria-current',k===qi?'true':'false');if(k<qi||(RM&&k===qi))s.classList.add('done');else if(k===qi&&qOn&&!qc.hasAttribute('data-p')&&!RM){void s.offsetWidth;s.classList.add('run')}})};
const showQ=i=>{qi=(i+quotes.length)%quotes.length;quotes.forEach((q,k)=>q.classList.toggle('on',k===qi));paint()};
segs.forEach((s,k)=>{s.addEventListener('animationend',()=>showQ(qi+1),true);s.addEventListener('click',()=>showQ(k))});
pauseB.addEventListener('click',()=>{const p=pauseB.getAttribute('aria-pressed')!=='true';pauseB.setAttribute('aria-pressed',p);pauseB.setAttribute('aria-label',p?'Resume rotation':'Pause rotation');if(p)qc.setAttribute('data-p','');else qc.removeAttribute('data-p');paint()});
$('#s8').addEventListener('scene',e=>{qOn=e.detail;if(e.detail)showQ(0);else segs.forEach(s=>s.classList.remove('run'))});
$('.quotes').addEventListener('pointerenter',()=>qc.setAttribute('data-h',''));
$('.quotes').addEventListener('pointerleave',()=>qc.removeAttribute('data-h'));
$$('.fq button').forEach(b=>b.addEventListener('click',()=>{
const open=b.getAttribute('aria-expanded')!=='true';
$$('.fq').forEach(f=>{f.classList.remove('open');$('button',f).setAttribute('aria-expanded','false')});
if(open){b.parentElement.parentElement.classList.add('open');b.setAttribute('aria-expanded','true')}
}));
$('#s9').addEventListener('scene',e=>{if(!e.detail)$$('.fq').forEach(f=>{f.classList.remove('open');$('button',f).setAttribute('aria-expanded','false')})});
const starEl=$('.cur');
if(matchMedia('(pointer:fine)').matches){
addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;document.documentElement.classList.add('cur-on');starEl.style.transform='translate3d('+e.clientX+'px,'+e.clientY+'px,0)';starEl.classList.add('on')},{passive:true});
document.documentElement.addEventListener('pointerleave',()=>starEl.classList.remove('on'));
}
