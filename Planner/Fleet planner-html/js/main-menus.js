// Fleet Planner mockup: right-click menus and the Reset menu.
// build(C, menu, M) returns rows: head, item, sep or chips. C is the Main component.
(function () {
'use strict';
const D = window.FleetData, G = window.FleetGeo, FM = window.FleetModel;

// ===== Row helpers =====
const rows = (C) => {
const close = () => C.setState({ menu: null });
return {
I: (label, act, o) => { o = o || {}; return { isItem: true, isHead: false, isSep: false, isChips: false, label, hint: o.hint || '', tip: o.tip || '', dis: !!o.dis, op: o.dis ? 0.4 : 1, color: o.danger ? '#F87171' : '#E5E7EB', act: () => { close(); act(); } }; },
H: (label, color) => ({ isHead: true, isItem: false, isSep: false, isChips: false, label, color: color || '#9CA3AF' }),
SEP: () => ({ isSep: true, isItem: false, isHead: false, isChips: false }),
CH: (chips) => ({ isChips: true, isItem: false, isHead: false, isSep: false, chips: chips.map((c) => ({ label: c.label, tip: c.tip || '', color: c.on ? '#111827' : c.color, border: c.color, bg: c.on ? c.color : 'transparent', act: () => { close(); c.act(); } })) })
};
};

// ===== Per-target menus =====
const ship = (C, menu, M, R, out) => {
const S = C.eff(), id = menu.id, s = M.byK[id];
if (!s) return;
const { I, H, SEP, CH } = R;
const route = S.wps[id] || [];
out.push(H(s.label + ' · ' + M.title(s), M.color(s.squad)));
out.push(I('Inspect in Ship tab', () => C.setState({ sel: id, tab: 'ship', panelOpen: true })));
out.push(I(s.nick ? 'Rename nickname…' : 'Give a nickname…', () => { C.setState({ sel: id, tab: 'ship', panelOpen: true }); C.startEdit('ship:' + id, s.nick); }, { hint: 'dbl-click' }));
out.push(I('Comment, task or warning…', () => C.openComments('ship:' + id, menu.x, menu.y), { hint: 'C' }));
out.push(I('Reset position', () => C.resetPos(id), { dis: !S.offs[id] }));
out.push(I('Snap to squadron ring', () => C.snapShips([id], 'Snapped ' + s.label + ' to its ring')));
out.push(I('Add waypoints', () => C.setState({ sel: id, tool: 'rally' })));
out.push(I('Clear route', () => C.setWps(id, [], 'Cleared route for ' + s.label), { dis: !route.length }));
out.push(I('Measure from here', () => C.setState({ sel: id, tool: 'measure', meas: [id] })));
out.push(I('Show all weapon arcs', () => C.setArcs(id, true), { tip: 'Draw a range ring for every stock gun and missile.' }));
if (s.sandbox) {
out.push(SEP());
out.push(H('Open ship'));
out.push(CH(M.unseated.slice(0, 12).map((m) => ({ label: m.h, color: '#A78BFA', on: s.owner === m.h, tip: 'Give this ship to ' + m.h + '.', act: () => C.claimSandbox(id, m.h) }))));
out.push(I('Remove open ship', () => C.removeSandbox(id), { danger: true }));
}
out.push(SEP());
out.push(H('Status'));
out.push(CH(Object.keys(D.ST).map((st) => ({ label: st, color: D.ST[st], on: s.status === st, tip: st + ': ' + D.ST_TIP[st] + '.', act: () => C.setStatus(id, st) }))));
if (S.mode === 'live' || s.lost) {
out.push(H('Losses (Live)', '#F05252'));
out.push(CH([
{ label: 'Destroyed', color: '#F05252', on: s.lost === 'destroyed', tip: 'Crew go to the reassign list and a casualty is raised at the wreck.', act: () => C.markLoss(id, 'destroyed') },
{ label: 'Disabled', color: '#FBBF24', on: s.lost === 'disabled', tip: 'The ship is out of action but the crew stay aboard.', act: () => C.markLoss(id, 'disabled') },
{ label: 'Clear', color: '#9CA3AF', on: false, tip: 'Remove the loss mark.', act: () => C.clearLoss(id) }
]));
}
if (id !== 'Marrow_6') {
out.push(H('Move to element'));
const chips = [];
D.SQ_ORDER.filter((q) => q !== 'Command').forEach((q) => {
M.elsOf(q).forEach((el) => chips.push({ label: el, color: M.color(q), on: s.squad === q && s.el === el, tip: M.sqName(q) + ' · ' + M.elName(q, el), act: () => C.assignTo([id], q, el) }));
chips.push({ label: D.SQN[q] + '-new', color: M.color(q), on: false, tip: 'Start a new element in ' + M.sqName(q), act: () => C.assignTo([id], q, M.newElId(q)) });
});
out.push(CH(chips));
}
if (s.owner) {
out.push(H('Leadership'));
out.push(CH([
{ label: 'Element lead', color: '#F59E0B', on: M.elLead(s.squad, s.el) === id, act: () => C.setElLead(s.squad, s.el, id) },
{ label: 'Squad lead', color: '#FBBF24', on: M.leads[s.squad][0] === id, act: () => C.setLead(s.squad, 0, id) },
{ label: 'Deputy', color: '#93C5FD', on: M.leads[s.squad][1] === id, act: () => C.setLead(s.squad, 1, id) }
]));
}
};

const route = (C, menu, M, R, out) => {
const S = C.eff(), { I, H, CH } = R;
const p = menu.id.split('|');
const h = p[0], i = +p[1];
const list = (S.wps[h] || []).slice();
const isFree = h.indexOf('free:') === 0;
const owners = M.ships.filter((s) => s.key !== h).map((s) => s.key);
if (menu.kind === 'wp') {
out.push(H('Waypoint ' + (i + 1) + ' · ' + (isFree ? 'detached route' : (M.byK[h] || {}).label), '#FBBF24'));
out.push(I('Delete waypoint', () => C.setWps(h, list.filter((q, j) => j !== i), 'Removed waypoint ' + (i + 1)), { hint: 'Del', danger: true }));
out.push(I('Break leg before it', () => {
const g = list[i], from = i === 0 ? (isFree ? [g[0] - 40, g[1]] : C.centerOf(h)) : list[i - 1];
list.splice(i, 0, [Math.round((from[0] + g[0]) / 2), Math.round((from[1] + g[1]) / 2)]);
C.setWps(h, list, 'Broke leg before waypoint ' + (i + 1));
}));
out.push(I('Delete this and later', () => C.setWps(h, list.slice(0, i), 'Trimmed route after waypoint ' + i), { danger: true }));
if (i < list.length - 1) {
out.push(I('Split into a detached route', () => C.splitRoute(h, i, null), { tip: 'Everything after this point becomes its own route you can hand to any ship later.' }));
out.push(H('Hand the rest to'));
out.push(CH(owners.map((x) => ({ label: M.byK[x].label, color: M.color(M.byK[x].squad), on: false, act: () => C.splitRoute(h, i, x) }))));
}
} else {
out.push(H('Route leg ' + (i + 1), '#FBBF24'));
out.push(I('Break here (add waypoint)', () => { list.splice(i, 0, [menu.px, menu.py]); C.setWps(h, list, 'Broke route leg ' + (i + 1)); }, { hint: 'dbl-click' }));
}
if (isFree) {
out.push(H('Assign detached route to'));
out.push(CH(M.ships.map((s) => ({ label: s.label, color: M.color(s.squad), on: false, act: () => { const w = Object.assign({}, C.state.wps); w[s.key] = (w[s.key] || []).concat(w[h] || []); delete w[h]; C.commit({ wps: w }, 'Assigned detached route to ' + s.label); } }))));
}
out.push(I(isFree ? 'Delete detached route' : 'Clear whole route', () => C.setWps(h, [], isFree ? 'Deleted detached route' : 'Cleared route'), { danger: true }));
};

const zone = (C, menu, M, R, out) => {
const S = C.eff(), { I, H, CH } = R, id = menu.id;
const z = S.zones.find((q) => q.id === id);
if (!z) return;
out.push(H(z.t, z.c));
out.push(I('Rename…', () => { C.setState({ tab: 'layers', panelOpen: true }); C.startEdit('zone:' + id, z.t); }, { hint: 'dbl-click label' }));
out.push(I('Comment, task or warning…', () => C.openComments('zone:' + id, menu.x, menu.y)));
out.push(H('Colour'));
out.push(CH(D.PALETTE.map((c) => ({ label: '■', color: c, on: z.c === c, act: () => C.commit({ zones: C.state.zones.map((q) => q.id === id ? Object.assign({}, q, { c }) : q) }, 'Recoloured ' + z.t) }))));
out.push(I('Send to back', () => C.commit({ zones: [z].concat(C.state.zones.filter((q) => q.id !== id)) }, 'Sent ' + z.t + ' to back'), { dis: S.zones[0] && S.zones[0].id === id }));
out.push(I('Delete zone', () => C.commit({ zones: C.state.zones.filter((q) => q.id !== id) }, 'Deleted ' + z.t), { hint: 'Del', danger: true }));
};

const marker = (C, menu, M, R, out) => {
const S = C.eff(), { I, H, CH } = R, id = menu.id;
const m = S.markers.find((q) => q.id === id);
if (!m) return;
const MK = D.MARKERS[m.type];
out.push(H(MK.label + ' · ' + m.t + ' (double-click label to rename)', MK.c));
out.push(I('Comment, task or warning…', () => C.openComments('marker:' + id, menu.x, menu.y)));
if (m.type === 'threat') {
out.push(H('Threat type'));
out.push(CH(D.THREAT_KINDS.map((k) => ({ label: k, color: '#F87171', on: m.kind === k, act: () => C.updateMarker(id, { kind: k }, m.t + ' set to ' + k) }))));
out.push(H('Strength'));
out.push(CH([1, 2, 3, 4, 5].map((n) => ({ label: String(n), color: '#F87171', on: m.str === n, act: () => C.updateMarker(id, { str: n }, m.t + ' strength ' + n) }))));
out.push(I((m.path || []).length ? 'Extend movement path' : 'Give it a movement path', () => C.setState({ mpath: id, tool: 'select' }), { tip: 'Click the map to add points it will move along during playback. Press Esc when done.' }));
out.push(I('Clear movement path', () => C.updateMarker(id, { path: [] }, 'Cleared path for ' + m.t), { dis: !(m.path || []).length }));
}
if (m.type === 'hazard') {
out.push(H('Size'));
out.push(CH([[40, 'Small'], [60, 'Medium'], [100, 'Large'], [160, 'Huge']].map(([r, l]) => ({ label: l, color: '#FB923C', on: m.r === r, act: () => C.updateMarker(id, { r }, m.t + ' resized') }))));
}
if (m.type === 'casualty') {
out.push(H('Tier (T1 most serious)'));
out.push(CH([1, 2, 3].map((t) => ({ label: 'T' + t, color: D.TIER_C[t], on: m.tier === t, act: () => C.updateMarker(id, { tier: t }, m.t + ' set to T' + t) }))));
out.push(H('Assign medical ship'));
out.push(CH(M.medShips.map((s) => ({ label: s.label, color: M.color(s.squad), on: m.ship === s.key, act: () => C.assignCasualty(id, s.key) }))));
out.push(I('Mark recovered', () => C.deleteMarker(id), { tip: 'The casualty is aboard; frees the marker.' }));
}
if (m.type !== 'casualty') {
out.push(H('Covered by squadron'));
out.push(CH(D.SQ_ORDER.map((q) => ({ label: M.sqName(q), color: M.color(q), on: m.cover === q, tip: 'Lines go green for ships whose longest gun reaches this marker.', act: () => C.updateMarker(id, { cover: m.cover === q ? '' : q }, m.cover === q ? 'Removed coverage from ' + m.t : M.sqName(q) + ' covers ' + m.t) }))));
}
out.push(I('Delete marker', () => C.deleteMarker(id), { hint: 'Del', danger: true }));
};

const sq = (C, menu, M, R, out) => {
const S = C.eff(), { I, H, CH } = R, id = menu.id;
const mem = M.inSq(id).filter((s) => s.owner).map((s) => s.key);
out.push(H(M.sqName(id), M.color(id)));
out.push(I('Rename…', () => { C.setState({ tab: 'fleet', panelOpen: true, collapsed: Object.assign({}, C.state.collapsed, { [id]: false }) }); C.startEdit('sq:' + id, M.sqName(id)); }, { hint: 'dbl-click' }));
out.push(I('Reset name', () => C.rename('sq:' + id, ''), { dis: !S.names.sq[id] }));
out.push(I(S.collapsed[id] ? 'Expand in tree' : 'Collapse in tree', () => C.setState({ collapsed: Object.assign({}, C.state.collapsed, { [id]: !C.state.collapsed[id] }), tab: 'fleet' })));
out.push(I('Filter map to this squadron', () => C.setState({ q: M.sqName(id) })));
out.push(I('Snap squadron to its ring', () => C.snapShips(M.inSq(id).map((s) => s.key), 'Snapped ' + M.sqName(id) + ' to its ring')));
out.push(I('Select all ships in it', () => C.setState({ tool: 'group', multi: M.inSq(id).map((s) => s.key) })));
out.push(H('Colour'));
out.push(CH(D.PALETTE.map((c) => ({ label: '■', color: c, on: M.color(id) === c, act: () => C.setColor(id, c) }))));
if (mem.length > 1) {
out.push(H('Formation around ' + (M.leads[id][0] || 'lead')));
out.push(CH(['Wedge', 'Line', 'Column', 'Screen'].map((f) => ({ label: f, color: '#22D3EE', on: false, act: () => C.applyFormation(id, null, f) }))));
}
if (mem.length) {
out.push(H('Squadron lead'));
out.push(CH(mem.map((h) => ({ label: h, color: '#FBBF24', on: M.leads[id][0] === h, act: () => C.setLead(id, 0, h) }))));
}
if (mem.length > 1) {
out.push(H('Deputy'));
out.push(CH(mem.map((h) => ({ label: h, color: '#93C5FD', on: M.leads[id][1] === h, act: () => C.setLead(id, 1, h) }))));
}
};

const el = (C, menu, M, R, out) => {
const S = C.eff(), { I, H, CH } = R, id = menu.id;
const p = id.split('|');
const mem = M.inSq(p[0]).filter((s) => s.el === p[1] && s.owner).map((s) => s.key);
const all = M.inSq(p[0]).filter((s) => s.el === p[1]);
out.push(H(M.elName(p[0], p[1]), M.color(p[0])));
out.push(I('Briefing card…', () => C.setState({ briefing: { q: p[0], el: p[1] } }), { tip: 'A ready-to-paste Discord summary of this element.' }));
out.push(I('Rename…', () => { C.setState({ tab: 'fleet', panelOpen: true, collapsed: Object.assign({}, C.state.collapsed, { [p[0]]: false }) }); C.startEdit('el:' + id, M.elName(p[0], p[1])); }, { hint: 'dbl-click' }));
out.push(I('Reset name', () => C.rename('el:' + id, ''), { dis: !S.names.el[id] }));
if (all.length > 1) {
out.push(H('Formation around ' + (M.elLead(p[0], p[1]) || 'lead')));
out.push(CH(['Wedge', 'Line', 'Column', 'Screen'].map((f) => ({ label: f, color: '#22D3EE', on: false, tip: { Wedge: 'Wingmen fan out behind the lead.', Line: 'Side by side with the lead.', Column: 'Single file behind the lead.', Screen: 'An arc out in front of the lead.' }[f], act: () => C.applyFormation(p[0], p[1], f) }))));
}
if (mem.length) {
out.push(H('Element lead'));
out.push(CH(mem.map((h) => ({ label: h, color: '#F59E0B', on: M.elLead(p[0], p[1]) === h, act: () => C.setElLead(p[0], p[1], h) }))));
}
};

const anno = (C, menu, M, R, out) => {
const { I, H } = R, id = menu.id;
const a = C.state.annos.find((q) => q.id === id);
if (!a) return;
out.push(H(a.kind === 'text' ? 'Note' : a.kind.charAt(0).toUpperCase() + a.kind.slice(1), '#FDE68A'));
out.push(I('Delete', () => C.commit({ annos: C.state.annos.filter((q) => q.id !== id) }, 'Deleted ' + a.kind), { hint: 'Del', danger: true }));
out.push(I('Clear all annotations', () => C.commit({ annos: [] }, 'Cleared annotations'), { danger: true }));
};

const mpath = (C, menu, M, R, out) => {
const { I, H } = R;
const p = menu.id.split('|');
const m = C.state.markers.find((q) => q.id === p[0]);
if (!m) return;
out.push(H('Path point ' + (+p[1] + 1) + ' · ' + m.t, '#F87171'));
out.push(I('Remove point', () => C.updateMarker(m.id, { path: m.path.filter((q, j) => j !== +p[1]) }, 'Removed path point'), { danger: true }));
};

const map = (C, menu, M, R, out) => {
const S = C.eff(), { I, H, SEP, CH } = R;
out.push(H('Map'));
out.push(I('Add waypoint here for ' + S.sel, () => { const l = (S.wps[S.sel] || []).concat([[menu.px, menu.py]]); C.setWps(S.sel, l, 'Added waypoint ' + l.length + ' for ' + S.sel); }));
out.push(H('Place a marker here'));
out.push(CH(Object.keys(D.MARKERS).map((t) => ({ label: D.MARKERS[t].label, color: D.MARKERS[t].c, on: false, tip: D.MARKERS[t].tip, act: () => C.addMarker(t, menu.px, menu.py) }))));
out.push(I('Add a note here', () => { const a = C.addAnno('text', [[menu.px, menu.py]], 'Note'); }));
out.push(I('Draw a zone', () => C.setState({ tool: 'zone' })));
out.push(I('Tidy overlapping labels', () => C.setState({ tidyN: C.state.tidyN + 1 })));
out.push(I('Zoom in here', () => C.setView({ z: C.state.view.z * 1.5, cx: menu.px, cy: menu.py }), { hint: 'wheel' }));
out.push(I('Reset view', () => C.resetView(), { hint: 'Home', dis: C.state.view.z === 1 && C.state.view.cx === 720 && C.state.view.cy === 500 }));
out.push(SEP());
out.push(I(S.snap ? 'Turn snap off' : 'Turn snap to rings on', () => C.setState({ snap: !C.state.snap }), { hint: 'S' }));
out.push(I('Keyboard shortcuts', () => C.setState({ help: true }), { hint: '?' }));
};

const reset = (C, menu, M, R, out) => {
const S = C.eff(), { I, H, SEP } = R;
const n = (o) => Object.keys(o).length;
const nm = S.names;
const nNames = (nm.fleet ? 1 : 0) + n(nm.sq) + n(nm.el) + n(nm.ship);
const nWp = Object.keys(S.wps).reduce((a, x) => a + S.wps[x].length, 0);
out.push(H('Reset (this phase: ' + D.PHASES[S.phase][0] + ')', '#FCA5A5'));
out.push(I('Selected ship position', () => C.resetPos(S.sel), { dis: !S.offs[S.sel], hint: S.sel }));
out.push(I('All positions', () => C.commit({ offs: {} }, 'Reset all positions'), { dis: !n(S.offs), hint: n(S.offs) + ' moved' }));
out.push(I('Label positions', () => C.commit({ labelOffs: {} }, 'Reset label positions'), { dis: !n(S.labelOffs), hint: n(S.labelOffs) + ' moved' }));
out.push(I('Routes and waypoints', () => C.commit({ wps: {} }, 'Cleared all routes'), { dis: !nWp, hint: nWp + ' points' }));
out.push(I('Zones', () => C.commit({ zones: [] }, 'Cleared all zones'), { dis: !S.zones.length, hint: S.zones.length + '' }));
out.push(I('Markers', () => C.commit({ markers: [] }, 'Cleared all markers'), { dis: !S.markers.length, hint: S.markers.length + '' }));
out.push(I('Annotations', () => C.commit({ annos: [] }, 'Cleared annotations'), { dis: !S.annos.length, hint: S.annos.length + '' }));
out.push(H('Reset (whole operation)', '#FCA5A5'));
out.push(I('Roster assignments', () => C.commit({ assign: {} }, 'Reset roster assignments'), { dis: !n(S.assign), hint: n(S.assign) + ' changed' }));
out.push(I('Leads and deputies', () => C.commit({ leads: {}, elLeads: {} }, 'Reset leads and deputies'), { dis: !(n(S.leads) + n(S.elLeads)) }));
out.push(I('Ship statuses and losses', () => C.commit({ status: {}, losses: {} }, 'Reset statuses and losses'), { dis: !(n(S.status) + n(S.losses)) }));
out.push(I('Seats, attendance and readiness', () => C.commit({ seatOv: {}, displaced: [], att: {}, ready: {} }, 'Reset seats, attendance and readiness'), { dis: !(n(S.seatOv) + n(S.att) + n(S.ready)) }));
out.push(I('Open ships', () => C.commit({ sandbox: [] }, 'Removed all open ships'), { dis: !S.sandbox.length, hint: S.sandbox.length + '' }));
out.push(I('Comments', () => C.commit({ comments: [] }, 'Cleared all comments'), { dis: !S.comments.length, hint: S.comments.length + '' }));
out.push(I('Names, nicknames and colours', () => C.commit({ names: { fleet: '', sq: {}, el: {}, ship: {} }, colors: {} }, 'Reset names and colours'), { dis: !(nNames + n(S.colors)) }));
out.push(I('Weapon arcs and fuel numbers', () => C.commit({ arcs: {}, statsOv: {} }, 'Reset weapon arcs and fuel numbers'), { dis: !(n(S.arcs) + n(S.statsOv)) }));
out.push(SEP());
out.push(I('Filters, search and view', () => { C.setState({ tags: {}, sts: {}, q: '', viewAs: 'Fleet Commander', tool: 'select', meas: [], multi: [], layers: { rings: true, paths: true, ghosts: true, routes: 'sel', minimap: true }, labels: true, collapsed: {}, diffWith: '', diffDoc: null, view: { z: 1, cx: 720, cy: 500 } }); C.note('Filters and view reset'); }));
out.push(I('Everything in this layout…', () => C.ask('Reset layout', 'Reset every phase, position, route, zone, marker, assignment, seat and name in "' + S.layout + '"? Undo still works.', 'Reset all', () => C.commit(FM.DOC0(), 'Reset everything in ' + S.layout)), { danger: true }));
};

const build = (C, menu, M) => {
const R = rows(C), out = [];
const fn = { ship, wp: route, seg: route, zone, marker, sq, el, anno, mpath, map, reset }[menu.kind];
if (fn) fn(C, menu, M, R, out);
return out;
};

window.FleetMenus = { build };
})();
