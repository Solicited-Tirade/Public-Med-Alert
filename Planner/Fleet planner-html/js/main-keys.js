// Fleet Planner mockup: keyboard shortcuts, click-outside closing, tooltips and the presenter laser.
// Mixed into the Main component. Keys are handled on the planner's root element only, never globally.
(function () {
'use strict';
const D = window.FleetData;

const Keys = {

// ===== Click outside: close popovers, keep keyboard focus on the planner =====
rootCapture(e) {
clearTimeout(this._tt); this._tipEl = null;
const t = e.target;
const st = this.state;
const patch = {};
const inside = (sel) => t.closest && t.closest(sel);
if (st.tip) patch.tip = null;
if (st.menu && !inside('[data-menu]')) patch.menu = null;
if (st.layoutsOpen && !inside('[data-pop]')) patch.layoutsOpen = null;
if (st.cpop && !inside('[data-cpop]')) patch.cpop = null;
if (st.clockOpen && !inside('[data-clock]')) patch.clockOpen = null;
if (st.txtOpen && !inside('[data-txt]')) patch.txtOpen = null;
if (st.shipCard) patch.shipCard = null;
const tg = t.tagName;
if (tg !== 'INPUT' && tg !== 'TEXTAREA' && tg !== 'SELECT') {
setTimeout(() => {
try {
const r = this._rootEl, ae = document.activeElement;
if (r && (!ae || ae === document.body || !r.contains(ae) || ae.tagName === 'svg')) r.focus({ preventScroll: true });
} catch (err) {}
}, 0);
}
if (Object.keys(patch).length) this.setState(patch);
},

// ===== Keyboard =====
rootKey(e) {
const tg = e.target && e.target.tagName;
const st = this.state;
if (e.key === 'Escape') {
this.setState({ menu: null, layoutsOpen: null, confirm: null, pending: null, summary: false, multi: [], help: false, cpop: null, mpath: null, briefing: null, clockOpen: null, pres: st.pres.on ? Object.assign({}, st.pres, { on: false, laser: false, spot: '' }) : st.pres });
return;
}
if (tg === 'INPUT' || tg === 'TEXTAREA' || tg === 'SELECT') return;
const k = (e.key || '').toLowerCase();
if ((e.ctrlKey || e.metaKey) && k === 'z' && !e.shiftKey) { e.preventDefault(); this.undo(); return; }
if ((e.ctrlKey || e.metaKey) && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); this.redo(); return; }
if (e.ctrlKey || e.metaKey || e.altKey) return;
if (st.pres.on) {
if (k === 'arrowright' || k === 'pagedown' || k === ' ') { e.preventDefault(); this.presStep(1); return; }
if (k === 'arrowleft' || k === 'pageup') { e.preventDefault(); this.presStep(-1); return; }
if (k === 'l') { this.setState({ pres: Object.assign({}, st.pres, { laser: !st.pres.laser }) }); return; }
if (k === 'n') { this.setState({ pres: Object.assign({}, st.pres, { notes: !st.pres.notes }) }); return; }
return;
}
if (/^[0-9]$/.test(k)) { const t = D.TOOLS[k === '0' ? 9 : +k - 1]; if (t) this.setState({ tool: t[0], meas: [], mpath: null, multi: t[0] === 'group' ? st.multi : [] }); return; }
if (k.indexOf('arrow') === 0) {
e.preventDefault();
const d = e.shiftKey ? 20 : 5;
this.nudge(k === 'arrowleft' ? -d : (k === 'arrowright' ? d : 0), k === 'arrowup' ? -d : (k === 'arrowdown' ? d : 0));
return;
}
if (k === 'delete' || k === 'backspace') {
const so = st.selObj;
if (!so) return;
e.preventDefault();
if (so.kind === 'zone') { const z = st.zones.find((q) => q.id === so.id); if (z) this.commit({ zones: st.zones.filter((q) => q.id !== so.id) }, 'Deleted ' + z.t); }
if (so.kind === 'wp') { const p = so.id.split('|'); this.setWps(p[0], (st.wps[p[0]] || []).filter((q, j) => j !== +p[1]), 'Removed waypoint ' + (+p[1] + 1)); }
if (so.kind === 'marker') this.deleteMarker(so.id);
this.setState({ selObj: null });
return;
}
if (k === 's') { this.setState({ snap: !st.snap }); this.note(st.snap ? 'Snap off' : 'Snap on: dragged ships lock to their squadron ring'); return; }
if (k === ' ') { e.preventDefault(); this.togglePlay(); return; }
if (k === '?' || (k === '/' && e.shiftKey)) { e.preventDefault(); this.setState({ help: !st.help }); return; }
if (k === 'c') { e.preventDefault(); this.openComments('ship:' + st.sel, 420, 160); return; }
if (k === 't') { this.setState({ tidyN: st.tidyN + 1 }); return; }
if (k === 'p') { this.setState({ pres: Object.assign({}, st.pres, { on: true }) }); return; }
if (k === '[') { this.setState({ panelOpen: !st.panelOpen }); return; }
if (k === '=' || k === '+') { this.zoomBy(1.25); return; }
if (k === '-' || k === '_') { this.zoomBy(0.8); return; }
if (k === 'home') { this.resetView(); return; }
if (k === 'h') { this.toggleClean(); return; }
},

// ===== Tooltips: any element with data-tip =====
overTip(e) {
const t = e.target && e.target.closest ? e.target.closest('[data-tip]') : null;
if (t === this._tipEl) return;
this._tipEl = t;
clearTimeout(this._tt);
const st = this.state;
if (!t || st.menu || st.dragging || st.edit || st.pres.on) { if (st.tip) this.setState({ tip: null }); return; }
const text = t.getAttribute('data-tip');
if (!text) { if (st.tip) this.setState({ tip: null }); return; }
this._tt = setTimeout(() => {
if (this._tipEl !== t) return;
const r = t.getBoundingClientRect();
const a = this.toLocal(r.left, r.bottom), b = this.toLocal(r.left, r.top);
const x = Math.max(8, Math.min(1440 - 290, a[0]));
let y = a[1] + 8;
if (y > 900 - 90) y = b[1] - 8 - Math.min(90, 20 + Math.ceil(text.length / 42) * 17);
this.setState({ tip: { text, x, y } });
}, 450);
},

// ===== Presenter laser pointer =====
laserMove(e) {
if (!this.state.pres.on || !this.state.pres.laser) return;
const p = this.toLocal(e.clientX, e.clientY);
this.setState({ laser: p });
}
};

window.FleetKeys = Keys;
})();
