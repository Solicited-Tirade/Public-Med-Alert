(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const pz=$('#pz'),pzt=$('#pzt');
if(!pz||!pzt)return;
const KEY='mr-cta-tour',isOpen=()=>pz.classList.contains('open');
const seen=()=>{try{return sessionStorage.getItem(KEY)==='1'}catch(_){return false}};
const mark=()=>{try{sessionStorage.setItem(KEY,'1')}catch(_){}};
const ARW='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const root=document.createElement('div');root.className='tr';root.id='tour-root';root.hidden=true;
root.innerHTML=`<div class="t-wrap" id="tour-tw" role="dialog" aria-modal="true" aria-labelledby="tour-tw-h" hidden><div class="t-w">
<p class="t-k"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>Welcome</p>
<p class="t-nt"><b>Internal feedback only.</b> This builder and tour are here for now. They will not appear if/when the page goes live.</p>
<h2 id="tour-tw-h">Help us drive engagement</h2>
<p>We want more people to leave a testimonial after an alert. The goal is a verifiable, factual account of what happened during that alert, so anyone reading it can trust it. You can help by proposing which parts of this card you think would make someone want to leave one.</p>
<ul class="t-ul">
<li><i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></i><div><b>Verifiable</b><span>Each testimonial links to the real mission record it came from.</span></div></li>
<li><i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5z"/><path d="M9 9h6M9 13h6"/></svg></i><div><b>Factual</b><span>It tells what happened during the alert, not a general opinion.</span></div></li>
<li><i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5l4 4L8 20l-5 1 1-5z"/></svg></i><div><b>Your proposal</b><span>Build-a-potato is for you, the tester, not for clients. Pick the components you think matter most, then copy the link to show us your ideal layout.</span></div></li></ul>
<div class="t-row"><button class="t-b g" type="button" id="tour-tw-skip">Skip</button><button class="t-b p" type="button" id="tour-tw-go">Show me how${ARW}</button></div></div></div>
<div id="tour-tspot" hidden><div class="t-hole" id="tour-th"></div><div class="t-blk" id="tour-tb0"></div><div class="t-blk" id="tour-tb1"></div><div class="t-blk" id="tour-tb2"></div><div class="t-blk" id="tour-tb3"></div><div class="t-blk" id="tour-tb4"></div>
<div class="t-card" id="tour-tc" role="status" aria-live="polite"><p class="t-k" id="tour-tk"></p><h3 id="tour-th3"></h3><p id="tour-tp"></p><p class="t-do" id="tour-td"><i></i><span></span></p><div class="t-row"><div class="t-dots" id="tour-tdots"></div><button class="t-b g" type="button" id="tour-tskip">Explore on my own</button><button class="t-b p" type="button" id="tour-tnext" hidden>Next</button><button class="t-b p" type="button" id="tour-tfin" hidden>Done</button></div></div></div>
<button class="t-pill" type="button" id="tour-tpill" hidden>${'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>'}Guided tour</button>`;
document.body.appendChild(root);
const tw=$('#tour-tw'),spot=$('#tour-tspot'),hole=$('#tour-th'),card=$('#tour-tc'),pill=$('#tour-tpill'),blk=[0,1,2,3,4].map(i=>$('#tour-tb'+i));
const fl={scn:0,next:0,from:'',to:''};
const body=()=>$('.pz-body',pz);
const grp=k=>$('.pz-g[data-g='+k+']',pz);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const cardEl=()=>$('#card'),mEl=()=>$('#m');
const show1=k=>window.mrShowSide?window.mrShowSide(k):Promise.resolve();
async function drive(k){const nx=$('#tour-tnext');nx.disabled=true;try{await show1(k)}finally{if(on)nx.disabled=false}}
const optTxt=()=>{const o=$('#scn');return o&&o.selectedOptions[0]?o.selectedOptions[0].text:''};
const openFirst=()=>{if(!isOpen())pzt.click()};
const toGrp=k=>()=>{openFirst();setTimeout(()=>{const g=grp(k),b=body();if(!g||!b)return;const r=g.getBoundingClientRect(),br=b.getBoundingClientRect();b.scrollTo({top:b.scrollTop+r.top-br.top-8,behavior:'smooth'})},180)};
const G=(k,h,p)=>({h,p,passive:1,live:1,clip:1,t:()=>[grp(k)],color:()=>getComputedStyle(grp(k)).getPropertyValue('--gc').trim(),pre:()=>{toGrp(k)();drive(k)},ok:()=>fl.next});
const STEPS=[
{h:'Open Build-a-potato',p:'This panel is where you propose the components of the card.',d:'Click Build-a-potato to open it.',t:()=>[pzt],pre:()=>{if(isOpen())pzt.click()},ok:()=>isOpen()},
G('front','Front of card','What people see first: the status, heading, rating and the buttons.'),
G('back','Publish side','What they see when deciding to make the rescue public.'),
G('done','After submitting','The thank-you screen once they have sent it.'),
G('add','Add-ons','Extras such as the Discord preview, team thanks and the rescue certificate.'),
{h:'Pick an outcome',p:'See how the card reads for a rescue, a loss and a cancelled mission.',d:'Choose a different outcome.',t:()=>[$('#scn')],live:1,pre:async()=>{openFirst();const o=body();o&&o.scrollTo({top:0,behavior:'smooth'});await show1('front');fl.from=optTxt()},t2:()=>[$('#card')],ok:()=>fl.scn,res:1,hold:4200},
{h:'Close Build-a-potato',p:'Close the panel to see the full card again.',d:'Click Build-a-potato again.',t:()=>[pzt],pre:openFirst,ok:()=>!isOpen()}];
let on=false,i=0,adv=0,raf=0,autoT=0;
function union(els){const rs=els.filter(Boolean).map(e=>e.getBoundingClientRect()).filter(r=>r.width);if(!rs.length)return null;const l=Math.min(...rs.map(r=>r.left)),t=Math.min(...rs.map(r=>r.top)),r=Math.max(...rs.map(r=>r.right)),b=Math.max(...rs.map(r=>r.bottom));return{l,t,r,b}}
function place(u){const P=6,vw=innerWidth,vh=innerHeight;let l=u.l-P,t=u.t-P,r=u.r+P,b=u.b+P;l=Math.max(0,l);t=Math.max(0,t);r=Math.min(vw,r);b=Math.min(vh,b);
 hole.style.cssText=`left:${l}px;top:${t}px;width:${r-l}px;height:${b-t}px`;
 const S=(e,a,c,w,h)=>e.style.cssText=`left:${a}px;top:${c}px;width:${Math.max(0,w)}px;height:${Math.max(0,h)}px`;
 S(blk[0],0,0,vw,t);S(blk[1],0,b,vw,vh-b);S(blk[2],0,t,l,b-t);S(blk[3],r,t,vw-r,b-t);
 if(STEPS[i].passive)S(blk[4],l,t,r-l,b-t);else S(blk[4],0,0,0,0);
 const cw=card.offsetWidth,ch=card.offsetHeight,g=16;let x,y;
 if(l-cw-g>=12){x=l-cw-g;y=Math.min(Math.max(12,t),vh-ch-12)}
 else if(r+cw+g<=vw-12){x=r+g;y=Math.min(Math.max(12,t),vh-ch-12)}
 else{x=Math.min(Math.max(12,(vw-cw)/2),vw-cw-12);y=t>vh/2?Math.max(12,t-ch-g):Math.min(vh-ch-12,b+g);if(y<12)y=12}
 card.style.left=x+'px';card.style.top=y+'px'}
function loop(){if(!on)return;const s=STEPS[i];const u=union((adv&&s.t2?s.t2:s.t)());if(u){if(s.clip){const b=body();if(b){const br=b.getBoundingClientRect();u.t=Math.max(u.t,br.top);u.b=Math.min(u.b,br.bottom)}}place(u);hole.style.setProperty('--tourc',s.color?s.color():'')}
 if(!adv&&s.ok()){adv=1;hole.classList.add('ok');
  if(s.res){const d=$('#tour-td');d.hidden=false;d.className='t-do res';$('#tour-td span').textContent='Changed from '+fl.from+' to '+fl.to;$('#tour-tp').textContent='Look at the card. The status and the line under the heading changed to match.';$$('#pill,#lead').forEach(x=>x.classList.add('t-flash'))}
  setTimeout(()=>{$$('.t-flash').forEach(x=>x.classList.remove('t-flash'));hole.classList.remove('ok');adv=0;if(!on)return;i++;i<STEPS.length?show():finish()},s.hold||650)}
 raf=requestAnimationFrame(loop)}
function show(){const s=STEPS[i];Object.keys(fl).forEach(k=>fl[k]=0);$('#tour-tk').textContent='Step '+(i+1)+' of '+STEPS.length;$('#tour-th3').textContent=s.h;$('#tour-tp').textContent=s.p;$('#tour-td span').textContent=s.d||'';$('#tour-td').hidden=!!s.passive;$('#tour-td').className='t-do'+(s.passive?' quiet':'');$('#tour-tnext').hidden=!s.passive;
 $('#tour-tdots').innerHTML=STEPS.map((_,k)=>'<i class="'+(k<=i?'on':'')+'"></i>').join('');$('#tour-tskip').hidden=false;$('#tour-tfin').hidden=true;hole.style.removeProperty('--tourc');live(s);s.pre&&s.pre()}
function live(s){document.body.classList.toggle('tour-live',!!s.live);hole.classList.toggle('lite',!!s.passive);const c=cardEl();if(c){c.classList.toggle('t-live',!!s.passive);if(s.passive&&s.color)setTimeout(()=>c.style.setProperty('--tourc',s.color()),60)}}
function unlive(){document.body.classList.remove('tour-live');hole.classList.remove('lite');const c=cardEl();c&&(c.classList.remove('t-live'),c.style.removeProperty('--tourc'))}
function start(){clearTimeout(autoT);root.hidden=false;tw.hidden=true;spot.hidden=false;pill.hidden=true;on=true;i=0;adv=0;show();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
function finish(){unlive();on=false;cancelAnimationFrame(raf);mark();hole.style.cssText='left:50%;top:50%;width:0;height:0;border-color:transparent';blk.forEach(b=>b.style.cssText='left:0;top:0;width:100vw;height:100vh');
 $('#tour-tk').textContent='All done';$('#tour-th3').textContent='Thanks for looking';$('#tour-tp').innerHTML='Use Copy this setup any time to send the team the components you think matter most. To see the other pages, use <b>Go back to the main index</b> at the top left.';$('#tour-td').hidden=true;$('#tour-tnext').hidden=true;$('#tour-tdots').innerHTML='';$('#tour-tskip').hidden=true;$('#tour-tfin').hidden=false;
 card.style.left=Math.max(12,(innerWidth-card.offsetWidth)/2)+'px';card.style.top=Math.max(12,(innerHeight-card.offsetHeight)/2)+'px';blk.forEach(b=>b.style.background='color-mix(in srgb,var(--c-black) 60%,transparent)')}
function close(){unlive();on=false;cancelAnimationFrame(raf);mark();spot.hidden=true;tw.hidden=true;root.hidden=false;pill.hidden=false;blk.forEach(b=>b.style.background='')}
function skip(){close();clearTimeout(autoT);if(!isOpen())pzt.click();let touched=false;const t=()=>{touched=true;clearTimeout(autoT)};['pointerdown','pointermove','wheel','scroll','touchstart','keydown','focusin'].forEach(ev=>pz.addEventListener(ev,t,{once:true,capture:true,passive:true}));
 autoT=setTimeout(()=>{if(!touched&&isOpen())pzt.click()},4500)}
document.addEventListener('click',e=>{if(!on)return;const t=e.target;},true);
document.addEventListener('change',e=>{if(on&&e.target.id==='scn'){fl.to=optTxt();fl.scn=1}},true);
blk.forEach(b=>b.addEventListener('pointerdown',()=>{card.classList.remove('shake');void card.offsetWidth;card.classList.add('shake')}));
$('#tour-tw-go').onclick=start;$('#tour-tw-skip').onclick=skip;$('#tour-tskip').onclick=skip;$('#tour-tfin').onclick=close;$('#tour-tnext').onclick=()=>{fl.next=1};pill.onclick=start;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&(on||!tw.hidden)){e.preventDefault();skip()}});
addEventListener('resize',()=>{});
if(seen()){root.hidden=false;pill.hidden=false}else{root.hidden=false;tw.hidden=false;setTimeout(()=>$('#tour-tw-go').focus(),50)}
})();
