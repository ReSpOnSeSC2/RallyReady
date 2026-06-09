// feed-data.js — curated content for the Ideas feed (Part 1).
//
// PURE DATA. Calls RR.feed.add({...}) to concatenate onto RR.feed.data, the same
// way coaching-tips-*.js extend RR.coaching via addTips(). Split into feed-data-2
// etc. if this nears the ~800-line house limit; the composer scales automatically.
//
// Authoring rules (enforced by scripts/verify-feed.js):
//   • every block.drillId and theme.sampleDrillIds[] must exist in RR.drills;
//   • every tipRef must resolve via RR.coaching.tipById();
//   • ids are unique across ALL feed items (and across drills/tips);
//   • vibe ∈ fun | skill-builder | quick | game-day;
//   • an idea's blocks should overlap its [ageMin, ageMax] band.
(function () {
  "use strict";
  if (!window.RR || !RR.feed || !RR.feed.add) return;

  RR.feed.add({
    // ================================================================== //
    //  IDEAS — share/print-friendly mini practice-flows                  //
    // ================================================================== //
    ideas: [
      {
        id: "idea-serve-receive-starter",
        type: "idea",
        title: "Serve & receive starter",
        theme: "Serving",
        skill: "Serving",
        vibe: "skill-builder",
        ageMin: 11, ageMax: 14,
        minutes: 30,
        goal: "Put the ball in play with a confident overhand serve, then turn the return into a clean pass to target.",
        tipRef: "serve-with-purpose",
        blocks: [
          { role: "Warm-up", minutes: 8, drillId: "partner-pass-and-move-warmup" },
          { role: "Serve", minutes: 12, drillId: "standing-float-serve-progression" },
          { role: "Play it", minutes: 10, drillId: "serve-and-pass-crossover" }
        ]
      },
      {
        id: "idea-first-touch-fundamentals",
        type: "idea",
        title: "First-touch fundamentals",
        theme: "Passing",
        skill: "Passing",
        vibe: "skill-builder",
        ageMin: 8, ageMax: 12,
        minutes: 26,
        goal: "Build a flat, steady platform and pass the ball to a target every time.",
        tipRef: "teach-the-six-core-skills",
        blocks: [
          { role: "Warm-up", minutes: 8, drillId: "self-toss-ball-handling" },
          { role: "Pass", minutes: 8, drillId: "toss-and-pass-intro" },
          { role: "Game", minutes: 10, drillId: "passing-21-circle" }
        ]
      },
      {
        id: "idea-setters-connection",
        type: "idea",
        title: "The setter's connection",
        theme: "Setting",
        skill: "Setting",
        vibe: "skill-builder",
        ageMin: 12, ageMax: 16,
        minutes: 34,
        goal: "Move to the ball, square to the target, and deliver a hittable set on a consistent rhythm.",
        tipRef: "teach-so-it-sticks",
        blocks: [
          { role: "Warm-up", minutes: 8, drillId: "partner-pass-and-move-warmup" },
          { role: "Hands", minutes: 8, drillId: "partner-setting" },
          { role: "Footwork", minutes: 10, drillId: "setter-footwork-to-target" },
          { role: "Flow", minutes: 8, drillId: "setter-triangle-continuous" }
        ]
      },
      {
        id: "idea-friday-game-day",
        type: "idea",
        title: "Friday game day",
        theme: "Game day",
        skill: "Team Play",
        vibe: "game-day",
        ageMin: 12, ageMax: 18,
        minutes: 36,
        goal: "End the week with maximum competitive reps in a fast, fun court game everyone loves.",
        tipRef: "keep-it-fun",
        blocks: [
          { role: "Warm-up", minutes: 10, drillId: "dynamic-movement-warmup" },
          { role: "Compete", minutes: 20, drillId: "queen-of-the-court" },
          { role: "Cool-down", minutes: 6, drillId: "team-circle-recovery" }
        ]
      },
      {
        id: "idea-defense-scramble",
        type: "idea",
        title: "Defense scramble session",
        theme: "Defense",
        skill: "Defense",
        vibe: "skill-builder",
        ageMin: 10, ageMax: 16,
        minutes: 30,
        goal: "Stay low, read the hitter, and turn a hard dig into a playable ball toward the middle.",
        tipRef: "team-defense",
        blocks: [
          { role: "Warm-up", minutes: 6, drillId: "mirror-defensive-shuffle" },
          { role: "React", minutes: 10, drillId: "close-range-reaction-digging" },
          { role: "Dig to target", minutes: 14, drillId: "dig-to-target" }
        ]
      },
      {
        id: "idea-hitting-power-hour",
        type: "idea",
        title: "Hitting power hour",
        theme: "Hitting",
        skill: "Hitting",
        vibe: "skill-builder",
        ageMin: 12, ageMax: 18,
        minutes: 30,
        goal: "Time a full approach and swing high and aggressively through the ball.",
        tipRef: "build-power",
        blocks: [
          { role: "Warm-up", minutes: 10, drillId: "approach-jump-landing" },
          { role: "Footwork", minutes: 8, drillId: "spike-approach-footwork" },
          { role: "Swing", minutes: 12, drillId: "hitting-lines" }
        ]
      },
      {
        id: "idea-camp-fun-blast",
        type: "idea",
        title: "Camp-day fun blast",
        theme: "Fun",
        skill: "Team Play",
        vibe: "fun",
        ageMin: 8, ageMax: 14,
        minutes: 28,
        goal: "Keep the whole group laughing and moving with two high-energy, low-setup games.",
        tipRef: "keep-it-fun",
        blocks: [
          { role: "Warm-up", minutes: 6, drillId: "animal-movement-warmup" },
          { role: "Game", minutes: 10, drillId: "hot-potato-ball-control" },
          { role: "Game", minutes: 12, drillId: "newcomb-catch-volley" }
        ]
      },
      {
        id: "idea-quick-sharpener",
        type: "idea",
        title: "15-minute quick sharpener",
        theme: "Quick",
        skill: "Ball Control",
        vibe: "quick",
        ageMin: 10, ageMax: 18,
        minutes: 15,
        goal: "Short on gym time? Groove ball control with a fast warm-up and a round of pepper.",
        tipRef: "run-a-great-practice",
        blocks: [
          { role: "Warm-up", minutes: 5, drillId: "partner-pass-and-move-warmup" },
          { role: "Control", minutes: 10, drillId: "pepper" }
        ]
      }
    ],

    // ================================================================== //
    //  CHALLENGES — punchy, do-it-today dares                            //
    // ================================================================== //
    challenges: [
      {
        id: "ch-serve-streak-10",
        type: "challenge",
        title: "10 serves in a row",
        body: "Can your server land 10 serves in a row? One miss and the count starts over. Post the team record and chase it every week.",
        skill: "Serving",
        vibe: "fun",
        ageMin: 10, ageMax: 18
      },
      {
        id: "ch-keep-it-off-the-floor",
        type: "challenge",
        title: "Keep it off the floor",
        body: "Set a 90-second timer. The team rallies a free ball back and forth — every time it touches the floor, the clock resets. How long can you go clean?",
        skill: "Ball Control",
        vibe: "fun",
        ageMin: 8, ageMax: 14
      },
      {
        id: "ch-bullseye-passing",
        type: "challenge",
        title: "Bullseye passing",
        body: "Drop a hoop or towel where the setter stands. A pass scores only if it lands on the target. First group to 15 wins.",
        skill: "Passing",
        vibe: "skill-builder",
        ageMin: 10, ageMax: 16
      },
      {
        id: "ch-silent-court",
        type: "challenge",
        title: "The silent game",
        body: "Play a short rally game where the only words allowed are calls — \"mine,\" \"help,\" \"out.\" It forces real, loud communication fast.",
        skill: "Team Play",
        vibe: "game-day",
        ageMin: 12, ageMax: 18
      },
      {
        id: "ch-perfect-toss",
        type: "challenge",
        title: "Perfect-toss test",
        body: "Two minutes of serving where the toss has to be picture-perfect — catch any toss that isn't, instead of serving it. The toss is half the serve.",
        skill: "Serving",
        vibe: "quick",
        ageMin: 11, ageMax: 18
      },
      {
        id: "ch-beat-the-coach",
        type: "challenge",
        title: "Beat the coach",
        body: "You stand across the net and tip balls into the gaps. Defenders earn a point for every ball they keep alive; you score when it drops. Race to 10.",
        skill: "Defense",
        vibe: "fun",
        ageMin: 10, ageMax: 18
      },
      {
        id: "ch-three-touches-or-bust",
        type: "challenge",
        title: "Three touches or bust",
        body: "In a mini-game, a side only scores when it uses all three contacts — pass, set, hit. It rewires a team to stop sending free balls over on one touch.",
        skill: "Team Play",
        vibe: "game-day",
        ageMin: 12, ageMax: 18
      },
      {
        id: "ch-name-that-cue",
        type: "challenge",
        title: "Name that cue",
        body: "Quick-fire: show a skill and ask players for the single cue that matters most. A two-minute brain warm-up that gets them coaching themselves.",
        vibe: "quick",
        ageMin: 11, ageMax: 18
      }
    ],

    // ================================================================== //
    //  MINDSET — short coaching-philosophy nuggets                       //
    // ================================================================== //
    mindset: [
      {
        id: "mind-next-ball",
        type: "mindset",
        title: "Play the next ball",
        body: "The best players have a short memory. Teach a one-breath reset: shake out the last mistake, find the next ball. Confidence is a skill you rehearse.",
        tipRef: "develop-the-mental-game",
        ageMin: 10, ageMax: 18
      },
      {
        id: "mind-aggressive-errors",
        type: "mindset",
        title: "Aggressive errors are okay",
        body: "A tentative miss is the problem; a brave one isn't. Praise the full swing and the bold serve even when they sail long — fear is what you're really coaching out.",
        tipRef: "handle-mistakes-build-confidence",
        ageMin: 10, ageMax: 18
      },
      {
        id: "mind-catch-them-right",
        type: "mindset",
        title: "Catch them being right",
        body: "Use names and praise something specific — \"great platform, Maya.\" Specific praise tells a player exactly what to repeat, and it spreads through the gym.",
        tipRef: "how-to-talk-to-players",
        ageMin: 8, ageMax: 18
      },
      {
        id: "mind-process-goals",
        type: "mindset",
        title: "Goals you can control",
        body: "Scoreboard goals breed nerves. Set process goals — a loud call, a high contact, a solid platform — that a player owns no matter what the other team does.",
        tipRef: "set-goals-that-work",
        ageMin: 12, ageMax: 18
      },
      {
        id: "mind-fun-is-the-point",
        type: "mindset",
        title: "Fun is not a reward",
        body: "Kids who enjoy practice come back and try harder. Treat fun as part of the learning, not the prize for surviving the drills.",
        tipRef: "keep-it-fun",
        ageMin: 8, ageMax: 14
      },
      {
        id: "mind-one-cue",
        type: "mindset",
        title: "One cue at a time",
        body: "When everything looks broken, fix one thing. Pick the single most important cue, let the rest go for now, and watch the player actually change.",
        tipRef: "how-to-talk-to-players",
        ageMin: 8, ageMax: 18
      },
      {
        id: "mind-pre-serve-breath",
        type: "mindset",
        title: "The pre-serve breath",
        body: "Build a tiny ritual before every serve — a bounce, a breath, a target. Routines give focus an on-switch when the pressure rises.",
        tipRef: "composure-under-pressure",
        ageMin: 12, ageMax: 18
      },
      {
        id: "mind-mirror-the-coach",
        type: "mindset",
        title: "Teams mirror the coach",
        body: "Your energy sets the room. Move, clap, use your voice — a gym full of life learns faster than a quiet one. Bring it before you ask for it.",
        tipRef: "keep-order-energy",
        ageMin: 8, ageMax: 18
      }
    ],

    // ================================================================== //
    //  THEMES — tap a collection to filter the feed                      //
    // ================================================================== //
    themes: [
      {
        id: "theme-serving",
        type: "theme",
        title: "Serving clinic",
        blurb: "From a first underhand serve to a jump float — build a weapon at the line.",
        filter: { skill: "Serving" },
        sampleDrillIds: ["underhand-serve-progression", "standing-float-serve-progression", "serving-ladder-game", "jump-float-serve"]
      },
      {
        id: "theme-ball-control",
        type: "theme",
        title: "Ball control everything",
        blurb: "Pepper, partner control and rally games that grow soft, accurate hands.",
        filter: { skill: "Ball Control" },
        sampleDrillIds: ["pepper", "wall-forearm-passing", "three-contact-partner-pepper"]
      },
      {
        id: "theme-defense",
        type: "theme",
        title: "Dig everything",
        blurb: "Reads, pursuit and floor defense — coach a team that refuses to let it drop.",
        filter: { skill: "Defense" },
        sampleDrillIds: ["close-range-reaction-digging", "dig-to-target", "pursuit-emergency-defense"]
      },
      {
        id: "theme-games",
        type: "theme",
        title: "Just play",
        blurb: "Small-sided, competitive games — the fastest way to make practice feel like a match.",
        filter: { vibe: "game-day" },
        sampleDrillIds: ["queen-of-the-court", "one-v-one-short-court", "three-v-three-mini-game", "speedball"]
      },
      {
        id: "theme-fun",
        type: "theme",
        title: "Pure fun",
        blurb: "Laugh-out-loud warm-ups and games for the youngest players and the end of a long week.",
        filter: { vibe: "fun" },
        sampleDrillIds: ["animal-movement-warmup", "hot-potato-ball-control", "newcomb-catch-volley", "four-square-volleyball"]
      },
      {
        id: "theme-quick",
        type: "theme",
        title: "Short on time",
        blurb: "Five- to ten-minute blocks to drop in when gym time is tight.",
        filter: { vibe: "quick" },
        sampleDrillIds: ["bodyweight-shoulder-activation", "self-pass-count", "serving-toss-consistency"]
      },
      {
        id: "theme-setting",
        type: "theme",
        title: "Setter school",
        blurb: "Footwork, hands and decisions for the player who runs your offense.",
        filter: { skill: "Setting" },
        sampleDrillIds: ["partner-setting", "setter-footwork-to-target", "back-setting", "setter-live-read-options"]
      },
      {
        id: "theme-hitting",
        type: "theme",
        title: "Swing big",
        blurb: "Approach, timing and shot selection — turn a swing into a kill.",
        filter: { skill: "Hitting" },
        sampleDrillIds: ["spike-approach-footwork", "hitting-lines", "hitting-off-a-live-set", "hitting-shot-selection"]
      }
    ]
  });
})();
