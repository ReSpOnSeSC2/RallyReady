// app.js — application boot: hash router, bottom tab-bar wiring, theme control,
// and service worker registration. Each route renders its own screen module
// (Today, Season/Camp, Drills, Tips, Team, History) into #screen.
window.RR = window.RR || {};

RR.app = (function () {
  "use strict";

  var SCREENS = {
    ideas:   { title: "Ideas",   blurb: "Fresh practice ideas, drills, challenges and coaching tips — tuned to your team." },
    today:   { title: "Today",   blurb: "Your next practice plan will appear here, ready to run." },
    season:  { title: "Season",  blurb: "Map out your season and see the intensity curve week by week." },
    drills:  { title: "Drills",  blurb: "Browse the drill library and find the right activity for any skill." },
    players: { title: "Players", blurb: "Your squad — photos, positions and 1-on-1 coaching." },
    tips:    { title: "Tips",    blurb: "Quick coaching tips and what to expect at each age group." },
    team:    { title: "Teams",   blurb: "Create, switch and set up the teams you coach." },
    // These aren't tabs — they're reached from in-screen links — but each is a real
    // route so it gets a title, a focus target, and back/forward support.
    history:   { title: "History",  blurb: "Your completed practices." },
    calendar:  { title: "Schedule", blurb: "The next few weeks of practices and games at a glance." },
    player:    { title: "Player",   blurb: "1-on-1 coaching: notes, goals, skills and attendance." },
    positions: { title: "Position coaching", blurb: "How to coach every position, with drills." },
    lineup:    { title: "Lineup",   blurb: "Place your starting six into the rotation." }
  };

  // Hashes that no longer have a screen of their own redirect to their replacement
  // (the Roster screen became the Players tab).
  var REDIRECTS = { roster: "players" };

  var DEFAULT_ROUTE = "ideas";

  // Copy for the "set up your team first" empty state on the data-driven screens.
  var EMPTY_COPY = {
    today: {
      title: "Set up your team first",
      blurb: "Once your team is set up, your next practice plan appears here — tailored to their age group and where they are in the season."
    },
    season: {
      title: "Set up your team first",
      blurb: "Add your season dates and RallyReady maps out the whole season for you, week by week."
    },
    history: {
      title: "Set up your team first",
      blurb: "Mark a practice complete and it appears here — a log of everything you've run."
    }
  };

  // ---- Theme ----------------------------------------------------------------
  // Preference (stored in state) is 'system' | 'light' | 'dark'. The effective
  // theme is reflected on <html data-theme> so CSS can swap tokens, and the
  // browser chrome color (meta theme-color) is kept in sync.
  var THEME_COLOR = { light: "#FF6B35", dark: "#141E33" };

  function prefersDark() {
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  function effectiveDark(pref) {
    if (pref === "dark") return true;
    if (pref === "light") return false;
    return prefersDark();   // 'system' follows the OS
  }

  function applyTheme() {
    var pref = RR.state.getState().theme || "system";
    var dark = effectiveDark(pref);
    var mode = dark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", mode);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLOR[mode]);
    var btn = document.getElementById("themeToggle");
    if (btn) {
      btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
      btn.setAttribute("aria-pressed", String(dark));
    }
  }

  // The toggle flips to an explicit light/dark choice and persists it.
  function toggleTheme() {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    RR.state.update({ theme: dark ? "light" : "dark" });
    applyTheme();
  }

  // ---- Router ---------------------------------------------------------------
  function currentRoute() {
    var id = (location.hash || "").replace(/^#/, "");
    return SCREENS[id] ? id : DEFAULT_ROUTE;
  }

  // Safety fallback, shown only if a screen module failed to load (e.g. a script
  // was blocked). Every real route below has its own handler; this just keeps the
  // app from ever showing a blank screen, with an honest recovery message.
  function fallbackCard(data) {
    var card = document.createElement("section");
    card.className = "card empty";
    var h2 = document.createElement("h2");
    h2.textContent = "Couldn’t load " + data.title;
    var p = document.createElement("p");
    p.className = "muted";
    p.textContent = "Something stopped this screen from loading. Close and reopen RallyReady — your saved team and history are safe.";
    card.appendChild(h2);
    card.appendChild(p);
    return card;
  }

  function renderScreen(routeId) {
    var host = document.getElementById("screen");
    if (!host) return;
    var data = SCREENS[routeId];
    host.innerHTML = "";

    // Drop any print-ready carry sheet from the previous screen; the Today
    // screen re-registers its own when it paints.
    if (RR.share && RR.share.clearPrintable) RR.share.clearPrintable();

    var head = document.createElement("div");
    head.className = "screen-head";
    var h1 = document.createElement("h1");
    h1.className = "screen-title";
    h1.setAttribute("tabindex", "-1");   // focus target for SPA navigation (a11y)
    h1.textContent = data.title;
    head.appendChild(h1);

    // A friendly "what is this page for?" helper under every title: an "i" button
    // that opens a plain-English explanation and a speaker that reads it aloud.
    if (RR.pageGuide && RR.pageGuide.control) {
      var guide = RR.pageGuide.control(routeId);
      if (guide) head.appendChild(guide);
    }

    host.appendChild(head);

    var team = RR.team;
    if (routeId === "team" && team) {
      // The Team screen owns its body: the auto-saving setup form + summary.
      team.renderTeam(host);
    } else if (routeId === "ideas" && RR.feed) {
      // The Ideas feed: coaching inspiration to pull from. It works with NO team,
      // so it sits ABOVE the team-gated branch and is never blocked by setup.
      RR.feed.render(host);
    } else if ((routeId === "today" || routeId === "season" || routeId === "history") && team && !team.hasTeam()) {
      // These screens are driven by the team; nudge setup until one exists.
      host.appendChild(team.emptyStateCard(EMPTY_COPY[routeId]));
    } else if (routeId === "today" && RR.today) {
      // The Today screen owns its body: practice plan + program-aware controls.
      RR.today.renderToday(host);
    } else if (routeId === "history" && RR.history) {
      // The History log (its own module; reuses RR.today helpers).
      RR.history.render(host);
    } else if (routeId === "calendar" && RR.calendar) {
      // The Schedule / agenda view.
      RR.calendar.render(host);
    } else if (routeId === "players" && RR.players) {
      // The Players tab: the squad grid + add form.
      RR.players.render(host);
    } else if (routeId === "player" && RR.playerProfile) {
      // The 1-on-1 player profile (reached from the Players grid).
      RR.playerProfile.render(host);
    } else if (routeId === "positions" && RR.positionsScreen) {
      // Position coaching guides + recommended drills.
      RR.positionsScreen.render(host);
    } else if (routeId === "lineup" && RR.lineup) {
      // The starting-lineup builder.
      RR.lineup.render(host);
    } else if (routeId === "season" && RR.season) {
      // The Season/Camp screen owns its body and sets its own program-aware title.
      RR.season.renderSeason(host);
    } else if (routeId === "tips" && RR.coaching && RR.coaching.renderTips) {
      // The Tips screen renders the coaching guidance, age reference, and glossary.
      RR.coaching.renderTips(host);
    } else if (routeId === "drills" && RR.drillsScreen) {
      // The Drills browser: a searchable, filterable, age/program-aware library.
      RR.drillsScreen.renderDrills(host);
    } else {
      host.appendChild(fallbackCard(data));
    }

    h1.focus();   // move focus to the new title so screen readers announce it
  }

  function updateTabs(routeId) {
    // Sub-screens with no tab of their own light up their nearest parent tab.
    var PARENT = {
      // The classic planner (#today) and its sub-screens now live UNDER the Ideas
      // tab — the feed is home base; the full planner is a quiet link within it.
      today: "ideas", history: "ideas", calendar: "ideas",
      player: "players", positions: "players", lineup: "players"
    };
    var activeTab = PARENT[routeId] || routeId;
    var tabs = document.querySelectorAll(".tabbar a");
    for (var i = 0; i < tabs.length; i++) {
      var a = tabs[i];
      var id = (a.getAttribute("href") || "").replace(/^#/, "");
      var active = id === activeTab;
      a.classList.toggle("is-active", active);
      if (active) { a.setAttribute("aria-current", "page"); }
      else { a.removeAttribute("aria-current"); }
    }
  }

  function route() {
    // Honour retired-hash redirects (e.g. #roster -> #players) before rendering.
    var raw = (location.hash || "").replace(/^#/, "");
    if (REDIRECTS[raw]) { location.replace("#" + REDIRECTS[raw]); return; }
    var id = currentRoute();
    renderScreen(id);
    updateTabs(id);
    document.title = "RallyReady · " + SCREENS[id].title;
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    // When a NEW worker takes control (sw.js bumps CACHE_VERSION, then
    // skipWaiting + clients.claim), reload once so this page swaps to the
    // freshly cached assets instead of running the old release. On a FIRST
    // install there's no prior controller, so we skip that initial reload.
    var hadController = !!navigator.serviceWorker.controller;
    var reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!hadController) { hadController = true; return; }
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });

    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        // Re-check sw.js on launch and whenever the app returns to the
        // foreground, so an installed PWA picks up a new release promptly
        // rather than waiting for the browser's own periodic poll.
        function checkForUpdate() { if (reg && reg.update) reg.update(); }
        checkForUpdate();
        document.addEventListener("visibilitychange", function () {
          if (document.visibilityState === "visible") checkForUpdate();
        });
      }).catch(function (err) {
        console.error("RallyReady: service worker registration failed", err);
      });
    });
  }

  function init() {
    // Merge any coach-authored drills into the live library before the first paint.
    if (RR.state && RR.state.syncCustomDrills) RR.state.syncCustomDrills();
    // Bring up localization (flag toggle + DOM translator) before the first render
    // so the opening screen paints in the chosen language.
    if (RR.i18n && RR.i18n.init) RR.i18n.init();
    applyTheme();
    var toggle = document.getElementById("themeToggle");
    if (toggle) toggle.addEventListener("click", toggleTheme);

    // Re-apply when the OS theme changes, but only while following 'system'.
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onChange = function () {
        if ((RR.state.getState().theme || "system") === "system") applyTheme();
      };
      if (mq.addEventListener) { mq.addEventListener("change", onChange); }
      else if (mq.addListener) { mq.addListener(onChange); }
    }

    // Normalize empty/unknown hashes to the default route (no extra history entry).
    // Retired hashes that have a redirect are left for route() to forward.
    var raw = (location.hash || "").replace(/^#/, "");
    if (!SCREENS[raw] && !REDIRECTS[raw]) { location.replace("#" + DEFAULT_ROUTE); }
    route();
    window.addEventListener("hashchange", route);
    registerServiceWorker();
  }

  // Scripts are at the end of <body>, so the DOM is ready to query now.
  init();

  return {
    route: route,
    currentRoute: currentRoute,
    SCREENS: SCREENS,
    applyTheme: applyTheme,
    toggleTheme: toggleTheme
  };
})();
