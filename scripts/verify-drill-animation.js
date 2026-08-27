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
ok((uiSource.match(/RR\.drillAnimation\.figure\(drill\)/g) || []).length >= 2,
  "shared drill details and expanded practice blocks must both lead with animation");
ok(/RR\.drillAnimation\.figure\(drill\)/.test(runSource),
  "run screen must use the animated drill example");
ok(!/RR\.ui\.diagramFigure\s*\?/.test(runSource),
  "run screen still resolves the old static drill diagram");
ok(/fillLegend\(legend, specs\[current\]\.legend\)/.test(animationSource),
  "current authored legend is not connected to the interactive scene");
ok(/\.dam-ring--target\s*\{[^}]*stroke:/.test(animationCss),
  "target rings have no visible stroke style");

let authored = 0;
let derived = 0;
let multi = 0;
let sceneCount = 0;
let authoredLegendScenes = 0;
let authoredLegendItems = 0;
let reviewedChainCount = 0;
let reviewedBallPathCount = 0;
const derivedIds = [];

RR.drills.forEach((drill) => {
  const scenes = RR.drillAnimation.scenesFor(drill);
  const hasAuthored = RR.drillAnimation.isAuthored(drill);
  if (hasAuthored) authored++;
  else { derived++; derivedIds.push(drill.id); }
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
    const markup = RR.drillAnimation.renderSvg(scene, `verify-${drill.id}-${index}`);
    ok(/^<svg[\s>]/.test(markup), `${drill.id} scene ${index + 1}: no inline SVG`);
    ok(!/<img|placeholder|coming soon/i.test(markup), `${drill.id} scene ${index + 1}: static/placeholder visual leaked in`);
    ok(/dam-(flight|mover|player-focus|zone|ring)/.test(markup), `${drill.id} scene ${index + 1}: no animated visual primitive`);
    ok(!!(scene.caption || drill.setup || (drill.steps && drill.steps[0])), `${drill.id} scene ${index + 1}: no real drill caption`);
  });
});

ok(authored === 210, `expected 210 authored drill animations, found ${authored}`);
ok(derived === 31, `expected 31 field-derived bundled animations, found ${derived}`);
ok(multi === 75, `expected 75 multi-step drills, found ${multi}`);
ok(sceneCount === 326, `expected 326 resolved scenes (295 authored + 31 derived), found ${sceneCount}`);
ok(authoredLegendScenes === 247, `expected 247 authored scenes with legends, found ${authoredLegendScenes}`);
ok(authoredLegendItems === 492, `expected 492 authored legend items, found ${authoredLegendItems}`);
ok(reviewedChainCount === 102, `expected 102 reviewed single-ball chains, found ${reviewedChainCount}`);
ok(reviewedBallPathCount === 6, `expected 6 reviewed move-styled object paths, found ${reviewedBallPathCount}`);

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
ok(["ROLL", "SIDE ROLL", "SPRAWL", "POP UP"].every((label) => matDefense.paths.some((route) => route.label === label)),
  "mat-floor-defense-progression: saved roll/sprawl sequence is not represented");

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
ok(stepUp.paths.some((route) => route.label === "STEP UP") && stepUp.paths.some((route) => route.label === "LOWER"),
  "box-step-ups-approach: controlled up/down sequence is not represented");
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

console.log("──────────────────────────────────────────");
if (failures.length) {
  console.log(`DRILL ANIMATION: ${pass} passed, ${failures.length} FAILED`);
  failures.forEach((failure) => console.log("  ✗ " + failure));
  process.exit(1);
}
console.log(`DRILL ANIMATION: ALL ${pass} CHECKS PASSED ` +
  `(${RR.drills.length} drills; ${sceneCount} scenes; ${authored} authored, ${derived} derived)`);
