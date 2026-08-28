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
// Rendering combines inline SVG geometry with bundled transparent human sprite
// sheets: no network, fake roster, video, canvas, or timer data. Reduced-motion
// users receive a complete authored poster beat instead of looping movement.
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
  var reducedMotionQuery = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var reducedMotionHooked = false;
  var XHTML_NS = "http://www.w3.org/1999/xhtml";
  var GRID_DIMENSIONS = {
    locomotion: [1230, 1278], volleyball: [1246, 1262], defense: [1254, 1254],
    defensePro: [1277, 1232],
    roster: [1233, 1275], equipment: [1536, 1024], power: [1536, 1024],
    recovery: [1536, 1024], servingAttack: [1536, 1024],
    boxMat: [1254, 1254], jumpBand: [1024, 1536], specialized: [1254, 1254]
  };

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
    "hitting-off-a-live-set": [null, "1,2"],
    "middle-quick-attack": [null, "1,2,0"],
    "pursuit-emergency-defense": [null, "1,2"],
    "dig-to-target": ["0,1"],
    "free-ball-transition": [null, "0,1,2"],
    "platform-angle-passing": ["2,3"],
    "out-of-system-passing": ["0,1", "0,1,2"],
    "libero-serve-receive-range": ["0,2"],
    "two-person-serve-receive": ["0,1"],
    "jump-setting": [null, "1,2"],
    "tempo-setting": ["0,1", "0,1", "0,1"],
    "two-ball-setting-footwork": ["0,1", "1,2"],
    "high-contact-arm-swing": ["0,1"],
    "libero-dig-and-run-through": ["0,1", "0,2"],
    "overhead-defensive-hands": ["0,1"],
    "run-the-rotation-offense": ["0,1,2,3"],
    "setting-shuttle-relay": ["0,2"],
    "butterfly-pepper": ["0,1,2"],
    "pepper-to-zones": ["0,1,2,3"],
    "cooperative-pass-count": ["0,1,2,3,4,5"],
    "bounce-and-dig": ["0,1"],
    "overhand-throw-progression": [null, "0,1"],
    "standing-spike-target": ["0,1"],
    "toss-and-pass-intro": ["0,1"],
    "pass-to-the-coach": ["0,1"],
    "hot-potato-ball-control": ["0,1,2,3,4,5"],
    "toss-bump-catch-control": ["0,1"],
    "four-person-pepper": ["0,1,2,3"],
    "w-formation-serve-receive": [null, "0,1,6,7"],
    "setting-accuracy-hoops": ["0,1"],
    "transition-setting-back-row": [null, "1,2"],
    "partner-mini-serve-rally": ["0,1"],
    "serve-the-seam": [null, "0,1"],
    "transition-hitting-off-defense": ["0,1"],
    "transition-dig-to-attack": ["0,1", "0,1,3,4"],
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
    "approach-timing-off-the-pass": [null, "0,2,3"],
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
    "hitting-from-all-positions": ["1,2", "1,2", "1,2", "1,2"],
    "attack-and-transition-to-defense": ["1,2", "0,1", "0,1|3,4"],
    "collapse-dig-and-recover": ["0,1"],
    "amoeba-team-game": ["0,1,2,3,4,5,6"],
    "passing-21-circle": ["0,1,2,3,4"],
    "serve-and-pass-crossover": ["0,1"],
    "pass-set-hit-triangle": ["0,1,2"],
    "setter-release-from-base": [null, null, "0,1"],
    "box-hitting-reps": ["0,1"],
    "ladder-to-dig-reaction": ["1,2"],
    "sideout-percentage-gauntlet": ["0,1,2,3"],
    "dig-and-catch-game": ["0,1"],
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
      paths: [{
        from: [1.9, 5.55],
        via: [[2.9, 5], [3.45, 3.2], [5.15, 4.8], [7.35, 3.55]],
        to: [7.35, 5.75], kind: "move", curve: 0,
        label: "ROLL → SIDE ROLL → SPRAWL → POP UP", playerIndex: 0
      }],
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
    scene.paths = [{
      from: [4.5, 7.8],
      via: [
        [3.8, 6.8], [5.2, 5.75], [3.8, 4.7], [5.2, 3.65], [3.8, 2.6], [5.2, 1.55], [4.5, 0.8],
        [5.2, 1.55], [3.8, 2.6], [5.2, 3.65], [3.8, 4.7], [5.2, 5.75], [3.8, 6.8], [4.5, 7.75],
        [5.2, 6.8], [3.8, 5.75], [5.2, 4.7], [3.8, 3.65], [5.2, 2.6], [3.8, 1.55], [4.5, 0.8]
      ],
      to: [7.65, 0.8], kind: "move", curve: 0,
      label: "IN-IN / OUT-OUT → RETURN → NEXT TRIP → SHUFFLE OUT",
      playerIndex: 0
    }];
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
      paths: [{
        from: [4.5, 6.25], via: [[4.5, 3.65]], to: [4.5, 6.25],
        kind: "move", label: "STEP UP → LOWER", curve: 0,
        playerIndex: 0
      }],
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
          {
            from: [4.25, 5.1],
            via: [[7.55, 5.1], [4.5, 5.1], [4.5, 2.05], [4.5, 4.8], [3.7, 5.5]],
            to: [3.7, 6.25], kind: "move", curve: 0,
            label: "SIDE STEPS → MONSTER WALK → SQUAT", playerIndex: 0
          }
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
          { from: [3.1, 4.2], to: [6.45, 2.35], kind: "move", curve: -0.28,
            label: "RESISTED SWING", stepIndices: [0, 1, 2] },
          { from: [3.2, 4.55], to: [6.55, 2.7], kind: "move", curve: -0.2,
            label: "FREE SWING", stepIndices: [3] }
        ]);
      case "mini-band-glute-bridges": return gluteBridgeScene(drill);
      case "mini-band-defensive-shuffle":
        return lowerBandScene(drill, "Shuffle both ways, then box", [
          {
            from: [4.35, 5.1],
            via: [[7.5, 5.1], [1.45, 5.35], [3.2, 4.35], [5.8, 4.35],
              [5.8, 2.1], [3.2, 2.1]],
            to: [3.2, 4.35], kind: "move", curve: 0,
            label: "RIGHT → LEFT → BOX", playerIndex: 0
          }
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
    var changed = root.classList.contains("is-auto-paused") !== shouldPause;
    root.classList.toggle("is-auto-paused", shouldPause);
    if (changed && typeof root._damAutoPauseChanged === "function") {
      root._damAutoPauseChanged(shouldPause);
    }
  }

  function reducedMotionActive() {
    return !!(reducedMotionQuery && reducedMotionQuery.matches);
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
    if (!reducedMotionHooked && reducedMotionQuery) {
      var onMotionPreference = function () {
        pruneRoots();
        activeRoots.forEach(function (item) {
          if (typeof item._damMotionChanged === "function") item._damMotionChanged(reducedMotionActive());
        });
      };
      if (reducedMotionQuery.addEventListener) reducedMotionQuery.addEventListener("change", onMotionPreference);
      else if (reducedMotionQuery.addListener) reducedMotionQuery.addListener(onMotionPreference);
      reducedMotionHooked = true;
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

  function safeAsset(value) {
    return cleanString(value).replace(/[\"'()\\]/g, "");
  }

  function rowPosition(row) {
    return round(clamp(finiteNumber(row) ? row : 0, 0, 3) * 100 / 3) + "%";
  }

  function columnPosition(column) {
    return round(clamp(finiteNumber(column) ? column : 0, 0, 3) * 100 / 3) + "%";
  }

  function finiteNumber(value) {
    return typeof value === "number" && isFinite(value);
  }

  function actorById(plan, actorId) {
    var found = null;
    (plan && plan.actors || []).some(function (actor) {
      if (actor && actor.id === actorId) { found = actor; return true; }
      return false;
    });
    return found;
  }

  function routeById(plan, routeId) {
    var found = null;
    (plan && plan.routes || []).some(function (route) {
      if (route && route.id === routeId) { found = route; return true; }
      return false;
    });
    return found;
  }

  function contactById(plan, contactId) {
    var found = null;
    (plan && plan.contacts || []).some(function (contact) {
      if (contact && contact.id === contactId) { found = contact; return true; }
      return false;
    });
    return found;
  }

  function courtSpriteFor(actor, performingBeat, partner) {
    var performing = !!(performingBeat && performingBeat.actorId === actor.id);
    var motionMeta = performing && performingBeat.motion ? performingBeat.motion : null;
    var appearance = actor.appearance || {};
    // Every reviewed motion sheet belongs on the factual performing athlete.
    // Opaque generated sheets are identified as studio frames so CSS can
    // contain their background without hiding the court or nearby people.
    if (motionMeta) {
      var animate = motionMeta.animate !== false;
      return {
        asset: motionMeta.asset,
        grid: motionMeta.grid,
        row: motionMeta.row,
        column: animate ? 0 : finiteNumber(motionMeta.posterFrame) ? motionMeta.posterFrame : 0,
        performing: true,
        animate: animate,
        studio: motionMeta.transparent === false,
        durationMs: performingBeat.durationMs || motionMeta.durationMs || 1000
      };
    }
    return {
      asset: appearance.asset || "images/drill-motion/scene-roster-grid.webp",
      grid: "roster",
      row: finiteNumber(appearance.row) ? appearance.row : hashActorRow(actor.id),
      column: actor.staged ? 3 : performing ? 2 : partner ? 1 : 0,
      performing: false,
      animate: false,
      studio: false,
      durationMs: performingBeat && performingBeat.durationMs || 1000
    };
  }

  function hashActorRow(value) {
    var source = String(value || "");
    var hash = 0;
    for (var index = 0; index < source.length; index++) hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
    return hash % 4;
  }

  function compactActorLabel(actor) {
    var saved = cleanString(actor && actor.label);
    if (saved && saved.length <= 8) return saved;
    var source = cleanString((actor && actor.role || "") + " " +
      (actor && actor.id || "")).toLowerCase();
    var positions = [
      [/front[- ]left/, "FL"], [/front[- ]middle|front[- ]center/, "FM"],
      [/front[- ]right/, "FR"], [/back[- ]left/, "BL"],
      [/back[- ]middle|back[- ]center/, "BM"], [/back[- ]right/, "BR"]
    ];
    for (var index = 0; index < positions.length; index++) {
      if (positions[index][0].test(source)) return positions[index][1];
    }
    var waiting = source.match(/waiting(?:[- ]player)?[- ]?(\d+)/);
    if (waiting) return "W" + waiting[1];
    if (/signal|caller|\bcue\b/.test(source)) return "Cue";
    if (/reacting sprinter|\brunner\b|\bsprinter\b/.test(source)) return "R";
    if (/\bsetter\b/.test(source)) return "S";
    if (/\blibero\b/.test(source)) return "L";
    if (/\bmiddle\b/.test(source)) return "M";
    if (/outside/.test(source)) return "OH";
    if (/right[- ]side/.test(source)) return "RS";
    if (/\bserver\b/.test(source)) return "SV";
    if (/\bpasser|receiver/.test(source)) return "P";
    if (/\bhitter|attacker/.test(source)) return "H";
    if (/\btarget\b/.test(source)) return "T";
    if (/\bcoach\b/.test(source)) return "C";
    var role = cleanString(actor && actor.role);
    if (!role) return "P";
    return role.split(/\s+/).slice(0, 3).map(function (word) {
      return word.charAt(0).toUpperCase();
    }).join("") || "P";
  }

  function sceneLaneMarkup(plan, px, py, scale) {
    var lane = plan && plan.stagingLane;
    var staged = (plan && plan.actors || []).filter(function (actor) { return actor.staged; });
    if (!lane || !staged.length) return "";
    var minX = staged[0].x, maxX = staged[0].x, minY = staged[0].y, maxY = staged[0].y;
    staged.forEach(function (actor) {
      minX = Math.min(minX, actor.x); maxX = Math.max(maxX, actor.x);
      minY = Math.min(minY, actor.y); maxY = Math.max(maxY, actor.y);
    });
    var padX = Math.max(0.35, 14 / scale);
    var padY = Math.max(0.3, 12 / scale);
    var x = px(minX - padX), y = py(minY - padY);
    var width = Math.max(34, (maxX - minX + padX * 2) * scale);
    var height = Math.max(28, (maxY - minY + padY * 2) * scale);
    return selfEl("rect", { x: x, y: y, width: width, height: height, rx: 8,
      class: "dam-scene-lane" }) + el("text", { x: x + 6, y: y + 11,
      class: "dam-scene-lane-label" }, esc(lane.label || "Rotation lane"));
  }

  // SVG does not have a z-axis. Paint athletes from the far baseline toward
  // the camera and expose the normalized value to CSS so lighting/shadow scale
  // can reinforce the elevated broadcast view. Authored x/y coordinates are
  // never changed; an active route only informs deterministic paint order.
  function sceneActorDepth(actor, activeRoute, sceneHeight) {
    var depthY = finiteNumber(actor && actor.y) ? actor.y : 0;
    if (activeRoute) {
      [activeRoute.from].concat(activeRoute.via || []).concat([activeRoute.to])
        .forEach(function (point) {
          if (point && finiteNumber(point[1])) depthY = Math.max(depthY, point[1]);
        });
    }
    var height = finiteNumber(sceneHeight) && sceneHeight > 0 ? sceneHeight : 10;
    return Math.round(clamp(depthY / height, 0, 1) * 1000) / 1000;
  }

  function sortedSceneActors(plan, activeBeats) {
    var activeRoutes = {};
    (activeBeats || []).forEach(function (beat) {
      var route = beat && routeById(plan, beat.routeId);
      if (route && route.actorId) activeRoutes[route.actorId] = route;
    });
    return (plan && plan.actors || []).slice().sort(function (left, right) {
      var leftDepth = sceneActorDepth(left, activeRoutes[left.id], plan.height);
      var rightDepth = sceneActorDepth(right, activeRoutes[right.id], plan.height);
      if (leftDepth !== rightDepth) return leftDepth - rightDepth;
      if (left.x !== right.x) return left.x - right.x;
      return String(left.id || "").localeCompare(String(right.id || ""));
    });
  }

  function layerMarkup(name, items) {
    return el("g", { class: "dam-layer dam-layer--" + name, "data-layer": name },
      (items || []).join(""));
  }

  function plannedRouteForPath(plan, pathIndex) {
    var match = null;
    (plan && plan.routes || []).some(function (route) {
      if (route.sourcePathIndex === pathIndex) { match = route; return true; }
      return false;
    });
    return match;
  }

  function activeRouteIds(plan, activeBeats) {
    var ids = {};
    (activeBeats || []).forEach(function (beat) {
      if (!beat) return;
      if (beat.routeId) ids[beat.routeId] = true;
      var contact = beat.contactId && contactById(plan, beat.contactId);
      if (contact && contact.routeId) ids[contact.routeId] = true;
    });
    return ids;
  }

  function sceneActorMarkup(actor, plan, activeBeats, px, py, scale, depthOrder) {
    activeBeats = Array.isArray(activeBeats) ? activeBeats : activeBeats ? [activeBeats] : [];
    var performingBeat = null;
    var partner = false;
    activeBeats.some(function (beat) {
      if (beat && beat.actorId === actor.id) { performingBeat = beat; return true; }
      return false;
    });
    activeBeats.forEach(function (beat) {
      if (beat && beat.partnerActorId === actor.id) partner = true;
    });
    var sprite = courtSpriteFor(actor, performingBeat, partner);
    var dimensions = GRID_DIMENSIONS[sprite.grid] || GRID_DIMENSIONS.roster;
    var cellAspect = dimensions[0] / dimensions[1];
    var actorCount = plan && plan.actors ? plan.actors.length : 1;
    var actorWidth = actorCount <= 2
      ? clamp(scale * 2.25, 78, 110)
      : actorCount <= 6
        ? clamp(scale * 1.65, 60, 84)
        : clamp(scale * 1.28, 48, 66);
    // Opaque studio sheets stay large enough to read as full-body instruction,
    // but never become a giant rectangular layer over a partner or the court.
    if (sprite.studio) actorWidth = clamp(actorWidth * 0.84, 48, actorCount <= 2 ? 82 : 68);
    var actorHeight = actorWidth / cellAspect;
    var active = !!performingBeat;
    var movingRoute = active ? routeById(plan, performingBeat.routeId) : null;
    var moving = !!(movingRoute && movingRoute.type === "move" && movingRoute.actorId === actor.id);
    var actorDepth = sceneActorDepth(actor, movingRoute, plan && plan.height);
    var roleVisible = true;
    var spriteStyle = "--dam-scene-row:" + rowPosition(sprite.row) +
      ";--dam-scene-column:" + columnPosition(sprite.column) +
      ";--dam-scene-duration:" + Math.max(240, sprite.durationMs) + "ms" +
      ";background-image:url('" + safeAsset(sprite.asset) + "')";
    var html = "<div xmlns=\"" + XHTML_NS + "\" class=\"dam-scene-person" +
      (sprite.studio ? " dam-scene-person--studio" : "") + "\">" +
      "<div class=\"dam-scene-sprite" + (sprite.animate ? " is-performing" : "") +
      (sprite.performing && !sprite.animate ? " is-static" : "") +
      "\" data-animates=\"" + (sprite.animate ? "true" : "false") +
      "\" style=\"" + esc(spriteStyle) + "\"></div>" +
      (roleVisible ? "<span class=\"dam-scene-person__role\">" + esc(compactActorLabel(actor)) + "</span>" : "") +
      "</div>";
    var foreign = el("foreignObject", { x: -actorWidth / 2, y: -actorHeight * 0.92,
      width: actorWidth, height: actorHeight, overflow: "visible" }, html);
    var className = "dam-scene-actor dam-scene-actor--" +
      cleanString(actor.team || "n").replace(/[^a-z0-9_-]/gi, "") +
      (active ? " dam-scene-actor--active" : "") +
      (partner ? " dam-scene-actor--partner" : "") +
      (actorCount > 6 ? " dam-scene-actor--crowded" : "");
    var map = { class: className, "data-actor-id": actor.id,
      "data-appearance-id": actor.appearanceId || "", "data-role": actor.role || "",
      "data-depth": String(actorDepth), "data-depth-order": finiteNumber(depthOrder) ? depthOrder : null,
      "data-grounded": "true" };
    if (moving) {
      var d = pathData(movingRoute, px, py);
      map.class += " dam-mover dam-mover--bound";
      map.style = "--dam-delay:0s;--dam-duration:" +
        Math.max(0.24, (performingBeat.durationMs || 1000) / 1000) + "s;--dam-depth:" +
        actorDepth + ";offset-path:path('" + d + "')";
      map["data-route-id"] = movingRoute.id;
    } else {
      map.transform = "translate(" + round(px(actor.x)) + " " + round(py(actor.y)) + ")";
      map.style = "--dam-depth:" + actorDepth;
    }
    var grounding = selfEl("ellipse", { cx: 0, cy: 1,
      rx: actorWidth * 0.24, ry: Math.max(3.2, actorWidth * 0.064),
      class: "dam-athlete-shadow", "aria-hidden": "true" });
    var halo = active ? selfEl("circle", { cx: 0, cy: -actorHeight * 0.38,
      r: actorWidth * 0.47, class: "dam-player-focus", style: "opacity:.9;animation:none" }) : "";
    return el("g", map, el("title", {}, esc(actor.role || actor.label || "Athlete")) +
      grounding + halo + foreign);
  }

  function flightProfile(contact, activeBeat, px, py) {
    var motion = cleanString(activeBeat && activeBeat.motionId).toLowerCase();
    var object = cleanString(contact && contact.object).toLowerCase();
    var endpoint = cleanString(contact && contact.recipientEndpoint &&
      contact.recipientEndpoint.type).toLowerCase();
    var kind = cleanString(contact && contact.kind).toLowerCase();
    var profile = "controlled";
    var liftRatio = 0.12;
    if (object === "balloon") { profile = "float"; liftRatio = 0.22; }
    else if (object === "reaction") { profile = "rebound"; liftRatio = 0.075; }
    else if (object === "medicine") { profile = endpoint === "floor" ? "slam" : "power"; liftRatio = 0.08; }
    else if (/roll|floor/.test(motion) || endpoint === "floor") { profile = "ground"; liftRatio = 0.025; }
    else if (/set|toss|feed/.test(motion)) { profile = "loft"; liftRatio = 0.2; }
    else if (/serve/.test(motion) || kind === "serve") { profile = "serve"; liftRatio = 0.14; }
    else if (/attack|hit|spike|down-ball/.test(motion)) { profile = "drive"; liftRatio = 0.09; }
    else if (/dig|pass|platform/.test(motion)) { profile = "pass"; liftRatio = 0.13; }

    var from = contact.from || [0, 0];
    var to = contact.to || from;
    var dx = px(to[0]) - px(from[0]);
    var dy = py(to[1]) - py(from[1]);
    var distance = Math.sqrt(dx * dx + dy * dy);
    var top = Math.min(py(from[1]), py(to[1]));
    (contact.via || []).forEach(function (point) { top = Math.min(top, py(point[1])); });
    var availableHeadroom = Math.max(8, top - 5);
    var lift = clamp(distance * liftRatio, profile === "ground" ? 3 : 10,
      profile === "float" || profile === "loft" ? 52 : 38);
    lift = round(Math.min(lift, availableHeadroom));
    return {
      name: profile,
      lift: lift,
      distance: round(distance),
      direction: Math.abs(dx) > Math.abs(dy) * 1.25 ? "cross-court" :
        (dy < 0 ? "up-court" : dy > 0 ? "down-court" : "stationary")
    };
  }

  function activeBallMarkup(plan, activeBeat, px, py) {
    if (!plan || !activeBeat || !activeBeat.contactId) return "";
    var contact = contactById(plan, activeBeat.contactId);
    if (!contact) return "";
    var d = pathData({ from: contact.from, via: contact.via || [], to: contact.to,
      curve: contact.curve || 0 }, px, py);
    var kind = contact.kind === "serve" ? "serve" : "ball";
    var style = "--dam-delay:0s;--dam-duration:" +
      Math.max(0.24, (activeBeat.durationMs || 1000) / 1000) + "s;offset-path:path('" + d + "')";
    var profile = flightProfile(contact, activeBeat, px, py);
    var profileStyle = "--dam-arc-height:-" + profile.lift + "px;--dam-flight-distance:" +
      profile.distance + "px";
    var target = contact.recipientActorId ||
      contact.recipientEndpoint && contact.recipientEndpoint.type || "target";
    var shadow = el("g", { class: "dam-ball-shadow-track",
      "data-contact-id": contact.id, "data-flight-profile": profile.name,
      style: style + ";" + profileStyle }, selfEl("ellipse", {
      cx: 0, cy: 3.5, rx: 7.8, ry: 3.2, class: "dam-ball-shadow"
    }));
    var flight = el("g", { class: "dam-flight dam-flight--" + kind + " dam-live-ball",
      "data-contact-id": contact.id, "data-source-actor": contact.sourceActorId || "",
      "data-recipient-actor": contact.recipientActorId || "",
      "data-track-id": activeBeat.trackId || contact.chainId || contact.id,
      "data-flight-profile": profile.name, "data-flight-direction": profile.direction,
      "data-contact-action": activeBeat.motionId || "", style: style + ";" + profileStyle },
      el("g", { class: "dam-flight__body", "aria-hidden": "true" }, ballGlyph(contact.object)));
    var impact = el("g", { class: "dam-contact-impact",
      transform: "translate(" + round(px(contact.to[0])) + " " + round(py(contact.to[1])) + ")",
      "data-contact-id": contact.id, "data-contact-target": target,
      "data-flight-profile": profile.name,
      style: "--dam-delay:0s;--dam-duration:" +
        Math.max(0.24, (activeBeat.durationMs || 1000) / 1000) + "s" },
      selfEl("circle", { r: 13, class: "dam-contact-impact__ring" }) +
      selfEl("circle", { r: 3.2, class: "dam-contact-impact__core" }));
    return { shadow: shadow, flight: flight, impact: impact };
  }

  function activeBallMarkups(plan, activeBeats, px, py) {
    var seen = {};
    var markups = { shadows: [], flights: [], impacts: [] };
    (activeBeats || []).forEach(function (beat) {
      if (!beat || !beat.contactId) return;
      // Contacts on one shared rally chain are one traveling object. Separate
      // tracks remain separate balls even when their source athlete is shared.
      var trackId = cleanString(beat.trackId) || beat.contactId;
      var key = "track:" + trackId;
      if (seen[key]) return;
      seen[key] = true;
      var markup = activeBallMarkup(plan, beat, px, py);
      if (!markup) return;
      markups.shadows.push(markup.shadow);
      markups.flights.push(markup.flight);
      markups.impacts.push(markup.impact);
    });
    return markups;
  }

  function normalizedActiveBeats(activeBeatOrBeats) {
    if (Array.isArray(activeBeatOrBeats)) {
      return activeBeatOrBeats.filter(function (beat) { return !!beat; });
    }
    return activeBeatOrBeats ? [activeBeatOrBeats] : [];
  }

  function concurrentBeatsFor(plan, index) {
    var beats = plan && Array.isArray(plan.beats) ? plan.beats : [];
    if (!beats.length) return [];
    index = clamp(finiteNumber(index) ? Math.floor(index) : 0, 0, beats.length - 1);
    var startMs = finiteNumber(beats[index].startMs) ? beats[index].startMs : null;
    if (startMs == null) return [beats[index]];
    var first = index;
    var last = index;
    while (first > 0 && beats[first - 1].startMs === startMs) first--;
    while (last + 1 < beats.length && beats[last + 1].startMs === startMs) last++;
    return beats.slice(first, last + 1);
  }

  function concurrentDuration(beats) {
    beats = normalizedActiveBeats(beats);
    if (!beats.length) return 1000;
    var start = finiteNumber(beats[0].startMs) ? beats[0].startMs : 0;
    return beats.reduce(function (duration, beat) {
      var savedDuration = Math.max(240, beat && beat.durationMs || 1000);
      var relativeEnd = finiteNumber(beat && beat.endMs)
        ? Math.max(240, beat.endMs - start) : savedDuration;
      return Math.max(duration, relativeEnd);
    }, 240);
  }

  function activeActorCount(beats) {
    var seen = {};
    return normalizedActiveBeats(beats).reduce(function (count, beat) {
      var actorId = cleanString(beat && beat.actorId);
      if (!actorId || seen["actor:" + actorId]) return count;
      seen["actor:" + actorId] = true;
      return count + 1;
    }, 0);
  }

  function renderSvg(spec, id, facts, plan, activeBeatOrBeats) {
    spec = spec || {};
    facts = facts || {};
    var activeBeats = normalizedActiveBeats(activeBeatOrBeats);
    var activeBeat = activeBeats[0] || null;
    var activeRoutes = activeRouteIds(plan, activeBeats);
    var w = spec.w || 9;
    var hUnits = spec.h || 12;
    var scale = Math.min(MAX_W / w, MAX_H / hUnits);
    // Choreography plans place every saved-minimum athlete inside the authored
    // scene. The legacy top strip remains only for three-argument renderSvg()
    // callers that have not supplied a plan.
    var stagedPeople = plan ? 0 : Math.max(0, facts.additional || 0);
    var stagingCapacity = Math.max(4, Math.floor((w * scale) / 15));
    var stagingRows = stagedPeople ? Math.ceil(stagedPeople / stagingCapacity) : 0;
    var topPad = PAD + (stagingRows ? 24 + stagingRows * 15 : 0);
    var width = w * scale + PAD * 2;
    var height = hUnits * scale + topPad + PAD;
    function px(x) { return PAD + x * scale; }
    function py(y) { return topPad + y * scale; }

    // Stable painter's layers make the scene read like one broadcast frame:
    // court below guides, grounded athletes painted back-to-front, live ball
    // and contact effects above them. CSS can refine the camera treatment
    // without coupling to authored drill coordinates or object insertion order.
    var layers = {
      surface: [], markings: [], guides: [], shadows: [],
      equipment: [], actors: [], effects: [], foreground: []
    };
    layers.surface.push(selfEl("rect", {
      x: PAD, y: topPad, width: w * scale, height: hUnits * scale,
      rx: 10, class: "dam-broadcast-stage", "aria-hidden": "true"
    }));
    if (stagedPeople) {
      layers.surface.push(selfEl("rect", {
        x: PAD, y: 5, width: w * scale, height: topPad - PAD + 11,
        rx: 8, class: "dam-staging"
      }));
      layers.foreground.push(el("text", {
        x: PAD + 8, y: 19, class: "dam-staging-label"
      }, esc(translated(facts.additionalMode || "Not individually plotted") + " · +" + stagedPeople)));
      for (var stagedIndex = 0; stagedIndex < stagedPeople; stagedIndex++) {
        var stagedRow = Math.floor(stagedIndex / stagingCapacity);
        var stagedColumn = stagedIndex % stagingCapacity;
        var stagedX = PAD + 9 + stagedColumn * 15;
        var stagedY = 31 + stagedRow * 15;
        layers.actors.push(el("g", {
          class: "dam-staged-person", transform: "translate(" + stagedX + " " + stagedY + ")"
        }, selfEl("circle", { cx: 0, cy: -3.5, r: 2.8, class: "dam-staged-person__head" }) +
          selfEl("path", { d: "M0 0v6M-4 2l4-2 4 2M0 6l-3 5M0 6l3 5", class: "dam-staged-person__body" })));
      }
    }
    var courts = spec.court || [];
    if (!Array.isArray(courts)) courts = [courts];
    courts.forEach(function (court, courtIndex) {
      var courtX = px(court.x), courtY = py(court.y);
      var courtWidth = court.w * scale, courtHeight = court.h * scale;
      layers.surface.push(selfEl("rect", {
        x: courtX + 1.5, y: courtY + Math.max(3, scale * 0.1),
        width: Math.max(0, courtWidth - 3), height: courtHeight,
        rx: 8, class: "dam-court-depth", "data-court-index": courtIndex
      }));
      layers.surface.push(selfEl("rect", {
        x: px(court.x), y: py(court.y), width: court.w * scale, height: court.h * scale,
        rx: 7, class: "dam-court", "data-court-index": courtIndex
      }));
      layers.surface.push(selfEl("rect", {
        x: courtX, y: courtY, width: courtWidth, height: courtHeight,
        rx: 7, class: "dam-court-vignette", "data-court-index": courtIndex,
        "aria-hidden": "true"
      }));
    });
    if (plan) layers.markings.push(sceneLaneMarkup(plan, px, py, scale));

    (spec.zones || []).forEach(function (zone, index) {
      layers.surface.push(selfEl("rect", {
        x: px(zone.x), y: py(zone.y), width: zone.w * scale, height: zone.h * scale,
        rx: 6, class: "dam-zone dam-zone--" + (zone.tone || "target"),
        style: "--dam-index:" + index
      }));
      if (zone.label) {
        layers.markings.push(el("text", {
          x: px(zone.x + zone.w / 2), y: py(zone.y + zone.h / 2),
          class: "dam-zone-label", "text-anchor": "middle", "dominant-baseline": "central"
        }, esc(zone.label)));
      }
    });

    if (spec.net != null) {
      layers.shadows.push(selfEl("line", { x1: px(0), y1: py(spec.net) + 4,
        x2: px(w), y2: py(spec.net) + 4, class: "dam-net-shadow", "aria-hidden": "true" }));
      layers.markings.push(selfEl("line", { x1: px(0), y1: py(spec.net),
        x2: px(w), y2: py(spec.net), class: "dam-net" }));
      layers.equipment.push(selfEl("circle", { cx: px(0), cy: py(spec.net), r: 4, class: "dam-post" }));
      layers.equipment.push(selfEl("circle", { cx: px(w), cy: py(spec.net), r: 4, class: "dam-post" }));
    }
    (spec.lines || []).forEach(function (line) {
      if (line.y != null) layers.markings.push(selfEl("line", { x1: px(0), y1: py(line.y),
        x2: px(w), y2: py(line.y), class: "dam-line" }));
      if (line.x != null) layers.markings.push(selfEl("line", { x1: px(line.x), y1: py(0),
        x2: px(line.x), y2: py(hUnits), class: "dam-line" }));
    });

    (spec.rings || []).forEach(function (ring, index) {
      layers.guides.push(selfEl("circle", {
        cx: px(ring.x), cy: py(ring.y), r: ring.r * scale,
        class: "dam-ring dam-ring--" + (ring.tone || "calm"), style: "--dam-index:" + index
      }));
    });

    var players = spec.players || [];
    var playerR = Math.max(12, scale * 0.38);
    var participantModel = facts.moveBindings ? { moveBindings: facts.moveBindings } : participantModelFor(null, spec);
    var paths = spec.paths || [];
    var ballEntries = [];
    paths.forEach(function (path, index) {
      var kind = path.kind || "ball";
      var d = pathData(path, px, py);
      var distance = pathLength(path);
      var duration = round(clamp(3.2 + distance * 0.16, 3.5, 5.6));
      var delay = round(index * 0.46);
      var plannedRoute = plannedRouteForPath(plan, index);
      var routeId = plannedRoute && plannedRoute.id || "source-route-" + (index + 1);
      var routeVisibility = plan ? activeRoutes[routeId] ? "active" : "context" : "overview";
      layers.guides.push(selfEl("path", {
        d: d, class: "dam-route dam-route--" + kind + " dam-route--" + routeVisibility,
        "marker-end": "url(#" + id + "-" + kind + ")",
        "data-route-id": routeId, "data-source-path-index": index,
        "data-route-visibility": routeVisibility,
        "data-route-owner": plannedRoute && plannedRoute.actorId || "",
        "data-route-type": plannedRoute && plannedRoute.type || kind,
        style: "--dam-delay:" + delay + "s;--dam-duration:" + duration + "s"
      }));
      if (path.label && !path.hideLabel) {
        var from = path.from || [0, 0], to = path.to || from;
        layers.guides.push(el("text", {
          x: px((from[0] + to[0]) / 2), y: py((from[1] + to[1]) / 2) - 8,
          class: "dam-path-label dam-path-label--" + routeVisibility,
          "data-route-id": routeId, "data-route-visibility": routeVisibility,
          "text-anchor": "middle"
        }, esc(path.label)));
      }
      // Preserve authored route styling while using the explicitly reviewed
      // object type. Untagged move paths always remain player movement.
      var objectMove = kind === "move" && (spec.motionBallPaths || []).indexOf(index) !== -1;
      if (!plan && kind === "move" && !objectMove) {
        var style = "--dam-delay:" + delay + "s;--dam-duration:" + duration + "s;offset-path:path('" + d + "')";
        var binding = participantModel.moveBindings[index];
        if (binding) {
          var movingPlayer = binding.player;
          var movingTone = cleanString(movingPlayer.team).replace(/[^a-z0-9_-]/gi, "") || "n";
          var glyph = selfEl("circle", { r: playerR + 5, class: "dam-mover__halo" }) +
            selfEl("circle", { r: playerR, class: "dam-player dam-player--" + movingTone });
          if (movingPlayer.label != null && movingPlayer.label !== "") {
            glyph += el("text", {
              x: 0, y: 0, class: "dam-player-label dam-player-label--" + movingTone,
              "text-anchor": "middle", "dominant-baseline": "central"
            }, esc(movingPlayer.label));
          }
          layers.actors.push(el("g", {
            class: "dam-mover dam-mover--bound", style: style,
            "data-player-index": binding.playerIndex, "data-binding": binding.source
          }, glyph));
        } else {
          layers.actors.push(el("g", { class: "dam-mover", style: style },
            selfEl("circle", { r: 10, class: "dam-mover__halo" }) +
            selfEl("circle", { r: 5.5, class: "dam-mover__dot" })));
        }
      } else if (!plan) {
        ballEntries.push({ path: path, index: index, kind: kind });
      }
    });

    // Only reviewed chains share a moving object. Untagged paths intentionally
    // remain separate, which preserves simultaneous feeds and alternative
    // options without guessing from coincident or nearby geometry.
    if (!plan) {
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
        layers.effects.push(el("g", { class: "dam-flight dam-flight--" + kind,
          "data-route-legs": group.length, "data-flight-profile": "overview", style: style },
          el("g", { class: "dam-flight__body", "aria-hidden": "true" }, ballGlyph(object))));
      });
    }

    (spec.cones || []).forEach(function (cone) {
      var size = scale * 0.3;
      var x = px(cone.x), y = py(cone.y);
      layers.equipment.push(selfEl("path", { d: "M" + x + " " + (y - size) +
        "L" + (x + size) + " " + (y + size) + "L" + (x - size) + " " +
        (y + size) + "z", class: "dam-cone" }));
    });

    (spec.balls || []).forEach(function (ball) {
      layers.equipment.push(el("g", { class: "dam-static-ball",
        transform: "translate(" + round(px(ball.x)) + " " + round(py(ball.y)) + ")" },
        ballGlyph(ball.object)));
    });

    if (plan) {
      sortedSceneActors(plan, activeBeats).forEach(function (actor, depthOrder) {
        layers.actors.push(sceneActorMarkup(actor, plan, activeBeats, px, py, scale, depthOrder));
      });
      var liveBall = activeBallMarkups(plan, activeBeats, px, py);
      layers.shadows = layers.shadows.concat(liveBall.shadows);
      layers.effects = layers.effects.concat(liveBall.flights, liveBall.impacts);
    } else {
      players.map(function (player, index) { return { player: player, sourceIndex: index }; })
        .sort(function (left, right) {
          if (left.player.y !== right.player.y) return left.player.y - right.player.y;
          if (left.player.x !== right.player.x) return left.player.x - right.player.x;
          return left.sourceIndex - right.sourceIndex;
        }).forEach(function (entry, depthOrder) {
        var player = entry.player;
        var index = entry.sourceIndex;
        var x = px(player.x), y = py(player.y);
        var tone = player.team || "n";
        var focus = !paths.length ? selfEl("circle", {
          cx: x, cy: y, r: playerR + 6, class: "dam-player-focus", style: "--dam-index:" + index
        }) : "";
        layers.shadows.push(selfEl("ellipse", { cx: x, cy: y + playerR * 0.72,
          rx: playerR * 0.72, ry: playerR * 0.23, class: "dam-athlete-shadow dam-athlete-shadow--legacy",
          "data-depth-order": depthOrder, "aria-hidden": "true" }));
        layers.actors.push(focus);
        layers.actors.push(selfEl("circle", { cx: x, cy: y, r: playerR,
          class: "dam-player dam-player--" + tone, "data-depth-order": depthOrder }));
        if (player.label != null && player.label !== "") {
          layers.actors.push(el("text", {
            x: x, y: y, class: "dam-player-label dam-player-label--" + tone,
            "text-anchor": "middle", "dominant-baseline": "central"
          }, esc(player.label)));
        }
        if (player.note) {
          layers.foreground.push(el("text", { x: x, y: y + playerR + 13,
            class: "dam-player-note", "text-anchor": "middle" }, esc(player.note)));
        }
      });
    }

    var pieces = [defs(id), layerMarkup("surface", layers.surface),
      layerMarkup("markings", layers.markings), layerMarkup("guides", layers.guides),
      layerMarkup("shadows", layers.shadows), layerMarkup("equipment", layers.equipment),
      layerMarkup("actors", layers.actors), layerMarkup("effects", layers.effects),
      layerMarkup("foreground", layers.foreground)];
    return el("svg", {
      viewBox: "0 0 " + round(width) + " " + round(height), class: "dam-svg dam-svg--broadcast",
      focusable: "false", "aria-hidden": "true", preserveAspectRatio: "xMidYMid meet",
      "data-camera": "broadcast-elevated", "data-plan-mode": plan ? "walkthrough" : "overview",
      "data-depth-axis": "top-to-bottom", "data-active-routes": Object.keys(activeRoutes).length,
      "data-plan-id": plan && plan.id || null,
      "data-beat-id": activeBeat && activeBeat.id || null,
      "data-beat-ids": activeBeats.map(function (beat) { return beat.id; }).join(" ") || null,
      "data-active-beats": activeBeats.length || null,
      "data-active-actors": activeActorCount(activeBeats) || null,
      "data-motion": activeBeat && activeBeat.motionId || null,
      "data-motions": activeBeats.map(function (beat) { return beat.motionId; }).join(" ") || null
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

  // Turn one reviewed court scene into a factual, screen-reader-friendly
  // account of who is plotted and what moves. This deliberately does not infer
  // a setter, passer, queue location, or route from prose. Player roles come
  // only from authored labels/notes/legend items; operation text comes from the
  // saved grouping/flow fields and the current saved instruction.
  function validMinimum(drill) {
    var value = drill && drill.minPlayers;
    return typeof value === "number" && isFinite(value) && value >= 1 &&
      value <= 30 && Math.floor(value) === value ? value : null;
  }

  function defaultViewFor(drill, hasHuman) {
    // The synchronized full-scene walkthrough is the teaching surface for
    // every drill. Body mechanics remains an optional close study, never the
    // default that hides partners, court positions, routes, or equipment.
    return "court";
  }

  function groupedMarkerCount(player) {
    var match = /^\+(\d+)$/.exec(cleanString(player && player.label));
    return match ? Number(match[1]) : 0;
  }

  function isReferenceMarker(player) {
    var label = cleanString(player && player.label);
    var note = cleanString(player && player.note);
    return (label === "•" && /^(spot|ball)$/i.test(note)) ||
      (label === "◎" && /^target$/i.test(note)) ||
      (!label && /^(high ball|ball pops up|land (balanced|inside),? ready|step back|farthest in|passer spot|roll\/sprawl out)$/i.test(note)) ||
      (label === "T" && /^cone \/ hoop \/ coach$/i.test(note));
  }

  function isCoachMarker(player) {
    return cleanString(player && player.team).toLowerCase() === "coach";
  }

  function exactActorIndex(players, path) {
    if (typeof path.playerIndex === "number" && Math.floor(path.playerIndex) === path.playerIndex &&
        path.playerIndex >= 0 && path.playerIndex < players.length) return path.playerIndex;
    var reference = cleanString(path.actor || path.playerId || path.player);
    if (!reference) return -1;
    var matches = [];
    players.forEach(function (player, index) {
      if (isReferenceMarker(player) || groupedMarkerCount(player)) return;
      if ([player.id, player.actor, player.playerId, player.label].some(function (value) {
        return cleanString(value) === reference;
      })) matches.push(index);
    });
    return matches.length === 1 ? matches[0] : -1;
  }

  function nearestOriginIndex(players, path) {
    var from = path && path.from;
    if (!Array.isArray(from) || typeof from[0] !== "number" || typeof from[1] !== "number") return -1;
    var ranked = [];
    players.forEach(function (player, index) {
      if (groupedMarkerCount(player) || isReferenceMarker(player) || isCoachMarker(player)) return;
      if (typeof player.x !== "number" || typeof player.y !== "number") return;
      var dx = player.x - from[0];
      var dy = player.y - from[1];
      ranked.push({ index: index, distance: Math.sqrt(dx * dx + dy * dy) });
    });
    ranked.sort(function (a, b) { return a.distance - b.distance; });
    if (!ranked.length || ranked[0].distance > 0.9) return -1;
    // Equidistant actors are ambiguous, so keep the neutral movement marker.
    if (ranked[1] && Math.abs(ranked[1].distance - ranked[0].distance) < 0.08) return -1;
    return ranked[0].index;
  }

  function participantModelFor(drill, spec) {
    spec = spec || {};
    var players = Array.isArray(spec.players) ? spec.players : [];
    var positionedPeople = 0;
    var groupedPeople = 0;
    var supportPeople = 0;
    players.forEach(function (player) {
      if (isReferenceMarker(player)) return;
      if (isCoachMarker(player)) { supportPeople += 1; return; }
      var grouped = groupedMarkerCount(player);
      if (grouped) groupedPeople += grouped;
      else positionedPeople += 1;
    });
    var minimum = validMinimum(drill);
    var representedPeople = positionedPeople + groupedPeople;
    var bindings = {};
    (spec.paths || []).forEach(function (path, index) {
      var kind = path.kind || "ball";
      var reviewedObjectMove = kind === "move" &&
        (spec.motionBallPaths || []).indexOf(index) !== -1;
      if (kind !== "move" || reviewedObjectMove) return;
      var hasExplicitActor = path.playerIndex != null ||
        !!cleanString(path.actor || path.playerId || path.player);
      var explicit = exactActorIndex(players, path);
      var playerIndex = hasExplicitActor ? explicit : nearestOriginIndex(players, path);
      if (playerIndex >= 0) {
        bindings[index] = {
          pathIndex: index,
          playerIndex: playerIndex,
          player: players[playerIndex],
          source: explicit >= 0 ? "explicit" : "origin"
        };
      }
    });
    return {
      minimum: minimum,
      players: players,
      positionedPeople: positionedPeople,
      groupedPeople: groupedPeople,
      supportPeople: supportPeople,
      representedPeople: representedPeople,
      additional: minimum == null ? 0 : Math.max(0, minimum - representedPeople),
      moveBindings: bindings
    };
  }

  function uniqueLegendRole(spec, tone) {
    if (!tone) return "";
    var matches = (spec.legend || []).filter(function (item) {
      return item && item.tone === tone && cleanString(item.text);
    });
    return matches.length === 1 ? cleanString(matches[0].text) : "";
  }

  function participantTokens(spec) {
    var tokens = [];
    var byKey = {};
    (spec.players || []).forEach(function (player) {
      if (isReferenceMarker(player)) return;
      var grouped = groupedMarkerCount(player);
      var exactLabel = cleanString(player.label);
      var legendRole = uniqueLegendRole(spec, player.team);
      var label = exactLabel || legendRole || "Unlabeled court marker";
      var note = cleanString(player.note);
      var tone = cleanString(player.team) || "n";
      var support = isCoachMarker(player);
      var key = [tone, label, note, grouped ? "group" : support ? "support" : "person"].join("\u001f");
      if (!byKey[key]) {
        byKey[key] = { tone: tone, label: label, note: note, copies: 0, people: 0,
          support: support };
        tokens.push(byKey[key]);
      }
      byKey[key].copies += 1;
      byKey[key].people += grouped || 1;
    });
    return tokens;
  }

  function additionalMode(grouping, flow) {
    var source = (grouping + " " + flow).toLowerCase();
    if (/\b(wait|waiting|queue|line|sideline|sub|subs|off[- ]?court)\b/.test(source)) {
      return "Waiting / line";
    }
    if (/\b(at once|same time|simultaneous|simultaneously|parallel|pairs?|groups?|stations?|circles?|split)\b/.test(source)) {
      return "Parallel / grouped";
    }
    if (/\b(rotate|rotates|rotating|rotation|take turns|alternate|alternates)\b/.test(source)) {
      return "Rotating roles";
    }
    return "Not individually plotted";
  }

  function routeLabel(entry, ballNumber, movementNumber) {
    var exact = cleanString(entry.path && entry.path.label);
    if (exact) return exact;
    if (entry.isBall) {
      return (entry.kind === "serve" ? "Serve route " : "Ball route ") + ballNumber;
    }
    return "Player route " + movementNumber;
  }

  function courtFactsFor(drill, spec, instruction) {
    spec = spec || {};
    var fields = RR.format && RR.format.fields ? RR.format.fields(drill || {}) : {};
    var grouping = cleanString(fields.grouping);
    var flow = cleanString(fields.flow);
    var participants = participantModelFor(drill, spec);
    var minimum = participants.minimum;
    var positionedPeople = participants.positionedPeople;
    var groupedPeople = participants.groupedPeople;
    var representedPeople = participants.representedPeople;
    var additional = participants.additional;

    var ballNumber = 0;
    var movementNumber = 0;
    var ballEntries = [];
    var movementEntries = [];
    (spec.paths || []).forEach(function (path, index) {
      var kind = path.kind || "ball";
      var reviewedObjectMove = kind === "move" &&
        (spec.motionBallPaths || []).indexOf(index) !== -1;
      var entry = { path: path, index: index, kind: kind,
        isBall: kind !== "move" || reviewedObjectMove };
      if (entry.isBall) {
        ballNumber += 1;
        entry.label = routeLabel(entry, ballNumber, movementNumber);
        ballEntries.push(entry);
      } else {
        movementNumber += 1;
        entry.label = routeLabel(entry, ballNumber, movementNumber);
        movementEntries.push(entry);
      }
    });

    var ballSequences = reviewedBallGroups(ballEntries, spec.motionChains).map(function (group) {
      return group.map(function (entry) { return entry.label; });
    });
    return {
      minimum: minimum,
      positionedPeople: positionedPeople,
      groupedPeople: groupedPeople,
      supportPeople: participants.supportPeople,
      representedPeople: representedPeople,
      additional: additional,
      additionalMode: additional ? additionalMode(grouping, flow) : "",
      participantTokens: participantTokens(spec),
      moveBindings: participants.moveBindings,
      ballRouteCount: ballEntries.length,
      ballSequences: ballSequences,
      movementRouteCount: movementEntries.length,
      movementRoutes: movementEntries.map(function (entry) { return entry.label; }),
      grouping: grouping,
      flow: flow,
      instruction: cleanString(instruction) || cleanString(spec.caption) || realCaption(drill)
    };
  }

  function factMetric(value, label, extraClass) {
    var metric = node("span", "drill-motion__court-metric" + (extraClass ? " " + extraClass : ""));
    metric.appendChild(node("strong", "drill-motion__court-metric-value", value));
    metric.appendChild(node("span", "drill-motion__court-metric-label", translated(label)));
    return metric;
  }

  function factRow(label, text, className) {
    var row = node("div", "drill-motion__court-fact" + (className ? " " + className : ""));
    row.appendChild(node("dt", "drill-motion__court-fact-label", translated(label)));
    row.appendChild(node("dd", "drill-motion__court-fact-copy", translated(text)));
    return row;
  }

  function routeRow(label, count, sequences, emptyText) {
    var row = node("div", "drill-motion__court-route");
    var heading = node("span", "drill-motion__court-route-label");
    heading.appendChild(node("strong", "", String(count)));
    heading.appendChild(document.createTextNode(" " + translated(label)));
    row.appendChild(heading);
    var list = node("span", "drill-motion__court-route-list");
    if (!sequences.length) {
      list.appendChild(node("span", "drill-motion__court-route-empty", translated(emptyText)));
    } else {
      sequences.forEach(function (sequenceLabels) {
        var chip = node("span", "drill-motion__court-route-chip");
        sequenceLabels.forEach(function (route, index) {
          if (index) chip.appendChild(node("span", "drill-motion__court-route-arrow", "→"));
          chip.appendChild(node("span", "", translated(route)));
        });
        list.appendChild(chip);
      });
    }
    row.appendChild(list);
    return row;
  }

  function participantTokenNode(token, additional) {
    var tone = cleanString(token.tone).replace(/[^a-z0-9_-]/gi, "") || "n";
    var item = node("li", "drill-motion__court-token drill-motion__court-token--" + tone +
      (additional ? " drill-motion__court-token--additional" : "") +
      (token.support ? " drill-motion__court-token--support" : ""));
    var avatars = node("span", "drill-motion__court-avatars");
    avatars.setAttribute("aria-hidden", "true");
    for (var index = 0; index < token.people; index++) {
      avatars.appendChild(node("span", "drill-motion__court-avatar"));
    }
    item.appendChild(avatars);
    var label = additional
      ? "+" + token.people + " · " + translated(token.label)
      : translated(token.label) + (token.copies > 1 ? " ×" + token.copies : "");
    item.appendChild(node("span", "drill-motion__court-token-label", label));
    if (token.note) item.appendChild(node("span", "drill-motion__court-token-note", translated(token.note)));
    if (token.support) item.appendChild(node("span", "drill-motion__court-token-note",
      translated("support role")));
    item.setAttribute("aria-label", token.people + " · " + translated(token.label) +
      (token.note ? " · " + translated(token.note) : ""));
    return item;
  }

  function fillCourtFacts(container, facts) {
    container.innerHTML = "";
    container.appendChild(node("h3", "drill-motion__court-summary-title", translated("Players & mechanics")));

    var metrics = node("div", "drill-motion__court-metrics");
    metrics.appendChild(factMetric(facts.positionedPeople, "Positioned"));
    if (facts.groupedPeople) metrics.appendChild(factMetric("+" + facts.groupedPeople, "Grouped marker"));
    if (facts.supportPeople) metrics.appendChild(factMetric(facts.supportPeople, "Coach / support"));
    if (facts.minimum != null) metrics.appendChild(factMetric(facts.minimum, "Saved minimum"));
    if (facts.additional) {
      metrics.appendChild(factMetric("+" + facts.additional, facts.additionalMode,
        "drill-motion__court-metric--additional"));
    }
    container.appendChild(metrics);

    if (facts.participantTokens.length || facts.additional) {
      var participantSection = node("div", "drill-motion__court-participants");
      participantSection.appendChild(node("span", "drill-motion__court-kicker", translated("Participants")));
      var participantList = node("ul", "drill-motion__court-tokens");
      facts.participantTokens.forEach(function (token) {
        participantList.appendChild(participantTokenNode(token, false));
      });
      if (facts.additional) participantList.appendChild(participantTokenNode({
        tone: "n", label: facts.additionalMode, note: "", copies: facts.additional,
        people: facts.additional
      }, true));
      participantSection.appendChild(participantList);
      container.appendChild(participantSection);
    }

    var mechanics = node("div", "drill-motion__court-mechanics");
    mechanics.appendChild(node("span", "drill-motion__court-kicker", translated("Authored routes")));
    mechanics.appendChild(routeRow(facts.ballRouteCount === 1 ? "ball path" : "ball paths",
      facts.ballRouteCount, facts.ballSequences,
      "No authored ball path in this step."));
    mechanics.appendChild(routeRow(facts.movementRouteCount === 1 ? "player path" : "player paths",
      facts.movementRouteCount,
      facts.movementRoutes.map(function (route) { return [route]; }),
      "No authored player path in this step."));
    container.appendChild(mechanics);

    var operation = node("dl", "drill-motion__court-operation");
    if (facts.grouping) operation.appendChild(factRow("Grouping", facts.grouping));
    if (facts.flow) operation.appendChild(factRow("How it runs", facts.flow));
    if (facts.instruction) operation.appendChild(factRow("Current step", facts.instruction,
      "drill-motion__court-fact--step"));
    container.appendChild(operation);
  }

  function iconButton(label, svgBody, className) {
    var button = node("button", "drill-motion__button " + (className || ""));
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.innerHTML = "<svg viewBox='0 0 24 24' aria-hidden='true' focusable='false'>" + svgBody + "</svg>" +
      "<span>" + esc(label) + "</span>";
    return button;
  }

  function techniqueLens(id) {
    var root = node("aside", "dam-technique-lens");
    root.id = id + "-technique-lens";
    root.setAttribute("aria-label", "Active walkthrough detail");
    var visual = node("span", "dam-technique-lens__visual");
    visual.setAttribute("aria-hidden", "true");
    var copy = node("span", "dam-technique-lens__copy");
    var kicker = node("span", "dam-technique-lens__kicker", "Technique lens");
    var motionLabel = node("strong", "dam-technique-lens__motion");
    var role = node("span", "dam-technique-lens__role");
    var chain = node("span", "dam-technique-lens__chain");
    var instruction = node("span", "dam-technique-lens__instruction");
    var equipment = node("span", "dam-technique-lens__equipment");
    copy.appendChild(kicker);
    copy.appendChild(motionLabel);
    copy.appendChild(role);
    copy.appendChild(chain);
    copy.appendChild(instruction);
    copy.appendChild(equipment);
    root.appendChild(visual);
    root.appendChild(copy);
    return { root: root, visual: visual, motion: motionLabel, role: role,
      chain: chain, instruction: instruction, equipment: equipment };
  }

  function actorRole(plan, actorId) {
    var actor = actorById(plan, actorId);
    return actor ? cleanString(actor.role || actor.label) : "";
  }

  function endpointRole(endpoint, fallback) {
    var type = cleanString(endpoint && endpoint.type).toLowerCase();
    var label = cleanString(endpoint && endpoint.label) || fallback;
    if (type === "wall") return /target/i.test(label) ? "Wall target" : "Wall";
    if (type === "floor") return "Floor";
    if (type === "hoop") return /target/i.test(label) ? "Hoop target" : "Hoop";
    return label;
  }

  function contactChainText(plan, beat) {
    if (!plan || !beat) return "";
    var activeContact = contactById(plan, beat.contactId);
    if (activeContact) {
      var sameChain = (plan.contacts || []).filter(function (contact) {
        return contact.chainId === activeContact.chainId;
      });
      return sameChain.map(function (contact) {
        var source = actorRole(plan, contact.sourceActorId) ||
          cleanString(contact.sourceEndpoint && contact.sourceEndpoint.label) || "Source";
        var recipient = actorRole(plan, contact.recipientActorId) ||
          cleanString(contact.recipientEndpoint && contact.recipientEndpoint.label) || "Recipient";
        if (!contact.sourceActorId && contact.sourceEndpoint) {
          source = endpointRole(contact.sourceEndpoint, source);
        }
        if (!contact.recipientActorId && contact.recipientEndpoint) {
          recipient = endpointRole(contact.recipientEndpoint, recipient);
        }
        return source + " — " + (contact.motion && contact.motion.label || contact.motionId) + " → " + recipient;
      }).join(" · ");
    }
    var route = routeById(plan, beat.routeId);
    if (route) return (actorRole(plan, beat.actorId) || "Athlete") + " — " +
      (route.label || "follows the authored route");
    return actorRole(plan, beat.actorId) ? actorRole(plan, beat.actorId) + " performs this phase" : "Saved drill phase";
  }

  function fillTechniqueLens(lens, plan, beatOrBeats) {
    if (!lens) return;
    var beats = normalizedActiveBeats(beatOrBeats);
    var beat = beats[0] || null;
    var visible = !!(plan && beat && beat.motion);
    lens.root.hidden = !visible;
    if (!visible) return;
    var meta = beat.motion;
    var dimensions = GRID_DIMENSIONS[meta.grid] || GRID_DIMENSIONS.roster;
    lens.root.setAttribute("data-plan-id", plan.id || "");
    lens.root.setAttribute("data-beat-id", beat.id || "");
    lens.root.setAttribute("data-beat-ids", beats.map(function (item) { return item.id; }).join(" "));
    lens.root.setAttribute("data-active-beats", String(beats.length));
    lens.root.setAttribute("data-active-actors", String(activeActorCount(beats)));
    lens.root.setAttribute("data-motion", beat.motionId || "");
    lens.root.setAttribute("data-actor-id", beat.actorId || "");
    var animates = meta.animate !== false;
    lens.root.setAttribute("data-animates", animates ? "true" : "false");
    lens.visual.classList.toggle("is-animated", animates);
    lens.visual.classList.toggle("is-static", !animates);
    lens.visual.style.setProperty("--dam-lens-row", rowPosition(meta.row));
    lens.visual.style.setProperty("--dam-lens-duration", Math.max(240,
      beat.durationMs || meta.durationMs || 1000) + "ms");
    if (animates) {
      // A previous static poster may have installed inline locks. Removing
      // them—not assigning another animation string—re-enables the canonical
      // responsive/reduced-motion CSS for every later action.
      lens.visual.style.removeProperty("animation");
      lens.visual.style.removeProperty("background-position-x");
    } else {
      lens.visual.style.setProperty("animation", "none");
      lens.visual.style.setProperty("background-position-x",
        columnPosition(finiteNumber(meta.posterFrame) ? meta.posterFrame : 0));
    }
    lens.visual.style.backgroundImage = "url('" + safeAsset(meta.asset) + "')";
    lens.visual.style.aspectRatio = dimensions[0] + " / " + dimensions[1];
    var athleteCount = activeActorCount(beats);
    lens.motion.textContent = (meta.label || beat.label || "Saved movement") +
      (athleteCount > 1 ? " · " + athleteCount + " synchronized athletes" : "");
    var roles = [];
    var chains = [];
    beats.forEach(function (item) {
      var role = actorRole(plan, item.actorId);
      var chain = contactChainText(plan, item);
      if (role && roles.indexOf(role) === -1) roles.push(role);
      if (chain && chains.indexOf(chain) === -1) chains.push(chain);
    });
    lens.role.textContent = roles.length ? roles.join(" · ") : "Full group operation";
    lens.chain.textContent = chains.join(" · ");
    lens.instruction.textContent = plan.instruction || beat.instruction || "";
    var equipment = (plan.equipment || []).map(function (item) { return item.label; });
    lens.equipment.textContent = equipment.length
      ? "Equipment: " + equipment.join(", ") : "Equipment: none saved";
  }

  function figure(drill) {
    var specs = scenesFor(drill);
    var humanApi = RR.drillHumanMotion;
    var program = humanApi && humanApi.programFor ? humanApi.programFor(drill, specs) : [];
    var hasHuman = !!program.length;
    var needsHumanChoice = !!(drill && drill.custom && !hasHuman);
    var items = hasHuman ? program : specs.map(function (spec, index) {
      return {
        title: spec.title || (specs.length > 1 ? "Step " + (index + 1) : "How it moves"),
        instruction: spec.caption || realCaption(drill), scene: spec
      };
    });
    var id = "drill-motion-" + (++sequence);
    var root = node("section", "drill-motion has-court-details");
    root.setAttribute("aria-label", "Live animated walkthrough for " +
      (drill.name || "this drill") + (needsHumanChoice
        ? ". Body mechanics selection is still needed." : "."));
    root.setAttribute("data-drill-id", drill.id || "custom");
    root.setAttribute("data-human-demo", hasHuman ? "true" : "false");

    var eyebrow = node("span", "drill-motion__eyebrow", needsHumanChoice
      ? "Live walkthrough · saved details only" : "Live drill walkthrough");
    var phaseStatus = node("span", "drill-motion__phase");
    var announcer = node("span", "dam-motion-announcer");
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    var top = node("div", "drill-motion__top");
    var topCopy = node("div", "drill-motion__top-copy");
    topCopy.appendChild(eyebrow);
    topCopy.appendChild(phaseStatus);
    topCopy.appendChild(announcer);
    top.appendChild(topCopy);

    var transport = node("div", "drill-motion__transport");
    var still = node("span", "drill-motion__reduced", "Still preview");
    still.setAttribute("title", "Animation is off because reduced motion is enabled on this device.");
    transport.appendChild(still);
    var pause = iconButton(translated("Pause"), "<path d='M8 5v14M16 5v14'/>", "drill-motion__pause");
    pause.setAttribute("data-no-i18n", "");
    transport.appendChild(pause);
    var replay = iconButton("Replay", "<path d='M4 11a8 8 0 1 0 2.3-5.7L4 7.6'/><path d='M4 3v4.6h4.6'/>", "drill-motion__replay");
    transport.appendChild(replay);
    top.appendChild(transport);
    root.appendChild(top);

    if (needsHumanChoice) {
      var humanRequired = node("p", "drill-motion__human-required",
        "This walkthrough uses only your saved people, positions, equipment, and instructions. Choose a body-mechanics reference while editing if you also want a close-up; RallyReady will not guess one.");
      humanRequired.setAttribute("role", "status");
      root.appendChild(humanRequired);
    }

    var viewBar = null;
    var techniqueButton = null;
    var courtButton = null;
    if (hasHuman) {
      viewBar = node("div", "drill-motion__viewbar");
      viewBar.setAttribute("role", "tablist");
      viewBar.setAttribute("aria-label", "Demonstration view");
      techniqueButton = node("button", "drill-motion__view-button", "Body mechanics");
      techniqueButton.type = "button";
      techniqueButton.id = id + "-technique-tab";
      techniqueButton.setAttribute("role", "tab");
      techniqueButton.setAttribute("aria-selected", "false");
      techniqueButton.tabIndex = -1;
      courtButton = node("button", "drill-motion__view-button is-active", "Live walkthrough");
      courtButton.type = "button";
      courtButton.id = id + "-court-tab";
      courtButton.setAttribute("role", "tab");
      courtButton.setAttribute("aria-selected", "true");
      courtButton.tabIndex = 0;
      viewBar.appendChild(techniqueButton);
      viewBar.appendChild(courtButton);
      root.appendChild(viewBar);
    }

    var viewport = node("div", "drill-motion__viewport");
    viewport.id = id + "-viewport";
    viewport.setAttribute("role", "group");

    var techniqueView = null;
    var humanCrop = null;
    var humanImage = null;
    var humanLabel = null;
    var humanPhases = null;
    var humanActions = null;
    if (hasHuman) {
      techniqueView = node("div", "drill-motion__technique");
      techniqueView.id = id + "-technique";
      techniqueView.setAttribute("role", "tabpanel");
      techniqueView.setAttribute("aria-labelledby", techniqueButton.id);
      var humanDemo = node("div", "dam-human-demo");
      var humanVisual = node("div", "dam-human-visual");
      humanVisual.appendChild(node("span", "dam-human-floor"));
      humanCrop = node("div", "dam-human-crop");
      humanImage = node("img", "dam-human-atlas");
      humanImage.alt = "";
      humanImage.setAttribute("aria-hidden", "true");
      humanImage.decoding = "async";
      humanImage.loading = "lazy";
      humanCrop.appendChild(humanImage);
      humanVisual.appendChild(humanCrop);
      humanLabel = node("span", "dam-human-label");
      humanVisual.appendChild(humanLabel);
      humanDemo.appendChild(humanVisual);
      var humanGuide = node("div", "dam-human-guide");
      humanActions = node("div", "dam-human-actions");
      humanActions.setAttribute("aria-label", "Techniques in this step");
      humanPhases = node("ol", "dam-human-phases");
      humanPhases.id = id + "-phases";
      humanPhases.setAttribute("aria-label", "Technique phases and body cues");
      humanGuide.appendChild(humanActions);
      humanGuide.appendChild(humanPhases);
      humanDemo.appendChild(humanGuide);
      techniqueView.appendChild(humanDemo);
      viewport.appendChild(techniqueView);
      techniqueButton.setAttribute("aria-controls", techniqueView.id);
    }

    var courtView = node("div", "drill-motion__court-view");
    courtView.id = id + "-court";
    courtView.setAttribute("role", "tabpanel");
    if (courtButton) courtView.setAttribute("aria-labelledby", courtButton.id);
    else courtView.setAttribute("aria-label", "Live walkthrough");
    var courtDiagram = node("div", "drill-motion__court-diagram");
    var courtArtwork = node("div", "dam-live-artwork");
    var lens = techniqueLens(id);
    courtDiagram.appendChild(courtArtwork);
    var courtInspector = node("div", "drill-motion__court-inspector");
    var courtSummary = node("aside", "drill-motion__court-summary");
    courtSummary.setAttribute("aria-label", translated("Court participant and movement details"));
    courtSummary.tabIndex = 0;
    courtInspector.appendChild(lens.root);
    courtInspector.appendChild(courtSummary);
    courtView.appendChild(courtDiagram);
    courtView.appendChild(courtInspector);
    viewport.appendChild(courtView);
    if (courtButton) courtButton.setAttribute("aria-controls", courtView.id);
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
    var coach = node("aside", "drill-motion__coach");
    var coachTitle = node("p", "drill-motion__coach-title", "Coach this");
    var coachList = node("ul", "drill-motion__coach-list");
    coach.appendChild(coachTitle);
    coach.appendChild(coachList);
    title.id = id + "-title";
    caption.id = id + "-caption";
    legend.id = id + "-legend";
    viewport.setAttribute("aria-labelledby", title.id);
    viewport.setAttribute("aria-describedby", caption.id + " " + legend.id +
      (humanPhases ? " " + humanPhases.id : ""));
    if (pause) pause.setAttribute("aria-controls", viewport.id);
    if (replay) replay.setAttribute("aria-controls", viewport.id);
    copy.appendChild(title);
    copy.appendChild(caption);
    copy.appendChild(legend);
    info.appendChild(copy);
    info.appendChild(coach);

    var stepControls = null;
    var previous = null;
    var next = null;
    var dots = [];
    if (items.length > 1) {
      stepControls = node("div", "drill-motion__steps");
      stepControls.setAttribute("aria-label", "Animation steps");
      previous = iconButton("Previous step", "<path d='m15 18-6-6 6-6'/>", "drill-motion__step-button");
      next = iconButton("Next step", "<path d='m9 18 6-6-6-6'/>", "drill-motion__step-button");
      var dotRow = node("div", "drill-motion__dots");
      items.forEach(function (_, index) {
        var dot = node("button", "drill-motion__dot");
        dot.type = "button";
        dot.setAttribute("aria-label", "Show step " + (index + 1));
        dot.addEventListener("click", function () { show(index, true); });
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
    // Every drill leads with its factual full-scene operation. The optional
    // body-mechanics tab never hides partners, queues, or authored routes on
    // initial entry.
    var currentView = defaultViewFor(drill, hasHuman);
    var paused = false;
    var actionIndex = 0;
    var currentSpec = null;
    var currentFacts = null;
    var currentPlan = null;
    var activeBeatIndex = 0;
    var beatTimer = null;

    function fillHuman(item) {
      var actionIds = item.actions && item.actions.length ? item.actions : [item.action];
      actionIndex = clamp(actionIndex, 0, actionIds.length - 1);
      var actionId = actionIds[actionIndex];
      var meta = humanApi.assetFor(actionId);
      if (!meta) return;
      var frame = actionId === item.action ? item.frame :
        (humanApi.frameFor ? humanApi.frameFor(actionId, item.instruction) : 0);
      techniqueView.setAttribute("data-mode", meta.mode);
      humanCrop.setAttribute("data-mode", meta.mode);
      humanCrop.style.setProperty("--dam-atlas-ratio", meta.width + " / " + meta.height);
      humanCrop.style.setProperty("--dam-poster-x", frame % 2 ? "-50%" : "0%");
      humanCrop.style.setProperty("--dam-poster-y", frame > 1 ? "-50%" : "0%");
      humanImage.src = meta.asset;
      humanImage.width = meta.width;
      humanImage.height = meta.height;
      humanLabel.textContent = meta.label;
      humanActions.innerHTML = "";
      actionIds.forEach(function (listedActionId, listedIndex) {
        var actionMeta = humanApi.assetFor(listedActionId);
        if (!actionMeta) return;
        var interactive = actionIds.length > 1;
        var chip = node(interactive ? "button" : "span",
          "dam-human-action" + (listedIndex === actionIndex ? " is-primary" : ""), actionMeta.label);
        if (interactive) {
          chip.type = "button";
          chip.setAttribute("aria-pressed", listedIndex === actionIndex ? "true" : "false");
          chip.setAttribute("aria-label", "Show " + actionMeta.label + " technique");
          chip.addEventListener("click", function () { selectAction(listedIndex); });
        }
        humanActions.appendChild(chip);
      });
      humanPhases.innerHTML = "";
      var visiblePhases = meta.mode === "catalog" ? [meta.phases[frame] || meta.phases[0]] : meta.phases;
      visiblePhases.forEach(function (phase, index) {
        var row = node("li", "dam-human-phase");
        var number = node("span", "dam-human-phase__number", String(meta.mode === "catalog" ? frame + 1 : index + 1));
        number.setAttribute("aria-hidden", "true");
        var words = node("span", "dam-human-phase__words");
        words.appendChild(node("strong", "dam-human-phase__label", phase.label));
        words.appendChild(node("span", "dam-human-phase__cue", phase.cue));
        row.appendChild(number);
        row.appendChild(words);
        humanPhases.appendChild(row);
      });
    }

    function activeMeta(item) {
      if (!hasHuman || !item) return null;
      var actionIds = item.actions && item.actions.length ? item.actions : [item.action];
      return humanApi.assetFor(actionIds[clamp(actionIndex, 0, actionIds.length - 1)]);
    }

    function actionStatus(item, meta) {
      var actionIds = item.actions && item.actions.length ? item.actions : [item.action];
      var sequenceLabel = actionIds.length > 1
        ? " · Action " + (actionIndex + 1) + " of " + actionIds.length
        : "";
      return item.title + sequenceLabel + (meta ? " · " + meta.label : "");
    }

    function selectAction(index) {
      if (!hasHuman) return;
      var item = items[current];
      var actionIds = item.actions && item.actions.length ? item.actions : [item.action];
      actionIndex = clamp(index, 0, actionIds.length - 1);
      fillHuman(item);
      setView(currentView, true);
      restart();
    }

    function clearBeatTimer() {
      if (beatTimer != null) window.clearTimeout(beatTimer);
      beatTimer = null;
    }

    function posterBeatIndex(plan) {
      var count = plan && plan.beats ? plan.beats.length : 0;
      if (!count) return 0;
      var savedIndex = clamp(finiteNumber(plan.posterBeat) ? Math.floor(plan.posterBeat) : 0, 0, count - 1);
      var group = concurrentBeatsFor(plan, savedIndex);
      return group.length ? plan.beats.indexOf(group[0]) : savedIndex;
    }

    function activeBeatGroup() {
      var group = concurrentBeatsFor(currentPlan, activeBeatIndex);
      if (group.length && currentPlan && currentPlan.beats) {
        activeBeatIndex = currentPlan.beats.indexOf(group[0]);
      }
      return group;
    }

    function activeBeat() {
      var group = activeBeatGroup();
      return group[0] || null;
    }

    function canCycleBeats() {
      var beats = currentPlan && currentPlan.beats || [];
      var firstGroup = concurrentBeatsFor(currentPlan, 0);
      return !!(beats.length > firstGroup.length &&
        currentView === "court" && !paused && !document.hidden &&
        root._damIntersecting !== false && !reducedMotionActive());
    }

    function exposePlanState(beatOrBeats) {
      var beats = normalizedActiveBeats(beatOrBeats);
      var beat = beats[0] || null;
      var planId = currentPlan && currentPlan.id || "";
      var beatId = beat && beat.id || "";
      var motionId = beat && beat.motionId || "";
      var actorId = beat && beat.actorId || "";
      var routeId = beat && beat.routeId || "";
      var contactId = beat && beat.contactId || "";
      var beatCount = currentPlan && currentPlan.beats ? currentPlan.beats.length : 0;
      [root, courtView, courtArtwork].forEach(function (target) {
        target.setAttribute("data-plan-id", planId);
        target.setAttribute("data-plan-valid", currentPlan ? String(currentPlan.valid !== false) : "false");
        target.setAttribute("data-active-beat", beat ? String(activeBeatIndex) : "");
        target.setAttribute("data-beat-id", beatId);
        target.setAttribute("data-beat-ids", beats.map(function (item) { return item.id; }).join(" "));
        target.setAttribute("data-active-beats", String(beats.length));
        target.setAttribute("data-active-actors", String(activeActorCount(beats)));
        target.setAttribute("data-beat-count", String(beatCount));
        target.setAttribute("data-motion", motionId);
        target.setAttribute("data-actor-id", actorId);
        target.setAttribute("data-route-id", routeId);
        target.setAttribute("data-contact-id", contactId);
      });
      root.setAttribute("data-scene-index", currentPlan && currentPlan.sceneIndex != null
        ? String(currentPlan.sceneIndex) : "");
      root.setAttribute("data-step-index", currentPlan && currentPlan.stepIndex != null
        ? String(currentPlan.stepIndex) : "");
      root.setAttribute("data-operation-mode", currentPlan && currentPlan.operationMode || "");
      root.setAttribute("data-plan-actors", currentPlan && currentPlan.actors
        ? String(currentPlan.actors.length) : "0");
    }

    function renderActiveBeat() {
      if (!currentSpec || !currentFacts) return;
      var beats = activeBeatGroup();
      var beat = beats[0] || null;
      courtArtwork.innerHTML = renderSvg(currentSpec,
        id + "-scene-" + current + "-beat-" + activeBeatIndex,
        currentFacts, currentPlan, beats);
      fillTechniqueLens(lens, currentPlan, beats);
      exposePlanState(beats);
      var fill = progress.firstElementChild;
      if (fill) {
        var duration = concurrentDuration(beats);
        fill.style.animationDuration = duration + "ms";
        fill.style.setProperty("--dam-duration", duration + "ms");
      }
      setView(currentView);
      restart();
    }

    // This is the only time-based scene controller. Sprite sheets and route
    // travel use the same active beat duration, so athlete, ball, lens, and
    // progress change as one. Autoplay remains silent to assistive technology;
    // the dedicated announcer is updated only by user-selected steps/views.
    function scheduleBeat() {
      clearBeatTimer();
      if (!canCycleBeats()) return;
      var beats = activeBeatGroup();
      beatTimer = window.setTimeout(function () {
        beatTimer = null;
        if (!root.isConnected || !canCycleBeats()) return;
        activeBeatIndex = (activeBeatIndex + Math.max(1, beats.length)) % currentPlan.beats.length;
        renderActiveBeat();
        scheduleBeat();
      }, concurrentDuration(beats));
    }

    function fillCoach(item) {
      coachList.innerHTML = "";
      var cues = cleanStringList(drill && drill.cues);
      cues.forEach(function (cue) {
        var li = node("li", "drill-motion__coach-cue" + (cue === item.cue ? " is-current" : ""), cue);
        coachList.appendChild(li);
      });
      coach.hidden = !cues.length;
    }

    function announceCurrentState() {
      var item = items[current];
      if (!item) return;
      var meta = activeMeta(item);
      var mode = currentView === "technique" ? "Body mechanics" : "Live walkthrough";
      var detail = currentView === "technique" && meta ? actionStatus(item, meta) : item.title;
      announcer.textContent = translated(mode + " · Step " + (current + 1) +
        " of " + items.length + " · " + detail);
    }

    function setView(view, announce) {
      currentView = hasHuman && view === "technique" ? "technique" : "court";
      root.setAttribute("data-view", currentView);
      if (techniqueView) techniqueView.hidden = currentView !== "technique";
      courtView.hidden = currentView !== "court";
      if (techniqueButton) {
        var showingTechnique = currentView === "technique";
        techniqueButton.classList.toggle("is-active", showingTechnique);
        techniqueButton.setAttribute("aria-selected", showingTechnique ? "true" : "false");
        techniqueButton.tabIndex = showingTechnique ? 0 : -1;
        courtButton.classList.toggle("is-active", !showingTechnique);
        courtButton.setAttribute("aria-selected", showingTechnique ? "false" : "true");
        courtButton.tabIndex = showingTechnique ? -1 : 0;
      }
      legend.hidden = currentView !== "court" || !legend.children.length;
      var item = items[current];
      var meta = activeMeta(item);
      var beat = activeBeat();
      var beatGroup = activeBeatGroup();
      var beatCount = currentPlan && currentPlan.beats ? currentPlan.beats.length : 0;
      var liveStatus = "Live walkthrough · " + item.title;
      if (beat) liveStatus += " · Beat " + (activeBeatIndex + 1) + " of " + beatCount +
        " · " + (beat.label || beat.motion && beat.motion.label || "Saved movement") +
        (beatGroup.length > 1 ? " · " + beatGroup.length + " simultaneous actions" : "");
      phaseStatus.textContent = translated(currentView === "technique" && meta
        ? actionStatus(item, meta) : liveStatus);
      title.textContent = currentView === "technique" && meta ? actionStatus(item, meta) : item.title;
      viewport.setAttribute("aria-label", title.textContent + ". " + caption.textContent);
      if (announce) announceCurrentState();
    }

    function preloadNext(index) {
      if (!hasHuman || currentView !== "technique" || typeof Image === "undefined") return;
      var assetIds = (items[index].actions || []).slice(1);
      if (index + 1 < items.length) assetIds.push(items[index + 1].action);
      window.setTimeout(function () {
        if (!root.isConnected || root._damIntersecting === false || !root.getClientRects().length) return;
        var seen = {};
        assetIds.forEach(function (actionId) {
          var meta = humanApi.assetFor(actionId);
          if (!meta || seen[meta.asset]) return;
          seen[meta.asset] = true;
          var preload = new Image();
          preload.decoding = "async";
          preload.src = meta.asset;
        });
      }, 0);
    }

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
    function show(index, announce) {
      clearBeatTimer();
      current = clamp(index, 0, items.length - 1);
      actionIndex = 0;
      var item = items[current];
      var spec = item.scene || specs[Math.min(current, specs.length - 1)] || {};
      var instruction = item.instruction || realCaption(drill);
      var stepIndex = finiteNumber(item.sourceStep) && item.sourceStep >= 0
        ? Math.floor(item.sourceStep) : current;
      var sceneIndex = finiteNumber(item.sceneIndex) && item.sceneIndex >= 0
        ? Math.floor(item.sceneIndex) : specs.indexOf(spec);
      if (sceneIndex < 0) sceneIndex = Math.min(current, Math.max(0, specs.length - 1));
      var sceneUsageCount = items.filter(function (entry) {
        var entrySceneIndex = finiteNumber(entry.sceneIndex) && entry.sceneIndex >= 0
          ? Math.floor(entry.sceneIndex) : specs.indexOf(entry.scene);
        return entrySceneIndex === sceneIndex;
      }).length;
      currentSpec = spec;
      currentFacts = courtFactsFor(drill, spec, instruction);
      currentPlan = null;
      root.removeAttribute("data-plan-error");
      if (RR.drillChoreography && typeof RR.drillChoreography.planFor === "function") {
        try {
          currentPlan = RR.drillChoreography.planFor(drill, spec, instruction,
            { stepIndex: stepIndex, sceneIndex: sceneIndex,
              sceneUsageCount: sceneUsageCount,
              showFullScene: item.supplementalScene === true });
        } catch (error) {
          // Keep the established factual SVG available if a future malformed
          // custom record reaches the planner; never replace it with invented
          // people or routes.
          root.setAttribute("data-plan-error", "true");
        }
      }
      activeBeatIndex = reducedMotionActive() ? posterBeatIndex(currentPlan) : 0;
      if (hasHuman && currentView === "technique") fillHuman(item);
      fillCourtFacts(courtSummary, currentFacts);
      caption.textContent = instruction;
      fillLegend(legend, spec.legend);
      fillCoach(item);
      dots.forEach(function (dot, i) {
        var active = i === current;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-current", active ? "step" : "false");
      });
      if (previous) previous.disabled = current === 0;
      if (next) next.disabled = current === items.length - 1;
      renderActiveBeat();
      if (announce) announceCurrentState();
      preloadNext(current);
      scheduleBeat();
    }

    function activateView(view, focus) {
      var nextView = hasHuman && view === "technique" ? "technique" : "court";
      var changed = currentView !== nextView;
      if (nextView === "technique") {
        clearBeatTimer();
        if (changed) fillHuman(items[current]);
        setView(nextView, changed);
        if (changed) restart();
        preloadNext(current);
      } else {
        setView(nextView, changed);
        renderActiveBeat();
        scheduleBeat();
      }
      if (focus) (nextView === "technique" ? techniqueButton : courtButton).focus();
    }
    function viewKeydown(event) {
      var nextView = null;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp" || event.key === "Home") nextView = "technique";
      if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "End") nextView = "court";
      if (!nextView) return;
      event.preventDefault();
      activateView(nextView, true);
    }
    if (techniqueButton) {
      techniqueButton.addEventListener("click", function () { activateView("technique", false); });
      techniqueButton.addEventListener("keydown", viewKeydown);
    }
    if (courtButton) {
      courtButton.addEventListener("click", function () { activateView("court", false); });
      courtButton.addEventListener("keydown", viewKeydown);
    }
    if (pause) pause.addEventListener("click", function () {
      paused = !paused;
      updatePause();
      if (paused) clearBeatTimer();
      else {
        if (currentView === "court") renderActiveBeat();
        else restart();
        scheduleBeat();
      }
    });
    if (replay) replay.addEventListener("click", function () {
      clearBeatTimer();
      paused = false;
      actionIndex = 0;
      activeBeatIndex = reducedMotionActive() ? posterBeatIndex(currentPlan) : 0;
      if (hasHuman && currentView === "technique") fillHuman(items[current]);
      updatePause();
      renderActiveBeat();
      scheduleBeat();
    });
    if (previous) previous.addEventListener("click", function () { if (current > 0) show(current - 1, true); });
    if (next) next.addEventListener("click", function () { if (current < items.length - 1) show(current + 1, true); });
    show(0, false);
    updatePause();
    root._damAutoPauseChanged = function (autoPaused) {
      if (autoPaused) clearBeatTimer();
      else {
        if (currentView === "court") renderActiveBeat();
        else restart();
        scheduleBeat();
      }
    };
    root._damMotionChanged = function (reduceMotion) {
      clearBeatTimer();
      activeBeatIndex = reduceMotion ? posterBeatIndex(currentPlan) : 0;
      renderActiveBeat();
      if (!reduceMotion) scheduleBeat();
    };
    registerVisibility(root);
    return root;
  }

  return {
    figure: figure,
    scenesFor: scenesFor,
    deriveSpec: deriveSpec,
    isAuthored: isAuthored,
    renderSvg: renderSvg,
    concurrentBeatsFor: concurrentBeatsFor,
    courtFactsFor: courtFactsFor,
    participantModelFor: participantModelFor,
    defaultViewFor: defaultViewFor
  };
})();
