// extras-data-5.js — BALL CONTROL + TEAM PLAY (non-game) drill diagrams (RR.extras).
//
// Same shape and quality bar as extras-data-3.js (the passing exemplar):
// one entry per drill, keyed by the exact drill id. Drills with distinct
// spatial parts (pepper cycles, formation → play) use a `diagrams: [...]`
// sequence with a `title` per step; single-action reps use one `diagram`.
//
// Ball-control work is almost all spatial — circles, partner lines, walls,
// squares — so nearly every drill earns a floor picture. Two local helpers
// (peppForth, solo) cover the shapes these drills repeat most.
window.RR = window.RR || {};
RR.extras = RR.extras || {};

(function (RR) {
  "use strict";
  var dk = RR.dk;
  var E = RR.extras;

  // One pepper exchange between two partners ~15 ft apart: a hit DOWN from the
  // top player, a dig up + set back from the bottom player.
  function peppForth(o) {
    o = o || {};
    return {
      title: o.title, caption: o.caption, w: 6, h: 8,
      players: [
        { x: 3, y: 1.6, label: o.top || "A", team: "b", note: o.topNote || "hitter" },
        { x: 3, y: 6.2, label: o.bot || "B", team: "a", note: o.botNote || "digger" }
      ],
      paths: [
        { from: [3.4, 2], to: [3.4, 5.8], kind: "serve", label: o.down || "hit", curve: 0.26 },
        { from: [2.6, 5.8], to: [2.6, 4], kind: "ball", label: o.dig || "dig up", curve: -0.3 },
        { from: [2.5, 4], to: [2.5, 2], kind: "ball", label: o.up || "set back", curve: 0.26 }
      ]
    };
  }

  // A group of solo players spread across the floor, each keeping a ball up to
  // themselves. `up` labels the contact; `down` adds a return arrow if needed.
  function solo(o) {
    o = o || {};
    var xs = dk.spread(o.n || 4, 1.6, 7.4);
    var players = xs.map(function (x) { return { x: x, y: 4.6, label: "", team: "a" }; });
    var paths = xs.map(function (x) { return { from: [x, 4.2], to: [x, 1.7], kind: "ball", curve: 0, label: "" }; });
    if (o.label) paths[Math.floor(xs.length / 2)].label = o.label;
    return { title: o.title, caption: o.caption, w: 9, h: 7, players: players, paths: paths };
  }

  // ============================ BALL CONTROL ===============================

  // ---- Pepper family (partner dig/set/hit) ---------------------------------

  E["pepper"] = {
    diagrams: dk.seq(
      peppForth({ title: "Hit & dig", caption: "Partners stand 12–15 ft apart with one ball. A hits the ball down at an easy speed; B digs it up in front of their own face." }),
      peppForth({ title: "Set & send back", top: "B", bot: "B", topNote: "", botNote: "sets, then hits",
        down: "", dig: "set up", up: "hit to A",
        caption: "B sets that dug ball to themselves, then hits it back down to A — and the dig, set, hit cycle keeps going. Switch who hits first after a while." })
    )
  };
  E["three-contact-partner-pepper"] = {
    diagram: {
      caption: "Partners ~15 ft apart, but each side makes ALL THREE touches before sending it over: pass to yourself, set to yourself, then hit across. Partner does the same three controlled touches back.",
      w: 6, h: 9,
      players: [
        { x: 3, y: 1.6, label: "A", team: "b", note: "3 touches" },
        { x: 3, y: 7, label: "B", team: "a", note: "3 touches" }
      ],
      paths: [
        { from: [3.3, 6.6], to: [3.3, 5], kind: "ball", label: "pass self", curve: -0.3 },
        { from: [3.3, 5], to: [3.3, 6], kind: "ball", label: "set self", curve: 0.3 },
        { from: [2.7, 6.4], to: [2.7, 2], kind: "serve", label: "hit over", curve: 0.2 }
      ],
      legend: [{ tone: "a", text: "Pass-set-hit on your own side" }]
    }
  };
  E["butterfly-pepper"] = {
    diagrams: dk.seq(
      { title: "Triangle: hit-dig-set", caption: "Three players make a triangle — hitter, digger, setter. The hitter hits a controlled ball to the digger, who digs it to the setter, who sets the hitter to swing again.", w: 9, h: 9,
        players: [
          { x: 4.5, y: 1.6, label: "H", team: "b", note: "hitter" },
          { x: 1.8, y: 7, label: "D", team: "a", note: "digger" },
          { x: 7.2, y: 7, label: "St", team: "a", note: "setter" }
        ],
        paths: [
          { from: [4.4, 2], to: [2, 6.6], kind: "serve", label: "hit", curve: 0.12 },
          { from: [2.1, 7], to: [6.9, 7], kind: "ball", label: "dig", curve: -0.2 },
          { from: [7, 6.6], to: [4.7, 2.1], kind: "ball", label: "set", curve: 0.12 }
        ],
        legend: [{ tone: "b", text: "Hitter" }, { tone: "a", text: "Digger + setter" }] },
      { title: "Rotate one spot", caption: "After each full cycle everyone rotates one job — hitter to digger, digger to setter, setter to hitter — so the triangle keeps flowing. Count clean cycles.", w: 9, h: 9,
        players: [
          { x: 4.5, y: 1.6, label: "H", team: "b" }, { x: 1.8, y: 7, label: "D", team: "a" }, { x: 7.2, y: 7, label: "St", team: "a" }
        ],
        paths: [
          { from: [4.5, 2], to: [1.9, 6.6], kind: "move", label: "hit → dig", curve: 0.3 },
          { from: [1.8, 7], to: [7.1, 7], kind: "move", label: "dig → set", curve: -0.25 },
          { from: [7.2, 6.6], to: [4.6, 2], kind: "move", label: "set → hit", curve: 0.3 }
        ] }
    )
  };
  E["pepper-to-zones"] = {
    diagram: {
      caption: "Regular partner pepper, but the hitter CALLS a target — left, middle, or right — before each hit, and must place the ball there. The digger digs to themselves and sets it back on target.",
      w: 6, h: 8.4,
      zones: [
        { x: 0.3, y: 0.6, w: 1.5, h: 1.2, tone: "target", label: "L" },
        { x: 2.25, y: 0.6, w: 1.5, h: 1.2, tone: "target", label: "M" },
        { x: 4.2, y: 0.6, w: 1.5, h: 1.2, tone: "target", label: "R" }
      ],
      players: [
        { x: 3, y: 3, label: "A", team: "b", note: "calls + hits" },
        { x: 3, y: 6.8, label: "B", team: "a", note: "digger" }
      ],
      paths: [
        { from: [2.6, 6.4], to: [2.6, 4.4], kind: "ball", label: "dig up", curve: -0.3 },
        { from: [2.7, 6.6], to: [1, 1.8], kind: "serve", label: "hit to called zone", curve: 0.12 }
      ],
      legend: [{ tone: "target", text: "Called target" }]
    }
  };
  E["defensive-pepper"] = {
    diagram: peppForth({ top: "H", bot: "D", topNote: "swings HARD", botNote: "controls it",
      down: "hard swing", dig: "controlled dig", up: "set back",
      caption: "A tougher pepper: the hitter swings with real speed straight at the digger, who must make a true, controlled dig up to themselves before setting it back. Bridges pepper and live defense — then switch." })
  };
  E["four-person-pepper"] = {
    diagram: {
      caption: "Four players form a square with one ball. A player hits a controlled ball across to a digger, who digs to a third player, who sets the fourth to hit again — dig-set-hit travelling around the square.",
      w: 9, h: 9,
      players: [
        { x: 1.7, y: 1.7, label: "H", team: "a", note: "hits" }, { x: 7.3, y: 1.7, label: "D", team: "a", note: "digs" },
        { x: 7.3, y: 7.3, label: "St", team: "a", note: "sets" }, { x: 1.7, y: 7.3, label: "H2", team: "a", note: "hits next" }
      ],
      paths: [
        { from: [2, 2], to: [7, 1.8], kind: "serve", label: "hit", curve: 0.12 },
        { from: [7.3, 2], to: [7.3, 7], kind: "ball", label: "dig", curve: 0.12 },
        { from: [7, 7.3], to: [2, 7.3], kind: "ball", label: "set", curve: 0.12 },
        { from: [1.7, 7], to: [1.7, 2], kind: "serve", label: "hit again", curve: 0.12 }
      ],
      legend: [{ tone: "a", text: "Dig-set-hit around the square" }]
    }
  };
  E["continuous-cross-court-control"] = {
    diagram: {
      caption: "Advanced partners rally over the net but ONLY in the cross-court lane — every ball is dig (or pass), set, then a controlled attack back. Keep it in the diagonal so the rally stays demanding. A miss restarts the count.",
      w: 9, h: 12, net: 6, lines: [{ y: 3 }, { y: 9 }], court: [{ x: 0, y: 0, w: 9, h: 12 }],
      zones: [{ x: 0.6, y: 0.6, w: 3.4, h: 4.4, tone: "good", label: "cross-court" }, { x: 5, y: 7, w: 3.4, h: 4.4, tone: "good", label: "cross-court" }],
      players: [{ x: 2.3, y: 2.4, label: "A", team: "b", note: "far pair" }, { x: 6.7, y: 9.6, label: "B", team: "a", note: "near pair" }],
      paths: [
        { from: [6.5, 9.2], to: [2.5, 2.8], kind: "serve", label: "attack cross", curve: 0.12 },
        { from: [2.5, 2.8], to: [6.5, 9.2], kind: "serve", label: "attack back", curve: -0.12 }
      ],
      legend: [{ tone: "good", text: "Keep ball in this lane" }]
    }
  };

  // ---- Wall reps ------------------------------------------------------------

  E["wall-forearm-passing"] = {
    diagram: dk.wall({ players: 4, caption: "Each player stands 5–8 ft from a flat wall and picks a spot near net height to aim above. Toss it at the wall, then forearm-pass each rebound back above the target, moving the feet to stay behind it. Count passes in a row." })
  };
  E["wall-set-and-pass-combo"] = {
    diagram: {
      caption: "Solo at a wall: SET the ball at it, let the rebound drop and PASS it back with your arms, then set the next, pass the next — alternating hands and platform on the fly. Count clean ones in a row.",
      w: 9, h: 8.4,
      zones: [{ x: 0, y: 0.2, w: 9, h: 1, tone: "neutral", label: "WALL" }],
      players: [{ x: 4.5, y: 6.4, label: "", team: "a", note: "set / pass" }],
      paths: [
        { from: [4.1, 5.8], to: [4.1, 1.5], kind: "ball", label: "set up", curve: 0.12 },
        { from: [4.9, 1.6], to: [4.9, 5.4], kind: "ball", label: "rebound → pass", curve: 0.12 }
      ],
      legend: [{ tone: "neutral", text: "Alternate set, then pass" }]
    }
  };

  // ---- Solo / self-control reps --------------------------------------------

  E["bump-set-self-control"] = {
    diagram: solo({ n: 4, label: "bump / set up", caption: "A whole group spreads out, each with a ball: keep it up to yourself, ALTERNATING a bump and a set — bump, set, bump, set. Stay under it, feet moving, and count clean touches in a row." })
  };
  E["set-and-sit"] = {
    diagrams: dk.seq(
      solo({ title: "Set up high", n: 4, label: "set above forehead", caption: "Each player keeps a continuous set going straight up above the forehead at a steady height, feet shuffling to stay under it." }),
      { title: "Sit, then stand", caption: "On every contact, lower all the way down to sit on the floor, then stand right back up — keeping the ball going the whole time. Count sets strung together before it drops.", w: 9, h: 7,
        players: [{ x: 3, y: 4.4, label: "↑", team: "a", note: "stand" }, { x: 6, y: 5.4, label: "▼", team: "a", note: "sit" }],
        paths: [
          { from: [3, 4], to: [3, 1.8], kind: "ball", label: "set", curve: 0 },
          { from: [4, 4.4], to: [5.6, 5.2], kind: "move", label: "down & up each set", curve: 0.3 }
        ] }
    )
  };
  E["toss-bump-catch-control"] = {
    diagram: {
      caption: "A young-player rep broken into pieces: toss the ball up to head height, bump it back up to yourself with steady arms, then CATCH it and reset. Once it feels easy, drop the catch and bump non-stop.",
      w: 9, h: 7.6,
      players: dk.spread(3, 2, 7).map(function (x) { return { x: x, y: 5, label: "", team: "a" }; }),
      paths: [
        { from: [4.5, 4.6], to: [4.5, 2], kind: "ball", label: "toss up", curve: -0.18 },
        { from: [4.9, 2], to: [4.9, 4.4], kind: "ball", label: "bump, then catch", curve: 0.18 }
      ],
      legend: [{ tone: "a", text: "Toss → bump → catch" }]
    }
  };

  // ---- Partner / feeder control reps ---------------------------------------

  E["partner-catch-bump-control"] = {
    diagram: {
      caption: "Two players SIT on the floor a few feet apart, facing each other, and pass the ball back and forth with just their forearms. Sitting removes the legs so all the focus is on straight, still, aiming arms.",
      w: 7, h: 6,
      players: [
        { x: 2, y: 3, label: "A", team: "a", note: "seated" },
        { x: 5, y: 3, label: "B", team: "b", note: "seated" }
      ],
      paths: [
        { from: [2.4, 2.7], to: [4.6, 2.7], kind: "ball", label: "pass", curve: 0.22 },
        { from: [4.6, 3.3], to: [2.4, 3.3], kind: "ball", label: "pass back", curve: 0.22 }
      ],
      legend: [{ tone: "a", text: "Seated — platform only" }]
    }
  };
  E["rapid-fire-control"] = {
    diagram: {
      caption: "A feeder stands close with a cart of balls and tosses them QUICKLY to different spots. The player controls each one back with a pass or set, then resets right away — barely any rest. Go for a set rep count or time block.",
      w: 9, h: 9,
      players: [
        { x: 4.5, y: 1.4, label: "F", team: "coach", note: "fast tosses" },
        { x: 4.5, y: 7, label: "P", team: "a", note: "resets fast" }
      ],
      cones: [{ x: 5.4, y: 1.8 }],
      paths: [
        { from: [4.2, 1.8], to: [2.6, 6.4], kind: "ball", label: "toss wide", curve: 0.12 },
        { from: [4.8, 1.8], to: [6.4, 6.4], kind: "ball", label: "next toss", curve: -0.12 },
        { from: [4.5, 6.6], to: [4.5, 2], kind: "ball", label: "control back", curve: 0.1 }
      ],
      legend: [{ tone: "coach", text: "Feeder + ball cart" }, { tone: "a", text: "Worker" }]
    }
  };

  // ============================== TEAM PLAY =================================

  E["free-ball-transition"] = {
    diagrams: dk.seq(
      { title: "Base D → 'free!'", caption: "Six players start in their base defensive spots. The coach yells 'free!' and tosses an easy ball over the net for the team to read and run.", w: 9, h: 11, net: 6, lines: [{ y: 3 }, { y: 9 }], court: [{ x: 0, y: 0.6, w: 9, h: 9.6 }],
        players: [
          { x: 4.5, y: 1.2, label: "C", team: "coach", note: "tosses free ball" },
          { x: 2.6, y: 7, label: "", team: "a" }, { x: 6.4, y: 7, label: "", team: "a" }, { x: 4.5, y: 7.8, label: "", team: "a" },
          { x: 1.6, y: 9.6, label: "", team: "a" }, { x: 4.5, y: 10, label: "", team: "a" }, { x: 7.4, y: 9.6, label: "", team: "a" }
        ],
        paths: [{ from: [4.5, 1.6], to: [4.5, 7.4], kind: "ball", label: "free ball", curve: 0.12 }],
        legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Base defense" }] },
      { title: "Pass-set-hit attack", caption: "The team passes the free ball to the setter, the setter sets a hitter, and the hitter attacks over. Reset and repeat, rotating so everyone trains each job.", w: 9, h: 11, net: 6, lines: [{ y: 3 }, { y: 9 }], court: [{ x: 0, y: 0.6, w: 9, h: 9.6 }],
        players: [
          { x: 4.5, y: 8.4, label: "P", team: "a", note: "passer" },
          { x: 6.4, y: 7, label: "St", team: "a", note: "setter" },
          { x: 2.6, y: 7, label: "H", team: "a", note: "hitter" }
        ],
        paths: [
          { from: [4.5, 8.2], to: [6.3, 7.1], kind: "ball", label: "pass", curve: 0.15 },
          { from: [6.4, 7], to: [2.8, 6.9], kind: "ball", label: "set", curve: 0.2 },
          { from: [2.6, 6.8], to: [4.4, 1.6], kind: "serve", label: "hit", curve: 0.1 }
        ],
        legend: [{ tone: "a", text: "Pass → set → hit" }] }
    )
  };
  E["run-the-rotation-offense"] = {
    diagrams: dk.seq(
      { title: "Rotation serve-receive", caption: "The team sets up in a rotation's serve-receive formation. A coach tosses a ball in; the team passes, sets, and runs its planned attack for that rotation. Two or three balls, then advance.", w: 9, h: 11, net: 6, lines: [{ y: 3 }, { y: 9 }], court: [{ x: 0, y: 0.6, w: 9, h: 9.6 }],
        players: [
          { x: 4.5, y: 1.2, label: "C", team: "coach", note: "tosses in" },
          { x: 2, y: 8.6, label: "", team: "a" }, { x: 4.5, y: 9.2, label: "", team: "a" }, { x: 7, y: 8.6, label: "", team: "a" },
          { x: 3, y: 7, label: "", team: "a" }, { x: 6, y: 7, label: "", team: "a" },
          { x: 6.6, y: 7, label: "St", team: "a", note: "setter" }
        ],
        paths: [
          { from: [4.5, 1.6], to: [4.5, 8.8], kind: "ball", label: "toss", curve: 0.12 },
          { from: [4.5, 8.8], to: [6.5, 7.2], kind: "ball", label: "pass to setter", curve: 0.2 }
        ],
        legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Serve-receive" }] },
      { title: "Rotate through all six", caption: "After running each rotation, everyone rotates one spot clockwise to the next rotation's formation and repeats — working through all six, fixing overlaps and who-does-what along the way.", w: 9, h: 11, net: 6, lines: [{ y: 3 }, { y: 9 }], court: [{ x: 0, y: 0.6, w: 9, h: 9.6 }],
        players: [
          { x: 2.6, y: 7, label: "", team: "a" }, { x: 4.5, y: 7, label: "", team: "a" }, { x: 6.4, y: 7, label: "", team: "a" },
          { x: 2.6, y: 9.4, label: "", team: "a" }, { x: 4.5, y: 9.4, label: "", team: "a" }, { x: 6.4, y: 9.4, label: "", team: "a" }
        ],
        paths: [
          { from: [4.5, 7], to: [6.4, 7], kind: "move", curve: 0.3, label: "rotate" },
          { from: [6.4, 7.2], to: [6.4, 9.2], kind: "move", curve: 0.3 },
          { from: [6.4, 9.4], to: [2.6, 9.4], kind: "move", curve: 0.3 },
          { from: [2.6, 9.2], to: [2.6, 7.2], kind: "move", curve: 0.3 }
        ],
        legend: [{ tone: "move", text: "Rotate to next rotation" }] }
    )
  };

})(window.RR);
