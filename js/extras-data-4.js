// extras-data-4.js — SERVING drill diagrams (RR.extras).
//
// One entry per serving drill. Serving is almost purely spatial: a server
// behind the near end line firing across the net into far-court targets, so
// nearly every drill is a single `serveTargets`-style picture with target
// zones tuned to THIS drill (deep corners, short middle, zone 1/5/6, a seam,
// the left/right halves, a ladder of serving distances). Drills with two
// distinct spatial parts (serve then sprint to a base; mark the seam then add
// a live passer) use a `diagrams: [...]` sequence with a `title` per step.
//
// Follows the passing exemplar (extras-data-3.js): IIFE wrapper, small local
// helpers, table-like entries. Pure data — no engine/CSS/global changes.
window.RR = window.RR || {};
RR.extras = RR.extras || {};

(function (RR) {
  "use strict";
  var dk = RR.dk;
  var E = RR.extras;

  // A single server behind the near end line firing across the net into a set
  // of target zones. Like dk.serveTargets but with one labelled server and a
  // start-spot note, which most of these solo-progression drills want. The
  // serve path runs to the FIRST listed zone unless `aim` picks another index.
  function serve(o) {
    o = o || {};
    var sx = o.serverX != null ? o.serverX : 4.5;
    var sy = o.serverY != null ? o.serverY : 12.2;
    var zones = o.zones || [
      { x: 0.5, y: 0.7, w: 3, h: 2.4, tone: "target", label: "1" },
      { x: 5.5, y: 0.7, w: 3, h: 2.4, tone: "target", label: "5" }
    ];
    var players = [{ x: sx, y: sy, label: o.serverLabel || "S", team: "a", note: o.serverNote || "server" }];
    if (o.extraPlayers) o.extraPlayers.forEach(function (p) { players.push(p); });
    var ai = o.aim != null ? o.aim : 0;
    var az = zones[ai];
    var paths = o.paths || [{
      from: [sx, sy - 0.3],
      to: [az.x + az.w / 2, az.y + az.h / 2],
      kind: "serve", label: o.serveLabel || "serve", curve: o.serveCurve != null ? o.serveCurve : 0.22
    }];
    var spec = {
      title: o.title, caption: o.caption,
      w: 9, h: 13.4, net: 6,
      lines: [{ y: 3 }, { y: 9 }],
      court: [{ x: 0, y: 0, w: 9, h: 12 }],
      zones: zones, players: players, paths: paths,
      legend: o.legend || [{ tone: "target", text: "Aim here" }, { tone: "a", text: "Server" }]
    };
    if (o.cones) spec.cones = o.cones;
    return spec;
  }

  // ---- Overhand float / topspin mechanics (start spot → target) -------------

  E["standing-float-serve-progression"] = {
    diagram: serve({
      serverNote: "start mid-court, move back",
      serveLabel: "flat float", serveCurve: 0.05,
      zones: [{ x: 1, y: 1, w: 7, h: 2.6, tone: "target", label: "just get it deep & in" }],
      caption: "Standing overhand float: low steady toss in front of the hitting shoulder, firm flat hand, STOP the hand at contact so it wobbles. Start from mid-court and move back to the end line as you get more over."
    })
  };
  E["topspin-serve-progression"] = {
    diagram: serve({
      serverNote: "start mid-court, move back",
      serveLabel: "topspin drops", serveCurve: -0.18,
      zones: [{ x: 1.5, y: 5.2, w: 6, h: 2.4, tone: "target", label: "drops in deep-court" }],
      caption: "Topspin serve: higher toss out front, load the arm like a spike, hit the lower-back of the ball and snap the wrist over the top so the spin pulls it DOWN into the court. Start mid-court, move back to the end line as it gets consistent."
    })
  };
  E["jump-float-serve"] = {
    diagram: serve({
      serverY: 12.6, serverNote: "1–2 step approach", serverLabel: "JF",
      serveLabel: "jump float", serveCurve: 0.05,
      extraPlayers: [{ x: 4.5, y: 11, label: "", team: "n", note: "land balanced, ready" }],
      paths: [
        { from: [4.5, 12.6], to: [4.5, 11.4], kind: "move", label: "short approach & jump", curve: 0 },
        { from: [4.5, 11], to: [2.4, 1.9], kind: "serve", label: "stiff no-spin hit", curve: 0.12 }
      ],
      zones: [{ x: 0.8, y: 0.7, w: 3.2, h: 2.6, tone: "target", label: "deep, hard to pass" }],
      caption: "Jump float: hold the ball in the hitting hand, take a one- or two-step approach to a small jump, toss out front with no spin, hit the middle with a firm flat hand at the top and STOP — then land balanced inside the end line ready for defense."
    })
  };
  E["jump-topspin-serve"] = {
    diagram: serve({
      serverY: 13, serverLabel: "JT", serverNote: "full hitter's approach",
      extraPlayers: [{ x: 4.5, y: 11.2, label: "", team: "n", note: "land inside, ready" }],
      paths: [
        { from: [3.6, 13], to: [4.5, 11.6], kind: "move", label: "approach → takeoff", curve: 0.15 },
        { from: [4.5, 11.2], to: [4.5, 5.6], kind: "serve", label: "hard topspin, drives down", curve: -0.22 }
      ],
      zones: [{ x: 2.5, y: 4.6, w: 4, h: 2.4, tone: "target", label: "driven down into court" }],
      caption: "Jump topspin — the most aggressive serve: high spinning toss well in front and INTO the court, a hitter's approach to a two- or one-foot takeoff behind the end line, swing hard and snap over the top to drive topspin down. Land inside the court, balanced and ready."
    })
  };
  E["underhand-serve-progression"] = {
    diagram: serve({
      serverY: 9.6, serverNote: "start close, move back",
      serveLabel: "underhand", serveCurve: 0.18,
      zones: [{ x: 1.5, y: 1.5, w: 6, h: 3, tone: "target", label: "anywhere over & in" }],
      caption: "Underhand serve — every young player's first: opposite foot forward, ball on the open hand at waist height, firm fist, step and swing forward hitting the bottom-back off your hand, follow through toward your target over the net. Start close and step back as you get it over."
    })
  };

  // ---- Toss-only (no hit): the WHERE of the toss & start spot ----------------

  E["serving-toss-consistency"] = {
    diagram: {
      caption: "Toss-only, no hit: ball on the open hand, toss it straight up just in front of the hitting shoulder and let it land on the SAME marked spot every time. Mark a spot on the floor by the serving start and groove a repeatable toss before adding the swing back.",
      w: 9, h: 7,
      players: dk.spread(4, 1.6, 7.4).map(function (x) { return { x: x, y: 5, label: "", team: "a" }; }),
      cones: dk.spread(4, 1.6, 7.4).map(function (x) { return { x: x + 0.3, y: 4.3 }; }),
      paths: dk.spread(4, 1.6, 7.4).map(function (x) {
        return { from: [x + 0.3, 4.7], to: [x + 0.3, 2], kind: "ball", curve: 0.18 };
      }),
      legend: [{ tone: "a", text: "Servers (toss only)" }]
    }
  };

  // ---- Accuracy: aim at specific zones --------------------------------------

  E["serving-to-zones"] = {
    diagram: serve({
      serverNote: "serves the called zone",
      serveLabel: "to called zone", serveCurve: 0.2,
      cones: [{ x: 2, y: 9.6 }, { x: 7, y: 9.6 }, { x: 4.5, y: 8.4 }],
      zones: [
        { x: 0.5, y: 7.6, w: 3, h: 3, tone: "target", label: "1" },
        { x: 5.5, y: 7.6, w: 3, h: 3, tone: "target", label: "5" },
        { x: 3, y: 6.4, w: 3, h: 2.4, tone: "target", label: "6" }
      ],
      caption: "Serving to zones: cones/towels mark targets in zones 1, 5 and 6 on the far deep court. Call a zone before each serve; the server aims there and you track makes per zone over a set number, then rotate and compare accuracy to each spot."
    })
  };
  E["two-zone-serving"] = {
    diagram: serve({
      serverNote: "serves the called half",
      serveLabel: "to called half", serveCurve: 0.2, aim: 0,
      zones: [
        { x: 0.3, y: 0.7, w: 4, h: 5, tone: "target", label: "LEFT half" },
        { x: 4.7, y: 0.7, w: 4, h: 5, tone: "good", label: "RIGHT half" }
      ],
      legend: [{ tone: "target", text: "Left target" }, { tone: "good", text: "Right target" }, { tone: "a", text: "Server" }],
      caption: "Two-zone serving — first step to accuracy: the far court is split into a LEFT half and a RIGHT half. A coach calls a half before each serve; the server adjusts stance and shoulders and serves there. Track makes to each half and switch the called side."
    })
  };
  E["serving-for-distance"] = {
    diagram: {
      caption: "Serving for distance: start at a spot where serves go over comfortably, use the legs and a full swing for a little more power, then take a big step back after a few solid ones. Find the farthest line where you can still serve it in consistently.",
      w: 9, h: 13.4, net: 6,
      lines: [{ y: 3 }, { y: 9 }],
      court: [{ x: 0, y: 0, w: 9, h: 12 }],
      zones: [{ x: 1.5, y: 1, w: 6, h: 2.6, tone: "target", label: "land it in, deep" }],
      players: [
        { x: 3, y: 9.4, label: "S", team: "a", note: "start here" },
        { x: 3, y: 10.8, label: "", team: "n", note: "step back" },
        { x: 3, y: 12.4, label: "", team: "n", note: "farthest in" }
      ],
      paths: [
        { from: [3, 9.4], to: [3, 12.2], kind: "move", label: "back up each round", curve: 0 },
        { from: [3.4, 12.2], to: [4.5, 2.2], kind: "serve", label: "serve from deepest spot", curve: 0.18 }
      ],
      legend: [{ tone: "target", text: "Keep it in" }, { tone: "a", text: "Start" }, { tone: "n", text: "Step-back spots" }]
    }
  };

  // ---- Pressure / fatigue / routine: aim under stress -----------------------

  E["pressure-serving-targets"] = {
    diagram: serve({
      serverNote: "make it or pay a price",
      serveLabel: "hit the called target", serveCurve: 0.22, aim: 1,
      cones: [{ x: 2, y: 9.6 }, { x: 7, y: 9.6 }, { x: 4.5, y: 3.6 }],
      zones: [
        { x: 0.5, y: 7.8, w: 2.6, h: 3, tone: "target", label: "deep corner" },
        { x: 5.9, y: 7.8, w: 2.6, h: 3, tone: "target", label: "deep corner" },
        { x: 3.2, y: 3, w: 2.6, h: 2, tone: "good", label: "short middle" },
        { x: 3.4, y: 6.2, w: 2.2, h: 1.4, tone: "avoid", label: "seam" }
      ],
      legend: [{ tone: "target", text: "Tough targets" }, { tone: "avoid", text: "Seam" }, { tone: "a", text: "Server" }],
      caption: "Pressure serving: targets sit in the toughest spots — deep corners, short middle, the seams. Each server gets a set number of tries at a CALLED target; a miss costs a small price (sprint, or a point to the other group). Track makes under pressure vs. warm-up numbers."
    })
  };
  E["serving-under-fatigue"] = {
    diagrams: dk.seq(
      {
        title: "Conditioning burst", caption: "First, a short conditioning burst by the end line — a sprint down and back, or a few quick defensive moves — so the server is breathing hard before they ever toss the ball.",
        w: 9, h: 10.4,
        court: [{ x: 0, y: 0.8, w: 9, h: 9 }],
        lines: [{ y: 5.2 }],
        players: [{ x: 4.5, y: 9.4, label: "S", team: "a", note: "sprint down & back" }],
        paths: [{ from: [4.5, 9], to: [4.5, 1.6], kind: "move", curve: 0 }, { from: [4.9, 1.6], to: [4.9, 9], kind: "move", curve: 0 }],
        legend: [{ tone: "move", text: "Down and back" }]
      },
      serve({
        title: "Serve while tired", serverNote: "breathing hard",
        serveLabel: "tough, in serve", serveCurve: 0.2,
        zones: [{ x: 1, y: 0.8, w: 7, h: 2.6, tone: "target", label: "tough target, keep it in" }],
        caption: "Right after the burst — still breathing hard — the server must make a tough, in serve to a target. Run several rounds so serving tired feels familiar, and compare makes when fatigued to when fresh."
      })
    )
  };
  E["pre-serve-routine"] = {
    diagram: serve({
      serverNote: "breath · 2 bounces · pick target",
      serveLabel: "same routine every serve", serveCurve: 0.2,
      zones: [{ x: 1.5, y: 0.8, w: 6, h: 2.6, tone: "target", label: "your chosen target" }],
      caption: "Pre-serve routine: each player builds a short repeatable ritual — deep breath, two bounces, pick a target — and runs that EXACT routine before every serve. A coach adds pressure (a count, a price for a miss); the routine stays identical whether the serve is easy or high-stakes."
    })
  };

  // ---- Partner / young-player games -----------------------------------------

  E["partner-mini-serve-rally"] = {
    diagram: {
      caption: "Partner mini serve-rally over a low/short net: partners stand a short distance apart, one serves (under- or overhand) to the other who CATCHES it, then serves it back. Count how many serves in a row the pair keeps over the net.",
      w: 9, h: 11, net: 5.4,
      court: [{ x: 0, y: 0.6, w: 9, h: 10 }],
      players: [
        { x: 4.5, y: 8.2, label: "A", team: "a", note: "serve / catch" },
        { x: 4.5, y: 2.6, label: "B", team: "b", note: "catch / serve" }
      ],
      paths: [
        { from: [4, 7.8], to: [4, 3.1], kind: "serve", label: "serve over", curve: 0.18 },
        { from: [5, 3.1], to: [5, 7.8], kind: "serve", label: "serve back", curve: 0.18 }
      ],
      legend: [{ tone: "a", text: "Partner A" }, { tone: "b", text: "Partner B" }]
    }
  };

  // ---- Seam serving (mark seam → add a live passer) -------------------------

  E["serve-the-seam"] = {
    diagrams: dk.seq(
      serve({
        title: "Mark & hit the seam", serverNote: "aim float or topspin",
        serveLabel: "at the seam", serveCurve: 0.05, aim: 1,
        cones: [{ x: 3.4, y: 8.6 }, { x: 5.6, y: 8.6 }],
        extraPlayers: [
          { x: 2.4, y: 8.6, label: "", team: "n", note: "passer spot" },
          { x: 6.6, y: 8.6, label: "", team: "n", note: "passer spot" }
        ],
        zones: [
          { x: 0.5, y: 0.7, w: 3, h: 2.4, tone: "good", label: "deep corner" },
          { x: 3.5, y: 7.4, w: 2, h: 2, tone: "target", label: "SEAM" }
        ],
        legend: [{ tone: "target", text: "Seam" }, { tone: "good", text: "Deep corner" }, { tone: "a", text: "Server" }],
        caption: "Cones (or two passer spots) mark the SEAM between passing zones. Servers aim float or topspin serves at the called seam or a deep corner. Track which seams a server can hit consistently — aggressive, smart serving, not just getting it in."
      }),
      serve({
        title: "Add a live passer", serverNote: "attack the seam",
        serveLabel: "tough seam serve", serveCurve: 0.05, aim: 0,
        extraPlayers: [
          { x: 2.4, y: 8.6, label: "P", team: "b", note: "passer" },
          { x: 6.6, y: 8.6, label: "P", team: "b", note: "passer" },
          { x: 6.6, y: 6.4, label: "St", team: "b", note: "target" }
        ],
        zones: [{ x: 3.5, y: 7.4, w: 2, h: 2, tone: "target", label: "SEAM" }],
        paths: [
          { from: [4.5, 11.9], to: [4.5, 7.9], kind: "serve", label: "serve the seam", curve: 0.05 },
          { from: [4.5, 8], to: [2.7, 8.4], kind: "ball", label: "who takes it?", curve: 0.2 }
        ],
        legend: [{ tone: "target", text: "Seam" }, { tone: "b", text: "Passers" }, { tone: "a", text: "Server" }],
        caption: "Now add live passers either side of the seam. A tough seam serve splits them — both hesitate, the pass to the setter target breaks down — so servers SEE the trouble a good seam serve causes."
      })
    )
  };

  // ---- Serve then sprint to a defensive base --------------------------------

  E["serve-and-sprint"] = {
    diagrams: dk.seq(
      serve({
        title: "Serve a tough ball", serverY: 12.4, serverNote: "serve, then go",
        serveLabel: "tough serve to target", serveCurve: 0.18,
        zones: [{ x: 0.8, y: 0.7, w: 3.4, h: 2.6, tone: "target", label: "deep target" }],
        caption: "The server serves a tough ball over the net to a target from behind the end line — full effort, just like a match serve."
      }),
      {
        title: "Sprint to defensive base", caption: "The instant they hit it, the server SPRINTS onto the court to their back-row base; a coach sends a ball in so they must get stopped, balanced and ready to dig. Quick, controlled transition from serving to defense, then rotate.",
        w: 9, h: 13.4, net: 6,
        lines: [{ y: 3 }, { y: 9 }],
        court: [{ x: 0, y: 0, w: 9, h: 12 }],
        zones: [{ x: 5.5, y: 8.4, w: 3, h: 2.6, tone: "good", label: "back-row base" }],
        players: [
          { x: 4.5, y: 12.4, label: "S", team: "a", note: "just served" },
          { x: 7, y: 9.6, label: "", team: "a", note: "dig here" },
          { x: 4.5, y: 0.9, label: "C", team: "coach", note: "feeds a ball in" }
        ],
        paths: [
          { from: [4.5, 12], to: [7, 9.9], kind: "move", label: "sprint to base", curve: -0.25 },
          { from: [4.5, 1.4], to: [6.8, 9.2], kind: "ball", label: "coach feeds", curve: 0.18 }
        ],
        legend: [{ tone: "good", text: "Defensive base" }, { tone: "coach", text: "Coach feed" }, { tone: "a", text: "Server" }]
      }
    )
  };

  // ---- Hybrid: mix float & topspin to varied depths/seams --------------------

  E["hybrid-serve-mix"] = {
    diagram: serve({
      serverNote: "same look, different serve",
      paths: [
        { from: [4.2, 11.9], to: [2.2, 1.9], kind: "serve", label: "deep float", curve: 0.2 },
        { from: [4.5, 11.9], to: [4.5, 5.4], kind: "serve", label: "hard topspin", curve: -0.2 },
        { from: [4.8, 11.9], to: [6.6, 3.4], kind: "serve", label: "short float", curve: 0.2 }
      ],
      zones: [
        { x: 0.5, y: 0.7, w: 3, h: 2.4, tone: "target", label: "deep float" },
        { x: 3, y: 4.4, w: 3, h: 2, tone: "good", label: "hard topspin" },
        { x: 5.5, y: 2.6, w: 3, h: 2, tone: "target", label: "short float" }
      ],
      legend: [{ tone: "target", text: "Float targets" }, { tone: "good", text: "Topspin" }, { tone: "a", text: "Server" }],
      caption: "Hybrid serve mix — a real weapon: warm up both a float and a topspin/jump serve, then mix them on purpose — deep float, hard topspin, short float — keeping the toss and setup as identical as possible so passers can't read it. Track which combos trouble live passers most."
    })
  };

})(window.RR);
