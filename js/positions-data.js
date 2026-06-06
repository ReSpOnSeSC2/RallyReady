// positions-data.js — the canonical volleyball POSITION content (data only).
//
// One entry per position the roster offers (keys match the exact strings in
// RR.positions.LIST, which roster/players write onto each player). Each guide is
// real, coachable youth-volleyball content: what the role does, front- and
// back-row responsibilities, "say this" technique cues, common mistakes with a
// fix, where they line up, and a deterministic YouTube SEARCH url (never a guessed
// video id — see the brief). RR.positions (js/positions.js) reads this; the
// Position Coaching screen (js/positions-ui.js) renders it. No DOM here.
window.RR = window.RR || {};

// Deterministic "how to <q> volleyball" search url — same convention as drills.
function rrPositionVideo(q) {
  return "https://www.youtube.com/results?search_query=" +
    encodeURIComponent("how to " + q + " volleyball");
}

// Display order (front-court to back-court, setter first as the offense hub).
RR.POSITION_ORDER = [
  "Setter", "Outside hitter", "Opposite",
  "Middle blocker", "Libero", "Defensive specialist"
];

RR.POSITION_GUIDES = {
  "Setter": {
    abbr: "S",
    tagline: "The quarterback who runs the offense.",
    blurb: "The setter takes the team's second contact and delivers hittable balls to the attackers, choosing who swings and controlling the tempo of the offense. It's the on-court decision-maker — quick feet, soft consistent hands, and calm leadership matter more than height.",
    focusSkills: ["Setting", "Ball Control", "Defense"],
    startZones: [1],
    responsibilities: {
      front: [
        "Beat the ball to the target (just right of middle-front) and square up to the left antenna before it arrives.",
        "Deliver consistent, hittable sets; push the ball 1–2 feet off the net so hitters can swing away from the block.",
        "Run the offense — distribute to your hot hitter and change tempo and location to beat the block.",
        "Be the backup attacker: dump the second ball over on a tight pass to keep the defense honest."
      ],
      back: [
        "Release to the net early from zone 1 without overlapping your neighbours at serve.",
        "After you set, move — cover your hitter's tip-back or get ready to dig a roll shot.",
        "Play out-of-system balls high to the pins so a hitter still gets a swing."
      ]
    },
    cues: [
      "Beat the ball to the spot — get there early and stopped, then set with your legs, not just your hands.",
      "Catch the ball high on your forehead in a relaxed triangle and push straight up through it.",
      "Square your hips and shoulders to the target so every set looks the same to the blockers.",
      "Set the ball, then move: cover your hitter or get ready to dig the tip."
    ],
    mistakes: [
      { miss: "Reaching with the arms instead of moving the feet to the ball.", fix: "Sprint to the spot first and arrive balanced, so the legs power the set." },
      { miss: "Setting tight to the net so hitters get stuffed.", fix: "Aim the set a foot or two off the net and let it drop into the swing." },
      { miss: "Telegraphing by turning the body toward the target early.", fix: "Hold a neutral, square base until the last instant so the block can't read you." },
      { miss: "Spinny, 'double' hands on the set.", fix: "Contact both hands at the same instant and push — don't throw or carry." }
    ],
    rotation: "In a 5-1 the setter plays all six rotations and usually starts in zone 1 (right-back), so they can release to the net with two front-row hitters ahead of them. In a 6-2, two setters set only from the back row and hit when they rotate front."
  },

  "Outside hitter": {
    abbr: "OH",
    tagline: "The go-to attacker on the left pin.",
    blurb: "The outside hitter (left side) takes the most swings on the team and has to terminate from great sets and scrappy ones alike. They're true six-rotation players — primary passers in serve receive and left-back defenders — so they need to do a bit of everything well.",
    focusSkills: ["Passing", "Hitting", "Serving", "Defense"],
    startZones: [4],
    responsibilities: {
      front: [
        "Attack the high outside ball — including tough, off-the-net sets — and stay aggressive.",
        "Block the opponent's right-side attacker.",
        "Score smart: tip and roll-shot when the block is well formed, swing hard when it isn't."
      ],
      back: [
        "Pass serve receive — you're a primary passer in most systems.",
        "Play left-back (zone 5) defense and dig the cross-court hit.",
        "Be ready for the back-row 'pipe' attack when the offense calls it."
      ]
    },
    cues: [
      "Quick, big last two steps — left-right-left for a righty — and swing both arms back to load the jump.",
      "Contact the ball at full reach with a fast wrist snap to hit down into the court.",
      "Hit the ball in front of your hitting shoulder — adjust your approach to the set, don't drift under it.",
      "See the block in the air: tip or hit high off the hands when it's set, swing hard when it's split."
    ],
    mistakes: [
      { miss: "Approaching too early and waiting under the ball.", fix: "Time it so you're moving and exploding up as the ball drops to swing height." },
      { miss: "Slow, low-elbow swing with no snap.", fix: "Lead with a high elbow and a fast hand for power and topspin." },
      { miss: "Always hammering cross-court into the block.", fix: "Mix line, tip, and high-hands shots so the defense can't cheat one angle." },
      { miss: "Forgetting to pass because they're thinking about hitting.", fix: "Pass first, THEN transition off the net to attack — every rally starts with the pass." }
    ],
    rotation: "Two outsides are placed opposite each other in the lineup so one is always front row. They typically start near zones 4 (front-left) and 5 (back-left)."
  },

  "Opposite": {
    abbr: "OPP",
    tagline: "The right-side attacker and primary blocker.",
    blurb: "The opposite lines up diagonally across from the setter. In many systems they never have to pass, which frees them to be a big right-side threat and the team's primary blocker against the other team's best outside hitter. They're also the backup setter.",
    focusSkills: ["Hitting", "Blocking", "Serving"],
    startZones: [2],
    responsibilities: {
      front: [
        "Attack from the right side (zone 2), including against a well-formed block.",
        "Be the primary blocker against the opponent's left-side hitter — usually their main scorer.",
        "Set the second ball when the setter digs or passes the first (you're the backup setter)."
      ],
      back: [
        "Hit the back-row attack from zone 1 (the 'red' play) when the offense needs a right-side option.",
        "Play right-back defense and cover tips behind the block.",
        "Serve aggressively — opposites often carry one of the team's biggest serves."
      ]
    },
    cues: [
      "Approach from outside the antenna and turn the ball back into the court.",
      "Block the opponent's best hitter — press over the net and take away their cross-court angle.",
      "Stay ready to back-set or right-side set the instant the setter takes the first ball."
    ],
    mistakes: [
      { miss: "Drifting under right-side sets and hitting into the antenna.", fix: "Approach from wide so the ball stays in front of your hitting shoulder." },
      { miss: "Late, reaching blocks against the outside hitter.", fix: "Watch the setter's hands, move early, and press the block straight over the net." }
    ],
    rotation: "The opposite starts diagonally across from the setter, so they're front row whenever the setter is back row — giving the team a right-side hitter in every rotation. They usually start in zone 2 (front-right)."
  },

  "Middle blocker": {
    abbr: "MB",
    tagline: "The net's first line of defense and quick attacker.",
    blurb: "The middle blocker reads the setter and blocks across the whole net, then hits fast quick-sets to beat the block before it forms. Middles cover the most lateral ground at the net and are usually replaced by the libero in the back row so they can focus on front-row work.",
    focusSkills: ["Blocking", "Hitting"],
    startZones: [3],
    responsibilities: {
      front: [
        "Block the middle and close the block on the pins — you set the team's blocking tempo.",
        "Hit quick sets (a '1' or a slide) to beat the block before it's formed.",
        "Be the loud communicator at the net: call the other team's middle and help close the block."
      ],
      back: [
        "Middles usually rotate out for the libero in the back row.",
        "If you stay in, serve and play simple, disciplined back-row defense."
      ]
    },
    cues: [
      "Watch the setter, not the ball — read where the set is going and move to close the block there.",
      "Press your hands over the net and squeeze the ball; land balanced without touching the net.",
      "On the quick attack, be in the air as the setter releases — beat the block, don't wait for it."
    ],
    mistakes: [
      { miss: "Ball-watching and reacting to the pins too late.", fix: "Track the setter's hands and shoulders to read the set early." },
      { miss: "Swinging the arms sideways and netting on the block.", fix: "Jump straight up, press over, and pull the hands back down on landing." },
      { miss: "A slow approach, so the quick set arrives too fast.", fix: "Be moving as the pass comes up, loading your jump as the setter touches the ball." }
    ],
    rotation: "Two middles are placed opposite each other so one is always front row. They start in the middle of the net (zone 3) and are the player most often replaced by the libero once they rotate to the back row."
  },

  "Libero": {
    abbr: "L",
    tagline: "The back-row defensive captain in the off-colour jersey.",
    blurb: "The libero is a back-row specialist in a contrasting jersey who subs freely (without counting against the team's substitutions) and anchors serve receive and defense. They can't attack a ball above net height or block, but they're the steadiest passer and ball-control player on the floor.",
    focusSkills: ["Passing", "Defense", "Ball Control"],
    startZones: [6],
    responsibilities: {
      front: [
        "Liberos play the back row only — they never block or attack a ball above the net."
      ],
      back: [
        "Pass the bulk of serve receive with a platform that lands right at the setter's target.",
        "Play the team's best defense — read the hitter and dig the hard-driven ball.",
        "Run down free balls and tips, and be the on-court voice for the back-row defense.",
        "Hand-set the second ball (from below net height) when the setter digs the first."
      ]
    },
    cues: [
      "Get to the spot early and stop — pass from a balanced, still platform, not on the move.",
      "Angle the platform to the target and let the ball play off it; absorb, don't swing.",
      "Watch the hitter's arm and shoulders to read the dig, and stay low in your defensive stance.",
      "Be loud — call the ball, call the seam, and direct the back row."
    ],
    mistakes: [
      { miss: "Swinging the arms at the pass.", fix: "Set a still platform and let the ball rebound to target — the legs do the work." },
      { miss: "Standing tall in defense and getting handcuffed by hard hits.", fix: "Stay low with weight forward so you can play the ball up off a hard swing." },
      { miss: "Drifting while passing, so the ball shanks off at an angle.", fix: "Beat the ball to the spot, stop, and pass square to the setter." }
    ],
    rotation: "The libero subs in for a middle whenever that middle rotates to the back row, so they're on the floor for most back-row rallies. They never rotate to the front row and don't count against the team's substitution total."
  },

  "Defensive specialist": {
    abbr: "DS",
    tagline: "A back-row sub who passes and plays defense.",
    blurb: "The defensive specialist comes in to strengthen the back row — passing and defense — but unlike the libero they use a normal substitution and can serve and rotate normally. DS is a great role for steady, scrappy players who win rallies with ball control.",
    focusSkills: ["Passing", "Defense", "Serving"],
    startZones: [5],
    responsibilities: {
      front: [
        "Defensive specialists are back-row players — they're usually subbed out before rotating to the front row."
      ],
      back: [
        "Pass serve receive and play defense in place of a weaker back-row passer.",
        "Serve tough — a DS often comes in as a serving and passing upgrade.",
        "Cover tips and chase down free balls; keep every rally alive."
      ]
    },
    cues: [
      "Beat the ball to the spot and pass from a balanced platform aimed at the setter.",
      "Stay low and read the hitter so you're ready to dig the hard swing.",
      "Communicate constantly — call the ball and call the seam."
    ],
    mistakes: [
      { miss: "Passing on the move and shanking the ball.", fix: "Get there early, stop, and present a still platform to target." },
      { miss: "Serving tentatively when subbed in specifically to serve.", fix: "Trust your routine and serve aggressively at a target zone." }
    ],
    rotation: "A DS uses a regular substitution (so the sub count matters) and can serve, unlike the libero. Coaches often sub a DS in for a front-row hitter once that hitter rotates to the back row."
  }
};

// Attach the deterministic search url to each guide (kept here so the content
// above stays readable and the url convention lives in exactly one place).
Object.keys(RR.POSITION_GUIDES).forEach(function (name) {
  RR.POSITION_GUIDES[name].videoUrl = rrPositionVideo("play " + name.toLowerCase());
});
