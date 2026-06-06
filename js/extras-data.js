// extras-data.js — per-drill organization + diagrams, batch 1 (RR.extras).
//
// Keyed by drill id. Each entry may carry:
//   format  — overrides for RR.format (grouping / flow / tracking / space / aim),
//             written to remove the #1 confusion: is everyone going at once or
//             one at a time, and who keeps the score.
//   diagram — an RR.diagram spec (usually from a RR.dk builder) showing where
//             players stand and where the ball goes.
//
// This file covers serving games, cooperative/ball-control games, and the
// net/court games. Batch 2 (extras-data-2.js) covers the rest + skill drills.
// Split only to honour the <800-line-per-file rule; they share one RR.extras.
window.RR = window.RR || {};
RR.extras = RR.extras || {};

(function (RR) {
  "use strict";
  var dk = RR.dk;
  var E = RR.extras;

  // ---- SERVING GAMES --------------------------------------------------------

  E["serving-streak-challenge"] = {
    format: {
      grouping: "Everyone at once. Each player takes a ball and a spot along the end line — nobody waits in a serving line.",
      flow: "Self-paced: serve, chase your own ball, come back, serve again. You're racing your OWN best streak, not the player next to you.",
      tracking: "Each player counts their own streak out loud or on fingers. A miss = back to zero. The coach calls out the day's top streak to chase, and (for the group game) adds up everyone's personal best at the end.",
      space: "Spread servers across the whole end line so balls don't collide; serve into an open court.",
      aim: "Run 6–8 min. Log each player's best streak so next practice they have a number to beat."
    },
    diagram: dk.serveTargets({
      servers: 4,
      zones: [{ x: 0.6, y: 0.7, w: 7.8, h: 2.6, tone: "target", label: "land it in" }],
      caption: "Servers spread along the end line and all serve at once — each chasing their own streak into the open court."
    })
  };

  E["serving-ladder-game"] = {
    format: {
      grouping: "Pairs, or the whole team at once — every server on the end line with a ball.",
      flow: "Everyone serves at the same time and climbs the ladder solo: make one from the short line, step back a step, make the next from farther, and so on (the '7-Up' ladder).",
      tracking: "Each player tracks their own rung. A miss drops you back a step. The coach posts who reaches the top line first.",
      aim: "First to serve from the full distance (or 7 makes) wins the round; reset and go again."
    },
    diagram: dk.serveTargets({
      servers: 3,
      caption: "Each server climbs back one step per make — everyone works their own ladder at the same time."
    })
  };

  E["around-the-world-serving"] = {
    format: {
      grouping: "Groups of 3 share a ball and one serving spot.",
      flow: "Take turns: serve into zone 1, and if you make it you 'travel' to aim at the next zone. Players rotate serve → shag → wait, so the ball is always live.",
      tracking: "Each player tracks which zone they're on; first to hit every zone 'around the world' wins. The shagger confirms makes.",
      aim: "8–10 min, or until someone completes the lap."
    },
    diagram: dk.serveTargets({
      servers: 1,
      zones: [
        { x: 0.5, y: 0.7, w: 2.4, h: 2.2, tone: "target", label: "1" },
        { x: 3.3, y: 0.7, w: 2.4, h: 2.2, tone: "target", label: "2" },
        { x: 6.1, y: 0.7, w: 2.4, h: 2.2, tone: "target", label: "3" }
      ],
      caption: "One server at a time aims zone to zone, 'travelling around the world'; the group rotates serve → shag."
    })
  };

  E["knockout-serving-game"] = {
    format: {
      grouping: "Whole group in one line behind the end line, each with a ball.",
      flow: "One at a time (or in quick waves): everyone serves a round. Miss your serve and you're knocked out for that round and step to the side.",
      tracking: "The coach (or a knocked-out player) watches the line and calls misses. Last server standing wins.",
      aim: "Several quick rounds; knocked-out players rejoin each new round so no one sits long."
    },
    diagram: dk.serveTargets({ servers: 5, caption: "Whole line serves each round; a miss knocks you out until one server is left." })
  };

  E["dead-fish-serving"] = {
    format: {
      grouping: "Whole group on the end line, each with a ball.",
      flow: "Everyone serves together each round. Miss and you become a 'dead fish' — sit down where you are. Make a serve while sitting and you come back to life.",
      tracking: "Coach calls makes/misses; players self-police sitting and standing. Last fish swimming wins.",
      aim: "Keep it light and fast — 6–8 min."
    },
    diagram: dk.serveTargets({ servers: 5, caption: "All serve each round; a miss = sit down ('dead fish'), a make from sitting brings you back." })
  };

  E["serving-relay-race"] = {
    format: {
      grouping: "Two or three even teams, each in a line behind the end line with one ball per team.",
      flow: "Relay style: the front server serves, shags their own ball, hands off to the next teammate, and goes to the back of the line.",
      tracking: "A team counts a point only for serves that land in. First team to a target number of made serves wins. Each team self-counts; coach settles ties.",
      aim: "Race to 10–15 made serves per team."
    },
    diagram: dk.serveTargets({ servers: 2, caption: "Each team serves one at a time, shags, and tags the next — race to a target of made serves." })
  };

  E["youth-serving-target-game"] = {
    format: {
      grouping: "Pairs or small groups sharing a couple of balls; everyone serving at once.",
      flow: "Self-paced serving at big, friendly target zones. Players serve, fetch, and go again — lots of contacts, no waiting.",
      tracking: "Players score their own points for hitting a zone; a partner can confirm. Celebrate any serve that lands in.",
      aim: "Keep it positive — total up points as a team to a fun goal."
    },
    diagram: dk.serveTargets({
      servers: 3,
      zones: [{ x: 0.6, y: 0.6, w: 3.4, h: 3, tone: "target", label: "10" }, { x: 5, y: 0.6, w: 3.4, h: 3, tone: "target", label: "10" }],
      caption: "Big forgiving target zones; everyone serves at once and scores their own hits."
    })
  };

  // ---- COOPERATIVE / BALL-CONTROL GAMES ------------------------------------

  E["cooperative-pass-count"] = {
    format: {
      grouping: "One group of 4–6 in a circle (split into two circles if you have a big squad).",
      flow: "Everyone is in at once. Keep ONE ball alive with legal touches; no one may touch it twice in a row, so players must talk and move.",
      tracking: "It's a single TEAM score — the group counts touches out loud together. A drop resets to zero; the goal is the team's new record.",
      aim: "Beat your group's best streak; 6–8 min."
    },
    diagram: dk.circlePass({ n: 6, caption: "One circle, one ball — count touches together; you can't hit it twice in a row, so call it early." })
  };

  E["hot-potato-ball-control"] = {
    format: {
      grouping: "One circle of 6 (or two circles for a big group).",
      flow: "Everyone in at once. The ball is a 'hot potato' — pass it on fast with a controlled touch; whoever lets it drop does a quick fun forfeit and play restarts.",
      tracking: "Group counts consecutive touches together; the coach can speed it up by calling 'faster!'",
      aim: "Short and snappy — keep the energy high for 5–6 min."
    },
    diagram: dk.circlePass({ n: 6, caption: "Pass the 'hot potato' quickly around the circle with control — keep it moving." })
  };

  E["amoeba-team-game"] = {
    format: {
      grouping: "Whole group as ONE blob ('amoeba'), spread in an open area.",
      flow: "Everyone in at once, keeping one ball up together. Each time the group hits a target number of touches, the amoeba 'grows' a new rule or a smaller space.",
      tracking: "Single team count, out loud. Coach adds the twist at each milestone.",
      aim: "See how big the amoeba can grow before a drop; 8 min."
    },
    diagram: dk.circlePass({ n: 7, caption: "The whole group keeps one ball alive together; hit the target and the 'amoeba' grows a new rule." })
  };

  E["shepherd-and-sheep"] = {
    format: {
      grouping: "Whole group; one or two 'shepherds', everyone else are 'sheep' (ages 8–10).",
      flow: "Everyone moves at once in an open area. Shepherds toss/serve balls; sheep pass them back or to a target to be 'herded' safely.",
      tracking: "Coach runs the story and counts safe passes; it's cooperative, not elimination.",
      aim: "Lots of laughs and touches — about 6 min."
    }
  };

  E["balloon-keep-it-up"] = {
    format: {
      grouping: "Solo or pairs, each with a balloon (ages 8–10).",
      flow: "Everyone at once: keep the balloon up using forearm and overhead touches — the slow float lets brand-new players find the platform and timing.",
      tracking: "Each player/pair counts their own touches and tries to beat it.",
      aim: "Build to 10+ touches without a catch; 5 min."
    }
  };

  // ---- NET / COURT GAMES ----------------------------------------------------

  E["over-the-net-pepper"] = {
    format: {
      grouping: "Pairs, one on each side of the net (use several net spots at once).",
      flow: "Both partners work continuously: dig → set → controlled attack, over and over, keeping one ball alive across the net.",
      tracking: "Cooperative — partners count consecutive good sequences together and try to beat it.",
      aim: "Longest controlled rally; 6–8 min, then switch partners."
    },
    diagram: dk.pairsRows({ pairs: 3, net: true, topLabel: "", botLabel: "", caption: "Partners face off across the net at several spots; keep one controlled ball going dig–set–hit." })
  };

  E["mini-court-cooperative-rally"] = {
    format: {
      grouping: "Pairs across a small/short court (use the area between the attack line and net).",
      flow: "Both players work at once, cooperating to keep the rally going in a tight space — control over power.",
      tracking: "Partners count their longest rally together; it's you-two vs. the rally, not each other.",
      aim: "Beat your rally record; rotate partners every few minutes."
    },
    diagram: dk.pairsRows({ pairs: 2, net: true, topLabel: "", botLabel: "", caption: "Short-court pairs rally cooperatively in a tight space — aim for control, not winners." })
  };

  E["set-and-catch-game"] = {
    format: {
      grouping: "Pairs, a few steps apart (ages 8–12). No net needed.",
      flow: "Everyone works at once: one partner sets, the other catches overhead in 'set hands', freezes to check the shape, then sets it back.",
      tracking: "Partners count clean catches together; the freeze lets them self-correct hand shape.",
      aim: "String together 10 clean sets; 6 min."
    },
    diagram: dk.pairsRows({ pairs: 3, net: false, topLabel: "", botLabel: "", caption: "Partners set and catch overhead, freezing to check hand shape before sending it back." })
  };

  E["one-v-one-short-court"] = {
    format: {
      grouping: "1 vs 1 on a short/narrow court; the rest of the squad pairs up on other net spots or waits to rotate in.",
      flow: "Two players rally head-to-head; winner of the point stays, the other rotates out for a waiting player.",
      tracking: "Players call their own score; coach confirms close calls. Keep games short so lines move.",
      aim: "Quick games to 5; loser rotates, winner defends."
    },
    diagram: dk.acrossNet({ teamSize: 1, courtX0: 2, courtW: 5, wait: 2, caption: "1v1 on a short court; winner stays, loser swaps with a waiting player." })
  };

  E["two-v-two-deep-court"] = {
    format: {
      grouping: "Teams of 2 on a full-depth court; extra pairs wait to rotate in.",
      flow: "Both pairs play live rallies; every player touches lots of balls because there's nowhere to hide in a 2v2.",
      tracking: "Pairs call their own score; coach keeps the rotation moving and confirms the winner.",
      aim: "Games to 7–10, winner stays on."
    },
    diagram: dk.acrossNet({ teamSize: 2, wait: 2, caption: "2v2 over a full court; lots of touches per player. Winners stay, a waiting pair rotates in." })
  };

  E["narrow-court-line-battle"] = {
    format: {
      grouping: "Teams of 2 on a NARROW court (one half the usual width); run two narrow courts side by side if space allows.",
      flow: "Both teams play live; the narrow court forces straight-ahead passing and serving rather than wide swings.",
      tracking: "Teams call their own score; first to the target wins the 'line battle'.",
      aim: "Games to 7; rotate the losing team off."
    },
    diagram: dk.acrossNet({ teamSize: 2, courtX0: 2.5, courtW: 4, wait: 2, caption: "2v2 on a narrowed court — keeps every contact straight up the line." })
  };

  E["three-v-three-mini-game"] = {
    format: {
      grouping: "Teams of 3 across the net; extra trios wait to rotate in.",
      flow: "Everyone plays at once. Require all three contacts (pass–set–hit) so every player is involved each rally.",
      tracking: "Teams self-score; coach confirms the winner and rotates a fresh trio in.",
      aim: "Games to 11; winner stays."
    },
    diagram: dk.acrossNet({ teamSize: 3, wait: 3, caption: "3v3 with three-contact rules so everyone touches the ball each rally." })
  };

  E["two-touch-mini-volley"] = {
    format: {
      grouping: "Teams of 2 on a small court (ages 8–12).",
      flow: "Both teams play; a two-touch rule (pass then send) keeps young players moving without the pressure of a perfect set.",
      tracking: "Teams call their own score; coach keeps it upbeat and rotating.",
      aim: "Short games to 5–7."
    },
    diagram: dk.acrossNet({ teamSize: 2, courtX0: 2, courtW: 5, wait: 2, caption: "Small-court 2v2 with a friendly two-touch rule for younger players." })
  };

  E["newcomb-catch-volley"] = {
    format: {
      grouping: "Teams of 3 across the net (ages 8–12).",
      flow: "Everyone plays. The ball is CAUGHT and thrown over (Newcomb style), building rotations and positioning before live contacts are added.",
      tracking: "Teams self-score rally points; coach teaches where to stand between rallies.",
      aim: "Games to 11; progress toward one real contact when ready."
    },
    diagram: dk.acrossNet({ teamSize: 3, wait: 0, caption: "Newcomb: catch and throw over the net to learn positioning before live contacts." })
  };

  E["volley-tennis"] = {
    format: {
      grouping: "Teams of 2 on a small court (ages 8–14).",
      flow: "Both teams play; one bounce is allowed before each contact, which gives beginners time to get under the ball.",
      tracking: "Teams call their own score, tennis-style; coach confirms.",
      aim: "Games to 7–11; rotate teams."
    },
    diagram: dk.acrossNet({ teamSize: 2, courtX0: 1.8, courtW: 5.4, wait: 2, caption: "Volley-tennis 2v2 — one bounce allowed before each touch so beginners get set." })
  };

  E["four-v-four-continuous"] = {
    format: {
      grouping: "Teams of 4; if you have extras, they wait on the sideline to sub in.",
      flow: "Continuous play: the coach feeds a new ball the instant a rally ends, so transitions never stop.",
      tracking: "Teams self-score; coach feeds balls and keeps the running total.",
      aim: "Timed 6–8 min blocks, then rotate subs in."
    },
    diagram: dk.acrossNet({ teamSize: 4, wait: 2, caption: "4v4 with the coach feeding a fresh ball the moment a rally dies — non-stop transitions." })
  };

  E["free-ball-mini-game"] = {
    format: {
      grouping: "Teams of 3 across the net; a server/tosser starts each ball.",
      flow: "Everyone plays. The coach tosses an easy 'free ball' to one side; that team must run a clean pass–set–hit, then play it out live.",
      tracking: "Teams self-score; coach decides which side gets the free ball and keeps score.",
      aim: "Games to 11; alternate which side receives the free ball."
    },
    // A purpose-built picture (not the generic across-net standoff): the coach
    // tosses a free ball to ONE side, which runs a clean pass→set→hit while the
    // other side defends — the whole point of the drill, at a glance.
    diagram: {
      caption: "The coach tosses an easy free ball to one side; that team runs a clean pass→set→hit, then plays it out live 3v3.",
      w: 9, h: 12, net: 6, lines: [{ y: 3 }, { y: 9 }],
      court: [{ x: 0, y: 0, w: 9, h: 12 }],
      players: [
        { x: 2.3, y: 4.3, label: "", team: "b" },
        { x: 6.7, y: 4.3, label: "", team: "b" },
        { x: 4.5, y: 2.5, label: "", team: "b" },
        { x: 4.5, y: 9.3, label: "P", team: "a" },
        { x: 6.6, y: 7.0, label: "S", team: "a" },
        { x: 2.6, y: 7.1, label: "H", team: "a" },
        { x: 8.0, y: 1.0, label: "C", team: "coach", note: "tosses" }
      ],
      paths: [
        { from: [7.7, 1.3], to: [4.7, 8.9], kind: "serve", label: "free ball", curve: 0.3 },
        { from: [4.6, 9.0], to: [6.3, 7.2], kind: "ball", label: "pass", curve: 0.25 },
        { from: [6.4, 6.8], to: [3.0, 7.0], kind: "ball", label: "set", curve: 0.3 },
        { from: [2.8, 6.8], to: [5.0, 3.4], kind: "serve", label: "attack", curve: 0.12 }
      ],
      legend: [
        { tone: "a", text: "Your side (P→S→H)" },
        { tone: "b", text: "Other side" },
        { tone: "coach", text: "Coach (free ball)" }
      ]
    }
  };

  E["beat-the-number-team-challenge"] = {
    format: {
      grouping: "Two teams of 3 across the net (cooperative target version).",
      flow: "Everyone plays, but both sides COOPERATE to reach a target number of successful crossings of the net without an error.",
      tracking: "Single shared count for both teams together; a fault resets it. Coach calls the count.",
      aim: "Beat the team's best number of clean rallies."
    },
    diagram: dk.acrossNet({ teamSize: 3, caption: "Both sides cooperate to rally the ball cleanly over the net as many times as possible." })
  };

})(window.RR);
