// drills-2.js — RallyReady drill library DATA (Part 2 of 9).
//
// PURE DATA ONLY. Hitting, Blocking, Defense, Team Play, and Cooldown. Written in
// plain coach English. All standard, real volleyball drills. CONCATENATES onto
// RR.drills (loaded after drills.js). LINKS standard: deterministic YouTube
// SEARCH urls, never an embed or guessed id.
window.RR = window.RR || {};

(function (RR) {
  "use strict";

  var v = RR.drillVideoSearch || function (name) {
    return "https://www.youtube.com/results?search_query=" +
      encodeURIComponent("how to " + name + " volleyball");
  };

  var more = [

    // ===================== HITTING =====================
    {
      id: "spike-approach-footwork",
      name: "Spike Approach Footwork",
      skill: "Hitting",
      ageMin: 10, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 8,
      isStaple: true,
      isGame: false,
      campFriendly: true,
      equipment: [],
      setup: "Players start a few steps off the net with room to run in. There's no ball yet — you're just learning the footwork and arm swing of a hitting approach so it becomes automatic.",
      steps: [
        "Stand relaxed. The first step is a small step with your right foot (lefties do the opposite).",
        "Take a big step with your left foot and swing both arms back behind you.",
        "Quickly plant your right foot, then your left, to turn your speed into a jump.",
        "Swing both arms up and forward and reach high with your hitting hand.",
        "Land softly on two feet, balanced, ready to play the next ball."
      ],
      cues: [
        "Start slow and finish fast. The last two steps are the quick ones.",
        "Swing your arms back, then throw them up at the ceiling to jump higher.",
        "Land on two feet right where you took off. Don't jump forward into the net."
      ],
      easier: "Walk through it slowly, counting your steps out loud, before you add the jump.",
      harder: "Add a ball — have someone toss or set it — and finish with a full swing. Then try approaching from the outside, middle, and back row.",
      videoSearchUrl: v("Spike Approach Footwork")
    },
    {
      id: "hitting-lines",
      name: "Hitting Lines off Coach Toss",
      skill: "Hitting",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 3,
      durationMin: 12,
      isStaple: true,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Hitters line up at the outside. A coach or setter feeds good, hittable balls at the net. This gets each hitter a lot of swings to groove their timing.",
      steps: [
        "The coach tosses or sets a hittable ball to the outside.",
        "The hitter runs their approach, jumps, and swings at a target on the court.",
        "After the swing, the hitter chases their own ball and goes to the back of the line.",
        "Rotate through and keep track of kills versus errors."
      ],
      cues: [
        "Wait for the set to leave the hands, then go. Don't start too early.",
        "Hit the ball high and in front of your hitting shoulder, and snap your wrist over it.",
        "Aim for the deep corners or the sharp angle, not just hard."
      ],
      easier: "Hit off a high, easy toss off a box, or just take a standing swing into the court first.",
      harder: "Hit live sets from a setter, call out 'line' or 'angle' before you swing, and add one blocker to hit around.",
      videoSearchUrl: v("Hitting Lines off Coach Toss")
    },
    {
      id: "self-toss-spike",
      name: "Self-Toss Spike",
      skill: "Hitting",
      ageMin: 10, ageMax: 18,
      difficulty: 2,
      minPlayers: 1,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Each hitter has a ball at the net. They toss it to themselves and hit it. Because everyone has a ball, a big group can all work on their swing at once.",
      steps: [
        "Stand near the attack line holding a ball.",
        "Toss the ball up and a little in front of your hitting shoulder.",
        "Take a quick approach, jump, and swing over the top of the ball to snap it over the net.",
        "Aim for a spot on the court, then go get your ball for the next one."
      ],
      cues: [
        "Toss it where you can hit it — high and in front of you.",
        "Reach up and hit the ball at the very top of your reach.",
        "Snap your wrist over the ball so it drops down into the court."
      ],
      easier: "Hit standing still without jumping, or hit from on top of a box so you only think about your swing.",
      harder: "Add a full approach to your self-toss, and call a target you have to hit each time.",
      videoSearchUrl: v("Self-Toss Spike")
    },
    {
      id: "hitting-off-a-live-set",
      name: "Hitting Off a Live Set",
      skill: "Hitting",
      ageMin: 12, ageMax: 18,
      difficulty: 4,
      minPlayers: 4,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "You need someone to pass, a setter at the net, and hitters in a line. This puts the whole play together — pass to the setter, set to the hitter, then hit — at real game speed.",
      steps: [
        "A ball is sent to the setter, either with a pass or a coach toss.",
        "The setter sets a front or back ball to whichever hitter is called.",
        "The hitter times their approach to that set and hits it into the court.",
        "Hitters rotate through, and you watch how well the setter and hitters connect."
      ],
      cues: [
        "Adjust to the set you get. You're finishing the play the setter started.",
        "Time your run to the ball, not to a count in your head.",
        "Talk to your setter between reps about how high and where you want it."
      ],
      easier: "Use a steady, high outside set every time and slow it down so hitters can focus on timing.",
      harder: "Run different sets — a quick to the middle, a back-row set — and add a blocker to read.",
      videoSearchUrl: v("Hitting Off a Live Set")
    },
    {
      id: "tips-and-roll-shots",
      name: "Tips and Roll Shots",
      skill: "Hitting",
      ageMin: 10, ageMax: 18,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Hitters work on soft shots over and around a block. These are the smart, off-speed shots you use to score when a hard swing isn't there.",
      steps: [
        "Someone sets a ball near the net to the hitter.",
        "Instead of swinging hard, the hitter tips the ball over the block with stiff fingertips.",
        "On the next one, the hitter rolls the ball — open hand, snap the wrist — deep to a back corner.",
        "Go back and forth between short tips and deep rolls, reading where the court is open."
      ],
      cues: [
        "Tip with firm fingers and aim for a spot. Don't push or carry the ball.",
        "Run your normal approach so it looks like a hard swing until the last second.",
        "Put the ball where no one is standing — short over the block, or deep in the corners."
      ],
      easier: "Tip from a standing position over a lowered net first, just to feel the firm-fingers contact.",
      harder: "Read a real block and decide in the moment whether to tip, roll, or swing.",
      videoSearchUrl: v("Tips and Roll Shots")
    },

    // ===================== BLOCKING =====================
    {
      id: "blocking-footwork",
      name: "Blocking Footwork",
      skill: "Blocking",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 1,
      durationMin: 8,
      isStaple: true,
      isGame: false,
      campFriendly: false,
      equipment: ["net"],
      setup: "Blockers start at the net in a balanced, ready stance. This drills the two ways to move along the net: a quick slide step for short distances and a crossover step for longer ones.",
      steps: [
        "From the middle, take a quick slide step to block at the near pin. Don't cross your feet.",
        "Come back to the middle, then use a crossover step to cover the longer distance to the outside pin.",
        "Get your shoulders square to the net before you jump. Don't drift sideways in the air.",
        "Do both directions, jumping off two feet each time."
      ],
      cues: [
        "Get square to the net before you jump — chest facing straight across.",
        "Slide for short, crossover for long. Your last step squares you up.",
        "Press your hands over the net. Don't just reach up and touch it."
      ],
      easier: "Walk the footwork slowly with no jump, just getting square to the net at the end.",
      harder: "Have a coach point left or right so you react, and time your jump to a hitter's approach.",
      videoSearchUrl: v("Blocking Footwork")
    },
    {
      id: "mirror-blocking",
      name: "Mirror Blocking at the Net",
      skill: "Blocking",
      ageMin: 10, ageMax: 18,
      difficulty: 2,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["net"],
      setup: "Two players face each other across the net in blocking position. One leads, the other copies. It's a fun, simple way to work on blocking movement and hand position.",
      steps: [
        "The leader shuffles or crossover-steps along the net. The partner mirrors them on the other side.",
        "When the leader jumps, both players jump and press their hands over the net.",
        "Reach to close the gap, hands firm and spread, thumbs pointing up.",
        "Switch who leads after a few reps."
      ],
      cues: [
        "Reach over the net and press. Don't swing your arms at the ball.",
        "Jump just after the hitter does so you block the ball, not the air.",
        "Keep your hands firm and spread with your thumbs up to keep the ball in."
      ],
      easier: "Move slowly with no jump, just matching footwork and hand position.",
      harder: "Add a ball: the leader holds it over the net and the blocker presses it back down.",
      videoSearchUrl: v("Mirror Blocking at the Net")
    },
    {
      id: "block-timing-box",
      name: "Block Timing off a Box",
      skill: "Blocking",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net", "box"],
      setup: "Someone stands on a box (or jumps) on one side to attack, and blockers on the other side work on timing the block. This teaches you to watch the hitter and jump at the right moment.",
      steps: [
        "The hitter on the box holds a ball up at the net.",
        "The blocker watches the hitter's arm, then jumps to press over and seal the ball.",
        "Try to touch the ball at its highest point over the net.",
        "Reset and go again, with the hitter contacting from different spots left and right."
      ],
      cues: [
        "Watch the hitter's hand, not the ball, and jump just after they do.",
        "Reach to the ball and press your hands down and over it.",
        "Hold your block firm. Don't flail or pull your arms back."
      ],
      easier: "Have the hitter hold the ball still over the net so the blocker only works on reaching and sealing.",
      harder: "The hitter swings live from the box to different spots, and the blocker has to move and take away a called angle.",
      videoSearchUrl: v("Block Timing off a Box")
    },
    {
      id: "block-and-transition",
      name: "Block-and-Transition",
      skill: "Blocking",
      ageMin: 14, ageMax: 18,
      difficulty: 4,
      minPlayers: 2,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Blockers block a ball at the net, then quickly drop off the net to become a hitter or defender. This trains the tough move from blocking to attacking, which happens constantly in a game.",
      steps: [
        "The blocker blocks a ball the coach feeds at the net.",
        "As soon as they land, they push off the net back to the attack line.",
        "A second ball is set, and the player approaches and hits it (or digs it) in transition.",
        "Do a few of these in a row, then rest and rotate."
      ],
      cues: [
        "Land balanced, then turn and get off the net fast.",
        "Get all the way off the net before you start your hitting approach.",
        "Block, get off the net, swing — make it one smooth sequence."
      ],
      easier: "Slow it down: block, then transition to catch a tossed ball instead of hitting it.",
      harder: "Add more blockers and a live set so the whole thing happens at real game speed.",
      videoSearchUrl: v("Block-and-Transition")
    },

    // ===================== DEFENSE =====================
    {
      id: "digging-coach-down-balls",
      name: "Digging Coach-Hit Down Balls",
      skill: "Defense",
      ageMin: 10, ageMax: 18,
      difficulty: 3,
      minPlayers: 1,
      durationMin: 10,
      isStaple: true,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "A coach hits balls from a box or the net at defenders in the back court. This is the main drill for learning to read and dig hard-driven balls.",
      steps: [
        "Defenders get in a low, balanced stance with their arms ready.",
        "The coach hits a ball at or near the defender.",
        "The defender angles their arms to dig the ball up high toward the middle of the court.",
        "Shag the ball, rotate to the next defender, and go again."
      ],
      cues: [
        "Be low and stopped before the coach hits. Don't be moving when the ball comes.",
        "Angle your arms toward the middle and let the ball come to you.",
        "Dig the ball high and toward the middle so a teammate can run the next play."
      ],
      easier: "Hit slower, easier down-balls and stand the defender closer so they can keep up.",
      harder: "Hit harder and to the defender's sides so they have to move, dig, and recover for a second ball.",
      videoSearchUrl: v("Digging Coach-Hit Down Balls")
    },
    {
      id: "rolls-and-sprawls",
      name: "Rolls and Sprawls",
      skill: "Defense",
      ageMin: 10, ageMax: 18,
      difficulty: 3,
      minPlayers: 1,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls"],
      setup: "Players learn to reach out for a low ball and then safely roll or sprawl to the floor and get back up. This teaches emergency defense without getting hurt. Start slow with easy tosses.",
      steps: [
        "From a low stance, step out toward a tossed low ball and play it with one or two arms.",
        "Let your momentum carry you into a roll (over your shoulder) or a sprawl (chest to the floor).",
        "Pop right back up to a ready stance after you play it.",
        "Practice both directions and both moves, using soft tosses first."
      ],
      cues: [
        "Play the ball first, then let your body follow it to the floor.",
        "Roll over your shoulder, not your spine. Stay rounded and relaxed.",
        "Get up fast — the rally isn't over just because you hit the floor."
      ],
      easier: "Start from your knees or a very low position with soft tosses so the roll is safe and easy to learn.",
      harder: "Toss balls just out of reach so players have to explode out, stretch, and recover at full speed.",
      videoSearchUrl: v("Rolls and Sprawls")
    },
    {
      id: "pursuit-emergency-defense",
      name: "Pursuit and Emergency Defense",
      skill: "Defense",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 3,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "This drills chasing down balls that deflect off the block or fly off the net, and getting them back to a teammate. It builds the never-give-up attitude that keeps rallies alive.",
      steps: [
        "A coach throws a wild ball off the net or behind the defenders.",
        "The first player chases it down and plays it up, often while facing away from the net.",
        "A second player tracks that ball and sends it back over the net.",
        "Rotate so everyone gets to chase and to cover."
      ],
      cues: [
        "Run to where the ball is going, not to where it is right now.",
        "Play the ball high and back toward your own court so a teammate can save it.",
        "Talk — call out who's chasing and who's covering."
      ],
      easier: "Use slow, easy-to-read tosses so players learn the angles before you add speed.",
      harder: "Deflect balls live off a held block so the chase is unpredictable, like a real rally.",
      videoSearchUrl: v("Pursuit and Emergency Defense")
    },
    {
      id: "dig-to-target",
      name: "Dig to Target",
      skill: "Defense",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 10,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Defenders dig coach-hit balls to a specific spot — where the setter stands — instead of just popping them up anywhere. This connects your defense to your next attack.",
      steps: [
        "The coach hits a ball at the defender from the net.",
        "The defender digs the ball to the target spot at the right-front, where the setter would be.",
        "If they hit the target, the play continues to a set. If they miss, go again.",
        "Track how often each defender hits the target, then rotate."
      ],
      cues: [
        "Keep your arms quiet and angled at the target. Control matters more than power on a dig.",
        "Dig the ball high so the setter has time to get there.",
        "Be stopped before you contact. A moving body sends the dig all over the place."
      ],
      easier: "Hit softer down-balls and use a big target area so defenders can focus on direction.",
      harder: "Hit harder and to the edges, and make the dig land in a small target before the team can attack it.",
      videoSearchUrl: v("Dig to Target")
    },
    {
      id: "close-range-reaction-digging",
      name: "Close-Range Reaction Digging",
      skill: "Defense",
      ageMin: 10, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: ["balls"],
      setup: "A feeder stands close — about 10 to 12 feet — and quickly hits or throws balls at the defender, one after another. It's fast and fun, and easy to run in pairs across a big group.",
      steps: [
        "The defender starts low and balanced with their hands out front.",
        "The feeder quickly sends balls to the left, to the right, and right at them.",
        "The defender digs or deflects each ball up and gets ready again right away.",
        "Go for a set time or number of reps, then switch."
      ],
      cues: [
        "Stay low with your hands out front, ready before the ball comes.",
        "Move your feet to the ball when you can, and use quick hands when you can't.",
        "Get back to ready the second you finish a dig."
      ],
      easier: "Slow it down and toss instead of hit so the defender has time to read each ball.",
      harder: "Speed up the feed, mix in tips and hard-driven balls, and make them control the dig, not just deflect it.",
      videoSearchUrl: v("Close-Range Reaction Digging")
    },

    // ===================== TEAM PLAY / GAMES =====================
    {
      id: "queen-of-the-court",
      name: "Queen of the Court",
      skill: "Team Play",
      ageMin: 10, ageMax: 18,
      difficulty: 3,
      minPlayers: 6,
      durationMin: 20,
      isStaple: true,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Teams of 2 or 3 rotate through a 'queen' (scoring) side and a challenger side, with more teams waiting. You only score on the queen side. It's the most popular competitive game in the sport, and players love it.",
      steps: [
        "One team holds the queen (scoring) side. A challenger team is across the net, with more teams waiting.",
        "A ball is put in play with a serve or toss, and the rally is played out.",
        "If the queens win, they score a point and stay. If they lose, they rotate off.",
        "If the challengers win, they cross over to become the new queens, and a waiting team comes in.",
        "Play to a target score or for a set time. Most points wins."
      ],
      cues: [
        "Use three contacts and talk to each other. Short games reward teams that play together.",
        "Serve and pass tough. Most rallies are won or lost on the very first ball.",
        "Remember, you can only score as the queens, so win that side."
      ],
      easier: "Play teams of three, let players toss the ball in instead of serving, and allow a catch-and-set for newer players.",
      harder: "Drop to 2v2 on a full court, make players serve it in, and make an ace or a stuff block worth two points.",
      videoSearchUrl: v("Queen of the Court")
    },
    {
      id: "narrow-court-line-battle",
      name: "Narrow-Court Line Battle",
      skill: "Team Play",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 4,
      durationMin: 14,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Teams play on a narrow court — just the line lane, about a third of the normal width. Every attack and dig happens down the line. It's a great way to sharpen line hitting, line defense, and ball control in a tight space.",
      steps: [
        "Tape or cone off a narrow lane down each line, about a third of the full court width.",
        "Small teams play regular rally scoring, but all attacks have to stay inside the narrow lane.",
        "Defenders learn to cover the line, and hitters learn to keep the ball in a small target.",
        "Play short games, then switch over to the cross-court lane for a new challenge."
      ],
      cues: [
        "Hit the line and keep it in. In a tight court, control beats power.",
        "Defenders, cover your line — that's where every ball is going.",
        "Three contacts and good placement win on the narrow court."
      ],
      easier: "Make the lane a little wider and allow a catch-and-set so rallies last while players get used to it.",
      harder: "Make the lane even narrower, require an attacked ball to score, and play the full length of the court.",
      videoSearchUrl: v("Narrow-Court Line Battle")
    },
    {
      id: "six-v-six-wash-scoring",
      name: "6v6 Wash Scoring",
      skill: "Team Play",
      ageMin: 14, ageMax: 18,
      difficulty: 4,
      minPlayers: 12,
      durationMin: 20,
      isStaple: false,
      isGame: true,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "Full 6v6 with 'wash' scoring: a team has to win two rallies in a row — a served ball, then a free ball — to earn a point. If they split the two, it 'washes' and nobody scores. This builds consistency.",
      steps: [
        "Put the first ball in play with a serve and play the rally out.",
        "Right away, toss a second ball (a free or down ball) to the team that just received.",
        "If one team wins both rallies, they score a point. If they split, no point.",
        "Play to a target score and rotate positions like normal."
      ],
      cues: [
        "Win the second ball. Being steady, not one big swing, is what wins washes.",
        "Side out first, then earn the bonus point with a clean transition.",
        "Talk every rally. Washes punish a team that goes quiet."
      ],
      easier: "Only require winning one rally to score while teaching the format, then add the second ball.",
      harder: "Make it so the second ball has to be sided out for a kill to count.",
      videoSearchUrl: v("6v6 Wash Scoring")
    },
    {
      id: "free-ball-transition",
      name: "Free-Ball Transition",
      skill: "Team Play",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 6,
      durationMin: 12,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "A coach tosses an easy 'free ball' over the net, and the team switches from defense to a full pass-set-hit attack. This is the most common scoring play in volleyball, so it's worth a lot of reps.",
      steps: [
        "Players start in their base defensive spots.",
        "The coach yells 'free!' and tosses an easy ball over the net.",
        "The team passes it to the setter, the setter sets it, and a hitter attacks.",
        "Reset and go again, rotating positions so everyone practices each job."
      ],
      cues: [
        "Yell 'free' loud and move to your offensive spots early.",
        "Pass the free ball high to the setter. Don't rush the swing.",
        "Everybody moves on every ball — passers to base, hitters to their approach."
      ],
      easier: "Catch and toss the first ball to slow the play down, just getting to the right spots.",
      harder: "Mix in free balls and harder down balls, and call a specific play (a quick, a back-row set) each time.",
      videoSearchUrl: v("Free-Ball Transition")
    },
    {
      id: "serve-receive-wash-game",
      name: "Serve-Receive Wash Game",
      skill: "Team Play",
      ageMin: 13, ageMax: 18,
      difficulty: 4,
      minPlayers: 8,
      durationMin: 15,
      isStaple: false,
      isGame: true,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "One team serves, the other receives and runs its offense. The scoring rewards clean passing and siding out. This sharpens the first-ball game that decides matches.",
      steps: [
        "The serving team serves into the receiving team's formation.",
        "The receiving team passes, sets, and attacks to try to win the rally (side out).",
        "Give a point for a successful side-out, and a point to the serving team when they force an error or score.",
        "Rotate the receiving team after each good side-out, and switch which team serves on a schedule."
      ],
      cues: [
        "The first contact wins matches. Pass the serve right to your target.",
        "Receivers, call the ball early and pass it with still arms.",
        "Servers, serve tough but in. A missed serve is a free point for them."
      ],
      easier: "Serve from closer in and count any good pass as a point to build confidence.",
      harder: "Add jump serves, make the receivers attack a real ball to side out, and grade every pass 0 to 3.",
      videoSearchUrl: v("Serve-Receive Wash Game")
    },

    // ===================== COOLDOWN =====================
    {
      id: "static-stretch-cooldown",
      name: "Static Stretch and Cooldown",
      skill: "Cooldown",
      ageMin: 8, ageMax: 18,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 8,
      isStaple: true,
      isGame: false,
      campFriendly: true,
      equipment: [],
      setup: "Bring the players together in open space after an easy jog. Stretching while the muscles are still warm helps them recover and stay flexible.",
      steps: [
        "Pull one arm across your chest, then reach the other hand behind your head for the triceps. Hold 20 to 30 seconds each side.",
        "Gently stretch your forearms and wrists, since that's your passing surface.",
        "Do standing quad, hamstring, and calf stretches, holding each side.",
        "Finish sitting down with a figure-four glute stretch and an easy twist."
      ],
      cues: [
        "Stretch until you feel a gentle pull, never to the point of pain.",
        "Breathe slowly and hold. Don't bounce.",
        "Give both sides the same amount of time."
      ],
      easier: "Hold each stretch for about 15 seconds and lean on a wall or partner for balance.",
      harder: "Hold each stretch longer (30 to 45 seconds) and add some light foam rolling for the shoulders, quads, and calves.",
      videoSearchUrl: v("Static Stretch and Cooldown")
    },
    {
      id: "cooldown-jog-and-breathing",
      name: "Cooldown Jog and Breathing",
      skill: "Cooldown",
      ageMin: 8, ageMax: 18,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 5,
      isStaple: false,
      isGame: false,
      campFriendly: true,
      equipment: [],
      setup: "An easy way to bring the heart rate down and wrap up practice. It's often done right before the stretching.",
      steps: [
        "Jog one or two easy laps or lengths of the gym at a relaxed, talking pace.",
        "Shake out your arms and legs while you walk the last length.",
        "Take several slow, deep breaths — in through the nose, out through the mouth.",
        "Circle up for a quick team talk or a few words about how practice went."
      ],
      cues: [
        "Keep it easy. This is recovery, not conditioning.",
        "Make your breath out longer than your breath in to settle down.",
        "End on a good note — name one thing that went well today."
      ],
      easier: "Walk instead of jog and keep it short for younger or tired groups.",
      harder: "Add some light leg swings and arm circles, and a short team chat about goals for next time.",
      videoSearchUrl: v("Cooldown Jog and Breathing")
    }

  ];

  RR.drills = (RR.drills || []).concat(more);
})(window.RR);
