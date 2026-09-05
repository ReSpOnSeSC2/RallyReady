// Reproducible, per-drill source/presentation audit. Run with --write to refresh
// docs/drill-completeness-review.md. Passing this is NOT a visual certification.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = path.join(__dirname, "..");
const sandbox = { console, Math, Object, Array, String, Number, JSON, encodeURIComponent };
sandbox.window = sandbox;
vm.createContext(sandbox);
const files = ["drills", ...Array.from({ length: 10 }, (_, i) => "drills-" + (i + 2)),
  "extras-build", "format", "extras-data", ...Array.from({ length: 11 }, (_, i) => "extras-data-" + (i + 2)),
  "drill-human-motion", "drill-choreography", "drill-animation", "coachcam-variants", "coachcam-library-3d"];
files.forEach(name => vm.runInContext(fs.readFileSync(path.join(ROOT, "js", name + ".js"), "utf8"), sandbox, { filename: name }));
const RR = sandbox.RR;
let checks = 0;
const failures = [];
function ok(value, message) { checks++; if (!value) failures.push(message); }
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function finite(v) { return typeof v === "number" && Number.isFinite(v); }
function unique(items) { return Array.from(new Set(items)); }
function fullPlan(d, scene, sceneIndex) {
  return RR.drillChoreography.planFor(d, scene, scene.caption || d.setup,
    { sceneIndex, stepIndex: 0, showFullScene: true });
}
function dr(id) { return RR.drills.find(d => d.id === id); }
function plans(id) { const d = dr(id); return RR.drillAnimation.scenesFor(d).map((s, i) => fullPlan(d, s, i)); }
const reviewedCorrections = {
  "mini-band-defensive-shuffle": "Added an actor-bound band and explicit five-step right/left routes (2 m example), followed by a 2 × 1.2 m box; low stance and lead/follow timing use the rebuilt gait.",
  "youth-serving-target-game": "Added the missing easy near-net target alongside higher-value deep corners. Values and sizes are explicitly an example; scoring/reset rules retain the saved drill.",
  "around-the-world-serving": "Corrected six-zone numbering to volleyball positions, including near-net 2/3/4 and deep 1/6/5 when viewing the far team from the serving end.",
  "serving-ladder-game": "Corrected the obsolete solo distance-ladder format to the saved two-team race to 7, then 10 made serves.",
  "dead-fish-serving": "Replaced seated-serving resurrection with serve, miss-to-far-court travel, a lying target, nearby rescue serve, and return-to-serve stages.",
  "four-square-volleyball": "Corrected the starting square and error destination (1 starts, error goes to 4); removed the unrequested bounce rule.",
  "amoeba-team-game": "Replaced an unrelated circle game with opposing teams across a net and a required number of teammate contacts before returning the ball.",
  "shepherd-and-sheep": "Corrected inverted roles: shepherds control balloons across a cone pasture; sheepdogs tap balloons away, and losses change roles.",
  "serving-relay-race": "Corrected the win condition to every teammate making a serve; each front server repeats until successful before retrieval and handoff.",
  "sideout-percentage-gauntlet": "Corrected streak scoring to a fixed block and sideout percentage, repeating a rotation until the chosen rate is reached.",
  "passing-21-circle": "Restored exact 3-point air / 1-point bounce scoring and score-preserving restart after an untouched drop.",
  "target-serve-challenge": "Removed invented anywhere-in scoring and miss penalties; called numbered hoops award their stated points, with the chosen target score ending a round.",
  "setter-hoop-stations": "Elevated hoops at both pins (adjustable example set height), instead of showing floor hoops for a through-the-hoop task.",
  "partner-catch-bump-control": "Added a seated posture contract for the initial forearm-passing stage.",
  "one-knee-setting-form": "Added a kneeling posture contract for the wall-setting stage.",
  "set-and-sit": "Added a sit-to-stand posture contract to the continuous-setting stage.",
  "block-timing-box": "Derived a stationary box from the explicitly authored hitter-on-box identity, separate from the moving blocker.",
  "block-a-tossed-ball": "Represented the authored partner-on-box option even though the old equipment array omitted the box.",
  "soft-block-deflection": "Represented the authored hitter's box, rather than leaving the elevated hitter unsupported.",
  "box-hitting-reps": "Retained the authored box under its performer and cone-marked line/angle targets.",
  "box-step-ups-approach": "Stationary box and local stepping action; schematic body arrows must not translate the box.",
  "box-depth-jump-landings": "Stationary low box and a distinct landing target; step-off remains a controlled drop.",
  "box-block-reach": "Separate box support and net reach from schematic hand-press arrows.",
  "agility-ladder-footwork": "Converted authored rung rectangles into one fixed ladder at the actual route location.",
  "ladder-lateral-quicksteps": "Converted authored rung rectangles into a fixed ladder rather than an unrelated spare prop.",
  "ladder-to-dig-reaction": "Retained the ladder, tosser, exiting athlete and dig target in the same scene.",
  "mat-floor-defense-progression": "Retained the complete authored mat footprint and equipment-only progression without inventing a ball feed.",
  "mat-sprawl-and-pursuit": "Retained the forward mat footprint between tosser and defender.",
  "mat-diving-extension": "Retained the authored mat and out-of-reach ball path.",
  "wall-forearm-passing": "The wall is taken from the authored physical zone, not a decorative panel away from the rebound.",
  "wall-setting": "The high wall target remains at the same authored wall as the rebound path.",
  "wall-set-and-pass-combo": "The wall remains at the rebound endpoint for the alternating set/pass chain.",
  "core-rotational-power": "Recognizes the narrow side-wall geometry and distinguishes a medicine ball from a volleyball.",
  "med-ball-chest-pass-wall": "Recognizes the narrow side wall and the medicine-ball object family.",
  "reaction-ball-wall-singles": "Recognizes the side wall and the distinct reaction-ball family.",
  "camp-skills-circuit": "Preserves each station's region, athletes and rotation route, rather than collapsing everything into one demonstrator.",
  "mini-volley-stations-tournament": "Preserves both small-court boundaries and the winner-up/non-winner-down transfer paths.",
  "run-the-rotation-offense": "Preserves all six authored formations and athlete identities; front/back-row labels remain instructional annotations."
};
// Named movement requirements checked against explicit variant selection below.
// Source selection and rendered anatomical review are separate evidence.
const motionReview = {
  "dynamic-movement-warmup": "Distinct high-knee, heel-kick, lunge, carioca and build-up body variations.",
  "shoulder-band-prep": "Internal/external rotation on both arms, pull-apart/Y and unbanded arm circles.",
  "mirror-defensive-shuffle": "Partner mirroring, forward/back and floor-touch/react stages.",
  "static-stretch-cooldown": "Every named arm/wrist/leg/floor stretch and both sides, with full prescribed holds.",
  "agility-ladder-footwork": "Two-in, in-in/out-out, icky shuffle and hopscotch require distinct foot sequences aligned to every rung.",
  "reaction-ball-quickness": "One-bounce catch and later wall variant; random reaction is demonstrated by one repeatable example.",
  "foam-roll-mobility-recovery": "Calf, quad, hamstring and upper-back roller placements are distinct support postures.",
  "jump-rope-coordination": "Two-foot, alternating and single-leg variants plus work/rest rhythm.",
  "slide-approach-attack": "A true one-foot slide takeoff differs from the shared two-foot attack takeoff.",
  "yoga-flow-cooldown": "Distinct fold, side bend, low lunge, child's pose, twist and lying finish.",
  "bodyweight-shoulder-activation": "Arm circles, hug/open, goal-post slides and scapular squeezes are separate exercises.",
  "animal-movement-warmup": "Bear crawl, crab walk, frog hop and inchworm need separate support/contact patterns.",
  "mini-band-lateral-walks": "Lateral gait, forward/back monster walks and final banded squat are separate variants.",
  "calf-and-ankle-recovery": "Straight/bent-knee wall stretches, ankle alphabet and heel raises.",
  "dynamic-mobility-flow": "Leg swings, knee/heel pulls, lunges and rotations need their own full movement range.",
  "hamstring-and-hip-stretch": "Seated hamstring, supine figure-four, kneeling hip-flexor and lying twist positions.",
  "band-pull-aparts": "Chest pull-apart, anchored row and overhead pull-down require separate anchor and hand paths.",
  "mini-band-glute-bridges": "Twelve bridges and eight lateral steps each way; shown repetitions may be time-compressed.",
  "ladder-lateral-quicksteps": "In-in/out-out and two-in/one-out are distinct rung-contact patterns.",
  "jump-rope-speed-intervals": "30 s work / 30 s rest ×5 is prescribed in full; example motion is abbreviated.",
  "jump-rope-single-leg": "Twenty two-foot then ten right/left and alternate contacts require explicit supporting-foot variants.",
  "foam-roller-leg-reset": "Forearm-supported quadriceps, seated calf and side hip/thigh roller positions.",
  "foam-roller-upper-back": "Roller beneath the thoracic back and hands supporting the head, rather than the shared calf-roll pose.",
  "mat-mobility-flow": "Tabletop cat-camel, lunge rotation, child's pose and inchworm support positions."
};
ok(RR.drills.length === 241, "Expected the complete 241-drill catalog");
const rows = RR.drills.map((d, index) => {
  const scenes = RR.drillAnimation.scenesFor(d);
  const scenePlans = scenes.map((scene, sceneIndex) => fullPlan(d, scene, sceneIndex));
  const program = RR.drillHumanMotion.programFor(d, scenes);
  const props = [], zones = [], motionIds = [], routeLabels = [], variants = [];
  const procedures = [];
  const sourceProps = [];
  scenePlans.forEach((plan, sceneIndex) => {
    const scene = scenes[sceneIndex], p = plan.presentation;
    ok(plan.valid, `${d.id}/${sceneIndex}: valid people, routes and beats`);
    ok(p && same(p.steps, d.steps), `${d.id}/${sceneIndex}: every saved instruction retained exactly`);
    ok(p && p.setup === d.setup, `${d.id}/${sceneIndex}: complete saved setup retained`);
    ok(p && same(p.boundaries, scene.court || []), `${d.id}/${sceneIndex}: authored court footprint retained`);
    ok(p && p.net === (finite(scene.net) ? scene.net : null), `${d.id}/${sceneIndex}: net position retained`);
    ok(p && Object.values(p.bounds).every(finite) && p.bounds.maxX > p.bounds.minX && p.bounds.maxY > p.bounds.minY,
      `${d.id}/${sceneIndex}: usable physical mapping bounds`);
    p.props.forEach(prop => {
      ok(!!prop.source, `${d.id}/${sceneIndex}/${prop.id}: prop provenance recorded`);
      ok(prop.actorId ? plan.actors.some(a => a.id === prop.actorId) : finite(prop.x) && finite(prop.y),
        `${d.id}/${sceneIndex}/${prop.id}: actor attachment or factual floor location`);
      props.push(prop.type + (prop.label ? ": " + prop.label : ""));
    });
    (scene.cones || []).forEach(cone => ok(p.props.some(prop => prop.type === "cone" && prop.x === cone.x && prop.y === cone.y),
      `${d.id}/${sceneIndex}: every authored cone retained at its coordinates`));
    (scene.zones || []).forEach((zone, zoneIndex) => {
      ok(p.zones.some(z => z.x === zone.x && z.y === zone.y && z.w === zone.w && z.h === zone.h) ||
        p.props.some(prop => prop.sourceZoneIndex === zoneIndex || (prop.sourceZoneIndices || []).includes(zoneIndex)) ||
        p.annotations.some(a => a.id === "annotation-" + (zoneIndex + 1) && a.label === (zone.label || "")), `${d.id}/${sceneIndex}: exact zone geometry or indexed apparatus/instruction panel accounted for`);
    });
    p.zones.forEach(zone => zones.push((zone.label || zone.kind) + ` [${zone.x},${zone.y}; ${zone.w}×${zone.h}]`));
    p.zones.filter(zone => zone.markerKind === "hoop").concat(p.props.filter(prop => prop.type === "hoop")).forEach(hoop =>
      ok(finite(hoop.diameterMeters) && hoop.diameterMeters > 0 && hoop.diameterMeters <= 1.5,
        `${d.id}/${sceneIndex}: physical hoop has a plausible diameter independent of schematic scoring-area size`));
    plan.beats.forEach(beat => motionIds.push(beat.motionId));
    plan.routes.forEach(route => routeLabels.push(route.label || `${route.kind}: ${route.from.join(",")} → ${route.to.join(",")}`));
    p.sequence.filter(step => step.stage === "procedure").forEach(step => procedures.push(`${step.stepIndex + 1}. ${step.instruction}`));
    p.props.forEach(prop => sourceProps.push(prop.source));
  });
  d.steps.forEach((instruction, stepIndex) => ok(program.some(entry => entry.sourceStep === stepIndex && entry.instruction === instruction),
    `${d.id}: step ${stepIndex + 1} is an actual ordered walkthrough phase, not merely a caption`));
  program.forEach(entry => {
    const phase = { sceneIndex: entry.sceneIndex, stepIndex: entry.sourceStep, instruction: entry.instruction };
    phase.plan = RR.drillChoreography.planFor(d, entry.scene, entry.instruction,
      { sceneIndex: entry.sceneIndex, stepIndex: entry.sourceStep });
    phase.plan.beats.forEach(beat => {
      const selected = RR.coachCamVariants.select(d, phase, beat);
      (selected && selected.sequence || (selected ? [selected] : [])).forEach(item => {
        if (item.id) variants.push(item.motionId + "/" + item.id);
      });
    });
  });
  return { index: index + 1, d, scenes, scenePlans, props: unique(props), zones: unique(zones), motions: unique(motionIds),
    routeLabels: unique(routeLabels), procedures: unique(procedures), sourceProps: unique(sourceProps), variants: unique(variants) };
});
const mini = plans("mini-band-defensive-shuffle")[0];
ok(mini.actors.length === 1 && !mini.actors[0].support, "Mini-band defender remains the sole athlete despite a note referencing the coach");
ok(mini.presentation.props.some(p => p.type === "mini-band" && p.actorId === mini.actors[0].id), "Mini-band attaches to the moving defender");
const fiveSteps = mini.routes.filter(r => r.authored.stepCount === 5);
ok(fiveSteps.length === 2 && fiveSteps.every(r => Math.abs(Math.hypot(r.to[0]-r.from[0], r.to[1]-r.from[1])-2) < 1e-9), "Five-step right and left routes each cover the authored 2 m example");
ok(fiveSteps[0].to[0] === fiveSteps[1].from[0] && fiveSteps[0].from[0] === fiveSteps[1].to[0], "Left return begins where the rightward trip finishes");
const youth = plans("youth-serving-target-game")[0];
ok(youth.presentation.zones.length === 3 && youth.presentation.zones.every(z => z.y + z.h < youth.presentation.net), "All three youth targets lie on the receiving side");
ok(youth.presentation.zones.some(z => /1 pt/.test(z.label) && z.y > 3) && youth.presentation.zones.filter(z => /5 pts/.test(z.label) && z.y < 1).length === 2, "Youth target placement distinguishes easy near and high-value deep corners");
ok(/example/i.test(youth.presentation.exampleNote), "Unprescribed target sizes and points are disclosed as an example");
const fish = plans("dead-fish-serving");
ok(fish.length === 3 && fish[2].actors.some(a => a.authored.posture === "supine"), "Dead Fish has a receiving-court lying target stage");
ok(fish[1].routes.some(r => r.type === "move") && fish[2].routes.some(r => r.type === "move"), "Dead Fish includes miss and rescue return travel");
ok(fish[0].actors.filter(a => a.team === "a").length === 3 && fish[0].actors.filter(a => a.team === "b").length === 3 &&
  fish[0].presentation.props.filter(p => p.type === "ball-cart").length === 2, "Dead Fish retains opposite-side teams and a refill basket for each team");
ok(fish[0].actors.filter(a => a.team === "b").every(a => a.y < fish[0].presentation.bounds.minY) &&
  fish[0].actors.filter(a => a.team === "a").every(a => a.y > fish[0].presentation.bounds.maxY), "Both Dead Fish teams serve behind their own end lines without coordinate clamping");
ok(fish[1].routes[0].via.every(point => point[0] > fish[1].presentation.bounds.maxX + .5), "Dead Fish crosses around the outside sideline and net post");
const shepherd = plans("shepherd-and-sheep");
ok(shepherd.length === 3 && shepherd[0].routes.filter(r => r.type === "move").every(r => r.simultaneousGroup === "pasture-crossing"), "Shepherd crossing is simultaneous");
ok(shepherd[1].actors.some(a => a.authored.balloon === "lost") && shepherd[2].actors.some(a => a.authored.id === "shepherd-2" && a.team === "b" && a.authored.balloon === false), "Shepherd balloon loss visibly changes the player into a sheepdog");
const shepherdCompiled = RR.coachCamLibrary3D.compile(dr("shepherd-and-sheep"));
const shepherdSteps = [0, 1, 2, 3].map(step => shepherdCompiled.phases.find(phase => phase.stepIndex === step));
ok(same(shepherdSteps.map(phase => phase.sceneIndex), [0, 1, 2, 2]), "Actual CoachCam compiler selects crossing, dog tap, conversion, reset scenes in order");
function stepHasRoute(step, pattern) { return shepherdSteps[step].plan.beats.some(beat => beat.routeId && pattern.test(beat.label)); }
ok(shepherdSteps[0].plan.beats.every(beat => beat.motionId === "set") &&
  shepherdSteps[0].plan.beats.filter(beat => beat.variantId === "balloon-walk").length === 4, "Actual crossing contains four balloon-walk beats and no gratuitous warmup");
ok(stepHasRoute(1, /approach balloon/) && shepherdSteps[1].plan.beats.some(beat => beat.motionId === "set" && /open-hand balloon tap/.test(beat.label)), "Actual tap step includes dog approach and open-hand set contact");
ok(stepHasRoute(2, /become a sheepdog/) && shepherdSteps[2].plan.actors.some(actor => actor.authored.id === "shepherd-2" && actor.team === "b"), "Actual conversion step changes role and moves the new dog");
ok(shepherdSteps[3].plan.beats.filter(beat => beat.routeId && /reset round/.test(beat.label)).length === 7, "Actual reset step moves every participant back for the next round");
const zones6 = plans("around-the-world-serving")[0].presentation.zones;
ok(["2","3","4"].every(label => zones6.find(z => z.label === label).y > 3) &&
  ["1","5","6"].every(label => zones6.find(z => z.label === label).y < 1), "Six serving zones preserve volleyball front/back row placement");
ok(plans("setter-hoop-stations")[0].presentation.zones.every(z => z.elevation > 2 && z.vertical), "Setter hoop targets are elevated, not floor hoops");
ok(plans("med-ball-chest-pass-wall")[0].equipment.some(e => e.type === "medicine-ball"), "Medicine ball is not silently classified as a volleyball");
ok(plans("reaction-ball-wall-singles")[0].equipment.some(e => e.type === "reaction-ball"), "Reaction ball keeps its object family");

if (process.argv.includes("--write")) {
  const esc = value => String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
  let report = "# Drill completeness review\n\n" +
    "Scope: all 241 bundled drills, reviewed individually against saved setup, every saved step, authored scenes, participant roles, routes, targets and apparatus. Generated by `node scripts/audit-drill-completeness.js --write`.\n\n" +
    "This is a source and presentation audit, not a claim that every animation was visually certified. The report records factual layout/sequence coverage and the exact body variants selected by the saved steps. Delivered asset validation and representative rendered checks are separate checks. A scoring instruction is not an automatically simulated game result; a repeatable example does not reproduce every random feed, win/loss branch or repetition of a full practice.\n\n" +
    "The 3D presentation now carries the full saved setup and ordered steps, court bounds excluding staging margins, actual cone positions, target areas and rings, fixed apparatus, and actor-bound wearables. Text-only exercise panels are kept out of the physical prop inventory. Target dimensions and example point values added where the drill gives no numbers are identified as examples.\n\n" +
    `Automated audit: ${checks - failures.length}/${checks} assertions pass. Every numbered record below corresponds to one unique catalog drill.\n\n` +
    "## Per-drill review\n\n";
  rows.forEach(row => {
    const d = row.d;
    report += `### ${row.index}. ${d.name} (${d.id})\n\n`;
    report += `- People/layout: ${row.scenePlans.map((p,i) => `scene ${i+1}: ${p.actors.filter(a=>!a.support).length} athletes + ${p.actors.filter(a=>a.support).length} support, ${p.presentation.coordinateSystem}, ${p.presentation.boundaries.length} court region(s)`).join("; ")}.\n`;
    report += `- Equipment: ${d.equipment.length ? d.equipment.join(", ") : "no saved apparatus"}. Located/attached props: ${row.props.length ? row.props.join("; ") : "none specified by scene; ball/wearable families follow their motion contracts"}.\n`;
    report += `- Targets/regions: ${row.zones.length ? row.zones.join("; ") : "none required by the authored scene"}.\n`;
    report += `- Full saved sequence: ${d.steps.map((s,i)=>`${i+1}) ${s}`).join(" ")}\n`;
    report += `- Authored movement/contact sequence: ${row.routeLabels.length ? row.routeLabels.join(" → ") : "stationary exercise; no court travel prescribed"}.\n`;
    if (reviewedCorrections[d.id]) report += `- Review correction: ${reviewedCorrections[d.id]}\n`;
    if (row.variants.length) report += `- Explicit body programs: ${row.variants.join(", ")}.\n`;
    if (motionReview[d.id]) report += `- Movement requirements: ${motionReview[d.id]} These are source-review criteria; source selection alone is not visual certification.\n`;
    if (d.isGame) report += "- Game scope: the saved scoring, reset and finish instructions are presented in sequence; competitive results and optional variations are not inferred from route counts.\n";
    report += "\n";
  });
  fs.writeFileSync(path.join(ROOT, "docs", "drill-completeness-review.md"), report.trimEnd() + "\n");
}
console.log(`Drill completeness: ${checks - failures.length} passed, ${failures.length} failed; ${rows.length} individual drill records`);
failures.forEach(f => console.error("FAIL: " + f));
process.exitCode = failures.length ? 1 : 0;
