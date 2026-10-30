// Fleet Planner mockup: browser-only saving (no backend yet) and clipboard.
(function () {
'use strict';

const PREFIX = 'fleetplan.v3.';

// ===== Safe storage =====
const get = (k) => { try { return localStorage.getItem(PREFIX + k); } catch (e) { return null; } };
const set = (k, v) => { try { localStorage.setItem(PREFIX + k, v); return true; } catch (e) { return false; } };
const del = (k) => { try { localStorage.removeItem(PREFIX + k); } catch (e) {} };

// ===== Layout list =====
const loadLayouts = (fallback) => {
try { const l = JSON.parse(get('layouts') || 'null'); if (Array.isArray(l) && l.length) return l; } catch (e) {}
return fallback.slice();
};
const saveLayouts = (list) => set('layouts', JSON.stringify(list));

// ===== Layout documents =====
const loadDoc = (name) => { try { return JSON.parse(get('doc.' + name) || '{}') || {}; } catch (e) { return {}; } };
const saveDoc = (name, doc) => set('doc.' + name, JSON.stringify(doc));
const removeDoc = (name) => del('doc.' + name);
const renameDoc = (from, to) => { const d = get('doc.' + from); if (d) set('doc.' + to, d); del('doc.' + from); };

// ===== Clipboard =====
const copyText = (text) => {
try {
if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(() => true, () => false);
} catch (e) {}
return Promise.resolve(false);
};

window.FleetStore = { loadLayouts, saveLayouts, loadDoc, saveDoc, removeDoc, renameDoc, copyText };
})();
