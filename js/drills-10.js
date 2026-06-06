// drills-10.js — RallyReady drill library DATA (Part 10).
//
// PURE DATA ONLY. Standard, widely-taught drills and lead-up games that fill
// gaps in Parts 1–9 — sourced from common youth/HS coaching references and
// rewritten in plain coach English. CONCATENATES onto RR.drills. Same schema
// and LINKS standard as the other parts.
window.RR = window.RR || {};

(function (RR) {
  "use strict";

  var v = RR.drillVideoSearch || function (name) {
    return "https://www.youtube.com/results?search_query=" +
      encodeURIComponent("how to " + name + " volleyball");
  };

  var more = [

    // ============== YOUTH LEAD-UP GAMES & FUNDAMENTALS (8–12) ==============
    {
      id: "balloon-keep-it-up",
      name: "Balloon Keep It Up",
      skill: "Ball Control",
      ageMin: 8, ageMax: 10,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls"],
      setup: "Each player gets a balloon or a beach ball in an open space — no net needed. The slow float gives brand-new players time to track the ball and get under it, which a real volleyball doesn't.",
      steps: [
        "Keep the balloon up with open-hand sets and forearm taps — never let it hit the floor.",
        "Move your feet to stay under it every time.",
        "Count your contacts in a row and try to beat your best.",
        "Call out a contact to switch to — \"set,\" then \"pass\" — on the coach's shout."
      ],
      cues: [
        "Watch it all the way to your hands.",
        "Get under it with your feet, not your reach.",
        "Soft, controlled taps straight up."
      ],
      easier: "Let it bounce or catch it between contacts until the rhythm clicks.",
      harder: "Switch to a lightweight trainer volleyball and set a target count.",
      videoSearchUrl: v("Balloon Keep It Up")
    },
    {
      id: "shepherd-and-sheep",
      name: "Shepherd and the Sheep",
      skill: "Ball Control",
      ageMin: 8, ageMax: 10,
      difficulty: 1,
      minPlayers: 6,
      durationMin: 8,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "cones"],
      setup: "Cone off a \"pasture\" across the gym. Most players are shepherds, each keeping a balloon or beach ball up to themselves; pick three or four to be sheepdogs in the middle. A fun way to train ball control while moving.",
      steps: [
        "Shepherds walk across the pasture while keeping their balloon up the whole way.",
        "Sheepdogs tap balloons away — no grabbing — to turn shepherds into sheepdogs.",
        "If your balloon drops or gets tapped away, you become a sheepdog.",
        "Play until only a few shepherds are left, then reset and go again."
      ],
      cues: [
        "Eyes up and feet moving.",
        "Small controlled taps so it stays in front of you.",
        "Protect your own space."
      ],
      easier: "Slow walk only and fewer sheepdogs; allow one bounce.",
      harder: "Use real volleyballs and require forearm-only contacts.",
      videoSearchUrl: v("volleyball ball control movement game")
    },
    {
      id: "passing-21-circle",
      name: "Passing 21 Circle",
      skill: "Passing",
      ageMin: 9, ageMax: 12,
      difficulty: 2,
      minPlayers: 4,
      durationMin: 10,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls"],
      setup: "Players stand in small circles of four or five, about eight to ten feet apart, with one ball per circle. A classic cooperative passing game that builds control and calling as a group.",
      steps: [
        "Start with an underhand toss into the circle, then keep it alive with forearm passes.",
        "Score 3 for a clean pass played straight from the air, 1 if it bounces first.",
        "Count out loud as a team and race to 21.",
        "If the ball drops untouched, keep the score and restart with a toss."
      ],
      cues: [
        "Call \"mine\" early and loud.",
        "Face the next passer and send it playable.",
        "Beat the ball to the spot."
      ],
      easier: "Allow one bounce every time and lower the goal to 11.",
      harder: "No bounces, or require a set as the second contact.",
      videoSearchUrl: v("volleyball passing circle game")
    },
    {
      id: "four-square-volleyball",
      name: "Four-Square Volleyball",
      skill: "Team Play",
      ageMin: 9, ageMax: 12,
      difficulty: 2,
      minPlayers: 4,
      durationMin: 12,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "cones"],
      setup: "Tape or cone off a big four-square grid. One or two players stand in each square, with extras waiting by square four. The volleyball version of a playground classic — great for control and quick decisions.",
      steps: [
        "Start each rally with a soft underhand pass from square one.",
        "Players bump or set the ball to another square — no catching.",
        "Whoever makes the error rotates down to square four; everyone else moves up.",
        "Keep it continuous and rotate the waiting line in."
      ],
      cues: [
        "Two hands or platform — no catches.",
        "Pass it playable, about waist height.",
        "Stay clean to move up."
      ],
      easier: "Allow one bounce before contact, or let beginners catch and toss.",
      harder: "Require alternating bump then set, or shrink the squares.",
      videoSearchUrl: v("four square volleyball game")
    },
    {
      id: "dead-fish-serving",
      name: "Dead Fish Serving Game",
      skill: "Serving",
      ageMin: 9, ageMax: 12,
      difficulty: 2,
      minPlayers: 6,
      durationMin: 10,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Split into two teams, one on each side of the net, every player with a ball and a basket nearby for refills. A high-energy serving game that sneaks in a ton of reps.",
      steps: [
        "On \"go,\" everyone serves over the net at the same time.",
        "Miss your serve and you lie down as a \"dead fish\" on the other side.",
        "Teammates rescue a downed player by landing a serve near them to bring them back in.",
        "Play for a set time, or until one side has the most players standing."
      ],
      cues: [
        "Same toss, same spot, every time.",
        "Aim it — don't just blast it.",
        "Reset and serve again fast."
      ],
      easier: "Serve from inside the court or allow underhand serves.",
      harder: "Serve from the full end line, or call a zone to rescue a teammate.",
      videoSearchUrl: v("dead fish volleyball serving game")
    },
    {
      id: "serving-relay-race",
      name: "Serving Relay Race",
      skill: "Serving",
      ageMin: 9, ageMax: 12,
      difficulty: 2,
      minPlayers: 6,
      durationMin: 10,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Two even teams line up behind the end line, one ball per team. Turns serving under a little pressure, with built-in shagging so nobody stands around.",
      steps: [
        "The first player serves until one lands in over the net.",
        "They shag their own ball and hand it to the next teammate.",
        "Continue down the line — first team with everyone making a good serve wins.",
        "Re-rack and play another round."
      ],
      cues: [
        "Same toss even with the line watching.",
        "Breathe, then serve.",
        "Hustle to shag and hand off."
      ],
      easier: "Move the line in, or allow underhand serves.",
      harder: "Require two makes per player, or serve to a called zone.",
      videoSearchUrl: v("volleyball serving relay race")
    },
    {
      id: "setting-shuttle-relay",
      name: "Setting Shuttle Relay",
      skill: "Setting",
      ageMin: 9, ageMax: 12,
      difficulty: 2,
      minPlayers: 4,
      durationMin: 8,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "cones"],
      setup: "Two cones about fifteen feet apart, with two short lines facing each other behind them. Players set the ball back and forth and follow their set — a moving way to groove clean hands.",
      steps: [
        "Set the ball across to the front of the opposite line.",
        "Follow your set and jog to the back of that line.",
        "The receiver sets it back and follows, keeping the ball alive down and back.",
        "Go for a set number of clean sets in a row, or the team's longest streak."
      ],
      cues: [
        "Hands in a window above your forehead.",
        "Push with your legs, not just your arms.",
        "Follow your set every time."
      ],
      easier: "Allow a catch-and-set, or one self-bounce before setting.",
      harder: "Shrink the gap or require a high set to a target height.",
      videoSearchUrl: v("volleyball setting shuttle relay")
    },

    // ============ CORE SKILL & COMBINATION DRILLS (12–18) ============
    {
      id: "serve-and-pass-crossover",
      name: "Serve and Pass Crossover",
      skill: "Passing",
      value: 4,
      ageMin: 12, ageMax: 18,
      difficulty: 2,
      minPlayers: 6,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net", "cones"],
      setup: "Three passers in serve-receive with a setter target at the net, and a line of servers behind the far end line. A cone marks the target so passers know where the ball has to go. Trains serving and passing as the connected jobs they are in a match.",
      steps: [
        "Servers serve real serves at the three passers, one at a time.",
        "Passers call the ball, pass to the target, and reset to base.",
        "After a group earns three good passes, rotate: a passer goes to serve, a server steps in to pass.",
        "Keep the line moving so everyone both serves and passes."
      ],
      cues: [
        "Move your feet to get behind it, then hold a still platform.",
        "Pass it high and to the target, not just up.",
        "Servers — serve like it's a match and make the passer work."
      ],
      easier: "Servers serve from inside the court so passers get easier, predictable balls.",
      harder: "Servers aim the seams between passers so the group has to call who takes it.",
      videoSearchUrl: v("Serve and Pass Crossover")
    },
    {
      id: "pass-set-hit-triangle",
      name: "Pass-Set-Hit Triangle",
      skill: "Hitting",
      value: 4,
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 4,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net", "cones"],
      setup: "A setter at the net target, a line of hitters at the left-side approach, and a coach across the net to send a free ball at a back-court passer. The full three-contact sequence in one rep — pass, set, hit.",
      steps: [
        "Coach tosses a free ball over the net to the passer.",
        "Passer passes to the setter, the setter sets the outside, the hitter approaches and attacks.",
        "Rotate each rep: passer to hitter line, hitter to shag, next player in to pass.",
        "Run a set number of clean pass-set-hit reps, then switch sides."
      ],
      cues: [
        "Three contacts, three jobs — finish yours before you watch the next.",
        "Hitter, wait for the set to leave the setter's hands before you commit.",
        "Pass it high to the target so the setter has time."
      ],
      easier: "Coach tosses straight to the setter so players just work the set and hit.",
      harder: "Coach drives a harder ball so the passer is truly tested before the set and hit.",
      videoSearchUrl: v("Pass Set Hit Triangle")
    },
    {
      id: "setter-release-from-base",
      name: "Setter Release from Base",
      skill: "Setting",
      value: 4,
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net", "cones"],
      setup: "The setter starts in right-back serve-receive base. A coach stands in the passing lane with a ball, and a hoop or cone marks the front-row setting spot at the net. This is the release and footwork a setter makes on every single rally.",
      steps: [
        "Coach slaps the ball to release the setter from base.",
        "Setter sprints to the net target, squares to the left antenna, and faces out.",
        "Coach tosses a pass and the setter delivers the outside set, then jogs back to base.",
        "Run several reps, then start the setter at right-front and repeat."
      ],
      cues: [
        "Release on the slap — beat the ball to the net.",
        "Get there early and stop square; don't set on the run.",
        "Open up so you see both the pass and your hitters."
      ],
      easier: "Setter starts at the net and just works squaring up and setting the toss.",
      harder: "Vary the pass off the net so the setter adjusts footwork and still delivers a hittable ball.",
      videoSearchUrl: v("Setter Release from Base")
    },
    {
      id: "box-hitting-reps",
      name: "Box Hitting Reps",
      skill: "Hitting",
      value: 4,
      ageMin: 12, ageMax: 18,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net", "box", "cones"],
      setup: "A sturdy box just in front of the net at the outside-hitter spot, with target cones cross-court and down the line on the far side and a feeder beside the box. Takes the timing out so hitters can groove a clean, full arm swing.",
      steps: [
        "Hitter stands on the box at net height with the arm cocked back.",
        "Feeder tosses a ball up in front of the hitting shoulder.",
        "Hitter swings full speed, snapping the wrist to drive the ball down at a target.",
        "Alternate line and angle, then rotate the next hitter in."
      ],
      cues: [
        "High elbow, fast hand — contact at full reach.",
        "Snap the wrist on top to drive it down.",
        "See the target, then hit it — line or angle on purpose."
      ],
      easier: "Hitter self-tosses and swings slower just to groove the arm path.",
      harder: "Feeder varies toss height and spot so the hitter adjusts contact while still aiming.",
      videoSearchUrl: v("Box Hitting Reps volleyball")
    },

    // ========= ADVANCED COMPETITION & ACCOUNTABILITY (15–18) =========
    {
      id: "bingo-bango-bongo",
      name: "Bingo Bango Bongo",
      skill: "Team Play",
      value: 4,
      ageMin: 15, ageMax: 18,
      difficulty: 4,
      minPlayers: 12,
      durationMin: 12,
      isStaple: false,
      isGame: true,
      campFriendly: false,
      equipment: ["balls", "net", "cones"],
      setup: "Two teams of six, with a coach on each sideline holding balls to enter free balls fast and keep play continuous. A classic competition game that rewards stringing points together, not just winning one rally.",
      steps: [
        "Win a rally for \"Bingo,\" win the next in a row for \"Bango,\" a third straight for \"Bongo.\"",
        "On Bongo, that team serves for a real point — win it to score and both teams rotate.",
        "Any rally loss resets that team's streak back to zero.",
        "Play to a set number of points or a time cap."
      ],
      cues: [
        "String points together — one isn't enough.",
        "Eyes up the second the ball clears the net.",
        "Talk every transition."
      ],
      easier: "Start every ball as a coach free ball instead of a live serve.",
      harder: "Require the Bongo serve to be a clean, flat serve or it doesn't count.",
      videoSearchUrl: v("Bingo Bango Bongo volleyball game")
    },
    {
      id: "first-ball-kill-game",
      name: "First Ball Kill Game",
      skill: "Hitting",
      value: 4,
      ageMin: 15, ageMax: 18,
      difficulty: 4,
      minPlayers: 10,
      durationMin: 10,
      isStaple: false,
      isGame: true,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "The full team in serve-receive on one side, servers on the other. Built to reward putting the first ball away off a pass — the way real points are won — not winning long scrambles.",
      steps: [
        "Server serves; the receiving team runs a pass-set-hit.",
        "Play stops the moment the receiving team gets its swing, even if it's dug.",
        "Score the receiving team only for a first-ball kill, giving them three straight tries before flipping sides.",
        "Total kills per side after each round."
      ],
      cues: [
        "Pass to run the offense, not just to keep it alive.",
        "Hitters — swing to terminate now.",
        "Best pass earns the best set."
      ],
      easier: "Start from a coach free ball or down ball instead of a tough serve.",
      harder: "Require a 70% sideout rate across the round to win, or only count kills against a real block.",
      videoSearchUrl: v("First Ball Kill drill volleyball")
    },
    {
      id: "sideout-percentage-gauntlet",
      name: "Sideout Percentage Gauntlet",
      skill: "Passing",
      value: 4,
      ageMin: 15, ageMax: 18,
      difficulty: 4,
      minPlayers: 8,
      durationMin: 12,
      isStaple: false,
      isGame: true,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "The receiving team in its full serve-receive formation; servers on the other side serving tough. You track sideout success as a percentage across a rotation, not single highlight passes.",
      steps: [
        "Serve a fixed block of balls (say 10) into each rotation and count the sideouts.",
        "The team must hit a target rate (around 60–70%) to advance to the next rotation.",
        "Miss the target and they repeat that rotation.",
        "Rotate through all six and total the score."
      ],
      cues: [
        "Perfect pass first, then attack.",
        "Own your seam and your call.",
        "Every rotation earns its way out."
      ],
      easier: "Lower the target rate, or count any in-system pass as a success.",
      harder: "Raise the target to 80% and require a kill — not just a ball over — to count.",
      videoSearchUrl: v("sideout percentage serve receive drill")
    }

  ];

  RR.drills = (RR.drills || []).concat(more);
})(window.RR);
