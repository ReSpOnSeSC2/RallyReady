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
//   • all 15 close-up atlases, 11 full-scene WebP grids, and the reviewed PNG
//     defensive-performance grid exist and are precached for offline demos;
//   • the local Three.js CoachCam runtime + Blender GLB are warmed offline;
//   • every js/*.js and css/*.css on disk is precached (a new module that loads
//     fine online but was never added to APP_SHELL breaks ONLY offline — the
//     worst kind of bug to spot in a gym with no signal);
//   • a worker installs a coherent core shell before claiming clients and
//     serves it alongside locally migrated media when the network is gone.
// Run with: node scripts/verify-sw.js
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("node:vm");
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
function assetFile(url) { return url.split("?", 1)[0]; }
const shellFiles = new Set(Object.keys(inShell).map(assetFile));
const release = (ver || "").match(/\d+$/)?.[0];
ok(!!inShell[`index.html?v=${release}`], "versioned document precached in APP_SHELL");
ok(html.includes(`<meta name="rallyready-release" content="${release}" />`), "document release matches the worker cache");

// ---- 1. Every APP_SHELL entry exists on disk --------------------------------
shell.forEach((e) => {
  const rel = assetFile(e.replace(/^\.\//, ""));
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
ok(shellFiles.has("index.html"), "index.html precached");

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
    ok(shellFiles.has(dir + "/" + f), dir + "/" + f + " is precached in APP_SHELL");
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

const defensivePerformanceGrid = "scene-defense-pro-grid.png";
const defensivePerformanceRel = "images/drill-motion/" + defensivePerformanceGrid;
const defensivePerformanceAbs = path.join(motionDir, defensivePerformanceGrid);
const defensivePerformanceExists = fs.existsSync(defensivePerformanceAbs);
ok(defensivePerformanceExists, defensivePerformanceRel + " exists on disk");
if (defensivePerformanceExists) {
  const bytes = fs.readFileSync(defensivePerformanceAbs);
  ok(bytes.length > 24, defensivePerformanceRel + " is non-empty");
  ok(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    defensivePerformanceRel + " has a valid PNG signature");
}
ok(!!inShell[defensivePerformanceRel], defensivePerformanceRel + " is precached in APP_SHELL");

// ---- 7. CoachCam's lazy runtime remains completely same-origin + offline ----
const coachCamAssets = [
  "models/coachcam/rolls-and-sprawls.glb",
  "models/coachcam/coachcam-library.glb",
  "vendor/three/three.core.min.js",
  "vendor/three/three.module.min.js",
  "vendor/three/addons/loaders/GLTFLoader.js",
  "vendor/three/addons/utils/BufferGeometryUtils.js",
  "vendor/three/addons/utils/SkeletonUtils.js"
];
coachCamAssets.forEach((rel) => {
  const abs = path.join(ROOT, rel);
  ok(fs.existsSync(abs), rel + " exists on disk");
  if (fs.existsSync(abs)) ok(fs.statSync(abs).size > 100, rel + " is non-empty");
  ok(!!inShell[rel], rel + " is precached in APP_SHELL");
});
const coachCamGlb = path.join(ROOT, "models", "coachcam", "rolls-and-sprawls.glb");
if (fs.existsSync(coachCamGlb)) {
  const bytes = fs.readFileSync(coachCamGlb);
  ok(bytes.subarray(0, 4).toString("ascii") === "glTF",
    "Rolls and Sprawls has a valid binary glTF signature");
  ok(bytes.readUInt32LE(4) === 2, "Rolls and Sprawls uses glTF 2.0");
  ok(bytes.readUInt32LE(8) === bytes.length, "Rolls and Sprawls GLB declares its exact file length");
}
const coachCamLibraryGlb = path.join(ROOT, "models", "coachcam", "coachcam-library.glb");
if (fs.existsSync(coachCamLibraryGlb)) {
  const bytes = fs.readFileSync(coachCamLibraryGlb);
  ok(bytes.subarray(0, 4).toString("ascii") === "glTF",
    "shared CoachCam library has a valid binary glTF signature");
  ok(bytes.readUInt32LE(4) === 2, "shared CoachCam library uses glTF 2.0");
  ok(bytes.readUInt32LE(8) === bytes.length,
    "shared CoachCam library GLB declares its exact file length");
  ok(bytes.length < 8 * 1024 * 1024, "shared CoachCam library and exercise variants remain below 8 MiB");
}

async function verifyReleaseLifecycle() {
  const scope = "https://example.test/RallyReady/";
  const requestUrl = (request) => typeof request === "string" ? request : request.url;
  const handlers = {};
  const storage = new Map();
  const network = [];
  let documentBody = "<meta name=\"rallyready-release\" content=\"90\" />";
  let offline = false;
  let skipped = 0;
  let claimed = 0;

  async function fetchAsset(request) {
    network.push(request.url);
    if (offline) throw new Error("offline");
    const asset = new URL(request.url);
    const response = new Response(asset.pathname.endsWith("/index.html") ? documentBody : asset.href);
    Object.defineProperty(response, "type", { value: "basic" });
    return response;
  }

  const caches = {
    async keys() { return [...storage.keys()]; },
    async delete(name) { return storage.delete(name); },
    async open(name) {
      if (!storage.has(name)) storage.set(name, new Map());
      const assets = storage.get(name);
      return {
        async keys() { return [...assets.keys()].map((key) => new Request(key)); },
        async match(request) { return assets.get(requestUrl(request))?.clone(); },
        async put(request, response) { assets.set(requestUrl(request), response); },
        async addAll(requests) {
          const responses = await Promise.all(requests.map(fetchAsset));
          requests.forEach((request, i) => assets.set(request.url, responses[i]));
        }
      };
    },
    async match(request, { cacheName }) {
      return storage.get(cacheName)?.get(requestUrl(request))?.clone();
    }
  };
  const self = {
    registration: { scope },
    addEventListener: (type, fn) => { handlers[type] = fn; },
    skipWaiting: async () => { skipped += 1; },
    clients: { claim: async () => { claimed += 1; } }
  };
  vm.runInNewContext(sw, { self, caches, URL, Request, fetch: fetchAsset, console }, { filename: "sw.js" });

  function fire(type, props = {}) {
    let pending;
    const wait = (value) => { pending = value; };
    handlers[type]({ waitUntil: wait, respondWith: wait, ...props });
    return pending;
  }
  async function load(rel, mode = "same-origin") {
    return (await fire("fetch", { request: { url: new URL(rel, scope).href, method: "GET", mode } })).text();
  }

  const appPath = scripts.find((url) => assetFile(url) === "js/app.js");
  const demoUrl = new URL("models/coachcam/coachcam-library.glb", scope).href;
  const legacy = await caches.open("rallyready-v91");
  await legacy.put(new URL(appPath, scope).href, new Response("old router"));
  await legacy.put(demoUrl, new Response("existing demo"));
  await caches.open("unrelated-cache");

  const rejected = await fire("install").then(() => false, () => true);
  ok(rejected && skipped === 0, "worker rejects stale CDN HTML without activating");
  documentBody = html;
  await fire("install");
  ok(skipped === 1, "worker requests activation after installing its core shell");
  ok(network.every((url) => !/\/(images|models|vendor)\//.test(url)), "large demos do not delay worker installation");
  await fire("activate");
  ok(claimed === 1, "worker claims clients on activation");
  ok((await caches.keys()).includes("unrelated-cache"), "worker keeps unrelated origin caches");

  offline = true;
  ok(await load("./?older-bookmark=1", "navigate") === html, "offline root serves the installed HTML release");
  ok(await load("index.html", "navigate") === html, "installed app start URL serves the pinned HTML release");
  ok(await load(appPath) === new URL(appPath, scope).href, "installed app serves its router despite an older cached version");
  ok(await load(demoUrl) === "existing demo", "legacy offline media remains available during activation");
  await fire("message", { data: { type: "RALLYREADY_WARM_MEDIA" } });
  ok(!(await caches.keys()).includes("rallyready-v91"), "warmup retires the old cache after migrating its media");
  ok(await load(demoUrl) === "existing demo", "legacy media stays available offline after migration");
}

verifyReleaseLifecycle().catch((error) => ok(false, error.stack)).then(() => {
  console.log("──────────────────────────────────────────");
  if (fail) {
    console.log(`SW: ${pass} passed, ${fail} FAILED`);
    fails.forEach((m) => console.log("  ✗ " + m));
    process.exitCode = 1;
  } else {
    console.log(`SW: ALL ${pass} CHECKS PASSED ` +
      `(${ver}; ${shell.length} app assets; ${scripts.length} scripts, ${styles.length} stylesheets)`);
  }
});
