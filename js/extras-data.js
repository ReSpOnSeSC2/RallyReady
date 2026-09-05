// extras-data.js — per-drill organization + diagrams, batch 1 (RR.extras).
//
// Keyed by drill id. Each entry may carry:
//   format  — overrides for RR.format (grouping / flow / tracking / space / aim),
//             written to remove the #1 confusion: is everyone going at once or
//             one at a time, and who keeps the score.
//   diagram — an RR.diagram spec (usually from a RR.dk builder) showing where
//             players stand and where the ball goes.
//
// This file covers serving games, cooperative/ball-control games, and the
// net/court games. Batch 2 (extras-data-2.js) covers the rest + skill drills.
// Split only to honour the <800-line-per-file rule; they share one RR.extras.
window.RR = window.RR || {};
RR.extras = RR.extras || {};

(function (RR) {
  "use strict";
  var dk = RR.dk;
  var E = RR.extras;

  // ---- SERVING GAMES --------------------------------------------------------

  E["serving-streak-challenge"] = {
    format: {
      grouping: "Everyone at once. Each player takes a ball and a spot along the end line — nobody waits in a serving line.",
      flow: "Self-paced: serve, chase your own ball, come back, serve again. You're racing your OWN best streak, not the player next to you.",
      tracking: "Each player counts their own streak out loud or on fingers. A miss = back to zero. The coach calls out the day's top streak to chase, and (for the group game) adds up everyone's personal best at the end.",
      space: "Spread servers across the whole end line so balls don't collide; serve into an open court.",
      aim: "Run 6–8 min. Log each player's best streak so next practice they have a number to beat."
    },
    diagram: dk.serveTargets({
      servers: 4,
      zones: [{ x: 0.6, y: 0.7, w: 7.8, h: 2.6, tone: "target", label: "land it in" }],
      caption: "Servers spread along the end line and all serve at once — each chasing their own streak into the open court."
    })
  };

  E["serving-ladder-game"] = {
    format: {
      grouping: "Two teams take turns serving from the end line.",
      flow: "Serve into the far court. A made serve adds one team point; a miss adds nothing. The next teammate takes a turn.",
      tracking: "Track the two team totals. Optional pressure rule: a miss after a make resets that player's personal streak.",
      aim: "First team to 7 made serves wins; try 10 in the next round."
    },
    diagram: dk.serveTargets({
      servers: 3,
      zones: [{ x: 0, y: 0, w: 9, h: 6, tone: "target", label: "In court = 1 point" }],
      caption: "Two teams take turns serving from the end line. Every made serve adds one team point and a miss adds nothing. First to 7 wins, then reset and try 10."
    })
  };
  (function () {
    var entry = E["serving-ladder-game"];
    var base = { w: 10.4, h: 14.4, net: 6, operation: "rotation", court: [{ x: 0, y: 0, w: 9, h: 12 }],
      zones: [{ x: .4, y: .4, w: 8.2, h: 5.2, tone: "target", label: "In court = +1 team point" },
        { x: 9.2, y: 1, w: .8, h: 2, tone: "neutral", label: "Out = 0" }], players: [], paths: [],
      legend: [{ tone: "a", text: "Team A takes a turn" }, { tone: "b", text: "Team B takes a turn" },
        { tone: "target", text: "Made serve: +1. Miss: +0. First team to 7; next round try 10." }] };
    ["a", "b"].forEach(function (team) {
      var x = team === "a" ? 2.5 : 6.5;
      for (var i = 0; i < 3; i++) base.players.push({ id: "ladder-" + team + "-" + (i + 1),
        x: x + (i === 2 ? (team === "a" ? -.8 : .8) : 0), y: i === 0 ? 12.45 : i === 1 ? 13.25 : 13.95,
        label: team.toUpperCase() + (i + 1), team: team, note: i === 0 ? "current server" : "next teammate" });
    });
    function scene(step, caption) {
      var result = JSON.parse(JSON.stringify(base)); result.stepIndices = [step]; result.caption = caption; return result;
    }
    function serve(scene, team, made, order, label) {
      var x = team === "a" ? 2.5 : 6.5;
      scene.paths.push({ from: [x, 12.45], to: made ? [x, 2] : [9.6, 2], kind: "serve", motionId: "serve",
        fromActor: "ladder-" + team + "-1", toEndpoint: { type: "target", label: made ? "In court: +1 point" : "Out: no point" },
        label: label, stepIndices: scene.stepIndices, sequenceOrder: order });
    }
    var turns = scene(0, "Two teams line up behind the end line. Team A takes a serving turn, then Team B takes a turn; the next teammates wait behind them.");
    serve(turns, "a", true, 0, "Team A takes a turn"); serve(turns, "b", true, 1, "Team B takes a turn");
    var points = scene(1, "Example: Team A lands a serve in the court for one team point. Team B misses beyond the sideline and adds no point.");
    serve(points, "a", true, 0, "Made serve: Team A +1"); serve(points, "b", false, 1, "Miss: Team B +0");
    var win = scene(2, "Example finish: Team A has six points, makes one more serve, and reaches the seven-point goal. Reset the scores and play the next round to ten.");
    serve(win, "a", true, 0, "Example: Team A 6 → 7, wins the round");
    var streak = scene(3, "Optional personal-streak example: the same player first makes a serve, then misses. That player's streak resets to zero; team totals still count made serves.");
    serve(streak, "a", true, 0, "Personal streak: 1 made serve"); serve(streak, "a", false, 1, "Next serve misses: personal streak → 0");
    entry.diagrams = [turns, points, win, streak]; delete entry.diagram;
  })();

  E["around-the-world-serving"] = {
    format: {
      grouping: "Groups of 3 share a ball and one serving spot.",
      flow: "Take turns: serve into zone 1, and if you make it you 'travel' to aim at the next zone. Players rotate serve → shag → wait, so the ball is always live.",
      tracking: "Each player tracks which zone they're on; first to hit every zone 'around the world' wins. The shagger confirms makes.",
      aim: "8–10 min, or until someone completes the lap."
    },
    diagram: dk.serveTargets({
      servers: 1,
      extraPlayers: [
        { x: 7.7, y: 3.9, label: "Sh", team: "n", note: "shags and confirms the zone" },
        { x: 6.5, y: 12.95, label: "Q", team: "n", note: "waits behind end line" }
      ],
      zones: [
        { x: 0.5, y: 0.7, w: 2.4, h: 2.2, tone: "target", label: "1" },
        { x: 0.5, y: 3.3, w: 2.4, h: 2.2, tone: "good", label: "2" },
        { x: 3.3, y: 3.3, w: 2.4, h: 2.2, tone: "good", label: "3" },
        { x: 6.1, y: 3.3, w: 2.4, h: 2.2, tone: "good", label: "4" },
        { x: 6.1, y: 0.7, w: 2.4, h: 2.2, tone: "target", label: "5" },
        { x: 3.3, y: 0.7, w: 2.4, h: 2.2, tone: "target", label: "6" }
      ],
      caption: "One server at a time aims through all six zones, 'travelling around the world'; the group rotates serve → shag → wait after every ball."
    })
  };

  E["knockout-serving-game"] = {
    format: {
      grouping: "Whole group in one line behind the end line, each with a ball.",
      flow: "One at a time (or in quick waves): everyone serves a round. Miss your serve and you're knocked out for that round and step to the side.",
      tracking: "The coach (or a knocked-out player) watches the line and calls misses. Last server standing wins.",
      aim: "Several quick rounds; knocked-out players rejoin each new round so no one sits long."
    },
    diagram: dk.serveTargets({ servers: 5, caption: "Whole line serves each round; a miss knocks you out until one server is left." })
  };

  E["dead-fish-serving"] = {
    format: {
      grouping: "Two teams on opposite sides of the net, each behind its end line. Every player has a ball, with a refill basket nearby.",
      flow: "Everyone serves together. After a miss, move to the receiving court and lie down as a dead fish. A teammate rescues you by landing a serve nearby.",
      tracking: "Track rescues and players still standing. Rescued players return to the serving group.",
      aim: "Keep it light and fast — 6–8 min."
    },
    diagram: dk.serveTargets({ servers: 6, caption: "All servers serve together. A player who misses moves to the receiving court and lies down; a teammate lands a serve near that player to rescue them. Rescued players return to serve. Play for time or compare players standing." })
  };

  E["serving-relay-race"] = {
    format: {
      grouping: "Two or three even teams, each in a line behind the end line with one ball per team.",
      flow: "The front server keeps serving until a serve lands in, shags the ball, hands it to the next teammate, and joins the back of the line.",
      tracking: "Mark each teammate complete only after their made serve. First team with every teammate complete wins.",
      aim: "Finish every teammate's made serve, then re-rack for the next round."
    },
    diagram: {
      caption: "Two three-player relay teams: each front server serves, follows the sideline to shag, returns the ball, tags the next teammate, and joins the back of the same line.",
      w: 9, h: 14, net: 6, operation: "parallel", lines: [{ y: 3 }, { y: 9 }],
      court: [{ x: 0, y: 0, w: 9, h: 12 }],
      zones: [{ x: 0.6, y: 0.7, w: 3.4, h: 2.4, tone: "target", label: "TEAM A" }, { x: 5, y: 0.7, w: 3.4, h: 2.4, tone: "target", label: "TEAM B" }],
      players: [
        { id: "relay-a-server", x: 2.5, y: 12.45, label: "A1", team: "a", role: "team A active server", note: "serves now" },
        { id: "relay-a-next", x: 2.5, y: 13.15, label: "A2", team: "a", role: "team A next server", note: "next" },
        { id: "relay-a-queue", x: 1.65, y: 13.15, label: "A3", team: "a", role: "team A waiting server", note: "waits" },
        { id: "relay-b-server", x: 6.5, y: 12.45, label: "B1", team: "b", role: "team B active server", note: "serves now" },
        { id: "relay-b-next", x: 6.5, y: 13.15, label: "B2", team: "b", role: "team B next server", note: "next" },
        { id: "relay-b-queue", x: 7.35, y: 13.15, label: "B3", team: "b", role: "team B waiting server", note: "waits" }
      ],
      paths: [
        { from: [2.5, 12.1], to: [2.5, 2], kind: "serve", label: "serve A", curve: 0.12,
          fromActor: "relay-a-server", toEndpoint: { type: "target", label: "Team A target" },
          sequenceOrder: 0, simultaneousGroup: "relay-serve" },
        { from: [6.5, 12.1], to: [6.5, 2], kind: "serve", label: "serve B", curve: -0.12,
          fromActor: "relay-b-server", toEndpoint: { type: "target", label: "Team B target" },
          sequenceOrder: 0, simultaneousGroup: "relay-serve" },
        { from: [2.5, 12.45], to: [2, 13.05], via: [[0.55, 8], [0.55, 2], [1.3, 12]],
          kind: "move", label: "shag · tag · back", curve: 0, playerIndex: 0,
          actor: "relay-a-server", sequenceOrder: 1, simultaneousGroup: "relay-return" },
        { from: [6.5, 12.45], to: [7, 13.05], via: [[8.45, 8], [8.45, 2], [7.7, 12]],
          kind: "move", label: "shag · tag · back", curve: 0, playerIndex: 3,
          actor: "relay-b-server", sequenceOrder: 1, simultaneousGroup: "relay-return" }
      ],
      legend: [{ tone: "a", text: "Team A relay" }, { tone: "b", text: "Team B relay" }, { tone: "move", text: "Serve → shag → tag → back" }]
    }
  };
  (function () {
    var entry = E["serving-relay-race"], source = entry.diagram;
    function scene(step, title) {
      var result = JSON.parse(JSON.stringify(source));
      result.stepIndices = [step]; result.title = title; result.paths = [];
      return result;
    }
    function move(target, actor, from, via, to, order, label, carriesBall) {
      target.paths.push({ from: from, via: via || [], to: to, kind: "move", motionId: "sprint", actor: actor,
        carriesBall: !!carriesBall, label: label, stepIndices: target.stepIndices, sequenceOrder: order, simultaneousGroup: "relay-stage-" + order });
    }
    function ball(target, actor, from, to, order, label, recipient) {
      target.paths.push({ from: from, to: to, kind: recipient ? "ball" : "serve", motionId: recipient ? "feed" : "serve",
        fromActor: actor, toActor: recipient, toEndpoint: recipient ? undefined : { type: "target", label: "Made serve" },
        label: label, stepIndices: target.stepIndices, sequenceOrder: order, simultaneousGroup: "relay-stage-" + order });
    }
    var serve = scene(0, "Both front players make a serve");
    var retrieve = scene(1, "Retrieve the ball, return it, and hand off");
    var next = scene(2, "The next teammates complete their turns");
    var reset = scene(3, "Reset both teams for another round");
    ["a", "b"].forEach(function (team) {
      var x = team === "a" ? 2.5 : 6.5, side = team === "a" ? -.65 : 9.65;
      var prefix = "relay-" + team + "-", active = prefix + "server", receiver = prefix + "next", last = prefix + "queue";
      var back = team === "a" ? 1.65 : 7.35;
      ball(serve, active, [x, 12.45], [x, 2], 0, "Team " + team.toUpperCase() + " made serve");
      move(retrieve, active, [x, 12.45], [[side, 12], [side, 2]], [x, 2], 0, "shag the landed ball");
      move(retrieve, active, [x, 2], [[side, 2], [side, 12]], [x, 12.45], 1, "return with the ball", true);
      ball(retrieve, active, [x, 12.45], [x, 13.15], 2, "hand ball to next teammate", receiver);
      move(retrieve, active, [x, 12.45], [[back, 12.7]], [back, 13.95], 3, "join the back of your team");
      move(retrieve, receiver, [x, 13.15], [], [x, 12.45], 4, "next teammate steps to the end line", true);
      next.players.forEach(function (player) {
        if (player.id === active) { player.x = back; player.y = 13.95; player.note = "made serve complete"; }
        if (player.id === receiver) { player.x = x; player.y = 12.45; player.note = "serves next"; }
      });
      ball(next, receiver, [x, 12.45], [x, 2], 0, "second teammate makes a serve");
      move(next, receiver, [x, 12.45], [[side, 12], [side, 2]], [x, 2], 1, "second teammate shags own ball");
      move(next, receiver, [x, 2], [[side, 2], [side, 12]], [x, 12.45], 2, "return to the final teammate", true);
      ball(next, receiver, [x, 12.45], [back, 13.15], 3, "hand ball to final teammate", last);
      move(next, receiver, [x, 12.45], [[x, 13.4]], [x, 13.95], 4, "second teammate joins the back");
      move(next, last, [back, 13.15], [], [x, 12.45], 5, "final teammate steps up", true);
      ball(next, last, [x, 12.45], [x, 2], 6, "final teammate completes the team round");
    });
    retrieve.caption = "Both servers run around their sideline to collect the landed ball, return along the sideline, hand the ball to the next teammate, and join the back. The next players step to the end line.";
    next.caption = "The second teammates make their serves, retrieve and hand off. The final teammates step up and make their serves to complete the team round.";
    reset.caption = "Both teams return to their original lines with one ball each. Clear the court, reset the completed-player count, and begin another round.";
    entry.diagrams = [serve, retrieve, next, reset];
    delete entry.diagram;
  })();

  E["youth-serving-target-game"] = {
    format: {
      grouping: "Players spread along the serving end line, scoring individually or adding scores as a team.",
      flow: "Choose a target, serve, and count that target's points. Collect balls between rounds, then reset and try to beat the previous score.",
      tracking: "Easy targets near the net are worth fewer points; the deep corners are worth more. Agree the values before the round.",
      aim: "Beat the previous individual or team total."
    },
    diagram: dk.serveTargets({
      servers: 3,
      zones: [
        { x: 0.6, y: 0.6, w: 2.8, h: 2.4, tone: "target", label: "5 pts · deep corner", markerKind: "hoop", diameterMeters: 1 },
        { x: 5.6, y: 0.6, w: 2.8, h: 2.4, tone: "target", label: "5 pts · deep corner", markerKind: "hoop", diameterMeters: 1 },
        { x: 3.3, y: 3.7, w: 2.4, h: 1.5, tone: "target", label: "1 pt · easy / near net", markerKind: "hoop", diameterMeters: 1.2 }
      ],
      aim: 2,
      caption: "Example layout: an easy 1-point hoop sits on the far court close to the net; 5-point hoops sit in the two deep corners. Pick a hoop, serve, total the points individually or as a team, then collect and reset for another round. Coaches can change the points and target sizes."
    })
  };
  E["youth-serving-target-game"].diagram.exampleNote = "Example: 1.2 m easy hoop, 1 m deep-corner hoops, worth 1 and 5 points. The saved drill requires easier near targets and higher-value deep corners without prescribing exact dimensions or scores.";

  // ---- COOPERATIVE / BALL-CONTROL GAMES ------------------------------------

  E["cooperative-pass-count"] = {
    format: {
      grouping: "One group of 4–6 in a circle (split into two circles if you have a big squad).",
      flow: "Everyone is in at once. Keep ONE ball alive with legal touches; no one may touch it twice in a row, so players must talk and move.",
      tracking: "It's a single TEAM score — the group counts touches out loud together. A drop resets to zero; the goal is the team's new record.",
      aim: "Beat your group's best streak; 6–8 min."
    },
    diagram: dk.circlePass({ n: 6, caption: "One circle, one ball — count touches together; you can't hit it twice in a row, so call it early." })
  };

  E["hot-potato-ball-control"] = {
    format: {
      grouping: "One circle of 6 (or two circles for a big group).",
      flow: "Everyone in at once. The ball is a 'hot potato' — pass it on fast with a controlled touch; whoever lets it drop does a quick fun forfeit and play restarts.",
      tracking: "Group counts consecutive touches together; the coach can speed it up by calling 'faster!'",
      aim: "Short and snappy — keep the energy high for 5–6 min."
    },
    diagram: dk.circlePass({ n: 6, caption: "Pass the 'hot potato' quickly around the circle with control — keep it moving." })
  };

  E["amoeba-team-game"] = {
    format: {
      grouping: "Two teams on opposite sides of a lowered net.",
      flow: "Agree how many different teammates must touch before the ball goes over. Start with catch-and-pass, then progress to bumps and sets.",
      tracking: "Score like volleyball, adding the agreed bonus when everyone joins the play cleanly.",
      aim: "Keep all teammates involved while building controlled rallies."
    },
    diagram: dk.acrossNet({ teamSize: 4, sequence: "newcomb", caption: "Two teams face each other across a lowered net. In this example, three different teammates catch and pass before throwing over. Agree the required number, then progress to bumps and sets; award the agreed bonus for involving everyone cleanly." })
  };

  E["shepherd-and-sheep"] = {
    format: {
      grouping: "Most players are shepherds with balloons; a few sheepdogs begin in the middle of the cone-marked pasture.",
      flow: "Shepherds cross while keeping their balloons up. Sheepdogs tap balloons away without grabbing; a dropped or tapped-away balloon turns that shepherd into a sheepdog.",
      tracking: "Track the shepherds remaining after each crossing.",
      aim: "When only a few shepherds remain, reset and start another round."
    }
  };

  E["balloon-keep-it-up"] = {
    format: {
      grouping: "Solo or pairs, each with a balloon (ages 8–10).",
      flow: "Everyone at once: keep the balloon up using forearm and overhead touches — the slow float lets brand-new players find the platform and timing.",
      tracking: "Each player/pair counts their own touches and tries to beat it.",
      aim: "Build to 10+ touches without a catch; 5 min."
    }
  };

  // ---- NET / COURT GAMES ----------------------------------------------------

  E["over-the-net-pepper"] = {
    format: {
      grouping: "Pairs, one on each side of the net (use several net spots at once).",
      flow: "Both partners work continuously: dig → set → controlled attack, over and over, keeping one ball alive across the net.",
      tracking: "Cooperative — partners count consecutive good sequences together and try to beat it.",
      aim: "Longest controlled rally; 6–8 min, then switch partners."
    },
    diagram: dk.pairsRows({ pairs: 3, net: true, topLabel: "", botLabel: "", caption: "Partners face off across the net at several spots; keep one controlled ball going dig–set–hit." })
  };

  E["mini-court-cooperative-rally"] = {
    format: {
      grouping: "Pairs across a small/short court (use the area between the attack line and net).",
      flow: "Both players work at once, cooperating to keep the rally going in a tight space — control over power.",
      tracking: "Partners count their longest rally together; it's you-two vs. the rally, not each other.",
      aim: "Beat your rally record; rotate partners every few minutes."
    },
    diagram: dk.pairsRows({ pairs: 2, net: true, topLabel: "", botLabel: "", caption: "Short-court pairs rally cooperatively in a tight space — aim for control, not winners." })
  };

  E["set-and-catch-game"] = {
    format: {
      grouping: "Pairs, a few steps apart (ages 8–12). No net needed.",
      flow: "Everyone works at once: one partner sets, the other catches overhead in 'set hands', freezes to check the shape, then sets it back.",
      tracking: "Partners count clean catches together; the freeze lets them self-correct hand shape.",
      aim: "String together 10 clean sets; 6 min."
    },
    diagram: dk.pairsRows({ pairs: 3, net: false, topLabel: "", botLabel: "", caption: "Partners set and catch overhead, freezing to check hand shape before sending it back." })
  };

  E["one-v-one-short-court"] = {
    format: {
      grouping: "1 vs 1 on a short/narrow court; the rest of the squad pairs up on other net spots or waits to rotate in.",
      flow: "Two players rally head-to-head; winner of the point stays, the other rotates out for a waiting player.",
      tracking: "Players call their own score; coach confirms close calls. Keep games short so lines move.",
      aim: "Quick games to 5; loser rotates, winner defends."
    },
    diagram: dk.acrossNet({ teamSize: 1, courtX0: 2, courtW: 5, wait: 2, sequence: "two-touch", caption: "1v1 on a short court; control the first touch, send the second over, then winner stays while the loser swaps with a waiting player." })
  };

  E["two-v-two-deep-court"] = {
    format: {
      grouping: "Teams of 2 on a full-depth court; extra pairs wait to rotate in.",
      flow: "Both pairs play live rallies; every player touches lots of balls because there's nowhere to hide in a 2v2.",
      tracking: "Pairs call their own score; coach keeps the rotation moving and confirms the winner.",
      aim: "Games to 7–10, winner stays on."
    },
    diagram: dk.acrossNet({ teamSize: 2, wait: 2, sequence: "serve-three", caption: "2v2 over a full court; serve, then require pass → set → attack. Winners stay and a waiting pair rotates in." })
  };

  E["narrow-court-line-battle"] = {
    format: {
      grouping: "Teams of 2 on a NARROW court (one half the usual width); run two narrow courts side by side if space allows.",
      flow: "Both teams play live; the narrow court forces straight-ahead passing and serving rather than wide swings.",
      tracking: "Teams call their own score; first to the target wins the 'line battle'.",
      aim: "Games to 7; rotate the losing team off."
    },
    diagram: dk.acrossNet({ teamSize: 2, courtX0: 2.5, courtW: 4, wait: 2, sequence: "narrow", caption: "2v2 on a narrowed court — every pass, set, attack, and dig stays inside the straight line lane." })
  };

  E["three-v-three-mini-game"] = {
    format: {
      grouping: "Teams of 3 across the net; extra trios wait to rotate in.",
      flow: "Everyone plays at once. Require all three contacts (pass–set–hit) so every player is involved each rally.",
      tracking: "Teams self-score; coach confirms the winner and rotates a fresh trio in.",
      aim: "Games to 11; winner stays."
    },
    diagram: dk.acrossNet({ teamSize: 3, wait: 3, sequence: "serve-three", caption: "3v3 with pass → set → attack required so everyone touches the ball; rotate positions after the rally." })
  };

  E["two-touch-mini-volley"] = {
    format: {
      grouping: "Teams of 2 on a small court (ages 8–12).",
      flow: "Both teams play; a two-touch rule (pass then send) keeps young players moving without the pressure of a perfect set.",
      tracking: "Teams call their own score; coach keeps it upbeat and rotating.",
      aim: "Short games to 5–7."
    },
    diagram: dk.acrossNet({ teamSize: 2, courtX0: 2, courtW: 5, wait: 2, sequence: "two-touch", caption: "Small-court 2v2: control the first touch, then send the required second touch over." })
  };

  E["newcomb-catch-volley"] = {
    format: {
      grouping: "Teams of 3 across the net (ages 8–12).",
      flow: "Everyone plays. The ball is CAUGHT and thrown over (Newcomb style), building rotations and positioning before live contacts are added.",
      tracking: "Teams self-score rally points; coach teaches where to stand between rallies.",
      aim: "Games to 11; progress toward one real contact when ready."
    },
    diagram: dk.acrossNet({ teamSize: 3, wait: 0, sequence: "newcomb", caption: "Newcomb: catch, use up to three teammate passes, then throw over the net; rotate positions after the rally." })
  };

  E["volley-tennis"] = {
    format: {
      grouping: "Teams of 2 on a small court (ages 8–14).",
      flow: "Both teams play; one bounce is allowed before each contact, which gives beginners time to get under the ball.",
      tracking: "Teams call their own score, tennis-style; coach confirms.",
      aim: "Games to 7–11; rotate teams."
    },
    diagram: dk.acrossNet({ teamSize: 2, courtX0: 1.8, courtW: 5.4, wait: 2, sequence: "bounce", caption: "Volley-tennis 2v2: allow one bounce before each touch, use up to three touches, then send the ball over." })
  };

  E["four-v-four-continuous"] = {
    format: {
      grouping: "Teams of 4; if you have extras, they wait on the sideline to sub in.",
      flow: "Continuous play: the coach feeds a new ball the instant a rally ends, so transitions never stop.",
      tracking: "Teams self-score; coach feeds balls and keeps the running total.",
      aim: "Timed 6–8 min blocks, then rotate subs in."
    },
    diagram: dk.acrossNet({ teamSize: 4, wait: 2, sequence: "reentry", caption: "4v4 with three touches; the coach feeds a fresh ball the moment a rally dies, so both teams reset and transition immediately." })
  };

  E["free-ball-mini-game"] = {
    format: {
      grouping: "Teams of 3 across the net; a server/tosser starts each ball.",
      flow: "Everyone plays. The coach tosses an easy 'free ball' to one side; that team must run a clean pass–set–hit, then play it out live.",
      tracking: "Teams self-score; coach decides which side gets the free ball and keeps score.",
      aim: "Games to 11; alternate which side receives the free ball."
    },
    // A purpose-built picture (not the generic across-net standoff): the coach
    // tosses a free ball to ONE side, which runs a clean pass→set→hit while the
    // other side defends — the whole point of the drill, at a glance.
    diagram: {
      caption: "The coach tosses an easy free ball to one side; that team runs a clean pass→set→hit, then plays it out live 3v3.",
      w: 9, h: 12, net: 6, lines: [{ y: 3 }, { y: 9 }],
      court: [{ x: 0, y: 0, w: 9, h: 12 }],
      players: [
        { x: 2.3, y: 4.3, label: "", team: "b" },
        { x: 6.7, y: 4.3, label: "", team: "b" },
        { x: 4.5, y: 2.5, label: "", team: "b" },
        { x: 4.5, y: 9.3, label: "P", team: "a" },
        { x: 6.6, y: 7.0, label: "S", team: "a" },
        { x: 2.6, y: 7.1, label: "H", team: "a" },
        { x: 8.0, y: 1.0, label: "C", team: "coach", note: "tosses" }
      ],
      paths: [
        { from: [7.7, 1.3], to: [4.7, 8.9], kind: "serve", label: "free ball", curve: 0.3 },
        { from: [4.6, 9.0], to: [6.3, 7.2], kind: "ball", label: "pass", curve: 0.25 },
        { from: [6.4, 6.8], to: [3.0, 7.0], kind: "ball", label: "set", curve: 0.3 },
        { from: [2.8, 6.8], to: [5.0, 3.4], kind: "serve", label: "attack", curve: 0.12 }
      ],
      legend: [
        { tone: "a", text: "Your side (P→S→H)" },
        { tone: "b", text: "Other side" },
        { tone: "coach", text: "Coach (free ball)" }
      ]
    }
  };

  E["beat-the-number-team-challenge"] = {
    format: {
      grouping: "Two teams of 3 across the net (cooperative target version).",
      flow: "Everyone plays, but both sides COOPERATE to reach a target number of successful crossings of the net without an error.",
      tracking: "Single shared count for both teams together; a fault resets it. Coach calls the count.",
      aim: "Beat the team's best number of clean rallies."
    },
    diagram: dk.acrossNet({ teamSize: 3, sequence: "cooperative", caption: "Both sides cooperate, count every clean crossing, and build to three controlled touches per side." })
  };

})(window.RR);
