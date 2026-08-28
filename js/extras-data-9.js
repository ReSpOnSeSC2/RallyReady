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
    var sourceId = o.sourceId;
    var defenderId = o.defenderId;
    var setterId = o.setterId;
    var spec = {
      title: o.title, caption: o.caption,
      w: 9, h: 10, net: 2, lines: [{ y: 5.2 }],
      court: [{ x: 0, y: 2, w: 9, h: 7.6 }],
      players: [
        { id: sourceId, x: src[0], y: src[1], label: o.srcLabel || "C",
          team: o.srcTeam || "coach", role: sourceId ? "attacking coach" : undefined,
          note: o.srcNote || "hits at defender" },
        { id: defenderId, x: dx, y: dy, label: o.defLabel || "D", team: "a",
          role: defenderId ? "back-row defender" : undefined, note: o.defNote || "digger" }
      ],
      paths: [
        { from: [src[0], src[1] + 0.4], to: [dx, dy - 0.4], kind: "serve",
          label: o.hitLabel || "hard ball", curve: o.hitCurve != null ? o.hitCurve : 0.1,
          fromActor: sourceId, toActor: defenderId }
      ],
      legend: [{ tone: o.srcTeam === "b" ? "b" : "coach", text: o.srcLegend || "Coach" }, { tone: "a", text: "Defender" }]
    };
    if (o.target !== false) {
      spec.players.push({ id: setterId, x: 6.6, y: 4, label: "St", team: "a",
        role: setterId ? "setter" : undefined, note: "setter target" });
      spec.zones = [{ x: 5.8, y: 3.2, w: 1.8, h: 1.6, tone: "target", label: "setter" }];
      spec.paths.push({ from: [dx, dy - 0.5], to: [6.5, 4.2], kind: "ball",
        label: o.digLabel || "dig high", curve: o.digCurve != null ? o.digCurve : 0.2,
        fromActor: defenderId, toActor: setterId });
      spec.legend.push({ tone: "target", text: "Dig to here" });
    } else {
      // No setter: just dig high to the middle of the court.
      spec.paths.push({ from: [dx, dy - 0.5], to: [4.5, 5.6], kind: "ball", label: o.digLabel || "dig high & middle", curve: -0.15 });
    }
    if (sourceId && defenderId) {
      spec.motionChains = [[0, 1]];
      spec.contacts = [
        { order: 1, actor: sourceId, toActor: defenderId, action: "attack", pathIndex: 0 },
        { order: 2, actor: defenderId, toActor: setterId,
          action: "dig", pathIndex: 1 }
      ];
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
    // This scene is deliberately explicit instead of using the generic coach
    // feed template. Each ball has two factual contacts (coach attack, then
    // defender dig) and every back-court player owns one complete repetition.
    // That prevents an unlabeled ball arrow from becoming a running route or
    // activating only the two outside defenders.
    diagram: {
      caption: "Three defenders work one at a time. The coach sends a controlled down-ball to left back, middle back, then right back. Each defender is stopped and low before contact, locks a clean platform, and digs HIGH to the middle target before the group rotates.",
      w: 9, h: 10, net: 2.2, operation: "rotation",
      lines: [{ y: 5.2 }],
      court: [{ x: 0, y: 2.2, w: 9, h: 7.4 }],
      zones: [{ x: 3.75, y: 4.45, w: 1.5, h: 1.15, tone: "target", label: "HIGH DIG TARGET" }],
      players: [
        { id: "downball-coach", x: 4.5, y: 0.9, label: "C", team: "coach", note: "controlled down-ball attack" },
        { id: "downball-left", x: 1.6, y: 8.6, label: "LB", team: "a", note: "left-back defender" },
        { id: "downball-middle", x: 4.5, y: 8.6, label: "MB", team: "a", note: "middle-back defender" },
        { id: "downball-right", x: 7.4, y: 8.6, label: "RB", team: "a", note: "right-back defender" }
      ],
      paths: [
        { from: [1.6, 8.6], to: [1.6, 8.6], kind: "move", actor: "downball-left",
          action: "defensive-ready", hideLabel: true, stepIndices: [0], sequenceOrder: 0,
          simultaneousGroup: "all-downball-defenders-ready" },
        { from: [4.5, 8.6], to: [4.5, 8.6], kind: "move", actor: "downball-middle",
          action: "defensive-ready", hideLabel: true, stepIndices: [0], sequenceOrder: 0,
          simultaneousGroup: "all-downball-defenders-ready" },
        { from: [7.4, 8.6], to: [7.4, 8.6], kind: "move", actor: "downball-right",
          action: "defensive-ready", hideLabel: true, stepIndices: [0], sequenceOrder: 0,
          simultaneousGroup: "all-downball-defenders-ready" },
        { from: [4.5, 1.4], to: [1.6, 8.1], kind: "ball",
          hideLabel: true, stepIndices: [1], sequenceOrder: 0 },
        { from: [4.5, 1.4], to: [4.5, 8.1], kind: "ball",
          hideLabel: true, stepIndices: [1], sequenceOrder: 1 },
        { from: [4.5, 1.4], to: [7.4, 8.1], kind: "ball",
          hideLabel: true, stepIndices: [1], sequenceOrder: 2 },
        { from: [1.6, 8.1], to: [4.5, 5.05], kind: "ball",
          hideLabel: true, stepIndices: [2], sequenceOrder: 0,
          toEndpoint: { type: "target", label: "high middle dig target" } },
        { from: [4.5, 8.1], to: [4.5, 5.05], kind: "ball",
          hideLabel: true, stepIndices: [2], sequenceOrder: 1,
          toEndpoint: { type: "target", label: "high middle dig target" } },
        { from: [7.4, 8.1], to: [4.5, 5.05], kind: "ball",
          hideLabel: true, stepIndices: [2], sequenceOrder: 2,
          toEndpoint: { type: "target", label: "high middle dig target" } },
        { from: [1.6, 8.6], to: [4.5, 8.6], kind: "move", actor: "downball-left",
          action: "shuffle", hideLabel: true, stepIndices: [3], sequenceOrder: 0,
          simultaneousGroup: "downball-defender-rotation" },
        { from: [4.5, 8.6], to: [7.4, 8.6], kind: "move", actor: "downball-middle",
          action: "shuffle", hideLabel: true, stepIndices: [3], sequenceOrder: 0,
          simultaneousGroup: "downball-defender-rotation" },
        { from: [7.4, 8.6], via: [[8.15, 9.3], [0.85, 9.3]], to: [1.6, 8.6],
          kind: "move", actor: "downball-right", action: "shuffle", hideLabel: true,
          stepIndices: [3], sequenceOrder: 0,
          simultaneousGroup: "downball-defender-rotation" }
      ],
      contacts: [
        { pathIndex: 3, actor: "downball-coach", toActor: "downball-left", action: "down-ball-hit", order: 1 },
        { pathIndex: 4, actor: "downball-coach", toActor: "downball-middle", action: "down-ball-hit", order: 2 },
        { pathIndex: 5, actor: "downball-coach", toActor: "downball-right", action: "down-ball-hit", order: 3 },
        { pathIndex: 6, actor: "downball-left", action: "platform dig high to middle", order: 1 },
        { pathIndex: 7, actor: "downball-middle", action: "platform dig high to middle", order: 2 },
        { pathIndex: 8, actor: "downball-right", action: "platform dig high to middle", order: 3 }
      ],
      legend: [
        { tone: "coach", text: "Coach / down-ball source" },
        { tone: "a", text: "Defenders rotate LB → MB → RB" },
        { tone: "target", text: "High middle dig target" }
      ]
    }
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
          { x: 4.4, y: 6, label: "D", team: "a", note: "starts centered" }
        ],
        paths: [
          { from: [4.4, 6], to: [2.6, 6], kind: "move", label: "shuffle behind ball", curve: 0, playerIndex: 1 },
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
          { x: 6.6, y: 6.4, label: "", team: "n", note: "roll/sprawl out" }
        ],
        paths: [{
          from: [4.7, 5.9], via: [[6.4, 6.3]], to: [5.5, 5.2],
          kind: "move", label: "extend & roll → pop up", curve: 0,
          playerIndex: 0
        }],
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
          { id: "pancake-coach", x: 4.5, y: 1.8, label: "C", team: "coach", note: "varies the short toss" },
          { id: "pancake-defender", x: 4.5, y: 5.8, label: "D", team: "a", note: "slides hand under" }
        ],
        balls: [{ x: 3.4, y: 4.6 }],
        paths: [
          { from: [4.5, 2.2], to: [3.8, 4.8], kind: "ball", label: "controlled short toss", curve: 0.14,
            fromActor: "pancake-coach", toActor: "pancake-defender" },
          { from: [4.5, 5.6], to: [3.8, 4.8], kind: "move", label: "reach & slide", curve: 0.15,
            actor: "pancake-defender", playerIndex: 1 },
          { from: [3.6, 4.7], to: [3.4, 3.6], kind: "ball", label: "pancake pops it up", curve: 0,
            fromActor: "pancake-defender", toEndpoint: { type: "zone", label: "Saved ball apex" } }
        ],
        motionChains: [[0, 2]],
        contacts: [
          { pathIndex: 0, actor: "pancake-coach", toActor: "pancake-defender", action: "controlled toss", order: 1 },
          { pathIndex: 2, actor: "pancake-defender", action: "pancake save", order: 2 }
        ],
        legend: [{ tone: "coach", text: "Coach / tosser" }, { tone: "a", text: "Defender" }, { tone: "n", text: "Saved ball" }]
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
          { x: 4.5, y: 6.7, label: "D1", team: "a", note: "chases the wild ball" },
          { x: 6.4, y: 7.4, label: "D2", team: "a", note: "tracks the save" }
        ],
        paths: [
          { from: [4.5, 6.7], to: [2.5, 9.2], kind: "move", label: "sprint & save", curve: 0.2, playerIndex: 0 },
          { from: [2.4, 9.2], to: [6.2, 7.4], kind: "ball", label: "play up", curve: 0.2 },
          { from: [6.4, 7.2], to: [5, 2.4], kind: "serve", label: "send over", curve: 0.1 }
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
        playerIds: ["read-block-line", "read-block-close", "read-short", "read-left-back", "read-center-back", "read-right-back"],
        playerRoles: ["line blocker", "closing blocker", "short defender", "left-back defender", "center-back defender", "right-back defender"],
        feederId: "read-opponent-setter", feederLabel: "St", feederTeam: "b",
        feederRole: "opponent setter", feederNote: "sets the pin hitter",
        extraPlayers: [{ id: "read-opponent-hitter", x: 2.4, y: 1.25, label: "H",
          team: "b", role: "opponent pin hitter", facing: "south", note: "approaches the set" }],
        paths: [{ from: [4.5, 1.25], to: [2.5, 1.55], kind: "ball", label: "outside set",
          fromActor: "read-opponent-setter", toActor: "read-opponent-hitter" }],
        contacts: [{ order: 1, actor: "read-opponent-setter", toActor: "read-opponent-hitter",
          action: "outside set", pathIndex: 0 }],
        caption: "Defenders start in their BASE spots as the ball is set to a hitter — two at the net to block, one middle, three deep."
      }),
      {
        title: "Read & move to the spot", caption: "As the hitter approaches, all six defenders read together: two form the block, short and perimeter defenders move to their lanes, and everyone is stopped before the pin hitter attacks. The left-back defender digs the shown cross-court ball high to a playable target.",
        w: 9, h: 10, net: 2, operation: "parallel", lines: [{ y: 5.2 }], court: [{ x: 0, y: 2, w: 9, h: 7.6 }],
        players: [
          { id: "read-opponent-hitter", x: 2.4, y: 1, label: "H", team: "b", role: "opponent pin hitter", facing: "south", note: "hits or tips" },
          { id: "read-block-line", x: 2.6, y: 3.4, label: "B1", team: "a", role: "line blocker", facing: "north", note: "sets the line block" },
          { id: "read-block-close", x: 3.6, y: 3.4, label: "B2", team: "a", role: "closing blocker", facing: "north", note: "closes the seam" },
          { id: "read-right-back", x: 6.6, y: 7, label: "RB", team: "a", role: "right-back defender", facing: "north", note: "line dig" },
          { id: "read-left-back", x: 2, y: 8.2, label: "LB", team: "a", role: "left-back defender", facing: "north", note: "angle dig" },
          { id: "read-short", x: 4.5, y: 6.2, label: "S", team: "a", role: "short defender", facing: "north", note: "tips/short" },
          { id: "read-center-back", x: 4.5, y: 8.8, label: "CB", team: "a", role: "center-back defender", facing: "north", note: "deep seam" }
        ],
        paths: [
          { from: [2.6, 3.4], to: [2.35, 3.2], kind: "move", label: "set line block", curve: 0,
            actor: "read-block-line", playerIndex: 1, sequenceOrder: 0, simultaneousGroup: "read-defense-shape" },
          { from: [3.6, 3.4], to: [3.15, 3.2], kind: "move", label: "close block", curve: 0,
            actor: "read-block-close", playerIndex: 2, sequenceOrder: 0, simultaneousGroup: "read-defense-shape" },
          { from: [6.6, 7], to: [6.6, 6.2], kind: "move", label: "hold line", curve: 0,
            actor: "read-right-back", playerIndex: 3, sequenceOrder: 0, simultaneousGroup: "read-defense-shape" },
          { from: [2, 8.2], to: [2.2, 7.4], kind: "move", label: "take cross", curve: 0,
            actor: "read-left-back", playerIndex: 4, sequenceOrder: 0, simultaneousGroup: "read-defense-shape" },
          { from: [4.5, 6.2], to: [4.5, 5.6], kind: "move", label: "stop & read short", curve: 0,
            actor: "read-short", playerIndex: 5, sequenceOrder: 0, simultaneousGroup: "read-defense-shape" },
          { from: [4.5, 8.8], to: [4.7, 8.35], kind: "move", label: "protect deep seam", curve: 0,
            actor: "read-center-back", playerIndex: 6, sequenceOrder: 0, simultaneousGroup: "read-defense-shape" },
          { from: [2.4, 1.4], to: [2.2, 7.4], kind: "serve", label: "cross attack", curve: 0.1,
            fromActor: "read-opponent-hitter", toActor: "read-left-back", sequenceOrder: 1 },
          { from: [2.2, 7.4], to: [5.8, 4.8], kind: "ball", label: "balanced dig high", curve: 0.2,
            fromActor: "read-left-back", toEndpoint: { type: "target", label: "Playable dig target" },
            sequenceOrder: 2 }
        ],
        motionChains: [[6, 7]],
        contacts: [
          { order: 1, actor: "read-opponent-hitter", toActor: "read-left-back", action: "attack", pathIndex: 6 },
          { order: 2, actor: "read-left-back", action: "dig", pathIndex: 7 }
        ],
        legend: [{ tone: "coach", text: "Attack" }, { tone: "a", text: "Defenders" }]
      }
    )
  };
  E["youth-team-defense-positions"] = {
    diagram: dk.basePositions({
      labels: ["B", "B", "M", "L", "", "R"],
      playerIds: ["youth-block-line", "youth-block-close", "youth-short", "youth-left-back", "youth-center-back", "youth-right-back"],
      playerRoles: ["line blocker", "closing blocker", "short defender", "left-back defender", "center-back defender", "right-back defender"],
      feederId: "youth-defense-coach", feederRole: "pin attacking coach",
      feederX: 2.1,
      feederNote: "attacks slowly from a pin",
      caption: "A first, walkable look at team defense: players stand in simple base spots (two block at the net, one middle, three deep) and each spot is named. The coach attacks slowly from a pin and the team moves to their read spots TOGETHER — walking through who covers tips, who covers the deep ball, and who backs up.",
      paths: [
        { from: [2.1, 1.25], to: [7.8, 8.75], kind: "serve", label: "slow pin attack", curve: 0.14,
          fromActor: "youth-defense-coach", toActor: "youth-right-back", sequenceOrder: 1 },
        { from: [2.6, 3.4], to: [2.3, 3.25], kind: "move", label: "set block", playerIndex: 1,
          actor: "youth-block-line", sequenceOrder: 0, simultaneousGroup: "youth-defense-read" },
        { from: [6.4, 3.4], to: [3.35, 3.35], kind: "move", label: "close", playerIndex: 2,
          actor: "youth-block-close", sequenceOrder: 0, simultaneousGroup: "youth-defense-read" },
        { from: [4.5, 5.8], to: [2.8, 5.25], kind: "move", label: "tip cover", playerIndex: 3,
          actor: "youth-short", sequenceOrder: 0, simultaneousGroup: "youth-defense-read" },
        { from: [1.5, 8.4], to: [1.15, 7.65], kind: "move", label: "line", playerIndex: 4,
          actor: "youth-left-back", sequenceOrder: 0, simultaneousGroup: "youth-defense-read" },
        { from: [4.5, 9.2], to: [4.65, 8.55], kind: "move", label: "deep angle", playerIndex: 5,
          actor: "youth-center-back", sequenceOrder: 0, simultaneousGroup: "youth-defense-read" },
        { from: [7.5, 8.4], to: [7.8, 8.75], kind: "move", label: "deep cross", playerIndex: 6,
          actor: "youth-right-back", sequenceOrder: 0, simultaneousGroup: "youth-defense-read" },
        { from: [7.8, 8.75], to: [4.5, 5.4], kind: "ball", label: "dig high to middle", curve: 0.2,
          fromActor: "youth-right-back", toEndpoint: { type: "target", label: "Playable middle" }, sequenceOrder: 2 }
      ],
      contacts: [
        { order: 1, actor: "youth-defense-coach", toActor: "youth-right-back", action: "controlled attack", pathIndex: 0 },
        { order: 2, actor: "youth-right-back", action: "dig", pathIndex: 7 }
      ],
      motionChains: [[0, 7]],
      operation: "parallel"
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
        w: 9, h: 10, net: 2, operation: "parallel", lines: [{ y: 5.2 }], court: [{ x: 0, y: 2, w: 9, h: 7.6 }],
        zones: [{ x: 0.2, y: 6.4, w: 8.6, h: 3, tone: "good", label: "perimeter coverage" }],
        players: [
          { x: 6.8, y: 1, label: "C", team: "coach", note: "attacks from pin" },
          { x: 6, y: 3.4, label: "B", team: "a", note: "block" },
          { x: 7, y: 3.4, label: "B", team: "a" },
          { x: 7.4, y: 8.2, label: "RB", team: "a", note: "line" },
          { x: 1.4, y: 8.4, label: "LB", team: "a", note: "deep cross" },
          { x: 2.6, y: 4.2, label: "MB", team: "a", note: "off-blocker pulls to angle/tip" },
          { x: 4.5, y: 9, label: "CB", team: "a", note: "deep middle / seam" }
        ],
        paths: [
          { from: [6.8, 1.4], to: [2, 8], kind: "serve", label: "cross attack", curve: 0.1 },
          { from: [7.4, 8.2], to: [7.4, 8.6], kind: "move", label: "hold line", curve: 0, playerIndex: 3 },
          { from: [1.4, 8.4], to: [1.4, 8.6], kind: "move", label: "hold deep cross", curve: 0, playerIndex: 4 },
          { from: [2.6, 4.2], to: [2.6, 5.4], kind: "move", label: "pull off net", curve: 0, playerIndex: 5 },
          { from: [4.5, 9], to: [4.7, 8.65], kind: "move", label: "deep seam", curve: 0, playerIndex: 6 }
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
          { x: 3.8, y: 3.4, label: "B", team: "a", note: "block" },
          { x: 5.2, y: 3.4, label: "B", team: "a", note: "block" },
          { x: 2.4, y: 8, label: "LB", team: "a", note: "holds hard swing" },
          { x: 4.5, y: 8.2, label: "MB", team: "a", note: "reads then sprints" },
          { x: 6.6, y: 8, label: "RB", team: "a", note: "holds hard swing" }
        ],
        paths: [
          { from: [4.5, 8.2], to: [4.5, 6], kind: "move", label: "sprint forward", curve: 0, playerIndex: 4 },
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
        sourceId: "dig-counter-coach", defenderId: "dig-counter-defender",
        setterId: "dig-counter-setter",
        srcNote: "attacks at defenders", hitLabel: "attack",
        digLabel: "dig to target",
        caption: "A coach attacks at the back-row defenders, who dig the ball to the SETTER target at right-front. A clean dig to target is what makes the counter-attack possible."
      }),
      {
        title: "Set & counter-attack", caption: "The complete counter sequence stays connected: the coach attacks, the defender digs to target, the hitter transitions off, the setter sets, and that same hitter attacks the open court. Only score when every contact remains controlled.",
        w: 9, h: 10, net: 2, lines: [{ y: 5.2 }], court: [{ x: 0, y: 2, w: 9, h: 7.6 }],
        players: [
          { id: "dig-counter-coach", x: 4.5, y: 1.2, label: "C", team: "coach", role: "attacking coach", note: "entered attack" },
          { id: "dig-counter-defender", x: 4.5, y: 8.2, label: "D", team: "a", role: "back-row defender", note: "makes the dig" },
          { id: "dig-counter-setter", x: 6.6, y: 4, label: "St", team: "a", role: "setter", note: "setter" },
          { id: "dig-counter-hitter", x: 2.4, y: 5.8, label: "H", team: "a", role: "transition hitter", note: "transitions in" }
        ],
        paths: [
          { from: [4.5, 1.6], to: [4.5, 7.8], kind: "serve", label: "coach attack", curve: 0.1,
            fromActor: "dig-counter-coach", toActor: "dig-counter-defender", sequenceOrder: 0 },
          { from: [4.5, 7.8], to: [6.5, 4.2], kind: "ball", label: "dig to target", curve: 0.2,
            fromActor: "dig-counter-defender", toActor: "dig-counter-setter", sequenceOrder: 1 },
          { from: [2.4, 5.8], to: [2.6, 4.4], kind: "move", label: "transition approach", curve: 0,
            playerIndex: 3, actor: "dig-counter-hitter", sequenceOrder: 2 },
          { from: [6.6, 4], to: [2.8, 4], kind: "ball", label: "set", curve: 0.25,
            fromActor: "dig-counter-setter", toActor: "dig-counter-hitter", sequenceOrder: 3 },
          { from: [2.6, 4], to: [5, 2.4], kind: "serve", label: "counter-attack", curve: 0.1,
            fromActor: "dig-counter-hitter", toEndpoint: { type: "target", label: "Counter-attack target" }, sequenceOrder: 4 }
        ],
        motionChains: [[0, 1, 3, 4]],
        contacts: [
          { order: 1, actor: "dig-counter-coach", toActor: "dig-counter-defender", action: "attack", pathIndex: 0 },
          { order: 2, actor: "dig-counter-defender", toActor: "dig-counter-setter", action: "dig", pathIndex: 1 },
          { order: 3, actor: "dig-counter-setter", toActor: "dig-counter-hitter", action: "set", pathIndex: 3 },
          { order: 4, actor: "dig-counter-hitter", action: "counter-attack", pathIndex: 4 }
        ],
        legend: [{ tone: "a", text: "Our team" }]
      }
    )
  };

})(window.RR);
