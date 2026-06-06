// roster.js — roster DATA + attendance helpers (RR.roster).
//
// The squad SCREEN moved to the Players tab (js/players-ui.js) and the 1-on-1
// view (js/player-profile.js); this module is now the shared roster data layer
// they (and the Today completion flow) build on:
//   • player CRUD on the active team's `team.roster[]`
//   • a reusable position <select> (options from RR.positions, the single source)
//   • the attendance field/summary the Today "mark complete" flow uses
//   • per-player attendance history derived from saved practices (for the profile)
//
// A player is { id, name, number, position, ...optional profile fields }. We
// always read the freshest team, clone before mutating, keep `team.rosterSize` in
// step with the squad, and write the WHOLE team back via RR.state.update({ team }).
window.RR = window.RR || {};

RR.roster = (function () {
  "use strict";

  var h = RR.ui.h;

  // Options for the position <select>: the single source of truth is RR.positions
  // (so roster, players, profile and the Drills filter never drift apart). Fall
  // back to a literal list only if positions.js somehow didn't load.
  function positionOptions() {
    return (RR.positions && RR.positions.SELECT_OPTIONS) || [
      "", "Setter", "Outside hitter", "Opposite",
      "Middle blocker", "Libero", "Defensive specialist", "Not sure yet"
    ];
  }

  // --------------------------------------------------------------- data I/O --
  // Freshest active team (or null). Never cache — other screens may have written.
  function activeTeam() {
    return (RR.state && RR.state.getState().team) || null;
  }

  // A safe, mutable deep copy of the active team with a guaranteed roster array.
  function cloneTeam() {
    var team = activeTeam();
    if (!team) return null;
    var copy = JSON.parse(JSON.stringify(team));
    if (!Array.isArray(copy.roster)) copy.roster = [];
    return copy;
  }

  // Persist a (mutated) team clone, keeping rosterSize in step with the squad so
  // drill selection always matches the real number of players on the floor.
  function persistTeam(team) {
    if (team.roster.length) team.rosterSize = team.roster.length;
    RR.state.update({ team: team });
  }

  // The active team's players, sorted by jersey number (numeric) then name.
  function sortedRoster(team) {
    var list = (team && Array.isArray(team.roster)) ? team.roster.slice() : [];
    list.sort(function (a, b) {
      var na = numericNumber(a.number), nb = numericNumber(b.number);
      if (na !== nb) return na - nb;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
    return list;
  }

  // Players with a number sort ahead of those without (which go to the bottom).
  function numericNumber(num) {
    var n = parseInt(num, 10);
    return isNaN(n) ? Infinity : n;
  }

  // Keep only digits, capped at three characters (jersey numbers are 0–999).
  function cleanNumber(raw) {
    return String(raw == null ? "" : raw).replace(/[^0-9]/g, "").slice(0, 3);
  }

  // ----------------------------------------------------------- public reads --
  // A clone of the active team's players ([] when there's no team / no roster).
  function getRoster() {
    var team = activeTeam();
    if (!team || !Array.isArray(team.roster)) return [];
    return JSON.parse(JSON.stringify(team.roster));
  }
  // The roster sorted the canonical way (number then name) — used by the screens.
  function getSortedRoster() { return sortedRoster(activeTeam()); }

  function getPlayer(id) {
    var list = getRoster();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  // ---------------------------------------------------------- player CRUD ----
  // Add a player from a fields object ({name, number, position, ...}). Returns the
  // new id, or null when there's no team or no name.
  function addPlayer(fields) {
    var name = (fields && fields.name || "").trim();
    if (!name) return null;
    var team = cloneTeam();
    if (!team) return null;
    var player = Object.assign({}, fields, {
      id: RR.state.genId("player"),
      name: name,
      number: cleanNumber(fields.number),
      position: fields.position || ""
    });
    team.roster.push(player);
    persistTeam(team);
    return player.id;
  }

  // Merge `patch` into one player and persist. Returns the updated player or null.
  function updatePlayer(id, patch) {
    var team = cloneTeam();
    if (!team) return null;
    var updated = null;
    team.roster = team.roster.map(function (p) {
      if (p.id !== id) return p;
      updated = Object.assign({}, p, patch, { id: id });
      if (patch && Object.prototype.hasOwnProperty.call(patch, "number")) {
        updated.number = cleanNumber(patch.number);
      }
      return updated;
    });
    if (!updated) return null;
    persistTeam(team);
    return updated;
  }

  // Remove a player and their stored photo (kept in the separate RR.photos store).
  function removePlayer(id) {
    var team = cloneTeam();
    if (!team) return;
    team.roster = team.roster.filter(function (p) { return p.id !== id; });
    persistTeam(team);
    if (RR.photos && RR.photos.remove) RR.photos.remove(id);
  }

  // A labelled position <select>, reused by the Players add form and the profile.
  function positionSelect(value, ariaLabel) {
    var sel = h("select", { class: "input", "aria-label": ariaLabel || "Position (optional)" });
    positionOptions().forEach(function (p) {
      sel.appendChild(h("option", {
        value: p,
        text: p === "" ? "Position (optional)" : p,
        selected: p === (value || "")
      }));
    });
    return sel;
  }

  // =================================================================== //
  //  ATTENDANCE HELPERS — consumed by the Today "mark complete" flow.   //
  // =================================================================== //

  // attendanceField(existing) -> { node, getValue }
  //   node      — present/absent toggle chips, one per player (default present
  //               unless `existing`, an array of present ids, says otherwise).
  //   getValue() — returns an array of PRESENT player ids (null on empty roster).
  function attendanceField(existing) {
    var players = sortedRoster(activeTeam());

    if (!players.length) {
      return {
        node: h("p", { class: "muted roster-att__hint",
          text: "Add players on the Players tab to take attendance." }),
        getValue: function () { return null; }
      };
    }

    var hasExisting = Array.isArray(existing);
    var present = {};
    players.forEach(function (p) {
      present[p.id] = hasExisting ? (existing.indexOf(p.id) !== -1) : true;
    });

    var wrap = h("div", { class: "chips roster-att" });
    players.forEach(function (player) {
      var chip = h("button", {
        type: "button",
        class: "chip roster-att__chip" + (present[player.id] ? " is-on" : ""),
        "aria-pressed": present[player.id] ? "true" : "false",
        "aria-label": player.name + (present[player.id] ? ": present" : ": absent")
      }, [
        player.number ? h("span", { class: "roster-att__num", "aria-hidden": "true", text: player.number }) : null,
        h("span", { text: player.name })
      ]);
      chip.addEventListener("click", function () {
        present[player.id] = !present[player.id];
        chip.classList.toggle("is-on", present[player.id]);
        chip.setAttribute("aria-pressed", present[player.id] ? "true" : "false");
        chip.setAttribute("aria-label", player.name + (present[player.id] ? ": present" : ": absent"));
      });
      wrap.appendChild(chip);
    });

    return {
      node: wrap,
      getValue: function () {
        return players.filter(function (p) { return present[p.id]; })
          .map(function (p) { return p.id; });
      }
    };
  }

  // summarizeAttendance(presentIds) -> "9 of 12 present" (or "" when there's
  // nothing meaningful to say). Counts present ids that still exist on the roster.
  function summarizeAttendance(presentIds) {
    var players = sortedRoster(activeTeam());
    if (!players.length || !Array.isArray(presentIds) || !presentIds.length) return "";
    var ids = {};
    players.forEach(function (p) { ids[p.id] = true; });
    var count = presentIds.filter(function (id) { return ids[id]; }).length;
    if (!count) return "";
    return count + " of " + players.length + " present";
  }

  // Per-player attendance history from completed practices (for the 1-on-1
  // profile). Only sessions for the ACTIVE team that actually recorded attendance
  // count, so "present at X of Y" is honest. Returns { present, total, rate, recent }.
  function attendanceHistory(playerId) {
    var st = RR.state.getState();
    var activeId = RR.state.getActiveTeamId();
    var teamName = st.team && st.team.name;
    var sessions = (st.savedSessions || []).filter(function (s) {
      var mine = (s.teamId != null) ? (s.teamId === activeId) : (s.teamName === teamName);
      return mine && Array.isArray(s.attendance);
    });
    sessions.sort(function (a, b) { return (b.completedAt || 0) - (a.completedAt || 0); });
    var present = 0;
    var recent = sessions.slice(0, 6).map(function (s) {
      var here = s.attendance.indexOf(playerId) !== -1;
      return { date: s.date, present: here };
    });
    sessions.forEach(function (s) { if (s.attendance.indexOf(playerId) !== -1) present++; });
    var total = sessions.length;
    return { present: present, total: total, rate: total ? present / total : 0, recent: recent };
  }

  // Legacy route safety: anything still asking RR.roster to render delegates to
  // the Players screen (the #roster hash also redirects there in app.js).
  function render(host) {
    if (RR.players && RR.players.render) { RR.players.render(host); return; }
    host.appendChild(h("p", { class: "muted", text: "Open the Players tab." }));
  }

  return {
    // data
    getRoster: getRoster,
    getSortedRoster: getSortedRoster,
    getPlayer: getPlayer,
    addPlayer: addPlayer,
    updatePlayer: updatePlayer,
    removePlayer: removePlayer,
    cleanNumber: cleanNumber,
    positionSelect: positionSelect,
    // attendance
    attendanceField: attendanceField,
    summarizeAttendance: summarizeAttendance,
    attendanceHistory: attendanceHistory,
    // legacy alias
    render: render,
    renderRoster: render
  };
})();
