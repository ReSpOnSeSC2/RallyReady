// extras-build.js — diagram builders (RR.dk, "diagram kit").
//
// Most drills fall into a handful of court archetypes (serve at targets, two
// teams across the net, king/queen rotate-in, a passing circle, partner lines,
// station rotations, a coach feeding defenders). Hand-laying every coordinate
// per drill would be huge and error-prone, so these builders take a few params
// and return a complete RR.diagram spec. The per-drill data files (extras-data*)
// then read like a table, not a pile of geometry.
//
// Convention: your/near side at the BOTTOM (large y), opponent/far side at the
// TOP. Net sits across the middle. Builders only return data — no DOM, no SVG.
window.RR = window.RR || {};

RR.dk = (function () {
  "use strict";

  var TEAM_LEGEND = [
    { tone: "a", text: "Your side" },
    { tone: "b", text: "Other side" }
  ];

  // Evenly space n items across [x0, x1] and return their x centres.
  function spread(n, x0, x1) {
    var out = [];
    if (n <= 1) { out.push((x0 + x1) / 2); return out; }
    var step = (x1 - x0) / (n - 1);
    for (var i = 0; i < n; i++) out.push(x0 + step * i);
    return out;
  }

  // ---- Serving at targets ---------------------------------------------------
  // Servers behind the near end line fire across the net into shaded targets.
  function serveTargets(opt) {
    opt = opt || {};
    var servers = opt.servers || 3;
    var players = spread(servers, 1.5, 7.5).map(function (x) {
      return { x: x, y: 12.5, label: "S", team: "a" };
    });
    (opt.extraPlayers || []).forEach(function (player) { players.push(player); });
    var zones = opt.zones || [
      { x: 0.5, y: 0.7, w: 3, h: 2.4, tone: "target", label: "1" },
      { x: 5.5, y: 0.7, w: 3, h: 2.4, tone: "target", label: "5" }
    ];
    var midX = players[Math.floor(servers / 2)].x;
    var targetIndex = opt.aim != null ? opt.aim : 0;
    var target = zones[Math.max(0, Math.min(zones.length - 1, targetIndex))];
    return {
      caption: opt.caption,
      w: 9, h: 13.4, net: 6,
      lines: [{ y: 3 }, { y: 9 }],
      court: [{ x: 0, y: 0, w: 9, h: 12 }],
      zones: zones,
      players: players,
      paths: [{ from: [midX, 12.2], to: [target.x + target.w / 2, target.y + target.h / 2], kind: "serve", curve: 0.25 }],
      legend: [{ tone: "target", text: "Aim here" }, { tone: "a", text: "Servers" }]
    };
  }

  // ---- Two fixed teams across the net --------------------------------------
  // Reviewed single-ball routes used by live-game diagrams. Coordinates are
  // fractions of the actual court width, so narrow/short courts keep every
  // contact inside their marked lane. One path (with intermediate contacts)
  // means the animation follows one ball instead of spawning unrelated balls.
  function acrossNetMotion(kind, cx0, cw) {
    function p(x, y) { return [cx0 + cw * x, y]; }
    var route;
    switch (kind) {
      case "serve-three":
        route = { points: [p(0.5, 0.65), p(0.28, 9.6), p(0.72, 7.7), p(0.25, 7.7), p(0.68, 3.4)],
          label: "SERVE · PASS · SET · HIT", kind: "serve" };
        break;
      case "free-three":
        route = { points: [p(0.75, 3.4), p(0.3, 9.6), p(0.72, 7.7), p(0.25, 7.7), p(0.65, 3.4)],
          label: "FREE · PASS · SET · HIT", kind: "ball" };
        break;
      case "two-touch":
        route = { points: [p(0.5, 4.3), p(0.28, 9.3), p(0.72, 7.7), p(0.5, 4.3)],
          label: "PASS · SEND", kind: "ball" };
        break;
      case "newcomb":
        route = { points: [p(0.5, 4.3), p(0.25, 9.2), p(0.5, 7.7), p(0.75, 9.2), p(0.5, 4.3)],
          label: "CATCH · PASS · THROW", kind: "ball" };
        break;
      case "bounce":
        route = { points: [p(0.5, 4.3), p(0.28, 9.5), p(0.7, 7.8), p(0.5, 4.3)],
          label: "BOUNCE · TOUCH · SEND", kind: "ball" };
        break;
      case "wash-two":
        route = { points: [p(0.5, 0.65), p(0.25, 9.6), p(0.7, 7.7), p(0.3, 4.3),
          p(0.72, 9.2), p(0.28, 7.7), p(0.65, 3.4)],
          label: "RALLY 1 · RESET · RALLY 2", kind: "serve" };
        break;
      case "reentry":
        route = { points: [p(0.25, 4.3), p(0.7, 9.3), p(0.35, 7.7), p(0.72, 4.3),
          p(0.22, 9.1), p(0.68, 7.7), p(0.35, 4.3)],
          label: "RESET · NEXT BALL NOW", kind: "ball" };
        break;
      case "bonus":
        route = { points: [p(0.3, 4.3), p(0.7, 9.2), p(0.28, 7.7), p(0.7, 4.3),
          p(0.2, 9.1), p(0.65, 7.7), p(0.4, 4.3)],
          label: "RALLY · SURPRISE BONUS", kind: "ball" };
        break;
      case "cooperative":
        route = { points: [p(0.3, 4.3), p(0.68, 9.2), p(0.32, 4.3), p(0.7, 9.2), p(0.35, 4.3)],
          label: "COUNT EVERY CROSSING", kind: "ball" };
        break;
      case "streak":
        route = { points: [p(0.3, 4.3), p(0.7, 9.2), p(0.28, 4.3), p(0.72, 9.2), p(0.35, 4.3)],
          label: "WIN 3 · THEN SERVE", kind: "ball" };
        break;
      case "narrow":
        route = { points: [p(0.5, 4.3), p(0.5, 9.2), p(0.5, 7.7), p(0.5, 3.4)],
          label: "LINE-ONLY RALLY", kind: "ball" };
        break;
      case "rally":
      default:
        route = { points: [p(0.3, 4.3), p(0.68, 9.2), p(0.3, 7.7), p(0.7, 4.3), p(0.35, 2.4), p(0.68, 7.7)],
          label: "LIVE RALLY", kind: "ball" };
        break;
    }
    return {
      from: route.points[0],
      via: route.points.slice(1, -1),
      to: route.points[route.points.length - 1],
      kind: route.kind,
      label: route.label,
      curve: 0
    };
  }

  function acrossNet(opt) {
    opt = opt || {};
    var size = opt.teamSize || 3;
    var cx0 = opt.courtX0 != null ? opt.courtX0 : 0;
    var cw = opt.courtW || 9;
    var x0 = cx0 + cw * 0.18, x1 = cx0 + cw * 0.82;
    var players = [];
    // Top = other side, bottom = your side. For 6, use two staggered rows.
    function place(team, yFront, yBack) {
      var front = Math.ceil(size / 2), back = size - front;
      spread(front, x0, x1).forEach(function (x) { players.push({ x: x, y: yFront, label: "", team: team }); });
      if (back > 0) spread(back, x0 + 0.8, x1 - 0.8).forEach(function (x) { players.push({ x: x, y: yBack, label: "", team: team }); });
    }
    place("b", 4.3, 2.4);
    place("a", 7.7, 9.6);
    if (opt.sequence === "serve-three" || opt.sequence === "wash-two") {
      var serverIndex = size > 1 ? Math.ceil(size / 2) : 0;
      players[serverIndex].x = cx0 + cw * 0.5;
      players[serverIndex].y = 0.35;
      players[serverIndex].label = "S";
      players[serverIndex].note = "serves behind end line";
    }
    var spec = {
      caption: opt.caption,
      w: 9, h: 12, net: 6,
      lines: [{ y: 3 }, { y: 9 }],
      court: [{ x: cx0, y: 0.8, w: cw, h: 10.4 }],
      zones: opt.zones || [],
      players: players,
      legend: opt.legend ? opt.legend.slice() : TEAM_LEGEND.slice()
    };
    if (opt.wait) {
      var waitY = opt.waitSide === "far" ? 0.35 : 11.55;
      for (var i = 0; i < opt.wait; i++) players.push({
        x: cx0 + 0.55 + i * 0.7, y: waitY, label: "Q", team: "n",
        note: "waits behind end line"
      });
      spec.legend.push({ tone: "n", text: "Waiting" });
    }
    if (opt.sequence) {
      var motion = acrossNetMotion(opt.sequence, cx0, cw);
      spec.paths = [motion];
      spec.legend.push({ tone: motion.kind, text: motion.label });
    }
    return spec;
  }

  // ---- King / Queen of the Court (rotate-in) -------------------------------
  function rotateIn(opt) {
    opt = opt || {};
    var size = opt.teamSize || 2;
    var queenPositions, challengerPositions;
    if (size === 6) {
      // A full team needs a real three-front / three-back volleyball shape.
      var teamXs = spread(3, 1.6, 7.4);
      queenPositions = teamXs.map(function (x) { return [x, 7.7]; })
        .concat(teamXs.map(function (x) { return [x, 9.6]; }));
      challengerPositions = teamXs.map(function (x) { return [x, 4.3]; })
        .concat(teamXs.map(function (x) { return [x, 2.4]; }));
    } else {
      var qx = spread(size, 2, 7);
      queenPositions = qx.map(function (x) { return [x, 8.6]; });
      challengerPositions = qx.map(function (x) { return [x, 3.4]; });
    }
    var players = queenPositions.map(function (point) {
      return { x: point[0], y: point[1], label: "", team: "a" };
    }).concat(challengerPositions.map(function (point) {
      return { x: point[0], y: point[1], label: "", team: "b" };
    }));
    // Waiting teams queued behind the challenger side.
    var waitN = opt.wait != null ? Math.max(0, Math.floor(opt.wait)) : 3;
    for (var i = 0; i < waitN; i++) players.push({ x: 1 + i * 0.8, y: 0.5, label: "", team: "n" });
    var paths = [];
    var exitStart = waitN ? Math.min(7.2, 1.8 + waitN * 0.8) : 1;
    var exitXs = spread(size, exitStart, 8);
    var positionNames = size === 6 ? ["front-left", "front-middle", "front-right", "back-left", "back-middle", "back-right"] : [];
    queenPositions.forEach(function (point, index) {
      var sidelineX = point[0] <= 4.5 ? 0.35 : 8.65;
      var exitTarget = waitN ? [exitXs[index], 0.55] : challengerPositions[index].slice();
      var role = positionNames[index] || "player " + (index + 1);
      paths.push({
        from: point.slice(), via: [[sidelineX, point[1]], [sidelineX, exitTarget[1]]],
        to: exitTarget, kind: "move", curve: 0, hideLabel: true,
        label: "Queen " + role + (waitN ? " exits" : " rotates around"), playerIndex: index
      });
    });
    challengerPositions.forEach(function (point, index) {
      var role = positionNames[index] || "player " + (index + 1);
      paths.push({
        from: point.slice(), to: queenPositions[index].slice(), kind: "move", hideLabel: true,
        curve: (index - (size - 1) / 2) * 0.04,
        label: "Challenger " + role + " crosses",
        playerIndex: size + index
      });
    });
    if (waitN >= size) {
      for (var waitingIndex = 0; waitingIndex < size; waitingIndex++) {
        var waitingPlayerIndex = size * 2 + waitingIndex;
        var waitingPlayer = players[waitingPlayerIndex];
        paths.push({
          from: [waitingPlayer.x, waitingPlayer.y], to: challengerPositions[waitingIndex].slice(),
          kind: "move", curve: (waitingIndex - (size - 1) / 2) * -0.08, hideLabel: true,
          label: "Waiting player " + (waitingIndex + 1) + " enters challenger side",
          playerIndex: waitingPlayerIndex
        });
      }
    }
    var legend = [{ tone: "a", text: "Kings/Queens" }, { tone: "b", text: "Challengers" }];
    if (waitN) legend.push({ tone: "n", text: "Waiting teams" });
    legend.push({ tone: "move", text: waitN ? "Winning team crosses · losing team exits" : "Winning team crosses · teams swap sides" });
    return {
      caption: opt.caption,
      w: 9, h: 11, net: 6,
      lines: [{ y: 3 }, { y: 9 }],
      court: [{ x: 0, y: 1.4, w: 9, h: 9 }],
      zones: [{ x: 0.2, y: 6.2, w: 8.6, h: 4, tone: "good", label: "Score only here" }],
      players: players,
      paths: paths,
      legend: legend
    };
  }

  // ---- A passing / control circle ------------------------------------------
  function circlePass(opt) {
    opt = opt || {};
    var n = opt.n || 6, R = 3.6, cx = 5, cy = 5.2;
    var players = [], pts = [];
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      var x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      players.push({ x: x, y: y, label: "", team: "a" });
      pts.push([x, y]);
    }
    var paths = [];
    for (var j = 0; j < n; j++) {
      paths.push({ from: pts[j], to: pts[(j + 1) % n], kind: "ball", curve: 0.35 });
    }
    if (opt.center) players.push({ x: cx, y: cy, label: opt.centerLabel || "•", team: "b" });
    return {
      caption: opt.caption, w: 10, h: 10.6, players: players, paths: paths
    };
  }

  // ---- Partner lines facing each other -------------------------------------
  function pairsRows(opt) {
    opt = opt || {};
    var pairs = opt.pairs || 3;
    var xs = spread(pairs, 1.4, 8.6);
    var players = [], paths = [];
    var yTop = opt.net ? 4 : 2.4, yBot = opt.net ? 8 : 9.6;
    xs.forEach(function (x) {
      players.push({ x: x, y: yTop, label: opt.topLabel || "F", team: "b" });
      players.push({ x: x, y: yBot, label: opt.botLabel || "P", team: "a" });
      if (!opt.noBall) paths.push({ from: [x, yBot - 0.6], to: [x, yTop + 0.6], kind: "ball", curve: 0.18 });
    });
    if (Array.isArray(opt.paths)) paths = opt.paths;
    var spec = { caption: opt.caption, w: 10, h: 12, players: players, paths: paths };
    if (opt.net) { spec.net = 6; spec.court = [{ x: 0.4, y: 1.5, w: 9.2, h: 9 }]; spec.lines = [{ y: 3 }, { y: 9 }]; }
    return spec;
  }

  // ---- Station rotation -----------------------------------------------------
  function stations(opt) {
    opt = opt || {};
    var labels = opt.labels || ["1", "2", "3", "4"];
    var cols = opt.cols || 2;
    var zones = [], centers = [];
    var bw = 3.7, bh = 2.6, gapX = 0.8, gapY = 1.2;
    labels.forEach(function (lab, i) {
      var r = Math.floor(i / cols), c = i % cols;
      var x = 0.6 + c * (bw + gapX), y = 0.6 + r * (bh + gapY);
      zones.push({ x: x, y: y, w: bw, h: bh, tone: "neutral", label: lab });
      centers.push([x + bw / 2, y + bh / 2]);
    });
    var players = [], stationSlots = [];
    var playersPerStation = opt.playersPerStation || 0;
    centers.forEach(function (center) {
      var slots = [];
      spread(playersPerStation, center[0] - 0.7, center[0] + 0.7).forEach(function (x) {
        slots.push({ playerIndex: players.length, x: x, y: center[1] + 0.7 });
        players.push({ x: x, y: center[1] + 0.7, label: "", team: "a", note: "station group" });
      });
      stationSlots.push(slots);
    });
    var paths = [];
    for (var i = 0; i < centers.length; i++) {
      if (!playersPerStation) {
        paths.push({ from: centers[i], to: centers[(i + 1) % centers.length], kind: "move", curve: 0.3 });
        continue;
      }
      var nextSlots = stationSlots[(i + 1) % stationSlots.length];
      stationSlots[i].forEach(function (slot, memberIndex) {
        var next = nextSlots[memberIndex];
        paths.push({
          from: [slot.x, slot.y], to: [next.x, next.y], kind: "move", curve: 0.3,
          label: memberIndex === 0 ? "group rotates" : "", playerIndex: slot.playerIndex
        });
      });
    }
    var rows = Math.ceil(labels.length / cols);
    return {
      caption: opt.caption,
      w: 0.6 * 2 + cols * bw + (cols - 1) * gapX,
      h: 0.6 * 2 + rows * bh + (rows - 1) * gapY,
      zones: zones, players: players, paths: paths,
      legend: [{ tone: "a", text: playersPerStation ? playersPerStation + " players per station" : "Station group" },
        { tone: "move", text: "Rotate this way" }]
    };
  }

  // ---- Coach feeding back-court defenders ----------------------------------
  function coachFeed(opt) {
    opt = opt || {};
    var n = opt.defenders || 3;
    var xs = spread(n, 1.6, 7.4);
    var sourceTeam = opt.sourceTeam || "coach";
    var players = [{
      x: 4.5, y: 0.9,
      label: opt.sourceLabel || (sourceTeam === "coach" ? "C" : "F"),
      team: sourceTeam,
      note: opt.sourceNote || (sourceTeam === "coach" ? "coach feeds" : "player feeds")
    }];
    var paths = [];
    xs.forEach(function (x, i) {
      players.push({ x: x, y: 8.6, label: "D", team: "a" });
      if (i % 2 === 0) paths.push({ from: [4.5, 1.4], to: [x, 8.1], kind: "ball", curve: 0.12 });
    });
    (opt.extraPlayers || []).forEach(function (player) { players.push(player); });
    (opt.extraPaths || []).forEach(function (path) { paths.push(path); });
    return {
      caption: opt.caption, w: 9, h: 10, net: 2.2,
      lines: [{ y: 5.2 }],
      court: [{ x: 0, y: 2.2, w: 9, h: 7.4 }],
      players: players, paths: paths,
      legend: [{ tone: sourceTeam, text: opt.sourceLegend || (sourceTeam === "coach" ? "Coach" : "Feeder") }, { tone: "a", text: "Defenders" }]
        .concat(opt.extraLegend || [])
    };
  }

  // ---- Player(s) working a wall --------------------------------------------
  function wall(opt) {
    opt = opt || {};
    var n = opt.players || 3;
    var xs = spread(n, 1.6, 7.4);
    var players = xs.map(function (x) { return { x: x, y: 6.4, label: "", team: "a" }; });
    var midX = xs[Math.floor(xs.length / 2)];
    return titleable(opt, {
      caption: opt.caption,
      w: 9, h: 8,
      zones: [{ x: 0, y: 0.2, w: 9, h: 1, tone: "neutral", label: "WALL" }],
      players: players,
      paths: [
        { from: [midX, 5.8], to: [midX, 1.5], kind: "ball", label: "off the wall", curve: 0.12 },
        { from: [midX + 0.5, 1.6], to: [midX + 0.5, 5.8], kind: "move", curve: 0.12 }
      ]
    });
  }

  // ---- A feed line: a feeder, the active player, a target, and a queue ------
  // The everyday "lines" drill shape (hitting lines, digging lines, setting
  // lines): a coach/feeder sends a ball to the player at the front, who plays it
  // to a target and jogs to the back of the line.
  function feedLine(opt) {
    opt = opt || {};
    var feederY = opt.feederY != null ? opt.feederY : 1.4;
    var feederTeam = opt.feederTeam || "coach";
    var players = [
      { x: 4.5, y: feederY, label: opt.feederLabel || "C", team: feederTeam, note: opt.feederNote || "feeder" },
      { x: 4.4, y: 6.2, label: opt.activeLabel || "1", team: "a", note: "your turn" }
    ];
    if (opt.target !== false && opt.targetObject !== "ring") {
      players.push({ x: 7, y: 4.4, label: opt.targetLabel || "T", team: "a", note: "target" });
    }
    // The waiting queue, stacked at the back corner.
    var q = opt.queue != null ? opt.queue : 3;
    for (var i = 0; i < q; i++) players.push({ x: 1.4, y: 9 + (i % 3) * 0.7, label: "", team: "n" });
    var paths = [{ from: [4.5, feederY + 0.4], to: [4.4, 5.8], kind: "ball", label: "feed", curve: 0.12 }];
    if (opt.target !== false) paths.push({ from: [4.4, 6.2], to: [6.7, 4.6], kind: "ball", label: opt.action || "play it", curve: 0.18 });
    var moveTo = opt.moveTo || [1.7, 9];
    paths.push({
      from: [4, 6.6], to: moveTo, kind: "move",
      label: opt.moveLabel || "to back of line", curve: 0.3, playerIndex: 1
    });
    return titleable(opt, {
      caption: opt.caption,
      w: 9, h: 11, net: opt.net != null ? opt.net : null,
      court: opt.court || [{ x: 0, y: 0, w: 9, h: 11 }],
      players: players, paths: paths,
      rings: opt.targetObject === "ring" ? [{ x: 7, y: 4.4, r: 0.55, tone: "target" }] : [],
      legend: [{ tone: feederTeam, text: "Feeder" }, { tone: "a", text: "Worker" }, { tone: "target", text: "Target" }, { tone: "n", text: "Line waits" }]
    });
  }

  // ---- Warm-up lanes: players moving baseline to baseline -------------------
  function lanes(opt) {
    opt = opt || {};
    var n = opt.lanes || 4;
    var xs = spread(n, 1.4, 7.6);
    var players = xs.map(function (x) { return { x: x, y: 9.4, label: "", team: "a" }; });
    var paths = xs.map(function (x) { return { from: [x, 9], to: [x, 1.4], kind: "move", curve: 0 }; });
    if (opt.back) xs.forEach(function (x) { paths.push({ from: [x + 0.35, 1.6], to: [x + 0.35, 9], kind: "move", curve: 0 }); });
    return titleable(opt, {
      caption: opt.caption,
      w: 9, h: 10.4,
      court: [{ x: 0, y: 0.8, w: 9, h: 9 }],
      lines: [{ y: 5.2 }],
      players: players, paths: paths,
      legend: [{ tone: "move", text: opt.back ? "Down and back" : "Move this way" }]
    });
  }

  // ---- One hitter's approach footwork to the net ---------------------------
  function approachPath(opt) {
    opt = opt || {};
    var startX = opt.side === "middle" ? 4.5 : (opt.side === "right" ? 7 : 2);
    var takeX = opt.side === "middle" ? 4.5 : (opt.side === "right" ? 6.6 : 2.4);
    var players = [{ x: startX, y: 8.4, label: "H", team: "a", note: "start" }];
    for (var qi = 0; qi < (opt.queue || 0); qi++) {
      players.push({ x: startX - 0.55 + qi * 0.55, y: 9.05,
        label: "Q", team: "n", note: "hitter line" });
    }
    if (opt.setter !== false) players.push({ x: 5.4, y: 3, label: "St", team: "a", note: "setter" });
    // Three step segments (slow-slow-quick-quick) up to the takeoff.
    var paths = [{
      from: [startX, 8], via: [[takeX - 0.4, 6]], to: [takeX, 4.2],
      kind: "move", curve: 0, label: "approach", playerIndex: 0
    }];
    if (opt.setter !== false) paths.push({ from: [5.4, 3], to: [takeX, 3.6], kind: "ball", label: "set", curve: 0.2 });
    if (opt.swing) paths.push({ from: [takeX, 3.4], to: [opt.side === "right" ? 2.2 : 6.6, 1.4], kind: "serve", label: "swing", curve: 0.1 });
    return titleable(opt, {
      caption: opt.caption,
      w: 9, h: 9.4, net: 2,
      court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
      players: players, paths: paths
    });
  }

  // ---- Six base court positions (defense / rotations) ----------------------
  function basePositions(opt) {
    opt = opt || {};
    var L = opt.labels || ["", "", "", "", "", ""];
    var spots = [
      [2.6, 3.4], [6.4, 3.4],            // front (net) pair
      [4.5, 5.8],                         // middle
      [1.5, 8.4], [4.5, 9.2], [7.5, 8.4]  // back three
    ];
    var players = spots.map(function (p, i) { return { x: p[0], y: p[1], label: L[i] || "", team: "a" }; });
    var legend = [{ tone: "a", text: "Base spots" }];
    if (opt.feeder !== false) {
      players.unshift({ x: opt.feederX != null ? opt.feederX : 4.5, y: 0.9,
        label: opt.feederLabel || "C", team: "coach", note: opt.feederNote || "coach attacks" });
      legend.unshift({ tone: "coach", text: "Attack" });
    }
    var spec = titleable(opt, {
      caption: opt.caption,
      w: 9, h: 10, net: 2, lines: [{ y: 5.2 }],
      court: [{ x: 0, y: 2, w: 9, h: 7.6 }],
      players: players, legend: legend
    });
    if (opt.paths) spec.paths = opt.paths;
    return spec;
  }

  // Copy an optional title onto a spec (so builders can carry a step heading).
  function titleable(opt, spec) { if (opt && opt.title) spec.title = opt.title; return spec; }
  // Attach a title to any spec (for hand-built step specs).
  function titled(spec, title) { spec.title = title; return spec; }
  // Sugar: collect specs into an ordered multi-step array.
  function seq() { return Array.prototype.slice.call(arguments).filter(Boolean); }

  // Stamp every builder's output with its template name, so the renderer can
  // swap in the matching AI illustration (see js/diagram-images.js). An explicit
  // `template`/`img` already on the spec wins, so callers can override per drill.
  function tag(name, fn) {
    return function (opt) {
      var spec = fn(opt);
      if (spec && !spec.template && !spec.img) spec.template = name;
      return spec;
    };
  }

  return {
    spread: spread,
    serveTargets: tag("serveTargets", serveTargets),
    acrossNet: tag("acrossNet", acrossNet),
    rotateIn: tag("rotateIn", rotateIn),
    circlePass: tag("circlePass", circlePass),
    pairsRows: tag("pairsRows", pairsRows),
    stations: tag("stations", stations),
    coachFeed: tag("coachFeed", coachFeed),
    wall: tag("wall", wall),
    feedLine: tag("feedLine", feedLine),
    lanes: tag("lanes", lanes),
    approachPath: tag("approachPath", approachPath),
    basePositions: tag("basePositions", basePositions),
    titled: titled,
    seq: seq
  };
})();
