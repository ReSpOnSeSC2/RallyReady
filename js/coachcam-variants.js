// Select actual authored movements from the saved drill step, rather than
// playing one generic warm-up/ladder/recovery loop under different captions.
(function (RR) {
  "use strict";
  function v(motion, id, seconds, repetitions, label) {
    var result = { motionId: motion, id: id, durationSeconds: seconds, label: label || id.replace(/-/g, " ") };
    var strides = { "two-in": .5, "in-out": .5, "icky": 1, "hopscotch": .5,
      "lateral-in-out": 1, "lateral-two-in-one-out": 1, "high-knees": .7,
      "heel-kicks": .7, "walking-lunge": .65, "side-lunge": .65, "carioca": 1.5,
      "bear-crawl": .4, "crab-walk": .36, "frog-hop": .7, "balloon-walk": .4 };
    if (strides[id]) result.strideMeters = strides[id];
    if (repetitions) result.repetitions = repetitions;
    return result;
  }
  function seq(items) { return { sequence: items }; }
  function hold(motion, id, seconds) {
    var item = v(motion, id || "", seconds || 3); item.freezeProgress = 0; return item;
  }
  function pair(motion, name, seconds, repetitions) {
    return seq([v(motion, name, seconds, repetitions), v(motion, name + "-right", seconds, repetitions)]);
  }
  function flatten(items) {
    return seq(items.reduce(function (all, item) { return all.concat(item.sequence || [item]); }, []));
  }
  function select(drill, phase, beat) {
    var id = drill.id, step = phase.stepIndex, motion = beat.motionId;
    if (step < 0) return null;
    var route = (phase.plan && phase.plan.routes || []).find(function (item) { return item.id === beat.routeId; });
    var label = ((route && route.label) || beat.label || "").toLowerCase();
    var hasRoute = !!beat.routeId;
    // Stationary setup is an actual held posture. Props remain visible.
    if (step === 0 && /^(mini-band-defensive-shuffle|mini-band-lateral-walks)$/.test(id)) return hold("mini-band", "", 3);
    if (step === 0 && /^(youth-serving-target-game|jump-rope-speed-intervals|ladder-to-dig-reaction)$/.test(id)) return hold("ready", "", 3);
    if (id === "shoulder-band-prep") {
      if (step < 2) return seq([v("band", "band-" + (step ? "internal" : "external") + "-right", 2, 10), v("band", "band-" + (step ? "internal" : "external") + "-left", 2, 10)]);
      if (step === 2) return v("band-upper", "band-pull-apart", 2, 12);
      if (step === 3) return v("band-upper", "band-y-raise", 2, 10);
      return seq([v("warmup", "arm-circles-forward", 2.4, 10), v("warmup", "arm-circles-backward", 2.4, 10)]);
    }
    if (id === "band-pull-aparts") return v("band-upper", ["band-pull-apart", "band-row", "band-overhead-pulldown", "band-pull-apart"][step], 2, [12, 12, 10, 1][step]);
    if (id === "bodyweight-shoulder-activation") {
      if (!step) return seq([v("warmup", "arm-circles-forward", 2.4), v("warmup", "arm-circles-backward", 2.4)]);
      return v("warmup", ["", "arm-hug-open", "goalpost-slides", "shoulder-squeeze"][step], 2, step === 3 ? 10 : 1);
    }
    if (id === "agility-ladder-footwork" && motion === "ladder") return v("ladder", ["two-in", "lateral-in-out", "icky", "hopscotch"][Math.min(step, 3)], [1.25, 3.3, 2.7, 1.5][Math.min(step, 3)]);
    if (id === "ladder-lateral-quicksteps" && motion === "ladder") return v("ladder", step === 2 ? "lateral-two-in-one-out" : "lateral-in-out", step === 2 ? 2.7 : 3.3);
    if (id === "ladder-to-dig-reaction" && motion === "ladder") return v("ladder", "two-in", 1.25);
    if (id === "mini-band-lateral-walks" && step === 3) return v("mini-band", "squat", 2.8);
    if (id === "mirror-defensive-shuffle" && step === 2) return v("warmup", "floor-touch", 2.4);
    if (/^jump-rope-/.test(id) && motion !== "admin") {
      if (id === "jump-rope-single-leg") {
        if (step === 0) return v("jump-rope", "two-foot", 1.25, 10, "20 two-foot jumps");
        if (step === 1) return seq([v("jump-rope", "right-foot", 1.25, 5, "10 right-foot jumps"), v("jump-rope", "left-foot", 1.25, 5, "10 left-foot jumps")]);
        return v("jump-rope", step === 2 ? "alternate" : "two-foot", 1.25);
      }
      if (id === "jump-rope-speed-intervals" && step === 1) {
        var rounds = [];
        for (var round = 1; round <= 5; round++) {
          rounds.push(v("jump-rope", "two-foot", 1.25, 24, "Round " + round + ": 30 seconds work"));
          rounds.push(hold("ready", "", 30));
        }
        return seq(rounds);
      }
      if (id === "jump-rope-coordination" && step === 3) return seq([v("jump-rope", "right-foot", 1.25), v("jump-rope", "left-foot", 1.25)]);
      return v("jump-rope", id === "jump-rope-coordination" && step === 1 ? "alternate" : "two-foot", 1.25);
    }
    if (id === "animal-movement-warmup") return v("warmup", ["bear-crawl", "crab-walk", "frog-hop", "inchworm"][step], [2, 2.2, 1.6, 6][step]);
    if (id === "dynamic-movement-warmup") {
      var backwards = /back|return/.test(label);
      if (step === 1) return hasRoute ? v("warmup", backwards ? "heel-kicks" : "high-knees", 1.7) : seq([v("warmup", "high-knees", 1.7), v("warmup", "heel-kicks", 1.7)]);
      if (step === 2) return hasRoute ? v("warmup", backwards ? "side-lunge" : "walking-lunge", 3.5) : seq([v("warmup", "walking-lunge", 3.5), v("warmup", "side-lunge", 3.5)]);
      if (step === 3) return v("warmup", "carioca", 3.1);
    }
    if (id === "dynamic-mobility-flow") {
      if (step === 0) return seq([v("warmup", "leg-swing-front", 4), v("warmup", "leg-swing-side", 4)]);
      if (step === 1) return seq([v("warmup", "knee-pull", 4), v("warmup", "heel-pull", 4)]);
      if (step === 2) return pair("stretch", "lunge-rotation", 3);
      if (step === 3) return seq([v("warmup", "arm-circles-forward", 2.4), v("warmup", "arm-hug-open", 2)]);
    }
    if (id === "foam-roll-mobility-recovery") {
      if (step === 0) return flatten([pair("foam", "calves", 6), v("foam", "quads", 6), v("foam", "hamstrings", 6)]);
      if (step === 1) return v("foam", "upper-back", 6);
      if (step === 2) return v("warmup", "arm-circles-forward", 2.4);
      return v("stretch", "childs-pose", 3);
    }
    if (id === "foam-roller-leg-reset") {
      if (step === 0) return v("foam", "quads", 6, 5);
      if (step === 1) return pair("foam", "calves", 6, 5);
      if (step === 2) return pair("foam", "side-hip", 6);
      return v("foam", "quads", 6);
    }
    if (id === "foam-roller-upper-back") {
      if (step === 0 || step === 2) return hold("foam", "upper-back", 3);
      if (step === 1) return v("foam", "upper-back", 6, 5);
      return v("warmup", "shoulder-squeeze", 2);
    }
    if (id === "hamstring-and-hip-stretch") return step === 0 ? v("stretch", "hamstring", 3, 10) : pair("stretch", ["", "figure-four", "hip-flexor", "supine-twist"][step], 3, 10);
    if (id === "yoga-flow-cooldown") {
      if (step === 0) return seq([v("stretch", "forward-fold", 3), v("stretch", "side-bend", 3)]);
      if (step === 1) return pair("stretch", "hip-flexor", 3);
      if (step === 2) return flatten([v("stretch", "childs-pose", 3), pair("stretch", "supine-twist", 3)]);
      return hold("ready", "", 3);
    }
    if (id === "mat-mobility-flow") {
      if (step === 0) return v("warmup", "cat-camel", 4, 6);
      if (step === 1) return pair("stretch", "lunge-rotation", 3);
      if (step === 2) return v("stretch", "childs-pose", 3);
      return v("warmup", "inchworm", 6);
    }
    if (id === "static-stretch-cooldown") {
      if (step === 0) return flatten([pair("stretch", "cross-chest", 3, 8), pair("stretch", "triceps", 3, 8)]);
      if (step === 2) return flatten([pair("stretch", "standing-quad", 3), pair("stretch", "standing-hamstring", 3), pair("stretch", "standing-calf", 3)]);
      if (step === 3) return flatten([pair("stretch", "seated-figure-four", 3), pair("stretch", "seated-twist", 3)]);
    }
    if (id === "partner-stretch-and-reflect" && step < 2) return flatten([pair("stretch", "standing-calf", 3), v("stretch", "hamstring", 3), pair("stretch", "standing-quad", 3)]);
    if (id === "calf-and-ankle-recovery" && step < 2) return pair("stretch", step === 1 ? "bent-knee-calf" : "standing-calf", 3, 10);
    if (id === "slide-approach-attack" && /^(attack|approach-jump)$/.test(motion)) return v("attack", "slide-one-foot", 1.6);
    if (id === "shepherd-and-sheep" && hasRoute && /^move/.test(route && route.type || "")) {
      var actor = (phase.plan.actors || []).find(function (item) { return item.id === beat.actorId; });
      if (actor && actor.team === "a") return v("set", "balloon-walk", 1.25);
    }
    return null;
  }
  RR.coachCamVariants = { select: select };
})(window.RR = window.RR || {});
