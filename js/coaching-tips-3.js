// coaching-tips-3.js — expanded coaching library, part 2 (RR.coaching.addTips).
//
// The physical side (training, health, injury prevention), game-day decisions,
// volleyball tactics & team systems, and the coach's own development — same
// coach-to-coach voice as coaching.js, grounded in widely accepted youth-sport
// guidance (long-term athletic development, land-on-two-feet mechanics, the
// 4-2 / 6-2 / 5-1 progression, SafeSport-style safeguarding). Loaded after
// coaching.js and coaching-tips-2.js.
window.RR = window.RR || {};

(function () {
  "use strict";
  if (!RR.coaching || !RR.coaching.addTips) return;

  RR.coaching.addTips([
    // ============ BODIES — TRAINING, HEALTH & SAFETY =====================
    {
      id: "movement-prep", title: "Warm up the right way", icon: "strength", category: "bodies",
      points: [
        "Start every practice with movement, not stretching cold: a light jog, skips, shuffles, and arm circles to raise the heart rate and wake the joints.",
        "Make it dynamic and volleyball-shaped — lunges, high knees, shoulder swings, and a few easy approach jumps before any hard hitting.",
        "Save the long, held stretches for the cool-down; before play, moving stretches prepare muscles far better than standing still.",
        "Add two minutes of band work for the shoulders and hips — cheap activation that pays off in fewer tweaks.",
        "Build the same routine every day so players can start it themselves the moment they arrive.",
        "Spend 8–10 minutes on it; a proper warm-up is one of the cheapest, most proven ways to cut injuries."
      ]
    },
    {
      id: "build-power", title: "Build power & jump higher", icon: "jump", category: "bodies",
      points: [
        "For the younger ones, build athleticism through games and movement first — tag, hops, and skips do more than any weight room.",
        "Add real strength and jump training as players move into the teens, always with good technique and a coach watching.",
        "Train the landing as much as the jump — power that goes up has to come down safely.",
        "Use bodyweight and light plyometrics — squats, hops, box step-ups — well before heavy lifting; the foundation matters more than the load.",
        "Progress slowly. Height comes from consistent, gradual work, not one brutal session that leaves them sore for a week.",
        "Treat rest as part of training: muscles get stronger between sessions, not during them, so build in recovery days."
      ]
    },
    {
      id: "land-soft", title: "Land soft, save knees & ankles", icon: "jump", category: "bodies",
      points: [
        "Teach the landing as carefully as the jump: bend the knees, land on two feet, soft and balanced. Most ankle and knee injuries come from bad landings.",
        "Cue knees over toes, not caving inward — knees collapsing in is the classic setup for an ACL injury, and girls are at higher risk.",
        "Drill takeoff and landing on two feet at the net; one-foot landings and stepping on a teammate's foot are the top causes of rolled ankles.",
        "Add simple balance and 'hop-and-stick' drills — landing control is a skill you can train, and the training works.",
        "Watch fatigue: tired legs land sloppily, so cut jump reps the moment form falls apart.",
        "Shoes with good grip — and an ankle brace for any player with a history of sprains — are cheap insurance."
      ]
    },
    {
      id: "protect-shoulders", title: "Protect young shoulders", icon: "athlete", category: "bodies",
      points: [
        "Volleyball arms take thousands of swings — vary the load and rest sore shoulders before soreness becomes injury.",
        "Build the small stabilizing muscles with light band work for the rotator cuff and upper back, a couple of times a week.",
        "Coach a full, smooth swing rather than a tense, all-arm one; clean technique spreads the load off the shoulder.",
        "Cap big hitting and serving days, especially for players who also play club and school ball in the same stretch.",
        "Take arm pain seriously — soreness that lingers or changes a kid's motion means rest now, and a check-up if it sticks around.",
        "Strengthen the whole chain: legs and core power a healthy swing, so the shoulder isn't doing the job alone."
      ]
    },
    {
      id: "recovery-sleep-fuel", title: "Recovery, sleep & fuel", icon: "recovery", category: "bodies",
      points: [
        "Tell players straight: they get stronger when they rest, not when they grind. Recovery is training, not time off.",
        "Push sleep as the number-one performance booster — eight or nine hours does more than any drill.",
        "Water before, during, and after; even mild dehydration drops focus and legs, and you need more in heat.",
        "Real food beats energy drinks — a balanced meal and a simple snack after hard sessions refuels the tank.",
        "Build in rest days and lighter weeks; non-stop training leads to burnout and overuse, not breakthroughs.",
        "Watch the warning signs of too much — cranky, exhausted, nagging aches, dreading practice — and back off before it becomes an injury."
      ]
    },
    {
      id: "play-many-sports", title: "Play more than one sport", icon: "growth", category: "bodies",
      points: [
        "Encourage young players to play other sports, not just volleyball — the all-round athlete usually wins out long-term.",
        "Hold off on year-round, single-sport specializing until at least the mid-teens; specializing early raises overuse injuries and burnout without getting them ahead.",
        "Different sports build different movements — basketball jumping, soccer footwork — that quietly make a better volleyball player.",
        "Variety keeps the love alive; the kids who only ever do one thing are the ones who quit it.",
        "Reassure ambitious parents: most college athletes played several sports as children. Broad first, specialized later, is the proven path.",
        "Through the early years, chase general athleticism and fun over squeezing out one more specialist rep."
      ]
    },
    {
      id: "spot-concussions-heat", title: "Spot concussions, heat & overuse", icon: "safety", category: "bodies",
      points: [
        "Know the head-injury rule: when in doubt, sit them out. A suspected concussion comes out and does not return until cleared by a professional — never the same day.",
        "Watch for concussion signs after a ball or collision to the head: dazed, headache, dizzy, queasy, 'not right.' Ask parents to keep an eye out at home.",
        "Beat the heat — schedule water breaks, find shade, and ease off in high heat and humidity. Cramps or dizziness mean stop now.",
        "Catch overuse early: a player favoring a shoulder or knee, or quietly playing through pain, needs rest, not a tougher talk.",
        "Keep the basics ready: a charged phone, a stocked first-aid kit, ice, and a simple plan for who calls whom in an emergency.",
        "Log injuries briefly and follow up; a small note now spots a pattern before it sidelines a player for the season."
      ]
    },

    // ===================== GAME DAY & COMPETITION ========================
    {
      id: "read-and-adjust", title: "Read the game & adjust", icon: "scout", category: "gameday",
      points: [
        "Track a few simple things, not everything: missed serves, who's scoring for them, where the free balls go. Two or three numbers beat a blur.",
        "Find their best hitter and their weakest passer, then serve the passer and put a wall up for the hitter.",
        "Make calm, small adjustments at the break — one change players can actually execute beats five they can't.",
        "Watch your own rotations: where do you keep leaking points? Fix the leaky rotation, not the whole lineup.",
        "Trust what you see over what you planned; the game in front of you is the real information.",
        "Coach between rallies, not during them — once the ball's live, let them play and read it for themselves."
      ]
    },
    {
      id: "manage-the-bench", title: "Manage the bench & subs", icon: "include", category: "gameday",
      points: [
        "Keep the bench in the game: give subs something to watch (\"track their setter\"), keep them cheering, keep them ready.",
        "Plan subs ahead — know your serving sub and your defensive sub before the moment, so you're not scrambling.",
        "Be honest and consistent about playing time, especially in the development years; kids improve by playing, and they always know when it's unfair.",
        "Use a sub to stop a run or settle a shaky server — a fresh, calm player can swing a rotation.",
        "Tell players what they're going in to do (\"big serve, then we sub back\") so they enter with a job, not nerves.",
        "Warm subs up before they go in; cold players make cold mistakes."
      ]
    },
    {
      id: "timeouts-momentum", title: "Use timeouts to swing momentum", icon: "energy", category: "gameday",
      points: [
        "Call the timeout early in the other team's run — at two or three straight points, not after they've ripped off six.",
        "Lead with calm, not a lecture: settle the breathing, then give one clear instruction. Panic in, panic out.",
        "Pick a single message — \"tougher serve,\" \"talk on defense\" — and make sure they leave the huddle knowing it.",
        "Use a timeout to ice a hot server on the other side, or to give your own kids a breath after a long rally.",
        "Read the room: sometimes the team needs a fix, sometimes just a joke and a reset. Coach the mood, not only the X's and O's.",
        "Keep one in your pocket for the end — a late timeout to set up a serve-receive or a play is worth saving."
      ]
    },
    {
      id: "pre-match-routine", title: "A pre-match routine that calms nerves", icon: "breathe", category: "gameday",
      points: [
        "Run the same warm-up every game so the body knows it's go-time and nerves have something familiar to hold onto.",
        "Walk through the starting lineup and first rotation before the whistle so nobody's guessing where they stand.",
        "Give the team one simple focus for the match — \"serve tough, talk loud\" — instead of a head full of instructions.",
        "Keep your pre-game words short, warm, and confident; long speeches just tighten kids up.",
        "Add a breath and a quick visualization in the huddle — ten seconds of 'seeing' a good first serve settles the group.",
        "End the warm-up on a high, makeable note — easy serves in, a fun cheer — so they walk on believing."
      ]
    },

    // ===================== TACTICS & TEAM SYSTEMS ========================
    {
      id: "pick-an-offense", title: "Pick an offense: 4-2, 6-2 or 5-1", icon: "court", category: "tactics",
      points: [
        "Start beginners in a 4-2: two setters opposite each other, always setting from the front row. It keeps positions simple and cuts the running and confusion.",
        "Step up to a 6-2 when they're ready — two setters who set from the back row, so you always have three front-row hitters. More attack options, more switching to teach.",
        "Move to a 5-1 as they mature: one setter all the way around. It runs a consistent, real offense, but it leans on one reliable setter.",
        "Match the system to your players, not the other way round — the best system is the one your team can run cleanly.",
        "Teach the switches (setter and hitters moving to their spots after the serve) before you add plays; clean positioning first.",
        "Don't rush it. A tidy 4-2 beats a chaotic 5-1 every time at the younger ages."
      ]
    },
    {
      id: "serve-receive", title: "Serve receive & passing lanes", icon: "court", category: "tactics",
      points: [
        "Pass to a target, not just up: aim every serve-receive at the setter's spot, about a step off the net at right-front.",
        "Give each passer a clear zone, and a simple rule for the seams — the player it's closest to calls it and takes it.",
        "Talk before the serve: who's passing, who's covering short, who's got the deep ball. Quiet teams shank serves.",
        "Start with three passers in a simple cup, then shrink the group as they grow; don't bury beginners under a five-person system.",
        "Hide your weakest passer when you can and let your best passers cover more court — points are won and lost on first contact.",
        "Drill it against real serves, not soft tosses; players have to read a live ball to get good at receiving one."
      ]
    },
    {
      id: "team-defense", title: "Team defense basics", icon: "court", category: "tactics",
      points: [
        "Get everyone low and in a ready stance before contact — defense is played from the floor up, not standing tall.",
        "Teach players to stop, balance, and read the hitter's arm just before the swing; moving feet can't dig.",
        "Assign the floor: who takes tips, who covers the line, who's deep cross-court. Gaps get exploited; coverage wins rallies.",
        "Angle the platform back toward the middle of the court so a dig stays playable instead of flying away.",
        "Pair the block and the back row — defenders cover the holes the block leaves, not the ball the block already has.",
        "Start simple — perimeter defense, players ringing the court — before fancier rotations. Basics dug consistently beat clever systems played late."
      ]
    },
    {
      id: "serve-with-purpose", title: "Serve with a purpose", icon: "goal", category: "tactics",
      points: [
        "First rule: get it in. A serve in play makes the other team earn the point; a missed serve just hands it over.",
        "Once it's reliable, aim it — deep corners, the seam between two passers, or straight at their weakest receiver.",
        "Serve the spots that hurt: at the setter to take away their offense, or short to drag a deep passer in.",
        "Mix speed and depth so receivers can't groove a rhythm; a tough, smart serve is a free weapon.",
        "Toss the same way every time — a calm, consistent toss is most of a consistent serve.",
        "Track serving as a team stat; raising your serve-in percentage often wins more matches than any fancy play."
      ]
    },
    {
      id: "transition", title: "Transition: defense to offense", icon: "court", category: "tactics",
      points: [
        "Teach the move off the net: block or defend, then pull back and get ready to approach — the rally isn't over when you dig it.",
        "Drill 'dig-to-kill' so players expect to attack the ball they just saved, not admire it.",
        "Get the setter to the target fast on every play; quick, balanced setting turns a scramble into offense.",
        "On a free ball, call it loud and move everyone into attack — easy balls are scoring chances, not breathers.",
        "Keep hitters off the net until the ball's passed, so they have room to approach and swing instead of jamming.",
        "Practice the messy transition reps, not just clean offense; matches are won in the chaos between contacts."
      ]
    },
    {
      id: "blocking-reads", title: "Block & read the hitter", icon: "skills", category: "tactics",
      points: [
        "Watch the hitter, not the ball — the approach and the arm tell you where it's going long before it's hit.",
        "Press the hands over the net and forward, fingers spread, and land on two balanced feet without touching the net.",
        "Take away one thing on purpose — the line or the angle — and trust your defense to cover the rest.",
        "Time the jump to the hitter's, not the set; jumping with the ball usually means jumping late.",
        "Teach footwork to the ball first (shuffle or crossover to get square) so the block is in position, not reaching.",
        "For younger players, a solid, safe block that just slows the ball for the diggers beats a risky one that touches the net."
      ]
    },

    // ========================= YOU, THE COACH ============================
    {
      id: "keep-improving", title: "Keep getting better", icon: "reflect", category: "coach",
      points: [
        "Take two minutes after practice to jot what worked and what flopped; next session starts from experience, not a blank page.",
        "Find a mentor — a veteran coach you can text questions and watch run a gym. Borrowed wisdom saves you years.",
        "Watch other coaches and steal shamelessly: a drill, a phrase, a way of settling a group.",
        "Keep learning the game — a clinic, a coaching course, a few good videos a month sharpen your eye.",
        "Ask your players now and then what's helping and what isn't; they'll tell you the truth if you actually listen.",
        "Be the growth mindset you preach: you'll have rough practices, and 'that didn't work yet' applies to coaches too."
      ]
    },
    {
      id: "coach-wellbeing", title: "Coach your own wellbeing", icon: "wellbeing", category: "coach",
      points: [
        "You can't pour from an empty cup — a frazzled, exhausted coach makes a frazzled practice. Mind your own tank.",
        "Prep enough to feel ready, but don't chase perfect; a simple plan run with energy beats a flawless one run on fumes.",
        "Lean on your assistants and parent helpers — hand off the cones, the snacks, the scorebook, and protect your focus for coaching.",
        "Keep perspective on the losses. It's youth sport; a rough match isn't a referendum on you.",
        "Make room for a life outside the gym; the season is a marathon, and rested coaches last the distance.",
        "Notice your own warning signs — dreading practice, a short fuse — and take a breather before burnout makes the choice for you."
      ]
    },
    {
      id: "safesport-basics", title: "Keep kids safe: SafeSport basics", icon: "safety", category: "coach",
      points: [
        "Follow the rule that protects everyone: avoid being one-on-one and out of sight with a player — keep interactions observable and in the open.",
        "Stay reachable but appropriate: keep communication on team channels, loop in parents, and skip private messages with kids.",
        "Complete any background check and SafeSport-style training your club or league requires; it's the floor, not a hassle.",
        "Build a culture where bullying and hazing are a hard no, and players know they can speak up to you safely.",
        "Know how to report a concern and act on it — protecting a child always comes before protecting an adult or a program.",
        "Keep the gym physically and emotionally safe: clear the hazards, respect boundaries, and never use shame as a coaching tool."
      ]
    },
    {
      id: "inclusive-coaching", title: "Coach everyone", icon: "include", category: "coach",
      points: [
        "Meet players where they are: adapt a drill — lower net, lighter ball, a buddy to help — so a player with different needs still belongs and improves.",
        "Give clear, simple instructions and show as well as tell; it helps the kid who learns differently, and everyone else too.",
        "Make the team genuinely welcoming across abilities, backgrounds, and body types — belonging is what keeps kids in sport.",
        "Find every player a real role they can own; a confident server or steady passer matters as much as a big hitter.",
        "Watch your language: praise effort and character, and keep it free of put-downs about size, gender, or ability.",
        "Ask the player (and parents) what helps — they're the experts on what they need, and a quick chat beats a guess."
      ]
    },
    {
      id: "lead-assistants", title: "Lead your assistant coaches", icon: "leader", category: "coach",
      points: [
        "Give assistants real jobs, not just ball-shagging — a station to run, a skill to own — so the whole gym coaches, not just you.",
        "Get on the same page before practice: the plan, the focus, and the one or two cues you're all using, so players hear one voice.",
        "Let assistants play to their strengths — a great defensive mind runs defense; a calm presence handles the bench.",
        "Debrief briefly after sessions: what worked, what to tweak, who needs attention next time.",
        "Back each other in front of the team; disagree in private, present a united front in the gym.",
        "Grow them — hand over more as they're ready. Good assistants become good head coaches, and that's a win."
      ]
    },
    {
      id: "simple-stats", title: "Simple stats that actually help", icon: "scout", category: "coach",
      points: [
        "Track a few numbers that change decisions: serves in, serve-receive passing, and points won or lost per rotation. Skip the rest.",
        "Use tally marks, not a spreadsheet, mid-match — a parent or sub making marks tells you plenty.",
        "Let stats confirm or challenge your eyes, not replace them; the numbers point, your judgment decides.",
        "Share simple, positive stats with players — \"we passed 80% in set two\" — to make progress visible and motivating.",
        "Watch trends over weeks, not one bad night; a single match is noise, a month is signal.",
        "Keep it light at the younger ages — development and fun first, data second. The stat sheet should serve the kids, not run them."
      ]
    }
  ]);
})();
