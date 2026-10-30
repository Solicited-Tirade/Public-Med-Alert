// Fleet Planner mockup: element briefing card, written as Discord markdown.
(function () {
'use strict';
const D = window.FleetData, G = window.FleetGeo, FM = window.FleetModel;

const element = (S, M, q, el) => {
const ships = M.inSq(q).filter((s) => s.el === el);
const lead = M.elLead(q, el);
const phase = D.PHASES[S.phase][0];
const start = FM.phaseStart(S, S.phase);
const lines = [];

// ===== Header =====
lines.push('**' + M.elName(q, el).toUpperCase() + '** · ' + M.sqName(q) + ' · ' + M.fleetName);
lines.push('Phase: **' + phase + '** at ' + G.hhmm(start, true) + ' UTC (H+' + (S.opclock.mins[S.phase] || 0) + 'm)');
lines.push('Element lead: **' + (lead || 'none') + '** · Squadron lead: ' + (M.leads[q][0] || 'none'));
lines.push('');

// ===== Ships and seats =====
lines.push('__Ships__');
ships.forEach((s) => {
const seated = s.seats.filter((x) => x.who).map((x) => x.name + ': ' + x.who).join(', ');
const open = s.seats.filter((x) => !x.who).map((x) => x.name);
lines.push('• ' + s.label + ' · ' + M.title(s) + ' · ' + s.crew + ' · ' + s.status + (s.lost ? ' (' + s.lost + ')' : ''));
if (seated) lines.push('  Seats: ' + seated);
if (open.length) lines.push('  Open: ' + open.slice(0, 6).join(', ') + (open.length > 6 ? ' +' + (open.length - 6) : ''));
});
lines.push('');

// ===== Routes =====
const routed = ships.filter((s) => (S.wps[s.key] || []).length);
if (routed.length) {
lines.push('__Routes__');
routed.forEach((s) => {
const list = S.wps[s.key];
lines.push('• ' + s.label + ': ' + list.length + ' waypoint' + (list.length > 1 ? 's' : '') + ', ' + G.toKm(G.polyLen([[s.cx, s.cy]].concat(list))).toFixed(1) + ' km, ETA ' + G.fmtT(FM.routeTime(s, list)) + ' at SCM');
});
lines.push('');
}

// ===== Zones, markers, tasks =====
const zones = S.zones.filter((z) => z.c === M.color(q));
if (zones.length) { lines.push('__Zones__'); zones.forEach((z) => lines.push('• ' + z.t)); lines.push(''); }
const mk = (S.markers || []).filter((m) => m.cover === q);
if (mk.length) { lines.push('__Assigned markers__'); mk.forEach((m) => lines.push('• ' + D.MARKERS[m.type].label + ': ' + m.t)); lines.push(''); }
const keys = ships.map((s) => 'ship:' + s.key);
const tasks = S.comments.filter((c) => keys.indexOf(c.key) >= 0 && c.type !== 'note' && !c.done);
if (tasks.length) {
lines.push('__Open tasks and warnings__');
tasks.forEach((c) => lines.push('• [' + D.COMMENT_TYPES[c.type][0] + '] ' + c.text + (c.assignee ? ' → ' + c.assignee : '') + (c.due !== undefined && c.due !== '' ? ' (before ' + D.PHASES[c.due][0] + ')' : '')));
}
return lines.join('\n').trim();
};

window.FleetBriefing = { element };
})();
