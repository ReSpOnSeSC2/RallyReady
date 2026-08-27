// drill-animation.js — responsive, data-driven drill demonstrations.
//
// The drill library already carries authored court specs in RR.extras. This
// module turns those specs into motion instead of replacing them with static
// artwork: balls travel along the authored ball/serve paths, movement routes
// carry a runner marker, and path-free formations cycle a focus ring through
// the real player spots. The remaining bundled drills use reviewed exact
// mappings. Coach-created drills get a strict factual view of only their saved
// player count, equipment, setup, and steps—never an inferred route or role.
//
// Everything is inline SVG and CSS: no network, fake roster, video, canvas, or
// timer data. Rendering remains useful with reduced motion enabled, where the
// moving pieces settle into a complete still.
window.RR = window.RR || {};

RR.drillAnimation = (function () {
  "use strict";

  var sequence = 0;
  var MAX_W = 540;
  var MAX_H = 390;
  var PAD = 22;
  var activeRoots = [];
  var intersectionObserver = null;
  var visibilityHooked = false;

  // Ball paths in the authored diagrams can mean a rally sequence, separate
  // feeds, or mutually exclusive choices. Geometry alone cannot tell those
  // meanings apart. This reviewed per-drill registry explicitly names only
  // the path indices that belong to one continuously traveling object.
  // Each array position is a scene index; `|` separates independent chains.
  var REVIEWED_BALL_CHAINS = {
    "partner-pass-and-move-warmup": [null, "0,2"],
    "pepper": ["0,1,2", "0,1,2"],
    "wall-forearm-passing": ["0,1"],
    "three-contact-partner-pepper": ["0,1,2"],
    "partner-forearm-passing": ["0,1"],
    "three-person-serve-receive": [null, "0,1"],
    "butterfly-passing": ["0,1"],
    "passing-to-setter-target": ["0,1"],
    "partner-setting": ["0,1"],
    "setter-footwork-to-target": [null, null, "0,1"],
    "back-setting": ["0,1"],
    "self-toss-spike": ["0,1"],
    "hitting-off-a-live-set": [null, "2,3"],
    "pursuit-emergency-defense": [null, "1,2"],
    "dig-to-target": ["0,1"],
    "free-ball-transition": [null, "0,1,2"],
    "platform-angle-passing": ["2,3"],
    "out-of-system-passing": ["0,1", "0,1,2"],
    "libero-serve-receive-range": ["0,1"],
    "two-person-serve-receive": ["0,1"],
    "jump-setting": [null, "1,2"],
    "tempo-setting": ["0,1", "0,1", "0,1"],
    "two-ball-setting-footwork": ["0,1", "1,2"],
    "high-contact-arm-swing": ["0,1"],
    "libero-dig-and-run-through": ["0,1", "0,2"],
    "overhead-defensive-hands": ["0,1"],
    "run-the-rotation-offense": ["0,1"],
    "butterfly-pepper": ["0,1,2"],
    "pepper-to-zones": ["0,1"],
    "cooperative-pass-count": ["0,1,2,3,4,5"],
    "bounce-and-dig": ["0,1"],
    "overhand-throw-progression": [null, "0,1"],
    "standing-spike-target": ["0,1"],
    "toss-and-pass-intro": ["0,1"],
    "pass-to-the-coach": ["0,1"],
    "hot-potato-ball-control": ["0,1,2,3,4,5"],
    "toss-bump-catch-control": ["0,1"],
    "four-person-pepper": ["0,1,2,3"],
    "w-formation-serve-receive": [null, "0,1"],
    "setting-accuracy-hoops": ["0,1"],
    "transition-setting-back-row": [null, "1,2"],
    "partner-mini-serve-rally": ["0,1"],
    "serve-the-seam": [null, "0,1"],
    "transition-hitting-off-defense": ["0,1"],
    "transition-dig-to-attack": ["0,1", "0,2"],
    "wall-set-and-pass-combo": ["0,1"],
    "serve-receive-intro-easy": ["0,1"],
    "overhead-emergency-pass": ["0,1"],
    "setter-triangle-continuous": ["0,1,2"],
    "back-set-to-the-antenna": ["0,1,2"],
    "toss-and-tip": ["0,1"],
    "backcourt-spike-coverage": [null, "0,1"],
    "off-the-block-cover": ["0,1"],
    "continuous-cross-court-control": ["0,1"],
    "defensive-pepper": ["0,1,2"],
    "partner-catch-bump-control": ["0,1"],
    "mid-court-passing-decision": ["0,1"],
    "passing-box-drill": ["0,1,2,3"],
    "right-side-back-set-footwork": [null, null, "0,1"],
    "approach-timing-off-the-pass": [null, "2,3"],
    "soft-block-deflection": ["0,1"],
    "down-ball-digging-lines": ["0,1", "0,1"],
    "team-circle-recovery": ["0,1,2,3,4,5"],
    "partner-medicine-ball-power": ["0,1"],
    "bump-over-net-to-targets": ["0,1"],
    "partner-pass-and-set-continuous": ["0,1"],
    "backcourt-communication-passing": ["0,1"],
    "serve-receive-vs-jump-serve": ["0,1"],
    "setting-over-net-to-target": ["0,1"],
    "setting-quick-connection": ["0,1"],
    "hitting-from-all-positions": ["2,3", "2,3", "2,3"],
    "attack-and-transition-to-defense": ["2,3", null, "0,1"],
    "collapse-dig-and-recover": ["0,1"],
    "amoeba-team-game": ["0,1,2,3,4,5,6"],
    "passing-21-circle": ["0,1,2,3,4"],
    "serve-and-pass-crossover": ["0,1"],
    "pass-set-hit-triangle": ["0,1,2"],
    "setter-release-from-base": [null, null, "0,1"],
    "box-hitting-reps": ["0,1"],
    "ladder-to-dig-reaction": ["1,2"],
    "med-ball-overhead-slams": ["0,1"],
    "med-ball-chest-pass-wall": ["0,1"],
    "reaction-ball-wall-singles": ["0,1"],
    "pass-to-the-hoop-target": ["0,1"],
    "setter-hoop-stations": ["0,1"],
    "hit-the-target-zones": ["1,2"],
    "wall-setting": ["0,4|1,5|2,6|3,7"],
    "roll-the-ball-dig": ["0,1"]
  };

  // A few legacy authored diagrams used `kind: "move"` for object travel so
  // their dashed route styling read well in the old static renderer. These
  // reviewed exceptions travel as balls while retaining that route styling.
  var REVIEWED_BALL_PATHS = {
    "wall-forearm-passing": ["1"],
    "wall-setting": ["4,5,6,7"],
    "roll-the-ball-dig": ["0"]
  };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function attrs(map) {
    var out = "";
    Object.keys(map || {}).forEach(function (key) {
      var value = map[key];
      if (value == null || value === false) return;
      if (typeof value === "number") value = round(value);
      out += " " + key + '="' + esc(value === true ? "" : value) + '"';
    });
    return out;
  }

  function el(tag, map, inner) {
    return "<" + tag + attrs(map) + ">" + (inner || "") + "</" + tag + ">";
  }

  function selfEl(tag, map) { return "<" + tag + attrs(map) + "/>"; }
  function round(n) { return Math.round(n * 10) / 10; }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function spread(count, start, end) {
    count = Math.max(1, count || 1);
    if (count === 1) return [(start + end) / 2];
    var result = [];
    var step = (end - start) / (count - 1);
    for (var i = 0; i < count; i++) result.push(start + i * step);
    return result;
  }

  function cleanString(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function cleanStringList(value) {
    if (!Array.isArray(value)) return [];
    return value.map(cleanString).filter(function (item) { return !!item; });
  }

  function realCaption(drill) {
    if (drill && drill.setup) return drill.setup;
    if (drill && drill.steps && drill.steps.length) return drill.steps[0];
    // A sparse coach-authored drill may deliberately contain only its saved
    // name. Repeating that fact is honest; inventing roles or a sequence is not.
    return drill && drill.name ? drill.name : "";
  }

  // ---- Derived scenes for the few drills without authored court data ------
  function ladderScene(drill) {
    var zones = [];
    for (var i = 0; i < 7; i++) zones.push({ x: 3.3, y: 0.6 + i * 1.05, w: 2.4, h: 0.85, tone: "neutral", label: "" });
    return {
      title: "Quick feet through the ladder",
      caption: realCaption(drill),
      w: 9, h: 8.8, zones: zones,
      players: [{ x: 4.5, y: 8.2, label: "", team: "a", note: "start" }],
      paths: [{
        from: [4.5, 7.8], to: [4.5, 0.8], kind: "move",
        via: [[3.8, 6.8], [5.2, 5.75], [3.8, 4.7], [5.2, 3.65], [3.8, 2.6], [5.2, 1.55]]
      }]
    };
  }

  function jumpRopeScene(drill) {
    var count = clamp(drill.minPlayers || 1, 1, 4);
    var xs = spread(count, 1.4, 7.6);
    return {
      title: "Fast, balanced contacts",
      caption: realCaption(drill),
      w: 9, h: 8,
      players: xs.map(function (x) { return { x: x, y: 5.2, label: "", team: "a" }; }),
      rings: xs.map(function (x) { return { x: x, y: 4.8, r: 1.05, tone: "rope" }; }),
      paths: xs.map(function (x) { return { from: [x, 5.2], to: [x, 4.35], kind: "move" }; })
    };
  }

  function blockReachScene(drill) {
    return {
      title: "Press over the net",
      caption: realCaption(drill),
      w: 9, h: 8,
      court: [{ x: 0, y: 0.4, w: 9, h: 7.2 }],
      net: 3.25,
      zones: [{ x: 3.45, y: 4.55, w: 2.1, h: 1.25, tone: "neutral", label: "STEP" }],
      rings: [{ x: 4.5, y: 2.35, r: 0.72, tone: "target" }],
      players: [{ x: 4.5, y: 5.2, label: "B", team: "a" }],
      paths: [{ from: [4.5, 4.8], to: [4.5, 2.35], kind: "move", curve: 0.08, label: "PRESS" }],
      legend: [{ tone: "a", text: "Blocker" }, { tone: "move", text: "Hand press" }]
    };
  }

  function matDefenseScene(drill) {
    return {
      title: "Roll, side-roll, sprawl, pop up",
      caption: realCaption(drill),
      w: 9, h: 8,
      zones: [{ x: 0.55, y: 0.8, w: 7.9, h: 6.35, tone: "neutral", label: "MAT" }],
      players: [{ x: 1.55, y: 5.8, label: "D", team: "a", note: "start" }],
      paths: [
        { from: [1.9, 5.55], to: [3.45, 3.2], via: [[2.9, 5]], kind: "move", curve: -0.12, label: "ROLL" },
        { from: [3.45, 3.2], to: [5.15, 4.8], kind: "move", curve: 0.14, label: "SIDE ROLL" },
        { from: [5.15, 4.8], to: [7.35, 3.55], kind: "move", label: "SPRAWL" },
        { from: [7.35, 3.55], to: [7.35, 5.75], kind: "move", label: "POP UP" }
      ],
      legend: [{ tone: "move", text: "Saved safe-floor sequence" }]
    };
  }

  function pastureScene(drill) {
    return {
      title: "Cross the pasture with control",
      caption: realCaption(drill),
      w: 10, h: 8,
      zones: [{ x: 0.55, y: 0.65, w: 8.9, h: 6.7, tone: "good", label: "PASTURE" }],
      cones: [
        { x: 0.75, y: 0.9 }, { x: 9.25, y: 0.9 },
        { x: 0.75, y: 7.1 }, { x: 9.25, y: 7.1 }
      ],
      players: [
        { x: 1.55, y: 1.65, label: "S", team: "a" },
        { x: 1.55, y: 3.2, label: "S", team: "a" },
        { x: 1.55, y: 4.8, label: "S", team: "a" },
        { x: 1.55, y: 6.35, label: "S", team: "a" },
        { x: 4.7, y: 2.45, label: "D", team: "b" },
        { x: 5.7, y: 4, label: "D", team: "b" },
        { x: 6.35, y: 5.55, label: "D", team: "b" }
      ],
      paths: [
        { from: [1.9, 1.65], to: [8.35, 1.65], via: [[4.1, 1.35], [6.25, 2]], kind: "move" },
        { from: [1.9, 3.2], to: [8.35, 3.2], via: [[3.8, 3.55], [6.3, 2.9]], kind: "move" },
        { from: [1.9, 4.8], to: [8.35, 4.8], via: [[4.05, 4.4], [6.2, 5.1]], kind: "move" },
        { from: [1.9, 6.35], to: [8.35, 6.35], via: [[4.15, 6.05], [6.25, 6.6]], kind: "move" },
        { from: [2.15, 1.6], to: [8.05, 1.6], via: [[4.1, 0.95], [6.1, 2.3]], kind: "ball", object: "balloon" },
        { from: [2.15, 3.15], to: [8.05, 3.15], via: [[4.05, 2.4], [6.05, 3.95]], kind: "ball", object: "balloon" },
        { from: [2.15, 4.75], to: [8.05, 4.75], via: [[4.05, 4], [6.05, 5.55]], kind: "ball", object: "balloon" },
        { from: [2.15, 6.3], to: [8.05, 6.3], via: [[4.05, 5.55], [6.05, 7]], kind: "ball", object: "balloon" }
      ],
      legend: [
        { tone: "a", text: "Shepherds" },
        { tone: "b", text: "Sheepdogs" },
        { tone: "move", text: "Crossing route" }
      ]
    };
  }

  // ---- Exact field-derived programs for the 31 bundled drills that predate
  // authored court specs. Each route below is selected by drill id, because an
  // equipment token alone cannot distinguish a floor slam from a wall throw or
  // a controlled step-up from a depth drop.
  function phaseSequenceScene(drill, title, labels, surface) {
    var zones = [];
    if (surface) zones.push({ x: 0.55, y: 0.45, w: 7.9, h: 0.85, tone: "good", label: surface });
    labels.slice(0, 4).forEach(function (label, index) {
      var col = index % 2;
      var row = Math.floor(index / 2);
      zones.push({
        x: 0.55 + col * 4.1,
        y: 1.65 + row * 2.55,
        w: 3.55, h: 1.95,
        tone: index % 2 ? "good" : "neutral",
        label: label
      });
    });
    return { title: title, caption: realCaption(drill), w: 9, h: 7,
      zones: zones, legend: [{ tone: "move", text: "Saved sequence" }] };
  }

  function upperActionScene(drill, title, banner, paths) {
    return {
      title: title,
      caption: realCaption(drill),
      w: 9, h: 8,
      zones: [{ x: 0.55, y: 0.55, w: 7.9, h: 0.9, tone: "neutral", label: banner }],
      players: [{ x: 4.5, y: 4.9, label: "", team: "a" }],
      rings: [{ x: 4.5, y: 3.75, r: 1.05, tone: "calm" }],
      paths: paths,
      legend: [{ tone: "a", text: "Athlete" }, { tone: "move", text: "Arm action" }]
    };
  }

  function lowerBandScene(drill, title, paths) {
    return {
      title: title, caption: realCaption(drill), w: 9, h: 8,
      zones: [{ x: 0.5, y: 0.65, w: 8, h: 6.55, tone: "neutral", label: "LOW BAND POSITION" }],
      players: [{ x: 4.5, y: 5.15, label: "", team: "a" }],
      paths: paths,
      legend: [{ tone: "a", text: "Athlete" }, { tone: "move", text: "Saved footwork" }]
    };
  }

  function gluteBridgeScene(drill) {
    return {
      title: "Bridge, hold, then side-step", caption: realCaption(drill), w: 9, h: 8,
      zones: [
        { x: 0.65, y: 1, w: 3.55, h: 5.9, tone: "neutral", label: "GLUTE BRIDGE" },
        { x: 4.8, y: 1, w: 3.55, h: 5.9, tone: "good", label: "SIDE STEPS" }
      ],
      players: [{ x: 2.4, y: 5.45, label: "", team: "a" }],
      paths: [
        { from: [2.4, 5.4], to: [2.4, 3.55], kind: "move", label: "LIFT + HOLD" },
        { from: [5.35, 5], to: [7.75, 5], kind: "move", label: "8 EACH WAY" }
      ],
      legend: [{ tone: "move", text: "Saved two-part sequence" }]
    };
  }

  function breathingScene(drill) {
    return {
      title: "Breathe, reflect, close together", caption: realCaption(drill), w: 9, h: 8,
      zones: [
        { x: 0.6, y: 0.65, w: 3.5, h: 1.25, tone: "neutral", label: "IN 4" },
        { x: 4.9, y: 0.65, w: 3.5, h: 1.25, tone: "good", label: "OUT 6" },
        { x: 0.6, y: 6.1, w: 3.5, h: 1.25, tone: "neutral", label: "REFLECT" },
        { x: 4.9, y: 6.1, w: 3.5, h: 1.25, tone: "good", label: "SHARE + CHEER" }
      ],
      players: [{ x: 4.5, y: 4, label: "", team: "n" }],
      rings: [{ x: 4.5, y: 4, r: 1.35, tone: "calm" }],
      legend: [{ tone: "n", text: "Sit or stand comfortably" }]
    };
  }

  function jumpRopeProgram(drill, title, labels) {
    var scene = jumpRopeScene(drill);
    scene.title = title;
    scene.zones = labels.map(function (label, index) {
      return { x: 0.35 + index * (8.3 / labels.length), y: 0.35,
        w: 8 / labels.length, h: 1.05, tone: index % 2 ? "good" : "neutral", label: label };
    });
    scene.legend = [{ tone: "move", text: "Rope contacts" }];
    return scene;
  }

  function ladderLateralScene(drill) {
    var scene = ladderScene(drill);
    scene.title = "Sideways in-in, out-out";
    scene.paths.push({ from: [4.5, 0.85], to: [4.5, 7.75],
      via: [[5.2, 1.55], [3.8, 2.6], [5.2, 3.65], [3.8, 4.7], [5.2, 5.75], [3.8, 6.8]], kind: "move", label: "RETURN" });
    scene.paths.push({ from: [4.5, 0.8], to: [7.65, 0.8], kind: "move", label: "SHUFFLE OUT" });
    scene.legend = [{ tone: "move", text: "Lateral footwork" }];
    return scene;
  }

  function rotationalPowerScene(drill) {
    return {
      title: "Rotate and throw to the wall", caption: realCaption(drill), w: 9, h: 8,
      zones: [{ x: 8, y: 0.55, w: 0.55, h: 6.9, tone: "neutral", label: "" }],
      players: [{ x: 2.2, y: 4.75, label: "", team: "a" }],
      paths: [{ from: [2.65, 4.35], to: [7.8, 3.25], kind: "ball", object: "medicine", curve: -0.18, label: "ROTATE" }],
      legend: [{ tone: "target", text: "Wall contact" }]
    };
  }

  function medicineSlamScene(drill) {
    return {
      title: "Snap straight down to the floor", caption: realCaption(drill), w: 9, h: 8,
      zones: [{ x: 2.4, y: 6.55, w: 4.2, h: 0.75, tone: "target", label: "FLOOR CONTACT" }],
      players: [{ x: 4.5, y: 4.65, label: "", team: "a" }],
      paths: [
        { from: [4.5, 1.35], to: [4.5, 6.45], kind: "ball", object: "medicine", label: "SLAM" },
        { from: [4.5, 6.35], to: [4.5, 5.15], kind: "ball", object: "medicine", label: "BOUNCE" }
      ],
      legend: [{ tone: "target", text: "Floor — no wall" }]
    };
  }

  function chestPassWallScene(drill) {
    return {
      title: "Chest pass and catch the rebound", caption: realCaption(drill), w: 9, h: 8,
      zones: [{ x: 8, y: 0.45, w: 0.55, h: 7.1, tone: "neutral", label: "" }],
      players: [{ x: 1.65, y: 4.9, label: "", team: "a" }],
      paths: [
        { from: [2.1, 4.35], to: [7.8, 4.35], kind: "ball", object: "medicine", label: "CHEST PASS" },
        { from: [7.75, 4.55], to: [2.2, 4.8], kind: "ball", object: "medicine", curve: 0.08, label: "CATCH" }
      ],
      legend: [{ tone: "target", text: "Saved wall" }]
    };
  }

  function reactionWallScene(drill) {
    return {
      title: "Throw low, read the angle, shuffle", caption: realCaption(drill), w: 9, h: 8,
      zones: [{ x: 8, y: 0.45, w: 0.55, h: 7.1, tone: "neutral", label: "" }],
      players: [{ x: 1.55, y: 5.6, label: "", team: "a" }],
      paths: [
        { from: [1.95, 5.25], to: [7.8, 4.25], kind: "ball", object: "reaction", label: "LOW THROW" },
        { from: [7.75, 4.25], to: [4.5, 6.2], via: [[6.55, 5.05]], kind: "ball", object: "reaction", label: "ANGLE" },
        { from: [1.9, 5.65], to: [4.3, 6.2], kind: "move", label: "SHUFFLE" }
      ],
      legend: [{ tone: "move", text: "First step to rebound" }]
    };
  }

  function boxStepUpScene(drill) {
    return {
      title: "Step up, drive the knee, lower", caption: realCaption(drill), w: 9, h: 8,
      zones: [{ x: 3.35, y: 3.25, w: 2.3, h: 2.2, tone: "target", label: "BOX" }],
      players: [{ x: 4.5, y: 6.65, label: "", team: "a" }],
      paths: [
        { from: [4.5, 6.25], to: [4.5, 3.65], kind: "move", label: "STEP UP" },
        { from: [4.5, 3.65], to: [4.5, 6.25], kind: "move", curve: 0.12, label: "LOWER" }
      ],
      rings: [{ x: 4.5, y: 2.7, r: 0.65, tone: "target" }],
      legend: [{ tone: "move", text: "Controlled — no jump" }]
    };
  }

  function boxDepthDropScene(drill) {
    return {
      title: "Step off and stick the landing", caption: realCaption(drill), w: 9, h: 8,
      zones: [
        { x: 1.2, y: 2.25, w: 2.35, h: 2.2, tone: "neutral", label: "LOW BOX" },
        { x: 5.15, y: 5.8, w: 2.65, h: 1.2, tone: "target", label: "STICK" }
      ],
      players: [{ x: 2.35, y: 1.75, label: "", team: "a" }],
      paths: [{ from: [2.7, 2.1], to: [6.45, 5.65], kind: "move", curve: 0.14, label: "STEP OFF" }],
      rings: [{ x: 6.45, y: 5.75, r: 0.72, tone: "target" }],
      legend: [{ tone: "target", text: "Soft two-foot landing" }]
    };
  }

  function balloonSoloScene(drill) {
    return {
      title: "Keep your own balloon overhead", caption: realCaption(drill), w: 9, h: 8,
      zones: [{ x: 0.6, y: 0.65, w: 7.8, h: 6.65, tone: "good", label: "OPEN SPACE · NO NET" }],
      players: [{ x: 4.5, y: 6.15, label: "", team: "a" }],
      paths: [{ from: [4.5, 5.7], to: [4.5, 5.15],
        via: [[3.65, 3.8], [4.45, 1.65], [5.35, 3.7]], kind: "ball", object: "balloon", label: "SET / TAP" }],
      legend: [{ tone: "a", text: "One player" }, { tone: "good", text: "Solo keep-up" }]
    };
  }

  // Custom drills do not store actor bindings or motion paths. Their fallback
  // therefore visualizes only explicit saved facts and advances through exact
  // saved copy. Neutral focus/breathe motion makes the panel alive without
  // guessing a court, role, route, target, or scoring rule.
  function customFactScene(facts, title, caption) {
    var equipmentZones = facts.equipment.slice(0, 4).map(function (item, index) {
      var col = index % 2;
      var row = Math.floor(index / 2);
      return { x: 0.55 + col * 4.15, y: 0.75 + row * 1.45, w: 3.6, h: 1.05,
        tone: "neutral", label: item.toUpperCase() };
    });
    var shown = facts.minPlayers == null ? 0 : Math.min(facts.minPlayers, 6);
    var playerY = equipmentZones.length ? 6.25 : 4.75;
    var playerXs = spread(Math.max(1, shown), 1.25, 7.75);
    var players = [];
    for (var i = 0; i < shown; i++) {
      var remaining = facts.minPlayers - (shown - 1);
      players.push({
        x: playerXs[i], y: playerY,
        label: i === shown - 1 && remaining > 1 ? "+" + remaining : "",
        team: "n"
      });
    }
    var legend = [];
    if (facts.minPlayers != null) {
      legend.push({ tone: "n", text: "Saved minimum: " + facts.minPlayers +
        (facts.minPlayers === 1 ? " player" : " players") });
    }
    facts.equipment.forEach(function (item) {
      legend.push({ tone: "neutral", text: item });
    });
    if (facts.isGame) legend.push({ tone: "good", text: "Saved as a game" });
    return {
      title: title,
      caption: caption,
      w: 9, h: 8,
      zones: equipmentZones,
      players: players,
      rings: !players.length && !equipmentZones.length
        ? [{ x: 4.5, y: 4, r: 1.15, tone: "calm" }] : [],
      legend: legend
    };
  }

  function customScenes(drill) {
    drill = drill || {};
    var rawMin = drill.minPlayers;
    var validMin = typeof rawMin === "number" && isFinite(rawMin) &&
      Math.floor(rawMin) === rawMin && rawMin >= 1 && rawMin <= 30 ? rawMin : null;
    var facts = {
      name: cleanString(drill.name),
      skill: cleanString(drill.skill),
      setup: cleanString(drill.setup),
      steps: cleanStringList(drill.steps),
      equipment: cleanStringList(drill.equipment),
      minPlayers: validMin,
      isGame: drill.isGame === true
    };
    var scenes = [];
    if (facts.setup) scenes.push(customFactScene(facts, "Setup", facts.setup));
    facts.steps.forEach(function (step, index) {
      // Authored drill examples top out at four phases; use the same bound so
      // imported/custom step lists cannot overflow the smallest supported phone.
      if (scenes.length < 4) scenes.push(customFactScene(facts, "Step " + (index + 1), step));
    });
    if (!scenes.length) {
      scenes.push(customFactScene(facts, facts.name || "Saved drill", "No setup or steps saved yet."));
    }
    return scenes;
  }

  function deriveSpec(drill) {
    drill = drill || {};
    var id = String(drill.id || "");
    if (drill.custom) return customScenes(drill)[0];
    switch (id) {
      case "shoulder-band-prep":
        return upperActionScene(drill, "Rotate, pull apart, raise", "SHOULDER BAND", [
          { from: [4.05, 4], to: [2.55, 4], kind: "move", label: "ROTATE OUT" },
          { from: [4.95, 4], to: [6.45, 4], kind: "move", label: "ROTATE IN" },
          { from: [4.15, 3.7], to: [2.7, 1.75], kind: "move", label: "Y RAISE" },
          { from: [4.85, 3.7], to: [6.3, 1.75], kind: "move" }
        ]);
      case "static-stretch-cooldown":
        return phaseSequenceScene(drill, "Four-part guided stretch",
          ["ARMS", "WRISTS", "LEGS", "FLOOR + TWIST"]);
      case "core-rotational-power": return rotationalPowerScene(drill);
      case "foam-roll-mobility-recovery":
        return phaseSequenceScene(drill, "Roll, mobilize, then breathe",
          ["LEGS", "UPPER BACK", "CIRCLES", "BREATHE"], "FOAM ROLLER");
      case "jump-rope-coordination":
        return jumpRopeProgram(drill, "Build the rope progression",
          ["2 FEET", "ALTERNATE", "FAST", "1 LEG"]);
      case "yoga-flow-cooldown":
        return phaseSequenceScene(drill, "Slow floor flow",
          ["FOLD + BEND", "LOW LUNGE", "CHILD'S POSE", "LIE + BREATHE"], "MAT");
      case "bodyweight-shoulder-activation":
        return upperActionScene(drill, "Circle, swing, slide, squeeze", "NO EQUIPMENT", [
          { from: [3.75, 3.8], to: [3.75, 3.8], via: [[3.1, 3.1], [3.75, 2.5], [4.4, 3.1]], kind: "move", label: "CIRCLES" },
          { from: [3.25, 4.25], to: [5.75, 4.25], kind: "move", label: "CROSS + OPEN" },
          { from: [4.5, 4], to: [4.5, 2], kind: "move", label: "GOAL-POST SLIDE" }
        ]);
      case "guided-breathing-and-reflection": return breathingScene(drill);
      case "mini-band-lateral-walks":
        return lowerBandScene(drill, "Side steps, monster walks, squats", [
          { from: [4.25, 5.1], to: [7.55, 5.1], kind: "move", label: "SIDE STEPS" },
          { from: [4.5, 4.8], to: [4.5, 2.05], kind: "move", label: "MONSTER WALK" },
          { from: [3.7, 5.5], to: [3.7, 6.25], kind: "move", label: "SQUAT" }
        ]);
      case "calf-and-ankle-recovery":
        return phaseSequenceScene(drill, "Calf and ankle reset",
          ["CALF — STRAIGHT", "CALF — BENT", "ANKLE CIRCLES", "HEEL RAISES"], "WALL");
      case "dynamic-mobility-flow":
        return phaseSequenceScene(drill, "Move through four mobility phases",
          ["LEG SWINGS", "WALK + PULL", "LUNGE + ROTATE", "ARM + TRUNK"]);
      case "hamstring-and-hip-stretch":
        return phaseSequenceScene(drill, "Hamstrings, hips, and twist",
          ["HAMSTRING", "FIGURE FOUR", "HIP-FLEXOR", "LYING TWIST"], "MAT");
      case "balloon-keep-it-up": return balloonSoloScene(drill);
      case "shepherd-and-sheep": return pastureScene(drill);
      case "band-pull-aparts":
        return upperActionScene(drill, "Pull apart, row, pull down", "UPPER-BACK BAND", [
          { from: [4.05, 4], to: [2.4, 4], kind: "move", label: "PULL APART" },
          { from: [4.95, 4], to: [6.6, 4], kind: "move" },
          { from: [4.5, 2], to: [4.5, 3.5], kind: "move", label: "PULL DOWN" }
        ]);
      case "band-arm-speed":
        return upperActionScene(drill, "Load high and swing through", "BAND ANCHORED BEHIND", [
          { from: [3.1, 4.2], to: [6.45, 2.35], kind: "move", curve: -0.28, label: "RESISTED SWING" },
          { from: [3.2, 4.55], to: [6.55, 2.7], kind: "move", curve: -0.2, label: "FREE SWING" }
        ]);
      case "mini-band-glute-bridges": return gluteBridgeScene(drill);
      case "mini-band-defensive-shuffle":
        return lowerBandScene(drill, "Shuffle both ways, then box", [
          { from: [4.35, 5.1], to: [7.5, 5.1], kind: "move", label: "RIGHT" },
          { from: [7.45, 5.35], to: [1.45, 5.35], kind: "move", label: "LEFT" },
          { from: [3.2, 4.35], to: [5.8, 2.1], via: [[5.8, 4.35], [5.8, 2.1], [3.2, 2.1]], kind: "move", label: "BOX" }
        ]);
      case "ladder-lateral-quicksteps": return ladderLateralScene(drill);
      case "jump-rope-speed-intervals":
        return jumpRopeProgram(drill, "Five fast work-rest rounds", ["30s WORK", "30s REST", "×5"]);
      case "jump-rope-single-leg":
        return jumpRopeProgram(drill, "Two feet, right, left, alternate",
          ["2 FEET", "RIGHT ×10", "LEFT ×10", "ALTERNATE"]);
      case "med-ball-overhead-slams": return medicineSlamScene(drill);
      case "med-ball-chest-pass-wall": return chestPassWallScene(drill);
      case "reaction-ball-wall-singles": return reactionWallScene(drill);
      case "foam-roller-leg-reset":
        return phaseSequenceScene(drill, "Slow leg-roll sequence",
          ["QUADS", "CALVES", "HIP + THIGH", "3 UP · 3 BACK"], "FOAM ROLLER");
      case "foam-roller-upper-back":
        return phaseSequenceScene(drill, "Upper-back release",
          ["ROLL", "PAUSE + ARCH", "SHOULDERS", "DEEP BREATH"], "FOAM ROLLER");
      case "box-step-ups-approach": return boxStepUpScene(drill);
      case "box-depth-jump-landings": return boxDepthDropScene(drill);
      case "box-block-reach": return blockReachScene(drill);
      case "mat-floor-defense-progression": return matDefenseScene(drill);
      case "mat-mobility-flow":
        return phaseSequenceScene(drill, "Four-part mat mobility flow",
          ["TABLETOP", "LUNGE + ROTATE", "CHILD'S POSE", "INCHWORM"], "MAT");
      default:
        // A future uncatalogued drill gets the same fact-only treatment as a
        // custom record until it receives a reviewed authored scene.
        return customScenes(drill)[0];
    }
  }

  function reviewedChainsFor(drillId, sceneIndex) {
    var byScene = REVIEWED_BALL_CHAINS[drillId];
    var encoded = byScene && byScene[sceneIndex];
    if (!encoded) return [];
    return encoded.split("|").map(function (chain) {
      return chain.split(",").map(function (index) { return Number(index); });
    });
  }

  function reviewedBallPathsFor(drillId, sceneIndex) {
    var byScene = REVIEWED_BALL_PATHS[drillId];
    var encoded = byScene && byScene[sceneIndex];
    if (!encoded) return [];
    return encoded.split(",").map(function (index) { return Number(index); });
  }

  function attachReviewedChains(drill, specs) {
    return (specs || []).map(function (spec, sceneIndex) {
      var chains = reviewedChainsFor(drill && drill.id, sceneIndex);
      var ballPaths = reviewedBallPathsFor(drill && drill.id, sceneIndex);
      if (!chains.length && !ballPaths.length) return spec;
      var copy = Object.assign({}, spec);
      if (chains.length) copy.motionChains = chains;
      if (ballPaths.length) copy.motionBallPaths = ballPaths;
      return copy;
    });
  }

  function scenesFor(drill) {
    var authored = (RR.format && RR.format.diagrams) ? RR.format.diagrams(drill) : [];
    if (authored && authored.length) return attachReviewedChains(drill, authored);
    if (drill && drill.custom) return customScenes(drill);
    return attachReviewedChains(drill, [deriveSpec(drill)]);
  }

  function isAuthored(drill) {
    var list = (RR.format && RR.format.diagrams) ? RR.format.diagrams(drill) : [];
    return !!(list && list.length);
  }

  // Pause work that cannot be seen. One shared observer/listener serves every
  // hero and prunes roots removed by a screen repaint, avoiding per-card timers.
  function applyAutomaticPause(root) {
    if (!root) return;
    var shouldPause = document.hidden || root._damIntersecting === false;
    root.classList.toggle("is-auto-paused", shouldPause);
  }

  function pruneRoots() {
    activeRoots = activeRoots.filter(function (root) {
      var keep = !!root.isConnected;
      if (!keep && intersectionObserver) intersectionObserver.unobserve(root);
      return keep;
    });
  }

  function registerVisibility(root) {
    activeRoots.push(root);
    root._damIntersecting = true;
    if (typeof IntersectionObserver !== "undefined") {
      if (!intersectionObserver) {
        intersectionObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            entry.target._damIntersecting = entry.isIntersecting && entry.intersectionRatio > 0;
            applyAutomaticPause(entry.target);
          });
          pruneRoots();
        }, { threshold: 0.01 });
      }
      intersectionObserver.observe(root);
    }
    if (!visibilityHooked) {
      document.addEventListener("visibilitychange", function () {
        pruneRoots();
        activeRoots.forEach(applyAutomaticPause);
      });
      visibilityHooked = true;
    }
  }

  // ---- SVG rendering -------------------------------------------------------
  function pathSegment(path, px, py, first) {
    var from = path.from || [0, 0];
    var to = path.to || from;
    var start = (first ? "M" : "L") + round(px(from[0])) + " " + round(py(from[1]));
    if (path.via && path.via.length) {
      return start + path.via.map(function (point) {
        return "L" + round(px(point[0])) + " " + round(py(point[1]));
      }).join("") + "L" + round(px(to[0])) + " " + round(py(to[1]));
    }
    if (path.curve) {
      var mx = (from[0] + to[0]) / 2 + path.curve * (to[1] - from[1]) * 0.4;
      var my = (from[1] + to[1]) / 2 - path.curve * (to[0] - from[0]) * 0.4;
      return start +
        "Q" + round(px(mx)) + " " + round(py(my)) + " " + round(px(to[0])) + " " + round(py(to[1]));
    }
    return start + "L" + round(px(to[0])) + " " + round(py(to[1]));
  }

  function pathData(path, px, py) {
    return pathSegment(path, px, py, true);
  }

  function pathLength(path) {
    var points = [path.from || [0, 0]].concat(path.via || []).concat([path.to || path.from || [0, 0]]);
    var distance = 0;
    for (var i = 1; i < points.length; i++) {
      var dx = points[i][0] - points[i - 1][0];
      var dy = points[i][1] - points[i - 1][1];
      distance += Math.sqrt(dx * dx + dy * dy);
    }
    if (path.curve) distance *= 1 + Math.min(0.35, Math.abs(path.curve) * 0.35);
    return distance;
  }

  function reviewedBallGroups(entries, chains) {
    var byIndex = {};
    var used = {};
    var groups = [];
    entries.forEach(function (entry) { byIndex[entry.index] = entry; });

    (chains || []).forEach(function (indices) {
      var group = indices.map(function (index) { return byIndex[index]; }).filter(Boolean);
      if (group.length !== indices.length) return;
      group.forEach(function (entry) { used[entry.index] = true; });
      groups.push(group);
    });
    entries.forEach(function (entry) {
      if (!used[entry.index]) groups.push([entry]);
    });
    groups.sort(function (a, b) { return a[0].index - b[0].index; });
    return groups;
  }

  function stitchedPathData(group, px, py) {
    return group.map(function (entry, index) {
      return pathSegment(entry.path, px, py, index === 0);
    }).join("");
  }

  function stitchedLength(group) {
    var distance = 0;
    group.forEach(function (entry, index) {
      if (index) {
        var before = group[index - 1].path.to || group[index - 1].path.from;
        var after = entry.path.from || before;
        var dx = after[0] - before[0], dy = after[1] - before[1];
        distance += Math.sqrt(dx * dx + dy * dy);
      }
      distance += pathLength(entry.path);
    });
    return distance;
  }

  function defs(id) {
    function marker(kind) {
      return el("marker", {
        id: id + "-" + kind, viewBox: "0 0 10 10", refX: 8, refY: 5,
        markerWidth: 7, markerHeight: 7, orient: "auto"
      }, selfEl("path", { d: "M0 0L10 5L0 10z", class: "dam-arrow dam-arrow--" + kind }));
    }
    return el("defs", {}, marker("ball") + marker("move") + marker("serve"));
  }

  function ballGlyph(kind) {
    kind = kind || "ball";
    if (kind === "medicine") {
      return selfEl("circle", { r: 8.5, class: "dam-object__medicine" }) +
        el("text", { x: 0, y: 0, class: "dam-object__letters", "text-anchor": "middle", "dominant-baseline": "central" }, "MB");
    }
    if (kind === "reaction") {
      return selfEl("circle", { r: 6.5, class: "dam-object__reaction" });
    }
    if (kind === "balloon") {
      return selfEl("ellipse", { rx: 8.5, ry: 11, class: "dam-object__balloon" }) +
        selfEl("path", { d: "M0 11l-2.4 4.2h4.8z", class: "dam-object__balloon-knot" });
    }
    return selfEl("circle", { r: 7.5, class: "dam-object__ball-face" }) +
      selfEl("path", { d: "M-7.5 -1.5Q0 3 7.5 -1.5M0 -7.5Q4 0 0 7.5", class: "dam-object__ball-seam" });
  }

  function renderSvg(spec, id) {
    spec = spec || {};
    var w = spec.w || 9;
    var hUnits = spec.h || 12;
    var scale = Math.min(MAX_W / w, MAX_H / hUnits);
    var width = w * scale + PAD * 2;
    var height = hUnits * scale + PAD * 2;
    function px(x) { return PAD + x * scale; }
    function py(y) { return PAD + y * scale; }

    var pieces = [defs(id)];
    var movers = [];
    var courts = spec.court || [];
    if (!Array.isArray(courts)) courts = [courts];
    courts.forEach(function (court) {
      pieces.push(selfEl("rect", {
        x: px(court.x), y: py(court.y), width: court.w * scale, height: court.h * scale,
        rx: 7, class: "dam-court"
      }));
    });

    (spec.zones || []).forEach(function (zone, index) {
      pieces.push(selfEl("rect", {
        x: px(zone.x), y: py(zone.y), width: zone.w * scale, height: zone.h * scale,
        rx: 6, class: "dam-zone dam-zone--" + (zone.tone || "target"),
        style: "--dam-index:" + index
      }));
      if (zone.label) {
        pieces.push(el("text", {
          x: px(zone.x + zone.w / 2), y: py(zone.y + zone.h / 2),
          class: "dam-zone-label", "text-anchor": "middle", "dominant-baseline": "central"
        }, esc(zone.label)));
      }
    });

    if (spec.net != null) {
      pieces.push(selfEl("line", { x1: px(0), y1: py(spec.net), x2: px(w), y2: py(spec.net), class: "dam-net" }));
      pieces.push(selfEl("circle", { cx: px(0), cy: py(spec.net), r: 4, class: "dam-post" }));
      pieces.push(selfEl("circle", { cx: px(w), cy: py(spec.net), r: 4, class: "dam-post" }));
    }
    (spec.lines || []).forEach(function (line) {
      if (line.y != null) pieces.push(selfEl("line", { x1: px(0), y1: py(line.y), x2: px(w), y2: py(line.y), class: "dam-line" }));
      if (line.x != null) pieces.push(selfEl("line", { x1: px(line.x), y1: py(0), x2: px(line.x), y2: py(hUnits), class: "dam-line" }));
    });

    (spec.rings || []).forEach(function (ring, index) {
      pieces.push(selfEl("circle", {
        cx: px(ring.x), cy: py(ring.y), r: ring.r * scale,
        class: "dam-ring dam-ring--" + (ring.tone || "calm"), style: "--dam-index:" + index
      }));
    });

    var paths = spec.paths || [];
    var ballEntries = [];
    paths.forEach(function (path, index) {
      var kind = path.kind || "ball";
      var d = pathData(path, px, py);
      var distance = pathLength(path);
      var duration = round(clamp(3.2 + distance * 0.16, 3.5, 5.6));
      var delay = round(index * 0.46);
      pieces.push(selfEl("path", {
        d: d, class: "dam-route dam-route--" + kind,
        "marker-end": "url(#" + id + "-" + kind + ")",
        style: "--dam-delay:" + delay + "s;--dam-duration:" + duration + "s"
      }));
      if (path.label) {
        var from = path.from || [0, 0], to = path.to || from;
        pieces.push(el("text", {
          x: px((from[0] + to[0]) / 2), y: py((from[1] + to[1]) / 2) - 8,
          class: "dam-path-label", "text-anchor": "middle"
        }, esc(path.label)));
      }
      // Preserve authored route styling while using the explicitly reviewed
      // object type. Untagged move paths always remain player movement.
      var objectMove = kind === "move" && (spec.motionBallPaths || []).indexOf(index) !== -1;
      if (kind === "move" && !objectMove) {
        var style = "--dam-delay:" + delay + "s;--dam-duration:" + duration + "s;offset-path:path('" + d + "')";
        movers.push(el("g", { class: "dam-mover", style: style },
          selfEl("circle", { r: 10, class: "dam-mover__halo" }) +
          selfEl("circle", { r: 5.5, class: "dam-mover__dot" })));
      } else {
        ballEntries.push({ path: path, index: index, kind: kind });
      }
    });

    // Only reviewed chains share a moving object. Untagged paths intentionally
    // remain separate, which preserves simultaneous feeds and alternative
    // options without guessing from coincident or nearby geometry.
    reviewedBallGroups(ballEntries, spec.motionChains).forEach(function (group, groupIndex) {
      var d = stitchedPathData(group, px, py);
      var duration = round(clamp(3.2 + stitchedLength(group) * 0.4, 4.2, 14));
      var delay = round(groupIndex * 0.55);
      var kind = group.some(function (entry) { return entry.kind === "serve"; }) ? "serve" : "ball";
      var object = "ball";
      for (var oi = 0; oi < group.length; oi++) {
        if (group[oi].path.object) { object = group[oi].path.object; break; }
      }
      var style = "--dam-delay:" + delay + "s;--dam-duration:" + duration + "s;offset-path:path('" + d + "')";
      movers.push(el("g", { class: "dam-flight dam-flight--" + kind,
        "data-route-legs": group.length, style: style }, ballGlyph(object)));
    });

    (spec.cones || []).forEach(function (cone) {
      var size = scale * 0.3;
      var x = px(cone.x), y = py(cone.y);
      pieces.push(selfEl("path", { d: "M" + x + " " + (y - size) + "L" + (x + size) + " " + (y + size) + "L" + (x - size) + " " + (y + size) + "z", class: "dam-cone" }));
    });

    (spec.balls || []).forEach(function (ball) {
      pieces.push(el("g", { class: "dam-static-ball", transform: "translate(" + round(px(ball.x)) + " " + round(py(ball.y)) + ")" }, ballGlyph(ball.object)));
    });

    var players = spec.players || [];
    var playerR = Math.max(12, scale * 0.38);
    players.forEach(function (player, index) {
      var x = px(player.x), y = py(player.y);
      var tone = player.team || "n";
      var focus = !paths.length ? selfEl("circle", {
        cx: x, cy: y, r: playerR + 6, class: "dam-player-focus", style: "--dam-index:" + index
      }) : "";
      pieces.push(focus);
      pieces.push(selfEl("circle", { cx: x, cy: y, r: playerR, class: "dam-player dam-player--" + tone }));
      if (player.label != null && player.label !== "") {
        pieces.push(el("text", {
          x: x, y: y, class: "dam-player-label dam-player-label--" + tone,
          "text-anchor": "middle", "dominant-baseline": "central"
        }, esc(player.label)));
      }
      if (player.note) {
        pieces.push(el("text", { x: x, y: y + playerR + 13, class: "dam-player-note", "text-anchor": "middle" }, esc(player.note)));
      }
    });

    pieces = pieces.concat(movers);
    return el("svg", {
      viewBox: "0 0 " + round(width) + " " + round(height), class: "dam-svg",
      focusable: "false", "aria-hidden": "true", preserveAspectRatio: "xMidYMid meet"
    }, pieces.join(""));
  }

  // ---- Interactive hero ----------------------------------------------------
  function node(tag, className, text) {
    var result = document.createElement(tag);
    if (className) result.className = className;
    if (text != null) result.textContent = text;
    return result;
  }

  function translated(text) {
    return RR.i18n && RR.i18n.t ? RR.i18n.t(text) : text;
  }

  function fillLegend(list, items) {
    list.innerHTML = "";
    (items || []).forEach(function (item) {
      var li = node("li", "drill-motion__legend-item");
      var tone = String(item.tone || "n").replace(/[^a-z0-9_-]/gi, "");
      var swatch = node("span", "drill-motion__swatch drill-motion__swatch--" + tone);
      swatch.setAttribute("aria-hidden", "true");
      li.appendChild(swatch);
      li.appendChild(document.createTextNode(item.text || ""));
      list.appendChild(li);
    });
    list.hidden = !list.children.length;
  }

  function iconButton(label, svgBody, className) {
    var button = node("button", "drill-motion__button " + (className || ""));
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.innerHTML = "<svg viewBox='0 0 24 24' aria-hidden='true' focusable='false'>" + svgBody + "</svg>" +
      "<span>" + esc(label) + "</span>";
    return button;
  }

  function figure(drill) {
    var specs = scenesFor(drill);
    var id = "drill-motion-" + (++sequence);
    var reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var root = node("section", "drill-motion" + (reduced ? " is-reduced is-paused" : ""));
    root.setAttribute("aria-label", "Animated example for " + (drill.name || "this drill"));
    root.setAttribute("data-drill-id", drill.id || "custom");

    var eyebrow = node("span", "drill-motion__eyebrow", "Animated example");
    var phaseStatus = node("span", "drill-motion__phase");
    phaseStatus.setAttribute("aria-live", "polite");
    phaseStatus.setAttribute("aria-atomic", "true");
    var top = node("div", "drill-motion__top");
    var topCopy = node("div", "drill-motion__top-copy");
    topCopy.appendChild(eyebrow);
    topCopy.appendChild(phaseStatus);
    top.appendChild(topCopy);

    var transport = node("div", "drill-motion__transport");
    var pause = null;
    if (reduced) {
      var still = node("span", "drill-motion__reduced", "Still preview");
      still.setAttribute("title", "Animation is off because reduced motion is enabled on this device.");
      transport.appendChild(still);
    } else {
      pause = iconButton(translated("Pause"), "<path d='M8 5v14M16 5v14'/>", "drill-motion__pause");
      pause.setAttribute("data-no-i18n", "");
      transport.appendChild(pause);
    }
    var replay = null;
    if (!reduced) {
      replay = iconButton("Replay", "<path d='M4 11a8 8 0 1 0 2.3-5.7L4 7.6'/><path d='M4 3v4.6h4.6'/>", "drill-motion__replay");
      transport.appendChild(replay);
    }
    top.appendChild(transport);
    root.appendChild(top);

    var viewport = node("div", "drill-motion__viewport");
    viewport.id = id + "-viewport";
    viewport.setAttribute("role", "img");
    var panels = [];
    var titles = [];
    var captions = [];
    specs.forEach(function (spec, index) {
      var panel = node("div", "drill-motion__panel");
      panel.setAttribute("data-motion-step", String(index));
      if (index !== 0) panel.hidden = true;
      panel.innerHTML = renderSvg(spec, id + "-scene-" + index);
      viewport.appendChild(panel);
      panels.push(panel);
      titles.push(spec.title || (specs.length > 1 ? "Step " + (index + 1) : "How it moves"));
      captions.push(spec.caption || realCaption(drill));
    });
    root.appendChild(viewport);

    var progress = node("div", "drill-motion__progress");
    progress.setAttribute("aria-hidden", "true");
    progress.appendChild(node("span", "drill-motion__progress-fill"));
    root.appendChild(progress);

    var info = node("div", "drill-motion__info");
    var copy = node("div", "drill-motion__copy");
    var title = node("p", "drill-motion__title");
    var caption = node("p", "drill-motion__caption");
    var legend = node("ul", "drill-motion__legend");
    title.id = id + "-title";
    caption.id = id + "-caption";
    legend.id = id + "-legend";
    viewport.setAttribute("aria-labelledby", title.id);
    viewport.setAttribute("aria-describedby", caption.id + " " + legend.id);
    if (pause) pause.setAttribute("aria-controls", viewport.id);
    if (replay) replay.setAttribute("aria-controls", viewport.id);
    copy.appendChild(title);
    copy.appendChild(caption);
    copy.appendChild(legend);
    info.appendChild(copy);

    var stepControls = null;
    var previous = null;
    var next = null;
    var dots = [];
    if (specs.length > 1) {
      stepControls = node("div", "drill-motion__steps");
      stepControls.setAttribute("aria-label", "Animation steps");
      previous = iconButton("Previous step", "<path d='m15 18-6-6 6-6'/>", "drill-motion__step-button");
      next = iconButton("Next step", "<path d='m9 18 6-6-6-6'/>", "drill-motion__step-button");
      var dotRow = node("div", "drill-motion__dots");
      specs.forEach(function (_, index) {
        var dot = node("button", "drill-motion__dot");
        dot.type = "button";
        dot.setAttribute("aria-label", "Show step " + (index + 1));
        dot.addEventListener("click", function () { show(index); });
        dotRow.appendChild(dot);
        dots.push(dot);
      });
      stepControls.appendChild(previous);
      stepControls.appendChild(dotRow);
      stepControls.appendChild(next);
      info.appendChild(stepControls);
    }
    root.appendChild(info);

    var current = 0;
    var paused = reduced;
    function updatePause() {
      root.classList.toggle("is-paused", paused);
      if (!pause) return;
      var label = paused ? "Play" : "Pause";
      pause.setAttribute("aria-label", translated(label));
      pause.querySelector("span").textContent = translated(label);
      pause.querySelector("svg").innerHTML = paused
        ? "<path d='m8 5 11 7-11 7z'/>"
        : "<path d='M8 5v14M16 5v14'/>";
    }
    function restart() {
      root.classList.add("is-resetting");
      void root.offsetWidth;
      root.classList.remove("is-resetting");
    }
    function show(index) {
      current = (index + specs.length) % specs.length;
      panels.forEach(function (panel, i) { panel.hidden = i !== current; });
      title.textContent = titles[current];
      caption.textContent = captions[current];
      fillLegend(legend, specs[current].legend);
      phaseStatus.textContent = translated(specs.length > 1
        ? "Step " + (current + 1) + " of " + specs.length : "Live movement loop");
      dots.forEach(function (dot, i) {
        var active = i === current;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-current", active ? "step" : "false");
      });
      if (previous) previous.disabled = current === 0;
      if (next) next.disabled = current === specs.length - 1;
      restart();
    }

    if (pause) pause.addEventListener("click", function () { paused = !paused; updatePause(); });
    if (replay) replay.addEventListener("click", function () {
      paused = false;
      updatePause();
      restart();
    });
    if (previous) previous.addEventListener("click", function () { if (current > 0) show(current - 1); });
    if (next) next.addEventListener("click", function () { if (current < specs.length - 1) show(current + 1); });
    show(0);
    updatePause();
    registerVisibility(root);
    return root;
  }

  return {
    figure: figure,
    scenesFor: scenesFor,
    deriveSpec: deriveSpec,
    isAuthored: isAuthored,
    renderSvg: renderSvg
  };
})();
