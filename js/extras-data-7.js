// extras-data-7.js — HITTING drill diagrams (RR.extras).
//
// One entry per hitting drill. Most attacking drills have phases, so the norm
// here is a `diagrams: [...]` sequence: Step 1 is the APPROACH footwork (dashed
// "move" arrows to the takeoff) plus the set; Step 2 is the SWING over the net
// ("serve" kind) into a "target" zone (line / cross / deep corner). Transition
// drills add a Step 3 pulling back off the net. Single-action standing swings
// use one `diagram`.
//
// `dk.approachPath` carries the heavy lifting for the footwork-to-net picture;
// two local helpers (target, swingStep) keep the swing-to-a-zone steps short.
// Follows the extras-data-3 template: net near the TOP for hitting (net:2),
// your side at the BOTTOM.
window.RR = window.RR || {};
RR.extras = RR.extras || {};

(function (RR) {
  "use strict";
  var dk = RR.dk;
  var E = RR.extras;

  // A target zone in the far court. spot: "line"|"cross"|"deepL"|"deepR"|
  // "shortL"|"shortR"|"middle". Far court spans y 0..2 (net at y:2).
  function tgt(spot, label) {
    var Z = {
      line:   { x: 0.4, y: 0.3, w: 2.4, h: 1.4 },   // straight down the left sideline
      cross:  { x: 5.6, y: 0.3, w: 2.8, h: 1.4 },   // deep cross-court angle
      deepL:  { x: 0.4, y: 0.2, w: 2.6, h: 1.2 },
      deepR:  { x: 6,   y: 0.2, w: 2.6, h: 1.2 },
      shortL: { x: 0.8, y: 1.2, w: 2.2, h: 0.9 },
      shortR: { x: 6,   y: 1.2, w: 2.2, h: 0.9 },
      middle: { x: 3.2, y: 0.3, w: 2.6, h: 1.4 }
    }[spot] || { x: 3.2, y: 0.3, w: 2.6, h: 1.4 };
    return { x: Z.x, y: Z.y, w: Z.w, h: Z.h, tone: "target", label: label || spot };
  }

  // A swing step: the hitter already at the takeoff swings over the net into a
  // target zone, optional blocker(s) on the other side. o: {takeX, to, label,
  // title, caption, zones, blockers:[x...], curve}
  function swingStep(o) {
    o = o || {};
    var takeX = o.takeX != null ? o.takeX : 4.5;
    var hitterId = o.hitterId || "swing-hitter";
    var players = [{ id: hitterId, x: takeX, y: 4, label: "H", team: "a",
      role: "hitter", note: "at the top" }];
    (o.blockers || []).forEach(function (bx, blockerIndex) {
      players.push({ id: (o.blockerPrefix || "swing-blocker") + "-" + (blockerIndex + 1),
        x: bx, y: 1.5, label: "B", team: "b", role: "blocker", note: "blocker" });
    });
    (o.extraPlayers || []).forEach(function (player) { players.push(player); });
    var spec = {
      title: o.title, caption: o.caption,
      w: 9, h: 9.4, net: 2,
      court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
      zones: o.zones || [tgt("cross", "target")],
      players: players,
      paths: [{ from: [takeX, 3.6], to: o.to || [6.8, 1], kind: "serve",
        label: o.label || "swing", curve: o.curve != null ? o.curve : 0.1,
        fromActor: hitterId,
        toEndpoint: { type: "target", label: "Attack target" } }]
        .concat(o.extraPaths || []),
      motionChains: o.motionChains || undefined,
      contacts: o.contacts || undefined,
      operation: o.operation || undefined,
      legend: [{ tone: "target", text: "Aim here" }]
    };
    if (o.blockers) spec.legend.push({ tone: "b", text: "Block" });
    return spec;
  }

  // ---- Footwork / mechanics, no ball over the net ---------------------------

  E["spike-approach-footwork"] = {
    diagram: {
      caption: "No ball: drill the approach rhythm. From a relaxed stance a small right-foot step, a big left step with the arms swinging back, then a quick plant right-left that turns run into jump. Arms swing up, hitting hand reaches high, land balanced on two feet.",
      w: 9, h: 9.4, net: 2,
      court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
      players: [{ x: 2, y: 8.4, label: "H", team: "a", note: "start" }],
      paths: [{
        from: [2, 8], via: [[2.4, 6.4], [3, 4.8]], to: [3.4, 3.8],
        kind: "move", label: "R small → L big / arms back → R-L plant & jump",
        curve: 0, playerIndex: 0
      }],
      legend: [{ tone: "move", text: "Approach footwork" }]
    }
  };

  E["approach-steps-walkthrough"] = {
    diagram: {
      caption: "Young players WALK the approach slowly — no ball, no jump. A few steps off the net, right-handers go 'left, right-left', counting the rhythm out loud. Add the arm swing (back on the big step, then up and forward), then speed it up from a walk to a jog to a small hop.",
      w: 9, h: 9.4, net: 2,
      court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
      players: [{ x: 3, y: 8.4, label: "H", team: "a", note: "walk it" }],
      paths: [{
        from: [3, 8], via: [[3.4, 6.4], [4, 4.6]], to: [4.3, 3.8],
        kind: "move", label: "left → right-left → small hop",
        curve: 0, playerIndex: 0
      }],
      legend: [{ tone: "move", text: "Slow walk-through" }]
    }
  };

  E["high-contact-arm-swing"] = {
    diagram: {
      caption: "No approach: groove a clean, high arm swing against a wall. Hitting elbow high and back like a bow-and-arrow, swing fast to a high point in front of the hitting shoulder. Add a ball — throw it down so it rebounds off the wall, snapping the wrist over the top — catch it and repeat.",
      w: 9, h: 8,
      zones: [{ x: 0, y: 0.2, w: 9, h: 1, tone: "neutral", label: "WALL" }],
      players: dk.spread(3, 1.8, 7.2).map(function (x) { return { x: x, y: 5.6, label: "H", team: "a" }; }),
      paths: [
        { from: [4.5, 5.2], to: [4.5, 1.4], kind: "serve", label: "snap down off wall", curve: 0.1 },
        { from: [5, 1.5], to: [5, 5.2], kind: "ball", label: "rebound", curve: 0.12 }
      ],
      legend: [{ tone: "neutral", text: "Wall" }, { tone: "a", text: "Hitters" }]
    }
  };

  E["overhand-throw-progression"] = {
    diagrams: dk.seq(
      { title: "Overhand throw over the net", caption: "Partners across a lowered net, each with a ball. Throw overhand hard — lead with a high elbow, finish with the hand down — for distance, then at a target. This grooves the exact spike/serve arm motion before any jump.", w: 9, h: 9, net: 4.4,
        court: [{ x: 0, y: 0, w: 9, h: 9 }],
        players: [{ x: 3.4, y: 1.6, label: "P", team: "b", note: "partner" }, { x: 3.4, y: 7.2, label: "T", team: "a", note: "thrower" }],
        paths: [{ from: [3.4, 6.8], to: [3.4, 2], kind: "serve", label: "overhand throw", curve: 0.12 }],
        legend: [{ tone: "a", text: "Thrower" }, { tone: "b", text: "Partner" }] },
      { title: "Throw down → hit a self-toss", caption: "Progress to throwing the ball DOWN over the net like a spike, then to hitting a self-toss — same high-elbow, fast-arm, wrist-snap motion, now finishing over the top.", w: 9, h: 9, net: 4.4,
        court: [{ x: 0, y: 0, w: 9, h: 9 }],
        zones: [tgt("middle", "land it in")],
        players: [{ x: 4.5, y: 6.8, label: "H", team: "a", note: "self-toss" }],
        paths: [{ from: [4.5, 6.6], to: [4.5, 5.4], kind: "ball", label: "toss up", curve: 0.2 }, { from: [4.5, 5.4], to: [4.7, 1.4], kind: "serve", label: "hit down", curve: 0.1 }],
        legend: [{ tone: "target", text: "Aim here" }] }
    )
  };

  // ---- Standing / self-toss swings (single picture) -------------------------

  E["self-toss-spike"] = {
    diagram: {
      caption: "Each hitter has a ball at the net. Toss it up a little in front of the hitting shoulder, take a quick approach, jump and swing over the top to snap it over. A whole group works at once — aim for a spot, then go get your ball.",
      w: 9, h: 9.4, net: 2,
      court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
      zones: [tgt("middle", "aim")],
      players: dk.spread(3, 2, 7).map(function (x) { return { x: x, y: 5.2, label: "H", team: "a" }; }),
      paths: [
        { from: [4.5, 5], to: [4.5, 3.8], kind: "ball", label: "self-toss", curve: 0.2 },
        { from: [4.5, 3.8], to: [4.7, 1.2], kind: "serve", label: "spike", curve: 0.1 }
      ],
      legend: [{ tone: "target", text: "Aim here" }, { tone: "a", text: "Hitters (one ball each)" }]
    }
  };

  E["standing-spike-target"] = {
    diagram: {
      caption: "Young hitters take STANDING swings off a coach's toss at a lowered net, snapping the ball down at cone/hoop targets on the court. Builds the high arm swing and placement before adding the approach and jump. Keep a friendly score of targets hit.",
      w: 9, h: 9.4, net: 2,
      court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
      zones: [tgt("shortL", "target"), tgt("deepR", "target")],
      players: [{ x: 6, y: 4, label: "C", team: "coach", note: "tosses" }, { x: 4.5, y: 5, label: "H", team: "a", note: "standing swing" }],
      cones: [{ x: 1.9, y: 1.6 }, { x: 7.2, y: 0.8 }],
      paths: [
        { from: [5.8, 4.2], to: [4.7, 4.8], kind: "ball", label: "toss", curve: 0.2 },
        { from: [4.5, 4.8], to: [7.2, 1.2], kind: "serve", label: "snap at target", curve: 0.1 }
      ],
      legend: [{ tone: "target", text: "Cone targets" }, { tone: "coach", text: "Coach" }]
    }
  };

  E["toss-and-tip"] = {
    diagram: {
      caption: "Young players learn the TIP — a soft, controlled fingertip shot over the net. The coach tosses a high ball at the lowered net; the player reaches up and tips it over with stiff fingertips to an open spot (short over the net, then deep corners). Firm fingers direct the ball, don't push it.",
      w: 9, h: 9.4, net: 2,
      court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
      zones: [tgt("shortL", "short tip"), tgt("deepR", "deep tip")],
      players: [{ x: 5.6, y: 4, label: "C", team: "coach", note: "tosses" }, { x: 4.5, y: 4.8, label: "H", team: "a", note: "tips it" }],
      paths: [
        { from: [5.4, 4.2], to: [4.7, 4.6], kind: "ball", label: "toss", curve: 0.2 },
        { from: [4.5, 4.4], to: [2, 1.6], kind: "serve", label: "tip over", curve: 0.15 }
      ],
      legend: [{ tone: "target", text: "Open spots" }, { tone: "coach", text: "Coach" }]
    }
  };

  // ---- First jumping attack -------------------------------------------------

  E["first-jump-and-hit"] = {
    diagrams: dk.seq(
      { title: "Two-step approach", caption: "A coach tosses a high, hittable ball near the lowered net. The young hitter takes a small two-step approach to a balanced two-foot jump — the bridge from a standing swing to a real spike.", w: 9, h: 9.4, net: 2,
        court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
        players: [{ x: 6, y: 3.4, label: "C", team: "coach", note: "high toss" }, { x: 3.6, y: 7, label: "H", team: "a", note: "start" }],
        paths: [
          { from: [3.6, 6.6], via: [[4.1, 5]], to: [4.4, 3.9], kind: "move", label: "two-step → two-foot jump", curve: 0.08, playerIndex: 1 },
          { from: [6, 3.6], to: [4.6, 3.7], kind: "ball", label: "toss", curve: 0.2 }
        ],
        legend: [{ tone: "coach", text: "Coach" }, { tone: "move", text: "Approach" }] },
      swingStep({ title: "Swing it over", takeX: 4.5, to: [4.7, 1.2], label: "hit & snap over", zones: [tgt("middle", "open court")], caption: "Swing in the air, hitting the ball high and snapping it over the net into the open court, then land softly on two feet and reset." })
    )
  };

  // ---- Hitting lines / live-set core drills ---------------------------------

  E["hitting-lines"] = {
    diagrams: dk.seq(
      dk.approachPath({ side: "outside", setter: true, queue: 1, title: "Approach off the feed", caption: "The front hitter leaves the outside line and approaches the setter's hittable ball; the next hitter waits behind the start." }),
      swingStep({ title: "Swing & shag", takeX: 2.4, to: [6.8, 1], label: "swing at a target", zones: [tgt("cross", "target")],
        extraPlayers: [
          { x: 5.4, y: 3, label: "St", team: "a", note: "setter / feeder" },
          { x: 1.55, y: 8.45, label: "Q", team: "n", note: "next hitter" }
        ],
        extraPaths: [{ from: [2.6, 3.8], to: [1.55, 8.1], via: [[7.4, 2.4], [8, 6.8]], kind: "move", label: "shag → back of line", playerIndex: 0 }],
        caption: "The front hitter swings at the target, shags that ball, and returns to the back of the outside line while the next hitter steps in." })
    )
  };

  E["hitting-off-a-live-set"] = {
    diagrams: dk.seq(
      { title: "Pass to the setter", caption: "The whole play, live. A ball is sent to the setter (a pass or coach toss) while hitters wait in a line off the outside.", w: 9, h: 9.4, net: 2,
        court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
        players: [{ x: 5.4, y: 3, label: "St", team: "a", note: "setter" }, { x: 3, y: 7.6, label: "P", team: "a", note: "passer" }, { x: 1.6, y: 8.4, label: "H", team: "a", note: "hitter waits" }],
        paths: [{ from: [3, 7.4], to: [5.2, 3.3], kind: "ball", label: "pass", curve: 0.2 }],
        legend: [{ tone: "a", text: "Your side" }] },
      dk.approachPath({ side: "outside", setter: true, swing: true, title: "Set, approach & hit", caption: "The setter sets a front or back ball to the called hitter, who times the approach to that set and hits it into the court at game speed. Watch how well setter and hitters connect, then rotate." })
    )
  };

  E["pass-set-hit-triangle"] = {
    diagrams: dk.seq(
      { title: "Coach starts the free ball", caption: "All four athletes are already in their jobs when the coach tosses a free ball over the net to the back-court receiver: the net target holds, the left-side line waits, and the far-court shagger tracks the rep.", w: 9, h: 11, net: 2,
        court: [{ x: 0, y: 0, w: 9, h: 11 }],
        players: [
          { id: "psh-coach", x: 4.5, y: 0.9, label: "C", team: "coach",
            role: "free-ball coach", facing: "south", note: "starts each rep" },
          { id: "psh-setter", x: 5.4, y: 3.2, label: "St", team: "a",
            role: "setter", facing: "northwest", note: "setter target" },
          { id: "psh-passer", x: 3, y: 8.4, label: "P", team: "a",
            role: "back-court passer", facing: "north", note: "first contact" },
          { id: "psh-hitter", x: 1.6, y: 9.4, label: "H", team: "a",
            role: "outside hitter", facing: "north", note: "waits wide for approach" },
          { id: "psh-shagger", x: 7.5, y: 1.4, label: "Sh", team: "b",
            role: "shagger and next passer", facing: "south", note: "tracks the attack" }
        ],
        paths: [
          { from: [4.5, 1.4], to: [3.2, 8], kind: "serve",
            label: "1 · coach free ball to passer", curve: 0.1,
            fromActor: "psh-coach", toActor: "psh-passer" },
          { from: [3, 8], to: [5.2, 3.5], kind: "ball",
            label: "2 · passer to setter target", curve: 0.2,
            fromActor: "psh-passer", toActor: "psh-setter" },
          { from: [5.4, 3.2], to: [2.6, 3.8], kind: "ball",
            label: "3 · setter delivers high outside", curve: 0.25,
            fromActor: "psh-setter", toActor: "psh-hitter" }
        ],
        contacts: [
          { order: 1, actor: "psh-coach", action: "free-ball toss", pathIndex: 0 },
          { order: 2, actor: "psh-passer", action: "forearm pass", pathIndex: 1 },
          { order: 3, actor: "psh-setter", action: "outside set", pathIndex: 2 }
        ],
        legend: [{ tone: "coach", text: "Coach starts one ball" }, { tone: "a", text: "Passer · setter · hitter" }, { tone: "b", text: "Shagger" }]
      },
      {
        title: "Complete rep, then rotate every job",
        caption: "The passer passes to the setter, the setter sets the outside, and the hitter approaches and attacks. Run a set number of clean pass-set-hit reps, then switch sides. After contact, the hitter shags, the passer joins the hitter line, and the shagger becomes the next passer while the setter holds the target.",
        w: 9, h: 11, net: 2,
        court: [{ x: 0, y: 0, w: 9, h: 11 }],
        zones: [{ x: 5.7, y: 0.35, w: 2.6, h: 1.25, tone: "target", label: "ATTACK TARGET" }],
        players: [
          { id: "psh-coach", x: 4.5, y: 0.9, label: "C", team: "coach",
            role: "free-ball coach", facing: "south", note: "starts next rep" },
          { id: "psh-setter", x: 5.4, y: 3.2, label: "St", team: "a",
            role: "setter", facing: "northwest", note: "holds setter target" },
          { id: "psh-passer", x: 3, y: 8.4, label: "P", team: "a",
            role: "back-court passer", facing: "north", note: "passes, then joins hitters" },
          { id: "psh-hitter", x: 2.4, y: 4, label: "H", team: "a",
            role: "outside hitter", facing: "north", note: "approaches and attacks" },
          { id: "psh-shagger", x: 7.5, y: 1.4, label: "Sh", team: "b",
            role: "shagger and next passer", facing: "south", note: "shags, then enters passing" }
        ],
        paths: [
          { from: [4.5, 1.4], to: [3.2, 8], kind: "serve",
            label: "1 · free ball", curve: 0.1,
            fromActor: "psh-coach", toActor: "psh-passer" },
          { from: [3, 8], to: [5.2, 3.5], kind: "ball",
            label: "2 · controlled pass", curve: 0.2,
            fromActor: "psh-passer", toActor: "psh-setter" },
          { from: [5.4, 3.2], to: [2.6, 3.8], kind: "ball",
            label: "3 · high outside set", curve: 0.25,
            fromActor: "psh-setter", toActor: "psh-hitter" },
          { from: [2.4, 3.6], to: [6.8, 1], kind: "serve",
            label: "4 · outside attack", curve: 0.1,
            fromActor: "psh-hitter", toActor: "psh-shagger" },
          { from: [2.4, 4], to: [7.5, 1.6], kind: "move",
            label: "hitter → shag", curve: 0.25, playerIndex: 3, actor: "psh-hitter", simultaneousGroup: "post-rep-job-change" },
          { from: [3, 8.4], to: [1.6, 9.4], kind: "move",
            label: "passer → hitter line", curve: 0.15, playerIndex: 2, actor: "psh-passer", simultaneousGroup: "post-rep-job-change" },
          { from: [7.5, 1.4], to: [3, 8.4], kind: "move",
            label: "shagger → pass", curve: -0.25, playerIndex: 4, actor: "psh-shagger", simultaneousGroup: "post-rep-job-change" }
        ],
        motionChains: [[0, 1, 2, 3]],
        contacts: [
          { order: 1, actor: "psh-coach", action: "free-ball toss", pathIndex: 0 },
          { order: 2, actor: "psh-passer", action: "forearm pass", pathIndex: 1 },
          { order: 3, actor: "psh-setter", action: "outside set", pathIndex: 2 },
          { order: 4, actor: "psh-hitter", action: "attack", pathIndex: 3 }
        ],
        legend: [{ tone: "coach", text: "Free-ball source" }, { tone: "a", text: "Pass → set → hit" }, { tone: "move", text: "Rotate after contact" }]
      }
    )
  };

  // ---- Position-specific attacks --------------------------------------------

  E["outside-hitter-high-ball"] = {
    diagrams: dk.seq(
      dk.approachPath({ side: "outside", setter: true, title: "Wide start, angled approach", caption: "Outside hitters rep the go-to high outside set. The setter delivers a high ball to the left-side antenna; the hitter starts WIDE and approaches at an angle into the takeoff." }),
      swingStep({ title: "High & in front, vs. block", takeX: 2.4, to: [6.8, 1], label: "hit line or cross", blockers: [2.6], zones: [tgt("line", "line"), tgt("cross", "cross")], caption: "Hit the ball high and in front. Call line and cross-court targets so both shots get worked; add one blocker so the hitter learns to hit high and use the block." })
    )
  };

  E["middle-quick-attack"] = {
    diagrams: dk.seq(
      { title: "Fast approach, in the air early", caption: "Middle blockers time the quick set. Starting at the net, the middle takes a short, fast approach and is already rising as the setter releases the low, fast ball right in front of them.", w: 9, h: 9.4, net: 2,
        court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
        players: [
          { id: "middle-quick-setter", x: 5.2, y: 3, label: "St", team: "a",
            role: "setter", note: "setter" },
          { id: "middle-quick-hitter", x: 4, y: 5.4, label: "M", team: "a",
            role: "middle hitter", note: "middle" }
        ],
        paths: [
          { from: [4, 5], to: [4.3, 4], kind: "move", label: "short fast approach",
            curve: 0, playerIndex: 1, actor: "middle-quick-hitter",
            simultaneousGroup: "middle-rises-on-release", sequenceOrder: 0 },
          { from: [5.2, 3.2], to: [4.4, 3.6], kind: "ball", label: "low quick set",
            curve: 0.12, fromActor: "middle-quick-setter", toActor: "middle-quick-hitter",
            simultaneousGroup: "middle-rises-on-release", sequenceOrder: 0.01 }
        ],
        contacts: [
          { order: 1, actor: "middle-quick-setter", toActor: "middle-quick-hitter",
            action: "quick set", pathIndex: 1 }
        ],
        legend: [{ tone: "a", text: "Setter + middle" }] },
      swingStep({
        title: "Pass, quick set & hit", takeX: 4.4, to: [4.6, 1], label: "fast swing down",
        hitterId: "middle-quick-hitter",
        zones: [tgt("middle", "seam")],
        extraPlayers: [
          { id: "middle-quick-setter", x: 5.2, y: 3, label: "St", team: "a",
            role: "setter", note: "setter" },
          { id: "middle-quick-passer", x: 7, y: 7.4, label: "P", team: "a",
            role: "passer", note: "steady passer" }
        ],
        extraPaths: [
          { from: [7, 7.4], to: [5.2, 3.2], kind: "ball", label: "steady pass",
            curve: 0.2, fromActor: "middle-quick-passer", toActor: "middle-quick-setter" },
          { from: [5.2, 3.2], to: [4.4, 3.6], kind: "ball", label: "quick set",
            curve: 0.12, fromActor: "middle-quick-setter", toActor: "middle-quick-hitter" }
        ],
        motionChains: [[1, 2, 0]],
        contacts: [
          { order: 1, actor: "middle-quick-passer", toActor: "middle-quick-setter",
            action: "forearm pass", pathIndex: 1 },
          { order: 2, actor: "middle-quick-setter", toActor: "middle-quick-hitter",
            action: "quick set", pathIndex: 2 },
          { order: 3, actor: "middle-quick-hitter", action: "quick attack", pathIndex: 0 }
        ],
        caption: "A steady passer feeds the setter, the setter delivers the low quick, and the middle hits at full reach with a fast swing down. Then vary the pass so the middle adjusts."
      })
    )
  };

  E["slide-approach-attack"] = {
    diagrams: dk.seq(
      { title: "Run the slide behind the setter", caption: "The middle (or right-side) starts near the setter and runs a CURVED path along the net behind them, taking off from one foot like a basketball layup while moving down the net.", w: 9, h: 9.4, net: 2,
        court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
        players: [
          { id: "slide-setter", x: 5.2, y: 3, label: "St", team: "a", role: "setter", note: "setter" },
          { id: "slide-hitter", x: 4, y: 5.6, label: "M", team: "a", role: "slide hitter", note: "start" }
        ],
        paths: [
          { from: [4, 5.4], via: [[6, 4.4]], to: [6.8, 3.8], kind: "move", label: "curve behind St → one-foot takeoff", curve: -0.3, playerIndex: 1, actor: "slide-hitter" },
          { from: [5.2, 3.2], to: [6.8, 3.6], kind: "ball", label: "back set", curve: -0.2,
            fromActor: "slide-setter", toActor: "slide-hitter" }
        ],
        legend: [{ tone: "a", text: "Setter + slide hitter" }] },
      swingStep({ title: "Hit at the top of the slide", takeX: 6.8, to: [3, 1], label: "swing across body", zones: [tgt("cross", "angle")], curve: -0.1, caption: "Hit the back-set ball at the top of the slide, swinging across the body. Run it off a steady back set first, then change up the takeoff spot." })
    )
  };

  E["right-side-opposite-attack"] = {
    diagrams: dk.seq(
      dk.approachPath({ side: "right", setter: true, title: "Wide on the right, back set", caption: "The opposite starts WIDE on the right side as the setter back-sets to the right antenna. Approach to the right pin." }),
      swingStep({ title: "Swing across to cross", takeX: 6.6, to: [2.4, 1], label: "line or cross", blockers: [6.6], zones: [tgt("line", "line"), tgt("cross", "cross")], curve: -0.1, caption: "Hit the ball high and in front, line or cross, swinging across the body from the right side. Add a block so the opposite learns to hit high and use the angle." })
    )
  };

  E["back-row-attack-pipe"] = {
    diagrams: dk.seq(
      { title: "Start behind the 3m line", caption: "Back-row hitters attack the pipe (middle back). The hitter starts BEHIND the attack line; on the set to the pipe they approach and jump from behind the line.", w: 9, h: 10.4, net: 2, lines: [{ y: 5.6 }],
        court: [{ x: 0, y: 0, w: 9, h: 10.4 }],
        players: [
          { id: "pipe-setter", x: 5.2, y: 3, label: "St", team: "a", role: "setter", note: "setter" },
          { id: "pipe-hitter", x: 4.5, y: 8.6, label: "H", team: "a", role: "back-row hitter", note: "back row" }
        ],
        paths: [
          { from: [4.5, 8.2], via: [[4.5, 6.2]], to: [4.5, 5.8], kind: "move", label: "approach → jump behind line", curve: 0, playerIndex: 1, actor: "pipe-hitter",
            simultaneousGroup: "pipe-set-and-approach", sequenceOrder: 0 },
          { from: [5.2, 3.2], to: [4.6, 5.4], kind: "ball", label: "pipe set", curve: 0.15,
            fromActor: "pipe-setter", toActor: "pipe-hitter",
            simultaneousGroup: "pipe-set-and-approach", sequenceOrder: 0.01 }
        ],
        contacts: [
          { order: 1, actor: "pipe-setter", toActor: "pipe-hitter",
            action: "pipe set", pathIndex: 1 }
        ],
        legend: [{ tone: "a", text: "Setter + pipe hitter" }, { tone: "move", text: "Takeoff behind 3m line" }] },
      { title: "Hit at full reach", caption: "Hit the high back-row set at full reach, landing PAST the line legally. Keep working the takeoff point so they never step over the line on the jump.", w: 9, h: 10.4, net: 2, lines: [{ y: 5.6 }],
        court: [{ x: 0, y: 0, w: 9, h: 10.4 }],
        zones: [tgt("middle", "deep")],
        players: [
          { id: "pipe-setter", x: 5.2, y: 3, label: "St", team: "a",
            role: "setter", note: "high pipe set" },
          { id: "pipe-hitter", x: 4.5, y: 8.6, label: "H", team: "a",
            role: "back-row hitter", note: "starts behind line" }
        ],
        paths: [
          { from: [4.5, 8.2], via: [[4.5, 6.4]], to: [4.5, 5.8], kind: "move",
            label: "approach and jump behind attack line", curve: 0,
            playerIndex: 1, actor: "pipe-hitter", motionId: "approach-jump",
            simultaneousGroup: "pipe-set-and-approach", sequenceOrder: 0 },
          { from: [5.2, 3.2], to: [4.6, 5.4], kind: "ball", label: "high pipe set", curve: 0.15,
            fromActor: "pipe-setter", toActor: "pipe-hitter",
            simultaneousGroup: "pipe-set-and-approach", sequenceOrder: 0.01 },
          { from: [4.5, 5.4], to: [4.7, 1.2], kind: "serve", label: "swing deep", curve: 0.1,
            fromActor: "pipe-hitter", toEndpoint: { type: "target", label: "Deep pipe target" } }
        ],
        motionChains: [[1, 2]],
        contacts: [
          { order: 1, actor: "pipe-setter", toActor: "pipe-hitter", action: "high pipe set", pathIndex: 1 },
          { order: 2, actor: "pipe-hitter", action: "attack", pathIndex: 2 }
        ],
        legend: [{ tone: "target", text: "Aim deep" }] }
    )
  };

  // ---- Off-speed shots ------------------------------------------------------

  E["tips-and-roll-shots"] = {
    diagrams: dk.seq(
      { title: "Set near the net", caption: "Hitters work soft shots over and around a block. Someone sets a ball near the net to the hitter, with a blocker up.", w: 9, h: 9.4, net: 2,
        court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
        players: [{ x: 5.2, y: 3, label: "St", team: "a", note: "setter" }, { x: 3.4, y: 4.6, label: "H", team: "a", note: "hitter" }, { x: 3.4, y: 1.5, label: "B", team: "b", note: "block" }],
        paths: [{ from: [5.2, 3.2], to: [3.6, 3.9], kind: "ball", label: "set", curve: 0.2 }],
        legend: [{ tone: "a", text: "Your side" }, { tone: "b", text: "Block" }] },
      swingStep({ title: "Tip short, roll deep", takeX: 3.4, to: [3.4, 1.5], label: "tip over block", blockers: [3.4], zones: [tgt("shortL", "tip"), tgt("deepR", "roll")], caption: "Instead of swinging hard, tip the ball over the block with stiff fingertips; on the next, roll it deep to a back corner with an open hand and wrist snap. Read where the court is open." })
    )
  };

  E["deep-corner-roll-shots"] = {
    diagrams: dk.seq(
      { title: "Hittable ball at the net", caption: "Hitters groove the roll shot — an open-hand topspin ball that arcs over the block and drops in the deep corners. A coach or setter delivers a hittable ball.", w: 9, h: 9.4, net: 2,
        court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
        players: [{ x: 5.2, y: 3, label: "St", team: "a", note: "feeds" }, { x: 3.4, y: 4.8, label: "H", team: "a", note: "hitter" }],
        paths: [{ from: [5.2, 3.2], to: [3.6, 4], kind: "ball", label: "set", curve: 0.2 }],
        legend: [{ tone: "a", text: "Your side" }] },
      swingStep({ title: "Arc it to the deep corners", takeX: 3.4, to: [7.6, 1], label: "roll deep", blockers: [3.4], zones: [tgt("deepL", "corner"), tgt("deepR", "corner")], curve: 0.2, caption: "Roll the ball with an open hand and wrist snap, arcing it over an imaginary or real block into the deep corners. Switch corners and mix in a hard swing so the roll is hidden." })
    )
  };

  // ---- Reading the block / shot selection -----------------------------------

  E["hitting-shot-selection"] = {
    diagrams: dk.seq(
      dk.approachPath({ side: "outside", setter: true, title: "Set & read the block", caption: "Hitters read a LIVE block and pick the right shot. The setter delivers a hittable ball, the hitter approaches, and one or two blockers go up across the net." }),
      swingStep({ title: "Choose the open shot", takeX: 2.4, to: [6.8, 1], label: "swing / hands / cut / tip", blockers: [2.4, 3.4], zones: [tgt("line", "line"), tgt("cross", "cross"), tgt("shortR", "tip")], caption: "Read the block late: swing where the block isn't, use the block's hands, cut it sharp, or tip. A coach can take away one shot so the hitter must use what's open. Only count smart, well-chosen shots." })
    )
  };

  E["hitting-line-and-cross-targets"] = {
    diagrams: dk.seq(
      dk.approachPath({ side: "outside", setter: true, title: "Outside set, call the shot", caption: "Targets are placed down the line and in the deep cross-court angle. The setter delivers an outside set and a coach calls 'line' or 'cross' before the swing." }),
      swingStep({ title: "Hit the called target", takeX: 2.4, to: [6.8, 1], label: "line or cross", zones: [tgt("line", "line"), tgt("cross", "cross")], caption: "The hitter approaches and hits the CALLED target with a full swing. Track makes to each target and rotate hitters — owning both directions makes a hitter hard to defend." })
    )
  };

  E["hitting-off-a-bad-set"] = {
    diagrams: dk.seq(
      { title: "Imperfect set", caption: "Real sets are rarely perfect. A coach delivers imperfect sets — tight to the net, off the net, too low, too fast — and the hitter must adjust the approach and contact to handle each one.", w: 9, h: 9.4, net: 2,
        court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
        players: [{ x: 5.2, y: 3, label: "C", team: "coach", note: "bad sets" }, { x: 2.6, y: 6, label: "H", team: "a", note: "adjusts" }],
        paths: [
          { from: [2.6, 5.6], to: [2.9, 4.2], kind: "move", label: "adjust approach", curve: 0.1 },
          { from: [5.2, 3.2], to: [2.6, 3.4], kind: "ball", label: "off / tight / low set", curve: 0.2 }
        ],
        legend: [{ tone: "coach", text: "Coach (bad sets)" }, { tone: "a", text: "Hitter" }] },
      swingStep({ title: "Hard swing or smart shot", takeX: 2.6, to: [6.8, 1], label: "swing or roll", zones: [tgt("cross", "swing"), tgt("deepR", "safe roll")], caption: "On a hittable adjusted ball, take a good swing; on sets they can't really hit, pick a smart shot — a roll or a high, deep ball. Mix good and bad sets so hitters adjust on the fly." })
    )
  };

  // ---- Timing off the pass --------------------------------------------------

  E["approach-timing-off-the-pass"] = {
    diagrams: dk.seq(
      { title: "Start on the setter's release", caption: "The key timing lesson: start the approach off the PASS and the setter's release, not off the set. A passer passes to the setter; the hitter waits in the wings and begins moving as the ball reaches the setter's hands.", w: 9, h: 9.4, net: 2,
        court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
        players: [
          { id: "timing-setter", x: 5.2, y: 3, label: "St", team: "a", role: "setter", note: "setter" },
          { id: "timing-passer", x: 3, y: 7, label: "P", team: "a", role: "passer", note: "passer" },
          { id: "timing-hitter", x: 1.8, y: 7.4, label: "H", team: "a", role: "outside hitter", note: "waits" }
        ],
        paths: [
          { from: [3, 6.8], to: [5, 3.3], kind: "ball", label: "pass", curve: 0.2,
            fromActor: "timing-passer", toActor: "timing-setter" },
          { from: [1.8, 7], to: [2.2, 5.4], kind: "move", label: "start on release", curve: 0.1,
            playerIndex: 2, actor: "timing-hitter", motionId: "approach-jump", stepIndices: [1] }
        ],
        legend: [{ tone: "a", text: "Your side" }, { tone: "move", text: "Approach start" }] },
      (function () {
        var scene = dk.approachPath({ side: "outside", setter: true, swing: true,
          title: "Rise as the set arrives",
          caption: "A steady passer sends the ball to target as the hitter reads the setter's release. The hitter times the last steps so they are rising just as the set arrives; then the setter varies the pass and set slightly so the hitter adjusts." });
        scene.players.push({ id: "timing-live-passer", x: 3.8, y: 7.4, label: "P", team: "a",
          role: "live passer", note: "starts the timing rep" });
        scene.paths = [
          { from: [3.8, 7.1], to: [5.25, 3.35], kind: "ball", label: "steady pass to target", curve: 0.18,
            fromActor: "timing-live-passer", toActor: "approach-setter", sequenceOrder: 0,
            simultaneousGroup: "pass-and-approach-read" },
          Object.assign({}, scene.paths[0], { sequenceOrder: 0.01,
            simultaneousGroup: "pass-and-approach-read" }),
          Object.assign({}, scene.paths[1], { sequenceOrder: 1 }),
          Object.assign({}, scene.paths[2], { sequenceOrder: 2 })
        ];
        scene.motionChains = [[0, 2, 3]];
        scene.contacts = [
          { order: 1, actor: "timing-live-passer", toActor: "approach-setter", action: "forearm pass", pathIndex: 0 },
          { order: 2, actor: "approach-setter", toActor: "approach-hitter", action: "outside set", pathIndex: 2 },
          { order: 3, actor: "approach-hitter", action: "attack", pathIndex: 3 }
        ];
        return scene;
      })()
    )
  };

  // ---- All-positions / box --------------------------------------------------

  E["hitting-from-all-positions"] = {
    diagrams: dk.seq(
      dk.approachPath({ side: "outside", setter: true, swing: true, title: "1. Outside", caption: "Take swings from every spot in a row. First the setter sets the OUTSIDE: approach from outside-left, hit, and reset." }),
      dk.approachPath({ side: "middle", setter: true, swing: true, title: "2. Middle quick", caption: "Next a quick set to the MIDDLE: short, fast approach from the center, in the air early, hit down." }),
      dk.approachPath({ side: "right", setter: true, swing: true, title: "3. Right side", caption: "Then a back set to the RIGHT side: approach to the right pin and swing across the body." }),
      { title: "4. Back-row pipe", caption: "Finish with a high back-row pipe set. The hitter starts behind the attack line, approaches and jumps legally from behind it, attacks at full reach, then the group rotates through the complete outside-middle-right-pipe sequence.", w: 9, h: 10.4, net: 2, lines: [{ y: 5.6 }],
        court: [{ x: 0, y: 0, w: 9, h: 10.4 }],
        zones: [tgt("middle", "pipe target")],
        players: [
          { id: "all-positions-pipe-setter", x: 5.2, y: 3, label: "St", team: "a", role: "setter", note: "pipe set" },
          { id: "all-positions-pipe-hitter", x: 4.5, y: 8.6, label: "H", team: "a", role: "back-row hitter", note: "behind attack line" }
        ],
        paths: [
          { from: [4.5, 8.2], via: [[4.5, 6.4]], to: [4.5, 5.8], kind: "move", label: "pipe approach · jump behind line", curve: 0,
            playerIndex: 1, actor: "all-positions-pipe-hitter", motionId: "approach-jump",
            simultaneousGroup: "pipe-set-and-approach", sequenceOrder: 0 },
          { from: [5.2, 3.2], to: [4.6, 5.4], kind: "ball", label: "high back-row set", curve: 0.15,
            fromActor: "all-positions-pipe-setter", toActor: "all-positions-pipe-hitter",
            simultaneousGroup: "pipe-set-and-approach", sequenceOrder: 0.01 },
          { from: [4.5, 5.4], to: [4.7, 1.2], kind: "serve", label: "pipe attack", curve: 0.1,
            fromActor: "all-positions-pipe-hitter", toEndpoint: { type: "target", label: "Deep pipe target" } }
        ],
        motionChains: [[1, 2]],
        contacts: [
          { order: 1, actor: "all-positions-pipe-setter", toActor: "all-positions-pipe-hitter", action: "back-row set", pathIndex: 1 },
          { order: 2, actor: "all-positions-pipe-hitter", action: "pipe attack", pathIndex: 2 }
        ],
        legend: [{ tone: "move", text: "Legal back-row takeoff" }, { tone: "target", text: "Deep pipe target" }] }
    )
  };

  E["box-hitting-reps"] = {
    diagram: {
      caption: "A sturdy box just in front of the net at the outside spot takes the timing out so hitters groove a clean, full arm swing. Hitter stands on the box, arm cocked back; a feeder beside the box tosses up in front of the hitting shoulder; the hitter swings full speed and snaps the ball down at line/angle target cones. Alternate, then rotate.",
      w: 9, h: 9.4, net: 2,
      court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
      zones: [{ x: 2, y: 3.4, w: 1.2, h: 1, tone: "neutral", label: "BOX" }, tgt("line", "line"), tgt("cross", "angle")],
      players: [
        { id: "box-feeder", x: 4.4, y: 4, label: "F", team: "a", role: "feeder", note: "controlled toss" },
        { id: "box-hitter", x: 2.6, y: 3.9, label: "H", team: "a", role: "hitter", note: "on box" }
      ],
      cones: [{ x: 1.9, y: 1 }, { x: 7.6, y: 0.9 }],
      paths: [
        { from: [4.2, 4], to: [3, 3.9], kind: "ball", label: "toss", curve: 0.2,
          fromActor: "box-feeder", toActor: "box-hitter" },
        { from: [2.6, 3.6], to: [6.8, 1], kind: "serve", label: "full swing down", curve: 0.1,
          fromActor: "box-hitter",
          toEndpoint: { type: "target", label: "Line / angle target" } }
      ],
      motionChains: [[0, 1]],
      contacts: [
        { order: 1, actor: "box-feeder", action: "controlled toss", pathIndex: 0 },
        { order: 2, actor: "box-hitter", action: "elevated box hit", pathIndex: 1 }
      ],
      legend: [{ tone: "neutral", text: "Box" }, { tone: "target", text: "Target cones" }, { tone: "a", text: "Hitter + feeder" }]
    }
  };

  // ---- Transition (attack <-> defense), 3 steps -----------------------------

  E["transition-hitting-off-defense"] = {
    diagrams: dk.seq(
      { title: "Dig the entered ball", caption: "Hitters link defense to offense. The hitter starts in a defensive spot in the back court and digs a ball the coach enters over the net.", w: 9, h: 10.4, net: 2, lines: [{ y: 5.6 }],
        court: [{ x: 0, y: 0, w: 9, h: 10.4 }],
        players: [
          { id: "transition-coach", x: 4.5, y: 0.9, label: "C", team: "coach", role: "attacking coach", note: "enters ball" },
          { id: "transition-hitter", x: 3, y: 8.4, label: "H", team: "a", role: "hitter-defender", note: "defender" },
          { id: "transition-setter", x: 6, y: 6.2, label: "St", team: "a", role: "setter", note: "setter" },
          { id: "transition-shagger", x: 7.5, y: 1.4, label: "Sh", team: "a", role: "shagger", note: "shagger" },
          { id: "transition-queue", x: 1.6, y: 9.4, label: "Q", team: "a", role: "next hitter", note: "next hitter" }
        ],
        paths: [
          { from: [4.5, 1.4], to: [3.2, 8], kind: "serve", label: "attack", curve: 0.1,
            fromActor: "transition-coach", toActor: "transition-hitter" },
          { from: [3, 8], to: [5.8, 6.4], kind: "ball", label: "dig", curve: 0.2,
            fromActor: "transition-hitter", toActor: "transition-setter" }
        ],
        motionChains: [[0, 1]],
        contacts: [
          { order: 1, actor: "transition-coach", toActor: "transition-hitter", action: "attack", pathIndex: 0 },
          { order: 2, actor: "transition-hitter", toActor: "transition-setter", action: "dig", pathIndex: 1 }
        ],
        legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Your side" }] },
      { title: "Pull off the net", caption: "On the dig, the hitter pulls OFF the net out to the attack line to become a hitter, while the setter delivers a transition set.", w: 9, h: 10.4, net: 2, lines: [{ y: 5.6 }],
        court: [{ x: 0, y: 0, w: 9, h: 10.4 }],
        players: [
          { id: "transition-setter", x: 6, y: 5, label: "St", team: "a", role: "setter", note: "transition set" },
          { id: "transition-hitter", x: 3, y: 8, label: "H", team: "a", role: "hitter", note: "pulls off" },
          { id: "transition-shagger", x: 7.5, y: 1.4, label: "Sh", team: "a", role: "shagger", note: "shagger" },
          { id: "transition-queue", x: 1.6, y: 9.4, label: "Q", team: "a", role: "next hitter", note: "next hitter" }
        ],
        paths: [
          { from: [3, 7.8], to: [2.6, 6], kind: "move", label: "pull off to the line", curve: 0.1,
            playerIndex: 1, actor: "transition-hitter" },
          { from: [6, 5.2], to: [2.6, 5.4], kind: "ball", label: "transition set", curve: 0.25,
            fromActor: "transition-setter", toActor: "transition-hitter" }
        ],
        legend: [{ tone: "move", text: "Off the net" }, { tone: "a", text: "Your side" }] },
      swingStep({
        title: "Approach & attack", takeX: 2.4, to: [6.8, 1], label: "transition swing",
        hitterId: "transition-hitter",
        zones: [tgt("cross", "target")],
        extraPlayers: [
          { id: "transition-setter", x: 6, y: 5, label: "St", team: "a", role: "setter", note: "transition setter" },
          { id: "transition-shagger", x: 7.5, y: 1.4, label: "Sh", team: "a", role: "shagger", note: "shagger" },
          { id: "transition-queue", x: 1.6, y: 9.4, label: "Q", team: "a", role: "next hitter", note: "next hitter" }
        ],
        caption: "The setter delivers the transition set, the hitter approaches and attacks, the shagger retrieves, and the next hitter is ready so the defense-to-offense cycle keeps moving."
      })
    )
  };

  E["attack-and-transition-to-defense"] = {
    diagrams: dk.seq(
      dk.approachPath({ side: "outside", setter: true, swing: true, title: "Attack the set", caption: "After hitting, you must get right back to defense. The hitter approaches and attacks a set at the net." }),
      { title: "Pull back to your spot", caption: "Don't admire the swing — quickly pull back from the net to a balanced defensive spot in the court.", w: 9, h: 9.4, net: 2,
        court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
        zones: [tgt("cross", "attack target")],
        players: [
          { id: "attack-transition-setter", x: 5.4, y: 3, label: "St", team: "a", role: "setter", note: "sets the attack" },
          { id: "attack-transition-hitter", x: 2.4, y: 4, label: "H", team: "a", role: "hitter-defender", note: "attacks, then releases" }
        ],
        paths: [
          { from: [5.4, 3.2], to: [2.6, 3.7], kind: "ball", label: "outside set", curve: 0.2,
            fromActor: "attack-transition-setter", toActor: "attack-transition-hitter" },
          { from: [2.4, 3.6], to: [6.8, 1], kind: "serve", label: "attack", curve: 0.1,
            fromActor: "attack-transition-hitter", toEndpoint: { type: "target", label: "Attack target" } },
          { from: [2.4, 4.2], to: [3, 7.4], kind: "move", label: "backpedal from net to defensive base", curve: -0.2,
            playerIndex: 1, actor: "attack-transition-hitter", motionId: "backpedal", stepIndices: [0] }
        ],
        motionChains: [[0, 1]],
        contacts: [
          { order: 1, actor: "attack-transition-setter", toActor: "attack-transition-hitter", action: "outside set", pathIndex: 0 },
          { order: 2, actor: "attack-transition-hitter", action: "attack", pathIndex: 1 }
        ],
        legend: [{ tone: "target", text: "Finish the attack" }, { tone: "move", text: "Back to defense immediately" }] },
      { title: "Dig the next ball", caption: "A coach sends a ball at the player, now a defender, who digs it up. Do the attack-then-defend cycle several times — focus on a fast, balanced move from the net back to your spot.", w: 9, h: 9.4, net: 2,
        court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
        zones: [tgt("cross", "attack target"), { x: 3.55, y: 4.75, w: 1.8, h: 1.25, tone: "good", label: "DIG TARGET" }],
        players: [
          { id: "attack-transition-coach", x: 4.5, y: 0.9, label: "C", team: "coach",
            role: "attacking coach", note: "attacks" },
          { id: "attack-transition-setter", x: 5.4, y: 3, label: "St", team: "a",
            role: "setter", note: "starts each cycle" },
          { id: "attack-transition-hitter", x: 3, y: 7.4, label: "H", team: "a",
            role: "hitter-defender", note: "now defends" }
        ],
        paths: [
          { from: [5.4, 3.2], to: [2.6, 3.7], kind: "ball", label: "cycle · outside set", curve: 0.2,
            fromActor: "attack-transition-setter", toActor: "attack-transition-hitter", stepIndices: [2], sequenceOrder: 0 },
          { from: [2.6, 3.6], to: [6.8, 1], kind: "serve", label: "cycle · hitter attack", curve: 0.1,
            fromActor: "attack-transition-hitter", toEndpoint: { type: "target", label: "Attack target" }, stepIndices: [2], sequenceOrder: 1 },
          { from: [2.6, 4], to: [3, 7.4], kind: "move", label: "cycle · backpedal to defensive base", curve: -0.18,
            playerIndex: 2, actor: "attack-transition-hitter", motionId: "backpedal", stepIndices: [2, 3], sequenceOrder: 2 },
          { from: [4.5, 1.4], to: [3.2, 7], kind: "serve", label: "cycle · coach attack", curve: 0.1,
            fromActor: "attack-transition-coach", toActor: "attack-transition-hitter", stepIndices: [1, 2], sequenceOrder: 3 },
          { from: [3, 7], to: [4.4, 5.4], kind: "ball", label: "cycle · controlled dig", curve: 0.2,
            fromActor: "attack-transition-hitter",
            toEndpoint: { type: "target", label: "Playable dig target" }, stepIndices: [1, 2], sequenceOrder: 4 }
        ],
        motionChains: [[0, 1], [3, 4]],
        contacts: [
          { order: 1, actor: "attack-transition-setter", toActor: "attack-transition-hitter", action: "outside set", pathIndex: 0 },
          { order: 2, actor: "attack-transition-hitter", action: "attack", pathIndex: 1 },
          { order: 3, actor: "attack-transition-coach", toActor: "attack-transition-hitter", action: "attack", pathIndex: 3 },
          { order: 4, actor: "attack-transition-hitter", action: "dig", pathIndex: 4 }
        ],
        legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Defender" }] }
    )
  };

})(window.RR);
