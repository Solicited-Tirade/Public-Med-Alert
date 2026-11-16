(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const ease=t=>1-Math.pow(1-clamp(t,0,1),3);
const TAU=Math.PI*2;
const root=getComputedStyle(document.documentElement);
const tokc=n=>root.getPropertyValue('--c-'+n).trim();
const fnt=n=>root.getPropertyValue('--font-'+n).trim();
const FIXP=new URLSearchParams(location.search).get('p');
const tpl=$('#copy-t');
$$('.copy').forEach(c=>c.appendChild(tpl.content.cloneNode(true)));

const shows=$$('.show');
let cur=shows[0];
const cache=new Map();
shows.forEach(sec=>cache.set(sec,{beats:$$('.beat',sec),dots:$$('.dots li',sec)}));
const E=[.3,.66,1],SMAX=1;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const skipBtn=$('.skipbtn'),progEl=$('.prog');
let stage=0,s=0,tw=null,wheelAt=0,lastStep=0,holdUntil=0;
const cum=v=>50*Math.min(v,.5)+17.6*Math.max(0,v-.5),inv=c=>c<=25?c/50:.5+(c-25)/17.6;
const inOut=t=>.6*t+.4*(.5-.5*Math.cos(Math.PI*t));
function go(n,o={}){
n=clamp(n,0,2);
const to=E[n];
if(RM){s=to;tw=null;stage=n;holdUntil=0;skipBtn.textContent=n===2?'↺ Replay':'Skip to end →';return}
if(to<s-.0001){s=n===0?0:E[n-1];if(n===0)o={...o,slow:true}}
const c0=cum(s),c1=cum(to),dur=o.fast?3.5:o.slow?6:Math.max(2.4,Math.abs(c1-c0));
tw={from:s,to,c0,c1,t0:performance.now(),dur:dur*1000};
stage=n;
skipBtn.textContent=n===2?'↺ Replay':'Skip to end →';
}
function step(d){
const now=performance.now();
if(now-lastStep<450)return;
lastStep=now;
go(stage+d);
}
function pick(id){
cur=shows.find(x=>x.dataset.kind===id)||shows[0];
shows.forEach(x=>x.classList.toggle('on',x===cur));
s=0;stage=0;tw=null;cur.dataset.beat='';
if(FIXP===null)go(0,{slow:true});
try{history.replaceState(null,'','#'+cur.dataset.kind)}catch(e){}
}
shows.forEach(sec=>cache.get(sec).dots.forEach((d,i)=>d.addEventListener('click',()=>go(i))));
progEl.addEventListener('click',e=>{const r0=progEl.getBoundingClientRect(),f=clamp((e.clientX-r0.left)/r0.width,0,.999)*SMAX;s=f;tw=null;holdUntil=0;go(f<E[0]?0:f<E[1]?1:2)});
skipBtn.addEventListener('click',()=>{if(stage===2)go(0,{slow:true});else go(2,{fast:true})});
addEventListener('wheel',e=>{
const now=performance.now(),fresh=now-wheelAt>180;
wheelAt=now;
if(fresh&&Math.abs(e.deltaY)>2)step(e.deltaY>0?1:-1);
},{passive:true});
let ty=null;
addEventListener('touchstart',e=>{ty=e.touches[0].clientY},{passive:true});
addEventListener('touchend',e=>{if(ty===null)return;const dy=ty-e.changedTouches[0].clientY;ty=null;if(Math.abs(dy)>40)step(dy>0?1:-1)});
addEventListener('keydown',e=>{
const k=e.key,body=e.target===document.body;
if(k==='ArrowDown'||k==='PageDown'||(k===' '&&body)){e.preventDefault();step(1)}
else if(k==='ArrowUp'||k==='PageUp'){e.preventDefault();step(-1)}
else if(k==='End'){go(2,{fast:true})}
else if(k==='Home'){go(0,{slow:true})}
});
const h=location.hash.slice(1);
if(h)pick(h);else{s=0;if(FIXP===null)go(0,{slow:true})}
if(FIXP!==null)s=clamp(parseFloat(FIXP),0,SMAX);


const seeded=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const SEED=FIXP!==null?23:(Math.random()*1e9|0),rh=seeded(SEED),RND=seeded(SEED^0x9e3779b9);
const SHIPY=.08+.2*RND(),SHIPS=.08+.14*RND();
let SHK=0,PX=0,PY=0,TX=0,TY=0,DEPTH=.7;
const hexA=(h,a)=>{h=h.trim();return h[0]==='#'&&h.length===7?'rgba('+parseInt(h.slice(1,3),16)+','+parseInt(h.slice(3,5),16)+','+parseInt(h.slice(5,7),16)+','+a+')':h};
const mixC=(a,b,t)=>{const p=h=>[1,3,5].map(i=>parseInt(h.trim().slice(i,i+2),16));if(a.trim()[0]!=='#'||b.trim()[0]!=='#')return a;const A=p(a),B=p(b);return 'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')+')'};
document.body.style.setProperty('--d',DEPTH);
addEventListener('pointermove',e=>{TX=e.clientX/innerWidth-.5;TY=e.clientY/innerHeight-.5});
addEventListener('deviceorientation',e=>{if(e.gamma!=null){TX=clamp(e.gamma/50,-.5,.5);TY=clamp((e.beta-45)/80,-.5,.5)}});
const HFIELD=Array.from({length:10},()=>[.05+rh()*.9,.14+rh()*.76]),HPOL=Array.from({length:40},()=>[rh()*TAU,rh()]),HNEAR=Array.from({length:84},()=>[rh()*TAU,rh()]);
const BEAT=[[0,0],[.16,0],[.21,-.14],[.27,0],[.4,0],[.44,.22],[.49,-1],[.54,.55],[.58,0],[.72,0],[.82,-.22],[.92,0],[1,0]];
const ecg=u=>{for(let i=1;i<BEAT.length;i++){const a=BEAT[i-1],b=BEAT[i];if(u<=b[0]){const k=(u-a[0])/(b[0]-a[0]||1);return a[1]+(b[1]-a[1])*k}}return 0};
const CROSS=new Path2D('M9 2h6v7h7v6h-7v7H9v-7H2V9h7z');

const sig=$('.sig'),sctx=sig.getContext('2d');
let SW=1,SH=1;
function sigSize(){
const dpr=Math.min(2,devicePixelRatio||1),r=sig.getBoundingClientRect();
SW=Math.max(1,r.width);SH=Math.max(1,r.height);
sig.width=Math.round(SW*dpr);sig.height=Math.round(SH*dpr);
sctx.setTransform(dpr,0,0,dpr,0,0);
}
new ResizeObserver(sigSize).observe(sig);

const STARS=Array.from({length:70},()=>[rh(),rh(),.2+.8*rh()]);
const la0=v=>ease((v-.62)/.21);
const LOGO=new Image();LOGO.src='../media/img/logo.webp';
const angLerp=(a,b,k)=>{let d=((b-a+Math.PI)%TAU+TAU)%TAU-Math.PI;return a+d*k};
const TAGS='700 11px ';

function drawSignal(s,t){
const ctx=sctx,W=SW,H=SH,mobile=W<860;
const C={red:tokc('red-500'),pale:tokc('red-300'),amber:tokc('amber-500'),orange:tokc('orange-400'),green:tokc('green-400'),g500:tokc('gray-500'),white:tokc('white'),black:tokc('black')};
const F=fnt('tag');
ctx.clearRect(0,0,W,H);
ctx.save();if(!RM&&SHK>0.02)ctx.translate(Math.sin(t*83)*SHK*1.8,Math.cos(t*71)*SHK*1.8);
const yx=mobile?W*.5:W*.68,yy=mobile?H*.7:H*.52,R=Math.min(W,H)*(mobile?.09:.095),ringR=R*2.1,maxd=Math.hypot(W,H)*.6;
const glow=(x,y,r,col,a=1)=>{ctx.save();ctx.fillStyle=col;ctx.globalAlpha=a*.16;ctx.beginPath();ctx.arc(x,y,r*2.6,0,TAU);ctx.fill();ctx.globalAlpha=a*.3;ctx.beginPath();ctx.arc(x,y,r*1.7,0,TAU);ctx.fill();ctx.restore()};
const text=(str,x,y,col,al=1,sz=13,ls='5px')=>{ctx.save();ctx.globalAlpha=al;ctx.fillStyle=col;ctx.font='700 '+sz+'px '+F;ctx.textAlign='center';ctx.textBaseline='middle';if('letterSpacing' in ctx)ctx.letterSpacing=ls;ctx.fillText(str,x,y);ctx.restore()};

ctx.save();ctx.fillStyle=C.white;
STARS.forEach(([sx,sy,dp],i)=>{const x=(((sx*W-t*7*dp+PX*dp*46)%W)+W)%W;ctx.globalAlpha=(.07+.2*dp)*(.65+.35*Math.sin(t*dp*2+i));ctx.fillRect(x,sy*H+PY*dp*28,dp>.6?2:1,dp>.6?2:1)});
ctx.restore();
const ap2=(t%8)/8;ctx.save();ctx.strokeStyle=C.g500;ctx.globalAlpha=.1*(1-ap2)*(1-la0(s));ctx.lineWidth=1;ctx.beginPath();ctx.arc(yx,yy,R*1.5+maxd*.7*ap2,0,TAU);ctx.stroke();ctx.restore();
ctx.save();ctx.strokeStyle=C.g500;ctx.lineWidth=1;
for(let i=1;i<=4;i++){ctx.globalAlpha=.14;ctx.beginPath();ctx.arc(yx,yy,R*i*1.5,0,TAU);ctx.stroke()}
ctx.restore();
const wr=ease((s-.1)/.3);
if(s>.1&&s<.42){ctx.save();ctx.globalAlpha=.3*(1-wr);ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.beginPath();ctx.arc(yx,yy,maxd*wr,0,TAU);ctx.stroke();ctx.restore()}

const shipAt=u=>[W*(-.08+1.16*u),H*(SHIPY+SHIPS*u)];
const dsu=clamp(((yx-ringR*2.2)/W+.08)/1.16,.25,.75),sd=.3+.12*dsu,su=clamp((s-.3)/.12,0,1);
const shipP=shipAt(su),shipA=Math.atan2(H*SHIPS,W*1.16);
const NOP=6,RHO=R*.32,LS=R*6.2,LA=LS*.235;
const rr=[0,1,2,3,4,5].map(i=>{
const g=-Math.PI/2+i*TAU/6,tg=[yx+Math.cos(g)*ringR,yy+Math.sin(g)*ringR];
const sdi=sd,slot=[(i-2.5)*9,11];
const sp=shipAt(clamp((sdi-.3)/.12,0,1)),st=[sp[0],sp[1]];
const mx=(st[0]+tg[0])/2,my=(st[1]+tg[1])/2,cx=mx,cy=my+H*.06*(i%2?1:-1);
const at=u=>{const a=1-u;return[a*a*st[0]+2*a*u*cx+u*u*tg[0],a*a*st[1]+2*a*u*cy+u*u*tg[1]]};
return{at,g,tg,sdi,slot,q:ease((s-sdi-.03)/.2)};
});
const sw=ease((s-.48)/.1),la=ease((s-.62)/.21);
const lp=rr.map((o,i)=>{
let x,y;if(s>=o.sdi)[x,y]=o.at(o.q);else{const k=clamp((sd-s)/.03,0,1);x=shipP[0]+o.slot[0]*k;y=shipP[1]+o.slot[1]*k}
if(sw>0){const ix=yx+Math.cos(o.g)*RHO,iy=yy+Math.sin(o.g)*RHO;x+=(ix-x)*sw;y+=(iy-y)*sw}
return[x,y];
});

const raw=[
...rr.slice(0,mobile?3:6).map((r,i)=>{const g=r.g+(i%2?.55:-.55);return{g,d0:ringR*3.4}}),
...HFIELD.slice(0,mobile?0:10).map(([nx,ny])=>{const dx=nx*W-yx,dy=ny*H-yy;return{g:Math.atan2(dy,dx),d0:Math.max(ringR*2.8,Math.hypot(dx,dy))}}),
...HPOL.map(([g,u])=>({g,d0:ringR*(2.8+u*1.8)})),
...HNEAR.map(([a,u],m)=>({near:[a,R*(mobile?1.5+u*1.5:1.8+u*1.1)],m}))
].map((h,i)=>{const k=.78+.22*((i*7)%10)/9;if(h.near){const li=h.m%6,kb=Math.floor(h.m/6)%4,tbk=sd+.034+.042*(kb-.06*kb*(kb-1)),L=rr[li].at(ease((tbk-sd-.03)/.2)),oa=kb===0?h.near[0]:Math.atan2(L[1]-yy,L[0]-yx)+(h.near[0]/TAU-.5)*2.2,px=L[0]+Math.cos(oa)*h.near[1],py=L[1]+Math.sin(oa)*h.near[1],ap=clamp(tbk/.5,0,1),e=ap*ap*(3-2*ap),dx=px-yx,dy=py-yy;return{g:Math.atan2(dy,dx),d0:Math.max(ringR*1.4,Math.hypot(dx,dy))/(1-.62*e*k),i,k,m:h.m}}return{...h,i,k}});
const hostPos=(h,sv)=>{const ap=clamp(sv/.5,0,1),e=ap*ap*(3-2*ap),d=Math.max(ringR*1.3,h.d0*(1-.62*e*h.k));return[yx+Math.cos(h.g)*d,yy+Math.sin(h.g)*d]};
const lightPos=(i,sv)=>rr[i].at(ease((sv-sd-.03)/.2));
const GUN=R*(mobile?4.4:4.6),CL=R*(mobile?1.25:1.6),AIM=.034,HOLD=.006,T0=sd,TEND=.62;
const okH=h=>{if(h.dead>TEND)return false;for(const tv of [h.dead-AIM,h.dead-AIM*.5,h.dead]){const lpp=lightPos(h.l,tv),hp=hostPos(h,tv),d=Math.hypot(hp[0]-lpp[0],hp[1]-lpp[1]);if(d<CL)return false}const lpp=lightPos(h.l,h.dead),hp=hostPos(h,h.dead);return Math.hypot(hp[0]-lpp[0],hp[1]-lpp[1])<=GUN*.92};
let live=raw;
let T=rr.map(()=>[]);
for(let pass=0;pass<6;pass++){
T=rr.map(()=>[]);
const drop=rr[0].at(0);
const ord=live.slice().sort((x,y)=>{const px=hostPos(x,sd),py=hostPos(y,sd);return Math.hypot(px[0]-drop[0],px[1]-drop[1])-Math.hypot(py[0]-drop[0],py[1]-drop[1])});
const GAP=AIM+HOLD+.002;
const jit=(a,b)=>((a*131+b*71+17)%97)/97;
for(let b0=0;b0<ord.length;b0+=NOP){
const bi0=b0/NOP,tb=sd+AIM+GAP*(bi0-.12*bi0*(bi0-1)/2),used=new Set();
ord.slice(b0,b0+NOP).forEach(h=>{
const hp=hostPos(h,tb);let bi=-1,bd=1e9;
rr.forEach((r,i)=>{if(used.has(i))return;const L=lightPos(i,tb),d=Math.hypot(hp[0]-L[0],hp[1]-L[1])*(1+.8*jit(h.i,i));if(d<bd){bd=d;bi=i}});
used.add(bi);h.l=bi;h.dead=tb+bi*.003;T[bi].push(h);
});
}
const keep=live.filter(okH);
if(keep.length===live.length)break;
live=keep;
}
if(live.length>15){live=live.slice().sort((a,b)=>a.dead-b.dead).slice(0,15);T=T.map(l=>l.filter(h=>live.includes(h)))}
if(live.length<10){const tbS=k=>sd+AIM+(AIM+HOLD+.002)*(k-.06*k*(k-1));
for(let k=0;k<3&&live.length<10;k++)for(let li=0;li<NOP&&live.length<10;li++){const dd=tbS(k)+li*.003;if(T[li].some(x=>Math.abs(x.dead-dd)<.012))continue;
const c=raw.find(h=>h.m!==undefined&&h.m%6===li&&Math.floor(h.m/6)%4===k&&!live.includes(h)&&(h.l=li,h.dead=dd,okH(h)));if(c){live.push(c);T[li].push(c);T[li].sort((a,b)=>a.dead-b.dead)}}}

const hs=live.map(h=>{const p=hostPos(h,s),wob=(1-clamp(s/.5,0,1))*6;return{...h,x:p[0]+Math.sin(t*.7+h.i*1.9)*wob,y:p[1]+Math.cos(t*.6+h.i*2.3)*wob,app:ease((s+.1-.012*(h.i%6))/.06)}});
const angTo=(i,h,sv)=>{const L=lightPos(i,sv),p=hostPos(h,sv);return Math.atan2(p[1]-L[1],p[0]-L[0])};
const wrapA=d=>((d+Math.PI)%TAU+TAU)%TAU-Math.PI;
const baseOf=(i,sv)=>{
const q=ease((sv-sd-.03)/.2),o=rr[i];
const a0=o.at(Math.max(0,q-.02)),a1=o.at(Math.min(1,q+.01));
return angLerp(Math.atan2(a1[1]-a0[1],a1[0]-a0[0]),o.g,ease(clamp((q-.85)/.15,0,1)));
};
const headOf=(i,sv)=>{
let hd=baseOf(i,sv);
const lst=T[i];
lst.forEach((h,j)=>{
const ref=h.dead-AIM,pa=j>0?angTo(i,lst[j-1],ref):baseOf(i,ref);
const sl=clamp(Math.abs(wrapA(angTo(i,h,ref)-pa))*.02,.014,AIM);
const w=.5-.5*Math.cos(Math.PI*clamp((sv-(h.dead-sl-.004))/sl,0,1));
if(w>0)hd=angLerp(hd,angTo(i,h,Math.min(sv,h.dead+HOLD)),w);
});
return hd;
};

{
ctx.save();ctx.lineWidth=2;ctx.setLineDash([7,7]);ctx.strokeStyle=C.red;
rr.forEach(o=>{if(o.q<=0)return;const q=o.q;ctx.globalAlpha=.4*(1-ease((s-.62)/.1));ctx.beginPath();for(let u=0;u<=q;u+=.02){const[x,y]=o.at(u);u===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke()});
ctx.restore();
}

let alive=0,md=1e9,shk=0;
hs.forEach(h=>{
if(h.app<=0)return;
const u=(s-h.dead)/.045;
ctx.save();
const lk=clamp((s-(h.dead-AIM*.7))/(AIM*.7),0,1);
if(s>h.dead-.012&&s<h.dead+.004){
const L=lp[h.l];
ctx.globalAlpha=.9;ctx.strokeStyle=C.white;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(L[0],L[1]);ctx.lineTo(h.x,h.y);ctx.stroke();
ctx.globalAlpha=.35;ctx.strokeStyle=C.pale;ctx.lineWidth=5;ctx.stroke();
}
if(u<0){
alive++;
const dd=Math.hypot(h.x-yx,h.y-yy);md=Math.min(md,dd);
const cl=clamp(1-(dd-ringR*1.3)/(ringR*2.2),0,1),ba=Math.atan2(h.y-yy,h.x-yx);
ctx.save();ctx.globalAlpha=h.app*(.1+.65*cl);ctx.strokeStyle=C.orange;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(yx+Math.cos(ba)*R*1.0,yy+Math.sin(ba)*R*1.0);ctx.lineTo(yx+Math.cos(ba)*(R*1.14+R*.14*cl),yy+Math.sin(ba)*(R*1.14+R*.14*cl));ctx.stroke();ctx.restore();
const fl=.78+.22*Math.sin(t*7+h.i*2),r=9;
ctx.globalAlpha=h.app*fl;ctx.strokeStyle=C.orange;ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(h.x,h.y-r);ctx.lineTo(h.x+r,h.y);ctx.lineTo(h.x,h.y+r);ctx.lineTo(h.x-r,h.y);ctx.closePath();ctx.stroke();
if(DEPTH){ctx.save();ctx.globalAlpha=h.app*fl*.32*DEPTH;ctx.fillStyle=C.orange;ctx.fill();ctx.restore()}
ctx.beginPath();ctx.moveTo(h.x-r-6,h.y);ctx.lineTo(h.x-r-2,h.y);ctx.moveTo(h.x+r+2,h.y);ctx.lineTo(h.x+r+6,h.y);ctx.stroke();
ctx.fillStyle=C.orange;ctx.beginPath();ctx.arc(h.x,h.y,2,0,TAU);ctx.fill();
if(lk>0){ctx.globalAlpha=.85*ease(lk);ctx.strokeStyle=C.pale;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(h.x,h.y,28-19*ease(lk),0,TAU);ctx.stroke()}
}else if(u<1){
const e=ease(u),r=9*(1+.5*e);
if(u<.5)shk=Math.max(shk,1-u*2);
if(u<.22){ctx.globalAlpha=(1-u/.22)*.85;ctx.fillStyle=C.white;ctx.beginPath();ctx.arc(h.x,h.y,16-6*u/.22,0,TAU);ctx.fill()}
ctx.globalAlpha=Math.pow(1-u,2);ctx.strokeStyle=C.orange;ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(h.x,h.y-r);ctx.lineTo(h.x+r,h.y);ctx.lineTo(h.x,h.y+r);ctx.lineTo(h.x-r,h.y);ctx.closePath();ctx.stroke();
ctx.globalAlpha=(1-u)*.7;ctx.strokeStyle=C.pale;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(h.x,h.y,9+30*e,0,TAU);ctx.stroke();
const xr=8+6*e;ctx.globalAlpha=(1-e)*.9;ctx.strokeStyle=C.white;ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(h.x-xr,h.y-xr);ctx.lineTo(h.x+xr,h.y+xr);ctx.moveTo(h.x+xr,h.y-xr);ctx.lineTo(h.x-xr,h.y+xr);ctx.stroke();
}
ctx.restore();
});

const ringP=ease((s-.48)/.1);
if(ringP>0){ctx.save();ctx.strokeStyle=C.red;ctx.globalAlpha=.25;ctx.lineWidth=9;ctx.beginPath();ctx.arc(yx,yy,ringR,-Math.PI/2,-Math.PI/2+TAU*ringP);ctx.stroke();ctx.globalAlpha=1;ctx.lineWidth=3;ctx.stroke();ctx.restore()}

if(su>0&&su<1){
const sa=Math.min(1,su*8)*Math.min(1,(1-su)*8);
glow(shipP[0],shipP[1],9,C.pale,sa*.7);
if(DEPTH){ctx.save();ctx.globalAlpha=sa*.4*DEPTH;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(shipP[0]+10,shipP[1]+28,24,6,shipA,0,TAU);ctx.fill();ctx.restore()}
ctx.save();ctx.translate(shipP[0],shipP[1]);ctx.rotate(shipA);ctx.globalAlpha=sa;ctx.fillStyle=C.g500;ctx.strokeStyle=C.pale;ctx.lineWidth=1.5;
ctx.beginPath();ctx.moveTo(24,0);ctx.lineTo(8,-5);ctx.lineTo(-5,-17);ctx.lineTo(-10,-15);ctx.lineTo(-6,-4);ctx.lineTo(-14,-4);ctx.lineTo(-14,4);ctx.lineTo(-6,4);ctx.lineTo(-10,15);ctx.lineTo(-5,17);ctx.lineTo(8,5);ctx.closePath();ctx.fill();ctx.stroke();
ctx.fillStyle=C.red;ctx.beginPath();ctx.arc(-16,-2.5,2.2,0,TAU);ctx.arc(-16,2.5,2.2,0,TAU);ctx.fill();
ctx.restore();
}
rr.forEach((o,i)=>{
const q=o.q;
const[x,y]=lp[i];
const head=angLerp(headOf(i,s),o.g,sw);
const kca=s>=o.sdi?.17*clamp(1-(s-.48)/.1,0,1)*clamp((s-o.sdi)*25,0,1):0;
const ca=Math.max(kca,.32*sw)*(1-la);
if(ca>0){
const L=GUN+((LA-RHO)-GUN)*sw,HA=.3-.225*sw;
ctx.save();ctx.globalAlpha=ca;ctx.fillStyle=C.red;if(DEPTH){const g=ctx.createRadialGradient(x,y,0,x,y,L);g.addColorStop(0,hexA(C.red,1));g.addColorStop(1,hexA(C.red,1-DEPTH));ctx.fillStyle=g;ctx.globalAlpha=Math.min(1,ca*(1+.7*DEPTH))}ctx.beginPath();ctx.moveTo(x,y);ctx.arc(x,y,L,head-HA,head+HA);ctx.closePath();ctx.fill();
ctx.globalAlpha=Math.min(1,ca*2.6);ctx.strokeStyle=C.pale;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x+Math.cos(head-HA)*L,y+Math.sin(head-HA)*L);ctx.lineTo(x,y);ctx.lineTo(x+Math.cos(head+HA)*L,y+Math.sin(head+HA)*L);ctx.stroke();
ctx.restore();
}
ctx.save();ctx.globalAlpha=1-la;glow(x,y,7,C.red,1-la);ctx.fillStyle=C.red;if(DEPTH){ctx.save();ctx.globalAlpha=.45*DEPTH*(1-la);ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(x+3,y+10,8,3,0,0,TAU);ctx.fill();ctx.restore();const g=ctx.createRadialGradient(x-2.5,y-2.5,1,x,y,8);g.addColorStop(0,mixC(C.red,C.white,.9*DEPTH));g.addColorStop(.35,mixC(C.red,C.pale,DEPTH));g.addColorStop(1,C.red);ctx.fillStyle=g}ctx.beginPath();ctx.arc(x,y,7,0,TAU);ctx.fill();ctx.restore();
});

const rev=ease((s-.58)/.12);
const downed=1-rev;
const pr=(t%2.6)/2.6;
ctx.save();ctx.globalAlpha=(1-pr)*(1-rev*.8);ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.beginPath();ctx.arc(yx,yy,R*.3+R*1.6*pr,0,TAU);ctx.stroke();ctx.restore();
if(s>.6&&s<.9){
const gp=(t%1.4)/1.4;
ctx.save();ctx.globalAlpha=(1-gp)*.7*ease((s-.6)/.04);ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();ctx.arc(yx,yy,R*.4+R*1.5*gp,0,TAU);ctx.stroke();ctx.restore();
}
const hph=((.8-.8*t)%1+1)%1,hb=RM?0:Math.exp(-Math.pow((hph-.49)/.05,2))*rev*(1-la);
const dr=R*(.26+.1*rev)*(1+.35*hb);
glow(yx,yy,dr,C.amber,downed*.9);ctx.save();ctx.globalAlpha=downed*(.55+.35*Math.sin(t*5));ctx.fillStyle=C.amber;if(DEPTH){const g=ctx.createRadialGradient(yx-dr*.35,yy-dr*.35,dr*.1,yx,yy,dr);g.addColorStop(0,mixC(C.amber,C.white,.75*DEPTH));g.addColorStop(1,C.amber);ctx.fillStyle=g}ctx.beginPath();ctx.arc(yx,yy,dr,0,TAU);ctx.fill();ctx.restore();
glow(yx,yy,dr,C.green,rev*(1-la));ctx.save();ctx.globalAlpha=rev*(1-la);ctx.fillStyle=C.green;if(DEPTH){const g=ctx.createRadialGradient(yx-dr*.35,yy-dr*.35,dr*.1,yx,yy,dr);g.addColorStop(0,mixC(C.green,C.white,.75*DEPTH));g.addColorStop(1,C.green);ctx.fillStyle=g}ctx.beginPath();ctx.arc(yx,yy,dr,0,TAU);ctx.fill();ctx.restore();

const ca2=ease((s-.6)/.06);
if(ca2>0){
const sz=R*.7,cy=yy-R*1.25-ca2*R*.5;
ctx.save();ctx.globalAlpha=ca2*(1-ease((s-.78)/.08)*.4)*(1-la);ctx.translate(yx-sz/2,cy-sz/2);ctx.scale(sz/24,sz/24);ctx.fillStyle=C.green;ctx.fill(CROSS);ctx.restore();
}

const ex=yx-R*1.3,ew=R*2.6,ey=yy+R*1.45,amp=R*.55*ease((s-.58)/.1);
ctx.save();ctx.lineWidth=2;ctx.lineJoin='round';ctx.strokeStyle=rev>.3?C.green:C.red;ctx.globalAlpha=.9*(1-la);ctx.beginPath();
for(let x=0;x<=ew;x+=2){const u=((((x/ew)*1.6)-t*.8)%1+1)%1;const yv=ey+ecg(u)*amp;x===0?ctx.moveTo(ex+x,yv):ctx.lineTo(ex+x,yv)}
ctx.stroke();ctx.restore();

text('YOU',yx,yy-R*.26-(ca2>0?0:18),C.white,ca2>0?0:1);
const stat=s<.3?'ALERT SENT':s<.4?'HELP IS COMING':s<.5?'CLEARING THE AREA':s<.58?'PULSE DETECTED':s<.76?'REVIVING':'BACK UP';
const sc=s<.3?C.amber:s<.5?C.pale:C.green;
const sy=H-Math.max(44,H*.09);
const fo=ease((s-.66)/.12),em=ease((s-.78)/.13);
const Le=mobile?Math.min(H*.3,W*.62):Math.min(H*.46,W*.4,560),GPAD=28,BH=mobile?215:170;
const topL=Math.max(64+58,(H-(Le+GPAD+BH))/2+24);
if(s>.5)cur.style.setProperty('--glowy',(topL+.4*Le).toFixed(0)+'px');
if(s>.5)cur.style.setProperty('--endy',((mobile?topL+Le+GPAD:topL+Le+GPAD+BH/2)).toFixed(0)+'px');
if(fo>0){ctx.save();ctx.globalCompositeOperation='destination-out';ctx.globalAlpha=fo;ctx.fillStyle='#000';ctx.fillRect(-12,-12,W+24,H+24);ctx.restore()}
if(la>0&&LOGO.complete&&LOGO.naturalWidth){
const Ls=LS+(Le-LS)*em;
const lx=(yx-.5*LS)+((W/2-.5*Le)-(yx-.5*LS))*em,ly=(yy-.343*LS)+(topL-(yy-.343*LS))*em;
const pop=1+.05*Math.sin(Math.PI*clamp((s-.93)/.07,0,1)),sp=ease((s-.93)/.07);
if(sp>0&&sp<1&&!RM&&fo<.5){ctx.save();ctx.globalAlpha=(1-sp)*.5;ctx.strokeStyle=C.red;ctx.lineWidth=3;ctx.beginPath();ctx.arc(lx+.5*Ls,ly+.343*Ls,Ls*(.3+.55*sp),0,TAU);ctx.stroke();ctx.restore()}
if(DEPTH){ctx.save();ctx.globalAlpha=la*.6*DEPTH;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(lx+.5*Ls,ly+.97*Ls,Ls*.3,Ls*.05,0,0,TAU);ctx.fill();ctx.restore()}
ctx.save();ctx.globalAlpha=la;ctx.translate(lx+.5*Ls,ly+.343*Ls);ctx.scale(pop,pop);if(DEPTH){ctx.shadowColor='rgba(0,0,0,'+(.7*DEPTH).toFixed(2)+')';ctx.shadowBlur=Ls*.1*DEPTH;ctx.shadowOffsetY=Ls*.04*DEPTH}ctx.drawImage(LOGO,-.5*Ls,-.343*Ls,Ls,Ls);ctx.restore();
}
const ha=ease((ringR*3.4-md)/(ringR*.9));
const lastDead=live.reduce((m,h)=>Math.max(m,h.dead),0);
const hca=(alive>0?1:1-ease((s-lastDead)/.05))*(1-la)*ease((s+.05)/.05);
if(hca>.01)text('HOSTILES '+alive,yx,sy,C.orange,hca,13,'5px');
SHK=shk;
ctx.restore();
}

function tick(now){
const kind=cur.dataset.kind;
if(tw){const u=clamp((now-tw.t0)/tw.dur,0,1);s=inv(tw.c0+(tw.c1-tw.c0)*inOut(u));if(u>=1){tw=null;holdUntil=now+(stage===0?900:700)}}
if(!tw&&holdUntil&&FIXP===null&&stage<2&&now>holdUntil){holdUntil=0;go(stage+1)}
const p=s,b=FIXP!==null?(p<.34?0:p<.67?1:2):stage,c=cache.get(cur);
if(cur.dataset.beat!==String(b)){
cur.dataset.beat=b;
c.beats.forEach(e=>e.classList.toggle('on',+e.dataset.b===b));
c.dots.forEach((e,i)=>e.classList.toggle('on',i===b));
}
cur.style.setProperty('--p',p.toFixed(3));
progEl.style.setProperty('--pp',(p/SMAX).toFixed(4));
cur.classList.toggle('done',p>.95);
cur.classList.toggle('end',b===2&&p>.72);cur.style.setProperty('--co',b===2?ease((p-.81)/.07).toFixed(3):'0');document.body.classList.toggle('end',p>.9);
PX+=(TX-PX)*.05;PY+=(TY-PY)*.05;
if(kind==='signal')drawSignal(p,RM?0:now/1000);
requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
})();
