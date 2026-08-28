// extras-data-3.js — PASSING drill diagrams (RR.extras).
//
// One entry per passing drill. Drills with several spatial parts use a
// `diagrams: [...]` sequence (each spec carries a `title`, shown as a step
// heading) so every stage is pictured; single-action reps use one diagram.
// Two local helpers (pair, serveRcv) cover the shapes passing repeats most.
//
// This is the template the other skill-category files follow. The marquee
// passing drills that used to live in extras-data-2.js are re-authored here,
// richer, so there is exactly one source of truth per drill.
window.RR = window.RR || {};
RR.extras = RR.extras || {};

(function (RR) {
  "use strict";
  var dk = RR.dk;
  var E = RR.extras;

  // A single partner rep: tosser feeds, passer bumps it back.
  function pair(o) {
    o = o || {};
    return {
      title: o.title, caption: o.caption, w: 6, h: 7.6,
      players: [
        { x: 3, y: 1.6, label: o.top || "F", team: "b", note: o.topNote || "tosser" },
        { x: 3, y: 6, label: o.bot || "P", team: "a", note: o.botNote || "passer" }
      ],
      paths: [
        { from: [3.4, 2], to: [3.4, 5.6], kind: "ball", label: o.down || "toss", curve: 0.28 },
        { from: [2.6, 5.6], to: [2.6, 2], kind: "ball", label: o.up || "pass", curve: 0.28 }
      ]
    };
  }

  // A serve-receive look: a server across the net, 1/2/3/5 passers, a setter
  // target near the right-front. Pass(es) flow to the target.
  function serveRcv(o) {
    o = o || {};
    var prefix = o.actorPrefix || "";
    function actorId(suffix) { return prefix ? prefix + "-" + suffix : undefined; }
    var n = o.passers || 3, px;
    if (n === 1) px = [[4.5, 8.8]];
    else if (n === 2) px = [[2.8, 8.8], [6.4, 8.8]];
    else if (n === 3) px = [[2, 8.8], [4.5, 9.2], [7, 8.8]];
    else px = [[1.7, 9.2], [4.5, 9.6], [7.3, 9.2], [3, 7.2], [6, 7.2]]; // five-player W
    var serverY = o.serverY != null ? o.serverY : 0.35;
    var players = [{ id: actorId("server"), x: 4.5, y: serverY,
      label: o.serverLabel || "S", team: "b", role: prefix ? "server" : undefined,
      note: o.serverNote || "server behind end line" }];
    for (var qi = 0; qi < (o.serverQueue || 0); qi++) {
      players.push({ id: actorId("server-queue-" + (qi + 1)), x: 2.9 + qi * 3.2, y: 0.35,
        label: "Q", team: "n", role: prefix ? "waiting server" : undefined,
        note: "server queue behind end line" });
    }
    var passerStartIndex = players.length;
    px.forEach(function (p, passerIndex) { players.push({
      id: actorId("passer-" + (passerIndex + 1)), x: p[0], y: p[1],
      label: prefix ? "P" + (passerIndex + 1) : "", team: "a",
      role: prefix ? "serve-receive passer " + (passerIndex + 1) : undefined
    }); });
    var setterId = actorId("setter");
    players.push({ id: setterId, x: 6.4, y: 6.4, label: "St", team: "a",
      role: prefix ? "setter target" : undefined, note: "setter target" });
    var primaryIndex = o.primaryPasserIndex != null
      ? Math.max(0, Math.min(px.length - 1, Math.floor(o.primaryPasserIndex)))
      : Math.floor(px.length / 2);
    var t = px[primaryIndex];
    var primaryId = actorId("passer-" + (primaryIndex + 1));
    var paths = [{ from: [4.5, serverY + 0.35], to: [t[0], t[1] - 0.4],
      kind: "serve", label: o.serveLabel || "serve",
      curve: o.serveCurve != null ? o.serveCurve : 0.15,
      fromActor: actorId("server"), toActor: primaryId, sequenceOrder: 0 }];
    var contacts = prefix ? [{ order: 1, actor: actorId("server"), toActor: primaryId,
      action: "serve", pathIndex: 0 }] : [];
    var ballChain = [0];
    if (o.pass !== false) {
      paths.push({ from: [t[0], t[1] - 0.4], to: [6.2, 6.6], kind: "ball",
        label: "pass", curve: 0.2, fromActor: primaryId, toActor: setterId,
        sequenceOrder: 1,
        simultaneousGroup: o.backupMoves ? prefix + "-receive-response" : undefined });
      ballChain.push(paths.length - 1);
      if (prefix) contacts.push({ order: contacts.length + 1, actor: primaryId,
        toActor: setterId, action: "forearm pass", pathIndex: paths.length - 1 });
    }
    if (o.backupMoves) px.forEach(function (p, passerIndex) {
      if (passerIndex === primaryIndex) return;
      var towardX = p[0] + (t[0] - p[0]) * 0.18;
      paths.push({ from: p.slice(), to: [towardX, p[1] - 0.22], kind: "move",
        label: "open and back up", curve: 0, playerIndex: passerStartIndex + passerIndex,
        actor: actorId("passer-" + (passerIndex + 1)), sequenceOrder: 1,
        simultaneousGroup: prefix + "-receive-response" });
    });
    if (o.quickAttack) {
      var hitterIndex = o.hitterIndex != null ? o.hitterIndex : Math.min(3, px.length - 1);
      var hitterId = actorId("passer-" + (hitterIndex + 1));
      var hitterPoint = px[hitterIndex];
      paths.push({ from: [6.4, 6.4], to: [hitterPoint[0], Math.max(6.5, hitterPoint[1] - 0.35)],
        kind: "ball", label: "quick set", curve: 0.18, fromActor: setterId,
        toActor: hitterId, sequenceOrder: 2 });
      ballChain.push(paths.length - 1);
      if (prefix) contacts.push({ order: contacts.length + 1, actor: setterId,
        toActor: hitterId, action: "quick set", pathIndex: paths.length - 1 });
      paths.push({ from: [hitterPoint[0], Math.max(6.3, hitterPoint[1] - 0.55)],
        to: [7.1, 2.1], kind: "serve", label: "quick attack", curve: 0.1,
        fromActor: hitterId, toEndpoint: { type: "target", label: "Open court" },
        sequenceOrder: 3 });
      ballChain.push(paths.length - 1);
      if (prefix) contacts.push({ order: contacts.length + 1, actor: hitterId,
        action: "quick attack", pathIndex: paths.length - 1 });
    }
    if (o.rotateFormation) px.forEach(function (p, passerIndex) {
      var next = px[(passerIndex + 1) % px.length];
      paths.push({ from: p.slice(), to: next.slice(), kind: "move",
        label: passerIndex === 0 ? "rotate receive jobs" : "", curve: 0.08,
        playerIndex: passerStartIndex + passerIndex,
        actor: actorId("passer-" + (passerIndex + 1)), sequenceOrder: 4,
        simultaneousGroup: prefix + "-receive-rotation" });
    });
    var spec = {
      title: o.title, caption: o.caption, w: 9, h: 12, net: 6,
      lines: [{ y: 3 }, { y: 9 }], court: [{ x: 0, y: 0.8, w: 9, h: 10.4 }],
      players: players, paths: paths,
      legend: [{ tone: "b", text: "Server" }, { tone: "a", text: "Passers + setter" }]
    };
    if (prefix) {
      spec.contacts = contacts;
      if (ballChain.length > 1) spec.motionChains = [ballChain];
    }
    if (o.backupMoves || o.rotateFormation) spec.operation = "parallel";
    if (o.zones) spec.zones = o.zones;
    return spec;
  }

  // ---- Partner / solo reps --------------------------------------------------

  E["partner-forearm-passing"] = {
    diagram: pair({ caption: "Partners ~15 ft apart: the tosser feeds the middle of the body, the passer bumps it back to the tosser's hands. Switch after 10. All pairs work at once." })
  };
  E["toss-and-pass-intro"] = {
    diagram: pair({ caption: "Stand a short step apart: an easy high toss to the body, a clean platform, bump it back to the tosser's hands.", down: "easy toss", up: "bump" })
  };
  E["partner-pass-and-set-continuous"] = {
    diagram: pair({ top: "A", bot: "B", topNote: "sets", botNote: "passes", down: "set", up: "pass", caption: "A steady loop: A passes to B, B sets it back, A passes again — pass, set, pass, set. Count clean ones in a row." })
  };
  E["self-pass-count"] = {
    diagram: {
      caption: "Solo: pass the ball straight up to yourself, stay under it, and count clean touches. A whole group spreads out and goes at once.",
      w: 9, h: 7,
      players: dk.spread(4, 1.6, 7.4).map(function (x) { return { x: x, y: 4.6, label: "", team: "a" }; }),
      paths: dk.spread(4, 1.6, 7.4).map(function (x) { return { from: [x, 4.2], to: [x, 1.6], kind: "ball", curve: 0 }; })
    }
  };

  // ---- Feed-to-target reps --------------------------------------------------

  E["passing-to-setter-target"] = {
    diagram: serveRcv({ passers: 1, serverLabel: "F", serverNote: "feeder", serveLabel: "feed", caption: "Feeder sends a ball across; the passer puts it on the setter target about a yard off the net. Reset and repeat, then rotate." })
  };
  E["pass-to-the-coach"] = {
    diagram: dk.feedLine({ feederLabel: "C", feederNote: "tosses", action: "pass to coach", targetLabel: "C", caption: "A line of young passers: the coach tosses each one a ball, they pass it back to the coach at the target spot, then jog to the back of the line." })
  };
  E["bump-over-net-to-targets"] = {
    diagram: {
      caption: "Near a lowered net: a partner tosses, the passer bumps it OVER to a deep target, then a short one, learning to control distance.",
      w: 9, h: 11, net: 5, lines: [{ y: 8 }],
      court: [{ x: 0, y: 0, w: 9, h: 11 }],
      zones: [{ x: 1, y: 1, w: 3, h: 1.8, tone: "target", label: "deep" }, { x: 5, y: 3, w: 3, h: 1.6, tone: "good", label: "short" }],
      players: [{ x: 6, y: 7.4, label: "F", team: "b", note: "tosser" }, { x: 4, y: 7.4, label: "P", team: "a", note: "passer" }],
      paths: [{ from: [5.6, 7.2], to: [4.3, 7], kind: "ball", label: "toss", curve: 0.2 }, { from: [4, 7], to: [2.4, 2], kind: "serve", label: "bump over", curve: 0.15 }],
      legend: [{ tone: "target", text: "Aim here" }]
    }
  };

  // ---- Movement / platform-angle reps --------------------------------------

  E["passing-on-the-move"] = {
    diagrams: dk.seq(
      { title: "Feed to the side", caption: "The feeder tosses a few steps to the passer's left or right — not right at them.", w: 7, h: 8,
        players: [{ x: 3.5, y: 1.6, label: "F", team: "b", note: "feeder" }, { x: 3.5, y: 6, label: "P", team: "a", note: "starts here" }],
        paths: [{ from: [3.5, 2], to: [5.6, 5.4], kind: "ball", label: "toss wide", curve: 0.15 }] },
      { title: "Shuffle & square up", caption: "The passer shuffles behind the ball, STOPS, squares to the feeder, and passes with still arms. Then switch sides.", w: 7, h: 8,
        players: [{ x: 3.5, y: 1.6, label: "F", team: "b" }, { x: 3.5, y: 6, label: "P", team: "a", note: "starts centered" }],
        paths: [{ from: [3.5, 6], to: [5.4, 6], kind: "move", label: "shuffle behind ball", curve: 0, playerIndex: 1 }, { from: [5.6, 5.6], to: [3.7, 2], kind: "ball", label: "pass", curve: 0.18 }] }
    )
  };
  E["platform-angle-passing"] = {
    diagram: {
      caption: "Feeds come from the left, middle, and right — the passer sets the arm ANGLE toward the one target before each ball arrives, so every pass goes the same place.",
      w: 9, h: 10, net: 1.6,
      court: [{ x: 0, y: 0, w: 9, h: 10 }],
      players: [
        { x: 4.5, y: 8.4, label: "P", team: "a", note: "passer" },
        { x: 1.6, y: 4, label: "F", team: "b" }, { x: 4.5, y: 3.4, label: "F", team: "b" }, { x: 7.4, y: 4, label: "F", team: "b" },
        { x: 7, y: 6.4, label: "T", team: "a", note: "target" }
      ],
      paths: [
        { from: [1.8, 4.3], to: [4.3, 8], kind: "ball", curve: 0.1 },
        { from: [4.5, 3.8], to: [4.5, 8], kind: "ball", curve: 0 },
        { from: [7.2, 4.3], to: [4.7, 8], kind: "ball", curve: -0.1 },
        { from: [4.5, 8], to: [6.8, 6.6], kind: "serve", label: "to target", curve: 0.2 }
      ],
      legend: [{ tone: "b", text: "Feeders (L/M/R)" }, { tone: "a", text: "Passer + target" }]
    }
  };
  E["deep-ball-backpedal-passing"] = {
    diagrams: dk.seq(
      serveRcv({ passers: 1, title: "Deep serve", serveLabel: "deep serve", serveCurve: 0.05, pass: false, caption: "A server sends a deep ball over the passer's starting spot near the attack line." }),
      { title: "Drop-step & backpedal", caption: "The passer opens the hips, drop-steps, and backpedals to get BEHIND the ball, then passes up to target while controlling the backward momentum.", w: 9, h: 12, net: 6, lines: [{ y: 3 }, { y: 9 }], court: [{ x: 0, y: 0, w: 9, h: 12 }],
        players: [{ x: 4.5, y: 7.6, label: "P", team: "a", note: "drops back" }, { x: 6.4, y: 6.4, label: "St", team: "a", note: "target" }],
        paths: [{ from: [4.5, 7.6], to: [4.5, 9.4], kind: "move", label: "backpedal", curve: 0 }, { from: [4.5, 9.2], to: [6.2, 6.6], kind: "ball", label: "pass up", curve: 0.2 }] }
    )
  };
  E["passing-box-drill"] = {
    diagram: {
      caption: "Four players at the corners of a box pass around it (and across the diagonal), each angling the platform to send the ball to the next corner. Reverse on a call.",
      w: 9, h: 9,
      players: [
        { x: 1.6, y: 1.6, label: "1", team: "a" }, { x: 7.4, y: 1.6, label: "2", team: "a" },
        { x: 7.4, y: 7.4, label: "3", team: "a" }, { x: 1.6, y: 7.4, label: "4", team: "a" }
      ],
      paths: [
        { from: [1.9, 1.6], to: [7.1, 1.6], kind: "ball", curve: 0.12 },
        { from: [7.4, 1.9], to: [7.4, 7.1], kind: "ball", curve: 0.12 },
        { from: [7.1, 7.4], to: [1.9, 7.4], kind: "ball", curve: 0.12 },
        { from: [1.6, 7.1], to: [1.6, 1.9], kind: "ball", curve: 0.12 }
      ]
    }
  };

  // ---- Serve-receive systems ------------------------------------------------

  E["serve-receive-intro-easy"] = {
    diagram: serveRcv({ passers: 1, serverY: 1.4, serverNote: "serves from inside the court", serveLabel: "easy serve", serveCurve: 0.05, caption: "Slow, loopy serves from a short distance: the passer reads it, gets behind it, and passes to the target near the net. Move the server back as it gets easy." })
  };
  E["two-person-serve-receive"] = {
    diagram: serveRcv({ passers: 2, actorPrefix: "two-receive", primaryPasserIndex: 0,
      backupMoves: true, serveLabel: "serve / seam",
      caption: "Two passers split the court. The server can aim the SEAM between them — both call early, the closer one takes it, the other backs up." })
  };
  E["three-person-serve-receive"] = {
    diagrams: dk.seq(
      serveRcv({ passers: 3, actorPrefix: "three-receive", title: "Formation & serve",
        pass: false, caption: "Three passers in a W across the back court, setter target at the net. The server serves into the formation." }),
      serveRcv({ passers: 3, actorPrefix: "three-receive", title: "Call & pass",
        backupMoves: true, serveLabel: "",
        caption: "Whoever the ball is closest to calls early and passes to the setter; the other two open toward the ball in case it's shanked their way." })
    )
  };
  E["w-formation-serve-receive"] = {
    diagrams: dk.seq(
      serveRcv({ passers: 5, actorPrefix: "w-receive", primaryPasserIndex: 1,
        title: "The W & the serve", pass: false,
        caption: "Five passers in a W with the setter releasing to right-front. Server serves anywhere into the formation." }),
      serveRcv({ passers: 5, actorPrefix: "w-receive", primaryPasserIndex: 1,
        hitterIndex: 3, backupMoves: true, quickAttack: true, rotateFormation: true,
        title: "Pass & attack", serveLabel: "",
        caption: "Whoever it's heading toward takes it, neighbors back up, ball goes to the setter target — then run a quick attack and rotate." })
    )
  };
  E["backcourt-communication-passing"] = {
    diagram: serveRcv({ passers: 3, actorPrefix: "backcourt-call", backupMoves: true,
      serveLabel: "serve to a seam",
      caption: "Three back-court passers: the server hits zones and seams. Demand a LOUD early call on every serve before the pass; the others open up and back up the play." })
  };
  E["libero-serve-receive-range"] = {
    diagram: {
      caption: "The libero starts middle-back and covers a wide area. The server aims the edges and seams; the libero calls, moves to get the body behind it, and passes to target. Grow the area over time.",
      w: 9, h: 12, net: 6, lines: [{ y: 3 }, { y: 9 }], court: [{ x: 0, y: 0.8, w: 9, h: 10.4 }],
      zones: [{ x: 1.6, y: 7.4, w: 5.8, h: 3.4, tone: "good", label: "libero range" }],
      players: [{ x: 4.5, y: 0.35, label: "S", team: "b", note: "server behind end line" }, { x: 4.5, y: 9, label: "L", team: "a", note: "libero" }, { x: 6.6, y: 6.4, label: "St", team: "a", note: "target" }],
      paths: [
        { from: [4.5, 0.7], to: [2.2, 8.4], kind: "serve", label: "serve to the edge", curve: 0.2 },
        { from: [4.5, 9], to: [2.2, 8.4], kind: "move", label: "libero gets behind it", curve: 0.15, playerIndex: 1 },
        { from: [2.2, 8.4], to: [6.4, 6.6], kind: "ball", label: "pass to target", curve: 0.2 }
      ],
      legend: [{ tone: "good", text: "Area to cover" }, { tone: "a", text: "Libero + target" }]
    }
  };
  E["overhead-emergency-pass"] = {
    diagram: serveRcv({ passers: 1, serveLabel: "high & tight", serveCurve: 0.08, caption: "High serves arriving near head height: the passer takes it OVERHEAD with firm, clean hands above the forehead and pushes it to target — quicker than dropping to the arms." })
  };
  E["mid-court-passing-decision"] = {
    diagram: serveRcv({ passers: 1, serverNote: "watch the toss & shoulders", serveLabel: "read it early", caption: "Reading the server: passers call 'deep/short/left/right' from the server's stance and toss BEFORE contact, then react and pass the real serve to target." })
  };
  E["serve-receive-vs-jump-serve"] = {
    diagram: serveRcv({ passers: 2, serverNote: "jump server", serveLabel: "hard jump serve", serveCurve: 0.05, caption: "Against a jump serve: passers start a step deeper and keep the arms quiet to take the speed off — a controlled, playable ball beats a perfect-but-rushed one." })
  };

  // ---- Multi-station / rotating passing -------------------------------------

  E["shuttle-passing-to-target"] = {
    diagrams: dk.seq(
      { title: "Pass to the target",
        caption: "Two short lines face each other with a target in the middle. The front player of Line A (player 1) passes the ball to the TARGET — a cone, hoop, or coach. It's an accuracy rep, so nobody catches it; the target just marks where a perfect pass would land.",
        w: 9, h: 8,
        players: [
          { x: 1.8, y: 3, label: "1", team: "a" }, { x: 1.8, y: 4, label: "2", team: "a" }, { x: 1.8, y: 5, label: "3", team: "a" },
          { x: 7.2, y: 3, label: "", team: "b" }, { x: 7.2, y: 4, label: "", team: "b" }, { x: 7.2, y: 5, label: "", team: "b" },
          { x: 4.5, y: 4, label: "T", team: "n", note: "cone / hoop / coach" }
        ],
        paths: [
          { from: [2.3, 3], to: [4.0, 3.9], kind: "ball", label: "pass", curve: 0.12 }
        ],
        legend: [{ tone: "a", text: "Line A" }, { tone: "b", text: "Line B" }, { tone: "n", text: "Target" }] },
      { title: "Follow your pass — to the BACK of the OTHER line",
        caption: "After passing, player 1 jogs to the BACK of the OTHER line (Line B). Now the front of Line B passes to the same target and follows ACROSS to Line A. The two lines keep feeding each other back and forth — constant motion, and the target never moves.",
        w: 9, h: 8,
        zones: [{ x: 6.6, y: 5.45, w: 1.2, h: 1.05, tone: "neutral", label: "BACK" }],
        players: [
          { x: 1.8, y: 3, label: "1", team: "a", note: "follows the pass" },
          { x: 1.8, y: 4, label: "2", team: "a" }, { x: 1.8, y: 5, label: "3", team: "a" },
          { x: 7.2, y: 3, label: "", team: "b" }, { x: 7.2, y: 4, label: "", team: "b" }, { x: 7.2, y: 5, label: "", team: "b" },
          { x: 4.5, y: 4, label: "T", team: "n", note: "cone / hoop / coach" }
        ],
        paths: [
          { from: [2.1, 3], to: [7.0, 6.0], kind: "move", label: "follow to back", curve: -0.5, playerIndex: 0 },
          { from: [6.9, 3], to: [5.0, 3.9], kind: "ball", label: "next pass", curve: -0.12 }
        ],
        legend: [{ tone: "a", text: "Line A" }, { tone: "b", text: "Line B" }, { tone: "n", text: "Target" }] }
    )
  };
  E["butterfly-passing"] = {
    diagrams: dk.seq(
      { title: "Serve → pass → target → return", caption: "Six athletes fill the six continuous jobs. The server serves to the passer; the passer passes to the setter target; the target catches or sets it; then the shagger retrieves that same ball and returns it down the sideline to the serving queue.", w: 9, h: 14, net: 6, lines: [{ y: 3 }, { y: 9 }], court: [{ x: 0, y: 0, w: 9, h: 12 }],
        players: [
          { id: "butterfly-server", x: 2.4, y: 12.45, label: "Sv", team: "a",
            role: "current server", facing: "north", note: "serves now behind end line" },
          { id: "butterfly-next-server", x: 2.4, y: 13.2, label: "Q", team: "n",
            role: "next server", facing: "north", note: "serving queue behind end line" },
          { id: "butterfly-passer", x: 4.5, y: 4.2, label: "P", team: "b",
            role: "current passer", facing: "south", note: "passes now" },
          { id: "butterfly-next-passer", x: 3.55, y: 3.55, label: "Q", team: "n",
            role: "next passer", facing: "south", note: "passing line" },
          { id: "butterfly-target", x: 7, y: 1.8, label: "T", team: "b",
            role: "setter target", facing: "southwest", note: "catches or sets the pass" },
          { id: "butterfly-shagger", x: 7.75, y: 3, label: "Sh", team: "n",
            role: "shagger", facing: "north", note: "retrieves and returns the ball" }
        ],
        paths: [
          { from: [2.4, 12.1], to: [4.3, 4.6], kind: "serve",
            label: "1 · server to passer", curve: 0.12,
            fromActor: "butterfly-server", toActor: "butterfly-passer" },
          { from: [4.5, 4.2], via: [[6.7, 2.1], [7, 1.8], [7.75, 3], [8.2, 6], [8.2, 10.5]],
            to: [3.1, 13.2], kind: "ball", curve: 0,
            label: "2 · pass to target · target controls · shagger returns to serving queue",
            fromActor: "butterfly-passer", toActor: "butterfly-next-server" }
        ],
        contacts: [
          { order: 1, actor: "butterfly-server", action: "serve", pathIndex: 0 },
          { order: 2, actor: "butterfly-passer", action: "forearm pass", pathIndex: 1 },
          { order: 3, actor: "butterfly-target", action: "catch or set", pathIndex: 1 },
          { order: 4, actor: "butterfly-shagger", action: "retrieve and return", pathIndex: 1 }
        ],
        legend: [{ tone: "a", text: "Serving jobs" }, { tone: "b", text: "Passer / target" }, { tone: "n", text: "Queues / shag" }] },
      { title: "All six follow to the next job", caption: "After the shared ball is controlled, every athlete advances exactly one job: server to passing queue, next passer into pass, passer to target, target to shag, shagger to serving queue, and next server onto the end line.", w: 9, h: 14, net: 6, lines: [{ y: 3 }, { y: 9 }], court: [{ x: 0, y: 0, w: 9, h: 12 }],
        players: [
          { id: "butterfly-server", x: 2.4, y: 12.45, label: "Sv", team: "a",
            role: "current server", facing: "north", note: "moves to passing queue" },
          { id: "butterfly-next-server", x: 2.4, y: 13.2, label: "Q", team: "n",
            role: "next server", facing: "north", note: "steps onto end line" },
          { id: "butterfly-passer", x: 4.5, y: 4.2, label: "P", team: "b",
            role: "current passer", facing: "south", note: "moves to target" },
          { id: "butterfly-next-passer", x: 3.55, y: 3.55, label: "Q", team: "n",
            role: "next passer", facing: "south", note: "steps into pass" },
          { id: "butterfly-target", x: 7, y: 1.8, label: "T", team: "b",
            role: "setter target", facing: "southwest", note: "moves to shag" },
          { id: "butterfly-shagger", x: 7.75, y: 3, label: "Sh", team: "n",
            role: "shagger", facing: "north", note: "returns to serving queue" }
        ],
        paths: [
          { from: [2.4, 12.45], to: [3.55, 4.35], kind: "move", label: "server → passing line", curve: 0.2, playerIndex: 0, actor: "butterfly-server", simultaneousGroup: "all-six-advance" },
          { from: [4.5, 4.2], to: [7, 2.1], kind: "move", label: "passer → target", curve: 0.2, playerIndex: 2, actor: "butterfly-passer", simultaneousGroup: "all-six-advance" },
          { from: [7, 1.8], to: [7.75, 3], kind: "move", label: "target → shag", curve: 0.12, playerIndex: 4, actor: "butterfly-target", simultaneousGroup: "all-six-advance" },
          { from: [7.75, 3], to: [3.1, 13.2], via: [[8.2, 6], [8.2, 10.5]], kind: "move", label: "shagger → serving line", curve: 0, playerIndex: 5, actor: "butterfly-shagger", simultaneousGroup: "all-six-advance" },
          { from: [2.4, 13.2], to: [2.4, 12.45], kind: "move", label: "queue → serve", curve: 0, playerIndex: 1, actor: "butterfly-next-server", simultaneousGroup: "all-six-advance" },
          { from: [3.55, 3.55], to: [4.5, 4.2], kind: "move", label: "queue → pass", curve: 0.1, playerIndex: 3, actor: "butterfly-next-passer", simultaneousGroup: "all-six-advance" }
        ],
        legend: [{ tone: "move", text: "Every athlete advances one job" }]
      }
    )
  };
  E["out-of-system-passing"] = {
    diagrams: dk.seq(
      { title: "Awkward ball → high pass", caption: "The coach hits a hard, awkward ball (deep, short, off the net). The passer just plays it HIGH to the middle of the court to buy the setter time.", w: 9, h: 11, net: 2, lines: [{ y: 5.2 }], court: [{ x: 0, y: 0, w: 9, h: 11 }],
        players: [{ x: 4.5, y: 0.9, label: "C", team: "coach", note: "hits it awkward" }, { x: 2.4, y: 8, label: "P", team: "a", note: "passer" }],
        paths: [{ from: [4.5, 1.4], to: [2.6, 7.6], kind: "serve", label: "tough ball", curve: 0.1 }, { from: [2.4, 7.6], to: [4.5, 6], kind: "ball", label: "high to middle", curve: -0.2 }],
        legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Passer" }] },
      { title: "Setter chases, hitter finishes", caption: "The setter runs it down and sets a high, hittable ball even from the bad pass; a hitter takes a safe, smart swing. Then rotate.", w: 9, h: 11, net: 2, lines: [{ y: 5.2 }], court: [{ x: 0, y: 0, w: 9, h: 11 }],
        balls: [{ x: 4.5, y: 6 }],
        players: [
          { x: 4.5, y: 0.9, label: "C", team: "coach", note: "starts the rep" },
          { x: 2.4, y: 8, label: "P", team: "a", note: "made the high pass" },
          { x: 6.4, y: 4.4, label: "St", team: "a", note: "chases" },
          { x: 2.2, y: 4.4, label: "H", team: "a", note: "hitter" }
        ],
        paths: [{ from: [4.7, 6], to: [6.2, 4.6], kind: "ball", label: "setter runs it down", curve: 0.2 }, { from: [6.4, 4.4], to: [2.6, 4.2], kind: "ball", label: "high set", curve: 0.25 }, { from: [2.2, 4], to: [4.4, 1.4], kind: "serve", label: "safe swing", curve: 0.1 }] }
    )
  };
  E["serve-and-pass-crossover"] = {
    diagrams: dk.seq(
      serveRcv({ passers: 3, serverQueue: 2, actorPrefix: "crossover",
        title: "Serve & receive", serverNote: "serves now", serveLabel: "real serve",
        zones: [{ x: 5.8, y: 5.6, w: 1.6, h: 1.4, tone: "target", label: "cone" }],
        caption: "The front server serves at three passers while two servers wait behind the end line; the pass goes to the setter target." }),
      { title: "Crossover rotation", caption: "After the group earns three good passes, players cross jobs: a passer jogs back to serve, a server steps in to pass — so everyone trains both connected skills.", w: 9, h: 12, net: 6, operation: "parallel", lines: [{ y: 3 }, { y: 9 }], court: [{ x: 0, y: 0.8, w: 9, h: 10.4 }],
        players: [
          { id: "crossover-server", x: 3.7, y: 0.35, label: "Sv", team: "b", role: "active server", note: "server line behind end line" },
          { id: "crossover-server-queue-1", x: 4.5, y: 0.35, label: "Q", team: "n", role: "waiting server", note: "next server behind end line" },
          { id: "crossover-server-queue-2", x: 5.3, y: 0.35, label: "Q", team: "n", role: "waiting server", note: "server queue behind end line" },
          { id: "crossover-passer-1", x: 2, y: 8.8, label: "P1", team: "a", role: "passer" },
          { id: "crossover-passer-2", x: 4.5, y: 9.2, label: "P2", team: "a", role: "passer" },
          { id: "crossover-passer-3", x: 7, y: 8.8, label: "P3", team: "a", role: "passer" },
          { id: "crossover-setter", x: 6.4, y: 6.4, label: "St", team: "a", role: "setter target", note: "setter target" }
        ],
        paths: [
          { from: [4.5, 8.6], to: [4.5, 0.55], kind: "move", label: "pass → serve",
            curve: 0.4, playerIndex: 4, actor: "crossover-passer-2",
            simultaneousGroup: "crossover-job-change" },
          { from: [3.7, 0.55], to: [4, 8.6], kind: "move", label: "serve → pass",
            curve: 0.4, playerIndex: 0, actor: "crossover-server",
            simultaneousGroup: "crossover-job-change" }
        ] }
    )
  };

})(window.RR);
