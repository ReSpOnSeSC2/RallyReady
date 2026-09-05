// Verify authored actions reach actual playback, not only the diagram inventory.
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm"), assert = require("assert");
const ROOT = path.join(__dirname, "..");
const sandbox = { console }; sandbox.window = sandbox;
vm.createContext(sandbox);
const files = ["drills", ...Array.from({ length: 10 }, (_, i) => "drills-" + (i + 2)),
  "extras-build", "format", "extras-data", ...Array.from({ length: 11 }, (_, i) => "extras-data-" + (i + 2)),
  "drill-human-motion", "drill-choreography", "coachcam-variants", "coachcam-library-3d", "drill-animation"];
for (const file of files) vm.runInContext(fs.readFileSync(path.join(ROOT, "js", file + ".js"), "utf8"), sandbox);
const RR = sandbox.RR, api = RR.coachCamLibrary3D;
let checks = 0, phases = 0, scoped = 0;
const failures = [];
function check(value, message) { checks++; if (!value) failures.push(message); }
function distance(route) {
  const points = [route.from, ...(route.via || []), route.to];
  return points.slice(1).reduce((total, p, i) => total + Math.hypot(p[0] - points[i][0], p[1] - points[i][1]), 0);
}
for (const drill of RR.drills.filter(api.isEligible)) {
  const compiled = api.compile(drill);
  assert(compiled, drill.id + " compiles");
  const scenes = RR.drillAnimation.scenesFor(drill);
  scenes.forEach((scene, index) => {
    check(compiled.phases.some(phase => phase.sceneIndex === index), `${drill.id}: scene ${index + 1} reaches playback`);
  });
  for (const phase of compiled.phases) {
    phases++;
    const context = `${drill.id}, step ${phase.stepIndex + 1}`;
    const moves = [];
    for (const route of phase.plan.routes) {
      const beats = phase.plan.beats.filter(beat => beat.routeId === route.id);
      if (route.stepScoped) {
        scoped++;
        check(beats.length > 0, `${context}: explicitly authored '${route.label}' must execute, not remain a decorative arrow`);
      }
      if (route.type !== "move" || distance(route) < 0.01) continue;
      beats.filter(beat => !api.mechanics.stationMotion(beat.motionId) && !Number.isFinite(beat.freezeProgress))
        .forEach(beat => moves.push(beat));
    }
    for (let i = 0; i < moves.length; i++) for (let j = i + 1; j < moves.length; j++) {
      const a = moves[i], b = moves[j];
      if (a.actorId !== b.actorId || a.routeId === b.routeId) continue;
      check(Math.min(a.endMs, b.endMs) - Math.max(a.startMs, b.startMs) < 1,
        `${context}: ${a.actorId} cannot execute two different movement routes at once`);
    }
  }
}
if (failures.length) {
  console.error(`Complete playback: ${checks - failures.length} passed; ${failures.length} failed`);
  failures.forEach(failure => console.error("FAIL:", failure));
  process.exit(1);
}
console.log(`Complete playback: ${checks} checks passed across ${phases} shared-library phases and ${scoped} explicitly scoped routes.`);
