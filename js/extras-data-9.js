// extras-data-9.js — DEFENSE drill diagrams (RR.extras).
//
// One entry per defense drill. Reps that are a single read-and-dig action use
// one `diagram`; drills with a real sequence (read → move → dig, block → cover,
// dig → transition, or pursuit: chase → save → over) use a `diagrams: [...]`
// array where each spec carries a `title` step heading.
//
// HONESTY: diagrams show WHERE defenders stand, how they MOVE, and where the
// dig goes (TO the setter / high to the middle). They never try to draw the
// body mechanics of a roll, sprawl, pancake, or collapse — only position.
//
// Mirrors the gold-standard passing file (extras-data-3.js): same IIFE wrapper,
// a couple of local helpers, table-like data. Builders from RR.dk do the heavy
// geometry (coachFeed for digging lines, basePositions for team systems).
window.RR = window.RR || {};
RR.extras = RR.extras || {};

(function (RR) {
  "use strict";
  var dk = RR.dk;
  var E = RR.extras;

  // A single defender digging a coach/feeder ball UP to a target near the net.
  // The coach is at the top, the defender deep, the dig goes to the right-front
  // setter target. Tweak the source (coach at net vs. close feeder) per drill.
  function digRep(o) {
    o = o || {};
    var dx = o.defX != null ? o.defX : 4.5;
    var dy = o.defY != null ? o.defY : 8;
    var src = o.src || [4.5, 1.2];
    var spec = {
      title: o.title, caption: o.caption,
      w: 9, h: 10, net: 2, lines: [{ y: 5.2 }],
      court: [{ x: 0, y: 2, w: 9, h: 7.6 }],
      players: [
        { x: src[0], y: src[1], label: o.srcLabel || "C", team: o.srcTeam || "coach", note: o.srcNote || "hits at defender" },
        { x: dx, y: dy, label: o.defLabel || "D", team: "a", note: o.defNote || "digger" }
      ],
      paths: [
        { from: [src[0], src[1] + 0.4], to: [dx, dy - 0.4], kind: "serve", label: o.hitLabel || "hard ball", curve: o.hitCurve != null ? o.hitCurve : 0.1 }
      ],
      legend: [{ tone: o.srcTeam === "b" ? "b" : "coach", text: o.srcLegend || "Coach" }, { tone: "a", text: "Defender" }]
    };
    if (o.target !== false) {
      spec.players.push({ x: 6.6, y: 4, label: "St", team: "a", note: "setter target" });
      spec.zones = [{ x: 5.8, y: 3.2, w: 1.8, h: 1.6, tone: "target", label: "setter" }];
      spec.paths.push({ from: [dx, dy - 0.5], to: [6.5, 4.2], kind: "ball", label: o.digLabel || "dig high", curve: o.digCurve != null ? o.digCurve : 0.2 });
      spec.legend.push({ tone: "target", text: "Dig to here" });
    } else {
      // No setter: just dig high to the middle of the court.
      spec.paths.push({ from: [dx, dy - 0.5], to: [4.5, 5.6], kind: "ball", label: o.digLabel || "dig high & middle", curve: -0.15 });
    }
    return spec;
  }

  // A close feeder rapidly firing balls L / center / R at one defender — the
  // reaction-digging shape. No net needed; the digs just pop back up.
  function reactionRep(o) {
    o = o || {};
    return {
      title: o.title, caption: o.caption, w: 9, h: 8,
      players: [
        { x: 4.5, y: 2, label: o.feedLabel || "F", team: o.feedTeam || "coach", note: o.feedNote || "close feeder" },
        { x: 4.5, y: 6.2, label: "D", team: "a", note: "digger" }
      ],
      paths: [
        { from: [4.2, 2.4], to: [2.4, 5.8], kind: "serve", label: "left", curve: 0.12 },
        { from: [4.5, 2.4], to: [4.5, 5.8], kind: "serve", label: "at you", curve: 0 },
        { from: [4.8, 2.4], to: [6.6, 5.8], kind: "serve", label: "right", curve: -0.12 },
        { from: [2.6, 5.6], to: [4.3, 3.4], kind: "ball", label: "dig up", curve: 0.2 }
      ],
      legend: [{ tone: o.feedTeam === "b" ? "b" : "coach", text: "Feeder" }, { tone: "a", text: "Digger" }]
    };
  }

  // ---- Coach-hit digging lines & target digging -----------------------------

  E["digging-coach-down-balls"] = {
    diagram: dk.coachFeed({
      defenders: 3, sourceNote: "hits down-balls",
      caption: "A coach hits down-balls from a box at the net at three back-court defenders. Each gets low and balanced, angles the platform, and digs the ball up HIGH toward the middle of the court. Shag, rotate to the next defender, repeat."
    })
  };
  E["dig-to-target"] = {
    diagram: digRep({
      caption: "The coach hits from the net at the defender, who digs the ball to the SETTER TARGET at right-front — not just anywhere. Hit the target and the play continues to a set; miss and go again. Track hits, then rotate.",
      hitLabel: "coach hit", digLabel: "dig to target"
    })
  };
  E["down-ball-digging-lines"] = {
    diagrams: dk.seq(
      digRep({
        title: "Partner hits a down-ball", target: false, src: [4.5, 1.6],
        srcLabel: "H", srcTeam: "b", srcNote: "partner hits", srcLegend: "Hitter",
        hitLabel: "controlled down-ball",
        caption: "No coach needed: one partner stands and hits a controlled down-ball at the other. The digger reads it from a low, balanced stance."
      }),
      digRep({
        title: "Dig back & switch", target: false, src: [4.5, 1.6],
        srcLabel: "H", srcTeam: "b", srcNote: "catches", srcLegend: "Hitter",
        hitLabel: "", digLabel: "dig back to hitter", digCurve: -0.05,
        caption: "The digger sends a high, clean ball straight back to the hitter, who catches it. After several reps, switch the hitter and digger. Keep hits controlled so the platform stays clean."
      })
    )
  };

  // ---- Close-range / lateral reaction reps ----------------------------------

  E["close-range-reaction-digging"] = {
    diagram: reactionRep({
      caption: "A feeder stands close (about 10-12 ft) and quickly fires balls left, right, and straight at the defender, one after another. The defender starts low with hands out front, digs or deflects each ball up, and resets fast. Go for a set time, then switch."
    })
  };
  E["lateral-dig-shuffle"] = {
    diagrams: dk.seq(
      {
        title: "Feed to one side", caption: "A feeder a few steps away sends a ball to the defender's LEFT. The defender reads it early from a low, balanced ready stance.",
        w: 9, h: 8,
        players: [
          { x: 4.5, y: 2, label: "F", team: "coach", note: "feeder" },
          { x: 4.5, y: 6, label: "D", team: "a", note: "starts centered" }
        ],
        paths: [{ from: [4.3, 2.4], to: [2.3, 5.6], kind: "serve", label: "ball wide left", curve: 0.12 }],
        legend: [{ tone: "coach", text: "Feeder" }, { tone: "a", text: "Digger" }]
      },
      {
        title: "Shuffle, stop & dig", caption: "The defender shuffles to get behind the ball, STOPS, and digs a high, controlled ball. Then the feeder sends the next one to the right and they shuffle back. Keep going both ways.",
        w: 9, h: 8,
        players: [
          { x: 4.5, y: 2, label: "F", team: "coach" },
          { x: 2.4, y: 6, label: "D", team: "a", note: "moved over" }
        ],
        paths: [
          { from: [4.4, 6], to: [2.6, 6], kind: "move", label: "shuffle", curve: 0 },
          { from: [2.4, 5.6], to: [4.3, 2.6], kind: "ball", label: "dig up", curve: 0.2 }
        ]
      }
    )
  };

  // ---- Overhead / collapse hands --------------------------------------------

  E["overhead-defensive-hands"] = {
    diagram: digRep({
      target: false, src: [4.5, 1.4],
      srcLabel: "F", srcTeam: "b", srcNote: "drives at chest/head", srcLegend: "Feeder",
      hitLabel: "high hard ball", hitCurve: 0.05,
      digLabel: "firm hands up", digCurve: -0.1,
      caption: "A feeder drives balls at the defender's chest and head height. The defender takes the high ball with firm HANDS above the forehead and pops it up — a quick, strong deflection, not a set. Mix in low balls so they learn to choose hands (high) or arms (low)."
    })
  };
  E["collapse-dig-and-recover"] = {
    diagrams: dk.seq(
      digRep({
        title: "Hard ball at the midline", target: false, src: [4.5, 1.4],
        srcLabel: "C", srcNote: "drives low & hard", hitLabel: "low hard ball", hitCurve: 0.04,
        digLabel: "get arms under it", digCurve: -0.1,
        caption: "The coach drives balls low and hard right at the defender's midline. The defender collapses low to get the arms UNDER the ball and control it — dropping a knee or sitting to take the speed off if needed."
      }),
      {
        title: "Recover to ready", caption: "Right after the dig, the defender pops back up to a balanced ready stance, set for the next ball. The whole rep is collapse-dig-recover.",
        w: 9, h: 8,
        players: [
          { x: 4.5, y: 6, label: "D", team: "a", note: "down low" },
          { x: 4.5, y: 4.4, label: "D", team: "a", note: "back to ready" }
        ],
        paths: [{ from: [4.5, 5.7], to: [4.5, 4.7], kind: "move", label: "pop up", curve: 0 }],
        legend: [{ tone: "a", text: "Defender" }]
      }
    )
  };

  // ---- Emergency floor moves (rolls, sprawls, pancakes) ---------------------

  E["rolls-and-sprawls"] = {
    diagrams: dk.seq(
      {
        title: "Reach for the low ball", caption: "From a low stance, the coach tosses a low ball to one side. The player steps OUT toward it and reaches to play it with one or two arms. Start with easy, slow tosses.",
        w: 9, h: 8,
        players: [
          { x: 4.5, y: 1.8, label: "C", team: "coach", note: "soft low toss" },
          { x: 4.5, y: 5.8, label: "D", team: "a", note: "ready" }
        ],
        paths: [{ from: [4.4, 2.2], to: [6.6, 5.6], kind: "ball", label: "low toss wide", curve: 0.15 }],
        legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Player" }]
      },
      {
        title: "Roll or sprawl, then up", caption: "The player lets the momentum carry into a ROLL (over the shoulder) or a SPRAWL (chest to the floor) to reach the ball, then pops right back up to ready. Practice both directions and both moves.",
        w: 9, h: 8,
        players: [
          { x: 4.5, y: 5.8, label: "D", team: "a", note: "reached out" },
          { x: 6.6, y: 6.4, label: "", team: "n", note: "roll/sprawl out" },
          { x: 5.4, y: 5, label: "D", team: "a", note: "back to ready" }
        ],
        paths: [
          { from: [4.7, 5.9], to: [6.4, 6.3], kind: "move", label: "extend & roll", curve: 0.2 },
          { from: [6.4, 6.2], to: [5.5, 5.2], kind: "move", label: "pop up", curve: 0.2 }
        ],
        legend: [{ tone: "a", text: "Player" }, { tone: "n", text: "Floor move" }]
      }
    )
  };
  E["pancake-and-recover"] = {
    diagrams: dk.seq(
      {
        title: "Ball drops in front", caption: "From a low position, the coach tosses a ball that will land just IN FRONT of the player — too low to dig normally.",
        w: 9, h: 8,
        players: [
          { x: 4.5, y: 1.8, label: "C", team: "coach", note: "tosses short" },
          { x: 4.5, y: 5.8, label: "D", team: "a", note: "low & ready" }
        ],
        paths: [{ from: [4.5, 2.2], to: [4.5, 4.8], kind: "ball", label: "drops short", curve: 0.1 }],
        legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Player" }]
      },
      {
        title: "Pancake & pop up", caption: "The player reaches out and slides one flat HAND to the floor under the ball so it bounces up off the back of the hand, then pops right back to ready. Practice both hands and toss farther over time.",
        w: 9, h: 8,
        players: [
          { x: 4.5, y: 5.8, label: "D", team: "a", note: "slides hand under" },
          { x: 3.4, y: 4.6, label: "", team: "n", note: "ball pops up" }
        ],
        paths: [
          { from: [4.5, 5.6], to: [3.8, 4.8], kind: "move", label: "reach & slide", curve: 0.15 },
          { from: [3.6, 4.7], to: [3.4, 3.6], kind: "ball", label: "pops up", curve: 0 }
        ],
        legend: [{ tone: "a", text: "Player" }, { tone: "n", text: "Saved ball" }]
      }
    )
  };

  // ---- Young / gentle first-dig reps ----------------------------------------

  E["go-get-it-defense"] = {
    diagram: {
      caption: "A first hustle drill: the player starts in a ready stance facing the coach, who tosses a ball a few steps away — left, right, or short. The player sprints, gets low, and plays it up, then resets for the next toss. Keep it fun and high-energy.",
      w: 9, h: 8,
      players: [
        { x: 4.5, y: 1.8, label: "C", team: "coach", note: "tosses to space" },
        { x: 4.5, y: 6, label: "D", team: "a", note: "ready, then chases" }
      ],
      paths: [
        { from: [4.4, 2.2], to: [2.4, 5.4], kind: "ball", label: "toss to space", curve: 0.12 },
        { from: [4.5, 6], to: [2.6, 5.4], kind: "move", label: "sprint & play up", curve: 0.2 }
      ],
      legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Player" }]
    }
  };
  E["bounce-and-dig"] = {
    diagram: {
      caption: "A gentle first dig: the coach bounces a ball hard off the floor so it pops up high and slow in front of the player. The player makes a platform, gets under it, and digs it back up to the coach. Move from bounces to soft tosses, then easy down-balls.",
      w: 9, h: 8,
      players: [
        { x: 4.5, y: 1.8, label: "C", team: "coach", note: "bounces ball" },
        { x: 4.5, y: 6, label: "D", team: "a", note: "digs in front" }
      ],
      paths: [
        { from: [4.4, 2.2], to: [4.4, 4.6], kind: "serve", label: "hard bounce", curve: 0.3 },
        { from: [4.6, 5.6], to: [4.6, 2.4], kind: "ball", label: "dig to coach", curve: -0.2 }
      ],
      legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Player" }]
    }
  };
  E["roll-the-ball-dig"] = {
    diagram: {
      caption: "The gentlest first dig: the coach rolls a ball slowly along the floor toward the player. The player gets VERY low, makes a platform, and lifts the rolling ball up to the coach. Focus on bent knees, a low body, and playing the ball in front.",
      w: 9, h: 8,
      players: [
        { x: 4.5, y: 1.8, label: "C", team: "coach", note: "rolls ball" },
        { x: 4.5, y: 6, label: "D", team: "a", note: "gets low" }
      ],
      paths: [
        { from: [4.4, 2.3], to: [4.4, 5.4], kind: "move", label: "rolls along floor", curve: 0 },
        { from: [4.6, 5.4], to: [4.6, 2.4], kind: "ball", label: "lift up to coach", curve: -0.2 }
      ],
      legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Player" }]
    }
  };

  // ---- Libero range ---------------------------------------------------------

  E["libero-dig-and-run-through"] = {
    diagrams: dk.seq(
      digRep({
        title: "Hard ball: dig high & middle", target: false, src: [4.5, 1.2],
        srcNote: "mixes hard & tip", hitLabel: "hard-driven ball",
        defLabel: "L", defNote: "libero",
        digLabel: "high to middle", digCurve: -0.15,
        caption: "A coach mixes hard-driven balls with soft tips. On a HARD ball, the libero digs high and to the middle from a low, stopped stance so a teammate can turn it into an attack."
      }),
      {
        title: "Tip: run through it", caption: "On a soft TIP short, the libero reads it and RUNS THROUGH the ball — playing it up while moving forward, not stopping — to keep it alive.",
        w: 9, h: 10, net: 2, lines: [{ y: 5.2 }], court: [{ x: 0, y: 2, w: 9, h: 7.6 }],
        players: [
          { x: 4.5, y: 1.2, label: "C", team: "coach", note: "tips short" },
          { x: 4.5, y: 8, label: "L", team: "a", note: "libero" }
        ],
        paths: [
          { from: [4.5, 1.6], to: [4.5, 5], kind: "ball", label: "soft tip", curve: 0.2 },
          { from: [4.5, 8], to: [4.5, 5.2], kind: "move", label: "run through", curve: 0 },
          { from: [4.5, 5.2], to: [6, 4], kind: "ball", label: "play up", curve: 0.2 }
        ],
        legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Libero" }]
      }
    )
  };

  // ---- Pursuit / emergency team defense -------------------------------------

  E["pursuit-emergency-defense"] = {
    diagrams: dk.seq(
      {
        title: "Wild ball off the net", caption: "A coach throws a wild ball off the net or deep behind the defenders. The first player turns and reads where it's going.",
        w: 9, h: 11, net: 2, lines: [{ y: 5.2 }], court: [{ x: 0, y: 2, w: 9, h: 8.6 }],
        players: [
          { x: 4.5, y: 1.2, label: "C", team: "coach", note: "throws it wild" },
          { x: 4.5, y: 6.6, label: "D1", team: "a", note: "chaser" },
          { x: 6.4, y: 7.4, label: "D2", team: "a", note: "cover" }
        ],
        paths: [{ from: [4.5, 1.6], to: [2.2, 9.6], kind: "serve", label: "wild ball deep", curve: 0.1 }],
        legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Defenders" }]
      },
      {
        title: "Chase, save & send over", caption: "D1 sprints it down and plays it up — often while facing AWAY from the net. D2 tracks that ball and sends it back over the net. Rotate so everyone chases and covers.",
        w: 9, h: 11, net: 2, lines: [{ y: 5.2 }], court: [{ x: 0, y: 2, w: 9, h: 8.6 }],
        players: [
          { x: 2.3, y: 9.4, label: "D1", team: "a", note: "saves facing away" },
          { x: 4.5, y: 7, label: "D2", team: "a", note: "tracks it" }
        ],
        paths: [
          { from: [4.5, 6.7], to: [2.5, 9.2], kind: "move", label: "sprint & save", curve: 0.2 },
          { from: [2.4, 9.2], to: [4.4, 7], kind: "ball", label: "play up", curve: 0.2 },
          { from: [4.5, 6.8], to: [5, 2.4], kind: "serve", label: "send over", curve: 0.1 }
        ],
        legend: [{ tone: "a", text: "Defenders" }]
      }
    )
  };

  // ---- Read, base, & team systems -------------------------------------------

  E["defensive-base-and-read"] = {
    diagrams: dk.seq(
      dk.basePositions({
        title: "Start in base", labels: ["B", "B", "MB", "LB", "", "RB"],
        feederNote: "ball set to hitter",
        caption: "Defenders start in their BASE spots as the ball is set to a hitter — two at the net to block, one middle, three deep."
      }),
      {
        title: "Read & move to the spot", caption: "As the hitter approaches, defenders read the set and the hitter's arm, move to their read spots, and get STOPPED and low just before contact. Then the coach hits or tips and they dig from a balanced stance.",
        w: 9, h: 10, net: 2, lines: [{ y: 5.2 }], court: [{ x: 0, y: 2, w: 9, h: 7.6 }],
        players: [
          { x: 2.4, y: 1, label: "C", team: "coach", note: "hits or tips" },
          { x: 2.6, y: 3.4, label: "B", team: "a", note: "block" },
          { x: 3.6, y: 3.4, label: "B", team: "a" },
          { x: 6.6, y: 7, label: "RB", team: "a", note: "line dig" },
          { x: 2, y: 8.2, label: "LB", team: "a", note: "angle dig" },
          { x: 4.5, y: 6.2, label: "MB", team: "a", note: "tips/short" }
        ],
        paths: [
          { from: [6.6, 7], to: [6.6, 6.2], kind: "move", curve: 0 },
          { from: [2, 8.2], to: [2.2, 7.4], kind: "move", curve: 0 },
          { from: [4.5, 6.2], to: [4.5, 5.6], kind: "move", label: "stop & read", curve: 0 },
          { from: [2.4, 1.4], to: [3, 4.4], kind: "serve", label: "attack", curve: 0.1 }
        ],
        legend: [{ tone: "coach", text: "Attack" }, { tone: "a", text: "Defenders" }]
      }
    )
  };
  E["youth-team-defense-positions"] = {
    diagram: dk.basePositions({
      labels: ["B", "B", "M", "L", "", "R"],
      feederNote: "attacks slowly from a pin",
      caption: "A first, walkable look at team defense: players stand in simple base spots (two block at the net, one middle, three deep) and each spot is named. The coach attacks slowly from a pin and the team moves to their read spots TOGETHER — walking through who covers tips, who covers the deep ball, and who backs up."
    })
  };
  E["perimeter-defense-system"] = {
    diagrams: dk.seq(
      dk.basePositions({
        title: "Base around a 2-block", labels: ["B", "B", "MB", "LB", "", "RB"],
        feederNote: "attacks from the pin",
        caption: "Set the base for a perimeter defense around a two-person block: the back-row players will spread to the EDGES of the court to cover the deep corners and the line."
      }),
      {
        title: "Spread to the perimeter", caption: "The coach attacks from a pin. Defenders move to the perimeter: one takes the LINE, one the deep CROSS, and the off-blocker pulls off the net to cover the short angle and tips. Run attacks from both pins so everyone learns each spot.",
        w: 9, h: 10, net: 2, lines: [{ y: 5.2 }], court: [{ x: 0, y: 2, w: 9, h: 7.6 }],
        zones: [{ x: 0.2, y: 6.4, w: 8.6, h: 3, tone: "good", label: "perimeter coverage" }],
        players: [
          { x: 6.8, y: 1, label: "C", team: "coach", note: "attacks from pin" },
          { x: 6, y: 3.4, label: "B", team: "a", note: "block" },
          { x: 7, y: 3.4, label: "B", team: "a" },
          { x: 7.4, y: 8.2, label: "RB", team: "a", note: "line" },
          { x: 1.4, y: 8.4, label: "LB", team: "a", note: "deep cross" },
          { x: 2.6, y: 5.6, label: "MB", team: "a", note: "off-blocker: angle/tip" }
        ],
        paths: [
          { from: [7.4, 8.2], to: [7.4, 8.6], kind: "move", curve: 0 },
          { from: [1.4, 8.4], to: [1.4, 8.6], kind: "move", curve: 0 },
          { from: [2.6, 4.2], to: [2.6, 5.4], kind: "move", label: "pull off net", curve: 0 },
          { from: [6.8, 1.4], to: [2, 8], kind: "serve", label: "cross attack", curve: 0.1 }
        ],
        legend: [{ tone: "coach", text: "Attack" }, { tone: "good", text: "Edges to cover" }, { tone: "a", text: "Defenders" }]
      }
    )
  };
  E["backcourt-spike-coverage"] = {
    diagrams: dk.seq(
      {
        title: "Deep base: line & angle", caption: "Put defenders deep: one on the LINE, one in the deep CROSS-court angle. They hold these deep spots against a big hitter.",
        w: 9, h: 10, net: 2, lines: [{ y: 5.2 }], court: [{ x: 0, y: 2, w: 9, h: 7.6 }],
        zones: [
          { x: 6, y: 6.4, w: 2.6, h: 3, tone: "good", label: "line" },
          { x: 0.4, y: 6.4, w: 2.6, h: 3, tone: "good", label: "deep cross" }
        ],
        players: [
          { x: 6.8, y: 1, label: "C", team: "coach", note: "hits from pin" },
          { x: 7.2, y: 8, label: "RB", team: "a", note: "line digger" },
          { x: 1.6, y: 8, label: "LB", team: "a", note: "angle digger" }
        ],
        legend: [{ tone: "coach", text: "Attack" }, { tone: "good", text: "Deep spots" }, { tone: "a", text: "Diggers" }]
      },
      {
        title: "Dig high to the middle", caption: "The coach attacks hard, alternating line and angle. Whichever defender owns that lane digs the hard ball HIGH to the middle of the court from a low, stopped base. Switch the attack between line and angle so defenders own both.",
        w: 9, h: 10, net: 2, lines: [{ y: 5.2 }], court: [{ x: 0, y: 2, w: 9, h: 7.6 }],
        players: [
          { x: 6.8, y: 1, label: "C", team: "coach" },
          { x: 1.6, y: 8, label: "LB", team: "a", note: "digs angle" },
          { x: 7.2, y: 8, label: "RB", team: "a" }
        ],
        paths: [
          { from: [6.8, 1.4], to: [1.8, 7.6], kind: "serve", label: "hard cross", curve: 0.1 },
          { from: [1.6, 7.8], to: [4.5, 5.4], kind: "ball", label: "dig high & middle", curve: 0.2 }
        ],
        legend: [{ tone: "coach", text: "Attack" }, { tone: "a", text: "Diggers" }]
      }
    )
  };

  // ---- Tip coverage & blocked-ball cover ------------------------------------

  E["tip-coverage-behind-block"] = {
    diagrams: dk.seq(
      {
        title: "Read: tip or swing?", caption: "A coach or hitter attacks over a two-person block. The back-row defenders start STOPPED behind the block, reading whether a tip or a hard swing is coming. The hole behind the block is where smart hitters tip.",
        w: 9, h: 10, net: 2, lines: [{ y: 5.2 }], court: [{ x: 0, y: 2, w: 9, h: 7.6 }],
        zones: [{ x: 3, y: 5.4, w: 3, h: 1.6, tone: "avoid", label: "tip hole" }],
        players: [
          { x: 4.5, y: 1, label: "C", team: "coach", note: "tips or hits" },
          { x: 3.8, y: 3.4, label: "B", team: "a", note: "block" },
          { x: 5.2, y: 3.4, label: "B", team: "a" },
          { x: 2.4, y: 8, label: "LB", team: "a" },
          { x: 4.5, y: 8.4, label: "MB", team: "a", note: "reads tip" },
          { x: 6.6, y: 8, label: "RB", team: "a" }
        ],
        paths: [{ from: [4.5, 1.4], to: [4.5, 5.6], kind: "ball", label: "tip behind block", curve: 0.15 }],
        legend: [{ tone: "coach", text: "Attack" }, { tone: "avoid", text: "Tip drops here" }, { tone: "a", text: "Defenders" }]
      },
      {
        title: "Sprint up & play it", caption: "When they read a TIP, the defender explodes FORWARD into the short court behind the block and plays it up high. Mix tips with hard swings so defenders must read which is coming before they move.",
        w: 9, h: 10, net: 2, lines: [{ y: 5.2 }], court: [{ x: 0, y: 2, w: 9, h: 7.6 }],
        players: [
          { x: 4.5, y: 1, label: "C", team: "coach" },
          { x: 4.5, y: 5.6, label: "MB", team: "a", note: "ran up to tip" }
        ],
        paths: [
          { from: [4.5, 8.2], to: [4.5, 6], kind: "move", label: "sprint forward", curve: 0 },
          { from: [4.5, 5.8], to: [6, 4.4], kind: "ball", label: "play up", curve: 0.2 }
        ],
        legend: [{ tone: "coach", text: "Attack" }, { tone: "a", text: "Defender" }]
      }
    )
  };
  E["off-the-block-cover"] = {
    diagrams: dk.seq(
      {
        title: "Our hitter gets blocked", caption: "Our own hitter attacks into the opposing block, and the ball rebounds BACK onto our side. Teammates must be ready to cover, not watching.",
        w: 9, h: 10, net: 2, lines: [{ y: 5.2 }], court: [{ x: 0, y: 2, w: 9, h: 7.6 }],
        players: [
          { x: 2.6, y: 4.4, label: "H", team: "a", note: "our hitter" },
          { x: 2.6, y: 2.6, label: "B", team: "n", note: "their block" },
          { x: 4.6, y: 6, label: "", team: "a" },
          { x: 6.4, y: 6.4, label: "", team: "a" },
          { x: 3.4, y: 7.4, label: "", team: "a" }
        ],
        paths: [
          { from: [2.6, 4], to: [2.6, 3], kind: "serve", label: "swing", curve: 0 },
          { from: [2.6, 3], to: [3.6, 5.4], kind: "ball", label: "blocked back", curve: 0.2 }
        ],
        legend: [{ tone: "a", text: "Our team" }, { tone: "n", text: "Their block" }]
      },
      {
        title: "Swarm low & cover", caption: "Teammates drop LOW and close in tight around the hitter to dig the rebound, then play the blocked ball up to the setter to run another attack. Repeat so players cover on EVERY swing, not just react after.",
        w: 9, h: 10, net: 2, lines: [{ y: 5.2 }], court: [{ x: 0, y: 2, w: 9, h: 7.6 }],
        zones: [{ x: 1.2, y: 4.4, w: 3.2, h: 2.6, tone: "good", label: "cover the hitter" }],
        players: [
          { x: 2.6, y: 4.4, label: "H", team: "a", note: "hitter" },
          { x: 3.8, y: 5.6, label: "", team: "a", note: "covers low" },
          { x: 1.8, y: 5.8, label: "", team: "a", note: "covers low" },
          { x: 6.4, y: 4.2, label: "St", team: "a", note: "setter" }
        ],
        paths: [
          { from: [3.6, 5.4], to: [4, 6], kind: "move", curve: 0 },
          { from: [2.8, 5.2], to: [6.2, 4.4], kind: "ball", label: "up to setter", curve: 0.25 }
        ],
        legend: [{ tone: "good", text: "Swarm here" }, { tone: "a", text: "Our team" }]
      }
    )
  };

  // ---- Dig-to-attack transition ---------------------------------------------

  E["transition-dig-to-attack"] = {
    diagrams: dk.seq(
      digRep({
        title: "Dig to the setter", src: [4.5, 1.2],
        srcNote: "attacks at defenders", hitLabel: "attack",
        digLabel: "dig to target",
        caption: "A coach attacks at the back-row defenders, who dig the ball to the SETTER target at right-front. A clean dig to target is what makes the counter-attack possible."
      }),
      {
        title: "Set & counter-attack", caption: "The setter sets the dug ball and a hitter TRANSITIONS off the net to attack the counter. Only score the rally if the dig led to a controlled counter-attack. Rotate so everyone digs, sets, and attacks.",
        w: 9, h: 10, net: 2, lines: [{ y: 5.2 }], court: [{ x: 0, y: 2, w: 9, h: 7.6 }],
        players: [
          { x: 6.6, y: 4, label: "St", team: "a", note: "setter" },
          { x: 2.4, y: 5.8, label: "H", team: "a", note: "transitions in" }
        ],
        paths: [
          { from: [6.6, 4], to: [2.8, 4], kind: "ball", label: "set", curve: 0.25 },
          { from: [2.4, 5.8], to: [2.6, 4.4], kind: "move", label: "approach", curve: 0 },
          { from: [2.6, 4], to: [5, 2.4], kind: "serve", label: "counter-attack", curve: 0.1 }
        ],
        legend: [{ tone: "a", text: "Our team" }]
      }
    )
  };

})(window.RR);
