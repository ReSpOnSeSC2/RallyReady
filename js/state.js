// state.js — persistence layer.
// Loads/saves the app state to localStorage and notifies subscribers on change.
// Loads first, so it creates the single global namespace object `RR` that every
// other module attaches to.
window.RR = window.RR || {};

RR.state = (function () {
  "use strict";

  var STORAGE_KEY = "rallyready.v1";

  // DEFAULTS — the starting app state. The team is NOT set up yet (team: null),
  // so the rest of the app can show a "set up your team" experience on first run.
  var DEFAULTS = {
    schemaVersion: 1,
    theme: "system",        // UI theme preference: 'system' | 'light' | 'dark'
    team: null,             // set up on the Team screen (see js/team.js):
                            // { name, ageGroup, programType:'season'|'camp',
                            //   season: practiceStart, seasonStart, practicesPerWeek,
                            //   camp:   campStart, campDays(1-30), sessionsPerDay,
                            //   shared: sessionMinutes, emphasis[] }
    season: null,           // season plan (length, phases) created later
    savedSessions: [],      // completed practices (History) — also feeds the
                            // generator's recent-repeat avoidance
    regen: {},              // per-(team|date|slot) "Regenerate" counters, so a
                            // regenerated practice stays put across reloads
    installDismissed: false,// user dismissed the "Install RallyReady" banner
                            // (see js/install.js) — kept hidden once dismissed
    settings: {
      practiceMinutes: 75   // sensible default practice length
    }
  };

  var listeners = [];
  var current = load();

  // Clone via JSON so callers can't mutate internal state through a returned reference.
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Load from localStorage, falling back to DEFAULTS if missing or corrupt.
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(DEFAULTS);
      var parsed = JSON.parse(raw);
      // Merge onto a fresh copy of DEFAULTS so any newly added keys always exist.
      return Object.assign(clone(DEFAULTS), parsed);
    } catch (e) {
      // Corrupt JSON or storage blocked — start clean instead of crashing.
      return clone(DEFAULTS);
    }
  }

  // Persist current state. Failures (private mode / quota) are non-fatal.
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      /* keep running with in-memory state */
    }
  }

  // Tell every subscriber about the latest state.
  function notify() {
    var snapshot = getState();
    for (var i = 0; i < listeners.length; i++) {
      // One listener throwing shouldn't stop the others.
      try { listeners[i](snapshot); } catch (e) { /* ignore */ }
    }
  }

  // Public: a safe copy of the current state.
  function getState() {
    return clone(current);
  }

  // Public: shallow-merge `patch` into state at the top level, persist, notify.
  // Returns the new state.
  function update(patch) {
    current = Object.assign({}, current, patch || {});
    save();
    notify();
    return getState();
  }

  // Public: subscribe to changes. Returns an unsubscribe function.
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
    subscribe: subscribe
  };
})();
