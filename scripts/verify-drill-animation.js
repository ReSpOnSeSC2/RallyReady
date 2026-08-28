// Verification harness for the drill-detail animation pipeline.
// Run with: node scripts/verify-drill-animation.js
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
  "js/drill-human-motion.js",
  "js/drill-choreography.js",
  "js/drill-animation.js"
];

files.forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), sandbox, { filename: file });
});

const RR = sandbox.RR;
let pass = 0;
const failures = [];
function ok(value, message) {
  if (value) pass++;
  else failures.push(message);
}

function renderedScene(id, index) {
  const drill = RR.drills.find((item) => item.id === id);
  const scene = RR.drillAnimation.scenesFor(drill)[index || 0];
  return RR.drillAnimation.renderSvg(scene, `flight-${id}-${index || 0}`);
}

function flightCount(markup) {
  return (markup.match(/class="dam-flight /g) || []).length;
}

function authoredActorId(plan, planActorId) {
  const actor = plan.actors.find((item) => item.id === planActorId);
  return actor && actor.authored && (actor.authored.id || actor.authored.actor || actor.authored.playerId) || null;
}

function animatedActorCount(beats) {
  return new Set((beats || []).filter((beat) => beat && beat.actorId && beat.motion &&
    beat.motion.animate !== false).map((beat) => beat.actorId)).size;
}

function generatedPlan(drill, scene, instruction, sceneIndex, stepIndex) {
  return RR.drillChoreography.planFor(drill, scene, instruction, {
    sceneIndex,
    stepIndex
  });
}

function fullScenePlan(id, sceneIndex) {
  const drill = RR.drills.find((item) => item.id === id);
  const scene = RR.drillAnimation.scenesFor(drill)[sceneIndex];
  return RR.drillChoreography.planFor(drill, scene,
    scene.caption || scene.title || drill.name, {
      sceneIndex,
      stepIndex: 0,
      showFullScene: true
    });
}

ok(RR.drills.length === 241, `expected 241 bundled drills, found ${RR.drills.length}`);

const authoredOffenseSetChecks = [
  ["hitting-off-a-live-set", 1, "approach-setter", "approach-hitter"],
  ["approach-timing-off-the-pass", 1, "approach-setter", "approach-hitter"],
  ["hitting-from-all-positions", 0, "approach-setter", "approach-hitter"],
  ["hitting-from-all-positions", 1, "approach-setter", "approach-hitter"],
  ["hitting-from-all-positions", 2, "approach-setter", "approach-hitter"],
  ["attack-and-transition-to-defense", 0, "approach-setter", "approach-hitter"],
  ["hitting-lines", 0, "approach-setter", "approach-hitter"],
  ["right-side-opposite-attack", 0, "approach-setter", "approach-hitter"],
  ["hitting-line-and-cross-targets", 0, "approach-setter", "approach-hitter"],
  ["outside-hitter-high-ball", 0, "approach-setter", "approach-hitter"],
  ["middle-quick-attack", 0, "middle-quick-setter", "middle-quick-hitter"],
  ["back-row-attack-pipe", 0, "pipe-setter", "pipe-hitter"]
];
const brokenAuthoredOffenseSets = authoredOffenseSetChecks.map((entry) => {
  const [id, sceneIndex, setterId, hitterId] = entry;
  const plan = fullScenePlan(id, sceneIndex);
  const contact = plan.contacts.find((item) => item.motionId === "set");
  const source = contact && authoredActorId(plan, contact.sourceActorId);
  const performer = contact && authoredActorId(plan, contact.performerActorId);
  const recipient = contact && authoredActorId(plan, contact.recipientActorId);
  return source === setterId && performer === setterId && recipient === hitterId
    ? null : `${id}#${sceneIndex}:${source || "?"}/${performer || "?"}->${recipient || "?"}`;
}).filter(Boolean);
ok(authoredOffenseSetChecks.length === 12 && brokenAuthoredOffenseSets.length === 0,
  `offense set ownership is not explicitly setter-to-hitter: ${brokenAuthoredOffenseSets.join(", ")}`);

const authoredOffenseAttackChecks = [
  ["hitting-off-a-live-set", 1, "approach-hitter"],
  ["approach-timing-off-the-pass", 1, "approach-hitter"],
  ["hitting-from-all-positions", 0, "approach-hitter"],
  ["hitting-from-all-positions", 1, "approach-hitter"],
  ["hitting-from-all-positions", 2, "approach-hitter"],
  ["attack-and-transition-to-defense", 0, "approach-hitter"],
  ["middle-quick-attack", 1, "middle-quick-hitter"],
  ["back-row-attack-pipe", 1, "pipe-hitter"]
];
const brokenAuthoredOffenseAttacks = authoredOffenseAttackChecks.map((entry) => {
  const [id, sceneIndex, hitterId] = entry;
  const plan = fullScenePlan(id, sceneIndex);
  const contact = plan.contacts.find((item) => item.motionId === "attack");
  const source = contact && authoredActorId(plan, contact.sourceActorId);
  const performer = contact && authoredActorId(plan, contact.performerActorId);
  const target = contact && contact.recipientEndpoint && contact.recipientEndpoint.type;
  return source === hitterId && performer === hitterId && target === "target" &&
      !contact.recipientActorId
    ? null : `${id}#${sceneIndex}:${source || "?"}/${performer || "?"}->${target || "?"}`;
}).filter(Boolean);
ok(authoredOffenseAttackChecks.length === 8 && brokenAuthoredOffenseAttacks.length === 0,
  `offense attack ownership/target is not explicitly hitter-to-target: ${brokenAuthoredOffenseAttacks.join(", ")}`);

const uiSource = fs.readFileSync(path.join(ROOT, "js/ui.js"), "utf8");
const runSource = fs.readFileSync(path.join(ROOT, "js/run.js"), "utf8");
const animationSource = fs.readFileSync(path.join(ROOT, "js/drill-animation.js"), "utf8");
const animationCss = fs.readFileSync(path.join(ROOT, "css/drill-animation.css"), "utf8");
const humanSource = fs.readFileSync(path.join(ROOT, "js/drill-human-motion.js"), "utf8");
const humanCss = fs.readFileSync(path.join(ROOT, "css/drill-human-motion.css"), "utf8");
const choreographyCss = fs.readFileSync(path.join(ROOT, "css/drill-choreography.css"), "utf8");
const editorSource = fs.readFileSync(path.join(ROOT, "js/drill-editor.js"), "utf8");
const indexSource = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const walkthroughProbeDrill = RR.drills.find((drill) => drill.id === "pass-set-hit-triangle");
const walkthroughProbeScene = RR.drillAnimation.scenesFor(walkthroughProbeDrill)[1];
const walkthroughProbeInstruction = walkthroughProbeDrill.steps[1];
const walkthroughProbeFacts = RR.drillAnimation.courtFactsFor(
  walkthroughProbeDrill, walkthroughProbeScene, walkthroughProbeInstruction
);
const walkthroughProbePlan = RR.drillChoreography.planFor(
  walkthroughProbeDrill, walkthroughProbeScene, walkthroughProbeInstruction,
  { sceneIndex: 1, stepIndex: 1 }
);
ok((uiSource.match(/RR\.drillAnimation\.figure\(drill\)/g) || []).length >= 2,
  "shared drill details and expanded practice blocks must both lead with animation");
ok(/RR\.drillAnimation\.figure\(drill\)/.test(runSource),
  "run screen must use the animated drill example");
ok(!/RR\.ui\.diagramFigure\s*\?/.test(runSource),
  "run screen still resolves the old static drill diagram");
ok(/fillLegend\(legend, (?:spec|specs\[current\])\.legend\)/.test(animationSource),
  "current authored legend is not connected to the interactive scene");
ok(/\.dam-ring--target\s*\{[^}]*stroke:/.test(animationCss),
  "target rings have no visible stroke style");
ok(indexSource.indexOf('src="js/drill-human-motion.js"') < indexSource.indexOf('src="js/drill-animation.js"'),
  "human-motion registry must load before the interactive renderer");
ok(indexSource.indexOf('src="js/drill-human-motion.js"') < indexSource.indexOf('src="js/drill-choreography.js"') &&
  indexSource.indexOf('src="js/drill-choreography.js"') < indexSource.indexOf('src="js/drill-animation.js"'),
  "choreography planner must load between the human registry and renderer");
ok(indexSource.includes('href="css/drill-choreography.css"') &&
  /\.drill-motion__court-inspector\s*\{/.test(choreographyCss) &&
  /The lens is a sibling of the court, never an overlay/.test(choreographyCss),
  "production choreography styles or the unobstructed inspector layout are not loaded");
ok(JSON.stringify(walkthroughProbePlan.beats.slice(0, 4).map((beat) => beat.motionId)) ===
  JSON.stringify(["feed", "pass", "set", "attack"]) &&
  walkthroughProbePlan.beats.every((beat, index, beats) =>
    Number.isFinite(beat.startMs) && Number.isFinite(beat.durationMs) && beat.durationMs > 0 &&
    (index === 0 || beat.startMs >= beats[index - 1].startMs + beats[index - 1].durationMs)),
  "live walkthrough does not expose a complete, deterministically timed feed-pass-set-hit beat sequence");
ok(/aria-pressed/.test(animationSource) && /Show " \+ actionMeta\.label \+ " technique/.test(animationSource),
  "multi-action technique controls are not exposed to keyboard and assistive technology");
const autoBeatControllerSource = animationSource.slice(
  animationSource.indexOf("function scheduleBeat()"),
  animationSource.indexOf("function fillCoach(")
);
ok(/dam-motion-announcer/.test(animationSource) &&
  /announcer\.setAttribute\("aria-live", "polite"\)/.test(animationSource) &&
  !/phaseStatus\.setAttribute\("aria-live"/.test(animationSource) &&
  !/announceCurrentState/.test(autoBeatControllerSource) &&
  /show\(index, true\)/.test(animationSource) && /setView\(nextView, changed\)/.test(animationSource),
  "autoplay rewrites a polite live region instead of limiting announcements to user step/view changes");
ok(/contact\.sourceEndpoint\s*&&\s*contact\.sourceEndpoint\.label/.test(animationSource) &&
  /contact\.recipientEndpoint\s*&&\s*contact\.recipientEndpoint\.label/.test(animationSource),
  "technique chain copy does not name factual wall, floor, hoop, zone, or target endpoints");
ok(/\.dam-scene-person__role\s*\{[^}]*font:\s*850 10px\/1\.15/s.test(choreographyCss) &&
  /\.dam-scene-actor--crowded \.dam-scene-person__role\s*\{[^}]*font-size:\s*10px/s.test(choreographyCss) &&
  /@media \(max-width: 759px\)[\s\S]*\.dam-scene-person__role\s*\{\s*font-size:\s*11px/.test(choreographyCss),
  "compact actor role labels are below the practical 10px mobile readability floor");
ok(/reducedMotionQuery\.addEventListener\("change"/.test(animationSource) &&
  /@media \(prefers-reduced-motion: reduce\)/.test(humanCss),
  "runtime reduced-motion changes are not handled by both controls and motion styles");
ok(/loading = "lazy"/.test(animationSource) && !/will-change:\s*transform/.test(humanCss),
  "human atlases are still eagerly promoted/decoded in collapsed drill blocks");
ok(/!hasHuman \|\| currentView !== "technique" \|\| typeof Image/.test(animationSource),
  "court-first multi-player drills preload hidden human atlases before Technique is requested");
ok(/assetFor\(form\.motionType\)/.test(editorSource) && /!stepList\.length/.test(editorSource),
  "custom drill editor does not require a registered human action and a real saved step");
ok(/run:\s*action\("run", "Running stride"/.test(humanSource),
  "real run/jog/sprint steps do not have a dedicated human stride cycle");
ok(/\.dam-flight\s*\{[\s\S]*?animation:\s*dam-travel/.test(animationCss) &&
  /\.dam-mover\s*\{[\s\S]*?animation:\s*dam-athlete-travel/.test(animationCss) &&
  /@keyframes dam-athlete-travel\s*\{[\s\S]*?0%, 5%\s*\{[^}]*opacity:\s*1;[\s\S]*?88%, 100%\s*\{[^}]*opacity:\s*1;/.test(animationCss),
  "bound human movers still inherit the ball fade and disappear during launch or finish");
ok(walkthroughProbePlan.valid &&
  walkthroughProbePlan.instruction === walkthroughProbeFacts.instruction &&
  walkthroughProbePlan.participantSummary.totalAthletes ===
    walkthroughProbeFacts.representedPeople + walkthroughProbeFacts.additional &&
  walkthroughProbePlan.routes.filter((route) => route.type === "ball").length ===
    walkthroughProbeFacts.ballRouteCount &&
  walkthroughProbePlan.routes.filter((route) => route.type === "move").length ===
    walkthroughProbeFacts.movementRouteCount,
  "live walkthrough plan and factual participant/mechanics details are out of sync");
ok(/function participantModelFor\(drill, spec\)/.test(animationSource) &&
  /data-player-index/.test(animationSource) && /dam-mover--bound/.test(animationSource),
  "player movement routes are not bound to factual scene actors when an unambiguous actor exists");
ok(/index < token\.people/.test(animationSource) &&
  /stagedIndex < stagedPeople/.test(animationSource) && /dam-staged-person/.test(animationSource) &&
  /\.drill-motion__court-avatar::before/.test(humanCss) &&
  /\.drill-motion__court-avatar::after/.test(humanCss),
  "participant accounting does not render every required person in the court view and summary");
ok(/var currentView = defaultViewFor\(drill, hasHuman\)/.test(animationSource),
  "multi-player drill figures do not select the full court operation as their first view");

let authored = 0;
let derived = 0;
let multi = 0;
let sceneCount = 0;
let authoredLegendScenes = 0;
let authoredLegendItems = 0;
let reviewedChainCount = 0;
let reviewedBallPathCount = 0;
let multiplayerSceneCount = 0;
let additionalParticipantScenes = 0;
let boundMovementRoutes = 0;
let unboundMovementRoutes = 0;
const unboundMovementRouteKeys = [];
const pathlessMultiplayerDrills = [];
const derivedIds = [];

RR.drills.forEach((drill) => {
  const scenes = RR.drillAnimation.scenesFor(drill);
  const hasAuthored = RR.drillAnimation.isAuthored(drill);
  if (hasAuthored) authored++;
  else { derived++; derivedIds.push(drill.id); }
  if (Number.isInteger(drill.minPlayers) && drill.minPlayers >= 2 &&
      scenes.every((scene) => !(scene.paths || []).length)) pathlessMultiplayerDrills.push(drill.id);
  ok(RR.drillAnimation.defaultViewFor(drill, true) === "court",
    `${drill.id}: drill does not open on the complete Live walkthrough`);
  ok(RR.drillAnimation.defaultViewFor(drill, false) === "court",
    `${drill.id}: drill without a human demonstration does not open on its factual court view`);
  if (scenes.length > 1) multi++;
  sceneCount += scenes.length;
  if (hasAuthored) scenes.forEach((scene) => {
    if (scene.legend && scene.legend.length) {
      authoredLegendScenes++;
      authoredLegendItems += scene.legend.length;
    }
  });

  ok(scenes.length > 0, `${drill.id}: no animation scene`);
  scenes.forEach((scene, index) => {
    const claimedIndices = new Set();
    const reviewedBallPaths = new Set(scene.motionBallPaths || []);
    reviewedBallPathCount += reviewedBallPaths.size;
    reviewedBallPaths.forEach((pathIndex) => {
      const route = (scene.paths || [])[pathIndex];
      ok(!!route, `${drill.id} scene ${index + 1}: missing reviewed object path ${pathIndex}`);
      ok(!!route && route.kind === "move",
        `${drill.id} scene ${index + 1}: reviewed object path ${pathIndex} is not move-styled`);
    });
    (scene.motionChains || []).forEach((chain, chainIndex) => {
      reviewedChainCount++;
      ok(chain.length >= 2, `${drill.id} scene ${index + 1} chain ${chainIndex + 1}: chain needs at least two legs`);
      chain.forEach((pathIndex) => {
        const route = (scene.paths || [])[pathIndex];
        ok(!!route, `${drill.id} scene ${index + 1} chain ${chainIndex + 1}: missing path ${pathIndex}`);
        ok(!claimedIndices.has(pathIndex), `${drill.id} scene ${index + 1}: path ${pathIndex} appears in two chains`);
        claimedIndices.add(pathIndex);
        ok(!!route && ((route.kind || "ball") !== "move" || reviewedBallPaths.has(pathIndex)),
          `${drill.id} scene ${index + 1}: chain path ${pathIndex} is player movement`);
      });
    });
    const savedInstruction = (drill.steps && drill.steps[index]) || scene.caption || drill.setup || drill.name;
    const participantModel = RR.drillAnimation.participantModelFor(drill, scene);
    const courtFacts = RR.drillAnimation.courtFactsFor(drill, scene, savedInstruction);
    const minimum = Number.isInteger(drill.minPlayers) && drill.minPlayers >= 1 && drill.minPlayers <= 30
      ? drill.minPlayers : null;
    const expectedBallRoutes = (scene.paths || []).filter((route, routeIndex) =>
      (route.kind || "ball") !== "move" || reviewedBallPaths.has(routeIndex)).length;
    const expectedMovementRoutes = (scene.paths || []).length - expectedBallRoutes;
    const bindingEntries = Object.values(participantModel.moveBindings || {});
    const boundPlayerIndices = new Set();
    const activeRouteClaims = new Set();
    const fields = RR.format.fields(drill);
    const choreographyPlan = RR.drillChoreography.planFor(drill, scene, savedInstruction, {
      sceneIndex: index,
      stepIndex: index
    });
    const choreographyValidation = RR.drillChoreography.validatePlan(choreographyPlan);
    const choreographyActorIds = new Set(choreographyPlan.actors.map((actor) => actor.id));
    const requiredChoreographyAthletes = minimum == null ? [] : choreographyPlan.actors
      .filter((actor) => !actor.support)
      .slice(0, minimum);
    if (minimum != null && minimum >= 2) multiplayerSceneCount++;
    if (courtFacts.additional) additionalParticipantScenes++;
    boundMovementRoutes += bindingEntries.length;
    unboundMovementRoutes += expectedMovementRoutes - bindingEntries.length;
    (scene.paths || []).forEach((route, routeIndex) => {
      const kind = route.kind || "ball";
      if (kind === "move" && !reviewedBallPaths.has(routeIndex) &&
          !participantModel.moveBindings[routeIndex]) {
        unboundMovementRouteKeys.push(`${drill.id}|${index + 1}|${routeIndex}`);
      }
    });

    ok(courtFacts.minimum === minimum,
      `${drill.id} scene ${index + 1}: court summary lost the saved minimum`);
    ok(courtFacts.positionedPeople + courtFacts.groupedPeople === courtFacts.representedPeople,
      `${drill.id} scene ${index + 1}: positioned/grouped participant accounting does not add up`);
    ok(minimum == null || courtFacts.representedPeople + courtFacts.additional >= minimum,
      `${drill.id} scene ${index + 1}: required participants disappear from the court accounting`);
    ok(courtFacts.additional === (minimum == null ? 0 : Math.max(0, minimum - courtFacts.representedPeople)),
      `${drill.id} scene ${index + 1}: additional participant count is not factual`);
    ok(courtFacts.grouping === fields.grouping && courtFacts.flow === fields.flow,
      `${drill.id} scene ${index + 1}: grouping/how-it-runs copy is not sourced from RR.format.fields`);
    ok(courtFacts.instruction === savedInstruction,
      `${drill.id} scene ${index + 1}: current saved instruction was replaced in court mechanics`);
    ok(courtFacts.ballRouteCount === expectedBallRoutes &&
      courtFacts.movementRouteCount === expectedMovementRoutes,
      `${drill.id} scene ${index + 1}: ball/player route counts do not match authored paths`);
    ok(courtFacts.ballSequences.reduce((count, chain) => count + chain.length, 0) === expectedBallRoutes,
      `${drill.id} scene ${index + 1}: authored ball route legs disappeared from mechanics`);
    ok(courtFacts.movementRoutes.length === expectedMovementRoutes,
      `${drill.id} scene ${index + 1}: authored player routes disappeared from mechanics`);
    ok(choreographyPlan.valid && choreographyValidation.valid,
      `${drill.id} scene ${index + 1}: choreography plan is invalid (${choreographyValidation.errors.join("; ")})`);
    ok(minimum == null || (requiredChoreographyAthletes.length === minimum &&
      requiredChoreographyAthletes.every((actor) => actor.fullBody === true &&
        Number.isFinite(actor.x) && Number.isFinite(actor.y) &&
        actor.x >= 0 && actor.x <= choreographyPlan.width &&
        actor.y >= 0 && actor.y <= choreographyPlan.height)),
      `${drill.id} scene ${index + 1}: every saved-minimum athlete is not a full-body actor inside the scene bounds`);
    ok(choreographyPlan.routes.filter((route) => route.type === "move")
      .every((route) => route.actorId && choreographyActorIds.has(route.actorId)),
      `${drill.id} scene ${index + 1}: choreography contains an unbound movement route`);
    ok(choreographyPlan.contacts.every((contact) =>
      ((contact.sourceActorId && choreographyActorIds.has(contact.sourceActorId)) ||
        (contact.sourceEndpoint && /^(wall|floor|zone|hoop|target)$/.test(contact.sourceEndpoint.type))) &&
      ((contact.recipientActorId && choreographyActorIds.has(contact.recipientActorId)) ||
        (contact.recipientEndpoint && /^(wall|floor|zone|hoop|target)$/.test(contact.recipientEndpoint.type)))),
      `${drill.id} scene ${index + 1}: choreography ball contact lost its factual actor/endpoint source or recipient`);
    bindingEntries.forEach((binding) => {
      const route = (scene.paths || [])[binding.pathIndex];
      ok(!!route && (route.kind || "ball") === "move" && !reviewedBallPaths.has(binding.pathIndex),
        `${drill.id} scene ${index + 1}: actor binding points at a non-player route`);
      ok(binding.player === (scene.players || [])[binding.playerIndex],
        `${drill.id} scene ${index + 1}: actor binding is not one of the factual scene players`);
      const simultaneousGroup = route.simultaneousGroup || route.parallelGroup || `route-${binding.pathIndex}`;
      const activeClaim = `${binding.playerIndex}|${simultaneousGroup}`;
      ok(!activeRouteClaims.has(activeClaim),
        `${drill.id} scene ${index + 1}: factual player ${binding.playerIndex} has two routes in the same simultaneous group`);
      activeRouteClaims.add(activeClaim);
      boundPlayerIndices.add(binding.playerIndex);
      if (binding.source === "origin") {
        const dx = binding.player.x - route.from[0];
        const dy = binding.player.y - route.from[1];
        ok(Math.sqrt(dx * dx + dy * dy) <= 0.900001,
          `${drill.id} scene ${index + 1}: proximity actor binding exceeds the reviewed threshold`);
      } else {
        ok(binding.source === "explicit",
          `${drill.id} scene ${index + 1}: actor binding has an unknown source`);
      }
    });

    const markup = RR.drillAnimation.renderSvg(scene, `verify-${drill.id}-${index}`, courtFacts);
    ok((markup.match(/class="dam-mover dam-mover--bound"/g) || []).length === bindingEntries.length,
      `${drill.id} scene ${index + 1}: rendered moving people do not match factual actor bindings`);
    ok((markup.match(/class="dam-staged-person"/g) || []).length === courtFacts.additional,
      `${drill.id} scene ${index + 1}: not every unpositioned required athlete is visible in the court staging strip`);
    ok(/^<svg[\s>]/.test(markup), `${drill.id} scene ${index + 1}: no inline SVG`);
    ok(!/<img|placeholder|coming soon/i.test(markup), `${drill.id} scene ${index + 1}: static/placeholder visual leaked in`);
    ok(/dam-(flight|mover|player-focus|zone|ring)/.test(markup), `${drill.id} scene ${index + 1}: no animated visual primitive`);
    ok(!!(scene.caption || drill.setup || (drill.steps && drill.steps[0])), `${drill.id} scene ${index + 1}: no real drill caption`);
  });
});

ok(authored === 210, `expected 210 authored drill animations, found ${authored}`);
ok(derived === 31, `expected 31 field-derived bundled animations, found ${derived}`);
ok(multi === 79, `expected 79 multi-step drills, found ${multi}`);
ok(sceneCount === 337, `expected 337 resolved scenes (306 authored + 31 derived), found ${sceneCount}`);
ok(authoredLegendScenes === 260, `expected 260 authored scenes with legends, found ${authoredLegendScenes}`);
ok(authoredLegendItems >= 513, `expected at least 513 authored legend items, found ${authoredLegendItems}`);
ok(reviewedChainCount === 130, `expected 130 reviewed single-ball chains, found ${reviewedChainCount}`);

// Exercise the exact render path used by every saved written step, not just one
// representative instruction per resolved scene. Each sampled beat retains
// every person and one synchronized live ball for its factual contact; grouped
// parallel beats below retain every simultaneous athlete and contact together.
let savedStepPlanCount = 0;
let supplementalScenePlanCount = 0;
let savedStepBeatCount = 0;
let opaqueCourtMotionCount = 0;
let parallelGroupCount = 0;
RR.drills.forEach((drill) => {
  const scenes = RR.drillAnimation.scenesFor(drill);
  const program = RR.drillHumanMotion.programFor(drill, scenes);
  const savedEntries = program.filter((item) => item.sourceStep >= 0);
  ok(savedEntries.length === drill.steps.length &&
    drill.steps.every((step, stepIndex) => savedEntries[stepIndex].instruction === step),
    `${drill.id}: human program does not preserve every saved instruction exactly once`);
  ok(scenes.every((scene, sceneIndex) => program.some((item) =>
    item.sceneIndex === sceneIndex && item.scene === scene)),
    `${drill.id}: an authored/derived court scene is unreachable from the walkthrough`);
  program.forEach((item, itemIndex) => {
    const spec = item.scene || scenes[Math.min(item.sceneIndex || 0, scenes.length - 1)];
    const sourceStep = item.sourceStep >= 0 ? item.sourceStep : itemIndex;
    const instruction = item.instruction || drill.steps[sourceStep];
    const plan = RR.drillChoreography.planFor(drill, spec, instruction, {
      stepIndex: sourceStep,
      sceneIndex: Number.isInteger(item.sceneIndex) ? item.sceneIndex : scenes.indexOf(spec),
      sceneUsageCount: program.filter((entry) => entry.sceneIndex === item.sceneIndex).length,
      showFullScene: item.supplementalScene === true
    });
    const facts = RR.drillAnimation.courtFactsFor(drill, spec, instruction);
    if (item.sourceStep >= 0) savedStepPlanCount++;
    else supplementalScenePlanCount++;
    ok(plan.valid && plan.instruction === instruction,
      `${drill.id} walkthrough ${itemIndex + 1}: plan is invalid or changed its instruction`);
    plan.beats.forEach((beat, beatIndex) => {
      savedStepBeatCount++;
      const markup = RR.drillAnimation.renderSvg(spec,
        `saved-${drill.id}-${itemIndex}-${beatIndex}`, facts, plan, beat);
      const actorCount = (markup.match(/<foreignObject\b/g) || []).length;
      const liveBallCount = (markup.match(/class="dam-flight [^"]*dam-live-ball"/g) || []).length;
      ok(actorCount === plan.actors.length,
        `${drill.id} walkthrough ${itemIndex + 1} beat ${beatIndex + 1}: not every planned person is rendered once`);
      ok(!/class="dam-staged-person"|class="dam-player dam-player--/.test(markup),
        `${drill.id} walkthrough ${itemIndex + 1} beat ${beatIndex + 1}: a legacy stick/circle person leaked into plan mode`);
      ok(liveBallCount === (beat.contactId ? 1 : 0),
        `${drill.id} walkthrough ${itemIndex + 1} beat ${beatIndex + 1}: live ball is not synchronized one-to-one with contact`);
      ok(!beat.actorId || markup.includes(`data-actor-id="${beat.actorId}"`),
        `${drill.id} walkthrough ${itemIndex + 1} beat ${beatIndex + 1}: active actor is absent`);
      ok(!beat.routeId || markup.includes(`data-route-id="${beat.routeId}"`) ||
        plan.routes.find((route) => route.id === beat.routeId).type !== "move",
        `${drill.id} walkthrough ${itemIndex + 1} beat ${beatIndex + 1}: movement actor is not bound to its route`);
      if (beat.actorId && beat.motion && beat.motion.transparent === false) {
        opaqueCourtMotionCount++;
        const animationClassIsCorrect = beat.motion.animate === false
          ? !markup.includes("dam-scene-sprite is-performing")
          : markup.includes("dam-scene-sprite is-performing");
        ok(markup.includes("dam-scene-person--studio") &&
          animationClassIsCorrect &&
          markup.includes(beat.motion.asset),
          `${drill.id} walkthrough ${itemIndex + 1} beat ${beatIndex + 1}: opaque full-body motion fell back to a static roster`);
      }
    });
    plan.beats.forEach((beat, beatIndex) => {
      if (beatIndex > 0 && plan.beats[beatIndex - 1].startMs === beat.startMs) return;
      const group = RR.drillAnimation.concurrentBeatsFor(plan, beatIndex);
      if (group.length < 2) return;
      parallelGroupCount++;
      const markup = RR.drillAnimation.renderSvg(spec,
        `parallel-${drill.id}-${itemIndex}-${beatIndex}`, facts, plan, group);
      const activeTracks = new Set(group.filter((item) => item.contactId)
        .map((item) => item.trackId || item.contactId));
      ok((markup.match(/dam-scene-sprite is-performing/g) || []).length === animatedActorCount(group) &&
        (markup.match(/class="dam-flight [^"]*dam-live-ball"/g) || []).length === activeTracks.size &&
        markup.includes(`data-active-beats="${group.length}"`),
        `${drill.id} walkthrough ${itemIndex + 1}: simultaneous planner beats do not render every athlete and ball together`);
    });
  });
});
ok(savedStepPlanCount === 979,
  `expected 979 saved-step plans, found ${savedStepPlanCount}`);
ok(supplementalScenePlanCount === 8,
  `expected 8 authored scene-coverage plans, found ${supplementalScenePlanCount}`);
ok(savedStepBeatCount >= 1500,
  `expected at least 1500 synchronized, step-scoped saved-step beats, found ${savedStepBeatCount}`);
ok(opaqueCourtMotionCount > 0,
  "no opaque equipment/power/recovery/specialized full-body motion was audited on court");
ok(parallelGroupCount > 0,
  "no planner parallel group was exercised through the concurrent court renderer");

const sharedTrackMotion = RR.drillChoreography.motions.pass;
const sharedTrackPlan = {
  id: "parallel-track-audit",
  actors: [
    { id: "track-athlete-a", x: 2, y: 6, team: "a", role: "passer" },
    { id: "track-athlete-b", x: 7, y: 2, team: "b", role: "setter" }
  ],
  routes: [],
  contacts: [
    { id: "track-contact-1", chainId: "shared-rally", from: [2, 6], to: [7, 2],
      sourceActorId: "track-athlete-a", recipientActorId: "track-athlete-b", object: "ball" },
    { id: "track-contact-2", chainId: "shared-rally", from: [2, 6], to: [6, 3],
      sourceActorId: "track-athlete-a", recipientActorId: "track-athlete-b", object: "ball" },
    { id: "track-contact-3", chainId: "independent-feed", from: [7, 2], to: [3, 5],
      sourceActorId: "track-athlete-b", recipientActorId: "track-athlete-a", object: "ball" }
  ]
};
const sharedTrackBeats = [
  { id: "track-beat-1", actorId: "track-athlete-a", contactId: "track-contact-1",
    trackId: "shared-rally", motionId: "pass", motion: sharedTrackMotion, durationMs: 950 },
  { id: "track-beat-2", actorId: "track-athlete-a", contactId: "track-contact-2",
    trackId: "shared-rally", motionId: "pass", motion: sharedTrackMotion, durationMs: 950 },
  { id: "track-beat-3", actorId: "track-athlete-b", contactId: "track-contact-3",
    trackId: "independent-feed", motionId: "pass", motion: sharedTrackMotion, durationMs: 950 }
];
const sharedTrackMarkup = RR.drillAnimation.renderSvg(
  { w: 9, h: 8, players: [], paths: [] }, "parallel-track-audit", {},
  sharedTrackPlan, sharedTrackBeats
);
ok((sharedTrackMarkup.match(/dam-scene-sprite is-performing/g) || []).length === 2 &&
  (sharedTrackMarkup.match(/class="dam-flight [^"]*dam-live-ball"/g) || []).length === 2 &&
  (sharedTrackMarkup.match(/data-track-id="shared-rally"/g) || []).length === 1 &&
  (sharedTrackMarkup.match(/data-track-id="independent-feed"/g) || []).length === 1 &&
  sharedTrackMarkup.includes('data-active-actors="2"'),
  "parallel renderer duplicates one athlete/shared-chain ball or drops an independent ball track");

const broadcastScene = {
  w: 9, h: 8, court: [{ x: 0, y: 0.5, w: 9, h: 7 }], net: 4,
  players: [],
  paths: [
    { from: [2, 6], to: [3, 4], kind: "move", actor: "near", label: "release" },
    { from: [2, 6], to: [7, 2], kind: "ball", label: "dig" },
    { from: [7, 2], to: [6, 3], kind: "move", actor: "far", label: "reset" }
  ]
};
const broadcastPlan = {
  id: "broadcast-layer-audit", height: 8,
  actors: [
    { id: "near", x: 2, y: 6, team: "a", role: "digger" },
    { id: "far", x: 7, y: 2, team: "b", role: "target" }
  ],
  routes: [
    { id: "route-1", sourcePathIndex: 0, type: "move", actorId: "near",
      from: [2, 6], via: [], to: [3, 4] },
    { id: "route-2", sourcePathIndex: 1, type: "ball", actorId: null,
      from: [2, 6], via: [], to: [7, 2] },
    { id: "route-3", sourcePathIndex: 2, type: "move", actorId: "far",
      from: [7, 2], via: [], to: [6, 3] }
  ],
  contacts: [{ id: "contact-1", routeId: "route-2", chainId: "rally",
    from: [2, 6], via: [], to: [7, 2], kind: "ball", object: "volleyball",
    sourceActorId: "near", recipientActorId: "far" }],
  beats: [], equipment: []
};
const broadcastBeats = [
  { id: "move-beat", actorId: "near", routeId: "route-1", motionId: "sprint",
    motion: RR.drillChoreography.motions.sprint, durationMs: 1000 },
  { id: "ball-beat", actorId: "near", routeId: "route-2", contactId: "contact-1",
    trackId: "rally", motionId: "pass", motion: RR.drillChoreography.motions.pass,
    durationMs: 1000 }
];
const broadcastBefore = JSON.stringify(broadcastScene);
const broadcastMarkup = RR.drillAnimation.renderSvg(
  broadcastScene, "broadcast-layer-audit", {}, broadcastPlan, broadcastBeats
);
const broadcastLayerOrder = ["surface", "markings", "guides", "shadows",
  "equipment", "actors", "effects", "foreground"]
  .map((name) => broadcastMarkup.indexOf(`data-layer="${name}"`));
ok(broadcastMarkup.includes('class="dam-svg dam-svg--broadcast"') &&
  broadcastMarkup.includes('data-camera="broadcast-elevated"') &&
  broadcastMarkup.includes('data-plan-mode="walkthrough"') &&
  broadcastMarkup.includes('data-active-routes="2"') &&
  broadcastLayerOrder.every((index, position) => index >= 0 &&
    (position === 0 || index > broadcastLayerOrder[position - 1])),
  "broadcast renderer lacks a stable, correctly ordered elevated-court layer stack");
ok((broadcastMarkup.match(/class="dam-athlete-shadow"/g) || []).length === 2 &&
  broadcastMarkup.indexOf('data-actor-id="far"') < broadcastMarkup.indexOf('data-actor-id="near"') &&
  /data-actor-id="far"[^>]*data-depth="0\.25"[^>]*data-depth-order="0"/.test(broadcastMarkup) &&
  /data-actor-id="near"[^>]*data-depth="0\.75"[^>]*data-depth-order="1"/.test(broadcastMarkup),
  "broadcast athletes are not grounded or painted deterministically from far court to camera");
ok(/class="dam-route dam-route--move dam-route--active"[^>]*data-route-id="route-1"/.test(broadcastMarkup) &&
  /class="dam-route dam-route--ball dam-route--active"[^>]*data-route-id="route-2"/.test(broadcastMarkup) &&
  /class="dam-route dam-route--move dam-route--context"[^>]*data-route-id="route-3"/.test(broadcastMarkup),
  "active routes are not separated from quiet contextual routes during playback");
ok((broadcastMarkup.match(/class="dam-ball-shadow-track"/g) || []).length === 1 &&
  (broadcastMarkup.match(/class="dam-flight__body"/g) || []).length === 1 &&
  (broadcastMarkup.match(/class="dam-contact-impact"/g) || []).length === 1 &&
  broadcastMarkup.includes('data-flight-profile="pass"') &&
  broadcastMarkup.includes('data-contact-target="far"') &&
  /--dam-arc-height:-\d+(?:\.\d+)?px/.test(broadcastMarkup),
  "active ball does not carry a grounded shadow, readable arc, and recipient contact cue");
ok(JSON.stringify(broadcastScene) === broadcastBefore,
  "broadcast rendering mutated authored coordinates while deriving presentation layers");

ok(reviewedBallPathCount === 6, `expected 6 reviewed move-styled object paths, found ${reviewedBallPathCount}`);
ok(multiplayerSceneCount > 0, "participant accounting never covered a multi-player scene");
ok(additionalParticipantScenes > 0,
  "participant accounting never identifies minimum players omitted from a representative court scene");
ok(boundMovementRoutes > 0,
  "no player movement route resolved to an unambiguous factual scene actor");
const intentionalSchematicRoutes = [
  "shoulder-band-prep|1|0", "shoulder-band-prep|1|1",
  "shoulder-band-prep|1|2", "shoulder-band-prep|1|3",
  "set-and-sit|2|1",
  "bodyweight-shoulder-activation|1|0", "bodyweight-shoulder-activation|1|1",
  "bodyweight-shoulder-activation|1|2",
  "band-pull-aparts|1|0", "band-pull-aparts|1|1", "band-pull-aparts|1|2",
  "band-arm-speed|1|0", "band-arm-speed|1|1",
  "mini-band-glute-bridges|1|1"
].sort();
ok(unboundMovementRoutes === intentionalSchematicRoutes.length,
  `expected ${intentionalSchematicRoutes.length} intentional schematic routes, found ${unboundMovementRoutes}`);
ok(JSON.stringify(unboundMovementRouteKeys.slice().sort()) === JSON.stringify(intentionalSchematicRoutes),
  `unexpected unbound athlete routes: ${unboundMovementRouteKeys.slice().sort().join(", ")}`);
ok(pathlessMultiplayerDrills.length === 0,
  `multi-player drills still lack mechanical paths: ${pathlessMultiplayerDrills.join(", ")}`);

const queen6Scenes = RR.drillAnimation.scenesFor(
  RR.drills.find((drill) => drill.id === "six-on-six-queen-of-the-court")
);
ok(queen6Scenes.length === 2,
  "six-on-six-queen-of-the-court: rally and post-rally rotation need separate mechanical scenes");
const queen6Rally = queen6Scenes[0];
const queen6Rotation = queen6Scenes[1];
const queen6ExpectedActorIds = ["queen", "challenger"].flatMap((team) =>
  ["front-left", "front-middle", "front-right", "back-left", "back-middle", "back-right"]
    .map((position) => `six-queen-${team}-${position}`)).sort();
ok(queen6Rally.players.length === 12 &&
  queen6Rally.players.filter((player) => player.team === "a").length === 6 &&
  queen6Rally.players.filter((player) => player.team === "b").length === 6,
  "six-on-six-queen-of-the-court: rally scene does not plot both complete six-player teams");
ok([queen6Rally, queen6Rotation].every((scene) =>
  JSON.stringify(scene.players.map((player) => player.id).sort()) === JSON.stringify(queen6ExpectedActorIds) &&
  scene.players.every((player) => player.role && player.facing ===
    (player.id.startsWith("six-queen-queen-") ? "north" : "south"))),
  "six-on-six-queen-of-the-court: the two scenes do not preserve all 12 stable positional actors and roles");
ok(queen6Rally.players.some((player) => player.label === "S" && player.y < 0.8) &&
  queen6Rally.paths.length === 1 && queen6Rally.paths[0].kind === "serve" &&
  (queen6Rally.paths[0].via || []).length === 3 &&
  /SERVE.*PASS.*SET.*HIT/.test(queen6Rally.paths[0].label),
  "six-on-six-queen-of-the-court: server or complete serve-pass-set-hit rally is missing");
ok(JSON.stringify((queen6Rally.contacts || []).map((contact) =>
  [contact.order, contact.actor, contact.action])) === JSON.stringify([
  [1, "six-queen-challenger-back-right", "serve release"],
  [2, "six-queen-queen-back-left", "forearm pass"],
  [3, "six-queen-queen-front-right", "set"],
  [4, "six-queen-queen-front-left", "attack"]
]),
  "six-on-six-queen-of-the-court: authored serve-pass-set-attack contacts are not assigned to the correct six-player positions");
ok(queen6Rotation.players.length === 12 &&
  ["a", "b"].every((team) => {
    const teamPlayers = queen6Rotation.players.filter((player) => player.team === team);
    return teamPlayers.length === 6 &&
      new Set(teamPlayers.slice(0, 3).map((player) => player.y)).size === 1 &&
      new Set(teamPlayers.slice(3).map((player) => player.y)).size === 1;
  }),
  "six-on-six-queen-of-the-court: teams are not in complete three-front/three-back formations");
const queen6Bindings = RR.drillAnimation.participantModelFor(
  RR.drills.find((drill) => drill.id === "six-on-six-queen-of-the-court"), queen6Rotation
).moveBindings;
ok(queen6Rotation.paths.length === 12 && Object.keys(queen6Bindings).length === 12 &&
  Object.values(queen6Bindings).every((binding) => binding.source === "explicit") &&
  new Set(queen6Rotation.paths.map((route) => route.actor)).size === 12 &&
  queen6Rotation.paths.every((route) =>
    route.actor === queen6Rotation.players[route.playerIndex].id &&
    queen6ExpectedActorIds.includes(route.actor)),
  "six-on-six-queen-of-the-court: every player is not explicitly bound to the team swap");
ok(queen6Rotation.paths.every((route) => route.hideLabel && route.label) &&
  queen6Rotation.paths.slice(0, 6).every((route) => /Queen .* rotates around/.test(route.label)) &&
  queen6Rotation.paths.slice(6).every((route) => /Challenger .* crosses/.test(route.label)),
  "six-on-six-queen-of-the-court: detailed route labels are missing or cluttering the court drawing");

const miniTournamentScenes = RR.drillAnimation.scenesFor(
  RR.drills.find((drill) => drill.id === "mini-volley-stations-tournament")
);
ok(miniTournamentScenes.length === 2 && miniTournamentScenes.every((scene) => scene.players.length === 8),
  "mini-volley-stations-tournament: both minimum-layout scenes must show all eight players");
ok(miniTournamentScenes[0].court.length === 2 &&
  miniTournamentScenes[0].paths.filter((route) => (route.kind || "ball") !== "move").length === 2 &&
  [0, 5].every((courtStart) =>
    miniTournamentScenes[0].players.filter((player) =>
      player.x > courtStart && player.x < courtStart + 5).length === 4),
  "mini-volley-stations-tournament: minimum setup is not two simultaneous 2v2 mini-courts");
const miniRotationBindings = RR.drillAnimation.participantModelFor(
  RR.drills.find((drill) => drill.id === "mini-volley-stations-tournament"), miniTournamentScenes[1]
).moveBindings;
ok(miniTournamentScenes[1].paths.length === 4 && Object.keys(miniRotationBindings).length === 4 &&
  Object.values(miniRotationBindings).every((binding) => binding.source === "explicit") &&
  miniTournamentScenes[1].paths.every((route) => route.hideLabel),
  "mini-volley-stations-tournament: paired winner-up/non-winner-down rotation is not explicit");

function savedStepSceneMap(id) {
  const drill = RR.drills.find((item) => item.id === id);
  return RR.drillHumanMotion.programFor(drill, RR.drillAnimation.scenesFor(drill))
    .filter((step) => step.sourceStep >= 0).map((step) => step.sceneIndex);
}

function walkthroughSceneMap(id) {
  const drill = RR.drills.find((item) => item.id === id);
  return RR.drillHumanMotion.programFor(drill, RR.drillAnimation.scenesFor(drill))
    .map((step) => step.sceneIndex);
}

function productionProgram(id) {
  const drill = RR.drills.find((item) => item.id === id);
  const scenes = RR.drillAnimation.scenesFor(drill);
  const program = RR.drillHumanMotion.programFor(drill, scenes);
  return program.map((item, programIndex) => ({
    item,
    plan: RR.drillChoreography.planFor(drill, item.scene, item.instruction, {
      sceneIndex: item.sceneIndex,
      stepIndex: item.sourceStep >= 0 ? item.sourceStep : programIndex,
      sceneUsageCount: program.filter((entry) => entry.sceneIndex === item.sceneIndex).length,
      showFullScene: item.supplementalScene === true
    })
  }));
}

function semanticP0Plan(id, sourceStep) {
  const entry = productionProgram(id).find((candidate) => candidate.item.sourceStep === sourceStep);
  return entry && entry.plan;
}

function semanticP0Phases(plan) {
  return (plan && plan.beats || []).map((beat) => beat.motionId).filter((motionId, index, ids) =>
    index === 0 || motionId !== ids[index - 1]);
}

// Defensive mechanics must remain visually and semantically distinct. The
// reported regression came from a ready beat using a locomotion row whose
// third frame is a running drive step. These probes cover the resolver, the
// exact Down Balls program, floor saves, run-through saves, and true sprints.
const defensiveSemanticCases = [
  ["The defender digs the ball high to the middle.", ["dig"]],
  ["The defender stops and digs the down-ball high to the middle.", ["dig"]],
  ["The defender runs through the short ball and plays it up.", ["run-through"]],
  ["The defender pancakes the ball and sprawls safely.", ["one-arm-save"]],
  ["The athlete sprints five yards to the cone.", ["sprint"]]
];
const defensiveSemanticFailures = defensiveSemanticCases.filter(([instruction, expected]) =>
  JSON.stringify(Array.from(RR.drillChoreography.motionForText(instruction, {
    drill: { id: "defensive-semantic-probe", skill: "Defense" }, fallback: false
  }), (motion) => motion.id)) !== JSON.stringify(expected));
ok(defensiveSemanticCases.length === 5 && defensiveSemanticFailures.length === 0,
  `dig, run-through, sprawl, and sprint semantics collapsed together: ${
    defensiveSemanticFailures.map(([instruction]) => instruction).join(" | ")}`);
ok(RR.drillChoreography.motions["defensive-ready"].grid === "defensePro" &&
  RR.drillChoreography.motions["defensive-ready"].row === 0 &&
  RR.drillChoreography.motions["defensive-ready"].asset ===
    RR.drillChoreography.motions.dig.asset &&
  RR.drillChoreography.motions["defensive-ready"].animate === false &&
  RR.drillChoreography.motions["defensive-ready"].posterFrame === 0,
  "defensive ready still cycles through the locomotion row and visually breaks into a run");
ok(RR.drillChoreography.motions["down-ball-hit"].grid === "defensePro" &&
  RR.drillChoreography.motions["down-ball-hit"].row === 3 &&
  RR.drillChoreography.motions.dig.grid === "defensePro" &&
  RR.drillChoreography.grids.defensePro.asset ===
    "images/drill-motion/scene-defense-pro-grid.png" &&
  RR.drillChoreography.grids.defensePro.width === 1277 &&
  RR.drillChoreography.grids.defensePro.height === 1232,
  "professional defense grid is not mapped to ready, dig, and coach down-ball mechanics");

const downBallPlans = [0, 1, 2, 3].map((sourceStep) =>
  semanticP0Plan("digging-coach-down-balls", sourceStep));
ok(JSON.stringify(downBallPlans.map(semanticP0Phases)) === JSON.stringify([
  ["defensive-ready"], ["down-ball-hit"], ["dig"], ["shuffle"]
]),
  `Down Balls saved steps do not remain ready > coach attack > defender dig > three-player rotation: ${
    downBallPlans.map((plan) => semanticP0Phases(plan).join(">")).join(" | ")}`);

const downBallReady = downBallPlans[0];
const downBallReadyIds = downBallReady.beats.map((beat) =>
  authoredActorId(downBallReady, beat.actorId));
ok(downBallReady.beats.length === 3 &&
  JSON.stringify(downBallReadyIds) === JSON.stringify([
    "downball-left", "downball-middle", "downball-right"
  ]) && downBallReady.beats.every((beat) => beat.startMs === 0 &&
    beat.motionId === "defensive-ready" &&
    downBallReady.routes.find((route) => route.id === beat.routeId).type === "move"),
  "Down Balls does not show all three back-court defenders stopped and ready together");
const downBallDrill = RR.drills.find((drill) => drill.id === "digging-coach-down-balls");
const downBallReadyScene = RR.drillAnimation.scenesFor(downBallDrill)[downBallReady.sceneIndex];
const downBallReadyMarkup = RR.drillAnimation.renderSvg(downBallReadyScene,
  "down-ball-static-ready-audit", {}, downBallReady, downBallReady.beats);
ok((downBallReadyMarkup.match(/<foreignObject\b/g) || []).length === 4 &&
  (downBallReadyMarkup.match(/dam-scene-sprite is-performing/g) || []).length === 0 &&
  (downBallReadyMarkup.match(/scene-defense-pro-grid\.png/g) || []).length === 3 &&
  downBallReadyMarkup.includes('data-active-actors="3"') &&
  downBallReadyMarkup.includes('data-motion="defensive-ready"'),
  "stationary Down Balls ready phase still advances frames or drops a factual court actor");

const downBallAttack = downBallPlans[1];
const downBallAttackRecipients = ["downball-left", "downball-middle", "downball-right"];
ok(downBallAttack.contacts.length === 3 && downBallAttack.contacts.every((contact, index) =>
  contact.motionId === "down-ball-hit" &&
  authoredActorId(downBallAttack, contact.performerActorId) === "downball-coach" &&
  authoredActorId(downBallAttack, contact.recipientActorId) === downBallAttackRecipients[index]),
  "Down Balls coach attacks are not explicitly delivered to LB, MB, then RB");

const downBallDig = downBallPlans[2];
ok(downBallDig.contacts.length === 3 && downBallDig.contacts.every((contact, index) =>
  contact.motionId === "dig" &&
  authoredActorId(downBallDig, contact.performerActorId) === downBallAttackRecipients[index] &&
  !contact.recipientActorId && contact.recipientEndpoint &&
  contact.recipientEndpoint.type === "target"),
  "Down Balls digs are not owned by each defender and directed to the high middle target");

const downBallRotation = downBallPlans[3];
const downBallRotationIds = downBallRotation.beats.map((beat) =>
  authoredActorId(downBallRotation, beat.actorId));
ok(downBallRotation.beats.length === 3 &&
  JSON.stringify(downBallRotationIds) === JSON.stringify([
    "downball-left", "downball-middle", "downball-right"
  ]) && downBallRotation.beats.every((beat) => {
    const route = downBallRotation.routes.find((item) => item.id === beat.routeId);
    return beat.motionId === "shuffle" && beat.startMs === 0 && route &&
      route.type === "move" && route.authored.action === "shuffle" &&
      route.authored.simultaneousGroup === "downball-defender-rotation";
  }) && !downBallRotation.beats.some((beat) => beat.motionId === "sprint"),
  "Down Balls rotation does not move LB, MB, and RB together on factual shuffle routes");
ok(downBallPlans.every((plan) => plan.valid && plan.beats.every((beat) =>
  !/^(?:sprint|run-through|sprawl)$/.test(beat.motionId))),
  "Down Balls still substitutes running or an emergency floor move for a controlled dig");

const liberoRunThroughPlan = semanticP0Plan("libero-dig-and-run-through", 2);
const boundRunThroughBeat = liberoRunThroughPlan.beats.find((beat) => {
  const route = liberoRunThroughPlan.routes.find((item) => item.id === beat.routeId);
  return beat.motionId === "run-through" && route && route.type === "move";
});
ok(boundRunThroughBeat &&
  liberoRunThroughPlan.routes.find((route) => route.id === boundRunThroughBeat.routeId)
    .authored.label === "run through" &&
  !liberoRunThroughPlan.beats.some((beat) => beat.motionId === "sprint"),
  "libero run-through save is still rendered as a generic sprint or detached from its court route");

const pancakeSavePlan = semanticP0Plan("pancake-and-recover", 1);
const rollSprawlPlan = semanticP0Plan("rolls-and-sprawls", 1);
ok(pancakeSavePlan.beats.some((beat) => beat.motionId === "one-arm-save") &&
  !pancakeSavePlan.beats.some((beat) => beat.motionId === "sprawl") &&
  !pancakeSavePlan.beats.some((beat) => /^(?:sprint|run-through)$/.test(beat.motionId)) &&
  rollSprawlPlan.beats.some((beat) => beat.motionId === "shoulder-roll-right") &&
  rollSprawlPlan.beats.some((beat) => beat.motionId === "chest-hip-sprawl") &&
  !rollSprawlPlan.beats.some((beat) => /^(?:sprint|run-through|sprawl)$/.test(beat.motionId)),
  "pancake or authored roll/sprawl mechanics were rewritten as running or a generic floor move");

// Rolls & Sprawls is a four-step, one-athlete safety progression rather than a
// gallery of interchangeable stills. Every scene keeps the same coach and
// defender identities while the exact saved instruction selects a truthful
// segment of the progression.
const rollSprawlMotions = [
  "low-toss", "one-arm-save", "platform-save", "shoulder-roll-right",
  "shoulder-roll-left", "chest-hip-sprawl", "floor-recovery"
];
ok(rollSprawlMotions.every((motionId) => RR.drillChoreography.motions[motionId]) &&
  RR.drillChoreography.motions["shoulder-roll-left"].mirror === true &&
  RR.drillChoreography.motions["shoulder-roll-right"].direction === "right" &&
  RR.drillChoreography.motions["shoulder-roll-left"].direction === "left",
  "Rolls & Sprawls does not expose the seven CoachCam/fallback semantic phases");

const rollSprawlPlans = [0, 1, 2, 3].map((sourceStep) =>
  semanticP0Plan("rolls-and-sprawls", sourceStep));
const persistentRollActorIds = rollSprawlPlans.map((plan) =>
  plan.actors.filter((actor) => actor.authored &&
    /^(?:rolls-coach|rolls-defender)$/.test(actor.authored.id))
    .map((actor) => actor.id).sort().join("|"));
ok(JSON.stringify(savedStepSceneMap("rolls-and-sprawls")) === JSON.stringify([0, 1, 2, 3]) &&
  rollSprawlPlans.every((plan) => plan && plan.valid &&
    plan.actors.some((actor) => actor.authored && actor.authored.id === "rolls-coach") &&
    plan.actors.some((actor) => actor.authored && actor.authored.id === "rolls-defender") &&
    !plan.beats.some((beat) => /^(?:sprint|run-through|sprawl)$/.test(beat.motionId))) &&
  new Set(persistentRollActorIds).size === 1,
  "Rolls & Sprawls saved steps do not keep the persistent coach/defender on their authored scenes");

const rollSprawlExpectedPhases = [
  ["defensive-ready", "low-toss", "one-arm-save"],
  ["low-toss", "one-arm-save", "shoulder-roll-right", "floor-recovery",
    "low-toss", "platform-save", "chest-hip-sprawl"],
  ["floor-recovery", "defensive-ready"],
  ["low-toss", "one-arm-save", "shoulder-roll-right", "floor-recovery",
    "low-toss", "one-arm-save", "shoulder-roll-left", "floor-recovery",
    "low-toss", "platform-save", "chest-hip-sprawl", "floor-recovery",
    "low-toss", "platform-save", "chest-hip-sprawl", "floor-recovery"]
];
ok(JSON.stringify(rollSprawlPlans.map(semanticP0Phases)) ===
  JSON.stringify(rollSprawlExpectedPhases),
  `Rolls & Sprawls saved instructions lost their detailed phase order: ${
    rollSprawlPlans.map((plan) => semanticP0Phases(plan).join(">")).join(" | ")}`);

const rollSprawlReach = rollSprawlPlans[0];
ok(rollSprawlReach.contacts.length === 2 &&
  rollSprawlReach.contacts[0].motionId === "low-toss" &&
  authoredActorId(rollSprawlReach, rollSprawlReach.contacts[0].performerActorId) === "rolls-coach" &&
  rollSprawlReach.contacts[1].motionId === "one-arm-save" &&
  authoredActorId(rollSprawlReach, rollSprawlReach.contacts[1].performerActorId) === "rolls-defender" &&
  rollSprawlReach.contacts[1].recipientEndpoint &&
  rollSprawlReach.contacts[1].recipientEndpoint.type === "target",
  "Rolls & Sprawls first rep does not connect the coach's low toss to the defender's playable one-arm save");

const rollSprawlFloor = rollSprawlPlans[1];
const rightRollRoute = rollSprawlFloor.routes.find((route) =>
  route.authored && route.authored.action === "shoulder-roll-right");
const chestHipRoute = rollSprawlFloor.routes.find((route) =>
  route.authored && route.authored.action === "chest-hip-sprawl");
ok(rightRollRoute && rightRollRoute.actorId && rightRollRoute.authored.direction === "right" &&
  /never roll straight over the spine or neck/i.test(rightRollRoute.authored.safetyCue) &&
  chestHipRoute && chestHipRoute.actorId &&
  /head and neck clear/i.test(chestHipRoute.authored.safetyCue) &&
  /padded chest and hips/i.test(chestHipRoute.authored.bodyCue),
  "Rolls & Sprawls floor finishes do not carry the authored shoulder-path and chest/hip safety mechanics");

const rollSprawlRecovery = rollSprawlPlans[2];
ok(semanticP0Phases(rollSprawlRecovery).join(">") ===
  "floor-recovery>defensive-ready" &&
  rollSprawlRecovery.beats.every((beat) =>
    authoredActorId(rollSprawlRecovery, beat.actorId) === "rolls-defender"),
  "Rolls & Sprawls recovery does not return the same defender from the floor to a ready base");

const rollSprawlMastery = rollSprawlPlans[3];
const masteryMoveRoutes = rollSprawlMastery.routes.filter((route) => route.type === "move");
const masteryActions = masteryMoveRoutes.map((route) => route.authored.action);
ok(["right", "left"].every((direction) =>
  masteryMoveRoutes.some((route) => route.authored.action === "one-arm-save" &&
    route.authored.direction === direction) &&
  masteryMoveRoutes.some((route) => route.authored.action === "platform-save" &&
    route.authored.direction === direction)) &&
  ["shoulder-roll-right", "shoulder-roll-left"].every((action) =>
    masteryActions.includes(action)) &&
  masteryActions.filter((action) => action === "chest-hip-sprawl").length === 2 &&
  masteryActions.filter((action) => action === "floor-recovery").length === 4 &&
  rollSprawlMastery.contacts.filter((contact) => contact.motionId === "low-toss").length === 4 &&
  !rollSprawlMastery.beats.some((beat) => /^(?:sprint|run-through|sprawl)$/.test(beat.motionId)),
  "Rolls & Sprawls mastery loop does not show bilateral one-arm/platform saves, both shoulder rolls, two sprawls, and four recoveries");

const reactionSprintPlan = semanticP0Plan("reaction-sprint-starts", 1);
const serveSprintPlan = semanticP0Plan("serve-and-sprint", 1);
ok([reactionSprintPlan, serveSprintPlan].every((plan) =>
  plan.beats.some((beat) => beat.motionId === "sprint")),
  "legitimate sprint drills lost their running stride while defensive saves were corrected");

const semanticP0OrderCases = [
  ["transition-hitting-off-defense", 3, ["dig", "sprint", "set", "attack"]],
  ["libero-dig-and-run-through", 0, ["attack", "dig", "tip-roll", "run-through"]],
  ["libero-dig-and-run-through", 1, ["attack", "dig"]],
  ["libero-dig-and-run-through", 2, ["tip-roll", "run-through"]],
  ["libero-dig-and-run-through", 3, ["dig", "attack"]],
  ["pepper", 3, ["attack", "dig", "set", "attack"]],
  ["over-the-net-pepper", 0, ["pass", "set", "attack"]],
  ["over-the-net-pepper", 1, ["dig", "set", "attack"]],
  ["defensive-base-and-read", 3, ["attack", "dig", "admin"]],
  ["transition-dig-to-attack", 2,
    ["attack", "dig", "approach-jump", "set", "attack", "admin"]],
  ["transition-dig-to-attack", 3,
    ["attack", "dig", "approach-jump", "set", "attack", "admin"]],
  ["off-the-block-cover", 2, ["dig", "set", "attack"]],
  ["continuous-cross-court-control", 1,
    ["dig", "set", "attack", "dig", "set", "attack"]],
  ["defensive-pepper", 2, ["set", "attack"]],
  ["wall-set-and-pass-combo", 2, ["set", "pass"]],
  ["partner-pass-and-set-continuous", 2, ["pass", "set"]],
  ["bump-set-self-control", 1, ["set", "pass"]],
  ["jump-set-and-dump", 1, ["tip-roll"]],
  ["jump-set-and-dump", 2, ["set"]],
  ["jump-set-and-dump", 3, ["set", "tip-roll"]],
  ["shuttle-passing-to-target", 2, ["pass", "sprint"]],
  ["slide-approach-attack", 3, ["set", "approach-jump"]],
  ["attack-and-transition-to-defense", 2,
    ["set", "attack", "backpedal", "attack", "dig"]],
  ["setting-shuttle-relay", 1, ["set", "sprint", "set", "sprint"]],
  ["setter-release-from-base", 2, ["feed", "set", "sprint"]],
  ["ladder-to-dig-reaction", 3, ["ladder", "sprint", "feed", "dig", "sprint"]]
];
const semanticP0OrderFailures = semanticP0OrderCases.filter(([id, sourceStep, expected]) =>
  JSON.stringify(semanticP0Phases(semanticP0Plan(id, sourceStep))) !== JSON.stringify(expected));
ok(semanticP0OrderCases.length === 26 && semanticP0OrderFailures.length === 0,
  `reviewed drill mechanics are not in saved-instruction order: ${semanticP0OrderFailures.map(
    ([id, sourceStep, expected]) => `${id}#${sourceStep + 1}=>${semanticP0Phases(
      semanticP0Plan(id, sourceStep)).join(">")}, expected ${expected.join(">")}`).join("; ")}`);

const completeCycleOrderCases = [
  ["transition-dig-to-attack", 1,
    ["attack", "dig", "approach-jump", "set", "attack"]],
  ["approach-timing-off-the-pass", 2, ["pass", "approach-jump", "set", "attack"]],
  ["approach-timing-off-the-pass", 3, ["pass", "approach-jump", "set", "attack"]],
  ["middle-quick-attack", 0, ["approach-jump", "set"]],
  ["middle-quick-attack", 3, ["pass", "set", "attack"]],
  ["hitting-from-all-positions", 2, ["set", "approach-jump", "attack"]],
  ["hitting-from-all-positions", 3, ["set", "approach-jump", "attack", "admin"]]
];
const completeCycleOrderFailures = completeCycleOrderCases.filter(([id, sourceStep, expected]) =>
  JSON.stringify(semanticP0Phases(semanticP0Plan(id, sourceStep))) !== JSON.stringify(expected));
ok(completeCycleOrderCases.length === 7 && completeCycleOrderFailures.length === 0,
  `complete drill cycles still omit or misorder mechanics: ${completeCycleOrderFailures.map(
    ([id, sourceStep, expected]) => `${id}#${sourceStep + 1}=>${semanticP0Phases(
      semanticP0Plan(id, sourceStep)).join(">")}, expected ${expected.join(">")}`).join("; ")}`);

const synchronizedSetApproachCases = [
  ["middle-quick-attack", 0, "middle-rises-on-release"],
  ["back-row-attack-pipe", 1, "pipe-set-and-approach"],
  ["back-row-attack-pipe", 2, "pipe-set-and-approach"],
  ["hitting-from-all-positions", 2, "pipe-set-and-approach"]
];
const unsynchronizedSetApproachCases = synchronizedSetApproachCases.filter(([id, sourceStep, group]) => {
  const beats = semanticP0Plan(id, sourceStep).beats.filter((beat) =>
    beat.motionId === "set" || beat.motionId === "approach-jump");
  return beats.length !== 2 || beats.some((beat) =>
    beat.startMs !== 0 || beat.simultaneousGroup !== group) ||
    new Set(beats.map((beat) => beat.actorId)).size !== 2;
});
ok(synchronizedSetApproachCases.length === 4 && unsynchronizedSetApproachCases.length === 0,
  `setter release and hitter takeoff are not synchronized: ${unsynchronizedSetApproachCases.map(
    ([id, sourceStep]) => `${id}#${sourceStep + 1}`).join(", ")}`);

function beatActorSequence(plan) {
  return (plan && plan.beats || []).map((beat) => authoredActorId(plan, beat.actorId));
}
const transitionCounterPlan = semanticP0Plan("transition-dig-to-attack", 1);
const timedApproachPlan = semanticP0Plan("approach-timing-off-the-pass", 2);
const attackDefendCyclePlan = semanticP0Plan("attack-and-transition-to-defense", 2);
const pipeCyclePlan = semanticP0Plan("hitting-from-all-positions", 2);
ok(JSON.stringify(beatActorSequence(transitionCounterPlan)) === JSON.stringify([
  "dig-counter-coach", "dig-counter-defender", "dig-counter-hitter",
  "dig-counter-setter", "dig-counter-hitter"
]) && JSON.stringify(beatActorSequence(timedApproachPlan)) === JSON.stringify([
  "timing-live-passer", "approach-hitter", "approach-setter", "approach-hitter"
]) && JSON.stringify(beatActorSequence(attackDefendCyclePlan)) === JSON.stringify([
  "attack-transition-setter", "attack-transition-hitter", "attack-transition-hitter",
  "attack-transition-coach", "attack-transition-hitter"
]) && JSON.stringify(beatActorSequence(pipeCyclePlan)) === JSON.stringify([
  "all-positions-pipe-setter", "all-positions-pipe-hitter", "all-positions-pipe-hitter"
]),
  "full-cycle mechanics are assigned to the wrong coach, passer, setter, hitter, or defender");

const semanticP0ContactCases = [
  ["overhead-emergency-pass", 0, ["serve", "pass"]],
  ["mid-court-passing-decision", 1, ["serve", "pass"]],
  ["roll-the-ball-dig", 0, ["feed", "dig"]],
  ["libero-dig-and-run-through", 1, ["attack", "dig"]],
  ["libero-dig-and-run-through", 2, ["tip-roll", "run-through"]],
  ["wall-set-and-pass-combo", 2, ["set", "pass"]],
  ["jump-set-and-dump", 1, ["tip-roll", "set"]],
  ["setter-release-from-base", 2, ["feed", "set"]],
  ["ladder-to-dig-reaction", 3, ["feed", "dig"]]
];
const semanticP0ContactFailures = semanticP0ContactCases.filter(([id, sourceStep, expected]) => {
  const plan = semanticP0Plan(id, sourceStep);
  return JSON.stringify((plan && plan.contacts || []).map((contact) => contact.motionId)) !==
    JSON.stringify(expected);
});
ok(semanticP0ContactCases.length === 9 && semanticP0ContactFailures.length === 0,
  `reviewed factual contacts still use receiver/admin fallbacks: ${semanticP0ContactFailures.map(
    ([id, sourceStep]) => `${id}#${sourceStep + 1}`).join(", ")}`);

const semanticP0OwnershipCases = [
  ["overhead-emergency-pass", 0, "serve", false],
  ["roll-the-ball-dig", 0, "feed", true],
  ["libero-dig-and-run-through", 1, "attack", true],
  ["libero-dig-and-run-through", 1, "dig", false]
];
const semanticP0OwnershipFailures = semanticP0OwnershipCases.filter(([id, sourceStep, motionId, support]) => {
  const plan = semanticP0Plan(id, sourceStep);
  const contact = plan && plan.contacts.find((candidate) => candidate.motionId === motionId);
  const performer = contact && plan.actors.find((actor) => actor.id === contact.performerActorId);
  const supportLike = performer && (performer.support ||
    /\b(?:coach|feeder|tosser)\b|^c$/i.test([
      performer.label, performer.role, performer.note,
      performer.authored && performer.authored.id,
      performer.authored && performer.authored.role
    ].filter(Boolean).join(" ")));
  return !contact || !performer || supportLike !== support;
});
ok(semanticP0OwnershipCases.length === 4 && semanticP0OwnershipFailures.length === 0,
  `reviewed coach/server deliveries or receiver contacts have the wrong performer: ${
    semanticP0OwnershipFailures.map(([id, sourceStep, motionId]) =>
      `${id}#${sourceStep + 1}:${motionId}`).join(", ")}`);

const middleQuickAuthoredPlan = semanticP0Plan("middle-quick-attack", 2);
ok(JSON.stringify(semanticP0Phases(middleQuickAuthoredPlan)) ===
  JSON.stringify(["pass", "set", "attack"]) &&
  JSON.stringify(middleQuickAuthoredPlan.beats.map((beat) => {
    const contact = middleQuickAuthoredPlan.contacts.find((item) => item.id === beat.contactId);
    return contact && contact.authoredOrder;
  })) === JSON.stringify([1, 2, 3]),
  "authored contact order is still overridden by visual path-array order");

const mirrorMovementPlan = semanticP0Plan("mirror-blocking", 0);
const mirrorSwitchPlan = semanticP0Plan("mirror-blocking", 3);
ok(mirrorMovementPlan.beats.length === 2 &&
  mirrorMovementPlan.beats.every((beat) => beat.motionId === "shuffle" && beat.startMs === 0) &&
  new Set(mirrorMovementPlan.beats.map((beat) => beat.actorId)).size === 2 &&
  JSON.stringify(semanticP0Phases(mirrorSwitchPlan)) === JSON.stringify(["admin"]),
  "mirror-blocking does not show two simultaneous shufflers followed by an administrative leader switch");

const reactionSprintDrill = RR.drills.find((drill) => drill.id === "reaction-sprint-starts");
const reactionSprintScenes = RR.drillAnimation.scenesFor(reactionSprintDrill);
const reactionSprintSceneActors = [
  [
    ["reaction-caller", "signal partner", 4.5, 2.15, "south"],
    ["reaction-runner", "reacting sprinter", 4.5, 8, "north"]
  ],
  [
    ["reaction-caller", "signal partner", 1.35, 2.4, "south"],
    ["reaction-runner", "reacting sprinter", 1.35, 6.25, "east"]
  ]
];
ok(reactionSprintScenes.length === 2 && reactionSprintScenes.every((scene, sceneIndex) =>
  scene.players.length === 2 &&
  JSON.stringify(scene.players.map((player) =>
    [player.id, player.role, player.x, player.y, player.facing])) ===
    JSON.stringify(reactionSprintSceneActors[sceneIndex])),
  "reaction-sprint-starts: stable cue/runner identities are not in their scene-specific start positions and facings");
ok(reactionSprintScenes[0].signals.length === 1 &&
  reactionSprintScenes[0].signals[0].actor === "reaction-caller" &&
  reactionSprintScenes[0].signals[0].receiver === "reaction-runner" &&
  JSON.stringify(reactionSprintScenes[0].signals[0].choices) ===
    JSON.stringify(["clap", "whistle", "hand drop"]),
  "reaction-sprint-starts: the randomized cue is not explicitly sent from caller to runner");
const reactionSprintRoute = reactionSprintScenes[1].paths[0];
ok(reactionSprintScenes[1].paths.length === 1 && reactionSprintRoute.kind === "move" &&
  reactionSprintRoute.actor === "reaction-runner" && reactionSprintRoute.playerIndex === 1 &&
  (reactionSprintRoute.via || []).length === 2 &&
  reactionSprintRoute.to[0] > reactionSprintRoute.from[0] + 5 &&
  Math.abs(reactionSprintRoute.to[1] - reactionSprintRoute.from[1]) < 0.01 &&
  /REACT.*3 LOW DRIVE STEPS.*5 YARDS/.test(reactionSprintRoute.label) &&
  JSON.stringify(reactionSprintRoute.startVariants) ===
    JSON.stringify(["forward-facing", "side-facing", "backward-facing"]),
  "reaction-sprint-starts: runner is not bound to the full reaction-drive-acceleration route and start variants");
ok(JSON.stringify(savedStepSceneMap("reaction-sprint-starts")) === JSON.stringify([0, 1, 1, 1]),
  "reaction-sprint-starts: saved instructions do not advance from the cue phase to the sprint phase");

const passSetHitDrill = RR.drills.find((drill) => drill.id === "pass-set-hit-triangle");
const passSetHitScenes = RR.drillAnimation.scenesFor(passSetHitDrill);
const passSetHitActorIds = ["psh-coach", "psh-setter", "psh-passer", "psh-hitter", "psh-shagger"];
ok(passSetHitScenes.length === 2 && passSetHitScenes.every((scene) =>
  scene.players.length === 5 &&
  JSON.stringify(scene.players.map((player) => player.id)) === JSON.stringify(passSetHitActorIds) &&
  scene.players.every((player) => player.role && player.facing)),
  "pass-set-hit-triangle: coach plus all four stable athlete jobs are not present in both phases");
const passSetHitComplete = passSetHitScenes[1];
ok(JSON.stringify(passSetHitComplete.motionChains) === JSON.stringify([[0, 1, 2, 3]]) &&
  JSON.stringify(passSetHitComplete.paths.slice(0, 4).map((route) =>
    [route.fromActor, route.toActor])) === JSON.stringify([
    ["psh-coach", "psh-passer"],
    ["psh-passer", "psh-setter"],
    ["psh-setter", "psh-hitter"],
    ["psh-hitter", "psh-shagger"]
  ]) &&
  JSON.stringify(passSetHitComplete.contacts.map((contact) =>
    [contact.order, contact.actor, contact.action, contact.pathIndex])) === JSON.stringify([
    [1, "psh-coach", "free-ball toss", 0],
    [2, "psh-passer", "forearm pass", 1],
    [3, "psh-setter", "outside set", 2],
    [4, "psh-hitter", "attack", 3]
  ]),
  "pass-set-hit-triangle: one shared ball does not preserve the complete free-ball-pass-set-hit contact order");
const passSetHitBindings = RR.drillAnimation.participantModelFor(
  passSetHitDrill, passSetHitComplete
).moveBindings;
ok(JSON.stringify(passSetHitComplete.paths.slice(4).map((route) =>
  [route.actor, route.playerIndex])) === JSON.stringify([
  ["psh-hitter", 3], ["psh-passer", 2], ["psh-shagger", 4]
]) && [4, 5, 6].every((pathIndex) =>
  passSetHitBindings[pathIndex] && passSetHitBindings[pathIndex].source === "explicit" &&
  passSetHitBindings[pathIndex].player.id === passSetHitComplete.paths[pathIndex].actor),
  "pass-set-hit-triangle: hitter, passer, and shagger are not explicitly bound to their post-contact job rotation");
ok(JSON.stringify(savedStepSceneMap("pass-set-hit-triangle")) === JSON.stringify([0, 1, 1, 1]),
  "pass-set-hit-triangle: saved instructions do not advance into the complete contact-and-rotation phase");
const passSetHitGenerated = generatedPlan(
  passSetHitDrill, passSetHitComplete, passSetHitDrill.steps[1], 1, 1
);
ok(passSetHitGenerated.valid &&
  JSON.stringify(passSetHitGenerated.contacts.map((contact) => [
    contact.order + 1,
    contact.authoredOrder,
    contact.sourcePathIndex,
    contact.authoredAction,
    authoredActorId(passSetHitGenerated, contact.sourceActorId),
    authoredActorId(passSetHitGenerated, contact.recipientActorId),
    contact.sourceBindingSource,
    contact.recipientBindingSource,
    contact.motionId
  ])) === JSON.stringify([
    [1, 1, 0, "free-ball toss", "psh-coach", "psh-passer", "authored-contact-actor", "authored-path-toActor", "feed"],
    [2, 2, 1, "forearm pass", "psh-passer", "psh-setter", "authored-contact-actor", "authored-path-toActor", "pass"],
    [3, 3, 2, "outside set", "psh-setter", "psh-hitter", "authored-contact-actor", "authored-path-toActor", "set"],
    [4, 4, 3, "attack", "psh-hitter", "psh-shagger", "authored-contact-actor", "authored-path-toActor", "attack"]
  ]),
  "pass-set-hit-triangle: generated choreography does not honor every authored contact, endpoint actor, action, and path in order");

const butterflyDrill = RR.drills.find((drill) => drill.id === "butterfly-passing");
const butterflyScenes = RR.drillAnimation.scenesFor(butterflyDrill);
const butterflyRoles = [
  ["butterfly-server", "current server", "north"],
  ["butterfly-next-server", "next server", "north"],
  ["butterfly-passer", "current passer", "south"],
  ["butterfly-next-passer", "next passer", "south"],
  ["butterfly-target", "setter target", "southwest"],
  ["butterfly-shagger", "shagger", "north"]
];
ok(butterflyScenes.length === 2 && butterflyScenes.every((scene) =>
  scene.players.length === 6 &&
  JSON.stringify(scene.players.map((player) => [player.id, player.role, player.facing])) ===
    JSON.stringify(butterflyRoles)),
  "butterfly-passing: both phases do not preserve all six exact continuous jobs");
const butterflyBallScene = butterflyScenes[0];
const butterflyReturnVia = butterflyBallScene.paths[1].via || [];
ok(JSON.stringify(butterflyBallScene.motionChains) === JSON.stringify([[0, 1]]) &&
  butterflyBallScene.paths.length === 2 &&
  butterflyReturnVia.some((point) => point[0] === 7 && point[1] === 1.8) &&
  butterflyReturnVia.some((point) => point[0] === 7.75 && point[1] === 3) &&
  JSON.stringify(butterflyBallScene.contacts.map((contact) =>
    [contact.order, contact.actor, contact.action, contact.pathIndex])) === JSON.stringify([
    [1, "butterfly-server", "serve", 0],
    [2, "butterfly-passer", "forearm pass", 1],
    [3, "butterfly-target", "catch or set", 1],
    [4, "butterfly-shagger", "retrieve and return", 1]
  ]),
  "butterfly-passing: the shared ball does not visibly complete serve, pass, target control, shag, and sideline return");
const butterflyMoveScene = butterflyScenes[1];
const butterflyBindings = RR.drillAnimation.participantModelFor(
  butterflyDrill, butterflyMoveScene
).moveBindings;
ok(butterflyMoveScene.paths.length === 6 &&
  butterflyMoveScene.paths.every((route) => route.kind === "move" && route.actor) &&
  new Set(butterflyMoveScene.paths.map((route) => route.actor)).size === 6 &&
  Object.keys(butterflyBindings).length === 6 &&
  butterflyMoveScene.paths.every((route, pathIndex) =>
    butterflyBindings[pathIndex] && butterflyBindings[pathIndex].source === "explicit" &&
    butterflyBindings[pathIndex].player.id === route.actor),
  "butterfly-passing: all six athletes are not explicitly bound to distinct next-job routes");
ok(JSON.stringify(savedStepSceneMap("butterfly-passing")) === JSON.stringify([0, 0, 0, 1]),
  "butterfly-passing: saved instructions do not hold the full ball chain before the six-job rotation");
const butterflyGenerated = generatedPlan(
  butterflyDrill, butterflyBallScene, butterflyDrill.steps[1], 0, 1
);
ok(butterflyGenerated.valid &&
  JSON.stringify(butterflyGenerated.contacts.map((contact) => [
    contact.order + 1,
    contact.sourcePathIndex,
    contact.segmentIndex,
    contact.authoredAction,
    authoredActorId(butterflyGenerated, contact.sourceActorId),
    authoredActorId(butterflyGenerated, contact.recipientActorId),
    contact.motionId,
    contact.via.length
  ])) === JSON.stringify([
    [1, 0, 0, "serve", "butterfly-server", "butterfly-passer", "serve", 0],
    [2, 1, 0, "forearm pass", "butterfly-passer", "butterfly-target", "pass", 1],
    [3, 1, 1, "catch or set", "butterfly-target", "butterfly-shagger", "set", 0],
    [4, 1, 2, "retrieve and return", "butterfly-shagger", "butterfly-next-server", "sprint", 2]
  ]) &&
  butterflyGenerated.contacts.slice(1, 3)
    .every((contact) => contact.recipientBindingSource === "authored-contact-chain") &&
  butterflyGenerated.contacts[3].recipientBindingSource === "authored-path-toActor",
  "butterfly-passing: generated shared-ball choreography skips or misbinds pass, target control, shag, or sideline return");

const butterflyProduction = productionProgram("butterfly-passing");
const butterflyReturnPlan = butterflyProduction.find(({ item }) => item.sourceStep === 2).plan;
const butterflyRotatePlan = butterflyProduction.find(({ item }) => item.sourceStep === 3).plan;
ok(JSON.stringify(butterflyReturnPlan.beats.map((beat) => beat.motionId)) ===
  JSON.stringify(["pass", "set", "sprint"]) &&
  authoredActorId(butterflyReturnPlan, butterflyReturnPlan.beats[2].actorId) === "butterfly-shagger",
  "butterfly-passing: target control does not visibly continue through the shagger's same-ball return");
ok(butterflyRotatePlan.beats.length === 6 &&
  butterflyRotatePlan.beats.every((beat) => beat.startMs === 0 &&
    beat.simultaneousGroup === "all-six-advance") &&
  new Set(butterflyRotatePlan.beats.map((beat) => authoredActorId(
    butterflyRotatePlan, beat.actorId))).size === 6,
  "butterfly-passing: all six role changes are not shown as one synchronized rotation");

const passSetHitProduction = productionProgram("pass-set-hit-triangle");
const passSetHitRotationPlan = passSetHitProduction.find(({ item }) => item.sourceStep === 2).plan;
ok(passSetHitRotationPlan.beats.slice(0, 3).every((beat) =>
  beat.startMs === 0 && beat.motionId === "sprint" &&
  beat.simultaneousGroup === "post-rep-job-change") &&
  JSON.stringify(passSetHitRotationPlan.beats.slice(0, 3).map((beat) =>
    authoredActorId(passSetHitRotationPlan, beat.actorId))) ===
    JSON.stringify(["psh-hitter", "psh-passer", "psh-shagger"]),
  "pass-set-hit-triangle: hitter, passer, and shagger do not change jobs together after contact");

const rotationOffenseDrill = RR.drills.find((drill) => drill.id === "run-the-rotation-offense");
const rotationOffenseScenes = RR.drillAnimation.scenesFor(rotationOffenseDrill);
const rotationPositions = ["P1", "P6", "P5", "P4", "P3", "P2"];
const rotationAthleteRoles = [
  ["rotation-setter", "setter"],
  ["rotation-outside-1", "outside hitter 1"],
  ["rotation-middle-1", "middle blocker 1"],
  ["rotation-opposite", "opposite"],
  ["rotation-outside-2", "outside hitter 2"],
  ["rotation-middle-2", "middle blocker 2"]
];
ok(rotationOffenseScenes.length === 6 && rotationOffenseScenes.every((scene) => {
  const athletes = scene.players.filter((player) => player.team === "a");
  return scene.players.length === 7 && athletes.length === 6 &&
    JSON.stringify(athletes.map((player) => [player.id, player.role])) ===
      JSON.stringify(rotationAthleteRoles) &&
    athletes.every((player) => player.facing === "north");
}),
  "run-the-rotation-offense: each state does not preserve the coach and exact six-player 5-1 lineup");
ok(rotationOffenseScenes.every((scene) =>
  scene.legalOrder.length === 6 &&
  JSON.stringify(scene.legalOrder.map((entry) => entry.position)) === JSON.stringify(rotationPositions) &&
  new Set(scene.legalOrder.map((entry) => entry.actor)).size === 6 &&
  scene.legalOrder.every((entry) => {
    const athlete = scene.players.find((player) => player.id === entry.actor);
    return athlete && athlete.courtPosition === entry.position && athlete.role === entry.role;
  })),
  "run-the-rotation-offense: one or more scenes is not a complete legal six-position state");
ok(JSON.stringify(rotationOffenseScenes.map((scene) =>
  scene.players.find((player) => player.id === "rotation-setter").courtPosition)) ===
  JSON.stringify(rotationPositions),
  "run-the-rotation-offense: setter does not progress through P1-P6-P5-P4-P3-P2");
ok(rotationOffenseScenes.every((scene) =>
  JSON.stringify(scene.motionChains) === JSON.stringify([[0, 1, 2, 3]]) &&
  scene.contacts.length === 4 &&
  JSON.stringify(scene.contacts.map((contact) => contact.action)) ===
    JSON.stringify(["controlled toss", "forearm pass", "planned set", "front-row attack"]) &&
  scene.contacts.every((contact) =>
    contact.pathIndex === contact.order - 1 &&
    contact.actor === scene.paths[contact.pathIndex].fromActor) &&
  scene.paths[4].kind === "move" && scene.paths[4].actor === "rotation-setter" &&
  scene.paths[4].playerIndex === 1),
  "run-the-rotation-offense: a legal state lost its controlled pass-set-attack chain or setter release");
ok(rotationOffenseScenes.every((scene, sceneIndex) => {
  const nextScene = rotationOffenseScenes[(sceneIndex + 1) % rotationOffenseScenes.length];
  return scene.nextRotation.length === 6 &&
    new Set(scene.nextRotation.map((route) => route.actor)).size === 6 &&
    scene.nextRotation.every((route) => {
      const currentActor = scene.players.find((player) => player.id === route.actor);
      const nextActor = nextScene.players.find((player) => player.id === route.actor);
      return currentActor && nextActor && route.kind === "move" &&
        route.from[0] === currentActor.x && route.from[1] === currentActor.y &&
        route.to[0] === nextActor.x && route.to[1] === nextActor.y;
    });
}),
  "run-the-rotation-offense: six actor-bound clockwise transitions do not connect every legal state");
ok(rotationOffenseScenes.every((scene, sceneIndex) => {
  const plan = generatedPlan(
    rotationOffenseDrill, scene, rotationOffenseDrill.steps[1], sceneIndex, 1
  );
  const sources = plan.contacts.map((contact) => authoredActorId(plan, contact.sourceActorId));
  const expectedSources = scene.contacts.map((contact) => contact.actor);
  const recipients = plan.contacts.slice(0, 3)
    .map((contact) => authoredActorId(plan, contact.recipientActorId));
  const expectedRecipients = scene.paths.slice(0, 3).map((path) => path.toActor);
  return plan.valid && plan.contacts.length === 4 &&
    JSON.stringify(sources) === JSON.stringify(expectedSources) &&
    JSON.stringify(recipients) === JSON.stringify(expectedRecipients) &&
    JSON.stringify(plan.contacts.map((contact) => contact.authoredOrder)) ===
      JSON.stringify([1, 2, 3, 4]) &&
    JSON.stringify(plan.contacts.map((contact) => contact.sourcePathIndex)) ===
      JSON.stringify([0, 1, 2, 3]) &&
    plan.contacts.every((contact) => contact.sourceBindingSource === "authored-contact-actor") &&
    plan.contacts.slice(0, 3)
      .every((contact) => contact.recipientBindingSource === "authored-path-toActor") &&
    JSON.stringify(plan.contacts.map((contact) => contact.motionId)) ===
      JSON.stringify(["feed", "pass", "set", "attack"]);
}),
  "run-the-rotation-offense: generated plans do not preserve the exact coach-passer-setter-attacker chain in all six legal rotations");
ok(JSON.stringify(savedStepSceneMap("run-the-rotation-offense")) === JSON.stringify([0, 0, 1, 5]),
  "run-the-rotation-offense: saved instructions do not progress from Rotation 1 through Rotation 6");
const rotationWalkthroughScenes = walkthroughSceneMap("run-the-rotation-offense");
ok(JSON.stringify(rotationWalkthroughScenes) === JSON.stringify([0, 0, 1, 2, 3, 4, 5]) &&
  JSON.stringify(Array.from(new Set(rotationWalkthroughScenes))) === JSON.stringify([0, 1, 2, 3, 4, 5]),
  "run-the-rotation-offense: all six exact legal formations are not reachable in authored order");

ok(rotationOffenseScenes.every((scene) =>
  Object.keys(scene.offenseBases || {}).length === 6 && scene.paths.length === 16 &&
  scene.paths.slice(4, 10).every((route) =>
    route.kind === "move" && route.simultaneousGroup === "ball-in-and-offense-release") &&
  scene.paths.slice(10).every((route) =>
    route.kind === "move" && route.simultaneousGroup === "clockwise-next-rotation")),
  "run-the-rotation-offense: legal starts do not include six-person offensive releases and six-person next-rotation routes");
const rotationProduction = productionProgram("run-the-rotation-offense");
const rotationMechanicalPlans = rotationProduction.filter(({ item }) => item.sourceStep !== 0);
ok(rotationMechanicalPlans.length === 6 && rotationMechanicalPlans.every(({ item, plan }) => {
  const release = plan.beats.filter((beat) => beat.simultaneousGroup === "ball-in-and-offense-release");
  const attack = plan.beats.find((beat) => beat.motionId === "attack");
  const scene = item.scene;
  const expectedAttacker = scene.contacts[3].actor;
  return release.length === 7 && release.every((beat) => beat.startMs === 0) &&
    new Set(release.filter((beat) => beat.source === "movement-route")
      .map((beat) => authoredActorId(plan, beat.actorId))).size === 6 &&
    attack && authoredActorId(plan, attack.actorId) === expectedAttacker &&
    JSON.stringify(plan.contacts[3].from) === JSON.stringify(scene.offenseBases[expectedAttacker]);
}),
  "run-the-rotation-offense: coach ball, all six releases, and the eligible front-row finish are not synchronized in every rotation");
ok(rotationProduction.filter(({ item }) => item.sourceStep === 2 || item.sourceStep === 3 ||
  item.supplementalScene).every(({ plan }) => {
  const advance = plan.beats.filter((beat) => beat.simultaneousGroup === "clockwise-next-rotation");
  return advance.length === 6 && new Set(advance.map((beat) => beat.startMs)).size === 1 &&
    new Set(advance.map((beat) => authoredActorId(plan, beat.actorId))).size === 6;
}),
  "run-the-rotation-offense: all six athletes do not advance clockwise together after each completed rep");

const passSetHitMotions = RR.drillChoreography.motionForText(
  "The passer passes to the setter, the setter sets outside, and the hitter attacks.",
  { fallback: false }
).map((motion) => motion.id);
ok(JSON.stringify(passSetHitMotions) === JSON.stringify(["pass", "set", "attack"]),
  "choreography: compound pass-set-hit instruction is not returned as three ordered human motions");

const settingActionProbes = [
  ["self-toss-ball-handling", 4],
  ["wall-setting", 1],
  ["wall-setting", 3],
  ["setter-footwork-to-target", 2],
  ["set-and-sit", 1],
  ["one-knee-setting-form", 2],
  ["wall-set-and-pass-combo", 1],
  ["setting-shuttle-relay", 1],
  ["catch-and-set-progression", 3]
];
const brokenSettingActions = settingActionProbes.filter(([id, stepNumber]) => {
  const drill = RR.drills.find((item) => item.id === id);
  const motions = RR.drillChoreography.motionForText(drill.steps[stepNumber - 1], {
    drill,
    fallback: false
  }).map((motion) => motion.id);
  return !motions.includes("set") || motions.includes("admin");
});
ok(settingActionProbes.length === 9 && brokenSettingActions.length === 0,
  `setting sanitizer rewrote overhead ball actions as equipment setup: ${brokenSettingActions.map((item) => item.join("#")).join(", ")}`);

const reviewedPhysicalSteps = [
  ["self-toss-ball-handling", 4], ["wall-setting", 1], ["wall-setting", 3],
  ["setter-footwork-to-target", 2], ["ball-handling-relay", 3],
  ["catch-and-set-progression", 1], ["catch-and-set-progression", 2],
  ["catch-and-set-progression", 3], ["mirror-defensive-shuffle", 2],
  ["mirror-defensive-shuffle", 3], ["digging-coach-down-balls", 1],
  ["rolls-and-sprawls", 1], ["free-ball-transition", 1], ["swing-blocking", 2],
  ["swing-blocking", 3], ["swing-blocking", 4], ["quadrant-reaction-footwork", 3],
  ["net-shuffle-footwork-youth", 4], ["right-side-back-set-footwork", 1],
  ["off-the-block-cover", 2], ["partner-pass-and-move-warmup", 1],
  ["wall-forearm-passing", 1], ["reaction-ball-quickness", 1],
  ["reaction-ball-quickness", 2], ["reaction-ball-quickness", 3],
  ["partner-toss-mirror", 1], ["speedball", 2], ["passing-on-the-move", 1],
  ["transition-setting-back-row", 1], ["rapid-fire-control", 2],
  ["defensive-ready-reaction-game", 2], ["defensive-ready-reaction-game", 3],
  ["reaction-ball-scramble", 2], ["reaction-ball-scramble", 3],
  ["pancake-and-recover", 2], ["reach-over-the-net", 2], ["reach-over-the-net", 3],
  ["bodyweight-shoulder-activation", 2], ["bodyweight-shoulder-activation", 3],
  ["passing-box-drill", 3], ["roll-the-ball-dig", 1], ["roll-the-ball-dig", 2],
  ["roll-the-ball-dig", 3], ["roll-the-ball-dig", 4],
  ["mini-court-cooperative-rally", 2], ["bonus-ball-scramble", 3],
  ["team-circle-recovery", 1], ["team-circle-recovery", 2],
  ["shepherd-and-sheep", 1], ["shepherd-and-sheep", 2]
];
const residualPhysicalAdmin = reviewedPhysicalSteps.filter(([id, stepNumber]) => {
  const drill = RR.drills.find((item) => item.id === id);
  const ids = RR.drillChoreography.motionForText(drill.steps[stepNumber - 1], {
    drill,
    fallback: false
  }).map((motion) => motion.id);
  return !ids.length || ids.every((motionId) => motionId === "admin");
});
ok(reviewedPhysicalSteps.length === 50,
  `reviewed physical-step audit changed size: ${reviewedPhysicalSteps.length}`);
ok(residualPhysicalAdmin.length === 0,
  `reviewed physical steps still resolve only to admin: ${residualPhysicalAdmin.map((item) => item.join("#")).join(", ")}`);

const completedPhysicalStepCases = [
  ["pursuit-emergency-defense", 1, ["feed"]],
  ["pursuit-emergency-defense", 2, ["sprint", "dig"]],
  ["pursuit-emergency-defense", 3, ["dig"]],
  ["close-range-reaction-digging", 1, ["defensive-ready"]],
  ["close-range-reaction-digging", 2, ["feed"]],
  ["out-of-system-passing", 2, ["pass"]],
  ["libero-serve-receive-range", 2, ["serve"]],
  ["two-person-serve-receive", 3, ["pass", "shuffle"]],
  ["tempo-setting", 4, ["set"]],
  ["middle-blocker-read-close", 1, ["defensive-ready"]],
  ["middle-blocker-read-close", 4, ["set", "shuffle", "block", "admin"]],
  ["bump-set-self-control", 3, ["shuffle"]],
  ["set-and-sit", 3, ["shuffle"]],
  ["bounce-and-dig", 1, ["feed"]],
  ["bounce-and-dig", 3, ["dig"]],
  ["block-jump-and-land", 1, ["ready"]],
  ["block-jump-and-land", 3, ["ready"]],
  ["block-jump-and-land", 4, ["jump", "block", "ready"]],
  ["standing-spike-target", 2, ["attack"]],
  ["toss-and-pass-intro", 2, ["feed"]],
  ["deep-ball-backpedal-passing", 1, ["serve"]],
  ["w-formation-serve-receive", 3, ["pass", "shuffle"]],
  ["one-knee-setting-form", 3, ["set"]],
  ["setter-triangle-continuous", 4, ["set"]],
  ["toss-and-tip", 3, ["tip-roll"]],
  ["toss-and-tip", 4, ["tip-roll"]],
  ["commit-block-the-middle", 1, ["defensive-ready"]],
  ["commit-block-the-middle", 4, ["defensive-ready"]],
  ["partner-catch-bump-control", 3, ["pass"]],
  ["hitting-off-a-bad-set", 2, ["approach-jump", "attack"]],
  ["serve-receive-vs-jump-serve", 3, ["pass"]],
  ["hybrid-serve-mix", 2, ["serve"]],
  ["collapse-dig-and-recover", 1, ["attack"]],
  ["collapse-dig-and-recover", 3, ["dig", "ready"]],
  ["ladder-to-dig-reaction", 3, ["feed"]],
  ["pass-to-the-hoop-target", 2, ["feed"]],
  ["hit-the-target-zones", 3, ["approach-jump", "attack"]],
  ["butterfly-pepper", 4, ["set", "attack", "admin"]],
  ["defensive-pepper", 1, ["attack", "dig", "set"]]
];
const completedPhysicalStepFailures = completedPhysicalStepCases.filter(([id, stepNumber, expected]) => {
  const drill = RR.drills.find((item) => item.id === id);
  const actual = RR.drillChoreography.motionForText(drill.steps[stepNumber - 1], {
    drill,
    fallback: false
  }).map((motion) => motion.id);
  return JSON.stringify(actual) !== JSON.stringify(expected);
});
ok(completedPhysicalStepCases.length === 39 && completedPhysicalStepFailures.length === 0,
  `audited physical prose still resolves to generic or incomplete mechanics: ${completedPhysicalStepFailures.map(
    ([id, stepNumber, expected]) => {
      const drill = RR.drills.find((item) => item.id === id);
      const actual = RR.drillChoreography.motionForText(drill.steps[stepNumber - 1], {
        drill,
        fallback: false
      }).map((motion) => motion.id);
      return `${id}#${stepNumber}=>${actual.join(">")}, expected ${expected.join(">")}`;
    }).join("; ")}`);

const pursuitFirstSave = semanticP0Plan("pursuit-emergency-defense", 1);
const pursuitSecondSave = semanticP0Plan("pursuit-emergency-defense", 2);
const reactionReadyPlan = semanticP0Plan("close-range-reaction-digging", 0);
const planBeatLabels = (plan) => (plan && plan.beats || []).map((beat) => {
  const actor = plan.actors.find((candidate) => candidate.id === beat.actorId);
  return actor && actor.label;
});
ok(JSON.stringify(semanticP0Phases(pursuitFirstSave)) === JSON.stringify(["sprint", "dig"]) &&
  planBeatLabels(pursuitFirstSave)[1] === "D1" &&
  JSON.stringify(semanticP0Phases(pursuitSecondSave)) === JSON.stringify(["dig"]) &&
  planBeatLabels(pursuitSecondSave)[0] === "D2" &&
  reactionReadyPlan.beats.length === 1 &&
  reactionReadyPlan.beats[0].motionId === "defensive-ready" &&
  !reactionReadyPlan.beats[0].contactId,
  "pursuit ownership or close-range ready posture still replays an unrelated ball contact");

const deliberatelyAdministrativeSteps = [
  ["pursuit-emergency-defense", 4],
  ["close-range-reaction-digging", 4],
  ["over-the-net-pepper", 3],
  ["three-contact-partner-pepper", 4],
  ["continuous-cross-court-control", 1],
  ["continuous-cross-court-control", 3]
];
ok(deliberatelyAdministrativeSteps.every(([id, stepNumber]) => {
  return JSON.stringify(semanticP0Phases(semanticP0Plan(id, stepNumber - 1))) ===
    JSON.stringify(["admin"]);
}), "rotation, rep-count, or unsupported rally-count copy no longer stays administrative");

const highMiddlePlan = semanticP0Plan("out-of-system-passing", 1);
const wBackupPlan = semanticP0Plan("w-formation-serve-receive", 2);
const middleReadPlan = semanticP0Plan("middle-blocker-read-close", 0);
const middleResetPlan = semanticP0Plan("middle-blocker-read-close", 3);
const fakeQuickPlan = semanticP0Plan("commit-block-the-middle", 3);
const collapseRecoverPlan = semanticP0Plan("collapse-dig-and-recover", 2);
ok(highMiddlePlan.beats.length === 1 && highMiddlePlan.beats[0].label === "high to middle" &&
  wBackupPlan.beats.filter((beat) => beat.motionId === "shuffle").length === 4 &&
  wBackupPlan.beats.every((beat) => beat.simultaneousGroup !== "w-receive-receive-rotation") &&
  planBeatLabels(middleReadPlan)[0] === "M" &&
  JSON.stringify(semanticP0Phases(middleResetPlan)) ===
    JSON.stringify(["set", "shuffle", "block", "admin"]) &&
  fakeQuickPlan.beats.length === 1 && fakeQuickPlan.beats[0].motionId === "defensive-ready" &&
  planBeatLabels(fakeQuickPlan)[0] === "B" && !fakeQuickPlan.beats[0].contactId &&
  JSON.stringify(semanticP0Phases(collapseRecoverPlan)) === JSON.stringify(["dig", "ready"]) &&
  collapseRecoverPlan.beats[0].label === "get arms under it",
  "reviewed physical steps still replay an unrelated contact, route group, or actor");

const reviewedSwingLabels = [
  "swing", "safe swing", "fast swing down", "swing deep", "transition swing",
  "live swing", "hard swing", "swing or roll", "swing to hoop", "swing across body"
];
ok(reviewedSwingLabels.every((label) =>
  RR.drillChoreography.motionForText(label, {
    drill: { id: "reviewed-hitting-route", skill: "Hitting" },
    pathKind: "serve",
    fallback: false
  }).some((motion) => motion.id === "attack")),
  "authored bare/adjective swing route labels still fall through to serve mechanics");
const authoredSwingRoutes = [];
const serveOnlySwingRoutes = [];
RR.drills.forEach((drill) => {
  RR.drillAnimation.scenesFor(drill).forEach((scene, sceneIndex) => {
    (scene.paths || []).forEach((route, pathIndex) => {
      if ((route.kind || "") !== "serve" || !/\b(?:swing|attack)/i.test(route.label || "") ||
          /\bblock/i.test(route.label || "")) return;
      const key = `${drill.id}|${sceneIndex}|${pathIndex}|${route.label}`;
      const ids = RR.drillChoreography.motionForText(route.label, {
        drill,
        pathKind: route.kind,
        fallback: false
      }).map((motion) => motion.id);
      authoredSwingRoutes.push(key);
      if (!ids.some((id) => id === "attack" || id === "box-hit")) {
        serveOnlySwingRoutes.push(`${key}=>${ids.join("+")}`);
      }
    });
  });
});
ok(authoredSwingRoutes.length >= 35 && serveOnlySwingRoutes.length === 0,
  `authored swing/attack routes still render as a serve-only contact: ${serveOnlySwingRoutes.join(", ")}`);

const pepperParallelPlan = generatedPlan(
  RR.drills.find((drill) => drill.id === "pepper"),
  RR.drillAnimation.scenesFor(RR.drills.find((drill) => drill.id === "pepper"))[0],
  RR.drills.find((drill) => drill.id === "pepper").steps[0], 0, 0
);
const partnerWarmupDrill = RR.drills.find((drill) => drill.id === "partner-pass-and-move-warmup");
const partnerParallelPlan = generatedPlan(
  partnerWarmupDrill, RR.drillAnimation.scenesFor(partnerWarmupDrill)[0],
  partnerWarmupDrill.steps[0], 0, 0
);
ok(pepperParallelPlan.operationMode === "parallel" &&
  partnerParallelPlan.operationMode === "parallel",
  "explicit all-groups-at-the-same-time flow is still overridden by the negated phrase 'no standing in line'");

const wallSettingDrill = RR.drills.find((drill) => drill.id === "wall-setting");
const wallSettingPlan = generatedPlan(
  wallSettingDrill, RR.drillAnimation.scenesFor(wallSettingDrill)[0],
  wallSettingDrill.steps[0], 0, 0
);
const wallComboDrill = RR.drills.find((drill) => drill.id === "wall-set-and-pass-combo");
const wallComboPlan = generatedPlan(
  wallComboDrill, RR.drillAnimation.scenesFor(wallComboDrill)[0],
  wallComboDrill.steps[0], 0, 0
);
ok(wallSettingPlan.contacts.slice(0, 4).every((contact) =>
  !contact.recipientActorId && contact.recipientEndpoint &&
  contact.recipientEndpoint.type === "wall") &&
  wallSettingPlan.contacts.slice(4).every((contact) =>
    !contact.sourceActorId && contact.sourceEndpoint &&
    contact.sourceEndpoint.type === "wall" && contact.recipientActorId) &&
  wallComboPlan.contacts[0].recipientEndpoint.type === "wall" &&
  wallComboPlan.contacts[1].sourceEndpoint.type === "wall",
  "wall contact/rebound chains still fabricate a human endpoint instead of preserving the authored wall return");

const hittingLinesDrill = RR.drills.find((drill) => drill.id === "hitting-lines");
const hittingTargetPlan = generatedPlan(
  hittingLinesDrill, RR.drillAnimation.scenesFor(hittingLinesDrill)[1],
  hittingLinesDrill.steps[1], 1, 1
);
const factualTargetContact = hittingTargetPlan.contacts.find((contact) =>
  contact.recipientEndpoint && contact.recipientEndpoint.type === "target"
);
ok(!!factualTargetContact && !factualTargetContact.recipientActorId &&
  /^(?:authored-zone|authored-path-endpoint)$/.test(factualTargetContact.recipientEndpoint.source),
  "authored target-zone flight still binds an arbitrary nearby person as its receiver");

const specializedGrid = RR.drillChoreography.grids.specialized;
ok(specializedGrid && specializedGrid.asset ===
  "images/drill-motion/scene-specialized-grid.webp" &&
  specializedGrid.width === 1254 && specializedGrid.height === 1254 &&
  specializedGrid.cols === 4 && specializedGrid.rows === 4,
  "choreography: specialized human-mechanics grid metadata is missing or incorrect");

const bandArmDrill = RR.drills.find((drill) => drill.id === "band-arm-speed");
const bandArmMotions = bandArmDrill.steps.map((step) =>
  RR.drillChoreography.motionForText(step, { drill: bandArmDrill, fallback: false })
    .map((motion) => motion.id));
ok(JSON.stringify(bandArmMotions) === JSON.stringify([
  ["band-arm-swing"], ["band-arm-swing"], ["band-arm-swing"], ["free-arm-swing"]
]) && RR.drillChoreography.motionForText("FREE SWING",
  { drill: bandArmDrill, fallback: false })[0].id === "free-arm-swing",
  "band-arm-speed: saved steps/routes do not show resisted load/swing followed by unresisted arm speed");
const bandArmScene = RR.drillAnimation.scenesFor(bandArmDrill)[0];
const bandArmPlans = bandArmDrill.steps.map((step, stepIndex) =>
  generatedPlan(bandArmDrill, bandArmScene, step, 0, stepIndex));
ok(bandArmPlans.every((plan) => plan.valid && plan.routes.length === 1 && plan.beats.length === 1) &&
  bandArmPlans.slice(0, 3).every((plan) => plan.beats[0].motionId === "band-arm-swing") &&
  bandArmPlans[3].beats[0].motionId === "free-arm-swing",
  "band-arm-speed: a saved phase still replays the opposite resisted/unresisted route");

const agilityLadderDrill = RR.drills.find((drill) => drill.id === "agility-ladder-footwork");
const agilityLadderMotions = agilityLadderDrill.steps.map((step) =>
  RR.drillChoreography.motionForText(step, { drill: agilityLadderDrill, fallback: false })
    .map((motion) => motion.id));
const lateralLadderDrill = RR.drills.find((drill) => drill.id === "ladder-lateral-quicksteps");
const lateralLadderMotions = lateralLadderDrill.steps.map((step) =>
  RR.drillChoreography.motionForText(step, { drill: lateralLadderDrill, fallback: false })
    .map((motion) => motion.id));
const passingAccuracyLadder = RR.drills.find((drill) => drill.id === "passing-accuracy-ladder");
ok(JSON.stringify(agilityLadderMotions) === JSON.stringify([
  ["ladder"], ["ladder"], ["ladder"], ["ladder"], ["sprint"]
]) && JSON.stringify(lateralLadderMotions) === JSON.stringify([
  ["ladder"], ["ladder"], ["ladder"], ["shuffle"]
]) && passingAccuracyLadder.steps.every((step) =>
  !RR.drillChoreography.motionForText(step, { drill: passingAccuracyLadder, fallback: false })
    .some((motion) => motion.id === "ladder")),
  "ladder drills/metaphors do not preserve exact ladder, shuffle, and sprint mechanics");

const boxHittingDrill = RR.drills.find((drill) => drill.id === "box-hitting-reps");
const boxHittingMotions = boxHittingDrill.steps.map((step) =>
  RR.drillChoreography.motionForText(step, { drill: boxHittingDrill, fallback: false })
    .map((motion) => motion.id));
ok(JSON.stringify(boxHittingMotions) === JSON.stringify([
  ["box-hit"], ["feed"], ["box-hit"], ["box-hit", "admin"]
]), "box-hitting-reps: saved steps do not retain elevated load, toss, contact, target, and rotation mechanics");
const boxHittingScene = RR.drillAnimation.scenesFor(boxHittingDrill)[0];
const boxHittingPlan = generatedPlan(
  boxHittingDrill, boxHittingScene, boxHittingDrill.steps[1], 0, 1
);
ok(boxHittingPlan.valid &&
  JSON.stringify(boxHittingPlan.contacts.map((contact) => [
    authoredActorId(boxHittingPlan, contact.sourceActorId), contact.motionId,
    authoredActorId(boxHittingPlan, contact.recipientActorId),
    contact.recipientEndpoint && contact.recipientEndpoint.type
  ])) === JSON.stringify([
    ["box-feeder", "feed", "box-hitter", null],
    ["box-hitter", "box-hit", null, "target"]
  ]) && boxHittingPlan.beats[0].motionId === "feed" &&
  /box-feeder$/.test(boxHittingPlan.beats[0].actorId || ""),
  "box-hitting-reps: feeder toss and elevated hitter/target mechanics are not explicitly separated");

const reactionCueProgram = RR.drillHumanMotion.programFor(reactionSprintDrill, reactionSprintScenes);
const reactionCuePlan = RR.drillChoreography.planFor(
  reactionSprintDrill, reactionCueProgram[1].scene, reactionSprintDrill.steps[1],
  { sceneIndex: reactionCueProgram[1].sceneIndex, stepIndex: 1 }
);
ok(reactionCuePlan.beats.length >= 2 &&
  reactionCuePlan.beats[0].motionId === "signal" &&
  /reaction-caller$/.test(reactionCuePlan.beats[0].actorId || "") &&
  reactionCuePlan.beats[1].motionId === "sprint" &&
  /reaction-runner$/.test(reactionCuePlan.beats[1].actorId || ""),
  "reaction-sprint-starts: caller cue and runner acceleration are not two correctly bound human beats");

ok(JSON.stringify(savedStepSceneMap("six-on-six-queen-of-the-court")) === JSON.stringify([0, 0, 1, 1]),
  "six-on-six-queen-of-the-court: saved steps do not progress from rally to rotation");
ok(JSON.stringify(savedStepSceneMap("mini-volley-stations-tournament")) === JSON.stringify([0, 0, 0, 1, 1]),
  "mini-volley-stations-tournament: saved steps do not progress from setup/rallies to ladder rotation");

["queen-of-the-court", "king-of-the-court-doubles"].forEach((id) => {
  const drill = RR.drills.find((item) => item.id === id);
  const scenes = RR.drillAnimation.scenesFor(drill);
  const rally = scenes[0];
  const rotation = scenes[1];
  const bindings = RR.drillAnimation.participantModelFor(drill, rotation).moveBindings;
  ok(scenes.length === 2 && rally.players.length === 6 && rotation.players.length === 6,
    `${id}: minimum setup must show kings/queens, challengers, and one complete waiting pair`);
  ok(rally.players.filter((player) => player.team === "n").length === 2 &&
    rotation.players.filter((player) => player.team === "n").length === 2 &&
    rotation.paths.length === 6 && Object.keys(bindings).length === 6,
    `${id}: both waiting partners do not enter together after the active pairs rotate`);
  const mappedScenes = savedStepSceneMap(id);
  const expectedScenes = id === "queen-of-the-court" ? [0, 0, 1, 1, 1] : [0, 0, 1, 1];
  ok(JSON.stringify(mappedScenes) === JSON.stringify(expectedScenes),
    `${id}: saved steps do not progress from active rally to complete pair rotation (${mappedScenes.join(",")})`);
  const rotationPlan = productionProgram(id).find(({ item }) => item.sceneIndex === 1 &&
    item.sourceStep >= 0).plan;
  const teamChange = rotationPlan.beats.filter((beat) =>
    beat.simultaneousGroup === "post-rally-team-change");
  ok(teamChange.length === 6 && teamChange.every((beat) => beat.startMs === 0) &&
    new Set(teamChange.map((beat) => beat.actorId)).size === 6,
    `${id}: both active pairs and the complete waiting pair do not change sides together`);
});

const queenSixRotationPlan = productionProgram("six-on-six-queen-of-the-court")
  .find(({ item }) => item.sourceStep === 2).plan;
const queenSixTeamChange = queenSixRotationPlan.beats.filter((beat) =>
  beat.simultaneousGroup === "post-rally-team-change");
ok(queenSixTeamChange.length === 12 &&
  queenSixTeamChange.every((beat) => beat.startMs === 0) &&
  new Set(queenSixTeamChange.map((beat) => authoredActorId(
    queenSixRotationPlan, beat.actorId))).size === 12,
  "six-on-six-queen-of-the-court: both complete six-player teams do not swap positions together");

["six-v-six-wash-scoring", "transition-wash-game"].forEach((id) => {
  const drill = RR.drills.find((item) => item.id === id);
  const scene = RR.drillAnimation.scenesFor(drill)[0];
  const production = productionProgram(id);
  const first = production.find(({ item }) => item.sourceStep === 0).plan;
  const second = production.find(({ item }) => item.sourceStep === 1).plan;
  const hardTransition = id === "transition-wash-game";
  ok(scene.players.filter((player) => player.team !== "coach").length === 12 &&
    scene.players.filter((player) => player.team === "coach").length === 1 &&
    JSON.stringify(scene.motionChains.map((chain) => chain.length)) === JSON.stringify([7, 4]),
    `${id}: the two complete six-player teams, coach, or two separate rally chains are missing`);
  ok(JSON.stringify(first.beats.map((beat) => beat.motionId)) ===
    JSON.stringify(["serve", "pass", "set", "attack", "dig", "set", "attack"]) &&
    JSON.stringify(second.beats.map((beat) => beat.motionId)) ===
    JSON.stringify(["feed", hardTransition ? "dig" : "pass", "set", "attack"]) &&
    new Set(first.beats.map((beat) => beat.trackId)).size === 1 &&
    new Set(second.beats.map((beat) => beat.trackId)).size === 1 &&
    first.beats[0].trackId !== second.beats[0].trackId,
    `${id}: served rally and immediate coach-entered transition rally are not complete, ordered, separate ball tracks`);
});

const pepperFlight = renderedScene("pepper", 0);
ok(flightCount(pepperFlight) === 1 && /data-route-legs="3"/.test(pepperFlight),
  "pepper: one shared ball must travel through the hit-dig-set chain");

const circleFlight = renderedScene("cooperative-pass-count", 0);
ok(flightCount(circleFlight) === 1 && /data-route-legs="6"/.test(circleFlight),
  "cooperative-pass-count: one shared ball must travel around all six players");

const wallFlight = renderedScene("wall-forearm-passing", 0);
ok(flightCount(wallFlight) === 1 && /data-route-legs="2"/.test(wallFlight),
  "wall-forearm-passing: the outbound pass and rebound must use one ball");

const wallSettingFlight = renderedScene("wall-setting", 0);
ok(flightCount(wallSettingFlight) === 4 &&
  (wallSettingFlight.match(/data-route-legs="2"/g) || []).length === 4 &&
  !/class="dam-mover"/.test(wallSettingFlight),
  "wall-setting: each setter's outbound set and rebound must use one ball");

const rolledDigFlight = renderedScene("roll-the-ball-dig", 0);
ok(flightCount(rolledDigFlight) === 1 && /data-route-legs="2"/.test(rolledDigFlight) &&
  !/class="dam-mover"/.test(rolledDigFlight),
  "roll-the-ball-dig: the floor roll and lifted return must use one ball");

const receiveFlight = renderedScene("three-person-serve-receive", 1);
ok(flightCount(receiveFlight) === 1 && /data-route-legs="2"/.test(receiveFlight),
  "three-person-serve-receive: the serve and pass must use one ball");

const pastureFlight = renderedScene("shepherd-and-sheep", 0);
ok(flightCount(pastureFlight) === 4,
  "shepherd-and-sheep: four saved, independent balloons must remain visible");

const slamFlight = renderedScene("med-ball-overhead-slams", 0);
ok(flightCount(slamFlight) === 1 && /data-route-legs="2"/.test(slamFlight),
  "med-ball-overhead-slams: the slam and bounce must use one medicine ball");

const chestFlight = renderedScene("med-ball-chest-pass-wall", 0);
ok(flightCount(chestFlight) === 1 && /data-route-legs="2"/.test(chestFlight),
  "med-ball-chest-pass-wall: the pass and rebound must use one medicine ball");

const liveReadFlight = renderedScene("setter-live-read-options", 1);
ok(flightCount(liveReadFlight) === 4 && !/data-route-legs="[2-9]/.test(liveReadFlight),
  "setter-live-read-options: four alternative targets must not be stitched together");

const hoopChoiceFlight = renderedScene("setter-hoop-stations", 0);
ok(flightCount(hoopChoiceFlight) === 2 && /data-route-legs="2"/.test(hoopChoiceFlight),
  "setter-hoop-stations: toss/front-set chain and alternative back set must remain distinct");

const expectedDerivedTitles = {
  "shoulder-band-prep": "Rotate, pull apart, raise",
  "static-stretch-cooldown": "Four-part guided stretch",
  "core-rotational-power": "Rotate and throw to the wall",
  "foam-roll-mobility-recovery": "Roll, mobilize, then breathe",
  "jump-rope-coordination": "Build the rope progression",
  "yoga-flow-cooldown": "Slow floor flow",
  "bodyweight-shoulder-activation": "Circle, swing, slide, squeeze",
  "guided-breathing-and-reflection": "Breathe, reflect, close together",
  "mini-band-lateral-walks": "Side steps, monster walks, squats",
  "calf-and-ankle-recovery": "Calf and ankle reset",
  "dynamic-mobility-flow": "Move through four mobility phases",
  "hamstring-and-hip-stretch": "Hamstrings, hips, and twist",
  "balloon-keep-it-up": "Keep your own balloon overhead",
  "shepherd-and-sheep": "Cross the pasture with control",
  "band-pull-aparts": "Pull apart, row, pull down",
  "band-arm-speed": "Load high and swing through",
  "mini-band-glute-bridges": "Bridge, hold, then side-step",
  "mini-band-defensive-shuffle": "Shuffle both ways, then box",
  "ladder-lateral-quicksteps": "Sideways in-in, out-out",
  "jump-rope-speed-intervals": "Five fast work-rest rounds",
  "jump-rope-single-leg": "Two feet, right, left, alternate",
  "med-ball-overhead-slams": "Snap straight down to the floor",
  "med-ball-chest-pass-wall": "Chest pass and catch the rebound",
  "reaction-ball-wall-singles": "Throw low, read the angle, shuffle",
  "foam-roller-leg-reset": "Slow leg-roll sequence",
  "foam-roller-upper-back": "Upper-back release",
  "box-step-ups-approach": "Step up, drive the knee, lower",
  "box-depth-jump-landings": "Step off and stick the landing",
  "box-block-reach": "Press over the net",
  "mat-floor-defense-progression": "Roll, side-roll, sprawl, pop up",
  "mat-mobility-flow": "Four-part mat mobility flow"
};
ok(JSON.stringify(derivedIds.slice().sort()) === JSON.stringify(Object.keys(expectedDerivedTitles).sort()),
  "derived bundled drill ids do not match the 31 reviewed exact mappings");
derivedIds.forEach((id) => {
  const drill = RR.drills.find((item) => item.id === id);
  const scene = RR.drillAnimation.scenesFor(drill)[0];
  ok(scene.title === expectedDerivedTitles[id], `${id}: did not use its reviewed exact mapping`);
  ok(scene.caption === drill.setup, `${id}: caption is not the saved setup`);
});

const pasture = RR.drillAnimation.scenesFor(RR.drills.find((drill) => drill.id === "shepherd-and-sheep"))[0];
ok(pasture.net == null, "shepherd-and-sheep: pasture scene must not invent a volleyball net");
ok(pasture.cones.length === 4, "shepherd-and-sheep: saved cone boundary is not represented");
ok(pasture.players.length === 7 && pasture.players.filter((player) => player.label === "D").length === 3,
  "shepherd-and-sheep: reviewed shepherd/sheepdog grouping is not represented");
ok(pasture.paths.filter((route) => route.object === "balloon").length === 4,
  "shepherd-and-sheep: each shepherd needs a saved balloon route");

const blockReach = RR.drillAnimation.scenesFor(RR.drills.find((drill) => drill.id === "box-block-reach"))[0];
ok(blockReach.net != null, "box-block-reach: saved net setup is not represented");
ok(blockReach.zones.some((zone) => zone.label === "STEP"), "box-block-reach: saved step is not represented");

const matDefense = RR.drillAnimation.scenesFor(RR.drills.find((drill) => drill.id === "mat-floor-defense-progression"))[0];
ok(matDefense.zones.some((zone) => zone.label === "MAT"), "mat-floor-defense-progression: saved mat is not represented");
ok(matDefense.paths.length === 1 && matDefense.paths[0].playerIndex === 0 &&
  ["ROLL", "SIDE ROLL", "SPRAWL", "POP UP"].every((label) => matDefense.paths[0].label.includes(label)) &&
  (matDefense.paths[0].via || []).length >= 4,
  "mat-floor-defense-progression: one athlete does not perform the full saved roll/sprawl sequence");

const balloonSolo = RR.drillAnimation.scenesFor(RR.drills.find((drill) => drill.id === "balloon-keep-it-up"))[0];
ok(balloonSolo.players.length === 1 && balloonSolo.net == null,
  "balloon-keep-it-up: solo/no-net setup was replaced with partners or a net");
ok(balloonSolo.paths.some((route) => route.object === "balloon"),
  "balloon-keep-it-up: saved balloon action is not represented");

const slam = RR.drillAnimation.scenesFor(RR.drills.find((drill) => drill.id === "med-ball-overhead-slams"))[0];
ok(!slam.zones.some((zone) => /wall/i.test(zone.label || "")),
  "med-ball-overhead-slams: invented a wall");
ok(slam.paths.some((route) => route.object === "medicine" && route.to[1] > route.from[1]),
  "med-ball-overhead-slams: ball does not travel down to the floor");

const stepUp = RR.drillAnimation.scenesFor(RR.drills.find((drill) => drill.id === "box-step-ups-approach"))[0];
ok(stepUp.paths.length === 1 && stepUp.paths[0].playerIndex === 0 &&
  /STEP UP.*LOWER/.test(stepUp.paths[0].label) && (stepUp.paths[0].via || []).length === 1,
  "box-step-ups-approach: one athlete does not perform the controlled up/down sequence");
ok(!/approach|jump/i.test(stepUp.title + JSON.stringify(stepUp.paths)),
  "box-step-ups-approach: invented an approach or jump");

const depthDrop = RR.drillAnimation.scenesFor(RR.drills.find((drill) => drill.id === "box-depth-jump-landings"))[0];
ok(depthDrop.paths.some((route) => route.label === "STEP OFF") &&
  depthDrop.zones.some((zone) => zone.label === "STICK"),
  "box-depth-jump-landings: saved step-off/stick direction is not represented");

const custom = {
  id: "custom-verify", custom: true, name: "My wall passing progression",
  skill: "Passing", minPlayers: 2, equipment: ["wall", "balls"],
  setup: "Two players work at the wall and alternate every ten clean passes.",
  steps: ["Pass to the wall.", "Reset under the rebound."], isGame: false
};
const customScenes = RR.drillAnimation.scenesFor(custom);
ok(customScenes.length === 3, "custom drill: setup and saved steps should each receive a factual phase");
ok(customScenes[0].caption === custom.setup, "custom drill: scene does not use its saved setup");
ok(customScenes[1].caption === custom.steps[0] && customScenes[2].caption === custom.steps[1],
  "custom drill: step phases do not preserve exact saved text");
ok(customScenes.every((scene) => !scene.net && !scene.court && !(scene.paths && scene.paths.length)),
  "custom drill: fabricated a court, net, or route from free text/skill");
ok(customScenes.every((scene) => (scene.players || []).every((player) => player.team === "n" && !player.note)),
  "custom drill: fabricated teams or roles");
ok(JSON.stringify(RR.drillAnimation.scenesFor(custom)) === JSON.stringify(customScenes),
  "custom drill: fact-only fallback is not deterministic");

const customGame = {
  custom: true, id: "custom-game", name: "Saved game", skill: "Team Play",
  minPlayers: 8, equipment: ["balls"], setup: "Use the saved open-space rules.", steps: [], isGame: true
};
const customGameScene = RR.drillAnimation.scenesFor(customGame)[0];
ok(customGameScene.net == null && !customGameScene.paths,
  "custom isGame drill: invented a net or ball flight");
ok(customGameScene.players.length === 6 && customGameScene.players[5].label === "+3",
  "custom drill: saved minimum player count is not represented factually");
const customGameFacts = RR.drillAnimation.courtFactsFor(customGame, customGameScene, customGame.setup);
ok(customGameFacts.positionedPeople === 5 && customGameFacts.groupedPeople === 3 &&
  customGameFacts.representedPeople === 8 && customGameFacts.additional === 0,
  "custom drill: grouped +N marker is not counted as real saved participants");

const actorBindingScene = {
  w: 9, h: 8,
  players: [
    { id: "runner", x: 1, y: 1, label: "R", team: "a" },
    { id: "partner", x: 7, y: 6, label: "P", team: "b" }
  ],
  paths: [
    { from: [7, 6], to: [5, 4], kind: "move", actor: "runner", label: "EXPLICIT" },
    { from: [7.2, 6.1], to: [6, 3], kind: "move", label: "NEAREST" }
  ]
};
const actorBindingModel = RR.drillAnimation.participantModelFor({ minPlayers: 2 }, actorBindingScene);
ok(actorBindingModel.moveBindings[0].playerIndex === 0 &&
  actorBindingModel.moveBindings[0].source === "explicit",
  "explicit path.actor does not bind to the exact factual player");
ok(actorBindingModel.moveBindings[1].playerIndex === 1 &&
  actorBindingModel.moveBindings[1].source === "origin",
  "unambiguous path origin does not bind to the nearest factual player");
const actorBindingMarkup = RR.drillAnimation.renderSvg(actorBindingScene, "verify-actor-binding");
ok((actorBindingMarkup.match(/dam-mover--bound/g) || []).length === 2 &&
  /data-player-index="0" data-binding="explicit"/.test(actorBindingMarkup) &&
  /dam-player--a/.test(actorBindingMarkup),
  "bound player routes do not animate duplicated factual team/label markers");

const ambiguousBindingScene = {
  players: [{ x: 4, y: 4, label: "A" }, { x: 5, y: 4, label: "B" }],
  paths: [{ from: [4.5, 4], to: [4.5, 2], kind: "move" }]
};
ok(!Object.keys(RR.drillAnimation.participantModelFor({ minPlayers: 2 }, ambiguousBindingScene)
  .moveBindings).length,
  "equidistant path origin guessed an actor instead of keeping the neutral marker");

const referenceMarkerScene = {
  players: [
    { x: 2, y: 5, label: "P", team: "a", note: "passer" },
    { x: 3, y: 5, label: "C", team: "coach", note: "feeds" },
    { x: 4, y: 4, label: "•", team: "n", note: "ball" },
    { x: 5, y: 4, label: "", team: "a", note: "high ball" },
    { x: 6, y: 4, label: "", team: "n", note: "ball pops up" }
  ]
};
const referenceMarkerFacts = RR.drillAnimation.courtFactsFor({ minPlayers: 2 }, referenceMarkerScene, "Pass.");
ok(referenceMarkerFacts.positionedPeople === 1 && referenceMarkerFacts.supportPeople === 1 &&
  referenceMarkerFacts.additional === 1 && referenceMarkerFacts.participantTokens.length === 2,
  "coach or ball/target reference marks are being counted as required player participants");

const sparse = RR.drillAnimation.scenesFor({ custom: true, name: "Legacy custom" });
ok(sparse.length === 1 && sparse[0].caption === "No setup or steps saved yet.",
  "sparse custom drill: missing-details state is not factual");
ok(!(sparse[0].players || []).length && !(sparse[0].zones || []).length && sparse[0].rings.length === 1,
  "sparse custom drill: invented players or equipment");

const malformed = RR.drillAnimation.scenesFor({
  custom: true, name: "Imported custom", minPlayers: "6", equipment: "net", setup: 7, steps: "Pass"
});
ok(malformed.length === 1 && !malformed[0].net && !(malformed[0].players || []).length,
  "malformed custom drill: unnormalized fields leaked into the scene");
ok(RR.drillAnimation.participantModelFor({ minPlayers: 100000 }, {}).minimum == null,
  "malformed custom drill: unbounded player minimum can create an excessive avatar list");

console.log("──────────────────────────────────────────");
if (failures.length) {
  console.log(`DRILL ANIMATION: ${pass} passed, ${failures.length} FAILED`);
  failures.forEach((failure) => console.log("  ✗ " + failure));
  process.exit(1);
}
console.log(`DRILL ANIMATION: ALL ${pass} CHECKS PASSED ` +
  `(${RR.drills.length} drills; ${sceneCount} scenes; ${authored} authored, ${derived} derived)`);
