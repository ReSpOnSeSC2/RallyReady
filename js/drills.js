// drills.js — the RallyReady drill library DATA (Part 1 of 9).
//
// PURE DATA ONLY: no DOM, no theming, no app logic. This module defines the
// catalog of real volleyball drills the session generator (js/generator.js)
// draws from for both season practices and summer camps. Each drill carries the
// metadata the generator filters on: skill category, age range, difficulty,
// player count, duration, and flags for staples, games, and camp-friendliness.
//
// Writing style: steps, cues, and the easier/harder notes are written the way a
// coach actually talks to players — plain, simple, direct English. Every drill
// here is a standard activity used in real volleyball training.
//
// LINKS standard (RallyReady E): every video link is a DETERMINISTIC YouTube
// SEARCH url built from the drill name — never a guessed id, never an embed.
//
// Split for the <800-lines-per-file rule. Part 1 covers Warm-ups, Ball Control,
// Passing, Setting, and Serving. Parts 2-9 (js/drills-2.js .. js/drills-9.js)
// each concatenate their drills onto RR.drills, loaded in order from index.html.
window.RR = window.RR || {};

(function (RR) {
  "use strict";

  // Build a deterministic YouTube SEARCH url from a drill name (LINKS standard).
  function videoSearch(name) {
    return "https://www.youtube.com/results?search_query=" +
      encodeURIComponent("how to " + name + " volleyball");
  }
  // Expose the helper so the other parts reuse it instead of redefining it.
  RR.drillVideoSearch = videoSearch;
  var v = videoSearch;

  RR.drills = [

    // ===================== WARM-UPS =====================
    {
      id: "dynamic-movement-warmup",
      name: "Dynamic Movement Warm-Up",
      skill: "Warmup",
      ageMin: 8, ageMax: 18,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 10,
      isStaple: true,
      isGame: false,
      campFriendly: true,
      equipment: [],
      setup: "Have the players line up on the end line with open space to move down to the attack line and back. You do this as a group to get warm and loose before anything else.",
      steps: [
        "Jog down to the attack line and back at an easy pace to get the blood moving.",
        "Go down again with high knees, then come back kicking your heels up to your backside.",
        "Do walking lunges down, twisting your chest over your front leg. Side lunges on the way back.",
        "Do the grapevine (carioca) facing one sideline, then face the other sideline on the way back.",
        "Finish with two or three runs at about three-quarter speed to wake your legs up."
      ],
      cues: [
        "Stay tall and land softly on the front of your feet.",
        "Swing your arms — your legs move faster when your arms do.",
        "Keep your knees pointing the same way as your toes."
      ],
      easier: "For younger kids, make the distance shorter and skip the faster runs. Keep everything at a walk or slow jog.",
      harder: "Add a low defensive shuffle across the whole court and a few jumps so your legs are ready to hit.",
      videoSearchUrl: v("Dynamic Movement Warm-Up")
    },
    {
      id: "shoulder-band-prep",
      name: "Resistance Band Shoulder Prep",
      skill: "Warmup",
      ageMin: 10, ageMax: 18,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["bands"],
      setup: "Give each player a light resistance band. They can loop it on something at chest height or just hold it in both hands. This wakes up the shoulder before all the serving and hitting, which helps keep it healthy.",
      steps: [
        "Tuck your elbow against your side and rotate your forearm out against the band. Do 10 on each arm.",
        "Now rotate your forearm back across your belly against the band. Do 10 on each arm.",
        "Hold the band in both hands at chest height and pull your hands apart. Do 12.",
        "Raise your arms up and out into a 'Y' shape against the band. Do 10.",
        "Finish with 10 slow arm circles forward and 10 backward."
      ],
      cues: [
        "Keep your elbow still and tucked in. Only your forearm should move.",
        "Squeeze your shoulder blades together. Don't shrug your shoulders up.",
        "Go slow and controlled. Fast and sloppy doesn't help."
      ],
      easier: "Use the lightest band, or none at all. Just move your arms through the same motions.",
      harder: "Use a slightly heavier band and add a few scapular push-ups to build more strength.",
      videoSearchUrl: v("Resistance Band Shoulder Prep")
    },
    {
      id: "self-toss-ball-handling",
      name: "Ball-Handling Toss Series",
      skill: "Warmup",
      ageMin: 8, ageMax: 14,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "Give every player a ball and enough room to move. This is a great first-touch warm-up for younger or newer players to get comfortable handling the ball.",
      steps: [
        "Toss the ball up and catch it on your forearms with your arms straight and thumbs together. This is your passing platform.",
        "Toss it up again and catch it in your hands up above your forehead. This is your setting shape.",
        "Bump the ball to yourself five times in a row, keeping it low and under control.",
        "Set the ball straight up to yourself five times, moving your feet to stay under it.",
        "Now do one bump, then one set, then a bump, staying balanced under the ball."
      ],
      cues: [
        "Move your feet to get under the ball, then play it in front of you.",
        "For the platform: straight arms, thumbs together, and don't swing at the ball.",
        "Set with your finger pads, not your palms."
      ],
      easier: "Let them catch the ball between each touch, or bump it against a wall so it keeps coming back.",
      harder: "Try for 10 to 15 touches in a row, or walk around while you bump and set to yourself.",
      videoSearchUrl: v("Ball-Handling Toss Series")
    },
    {
      id: "partner-pass-and-move-warmup",
      name: "Partner Pass-and-Move Warm-Up",
      skill: "Warmup",
      ageMin: 8, ageMax: 18,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 8,
      isStaple: true,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "Pair players up about 12 to 15 feet apart with one ball between them. This eases them from simple tosses into real passing so they're warm and ready.",
      steps: [
        "Start by just tossing the ball back and forth and catching it, finding a rhythm.",
        "Now toss it once, and your partner passes it back to your hands. You catch and toss again.",
        "Move to passing it back and forth without catching, keeping the rally going.",
        "Add some movement: after you pass, shuffle to the side and back before the next ball.",
        "Finish by passing it to your partner, and they set it back to you."
      ],
      cues: [
        "Move your feet first, then point your hips at your partner.",
        "Get to the spot early so you're stopped and balanced when you pass.",
        "Angle your arms so the ball goes right to your partner's chest."
      ],
      easier: "Let them catch between contacts and stand closer together so they have early success.",
      harder: "Spread them out and call 'left' or 'right' so the passer has to send the ball where you say.",
      videoSearchUrl: v("Partner Pass-and-Move Warm-Up")
    },
    {
      id: "mirror-defensive-shuffle",
      name: "Mirror Defensive Shuffle",
      skill: "Warmup",
      ageMin: 8, ageMax: 18,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 6,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: [],
      setup: "Have partners stand about 6 feet apart in a low defensive stance, or have the whole group copy a coach. No ball needed. It warms up the legs and works on quick feet and reactions.",
      steps: [
        "One player is the leader and shuffles left and right. The partner mirrors them to stay right across.",
        "The leader adds moving forward and back, and the partner keeps matching them.",
        "When you clap or blow the whistle, both players touch the floor and pop back up ready.",
        "Switch who leads every 20 to 30 seconds."
      ],
      cues: [
        "Stay low by bending your knees, not your back.",
        "Shuffle your feet — don't cross them — and stay on the balls of your feet.",
        "Keep your eyes up and your hands out in front, ready."
      ],
      easier: "Slow it down and only move side to side.",
      harder: "Speed it up and add a quick sprint forward and backpedal to really test their balance.",
      videoSearchUrl: v("Mirror Defensive Shuffle")
    },

    // ===================== BALL CONTROL =====================
    {
      id: "pepper",
      name: "Pepper",
      skill: "Ball Control",
      ageMin: 8, ageMax: 18,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 10,
      isStaple: true,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "Two players stand about 12 to 15 feet apart with one ball. They keep it going with a dig, a set, and a hit, over and over. It's the most common ball-control drill in the sport, and nearly every team does it.",
      steps: [
        "Player A tosses the ball up and hits it down toward Player B at an easy speed.",
        "Player B digs it, trying to pop it straight up in front of their own face.",
        "Player B sets that ball back over to Player A.",
        "Player A hits it down at Player B again, and you keep the dig, set, hit going.",
        "Keep the rally alive as long as you can, then switch who hits first."
      ],
      cues: [
        "Don't hit it hard. Hit it just soft enough that your partner can dig it.",
        "When you dig, send the ball up to your own forehead first, then set it to your partner.",
        "Stay on your toes and watch your partner's hitting hand."
      ],
      easier: "If the ball keeps dropping, play 'catch pepper.' Catch the ball after each contact and toss the next one. It slows things down so you can get your feet and hands right.",
      harder: "The hitter can mix in soft tips and roll shots so the digger has to read what's coming. You can also speed it up, as long as you stay in control.",
      videoSearchUrl: v("Pepper")
    },
    {
      id: "wall-forearm-passing",
      name: "Wall Forearm Passing",
      skill: "Ball Control",
      ageMin: 8, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 8,
      isStaple: true,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "wall"],
      setup: "Each player stands about 5 to 8 feet from a flat wall with a ball. Pick a spot on the wall around net height to aim above. The whole team can do this at once along one wall, so everyone gets a lot of touches.",
      steps: [
        "Toss the ball at the wall to start.",
        "When it comes back, pass it to the wall with your forearms, aiming above your target spot.",
        "Keep passing it to the wall over and over, moving your feet to stay behind it.",
        "Count how many you can do in a row and try to beat your best."
      ],
      cues: [
        "Tilt your arms up a little so the ball arcs to the wall instead of firing straight at it.",
        "Move your feet so the ball is always in front of you.",
        "Keep your arms still and let them do the work. Don't swing at the ball."
      ],
      easier: "Let the ball bounce once between passes, or stand closer to the wall so you have more time.",
      harder: "Alternate one pass and one set against the wall, or step back so each pass has to travel farther.",
      videoSearchUrl: v("Wall Forearm Passing")
    },
    {
      id: "three-contact-partner-pepper",
      name: "Three-Contact Partner Pepper",
      skill: "Ball Control",
      ageMin: 10, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "Partners stand about 15 feet apart with one ball. This is like regular pepper, but each player makes all three contacts — pass, set, hit — on their own side before sending it over.",
      steps: [
        "Player A tosses to Player B. Player B passes the ball up to themselves.",
        "Player B sets the ball up to themselves, then hits it over to Player A.",
        "Player A does the same three touches: pass to themselves, set to themselves, then hit it back.",
        "Keep going, making all three controlled touches every time."
      ],
      cues: [
        "Make all three touches every time. Don't skip straight to the hit.",
        "Pass the ball nice and high so you have time to set it.",
        "Face your partner and get balanced before you hit."
      ],
      easier: "Drop the hit for now. Just pass to yourself and then set it over. Add the hit once that feels easy.",
      harder: "Make your first pass land away from you on purpose so you have to move to it before you set and hit.",
      videoSearchUrl: v("Three-Contact Partner Pepper")
    },
    {
      id: "over-the-net-pepper",
      name: "Over-the-Net Pepper",
      skill: "Ball Control",
      ageMin: 10, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 10,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Put two players, or two pairs, on opposite sides of the net with one ball. It's like pepper, but now you send the ball over the net and try to keep a long rally going together.",
      steps: [
        "Player A digs or passes the ball up to themselves, sets it to themselves, then hits it over the net.",
        "Player B digs it up, sets it to themselves, and sends it back over.",
        "Work together to keep the rally going, and count how many times the ball crosses the net.",
        "If you're in pairs, take turns so both players touch the ball."
      ],
      cues: [
        "Three touches when you can, but keeping it alive is the main thing.",
        "Send the ball over softly enough that your partner can play it.",
        "Get back into a ready stance the second the ball leaves your hands."
      ],
      easier: "Lower the net or let players toss the ball over instead of hitting it, so rallies last longer.",
      harder: "Make players set and then attack every time, or keep score and play it as a game.",
      videoSearchUrl: v("Over-the-Net Pepper")
    },

    // ===================== PASSING =====================
    {
      id: "partner-forearm-passing",
      name: "Partner Forearm Passing",
      skill: "Passing",
      ageMin: 8, ageMax: 18,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 8,
      isStaple: true,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "Partners face each other about 15 feet apart with one ball. This is the basic passing rep that everything in serve receive is built on.",
      steps: [
        "Player A tosses an easy ball to the middle of Player B's body.",
        "Player B passes it back to Player A's hands using their forearms.",
        "Player A catches it, takes a quick look at their partner's arms and feet, and tosses again.",
        "After 10 good passes, switch jobs.",
        "Once that's easy, the tosser can hit a soft down-ball instead so the passer reads a real ball."
      ],
      cues: [
        "Get to the ball early and face where you want it to go.",
        "Play the ball out in front of you, around belly height.",
        "Lift with your legs and keep your arms still."
      ],
      easier: "Stand closer and keep the tosses soft and easy. Let the passer reset between each one.",
      harder: "Toss it off to the side so the passer has to move to it and still pass it back on target.",
      videoSearchUrl: v("Partner Forearm Passing")
    },
    {
      id: "shuttle-passing-to-target",
      name: "Shuttle Passing to Target",
      skill: "Passing",
      ageMin: 8, ageMax: 18,
      difficulty: 2,
      minPlayers: 4,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "cones"],
      setup: "Make two short lines of players facing each other about 10 to 12 feet apart, with a target in the middle — a coach, a cone, or a hoop. Players keep moving through, so a big group stays busy.",
      steps: [
        "The first player in one line tosses or serves to the passer across from them.",
        "The passer faces the target and passes the ball to it.",
        "After they pass, that player jogs to the back of the other line.",
        "The next player steps up and you keep the shuttle going, everyone rotating through."
      ],
      cues: [
        "Beat the ball to the spot, then pass it to the target.",
        "Hold your arms still for a second after you pass so you can see where it went.",
        "Call 'mine' early so everyone knows you've got it."
      ],
      easier: "Use tosses instead of serves and a big target, so most passes count as a success.",
      harder: "Serve instead of toss, and make the target small, like a hoop the pass has to land in.",
      videoSearchUrl: v("Shuttle Passing to Target")
    },
    {
      id: "three-person-serve-receive",
      name: "Three-Person Serve Receive",
      skill: "Passing",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 4,
      durationMin: 12,
      isStaple: true,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Put three passers in the back court in a 'W' shape, with a target or a setter at the net. A server serves from the other side. This is how teams actually practice receiving a serve.",
      steps: [
        "The server serves into the three passers.",
        "Players call the ball early. Whoever it's closest to takes it and passes to the setter target.",
        "The other two open up toward the ball and get ready in case it's shanked their way.",
        "Pass a set number of serves, then rotate the passers and keep track of how good the passes are."
      ],
      cues: [
        "Call 'mine' or 'help' loudly before the ball gets to you.",
        "Pass the ball high to the target with your arms held still.",
        "If a ball is between two players, it belongs to the one it's heading toward."
      ],
      easier: "Toss or serve from inside the court so the passers get slower, easier balls to start.",
      harder: "Add jump serves and grade each pass from 0 to 3. The group has to hit a team total before they rotate.",
      videoSearchUrl: v("Three-Person Serve Receive")
    },
    {
      id: "butterfly-passing",
      name: "Butterfly Passing",
      skill: "Passing",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 6,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "This one keeps a big group moving. Players serve from one side, the pass goes to a target near the net, and then everyone follows their ball to the next spot. The order is: serve, then go pass, then go shag, then serve again.",
      steps: [
        "A player serves over the net to a passer on the other side.",
        "The passer passes the ball to the setter or target by the net.",
        "The setter catches or sets it, and the ball gets shagged back to the serving side.",
        "Every player follows their own ball to the next job: the server jogs to the passing line, the passer goes to the target spot, and so on."
      ],
      cues: [
        "Follow your ball. As soon as you finish a contact, move to the next spot.",
        "Passers, send a high ball right to the target every time.",
        "Keep moving. The drill only works if everyone rotates quickly."
      ],
      easier: "Toss from the end line instead of serving, and keep one player as the setter the whole time so the rotation is simpler.",
      harder: "Make players hit a good pass to a small target before it counts, and serve live from the full distance.",
      videoSearchUrl: v("Butterfly Passing")
    },
    {
      id: "passing-to-setter-target",
      name: "Passing to Setter Target",
      skill: "Passing",
      ageMin: 10, ageMax: 18,
      difficulty: 2,
      minPlayers: 3,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "You need a passer in the back court, someone to feed balls, and a target where the setter stands (a player, a chair, or a hoop). This teaches passers to put the ball in the right spot for the setter.",
      steps: [
        "The feeder tosses or hits a ball to the passer from across the net.",
        "The passer passes it to the setter target, aiming for a spot about a yard off the net.",
        "If it hits the target, great. If it misses, just go again.",
        "After a set number of good passes, rotate the passer out."
      ],
      cues: [
        "Pass to a high point above the target, not flat at it.",
        "Set your feet so your arms are facing the target.",
        "Same height and same spot every time, so the setter always knows where the ball will be."
      ],
      easier: "Make the target area bigger and use soft tosses so the passer can just focus on direction.",
      harder: "Feed from different angles and make the target small, like a hoop the pass has to land in.",
      videoSearchUrl: v("Passing to Setter Target")
    },

    // ===================== SETTING =====================
    {
      id: "wall-setting",
      name: "Wall Setting",
      skill: "Setting",
      ageMin: 8, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 8,
      isStaple: true,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "wall"],
      setup: "Each player stands about 3 to 5 feet from a wall with a ball, with a high target spot on the wall to aim at. The whole group can do this along one wall and get tons of setting touches.",
      steps: [
        "Set the ball at the wall, above your target spot.",
        "Move under it as it comes back and set it again, keeping a steady rhythm.",
        "Keep your hands up above your forehead and touch the ball with your finger pads.",
        "Count how many you can do in a row and try to beat your best."
      ],
      cues: [
        "Make a triangle window with your thumbs and pointer fingers, and look through it.",
        "Set with your legs and a full push of your arms, not just a flick of the wrists.",
        "Get your feet under the ball so it stays right in front of your forehead."
      ],
      easier: "Catch the ball in your setting hands, then push it back out. This helps you feel the right shape before going non-stop.",
      harder: "Step back from the wall so each set travels farther, or alternate a high set and a low quick set.",
      videoSearchUrl: v("Wall Setting")
    },
    {
      id: "partner-setting",
      name: "Partner Setting",
      skill: "Setting",
      ageMin: 8, ageMax: 18,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 8,
      isStaple: true,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "Partners stand about 10 to 12 feet apart with one ball and set it back and forth. This builds clean hands and good footwork.",
      steps: [
        "Player A tosses the ball to themselves, then sets it to Player B.",
        "Player B moves under the ball and sets it back.",
        "Keep setting it back and forth, keeping the ball high and out in front.",
        "Add a step in toward the ball each time so you're setting on the move."
      ],
      cues: [
        "Beat the ball to the spot and set it from your forehead.",
        "Push evenly with both hands so the ball goes straight.",
        "Soft, quiet hands. No slap, and don't let the ball touch your palms twice."
      ],
      easier: "Catch the ball and re-set it each time, or stand closer so it's easier to control.",
      harder: "Add back sets, where you turn and set behind you, or set while moving along the net like a setter would.",
      videoSearchUrl: v("Partner Setting")
    },
    {
      id: "setter-footwork-to-target",
      name: "Setter Footwork to Target",
      skill: "Setting",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "The setter starts in the middle-back ready spot, and a feeder tosses passes toward the net. This trains the setter to run to the ball, get there early, and turn to face their hitter.",
      steps: [
        "As the feeder tosses, the setter runs to the setting spot at the right-front.",
        "They get there early, turn so their hips face the left sideline, and set the ball.",
        "Set a front ball to the left antenna or a back ball to the right, whichever the coach calls.",
        "Go back to the middle and do it again, getting to the spot before the ball each time."
      ],
      cues: [
        "Beat the ball to the spot, then turn and face your hitter.",
        "Step onto your right foot last to square yourself up.",
        "Same height and same spot every set, so your hitters can time it."
      ],
      easier: "Slow the toss down and only set front balls, so the setter can focus on getting to the spot.",
      harder: "Toss the pass to different spots — tight, off the net, deep — so the setter has to adjust and still set a hittable ball.",
      videoSearchUrl: v("Setter Footwork to Target")
    },
    {
      id: "back-setting",
      name: "Back Setting",
      skill: "Setting",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 3,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls"],
      setup: "Put three players in a line about 10 feet apart. The middle player sets backward to the player behind them. This builds the back set without losing accuracy.",
      steps: [
        "An outside player tosses to the middle setter.",
        "The setter gets under the ball and sets it back over their head to the third player.",
        "The third player catches it and tosses back to the middle for another rep.",
        "After a set number of clean back sets, rotate spots."
      ],
      cues: [
        "Get all the way under the ball so it's a little behind your forehead.",
        "Arch your back and push up and back, finishing with your eyes up.",
        "Use the same hand shape as a normal set. Push it, don't throw it."
      ],
      easier: "Catch the ball overhead and push it back to feel the motion before doing it live.",
      harder: "Add a step in and have the coach call 'front' or 'back' at the last second so the setter hides which way it's going.",
      videoSearchUrl: v("Back Setting")
    },

    // ===================== SERVING =====================
    {
      id: "standing-float-serve-progression",
      name: "Standing Float Serve Progression",
      skill: "Serving",
      ageMin: 8, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 10,
      isStaple: true,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Line players up along the end line (or closer to start) with balls. This builds a steady overhand float serve from the toss all the way to contact.",
      steps: [
        "Stand with your feet staggered, weight back, and hold the ball out in front of your hitting shoulder.",
        "Toss it low and steady, just in front of that shoulder, with no spin.",
        "Step forward and hit the middle of the ball with a firm, flat hand.",
        "Stop your hand at contact — don't follow through — so the ball floats and wobbles.",
        "Start from mid-court if you need to, and move back as you get more over."
      ],
      cues: [
        "Same toss every time. A steady toss is the secret to a steady serve.",
        "Hit the middle of the ball with a stiff hand and stop your hand right there.",
        "Step toward your target as you swing."
      ],
      easier: "Move closer to the net, or serve underhand with a firm fist under the ball so it always gets over.",
      harder: "Serve from the full end line to specific spots, and try a short jump float where you toss and go.",
      videoSearchUrl: v("Standing Float Serve Progression")
    },
    {
      id: "serving-to-zones",
      name: "Serving to Zones",
      skill: "Serving",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 1,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net", "cones"],
      setup: "Put targets — cones, towels, or ball carts — in the serving zones on the far court (zones 1, 5, and 6 are good). Players serve from the end line at the spot you call out, to work on aiming their serve.",
      steps: [
        "Call out a target zone before each serve.",
        "The server serves to that zone, trying to hit the target.",
        "Keep track of how many they hit in each zone over a set number of serves.",
        "Rotate servers and compare how accurate they are to different spots."
      ],
      cues: [
        "Aim small. Pick one spot, not the whole area.",
        "Point your starting position and shoulders toward your target.",
        "Use the same smooth toss and hit no matter where you're aiming."
      ],
      easier: "Use big zones like deep vs. short or left vs. right, and serve from closer in.",
      harder: "Make the targets small, like hoops, and require a couple of makes to a zone before moving to the next one.",
      videoSearchUrl: v("Serving to Zones")
    },
    {
      id: "serving-ladder-game",
      name: "Serving Ladder (7-Up)",
      skill: "Serving",
      ageMin: 10, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 12,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Players serve from the end line and race to a target number of made serves as a team. It puts a little game pressure on serving, which is good practice for matches.",
      steps: [
        "Split into two teams. Players take turns serving from the end line.",
        "A made serve is one point for the team. A miss is nothing.",
        "First team to the target number — try 7, then 10 — wins the round.",
        "To raise the stakes, a miss right after a make resets that player's personal streak."
      ],
      cues: [
        "Take a breath and use your routine. Don't rush just because it's a race.",
        "Pick a safe spot you can hit. A made serve always beats a risky miss.",
        "Same toss every time, especially when the score is close."
      ],
      easier: "Let players serve from mid-court, count any serve that lands in, and lower the target number.",
      harder: "Make serves only count if they hit a called zone, or play it so you have to make two in a row to score.",
      videoSearchUrl: v("Serving Ladder (7-Up)")
    },
    {
      id: "topspin-serve-progression",
      name: "Topspin Serve Progression",
      skill: "Serving",
      ageMin: 12, ageMax: 18,
      difficulty: 4,
      minPlayers: 1,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "This is for players ready to add a topspin serve. It needs a higher toss and a snapping wrist so the ball drops hard into the court. Serve from the end line.",
      steps: [
        "Toss the ball higher and a bit more in front, with a little forward spin on the toss.",
        "Load your hitting arm back like you're about to spike.",
        "Hit the lower back of the ball and snap your wrist over the top to make it spin.",
        "Follow through down and across, letting the spin pull the ball down into the court.",
        "Start from mid-court and move back to the end line as it gets more consistent."
      ],
      cues: [
        "Toss high and in front. You should swing up to a fully stretched arm.",
        "Snap your wrist over the top. Feel your fingers roll over the ball.",
        "Speed your hand up through the ball — the opposite of the stiff-hand float."
      ],
      easier: "Stand closer and just work on the toss and the wrist snap. Don't worry where it lands yet.",
      harder: "Serve topspin to the deep corners, and try a jump topspin serve with a few approach steps.",
      videoSearchUrl: v("Topspin Serve Progression")
    }

  ];
})(window.RR);
