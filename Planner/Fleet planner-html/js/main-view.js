// Fleet Planner mockup: turns planner state into the values each part of the page draws.
// compute(C) returns the shell values plus `panel`, `roster` and `ov` objects for the child components.
(function () {
'use strict';
const D = window.FleetData, G = window.FleetGeo, FM = window.FleetModel, ST = window.FleetStore;

const pill = (on, c) => ({ color: on ? (c || '#FBBF24') : '#D1D5DB', border: on ? (c || '#F59E0B') : '#374151', bg: on ? 'rgba(' + G.rgb(c || '#F59E0B') + ',0.16)' : 'transparent' });
const btn = (label, tip, act, o) => Object.assign({ label, tip, act, dis: false, op: 1, color: '#E5E7EB', bg: 'transparent', border: '#4B5563' }, o || {});

// ===== Visibility (View as, search, filters) =====
const visibility = (C, S, M) => {
const q = S.q.trim().toLowerCase();
const tagOn = Object.keys(S.tags).filter((k) => S.tags[k]);
const stsOn = Object.keys(S.sts).filter((k) => S.sts[k]);
const visible = (s) => {
if (S.viewAs === 'Squadron Lead' && s.squad !== 'Lifeline') return false;
if (S.viewAs === 'Element Lead' && !(s.squad === 'Lifeline' && s.el === '1-1')) return false;
if (S.viewAs === 'Pilot' && s.key !== 'Kestrel_7') return false;
if (q && (s.label + ' ' + s.name + ' ' + s.nick + ' ' + s.squad + ' ' + M.sqName(s.squad)).toLowerCase().indexOf(q) < 0) return false;
if (tagOn.length && tagOn.indexOf(s.role) < 0) return false;
if (stsOn.length && stsOn.indexOf(s.status) < 0) return false;
return true;
};
return { visible, tagOn, stsOn, q, filtersOn: tagOn.length > 0 || stsOn.length > 0 || !!q };
};

// ===== Map props for Scene =====
const sceneProps = (C, S, M, V) => {
const meta = {};
M.ships.forEach((s) => {
const L = M.leads[s.squad];
const lead = L[0] === s.key, dep = L[1] === s.key;
meta[s.key] = {
c: M.color(s.squad), sq: s.squad, el: s.squad === 'Command' ? 'CMD' : s.el, st: D.ST[s.status] || '#9CA3AF', nick: s.nick, spd: s.H.scm, rng: G.toUnits(s.rng),
label: s.label, sandbox: s.sandbox, lost: s.lost, lead: L[0], elLead: M.elLead(s.squad, s.el),
badge: s.sandbox && !s.owner ? 'OPEN' : (lead ? 'LEAD' : (dep ? 'DEP' : '')), bc: s.sandbox && !s.owner ? '#A78BFA' : (lead ? '#FBBF24' : '#93C5FD'),
sub: (s.nick ? '“' + s.nick + '”' : s.name) + ' · ' + s.crew,
l2: s.name + ' · crew ' + s.crew + ' · SCM ' + s.H.scm + ' m/s',
l3: M.sqName(s.squad) + (s.squad === 'Command' ? '' : ' · ' + M.elName(s.squad, s.el)) + ' · ' + s.status + (s.lost ? ' · ' + s.lost.toUpperCase() : ''),
l4: s.seats.filter((x) => x.who).map((x) => x.name + ': ' + x.who).slice(0, 4).join(' · ')
};
});
const sq = {};
D.SQ_ORDER.forEach((q) => { sq[q] = { name: M.sqName(q), c: M.color(q) }; });
const extra = M.ships.filter((s) => s.sandbox).map((s) => ({ key: s.key, href: s.H.href, w: 40, h: 24, cx: s.bc[0], cy: s.bc[1] }));
const arcs = {};
M.ships.forEach((s) => {
const on = s.weapons.filter((w) => w.on);
if (on.length) arcs[s.key] = on.map((w) => ({ r: G.toUnits(w.r), c: w.kind === 'missile' ? '#F472B6' : M.color(s.squad), kind: w.kind, label: w.n + ' · ' + (w.r / 1000).toFixed(1) + ' km' }));
});
const pins = {};
const rank = { warn: 3, task: 2, note: 1 };
S.comments.forEach((c) => {
const p = pins[c.key] || { n: 0, r: 0, c: '#9CA3AF' };
p.n++;
if (!c.done && rank[c.type] > p.r) { p.r = rank[c.type]; p.c = D.COMMENT_TYPES[c.type][1]; }
pins[c.key] = p;
});
const diff = {};
if (C.state.diffDoc) {
const o2 = C.state.diffDoc.offs || {};
M.ships.forEach((s) => { const a = S.offs[s.key] || [0, 0], b = o2[s.key] || [0, 0]; if (a[0] !== b[0] || a[1] !== b[1]) diff[s.key] = [s.bc[0] + b[0], s.bc[1] + b[1]]; });
}
const st = C.state;
const play = st.play;
const presSpot = st.pres.on && st.pres.spot ? M.ships.filter((s) => s.squad + '|' + s.el === st.pres.spot).map((s) => s.key).join(',') : '';
return {
ghosts: S.layers.ghosts ? 'on' : 'off', labelsProp: S.labels ? 'on' : 'off', ringsProp: S.layers.rings ? 'on' : 'off', pathsProp: S.layers.paths ? 'on' : 'off', routesProp: S.layers.routes,
dimList: M.ships.filter((s) => !V.visible(s)).map((s) => s.key).join(','), spotStr: presSpot, multiStr: st.multi.join(','), hoverH: st.hoverH, selH: st.sel,
offsJson: JSON.stringify(st.tween || S.offs), metaJson: JSON.stringify(meta), zonesJson: JSON.stringify(S.zones), wpsJson: JSON.stringify(S.wps), sqJson: JSON.stringify(sq),
measStr: st.meas.join(','), toolId: st.tool, snapProp: st.snap ? 'on' : 'off', playProp: (play.on || play.t > 0) ? String(play.t) : '', pinsJson: JSON.stringify(pins),
extraJson: JSON.stringify(extra), markersJson: JSON.stringify(S.markers), annosJson: JSON.stringify(S.annos), arcsJson: JSON.stringify(arcs), diffJson: JSON.stringify(diff),
lblJson: JSON.stringify(S.labelOffs), txtJson: JSON.stringify(st.clean ? { ships: 'off', arcs: false, notes: false, markers: false, zones: false, squads: false, eta: false, pins: false } : st.txt), tidyN: st.tidyN, viewJson: JSON.stringify(st.view), annoMode: st.annoMode, mpathId: st.mpath || ''
};
};

// ===== Toolbars on the map =====
const toolbars = (C, S, M, V) => {
const st = C.state, tool = st.tool;
const tools = D.TOOLS.map(([id, label, d, tip]) => Object.assign({ label, d, tip, on: tool === id ? 'true' : 'false', pick: () => C.setState({ tool: id, meas: [], mpath: null, multi: id === 'group' ? st.multi : [] }) }, pill(tool === id), { border: tool === id ? '#F59E0B' : 'transparent' }));
const roleDefs = [['Fighters', 'single-seat dogfighters'], ['Gunships', 'heavy gunships like the Perseus'], ['Capital', 'capital ships like the Idris'], ['Cargo', 'haulers like the Caterpillar'], ['Exploration', 'scouts and pathfinders'], ['Specialized', 'medical, repair and support ships']];
const roleChips = [Object.assign({ label: 'All', tip: 'All roles: clear the role filter.', on: V.tagOn.length === 0 ? 'true' : 'false', pick: () => C.setState({ tags: {} }) }, pill(V.tagOn.length === 0))].concat(roleDefs.map(([label, t]) => Object.assign({ label, tip: label + ': ' + t + '. Click to add or remove.', on: S.tags[label] ? 'true' : 'false', pick: () => C.setState({ tags: Object.assign({}, S.tags, { [label]: !S.tags[label] }) }) }, pill(!!S.tags[label]))));
const statusChips = Object.keys(D.ST).map((label) => ({ label, color: D.ST[label], on: S.sts[label] ? 'true' : 'false', tip: label + ': ships ' + D.ST_TIP[label] + '. Click to filter.', border: S.sts[label] ? '#F59E0B' : '#374151', bg: S.sts[label] ? 'rgba(245,158,11,0.16)' : 'transparent', pick: () => C.setState({ sts: Object.assign({}, S.sts, { [label]: !S.sts[label] }) }) }));
const persona = { 'Squadron Lead': ' · viewing as Squadron Lead', 'Element Lead': ' · viewing as Element Lead', 'Pilot': ' · viewing as Pilot' }[S.viewAs] || '';
let hint = D.HINTS[tool] + persona;
if (tool === 'measure' && st.meas.length === 1) hint = 'Measure: now click a second ship (from ' + st.meas[0] + ')';
if (tool === 'rally') hint = 'Rally point: click the map to add waypoints for ' + st.sel + ' · double-click a leg to break it';
if (st.mpath) hint = 'Threat path: click the map to add points · Esc when done';
const note = st.note;
let subOn = false, subLabel = '', subChips = [];
if (tool === 'marker') {
subOn = true; subLabel = 'Place';
subChips = Object.keys(D.MARKERS).map((t) => Object.assign({ label: D.MARKERS[t].label, tip: D.MARKERS[t].tip, act: () => C.setState({ markType: t }) }, pill(st.markType === t, D.MARKERS[t].c)));
} else if (tool === 'anno') {
subOn = true; subLabel = 'Draw';
subChips = D.ANNO_MODES.map(([id, label, tip]) => Object.assign({ label, tip: label + ': ' + tip, act: () => C.setState({ annoMode: id }) }, pill(st.annoMode === id, '#FDE68A')));
subChips.push(Object.assign({ label: 'Clear all', tip: 'Clear all annotations in this phase. You can undo.', act: () => C.commit({ annos: [] }, 'Cleared annotations') }, pill(false)));
} else if (st.mpath) {
const m = S.markers.find((q) => q.id === st.mpath);
subOn = true; subLabel = 'Path for ' + (m ? m.t : 'threat');
subChips = [Object.assign({ label: 'Done', tip: 'Stop adding path points.', act: () => C.setState({ mpath: null }) }, pill(true, '#F87171'))];
}
const TX = st.txt;
const txtRows = [['arcs', 'Weapon arc labels', 'The range text on each weapon ring. Rings stay.'], ['notes', 'Notes and drawings', 'Annotation arrows, pen lines, text notes and circles.'], ['markers', 'Marker labels', 'Names next to objectives, threats, hazards and casualties. Icons stay.'], ['zones', 'Zone names', 'Zone titles. The zone outlines stay.'], ['squads', 'Squadron names', 'The big squadron names on the map.'], ['eta', 'Waypoint ETAs', 'The +m:ss times next to waypoints.'], ['pins', 'Comment pins', 'The yellow comment bubbles.']].map(([k, label, tip]) => ({ label, tip: label + ': ' + tip, on: TX[k] ? 'true' : 'false', mark: TX[k] ? '✓' : '', color: TX[k] ? '#F9FAFB' : '#6B7280', act: () => C.setTxt(k, !C.state.txt[k]) }));
const shipModes = [['full', 'Full', 'Handle, ship, crew, element and LEAD/DEP badge.'], ['compact', 'Compact', 'Handle only, one line.'], ['off', 'Off', 'No ship labels. The selected and hovered ship still show theirs.']].map(([id, label, tip]) => Object.assign({ label, tip: 'Ship labels ' + label + ': ' + tip, act: () => C.setTxt('ships', id) }, pill(TX.ships === id)));
const multiOn = st.multi.length > 0;
const groupTargets = D.SQ_ORDER.filter((q) => q !== 'Command').map((q) => ({ label: M.sqName(q), color: M.color(q), tip: 'Move the selected ships into ' + M.sqName(q) + '.', act: () => { const els = M.elsOf(q); C.assignTo(st.multi, q, els[0] || M.newElId(q), st.multi.length + ' ships grouped into ' + M.sqName(q)); C.setState({ multi: [] }); } }));
const maxT = FM.maxRouteTime(S, M);
const play = st.play;
return {
tools, roleChips, statusChips, filtersOn: V.filtersOn, clearFilters: () => C.setState({ tags: {}, sts: {}, q: '' }),
snapColor: st.snap ? '#FBBF24' : '#D1D5DB', snapBorder: st.snap ? '#F59E0B' : 'transparent', snapBg: st.snap ? 'rgba(245,158,11,0.16)' : 'transparent', snapPressed: st.snap ? 'true' : 'false',
toggleSnap: () => { C.setState({ snap: !C.state.snap }); C.note(C.state.snap ? 'Snap off' : 'Snap on: dragged ships lock to their squadron ring'); },
openHelp: () => C.setState({ help: !C.state.help }),
hint: note ? note.text : hint, noteUndo: !!(note && note.undo), hintBorder: note ? '#F59E0B' : '#334155',
subOn, subLabel, subChips, txtRows, shipModes, txtOpen: !!st.txtOpen && !st.clean, clean: st.clean,
cleanLabel: st.clean ? 'Show labels' : 'Hide labels', cleanColor: st.clean ? '#111827' : '#D1D5DB', cleanBg: st.clean ? '#FBBF24' : 'rgba(13,21,34,0.92)', cleanBorder: st.clean ? '#FBBF24' : '#334155',
toggleClean: () => C.toggleClean(), toggleTxt: () => C.setState({ txtOpen: C.state.txtOpen ? null : true, clean: false }),
txtAll: () => C.setState({ txt: { ships: 'full', arcs: true, notes: true, markers: true, zones: true, squads: true, eta: true, pins: true }, clean: false }),
txtNone: () => C.setState({ txt: { ships: 'compact', arcs: false, notes: false, markers: false, zones: false, squads: false, eta: false, pins: false }, clean: false }),
multiOn, multiCount: st.multi.length, groupTargets, clearMulti: () => C.setState({ multi: [] }),
playOn: maxT > 0, playT: play.t.toFixed(1), playMax: maxT.toFixed(1), playTxt: G.fmtT(play.t) + ' / ' + G.fmtT(maxT), playIcon: play.on ? 'M7 5h3v14H7zM14 5h3v14h-3z' : 'M7 5l12 7-12 7z', playLabel: play.on ? 'Pause' : 'Play',
togglePlay: () => C.togglePlay(), stopPlay: () => C.stopPlay(),
seek: (e) => { clearInterval(C._pi); C.setState({ play: Object.assign({}, C.state.play, { on: false, t: Number((e && e.target && e.target.value) || 0) }) }); },
rates: [1, 10, 30].map((r) => ({ label: r + '×', tip: 'Playback speed: ' + r + '× real time.', color: play.rate === r ? '#111827' : '#D1D5DB', bg: play.rate === r ? '#22D3EE' : 'transparent', act: () => C.setState({ play: Object.assign({}, C.state.play, { rate: r }) }) }))
};
};

// ===== Mini-map =====
const minimap = (C, S, M, sceneH) => {
const st = C.state, sz = st.mm.size, w = 180 * sz, h = 112 * sz, k = w / 1440;
const offs = st.tween || S.offs;
const dots = M.ships.map((s) => { const o = offs[s.key] || [0, 0]; return { x: (s.bc[0] + o[0]) * k, y: (s.bc[1] + o[1]) * k, c: M.color(s.squad), r: s.key === st.sel ? 3.5 : 2.2 }; });
const zones = S.zones.map((z) => ({ x: z.x * k, y: z.y * k, w: z.w * k, h: z.h * k, c: z.c }));
const marks = S.markers.map((m) => ({ x: m.x * k, y: m.y * k, c: m.type === 'casualty' ? D.TIER_C[m.tier || 2] : D.MARKERS[m.type].c }));
const v = st.view;
const vw = 1440 / v.z, vh = sceneH / v.z;
return {
mmShow: S.layers.minimap && !st.pres.on, mmOpen: st.mm.open, mmW: w, mmH: h, mmDots: dots, mmZones: zones, mmMarks: marks, mmPX: 720 * k, mmPY: 500 * k, mmPR: 150 * k,
mmVX: (v.cx - vw / 2) * k, mmVY: (v.cy - vh / 2) * k, mmVW: vw * k, mmVH: vh * k,
mmJump: (e) => { const r = e.currentTarget.getBoundingClientRect(); C.setView({ z: C.state.view.z, cx: Math.round((e.clientX - r.left) / r.width * 1440), cy: Math.round((e.clientY - r.top) / r.height * 900) }); },
zoomTxt: Math.round(v.z * 100) + '%', zoomIn: () => C.zoomBy(1.25), zoomOut: () => C.zoomBy(0.8), zoomReset: () => C.resetView(),
mmChev: st.mm.open ? 'M6 9l6 6 6-6' : 'M6 15l6-6 6 6',
mmToggle: () => C.setState({ mm: Object.assign({}, C.state.mm, { open: !C.state.mm.open }) }),
mmSizes: [1, 2].map((n) => ({ label: n + '×', tip: 'Mini-map size ' + n + '×.', color: sz === n ? '#111827' : '#D1D5DB', bg: sz === n ? '#22D3EE' : 'transparent', act: () => C.setState({ mm: { open: true, size: n } }) }))
};
};

// ===== Header (View as, op clock, search) =====
const header = (C, S, M) => {
const st = C.state;
const roleTips = { 'Fleet Commander': 'sees and edits the whole fleet', 'Squadron Lead': 'sees their squadron (Medic in this demo)', 'Element Lead': 'sees their element (1-1 in this demo)', 'Pilot': 'sees only their own ship (Kestrel_7 in this demo)', 'Logistics': 'manages ships, seats and supplies' };
const roles = Object.keys(roleTips).map((label) => Object.assign({ label, on: S.viewAs === label ? 'true' : 'false', tip: 'View as ' + label + ': ' + roleTips[label] + '.', pick: () => C.setState({ viewAs: label }) }, pill(S.viewAs === label), { color: S.viewAs === label ? '#FBBF24' : '#9CA3AF' }));
const now = new Date(), hh = FM.hHour(S);
const diff = Math.round((now - hh) / 1000);
const ad = Math.abs(diff);
const rel = (diff < 0 ? 'H-' : 'H+') + (ad >= 3600 ? Math.floor(ad / 3600) + ':' + String(Math.floor(ad % 3600 / 60)).padStart(2, '0') + ':' + String(ad % 60).padStart(2, '0') : G.fmtT(ad));
const ph = D.PHASES[S.phase][0];
const next = S.phase + 1 < D.PHASES.length ? FM.phaseStart(S, S.phase + 1) : null;
return {
roles, q: S.q, onSearch: (e) => C.setState({ q: (e && e.target && e.target.value) || '' }),
clockMain: rel + ' · ' + ph, clockSub: G.hhmm(now, true) + ' UTC · ' + G.hhmm(now, false) + ' local',
clockTip: 'Op clock: H-hour is ' + S.opclock.hh + ' UTC. ' + (next ? D.PHASES[S.phase + 1][0] + ' starts ' + G.hhmm(next, true) + ' UTC (' + G.hhmm(next, false) + ' local).' : 'Last phase.') + ' Click to set times.',
openClock: (e) => { const r = e.currentTarget.getBoundingClientRect(); const a = C.toLocal(r.left, r.bottom); C.setState({ clockOpen: { x: a[0], y: a[1] + 6 } }); }
};
};

// ===== Bottom bar =====
const bottom = (C, S) => {
const st = C.state;
const views = [['Orbit', 'Orbit camera: angled view around Crusader. This is the view drawn in the mockup.'], ['Top', 'Top camera: straight-down plan view (3D service).'], ['Free', 'Free camera: fly around the fleet (3D service).']].map(([label, tip], i) => ({ label, tip, color: i === 0 ? '#111827' : '#D1D5DB', bg: i === 0 ? '#F59E0B' : 'transparent', pick: () => { if (i) C.note(label + ' camera is part of the 3D service; the mockup shows Orbit'); } }));
const modes = [['Plan', 'plan', 'Plan mode: change things freely. Nothing reaches players until you commit.'], ['Live', 'live', 'Live mode: each change asks before it applies, then notifies owners and leads.']].map(([label, id, tip]) => ({ label, tip, color: S.mode === id ? '#111827' : '#D1D5DB', bg: S.mode === id ? '#F59E0B' : 'transparent', pick: () => { if (S.mode !== id) C.setState({ mode: id, log: [{ t: C.now(), text: 'Switched to ' + label + ' mode', mode: id, phase: S.phase }].concat(st.log).slice(0, 60) }); } }));
const hist = st.hist, fut = st.fut;
return {
views, modes, layout: st.layout, layoutsOpenStr: st.layoutsOpen ? 'true' : 'false',
openLayouts: (e) => { if (C.state.layoutsOpen) { C.setState({ layoutsOpen: null }); return; } const r = e.currentTarget.getBoundingClientRect(); const a = C.toLocal(r.left, r.top); C.setState({ layoutsOpen: { x: a[0], y: a[1] - (40 + C.state.layouts.length * 30 + 50) - 6 }, menu: null, tip: null }); },
undo: () => C.undo(), redo: () => C.redo(),
undoColor: hist.length ? '#F9FAFB' : '#4B5563', redoColor: fut.length ? '#F9FAFB' : '#4B5563',
undoTip: hist.length ? 'Undo: ' + hist[hist.length - 1].label + ' (Ctrl+Z).' : 'Undo: nothing to undo yet.',
redoTip: fut.length ? 'Redo: ' + fut[fut.length - 1].label + ' (Ctrl+Y).' : 'Redo: nothing to redo.',
openReset: (e) => C.anchorMenu(e, 'reset'),
isPlan: S.mode === 'plan', isLive: S.mode === 'live',
saveNow: () => { C.saveAll(); C.setState({ saved: true }); setTimeout(() => C.setState({ saved: false }), 1800); }, saveLabel: st.saved ? 'Saved' : 'Save',
openSummary: () => C.setState({ summary: true, menu: null }),
startPres: () => C.setState({ pres: Object.assign({}, C.state.pres, { on: true }), menu: null })
};
};

// ===== Everything =====
const compute = (C) => {
const st = C.state;
const S = C.eff();
const M = FM.build(S);
const V = visibility(C, S, M);
const F = C.fitVals();
const pres = st.pres.on;
const open = st.open && !pres;
const sceneTop = pres ? 0 : 56;
const sceneH = pres ? 900 : (open ? 548 : 804);
const out = Object.assign({
booted: true,
vw: st.vw, vh: st.vh, fit: F.fit, fx: F.fx, fy: F.fy,
over: (e) => C.overTip(e), rootKey: (e) => C.rootKey(e), laserMove: (e) => C.laserMove(e),
notPres: !pres, presOn: pres, sceneTop, sceneH,
panelOpen: st.panelOpen && !pres, panelClosed: !st.panelOpen && !pres, panelH: sceneH - 24,
panelToggle: () => C.setState({ panelOpen: !C.state.panelOpen }),
dockTop: 56 + sceneH, dockH: 900 - 56 - sceneH
}, sceneProps(C, S, M, V), toolbars(C, S, M, V), minimap(C, S, M, sceneH), header(C, S, M), bottom(C, S), C.sceneHandlers(M));
out.panel = window.FleetPanelView.compute(C, S, M, V);
out.roster = window.FleetPanelView.roster(C, S, M, V, open);
out.ov = window.FleetOverlayView.compute(C, S, M);
return out;
};

window.FleetMainView = { compute, pill, btn };
})();
