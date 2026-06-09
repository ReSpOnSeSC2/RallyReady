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
    var zones = opt.zones || [
      { x: 0.5, y: 0.7, w: 3, h: 2.4, tone: "target", label: "1" },
      { x: 5.5, y: 0.7, w: 3, h: 2.4, tone: "target", label: "5" }
    ];
    var midX = players[Math.floor(players.length / 2)].x;
    return {
      caption: opt.caption,
      w: 9, h: 13.4, net: 6,
      lines: [{ y: 3 }, { y: 9 }],
      court: [{ x: 0, y: 0, w: 9, h: 12 }],
      zones: zones,
      players: players,
      paths: [{ from: [midX, 12.2], to: [zones[zones.length - 1].x + zones[zones.length - 1].w / 2, zones[zones.length - 1].y + 1], kind: "serve", curve: 0.25 }],
      legend: [{ tone: "target", text: "Aim here" }, { tone: "a", text: "Servers" }]
    };
  }

  // ---- Two fixed teams across the net --------------------------------------
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
    var spec = {
      caption: opt.caption,
      w: 9, h: 12, net: 6,
      lines: [{ y: 3 }, { y: 9 }],
      court: [{ x: cx0, y: 0, w: cw, h: 12 }],
      players: players,
      legend: TEAM_LEGEND.slice()
    };
    if (opt.wait) {
      for (var i = 0; i < opt.wait; i++) players.push({ x: cx0 - 0.1 + i * 0.7, y: 11.4, label: "", team: "n" });
      spec.legend.push({ tone: "n", text: "Waiting" });
    }
    return spec;
  }

  // ---- King / Queen of the Court (rotate-in) -------------------------------
  function rotateIn(opt) {
    opt = opt || {};
    var size = opt.teamSize || 2;
    var qx = spread(size, 2, 7);
    var players = qx.map(function (x) { return { x: x, y: 8.6, label: "", team: "a" }; })
      .concat(qx.map(function (x) { return { x: x, y: 3.4, label: "", team: "b" }; }));
    // Waiting teams queued behind the challenger side.
    var waitN = opt.wait || 3;
    for (var i = 0; i < waitN; i++) players.push({ x: 1 + i * 0.8, y: 0.5, label: "", team: "n" });
    return {
      caption: opt.caption,
      w: 9, h: 11, net: 6,
      lines: [{ y: 3 }, { y: 9 }],
      court: [{ x: 0, y: 1.4, w: 9, h: 9 }],
      zones: [{ x: 0.2, y: 6.2, w: 8.6, h: 4, tone: "good", label: "Score only here" }],
      players: players,
      paths: [
        { from: [8, 3.4], to: [8, 8.6], kind: "move", curve: -0.5, label: "win → cross over" },
        { from: [1.3, 8.6], to: [1.3, 0.7], kind: "move", curve: 0.5, label: "lose → back of line" }
      ],
      legend: [{ tone: "a", text: "Kings/Queens" }, { tone: "b", text: "Challengers" }, { tone: "n", text: "Waiting teams" }]
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
      paths.push({ from: [x, yBot - 0.6], to: [x, yTop + 0.6], kind: "ball", curve: 0.18 });
    });
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
    var paths = [];
    for (var i = 0; i < centers.length; i++) {
      paths.push({ from: centers[i], to: centers[(i + 1) % centers.length], kind: "move", curve: 0.3 });
    }
    var rows = Math.ceil(labels.length / cols);
    return {
      caption: opt.caption,
      w: 0.6 * 2 + cols * bw + (cols - 1) * gapX,
      h: 0.6 * 2 + rows * bh + (rows - 1) * gapY,
      zones: zones, paths: paths,
      legend: [{ tone: "move", text: "Rotate this way" }]
    };
  }

  // ---- Coach feeding back-court defenders ----------------------------------
  function coachFeed(opt) {
    opt = opt || {};
    var n = opt.defenders || 3;
    var xs = spread(n, 1.6, 7.4);
    var players = [{ x: 4.5, y: 0.9, label: "C", team: "coach", note: opt.sourceNote || "coach feeds" }];
    var paths = [];
    xs.forEach(function (x, i) {
      players.push({ x: x, y: 8.6, label: "D", team: "a" });
      if (i % 2 === 0) paths.push({ from: [4.5, 1.4], to: [x, 8.1], kind: "ball", curve: 0.12 });
    });
    return {
      caption: opt.caption, w: 9, h: 10, net: 2.2,
      lines: [{ y: 5.2 }],
      court: [{ x: 0, y: 2.2, w: 9, h: 7.4 }],
      players: players, paths: paths,
      legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Defenders" }]
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
    var players = [
      { x: 4.5, y: 1.4, label: opt.feederLabel || "C", team: "coach", note: opt.feederNote || "feeder" },
      { x: 4.4, y: 6.2, label: opt.activeLabel || "1", team: "a", note: "your turn" }
    ];
    if (opt.target !== false) players.push({ x: 7, y: 4.4, label: opt.targetLabel || "T", team: "a", note: "target" });
    // The waiting queue, stacked at the back corner.
    var q = opt.queue || 3;
    for (var i = 0; i < q; i++) players.push({ x: 1.4, y: 9 + (i % 3) * 0.7, label: "", team: "n" });
    var paths = [{ from: [4.5, 1.8], to: [4.4, 5.8], kind: "ball", label: "feed", curve: 0.12 }];
    if (opt.target !== false) paths.push({ from: [4.4, 6.2], to: [6.7, 4.6], kind: "ball", label: opt.action || "play it", curve: 0.18 });
    paths.push({ from: [4, 6.6], to: [1.7, 9], kind: "move", label: "to back of line", curve: 0.3 });
    return titleable(opt, {
      caption: opt.caption,
      w: 9, h: 11, net: opt.net != null ? opt.net : null,
      court: opt.court || [{ x: 0, y: 0, w: 9, h: 11 }],
      players: players, paths: paths,
      legend: [{ tone: "coach", text: "Feeder" }, { tone: "a", text: "Worker + target" }, { tone: "n", text: "Line waits" }]
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
    if (opt.setter !== false) players.push({ x: 5.4, y: 3, label: "St", team: "a", note: "setter" });
    // Three step segments (slow-slow-quick-quick) up to the takeoff.
    var paths = [
      { from: [startX, 8], to: [takeX - 0.4, 6], kind: "move", curve: 0.1 },
      { from: [takeX - 0.4, 6], to: [takeX, 4.2], kind: "move", curve: -0.1, label: "approach" }
    ];
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
      players.unshift({ x: 4.5, y: 0.9, label: opt.feederLabel || "C", team: "coach", note: opt.feederNote || "coach attacks" });
      legend.unshift({ tone: "coach", text: "Attack" });
    }
    return titleable(opt, {
      caption: opt.caption,
      w: 9, h: 10, net: 2, lines: [{ y: 5.2 }],
      court: [{ x: 0, y: 2, w: 9, h: 7.6 }],
      players: players, legend: legend
    });
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
