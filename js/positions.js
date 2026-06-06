// positions.js — position coaching API (RR.positions).
//
// The single source of truth for the position NAMES the app uses (consumed by the
// roster/players selects and the Drills "Position" filter), plus the logic that
// turns the static guides in positions-data.js into useful, live coaching:
//   • focusSkills(pos)          — which library skill categories the role lives in
//   • recommendedDrills(pos,t)  — real RR.drills for the role, tuned to age band
//   • ageEmphasis(team)         — how much to specialise at the team's age (youth
//                                 philosophy: broad at 8–12, specialise at 15+)
//   • rotationSpec(pos)         — a court-diagram spec (for RR.diagram.figure)
// No DOM here — pure data + helpers, so it loads early alongside the drill data.
window.RR = window.RR || {};

RR.positions = (function () {
  "use strict";

  var GUIDES = RR.POSITION_GUIDES || {};
  // The coachable positions, in display order.
  var LIST = (RR.POSITION_ORDER || []).slice();
  // The full set offered in a player <select>: a leading blank ("no position
  // yet") + the coachable roles + an "exploring" option for young players.
  var SELECT_OPTIONS = [""].concat(LIST).concat(["Not sure yet"]);

  function isCoachable(pos) { return !!(pos && GUIDES[pos]); }
  function get(pos) { return GUIDES[pos] || null; }
  function abbr(pos) { return (GUIDES[pos] && GUIDES[pos].abbr) || ""; }
  function focusSkills(pos) {
    return (GUIDES[pos] && GUIDES[pos].focusSkills) ? GUIDES[pos].focusSkills.slice() : [];
  }

  // A drill is in the team's age band when its [ageMin,ageMax] overlaps it.
  // Mirrors the rule the Drills browser uses (js/drills-ui.js).
  function inBand(drill, band) {
    return !band || (drill.ageMin <= band.max && drill.ageMax >= band.min);
  }

  // Real drills for a position: those whose skill is one of the role's focus
  // skills, intersected with the team's age band, staples first then easiest, so
  // a coach sees the most useful, age-appropriate options. `opts.limit` caps the
  // list (default 8); `opts.ignoreAge` shows the whole library for the role.
  function recommendedDrills(pos, team, opts) {
    opts = opts || {};
    var skills = focusSkills(pos);
    if (!skills.length || !Array.isArray(RR.drills)) return [];
    var band = (team && !opts.ignoreAge && RR.team && RR.team.ageRange)
      ? RR.team.ageRange(team.ageGroup) : null;

    var matches = RR.drills.filter(function (d) {
      return skills.indexOf(d.skill) !== -1 && inBand(d, band);
    });
    // Order: ranked by the role's own skill priority, then staples, then easier
    // first, then name — a stable, sensible teaching order.
    matches.sort(function (a, b) {
      var sa = skills.indexOf(a.skill), sb = skills.indexOf(b.skill);
      if (sa !== sb) return sa - sb;
      if (!!b.isStaple !== !!a.isStaple) return (b.isStaple ? 1 : 0) - (a.isStaple ? 1 : 0);
      if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
      return String(a.name).localeCompare(String(b.name));
    });
    var limit = opts.limit || 8;
    return matches.slice(0, limit);
  }

  // Age-appropriate specialisation guidance. Youth-development reality: at 8–12
  // everyone should rotate through every position; specialisation is real by
  // 15+. Keyed off the team's age band (RR.team.ageRange) so it's always honest.
  function ageEmphasis(team) {
    var min = 13;   // default to the "starting to specialise" message
    if (team && RR.team && RR.team.ageRange) {
      var band = RR.team.ageRange(team.ageGroup);
      if (band && typeof band.min === "number") min = band.min;
    } else {
      return {
        stage: "Position coaching",
        text: "Set up your team to tune this to their age. As a rule of thumb: young players should try every position, while older players can specialise."
      };
    }
    if (min <= 12) {
      return {
        stage: "Keep it broad at this age",
        text: "At this age, rotate every player through every position and chase touches over titles. Use these guides to teach the IDEAS of each role — don't lock a young player into one spot yet."
      };
    }
    if (min <= 14) {
      return {
        stage: "Start introducing positions",
        text: "Players can start to specialise now. Give each player a primary position and a secondary one, but keep developing all-round skills so nobody is one-dimensional."
      };
    }
    return {
      stage: "Specialise and refine",
      text: "These are old enough to own a position. Use these guides to sharpen role-specific skills, systems, and decisions — while keeping serve and pass sharp for everyone."
    };
  }

  // ---- Rotation / overlap court diagram -------------------------------------
  // A schematic half-court showing the six rotational zones, with the position's
  // usual starting zone(s) highlighted. Fed to RR.diagram.figure (js/diagram.js).
  // Zone layout (net at the top):  front  4  3  2   /   back  5  6  1
  var ZONE_XY = {
    4: [1.9, 3], 3: [4.5, 3], 2: [7.1, 3],
    5: [1.9, 7], 6: [4.5, 7], 1: [7.1, 7]
  };
  function rotationSpec(pos) {
    var g = get(pos);
    var starts = (g && g.startZones) || [];
    var players = Object.keys(ZONE_XY).map(function (zoneStr) {
      var zone = +zoneStr;
      var xy = ZONE_XY[zone];
      var here = starts.indexOf(zone) !== -1;
      return {
        x: xy[0], y: xy[1],
        team: here ? "a" : "n",
        label: String(zone),
        note: here ? (g ? g.abbr : "start") : ""
      };
    });
    return {
      w: 9, h: 9,
      net: 1.2,
      lines: [{ y: 4.2 }],     // the attack (3 m) line
      players: players,
      legend: [
        { tone: "a", text: "Usual start" },
        { tone: "n", text: "Court zone (rotation order 1→6)" }
      ],
      caption: "Numbers are the six rotation zones; players rotate clockwise 1→6. The net is at the top."
    };
  }

  return {
    LIST: LIST,
    SELECT_OPTIONS: SELECT_OPTIONS,
    GUIDES: GUIDES,
    isCoachable: isCoachable,
    get: get,
    abbr: abbr,
    focusSkills: focusSkills,
    recommendedDrills: recommendedDrills,
    ageEmphasis: ageEmphasis,
    rotationSpec: rotationSpec
  };
})();
