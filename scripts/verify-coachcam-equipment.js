// Real Three.js geometry and anatomical attachment checks for visible props.
// Run: node scripts/verify-coachcam-equipment.js
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = path.join(__dirname, "..");
let checks = 0;
function check(condition, message) { assert(condition, message); checks++; }
function close(actual, expected, message, tolerance = 1e-6) {
  check(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
    `${message}: expected ${expected}, received ${actual}`);
}

async function verify() {
  const core = fs.readFileSync(path.join(ROOT, "vendor/three/three.core.min.js"));
  const THREE = await import(`data:text/javascript;base64,${core.toString("base64")}`);
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js/coachcam-equipment-3d.js"), "utf8"), sandbox);
  const api = sandbox.RR.coachCamEquipment3D;

  function makeActor() {
    const root = new THREE.Group();
    const coordinates = {
      HIP_L: [-0.15, 0.82, 0.11], HIP_R: [0.15, 0.82, 0.11],
      KNEE_L: [-0.33, 0.51, -0.16], KNEE_R: [0.33, 0.51, -0.16],
      ANKLE_L: [-0.34, 0.085, 0], ANKLE_R: [0.34, 0.085, 0],
      ELBOW_L: [-0.3, 1.17, -0.08], ELBOW_R: [0.3, 1.17, -0.08],
      WRIST_L: [-0.4, 1.04, -0.12], WRIST_R: [0.4, 1.04, -0.12]
    };
    for (const [name, coordinatesForJoint] of Object.entries(coordinates)) {
      const joint = new THREE.Bone();
      joint.name = `ATH_JOINT_${name}`;
      joint.position.fromArray(coordinatesForJoint);
      root.add(joint);
    }
    for (const side of ["L", "R"]) {
      const hand = new THREE.Bone();
      hand.name = `ATH_HAND_${side}`;
      hand.position.fromArray(coordinates[`WRIST_${side}`]);
      hand.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, -1));
      // The production GLB exports unit rest bones with segment-length scale.
      hand.scale.y = 0.15;
      root.add(hand);
    }
    root.updateMatrixWorld(true);
    return { root, home: root.position.clone(), currentMotion: "ready", currentProgress: 0 };
  }

  function worldJoint(actor, name) {
    return actor.root.getObjectByName(`ATH_JOINT_${name}`).getWorldPosition(new THREE.Vector3());
  }
  function centerline(object, sample) {
    const position = object.geometry.getAttribute("position");
    const center = new THREE.Vector3();
    for (let c = 0; c < 4; c++) center.add(new THREE.Vector3().fromBufferAttribute(position, sample * 4 + c));
    return center.multiplyScalar(0.25);
  }
  function finiteGeometry(object, message) {
    object.traverse(child => {
      if (!child.isMesh) return;
      for (const name of ["position", "normal"]) {
        const attribute = child.geometry.getAttribute(name);
        if (attribute) check(Array.from(attribute.array).every(Number.isFinite), `${message}: finite ${name} buffer`);
      }
      check(child.userData.coachCamOwnedGeometry && child.geometry.userData.coachCamOwnedGeometry,
        `${message}: geometry participates in player cleanup`);
      check(child.material.userData.coachCamOwnedMaterial, `${message}: material participates in player cleanup`);
      check(!child.isLine, `${message}: uses physical mesh thickness`);
    });
  }

  const actor = makeActor();
  const mini = api.createWearable(THREE, "mini bands");
  check(mini.update(actor) && mini.root.visible, "the assigned athlete wears the mini band while waiting in ready pose");
  const miniMesh = mini.root.getObjectByName("TensionedBandRibbon");
  check(miniMesh.isMesh, "mini band renders as a solid ribbon mesh");
  close(mini.root.userData.bandWidthMetres, 0.055, "mini band has a visible 5.5 cm strap width");
  check(mini.root.userData.placement === "above-knees", "default band placement matches the saved defensive shuffle instructions");
  const geometry = miniMesh.geometry;
  const positions = geometry.getAttribute("position");
  const originalBuffer = positions.array;
  const normals = geometry.getAttribute("normal");
  const miniSamples = positions.count / 4 - 1;
  const initialPose = Array.from(originalBuffer);
  const pathSegment = new THREE.Line3();
  const closest = new THREE.Vector3();

  // Exercise translation, yaw, deep stance, a floor/bridge orientation and
  // reverse seeks. Attachment depends on current bones, never render history.
  for (const [index, progress] of [0, 0.25, 0.7, 1, 0.3, 0.7, 0].entries()) {
    actor.currentMotion = index % 2 ? "mini-band" : "ready";
    actor.currentProgress = progress;
    actor.root.position.set(progress * 4, 0, -progress);
    actor.root.rotation.set(progress * 0.8, progress * 1.7, 0);
    check(mini.update(actor), `mini band samples posed athlete at ${progress}`);
    const expectedLeft = worldJoint(actor, "KNEE_L").lerp(worldJoint(actor, "HIP_L"), 0.24);
    const expectedRight = worldJoint(actor, "KNEE_R").lerp(worldJoint(actor, "HIP_R"), 0.24);
    close(mini.root.userData.attachmentPoints[0].distanceTo(expectedLeft), 0, "left strap follows the anatomical thigh station");
    close(mini.root.userData.attachmentPoints[1].distanceTo(expectedRight), 0, "right strap follows the anatomical thigh station");
    pathSegment.set(expectedLeft, expectedRight);
    for (let sample = 0; sample <= miniSamples; sample++) {
      const point = centerline(miniMesh, sample);
      pathSegment.closestPointToPoint(point, true, closest);
      close(point.distanceTo(closest), 0.106, "capsule ribbon remains outside the thighs", 2e-6);
    }
    close(centerline(miniMesh, 0).distanceTo(centerline(miniMesh, miniSamples)), 0, "mini band loop closes without a gap");
    check(geometry === miniMesh.geometry && positions === geometry.getAttribute("position") &&
      originalBuffer === positions.array && normals === geometry.getAttribute("normal"),
    "wearable updates reuse the geometry and GPU attribute buffers");
    finiteGeometry(mini.root, "mini band");
  }
  check(initialPose.every((value, i) => Math.abs(value - originalBuffer[i]) < 1e-7),
    "returning to the initial pose restores exactly the same ribbon positions");

  const ankleBand = api.createWearable(THREE, "mini bands", { placement: "ankles" });
  check(ankleBand.update(actor), "ankle placement is available for the documented alternate exercise");
  close(ankleBand.root.userData.attachmentPoints[0].distanceTo(
    worldJoint(actor, "ANKLE_L").lerp(worldJoint(actor, "KNEE_L"), 0.18)), 0,
  "ankle band attaches above the shoe on the lower shin");

  const handheld = api.createWearable(THREE, "bands", { mode: "handheld" });
  check(handheld.update(actor), "handheld resistance band stays visible in a ready pose");
  const heldMesh = handheld.root.getObjectByName("TensionedBandRibbon");
  const palmLeft = worldJoint(actor, "WRIST_L").add(new THREE.Vector3(0, 0, -0.065));
  const palmRight = worldJoint(actor, "WRIST_R").add(new THREE.Vector3(0, 0, -0.065));
  close(centerline(heldMesh, 0).distanceTo(palmRight), 0, "handheld band reaches the right palm grip");
  close(centerline(heldMesh, 40).distanceTo(palmLeft), 0, "handheld band reaches the left palm grip");
  finiteGeometry(handheld.root, "handheld resistance band");

  const anchor = new THREE.Vector3(0, 1.7, 1.35);
  const anchored = api.createWearable(THREE, "bands", { mode: "anchored-single", anchor });
  const anchoredLeft = api.createWearable(THREE, "bands", { mode: "anchored-single", anchor, hand: "L" });
  const rows = api.createWearable(THREE, "bands", { mode: "anchored", anchor: [0, 1.35, -1.4] });
  for (const x of [0, 1, -0.5, 0]) {
    actor.root.position.x = x;
    actor.currentMotion = "band-arm-swing";
    check(anchored.update(actor), "resisted hitting band follows the hand");
    close(anchored.root.userData.anchorPoint.distanceTo(anchor), 0, "resistance anchor cannot glide with the athlete");
    close(centerline(anchored.root.getObjectByName("TensionedBandRibbon"), 40).distanceTo(anchor), 0,
      "single-hand resistance loop meets the fixed attachment point");
    check(anchoredLeft.update(actor), "left-hand resistance work renders with its own hand attachment");
    const expectedLeftPalm = worldJoint(actor, "WRIST_L").add(new THREE.Vector3(0, 0, -.065));
    close(centerline(anchoredLeft.root.getObjectByName("TensionedBandRibbon"), 0).distanceTo(expectedLeftPalm), 0,
      "left-hand band follows the left palm, not the other moving hand");
    close(centerline(anchoredLeft.root.getObjectByName("TensionedBandRibbon"), 40).distanceTo(anchor), 0,
      "left-hand resistance band retains the stationary anchor");
    const post = anchored.root.getObjectByName("FixedResistanceBandAnchor");
    close(post.position.x, anchor.x, "anchor post keeps its ground x position");
    close(post.position.z, anchor.z, "anchor post keeps its ground z position");
    check(rows.update(actor), "two-hand row resistance renders");
    close(centerline(rows.root.getObjectByName("TensionedBandRibbon"), 32).distanceTo(rows.root.userData.anchorPoint), 0,
      "row band passes exactly through its chest-height anchor");
  }
  finiteGeometry(anchored.root, "anchored resistance band");

  const rope = api.createWearable(THREE, "jump ropes");
  check(rope.update(actor), "waiting athlete keeps a visible jump rope");
  const cord = rope.root.getObjectByName("JumpRopeCord");
  const cordBuffer = cord.geometry.getAttribute("position").array;
  for (const progress of [0, 0.125, 0.25, 0.4, 0.625, 0.75, 1, 0.125]) {
    actor.currentMotion = "jump-rope";
    actor.currentProgress = progress;
    const lift = 0.065 * Math.max(0, Math.sin(4 * Math.PI * progress));
    for (const side of ["L", "R"]) {
      actor.root.getObjectByName(`ATH_JOINT_WRIST_${side}`).position.y = 1.04 + lift;
      actor.root.getObjectByName(`ATH_HAND_${side}`).position.y = 1.04 + lift;
    }
    check(rope.update(actor), `rope fits at jump progress ${progress}`);
    check(cordBuffer === cord.geometry.getAttribute("position").array, "jump rope animation reuses its tube buffer");
    const minimumHeight = Array.from(cordBuffer).filter((_, index) => index % 3 === 1).reduce((a, b) => Math.min(a, b));
    check(minimumHeight >= 0.004, `jump rope stays above the court at ${progress}`);
    for (let side = 0; side < 2; side++) {
      close(rope.root.getObjectByName(`JumpRopeHandle_${side === 0 ? "L" : "R"}`).position.distanceTo(
        rope.root.userData.attachmentPoints[side]), 0, "jump rope handle stays in its assigned palm");
    }
  }
  finiteGeometry(rope.root, "jump rope");

  const target = api.createCourtTarget(THREE, { type: "zone", width: 3, depth: 2, color: 0xffcc00 });
  check(target.children.length === 5, "target zone includes a translucent scoring area and four visible tape edges");
  const targetBounds = new THREE.Box3().setFromObject(target).getSize(new THREE.Vector3());
  close(targetBounds.x, 3, "rectangular target width matches the authored placement");
  close(targetBounds.z, 2, "rectangular target depth matches the authored placement");
  const boundary = api.createCourtTarget(THREE, { type: "zone", width: 9, depth: 18, boundaryOnly: true });
  check(boundary.children.length === 4 && !boundary.getObjectByName("TargetZoneFill"),
    "whole-court boundary renders tape without obscuring the court surface");
  const hoop = api.createCourtTarget(THREE, { type: "hoop", radius: 0.6 });
  const hoopBounds = new THREE.Box3().setFromObject(hoop).getSize(new THREE.Vector3());
  close(hoopBounds.x, 1.2, "target hoop outer diameter is authored in metres");
  close(hoopBounds.z, 1.2, "hoop lies flat on the court");
  check(hoopBounds.y < 0.06 && hoopBounds.y > 0.04, "physical hoop remains visible from a low camera angle");
  const cone = api.createCourtTarget(THREE, { type: "cone", radius: 0.16, height: 0.3 });
  check(cone.getObjectByName("ConeContrastStripe"), "individual cone has a contrasting stripe for court-wide visibility");
  for (const object of [target, boundary, hoop, cone]) finiteGeometry(object, object.name);

  const balloon = api.createCourtTarget(THREE, { type: "balloon" });
  const balloonBody = balloon.getObjectByName("TrainingBalloon");
  const balloonSize = new THREE.Box3().setFromObject(balloonBody).getSize(new THREE.Vector3());
  close(balloonSize.x, .46, "training balloon is visibly larger than a volleyball");
  close(balloonSize.y, .552, "training balloon has the authored oval silhouette");
  check(balloon.getObjectByName("BalloonKnot").position.y < -.276, "balloon knot distinguishes the prop from a volleyball");
  close(balloon.userData.contactRadius, balloonSize.y / 2, "balloon contact metadata reaches its visible body surface");
  close(balloon.userData.contactRadii.x, balloonSize.x / 2, "balloon side-contact radius matches its mesh");
  const smallBalloon = api.createCourtTarget(THREE, { type: "balloon", radius: .18, color: 0xff88aa });
  close(smallBalloon.userData.contactRadius, .216, "custom balloon size preserves contact clearance");
  check(smallBalloon.getObjectByName("TrainingBalloon").material.color.getHex() === 0xff88aa,
    "authored balloon color reaches the displayed prop");
  finiteGeometry(balloon, "training balloon");
  finiteGeometry(smallBalloon, "custom training balloon");

  const cart = api.createCourtTarget(THREE, { type: "ball-cart" });
  const cartParts = { BasketLeg: [], BasketWheel: [], BallBasket: [], RefillBall: [] };
  cart.traverse(object => { if (cartParts[object.name]) cartParts[object.name].push(object); });
  check(cartParts.BasketLeg.length === 4 && cartParts.BasketWheel.length === 4,
    "ball cart has four supported legs and wheels");
  check(cartParts.BallBasket.length === 5, "ball cart includes a floor and four enclosing basket panels");
  check(cartParts.RefillBall.length === 6, "ball cart visibly shows balls ready for repeat feeds");
  for (const ball of cartParts.RefillBall) {
    close(ball.geometry.parameters.radius, .105, "cart holds volleyball-sized refill balls");
    check(Math.abs(ball.position.x) + .105 <= .345 && Math.abs(ball.position.z) + .105 <= .28,
      "refill ball sits within the basket footprint");
    check(ball.position.y + .105 > .89, "refill ball remains visible above the cart rim");
  }
  close(new THREE.Box3().setFromObject(cart).min.y, 0, "ball cart wheels sit on the court");
  finiteGeometry(cart, "ball cart");

  // Use the actual saved ladder layouts: their rectangles are rung spaces,
  // not the number of physical bars. Check every real cell boundary against
  // the displayed geometry rather than testing only a nominal counter.
  const catalogFiles = ["js/drills.js", ...Array.from({ length: 10 }, (_, i) => `js/drills-${i + 2}.js`),
    "js/extras-build.js", "js/format.js", "js/extras-data.js",
    ...Array.from({ length: 11 }, (_, i) => `js/extras-data-${i + 2}.js`)];
  for (const file of catalogFiles) vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), sandbox, { filename: file });
  const ladders = [];
  for (const id of ["agility-ladder-footwork", "ladder-lateral-quicksteps", "ladder-to-dig-reaction"]) {
    const saved = sandbox.RR.extras[id];
    for (const scene of saved.diagrams || [saved.diagram]) {
    const cells = scene.zones.filter(zone => !zone.label && zone.w > 0 && zone.h > 0);
    const start = Math.min(...cells.map(cell => cell.y));
    const end = Math.max(...cells.map(cell => cell.y + cell.h));
    const length = end - start;
    const ladder = api.createCourtTarget(THREE, { type: "agility-ladder", width: cells[0].w,
      depth: length, spaces: cells.length });
    ladders.push(ladder);
    const rungs = ladder.children.filter(object => object.name.startsWith("AgilityLadderRung_"));
    check(rungs.length === cells.length + 1, `${id}: every space has an entrance and exit crossbar`);
    close(ladder.userData.rungSpacingMetres, .5, `${id}: physical ladder pitch matches the footwork stride`);
    for (let i = 0; i < rungs.length; i++) {
      close(rungs[i].position.z + (start + end) / 2, start + i * .5,
        `${id}: physical crossbar lies at the saved cell boundary`);
      close(rungs[i].geometry.parameters.width, .64, `${id}: physical rung has the saved 64 cm width`);
      if (i) close(rungs[i].position.z - rungs[i - 1].position.z, .5, `${id}: adjacent crossbars remain exactly 50 cm apart`);
    }
    const bounds = new THREE.Box3().setFromObject(ladder).getSize(new THREE.Vector3());
    close(bounds.x, .64, `${id}: ladder rails do not change the authored width`);
    close(bounds.z, length + .035, `${id}: physical footprint includes the end crossbars`);
    check(bounds.y <= .013, `${id}: flat ladder stays close to the court surface`);
    finiteGeometry(ladder, id);
    }
  }

  // Missing attachment bones must not dump the equipment at world origin.
  check(!mini.update({ root: new THREE.Group() }) && !mini.root.visible,
    "missing rig attachments hide the invalid wearable instead of placing it on the floor");
  check(mini.update(actor) && mini.root.visible, "an intact actor restores its fitted equipment");
  let disposedGeometries = 0, disposedMaterials = 0;
  target.traverse(object => {
    if (object.geometry) object.geometry.addEventListener("dispose", () => { disposedGeometries++; });
    if (object.material) object.material.addEventListener("dispose", () => { disposedMaterials++; });
  });
  api.disposeGroup(target);
  close(disposedGeometries, 5, "target cleanup disposes every owned geometry once");
  close(disposedMaterials, 5, "target cleanup disposes every owned material once");
  for (const wearable of [mini, ankleBand, handheld, anchored, anchoredLeft, rows, rope]) wearable.dispose();
  for (const object of [boundary, hoop, cone, balloon, smallBalloon, cart, ...ladders]) api.disposeGroup(object);
  console.log(`CoachCam equipment: ${checks} checks passed.`);
}

verify().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
