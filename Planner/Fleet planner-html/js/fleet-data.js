// Fleet Planner mockup: static data.
// Handles are fictional. Ship stats come from starcitizen.tools (Oct 2026) and stay editable in the UI.
(function () {
'use strict';

// ===== Status =====
const ST = { Ready: '#31C48D', Mustering: '#FBBF24', Active: '#3F83F8', RTB: '#9CA3AF', Refitting: '#F05252' };
const ST_TIP = {
Ready: 'crewed and waiting for orders',
Mustering: 'still gathering crew or travelling to the fleet',
Active: 'on task right now',
RTB: 'returning to base',
Refitting: 'repairing or rearming, not available'
};

// ===== Squadrons =====
const SQ_ORDER = ['Command', 'Lifeline', 'Vanguard', 'Logistics', 'Overwatch'];
const SQC = { Command: '#60A5FA', Lifeline: '#22D3EE', Vanguard: '#F87171', Logistics: '#FB923C', Overwatch: '#A78BFA' };
const SQN = { Command: 'CMD', Lifeline: '1', Vanguard: '2', Logistics: '3', Overwatch: '4' };
const DEFNAME = { Lifeline: 'Medic' };
const PALETTE = ['#60A5FA', '#22D3EE', '#F87171', '#FB923C', '#A78BFA', '#34D399', '#FBBF24', '#F472B6', '#2DD4BF', '#818CF8', '#A3E635', '#E5E7EB'];
const LEADS0 = { Command: ['Marrow_6', null], Lifeline: ['Tessel', 'Pellam'], Vanguard: ['Brightwater', 'Corvid_3'], Logistics: ['Sable_Run', 'Orrin'], Overwatch: ['Okapi_9', 'Lumen_2'] };
const RINGS = { Command: [130, 42, 0], Lifeline: [265, 62, 12], Vanguard: [395, 118, -6], Logistics: [370, 98, 8], Overwatch: [330, 108, -18] };

// ===== Hulls (wiki stats) =====
// guns/missiles: n name, s size, q count, r range in metres (missiles: max lock range).
// beds: t tier (1 best), n count. req: crew needed to count as crewed.
const IDRIS_SEATS = ['Captain', 'Pilot', 'Co-Pilot', 'Comms', 'Tactical', 'Science', 'Engineer', 'Medic', 'Turret 1', 'Turret 2', 'Turret 3', 'Turret 4', 'Turret 5', 'Turret 6', 'Turret 7', 'Remote Turret 1', 'Remote Turret 2', 'Railgun', 'Security 1', 'Security 2', 'Security 3', 'Security 4', 'Brig', 'Hangar Deck', 'Medic 2', 'Cargo', 'Engineer 2', 'Engineer 3'];
const HULLS = {
'Idris-P': { href: '#capital', role: 'Capital', wiki: 'Combat · Capital ship', scm: 110, h2: 59.8, qf: 31.5, qt: '513.9 Gm', cargo: '—', req: 12, beds: [{ t: 2, n: 1 }, { t: 3, n: 4 }], seats: IDRIS_SEATS,
guns: [{ n: 'CF-557 Galdereen Repeater', s: 5, q: 14, r: 3197 }, { n: 'M7A Cannon', s: 5, q: 2, r: 4003 }, { n: 'Revenant Gatling', s: 4, q: 8, r: 2799 }, { n: 'M2C "Swarm" PDC', s: 2, q: 11, r: 1605 }], missiles: [] },
'Perseus': { href: '#gunship', role: 'Gunships', wiki: 'Combat · Heavy gunship', scm: 150, h2: 54.6, qf: 19.8, qt: '161.8 Gm', cargo: '—', req: 4, beds: [], seats: ['Pilot', 'Top Turret', 'Bottom Turret', 'Torpedo Console', 'Co-Pilot', 'Gunner'],
guns: [{ n: 'Medusa Cannon', s: 8, q: 2, r: 9703 }, { n: 'Mantis GT-220 Gatling', s: 3, q: 6, r: 2398 }, { n: 'M2C "Swarm" PDC', s: 2, q: 6, r: 1605 }], missiles: [{ n: 'Reaper V', s: 5, q: 20, r: 30000 }] },
'Gladius': { href: '#fighter', role: 'Fighters', wiki: 'Combat · Fighter', scm: 226, h2: 1.6, qf: 0.6, qt: '32.2 Gm', cargo: '—', req: 1, beds: [], seats: ['Pilot'],
guns: [{ n: 'CF-337 Panther Repeater', s: 3, q: 2, r: 1924 }, { n: 'Mantis GT-220 Gatling', s: 3, q: 1, r: 2398 }], missiles: [{ n: 'Ignite II', s: 2, q: 4, r: 10000 }, { n: 'Arrester III', s: 3, q: 2, r: 25000 }] },
'Apollo Medivac': { href: '#medical', role: 'Specialized', wiki: 'Specialized · Medical', scm: 175, h2: 18.9, qf: 9.4, qt: '862.4 Gm', cargo: '—', req: 2, beds: [{ t: 3, n: 6 }], seats: ['Pilot', 'Medic'],
guns: [{ n: 'Mantis GT-220 Gatling', s: 3, q: 2, r: 2398 }, { n: 'CF-447 Rhino Repeater', s: 4, q: 2, r: 2246 }], missiles: [{ n: 'Ignite II', s: 2, q: 8, r: 10000 }] },
'Cutlass Red': { href: '#cutlass', role: 'Specialized', wiki: 'Specialized · Medical', scm: 212, h2: 6.6, qf: 4.6, qt: '703.4 Gm', cargo: '—', req: 1, beds: [{ t: 3, n: 2 }], seats: ['Pilot', 'Co-Pilot'],
guns: [{ n: 'CF-337 Panther Repeater', s: 3, q: 2, r: 1924 }, { n: 'Mantis GT-220 Gatling', s: 3, q: 2, r: 2398 }], missiles: [] },
'Caterpillar': { href: '#freight', role: 'Cargo', wiki: 'Cargo', scm: 130, h2: 43.2, qf: 18.8, qt: '153.6 Gm', cargo: '576 SCU', req: 2, beds: [], seats: ['Pilot', 'Engineering', 'Tractor Beam', 'Co-Pilot'],
guns: [{ n: 'CF-447 Rhino Repeater', s: 4, q: 2, r: 2246 }], missiles: [] },
'Terrapin': { href: '#scout', role: 'Exploration', wiki: 'Exploration', scm: 200, h2: 8, qf: 1.6, qt: '175.6 Gm', cargo: '—', req: 1, beds: [], seats: ['Pilot', 'Turret'],
guns: [{ n: 'CF-227 Badger Repeater', s: 2, q: 2, r: 1734 }], missiles: [] }
};
// Rough hydrogen range per full tank in km. The wiki gives no burn rate, so these are estimates you can edit.
const H2_RANGE_KM = { 'Idris-P': 900, 'Perseus': 700, 'Gladius': 120, 'Apollo Medivac': 450, 'Cutlass Red': 260, 'Caterpillar': 600, 'Terrapin': 300 };

// ===== Seat roles (for seat matching) =====
const SEAT_ROLE = (seat) => {
if (/Pilot/.test(seat)) return 'Pilot';
if (/Turret|Gunner|Railgun|Torpedo/.test(seat)) return 'Gunner';
if (/Medic/.test(seat)) return 'Medic';
if (/Engineer/.test(seat)) return 'Engineer';
if (/Security|Brig/.test(seat)) return 'Security';
if (/Captain|Comms|Tactical|Science/.test(seat)) return 'Bridge';
return 'Cargo';
};
const ROLES = ['Pilot', 'Gunner', 'Medic', 'Engineer', 'Security', 'Bridge', 'Cargo'];

// ===== Fleet (owner, hull, squadron, element, status, crew filled) =====
const BASE = [
['Marrow_6', 'Idris-P', 'Command', 'CMD', 'Ready', 12],
['Tessel', 'Cutlass Red', 'Lifeline', '1-1', 'Ready', 2],
['Kestrel_7', 'Apollo Medivac', 'Lifeline', '1-1', 'Active', 2],
['Pellam', 'Apollo Medivac', 'Lifeline', '1-2', 'Ready', 1],
['Dovetail', 'Cutlass Red', 'Lifeline', '1-2', 'Mustering', 1],
['Brightwater', 'Perseus', 'Vanguard', '2-1', 'Ready', 4],
['Corvid_3', 'Gladius', 'Vanguard', '2-1', 'Ready', 1],
['Hollis', 'Gladius', 'Vanguard', '2-2', 'Mustering', 1],
['Nyx_Runner', 'Gladius', 'Vanguard', '2-2', 'Refitting', 0],
['Sable_Run', 'Caterpillar', 'Logistics', '3-1', 'Active', 3],
['Orrin', 'Caterpillar', 'Logistics', '3-1', 'Mustering', 2],
['Vesper_4', 'Caterpillar', 'Logistics', '3-2', 'RTB', 2],
['Okapi_9', 'Terrapin', 'Overwatch', '4-1', 'Active', 2],
['Lumen_2', 'Terrapin', 'Overwatch', '4-1', 'Ready', 1]
].map(([h, hull, squad, el, status, filled]) => ({ h, hull, squad, el, status, filled }));

// ===== Members (fictional handles) =====
const POOL = ['Vexa', 'Rook_11', 'Halcyon', 'Tarn', 'Mirelle', 'Quill_5', 'Dash_Ortega', 'Senna', 'Bramble', 'Kito', 'Juno_3', 'Wexley', 'Ashgrove', 'Pike_7', 'Corra', 'Lantern', 'Ferro', 'Nimbus_4', 'Ostrava', 'Sorrel', 'Tamsin', 'Vale_9', 'Wren', 'Yarrow', 'Zephyr_2', 'Grit', 'Holloway', 'Iskra', 'Merit'];
const DEFAULT_SEATS = {};
let pi = 0;
BASE.forEach((b) => {
const seats = HULLS[b.hull].seats;
DEFAULT_SEATS[b.h] = seats.map((s, i) => {
if (i >= b.filled) return '';
if (i === 0) return b.h;
return POOL[pi++] || '';
});
});
const MEMBERS = BASE.map((b) => b.h).concat(POOL).map((h, i) => {
const r1 = ROLES[(i * 3) % ROLES.length], r2 = ROLES[(i * 5 + 2) % ROLES.length];
return { h, prefs: r1 === r2 ? [r1] : [r1, r2] };
});
MEMBERS.forEach((m) => {
const own = BASE.find((b) => b.h === m.h);
if (own) m.prefs = ['Pilot'].concat(m.prefs.filter((p) => p !== 'Pilot')).slice(0, 2);
});

// ===== Tools =====
const TOOLS = [
['select', 'Select', 'M5 3l14 7-6 2-2 6z', 'Select (1): click a ship to inspect it, or drag it to a new spot.'],
['move', 'Reposition', 'M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3', 'Reposition (2): drag ships, waypoints, markers and zones to set the formation.'],
['group', 'Group into squadron', 'M4 6h7v7H4zM13 11h7v7h-7z', 'Group (3): click ships or drag a box around them, then move them to a squadron together.'],
['rally', 'Set rally point', 'M6 21V4M6 5h11l-2 4 2 4H6', 'Rally point (4): click the map to add waypoints to the selected ship\'s route.'],
['marker', 'Place marker', 'M12 2l3 7h7l-5.5 4.5 2 7.5L12 16.5 5.5 21l2-7.5L2 9h7z', 'Marker (5): place objectives, extraction points, threats, hazards and casualties.'],
['anno', 'Annotate', 'M4 20l4-1 11-11-3-3L5 16zM14 6l3 3', 'Annotate (6): draw arrows, freehand lines, text and highlight circles for briefings.'],
['measure', 'Measure', 'M4 20L20 4M7 17l2 2M10 14l2 2M13 11l2 2M16 8l2 2', 'Measure (7): click two ships to see the distance between them.'],
['zone', 'Draw zone', 'M4 4h6M14 4h6v6M20 14v6h-6M10 20H4v-6M4 10V4', 'Draw zone (8): drag on the map to outline where a squadron should hold.'],
['cmd', 'Set commander', 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z', 'Set commander (9): pick the ship the fleet commander flies.'],
['loadout', 'Mission loadout', 'M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8', 'Mission loadout (0): see a ship\'s stock weapons and toggle their range arcs.']
];
const HINTS = {
select: 'Select: click a ship · drag to move · right-click anything for actions',
move: 'Reposition: drag ships, waypoints, markers and zones · drag a zone corner to resize',
group: 'Group: click ships or drag a box on empty space (Shift adds), then choose a squadron',
rally: 'Rally point: click the map to add waypoints · double-click a leg to break it',
marker: 'Marker: pick a type above, then click the map to place it',
anno: 'Annotate: pick a pen above · drag for arrows and pen · click for text and circles',
measure: 'Measure: click two ships to see their separation',
zone: 'Draw zone: drag on the map · double-click a zone label to rename it',
cmd: 'Set commander: click the ship the commander flies',
loadout: 'Mission loadout: click a ship, then toggle weapon arcs in its Ship tab'
};

// ===== Phases =====
const PHASES = [['Muster', 'gather crews at Port Olisar'], ['Stage', 'form up in Crusader orbit'], ['Launch', 'depart toward the objective'], ['Hold', 'hold position and wait for orders'], ['Recover', 'return, repair and debrief']];
const PHASE_MIN = [0, 15, 30, 60, 120];

// ===== Markers =====
const MARKERS = {
objective: { label: 'Objective', c: '#34D399', tip: 'Objective: where the fleet needs to be or what it must do.' },
extraction: { label: 'Extraction', c: '#22D3EE', tip: 'Extraction: the pull-out point once the job is done.' },
threat: { label: 'Threat', c: '#F87171', tip: 'Threat: a hostile with a type and strength. Give it a path to see it move during playback.' },
hazard: { label: 'Hazard', c: '#FB923C', tip: 'Hazard: debris, gas, mines or a no-fly area, drawn as a soft circle.' },
casualty: { label: 'Casualty', c: '#F472B6', tip: 'Casualty: a downed player. The nearest free medical ship is routed to it automatically.' }
};
const THREAT_KINDS = ['Fighters', 'Capital', 'Ground', 'Turret'];
const TIER_C = { 1: '#F05252', 2: '#FB923C', 3: '#FBBF24' };
const ANNO_MODES = [['arrow', 'Arrow', 'Drag to draw an arrow.'], ['pen', 'Pen', 'Drag to draw freehand.'], ['text', 'Text', 'Click to place a text note.'], ['circle', 'Circle', 'Click to drop a pulsing highlight circle.']];
const COMMENT_TYPES = { note: ['Note', '#9CA3AF'], task: ['Task', '#FBBF24'], warn: ['Warning', '#F05252'] };
const ATTEND = [['yes', 'Yes', '#31C48D'], ['maybe', 'Maybe', '#FBBF24'], ['late', 'Late', '#60A5FA'], ['no', 'No', '#F05252']];
const LAYOUTS0 = ['Operation A', 'Operation B', 'Training run'];

window.FleetData = { ST, ST_TIP, SQ_ORDER, SQC, SQN, DEFNAME, PALETTE, LEADS0, RINGS, HULLS, H2_RANGE_KM, SEAT_ROLE, ROLES, BASE, MEMBERS, DEFAULT_SEATS, TOOLS, HINTS, PHASES, PHASE_MIN, MARKERS, THREAT_KINDS, TIER_C, ANNO_MODES, COMMENT_TYPES, ATTEND, LAYOUTS0 };
})();
