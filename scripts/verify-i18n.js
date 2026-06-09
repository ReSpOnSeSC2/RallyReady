// verify-i18n.js — health check for the EN→RO localization layer (dev-only,
// NOT shipped in the app shell / sw cache). Loads i18n.js plus every dictionary
// file into a DOM-less sandbox (like scripts/verify.js) and asserts the things
// that silently break translations:
//   • every dictionary VALUE is a real, non-empty string;
//   • every dictionary KEY is already canonical (straight quotes, no nbsp) —
//     the engine canonicalizes the SOURCE text before lookup, so a key written
//     with curly quotes can never match and is a dead entry;
//   • no key is registered twice with two different translations (last write
//     wins silently, so one of them is a lie);
// and then REPORTS (informational, never a failure) how much of the drill
// library actually translates: names, setup, steps, cues, easier/harder.
// Untranslated strings fall back to English by design, so coverage is a
// dashboard here, not a gate — the structural checks above are the gate.
// Run with: node scripts/verify-i18n.js
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

function load(f) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
}

// Engine first, then hook add() to capture registrations, then the dictionaries.
load("js/state.js");
load("js/i18n.js");
const RR = sandbox.RR;

const captured = { ro: {} };
const conflicts = [];
const origAdd = RR.i18n.add;
RR.i18n.add = function (map, lang) {
  lang = lang || "ro";
  captured[lang] = captured[lang] || {};
  if (map) Object.keys(map).forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(captured[lang], k) && captured[lang][k] !== map[k]) {
      conflicts.push(k);
    }
    captured[lang][k] = map[k];
  });
  return origAdd.call(RR.i18n, map, lang);
};

const DICT_FILES = ["js/i18n-ui.js", "js/i18n-content.js", "js/i18n-content2.js", "js/i18n-positions.js"];
DICT_FILES.forEach(load);

// The drill library, for coverage reporting.
for (let i = 1; i <= 11; i++) load("js/drills" + (i === 1 ? "" : "-" + i) + ".js");

let pass = 0, fail = 0;
const fails = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); } }

// Same canonicalization as i18n.js — keys must already be in this form.
function canon(s) {
  return s.replace(/[“”„‟]/g, '"')
          .replace(/[‘’‚‛]/g, "'")
          .replace(/ /g, " ");
}

// ---- Structural checks (these gate) -----------------------------------------
const dict = captured.ro;
const keys = Object.keys(dict);
ok(keys.length > 200, "dictionary loaded (" + keys.length + " entries)");
keys.forEach((k) => {
  const v = dict[k];
  ok(typeof v === "string" && v.trim().length > 0, "value is a non-empty string for: " + k);
  ok(k === canon(k), "key is canonical (straight quotes, no nbsp): " + k);
  ok(k === k.trim(), "key has no stray leading/trailing whitespace: " + JSON.stringify(k));
});
ok(conflicts.length === 0,
  "no key registered twice with different translations" +
  (conflicts.length ? " (" + conflicts.slice(0, 5).join(" | ") + ")" : ""));

// ---- Coverage report (informational only) -----------------------------------
// Flip the app to Romanian so t() exercises the same path the UI uses
// (exact dictionary match first, then the pattern rules).
RR.state.update({ lang: "ro" });
const t = RR.i18n.t;
function translated(s) { return !s || t(s) !== s; }

const fields = { name: [0, 0], setup: [0, 0], steps: [0, 0], cues: [0, 0], "easier/harder": [0, 0] };
const missedNames = [];
function tally(bucket, s) {
  if (!s) return;
  bucket[1]++;
  if (translated(s)) bucket[0]++;
}
RR.drills.forEach((d) => {
  tally(fields.name, d.name);
  if (d.name && !translated(d.name) && missedNames.length < 5) missedNames.push(d.name);
  tally(fields.setup, d.setup);
  (d.steps || []).forEach((s) => tally(fields.steps, s));
  (d.cues || []).forEach((s) => tally(fields.cues, s));
  tally(fields["easier/harder"], d.easier);
  tally(fields["easier/harder"], d.harder);
});

console.log("──────────────────────────────────────────");
console.log("I18N COVERAGE (drill library, " + RR.drills.length + " drills — informational):");
Object.keys(fields).forEach((k) => {
  const f = fields[k];
  const pct = f[1] ? Math.round((f[0] / f[1]) * 100) : 100;
  console.log("  " + k + ": " + f[0] + "/" + f[1] + " (" + pct + "%)");
});
if (missedNames.length) console.log("  e.g. untranslated names: " + missedNames.join(" | "));

console.log("──────────────────────────────────────────");
if (fail) {
  console.log(`I18N: ${pass} passed, ${fail} FAILED`);
  fails.slice(0, 20).forEach((m) => console.log("  ✗ " + m));
  if (fails.length > 20) console.log("  … and " + (fails.length - 20) + " more");
  process.exit(1);
} else {
  console.log(`I18N: ALL ${pass} CHECKS PASSED (${keys.length} dictionary entries)`);
}
