// Fleet Planner mockup: fixed map layout for the scene (default slots for the 14 demo ships).
(function () {
'use strict';

// ===== Ship slots =====
// href: hull symbol, x/y/w/h: drawn box, behind: hidden by Crusader (drawn at 60%).
const GEO = {"Okapi_9": {"href": "#scout", "x": 477.0, "y": 418.0, "w": 44.0, "h": 26.0, "behind": true}, "Tessel": {"href": "#cutlass", "x": 675.0, "y": 394.0, "w": 44.0, "h": 27.0, "behind": true}, "Dovetail": {"href": "#cutlass", "x": 823.0, "y": 454.0, "w": 44.0, "h": 27.0, "behind": true}, "Sable_Run": {"href": "#freight", "x": 968.0, "y": 370.0, "w": 52.0, "h": 24.0, "behind": true}, "Corvid_3": {"href": "#fighter", "x": 494.0, "y": 461.0, "w": 36.0, "h": 21.0, "behind": true}, "Brightwater": {"href": "#gunship", "x": 370.0, "y": 528.0, "w": 64.0, "h": 36.0, "behind": false}, "Nyx_Runner": {"href": "#fighter", "x": 528.0, "y": 612.0, "w": 36.0, "h": 21.0, "behind": false}, "Hollis": {"href": "#fighter", "x": 428.0, "y": 606.0, "w": 36.0, "h": 21.0, "behind": false}, "Lumen_2": {"href": "#scout", "x": 515.0, "y": 418.0, "w": 44.0, "h": 26.0, "behind": false}, "Pellam": {"href": "#medical", "x": 881.0, "y": 523.0, "w": 48.0, "h": 29.0, "behind": false}, "Kestrel_7": {"href": "#medical", "x": 645.0, "y": 537.0, "w": 48.0, "h": 29.0, "behind": false}, "Orrin": {"href": "#freight", "x": 1010.0, "y": 441.0, "w": 56.0, "h": 26.0, "behind": false}, "Vesper_4": {"href": "#freight", "x": 887.0, "y": 553.0, "w": 56.0, "h": 26.0, "behind": false}, "Marrow_6": {"href": "#capital", "x": 683.0, "y": 570.0, "w": 120.0, "h": 44.0, "behind": false}};

// ===== Label anchors (top-left of each ship's label) =====
const BL = {"Kestrel_7": [702.0, 516.0], "Tessel": [722.0, 396.0], "Dovetail": [868.0, 450.0], "Pellam": [872.0, 490.0], "Brightwater": [360.0, 500.0], "Corvid_3": [540.0, 482.0], "Hollis": [330.0, 636.0], "Nyx_Runner": [572.0, 640.0], "Okapi_9": [396.0, 436.0], "Lumen_2": [560.0, 396.0], "Sable_Run": [1020.0, 380.0], "Orrin": [1070.0, 436.0], "Vesper_4": [956.0, 560.0], "Marrow_6": [690.0, 650.0]};

// ===== Squadron label anchors [x, y, translateX] =====
const SQ_LABEL = { Vanguard: [340, 576, '0'], Overwatch: [420, 404, '0'], Lifeline: [660, 362, '0'], Logistics: [960, 346, '0'], Command: [743, 628, '-50%'] };

// ===== Planned ghost positions [x, y] =====
const GHOSTS = { Brightwater: [300, 464], Orrin: [1116, 517], Pellam: [962, 612.5] };

// ===== Helpers =====
const center = (key) => { const g = GEO[key]; return g ? [g.x + g.w / 2, g.y + g.h / 2] : null; };

window.FleetScene = { GEO, BL, SQ_LABEL, GHOSTS, center };
})();
