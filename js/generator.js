// generator.js — the session generation engine.
//
// PURE LOGIC ONLY (no DOM, no theming). Given a team, a date, and — for camps —
// a session slot, it builds one complete, ready-to-run practice: warm-up, skill
// blocks, a game, and a cool-down. It balances CONSISTENCY (the same staples and
// skill focus the players come to expect) with FRESHNESS (rotating drills, no
// recent repeats), and scales difficulty/volume to the periodization phase.
//
// It reads from three other PURE modules and never re-implements their logic:
//   RR.team          — programWindow + ageRange + emphasis (the single contract)
//   RR.periodization — phase, intensity, day type, and skill focus for a date
//   RR.drills        — the drill library it draws from (each drill's
//                      videoSearchUrl is carried through to the block UNTOUCHED)
//   RR.state         — recent-session history (which drills to avoid repeating)
//   RR.coaching      — phase-appropriate coach notes
//
// Determinism: generateSession(team, date, regenCount, slot) seeds a mulberry32
// RNG from a hash of (team.name + ISO date + regenCount + slot). So "today" is
// stable, Regenerate (regenCount+1) differs, tomorrow differs, and — for camps
// with sessionsPerDay > 1 — each slot (AM/PM/…) differs. Seasons always use slot 0.
//
// See docs/program-model.md for the season/camp program model.
window.RR = window.RR || {};

RR.generator = (function () {
  "use strict";

  // How many recent sessions to look back over when avoiding repeats.
  var HISTORY_N = 4;

  // The drill skill categories used by the library / periodization.
  var BALL_CONTROL = "Ball Control";

  // ======================================================================= //
  //  SEEDED RNG (mulberry32) + string hashing                               //
  // ======================================================================= //

  // 32-bit FNV-1a string hash -> unsigned int. Cheap, well-distributed, and
  // identical across runs, which is what we need for a reproducible seed.
  function hashStr(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      // h *= 16777619, kept in 32-bit range via Math.imul.
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // mulberry32: a tiny, fast, well-tested PRNG. Same seed -> same stream.
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // A fresh RNG keyed to a base seed plus a salt label, so independent concerns
  // (block ordering vs. plan-level coin flips) draw from independent streams but
  // stay reproducible for the same session.
  function rngFor(seed, salt) {
    return mulberry32((seed ^ hashStr(String(salt))) >>> 0);
  }

  // ======================================================================= //
  //  SMALL PURE HELPERS                                                     //
  // ======================================================================= //

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // Round to the nearest 5-minute increment, never below one 5-minute unit.
  function roundTo5(x) { return Math.max(5, Math.round(x / 5) * 5); }

  // Index of the max value in an array (first one wins ties).
  function argmax(arr) {
    var best = 0;
    for (var i = 1; i < arr.length; i++) if (arr[i] > arr[best]) best = i;
    return best;
  }

  // Distribute `target` total minutes across blocks in proportion to `weights`,
  // rounding each block to a 5-minute increment so the parts sum EXACTLY to the
  // target. Every block keeps at least 5 minutes. Used so the printed timeline
  // always adds up to the session length (or, in easing phases, the reduced length).
  function allocateMinutes(target, weights) {
    var sum = weights.reduce(function (a, b) { return a + b; }, 0) || 1;
    var raw = weights.map(function (w) { return (w / sum) * target; });
    var mins = raw.map(function (r) { return roundTo5(r); });
    var total = mins.reduce(function (a, b) { return a + b; }, 0);

    // Nudge in 5-minute steps toward the target, giving/taking from the block
    // whose rounded value is furthest from its ideal share.
    var guard = 0;
    while (total !== target && guard++ < 500) {
      if (total < target) {
        var deficit = raw.map(function (r, k) { return r - mins[k]; });
        var i = argmax(deficit);
        mins[i] += 5; total += 5;
      } else {
        // Only pull from blocks that can spare it (stay >= 5 minutes).
        var surplus = raw.map(function (r, k) {
          return mins[k] > 5 ? (mins[k] - r) : -Infinity;
        });
        var j = argmax(surplus);
        if (surplus[j] === -Infinity) break;  // nothing left to trim
        mins[j] -= 5; total -= 5;
      }
    }
    return mins;
  }

  // Build a drill id -> drill lookup once per generation (the library is static
  // but we don't assume it; this keeps swapBlock fast and id-based).
  function buildDrillIndex() {
    var byId = {};
    var list = (RR.drills || []);
    for (var i = 0; i < list.length; i++) byId[list[i].id] = list[i];
    return byId;
  }

  // ======================================================================= //
  //  HISTORY — drills used in the last N sessions (from RR.state)           //
  // ======================================================================= //

  // Collect the drill ids used across the most recent HISTORY_N saved sessions
  // for THIS team, so we can avoid repeating them. For camps this naturally spans
  // days AND slots, because saved sessions carry both. Saved entries may store a
  // flat `drillIds` array or full `blocks[].drill.id`; we accept either shape.
  function recentDrillIds(team, iso, slot) {
    var ids = {};
    try {
      var state = RR.state.getState();
      var saved = (state && state.savedSessions) || [];
      var mine = saved.filter(function (s) {
        var nm = s.teamName || (s.team && s.team.name) || s.team;
        // If a saved session records no team, fall back to including it.
        return nm == null || nm === team.name;
      });
      // Don't let a session block itself (regenerating the same date/slot should
      // still be free to re-pick; freshness there comes from the changed seed).
      mine = mine.filter(function (s) {
        return !(s.date === iso && (s.slot || 0) === (slot || 0));
      });
      // Most recent first: by date, then by slot.
      mine.sort(function (a, b) {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return (b.slot || 0) - (a.slot || 0);
      });
      mine.slice(0, HISTORY_N).forEach(function (s) {
        var list = s.drillIds ||
          (s.blocks || []).map(function (b) { return b.drill && b.drill.id; });
        (list || []).forEach(function (id) { if (id) ids[id] = true; });
      });
    } catch (e) { /* no history available — that's fine, just less freshness */ }
    return ids;
  }

  // ======================================================================= //
  //  DRILL SELECTION                                                        //
  // ======================================================================= //

  // Complementary skills for season "Skill Block B" — a sensible second skill to
  // pair with the primary focus. The seeded RNG rotates the choice for freshness.
  var COMPLEMENTS = {
    "Passing":      ["Defense", "Setting", BALL_CONTROL],
    "Setting":      ["Hitting", "Passing", BALL_CONTROL],
    "Serving":      ["Passing", "Defense", BALL_CONTROL],
    "Hitting":      ["Setting", "Defense", "Blocking"],
    "Defense":      ["Passing", "Hitting", BALL_CONTROL],
    "Ball Control": ["Passing", "Setting", "Defense"],
    "Blocking":     ["Hitting", "Defense", "Setting"],
    "Team Play":    ["Passing", "Defense", "Setting"]
  };

  // Does a drill's age range overlap the team's age band? A drill is age-eligible
  // when its [ageMin, ageMax] intersects [team.min, team.max].
  function ageEligible(drill, band) {
    return drill.ageMin <= band.max && drill.ageMax >= band.min;
  }

  // Gear a drill needs but the coach hasn't said they own. Balls, a net, cones
  // and a wall are assumed available everywhere; anything else is an "extra" the
  // coach ticks on the Team screen.
  var BASIC_EQUIP = { balls: true, net: true, cones: true, wall: true };
  function equipmentOk(drill, owned) {
    var eq = drill.equipment || [];
    for (var i = 0; i < eq.length; i++) {
      if (!BASIC_EQUIP[eq[i]] && !owned[eq[i]]) return false;
    }
    return true;
  }

  // Filter the library to the drills eligible for one block, given how strict we
  // are being. `relax` widens the net per the required ladder:
  //   0: full rules; 1: ignore recent-used; 2: widen difficulty + drop the
  //      roster-size/equipment constraints; 3: drop the campFriendly preference.
  // The ladder guarantees a block is never empty even on a tiny squad with no gear.
  function eligiblePool(req, ctx, relax) {
    var band = ctx.band;
    var dmin = req.dMin, dmax = req.dMax;
    if (relax >= 2) { dmin = dmin - 1; dmax = dmax + 1; }

    return (RR.drills || []).filter(function (d) {
      if (!ageEligible(d, band)) return false;
      if (ctx.used[d.id]) return false;                 // already in this session
      if (relax < 1 && ctx.recent[d.id]) return false;  // used in a recent session
      // Suit the squad size and the gear on hand (relaxed only as a last resort).
      if (relax < 2) {
        if (ctx.rosterSize && d.minPlayers && d.minPlayers > ctx.rosterSize) return false;
        if (!equipmentOk(d, ctx.owned)) return false;
      }

      // Role match.
      if (req.kind === "warmup") { if (d.skill !== "Warmup") return false; }
      else if (req.kind === "cooldown") { if (d.skill !== "Cooldown") return false; }
      else if (req.kind === "game") { if (!d.isGame) return false; }
      else { if (d.skill !== req.skill) return false; } // skill block

      // Difficulty range — warm-ups and cool-downs are low-intensity staples that
      // apply in every phase, so they are exempt from the phase difficulty window.
      if (req.kind !== "warmup" && req.kind !== "cooldown") {
        if (d.difficulty < dmin || d.difficulty > dmax) return false;
      }
      return true;
    });
  }

  // A global prior for how proven/popular and high-transfer a drill is. A drill
  // may carry an explicit `value` (1 = niche … 5 = a core drill every coach runs);
  // otherwise the curated `isStaple` flag stands in, since staples ARE the popular,
  // foundational drills. Centred at 3 so it gently favours the high-value, high-
  // improvement drills everywhere (not just warm-ups) without crowding out variety
  // — the weighted shuffle still rotates the rest in over successive sessions.
  function valueWeight(drill) {
    var v = (typeof drill.value === "number") ? drill.value : (drill.isStaple ? 4 : 3);
    if (v < 1) v = 1; else if (v > 5) v = 5;
    return 1 + 0.22 * (v - 3);   // 2->0.78  3->1.0  4->1.22  5->1.44
  }

  // Weight a single drill for the seeded weighted pick. Starts from how popular /
  // helpful-for-improvement the drill is (valueWeight), then lightly boosts the
  // team's emphasis skills, the campFriendly drills on camp blocks, the game
  // framing the phase wants (cooperative vs. competitive), and staples on anchors.
  function weightFor(drill, req, ctx) {
    var w = valueWeight(drill);
    if (ctx.emphasis[drill.skill]) w *= 2.2;                 // coach emphasis (weighted strongly)
    if (ctx.favorites && ctx.favorites[drill.id]) w *= 1.5;  // a starred favorite
    if (req.campPrefer && drill.campFriendly) w *= 2.0;      // camp blocks
    if ((req.kind === "warmup" || req.kind === "cooldown") && drill.isStaple) w *= 1.6;
    if (req.favorite && drill.campFriendly) w *= 1.8;        // confidence/showcase
    // A fun favorite or cooperative game leans on the broad, lighter games.
    if (req.favorite && drill.skill === "Team Play") w *= 1.4;
    return w;
  }

  // Produce a DETERMINISTIC ordering of the eligible pool: a weighted shuffle
  // (repeated weighted draw without replacement) using a per-block RNG. The first
  // element is the generated pick; swapBlock simply advances to the next element.
  function weightedOrder(pool, req, ctx, rng) {
    var items = pool.map(function (d) { return { d: d, w: weightFor(d, req, ctx) }; });
    var order = [];
    while (items.length) {
      var total = items.reduce(function (a, it) { return a + it.w; }, 0);
      var r = rng() * total;
      var idx = 0;
      for (; idx < items.length; idx++) { r -= items[idx].w; if (r <= 0) break; }
      if (idx >= items.length) idx = items.length - 1;
      order.push(items[idx].d);
      items.splice(idx, 1);
    }
    return order;
  }

  // Pick a drill for a block, walking the relaxation ladder until the pool is
  // non-empty so we NEVER return an empty block. Returns the deterministic
  // ordering plus the chosen offset (0 = first pick) for later swapping.
  function chooseForBlock(req, ctx, blockIndex) {
    var pool = [];
    for (var relax = 0; relax <= 3 && pool.length === 0; relax++) {
      pool = eligiblePool(req, ctx, relax);
    }
    // Ultimate safety net (should never trigger with the bundled library): fall
    // back to any age-eligible drill, then to anything at all.
    if (pool.length === 0) {
      pool = (RR.drills || []).filter(function (d) { return ageEligible(d, ctx.band); });
    }
    if (pool.length === 0) pool = (RR.drills || []).slice();

    var rng = rngFor(ctx.seed, "block:" + blockIndex);
    var order = weightedOrder(pool, req, ctx, rng);
    return { order: order, offset: 0 };
  }

  // ======================================================================= //
  //  BLOCK PLAN (which blocks, what weights) per program + phase            //
  // ======================================================================= //

  // Decide the season "Skill Block B" skill: the ball-control anchor (Pepper /
  // Partner Passing family) recurs in MOST non-taper sessions for consistency,
  // otherwise a rotating complementary skill keeps things fresh.
  function complementarySkill(primary, phase, planRng) {
    var working = !phase.eases;                    // taper drops the anchor (caller)
    // Serve nearly every practice, like a real program: when serving isn't already
    // the week's focus, make the complementary block a serving (serve & receive)
    // block a good share of the time. Otherwise lean on the recurring ball-control
    // anchor (pepper / partner passing) that pairs with almost any focus.
    if (working && primary !== "Serving" && planRng() < 0.4) return "Serving";
    if (working && primary !== BALL_CONTROL && planRng() < 0.7) return BALL_CONTROL;
    var opts = COMPLEMENTS[primary] || ["Passing", "Defense", "Setting"];
    var pick = opts[Math.floor(planRng() * opts.length) % opts.length];
    if (pick === primary) pick = opts[(opts.indexOf(pick) + 1) % opts.length];
    return pick;
  }

  // Gently pace the session to the group's age — a soft tilt, never a hard rule.
  // Younger groups (FUNdamentals first) get shorter skill blocks and a little
  // more warm-up and play, so nobody stands still and no single drill drags;
  // older groups get longer skill blocks for the focused, refine-the-rep work
  // that rewards their longer attention span. The coach still owns the total
  // session length — this only nudges how it's divided. Weights are relative, so
  // allocateMinutes re-normalises and the total is unchanged.
  function applyAgeTilt(reqs, band) {
    if (!band || typeof band.min !== "number") return reqs;
    // Anchor on the youngest in the group (pace for them): ~8 -> -1 (youngest),
    // ~13 -> 0 (neutral), ~18 -> +1 (oldest). Clamped and deliberately coarse.
    var t = Math.max(-1, Math.min(1, (band.min - 13) / 5));
    if (!t) return reqs;
    reqs.forEach(function (r) {
      if (r.kind === "skill") r.weight *= (1 + 0.30 * t);
      else if (r.kind === "game") r.weight *= (1 - 0.30 * t);
      else if (r.kind === "warmup") r.weight *= (1 - 0.15 * t);
      // Cool-down / recap time doesn't really scale with age — leave it be.
    });
    return reqs;
  }

  // Build the ordered list of block REQUESTS (role, kind, skill, difficulty
  // window, relative weight, flags) for a session. Minutes are assigned later.
  function buildBlockRequests(ctx) {
    var phase = ctx.phase, primary = ctx.primarySkill;
    var dMin = phase.difficultyMin, dMax = phase.difficultyMax;
    var planRng = rngFor(ctx.seed, "plan");
    var reqs = [];

    // Staples that bookend every session, in both programs.
    var warmup = {
      role: "Warm-up & Ball Handling", kind: "warmup", skill: "Warmup",
      dMin: 1, dMax: 2, weight: 0.15, campPrefer: ctx.isCamp,
      why: "A staple warm-up gets bodies loose and hands on the ball before the work starts."
    };
    var cooldown = {
      role: "Cool-down & Coach Talk", kind: "cooldown", skill: "Cooldown",
      dMin: 1, dMax: 2, weight: 0.10, campPrefer: ctx.isCamp,
      why: "Cool down, stretch, and recap the day's focus so the lesson sticks."
    };

    if (ctx.isCamp) {
      // CAMP — games-forward, broad exposure, prefer campFriendly drills.
      var showcase = phase.key === "showcase";
      var coopGame = phase.key === "welcome";   // cooperative early, competitive later
      reqs.push(warmup);
      reqs.push({
        role: "Skill Block — " + ctx.skillFocus, kind: "skill", skill: primary,
        dMin: dMin, dMax: dMax, weight: 0.25, campPrefer: true,
        why: "Today's skill of the day is " + ctx.skillFocus + " — focused reps so campers feel fast improvement."
      });
      reqs.push({
        role: showcase ? "Mini-Tournament (favorite)"
                       : (coopGame ? "Cooperative Game" : "Game / Application"),
        kind: "game", dMin: dMin, dMax: dMax,
        weight: ctx.foldMiniGame ? 0.50 : 0.35, campPrefer: true,
        favorite: showcase, cooperative: coopGame,
        why: showcase
          ? "Celebrate with a favorite, light-hearted mini-tournament to show off the week."
          : (coopGame ? "A cooperative game so everyone keeps the ball alive and stays in it."
                      : "Apply the skill in a small-sided game where every rep counts.")
      });
      // Second fun block, unless we folded it into the game for short sessions.
      if (!ctx.foldMiniGame) {
        reqs.push({
          role: showcase ? "Favorite Mini-Game" : "Mini-Game or Station Rotation",
          kind: "game", dMin: dMin, dMax: dMax, weight: 0.15, campPrefer: true,
          favorite: showcase,
          why: "A second quick game keeps energy high and exposes campers to more of the sport."
        });
      }
      reqs.push(cooldown);
    } else {
      // SEASON — anchored skill focus with a complementary rotating block.
      reqs.push(warmup);
      reqs.push({
        role: "Skill Block A — " + ctx.skillFocus, kind: "skill", skill: primary,
        dMin: dMin, dMax: dMax, weight: 0.25,
        why: "Skill of the week is " + ctx.skillFocus + " — the session's primary technical focus."
      });

      if (phase.eases) {
        // TAPER: drop Skill Block B, finish on a fun confidence-builder. The whole
        // session is shortened by the phase volumeFactor (handled in minutes).
        reqs.push({
          role: "Confidence Game (favorite)", kind: "game",
          dMin: dMin, dMax: dMax, weight: 0.45, favorite: true, cooperative: true,
          why: "A familiar, confidence-building favorite — keep it light and send them in believing."
        });
      } else {
        var bSkill = complementarySkill(primary, phase, planRng);
        reqs.push({
          role: "Skill Block B — " + bSkill, kind: "skill", skill: bSkill,
          dMin: dMin, dMax: dMax, weight: 0.20,
          why: bSkill === BALL_CONTROL
            ? "A ball-control anchor (Pepper / partner passing) that recurs each week — rotated for freshness."
            : bSkill === "Serving"
              ? "Serving reps — like a real program, get serves and serve-receive in nearly every practice."
              : "A complementary " + bSkill + " block that rounds out the session."
        });
        var competitive = phase.key === "peak" || phase.key === "inseason";
        reqs.push({
          role: competitive ? "Competitive Game" : "Cooperative Game", kind: "game",
          dMin: dMin, dMax: dMax, weight: 0.30, cooperative: !competitive,
          why: competitive
            ? "A competitive, game-speed scrimmage to sharpen everything under pressure."
            : "A cooperative scoring game so players compete with the rally, not each other."
        });
      }
      reqs.push(cooldown);
    }
    return applyAgeTilt(reqs, ctx.band);
  }

  // ======================================================================= //
  //  COACH NOTE + FOCUS REMINDER                                            //
  // ======================================================================= //

  // Phase -> which coaching tip card is most relevant. We pull one point from it.
  var PHASE_TIP = {
    foundation:  ["Keep it FUN", "Run a great practice"],
    development: ["Run a great practice", "How to talk to players"],
    peak:        ["Keep order & energy", "How to talk to players"],
    taper:       ["Handle mistakes & build confidence", "Keep it FUN"],
    inseason:    ["Handle mistakes & build confidence", "Run a great practice"],
    welcome:     ["Keep it FUN", "How to talk to players"],
    build:       ["Run a great practice", "Keep order & energy"],
    showcase:    ["Keep it FUN", "Handle mistakes & build confidence"],
    blended:     ["Keep it FUN", "Run a great practice"]
  };

  function coachNoteFor(ctx) {
    var titles = PHASE_TIP[ctx.phase.key] || PHASE_TIP.foundation;
    var rng = rngFor(ctx.seed, "coachnote");
    var tips = (RR.coaching && RR.coaching.tips) || [];
    // Find a tip card by one of the phase's preferred titles (rotate the choice).
    var wantTitle = titles[Math.floor(rng() * titles.length) % titles.length];
    var card = null, i;
    for (i = 0; i < tips.length; i++) { if (tips[i].title === wantTitle) { card = tips[i]; break; } }
    if (!card) card = tips[0];
    if (card && card.points && card.points.length) {
      return card.points[Math.floor(rng() * card.points.length) % card.points.length];
    }
    // Fallback if coaching data is unavailable.
    return "Keep instructions short, maximise ball contacts, and finish on a game.";
  }

  function focusReminderFor(ctx) {
    var f = ctx.skillFocus, t = ctx.dayType;
    if (ctx.phase.eases) {
      return "Keep it light and confident today — sharpen " + f + ", no new material.";
    }
    if (t === "Competitive") return "Bring " + f + " to game speed today — compete every rally.";
    if (t === "Technical") return "Slow it down and groove clean " + f + " technique today.";
    return "Blend technique and competition around today's focus: " + f + ".";
  }

  // ======================================================================= //
  //  PUBLIC: generateSession                                                //
  // ======================================================================= //

  // Materialise one block request into the final block object: pick the drill,
  // attach the full drill (incl. videoSearchUrl) and the rotation metadata used
  // by swapBlock. `minutes` is assigned by the caller from allocateMinutes.
  function materialiseBlock(req, ctx, blockIndex, minutes) {
    var chosen = chooseForBlock(req, ctx, blockIndex);
    var drill = chosen.order[chosen.offset];
    ctx.used[drill.id] = true;                 // don't reuse it later in this session
    return {
      role: req.role,
      title: drill.name,
      minutes: minutes,
      drill: clone(drill),                      // carries videoSearchUrl untouched
      why: req.why,
      // Internal rotation state (underscore-prefixed): the deterministic candidate
      // ordering (ids) and the current offset, so swapBlock can advance through it.
      _pool: chosen.order.map(function (d) { return d.id; }),
      _offset: chosen.offset,
      _req: req
    };
  }

  // generateSession(team, date, regenCount=0, slot=0, opts={}) -> a full session.
  // opts.forceSkill  — a drill skill category (e.g. "Defense") the coach has chosen
  //                    to feature today, overriding the curriculum's skill focus.
  function generateSession(team, date, regenCount, slot, opts) {
    regenCount = regenCount || 0;
    slot = slot || 0;
    opts = opts || {};
    var P = RR.periodization;
    var iso = P.toISO(date || new Date());

    var plan = P.computePlan(team);
    if (!plan) return null;                     // team not set up / invalid schedule

    var isCamp = plan.type === "camp";
    if (!isCamp) slot = 0;                       // seasons have a single daily session

    var phase = P.phaseForDate(plan, iso);
    var intensity = P.intensityForDate(plan, iso);
    var dayType = P.dayType(plan, team, iso);
    var skillFocus = P.skillFocus(plan, team, iso);
    var primarySkill = P.focusToSkill(skillFocus);
    var band = RR.team.ageRange(team.ageGroup);

    // The day before a match becomes a fresher, confidence-building session — the
    // same easing the taper uses. Season-only (camps have no schedule).
    var gctx = (!isCamp && P.gameContext) ? P.gameContext(plan, iso) : null;
    if (gctx && gctx.isDayBeforeGame && phase.key === "inseason") {
      phase = Object.assign({}, phase, { eases: true, volumeFactor: 0.8 });
    }

    // A coach-chosen focus for the day overrides the curriculum's pick.
    if (opts.forceSkill) {
      primarySkill = opts.forceSkill;
      skillFocus = opts.forceSkill;
    }

    // Emphasis + favorites as lookups for the weighting step.
    var emphasis = {};
    (team.emphasis || []).forEach(function (s) { emphasis[s] = true; });
    var favorites = {};
    try {
      ((RR.state && RR.state.getState().favorites) || []).forEach(function (id) { favorites[id] = true; });
    } catch (e) { /* favorites optional */ }
    var owned = {};
    (team.equipment || []).forEach(function (tk) { owned[tk] = true; });

    // The seed: same (team, date, regenCount, slot) -> same session.
    var seed = hashStr(
      (team.name || "team") + "|" + iso + "|" + regenCount + "|" + slot
    );

    var sessionMinutes = team.sessionMinutes || 60;
    // Camps fold the second game into the main game on short sessions.
    var foldMiniGame = isCamp && sessionMinutes <= 45;

    var ctx = {
      team: team, plan: plan, phase: phase, isCamp: isCamp,
      intensity: intensity, dayType: dayType, skillFocus: skillFocus,
      primarySkill: primarySkill, band: band, emphasis: emphasis,
      favorites: favorites, owned: owned, rosterSize: team.rosterSize || 0,
      seed: seed, foldMiniGame: foldMiniGame,
      recent: recentDrillIds(team, iso, slot),
      used: {}, byId: buildDrillIndex()
    };

    // Block requests, then minutes (scaled by the phase volumeFactor in easing
    // phases so the timeline shrinks at taper/showcase), then materialise each.
    var reqs = buildBlockRequests(ctx);
    var target = roundTo5(sessionMinutes * (phase.eases ? phase.volumeFactor : 1));
    var minutes = allocateMinutes(target, reqs.map(function (r) { return r.weight; }));

    var blocks = reqs.map(function (req, i) {
      return materialiseBlock(req, ctx, i, minutes[i]);
    });
    var totalMinutes = blocks.reduce(function (a, b) { return a + b.minutes; }, 0);

    return {
      date: iso,
      slot: slot,
      programType: plan.programType,
      phaseKey: phase.key,
      phaseLabel: phase.label,
      dayType: dayType,
      skillFocus: skillFocus,
      skillOfWeek: skillFocus,        // alias (also "skill of the day" for camps)
      intensity: intensity,
      totalMinutes: totalMinutes,
      blocks: blocks,
      coachNote: coachNoteFor(ctx),
      focusReminder: focusReminderFor(ctx),
      // Match-schedule context for the screens (game day / day-before banners).
      gameContext: gctx || null,
      forcedSkill: opts.forceSkill || null,
      // Kept so swapBlock can rebuild a single block without re-deriving the plan.
      _seed: seed
    };
  }

  // ======================================================================= //
  //  PUBLIC: swapBlock                                                      //
  // ======================================================================= //

  // swapBlock(session, blockIndex, team) -> a NEW session identical to the old
  // one except that one block is replaced by the NEXT eligible drill in its
  // deterministic rotation. Everything else (minutes, other blocks, notes) stays
  // intact. Deterministic via the stored candidate ordering + an advancing offset.
  function swapBlock(session, blockIndex, team) {
    if (!session || !session.blocks || !session.blocks[blockIndex]) return session;
    var next = clone(session);
    var block = next.blocks[blockIndex];
    var pool = block._pool || [];
    if (pool.length <= 1) return next;          // nothing else to rotate to

    var byId = buildDrillIndex();
    var offset = ((block._offset || 0) + 1) % pool.length;

    // Skip any candidate already used by another block in this session, so a swap
    // never duplicates a drill that's elsewhere on the plan.
    var usedElsewhere = {};
    next.blocks.forEach(function (b, i) {
      if (i !== blockIndex && b.drill) usedElsewhere[b.drill.id] = true;
    });
    var guard = 0;
    while (usedElsewhere[pool[offset]] && guard++ < pool.length) {
      offset = (offset + 1) % pool.length;
    }

    var drill = byId[pool[offset]];
    if (!drill) return next;
    block._offset = offset;
    block.title = drill.name;
    block.drill = clone(drill);                  // carries videoSearchUrl untouched
    return next;
  }

  // setBlockDrill(session, blockIndex, drill) -> a NEW session with that block's
  // drill replaced by a specific one (the coach picked it from the library, or it
  // was pinned and re-applied after a Regenerate). Minutes, role and rotation
  // metadata are preserved; `drill` may be a drill object or an id.
  function setBlockDrill(session, blockIndex, drill) {
    if (!session || !session.blocks || !session.blocks[blockIndex]) return session;
    if (typeof drill === "string") drill = buildDrillIndex()[drill];
    if (!drill) return session;
    var next = clone(session);
    var block = next.blocks[blockIndex];
    block.title = drill.name;
    block.drill = clone(drill);                  // carries videoSearchUrl untouched
    if (block._pool && block._pool.indexOf(drill.id) !== -1) {
      block._offset = block._pool.indexOf(drill.id);
    }
    return next;
  }

  // ---- Public API (pure) ----------------------------------------------------
  return {
    generateSession: generateSession,
    swapBlock: swapBlock,
    setBlockDrill: setBlockDrill,
    // Exposed for inspection / the console self-checks below.
    _mulberry32: mulberry32,
    _hashStr: hashStr
  };
})();

/* ===========================================================================
 * CONSOLE SELF-CHECKS  (commented out — paste into the DevTools console)
 * ---------------------------------------------------------------------------
 * These build a full SEASON (every prep date) and a full CAMP (every day x every
 * slot) and assert the engine's invariants. They mutate nothing.
 *
 * // ---- 1. SEASON: walk every date from practiceStart to a week past the opener.
 * (function seasonCheck() {
 *   var team = {
 *     name: "Northside Spikers", ageGroup: "11-12 (Foundations)", programType: "season",
 *     practiceStart: "2026-08-01", seasonStart: "2026-09-26", practicesPerWeek: 3,
 *     sessionMinutes: 75, emphasis: ["Passing", "Serving"]
 *   };
 *   var P = RR.periodization, plan = P.computePlan(team);
 *   var iso = plan.startDate, end = P.addDays(plan.seasonStart, 7);
 *   var byPhase = {}, n = 0;
 *   while (iso <= end) {
 *     var s = RR.generator.generateSession(team, iso, 0, 0);
 *     console.assert(s && s.blocks.length >= 3, "season: enough blocks @ " + iso);
 *     s.blocks.forEach(function (b) {
 *       console.assert(b.drill && b.drill.id, "season: no empty block @ " + iso);
 *       console.assert(b.drill.videoSearchUrl, "season: videoSearchUrl carried @ " + iso);
 *       console.assert(b.minutes % 5 === 0 && b.minutes >= 5, "season: 5-min blocks @ " + iso);
 *     });
 *     var ph = P.phaseForDate(plan, iso);
 *     var expected = Math.max(5, Math.round(team.sessionMinutes * (ph.eases ? ph.volumeFactor : 1) / 5) * 5);
 *     console.assert(s.totalMinutes === expected, "season: total " + s.totalMinutes + " != " + expected + " @ " + iso);
 *     (byPhase[ph.key] = byPhase[ph.key] || []).push(s.intensity);
 *     iso = P.addDays(iso, 1); n++;
 *   }
 *   // Determinism + regenerate/slot behaviour.
 *   var a = RR.generator.generateSession(team, plan.startDate, 0, 0);
 *   var b = RR.generator.generateSession(team, plan.startDate, 0, 0);
 *   var c = RR.generator.generateSession(team, plan.startDate, 1, 0);
 *   console.assert(JSON.stringify(a) === JSON.stringify(b), "season: deterministic for same inputs");
 *   console.assert(JSON.stringify(a) !== JSON.stringify(c), "season: regenCount changes the session");
 *   // Intensity rises then eases at the taper.
 *   var avg = function (k) { var x = byPhase[k] || [0]; return x.reduce(function (p, q) { return p + q; }, 0) / x.length; };
 *   var top = avg("peak") || avg("development");
 *   console.assert(avg("foundation") < top, "season: intensity rises into peak");
 *   console.assert(avg("taper") <= top, "season: intensity eases at taper");
 *   console.log("SEASON ok —", n, "sessions; phase intensities:",
 *     Object.keys(byPhase).map(function (k) { return k + "=" + avg(k).toFixed(1); }).join(" "));
 * })();
 *
 * // ---- 2. CAMP: every camp day x every session slot.
 * (function campCheck() {
 *   var team = {
 *     name: "Summer Smash Camp", ageGroup: "8-10 (FUNdamentals)", programType: "camp",
 *     campStart: "2026-07-06", campDays: 5, sessionsPerDay: 2,
 *     sessionMinutes: 60, emphasis: ["Setting"]
 *   };
 *   var P = RR.periodization, plan = P.computePlan(team);
 *   var byPhase = {}, n = 0, d, slot;
 *   for (d = 1; d <= team.campDays; d++) {
 *     var iso = P.addDays(plan.startDate, d - 1);
 *     for (slot = 0; slot < team.sessionsPerDay; slot++) {
 *       var s = RR.generator.generateSession(team, iso, 0, slot);
 *       console.assert(s && s.blocks.length >= 3, "camp: enough blocks day " + d + " slot " + slot);
 *       s.blocks.forEach(function (b) {
 *         console.assert(b.drill && b.drill.id, "camp: no empty block day " + d + " slot " + slot);
 *         console.assert(b.drill.videoSearchUrl, "camp: videoSearchUrl carried");
 *       });
 *       var ph = P.phaseForDate(plan, iso);
 *       var expected = Math.max(5, Math.round(team.sessionMinutes * (ph.eases ? ph.volumeFactor : 1) / 5) * 5);
 *       console.assert(s.totalMinutes === expected, "camp: total " + s.totalMinutes + " != " + expected);
 *       (byPhase[ph.key] = byPhase[ph.key] || []).push(s.intensity);
 *       n++;
 *     }
 *   }
 *   // Each slot of a day must differ (different drills) even though the focus matches.
 *   var iso1 = plan.startDate;
 *   var am = RR.generator.generateSession(team, iso1, 0, 0);
 *   var pm = RR.generator.generateSession(team, iso1, 0, 1);
 *   console.assert(JSON.stringify(am.blocks) !== JSON.stringify(pm.blocks), "camp: AM and PM slots differ");
 *   // Showcase eases relative to the build phase.
 *   var avg = function (k) { var x = byPhase[k] || [0]; return x.reduce(function (p, q) { return p + q; }, 0) / x.length; };
 *   console.assert((avg("showcase") || 0) <= (avg("build") || avg("welcome")), "camp: showcase eases");
 *   console.log("CAMP ok —", n, "sessions; phase intensities:",
 *     Object.keys(byPhase).map(function (k) { return k + "=" + avg(k).toFixed(1); }).join(" "));
 * })();
 *
 * // ---- 3. swapBlock: replaces ONE block, keeps everything else intact.
 * (function swapCheck() {
 *   var team = {
 *     name: "Northside Spikers", ageGroup: "13-14 (Developing)", programType: "season",
 *     practiceStart: "2026-08-01", seasonStart: "2026-09-26", practicesPerWeek: 3,
 *     sessionMinutes: 90, emphasis: []
 *   };
 *   var s = RR.generator.generateSession(team, "2026-08-15", 0, 0);
 *   var i = 1; // a skill block
 *   var s2 = RR.generator.swapBlock(s, i, team);
 *   console.assert(s2.blocks[i].drill.id !== s.blocks[i].drill.id, "swap: target block changed");
 *   console.assert(s2.blocks[i].minutes === s.blocks[i].minutes, "swap: minutes preserved");
 *   s.blocks.forEach(function (b, k) {
 *     if (k !== i) console.assert(b.drill.id === s2.blocks[k].drill.id, "swap: other blocks intact @ " + k);
 *   });
 *   console.assert(RR.generator.swapBlock(s, i, team).blocks[i].drill.id === s2.blocks[i].drill.id, "swap: deterministic");
 *   console.log("SWAP ok — block", i, ":", s.blocks[i].title, "->", s2.blocks[i].title);
 * })();
 * =========================================================================== */
