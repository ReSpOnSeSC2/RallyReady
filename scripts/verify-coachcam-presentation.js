// Behavioral regressions for complete drill staging and distance-driven steps.
// Run: node scripts/verify-coachcam-presentation.js
// Executes production presentation/movement functions with the actual Three.js
// geometry and mixer. Only the canvas label drawing and DOM attributes are stubs.
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
  "js/drill-human-motion.js", "js/drill-choreography.js", "js/coachcam-equipment-3d.js",
  "js/coachcam-variants.js", "js/coachcam-library-3d.js", "js/drill-animation.js"
];
for (const file of files) vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), sandbox, { filename: file });
const RR = sandbox.RR;
const api = RR.coachCamLibrary3D;
const mechanics = api.mechanics;
const runtime = fs.readFileSync(path.join(ROOT, "js/coachcam-library-3d.js"), "utf8");
const bytes = fs.readFileSync(path.join(ROOT, api.contract.model));
const document = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString("utf8").trim());
const manifest = JSON.parse(document.scenes[document.scene || 0].extras.motion_manifest_json);
const binaryOffset = 20 + bytes.readUInt32LE(12) + 8;
function floatAccessor(index) {
  const accessor = document.accessors[index];
  assert.strictEqual(accessor.componentType, 5126, "Delivered animation uses float accessors");
  const view = document.bufferViews[accessor.bufferView];
  const width = accessor.type === "VEC3" ? 3 : 1;
  const stride = view.byteStride || width * 4;
  const start = binaryOffset + (view.byteOffset || 0) + (accessor.byteOffset || 0);
  return Array.from({ length: accessor.count * width }, (_, index) =>
    bytes.readFloatLE(start + Math.floor(index / width) * stride + (index % width) * 4));
}
const torsoIndex = document.nodes.findIndex(node => node.name === "ATH_TORSO");
const torsoChannel = document.animations[0].channels.find(channel => channel.target.node === torsoIndex && channel.target.path === "translation");
assert(torsoChannel, "The delivered body includes actual pelvis translation keys");
const torsoSampler = document.animations[0].samplers[torsoChannel.sampler];
const torsoTimes = floatAccessor(torsoSampler.input);
const torsoValues = floatAccessor(torsoSampler.output);
let checks = 0;
const failures = [];
function check(value, message) { assert(value, message); checks++; }
function close(actual, expected, message, tolerance = 1e-6) {
  check(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
    `${message}: expected ${expected}, received ${actual}`);
}
function test(name, callback) {
  try { callback(); } catch (error) { failures.push(`${name}: ${error.message}`); }
}
function productionFunction(name) {
  const start = runtime.indexOf(`    function ${name}(`);
  const end = runtime.indexOf("\n    function ", start + 1);
  assert(start > 0 && end > start, `Production ${name} must remain available for behavioral validation`);
  return runtime.slice(start, end);
}
function compile(id) {
  const drill = RR.drills.find(item => item.id === id);
  check(drill, `Saved drill ${id} exists`);
  const compiled = api.compile(drill);
  check(compiled && compiled.phases.length > 0, `${id} compiles into instructional phases`);
  return compiled;
}
function mappedDistance(plan, route) {
  const points = [route.from, ...(route.via || []), route.to].map(point => mechanics.mappedPoint(plan, point));
  return points.slice(1).reduce((sum, point, index) => sum + Math.hypot(point[0] - points[index][0], point[1] - points[index][1]), 0);
}

test("Court mapping respects the net and physical boundaries", () => {
  const metric = { width: 30, height: 40, presentation: { coordinateSystem: "metric", net: 0,
    bounds: { minX: -2, maxX: 7, minY: -9, maxY: 9 } },
    actors: [{ x: 20, y: 35, role: "waiting" }] };
  close(mechanics.mappedPoint(metric, [2.5, 0])[1], 0, "A saved net at zero is a real net, not missing data");
  close(mechanics.mappedPoint(metric, [-2, -9])[0], -4.5, "Metric left sideline");
  close(mechanics.mappedPoint(metric, [7, 9])[0], 4.5, "Metric right sideline");
  close(mechanics.mappedPoint(metric, [-2, -9])[1], -9, "Far end line");
  close(mechanics.mappedPoint(metric, [7, 9])[1], 9, "Near end line");
  const schematic = { width: 9, height: 30, presentation: { coordinateSystem: "court-schematic", net: 6,
    bounds: { minX: 0, maxX: 9, minY: 0, maxY: 12 } }, actors: [{ x: 4.5, y: 28 }] };
  close(mechanics.mappedPoint(schematic, [4.5, 0])[1], -9, "Far baseline maps to the regulation court");
  close(mechanics.mappedPoint(schematic, [4.5, 12])[1], 9, "Queue space cannot compress the near half");
  close(mechanics.mappedPoint(schematic, [4.5, 6])[1], 0, "Diagram net aligns with the actual net");
  const before = JSON.stringify(mechanics.courtSpace(schematic));
  schematic.height = 100;
  schematic.actors.push({ x: -80, y: 90 });
  check(JSON.stringify(mechanics.courtSpace(schematic)) === before, "Waiting athletes cannot resize or recenter the court");
});

const youth = compile("youth-serving-target-game");
test("Youth targets persist in every instructional phase", () => {
  youth.phases.forEach(phase => {
    const zones = phase.plan.presentation.zones;
    check(zones.length === 3, `${phase.id}: retain both deep targets and the near-net target`);
    const near = zones.find(zone => /near net/.test(zone.label));
    const deep = zones.filter(zone => /deep corner/.test(zone.label));
    check(near && deep.length === 2, `${phase.id}: targets keep their stated difficulty and points`);
    const nearPoint = mechanics.mappedPoint(phase.plan, [near.x + near.w / 2, near.y + near.h / 2]);
    close(nearPoint[0], 0, `${phase.id}: easy target is centered across the net`);
    close(nearPoint[1], -2.325, `${phase.id}: easy target is close to the far side of the net`);
    deep.forEach((zone, index) => {
      const point = mechanics.mappedPoint(phase.plan, [zone.x + zone.w / 2, zone.y + zone.h / 2]);
      close(point[0], index ? 2.5 : -2.5, `${phase.id}: deep target occupies its saved corner`);
      close(point[1], -6.3, `${phase.id}: deep target is farther from the net`);
      check(point[1] < nearPoint[1] && point[1] < 0, "A high-value target cannot move onto the serving court");
    });
    check(phase.plan.presentation.exampleNote, "Chosen target sizes and point values remain identified as an example");
  });
});

const mini = compile("mini-band-defensive-shuffle");
test("Mini-band authored routes match the visible five-step gait", () => {
  const seen = new Map();
  mini.phases.forEach(phase => phase.plan.routes.filter(route => route.type === "move").forEach(route => {
    seen.set(JSON.stringify([route.from, route.via || [], route.to]), { plan: phase.plan, route });
  }));
  const routes = Array.from(seen.values());
  const right = routes.find(({ route }) => !route.via?.length && route.to[0] > route.from[0]);
  const left = routes.find(({ route }) => !route.via?.length && route.to[0] < route.from[0]);
  const box = routes.find(({ route }) => route.via?.length === 3);
  check(right && left && box, "Show five right, five left, then all four sides of the box");
  for (const { plan, route } of [right, left]) {
    close(mappedDistance(plan, route), 2, "Five mini-band lead/follow steps cover the example 2m lane");
    close(mappedDistance(plan, route) / manifest["mini-band"].strideMeters, 5, "Movement displacement requires exactly five complete visible cycles");
  }
  close(mappedDistance(box.plan, box.route), 6.4, "The box shows two 2m sides and two 1.2m sides");
  close(manifest["mini-band"].strideMeters, .4, "Delivered mini-band stride");
  check(manifest["mini-band"].travelAxis === "x" && manifest["mini-band"].mirrorForReverse, "Leftward shuffle can mirror without turning the chest away");
  for (const direction of ["forward", "backward"]) {
    const variant = manifest["mini-band"].directionalVariants[direction];
    close(variant.strideMeters, .4, `Band ${direction} uses a measured low-step cycle`);
    check(variant.cyclic && variant.startSeconds > 0 && variant.durationSeconds > 0, `${direction} is an exported animation segment`);
    check(variant.travelAxis === "y" && variant.travelSign === (direction === "forward" ? 1 : -1), `${direction} gait preserves body facing`);
  }
});

function harness(THREE, compiled) {
  const player = { runtime: { THREE }, actors: {}, actorList: [], activeActor: null,
    authoredTime: 0, motionManifest: manifest, equipment: [], wearables: [],
    drillGroup: new THREE.Group(), courtLabels: [], equipmentPrototypes: {} };
  ["mats", "agility ladder", "wall"].forEach(key => {
    const root = new THREE.Group();
    root.add(new THREE.Mesh(new THREE.BoxGeometry(1, .1, 1), new THREE.MeshBasicMaterial()));
    player.equipmentPrototypes[key] = root;
  });
  const attributes = {};
  const context = { player, RR, compiled, Math, Number, Object, String,
    list: value => Array.isArray(value) ? value : [],
    clean: value => value == null ? "" : String(value).trim(),
    finite: value => typeof value === "number" && Number.isFinite(value),
    clamp: (n, low, high) => Math.max(low, Math.min(high, n)),
    slug: value => String(value).replace(/[^a-z0-9]+/gi, "-"),
    translated: value => value,
    equipmentKeys: plan => (plan.equipment || []).map(value => typeof value === "object" ? value.label || value.type : value),
    ui: { root: { setAttribute: (key, value) => { attributes[key] = value; } } },
    makeLabelSprite: (_, actor) => { const sprite = new THREE.Sprite(); sprite.userData.text = actor.label; return sprite; },
    ...mechanics
  };
  const functions = ["mapPoint", "routePoints", "pointOnPolyline", "routeDirection", "facingYaw",
    "equipmentAnchor", "placeEquipment", "createPresentation", "routeFor", "actorTransform",
    "poseSegment", "motionSample", "updateActors", "bodyContact", "contactAnchor", "flight", "updateBalls", "updateTrainingEquipment"];
  const methods = vm.runInNewContext(functions.map(productionFunction).join("\n") +
    "\n({createPresentation, placeEquipment, updateActors, bodyContact, contactAnchor, updateBalls, updateTrainingEquipment});", context);
  function actor(data, plan, withContacts = false) {
    const root = new THREE.Group();
    const probe = new THREE.Group();
    probe.name = "FrameProbe";
    root.add(probe);
    const hip = new THREE.Group();
    hip.name = "ATH_TORSO";
    root.add(hip);
    const mixer = new THREE.AnimationMixer(root);
    const clipEnd = torsoTimes[torsoTimes.length - 1] + 1;
    const tracks = [new THREE.NumberKeyframeTrack("FrameProbe.position[y]", [0, clipEnd], [0, clipEnd]),
      new THREE.VectorKeyframeTrack("ATH_TORSO.position", torsoTimes, torsoValues)];
    if (withContacts) {
      for (const name of ["WRIST_L", "WRIST_R", "ELBOW_L", "ELBOW_R"]) {
        const bone = new THREE.Group();
        bone.name = "ATH_JOINT_" + name;
        root.add(bone);
        const nodeIndex = document.nodes.findIndex(node => node.name === bone.name);
        const channel = document.animations[0].channels.find(channel => channel.target.node === nodeIndex && channel.target.path === "translation");
        const sampler = document.animations[0].samplers[channel.sampler];
        tracks.push(new THREE.VectorKeyframeTrack(bone.name + ".position", floatAccessor(sampler.input), floatAccessor(sampler.output)));
      }
    }
    const clip = new THREE.AnimationClip("Reel sample probe", clipEnd, tracks);
    const point = mechanics.mappedPoint(plan, [data.x, data.y]);
    const entry = { data, root, probe, hip, home: new THREE.Vector3(point[0], 0, point[1]),
      mixer, action: mixer.clipAction(clip).play(), label: new THREE.Sprite(),
      contactPoints: {},
      ring: new THREE.Mesh(new THREE.RingGeometry(.2, .3), new THREE.MeshBasicMaterial()) };
    player.actorList.push(entry);
    player.actors[data.id] = entry;
    return entry;
  }
  return { player, methods, attributes, actor, context };
}

async function main() {
  const core = fs.readFileSync(path.join(ROOT, "vendor/three/three.core.min.js"));
  const THREE = await import(`data:text/javascript;base64,${core.toString("base64")}`);
  test("Actual youth target meshes and point labels are visible and fixed", () => {
    for (const phase of youth.phases) {
      const h = harness(THREE, youth);
      h.methods.createPresentation(phase);
      const hoops = [];
      h.player.drillGroup.traverse(object => { if (object.name === "TargetHoop") hoops.push(object); });
      check(hoops.length === 3, `${phase.id}: render the three authored hula hoops; markerKind cannot be discarded`);
      const fixed = hoops.map(object => object.getWorldPosition(new THREE.Vector3()));
      const expectedCenters = [[-2.5, -6.3], [2.5, -6.3], [0, -2.325]];
      fixed.forEach((position, index) => {
        close(position.x, expectedCenters[index][0], "Rendered hoop has its saved lateral placement");
        close(position.z, expectedCenters[index][1], "Rendered hoop has its saved court-half placement");
        check(position.y > 0 && position.y < .10, "Youth hoops rest on the floor");
      });
      const labels = h.player.courtLabels.map(sprite => sprite.userData.text);
      check(labels.filter(label => /5 pts/.test(label)).length === 2 && labels.some(label => /1 pt/.test(label)), "Targets retain their visible point labels");
      const actor = h.actor(phase.plan.actors[0], phase.plan);
      h.player.activeActor = actor;
      for (const position of [[-4, 0, 8], [2, 0, -3], [0, 0, 0]]) {
        actor.root.position.set(...position);
        h.methods.updateTrainingEquipment();
        hoops.forEach((object, index) => close(object.getWorldPosition(new THREE.Vector3()).distanceTo(fixed[index]), 0, "Targets must stay on the floor when the active athlete moves"));
      }
      h.player.equipment.forEach(entry => check(entry.root.visible, "Every placed target is visible outside a single action beat"));
    }
  });

  test("Actual authored zones, lines, labels and apparatus reach the scene", () => {
    const plan = { width: 9, height: 30, equipment: [], actors: [{ id: "D", x: 4.5, y: 4, authored: {} }], routes: [], beats: [], contacts: [],
      presentation: { coordinateSystem: "metric", net: 0, bounds: { minX: 0, maxX: 9, minY: -9, maxY: 9 },
        zones: [{ id: "saved-zone", x: 1, y: 2, w: 2, h: 3, label: "Passing lane" },
          { id: "circle-zone", x: 5, y: 2, w: 1, h: 1, r: .5, shape: "circle", label: "Circle target" }],
        boundaries: [{ x: 0, y: -9, w: 9, h: 18 }],
        lines: [{ y: 3 }, { x: 2 }], labels: [{ x: 1, y: -7, text: "Serve here" }],
        props: [{ id: "saved-hoop", type: "hoop", x: 7, y: -5, r: .4, label: "Accuracy hoop" },
          { id: "saved-mat", type: "mat", x: 3, y: 5, w: 2, h: 1, label: "Landing mat" },
          { id: "saved-rectangle", type: "zone", x: 3, y: -4, w: 2, h: 1, label: "Rectangular target" }] } };
    const h = harness(THREE, youth);
    h.methods.createPresentation({ plan });
    const find = name => { const object = h.player.drillGroup.getObjectByName(name); check(object && object.visible, `${name}: authored content must be rendered`); return object; };
    const bounds = object => new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
    const zone = find("CourtProp_saved-zone");
    close(zone.position.x, -2.5, "Top-left zone x becomes its physical center");
    close(zone.position.z, 3.5, "Top-left zone y becomes its physical center");
    close(bounds(zone).x, 2, "Saved zone width");
    close(bounds(zone).z, 3, "Saved zone depth");
    check(find("CourtProp_circle-zone").getObjectByName("TargetHoop"), "Circular zones remain circular");
    check(find("CourtProp_saved-rectangle").getObjectByName("TargetZoneFill"), "An explicit rectangular zone prop must not turn into a hoop");
    const horizontal = find("CourtProp_line-0");
    close(horizontal.position.z, 3, "Saved horizontal line position");
    close(bounds(horizontal).x, 9, "Horizontal line spans the actual court boundaries");
    const vertical = find("CourtProp_line-1");
    close(vertical.position.x, -2.5, "Saved vertical line position");
    close(bounds(vertical).z, 18, "Vertical line spans the full court, independent of queues");
    const label = find("CourtLabel_authored-label-0");
    close(label.position.x, -3.5, "Saved annotation x");
    close(label.position.z, -7, "Saved annotation depth");
    check(label.userData.text === "Serve here", "Saved annotation text reaches the label renderer");
    const hoop = find("CourtProp_saved-hoop");
    close(hoop.position.x, 2.5, "Hoop uses its authored center");
    close(hoop.position.z, -5, "Hoop stays on its authored court half");
    const mat = h.player.equipment.find(entry => entry.key === "mats");
    check(mat, "Required mat geometry exists");
    close(mat.root.position.x, -1.5, "Mat uses its authored station");
    close(mat.root.position.z, 5, "Mat authored station depth");
    close(bounds(mat.root).x, 2, "Mat width fits the saved footprint");
    close(bounds(mat.root).z, 1, "Mat depth fits the saved footprint");
  });

  test("Raised hoop geometry agrees with the ball target elevation", () => {
    const plan = { width: 9, height: 18, actors: [], routes: [], beats: [], equipment: [],
      presentation: { coordinateSystem: "metric", net: 0, bounds: { minX: 0, maxX: 9, minY: -9, maxY: 9 },
        zones: [], boundaries: [], lines: [], labels: [], props: [
          { id: "high-hoop", type: "hoop", x: 4.5, y: -4, w: 1, h: 1, r: .5, elevation: 2.2, vertical: true, label: "Setting window" }
        ] } };
    const h = harness(THREE, youth);
    h.methods.createPresentation({ plan });
    const hoop = h.player.drillGroup.getObjectByName("CourtProp_high-hoop");
    check(hoop && hoop.getObjectByName("TargetHoop"), "The overhead target is a real hoop mesh");
    const box = new THREE.Box3().setFromObject(hoop);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const ballHeight = mechanics.targetElevation(plan, [4.5, -4]);
    close(ballHeight, 2.2, "The ball route ends at the saved overhead target height");
    close(center.y, ballHeight, "The hoop center and ball target share their height", .04);
    check(size.y > .9 && size.z < .1, "An overhead target faces the incoming ball vertically");
    close(mechanics.targetElevation(plan, [0, 4]), .12, "Unmarked destinations remain at floor-ball height");
  });

  test("Production player repeats the gait by distance and switches direction without turning", () => {
    const h = harness(THREE, mini);
    const data = { id: "D", x: 3.5, y: 5, team: "a", authored: { facing: "north" } };
    const plan = { width: 9, height: 8, equipment: [], actors: [data], contacts: [],
      presentation: { coordinateSystem: "metric", net: null, bounds: { minX: 0, maxX: 9, minY: 0, maxY: 8 } } };
    const actor = h.actor(data, plan);
    for (const direction of ["right", "left", "forward", "backward"]) {
      const to = direction === "right" ? [5.5, 5] : direction === "left" ? [1.5, 5] : direction === "forward" ? [3.5, 3] : [3.5, 7];
      const route = { id: "lane", type: "move", from: [3.5, 5], to };
      const beat = { id: "step", actorId: "D", motionId: "mini-band", routeId: "lane", startMs: 0, durationMs: 12000, endMs: 12000 };
      plan.routes = [route]; plan.beats = [beat];
      const segment = manifest["mini-band"].directionalVariants[direction] || manifest["mini-band"];
      for (const progress of [.1, .25, .5, .75, .9, .25]) {
        h.methods.updateActors({ plan }, progress * beat.durationMs, [beat]);
        const traveled = mechanics.travelProgress(progress) * 2;
        const cycle = (traveled / .4) % 1;
        close(actor.currentProgress, cycle, `${direction}: repeated sample follows measured distance`);
        close(actor.probe.position.y, mechanics.sampleTime(segment, cycle), `${direction}: actual mixer samples the correct directional segment`, 2e-5);
        close(actor.root.rotation.y, 0, `${direction}: chest stays facing the coach`);
        check(direction === "left" ? actor.root.scale.x < 0 : actor.root.scale.x > 0, `${direction}: lateral mirror is applied and cleared deterministically`);
      }
    }
  });
  test("Frozen setup holds the actor and does not launch a ball", () => {
    const data = { id: "D", x: 4.5, y: 5, team: "a", authored: { facing: "north" } };
    const move = { id: "setup-move", actorId: "D", motionId: "shuffle", routeId: "lane",
      startMs: 0, durationMs: 1000, endMs: 1000, freezeProgress: .25 };
    const hit = { id: "setup-hit", actorId: "D", motionId: "serve", routeId: "ball",
      startMs: 0, durationMs: 1000, endMs: 1000, freezeProgress: .25 };
    const plan = { width: 9, height: 18, equipment: [], actors: [data], contacts: [], beats: [move, hit],
      routes: [{ id: "lane", type: "move", from: [4.5, 5], to: [6.5, 5] },
        { id: "ball", type: "ball", from: [4.5, 5], to: [4.5, -5] }] };
    const h = harness(THREE, { drill: { id: "frozen-setup-regression" } });
    const actor = h.actor(data, plan, true);
    h.player.ballPool = [new THREE.Group()];
    h.context.phaseProgress = () => h.player.authoredTime;
    h.context.ensureBall = () => { throw new Error("Frozen setup unexpectedly launches a ball"); };
    for (const progress of [.1, .5, .9]) {
      h.player.authoredTime = progress;
      h.methods.updateActors({ plan }, progress * 1000, [move, hit]);
      close(actor.root.position.distanceTo(actor.home), 0, "Setup does not translate the player along a future drill route");
      h.methods.updateBalls({ plan, sourceDurationMs: 1000 }, [move, hit]);
      check(h.player.ballPool.every(ball => !ball.visible), "A setup pose does not show an unstarted ball flight");
    }
  });
  test("A sequence of exercises advances continuously along one route", () => {
    const data = { id: "D", x: 2.5, y: 5, team: "a", authored: { facing: "north" } };
    const beats = [0, 1].map(index => ({ id: "step-" + index, actorId: "D", motionId: "shuffle", routeId: "lane",
      startMs: index * 1000, endMs: (index + 1) * 1000, durationMs: 1000,
      routeStartProgress: index / 2, routeEndProgress: (index + 1) / 2 }));
    const plan = { width: 9, height: 18, equipment: [], actors: [data], contacts: [], beats,
      routes: [{ id: "lane", type: "move", from: [2.5, 5], to: [6.5, 5] }] };
    const h = harness(THREE, { drill: { id: "sequence-route-regression" } });
    const actor = h.actor(data, plan);
    let before = null;
    for (const time of [0, 500, 999.999, 1000, 1500, 2000]) {
      const beat = time < 1000 ? beats[0] : beats[1];
      h.methods.updateActors({ plan }, time, [beat]);
      const progress = Math.min(1, (time - beat.startMs) / beat.durationMs);
      const traveled = 4 * (beat.routeStartProgress + mechanics.travelProgress(progress) * .5);
      close(actor.root.position.x - actor.home.x, traveled, "Each sequence item uses its assigned portion of the drill route");
      if (time === 999.999) before = actor.root.position.clone();
      if (time === 1000) check(actor.root.position.distanceTo(before) < .0001, "Changing exercise does not teleport the athlete to the route start");
    }
  });
  test("Production player samples the authored posture during the actual skill", () => {
    for (const [motionId, posture] of [["ready", "supine"], ["ready", "seated"], ["ready", "kneeling"],
      ["pass", "seated"], ["set", "kneeling"], ["set", "sit-stand"]]) {
      const segment = manifest[motionId].postures && manifest[motionId].postures[posture];
      check(segment && segment.durationSeconds > 0, `${motionId}/${posture} must be present in the delivered asset`);
      const data = { id: "D", x: 4.5, y: 5, team: "a", authored: { facing: "north", posture } };
      const plan = { width: 9, height: 18, equipment: [], actors: [data], contacts: [],
        routes: [{ id: "ball", type: "ball", from: [4.5, 5], to: [4.5, -4] }],
        presentation: { coordinateSystem: "metric", net: 0, bounds: { minX: 0, maxX: 9, minY: -9, maxY: 9 } } };
      const beat = { id: "contact", actorId: "D", motionId, routeId: "ball", startMs: 0, durationMs: 3500, endMs: 3500 };
      plan.beats = [beat];
      const h = harness(THREE, { drill: { id: "posture-regression" } });
      const actor = h.actor(data, plan);
      const sampledHeights = [];
      for (const progress of [.15, .30, .56, .85, .30]) {
        h.methods.updateActors({ plan }, progress * beat.durationMs, [beat]);
        // A passive static pose may use any key inside its constant segment.
        if (motionId === "ready") {
          check(actor.probe.position.y >= segment.startSeconds - 2e-5 &&
            actor.probe.position.y <= segment.startSeconds + segment.durationSeconds + 2e-5,
          `${posture}: the waiting actor samples the authored posture instead of standing`);
        } else {
          close(actor.probe.position.y, mechanics.sampleTime(segment, progress),
            `${motionId}/${posture}: the body performs its contextual skill, not a frozen ready pose`, 2e-5);
        }
        sampledHeights.push(actor.hip.position.y);
      }
      if (posture === "seated") check(sampledHeights.every(height => height >= .14 && height <= .18), "The actual exported seated pelvis stays at floor level");
      if (posture === "kneeling") check(sampledHeights.every(height => height >= .53 && height <= .59), "The actual exported kneeling pelvis remains over its supports");
      if (posture === "supine") check(sampledHeights.every(height => height >= .18 && height <= .24), "The actual passive game target lies on the floor");
      if (posture === "sit-stand") {
        check(Math.min(...sampledHeights) < .18, "The actual Set and Sit body reaches the floor");
        check(Math.max(...sampledHeights) > .90, "The actual Set and Sit body rises for its setting contact");
      }
      actor.data.authored.posture = "";
      h.methods.updateActors({ plan }, .56 * beat.durationMs, [beat]);
      close(actor.probe.position.y, mechanics.sampleTime(manifest[motionId], .56),
        `${motionId}: clearing a posture restores ordinary motion without stale context`, 2e-5);
    }
  });
  test("Every specialized body variant reaches the actual player mixer", () => {
    let tested = 0;
    for (const [motionId, baseSegment] of Object.entries(manifest)) {
      for (const [variantId, segment] of Object.entries(baseSegment.variants || {})) {
        const data = { id: "D", x: 4.5, y: 5, team: "a", authored: { facing: "north" } };
        const beat = { id: "variant", actorId: "D", motionId, variantId, startMs: 0, durationMs: 1000, endMs: 1000 };
        const plan = { width: 9, height: 18, actors: [data], equipment: [], contacts: [], routes: [], beats: [beat] };
        const h = harness(THREE, { drill: { id: "specialized-regression" } });
        const actor = h.actor(data, plan);
        for (const progress of [.25, .55, .80]) {
          h.methods.updateActors({ plan }, progress * beat.durationMs, [beat]);
          close(actor.probe.position.y, mechanics.sampleTime(segment, progress),
            `${motionId}/${variantId}: runtime must select the specialized exported clip`, 3e-5);
          check(Number.isFinite(actor.hip.position.y), `${motionId}/${variantId}: actual exported body track remains finite`);
        }
        actor.mixer.stopAllAction();
        actor.mixer.uncacheRoot(actor.root);
        tested++;
      }
    }
    check(tested >= 63, "The complete specialized body repertoire is present in the shipped asset");
  });
  test("Contact anchors use the named clip and restore the currently displayed pose", () => {
    const motionId = "attack", variantId = "slide-one-foot";
    const segment = manifest[motionId].variants[variantId];
    const data = { id: "D", x: 4.5, y: 5, team: "a", authored: { facing: "north" } };
    const beat = { id: "slide", actorId: "D", motionId, variantId, routeId: "ball", startMs: 0, durationMs: 1000, endMs: 1000 };
    const plan = { width: 9, height: 18, actors: [data], equipment: [], contacts: [], beats: [beat],
      routes: [{ id: "ball", type: "ball", from: [4.5, 5], to: [3, -4] }] };
    const h = harness(THREE, { drill: { id: "slide-approach-attack" } });
    const actor = h.actor(data, plan, true);
    h.methods.updateActors({ plan }, 200, [beat]);
    actor.root.scale.x = -1;
    const before = { time: actor.probe.position.y, hip: actor.hip.position.clone(), position: actor.root.position.clone(),
      scale: actor.root.scale.clone(), segment: actor.currentSegment };
    const observed = [];
    h.context.bodyContact = (entry, motion, hand) => {
      observed.push(entry.probe.position.y);
      return h.methods.bodyContact(entry, motion, hand);
    };
    const anchor = h.methods.contactAnchor({ plan }, beat);
    close(observed[0], mechanics.sampleTime(segment, mechanics.contactProgress(segment)),
      "Contact calculation samples the named slide takeoff rather than the generic attack", 3e-5);
    check(Number.isFinite(anchor.x) && Number.isFinite(anchor.y) && anchor.y > 2.0, "The contact uses the real exported overhead wrist position");
    close(actor.probe.position.y, before.time, "Temporary contact sampling restores the visible animation clock", 3e-5);
    close(actor.hip.position.distanceTo(before.hip), 0, "Temporary contact sampling restores the actual hip pose", 3e-5);
    close(actor.root.position.distanceTo(before.position), 0, "Contact sampling preserves current court position");
    close(actor.root.scale.distanceTo(before.scale), 0, "Contact sampling preserves mirrored lateral pose");
    check(actor.currentSegment === before.segment, "The selected variant survives contact caching");
  });
  test("Balloons float from the owner's hand, remain deterministic, and visibly leave play", () => {
    const owner = { id: "owner", x: 4.5, y: 5, team: "a", authored: { balloon: true } };
    const dog = { id: "dog", x: 2, y: 5, team: "b", authored: { balloon: false } };
    const watcher = { id: "watcher", x: 7, y: 5, team: "a", authored: { balloon: false } };
    const beat = { id: "tap", actorId: "owner", motionId: "set", startMs: 0, durationMs: 1000, endMs: 1000 };
    const plan = { width: 9, height: 18, equipment: [], contacts: [], routes: [], actors: [owner, dog, watcher], beats: [beat] };
    const phase = { plan, sourceDurationMs: 1000 };
    const h = harness(THREE, { drill: { id: "balloon-regression" } });
    const actor = h.actor(owner, plan, true);
    h.actor(dog, plan, true); h.actor(watcher, plan);
    h.player.ballKind = "balloon";
    h.player.ballPool = [];
    // This fixture lasts exactly one second, so its clock is its progress.
    h.context.phaseProgress = () => h.player.authoredTime;
    h.context.ensureBall = index => h.player.ballPool[index] || (h.player.ballPool[index] = new THREE.Group());
    let repeated = null;
    for (const progress of [.56, .25, .80, .25]) {
      h.player.authoredTime = progress;
      h.methods.updateActors(phase, progress * 1000, [beat]);
      const time = actor.probe.position.y;
      h.methods.updateBalls(phase, [beat]);
      check(h.player.ballPool.filter(ball => ball.visible).length === 1, "Only the owner has a balloon; dogs and waiting players do not");
      const balloon = h.player.ballPool[0];
      check(balloon.position.y > 1.7, "The balloon floats around the raised hand, not at a floor endpoint");
      close(actor.probe.position.y, time, "Balloon tap anchoring restores the displayed body sample", 3e-5);
      if (progress === .25) {
        if (repeated) close(balloon.position.distanceTo(repeated), 0, "Scrubbing to the same balloon tap is deterministic");
        repeated = balloon.position.clone();
      }
    }
    owner.authored.balloon = "lost";
    const dogTap = { id: "dog-tap", actorId: "dog", motionId: "set", startMs: 400, durationMs: 400, endMs: 800 };
    plan.beats.push(dogTap);
    const release = mechanics.contactTime(dogTap, manifest.set);
    const positions = new Map();
    for (const progress of [.10, release / 1000, 1, .10, release / 1000]) {
      h.player.authoredTime = progress;
      h.methods.updateActors(phase, Math.min(.999, progress) * 1000, [beat, dogTap]);
      const dogTime = h.player.actors.dog.probe.position.y;
      h.methods.updateBalls(phase, [beat, dogTap]);
      const position = h.player.ballPool[0].position.clone();
      if (positions.has(progress)) close(position.distanceTo(positions.get(progress)), 0, "Scrubbing across a dog's tap preserves the same balloon path");
      positions.set(progress, position);
      close(h.player.actors.dog.probe.position.y, dogTime, "Balloon loss anchoring restores the dog's actual body sample", 3e-5);
    }
    check(positions.get(.10).y > 1.7, "The balloon stays up before the dog reaches its tap");
    const tapPoint = h.methods.contactAnchor(phase, dogTap).add(new THREE.Vector3(0, .13, 0));
    close(positions.get(release / 1000).distanceTo(tapPoint), 0, "Loss begins at the actual exported hand contact and its authored contact time");
    close(positions.get(1).x - tapPoint.x, -1.7, "The dog taps the balloon visibly out of play");
    close(positions.get(1).y, .32, "The lost balloon reaches court level");
  });
  if (failures.length) {
    failures.forEach(failure => console.error("FAIL: " + failure));
    console.error(`CoachCam presentation: ${checks} checks passed; ${failures.length} groups failed.`);
    process.exitCode = 1;
  } else {
    console.log(`CoachCam presentation: ALL ${checks} CHECKS PASSED (net-aligned court, full target staging, fixed props, authored lines/labels, distance-driven directional gait)`);
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
