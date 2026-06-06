// coaching.js — coaching guidance DATA + the Tips screen (RR.coaching).
//
// Everything a youth coach needs alongside the generated practices:
//   • tips       — practical, scannable best-practice guidance (incl. running a camp)
//   • byAge      — what to expect / emphasise at each of the five age bands
//   • reference  — REAL net height + ball per age band (keyed by the EXACT age
//                  strings RR.team uses, so RR.team.referenceFor() consumes it)
//   • terms      — a plain-English glossary of common volleyball terminology
//   • equipment  — the gear the drill library actually calls for, grouped
//
// Guidance follows USA Volleyball's youth ("FUNdamentals first") philosophy and
// age-appropriate equipment standards. The Tips screen (renderTips) uses only
// SEMANTIC tokens, so it reads correctly in BOTH light and dark themes; its
// disclosures are real <button>s (keyboard-operable, :focus-visible).
window.RR = window.RR || {};

RR.coaching = (function () {
  "use strict";

  // ======================================================================= //
  //  DATA — practical coaching tips                                         //
  //  Each: { title, icon, points:[...] }. `icon` keys into ICONS below.     //
  // ======================================================================= //
  var tips = [
    {
      title: "Run a great practice",
      icon: "practice",
      points: [
        "Run practice in clear blocks — warm-up, a couple of skill blocks, a game, then a cool-down — and keep each one moving so the energy never dips and nobody stands around waiting.",
        "Maximise contacts — more balls, smaller groups, short lines. Every player should be touching the ball constantly, never waiting in a line of eight.",
        "Keep instructions under 30 seconds, then play. Show the skill instead of lecturing about it.",
        "Use game-like reps: have players read a real ball over the net rather than a perfect toss, so what they practise transfers to matches.",
        "Give every drill a goal or score (\"first to 10 good passes\") so it has a purpose and a finish line.",
        "Build routines players can start on their own — the same warm-up each day — so practice begins the moment they arrive."
      ]
    },
    {
      title: "How to talk to players",
      icon: "talk",
      points: [
        "Be specific with praise: \"great platform angle\" beats \"good job\" because the player knows exactly what to repeat.",
        "Coach the next rep, not the last mistake — say what TO do (\"reach high\") instead of what not to do.",
        "Learn every name in the first week and use names constantly; it tells each kid they matter.",
        "Get down on their level, make eye contact, and keep your tone calm and positive even when correcting.",
        "Ask questions (\"where were your eyes?\") so players learn to self-correct instead of waiting for you.",
        "One cue at a time. Pick the single most important fix and let the rest go for now."
      ]
    },
    {
      title: "Handle mistakes & build confidence",
      icon: "confidence",
      points: [
        "Treat errors as normal and necessary — players who never miss aren't being challenged. Aggressive errors are fine; tentative ones aren't.",
        "Praise brave attempts and effort (\"great aggressive swing\") even when the result misses.",
        "Keep a short memory: reset after every rally and never pile on after a mistake.",
        "Give every player a role they can succeed at, then stretch it — success is what builds real confidence.",
        "Celebrate small wins loudly: a first overhand serve in, a first clean set, so progress feels visible.",
        "Teach teammates to encourage each other; a team that high-fives after errors plays looser and better."
      ]
    },
    {
      title: "Keep order & energy",
      icon: "energy",
      points: [
        "Set a \"balls down, eyes up\" signal so you can get quiet attention in seconds.",
        "Have the next drill set up before the current one ends — transitions are where energy and control leak away.",
        "Use stations and short rotations so nobody waits; idle players get bored and disruptive.",
        "Bring high energy yourself: teams mirror the coach, so move, clap, and use your voice.",
        "Agree on 2–3 simple rules on day one (hustle, respect, effort) and hold everyone to them fairly.",
        "Count transitions down (\"five… four…\") to keep practice crisp and on schedule."
      ]
    },
    {
      title: "Keep it FUN",
      icon: "fun",
      points: [
        "Win players over with fun first — kids who enjoy practice come back and try harder. Fun IS the FUNdamentals philosophy, not a reward for finishing work.",
        "Finish every session with a favourite game so they leave wanting more.",
        "Add light competition and a scoreboard; small stakes make ordinary drills exciting.",
        "Mix volleyball-themed tag and relay games into warm-ups, especially with younger players.",
        "Let players choose a game sometimes — and play along with them yourself.",
        "Laugh, celebrate, and keep the energy up; a smiling gym is a learning gym."
      ]
    },
    {
      title: "Safety",
      icon: "safety",
      points: [
        "Always warm up (light cardio + dynamic stretches) before any jumping or hitting, and cool down afterwards.",
        "Check the space: clear stray balls off the court between reps, secure standards and antennas, pad the posts, and watch for wet spots.",
        "Teach players to call the ball and stay in their zone so they don't collide chasing the same ball.",
        "Hydrate often with scheduled water breaks — more in heat — and watch for overuse, especially shoulders and knees.",
        "Know your emergency plan: a charged phone, a stocked first-aid kit, and where to get help. Keep a brief injury note.",
        "Match net height and ball to the age band so kids aren't straining to play (see your age card above)."
      ]
    },
    {
      title: "Talk to parents",
      icon: "parents",
      points: [
        "Set expectations early: share your schedule, goals, and how you'll communicate at a short start-of-season meeting.",
        "Be positive and specific about their child, and lead with something the kid is doing well.",
        "Use a 24-hour rule for heated topics — invite parents to talk the next day, not during or right after a match.",
        "Give parents a simple job: cheer effort, get players to practice on time, and reinforce a growth mindset at home.",
        "Be clear and consistent about playing time and roles so there are no surprises.",
        "Recruit volunteers for scorekeeping, snacks, and setup — involved parents become your best support."
      ]
    },
    {
      // Camp-specific guidance. renderTips() surfaces this FIRST when the team's
      // programType === "camp"; otherwise it stays at the end of the list.
      title: "Running a camp",
      icon: "camp",
      points: [
        "Bring high energy and tight structure from minute one — a camp lives or dies on its pace.",
        "Theme each day (Serving Day, Defense Day, Game Day) so it's memorable and easy to talk about.",
        "Use short rotations and stations so big, mixed-age groups always have a ball in hand and never wait their turn.",
        "Open each day with names and a quick hook; close it with a game and a high-five tunnel.",
        "Build toward a final-day mini-tournament with simple awards so camp ends on its highest note.",
        "Plan two sessions a day — AM technical, PM games — with regular water and shade breaks.",
        "Keep every instruction under 30 seconds, then play. Campers came to touch the ball, not to listen."
      ]
    }
  ];

  // ======================================================================= //
  //  DATA — what to expect at each age band                                 //
  //  Keyed by the EXACT age strings from RR.team.AGE_GROUPS. 4–6 concrete   //
  //  sentences each: attention span, what to emphasise, how to modify, tone.//
  // ======================================================================= //
  var byAge = {
    "8-10 (FUNdamentals)":
      "Attention spans are short, so change activities every 3–5 minutes and keep talking to a sentence or two. " +
      "Emphasise fun, basic ball control, and a high number of touches far above winning — this is the FUNdamentals stage where learning to love the game matters most. " +
      "Modify everything down: a low net (~6'6\" or less), a light foam or Volley-Lite ball, smaller courts, and catch-and-throw before true passing. " +
      "Lean on simple games, playful names, and constant encouragement, and celebrate effort loudly. " +
      "Expect wobble and a little chaos — that's completely normal — and keep your tone warm, playful, and patient.",
    "11-12 (Foundations)":
      "Players can now focus for longer stretches (about 5–10 minutes per activity) and follow two- and three-step drills. " +
      "Build real foundations: forearm passing, overhand serving, basic setting, and the idea of three contacts per side. " +
      "Use a 7-foot net and a lightweight official-size ball so technique can develop without strain. " +
      "Introduce light competition and keep groups small for maximum reps. " +
      "Be positive and specific — they can act on a clear cue, but it still needs to feel like fun.",
    "13-14 (Developing)":
      "Players can handle longer, more complex sessions and begin to specialise. " +
      "Emphasise connecting skills — serve receive to set to attack — and introduce positions, rotations, and basic systems. " +
      "Move to a regulation net (7'4⅛\") and a standard ball. " +
      "Push intensity and accountability while staying encouraging; bodies are changing fast, so watch for growth-related soreness and temporary dips in coordination. " +
      "Your tone can be more direct and challenging, but keep it supportive — confidence is fragile at this age.",
    "15-16 (Competitive)":
      "Attention and stamina now support full-length, game-speed practices. " +
      "Emphasise competitive systems, faster tempo, specialised roles, and reading the game tactically. " +
      "Net and ball are full regulation. " +
      "Hold a high standard, give honest feedback, and let players take ownership of warm-ups and goals. " +
      "Strike the tone of a serious-but-positive coach — they respond to being treated like real competitors and to clear, fair expectations.",
    "17-18 (Advanced)":
      "These are mature athletes who can focus deeply and largely self-manage. " +
      "Emphasise refinement, advanced tactics, situational play, and mental skills like pre-serve routines and composure under pressure. " +
      "Use full regulation equipment and game-realistic, high-intensity reps. " +
      "Coach them as near-adults: explain the \"why,\" involve them in strategy, and prepare them for the next level. " +
      "Keep the tone respectful and collaborative — and remember they still play their best when they're enjoying it."
  };

  // ======================================================================= //
  //  DATA — age-band equipment reference (REAL values)                      //
  //  Object keyed by the EXACT age strings, each { net, ball }. This is the //
  //  shape RR.team.referenceFor() reads; once present it replaces the team  //
  //  module's built-in fallback. Heights/weights verified vs USA Volleyball //
  //  age-appropriate standards (girls'/women's progression).                //
  // ======================================================================= //
  var reference = {
    "8-10 (FUNdamentals)": { net: "6'6\" (2.00 m)",  ball: "Lightweight foam / youth ball" },
    "11-12 (Foundations)": { net: "7'0\" (2.13 m)",  ball: "Lightweight Volley-Lite (~25% lighter)" },
    "13-14 (Developing)":  { net: "7'4⅛\" (2.24 m)", ball: "Standard official indoor ball" },
    "15-16 (Competitive)": { net: "7'4⅛\" (2.24 m)", ball: "Official indoor ball" },
    "17-18 (Advanced)":    { net: "7'4⅛\" (2.24 m)", ball: "Official indoor ball" }
  };
  // One-line caveat shown beneath the reference. Net heights follow the girls'/
  // women's progression; the youngest groups sometimes drop lower, and boys'/
  // men's nets rise at the older ages — so leagues vary.
  var referenceNote =
    "Heights follow USA Volleyball's girls'/women's progression; the youngest groups sometimes use a lower 5–6 ft net, and boys'/men's nets are higher at older ages. Always confirm the exact net height with your league.";

  // ======================================================================= //
  //  DATA — glossary of common volleyball terminology                       //
  //  { term, def }. Plain-English, one sentence each.                       //
  // ======================================================================= //
  var terms = [
    { term: "Ace", def: "A serve that scores directly — it lands in untouched, or the receiver can't keep it in play." },
    { term: "Antenna", def: "The vertical rod on each side of the net marking the legal width of play; the ball must cross between the antennas." },
    { term: "Approach", def: "The footwork an attacker uses to jump and hit — most often a three-step \"left-right-left\" (for a right-hander)." },
    { term: "Assist", def: "The pass or set to the teammate who then scores the kill; usually credited to the setter." },
    { term: "Attack (spike / hit)", def: "Sending the ball forcefully into the opponent's court to try to score." },
    { term: "Block", def: "Jumping at the net with hands pressed over it to stop or slow an opponent's attack." },
    { term: "Dig", def: "A defensive forearm save of a hard-driven attack that keeps the ball off the floor." },
    { term: "Dink (tip)", def: "A soft one-handed attack placed into open space instead of a hard swing." },
    { term: "Float serve", def: "A serve hit flat with no spin so the ball wavers unpredictably in the air." },
    { term: "Free ball", def: "An easy, non-attacking return from the opponent that lets your team set up its offense." },
    { term: "Joust", def: "When two opposing players contact the ball at the same time above the net." },
    { term: "Kill", def: "An attack that directly ends the rally for a point." },
    { term: "Libero", def: "A back-row defensive specialist in a contrasting jersey who subs freely but can't attack above net height or block." },
    { term: "Pancake", def: "A last-ditch save where a player slides a flat hand under the ball so it bounces off the back of the hand." },
    { term: "Pass (bump / forearm pass)", def: "The first contact, played off the forearm platform to control a serve or attack." },
    { term: "Pepper", def: "A two-player warm-up of pass, set, and hit back and forth to groove ball control." },
    { term: "Platform", def: "The flat surface made by joining the forearms together for passing." },
    { term: "Rally scoring", def: "The scoring system where a point is won on every rally, no matter which team served." },
    { term: "Rotation", def: "The clockwise shift of players through the six court positions each time the team wins back the serve." },
    { term: "Serve receive", def: "The system and skill of passing the opponent's serve accurately to the setter." },
    { term: "Set", def: "An overhead contact (usually the second) that places the ball for a hitter to attack." },
    { term: "Setter", def: "The \"quarterback\" who runs the offense and delivers sets to the attackers." },
    { term: "Side-out", def: "Winning the rally — and the serve — when the other team was serving." },
    { term: "Six-pack", def: "Slang for getting hit in the face or head by an attacked ball." },
    { term: "Tool (wipe)", def: "Deliberately hitting the ball off the blockers' hands so it deflects out of bounds for a point." },
    { term: "Outside hitter (OH / pin)", def: "The left-front attacker who usually takes the most swings on the team." },
    { term: "Opposite (right-side)", def: "The attacker and blocker on the right front, positioned opposite the setter in the rotation." },
    { term: "Middle blocker (MB)", def: "The front-row center player who blocks across the net and hits quick attacks." },
    { term: "Defensive specialist (DS)", def: "A back-row substitute brought in to pass and play defense." }
  ];

  // ======================================================================= //
  //  DATA — equipment for the drills                                        //
  //  Grouped into must-haves and station/training extras. Every item is     //
  //  actually used by drills in the RR.drills library (plus core safety &   //
  //  game-management gear).                                                 //
  // ======================================================================= //
  var equipment = [
    {
      group: "Always bring these",
      items: [
        { name: "Volleyballs", note: "One per 1–2 players (a dozen or more). Light foam/Volley-Lite for younger ages, regulation for older. The most-used item in nearly every drill." },
        { name: "Net & standards", note: "Set to the age-appropriate height and pad the posts — needed for serving, hitting, blocking, and all game play." },
        { name: "Antennas", note: "Mark the legal width of play on the net so game-like reps and scrimmages stay realistic." },
        { name: "Ball cart or bag", note: "Keeps balls within reach so you can feed reps quickly and reset between rounds." },
        { name: "Cones / floor markers", note: "Define targets, zones, lines, and station boundaries in seconds." },
        { name: "Whistle", note: "Start and stop drills and games crisply and get attention fast." },
        { name: "Pinnies / scrimmage vests", note: "Split teams clearly for games, stations, and scrimmages." },
        { name: "Water & first-aid kit", note: "Scheduled hydration plus quick response to bumps and scrapes — your safety basics." }
      ]
    },
    {
      group: "Great extras for stations & training",
      items: [
        { name: "Agility ladder", note: "Footwork patterns and warm-up speed work." },
        { name: "Jump ropes", note: "Warm-up cardio and rhythm/coordination." },
        { name: "Resistance / mini bands", note: "Shoulder and hip activation in warm-ups and injury prevention." },
        { name: "Medicine ball", note: "Power and core work for older players." },
        { name: "Reaction ball", note: "Reflex and read-and-react defense training." },
        { name: "Hoops / targets", note: "Aiming targets that sharpen serving and passing accuracy." },
        { name: "Foam roller", note: "Cool-down and recovery." },
        { name: "Plyo boxes / steps", note: "Approach and jump-training stations for older ages." },
        { name: "Tumbling mats", note: "Cushion diving and sprawling defense work so players learn it safely." },
        { name: "A wall", note: "A free \"partner\" for solo passing, setting, and serving reps." }
      ]
    }
  ];

  // ======================================================================= //
  //  ICONS — small decorative line glyphs for each tip section (aria-hidden)//
  // ======================================================================= //
  var ICONS = {
    practice:   "<rect x='5' y='4' width='14' height='17' rx='2'/><path d='M9 4h6v3H9z'/><path d='M8.5 12.5l2 2 4-4'/>",
    talk:       "<path d='M21 6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3v4l4-4h7a2 2 0 0 0 2-2z'/>",
    confidence: "<path d='M12 3l2.3 5 5.2.5-3.9 3.5 1.2 5.2L12 19.8 7.2 22.7l1.2-5.2L4.5 8.5 9.7 8z'/>",
    energy:     "<path d='M13 2 4 14h6l-1 8 9-12h-6z'/>",
    fun:        "<circle cx='12' cy='12' r='9'/><path d='M8 14s1.5 2 4 2 4-2 4-2'/><path d='M9 9h.01M15 9h.01'/>",
    safety:     "<path d='M12 3l7 3v5c0 4.6-3.1 7.6-7 9-3.9-1.4-7-4.4-7-9V6z'/><path d='M9 12l2 2 4-4'/>",
    parents:    "<circle cx='9' cy='8' r='3'/><path d='M4 19c0-3 2.2-5 5-5s5 2 5 5'/><path d='M16 6a3 3 0 0 1 0 6'/><path d='M17.5 14.2c2 .5 3.5 2.3 3.5 4.8'/>",
    camp:       "<circle cx='12' cy='12' r='4.5'/><path d='M12 2v2.5M12 19.5V22M4 12H2M22 12h-2M5 5l1.6 1.6M17.4 17.4 19 19M19 5l-1.6 1.6M6.6 17.4 5 19'/>",
    terms:      "<path d='M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z'/><path d='M9 8h6M9 12h5'/>",
    equip:      "<path d='M3 8l9-4 9 4-9 4-9-4z'/><path d='M3 8v8l9 4 9-4V8'/><path d='M12 12v8'/>"
  };

  // ======================================================================= //
  //  Tiny DOM helpers (mirrors team.js / season.js; RR.ui arrives Prompt 8) //
  // ======================================================================= //
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
    append(node, kids);
    return node;
  }
  function append(node, kids) {
    if (kids == null) return;
    if (Array.isArray(kids)) kids.forEach(function (k) { append(node, k); });
    else if (kids instanceof Node) node.appendChild(kids);
    else node.appendChild(document.createTextNode(String(kids)));
  }

  // Unique ids so each disclosure button can point at its panel (aria-controls).
  var panelSeq = 0;
  function nextId() { return "tips-panel-" + (++panelSeq); }

  function iconSvg(key) {
    return "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' " +
           "stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>" + (ICONS[key] || "") + "</svg>";
  }
  function chevronSvg() {
    return "<svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' " +
           "stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>";
  }

  // ======================================================================= //
  //  Disclosure card — a real <button> header + collapsible panel.          //
  //  Keyboard-operable for free (it's a button), focus ring via             //
  //  :focus-visible, and aria-expanded/aria-controls wired for screen       //
  //  readers. Never nests a card inside a card — the panel is a plain div.  //
  // ======================================================================= //
  function discloseCard(title, iconKey, panelContent, open) {
    var pid = nextId();
    var toggle = h("button", {
      type: "button", class: "tip__toggle", "aria-expanded": open ? "true" : "false", "aria-controls": pid
    }, [
      h("span", { class: "tip__icon", "aria-hidden": "true", html: iconSvg(iconKey) }),
      h("span", { class: "tip__title", text: title }),
      h("span", { class: "tip__chev" + (open ? " is-open" : ""), "aria-hidden": "true", html: chevronSvg() })
    ]);
    var panel = h("div", { class: "tip__panel", id: pid }, [panelContent]);
    if (!open) panel.hidden = true;

    toggle.addEventListener("click", function () {
      var nowOpen = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", nowOpen ? "true" : "false");
      panel.hidden = !nowOpen;
      toggle.querySelector(".tip__chev").classList.toggle("is-open", nowOpen);
    });

    return h("section", { class: "card tip" }, [toggle, panel]);
  }

  // Panel bodies ---------------------------------------------------------------
  function buildPoints(points) {
    return h("ul", { class: "tip__points" },
      points.map(function (p) { return h("li", { text: p }); }));
  }

  function buildTerms() {
    var dl = h("dl", { class: "terms" });
    terms.forEach(function (t) {
      dl.appendChild(h("dt", { text: t.term }));
      dl.appendChild(h("dd", { text: t.def }));
    });
    return dl;
  }

  function buildEquipment() {
    return h("div", {}, equipment.map(function (grp) {
      return h("div", { class: "equip-group" }, [
        h("span", { class: "eyebrow", text: grp.group }),
        h("ul", { class: "equip-list" }, grp.items.map(function (it) {
          return h("li", {}, [h("strong", { text: it.name }), " — " + it.note]);
        }))
      ]);
    }));
  }

  // ======================================================================= //
  //  Top card — age-band guidance + net/ball reference                      //
  // ======================================================================= //
  function refItems(band) {
    var ref = (RR.team && RR.team.referenceFor) ? RR.team.referenceFor(band) : reference[band] || { net: "—", ball: "—" };
    return h("div", { class: "summary-grid" }, [
      summaryItem("Net height", ref.net, true),
      summaryItem("Ball", ref.ball, true)
    ]);
  }
  function summaryItem(label, value, accent) {
    return h("div", { class: "summary-item" + (accent ? " summary-item--accent" : "") }, [
      h("span", { class: "summary-item__label", text: label }),
      h("span", { class: "summary-item__value", text: value })
    ]);
  }

  // Team set up -> show THEIR age band's guidance + reference.
  function buildAgeCard(team) {
    var band = team.ageGroup;
    var guidance = byAge[band] || "Set your team's age group to see tailored guidance.";
    return h("section", { class: "card" }, [
      h("div", { class: "card-head" }, [
        h("h2", { text: "For your age group" }),
        h("span", { class: "pill", text: band })
      ]),
      h("p", { class: "age-guide__text", text: guidance }),
      refItems(band),
      h("p", { class: "muted ref-note", text: referenceNote })
    ]);
  }

  // No team yet -> still useful: the full net/ball table for every band, plus a
  // gentle nudge to set up the team for age-specific coaching notes.
  function buildAllBandsCard() {
    var order = (RR.team && RR.team.AGE_GROUPS) || Object.keys(reference);
    var rows = h("div", { class: "ref-rows" }, order.map(function (band) {
      var r = reference[band] || { net: "—", ball: "—" };
      return h("div", { class: "ref-row" }, [
        h("span", { class: "ref-row__band", text: band }),
        h("span", { class: "ref-row__spec", text: r.net + " · " + r.ball })
      ]);
    }));
    return h("section", { class: "card" }, [
      h("h2", { text: "Net height & ball by age" }),
      h("p", { class: "muted", text: "Set up your team to get age-specific coaching notes here." }),
      rows,
      h("p", { class: "muted ref-note", text: referenceNote }),
      h("a", { class: "btn btn-primary tips-setup-link", href: "#team", text: "Set up your team" })
    ]);
  }

  // ======================================================================= //
  //  Entry point — renderTips(host)                                         //
  // ======================================================================= //
  // Camp teams see the "Running a camp" section first; everyone else keeps the
  // natural order (it stays available at the end).
  function orderedTips(team) {
    if (team && team.programType === "camp") {
      var camp = null, rest = [];
      tips.forEach(function (t) { if (t.icon === "camp") camp = t; else rest.push(t); });
      return camp ? [camp].concat(rest) : tips.slice();
    }
    return tips.slice();
  }

  function renderTips(host) {
    var team = (RR.state && RR.state.getState().team) || null;
    var setUp = !!(RR.team && RR.team.isSetUp && RR.team.isSetUp(team));

    host.appendChild(h("p", { class: "screen-sub tips-intro",
      text: "Real, practical coaching help — tuned to your team's age and program." }));

    // Top: age guidance + reference (or the all-bands table until a team exists).
    host.appendChild(setUp ? buildAgeCard(team) : buildAllBandsCard());

    // The tips accordion. Open the first card so the screen never reads as a
    // wall of closed bars; for camps that first card is "Running a camp".
    orderedTips(team).forEach(function (t, i) {
      host.appendChild(discloseCard(t.title, t.icon, buildPoints(t.points), i === 0));
    });

    // Reference sections, collapsed by default to keep the page scannable.
    host.appendChild(discloseCard("Volleyball terms, explained", "terms", buildTerms(), false));
    host.appendChild(discloseCard("Gear & equipment for drills", "equip", buildEquipment(), false));
  }

  // ---- Public API ------------------------------------------------------------
  return {
    tips: tips,
    byAge: byAge,
    reference: reference,
    referenceNote: referenceNote,
    terms: terms,
    equipment: equipment,
    renderTips: renderTips,
    render: renderTips   // alias used by the router
  };
})();
