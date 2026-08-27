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

ok(RR.drills.length === 241, `expected 241 bundled drills, found ${RR.drills.length}`);

const uiSource = fs.readFileSync(path.join(ROOT, "js/ui.js"), "utf8");
const runSource = fs.readFileSync(path.join(ROOT, "js/run.js"), "utf8");
const animationSource = fs.readFileSync(path.join(ROOT, "js/drill-animation.js"), "utf8");
const animationCss = fs.readFileSync(path.join(ROOT, "css/drill-animation.css"), "utf8");
const humanSource = fs.readFileSync(path.join(ROOT, "js/drill-human-motion.js"), "utf8");
const humanCss = fs.readFileSync(path.join(ROOT, "css/drill-human-motion.css"), "utf8");
const editorSource = fs.readFileSync(path.join(ROOT, "js/drill-editor.js"), "utf8");
const indexSource = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
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
ok(/function scheduleActionCycle\(\)/.test(animationSource) &&
  /selectAction\(\(actionIndex \+ 1\) % actionIds\.length\)/.test(animationSource),
  "multi-action saved steps do not automatically perform their full technique sequence");
ok(/aria-pressed/.test(animationSource) && /Show " \+ actionMeta\.label \+ " technique/.test(animationSource),
  "multi-action technique controls are not exposed to keyboard and assistive technology");
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
ok(/var facts = courtFactsFor\(drill, spec/.test(animationSource) &&
  /fillCourtFacts\(courtSummary, facts\)/.test(animationSource) &&
  /Court participant and movement details/.test(animationSource),
  "court view does not expose factual participant and mechanics details");
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
  ok(RR.drillAnimation.defaultViewFor(drill, true) ===
    (Number.isInteger(drill.minPlayers) && drill.minPlayers >= 2 ? "court" : "technique"),
    `${drill.id}: human demonstration opens on the wrong default view for its player minimum`);
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
    const fields = RR.format.fields(drill);
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
    bindingEntries.forEach((binding) => {
      const route = (scene.paths || [])[binding.pathIndex];
      ok(!!route && (route.kind || "ball") === "move" && !reviewedBallPaths.has(binding.pathIndex),
        `${drill.id} scene ${index + 1}: actor binding points at a non-player route`);
      ok(binding.player === (scene.players || [])[binding.playerIndex],
        `${drill.id} scene ${index + 1}: actor binding is not one of the factual scene players`);
      ok(!boundPlayerIndices.has(binding.playerIndex),
        `${drill.id} scene ${index + 1}: factual player ${binding.playerIndex} is rendered as multiple simultaneous movers`);
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
ok(sceneCount === 330, `expected 330 resolved scenes (299 authored + 31 derived), found ${sceneCount}`);
ok(authoredLegendScenes === 252, `expected 252 authored scenes with legends, found ${authoredLegendScenes}`);
ok(authoredLegendItems >= 513, `expected at least 513 authored legend items, found ${authoredLegendItems}`);
ok(reviewedChainCount === 106, `expected 106 reviewed single-ball chains, found ${reviewedChainCount}`);
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
ok(queen6Rally.players.length === 12 &&
  queen6Rally.players.filter((player) => player.team === "a").length === 6 &&
  queen6Rally.players.filter((player) => player.team === "b").length === 6,
  "six-on-six-queen-of-the-court: rally scene does not plot both complete six-player teams");
ok(queen6Rally.players.some((player) => player.label === "S" && player.y < 0.8) &&
  queen6Rally.paths.length === 1 && queen6Rally.paths[0].kind === "serve" &&
  (queen6Rally.paths[0].via || []).length === 3 &&
  /SERVE.*PASS.*SET.*HIT/.test(queen6Rally.paths[0].label),
  "six-on-six-queen-of-the-court: server or complete serve-pass-set-hit rally is missing");
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
  Object.values(queen6Bindings).every((binding) => binding.source === "explicit"),
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
    .map((step) => step.sceneIndex);
}
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
