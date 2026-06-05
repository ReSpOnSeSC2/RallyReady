// today.js — the Today screen (RR.today.renderToday) and the History log
// (RR.today.renderHistory). This is what the coach opens before every practice.
//
// It VISUALISES what the real generator produces; it holds no planning logic of
// its own. It reads:
//   RR.team          — the team + net/ball reference (RR.team.referenceFor)
//   RR.periodization — the plan, camp-day math, phase colours (RR.periodization)
//   RR.generator     — generateSession + swapBlock (the real engine)
//   RR.state         — persists regenerate counts and completed-practice history
//   RR.ui            — shared render helpers (h, dots, badge, watchLink, toast)
//
// PROGRAM MODEL (docs/program-model.md): the screen adapts to team.programType.
//   • Season -> navigate by DATE (Prev/Next + a date picker); "Skill of the Week".
//   • Camp   -> navigate by camp DAY (1..N), plus a session-slot toggle when
//               sessionsPerDay > 1; "Skill of the Day" and a "Day X of N" line.
//
// All colours are semantic tokens except the fixed intensity hues used by the
// shared .badge--*/.dot--* classes (navy text), so it reads in BOTH themes.
window.RR = window.RR || {};

RR.today = (function () {
  "use strict";

  var P = RR.periodization;
  var ui = RR.ui;
  var h = ui.h;

  // The view cursor persists across route changes (module scope), so returning to
  // Today keeps the date/slot you were looking at. `key` detects a team change and
  // resets the cursor when the program or team name changes underneath us.
  var nav = { date: null, slot: 0, key: null };

  // ======================================================================= //
  //  STATE: regenerate counts + completed-practice history                  //
  // ======================================================================= //

  // A stable per-(team,date,slot) key for the regenerate counter map.
  function slotKey(name, iso, slot) {
    return (name || "team") + "|" + iso + "|" + (slot || 0);
  }
  function getRegen(name, iso, slot) {
    var map = RR.state.getState().regen || {};
    return map[slotKey(name, iso, slot)] || 0;
  }
  // Increment and persist the regenerate count for one date/slot.
  function bumpRegen(name, iso, slot) {
    var s = RR.state.getState();
    var map = s.regen || {};
    var k = slotKey(name, iso, slot);
    map[k] = (map[k] || 0) + 1;
    RR.state.update({ regen: map });
    return map[k];
  }

  // Completed practices live in state.savedSessions (the same list the generator
  // reads to avoid recent repeats). Each record carries a flat `drillIds` array
  // for that lookup plus the full `session` snapshot so History can re-show it.
  function allSaved() {
    return (RR.state.getState().savedSessions || []).slice();
  }
  function findCompletion(name, iso, slot) {
    var saved = allSaved();
    for (var i = 0; i < saved.length; i++) {
      var s = saved[i];
      if (s.date === iso && (s.slot || 0) === (slot || 0) &&
          (s.teamName == null || s.teamName === name)) return s;
    }
    return null;
  }
  function saveCompletion(record) {
    // Replace any existing completion for the same team/date/slot, then persist.
    var saved = allSaved().filter(function (s) {
      return !(s.date === record.date && (s.slot || 0) === (record.slot || 0) &&
               s.teamName === record.teamName);
    });
    saved.push(record);
    RR.state.update({ savedSessions: saved });
  }
  function removeCompletion(name, iso, slot) {
    var saved = allSaved().filter(function (s) {
      return !(s.date === iso && (s.slot || 0) === (slot || 0) && s.teamName === name);
    });
    RR.state.update({ savedSessions: saved });
  }

  // ======================================================================= //
  //  SMALL HELPERS                                                          //
  // ======================================================================= //

  // Slot label: AM/PM for a two-a-day, otherwise "Session N".
  function slotLabel(slot, count) {
    if (count === 2) return ["AM", "PM"][slot] || ("Session " + (slot + 1));
    return "Session " + (slot + 1);
  }

  // Block role colours/labels and equipment labels live in RR.ui (shared with the
  // Drills browser); alias the one we use directly here.
  var equipLabel = ui.equipLabel;

  // Deduped, ordered equipment across all of a session's blocks.
  function equipmentFor(session) {
    var seen = {}, out = [];
    session.blocks.forEach(function (b) {
      ((b.drill && b.drill.equipment) || []).forEach(function (e) {
        if (!seen[e]) { seen[e] = true; out.push(e); }
      });
    });
    return out;
  }

  // The date for a given camp day number (1..N).
  function dateForCampDay(plan, day) {
    return P.addDays(plan.startDate, day - 1);
  }
  // Keep a camp cursor inside [startDate, endDate].
  function clampCamp(plan, iso) {
    if (iso < plan.startDate) return plan.startDate;
    if (iso > plan.endDate) return plan.endDate;
    return iso;
  }

  // ======================================================================= //
  //  TODAY SCREEN                                                           //
  // ======================================================================= //

  function renderToday(host) {
    var team = RR.state.getState().team;
    var plan = P.computePlan(team);
    if (!plan) {
      host.appendChild(RR.team.emptyStateCard({
        title: "Set up your team first",
        blurb: "Tell RallyReady your team and dates, and your next practice plan appears here — ready to run."
      }));
      return;
    }

    var isCamp = plan.type === "camp";
    var sessionsPerDay = isCamp ? (team.sessionsPerDay || 1) : 1;

    // Reset the cursor if the team/program changed, or on first run.
    var key = (team.name || "") + "|" + plan.type + "|" + plan.startDate + "|" + plan.endDate;
    if (nav.key !== key) {
      nav.key = key;
      nav.slot = 0;
      nav.date = isCamp
        ? dateForCampDay(plan, P.campDayFor(plan, P.toISO(new Date())))
        : P.practiceDayOnOrAfter(plan, P.toISO(new Date()));   // land on a real practice
    }
    if (isCamp) nav.date = clampCamp(plan, nav.date);
    if (nav.slot >= sessionsPerDay) nav.slot = 0;

    // Header: a context sub-line + a tiny "?" help toggle + a link to History.
    // The help note explains the flow in one sentence and reads for season OR camp.
    var helpId = "today-help";
    var helpBtn = h("button", {
      type: "button", class: "today-help-btn", "aria-expanded": "false",
      "aria-controls": helpId, "aria-label": "How Today works"
    }, [h("span", { "aria-hidden": "true", text: "?" })]);
    var helpNote = h("p", { class: "today-help", id: helpId, hidden: true, text: isCamp
      ? "Each card is one ready-to-run block for this camp day — tap a drill's cues, swap one you don't like, then mark the session complete."
      : "Each card is one ready-to-run block for this practice — tap a drill's cues, swap one you don't like, then mark the practice complete." });
    helpBtn.addEventListener("click", function () {
      var open = helpBtn.getAttribute("aria-expanded") === "true";
      helpBtn.setAttribute("aria-expanded", open ? "false" : "true");
      helpNote.hidden = open;
    });

    host.appendChild(h("div", { class: "today-head" }, [
      h("div", { class: "today-head__lead" }, [
        h("p", { class: "screen-sub today-head__sub", text: plan.label + " · " + team.ageGroup }),
        helpBtn
      ]),
      h("a", { class: "btn btn-ghost today-head__history", href: "#history" }, [
        h("span", { "aria-hidden": "true", class: "today-head__history-icon",
          html: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v6h6"/><path d="M3.5 9a9 9 0 1 0 2.1-3.4L3 9"/><path d="M12 7v5l3.5 2"/></svg>' }),
        "History"
      ])
    ]));
    host.appendChild(helpNote);

    // "Add to Home Screen" banner — only appears when the browser offers an
    // install and the user hasn't installed or dismissed it (see js/install.js).
    if (RR.install) {
      var installHost = h("div", { class: "install-host" });
      host.appendChild(installHost);
      RR.install.mount(installHost);
    }

    var controlsHost = h("div", { class: "today-controls" });
    var bodyHost = h("div", { class: "today-body" });
    host.appendChild(controlsHost);
    host.appendChild(bodyHost);

    // currentSession is the session being shown; swaps mutate it in place so that
    // marking complete logs exactly what's on screen.
    var currentSession = null, currentCompleted = false, gearNode = null;

    paint();

    // ---- Top controls (rebuilt whenever the cursor changes) -----------------
    function controls() {
      controlsHost.innerHTML = "";
      if (isCamp) {
        controlsHost.appendChild(campDayNav());
        if (sessionsPerDay > 1) controlsHost.appendChild(slotToggle());
      } else {
        controlsHost.appendChild(dateNav());
      }
    }

    // A 48px round Prev/Next button. `glyph` is a chevron; label is for a11y.
    function navBtn(glyph, label, disabled, fn) {
      var b = h("button", {
        type: "button", class: "navbtn", "aria-label": label,
        disabled: disabled ? true : false
      }, [h("span", { "aria-hidden": "true", text: glyph })]);
      if (!disabled) b.addEventListener("click", fn);
      return b;
    }

    // Season: Prev/Next steps one day; a date picker jumps anywhere.
    function dateNav() {
      var iso = nav.date;
      var input = h("input", { class: "navdate", type: "date", value: iso, "aria-label": "Choose a date" });
      input.addEventListener("change", function () {
        if (input.value) { nav.date = input.value; paint(); }
      });
      // Prev/Next hop between practice days (so the coach never steps onto an off
      // day by accident); the picker can still jump anywhere, including a rest day.
      return h("div", { class: "daynav" }, [
        navBtn("‹", "Previous practice", false, function () { nav.date = P.adjacentPracticeDate(plan, nav.date, -1); paint(); }),
        h("div", { class: "daynav__center" }, [
          h("span", { class: "daynav__main", text: ui.fmtFull(iso) }),
          input
        ]),
        navBtn("›", "Next practice", false, function () { nav.date = P.adjacentPracticeDate(plan, nav.date, 1); paint(); })
      ]);
    }

    // Camp: Prev/Next steps one camp day, clamped to 1..N.
    function campDayNav() {
      var N = plan.lengthDays;
      var day = P.campDayFor(plan, nav.date);
      return h("div", { class: "daynav" }, [
        navBtn("‹", "Previous day", day <= 1, function () {
          nav.date = dateForCampDay(plan, Math.max(1, day - 1)); paint();
        }),
        h("div", { class: "daynav__center" }, [
          h("span", { class: "daynav__main", text: "Day " + day + " of " + N }),
          h("span", { class: "daynav__date", text: ui.fmtFull(nav.date) })
        ]),
        navBtn("›", "Next day", day >= N, function () {
          nav.date = dateForCampDay(plan, Math.min(N, day + 1)); paint();
        })
      ]);
    }

    // Camp two-a-day (or more): a session-slot toggle that re-generates per slot.
    function slotToggle() {
      var group = h("div", { class: "slots segmented", role: "group", "aria-label": "Session slot" });
      for (var i = 0; i < sessionsPerDay; i++) {
        (function (idx) {
          var on = idx === nav.slot;
          var b = h("button", {
            type: "button", class: "seg" + (on ? " is-on" : ""),
            "aria-pressed": on ? "true" : "false", text: slotLabel(idx, sessionsPerDay)
          });
          b.addEventListener("click", function () { nav.slot = idx; paint(); });
          group.appendChild(b);
        })(i);
      }
      return group;
    }

    // ---- Body (hero, coach note, blocks, gear, actions) ---------------------
    function paint() {
      controls();
      bodyHost.innerHTML = "";

      var iso = nav.date, slot = nav.slot;
      var completion = findCompletion(team.name, iso, slot);
      currentCompleted = !!completion;

      // Season rest day: if this date isn't one of the team's practice days (and
      // nothing was logged here), show a calm "no practice" card instead of
      // inventing a session for every single day.
      if (!isCamp && !currentCompleted && !P.isPracticeDay(plan, iso)) {
        currentSession = null;
        bodyHost.appendChild(buildRestDay(iso));
        return;
      }

      // Show the logged snapshot when completed; otherwise the live plan.
      currentSession = currentCompleted
        ? completion.session
        : RR.generator.generateSession(team, iso, getRegen(team.name, iso, slot), slot);

      if (!currentSession) {   // should not happen once a team is set up
        bodyHost.appendChild(h("section", { class: "card empty" }, [
          h("p", { class: "muted", text: "No practice could be generated for this date." })
        ]));
        return;
      }

      bodyHost.appendChild(buildHero(currentSession, currentCompleted));
      bodyHost.appendChild(buildCoachNote(currentSession));

      var blocksWrap = h("div", { class: "blocks" });
      currentSession.blocks.forEach(function (_b, i) {
        blocksWrap.appendChild(renderBlock(i));
      });
      bodyHost.appendChild(blocksWrap);

      gearNode = buildGear(currentSession);
      bodyHost.appendChild(gearNode);

      bodyHost.appendChild(buildActions(currentCompleted));
    }

    // Hero summary: phase badge, day type, skill focus, intensity dots, time,
    // and — for camps — a "Day X of N" line.
    function buildHero(session, completed) {
      var color = P.phaseColor(session.phaseKey);
      var skillLabel = isCamp ? "Skill of the Day" : "Skill of the Week";

      var topRow = [ui.badge(session.phaseLabel, color), ui.badge(session.dayType)];
      if (completed) topRow.push(h("span", { class: "badge badge--easy hero__done", text: "✓ Completed" }));

      var kids = [
        h("div", { class: "hero__top" }, topRow),
        h("div", { class: "hero__focus" }, [
          h("span", { class: "eyebrow", text: skillLabel }),
          h("h2", { class: "hero__skill", text: session.skillFocus })
        ])
      ];

      if (isCamp) {
        kids.push(h("p", { class: "hero__dayline",
          text: "Day " + P.campDayFor(plan, nav.date) + " of " + plan.lengthDays +
                (sessionsPerDay > 1 ? " · " + slotLabel(nav.slot, sessionsPerDay) + " session" : "") }));
      }

      kids.push(h("div", { class: "hero__stats" }, [
        h("div", { class: "hero__stat" }, [
          h("span", { class: "eyebrow", text: "Intensity" }),
          h("div", { class: "hero__intensity" }, [
            ui.dots(session.intensity, color),
            h("span", { class: "hero__intensity-num", text: session.intensity + " / 10" })
          ])
        ]),
        h("div", { class: "hero__stat" }, [
          h("span", { class: "eyebrow", text: "Practice time" }),
          h("span", { class: "hero__time", text: session.totalMinutes + " min" })
        ])
      ]));

      return h("section", { class: "card hero" }, kids);
    }

    // Rest day card (season only): no practice scheduled for this weekday. Offers a
    // one-tap jump to the next practice day and a reminder of the chosen schedule.
    function buildRestDay(iso) {
      var nextISO = P.adjacentPracticeDate(plan, iso, 1);
      var jump = h("button", { type: "button", class: "btn btn-primary btn-block" },
        ["Go to next practice · " + ui.fmtFull(nextISO)]);
      jump.addEventListener("click", function () { nav.date = nextISO; paint(); });

      return h("section", { class: "card restday" }, [
        h("span", { class: "restday__icon", "aria-hidden": "true",
          html: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0"/><path d="M2 12h20"/><path d="M12 2a14 14 0 0 1 0 20"/><path d="M12 2a14 14 0 0 0 0 20"/></svg>' }),
        h("h2", { class: "restday__title", text: "Rest day" }),
        h("p", { class: "restday__sub", text:
          "No practice scheduled for " + ui.fmtFull(iso) + ". Recovery is part of the plan." }),
        h("p", { class: "restday__days muted", text: "Practice days: " + practiceDaysSentence() }),
        jump
      ]);
    }

    // "Mon, Wed & Fri" — the team's chosen practice weekdays, read for humans.
    function practiceDaysSentence() {
      var days = (plan.practiceDays || []).slice().sort(function (a, b) { return a - b; });
      var names = days.map(function (d) { return (RR.team.WEEKDAYS[d] || {}).label || ""; });
      if (!names.length) return "every day";
      if (names.length === 1) return names[0];
      return names.slice(0, -1).join(", ") + " & " + names[names.length - 1];
    }

    // The coach note in a friendly highlighted callout, with the focus reminder.
    function buildCoachNote(session) {
      return h("aside", { class: "coachnote", "aria-label": "Coach note" }, [
        h("span", { class: "coachnote__icon", "aria-hidden": "true",
          html: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.5.4.8.9.9 1.5l.1.7h5.2l.1-.7c.1-.6.4-1.1.9-1.5A6 6 0 0 0 12 3z"/></svg>' }),
        h("div", { class: "coachnote__body" }, [
          h("p", { class: "coachnote__main", text: session.coachNote }),
          h("p", { class: "coachnote__sub", text: session.focusReminder })
        ])
      ]);
    }

    // One block card, built by the shared RR.ui.blockCard helper (Setup + steps +
    // "Watch how", with a self-contained cues toggle). Today owns only the
    // app-level "Swap" orchestration: when the deterministic rotation has another
    // candidate, swapping regenerates the block in place and refreshes the gear.
    function renderBlock(i) {
      var block = currentSession.blocks[i];
      var swappable = !!(block._pool && block._pool.length > 1 && !currentCompleted);
      var holder = {};
      holder.card = ui.blockCard(block, {
        index: i,
        swappable: swappable,
        onSwap: function () {
          currentSession = RR.generator.swapBlock(currentSession, i, team);
          var fresh = renderBlock(i);
          holder.card.replaceWith(fresh);
          // Equipment-for-today may change after a swap; keep it in sync.
          var newGear = buildGear(currentSession);
          gearNode.replaceWith(newGear);
          gearNode = newGear;
          var b = fresh.querySelector(".js-swap"); if (b) b.focus();
        }
      });
      return holder.card;
    }

    // "Equipment for today" (deduped) + the correct net height & ball for the age.
    function buildGear(session) {
      var ref = RR.team.referenceFor(team.ageGroup);
      var items = equipmentFor(session);
      var chips = items.length
        ? h("ul", { class: "gear__chips" }, items.map(function (e) {
            return h("li", { class: "gear__chip", text: equipLabel(e) });
          }))
        : h("p", { class: "gear__none muted", text: "Just a net and volleyballs — nothing extra needed." });

      return h("section", { class: "card gear" }, [
        h("h3", { text: "Equipment for today" }),
        chips,
        h("div", { class: "gear__ref" }, [
          h("div", { class: "gear__ref-item" }, [
            h("span", { class: "eyebrow", text: "Net height" }),
            h("strong", { text: ref.net })
          ]),
          h("div", { class: "gear__ref-item" }, [
            h("span", { class: "eyebrow", text: "Ball" }),
            h("strong", { text: ref.ball })
          ])
        ])
      ]);
    }

    // Regenerate / Mark complete — or, once logged, an Unmark control.
    function buildActions(completed) {
      if (completed) {
        var unmark = h("button", { type: "button", class: "btn btn-ghost btn-block" }, ["Unmark practice"]);
        unmark.addEventListener("click", function () {
          removeCompletion(team.name, nav.date, nav.slot);
          paint();
          ui.confirmToast("Completion removed.");
        });
        return h("div", { class: "today-actions" }, [
          h("p", { class: "today-actions__note muted", text: "Logged to your History. Future practices will avoid these drills for a while." }),
          unmark
        ]);
      }

      var regen = h("button", { type: "button", class: "btn btn-ghost" }, [
        h("span", { "aria-hidden": "true", class: "btn__icon",
          html: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v5h-5"/></svg>' }),
        "Regenerate"
      ]);
      regen.addEventListener("click", function () {
        bumpRegen(team.name, nav.date, nav.slot);
        paint();
        ui.confirmToast("Fresh practice ready.");
      });

      var done = h("button", { type: "button", class: "btn btn-primary" }, ["Mark practice complete"]);
      done.addEventListener("click", function () {
        saveCompletion(buildRecord(currentSession));
        paint();
        ui.confirmToast("Nice work — practice logged! 🏐");
      });

      return h("div", { class: "today-actions" }, [regen, done]);
    }

    // Build the persisted completion record from the on-screen session. Keeps a
    // flat drillIds list (for the generator's recent-repeat lookup) plus the full
    // session snapshot (so History can re-show it exactly).
    function buildRecord(session) {
      return {
        teamName: team.name,
        date: session.date,
        slot: session.slot || 0,
        programType: session.programType,
        campDay: isCamp ? P.campDayFor(plan, session.date) : null,
        phaseKey: session.phaseKey,
        phaseLabel: session.phaseLabel,
        skillFocus: session.skillFocus,
        intensity: session.intensity,
        totalMinutes: session.totalMinutes,
        dayType: session.dayType,
        sessionsPerDay: sessionsPerDay,
        drillIds: session.blocks.map(function (b) { return b.drill.id; }),
        completedAt: Date.now(),
        session: session
      };
    }
  }

  // ======================================================================= //
  //  HISTORY SCREEN                                                         //
  // ======================================================================= //

  function renderHistory(host) {
    var team = RR.state.getState().team;

    host.appendChild(h("p", { class: "screen-sub", text:
      "Every practice you've marked complete — newest first. Open one to view it again." }));

    var listHost = h("div", { class: "history-host" });
    host.appendChild(listHost);
    paintHistory();

    function paintHistory() {
      listHost.innerHTML = "";
      var recs = allSaved().filter(function (s) {
        return team && (s.teamName == null || s.teamName === team.name);
      });
      // Newest first: by completion time, then date, then slot.
      recs.sort(function (a, b) {
        if ((b.completedAt || 0) !== (a.completedAt || 0)) return (b.completedAt || 0) - (a.completedAt || 0);
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return (b.slot || 0) - (a.slot || 0);
      });

      if (!recs.length) {
        listHost.appendChild(h("section", { class: "card empty" }, [
          h("h2", { text: "No practices logged yet" }),
          h("p", { class: "muted", text: "When you tap “Mark practice complete” on the Today screen, it shows up here." }),
          h("a", { class: "btn btn-primary", href: "#today", text: "Go to Today" })
        ]));
        return;
      }

      var list = h("ul", { class: "list history-list" });
      recs.forEach(function (rec) { list.appendChild(historyRow(rec)); });
      listHost.appendChild(list);
    }

    function historyRow(rec) {
      var color = P.phaseColor(rec.phaseKey);
      // Primary label: a season date, or "Camp Day X" (+ slot when multi-session).
      var primary = rec.programType === "camp"
        ? ("Camp Day " + rec.campDay + (rec.sessionsPerDay > 1 ? " · " + slotLabel(rec.slot || 0, rec.sessionsPerDay) : ""))
        : ui.fmtFull(rec.date);

      var drills = (rec.session && rec.session.blocks || []).map(function (b) { return b.title; });
      var sub = rec.skillFocus + " · " + rec.totalMinutes + " min" +
        (drills.length ? " · " + drills.join(", ") : "");

      var open = h("button", { type: "button", class: "row history-open" }, [
        h("span", { class: "history-open__main" }, [
          h("span", { class: "history-open__date", text: primary }),
          h("span", { class: "history-open__sub muted", text: sub })
        ]),
        ui.badge(rec.phaseLabel, color)
      ]);
      open.addEventListener("click", function () { openSession(rec); });

      var del = h("button", {
        type: "button", class: "history-del", "aria-label": "Remove this completion"
      }, [h("span", { "aria-hidden": "true",
        html: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M7 7l1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12"/></svg>' })]);
      del.addEventListener("click", function () {
        removeCompletion(rec.teamName, rec.date, rec.slot || 0);
        paintHistory();
        ui.confirmToast("Removed from History.");
      });

      return h("li", { class: "history-item" }, [open, del]);
    }
  }

  // Open a logged session on the Today screen (sets the cursor, then navigates).
  function openSession(rec) {
    nav.key = null;              // force renderToday to honour the cursor we set
    nav.date = rec.date;
    nav.slot = rec.slot || 0;
    // Pin the cursor against the freshly-rendered plan so it isn't reset.
    var team = RR.state.getState().team;
    var plan = P.computePlan(team);
    if (plan) nav.key = (team.name || "") + "|" + plan.type + "|" + plan.startDate + "|" + plan.endDate;
    location.hash = "#today";
  }

  return {
    renderToday: renderToday,
    renderHistory: renderHistory,
    openSession: openSession,
    render: renderToday   // alias used by the router
  };
})();
