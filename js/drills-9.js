// drills-9.js — RallyReady drill library DATA (Part 9 of 9).
//
// PURE DATA ONLY. Conditioning, advanced setting/serving, camp games, and
// cooldowns. Plain coach English. Real, standard drills and lead-up games.
// CONCATENATES onto RR.drills. LINKS standard applies.
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
      id: "dynamic-mobility-flow",
      name: "Dynamic Mobility Flow",
      skill: "Warmup",
      ageMin: 8, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 7,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: [],
      setup: "A flowing set of moving stretches that open up the hips, shoulders, and back before any explosive work. It gets the joints volleyball loads the most ready to go, without any standing-still stretches.",
      steps: [
        "Swing your legs front-to-back and side-to-side, holding something for balance.",
        "Walk forward, hugging one knee to your chest, then reach it out. Then walk pulling your heel to your backside.",
        "Step into a deep lunge each side and rotate your chest over your front leg.",
        "Finish with some arm and trunk twists to open your shoulders and back."
      ],
      cues: [
        "Move through a full range. This is motion, not a held stretch.",
        "Control each rep. Smooth and on purpose.",
        "Open up your hips and shoulders. Those are the joints you'll use most."
      ],
      easier: "Do fewer reps with smaller ranges, holding on for balance the whole time.",
      harder: "Add deeper lunges with a longer reach and a few slow, controlled inchworms.",
      videoSearchUrl: v("Dynamic Mobility Flow")
    },
    {
      id: "partner-medicine-ball-power",
      name: "Partner Medicine Ball Power",
      skill: "Warmup",
      ageMin: 13, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 7,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["medicine ball"],
      setup: "Partners throw a light medicine ball to each other in explosive, volleyball-like motions to wake up the power needed for hitting and jumping. Having a partner makes it competitive and fun.",
      steps: [
        "Chest passes back and forth, exploding the ball out from your chest.",
        "Overhead throws that copy a spike or serve motion.",
        "Twisting side throws to your partner, working both directions.",
        "Finish with a few explosive scoop throws, driving up from a squat."
      ],
      cues: [
        "Be explosive on every throw. Moving fast is what wakes up the power.",
        "Use your legs and core, not just your arms.",
        "Light ball, fast and athletic. This is a wake-up, not a weights session."
      ],
      easier: "Use a lighter ball and a shorter distance, just making clean, controlled throws.",
      harder: "Add a step or a small jump into each throw to make it more dynamic and powerful.",
      videoSearchUrl: v("Partner Medicine Ball Power")
    },
    {
      id: "reaction-sprint-starts",
      name: "Reaction Sprint Starts",
      skill: "Warmup",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: [],
      setup: "Players explode into a short sprint when they see or hear a sudden signal. It sharpens the reaction and quick first step that defense and serve receive need. A sharp way to finish a warm-up.",
      steps: [
        "Players start in an athletic stance facing a coach or partner.",
        "On a clap, whistle, or hand drop, they explode into a 5-yard sprint.",
        "Change the starting position — facing forward, sideways, even backward.",
        "Full effort, then full rest between short sprints."
      ],
      cues: [
        "Stay loaded and ready. React the instant the signal comes.",
        "Drive your first three steps hard and low.",
        "Quick reaction, then full speed. Rest fully between reps."
      ],
      easier: "Use a steady count so players practice the explosive start before adding the reaction.",
      harder: "Mix up the signals and starting positions, and add a change of direction at the end.",
      videoSearchUrl: v("Reaction Sprint Starts")
    },

    // ===================== PASSING =====================
    {
      id: "bump-over-net-to-targets",
      name: "Bump Over the Net to Targets",
      skill: "Passing",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Young players bump a tossed ball over a lowered net to big targets. It puts a clean platform together with the idea of sending the ball where you want. A confidence-builder toward real passing and attacking.",
      steps: [
        "A partner tosses an easy ball to the passer near a lowered net.",
        "The passer bumps it over the net toward a big target on the other side.",
        "Aim for a deep target, then a short one, to learn to control the distance.",
        "Count targets hit, then switch jobs."
      ],
      cues: [
        "Angle your arms where you want the ball to go.",
        "Bump it up and over, lifting with your legs.",
        "Pick a target and aim for it every time."
      ],
      easier: "Lower the net, move closer, and use a big target so success comes easily.",
      harder: "Move back, make the targets smaller, and bump off tosses that are a little off.",
      videoSearchUrl: v("Bump Over the Net to Targets")
    },
    {
      id: "partner-pass-and-set-continuous",
      name: "Partner Pass-and-Set Continuous",
      skill: "Passing",
      ageMin: 11, ageMax: 16,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "Partners keep a steady rally going where one passes and the other sets it back, blending the two first-touch skills in one smooth, friendly drill. It builds control and a feel for both touches.",
      steps: [
        "Partner A passes (bumps) the ball to partner B.",
        "Partner B sets the ball back to partner A.",
        "Partner A passes again — it's a steady pass, set, pass, set.",
        "Keep the ball high and under control, and count your clean ones in a row."
      ],
      cues: [
        "Pass it high so your partner has time to set.",
        "Move your feet to get under each ball.",
        "Give your partner a ball they can handle easily."
      ],
      easier: "Let players catch between touches and stand closer together to keep it going.",
      harder: "Add distance and movement so each touch means getting to the ball first.",
      videoSearchUrl: v("Partner Pass-and-Set Continuous")
    },
    {
      id: "backcourt-communication-passing",
      name: "Backcourt Communication Passing",
      skill: "Passing",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 4,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Three passers across the back court have to talk constantly to handle serves to any zone or seam. It trains the loud, early communication that keeps a three-person serve-receive from breaking down.",
      steps: [
        "Three passers cover the back court in a serve-receive look.",
        "A server serves to zones and seams, and passers call early who's taking it.",
        "The one who takes it passes to target. The others open up and back up the play.",
        "Demand a loud call on every serve before the pass."
      ],
      cues: [
        "Call early and loud. Going quiet is how seams get shanked.",
        "Take the ball that's heading toward you, and trust your neighbor with theirs.",
        "Open up to the ball and back up every pass."
      ],
      easier: "Toss instead of serve and slow the seam balls down so the calls are easier to make in time.",
      harder: "Add tough float serves to the seams and require a clean pass to target for it to count.",
      videoSearchUrl: v("Backcourt Communication Passing")
    },
    {
      id: "passing-accuracy-ladder",
      name: "Passing Accuracy Ladder",
      skill: "Passing",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: true,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Passers climb a 'ladder' by stringing together on-target passes to the setter spot, and a miss knocks them back down. It turns accurate passing into a focused, competitive challenge.",
      steps: [
        "A feeder serves or tosses to the passer, who has to pass to a target zone.",
        "Each on-target pass moves them up one rung of the ladder.",
        "A miss drops them down a rung (or back to the start).",
        "Race to the top, on your own or against a teammate."
      ],
      cues: [
        "Lock in on the target. The ladder rewards accuracy, not just keeping it up.",
        "Be stopped and balanced so the pass goes where you aim.",
        "One pass at a time. Being steady is what climbs the ladder."
      ],
      easier: "Use a big target and tosses instead of serves so passers can build a streak.",
      harder: "Make the target smaller, serve harder, and require more rungs to win.",
      videoSearchUrl: v("Passing Accuracy Ladder")
    },
    {
      id: "serve-receive-vs-jump-serve",
      name: "Serve Receive vs. the Jump Serve",
      skill: "Passing",
      ageMin: 15, ageMax: 18,
      difficulty: 4,
      minPlayers: 4,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Advanced passers face hard jump serves and learn to start a little deeper, stay big, and just control the ball to a playable spot. It's the skill that keeps a team in system against great servers.",
      steps: [
        "A server hits jump or hard topspin serves at the passers.",
        "Passers start a step deeper and keep their arms quiet to take the speed off.",
        "The goal is a controlled, playable ball — height and control over a perfect spot.",
        "Track how many passes stay in system, then rotate passers."
      ],
      cues: [
        "Start a touch deeper and stay big. Let the ball come to you.",
        "Quiet, firm arms. Take the speed off the ball, don't swing at it.",
        "Control first. A playable ball beats a risky perfect one."
      ],
      easier: "Use hard standing serves before full jump serves, and make the acceptable target bigger.",
      harder: "Face full-speed jump serves at the seams and require an in-system pass to a small target.",
      videoSearchUrl: v("Serve Receive vs. the Jump Serve")
    },

    // ===================== SETTING =====================
    {
      id: "setting-over-net-to-target",
      name: "Setting Over the Net to a Target",
      skill: "Setting",
      ageMin: 11, ageMax: 16,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Setters work on putting an accurate ball at the hitter's contact spot at the pin, over a real net, until the location is second nature. It's the everyday rep that makes a set hittable.",
      steps: [
        "A feeder tosses a pass to the setter at the net.",
        "The setter delivers a high, hittable set to a marked target at the outside pin.",
        "Check the spot: off the net enough to swing, high enough to time.",
        "Switch between outside and right-side targets, and rotate setters."
      ],
      cues: [
        "Set to a high point above the target, a little off the net.",
        "Turn your hips to face the pin before you set.",
        "Same height and spot every time so a hitter can time it."
      ],
      easier: "Use a big target and let players catch and set to groove the location.",
      harder: "Feed off-target passes and make the target small so the set has to be exact.",
      videoSearchUrl: v("Setting Over the Net to a Target")
    },
    {
      id: "setting-quick-connection",
      name: "Setting Quick Connection",
      skill: "Setting",
      ageMin: 14, ageMax: 18,
      difficulty: 4,
      minPlayers: 3,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "The setter and middle build the timing of the quick set together — a low, fast ball delivered to a hitter who's already in the air. It's the connection that makes a fast offense work.",
      steps: [
        "A feeder passes to the setter as the middle starts a quick approach.",
        "The setter delivers a low, fast set to the middle's contact spot in front of them.",
        "Repeat the same timing until it's automatic between the two of them.",
        "Change the pass a little so the setter adjusts and still connects."
      ],
      cues: [
        "Deliver the quick to where the hitter will be — low and fast.",
        "Setter and middle: talk and rep the timing until it's instinct.",
        "Keep the speed the same so the hitter trusts the ball will be there."
      ],
      easier: "Slow the timing to a higher set so the pair can build it in steps.",
      harder: "Add pass changes and a block so the connection holds up under game conditions.",
      videoSearchUrl: v("Setting Quick Connection")
    },
    {
      id: "setter-live-read-options",
      name: "Setter Live-Read Options",
      skill: "Setting",
      ageMin: 15, ageMax: 18,
      difficulty: 5,
      minPlayers: 6,
      durationMin: 14,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "The top-level setter skill: reading the block and the quality of the pass in real time and choosing the option that gives the best matchup. It builds the decision-making that runs a high-level offense.",
      steps: [
        "Run a live first ball so the setter gets different passes.",
        "The setter reads where the other team's block is and how good the pass is.",
        "They choose the set — quick, pin, back set, pipe — that gives the best matchup.",
        "Talk through their choices afterward so they learn to spot and attack matchups."
      ],
      cues: [
        "Read the block first, then decide where your offense has the edge.",
        "In system, run your fast options. Out of system, find your best hitter a good ball.",
        "Spread it around. Keep the defense honest by using everyone."
      ],
      easier: "Limit it to two options (pin or quick) so the read is simpler while it develops.",
      harder: "Add a full block and a defense reading the setter, so disguise and quick decisions matter.",
      videoSearchUrl: v("Setter Live-Read Options")
    },

    // ===================== SERVING =====================
    {
      id: "youth-serving-target-game",
      name: "Youth Serving Target Game",
      skill: "Serving",
      ageMin: 8, ageMax: 13,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 10,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "A points-for-targets serving game for young players. Hula hoops, towels, or cones on the court are worth points, which turns serving practice into a fun contest. It sneaks in accuracy reps while kids chase a score.",
      steps: [
        "Put targets worth points around the far court — easy ones closer, deep corners worth more.",
        "Players serve and earn the points of whatever target they hit.",
        "Play on your own for a personal best, or in teams that add up their points.",
        "Reset and play again, trying to beat the last score."
      ],
      cues: [
        "Pick a target before you serve and aim for it.",
        "A makeable serve to an easy target beats a risky miss.",
        "Same calm routine, even when you're chasing points."
      ],
      easier: "Use big targets, serve from mid-court, and let underhand serves count for full points.",
      harder: "Make only deep targets count, serve from the full distance, and require a target hit to score.",
      videoSearchUrl: v("Youth Serving Target Game")
    },
    {
      id: "serving-under-fatigue",
      name: "Serving Under Fatigue",
      skill: "Serving",
      ageMin: 14, ageMax: 18,
      difficulty: 3,
      minPlayers: 1,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Players serve right after a quick burst of conditioning, so they learn to make a tough, accurate serve when they're tired — exactly the spot they're in late in a long match. It builds physical and mental staying power.",
      steps: [
        "The server does a short conditioning burst, like a sprint or a few quick moves.",
        "Right after, they have to serve a tough, in serve to a target.",
        "Do several rounds so serving while breathing hard feels familiar.",
        "Compare their makes when tired to when they're fresh."
      ],
      cues: [
        "Catch your breath into your routine. Don't rush the tired serve.",
        "Trust your mechanics. Being tired makes you want to shortcut them.",
        "Pick a smart target when you're tired. In and tough beats risky."
      ],
      easier: "Make the conditioning burst shorter and serve to a big target while building the habit.",
      harder: "Make the burst longer, require a called zone, and add a make-quota to finish.",
      videoSearchUrl: v("Serving Under Fatigue")
    },
    {
      id: "hybrid-serve-mix",
      name: "Hybrid Serve Mix",
      skill: "Serving",
      ageMin: 15, ageMax: 18,
      difficulty: 5,
      minPlayers: 1,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "A top-level server mixes float and topspin serves to different depths and seams to keep passers off balance. Owning more than one serve with the same look is a real weapon at the highest levels.",
      steps: [
        "Warm up both a float serve and a topspin (or jump) serve until they're consistent.",
        "Mix them on purpose — a deep float, then a hard topspin, then a short float.",
        "Keep your toss and setup as close to the same as you can so passers can't read it.",
        "Track which combinations give live passers the most trouble."
      ],
      cues: [
        "Same look, different serve. Disguising it is the weapon.",
        "Change the speed and depth to keep passers guessing.",
        "Pick the serve the moment calls for and commit all the way."
      ],
      easier: "Alternate the two serves in a set pattern before mixing them up for real.",
      harder: "Mix three serve types to called seams against live passers, keeping your make percentage up.",
      videoSearchUrl: v("Hybrid Serve Mix")
    },

    // ===================== HITTING =====================
    {
      id: "hitting-from-all-positions",
      name: "Hitting from All Positions",
      skill: "Hitting",
      ageMin: 13, ageMax: 18,
      difficulty: 3,
      minPlayers: 3,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Hitters take swings from the outside, the middle, the right side, and the back row in a row, building the all-around ability to attack from anywhere. It's especially useful for younger teams where players fill more than one role.",
      steps: [
        "A setter (or coach) sets to the outside, and the hitter attacks and resets.",
        "Next, a quick set to the middle, then a back set to the right side.",
        "Finish with a back-row set, attacking from behind the line.",
        "Rotate hitters through the whole sequence so everyone attacks from every spot."
      ],
      cues: [
        "Adjust your approach angle and timing to each spot.",
        "Same high, in-front contact wherever you hit from.",
        "Learn every spot. A hitter who can play anywhere is hard to defend and easy to sub in."
      ],
      easier: "Hit from two spots off a steady coach toss before adding all four.",
      harder: "Run all four off live sets with a block, calling the spot at the last second.",
      videoSearchUrl: v("Hitting from All Positions")
    },
    {
      id: "attack-and-transition-to-defense",
      name: "Attack and Transition to Defense",
      skill: "Hitting",
      ageMin: 14, ageMax: 18,
      difficulty: 4,
      minPlayers: 3,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "After hitting, a player has to get right back to a defensive spot for the next ball — which is the rhythm of a real rally. It trains the conditioning and discipline to never stand and admire your swing.",
      steps: [
        "The hitter attacks a set, then quickly pulls back to a defensive spot.",
        "A coach sends a ball at the hitter, who is now a defender, and they dig it up.",
        "Do the attack-then-defend cycle several times in a row.",
        "Focus on a fast, balanced move from the net back to your spot."
      ],
      cues: [
        "Land, then get back to your spot. The rally isn't over after your swing.",
        "Land balanced off your attack so you can move right away.",
        "Hit, recover, dig. Make it one continuous sequence."
      ],
      easier: "Attack, then transition to catch a tossed ball instead of digging it.",
      harder: "Play the sequence live so the hitter attacks, covers, and then defends a real counter-attack.",
      videoSearchUrl: v("Attack and Transition to Defense")
    },

    // ===================== DEFENSE =====================
    {
      id: "youth-team-defense-positions",
      name: "Youth Team Defense Positions",
      skill: "Defense",
      ageMin: 10, ageMax: 14,
      difficulty: 2,
      minPlayers: 6,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Young teams learn where to stand on defense and how to move together when the other team attacks. It's a first, walkable look at team defense before any speed or pressure.",
      steps: [
        "Put players in simple base defensive spots and name each one.",
        "A coach attacks slowly from a pin, and players move to their read spots together.",
        "Walk through who covers tips, who covers the deep ball, and who backs up.",
        "Go at a gentle pace so the team learns to move as one."
      ],
      cues: [
        "Know your spot and watch the hitter together.",
        "Move as a team when the ball is set. Everyone adjusts.",
        "Call your coverage. Talk to your teammates."
      ],
      easier: "Use tosses and down-balls and call out each player's job until the spots stick.",
      harder: "Add faster attacks from both pins so the team has to read and move at game speed.",
      videoSearchUrl: v("Youth Team Defense Positions")
    },
    {
      id: "collapse-dig-and-recover",
      name: "Collapse Dig and Recover",
      skill: "Defense",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls"],
      setup: "Defenders learn to drop low and 'collapse' under a hard ball at their midline — getting their arms under it and controlling it — then pop back up. It keeps low, fast balls in play that a stiff stance would shank.",
      steps: [
        "A coach drives balls low and hard at the defender's midline.",
        "The defender collapses low, gets their arms under the ball, and digs it up.",
        "They drop a knee or sit to take the speed off if they need to, then recover to ready.",
        "Repeat with hard, low balls, focusing on a controlled, high dig."
      ],
      cues: [
        "Get low fast and get your arms under the ball. Don't reach down stiff.",
        "Take the speed off and dig it up high toward the middle.",
        "Recover to ready the second you've made the dig."
      ],
      easier: "Drive the balls slower and more predictably so the defender grooves the low collapse.",
      harder: "Hit harder and to either side of the midline so the defender collapses on the move.",
      videoSearchUrl: v("Collapse Dig and Recover")
    },

    // ===================== TEAM PLAY / GAMES =====================
    {
      id: "amoeba-team-game",
      name: "Amoeba Team Game",
      skill: "Team Play",
      ageMin: 8, ageMax: 14,
      difficulty: 1,
      minPlayers: 6,
      durationMin: 12,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "A cooperative camp game where a team has to make every player touch the ball before sending it over. It builds teamwork, movement, and including everyone — every player is part of the play, every rally.",
      steps: [
        "Make teams on a court with a lowered net.",
        "Each team has to have a set number of players touch the ball before it goes over.",
        "Let them catch-and-pass at first, then move to bumps and sets.",
        "Score it like volleyball, with a bonus for getting everyone in cleanly."
      ],
      cues: [
        "Move the ball to your teammates. Everyone touches it.",
        "Call names and help each other keep it alive.",
        "Spread out and stay in it. You're all part of the amoeba."
      ],
      easier: "Allow catches and a smaller number of touches for the youngest groups.",
      harder: "Require real touches (no catches) and that every player touches it before it goes over.",
      videoSearchUrl: v("Amoeba Team Game")
    },
    {
      id: "camp-skills-circuit",
      name: "Camp Skills Stations Circuit",
      skill: "Team Play",
      ageMin: 8, ageMax: 16,
      difficulty: 2,
      minPlayers: 8,
      durationMin: 20,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net", "cones"],
      setup: "A rotating circuit of short skill stations — passing, setting, serving, a fun game — that keeps a big, mixed-age camp group busy, learning, and moving. It's the backbone of an organized, high-energy camp session.",
      steps: [
        "Set up four to six stations, each with one focus and a coach or instructions.",
        "Split campers into small groups, one per station.",
        "Groups work each station for a few minutes, then rotate on a whistle.",
        "Finish with everyone at a fun game station to end on energy."
      ],
      cues: [
        "Keep each station busy and moving so players get lots of touches.",
        "Quick rotations on the whistle. No standing around.",
        "Coaches give one simple cue per station so it's clear and fast."
      ],
      easier: "Use simpler stations and more time at each for younger or newer campers.",
      harder: "Add a challenge or a score at each station and a competition across the whole circuit.",
      videoSearchUrl: v("Camp Skills Stations Circuit")
    },
    {
      id: "four-v-four-continuous",
      name: "4v4 Continuous Play",
      skill: "Team Play",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 8,
      durationMin: 14,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Four-on-four with the coach sending in a new ball the instant a rally ends, so teams get a steady stream of pass-set-attack reps with enough players to run real offense. It's a high-rep middle ground between small games and full 6v6.",
      steps: [
        "Two teams of four play on a court, using three touches a side.",
        "The coach sends in a new ball right when a rally ends, switching sides each time.",
        "Players rotate positions so everyone passes, sets, and attacks.",
        "Play to a target score or for time. The non-stop pace keeps it fast."
      ],
      cues: [
        "Three touches and talk. 4v4 rewards real teamwork.",
        "Reset fast. The next ball is coming right away.",
        "Cover the court together. With fewer players, smart positioning matters."
      ],
      easier: "Toss easy free balls to start rallies and let players catch-and-set.",
      harder: "Send in hard-driven balls, require an attacked ball to score, and play on a full court.",
      videoSearchUrl: v("4v4 Continuous Play")
    },
    {
      id: "beat-the-number-team-challenge",
      name: "Over-the-Net Rally Challenge",
      skill: "Team Play",
      ageMin: 10, ageMax: 16,
      difficulty: 2,
      minPlayers: 6,
      durationMin: 10,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Two teams work together to keep a rally going over the net and beat a target number of total crossings — they're helping each other, not competing. It builds control, talking, and a shared goal.",
      steps: [
        "Teams rally together over the net, counting every successful crossing.",
        "Set a target number the whole group is trying to beat together.",
        "Require three touches a side once players are comfortable.",
        "When the ball drops, restart the count and try again to beat the record."
      ],
      cues: [
        "Send a ball your opponents can play. It's cooperative.",
        "Three controlled touches a side keeps the rally alive.",
        "Talk and cover. It's everyone's record."
      ],
      easier: "Let players catch to reset long rallies and only require one touch a side.",
      harder: "Require three touches a side and raise the target number each round.",
      videoSearchUrl: v("Over-the-Net Rally Challenge")
    },
    {
      id: "six-on-six-queen-of-the-court",
      name: "6v6 Queen of the Court",
      skill: "Team Play",
      ageMin: 13, ageMax: 18,
      difficulty: 4,
      minPlayers: 12,
      durationMin: 18,
      isStaple: false,
      isGame: true,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Full-team Queen of the Court: 6-player teams rotate through the scoring side, winning to stay and score or crossing over to challenge. It brings the win-to-stay energy of Queen of the Court to full-sided play.",
      steps: [
        "One six-player team holds the scoring side. Another challenges, with more teams waiting.",
        "Put a serve or free ball in play, and play the rally out six on six.",
        "Win on the scoring side to earn a point and stay. Lose and rotate off.",
        "Winning challengers cross over to become the new scoring team. Play to a target."
      ],
      cues: [
        "You only score on the queen side, so win that rally.",
        "Run your full systems — serve receive, attack, transition.",
        "Hustle on and off so the game keeps moving."
      ],
      easier: "Put free balls in play instead of serves and play shorter games so rotations come fast.",
      harder: "Require a serve to start and an attacked ball to score, and make aces and stuffs worth two.",
      videoSearchUrl: v("6v6 Queen of the Court")
    },
    {
      id: "transition-wash-game",
      name: "Transition Wash Game",
      skill: "Team Play",
      ageMin: 14, ageMax: 18,
      difficulty: 4,
      minPlayers: 12,
      durationMin: 18,
      isStaple: false,
      isGame: true,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "A 6v6 wash game built around transition: a team has to win a served rally and then win a coach-entered transition ball to score. It rewards the teams that defend and counter-attack the best.",
      steps: [
        "Put the first ball in play with a serve and play the rally out.",
        "Right away, send in a second ball to the team that just won, forcing a transition.",
        "Win both the serve rally and the transition ball to score a point. A split washes.",
        "Play to a target, focusing on turning defense into offense."
      ],
      cues: [
        "Win the transition ball. Defense and the counter decide this game.",
        "Reset instantly after the first rally. The second ball comes fast.",
        "Talk through every transition. That's where the points are won."
      ],
      easier: "Make the second ball an easy free ball so teams learn the transition before it's hard.",
      harder: "Send in a hard-driven second ball and require an attacked counter to win it.",
      videoSearchUrl: v("Transition Wash Game")
    },

    // ===================== COOLDOWN =====================
    {
      id: "recovery-walk-and-goal-setting",
      name: "Recovery Walk and Goal-Setting",
      skill: "Cooldown",
      ageMin: 12, ageMax: 18,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: [],
      setup: "An easy walking cooldown where each player also sets one specific goal for next practice. It brings the heart rate down slowly and builds the habit of thinking about how to get better.",
      steps: [
        "Walk easy laps of the gym or court, letting your heart rate come down.",
        "Shake out your arms and legs and breathe slowly while you walk.",
        "Each player picks one specific, doable goal for next practice.",
        "Share goals in pairs or as a team, then wrap up."
      ],
      cues: [
        "Easy pace. This is recovery, not more conditioning.",
        "Make your goal specific and something you can control.",
        "Breathe out long and let your body settle."
      ],
      easier: "Keep it to a short walk and one quick goal each for younger or tired groups.",
      harder: "Add a written goal and a check-in on last practice's goal to build some accountability.",
      videoSearchUrl: v("Recovery Walk and Goal-Setting")
    },
    {
      id: "hamstring-and-hip-stretch",
      name: "Hamstring and Hip Stretch Routine",
      skill: "Cooldown",
      ageMin: 10, ageMax: 18,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 7,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["mats"],
      setup: "A stretch routine aimed at the hamstrings and hips, which get tight from all the squatting, jumping, and low defensive stances in volleyball. It helps recovery and keeps players flexible over the long run.",
      steps: [
        "Sitting down, reach gently toward your toes for a hamstring stretch, 30 seconds each side.",
        "Lie on your back and do a figure-four glute stretch on each side.",
        "Kneel into a hip-flexor lunge stretch to open the front of your hips.",
        "Finish with a gentle lying spinal twist each way."
      ],
      cues: [
        "Ease into each stretch to a gentle pull. Never bounce or force it.",
        "Breathe slowly and hold. Give both sides the same time.",
        "Relax into it. This is recovery for tight, hard-working muscles."
      ],
      easier: "Make the holds shorter and keep the stretches seated and supported.",
      harder: "Hold longer and add a standing hamstring stretch and a deeper hip-flexor stretch.",
      videoSearchUrl: v("Hamstring and Hip Stretch Routine")
    }

  ];

  RR.drills = (RR.drills || []).concat(more);
})(window.RR);
