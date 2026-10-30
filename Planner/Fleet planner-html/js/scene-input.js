// Fleet Planner mockup: pointer, edit and tidy behaviour for the orbit map.
// Mixed into the Scene component's prototype; every change is reported to the planner by callback.
(function () {
'use strict';
const GEO = window.FleetGeo, D = window.FleetData;
const json = (v, d) => { try { return JSON.parse(v || '') || d; } catch (e) { return d; } };

const SceneInput = {

// ===== Lifecycle: focus inline editors, run label tidy =====
componentDidUpdate(prev) {
const ed = this.state.edit;
if (ed) {
const k = ed.kind + ':' + ed.id;
if (this._fk !== k) { this._fk = k; try { const el = document.querySelector('[data-sedit="1"]'); if (el) { el.focus(); el.select(); } } catch (e) {} }
} else this._fk = null;
if (prev && this.props.tidy && this.props.tidy !== prev.tidy) this.tidy();
},

// ===== Coordinates =====
svgOf(e) {
const t = e.currentTarget;
if (t && t.getAttribute && t.getAttribute('data-map')) return t;
if (t && t.ownerSVGElement) return t.ownerSVGElement;
const root = t && t.closest ? t.closest('[data-scene]') : null;
return root ? root.querySelector('svg[data-map]') : null;
},
pt(svg, e) {
const p = svg.createSVGPoint();
p.x = e.clientX; p.y = e.clientY;
return p.matrixTransform(svg.getScreenCTM().inverse());
},
capture(svg, e) { try { svg.setPointerCapture(e.pointerId); } catch (err) {} },

// ===== Context menu and inline editing =====
ctxOut(e, kind, id) {
if (e && e.preventDefault) e.preventDefault();
if (e && e.stopPropagation) e.stopPropagation();
const svg = this.svgOf(e);
let x = 0, y = 0;
if (svg) { const s = this.pt(svg, e); x = Math.round(s.x); y = Math.round(s.y); }
if (this.props.onCtx) this.props.onCtx(kind, id, e.clientX, e.clientY, x, y);
},
startEdit(kind, id, draft) { this.setState({ edit: { kind, id, draft: draft || '' }, hover: null }); },
editor(kind, id) {
const ed = this.state.edit;
const on = !!(ed && ed.kind === kind && ed.id === id);
return {
editing: on, show: !on, draft: on ? ed.draft : '',
chg: (e) => this.setState({ edit: Object.assign({}, this.state.edit, { draft: (e && e.target && e.target.value) || '' }) }),
kd: (e) => { if (e) e.stopPropagation(); if (e && e.key === 'Enter') this.finishEdit(true); if (e && e.key === 'Escape') this.finishEdit(false); },
blur: () => this.finishEdit(true),
stop: (e) => { if (e) e.stopPropagation(); }
};
},
finishEdit(save) {
const ed = this.state.edit;
if (!ed) return;
this.setState({ edit: null });
if (save && this.props.onRename) this.props.onRename(ed.kind, ed.id, ed.draft.trim());
},

// ===== Camera: wheel zoom toward the cursor, drag empty space (or middle button) to pan =====
wheel(e) {
const svg = this.svgOf(e);
if (!svg || !svg.getScreenCTM || !this.props.onView) return;
const v = this._view || { z: 1, cx: 720, cy: 500 };
const p = this.pt(svg, e);
const z = GEO.clamp(v.z * (e.deltaY < 0 ? 1.15 : 1 / 1.15), 0.5, 4);
if (z === v.z) return;
const k = v.z / z;
this.props.onView({ z: Math.round(z * 1000) / 1000, cx: Math.round(p.x + (v.cx - p.x) * k), cy: Math.round(p.y + (v.cy - p.y) * k) });
},
startPan(e, svg) {
this.capture(svg, e);
const v = this._view || { z: 1, cx: 720, cy: 500 };
this.drag = { type: 'pan', svg, cx: e.clientX, cy: e.clientY, v, k: svg.getScreenCTM().a || 1, moved: false };
},

// ===== Pointer down on empty map =====
bgDown(e) {
if (e.button === 1) { const s1 = this.svgOf(e); if (s1 && s1.getScreenCTM) { e.preventDefault(); this.startPan(e, s1); } return; }
if (e.button !== 0) return;
const svg = this.svgOf(e);
if (!svg || !svg.getScreenCTM) return;
const s = this.pt(svg, e);
const P = this.props, tool = P.tool;
if (this.state.edit) this.finishEdit(true);
const x = Math.round(s.x), y = Math.round(s.y);
if (P.mpath) { if (P.onMapClick) P.onMapClick('mpath', x, y); return; }
if (tool === 'zone' || tool === 'group') {
this.capture(svg, e);
this.drag = { type: tool === 'zone' ? 'draw' : 'box', svg, x0: s.x, y0: s.y, add: !!e.shiftKey };
this.setState({ zd: { x0: s.x, y0: s.y, x1: s.x, y1: s.y }, zsel: null });
} else if (tool === 'anno' && (P.annoMode === 'arrow' || P.annoMode === 'pen')) {
this.capture(svg, e);
this.drag = { type: 'anno', svg, kind: P.annoMode };
this.setState({ adraw: { kind: P.annoMode, pts: [[x, y]] } });
} else if (tool === 'anno' || tool === 'marker') {
if (P.onMapClick) P.onMapClick(tool === 'anno' ? 'anno-' + P.annoMode : 'marker', x, y);
} else if (tool === 'rally') {
const all = json(P.wps, {});
const list = (all[P.sel] || []).slice();
if (list.length >= 12) { if (P.onNote) P.onNote('Waypoint limit reached (12 per ship)'); return; }
list.push([x, y]);
if (P.onWps) P.onWps(P.sel, list, 'Added waypoint ' + list.length + ' for ' + P.sel);
} else {
this.startPan(e, svg);
}
},

// ===== Pointer down on map items =====
shipDown(e, name, offs) {
if (e.button !== 0) return;
e.stopPropagation();
const svg = this.svgOf(e);
if (!svg) return;
if (this.state.edit) this.finishEdit(true);
if (this.props.onPick) this.props.onPick(name);
const tool = this.props.tool || 'select';
if (['select', 'move'].indexOf(tool) < 0) return;
e.preventDefault();
this.capture(svg, e);
const s = this.pt(svg, e);
const o = offs[name] || [0, 0];
this.drag = { type: 'ship', name, svg, sx: s.x, sy: s.y, ox: o[0], oy: o[1], cx: e.clientX, cy: e.clientY, moved: false };
},
wpDown(e, h, i, all) {
if (e.button !== 0) return;
e.stopPropagation(); e.preventDefault();
const svg = this.svgOf(e);
if (!svg) return;
this.capture(svg, e);
this.drag = { type: 'wp', h, i, svg, all, cx: e.clientX, cy: e.clientY, moved: false };
this.setState({ wsel: h + '|' + i, zsel: null, msel: null });
if (this.props.onSel) this.props.onSel('wp', h + '|' + i);
},
zoneDown(e, z, mode, all) {
if (e.button !== 0) return;
if ((this.props.tool === 'zone' || this.props.tool === 'group' || this.props.tool === 'anno' || this.props.tool === 'marker' || this.props.tool === 'rally') && mode === 'move') return;
e.stopPropagation(); e.preventDefault();
const svg = this.svgOf(e);
if (!svg) return;
this.capture(svg, e);
const s = this.pt(svg, e);
this.drag = { type: 'zone', mode, z, all, svg, sx: s.x, sy: s.y, cx: e.clientX, cy: e.clientY, moved: false };
this.setState({ zsel: z.id, wsel: null, msel: null });
if (this.props.onSel) this.props.onSel('zone', z.id);
},
markerDown(e, m, all) {
if (e.button !== 0) return;
e.stopPropagation(); e.preventDefault();
const svg = this.svgOf(e);
if (!svg) return;
this.capture(svg, e);
const s = this.pt(svg, e);
this.drag = { type: 'marker', m, all, svg, sx: s.x, sy: s.y, cx: e.clientX, cy: e.clientY, moved: false };
this.setState({ msel: m.id, zsel: null, wsel: null });
if (this.props.onSel) this.props.onSel('marker', m.id);
},
segBreak(e, h, k, all) {
if (e) { e.stopPropagation(); e.preventDefault(); }
const svg = this.svgOf(e);
if (!svg) return;
const s = this.pt(svg, e);
const list = (all[h] || []).slice();
if (list.length >= 12) { if (this.props.onNote) this.props.onNote('Waypoint limit reached (12 per ship)'); return; }
list.splice(k, 0, [Math.round(s.x), Math.round(s.y)]);
if (this.props.onWps) this.props.onWps(h, list, 'Broke route leg ' + (k + 1));
},

// ===== Drag =====
move(e) {
const d = this.drag;
if (!d) return;
if (d.type === 'pan') {
if (!d.moved && Math.abs(e.clientX - d.cx) + Math.abs(e.clientY - d.cy) < 4) return;
d.moved = true;
const k = d.k;
const nv = { z: d.v.z, cx: Math.round(GEO.clamp(d.v.cx - (e.clientX - d.cx) / k, -360, 1800)), cy: Math.round(GEO.clamp(d.v.cy - (e.clientY - d.cy) / k, -225, 1125)) };
d.nv = nv;
this.setState({ pv: nv, hover: null });
return;
}
const s = this.pt(d.svg, e);
if (d.type === 'draw' || d.type === 'box') { this.setState({ zd: { x0: d.x0, y0: d.y0, x1: s.x, y1: s.y } }); return; }
if (d.type === 'anno') {
const ad = this.state.adraw;
const last = ad.pts[ad.pts.length - 1];
if (d.kind === 'arrow') this.setState({ adraw: { kind: d.kind, pts: [ad.pts[0], [Math.round(s.x), Math.round(s.y)]] } });
else if (Math.hypot(s.x - last[0], s.y - last[1]) > 4) this.setState({ adraw: { kind: d.kind, pts: ad.pts.concat([[Math.round(s.x), Math.round(s.y)]]) } });
return;
}
if (!d.moved && Math.abs(e.clientX - d.cx) + Math.abs(e.clientY - d.cy) < 4) return;
d.moved = true;
const clamp = GEO.clamp;
if (d.type === 'ship') {
const g = (this._geo || {})[d.name];
if (!g) return;
const cx = g.x + g.w / 2, cy = g.y + g.h / 2;
d.dx = Math.round(clamp(d.ox + s.x - d.sx, 30 - cx, 1410 - cx));
d.dy = Math.round(clamp(d.oy + s.y - d.sy, 30 - cy, 870 - cy));
if (this.props.snap === 'on') {
const m = json(this.props.meta, {})[d.name] || {};
const rp = GEO.ringPt(D.RINGS[m.sq], cx + d.dx, cy + d.dy);
d.dx = Math.round(rp[0] - cx); d.dy = Math.round(rp[1] - cy);
}
this.setState({ cur: { name: d.name, dx: d.dx, dy: d.dy }, hover: null });
} else if (d.type === 'wp') {
d.x = Math.round(clamp(s.x, 10, 1430)); d.y = Math.round(clamp(s.y, 10, 890));
this.setState({ wdrag: { h: d.h, i: d.i, x: d.x, y: d.y } });
} else if (d.type === 'zone') {
const z = d.z;
d.nz = d.mode === 'move'
? { id: z.id, x: Math.round(z.x + s.x - d.sx), y: Math.round(z.y + s.y - d.sy), w: z.w, h: z.h }
: { id: z.id, x: z.x, y: z.y, w: Math.max(40, Math.round(z.w + s.x - d.sx)), h: Math.max(30, Math.round(z.h + s.y - d.sy)) };
this.setState({ zdrag: d.nz });
} else if (d.type === 'marker') {
d.x = Math.round(clamp(d.m.x + s.x - d.sx, 10, 1430)); d.y = Math.round(clamp(d.m.y + s.y - d.sy, 10, 890));
this.setState({ mdrag: { id: d.m.id, x: d.x, y: d.y } });
}
},
release(e) {
const d = this.drag;
if (!d) return;
this.drag = null;
try { d.svg.releasePointerCapture(e.pointerId); } catch (err) {}
const P = this.props;
if (d.type === 'pan') {
if (d.moved && d.nv) { if (P.onView) P.onView(d.nv); this._pvClear = true; setTimeout(() => this.setState({ pv: null }), 0); }
else if (this.state.zsel || this.state.wsel || this.state.msel) { this.setState({ zsel: null, wsel: null, msel: null }); if (P.onSel) P.onSel(null, null); }
return;
}
if (d.type === 'box' || d.type === 'draw') {
const zd = this.state.zd;
this.setState({ zd: null });
if (!zd) return;
const x0 = Math.min(zd.x0, zd.x1), x1 = Math.max(zd.x0, zd.x1), y0 = Math.min(zd.y0, zd.y1), y1 = Math.max(zd.y0, zd.y1);
if (d.type === 'draw' && x1 - x0 > 30 && y1 - y0 > 30 && P.onZone) P.onZone(Math.round(x0), Math.round(y0), Math.round(x1 - x0), Math.round(y1 - y0));
if (d.type === 'box' && (x1 - x0 > 8 || y1 - y0 > 8) && P.onBox) {
const G = this._geo || {}, offs = json(P.offs, {});
const hit = Object.keys(G).filter((n) => { const g = G[n], o = offs[n] || [0, 0]; const cx = g.x + g.w / 2 + o[0], cy = g.y + g.h / 2 + o[1]; return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1; });
P.onBox(hit, d.add);
}
return;
}
if (d.type === 'anno') {
const ad = this.state.adraw;
this.setState({ adraw: null });
if (ad && ad.pts.length > 1 && GEO.polyLen(ad.pts) > 12 && P.onAnnoDraw) P.onAnnoDraw(ad.kind, ad.pts);
return;
}
if (d.type === 'ship') {
if (d.moved && P.onMove) P.onMove(d.name, d.dx, d.dy);
this.setState({ cur: null });
} else if (d.type === 'wp') {
if (d.moved && P.onWps) P.onWps(d.h, (d.all[d.h] || []).map((p, i) => i === d.i ? [d.x, d.y] : p), 'Moved waypoint ' + (d.i + 1));
this.setState({ wdrag: null });
} else if (d.type === 'zone') {
if (d.moved && d.nz && P.onZones) P.onZones(d.all.map((z) => z.id === d.nz.id ? Object.assign({}, z, { x: d.nz.x, y: d.nz.y, w: d.nz.w, h: d.nz.h }) : z), (d.mode === 'move' ? 'Moved ' : 'Resized ') + (d.z.t || 'zone'));
this.setState({ zdrag: null });
} else if (d.type === 'marker') {
if (d.moved && P.onMarkers) P.onMarkers(d.all.map((m) => m.id === d.m.id ? Object.assign({}, m, { x: d.x, y: d.y }) : m), 'Moved ' + d.m.t);
this.setState({ mdrag: null });
}
},

// ===== Tidy labels: push overlapping labels apart =====
tidy() {
const P = this.props;
let root = null;
try { root = document.querySelector('[data-scene="1"]'); } catch (e) {}
if (!root) return;
const els = Array.from(root.querySelectorAll('[data-lbl]'));
const W = P.w ?? 1440, H = P.h ?? 900;
const z = (this._view || { z: 1 }).z;
const sc = Math.max(W * z / 1440, H * z / 900);
const R = els.map((el) => ({ k: el.getAttribute('data-lbl'), x: parseFloat(el.style.left) || 0, y: parseFloat(el.style.top) || 0, w: el.offsetWidth + 6, h: el.offsetHeight + 6, dx: 0, dy: 0 }));
for (let it = 0; it < 80; it++) {
let moved = false;
for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
const a = R[i], b = R[j];
const ox = Math.min(a.x + a.dx + a.w, b.x + b.dx + b.w) - Math.max(a.x + a.dx, b.x + b.dx);
const oy = Math.min(a.y + a.dy + a.h, b.y + b.dy + b.h) - Math.max(a.y + a.dy, b.y + b.dy);
if (ox > 0 && oy > 0) {
moved = true;
if (oy < ox) { const s = (a.y + a.dy < b.y + b.dy ? -1 : 1) * oy / 2; a.dy += s; b.dy -= s; }
else { const s = (a.x + a.dx < b.x + b.dx ? -1 : 1) * ox / 2; a.dx += s; b.dx -= s; }
}
}
if (!moved) break;
}
const cur = json(P.lbl, {});
const out = Object.assign({}, cur);
let n = 0;
R.forEach((r) => {
if (Math.abs(r.dx) < 0.5 && Math.abs(r.dy) < 0.5) return;
const c = cur[r.k] || [0, 0];
out[r.k] = [Math.round(c[0] + r.dx / sc), Math.round(c[1] + r.dy / sc)];
n++;
});
if (P.onLabelOffs) P.onLabelOffs(out, n ? 'Tidied ' + n + ' labels' : '');
}
};

window.FleetSceneInput = SceneInput;
})();
