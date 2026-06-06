// calendar.js — the Schedule screen (RR.calendar.render): an agenda / list view of
// the next ~3 weeks of practices (and, for seasons, games) so a coach can plan
// ahead at a glance and jump straight to any day's plan on the Today screen.
//
// This screen VISUALISES the plan that js/periodization.js computes; it holds no
// planning logic of its own. It reads:
//   RR.state          — the active team + the completed-practice history
//   RR.periodization  — the plan, phase/intensity/skill lookups, game context,
//                       practice-day scheduling, and the pure date utilities
//   RR.ui             — shared render helpers (h, badge, dots, fmtFull, emptyState)
//   RR.today          — to stash a target date before navigating (goToDate)
//
// Rows are real <button>s (keyboard-operable, ≥48px tap targets) grouped under
// semantic week headings. All colours come from semantic tokens except the fixed
// intensity hues carried by the shared .badge--*/.dot--* classes (navy text), so
// it reads correctly in BOTH light and dark themes.
window.RR = window.RR || {};

RR.calendar = (function () {
  "use strict";

  var P = RR.periodization;
  var ui = RR.ui;
  var h = ui.h;

  // How far ahead the agenda looks. Three weeks is enough to plan around without
  // turning the list into an endless scroll.
  var WINDOW_DAYS = 21;

  // ======================================================================= //
  //  COMPLETION LOOKUP (mirrors today.js' contract)                         //
  // ======================================================================= //

  // A day/slot is "Done" if state.savedSessions has a matching record for this
  // team (an older record with teamName == null counts for any team).
  function isCompleted(name, iso, slot) {
    var saved = RR.state.getState().savedSessions || [];
    for (var i = 0; i < saved.length; i++) {
      var s = saved[i];
      if (s.date === iso && (s.slot || 0) === (slot || 0) &&
          (s.teamName == null || s.teamName === name)) return true;
    }
    return false;
  }

  // ======================================================================= //
  //  WEEK GROUPING                                                          //
  // ======================================================================= //

  // The Sunday-start ISO of the calendar week containing `iso`. Grouping by a
  // stable week-start keeps headings consistent regardless of where today falls.
  function weekStartOf(iso) {
    var d = parseISO(iso);
    if (!d) return iso;
    return P.addDays(P.toISO(d), -d.getDay());
  }
  function parseISO(iso) {
    if (!iso) return null;
    var p = String(iso).split("-");
    return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null;
  }

  // A friendly heading for a week, relative to the week that contains today:
  // "This week", "Next week", then a date range for anything further out.
  function weekHeading(weekISO, todayWeekISO) {
    var diff = Math.round(P.daysBetween(todayWeekISO, weekISO) / 7);
    if (diff <= 0) return "This week";
    if (diff === 1) return "Next week";
    var endISO = P.addDays(weekISO, 6);
    return ui.fmtShort(weekISO) + " – " + ui.fmtShort(endISO);
  }

  // ======================================================================= //
  //  NAVIGATION                                                             //
  // ======================================================================= //

  // Stash the target date (and slot) where the Today screen can pick it up, then
  // navigate. RR.today.goToDate is implemented separately; fall back gracefully
  // if it isn't present yet so the link still works.
  function goToDay(iso, slot) {
    if (RR.today && typeof RR.today.goToDate === "function") {
      RR.today.goToDate(iso, slot || 0);
    } else {
      location.hash = "#today";
    }
  }

  // ======================================================================= //
  //  AGENDA MODEL                                                           //
  // ======================================================================= //

  // Build the flat, ordered list of agenda items for the window. Each item is one
  // of:
  //   { kind:"practice", iso, slot, done, phase, focus, intensity, color,
  //     dayBeforeGame, tomorrowsOpponent }
  //   { kind:"game",     iso, opponent }
  //   { kind:"campday",  iso, day, total, done, phase, focus, intensity, color }
  // Items are later grouped into weeks by the renderer.
  function buildAgenda(plan, team) {
    return plan.type === "camp"
      ? buildCampAgenda(plan, team)
      : buildSeasonAgenda(plan, team);
  }

  function buildCampAgenda(plan, team) {
    var items = [];
    var todayISO = P.toISO(new Date());
    // Start no earlier than the camp's first day; never run past its last.
    var startISO = plan.startDate > todayISO ? plan.startDate : todayISO;
    if (startISO < plan.startDate) startISO = plan.startDate;
    var lastISO = plan.endDate;

    for (var i = 0; i < WINDOW_DAYS; i++) {
      var iso = P.addDays(startISO, i);
      if (iso > lastISO) break;
      if (iso < plan.startDate) continue;
      var phase = P.phaseForDate(plan, iso);
      var color = P.phaseColor(phase.key);
      items.push({
        kind: "campday",
        iso: iso,
        slot: 0,
        day: P.campDayFor(plan, iso),
        total: plan.lengthDays,
        done: isCompleted(team.name, iso, 0),
        phase: phase,
        focus: P.skillFocus(plan, team, iso),
        intensity: P.intensityForDate(plan, iso),
        color: color
      });
    }
    return items;
  }

  function buildSeasonAgenda(plan, team) {
    var items = [];
    var todayISO = P.toISO(new Date());
    var lastISO = P.addDays(todayISO, WINDOW_DAYS - 1);
    var i, iso;

    // Practice + same-day game rows across the 21-day window.
    for (i = 0; i < WINDOW_DAYS; i++) {
      iso = P.addDays(todayISO, i);
      var ctx = P.gameContext(plan, iso);

      if (P.isPracticeDay(plan, iso)) {
        var phase = P.phaseForDate(plan, iso);
        items.push({
          kind: "practice",
          iso: iso,
          slot: 0,
          done: isCompleted(team.name, iso, 0),
          phase: phase,
          focus: P.skillFocus(plan, team, iso),
          intensity: P.intensityForDate(plan, iso),
          color: P.phaseColor(phase.key),
          dayBeforeGame: ctx.isDayBeforeGame,
          tomorrowsOpponent: ctx.tomorrowsOpponent
        });
      }
      if (ctx.isGameDay) {
        items.push({ kind: "game", iso: iso, opponent: ctx.todaysOpponent });
      }
    }

    // Upcoming games beyond the prep window are still worth surfacing so a coach
    // can see what's coming; add any not already listed, in date order.
    (plan.games || []).forEach(function (g) {
      if (!g || !g.date) return;
      if (g.date < todayISO || g.date <= lastISO) return;   // before window / already shown
      items.push({ kind: "game", iso: g.date, opponent: g.opponent || "" });
    });

    // Stable order: by date, then game-before-practice so a match day reads as the
    // headline above any same-day session.
    items.sort(function (a, b) {
      if (a.iso !== b.iso) return a.iso < b.iso ? -1 : 1;
      var ra = a.kind === "game" ? 0 : 1;
      var rb = b.kind === "game" ? 0 : 1;
      return ra - rb;
    });
    return items;
  }

  // ======================================================================= //
  //  ROW BUILDERS                                                           //
  // ======================================================================= //

  // The intensity read-out: small dots + a visible "n/10" (the dots are
  // decorative, so meaning never rests on colour alone).
  function intensityNode(n, color) {
    return h("span", { class: "cal-row__intensity" }, [
      ui.dots(n, color),
      h("span", { class: "cal-row__intensity-num", text: n + "/10" })
    ]);
  }

  // The chevron affordance shared by every tappable row.
  function chevron() {
    return h("span", {
      class: "cal-row__chev", "aria-hidden": "true",
      html: ui.icon('<path d="M9 6l6 6-6 6"/>', 18)
    });
  }

  // A practice (season) OR camp-day row — the whole thing is one <button> that
  // navigates to that day on the Today screen.
  function practiceRow(item, opts) {
    opts = opts || {};
    var dateLine = opts.dateText || ui.fmtFull(item.iso);

    // Top line: date + a "Done" pill once logged.
    var topKids = [h("span", { class: "cal-row__date", text: dateLine })];
    if (item.day) {
      topKids.push(h("span", { class: "cal-row__dayno", text: "Day " + item.day + " of " + item.total }));
    }
    if (item.done) {
      topKids.push(h("span", { class: "pill cal-row__done", text: "✓ Done" }));
    }

    // Meta line: phase badge + skill focus.
    var meta = h("div", { class: "cal-row__meta" }, [
      ui.badge(item.phase.label, item.color),
      h("span", { class: "cal-row__focus", text: item.focus })
    ]);

    var foot = h("div", { class: "cal-row__foot" }, [
      intensityNode(item.intensity, item.color)
    ]);
    if (item.dayBeforeGame) {
      foot.appendChild(h("span", { class: "cal-row__hint", text:
        "Light — game tomorrow" + (item.tomorrowsOpponent ? " vs " + item.tomorrowsOpponent : "") }));
    }

    var aria = dateLine + " — " + item.phase.label + ", " + item.focus +
      ", intensity " + item.intensity + " of 10" + (item.done ? ", completed" : "");

    var btn = h("button", {
      type: "button", class: "cal-row", "aria-label": aria
    }, [
      h("div", { class: "cal-row__body" }, [
        h("div", { class: "cal-row__top" }, topKids),
        meta,
        foot
      ]),
      chevron()
    ]);
    btn.addEventListener("click", function () { goToDay(item.iso, item.slot || 0); });
    return btn;
  }

  // A game row — a clearly distinct, on-palette look (an accent left edge + a
  // "Game" pill). Still a button so the coach can jump to that date's plan.
  function gameRow(item) {
    var opp = item.opponent ? "vs " + item.opponent : "Match day";
    var aria = ui.fmtFull(item.iso) + " — Game, " + opp;

    var btn = h("button", {
      type: "button", class: "cal-row cal-row--game", "aria-label": aria
    }, [
      h("div", { class: "cal-row__body" }, [
        h("div", { class: "cal-row__top" }, [
          h("span", { class: "cal-row__date", text: ui.fmtFull(item.iso) }),
          h("span", { class: "pill cal-row__game-pill" }, [
            h("span", { class: "cal-row__game-icon", "aria-hidden": "true",
              html: ui.icon('<path d="M2 12a10 10 0 0 1 20 0"/><path d="M2 12a10 10 0 0 0 20 0"/><path d="M12 2a14 14 0 0 0 0 20"/><path d="M12 2a14 14 0 0 1 0 20"/>', 14) }),
            "Game"
          ])
        ]),
        h("p", { class: "cal-row__opp", text: opp })
      ]),
      chevron()
    ]);
    btn.addEventListener("click", function () { goToDay(item.iso, 0); });
    return btn;
  }

  function renderRow(item) {
    if (item.kind === "game") return gameRow(item);
    if (item.kind === "campday") {
      return practiceRow(item, { dateText: ui.fmtFull(item.iso) });
    }
    return practiceRow(item);
  }

  // ======================================================================= //
  //  EMPTY / EDGE NOTES                                                     //
  // ======================================================================= //

  // A small muted card for windows with nothing to show (camp finished, or no
  // practices/games land in the next three weeks).
  function noteCard(title, blurb) {
    return h("section", { class: "card cal-note" }, [
      h("h2", { class: "cal-note__title", text: title }),
      h("p", { class: "muted cal-note__blurb", text: blurb })
    ]);
  }

  // Decide which "nothing here" note to show, given the (empty) agenda.
  function emptyNote(plan) {
    var todayISO = P.toISO(new Date());
    if (plan.type === "camp") {
      if (todayISO > plan.endDate) {
        return noteCard("Camp's a wrap",
          "This camp has already finished. Set up a new program to plan your next one.");
      }
      return noteCard("Nothing scheduled yet",
        "Your camp days will appear here once they're in range.");
    }
    return noteCard("No practices in the next 3 weeks",
      "There are no practice days or games scheduled in this window. Check your practice days and dates on the Team screen.");
  }

  // ======================================================================= //
  //  ENTRY POINT                                                            //
  // ======================================================================= //

  function renderCalendar(host) {
    var team = (RR.state && RR.state.getState().team) || null;
    var plan = P.computePlan(team);

    if (!plan) {
      host.appendChild(ui.emptyState({
        title: "Set up your team first",
        blurb: "Add your team and dates to see your schedule.",
        btnLabel: "Set up your team",
        hash: "#team"
      }));
      return;
    }

    host.appendChild(h("p", { class: "screen-sub", text:
      "The next 3 weeks at a glance — tap any day to open its plan." }));

    var items = buildAgenda(plan, team);

    if (!items.length) {
      host.appendChild(emptyNote(plan));
      return;
    }

    // Group items into ordered weeks, then render each as a heading + a .list of
    // rows. Using insertion order preserves the date sort done in buildAgenda.
    var todayWeekISO = weekStartOf(P.toISO(new Date()));
    var order = [];
    var byWeek = {};
    items.forEach(function (it) {
      var wk = weekStartOf(it.iso);
      if (!byWeek[wk]) { byWeek[wk] = []; order.push(wk); }
      byWeek[wk].push(it);
    });

    var agenda = h("div", { class: "cal-agenda" });
    order.forEach(function (wk) {
      agenda.appendChild(h("h2", { class: "cal-week-head", text: weekHeading(wk, todayWeekISO) }));
      var list = h("div", { class: "list cal-list" });
      byWeek[wk].forEach(function (it) { list.appendChild(renderRow(it)); });
      agenda.appendChild(list);
    });
    host.appendChild(agenda);
  }

  return {
    render: renderCalendar,
    renderCalendar: renderCalendar
  };
})();
