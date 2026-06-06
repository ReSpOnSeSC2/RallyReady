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
        { from: [4.5, 4.5], to: [2.2, 2.2], kind: "move", label: o.label1 || "react out", curve: 0.1 },
        { from: [2.4, 2.4], to: [4.5, 4.5], kind: "move", label: "back to middle", curve: -0.1 },
        { from: [4.5, 4.5], to: [6.8, 7], kind: "move", curve: -0.1 }
      ],
      legend: [{ tone: "move", text: "React & recover" }]
    };
  }

  // ---- Dynamic movement down the court (multi-phase lane series) ------------

  E["dynamic-movement-warmup"] = {
    diagrams: dk.seq(
      dk.lanes({ title: "Easy jog down & back", caption: "Line up on the end line with room to the attack line. Jog down at an easy pace and back to get the blood moving." }),
      dk.lanes({ title: "High knees / butt-kicks", back: true, caption: "Down the floor with high knees, then come back kicking your heels up to your backside." }),
      dk.lanes({ title: "Lunges & grapevine", back: true, caption: "Walking lunges down twisting your chest over the front leg, side lunges back. Then grapevine (carioca) facing one sideline down, the other sideline back." }),
      dk.lanes({ title: "Build-up runs", caption: "Finish with two or three runs at about three-quarter speed down the floor to wake the legs up." })
    )
  };
  E["animal-movement-warmup"] = {
    diagrams: dk.seq(
      dk.lanes({ title: "Bear crawl & crab walk", back: true, caption: "Bear crawl (hands and feet, hips low) down to the line, then crab walk (belly up, push through the heels) back the other way." }),
      dk.lanes({ title: "Frog hops & inchworms", caption: "Frog hops down the floor — squat low and hop forward with a soft landing — then finish with inchworms, walking the hands out to a plank and back." })
    )
  };

  // ---- Footwork / agility / reaction movement ------------------------------

  E["agility-ladder-footwork"] = {
    diagram: {
      caption: "Lay a ladder flat. Line up and run a footwork pattern down it — two feet each box, then in-in-out-out sideways, then the icky shuffle, then hopscotch — and SPRINT three steps out of the last box before jogging back to the line.",
      w: 9, h: 11,
      zones: dk.spread(8, 2.2, 2.2).map(function (x, i) { return { x: 3.6, y: 1.2 + i * 0.9, w: 1.8, h: 0.8, tone: "neutral", label: "" }; }),
      players: [{ x: 4.5, y: 9, label: "P", team: "a", note: "line up here" }, { x: 1.6, y: 9.4, label: "", team: "n" }, { x: 1.6, y: 10.1, label: "", team: "n" }],
      paths: [
        { from: [4.5, 8.6], to: [4.5, 1.4], kind: "move", label: "footwork down ladder", curve: 0 },
        { from: [4.5, 1.2], to: [4.5, 0.4], kind: "serve", label: "sprint out", curve: 0 },
        { from: [4, 8.8], to: [1.9, 9.4], kind: "move", label: "back to line", curve: 0.3 }
      ],
      legend: [{ tone: "neutral", text: "Ladder" }, { tone: "move", text: "Quick feet" }, { tone: "n", text: "Line waits" }]
    }
  };
  E["quadrant-reaction-footwork"] = {
    diagram: coneBox({ caller: true, caption: "Four cones make a small box a couple of steps around the player. Start low and centered; on the coach's call or point, sprint/shuffle to that corner, touch it, and recover to the middle. Mix forward sprints, backpedals, and side shuffles." })
  };
  E["reaction-sprint-starts"] = {
    diagrams: dk.seq(
      { title: "Wait for the signal", caption: "Players set up in an athletic stance facing a coach or partner, ready to explode the instant they see or hear the cue.", w: 9, h: 10,
        players: [{ x: 4.5, y: 0.9, label: "C", team: "coach", note: "clap / whistle / drop" }].concat(dk.spread(4, 1.6, 7.4).map(function (x) { return { x: x, y: 8, label: "", team: "a" }; })),
        legend: [{ tone: "coach", text: "Signal" }, { tone: "a", text: "Ready stance" }] },
      dk.lanes({ title: "Explode 5 yards", caption: "On the clap, whistle, or hand drop, explode into a short 5-yard sprint. Change the start each round — facing forward, sideways, even backward — full effort then full rest." })
    )
  };
  E["line-touch-conditioning"] = {
    diagram: {
      caption: "Court-line sprints (suicides): start on the end line, sprint to the near attack line and touch it low, back; then center line and back; far attack line and back; far end line and back. Sharp changes of direction, full rest between rounds.",
      w: 9, h: 13.4, net: 6, lines: [{ y: 3 }, { y: 9 }], court: [{ x: 0, y: 0, w: 9, h: 12 }],
      players: [{ x: 4.5, y: 12.4, label: "P", team: "a", note: "start on end line" }],
      paths: [
        { from: [3.6, 12.2], to: [3.6, 9], kind: "move", label: "near attack & back", curve: 0 },
        { from: [4.2, 12.2], to: [4.2, 6], kind: "move", label: "center & back", curve: 0 },
        { from: [4.8, 12.2], to: [4.8, 3], kind: "move", label: "far attack & back", curve: 0 },
        { from: [5.4, 12.2], to: [5.4, 0.4], kind: "move", label: "far end & back", curve: 0 }
      ],
      legend: [{ tone: "move", text: "Touch every line" }]
    }
  };

  // ---- Jump / landing footwork ---------------------------------------------

  E["approach-jump-landing"] = {
    diagrams: dk.seq(
      { title: "Squat jumps, soft landings", caption: "Start with squat jumps in place, landing soft with the knees tracking over the toes. Stick each landing for a full second before the next.", w: 9, h: 9,
        players: [{ x: 4.5, y: 5, label: "P", team: "a", note: "land soft & stick" }],
        paths: [{ from: [4.5, 5], to: [4.5, 2.6], kind: "move", label: "jump up", curve: 0 }, { from: [4.9, 2.8], to: [4.9, 5], kind: "move", label: "land & hold", curve: 0 }],
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
        { from: [3, 3], to: [6.2, 3], kind: "move", label: "leads side to side", curve: 0 },
        { from: [3, 5], to: [6.2, 5], kind: "move", label: "mirrors across", curve: 0 },
        { from: [1.8, 3], to: [1.8, 5], kind: "move", curve: 0 }
      ],
      legend: [{ tone: "b", text: "Leader" }, { tone: "a", text: "Mirror" }, { tone: "move", text: "Match the move" }]
    }
  };
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
