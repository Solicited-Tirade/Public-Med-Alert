/* Anchored Discord feedback request. Same spot on every page. Minimize is per page load only: it always comes back. */
(()=>{
const URL='https://discord.com/channels/730982567972700281/1571253633386029086';
const d=document.createElement('aside');d.className='fb';d.setAttribute('aria-label','Feedback');
d.innerHTML='<i class="fb-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M19.3 5.3A17 17 0 0 0 15 4l-.2.4a15 15 0 0 1 3.9 1.9 13 13 0 0 0-13.4 0A15 15 0 0 1 9.2 4.4L9 4a17 17 0 0 0-4.3 1.3C2 9.3 1.3 13.2 1.6 17a17 17 0 0 0 5.2 2.6l1.1-1.8a11 11 0 0 1-1.7-.8l.4-.3a12 12 0 0 0 10.8 0l.4.3-1.7.8 1.1 1.8a17 17 0 0 0 5.2-2.6c.4-4.4-.7-8.3-2.9-11.7zM8.7 14.7c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"/></svg></i>'+
'<div class="fb-t"><b>Help us shape how this looks and feels</b><span>Share your thoughts in the Discord thread.</span></div><span class="fb-l">Feedback</span>'+
'<a class="fb-go" href="'+URL+'" target="_blank" rel="noopener">Open thread &#8599;</a>'+
'<button class="fb-m" type="button" aria-label="Minimize feedback request" aria-expanded="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>';
document.body.appendChild(d);
const m=d.querySelector('.fb-m');
function set(min){d.classList.toggle('min',min);m.setAttribute('aria-expanded',String(!min));m.setAttribute('aria-label',min?'Open feedback request':'Minimize feedback request')}
m.onclick=e=>{e.stopPropagation();set(!d.classList.contains('min'))};
d.addEventListener('click',e=>{if(d.classList.contains('min')&&e.target!==m&&!m.contains(e.target))set(false)});
})();
