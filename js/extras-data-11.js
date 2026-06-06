// extras-data-11.js — COOLDOWN drill diagrams (RR.extras).
//
// Cooldowns are mostly individual static stretching, foam rolling, breathing
// and yoga — those have NO meaningful floor layout, so they get no entry (the
// app shows a derived "how it's organized" line + a video instead). We only
// author a diagram for the handful where the group actually forms up in space:
// a team circle, a partner-stretch spacing, and the easy walking laps. Each is
// a single diagram — a cooldown rarely has spatial phases.
window.RR = window.RR || {};
RR.extras = RR.extras || {};

(function (RR) {
  "use strict";
  var dk = RR.dk;
  var E = RR.extras;

  // ---- Easy walking / jogging laps to flush out -----------------------------

  E["cooldown-jog-and-breathing"] = {
    diagram: dk.lanes({
      lanes: 4,
      caption: "The whole group jogs one or two easy lengths of the gym at a relaxed, talking pace, shaking out arms and legs on the way. Then everyone circles up for slow breaths and a quick team talk."
    })
  };
  E["recovery-walk-and-goal-setting"] = {
    diagram: dk.lanes({
      lanes: 4,
      caption: "Spread across the gym and walk easy laps, letting the heart rate come down while you shake out and breathe slowly. As you walk, each player settles on one specific goal for next practice."
    })
  };

  // ---- Partners pairing up for assisted stretches ---------------------------

  E["partner-stretch-and-reflect"] = {
    diagram: dk.pairsRows({
      pairs: 3,
      topLabel: "A", botLabel: "B",
      caption: "Players pair off and face each other with a little space, moving together through calf, hamstring, quad, and shoulder stretches — each partner helping the other balance. Between holds they trade one thing that went well and one thing to work on."
    })
  };

  // ---- Team circle keep-it-up to wind down ----------------------------------

  E["team-circle-recovery"] = {
    diagram: dk.circlePass({
      n: 6,
      caption: "The team forms a relaxed ring and keeps a ball up with easy, gentle touches — calm control, not winning. Add a small challenge like 'everyone touches it once', then finish with a few slow breaths together."
    })
  };

})(window.RR);
