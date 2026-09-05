// extras-data-12.js — diagrams for the equipment drills added in drills-11.js.
//
// One entry per NEW drill WHERE a court layout, target placement, or movement
// path actually clarifies the setup — the hoops/targets accuracy drills, the
// mat-based pursuit/dive defense, and the partner reaction/ladder work.
//
// Purely stationary fitness (resistance/mini bands, jump rope, medicine-ball
// throws, foam rolling, box step-ups/landings, in-place mobility) gets NO
// diagram on purpose — same rule the warmup file (extras-data-10.js) follows,
// since a court drawing would invent positioning that isn't there.
//
// CONCATENATES onto RR.extras. Uses the shared dk (diagram kit) builders.
window.RR = window.RR || {};
RR.extras = RR.extras || {};

(function (RR) {
  "use strict";
  var dk = RR.dk;
  var E = RR.extras;

  ["partner-catch-bump-control", "one-knee-setting-form"].forEach(function (id) {
    var entry = E[id];
    var posture = id === "one-knee-setting-form" ? "kneeling" : "seated";
    var scenes = entry.diagrams || [entry.diagram];
    scenes.forEach(function (scene) {
      (scene.players || []).forEach(function (player) {
        if (player.team !== "coach") player.posture = posture;
      });
    });
  });
  E["set-and-sit"].diagrams[1].players.forEach(function (player) {
    if (player.team !== "coach") player.posture = "sit-stand";
  });
  E["mini-volley-stations-tournament"].diagrams.forEach(function (scene) {
    scene.coordinateSystem = "metric";
    scene.nets = scene.court.map(function (court) {
      return { x: court.x, y: 4, w: court.w, label: "Lowered mini-court net", heightMeters: 1.8 };
    });
    scene.exampleNote = "Two 4.2 × 6.8 m mini-courts with an example lowered net; adapt size and height to the players and available space.";
  });

  // This is travelling footwork, not an in-place equipment exercise. One lead
  // step + follow closes a 0.4 m cycle; five cycles travel the example 2 m lane.
  E["mini-band-defensive-shuffle"] = {
    diagram: {
      title: "Five right, five left, then a small box",
      caption: "Band above both knees. Keep a low defensive stance through five lead-and-follow steps right, five left, then the forward-and-back box. Keep the feet apart and the band under tension throughout.",
      exampleNote: "Example spacing: five controlled 0.4 m lead-and-follow steps cover 2 m. Adjust step size to the player while keeping the band taut.",
      coordinateSystem: "metric", w: 9, h: 8,
      players: [{ id: "band-shuffler", x: 3.5, y: 5, label: "D", team: "a", facing: "north", note: "band above knees; chest toward the coach" }],
      props: [{ id: "working-mini-band", type: "mini-band", actor: "band-shuffler", attachment: "above-knees", label: "Mini-band above knees" }],
      paths: [
        { from: [3.5, 5], to: [5.5, 5], kind: "move", motionId: "mini-band", label: "5 steps right · 2 m", actor: "band-shuffler", stepIndices: [1], stepCount: 5, distanceMeters: 2, sequenceOrder: 0 },
        { from: [5.5, 5], to: [3.5, 5], kind: "move", motionId: "mini-band", label: "5 steps left · 2 m", actor: "band-shuffler", stepIndices: [2], stepCount: 5, distanceMeters: 2, sequenceOrder: 1 },
        { from: [3.5, 5], via: [[3.5, 3.8], [5.5, 3.8], [5.5, 5]], to: [3.5, 5], kind: "move", motionId: "mini-band", label: "forward · right · back · left", actor: "band-shuffler", stepIndices: [3], sequenceOrder: 2 }
      ],
      legend: [{ tone: "a", text: "Defender with band above knees" }, { tone: "move", text: "Lead foot moves; trail foot follows without touching" }]
    }
  };
  var bandWalk = JSON.parse(JSON.stringify(E["mini-band-defensive-shuffle"].diagram));
  bandWalk.title = "Lateral steps, monster walks, then squats";
  bandWalk.caption = "Keep the mini-band above the knees. Step sideways each way, move forward and backward with the feet apart, then finish with stationary banded squats.";
  bandWalk.paths = [
    { from: [3.5, 5], to: [5.5, 5], kind: "move", motionId: "mini-band", actor: "band-shuffler", label: "lateral steps right", stepIndices: [1], sequenceOrder: 0 },
    { from: [5.5, 5], to: [3.5, 5], kind: "move", motionId: "mini-band", actor: "band-shuffler", label: "lateral steps left", stepIndices: [1], sequenceOrder: 1 },
    { from: [3.5, 5], to: [3.5, 3.4], kind: "move", motionId: "mini-band", actor: "band-shuffler", label: "monster walk forward", stepIndices: [2], sequenceOrder: 0 },
    { from: [3.5, 3.4], to: [3.5, 5], kind: "move", motionId: "mini-band", actor: "band-shuffler", label: "monster walk backward", stepIndices: [2], sequenceOrder: 1 }
  ];
  E["mini-band-lateral-walks"] = { diagram: bandWalk };

  // Dead Fish is a serve, move-to-receiving-court, rescue, return sequence.
  // The waiting target is a real athlete, not an abstract scoring rectangle.
  var fishServe = E["dead-fish-serving"].diagram;
  fishServe.title = "Both teams serve together";
  fishServe.stepIndices = [0];
  fishServe.caption = "Three servers on each side each hold a ball. On go, both teams serve across the net together; each team has a refill basket beside its end line.";
  fishServe.exampleNote = "Example: two teams of three. Place each refill basket outside the sideline, leaving the end-line serving lanes clear.";
  fishServe.props = [
    { type: "ball-cart", x: -.65, y: 11.3, w: .65, h: .65, label: "Team A refill basket" },
    { type: "ball-cart", x: 9.65, y: .7, w: .65, h: .65, label: "Team B refill basket" }
  ];
  fishServe.players = Array.from({ length: 6 }, function (_, index) {
    return { id: "fish-player-" + (index + 1), role: "server " + (index + 1),
      label: (index < 3 ? "A" : "B") + (index % 3 + 1), team: index < 3 ? "a" : "b",
      x: [1.5, 4.5, 7.5][index % 3], y: index < 3 ? 12.5 : -.5,
      facing: index < 3 ? "north" : "south", ball: true };
  });
  fishServe.zones = [];
  fishServe.paths = fishServe.players.map(function (player, index) {
    return { from: [player.x, player.y], to: [player.x, index < 3 ? 2.8 : 9.2], kind: "serve",
      fromActor: player.id, toEndpoint: "floor", label: "serve together",
      sequenceOrder: 0, simultaneousGroup: "fish-serving-round", stepIndices: [0] };
  });
  var fishMiss = JSON.parse(JSON.stringify(fishServe));
  fishMiss.title = "A miss moves the player to the far court";
  fishMiss.stepIndices = [1];
  fishMiss.caption = "After a missed serve, that player walks around the outside of the court to the receiving side, then lies down as a dead fish. Other servers wait while the player gets into place.";
  fishMiss.paths = [{ from: [7.5, 12.5], via: [[10, 12.5], [10, 2.3]], to: [6.8, 2.3],
    kind: "move", actor: "fish-player-3", label: "miss → receiving court", stepIndices: [1], sequenceOrder: 0 }];
  var fishRescue = JSON.parse(JSON.stringify(fishServe));
  fishRescue.title = "Land a serve nearby, then return";
  fishRescue.stepIndices = [2, 3];
  fishRescue.caption = "A3 lies on the receiving court while the three opposing servers remain at their far end line. Teammate A2 lands a serve nearby to rescue A3, who gets up and returns around the sideline. Continue for the chosen time and compare players standing.";
  fishRescue.players[2].x = 6.8;
  fishRescue.players[2].y = 2.3;
  fishRescue.players[2].posture = "supine";
  fishRescue.players[2].role = "dead fish awaiting rescue";
  fishRescue.players[2].ball = false;
  fishRescue.players[2].note = "lies on the receiving court until a serve lands nearby";
  fishRescue.zones = [{ x: 5.25, y: 1.55, w: 1.2, h: 1.5, tone: "target", label: "Land near A3" }];
  fishRescue.paths = [
    { from: [4.5, 12.5], to: [5.85, 2.3], kind: "serve", fromActor: "fish-player-2",
      toEndpoint: "floor", label: "serve lands nearby · rescue", stepIndices: [2], sequenceOrder: 0 },
    { from: [6.8, 2.3], via: [[10, 2.3], [10, 12.5]], to: [7.5, 12.5], kind: "move",
      actor: "fish-player-3", label: "rescued → serving group", stepIndices: [2, 3], sequenceOrder: 1 }
  ];
  E["dead-fish-serving"].diagrams = [fishServe, fishMiss, fishRescue];
  delete E["dead-fish-serving"].diagram;

  var pasture = {
    title: "Cross together while tapping each balloon", coordinateSystem: "metric", w: 10, h: 8,
    stepIndices: [0],
    caption: "Four shepherds cross together while keeping their balloons up. Three sheepdogs wait in the pasture and try to tap a balloon away without grabbing.",
    exampleNote: "Example 8 × 6 m cone-marked pasture with four shepherds and three sheepdogs; adjust the area to the group.",
    zones: [{ x: 1, y: 1, w: 8, h: 6, label: "PASTURE", tone: "good" }],
    cones: [{ x: 1, y: 1 }, { x: 9, y: 1 }, { x: 1, y: 7 }, { x: 9, y: 7 }],
    players: [], paths: [], legend: [{ tone: "a", text: "Shepherds with balloons" }, { tone: "b", text: "Sheepdogs without balloons" }]
  };
  [1.5, 3.1, 4.7, 6.3].forEach(function (y, index) {
    pasture.players.push({ id: "shepherd-" + (index + 1), x: 1.5, y: y, label: "S" + (index + 1), team: "a", role: "shepherd", balloon: true, facing: "east" });
    pasture.paths.push({ from: [1.5, y], to: [7.5, y], kind: "move", actor: "shepherd-" + (index + 1),
      motionId: "set", label: "walk across while tapping balloon", stepIndices: [0], sequenceOrder: 0, simultaneousGroup: "pasture-crossing" });
    pasture.paths.push({ from: [1.5, y], to: [1.5, y], kind: "ball", object: "balloon", motionId: "set",
      fromActor: "shepherd-" + (index + 1), toActor: "shepherd-" + (index + 1),
      label: "tap own balloon overhead", stepIndices: [0], sequenceOrder: 0, simultaneousGroup: "pasture-crossing" });
  });
  [[4.3, 2.1], [5.3, 3.9], [6.3, 5.5]].forEach(function (point, index) {
    pasture.players.push({ id: "sheepdog-" + (index + 1), x: point[0], y: point[1], label: "D" + (index + 1), team: "b", role: "sheepdog", balloon: false });
  });
  var pastureTap = JSON.parse(JSON.stringify(pasture));
  pastureTap.title = "A sheepdog taps one balloon away";
  pastureTap.stepIndices = [1];
  pastureTap.caption = "Sheepdog D2 approaches S2 and taps the balloon away with an open hand. No grabbing. The other shepherds keep their balloons up.";
  pastureTap.players.forEach(function (player) { if (player.team === "a") player.x = 5.1; });
  pastureTap.players[1].balloon = "lost";
  pastureTap.players[5].facing = "west";
  pastureTap.paths = [
    { from: [5.3, 3.9], to: [5.55, 3.25], kind: "move", actor: "sheepdog-2", motionId: "sprint", label: "approach balloon", stepIndices: [1], sequenceOrder: 0 },
    { from: [5.55, 3.25], to: [5.55, 3.25], kind: "move", actor: "sheepdog-2", motionId: "set", label: "open-hand balloon tap · no grabbing", stepIndices: [1], sequenceOrder: 1 }
  ];
  [0, 2, 3].forEach(function (index) {
    var player = pastureTap.players[index];
    pastureTap.paths.push({ from: [player.x, player.y], to: [player.x, player.y], kind: "ball", object: "balloon", motionId: "set",
      fromActor: player.id, toActor: player.id, label: "keep tapping own balloon while dog acts",
      stepIndices: [1], sequenceOrder: 0, simultaneousGroup: "ongoing-balloon-control" });
  });
  var pastureConvert = JSON.parse(JSON.stringify(pastureTap));
  pastureConvert.title = "Lost balloon joins the dogs; reset the round";
  pastureConvert.stepIndices = [2, 3];
  pastureConvert.caption = "S2 loses their balloon and joins the sheepdogs in the middle. The three remaining shepherds finish their crossing. When only a few remain, everyone walks back, collects a balloon as assigned, and starts a new round.";
  pastureConvert.players[1].team = "b";
  pastureConvert.players[1].role = "new sheepdog after losing balloon";
  pastureConvert.players[1].label = "D4";
  pastureConvert.players[1].balloon = false;
  pastureConvert.players[5].x = 5.55;
  pastureConvert.players[5].y = 3.25;
  pastureConvert.paths = [{ from: [5.1, 3.1], to: [4.3, 3.4], kind: "move", actor: "shepherd-2", motionId: "sprint", label: "become a sheepdog", stepIndices: [2], sequenceOrder: 0 }];
  [0, 2, 3].forEach(function (index) {
    var player = pastureConvert.players[index];
    pastureConvert.paths.push({ from: [5.1, player.y], to: [7.5, player.y], kind: "move", actor: player.id,
      motionId: "set", label: "remaining shepherd finishes crossing", stepIndices: [2], sequenceOrder: 0, simultaneousGroup: "remaining-crossing" });
  });
  pastureConvert.players.forEach(function (player, index) {
    var start = index < 4 ? [index === 1 ? 4.3 : 7.5, index === 1 ? 3.4 : player.y] : [player.x, player.y];
    var home = pasture.players[index];
    pastureConvert.paths.push({ from: start, to: [home.x, home.y], kind: "move", actor: player.id,
      motionId: "sprint", label: "reset round and reassign balloons", stepIndices: [3], sequenceOrder: 0, simultaneousGroup: "pasture-reset" });
  });
  E["shepherd-and-sheep"].diagrams = [pasture, pastureTap, pastureConvert];

  var amoeba = E["amoeba-team-game"].diagram;
  amoeba.title = "Every teammate touches before returning over";
  amoeba.caption = "In this four-player example, all four teammates catch and pass before the fourth sends the ball over. The other team repeats all four touches. Agree the required count, progress to bumps and sets, and score the agreed clean-teamwork bonus.";
  amoeba.players.forEach(function (player, index) {
    player.id = "amoeba-player-" + (index + 1);
    player.label = (index < 4 ? "B" : "A") + (index % 4 + 1);
    player.role = "teammate " + player.label;
  });
  var amoebaOrder = [6, 4, 7, 5, 2, 0, 3, 1, 6];
  amoeba.paths = amoebaOrder.slice(0, -1).map(function (source, index) {
    var from = amoeba.players[source], to = amoeba.players[amoebaOrder[index + 1]];
    return { from: [from.x, from.y], to: [to.x, to.y], kind: "ball", fromActor: from.id, toActor: to.id,
      label: (index % 4 === 3 ? "fourth touch over net" : "catch and pass to teammate " + (index % 4 + 2)),
      sequenceOrder: index, stepIndices: [1, 2, 3] };
  });
  delete amoeba.contacts;
  amoeba.stepIndices = [0, 1];
  amoeba.chains = [amoeba.paths.map(function (_, index) { return index; })];
  amoeba.paths.forEach(function (path) { path.motionId = "feed"; path.stepIndices = [1]; });
  var amoebaProgression = JSON.parse(JSON.stringify(amoeba));
  amoebaProgression.stepIndices = [2];
  amoebaProgression.title = "From catch-and-pass to bumps and sets";
  amoebaProgression.paths.forEach(function (path, index) {
    path.stepIndices = [2];
    path.motionId = index < 4 ? "feed" : index % 2 ? "set" : "pass";
    path.label = (index % 4 === 3 ? "fourth touch over net" : path.motionId === "feed" ? "catch and toss to teammate" : path.motionId + " to teammate");
  });
  var amoebaScoring = JSON.parse(JSON.stringify(amoebaProgression));
  amoebaScoring.stepIndices = [3];
  amoebaScoring.title = "All-player rally and teamwork bonus";
  amoebaScoring.paths.forEach(function (path, index) {
    path.stepIndices = [3]; path.motionId = index % 2 ? "set" : "pass";
  });
  E["amoeba-team-game"].diagrams = [amoeba, amoebaProgression, amoebaScoring];
  delete E["amoeba-team-game"].diagram;

  var fourSquare = E["four-square-volleyball"].diagram;
  fourSquare.stepIndices = [0, 1];
  fourSquare.title = "Square one starts the rally";
  fourSquare.coordinateSystem = "metric";
  [1, 2, 4, 3].forEach(function (square, index) {
    fourSquare.players[index].id = "square-player-" + square;
    fourSquare.players[index].label = String(square);
    fourSquare.players[index].role = "player in square " + square;
  });
  fourSquare.paths[0].fromActor = "square-player-1";
  fourSquare.paths[0].toActor = "square-player-3";
  fourSquare.paths[0].label = "soft underhand pass from square 1";
  var squareOrder = [0, 3, 1, 2, 0];
  fourSquare.paths = squareOrder.slice(0, -1).map(function (source, index) {
    var from = fourSquare.players[source], to = fourSquare.players[squareOrder[index + 1]];
    return { from: [from.x, from.y], to: [to.x, to.y], fromActor: from.id, toActor: to.id,
      kind: "ball", motionId: index % 2 ? "set" : "pass", sequenceOrder: index,
      stepIndices: index ? [1] : [0, 1], label: index ? (index % 2 ? "set" : "bump") + " to another square" : "soft underhand pass from square 1" };
  });
  fourSquare.chains = [[0, 1, 2, 3]];
  var squareRotate = JSON.parse(JSON.stringify(fourSquare));
  squareRotate.stepIndices = [2];
  delete squareRotate.chains;
  squareRotate.title = "Error to four; others move up";
  squareRotate.caption = "Example: player 2 makes the error and moves around the boundary into square 4. Player 3 moves up to square 2 and player 4 moves up to square 3; player 1 holds. Keep the waiting-line rotation continuous when extra players are available.";
  squareRotate.paths = [
    { from: [5.9, 2.1], via: [[7.8, 2.1], [7.8, 7.8], [2.1, 7.8]], to: [2.1, 5.9],
      kind: "move", actor: "square-player-2", playerIndex: 1, label: "error → square 4", sequenceOrder: 0, simultaneousGroup: "square-rotation", stepIndices: [2, 3] },
    { from: [5.9, 5.9], to: [5.9, 2.1], kind: "move", actor: "square-player-3", playerIndex: 3,
      label: "square 3 → square 2", sequenceOrder: 0, simultaneousGroup: "square-rotation", stepIndices: [2, 3] },
    { from: [2.1, 5.9], to: [5.9, 5.9], kind: "move", actor: "square-player-4", playerIndex: 2,
      label: "square 4 → square 3", sequenceOrder: 0, simultaneousGroup: "square-rotation", stepIndices: [2, 3] }
  ];
  var squareWaiting = JSON.parse(JSON.stringify(squareRotate));
  squareWaiting.stepIndices = [3];
  squareWaiting.title = "Rotate a waiting player into square four";
  squareWaiting.caption = "After the error rotation, a waiting player takes square four and the outgoing player joins the waiting line. The other players keep their new squares and the next rally starts from square one.";
  squareWaiting.players[1].x = 2.1; squareWaiting.players[1].y = 5.9;
  squareWaiting.players[3].x = 5.9; squareWaiting.players[3].y = 2.1;
  squareWaiting.players[2].x = 5.9; squareWaiting.players[2].y = 5.9;
  squareWaiting.players.push({ id: "square-waiting", x: 1.2, y: 8.5, label: "Next", team: "a", role: "waiting player" });
  squareWaiting.paths = [
    { from: [2.1, 5.9], via: [[.1, 5.9], [.1, 8.5]], to: [2.6, 8.5], kind: "move", motionId: "sprint", actor: "square-player-2", label: "join waiting line", stepIndices: [3], sequenceOrder: 0 },
    { from: [1.2, 8.5], to: [2.1, 5.9], kind: "move", motionId: "sprint", actor: "square-waiting", label: "next player enters square four", stepIndices: [3], sequenceOrder: 1 }
  ];
  E["four-square-volleyball"].diagrams = [fourSquare, squareRotate, squareWaiting];
  delete E["four-square-volleyball"].diagram;

  function metricLadderScene(lateral) {
    var scene = {
      title: lateral ? "Sideways through each rung, then return" : "Complete one footwork pattern, sprint out, return",
      caption: lateral ? "Face sideways to the ladder. Lead and follow into and out of each rung, return in the other direction, then use the two-in/one-out pattern. Finish with three lateral steps past the end." : "Take each saved pattern through all eight rung spaces: two feet in, in-in/out-out, icky shuffle, then hopscotch. Finish each trip with three quick steps out, then jog around the outside to reset.",
      coordinateSystem: "metric", w: 9, h: 8,
      exampleNote: "Example ladder: eight 0.5 m rung spaces, 0.64 m wide. Steps are sampled to the rung spacing; adapt the ladder to the athlete.",
      players: [{ id: "ladder-athlete", x: 4.5, y: 5.9, label: "P", team: "a", role: "ladder athlete", facing: lateral ? "east" : "north" }],
      zones: Array.from({ length: 8 }, function (_, index) {
        return { x: 4.18, y: 1.65 + index * .5, w: .64, h: .5, tone: "neutral", label: "" };
      }),
      paths: [], legend: [{ tone: "neutral", text: "0.5 m rung spaces" }, { tone: "move", text: "Pattern, three-step exit, outside return" }]
    };
    var steps = lateral ? [0, 1, 2] : [0, 1, 2, 3];
    steps.forEach(function (step) {
      var reverse = lateral && step === 1;
      var from = reverse ? [4.5, 1.9] : [4.5, 5.9];
      var to = reverse ? [4.5, 5.9] : [4.5, 1.9];
      scene.paths.push({ from: from, to: to, kind: "move", motionId: "ladder", actor: "ladder-athlete",
        label: lateral ? (step === 2 ? "lateral two-in, one-out" : "lateral in-in, out-out") : ["two feet in every box", "in-in, out-out", "icky shuffle", "hopscotch"][step],
        stepIndices: [step], sequenceOrder: 0 });
    });
    scene.paths.push({ from: [4.5, 1.9], to: [4.5, .25], kind: "move", motionId: lateral ? "shuffle" : "sprint",
      actor: "ladder-athlete", label: "three steps past the last rung", stepCount: 3,
      stepIndices: [lateral ? 3 : 4], sequenceOrder: 1 });
    scene.paths.push({ from: [4.5, .25], via: [[6, .25], [6, 5.9]], to: [4.5, 5.9], kind: "move", motionId: "sprint",
      actor: "ladder-athlete", label: "jog around outside to reset", stepIndices: [lateral ? 3 : 4], sequenceOrder: 2 });
    return scene;
  }
  E["agility-ladder-footwork"] = { diagram: metricLadderScene(false) };
  E["ladder-lateral-quicksteps"] = { diagram: metricLadderScene(true) };

  // ---- HOOPS / TARGETS ------------------------------------------------------

  // Servers fire across the net into hoops in the deep corners and the seam.
  E["serve-into-the-hoops"] = {
    diagram: dk.serveTargets({
      servers: 3,
      zones: [
        { x: 0.5, y: 0.6, w: 2.4, h: 2.4, tone: "target", label: "deep 1" },
        { x: 6.1, y: 0.6, w: 2.4, h: 2.4, tone: "target", label: "deep 5" },
        { x: 3.3, y: 1.1, w: 2.4, h: 2.0, tone: "target", label: "seam" }
      ],
      caption: "Hoops sit in the deep corners and the middle seam. Servers CALL a hoop, then serve to land in or on it. Track makes out of 10 and move the 'hot' hoop each round."
    })
  };

  // The competitive version: numbered hoops worth different points.
  E["target-serve-challenge"] = {
    diagram: dk.serveTargets({
      servers: 3,
      zones: [
        { x: 0.5, y: 0.6, w: 2.3, h: 2.3, tone: "good", label: "5 pts" },
        { x: 6.2, y: 0.6, w: 2.3, h: 2.3, tone: "good", label: "5 pts" },
        { x: 3.3, y: 0.9, w: 2.4, h: 2.0, tone: "target", label: "3 pts" }
      ],
      aim: 0,
      caption: "Example hoop values: the deep corners are worth 5 and the seam is worth 3. Call a hoop before serving; a make claims that hoop's points. Take turns and race to a chosen score, such as 15, or beat a personal total. Reset and rerun."
    })
  };

  // Server feeds a passer who plays a high pass into a hoop at the setter target.
  E["pass-to-the-hoop-target"] = {
    diagram: dk.feedLine({
      net: 6,
      feederLabel: "S", feederNote: "server behind end line", feederY: 0.35, feederTeam: "b",
      activeLabel: "P", action: "high pass to hoop",
      targetObject: "ring", queue: 0,
      moveTo: [4.5, 0.65], moveLabel: "rotate roles after 10",
      court: [{ x: 0, y: 0.8, w: 9, h: 10.2 }],
      caption: "A hoop sits on the floor at the setter's target in right-front. The server sends a ball over; the passer plays a high, soft pass that drops into the hoop's airspace. Count passes that find the hoop, then rotate."
    })
  };

  // Setter delivers through hoops at the outside pin and the back-set pin.
  E["setter-hoop-stations"] = {
    diagram: {
      caption: "Hoops mark the outside set (left pin) and the back-set (right pin) at set height along the net. A tosser feeds the setter, who delivers through the CALLED hoop. Alternate front and back; track makes to each.",
      w: 9, h: 9, net: 2, lines: [{ y: 5.2 }],
      court: [{ x: 0, y: 0, w: 9, h: 9 }],
      zones: [
        { x: 0.5, y: 2.3, w: 2.2, h: 1.7, tone: "target", label: "outside", elevation: 2.6, vertical: true, diameterMeters: 1 },
        { x: 6.3, y: 2.3, w: 2.2, h: 1.7, tone: "target", label: "back-set", elevation: 2.6, vertical: true, diameterMeters: 1 }
      ],
      players: [
        { x: 4.5, y: 6.6, label: "C", team: "coach", note: "tosses" },
        { x: 5.6, y: 4.2, label: "St", team: "a", note: "setter" }
      ],
      paths: [
        { from: [4.5, 6.2], to: [5.6, 4.6], kind: "ball", label: "toss", curve: 0.18 },
        { from: [5.3, 4], to: [1.7, 3.2], kind: "ball", label: "front set", curve: 0.3 },
        { from: [5.9, 4], to: [7.3, 3.2], kind: "ball", label: "back set", curve: -0.3 }
      ],
      legend: [{ tone: "target", text: "Aim here" }, { tone: "coach", text: "Feeder" }, { tone: "a", text: "Setter" }]
    }
  };

  // Hitter approaches and swings to land in hoops on the far court.
  E["hit-the-target-zones"] = {
    diagram: {
      caption: "Hoops lie on the FAR court at the deep line, deep cross, and the sharp cross angle. A setter feeds the pin; the hitter approaches and swings to land the ball in the CALLED hoop. Score makes out of 10; rotate the live target.",
      w: 9, h: 9.4, net: 2,
      court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
      zones: [
        { x: 0.5, y: 0.4, w: 2.2, h: 1.4, tone: "target", label: "deep line" },
        { x: 6.3, y: 0.4, w: 2.2, h: 1.4, tone: "target", label: "deep cross" },
        { x: 5.7, y: 2.5, w: 2.5, h: 1.3, tone: "target", label: "sharp X" }
      ],
      players: [
        { x: 2, y: 8.4, label: "H", team: "a", note: "start" },
        { x: 5.4, y: 3, label: "St", team: "a", note: "setter" }
      ],
      paths: [
        { from: [2, 8], to: [2.4, 4.2], kind: "move", label: "approach", curve: 0.1 },
        { from: [5.4, 3], to: [2.7, 3.4], kind: "ball", label: "set", curve: 0.2 },
        { from: [2.7, 3], to: [7.4, 1.1], kind: "serve", label: "swing to hoop", curve: 0.12 }
      ],
      legend: [{ tone: "target", text: "Target hoops" }, { tone: "a", text: "Hitter + setter" }]
    }
  };

  // ---- TUMBLING MATS (pursuit / dive defense) -------------------------------

  // Defender explodes onto a short ball and sprawls onto a safe mat.
  E["mat-sprawl-and-pursuit"] = {
    diagram: {
      caption: "A mat lies in front of the defender as a safe landing zone. The tosser drops a SHORT ball just in front; the defender explodes forward, gets a hand or platform under it, and sprawls onto the mat — then pops straight up.",
      w: 9, h: 10, net: 2.2, lines: [{ y: 5.2 }],
      court: [{ x: 0, y: 2.2, w: 9, h: 7.4 }],
      zones: [{ x: 3.3, y: 5.5, w: 2.4, h: 1.8, tone: "good", label: "MAT" }],
      players: [
        { x: 4.5, y: 0.9, label: "C", team: "coach", note: "drops it short" },
        { x: 4.5, y: 8.6, label: "D", team: "a", note: "defender" }
      ],
      paths: [
        { from: [4.5, 1.4], to: [4.5, 5.3], kind: "ball", label: "short tip", curve: 0.1 },
        { from: [4.5, 8.2], to: [4.5, 6.6], kind: "move", label: "explode + sprawl", curve: 0 }
      ],
      legend: [{ tone: "coach", text: "Tosser" }, { tone: "a", text: "Defender" }, { tone: "good", text: "Mat (land here)" }]
    }
  };

  // Full-extension dive learned safely on the mat (older players).
  E["mat-diving-extension"] = {
    diagram: {
      caption: "For older players: the mat is the safe place to learn the full extension dive (pancake). A coach rolls or tosses a ball just out of reach; the player extends, slides a hand under it, and lands soft on the mat. Keep reps low and clean.",
      w: 9, h: 9.6,
      zones: [{ x: 3, y: 3.4, w: 3, h: 2.4, tone: "good", label: "MAT" }],
      players: [
        { x: 4.5, y: 1, label: "C", team: "coach", note: "tosses just short" },
        { x: 4.5, y: 7.8, label: "P", team: "a", note: "extends + dives" }
      ],
      paths: [
        { from: [4.5, 1.5], to: [4.6, 3.5], kind: "ball", label: "just out of reach", curve: 0.1 },
        { from: [4.5, 7.4], to: [4.6, 5.6], kind: "move", label: "extend to the mat", curve: 0 }
      ],
      legend: [{ tone: "coach", text: "Tosser" }, { tone: "a", text: "Diver" }, { tone: "good", text: "Mat" }]
    }
  };

  // ---- LADDER / REACTION (movement + read) ----------------------------------

  // Quick ladder feet flowing straight into a read-and-dig.
  E["ladder-to-dig-reaction"] = {
    diagram: {
      caption: "The ladder points at a tosser. The player runs a quick two-feet-per-box pattern, and as they clear the last box the tosser puts a ball just left or right. They break to it and dig to a target, then jog back.",
      coordinateSystem: "metric", w: 9, h: 9,
      zones: dk.spread(6, 0, 0).map(function (_, i) {
        return { x: 4.18, y: 4.4 + i * 0.5, w: 0.64, h: 0.5, tone: "neutral", label: "" };
      }),
      players: [
        { x: 4.5, y: 1.2, label: "C", team: "coach", note: "tosses L or R" },
        { id: "ladder-digger", x: 4.5, y: 7.65, label: "P", team: "a", note: "runs ladder" },
        { x: 7.4, y: 4.6, label: "T", team: "a", note: "dig target" }
      ],
      paths: [
        { from: [4.5, 7.65], to: [4.5, 4.65], kind: "move", motionId: "ladder", label: "two feet per rung", playerIndex: 1, actor: "ladder-digger", stepIndices: [1], sequenceOrder: 0 },
        { from: [4.5, 1.6], to: [6.3, 4.0], kind: "ball", label: "ball wide", curve: 0.2, stepIndices: [2, 3], sequenceOrder: 1 },
        { from: [6.3, 4.0], to: [7, 4.6], kind: "ball", label: "dig to target", curve: 0.25, stepIndices: [3], sequenceOrder: 3 },
        { from: [4.5, 4.65], to: [6.1, 4.2], kind: "move", motionId: "shuffle", label: "break to the wide ball", actor: "ladder-digger", stepIndices: [3], sequenceOrder: 2 },
        { from: [6.1, 4.2], via: [[6.5, 5.2], [6.5, 7.65]], to: [4.5, 7.65], kind: "move", motionId: "sprint", label: "jog outside ladder to reset", actor: "ladder-digger", stepIndices: [3], sequenceOrder: 4 }
      ],
      legend: [{ tone: "neutral", text: "Ladder" }, { tone: "coach", text: "Tosser" }, { tone: "a", text: "Player + target" }]
    }
  };

  var ladderStart = E["ladder-to-dig-reaction"].diagram;
  ladderStart.stepIndices = [0, 1];
  var ladderFeed = JSON.parse(JSON.stringify(ladderStart));
  ladderFeed.stepIndices = [2];
  ladderFeed.title = "Read the feed at the ladder exit";
  ladderFeed.players[1].x = ladderStart.paths[0].to[0];
  ladderFeed.players[1].y = ladderStart.paths[0].to[1];
  var ladderReaction = JSON.parse(JSON.stringify(ladderFeed));
  ladderReaction.stepIndices = [3];
  ladderReaction.title = "Move, dig to target, and return outside the ladder";
  E["ladder-to-dig-reaction"].diagrams = [ladderStart, ladderFeed, ladderReaction];
  delete E["ladder-to-dig-reaction"].diagram;

  // Partner reaction scramble: feeder bounces, defender reads low and catches.
  E["reaction-ball-scramble"] = {
    diagram: {
      caption: "The defender sets up low and ready. The feeder bounces the lumpy reaction ball hard toward them; they read the crazy bounce, move their feet, and catch it low with two hands. Short bursts, then switch jobs.",
      w: 9, h: 8,
      players: [
        { x: 3, y: 2.2, label: "F", team: "b", note: "bounces hard" },
        { x: 5.4, y: 5.6, label: "D", team: "a", note: "stays low" }
      ],
      paths: [
        { from: [3.2, 2.6], to: [5, 5], kind: "ball", label: "crazy bounce", curve: 0.32 },
        { from: [5.4, 5.6], to: [4.2, 6.2], kind: "move", label: "scramble + catch low", curve: 0.2 }
      ],
      legend: [{ tone: "b", text: "Feeder" }, { tone: "a", text: "Defender" }, { tone: "move", text: "Read + react" }]
    }
  };

})(window.RR);
