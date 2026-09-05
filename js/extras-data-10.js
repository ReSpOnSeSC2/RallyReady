// extras-data-10.js — WARMUP drill diagrams (RR.extras).
//
// One entry per warmup drill WHERE a floor layout, movement path, or formation
// actually clarifies the setup. Dynamic warmups that travel down the court use a
// `diagrams: [...]` sequence (each spec carries a `title`, shown as a step
// heading) so each phase is pictured; simple one-pattern warmups use a single
// `diagram`. Purely stationary work (band shoulder prep, arm circles, jump rope,
// in-place mobility) gets NO diagram — those are omitted on purpose, since a
// court drawing would invent positioning that isn't there.
//
// Mirrors the passing exemplar (extras-data-3.js): IIFE wrapper, dk builders,
// near/start side at the BOTTOM, two small local helpers for the shapes warmups
// repeat most (a partner row, a cone-box reaction).
window.RR = window.RR || {};
RR.extras = RR.extras || {};

(function (RR) {
  "use strict";
  var dk = RR.dk;
  var E = RR.extras;

  // A single partner working face-to-face a short distance apart, ball passing
  // between them. Near player (a) at the bottom, partner (b) at the top.
  function partner(o) {
    o = o || {};
    return {
      title: o.title, caption: o.caption, w: 6, h: 7.6,
      players: [
        { x: 3, y: 1.6, label: o.top || "B", team: "b", note: o.topNote || "partner" },
        { x: 3, y: 6, label: o.bot || "A", team: "a", note: o.botNote || "you" }
      ],
      paths: [
        { from: [3.4, 5.6], to: [3.4, 2], kind: o.kind || "ball", label: o.up || "pass", curve: 0.28 },
        { from: [2.6, 2], to: [2.6, 5.6], kind: o.kind || "ball", label: o.down || "back", curve: 0.28 }
      ]
    };
  }

  // A player centered in a four-cone box, reacting out to a called corner and
  // back to the middle. Used by the quick-feet reaction warmups.
  function coneBox(o) {
    o = o || {};
    return {
      title: o.title, caption: o.caption, w: 9, h: 9,
      cones: [{ x: 1.8, y: 1.8 }, { x: 7.2, y: 1.8 }, { x: 7.2, y: 7.2 }, { x: 1.8, y: 7.2 }],
      players: [{ x: 4.5, y: 4.5, label: o.label || "P", team: "a", note: o.note || "start centered" }]
        .concat(o.caller ? [{ x: 4.5, y: 0.6, label: "C", team: "coach", note: "calls a corner" }] : []),
      paths: [
        { from: [4.5, 4.5], via: [[2.2, 2.2]], to: [4.5, 4.5], kind: "move", label: o.label1 || "called corner → touch → recover", curve: 0.1, playerIndex: 0 }
      ],
      legend: [{ tone: "move", text: "React & recover" }]
    };
  }

  // Keep every plotted lane athlete on one factual down/back route. Separate
  // outbound and return paths render as simultaneous duplicate movers, so a
  // round trip is authored as one continuous path with an explicit actor.
  function movementLanes(o) {
    o = o || {};
    var spec = dk.lanes(o);
    spec.paths = (spec.players || []).map(function (player, index) {
      var x = player.x;
      var path = {
        from: [x, 9], to: [x, 1.4], kind: "move", curve: 0,
        label: o.back ? "down → back" : "move this way", playerIndex: index
      };
      if (o.back) {
        path.via = [[x, 1.4], [x + 0.35, 1.6]];
        path.to = [x + 0.35, 9];
      }
      return path;
    });
    return spec;
  }

  // ---- Dynamic movement down the court (multi-phase lane series) ------------

  E["dynamic-movement-warmup"] = {
    diagrams: dk.seq(
      movementLanes({ title: "Easy jog down & back", back: true, caption: "Line up on the end line with room to the attack line. Jog down at an easy pace and back to get the blood moving." }),
      movementLanes({ title: "High knees / butt-kicks", back: true, caption: "Down the floor with high knees, then come back kicking your heels up to your backside." }),
      movementLanes({ title: "Lunges & grapevine", back: true, caption: "Walking lunges down twisting your chest over the front leg, side lunges back. Then grapevine (carioca) facing one sideline down, the other sideline back." }),
      movementLanes({ title: "Build-up runs", caption: "Finish with two or three runs at about three-quarter speed down the floor to wake the legs up." })
    )
  };
  E["dynamic-movement-warmup"].diagrams.forEach(function (scene, sceneIndex) {
    scene.coordinateSystem = "metric";
    scene.paths = [];
    scene.players.forEach(function (player, index) {
      player.id = "dynamic-lane-" + (index + 1);
      player.facing = "north";
      scene.paths.push({ from: [player.x, player.y], to: [player.x, 3.4], kind: "move",
        actor: player.id, label: ["easy jog down", "high knees down", "lunges / carioca down", "three-quarter run down"][sceneIndex],
        sequenceOrder: 0, simultaneousGroup: "warmup-outbound", stepIndices: sceneIndex === 2 ? [2, 3] : [sceneIndex === 3 ? 4 : sceneIndex] });
      if (sceneIndex < 3) scene.paths.push({ from: [player.x, 3.4], to: [player.x, player.y], kind: "move",
        actor: player.id, label: ["easy jog back", "heel kicks back", "side lunges / carioca back"][sceneIndex],
        sequenceOrder: 1, simultaneousGroup: "warmup-return", stepIndices: sceneIndex === 2 ? [2, 3] : [sceneIndex] });
    });
    scene.exampleNote = "Straight 6 m lane from the end line to the attack line. Outbound and return movements are ordered separately so each uses its prescribed footwork.";
  });
  E["animal-movement-warmup"] = {
    diagrams: dk.seq(
      movementLanes({ title: "Bear crawl & crab walk", back: true, caption: "Bear crawl (hands and feet, hips low) down to the line, then crab walk (belly up, push through the heels) back the other way." }),
      movementLanes({ title: "Frog hops & inchworms", caption: "Frog hops down the floor — squat low and hop forward with a soft landing — then finish with inchworms, walking the hands out to a plank and back." })
    )
  };

  // ---- Footwork / agility / reaction movement ------------------------------

  E["agility-ladder-footwork"] = {
    diagram: {
      caption: "Lay a ladder flat. Line up and run a footwork pattern down it — two feet each box, then in-in-out-out sideways, then the icky shuffle, then hopscotch — and SPRINT three steps out of the last box before jogging back to the line.",
      w: 9, h: 11,
      zones: dk.spread(8, 2.2, 2.2).map(function (x, i) { return { x: 3.6, y: 1.2 + i * 0.9, w: 1.8, h: 0.8, tone: "neutral", label: "" }; }),
      players: [{ x: 4.5, y: 9, label: "P", team: "a", note: "line up here" }, { x: 1.6, y: 9.4, label: "", team: "n" }, { x: 1.6, y: 10.1, label: "", team: "n" }],
      paths: [{
        from: [4.5, 8.6], via: [[4.5, 1.4], [4.5, 0.4]], to: [1.9, 9.4],
        kind: "move", label: "footwork → sprint out → back to line", curve: 0,
        playerIndex: 0
      }],
      legend: [{ tone: "neutral", text: "Ladder" }, { tone: "move", text: "Quick feet" }, { tone: "n", text: "Line waits" }]
    }
  };
  E["quadrant-reaction-footwork"] = {
    diagram: coneBox({ caller: true, caption: "Four cones make a small box a couple of steps around the player. Start low and centered; on the coach's call or point, sprint/shuffle to that corner, touch it, and recover to the middle. Mix forward sprints, backpedals, and side shuffles." })
  };
  E["reaction-sprint-starts"] = {
    diagrams: dk.seq(
      {
        title: "Wait for the signal",
        caption: "Work in a pair. The cue partner faces the reacting athlete, who holds a balanced athletic stance and stays loaded without guessing.",
        w: 9, h: 10,
        players: [
          { id: "reaction-caller", x: 4.5, y: 2.15, label: "Cue", team: "b",
            role: "signal partner", facing: "south", note: "clap / whistle / hand drop" },
          { id: "reaction-runner", x: 4.5, y: 8, label: "R", team: "a",
            role: "reacting sprinter", facing: "north", note: "loaded athletic stance" }
        ],
        signals: [{ actor: "reaction-caller", receiver: "reaction-runner",
          order: 1, choices: ["clap", "whistle", "hand drop"] }],
        legend: [{ tone: "b", text: "Signal partner" }, { tone: "a", text: "Sprinter ready" }]
      },
      {
        title: "React, drive, then recover fully",
        caption: "The instant the signal appears, the sprinter drives the first three steps hard and low, accelerates through five yards, then walks back and rests fully. Repeat from forward-, side-, and backward-facing starts before partners switch jobs.",
        w: 9, h: 10,
        zones: [
          { x: 6.45, y: 2.95, w: 2, h: 0.9, tone: "good", label: "5-YARD FINISH" },
          { x: 0.5, y: 7.15, w: 2.25, h: 1.05, tone: "neutral", label: "START · FULL REST" }
        ],
        players: [
          { id: "reaction-caller", x: 1.35, y: 2.4, label: "Cue", team: "b",
            role: "signal partner", facing: "south", note: "varies the signal" },
          { id: "reaction-runner", x: 1.35, y: 6.25, label: "R", team: "a",
            role: "reacting sprinter", facing: "east", note: "reacts on the cue" }
        ],
        paths: [{
          from: [1.6, 6.1], via: [[3.15, 6.1], [5.2, 6.1]], to: [7.6, 6.1],
          kind: "move", curve: 0, label: "REACT → 3 LOW DRIVE STEPS → 5 YARDS",
          playerIndex: 1, actor: "reaction-runner",
          startVariants: ["forward-facing", "side-facing", "backward-facing"]
        }],
        legend: [{ tone: "b", text: "Signal partner" }, { tone: "move", text: "Explosive sprint" }]
      }
    )
  };
  E["line-touch-conditioning"] = {
    diagram: {
      caption: "Court-line sprints (suicides): start on the end line, sprint to the near attack line and touch it low, back; then center line and back; far attack line and back; far end line and back. Sharp changes of direction, full rest between rounds.",
      w: 9, h: 13.4, lines: [{ y: 3 }, { y: 6 }, { y: 9 }], court: [{ x: 0, y: 0, w: 9, h: 12 }],
      players: [{ x: 4.5, y: 12.4, label: "P", team: "a", note: "start on end line" }],
      paths: [{
        from: [4.5, 12.2],
        via: [[4.5, 9], [4.5, 12.2], [4.5, 6], [4.5, 12.2],
          [4.5, 3], [4.5, 12.2], [4.5, 0.4]],
        to: [4.5, 12.2], kind: "move",
        label: "near attack → center → far attack → far end · back each time",
        curve: 0, playerIndex: 0
      }],
      legend: [{ tone: "move", text: "Touch every line" }]
    }
  };

  // ---- Jump / landing footwork ---------------------------------------------

  E["approach-jump-landing"] = {
    diagrams: dk.seq(
      { title: "Squat jumps, soft landings", caption: "Start with squat jumps in place, landing soft with the knees tracking over the toes. Stick each landing for a full second before the next.", w: 9, h: 9,
        players: [{ x: 4.5, y: 5, label: "P", team: "a", note: "land soft & stick" }],
        paths: [{ from: [4.5, 5], via: [[4.5, 2.6]], to: [4.5, 5], kind: "move", label: "jump up → land & hold", curve: 0, playerIndex: 0 }],
        legend: [{ tone: "move", text: "Up & stick" }] },
      dk.approachPath({ title: "Last two steps into a jump", side: "middle", setter: false, caption: "Add the last two steps of the hitting approach (right-left) into a two-foot jump straight up, swinging both arms and sticking the landing." }),
      dk.approachPath({ title: "Full approach jump", side: "middle", setter: false, swing: true, caption: "Build up to a full approach jump, reaching up with the hitting hand. Do small sets of 5 or 6 with full rest — quality over fatigue." })
    )
  };

  // ---- Ball-handling warmups (solo & relay) --------------------------------

  E["self-toss-ball-handling"] = {
    diagrams: dk.seq(
      { title: "Toss & catch the shapes", caption: "Everyone with a ball, spread out. Toss up and catch it on a straight-arm forearm platform (thumbs together), then toss and catch it in the hands above the forehead — the setting shape.", w: 9, h: 7,
        players: dk.spread(4, 1.6, 7.4).map(function (x) { return { x: x, y: 4.6, label: "", team: "a" }; }),
        paths: dk.spread(4, 1.6, 7.4).map(function (x) { return { from: [x, 4.2], to: [x, 2], kind: "ball", curve: 0 }; }),
        legend: [{ tone: "a", text: "Each player + ball" }] },
      { title: "Bump, set, repeat to self", caption: "Bump the ball to yourself five times low and controlled, then set it straight up five times moving the feet to stay under it, then alternate bump–set–bump staying balanced.", w: 9, h: 7,
        players: dk.spread(4, 1.6, 7.4).map(function (x) { return { x: x, y: 4.6, label: "", team: "a" }; }),
        paths: dk.spread(4, 1.6, 7.4).map(function (x, i) { return { from: [x, 4.2], to: [x, i % 2 ? 1.8 : 2.6], kind: "ball", curve: 0 }; }),
        legend: [{ tone: "a", text: "Stay under the ball" }] }
    )
  };
  E["ball-handling-relay"] = {
    diagram: {
      caption: "Split a young group into relay teams behind the line, a turnaround cone a short distance out for each. The first player controls the ball down to the cone and back (bump to self, then a set-to-self round, then bounce-and-catch), hands off to the next. First team all done wins.",
      w: 9, h: 11,
      cones: dk.spread(3, 1.8, 7.2).map(function (x) { return { x: x, y: 1.6 }; }),
      players: dk.spread(3, 1.8, 7.2).map(function (x) { return { x: x, y: 9, label: "", team: "a" }; })
        .concat(dk.spread(3, 1.8, 7.2).map(function (x) { return { x: x, y: 9.8, label: "", team: "n" }; })),
      balls: dk.spread(3, 1.8, 7.2).map(function (x) { return { x: x - 0.4, y: 8.8 }; }),
      paths: dk.spread(3, 1.8, 7.2).map(function (x) { return { from: [x, 8.6], to: [x, 2.2], kind: "move", label: "control down & back", curve: 0.12 }; }),
      legend: [{ tone: "a", text: "Runner + ball" }, { tone: "n", text: "Team waiting" }, { tone: "move", text: "Down to cone & back" }]
    }
  };

  // ---- Partner dynamic warmups ---------------------------------------------

  E["partner-pass-and-move-warmup"] = {
    diagrams: dk.seq(
      dk.pairsRows({ title: "Toss, then pass back & forth", pairs: 3, topLabel: "B", botLabel: "A", caption: "Pairs about 12–15 ft apart with one ball. Start tossing and catching to find a rhythm, then toss once and the partner passes it back; build to passing back and forth without catching." }),
      { title: "Pass, then shuffle & set", caption: "Now add movement: after you pass, shuffle to the side and back before the next ball arrives. Finish by passing to your partner and having them set it back.", w: 10, h: 8,
        players: [{ x: 3, y: 2, label: "B", team: "b", note: "partner" }, { x: 3, y: 6, label: "A", team: "a", note: "you" }],
        paths: [
          { from: [3, 5.6], to: [3, 2.4], kind: "ball", label: "pass", curve: 0.2 },
          { from: [3, 6], to: [5, 6], kind: "move", label: "shuffle & back", curve: 0.4 },
          { from: [3, 2.4], to: [3, 5.6], kind: "ball", label: "set back", curve: -0.2 }
        ],
        legend: [{ tone: "a", text: "You" }, { tone: "b", text: "Partner" }, { tone: "move", text: "Shuffle between balls" }] }
    )
  };
  E["partner-toss-mirror"] = {
    diagrams: dk.seq(
      dk.pairsRows({ title: "Toss & call names", pairs: 3, topLabel: "B", botLabel: "A", caption: "Young pairs toss a ball back and forth, calling each other's name on every catch to settle nerves and get hands on a ball." }),
      { title: "Toss, shuffle, copy", caption: "Add a step: toss it, shuffle to a spot, and catch the one coming back. Then one partner leads simple moves — squat, reach, hop — while the other copies, holding the ball. Finish with soft tosses caught on a frozen platform.", w: 10, h: 8,
        players: [{ x: 3, y: 2, label: "B", team: "b", note: "leads" }, { x: 3, y: 6, label: "A", team: "a", note: "copies" }],
        paths: [
          { from: [3, 5.6], to: [3, 2.4], kind: "ball", label: "toss", curve: 0.2 },
          { from: [3, 6.2], to: [5.4, 6.2], kind: "move", label: "shuffle to spot", curve: 0.3 }
        ],
        legend: [{ tone: "a", text: "Copies" }, { tone: "b", text: "Leader" }, { tone: "move", text: "Move & mirror" }] }
    )
  };
  E["mirror-defensive-shuffle"] = {
    diagram: {
      caption: "Partners about 6 ft apart in a low defensive stance. One leads, shuffling left/right and adding forward/back; the partner mirrors to stay right across. On a clap or whistle both touch the floor and pop back up. Switch leaders every 20–30 seconds.",
      w: 9, h: 8,
      players: [{ x: 3, y: 3, label: "L", team: "b", note: "leader" }, { x: 3, y: 5, label: "M", team: "a", note: "mirrors" }],
      paths: [
        { from: [3, 3], to: [6.2, 3], kind: "move", label: "leads side to side", curve: 0, playerIndex: 0 },
        { from: [3, 5], to: [6.2, 5], kind: "move", label: "mirrors across", curve: 0, playerIndex: 1 }
      ],
      legend: [{ tone: "b", text: "Leader" }, { tone: "a", text: "Mirror" }, { tone: "move", text: "Match the move" }]
    }
  };
  var mirrorBase = E["mirror-defensive-shuffle"].diagram;
  mirrorBase.coordinateSystem = "metric";
  mirrorBase.title = "Lead and mirror side to side";
  mirrorBase.players[0].id = "mirror-leader";
  mirrorBase.players[0].facing = "south";
  mirrorBase.players[0].role = "leader";
  mirrorBase.players[1].id = "mirror-follower";
  mirrorBase.players[1].facing = "north";
  mirrorBase.players[1].role = "mirror partner";
  mirrorBase.paths = [];
  [0, 1].forEach(function (index) {
    var y = index ? 5 : 3;
    mirrorBase.paths.push({ from: [3, y], to: [5.2, y], kind: "move", motionId: "shuffle",
      label: index ? "mirror to the same side" : "lead to the side", playerIndex: index,
      sequenceOrder: 0, simultaneousGroup: "mirror-out" });
    mirrorBase.paths.push({ from: [5.2, y], to: [3, y], kind: "move", motionId: "shuffle",
      label: "return together", playerIndex: index, sequenceOrder: 1, simultaneousGroup: "mirror-back" });
  });
  var mirrorDepth = JSON.parse(JSON.stringify(mirrorBase));
  mirrorDepth.title = "Forward and back without losing the gap";
  mirrorDepth.caption = "The leader comes forward while the partner moves backward by the same amount, keeping the original two-metre gap and facing each other. Reverse together and return to the start; neither player turns away.";
  mirrorDepth.paths = [];
  [0, 1].forEach(function (index) {
    var y = index ? 5 : 3;
    mirrorDepth.paths.push({ from: [3, y], to: [3, y + .8], kind: "move", motionId: "shuffle",
      label: index ? "mirror backward" : "lead forward", playerIndex: index, sequenceOrder: 0, simultaneousGroup: "mirror-depth-out" });
    mirrorDepth.paths.push({ from: [3, y + .8], to: [3, y], kind: "move", motionId: "shuffle",
      label: index ? "mirror forward" : "lead backward", playerIndex: index, sequenceOrder: 1, simultaneousGroup: "mirror-depth-back" });
  });
  var mirrorTouch = JSON.parse(JSON.stringify(mirrorBase));
  mirrorTouch.title = "Both touch the floor and recover";
  mirrorTouch.caption = "On the clap or whistle, both partners bend through the hips and knees, touch the floor, then rise back to the same low defensive stance, still facing one another.";
  mirrorTouch.paths = [0, 1].map(function (index) {
    var y = index ? 5 : 3;
    return { from: [3, y], to: [3, y], kind: "move", motionId: "warmup", label: "touch floor → ready",
      playerIndex: index, sequenceOrder: 0, simultaneousGroup: "mirror-touch" };
  });
  var mirrorSwitch = JSON.parse(JSON.stringify(mirrorBase));
  mirrorSwitch.title = "Switch the leader after 20–30 seconds";
  mirrorSwitch.caption = "Keep the same partners and spacing. After 20–30 seconds, the former mirror becomes the leader; the former leader now copies the movements. Start another side-to-side and forward/back round.";
  mirrorSwitch.players[0].label = "M";
  mirrorSwitch.players[0].role = mirrorSwitch.players[0].note = "mirror partner";
  mirrorSwitch.players[1].label = "L";
  mirrorSwitch.players[1].role = mirrorSwitch.players[1].note = "leader";
  E["mirror-defensive-shuffle"].diagrams = [mirrorBase, mirrorDepth, mirrorTouch, mirrorSwitch];
  E["mirror-defensive-shuffle"].diagrams.forEach(function (scene, step) {
    scene.stepIndices = [step];
    scene.paths.forEach(function (path) { path.stepIndices = [step]; });
  });
  delete E["mirror-defensive-shuffle"].diagram;
  E["reaction-ball-quickness"] = {
    diagram: {
      caption: "Partners with a lumpy reaction ball (or any ball bounced to go a random way). The feeder bounces it in front of their partner, who stays LOW, moves the feet, and catches it after one bounce. Progress to crazy bounces off a wall. Short, sharp bursts, then switch.",
      w: 9, h: 8,
      zones: [{ x: 0, y: 0.2, w: 9, h: 0.9, tone: "neutral", label: "WALL (later)" }],
      players: [{ x: 3, y: 2.4, label: "F", team: "b", note: "bounces it" }, { x: 5.4, y: 5.6, label: "R", team: "a", note: "reacts low" }],
      paths: [
        { from: [3.2, 2.8], to: [4.8, 5], kind: "ball", label: "random bounce", curve: 0.3 },
        { from: [5.4, 5.6], to: [4.2, 6.2], kind: "move", label: "move to it", curve: 0.2 }
      ],
      legend: [{ tone: "b", text: "Feeder" }, { tone: "a", text: "Reactor" }, { tone: "move", text: "Quick first step" }]
    }
  };
  E["partner-medicine-ball-power"] = {
    diagram: {
      caption: "Partners a few steps apart with a light medicine ball, throwing it in explosive, volleyball-like motions: chest passes exploding off the chest, overhead throws copying a spike/serve, twisting side throws both directions, then a few scoop throws driving up out of a squat.",
      w: 9, h: 8,
      players: [{ x: 3, y: 2.4, label: "B", team: "b", note: "partner" }, { x: 3, y: 5.6, label: "A", team: "a", note: "you" }],
      balls: [{ x: 3.4, y: 4 }],
      paths: [
        { from: [3, 5.2], to: [3, 2.8], kind: "ball", label: "explosive throw", curve: 0.2 },
        { from: [3, 2.8], to: [3, 5.2], kind: "ball", label: "back", curve: -0.2 }
      ],
      legend: [{ tone: "a", text: "You" }, { tone: "b", text: "Partner" }]
    }
  };

})(window.RR);
