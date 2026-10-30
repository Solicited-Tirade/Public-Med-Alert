// Fleet Planner mockup: planner actions (mixed into the Main component).
// Every change to the plan goes through commit(), which gives undo, the change log and Live confirmation.
(function () {
'use strict';
const D = window.FleetData, G = window.FleetGeo, FM = window.FleetModel, ST = window.FleetStore, SC = window.FleetScene;
const clone = (o) => JSON.parse(JSON.stringify(o));
const uid = (p) => p + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);

const Actions = {

// ===== Initial UI state =====
initialState() {
return Object.assign(FM.DOC0(), {
tab: 'fleet', open: true, panelOpen: true, req: {}, mode: 'plan', labels: true, viewAs: 'Fleet Commander', q: '', tags: {}, sts: {}, collapsed: {},
tool: 'select', markType: 'objective', annoMode: 'arrow', mpath: null, summary: false, tpl: 0, sel: 'Kestrel_7', meas: [], multi: [], hoverH: '',
layout: D.LAYOUTS0[0], layouts: D.LAYOUTS0.slice(), saved: false, note: null,
layers: { rings: true, paths: true, ghosts: true, routes: 'sel', minimap: true },
vw: 1440, vh: 900, hist: [], fut: [], log: [], menu: null, layoutsOpen: null, confirm: null, edit: null, tip: null, dragging: null, dropKey: '',
snap: false, selObj: null, play: { t: 0, on: false, rate: 10 }, liveNoAsk: false, pending: null, help: false, cpop: null,
mm: { open: true, size: 1 }, tidyN: 0, diffWith: '', diffDoc: null, briefing: null, clockOpen: null, shipCard: null,
pres: { on: false, laser: false, spot: '', notes: true }, laser: null, tween: null, addEl: 'Lifeline|1-1',
view: { z: 1, cx: 720, cy: 500 },
txt: { ships: 'full', arcs: true, notes: true, markers: true, zones: true, squads: true, eta: true, pins: true }, clean: false, txtOpen: null
});
},

// ===== Lifecycle =====
componentDidMount() {
this.size = () => { try { this.setState({ vw: window.innerWidth || 1440, vh: window.innerHeight || 900 }); } catch (e) {} };
this.size();
try { window.addEventListener('resize', this.size); } catch (e) {}
const layouts = ST.loadLayouts(D.LAYOUTS0);
this.setState({ layouts });
this.load(layouts[0]);
this._tick = setInterval(() => this.setState({ clockTick: Date.now() }), 15000);
},
componentWillUnmount() {
try { window.removeEventListener('resize', this.size); } catch (e) {}
clearInterval(this._pi); clearInterval(this._tw); clearInterval(this._tick);
try { if (this._rootEl) this._rootEl.removeEventListener('pointerdown', this._cap, true); } catch (e) {}
},
componentDidUpdate() {
const ed = this.state.edit;
if (ed) { if (this._fk !== ed.key) { this._fk = ed.key; try { const el = document.querySelector('[data-edit="1"]'); if (el) { el.focus(); el.select(); } } catch (e) {} } } else this._fk = null;
const cp = this.state.cpop;
if (cp) { if (this._cfk !== cp.key) { this._cfk = cp.key; try { const el = document.querySelector('[data-cinput="1"]'); if (el) el.focus(); } catch (e) {} } } else this._cfk = null;
if (this._rootEl) { try { if (document.activeElement === document.body) this._rootEl.focus({ preventScroll: true }); } catch (e) {} }
if (!this._rootEl) {
try {
const r = document.querySelector('[data-root="1"]');
if (r) { r.setAttribute('tabindex', '-1'); this._rootEl = r; this._cap = (ev) => this.rootCapture(ev); r.addEventListener('pointerdown', this._cap, true); try { r.focus({ preventScroll: true }); } catch (e2) {} }
} catch (e) {}
}
},

// ===== Coordinates and time =====
fitVals() {
const S = this.state;
const fit = Math.min(S.vw / 1440, S.vh / 900) || 1;
return { fit, fx: (S.vw - 1440 * fit) / 2, fy: (S.vh - 900 * fit) / 2 };
},
toLocal(cx, cy) { const f = this.fitVals(); return [(cx - f.fx) / f.fit, (cy - f.fy) / f.fit]; },
now() { return G.hhmm(new Date(), false); },
eff() { const s = this.state; return s.pending ? Object.assign({}, s, s.pending.patch) : s; },
model() { return FM.build(this.eff()); },

// ===== Saving and history =====
persist(doc, layout) { ST.saveDoc(layout || this.state.layout, doc); },
saveAll() { this.persist(Object.assign(FM.docOf(this.state), { log: this.state.log })); },
load(layout) {
const d = ST.loadDoc(layout);
const doc = FM.normalize(d);
clearInterval(this._pi);
this.setState(Object.assign(doc, { layout, hist: [], fut: [], meas: [], multi: [], log: Array.isArray(d.log) ? d.log : [], layoutsOpen: null, diffWith: '', diffDoc: null, play: { t: 0, on: false, rate: this.state.play.rate } }));
},
note(text, undo) {
if (!text) return;
clearTimeout(this._nt);
this.setState({ note: { text, undo: !!undo } });
this._nt = setTimeout(() => this.setState({ note: null }), undo ? 5000 : 3200);
},
commit(patch, label, opt) {
opt = opt || {};
const st = this.state;
if (st.mode === 'live' && !st.liveNoAsk && !opt.force) {
this._confirmFn = () => this.commit(patch, label, { force: true });
this._confirmAlt = () => { this.setState({ liveNoAsk: true }); this.commit(patch, label, { force: true }); };
this.setState({ pending: { patch, label }, confirm: { title: 'Apply to the live fleet?', text: label + '. Affected owners and leads will get a direct message.', ok: 'Apply', alt: 'Apply, stop asking' }, menu: null });
return;
}
const prev = FM.docOf(st);
const next = Object.assign({}, prev, patch);
const merge = !!(opt.merge && st.hist.length && st.hist[st.hist.length - 1].label === label && Date.now() - (this._lastMerge || 0) < 1200);
this._lastMerge = Date.now();
const log = merge ? st.log : [{ t: this.now(), text: label, mode: st.mode, phase: st.phase }].concat(st.log).slice(0, 60);
const hist = merge ? st.hist : st.hist.concat([{ doc: prev, label, t: this.now() }]).slice(-100);
this.setState(Object.assign({}, patch, { hist, fut: [], log, pending: null }));
this.persist(Object.assign({}, next, { log }));
this.note(label, true);
},
restore(doc, hist, fut, text) {
const log = [{ t: this.now(), text, mode: this.state.mode, phase: this.state.phase }].concat(this.state.log).slice(0, 60);
this.setState(Object.assign({}, doc, { hist, fut, log }));
this.persist(Object.assign({}, doc, { log }));
this.note(text);
},
undo() {
const st = this.state;
if (!st.hist.length) { this.note('Nothing to undo'); return; }
const last = st.hist[st.hist.length - 1];
this.restore(last.doc, st.hist.slice(0, -1), st.fut.concat([{ doc: FM.docOf(st), label: last.label, t: this.now() }]), 'Undid: ' + last.label);
},
redo() {
const st = this.state;
if (!st.fut.length) { this.note('Nothing to redo'); return; }
const nx = st.fut[st.fut.length - 1];
this.restore(nx.doc, st.hist.concat([{ doc: FM.docOf(st), label: nx.label, t: this.now() }]), st.fut.slice(0, -1), 'Redid: ' + nx.label);
},
jumpTo(i) {
const st = this.state;
if (i < 0 || i >= st.hist.length) return;
const target = st.hist[i];
const undone = st.hist.slice(i).map((h, j) => ({ doc: j === st.hist.length - i - 1 ? FM.docOf(st) : st.hist[i + j + 1].doc, label: h.label, t: h.t })).reverse();
this.restore(target.doc, st.hist.slice(0, i), st.fut.concat(undone), 'Jumped back to before: ' + target.label);
},
ask(title, text, ok, fn) { this._confirmFn = fn; this._confirmAlt = null; this.setState({ confirm: { title, text, ok }, menu: null, layoutsOpen: null }); },

// ===== Menus and inline editing =====
ctxFrom(e, kind, id) {
if (e && e.preventDefault) e.preventDefault();
if (e && e.stopPropagation) e.stopPropagation();
const p = this.toLocal(e.clientX, e.clientY);
this.setState({ menu: { kind, id, x: p[0], y: p[1] }, tip: null });
},
anchorMenu(e, kind) {
const r = e.currentTarget.getBoundingClientRect();
const a = this.toLocal(r.left, r.top);
this.setState({ menu: { kind, id: '', x: a[0], y: a[1], up: true }, tip: null, layoutsOpen: null });
},
startEdit(key, draft) { this.setState({ edit: { key, draft: draft || '' }, menu: null, tip: null }); },
editor(key, cur) {
const ed = this.state.edit;
const on = !!(ed && ed.key === key);
return {
editing: on, show: !on, draft: on ? ed.draft : '',
chg: (e) => this.setState({ edit: Object.assign({}, this.state.edit, { draft: (e && e.target && e.target.value) || '' }) }),
kd: (e) => { if (e) e.stopPropagation(); if (e && e.key === 'Enter') this.finishEdit(true); if (e && e.key === 'Escape') this.finishEdit(false); },
blur: () => this.finishEdit(true),
dbl: (e) => { if (e) { e.preventDefault(); e.stopPropagation(); } this.startEdit(key, cur); }
};
},
finishEdit(save) {
const ed = this.state.edit;
if (!ed) return;
this.setState({ edit: null });
if (save) this.rename(ed.key, ed.draft.trim());
},
rename(key, val) {
const st = this.state;
const i = key.indexOf(':');
let kind = i < 0 ? key : key.slice(0, i);
const id = i < 0 ? '' : key.slice(i + 1);
if (kind.charAt(0) === 'r' && ['rship', 'rsq', 'rel'].indexOf(kind) >= 0) kind = kind.slice(1);
const names = clone(st.names);
const M = this.model();
if (kind === 'fleet') { if ((names.fleet || '') === val) return; names.fleet = val; this.commit({ names }, val ? 'Renamed fleet to ' + val : 'Reset fleet name'); }
else if (kind === 'sq') { if (M.sqName(id) === val) return; if (val && val !== (D.DEFNAME[id] || id)) names.sq[id] = val; else delete names.sq[id]; this.commit({ names }, 'Renamed ' + M.sqName(id) + ' to ' + (val || D.DEFNAME[id] || id)); }
else if (kind === 'el') { if ((names.el[id] || '') === val) return; if (val) names.el[id] = val; else delete names.el[id]; this.commit({ names }, val ? 'Renamed element to ' + val : 'Reset element name'); }
else if (kind === 'ship') { if ((names.ship[id] || '') === val) return; if (val) names.ship[id] = val; else delete names.ship[id]; this.commit({ names }, val ? 'Nicknamed ' + id + '’s ship “' + val + '”' : 'Cleared nickname for ' + id); }
else if (kind === 'zone') { const z = st.zones.find((q) => q.id === id); if (!z || !val || z.t === val) return; this.commit({ zones: st.zones.map((q) => q.id === id ? Object.assign({}, q, { t: val }) : q) }, 'Renamed zone to ' + val); }
else if (kind === 'marker') { const m = st.markers.find((q) => q.id === id); if (!m || !val || m.t === val) return; this.updateMarker(id, { t: val }, 'Renamed marker to ' + val); }
else if (kind === 'anno') { const a = st.annos.find((q) => q.id === id); if (!a || a.text === val) return; if (!val) { this.commit({ annos: st.annos.filter((q) => q.id !== id) }, 'Deleted note'); return; } this.commit({ annos: st.annos.map((q) => q.id === id ? Object.assign({}, q, { text: val }) : q) }, 'Edited note'); }
else if (kind === 'layout') {
if (!val || val === id) return;
if (st.layouts.indexOf(val) >= 0) { this.note('A layout named ' + val + ' already exists'); return; }
ST.renameDoc(id, val);
const layouts = st.layouts.map((l) => l === id ? val : l);
ST.saveLayouts(layouts);
this.setState({ layouts, layout: st.layout === id ? val : st.layout });
this.note('Renamed layout to ' + val);
}
},

// ===== Ships: assignment, status, leadership, position =====
assignTo(keys, q, el, label) {
const st = this.state, M = this.model();
const ok = keys.filter((h) => {
const s = M.byK[h];
if (!s) return false;
if (h === 'Marrow_6' && q !== 'Command') return false;
if (h !== 'Marrow_6' && q === 'Command') return false;
return !(s.squad === q && s.el === el);
});
if (!ok.length) {
if (keys.indexOf('Marrow_6') >= 0 && q !== 'Command') this.note('The commander stays on a ship in Fleet Command');
else if (q === 'Command') this.note('Fleet Command holds only the commander ship');
return;
}
const assign = Object.assign({}, st.assign);
const sandbox = st.sandbox.map((sb) => ok.indexOf(sb.id) >= 0 ? Object.assign({}, sb, { squad: q, el }) : sb);
ok.forEach((h) => { if (!M.byK[h].sandbox) assign[h] = [q, el]; });
this.commit({ assign, sandbox }, label || (ok.map((h) => M.byK[h].label).join(', ') + ' moved to ' + M.sqName(q) + (q === 'Command' ? '' : ' · ' + M.elName(q, el))));
},
dropOn(q, el, e) {
if (e && e.preventDefault) e.preventDefault();
if (e && e.stopPropagation) e.stopPropagation();
let h = this.dragH;
try { h = (e.dataTransfer && e.dataTransfer.getData('text/plain')) || h; } catch (err) {}
this.dragH = null;
this.setState({ dragging: null, dropKey: '' });
if (!h) return;
this.assignTo([h], q, el || this.model().newElId(q));
},
setStatus(h, v) {
const M = this.model(), s = M.byK[h];
if (!s || s.status === v) return;
const status = Object.assign({}, this.state.status);
if (v === s.base) delete status[h]; else status[h] = v;
this.commit({ status }, s.label + ' status set to ' + v);
},
setLead(q, which, h) {
const M = this.model();
const cur = M.leads[q].slice();
if (cur[which] === h) return;
if (which === 0 && cur[1] === h) cur[1] = cur[0];
if (which === 1 && cur[0] === h) cur[0] = cur[1];
cur[which] = h;
this.commit({ leads: Object.assign({}, this.state.leads, { [q]: cur }) }, h + (which === 0 ? ' is now lead of ' : ' is now deputy of ') + M.sqName(q));
},
setElLead(q, el, h) {
const M = this.model();
if (M.elLead(q, el) === h) return;
this.commit({ elLeads: Object.assign({}, this.state.elLeads, { [q + '|' + el]: h }) }, h + ' is now lead of ' + M.elName(q, el));
},
baseCenter(h) { const c = SC.center(h); if (c) return c; const sb = this.state.sandbox.find((x) => x.id === h); return sb ? [sb.x, sb.y] : [720, 500]; },
centerOf(h) { const b = this.baseCenter(h), o = this.state.offs[h] || [0, 0]; return [b[0] + o[0], b[1] + o[1]]; },
setCenter(offs, h, x, y) { const b = this.baseCenter(h); offs[h] = [Math.round(G.clamp(x, 30, 1410) - b[0]), Math.round(G.clamp(y, 30, 870) - b[1])]; },
resetPos(h) { const offs = Object.assign({}, this.state.offs); if (!offs[h]) return; delete offs[h]; this.commit({ offs }, 'Reset position of ' + h); },
nudge(dx, dy) {
const h = this.state.sel;
if (!this.model().byK[h]) return;
const c = this.centerOf(h), offs = Object.assign({}, this.state.offs);
this.setCenter(offs, h, c[0] + dx, c[1] + dy);
this.commit({ offs }, 'Nudged ' + h, { merge: true });
},
setWps(h, list, label) {
const wps = Object.assign({}, this.state.wps);
if (list && list.length) wps[h] = list; else delete wps[h];
this.commit({ wps }, label);
},

// ===== Formations, snapping, routes =====
applyFormation(q, el, type) {
const M = this.model(), st = this.state;
const mem = (el ? M.inSq(q).filter((s) => s.el === el) : M.inSq(q)).map((s) => s.key);
const lead = el ? M.elLead(q, el) : M.leads[q][0];
if (!lead || mem.length < 2) { this.note('A formation needs at least two ships'); return; }
const c0 = this.centerOf(lead);
const route = st.wps[lead] || [];
let fx, fy;
if (route.length) { fx = route[0][0] - c0[0]; fy = route[0][1] - c0[1]; } else { fx = -(c0[1] - 500); fy = c0[0] - 720; }
const L = Math.hypot(fx, fy) || 1; fx /= L; fy /= L;
const rx = -fy, ry = fx;
const others = mem.filter((h) => h !== lead);
const offs = Object.assign({}, st.offs);
others.forEach((h, i) => {
const k = Math.floor(i / 2) + 1, side = i % 2 === 0 ? 1 : -1;
let b = 0, sd = 0;
if (type === 'Wedge') { b = -50 * k; sd = 50 * k * side; }
else if (type === 'Line') { sd = 56 * k * side; }
else if (type === 'Column') { b = -56 * (i + 1); }
else if (type === 'Screen') { const n = others.length; const ang = (n === 1 ? 0 : (-60 + 120 * i / (n - 1))) * Math.PI / 180; b = 95 * Math.cos(ang); sd = 95 * Math.sin(ang); }
this.setCenter(offs, h, c0[0] + fx * b + rx * sd, c0[1] + fy * b + ry * sd);
});
this.commit({ offs }, type + ' formation on ' + lead + ' for ' + (el ? M.elName(q, el) : M.sqName(q)));
},
snapShips(keys, label) {
const M = this.model(), offs = Object.assign({}, this.state.offs);
keys.forEach((h) => { const s = M.byK[h]; if (!s) return; const c = this.centerOf(h); const p = G.ringPt(D.RINGS[s.squad], c[0], c[1]); this.setCenter(offs, h, p[0], p[1]); });
this.commit({ offs }, label);
},
splitRoute(h, i, target) {
const st = this.state;
const list = (st.wps[h] || []).slice();
if (i >= list.length - 1) { this.note('Pick a waypoint before the last one to split'); return; }
const wps = Object.assign({}, st.wps);
wps[h] = list.slice(0, i + 1);
if (target) { wps[target] = (wps[target] || []).concat(list.slice(i)); this.commit({ wps }, 'Handed route after waypoint ' + (i + 1) + ' to ' + target); }
else { wps['free:' + uid('r')] = list.slice(i); this.commit({ wps }, 'Split route at waypoint ' + (i + 1) + ' into a detached route'); }
},

// ===== Route playback =====
togglePlay() {
const p = this.state.play;
if (p.on) { clearInterval(this._pi); this.setState({ play: Object.assign({}, p, { on: false }) }); return; }
const maxT = FM.maxRouteTime(this.state, this.model());
if (!maxT) { this.note('Add waypoints or a threat path to play'); return; }
this.setState({ play: Object.assign({}, p, { on: true, t: p.t >= maxT ? 0 : p.t }) });
clearInterval(this._pi);
this._pi = setInterval(() => {
const q = this.state.play;
const mt = FM.maxRouteTime(this.state, this.model());
let t = q.t + 0.1 * q.rate;
if (t >= mt) { clearInterval(this._pi); this.setState({ play: Object.assign({}, q, { t: mt, on: false }) }); return; }
this.setState({ play: Object.assign({}, q, { t }) });
}, 100);
},
stopPlay() { clearInterval(this._pi); this.setState({ play: Object.assign({}, this.state.play, { on: false, t: 0 }) }); },

// ===== Phases (each phase keeps its own positions, routes, zones, markers, notes) =====
setPhase(i, label) {
const st = this.state;
if (i === st.phase) return;
const pd = clone(st.phaseData || {});
pd[st.phase] = clone(FM.phasedOf(st));
const next = pd[i] ? clone(pd[i]) : clone(FM.phasedOf(st));
delete pd[i];
const from = clone(st.offs);
this.commit(Object.assign({ phase: i, phaseData: pd }, next), label || ('Phase: ' + D.PHASES[i][0]));
this.tweenOffs(from, next.offs || {});
},
tweenOffs(from, to) {
clearInterval(this._tw);
const keys = Array.from(new Set(Object.keys(from).concat(Object.keys(to))));
if (!keys.some((k) => JSON.stringify(from[k] || [0, 0]) !== JSON.stringify(to[k] || [0, 0]))) return;
const t0 = Date.now();
this._tw = setInterval(() => {
const f = Math.min(1, (Date.now() - t0) / 800);
const e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
const out = {};
keys.forEach((k) => { const a = from[k] || [0, 0], b = to[k] || [0, 0]; out[k] = [Math.round(a[0] + (b[0] - a[0]) * e), Math.round(a[1] + (b[1] - a[1]) * e)]; });
this.setState({ tween: f >= 1 ? null : out });
if (f >= 1) clearInterval(this._tw);
}, 33);
},

// ===== Comments (note, task, warning) =====
openComments(key, x, y) { this.setState({ cpop: { key, x, y, draft: '', type: 'note', assignee: '', due: '' }, menu: null, tip: null }); },
targetName(key) {
const i = key.indexOf(':'), k = key.slice(0, i), id = key.slice(i + 1);
if (k === 'zone') { const z = this.state.zones.find((q) => q.id === id); return z ? z.t : 'zone'; }
if (k === 'marker') { const m = this.state.markers.find((q) => q.id === id); return m ? m.t : 'marker'; }
const s = this.model().byK[id];
return s ? s.label : id;
},
postComment() {
const cp = this.state.cpop;
if (!cp || !cp.draft.trim()) return;
const c = { id: uid('c'), key: cp.key, type: cp.type, text: cp.draft.trim(), by: 'Marrow_6', t: this.now(), assignee: cp.type === 'task' ? cp.assignee : '', due: cp.type === 'task' ? cp.due : '', done: false };
this.setState({ cpop: Object.assign({}, cp, { draft: '' }) });
this.commit({ comments: this.state.comments.concat([c]) }, D.COMMENT_TYPES[c.type][0] + ' on ' + this.targetName(cp.key));
},
toggleDone(id) { this.commit({ comments: this.state.comments.map((c) => c.id === id ? Object.assign({}, c, { done: !c.done }) : c) }, 'Updated task'); },
resolveComment(id) {
const c = this.state.comments.find((q) => q.id === id);
if (!c) return;
this.commit({ comments: this.state.comments.filter((q) => q.id !== id), resolved: [Object.assign({}, c, { resolvedAt: this.now(), target: this.targetName(c.key) })].concat(this.state.resolved).slice(0, 50) }, 'Resolved ' + D.COMMENT_TYPES[c.type][0].toLowerCase() + ' on ' + this.targetName(c.key));
},

// ===== Markers (objective, extraction, threat, hazard, casualty) =====
addMarker(type, x, y, extra, label) {
const n = this.state.markers.filter((m) => m.type === type).length + 1;
const m = Object.assign({ id: uid('m'), type, x, y, t: D.MARKERS[type].label + ' ' + n, path: [] }, type === 'threat' ? { kind: 'Fighters', str: 2, spd: 180 } : {}, type === 'hazard' ? { r: 60 } : {}, type === 'casualty' ? { tier: 2 } : {}, extra || {});
let markers = this.state.markers.concat([m]);
const patch = { markers };
if (type === 'casualty') this.autoAssign(m, patch);
const placed = patch.markers.find((q) => q.id === m.id) || m;
this.commit(patch, label || ('Placed ' + m.t + (type === 'casualty' ? (placed.ship ? ', ' + placed.ship + ' routed to it' : ', no free bed') : '')));
return m;
},
updateMarker(id, change, label) {
const patch = { markers: this.state.markers.map((m) => m.id === id ? Object.assign({}, m, change) : m) };
const m = patch.markers.find((q) => q.id === id);
if (m && m.type === 'casualty' && change.tier && !change.ship) this.autoAssign(m, patch, true);
this.commit(patch, label);
},
deleteMarker(id) { const m = this.state.markers.find((q) => q.id === id); this.commit({ markers: this.state.markers.filter((q) => q.id !== id) }, 'Removed ' + (m ? m.t : 'marker')); },
// Nearest medical ship with a free bed of a good enough tier (lower tier number = better bed) gets the casualty and a route to it.
autoAssign(m, patch, reassign) {
const M = this.model();
const markers = patch.markers;
const busy = (k) => markers.filter((q) => q.type === 'casualty' && q.ship === k && q.id !== m.id).length;
const opts = M.medShips.map((s) => {
const fit = M.bedsOf(s).filter((t) => t <= (m.tier || 2)).length - busy(s.key);
const c = this.centerOf(s.key);
return { s, fit, d: Math.hypot(c[0] - m.x, c[1] - m.y) };
}).filter((o) => o.fit > 0).sort((a, b) => a.d - b.d);
const best = opts[0];
const idx = markers.findIndex((q) => q.id === m.id);
if (!best) { markers[idx] = Object.assign({}, markers[idx], { ship: '' }); return; }
markers[idx] = Object.assign({}, markers[idx], { ship: best.s.key });
const wps = Object.assign({}, patch.wps || this.state.wps);
wps[best.s.key] = (wps[best.s.key] || []).concat([[m.x, m.y]]);
patch.wps = wps;
},
assignCasualty(id, key) {
const m = this.state.markers.find((q) => q.id === id);
if (!m) return;
const wps = Object.assign({}, this.state.wps);
if (key) wps[key] = (wps[key] || []).concat([[m.x, m.y]]);
this.commit({ markers: this.state.markers.map((q) => q.id === id ? Object.assign({}, q, { ship: key }) : q), wps }, key ? m.t + ' assigned to ' + key : m.t + ' unassigned');
},

// ===== Annotations =====
addAnno(kind, pts, text) {
const a = { id: uid('a'), kind, pts, text: text || '', c: '#FDE68A' };
this.commit({ annos: this.state.annos.concat([a]) }, 'Added ' + (kind === 'text' ? 'note' : kind));
return a;
},

// ===== Seats, attendance, members =====
seatMember(key, i, who) {
const st = this.state, M = this.model();
const seatOv = Object.assign({}, st.seatOv);
if (who) { const at = M.seatOf[who]; if (at) seatOv[at.ship + '|' + at.i] = ''; }
seatOv[key + '|' + i] = who || '';
const s = M.byK[key];
const displaced = st.displaced.filter((h) => h !== who);
this.commit({ seatOv, displaced }, who ? who + ' seated as ' + s.seats[i].name + ' on ' + s.label + '’s ' + s.name : 'Opened ' + s.seats[i].name + ' on ' + s.label + '’s ' + s.name);
},
setAtt(h, s) { const att = Object.assign({}, this.state.att); const cur = att[h] || {}; att[h] = { s, late: s === 'late' ? (cur.late || '+15m') : '' }; this.commit({ att }, h + ' marked ' + s, { merge: true }); },
setLate(h, v) { const att = Object.assign({}, this.state.att); att[h] = { s: 'late', late: v }; this.commit({ att }, h + ' late ' + v, { merge: true }); },

// ===== Sandbox ships =====
addSandbox(hull, q, el) {
const st = this.state, M = this.model();
if (M.ships.length >= 50) { this.note('The fleet is at the 50-ship cap'); return; }
const n = st.sandbox.length + 1;
const lead = M.elLead(q, el) || M.leads[q][0];
const c = lead ? this.centerOf(lead) : [720, 380];
const sb = { id: 'Open-' + n + '-' + Date.now().toString(36).slice(-3), hull, squad: q, el, x: Math.round(G.clamp(c[0] + 50 + (n % 3) * 26, 40, 1400)), y: Math.round(G.clamp(c[1] - 40 + (n % 4) * 20, 40, 860)), owner: '' };
this.commit({ sandbox: st.sandbox.concat([sb]) }, 'Added an open ' + hull + ' to ' + M.sqName(q) + ' · ' + M.elName(q, el));
this.setState({ sel: sb.id, tab: 'ship' });
},
claimSandbox(id, who) { this.commit({ sandbox: this.state.sandbox.map((s) => s.id === id ? Object.assign({}, s, { owner: who }) : s) }, who ? who + ' claimed an open ship' : 'Released a ship'); },
removeSandbox(id) {
const st = this.state;
const offs = Object.assign({}, st.offs); delete offs[id];
const wps = Object.assign({}, st.wps); delete wps[id];
this.commit({ sandbox: st.sandbox.filter((s) => s.id !== id), offs, wps }, 'Removed an open ship');
if (st.sel === id) this.setState({ sel: 'Kestrel_7' });
},

// ===== Losses (Live) =====
markLoss(key, kind) {
const st = this.state, M = this.model(), s = M.byK[key];
if (!s) return;
const losses = Object.assign({}, st.losses, { [key]: kind });
const patch = { losses };
if (kind === 'destroyed') {
const crew = s.seats.filter((x) => x.who).map((x) => x.who);
patch.displaced = Array.from(new Set(st.displaced.concat(crew)));
const c = this.centerOf(key);
const m = { id: uid('m'), type: 'casualty', x: Math.round(c[0] + 18), y: Math.round(c[1] + 16), t: 'Wreck · ' + s.label, tier: 2, path: [] };
patch.markers = st.markers.concat([m]);
this.autoAssign(m, patch);
}
this.commit(patch, s.label + '’s ' + s.name + ' marked ' + kind + (kind === 'destroyed' ? '; crew need seats, casualty raised' : ''));
},
clearLoss(key) { const losses = Object.assign({}, this.state.losses); delete losses[key]; this.commit({ losses }, 'Cleared loss on ' + key); },

// ===== Weapons, fuel, readiness, colours =====
toggleArc(key, kind, i) {
const arcs = clone(this.state.arcs);
const a = arcs[key] || { g: [], m: [] };
const list = kind === 'gun' ? a.g : a.m;
const j = list.indexOf(i);
if (j >= 0) list.splice(j, 1); else list.push(i);
arcs[key] = a;
this.commit({ arcs }, 'Toggled weapon arc on ' + key, { merge: true });
},
setArcs(key, on) {
const s = this.model().byK[key];
const arcs = clone(this.state.arcs);
arcs[key] = on ? { g: s.H.guns.map((g, i) => i), m: s.H.missiles.map((g, i) => i) } : { g: [], m: [] };
this.commit({ arcs }, (on ? 'Showed' : 'Hid') + ' all weapon arcs on ' + key);
},
setStat(hull, field, val) {
const v = parseFloat(val);
if (isNaN(v)) return;
const statsOv = clone(this.state.statsOv);
statsOv[hull] = Object.assign({}, statsOv[hull] || {}, { [field]: v });
this.commit({ statsOv }, 'Set ' + hull + ' ' + field + ' to ' + v, { merge: true });
},
toggleReady(key, f) {
const ready = clone(this.state.ready);
ready[key] = Object.assign({}, ready[key] || {}, { [f]: !(ready[key] || {})[f] });
this.commit({ ready }, key + ' readiness: ' + f, { merge: true });
},
setColor(q, c) { this.commit({ colors: Object.assign({}, this.state.colors, { [q]: c }) }, 'Recoloured ' + this.model().sqName(q)); },

// ===== Plan diff =====
setDiff(name) {
if (!name) { this.setState({ diffWith: '', diffDoc: null }); return; }
const d = FM.normalize(ST.loadDoc(name));
const offs = d.phase === this.state.phase ? d.offs : ((d.phaseData || {})[this.state.phase] || {}).offs || d.offs;
this.setState({ diffWith: name, diffDoc: Object.assign({}, d, { offs }) });
},

// ===== Camera (zoom and pan; per session, not part of the plan) =====
setView(v) { this.setState({ view: { z: G.clamp(v.z, 0.5, 4), cx: G.clamp(v.cx, -360, 1800), cy: G.clamp(v.cy, -225, 1125) } }); },
zoomBy(f) { const v = this.state.view; this.setView({ z: Math.round(v.z * f * 1000) / 1000, cx: v.cx, cy: v.cy }); },
resetView() { this.setView({ z: 1, cx: 720, cy: 500 }); },

// ===== Map text (declutter) =====
setTxt(k, v) { this.setState({ txt: Object.assign({}, this.state.txt, { [k]: v }), clean: false }); },
toggleClean() { const on = !this.state.clean; this.setState({ clean: on }); this.note(on ? 'Labels hidden. Selected and hovered ships still show theirs. Press H to bring them back.' : 'Labels back'); },

// ===== Presenter =====
presStep(dir) {
const n = this.state.phase + dir;
if (n < 0 || n >= D.PHASES.length) return;
this.setPhase(n, 'Presenter: ' + D.PHASES[n][0]);
}
};

window.FleetActions = Actions;
})();
