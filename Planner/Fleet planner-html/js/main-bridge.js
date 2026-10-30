// Fleet Planner mockup: callbacks the orbit map uses to report changes back to the planner.
(function () {
'use strict';
const D = window.FleetData;

const Bridge = {
sceneHandlers(M) {
return {
onPick: (h) => {
const st = this.state;
if (!h) return;
if (st.tool === 'measure') { let m = st.meas.slice(); if (m.length >= 2) m = []; if (m.indexOf(h) < 0) m.push(h); this.setState({ sel: h, meas: m }); return; }
if (st.tool === 'group') { const m = st.multi.indexOf(h) >= 0 ? st.multi.filter((x) => x !== h) : st.multi.concat([h]); this.setState({ multi: m, sel: h }); return; }
if (st.tool === 'cmd') { this.setState({ sel: h }); this.note(h === 'Marrow_6' ? 'Marrow_6 already carries the commander' : 'Changing the commander ship needs Fleet Commander approval (mock)'); return; }
if (st.tool === 'loadout') { this.setState({ sel: h, tab: 'ship', panelOpen: true }); this.note('Weapons for ' + h + ' are listed in the Ship tab; toggle arcs there'); return; }
if (st.tool === 'rally') { this.setState({ sel: h }); return; }
this.setState({ sel: h, tab: st.tab === 'fleet' || st.tab === 'ship' ? 'ship' : st.tab });
},
onMove: (h, dx, dy) => this.commit({ offs: Object.assign({}, this.state.offs, { [h]: [dx, dy] }) }, 'Moved ' + ((M.byK[h] || {}).label || h)),
onZone: (x, y, w, h) => {
const st = this.state, s = M.byK[st.sel];
const sq = s ? s.squad : 'Command';
const z = { id: 'z' + Date.now().toString(36), x, y, w, h, c: M.color(sq), t: 'Zone ' + (st.zones.length + 1) + ' · ' + M.sqName(sq) };
this.commit({ zones: st.zones.concat([z]) }, 'Drew ' + z.t);
},
onZones: (list, label) => this.commit({ zones: list }, label),
onWps: (h, list, label) => this.setWps(h, list, label),
onCtx: (kind, id, cx, cy, x, y) => { const p = this.toLocal(cx, cy); this.setState({ menu: { kind, id, x: p[0], y: p[1], px: x, py: y }, tip: null }); },
onRename: (kind, id, val) => this.rename(kind + ':' + id, val),
onNote: (t) => this.note(t),
onBox: (list, add) => { const m = add ? Array.from(new Set(this.state.multi.concat(list))) : list; this.setState({ multi: m }); this.note(m.length + ' ship' + (m.length === 1 ? '' : 's') + ' selected · pick a squadron above'); },
onSel: (kind, id) => this.setState({ selObj: kind ? { kind, id } : null }),
onPin: (key, cx, cy) => { const p = this.toLocal(cx, cy); this.openComments(key, p[0] + 12, p[1] + 12); },
onMapClick: (what, x, y) => {
const st = this.state;
if (what === 'marker') this.addMarker(st.markType, x, y);
else if (what === 'mpath') { const m = st.markers.find((q) => q.id === st.mpath); if (m) this.updateMarker(m.id, { path: (m.path || []).concat([[x, y]]) }, 'Extended path for ' + m.t); }
else if (what === 'anno-text') this.addAnno('text', [[x, y]], 'Note');
else if (what === 'anno-circle') this.addAnno('circle', [[x, y]]);
},
onMarkers: (list, label) => this.commit({ markers: list }, label),
onAnnoDraw: (kind, pts) => this.addAnno(kind, pts),
onView: (v) => this.setView(v),
onLabelOffs: (map, label) => { if (label) this.commit({ labelOffs: map }, label); else this.note('Labels already clear'); }
};
}
};

window.FleetBridge = Bridge;
})();
