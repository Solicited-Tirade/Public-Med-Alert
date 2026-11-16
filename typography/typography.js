const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
const IMG='../media/img/',WORD=.7,HOLD=1.4;
const BEATS=[
{l:[['N*BODY','O'],['GETS'],['LEFT BEHIND','a']],bg:'hero'},
{l:[['HELP','Ea'],['IS'],['INBOUND','R']],bg:'ship'},
{l:[['WE COME'],['TO YOU','a']],bg:'pisces',hud:1,mid:1,sub:'ANYWHERE IN THE VERSE'},
{l:[['MED'],['RUNNER']],bg:'lineup',win:'lineup',mid:1},
{end:1,bg:'team'}
];
const cue=$('.cue'),dots=$('.dots'),stage=$('#stage'),bgsEl=$('#bgs'),beatsEl=$('#beats'),skip=$('.skipbtn'),prog=$('.prog'),progBar=$('i',prog);
const bgEls={};
['hero','lineup','team','ship','pisces','fire'].forEach(k=>{const im=document.createElement('img');im.className='bg';im.src=IMG+k+'.webp';im.alt='';bgsEl.append(im);bgEls[k]=im});
let manual=false,wLock=false,wTimer=0,wLast=0,wAt=0,beats=[],cur=-1,t=0,total=0,lastStep=0,pointer=[0,0];
const dur=b=>b.end?4:b.l.length*WORD+HOLD+(b.sub?1.3:0);
const mk=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!==undefined)e.innerHTML=html;return e};
const STAR='<svg class="st" viewBox="-50 -50 100 100" aria-hidden="true"><g><rect x="-9" y="-44" width="18" height="88" rx="2"/><rect x="-9" y="-44" width="18" height="88" rx="2" transform="rotate(60)"/><rect x="-9" y="-44" width="18" height="88" rx="2" transform="rotate(120)"/></g></svg>';
const ECG='<svg class="ecg" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><path class="tr" pathLength="1" d="M0 30H110L130 30L145 6L160 54L175 18L190 30H400"/><path class="pl" pathLength="1" d="M0 30H110L130 30L145 6L160 54L175 18L190 30H400"/></g></svg>';
const lineEl=([txt,fx=''],i)=>{
const e=mk('span','line'+(fx.includes('r')?' er':'')+(fx.includes('a')?' ea':'')+(fx.includes('R')?' ar arr':'')+(fx.includes('O')?' ol':'')+(fx.includes('E')?' ecgl':''));
e.dataset.at=(i*WORD).toFixed(2);
const html=fx.includes('O')?txt.replace('*',STAR):txt;
const t=mk('span','t',html);t.dataset.w=txt.replace('*','O');
if(fx.includes('O')){const g=mk('span','ring',html);g.setAttribute('aria-hidden','true');t.append(g)}
if(fx.includes('E'))t.insertAdjacentHTML('beforeend',ECG);
e.append(t);return e};
function build(){
beatsEl.innerHTML='';
beats=BEATS.map((b,i)=>{
const el=mk('section','beat');
el.setAttribute('aria-hidden','true');
const h=mk('h2','copy');
let endParts=[];
if(b.end){
const w=mk('div','end');
const logo=mk('img','logo');logo.src=IMG+'logo.webp';logo.alt='Medrunner';
const hh=mk('h2','copy');
const line=mk('span','line');
line.innerHTML='<span class="t"><span class="x er">NEED US</span>, OR <span class="x ea">WANT IN?</span></span>';
hh.append(line);
const ctas=mk('div','ctas','<a class="cta need" href="#"><b>Need help?</b><span>Raise an alert</span></a><a class="cta join" href="#"><b>Want to help?</b><span>Join Medrunner</span></a>');
w.append(logo,hh,ctas);
el.append(w);
endParts=[[logo,0],[hh,.5],[ctas,1.5]];
return {b,el,dur:dur(b),lines:[line],endParts};
}
const lines=b.l.map(lineEl);
h.append(...lines);
if(b.sub){const s=mk('span','sub');s.dataset.at=(b.l.length*WORD+.15).toFixed(2);s.setAttribute('aria-label',b.sub);[...b.sub].forEach((ch,k)=>{const q=mk('span','ch',ch===' '?'&nbsp;':ch);q.style.setProperty('--k',k);q.setAttribute('aria-hidden','true');s.append(q)});h.append(s)}
if(b.hud){h.classList.add('hud');for(let k=0;k<4;k++)h.append(mk('i'))}
if(b.mid)el.classList.add('mid');
el.append(h);
if(b.win)lines.forEach(l=>{l.classList.add('win');l.firstChild.style.backgroundImage='linear-gradient(rgba(255,255,255,.5),rgba(255,255,255,.5)),url('+IMG+b.win+'.webp)'});
beatsEl.append(el);
return {b,el,dur:dur(b),lines,endParts};
});
beats.forEach(x=>{if(!x.el.parentNode)beatsEl.append(x.el)});
total=beats.reduce((a,x)=>a+x.dur,0);
$$('b',prog).forEach(e=>e.remove());
let acc=0;beats.slice(0,-1).forEach(x=>{acc+=x.dur;const m=document.createElement('b');m.style.left=(acc/total*100)+'%';prog.append(m)});
dots.innerHTML='';beats.forEach((x,k)=>{const d=mk('button','dot');d.type='button';d.setAttribute('aria-label','Section '+(k+1));d.addEventListener('click',()=>{manual=true;show(k)});dots.append(d)});
cur=-1;fit();show(0);
}
function fit(){
const probe=mk('span');
probe.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;font-size:100px;letter-spacing:.015em';
document.body.append(probe);
beats.forEach(x=>{
if(x.b.end)return;
const l0=x.lines[0],cs=getComputedStyle(l0),pad=parseFloat(getComputedStyle(x.el).paddingLeft),avail=innerWidth-2*pad;
probe.style.fontFamily=cs.fontFamily;probe.style.fontWeight=cs.fontWeight;probe.style.textTransform=cs.textTransform;
const w=Math.max(...x.lines.map((l,k)=>{probe.style.letterSpacing=l.classList.contains('ar')?'-.07em':'.015em';probe.textContent=l.firstChild.dataset.w;return probe.offsetWidth+(l.classList.contains('ar')?140:0)}));
const cap=x.b.win?Math.min(300,innerWidth*.2):Math.min(260,innerWidth*(innerWidth<860?.16:.165));
const hcap=(innerHeight-64-170)/(x.lines.length*.9+(x.lines.some(l=>l.classList.contains('ar'))?.3:0)+(x.b.sub?.4:0));
const fs=Math.max(32,Math.min(cap,hcap,avail*(x.b.hud?.8:.96)/w*100));
x.el.style.setProperty('--fs',fs.toFixed(1)+'px');
});
probe.remove();
}
function show(i){
i=clamp(i,0,beats.length-1);
if(cur>=0&&cur!==i){const o=beats[cur].el;o.classList.remove('on');if(i===0&&cur===beats.length-1){o.classList.remove('out');o.classList.add('kill')}else{o.classList.add('out');setTimeout(()=>o.classList.remove('out'),700)}}
cur=i;t=0;
const x=beats[i];
x.el.classList.remove('kill');x.el.classList.add('rs');
$$('.line',x.el).forEach(l=>l.classList.remove('on'));$$('.copy',x.el).forEach(l=>l.classList.remove('go'));$$('.sub',x.el).forEach(l=>l.classList.remove('on'));
x.endParts.forEach(([e])=>e.classList.remove('on'));
void x.el.offsetWidth;
x.el.classList.remove('rs','out');
x.el.classList.add('on');
x.el.setAttribute('aria-hidden','false');
beats.forEach((o,k)=>{if(k!==i)o.el.setAttribute('aria-hidden','true')});
const dim=!!x.b.win;
bgsEl.toggleAttribute('data-dim',dim);
Object.entries(bgEls).forEach(([k,e])=>e.classList.toggle('on',k===x.b.bg));
const last=i===beats.length-1;
document.body.classList.toggle('last',last);
skip.textContent=last?'Replay':'Skip to end →';
$$('.dot',dots).forEach((d,k)=>d.setAttribute('aria-current',k===i?'true':'false'));
cue.classList.remove('on');
if(RM){render(x.dur);cue.classList.toggle('on',!last)}
}
function render(tt){
const x=beats[cur];
if(!x)return;
if(x.b.end){x.endParts.forEach(([e,at])=>e.classList.toggle('on',tt>=at));x.lines[0].classList.toggle('on',tt>=.5)}
else{
x.lines.forEach(l=>{l.classList.toggle('on',RM||tt>=+l.dataset.at)});$$('.copy.hud',x.el).forEach(l=>l.classList.toggle('go',tt>=.05));$$('.sub',x.el).forEach(s=>s.classList.toggle('on',RM||tt>=+s.dataset.at));
}
const bg=bgEls[x.b.bg],p=clamp(tt/x.dur,0,1);
bg.style.transform='scale('+(1.04+.1*p)+') translate3d('+(pointer[0]*-10)+'px,'+(pointer[1]*-8)+'px,0)';
let acc=0;for(let k=0;k<cur;k++)acc+=beats[k].dur;
const pp=(acc+Math.min(tt,x.dur))/total;
progBar.style.setProperty('--pp',pp.toFixed(4));
prog.setAttribute('aria-valuenow',Math.round(pp*100));
}
let prev=performance.now();
function tick(now){
const dt=Math.min(.1,(now-prev)/1000);prev=now;
if(!RM&&beats.length){
t=Math.min(t+dt,beats[cur].dur);
render(t);
const end=t>=beats[cur].dur,more=cur<beats.length-1;
if(end&&more&&!manual)show(cur+1);
cue.classList.toggle('on',manual&&end&&more);
}
requestAnimationFrame(tick);
}
function step(d){
const n=performance.now();
if(n-lastStep<260)return;
lastStep=n;manual=true;
if(d>0&&cur<beats.length-1)show(cur+1);
else if(d<0&&cur>0)show(cur-1);
}
addEventListener('wheel',e=>{
const a=Math.abs(e.deltaY),n=performance.now();
if(a<4)return;
clearTimeout(wTimer);wTimer=setTimeout(()=>{wLock=false},160);
if(wLock&&!(a>wLast*1.6&&a>30&&n-wAt>350)){wLast=a;return}
wLock=true;wAt=n;wLast=a;
step(e.deltaY>0?1:-1);
},{passive:true});
addEventListener('keydown',e=>{
if(['ArrowDown','ArrowRight','PageDown',' '].includes(e.key)&&!['BUTTON','A'].includes(document.activeElement.tagName)){step(1);e.preventDefault()}
else if(['ArrowUp','ArrowLeft','PageUp'].includes(e.key)){step(-1);e.preventDefault()}
});
let ty=null;
addEventListener('touchstart',e=>{ty=e.touches[0].clientY},{passive:true});
addEventListener('touchend',e=>{if(ty===null)return;const d=ty-e.changedTouches[0].clientY;ty=null;if(Math.abs(d)>40)step(d>0?1:-1)},{passive:true});
addEventListener('pointermove',e=>{pointer=[e.clientX/innerWidth-.5,e.clientY/innerHeight-.5];stage.style.setProperty('--px',pointer[0].toFixed(3));stage.style.setProperty('--py',pointer[1].toFixed(3))});
skip.addEventListener('click',()=>{if(cur===beats.length-1){manual=false;show(0)}else{manual=true;show(beats.length-1)}});
prog.addEventListener('click',e=>{
const r=prog.getBoundingClientRect(),f=clamp((e.clientX-r.left)/r.width,0,.999)*total;
let acc=0;for(let k=0;k<beats.length;k++){if(f<acc+beats[k].dur){manual=true;show(k);return}acc+=beats[k].dur}
});
addEventListener('resize',fit);
if(document.fonts)document.fonts.ready.then(fit);
build();
requestAnimationFrame(tick);
