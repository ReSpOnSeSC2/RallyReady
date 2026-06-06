// tips-visuals.js — "show, don't just tell" visuals for the Tips screen.
//
// The Tips screen tells coaches what to do in words; this module SHOWS it:
//   • Animated, looping SVG "motion diagrams" (a real volleyball that travels a
//     trajectory) for the techniques and ideas that read far better as a picture
//     than a paragraph — the six core skills, a practice that flows, the rotation,
//     and a reset breath.
//   • A compact "See it in action" row of YouTube SEARCH links per topic, so a
//     coach can watch a real example. Following the app's LINKS standard these
//     are deterministic SEARCH urls (never a guessed video id), and opening one
//     is a user action, so the app stays offline-safe.
//
// OFFLINE-SAFE & THEME-SAFE: every diagram is inline SVG built from a string —
// no images, no GIF files, no network. Colours come from CSS classes (styled in
// css/tips-visuals.css with the app's semantic + brand tokens) so they re-theme
// in dark mode and meet contrast. All motion is CSS and is fully disabled under
// prefers-reduced-motion, where each ball simply parks at the end of its path.
window.RR = window.RR || {};

RR.tipsVisuals = (function () {
  "use strict";

  // ---- Tiny DOM helper (mirrors coaching.js so this module stands alone) ----
  function h(tag, props, kids) {
    var node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v == null || v === false) return;
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else if (k === "html") node.innerHTML = v;
        else if (k.slice(0, 2) === "on" && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
        else node.setAttribute(k, v === true ? "" : v);
      });
    }
    (function append(n, ks) {
      if (ks == null) return;
      if (Array.isArray(ks)) ks.forEach(function (k) { append(n, k); });
      else if (ks instanceof Node) n.appendChild(ks);
      else n.appendChild(document.createTextNode(String(ks)));
    })(node, kids);
    return node;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Deterministic YouTube SEARCH url (LINKS standard — a search, never an id).
  function searchUrl(query) {
    return "https://www.youtube.com/results?search_query=" + encodeURIComponent(query);
  }

  // Unique marker ids so each SVG's arrowhead never collides with another's.
  var seq = 0;
  function nextId() { return "tv-mk-" + (++seq); }

  // ======================================================================= //
  //  SVG PRIMITIVES (all coordinates in the diagram's own user units)       //
  // ======================================================================= //
  function svgWrap(viewBox, inner) {
    return "<svg viewBox='" + viewBox + "' class='tv-svg' focusable='false' aria-hidden='true' " +
           "preserveAspectRatio='xMidYMid meet'>" + inner + "</svg>";
  }
  function arrowDefs(id) {
    return "<defs><marker id='" + id + "' viewBox='0 0 10 10' refX='8' refY='5' " +
           "markerWidth='7' markerHeight='7' orient='auto'>" +
           "<path d='M0 0L10 5L0 10z' class='tv-arrowhead'/></marker></defs>";
  }
  function line(x1, y1, x2, y2, cls) {
    return "<line x1='" + x1 + "' y1='" + y1 + "' x2='" + x2 + "' y2='" + y2 + "' class='" + cls + "'/>";
  }
  function tag(x, y, text, anchor) {
    return "<text x='" + x + "' y='" + y + "' class='tv-label' text-anchor='" + (anchor || "middle") + "'>" + esc(text) + "</text>";
  }
  // A small upright volleyball glyph centred at (0,0).
  function ballGlyph(r) {
    return "<g class='tv-ball-glyph'>" +
      "<circle r='" + r + "' class='tv-ball-face'/>" +
      "<path class='tv-ball-seam' d='M" + (-r) + " " + (-r * 0.2) + " q " + r + " " + (r * 0.6) + " " + (2 * r) + " 0'/>" +
      "<path class='tv-ball-seam' d='M0 " + (-r) + " q " + (r * 0.5) + " " + r + " 0 " + (2 * r) + "'/>" +
      "</g>";
  }
  // A ball that loops along an offset-path (the "moving diagram"). Under
  // prefers-reduced-motion the CSS parks it at 100% of the path.
  function movingBall(d, dur, delay, r) {
    return "<g class='tv-ball' style=\"offset-path:path('" + d + "');" +
      "animation-duration:" + (dur || 3.6) + "s;animation-delay:" + (delay || 0) + "s\">" +
      ballGlyph(r || 9) + "</g>";
  }
  // A minimal stylised athlete (head + body) at floor point (x,y).
  function athlete(x, y) {
    return "<g class='tv-fig'>" +
      "<circle cx='" + x + "' cy='" + (y - 23) + "' r='7' class='tv-fig__head'/>" +
      "<rect x='" + (x - 7) + "' y='" + (y - 15) + "' width='14' height='21' rx='6' class='tv-fig__body'/>" +
      "</g>";
  }
  function netV(x, top, bottom) {
    return line(x, top, x, bottom, "tv-net") +
      "<circle cx='" + x + "' cy='" + top + "' r='3.4' class='tv-post'/>";
  }
  function target(x, y, rx) {
    return "<ellipse cx='" + x + "' cy='" + y + "' rx='" + (rx || 22) + "' ry='6.5' class='tv-target'/>";
  }

  // ======================================================================= //
  //  SIDE-VIEW MOTION SCENE  (viewBox 0 0 300 180, floor near the bottom)    //
  //  Distinct trajectory + markers per skill; the caption carries meaning.   //
  // ======================================================================= //
  function renderSide(spec) {
    var id = nextId();
    var FLOOR = 152;
    var p = [arrowDefs(id)];
    p.push(line(8, FLOOR, 292, FLOOR, "tv-floor"));
    (spec.nets || []).forEach(function (n) { p.push(netV(n.x, n.top, n.bottom || FLOOR)); });
    (spec.targets || []).forEach(function (t) { p.push(target(t.x, t.y, t.rx)); });
    (spec.feet || []).forEach(function (f) {
      p.push("<ellipse cx='" + f.x + "' cy='" + (f.y || FLOOR - 2) + "' rx='7' ry='3.4' class='tv-foot'/>");
    });
    (spec.hands || []).forEach(function (hd) {
      p.push("<rect x='" + hd.x + "' y='" + hd.y + "' width='9' height='13' rx='3' class='tv-hands'/>");
    });
    (spec.platforms || []).forEach(function (pl) {
      p.push(line(pl.x1, pl.y1, pl.x2, pl.y2, "tv-platform"));
    });
    (spec.players || []).forEach(function (pl) { p.push(athlete(pl.x, pl.y == null ? FLOOR : pl.y)); });
    (spec.trails || []).forEach(function (t) {
      p.push("<path class='tv-trail' d=\"" + t + "\" marker-end='url(#" + id + ")'/>");
    });
    (spec.balls || []).forEach(function (b) { p.push(movingBall(b.d, b.dur, b.delay, b.r)); });
    (spec.labels || []).forEach(function (l) { p.push(tag(l.x, l.y, l.text, l.anchor)); });
    return svgWrap("0 0 300 180", p.join(""));
  }

  // ======================================================================= //
  //  THE SIX CORE SKILLS — one animated motion card each                    //
  // ======================================================================= //
  var SKILLS = [
    {
      name: "Serving",
      caption: "A calm toss, a full arm swing, and the ball clears the net into the open court.",
      watch: "how to serve a volleyball overhand technique",
      scene: {
        players: [{ x: 48 }],
        nets: [{ x: 205, top: 60 }],
        targets: [{ x: 256, y: 150 }],
        trails: ["M58 118 Q 64 54 70 80 Q 152 16 256 146"],
        balls: [{ d: "M58 118 Q 64 54 70 80 Q 152 16 256 146", dur: 3.8 }]
      }
    },
    {
      name: "Passing",
      caption: "Read the serve, drop a flat platform angled to the target, and pop it up to the setter.",
      watch: "volleyball forearm passing technique platform",
      scene: {
        players: [{ x: 120 }],
        platforms: [{ x1: 108, y1: 132, x2: 132, y2: 122 }],
        targets: [{ x: 60, y: 150, rx: 18 }],
        nets: [{ x: 30, top: 70 }],
        trails: ["M286 50 Q 200 96 126 118 Q 92 80 62 72"],
        balls: [{ d: "M286 50 Q 200 96 126 118 Q 92 80 62 72", dur: 3.8 }]
      }
    },
    {
      name: "Setting",
      caption: "Take the ball high in a relaxed triangle, then push through the legs out to the hitter.",
      watch: "volleyball setting technique hand position",
      scene: {
        players: [{ x: 150 }],
        hands: [{ x: 138, y: 112 }, { x: 153, y: 112 }],
        targets: [{ x: 252, y: 150, rx: 18 }],
        trails: ["M70 134 Q 110 80 150 114 Q 212 58 252 92"],
        balls: [{ d: "M70 134 Q 110 80 150 114 Q 212 58 252 92", dur: 3.8 }]
      }
    },
    {
      name: "Hitting",
      caption: "Time the approach (left–right–left), contact the ball high, and snap it down over the net.",
      watch: "volleyball hitting approach footwork spike",
      scene: {
        nets: [{ x: 158, top: 44 }],
        feet: [{ x: 42 }, { x: 64 }, { x: 86 }],
        players: [{ x: 106, y: 120 }],
        targets: [{ x: 252, y: 150 }],
        trails: ["M110 44 Q 182 76 252 146"],
        balls: [{ d: "M110 44 Q 182 76 252 146", dur: 3.4 }]
      }
    },
    {
      name: "Blocking",
      caption: "Press the hands over the net, watch the hitter, and turn the attack straight back down.",
      watch: "volleyball blocking technique hand position",
      scene: {
        nets: [{ x: 150, top: 48 }],
        hands: [{ x: 137, y: 38 }, { x: 154, y: 38 }],
        trails: ["M44 76 Q 100 52 148 52 L 120 144"],
        balls: [{ d: "M44 76 Q 100 52 148 52 L 120 144", dur: 3.2 }]
      }
    },
    {
      name: "Digging",
      caption: "Stay low, get the platform to the ball, and lift a hard-driven attack back up high.",
      watch: "volleyball digging defense technique",
      scene: {
        players: [{ x: 224 }],
        platforms: [{ x1: 210, y1: 140, x2: 238, y2: 132 }],
        targets: [{ x: 150, y: 60, rx: 18 }],
        trails: ["M48 46 Q 152 122 222 132 Q 180 78 150 60"],
        balls: [{ d: "M48 46 Q 152 122 222 132 Q 180 78 150 60", dur: 3.6 }]
      }
    }
  ];

  // ======================================================================= //
  //  HERO DIAGRAMS for non-skill tips                                       //
  // ======================================================================= //

  // A practice that flows — coloured blocks with a sweep moving across them.
  function renderBlocks() {
    var segs = [
      { label: "WARM-UP", tone: "warm" },
      { label: "SKILL", tone: "skill" },
      { label: "SKILL", tone: "skill" },
      { label: "GAME", tone: "game" },
      { label: "COOL", tone: "cool" }
    ];
    var W = 300, PAD = 8, GAP = 5, y = 14, hgt = 28;
    var inner = W - PAD * 2 - GAP * (segs.length - 1);
    var sw = inner / segs.length;
    var parts = [];
    segs.forEach(function (s, i) {
      var x = PAD + i * (sw + GAP);
      parts.push("<rect x='" + x + "' y='" + y + "' width='" + sw + "' height='" + hgt +
        "' rx='7' class='tv-seg tv-seg--" + s.tone + "'/>");
      parts.push("<text x='" + (x + sw / 2) + "' y='" + (y + hgt + 16) +
        "' class='tv-seg-label' text-anchor='middle'>" + s.label + "</text>");
    });
    // The sweep: a soft highlight gliding left→right across the row.
    parts.push("<rect x='0' y='" + y + "' width='46' height='" + hgt + "' rx='7' class='tv-sweep'/>");
    return svgWrap("0 0 300 70", parts.join(""));
  }

  // Rotate clockwise — six numbered spots with a highlight travelling the cycle.
  function renderRotation() {
    var spots = {
      4: [56, 66], 3: [120, 66], 2: [184, 66],
      5: [56, 162], 6: [120, 162], 1: [184, 162]
    };
    // Standard clockwise cycle: 1 → 6 → 5 → 4 → 3 → 2 → back to 1.
    var order = [1, 6, 5, 4, 3, 2];
    var loop = "M" + spots[1][0] + " " + spots[1][1];
    order.slice(1).forEach(function (n) { loop += " L" + spots[n][0] + " " + spots[n][1]; });
    loop += " Z";

    var parts = ["<rect x='10' y='18' width='220' height='176' rx='8' class='tv-court'/>"];
    parts.push(line(10, 18, 230, 18, "tv-net-h"));
    parts.push("<text x='120' y='13' class='tv-label' text-anchor='middle'>NET</text>");
    parts.push("<path d='" + loop + "' class='tv-rot-loop'/>");
    Object.keys(spots).forEach(function (n) {
      var s = spots[n];
      parts.push("<circle cx='" + s[0] + "' cy='" + s[1] + "' r='17' class='tv-pos'/>");
      parts.push("<text x='" + s[0] + "' y='" + s[1] + "' class='tv-pos-label' text-anchor='middle' dominant-baseline='central'>" + n + "</text>");
    });
    parts.push("<circle r='21' class='tv-rot-hi' style=\"offset-path:path('" + loop + "')\"/>");
    return svgWrap("0 0 240 210", parts.join(""));
  }

  // The reset breath — a calm pulsing circle.
  function renderBreathe() {
    var parts = [
      "<circle cx='100' cy='62' r='46' class='tv-breathe-ring'/>",
      "<circle cx='100' cy='62' r='34' class='tv-breathe-ring tv-breathe-ring--2'/>",
      "<g class='tv-breathe'><circle cx='100' cy='62' r='24' class='tv-breathe-core'/></g>",
      "<text x='100' y='62' class='tv-breathe-word' text-anchor='middle' dominant-baseline='central'>breathe</text>"
    ];
    return svgWrap("0 0 200 124", parts.join(""));
  }

  // ======================================================================= //
  //  YOUTUBE "See it in action" — curated example searches per topic        //
  //  Keyed by the tip's icon key (from coaching.js). 1–2 per topic to keep   //
  //  the panel clean; the six-skills tip uses its per-skill links instead.   //
  // ======================================================================= //
  var VIDEOS = {
    practice: [
      { q: "youth volleyball practice plan structure blocks", label: "Practice structure" },
      { q: "high repetition volleyball drills small groups", label: "Max-reps drills" }
    ],
    talk: [
      { q: "effective coaching communication youth athletes", label: "Talking to players" },
      { q: "specific praise feedback coaching technique", label: "Specific feedback" }
    ],
    confidence: [
      { q: "building confidence youth athletes after mistakes", label: "Building confidence" },
      { q: "growth mindset coaching young athletes", label: "Growth mindset" }
    ],
    mental: [
      { q: "volleyball pre serve routine focus reset", label: "Pre-serve routine" },
      { q: "sport mental toughness reset routine athletes", label: "Reset routine" }
    ],
    energy: [
      { q: "high energy organized volleyball practice", label: "High-energy practice" },
      { q: "gym management transitions youth sports", label: "Managing the gym" }
    ],
    fun: [
      { q: "fun volleyball warm up games for kids", label: "Fun warm-up games" },
      { q: "volleyball practice games youth players", label: "Practice games" }
    ],
    gameday: [
      { q: "volleyball coaching from the bench match day", label: "On match day" },
      { q: "volleyball timeout coaching what to say", label: "Using timeouts" }
    ],
    season: [
      { q: "youth volleyball season practice planning", label: "Planning a season" },
      { q: "volleyball periodization phases explained", label: "Season phases" }
    ],
    tryouts: [
      { q: "volleyball tryout stations evaluation drills", label: "Tryout stations" },
      { q: "how to run youth volleyball tryouts", label: "Running tryouts" }
    ],
    include: [
      { q: "inclusive coaching all skill levels practice", label: "Including everyone" },
      { q: "differentiated volleyball drills mixed ability", label: "Differentiating drills" }
    ],
    athlete: [
      { q: "youth volleyball strength conditioning age appropriate", label: "Athletic training" },
      { q: "volleyball jump landing injury prevention", label: "Injury prevention" }
    ],
    safety: [
      { q: "volleyball dynamic warm up routine", label: "Warm-up & stretch" },
      { q: "youth sports coach emergency action plan", label: "Safety basics" }
    ],
    rules: [
      { q: "volleyball rules explained for beginners", label: "Rules explained" },
      { q: "volleyball rotation and overlap rules", label: "Rotation & overlap" }
    ],
    parents: [
      { q: "coaching parent communication youth sports", label: "Talking to parents" },
      { q: "preseason parent meeting youth team", label: "Pre-season meeting" }
    ],
    camp: [
      { q: "volleyball camp drills stations rotations", label: "Camp stations" },
      { q: "running a youth volleyball camp", label: "Running a camp" }
    ]
  };

  // ======================================================================= //
  //  NODE BUILDERS                                                          //
  // ======================================================================= //
  function figureNode(svgStr, opts) {
    opts = opts || {};
    var fig = h("figure", { class: "tv" + (opts.compact ? " tv--compact" : "") });
    fig.setAttribute("role", "img");
    var label = (opts.title ? opts.title + ". " : "") + (opts.caption || "");
    if (label) fig.setAttribute("aria-label", label);
    if (opts.title) fig.appendChild(h("p", { class: "tv__title", text: opts.title }));
    fig.appendChild(h("div", { class: "tv__canvas", html: svgStr }));
    if (opts.caption) fig.appendChild(h("figcaption", { class: "tv__cap", text: opts.caption }));
    return fig;
  }

  function watchChip(query, label) {
    return h("a", { class: "tv-watch", href: searchUrl(query), target: "_blank", rel: "noopener" }, [
      h("span", { class: "tv-watch__i", "aria-hidden": "true",
        html: "<svg viewBox='0 0 24 24' width='15' height='15' fill='currentColor'><path d='M8 5v14l11-7z'/></svg>" }),
      h("span", { text: label })
    ]);
  }

  // The 6-skill animated grid (the centrepiece of "Teach the six core skills").
  function skillGrid() {
    return h("div", { class: "tv-skills" }, SKILLS.map(function (s) {
      return h("div", { class: "tv-skill" }, [
        figureNode(renderSide(s.scene), { title: s.name, caption: s.caption, compact: true }),
        watchChip(s.watch, "Watch " + s.name.toLowerCase())
      ]);
    }));
  }

  // A hero motion diagram for tips that earn one; null otherwise.
  function heroFor(iconKey) {
    if (iconKey === "practice") {
      return figureNode(renderBlocks(), {
        title: "A practice that flows",
        caption: "Run practice in clear blocks and keep each one moving — warm-up, a couple of skill blocks, a game, then a cool-down."
      });
    }
    if (iconKey === "mental") {
      return figureNode(renderBreathe(), {
        title: "The reset breath",
        caption: "A slow breath — in, hold, out — and a cue word settle the nerves so the last mistake doesn't carry to the next rally."
      });
    }
    if (iconKey === "gameday" || iconKey === "rules") {
      return figureNode(renderRotation(), {
        title: "Rotate clockwise",
        caption: "Each time you win the serve, everyone rotates one spot clockwise: 1 → 6 → 5 → 4 → 3 → 2. Line up legally and you never give away a point."
      });
    }
    return null;
  }

  // The "See it in action" video row for a topic; null when none is curated.
  function videoRow(iconKey) {
    var list = VIDEOS[iconKey];
    if (!list || !list.length) return null;
    return h("div", { class: "tip__media" }, [
      h("span", { class: "eyebrow", text: "See it in action" }),
      h("div", { class: "tip__videos" }, list.map(function (it) { return watchChip(it.q, it.label); }))
    ]);
  }

  // ---- Public API ------------------------------------------------------------
  return {
    skillGrid: skillGrid,
    heroFor: heroFor,
    videoRow: videoRow
  };
})();
