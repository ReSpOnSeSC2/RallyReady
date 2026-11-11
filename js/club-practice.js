// Generates standalone indoor club practices from age group and available court time.
window.RR = window.RR || {};

RR.clubPractice = (function () {
  "use strict";

  var ageGroups = ["13U", "14U", "15U", "16U"];
  var minMinutes = 30;
  var maxMinutes = 180;
  var durationOptions = [45, 60, 75, 90, 105, 120];
  var sources = [
    { label: "USA Volleyball · Lesson Plans for Teachers and Coaches", url: "https://usavolleyball.org/resources-for-coaches/lesson-plans/" },
    { label: "USA Volleyball · How To Make Drills That Work", url: "https://usavolleyball.org/resource/how-to-make-drills-that-work/" },
    { label: "USA Volleyball · Building Complete Players at 14U and 16U", url: "https://usavolleyball.org/resource/kevin-hambly-blog-building-complete-players-at-14u-and-16u/" },
    { label: "FIVB · Coaches Manual, Practice and Drills Design", url: "https://www.fivb.com/wp-content/uploads/2024/03/FIVB_Coach_Manual_EN.pdf" }
  ];

  var profiles = {
    "13U": {
      opening: "Use short demos and one cue at a time. Rotate everyone through first, second, and third contact so all players learn each job.",
      formation: "3v3 on a narrowed court or 4v4 if both sides can cover their space. Rotate extra athletes in every three starts. With twelve, use two 3v3 courts if both games have clear space.",
      rotation: "After three rally starts, change servers and rotate all players through pass, set, and send roles.",
      release: "Start each sequence from a stable ready position and name the ball owner before contact.",
      serve: "Start just beyond the attack line for players who need it. Move back one step after two of three legal serves.",
      small: "With 4–5, play 2v2 with a rotating feeder. With 6–7, play 3v3 and rotate any extra player in every three starts."
    },
    "14U": {
      opening: "Give one team cue and one individual cue. Keep a stable pattern for the first round, then vary the ball so players have to read and decide.",
      formation: "4v4 with three passers and a setter on receive. Add a fifth player per side when numbers allow, and rotate remaining athletes in every three starts.",
      rotation: "Rotate after a side-out and change the setter between mini-sets so second-contact reps are shared.",
      release: "Have players state the seam owner or second-ball option before the server is ready.",
      serve: "Use end-line serves when reliable. Shorten the distance for players who need it and ask consistent servers to call left or right half before contact.",
      small: "With 4–5, use 2v2 on a narrow court with a rotating feeder. With 6–7, use 3v3 with a designated setter on each side."
    },
    "15U": {
      opening: "Assign roles for each round and rotate setters and emergency setters. Ask a player to explain their read once between rounds, then return to play.",
      formation: "Use 4v4 with eight or nine, with the ninth scoring and rotating in every three starts. Use 5v5 with ten or eleven and 6v6 with twelve. Name a setter and available pin attacker on each side.",
      rotation: "Rotate on side-out. Switch the designated setter or the second-ball helper at each mini-set reset.",
      release: "Players declare their first option before the start and communicate the next-best option as the ball changes.",
      serve: "Serve from the end line to two designated lanes. Call the lane first and keep the same pre-serve routine under score pressure.",
      small: "With 4–5, play 2v2 with a rotating feeder. With 6–7, use 3v3 with one front-row attacker and a backup setter named before each rally."
    },
    "16U": {
      opening: "Use your existing system and current lineup. Train the next contact when the plan breaks down, including a named backup setter and clear coverage responsibility.",
      formation: "Use 6v6 in your current system with twelve, or 5v5 with ten or eleven. Use 4v4 with eight or nine and keep your second-contact and coverage assignments. Any extra athlete scores and rotates in every three starts.",
      rotation: "Rotate on side-out. Begin each mini-set in a different rotation, including one the team struggles to score from.",
      release: "Have the captain call the pattern before the start. After the first ball, players solve the next phase without another coach cue.",
      serve: "Serve from the end line to a seam or short/deep target. Keep the target decision and routine when the scoreboard gets tight.",
      small: "With 4–5, play 2v2 with a rotating feeder. With 6–7, run 3v3 and keep a named second-ball helper and agreed blocking/defense assignments."
    }
  };

  // Each focus has a first-touch or decision block, a linked team drill, and
  // age-specific constraints used in both live play and the coach's scorecard.
  var themes = [
    {
      key: "first-contact", title: "Win the First Contact", skill: "Passing", focus: "First contact & rally building",
      headline: "Turn the first ball into a playable second contact, then build a three-contact rally.",
      prep: "Mark a setter target just right of center and comfortably off the net. Keep cones outside the court and use floor-safe tape or court lines for targets.",
      cue: "Call early. Send the ball to a teammate.",
      debrief: "What did you see before you called the ball, and where did your teammate need it?",
      sampleLabel: "Playable first contacts", rallyLabel: "Three-contact returns",
      eligible: "a legal serve or controlled over-net start",
      pressureStart: "Alternate a short and deep controlled serve across the net. Once both sides have a playable first ball, let the server choose the depth.",
      game: { title: "Three-Contact Rally Game", start: "Start with a controlled serve across the net. Move in for less consistent servers and move back as rallies get longer." },
      build: {
        title: "Pass to a Teammate",
        why: "Read a ball crossing the net and send the first contact to a moving teammate.",
        setup: "Make two narrow lanes if space permits. Each lane has a feeder across the net, a passer in the backcourt, and a target off the net. Keep spare balls in the cart.",
        steps: ["The feeder sends a controlled ball over the net. The passer calls it, moves behind its path, and sends it high enough for the target to reach.", "The target catches the pass for this first round and calls ‘playable’ if they can catch it on their feet before it crosses the net. Rotate feeder, passer, and target every three balls."],
        cues: ["See the feeder's contact.", "Quiet platform, angle to your teammate."],
        easier: "Toss higher from closer to the net and widen the target window.",
        harder: "Make the target set instead of catch and let the feeder choose short or deep without warning."
      },
      link: {
        title: "Call, Pass, Set, Send",
        why: "Connect the pass to a second-contact decision and a controlled ball over the net.",
        setup: "Put a triangle of players on each side of a narrow court, with two available for first contact and one near the target. Add players outside the triangle as the group grows.",
        steps: ["Send a controlled ball across the net. The two passers settle the seam with an early call while the target moves to the pass.", "Build three contacts and direct the third ball into playable space. The other side tries the same sequence. After the rally, the team that did not start the last ball starts the next one."],
        cues: ["Say mine early.", "Give the second contact time.", "Get ready again after you send."],
        easier: "Use a slower ball start and permit one catch-and-release on the second contact for the first round.",
        harder: "Start from a serve and remove any catch allowance. After the third contact, recover immediately to defensive base."
      },
      ages: {
        "13U": { demand: "Use a two-person seam. Start with over-net tosses, then switch to short-distance serves once the group controls the first ball.", check: "an early call and a first ball a teammate can play before it crosses the net", rally: "three contacts with a controlled third ball over the net", samples: 6, rallies: 4 },
        "14U": { demand: "Assign a seam owner before the ball starts. Mix shallow and deep balls, and ask the off-passer to offer a third-contact option.", check: "the correct seam owner sending a playable first ball to the target", rally: "three contacts and a third ball directed away from the nearest defender", samples: 7, rallies: 5 },
        "15U": { demand: "Show a three-passer pattern. On an off-target pass, call for a high outside set and have the third-contact player change their approach.", check: "a playable pass that leaves the setter at least one deliberate attack option", rally: "a three-contact return with a usable set and visible attack coverage", samples: 7, rallies: 5 },
        "16U": { demand: "Start in two different receive rotations. The serving side picks a seam, and the receiving side uses an emergency setter when its setter takes the first ball.", check: "a playable pass with the team naming the correct second-contact player", rally: "a three-contact attack that uses the planned option or a called out-of-system option", samples: 8, rallies: 6 }
      }
    },
    {
      key: "side-out", title: "Serve to Side-Out", skill: "Serving", focus: "Serve pressure & side-out",
      headline: "Make serves with intent and build an attack when the other team serves.",
      prep: "Mark a left-half and right-half serve target. At 15U and 16U, add a short/deep landmark using court lines or floor-safe tape.",
      cue: "Pick the target, use your routine, and get to base.",
      debrief: "Which serve made the first ball hardest, and what helped you attack on receive anyway?",
      sampleLabel: "Serves to the called target", rallyLabel: "Side-outs on first attack",
      eligible: "a legal serve",
      pressureStart: "Begin with the same receiving rotation on three live serves. Have the serving side change depth or direction on the third ball.",
      game: { title: "Side-Out Bonus Game", start: "Begin each rally with a serve. Change the starting receiving rotation each mini-set, or change the receive positions for small teams." },
      build: {
        title: "Serve to a Called Lane",
        why: "Give each server a repeatable routine and a reason to aim every ball.",
        setup: "Set a server across the net from one or two passers and a target. Use parallel lanes only if serves and returns stay clear of each other.",
        steps: ["The server calls the target area to the scorer, takes the same breath and look, then serves. The passer plays any legal serve to a target off the net.", "Serve three balls, then rotate server to passer to target. Park loose balls until the lane is dead. Servers recover to a ready base inside the court after contact."],
        cues: ["See your target before the toss.", "Reach through contact.", "Land balanced and move to base."],
        easier: "Move the serving line forward and make one half of the court the target.",
        harder: "Keep the end line and shrink the target to a seam or short/deep band."
      },
      link: {
        title: "First-Swing Side-Out",
        why: "Connect the receive pattern, setting choice, and first attack against a real serve.",
        setup: "One side starts in serve receive with an available setter and attacker. Put a server and enough defenders to play the first swing across the net.",
        steps: ["The receiving captain names seam responsibility. Serve a live ball and play it out. When the ball is off target, the nearest non-passer calls the second contact.", "Rotate the serving player every three starts. At the midpoint, switch serving and receiving sides and start in a different receive rotation or pass formation."],
        cues: ["Name the seam before the whistle.", "See the ball before you release.", "Off the net, give the hitter height."],
        easier: "Bring the server in and give the receiving group a stable seam for the first round.",
        harder: "Let servers change depth without warning and begin in the receiving team's hardest rotation."
      },
      ages: {
        "13U": { demand: "Use broad left/right serve targets and a clearly named second-ball player. Allow a controlled third contact as the first attack.", check: "a legal serve delivered to the called half", rally: "the receiving team winning the point on a controlled third contact", samples: 5, rallies: 3 },
        "14U": { demand: "Run three-person receive and serve to left or right half. On an off-target pass, use a high ball to a ready outside attacker.", check: "a legal serve delivered to the called half from the player's assigned line", rally: "a rally win on the receiving team's first attack, including a deliberate roll shot", samples: 6, rallies: 4 },
        "15U": { demand: "Have servers choose a seam or deep corner. The receiving side sets either pin on a good pass and uses a high pin ball on an off-target pass.", check: "a legal end-line serve that enters the called seam or corner area", rally: "a rally win on the receiving team's first attack with the expected in-system or emergency option", samples: 6, rallies: 4 },
        "16U": { demand: "Start in a weaker receive rotation, then change the server's target from seam to short/deep. Make the receiving side preserve its first-swing options under pressure.", check: "a legal end-line serve that enters the called seam or short/deep target", rally: "a rally win on the first attack against a legal serve in the selected rotation", samples: 7, rallies: 5 }
      }
    },
    {
      key: "attack-choice", title: "Attack the Open Court", skill: "Hitting", focus: "Attack choices & coverage",
      headline: "Match the attack to the quality of the set and the space the defense leaves open.",
      prep: "Leave a clear approach and landing area at each pin. Mark a deep corner and a short seam using court lines or flat tape.",
      cue: "Read the set, see the space, and make a shot you can control.",
      debrief: "Which set let you swing freely, and what shot kept you in the rally on a tough set?",
      sampleLabel: "Smart attack decisions", rallyLabel: "Purposeful attacks in play",
      eligible: "an attackable third contact, including off-net opportunities",
      pressureStart: "Start with a free ball and make the first available set high and off the net. On the next rally, let the setter use whatever the pass allows.",
      game: { title: "Open-Court Bonus Game", start: "Start with a serve. The receiving side plays to the best available attack and gets into coverage before the hitter contacts the ball." },
      build: {
        title: "Read the Set, Pick the Shot",
        why: "Build a controllable attacking answer for a good set and a set off the net.",
        setup: "Put a passer and setter on one side and a defender across the net. Start with one attacking lane and move the spare-ball cart away from the hitter's landing path.",
        steps: ["A player sends a controlled first ball over the net. Pass to the setter, who mixes a usable pin set with a higher ball off the net.", "The hitter reads the set and the defender before choosing a deep or short shot. The defender plays it up when possible. Rotate hitters after three attacks and switch defenders at the midpoint."],
        cues: ["See the set before committing to the approach.", "Keep the ball in front of your hitting shoulder.", "Land balanced with space to recover."],
        easier: "Use standing contacts and leave one large target open for the whole first round.",
        harder: "Let the defender change starting depth late and add a single controlled block if players can land safely."
      },
      link: {
        title: "Attack, Cover, Reload",
        why: "Connect the attack decision to coverage and the next swing.",
        setup: "Use a narrowed court or full width with two teams. Give the attacking side one near-cover player and one deeper helper, and put a defender in each visible target area.",
        steps: ["Start with a free ball or controlled serve. The hitter reads the set and defense. As the hitter goes, the closest teammate covers short and the next teammate protects deeper space.", "Play the rally out. If the ball comes back, ask the attacking team to return to its approach and coverage positions before the next set. Alternate the starting side after each rally."],
        cues: ["Attack space you can see.", "Get low beside the hitter and leave the landing lane clear.", "Cover, then reload."],
        easier: "Use a free-ball start and one visible deep defender. Keep the first contact grounded if spacing is tight.",
        harder: "Add a legal live block and vary the pass quality so the hitter must pick a different answer under pressure."
      },
      ages: {
        "13U": { demand: "Use standing or low-jump attacks. Offer two big targets and ask the hitter to name the open one after the rally.", check: "a balanced attack that reaches the open short or deep half", rally: "a third contact directed into the open half and kept in bounds", samples: 5, rallies: 4 },
        "14U": { demand: "Compare a controlled swing on a good set with a roll shot on an off-net set. Assign one teammate to cover short.", check: "a controlled swing or roll shot that fits the quality of the set", rally: "an intentional in-bounds attack with a teammate in short coverage", samples: 6, rallies: 4 },
        "15U": { demand: "Show the hitter a late-changing defender and mix on- and off-net sets. Teach a deep corner swing on a good ball and a high, deep roll on a difficult one.", check: "an in-bounds attack that matches both set quality and the defender's position", rally: "an intentional in-bounds attack with short and deep coverage in place", samples: 7, rallies: 5 },
        "16U": { demand: "Use the real block and floor defense when numbers allow. Attack the available seam against one blocker or choose a controlled deep shot when the set takes away a hard swing.", check: "an in-bounds attack choice that accounts for set quality, the block, and the floor defense", rally: "an intentional in-bounds attack with coverage, followed by an immediate defensive reset", samples: 7, rallies: 6 }
      }
    },
    {
      key: "transition", title: "Defend and Transition", skill: "Defense", focus: "Defense-to-offense transition",
      headline: "Turn a defensive touch into a playable set and an organized counterattack.",
      prep: "Choose defensive base and the first counterattack option before the team comes in. Place the ball cart outside the sideline where defenders will never chase through it.",
      cue: "Read the hitter, dig high, and get available again.",
      debrief: "What was your next job after the dig, and who set when the setter had to play the first ball?",
      sampleLabel: "Playable digs", rallyLabel: "Organized counterattacks",
      eligible: "an opponent attack into the court",
      pressureStart: "Start each rally from a controlled attack over the net. Send one at a backcourt defender and one at the setter to make the backup option live.",
      game: { title: "Counterattack Bonus Game", start: "Play most rallies from a serve. At the first two starts of each mini-set, use a controlled attack instead. Feed one to each side." },
      build: {
        title: "Dig, Release, Attack",
        why: "Train the defender's read and the teammates' next jobs immediately after the dig.",
        setup: "Place a controlled attacker across the net. On the defensive side, put a digger in base, a second-contact player off the net, and an available pin attacker.",
        steps: ["The attacker sends a standing down ball or roll shot over the net. The defender starts in base, reads contact, and lifts the dig to the middle of the court.", "The second-ball player calls, sets a high option, and the attacker returns the ball with control. Rotate defenders after three starts. The feeder waits for the return ball to be cleared before restarting."],
        cues: ["Stop your feet as the hitter contacts.", "Dig high into the court.", "Make yourself an option after the dig."],
        easier: "Send higher, slower shots and designate a fixed second-ball helper.",
        harder: "Add a tip and deep shot without warning. Send one ball at the setter to trigger the backup setting plan."
      },
      link: {
        title: "Transition Twice",
        why: "Reorganize immediately after an attack, then turn the next dig into another playable attack.",
        setup: "Use two teams with a defender and attack option on each side. Keep one feeder with a cart beyond the sideline and identify the backup setter before play.",
        steps: ["The feeder sends the first playable attack over the net. Both teams play the rally to the floor and move to defense as soon as their third ball crosses.", "Once the first ball is dead and the floor is clear, feed a second ball to the other side. If its setter digs, the backup calls and takes second contact. Change feeders or starting defenders every three sequences."],
        cues: ["Base before contact.", "Setter out, helper in.", "See the set and build an approach."],
        easier: "Feed two controlled standing attacks into the middle of the court and use one high attack option.",
        harder: "Let the second ball start with a live opposing hitter, and mix which defender has to take it."
      },
      ages: {
        "13U": { demand: "Start with rolled balls and no live block. Give one player the second-contact job and let another send a standing third ball across.", check: "a dig high enough for a teammate to play a second ball", rally: "a dig followed by two controlled contacts and a ball over the net", samples: 5, rallies: 3 },
        "14U": { demand: "Mix short tips and deep down balls. The setter calls help when taking first contact, and the nearest available teammate sets high.", check: "a playable dig and an audible second-ball call", rally: "a dig, an identified second-ball player, and a controlled transition attack", samples: 6, rallies: 4 },
        "15U": { demand: "Start defenders in base against a pin attacker. Add a single blocker when ready and ask defenders to move in relation to the block.", check: "a dig to a playable inside window after the defender adjusts to the attacker", rally: "a playable dig followed by a called high pin option or another available attack", samples: 7, rallies: 5 },
        "16U": { demand: "Coordinate your current block and backcourt scheme against alternating pin attacks. When the setter takes the first ball, the designated backup sets the best available pin.", check: "a playable dig with the correct second-contact owner named before the ball drops", rally: "a dig followed by a called counterattack and an immediate return to defensive base", samples: 7, rallies: 6 }
      }
    },
    {
      key: "setting", title: "Set an Attackable Ball", skill: "Setting", focus: "Second contact & setter–hitter connection",
      headline: "Give the hitter a ball they can attack, even when the first pass moves the setter.",
      prep: "Mark a starting setter target off the net and agree on an attackable window with each hitter. Keep the hitter's approach and landing lanes clear.",
      cue: "Beat the ball to the spot and set a window your hitter can reach.",
      debrief: "Which set let your hitter make a decision, and what changed when the pass pulled you away?",
      sampleLabel: "Sets in the attack window", rallyLabel: "Attackable second contacts in play",
      eligible: "a first contact that a teammate can reach for a set",
      pressureStart: "Send a ball over the net to the passer on each start. Mix a pass that lets the setter release to target with one that takes the setter away from it.",
      game: { title: "Set to Score", start: "Begin with a serve. The second-contact player calls for the ball while the hitter shows an available approach." },
      build: {
        title: "Find the Hitter's Window",
        why: "Rehearse moving to the pass and giving the hitter a playable trajectory.",
        setup: "One player starts across the net with the ball. On the other side, set a passer in the backcourt, a setter near the target, and a hitter outside the approach lane.",
        steps: ["Send a controlled ball across the net. Pass to a target near the setter, who calls the second ball and moves to it. The hitter shows their approach as the pass travels.", "Have the hitter return the ball with control and say whether the set was in reach. Switch setters after three sets and trade hitters and passers halfway through."],
        cues: ["Call before you move through a teammate's space.", "Get balanced under the ball when time allows.", "Give the hitter room between the ball and the net."],
        easier: "Use a predictable first ball and let the hitter catch at the attack window before adding a standing contact.",
        harder: "Vary the pass so the setter has to move. Ask the hitter to change their route and keep the ball playable."
      },
      link: {
        title: "Set From Where the Ball Takes You",
        why: "Choose the available hitter from both an on-target and an off-target pass.",
        setup: "Set two teams across the net. Give each side at least one available attack and a backup setter. Where numbers allow, give the setter a left and right option.",
        steps: ["Start from a controlled serve or free ball. The first contact reads the start, then the setter calls the ball and chooses the best available set. The hitter aims for a controlled third ball over the net.", "Play out the rally. If a setter plays first contact, the backup sets. Rotate the second-contact jobs every three starts so players practice reading both sides of the exchange."],
        cues: ["Call the second ball early.", "Give height if the ball pulls you off the net.", "Set the teammate who is ready."],
        easier: "Use one hitter option with a generous set window and start with a slow over-net ball.",
        harder: "Let the defending side show where it is strongest and have the setter use the other option when the pass allows."
      },
      ages: {
        "13U": { demand: "Rotate every player through setting. Use one high target and allow a forearm set when the ball is too low to set overhead.", check: "a high second ball that reaches a waiting hitter off the net", rally: "a called second contact the hitter can return with control", samples: 5, rallies: 4 },
        "14U": { demand: "Mix a pass near target with one off the net. Give the hitter a high outside ball in both cases and compare how the setter gets there.", check: "a set a moving outside hitter can reach without chasing into the net", rally: "an attackable high ball to an available hitter after the setter moves to the pass", samples: 6, rallies: 5 },
        "15U": { demand: "Offer both pins when the pass is good. When the pass pulls the setter out, choose a high set to the hitter with a stable approach.", check: "an attackable set to the correct available option for that pass", rally: "an attackable set to the chosen pin and a controlled attack", samples: 7, rallies: 5 },
        "16U": { demand: "Use your team's current set calls on a good pass. When the setter digs or the pass breaks the system, name the backup and set a high ball to the best available pin.", check: "a set in the called attack window or an attackable out-of-system alternative", rally: "an attackable set at the called tempo or a called backup set that preserves a deliberate attack", samples: 7, rallies: 6 }
      }
    },
    {
      key: "block-defense", title: "Connect Block and Defense", skill: "Blocking", focus: "Blocking reads & floor defense",
      headline: "Make the block and floor defense work together against the opponent's next attack.",
      prep: "Pick which angle the block will protect. Agree on the corresponding floor-defense base and clear the net area before players work on block moves.",
      cue: "Read the set, name the angle, and be ready for the attack.",
      debrief: "What did the blocker take away, and where did that leave the next ball for the defense?",
      sampleLabel: "Block and defense in position", rallyLabel: "Playable balls from the defensive read",
      eligible: "an opponent's pin attack into the court",
      pressureStart: "Start with a controlled pass and mix left and right sets or alternate a pin set with a high off-net ball. Begin with standing attackers if players need time to read and move.",
      game: { title: "Block and Dig Bonus Game", start: "Start from a serve or free ball. The attacking side uses its available pin and the other side adjusts the block and floor before contact." },
      build: {
        title: "Read the Set and Own an Angle",
        why: "Train the movement to the net and show defenders where the attack can still go.",
        setup: "Put a setter and controlled pin attacker on one side, and a front-row reader and floor defender on the other. Keep the cart and waiting athletes out of the net and approach areas.",
        steps: ["A player sends a playable ball over the net. The setter sends it to the pin. The blocker reads the set, moves to the agreed angle, and stops balanced. The floor defender moves to cover the other angle.", "The hitter uses a standing roll or controlled swing to the open space. Play the dig up or catch if you are rehearsing the footwork. Switch blocker and defender after three balls."],
        cues: ["Track the ball from the setter to the hitter.", "Close the space before you rise.", "Land on your side with room to recover."],
        easier: "Remove the jump, use a predictable pin, and walk the block and defender through their spots once.",
        harder: "Let the setter choose either pin, then ask the block and floor to adjust together."
      },
      link: {
        title: "Show the Block, Play the Dig",
        why: "Connect the block call to the defender's first step and keep a playable dig in the rally.",
        setup: "Use two teams across the net. Put one designated blocker and one backcourt defender on each side to start, then add teammates to form the regular defense.",
        steps: ["Start from a serve or controlled ball over the net. The attacking side builds a pin attack, while the block names its angle and the defender moves to the remaining window.", "Play the rally out after the dig or block touch. After three starts, rotate players through the front-row read and backcourt roles, then alternate the starting side."],
        cues: ["Call line or angle before contact.", "Defend the space the block leaves.", "High dig, then get available again."],
        easier: "Use a standing block read and a predictable high set to one side, then restart when the defense is balanced.",
        harder: "Use a live pin attack and mix a tip behind the block with a deep shot."
      },
      ages: {
        "13U": { demand: "Shadow the block without jumping. Walk through one pin and one floor-defense spot before adding a controlled shot to that defender.", check: "a balanced front-row read and a defender ready in the open space by hitter contact", rally: "a floor defender in the called space playing the ball up for a teammate", samples: 5, rallies: 3 },
        "14U": { demand: "Use one blocker to take the called line or angle. Add a low controlled jump after the footwork and landing are consistent.", check: "a blocker taking the called angle and a defender set in the remaining window at hitter contact", rally: "a playable dig or block touch after the block and floor cover different spaces", samples: 6, rallies: 4 },
        "15U": { demand: "Train a pin blocker with a second blocker if numbers allow. The pin calls the angle, the teammate closes under control, and the backcourt shifts with them.", check: "the block taking its called angle without a gap where two blockers join, and the floor adjusting", rally: "a playable first ball off the agreed block and floor-defense shape", samples: 6, rallies: 5 },
        "16U": { demand: "Use your current block and floor system with two available pins. When a second blocker cannot close in time, call one block and have the floor adjust.", check: "a correct single or double block call with the floor defense in the corresponding position", rally: "a playable dig or block touch from the team's called shape, followed by an organized second contact", samples: 7, rallies: 5 }
      }
    }
  ];

  var equipment = ["One indoor court and net", "6–12 volleyballs and a cart", "Flat tape or existing court lines", "Scoreboard or clipboard", "Player water bottles"];
  var courtGear = ["balls", "net"];
  var starterThemeCount = 4;

  function measure(amount, length) {
    return Math.ceil(amount * length / 10) + " of the first " + length;
  }

  function materializeBlock(id, role, skill, content, minutes, startMinute) {
    return {
      id: id,
      role: role,
      title: content.title,
      minutes: minutes,
      startMinute: startMinute,
      endMinute: startMinute + minutes,
      why: content.why,
      drill: {
        id: id,
        name: content.title,
        skill: skill,
        durationMin: minutes,
        setup: content.setup,
        steps: content.steps.slice(),
        cues: content.cues.slice(),
        equipment: (content.equipment || courtGear).slice(),
        scoring: content.scoring,
        easier: content.easier,
        harder: content.harder,
        isGame: role === "Compete"
      }
    };
  }

  function warmUp(theme, profile, minutes) {
    var movementMinutes = Math.floor(minutes / 2);
    return {
      title: "Movement & First Touches",
      why: "Prepare to change direction, land, and handle a ball coming from the other side.",
      setup: "Start in clear sideline-to-sideline lanes. Set a ball per pair or trio near the net and keep balls off the movement lanes.",
      steps: [
        "Use the first " + movementMinutes + " min for an easy jog, lateral shuffles, hip and shoulder movement, and controlled stops. Add a few low jumps with balanced landings as players warm up.",
        "Move to pairs across the net. Start with controlled toss, pass, and catch, then return the ball with a playable contact where possible. Switch roles every three balls.",
        "Use the last minute to demo today's first sequence and tell players what to watch for. " + profile.release
      ],
      cues: ["Quiet feet on the stop.", "Land balanced.", theme.cue],
      scoring: "Each pair makes three playable exchanges. An exchange counts when both players can keep it going without chasing a loose ball.",
      easier: "Use a shorter distance and one catch on each side.",
      harder: "Alternate short and deep feeds and keep the same balanced stop before contact."
    };
  }

  function servePrep(profile) {
    return {
      title: "Serve, Receive, Recover",
      why: "Rehearse a steady serve routine and transition into the next job.",
      setup: "Set a server, receiver, and target in each usable lane. Mark the serving line and use an existing court line to divide the targets.",
      steps: [
        profile.serve,
        "Serve three balls. Passers send a high ball to a teammate, who holds it until the lane is clear. The server gets to base after each contact.",
        "Rotate server to passer to target. Give every player a serving turn before you move the start line."
      ],
      cues: ["Breathe, look, serve.", "Move in after contact."],
      scoring: "A batch succeeds when two of three serves are legal. After two successful batches, narrow the target or move the line back one step.",
      easier: "Move closer and use a whole half of the court as the target.",
      harder: "Call a short or deep target and serve it at 23–23 with the same routine."
    };
  }

  function skillBuild(theme, age, sampleLength) {
    var drill = theme.build;
    return Object.assign({}, drill, {
      steps: [drill.steps[0], age.demand, drill.steps[1]],
      scoring: "Target " + measure(age.samples, sampleLength) + " attempts with " + age.check + ". Have one coach or player tally attempts and successes."
    });
  }

  function teamPlay(theme, profile, age) {
    var drill = theme.link;
    return Object.assign({}, drill, {
      setup: drill.setup + " " + profile.formation,
      steps: drill.steps.concat([age.demand]),
      scoring: "Give the team a tally for " + age.rally + ". Aim for two successes in a row before adding the harder option."
    });
  }

  function waterBreak(theme, nextTitle) {
    return {
      title: "Water & Court Reset",
      why: "Use the reset to drink and move directly into the next setup.",
      setup: "Park the balls, then send players to their water bottles. Keep the court clear during the break.",
      steps: [
        "Give players time to drink. If an assistant is available, have them move any target markers and arrange the next group.",
        "Bring players back for " + nextTitle + ". Name the first group on court and assign the first ball."
      ],
      cues: [theme.cue, "Know your first job before play restarts."],
      equipment: []
    };
  }

  function pressure(theme, profile, age) {
    return {
      title: "Solve the Tough Ball",
      why: "Practice the same team decision when the first option is under pressure.",
      setup: profile.formation + " Give the waiting players the score and the ball cart. Mark the safe feed lane before play.",
      steps: [
        theme.pressureStart,
        age.demand,
        "Play four starts as one round. After each round, swap the receiving side and give players one question: What changed your decision?"
      ],
      cues: [theme.cue, "Name the next option out loud."],
      scoring: "A successful start has " + age.rally + ". Aim for two of four before adding pace or changing the start rotation.",
      easier: "Tell players where the ball will come from and reduce the pace until they can solve it twice.",
      harder: "Hide the starting location or quality until contact. Keep the same success criteria."
    };
  }

  function compete(theme, profile, age, sampleLength, minutes) {
    var gameTarget = minutes < 10 ? 5 : 9;
    return {
      title: theme.game.title,
      why: "See whether the team can use today's skill while trying to win the point.",
      setup: profile.formation + " Put a scorer by the sideline. Give both teams the bonus rule before the first ball.",
      steps: [
        theme.game.start,
        "Play every ball to the floor or a fault. " + profile.rotation,
        "Play to " + gameTarget + ", win by one, then restart if the clock allows. At the buzzer, finish the rally in play and record the scores."
      ],
      cues: [theme.cue, "Call the score before you serve."],
      scoring: "Award one point for the rally win. Add a bonus point if the winning side met this criterion: " + age.rally + ". On the scorecard, tally that criterion on the first chance per rally. Count rallies with " + theme.eligible + " and target " + measure(age.rallies, sampleLength) + ".",
      easier: "Shorten the serve or start with a playable ball over the net. Keep the same bonus so players know what success looks like.",
      harder: "Use a full serve and a tougher starting rotation or court position. Allow the players to run their own reset."
    };
  }

  function matchFinish(theme, profile, age) {
    return {
      title: "Scoreboard Finish",
      why: "Carry the practiced skill into normal scoring with a close scoreboard.",
      setup: profile.formation + " Set the score to 20–20 and begin with a different starting lineup or on-court role assignment.",
      steps: [
        "Begin at 20–20 and play to 25. Play one deciding point at 24–24. Use normal rally scoring and apply your division's playing rules.",
        "Between mini-sets, change the first server and swap which side begins in its toughest rotation or spacing. " + profile.rotation,
        "Close with one uninterrupted mini-set. Ask the scorekeeper to tally the focus while you coach the next-ball response."
      ],
      cues: [theme.cue, "Reset with your teammates after the point."],
      scoring: "Use one point per rally. Off the scoreboard, count how many eligible rallies include " + age.rally + ". Compare the result with the bonus game.",
      easier: "Use a 4v4 half-width court or a shorter serving line and keep the close score.",
      harder: "Start one side down 20–22 in a difficult rotation and let the players call their own adjustments."
    };
  }

  function closePractice(theme) {
    return {
      title: "Cool Down & Debrief",
      why: "Bring the session to a clear close and leave with a measure to use next practice.",
      setup: "Put balls away and gather outside the court with water and the scorecard.",
      steps: [
        "Walk together until breathing settles. Use easy shoulder, hip, and ankle movement and give players a chance to drink.",
        "Ask the team: " + theme.debrief,
        "Record successes and attempts for both scorecard measures. Ask one player to name a cue they will use next practice and choose one team action to repeat."
      ],
      cues: ["Name one thing that helped you make the next contact."],
      equipment: []
    };
  }

  // Reserve preparation, hydration, and closing time first. The remaining
  // minutes follow the skill-to-game progression, rounded by largest remainder.
  function buildSchedule(total, theme, profile, age, sampleLength) {
    var warmMinutes = total >= 105 ? 12 : total >= 65 ? 10 : total >= 45 ? 8 : 7;
    var closeMinutes = total >= 105 ? 6 : total >= 65 ? 5 : total >= 45 ? 4 : 3;
    var schedule = [];
    function fixed(key, role, skill, content, minutes) {
      schedule.push({ key: key, role: role, skill: skill, content: content, minutes: minutes });
    }
    function active(key, role, skill, content, minutes, weight) {
      schedule.push({ key: key, role: role, skill: skill, content: content, minutes: minutes, weight: weight });
    }
    function water(key, nextTitle, minutes) {
      fixed(key, "Water break", "Cooldown", waterBreak(theme, nextTitle), minutes);
    }

    fixed("warm-up", "Warm-up", "Warmup", warmUp(theme, profile, warmMinutes), warmMinutes);
    if (total >= 75) active("serve-prep", "Serve", "Serving", servePrep(profile), 6, 7);
    active("build", "Skill", theme.skill, skillBuild(theme, age, sampleLength), 5, 11);
    if (total >= 65) water("water-first", theme.link.title, 2);
    active("link", "Team play", theme.skill, teamPlay(theme, profile, age), 6, 14);
    water("water-main", total >= 100 ? "Solve the Tough Ball" : theme.game.title, total >= 90 ? 3 : 2);
    if (total >= 100) active("pressure", "Pressure", theme.skill, pressure(theme, profile, age), 7, 10);
    if (total >= 115) water("water-pressure", theme.game.title, 3);
    active("game", "Compete", "Team Play", null, 7, 16);
    if (total >= 140) {
      water("water-game", "Scoreboard Finish", 3);
      active("match-finish", "Compete", "Team Play", matchFinish(theme, profile, age), 8, 10);
    }
    fixed("close", "Cool-down", "Cooldown", closePractice(theme), closeMinutes);

    var activeBlocks = schedule.filter(function (entry) { return entry.weight; });
    var extra = total - schedule.reduce(function (sum, entry) { return sum + entry.minutes; }, 0);
    var weightSum = activeBlocks.reduce(function (sum, entry) { return sum + entry.weight; }, 0);
    var spare = extra;
    activeBlocks.forEach(function (entry) {
      var whole = Math.floor(extra * entry.weight / weightSum);
      entry.minutes += whole;
      entry.remainder = extra * entry.weight % weightSum;
      spare -= whole;
    });
    activeBlocks.sort(function (a, b) { return b.remainder - a.remainder; });
    activeBlocks.slice(0, spare).forEach(function (entry) { entry.minutes += 1; });

    var game = schedule.find(function (entry) { return entry.key === "game"; });
    game.content = compete(theme, profile, age, sampleLength, game.minutes);
    activeBlocks.forEach(function (entry) {
      if (entry.minutes < 20) return;
      var steps = entry.content.steps.slice();
      steps.splice(steps.length - 1, 0, "Near halfway, take 30–60 seconds for water, rotate roles, and have each group name its next adjustment.");
      entry.content = Object.assign({}, entry.content, { steps: steps });
    });
    return schedule;
  }

  function adaptations(profile) {
    return [
      { label: "4–7 players", description: profile.small },
      { label: "13+ players", description: "Run parallel short courts during skill work where space and staffing allow. For full-court play, rotate extra athletes in every three starts and give players off court the score and ball cart." },
      { label: "One coach", description: "Put a captain on each side to call the next starter and tally the score. Coach from the sideline where you can see both sides and pause play before collecting stray balls." },
      { label: "Limited space or gear", description: "Use existing court lines instead of markers and shrink the court width. One ball per lane is enough. If a net is unavailable, use a visible divider secured outside play and keep starts and returns on opposite sides." },
      { label: "Mixed experience", description: "Use the easier option for groups still making the ball playable. Give experienced players the harder version of the same decision and rotate roles so all players get first, second, and third contacts." }
    ];
  }

  function generate(ageGroup, minutes, variation) {
    var group = typeof ageGroup === "string" ? ageGroup.trim().toUpperCase() : "";
    var groupIndex = ageGroups.indexOf(group);
    var total = typeof minutes === "string" && /^\d+$/.test(minutes.trim()) ? Number(minutes) : minutes;
    if (groupIndex < 0 || !Number.isInteger(total) || total < minMinutes || total > maxMinutes) return null;

    var themeCount = themes.length;
    var offset = Number.isSafeInteger(variation) ? ((variation % themeCount) + themeCount) % themeCount : 0;
    var themeIndex = offset < starterThemeCount ? (groupIndex + offset) % starterThemeCount : offset;
    var theme = themes[themeIndex];
    var profile = profiles[group];
    var age = theme.ages[group];
    var sampleLength = total < 45 ? 5 : 10;
    var id = "club-" + group.toLowerCase() + "-" + theme.key + "-" + total;
    var elapsed = 0;
    var blocks = buildSchedule(total, theme, profile, age, sampleLength).map(function (entry) {
      var block = materializeBlock(id + "-" + entry.key, entry.role, entry.skill, entry.content, entry.minutes, elapsed);
      elapsed = block.endMinute;
      return block;
    });

    return {
      id: id,
      kind: "club-practice",
      variation: offset,
      ageGroup: group,
      title: theme.title,
      totalMinutes: total,
      phaseLabel: "Club practice",
      dayType: "Indoor volleyball",
      skillFocus: theme.focus,
      focusReminder: theme.headline,
      coachNote: profile.opening,
      setup: "Set the net and ball for your division. Plan for 8–12 players on one court and keep the ball cart outside active lanes. " + theme.prep,
      objectives: [
        { label: theme.sampleLabel, target: measure(age.samples, sampleLength) + " attempts in the skill block with " + age.check + "." },
        { label: theme.rallyLabel, target: measure(age.rallies, sampleLength) + " eligible rallies in the bonus game with " + age.rally + "." }
      ],
      equipment: equipment.slice(),
      adaptations: adaptations(profile),
      blocks: blocks
    };
  }

  return {
    generate: generate,
    ageGroups: ageGroups.slice(),
    minMinutes: minMinutes,
    maxMinutes: maxMinutes,
    durationOptions: durationOptions.slice(),
    variantCount: themes.length,
    sources: sources.slice()
  };
})();
