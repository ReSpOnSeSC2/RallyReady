// periodization.js — the "brain" that makes practices ramp up and then ease off.
//
// PURE LOGIC ONLY (no DOM, no theming). Everything here is derived from the single
// normalized contract RR.team.programWindow(team) (see docs/program-model.md), so a
// full SEASON and a short SUMMER CAMP are planned by the same module:
//
//   SEASON  -> Foundation -> Development -> Peak -> Taper, then In-season maintenance.
//              Intensity rises through Peak, then dips for the Taper before the opener.
//   CAMP    -> Welcome -> Build -> Showcase, a self-contained day-by-day arc whose
//              LAST day is the celebration (no taper, no in-season).
//
// The Season/Camp screen (js/season.js) and the session generator (js/generator.js)
// both consume these functions; none of them re-implement the phase math.
window.RR = window.RR || {};

RR.periodization = (function () {
  "use strict";

  // ---- Tiny pure date helpers (local time; no UTC off-by-one) ---------------
  // Parse "YYYY-MM-DD" (or pass a Date) into a LOCAL midnight Date, or null.
  function parseISO(s) {
    if (s instanceof Date) return new Date(s.getFullYear(), s.getMonth(), s.getDate());
    if (!s) return null;
    var p = String(s).split("-");
    if (p.length !== 3) return null;
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d.getTime()) ? null : d;
  }
  // Date|ISO -> "YYYY-MM-DD".
  function toISO(d) {
    if (!(d instanceof Date)) d = parseISO(d);
    if (!d) return "";
    var mm = ("0" + (d.getMonth() + 1)).slice(-2);
    var dd = ("0" + d.getDate()).slice(-2);
    return d.getFullYear() + "-" + mm + "-" + dd;
  }
  // ISO + n days -> ISO.
  function addDays(iso, n) {
    var d = parseISO(iso);
    if (!d) return "";
    d.setDate(d.getDate() + n);
    return toISO(d);
  }
  // Whole days from isoA to isoB (B - A). Math.round absorbs any DST wobble.
  function daysBetween(isoA, isoB) {
    var a = parseISO(isoA), b = parseISO(isoB);
    if (!a || !b) return 0;
    return Math.round((b.getTime() - a.getTime()) / 86400000);
  }
  function clampInt(n, lo, hi) {
    n = Math.round(n);
    return n < lo ? lo : (n > hi ? hi : n);
  }

  // ---- Curriculum: which skill a phase rotates through ----------------------
  // "Skill of the week" (season) / "skill of the day" (camp). The labels are the
  // human focus; focusToSkill() below maps them to a drill `skill` category.
  var SEASON_CURRICULA = {
    foundation:  ["Passing", "Serving", "Ball Control", "Setting"],
    development: ["Serve Receive", "Setting", "Hitting Approach", "Defense", "Serving"],
    peak:        ["Serve Receive Systems", "Attacking", "Defense/Transition", "Serving Pressure", "Team Play"],
    // Taper introduces no new complex material — it revisits confident, game-like skills.
    taper:       ["Serving", "Serve Receive", "Team Play"],
    inseason:    ["Serve Receive", "Attacking", "Defense", "Serving", "Team Play"]
  };
  var CAMP_CURRICULA = {
    welcome:  ["Ball Control", "Passing", "Serving"],
    build:    ["Passing", "Setting", "Hitting Approach", "Serving", "Defense"],
    showcase: ["Team Play", "Serving", "Attacking"],
    blended:  ["Ball Control", "Passing", "Serving"]   // 1-day camp
  };

  // Focus label -> drill skill category (drills.js / generator.js vocabulary).
  var FOCUS_TO_SKILL = {
    "Passing": "Passing",
    "Serve Receive": "Passing",
    "Serve Receive Systems": "Passing",
    "Setting": "Setting",
    "Ball Control": "Ball Control",
    "Serving": "Serving",
    "Serving Pressure": "Serving",
    "Hitting Approach": "Hitting",
    "Attacking": "Hitting",
    "Defense": "Defense",
    "Defense/Transition": "Defense",
    "Team Play": "Team Play"
  };
  function focusToSkill(focus) { return FOCUS_TO_SKILL[focus] || "Ball Control"; }

  // ---- Coach-friendly copy per phase (one-line focus + a short "why") --------
  var SEASON_FOCUS = {
    foundation: {
      summary: "Build the fundamentals and good habits at a low, confident intensity.",
      why: "Early reps on the basics — passing platforms, serving routines, ball control — give every player a base to grow from, with low pressure so technique sticks."
    },
    development: {
      summary: "Connect the skills together and steadily raise the workload.",
      why: "With the basics in place we link them up — serve receive into setting into attack — and add competitive reps so players adapt to game speed."
    },
    peak: {
      summary: "Sharpen full-speed systems at the season's highest intensity.",
      why: "This is the hardest block: game-like, full-speed reps and team systems so the squad is firing on all cylinders heading into the opener."
    },
    taper: {
      summary: "Ease the volume, keep it crisp, and build confidence for the opener.",
      why: "We cut the workload so legs are fresh, run only familiar drills (no new complex material), and finish on confidence games so players arrive believing in themselves."
    },
    inseason: {
      summary: "Maintain sharpness with undulating, game-focused practices.",
      why: "Through the season we keep skills sharp with moderate, varied intensity — enough to keep improving and stay fresh without burning out between matches."
    }
  };
  var CAMP_SPEC = {
    welcome: {
      label: "Welcome", ti: 3, dmin: 1, dmax: 2, vol: 1.0, eases: false,
      summary: "Learn names, have fun, and get comfortable with the ball.",
      why: "Day one is about belonging and touches — names, rituals, and lots of ball-handling games so every camper leaves smiling and ready to come back."
    },
    build: {
      label: "Build", ti: 6, dmin: 2, dmax: 3, vol: 1.0, eases: false,
      summary: "Teach core skills with a fresh themed skill each day.",
      why: "The middle of camp is real volleyball — a 'skill of the day' plus small-sided games — so campers feel themselves improving fast."
    },
    showcase: {
      label: "Showcase", ti: 5, dmin: 2, dmax: 3, vol: 0.75, eases: true,
      summary: "Celebrate with favorite games, a mini-tournament, and awards.",
      why: "We lighten the load and let campers show what they've learned — favorite games, a mini-tournament, and high-fives — so camp ends on its highest note."
    },
    blended: {
      label: "Camp day", ti: 5, dmin: 1, dmax: 3, vol: 1.0, eases: false,
      summary: "A bit of everything: welcome, a core skill, games, and a send-off.",
      why: "With a single day we pack the whole arc into one session — names and ball-handling to start, a core skill in the middle, and favorite games to finish."
    }
  };

  // Phase colour key, consumed by the screen (kept here so the vocabulary lives
  // in one place). These map onto the fixed --i-* intensity hues.
  var PHASE_COLOR = {
    foundation: "easy", development: "mid", peak: "hard", taper: "taper",
    inseason: "mid", welcome: "easy", build: "hard", showcase: "mid", blended: "mid"
  };
  function phaseColor(key) { return PHASE_COLOR[key] || "mid"; }

  // ======================================================================= //
  //  PLAN BUILDERS                                                          //
  // ======================================================================= //

  // computePlan(team) -> a plan object, or null until the team has a valid window.
  function computePlan(team) {
    var win = (RR.team && RR.team.programWindow) ? RR.team.programWindow(team) : null;
    if (!win) return null;
    return win.type === "camp" ? buildCampPlan(win) : buildSeasonPlan(win);
  }

  // ---- Season: Foundation -> Development -> Peak -> Taper (+ In-season) ------
  function buildSeasonPlan(win) {
    var L = Math.max(1, win.lengthDays);                 // prep window length, days
    var prepWeeks = win.prepWeeks || Math.max(1, Math.round(L / 7));
    var start = win.startDate;                           // practiceStart
    var opener = win.endDate;                            // seasonStart / first game

    // Phase specs as fractional END points of the prep window. Short prep windows
    // (< 3 weeks) compress to Foundation/Development/Taper and skip Peak.
    var specs = (prepWeeks < 3)
      ? [
          { key: "foundation",  label: "Foundation",  fracEnd: 0.40, ti: 3, dmin: 1, dmax: 2, vol: 1.0, eases: false },
          { key: "development", label: "Development", fracEnd: 0.80, ti: 5, dmin: 2, dmax: 3, vol: 1.0, eases: false },
          { key: "taper",       label: "Taper",       fracEnd: 1.00, ti: 7, dmin: 2, dmax: 3, vol: 0.6, eases: true }
        ]
      : [
          { key: "foundation",  label: "Foundation",  fracEnd: 0.30, ti: 3, dmin: 1, dmax: 2, vol: 1.0, eases: false },
          { key: "development", label: "Development", fracEnd: 0.65, ti: 5, dmin: 2, dmax: 3, vol: 1.0, eases: false },
          { key: "peak",        label: "Peak",        fracEnd: 0.90, ti: 8, dmin: 3, dmax: 4, vol: 1.0, eases: false },
          { key: "taper",       label: "Taper",       fracEnd: 1.00, ti: 7, dmin: 2, dmax: 3, vol: 0.6, eases: true }
        ];

    // Fractions -> day offsets (end of each phase). Force the last to land on L.
    var ends = specs.map(function (s) { return clampInt(s.fracEnd * L, 1, L); });
    ends[ends.length - 1] = L;

    // Taper should be at least 7 days (or the whole window if it's shorter).
    var minTaper = Math.min(7, L);
    var taperStart = ends[ends.length - 2];
    if (L - taperStart < minTaper) ends[ends.length - 2] = L - minTaper;

    // Keep boundaries strictly increasing (each phase >= 1 day), then repair any
    // overflow created by clamping the taper start upward.
    var i;
    for (i = 1; i < ends.length; i++) {
      if (ends[i] <= ends[i - 1]) ends[i] = Math.min(L, ends[i - 1] + 1);
    }
    for (i = ends.length - 1; i >= 1; i--) {
      if (ends[i - 1] >= ends[i]) ends[i - 1] = Math.max(1, ends[i] - 1);
    }
    if (ends[0] < 1) ends[0] = 1;

    var phases = [];
    var startOff = 0;
    for (i = 0; i < specs.length; i++) {
      var s = specs[i];
      var endOff = ends[i];
      phases.push({
        key: s.key, label: s.label, color: phaseColor(s.key),
        startDate: addDays(start, startOff),
        endDate: addDays(start, endOff - 1),            // last day inside the phase
        startOffset: startOff, endOffset: endOff,
        weekStart: Math.floor(startOff / 7) + 1,
        weekEnd: Math.max(Math.floor(startOff / 7) + 1, Math.ceil(endOff / 7)),
        targetIntensity: s.ti, difficultyMin: s.dmin, difficultyMax: s.dmax,
        volumeFactor: s.vol, eases: s.eases,
        focusSummary: SEASON_FOCUS[s.key].summary, why: SEASON_FOCUS[s.key].why
      });
      startOff = endOff;
    }

    // In-season maintenance — begins at the opener and runs open-ended.
    phases.push({
      key: "inseason", label: "In-season", color: phaseColor("inseason"),
      startDate: opener, endDate: null,
      startOffset: L, endOffset: null,
      weekStart: prepWeeks + 1, weekEnd: null,
      targetIntensity: 6, difficultyMin: 2, difficultyMax: 3,
      volumeFactor: 1.0, eases: false,
      focusSummary: SEASON_FOCUS.inseason.summary, why: SEASON_FOCUS.inseason.why
    });

    var plan = {
      type: "season", programType: "season", label: win.label,
      startDate: start, endDate: opener, seasonStart: opener,
      lengthDays: L, prepWeeks: prepWeeks, phases: phases,
      // The weekdays (0=Sun…6=Sat) practices land on, so the Today screen only
      // surfaces a plan on real practice days instead of inventing one daily.
      practiceDays: (win.practiceDays && win.practiceDays.length) ? win.practiceDays.slice() : null
    };
    plan.seasonSkillByWeek = buildSeasonSkillByWeek(plan);   // weeks 1..prepWeeks
    return plan;
  }

  // ---- Camp: Welcome -> Build -> Showcase, indexed by camp DAY (1..N) --------
  function buildCampPlan(win) {
    var N = Math.max(1, win.lengthDays);                 // campDays
    var start = win.startDate;                           // campStart
    var ranges;

    if (N === 1) {
      ranges = [{ key: "blended", dayStart: 1, dayEnd: 1 }];          // one blended day
    } else if (N === 2) {
      ranges = [                                                       // intro + celebrate
        { key: "welcome",  dayStart: 1, dayEnd: 1 },
        { key: "showcase", dayStart: 2, dayEnd: 2 }
      ];
    } else if (N === 3) {
      ranges = [                                                       // one phase per day
        { key: "welcome",  dayStart: 1, dayEnd: 1 },
        { key: "build",    dayStart: 2, dayEnd: 2 },
        { key: "showcase", dayStart: 3, dayEnd: 3 }
      ];
    } else {
      // Welcome ~30%, Showcase ~25% (always includes the last day), Build the middle.
      var welcomeEnd = clampInt(N * 0.30, 1, N - 2);
      var showLen = Math.max(1, Math.round(N * 0.25));
      var showStart = clampInt(N - showLen + 1, welcomeEnd + 2, N);
      ranges = [
        { key: "welcome",  dayStart: 1, dayEnd: welcomeEnd },
        { key: "build",    dayStart: welcomeEnd + 1, dayEnd: showStart - 1 },
        { key: "showcase", dayStart: showStart, dayEnd: N }
      ];
    }

    var phases = ranges.map(function (r) {
      var spec = CAMP_SPEC[r.key];
      return {
        key: r.key, label: spec.label, color: phaseColor(r.key),
        dayStart: r.dayStart, dayEnd: r.dayEnd,
        startDate: addDays(start, r.dayStart - 1),
        endDate: addDays(start, r.dayEnd - 1),
        targetIntensity: spec.ti, difficultyMin: spec.dmin, difficultyMax: spec.dmax,
        volumeFactor: spec.vol, eases: spec.eases,
        focusSummary: spec.summary, why: spec.why
      };
    });

    var plan = {
      type: "camp", programType: "camp", label: win.label,
      startDate: start, endDate: addDays(start, N - 1),
      lengthDays: N, campDays: N, phases: phases
    };
    plan.campSkillByDay = buildCampSkillByDay(plan);     // day 1..N
    return plan;
  }

  // ---- Pre-computed skill schedules (no consecutive repeats) -----------------
  // Season: one skill per prep week, each prep phase starting its own curriculum.
  function buildSeasonSkillByWeek(plan) {
    var byWeek = [];                 // 1-based: byWeek[1..prepWeeks]
    var prev = null;
    var phaseIdx = {};               // running index within each phase's curriculum
    for (var w = 1; w <= plan.prepWeeks; w++) {
      var ph = prepPhaseForOffset(plan, (w - 1) * 7);    // phase owning this week
      var curr = SEASON_CURRICULA[ph.key] || SEASON_CURRICULA.foundation;
      var idx = phaseIdx[ph.key] || 0;
      var skill = curr[idx % curr.length];
      if (skill === prev && curr.length > 1) { idx++; skill = curr[idx % curr.length]; }
      byWeek[w] = skill;
      phaseIdx[ph.key] = idx + 1;
      prev = skill;
    }
    return byWeek;
  }
  // Camp: one skill per day; never repeat the previous day's skill.
  function buildCampSkillByDay(plan) {
    var byDay = [];                  // 1-based: byDay[1..campDays]
    var prev = null;
    plan.phases.forEach(function (ph) {
      var curr = CAMP_CURRICULA[ph.key] || CAMP_CURRICULA.welcome;
      var ci = 0;
      for (var d = ph.dayStart; d <= ph.dayEnd; d++) {
        var skill = curr[ci % curr.length];
        if (skill === prev && curr.length > 1) { ci++; skill = curr[ci % curr.length]; }
        byDay[d] = skill;
        prev = skill;
        ci++;
      }
    });
    return byDay;
  }

  // ======================================================================= //
  //  LOOKUPS (date -> phase / intensity / day-type / skill)                 //
  // ======================================================================= //

  function inseasonPhase(plan) {
    for (var i = 0; i < plan.phases.length; i++) {
      if (plan.phases[i].key === "inseason") return plan.phases[i];
    }
    return plan.phases[plan.phases.length - 1];
  }
  // The prep phase (Foundation..Taper) containing a day offset; clamps to range.
  function prepPhaseForOffset(plan, off) {
    off = clampInt(off, 0, plan.lengthDays - 1);
    for (var i = 0; i < plan.phases.length; i++) {
      var ph = plan.phases[i];
      if (ph.key === "inseason") continue;
      if (off >= ph.startOffset && off < ph.endOffset) return ph;
    }
    return plan.phases[0];
  }

  // The camp day number (1..campDays) a date falls on (clamped).
  function campDayFor(plan, date) {
    return clampInt(daysBetween(plan.startDate, toISO(date)) + 1, 1, plan.lengthDays);
  }

  // ---- Practice-day scheduling (season only) --------------------------------
  // The weekday (0=Sun…6=Sat) of an ISO date.
  function weekdayOf(iso) {
    var d = parseISO(iso);
    return d ? d.getDay() : 0;
  }
  // Does this date fall on one of the team's chosen practice weekdays? Camps run
  // every day, and a season with no chosen days (older saved teams) treats every
  // day as a practice day — so the app keeps working in both cases.
  function isPracticeDay(plan, date) {
    if (!plan || plan.type === "camp") return true;
    var days = plan.practiceDays;
    if (!days || !days.length) return true;
    return days.indexOf(weekdayOf(toISO(date || new Date()))) !== -1;
  }
  // The next practice date strictly after `iso` in direction dir (+1 fwd / -1 back).
  // Scans up to two weeks; falls back to a single step if nothing qualifies.
  function adjacentPracticeDate(plan, iso, dir) {
    iso = toISO(iso);
    dir = dir < 0 ? -1 : 1;
    if (!plan || plan.type === "camp") return addDays(iso, dir);
    var days = plan.practiceDays;
    if (!days || !days.length) return addDays(iso, dir);
    var cur = iso;
    for (var i = 0; i < 14; i++) {
      cur = addDays(cur, dir);
      if (isPracticeDay(plan, cur)) return cur;
    }
    return addDays(iso, dir);
  }
  // The first practice date on or after `iso` (used to land the cursor on a real
  // practice when the coach opens Today on an off day). Scans up to two weeks.
  function practiceDayOnOrAfter(plan, iso) {
    iso = toISO(iso);
    if (!plan || plan.type === "camp") return iso;
    var days = plan.practiceDays;
    if (!days || !days.length) return iso;
    var cur = iso;
    for (var i = 0; i < 14; i++) {
      if (isPracticeDay(plan, cur)) return cur;
      cur = addDays(cur, 1);
    }
    return iso;
  }

  // phaseForDate(plan, date) -> the phase that contains the date.
  function phaseForDate(plan, date) {
    if (!plan) return null;
    var iso = toISO(date || new Date());
    if (plan.type === "camp") {
      var d = campDayFor(plan, iso);
      for (var i = 0; i < plan.phases.length; i++) {
        var p = plan.phases[i];
        if (d >= p.dayStart && d <= p.dayEnd) return p;
      }
      return plan.phases[plan.phases.length - 1];
    }
    if (iso >= plan.seasonStart) return inseasonPhase(plan);      // after the opener
    return prepPhaseForOffset(plan, daysBetween(plan.startDate, iso));
  }

  // A stable 0-based session ordinal for a date, used for undulation + day type.
  function ordinalForDate(plan, iso) {
    if (plan.type === "camp") return clampInt(daysBetween(plan.startDate, iso), 0, plan.lengthDays - 1);
    return Math.max(0, daysBetween(plan.startDate, iso));
  }

  // dayType(plan, team, date) -> rotates Technical / Competitive / Mixed so back-
  // to-back sessions feel different. (team is accepted for API symmetry.)
  var DAY_TYPES = ["Technical", "Competitive", "Mixed"];
  function dayType(plan, team, date) {
    if (!plan) return "Mixed";
    var ord = ordinalForDate(plan, toISO(date || new Date()));
    return DAY_TYPES[((ord % 3) + 3) % 3];
  }

  // intensityForDate(plan, date) -> 1..10. Phase target, nudged by day type so
  // consecutive sessions undulate. Easing phases (taper/showcase) never spike
  // above their target, so the curve clearly dips at the end.
  function intensityForDate(plan, date) {
    if (!plan) return 5;
    var iso = toISO(date || new Date());
    var ph = phaseForDate(plan, iso);
    if (!ph) return 5;
    var t = dayType(plan, null, iso);
    var nudge = t === "Competitive" ? 1 : (t === "Technical" ? -1 : 0);
    var val = ph.targetIntensity + nudge;
    if (ph.eases) val = Math.min(val, ph.targetIntensity);
    return clampInt(val, 1, 10);
  }

  // skillFocus(plan, team, date) -> the primary skill to feature.
  // Season: constant within a calendar week ("skill of the week").
  // Camp:   constant within a camp day ("skill of the day").
  function skillFocus(plan, team, date) {
    if (!plan) return "Ball Control";
    var iso = toISO(date || new Date());

    if (plan.type === "camp") {
      return plan.campSkillByDay[campDayFor(plan, iso)] || CAMP_CURRICULA.welcome[0];
    }

    if (iso >= plan.seasonStart) {
      var arr = SEASON_CURRICULA.inseason;
      var wk = Math.max(0, Math.floor(daysBetween(plan.seasonStart, iso) / 7));
      // Don't repeat the final taper week's focus on the very first in-season week.
      if (wk === 0 && plan.seasonSkillByWeek[plan.prepWeeks] === arr[0]) return arr[1 % arr.length];
      return arr[wk % arr.length];
    }

    var week = clampInt(Math.floor(daysBetween(plan.startDate, iso) / 7) + 1, 1, plan.prepWeeks);
    return plan.seasonSkillByWeek[week] || SEASON_CURRICULA.foundation[0];
  }

  // ---- Public API (pure) ----------------------------------------------------
  return {
    computePlan: computePlan,
    phaseForDate: phaseForDate,
    intensityForDate: intensityForDate,
    dayType: dayType,
    skillFocus: skillFocus,
    skillOfWeek: skillFocus,        // back-compat alias (also "skill of the day" for camps)
    focusToSkill: focusToSkill,
    phaseColor: phaseColor,
    campDayFor: campDayFor,
    isPracticeDay: isPracticeDay,
    adjacentPracticeDate: adjacentPracticeDate,
    practiceDayOnOrAfter: practiceDayOnOrAfter,
    // small date utilities reused by the screen (kept pure)
    toISO: toISO, addDays: addDays, daysBetween: daysBetween,
    // exposed for inspection / testing
    SEASON_CURRICULA: SEASON_CURRICULA,
    CAMP_CURRICULA: CAMP_CURRICULA
  };
})();
