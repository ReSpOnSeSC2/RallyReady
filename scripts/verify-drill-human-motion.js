// verify-drill-human-motion.js — integrity checks for the human drill demos.
// Run with: node scripts/verify-drill-human-motion.js
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const ASSET_DIR = path.join(ROOT, "images", "drill-motion");
const EXPECTED_DRILLS = 241;
const EXPECTED_STEPS = 979;
const EXPECTED_REGISTERED_ACTIONS = 16;
const EXPECTED_SELECTABLE_ACTIONS = 15;
const EXPECTED_ASSETS = 15;
const MAX_ASSET_BYTES = 220 * 1024;
const MAX_PACK_BYTES = Math.floor(2.2 * 1024 * 1024);

const failures = [];
let pass = 0;

function ok(value, message) {
  if (value) pass++;
  else failures.push(message);
}

function loadRuntime() {
  const sandbox = { console };
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
    "js/drill-human-motion.js"
  ];

  files.forEach((file) => {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) throw new Error("Required runtime file is missing: " + file);
    vm.runInContext(fs.readFileSync(full, "utf8"), sandbox, { filename: file });
  });
  return sandbox.RR;
}

// Read dimensions directly from VP8, VP8L, or VP8X data so this verifier has
// no package or browser dependency. A malformed/truncated image returns null.
function webpDimensions(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 20) return null;
  if (buffer.toString("ascii", 0, 4) !== "RIFF" ||
      buffer.toString("ascii", 8, 12) !== "WEBP") return null;

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (size > buffer.length - data) return null;

    if (type === "VP8X" && size >= 10) {
      return {
        width: 1 + buffer.readUIntLE(data + 4, 3),
        height: 1 + buffer.readUIntLE(data + 7, 3)
      };
    }
    if (type === "VP8 " && size >= 10 &&
        buffer[data + 3] === 0x9d && buffer[data + 4] === 0x01 &&
        buffer[data + 5] === 0x2a) {
      return {
        width: buffer.readUInt16LE(data + 6) & 0x3fff,
        height: buffer.readUInt16LE(data + 8) & 0x3fff
      };
    }
    if (type === "VP8L" && size >= 5 && buffer[data] === 0x2f) {
      const bits = buffer.readUInt32LE(data + 1);
      return {
        width: 1 + (bits & 0x3fff),
        height: 1 + ((bits >>> 14) & 0x3fff)
      };
    }
    offset = data + size + (size % 2);
  }
  return null;
}

function normalizedAssetPath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\.\//, "");
}

function isInsideAssetDirectory(fullPath) {
  const relative = path.relative(ASSET_DIR, fullPath);
  return relative !== "" && !relative.startsWith(".." + path.sep) &&
    relative !== ".." && !path.isAbsolute(relative);
}

let RR;
try {
  RR = loadRuntime();
} catch (error) {
  console.error("DRILL HUMAN MOTION: unable to load verifier runtime");
  console.error("  ✗ " + error.message);
  process.exit(1);
}

const motion = RR && RR.drillHumanMotion;
ok(!!motion, "RR.drillHumanMotion is registered");
ok(!!motion && motion.actions && typeof motion.actions === "object" &&
  !Array.isArray(motion.actions), "RR.drillHumanMotion.actions is an object registry");
ok(!!motion && typeof motion.programFor === "function", "programFor(drill, specs) is exposed");
ok(!!motion && typeof motion.actionsFor === "function", "actionsFor(drill, text) is exposed");
ok(!!motion && typeof motion.actionFor === "function", "actionFor(drill, text) is exposed");
ok(!!motion && typeof motion.classificationFor === "function",
  "classificationFor(drill, text) is exposed");
ok(!!motion && typeof motion.assetFor === "function", "assetFor(action) is exposed");
ok(!!motion && typeof motion.frameFor === "function", "frameFor(action, text) is exposed");
ok(!!motion && typeof motion.options === "function", "options() is exposed");

if (!motion || !motion.actions || typeof motion.programFor !== "function" ||
    typeof motion.actionsFor !== "function" || typeof motion.actionFor !== "function" ||
    typeof motion.classificationFor !== "function" || typeof motion.assetFor !== "function" ||
    typeof motion.frameFor !== "function" || typeof motion.options !== "function") {
  failures.push("human-motion API is incomplete; remaining checks cannot run");
} else {
  const actionIds = Object.keys(motion.actions);
  const registeredAssets = new Set();
  const checkedAssetFiles = new Set();
  let totalPackBytes = 0;

  ok(actionIds.length === EXPECTED_REGISTERED_ACTIONS,
    `expected ${EXPECTED_REGISTERED_ACTIONS} registered actions, found ${actionIds.length}`);

  const internalActionIds = actionIds.filter((id) => motion.actions[id].internal);
  const editorOptions = Array.from(motion.options());
  const editorOptionIds = editorOptions.map((option) => option.value);
  const selectableActionIds = actionIds.filter((id) => !motion.actions[id].internal);
  ok(JSON.stringify(internalActionIds) === JSON.stringify(["organize"]),
    "organize is the only internal action used for non-technique instructions");
  ok(motion.actions.organize && motion.actions.organize.kind === "administrative" &&
    motion.actions.organize.mode === "catalog",
  "organize is explicitly classified as a catalog-style administrative posture");
  ok(motion.actions.organize && motion.actions.footwork &&
    motion.actions.organize.asset === motion.actions.footwork.asset,
  "organize deliberately reuses the reviewed athletic-footwork posture atlas");
  ok(editorOptions.length === EXPECTED_SELECTABLE_ACTIONS,
    `custom editor exposes exactly ${EXPECTED_SELECTABLE_ACTIONS} motion options`);
  ok(new Set(editorOptionIds).size === EXPECTED_SELECTABLE_ACTIONS,
    "custom editor motion options have unique action ids");
  ok(!editorOptionIds.includes("organize"),
    "custom editor does not expose the internal organize posture");
  ok(editorOptions.every((option) => option && typeof option.label === "string" &&
    !!option.label.trim() && Object.prototype.hasOwnProperty.call(motion.actions, option.value)),
  "every custom editor option has a label and a registered action");
  ok(JSON.stringify(editorOptionIds.slice().sort()) ===
    JSON.stringify(selectableActionIds.slice().sort()),
  "custom editor options exactly match all selectable registered actions");

  actionIds.forEach((id) => {
    const action = motion.actions[id];
    const resolved = motion.assetFor(id);
    ok(!!action && typeof action === "object", `${id}: action definition is an object`);
    if (!action || typeof action !== "object") return;

    ok(action.id === id, `${id}: registry key and action id match`);
    ok(typeof action.label === "string" && !!action.label.trim(), `${id}: action has a label`);
    ok(typeof action.mode === "string" && !!action.mode.trim(), `${id}: action has a rendering mode`);
    ok(Number.isInteger(action.width) && action.width > 0, `${id}: declared atlas width is valid`);
    ok(Number.isInteger(action.height) && action.height > 0, `${id}: declared atlas height is valid`);
    ok(Array.isArray(action.phases) && action.phases.length === 4,
      `${id}: action has exactly four phases`);
    (action.phases || []).forEach((phase, index) => {
      ok(!!phase && typeof phase.label === "string" && !!phase.label.trim(),
        `${id}: phase ${index + 1} has a label`);
      ok(!!phase && typeof phase.cue === "string" && !!phase.cue.trim(),
        `${id}: phase ${index + 1} has a coaching cue`);
    });

    ok(!!resolved && resolved.id === action.id && resolved.asset === action.asset &&
      resolved.width === action.width && resolved.height === action.height,
    `${id}: assetFor returns the full registered action`);

    const asset = normalizedAssetPath(action.asset);
    const expectedPrefix = "images/drill-motion/";
    ok(asset.startsWith(expectedPrefix) && /^images\/drill-motion\/[^/]+\.webp$/i.test(asset),
      `${id}: atlas is a WebP directly under images/drill-motion`);
    if (!asset.startsWith(expectedPrefix) || !/\.webp$/i.test(asset)) return;

    registeredAssets.add(asset);
    const full = path.resolve(ROOT, asset);
    ok(isInsideAssetDirectory(full), `${id}: atlas path stays inside images/drill-motion`);
    ok(fs.existsSync(full), `${id}: atlas exists (${asset})`);
    if (!isInsideAssetDirectory(full) || !fs.existsSync(full) || checkedAssetFiles.has(full)) return;
    checkedAssetFiles.add(full);

    const bytes = fs.statSync(full).size;
    totalPackBytes += bytes;
    ok(bytes > 0, `${id}: atlas is nonempty`);
    ok(bytes < MAX_ASSET_BYTES,
      `${id}: atlas is under 220 KB (${Math.ceil(bytes / 1024)} KB)`);

    const dimensions = webpDimensions(fs.readFileSync(full));
    ok(!!dimensions && dimensions.width > 0 && dimensions.height > 0,
      `${id}: atlas has a readable WebP canvas`);
    if (dimensions) {
      ok(dimensions.width === action.width && dimensions.height === action.height,
        `${id}: declared ${action.width}×${action.height} matches WebP ` +
        `${dimensions.width}×${dimensions.height}`);
    }
  });

  // Scene-composition grids share this directory but are verified by the
  // renderer suite. This registry owns only the action atlases, whose stable
  // `-atlas.webp` suffix lets us keep an exact on-disk parity check here.
  const diskAssets = fs.existsSync(ASSET_DIR)
    ? fs.readdirSync(ASSET_DIR)
      .filter((file) => /-atlas\.webp$/i.test(file))
      .map((file) => "images/drill-motion/" + file)
      .sort()
    : [];
  const registeredList = Array.from(registeredAssets).sort();
  ok(registeredAssets.size === EXPECTED_ASSETS,
    `expected ${EXPECTED_ASSETS} unique registered atlases, found ${registeredAssets.size}`);
  ok(diskAssets.length === EXPECTED_ASSETS,
    `expected ${EXPECTED_ASSETS} action atlases on disk, found ${diskAssets.length}`);
  ok(JSON.stringify(registeredList) === JSON.stringify(diskAssets),
    "registered atlas set exactly matches images/drill-motion/*-atlas.webp");
  ok(totalPackBytes < MAX_PACK_BYTES,
    `atlas pack is under 2.2 MB (${Math.ceil(totalPackBytes / 1024)} KB)`);

  const drills = Array.isArray(RR.drills) ? RR.drills : [];
  const savedStepCount = drills.reduce((sum, drill) =>
    sum + (Array.isArray(drill.steps) ? drill.steps.length : 0), 0);
  ok(drills.length === EXPECTED_DRILLS,
    `expected ${EXPECTED_DRILLS} bundled drills, found ${drills.length}`);
  ok(savedStepCount === EXPECTED_STEPS,
    `expected ${EXPECTED_STEPS} saved steps, found ${savedStepCount}`);

  let programInstructionCount = 0;
  let supplementalSceneCount = 0;
  drills.forEach((drill) => {
    const specs = RR.format && typeof RR.format.diagrams === "function"
      ? RR.format.diagrams(drill) : [];
    const program = motion.programFor(drill, specs);
    const steps = Array.isArray(drill.steps) ? drill.steps : [];

    ok(Array.isArray(program) && program.length > 0,
      `${drill.id}: bundled drill has a real-step program`);
    if (!Array.isArray(program)) return;
    const savedEntries = program.filter((entry) => entry && entry.sourceStep >= 0);
    ok(savedEntries.length === steps.length && savedEntries.every((entry, index) =>
      entry.sourceStep === index),
      `${drill.id}: program preserves exactly one ordered entry per saved step`);
    programInstructionCount += savedEntries.length;

    program.forEach((entry, index) => {
      const isSavedStep = !!entry && entry.sourceStep >= 0;
      const expected = isSavedStep ? steps[entry.sourceStep] : entry && entry.instruction;
      ok(!!entry && entry.index === index,
        `${drill.id}: program entry ${index + 1} preserves its walkthrough index`);
      if (isSavedStep) {
        ok(entry.instruction === expected,
          `${drill.id}: saved step ${entry.sourceStep + 1} appears exactly in order`);
      } else {
        supplementalSceneCount++;
        ok(entry.supplementalScene === true && entry.scene &&
          (entry.instruction === entry.scene.caption || entry.instruction === drill.setup),
          `${drill.id}: supplemental scene ${entry.sceneIndex + 1} uses only authored caption/setup copy`);
      }

      const primary = motion.actionFor(drill, expected);
      ok(typeof primary === "string" && Object.prototype.hasOwnProperty.call(motion.actions, primary),
        `${drill.id}: walkthrough ${index + 1} resolves to a registered primary action`);
      ok(!!entry && entry.action === primary,
        `${drill.id}: walkthrough ${index + 1} stores its resolved primary action`);
      ok(!!entry && Array.isArray(entry.actions) && entry.actions.length > 0 &&
        entry.actions[0] === entry.action,
      `${drill.id}: walkthrough ${index + 1} has an ordered action list led by its primary action`);
      (entry && Array.isArray(entry.actions) ? entry.actions : []).forEach((actionId) => {
        ok(Object.prototype.hasOwnProperty.call(motion.actions, actionId),
          `${drill.id}: walkthrough ${index + 1} references registered action ${actionId}`);
        ok(!!motion.assetFor(actionId),
          `${drill.id}: walkthrough ${index + 1} action ${actionId} resolves to an atlas`);
      });
      if (specs.length) {
        ok(Number.isInteger(entry.sceneIndex) && entry.sceneIndex >= 0 &&
          entry.sceneIndex < specs.length,
        `${drill.id}: walkthrough ${index + 1} has an auditable scene index`);
        ok(entry.scene === specs[entry.sceneIndex],
          `${drill.id}: walkthrough ${index + 1} scene matches its recorded index`);
      } else {
        ok(entry.sceneIndex === -1 && entry.scene == null,
          `${drill.id}: walkthrough ${index + 1} records that no court scene exists`);
      }
    });
    if (specs.length) {
      ok(specs.every((spec, sceneIndex) => program.some((entry) =>
        entry.sceneIndex === sceneIndex && entry.scene === spec)),
        `${drill.id}: every authored court scene is reachable in the walkthrough`);
    }
  });
  ok(programInstructionCount === EXPECTED_STEPS,
    `all ${EXPECTED_STEPS} saved steps appear exactly once as program instructions`);
  ok(supplementalSceneCount === 8,
    `expected 8 authored scene-coverage phases, found ${supplementalSceneCount}`);

  function assertStepActions(drillId, stepIndex, expected) {
    const drill = drills.find((item) => item.id === drillId);
    ok(!!drill, `${drillId}: representative resolver drill exists`);
    if (!drill) return;
    const instruction = drill.steps[stepIndex];
    ok(typeof instruction === "string" && !!instruction,
      `${drillId}: representative step ${stepIndex + 1} exists`);
    if (!instruction) return;
    const resolved = Array.from(motion.actionsFor(drill, instruction));
    ok(JSON.stringify(resolved) === JSON.stringify(expected),
      `${drillId}: step ${stepIndex + 1} resolves ${JSON.stringify(expected)} ` +
      `(found ${JSON.stringify(resolved)})`);
    ok(motion.actionFor(drill, instruction) === expected[0],
      `${drillId}: step ${stepIndex + 1} primary is its first exact learner action`);
    const specs = RR.format && typeof RR.format.diagrams === "function"
      ? RR.format.diagrams(drill) : [];
    const program = motion.programFor(drill, specs);
    const savedEntry = program.find((entry) => entry.sourceStep === stepIndex);
    ok(!!savedEntry &&
      JSON.stringify(Array.from(savedEntry.actions)) === JSON.stringify(expected) &&
      savedEntry.action === expected[0],
    `${drillId}: stored step ${stepIndex + 1} keeps the ordered resolver result`);
  }

  function assertSyntheticActions(label, drill, instruction, expected) {
    const resolved = Array.from(motion.actionsFor(drill, instruction));
    ok(JSON.stringify(resolved) === JSON.stringify(expected),
      `${label}: resolves ${JSON.stringify(expected)} (found ${JSON.stringify(resolved)})`);
    ok(motion.actionFor(drill, instruction) === expected[0],
      `${label}: primary is ${expected[0]}`);
  }

  // Pepper is the compact regression case for step-local verbs, action order,
  // and a final instruction that truthfully refers to the complete rally loop.
  [
    ["attack"],
    ["defense"],
    ["set"],
    ["attack", "defense", "set"],
    ["pass", "set", "attack", "defense"]
  ].forEach((expected, index) => assertStepActions("pepper", index, expected));

  // Representative composed drills: never collapse pass-set-hit, transitions,
  // or a set/dump decision back to the broad drill-skill fallback.
  assertStepActions("three-contact-partner-pepper", 1, ["set", "attack"]);
  assertStepActions("three-contact-partner-pepper", 2, ["pass", "set", "attack"]);
  assertStepActions("three-contact-partner-pepper", 3, ["pass", "set", "attack"]);
  assertStepActions("wall-set-and-pass-combo", 2, ["set", "pass"]);
  assertStepActions("pass-set-hit-triangle", 1, ["pass", "set", "attack"]);
  assertStepActions("transition-hitting-off-defense", 0, ["defense"]);
  assertStepActions("transition-hitting-off-defense", 1, ["footwork"]);
  assertStepActions("transition-hitting-off-defense", 2, ["set", "attack"]);
  assertStepActions("attack-and-transition-to-defense", 2, ["attack", "defense"]);
  assertStepActions("block-and-transition", 2, ["attack", "defense"]);
  assertStepActions("transition-dig-to-attack", 1, ["set", "footwork", "attack"]);
  assertStepActions("transition-dig-to-attack", 2, ["defense", "attack"]);
  assertStepActions("transition-dig-to-attack", 3, ["defense", "set", "attack"]);
  assertStepActions("digging-coach-down-balls", 0, ["defense"]);
  assertStepActions("digging-coach-down-balls", 1, ["organize"]);
  assertStepActions("digging-coach-down-balls", 2, ["defense"]);
  assertStepActions("digging-coach-down-balls", 3, ["organize"]);
  assertStepActions("libero-dig-and-run-through", 1, ["defense"]);
  assertStepActions("libero-dig-and-run-through", 2, ["defense"]);
  assertStepActions("free-ball-transition", 2, ["pass", "set", "attack"]);
  assertStepActions("jump-set-and-dump", 0, ["set", "jump"]);
  assertStepActions("jump-set-and-dump", 1, ["attack"]);
  assertStepActions("jump-set-and-dump", 3, ["set", "attack"]);
  assertStepActions("first-ball-kill-game", 0, ["pass", "set", "attack"]);

  // Ambiguous administrative and feed phrases must not masquerade as body
  // mechanics. Exact equipment/ID choices still lead every resolved list.
  assertStepActions("serving-to-zones", 2, ["organize"]);
  assertStepActions("close-range-reaction-digging", 3, ["organize"]);
  assertStepActions("pass-to-the-hoop-target", 0, ["organize"]);
  assertStepActions("perimeter-defense-system", 0, ["organize"]);
  assertStepActions("deep-corner-roll-shots", 1, ["attack"]);
  assertStepActions("rolls-and-sprawls", 1, ["defense"]);
  assertStepActions("overhead-emergency-pass", 0, ["organize"]);
  assertStepActions("mini-band-defensive-shuffle", 1, ["band", "footwork"]);
  assertStepActions("band-arm-speed", 1, ["band"]);
  assertStepActions("med-ball-chest-pass-wall", 1, ["medicine"]);
  assertStepActions("foam-roller-upper-back", 1, ["recovery"]);
  assertStepActions("box-step-ups-approach", 1, ["footwork"]);
  assertStepActions("box-block-reach", 0, ["block"]);
  assertStepActions("box-hitting-reps", 0, ["attack"]);
  assertStepActions("reaction-sprint-starts", 1, ["run"]);
  assertStepActions("cooldown-jog-and-breathing", 0, ["run"]);
  assertStepActions("cooldown-jog-and-breathing", 2, ["cooldown"]);
  assertStepActions("guided-breathing-and-reflection", 0, ["cooldown"]);
  assertStepActions("guided-breathing-and-reflection", 3, ["cooldown"]);
  assertStepActions("yoga-flow-cooldown", 2, ["cooldown"]);
  assertStepActions("static-stretch-cooldown", 0, ["recovery"]);
  assertStepActions("underhand-serve-progression", 0, ["underhand"]);
  assertStepActions("underhand-serve-progression", 2, ["underhand"]);
  assertStepActions("serve-and-sprint", 1, ["run"]);

  // Regression matrix for overloaded words and actor identity. A ball coming
  // down is not an athlete jump, placing equipment is not an overhead set, and
  // the type of set being attacked is the hitter's object rather than a second
  // athlete action.
  assertSyntheticActions("ball landing", { skill: "Serving" },
    "The ball lands deep in zone 5.", ["organize"]);
  assertSyntheticActions("athlete landing", { skill: "Serving" },
    "The server lands inside the court, balanced and ready.", ["jump"]);
  assertSyntheticActions("equipment setup", {
    skill: "Setting", equipment: ["Cones", "Hoop"]
  }, "Set the cones and hoop at the target.", ["organize"]);
  assertSyntheticActions("volleyball set", { skill: "Setting" },
    "Set a high outside ball to the left antenna.", ["set"]);
  assertSyntheticActions("back-set attack", { skill: "Hitting" },
    "The hitter hits a back-set ball into the corner.", ["attack"]);
  assertSyntheticActions("performed set followed by back-set attack", { skill: "Hitting" },
    "The setter sets a back ball, then the hitter hits a back-set ball.",
    ["set", "attack"]);

  // A support person's feed is court operation, not a learner technique. If a
  // learner response is written in the same step, only that response animates.
  assertSyntheticActions("coach-only feed", { skill: "Passing" },
    "The coach hits a ball into the court.", ["organize"]);
  assertSyntheticActions("coach feed with learner response", { skill: "Defense" },
    "The coach hits a ball, then the player digs it to target.", ["defense"]);
  assertSyntheticActions("controlled dig is not running", { skill: "Defense" },
    "The defender stops, angles the platform, and digs the down-ball high to the middle.",
    ["defense"]);
  assertSyntheticActions("run-through is one defensive save", { skill: "Defense" },
    "The defender runs through the short ball and plays it up while moving forward.",
    ["defense"]);
  assertSyntheticActions("pancake is floor defense", { skill: "Defense" },
    "The defender pancakes the ball, sprawls safely, and recovers.", ["defense"]);
  assertSyntheticActions("real sprint stays running", { skill: "Warmup" },
    "The athlete sprints five yards through the finish cone.", ["run"]);

  const administrative = motion.classificationFor({ skill: "Team Play" },
    "Track the score, then rotate the teams.");
  ok(administrative && administrative.kind === "administrative" &&
    administrative.reason === "Scoring or outcome" &&
    administrative.action === "organize" &&
    JSON.stringify(Array.from(administrative.actions || [])) === JSON.stringify(["organize"]),
  "scoring and rotation prose is explicitly classified as administrative organize");
  const technique = motion.classificationFor({ skill: "Serving" },
    "Serve the ball deep to zone 5.");
  ok(technique && technique.kind === "technique" && technique.action === "serve" &&
    technique.reason === "Explicit athlete mechanic",
  "an explicit learner mechanic remains classified as technique");

  function sceneIndices(program) {
    return Array.from(program, (entry) => entry.sceneIndex);
  }

  function savedSceneIndices(program) {
    return Array.from(program).filter((entry) => entry.sourceStep >= 0)
      .map((entry) => entry.sceneIndex);
  }

  // Equal step/scene counts are an authored one-to-one contract, even when
  // similar words appear in another panel.
  const equalBinding = motion.programFor({
    id: "verify-equal-scene-binding", skill: "Setting", cues: [],
    steps: ["Set the ball to the right antenna.", "Pass the ball to the setter target."]
  }, [
    { title: "Pass to target", caption: "Pass the ball to the setter target." },
    { title: "Set right", caption: "Set the ball to the right antenna." }
  ]);
  ok(JSON.stringify(sceneIndices(equalBinding)) === JSON.stringify([0, 1]),
    "equal step/scene counts preserve exact authored indices");

  // With unequal counts, explicit mechanics beat position and shared specific
  // words disambiguate scenes that describe the same action.
  const semanticBinding = motion.programFor({
    id: "verify-semantic-scene-binding", skill: "Setting", cues: [],
    steps: [
      "Set a high outside ball to the left antenna.",
      "Pass the serve with a forearm platform.",
      "Set a low quick ball for the middle."
    ]
  }, [
    { title: "Low quick middle", caption: "Set a low quick ball in front of the middle." },
    { title: "Forearm pass", caption: "Pass the serve with a steady platform." },
    { title: "Reset", caption: "Collect equipment before the next repetition." },
    { title: "High outside", caption: "Set a high outside ball to the left antenna." }
  ]);
  ok(JSON.stringify(savedSceneIndices(semanticBinding)) === JSON.stringify([3, 1, 0]) &&
    [0, 1, 2, 3].every((sceneIndex) => sceneIndices(semanticBinding).includes(sceneIndex)),
    "action and meaningful-word overlap bind unequal scenes by their real content");

  // When neither title nor caption supplies a factual match, normalized
  // position is the deterministic tie-breaker (including both endpoints).
  const tieBinding = motion.programFor({
    id: "verify-proportional-scene-tie", skill: "Team Play", cues: [],
    steps: ["Wait for one.", "Wait for two.", "Wait for three.", "Wait for four."]
  }, [{}, {}, {}]);
  ok(JSON.stringify(sceneIndices(tieBinding)) === JSON.stringify([0, 1, 1, 2]),
    "proportional position is used only when semantic scene scores tie");

  // Representative authored programs cover a repeated-action progression and
  // a movement/contact progression with fewer scenes than written steps.
  function assertSceneBinding(drillId, expected) {
    const drill = drills.find((item) => item.id === drillId);
    const specs = RR.format.diagrams(drill);
    const program = motion.programFor(drill, specs);
    ok(JSON.stringify(savedSceneIndices(program)) === JSON.stringify(expected),
      `${drillId}: saved steps bind to reviewed court scenes ${JSON.stringify(expected)}`);
  }
  assertSceneBinding("pepper", [0, 0, 1, 1, 1]);
  assertSceneBinding("tempo-setting", [0, 1, 2, 2]);
  assertSceneBinding("setter-footwork-to-target", [1, 1, 2, 2]);

  // Free-form custom text is not enough evidence to invent body mechanics.
  // A coach must explicitly select one of the registered motion types.
  const customSteps = [
    "Follow the first saved instruction exactly.",
    "Follow the second saved instruction exactly."
  ];
  const customBase = {
    id: "custom-human-motion-verifier", custom: true,
    name: "Verifier custom drill", setup: "Use only the saved custom setup.",
    steps: customSteps.slice(), equipment: [], minPlayers: 1, isGame: false
  };
  const untypedProgram = motion.programFor(customBase, []);
  ok(Array.isArray(untypedProgram) && untypedProgram.length === 0,
    "custom drill without motionType gets no inferred mechanics");
  ok(motion.actionFor(customBase, customSteps[0]) == null,
    "actionFor does not infer a custom drill action from free text");

  const validMotionType = editorOptionIds[0];
  const typedCustom = Object.assign({}, customBase, { motionType: validMotionType });
  const typedProgram = motion.programFor(typedCustom, []);
  ok(Array.isArray(typedProgram) && typedProgram.length === customSteps.length,
    "custom drill with a valid motionType gets a real saved-step program");
  (Array.isArray(typedProgram) ? typedProgram : []).forEach((entry, index) => {
    ok(entry.instruction === customSteps[index],
      `typed custom drill preserves saved instruction ${index + 1}`);
    ok(entry.action === validMotionType && Array.isArray(entry.actions) &&
      entry.actions.length === 1 && entry.actions[0] === validMotionType,
    `typed custom drill uses only its explicit motionType for step ${index + 1}`);
  });
  ok(motion.actionFor(typedCustom, customSteps[0]) === validMotionType,
    "actionFor honors a valid explicit custom motionType");

  const internalCustom = Object.assign({}, customBase, { motionType: "organize" });
  ok(motion.programFor(internalCustom, []).length === 0 &&
    motion.actionFor(internalCustom, customSteps[0]) == null,
  "custom drills cannot select the internal organize posture as a motion type");
}

console.log("──────────────────────────────────────────");
if (failures.length) {
  console.log(`DRILL HUMAN MOTION: ${pass} passed, ${failures.length} FAILED`);
  failures.forEach((failure) => console.log("  ✗ " + failure));
  process.exit(1);
}

console.log(`DRILL HUMAN MOTION: ALL ${pass} CHECKS PASSED ` +
  `(${EXPECTED_DRILLS} drills; ${EXPECTED_STEPS} saved steps; ` +
  `${EXPECTED_REGISTERED_ACTIONS} actions; ${EXPECTED_ASSETS} human-motion atlases; ` +
  `${EXPECTED_SELECTABLE_ACTIONS} editor options)`);
