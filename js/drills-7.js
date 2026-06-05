// drills-7.js — RallyReady drill library DATA (Part 7 of 9).
//
// PURE DATA ONLY. Conditioning, advanced setting/serving, coverage defense, and
// pressure games. Plain coach English. Real, standard drills. CONCATENATES onto
// RR.drills. LINKS standard applies.
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
      id: "bodyweight-shoulder-activation",
      name: "Bodyweight Shoulder Activation",
      skill: "Warmup",
      ageMin: 8, ageMax: 18,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 5,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: [],
      setup: "A shoulder warm-up that needs no gear — just your own body. It wakes up the shoulder before all the overhead hitting and serving, which helps keep it healthy. Works anywhere, for any group.",
      steps: [
        "Big slow arm circles forward, then backward, starting small and getting bigger.",
        "Swing your arms across your body, hugging yourself, then open your chest wide.",
        "Make a goal-post shape with your arms and slide them up and down.",
        "Finish with 10 slow shoulder-blade squeezes, pinching your shoulder blades together."
      ],
      cues: [
        "Move slowly and feel your shoulder warming up. No fast, jerky swings.",
        "Squeeze your shoulder blades. Don't shrug your shoulders up to your ears.",
        "Use the full range — all the way up and around."
      ],
      easier: "Keep the circles small and the count low for younger players or sore shoulders.",
      harder: "Add a light resistance band or a few scapular push-ups for more.",
      videoSearchUrl: v("Bodyweight Shoulder Activation")
    },
    {
      id: "line-touch-conditioning",
      name: "Line-Touch Conditioning",
      skill: "Warmup",
      ageMin: 12, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: [],
      setup: "Court-line sprints (suicides) build the start-and-stop conditioning volleyball needs. Use it as a sharp finish to a warm-up or a short conditioning block. The court's own lines are all you need.",
      steps: [
        "Start on the end line. Sprint to the near attack line, touch it, and sprint back.",
        "Then to the center line and back, then the far attack line, then the far end line.",
        "Touch every line low with your hand and change direction sharply.",
        "Rest fully between rounds. Quality sprints beat tired jogging."
      ],
      cues: [
        "Touch the line low and explode back the other way.",
        "Slow down under control, then speed up hard. That's the real skill.",
        "Full effort, then full rest. This is sharp, not a slog."
      ],
      easier: "Use fewer lines and longer rest, or jog the way back to build up slowly.",
      harder: "Add a defensive shuffle or backpedal section, and time the rounds to chase a target.",
      videoSearchUrl: v("Line-Touch Conditioning")
    },

    // ===================== BALL CONTROL =====================
    {
      id: "wall-set-and-pass-combo",
      name: "Wall Set-and-Pass Combo",
      skill: "Ball Control",
      ageMin: 10, ageMax: 16,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "wall"],
      setup: "A solo wall drill that switches between a set and a pass against the wall, mixing both touches into one steady rep. It builds the ability to switch between your hands and your arms on the fly.",
      steps: [
        "Stand a few feet from a wall and set the ball at it.",
        "Let the rebound drop and pass it back to the wall with your arms.",
        "Set the next rebound, then pass the next — set, pass, set, pass.",
        "Count how many clean ones you string together and try to beat your best."
      ],
      cues: [
        "Read the rebound height: high ball, set it; low ball, pass it.",
        "Move your feet to stay under each touch.",
        "Quiet hands for the set, still arms for the pass."
      ],
      easier: "Do all sets for a while, then all passes, before mixing the two.",
      harder: "Step farther from the wall and switch faster, or add a quarter-turn between touches.",
      videoSearchUrl: v("Wall Set-and-Pass Combo")
    },
    {
      id: "mini-court-cooperative-rally",
      name: "Mini-Court Cooperative Rally",
      skill: "Ball Control",
      ageMin: 10, ageMax: 16,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Partners work together to keep a rally going over a low net on a small court, trying for a high count instead of trying to win. It builds control and the habit of giving your partner a ball they can play.",
      steps: [
        "Two players (or pairs) face off over a low net on a short court.",
        "Rally together, sending easy, playable balls back and forth.",
        "Count every successful crossing as a shared score.",
        "Add a rule that each side has to touch the ball twice before sending it over."
      ],
      cues: [
        "Send a ball your partner can play. Control, not winners.",
        "Two touches a side: settle it, then send a good one over.",
        "Move your feet and keep the rally calm and alive."
      ],
      easier: "Lower the net, shrink the court, and let players catch to reset long rallies.",
      harder: "Require three controlled touches per side and grow the court so players cover more ground.",
      videoSearchUrl: v("Mini-Court Cooperative Rally")
    },
    {
      id: "rapid-fire-control",
      name: "Rapid-Fire Control",
      skill: "Ball Control",
      ageMin: 13, ageMax: 18,
      difficulty: 4,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls"],
      setup: "A feeder quickly tosses balls a player has to control back, one after another with almost no rest. It builds ball control, footwork, and staying calm at a fast, tiring pace.",
      steps: [
        "A feeder stands close with a cart or armful of balls.",
        "The feeder tosses balls quickly to different spots.",
        "The player controls each one back to the feeder with a pass or set, then resets right away.",
        "Go for a set number of reps or a time block, then rest and switch."
      ],
      cues: [
        "Reset to ready the second you finish a touch.",
        "Move your feet fast. Control beats speed, but you need both here.",
        "Stay calm as you get tired. Clean touches even when you're worn out."
      ],
      easier: "Slow the feed down and toss closer so the player can keep up while they build control.",
      harder: "Speed it up, spread the targets out, and mix passes and sets so the player has to choose.",
      videoSearchUrl: v("Rapid-Fire Control")
    },

    // ===================== PASSING =====================
    {
      id: "serve-receive-intro-easy",
      name: "Serve-Receive Intro (Easy Serves)",
      skill: "Passing",
      ageMin: 10, ageMax: 14,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "A first taste of serve receive for younger players. Slow, friendly serves from a short distance, so passers learn to track a served ball and pass it to a target without getting overwhelmed.",
      steps: [
        "A server serves easy, loopy serves from inside the court.",
        "The passer reads the serve, moves behind it, and passes to a target by the net.",
        "Build confidence with makeable serves before adding any speed or distance.",
        "Rotate passers and slowly move the server back as the passing gets better."
      ],
      cues: [
        "Watch the serve off the hand and move early to get behind it.",
        "Be stopped and balanced before you pass.",
        "Pass it high to the target so a setter could run an offense off it."
      ],
      easier: "Toss the ball over the net instead of serving, so the path is slow and easy to read.",
      harder: "Serve from the full distance with float serves and pass to a small target.",
      videoSearchUrl: v("Serve-Receive Intro (Easy Serves)")
    },
    {
      id: "overhead-emergency-pass",
      name: "Overhead Emergency Pass",
      skill: "Passing",
      ageMin: 13, ageMax: 18,
      difficulty: 4,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "When a serve comes in high and tight to your body, taking it with your hands is faster and more accurate than dropping to your arms. This trains older passers to choose and make the overhead pass.",
      steps: [
        "A server serves high, deep balls that arrive around head height.",
        "The passer takes the ball with firm, clean hands above their forehead and pushes it to target.",
        "Focus on a legal, clean touch — quick and firm, not a long hold.",
        "Mix in high and low serves so the passer chooses hands or arms correctly."
      ],
      cues: [
        "High serve, high hands. Firm and clean, push it to target.",
        "Get under the ball and touch it above your forehead.",
        "Don't hold it. Quick, even hands, then to the setter spot."
      ],
      easier: "Toss high balls so the passer grooves the clean overhead touch before facing real serves.",
      harder: "Serve deep float serves at head height and require an accurate, legal overhead pass to a small target.",
      videoSearchUrl: v("Overhead Emergency Pass")
    },

    // ===================== SETTING =====================
    {
      id: "setter-triangle-continuous",
      name: "Setter Triangle (3-Player)",
      skill: "Setting",
      ageMin: 10, ageMax: 16,
      difficulty: 2,
      minPlayers: 3,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "Three players make a triangle and set the ball around it non-stop, turning to face each new target. It builds clean hands, footwork, and the habit of squaring up before every set.",
      steps: [
        "Three players stand in a triangle a few steps apart.",
        "Player one sets to player two, who turns, squares up, and sets to player three.",
        "Player three sets back to player one, keeping the triangle flowing.",
        "Reverse the direction on a call so players square up both ways."
      ],
      cues: [
        "Turn and face the next target before you set.",
        "Beat the ball to the spot, then set it from your forehead.",
        "High, soft sets that your teammate doesn't have to chase."
      ],
      easier: "Let players catch and set, and stand closer so younger players can keep the triangle going.",
      harder: "Speed it up, add a back set to reverse direction, and require non-stop (no-catch) sets.",
      videoSearchUrl: v("Setter Triangle (3-Player)")
    },
    {
      id: "back-set-to-the-antenna",
      name: "Back-Set to the Antenna",
      skill: "Setting",
      ageMin: 13, ageMax: 18,
      difficulty: 4,
      minPlayers: 3,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Setters sharpen their back set, delivering a hittable ball right to the right-side antenna. A good back set keeps the offense going both ways and keeps the block guessing.",
      steps: [
        "A feeder passes to the setter at the net target.",
        "The setter back-sets a high, hittable ball to the right-side antenna.",
        "Check where it lands — tight enough to hit, but off the net enough to swing.",
        "Add a right-side hitter so the back set connects to a real attack."
      ],
      cues: [
        "Get all the way under the ball and arch up and back.",
        "Same hands as a front set so the block can't read it.",
        "Put it at the antenna, a little off the net — hittable, not stuck to the net."
      ],
      easier: "Catch and push the back set to feel the motion, and use a big target at the antenna.",
      harder: "Change up the pass location so the setter has to adjust and still put the back set on the antenna.",
      videoSearchUrl: v("Back-Set to the Antenna")
    },
    {
      id: "jump-set-and-dump",
      name: "Jump Set and Dump Attack",
      skill: "Setting",
      ageMin: 15, ageMax: 18,
      difficulty: 5,
      minPlayers: 3,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "An advanced setter weapon: jump to set, but read the defense and 'dump' the second ball over yourself when the block ignores you. It keeps the defense honest and steals easy points.",
      steps: [
        "The setter jumps to set a tossed pass, hands up like they're going to set.",
        "If the block or defense cheats, the setter dumps the ball over with one hand into open court.",
        "If they respect the dump, the setter sets the ball instead.",
        "Mix set and dump so it's a real read every time."
      ],
      cues: [
        "Show the same jump-set look every time, then read and decide.",
        "Dump it to the open spot — usually right behind the block or to a deep corner.",
        "Sell the set. The dump works because you're a real setting threat."
      ],
      easier: "Practice just the dump off a toss, then add the set option once the jump-set is solid.",
      harder: "Run it live with a block and defenders so the setter reads and chooses under pressure.",
      videoSearchUrl: v("Jump Set and Dump Attack")
    },

    // ===================== SERVING =====================
    {
      id: "serving-toss-consistency",
      name: "Serving Toss Consistency",
      skill: "Serving",
      ageMin: 8, ageMax: 16,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "The serve toss is the most overlooked key to a steady serve. Players work on just the toss — no hit — until it lands in the same spot every time. It's the base every good serve is built on.",
      steps: [
        "Hold the ball on your open hand and toss it straight up, just in front of your hitting shoulder.",
        "Let the toss drop and try to catch it (or let it land) in the same spot every time.",
        "Mark a spot on the floor and aim every toss to land there.",
        "Once the toss is repeatable, add your swing back in."
      ],
      cues: [
        "Lift the ball, don't throw it. Low, smooth, and the same every time.",
        "Same spot every toss: just in front of your hitting shoulder.",
        "Little to no spin on the toss."
      ],
      easier: "Toss and catch with two hands first, then move to one-hand tosses.",
      harder: "Toss with your eyes closed and check where it lands, or go straight from toss into a full serve.",
      videoSearchUrl: v("Serving Toss Consistency")
    },
    {
      id: "serving-streak-challenge",
      name: "Serving Streak Challenge",
      skill: "Serving",
      ageMin: 10, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 8,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Players chase their longest streak of made serves in a row, then try to beat it. It's a simple, motivating challenge — great on your own or as a whole-group competition.",
      steps: [
        "Each player serves and counts how many they make in a row.",
        "A miss puts the streak back to zero. The goal is a new personal best.",
        "Track each player's best streak of the day.",
        "Play a group version where the team adds up everyone's best streaks."
      ],
      cues: [
        "Same routine every serve. That's how streaks happen.",
        "Don't get greedy near a record. A safe make keeps the streak alive.",
        "Reset your focus after a miss and start a new streak."
      ],
      easier: "Count any serve that lands in (anywhere), and let players serve from closer.",
      harder: "Make serves only count toward the streak if they hit a target zone, from the full distance.",
      videoSearchUrl: v("Serving Streak Challenge")
    },
    {
      id: "jump-topspin-serve",
      name: "Jump Topspin Serve",
      skill: "Serving",
      ageMin: 15, ageMax: 18,
      difficulty: 5,
      minPlayers: 1,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "The most aggressive serve in the game: a full approach, a high spinning toss, and a hard topspin swing in the air. It's for advanced servers who want an attacking serve that drives down into the court.",
      steps: [
        "Toss the ball high and well in front, with topspin, into the court, as you start your approach.",
        "Take a hitter's approach to a two-foot or one-foot takeoff behind the end line.",
        "Swing hard and snap over the top of the ball, driving topspin down into the court.",
        "Land inside the court, balanced and ready to play defense."
      ],
      cues: [
        "High, spinning toss in front. You're chasing it into the court.",
        "Full arm swing and a hard wrist snap over the top, just like a spike.",
        "Speed your hand up through the ball. This serve is an attack."
      ],
      easier: "Get the toss and a standing topspin serve solid first, then add one step and a small hop.",
      harder: "Serve jump topspin to the deep corners and seams while keeping your make percentage up.",
      videoSearchUrl: v("Jump Topspin Serve")
    },

    // ===================== HITTING =====================
    {
      id: "toss-and-tip",
      name: "Toss and Tip",
      skill: "Hitting",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 2,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Young players learn the tip — a soft, controlled fingertip shot over the net — as their first off-speed attack. It's easy to learn and useful right away, and it teaches placement over power.",
      steps: [
        "A coach tosses a high ball near the lowered net.",
        "The player reaches up and tips the ball over with stiff fingertips to an open spot.",
        "Aim for targets short over the net, then deep in the corners.",
        "Keep your fingers firm so the ball is directed, not pushed or thrown."
      ],
      cues: [
        "Firm fingertips. Guide the ball, don't catch or push it.",
        "Reach high and place it where no one is standing.",
        "Soft and smart beats hard and out."
      ],
      easier: "Tip from a standing reach over a very low net to learn the firm-fingers touch.",
      harder: "Add a small jump and tip around a partner's reaching hands to specific targets.",
      videoSearchUrl: v("Toss and Tip")
    },
    {
      id: "hitting-line-and-cross-targets",
      name: "Hitting Line and Cross Targets",
      skill: "Hitting",
      ageMin: 13, ageMax: 18,
      difficulty: 3,
      minPlayers: 3,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net", "cones"],
      setup: "Hitters work on both the line and the cross-court shot by hitting at called targets off a set. Owning both directions makes a hitter very hard to defend with one block-and-dig look.",
      steps: [
        "Put targets down the line and in the deep cross-court angle.",
        "A setter delivers an outside set, and a coach calls 'line' or 'cross' before the swing.",
        "The hitter approaches and hits the called target with a full swing.",
        "Track makes to each target and rotate hitters."
      ],
      cues: [
        "Hit the line by getting your shoulder around to face it. Hit cross by swinging across.",
        "Use the same approach for both, so you hide which way it's going until your swing.",
        "Full swing to a spot, not just hard into the court."
      ],
      easier: "Hit off a coach's high toss to one target at a time before mixing the calls.",
      harder: "Add a blocker who takes away one shot so the hitter has to hit the open target every time.",
      videoSearchUrl: v("Hitting Line and Cross Targets")
    },
    {
      id: "right-side-opposite-attack",
      name: "Right-Side Opposite Attack",
      skill: "Hitting",
      ageMin: 15, ageMax: 18,
      difficulty: 4,
      minPlayers: 3,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "The opposite hitter attacks from the right side, usually off a back set, swinging across their body to the cross-court angle. It trains the footwork and shots of a position a lot of teams don't use enough.",
      steps: [
        "The hitter starts wide on the right side as the setter back-sets to the antenna.",
        "Approach to the right pin and hit the ball high and in front, line or cross.",
        "Right-handers especially have to get comfortable swinging from the right side.",
        "Add a block so the opposite learns to hit high and use the angle."
      ],
      cues: [
        "Approach to the right pin and stay behind the ball.",
        "Open your shoulders to the cross-court angle. That's your best shot.",
        "Hit high over the block. The right side is a power spot."
      ],
      easier: "Hit off a steady high toss to the right side, no block, just to groove the approach and swing.",
      harder: "Run it off a live back set against a block, mixing line, cross, and a shot off the hands.",
      videoSearchUrl: v("Right-Side Opposite Attack")
    },

    // ===================== BLOCKING =====================
    {
      id: "net-shuffle-footwork-youth",
      name: "Net Shuffle Footwork",
      skill: "Blocking",
      ageMin: 9, ageMax: 14,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["net"],
      setup: "Young blockers learn to move along the net with quick, balanced shuffle steps before adding jumps or timing. It's the footwork base that keeps a blocker square and ready.",
      steps: [
        "Start in the middle of the net with your hands up, ready in front of your chest.",
        "Shuffle a few steps toward one pin, staying square and not crossing your feet.",
        "Shuffle back to the middle, then over to the other pin.",
        "Keep your hands up and your body parallel to the net the whole time."
      ],
      cues: [
        "Shuffle, don't cross your feet. Stay square to the net.",
        "Hands up and ready the whole way. Don't drop them.",
        "Quick, balanced steps. Don't drift into the net."
      ],
      easier: "Move slowly over a short distance, just grooving balanced shuffle steps with your hands up.",
      harder: "Add a small block-jump at each pin, landing square and balanced, then shuffle back.",
      videoSearchUrl: v("Net Shuffle Footwork")
    },
    {
      id: "commit-block-the-middle",
      name: "Commit Block on the Middle",
      skill: "Blocking",
      ageMin: 15, ageMax: 18,
      difficulty: 5,
      minPlayers: 3,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Against a fast middle attack, the blocker 'commits' — jumping with the quick hitter instead of waiting to read. It's an advanced, risky move that takes away a team's quick offense.",
      steps: [
        "The blocker watches the other team's middle and the setter's release.",
        "When they read a quick set, they jump with the middle hitter and press over on the quick.",
        "Time the jump to the hitter, not the ball. Commit early and decisively.",
        "Mix in plays where the quick is a fake, so the blocker learns when committing is worth it."
      ],
      cues: [
        "Jump WITH the quick hitter, not after the set. Commit early.",
        "Press over and seal the middle of the net.",
        "It's a gamble — commit when their quick is hurting you."
      ],
      easier: "Time the commit jump to a coach's steady quick-set toss before reading a live setter.",
      harder: "Read a live setter who mixes the quick with other sets, so the commit is a real decision.",
      videoSearchUrl: v("Commit Block on the Middle")
    },

    // ===================== DEFENSE =====================
    {
      id: "defensive-ready-reaction-game",
      name: "Defensive Ready Reaction Game",
      skill: "Defense",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 3,
      durationMin: 8,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls"],
      setup: "A youth game that rewards a great ready stance and quick reactions. Players score points for digging up balls the coach points to at the last second. It makes the defensive stance fun and turns it into a habit.",
      steps: [
        "Players stand in a low, balanced ready stance in a line or small group.",
        "The coach holds two balls and, at the last second, tosses one to a player's side.",
        "That player reacts, gets to the ball, and plays it up for a point.",
        "Keep a running score and reset to the ready stance after every ball."
      ],
      cues: [
        "Low and balanced, weight forward, hands ready before the ball comes.",
        "Watch the coach's hands and explode the second the ball is tossed.",
        "Play it up, then get right back to your ready stance."
      ],
      easier: "Toss right to players with plenty of warning so they have success and build the habit.",
      harder: "Toss quickly to either side and farther away so players have to read and sprint to dig.",
      videoSearchUrl: v("Defensive Ready Reaction Game")
    },
    {
      id: "backcourt-spike-coverage",
      name: "Backcourt Spike Coverage",
      skill: "Defense",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 3,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Back-row defenders learn where to stand and how to dig a hard spike from deep in the court, covering the line and the deep cross-court angle. It's the heart of staying alive against big hitters.",
      steps: [
        "Put defenders deep, with one on the line and one in the deep cross angle.",
        "A coach or hitter attacks hard from a pin, and defenders hold their deep spots.",
        "Defenders dig the hard ball high to the middle from a low, stopped base.",
        "Switch the attack between line and angle so defenders own both."
      ],
      cues: [
        "Be deep and stopped. Hard spikes are dug from a low, set base.",
        "Take the ball where you are. Let the speed of the spike do the work.",
        "Dig high and toward the middle so a teammate can transition."
      ],
      easier: "Down-ball from the box at a controlled speed so defenders groove the deep positioning.",
      harder: "Hit live and hard from both pins, mixing line and angle so defenders have to read the placement.",
      videoSearchUrl: v("Backcourt Spike Coverage")
    },
    {
      id: "off-the-block-cover",
      name: "Off-the-Block Cover",
      skill: "Defense",
      ageMin: 13, ageMax: 18,
      difficulty: 4,
      minPlayers: 4,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "When your own hitter gets blocked, the team has to cover — swarming in low and close to dig the ball that bounces off the block back onto your side. It's a hustle skill that turns blocked attacks into second chances.",
      steps: [
        "A hitter attacks into a block so the ball bounces back onto the hitter's side.",
        "Teammates drop low and close in around the hitter to cover the rebound.",
        "Defenders play the blocked ball up to the setter to run another attack.",
        "Repeat so players learn to cover on every swing, not just react after."
      ],
      cues: [
        "On every attack, your teammates get low and close to cover.",
        "Expect the block. Be ready to dig the ball that comes straight back down.",
        "Play the cover ball UP so you get another swing."
      ],
      easier: "Toss balls off the block by hand at a slow speed so players learn the low cover spots.",
      harder: "Run it live with a real block so the covers happen at game speed off actual blocked balls.",
      videoSearchUrl: v("Off-the-Block Cover")
    },

    // ===================== TEAM PLAY / GAMES =====================
    {
      id: "two-touch-mini-volley",
      name: "Two-Touch Mini Volley",
      skill: "Team Play",
      ageMin: 8, ageMax: 12,
      difficulty: 1,
      minPlayers: 4,
      durationMin: 12,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "A small-court game for young players that makes each side touch the ball exactly twice — a pass and a send-over — so they learn to control the first ball before sending it. It's the bridge from catch games to real volleyball.",
      steps: [
        "Small teams play on a shrunk court with a lowered net.",
        "Each side has to touch the ball twice before sending it over (pass, then send).",
        "Let them catch the first ball at first, then make it a real bump.",
        "Play rally scoring to a low number and rotate often."
      ],
      cues: [
        "First touch to yourself or a teammate, second touch over. Always two.",
        "Call the ball so you don't both go for it.",
        "Control first, then send a good ball over."
      ],
      easier: "Let them catch the first contact and throw it over for brand-new players.",
      harder: "Require three touches (pass, set, send) and add a serve to start each rally.",
      videoSearchUrl: v("Two-Touch Mini Volley")
    },
    {
      id: "king-of-the-court-doubles",
      name: "King of the Court Doubles",
      skill: "Team Play",
      ageMin: 13, ageMax: 18,
      difficulty: 4,
      minPlayers: 6,
      durationMin: 16,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "A doubles version of king of the court where each pair has to do everything — pass, set, and attack — to hold the scoring side. It's the most skill-demanding small game, and a great test of all-around ability.",
      steps: [
        "Pairs rotate through a 'king' (scoring) side and a challenger side, with teams waiting.",
        "A ball is served or tossed in, and you play the rally with three touches a side.",
        "Win on the king side to score and stay. Lose and rotate off for a waiting pair.",
        "Challengers who win cross over to become the new kings. Play to a target score."
      ],
      cues: [
        "Three touches every rally. Doubles rewards control and teamwork.",
        "Cover the whole court as a pair and talk on every ball.",
        "You only score as the kings, so win that side."
      ],
      easier: "Play triples instead of doubles and let players toss the ball in so rallies last longer.",
      harder: "Require a serve to start and an attacked ball to score, on a full-size court.",
      videoSearchUrl: v("King of the Court Doubles")
    },
    {
      id: "comeback-pressure-game",
      name: "Comeback Pressure Game",
      skill: "Team Play",
      ageMin: 14, ageMax: 18,
      difficulty: 4,
      minPlayers: 12,
      durationMin: 16,
      isStaple: false,
      isGame: true,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "A 6v6 game that starts with the score already uneven — one team trailing late in a set — so players practice the focus and calm it takes to come back from behind. It builds toughness for tight endings.",
      steps: [
        "Start a 6v6 game with one team already behind, like down 18-21, playing to 25.",
        "Play it out with normal rally scoring from that score.",
        "The trailing team has to string points together to come back and win.",
        "Reset and switch which team starts behind so both practice the comeback."
      ],
      cues: [
        "One point at a time. Comebacks are built, not rushed.",
        "Serve and pass tough. Under pressure, the basics win.",
        "Stay calm and loud. The team that talks claws back."
      ],
      easier: "Start with a smaller deficit so comebacks happen a lot while the habit forms.",
      harder: "Start further behind and add a price for losing so the pressure is real.",
      videoSearchUrl: v("Comeback Pressure Game")
    },
    {
      id: "bonus-ball-scramble",
      name: "Bonus-Ball Scramble",
      skill: "Team Play",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 8,
      durationMin: 14,
      isStaple: false,
      isGame: true,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "A scrimmage where the coach can surprise the teams by tossing in a 'bonus ball' the second the first one is dead, forcing an instant scramble. It sharpens focus, talking, and never relaxing until the whistle.",
      steps: [
        "Teams play a normal rally to its end.",
        "At random, instead of stopping, the coach tosses in a bonus ball to one side.",
        "Teams have to instantly transition and play the bonus ball out for the point.",
        "Keep score like normal. The surprise bonus balls keep everyone alert."
      ],
      cues: [
        "It's never over until the whistle. Reset to your base spot right away.",
        "Talk and find your spots the moment a bonus ball shows up.",
        "Stay alert. The bonus ball punishes a team that relaxes."
      ],
      easier: "Call out the bonus ball before tossing it so teams can get ready while they learn to transition.",
      harder: "Toss bonus balls fast and at the worst-positioned team, and chain two bonus balls together.",
      videoSearchUrl: v("Bonus-Ball Scramble")
    },

    // ===================== COOLDOWN =====================
    {
      id: "guided-breathing-and-reflection",
      name: "Guided Breathing and Reflection",
      skill: "Cooldown",
      ageMin: 10, ageMax: 18,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: [],
      setup: "A calm way to end practice: slow guided breathing to bring the heart rate down, then a short reflection on the session. It builds focus and a positive team feel.",
      steps: [
        "Players sit or stand comfortably and breathe in for four counts, out for six.",
        "Repeat the slow breathing for several rounds to settle the body and mind.",
        "Each player quietly names one thing they did well and one thing to work on next time.",
        "Share a few out loud, then close with a team cheer."
      ],
      cues: [
        "Make your breath out longer than your breath in. That's what settles you down.",
        "Reflect honestly and kindly — celebrate the effort, set a goal.",
        "End calm, focused, and positive."
      ],
      easier: "Keep it short — about a minute of breathing and one positive thought each.",
      harder: "Add a quick picture-it-in-your-head of a skill goal, and have each player commit to one focus.",
      videoSearchUrl: v("Guided Breathing and Reflection")
    }

  ];

  RR.drills = (RR.drills || []).concat(more);
})(window.RR);
