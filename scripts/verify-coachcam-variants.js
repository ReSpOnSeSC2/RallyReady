// Saved drill steps must select delivered movements and leave time to teach them.
// Run: node scripts/verify-coachcam-variants.js
// Loads the production compiler/selector and reads the shipped GLB, not a fixture.
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
  "js/drill-human-motion.js", "js/drill-choreography.js", "js/coachcam-variants.js",
  "js/coachcam-equipment-3d.js", "js/coachcam-library-3d.js", "js/drill-animation.js"
];
for (const file of files) vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), sandbox, { filename: file });
const RR = sandbox.RR;
const api = RR.coachCamLibrary3D;
const bytes = fs.readFileSync(path.join(ROOT, api.contract.model));
const gltf = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString("utf8").trim());
const extras = gltf.scenes[gltf.scene || 0].extras;
const manifest = JSON.parse(extras.motion_manifest_json);
const frameSeconds = 1 / extras.source_fps;
const binaryOffset = 20 + bytes.readUInt32LE(12) + 8;
let checks = 0;
const failures = new Set();
function check(value, message) { assert(value, message); checks++; }
function near(actual, expected, tolerance, message) {
  check(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
    `${message}: expected ${expected}, received ${actual}`);
}
function test(name, callback) {
  try { callback(); } catch (error) { failures.add(`${name}: ${error.message}`); }
}
function floats(index) {
  const accessor = gltf.accessors[index];
  check(accessor.componentType === 5126 && accessor.type === "SCALAR", "Clip timestamps are float seconds");
  const view = gltf.bufferViews[accessor.bufferView];
  const offset = binaryOffset + (view.byteOffset || 0) + (accessor.byteOffset || 0);
  return Array.from({ length: accessor.count }, (_, i) => bytes.readFloatLE(offset + i * (view.byteStride || 4)));
}
const clip = gltf.animations.find(item => item.name === api.contract.clip || item.name === api.contract.importedClip);
assert(clip, "Delivered GLB contains the production animation clip");
const sampledNode = gltf.nodes.findIndex(node => node.name === "ATH_TORSO");
const channel = clip.channels.find(item => item.target.node === sampledNode && item.target.path === "translation");
assert(channel, "Delivered athlete has real body animation keys");
const times = floats(clip.samplers[channel.sampler].input);
function hasKey(seconds) { return times.some(time => Math.abs(time - seconds) <= 1e-4); }
const samplerTimes = new Map([[clip.samplers[channel.sampler].input, times]]);
function assertStaticKeys(segment) {
  const end = segment.startSeconds + segment.durationSeconds;
  for (const channel of clip.channels) {
    if (!/^ATH_/.test(gltf.nodes[channel.target.node].name || "")) continue;
    const sampler = clip.samplers[channel.sampler];
    if (!samplerTimes.has(sampler.input)) samplerTimes.set(sampler.input, floats(sampler.input));
    const input = samplerTimes.get(sampler.input);
    const accessor = gltf.accessors[sampler.output];
    const view = gltf.bufferViews[accessor.bufferView];
    const width = accessor.type === "VEC4" ? 4 : 3;
    const offset = binaryOffset + (view.byteOffset || 0) + (accessor.byteOffset || 0);
    const stride = view.byteStride || width * 4;
    const valuesAt = i => Array.from({ length: width }, (_, component) => bytes.readFloatLE(offset + i * stride + component * 4));
    function sample(time) {
      let high = input.length - 1, low = 0;
      while (low < high) { const middle = Math.floor((low + high) / 2); if (input[middle] < time) low = middle + 1; else high = middle; }
      const right = low, left = Math.max(0, right - 1);
      if (Math.abs(input[right] - time) < 1e-4) return valuesAt(right);
      if (Math.abs(input[left] - time) < 1e-4) return valuesAt(left);
      const a = valuesAt(left), b = valuesAt(right);
      const alpha = Math.max(0, Math.min(1, (time - input[left]) / (input[right] - input[left] || 1)));
      const sign = width === 4 && a.reduce((sum, value, i) => sum + value * b[i], 0) < 0 ? -1 : 1;
      const value = a.map((number, i) => number + (sign * b[i] - number) * alpha);
      return width === 4 ? value.map(number => number / Math.hypot(...value)) : value;
    }
    let first = null;
    // The exporter removes redundant keys from constant channels. Sample the
    // segment boundaries as well as retained interior keys in those channels.
    const samples = [sample(segment.startSeconds), sample(end)];
    for (let i = 0; i < input.length; i++) {
      if (input[i] >= segment.startSeconds - 1e-4 && input[i] <= end + 1e-4) samples.push(valuesAt(i));
    }
    for (const values of samples) {
      if (!first) first = values;
      // Quaternion signs may invert while representing the same orientation.
      const sign = width === 4 && values.reduce((sum, value, index) => sum + value * first[index], 0) < 0 ? -1 : 1;
      check(values.every((value, index) => Math.abs(value * sign - first[index]) < 1e-5),
        `Authored static hold keeps ${gltf.nodes[channel.target.node].name} ${channel.target.path} still`);
    }
  }
}
function segmentFor(beat, actor) {
  const parent = manifest[beat.motionId];
  if (!parent) return null;
  if (beat.variantId) return parent.variants && parent.variants[beat.variantId];
  const posture = actor && actor.authored && actor.authored.posture;
  return parent.postures && parent.postures[posture] || parent;
}
function actualSeconds(phase, beat) { return phase.duration * beat.durationMs / phase.sourceDurationMs; }
function distance(phase, beat) {
  const route = phase.plan.routes.find(item => item.id === beat.routeId && item.type === "move");
  if (!route || api.mechanics.stationMotion(beat.motionId)) return 0;
  const points = [route.from, ...(route.via || []), route.to].map(point => api.mechanics.mappedPoint(phase.plan, point));
  const full = points.slice(1).reduce((sum, point, i) => sum + Math.hypot(point[0] - points[i][0], point[1] - points[i][1]), 0);
  return full * (Number.isFinite(beat.routeStartProgress) && Number.isFinite(beat.routeEndProgress)
    ? beat.routeEndProgress - beat.routeStartProgress : 1);
}
const compiled = new Map();
const segmentChecks = new Set();
for (const drill of RR.drills.filter(api.isEligible)) {
  test(`${drill.id} compilation`, () => {
    const result = api.compile(drill);
    check(result && result.valid && result.phases.length > 0, "Saved drill has valid instructional phases");
    compiled.set(drill.id, result);
  });
  const result = compiled.get(drill.id);
  if (!result) continue;
  for (const phase of result.phases) test(`${drill.id} step ${phase.stepIndex + 1} sequence continuity`, () => {
    const groups = new Map();
    for (const beat of phase.plan.beats) {
      if (!/-variant-\d+$/.test(beat.id)) continue;
      const key = beat.id.replace(/-variant-\d+$/, "");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(beat);
    }
    for (const beats of groups.values()) {
      for (let i = 1; i < beats.length; i++) {
        near(beats[i].startMs, beats[i - 1].endMs, 1e-6, "Sequential movements have no gap or overlap");
        check(beats[i].actorId === beats[0].actorId, "A multi-action sequence stays with its athlete");
        near(beats[i].routeStartProgress, beats[i - 1].routeEndProgress, 1e-6, "A subsequent movement continues from the previous route position");
      }
      near(beats[0].routeStartProgress, 0, 1e-6, "A movement sequence starts at the beginning of its route");
      near(beats[beats.length - 1].routeEndProgress, 1, 1e-6, "A movement sequence completes its route exactly once");
    }
  });
  for (const phase of result.phases) for (const beat of phase.plan.beats) {
    if (!beat.variantDuration) continue;
    const context = `${drill.id} step ${phase.stepIndex + 1}: ${beat.motionId}.${beat.variantId || "held-ready"}`;
    test(context, () => {
      const actor = phase.plan.actors.find(item => item.id === beat.actorId);
      const segment = segmentFor(beat, actor);
      check(segment, "Selected variant exists under its parent motion in the delivered GLB");
      check(beat.repetitions >= 1 && Number.isInteger(beat.repetitions), "Repetition count is a positive integer");
      check(beat.durationMs > 0 && beat.startMs >= 0 && beat.endMs <= phase.sourceDurationMs + 1e-6, "Selected movement stays inside its phase");
      check(actualSeconds(phase, beat) + 1e-6 >= beat.variantDuration * beat.repetitions,
        `Movement needs ${beat.variantDuration * beat.repetitions}s, receives ${actualSeconds(phase, beat)}s`);
      if (Number.isFinite(beat.freezeProgress)) {
        check(beat.freezeProgress >= 0 && beat.freezeProgress <= 1, "A held setup samples a real pose inside the clip");
      } else {
        near(beat.variantDuration, segment.durationSeconds, frameSeconds + 1e-6, "Selected native duration matches the exported segment to one source frame");
        check(actualSeconds(phase, beat) + frameSeconds * beat.repetitions + 1e-6 >= segment.durationSeconds * beat.repetitions,
          "Repeated demonstrations have time for every native movement cycle");
        if (beat.variantStride) {
          near(beat.variantStride, segment.strideMeters, 1e-6, "Selected stride matches exported footfall travel");
          check(segment.cyclic && /^[xy]$/.test(segment.travelAxis), "Travelling variants declare cyclic motion and a travel axis");
          const cycles = distance(phase, beat) / segment.strideMeters;
          check(actualSeconds(phase, beat) + cycles * frameSeconds + 1e-6 >= cycles * segment.durationSeconds,
            "Route distance cannot force native footfalls to play faster than their authored duration");
        }
      }
      const key = `${beat.motionId}.${beat.variantId || actor && actor.authored && actor.authored.posture || "base"}`;
      if (!segmentChecks.has(key)) {
        segmentChecks.add(key);
        check(segment.durationSeconds > 0 && segment.startSeconds >= 0, "Delivered segment has positive animation duration");
        check(segment.startSeconds + segment.durationSeconds <= times[times.length - 1] + 1e-4, "Delivered segment lies inside the real animation buffer");
        check(hasKey(segment.startSeconds) && hasKey(segment.startSeconds + segment.durationSeconds), "The real athlete has boundary keys for the selected segment");
        if (segment.static) assertStaticKeys(segment);
        if (segment.otherSideVariant) {
          const other = manifest[beat.motionId].variants[segment.otherSideVariant];
          check(other && other.otherSideVariant === beat.variantId, "Paired variant references are reciprocal and both delivered");
          check(other.startSeconds !== segment.startSeconds, "Opposite sides use separate authored segments");
        }
      }
    });
  }
}
function stepBeats(id, step) {
  const result = compiled.get(id);
  check(result, `Saved drill ${id} compiled`);
  const phases = result.phases.filter(phase => phase.stepIndex === step);
  check(phases.length > 0, `${id} preserves saved step ${step + 1}`);
  return phases.flatMap(phase => phase.plan.beats.map(beat => ({ phase, beat })));
}
function expects(id, step, motion, names) {
  test(`${id} step ${step + 1} authored movements`, () => {
    const beats = stepBeats(id, step).map(item => item.beat);
    for (const name of names) check(beats.some(beat => beat.motionId === motion && beat.variantId === name),
      `Saved step demonstrates ${motion}.${name}`);
  });
}
function pair(id, step, motion, name) { expects(id, step, motion, [name, `${name}-right`]); }
expects("shoulder-band-prep", 0, "band", ["band-external-right", "band-external-left"]);
expects("shoulder-band-prep", 1, "band", ["band-internal-right", "band-internal-left"]);
expects("shoulder-band-prep", 2, "band-upper", ["band-pull-apart"]);
expects("shoulder-band-prep", 3, "band-upper", ["band-y-raise"]);
expects("shoulder-band-prep", 4, "warmup", ["arm-circles-forward", "arm-circles-backward"]);
expects("band-pull-aparts", 1, "band-upper", ["band-row"]);
expects("band-pull-aparts", 2, "band-upper", ["band-overhead-pulldown"]);
expects("bodyweight-shoulder-activation", 1, "warmup", ["arm-hug-open"]);
expects("bodyweight-shoulder-activation", 2, "warmup", ["goalpost-slides"]);
expects("bodyweight-shoulder-activation", 3, "warmup", ["shoulder-squeeze"]);
// Step two explicitly says "facing sideways" in the saved drill.
for (const [step, name] of ["two-in", "lateral-in-out", "icky", "hopscotch"].entries()) expects("agility-ladder-footwork", step, "ladder", [name]);
expects("ladder-lateral-quicksteps", 1, "ladder", ["lateral-in-out"]);
expects("ladder-lateral-quicksteps", 2, "ladder", ["lateral-two-in-one-out"]);
expects("ladder-to-dig-reaction", 1, "ladder", ["two-in"]);
expects("mini-band-lateral-walks", 3, "mini-band", ["squat"]);
for (const id of ["mini-band-defensive-shuffle", "mini-band-lateral-walks"]) test(`${id} still fitted setup`, () => {
  const beats = stepBeats(id, 0).map(item => item.beat);
  check(beats.length > 0 && beats.every(beat => beat.motionId === "mini-band" && beat.freezeProgress === 0), "Athletes hold the fitted band stance during setup");
});
expects("jump-rope-single-leg", 1, "jump-rope", ["right-foot", "left-foot"]);
expects("jump-rope-single-leg", 2, "jump-rope", ["alternate"]);
expects("jump-rope-coordination", 1, "jump-rope", ["alternate"]);
expects("jump-rope-coordination", 3, "jump-rope", ["right-foot", "left-foot"]);
test("Rope speed intervals preserve five real work/rest rounds", () => {
  const byActor = new Map();
  for (const item of stepBeats("jump-rope-speed-intervals", 1)) {
    const key = `${item.phase.index}:${item.beat.actorId}`;
    if (!byActor.has(key)) byActor.set(key, []);
    byActor.get(key).push(item);
  }
  check(byActor.size > 0, "Interval drill contains an athlete");
  for (const items of byActor.values()) {
    const work = items.filter(item => item.beat.variantId === "two-foot");
    const rest = items.filter(item => item.beat.motionId === "ready" && item.beat.freezeProgress === 0);
    // Five is the saved prescription, not an asset-count baseline.
    check(work.length === 5 && rest.length === 5, "Saved five rounds contain five work and five rest periods");
    for (const item of [...work, ...rest]) check(actualSeconds(item.phase, item.beat) >= 30 - 1e-6, "Each work/rest period lasts the prescribed 30 seconds");
    for (let i = 0; i < 5; i++) check(work[i].beat.endMs <= rest[i].beat.startMs + 1e-6, "Each rest follows its work period");
  }
});
for (const [step, name] of ["bear-crawl", "crab-walk", "frog-hop", "inchworm"].entries()) expects("animal-movement-warmup", step, "warmup", [name]);
expects("dynamic-movement-warmup", 1, "warmup", ["high-knees", "heel-kicks"]);
expects("dynamic-movement-warmup", 2, "warmup", ["walking-lunge", "side-lunge"]);
expects("dynamic-movement-warmup", 3, "warmup", ["carioca"]);
expects("dynamic-mobility-flow", 0, "warmup", ["leg-swing-front", "leg-swing-side"]);
expects("dynamic-mobility-flow", 1, "warmup", ["knee-pull", "heel-pull"]);
pair("dynamic-mobility-flow", 2, "stretch", "lunge-rotation");
expects("foam-roll-mobility-recovery", 0, "foam", ["calves", "calves-right", "quads", "hamstrings"]);
expects("foam-roller-leg-reset", 0, "foam", ["quads"]);
pair("foam-roller-leg-reset", 1, "foam", "calves");
pair("foam-roller-leg-reset", 2, "foam", "side-hip");
expects("foam-roller-upper-back", 1, "foam", ["upper-back"]);
expects("hamstring-and-hip-stretch", 0, "stretch", ["hamstring"]);
for (const [step, name] of [[1, "figure-four"], [2, "hip-flexor"], [3, "supine-twist"]]) pair("hamstring-and-hip-stretch", step, "stretch", name);
expects("yoga-flow-cooldown", 0, "stretch", ["forward-fold", "side-bend"]);
pair("yoga-flow-cooldown", 1, "stretch", "hip-flexor");
expects("yoga-flow-cooldown", 2, "stretch", ["childs-pose", "supine-twist", "supine-twist-right"]);
expects("mat-mobility-flow", 0, "warmup", ["cat-camel"]);
expects("mat-mobility-flow", 3, "warmup", ["inchworm"]);
pair("static-stretch-cooldown", 0, "stretch", "cross-chest");
pair("static-stretch-cooldown", 0, "stretch", "triceps");
pair("static-stretch-cooldown", 2, "stretch", "standing-hamstring");
pair("static-stretch-cooldown", 3, "stretch", "seated-figure-four");
pair("static-stretch-cooldown", 3, "stretch", "seated-twist");
pair("calf-and-ankle-recovery", 0, "stretch", "standing-calf");
pair("calf-and-ankle-recovery", 1, "stretch", "bent-knee-calf");
expects("slide-approach-attack", 2, "attack", ["slide-one-foot"]);
test("Shepherd moves under the balloon with a walking set", () => {
  const result = compiled.get("shepherd-and-sheep");
  check(result, "Saved balloon game compiles");
  const moving = result.phases.flatMap(phase => phase.plan.beats.filter(beat => {
    const route = phase.plan.routes.find(item => item.id === beat.routeId);
    const actor = phase.plan.actors.find(item => item.id === beat.actorId);
    return route && route.type === "move" && actor && actor.team === "a" && beat.freezeProgress == null;
  }));
  check(moving.length > 0, "Balloon game has a moving shepherd");
  check(moving.every(beat => beat.motionId === "set" && beat.variantId === "balloon-walk"), "Every shepherd route selects the delivered walking overhead contact");
});

// A complete diagram is insufficient: the production compiler must schedule
// the actions in the saved step that teaches them. These checks intentionally
// inspect compiled beats rather than only counting authored routes or scenes.
function phasesFor(id, step) {
  stepBeats(id, step); // Also establishes that this saved step exists.
  return compiled.get(id).phases.filter(phase => phase.stepIndex === step);
}
function routedBeats(id, step, type) {
  return stepBeats(id, step).map(item => ({ ...item,
    route: item.phase.plan.routes.find(route => route.id === item.beat.routeId) }))
    .filter(item => item.route && (!type || item.route.type === type));
}
function actualRoutes(id, step, type) {
  const result = routedBeats(id, step, type);
  check(result.length > 0, `${id} step ${step + 1} actually schedules ${type} routes`);
  for (const phase of phasesFor(id, step)) for (const route of phase.plan.routes.filter(route => route.type === type)) {
    const beats = phase.plan.beats.filter(beat => beat.routeId === route.id);
    check(beats.some(beat => beat.motionId !== "admin" && beat.motionId !== "ready"),
      `${route.label || route.id} has an active body movement, not an unused diagram arrow`);
  }
  return result;
}
test("Mirror partners both touch the floor on the cue", () => {
  for (const phase of phasesFor("mirror-defensive-shuffle", 2)) {
    const players = phase.plan.actors.filter(actor => !actor.support);
    check(players.length === 2, "The mirror drill stages its two partners");
    const touches = players.map(actor => phase.plan.beats.find(beat => beat.actorId === actor.id && beat.variantId === "floor-touch"));
    check(touches.every(Boolean), "Both partners have a real floor-touch animation beat");
    near(touches[0].startMs, touches[1].startMs, 1e-6, "The cue triggers both partners together");
  }
});
for (const step of [0, 1, 3]) test(`Mirror step ${step + 1} travels out and returns without overlapping itself`, () => {
  const movements = actualRoutes("mirror-defensive-shuffle", step, "move");
  for (const phase of phasesFor("mirror-defensive-shuffle", step)) for (const actor of phase.plan.actors.filter(actor => !actor.support)) {
    const actions = movements.filter(item => item.phase === phase && item.beat.actorId === actor.id).sort((a, b) => a.beat.startMs - b.beat.startMs);
    check(actions.length >= 2, "Each partner performs the lead movement and return");
    for (let i = 1; i < actions.length; i++) check(actions[i].beat.startMs >= actions[i - 1].beat.endMs - 1e-6,
      "The same partner cannot play outbound and return clips simultaneously");
  }
});
test("Mini-volley stages a real rally on every mini-court", () => {
  const setup = phasesFor("mini-volley-stations-tournament", 0)[0];
  check(setup.plan.presentation.nets.length === 2, "The saved minimum two-court setup has both lowered nets");
  const rally = actualRoutes("mini-volley-stations-tournament", 2, "ball");
  const participants = new Set(rally.map(item => item.beat.actorId));
  check(participants.size === setup.plan.actors.filter(actor => !actor.support).length, "All eight players take a real contact across both complete 2v2 rallies");
  const court1 = rally.filter(item => item.route.label.includes("Court 1"));
  const court2 = rally.filter(item => item.route.label.includes("Court 2"));
  check(court1.length >= 4 && court2.length >= 4, "Each court demonstrates both teammates on each side");
  court1.forEach((item, index) => near(item.beat.startMs, court2[index].beat.startMs, 1e-6, "Corresponding contacts on the two courts happen simultaneously"));
});
test("Mini-volley moves both whole teams between courts", () => {
  const movement = actualRoutes("mini-volley-stations-tournament", 3, "move");
  check(new Set(movement.map(item => item.beat.actorId)).size === 4, "Two winning players and two other players actually change court");
  check(movement.filter(item => item.route.to[0] > item.route.from[0]).length === 2 &&
    movement.filter(item => item.route.to[0] < item.route.from[0]).length === 2, "Two players move up while the other two move down");
});
test("Serving relay retrieves, hands off, and gives every teammate a serving turn", () => {
  const serves = [...routedBeats("serving-relay-race", 0, "ball"), ...routedBeats("serving-relay-race", 2, "ball")]
    .filter(item => item.beat.motionId === "serve");
  const players = phasesFor("serving-relay-race", 0)[0].plan.actors.filter(actor => !actor.support);
  check(players.every(actor => serves.some(item => item.beat.actorId === actor.id)), "Every staged relay teammate actually serves before the round ends");
  const movement = actualRoutes("serving-relay-race", 1, "move");
  for (const team of ["a", "b"]) {
    const actors = new Set(players.filter(actor => actor.team === team).map(actor => actor.id));
    const shag = movement.find(item => actors.has(item.beat.actorId) && /shag/.test(item.route.label));
    const returning = movement.find(item => actors.has(item.beat.actorId) && item.route.authored.carriesBall);
    const transfer = routedBeats("serving-relay-race", 1, "ball").find(item => actors.has(item.beat.actorId) && /hand/.test(item.route.label));
    check(shag && returning && transfer, "Each team has a retrieval route, visible carrying instruction, and actual ball handoff");
    check(shag.route.to[1] < 6 && returning.route.to[1] > 12, "The player retrieves on the receiving court and returns beyond the end line");
    check(shag.beat.endMs <= returning.beat.startMs && returning.beat.endMs <= transfer.beat.startMs, "Retrieve, return, and handoff happen in that order");
    check(transfer.beat.partnerActorId && transfer.beat.partnerActorId !== transfer.beat.actorId, "The handoff reaches the next teammate");
  }
});
test("Serving Ladder shows two teams actually taking turns", () => {
  const phase = phasesFor("serving-ladder-game", 0)[0];
  const teams = new Set(phase.plan.actors.filter(actor => !actor.support).map(actor => actor.team));
  check(teams.has("a") && teams.has("b"), "The two saved teams are visually distinct");
  const serves = routedBeats("serving-ladder-game", 0, "ball").filter(item => item.beat.motionId === "serve");
  const servingTeams = new Set(serves.map(item => item.phase.plan.actors.find(actor => actor.id === item.beat.actorId).team));
  check(servingTeams.has("a") && servingTeams.has("b"), "A teammate from each team takes a real serving turn");
  for (let i = 1; i < serves.length; i++) check(serves[i].beat.startMs >= serves[i - 1].beat.endMs, "Serving Ladder takes turns instead of serving simultaneously");
});
test("Serving Ladder demonstrates made, missed, and personal-streak examples", () => {
  const scoring = actualRoutes("serving-ladder-game", 1, "ball");
  function inside(item) {
    const bounds = item.phase.plan.presentation.bounds, point = item.route.to;
    return point[0] >= bounds.minX && point[0] <= bounds.maxX && point[1] >= bounds.minY && point[1] <= bounds.maxY;
  }
  check(scoring.some(inside) && scoring.some(item => !inside(item)), "One serve actually lands in and one actually misses the court");
  const streak = actualRoutes("serving-ladder-game", 3, "ball");
  check(streak.length >= 2 && streak[0].beat.actorId === streak[1].beat.actorId, "The personal-streak example belongs to the same player");
  check(inside(streak[0]) && !inside(streak[1]) && streak[1].beat.startMs >= streak[0].beat.endMs,
    "A made serve is followed by a miss before the streak resets");
});
test("Serving relay runs around the net on retrieval and return", () => {
  for (const step of [1, 2]) for (const item of routedBeats("serving-relay-race", step, "move")) {
    const presentation = item.phase.plan.presentation;
    const net = presentation.net, bounds = presentation.bounds;
    const points = [item.route.from, ...(item.route.via || []), item.route.to];
    for (let i = 1; i < points.length; i++) {
      const from = points[i - 1], to = points[i];
      if ((from[1] - net) * (to[1] - net) >= 0) continue;
      const x = from[0] + (to[0] - from[0]) * (net - from[1]) / (to[1] - from[1]);
      check(x <= bounds.minX - .4 || x >= bounds.maxX + .4, "A retrieval runner clears the net posts instead of travelling through the net");
    }
  }
});
test("Dead Fish serves together, stages the downed player, and actually rescues them", () => {
  const initial = routedBeats("dead-fish-serving", 0, "ball");
  check(new Set(initial.map(item => item.beat.actorId)).size === phasesFor("dead-fish-serving", 0)[0].plan.actors.length, "All players serve together");
  check(initial.every(item => item.beat.startMs === initial[0].beat.startMs), "Every initial serve starts together");
  actualRoutes("dead-fish-serving", 1, "move");
  const rescue = phasesFor("dead-fish-serving", 2)[0];
  const fish = rescue.plan.actors.find(actor => actor.authored && actor.authored.posture === "supine");
  check(fish && manifest.ready.postures.supine, "The downed player uses the delivered lying posture");
  const flight = rescue.plan.beats.find(beat => beat.motionId === "serve" && beat.routeId);
  const returnBeat = rescue.plan.beats.find(beat => beat.actorId === fish.id && beat.routeId && beat.motionId !== "serve");
  check(flight && returnBeat && returnBeat.startMs >= flight.endMs, "The rescue serve is followed by that player's actual return");
});
test("Four Square performs the error rotation and brings in the waiting player", () => {
  const rotation = actualRoutes("four-square-volleyball", 2, "move");
  check(rotation.some(item => /error/.test(item.route.label)), "The player who errors actually moves to the entry square");
  const entry = actualRoutes("four-square-volleyball", 3, "move");
  check(entry.some(item => /wait|queue|enter|entry|next/.test(item.route.label + " " + item.phase.plan.actors.find(actor => actor.id === item.beat.actorId).role)),
    "A waiting player actually joins the court");
});
for (const step of [1, 2]) test(`Amoeba step ${step + 1} executes all teammate touches and over-net contacts`, () => {
  const rally = actualRoutes("amoeba-team-game", step, "ball");
  for (const team of ["a", "b"]) {
    const touches = rally.filter(item => item.phase.plan.actors.find(actor => actor.id === item.beat.actorId).team === team);
    check(new Set(touches.map(item => item.beat.actorId)).size >= 4, "Every player in the staged four-player team touches before the ball goes over");
    const crossing = touches.find(item => (item.route.from[1] - 6) * (item.route.to[1] - 6) < 0);
    check(crossing && crossing.beat.motionId !== "admin", "The over-net touch performs a real ball contact");
  }
  if (step === 2) check(rally.some(item => item.beat.motionId === "feed") && rally.some(item => /^(pass|set)$/.test(item.beat.motionId)),
    "Catch-and-pass and later bump/set phases both have actual ball contacts");
});
if (failures.size) {
  console.error(`CoachCam variant contract failed (${failures.size} failures, ${checks} checks passed):\n${[...failures].map(message => `- ${message}`).join("\n")}`);
  process.exitCode = 1;
} else console.log(`CoachCam variant contract passed: ${checks} checks across ${compiled.size} saved drills; ${segmentChecks.size} selected segments verified against delivered animation keys.`);
