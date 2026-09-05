// extras-data-2.js — per-drill organization + diagrams, batch 2 (RR.extras).
//
// Continues RR.extras from extras-data.js: the rotate-in / 6v6 / wash games, the
// station tournaments, the youth games, and court diagrams for the marquee
// position-based SKILL drills (serve-receive shapes, hitting lines, team
// defense, blocking). Same entry shape: { format?, diagram? }.
window.RR = window.RR || {};
RR.extras = RR.extras || {};

(function (RR) {
  "use strict";
  var dk = RR.dk;
  var E = RR.extras;

  // ---- ROTATE-IN COURT GAMES (King / Queen) --------------------------------

  E["queen-of-the-court"] = {
    format: {
      grouping: "Teams of 2–3. One team holds the 'queen' (scoring) side, one challenges across the net, the rest queue behind the challenger side.",
      flow: "Play one rally at a time. Win as the queens → score and stay. Lose as the queens → rotate off to the back. Win as a challenger → cross over and become the new queens; a waiting team steps in.",
      tracking: "You can only score ON the queen side. Each team keeps its own running score; the coach confirms crossings and keeps the line moving.",
      aim: "First team to a target score (e.g. 10) as queens wins; play 15–20 min."
    },
    diagrams: dk.seq(
      dk.acrossNet({
        teamSize: 2, wait: 2, waitSide: "far", sequence: "serve-three",
        zones: [{ x: 0.2, y: 6.2, w: 8.6, h: 4.8, tone: "good", label: "Queen side scores" }],
        legend: [{ tone: "a", text: "Queens" }, { tone: "b", text: "Challengers" }],
        caption: "Two queens receive against two challengers while one waiting pair queues behind the challenger side. Serve → pass → set → attack, with points only for the queens."
      }),
      dk.rotateIn({ teamSize: 2, wait: 2, caption: "If queens win, they score and stay. If queens lose and challengers win, both challengers cross to the queen side, both former queens rotate off, and both waiting partners enter together. Continue to the target score or time; most points wins." })
    )
  };

  // Hand-built "run the whole play" scene — uses the dedicated free-ball
  // illustration (img:"freeball"); the acrossNet base keeps a valid 3v3 court as
  // the rare SVG fallback if the picture is ever unavailable.
  E["free-ball-mini-game"] = {
    diagram: Object.assign(
      dk.acrossNet({ teamSize: 3, wait: 2, sequence: "free-three", caption: "A three-on-three free-ball rally: the coach tosses a free ball and your side runs pass → set → hit. Switch which side gets the free ball each rally." }),
      { img: "freeball" }
    )
  };

  E["king-of-the-court-doubles"] = {
    format: {
      grouping: "Doubles (teams of 2). King side scores; challenger side and a waiting line fill the rest.",
      flow: "One rally at a time, same as Queen of the Court but 2v2: hold the king side to score, win as challenger to take it over.",
      tracking: "Only the king side scores. Teams self-track; coach keeps the rotation honest.",
      aim: "First doubles team to the target as kings; 15 min."
    },
    diagrams: dk.seq(
      dk.acrossNet({
        teamSize: 2, wait: 2, waitSide: "far", sequence: "serve-three",
        zones: [{ x: 0.2, y: 6.2, w: 8.6, h: 4.8, tone: "good", label: "King side scores" }],
        legend: [{ tone: "a", text: "Kings" }, { tone: "b", text: "Challengers" }],
        caption: "The minimum six-player setup is three doubles pairs: kings, challengers, and one waiting pair. The active pairs play serve → pass → set → attack."
      }),
      dk.rotateIn({ teamSize: 2, wait: 2, caption: "If challengers win, both partners cross to become kings, the former kings exit together, and both waiting partners enter the challenger side." })
    )
  };

  E["six-on-six-queen-of-the-court"] = {
    format: {
      grouping: "Two full teams of 6 are required: one on the queen side and one challenging. If additional teams are available, they wait behind the challenger side.",
      flow: "Play one full 6v6 rally at a time. Queens score and stay on a win; after a queen-side loss, challengers cross over and the losing team rotates around to challenge again (or leaves for an optional waiting team).",
      tracking: "Points only on the queen side. Each team keeps its score; coach manages rotations and confirms the result.",
      aim: "Race to a target as queens; great in-season competitive block, 20 min."
    },
    diagrams: dk.seq(
      dk.acrossNet({
        teamSize: 6,
        sequence: "serve-three",
        actorPrefix: "six-queen",
        teamNames: { a: "queen", b: "challenger" },
        contactOrder: ["1 · challenger serve", "2 · queen pass", "3 · queen set", "4 · queen attack"],
        zones: [{ x: 0.2, y: 6.2, w: 8.6, h: 4.8, tone: "good", label: "Queen side scores" }],
        legend: [{ tone: "a", text: "Kings/Queens" }, { tone: "b", text: "Challengers" }],
        caption: "The challenger serves from behind the end line. Both six-player teams run the rally through serve → pass → set → attack; only the queen side can score."
      }),
      dk.rotateIn({ teamSize: 6, wait: 0,
        actorPrefix: "six-queen", teamNames: { a: "queen", b: "challenger" },
        caption: "After a queen-side loss, all six challengers cross into the matching 3-front/3-back queen positions while all six former queens rotate around the sideline to the vacated challenger positions." })
    )
  };

  // ---- 6v6 / WASH / SCORING GAMES ------------------------------------------

  E["six-v-six-wash-scoring"] = {
    format: {
      grouping: "Two full teams of 6 in normal rotations; subs wait to rotate in by position.",
      flow: "Played in 'washes': a team must win two small points in a row (e.g. its serve AND the next rally) to 'wash' and earn one big point — rewards stringing plays together.",
      tracking: "Coach runs the wash scoring and calls the big points out loud; teams rotate on each sideout.",
      aim: "First team to 5–7 big points; 15–20 min."
    },
    diagram: dk.washGame({
      actorPrefix: "wash-scoring",
      title: "Serve rally, then immediate free-ball rally",
      caption: "All 12 players stay in their six-on-six positions. Play the served rally through both offenses; the coach immediately enters a separate free ball for the receiving team to pass, set, and counterattack. The two ball tracks stay distinct: win both rallies to bank one wash point."
    })
  };

  E["serve-receive-wash-game"] = {
    format: {
      grouping: "Two teams of ~4–6: one serving, one in serve-receive formation; rotate after each series.",
      flow: "The receiving team must side out (win the rally off the serve) a set number of times to score. Then teams swap serve/receive roles.",
      tracking: "Coach tracks the side-out count and washes; receivers self-organize their formation.",
      aim: "Win the side-out battle to a target; 12–15 min."
    },
    diagram: dk.acrossNet({ teamSize: 5, sequence: "serve-three", caption: "One team serves, the other must side out a set number of times before roles switch." })
  };

  E["transition-wash-game"] = {
    format: {
      grouping: "Two full teams of 6, in rotation.",
      flow: "Each ball is played out twice: serve/receive, then the coach immediately enters a free ball or down ball so teams must TRANSITION and play again before a wash counts.",
      tracking: "Coach feeds the transition ball and tallies washes; teams play their normal positions.",
      aim: "First to the wash target; 15–20 min."
    },
    diagram: dk.washGame({
      actorPrefix: "transition-wash",
      hardSecondBall: true,
      title: "Serve rally, then defense-to-offense transition",
      caption: "All 12 players complete the served rally first. Without resetting positions, the sideline coach drives a second ball to the winning side; that defender digs to target, the setter delivers the transition set, and the middle counterattacks. Win both distinct rallies to score."
    })
  };

  E["sideout-scoring-game"] = {
    format: {
      grouping: "Two full teams of 6, in rotation.",
      flow: "Only the RECEIVING team can score (a 'side-out' point). This puts the pressure on serve-receive and first-ball offense, just like a real match.",
      tracking: "Coach keeps score and rotates teams on each side-out; players run normal rotations.",
      aim: "First to the target side-outs; 15–20 min."
    },
    diagram: dk.acrossNet({ teamSize: 6, sequence: "serve-three", caption: "Side-out scoring: only the receiving team can score, so serve-receive is everything." })
  };

  E["comeback-pressure-game"] = {
    format: {
      grouping: "Two full teams of 6.",
      flow: "Start one team in a hole (e.g. down 0–5) so they must string points together to come back. Builds composure under scoreboard pressure.",
      tracking: "Coach sets the deficit and keeps score aloud; teams rotate normally.",
      aim: "Can the trailing team complete the comeback before time? 12–15 min."
    },
    diagram: dk.acrossNet({ teamSize: 6, sequence: "rally", caption: "One team starts behind and must string points together to come back — match-pressure reps." })
  };

  E["bonus-ball-scramble"] = {
    format: {
      grouping: "Two teams of ~4; subs rotate in.",
      flow: "Right after a rally ends, the coach tosses a surprise 'bonus ball' to a random spot — teams scramble to keep playing. Rewards readiness and hustle.",
      tracking: "Coach feeds bonus balls and keeps score; bonus-ball points may count double.",
      aim: "First to the target; 10–12 min."
    },
    diagram: dk.acrossNet({ teamSize: 4, sequence: "bonus", caption: "After each rally the coach tosses a surprise bonus ball — scramble and keep playing." })
  };

  E["speedball"] = {
    format: {
      grouping: "Two teams of ~4; extra players queue to sub in fast.",
      flow: "Lightning pace: a new ball enters the instant a rally ends, with quick subs, so players get tons of reps and learn to reset fast.",
      tracking: "Coach feeds balls and keeps the tempo and score; teams self-organize.",
      aim: "Most points in a fast 6–8 min block."
    },
    diagram: dk.acrossNet({ teamSize: 4, wait: 2, sequence: "reentry", caption: "Fast-feed game: a new ball enters the second the last one dies, with quick subs." })
  };

  E["bingo-bango-bongo"] = {
    format: {
      grouping: "Two full teams of 6 (ages 15–18).",
      flow: "Build a streak across consecutive rallies: win one for Bingo, two in a row for Bango, and three in a row for Bongo. Then serve for the real point; a loss resets that team's streak.",
      tracking: "Coach calls each team's Bingo/Bango/Bongo streak and awards the point after the Bongo serve; teams rotate normally.",
      aim: "First to the target; 15 min."
    },
    diagram: dk.acrossNet({ teamSize: 6, sequence: "streak", caption: "Win one rally for Bingo, two straight for Bango, and three straight for Bongo; then win the Bongo serve to score the real point. A loss resets the streak." })
  };

  E["first-ball-kill-game"] = {
    format: {
      grouping: "Two teams of ~5–6 (ages 15–18).",
      flow: "The coach serves or tosses; the receiving team must KILL the first ball (pass–set–hit for a point) — no long rallies. Trains terminal first-ball offense.",
      tracking: "Coach awards the point only for a first-ball kill, then feeds the next; teams rotate.",
      aim: "Most first-ball kills in the block; 12–15 min."
    },
    diagram: dk.acrossNet({ teamSize: 5, sequence: "serve-three", caption: "Receive and terminate the FIRST ball — pass, set, kill. No drawn-out rallies." })
  };

  // ---- SERVE-RECEIVE / PASSING GAMES ---------------------------------------

  E["passing-accuracy-ladder"] = {
    format: {
      grouping: "Pairs (passer + a tosser/target). Everyone works at once at their own spot.",
      flow: "Self-paced: each accurate pass to the target climbs you up a ladder of distances/difficulty; a miss drops you a rung.",
      tracking: "The partner judges whether the pass hit the target and calls the rung; switch roles at the top.",
      aim: "First to the top rung, then swap; 8 min."
    },
    diagram: dk.pairsRows({ pairs: 3, net: false, topLabel: "T", botLabel: "P", caption: "Pairs: passer (P) hits the target (T); each accurate pass climbs the ladder." })
  };

  E["sideout-percentage-gauntlet"] = {
    format: {
      grouping: "One receiving group of ~6 (3 passers + setter + hitters) vs. a line of servers (ages 15–18).",
      flow: "Serve a fixed block of balls into each rotation. Count sideouts across the whole block; repeat a rotation if its percentage misses the target.",
      tracking: "For a 10-serve example, 6–7 sideouts reaches a 60–70% target. Misses remain in the denominator rather than resetting a streak.",
      aim: "Meet the chosen percentage in all six rotations and total the results."
    },
    diagram: {
      caption: "Servers send a fixed block, for example 10 serves, into each rotation. Count sideouts across the full block; meet the chosen 60–70% target to advance, otherwise repeat. Work all six rotations.",
      w: 9, h: 12, net: 6, lines: [{ y: 3 }, { y: 9 }],
      court: [{ x: 0, y: 0.8, w: 9, h: 10.4 }],
      players: [
        { x: 2, y: 0.35, label: "S", team: "b", note: "server line behind end line" }, { x: 4.5, y: 0.35, label: "S", team: "b", note: "serves now behind end line" }, { x: 7, y: 0.35, label: "S", team: "b", note: "server line behind end line" },
        { x: 2, y: 8.6, label: "P", team: "a" }, { x: 4.5, y: 9.2, label: "P", team: "a" }, { x: 7, y: 8.6, label: "P", team: "a" },
        { x: 6.4, y: 7, label: "St", team: "a", note: "setter" }, { x: 1.5, y: 6.8, label: "H", team: "a", note: "left-side hitter" }, { x: 7.5, y: 6.8, label: "H", team: "a", note: "right-side hitter" }
      ],
      paths: [
        { from: [4.5, 0.7], to: [4.5, 8.8], kind: "serve", label: "serve", curve: 0.2 },
        { from: [4.5, 8.8], to: [6.2, 7.2], kind: "ball", label: "pass", curve: 0.15 },
        { from: [6.4, 7], to: [1.8, 6.6], kind: "ball", label: "set", curve: 0.22 },
        { from: [1.5, 6.6], to: [3, 2], kind: "serve", label: "attack", curve: 0.12 }
      ],
      legend: [{ tone: "b", text: "Servers" }, { tone: "a", text: "Receiving team" }]
    }
  };

  // ---- STATION / TOURNAMENT GAMES ------------------------------------------

  E["mini-volley-stations-tournament"] = {
    format: {
      grouping: "Minimum setup: four teams of 2, with two opposing teams on each of two mini-courts. Add courts or increase teams to 3–4 players for larger groups.",
      flow: "Both mini-courts play at once. After each short game, the lower-court winner moves up and the upper-court non-winner moves down; the teams at the two ladder ends hold their court.",
      tracking: "Each station self-scores its mini-game; the coach blows a whistle to rotate and tracks standings on a sheet.",
      aim: "Most station wins by the end; 20+ min."
    },
    diagrams: dk.seq(
      {
        title: "Split into two complete 2v2 mini-courts",
        caption: "Split the gym into two small courts; lowered nets or ropes work fine. At the eight-player minimum, make four even teams of 2 and put two opposing teams on each court. Both courts play short rally-scoring games at the same time.",
        w: 10, h: 8,
        court: [{ x: 0.4, y: 0.6, w: 4.2, h: 6.8 }, { x: 5.4, y: 0.6, w: 4.2, h: 6.8 }],
        zones: [{ x: 0.55, y: 0.75, w: 3.9, h: 6.5, tone: "neutral", label: "COURT 1" }, { x: 5.55, y: 0.75, w: 3.9, h: 6.5, tone: "neutral", label: "COURT 2" }],
        lines: [{ y: 4 }],
        players: [
          { x: 1.5, y: 2.4, label: "1A", team: "b", note: "Court 1 team" }, { x: 3.5, y: 2.4, label: "1A", team: "b", note: "Court 1 teammate" },
          { x: 1.5, y: 5.6, label: "1B", team: "a", note: "Court 1 opponent" }, { x: 3.5, y: 5.6, label: "1B", team: "a", note: "Court 1 teammate" },
          { x: 6.5, y: 2.4, label: "2A", team: "b", note: "Court 2 team" }, { x: 8.5, y: 2.4, label: "2A", team: "b", note: "Court 2 teammate" },
          { x: 6.5, y: 5.6, label: "2B", team: "a", note: "Court 2 opponent" }, { x: 8.5, y: 5.6, label: "2B", team: "a", note: "Court 2 teammate" }
        ],
        paths: [
          { from: [1.5, 5.3], via: [[3.4, 2.7], [1.7, 2.7]], to: [3.5, 5.3], kind: "ball", label: "Court 1 live rally", curve: 0 },
          { from: [6.5, 5.3], via: [[8.4, 2.7], [6.7, 2.7]], to: [8.5, 5.3], kind: "ball", label: "Court 2 live rally", curve: 0 }
        ],
        legend: [{ tone: "a", text: "Near-side teams" }, { tone: "b", text: "Far-side teams" }, { tone: "ball", text: "Games run simultaneously" }]
      },
      {
        title: "Winner up, other team down",
        caption: "When time is called, the two-player winner from lower Court 1 moves up to Court 2, while the two-player non-winner from upper Court 2 moves down to Court 1. The top winner and bottom non-winner hold their end court; add up results across rounds for the tournament standing.",
        w: 10, h: 8,
        court: [{ x: 0.4, y: 0.6, w: 4.2, h: 6.8 }, { x: 5.4, y: 0.6, w: 4.2, h: 6.8 }],
        zones: [{ x: 0.55, y: 0.75, w: 3.9, h: 6.5, tone: "neutral", label: "COURT 1 · LOWER" }, { x: 5.55, y: 0.75, w: 3.9, h: 6.5, tone: "good", label: "COURT 2 · UPPER" }],
        lines: [{ y: 4 }],
        players: [
          { x: 1.5, y: 2.4, label: "H", team: "b", note: "holds" }, { x: 3.5, y: 2.4, label: "H", team: "b", note: "holds" },
          { x: 1.5, y: 5.6, label: "W↑", team: "a", note: "moves up" }, { x: 3.5, y: 5.6, label: "W↑", team: "a", note: "moves up" },
          { x: 6.5, y: 2.4, label: "H", team: "b", note: "holds" }, { x: 8.5, y: 2.4, label: "H", team: "b", note: "holds" },
          { x: 6.5, y: 5.6, label: "L↓", team: "a", note: "moves down" }, { x: 8.5, y: 5.6, label: "L↓", team: "a", note: "moves down" }
        ],
        paths: [
          { from: [1.5, 5.6], to: [6.5, 5.6], kind: "move", label: "Court 1 winner moves up", curve: -0.18, playerIndex: 2, hideLabel: true },
          { from: [3.5, 5.6], to: [8.5, 5.6], kind: "move", label: "winning teammate moves up", curve: -0.18, playerIndex: 3, hideLabel: true },
          { from: [6.5, 5.6], to: [1.5, 5.6], kind: "move", label: "Court 2 non-winner moves down", curve: 0.18, playerIndex: 6, hideLabel: true },
          { from: [8.5, 5.6], to: [3.5, 5.6], kind: "move", label: "teammate moves down", curve: 0.18, playerIndex: 7, hideLabel: true }
        ],
        legend: [{ tone: "move", text: "Teams swap together" }, { tone: "b", text: "End-court teams hold" }]
      }
    )
  };
  (function () {
    var scenes = E["mini-volley-stations-tournament"].diagrams;
    scenes[0].stepIndices = [0, 1, 2];
    scenes[1].stepIndices = [3, 4];
    scenes.forEach(function (scene) {
      scene.operation = "parallel";
      scene.players.forEach(function (player, index) { player.id = "mini-player-" + (index + 1); });
    });
    scenes[0].paths = [];
    [0, 4].forEach(function (offset, courtIndex) {
      // Two touches on each side make an actual continuous four-contact rally.
      var chain = [offset + 2, offset + 3, offset, offset + 1, offset + 2];
      for (var index = 0; index < chain.length - 1; index++) {
        var from = scenes[0].players[chain[index]], to = scenes[0].players[chain[index + 1]];
        scenes[0].paths.push({ from: [from.x, from.y], to: [to.x, to.y], kind: "ball", motionId: index % 2 ? "set" : "pass",
          fromActor: from.id, toActor: to.id, label: "Court " + (courtIndex + 1) + (index % 2 ? " set over the net" : " teammate pass"),
          stepIndices: [2], sequenceOrder: index, simultaneousGroup: "mini-rally-touch-" + index });
      }
    });
    scenes[1].paths.forEach(function (path) {
      path.motionId = "sprint"; path.actor = scenes[1].players[path.playerIndex].id;
      path.stepIndices = [3]; path.sequenceOrder = 0; path.simultaneousGroup = "mini-court-rotation";
      // Actual 3D movement follows via points, not the decorative SVG curve.
      // Separate passing lanes keep the swapping teams from running through
      // each other while both teammates move at the same time.
      var lane = path.to[0] > path.from[0] ? 4.7 : 6.65;
      path.via = [[path.from[0], lane], [path.to[0], lane]];
    });
  })();

  E["camp-skills-circuit"] = {
    format: {
      grouping: "Split the camp into even small groups, one group per skill station.",
      flow: "All stations run simultaneously for a timed interval; on the whistle every group rotates to the next skill (serve → pass → set → hit → …).",
      tracking: "Each station has a coach/helper running it; players self-count reps within the station.",
      aim: "Everyone touches every station; 3–5 min per station."
    },
    diagram: dk.stations({ labels: ["Serve", "Pass", "Set", "Hit"], cols: 2,
      playersPerStation: 2,
      caption: "Four pairs work simultaneously at Serve, Pass, Set, and Hit; on the whistle every pair follows the arrows to the next skill." })
  };

  // ---- YOUTH GAMES ----------------------------------------------------------

  E["passing-21-circle"] = {
    format: {
      grouping: "One circle of 4–6 with a target player (or coach) in the middle (ages 9–12).",
      flow: "Everyone in at once: pass around or to the middle, counting toward 21. The middle player feeds and judges good passes.",
      tracking: "A clean pass straight from the air scores 3; a pass after a bounce scores 1. A ball dropping untouched keeps the score and restarts with a toss.",
      aim: "Count aloud together and race to 21."
    },
    diagram: dk.circlePass({ n: 5, center: true, centerLabel: "T", caption: "Pass around the circle and to the middle target (T), counting together toward 21." })
  };

  E["four-square-volleyball"] = {
    format: {
      grouping: "Four players, one in each square (the rest wait to rotate in), ages 9–12.",
      flow: "Start from square one with a soft underhand pass, then bump or set to another square without catching. An error sends that player to square four; the others move up.",
      tracking: "Players self-officiate; a waiting player rotates into the lowest square.",
      aim: "Work your way up to (and hold) the 'king' square."
    },
    diagram: {
      caption: "One player per square. Square 1 starts with a soft underhand pass; bump or set to another square without catching. An error sends that player to square 4, everyone else moves up, and the waiting line rotates in.",
      w: 8, h: 8,
      zones: [
        { x: 0.4, y: 0.4, w: 3.4, h: 3.4, tone: "neutral", label: "1 · starts" },
        { x: 4.2, y: 0.4, w: 3.4, h: 3.4, tone: "neutral", label: "2" },
        { x: 0.4, y: 4.2, w: 3.4, h: 3.4, tone: "neutral", label: "4 · entry" },
        { x: 4.2, y: 4.2, w: 3.4, h: 3.4, tone: "neutral", label: "3" }
      ],
      players: [
        { x: 2.1, y: 2.1, label: "", team: "a" }, { x: 5.9, y: 2.1, label: "", team: "a" },
        { x: 2.1, y: 5.9, label: "", team: "a" }, { x: 5.9, y: 5.9, label: "", team: "a" }
      ],
      paths: [{ from: [2.1, 2.1], to: [5.9, 5.9], kind: "ball", curve: 0.2 }]
    }
  };

  E["setting-shuttle-relay"] = {
    format: {
      grouping: "Even teams of 2–3 in two short facing lines (a 'shuttle'), ages 9–12.",
      flow: "Set the ball to the front of the opposite line, then run to the back of THAT line. The ball shuttles back and forth as players chase their set.",
      tracking: "Teams count clean sets in a row, or race to a number of good sets; each line self-counts.",
      aim: "Most clean sets in the time, or first team to the target."
    },
    diagram: {
      caption: "Two facing lines: set across to the front player, then follow your set to the back of that line.",
      w: 9, h: 8,
      cones: [{ x: 1.3, y: 2 }, { x: 1.3, y: 4.7 }, { x: 7.7, y: 2 }, { x: 7.7, y: 4.7 }],
      players: [
        { x: 2, y: 2, label: "", team: "b" }, { x: 2, y: 3, label: "", team: "b" }, { x: 2, y: 4, label: "", team: "b" },
        { x: 7, y: 2, label: "", team: "a" }, { x: 7, y: 3, label: "", team: "a" }, { x: 7, y: 4, label: "", team: "a" }
      ],
      paths: [
        { from: [2.6, 2], to: [6.4, 2], kind: "ball", label: "set", curve: 0.25 },
        { from: [2, 2.2], to: [7, 4.7], kind: "move", label: "follow your set", curve: -0.35, playerIndex: 0 },
        { from: [6.4, 2], to: [2.6, 2], kind: "ball", label: "set back", curve: -0.25 },
        { from: [7, 2.2], to: [2, 4.7], kind: "move", label: "follow across", curve: 0.35, playerIndex: 3 }
      ],
      legend: [{ tone: "a", text: "Line A" }, { tone: "b", text: "Line B" }]
    }
  };

  // ---- DEFENSE GAMES (coach-fed) -------------------------------------------

  E["dig-and-catch-game"] = {
    format: {
      grouping: "Groups of 3: one digger, one tosser/hitter, one catcher/target (ages 8–12). Run several groups at once.",
      flow: "The hitter sends a controlled ball, the digger digs it high, the catcher catches the dig. Rotate digger → catcher → hitter every few reps.",
      tracking: "Group counts catchable digs; it's cooperative, building a high, playable dig.",
      aim: "Most clean catches; rotate so everyone digs equally."
    },
    diagram: dk.coachFeed({
      defenders: 1,
      sourceTeam: "b", sourceLabel: "F", sourceLegend: "Tosser / hitter",
      sourceNote: "tosser/hitter",
      extraPlayers: [{ x: 7.1, y: 6.2, label: "Ca", team: "b", note: "catches the dig" }],
      extraPaths: [{ from: [4.5, 8.2], to: [6.8, 6.4], kind: "ball", label: "high dig", curve: 0.18 }],
      extraLegend: [{ tone: "b", text: "Catcher / target" }],
      caption: "Hitter sends a controlled ball to the digger; the digger plays it high to the catcher. Rotate digger → catcher → hitter."
    })
  };

  E["defensive-ready-reaction-game"] = {
    format: {
      grouping: "Groups of 3 (one reacts, one feeds, one shags), ages 8–12. Several groups at once.",
      flow: "The feeder surprises the defender with balls to either side; the defender must be in a low ready position and react fast. Rotate after a set of reps.",
      tracking: "Count good reads/saves per turn; coach can make it a quick contest between groups.",
      aim: "Fast reactions from a low base; rotate roles every 30–45 sec."
    },
    diagram: dk.coachFeed({ defenders: 1, sourceTeam: "b", sourceLabel: "F", sourceLegend: "Feeder", sourceNote: "feeder",
      extraPlayers: [{ x: 7.2, y: 8.8, label: "Sh", team: "n", note: "shags next ball" }],
      extraLegend: [{ tone: "n", text: "Shagger / next feeder" }],
      caption: "Feeder surprises the defender side to side while the third player shags; rotate react → feed → shag." })
  };

})(window.RR);
