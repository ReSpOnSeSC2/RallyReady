// drills-5.js — RallyReady drill library DATA (Part 5 of 9).
//
// PURE DATA ONLY. Youth fundamentals, ball-control games, and small-sided games.
// Plain coach English. Real, standard drills and lead-up games. CONCATENATES onto
// RR.drills. LINKS standard applies.
window.RR = window.RR || {};

(function (RR) {
  "use strict";

  var v = RR.drillVideoSearch || function (name) {
    return "https://www.youtube.com/results?search_query=" +
      encodeURIComponent("how to " + name + " volleyball");
  };

  var more = [

    // ===================== WARMUP (youth coordination) =====================
    {
      id: "ball-handling-relay",
      name: "Ball-Handling Relay Race",
      skill: "Warmup",
      ageMin: 8, ageMax: 14,
      difficulty: 1,
      minPlayers: 6,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "cones"],
      setup: "Split a young group into relay teams. Players race down and back while controlling the ball a certain way. It builds ball skills and energy at the same time, and kids love it.",
      steps: [
        "Put a turnaround cone a short distance away for each team.",
        "The first player bumps the ball to themselves down to the cone and back, then hands off.",
        "Round two: set the ball to yourself the whole way. Round three: bounce and catch it.",
        "First team with everyone done wins the round. Play a few rounds with new challenges."
      ],
      cues: [
        "Control first, speed second. If you drop it, start that leg over.",
        "Move your feet to stay under the ball.",
        "Cheer your teammates on and keep the energy up."
      ],
      easier: "Let the youngest players carry the ball or bounce and catch it so everyone has success.",
      harder: "Make players get a set number of clean touches each way, or add a tricky ball-handling move.",
      videoSearchUrl: v("Ball-Handling Relay Race")
    },
    {
      id: "partner-toss-mirror",
      name: "Partner Toss and Mirror",
      skill: "Warmup",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 2,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "Partners warm up their hand-eye coordination and feet with easy tosses and copying each other, before any real hitting or passing. It calms nerves and gets young players touching a ball.",
      steps: [
        "Partners toss a ball back and forth, calling each other's name on every catch.",
        "Add a step: toss it, shuffle to a spot, then catch the one coming back.",
        "One partner leads simple moves — squat, reach, hop — and the other copies while holding the ball.",
        "Finish with soft tosses that the partner catches on a frozen passing platform."
      ],
      cues: [
        "Watch the ball all the way into your hands.",
        "Move your feet to the ball. Don't reach for it.",
        "Talk and have fun. This is the wake-up, not the workout."
      ],
      easier: "Stand closer together and use a lighter or beach ball for the youngest players.",
      harder: "Spread out and add a bump to yourself before each catch to start mixing in real contacts.",
      videoSearchUrl: v("Partner Toss and Mirror")
    },

    // ===================== BALL CONTROL =====================
    {
      id: "butterfly-pepper",
      name: "Butterfly Pepper",
      skill: "Ball Control",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 3,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls"],
      setup: "A three-person pepper where players keep rotating through the dig, set, and hit jobs in a loop. It adds movement and talking to regular pepper.",
      steps: [
        "Three players make a triangle: a hitter, a digger, and a setter.",
        "The hitter hits a controlled ball to the digger, who digs it to the setter.",
        "The setter sets the hitter, who hits again. After each cycle, everyone rotates one spot.",
        "Keep the ball under control and the rotation flowing. Count how many clean cycles you get."
      ],
      cues: [
        "Control over power so the next player can make a clean play.",
        "Call your rotation and move to the next spot right after your touch.",
        "Dig to the setter, set to the hitter. Clean touches keep it alive."
      ],
      easier: "Drop the rotation and keep your same job until the rally is smooth.",
      harder: "Speed it up and require three good touches every cycle with no resets.",
      videoSearchUrl: v("Butterfly Pepper")
    },
    {
      id: "pepper-to-zones",
      name: "Pepper to Zones",
      skill: "Ball Control",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls"],
      setup: "Regular pepper, but every hit and dig has to go to a called spot. It sharpens your control and your aim at the same time.",
      steps: [
        "Partners pepper, but the hitter calls a target (left, middle, right) before each hit.",
        "The digger digs the ball up to themselves and sets it back to the hitter's spot.",
        "Take turns calling the target each rally.",
        "Track how many cycles stay on target without a miss."
      ],
      cues: [
        "Aim every touch. Control means you choose where the ball goes.",
        "Quiet arms and hands. Placement beats power here.",
        "Reset to ready after each touch and listen for the next call."
      ],
      easier: "Use only two targets and slow it down so placement comes before speed.",
      harder: "Add tips and sharp angles to the called targets so the arm angle has to be exact.",
      videoSearchUrl: v("Pepper to Zones")
    },
    {
      id: "cooperative-pass-count",
      name: "Team Ball-Control Challenge",
      skill: "Ball Control",
      ageMin: 8, ageMax: 18,
      difficulty: 2,
      minPlayers: 4,
      durationMin: 8,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls"],
      setup: "A group works together to keep one ball alive for as many controlled touches as they can. It builds teamwork and control with one shared goal, and it's a camp favorite because everyone is part of it.",
      steps: [
        "Players make a circle or spread across a small court.",
        "Keep the ball up with legal touches (bumps and sets), counting each one.",
        "If the ball drops, the count starts over and the group tries to beat its record.",
        "Add a rule that no one can touch it twice in a row, so they have to talk."
      ],
      cues: [
        "Call the ball early and loud so two players don't run into each other.",
        "Give the next person an easy, high ball.",
        "It's a team score — help each other keep it alive."
      ],
      easier: "Let players catch every few touches, or allow any control (even a bump to yourself) to keep it going.",
      harder: "Require three touches before it crosses a line, or set a big team target to reach.",
      videoSearchUrl: v("Team Ball-Control Challenge")
    },
    {
      id: "bump-set-self-control",
      name: "Bump and Set to Yourself",
      skill: "Ball Control",
      ageMin: 8, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "Each player keeps the ball up to themselves, switching between a bump and a set, and counts how many in a row they get. A whole group can do this at once.",
      steps: [
        "Bump the ball straight up to a comfortable height.",
        "Set the next one, then bump again — bump, set, bump, set.",
        "Stay under the ball, moving your feet to keep it in front of you.",
        "Count your touches in a row and try to beat your best each round."
      ],
      cues: [
        "Send it straight up so you can stay under it.",
        "Use your arms for the bump and your finger pads for the set.",
        "Small, controlled touches beat big, wild ones."
      ],
      easier: "Catch the ball between touches, or just do bumps to yourself until you've got the rhythm.",
      harder: "Walk around while you bump and set, or set a high number to reach without a drop.",
      videoSearchUrl: v("Bump and Set to Yourself")
    },

    // ===================== DEFENSE (age-8 entry points) =====================
    {
      id: "go-get-it-defense",
      name: "Go-Get-It Ball Chase",
      skill: "Defense",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 2,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "A first defense drill for young players, all about hustle. The coach tosses balls into open space and players chase them down and play them up. It teaches the never-quit mindset before any pressure on technique.",
      steps: [
        "Players start in a ready stance facing the coach.",
        "The coach tosses a ball a few steps away to the left, right, or short.",
        "The player sprints, gets low, and plays it up with their arms or two hands.",
        "Reset to ready and chase the next toss. Keep it fun and high-energy."
      ],
      cues: [
        "Stay low and ready. Explode the second the ball leaves the coach's hands.",
        "Get your feet to the ball, then play it up, not forward.",
        "Every ball is gettable — go get it!"
      ],
      easier: "Toss it closer and let the player catch it first, then play it up, to build confidence.",
      harder: "Toss farther and faster, or roll balls along the floor so they have to sprint and pop it up.",
      videoSearchUrl: v("Go-Get-It Ball Chase")
    },
    {
      id: "bounce-and-dig",
      name: "Bounce-and-Dig Intro",
      skill: "Defense",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "A gentle first dig. The coach bounces a ball high off the floor and the young player digs it as it comes down. Because the ball comes in high and slow, the timing is easy to learn.",
      steps: [
        "The coach bounces a ball hard off the floor so it pops up in front of the player.",
        "The player makes a platform with their arms, gets under the ball, and digs it up to the coach.",
        "Focus on still arms and playing the ball in front of the body.",
        "Move from bounces to soft tosses, then easy down-balls."
      ],
      cues: [
        "Straight arms, thumbs together, and play the ball in front of you.",
        "Let the ball come to your arms. Don't swing at it.",
        "Bend your knees and lift with your legs, not your arms."
      ],
      easier: "Bounce it higher and softer, and let the player catch a few on their arms first.",
      harder: "Make the bounce lower and quicker, then switch to tossed and lightly hit balls.",
      videoSearchUrl: v("Bounce-and-Dig Intro")
    },
    {
      id: "pancake-and-recover",
      name: "Pancake and Recover",
      skill: "Defense",
      ageMin: 9, ageMax: 16,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "Players learn the pancake — sliding one flat hand under the ball so it bounces up off the back of your hand — to save balls dropping in front of them. It's a fun floor-defense move kids enjoy.",
      steps: [
        "From a low position, the coach tosses a ball that will land just in front of the player.",
        "The player reaches out, slides one flat hand to the floor under the ball, and lets it bounce up off their hand.",
        "Pop right back up to a ready stance after the save.",
        "Practice both hands, and slowly toss the ball farther so they have to reach more."
      ],
      cues: [
        "Hand flat and firm on the floor, palm down. The ball bounces off the back of your hand.",
        "Get low early. The pancake is a last resort when you can't get your arms there.",
        "Save it, then get right back up. The rally keeps going."
      ],
      easier: "Start on the knees with a soft toss so players learn the flat-hand timing safely.",
      harder: "Toss farther and quicker so players have to lay out and pancake at a full stretch, then recover fast.",
      videoSearchUrl: v("Pancake and Recover")
    },

    // ===================== BLOCKING (age-8 entry points) =====================
    {
      id: "reach-over-the-net",
      name: "Reach Over the Net Intro",
      skill: "Blocking",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["net"],
      setup: "A first taste of blocking at a lowered net. Young players just practice reaching tall hands over the net safely. There's no jumping pressure — it's about the hand shape and the idea of taking space over the net.",
      steps: [
        "Stand at a lowered net with your hands up in front of your forehead, fingers spread.",
        "Reach both hands up and over the net and press them flat and firm, thumbs up.",
        "Hold the reach for a second, then bring your hands back to ready without touching the net.",
        "Add a small two-foot hop to reach a little higher as players get comfortable."
      ],
      cues: [
        "Tall, strong hands. Reach over, don't swat.",
        "Thumbs up and fingers spread to make a big wall.",
        "Don't touch the net. Bring your hands straight back down."
      ],
      easier: "Lower the net more and skip the hop. Just work on the reach and the hand shape.",
      harder: "Add the hop and have a partner hold a ball over the net for the blocker to press back.",
      videoSearchUrl: v("Reach Over the Net Intro")
    },
    {
      id: "block-jump-and-land",
      name: "Block Jump and Land Footwork",
      skill: "Blocking",
      ageMin: 10, ageMax: 14,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["net"],
      setup: "Young blockers work on a balanced two-foot block jump and a soft, controlled landing at the net. It builds safe, repeatable habits before adding movement or timing.",
      steps: [
        "Start square to the net with your hands up in front of your chest.",
        "Bend your knees and jump straight up, pressing your hands over the net.",
        "Land softly on two feet in the same spot, knees bent, balanced.",
        "Repeat slowly, keeping your body square and your landing under control."
      ],
      cues: [
        "Jump straight up and come straight down. Don't drift into the net.",
        "Land soft on two feet, knees bent, ready to move.",
        "Stay square to the net the whole time."
      ],
      easier: "Skip the net reach and just practice the jump and the soft 'stick' landing for balance.",
      harder: "Add one slide step before the jump, keeping your body square and your landing balanced.",
      videoSearchUrl: v("Block Jump and Land Footwork")
    },

    // ===================== HITTING (age-8 entry points) =====================
    {
      id: "first-jump-and-hit",
      name: "First Jump-and-Hit",
      skill: "Hitting",
      ageMin: 9, ageMax: 14,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Young players take their first jumping attack: a small two-step approach, a two-foot jump, and a hit on a coach's high toss over a lowered net. It's the bridge from a standing swing to a real spike.",
      steps: [
        "A coach tosses a high, hittable ball near the lowered net.",
        "The hitter takes a small two-step approach to a balanced two-foot jump.",
        "They swing in the air, hitting the ball high and snapping it over the net.",
        "Land softly on two feet and reset. Aim for the open court."
      ],
      cues: [
        "Time your jump so you hit the ball at the top, in front of you.",
        "Two-foot takeoff, fast swing, soft and balanced landing.",
        "Reach high and snap your wrist over the ball."
      ],
      easier: "Take the jump out first and hit standing, then add a small hop once the timing feels right.",
      harder: "Add a full three- or four-step approach and hit a real set instead of a toss.",
      videoSearchUrl: v("First Jump-and-Hit")
    },
    {
      id: "overhand-throw-progression",
      name: "Overhand Throw to Arm Swing",
      skill: "Hitting",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 2,
      durationMin: 8,
      isStaple: true,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Young players throw a ball overhand to learn the exact arm motion of a spike and a serve. Throwing first builds the high-elbow, fast-arm motion long before they can jump and swing.",
      steps: [
        "Partners stand across a lowered net, each with a ball.",
        "Throw the ball overhand hard, leading with a high elbow and finishing with your hand down low.",
        "Throw for distance, then for a target over the net, using your whole body.",
        "Move on to throwing the ball down over the net like a spike, then hitting a self-toss."
      ],
      cues: [
        "High elbow, then a fast arm. Throw it like you're skipping a rock overhand.",
        "Step with your opposite foot and use your whole body.",
        "Finish with your hand low and across your body. That's your spike swing."
      ],
      easier: "Throw a lighter ball a shorter distance, just working on the high elbow and the follow-through.",
      harder: "Throw at specific targets, then swap the throw for a hit off a self-toss using the same arm motion.",
      videoSearchUrl: v("Overhand Throw to Arm Swing")
    },
    {
      id: "standing-spike-target",
      name: "Standing Spike at a Target",
      skill: "Hitting",
      ageMin: 9, ageMax: 14,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net", "cones"],
      setup: "Young hitters take standing swings off a coach's toss, aiming at fun targets on the court. It builds the high arm swing and the idea of placing your hit before you add the approach and jump.",
      steps: [
        "A coach tosses a high, hittable ball near the lowered net.",
        "The hitter swings overhand from a standing position, snapping the ball down at a target.",
        "Put targets — cones, hoops, or spots — on the court to aim at for points.",
        "Rotate hitters and keep a friendly score of targets hit."
      ],
      cues: [
        "Reach high and hit the ball in front of your hitting shoulder.",
        "Snap your wrist to drive the ball down at the target.",
        "Pick a target before you swing. Aim, don't just smash."
      ],
      easier: "Use a big target and a slower, higher toss, and let players hit anywhere in the court at first.",
      harder: "Add a two-step approach and a jump, and make the targets smaller for points.",
      videoSearchUrl: v("Standing Spike at a Target")
    },

    // ===================== PASSING (age-8 entry points) =====================
    {
      id: "toss-and-pass-intro",
      name: "Toss-and-Pass Intro",
      skill: "Passing",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 2,
      durationMin: 8,
      isStaple: true,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "The very first passing rep for young players. A partner tosses an easy ball and the passer bumps it back, learning the platform and where to contact the ball with no pressure.",
      steps: [
        "Partners stand a short distance apart, one with a ball.",
        "The tosser lobs an easy, high ball to the middle of the passer's body.",
        "The passer makes a platform, gets under the ball, and bumps it back to the tosser's hands.",
        "After several good passes, switch jobs."
      ],
      cues: [
        "Straight arms, thumbs together. Hit the ball on your forearms.",
        "Get your feet to the ball and play it in front of you.",
        "Lift with your legs and keep your arms still."
      ],
      easier: "Use a lighter ball, stand closer, and let the passer catch on their arms first.",
      harder: "Toss it a little off to the side so the passer has to move, then pass to a target.",
      videoSearchUrl: v("Toss-and-Pass Intro")
    },
    {
      id: "pass-to-the-coach",
      name: "Pass to the Coach",
      skill: "Passing",
      ageMin: 8, ageMax: 12,
      difficulty: 2,
      minPlayers: 3,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "Young players pass tossed balls to a coach standing at a target spot, learning to aim early. It's a simple station that keeps a group busy and gets lots of reps.",
      steps: [
        "Players line up and a feeder tosses each one an easy ball.",
        "The passer turns their arms and passes the ball to the coach at the target spot.",
        "A pass the coach can catch without moving is a point.",
        "Rotate through the line and keep a team score going."
      ],
      cues: [
        "Point your arms at the coach before the ball even gets to you.",
        "Pass it high and soft so the coach can catch it.",
        "Face your target with your feet, not just your arms."
      ],
      easier: "Stand the coach closer and make the toss the same every time so success comes quickly.",
      harder: "Move the coach to different spots so the passer has to change their arm angle each time.",
      videoSearchUrl: v("Pass to the Coach")
    },

    // ===================== SETTING (age-8 entry points) =====================
    {
      id: "catch-and-set-progression",
      name: "Catch-and-Set Progression",
      skill: "Setting",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 8,
      isStaple: true,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "Young players learn the setting hand shape by catching the ball in a 'window' above their forehead, then pushing it back up. It grooves clean hands before they try to set non-stop.",
      steps: [
        "Hold your hands in a triangle window above your forehead, thumbs and pointer fingers framing a window.",
        "Toss the ball up and catch it softly in that window, fingers spread.",
        "From the catch, push the ball straight back up using your legs and arms together.",
        "Once that feels easy, skip the catch and set it to yourself non-stop."
      ],
      cues: [
        "Make a window with your hands and look through it.",
        "Catch soft with your finger pads, not your palms.",
        "Push with your legs and arms together. Set the ball, don't throw it."
      ],
      easier: "Stay on catch-and-push as long as you need, and use a lighter ball for small hands.",
      harder: "Skip the catch and set non-stop, then set to a partner or a wall.",
      videoSearchUrl: v("Catch-and-Set Progression")
    },
    {
      id: "set-and-catch-game",
      name: "Set-and-Catch Partner Game",
      skill: "Setting",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls"],
      setup: "A friendly youth game. Partners set the ball back and forth and score a point for each clean set the partner can catch in their setting window. It builds clean hands with instant, fun feedback.",
      steps: [
        "Partners stand a short distance apart, one with a ball.",
        "Player one sets the ball to player two, who catches it in their setting window.",
        "A clean, catchable set is a point. Then player two sets back.",
        "Play to a target score, then start a new game and try to beat it."
      ],
      cues: [
        "Set it high and soft so your partner can catch it in the window.",
        "Hands above your forehead, fingers spread, and push with your legs.",
        "A good set is one your partner doesn't have to move for."
      ],
      easier: "Let players catch and then set (catch first, then push), and stand closer together.",
      harder: "Require non-stop sets (no catch) for points, or add a step before each set.",
      videoSearchUrl: v("Set-and-Catch Partner Game")
    },

    // ===================== SERVING (youth / beginner) =====================
    {
      id: "underhand-serve-progression",
      name: "Underhand Serve Progression",
      skill: "Serving",
      ageMin: 8, ageMax: 13,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 8,
      isStaple: true,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "The first serve every young player should own — a reliable underhand serve. It builds a steady contact and the confidence of getting the ball over before moving on to overhand.",
      steps: [
        "Stand with your opposite foot forward, holding the ball on your open hand at waist height.",
        "Make a firm fist (or flat hand) with your hitting hand and swing it back.",
        "Step and swing your hitting hand forward, hitting the bottom-back of the ball off your hand.",
        "Follow through toward your target over the net. Start close and move back as you get more over."
      ],
      cues: [
        "Hold the ball still — don't toss it. Just swing and hit it off your hand.",
        "Hit the bottom of the ball with a firm fist, and step toward your target.",
        "Swing like a pendulum, low to high, and follow through at the net."
      ],
      easier: "Move very close to the net and use a lighter ball so every serve makes it over.",
      harder: "Move back to the full distance and serve to a called half of the court for accuracy.",
      videoSearchUrl: v("Underhand Serve Progression")
    },
    {
      id: "serve-and-sprint",
      name: "Serve and Sprint to Defense",
      skill: "Serving",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Servers serve, then sprint onto the court to a defensive spot. This trains the real sequence of serving and then getting ready to play defense, and it adds some conditioning to serving reps.",
      steps: [
        "The server serves a tough ball over the net to a target.",
        "Right after they hit it, they sprint onto the court to their back-row defensive spot.",
        "A coach sends a ball in so the server has to get stopped and ready to dig.",
        "Rotate servers and focus on a quick, controlled move from serving to defense."
      ],
      cues: [
        "Finish your serve, then get on the court fast. You're a defender the second you serve.",
        "Be stopped and low at your spot before the next ball comes.",
        "Serve tough but in, then move with a purpose."
      ],
      easier: "Skip the dig and just practice serving and sprinting to the right spot.",
      harder: "Add a full rally after the serve so the server serves, transitions, and plays out the point.",
      videoSearchUrl: v("Serve and Sprint to Defense")
    },

    // ===================== TEAM PLAY / GAMES (small-sided + camp) =====================
    {
      id: "one-v-one-short-court",
      name: "1v1 Short Court",
      skill: "Team Play",
      ageMin: 10, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 12,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "A one-on-one game on a small court (half court or a short box) where every ball is yours. It gives a ton of touches and control work, and you only need two players, so it's great for stations or small groups.",
      steps: [
        "Mark a small court on each side of the net, about half-court deep.",
        "Players rally one-on-one, controlling the ball to themselves and sending it back over.",
        "Require at least two touches (a dig-set or pass-set) before sending it over.",
        "Play short games to a low number and switch opponents to keep it competitive."
      ],
      cues: [
        "Every ball is yours, so control it to yourself first.",
        "Use two touches: settle the ball, then send a smart one over.",
        "Move your feet. On a small court, position is everything."
      ],
      easier: "Let players bump to themselves and catch to make rallies longer, and shrink the court more.",
      harder: "Require three touches, make the court bigger so players cover more ground, or add a serve to start.",
      videoSearchUrl: v("1v1 Short Court")
    },
    {
      id: "two-v-two-deep-court",
      name: "2v2 Deep Court Doubles",
      skill: "Team Play",
      ageMin: 12, ageMax: 18,
      difficulty: 4,
      minPlayers: 4,
      durationMin: 14,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Two-on-two on a full or deep court, where each player has to pass, set, and attack. It's the most demanding small game for ball control, talking, and all-around skill.",
      steps: [
        "Two teams of two play on a full-depth court, starting each rally with a serve.",
        "Require three touches per side: pass, set, attack.",
        "Players have to cover the whole court together, calling every ball.",
        "Play rally scoring to a short number and switch partners between games."
      ],
      cues: [
        "Three touches every time — pass, set, attack — even under pressure.",
        "Talk all the time. With two players, communication wins rallies.",
        "Cover the court as a pair, one up and one back as the play develops."
      ],
      easier: "Shrink the court, let players catch-and-set, and start with a toss instead of a serve.",
      harder: "Use the full court, make players attack a real ball (no free-ball returns) to score, and serve tough.",
      videoSearchUrl: v("2v2 Deep Court Doubles")
    },
    {
      id: "speedball",
      name: "Speedball",
      skill: "Team Play",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 8,
      durationMin: 14,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "A fast, non-stop scrimmage where the coach throws in a new ball the second a rally ends, so there's no standing around. It packs in a huge number of reps and some conditioning.",
      steps: [
        "Two teams play a normal rally, but the coach has a cart of balls ready.",
        "The moment a ball is dead, the coach throws in a new one, switching sides each time.",
        "Teams have to reset instantly. There's no break between rallies.",
        "Play to a target score or for a set time. The non-stop pace is the point."
      ],
      cues: [
        "Reset to your base spot right away. The next ball is already coming.",
        "Talk early and cover. Speedball punishes slow transitions.",
        "Stay sharp the whole time. Focus and conditioning win this game."
      ],
      easier: "Slow the ball entry down and toss easy free balls so teams can keep up while they learn to transition.",
      harder: "Speed up the entries, mix in hard-driven and free balls, and require a kill to score.",
      videoSearchUrl: v("Speedball")
    },
    {
      id: "hot-potato-ball-control",
      name: "Hot Potato Ball Control",
      skill: "Team Play",
      ageMin: 8, ageMax: 14,
      difficulty: 1,
      minPlayers: 6,
      durationMin: 10,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls"],
      setup: "A lively youth circle game. Players keep the ball moving with quick controlled touches, and nobody wants to be the one who lets it drop. It builds control and talking, with lots of laughs at camp.",
      steps: [
        "Players make a circle and keep the ball up with bumps and sets.",
        "Each player calls the name of who they're sending it to before they touch it.",
        "If the ball drops, that player gets a letter (H-O-T) and the ball restarts.",
        "Keep it fast and fun. Play until someone spells the word, or for a set time."
      ],
      cues: [
        "Call a name before you send it so your teammate is ready.",
        "Give an easy, high ball. Help the next player keep it alive.",
        "Quick feet and ready hands. Don't let it hit the floor."
      ],
      easier: "Let players catch and toss instead of a real touch, and make the circle smaller.",
      harder: "Require players to alternate a bump then a set, or give them less time to react.",
      videoSearchUrl: v("Hot Potato Ball Control")
    },

    // ===================== COOLDOWN =====================
    {
      id: "partner-stretch-and-reflect",
      name: "Partner Stretch and Reflect",
      skill: "Cooldown",
      ageMin: 8, ageMax: 18,
      difficulty: 1,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: [],
      setup: "Partners help each other through some gentle stretches while they each share one thing that went well and one thing to work on. It closes practice with recovery and a little team connection.",
      steps: [
        "Pair players up and move through calf, hamstring, quad, and shoulder stretches together.",
        "Hold each stretch 20 to 30 seconds, breathing slowly, with partners helping each other balance.",
        "Each player shares one thing that went well today and one thing to work on.",
        "Finish with a team huddle and a cheer to end on a good note."
      ],
      cues: [
        "Stretch to a gentle pull, never to pain, and breathe through each hold.",
        "Help your partner balance, and give both sides the same time.",
        "Be honest and kind when you reflect — name a win and a goal."
      ],
      easier: "Make the holds shorter and keep the stretches standing and simple for younger groups.",
      harder: "Hold longer and add a fuller set of stretches, with partners naming a specific technique goal.",
      videoSearchUrl: v("Partner Stretch and Reflect")
    }

  ];

  RR.drills = (RR.drills || []).concat(more);
})(window.RR);
