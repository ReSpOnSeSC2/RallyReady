// coaching.js — coaching guidance DATA + the Tips screen (RR.coaching).
//
// Everything a youth coach needs alongside the generated practices:
//   • tips       — practical, scannable best-practice guidance (incl. running a camp)
//   • byAge      — what to expect / emphasise at each of the five age bands
//   • reference  — REAL net height + ball per age band (keyed by the EXACT age
//                  strings RR.team uses, so RR.team.referenceFor() consumes it)
//   • terms      — a plain-English glossary of common volleyball terminology
//   • equipment  — the gear the drill library actually calls for, grouped
//
// Guidance follows USA Volleyball's youth ("FUNdamentals first") philosophy and
// age-appropriate equipment standards. The Tips screen (renderTips) uses only
// SEMANTIC tokens, so it reads correctly in BOTH light and dark themes; its
// disclosures are real <button>s (keyboard-operable, :focus-visible).
window.RR = window.RR || {};

RR.coaching = (function () {
  "use strict";

  // ======================================================================= //
  //  DATA — practical coaching tips                                         //
  //  Each: { title, icon, points:[...] }. `icon` keys into ICONS below.     //
  // ======================================================================= //
  var tips = [
    {
      title: "Run a great practice",
      icon: "practice",
      points: [
        "Run practice in clear blocks — warm-up, a couple of skill blocks, a game, then a cool-down — and keep each one moving so the energy never dips and nobody stands around waiting.",
        "Maximise contacts — more balls, smaller groups, short lines. Every player should be touching the ball constantly, never waiting in a line of eight.",
        "Keep instructions under 30 seconds, then play. Show the skill instead of lecturing about it.",
        "Use game-like reps: have players read a real ball over the net rather than a perfect toss, so what they practise transfers to matches.",
        "Give every drill a goal or score (\"first to 10 good passes\") so it has a purpose and a finish line.",
        "Build routines players can start on their own — the same warm-up each day — so practice begins the moment they arrive."
      ]
    },
    {
      // Written for a coach who learned and played the game in Romania and is now
      // coaching in the US — what actually differs, beyond the language.
      title: "US vs. Romania: what's different",
      icon: "usro",
      points: [
        "Measurements: back home everything is metric — the women's net is 2.24 m, the court is 9×18 m. Here you'll see feet and inches instead: 2.00 m ≈ 6'6\", 2.13 m ≈ 7'0\", and the full 2.24 m ≈ 7'4⅛\". Same game, different ruler.",
        "The words change too: net = fileu, pass/dig = preluare, set = ridicare, setter = ridicător, hitter = atacant, block = blocaj, and the positions are extremă, central, opus and libero. The \"Volleyball terms\" section below maps Romanian to English both ways.",
        "Fun comes first here. US youth coaching follows \"athletes first, winning second\" and \"the game teaches the game\" — lots of small-sided games and ball contacts, where the Romanian school you grew up in usually leads with technique and disciplined repetition. Both work; this app leans games-first, so trust the play.",
        "Feedback is relentlessly positive. The US norm is to praise something specific (\"great platform angle\"), say what TO do, and catch players being right — gentler than the blunt, correction-first style that's common back home. Be warm and save the tough love.",
        "Practice is game-like, not lines. Expect random, slightly messy, over-the-net reps with a real ball and a score, rather than long blocked drills and conditioning laps. Short lines, many balls, everyone busy.",
        "The coach–player relationship is more formal. US coaches keep a clear professional distance and don't socialise with players; in Romania the bond is often warmer and more personal. Stay friendly but keep boundaries — especially with other people's kids.",
        "Parents are very involved. American club culture runs on parent volunteers — carpool, snacks, scorekeeping — and parents watching from the sideline, probably more than you're used to. Set expectations early, use a 24-hour rule for hot topics, and give each parent a job.",
        "The pathway is different. Many US kids chase a college scholarship, so they play school ball in the fall and club (\"travel\") ball in winter and spring, plus summer camps — instead of one year-round club like the European system. Real selection comes later; the early years lean toward including everyone.",
        "Rules can differ by league. US club (USA Volleyball) is basically FIVB, like home, but US high-school (NFHS) rules vary — substitution counts, when the libero can serve, let serves, and some net and line calls. Always confirm the net height and rules with your specific league.",
        "Age groups are named differently. Here teams are grouped like 12-and-under or by the bands in this app (8–10, 11–12, …), not the minivolei / speranțe / cadeți / juniori categories of the Romanian federation. Pick the band that matches your players.",
        "Keep what made you good. That technical, hard-working Romanian foundation is an asset — blend your eye for clean technique with the American fun-and-games energy and you'll give these kids the best of both worlds."
      ]
    },
    {
      title: "Teach the six core skills",
      icon: "skills",
      points: [
        "Serving: build a calm, repeatable toss and a full arm swing; let the youngest players step in or serve underhand until the ball clears the net, then move them back as they get stronger.",
        "Passing (forearm): flat platform, angle the arms toward the target, and move the feet to get behind the ball — pass with the legs, not by swinging the arms.",
        "Setting: receive the ball high on the forehead with a relaxed triangle of the hands, then push through the legs and extend to the target; teach hand-setting early so it feels natural by the older ages.",
        "Hitting: drill the approach footwork first (left-right-left for a righty), then add the arm — high contact, snap the wrist, and swing aggressively even when it misses.",
        "Blocking: press the hands over the net, watch the hitter rather than the ball, and land balanced on two feet without touching the net.",
        "Digging & defense: stay low in a ready stance, get the platform to the ball, and angle it back toward the middle of the court instead of swinging at it.",
        "Teach skills in the order of a rally — serve, pass, set, hit — and connect them so players feel how each contact sets up the next."
      ]
    },
    {
      title: "How to talk to players",
      icon: "talk",
      points: [
        "Be specific with praise: \"great platform angle\" beats \"good job\" because the player knows exactly what to repeat.",
        "Coach the next rep, not the last mistake — say what TO do (\"reach high\") instead of what not to do.",
        "Learn every name in the first week and use names constantly; it tells each kid they matter.",
        "Get down on their level, make eye contact, and keep your tone calm and positive even when correcting.",
        "Ask questions (\"where were your eyes?\") so players learn to self-correct instead of waiting for you.",
        "One cue at a time. Pick the single most important fix and let the rest go for now."
      ]
    },
    {
      title: "Handle mistakes & build confidence",
      icon: "confidence",
      points: [
        "Treat errors as normal and necessary — players who never miss aren't being challenged. Aggressive errors are fine; tentative ones aren't.",
        "Praise brave attempts and effort (\"great aggressive swing\") even when the result misses.",
        "Keep a short memory: reset after every rally and never pile on after a mistake.",
        "Give every player a role they can succeed at, then stretch it — success is what builds real confidence.",
        "Celebrate small wins loudly: a first overhand serve in, a first clean set, so progress feels visible.",
        "Teach teammates to encourage each other; a team that high-fives after errors plays looser and better."
      ]
    },
    {
      title: "Develop the mental game",
      icon: "mental",
      points: [
        "Teach a short reset routine — a breath, a bounce of the ball, a cue word — so players recover fast after a mistake instead of carrying it to the next rally.",
        "Build pre-serve and pre-play routines so focus has an on-switch when the pressure rises.",
        "Praise effort and process over the result so players stay brave and keep swinging when the game is on the line.",
        "Normalise nerves: tell players the butterflies just mean they care, and channel that energy into a confident first play.",
        "Set process goals players actually control — a solid platform, a loud call, a hard swing — rather than only watching the scoreboard.",
        "Grow leaders by handing players ownership: let them lead a warm-up, call a play, or be the one who picks teammates up."
      ]
    },
    {
      title: "Keep order & energy",
      icon: "energy",
      points: [
        "Set a \"balls down, eyes up\" signal so you can get quiet attention in seconds.",
        "Have the next drill set up before the current one ends — transitions are where energy and control leak away.",
        "Use stations and short rotations so nobody waits; idle players get bored and disruptive.",
        "Bring high energy yourself: teams mirror the coach, so move, clap, and use your voice.",
        "Agree on 2–3 simple rules on day one (hustle, respect, effort) and hold everyone to them fairly.",
        "Count transitions down (\"five… four…\") to keep practice crisp and on schedule."
      ]
    },
    {
      title: "Keep it FUN",
      icon: "fun",
      points: [
        "Win players over with fun first — kids who enjoy practice come back and try harder. Treat fun as part of the learning, not a reward for getting through the drills.",
        "Finish every session with a favourite game so they leave wanting more.",
        "Add light competition and a scoreboard; small stakes make ordinary drills exciting.",
        "Mix volleyball-themed tag and relay games into warm-ups, especially with younger players.",
        "Let players choose a game sometimes — and play along with them yourself.",
        "Laugh, celebrate, and keep the energy up; a smiling gym is a learning gym."
      ]
    },
    {
      title: "Coach on game & match day",
      icon: "gameday",
      points: [
        "Set the lineup and walk players through the rotation before the first whistle so everyone knows where they start and where they go.",
        "Keep the bench engaged — rotate substitutes in, give them something to watch on the other team, and keep the cheering loud and positive.",
        "Use timeouts to settle nerves or stop the other team's run: one calm, clear message, then send them back out.",
        "Coach between rallies, not during them — once the ball is live, let players play and trust their training.",
        "Track a few simple things (missed serves, who's scoring, their best hitter) and adjust calmly at the next break.",
        "Win or lose, finish with one sincere, specific highlight from the match so players leave proud of something real."
      ]
    },
    {
      title: "Plan your season",
      icon: "season",
      points: [
        "Start with 2–3 clear season goals (everyone serves overhand, the team runs a real three-contact offense) and point every practice at them.",
        "Build skills before systems — spend the early weeks on individual technique, then layer in rotations, plays, and strategy.",
        "Map the season in phases: teach and build early, sharpen and compete through the middle, then lighten the load to peak for the matches that matter most.",
        "Reassess every few weeks; if a skill isn't sticking, give it more time rather than rushing ahead to the next thing.",
        "Keep the days before a big match or tournament light, fun, and confidence-building — never introduce brand-new material then.",
        "Keep brief notes on what worked so next season starts from experience instead of a blank page."
      ]
    },
    {
      title: "Run tryouts & build your team",
      icon: "tryouts",
      points: [
        "Decide what you're looking for before tryouts — athleticism, coachability, attitude — and put every player through the same simple stations.",
        "Watch movement and effort, not just polished skill; raw athletes and great attitudes often outgrow the already-developed-but-stagnant.",
        "Keep it organised and humane: name tags, clear stations, and a friendly tone so nervous kids can show their best.",
        "Deliver results kindly and privately, and give every cut player one concrete thing to work on and a path back.",
        "At the youngest ages, lean toward inclusion over selection — development matters far more than a perfect roster.",
        "Once the team is set, define roles early so every player knows exactly how they help the team win."
      ]
    },
    {
      title: "Include every player",
      icon: "include",
      points: [
        "Differentiate inside a drill: offer an easier and a harder version of the same task so beginners and standouts are both challenged.",
        "Be intentional and fair about playing time, especially in the development years — kids improve by playing, not by watching.",
        "Pair stronger and developing players so they lift each other instead of splitting the gym into tiers.",
        "Find a meaningful role for everyone; a confident server or a steady passer wins matches just as surely as a big hitter.",
        "Watch the quiet kids — make sure they get reps, touches, and your attention, not just the loud or the talented.",
        "Celebrate each player's progress against their own starting point, not against the best athlete in the gym."
      ]
    },
    {
      title: "Build athletes & prevent injury",
      icon: "athlete",
      points: [
        "Keep conditioning age-appropriate: for younger kids, athleticism comes from games, tag, and movement — not laps or heavy lifting.",
        "Add real strength and jump training only as players mature, and always with good technique and recovery built in.",
        "Protect the volleyball overuse spots — shoulders and knees — by varying reps, building load gradually, and resting sore arms.",
        "Teach landing mechanics (soft knees, land on two feet) early; it's the simplest way to cut ankle and knee injuries.",
        "Fuel and rest matter: encourage water, real food, and sleep, and remind players that recovery is when they actually get stronger.",
        "Bookend every session the same way — warm up to raise the heart rate, cool down to bring it back — so it becomes automatic."
      ]
    },
    {
      title: "Safety",
      icon: "safety",
      points: [
        "Always warm up (light cardio + dynamic stretches) before any jumping or hitting, and cool down afterwards.",
        "Check the space: clear stray balls off the court between reps, secure standards and antennas, pad the posts, and watch for wet spots.",
        "Teach players to call the ball and stay in their zone so they don't collide chasing the same ball.",
        "Hydrate often with scheduled water breaks — more in heat — and watch for overuse, especially shoulders and knees.",
        "Know your emergency plan: a charged phone, a stocked first-aid kit, and where to get help. Keep a brief injury note.",
        "Match net height and ball to the age band so kids aren't straining to play (see your age card above)."
      ]
    },
    {
      title: "Know the rules & work with officials",
      icon: "rules",
      points: [
        "Know the basics cold: three contacts per side, rotate clockwise on a side-out, and no carries, double-hits, or touching the net.",
        "Teach players the rotation and overlap rules so they don't give away free points by lining up illegally at serve.",
        "Learn the faults that bite at your level — foot faults on the serve, back-row attack and antenna rules — and drill them until they're automatic.",
        "Model respect for officials: questions go through the captain or coach, calmly, and never argue a judgment call mid-rally.",
        "Confirm your league's specific rules — net height, substitution limits, let serves, libero rules — because they vary by age and association.",
        "Scrimmage with real calls in practice so players absorb the rules by playing rather than from a lecture."
      ]
    },
    {
      title: "Talk to parents",
      icon: "parents",
      points: [
        "Set expectations early: share your schedule, goals, and how you'll communicate at a short start-of-season meeting.",
        "Be positive and specific about their child, and lead with something the kid is doing well.",
        "Use the \"24-hour rule\" for heated topics — the simplest tool for keeping parent conversations sane. The rule: nothing about playing time, a tough loss, or a bad call gets hashed out in the raw minutes right after a match, when emotions run hottest and no one wins the sideline argument. Instead, ask upset parents to sleep on it and reach out the next day to set up a calm chat. Overnight the small stuff tends to evaporate, and the concerns that still matter in the morning get the level-headed conversation they deserve. Spell it out at your first parent meeting so the door always feels open — just not at 9 p.m. courtside.",
        "Give parents a simple job: cheer effort, get players to practice on time, and reinforce a growth mindset at home.",
        "Be clear and consistent about playing time and roles so there are no surprises.",
        "Recruit volunteers for scorekeeping, snacks, and setup — involved parents become your best support."
      ]
    },
    {
      // Camp-specific guidance. renderTips() surfaces this FIRST when the team's
      // programType === "camp"; otherwise it stays at the end of the list.
      title: "Running a camp",
      icon: "camp",
      points: [
        "Bring high energy and tight structure from minute one — a camp lives or dies on its pace.",
        "Theme each day (Serving Day, Defense Day, Game Day) so it's memorable and easy to talk about.",
        "Use short rotations and stations so big, mixed-age groups always have a ball in hand and never wait their turn.",
        "Open each day with names and a quick hook; close it with a game and a high-five tunnel.",
        "Build toward a final-day mini-tournament with simple awards so camp ends on its highest note.",
        "Plan two sessions a day — AM technical, PM games — with regular water and shade breaks.",
        "Keep every instruction under 30 seconds, then play. Campers came to touch the ball, not to listen."
      ]
    }
  ];

  // ======================================================================= //
  //  DATA — what to expect at each age band                                 //
  //  Keyed by the EXACT age strings from RR.team.AGE_GROUPS. 4–6 concrete   //
  //  sentences each: attention span, what to emphasise, how to modify, tone.//
  // ======================================================================= //
  var byAge = {
    "8-10 (FUNdamentals)":
      "Attention spans are short, so change activities every 3–5 minutes and keep talking to a sentence or two. " +
      "Emphasise fun, basic ball control, and a high number of touches far above winning — this is the FUNdamentals stage where learning to love the game matters most. " +
      "Modify everything down: a low net (~6'6\" or less), a light foam or Volley-Lite ball, smaller courts, and catch-and-throw before true passing. " +
      "Lean on simple games, playful names, and constant encouragement, and celebrate effort loudly. " +
      "Expect wobble and a little chaos — that's completely normal — and keep your tone warm, playful, and patient.",
    "11-12 (Foundations)":
      "Players can now focus for longer stretches (about 5–10 minutes per activity) and follow two- and three-step drills. " +
      "Build real foundations: forearm passing, overhand serving, basic setting, and the idea of three contacts per side. " +
      "Use a 7-foot net and a lightweight official-size ball so technique can develop without strain. " +
      "Introduce light competition and keep groups small for maximum reps. " +
      "Be positive and specific — they can act on a clear cue, but it still needs to feel like fun.",
    "13-14 (Developing)":
      "Players can handle longer, more complex sessions and begin to specialise. " +
      "Emphasise connecting skills — serve receive to set to attack — and introduce positions, rotations, and basic systems. " +
      "Move to a regulation net (7'4⅛\") and a standard ball. " +
      "Push intensity and accountability while staying encouraging; bodies are changing fast, so watch for growth-related soreness and temporary dips in coordination. " +
      "Your tone can be more direct and challenging, but keep it supportive — confidence is fragile at this age.",
    "15-16 (Competitive)":
      "Attention and stamina now support full-length, game-speed practices. " +
      "Emphasise competitive systems, faster tempo, specialised roles, and reading the game tactically. " +
      "Net and ball are full regulation. " +
      "Hold a high standard, give honest feedback, and let players take ownership of warm-ups and goals. " +
      "Strike the tone of a serious-but-positive coach — they respond to being treated like real competitors and to clear, fair expectations.",
    "17-18 (Advanced)":
      "These are mature athletes who can focus deeply and largely self-manage. " +
      "Emphasise refinement, advanced tactics, situational play, and mental skills like pre-serve routines and composure under pressure. " +
      "Use full regulation equipment and game-realistic, high-intensity reps. " +
      "Coach them as near-adults: explain the \"why,\" involve them in strategy, and prepare them for the next level. " +
      "Keep the tone respectful and collaborative — and remember they still play their best when they're enjoying it."
  };

  // ======================================================================= //
  //  DATA — age-band equipment reference (REAL values)                      //
  //  Object keyed by the EXACT age strings, each { net, ball }. This is the //
  //  shape RR.team.referenceFor() reads; once present it replaces the team  //
  //  module's built-in fallback. Heights/weights verified vs USA Volleyball //
  //  age-appropriate standards (girls'/women's progression).                //
  // ======================================================================= //
  var reference = {
    "8-10 (FUNdamentals)": { net: "6'6\" (2.00 m)",  ball: "Lightweight foam / youth ball" },
    "11-12 (Foundations)": { net: "7'0\" (2.13 m)",  ball: "Lightweight Volley-Lite (~25% lighter)" },
    "13-14 (Developing)":  { net: "7'4⅛\" (2.24 m)", ball: "Standard official indoor ball" },
    "15-16 (Competitive)": { net: "7'4⅛\" (2.24 m)", ball: "Official indoor ball" },
    "17-18 (Advanced)":    { net: "7'4⅛\" (2.24 m)", ball: "Official indoor ball" }
  };
  // One-line caveat shown beneath the reference. Net heights follow the girls'/
  // women's progression; the youngest groups sometimes drop lower, and boys'/
  // men's nets rise at the older ages — so leagues vary.
  var referenceNote =
    "Heights follow USA Volleyball's girls'/women's progression; the youngest groups sometimes use a lower 5–6 ft net, and boys'/men's nets are higher at older ages. Always confirm the exact net height with your league.";

  // ======================================================================= //
  //  DATA — glossary of common volleyball terminology                       //
  //  { term, def }. Plain-English, one sentence each.                       //
  // ======================================================================= //
  // Two blocks: general play/skill/rule terms (alphabetical), then the player
  // positions grouped together at the end. Plain-English, one sentence each.
  var terms = [
    { term: "Ace", def: "A serve that scores directly — it lands in untouched, or the receiver can't keep it in play." },
    { term: "Antenna", def: "The vertical rod on each side of the net marking the legal width of play; the ball must cross between the antennas." },
    { term: "Approach", def: "The footwork an attacker uses to jump and hit — most often a three-step \"left-right-left\" (for a right-hander)." },
    { term: "Assist", def: "The pass or set to the teammate who then scores the kill; usually credited to the setter." },
    { term: "Attack (spike / hit)", def: "Sending the ball forcefully into the opponent's court to try to score." },
    { term: "Attack line (10-foot / 3 m line)", def: "The line three metres from the net; a back-row player must take off from behind it to attack a ball that's above net height." },
    { term: "Back-row attack", def: "A spike launched by a back-row player who jumps from behind the attack line." },
    { term: "Block", def: "Jumping at the net with hands pressed over it to stop or slow an opponent's attack." },
    { term: "Campfire", def: "When the ball drops to the floor between several players who all stop and watch it, as if gathered around a fire." },
    { term: "Carry (lift)", def: "An illegal contact where the ball comes to rest in or is thrown by the hands rather than cleanly hit." },
    { term: "Cross-court attack", def: "A spike hit diagonally across the court — the longest, most common attacking angle." },
    { term: "Cut shot", def: "A sharp cross-court attack hit at an extreme angle, close to the net." },
    { term: "Dig", def: "A defensive forearm save of a hard-driven attack that keeps the ball off the floor." },
    { term: "Dink (tip)", def: "A soft one-handed attack placed into open space instead of a hard swing." },
    { term: "Double hit", def: "An illegal contact where the ball touches a player twice in a row (except off a hard first ball or a block)." },
    { term: "Down ball", def: "An attack a hitter swings from the ground without jumping — easier for the defense to read and dig." },
    { term: "Dump", def: "A surprise attack by the setter, who tips the ball over on the second contact instead of setting it." },
    { term: "Float serve", def: "A serve hit flat with no spin so the ball wavers unpredictably in the air." },
    { term: "Foot fault", def: "Stepping on or over the end line (or into the court) while serving — it loses the point." },
    { term: "Free ball", def: "An easy, non-attacking return from the opponent that lets your team set up its offense." },
    { term: "Husband-and-wife play", def: "When the ball lands between two players who each assumed the other would take it — a communication breakdown." },
    { term: "Joust", def: "When two opposing players contact the ball at the same time above the net." },
    { term: "Jump serve", def: "A serve hit with a full hitting approach and jump for extra power and a steeper angle." },
    { term: "Kill", def: "An attack that directly ends the rally for a point." },
    { term: "Kong", def: "A one-handed block, named after King Kong swatting at the ball." },
    { term: "Line shot", def: "An attack hit straight down the sideline, parallel to it." },
    { term: "Net violation", def: "Touching the net while making a play on the ball, which loses the point." },
    { term: "Off-speed shot", def: "A softer, controlled attack placed into open court to catch a defense leaning for a hard swing." },
    { term: "Offensive systems (5-1, 6-2, 4-2)", def: "Shorthand for how many hitters and setters are on court — a 5-1 runs one setter all the way around, a 6-2 uses two setters who switch out to attack." },
    { term: "Overpass", def: "A pass that accidentally carries over the net, handing the other team an easy attack." },
    { term: "Pancake", def: "A last-ditch save where a player slides a flat hand under the ball so it bounces off the back of the hand." },
    { term: "Pass (bump / forearm pass)", def: "The first contact, played off the forearm platform to control a serve or attack." },
    { term: "Pepper", def: "A two-player warm-up of pass, set, and hit back and forth to groove ball control." },
    { term: "Pipe", def: "A back-row attack hit from the middle of the court (zone 6)." },
    { term: "Platform", def: "The flat surface made by joining the forearms together for passing." },
    { term: "Quick set (quick attack)", def: "A low, fast set to a middle hitter who is already in the air, designed to beat the block." },
    { term: "Rally scoring", def: "The scoring system where a point is won on every rally, no matter which team served." },
    { term: "Ready position", def: "The low, balanced athletic stance — knees bent, weight forward — players hold before every contact." },
    { term: "Roll shot", def: "A soft attack lofted with topspin up and over the block and down into the court." },
    { term: "Roof (stuff)", def: "A dominant block that sends the attack straight back down to the floor." },
    { term: "Rotation", def: "The clockwise shift of players through the six court positions each time the team wins back the serve." },
    { term: "Seam", def: "The gap between two defenders or two blockers that attackers aim to exploit." },
    { term: "Serve receive", def: "The system and skill of passing the opponent's serve accurately to the setter." },
    { term: "Set", def: "An overhead contact (usually the second) that places the ball for a hitter to attack." },
    { term: "Shank", def: "A badly misjudged pass that shoots off at a wild angle, out of the setter's reach." },
    { term: "Side-out", def: "Winning the rally — and the serve — when the other team was serving." },
    { term: "Six-pack (facial)", def: "Slang for getting hit in the face or head by an attacked ball." },
    { term: "Slide", def: "A quick attack where a middle hitter takes off from one foot while running along the net, like a layup." },
    { term: "Tandem (combination play)", def: "A designed play where two hitters attack close together to confuse and split the block." },
    { term: "Tempo", def: "How fast a set reaches the hitter — a 1st-tempo set is quick and flat, a 3rd-tempo set is high and slow." },
    { term: "Tool (wipe)", def: "Deliberately hitting the ball off the blockers' hands so it deflects out of bounds for a point." },
    { term: "Touch", def: "A slight contact a blocker gets on the ball; it still counts as one of that team's three hits." },
    { term: "Transition", def: "Switching from defense to offense (or back) within a rally — for example, blocking, then pulling off the net to hit." },
    { term: "Setter", def: "The \"quarterback\" who runs the offense and delivers sets to the attackers." },
    { term: "Outside hitter (OH / pin)", def: "The left-front attacker who usually takes the most swings on the team." },
    { term: "Opposite (right-side)", def: "The attacker and blocker on the right front, positioned opposite the setter in the rotation." },
    { term: "Middle blocker (MB)", def: "The front-row center player who blocks across the net and hits quick attacks." },
    { term: "Libero", def: "A back-row defensive specialist in a contrasting jersey who subs freely but can't attack above net height or block." },
    { term: "Defensive specialist (DS)", def: "A back-row substitute brought in to pass and play defense." },
    { term: "Serving specialist", def: "A substitute sent in just to serve a strong or strategic serve, then rotated back out." }
  ];

  // ======================================================================= //
  //  DATA — equipment for the drills                                        //
  //  Grouped into must-haves and station/training extras. Every item is     //
  //  actually used by drills in the RR.drills library (plus core safety &   //
  //  game-management gear).                                                 //
  // ======================================================================= //
  var equipment = [
    {
      group: "Always bring these",
      items: [
        { name: "Volleyballs", note: "One per 1–2 players (a dozen or more). Light foam/Volley-Lite for younger ages, regulation for older. The most-used item in nearly every drill." },
        { name: "Net & standards", note: "Set to the age-appropriate height and pad the posts — needed for serving, hitting, blocking, and all game play." },
        { name: "Antennas", note: "Mark the legal width of play on the net so game-like reps and scrimmages stay realistic." },
        { name: "Ball cart or bag", note: "Keeps balls within reach so you can feed reps quickly and reset between rounds." },
        { name: "Cones / floor markers", note: "Define targets, zones, lines, and station boundaries in seconds." },
        { name: "Whistle", note: "Start and stop drills and games crisply and get attention fast." },
        { name: "Pinnies / scrimmage vests", note: "Split teams clearly for games, stations, and scrimmages." },
        { name: "Water & first-aid kit", note: "Scheduled hydration plus quick response to bumps and scrapes — your safety basics." }
      ]
    },
    {
      group: "Great extras for stations & training",
      items: [
        { name: "Agility ladder", note: "Footwork patterns and warm-up speed work." },
        { name: "Jump ropes", note: "Warm-up cardio and rhythm/coordination." },
        { name: "Resistance / mini bands", note: "Shoulder and hip activation in warm-ups and injury prevention." },
        { name: "Medicine ball", note: "Power and core work for older players." },
        { name: "Reaction ball", note: "Reflex and read-and-react defense training." },
        { name: "Hoops / targets", note: "Aiming targets that sharpen serving and passing accuracy." },
        { name: "Foam roller", note: "Cool-down and recovery." },
        { name: "Plyo boxes / steps", note: "Approach and jump-training stations for older ages." },
        { name: "Tumbling mats", note: "Cushion diving and sprawling defense work so players learn it safely." },
        { name: "A wall", note: "A free \"partner\" for solo passing, setting, and serving reps." }
      ]
    }
  ];

  // ======================================================================= //
  //  ICONS — small decorative line glyphs for each tip section (aria-hidden)//
  // ======================================================================= //
  var ICONS = {
    practice:   "<rect x='5' y='4' width='14' height='17' rx='2'/><path d='M9 4h6v3H9z'/><path d='M8.5 12.5l2 2 4-4'/>",
    talk:       "<path d='M21 6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3v4l4-4h7a2 2 0 0 0 2-2z'/>",
    confidence: "<path d='M12 3l2.3 5 5.2.5-3.9 3.5 1.2 5.2L12 19.8 7.2 22.7l1.2-5.2L4.5 8.5 9.7 8z'/>",
    energy:     "<path d='M13 2 4 14h6l-1 8 9-12h-6z'/>",
    fun:        "<circle cx='12' cy='12' r='9'/><path d='M8 14s1.5 2 4 2 4-2 4-2'/><path d='M9 9h.01M15 9h.01'/>",
    safety:     "<path d='M12 3l7 3v5c0 4.6-3.1 7.6-7 9-3.9-1.4-7-4.4-7-9V6z'/><path d='M9 12l2 2 4-4'/>",
    parents:    "<circle cx='9' cy='8' r='3'/><path d='M4 19c0-3 2.2-5 5-5s5 2 5 5'/><path d='M16 6a3 3 0 0 1 0 6'/><path d='M17.5 14.2c2 .5 3.5 2.3 3.5 4.8'/>",
    camp:       "<circle cx='12' cy='12' r='4.5'/><path d='M12 2v2.5M12 19.5V22M4 12H2M22 12h-2M5 5l1.6 1.6M17.4 17.4 19 19M19 5l-1.6 1.6M6.6 17.4 5 19'/>",
    skills:     "<circle cx='12' cy='12' r='9'/><path d='M3 12h18'/><path d='M12 3c2.8 2.6 2.8 15.4 0 18'/><path d='M12 3c-2.8 2.6-2.8 15.4 0 18'/>",
    mental:     "<path d='M9 18h6M10 21h4'/><path d='M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.3 1 2.5h6c0-1.2.4-1.9 1-2.5A6 6 0 0 0 12 3z'/>",
    gameday:    "<rect x='3' y='4' width='18' height='16' rx='2'/><path d='M12 4v16M3 12h18'/><circle cx='12' cy='12' r='2'/>",
    season:     "<rect x='3' y='5' width='18' height='16' rx='2'/><path d='M3 9h18M8 3v4M16 3v4'/><path d='M8 13h2M14 13h2M8 17h2'/>",
    tryouts:    "<rect x='5' y='4' width='14' height='17' rx='2'/><path d='M9 4h6v3H9z'/><path d='M8.5 12l1.5 1.5L13 10.5'/><path d='M15 16H9'/>",
    include:    "<circle cx='9' cy='9' r='2.5'/><circle cx='16.5' cy='10' r='2'/><path d='M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5'/><path d='M15 14c2.5 0 4.5 2 4.5 4.5'/>",
    athlete:    "<path d='M3 12h4l2-5 4 11 2-6h6'/>",
    rules:      "<path d='M5 3v18'/><path d='M5 4h12l-2.5 3.5L17 11H5'/>",
    usro:       "<path d='M3 9h15l-3-3'/><path d='M21 15H6l3 3'/>",
    terms:      "<path d='M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z'/><path d='M9 8h6M9 12h5'/>",
    equip:      "<path d='M3 8l9-4 9 4-9 4-9-4z'/><path d='M3 8v8l9 4 9-4V8'/><path d='M12 12v8'/>"
  };

  // ======================================================================= //
  //  Tiny DOM helpers (mirrors team.js / season.js; RR.ui arrives Prompt 8) //
  // ======================================================================= //
  function h(tag, props, kids) {
    var node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v == null || v === false) return;
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else if (k === "html") node.innerHTML = v;
        else if (k.slice(0, 2) === "on" && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
        else node.setAttribute(k, v === true ? "" : v);
      });
    }
    append(node, kids);
    return node;
  }
  function append(node, kids) {
    if (kids == null) return;
    if (Array.isArray(kids)) kids.forEach(function (k) { append(node, k); });
    else if (kids instanceof Node) node.appendChild(kids);
    else node.appendChild(document.createTextNode(String(kids)));
  }

  // Unique ids so each disclosure button can point at its panel (aria-controls).
  var panelSeq = 0;
  function nextId() { return "tips-panel-" + (++panelSeq); }

  function iconSvg(key) {
    return "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' " +
           "stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>" + (ICONS[key] || "") + "</svg>";
  }
  function chevronSvg() {
    return "<svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' " +
           "stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>";
  }

  // ======================================================================= //
  //  Disclosure card — a real <button> header + collapsible panel.          //
  //  Keyboard-operable for free (it's a button), focus ring via             //
  //  :focus-visible, and aria-expanded/aria-controls wired for screen       //
  //  readers. Never nests a card inside a card — the panel is a plain div.  //
  // ======================================================================= //
  function discloseCard(title, iconKey, panelContent, open) {
    var pid = nextId();
    var toggle = h("button", {
      type: "button", class: "tip__toggle", "aria-expanded": open ? "true" : "false", "aria-controls": pid
    }, [
      h("span", { class: "tip__icon", "aria-hidden": "true", html: iconSvg(iconKey) }),
      h("span", { class: "tip__title", text: title }),
      h("span", { class: "tip__chev" + (open ? " is-open" : ""), "aria-hidden": "true", html: chevronSvg() })
    ]);
    var panel = h("div", { class: "tip__panel", id: pid }, [panelContent]);
    if (!open) panel.hidden = true;

    toggle.addEventListener("click", function () {
      var nowOpen = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", nowOpen ? "true" : "false");
      panel.hidden = !nowOpen;
      toggle.querySelector(".tip__chev").classList.toggle("is-open", nowOpen);
    });

    return h("section", { class: "card tip" }, [toggle, panel]);
  }

  // Panel bodies ---------------------------------------------------------------
  function buildPoints(points) {
    return h("ul", { class: "tip__points" },
      points.map(function (p) { return h("li", { text: p }); }));
  }

  // A full tip panel: the written guidance ("tell") followed by the visuals
  // ("show") — an animated motion diagram and/or a row of "See it in action"
  // video links. Visuals come from RR.tipsVisuals and degrade gracefully: if the
  // module is unavailable, the panel is just the points (exactly as before).
  function buildTipPanel(tip) {
    var kids = [buildPoints(tip.points)];
    var tv = RR.tipsVisuals;
    if (tv) {
      // The six-skills tip gets its animated grid; other tips get a hero diagram.
      if (tip.icon === "skills" && tv.skillGrid) {
        kids.push(tv.skillGrid());
      } else if (tv.heroFor) {
        var hero = tv.heroFor(tip.icon);
        if (hero) kids.push(hero);
      }
      // A compact "See it in action" link row (the six-skills tip carries its
      // own per-skill links, so it skips the general row to stay uncluttered).
      if (tip.icon !== "skills" && tv.videoRow) {
        var vids = tv.videoRow(tip.icon);
        if (vids) kids.push(vids);
      }
    }
    return h("div", { class: "tip__body" }, kids);
  }

  function buildTerms() {
    var dl = h("dl", { class: "terms" });
    terms.forEach(function (t) {
      dl.appendChild(h("dt", { text: t.term }));
      dl.appendChild(h("dd", { text: t.def }));
    });
    return dl;
  }

  function buildEquipment() {
    return h("div", {}, equipment.map(function (grp) {
      return h("div", { class: "equip-group" }, [
        h("span", { class: "eyebrow", text: grp.group }),
        h("ul", { class: "equip-list" }, grp.items.map(function (it) {
          return h("li", {}, [h("strong", { text: it.name }), " — " + it.note]);
        }))
      ]);
    }));
  }

  // ======================================================================= //
  //  Top card — age-band guidance + net/ball reference                      //
  // ======================================================================= //
  function refItems(band) {
    var ref = (RR.team && RR.team.referenceFor) ? RR.team.referenceFor(band) : reference[band] || { net: "—", ball: "—" };
    return h("div", { class: "summary-grid" }, [
      summaryItem("Net height", ref.net, true),
      summaryItem("Ball", ref.ball, true)
    ]);
  }
  function summaryItem(label, value, accent) {
    return h("div", { class: "summary-item" + (accent ? " summary-item--accent" : "") }, [
      h("span", { class: "summary-item__label", text: label }),
      h("span", { class: "summary-item__value", text: value })
    ]);
  }

  // Team set up -> show THEIR age band's guidance + reference.
  function buildAgeCard(team) {
    var band = team.ageGroup;
    var guidance = byAge[band] || "Set your team's age group to see tailored guidance.";
    return h("section", { class: "card" }, [
      h("div", { class: "card-head" }, [
        h("h2", { text: "For your age group" }),
        h("span", { class: "pill", text: band })
      ]),
      h("p", { class: "age-guide__text", text: guidance }),
      refItems(band),
      h("p", { class: "muted ref-note", text: referenceNote })
    ]);
  }

  // No team yet -> still useful: the full net/ball table for every band, plus a
  // gentle nudge to set up the team for age-specific coaching notes.
  function buildAllBandsCard() {
    var order = (RR.team && RR.team.AGE_GROUPS) || Object.keys(reference);
    var rows = h("div", { class: "ref-rows" }, order.map(function (band) {
      var r = reference[band] || { net: "—", ball: "—" };
      return h("div", { class: "ref-row" }, [
        h("span", { class: "ref-row__band", text: band }),
        h("span", { class: "ref-row__spec", text: r.net + " · " + r.ball })
      ]);
    }));
    return h("section", { class: "card" }, [
      h("h2", { text: "Net height & ball by age" }),
      h("p", { class: "muted", text: "Set up your team to get age-specific coaching notes here." }),
      rows,
      h("p", { class: "muted ref-note", text: referenceNote }),
      h("a", { class: "btn btn-primary tips-setup-link", href: "#team", text: "Set up your team" })
    ]);
  }

  // ======================================================================= //
  //  Entry point — renderTips(host)                                         //
  // ======================================================================= //
  // Camp teams see the "Running a camp" section first; everyone else keeps the
  // natural order (it stays available at the end).
  function orderedTips(team) {
    if (team && team.programType === "camp") {
      var camp = null, rest = [];
      tips.forEach(function (t) { if (t.icon === "camp") camp = t; else rest.push(t); });
      return camp ? [camp].concat(rest) : tips.slice();
    }
    return tips.slice();
  }

  // A card that points coaches to the per-position guides + recommended drills.
  function buildPositionCard() {
    return h("section", { class: "card tips-poscard" }, [
      h("div", { class: "card-head" }, [
        h("h2", { text: "Coach by position" }),
        h("span", { class: "pill", text: "6 roles" })
      ]),
      h("p", { class: "age-guide__text",
        text: "How to coach setters, hitters, middles, liberos and more — responsibilities, cues, common mistakes, rotation basics, and drills pulled from the library for each role." }),
      h("a", { class: "btn btn-primary tips-setup-link", href: "#positions", text: "Open position coaching" })
    ]);
  }

  function renderTips(host) {
    var team = (RR.state && RR.state.getState().team) || null;
    var setUp = !!(RR.team && RR.team.isSetUp && RR.team.isSetUp(team));

    host.appendChild(h("p", { class: "screen-sub tips-intro",
      text: "Real, practical coaching help — tuned to your team's age and program." }));

    // Top: age guidance + reference (or the all-bands table until a team exists).
    host.appendChild(setUp ? buildAgeCard(team) : buildAllBandsCard());

    // Position coaching entry point (the guides + recommended drills live on their
    // own screen, reached here and from the Players tab).
    host.appendChild(buildPositionCard());

    // The tips accordion. Open the first card so the screen never reads as a
    // wall of closed bars; for camps that first card is "Running a camp".
    orderedTips(team).forEach(function (t, i) {
      host.appendChild(discloseCard(t.title, t.icon, buildTipPanel(t), i === 0));
    });

    // Reference sections, collapsed by default to keep the page scannable.
    host.appendChild(discloseCard("Volleyball terms, explained", "terms", buildTerms(), false));
    // Romanian <-> English terms (for a coach who learned the game in Romania).
    if (RR.terms && RR.terms.content) {
      host.appendChild(discloseCard("Romanian ↔ English terms", "usro", RR.terms.content(), false));
    }
    host.appendChild(discloseCard("Gear & equipment for drills", "equip", buildEquipment(), false));
  }

  // ---- Public API ------------------------------------------------------------
  return {
    tips: tips,
    byAge: byAge,
    reference: reference,
    referenceNote: referenceNote,
    terms: terms,
    equipment: equipment,
    renderTips: renderTips,
    render: renderTips   // alias used by the router
  };
})();
