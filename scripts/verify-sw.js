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

console.log("──────────────────────────────────────────");
if (fail) {
  console.log(`SW: ${pass} passed, ${fail} FAILED`);
  fails.forEach((m) => console.log("  ✗ " + m));
  process.exit(1);
} else {
  console.log(`SW: ALL ${pass} CHECKS PASSED ` +
    `(${ver}; ${shell.length} precached entries; ${scripts.length} scripts, ${styles.length} stylesheets)`);
}
