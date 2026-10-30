// Fleet Planner mockup: values for floating layers (Overlays.dc.html):
// menus, popovers, dialogs, the briefing card, ship cards, tooltips and presenter mode.
(function () {
'use strict';
const D = window.FleetData, G = window.FleetGeo, FM = window.FleetModel, ST = window.FleetStore;
const pill = (on, c) => ({ color: on ? '#111827' : (c || '#D1D5DB'), border: c || '#374151', bg: on ? (c || '#F59E0B') : 'transparent' });

// ===== Context and reset menus =====
const menu = (C, M) => {
const m = C.state.menu;
if (!m) return { menuOn: false, menuItems: [], menuX: 0, menuY: 0 };
const items = window.FleetMenus.build(C, m, M);
let est = 10;
items.forEach((r) => { est += r.isHead ? 22 : (r.isSep ? 9 : (r.isChips ? 28 * Math.ceil(r.chips.length / 4) + 6 : 28)); });
let y = m.up ? m.y - est - 6 : m.y;
y = Math.max(8, Math.min(900 - est - 8, y));
return { menuOn: true, menuItems: items, menuX: Math.max(8, Math.min(1440 - 298, m.x)), menuY: y };
};

// ===== Saved layouts popover =====
const layouts = (C) => {
const st = C.state, lp = st.layoutsOpen;
return {
layoutsOpen: !!lp, lpX: lp ? lp.x : 0, lpY: lp ? lp.y : 0,
layoutRows: st.layouts.map((l) => Object.assign({ name: l, color: l === st.layout ? '#FBBF24' : '#E5E7EB', bg: l === st.layout ? 'rgba(245,158,11,0.12)' : 'transparent', dot: l === st.layout ? '#FBBF24' : '#4B5563',
pick: () => { if (l !== st.layout) { C.saveAll(); C.load(l); C.note('Opened layout ' + l); } } }, C.editor('layout:' + l, l))),
newLayout: () => { let n = 1; while (st.layouts.indexOf('New layout ' + n) >= 0) n++; const name = 'New layout ' + n; const list = st.layouts.concat([name]); ST.saveLayouts(list); C.saveAll(); C.setState({ layouts: list }); C.load(name); C.note('Created ' + name + '. Double-click it to rename.'); },
dupLayout: () => { let name = st.layout + ' copy', n = 2; while (st.layouts.indexOf(name) >= 0) { name = st.layout + ' copy ' + n; n++; } const list = st.layouts.concat([name]); ST.saveLayouts(list); C.persist(Object.assign(FM.docOf(st), { log: st.log }), name); C.setState({ layouts: list }); C.load(name); C.note('Duplicated into ' + name); },
delLayout: () => {
if (st.layouts.length <= 1) { C.note('Keep at least one layout'); return; }
const name = st.layout;
C.ask('Delete layout', 'Delete "' + name + '" and everything in it? This can\'t be undone.', 'Delete', () => { ST.removeDoc(name); const list = C.state.layouts.filter((l) => l !== name); ST.saveLayouts(list); C.setState({ layouts: list }); C.load(list[0]); C.note('Deleted layout ' + name); });
}
};
};

// ===== Comments popover =====
const comments = (C, S, M) => {
const cp = C.state.cpop;
if (!cp) return { cpOn: false, cpList: [], cpTypes: [], cpAssignees: [], cpDues: [] };
const list = S.comments.filter((c) => c.key === cp.key);
const set = (patch) => C.setState({ cpop: Object.assign({}, C.state.cpop, patch) });
return {
cpOn: true, cpX: G.clamp(cp.x, 8, 1440 - 348), cpY: G.clamp(cp.y, 8, 900 - (230 + list.length * 58 + (cp.type === 'task' ? 70 : 0))), cpTitle: 'Comments · ' + C.targetName(cp.key),
cpEmpty: list.length === 0,
cpList: list.map((c) => ({
by: c.by, t: c.t, text: c.text, type: D.COMMENT_TYPES[c.type][0], tc: D.COMMENT_TYPES[c.type][1],
meta: c.type === 'task' ? ((c.assignee ? '→ ' + c.assignee : 'unassigned') + (c.due !== '' && c.due !== undefined ? ' · before ' + D.PHASES[c.due][0] : '')) : '',
isTask: c.type === 'task', doneLabel: c.done ? '✓ Done' : 'Mark done', doneC: c.done ? '#31C48D' : '#9CA3AF', deco: c.done ? 'line-through' : 'none',
done: () => C.toggleDone(c.id), resolve: () => C.resolveComment(c.id)
})),
cpTypes: Object.keys(D.COMMENT_TYPES).map((k) => Object.assign({ label: D.COMMENT_TYPES[k][0], tip: { note: 'Note: information for other staff.', task: 'Task: something to do, with an owner and a due phase.', warn: 'Warning: a risk. Also listed under Needs attention.' }[k], act: () => set({ type: k }) }, pill(cp.type === k, D.COMMENT_TYPES[k][1]))),
cpIsTask: cp.type === 'task',
cpAssignees: [Object.assign({ label: 'Nobody', act: () => set({ assignee: '' }) }, pill(!cp.assignee, '#9CA3AF'))].concat(M.members.slice(0, 18).map((m) => Object.assign({ label: m.h, act: () => set({ assignee: m.h }) }, pill(cp.assignee === m.h, '#FBBF24')))),
cpDues: [Object.assign({ label: 'Any time', act: () => set({ due: '' }) }, pill(cp.due === '', '#9CA3AF'))].concat(D.PHASES.map(([l], i) => Object.assign({ label: 'Before ' + l, act: () => set({ due: i }) }, pill(cp.due === i, '#60A5FA')))),
cpDraft: cp.draft,
cpChg: (e) => set({ draft: (e && e.target && e.target.value) || '' }),
cpKey: (e) => { if (e) e.stopPropagation(); if (e && e.key === 'Enter') C.postComment(); if (e && e.key === 'Escape') C.setState({ cpop: null }); },
cpPost: () => C.postComment(), cpClose: () => C.setState({ cpop: null })
};
};

// ===== Op clock popover =====
const clock = (C, S) => {
const co = C.state.clockOpen;
if (!co) return { clockOn: false, clockRows: [] };
return {
clockOn: true, clockX: G.clamp(co.x, 8, 1440 - 330), clockY: co.y, hh: S.opclock.hh,
hhChg: (e) => { const v = (e && e.target && e.target.value) || '20:00'; C.commit({ opclock: Object.assign({}, C.state.opclock, { hh: v }) }, 'H-hour set to ' + v + ' UTC', { merge: true }); },
clockRows: D.PHASES.map(([l], i) => {
const d = FM.phaseStart(S, i);
return { label: l, mins: String(S.opclock.mins[i] || 0), time: G.hhmm(d, true) + ' UTC · ' + G.hhmm(d, false) + ' local', lock: i === 0,
chg: (e) => { const mins = S.opclock.mins.slice(); mins[i] = parseInt((e && e.target && e.target.value) || '0', 10) || 0; C.commit({ opclock: Object.assign({}, C.state.opclock, { mins }) }, l + ' at H+' + mins[i] + 'm', { merge: true }); } };
}),
clockClose: () => C.setState({ clockOpen: null })
};
};

// ===== Briefing card =====
const briefing = (C, S, M) => {
const b = C.state.briefing;
if (!b) return { briefOn: false };
const text = window.FleetBriefing.element(S, M, b.q, b.el);
return {
briefOn: true, briefTitle: 'Briefing · ' + M.elName(b.q, b.el), briefText: text,
briefCopy: () => ST.copyText(text).then((ok) => C.note(ok ? 'Briefing copied. Paste it into Discord.' : 'Copy blocked here: select the text and copy it')),
briefClose: () => C.setState({ briefing: null })
};
};

// ===== Ship card (wiki stats) =====
const shipCard = (C, S) => {
const sc = C.state.shipCard;
if (!sc) return { cardOn: false, cardGuns: [] };
const H = FM.hullStats(S, sc.hull);
return {
cardOn: true, cardX: G.clamp(sc.x, 8, 1440 - 290), cardY: G.clamp(sc.y, 8, 900 - 280), cardName: sc.hull, cardRole: H.wiki, cardHref: H.href,
cardStats: [['SCM', H.scm + ' m/s'], ['Seats', H.seats.length + ' (needs ' + H.req + ')'], ['Med beds', H.beds.length ? H.beds.map((b) => b.n + '× ' + (b.t ? 'T' + b.t : 'bed')).join(', ') : '—'], ['Cargo', H.cargo], ['H₂ / QT fuel', H.h2 + ' / ' + H.qf], ['Quantum range', H.qt]].map(([k, v]) => ({ k, v })),
cardGuns: H.guns.map((g) => ({ t: g.q + '× S' + g.s + ' ' + g.n, r: (g.r / 1000).toFixed(1) + ' km' })).concat(H.missiles.map((g) => ({ t: g.q + '× S' + g.s + ' ' + g.n + ' missile', r: (g.r / 1000).toFixed(0) + ' km lock' })))
};
};

// ===== Commit summary (whole op, per-phase breakdown) =====
const summary = (C, S, M) => {
if (!C.state.summary) return { summary: false, changes: [], phaseRows: [] };
const nm = S.names;
const n = (o) => Object.keys(o || {}).length;
const phaseDocs = D.PHASES.map((p, i) => i === S.phase ? FM.phasedOf(S) : (S.phaseData[i] || null));
const phaseRows = D.PHASES.map(([l], i) => {
const d = phaseDocs[i];
if (!d) return { label: l, txt: 'Same as previous phase', c: '#6B7280' };
const wp = Object.keys(d.wps || {}).reduce((a, k) => a + d.wps[k].length, 0);
return { label: l, txt: n(d.offs) + ' moved · ' + wp + ' waypoints · ' + (d.zones || []).length + ' zones · ' + (d.markers || []).length + ' markers', c: i === S.phase ? '#FBBF24' : '#D1D5DB' };
});
const touched = {};
[S.offs, S.assign, S.status, S.wps, S.losses].forEach((o) => Object.keys(o).forEach((k) => { if (M.byK[k]) touched[k] = 1; }));
const changes = [
{ color: '#A78BFA', text: 'Ships reassigned', n: n(S.assign) },
{ color: '#F87171', text: 'Status changes and losses', n: n(S.status) + n(S.losses) },
{ color: '#93C5FD', text: 'Lead changes', n: n(S.leads) + n(S.elLeads) },
{ color: '#34D399', text: 'Seat changes', n: n(S.seatOv) },
{ color: '#E5E7EB', text: 'Renames, nicknames, colours', n: (nm.fleet ? 1 : 0) + n(nm.sq) + n(nm.el) + n(nm.ship) + n(S.colors) },
{ color: '#FBBF24', text: 'Open tasks and warnings', n: S.comments.filter((c) => c.type !== 'note' && !c.done).length },
{ color: '#FB923C', text: 'Owners and leads to notify', n: n(touched) }
];
const notReady = M.ships.filter((s) => s.readyN < 4 && s.lost !== 'destroyed').length;
return {
summary: true, changes, phaseRows, sumLayout: C.state.layout,
sumWarn: notReady ? notReady + ' ships are not fully ready. You can still go live.' : 'Every ship passed the readiness check.', sumWarnC: notReady ? '#FBBF24' : '#31C48D',
closeSummary: () => C.setState({ summary: false }),
confirmSummary: () => { C.setState({ summary: false, mode: 'live', log: [{ t: C.now(), text: 'Plan committed and pushed live', mode: 'live', phase: S.phase }].concat(C.state.log).slice(0, 60) }); C.note('Plan is live. Owners and leads have been messaged.'); }
};
};

// ===== Confirm, help, tooltip =====
const misc = (C) => {
const st = C.state, cf = st.confirm, tip = st.tip;
const tipParts = tip ? (() => { const i = tip.text.indexOf(': '); return i > 0 && i < 44 ? [tip.text.slice(0, i + 2), tip.text.slice(i + 2)] : ['', tip.text]; })() : ['', ''];
const SHORTCUTS = [
['1 – 9, 0', 'Tools: Select, Reposition, Group, Rally, Marker, Annotate, Measure, Zone, Commander, Loadout'],
['Arrow keys', 'Nudge the selected ship (Shift for bigger steps)'],
['Delete', 'Remove the selected waypoint, zone or marker'],
['Mouse wheel', 'Zoom in or out where you point'], ['Drag empty map', 'Pan (or hold the middle mouse button anywhere)'], ['+ / − / Home', 'Zoom in, zoom out, reset the view'],
['H', 'Hide or show all map labels in one go'],
['S', 'Snap to squadron rings'], ['T', 'Tidy overlapping labels'], ['Space', 'Play or pause route playback'],
['C', 'Comment on the selected ship'], ['P', 'Presenter mode (← → change phase, L laser, N notes, Esc exit)'], ['[', 'Hide or show the right panel'],
['Ctrl+Z / Ctrl+Y', 'Undo / redo'], ['Esc', 'Close menus, stop path drawing, clear group selection'],
['Right-click', 'Actions for ships, waypoints, legs, zones, markers, notes, squadrons, elements, map'],
['Double-click', 'Rename names, zones and markers; edit notes; break a route leg; delete a waypoint'],
['Shift + box drag', 'Add to the group selection (Group tool)']
].map(([k, d]) => ({ k, d }));
return {
confirmOn: !!cf, confirmTitle: cf ? cf.title : '', confirmText: cf ? cf.text : '', confirmOk: cf ? cf.ok : '', confirmAltOn: !!(cf && cf.alt), confirmAlt: cf ? (cf.alt || '') : '',
confirmYes: () => { const fn = C._confirmFn; C._confirmFn = null; C._confirmAlt = null; C.setState({ confirm: null, pending: null }); if (fn) fn(); },
confirmNo: () => { C._confirmFn = null; C._confirmAlt = null; C.setState({ confirm: null, pending: null }); },
confirmAltAct: () => { const fn = C._confirmAlt; C._confirmFn = null; C._confirmAlt = null; C.setState({ confirm: null, pending: null }); if (fn) fn(); },
helpOn: st.help, shortcuts: SHORTCUTS, closeHelp: () => C.setState({ help: false }),
tipOn: !!tip, tipX: tip ? tip.x : 0, tipY: tip ? tip.y : 0, tipTitle: tipParts[0], tipBody: tipParts[1]
};
};

// ===== Presenter mode =====
const presenter = (C, S, M) => {
const p = C.state.pres;
if (!p.on) return { presOn: false, presSpots: [] };
const i = S.phase;
const d = FM.phaseStart(S, i);
const els = [];
D.SQ_ORDER.forEach((q) => M.elsOf(q).forEach((el) => els.push([q, el])));
const notes = S.phaseNotes[i] || '';
return {
presOn: true, presPhase: D.PHASES[i][0], presStep: (i + 1) + ' / ' + D.PHASES.length, presWhen: G.hhmm(d, true) + ' UTC · ' + G.hhmm(d, false) + ' local · H+' + (S.opclock.mins[i] || 0) + 'm',
presDesc: D.PHASES[i][1], presNotesOn: p.notes, presNotes: notes, presNotesTxt: notes || 'No speaker notes for this phase yet.',
presNotesChg: (e) => C.commit({ phaseNotes: Object.assign({}, C.state.phaseNotes, { [i]: (e && e.target && e.target.value) || '' }) }, 'Speaker notes for ' + D.PHASES[i][0], { merge: true }),
presPrev: () => C.presStep(-1), presNext: () => C.presStep(1),
presPrevOp: i > 0 ? 1 : 0.35, presNextOp: i < D.PHASES.length - 1 ? 1 : 0.35,
presLaser: p.laser ? 'Laser on' : 'Laser', presLaserBg: p.laser ? '#F05252' : 'transparent', presLaserC: p.laser ? '#111827' : '#FCA5A5',
toggleLaser: () => C.setState({ pres: Object.assign({}, C.state.pres, { laser: !C.state.pres.laser }), laser: null }),
toggleNotes: () => C.setState({ pres: Object.assign({}, C.state.pres, { notes: !C.state.pres.notes }) }),
presSpots: [Object.assign({ label: 'All', act: () => C.setState({ pres: Object.assign({}, C.state.pres, { spot: '' }) }) }, pill(!p.spot, '#9CA3AF'))].concat(els.filter(([q]) => q !== 'Command').map(([q, el]) => Object.assign({ label: el, tip: 'Spotlight ' + M.elName(q, el) + ' in ' + M.sqName(q) + '; everything else dims.', act: () => C.setState({ pres: Object.assign({}, C.state.pres, { spot: C.state.pres.spot === q + '|' + el ? '' : q + '|' + el }) }) }, pill(p.spot === q + '|' + el, M.color(q))))),
presExit: () => C.setState({ pres: { on: false, laser: false, spot: '', notes: p.notes }, laser: null }),
laserOn: !!(p.laser && C.state.laser), laserX: C.state.laser ? C.state.laser[0] - 7 : 0, laserY: C.state.laser ? C.state.laser[1] - 7 : 0
};
};

const compute = (C, S, M) => Object.assign({}, menu(C, M), layouts(C), comments(C, S, M), clock(C, S), briefing(C, S, M), shipCard(C, S), summary(C, S, M), misc(C), presenter(C, S, M));

window.FleetOverlayView = { compute };
})();
