// Fleet Planner mockup: plan document shape and the derived fleet model.
(function () {
'use strict';
const D = window.FleetData, G = window.FleetGeo, SC = window.FleetScene;

// ===== Plan document =====
// Everything in DOC_KEYS is saved per layout and covered by undo.
// PHASED keys hold the current phase's copy; other phases live in phaseData.
const DOC_KEYS = ['offs', 'assign', 'zones', 'wps', 'names', 'status', 'leads', 'elLeads', 'phase', 'comments', 'resolved', 'phaseData', 'markers', 'annos', 'labelOffs', 'seatOv', 'att', 'sandbox', 'colors', 'losses', 'displaced', 'ready', 'opclock', 'phaseNotes', 'arcs', 'statsOv'];
const PHASED = ['offs', 'wps', 'zones', 'markers', 'annos', 'labelOffs'];
const DOC0 = () => ({
offs: {}, assign: {}, zones: [], wps: {}, names: { fleet: '', sq: {}, el: {}, ship: {} }, status: {}, leads: {}, elLeads: {}, phase: 1,
comments: [], resolved: [], phaseData: {}, markers: [], annos: [], labelOffs: {}, seatOv: {}, att: {}, sandbox: [], colors: {}, losses: {}, displaced: [],
ready: {}, opclock: { hh: '20:00', mins: D.PHASE_MIN.slice() }, phaseNotes: {}, arcs: {}, statsOv: {}
});
const pick = (st, keys) => { const o = {}; keys.forEach((k) => { o[k] = st[k]; }); return o; };
const docOf = (st) => pick(st, DOC_KEYS);
const phasedOf = (st) => pick(st, PHASED);
const normalize = (d) => {
const doc = Object.assign(DOC0(), d || {});
doc.names = Object.assign(DOC0().names, doc.names || {});
doc.opclock = Object.assign(DOC0().opclock, doc.opclock || {});
return doc;
};

// ===== Hull stats (wiki values with your overrides) =====
const hullStats = (S, hull) => Object.assign({}, D.HULLS[hull], { h2km: D.H2_RANGE_KM[hull] }, (S.statsOv || {})[hull] || {});

// ===== Fleet model =====
const build = (S) => {
const ships = [];
const mk = (key, owner, hull, squad, el, base, bc, sandbox) => {
const H = hullStats(S, hull);
const a = S.assign[key];
const lost = S.losses[key] || '';
const seats = H.seats.map((name, i) => {
const k = key + '|' + i;
let who = Object.prototype.hasOwnProperty.call(S.seatOv, k) ? S.seatOv[k] : ((D.DEFAULT_SEATS[key] || [])[i] || '');
if (lost === 'destroyed') who = '';
return { i, name, who, role: D.SEAT_ROLE(name) };
});
const crewA = seats.filter((s) => s.who).length;
const o = S.offs[key] || [0, 0];
const r = S.ready[key] || {};
const s = {
key, handle: key, owner, hull, name: hull, H, sandbox,
label: owner || 'Open slot',
squad: a ? a[0] : squad, el: a ? a[1] : el,
status: S.status[key] || base, base, lost,
seats, crewA, crewB: seats.length, crew: crewA + '/' + seats.length,
nick: S.names.ship[key] || '',
bc, cx: bc[0] + o[0], cy: bc[1] + o[1],
role: H.role
};
s.ready = { crewed: crewA >= H.req, fuel: !!r.fuel, load: !!r.load, pos: !!r.pos };
s.readyN = ['crewed', 'fuel', 'load', 'pos'].filter((k) => s.ready[k]).length;
const en = S.arcs[key] || null;
const guns = H.guns.map((g, i) => Object.assign({ kind: 'gun', i, on: en ? (en.g || []).indexOf(i) >= 0 : false }, g));
const mis = H.missiles.map((g, i) => Object.assign({ kind: 'missile', i, on: en ? (en.m || []).indexOf(i) >= 0 : false }, g));
s.weapons = guns.concat(mis);
s.rng = H.guns.reduce((m, g) => Math.max(m, g.r), 0);
ships.push(s);
};
D.BASE.forEach((b) => mk(b.h, b.h, b.hull, b.squad, b.el, b.status, SC.center(b.h), false));
(S.sandbox || []).forEach((sb) => mk(sb.id, sb.owner || '', sb.hull, sb.squad, sb.el, 'Mustering', [sb.x, sb.y], true));

const byK = {};
ships.forEach((s) => { byK[s.key] = s; });
const inSq = (q) => ships.filter((s) => s.squad === q);
const elsOf = (q) => { const out = []; inSq(q).forEach((s) => { if (out.indexOf(s.el) < 0) out.push(s.el); }); return out.sort(); };
const leads = {};
D.SQ_ORDER.forEach((q) => {
const mem = inSq(q).filter((s) => s.owner && s.lost !== 'destroyed').map((s) => s.key);
const o = S.leads[q] || [];
const d = D.LEADS0[q];
const L = [o[0], d[0]].find((h) => h && mem.indexOf(h) >= 0) || mem[0] || null;
const Dp = [o[1], d[1]].find((h) => h && mem.indexOf(h) >= 0 && h !== L) || mem.filter((h) => h !== L)[0] || null;
leads[q] = [L, Dp];
});
const elLead = (q, el) => {
const mem = inSq(q).filter((s) => s.el === el && s.owner && s.lost !== 'destroyed').map((s) => s.key);
const o = S.elLeads[q + '|' + el];
return (o && mem.indexOf(o) >= 0) ? o : (mem[0] || null);
};
const color = (q) => (S.colors || {})[q] || D.SQC[q];
const sqName = (q) => S.names.sq[q] || D.DEFNAME[q] || q;
const elName = (q, el) => S.names.el[q + '|' + el] || (q === 'Command' ? 'Commander on ship' : 'Element ' + el);
const fleetName = S.names.fleet || 'Fleet One';
const title = (s) => s.nick ? s.name + ' “' + s.nick + '”' : s.name;
const newElId = (q) => { const used = elsOf(q); let n = 1; while (used.indexOf(D.SQN[q] + '-' + n) >= 0) n++; return D.SQN[q] + '-' + n; };

// ===== Members, seats and attendance =====
const seatOf = {};
ships.forEach((s) => s.seats.forEach((st) => { if (st.who) seatOf[st.who] = { ship: s.key, i: st.i, name: st.name }; }));
const members = D.MEMBERS.map((m) => Object.assign({}, m, { seat: seatOf[m.h] || null, att: (S.att[m.h] || {}).s || '', late: (S.att[m.h] || {}).late || '' }));
const unseated = members.filter((m) => !m.seat);
const suggest = (seatRole) => unseated.filter((m) => m.prefs.indexOf(seatRole) >= 0 && m.att !== 'no');

// ===== Medical beds =====
const medShips = ships.filter((s) => s.H.beds.some((b) => b.t) && s.lost !== 'destroyed');
const bedsOf = (s) => { const out = []; s.H.beds.forEach((b) => { if (b.t) for (let i = 0; i < b.n; i++) out.push(b.t); }); return out; };

return { ships, byK, inSq, elsOf, leads, elLead, color, sqName, elName, fleetName, title, newElId, members, unseated, suggest, seatOf, medShips, bedsOf };
};

// ===== Route timing =====
const routeTime = (s, list) => list && list.length ? G.toKm(G.polyLen([[s.cx, s.cy]].concat(list))) * 1000 / s.H.scm : 0;
const maxRouteTime = (S, M) => {
let mt = 0;
Object.keys(S.wps).forEach((k) => { const s = M.byK[k]; if (s) mt = Math.max(mt, routeTime(s, S.wps[k])); });
(S.markers || []).forEach((m) => { if (m.path && m.path.length) mt = Math.max(mt, G.toKm(G.polyLen([[m.x, m.y]].concat(m.path))) * 1000 / (m.spd || 180)); });
return mt;
};

// ===== Op clock =====
const hHour = (S) => {
const p = String(S.opclock.hh || '20:00').split(':');
const d = new Date();
d.setUTCHours(+p[0] || 0, +p[1] || 0, 0, 0);
return d;
};
const phaseStart = (S, i) => new Date(hHour(S).getTime() + (S.opclock.mins[i] || 0) * 60000);

window.FleetModel = { DOC_KEYS, PHASED, DOC0, docOf, phasedOf, normalize, hullStats, build, routeTime, maxRouteTime, hHour, phaseStart };
})();
