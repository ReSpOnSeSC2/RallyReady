// drills-6.js — RallyReady drill library DATA (Part 6 of 9).
//
// PURE DATA ONLY. Conditioning, more passing/setting/serving/hitting/blocking/
// defense across ages, plus camp games. Plain coach English. Real, standard
// drills. CONCATENATES onto RR.drills. LINKS standard applies.
window.RR = window.RR || {};

(function (RR) {
  "use strict";

  var v = RR.drillVideoSearch || function (name) {
    return "https://www.youtube.com/results?search_query=" +
      encodeURIComponent("how to " + name + " volleyball");
  };

  var more = [

    // ===================== WARMUP =====================
    {
      id: "jump-rope-coordination",
      name: "Jump Rope Coordination",
      skill: "Warmup",
      ageMin: 8, ageMax: 18,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["jump ropes"],
      setup: "Players use jump ropes to warm up their calves and ankles and build the light, springy footwork volleyball needs. It's simple and works for the whole group at once.",
      steps: [
        "Start with steady two-foot bounces, staying light on the front of your feet.",
        "Switch to skipping foot to foot, then pick up the pace a little.",
        "Add short bursts of fast skipping, then go back to easy bounces to recover.",
        "Finish with a few single-leg sets on each foot to wake up your ankles."
      ],
      cues: [
        "Light on your toes. Quiet feet, soft knees.",
        "Turn the rope with your wrists, not big arm swings.",
        "Stay relaxed and find a steady rhythm."
      ],
      easier: "If a player can't jump rope yet, just have them copy the bounce footwork without the rope.",
      harder: "Add double-unders or speed intervals to build up the calves and quickness.",
      videoSearchUrl: v("Jump Rope Coordination")
    },
    {
      id: "quadrant-reaction-footwork",
      name: "Quadrant Reaction Footwork",
      skill: "Warmup",
      ageMin: 10, ageMax: 18,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["cones"],
      setup: "Four cones make a small box around the player. On a signal, they sprint or shuffle to the called corner and back. It sharpens reactions and the quick first step in every direction.",
      steps: [
        "Set four cones in a square a couple of steps around the player.",
        "The player starts low and centered in the box.",
        "A coach calls or points to a corner, and the player moves to touch it and comes back to the middle.",
        "Mix in forward sprints, backpedals, and side shuffles to the corners."
      ],
      cues: [
        "Stay low and centered, ready to go any direction.",
        "Push off hard, touch the cone, and get back to the middle.",
        "Face forward — shuffle and backpedal, don't just turn and run."
      ],
      easier: "Call the corners in a set order and slow it down so players learn the moves.",
      harder: "Call corners fast and random, or add a ball to catch after each corner touch.",
      videoSearchUrl: v("Quadrant Reaction Footwork")
    },

    // ===================== BALL CONTROL =====================
    {
      id: "toss-bump-catch-control",
      name: "Toss, Bump, Catch Control",
      skill: "Ball Control",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "A controlled, three-step rep for young players: toss the ball up, bump it to yourself, then catch it. Breaking it into pieces builds a clean platform before they try to rally.",
      steps: [
        "Toss the ball straight up to about head height.",
        "Bump it back up to yourself with steady arms.",
        "Catch the ball and reset, making a clean contact each time.",
        "Once it feels easy, skip the catch and bump to yourself non-stop."
      ],
      cues: [
        "Toss it straight up so you can stay under it.",
        "Straight arms, thumbs together. Hit it on your forearms.",
        "Bend your knees and lift the ball with your legs."
      ],
      easier: "Use a lighter or beach ball, and keep the catch in until your platform is steady.",
      harder: "Bump twice before catching, or take a step between contacts to add some footwork.",
      videoSearchUrl: v("Toss, Bump, Catch Control")
    },
    {
      id: "four-person-pepper",
      name: "Four-Person Pepper",
      skill: "Ball Control",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 4,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls"],
      setup: "A four-player control drill in a square. The ball moves dig-set-hit around the group, so more players stay busy than in regular two-person pepper. It builds control, talking, and awareness.",
      steps: [
        "Four players make a square, one with a ball.",
        "A player hits a controlled ball across the square to a digger.",
        "The digger digs to a third player, who sets the fourth player to hit again.",
        "Keep the dig-set-hit moving around the square, and count your clean cycles."
      ],
      cues: [
        "Call the name of who you're playing to before you touch the ball.",
        "Control over power so the square keeps flowing.",
        "Reset to ready the second you finish your touch."
      ],
      easier: "Let players catch on any miss and slow it down until the pattern is smooth.",
      harder: "Speed it up, require three touches each cycle, and add movement between contacts.",
      videoSearchUrl: v("Four-Person Pepper")
    },

    // ===================== PASSING =====================
    {
      id: "passing-on-the-move",
      name: "Passing on the Move",
      skill: "Passing",
      ageMin: 10, ageMax: 16,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "Passers learn to move sideways, stop, and pass, because serves almost never come right at you. A feeder tosses to one side, so the passer has to shuffle over and square up before they pass.",
      steps: [
        "A feeder tosses balls a few steps to the passer's left or right.",
        "The passer shuffles to get their body behind the ball and stops before they contact it.",
        "Pass the ball back to the feeder with square, still arms.",
        "Switch sides so the passer moves both directions."
      ],
      cues: [
        "Move your feet first, then pass from a stopped, balanced base.",
        "Get your whole body behind the ball, not just one arm.",
        "Square your arms to the target after you move."
      ],
      easier: "Toss closer and slower with smaller moves so the passer has success while learning to move.",
      harder: "Toss it wider, add a back-and-forth so the passer covers more ground, then pass to a target.",
      videoSearchUrl: v("Passing on the Move")
    },
    {
      id: "deep-ball-backpedal-passing",
      name: "Deep-Ball Backpedal Passing",
      skill: "Passing",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Passers work on dropping back for deep, hard serves — opening their hips, stepping back, and passing while they move away from the net. It's a skill a lot of players miss, and it turns deep serves from aces into easy points.",
      steps: [
        "A server or feeder sends deep balls over the passer's starting spot.",
        "The passer opens their hips, takes a drop step, and backpedals to get behind the ball.",
        "Pass with their arms angled up and toward the target while controlling their backward momentum.",
        "Reset to the start line and go again, with deep serves to both sides."
      ],
      cues: [
        "Open up and drop-step. Don't backpedal flat-footed.",
        "Get behind the ball and let your arms angle it up and forward.",
        "Control your momentum so the deep pass still goes to target."
      ],
      easier: "Toss the deep balls slower and shorter so the passer learns the drop step before the full depth.",
      harder: "Serve hard and deep to the corners so the passer has to cover real ground and still pass on target.",
      videoSearchUrl: v("Deep-Ball Backpedal Passing")
    },
    {
      id: "w-formation-serve-receive",
      name: "Five-Player W Serve Receive",
      skill: "Passing",
      ageMin: 13, ageMax: 18,
      difficulty: 4,
      minPlayers: 6,
      durationMin: 14,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "A full five-player 'W' serve-receive formation with the setter releasing to the net. It trains each player's passing job, the seams, and the talking — in the formation a lot of younger teams actually use.",
      steps: [
        "Put five passers in a W with the setter releasing to the right-front target.",
        "A server serves anywhere into the formation.",
        "Players call early. Whoever the ball is heading toward takes it, and the players next to them back up.",
        "Pass to the setter target, run a quick attack, and rotate the formation."
      ],
      cues: [
        "Everyone calls every serve. No quiet passers.",
        "Know your area and your seams with the players next to you.",
        "Pass it high to the target so the offense can run."
      ],
      easier: "Serve from inside the court and let the setter catch, so passers focus on the formation and the calls.",
      harder: "Add tough serves at the seams and require a team passing average before you rotate.",
      videoSearchUrl: v("Five-Player W Serve Receive")
    },

    // ===================== SETTING =====================
    {
      id: "one-knee-setting-form",
      name: "One-Knee Setting Form",
      skill: "Setting",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "wall"],
      setup: "Kneeling on one knee takes the legs out of it, so young players can focus only on clean setting hands. It's a simple way to groove the hand shape and the contact.",
      steps: [
        "Kneel on one knee a couple of feet from a wall, hands up in the setting window above your forehead.",
        "Set the ball softly to the wall and catch the rebound in the window.",
        "Repeat, keeping your elbows up and the ball touching your finger pads.",
        "Move on to setting the wall non-stop, then stand up and add your legs."
      ],
      cues: [
        "Hands above your forehead, fingers spread, looking through the window.",
        "Touch the ball with your finger pads, not your palms.",
        "Push the ball up and out evenly with both hands."
      ],
      easier: "Catch and push each ball, and use a lighter ball for small hands.",
      harder: "Set non-stop to the wall from your knee, then stand up and keep the same clean hands.",
      videoSearchUrl: v("One-Knee Setting Form")
    },
    {
      id: "setting-accuracy-hoops",
      name: "Setting to a Target",
      skill: "Setting",
      ageMin: 10, ageMax: 16,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "hoops"],
      setup: "Setters drop balls into hoops (or onto target spots) at the pin positions. It builds location and consistency, and players can see right away whether they hit it.",
      steps: [
        "Put a hoop or target at the outside pin and another at the right-side pin.",
        "A feeder tosses a pass to the setter, who sets to the called hoop.",
        "A set that lands in or over the hoop scores. Track makes by target.",
        "Rotate setters and compare how accurate they are to each pin."
      ],
      cues: [
        "Set to a high point above the target, not flat at it.",
        "Turn your hips to face the hoop before you set.",
        "Same height and speed every time so it's repeatable."
      ],
      easier: "Use big targets close to the setter and let them catch and set to groove the aim.",
      harder: "Make the targets smaller, add back sets to the right-side hoop, and feed off-target passes.",
      videoSearchUrl: v("Setting to a Target")
    },
    {
      id: "transition-setting-back-row",
      name: "Transition Setting from the Back Row",
      skill: "Setting",
      ageMin: 13, ageMax: 18,
      difficulty: 4,
      minPlayers: 3,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "The setter starts in a back-row defensive spot and has to sprint to the net to set after the first ball — which is their real job in a rally. It builds the release speed and footwork a setter needs every time they start on defense.",
      steps: [
        "The setter starts in a back-row base as a coach sends a dug ball up.",
        "The setter sprints to the setting target, squares up, and sets a hittable ball.",
        "Change up where the dig comes from so the setter releases from different spots.",
        "Add hitters so the transition set connects to a real attack."
      ],
      cues: [
        "Release the second the ball is up. Beat it to the target.",
        "Sprint, then break down and square up. Get there early, not lunging.",
        "Give a high, hittable ball even when you're on the run."
      ],
      easier: "Start the setter closer to the net and toss easy first balls so the release is manageable.",
      harder: "Start the setter deep in defense and play live so they dig or release every rally.",
      videoSearchUrl: v("Transition Setting from the Back Row")
    },

    // ===================== SERVING =====================
    {
      id: "partner-mini-serve-rally",
      name: "Partner Mini-Serve Rally",
      skill: "Serving",
      ageMin: 8, ageMax: 13,
      difficulty: 1,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Two young players serve back and forth to each other over a low or short net and catch each serve. It makes serving a fun partner game with a clear goal — get it over the net — and builds the motion before they serve from far away.",
      steps: [
        "Partners stand a short distance apart across a lowered net.",
        "One serves (underhand or overhand) to their partner, who catches it.",
        "The catcher then serves it back, and they rally serve-and-catch.",
        "Count how many serves in a row the pair can keep over the net."
      ],
      cues: [
        "Aim your serve right at your partner so they can catch it.",
        "Same smooth motion every serve. Get it over the net first.",
        "Step toward your partner as you serve."
      ],
      easier: "Move closer, lower the net, and use a lighter ball so every serve gets over.",
      harder: "Step back to a real serving distance and make your partner catch it without moving much.",
      videoSearchUrl: v("Partner Mini-Serve Rally")
    },
    {
      id: "knockout-serving-game",
      name: "Knockout Serving Game",
      skill: "Serving",
      ageMin: 10, ageMax: 18,
      difficulty: 3,
      minPlayers: 4,
      durationMin: 10,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "An elimination serving game: miss a serve and you're out (or you lose a life), and the last server standing wins. It adds fun, friendly pressure to serving reps. Players ask for this one by name.",
      steps: [
        "Everyone lines up on the end line with a ball.",
        "On the whistle, everyone serves. Anyone who misses is out (or loses a life).",
        "The survivors serve again each round until one player is left.",
        "Play several quick games so players who get out are back in fast."
      ],
      cues: [
        "Stick to your routine. Don't change your serve under pressure.",
        "When it's tense, pick a safe, makeable serve over a risky one.",
        "Same toss every round, especially near the end."
      ],
      easier: "Give each player three lives and let them serve from mid-court so games last longer.",
      harder: "Make serves only survive if they hit a called zone, or drop to one life for a fast, high-pressure game.",
      videoSearchUrl: v("Knockout Serving Game")
    },
    {
      id: "serve-the-seam",
      name: "Serve the Seam",
      skill: "Serving",
      ageMin: 13, ageMax: 18,
      difficulty: 4,
      minPlayers: 2,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Older servers aim at the seams between passers and the tough deep zones, where serves cause the most trouble. It trains aggressive, smart serving instead of just getting it in.",
      steps: [
        "Put cones or players in place to mark the seams between passing zones.",
        "Servers aim float or topspin serves at a called seam or deep corner.",
        "Track which seams a server can hit consistently.",
        "Add a live passer so servers see how a tough seam serve messes up the pass."
      ],
      cues: [
        "Pick the seam and commit. Be aggressive, but in.",
        "A tough seam serve makes two passers freeze for a second.",
        "Deep and at the seam is harder to pass than hard and right at someone."
      ],
      easier: "Use bigger seam targets and serve from a shorter distance while learning to place it.",
      harder: "Mix float and topspin to the seams under a serving target, with a passer rating how tough it is.",
      videoSearchUrl: v("Serve the Seam")
    },

    // ===================== HITTING =====================
    {
      id: "approach-steps-walkthrough",
      name: "Approach Steps Walk-Through",
      skill: "Hitting",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: [],
      setup: "Young players learn the rhythm of a hitting approach by walking it slowly — no ball, no jump — until the steps feel natural. This is the base before any real attacking.",
      steps: [
        "Stand a few steps off the net. Right-handers step 'left, right-left'. Lefties do the opposite.",
        "Walk the steps slowly, counting the rhythm out loud as a group.",
        "Add the arm swing: arms back on the big step, then up and forward.",
        "Slowly speed the steps up from a walk to a jog to a small hop at the end."
      ],
      cues: [
        "Slow to fast. The last two steps are the quick ones.",
        "Swing your arms back, then up — throw them at the sky.",
        "Plant both feet and 'pop' up, landing where you took off."
      ],
      easier: "Just count and walk the footwork with no arms until the rhythm is automatic.",
      harder: "Add a real two-foot jump and a swing at a high target, building toward hitting a tossed ball.",
      videoSearchUrl: v("Approach Steps Walk-Through")
    },
    {
      id: "slide-approach-attack",
      name: "Slide Attack",
      skill: "Hitting",
      ageMin: 14, ageMax: 18,
      difficulty: 4,
      minPlayers: 3,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Middle (and right-side) hitters learn the slide — a one-foot, running takeoff that moves down the net behind the setter. It stretches the block and is a great answer to a middle blocker who commits.",
      steps: [
        "Start near the setter and run a curved path along the net behind them.",
        "Take off from one foot, like a layup in basketball, while you're moving down the net.",
        "Hit the back-set ball at the top of your slide, swinging across your body.",
        "Run it off a steady back set first, then change up your takeoff spot."
      ],
      cues: [
        "One-foot takeoff off the run, like a basketball layup.",
        "Float down the net and hit at the very top, away from the setter.",
        "Time it to the back set. The slide beats a slow-closing block."
      ],
      easier: "Walk the curved path and the one-foot takeoff with no ball, then add a high, slow back set.",
      harder: "Run the slide at quick speed against a closing block, changing your takeoff so it's hard to read.",
      videoSearchUrl: v("Slide Attack")
    },
    {
      id: "transition-hitting-off-defense",
      name: "Transition Hitting off Defense",
      skill: "Hitting",
      ageMin: 14, ageMax: 18,
      difficulty: 4,
      minPlayers: 4,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Hitters dig or defend a ball, then pull off the net and attack the next set — which is how most rallies are actually won. It trains the tough defense-to-offense footwork and timing.",
      steps: [
        "The hitter starts in a defensive spot and digs a coach-entered ball.",
        "On the dig, the hitter pulls off the net to the attack line to become a hitter.",
        "The setter delivers a transition set, and the hitter approaches and attacks.",
        "Repeat so players link defense, transition, and the attack every rep."
      ],
      cues: [
        "Dig, then get off the net fast. Separate from the net so you have room.",
        "Open up to the ball and time your approach to the transition set.",
        "Take a smart, high-percentage swing. Transition balls reward control."
      ],
      easier: "Catch the first ball instead of digging it, then transition and hit off a steady set.",
      harder: "Play live rallies so players defend, transition, and attack against a block every time.",
      videoSearchUrl: v("Transition Hitting off Defense")
    },

    // ===================== BLOCKING =====================
    {
      id: "block-a-tossed-ball",
      name: "Block a Tossed Ball",
      skill: "Blocking",
      ageMin: 10, ageMax: 14,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "A young blocker's first real block. A partner holds or tosses a ball just over the net, and the blocker times a jump to press it back. The predictable ball builds timing and confidence.",
      steps: [
        "A partner stands on a box or reaches a ball just over the net.",
        "The blocker squares up, jumps, and presses their hands over to push the ball back down.",
        "Move from a held ball to a gentle toss the blocker has to time.",
        "Focus on a balanced landing and firm, spread hands."
      ],
      cues: [
        "Watch the ball, jump a beat after it's tossed, and reach over.",
        "Firm, spread hands, thumbs up. Press the ball down into their court.",
        "Land balanced on two feet, square to the net."
      ],
      easier: "Use a held ball at a lowered net so the blocker only works on the reach and the press.",
      harder: "Toss the ball to different spots so the blocker has to move, time it, and seal it back.",
      videoSearchUrl: v("Block a Tossed Ball")
    },
    {
      id: "double-block-seal",
      name: "Double Block Seal",
      skill: "Blocking",
      ageMin: 15, ageMax: 18,
      difficulty: 5,
      minPlayers: 4,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Two blockers form a tight double block at the pin with no gap for the hitter to use. It's the highest-value blocking skill — a sealed double turns hard swings into stuff blocks and easy digs.",
      steps: [
        "An outside blocker sets the block at the pin, and the middle closes in to join them.",
        "The two press their inside hands together so there's no gap between them.",
        "Both reach over the net and angle their hands to send the ball to the defenders.",
        "Repeat against a live hitter, focusing on the timing and the sealed gap."
      ],
      cues: [
        "Seal the gap — inside hands together, no space.",
        "Press over and angle your hands so the ball goes to your diggers.",
        "Jump together. A late or split double block is worse than no block."
      ],
      easier: "Form the double against a coach hitting from a box at a slow, steady speed.",
      harder: "Close the double on a live, full-speed hitter and line it up with the back-row defense behind it.",
      videoSearchUrl: v("Double Block Seal")
    },

    // ===================== DEFENSE =====================
    {
      id: "dig-and-catch-game",
      name: "Dig and Catch Game",
      skill: "Defense",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 3,
      durationMin: 8,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls"],
      setup: "A youth defense game. One player digs a tossed ball and a teammate tries to catch it before it lands, scoring a point for each save. It makes digging a team thing and grooves a controlled platform.",
      steps: [
        "A feeder tosses a ball at the digger from a few steps away.",
        "The digger plays it up high, and a catcher behind them tries to catch it.",
        "A caught dig is a point for the pair.",
        "Rotate the digger, catcher, and feeder so everyone gets reps."
      ],
      cues: [
        "Dig the ball UP and high, not forward, so your catcher has a chance.",
        "Quiet arms, ball in front, lift with your legs.",
        "Call 'up!' so your catcher is ready."
      ],
      easier: "Toss softly and right to the digger before you add any movement.",
      harder: "Toss harder and to the sides so the digger has to move, dig high, and still find the catcher.",
      videoSearchUrl: v("Dig and Catch Game")
    },
    {
      id: "tip-coverage-behind-block",
      name: "Tip Coverage Behind the Block",
      skill: "Defense",
      ageMin: 13, ageMax: 18,
      difficulty: 3,
      minPlayers: 4,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Defenders learn to cover the short tip that drops right behind the block — the hole every smart hitter aims for. It trains the back-row players to read it and sprint up to the tip.",
      steps: [
        "A coach (or hitter) tips balls over a two-person block into the short court.",
        "The defenders read the tip and sprint forward to play it up.",
        "Focus on being stopped behind the block, then exploding forward when they read a tip.",
        "Mix tips with hard swings so defenders have to read which is coming."
      ],
      cues: [
        "Read the hitter slowing down — a tip shows in their arm.",
        "Cover the hole right behind the block. That's your spot.",
        "Play the tip UP and toward the middle so a teammate can set it."
      ],
      easier: "Only tip (no hard swings) and from a slow box so defenders groove the forward sprint.",
      harder: "Mix tips, rolls, and hard swings so defenders have to read and cover the whole short court live.",
      videoSearchUrl: v("Tip Coverage Behind the Block")
    },
    {
      id: "transition-dig-to-attack",
      name: "Dig-to-Attack Transition",
      skill: "Defense",
      ageMin: 13, ageMax: 18,
      difficulty: 4,
      minPlayers: 4,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "The whole point of a good dig: defenders dig a hard ball to the setter, then the team attacks right back. It connects defense to offense so digs turn into points, not just saves.",
      steps: [
        "A coach attacks at the defenders, who dig the ball to the setter target.",
        "The setter sets, and a hitter transitions to attack the counter.",
        "Only score the rally if the dig leads to a controlled counter-attack.",
        "Rotate so everyone digs, sets, and attacks in transition."
      ],
      cues: [
        "Dig to the setter, not just up. A good dig starts the counter.",
        "Everyone transitions — hitters off the net, setter to the ball.",
        "Turn defense into offense. A dug ball is a chance to score."
      ],
      easier: "Down-ball at the defenders and let them catch and toss the dig to slow the transition down.",
      harder: "Attack hard and play the rally out live so the counter has to beat a real block and defense.",
      videoSearchUrl: v("Dig-to-Attack Transition")
    },

    // ===================== TEAM PLAY / GAMES =====================
    {
      id: "three-v-three-mini-game",
      name: "3v3 Mini Game",
      skill: "Team Play",
      ageMin: 8, ageMax: 14,
      difficulty: 2,
      minPlayers: 6,
      durationMin: 14,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Three-on-three on a small court is the sweet spot for young players — enough teammates to run pass-set-hit, but few enough that everyone touches the ball a lot. A great youth and camp game.",
      steps: [
        "Make teams of three on a shrunk court with a lowered net.",
        "Play rally scoring and encourage three touches per side.",
        "Rotate positions each rally so everyone passes, sets, and hits.",
        "Play short games to a low number and mix up the teams often."
      ],
      cues: [
        "Try for three touches — pass, set, hit — every time.",
        "Call the ball and cover for each other.",
        "Everyone does every job. Rotate and stay in it."
      ],
      easier: "Let players catch-and-set or use one bounce, lower the net, and shrink the court.",
      harder: "Require three touches to score, add a serve to start, and grow the court so players cover more ground.",
      videoSearchUrl: v("3v3 Mini Game")
    },
    {
      id: "newcomb-catch-volley",
      name: "Newcomb Catch Volley",
      skill: "Team Play",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 6,
      durationMin: 12,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "A throw-and-catch lead-up game (Newcomb) that teaches volleyball positions, talking, and the rules before players can really pass. It's the perfect first 'game' for brand-new young players.",
      steps: [
        "Two teams on a court with a lowered net. The ball is thrown, not hit.",
        "A player catches the ball, then throws it back over the net within three passes.",
        "Teams can move the ball between up to three players before sending it over.",
        "Score it like volleyball, and rotate positions so everyone learns the spots."
      ],
      cues: [
        "Move to the ball and call for it before you catch it.",
        "Spread out and cover your area like in a real game.",
        "Use your teammates — up to three catches before it goes over."
      ],
      easier: "Allow more passes per side and a bigger, softer ball. Skip rotating for the youngest.",
      harder: "Limit it to one or two catches per side, then move toward bumping instead of catching.",
      videoSearchUrl: v("Newcomb Catch Volley")
    },

    // ===================== COOLDOWN =====================
    {
      id: "yoga-flow-cooldown",
      name: "Yoga Flow Cooldown",
      skill: "Cooldown",
      ageMin: 10, ageMax: 18,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["mats"],
      setup: "A short, calm yoga-style flow to lengthen the muscles you use for jumping and hitting and to settle the group after a hard practice. It builds flexibility and a quiet, focused finish.",
      steps: [
        "Move slowly through a forward fold and a gentle side-bend each way.",
        "Flow into a low lunge on each side to open your hips and quads.",
        "Add a child's pose and a gentle spinal twist on the floor.",
        "Finish lying still for several slow breaths to fully relax."
      ],
      cues: [
        "Move with your breath. Go slow and easy, never forced.",
        "Ease into each shape to a gentle stretch, not pain.",
        "Stay quiet and calm. Let your heart rate come all the way down."
      ],
      easier: "Shorten it to a forward fold, a lunge each side, and some breathing.",
      harder: "Hold each pose longer and add a balance shape for a fuller mobility and stability finish.",
      videoSearchUrl: v("Yoga Flow Cooldown")
    }

  ];

  RR.drills = (RR.drills || []).concat(more);
})(window.RR);
