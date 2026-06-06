// extras-data-3.js — PASSING drill diagrams (RR.extras).
//
// One entry per passing drill. Drills with several spatial parts use a
// `diagrams: [...]` sequence (each spec carries a `title`, shown as a step
// heading) so every stage is pictured; single-action reps use one diagram.
// Two local helpers (pair, serveRcv) cover the shapes passing repeats most.
//
// This is the template the other skill-category files follow. The marquee
// passing drills that used to live in extras-data-2.js are re-authored here,
// richer, so there is exactly one source of truth per drill.
window.RR = window.RR || {};
RR.extras = RR.extras || {};

(function (RR) {
  "use strict";
  var dk = RR.dk;
  var E = RR.extras;

  // A single partner rep: tosser feeds, passer bumps it back.
  function pair(o) {
    o = o || {};
    return {
      title: o.title, caption: o.caption, w: 6, h: 7.6,
      players: [
        { x: 3, y: 1.6, label: o.top || "F", team: "b", note: o.topNote || "tosser" },
        { x: 3, y: 6, label: o.bot || "P", team: "a", note: o.botNote || "passer" }
      ],
      paths: [
        { from: [3.4, 2], to: [3.4, 5.6], kind: "ball", label: o.down || "toss", curve: 0.28 },
        { from: [2.6, 5.6], to: [2.6, 2], kind: "ball", label: o.up || "pass", curve: 0.28 }
      ]
    };
  }

  // A serve-receive look: a server across the net, 1/2/3/5 passers, a setter
  // target near the right-front. Pass(es) flow to the target.
  function serveRcv(o) {
    o = o || {};
    var n = o.passers || 3, px;
    if (n === 1) px = [[4.5, 8.8]];
    else if (n === 2) px = [[2.8, 8.8], [6.4, 8.8]];
    else if (n === 3) px = [[2, 8.8], [4.5, 9.2], [7, 8.8]];
    else px = [[1.7, 9.2], [4.5, 9.6], [7.3, 9.2], [3, 7.2], [6, 7.2]]; // five-player W
    var players = [{ x: 4.5, y: 1.4, label: o.serverLabel || "S", team: "b", note: o.serverNote || "server" }];
    px.forEach(function (p) { players.push({ x: p[0], y: p[1], label: "", team: "a" }); });
    players.push({ x: 6.4, y: 6.4, label: "St", team: "a", note: "setter target" });
    var t = px[Math.floor(px.length / 2)];
    var paths = [{ from: [4.5, 1.8], to: [t[0], t[1] - 0.4], kind: "serve", label: o.serveLabel || "serve", curve: o.serveCurve != null ? o.serveCurve : 0.15 }];
    if (o.pass !== false) paths.push({ from: [t[0], t[1] - 0.4], to: [6.2, 6.6], kind: "ball", label: "pass", curve: 0.2 });
    var spec = {
      title: o.title, caption: o.caption, w: 9, h: 12, net: 6,
      lines: [{ y: 3 }, { y: 9 }], court: [{ x: 0, y: 0, w: 9, h: 12 }],
      players: players, paths: paths,
      legend: [{ tone: "b", text: "Server" }, { tone: "a", text: "Passers + setter" }]
    };
    if (o.zones) spec.zones = o.zones;
    return spec;
  }

  // ---- Partner / solo reps --------------------------------------------------

  E["partner-forearm-passing"] = {
    diagram: pair({ caption: "Partners ~15 ft apart: the tosser feeds the middle of the body, the passer bumps it back to the tosser's hands. Switch after 10. All pairs work at once." })
  };
  E["toss-and-pass-intro"] = {
    diagram: pair({ caption: "Stand a short step apart: an easy high toss to the body, a clean platform, bump it back to the tosser's hands.", down: "easy toss", up: "bump" })
  };
  E["partner-pass-and-set-continuous"] = {
    diagram: pair({ top: "A", bot: "B", topNote: "sets", botNote: "passes", down: "set", up: "pass", caption: "A steady loop: A passes to B, B sets it back, A passes again — pass, set, pass, set. Count clean ones in a row." })
  };
  E["self-pass-count"] = {
    diagram: {
      caption: "Solo: pass the ball straight up to yourself, stay under it, and count clean touches. A whole group spreads out and goes at once.",
      w: 9, h: 7,
      players: dk.spread(4, 1.6, 7.4).map(function (x) { return { x: x, y: 4.6, label: "", team: "a" }; }),
      paths: dk.spread(4, 1.6, 7.4).map(function (x) { return { from: [x, 4.2], to: [x, 1.6], kind: "ball", curve: 0 }; })
    }
  };

  // ---- Feed-to-target reps --------------------------------------------------

  E["passing-to-setter-target"] = {
    diagram: serveRcv({ passers: 1, serverLabel: "F", serverNote: "feeder", serveLabel: "feed", caption: "Feeder sends a ball across; the passer puts it on the setter target about a yard off the net. Reset and repeat, then rotate." })
  };
  E["pass-to-the-coach"] = {
    diagram: dk.feedLine({ feederLabel: "C", feederNote: "tosses", action: "pass to coach", targetLabel: "C", caption: "A line of young passers: the coach tosses each one a ball, they pass it back to the coach at the target spot, then jog to the back of the line." })
  };
  E["bump-over-net-to-targets"] = {
    diagram: {
      caption: "Near a lowered net: a partner tosses, the passer bumps it OVER to a deep target, then a short one, learning to control distance.",
      w: 9, h: 11, net: 5, lines: [{ y: 8 }],
      court: [{ x: 0, y: 0, w: 9, h: 11 }],
      zones: [{ x: 1, y: 1, w: 3, h: 1.8, tone: "target", label: "deep" }, { x: 5, y: 3, w: 3, h: 1.6, tone: "good", label: "short" }],
      players: [{ x: 6, y: 7.4, label: "F", team: "b", note: "tosser" }, { x: 4, y: 7.4, label: "P", team: "a", note: "passer" }],
      paths: [{ from: [5.6, 7.2], to: [4.3, 7], kind: "ball", label: "toss", curve: 0.2 }, { from: [4, 7], to: [2.4, 2], kind: "serve", label: "bump over", curve: 0.15 }],
      legend: [{ tone: "target", text: "Aim here" }]
    }
  };

  // ---- Movement / platform-angle reps --------------------------------------

  E["passing-on-the-move"] = {
    diagrams: dk.seq(
      { title: "Feed to the side", caption: "The feeder tosses a few steps to the passer's left or right — not right at them.", w: 7, h: 8,
        players: [{ x: 3.5, y: 1.6, label: "F", team: "b", note: "feeder" }, { x: 3.5, y: 6, label: "P", team: "a", note: "starts here" }],
        paths: [{ from: [3.5, 2], to: [5.6, 5.4], kind: "ball", label: "toss wide", curve: 0.15 }] },
      { title: "Shuffle & square up", caption: "The passer shuffles behind the ball, STOPS, squares to the feeder, and passes with still arms. Then switch sides.", w: 7, h: 8,
        players: [{ x: 3.5, y: 1.6, label: "F", team: "b" }, { x: 5.6, y: 6, label: "P", team: "a", note: "moved over" }],
        paths: [{ from: [3.5, 6], to: [5.4, 6], kind: "move", label: "shuffle", curve: 0 }, { from: [5.6, 5.6], to: [3.7, 2], kind: "ball", label: "pass", curve: 0.18 }] }
    )
  };
  E["platform-angle-passing"] = {
    diagram: {
      caption: "Feeds come from the left, middle, and right — the passer sets the arm ANGLE toward the one target before each ball arrives, so every pass goes the same place.",
      w: 9, h: 10, net: 1.6,
      court: [{ x: 0, y: 0, w: 9, h: 10 }],
      players: [
        { x: 4.5, y: 8.4, label: "P", team: "a", note: "passer" },
        { x: 1.6, y: 4, label: "F", team: "b" }, { x: 4.5, y: 3.4, label: "F", team: "b" }, { x: 7.4, y: 4, label: "F", team: "b" },
        { x: 7, y: 6.4, label: "T", team: "a", note: "target" }
      ],
      paths: [
        { from: [1.8, 4.3], to: [4.3, 8], kind: "ball", curve: 0.1 },
        { from: [4.5, 3.8], to: [4.5, 8], kind: "ball", curve: 0 },
        { from: [7.2, 4.3], to: [4.7, 8], kind: "ball", curve: -0.1 },
        { from: [4.5, 8], to: [6.8, 6.6], kind: "serve", label: "to target", curve: 0.2 }
      ],
      legend: [{ tone: "b", text: "Feeders (L/M/R)" }, { tone: "a", text: "Passer + target" }]
    }
  };
  E["deep-ball-backpedal-passing"] = {
    diagrams: dk.seq(
      serveRcv({ passers: 1, title: "Deep serve", serveLabel: "deep serve", serveCurve: 0.05, pass: false, caption: "A server sends a deep ball over the passer's starting spot near the attack line." }),
      { title: "Drop-step & backpedal", caption: "The passer opens the hips, drop-steps, and backpedals to get BEHIND the ball, then passes up to target while controlling the backward momentum.", w: 9, h: 12, net: 6, lines: [{ y: 3 }, { y: 9 }], court: [{ x: 0, y: 0, w: 9, h: 12 }],
        players: [{ x: 4.5, y: 7.6, label: "P", team: "a", note: "drops back" }, { x: 6.4, y: 6.4, label: "St", team: "a", note: "target" }],
        paths: [{ from: [4.5, 7.6], to: [4.5, 9.4], kind: "move", label: "backpedal", curve: 0 }, { from: [4.5, 9.2], to: [6.2, 6.6], kind: "ball", label: "pass up", curve: 0.2 }] }
    )
  };
  E["passing-box-drill"] = {
    diagram: {
      caption: "Four players at the corners of a box pass around it (and across the diagonal), each angling the platform to send the ball to the next corner. Reverse on a call.",
      w: 9, h: 9,
      players: [
        { x: 1.6, y: 1.6, label: "1", team: "a" }, { x: 7.4, y: 1.6, label: "2", team: "a" },
        { x: 7.4, y: 7.4, label: "3", team: "a" }, { x: 1.6, y: 7.4, label: "4", team: "a" }
      ],
      paths: [
        { from: [1.9, 1.6], to: [7.1, 1.6], kind: "ball", curve: 0.12 },
        { from: [7.4, 1.9], to: [7.4, 7.1], kind: "ball", curve: 0.12 },
        { from: [7.1, 7.4], to: [1.9, 7.4], kind: "ball", curve: 0.12 },
        { from: [1.6, 7.1], to: [1.6, 1.9], kind: "ball", curve: 0.12 }
      ]
    }
  };

  // ---- Serve-receive systems ------------------------------------------------

  E["serve-receive-intro-easy"] = {
    diagram: serveRcv({ passers: 1, serverNote: "serves from inside the court", serveLabel: "easy serve", serveCurve: 0.05, caption: "Slow, loopy serves from a short distance: the passer reads it, gets behind it, and passes to the target near the net. Move the server back as it gets easy." })
  };
  E["two-person-serve-receive"] = {
    diagram: serveRcv({ passers: 2, serveLabel: "serve / seam", caption: "Two passers split the court. The server can aim the SEAM between them — both call early, the closer one takes it, the other backs up." })
  };
  E["three-person-serve-receive"] = {
    diagrams: dk.seq(
      serveRcv({ passers: 3, title: "Formation & serve", pass: false, caption: "Three passers in a W across the back court, setter target at the net. The server serves into the formation." }),
      serveRcv({ passers: 3, title: "Call & pass", serveLabel: "", caption: "Whoever the ball is closest to calls early and passes to the setter; the other two open toward the ball in case it's shanked their way." })
    )
  };
  E["w-formation-serve-receive"] = {
    diagrams: dk.seq(
      serveRcv({ passers: 5, title: "The W & the serve", pass: false, caption: "Five passers in a W with the setter releasing to right-front. Server serves anywhere into the formation." }),
      serveRcv({ passers: 5, title: "Pass & attack", serveLabel: "", caption: "Whoever it's heading toward takes it, neighbors back up, ball goes to the setter target — then run a quick attack and rotate." })
    )
  };
  E["backcourt-communication-passing"] = {
    diagram: serveRcv({ passers: 3, serveLabel: "serve to a seam", caption: "Three back-court passers: the server hits zones and seams. Demand a LOUD early call on every serve before the pass; the others open up and back up the play." })
  };
  E["libero-serve-receive-range"] = {
    diagram: {
      caption: "The libero starts middle-back and covers a wide area. The server aims the edges and seams; the libero calls, moves to get the body behind it, and passes to target. Grow the area over time.",
      w: 9, h: 12, net: 6, lines: [{ y: 3 }, { y: 9 }], court: [{ x: 0, y: 0, w: 9, h: 12 }],
      zones: [{ x: 1.6, y: 7.4, w: 5.8, h: 3.4, tone: "good", label: "libero range" }],
      players: [{ x: 4.5, y: 1.4, label: "S", team: "b", note: "server" }, { x: 4.5, y: 9, label: "L", team: "a", note: "libero" }, { x: 6.6, y: 6.4, label: "St", team: "a", note: "target" }],
      paths: [{ from: [4.5, 1.8], to: [2.2, 8.4], kind: "serve", label: "to the edge", curve: 0.2 }, { from: [4.5, 9], to: [6.4, 6.6], kind: "ball", label: "pass", curve: 0.2 }],
      legend: [{ tone: "good", text: "Area to cover" }, { tone: "a", text: "Libero + target" }]
    }
  };
  E["overhead-emergency-pass"] = {
    diagram: serveRcv({ passers: 1, serveLabel: "high & tight", serveCurve: 0.08, caption: "High serves arriving near head height: the passer takes it OVERHEAD with firm, clean hands above the forehead and pushes it to target — quicker than dropping to the arms." })
  };
  E["mid-court-passing-decision"] = {
    diagram: serveRcv({ passers: 1, serverNote: "watch the toss & shoulders", serveLabel: "read it early", caption: "Reading the server: passers call 'deep/short/left/right' from the server's stance and toss BEFORE contact, then react and pass the real serve to target." })
  };
  E["serve-receive-vs-jump-serve"] = {
    diagram: serveRcv({ passers: 2, serverNote: "jump server", serveLabel: "hard jump serve", serveCurve: 0.05, caption: "Against a jump serve: passers start a step deeper and keep the arms quiet to take the speed off — a controlled, playable ball beats a perfect-but-rushed one." })
  };

  // ---- Multi-station / rotating passing -------------------------------------

  E["shuttle-passing-to-target"] = {
    diagrams: dk.seq(
      { title: "Pass to the target",
        caption: "Two short lines face each other with a target in the middle. The front player of Line A (player 1) passes the ball to the TARGET — a cone, hoop, or coach. It's an accuracy rep, so nobody catches it; the target just marks where a perfect pass would land.",
        w: 9, h: 8,
        players: [
          { x: 1.8, y: 3, label: "1", team: "a" }, { x: 1.8, y: 4, label: "2", team: "a" }, { x: 1.8, y: 5, label: "3", team: "a" },
          { x: 7.2, y: 3, label: "", team: "b" }, { x: 7.2, y: 4, label: "", team: "b" }, { x: 7.2, y: 5, label: "", team: "b" },
          { x: 4.5, y: 4, label: "T", team: "n", note: "cone / hoop / coach" }
        ],
        paths: [
          { from: [2.3, 3], to: [4.0, 3.9], kind: "ball", label: "pass", curve: 0.12 }
        ],
        legend: [{ tone: "a", text: "Line A" }, { tone: "b", text: "Line B" }, { tone: "n", text: "Target" }] },
      { title: "Follow your pass — to the BACK of the OTHER line",
        caption: "After passing, player 1 jogs to the BACK of the OTHER line (Line B). Now the front of Line B passes to the same target and follows ACROSS to Line A. The two lines keep feeding each other back and forth — constant motion, and the target never moves.",
        w: 9, h: 8,
        players: [
          { x: 1.8, y: 3.5, label: "2", team: "a" }, { x: 1.8, y: 4.5, label: "3", team: "a" },
          { x: 7.2, y: 3, label: "", team: "b" }, { x: 7.2, y: 4, label: "", team: "b" }, { x: 7.2, y: 5, label: "", team: "b" },
          { x: 7.2, y: 6, label: "1", team: "a", note: "now at back of Line B" },
          { x: 4.5, y: 4, label: "T", team: "n", note: "cone / hoop / coach" }
        ],
        paths: [
          { from: [2.1, 3], to: [7.0, 6.0], kind: "move", curve: -0.5 },
          { from: [6.9, 3], to: [5.0, 3.9], kind: "ball", label: "next pass", curve: -0.12 }
        ],
        legend: [{ tone: "a", text: "Line A" }, { tone: "b", text: "Line B" }, { tone: "n", text: "Target" }] }
    )
  };
  E["butterfly-passing"] = {
    diagrams: dk.seq(
      { title: "Serve & pass", caption: "A player serves over the net; a passer on the far side passes to the setter/target by the net.", w: 9, h: 12, net: 6, lines: [{ y: 3 }, { y: 9 }], court: [{ x: 0, y: 0, w: 9, h: 12 }],
        players: [{ x: 2.4, y: 10.4, label: "Sv", team: "a", note: "server" }, { x: 4.5, y: 4.2, label: "P", team: "b", note: "passer" }, { x: 7, y: 1.8, label: "T", team: "b", note: "target" }],
        paths: [{ from: [2.4, 10], to: [4.3, 4.6], kind: "serve", label: "serve", curve: 0.12 }, { from: [4.5, 4.2], to: [6.7, 2.1], kind: "ball", label: "pass", curve: 0.2 }],
        legend: [{ tone: "a", text: "Server side" }, { tone: "b", text: "Passer / target" }] },
      { title: "Follow your ball", caption: "Everyone rotates the way the ball went: the server jogs to the passing line, the passer goes to the target spot, the target shags back to serving. Continuous.", w: 9, h: 12, net: 6, lines: [{ y: 3 }, { y: 9 }], court: [{ x: 0, y: 0, w: 9, h: 12 }],
        players: [{ x: 2.4, y: 10.4, label: "Sv", team: "a" }, { x: 4.5, y: 4.2, label: "P", team: "b" }, { x: 7, y: 1.8, label: "T", team: "b" }],
        paths: [{ from: [2.7, 10.2], to: [4.3, 4.8], kind: "move", label: "serve → pass", curve: 0.2 }, { from: [4.7, 4], to: [6.8, 2.1], kind: "move", label: "pass → target", curve: 0.2 }] }
    )
  };
  E["out-of-system-passing"] = {
    diagrams: dk.seq(
      { title: "Awkward ball → high pass", caption: "The coach hits a hard, awkward ball (deep, short, off the net). The passer just plays it HIGH to the middle of the court to buy the setter time.", w: 9, h: 11, net: 2, lines: [{ y: 5.2 }], court: [{ x: 0, y: 0, w: 9, h: 11 }],
        players: [{ x: 4.5, y: 0.9, label: "C", team: "coach", note: "hits it awkward" }, { x: 2.4, y: 8, label: "P", team: "a", note: "passer" }],
        paths: [{ from: [4.5, 1.4], to: [2.6, 7.6], kind: "serve", label: "tough ball", curve: 0.1 }, { from: [2.4, 7.6], to: [4.5, 6], kind: "ball", label: "high to middle", curve: -0.2 }],
        legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Passer" }] },
      { title: "Setter chases, hitter finishes", caption: "The setter runs it down and sets a high, hittable ball even from the bad pass; a hitter takes a safe, smart swing. Then rotate.", w: 9, h: 11, net: 2, lines: [{ y: 5.2 }], court: [{ x: 0, y: 0, w: 9, h: 11 }],
        players: [{ x: 4.5, y: 6, label: "", team: "a", note: "high ball" }, { x: 6.4, y: 4.4, label: "St", team: "a", note: "chases" }, { x: 2.2, y: 4.4, label: "H", team: "a", note: "hitter" }],
        paths: [{ from: [4.7, 6], to: [6.2, 4.6], kind: "ball", label: "setter runs it down", curve: 0.2 }, { from: [6.4, 4.4], to: [2.6, 4.2], kind: "ball", label: "high set", curve: 0.25 }, { from: [2.2, 4], to: [4.4, 1.4], kind: "serve", label: "safe swing", curve: 0.1 }] }
    )
  };
  E["serve-and-pass-crossover"] = {
    diagrams: dk.seq(
      serveRcv({ passers: 3, title: "Serve & receive", serverNote: "line of servers", serveLabel: "real serve", zones: [{ x: 5.8, y: 5.6, w: 1.6, h: 1.4, tone: "target", label: "cone" }], caption: "Servers serve real serves at three passers; a cone marks the setter target so passers know exactly where the ball must go." }),
      { title: "Crossover rotation", caption: "After the group earns three good passes, players cross jobs: a passer jogs back to serve, a server steps in to pass — so everyone trains both connected skills.", w: 9, h: 12, net: 6, lines: [{ y: 3 }, { y: 9 }], court: [{ x: 0, y: 0, w: 9, h: 12 }],
        players: [{ x: 4.5, y: 1.4, label: "Sv", team: "b", note: "server line" }, { x: 4.5, y: 9, label: "P", team: "a", note: "passer" }],
        paths: [{ from: [4.5, 8.6], to: [4.5, 2], kind: "move", label: "pass → serve", curve: 0.4 }, { from: [4, 1.8], to: [4, 8.6], kind: "move", label: "serve → pass", curve: 0.4 }] }
    )
  };

})(window.RR);
