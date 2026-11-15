/* Shared welcome + spotlight tour. Each page calls MRGuide({...}) with its own copy and targets. */
(()=>{
const NOTE='<b>Internal feedback only.</b> This welcome and tour are here for now. They will not appear if/when the site goes live.';
const ICON={ok:'<path d="M20 6 9 17l-5-5"/>',doc:'<path d="M5 4h14v16H5z"/><path d="M9 9h6M9 13h6"/>',pen:'<path d="M12 20h9"/><path d="M16.5 3.5l4 4L8 20l-5 1 1-5z"/>',map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',users:'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.5 3-6 6-6s6 2.5 6 6"/><path d="M17 11a3 3 0 1 0 0-6M21 20c0-2.5-1.5-4.5-4-5.3"/>',spark:'<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/>'};
const ARW='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const COMPASS='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

window.MRGuide=function(cfg){
 const KEY='mr-guide-'+cfg.key;
 const getS=()=>{try{return sessionStorage.getItem(KEY)||''}catch(_){return ''}};
 const setS=v=>{try{sessionStorage.setItem(KEY,v)}catch(_){}};
 const steps=cfg.steps.concat([{h:'Your pick helps us decide',p:cfg.fb,last:true}]);
 const N=steps.length,reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const pts=cfg.points.map(p=>`<li><i><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[p[0]]}</svg></i><div><b>${esc(p[1])}</b><span>${esc(p[2])}</span></div></li>`).join('');
 const root=document.createElement('div');root.className='t-root';root.id='g-root';
 root.innerHTML=`<div class="t-wrap" id="g-wel" role="dialog" aria-modal="true" aria-labelledby="g-wel-h" hidden><div class="t-w">
<p class="t-k"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>Welcome</p>
<p class="t-nt">${NOTE}</p><h2 id="g-wel-h">${cfg.headline}</h2><p>${cfg.pitch}</p><ul class="t-ul">${pts}</ul>
<div class="t-row"><button class="t-b g" type="button" id="g-skip">Skip</button><button class="t-b p" type="button" id="g-go">${esc(cfg.go||'Show me how')}${ARW}</button></div></div></div>
<div id="g-spot" hidden><div class="g-dim" id="g-dim"></div><div id="g-rings"></div><div class="t-blk" id="g-blk"></div>
<div class="t-card" id="g-card" role="status" aria-live="polite"><p class="t-k" id="g-k"></p><h3 id="g-h"></h3><p id="g-p"></p><p class="g-tip" id="g-tip">Tip: &larr; &rarr; to move, Esc to leave</p>
<div class="t-row"><div class="t-dots" id="g-dots"></div><button class="t-b g" type="button" id="g-exit">Explore on my own</button><button class="t-b g" type="button" id="g-back">Back</button><button class="t-b p" type="button" id="g-next">Next</button><button class="t-b p" type="button" id="g-done" hidden>Done</button></div></div></div>
<button class="t-pill" type="button" id="g-pill" hidden></button>`;
 document.body.appendChild(root);
 const wel=$('#g-wel'),spot=$('#g-spot'),dim=$('#g-dim'),rings=$('#g-rings'),card=$('#g-card'),pill=$('#g-pill'),blk=$('#g-blk');
 let on=false,i=0,raf=0,cur=[],lastFocus=null;
 const mobile=()=>innerWidth<=640;
 const rootEls=()=>root;
 function setPill(){const done=getS()==='done';pill.innerHTML=COMPASS+(done?'Guided tour':'Take the tour');pill.classList.toggle('inv',!done)}
 function showPill(){setPill();pill.hidden=false}
 function targets(s){if(!s.t)return[];const v=typeof s.t==='function'?s.t():s.t;return[].concat(v).map(x=>typeof x==='string'?$(x):x).filter(Boolean)}
 function rectOf(e){const r=e.getBoundingClientRect();return{l:r.left,t:r.top,w:r.width,h:r.height}}
 function union(rs){const l=Math.min(...rs.map(r=>r.l)),t=Math.min(...rs.map(r=>r.t)),r=Math.max(...rs.map(r=>r.l+r.w)),b=Math.max(...rs.map(r=>r.t+r.h));return{l,t,r,b}}
 const rr=(x,y,w,h,r)=>`M${x+r} ${y}H${x+w-r}A${r} ${r} 0 0 1 ${x+w} ${y+r}V${y+h-r}A${r} ${r} 0 0 1 ${x+w-r} ${y+h}H${x+r}A${r} ${r} 0 0 1 ${x} ${y+h-r}V${y+r}A${r} ${r} 0 0 1 ${x+r} ${y}Z`;
 function draw(rs){const W=innerWidth,H=innerHeight,P=6;let d=`M0 0H${W}V${H}H0Z`;
  while(rings.children.length>rs.length)rings.lastChild.remove();while(rings.children.length<rs.length){const g=document.createElement('div');g.className='g-ring';rings.appendChild(g)}
  rs.forEach((r,k)=>{const l=Math.max(0,r.l-P),t=Math.max(0,r.t-P),w=Math.min(W,r.l+r.w+P)-l,h=Math.min(H,r.t+r.h+P)-t;if(w<=0||h<=0)return;d+=rr(l,t,w,h,12);const g=rings.children[k];g.style.cssText=`left:${l}px;top:${t}px;width:${w}px;height:${h}px`});
  dim.style.clipPath=`path(evenodd,"${d}")`}
 function place(rs){const vw=innerWidth,vh=innerHeight,cw=card.offsetWidth,ch=card.offsetHeight,g=16;let x,y;
  if(mobile()){x=(vw-cw)/2;y=vh-ch-12}
  else if(!rs.length){x=(vw-cw)/2;y=(vh-ch)/2}
  else{const u=union(rs),P=6,l=Math.max(0,u.l-P),t=Math.max(0,u.t-P),r=Math.min(vw,u.r+P),b=Math.min(vh,u.b+P);
   if(l-cw-g>=12){x=l-cw-g;y=Math.min(Math.max(12,t),vh-ch-12)}
   else if(r+cw+g<=vw-12){x=r+g;y=Math.min(Math.max(12,t),vh-ch-12)}
   else{x=Math.min(Math.max(12,(vw-cw)/2),vw-cw-12);y=t>vh/2?Math.max(12,t-ch-g):Math.min(vh-ch-12,b+g);if(y<12)y=12}}
  card.style.left=x+'px';card.style.top=y+'px'}
 function loop(){if(!on)return;const s=steps[i],els=targets(s),tg=els.map(rectOf);
  if(cur.length!==tg.length||reduce)cur=tg.map(r=>({...r}));
  else cur=cur.map((c,k)=>{const t=tg[k],f=.22;return{l:c.l+(t.l-c.l)*f,t:c.t+(t.t-c.t)*f,w:c.w+(t.w-c.w)*f,h:c.h+(t.h-c.h)*f}});
  draw(cur);place(tg);raf=requestAnimationFrame(loop)}
 function scrollTo(s){const els=targets(s);if(!els.length)return;const u=union(els.map(rectOf)),vh=innerHeight,top=84,reserve=mobile()?card.offsetHeight+28:16,areaH=vh-top-reserve,h=u.b-u.t;
  if(u.t>=top-4&&u.b<=vh-reserve)return;
  const y=scrollY+u.t-(h<=areaH?top+(areaH-h)/2:top);scrollTo2(Math.max(0,y))}
 const scrollTo2=y=>window.scrollTo({top:y,behavior:reduce?'auto':'smooth'});
 function show(){const s=steps[i];$('#g-k').textContent='Step '+(i+1)+' of '+N;$('#g-h').textContent=s.h;$('#g-p').innerHTML=s.p;
  $('#g-tip').hidden=i!==0;$('#g-dots').innerHTML=steps.map((_,k)=>'<i class="'+(k<=i?'on':'')+'"></i>').join('');
  $('#g-back').hidden=i===0;$('#g-exit').hidden=!!s.last;$('#g-next').hidden=!!s.last;$('#g-done').hidden=!s.last;
  if(s.last)setS('done');
  scrollTo(s);requestAnimationFrame(()=>{const b=s.last?$('#g-done'):$('#g-next');b&&b.focus({preventScroll:true})})}
 function start(){if(!getS())setS('skip');wel.hidden=true;pill.hidden=true;spot.hidden=false;on=true;i=0;cur=[];document.documentElement.classList.add('g-lock');show();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
 function stop(){on=false;cancelAnimationFrame(raf);document.documentElement.classList.remove('g-lock');spot.hidden=true;wel.hidden=true;showPill();lastFocus&&lastFocus.focus&&lastFocus.focus({preventScroll:true})}
 function skip(){if(!getS())setS('skip');stop()}
 const go=d=>{const n=i+d;if(n<0||n>=N)return;i=n;show()};
 $('#g-go').onclick=start;$('#g-skip').onclick=skip;$('#g-exit').onclick=skip;$('#g-back').onclick=()=>go(-1);$('#g-next').onclick=()=>go(1);$('#g-done').onclick=skip;pill.onclick=()=>{lastFocus=pill;start()};
 blk.addEventListener('pointerdown',()=>{card.classList.remove('shake');void card.offsetWidth;card.classList.add('shake')});
 addEventListener('keydown',e=>{const open=on||!wel.hidden;if(!open)return;
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();skip();return}
  if(on){if(e.key==='ArrowRight'){e.preventDefault();go(1)}else if(e.key==='ArrowLeft'){e.preventDefault();go(-1)}else if([' ','PageUp','PageDown','Home','End','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault()}
  if(e.key!=='Tab')e.stopPropagation()},true);
 addEventListener('wheel',e=>{if(on)e.preventDefault()},{passive:false});
 addEventListener('touchmove',e=>{if(on)e.preventDefault()},{passive:false});
 if(getS())showPill();else{wel.hidden=false;setTimeout(()=>$('#g-go').focus({preventScroll:true}),60)}
};
})();
