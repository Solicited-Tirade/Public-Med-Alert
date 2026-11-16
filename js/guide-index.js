/* index welcome + tour copy (see js/guide.js) */
(()=>{const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
MRGuide({key:"index",headline:"Thanks for helping us test Public Med Alert",pitch:"These pages turn a finished rescue into a public, verified testimonial, so real client stories crowd out rumors. Nothing here is final. Help us shape the way these look and feel.",go:"Show me around",
 points:[
 [
  "ok",
  "What it is",
  "A showcase of separate pieces, from the client's thank-you card to a public testimonials page."
 ],
 [
  "eye",
  "Who sees what",
  "Each card says whether it is client-facing, public or internal. Taped cards are unfinished."
 ],
 [
  "pen",
  "How to help",
  "Open a page, try it, then post your pick in the thread. Every page links back to this menu."
 ]
],
 steps:[
 {h:"Pick where to start",p:"Eight ideas, each one a page. Hover a card to see what is inside it.",t:"#mn-row"},
 {h:"Not ready for feedback",p:"These two are out of date and may confuse people until we have time to fix them up. Please skip them for now, they are not ready for feedback.",t:"#nr-in"},
 {h:"Call to action",p:"The only piece a client is asked to complete: it's offered right after a rescue, with the opportunity to write their testimonial later. More details inside that tour.",t:".mn-b[data-k=cta]"},
 {h:"Available roles",p:"A recruitment page. It shows what we do and how the crew works together, for people who might join and for people judging our legitimacy.",t:".mn-b[data-k=role]"},
 {h:"Testimonials",p:"The public home for every testimonial. Real clients, in their own words, each linked to the mission it came from.",t:".mn-b[data-k=wall]"},
 {h:"Front page redesign",p:"Three takes on the front page itself. Signal intro is a short animation of a deploy, sweep, clear and revival. Typography is one big line per scene. Typography V2 rebuilds every section of the current page the same way. Hover each card for its purpose.",t:[".mn-b[data-k=intro]",".mn-b[data-k=type]",".mn-b[data-k=v2]"]},
 {h:"Where each piece lives",p:"These are separate pieces, not one flow. The call to action appears once an alert is closed out. Check out what our clients say would open testimonials, and Join our team would open the roles page. The index is only the showcase, so isolation is not the intent.",t:[".mn-b[data-k=cta]", ".mn-b[data-k=role]", ".mn-b[data-k=wall]"]},
 {h:"Getting around",p:"Use the arrow keys or 1 to 8 to pick a card. Every page has \"Go back to the main index\" at the top left, and a Guided tour button to replay a tour.",t:[".mn-bl", ".mn-note"]}],
 fb:"Which of the ready cards would you keep, and where would each fit best in the portal and website? Pick one, then tell us why in the Discord thread. Your pick helps us decide."});})();
