// Fleet Planner mockup: values for the right-hand panel (RightPanel.dc.html) and the roster dock (Roster.dc.html).
(function () {
'use strict';
const D = window.FleetData, G = window.FleetGeo, FM = window.FleetModel;
const pill = (on, c) => ({ color: on ? (c || '#FBBF24') : '#D1D5DB', border: on ? (c || '#F59E0B') : '#374151', bg: on ? 'rgba(' + G.rgb(c || '#F59E0B') + ',0.16)' : 'transparent' });
const btn = (label, tip, act, o) => Object.assign({ label, tip, act, dis: false, op: 1, color: '#E5E7EB', bg: 'transparent', border: '#4B5563' }, o || {});
const sum = (list) => { let a = 0, b = 0; list.forEach((s) => { a += s.crewA; b += s.crewB; }); return [a, b]; };

// ===== Tabs =====
const TABS = [
['fleet', 'Fleet', 'Fleet: squadrons, elements and ships. Rename, collapse and reorganise.'],
['ship', 'Ship', 'Ship: the selected ship\'s status, readiness, weapons, fuel and route.'],
['seats', 'Seats', 'Seats: who sits where, seat matching and roll call.'],
['ready', 'Status', 'Status: readiness, the op schedule and the change history.'],
['triage', 'Triage', 'Triage: medical beds, casualties and who is flying to them.'],
['layers', 'Layers', 'Layers: map layers, colours, zones, markers and plan compare.'],
['notify', 'Notify', 'Notify: which changes send direct messages.'],
['add', 'Add', 'Add: put open ships into the fleet from the catalog.']
];

// ===== Fleet tree =====
const tree = (C, S, M, V) => {
const st = C.state;
const pick = (h) => C.setState({ sel: h });
const base = { op: 1, bg: 'transparent', st: 'transparent', enter: () => {}, leave: () => {}, ctx: (e) => { if (e) e.preventDefault(); }, pick: () => {} };
const out = [];
out.push(Object.assign({}, base, C.editor('fleet', M.fleetName), { pad: 8, dot: '#F59E0B', title: M.fleetName, right: 'Cmdr: ' + (M.leads.Command[0] || '—'), weight: 600, color: '#F9FAFB', tip: 'Fleet: double-click to rename.' }));
D.SQ_ORDER.forEach((q) => {
const coll = !!S.collapsed[q];
const mem = M.inSq(q);
out.push(Object.assign({}, base, C.editor('sq:' + q, M.sqName(q)), {
pad: 20, dot: M.color(q), title: (coll ? '▸ ' : '▾ ') + M.sqName(q), right: 'Lead: ' + (M.leads[q][0] || '—'), weight: 600, color: '#F9FAFB',
tip: M.sqName(q) + ': click to collapse, double-click to rename, right-click for lead, colour and formations.',
pick: () => C.setState({ collapsed: Object.assign({}, st.collapsed, { [q]: !coll }) }), ctx: (e) => C.ctxFrom(e, 'sq', q)
}));
if (coll) return;
M.elsOf(q).forEach((el) => {
if (q !== 'Command') {
out.push(Object.assign({}, base, C.editor('el:' + q + '|' + el, M.elName(q, el)), {
pad: 34, dot: M.color(q), title: M.elName(q, el), right: 'Lead: ' + (M.elLead(q, el) || '—'), weight: 600, color: '#E5E7EB',
tip: M.elName(q, el) + ': double-click to rename, right-click for briefing card, lead and formations.', ctx: (e) => C.ctxFrom(e, 'el', q + '|' + el)
}));
}
mem.filter((s) => s.el === el).forEach((s) => {
const isSel = s.key === st.sel;
out.push(Object.assign({}, base, { editing: false, show: true, draft: '', chg: () => {}, kd: () => {}, blur: () => {}, dbl: () => { C.setState({ sel: s.key, tab: 'ship' }); C.startEdit('ship:' + s.key, s.nick); } }, {
pad: 48, dot: isSel ? '#FBBF24' : M.color(q), title: M.title(s) + (s.lost ? ' · ' + s.lost : ''), right: s.label + ' · ' + s.crew, weight: isSel ? 600 : 400, color: isSel ? '#FBBF24' : (s.lost ? '#6B7280' : '#D1D5DB'),
bg: isSel ? 'rgba(245,158,11,0.14)' : 'transparent', op: V.visible(s) ? 1 : 0.35, st: D.ST[s.status],
tip: s.label + ' · ' + s.name + ': click to select, double-click for a nickname, right-click for actions.',
pick: () => pick(s.key), ctx: (e) => C.ctxFrom(e, 'ship', s.key),
enter: () => C.setState({ hoverH: s.key }), leave: () => C.setState({ hoverH: '' })
}));
});
});
});
return out;
};

// ===== Ship tab =====
const shipTab = (C, S, M) => {
const st = C.state;
const s = M.byK[st.sel] || M.byK.Kestrel_7;
const q = s.squad;
const moved = S.offs[s.key];
const route = S.wps[s.key] || [];
const isL = M.leads[q][0] === s.key, isD = M.leads[q][1] === s.key, isE = M.elLead(q, s.el) === s.key;
const rkm = route.length ? G.toKm(G.polyLen([[s.cx, s.cy]].concat(route))) : 0;
const fuelUse = s.H.h2km ? Math.min(100, rkm / s.H.h2km * 100) : 0;
const comments = S.comments.filter((c) => c.key === 'ship:' + s.key);
const checks = [['crewed', 'Crewed', 'Crewed: at least ' + s.H.req + ' of ' + s.crewB + ' seats filled. Worked out from the Seats tab.', true], ['fuel', 'Fuelled', 'Fuelled: hydrogen and quantum tanks topped up. Tick when confirmed.'], ['load', 'Loaded', 'Loaded: ammo, missiles and med or cargo supplies aboard. Tick when confirmed.'], ['pos', 'In position', 'In position: at its planned slot or route start. Tick when confirmed.']];
const ed = C.editor('ship:' + s.key, s.nick);
return {
title: M.title(s), color: M.color(q), href: s.H.href, owner: s.label,
sub: M.sqName(q) + (q === 'Command' ? '' : ' · ' + M.elName(q, s.el)) + ' · ' + (s.owner ? 'Owner ' + s.owner : 'Open slot, unclaimed') + (s.lost ? ' · ' + s.lost.toUpperCase() : ''),
ed,
stChips: Object.keys(D.ST).map((k) => ({ label: k, on: s.status === k ? 'true' : 'false', tip: 'Set status to ' + k + ': ' + D.ST_TIP[k] + '.', color: s.status === k ? '#111827' : D.ST[k], border: D.ST[k], bg: s.status === k ? D.ST[k] : 'transparent', act: () => C.setStatus(s.key, k) })),
readyTxt: s.readyN + ' / 4 ready', readyColor: s.readyN === 4 ? '#31C48D' : (s.readyN >= 2 ? '#FBBF24' : '#F05252'),
checks: checks.map(([k, label, tip, auto]) => ({ label: (s.ready[k] ? '✓ ' : '') + label, tip, color: s.ready[k] ? '#111827' : '#D1D5DB', bg: s.ready[k] ? '#31C48D' : 'transparent', border: s.ready[k] ? '#31C48D' : '#4B5563', act: () => { if (auto) { C.setState({ tab: 'seats' }); C.note('Crewed comes from the seats; fill seats in the Seats tab'); } else C.toggleReady(s.key, k); } })),
facts: [
{ k: 'Owner', v: s.owner || 'Open slot' }, { k: 'Role (wiki)', v: s.H.wiki }, { k: 'Crew', v: s.crew + ' (needs ' + s.H.req + ')' },
{ k: 'Medical beds', v: s.H.beds.length ? s.H.beds.map((b) => b.n + '× ' + (b.t ? 'T' + b.t : 'bed')).join(', ') : '—' }, { k: 'Cargo', v: s.H.cargo },
{ k: 'SCM speed', v: s.H.scm + ' m/s' }, { k: 'Quantum range', v: s.H.qt },
{ k: 'Position', v: moved ? 'Moved ' + moved[0] + ', ' + moved[1] : 'Default slot' },
{ k: 'Route', v: route.length ? route.length + ' pts · ' + rkm.toFixed(1) + ' km · ETA ' + G.fmtT(FM.routeTime(s, route)) : 'None' }
],
weapons: s.weapons.map((w) => ({ label: (w.on ? '◉ ' : '○ ') + w.q + '× S' + w.s + ' ' + w.n, sub: (w.kind === 'missile' ? 'lock ' : '') + (w.r / 1000).toFixed(2) + ' km', tip: (w.kind === 'missile' ? 'Missile: max lock range ' : 'Gun: range ') + w.r.toLocaleString() + ' m (wiki). Click to show its ring on the map.', color: w.on ? (w.kind === 'missile' ? '#F472B6' : M.color(q)) : '#9CA3AF', act: () => C.toggleArc(s.key, w.kind, w.i) })),
noWeapons: s.weapons.length === 0,
arcsAll: () => C.setArcs(s.key, true), arcsNone: () => C.setArcs(s.key, false),
fuel: [
{ label: 'Hydrogen fuel', val: String(s.H.h2), field: 'h2', tip: 'Hydrogen capacity from the wiki. Type to override.' },
{ label: 'Quantum fuel', val: String(s.H.qf), field: 'qf', tip: 'Quantum fuel capacity from the wiki. Type to override.' },
{ label: 'H₂ range (km, est.)', val: String(s.H.h2km), field: 'h2km', tip: 'Estimated distance on a full hydrogen tank. The wiki has no burn rate, so set your own.' }
].map((f) => Object.assign(f, { chg: (e) => C.setStat(s.hull, f.field, e && e.target && e.target.value) })),
fuelAfter: route.length ? 'Route uses about ' + fuelUse.toFixed(1) + '% hydrogen · ' + (100 - fuelUse).toFixed(1) + '% left' : 'No route: full tank',
fuelPct: 100 - fuelUse, fuelColor: fuelUse > 75 ? '#F05252' : (fuelUse > 40 ? '#FBBF24' : '#31C48D'),
leadBtns: s.owner ? [
btn(isE ? 'Element lead ✓' : 'Element lead', 'Make element lead: runs ' + M.elName(q, s.el) + '.', () => C.setElLead(q, s.el, s.key), isE ? { color: '#111827', bg: '#F59E0B', border: '#F59E0B' } : {}),
btn(isL ? 'Squad lead ✓' : 'Squad lead', 'Make squadron lead: runs ' + M.sqName(q) + '.', () => C.setLead(q, 0, s.key), isL ? { color: '#111827', bg: '#FBBF24', border: '#FBBF24' } : {}),
btn(isD ? 'Deputy ✓' : 'Deputy', 'Make deputy: takes over ' + M.sqName(q) + ' if the lead drops.', () => C.setLead(q, 1, s.key), isD ? { color: '#111827', bg: '#93C5FD', border: '#93C5FD' } : {})
] : [],
posBtns: [
btn('Reset position', 'Reset position: back to its default slot.', () => C.resetPos(s.key), { dis: !moved, op: moved ? 1 : 0.4 }),
btn('Add waypoints', 'Add waypoints: switch to the rally tool for this ship.', () => C.setState({ tool: 'rally' })),
btn('Clear route', 'Clear route: remove every waypoint for this ship.', () => C.setWps(s.key, [], 'Cleared route for ' + s.label), { dis: !route.length, op: route.length ? 1 : 0.4 }),
btn('Snap to ring', 'Snap to ring: move onto its squadron\'s orbit band.', () => C.snapShips([s.key], 'Snapped ' + s.label + ' to its ring'))
],
lossOn: S.mode === 'live' || !!s.lost,
lossBtns: [
btn(s.lost === 'destroyed' ? 'Destroyed ✓' : 'Mark destroyed', 'Destroyed: crew go to the reassign list and a casualty is raised at the wreck.', () => C.markLoss(s.key, 'destroyed'), { color: '#FCA5A5', border: 'rgba(240,82,82,0.6)' }),
btn(s.lost === 'disabled' ? 'Disabled ✓' : 'Mark disabled', 'Disabled: out of action, crew stay aboard.', () => C.markLoss(s.key, 'disabled'), { color: '#FDE68A', border: 'rgba(251,191,36,0.6)' }),
btn('Clear loss', 'Clear the loss mark.', () => C.clearLoss(s.key), { dis: !s.lost, op: s.lost ? 1 : 0.4 })
],
commentLabel: comments.length ? 'Comments (' + comments.length + ')' : 'Add comment, task or warning',
shipComments: (e) => { const r = e.currentTarget.getBoundingClientRect(); const a = C.toLocal(r.left, r.top); C.openComments('ship:' + s.key, a[0] - 330, a[1] - 60); },
sandboxOn: s.sandbox,
claimChips: s.sandbox ? M.unseated.slice(0, 10).map((m) => Object.assign({ label: m.h, tip: 'Give this open ship to ' + m.h + ' (prefers ' + m.prefs.join(', ') + ').', act: () => C.claimSandbox(s.key, m.h) }, pill(s.owner === m.h, '#A78BFA'))) : [],
removeOpen: () => C.removeSandbox(s.key)
};
};

// ===== Seats tab =====
const seatsTab = (C, S, M) => {
const st = C.state;
const t = sum(M.ships);
const seatBars = D.SQ_ORDER.map((q) => { const x = sum(M.inSq(q)); return { name: M.sqName(q), val: x[0] + '/' + x[1], pct: x[1] ? Math.round(x[0] / x[1] * 100) : 0, color: M.color(q) }; });
const ships = M.ships.filter((s) => s.lost !== 'destroyed').map((s) => {
const open = s.seats.filter((x) => !x.who);
const shown = s.seats.filter((x) => x.who).concat(open.slice(0, 4));
return {
color: M.color(s.squad), label: s.label, title: M.title(s), crew: s.crew, box: G.box(M.color(s.squad)),
more: open.length > 4 ? '+' + (open.length - 4) + ' more open seats' : '', hasMore: open.length > 4,
seats: shown.map((x) => {
const sugg = x.who ? [] : M.suggest(x.role).slice(0, 3);
return {
name: x.name, who: x.who || 'Open', whoColor: x.who ? '#F9FAFB' : '#FBBF24', isOpen: !x.who, filled: !!x.who,
sugg: sugg.map((m) => ({ label: m.h + (m.att ? ' · ' + m.att : ''), tip: m.h + ' prefers ' + m.prefs.join(' and ') + '. Click to seat them here.', act: () => C.seatMember(s.key, x.i, m.h) })),
noSugg: !x.who && !sugg.length,
clear: () => C.seatMember(s.key, x.i, '')
};
})
};
});
const displaced = S.displaced.filter((h) => !M.seatOf[h]).map((h) => {
const m = M.members.find((q) => q.h === h) || { prefs: [] };
const opts = [];
M.ships.forEach((s) => s.seats.forEach((x) => { if (!x.who && s.lost !== 'destroyed' && m.prefs.indexOf(x.role) >= 0 && opts.length < 3) opts.push({ label: s.label + ' · ' + x.name, act: () => C.seatMember(s.key, x.i, h), tip: 'Seat ' + h + ' here.' }); }));
return { h, prefs: m.prefs.join(', '), opts };
});
const att = M.members.map((m) => ({
h: m.h, prefs: m.prefs.join(' · '), seat: m.seat ? M.byK[m.seat.ship].label + ' · ' + m.seat.name : 'Unseated',
isLate: m.att === 'late', late: m.late, lateChg: (e) => C.setLate(m.h, (e && e.target && e.target.value) || ''),
chips: D.ATTEND.map(([id, label, c]) => ({ label, tip: label + ': ' + { yes: 'coming', maybe: 'not sure yet', late: 'coming late; set how late', no: 'not coming' }[id] + '.', color: m.att === id ? '#111827' : c, border: c, bg: m.att === id ? c : 'transparent', act: () => C.setAtt(m.h, id) }))
}));
const cnt = {}; D.ATTEND.forEach(([id]) => { cnt[id] = M.members.filter((m) => m.att === id).length; });
return {
crewTotal: t[0] + ' / ' + t[1], seatBars, seatShips: ships, displaced, hasDisplaced: displaced.length > 0, att,
attSummary: 'Yes ' + cnt.yes + ' · Maybe ' + cnt.maybe + ' · Late ' + cnt.late + ' · No ' + cnt.no + ' · No answer ' + (M.members.length - cnt.yes - cnt.maybe - cnt.late - cnt.no)
};
};

// ===== Status tab =====
const statusTab = (C, S, M) => {
const st = C.state;
const total = M.ships.length;
const counts = {};
Object.keys(D.ST).forEach((k) => { counts[k] = M.ships.filter((s) => s.status === k).length; });
const maxC = Math.max(1, ...Object.values(counts));
const status = Object.keys(D.ST).map((label) => ({ label, n: counts[label], color: D.ST[label], pct: counts[label] / total * 100, bar: counts[label] / maxC * 100, bg: S.sts[label] ? 'rgba(245,158,11,0.12)' : 'transparent', tip: label + ': ' + counts[label] + ' ships ' + D.ST_TIP[label] + '. Click to filter.', pick: () => C.setState({ sts: Object.assign({}, S.sts, { [label]: !S.sts[label] }) }) }));
const notReady = M.ships.filter((s) => s.readyN < 4 && s.lost !== 'destroyed');
const missing = (s) => ['crewed', 'fuel', 'load', 'pos'].filter((k) => !s.ready[k]).map((k) => ({ crewed: 'crew', fuel: 'fuel', load: 'loadout', pos: 'position' }[k])).join(', ');
const attention = M.ships.filter((s) => s.status === 'Refitting' || s.status === 'RTB' || s.status === 'Mustering' || s.lost).map((s) => ({ dot: s.lost ? '#F05252' : D.ST[s.status], text: s.label + ' · ' + s.name + ' · ' + (s.lost || s.status), pick: () => C.setState({ sel: s.key, tab: 'ship' }) }));
D.SQ_ORDER.forEach((q) => { if (!M.leads[q][0]) attention.push({ dot: '#F87171', text: M.sqName(q) + ' has no lead', pick: () => C.setState({ tab: 'fleet' }) }); });
S.comments.filter((c) => c.type === 'warn' && !c.done).forEach((c) => attention.push({ dot: '#F05252', text: 'Warning: ' + c.text + ' (' + C.targetName(c.key) + ')', pick: () => {} }));
S.markers.filter((m) => m.type === 'casualty' && !m.ship).forEach((m) => attention.push({ dot: D.TIER_C[m.tier || 2], text: m.t + ' T' + (m.tier || 2) + ' has no medical ship', pick: () => C.setState({ tab: 'triage' }) }));
const schedule = D.PHASES.map(([label], i) => {
const d = FM.phaseStart(S, i);
return { label, on: i === S.phase, color: i === S.phase ? '#FBBF24' : '#D1D5DB', time: G.hhmm(d, true) + ' UTC · ' + G.hhmm(d, false) + ' local', rel: 'H+' + (S.opclock.mins[i] || 0) + 'm', pick: () => C.setPhase(i) };
});
const hist = st.hist.map((h, i) => ({ i, t: h.t || '', text: h.label, act: () => C.jumpTo(i), tip: 'Jump back to just before this change. Later changes move to Redo.' })).reverse().slice(0, 25);
return {
readyN: (total - notReady.length) + ' / ' + total, readyAll: notReady.length === 0, readyColor: notReady.length === 0 ? '#31C48D' : '#F05252',
readyHead: notReady.length === 0 ? 'Fleet ready' : notReady.length + ' ships not ready',
notReady: notReady.map((s) => ({ text: s.label + ' · missing ' + missing(s), pick: () => C.setState({ sel: s.key, tab: 'ship' }) })),
status, readyText: (counts.Ready + counts.Active) + ' / ' + total, attention, schedule,
histRows: hist, noHist: hist.length === 0,
resolvedRows: S.resolved.slice(0, 12).map((c) => ({ text: '[' + D.COMMENT_TYPES[c.type][0] + '] ' + c.text, sub: c.target + ' · resolved ' + c.resolvedAt })), noResolved: S.resolved.length === 0
};
};

// ===== Triage tab =====
const triageTab = (C, S, M) => {
const cas = S.markers.filter((m) => m.type === 'casualty');
const beds = M.medShips.map((s) => {
const all = M.bedsOf(s);
const used = cas.filter((m) => m.ship === s.key).length;
return { label: s.label, title: M.title(s), color: M.color(s.squad), beds: all.length ? all.reduce((a, t) => { a['T' + t] = (a['T' + t] || 0) + 1; return a; }, {}) : {}, used, total: all.length, pct: all.length ? used / all.length * 100 : 0 };
}).map((b) => Object.assign(b, { bedTxt: Object.keys(b.beds).map((k) => b.beds[k] + '× ' + k).join(' · '), useTxt: b.used + ' / ' + b.total + ' in use' }));
const best = Math.min.apply(null, M.medShips.reduce((a, s) => a.concat(M.bedsOf(s)), [9]));
const rows = cas.map((m) => {
const s = m.ship ? M.byK[m.ship] : null;
const eta = s ? FM.routeTime(s, [[m.x, m.y]]) : 0;
return {
t: m.t, tier: 'T' + (m.tier || 2), tc: D.TIER_C[m.tier || 2], ship: s ? s.label + ' · ' + s.name : 'No ship with a free bed', shipC: s ? '#E5E7EB' : '#F87171',
eta: s ? 'ETA ' + G.fmtT(eta) + ' at SCM' : '', warn: (m.tier || 2) < best ? 'Needs a T' + m.tier + ' bed; best in fleet is T' + best : '',
hasWarn: (m.tier || 2) < best,
tiers: [1, 2, 3].map((t) => ({ label: 'T' + t, tip: 'Set tier T' + t + ' (T1 most serious). Reassigns the nearest suitable ship.', color: m.tier === t ? '#111827' : D.TIER_C[t], border: D.TIER_C[t], bg: m.tier === t ? D.TIER_C[t] : 'transparent', act: () => C.updateMarker(m.id, { tier: t }, m.t + ' set to T' + t) })),
recover: () => C.deleteMarker(m.id)
};
});
return {
medName: M.sqName('Lifeline'), beds, casualties: rows, noCas: rows.length === 0,
addCas: () => C.setState({ tool: 'marker', markType: 'casualty' })
};
};

// ===== Layers tab =====
const layersTab = (C, S, M) => {
const st = C.state;
const tips = {
Asteroids: 'Asteroids: the Yela belt, drawn at 60% so ships behind stay visible.', 'Gas clouds': 'Gas clouds: low-visibility areas.', Moons: 'Moons: Cellin, Daymar and Yela for orientation.',
'Squad rings': 'Squad rings: each squadron\'s orbit band in its colour.', Handles: 'Handles: the labels next to ships.', 'Orbit paths': 'Orbit paths: direction of travel around Crusader.', 'Planned ghosts': 'Planned ghosts: faded ships showing planned positions.', 'All routes': 'All routes: every ship\'s waypoints, not just the selected ship\'s.', 'Mini-map': 'Mini-map: overview in the bottom-left corner.',
'Launch point': 'Launch point: Port Olisar (RIP).', 'Launch path': 'Launch path: route from the station into orbit.',
'Low visibility': 'Low visibility: fog toward the edges.', 'Sensor range': 'Sensor range ring.', 'Obstructions 60%': 'Obstructions: things in front of ships drawn at 60%.'
};
const LAY = { 'Squad rings': 'rings', 'Orbit paths': 'paths', 'Planned ghosts': 'ghosts', 'Mini-map': 'minimap' };
const gr = (name, color, opts) => ({
name, color, box: G.box(color),
opts: opts.map(([label, on]) => {
let fn = () => C.note(label + ' is always shown in this mockup');
if (label === 'Handles') fn = () => C.setTxt('ships', C.state.txt.ships === 'off' ? 'full' : 'off');
else if (LAY[label]) fn = () => C.setState({ layers: Object.assign({}, C.state.layers, { [LAY[label]]: !C.state.layers[LAY[label]] }) });
else if (label === 'All routes') fn = () => C.setState({ layers: Object.assign({}, C.state.layers, { routes: C.state.layers.routes === 'all' ? 'sel' : 'all' }) });
return { label, on: on ? 'true' : 'false', tip: tips[label] || label, color: on ? color : '#9CA3AF', border: on ? 'rgba(' + G.rgb(color) + ',0.6)' : '#374151', bg: on ? 'rgba(' + G.rgb(color) + ',0.14)' : 'transparent', pick: fn };
})
});
const groups = [
gr('Terrain', '#34D399', [['Asteroids', 1], ['Gas clouds', 1], ['Moons', 1]]),
gr('Fleet', '#22D3EE', [['Squad rings', S.layers.rings], ['Handles', C.state.txt.ships !== 'off' && !C.state.clean], ['Orbit paths', S.layers.paths], ['Planned ghosts', S.layers.ghosts], ['All routes', S.layers.routes === 'all'], ['Mini-map', S.layers.minimap]]),
gr('Stations', '#A78BFA', [['Launch point', 1], ['Launch path', 1]]),
gr('Display', '#FB923C', [['Low visibility', 1], ['Sensor range', 1], ['Obstructions 60%', 1]])
];
const colors = D.SQ_ORDER.map((q) => ({ name: M.sqName(q), c: M.color(q), sw: D.PALETTE.map((c) => ({ c, ring: M.color(q) === c ? '#F9FAFB' : 'transparent', tip: 'Use this colour for ' + M.sqName(q) + '.', act: () => C.setColor(q, c) })) }));
const zoneRows = S.zones.map((z) => Object.assign({ c: z.c, name: z.t, ctx: (e) => C.ctxFrom(e, 'zone', z.id), del: () => C.commit({ zones: C.state.zones.filter((q) => q.id !== z.id) }, 'Deleted ' + z.t) }, C.editor('zone:' + z.id, z.t)));
const markerRows = S.markers.map((m) => ({ c: m.type === 'casualty' ? D.TIER_C[m.tier || 2] : D.MARKERS[m.type].c, name: m.t, type: D.MARKERS[m.type].label + (m.cover ? ' · covered by ' + M.sqName(m.cover) : '') + ((m.path || []).length ? ' · moves' : ''), ctx: (e) => C.ctxFrom(e, 'marker', m.id), del: () => C.deleteMarker(m.id) }));
const others = st.layouts.filter((l) => l !== st.layout);
const diffRows = [];
if (st.diffDoc) {
const d = st.diffDoc;
M.ships.forEach((s) => { const a = S.offs[s.key] || [0, 0], b = (d.offs || {})[s.key] || [0, 0]; if (a[0] !== b[0] || a[1] !== b[1]) diffRows.push({ c: '#22D3EE', text: s.label + ' is ' + G.toKm(Math.hypot(a[0] - b[0], a[1] - b[1])).toFixed(1) + ' km from its spot in ' + st.diffWith }); });
M.ships.forEach((s) => { const a = (d.assign || {})[s.key]; const sa = S.assign[s.key]; if (JSON.stringify(a || null) !== JSON.stringify(sa || null)) diffRows.push({ c: '#A78BFA', text: s.label + ' is in a different element' }); });
if ((d.zones || []).length !== S.zones.length) diffRows.push({ c: '#FBBF24', text: 'Zones: ' + S.zones.length + ' here vs ' + (d.zones || []).length });
if ((d.markers || []).length !== S.markers.length) diffRows.push({ c: '#F87171', text: 'Markers: ' + S.markers.length + ' here vs ' + (d.markers || []).length });
}
return {
groups, colors, zoneRows, noZones: S.zones.length === 0, markerRows, noMarkers: S.markers.length === 0, annoCount: S.annos.length + ' annotation' + (S.annos.length === 1 ? '' : 's'),
zoneTool: () => C.setState({ tool: 'zone' }), markerTool: () => C.setState({ tool: 'marker' }), annoTool: () => C.setState({ tool: 'anno' }), clearAnnos: () => C.commit({ annos: [] }, 'Cleared annotations'),
tidy: () => C.setState({ tidyN: C.state.tidyN + 1 }),
diffChips: [Object.assign({ label: 'Off', tip: 'Stop comparing.', act: () => C.setDiff('') }, pill(!st.diffWith))].concat(others.map((l) => Object.assign({ label: l, tip: 'Overlay ' + l + ' as faded ghosts with arrows to where ships are now.', act: () => C.setDiff(l) }, pill(st.diffWith === l, '#22D3EE')))),
diffRows, diffOn: !!st.diffDoc, diffNone: !!st.diffDoc && diffRows.length === 0
};
};

// ===== Notify and Add tabs =====
const notifyTab = (C) => {
const st = C.state;
const rules = [['Assigned to an element', 1], ['Status changes', 1], ['Rally point set', 1], ['Seat opened', 0]].map(([label, on]) => ({ label, on: on ? 'true' : 'false', track: on ? '#F59E0B' : '#4B5563', knob: on ? 16 : 2 }));
const tplDefs = [['Assigned', 'You are assigned to Element 1-1, Medic, aboard Apollo Medivac. Confirm your seat when ready.'], ['Move to staging', 'Move to staging and confirm when your seats are filled.'], ['Seat opened', 'A seat is open on your ship. Reply to fill it.'], ['Status check', 'Please confirm your current status.']];
return { rules, templates: tplDefs.map(([label], i) => Object.assign({ label, on: st.tpl === i ? 'true' : 'false', pick: () => C.setState({ tpl: i }) }, pill(st.tpl === i))), dm: tplDefs[st.tpl][1] };
};
const addTab = (C, S, M) => {
const st = C.state;
const p = st.addEl.split('|');
const els = [];
D.SQ_ORDER.filter((q) => q !== 'Command').forEach((q) => M.elsOf(q).forEach((el) => els.push({ v: q + '|' + el, label: M.elName(q, el) + ' · ' + M.sqName(q) })));
const catalog = Object.keys(D.HULLS).map((n) => {
const H = D.HULLS[n];
return { name: n, role: H.wiki, seats: H.seats.length + ' seat' + (H.seats.length > 1 ? 's' : ''), href: H.href,
add: () => C.addSandbox(n, p[0], p[1]),
cardOn: (e) => { const r = e.currentTarget.getBoundingClientRect(); const a = C.toLocal(r.left, r.top); C.setState({ shipCard: { hull: n, x: a[0] - 300, y: a[1] } }); },
cardOff: () => C.setState({ shipCard: null }) };
});
return {
catalog, els: els.map((e) => ({ v: e.v, label: e.label, sel: e.v === st.addEl })), addEl: st.addEl, addElChg: (e) => C.setState({ addEl: (e && e.target && e.target.value) || st.addEl }),
openShips: M.ships.filter((s) => s.sandbox).map((s) => ({ label: s.owner ? s.owner + ' (claimed)' : 'Open', hull: s.name + ' · ' + M.sqName(s.squad) + ' ' + s.el, pick: () => C.setState({ sel: s.key, tab: 'ship' }), remove: () => C.removeSandbox(s.key) })),
noOpen: !M.ships.some((s) => s.sandbox), count: M.ships.length + ' / 50'
};
};

// ===== Right panel =====
const compute = (C, S, M, V) => {
const st = C.state;
const tabs = TABS.map(([id, label, tip]) => Object.assign({ label, tip, on: st.tab === id ? 'true' : 'false', pick: () => C.setState({ tab: id }) }, { color: st.tab === id ? '#FBBF24' : '#9CA3AF', border: st.tab === id ? '#F59E0B' : 'transparent', bg: st.tab === id ? 'rgba(245,158,11,0.16)' : 'transparent' }));
const is = {};
TABS.forEach(([id]) => { is['is_' + id] = st.tab === id; });
return Object.assign({
tabs, collapse: () => C.setState({ panelOpen: false }), shipCount: M.ships.length,
tree: st.tab === 'fleet' ? tree(C, S, M, V) : [],
cur: shipTab(C, S, M)
}, is, seatsTab(C, S, M), statusTab(C, S, M), triageTab(C, S, M), layersTab(C, S, M), notifyTab(C), addTab(C, S, M));
};

// ===== Roster dock =====
const roster = (C, S, M, V, open) => {
const st = C.state;
const t = sum(M.ships);
const total = M.ships.length;
const counts = {};
Object.keys(D.ST).forEach((k) => { counts[k] = M.ships.filter((s) => s.status === k).length; });
const status = Object.keys(D.ST).map((label) => ({ color: D.ST[label], pct: counts[label] / total * 100 }));
const phases = D.PHASES.map(([label, txt], i) => {
const d = FM.phaseStart(S, i);
return { label, tip: label + ': ' + txt + '. Starts ' + G.hhmm(d, true) + ' UTC (' + G.hhmm(d, false) + ' local). Each phase keeps its own positions, routes, zones and markers.', color: i === S.phase ? '#FBBF24' : (i < S.phase ? '#31C48D' : '#9CA3AF'), border: i === S.phase ? '#F59E0B' : (i < S.phase ? 'rgba(49,196,141,0.5)' : '#374151'), bg: i === S.phase ? 'rgba(245,158,11,0.16)' : 'transparent', pick: () => C.setPhase(i) };
});
const cols = D.SQ_ORDER.map((q) => {
const ships = M.inSq(q);
const x = sum(ships);
const els = M.elsOf(q);
const L = M.leads[q];
return {
name: M.sqName(q), color: M.color(q), box: G.box(M.color(q)),
ed: C.editor('rsq:' + q, M.sqName(q)),
tip: M.sqName(q) + ': double-click to rename, right-click for lead, colour and formations.',
ctx: (e) => C.ctxFrom(e, 'sq', q),
lead: L[0] || '—', leadShip: L[0] ? M.title(M.byK[L[0]]) : '', deputy: L[1] || '—', deputyShip: L[1] ? M.title(M.byK[L[1]]) : '',
leadPick: () => { if (L[0]) C.setState({ sel: L[0], tab: 'ship' }); }, depPick: () => { if (L[1]) C.setState({ sel: L[1], tab: 'ship' }); },
seats: x[0] + '/' + x[1], pct: x[1] ? Math.round(x[0] / x[1] * 100) : 0,
over: (e) => { if (e && e.preventDefault) e.preventDefault(); },
drop: (e) => C.dropOn(q, els[0] || M.newElId(q), e),
dropNew: (e) => C.dropOn(q, null, e),
showNew: !!st.dragging && q !== 'Command',
els: els.map((el) => {
const inEl = ships.filter((s) => s.el === el);
const et = sum(inEl);
const lead = M.elLead(q, el);
const dk = q + '|' + el;
return {
ed: C.editor('rel:' + dk, M.elName(q, el)),
tip: M.elName(q, el) + ': double-click to rename, right-click for briefing card, lead and formations. Drop ships here to join.',
ctx: (e) => C.ctxFrom(e, 'el', dk),
brief: () => C.setState({ briefing: { q, el } }), briefOn: q !== 'Command',
outline: st.dropKey === dk ? M.color(q) : 'transparent',
over: (e) => { if (e && e.preventDefault) e.preventDefault(); if (C.state.dropKey !== dk) C.setState({ dropKey: dk }); },
drop: (e) => C.dropOn(q, el, e),
label: M.elName(q, el) + ' · Crew ' + et[0] + '/' + et[1] + (lead ? ' · Lead ' + lead : ' · No lead'),
color: lead ? '#9CA3AF' : '#FBBF24',
ships: inEl.map((s) => ({
href: s.H.href, name: s.nick ? '“' + s.nick + '”' : s.name, crew: s.crew, handle: s.label, st: s.lost ? '#6B7280' : D.ST[s.status],
deco: s.lost === 'destroyed' ? 'line-through' : 'none', bstyle: s.sandbox ? 'dashed' : 'solid',
tip: s.label + ' · ' + s.name + ' · ' + s.status + (s.lost ? ' · ' + s.lost : '') + '. Drag to another element, double-click for a nickname, right-click for actions. Hover the hull for wiki stats.',
op: V.visible(s) ? (s.lost ? 0.5 : 1) : 0.28,
bg: s.key === st.sel ? 'rgba(245,158,11,0.14)' : (s.key === st.hoverH ? 'rgba(34,211,238,0.1)' : 'rgba(17,24,39,0.8)'),
border: s.key === st.sel ? '#F59E0B' : (st.multi.indexOf(s.key) >= 0 ? '#A78BFA' : '#374151'),
ed: C.editor('rship:' + s.key, s.nick),
pick: () => C.setState({ sel: s.key }),
ctx: (e) => C.ctxFrom(e, 'ship', s.key),
enter: () => C.setState({ hoverH: s.key }),
leave: () => C.setState({ hoverH: '' }),
cardOn: (e) => { const r = e.currentTarget.getBoundingClientRect(); const a = C.toLocal(r.left, r.top); C.setState({ shipCard: { hull: s.name, x: a[0], y: a[1] - 250 } }); },
cardOff: () => C.setState({ shipCard: null }),
drag: (e) => { C.dragH = s.key; try { e.dataTransfer.setData('text/plain', s.key); e.dataTransfer.effectAllowed = 'move'; } catch (err) {} setTimeout(() => C.setState({ dragging: s.key, tip: null }), 0); },
dragEnd: () => C.setState({ dragging: null, dropKey: '' })
}))
};
})
};
});
return {
rosterOpen: open ? 'true' : 'false', showCols: open, dockPad: open ? '10px 16px' : '4px 16px', chev: open ? 'M6 9l6 6 6-6' : 'M6 15l6-6 6 6',
toggleRoster: () => C.setState({ open: !C.state.open }),
fleetName: M.fleetName, phases, status, readyText: (counts.Ready + counts.Active) + ' / ' + total, crewText: t[0] + ' / ' + t[1], shipCount: total, cols
};
};

window.FleetPanelView = { compute, roster };
})();
