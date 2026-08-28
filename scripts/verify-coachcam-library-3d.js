// Catalog-wide contract checks for the shared Blender CoachCam pipeline.
// Run with: node scripts/verify-coachcam-library-3d.js
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const sandbox = { console, Math, Object, Array, String, Number, JSON, encodeURIComponent };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const files = [
  "js/drills.js", "js/drills-2.js", "js/drills-3.js", "js/drills-4.js",
  "js/drills-5.js", "js/drills-6.js", "js/drills-7.js", "js/drills-8.js",
  "js/drills-9.js", "js/drills-10.js", "js/drills-11.js",
  "js/extras-build.js", "js/format.js",
  "js/extras-data.js", "js/extras-data-2.js", "js/extras-data-3.js",
  "js/extras-data-4.js", "js/extras-data-5.js", "js/extras-data-6.js",
  "js/extras-data-7.js", "js/extras-data-8.js", "js/extras-data-9.js",
  "js/extras-data-10.js", "js/extras-data-11.js", "js/extras-data-12.js",
  "js/drill-human-motion.js", "js/drill-choreography.js",
  "js/coachcam-library-3d.js", "js/drill-animation.js"
];
files.forEach((file) => vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), sandbox, { filename: file }));

const RR = sandbox.RR;
const api = RR.coachCamLibrary3D;
let pass = 0;
const failures = [];
function ok(value, message) {
  if (value) pass++;
  else failures.push(message);
}

ok(!!api, "shared CoachCam API is exported");
ok(api.contract.model === "models/coachcam/coachcam-library.glb", "shared Blender GLB path is stable");
ok(api.contract.rig === "RR_Humanoid_v1", "stable humanoid contract is exposed");
ok(api.motionIds.length === 52 && new Set(api.motionIds).size === 52,
  "all 52 Blender motion segments are unique");
ok(Object.keys(api.equipmentModels).length === 14, "all 14 equipment families have 3D contracts");
ok(RR.drills.length === 241, `expected 241 bundled drills, found ${RR.drills.length}`);

const rolls = RR.drills.find((drill) => drill.id === "rolls-and-sprawls");
ok(!!rolls && !api.isEligible(rolls), "hand-tuned Rolls and Sprawls remains on its dedicated Blender asset");
const pancake = RR.drills.find((drill) => drill.id === "pancake-and-recover");
const pancakeCompiled = pancake && api.compile(pancake);
const pancakeContactPhase = pancakeCompiled && pancakeCompiled.phases.find((phase) => phase.stepIndex === 1);
ok(!!pancakeContactPhase &&
  pancakeContactPhase.plan.beats.some((beat) => beat.motionId === "one-arm-save") &&
  !pancakeContactPhase.plan.beats.some((beat) => beat.motionId === "sprawl"),
"pancake instruction uses the flat one-hand Blender save, not a generic sprawl");
const ladder = RR.drills.find((drill) => drill.id === "agility-ladder-footwork");
const ladderCompiled = ladder && api.compile(ladder);
ok(!!ladderCompiled && ladderCompiled.phases.slice(0, 4).every((phase) =>
  phase.plan.beats.some((beat) => beat.motionId === "ladder" && !!beat.routeId) &&
  !phase.plan.beats.some((beat) => beat.motionId === "sprint")),
"ladder patterns travel on the ladder clip; only the saved exit step sprints");
const eligible = RR.drills.filter(api.isEligible);
ok(eligible.length === 240, `shared Blender library must cover 240 remaining drills, found ${eligible.length}`);

let compiledPhases = 0;
let savedSteps = 0;
let maxActors = 0;
let multiPerson = 0;
let contactCount = 0;
let routeCount = 0;
const usedMotions = new Set();
const usedEquipment = new Set();

eligible.forEach((drill) => {
  const compiled = api.compile(drill);
  ok(!!compiled, `${drill.id} compiles to shared CoachCam`);
  if (!compiled) return;
  ok(compiled.valid, `${drill.id} has only valid choreography plans`);
  ok(compiled.phases.length >= drill.steps.length,
    `${drill.id} maps every saved step to a continuous phase`);
  ok(compiled.durationSeconds > 0 && Number.isFinite(compiled.durationSeconds),
    `${drill.id} has a finite continuous master timeline`);
  const mappedSteps = new Set(compiled.phases.filter((phase) => phase.stepIndex < drill.steps.length)
    .map((phase) => phase.stepIndex));
  drill.steps.forEach((step, index) => ok(mappedSteps.has(index), `${drill.id} saved step ${index + 1} is mapped`));
  compiledPhases += compiled.phases.length;
  savedSteps += drill.steps.length;
  if (drill.minPlayers > 1 || compiled.phases.some((phase) => phase.plan.actors.length > 1)) multiPerson++;

  compiled.phases.forEach((phase) => {
    const plan = phase.plan;
    ok(plan.valid && !plan.errors.length, `${drill.id}/${phase.id} plan validates`);
    ok(plan.actors.length >= drill.minPlayers,
      `${drill.id}/${phase.id} shows saved minimum ${drill.minPlayers}`);
    ok(plan.actors.length === new Set(plan.actors.map((actor) => actor.id)).size,
      `${drill.id}/${phase.id} actor ids are unique`);
    plan.actors.forEach((actor) => {
      ok(Number.isFinite(actor.x) && Number.isFinite(actor.y),
        `${drill.id}/${phase.id}/${actor.id} has a factual court position`);
      ok(!!actor.appearanceId, `${drill.id}/${phase.id}/${actor.id} has a deterministic appearance`);
    });
    plan.routes.forEach((route) => {
      ok(Array.isArray(route.from) && Array.isArray(route.to),
        `${drill.id}/${phase.id}/${route.id} has endpoints`);
      if (route.type === "move") ok(!!route.actorId, `${drill.id}/${phase.id}/${route.id} binds its moving actor`);
    });
    plan.contacts.forEach((contact) => {
      ok(!!contact.performerActorId, `${drill.id}/${phase.id}/${contact.id} binds its mechanic performer`);
      ok(!!contact.motionId && api.motionIds.includes(contact.motionId),
        `${drill.id}/${phase.id}/${contact.id} uses a Blender motion`);
    });
    plan.beats.forEach((beat) => {
      ok(api.motionIds.includes(beat.motionId),
        `${drill.id}/${phase.id}/${beat.id} has a known Blender motion`);
      if (beat.actorId) ok(plan.actors.some((actor) => actor.id === beat.actorId),
        `${drill.id}/${phase.id}/${beat.id} performer is visible`);
      usedMotions.add(beat.motionId);
    });
    plan.equipment.map((item) => String(item && typeof item === "object" ? (item.label || item.type) : item).trim().toLowerCase())
      .forEach((key) => {
      ok(!!api.equipmentModels[key], `${drill.id}/${phase.id} equipment has a Blender model: ${key}`);
      usedEquipment.add(key);
      });
    maxActors = Math.max(maxActors, plan.actors.length);
    contactCount += plan.contacts.length;
    routeCount += plan.routes.length;
  });
});

const rollsProgram = RR.drillHumanMotion.programFor(rolls, RR.drillAnimation.scenesFor(rolls));
ok(compiledPhases + rollsProgram.length === 987,
  `all 987 walkthrough phases are covered, found ${compiledPhases + rollsProgram.length}`);
ok(savedSteps + rolls.steps.length === 979,
  `all 979 saved drill steps are covered, found ${savedSteps + rolls.steps.length}`);
ok(maxActors === 13, `full-team representation must reach 13 visible people, found ${maxActors}`);
ok(multiPerson >= 168, `multi-human coverage is incomplete: ${multiPerson} shared drills`);
ok(contactCount > 1000, `catalog must retain detailed ordered contact events, found ${contactCount}`);
ok(routeCount > 2000, `catalog must retain detailed player/ball routes, found ${routeCount}`);
ok([...usedMotions].every((id) => api.motionIds.includes(id)), "every used mechanic exists in Blender");
ok([...usedEquipment].every((key) => api.equipmentModels[key]), "every used equipment family exists in Blender");

const runtimeSource = fs.readFileSync(path.join(ROOT, "js", "coachcam-library-3d.js"), "utf8");
const animationSource = fs.readFileSync(path.join(ROOT, "js", "drill-animation.js"), "utf8");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "css", "coachcam-3d.css"), "utf8");
const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
ok(!/images\/drill-motion/.test(runtimeSource), "3D runtime does not load static athlete images");
ok((runtimeSource.match(/new THREE\.WebGLRenderer/g) || []).length === 1,
  "one renderer serves both synchronized camera panes");
ok(/setScissorTest\(true\)/.test(runtimeSource) && /renderCamera\(player\.courtCamera/.test(runtimeSource) &&
  /renderCamera\(player\.mechanicsCamera/.test(runtimeSource), "court and mechanics views use scissor cameras");
ok(/IntersectionObserver/.test(runtimeSource) && /rootMargin: "320px 0px"/.test(runtimeSource),
  "shared GLB lazy-loads near the viewport");
ok(/prefers-reduced-motion/.test(runtimeSource) && /data-reduced-motion/.test(runtimeSource),
  "reduced motion starts from a paused instructional pose");
ok(!/Previous step|Next step/.test(runtimeSource), "continuous walkthrough has no previous/next arrows");
ok(/coachCamLibrary3D\.figure\(drill\)/.test(animationSource), "drill details delegate to shared CoachCam");
const libraryIndex = html.indexOf('src="js/coachcam-library-3d.js"');
const animationIndex = html.indexOf('src="js/drill-animation.js"');
ok(libraryIndex >= 0 && libraryIndex < animationIndex, "shared runtime loads before drill renderer delegation");
ok(/coachcam__formation/.test(css) && /@media \(max-width: 700px\)/.test(css),
  "formation and phone-responsive CoachCam styles are present");
ok(sw.includes("./models/coachcam/coachcam-library.glb") && sw.includes("./js/coachcam-library-3d.js"),
  "shared Blender model and runtime are available offline");

const glbPath = path.join(ROOT, "models", "coachcam", "coachcam-library.glb");
ok(fs.existsSync(glbPath), "shared Blender GLB exists");
if (fs.existsSync(glbPath)) {
  const bytes = fs.readFileSync(glbPath);
  ok(bytes.subarray(0, 4).toString("ascii") === "glTF", "shared asset is a binary glTF");
  ok(bytes.length > 500000 && bytes.length < 3000000,
    `shared GLB stays within the 0.5–3 MB production budget (${bytes.length} bytes)`);
}

if (failures.length) {
  console.error(`CoachCam library: ${pass} passed, ${failures.length} FAILED`);
  failures.slice(0, 100).forEach((failure) => console.error("FAIL:", failure));
  process.exit(1);
}
console.log(`CoachCam library: ALL ${pass.toLocaleString()} CHECKS PASSED`);
console.log(JSON.stringify({
  drills: RR.drills.length,
  dedicatedHeroDrills: 1,
  sharedLibraryDrills: eligible.length,
  walkthroughPhases: compiledPhases + rollsProgram.length,
  savedSteps: savedSteps + rolls.steps.length,
  maxVisiblePeople: maxActors,
  motionsUsed: usedMotions.size,
  equipmentFamiliesUsed: usedEquipment.size,
  routes: routeCount,
  contacts: contactCount
}, null, 2));
