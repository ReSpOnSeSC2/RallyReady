// extras-data-6.js — SETTING drill diagrams (RR.extras).
//
// One entry per setting drill. Footwork / movement drills (release from base,
// figure-eight, transition from the back row) use a `diagrams: [...]` sequence
// — each spec carries a `title` step heading — so the base spot, the path to
// the setting target, and the set all get pictured. Simple partner / wall /
// triangle reps use a single `diagram`.
//
// Convention follows the passing exemplar (extras-data-3.js): near/your side at
// the BOTTOM, far side / opponent at the TOP. For setting the net usually sits
// near the TOP (small net y) because the setter works right at the net. Setter
// targets are the antennas: zone 4 = LEFT antenna, zone 2 = RIGHT antenna.
//
// Two local helpers cover the shapes setting repeats most: a partner back-and-
// forth (duo) and a feeder-to-setter-to-target net rep (setRep).
window.RR = window.RR || {};
RR.extras = RR.extras || {};

(function (RR) {
  "use strict";
  var dk = RR.dk;
  var E = RR.extras;

  // A simple partner rep: two players a few steps apart set the ball back and
  // forth. Vertical layout, no net.
  function duo(o) {
    o = o || {};
    return {
      title: o.title, caption: o.caption, w: 6, h: 7.6,
      players: [
        { x: 3, y: 1.6, label: o.top || "B", team: "b", note: o.topNote || "partner" },
        { x: 3, y: 6, label: o.bot || "A", team: "a", note: o.botNote || "setter" }
      ],
      paths: [
        { from: [3.4, 5.6], to: [3.4, 2], kind: "ball", label: o.up || "set", curve: 0.28 },
        { from: [2.6, 2], to: [2.6, 5.6], kind: "ball", label: o.down || "set back", curve: 0.28 }
      ]
    };
  }

  // A net setting rep: setter front-right by the net, a feeder/passer sends a
  // ball, the setter delivers to an antenna target. The net sits near the TOP.
  // o.target: "left" (zone 4), "right" (zone 2, back set), or "mid" (quick).
  function setRep(o) {
    o = o || {};
    var tgt = o.target || "left";
    var antLeft = { x: 1.4, y: 2, w: 1.6, h: 1.4, tone: "target", label: "4" };
    var antRight = { x: 6, y: 2, w: 1.6, h: 1.4, tone: "target", label: "2" };
    var stX = o.setterX != null ? o.setterX : 6, stY = 3;
    var feedX = o.feederX != null ? o.feederX : 4.5, feedY = o.feederY != null ? o.feederY : 7;
    var players = [
      { x: feedX, y: feedY, label: o.feederLabel || "P", team: "b", note: o.feederNote || "feeder" },
      { x: stX, y: stY, label: "St", team: "a", note: o.setterNote || "setter" }
    ];
    var zones = [];
    var setTo;
    if (tgt === "left") { zones.push(antLeft); setTo = [2, 2.6]; }
    else if (tgt === "right") { zones.push(antRight); setTo = [6.8, 2.6]; }
    else { setTo = [4.6, 2.8]; } // quick to middle, no antenna zone
    if (o.both) { zones = [antLeft, antRight]; }
    if (o.hitter) players.push({ x: o.hitter[0], y: o.hitter[1], label: "H", team: "a", note: "hitter" });
    var paths = [
      { from: [feedX, feedY - 0.4], to: [stX - 0.2, stY + 0.4], kind: "ball", label: o.feedLabel || "pass", curve: 0.18 }
    ];
    if (o.setLabel !== null) paths.push({ from: [stX - 0.2, stY], to: setTo, kind: "ball", label: o.setLabel || "set", curve: tgt === "right" ? -0.18 : 0.18 });
    if (o.swing && o.hitter) paths.push({ from: [setTo[0], setTo[1] + 0.2], to: [o.hitter[0] < 4.5 ? 6.5 : 2.5, 0.9], kind: "serve", label: "swing", curve: 0.1 });
    var spec = {
      title: o.title, caption: o.caption,
      w: 9, h: 9, net: 1.6,
      lines: [{ y: 0 }], court: [{ x: 0, y: 0, w: 9, h: 9 }],
      zones: zones, players: players, paths: paths,
      legend: [{ tone: "target", text: "Antenna target" }, { tone: "a", text: "Setter" }, { tone: "b", text: "Feeder" }]
    };
    return spec;
  }

  // ---- Wall / solo form reps ------------------------------------------------

  E["wall-setting"] = {
    diagram: {
      caption: "Stand 3–5 ft from a wall with a ball and a high target spot marked on it. Set the ball at the spot, move under the rebound, and set again in a steady rhythm — count clean ones in a row. A whole line works the same wall at once.",
      w: 9, h: 8,
      zones: [{ x: 0, y: 0.2, w: 9, h: 1, tone: "target", label: "WALL — high target" }],
      players: dk.spread(4, 1.6, 7.4).map(function (x) { return { x: x, y: 6, label: "", team: "a" }; }),
      paths: dk.spread(4, 1.6, 7.4).map(function (x) { return { from: [x, 5.6], to: [x, 1.4], kind: "ball", curve: 0.1 }; })
        .concat(dk.spread(4, 1.6, 7.4).map(function (x) { return { from: [x + 0.4, 1.6], to: [x + 0.4, 5.6], kind: "move", curve: 0.1 }; })),
      legend: [{ tone: "target", text: "Aim above the spot" }, { tone: "a", text: "Setters" }]
    }
  };
  E["catch-and-set-progression"] = {
    diagram: {
      caption: "Young players groove clean hands: make a triangle 'window' above the forehead, toss the ball up, and catch it softly in the window with spread fingers. Then push it straight back up using legs and arms together — once easy, skip the catch and set to yourself non-stop.",
      w: 9, h: 7,
      players: dk.spread(4, 1.6, 7.4).map(function (x) { return { x: x, y: 4.8, label: "", team: "a" }; }),
      paths: dk.spread(4, 1.6, 7.4).map(function (x) { return { from: [x, 4.4], to: [x, 1.8], kind: "ball", label: "", curve: 0 }; }),
      legend: [{ tone: "a", text: "Set to yourself" }]
    }
  };
  E["one-knee-setting-form"] = {
    diagram: {
      caption: "Kneel on one knee a couple of feet from a wall, hands up in the setting window above the forehead. The legs are taken out of it, so all the focus is on clean hands: set the ball softly to the wall and catch the rebound in the window, elbows up, ball on the finger pads.",
      w: 9, h: 8,
      zones: [{ x: 0, y: 0.2, w: 9, h: 1, tone: "neutral", label: "WALL" }],
      players: dk.spread(3, 2, 7).map(function (x) { return { x: x, y: 6, label: "", team: "a", note: "one knee" }; }),
      paths: dk.spread(3, 2, 7).map(function (x) { return { from: [x, 5.6], to: [x, 1.4], kind: "ball", label: "soft set", curve: 0.1 }; }),
      legend: [{ tone: "neutral", text: "Wall" }, { tone: "a", text: "Kneeling setters" }]
    }
  };

  // ---- Partner / triangle reps ----------------------------------------------

  E["partner-setting"] = {
    diagram: duo({ caption: "Partners stand 10–12 ft apart with one ball. A tosses to themselves, sets to B; B moves under it and sets back. Keep it high and out in front, and add a step IN toward the ball each time so you're setting on the move." })
  };
  E["setter-triangle-continuous"] = {
    diagram: {
      caption: "Three players form a triangle a few steps apart and set the ball around it non-stop. Each player turns, SQUARES UP to face the next target, then sets. Reverse the direction on a call so they learn to square up both ways.",
      w: 9, h: 9,
      players: [
        { x: 4.5, y: 1.8, label: "1", team: "a" },
        { x: 7.4, y: 6.8, label: "2", team: "a" },
        { x: 1.6, y: 6.8, label: "3", team: "a" }
      ],
      paths: [
        { from: [4.7, 2.1], to: [7.2, 6.5], kind: "ball", label: "set", curve: 0.2 },
        { from: [7.1, 7], to: [1.9, 7], kind: "ball", label: "set", curve: 0.18 },
        { from: [1.8, 6.5], to: [4.3, 2.1], kind: "ball", label: "set", curve: 0.2 }
      ],
      legend: [{ tone: "a", text: "Square up to each target" }]
    }
  };
  E["back-setting"] = {
    diagram: {
      caption: "Three players in a line about 10 ft apart. An outside player tosses to the middle setter, who gets under the ball and sets it BACK over their head to the third player. The third catches and tosses back to the middle for another rep; rotate after a set number of clean back sets.",
      w: 9, h: 6,
      players: [
        { x: 1.6, y: 3, label: "1", team: "b", note: "tosser" },
        { x: 4.5, y: 3, label: "St", team: "a", note: "back-sets" },
        { x: 7.4, y: 3, label: "3", team: "a", note: "target" }
      ],
      paths: [
        { from: [2, 3], to: [4.1, 3], kind: "ball", label: "toss", curve: 0.22 },
        { from: [4.9, 3], to: [7, 3], kind: "ball", label: "back set", curve: -0.22 }
      ],
      legend: [{ tone: "a", text: "Setter + target" }, { tone: "b", text: "Tosser" }]
    }
  };

  // ---- Footwork to the target (MULTI-STEP) ----------------------------------

  E["setter-footwork-to-target"] = {
    diagrams: dk.seq(
      { title: "Start in middle-back base", caption: "The setter starts in the middle-back ready spot; a feeder is set to toss a pass toward the net. The setter waits to read the ball.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        players: [{ x: 4.5, y: 7, label: "P", team: "b", note: "feeder" }, { x: 4.5, y: 5, label: "St", team: "a", note: "base" }],
        paths: [],
        legend: [{ tone: "a", text: "Setter" }, { tone: "b", text: "Feeder" }] },
      { title: "Run to the right-front spot", caption: "As the feeder tosses, the setter runs to the setting spot at the right-front, getting there EARLY and turning so the hips face the left sideline.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        players: [{ x: 4.5, y: 7, label: "P", team: "b" }, { x: 4.5, y: 5, label: "St", team: "a", note: "release" }, { x: 6, y: 2.8, label: "•", team: "n", note: "spot" }],
        paths: [{ from: [4.5, 5], to: [6, 3.1], kind: "move", label: "run early", curve: 0.2 }, { from: [4.5, 7], to: [5.8, 3.3], kind: "ball", label: "toss", curve: 0.15 }],
        legend: [{ tone: "a", text: "Setter" }, { tone: "n", text: "Setting spot" }] },
      setRep({ title: "Set the called ball", both: true, setterX: 6, feederX: 4.5, feederY: 7, setLabel: "front or back", caption: "Square at the spot and set the called ball — a front set to the LEFT antenna or a back set to the RIGHT — then jog back to middle and repeat, beating the ball to the spot every time." })
    )
  };
  E["setter-release-from-base"] = {
    diagrams: dk.seq(
      { title: "Right-back base", caption: "The setter starts in right-back serve-receive base. A coach stands in the passing lane with a ball; a hoop/cone marks the front-row setting spot at the net.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        zones: [{ x: 5.4, y: 2.2, w: 1.8, h: 1.4, tone: "target", label: "spot" }],
        players: [{ x: 4.5, y: 4, label: "C", team: "coach", note: "in passing lane" }, { x: 7, y: 7.4, label: "St", team: "a", note: "right-back base" }],
        cones: [{ x: 6.3, y: 2.6 }],
        paths: [],
        legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Setter" }, { tone: "target", text: "Net spot" }] },
      { title: "Slap → sprint to the net", caption: "The coach SLAPS the ball to release the setter from base. The setter sprints to the net target, squares to the left antenna, and faces out ready to set.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        zones: [{ x: 5.4, y: 2.2, w: 1.8, h: 1.4, tone: "target", label: "spot" }],
        players: [{ x: 4.5, y: 4, label: "C", team: "coach", note: "slaps ball" }, { x: 7, y: 7.4, label: "St", team: "a", note: "release" }],
        paths: [{ from: [7, 7.4], to: [6.3, 3.1], kind: "move", label: "sprint", curve: 0.18 }],
        legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Setter" }] },
      setRep({ title: "Set outside, jog back", setterX: 6.3, feederX: 4.5, feederY: 4.4, feederLabel: "C", feederNote: "tosses pass", setLabel: "outside set", caption: "The coach tosses a pass and the setter delivers the outside set to the left antenna, then jogs back to base. Run several reps, then start the setter at right-front and repeat." })
    )
  };
  E["right-side-back-set-footwork"] = {
    diagrams: dk.seq(
      { title: "Release to the net", caption: "The setter starts in their release spot and moves to the net target. This is the movement piece behind a two-sided offense.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        zones: [{ x: 5.2, y: 2.2, w: 1.8, h: 1.4, tone: "target", label: "net spot" }],
        players: [{ x: 6.6, y: 6.4, label: "St", team: "a", note: "release spot" }],
        paths: [{ from: [6.6, 6.4], to: [6.1, 3.1], kind: "move", label: "to net", curve: 0.15 }],
        legend: [{ tone: "a", text: "Setter" }, { tone: "target", text: "Net spot" }] },
      { title: "Set the feet, line up the shoulder", caption: "Set the feet so the RIGHT shoulder lines up to back-set toward the right antenna — the same neutral setup you'd use for a front set, so it's hidden.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        zones: [{ x: 1.4, y: 2, w: 1.6, h: 1.4, tone: "neutral", label: "4" }, { x: 6, y: 2, w: 1.6, h: 1.4, tone: "target", label: "2" }],
        players: [{ x: 6.1, y: 3, label: "St", team: "a", note: "right shoulder lined up" }],
        paths: [],
        legend: [{ tone: "a", text: "Setter" }, { tone: "target", text: "Back-set target (2)" }] },
      setRep({ title: "Deliver the back set", target: "right", setterX: 6.1, feederX: 4, feederY: 7, setLabel: "back set", caption: "Deliver a back set to the right antenna, focusing on the repeatable footwork. Switch between front and back sets so the setup looks the same for both." })
    )
  };
  E["transition-setting-back-row"] = {
    diagrams: dk.seq(
      { title: "Setter in back-row base", caption: "The setter starts in a back-row defensive spot — their real starting job in a rally — as a coach prepares to send a dug ball up.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        players: [{ x: 3, y: 5, label: "C", team: "coach", note: "sends dig up" }, { x: 6.4, y: 7.4, label: "St", team: "a", note: "back-row base" }],
        paths: [],
        legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Setter" }] },
      { title: "Sprint to the net & set", caption: "On the dug ball, the setter SPRINTS to the setting target, squares up, and sets a hittable outside ball. Change where the dig comes from so the release starts from different spots.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        zones: [{ x: 1.4, y: 2, w: 1.6, h: 1.4, tone: "target", label: "4" }],
        players: [{ x: 3, y: 5, label: "C", team: "coach" }, { x: 6.4, y: 7.4, label: "St", team: "a", note: "transitions" }],
        paths: [{ from: [6.4, 7.4], to: [6, 3.2], kind: "move", label: "sprint", curve: 0.18 }, { from: [3, 5], to: [5.8, 3.4], kind: "ball", label: "dig", curve: 0.12 }, { from: [6, 3.1], to: [2, 2.6], kind: "ball", label: "set", curve: 0.2 }],
        legend: [{ tone: "coach", text: "Dig" }, { tone: "a", text: "Setter" }, { tone: "target", text: "Outside (4)" }] }
    )
  };

  // ---- Two-feeder & scramble movement (MULTI-STEP) --------------------------

  E["two-ball-setting-footwork"] = {
    diagrams: dk.seq(
      { title: "Two feeders, fast pace", caption: "Two feeders stand a few steps apart, each holding a ball. Feeder one tosses; the setter moves, squares up, and sets it back.", w: 9, h: 9,
        players: [{ x: 2.6, y: 1.8, label: "F1", team: "b" }, { x: 6.4, y: 1.8, label: "F2", team: "b" }, { x: 4.5, y: 6, label: "St", team: "a", note: "setter" }],
        paths: [{ from: [2.8, 2.1], to: [4.3, 5.6], kind: "ball", label: "toss 1", curve: 0.12 }, { from: [4.4, 5.6], to: [2.7, 2.2], kind: "ball", label: "set back", curve: 0.18 }],
        legend: [{ tone: "b", text: "Feeders" }, { tone: "a", text: "Setter" }] },
      { title: "Shuffle & set the other ball", caption: "The setter quickly shuffles to feeder two's toss, squares up, and sets that one back — then recovers between every ball. Keep it brisk for a set time, then rest and rotate.", w: 9, h: 9,
        players: [{ x: 2.6, y: 1.8, label: "F1", team: "b" }, { x: 6.4, y: 1.8, label: "F2", team: "b" }, { x: 4.5, y: 6, label: "St", team: "a", note: "shuffles" }],
        paths: [{ from: [4.5, 6], to: [6, 6], kind: "move", label: "shuffle", curve: 0 }, { from: [6.2, 2.1], to: [6, 5.6], kind: "ball", label: "toss 2", curve: -0.1 }, { from: [6, 5.6], to: [6.3, 2.2], kind: "ball", label: "set back", curve: -0.15 }],
        legend: [{ tone: "b", text: "Feeders" }, { tone: "a", text: "Setter" }] }
    )
  };
  E["scramble-setting"] = {
    diagrams: dk.seq(
      { title: "Off-target balls", caption: "A coach tosses passes off-target — tight to the net, off the net, and deep. The setter has to read each one and decide how to play it.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        players: [{ x: 4.5, y: 6.4, label: "C", team: "coach", note: "tosses off-target" }, { x: 6.4, y: 3.4, label: "St", team: "a", note: "setter" }],
        paths: [{ from: [4.5, 6.4], to: [2.4, 2.4], kind: "ball", label: "tight", curve: 0.1 }, { from: [4.5, 6.4], to: [5, 5], kind: "ball", label: "off net", curve: -0.1 }, { from: [4.5, 6.4], to: [7.4, 6.6], kind: "ball", label: "deep", curve: 0.12 }],
        legend: [{ tone: "coach", text: "Off-target toss" }, { tone: "a", text: "Setter" }] },
      { title: "Chase, square, deliver", caption: "The setter SPRINTS to the ball, gets as square as they can, and sets a hittable ball. When it can't be hand-set cleanly, they bump-set a safe, high ball instead. Count how many bad passes still become a hittable set.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        zones: [{ x: 1.4, y: 2, w: 1.6, h: 1.4, tone: "target", label: "4" }],
        players: [{ x: 7, y: 6, label: "St", team: "a", note: "chases" }, { x: 4, y: 5, label: "•", team: "n", note: "ball" }],
        paths: [{ from: [7, 6], to: [4.3, 5.1], kind: "move", label: "chase", curve: 0.15 }, { from: [4, 4.8], to: [2, 2.6], kind: "ball", label: "hittable set", curve: 0.2 }],
        legend: [{ tone: "a", text: "Setter" }, { tone: "target", text: "Outside (4)" }] }
    )
  };
  E["setting-figure-eight-footwork"] = {
    // Catalog title: "Bump-Setting from Deep" — awkward/low balls bump-set high to the pin.
    diagrams: dk.seq(
      { title: "Awkward, low ball", caption: "A feeder tosses awkward, low, or deep balls that can't be hand-set cleanly. The setter reads it and squares up toward the target.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        players: [{ x: 4, y: 6.6, label: "P", team: "b", note: "tosses low/deep" }, { x: 6.4, y: 5, label: "St", team: "a", note: "squares up" }],
        paths: [{ from: [4, 6.6], to: [6.1, 5.4], kind: "ball", label: "low ball", curve: 0.1 }],
        legend: [{ tone: "b", text: "Feeder" }, { tone: "a", text: "Setter" }] },
      { title: "Bump-set high to the pin", caption: "Squared to the target, the setter delivers a controlled forearm BUMP-SET — high and hittable to the outside pin, with enough height for a hitter to time it. Repeat from different spots so they bump-set on the move.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        zones: [{ x: 1.4, y: 2, w: 1.6, h: 1.4, tone: "target", label: "4" }],
        players: [{ x: 6.4, y: 5, label: "St", team: "a", note: "bump-sets" }],
        paths: [{ from: [6.2, 4.8], to: [2, 2.6], kind: "ball", label: "high bump-set", curve: 0.22 }],
        legend: [{ tone: "a", text: "Setter" }, { tone: "target", text: "Outside pin (4)" }] }
    )
  };

  // ---- Jump-setting (MULTI-STEP) --------------------------------------------

  E["jump-setting"] = {
    diagrams: dk.seq(
      { title: "Small hop & set", caption: "Start with a small hop and set to a partner, touching the ball at the TOP of your jump so the hands and timing are right.", w: 6, h: 7.6,
        players: [{ x: 3, y: 1.8, label: "B", team: "b", note: "partner" }, { x: 3, y: 6, label: "St", team: "a", note: "hop-set" }],
        paths: [{ from: [3, 5.6], to: [3, 2.2], kind: "ball", label: "jump set", curve: 0.25 }],
        legend: [{ tone: "a", text: "Setter" }, { tone: "b", text: "Partner" }] },
      { title: "Footwork to the net, jump & set", caption: "Add the setter's footwork up to the net, then jump and set front and back — keeping the hands and motion the SAME so it's hidden. Finish with a coach tossing a pass the setter must jump to and deliver on time.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        zones: [{ x: 1.4, y: 2, w: 1.6, h: 1.4, tone: "target", label: "4" }, { x: 6, y: 2, w: 1.6, h: 1.4, tone: "target", label: "2" }],
        players: [{ x: 4.5, y: 6.6, label: "C", team: "coach", note: "tosses" }, { x: 6.6, y: 5.4, label: "St", team: "a", note: "jump-sets" }],
        paths: [{ from: [6.6, 5.4], to: [6.1, 3.2], kind: "move", label: "footwork", curve: 0.15 }, { from: [4.5, 6.6], to: [6, 3.4], kind: "ball", label: "pass", curve: 0.12 }, { from: [6, 3.1], to: [2, 2.6], kind: "ball", label: "front or back", curve: 0.2 }],
        legend: [{ tone: "coach", text: "Coach" }, { tone: "a", text: "Setter" }, { tone: "target", text: "Antennas" }] }
    )
  };
  E["jump-set-and-dump"] = {
    diagrams: dk.seq(
      { title: "Jump to set", caption: "The setter jumps to set a tossed pass, hands UP like they're going to set normally — selling the set while reading the block and defense.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        players: [{ x: 4.5, y: 6.6, label: "P", team: "b", note: "passes" }, { x: 6.4, y: 3.2, label: "St", team: "a", note: "jumps, hands up" }],
        paths: [{ from: [4.5, 6.6], to: [6.2, 3.6], kind: "ball", label: "pass", curve: 0.12 }],
        legend: [{ tone: "b", text: "Passer" }, { tone: "a", text: "Setter" }] },
      { title: "Read: dump or set", caption: "If the block or defense CHEATS, the setter dumps the ball over with one hand into open court. If they respect the dump, the setter sets the ball instead. Mix set and dump so it's a real read every time.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        zones: [{ x: 0.6, y: 4.4, w: 3.2, h: 2.4, tone: "good", label: "open court" }, { x: 1.4, y: 2, w: 1.6, h: 1.4, tone: "target", label: "4" }],
        players: [{ x: 6.4, y: 3.2, label: "St", team: "a", note: "reads" }],
        paths: [{ from: [6.2, 3.1], to: [2.2, 5.4], kind: "serve", label: "dump", curve: 0.12 }, { from: [6.2, 3.2], to: [2, 2.6], kind: "ball", label: "or set", curve: 0.2 }],
        legend: [{ tone: "good", text: "Dump here" }, { tone: "target", text: "Or set outside" }, { tone: "a", text: "Setter" }] }
    )
  };

  // ---- Accuracy / location single reps --------------------------------------

  E["setting-accuracy-hoops"] = {
    diagram: setRep({ both: true, hitter: null, feederX: 4.5, feederY: 7, setLabel: "to called hoop",
      caption: "Hoops (or target spots) sit at the outside pin and the right-side pin. A feeder tosses a pass to the setter, who sets to the CALLED hoop — a set that lands in or over it scores. Track makes by target and compare setters to each pin." })
  };
  E["setting-over-net-to-target"] = {
    diagram: setRep({ both: true, feederX: 4.5, feederY: 7, setLabel: "to the pin",
      caption: "Over a real net, the setter delivers a high, hittable set to a marked target at the pin: off the net enough to swing, high enough to time. A feeder tosses each pass; switch between the outside (4) and right-side (2) targets and rotate setters." })
  };
  E["back-set-to-the-antenna"] = {
    diagram: setRep({ target: "right", feederX: 4, feederY: 7, setterX: 6, hitter: [7.4, 4.6], swing: true, setLabel: "back set",
      caption: "A feeder passes to the setter at the net target. The setter back-sets a high, hittable ball right to the RIGHT-side antenna — tight enough to hit, off the net enough to swing. Add a right-side hitter so the back set connects to a real attack." })
  };
  E["setting-quick-connection"] = {
    diagram: setRep({ target: "mid", feederX: 3, feederY: 7, setterX: 6, hitter: [4.5, 4.6], swing: false, setLabel: "quick set",
      setterNote: "setter", feederNote: "passes", feederLabel: "P",
      caption: "The setter and middle build quick-set timing TOGETHER. A feeder passes as the middle starts a quick approach; the setter delivers a low, fast set to the middle's contact spot just in front of them. Repeat until automatic, then vary the pass so the setter adjusts and still connects." })
  };

  // ---- Tempo (MULTI-STEP: three speeds) -------------------------------------

  E["tempo-setting"] = {
    diagrams: dk.seq(
      { title: "Quick to the middle", caption: "Off a tossed pass, set a LOW, fast quick set just in front of you for the middle hitter.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        zones: [{ x: 3.7, y: 2, w: 1.6, h: 1.2, tone: "target", label: "quick" }],
        players: [{ x: 4.5, y: 7, label: "P", team: "b", note: "passes" }, { x: 6.2, y: 3.4, label: "St", team: "a" }],
        paths: [{ from: [4.5, 7], to: [6, 3.8], kind: "ball", label: "pass", curve: 0.12 }, { from: [6, 3.4], to: [4.6, 3], kind: "ball", label: "quick", curve: -0.1 }],
        legend: [{ tone: "target", text: "Quick" }, { tone: "a", text: "Setter" }] },
      { title: "Shoot to the pin", caption: "On the next ball, push a fast, FLAT 'shoot' set out to the antenna so the outside hitter swings on it quickly.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        zones: [{ x: 1.4, y: 2, w: 1.6, h: 1.2, tone: "target", label: "shoot" }],
        players: [{ x: 4.5, y: 7, label: "P", team: "b" }, { x: 6.2, y: 3.4, label: "St", team: "a" }],
        paths: [{ from: [4.5, 7], to: [6, 3.8], kind: "ball", label: "pass", curve: 0.12 }, { from: [6, 3.3], to: [2, 2.6], kind: "ball", label: "fast & flat", curve: 0.05 }],
        legend: [{ tone: "target", text: "Shoot (pin)" }, { tone: "a", text: "Setter" }] },
      { title: "High ball outside", caption: "Then set a HIGH, loopy outside ball that lets a hitter take a full approach. Have the coach call the speed at the last second so the setter has to adjust.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        zones: [{ x: 1.4, y: 2, w: 1.6, h: 1.2, tone: "target", label: "high" }],
        players: [{ x: 4.5, y: 7, label: "P", team: "b" }, { x: 6.2, y: 3.4, label: "St", team: "a" }],
        paths: [{ from: [4.5, 7], to: [6, 3.8], kind: "ball", label: "pass", curve: 0.12 }, { from: [6, 3.3], to: [2, 2.6], kind: "ball", label: "high & loopy", curve: 0.3 }],
        legend: [{ tone: "target", text: "High outside" }, { tone: "a", text: "Setter" }] }
    )
  };

  // ---- Live-read (MULTI-STEP) -----------------------------------------------

  E["setter-live-read-options"] = {
    diagrams: dk.seq(
      { title: "Live first ball", caption: "Run a live first ball so the setter gets DIFFERENT passes — in-system and out. The setter releases to the net and reads as the ball comes.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        players: [{ x: 3, y: 6.6, label: "P", team: "b", note: "live pass" }, { x: 6.4, y: 3.4, label: "St", team: "a", note: "reads pass" }],
        paths: [{ from: [3, 6.6], to: [6.1, 3.8], kind: "ball", label: "varied pass", curve: 0.15 }],
        legend: [{ tone: "b", text: "Passer" }, { tone: "a", text: "Setter" }] },
      { title: "Read block, pick the option", caption: "The setter reads where the other team's block is and how good the pass is, then chooses the set — quick, pin, back set, or pipe — that gives the best matchup. Talk through the choices afterward.", w: 9, h: 9, net: 1.6, court: [{ x: 0, y: 0, w: 9, h: 9 }],
        zones: [{ x: 1.4, y: 2, w: 1.5, h: 1.2, tone: "target", label: "4" }, { x: 3.8, y: 2, w: 1.5, h: 1.2, tone: "target", label: "quick" }, { x: 6.1, y: 2, w: 1.5, h: 1.2, tone: "target", label: "2" }, { x: 3.8, y: 5.4, w: 1.5, h: 1.2, tone: "target", label: "pipe" }],
        players: [{ x: 6.4, y: 3.4, label: "St", team: "a", note: "chooses" }, { x: 2.4, y: 1.6, label: "Bl", team: "b", note: "block" }, { x: 4.5, y: 1.6, label: "Bl", team: "b" }],
        paths: [{ from: [6.2, 3.3], to: [2, 2.5], kind: "ball", label: "pin", curve: 0.18 }, { from: [6.2, 3.4], to: [4.5, 2.5], kind: "ball", label: "quick", curve: 0 }, { from: [6.3, 3.5], to: [4.5, 5.8], kind: "ball", label: "pipe", curve: 0.1 }, { from: [6.4, 3.2], to: [6.8, 2.5], kind: "ball", label: "back", curve: -0.1 }],
        legend: [{ tone: "target", text: "Set options" }, { tone: "b", text: "Block to read" }, { tone: "a", text: "Setter" }] }
    )
  };

})(window.RR);
