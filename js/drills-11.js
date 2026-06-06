// drills-11.js — RallyReady drill library DATA (Part 11).
//
// PURE DATA ONLY. Equipment-focused drills that deepen the "extras" a coach can
// tick on the Team screen — resistance/mini bands, agility ladder, jump ropes,
// medicine ball, reaction ball, hoops/targets, foam roller, plyo box/step, and
// tumbling mats. Standard, widely-taught drills rewritten in plain coach
// English. Age/difficulty are kept honest: loaded strength, plyometrics and
// diving start at older ages per standard youth long-term development guidance.
// CONCATENATES onto RR.drills. Same schema and LINKS standard as Parts 1–10.
window.RR = window.RR || {};

(function (RR) {
  "use strict";

  var v = RR.drillVideoSearch || function (name) {
    return "https://www.youtube.com/results?search_query=" +
      encodeURIComponent("how to " + name + " volleyball");
  };

  var more = [

    // ===================== RESISTANCE BANDS (Warmup) =====================
    {
      id: "band-pull-aparts",
      name: "Band Pull-Aparts and Rows",
      skill: "Warmup",
      ageMin: 10, ageMax: 18,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["bands"],
      setup: "Each player holds a light resistance band in both hands. This wakes up the upper back and the muscles that hold the shoulder healthy before all the serving and hitting — five minutes that pays off all season.",
      steps: [
        "Hold the band in front of you at chest height, hands shoulder-width apart. Pull your hands apart until the band touches your chest, squeezing your shoulder blades. Do 12.",
        "Anchor the band on something at chest height, step back, and row your elbows past your sides. Do 12.",
        "Hold the band overhead and pull it apart and down behind your head a few inches. Do 10.",
        "Keep every rep slow and controlled — no snapping the band back."
      ],
      cues: [
        "Squeeze your shoulder blades together like you're pinching a pencil between them.",
        "Keep your ribs down and your neck long — don't shrug up to your ears.",
        "Slow on the way back, every time."
      ],
      easier: "Choke up on the band or use a lighter one so 12 clean reps feel easy.",
      harder: "Add a second set, or pause for two seconds at the fully-pulled position on each rep.",
      videoSearchUrl: v("Band Pull-Aparts and Rows")
    },
    {
      id: "band-arm-speed",
      name: "Band-Resisted Hitting Arm Swings",
      skill: "Warmup",
      ageMin: 12, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["bands"],
      setup: "Players loop a band behind them and mimic the hitting arm swing against the resistance, then take a few free swings. This grooves a fast, full arm path and primes the shoulder for hitting and serving.",
      steps: [
        "Anchor a band at about head height behind you (a fence, post, or partner holding it).",
        "Hold the free end in your hitting hand, draw your elbow high and back into the 'bow and arrow' load.",
        "Swing your arm forward fast through the contact point, snapping your wrist at the top. Do 8 controlled reps.",
        "Drop the band and take 5 free arm swings, feeling the same fast, high path."
      ],
      cues: [
        "Elbow high and back to load — don't drop it.",
        "Lead with your elbow, then whip the hand through.",
        "Pull your non-hitting arm down hard to add power."
      ],
      easier: "Use a lighter band and slow the swing down to learn the high-elbow path first.",
      harder: "Add a short approach step before each swing so the whole hitting motion fires in sequence.",
      videoSearchUrl: v("Band-Resisted Hitting Arm Swings")
    },

    // ===================== MINI BANDS (Warmup) =====================
    {
      id: "mini-band-glute-bridges",
      name: "Mini-Band Glute Bridges",
      skill: "Warmup",
      ageMin: 10, ageMax: 18,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["mini bands"],
      setup: "Players loop a mini-band just above their knees and fire up the glutes — the muscles that drive every jump and the deep defensive stance. A simple activation that helps players jump higher and stay healthy.",
      steps: [
        "Lie on your back, knees bent, feet flat, band just above the knees.",
        "Press your knees out against the band and drive your hips up into a bridge. Hold one second at the top. Do 12.",
        "Stay in a low half-squat and step side to side, keeping tension on the band. 8 steps each way.",
        "Keep the knees pressing OUT the whole time — never let them cave in."
      ],
      cues: [
        "Squeeze your backside at the top of every bridge.",
        "Drive your knees out against the band — don't let them collapse inward.",
        "Slow and controlled beats fast and sloppy here."
      ],
      easier: "Drop the band and just do bodyweight bridges to feel the glutes switch on.",
      harder: "Do single-leg bridges, or add a slow three-count lower on each rep.",
      videoSearchUrl: v("Mini-Band Glute Bridges")
    },
    {
      id: "mini-band-defensive-shuffle",
      name: "Mini-Band Defensive Shuffle",
      skill: "Warmup",
      ageMin: 11, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 7,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["mini bands"],
      setup: "A mini-band above the knees turns a normal defensive shuffle into glute and hip work. Players hold a low, strong defensive posture and move side to side — building the base that good defense is played from.",
      steps: [
        "Loop the band above the knees and sink into a low defensive stance, chest up, hands ready.",
        "Shuffle five steps to the right, keeping tension on the band and your feet wide.",
        "Shuffle five steps back to the left without standing up between.",
        "Add a forward-and-back shuffle in a small box pattern. Keep it to short, sharp sets."
      ],
      cues: [
        "Stay low the whole time — no popping up and down as you move.",
        "Push the floor away with the trail leg; don't click your heels together.",
        "Knees out, weight on the balls of your feet, eyes forward like you're reading a hitter."
      ],
      easier: "Use a lighter band or shorter shuffles, and slow the tempo to hold a clean stance.",
      harder: "On a coach's point, change direction instantly — read and react while the band fights you.",
      videoSearchUrl: v("Mini-Band Defensive Shuffle")
    },

    // ===================== AGILITY LADDER (Warmup) =====================
    {
      id: "ladder-lateral-quicksteps",
      name: "Agility Ladder Lateral Quicksteps",
      skill: "Warmup",
      ageMin: 8, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 7,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["agility ladder"],
      setup: "Players move sideways through the ladder to build the quick lateral feet that passing and defense live on. Face the same way the whole trip so it trains true side-to-side movement.",
      steps: [
        "Stand sideways at one end of the ladder. Step both feet into the first box (in-in), then both feet out the far side (out-out). Travel the whole ladder this way.",
        "Come back the other direction so both sides get the work.",
        "Next trip: do a quick lateral 'two-in, one-out' carioca-style pattern down the ladder.",
        "Finish each trip by sliding three quick shuffle steps past the end of the ladder."
      ],
      cues: [
        "Light and fast on the balls of your feet — quiet feet, not stomps.",
        "Stay low in a passing posture; don't stand up tall as you move.",
        "Eyes up the whole time, like you're tracking a served ball."
      ],
      easier: "Walk the pattern slowly first, and just use the in-in-out-out step for younger players.",
      harder: "Add a partner toss to pass at the end of the ladder, so quick feet flow straight into a contact.",
      videoSearchUrl: v("Agility Ladder Lateral Quicksteps")
    },
    {
      id: "ladder-to-dig-reaction",
      name: "Ladder-to-Dig Reaction",
      skill: "Warmup",
      ageMin: 11, ageMax: 18,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["agility ladder", "balls"],
      setup: "Quick feet only matter if they lead to a play. Players run a fast ladder pattern, then immediately read a coach toss and dig or pass it — linking footwork to a real contact under a little fatigue.",
      steps: [
        "Set the ladder a few steps in front of a tosser, pointing toward them.",
        "The player runs a quick two-feet-per-box pattern down the ladder.",
        "As they clear the last box, the tosser puts a ball just left or right of them.",
        "The player breaks to it, plays a controlled dig or pass to a target, then jogs back to the line."
      ],
      cues: [
        "Finish the ladder under control — don't fall out of the last box.",
        "Eyes snap up to the tosser the instant you clear the ladder.",
        "Beat the ball to the spot with your feet, then play it square."
      ],
      easier: "Toss straight to the player every time and slow the ladder pattern down.",
      harder: "Make the toss harder to read — short, deep, or wide — so they truly react, not anticipate.",
      videoSearchUrl: v("Ladder-to-Dig Reaction")
    },

    // ===================== JUMP ROPES (Warmup) =====================
    {
      id: "jump-rope-speed-intervals",
      name: "Jump Rope Speed Intervals",
      skill: "Warmup",
      ageMin: 8, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["jump ropes"],
      setup: "Short, fast jump-rope bursts get the heart rate up and build the springy, quick feet and calves that jumping needs. Great as a self-paced warm-up where everyone works at once.",
      steps: [
        "Each player grabs a rope and spreads out with room to swing.",
        "Jump steady for 30 seconds, then rest 30 seconds. Repeat for about 5 rounds.",
        "On the work rounds, stay on the balls of your feet with small, quick hops.",
        "If you trip up, just reset and keep going — the goal is fast, light feet."
      ],
      cues: [
        "Small hops, barely off the floor — quick beats high.",
        "Stay tall and soft in the knees; let your ankles do the springing.",
        "Turn the rope with your wrists, not big arm circles."
      ],
      easier: "Slow the turns down, or step over the rope one foot at a time instead of hopping.",
      harder: "Add faster rounds or mix in a 10-second burst of double-unders or high-knee skips.",
      videoSearchUrl: v("Jump Rope Speed Intervals")
    },
    {
      id: "jump-rope-single-leg",
      name: "Single-Leg Jump Rope",
      skill: "Warmup",
      ageMin: 11, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["jump ropes"],
      setup: "Hopping on one leg at a time builds the stiff, springy ankles and single-leg strength that protect players when they land from a jump. Keep the contacts quick and light.",
      steps: [
        "Start with 20 normal two-foot jumps to find your rhythm.",
        "Switch to 10 hops on your right foot, then 10 on your left.",
        "Then alternate: right, left, right, left, like a quick skip over the rope.",
        "Do a few rounds, keeping every landing soft and balanced."
      ],
      cues: [
        "Land soft and quiet, knee slightly bent — absorb each hop.",
        "Stay tall; don't let your hip collapse to the side.",
        "Quick wrists turn the rope — keep the hops small."
      ],
      easier: "Stick to two-foot jumps, or do single-leg hops without the rope first to build balance.",
      harder: "Increase the reps per leg, or hop forward and back over a line while you skip.",
      videoSearchUrl: v("Single-Leg Jump Rope")
    },

    // ===================== MEDICINE BALL (Warmup) =====================
    {
      id: "med-ball-overhead-slams",
      name: "Medicine Ball Overhead Slams",
      skill: "Warmup",
      ageMin: 13, ageMax: 18,
      difficulty: 3,
      minPlayers: 1,
      durationMin: 7,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["medicine ball"],
      setup: "Older players use a light medicine ball to train the explosive overhead snap that powers serving and hitting. Keep the ball LIGHT and the moves fast — this is about speed, not lifting heavy.",
      steps: [
        "Stand tall holding a light med ball overhead with both hands, core tight.",
        "Snap your trunk forward and slam the ball straight down into the floor as hard as you can.",
        "Catch it on the bounce (or pick it up) and reset to tall. Do 6–8 fast, full-effort reps.",
        "Rest fully between short sets — every slam should be explosive, not tired."
      ],
      cues: [
        "Reach tall first, then crunch your whole body into the slam.",
        "Throw it down like you're spiking through the floor.",
        "Quality over quantity — full power or it's not worth a rep."
      ],
      easier: "Use a lighter ball and a half-effort throw to learn the timing, or do a kneeling slam.",
      harder: "Step into each slam, or add a rotational slam to one side to mirror the serve.",
      videoSearchUrl: v("Medicine Ball Overhead Slams")
    },
    {
      id: "med-ball-chest-pass-wall",
      name: "Medicine Ball Chest Pass",
      skill: "Warmup",
      ageMin: 12, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["medicine ball", "wall"],
      setup: "Explosive two-hand chest passes into a wall build the pushing power setters and blockers use. A partner can replace the wall. Keep the ball light and the throws snappy.",
      steps: [
        "Stand a few feet from a sturdy wall, holding a light med ball at your chest.",
        "Push the ball hard into the wall, fully extending your arms, and catch the rebound.",
        "Stay in an athletic stance and fire 10 quick passes.",
        "Then turn it into a quick overhead 'set' push to the wall for 10 more, mimicking a set."
      ],
      cues: [
        "Push from your chest and finish with your fingers, like a strong set.",
        "Stay balanced — don't fall toward the wall.",
        "Catch soft and reload fast for the next push."
      ],
      easier: "Stand closer and use a lighter ball so 10 clean reps feel smooth.",
      harder: "Step back for a longer, harder pass, or do them off one foot to add balance demand.",
      videoSearchUrl: v("Medicine Ball Chest Pass")
    },

    // ===================== REACTION BALL (Warmup / Defense) =====================
    {
      id: "reaction-ball-scramble",
      name: "Reaction Ball Defensive Scramble",
      skill: "Defense",
      ageMin: 11, ageMax: 18,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 7,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["reaction ball"],
      setup: "A lumpy reaction ball bounces unpredictably, so players must read late and scramble — exactly the skill emergency defense needs. One partner feeds, the other defends in a low stance.",
      steps: [
        "Defender sets up in a low, ready defensive posture facing their partner.",
        "The feeder bounces the reaction ball hard on the floor toward the defender.",
        "The defender reads the crazy bounce, moves their feet, and catches it low with two hands.",
        "Go in short bursts of 6–8 catches, then switch jobs."
      ],
      cues: [
        "Stay low with your weight forward — you can't react fast standing tall.",
        "Move your feet to the ball, then reach; don't lunge from a planted stance.",
        "Reset to ready the instant you've made the play."
      ],
      easier: "Bounce the ball softer and more directly so the bounce is easier to read.",
      harder: "Feed faster, add a second ball, or have the defender start facing away and turn on a call.",
      videoSearchUrl: v("Reaction Ball Defensive Scramble")
    },
    {
      id: "reaction-ball-wall-singles",
      name: "Reaction Ball Wall Singles",
      skill: "Warmup",
      ageMin: 10, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["reaction ball"],
      setup: "A solo reaction-ball warm-up: throw a reaction ball against a wall and catch the unpredictable rebound. Sharpens the eyes, hands and first step before practice — no partner needed.",
      steps: [
        "Stand a few feet from a wall in a low, ready stance, reaction ball in hand.",
        "Throw it firmly at the wall low so it ricochets off at a random angle.",
        "Track the bounce, shuffle to it, and catch it cleanly with two hands.",
        "Repeat for 6–8 catches, staying light on your feet the whole time."
      ],
      cues: [
        "Eyes lock onto the ball off the wall — don't look away.",
        "First move is your feet, then your hands.",
        "Stay low and springy between catches, never flat-footed."
      ],
      easier: "Throw softer and let it bounce on the floor first so the path is easier to follow.",
      harder: "Throw harder and closer to the wall, or catch with only your dominant hand.",
      videoSearchUrl: v("Reaction Ball Wall Singles")
    },

    // ===================== HOOPS / TARGETS =====================
    {
      id: "serve-into-the-hoops",
      name: "Serving Accuracy to Targets",
      skill: "Serving",
      ageMin: 9, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "hoops"],
      setup: "Lay hoops (or rope rings / floor targets) in the serving zones across the court. Players serve to hit a hoop, turning serving from 'just get it in' into aiming at a real spot — the difference between a serve and a weapon.",
      steps: [
        "Place 3–4 hoops in key spots: the two deep corners and the seams between zones.",
        "Players serve from the end line, calling which hoop they're aiming for before each serve.",
        "A serve that lands in or touches the called hoop is a hit; track makes out of 10.",
        "Rotate which hoop is the 'hot' target every couple of rounds."
      ],
      cues: [
        "Pick your target before you toss — eyes to the hoop, then serve.",
        "Same toss, same contact every time; only your aim point changes.",
        "Deep corners win points — favor the back of the court over the middle."
      ],
      easier: "Use bigger targets or count any serve in the right third of the court as a make.",
      harder: "Shrink the hoops, move them to tougher spots, or require three straight makes to 'clear' a hoop.",
      videoSearchUrl: v("Serving Accuracy to Targets")
    },
    {
      id: "pass-to-the-hoop-target",
      name: "Passing Accuracy to a Target",
      skill: "Passing",
      ageMin: 9, ageMax: 18,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "hoops"],
      setup: "Place a hoop on the floor at the setter's target (right-front, near the net). Passers must pass the ball up and into the airspace above the hoop, giving them a clear, visible target for a good pass.",
      steps: [
        "Set a hoop on the floor where the setter stands, just off the net in right-front.",
        "A tosser or server sends a ball to the passer.",
        "The passer plays a high, soft pass that comes down into the hoop's airspace.",
        "Count passes that drop into or touch the hoop; go 10 reps, then rotate."
      ],
      cues: [
        "Angle your platform toward the target, not just up.",
        "High and soft beats hard and flat — give the setter time.",
        "Quiet feet to the ball, then a still, steady platform."
      ],
      easier: "Use a bigger hoop or move the passer closer; count balls that land near the hoop.",
      harder: "Pass from a real serve, add movement before the pass, or require the ball to peak at a set height.",
      videoSearchUrl: v("Passing Accuracy to a Target")
    },
    {
      id: "setter-hoop-stations",
      name: "Setting Accuracy to Targets",
      skill: "Setting",
      ageMin: 11, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "hoops"],
      setup: "Hang or hold hoops at the heights and spots where good sets arrive — outside, middle, and back-set. Setters deliver balls through the hoops to dial in accurate, repeatable sets to every hitter.",
      steps: [
        "Place a hoop target outside (left-front) and one for the back-set (right-front), at set height.",
        "A tosser gives the setter a ball near the net.",
        "The setter sets the ball through or just over the called hoop.",
        "Alternate front-set and back-set targets; track makes out of 10 to each."
      ],
      cues: [
        "Get your feet there and face your target before the set.",
        "Same hand position front and back — hide the back-set.",
        "Set to the same window every time; consistency is the whole point."
      ],
      easier: "Use one closer, larger target and let the setter catch-and-set to groove the path.",
      harder: "Add a real pass to set off of, shrink the hoops, or call the target late so they adjust.",
      videoSearchUrl: v("Setting Accuracy to Targets")
    },
    {
      id: "hit-the-target-zones",
      name: "Hitting to Target Zones",
      skill: "Hitting",
      ageMin: 11, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net", "hoops"],
      setup: "Lay hoops on the far court in the spots smart hitters aim for — the deep corner, the seam, and the sharp cross-court angle. Hitters swing to land the ball in a hoop, learning to hit a SPOT, not just hit hard.",
      steps: [
        "Place 2–3 hoops on the opposite court: deep line, deep cross, and the short cross angle.",
        "A coach or setter feeds the hitter a set at the pins.",
        "The hitter approaches and swings to land the ball in or near the called hoop.",
        "Score makes out of 10; rotate the 'live' target each round."
      ],
      cues: [
        "See the open floor before you swing — eyes find the hoop in the air.",
        "Use your shoulder and wrist to aim; don't just muscle it.",
        "Hit the deep corners — that's where points live."
      ],
      easier: "Hit off a toss or off a box, use bigger targets, and let players swing at controlled speed.",
      harder: "Add a blocker so the hitter must read and pick the open hoop, or shrink the targets.",
      videoSearchUrl: v("Hitting to Target Zones")
    },
    {
      id: "target-serve-challenge",
      name: "Target Serve Challenge",
      skill: "Serving",
      ageMin: 10, ageMax: 18,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 10,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "hoops"],
      setup: "A fast, competitive serving game built around hoop targets in the corners and seams. Players or teams race to claim targets by serving into them — pressure that makes serving practice feel like a game.",
      steps: [
        "Place numbered hoops in the deep corners and seams of the receiving court.",
        "Split into two teams on opposite end lines, or play solo for a personal score.",
        "Each player serves in turn, calling a hoop. A make claims that hoop's points for the round.",
        "First team to a target score (say 15), or the highest personal total, wins. Reset and rerun."
      ],
      cues: [
        "Pick the smart target — claim the easy corner before going for the risky seam.",
        "Under pressure, trust your normal serve; don't suddenly swing harder.",
        "Reset and breathe before every serve — one ball at a time."
      ],
      easier: "Use bigger targets and give every in-court serve a point so it stays encouraging.",
      harder: "Make a missed serve hand a point to the other team, raising the cost of an error.",
      videoSearchUrl: v("Target Serve Challenge")
    },

    // ===================== FOAM ROLLER (Cooldown) =====================
    {
      id: "foam-roller-leg-reset",
      name: "Foam Roller Leg Reset",
      skill: "Cooldown",
      ageMin: 11, ageMax: 18,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["foam roller"],
      setup: "A guided foam-roll of the big leg muscles to wind down after all the jumping and moving. Slow and easy — this helps players recover and come back fresher next session.",
      steps: [
        "Roll the front of the thighs (quads): support on your forearms and roll slowly from hip to just above the knee. About 30 seconds.",
        "Roll the calves: sit with the roller under one calf, cross the other leg on top for weight, and roll slowly. 30 seconds each side.",
        "Roll the outside of the hip and thigh gently, pausing on any tender spots and breathing.",
        "Keep every pass slow — count to three up, three back."
      ],
      cues: [
        "Go slow; rolling fast does nothing. Find a sore spot and pause there.",
        "Breathe and relax into it — don't tense up against the roller.",
        "Never roll directly on a joint or the back of the knee."
      ],
      easier: "Put less weight on the roller (keep more on your hands and feet) so the pressure is gentle.",
      harder: "Pause longer on tight spots and add small ankle pumps while the roller sits on the calf.",
      videoSearchUrl: v("Foam Roller Leg Reset")
    },
    {
      id: "foam-roller-upper-back",
      name: "Foam Roller Upper-Back Release",
      skill: "Cooldown",
      ageMin: 11, ageMax: 18,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["foam roller"],
      setup: "Serving and hitting work the upper back and shoulders hard. This gentle roll opens the upper back and chest to keep the hitting shoulder healthy — a calm way to finish practice.",
      steps: [
        "Lie back with the roller across your upper back, knees bent, feet flat, hands supporting your head.",
        "Lift your hips slightly and roll slowly between your shoulder blades and mid-back. 30 seconds.",
        "Pause at a tight spot, then gently arch back over the roller for a breath or two to open the chest.",
        "Finish with a few slow shoulder rolls and a deep breath."
      ],
      cues: [
        "Keep the roller on your upper back — never roll your lower back.",
        "Support your head with your hands so your neck stays relaxed.",
        "Move slowly and breathe out as you arch."
      ],
      easier: "Skip the arch and just roll slowly and lightly between the shoulder blades.",
      harder: "Hold the gentle arch a little longer on each tight spot, reaching your arms overhead.",
      videoSearchUrl: v("Foam Roller Upper-Back Release")
    },

    // ===================== PLYO BOX / STEP =====================
    {
      id: "box-step-ups-approach",
      name: "Box Step-Ups for Approach Power",
      skill: "Warmup",
      ageMin: 12, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 7,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["box"],
      setup: "Controlled step-ups onto a sturdy box or step build the single-leg drive that powers a hitting approach and a higher jump. Strength first — keep it slow and clean before any jumping.",
      steps: [
        "Stand facing a knee-height, stable box or step.",
        "Drive one foot onto the box and stand tall, bringing the other knee up to hip height. Hold a beat.",
        "Lower slowly back down under control — no flopping down.",
        "Do 8 each leg, leading with the same foot you plant on in your approach."
      ],
      cues: [
        "Push through your whole foot on the box, knee tracking over your toes.",
        "Stand tall and balanced at the top — own it before you come down.",
        "Slow on the way down builds the most strength."
      ],
      easier: "Use a lower step and skip the knee drive, just stepping up and down under control.",
      harder: "Add a hop at the top (drive the up-knee into a small jump) once the strength is solid.",
      videoSearchUrl: v("Box Step-Ups for Approach Power")
    },
    {
      id: "box-depth-jump-landings",
      name: "Box Depth Drops and Stick",
      skill: "Warmup",
      ageMin: 13, ageMax: 18,
      difficulty: 3,
      minPlayers: 1,
      durationMin: 7,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["box"],
      setup: "Older players step off a low box and 'stick' a soft, balanced two-foot landing. This teaches the safe landing mechanics that protect knees and ankles from all the jumping in volleyball. Keep the box LOW and the reps few.",
      steps: [
        "Stand on a low box (knee height or below).",
        "Step off — don't jump off — and land on two feet at the same time.",
        "Land soft and quiet, hips back, knees bent and tracking over your toes, and 'stick' it for a full second.",
        "Do small sets of 5 with full rest. Every landing must be controlled, not tired."
      ],
      cues: [
        "Land like a feather, not a thud — absorb it.",
        "Knees over toes, never caving inward.",
        "Stick and hold — if you stumble, lower the box."
      ],
      easier: "Lower the box, or skip it and practice squat-jump-and-stick landings on the floor first.",
      harder: "Once landings are rock-solid, add an immediate jump straight up out of the stick (a true depth jump).",
      videoSearchUrl: v("Box Depth Drops and Stick")
    },
    {
      id: "box-block-reach",
      name: "Step-Up Block Reach",
      skill: "Blocking",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 1,
      durationMin: 7,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["box", "net"],
      setup: "Shorter or younger blockers stand on a low, stable step at the net so they can feel a full, penetrating block at game height — pressing their hands over and across the net the way a real block should.",
      steps: [
        "Set a low, sturdy step right at the net (a coach or partner steadies it).",
        "The blocker stands on the step in blocking posture, hands up and ready by their ears.",
        "On a coach's call, they press both hands up, over, and across the net, fingers spread and firm.",
        "Hold the press for a beat, then reset hands. Do 8–10 controlled reaches."
      ],
      cues: [
        "Press your hands OVER the net and angle them into the court — surround the ball.",
        "Strong, firm hands; fingers spread, thumbs up.",
        "Reach forward, not just up — penetrate the other side."
      ],
      easier: "Stand on the floor and just practice the hand press and shape without the height.",
      harder: "Add a coach holding a ball over the net to block, or a small jump off the floor next to the net.",
      videoSearchUrl: v("Step-Up Block Reach")
    },

    // ===================== TUMBLING MATS (Defense / recovery) =====================
    {
      id: "mat-floor-defense-progression",
      name: "Mat Floor-Defense Progression",
      skill: "Defense",
      ageMin: 11, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["mats"],
      setup: "A soft tumbling mat takes the fear out of going to the floor, so players can learn emergency defense the safe way. Build the roll and sprawl on the mat first, then they'll trust it on the court.",
      steps: [
        "Start on the mat from a low kneeling position. Practice rolling over one shoulder (rounded back) and popping back up.",
        "Move to a low squat: step out to one side and let your momentum carry you into a controlled roll on the mat.",
        "Then practice a sprawl — extend forward, chest toward the mat, catching yourself softly on your hands and forearms.",
        "Keep tosses out of it at first; this stage is all about safe, confident technique."
      ],
      cues: [
        "Round your back and roll over the shoulder — never land flat on your spine.",
        "Stay relaxed; tension is what gets people hurt going to the floor.",
        "Get up fast every time — finish on your feet, ready."
      ],
      easier: "Stay on the knees and just learn the shoulder roll slowly until it feels natural.",
      harder: "Add a soft toss to chase before the roll or sprawl, then move it off the mat onto the court.",
      videoSearchUrl: v("Mat Floor-Defense Progression")
    },
    {
      id: "mat-sprawl-and-pursuit",
      name: "Sprawl and Pursuit on the Mat",
      skill: "Defense",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["mats", "balls"],
      setup: "With a mat as a safe landing zone, players chase a short ball, extend to dig it, and sprawl onto the mat. This trains all-out pursuit on tips and short balls without the fear of the hard floor.",
      steps: [
        "Lay a mat in front of the defender. A tosser stands a few steps away with balls.",
        "The tosser drops a short ball just in front of the defender (a 'tip').",
        "The defender explodes forward, gets a hand or platform under the ball, and sprawls onto the mat.",
        "Pop up immediately. Do 6–8 reps, then switch roles."
      ],
      cues: [
        "Read short early and GO — beat the ball, don't wait for it.",
        "Get something under it, even one hand, then let your body follow to the mat.",
        "Catch yourself soft on the mat and bounce straight back to your feet."
      ],
      easier: "Toss the ball higher and closer so players can get there before sprawling.",
      harder: "Toss shorter and to either side so they truly sprint and read, then move it onto the court.",
      videoSearchUrl: v("Sprawl and Pursuit on the Mat")
    },
    {
      id: "mat-diving-extension",
      name: "Diving Extension on Mats",
      skill: "Defense",
      ageMin: 13, ageMax: 18,
      difficulty: 3,
      minPlayers: 1,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["mats", "balls"],
      setup: "For older, ready players: a tumbling mat is the safe place to learn the full extension dive (pancake) for balls you can't get any other way. Master the soft landing on the mat before ever trying it on the court.",
      steps: [
        "Start low on the mat. Practice extending forward onto your hands, sliding your body down chest-to-mat with elbows giving way softly.",
        "Add the pancake: lay the back of one hand flat on the mat so a ball can rebound off it.",
        "Now have a coach roll or toss a ball just out of reach; extend, slide the hand under it, and let your body land soft on the mat.",
        "Keep reps low and quality high. Stop the moment form gets sloppy or tired."
      ],
      cues: [
        "Hand to the floor under the ball first — the dive serves the hand.",
        "Land chest and hips together and slide; don't crash down on your knees or elbows.",
        "Only dive when nothing else will reach it — it's a last resort, not a first move."
      ],
      easier: "Stay with the sprawl and pancake from a low position; build the dive over several sessions.",
      harder: "Extend the reach and add genuine pursuit before the dive — then progress it onto the court.",
      videoSearchUrl: v("Diving Extension on Mats")
    },
    {
      id: "mat-mobility-flow",
      name: "Tumbling Mat Mobility Flow",
      skill: "Warmup",
      ageMin: 9, ageMax: 18,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 7,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["mats"],
      setup: "A floor-based mobility warm-up on the mats that opens the hips, back and shoulders before practice. Comfortable on the mat instead of the hard floor, so players actually move through a full range.",
      steps: [
        "Start in a tabletop position and flow through cat-camel: round the back, then gently arch. 6 slow reps.",
        "Move to a low lunge on the mat, reaching the same-side arm to the ceiling and rotating open. Hold and switch.",
        "Sit back into a child's-pose stretch, walking the hands left and right to open the sides.",
        "Finish with slow inchworms: walk the hands out to a plank and back, opening the whole back of the body."
      ],
      cues: [
        "Move with your breath — slow and smooth, not forced.",
        "Reach a little further each rep as you warm up.",
        "This is to feel loose and ready, not to hold long stretches."
      ],
      easier: "Shorten the range on each move and stay with the cat-camel and child's pose.",
      harder: "Add a slow downward-dog to cobra flow, and hold the open lunge rotation a beat longer.",
      videoSearchUrl: v("Tumbling Mat Mobility Flow")
    }

  ];

  RR.drills = (RR.drills || []).concat(more);
})(window.RR);
