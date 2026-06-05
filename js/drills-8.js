// drills-8.js — RallyReady drill library DATA (Part 8 of 9).
//
// PURE DATA ONLY. Difficulty-ramp fillers across every skill, plus the last of
// the de-duped drills (Reading the Server, Bump-Setting from Deep, Seated Passing
// Control, Partner Down-Ball Digging, Light Cool-Down Game). Plain coach English.
// Real, standard drills. CONCATENATES onto RR.drills. LINKS standard applies.
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
      id: "mini-band-lateral-walks",
      name: "Mini-Band Lateral Walks",
      skill: "Warmup",
      ageMin: 10, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 5,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["mini bands"],
      setup: "A small resistance band around your legs wakes up the hips and glutes that power your jump and protect your knees. It's a quick prep that fires up the muscles defenders and hitters lean on.",
      steps: [
        "Put a mini band just above your knees (or around your ankles) and get into a low athletic stance.",
        "Step sideways with control, keeping the band tight, for several steps each way.",
        "Add short forward and backward 'monster walks', keeping your knees pushed out.",
        "Finish with a set of banded squats, pushing your knees out over your toes."
      ],
      cues: [
        "Push your knees out against the band the whole time.",
        "Stay low in your stance. Don't bob up and down.",
        "Go slow and controlled. Feel your hips and glutes working."
      ],
      easier: "Use a lighter band or no band, just working on the low stance and knees-out position.",
      harder: "Use a heavier band and add a couple of banded side hops for power.",
      videoSearchUrl: v("Mini-Band Lateral Walks")
    },
    {
      id: "animal-movement-warmup",
      name: "Animal Movement Warm-Up",
      skill: "Warmup",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: [],
      setup: "A fun youth warm-up using animal moves — bear crawls, crab walks, frog hops — to build coordination, strength, and flexibility while kids are smiling. Fun first, and the fitness sneaks in.",
      steps: [
        "Bear crawl (hands and feet, hips low) down to a line and back.",
        "Crab walk (belly up, push through your heels) back the other way.",
        "Frog hops: squat low and hop forward with a soft landing.",
        "Finish with inchworms, walking your hands out to a plank and back."
      ],
      cues: [
        "Move under control — strong and steady, not a race.",
        "Land soft on the frog hops with your knees bent.",
        "Keep your belly tight so the moves stay smooth."
      ],
      easier: "Make the distances shorter and let players go at their own pace. Pick two moves to start.",
      harder: "Add longer distances, a sideways bear crawl, and a hold at the end of each inchworm.",
      videoSearchUrl: v("Animal Movement Warm-Up")
    },

    // ===================== BALL CONTROL =====================
    {
      id: "continuous-cross-court-control",
      name: "Continuous Cross-Court Control",
      skill: "Ball Control",
      ageMin: 13, ageMax: 18,
      difficulty: 4,
      minPlayers: 2,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Advanced partners keep a controlled rally going across the net using a full dig-set-attack on every ball, but only in the cross-court lane. It demands real control at game speed — a great Peak-week test.",
      steps: [
        "Two players (or pairs) rally cross-court over the net.",
        "Each side has to control the ball with a dig (or pass), a set, and a controlled attack back.",
        "Keep every ball in the cross-court lane so the rally stays demanding and repeatable.",
        "Count long rallies. A miss starts the count over."
      ],
      cues: [
        "Three controlled touches every time, even at speed.",
        "Dig to yourself, set, then a controlled attack. No wild swings.",
        "Keep it cross-court. Being precise is the whole point."
      ],
      easier: "Let players send a free ball instead of an attack, or make the target lane wider so rallies last.",
      harder: "Add a line you have to stay in or a tip you have to mix in, and push the pace toward full speed.",
      videoSearchUrl: v("Continuous Cross-Court Control")
    },
    {
      id: "defensive-pepper",
      name: "Defensive Pepper",
      skill: "Ball Control",
      ageMin: 14, ageMax: 18,
      difficulty: 4,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls"],
      setup: "A tougher pepper where the hitter swings hard, so the digger has to make a real, controlled dig before setting back. It bridges regular pepper and live defense for advanced players.",
      steps: [
        "Partners pepper, but the hitter swings with real speed at the digger.",
        "The digger has to dig the hard ball up under control to themselves.",
        "The digger sets the hitter, who swings hard again.",
        "Keep the rally going with truly hard hits and controlled digs, then switch."
      ],
      cues: [
        "Be low, stopped, and balanced before the hard hit gets there.",
        "Dig it high to yourself, then give a clean set.",
        "Real speed on the hits. This is defense, not a warm-up."
      ],
      easier: "Dial the hitting speed back to firm down-balls until the digs stay controlled.",
      harder: "Speed up the hits and add tips the digger has to read, so they control every speed.",
      videoSearchUrl: v("Defensive Pepper")
    },
    {
      id: "partner-catch-bump-control",
      name: "Seated Passing Control",
      skill: "Ball Control",
      ageMin: 8, ageMax: 14,
      difficulty: 1,
      minPlayers: 2,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "Players sit on the floor and pass the ball back and forth. Sitting down takes the legs and footwork out of it, so they can put all their focus on a clean, still platform. It's a classic teaching drill.",
      steps: [
        "Two players sit on the floor a few feet apart, facing each other.",
        "They pass the ball back and forth using just their forearms.",
        "Focus on straight arms, thumbs together, and still arms that aim the ball.",
        "Count your clean passes in a row, then move up to kneeling, then standing."
      ],
      cues: [
        "Straight, still arms. Let your platform aim the ball — no swinging.",
        "Angle your arms right at your partner.",
        "Hit the ball on your forearms, not your hands or wrists."
      ],
      easier: "Sit closer together and let players catch between passes until their arms stay still.",
      harder: "Move to kneeling, then standing, keeping the same quiet, accurate platform.",
      videoSearchUrl: v("Seated Passing Control")
    },

    // ===================== PASSING =====================
    {
      id: "self-pass-count",
      name: "Self-Pass Count",
      skill: "Passing",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "Each young player passes the ball straight up to themselves over and over, counting their clean touches. It's a simple solo rep, and a whole group can do it at once.",
      steps: [
        "Pass the ball straight up to yourself to a steady height.",
        "Stay under it, moving your feet, and pass it up again.",
        "Count how many clean passes you get without catching or losing it.",
        "Try to beat your best each round."
      ],
      cues: [
        "Send it straight up so you can stay under it.",
        "Straight, still arms. Let the platform do the work.",
        "Small, controlled passes beat big, wild ones."
      ],
      easier: "Let players catch every few touches, or pass against a wall so it keeps coming back.",
      harder: "Pass higher, take a step between touches, or alternate a high pass and a low one.",
      videoSearchUrl: v("Self-Pass Count")
    },
    {
      id: "mid-court-passing-decision",
      name: "Reading the Server",
      skill: "Passing",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Passers learn to guess where a serve is going by watching the server's stance, toss, and shoulders before they even hit it. The earlier you read the serve, the more time you have to get behind it.",
      steps: [
        "Passers watch the server's setup and call out 'deep', 'short', 'left', or 'right' as the server tosses.",
        "After they call it, the passer reacts and passes the actual serve to a target.",
        "Compare the calls to where the serves really go, to sharpen the read.",
        "Switch servers and passers, and mix up the serves so the clues change."
      ],
      cues: [
        "Watch the server, not just the ball. The toss and shoulders give it away.",
        "Read early and move early. Guessing right buys you time.",
        "Commit to your read, then adjust to the ball."
      ],
      easier: "Have the server make their setup obvious and say nothing, so passers learn the clear clues first.",
      harder: "Use tricky servers and tougher serves so the read has to be quick and the move athletic.",
      videoSearchUrl: v("Reading the Server")
    },
    {
      id: "passing-box-drill",
      name: "Passing Box Drill",
      skill: "Passing",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 4,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls"],
      setup: "Four players make a box and pass around and across it, sending the ball to different targets. It teaches passers to angle their arms exactly. It's a steady, control-heavy pattern.",
      steps: [
        "Four players stand at the corners of a box, one with a ball.",
        "Pass to the player on your right, who passes across to the diagonal, and so on.",
        "Each player has to angle their arms to send the ball to the right corner.",
        "Reverse the pattern on a call so players angle both directions."
      ],
      cues: [
        "Set your arm angle to your target before you touch the ball.",
        "Point your hips toward where you're passing.",
        "High, controlled passes your teammate can handle easily."
      ],
      easier: "Pass only to the corner next to you and let players catch to reset until the pattern is smooth.",
      harder: "Add a second ball going the other way so players track and angle under pressure.",
      videoSearchUrl: v("Passing Box Drill")
    },

    // ===================== SETTING =====================
    {
      id: "setting-figure-eight-footwork",
      name: "Bump-Setting from Deep",
      skill: "Setting",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "When a pass is too low, too far, or spinning to set cleanly with your hands, you deliver the second ball with a controlled forearm 'bump-set'. It's a must-have skill so the offense keeps running when things go wrong.",
      steps: [
        "A feeder tosses awkward, low, or deep balls that can't be hand-set cleanly.",
        "The player squares up to the target and bump-sets a high, hittable ball with their arms.",
        "Aim the bump-set to the outside pin, high enough for a hitter to time it.",
        "Do it from different spots so players bump-set while moving."
      ],
      cues: [
        "Square your arms to the target before you touch the ball.",
        "Bump it high and to the pin so the hitter gets a catchable ball.",
        "Control over power. A bump-set is all about placement."
      ],
      easier: "Toss higher, slower balls so players groove the arm angle before adding movement.",
      harder: "Feed faster, deeper balls so players have to chase and still bump-set on target to the pin.",
      videoSearchUrl: v("Bump-Setting from Deep")
    },
    {
      id: "right-side-back-set-footwork",
      name: "Right-Side Back-Set Footwork",
      skill: "Setting",
      ageMin: 13, ageMax: 18,
      difficulty: 3,
      minPlayers: 3,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Setters work on the footwork to release to the net and back-set to the right side, getting their body lined up so the back set is accurate and hidden. It's the movement piece behind a two-sided offense.",
      steps: [
        "The setter starts in their release spot and moves to the net target.",
        "Set the feet so the right shoulder lines up to back-set toward the right antenna.",
        "Deliver a back set, focusing on the footwork that makes it repeatable.",
        "Switch between front and back sets so the setup looks the same for both."
      ],
      cues: [
        "Get all the way to the target before you set — feet first.",
        "Same body setup for front and back so the block can't read it.",
        "Square up so the back set goes to the antenna, not just backward."
      ],
      easier: "Work off a tossed, steady pass and just focus on the footwork to the target.",
      harder: "Change up the pass so the setter adjusts the footwork and still puts the back set on target.",
      videoSearchUrl: v("Right-Side Back-Set Footwork")
    },

    // ===================== SERVING =====================
    {
      id: "serving-for-distance",
      name: "Serving for Distance",
      skill: "Serving",
      ageMin: 10, ageMax: 16,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Players build the leg drive and contact to serve from farther back, slowly adding distance and power while keeping the serve in. It's the bridge between just getting it over and serving with some authority.",
      steps: [
        "Start at a distance where your serves go over comfortably.",
        "Use your legs and a full arm swing to serve with a little more power.",
        "After a few solid serves, take a big step back and do it again.",
        "Find the farthest spot where you can still serve it in consistently."
      ],
      cues: [
        "Drive with your legs and step into the serve for power.",
        "Full, smooth swing. The power comes from your whole body, not just your arm.",
        "Keep it in. Distance with control, not distance with misses."
      ],
      easier: "Stay closer and only take small steps back as your power and consistency grow.",
      harder: "Serve from the full end line at targets, mixing distance with accuracy.",
      videoSearchUrl: v("Serving for Distance")
    },
    {
      id: "two-zone-serving",
      name: "Two-Zone Serving",
      skill: "Serving",
      ageMin: 11, ageMax: 16,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "A first step toward serving accuracy: players aim at just two big targets — the left half and the right half of the court. It's simple enough to have success at, and it builds the habit of serving on purpose.",
      steps: [
        "Split the far court into a left half and a right half.",
        "A coach calls a half before each serve.",
        "The server adjusts their stance and shoulders and serves to the called half.",
        "Track makes to each half and switch which half is called."
      ],
      cues: [
        "Point your serving shoulder toward the half you want.",
        "Aim for the middle of that half so you have the most room for error.",
        "Same smooth serve. Just change where you face."
      ],
      easier: "Use deep vs. short halves, or serve from mid-court so makes come easily.",
      harder: "Shrink it to the six zones and require a make to a called zone before moving on.",
      videoSearchUrl: v("Two-Zone Serving")
    },
    {
      id: "pre-serve-routine",
      name: "Pre-Serve Routine and Ritual",
      skill: "Serving",
      ageMin: 12, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Players build a steady pre-serve routine — the same breaths, ball bounces, and target focus every time — so they can serve calmly under pressure. It's the mental skill that keeps a serve together late in a tight set.",
      steps: [
        "Each player makes a short, repeatable routine, like: deep breath, two bounces, pick a target.",
        "They run that exact routine before every serve in practice.",
        "A coach can add pressure (a count, a small price for a miss) so the routine gets tested.",
        "Players keep the routine the same whether the serve is easy or high-stakes."
      ],
      cues: [
        "Same routine every serve. That sameness calms your nerves.",
        "Breathe, see your target, then serve. Don't rush.",
        "Trust the routine, especially when it matters."
      ],
      easier: "Keep the routine to one breath and one look at the target while it becomes a habit.",
      harder: "Add real pressure (game point, a price for a miss) so the routine holds up under stress.",
      videoSearchUrl: v("Pre-Serve Routine and Ritual")
    },

    // ===================== HITTING =====================
    {
      id: "hitting-off-a-bad-set",
      name: "Hitting Off a Bad Set",
      skill: "Hitting",
      ageMin: 13, ageMax: 18,
      difficulty: 3,
      minPlayers: 3,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Real sets are hardly ever perfect, so hitters learn to adjust their approach and contact to tight, off, and low sets and still get a good swing or shot. It turns broken plays into points.",
      steps: [
        "A coach delivers imperfect sets — tight to the net, off the net, too low, too fast.",
        "The hitter adjusts their approach and contact to handle each one.",
        "On sets they can't really hit, the hitter picks a smart shot, like a roll or a high, deep ball.",
        "Mix good and bad sets so hitters adjust on the fly."
      ],
      cues: [
        "Adjust your approach to the set. Don't run a fixed pattern into a bad ball.",
        "Tight set: hit high hands or tip it. Off the net: swing big and deep.",
        "A controlled shot off a bad set beats a wild swing or an error."
      ],
      easier: "Use only slightly-off sets so hitters learn to adjust before you give them the worst ones.",
      harder: "Add a block so hitters have to adjust to the bad set and still beat a defense.",
      videoSearchUrl: v("Hitting Off a Bad Set")
    },
    {
      id: "deep-corner-roll-shots",
      name: "Deep-Corner Roll Shots",
      skill: "Hitting",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 3,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net", "cones"],
      setup: "Hitters work on the roll shot — an open-hand, topspin off-speed ball that arcs over the block and drops in the deep corners. It's a high-percentage weapon when a hard swing isn't there.",
      steps: [
        "A coach or setter delivers a hittable ball.",
        "Instead of swinging hard, the hitter rolls the ball with an open hand and a wrist snap.",
        "Aim for the deep corners, arcing the ball over an imaginary or real block.",
        "Switch corners and mix in a hard swing so the roll is hidden."
      ],
      cues: [
        "Open hand, snap your wrist up and over. The topspin makes it drop.",
        "Same approach as a hard swing until the last second.",
        "Aim deep to the corners, behind the block, where the defenders aren't."
      ],
      easier: "Work on the roll-shot contact off a self-toss to a big deep target before adding the approach.",
      harder: "Read a real block and choose roll or swing, placing the roll into smaller corner targets.",
      videoSearchUrl: v("Deep-Corner Roll Shots")
    },
    {
      id: "approach-timing-off-the-pass",
      name: "Approach Timing off the Pass",
      skill: "Hitting",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 4,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Hitters learn to start their approach off the pass and the setter's release, not off the set itself. That's the key to arriving on time for a hittable ball, and it fixes the most common timing mistake young hitters make.",
      steps: [
        "A passer passes to the setter while the hitter waits in the wings.",
        "The hitter starts their approach as the ball reaches the setter's hands.",
        "Time the last steps so the hitter is rising just as the set arrives at the contact point.",
        "Repeat with steady passes, then add small changes so hitters adjust."
      ],
      cues: [
        "Go as the ball reaches the setter, not when you see the set.",
        "Slow to fast: gather, then explode up to meet the ball.",
        "Be on your way up as the set arrives. Don't wait under it."
      ],
      easier: "Use a coach setting a very steady ball so the hitter grooves one repeatable timing.",
      harder: "Change up the pass and set speed so hitters have to read and adjust their start every rep.",
      videoSearchUrl: v("Approach Timing off the Pass")
    },

    // ===================== BLOCKING =====================
    {
      id: "pin-to-pin-blocking-endurance",
      name: "Pin-to-Pin Blocking Endurance",
      skill: "Blocking",
      ageMin: 13, ageMax: 18,
      difficulty: 3,
      minPlayers: 1,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["net"],
      setup: "Blockers shuffle and crossover from one pin to the other and block-jump at each end, over and over. It builds the footwork and the leg endurance a middle blocker needs over a long match.",
      steps: [
        "Start at one pin and block-jump, landing square.",
        "Move to the other pin with a crossover step and block-jump there.",
        "Keep going pin to pin for a set number of blocks, staying square each time.",
        "Rest fully, then repeat. Good footwork matters more than getting tired."
      ],
      cues: [
        "Get square before every jump. Never block while drifting.",
        "Crossover for the long distance and land balanced at the pin.",
        "Press over the net each jump, even as your legs get tired."
      ],
      easier: "Do fewer jumps with more rest so the footwork stays crisp.",
      harder: "Add more reps, have a coach signal which way to go, and time each set.",
      videoSearchUrl: v("Pin-to-Pin Blocking Endurance")
    },
    {
      id: "soft-block-deflection",
      name: "Soft Block Deflection",
      skill: "Blocking",
      ageMin: 13, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "When a blocker can't stuff the ball, an angled 'soft block' deflects hard swings up and back so teammates can dig them. It's a smart, defensive blocking option against big hitters.",
      steps: [
        "A hitter swings from a box, and the blocker jumps with open hands angled slightly back.",
        "The blocker deflects the ball up and back into the court instead of pressing over.",
        "Teammates (or the blocker) then play the deflected ball up.",
        "Mix soft blocks and hard presses so the blocker chooses based on the situation."
      ],
      cues: [
        "Angle your hands back and up — cushion the ball, don't press over.",
        "Soft block when you're late or outmatched. It keeps the ball alive.",
        "Big, open hands. Turn a kill into a dig."
      ],
      easier: "Work on the hand angle on a coach's controlled hit so the deflection goes up and in.",
      harder: "Soft-block live, full-speed swings and connect the deflection to a back-row dig and counter.",
      videoSearchUrl: v("Soft Block Deflection")
    },

    // ===================== DEFENSE =====================
    {
      id: "down-ball-digging-lines",
      name: "Partner Down-Ball Digging",
      skill: "Defense",
      ageMin: 10, ageMax: 16,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls"],
      setup: "Partners take turns hitting controlled down-balls at each other and digging them back. Two players can get a lot of digging reps this way with no coach needed. It's a simple, run-it-yourself defense rep.",
      steps: [
        "One partner stands and hits a controlled down-ball at the other.",
        "The defender digs the ball up high and back to the hitter, who catches it.",
        "After several digs, switch the hitter and the digger.",
        "Keep the hits controlled so the digger can work on a clean, high platform."
      ],
      cues: [
        "Be low and stopped before your partner hits.",
        "Angle your arms to send the dig high and back to them.",
        "Talk, and keep the hits controlled so you both get better."
      ],
      easier: "Toss instead of hit, and stand closer so the digger gets easy, steady reps.",
      harder: "Hit harder and to the digger's sides so they have to move, then dig high and on target.",
      videoSearchUrl: v("Partner Down-Ball Digging")
    },
    {
      id: "lateral-dig-shuffle",
      name: "Lateral Dig Shuffle",
      skill: "Defense",
      ageMin: 11, ageMax: 16,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls"],
      setup: "Defenders shuffle side to side and dig balls tossed or hit to either side, learning to move, stop, and play a controlled ball. It builds the side-to-side range every back-row defender needs.",
      steps: [
        "A feeder stands a few steps away with a supply of balls.",
        "The feeder sends a ball to the defender's left. They shuffle, stop, and dig it up.",
        "Right away the feeder sends one to the right. They shuffle back and dig.",
        "Keep going for a set time, keeping the digs high and controlled."
      ],
      cues: [
        "Shuffle to get behind the ball, then stop and dig. Don't dig on the move.",
        "Stay low the whole time. Only pop up to reset.",
        "Dig high and toward the middle so a teammate can play it."
      ],
      easier: "Toss softer and not as wide so the defender has success while learning to move and stop.",
      harder: "Spread the feeds out and add hard-driven balls so the defender covers more ground at speed.",
      videoSearchUrl: v("Lateral Dig Shuffle")
    },
    {
      id: "roll-the-ball-dig",
      name: "Roll-the-Ball Dig",
      skill: "Defense",
      ageMin: 8, ageMax: 11,
      difficulty: 1,
      minPlayers: 2,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "The gentlest first dig for the youngest players. The coach rolls a ball along the floor and the player gets low to scoop it up with their arms. It teaches getting low and playing the ball in front, with no fear of a hard ball.",
      steps: [
        "The coach rolls a ball slowly along the floor toward the player.",
        "The player gets very low, makes a platform, and lifts the rolling ball up to the coach.",
        "Focus on bent knees, a low body, and playing the ball in front.",
        "Move from rolls to gentle bounces, then soft tosses."
      ],
      cues: [
        "Get low — bend your knees and get your arms down to the floor.",
        "Play the ball in front of you and lift with your legs.",
        "Straight arms, thumbs together, nice and steady."
      ],
      easier: "Roll the ball slowly and right to the player so every rep is a success.",
      harder: "Roll it faster and to the sides so the player has to move low and still dig it up.",
      videoSearchUrl: v("Roll-the-Ball Dig")
    },

    // ===================== TEAM PLAY / GAMES =====================
    {
      id: "free-ball-mini-game",
      name: "Free-Ball Mini Game",
      skill: "Team Play",
      ageMin: 10, ageMax: 16,
      difficulty: 2,
      minPlayers: 6,
      durationMin: 12,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "A small game started by a tossed free ball every rally, so teams get a ton of pass-set-attack transition reps without the difficulty of serving. It's a perfect step toward full play.",
      steps: [
        "Make small teams on a court. A coach tosses an easy free ball to one side to start each rally.",
        "That team passes, sets, and attacks, and you play the rally out.",
        "Score it like normal and switch which side gets the free ball.",
        "Encourage three touches and calling the ball every rally."
      ],
      cues: [
        "Call 'free' and get to your spots as the toss comes over.",
        "Three touches — pass to the setter, set, then attack.",
        "Everybody moves on every ball."
      ],
      easier: "Let players catch-and-set, lower the net, and toss very easy free balls for newer teams.",
      harder: "Mix in free balls and harder down balls, require an attacked ball to score, and grow the court.",
      videoSearchUrl: v("Free-Ball Mini Game")
    },
    {
      id: "volley-tennis",
      name: "Volley Tennis",
      skill: "Team Play",
      ageMin: 8, ageMax: 14,
      difficulty: 2,
      minPlayers: 4,
      durationMin: 12,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "A lead-up game where the ball is allowed to bounce once before each touch, which gives young players time to get to it and play it. It builds movement, control, and game sense at a relaxed, fun pace.",
      steps: [
        "Small teams play over a lowered net. The ball can bounce once before each touch.",
        "Teams use up to three touches a side, with a bounce allowed between them.",
        "Send the ball over with a bump or a set, and score it like volleyball.",
        "Slowly take the bounce away as players get faster to the ball."
      ],
      cues: [
        "Use the bounce to get under the ball and set up a good touch.",
        "Move to the ball early. The bounce gives you time, so use it.",
        "Control first, then send a good ball over."
      ],
      easier: "Allow two bounces and a catch for the youngest players, on a smaller court.",
      harder: "Allow only one bounce, then none, moving toward real volleyball touches.",
      videoSearchUrl: v("Volley Tennis")
    },
    {
      id: "sideout-scoring-game",
      name: "Sideout Scoring Game",
      skill: "Team Play",
      ageMin: 14, ageMax: 18,
      difficulty: 4,
      minPlayers: 12,
      durationMin: 16,
      isStaple: false,
      isGame: true,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "A 6v6 game where only the serve-receiving team can score (a sideout). It puts the pressure on the first-ball offense and the serving team's defense. It trains the sideout game that decides close sets.",
      steps: [
        "One team serves, and the receiving team has to win the rally to side out and score.",
        "If the serving team wins, no point is scored, but they get to serve again.",
        "Receiving teams rotate after a good sideout.",
        "Play to a target, switching serving and receiving roles on a schedule."
      ],
      cues: [
        "The first ball wins. Pass it perfect and run your best attack.",
        "Serving team: serve tough and dig hard to deny the sideout.",
        "Treat every serve-receive like a must-win point."
      ],
      easier: "Give the serving team a point for stops too, so both sides score while learning the format.",
      harder: "Require an attacked ball (no free returns) to side out, and serve aggressively.",
      videoSearchUrl: v("Sideout Scoring Game")
    },

    // ===================== COOLDOWN =====================
    {
      id: "team-circle-recovery",
      name: "Light Cool-Down Game",
      skill: "Cooldown",
      ageMin: 8, ageMax: 16,
      difficulty: 1,
      minPlayers: 4,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "A calm, low-key game to end practice — like a slow-motion rally or a gentle keep-it-up in a circle. It brings the heart rate down and ends on a smile. Recovery that feels like fun, not a chore.",
      steps: [
        "Make a relaxed circle and keep a ball up with easy, gentle touches.",
        "Move slowly and on purpose. The goal is calm control, not winning.",
        "Add a small challenge like 'everyone touches it once' at an easy pace.",
        "Finish with a few slow breaths together to wind all the way down."
      ],
      cues: [
        "Easy and gentle. This is winding down, not ramping up.",
        "Soft, controlled touches. Help your neighbor keep it calm.",
        "Slow your pace and your breathing as you finish."
      ],
      easier: "Let players catch, and keep the circle small and slow for the youngest groups.",
      harder: "Add a gentle movement or a light footwork pattern while keeping it low-key.",
      videoSearchUrl: v("Light Cool-Down Game")
    },
    {
      id: "calf-and-ankle-recovery",
      name: "Calf and Ankle Recovery",
      skill: "Cooldown",
      ageMin: 10, ageMax: 18,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: [],
      setup: "A cooldown aimed at the calves and ankles, which take a pounding from all the jumping and landing in volleyball. A little care here helps prevent the soreness and tweaks that keep players out.",
      steps: [
        "Do a standing calf stretch against a wall, back leg straight, for 30 seconds each side.",
        "Do it again with your back knee slightly bent to reach the lower calf.",
        "Do slow ankle circles and trace the alphabet with each foot.",
        "Finish with gentle heel raises and lowers to pump blood through your calves."
      ],
      cues: [
        "Stretch to a gentle pull and breathe. Never bounce.",
        "Give both sides the same time — calves and ankles both.",
        "Slow and controlled on the heel raises."
      ],
      easier: "Make the holds shorter and lean on a wall or partner for balance.",
      harder: "Hold longer and add a light foam-roll of the calves for deeper recovery.",
      videoSearchUrl: v("Calf and Ankle Recovery")
    }

  ];

  RR.drills = (RR.drills || []).concat(more);
})(window.RR);
