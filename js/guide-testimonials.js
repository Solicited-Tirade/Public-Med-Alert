/* testimonials welcome + tour copy (see js/guide.js) */
(()=>{const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
MRGuide({key:"testimonials",headline:"Real rescues, in their own words",pitch:"This is meant to be the public home for every testimonial: real clients, in their own words, each linked to the mission it came from. People who help shape their story defend it, and verified stories outweigh rumors. Help us shape the way this looks and feels.",go:"Show me how",
 points:[
 [
  "ok",
  "Verifiable",
  "Every card opens the real mission record it came from. The cards shown here are all examples."
 ],
 [
  "doc",
  "Their words, their name",
  "Clients choose what to publish and sign it with their name. A named client is hard to dismiss as seeded."
 ],
 [
  "spark",
  "Made to be shared",
  "Polish and motion are there on purpose: a story that looks good gets posted."
 ]
],
 steps:[
 {h:"Proof at a glance",p:"Average rating, median response time and missions by type. Numbers first, so a skeptical visitor sees the track record before the stories.",t:".stats"},
 {h:"Publish and share",p:"Two ways in for clients who were helped: Publish a rescue in the header and Share your experience here. Both open the publish flow, so both are built to stand out.",t:[".pubb", ".shx"]},
 {h:"Spotlight of the week",p:"One featured testimonial, picked by the team, with a Show button for the full record.",t:"#spot"},
 {h:"Search and filter",p:"Find a record by alert name or handle, sort it, or filter by outcome and mission type.",t:"#filters"},
 {h:"A testimonial",p:"Each card shows the outcome, rating, the client's words and kudos both ways. These are examples. Each is signed with the client's name, and a real one opens its full verified mission record.",t:"#grid .card"},
 {h:"Pick a layout",p:"This is where we want <i><u>your</u></i> opinions, <i><u>the tester's</u></i>. Switch pills, card styles and grid or list, then tell us which combination makes you want to read on.",t:()=>[$('#kpill'),$('#cstyle'),$('#vGrid')&&$('#vGrid').closest('.seg')]}],
 fb:"Which layout and card style would you keep? Pick one, then tell us why in the Discord thread. Your pick helps us decide."});})();
