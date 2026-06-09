// verify-feed.js — integrity check for the Ideas-feed content layer (dev-only,
// NOT shipped in the app shell / sw cache). Loads the pure data modules into a
// DOM-less `window` sandbox (like scripts/verify.js) and asserts:
//   • RR.feed.data arrays are populated;
//   • every block.drillId and theme.sampleDrillIds[] resolves in RR.drills;
//   • every tipRef resolves via RR.coaching.tipById();
//   • ids are unique across all feed items (and don't collide with drill ids);
//   • vibe ∈ the allowed set; theme filters and idea skills are valid;
//   • each idea block overlaps the idea's age band.
// Run with: node scripts/verify-feed.js
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = path.join(__dirname, "..");

const store = {};
const localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }
};
const sandbox = {
  localStorage, console, Math, Date, JSON,
  encodeURIComponent, parseInt, parseFloat, isNaN, Object, Array, String, Number
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const DRILL_FILES = [];
for (let i = 1; i <= 11; i++) DRILL_FILES.push("js/drills" + (i === 1 ? "" : "-" + i) + ".js");
const FILES = ["js/state.js"].concat(DRILL_FILES).concat([
  "js/coaching.js", "js/coaching-tips-2.js", "js/coaching-tips-3.js",
  "js/team.js", "js/feed.js"
]);
// Load every feed-data*.js that exists (feed-data, feed-data-2, …).
FILES.push("js/feed-data.js");
for (let i = 2; i <= 20; i++) {
  const f = "js/feed-data-" + i + ".js";
  if (fs.existsSync(path.join(ROOT, f))) FILES.push(f);
}

for (const f of FILES) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
}
const RR = sandbox.RR;

let pass = 0, fail = 0;
const fails = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); } }

const VIBES = ["fun", "skill-builder", "quick", "game-day"];
const drillById = {};
RR.drills.forEach((d) => { drillById[d.id] = d; });
const skillSet = {};
RR.drills.forEach((d) => { skillSet[d.skill] = true; });

const data = RR.feed.data;
ok(data && typeof data === "object", "RR.feed.data exists");
["ideas", "challenges", "mindset", "themes"].forEach((k) => {
  ok(Array.isArray(data[k]) && data[k].length > 0, `data.${k} is populated (${(data[k] || []).length})`);
});

// Unique ids across every feed item; flag collisions with drill ids too.
const seenId = {};
const allItems = [].concat(data.ideas, data.challenges, data.mindset, data.themes);
allItems.forEach((it) => {
  if (!it || !it.id) { ok(false, "every feed item has an id"); return; }
  if (seenId[it.id]) ok(false, "duplicate feed id: " + it.id);
  seenId[it.id] = true;
  if (drillById[it.id]) ok(false, "feed id collides with a drill id: " + it.id);
});
ok(true, "id scan complete (" + allItems.length + " items)");

function tipOk(ref) { return !ref || (RR.coaching.tipById && RR.coaching.tipById(ref)); }

// IDEAS
data.ideas.forEach((it) => {
  ok(it.type === "idea", it.id + ": type is 'idea'");
  ok(VIBES.indexOf(it.vibe) !== -1, it.id + ": valid vibe (" + it.vibe + ")");
  ok(typeof it.minutes === "number" && it.minutes > 0, it.id + ": minutes is a positive number");
  ok(typeof it.ageMin === "number" && typeof it.ageMax === "number" && it.ageMin <= it.ageMax, it.id + ": valid age band");
  ok(tipOk(it.tipRef), it.id + ": tipRef resolves (" + it.tipRef + ")");
  ok(Array.isArray(it.blocks) && it.blocks.length > 0, it.id + ": has blocks");
  (it.blocks || []).forEach((b, i) => {
    const d = drillById[b.drillId];
    ok(!!d, it.id + " block " + i + ": drillId resolves (" + b.drillId + ")");
    ok(typeof b.minutes === "number" && b.minutes > 0, it.id + " block " + i + ": minutes is positive");
    if (d) ok(d.ageMin <= it.ageMax && d.ageMax >= it.ageMin,
      it.id + " block " + i + ": drill " + b.drillId + " overlaps idea age band " + it.ageMin + "-" + it.ageMax);
  });
});

// CHALLENGES
data.challenges.forEach((it) => {
  ok(it.type === "challenge", it.id + ": type is 'challenge'");
  ok(VIBES.indexOf(it.vibe) !== -1, it.id + ": valid vibe (" + it.vibe + ")");
  ok(!!it.title && !!it.body, it.id + ": has title + body");
  ok(!it.skill || skillSet[it.skill], it.id + ": skill is a real category (" + it.skill + ")");
  ok(typeof it.ageMin === "number" && typeof it.ageMax === "number", it.id + ": numeric age band");
});

// MINDSET
data.mindset.forEach((it) => {
  ok(it.type === "mindset", it.id + ": type is 'mindset'");
  ok(!!it.title && !!it.body, it.id + ": has title + body");
  ok(tipOk(it.tipRef), it.id + ": tipRef resolves (" + it.tipRef + ")");
});

// THEMES
data.themes.forEach((it) => {
  ok(it.type === "theme", it.id + ": type is 'theme'");
  ok(!!it.title && !!it.blurb, it.id + ": has title + blurb");
  const f = it.filter || {};
  ok(!!(f.skill || f.vibe), it.id + ": filter has a skill or vibe");
  if (f.skill) ok(!!skillSet[f.skill], it.id + ": filter.skill is real (" + f.skill + ")");
  if (f.vibe) ok(VIBES.indexOf(f.vibe) !== -1, it.id + ": filter.vibe valid (" + f.vibe + ")");
  (it.sampleDrillIds || []).forEach((id, i) => {
    ok(!!drillById[id], it.id + " sample " + i + ": drillId resolves (" + id + ")");
  });
});

console.log("──────────────────────────────────────────");
if (fail) {
  console.log(`FEED: ${pass} passed, ${fail} FAILED`);
  fails.forEach((m) => console.log("  ✗ " + m));
  process.exit(1);
} else {
  console.log(`FEED: ALL ${pass} CHECKS PASSED ` +
    `(${data.ideas.length} ideas, ${data.challenges.length} challenges, ` +
    `${data.mindset.length} mindset, ${data.themes.length} themes)`);
}
