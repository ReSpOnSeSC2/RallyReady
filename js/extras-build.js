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
    var teamNames = opt.teamNames || null;
    var actorPrefix = opt.actorPrefix || "court";
    var players = [];
    function rowRole(row, index, count) {
      if (count === 1) return row + "-middle";
      if (index === 0) return row + "-left";
      if (index === count - 1) return row + "-right";
      return row + "-middle";
    }
    function courtPlayer(team, row, index, count, x, y) {
      var player = { x: x, y: y, label: "", team: team };
      if (teamNames) {
        var spot = rowRole(row, index, count);
        var teamName = teamNames[team] || (team === "a" ? "near" : "far");
        player.id = actorPrefix + "-" + teamName + "-" + spot;
        player.role = teamName + " " + spot.replace(/-/g, " ");
        player.facing = team === "a" ? "north" : "south";
      }
      return player;
    }
    // Top = other side, bottom = your side. For 6, use two staggered rows.
    function place(team, yFront, yBack) {
      var front = Math.ceil(size / 2), back = size - front;
      spread(front, x0, x1).forEach(function (x, index) {
        players.push(courtPlayer(team, "front", index, front, x, yFront));
      });
      if (back > 0) spread(back, x0 + 0.8, x1 - 0.8).forEach(function (x, index) {
        players.push(courtPlayer(team, "back", index, back, x, yBack));
      });
    }
    place("b", 4.3, 2.4);
    place("a", 7.7, 9.6);
    var activeServerIndex = -1;
    if (opt.sequence === "serve-three" || opt.sequence === "wash-two") {
      // `place` appends the far-side back row after the front row. Its final
      // athlete is the right-back/P1 server, not the first back-row athlete.
      var serverIndex = size > 1 ? size - 1 : 0;
      activeServerIndex = serverIndex;
      players[serverIndex].x = cx0 + cw * 0.5;
      players[serverIndex].y = 0.35;
      players[serverIndex].label = "S";
      players[serverIndex].note = "serves behind end line";
      players[serverIndex].activeRole = "server";
      if (players[serverIndex].facing) players[serverIndex].facing = "south";
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
        note: "waits behind end line",
        id: teamNames ? actorPrefix + "-waiting-" + (i + 1) : undefined,
        role: teamNames ? "waiting player " + (i + 1) : undefined,
        facing: teamNames ? (opt.waitSide === "far" ? "south" : "north") : undefined
      });
      spec.legend.push({ tone: "n", text: "Waiting" });
    }
    if (opt.sequence) {
      var motion = acrossNetMotion(opt.sequence, cx0, cw);
      motion.contactOrder = opt.contactOrder || motion.label.split(/\s*·\s*/);
      if (teamNames && size === 6 && opt.sequence === "serve-three") {
        function teamActor(team, role) {
          var match = players.filter(function (player) {
            return player.team === team && player.id &&
              player.id.slice(-(role.length + 1)) === "-" + role;
          })[0];
          return match && match.id;
        }
        var queenPasser = teamActor("a", "back-left");
        var queenSetter = teamActor("a", "front-right");
        var queenHitter = teamActor("a", "front-left");
        // The serving P1 is still behind the end line in this snapshot. End
        // the shown attack at the on-court right-front defender/blocker rather
        // than falsely making the server receive its own rally-ending ball.
        var challengerDefender = teamActor("b", "front-right");
        motion.contacts = [
          { order: 1, actor: players[activeServerIndex].id, toActor: queenPasser,
            action: "serve release", pathIndex: 0 },
          { order: 2, actor: queenPasser, toActor: queenSetter,
            action: "forearm pass", pathIndex: 0 },
          { order: 3, actor: queenSetter, toActor: queenHitter,
            action: "set", pathIndex: 0 },
          { order: 4, actor: queenHitter, toActor: challengerDefender,
            action: "attack", pathIndex: 0 }
        ];
        motion.fromActor = motion.contacts[0].actor;
        motion.toActor = challengerDefender;
      }
      spec.paths = [motion];
      if (motion.contacts) spec.contacts = motion.contacts.slice();
      spec.legend.push({ tone: motion.kind, text: motion.label });
    }
    return spec;
  }

  // ---- Two-ball 6v6 wash sequence -----------------------------------------
  // A wash is not one zig-zag arrow: it is two complete, independently
  // tracked rallies. The first starts with a serve; the second starts from a
  // coach-entered free/down ball and forces the receiving side to transition.
  function washGame(opt) {
    opt = opt || {};
    var prefix = opt.actorPrefix || "wash";
    function id(value) { return prefix + "-" + value; }
    var players = [
      { id: id("far-server"), x: 4.5, y: 0.35, label: "Sv", team: "b", role: "far-side server", facing: "south", note: "starts rally one" },
      { id: id("far-outside"), x: 1.65, y: 4.15, label: "OH", team: "b", role: "far-side outside hitter", facing: "south" },
      { id: id("far-middle"), x: 4.35, y: 4.15, label: "M", team: "b", role: "far-side middle", facing: "south" },
      { id: id("far-setter"), x: 7.15, y: 4.15, label: "St", team: "b", role: "far-side setter", facing: "south" },
      { id: id("far-left-back"), x: 2.35, y: 2.35, label: "D1", team: "b", role: "far-side left-back defender", facing: "south" },
      { id: id("far-right-back"), x: 6.65, y: 2.35, label: "D2", team: "b", role: "far-side right-back defender", facing: "south" },
      { id: id("near-outside"), x: 1.65, y: 7.15, label: "OH", team: "a", role: "near-side outside hitter", facing: "north" },
      { id: id("near-middle"), x: 4.35, y: 7.15, label: "M", team: "a", role: "near-side middle", facing: "north" },
      { id: id("near-setter"), x: 7.15, y: 7.15, label: "St", team: "a", role: "near-side setter", facing: "north" },
      { id: id("near-left-back"), x: 2.35, y: 9.55, label: "P1", team: "a", role: "near-side left-back passer", facing: "north" },
      { id: id("near-middle-back"), x: 4.5, y: 9.8, label: "P2", team: "a", role: "near-side middle-back passer", facing: "north" },
      { id: id("near-right-back"), x: 6.65, y: 9.55, label: "P3", team: "a", role: "near-side right-back passer", facing: "north" },
      { id: id("coach"), x: 8.55, y: 5.45, label: "C", team: "coach", role: "wash-ball coach", facing: "southwest", note: "enters rally two immediately" }
    ];
    var paths = [
      { from: [4.5, 0.7], to: [2.35, 9.2], kind: "serve", label: "Rally 1 · serve to left-back passer", fromActor: id("far-server"), toActor: id("near-left-back"), stepIndices: [0] },
      { from: [2.35, 9.2], to: [6.95, 7.35], kind: "ball", label: "Rally 1 · controlled pass to setter", fromActor: id("near-left-back"), toActor: id("near-setter"), stepIndices: [0] },
      { from: [7.15, 7.15], to: [1.95, 6.9], kind: "ball", label: "Rally 1 · high outside set", fromActor: id("near-setter"), toActor: id("near-outside"), stepIndices: [0] },
      { from: [1.65, 6.85], to: [6.45, 2.6], kind: "serve", label: "Rally 1 · near-side attack", fromActor: id("near-outside"), toActor: id("far-right-back"), stepIndices: [0] },
      { from: [6.65, 2.55], to: [6.95, 4], kind: "ball", label: "Rally 1 · far-side dig", fromActor: id("far-right-back"), toActor: id("far-setter"), stepIndices: [0] },
      { from: [7.15, 4.15], to: [1.95, 4.35], kind: "ball", label: "Rally 1 · far-side outside set", fromActor: id("far-setter"), toActor: id("far-outside"), stepIndices: [0] },
      { from: [1.65, 4.4], to: [6.45, 9.25], kind: "serve", label: "Rally 1 · far-side counterattack", fromActor: id("far-outside"), toActor: id("near-right-back"), stepIndices: [0] },
      { from: [8.3, 5.6], to: [6.65, 9.25], kind: "ball", label: opt.hardSecondBall ? "Rally 2 · coach drives transition ball" : "Rally 2 · coach enters free ball", fromActor: id("coach"), toActor: id("near-right-back"), stepIndices: opt.hardSecondBall ? [1, 3] : [1] },
      { from: [6.65, 9.25], to: [6.95, 7.35], kind: "ball", label: opt.hardSecondBall ? "Rally 2 · transition dig to target" : "Rally 2 · free-ball pass to target", fromActor: id("near-right-back"), toActor: id("near-setter"), stepIndices: opt.hardSecondBall ? [1, 3] : [1] },
      { from: [7.15, 7.15], to: [4.45, 6.9], kind: "ball", label: "Rally 2 · transition set to middle", fromActor: id("near-setter"), toActor: id("near-middle"), stepIndices: opt.hardSecondBall ? [1, 3] : [1] },
      { from: [4.35, 6.85], to: [2.45, 2.65], kind: "serve", label: "Rally 2 · middle counterattack", fromActor: id("near-middle"), toActor: id("far-left-back"), stepIndices: opt.hardSecondBall ? [1, 3] : [1] }
    ];
    return {
      title: opt.title || "Two-rally wash",
      caption: opt.caption,
      w: 9, h: 12, net: 6, lines: [{ y: 3 }, { y: 9 }],
      court: [{ x: 0, y: 0.8, w: 9, h: 10.4 }],
      zones: [
        { x: 0.35, y: 0.85, w: 3.35, h: 0.75, tone: "neutral", label: "RALLY 1 · SERVE" },
        { x: 5.3, y: 10.4, w: 3.35, h: 0.75, tone: "good", label: "RALLY 2 · TRANSITION" }
      ],
      players: players,
      paths: paths,
      motionChains: [[0, 1, 2, 3, 4, 5, 6], [7, 8, 9, 10]],
      contacts: paths.map(function (path, index) {
        var actions = ["serve", "forearm pass", "outside set", "attack", "dig", "outside set", "attack",
          "coach feed", opt.hardSecondBall ? "dig" : "forearm pass", "transition set", "attack"];
        return { order: index + 1, actor: path.fromActor, action: actions[index], pathIndex: index };
      }),
      operation: "rotation",
      legend: [
        { tone: "b", text: "Far-side six" }, { tone: "a", text: "Near-side six" },
        { tone: "coach", text: "Coach starts second rally" },
        { tone: "ball", text: "Win both separate rallies to score" }
      ]
    };
  }

  // ---- King / Queen of the Court (rotate-in) -------------------------------
  function rotateIn(opt) {
    opt = opt || {};
    var size = opt.teamSize || 2;
    var teamNames = opt.teamNames || null;
    var actorPrefix = opt.actorPrefix || "rotate";
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
    var positionNames = size === 6 ? ["front-left", "front-middle", "front-right", "back-left", "back-middle", "back-right"] : [];
    var players = queenPositions.map(function (point, index) {
      var role = positionNames[index] || "player-" + (index + 1);
      return { x: point[0], y: point[1], label: "", team: "a",
        id: teamNames ? actorPrefix + "-" + (teamNames.a || "queen") + "-" + role : undefined,
        role: teamNames ? (teamNames.a || "queen") + " " + role.replace(/-/g, " ") : undefined,
        facing: teamNames ? "north" : undefined };
    }).concat(challengerPositions.map(function (point, index) {
      var role = positionNames[index] || "player-" + (index + 1);
      return { x: point[0], y: point[1], label: "", team: "b",
        id: teamNames ? actorPrefix + "-" + (teamNames.b || "challenger") + "-" + role : undefined,
        role: teamNames ? (teamNames.b || "challenger") + " " + role.replace(/-/g, " ") : undefined,
        facing: teamNames ? "south" : undefined };
    }));
    // Waiting teams queued behind the challenger side.
    var waitN = opt.wait != null ? Math.max(0, Math.floor(opt.wait)) : 3;
    for (var i = 0; i < waitN; i++) players.push({ x: 1 + i * 0.8, y: 0.5, label: "", team: "n",
      id: teamNames ? actorPrefix + "-waiting-" + (i + 1) : undefined,
      role: teamNames ? "waiting player " + (i + 1) : undefined,
      facing: teamNames ? "south" : undefined });
    var paths = [];
    var exitStart = waitN ? Math.min(7.2, 1.8 + waitN * 0.8) : 1;
    var exitXs = spread(size, exitStart, 8);
    queenPositions.forEach(function (point, index) {
      var sidelineX = point[0] <= 4.5 ? 0.35 : 8.65;
      var exitTarget = waitN ? [exitXs[index], 0.55] : challengerPositions[index].slice();
      var role = positionNames[index] || "player " + (index + 1);
      paths.push({
        from: point.slice(), via: [[sidelineX, point[1]], [sidelineX, exitTarget[1]]],
        to: exitTarget, kind: "move", curve: 0, hideLabel: true,
        simultaneousGroup: "post-rally-team-change",
        label: "Queen " + role + (waitN ? " exits" : " rotates around"), playerIndex: index,
        actor: players[index].id
      });
    });
    challengerPositions.forEach(function (point, index) {
      var role = positionNames[index] || "player " + (index + 1);
      paths.push({
        from: point.slice(), to: queenPositions[index].slice(), kind: "move", hideLabel: true,
        simultaneousGroup: "post-rally-team-change",
        curve: (index - (size - 1) / 2) * 0.04,
        label: "Challenger " + role + " crosses",
        playerIndex: size + index,
        actor: players[size + index].id
      });
    });
    if (waitN >= size) {
      for (var waitingIndex = 0; waitingIndex < size; waitingIndex++) {
        var waitingPlayerIndex = size * 2 + waitingIndex;
        var waitingPlayer = players[waitingPlayerIndex];
        paths.push({
          from: [waitingPlayer.x, waitingPlayer.y], to: challengerPositions[waitingIndex].slice(),
          kind: "move", curve: (waitingIndex - (size - 1) / 2) * -0.08, hideLabel: true,
          simultaneousGroup: "post-rally-team-change",
          label: "Waiting player " + (waitingIndex + 1) + " enters challenger side",
          playerIndex: waitingPlayerIndex,
          actor: players[waitingPlayerIndex].id
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
    var hitterId = opt.hitterId || "approach-hitter";
    var setterId = opt.setterId || "approach-setter";
    var players = [{ id: hitterId, x: startX, y: 8.4, label: "H", team: "a",
      role: "hitter", note: "start" }];
    for (var qi = 0; qi < (opt.queue || 0); qi++) {
      players.push({ x: startX - 0.55 + qi * 0.55, y: 9.05,
        label: "Q", team: "n", note: "hitter line" });
    }
    if (opt.setter !== false) players.push({ id: setterId, x: 5.4, y: 3,
      label: "St", team: "a", role: "setter", note: "setter" });
    // Three step segments (slow-slow-quick-quick) up to the takeoff.
    var paths = [{
      from: [startX, 8], via: [[takeX - 0.4, 6]], to: [takeX, 4.2],
      kind: "move", curve: 0, label: "approach", playerIndex: 0,
      actor: hitterId
    }];
    if (opt.setter !== false) paths.push({
      from: [5.4, 3], to: [takeX, 3.6], kind: "ball", label: "set", curve: 0.2,
      fromActor: setterId, toActor: hitterId
    });
    if (opt.swing) paths.push({
      from: [takeX, 3.4], to: [opt.side === "right" ? 2.2 : 6.6, 1.4],
      kind: "serve", label: "swing", curve: 0.1, fromActor: hitterId,
      toEndpoint: { type: "target", label: "Attack target" }
    });
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
    var playerIds = opt.playerIds || [];
    var playerRoles = opt.playerRoles || [];
    var spots = [
      [2.6, 3.4], [6.4, 3.4],            // front (net) pair
      [4.5, 5.8],                         // middle
      [1.5, 8.4], [4.5, 9.2], [7.5, 8.4]  // back three
    ];
    var players = spots.map(function (p, i) { return {
      id: playerIds[i], x: p[0], y: p[1], label: L[i] || "", team: "a",
      role: playerRoles[i], facing: playerIds[i] ? "north" : undefined
    }; });
    var legend = [{ tone: "a", text: "Base spots" }];
    if (opt.feeder !== false) {
      players.unshift({ id: opt.feederId, x: opt.feederX != null ? opt.feederX : 4.5, y: 0.9,
        label: opt.feederLabel || "C", team: opt.feederTeam || "coach",
        role: opt.feederRole, facing: opt.feederId ? "south" : undefined,
        note: opt.feederNote || "coach attacks" });
      legend.unshift({ tone: opt.feederTeam || "coach", text: "Attack" });
    }
    (opt.extraPlayers || []).forEach(function (player) { players.push(player); });
    var spec = titleable(opt, {
      caption: opt.caption,
      w: 9, h: 10, net: 2, lines: [{ y: 5.2 }],
      court: [{ x: 0, y: 2, w: 9, h: 7.6 }],
      players: players, legend: legend
    });
    if (opt.paths) spec.paths = opt.paths;
    if (opt.contacts) spec.contacts = opt.contacts;
    if (opt.motionChains) spec.motionChains = opt.motionChains;
    if (opt.operation) spec.operation = opt.operation;
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
    washGame: tag("washGame", washGame),
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
