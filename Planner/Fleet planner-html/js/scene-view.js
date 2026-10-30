// Fleet Planner mockup: builds everything the orbit map draws, from the planner's props.
// Used by Scene.dc.html: renderVals() returns FleetSceneView.compute(this).
(function () {
'use strict';
const D = window.FleetData, GEO = window.FleetGeo, SC = window.FleetScene;

const json = (v, d) => { try { return JSON.parse(v || '') || d; } catch (e) { return d; } };

const compute = (C) => {
const P = C.props, S = C.state;

// ===== Inputs =====
const tool = P.tool || 'select';
const sel = P.sel;
const dim = String(P.dim || '').split(',');
const spot = String(P.spot || '').split(',').filter(Boolean);
const multi = String(P.multi || '').split(',');
const offs = json(P.offs, {});
const meta = json(P.meta, {});
const zonesIn = json(P.zones, []);
const wpsAll = json(P.wps, {});
const sqn = json(P.sq, {});
const pins = json(P.pins, {});
const markersIn = json(P.markers, []);
const annos = json(P.annos, []);
const arcs = json(P.arcs, {});
const diff = json(P.diff, {});
const lbl = json(P.lbl, {});
const extra = json(P.extra, []);
const G = Object.assign({}, SC.GEO);
const BL = Object.assign({}, SC.BL);
extra.forEach((x) => { G[x.key] = { href: x.href, x: x.cx - x.w / 2, y: x.cy - x.h / 2, w: x.w, h: x.h, behind: false }; BL[x.key] = [x.cx + 16, x.cy - 40]; });
const names = Object.keys(G).filter((n) => meta[n]);
const cur = S.cur;
const W = P.w ?? 1440, H = P.h ?? 900;
// Camera: zoom z around (cx, cy) in map units; the planner owns it, a pan in progress overrides it.
const view = S.pv || json(P.view, { z: 1, cx: 720, cy: 500 });
const vw = 1440 / view.z, vh = 900 / view.z, vx = view.cx - vw / 2, vy = view.cy - vh / 2;
const sc = Math.max(W / vw, H / vh);
const ox = (W - vw * sc) / 2 - vx * sc, oy = (H - vh * sc) / 2 - vy * sc;
const X = (x) => x * sc + ox, Y = (y) => y * sc + oy;
C._view = view;
C._geo = G;

// ===== Positions (plan, drag preview, playback) =====
const off0 = (n) => (cur && cur.name === n) ? [cur.dx, cur.dy] : (offs[n] || [0, 0]);
const ctr0 = (n) => { const g = G[n], o = off0(n); return [g.x + g.w / 2 + o[0], g.y + g.h / 2 + o[1]]; };
const playT = (P.playT === undefined || P.playT === '' || P.playT === null) ? -1 : Number(P.playT);
const playOff = {};
if (playT >= 0) {
Object.keys(wpsAll).forEach((h) => {
if (!G[h] || !(wpsAll[h] || []).length || !meta[h]) return;
const pts = [ctr0(h)].concat(wpsAll[h]);
const p = GEO.along(pts, GEO.toUnits(playT * (meta[h].spd || 150)));
const g = G[h];
playOff[h] = [p[0] - g.x - g.w / 2, p[1] - g.y - g.h / 2];
});
}
const off = (n) => playOff[n] || off0(n);
const ctr = (n) => { const g = G[n], o = off(n); return [g.x + g.w / 2 + o[0], g.y + g.h / 2 + o[1]]; };
const opOf = (n) => (spot.length && spot.indexOf(n) < 0) ? 0.12 : (dim.indexOf(n) >= 0 ? 0.22 : ((meta[n] || {}).lost ? 0.35 : 1));

// ===== Ships and labels =====
const dragTool = ['select', 'move'].indexOf(tool) >= 0;
const shipCur = dragTool ? 'grab' : 'pointer';
const mk = (n) => {
const g = G[n], o = off(n), m = meta[n] || {};
return {
href: g.href, x: g.x, y: g.y, w: g.w, h: g.h, c: m.c || '#9CA3AF', op: opOf(n) * (m.sandbox ? 0.55 : 1),
tr: 'translate(' + o[0] + ' ' + o[1] + ')', cur: shipCur,
down: (e) => C.shipDown(e, n, offs),
enter: () => { if (!C.drag) C.setState({ hover: n }); },
leave: () => { if (C.state.hover === n) C.setState({ hover: null }); },
ctx: (e) => C.ctxOut(e, 'ship', n)
};
};
const shipsBehind = names.filter((n) => G[n].behind).map(mk);
const shipsFront = names.filter((n) => !G[n].behind).map(mk);
const labels = names.map((n) => {
const o = off(n), m = meta[n] || {}, lo = lbl[n] || [0, 0];
return Object.assign({
key: n, l: X(BL[n][0] + o[0] + lo[0]), t: Y(BL[n][1] + o[1] + lo[1]), op: opOf(n),
border: n === sel ? '#FBBF24' : (m.c || '#9CA3AF'), bstyle: m.sandbox ? 'dashed' : 'solid',
cur: dragTool ? 'grab' : 'pointer',
handle: m.label || n, sub: m.sub || '', st: m.st || '#9CA3AF', badge: m.badge || '', bc: m.bc || '#FBBF24', el: m.el || '',
deco: m.lost === 'destroyed' ? 'line-through' : 'none',
down: (e) => C.shipDown(e, n, offs),
enter: () => { if (!C.drag) C.setState({ hover: n }); },
leave: () => { if (C.state.hover === n) C.setState({ hover: null }); },
ctx: (e) => C.ctxOut(e, 'ship', n),
dbl: (e) => { if (e) e.stopPropagation(); C.startEdit('ship', n, m.nick || ''); }
}, C.editor('ship', n));
});
const lostMarks = names.filter((n) => (meta[n] || {}).lost).map((n) => { const c = ctr(n); return { d: 'M' + (c[0] - 12) + ' ' + (c[1] - 12) + 'L' + (c[0] + 12) + ' ' + (c[1] + 12) + 'M' + (c[0] + 12) + ' ' + (c[1] - 12) + 'L' + (c[0] - 12) + ' ' + (c[1] + 12), c: meta[n].lost === 'destroyed' ? '#F05252' : '#FBBF24' }; });

// ===== Squadron rings and labels =====
const rings = Object.keys(D.RINGS).map((k) => { const R = D.RINGS[k]; return { rx: R[0], ry: R[1], tr: 'rotate(' + R[2] + ' 720 500)', c: (sqn[k] || {}).c || D.SQC[k] }; });
const sqLabels = Object.keys(SC.SQ_LABEL).map((k) => {
const mem = names.filter((n) => (meta[n] || {}).sq === k);
let dx = 0, dy = 0;
mem.forEach((n) => { const o = off(n); dx += o[0]; dy += o[1]; });
if (mem.length) { dx /= mem.length; dy /= mem.length; }
const name = (sqn[k] || {}).name || k;
return Object.assign({
l: X(SC.SQ_LABEL[k][0] + dx), t: Y(SC.SQ_LABEL[k][1] + dy), tx: SC.SQ_LABEL[k][2], c: (sqn[k] || {}).c || D.SQC[k], name,
tip: name + ': squadron label. Double-click to rename, right-click for squadron actions.',
dbl: (e) => { if (e) e.stopPropagation(); C.startEdit('sq', k, name); },
ctx: (e) => C.ctxOut(e, 'sq', k)
}, C.editor('sq', k));
});

// ===== Zones =====
const zsel = S.zsel;
const zlist = zonesIn.map((z) => { const zd = S.zdrag && S.zdrag.id === z.id ? S.zdrag : null; return zd ? Object.assign({}, z, { x: zd.x, y: zd.y, w: zd.w, h: zd.h }) : z; });
const zones = zlist.map((z) => ({
x: z.x, y: z.y, w: z.w, h: z.h, c: z.c, fo: z.id === zsel ? 0.12 : 0.06, sw: z.id === zsel ? 2 : 1.4, cur: tool === 'zone' ? 'crosshair' : 'move',
down: (e) => C.zoneDown(e, z, 'move', zonesIn), ctx: (e) => C.ctxOut(e, 'zone', z.id)
}));
const zoneHandles = zlist.filter((z) => z.id === zsel).map((z) => ({ x: z.x + z.w - 6, y: z.y + z.h - 6, c: z.c, down: (e) => C.zoneDown(e, z, 'size', zonesIn) }));
const zoneLabels = zlist.map((z) => Object.assign({
l: X(z.x + 8), t: Y(z.y + 4), c: z.c, name: z.t,
dbl: (e) => { if (e) e.stopPropagation(); C.startEdit('zone', z.id, z.t); },
ctx: (e) => C.ctxOut(e, 'zone', z.id)
}, C.editor('zone', z.id)));

// ===== Routes and waypoints =====
const routes = [], segs = [], wpts = [], wpNums = [];
const hv = S.hover;
Object.keys(wpsAll).forEach((h) => {
const isFree = h.indexOf('free:') === 0;
if (!isFree && (!G[h] || !meta[h])) return;
const isSel = h === sel;
if (!isFree && P.routes !== 'all' && !isSel && h !== hv) return;
let list = wpsAll[h] || [];
if (S.wdrag && S.wdrag.h === h) list = list.map((p, i) => i === S.wdrag.i ? [S.wdrag.x, S.wdrag.y] : p);
if (!list.length) return;
const c = isFree ? '#E5E7EB' : (isSel ? '#FBBF24' : ((meta[h] || {}).c || '#9CA3AF'));
const pts = isFree ? list : [ctr0(h)].concat(list);
const spd = isFree ? 0 : ((meta[h] || {}).spd || 150);
if (pts.length > 1) routes.push({ d: GEO.chev(pts), line: GEO.pathD(pts), c, o: isSel || isFree ? 0.95 : 0.6 });
for (let k = 0; k < pts.length - 1; k++) {
const ins = isFree ? k + 1 : k;
segs.push({ x1: pts[k][0], y1: pts[k][1], x2: pts[k + 1][0], y2: pts[k + 1][1], dbl: (e) => C.segBreak(e, h, ins, wpsAll), ctx: (e) => C.ctxOut(e, 'seg', h + '|' + ins) });
}
let dist = 0;
list.forEach((p, i) => {
const prev = isFree ? (i > 0 ? list[i - 1] : null) : pts[i];
if (prev) dist += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
const on = S.wsel === h + '|' + i;
wpts.push({ x: p[0], y: p[1], c, fill: on ? c : '#05080f',
down: (e) => C.wpDown(e, h, i, wpsAll),
dbl: (e) => { if (e) { e.stopPropagation(); e.preventDefault(); } if (P.onWps) P.onWps(h, (wpsAll[h] || []).filter((q, j) => j !== i), 'Removed waypoint ' + (i + 1)); },
ctx: (e) => C.ctxOut(e, 'wp', h + '|' + i) });
wpNums.push({ l: X(p[0]) - 10, t: Y(p[1]) - 10, n: String(i + 1), tc: on ? '#111827' : c, eta: spd ? '+' + GEO.fmtT(GEO.toKm(dist) * 1000 / spd) : '', ec: c });
});
});

// ===== Planned ghosts =====
const ghostPaths = Object.keys(SC.GHOSTS).filter((n) => G[n]).map((n) => {
const a = ctr(n), g = SC.GHOSTS[n], c = (meta[n] || {}).c || '#9CA3AF';
const L = Math.hypot(g[0] - a[0], g[1] - a[1]) || 1;
const ux = (g[0] - a[0]) / L, uy = (g[1] - a[1]) / L;
return { d: L < 80 ? '' : GEO.chev([[a[0] + ux * 34, a[1] + uy * 34], [g[0] - ux * 32, g[1] - uy * 32]]), c };
});

// ===== Markers =====
const mlist = markersIn.map((m) => {
let x = m.x, y = m.y;
if (S.mdrag && S.mdrag.id === m.id) { x = S.mdrag.x; y = S.mdrag.y; }
if (playT >= 0 && m.path && m.path.length) { const p = GEO.along([[m.x, m.y]].concat(m.path), GEO.toUnits(playT * (m.spd || 180))); x = p[0]; y = p[1]; }
return Object.assign({}, m, { px: x, py: y });
});
const MK = D.MARKERS;
const markers = mlist.map((m) => ({
href: '#mk-' + m.type, x: m.px - 13, y: m.py - 13, c: m.type === 'casualty' ? D.TIER_C[m.tier || 2] : MK[m.type].c,
ring: m.id === S.msel ? '#F9FAFB' : 'transparent', cx: m.px, cy: m.py,
down: (e) => C.markerDown(e, m, markersIn), ctx: (e) => C.ctxOut(e, 'marker', m.id)
}));
const hazards = mlist.filter((m) => m.type === 'hazard').map((m) => ({ cx: m.px, cy: m.py, r: m.r || 60 }));
const threatPaths = mlist.filter((m) => m.path && m.path.length).map((m) => ({ d: GEO.chev([[m.x, m.y]].concat(m.path)), line: GEO.pathD([[m.x, m.y]].concat(m.path)), c: MK[m.type].c }));
const threatPts = [];
mlist.forEach((m) => (m.path || []).forEach((p, i) => threatPts.push({ x: p[0], y: p[1], c: MK[m.type].c, ctx: (e) => C.ctxOut(e, 'mpath', m.id + '|' + i) })));
const markerLabels = mlist.map((m) => Object.assign({
l: X(m.px) + 16, t: Y(m.py) - 9, c: m.type === 'casualty' ? D.TIER_C[m.tier || 2] : MK[m.type].c,
name: m.t + (m.type === 'threat' ? ' · ' + (m.kind || 'Fighters') + ' ' + '▮'.repeat(m.str || 2) : '') + (m.type === 'casualty' ? ' · T' + (m.tier || 2) + (m.ship ? ' → ' + m.ship : ' · unassigned') : ''),
dbl: (e) => { if (e) e.stopPropagation(); C.startEdit('marker', m.id, m.t); },
ctx: (e) => C.ctxOut(e, 'marker', m.id)
}, C.editor('marker', m.id)));
const coverLines = [];
mlist.filter((m) => m.cover).forEach((m) => {
names.filter((n) => (meta[n] || {}).sq === m.cover && !(meta[n] || {}).lost).forEach((n) => {
const c = ctr(n);
const inRange = Math.hypot(c[0] - m.px, c[1] - m.py) <= ((meta[n] || {}).rng || 0);
coverLines.push({ x1: c[0], y1: c[1], x2: m.px, y2: m.py, c: inRange ? '#34D399' : '#F87171', o: inRange ? 0.7 : 0.35 });
});
});

// ===== Weapon arcs =====
const arcCircles = [], arcLabels = [];
Object.keys(arcs).forEach((n) => {
if (!G[n]) return;
const c = ctr(n);
(arcs[n] || []).forEach((a, i) => {
arcCircles.push({ cx: c[0], cy: c[1], r: a.r, c: a.c, dash: a.kind === 'missile' ? '2 6' : '6 5' });
arcLabels.push({ l: X(c[0]) + 4, t: Y(c[1] - a.r) - 14 + i * 0, c: a.c, txt: a.label });
});
});

// ===== Annotations =====
const annoPaths = [], annoCircles = [], annoTexts = [];
const AC = '#FDE68A';
annos.forEach((a) => {
if (a.kind === 'arrow' && a.pts.length > 1) annoPaths.push({ d: GEO.pathD(a.pts) + GEO.arrowHead(a.pts[0], a.pts[a.pts.length - 1]), c: a.c || AC, ctx: (e) => C.ctxOut(e, 'anno', a.id) });
if (a.kind === 'pen' && a.pts.length > 1) annoPaths.push({ d: GEO.pathD(a.pts), c: a.c || AC, ctx: (e) => C.ctxOut(e, 'anno', a.id) });
if (a.kind === 'circle') annoCircles.push({ cx: a.pts[0][0], cy: a.pts[0][1], c: a.c || AC, ctx: (e) => C.ctxOut(e, 'anno', a.id) });
if (a.kind === 'text') annoTexts.push(Object.assign({ l: X(a.pts[0][0]), t: Y(a.pts[0][1]) - 10, c: a.c || AC, name: a.text || 'Note',
dbl: (e) => { if (e) e.stopPropagation(); C.startEdit('anno', a.id, a.text || ''); }, ctx: (e) => C.ctxOut(e, 'anno', a.id) }, C.editor('anno', a.id)));
});
const ad = S.adraw;
const annoDraft = ad && ad.pts.length > 1 ? GEO.pathD(ad.pts) + (ad.kind === 'arrow' ? GEO.arrowHead(ad.pts[0], ad.pts[ad.pts.length - 1]) : '') : '';

// ===== Plan diff ghosts =====
const diffGhosts = [], diffLines = [];
Object.keys(diff).forEach((n) => {
if (!G[n]) return;
const g = G[n], p = diff[n], c = ctr(n);
diffGhosts.push({ href: g.href, x: p[0] - g.w / 2, y: p[1] - g.h / 2, w: g.w, h: g.h, c: (meta[n] || {}).c || '#9CA3AF' });
diffLines.push({ d: GEO.chev([p, c], 12), c: '#E5E7EB' });
});

// ===== Links for the hovered ship =====
const linkLines = [];
if (hv && meta[hv] && G[hv] && !cur) {
const m = meta[hv], a = ctr(hv);
names.forEach((n) => {
if (n === hv || !meta[n] || meta[n].sq !== m.sq) return;
const b = ctr(n);
const isLead = n === m.lead, sameEl = meta[n].el === m.el;
if (isLead || sameEl) linkLines.push({ x1: a[0], y1: a[1], x2: b[0], y2: b[1], c: isLead ? '#FBBF24' : m.c, w: isLead ? 1.6 : 1.1, o: isLead ? 0.85 : 0.55 });
});
}

// ===== Measure, hover card, selection =====
const mp = String(P.meas || '').split(',').filter((n) => G[n]);
let md = 'none', mx1 = 0, my1 = 0, mx2 = 0, my2 = 0, mo = { d: 'none', l: 0, t: 0, txt: '' };
if (mp.length >= 1) { const a = ctr(mp[0]); md = 'inline'; mx1 = mx2 = a[0]; my1 = my2 = a[1]; }
if (mp.length === 2) { const a = ctr(mp[0]), b = ctr(mp[1]); mx2 = b[0]; my2 = b[1]; mo = { d: 'block', l: X((a[0] + b[0]) / 2) - 42, t: Y((a[1] + b[1]) / 2) - 10, txt: GEO.toKm(Math.hypot(a[0] - b[0], a[1] - b[1])).toFixed(2) + ' km' }; }
let ho = { d: 'none', l: 0, t: 0, c: '#9CA3AF', h1: '', h2: '', h3: '', h4: '' };
if (hv && G[hv] && meta[hv] && !cur && !C.drag && !S.edit) {
const c = ctr(hv), m = meta[hv];
ho = { d: 'block', l: X(GEO.clamp(c[0] + 28, 8, 1440 - 240)), t: Y(GEO.clamp(c[1] - 110, 8, 900 - 116)), c: m.c || '#9CA3AF', h1: (m.label || hv) + (m.nick ? '  “' + m.nick + '”' : ''), h2: m.l2 || '', h3: m.l3 || '', h4: m.l4 || '' };
}
let rt = '0 0', rtd = 'none';
if (G[sel] && meta[sel]) { const c = ctr(sel); rt = c[0] + ' ' + c[1]; rtd = 'inline'; }
const multiRings = multi.filter((n) => G[n]).map((n) => { const c = ctr(n); return { x: c[0], y: c[1] }; });
let hld = 'none', hlx = 0, hly = 0;
if (G[P.hl]) { const c = ctr(P.hl); hld = 'inline'; hlx = c[0]; hly = c[1]; }

// ===== Comment pins =====
const pinList = [];
Object.keys(pins).forEach((key) => {
const n = pins[key], ix = key.indexOf(':'), kind = key.slice(0, ix), id = key.slice(ix + 1);
let px = null, py = null;
if (kind === 'ship' && G[id] && BL[id]) { const o = off(id), lo = lbl[id] || [0, 0]; px = X(BL[id][0] + o[0] + lo[0]) - 14; py = Y(BL[id][1] + o[1] + lo[1]) - 12; }
if (kind === 'zone') { const z = zlist.find((q) => q.id === id); if (z) { px = X(z.x + z.w) - 12; py = Y(z.y) - 12; } }
if (kind === 'marker') { const m = mlist.find((q) => q.id === id); if (m) { px = X(m.px) + 8; py = Y(m.py) - 26; } }
if (px === null) return;
pinList.push({ l: px, t: py, n: String(n.n), bg: n.c, click: (e) => { if (e) e.stopPropagation(); if (P.onPin) P.onPin(key, e.clientX, e.clientY); }, stop: (e) => { if (e) e.stopPropagation(); } });
});

// ===== Text layers (declutter) =====
const T = Object.assign({ ships: 'full', arcs: true, notes: true, markers: true, zones: true, squads: true, eta: true, pins: true }, json(P.txt, {}));
const labelsShown = labels.filter((b) => T.ships !== 'off' || b.key === sel || b.key === hv || b.editing).map((b) => Object.assign(b, { two: T.ships === 'full' || b.key === sel || b.editing, badge: T.ships === 'full' ? b.badge : '' }));
const wpShown = wpNums.map((p) => Object.assign(p, { etaD: T.eta && p.eta ? 'inline' : 'none' }));

const zd = S.zd;
return {
w: W, h: H, vb: vx.toFixed(2) + ' ' + vy.toFixed(2) + ' ' + vw.toFixed(2) + ' ' + vh.toFixed(2), wheel: (e) => C.wheel(e),
cursor: S.pv ? 'grabbing' : (['zone', 'rally', 'group', 'marker', 'anno'].indexOf(tool) >= 0 || P.mpath ? 'crosshair' : 'default'),
gd: P.ghosts === 'off' ? 'none' : 'inline', ld: 'block', rd: P.rings === 'off' ? 'none' : 'inline', pd: P.paths === 'off' ? 'none' : 'inline',
shipsBehind, shipsFront, labels: labelsShown, lostMarks, rings, sqLabels: T.squads ? sqLabels : [], zones, zoneHandles, zoneLabels: T.zones ? zoneLabels : [], routes, segs, wpts, wpNums: wpShown, ghostPaths, multiRings,
markers, hazards, threatPaths, threatPts, markerLabels: T.markers ? markerLabels : [], coverLines, arcCircles, arcLabels: T.arcs ? arcLabels : [], annoPaths: T.notes ? annoPaths : [], annoCircles: T.notes ? annoCircles : [], annoTexts: T.notes ? annoTexts : [], annoDraft, diffGhosts, diffLines, linkLines, pinList: T.pins ? pinList : [],
md, mx1, my1, mx2, my2, mo, ho, rt, rtd, hld, hlx, hly,
zdd: zd ? 'inline' : 'none', zdx: zd ? Math.min(zd.x0, zd.x1) : 0, zdy: zd ? Math.min(zd.y0, zd.y1) : 0, zdw: zd ? Math.abs(zd.x1 - zd.x0) : 0, zdh: zd ? Math.abs(zd.y1 - zd.y0) : 0,
mv: (e) => C.move(e), up: (e) => C.release(e), bg: (e) => C.bgDown(e), bgCtx: (e) => C.ctxOut(e, 'map', '')
};
};

window.FleetSceneView = { compute, json };
})();
