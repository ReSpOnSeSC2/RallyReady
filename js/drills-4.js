// drills-4.js — RallyReady drill library DATA (Part 4 of 9).
//
// PURE DATA ONLY. More Defense, a team-system rep, a camp tournament, and a
// cooldown. Plain coach English. Real, standard drills. CONCATENATES onto
// RR.drills. LINKS standard applies.
window.RR = window.RR || {};

(function (RR) {
  "use strict";

  var v = RR.drillVideoSearch || function (name) {
    return "https://www.youtube.com/results?search_query=" +
      encodeURIComponent("how to " + name + " volleyball");
  };

  var more = [

    // ===================== DEFENSE =====================
    {
      id: "overhead-defensive-hands",
      name: "Overhead Defensive Hands",
      skill: "Defense",
      ageMin: 12, ageMax: 18,
      difficulty: 3,
      minPlayers: 2,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls"],
      setup: "Defenders learn to play hard and high balls with their hands up above their forehead. It's faster than dropping down to your arms when a ball comes in high. A lot of modern back-row players use this.",
      steps: [
        "A feeder drives balls at the defender's chest and head height.",
        "The defender takes the high ball with firm hands above their forehead and pops it up.",
        "Keep your hands strong and the touch quick. This is a firm deflection, not a set.",
        "Mix in some low balls so the defender learns to choose hands (high) or arms (low)."
      ],
      cues: [
        "High ball, high hands. Low ball, use your arms. Pick the fastest option.",
        "Firm, strong hands. Deflect the ball up. Don't catch it or hold it.",
        "Stay big and tall on hard balls coming at your face."
      ],
      easier: "Toss balls at head height so the defender gets used to the firm-hands touch before you add speed.",
      harder: "Drive balls hard and mix the heights so the defender has to instantly choose hands or arms.",
      videoSearchUrl: v("Overhead Defensive Hands")
    },
    {
      id: "perimeter-defense-system",
      name: "Perimeter Defense System",
      skill: "Defense",
      ageMin: 14, ageMax: 18,
      difficulty: 4,
      minPlayers: 6,
      durationMin: 14,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "The team runs a perimeter defense, where the back-row players spread out to the edges of the court to cover the deep corners and the line. This teaches positioning, talking, and covering the court as a unit.",
      steps: [
        "Set the base and read spots for a perimeter defense around a two-person block.",
        "A coach attacks from a pin, and defenders move to cover the line, the cross, and tips.",
        "The blocker who isn't blocking pulls off the net to cover the short angle and tips.",
        "Run attacks from both pins so everyone learns each spot."
      ],
      cues: [
        "Cover the edges — the deep corners and the line are yours.",
        "The block takes the hard ball up the middle. Defenders take the edges and the tips.",
        "Talk about your coverage every rally. Defense is a team, not six players doing their own thing."
      ],
      easier: "Walk through the spots at half speed with the coach calling out where each defender goes.",
      harder: "Play live rallies where the team runs the system and then turns defense into a counter-attack.",
      videoSearchUrl: v("Perimeter Defense System")
    },

    // ===================== TEAM PLAY =====================
    {
      id: "run-the-rotation-offense",
      name: "Run-the-Rotation Offense",
      skill: "Team Play",
      ageMin: 14, ageMax: 18,
      difficulty: 3,
      minPlayers: 6,
      durationMin: 16,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["balls", "net"],
      setup: "The team runs its serve-receive offense from each of the six rotations against coach-tossed balls. Every player learns where to pass, set, and hit in each rotation. These are the reps that make a system automatic.",
      steps: [
        "Set the team up in rotation one's serve-receive formation.",
        "A coach tosses a ball in. The team passes, sets, and runs their planned attack.",
        "Run two or three balls per rotation, then move to the next one.",
        "Work through all six rotations, fixing overlaps and who-does-what as you go."
      ],
      cues: [
        "Know your job in every rotation — where you start and where you go.",
        "Call out the play and your responsibility before the ball comes.",
        "Clean reps in all six rotations build a system you can trust in a game."
      ],
      easier: "Just walk through the base spots of each rotation first, with the coach tossing easy balls.",
      harder: "Add a serve and a block so the team runs each rotation against real pressure.",
      videoSearchUrl: v("Run-the-Rotation Offense")
    },
    {
      id: "mini-volley-stations-tournament",
      name: "Mini-Volleyball Stations Tournament",
      skill: "Team Play",
      ageMin: 8, ageMax: 16,
      difficulty: 2,
      minPlayers: 8,
      durationMin: 20,
      isStaple: false,
      isGame: true,
      campFriendly: true,
      equipment: ["balls", "net"],
      setup: "Split a big, mixed-age camp group into small teams that rotate through short games on several mini-courts. Everyone gets a lot of touches and stays playing, and it builds toward a fun camp tournament.",
      steps: [
        "Split the gym into several small courts. Lowered nets or ropes work fine.",
        "Make even teams of 2 to 4 and put two teams on each court.",
        "Play short rally-scoring games to a low number, like 11.",
        "Move winners up a court and others down, so teams play others at their level.",
        "Add up the results across rounds for a camp-wide tournament standing."
      ],
      cues: [
        "Use all three contacts when you can — pass, set, hit.",
        "Keep the rally alive above everything else.",
        "Cheer your team and hustle between courts to keep things moving."
      ],
      easier: "Use simpler games, lower the nets, shrink the courts, and let beginners catch-and-throw or use one bounce.",
      harder: "Make players serve it in, require three contacts to score, and play full doubles on a bigger court.",
      videoSearchUrl: v("Mini-Volleyball Stations Tournament")
    },

    // ===================== COOLDOWN =====================
    {
      id: "foam-roll-mobility-recovery",
      name: "Foam Roll and Mobility Recovery",
      skill: "Cooldown",
      ageMin: 10, ageMax: 18,
      difficulty: 1,
      minPlayers: 1,
      durationMin: 8,
      isStaple: false,
      isGame: false,
      campFriendly: false,
      equipment: ["foam roller"],
      setup: "A guided recovery using a foam roller and some gentle movement to loosen up tight muscles after a hard practice. It helps players recover between sessions and builds good habits.",
      steps: [
        "Slowly roll your calves, quads, and hamstrings, pausing on any sore spots for a few breaths.",
        "Roll your upper back (the middle, not your lower back) to open up your shoulders.",
        "Do some gentle shoulder and wrist circles for your passing and hitting joints.",
        "Finish with slow, deep breathing and a little light stretching while you're still warm."
      ],
      cues: [
        "Roll slowly and breathe. Ease into sore spots — don't force them.",
        "Stay off your lower back and the front of your knee.",
        "This is recovery, so keep it calm and easy, not painful."
      ],
      easier: "Make it shorter and just roll the calves and quads with light pressure.",
      harder: "Hold longer on tight spots and add a full set of mobility moves for the hips, shoulders, and ankles.",
      videoSearchUrl: v("Foam Roll and Mobility Recovery")
    }

  ];

  RR.drills = (RR.drills || []).concat(more);
})(window.RR);
