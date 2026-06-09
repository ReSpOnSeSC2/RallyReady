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
    diagram: dk.rotateIn({ teamSize: 2, wait: 3, caption: "Win on the challenger side to cross over and become queens; lose as queens and rotate to the back of the line. Points score only on the queen side." })
  };

  // Hand-built "run the whole play" scene — uses the dedicated free-ball
  // illustration (img:"freeball"); the acrossNet base keeps a valid 3v3 court as
  // the rare SVG fallback if the picture is ever unavailable.
  E["free-ball-mini-game"] = {
    diagram: Object.assign(
      dk.acrossNet({ teamSize: 3, wait: 2, caption: "A three-on-three free-ball rally: the coach tosses a free ball and your side runs pass → set → hit. Switch which side gets the free ball each rally." }),
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
    diagram: dk.rotateIn({ teamSize: 2, wait: 3, caption: "Doubles version: hold the king side to score; challengers who win cross over and take the throne." })
  };

  E["six-on-six-queen-of-the-court"] = {
    format: {
      grouping: "Full teams of 6. One team on the queen side, one challenging, extra team(s) waiting to rotate in.",
      flow: "Full-rotation 6v6 rallies, one at a time. Queens score and stay on a win; a loss sends a team off and rotates the next in.",
      tracking: "Points only on the queen side. Each team keeps its score; coach manages rotations and confirms the result.",
      aim: "Race to a target as queens; great in-season competitive block, 20 min."
    },
    diagram: dk.rotateIn({ teamSize: 6, wait: 2, caption: "Full 6v6 rotate-in: win as queens to stay and score; challengers who win cross over." })
  };

  // ---- 6v6 / WASH / SCORING GAMES ------------------------------------------

  E["six-v-six-wash-scoring"] = {
    format: {
      grouping: "Two full teams of 6 in normal rotations; subs wait to rotate in by position.",
      flow: "Played in 'washes': a team must win two small points in a row (e.g. its serve AND the next rally) to 'wash' and earn one big point — rewards stringing plays together.",
      tracking: "Coach runs the wash scoring and calls the big points out loud; teams rotate on each sideout.",
      aim: "First team to 5–7 big points; 15–20 min."
    },
    diagram: dk.acrossNet({ teamSize: 6, caption: "Full 6v6 in rotation; win two rallies in a row to 'wash' and bank a big point." })
  };

  E["serve-receive-wash-game"] = {
    format: {
      grouping: "Two teams of ~4–6: one serving, one in serve-receive formation; rotate after each series.",
      flow: "The receiving team must side out (win the rally off the serve) a set number of times to score. Then teams swap serve/receive roles.",
      tracking: "Coach tracks the side-out count and washes; receivers self-organize their formation.",
      aim: "Win the side-out battle to a target; 12–15 min."
    },
    diagram: dk.acrossNet({ teamSize: 5, caption: "One team serves, the other must side out a set number of times before roles switch." })
  };

  E["transition-wash-game"] = {
    format: {
      grouping: "Two full teams of 6, in rotation.",
      flow: "Each ball is played out twice: serve/receive, then the coach immediately enters a free ball or down ball so teams must TRANSITION and play again before a wash counts.",
      tracking: "Coach feeds the transition ball and tallies washes; teams play their normal positions.",
      aim: "First to the wash target; 15–20 min."
    },
    diagram: dk.acrossNet({ teamSize: 6, caption: "Serve/receive, then the coach feeds a transition ball — win both to bank the point." })
  };

  E["sideout-scoring-game"] = {
    format: {
      grouping: "Two full teams of 6, in rotation.",
      flow: "Only the RECEIVING team can score (a 'side-out' point). This puts the pressure on serve-receive and first-ball offense, just like a real match.",
      tracking: "Coach keeps score and rotates teams on each side-out; players run normal rotations.",
      aim: "First to the target side-outs; 15–20 min."
    },
    diagram: dk.acrossNet({ teamSize: 6, caption: "Side-out scoring: only the receiving team can score, so serve-receive is everything." })
  };

  E["comeback-pressure-game"] = {
    format: {
      grouping: "Two full teams of 6.",
      flow: "Start one team in a hole (e.g. down 0–5) so they must string points together to come back. Builds composure under scoreboard pressure.",
      tracking: "Coach sets the deficit and keeps score aloud; teams rotate normally.",
      aim: "Can the trailing team complete the comeback before time? 12–15 min."
    },
    diagram: dk.acrossNet({ teamSize: 6, caption: "One team starts behind and must string points together to come back — match-pressure reps." })
  };

  E["bonus-ball-scramble"] = {
    format: {
      grouping: "Two teams of ~4; subs rotate in.",
      flow: "Right after a rally ends, the coach tosses a surprise 'bonus ball' to a random spot — teams scramble to keep playing. Rewards readiness and hustle.",
      tracking: "Coach feeds bonus balls and keeps score; bonus-ball points may count double.",
      aim: "First to the target; 10–12 min."
    },
    diagram: dk.acrossNet({ teamSize: 4, caption: "After each rally the coach tosses a surprise bonus ball — scramble and keep playing." })
  };

  E["speedball"] = {
    format: {
      grouping: "Two teams of ~4; extra players queue to sub in fast.",
      flow: "Lightning pace: a new ball enters the instant a rally ends, with quick subs, so players get tons of reps and learn to reset fast.",
      tracking: "Coach feeds balls and keeps the tempo and score; teams self-organize.",
      aim: "Most points in a fast 6–8 min block."
    },
    diagram: dk.acrossNet({ teamSize: 4, wait: 2, caption: "Fast-feed game: a new ball enters the second the last one dies, with quick subs." })
  };

  E["bingo-bango-bongo"] = {
    format: {
      grouping: "Two full teams of 6 (ages 15–18).",
      flow: "Score three ways in one rally: 'bingo' (pass), 'bango' (set), 'bongo' (kill). A clean three-contact point is worth the most, rewarding running a full offense.",
      tracking: "Coach scores the bingo/bango/bongo bonuses; teams play normal rotations.",
      aim: "First to the target; 15 min."
    },
    diagram: dk.acrossNet({ teamSize: 6, caption: "Reward the full pass–set–hit: a clean three-contact point scores the most." })
  };

  E["first-ball-kill-game"] = {
    format: {
      grouping: "Two teams of ~5–6 (ages 15–18).",
      flow: "The coach serves or tosses; the receiving team must KILL the first ball (pass–set–hit for a point) — no long rallies. Trains terminal first-ball offense.",
      tracking: "Coach awards the point only for a first-ball kill, then feeds the next; teams rotate.",
      aim: "Most first-ball kills in the block; 12–15 min."
    },
    diagram: dk.acrossNet({ teamSize: 5, caption: "Receive and terminate the FIRST ball — pass, set, kill. No drawn-out rallies." })
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
      flow: "The receiving group must side out a target number of times IN A ROW against a gauntlet of tough serves; one fail resets the streak.",
      tracking: "Coach tracks the consecutive-sideout count; servers rotate so the serves stay tough.",
      aim: "Hit the streak target (e.g. 5 in a row), then rotate a new group through."
    },
    diagram: {
      caption: "Servers fire a gauntlet from across the net; the receiving group must side out several times in a row.",
      w: 9, h: 12, net: 6, lines: [{ y: 3 }, { y: 9 }],
      court: [{ x: 0, y: 0, w: 9, h: 12 }],
      players: [
        { x: 2, y: 1.4, label: "S", team: "b" }, { x: 4.5, y: 1.4, label: "S", team: "b" }, { x: 7, y: 1.4, label: "S", team: "b" },
        { x: 2, y: 8.6, label: "P", team: "a" }, { x: 4.5, y: 9.2, label: "P", team: "a" }, { x: 7, y: 8.6, label: "P", team: "a" },
        { x: 6, y: 7, label: "St", team: "a" }, { x: 3, y: 7, label: "H", team: "a" }
      ],
      paths: [{ from: [4.5, 1.8], to: [4.5, 8.4], kind: "serve", curve: 0.2 }],
      legend: [{ tone: "b", text: "Servers" }, { tone: "a", text: "Receiving team" }]
    }
  };

  // ---- STATION / TOURNAMENT GAMES ------------------------------------------

  E["mini-volley-stations-tournament"] = {
    format: {
      grouping: "Several small teams (2–3 each), one team per station/mini-court running at the same time.",
      flow: "All stations play at once for a set time, then everyone rotates to the next station/opponent — a round-robin tournament feel.",
      tracking: "Each station self-scores its mini-game; the coach blows a whistle to rotate and tracks standings on a sheet.",
      aim: "Most station wins by the end; 20+ min."
    },
    diagram: dk.stations({ labels: ["Court 1", "Court 2", "Court 3", "Court 4"], cols: 2, caption: "Every station plays at once for a timed round; whistle, then everyone rotates to the next." })
  };

  E["camp-skills-circuit"] = {
    format: {
      grouping: "Split the camp into even small groups, one group per skill station.",
      flow: "All stations run simultaneously for a timed interval; on the whistle every group rotates to the next skill (serve → pass → set → hit → …).",
      tracking: "Each station has a coach/helper running it; players self-count reps within the station.",
      aim: "Everyone touches every station; 3–5 min per station."
    },
    diagram: dk.stations({ labels: ["Serve", "Pass", "Set", "Hit"], cols: 2, caption: "Skill stations run at once; whistle and rotate so every group hits every skill." })
  };

  // ---- YOUTH GAMES ----------------------------------------------------------

  E["passing-21-circle"] = {
    format: {
      grouping: "One circle of 4–6 with a target player (or coach) in the middle (ages 9–12).",
      flow: "Everyone in at once: pass around or to the middle, counting toward 21. The middle player feeds and judges good passes.",
      tracking: "Single group count to 21; a bad pass might cost points. The middle player calls it.",
      aim: "Reach 21 as a group, then rotate the middle player."
    },
    diagram: dk.circlePass({ n: 5, center: true, centerLabel: "T", caption: "Pass around the circle and to the middle target (T), counting together toward 21." })
  };

  E["four-square-volleyball"] = {
    format: {
      grouping: "Four players, one in each square (the rest wait to rotate in), ages 9–12.",
      flow: "Like playground four-square: the ball is volleyed (one bounce allowed) from square to square. Miss or fault and you move to the lowest square; everyone shifts up.",
      tracking: "Players self-officiate; a waiting player rotates into the lowest square.",
      aim: "Work your way up to (and hold) the 'king' square."
    },
    diagram: {
      caption: "One player per square; volley the ball between squares (one bounce ok). Fault and you drop to square 1, others move up.",
      w: 8, h: 8,
      zones: [
        { x: 0.4, y: 0.4, w: 3.4, h: 3.4, tone: "neutral", label: "4 (king)" },
        { x: 4.2, y: 0.4, w: 3.4, h: 3.4, tone: "neutral", label: "3" },
        { x: 0.4, y: 4.2, w: 3.4, h: 3.4, tone: "neutral", label: "1" },
        { x: 4.2, y: 4.2, w: 3.4, h: 3.4, tone: "neutral", label: "2" }
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
      players: [
        { x: 2, y: 2, label: "", team: "b" }, { x: 2, y: 3, label: "", team: "b" }, { x: 2, y: 4, label: "", team: "b" },
        { x: 7, y: 2, label: "", team: "a" }, { x: 7, y: 3, label: "", team: "a" }, { x: 7, y: 4, label: "", team: "a" }
      ],
      paths: [
        { from: [2.6, 2], to: [6.4, 2], kind: "ball", label: "set", curve: 0.25 },
        { from: [7, 2.5], to: [7, 4.4], kind: "move", curve: -0.4 },
        { from: [2, 4.4], to: [2, 2.6], kind: "move", curve: 0.4 }
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
    diagram: dk.coachFeed({ defenders: 1, sourceNote: "tosser/hitter", caption: "Hitter sends a ball, the digger digs it high, a catcher catches it — then rotate roles." })
  };

  E["defensive-ready-reaction-game"] = {
    format: {
      grouping: "Groups of 3 (one reacts, one feeds, one shags), ages 8–12. Several groups at once.",
      flow: "The feeder surprises the defender with balls to either side; the defender must be in a low ready position and react fast. Rotate after a set of reps.",
      tracking: "Count good reads/saves per turn; coach can make it a quick contest between groups.",
      aim: "Fast reactions from a low base; rotate roles every 30–45 sec."
    },
    diagram: dk.coachFeed({ defenders: 1, sourceNote: "feeder", caption: "Feeder surprises the defender side to side; stay low and react. Rotate react → feed → shag." })
  };

})(window.RR);
