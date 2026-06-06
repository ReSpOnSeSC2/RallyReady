// extras-data-8.js — BLOCKING drill diagrams (RR.extras).
//
// One entry per blocking drill. There is no dedicated blocking builder in the
// kit (blocking is mostly blockers + footwork along the net), so these specs are
// hand-laid. A small local helper, netBlock(), places one or more blockers along
// a net with an optional hitter across, so the repeated "stand at the net" shape
// stays a table instead of a pile of geometry.
//
// Footwork drills (slide/crossover/swing along the net, read-and-close, block +
// transition off the net) use a `diagrams: [...]` sequence so each stage is
// pictured with "move" (dashed) arrows showing the blocker's path along the net.
// Simple "block a held/tossed ball" reps use a single diagram. Follows the
// passing exemplar (extras-data-3.js) for wrapper, helper style, and quality.
//
// HONESTY: we show WHERE blockers stand and HOW they move along the net. We do
// not draw hand/arm mechanics — only position and footwork paths.
window.RR = window.RR || {};
RR.extras = RR.extras || {};

(function (RR) {
  "use strict";
  var dk = RR.dk;
  var E = RR.extras;

  // A blocking look: a short court with the NET across the TOP, your blocker(s)
  // (team "a") standing just below the net, and an optional hitter (team "b")
  // across the net. Pass blockers as [{x, label, note}] and a hitter {x, label,
  // note}. Movement/footwork arrows are added per drill, not here.
  function netBlock(o) {
    o = o || {};
    var by = o.blockerY != null ? o.blockerY : 4.6; // blockers just under the net
    var hy = o.hitterY != null ? o.hitterY : 2.6;   // hitter across the net
    var players = [];
    (o.blockers || [{ x: 4.5, label: "B", note: "blocker" }]).forEach(function (b) {
      players.push({ x: b.x, y: b.y != null ? b.y : by, label: b.label || "B", team: "a", note: b.note });
    });
    if (o.hitter) {
      players.push({ x: o.hitter.x, y: o.hitter.y != null ? o.hitter.y : hy, label: o.hitter.label || "H", team: "b", note: o.hitter.note });
    }
    if (o.extra) o.extra.forEach(function (p) { players.push(p); });
    var spec = {
      title: o.title, caption: o.caption,
      w: o.w || 9, h: o.h || 7, net: o.net != null ? o.net : 4,
      court: [{ x: 0, y: 0, w: o.w || 9, h: o.h || 7 }],
      players: players
    };
    if (o.zones) spec.zones = o.zones;
    if (o.paths) spec.paths = o.paths;
    if (o.balls) spec.balls = o.balls;
    if (o.legend) spec.legend = o.legend;
    return spec;
  }

  // ---- Footwork along the net (slide / crossover / shuffle) -----------------

  E["blocking-footwork"] = {
    diagrams: dk.seq(
      netBlock({
        title: "Slide step to the near pin",
        caption: "Start balanced in the middle of the net. Take a quick SLIDE step to block at the near pin — feet never cross, shoulders stay square to the net.",
        blockers: [{ x: 4.5, label: "B", note: "start middle" }],
        paths: [{ from: [4.5, 4.6], to: [2.2, 4.6], kind: "move", label: "slide step", curve: 0 }],
        legend: [{ tone: "move", text: "Footwork" }]
      }),
      netBlock({
        title: "Crossover to the far pin",
        caption: "Come back to the middle, then use a CROSSOVER step to cover the longer distance to the far pin. Square your shoulders to the net before you jump — don't drift sideways in the air.",
        blockers: [{ x: 4.5, label: "B", note: "back to middle" }],
        paths: [{ from: [4.5, 4.6], to: [7, 4.6], kind: "move", label: "crossover", curve: 0 }],
        legend: [{ tone: "move", text: "Footwork" }]
      })
    )
  };

  E["mirror-blocking"] = {
    diagrams: dk.seq(
      netBlock({
        title: "Leader & mirror",
        caption: "Two players face off across the net in blocking position. The LEADER (across the net) shuffles or crossover-steps along the net; the partner mirrors the move on your side, staying square.",
        blockers: [{ x: 3.2, label: "B", note: "mirrors" }],
        hitter: { x: 3.2, label: "L", note: "leader" },
        paths: [
          { from: [3.2, 2.6], to: [5.8, 2.6], kind: "move", label: "leader moves", curve: 0 },
          { from: [3.2, 4.6], to: [5.8, 4.6], kind: "move", label: "mirror", curve: 0 }
        ],
        legend: [{ tone: "a", text: "Mirror" }, { tone: "b", text: "Leader" }, { tone: "move", text: "Footwork" }]
      }),
      netBlock({
        title: "Both jump & press",
        caption: "When the leader jumps, both players jump together and press their hands over the net to close the gap. Switch who leads after a few reps.",
        blockers: [{ x: 5.8, label: "B", note: "jumps & presses" }],
        hitter: { x: 5.8, label: "L", note: "jumps" },
        balls: [{ x: 5.8, y: 3.6 }],
        legend: [{ tone: "a", text: "Mirror" }, { tone: "b", text: "Leader" }]
      })
    )
  };

  E["net-shuffle-footwork-youth"] = {
    diagrams: dk.seq(
      netBlock({
        title: "Shuffle toward a pin",
        caption: "Start in the middle of the net, hands up and ready. SHUFFLE a few steps toward one pin, staying square and never crossing your feet.",
        blockers: [{ x: 4.5, label: "B", note: "start middle" }],
        paths: [{ from: [4.5, 4.6], to: [2.4, 4.6], kind: "move", label: "shuffle", curve: 0 }],
        legend: [{ tone: "move", text: "Shuffle steps" }]
      }),
      netBlock({
        title: "Back to middle, then the other pin",
        caption: "Shuffle back to the middle, then over to the other pin. Keep your hands up and your body parallel to the net the whole time.",
        blockers: [{ x: 4.5, label: "B", note: "middle" }],
        paths: [
          { from: [2.4, 4.6], to: [4.5, 4.6], kind: "move", label: "back to middle", curve: 0 },
          { from: [4.5, 4.6], to: [6.6, 4.6], kind: "move", label: "to other pin", curve: 0 }
        ],
        legend: [{ tone: "move", text: "Shuffle steps" }]
      })
    )
  };

  E["swing-blocking"] = {
    diagrams: dk.seq(
      netBlock({
        title: "Open & crossover",
        caption: "Advanced swing-block to the pin. Start balanced with hands LOW and ready (not already up). Open with a directional step, then a big crossover toward the pin, swinging your arms back like an approach.",
        blockers: [{ x: 4.5, label: "B", note: "hands low, ready" }],
        paths: [
          { from: [4.5, 4.8], to: [5.6, 4.8], kind: "move", label: "open step", curve: 0 },
          { from: [5.6, 4.8], to: [7.2, 4.8], kind: "move", label: "big crossover", curve: 0 }
        ],
        legend: [{ tone: "move", text: "Swing-block footwork" }]
      }),
      netBlock({
        title: "Plant & swing up",
        caption: "Plant at the pin and swing both arms up and over the net, reaching high into the other side. Land balanced and square — then do it to the other pin, focusing on a square finish.",
        blockers: [{ x: 7.2, label: "B", note: "plant & swing up" }],
        balls: [{ x: 7.2, y: 3.6 }],
        legend: [{ tone: "a", text: "Blocker" }]
      })
    )
  };

  E["pin-to-pin-blocking-endurance"] = {
    diagrams: dk.seq(
      netBlock({
        title: "Block-jump at one pin",
        caption: "Start at one pin and block-jump, landing square. This is a conditioning drill — repeat pin to pin for a set number of blocks.",
        blockers: [{ x: 2.2, label: "B", note: "block-jump here" }],
        balls: [{ x: 2.2, y: 3.6 }],
        legend: [{ tone: "a", text: "Blocker" }]
      }),
      netBlock({
        title: "Crossover to the other pin",
        caption: "Move to the other pin with a CROSSOVER step and block-jump there. Keep going pin to pin, staying square each time. Rest fully, then repeat — good footwork matters more than getting tired.",
        blockers: [{ x: 6.8, label: "B", note: "block-jump here" }],
        paths: [{ from: [2.2, 4.6], to: [6.8, 4.6], kind: "move", label: "crossover across", curve: 0 }],
        balls: [{ x: 6.8, y: 3.6 }],
        legend: [{ tone: "move", text: "Footwork" }, { tone: "a", text: "Blocker" }]
      })
    )
  };

  // ---- Read & close / double-block sealing (movement) -----------------------

  E["middle-blocker-read-close"] = {
    diagrams: dk.seq(
      netBlock({
        title: "Read the setter",
        caption: "The middle starts at the net, watching the OPPOSING SETTER's hands. The outside blocker is already set at the pin.",
        blockers: [{ x: 4.5, label: "M", note: "middle reads" }, { x: 7, label: "O", note: "outside set" }],
        hitter: { x: 6.4, label: "St", note: "setter" },
        paths: [{ from: [6.4, 2.6], to: [4.7, 4.2], kind: "ball", label: "watch hands", curve: 0.1 }],
        legend: [{ tone: "a", text: "Blockers" }, { tone: "b", text: "Setter" }]
      }),
      netBlock({
        title: "Close to the pin",
        caption: "On a set to the pin, the middle uses a quick CROSSOVER to close to the outside blocker. Both jump together and seal the gap between their hands — no space. Reset to the middle and repeat to the other pin.",
        blockers: [{ x: 6.2, label: "M", note: "closed in" }, { x: 7.4, label: "O", note: "outside" }],
        paths: [{ from: [4.5, 4.6], to: [6, 4.6], kind: "move", label: "crossover to close", curve: 0 }],
        balls: [{ x: 6.8, y: 3.6 }],
        legend: [{ tone: "move", text: "Close the gap" }, { tone: "a", text: "Blockers" }]
      })
    )
  };

  E["double-block-seal"] = {
    diagrams: dk.seq(
      netBlock({
        title: "Outside sets the spot",
        caption: "The OUTSIDE blocker sets the block at the pin first, taking away the hitter's line and marking the spot the middle will close to.",
        blockers: [{ x: 7.2, label: "O", note: "sets the spot" }, { x: 4.5, label: "M", note: "starts middle" }],
        hitter: { x: 7.2, label: "H", note: "hitter" },
        legend: [{ tone: "a", text: "Blockers" }, { tone: "b", text: "Hitter" }]
      }),
      netBlock({
        title: "Middle closes & seals",
        caption: "The MIDDLE closes in and presses inside hands together with the outside — no gap between them. Both reach over and angle hands to send the ball to the defenders. Then repeat against a live hitter.",
        blockers: [{ x: 6.1, label: "M", note: "closes the gap" }, { x: 7.4, label: "O", note: "outside" }],
        hitter: { x: 7.2, label: "H", note: "hitter" },
        paths: [{ from: [4.5, 4.6], to: [5.9, 4.6], kind: "move", label: "close & seal", curve: 0 }],
        balls: [{ x: 6.8, y: 3.6 }],
        legend: [{ tone: "move", text: "Seal the gap" }, { tone: "a", text: "Blockers" }, { tone: "b", text: "Hitter" }]
      })
    )
  };

  E["commit-block-the-middle"] = {
    diagrams: dk.seq(
      netBlock({
        title: "Read the setter's release",
        caption: "Against a fast middle attack, the blocker watches the other team's MIDDLE and the setter's release. The quick hitter is already loading right in front.",
        blockers: [{ x: 4.5, label: "B", note: "reads release" }],
        hitter: { x: 4.5, label: "H", note: "quick middle" },
        extra: [{ x: 6.4, y: 2.6, label: "St", team: "b", note: "setter" }],
        paths: [{ from: [6.4, 2.6], to: [4.7, 2.8], kind: "ball", label: "quick set", curve: 0.12 }],
        legend: [{ tone: "a", text: "Blocker" }, { tone: "b", text: "Middle + setter" }]
      }),
      netBlock({
        title: "Commit with the hitter",
        caption: "Reading a quick set, the blocker COMMITS — jumping WITH the middle hitter (timed to the hitter, not the ball) and pressing over on the quick. Commit early and decisively. Mix in fakes so the blocker learns when it's worth it.",
        blockers: [{ x: 4.5, label: "B", note: "jumps with hitter" }],
        hitter: { x: 4.5, label: "H", note: "quick attack" },
        balls: [{ x: 4.5, y: 3.6 }],
        legend: [{ tone: "a", text: "Blocker" }, { tone: "b", text: "Hitter" }]
      })
    )
  };

  // ---- Block + transition off the net ---------------------------------------

  E["block-and-transition"] = {
    diagrams: dk.seq(
      {
        title: "Block at the net",
        caption: "The blocker blocks a ball the coach feeds at the net, pressing hands over and landing square.",
        w: 9, h: 10, net: 2.2, lines: [{ y: 5.2 }],
        court: [{ x: 0, y: 0, w: 9, h: 10 }],
        players: [
          { x: 4.5, y: 0.9, label: "C", team: "coach", note: "feeds at net" },
          { x: 4.5, y: 3.4, label: "B", team: "a", note: "blocks" }
        ],
        balls: [{ x: 4.5, y: 2.4 }],
        legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Blocker" }]
      },
      {
        title: "Drop off & attack in transition",
        caption: "As soon as they land, the player pushes OFF the net back to the attack line. A second ball is set, and they approach and hit it (or dig it) in transition. A few in a row, then rest and rotate.",
        w: 9, h: 10, net: 2.2, lines: [{ y: 5.2 }],
        court: [{ x: 0, y: 0, w: 9, h: 10 }],
        players: [
          { x: 4.5, y: 6.4, label: "B", team: "a", note: "transitions to hit" },
          { x: 6.6, y: 3.2, label: "St", team: "a", note: "sets" }
        ],
        paths: [
          { from: [4.5, 3.6], to: [4.5, 6], kind: "move", label: "drop off the net", curve: 0 },
          { from: [6.4, 3.2], to: [4.8, 3.8], kind: "ball", label: "set", curve: 0.2 },
          { from: [4.5, 5.8], to: [4.5, 3.6], kind: "move", label: "approach & hit", curve: 0 }
        ],
        legend: [{ tone: "move", text: "Transition footwork" }, { tone: "a", text: "Hitter + setter" }]
      }
    )
  };

  // ---- Single-rep blocks (held / tossed ball, jump & land, reach) -----------

  E["block-a-tossed-ball"] = {
    diagram: netBlock({
      caption: "A young blocker's first real block. A partner on a box reaches or gently tosses a ball just over the net; the blocker squares up, jumps, and presses their hands over to push it back down. Start from a held ball, then a timed toss. Focus on a balanced landing and firm, spread hands.",
      blockers: [{ x: 4.5, label: "B", note: "times the jump" }],
      hitter: { x: 4.5, label: "P", note: "tosses on box" },
      balls: [{ x: 4.5, y: 3.6 }],
      paths: [{ from: [4.5, 3.2], to: [4.5, 4], kind: "ball", label: "just over the net", curve: 0 }],
      legend: [{ tone: "a", text: "Blocker" }, { tone: "b", text: "Partner on box" }]
    })
  };

  E["block-timing-box"] = {
    diagram: netBlock({
      caption: "Timing the block. A hitter on a box holds a ball up at the net; the blocker watches the hitter's ARM, then jumps to press over and seal the ball, trying to touch it at its highest point over the net. Reset and contact from different spots left and right.",
      blockers: [{ x: 4.5, label: "B", note: "watch the arm, then jump" }],
      hitter: { x: 4.5, label: "H", note: "holds ball on box" },
      balls: [{ x: 4.5, y: 3.5 }],
      extra: [
        { x: 2.4, y: 2.6, label: "", team: "n", note: "left spot" },
        { x: 6.6, y: 2.6, label: "", team: "n", note: "right spot" }
      ],
      legend: [{ tone: "a", text: "Blocker" }, { tone: "b", text: "Hitter on box" }, { tone: "n", text: "Other contact spots" }]
    })
  };

  E["block-jump-and-land"] = {
    diagram: netBlock({
      caption: "Safe two-foot block mechanics. Start square to the net, hands up in front of the chest. Bend the knees and jump STRAIGHT UP, pressing hands over the net, then land softly on two feet in the SAME spot, knees bent and balanced. Repeat slowly, body square, landing controlled.",
      blockers: [{ x: 4.5, label: "B", note: "jump straight up & land same spot" }],
      paths: [
        { from: [4.2, 4.6], to: [4.2, 3.8], kind: "move", label: "up", curve: 0 },
        { from: [4.8, 3.8], to: [4.8, 4.6], kind: "move", label: "land soft", curve: 0 }
      ],
      legend: [{ tone: "move", text: "Straight up & down" }, { tone: "a", text: "Blocker" }]
    })
  };

  E["reach-over-the-net"] = {
    diagram: netBlock({
      caption: "A first taste of blocking at a LOWERED net — no jumping pressure. Stand at the net, hands up in front of the forehead, fingers spread. Reach both hands up and over the net and press them flat and firm (thumbs up), hold a second, then bring hands back to ready without touching the net. Add a small two-foot hop to reach higher as players get comfortable.",
      net: 3.6,
      blockers: [
        { x: 2.6, label: "", note: "reach over" },
        { x: 4.5, label: "", note: "" },
        { x: 6.4, label: "", note: "" }
      ],
      legend: [{ tone: "a", text: "Young blockers at a low net" }]
    })
  };

  E["soft-block-deflection"] = {
    diagram: netBlock({
      caption: "A defensive option against big hitters. A hitter swings from a box; the blocker jumps with OPEN hands angled slightly BACK to deflect the hard swing UP and BACK into the court (instead of pressing over), so teammates can dig it. Mix soft blocks and hard presses so the blocker chooses by the situation.",
      h: 8,
      blockers: [{ x: 4.5, label: "B", note: "open hands, angle back" }],
      hitter: { x: 4.5, label: "H", note: "swings from box" },
      paths: [
        { from: [4.5, 3], to: [4.5, 4.2], kind: "serve", label: "hard swing", curve: 0 },
        { from: [4.5, 4.2], to: [4.5, 6.8], kind: "ball", label: "deflect up & back", curve: -0.25 }
      ],
      extra: [{ x: 4.5, y: 7.2, label: "", team: "a", note: "teammate digs" }],
      legend: [{ tone: "b", text: "Hitter" }, { tone: "a", text: "Blocker + digger" }]
    })
  };

  // ---- Hands / pressing at a wall (no net) ----------------------------------

  E["blocking-hands-at-wall"] = {
    diagram: {
      caption: "Building a strong blocking hand shape at a WALL — no net needed. Stand close to the wall, hands up in front of the forehead with fingers spread; press them flat against the wall like sealing over the net (thumbs up). Then jump and press the hands HIGH on the wall, holding firm for a second. Repeat, keeping the hands firm and spread, never letting them collapse.",
      w: 9, h: 8,
      zones: [{ x: 0, y: 0.2, w: 9, h: 1, tone: "neutral", label: "WALL" }],
      players: dk.spread(3, 1.6, 7.4).map(function (x) { return { x: x, y: 5.4, label: "", team: "a", note: "press the wall" }; }),
      paths: [
        { from: [4.5, 4.8], to: [4.5, 1.5], kind: "move", label: "jump & press high", curve: 0 }
      ],
      legend: [{ tone: "move", text: "Press up the wall" }, { tone: "a", text: "Players" }]
    }
  };

})(window.RR);
