// verify-sw.js — keeps the service worker honest (dev-only, NOT shipped in the
// app shell / sw cache). The offline promise only holds if sw.js's APP_SHELL
// list stays in step with the files that actually exist and with what
// index.html actually loads — and that list is maintained BY HAND. This script
// asserts, without running a browser:
//   • CACHE_VERSION looks like "rallyready-vNN" (bump it when cached files change);
//   • every APP_SHELL entry exists on disk (a typo'd path makes cache.addAll
//     reject and the WHOLE install fail — the app would never work offline);
//   • every <script src> and <link rel="stylesheet"> in index.html is precached;
//   • the manifest, its icons, and the preloaded fonts are precached;
//   • all 15 close-up atlases and 11 full-scene human grids exist, are non-empty
//     WebP files, and are precached for offline drill demonstrations;
//   • every js/*.js and css/*.css on disk is precached (a new module that loads
//     fine online but was never added to APP_SHELL breaks ONLY offline — the
//     worst kind of bug to spot in a gym with no signal).
// Run with: node scripts/verify-sw.js
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

let pass = 0, fail = 0;
const fails = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); } }

const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

// ---- CACHE_VERSION sanity ---------------------------------------------------
const ver = (sw.match(/CACHE_VERSION\s*=\s*"([^"]+)"/) || [])[1];
ok(!!ver && /^rallyready-v\d+$/.test(ver), "CACHE_VERSION is set and well-formed (" + ver + ")");

// ---- Parse APP_SHELL --------------------------------------------------------
const listSrc = (sw.match(/APP_SHELL\s*=\s*\[([\s\S]*?)\]/) || [])[1] || "";
const shell = (listSrc.match(/"(\.\/[^"]*)"/g) || []).map((s) => s.slice(1, -1));
ok(shell.length > 0, "APP_SHELL parsed from sw.js (" + shell.length + " entries)");

const inShell = {};
shell.forEach((e) => { inShell[e.replace(/^\.\//, "")] = true; });
inShell["index.html"] = inShell["index.html"] || inShell[""];   // "./" serves index.html

// ---- 1. Every APP_SHELL entry exists on disk --------------------------------
shell.forEach((e) => {
  const rel = e.replace(/^\.\//, "");
  if (rel === "") return;   // "./" is the navigation root, not a file
  ok(fs.existsSync(path.join(ROOT, rel)), "APP_SHELL entry exists on disk: " + e);
});

// ---- 2. Everything index.html loads is precached ----------------------------
const scripts = (html.match(/<script[^>]+src="([^"]+)"/g) || [])
  .map((t) => t.match(/src="([^"]+)"/)[1]);
ok(scripts.length > 0, "index.html script tags parsed (" + scripts.length + ")");
scripts.forEach((s) => ok(!!inShell[s], "script precached in APP_SHELL: " + s));

const styles = (html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g) || [])
  .map((t) => t.match(/href="([^"]+)"/)[1]);
ok(styles.length > 0, "index.html stylesheets parsed (" + styles.length + ")");
styles.forEach((s) => ok(!!inShell[s], "stylesheet precached in APP_SHELL: " + s));

const preloads = (html.match(/<link[^>]+rel="preload"[^>]+href="([^"]+)"/g) || [])
  .map((t) => t.match(/href="([^"]+)"/)[1]);
preloads.forEach((s) => ok(!!inShell[s], "preloaded asset precached in APP_SHELL: " + s));

ok(!!inShell["manifest.webmanifest"], "manifest.webmanifest precached");
ok(!!inShell["index.html"], "index.html precached");

// ---- 3. Manifest icons exist and are precached ------------------------------
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.webmanifest"), "utf8"));
(manifest.icons || []).forEach((icon) => {
  const rel = String(icon.src || "").replace(/^\.\//, "");
  ok(fs.existsSync(path.join(ROOT, rel)), "manifest icon exists on disk: " + rel);
  ok(!!inShell[rel], "manifest icon precached in APP_SHELL: " + rel);
});

// ---- 4. Every js/css file on disk is precached -------------------------------
["js", "css"].forEach((dir) => {
  fs.readdirSync(path.join(ROOT, dir)).forEach((f) => {
    if (!/\.(js|css)$/.test(f)) return;
    ok(!!inShell[dir + "/" + f], dir + "/" + f + " is precached in APP_SHELL");
  });
});

// ---- 5. Fonts on disk are precached ------------------------------------------
fs.readdirSync(path.join(ROOT, "fonts")).forEach((f) => {
  if (!/\.woff2$/.test(f)) return;
  ok(!!inShell["fonts/" + f], "fonts/" + f + " is precached in APP_SHELL");
});

// ---- 6. Human-motion atlas pack is complete and offline-safe ----------------
const expectedMotionAtlases = [
  "attack-atlas.webp",
  "band-atlas.webp",
  "block-atlas.webp",
  "cooldown-atlas.webp",
  "defense-atlas.webp",
  "footwork-atlas.webp",
  "jump-atlas.webp",
  "medicine-atlas.webp",
  "pass-atlas.webp",
  "recovery-atlas.webp",
  "run-atlas.webp",
  "serve-atlas.webp",
  "set-atlas.webp",
  "underhand-atlas.webp",
  "warmup-atlas.webp"
];
const motionDir = path.join(ROOT, "images", "drill-motion");
ok(fs.existsSync(motionDir), "human-motion atlas directory exists");
const motionAtlases = fs.existsSync(motionDir)
  ? fs.readdirSync(motionDir).filter((f) => /-atlas\.webp$/.test(f)).sort()
  : [];
ok(motionAtlases.length === expectedMotionAtlases.length,
  `human-motion atlas directory contains exactly ${expectedMotionAtlases.length} WebP atlases`);
ok(JSON.stringify(motionAtlases) === JSON.stringify(expectedMotionAtlases),
  "human-motion atlas filenames match the reviewed offline pack");

expectedMotionAtlases.forEach((f) => {
  const rel = "images/drill-motion/" + f;
  const abs = path.join(motionDir, f);
  const exists = fs.existsSync(abs);
  ok(exists, rel + " exists on disk");
  if (exists) {
    const bytes = fs.readFileSync(abs);
    ok(bytes.length > 12, rel + " is non-empty");
    ok(bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP",
      rel + " has a valid WebP container header");
  }
  ok(!!inShell[rel], rel + " is precached in APP_SHELL");
});

const expectedSceneGrids = [
  "scene-box-mat-grid.webp",
  "scene-defense-grid.webp",
  "scene-equipment-grid.webp",
  "scene-jump-band-grid.webp",
  "scene-locomotion-grid.webp",
  "scene-power-grid.webp",
  "scene-recovery-grid.webp",
  "scene-roster-grid.webp",
  "scene-serving-attack-grid.webp",
  "scene-specialized-grid.webp",
  "scene-volleyball-grid.webp"
];
const sceneGrids = fs.existsSync(motionDir)
  ? fs.readdirSync(motionDir).filter((f) => /^scene-.*-grid\.webp$/.test(f)).sort()
  : [];
ok(JSON.stringify(sceneGrids) === JSON.stringify(expectedSceneGrids),
  "full-scene human grid filenames match the reviewed production pack");
expectedSceneGrids.forEach((f) => {
  const rel = "images/drill-motion/" + f;
  const abs = path.join(motionDir, f);
  const exists = fs.existsSync(abs);
  ok(exists, rel + " exists on disk");
  if (exists) {
    const bytes = fs.readFileSync(abs);
    ok(bytes.length > 12, rel + " is non-empty");
    ok(bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP",
      rel + " has a valid WebP container header");
  }
  ok(!!inShell[rel], rel + " is precached in APP_SHELL");
});

console.log("──────────────────────────────────────────");
if (fail) {
  console.log(`SW: ${pass} passed, ${fail} FAILED`);
  fails.forEach((m) => console.log("  ✗ " + m));
  process.exit(1);
} else {
  console.log(`SW: ALL ${pass} CHECKS PASSED ` +
    `(${ver}; ${shell.length} precached entries; ${scripts.length} scripts, ${styles.length} stylesheets)`);
}
