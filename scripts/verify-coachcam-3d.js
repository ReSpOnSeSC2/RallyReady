// verify-coachcam-3d.js — focused contract and timeline checks for CoachCam.
// Run with: node scripts/verify-coachcam-3d.js
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = path.join(__dirname, "..");

let pass = 0, fail = 0;
const failures = [];
function ok(condition, message) {
  if (condition) pass++;
  else { fail++; failures.push(message); }
}

const jsPath = path.join(ROOT, "js", "coachcam-3d.js");
const cssPath = path.join(ROOT, "css", "coachcam-3d.css");
const htmlPath = path.join(ROOT, "index.html");
const animationPath = path.join(ROOT, "js", "drill-animation.js");
const js = fs.readFileSync(jsPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const html = fs.readFileSync(htmlPath, "utf8");
const animation = fs.readFileSync(animationPath, "utf8");

// The IIFE's pure API can be evaluated without a DOM. Dynamic imports are not
// invoked here; browser loading is covered by static same-origin assertions.
const sandbox = { window: { RR: {} }, Object, Math, Number, String };
vm.runInNewContext(js, sandbox, { filename: "coachcam-3d.js" });
const api = sandbox.window.RR.coachCam3D;

ok(!!api, "RR.coachCam3D public API is installed");
ok(api.isEligible({ id: "rolls-and-sprawls" }), "Rolls and Sprawls opts into CoachCam");
ok(!api.isEligible({ id: "down-balls" }), "unreviewed drills stay on the established renderer");
ok(Object.isFrozen(api.contract), "asset contract is immutable");
ok(api.contract.model === "models/coachcam/rolls-and-sprawls.glb", "GLB path matches Blender contract");
ok(api.contract.clip === "CoachCam_RollsSprawls", "continuous clip name matches Blender contract");
ok(api.contract.sceneObjects.courtCamera === "Camera_Court", "court camera name matches Blender contract");
ok(api.contract.sceneObjects.mechanicsCamera === "Camera_Mechanics", "mechanics camera name matches Blender contract");
ok(api.contract.sceneObjects.sprawlCamera === "Camera_Sprawl", "sprawl camera name matches Blender contract");
ok(api.contract.sprawlCameraWindow.start === 9.2 && api.contract.sprawlCameraWindow.end === 12,
  "dedicated three-quarter sprawl lens covers save through landing");
ok(api.contract.durationSeconds === 14, "authored demonstration lasts 14 seconds");

const expectedPhases = [
  ["ready", 0, 1], ["read-right", 1, 1.8], ["reach-right", 1.8, 2.6],
  ["roll-right", 2.6, 3.8], ["recover-right", 3.8, 4.6],
  ["read-left", 4.6, 5.4], ["reach-left", 5.4, 6.2],
  ["roll-left", 6.2, 7.4], ["recover-left", 7.4, 8.2],
  ["read-short", 8.2, 9.2], ["one-hand-save", 9.2, 10.2],
  ["sprawl", 10.2, 11.6], ["recover-sprawl", 11.6, 13], ["reset", 13, 14]
];
ok(api.phases.length === expectedPhases.length, "all 14 authored phases are exposed");
expectedPhases.forEach((expected, index) => {
  const actual = api.phases[index];
  ok(actual.id === expected[0], `phase ${index + 1} id is ${expected[0]}`);
  ok(actual.start === expected[1] && actual.end === expected[2],
    `phase ${expected[0]} keeps its authored ${expected[1]}–${expected[2]}s timing`);
  ok(typeof actual.cue === "string" && actual.cue.length > 55,
    `phase ${expected[0]} has a detailed mechanical cue`);
  ok(typeof actual.key === "string" && actual.key.length > 5,
    `phase ${expected[0]} has a visible safety focus`);
  if (index) ok(actual.start === api.phases[index - 1].end,
    `phase ${expected[0]} starts without a timeline gap`);
});
ok(api._internals.phaseAtSeconds(2.7).id === "roll-right", "right roll resolves at 2.7s");
ok(api._internals.phaseAtSeconds(6.4).id === "roll-left", "left roll resolves at 6.4s");
ok(api._internals.phaseAtSeconds(10.7).id === "sprawl", "sprawl resolves at 10.7s");
ok(api._internals.phaseAtSeconds(14).id === "ready", "the continuous loop returns to Ready at 14s");
ok(api._internals.authoredSeconds(7, 14) === 7, "clip time maps to authored time");
ok(api._internals.clipSeconds(7, 28) === 14, "authored phases scale to actual clip duration");
ok(api._internals.formatTime(14) === "0:14", "timeline time is coach-readable");

// Rendering architecture: exactly one renderer/context, two scissor viewports,
// one animation mixer/clock, and deterministic authored-camera fallbacks.
ok((js.match(/new THREE\.WebGLRenderer/g) || []).length === 1,
  "one WebGLRenderer owns both camera panes");
ok(/setScissorTest\(true\)/.test(js), "renderer enables scissor viewports");
ok(/renderCamera\(player\.courtCamera/.test(js) &&
   /useSprawlLens \? player\.sprawlCamera : player\.mechanicsCamera/.test(js),
  "one frame renders the shared scene through both cameras");
ok(/new THREE\.AnimationMixer\(gltf\.scene\)/.test(js), "both views share one animation mixer");
ok(/coachCamBaseAspect/.test(js) && /baseAspect \/ nextAspect/.test(js),
  "narrow responsive panes preserve the authored horizontal field of view");
ok(/renderCamera\(player\.courtCamera[\s\S]{0,90}true\)/.test(js) &&
   /useSprawlLens \? player\.sprawlCamera : player\.mechanicsCamera[\s\S]{0,120}true\)/.test(js),
  "both responsive panes preserve Blender's authored horizontal framing");
ok(/authored >= CONTRACT\.sprawlCameraWindow\.start/.test(js) &&
   /authored < CONTRACT\.sprawlCameraWindow\.end/.test(js) &&
   /data-mechanics-camera/.test(js),
  "mechanics pane switches to the authored sprawl lens only for 9.2–12.0s");
ok(/setEffectiveTimeScale\(player\.speed\)/.test(js) && /mixer\.update\(delta\)/.test(js),
  "0.5x/1x speed is applied exactly once");
ok(/shadowMap\.autoUpdate\s*=\s*false/.test(js) &&
   /shadowMap\.needsUpdate\s*=\s*true[\s\S]{0,700}renderCamera\(player\.courtCamera/.test(js),
  "the two synchronized views share one animated shadow-map update per frame");
ok(/wasActionPaused/.test(js) && /action\.paused = false;[\s\S]{0,100}mixer\.setTime/.test(js),
  "paused timeline scrubs still evaluate the requested skeletal pose");
ok(!/https?:\/\//.test(js), "runtime contains no CDN or remote model dependency");
ok(/import\("\.\.\/vendor\/three\/three\.module\.min\.js"\)/.test(js),
  "Three.js is lazy-loaded from the local vendor bundle");
ok(/import\("\.\.\/vendor\/three\/addons\/loaders\/GLTFLoader\.js"\)/.test(js),
  "GLTFLoader is lazy-loaded from the local vendor bundle");

// Lifecycle, recovery, and optional authored coaching overlays.
[
  "ResizeObserver", "IntersectionObserver", "visibilitychange", "MutationObserver",
  "webglcontextlost", "renderer.dispose()", "mixer.stopAllAction()"
].forEach((token) => ok(js.includes(token), `lifecycle includes ${token}`));
ok(js.includes("SafetyRollArc") && js.includes("SprawlLanding"),
  "exact Blender safety-overlay names are registered");
ok(/roll\.\?\(\?:path\|arc\)/.test(js) || js.includes("roll.?(?:path|arc)"),
  "roll-arc overlays activate during both shoulder-roll phases");
ok(/removeEventListener\("resize", requestRender\)/.test(js),
  "fallback resize listener is removed during cleanup");
ok(/data-state", "fallback"/.test(js) && /fallbackText\.hidden = false/.test(js),
  "asset, runtime, and context failures retain the accessible phase guide");
ok(/fallbackArtwork\(id \+ "-ball-arrow"\)/.test(js) && !/id='cc-ball-arrow'/.test(js),
  "fallback SVG marker ids are unique per CoachCam instance");
[
  "FULL COURT · BALL + PLAYER PATH", "SHOULDER", "OPPOSITE HIP",
  "MECHANICS · SAFE DIAGONAL ROLL"
].forEach((label) => ok(js.includes(`translated("${label}")`),
  `fallback SVG localizes ${label}`));

// Interaction and layout requirements.
ok(/scrubber\.type = "range"/.test(js), "continuous timeline uses an accessible range input");
ok(/\[0\.5, 1\]/.test(js), "playback exposes 0.5x and 1x speeds");
ok(!/Previous step|Next step/.test(js), "CoachCam has no previous/next step arrows");
ok(/phaseRail\.appendChild/.test(js), "all phases are directly seekable without arrows");
ok(/phaseRail\.scrollTo/.test(js) && !/\.scrollIntoView\(/.test(js),
  "autoplay moves only the horizontal phase rail, never the page");
ok(/updatePhase\(nextClipTime, true\);[\s\S]{0,600}renderNow\(\);/.test(js) &&
   /function renderNow\(\)[\s\S]{0,400}renderViews\(\);/.test(js),
  "paused scrubbing synchronously paints the requested 3D pose");
ok(/scrollbar-width:\s*none/.test(css) &&
   /phase-rail::\-webkit-scrollbar\s*\{\s*display:\s*none/.test(css),
  "phase rail remains touch-scrollable without a native scrollbar");
ok(/grid-template-columns: minmax\(0, 57fr\)/.test(css), "desktop uses a split dual-camera layout");
ok(/grid-template-rows: minmax\(0, 57fr\)/.test(css), "mobile stacks the two synchronized cameras");
ok(/prefers-reduced-motion: reduce/.test(css), "CSS honors reduced-motion preference");
ok(/@media print/.test(css), "print keeps an instructional court overview");

const cssIndex = html.indexOf('href="css/coachcam-3d.css"');
const scriptIndex = html.indexOf('src="js/coachcam-3d.js"');
const animationIndex = html.indexOf('src="js/drill-animation.js"');
ok(cssIndex >= 0, "CoachCam stylesheet is loaded by index.html");
ok(scriptIndex >= 0 && scriptIndex < animationIndex,
  "CoachCam runtime loads before the delegating drill renderer");
ok(/RR\.coachCam3D\.isEligible\(drill\)/.test(animation),
  "drill-animation delegates only eligible authored drills");

const localRuntimeFiles = [
  "vendor/three/three.module.min.js",
  "vendor/three/three.core.min.js",
  "vendor/three/addons/loaders/GLTFLoader.js",
  "vendor/three/addons/utils/BufferGeometryUtils.js",
  "vendor/three/addons/utils/SkeletonUtils.js"
];
localRuntimeFiles.forEach((relative) => ok(fs.existsSync(path.join(ROOT, relative)),
  `local runtime file exists: ${relative}`));

// Inspect the Blender payload directly so a renamed object, camera, or clip
// cannot silently strand the runtime in its fallback state.
const modelPath = path.join(ROOT, api.contract.model);
ok(fs.existsSync(modelPath), "Blender-authored Rolls and Sprawls GLB exists");
if (fs.existsSync(modelPath)) {
  const bytes = fs.readFileSync(modelPath);
  ok(bytes.subarray(0, 4).toString("ascii") === "glTF", "model is a binary glTF container");
  ok(bytes.readUInt32LE(4) === 2, "model uses glTF 2.0");
  ok(bytes.readUInt32LE(8) === bytes.length, "GLB header declares the exact file length");
  const jsonLength = bytes.readUInt32LE(12);
  const jsonType = bytes.readUInt32LE(16);
  ok(jsonType === 0x4e4f534a, "first GLB chunk is JSON");
  const gltf = JSON.parse(bytes.toString("utf8", 20, 20 + jsonLength).trim());
  ok(gltf.asset && gltf.asset.version === "2.0", "embedded asset metadata is glTF 2.0");
  const nodeNames = new Set((gltf.nodes || []).map((entry) => entry.name));
  ["Coach", "Defender", "Ball", "Court", "Camera_Court", "Camera_Mechanics", "Camera_Sprawl"].forEach((name) =>
    ok(nodeNames.has(name), `GLB contains required scene object ${name}`));
  ["SafetyRollArc", "SprawlLanding"].forEach((name) =>
    ok(nodeNames.has(name), `GLB contains optional production overlay ${name}`));
  const clips = gltf.animations || [];
  const clip = clips.find((entry) => entry.name === api.contract.clip);
  ok(!!clip, "GLB contains the continuous CoachCam_RollsSprawls animation");
  ok(clips.length === 1, "GLB uses one synchronized master animation clip");
  if (clip) {
    const duration = Math.max(...clip.samplers.map((sampler) => {
      const accessor = (gltf.accessors || [])[sampler.input] || {};
      return accessor.max && accessor.max[0] || 0;
    }));
    ok(Math.abs(duration - 14) <= 0.05,
      `master clip duration matches the authored 14s timeline (${duration.toFixed(3)}s)`);
  }
  ok((gltf.buffers || []).every((entry) => !entry.uri), "GLB geometry is embedded with no external fetch");
  ok((gltf.images || []).every((entry) => !entry.uri), "GLB textures are embedded with no external fetch");
}

console.log("──────────────────────────────────────────");
if (fail) {
  console.log(`CoachCam: ${pass} passed, ${fail} FAILED`);
  failures.forEach((message) => console.log("  ✗ " + message));
  process.exit(1);
}
console.log(`CoachCam: ALL ${pass} CHECKS PASSED (${api.phases.length} continuous phases)`);
