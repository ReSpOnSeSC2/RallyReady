// Behavioral regressions for instructional motion timing and actor ownership.
// Run: node scripts/verify-coachcam-mechanics.js
// The Blender validator separately checks the exported skeleton at half frames.
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");
const ROOT = path.join(__dirname, "..");
const sandbox = { console };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
const files = [
  "js/drills.js", ...Array.from({ length: 10 }, (_, i) => `js/drills-${i + 2}.js`),
  "js/extras-build.js", "js/format.js", "js/extras-data.js",
  ...Array.from({ length: 11 }, (_, i) => `js/extras-data-${i + 2}.js`),
  "js/drill-human-motion.js", "js/drill-choreography.js",
  "js/coachcam-library-3d.js", "js/drill-animation.js"
];
for (const file of files) vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), sandbox, { filename: file });
const RR = sandbox.RR;
const api = RR.coachCamLibrary3D;
const mechanics = api.mechanics;
assert(mechanics, "shared CoachCam must expose the same deterministic mechanics helpers used by playback");
let checks = 0;
function close(actual, expected, label, tolerance = 1e-8) {
  assert(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected}, received ${actual}`);
  checks++;
}

const segment = { startSeconds: 3, durationSeconds: 1.2, contactProgress: 0.6 };
const beat = { startMs: 900, durationMs: 1200, endMs: 2100 };
close(mechanics.contactProgress(segment), 0.6, "authored contact point");
close(mechanics.contactProgress({}), 0.5, "legacy contact default");
close(mechanics.contactProgress({ contactProgress: -2 }), 0.05, "contact lower bound");
close(mechanics.contactProgress({ contactProgress: 2 }), 0.95, "contact upper bound");
close(mechanics.contactTime(beat, segment), 1620, "contact clock agrees with the posed hands");
close(mechanics.sampleTime(segment, -0.2), 3, "seeking before motion clamps to first pose");
close(mechanics.sampleTime(segment, 1), 4.2, "last pose is sampled exactly without a .999 offset");
close(mechanics.sampleTime(segment, 1.5), 4.2, "seeking after motion cannot leak into the next reel clip");
close(mechanics.sampleTime(segment, mechanics.contactProgress(segment)), 3.72, "ball and body contact share a clock");

// A scrub back and forth must yield the same sample; it cannot depend on the
// previous render delta, camera frequency or accumulated mixer time.
const scrub = [0, 0.6, 1, 0.2, 0.6, 0, 1];
const first = scrub.map(p => mechanics.sampleTime(segment, p));
scrub.slice().reverse().forEach(p => mechanics.sampleTime(segment, p));
scrub.forEach((p, i) => close(mechanics.sampleTime(segment, p), first[i], "deterministic scrubbing"));

const radians = degrees => degrees * Math.PI / 180;
const angleDistance = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
close(angleDistance(mechanics.blendYaw(radians(179), radians(-179), 0.5), Math.PI), 0,
  "a two-degree direction correction must not spin the athlete 358 degrees");
close(angleDistance(mechanics.blendYaw(0.3, 1.4, 0), 0.3), 0, "turn starts at prior facing");
close(angleDistance(mechanics.blendYaw(0.3, 1.4, 1), 1.4), 0, "turn finishes at destination facing");
for (const motion of ["shuffle", "mini-band", "ladder"]) {
  close(mechanics.routeFacing(motion, 1.5, 0.3), 0.3, `${motion} retains chest orientation during lateral footwork`);
}
close(angleDistance(mechanics.routeFacing("backpedal", 1.5, 0.3), 1.5 + Math.PI), 0,
  "backpedal faces against travel");
close(mechanics.routeFacing("sprint", 1.5, 0.3), 1.5, "forward run follows travel");
close(mechanics.travelProgress(-1), 0, "route start clamps");
close(mechanics.travelProgress(2), 1, "route end clamps");
close(mechanics.travelProgress(0.5), 0.5, "symmetric route timing");
let previous = 0;
for (let i = 0; i <= 100; i++) {
  const progress = mechanics.travelProgress(i / 100);
  assert(progress >= previous && progress >= 0 && progress <= 1, "route motion must be monotone without overshoot");
  previous = progress;
  checks++;
}
assert(mechanics.travelProgress(0.001) < 0.00001, "route entry must ease in from rest");
assert(1 - mechanics.travelProgress(0.999) < 0.00001, "route finish must ease out to rest");
checks += 2;

const longShuffle = {
  width: 9, height: 18,
  routes: [{ id: "across", type: "move", from: [0, 0], to: [9, 0] }],
  beats: [{ routeId: "across", motionId: "shuffle", durationMs: 1000 }]
};
const unchangedPlan = JSON.stringify(longShuffle);
close(mechanics.motionTimingScale(longShuffle), 7.5,
  "a one-second court-width shuffle must slow enough to peak at 1.8 m/s");
assert.strictEqual(JSON.stringify(longShuffle), unchangedPlan, "timing correction must preserve authored beats and routes");
close(mechanics.motionTimingScale({ width: 9, height: 18, routes: [], beats: [] }), 1,
  "stationary phases retain their instructional timing");
close(mechanics.motionTimingScale({ ...longShuffle,
  routes: [{ id: "across", type: "ball", from: [0, 0], to: [9, 0] }] }), 1,
  "ball-only flights do not change human movement speed");
close(mechanics.motionTimingScale({ ...longShuffle,
  beats: [longShuffle.beats[0], { ...longShuffle.beats[0] }] }), 7.5,
  "parallel movements share one timeline scale instead of adding their durations");
for (const motionId of ["box", "box-hit", "box-block", "depth-drop", "bridge", "foam", "band", "band-upper", "band-arm-swing", "medicine", "medicine-slam", "medicine-rotate", "medicine-scoop", "jump-rope"]) {
  assert(mechanics.stationMotion(motionId), `${motionId}: local exercise motion must remain at its station`);
  close(mechanics.motionTimingScale({ ...longShuffle,
    beats: [{ ...longShuffle.beats[0], motionId }] }), 1,
  `${motionId}: a schematic station arrow must not stretch the real exercise duration`);
  checks++;
}
assert(!mechanics.stationMotion("sprint") && !mechanics.stationMotion("shuffle"), "court travel remains available for locomotion");
checks++;

let verifiedMovements = 0;
for (const drill of RR.drills.filter(api.isEligible)) {
  const compiled = api.compile(drill);
  for (const phase of compiled.phases) {
    for (const beat of phase.plan.beats) {
      const route = phase.plan.routes.find(item => item.id === beat.routeId && item.type === "move");
      if (!route || mechanics.stationMotion(beat.motionId)) continue;
      const points = [route.from, ...(route.via || []), route.to];
      let meters = 0;
      for (let i = 1; i < points.length; i++) {
        meters += Math.hypot(
          (points[i][0] - points[i - 1][0]) / Math.max(1, phase.plan.width || 9) * 9,
          (points[i][1] - points[i - 1][1]) / Math.max(1, phase.plan.height || 10) * 18
        );
      }
      // Smoothstep reaches its maximum speed at the middle. Measure the
      // compiled screen duration, so a correct helper that is not actually
      // applied by the player would still fail this catalog integration test.
      const seconds = phase.duration * beat.durationMs / phase.sourceDurationMs;
      const peakSpeed = 1.5 * meters / seconds;
      const limit = ["shuffle", "mini-band", "backpedal"].includes(beat.motionId) ? 1.8
        : beat.motionId === "ladder" ? 2 : ["sprint", "run-through"].includes(beat.motionId) ? 5.5 : 3;
      assert(Number.isFinite(peakSpeed) && peakSpeed <= limit + 1e-7,
        `${drill.id}/${phase.id}/${beat.motionId}: ${peakSpeed.toFixed(3)} m/s exceeds ${limit} m/s`);
      checks++;
      verifiedMovements++;
    }
  }
}
assert(verifiedMovements > 0, "movement speed validation must exercise compiled movement beats");
checks++;

const partner = RR.drills.find(drill => drill.id === "partner-setting");
const exchange = api.compile(partner);
assert(exchange && exchange.phases.length, "partner setting compiles");
const firstPhase = exchange.phases[0];
const playerA = firstPhase.plan.actors.find(actor => actor.label === "A");
const playerB = firstPhase.plan.actors.find(actor => actor.label === "B");
assert(playerA && playerB, "partner labels remain available");
const feed = firstPhase.plan.beats.find(item => item.motionId === "feed");
assert(feed && feed.actorId === playerA.id, "Player A must perform the self toss explicitly named in the instruction");
checks += 3;
for (const phase of exchange.phases) {
  const sets = phase.plan.contacts.filter(contact => contact.motionId === "set");
  assert(sets.length >= 2, "partner exchange retains both directions");
  for (const contact of sets) {
    assert.strictEqual(contact.performerActorId, contact.sourceActorId,
      "the recipient's permanent setter label must not steal the partner's outgoing set");
    const matchingBeat = phase.plan.beats.find(item => item.contactId === contact.id);
    if (matchingBeat) assert.strictEqual(matchingBeat.actorId, contact.sourceActorId, "contact ownership survives beat compilation");
    checks += 2;
  }
  assert(new Set(sets.map(contact => contact.performerActorId)).size === 2, "both partners visibly take a turn setting");
  checks += 2;
}

// Check runtime/asset agreement using the actual delivered binary metadata.
const bytes = fs.readFileSync(path.join(ROOT, api.contract.model));
assert.strictEqual(bytes.subarray(0, 4).toString("ascii"), "glTF");
const document = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString("utf8").trim());
const extras = document.scenes[document.scene || 0].extras;
const manifest = JSON.parse(extras.motion_manifest_json);
const contactMotions = /^(pass|platform-save|dig|set|feed|low-toss|serve|underhand|attack|down-ball-hit|jump-float|jump-topspin|tip-roll|box-hit|block|box-block|one-arm-save|sprawl|chest-hip-sprawl|run-through|shoulder-roll-right|shoulder-roll-left|mat-defense|medicine|medicine-slam|medicine-scoop|medicine-rotate)$/;
for (const id of api.motionIds) {
  const authored = manifest[id];
  assert(authored && authored.durationSeconds > 0, `${id}: authored reel segment exists`);
  if (contactMotions.test(id)) {
    assert(Number.isFinite(authored.contactProgress) && authored.contactProgress > 0 && authored.contactProgress < 1,
      `${id}: explicit contact timing exists`);
    assert(["platform", "two-hands", "right-hand", "left-hand"].includes(authored.contactType),
      `${id}: the actual body contact surface is authored`);
    checks += 2;
  }
  assert(typeof authored.cyclic === "boolean", `${id}: cycle behavior is authored`);
  close(mechanics.sampleTime(authored, 1), authored.startSeconds + authored.durationSeconds, `${id}: clip end`);
  close(mechanics.contactTime({ startMs: 100, durationMs: 1000 }, authored),
    100 + (Number.isFinite(authored.contactProgress) ? authored.contactProgress : 0.5) * 1000, `${id}: contact timing`);
  checks += 2;
}

function verifyStationEquipment(THREE) {
  const runtime = fs.readFileSync(path.join(ROOT, "js/coachcam-library-3d.js"), "utf8");
  function productionFunction(name) {
    const start = runtime.indexOf(`    function ${name}(`);
    const end = runtime.indexOf("\n    function ", start + 1);
    assert(start > 0 && end > start, `${name}: production station function is available`);
    return runtime.slice(start, end);
  }
  const actor = {
    data: { id: "demonstrator", team: "a", authored: { facing: "east" }, x: 5.75, y: 11.5 },
    home: new THREE.Vector3(1.25, 0, 2.5), root: new THREE.Group(),
    currentMotion: "box", currentProgress: 0
  };
  const other = {
    data: { id: "other", team: "b", authored: {}, x: 1.5, y: 5 },
    home: new THREE.Vector3(-3, 0, -4), root: new THREE.Group(),
    currentMotion: "box", currentProgress: 0
  };
  const player = {
    runtime: { THREE }, actors: { demonstrator: actor, other },
    activeActor: actor, motionManifest: manifest, equipment: [], drillGroup: new THREE.Group()
  };
  const context = {
    player, Math, Number,
    clean: value => value == null ? "" : String(value).trim(),
    list: value => Array.isArray(value) ? value : [],
    clamp: (n, low, high) => Math.max(low, Math.min(high, n)),
    slug: value => value.replace(/ /g, "-"),
    equipmentKeys: plan => plan.equipment || [],
    stationMotion: mechanics.stationMotion,
    travelProgress: mechanics.travelProgress,
    routeFacing: mechanics.routeFacing,
    blendYaw: mechanics.blendYaw
  };
  const functions = ["mapPoint", "routePoints", "pointOnPolyline", "routeDirection", "facingYaw",
    "equipmentAnchor", "placeEquipment", "routeFor", "actorTransform", "updateTrainingEquipment"];
  const station = vm.runInNewContext(functions.map(productionFunction).join("\n") +
    "\n({placeEquipment, actorTransform, updateTrainingEquipment});", context);

  for (const motionId of ["box", "box-hit", "box-block", "depth-drop"]) {
    const phase = { plan: {
      width: 9, height: 18, actors: [actor.data, other.data], equipment: ["box"], contacts: [],
      routes: [{ id: "station-arrow", type: "move", from: [0, 0], to: [9, 18] }],
      beats: [{ id: "step", actorId: actor.data.id, motionId, routeId: "station-arrow",
        startMs: 0, durationMs: 1000, endMs: 1000 }]
    } };
    player.equipment = [];
    player.activeActor = actor;
    actor.currentMotion = motionId;
    other.currentMotion = motionId;
    const equipment = station.placeEquipment(phase, "box", new THREE.Group(), 0);
    const fixedPosition = equipment.root.position.clone();
    const fixedRotation = equipment.root.quaternion.clone();
    const localAnchor = manifest[motionId].equipmentAnchor;
    const expected = new THREE.Vector3(localAnchor[0], localAnchor[2], -localAnchor[1])
      .applyQuaternion(actor.root.quaternion).add(actor.home);
    close(fixedPosition.distanceTo(expected), 0, `${motionId}: box is placed at the authored local step station`);
    close(equipment.root.scale.y, manifest[motionId].boxHeight / 0.8, `${motionId}: box model height agrees with the step height`);
    for (const [index, time] of [-1, 0, 250, 550, 800, 1000, 2000].entries()) {
      // Deliberately start with a stale moving root to ensure production code
      // restores the station instead of merely preserving our fixture pose.
      actor.root.position.set(20, 0, 20);
      station.actorTransform(actor, phase, time);
      close(actor.root.position.distanceTo(actor.home), 0, `${motionId}@${time}: schematic arrows cannot translate the athlete station`);
      player.activeActor = index % 2 ? other : actor;
      other.root.position.set(-8 + index, 0, 7);
      station.updateTrainingEquipment();
      close(equipment.root.position.distanceTo(fixedPosition), 0, `${motionId}@${time}: box stays fixed when the active actor changes`);
      close(equipment.root.quaternion.angleTo(fixedRotation), 0, `${motionId}@${time}: box orientation cannot follow the current athlete`, 1e-7);
    }
  }

  // Confirm the shipped GLB supplies the local step while the root remains
  // fixed. These are actual exported translation keys, not mocked poses.
  const binaryStart = 20 + bytes.readUInt32LE(12) + 8;
  function floatAccessor(index) {
    const accessor = document.accessors[index];
    assert.strictEqual(accessor.componentType, 5126, "motion accessor uses float components");
    const view = document.bufferViews[accessor.bufferView];
    const width = accessor.type === "VEC3" ? 3 : 1;
    const stride = view.byteStride || width * 4;
    const offset = binaryStart + (view.byteOffset || 0) + (accessor.byteOffset || 0);
    return Array.from({ length: accessor.count }, (_, i) =>
      Array.from({ length: width }, (_, j) => bytes.readFloatLE(offset + i * stride + j * 4)));
  }
  const nodeIndex = document.nodes.findIndex(node => node.name === "ATH_TORSO");
  const animation = document.animations[0];
  const channel = animation.channels.find(item => item.target.node === nodeIndex && item.target.path === "translation");
  assert(channel, "the exported torso carries local box step movement");
  const sampler = animation.samplers[channel.sampler];
  const times = floatAccessor(sampler.input).map(value => value[0]);
  const translations = floatAccessor(sampler.output);
  for (const motionId of ["box", "box-hit", "box-block", "depth-drop"]) {
    const segment = manifest[motionId];
    const poses = translations.filter((_, i) => times[i] >= segment.startSeconds - 1e-5 &&
      times[i] <= segment.startSeconds + segment.durationSeconds + 1e-5);
    const heightRange = Math.max(...poses.map(p => p[1])) - Math.min(...poses.map(p => p[1]));
    const travelRange = Math.max(...poses.map(p => p[2])) - Math.min(...poses.map(p => p[2]));
    assert(heightRange >= 0.24, `${motionId}: shipped local skeleton must visibly rise onto or lower from the box`);
    assert(travelRange >= 0.30, `${motionId}: shipped local skeleton must perform the approach/step in place`);
    checks += 2;
  }
}

async function verifyDedicatedSeek() {
  // The vendored core is self-contained ES module code. A data URL loads it
  // on Node 20 as well as Node 22 without changing this CommonJS repository's
  // package type or requiring a browser/WebGL context.
  const core = fs.readFileSync(path.join(ROOT, "vendor/three/three.core.min.js"));
  const THREE = await import(`data:text/javascript;base64,${core.toString("base64")}`);
  verifyStationEquipment(THREE);
  const runtime = fs.readFileSync(path.join(ROOT, "js/coachcam-3d.js"), "utf8");
  const start = runtime.indexOf("    function seek(");
  const end = runtime.indexOf("\n    function shouldAnimate()", start);
  assert(start > 0 && end > start, "dedicated seek function remains available for integration test");
  // Execute the actual production seek function, with only rendering/UI
  // callbacks substituted. This specifically catches AnimationMixer.setTime
  // multiplying a scrub target by a paused action's effective playback rate.
  const object = new THREE.Object3D();
  const clip = new THREE.AnimationClip("Seek regression", 10, [
    new THREE.NumberKeyframeTrack(".position[x]", [0, 10], [0, 10])
  ]);
  const mixer = new THREE.AnimationMixer(object);
  const action = mixer.clipAction(clip).play();
  let updatedTime = null;
  let renders = 0;
  let scheduled = 0;
  const player = { mixer, action, clipDuration: 10, speed: 1 };
  const context = {
    player,
    CONTRACT: { durationSeconds: 10 },
    clamp: (n, low, high) => Math.max(low, Math.min(high, n)),
    clipSeconds: (authored, duration) => authored / 10 * duration,
    updatePhase: time => { updatedTime = time; },
    renderNow: () => { renders++; },
    requestRender: () => { scheduled++; },
    announce: () => {},
    phaseAtSeconds: () => ({ label: "Test", cue: "Test" })
  };
  const seek = vm.runInNewContext(runtime.slice(start, end) + "\nseek;", context);
  for (const speed of [0.25, 0.5, 1]) {
    for (const paused of [true, false]) {
      player.speed = speed;
      action.paused = paused;
      action.setEffectiveTimeScale(speed);
      const beforeRenders = renders;
      for (const target of [8, 2, 2 + 1 / 24, 2 - 1 / 24, 0, 8]) {
        seek(target, false);
        close(object.position.x, target, `${speed}x ${paused ? "paused" : "playing"} seek samples the requested bone`, 1e-6);
        close(updatedTime, target, "instruction clock agrees with evaluated bone");
        assert.strictEqual(action.paused, paused, "seek preserves transport paused state");
        close(action.timeScale, speed, "seek preserves playback rate for resume");
        checks++;
      }
      assert.strictEqual(renders - beforeRenders, 6, "frame steps immediately repaint the requested pose");
      checks++;
    }
  }
  assert.strictEqual(scheduled, renders, "every scrub schedules a matching repaint");
  checks++;
  mixer.stopAllAction();
  mixer.uncacheRoot(object);
}

verifyDedicatedSeek().then(() => {
  console.log(`CoachCam mechanics: ALL ${checks} CHECKS PASSED (contact clocks, Three.js paused/slow scrubbing, frame stepping, ${verifiedMovements} movement speed limits, partner ownership, 52 authored clips)`);
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
