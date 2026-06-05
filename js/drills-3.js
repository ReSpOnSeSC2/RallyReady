// drills-3.js — RallyReady drill library DATA (Part 3 of 9).
//
// PURE DATA ONLY. Conditioning/movement (Warmup), plus deeper Passing, Setting,
// Serving, Hitting, Blocking, and Defense. Plain coach English. All standard,
// real volleyball drills. CONCATENATES onto RR.drills. LINKS standard applies.
window.RR = window.RR || {};

(function (RR) {
  "use strict";

  var v = RR.drillVideoSearch || function (name) {
    return "https://www.youtube.com/results?search_query=" +
      encodeURIComponent("how to " + name + " volleyball");
  };

  var more = [

    // ===================== CONDITIONING / MOVEMENT (Warmup) =====================
    {
      id: "agility-ladder-footwork",
      name: "Agility Ladder Footwork",
      skill: "Warmup",
      ageMin: 8, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["agility ladder"],
      setup: "Lay one or more agility ladders flat on the floor. Players line up and go through a few footwork patterns, then jog back to the line. This builds the quick feet that every volleyball move needs.",
      steps: [
        "Two feet in each box, all the way down the ladder, fast and light.",
        "Facing sideways, go 'in-in-out-out' down the ladder, leading with your near foot.",
        "Do the icky shuffle (in-in-out) down the ladder, staying low.",
        "Hopscotch: feet together in the box, then split your feet out around the rung.",
        "Finish each trip by sprinting three steps out of the last box."
      ],
      cues: [
        "Light and fast on the front of your feet, eyes up.",
        "Pump your arms in time with your feet.",
        "Get it right first, then go faster."
      ],
      easier: "Walk the patterns slowly to learn them, and just use the two-feet-per-box pattern for younger kids.",
      harder: "When the player comes out of the ladder, a coach points left or right and they sprint that way.",
      videoSearchUrl: v("Agility Ladder Footwork")
    },
    {
      id: "approach-jump-landing",
      name: "Approach Jump and Landing Training",
      skill: "Warmup",
      ageMin: 11, ageMax: 18,
      difficulty: 3,
      minPlayers: 1,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: [],
      setup: "Players work on their approach jump, with a big focus on landing softly on two feet. This builds your jump safely and protects your knees and ankles.",
      steps: [
        "Start with squat jumps, landing soft with your knees over your toes.",
        "Add the last two steps of your hitting approach (right-left) into a two-foot jump.",
        "Jump straight up, swing both arms, and 'stick' the landing for a full second.",
        "Build up to a full approach jump, reaching up with your hitting hand.",
        "Do small sets of 5 or 6 with full rest. Quality matters more than getting tired."
      ],
      cues: [
        "Sit your hips back and keep your chest up. Land soft, like a feather, not a thud.",
        "Keep your knees pointing over your toes. Don't let them cave in.",
        "Swing both arms up to jump higher, and reach — don't reach and then crumple."
      ],
      easier: "Skip the approach and just practice squat-jump-and-stick landings to learn soft, balanced feet first.",
      harder: "Add a small box to step off, land soft, and explode up. Only for older, stronger players, and keep the reps low.",
      videoSearchUrl: v("Approach Jump and Landing Training")
    },
    {
      id: "reaction-ball-quickness",
      name: "Reaction Ball Quickness",
      skill: "Warmup",
      ageMin: 10, ageMax: 18,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["reaction ball"],
      setup: "Partners use a lumpy reaction ball (or any ball bounced so it goes a random way). One drops or bounces it, the other reacts and catches it. This sharpens the quick first step that defense needs.",
      steps: [
        "The feeder bounces the reaction ball on the floor in front of their partner.",
        "The partner stays low and catches it after one bounce, moving their feet to it.",
        "Move on to catching crazy bounces off a wall.",
        "Switch jobs after a bit, and keep the work in short, sharp bursts."
      ],
      cues: [
        "Stay low in a defensive stance, weight forward, hands ready.",
        "React with your feet first, then your hands.",
        "Go in short, explosive bursts, and reset to ready between each ball."
      ],
      easier: "Use a regular volleyball and softer bounces so the ball is easier to follow.",
      harder: "Stand closer to the wall and throw harder, or have the catcher start facing away and turn on a call.",
      videoSearchUrl: v("Reaction Ball Quickness")
    },
    {
      id: "core-rotational-power",
      name: "Medicine Ball Rotational Power",
      skill: "Warmup",
      ageMin: 12, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["medicine ball", "wall"],
      setup: "Players use a light medicine ball against a wall to build the twisting core power that drives serving and hitting. Keep the ball light and the moves quick and explosive, not slow and heavy.",
      steps: [
        "Stand sideways to the wall, feet shoulder-width apart, holding the ball at your hip.",
        "Twist through your hips and core to throw the ball into the wall, then catch the rebound.",
        "Do the same number on both sides to stay even.",
        "Add an overhead 'serve throw': ball overhead in both hands, snap your trunk, and throw it down at the floor.",
        "Keep the sets short — 6 to 8 explosive throws — with full rest."
      ],
      cues: [
        "The power comes from your hips and core, not your arms.",
        "Be explosive on every throw. Moving fast is the whole point.",
        "Keep your core tight and your back flat, not arched."
      ],
      easier: "Use the lightest ball or no ball, just going through the twisting motion slowly.",
      harder: "Add a step into the throw to copy the weight shift of a real serve or spike.",
      videoSearchUrl: v("Medicine Ball Rotational Power")
    },

    // ===================== PASSING =====================
    {
      id: "platform-angle-passing",
      name: "Platform Angle Passing",
      skill: "Passing",
      ageMin: 10, ageMax: 18,
      difficulty: 3,
      minPlayers: 3,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "A passer gets balls fed from different angles and has to send every one to the same target. This teaches you to angle your arms toward the target instead of swinging at the ball — the key to good passing.",
      steps: [
        "A feeder tosses or hits balls to the passer's left, middle, and right.",
        "The passer sets their arm angle toward the target before the ball arrives, not after.",
        "Pass the ball to a target at the setter's spot no matter where it came from.",
        "Count how many land on target, then rotate."
      ],
      cues: [
        "Angle your arms toward the target. Don't swing them at the ball.",
        "Lift your inside shoulder so the ball deflects toward the target.",
        "Beat the ball to the spot so you're still and balanced when you pass."
      ],
      easier: "Feed only two angles and stand the passer closer so the moves are smaller.",
      harder: "Feed faster, hit harder, and make the target small so the angle has to be exact.",
      videoSearchUrl: v("Platform Angle Passing")
    },
    {
      id: "out-of-system-passing",
      name: "Out-of-System Passing",
      skill: "Passing",
      ageMin: 13, ageMax: 18,
      difficulty: 4,
      minPlayers: 4,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "This works on passing tough, awkward balls so the team can still run an attack when the first ball isn't perfect. It's an advanced rep for older teams.",
      steps: [
        "A coach serves or hits hard, awkward balls — deep, short, at the body, off the net.",
        "The passer plays the ball high to the middle of the court to give the setter time.",
        "The setter chases it down and sets a high, hittable ball even from a bad pass.",
        "A hitter finishes with a safe, smart swing, then the group rotates."
      ],
      cues: [
        "When the pass is bad, pass it HIGH and toward the middle. Height buys time.",
        "Get your whole body behind tough serves. Don't reach and shank it.",
        "When you're out of system, the goal is a smart, high ball, not a perfect one."
      ],
      easier: "Hit the tough balls slower so passers learn to move and stay calm.",
      harder: "Add a block and make the out-of-system swing score against a real defense.",
      videoSearchUrl: v("Out-of-System Passing")
    },
    {
      id: "libero-serve-receive-range",
      name: "Libero Serve-Receive Range",
      skill: "Passing",
      ageMin: 13, ageMax: 18,
      difficulty: 4,
      minPlayers: 3,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "This trains a libero or main passer to cover a wide area and take more of the court. It builds the range, footwork, and communication that hold a passing system together.",
      steps: [
        "The libero starts in the middle-back passing spot.",
        "A server aims at the edges and seams of the libero's area.",
        "The libero calls early, moves to get their body behind the ball, and passes to target.",
        "Slowly make the area the libero covers bigger so they have to reach more."
      ],
      cues: [
        "Call it early and loud, then go get it.",
        "Get your arms to the ball with your body behind it, not just a one-arm reach.",
        "Take everything you can reach. A libero passes with range and confidence."
      ],
      easier: "Make the area smaller and use slower serves so they have success before you add range.",
      harder: "Add a second passer so the libero has to talk about the seam and still take the bigger share.",
      videoSearchUrl: v("Libero Serve-Receive Range")
    },
    {
      id: "two-person-serve-receive",
      name: "Two-Person Serve Receive",
      skill: "Passing",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 3,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Two passers split the court and receive serve together. This sharpens talking about the seam and covering the court with fewer passers — a system a lot of competitive teams use.",
      steps: [
        "Two passers each take half the court in a serve-receive stance.",
        "A server serves anywhere, including right at the seam between them.",
        "Passers call early. Whoever the ball is heading toward takes it, and the other one backs up.",
        "Pass to the setter target and track the team's passing average."
      ],
      cues: [
        "Talk before the ball gets there — 'mine' or 'yours'.",
        "A ball at the seam belongs to whoever it's moving toward.",
        "Split the court evenly and trust your partner with their half."
      ],
      easier: "Use a narrower court and slower serves so two passers can cover it comfortably.",
      harder: "Add jump serves at the seam and require a strong passing average before you rotate.",
      videoSearchUrl: v("Two-Person Serve Receive")
    },

    // ===================== SETTING =====================
    {
      id: "jump-setting",
      name: "Jump Setting",
      skill: "Setting",
      ageMin: 14, ageMax: 18,
      difficulty: 4,
      minPlayers: 2,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Setters learn to jump and set in the air. This speeds up the offense and lets the setter attack the second ball. It takes timing, balance, and steady hands in the air.",
      steps: [
        "Start with a small hop and set to a partner, touching the ball at the top of your jump.",
        "Add the setter's footwork up to the net, then jump and set.",
        "Jump-set front and back, keeping your hands and motion the same so it's hidden.",
        "Finish with a coach tossing a pass that the setter has to jump to and deliver on time."
      ],
      cues: [
        "Set at the very top of your jump, with quiet, square hands.",
        "Use the same hand position front and back so the defense can't read you.",
        "Beat the ball to the spot, then jump. Don't jump first and then reach."
      ],
      easier: "Get a standing set rock-solid first, then add just a small hop before a full jump.",
      harder: "Add the threat of a jump-set attack (a dump) so the setter has to read the block and decide.",
      videoSearchUrl: v("Jump Setting")
    },
    {
      id: "tempo-setting",
      name: "Tempo Setting (Quick, Shoot, High)",
      skill: "Setting",
      ageMin: 14, ageMax: 18,
      difficulty: 4,
      minPlayers: 3,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Setters work the three main set speeds — a quick set to the middle, a fast 'shoot' set to the pin, and a high ball outside. Being able to change speeds is what makes an offense hard to defend.",
      steps: [
        "Off a tossed pass, set a low, fast quick set just in front of you for the middle.",
        "On the next ball, push a fast, flat shoot set out to the antenna.",
        "Then set a high, loopy outside ball that lets a hitter take a full approach.",
        "Have the coach call the speed at the last second so the setter has to adjust."
      ],
      cues: [
        "Use the same footwork and posture for every set. Only your hands change the speed.",
        "Quick set: low and tight to you. Shoot: fast and flat. High ball: tall and loopy.",
        "Keep the location the same so hitters can time their approach off your speed."
      ],
      easier: "Work one speed at a time off a steady toss before mixing them.",
      harder: "Run it live with hitters on each set, and mix the calls so the setter hides which one is coming.",
      videoSearchUrl: v("Tempo Setting (Quick, Shoot, High)")
    },
    {
      id: "scramble-setting",
      name: "Scramble Setting",
      skill: "Setting",
      ageMin: 13, ageMax: 18,
      difficulty: 4,
      minPlayers: 3,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Setters chase down bad passes and still deliver a ball a hitter can swing at. This builds the range, footwork, and quick thinking that separate good setters from great ones.",
      steps: [
        "A coach tosses passes off-target — tight to the net, off the net, and deep.",
        "The setter sprints to the ball, gets as square as they can, and sets a hittable ball.",
        "When they can't hand-set it cleanly, they bump-set a safe, high ball instead.",
        "Rotate and count how many bad passes still turn into a hittable set."
      ],
      cues: [
        "Get there fast, then give the hitter a high, easy-to-hit ball.",
        "If you can't square up, bump-set it high to the pin and keep the play alive.",
        "A hittable set off a bad pass is a win, even if it isn't pretty."
      ],
      easier: "Make the passes only a little off so the setter learns to adjust before the worst ones.",
      harder: "Add a hitter and a block so the scramble set has to beat a real defense.",
      videoSearchUrl: v("Scramble Setting")
    },
    {
      id: "two-ball-setting-footwork",
      name: "Two-Ball Setting Footwork",
      skill: "Setting",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 3,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls"],
      setup: "Two feeders take turns tossing to a setter who has to move, set, and reset between each ball. It's fast-paced and builds setting footwork, balance, and recovery.",
      steps: [
        "Two feeders stand a few steps apart, each holding a ball.",
        "Feeder one tosses. The setter moves, squares up, and sets it back.",
        "The setter quickly gets to feeder two's toss and sets that one back.",
        "Keep going back and forth at a brisk pace for a set time, then rest and rotate."
      ],
      cues: [
        "Beat the ball to the spot, set it, then reset your feet right away.",
        "Turn your hips to face your target on every single set.",
        "Stay balanced — quick feet, quiet hands."
      ],
      easier: "Slow the tosses down and stand the feeders closer so the setter has more time.",
      harder: "Spread the feeders out and speed up the tosses so the setter is always moving.",
      videoSearchUrl: v("Two-Ball Setting Footwork")
    },

    // ===================== SERVING =====================
    {
      id: "jump-float-serve",
      name: "Jump Float Serve",
      skill: "Serving",
      ageMin: 13, ageMax: 18,
      difficulty: 4,
      minPlayers: 1,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Players add a jump float — a serve with a short approach and a stiff, no-spin hit that moves around in the air. It's harder to pass than a standing float because it comes in higher and faster.",
      steps: [
        "Hold the ball in your hitting hand and take a one- or two-step approach to a small jump.",
        "Toss the ball out in front with no spin as you start your approach.",
        "Hit the middle of the ball with a firm, flat hand at the top of your jump.",
        "Stop your hand at contact — no follow-through — so the ball floats and dances.",
        "Land balanced inside the court and get ready to play defense."
      ],
      cues: [
        "Low, steady toss out in front. A high toss kills a float serve.",
        "Stiff wrist, flat hand, and stop your hand right at the ball.",
        "Keep the approach under control. The jump adds height, not chaos."
      ],
      easier: "Take the jump out and get a standing float solid first, then add one step and a small hop.",
      harder: "Serve jump floats to specific seams and zones, and aim deep to push the passers back.",
      videoSearchUrl: v("Jump Float Serve")
    },
    {
      id: "pressure-serving-targets",
      name: "Pressure Serving Targets",
      skill: "Serving",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net", "cones"],
      setup: "Servers have to hit called targets, and there's a small price for missing. This trains accuracy under pressure instead of in a relaxed warm-up — closer to how serving feels in a close match.",
      steps: [
        "Put targets in the toughest serving spots — deep corners, short middle, the seams.",
        "Each server gets a set number of tries to hit a called target.",
        "A miss adds a small price, like a sprint or a point for the other group.",
        "Track how many they make under pressure and compare it to their warm-up numbers."
      ],
      cues: [
        "Breathe and run your full routine, especially when there's pressure.",
        "Aim for one spot inside the target, not the whole area.",
        "A made serve to a good spot beats going for a risky ace."
      ],
      easier: "Use bigger targets and drop the price for a miss while players build confidence.",
      harder: "Make the targets smaller, require a couple in a row, and raise the price for a miss.",
      videoSearchUrl: v("Pressure Serving Targets")
    },
    {
      id: "around-the-world-serving",
      name: "Around the World Serving Game",
      skill: "Serving",
      ageMin: 10, ageMax: 18,
      difficulty: 3,
      minPlayers: 3,
      durationMin: 12,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net", "cones"],
      setup: "A serving game where players move through the six court zones by serving to each one in order. It's fun and competitive, and it sneaks in a ton of accuracy reps — great for camps.",
      steps: [
        "Mark the six zones on the far court. Players serve from the end line.",
        "Make a serve into zone 1 to move up to aiming at zone 2, and so on around the court.",
        "First player (or team) to serve all the way 'around the world' through all six zones wins.",
        "If you miss, you stay on your current zone and wait for your next turn."
      ],
      cues: [
        "Adjust your aim and shoulders for each new zone.",
        "Keep the same calm toss and hit even when you're racing.",
        "Smart, makeable serves move you forward. Misses keep you stuck."
      ],
      easier: "Use three big zones (left, middle, right) and serve from mid-court for younger campers.",
      harder: "Make the serve land in a small hoop in each zone, or put a time limit on each round.",
      videoSearchUrl: v("Around the World Serving Game")
    },

    // ===================== HITTING =====================
    {
      id: "high-contact-arm-swing",
      name: "High-Contact Arm Swing",
      skill: "Hitting",
      ageMin: 10, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 8,
      isStaple: true,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "wall"],
      setup: "Hitters work on a clean, high arm swing with no approach — against a wall or with a partner. This is the base every spike is built on: hit the ball high and in front with a fast wrist snap.",
      steps: [
        "Stand a few feet from a wall in your hitting stance, hitting elbow high and back, like a bow and arrow.",
        "Swing fast and hit an imaginary high point in front of your hitting shoulder.",
        "Add a ball: throw it down at the floor so it bounces off the wall, snapping your wrist over the top.",
        "Catch the rebound and go again, keeping your elbow high and the contact in front."
      ],
      cues: [
        "Elbow high and back, then swing fast. Lead with your elbow.",
        "Hit the ball high and in front of your hitting shoulder, not behind your head.",
        "Snap your wrist over the top of the ball to give it topspin."
      ],
      easier: "Just throw the ball down for topspin without the wall first, to feel the wrist snap and high contact.",
      harder: "Add a standing two-foot jump to your swing, then build toward a full approach.",
      videoSearchUrl: v("High-Contact Arm Swing")
    },
    {
      id: "outside-hitter-high-ball",
      name: "Outside Hitter High-Ball Reps",
      skill: "Hitting",
      ageMin: 13, ageMax: 18,
      difficulty: 4,
      minPlayers: 3,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Outside hitters get rep after rep on the high outside set — the go-to attack for most teams. It builds the timing, the approach angle, and the shots to score against a block.",
      steps: [
        "A setter delivers a high ball to the left-side antenna.",
        "The hitter starts wide, approaches at an angle, and hits the ball high and in front.",
        "Call line and cross-court targets so they work on both shots.",
        "Add one blocker so the hitter learns to hit high and use the block."
      ],
      cues: [
        "Start wide and approach into the court so you can hit line or angle.",
        "Wait for the set to leave the setter's hands, then go. Time the high ball.",
        "Hit it high and pick your spot — line, sharp angle, or off the block."
      ],
      easier: "Hit off a coach's steady high toss before using a live setter, and take the blocker out.",
      harder: "Add a full block and a back-row defender so the hitter has to read and place every swing.",
      videoSearchUrl: v("Outside Hitter High-Ball Reps")
    },
    {
      id: "middle-quick-attack",
      name: "Middle Blocker Quick Attack",
      skill: "Hitting",
      ageMin: 14, ageMax: 18,
      difficulty: 4,
      minPlayers: 3,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Middle blockers learn to time the quick set — a low, fast ball right in front of the setter — so they're already in the air when it arrives. This fast attack holds the other team's middle and opens up the outside hitters.",
      steps: [
        "The middle starts at the net, takes a short, fast approach, and is in the air as the setter releases the ball.",
        "The setter delivers a low quick set just above the net in front of them.",
        "The middle hits the ball at full reach with a fast swing down.",
        "Run it off a steady pass first, then add small changes so the middle has to adjust."
      ],
      cues: [
        "Be in the air BEFORE the set gets there. The quick is all about timing, not waiting.",
        "Short, explosive approach, then one fast swing at full reach.",
        "Talk timing with your setter until it's automatic."
      ],
      easier: "Slow it down to a higher set so the middle can learn the timing in steps.",
      harder: "Add a blocker to beat, and mix the quick with a slide so the attack is unpredictable.",
      videoSearchUrl: v("Middle Blocker Quick Attack")
    },
    {
      id: "back-row-attack-pipe",
      name: "Back-Row Attack (Pipe)",
      skill: "Hitting",
      ageMin: 14, ageMax: 18,
      difficulty: 4,
      minPlayers: 3,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Back-row hitters attack from behind the 10-foot (3-meter) line, jumping before the line and landing past it. Adding a middle-back 'pipe' attack stretches the block and creates offense out of serve receive.",
      steps: [
        "The hitter starts behind the attack line in the back row.",
        "On a set to the pipe (middle back), they approach and jump from behind the line.",
        "Hit the high back-row set at full reach, landing past the line legally.",
        "Keep working on the takeoff point so they never step over the line on the jump."
      ],
      cues: [
        "Take off from BEHIND the line. Your feet, not where you land, have to be legal.",
        "Approach big and swing high. A back-row ball is farther from the net.",
        "Hit a high, deep, smart ball. Back-row attacks reward good placement."
      ],
      easier: "Hit off a high coach toss from the middle back, just working on the legal takeoff and a full swing.",
      harder: "Run the pipe out of serve receive with a block, as part of a full transition offense.",
      videoSearchUrl: v("Back-Row Attack (Pipe)")
    },
    {
      id: "hitting-shot-selection",
      name: "Shot Selection vs. the Block",
      skill: "Hitting",
      ageMin: 14, ageMax: 18,
      difficulty: 5,
      minPlayers: 4,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Hitters read a live block and pick the right shot — a hard angle, the line, off the block's hands, a cut shot, or a tip. This builds the smarts that turn big swings into points.",
      steps: [
        "A setter delivers a hittable ball, and one or two blockers go up.",
        "The hitter reads the block late and chooses: swing where the block isn't, use their hands, cut it, or tip.",
        "A coach can take away one shot so the hitter has to use what's open.",
        "Only count smart, well-chosen shots, not just hard swings, and rotate."
      ],
      cues: [
        "See the block, then decide. Hit where they aren't.",
        "If the block is solid, use their hands or go off-speed.",
        "A smart shot for a kill beats a hard swing right into the block."
      ],
      easier: "Use one blocker who doesn't move and call the shot ahead of time so the hitter rehearses each option.",
      harder: "Add a full double block and back-row defense so the hitter has to read and place every ball live.",
      videoSearchUrl: v("Shot Selection vs. the Block")
    },

    // ===================== BLOCKING =====================
    {
      id: "blocking-hands-at-wall",
      name: "Blocking Hand Position at the Wall",
      skill: "Blocking",
      ageMin: 11, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["wall"],
      setup: "Players work on a strong blocking hand shape by pressing against a wall — no net needed. This builds the firm, spread hands that turn a block into a stuff instead of a deflection.",
      steps: [
        "Stand close to a wall with your hands up in front of your forehead, fingers spread.",
        "Press your hands flat against the wall like you're sealing over the net, thumbs up.",
        "Jump and press your hands high on the wall, holding firm for a second.",
        "Repeat, keeping your hands firm and spread, never letting them collapse."
      ],
      cues: [
        "Spread your fingers and make your wrists firm — strong, surfboard hands.",
        "Thumbs up so the ball stays in the court instead of deflecting out.",
        "Press over and hold. Don't swing or slap at the wall."
      ],
      easier: "Just work on the hand shape and the press standing still, with no jump, until it's firm.",
      harder: "Move to a real net and press over a coach's held ball, sealing it back down.",
      videoSearchUrl: v("Blocking Hand Position at the Wall")
    },
    {
      id: "middle-blocker-read-close",
      name: "Middle Blocker Read and Close",
      skill: "Blocking",
      ageMin: 14, ageMax: 18,
      difficulty: 4,
      minPlayers: 3,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Middle blockers read the setter, then move to the pin to form a tight double block with the outside blocker. It's the most athletic blocking job on the court — footwork, timing, and sealing the gap.",
      steps: [
        "The middle starts at the net, watching the setter's hands.",
        "On a set to a pin, the middle uses a quick crossover to close to the outside blocker.",
        "Both blockers jump together and seal the gap between their hands — no space.",
        "Reset to the middle and do it again to the other pin, staying square every time."
      ],
      cues: [
        "Read the setter, then go. Don't commit too early.",
        "Close right up to the outside blocker and seal the gap. A hole there is a kill for them.",
        "Square up and jump together. Get there on time, not late and lunging."
      ],
      easier: "Close to a blocker who stands still, off a coach's slow set, just working on footwork and the seal.",
      harder: "Read a live setter running different options so the middle has to truly decide which way to close.",
      videoSearchUrl: v("Middle Blocker Read and Close")
    },
    {
      id: "swing-blocking",
      name: "Swing Blocking Footwork",
      skill: "Blocking",
      ageMin: 15, ageMax: 18,
      difficulty: 5,
      minPlayers: 1,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["net"],
      setup: "Advanced blockers use a swing-block — an athletic, arm-swinging crossover that covers more ground and adds height. Higher-level teams use it to get to the pins fast.",
      steps: [
        "Start at the net in a balanced stance, hands low and ready (not already up).",
        "Open with a directional step, then a big crossover, swinging your arms back like an approach.",
        "Plant and swing both arms up and over the net, reaching high into the other side.",
        "Land balanced and square. Do it to both pins, focusing on a square finish."
      ],
      cues: [
        "Swing your arms like a hitter to add height and cover more distance.",
        "Get your body square to the net before you take off. Never drift sideways in the air.",
        "It's a big move, but land balanced and sealed, not flying down the net."
      ],
      easier: "Use a normal slide-and-crossover block first. Only add the arm swing once the footwork is square and solid.",
      harder: "Time the swing block to a live hitter's approach at both pins, closing a tight double each time.",
      videoSearchUrl: v("Swing Blocking Footwork")
    },

    // ===================== DEFENSE =====================
    {
      id: "defensive-base-and-read",
      name: "Defensive Base and Read",
      skill: "Defense",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 4,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Defenders learn to start in their base spot, then read the hitter and move to where they need to be as the attack develops. The whole idea: be stopped and reading right when the hitter contacts the ball.",
      steps: [
        "Defenders start in their base spots as the ball is set to a hitter.",
        "As the hitter approaches, defenders read where the set is and what the hitter's arm is doing.",
        "They move to their read spot and get stopped and low just before the hit.",
        "The coach hits or tips, the defenders dig from a balanced stance, then reset."
      ],
      cues: [
        "Be stopped and low at the exact moment the hitter contacts the ball.",
        "Read the hitter's shoulders and hand, not just the ball.",
        "Move while the ball is being set, set your feet on the swing. Never dig while moving."
      ],
      easier: "Use down-balls to set spots so defenders can groove the base-to-read movement.",
      harder: "Hit live from different spots so defenders have to read and adjust every rally.",
      videoSearchUrl: v("Defensive Base and Read")
    },
    {
      id: "libero-dig-and-run-through",
      name: "Libero Dig and Run-Through",
      skill: "Defense",
      ageMin: 13, ageMax: 18,
      difficulty: 4,
      minPlayers: 2,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "A libero or defensive specialist works on digging hard balls and running through short balls and tips to keep them alive. This builds the range and control a back-row leader brings.",
      steps: [
        "A coach mixes hard-driven balls at the defender with soft tips short.",
        "On hard balls, the defender digs high and to the middle from a low, stopped stance.",
        "On tips, the defender runs through the ball, playing it up while moving forward.",
        "Focus on getting the dig high so a teammate can turn it into an attack."
      ],
      cues: [
        "Be low and stopped for the hard ball. Explode forward for the tip.",
        "Run through short balls — play them up while you're still moving, don't stop and reach.",
        "Dig the ball high and toward the middle so your team has a chance to counter."
      ],
      easier: "Split the two skills up: do a set of hard digs, then a set of tip run-throughs.",
      harder: "Mix hard balls, tips, and roll shots so the libero has to read and cover the whole area.",
      videoSearchUrl: v("Libero Dig and Run-Through")
    }

  ];

  RR.drills = (RR.drills || []).concat(more);
})(window.RR);
