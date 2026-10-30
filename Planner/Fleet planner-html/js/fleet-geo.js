// Fleet Planner mockup: geometry and formatting helpers shared by the map and the planner.
// Map units: the scene viewBox is 1440 x 900 and 1 unit is 20 m.
(function () {
'use strict';

// ===== Scale =====
const M_PER_UNIT = 20;
const toUnits = (metres) => metres / M_PER_UNIT;
const toKm = (units) => units * M_PER_UNIT / 1000;

// ===== Numbers and colours =====
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(',');
const box = (h) => 'border: 1px solid rgba(' + rgb(h) + ',0.38); background: linear-gradient(180deg, rgba(' + rgb(h) + ',0.08), rgba(' + rgb(h) + ',0.02));';
const fmtT = (sec) => { const s = Math.max(0, Math.round(sec)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const hhmm = (d, utc) => utc ? String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0') : String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');

// ===== Orbit rings =====
// Nearest point on a squadron's ring (ellipse around Crusader at 720,500).
const ringPt = (R, x, y) => {
if (!R) return [x, y];
const a = R[2] * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
const dx = x - 720, dy = y - 500;
const lx = dx * c + dy * sn, ly = -dx * sn + dy * c;
const t = Math.atan2(ly / R[1], lx / R[0]);
const px = R[0] * Math.cos(t), py = R[1] * Math.sin(t);
return [720 + px * c - py * sn, 500 + px * sn + py * c];
};

// ===== Polylines =====
const polyLen = (pts) => { let d = 0; for (let i = 0; i < pts.length - 1; i++) d += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); return d; };
const along = (pts, s) => {
let acc = 0;
for (let i = 0; i < pts.length - 1; i++) {
const a = pts[i], b = pts[i + 1];
const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
if (acc + L >= s && L > 0) { const t = (s - acc) / L; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
acc += L;
}
return pts[pts.length - 1];
};
// Dash-and-chevron path ("->->->") drawn as shapes so it never breaks while dragging.
const chev = (pts, step) => {
step = step || 15;
const segs = [];
let total = 0;
for (let i = 0; i < pts.length - 1; i++) {
const a = pts[i], b = pts[i + 1];
const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
if (L < 0.5) continue;
segs.push({ a, b, L, s0: total });
total += L;
}
if (!segs.length) return '';
const at = (s) => {
let g = segs[segs.length - 1];
for (let i = 0; i < segs.length; i++) { if (s <= segs[i].s0 + segs[i].L) { g = segs[i]; break; } }
const t = clamp((s - g.s0) / g.L, 0, 1);
return [g.a[0] + (g.b[0] - g.a[0]) * t, g.a[1] + (g.b[1] - g.a[1]) * t, (g.b[0] - g.a[0]) / g.L, (g.b[1] - g.a[1]) / g.L];
};
const f = (n) => n.toFixed(1);
let d = '';
for (let s = 3; s + 12 <= total; s += step) {
const p = at(s), q = at(s + 6), tip = at(s + 12), w = at(s + 8);
const nx = -tip[3], ny = tip[2];
d += 'M' + f(p[0]) + ' ' + f(p[1]) + 'L' + f(q[0]) + ' ' + f(q[1]);
d += 'M' + f(w[0] + nx * 3.6) + ' ' + f(w[1] + ny * 3.6) + 'L' + f(tip[0]) + ' ' + f(tip[1]) + 'L' + f(w[0] - nx * 3.6) + ' ' + f(w[1] - ny * 3.6);
}
return d;
};
const pathD = (pts) => pts.length ? 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') : '';

// ===== Arrowheads (annotations) =====
const arrowHead = (a, b) => {
const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
const ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
const bx = b[0] - ux * 14, by = b[1] - uy * 14;
return 'M' + (bx - uy * 7).toFixed(1) + ' ' + (by + ux * 7).toFixed(1) + 'L' + b[0].toFixed(1) + ' ' + b[1].toFixed(1) + 'L' + (bx + uy * 7).toFixed(1) + ' ' + (by - ux * 7).toFixed(1);
};

window.FleetGeo = { M_PER_UNIT, toUnits, toKm, clamp, rgb, box, fmtT, hhmm, ringPt, polyLen, along, chev, pathD, arrowHead };
})();
