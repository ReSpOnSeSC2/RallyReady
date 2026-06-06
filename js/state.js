// state.js — persistence layer.
// Loads/saves the app state to localStorage and notifies subscribers on change.
// Loads first, so it creates the single global namespace object `RR` that every
// other module attaches to.
//
// DATA MODEL (schema v2):
//   • teams[]        — every team the coach runs; each carries a stable `id`.
//   • activeTeamId   — which team the rest of the app is currently planning for.
//   • team           — a DERIVED mirror of the active team, kept so the large body
//                      of existing code that reads `getState().team` keeps working.
//   • savedSessions  — completed practices (History) + the recent-repeat lookup.
//   • customDrills[] — coach-authored drills, merged into RR.drills at boot.
//   • favorites[]    — starred drill ids (coach-wide, not per team).
//
// Older saves (schema v1, a single `team`) are migrated forward on load, so no
// coach ever loses a season to the upgrade.
window.RR = window.RR || {};

RR.state = (function () {
  "use strict";

  var STORAGE_KEY = "rallyready.v1";
  var SCHEMA = 2;
  // Cap History so a long season can never blow the ~5MB localStorage quota.
  var MAX_SAVED = 400;

  // DEFAULTS — the starting app state. No team exists yet (teams empty), so the
  // rest of the app can show a "set up your team" experience on first run.
  var DEFAULTS = {
    schemaVersion: SCHEMA,
    theme: "system",        // UI theme preference: 'system' | 'light' | 'dark'
    teams: [],              // every team the coach runs (see js/team.js)
    activeTeamId: null,     // the team the app is currently planning for
    team: null,             // DERIVED mirror of the active team (back-compat)
    savedSessions: [],      // completed practices (History) — also feeds the
                            // generator's recent-repeat avoidance + attendance/notes
    regen: {},              // per-(team|date|slot) "Regenerate" counters
    plannedSessions: {},    // per-(team|date|slot) hand-edited plan snapshots (Today)
    focusOverrides: {},     // per-(team|date|slot) coach-chosen skill focus
    customDrills: [],       // coach-authored drills, merged into RR.drills at boot
    favorites: [],          // starred drill ids
    installDismissed: false,// user dismissed the "Install RallyReady" banner
    settings: {
      practiceMinutes: 75   // sensible default practice length
    }
  };

  var listeners = [];
  var current = load();

  // Clone via JSON so callers can't mutate internal state through a returned reference.
  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  // Short, collision-resistant id for teams and custom drills.
  function genId(prefix) {
    return (prefix || "id") + "-" +
      Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  // Keep the `team` mirror pointing at the active team in `teams`.
  function syncMirror(state) {
    var list = state.teams || [];
    var active = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === state.activeTeamId) { active = list[i]; break; }
    }
    // Fall back to the first team if the active id dangles (e.g. after a delete).
    if (!active && list.length) { active = list[0]; state.activeTeamId = active.id; }
    state.team = active ? clone(active) : null;
    return state;
  }

  // Migrate any older shape forward onto a fresh DEFAULTS copy.
  function migrate(parsed) {
    var state = Object.assign(clone(DEFAULTS), parsed || {});
    // v1 -> v2: a single `team` object becomes the first entry in `teams`.
    if (!Array.isArray(state.teams)) state.teams = [];
    if (!state.teams.length && parsed && parsed.team) {
      var t = clone(parsed.team);
      if (!t.id) t.id = genId("team");
      state.teams = [t];
      state.activeTeamId = t.id;
    }
    if (!Array.isArray(state.customDrills)) state.customDrills = [];
    if (!Array.isArray(state.favorites)) state.favorites = [];
    // Ensure every team has an id (defensive against partial older saves).
    state.teams.forEach(function (t) { if (t && !t.id) t.id = genId("team"); });
    if (!state.activeTeamId && state.teams.length) state.activeTeamId = state.teams[0].id;
    state.schemaVersion = SCHEMA;
    return syncMirror(state);
  }

  // Load from localStorage, falling back to DEFAULTS if missing or corrupt.
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(DEFAULTS);
      return migrate(JSON.parse(raw));
    } catch (e) {
      return clone(DEFAULTS);   // corrupt JSON / storage blocked — start clean
    }
  }

  // Trim History to the most recent MAX_SAVED before persisting.
  function capHistory(state) {
    var s = state.savedSessions;
    if (Array.isArray(s) && s.length > MAX_SAVED) {
      s.sort(function (a, b) { return (b.completedAt || 0) - (a.completedAt || 0); });
      state.savedSessions = s.slice(0, MAX_SAVED);
    }
  }

  // Persist current state. Failures (private mode / quota) are non-fatal.
  function save() {
    try {
      capHistory(current);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) { /* keep running with in-memory state */ }
  }

  function notify() {
    var snapshot = getState();
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](snapshot); } catch (e) { /* one listener can't break the rest */ }
    }
  }

  function getState() { return clone(current); }

  // Shallow-merge `patch` into state at the top level, persist, notify.
  // Writing `team` is special-cased: it upserts into `teams` and marks that team
  // active, so the existing one-team write path drives the multi-team model too.
  function update(patch) {
    patch = patch || {};
    if (Object.prototype.hasOwnProperty.call(patch, "team")) {
      var t = patch.team;
      patch = Object.assign({}, patch);
      delete patch.team;
      current = Object.assign({}, current, patch);
      if (t) {
        t = clone(t);
        if (!t.id) t.id = genId("team");
        var list = (current.teams || []).slice();
        var idx = -1;
        for (var i = 0; i < list.length; i++) { if (list[i].id === t.id) { idx = i; break; } }
        if (idx === -1) list.push(t); else list[idx] = t;
        current.teams = list;
        current.activeTeamId = t.id;
      } else {
        current.team = null;   // explicit clear (no active team)
      }
    } else {
      current = Object.assign({}, current, patch);
    }
    syncMirror(current);
    save();
    notify();
    return getState();
  }

  // ---- Multi-team helpers ---------------------------------------------------
  function getTeams() { return clone(current.teams || []); }
  function getActiveTeamId() { return current.activeTeamId; }

  function setActiveTeam(id) {
    var exists = (current.teams || []).some(function (t) { return t.id === id; });
    if (!exists) return getState();
    current.activeTeamId = id;
    syncMirror(current); save(); notify();
    return getState();
  }

  // Create a fresh team from `teamObj`, make it active, return its id.
  function addTeam(teamObj) {
    var t = clone(teamObj || {});
    t.id = genId("team");
    current.teams = (current.teams || []).concat([t]);
    current.activeTeamId = t.id;
    syncMirror(current); save(); notify();
    return t.id;
  }

  // Remove a team and its History/regen; the active team falls back to the first.
  function removeTeam(id) {
    var gone = null;
    current.teams = (current.teams || []).filter(function (t) {
      if (t.id === id) { gone = t; return false; }
      return true;
    });
    if (gone) {
      current.savedSessions = (current.savedSessions || []).filter(function (s) {
        return s.teamId !== id && (s.teamId != null || s.teamName !== gone.name);
      });
    }
    if (current.activeTeamId === id) current.activeTeamId = (current.teams[0] || {}).id || null;
    syncMirror(current); save(); notify();
    return getState();
  }

  // ---- Custom drills + favorites -------------------------------------------
  function addCustomDrill(drill) {
    var d = clone(drill || {});
    d.id = d.id || genId("drill");
    d.custom = true;
    current.customDrills = (current.customDrills || []).concat([d]);
    syncCustomDrills(); save(); notify();
    return d.id;
  }
  function updateCustomDrill(id, patch) {
    current.customDrills = (current.customDrills || []).map(function (d) {
      return d.id === id ? Object.assign({}, d, patch, { id: id, custom: true }) : d;
    });
    syncCustomDrills(); save(); notify();
    return getState();
  }
  function removeCustomDrill(id) {
    current.customDrills = (current.customDrills || []).filter(function (d) { return d.id !== id; });
    current.favorites = (current.favorites || []).filter(function (f) { return f !== id; });
    syncCustomDrills(); save(); notify();
    return getState();
  }

  // Merge coach-authored drills into the live RR.drills library. Idempotent: it
  // strips any previously-merged custom drills first, then appends the current
  // set, so repeated calls (and edits/removals) stay consistent. Called at boot
  // after the drill files load, and after any custom-drill mutation.
  function syncCustomDrills() {
    if (!Array.isArray(RR.drills)) return;
    RR.drills = RR.drills.filter(function (d) { return !d.custom; });
    (current.customDrills || []).forEach(function (d) { RR.drills.push(clone(d)); });
  }

  function isFavorite(id) { return (current.favorites || []).indexOf(id) !== -1; }
  function toggleFavorite(id) {
    var favs = (current.favorites || []).slice();
    var i = favs.indexOf(id);
    if (i === -1) favs.push(id); else favs.splice(i, 1);
    current.favorites = favs;
    save(); notify();
    return i === -1;   // true when it is now a favorite
  }

  // ---- Backup / restore (no backend — a plain JSON file) --------------------
  function exportData() {
    return JSON.stringify({
      app: "RallyReady", schemaVersion: SCHEMA, exportedAt: new Date().toISOString(),
      data: current
    }, null, 2);
  }
  // Returns { ok:true } or { ok:false, error }. Replaces all local data on success.
  function importData(json) {
    try {
      var parsed = (typeof json === "string") ? JSON.parse(json) : json;
      var data = parsed && parsed.data ? parsed.data : parsed;
      if (!data || typeof data !== "object") return { ok: false, error: "Not a RallyReady backup file." };
      current = migrate(data);
      syncCustomDrills(); save(); notify();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "That file isn't valid JSON." };
    }
  }

  function subscribe(fn) {
    if (typeof fn !== "function") return function () {};
    listeners.push(fn);
    return function unsubscribe() {
      var idx = listeners.indexOf(fn);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULTS: DEFAULTS,
    getState: getState,
    update: update,
    subscribe: subscribe,
    genId: genId,
    // multi-team
    getTeams: getTeams,
    getActiveTeamId: getActiveTeamId,
    setActiveTeam: setActiveTeam,
    addTeam: addTeam,
    removeTeam: removeTeam,
    // custom drills + favorites
    addCustomDrill: addCustomDrill,
    updateCustomDrill: updateCustomDrill,
    removeCustomDrill: removeCustomDrill,
    syncCustomDrills: syncCustomDrills,
    isFavorite: isFavorite,
    toggleFavorite: toggleFavorite,
    // backup
    exportData: exportData,
    importData: importData
  };
})();
