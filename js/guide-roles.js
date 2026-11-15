/* roles welcome + tour copy (see js/guide.js) */
(()=>{const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
MRGuide({key:"roles",headline:"There's a role here for you",pitch:"Every rescue needs a full team. This page is part recruitment and part showcase: it shows what each role does, and the professionalism and cohesion behind every alert, which is also how we show we are legitimate. Help us shape the way this looks and feels.",go:"Show me how",
 points:[
 [
  "users",
  "See the team",
  "Every role on a rescue, from team lead to medic, in plain language."
 ],
 [
  "spark",
  "Find your fit",
  "Trait chips show which role suits the way you play."
 ],
 [
  "map",
  "Layouts to compare",
  "Three layouts and their variants. Tell us which one explains the roles best."
 ]
],
 steps:[
 {h:"Three layouts",p:"Squad select, card deck and first draft all show the same roles. Which one explains them best?",t:"#vsw"},
 {h:"Variants",p:"Each layout has variants, such as slanted panels, straight columns and stacked rows.",t:"#ssw"},
 {h:"Find your fit",p:"Whatever speaks to you: choose the traits you find most appealing and the matching roles come forward.",t:()=>$('.sq-p.on .sq-traits')||$('#sqrow')},
 {h:"Role panels",p:"Each panel names the role, what you do and what makes a good fit. Use \"More about this role\" for the details.",t:()=>[$$('.view').find(v=>v.offsetHeight>0)||$('#sqrow')]},
 {h:"Questions?",p:"The FAQ answers what joining involves, so a curious visitor does not have to ask in Discord.",t:".faq-link"}],
 fb:"Which layout explains the roles best? Pick one, then tell us why in the Discord thread. Your pick helps us decide."});})();
