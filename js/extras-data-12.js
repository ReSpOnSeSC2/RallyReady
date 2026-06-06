// extras-data-12.js — diagrams for the equipment drills added in drills-11.js.
//
// One entry per NEW drill WHERE a court layout, target placement, or movement
// path actually clarifies the setup — the hoops/targets accuracy drills, the
// mat-based pursuit/dive defense, and the partner reaction/ladder work.
//
// Purely stationary fitness (resistance/mini bands, jump rope, medicine-ball
// throws, foam rolling, box step-ups/landings, in-place mobility) gets NO
// diagram on purpose — same rule the warmup file (extras-data-10.js) follows,
// since a court drawing would invent positioning that isn't there.
//
// CONCATENATES onto RR.extras. Uses the shared dk (diagram kit) builders.
window.RR = window.RR || {};
RR.extras = RR.extras || {};

(function (RR) {
  "use strict";
  var dk = RR.dk;
  var E = RR.extras;

  // ---- HOOPS / TARGETS ------------------------------------------------------

  // Servers fire across the net into hoops in the deep corners and the seam.
  E["serve-into-the-hoops"] = {
    diagram: dk.serveTargets({
      servers: 3,
      zones: [
        { x: 0.5, y: 0.6, w: 2.4, h: 2.4, tone: "target", label: "deep 1" },
        { x: 6.1, y: 0.6, w: 2.4, h: 2.4, tone: "target", label: "deep 5" },
        { x: 3.3, y: 1.1, w: 2.4, h: 2.0, tone: "target", label: "seam" }
      ],
      caption: "Hoops sit in the deep corners and the middle seam. Servers CALL a hoop, then serve to land in or on it. Track makes out of 10 and move the 'hot' hoop each round."
    })
  };

  // The competitive version: numbered hoops worth different points.
  E["target-serve-challenge"] = {
    diagram: dk.serveTargets({
      servers: 3,
      zones: [
        { x: 0.5, y: 0.6, w: 2.3, h: 2.3, tone: "good", label: "5 pts" },
        { x: 6.2, y: 0.6, w: 2.3, h: 2.3, tone: "good", label: "5 pts" },
        { x: 3.3, y: 0.9, w: 2.4, h: 2.0, tone: "target", label: "3 pts" },
        { x: 1.4, y: 5.4, w: 6.2, h: 2.2, tone: "neutral", label: "1 pt — anywhere in" }
      ],
      caption: "Numbered hoops: deep corners score most, the seam less, anywhere in is one. Teams take turns serving and race to a target score — a missed serve can hand the other team a point."
    })
  };

  // Server feeds a passer who plays a high pass into a hoop at the setter target.
  E["pass-to-the-hoop-target"] = {
    diagram: dk.feedLine({
      net: 6,
      feederLabel: "S", feederNote: "server",
      activeLabel: "P", action: "high pass to hoop",
      targetLabel: "◎",
      caption: "A hoop sits on the floor at the setter's target in right-front. The server sends a ball over; the passer plays a high, soft pass that drops into the hoop's airspace. Count passes that find the hoop, then rotate."
    })
  };

  // Setter delivers through hoops at the outside pin and the back-set pin.
  E["setter-hoop-stations"] = {
    diagram: {
      caption: "Hoops mark the outside set (left pin) and the back-set (right pin) at set height along the net. A tosser feeds the setter, who delivers through the CALLED hoop. Alternate front and back; track makes to each.",
      w: 9, h: 9, net: 2, lines: [{ y: 5.2 }],
      court: [{ x: 0, y: 0, w: 9, h: 9 }],
      zones: [
        { x: 0.5, y: 2.3, w: 2.2, h: 1.7, tone: "target", label: "outside" },
        { x: 6.3, y: 2.3, w: 2.2, h: 1.7, tone: "target", label: "back-set" }
      ],
      players: [
        { x: 4.5, y: 6.6, label: "C", team: "coach", note: "tosses" },
        { x: 5.6, y: 4.2, label: "St", team: "a", note: "setter" }
      ],
      paths: [
        { from: [4.5, 6.2], to: [5.6, 4.6], kind: "ball", label: "toss", curve: 0.18 },
        { from: [5.3, 4], to: [1.7, 3.2], kind: "ball", label: "front set", curve: 0.3 },
        { from: [5.9, 4], to: [7.3, 3.2], kind: "ball", label: "back set", curve: -0.3 }
      ],
      legend: [{ tone: "target", text: "Aim here" }, { tone: "coach", text: "Feeder" }, { tone: "a", text: "Setter" }]
    }
  };

  // Hitter approaches and swings to land in hoops on the far court.
  E["hit-the-target-zones"] = {
    diagram: {
      caption: "Hoops lie on the FAR court at the deep line, deep cross, and the sharp cross angle. A setter feeds the pin; the hitter approaches and swings to land the ball in the CALLED hoop. Score makes out of 10; rotate the live target.",
      w: 9, h: 9.4, net: 2,
      court: [{ x: 0, y: 0, w: 9, h: 9.4 }],
      zones: [
        { x: 0.5, y: 0.4, w: 2.2, h: 1.4, tone: "target", label: "deep line" },
        { x: 6.3, y: 0.4, w: 2.2, h: 1.4, tone: "target", label: "deep cross" },
        { x: 5.7, y: 2.5, w: 2.5, h: 1.3, tone: "target", label: "sharp X" }
      ],
      players: [
        { x: 2, y: 8.4, label: "H", team: "a", note: "start" },
        { x: 5.4, y: 3, label: "St", team: "a", note: "setter" }
      ],
      paths: [
        { from: [2, 8], to: [2.4, 4.2], kind: "move", label: "approach", curve: 0.1 },
        { from: [5.4, 3], to: [2.7, 3.4], kind: "ball", label: "set", curve: 0.2 },
        { from: [2.7, 3], to: [7.4, 1.1], kind: "serve", label: "swing to hoop", curve: 0.12 }
      ],
      legend: [{ tone: "target", text: "Target hoops" }, { tone: "a", text: "Hitter + setter" }]
    }
  };

  // ---- TUMBLING MATS (pursuit / dive defense) -------------------------------

  // Defender explodes onto a short ball and sprawls onto a safe mat.
  E["mat-sprawl-and-pursuit"] = {
    diagram: {
      caption: "A mat lies in front of the defender as a safe landing zone. The tosser drops a SHORT ball just in front; the defender explodes forward, gets a hand or platform under it, and sprawls onto the mat — then pops straight up.",
      w: 9, h: 10, net: 2.2, lines: [{ y: 5.2 }],
      court: [{ x: 0, y: 2.2, w: 9, h: 7.4 }],
      zones: [{ x: 3.3, y: 5.5, w: 2.4, h: 1.8, tone: "good", label: "MAT" }],
      players: [
        { x: 4.5, y: 0.9, label: "C", team: "coach", note: "drops it short" },
        { x: 4.5, y: 8.6, label: "D", team: "a", note: "defender" }
      ],
      paths: [
        { from: [4.5, 1.4], to: [4.5, 5.3], kind: "ball", label: "short tip", curve: 0.1 },
        { from: [4.5, 8.2], to: [4.5, 6.6], kind: "move", label: "explode + sprawl", curve: 0 }
      ],
      legend: [{ tone: "coach", text: "Tosser" }, { tone: "a", text: "Defender" }, { tone: "good", text: "Mat (land here)" }]
    }
  };

  // Full-extension dive learned safely on the mat (older players).
  E["mat-diving-extension"] = {
    diagram: {
      caption: "For older players: the mat is the safe place to learn the full extension dive (pancake). A coach rolls or tosses a ball just out of reach; the player extends, slides a hand under it, and lands soft on the mat. Keep reps low and clean.",
      w: 9, h: 9.6,
      zones: [{ x: 3, y: 3.4, w: 3, h: 2.4, tone: "good", label: "MAT" }],
      players: [
        { x: 4.5, y: 1, label: "C", team: "coach", note: "tosses just short" },
        { x: 4.5, y: 7.8, label: "P", team: "a", note: "extends + dives" }
      ],
      paths: [
        { from: [4.5, 1.5], to: [4.6, 3.5], kind: "ball", label: "just out of reach", curve: 0.1 },
        { from: [4.5, 7.4], to: [4.6, 5.6], kind: "move", label: "extend to the mat", curve: 0 }
      ],
      legend: [{ tone: "coach", text: "Tosser" }, { tone: "a", text: "Diver" }, { tone: "good", text: "Mat" }]
    }
  };

  // ---- LADDER / REACTION (movement + read) ----------------------------------

  // Quick ladder feet flowing straight into a read-and-dig.
  E["ladder-to-dig-reaction"] = {
    diagram: {
      caption: "The ladder points at a tosser. The player runs a quick two-feet-per-box pattern, and as they clear the last box the tosser puts a ball just left or right. They break to it and dig to a target, then jog back.",
      w: 9, h: 11,
      zones: dk.spread(6, 0, 0).map(function (_, i) {
        return { x: 3.6, y: 4.4 + i * 0.9, w: 1.8, h: 0.8, tone: "neutral", label: "" };
      }),
      players: [
        { x: 4.5, y: 1.2, label: "C", team: "coach", note: "tosses L or R" },
        { x: 4.5, y: 10.2, label: "P", team: "a", note: "runs ladder" },
        { x: 7.4, y: 4.6, label: "T", team: "a", note: "dig target" }
      ],
      paths: [
        { from: [4.5, 9.8], to: [4.5, 4.4], kind: "move", label: "quick feet", curve: 0 },
        { from: [4.5, 1.6], to: [6.3, 4.0], kind: "ball", label: "ball wide", curve: 0.2 },
        { from: [4.7, 4.1], to: [7, 4.6], kind: "ball", label: "dig to target", curve: 0.25 }
      ],
      legend: [{ tone: "neutral", text: "Ladder" }, { tone: "coach", text: "Tosser" }, { tone: "a", text: "Player + target" }]
    }
  };

  // Partner reaction scramble: feeder bounces, defender reads low and catches.
  E["reaction-ball-scramble"] = {
    diagram: {
      caption: "The defender sets up low and ready. The feeder bounces the lumpy reaction ball hard toward them; they read the crazy bounce, move their feet, and catch it low with two hands. Short bursts, then switch jobs.",
      w: 9, h: 8,
      players: [
        { x: 3, y: 2.2, label: "F", team: "b", note: "bounces hard" },
        { x: 5.4, y: 5.6, label: "D", team: "a", note: "stays low" }
      ],
      paths: [
        { from: [3.2, 2.6], to: [5, 5], kind: "ball", label: "crazy bounce", curve: 0.32 },
        { from: [5.4, 5.6], to: [4.2, 6.2], kind: "move", label: "scramble + catch low", curve: 0.2 }
      ],
      legend: [{ tone: "b", text: "Feeder" }, { tone: "a", text: "Defender" }, { tone: "move", text: "Read + react" }]
    }
  };

})(window.RR);
