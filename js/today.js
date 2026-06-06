// today.js — the Today screen (RR.today.renderToday). This is what the coach
// opens before every practice, and now what they run it from.
//
// It VISUALISES what the real generator produces and lets the coach make the plan
// their own: change today's focus, edit the blocks (retime / pin / swap / choose /
// reorder / add / remove), start a guided run-mode timer, share or print the
// sheet, and log it complete with attendance + a note. It reads:
//   RR.team / RR.periodization / RR.generator / RR.state / RR.ui  (as before)
//   RR.planEdit  — pure plan edits + the edit-mode block UI
//   RR.run       — the in-practice timer overlay
//   RR.share     — share / print / export
//   RR.roster    — attendance field + summary
//
// PROGRAM MODEL (docs/program-model.md): the screen adapts to team.programType
// (season navigates by date; camp by day + an AM/PM slot toggle).
window.RR = window.RR || {};

RR.today = (function () {
  "use strict";

  var P = RR.periodization;
  var ui = RR.ui;
  var h = ui.h;

  // View cursor + edit flag persist across route changes; `key` resets them when
  // the team/program changes underneath us.
  var nav = { date: null, slot: 0, key: null };
  var editMode = false;

  // ======================================================================= //
  //  STATE: regen counts, planned edits, focus overrides, completions       //
  // ======================================================================= //
  function slotKey(name, iso, slot) { return (name || "team") + "|" + iso + "|" + (slot || 0); }

  function getRegen(name, iso, slot) {
    var map = RR.state.getState().regen || {};
    return map[slotKey(name, iso, slot)] || 0;
  }
  function bumpRegen(name, iso, slot) {
    var s = RR.state.getState(); var map = s.regen || {};
    var k = slotKey(name, iso, slot); map[k] = (map[k] || 0) + 1;
    RR.state.update({ regen: map }); return map[k];
  }

  // Hand-edited plan snapshots — shown instead of a fresh generation until cleared.
  function getPlanned(name, iso, slot) {
    var map = RR.state.getState().plannedSessions || {};
    return map[slotKey(name, iso, slot)] || null;
  }
  function savePlanned(name, iso, slot, session) {
    var map = RR.state.getState().plannedSessions || {};
    map[slotKey(name, iso, slot)] = session;
    RR.state.update({ plannedSessions: map });
  }
  function clearPlanned(name, iso, slot) {
    var map = RR.state.getState().plannedSessions || {};
    if (map[slotKey(name, iso, slot)]) { delete map[slotKey(name, iso, slot)]; RR.state.update({ plannedSessions: map }); }
  }

  // Coach-chosen skill focus for a date/slot (overrides the curriculum).
  function getFocus(name, iso, slot) {
    var map = RR.state.getState().focusOverrides || {};
    return map[slotKey(name, iso, slot)] || null;
  }
  function setFocus(name, iso, slot, skill) {
    var map = RR.state.getState().focusOverrides || {};
    var k = slotKey(name, iso, slot);
    if (skill) map[k] = skill; else delete map[k];
    RR.state.update({ focusOverrides: map });
  }

  function allSaved() { return (RR.state.getState().savedSessions || []).slice(); }
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
    var saved = allSaved().filter(function (s) {
      return !(s.date === record.date && (s.slot || 0) === (record.slot || 0) && s.teamName === record.teamName);
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
  function slotLabel(slot, count) {
    if (count === 2) return ["AM", "PM"][slot] || ("Session " + (slot + 1));
    return "Session " + (slot + 1);
  }
  var equipLabel = ui.equipLabel;
  function equipmentFor(session) {
    var seen = {}, out = [];
    session.blocks.forEach(function (b) {
      ((b.drill && b.drill.equipment) || []).forEach(function (e) { if (!seen[e]) { seen[e] = true; out.push(e); } });
    });
    return out;
  }
  function dateForCampDay(plan, day) { return P.addDays(plan.startDate, day - 1); }
  function clampCamp(plan, iso) {
    if (iso < plan.startDate) return plan.startDate;
    if (iso > plan.endDate) return plan.endDate;
    return iso;
  }
  // Re-apply pinned drills from a previous session onto a freshly generated one.
  function applyPins(fresh, prev) {
    if (!prev || !prev.blocks) return fresh;
    var out = fresh;
    prev.blocks.forEach(function (b, i) {
      if (b._pinned && b.drill && out.blocks[i]) {
        out = RR.generator.setBlockDrill(out, i, b.drill);
        out.blocks[i]._pinned = true;
      }
    });
    return out;
  }

  // ---- Public navigation/reuse hooks (used by Calendar + History) ----------
  function goToDate(iso, slot) {
    nav.key = null; nav.date = iso; nav.slot = slot || 0; editMode = false;
    var team = RR.state.getState().team;
    var plan = P.computePlan(team);
    if (plan) nav.key = (team.name || "") + "|" + plan.type + "|" + plan.startDate + "|" + plan.endDate;
    if (location.hash === "#today") { if (RR.app && RR.app.route) RR.app.route(); }
    else { location.hash = "#today"; }
  }
  // Save a snapshot as a planned (editable) session on a date/slot — "copy forward".
  function planFromSnapshot(snapshot, iso, slot) {
    if (!snapshot) return;
    var team = RR.state.getState().team;
    var copy = JSON.parse(JSON.stringify(snapshot));
    copy.date = iso; copy.slot = slot || 0;
    savePlanned(team.name, iso, slot || 0, copy);
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

    var key = (team.name || "") + "|" + plan.type + "|" + plan.startDate + "|" + plan.endDate;
    if (nav.key !== key) {
      nav.key = key; nav.slot = 0; editMode = false;
      nav.date = isCamp
        ? dateForCampDay(plan, P.campDayFor(plan, P.toISO(new Date())))
        : P.practiceDayOnOrAfter(plan, P.toISO(new Date()));
    }
    if (isCamp) nav.date = clampCamp(plan, nav.date);
    if (nav.slot >= sessionsPerDay) nav.slot = 0;

    // Header: context sub-line + help toggle + Schedule + History links.
    var helpId = "today-help";
    var helpBtn = h("button", { type: "button", class: "today-help-btn", "aria-expanded": "false",
      "aria-controls": helpId, "aria-label": "How Today works" }, [h("span", { "aria-hidden": "true", text: "?" })]);
    var helpNote = h("p", { class: "today-help", id: helpId, hidden: true, text: isCamp
      ? "Each card is one ready-to-run block for this camp day — change the focus, edit the plan, run the timer, then mark it complete."
      : "Each card is one ready-to-run block for this practice — change the focus, edit the plan, run the timer, then mark it complete." });
    helpBtn.addEventListener("click", function () {
      var open = helpBtn.getAttribute("aria-expanded") === "true";
      helpBtn.setAttribute("aria-expanded", open ? "false" : "true"); helpNote.hidden = open;
    });

    host.appendChild(h("div", { class: "today-head" }, [
      h("div", { class: "today-head__lead" }, [
        h("p", { class: "screen-sub today-head__sub", text: plan.label + " · " + team.ageGroup }),
        helpBtn
      ]),
      h("div", { class: "today-head__links" }, [
        h("a", { class: "btn btn-ghost today-head__link", href: "#calendar" }, [
          h("span", { "aria-hidden": "true", html: ui.icon('<rect x="3" y="4.5" width="18" height="16.5" rx="3"/><path d="M3 9.5h18"/><path d="M8 2.5v4"/><path d="M16 2.5v4"/>', 18) }), "Schedule"]),
        h("a", { class: "btn btn-ghost today-head__link", href: "#history" }, [
          h("span", { "aria-hidden": "true", html: ui.icon('<path d="M3 3v6h6"/><path d="M3.5 9a9 9 0 1 0 2.1-3.4L3 9"/><path d="M12 7v5l3.5 2"/>', 18) }), "History"])
      ])
    ]));
    host.appendChild(helpNote);

    if (RR.install) { var ih = h("div", { class: "install-host" }); host.appendChild(ih); RR.install.mount(ih); }

    var controlsHost = h("div", { class: "today-controls" });
    var bodyHost = h("div", { class: "today-body" });
    host.appendChild(controlsHost);
    host.appendChild(bodyHost);

    var currentSession = null, currentCompleted = false, gearNode = null;
    paint();

    // ---- Top controls -------------------------------------------------------
    function controls() {
      controlsHost.innerHTML = "";
      if (isCamp) {
        controlsHost.appendChild(campDayNav());
        if (sessionsPerDay > 1) controlsHost.appendChild(slotToggle());
      } else {
        controlsHost.appendChild(dateNav());
      }
    }
    function navBtn(glyph, label, disabled, fn) {
      var b = h("button", { type: "button", class: "navbtn", "aria-label": label, disabled: disabled ? true : false },
        [h("span", { "aria-hidden": "true", text: glyph })]);
      if (!disabled) b.addEventListener("click", fn);
      return b;
    }
    function dateNav() {
      var iso = nav.date;
      var input = h("input", { class: "navdate", type: "date", value: iso, "aria-label": "Choose a date" });
      input.addEventListener("change", function () { if (input.value) { nav.date = input.value; editMode = false; paint(); } });
      return h("div", { class: "daynav" }, [
        navBtn("‹", "Previous practice", false, function () { nav.date = P.adjacentPracticeDate(plan, nav.date, -1); editMode = false; paint(); }),
        h("div", { class: "daynav__center" }, [h("span", { class: "daynav__main", text: ui.fmtFull(iso) }), input]),
        navBtn("›", "Next practice", false, function () { nav.date = P.adjacentPracticeDate(plan, nav.date, 1); editMode = false; paint(); })
      ]);
    }
    function campDayNav() {
      var N = plan.lengthDays; var day = P.campDayFor(plan, nav.date);
      return h("div", { class: "daynav" }, [
        navBtn("‹", "Previous day", day <= 1, function () { nav.date = dateForCampDay(plan, Math.max(1, day - 1)); editMode = false; paint(); }),
        h("div", { class: "daynav__center" }, [
          h("span", { class: "daynav__main", text: "Day " + day + " of " + N }),
          h("span", { class: "daynav__date", text: ui.fmtFull(nav.date) })
        ]),
        navBtn("›", "Next day", day >= N, function () { nav.date = dateForCampDay(plan, Math.min(N, day + 1)); editMode = false; paint(); })
      ]);
    }
    function slotToggle() {
      var group = h("div", { class: "slots segmented", role: "group", "aria-label": "Session slot" });
      for (var i = 0; i < sessionsPerDay; i++) {
        (function (idx) {
          var on = idx === nav.slot;
          var b = h("button", { type: "button", class: "seg" + (on ? " is-on" : ""), "aria-pressed": on ? "true" : "false", text: slotLabel(idx, sessionsPerDay) });
          b.addEventListener("click", function () { nav.slot = idx; editMode = false; paint(); });
          group.appendChild(b);
        })(i);
      }
      return group;
    }

    // ---- Session resolution -------------------------------------------------
    function resolveSession(iso, slot) {
      var planned = getPlanned(team.name, iso, slot);
      if (planned) return planned;
      var force = getFocus(team.name, iso, slot);
      return RR.generator.generateSession(team, iso, getRegen(team.name, iso, slot), slot, force ? { forceSkill: force } : null);
    }

    // ---- Body ---------------------------------------------------------------
    function paint() {
      controls();
      bodyHost.innerHTML = "";
      var iso = nav.date, slot = nav.slot;
      var completion = findCompletion(team.name, iso, slot);
      currentCompleted = !!completion;

      var planned = getPlanned(team.name, iso, slot);
      if (!isCamp && !currentCompleted && !planned && !P.isPracticeDay(plan, iso)) {
        currentSession = null; editMode = false;
        if (RR.share && RR.share.setPrintable) RR.share.setPrintable(null);
        bodyHost.appendChild(buildRestDay(iso));
        return;
      }

      currentSession = currentCompleted ? completion.session : resolveSession(iso, slot);
      if (!currentSession) {
        if (RR.share && RR.share.setPrintable) RR.share.setPrintable(null);
        bodyHost.appendChild(h("section", { class: "card empty" }, [
          h("p", { class: "muted", text: "No practice could be generated for this date." })
        ]));
        return;
      }

      var gctx = (!isCamp && P.gameContext) ? P.gameContext(plan, iso) : null;
      if (gctx) { var banner = buildGameBanner(gctx); if (banner) bodyHost.appendChild(banner); }

      bodyHost.appendChild(buildHero(currentSession, currentCompleted));

      // The plan's utility actions (Start, Edit, Share, Print, Regenerate) sit in
      // a toolbar at the TOP, right under the hero; only the primary "Mark
      // practice complete" CTA stays at the bottom of the screen.
      if (!currentCompleted && !editMode) bodyHost.appendChild(buildTopActions());

      if (!currentCompleted && !editMode) bodyHost.appendChild(buildFocusBar(iso, slot));
      bodyHost.appendChild(buildCoachNote(currentSession));

      if (editMode) {
        bodyHost.appendChild(buildEditList());
      } else {
        var blocksWrap = h("div", { class: "blocks" });
        currentSession.blocks.forEach(function (_b, i) { blocksWrap.appendChild(renderBlock(i)); });
        bodyHost.appendChild(blocksWrap);
      }

      gearNode = buildGear(currentSession);
      bodyHost.appendChild(gearNode);
      bodyHost.appendChild(buildActions(currentCompleted, completion));

      // Keep a print-ready carry sheet resident so any print path (the button,
      // Ctrl/Cmd+P, or a phone's "Save as PDF") produces this practice.
      if (RR.share && RR.share.setPrintable) RR.share.setPrintable(currentSession, team);
    }

    // Game-schedule banner (season).
    function buildGameBanner(g) {
      if (g.isGameDay) {
        return h("aside", { class: "gamebanner gamebanner--today" }, [
          h("span", { class: "gamebanner__tag", text: "Game day" }),
          h("span", { class: "gamebanner__text", text: g.todaysOpponent ? ("vs " + g.todaysOpponent + " — keep it light and confident.") : "Match today — keep it light and confident." })
        ]);
      }
      if (g.isDayBeforeGame) {
        return h("aside", { class: "gamebanner gamebanner--eve" }, [
          h("span", { class: "gamebanner__tag", text: "Game tomorrow" }),
          h("span", { class: "gamebanner__text", text: (g.tomorrowsOpponent ? ("vs " + g.tomorrowsOpponent + ". ") : "") + "This plan is eased for fresh legs." })
        ]);
      }
      if (g.next && g.next.daysAway > 0) {
        return h("aside", { class: "gamebanner" }, [
          h("span", { class: "gamebanner__tag gamebanner__tag--soft", text: "Next game" }),
          h("span", { class: "gamebanner__text", text: (g.next.opponent ? ("vs " + g.next.opponent + " · ") : "") + "in " + g.next.daysAway + (g.next.daysAway === 1 ? " day" : " days") + " · " + ui.fmtShort(g.next.date) })
        ]);
      }
      return null;
    }

    function buildHero(session, completed) {
      var color = P.phaseColor(session.phaseKey);
      var skillLabel = isCamp ? "Skill of the Day" : "Skill of the Week";
      var topRow = [ui.badge(session.phaseLabel, color), ui.badge(session.dayType)];
      if (session.forcedSkill) topRow.push(h("span", { class: "badge badge--mid", text: "Your focus" }));
      if (completed) topRow.push(h("span", { class: "badge badge--easy hero__done", text: "✓ Completed" }));

      var kids = [
        h("div", { class: "hero__top" }, topRow),
        h("div", { class: "hero__focus" }, [
          h("span", { class: "eyebrow", text: skillLabel }),
          h("h2", { class: "hero__skill", text: session.skillFocus })
        ])
      ];
      if (isCamp) {
        kids.push(h("p", { class: "hero__dayline", text: "Day " + P.campDayFor(plan, nav.date) + " of " + plan.lengthDays +
          (sessionsPerDay > 1 ? " · " + slotLabel(nav.slot, sessionsPerDay) + " session" : "") }));
      }
      kids.push(h("div", { class: "hero__stats" }, [
        h("div", { class: "hero__stat" }, [
          h("span", { class: "eyebrow", text: "Intensity" }),
          h("div", { class: "hero__intensity" }, [ui.dots(session.intensity, color), h("span", { class: "hero__intensity-num", text: session.intensity + " / 10" })])
        ]),
        h("div", { class: "hero__stat" }, [
          h("span", { class: "eyebrow", text: "Practice time" }),
          h("span", { class: "hero__time", text: session.totalMinutes + " min" })
        ])
      ]));
      return h("section", { class: "card hero" }, kids);
    }

    // Focus picker — override the curriculum's skill of the week/day.
    function buildFocusBar(iso, slot) {
      var FOCI = ["Passing", "Setting", "Serving", "Hitting", "Blocking", "Defense", "Ball Control", "Team Play"];
      var current = getFocus(team.name, iso, slot);
      var sel = h("select", { class: "input focusbar__select", "aria-label": "Today's skill focus" });
      sel.appendChild(h("option", { value: "", text: "Auto (curriculum)", selected: !current }));
      FOCI.forEach(function (s) { sel.appendChild(h("option", { value: s, text: s, selected: current === s })); });
      sel.addEventListener("change", function () {
        setFocus(team.name, iso, slot, sel.value || null);
        clearPlanned(team.name, iso, slot);   // rebuild around the new focus
        paint();
        ui.confirmToast(sel.value ? ("Focus set to " + sel.value + ".") : "Back to the planned focus.");
      });
      return h("div", { class: "focusbar" }, [h("span", { class: "eyebrow", text: "Today's focus" }), sel]);
    }

    function buildRestDay(iso) {
      var nextISO = P.adjacentPracticeDate(plan, iso, 1);
      var jump = h("button", { type: "button", class: "btn btn-primary btn-block" }, ["Go to next practice · " + ui.fmtFull(nextISO)]);
      jump.addEventListener("click", function () { nav.date = nextISO; paint(); });
      var add = h("button", { type: "button", class: "btn btn-ghost btn-block" }, ["Add an extra practice here"]);
      add.addEventListener("click", function () {
        var s = RR.generator.generateSession(team, iso, getRegen(team.name, iso, 0), 0);
        if (s) { savePlanned(team.name, iso, 0, s); paint(); ui.confirmToast("Practice added for this day."); }
      });
      return h("section", { class: "card restday" }, [
        h("span", { class: "restday__icon", "aria-hidden": "true",
          html: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0"/><path d="M2 12h20"/><path d="M12 2a14 14 0 0 1 0 20"/><path d="M12 2a14 14 0 0 0 0 20"/></svg>' }),
        h("h2", { class: "restday__title", text: "Rest day" }),
        h("p", { class: "restday__sub", text: "No practice scheduled for " + ui.fmtFull(iso) + ". Recovery is part of the plan." }),
        h("p", { class: "restday__days muted", text: "Practice days: " + practiceDaysSentence() }),
        jump, add
      ]);
    }
    function practiceDaysSentence() {
      var days = (plan.practiceDays || []).slice().sort(function (a, b) { return a - b; });
      var names = days.map(function (d) { return (RR.team.WEEKDAYS[d] || {}).label || ""; });
      if (!names.length) return "every day";
      if (names.length === 1) return names[0];
      return names.slice(0, -1).join(", ") + " & " + names[names.length - 1];
    }

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

    function renderBlock(i) {
      var block = currentSession.blocks[i];
      var swappable = !!(block._pool && block._pool.length > 1 && !currentCompleted);
      var holder = {};
      holder.card = ui.blockCard(block, {
        index: i, swappable: swappable,
        onSwap: function () {
          currentSession = RR.generator.swapBlock(currentSession, i, team);
          savePlanned(team.name, nav.date, nav.slot, currentSession);
          var fresh = renderBlock(i); holder.card.replaceWith(fresh);
          var newGear = buildGear(currentSession); gearNode.replaceWith(newGear); gearNode = newGear;
          var b = fresh.querySelector(".js-swap"); if (b) b.focus();
        }
      });
      return holder.card;
    }

    // Edit mode: editable blocks + add-block controls.
    function buildEditList() {
      var wrap = h("div", { class: "blocks pe-list" });
      var api = { update: function (s) { currentSession = s; savePlanned(team.name, nav.date, nav.slot, s); paint(); } };
      currentSession.blocks.forEach(function (_b, i) { wrap.appendChild(RR.planEdit.editableBlock(currentSession, i, api)); });

      function addBtn(label, kind, skill) {
        var b = h("button", { type: "button", class: "btn btn-ghost pe-add__btn" }, [
          h("span", { "aria-hidden": "true", class: "btn__icon", html: ui.icon('<path d="M12 5v14M5 12h14"/>', 16) }), label]);
        b.addEventListener("click", function () { api.update(RR.planEdit.addBlock(currentSession, kind, skill)); });
        return b;
      }
      wrap.appendChild(h("div", { class: "pe-add" }, [
        h("span", { class: "eyebrow", text: "Add a block" }),
        h("div", { class: "pe-add__row" }, [
          addBtn("Skill", "skill", null), addBtn("Game", "game", null),
          addBtn("Warm-up", "warmup", null), addBtn("Cool-down", "cooldown", null)
        ])
      ]));
      return wrap;
    }

    function buildGear(session) {
      var ref = RR.team.referenceFor(team.ageGroup);
      var items = equipmentFor(session);
      var chips = items.length
        ? h("ul", { class: "gear__chips" }, items.map(function (e) { return h("li", { class: "gear__chip", text: equipLabel(e) }); }))
        : h("p", { class: "gear__none muted", text: "Just a net and volleyballs — nothing extra needed." });
      return h("section", { class: "card gear" }, [
        h("h3", { text: "Equipment for today" }), chips,
        h("div", { class: "gear__ref" }, [
          h("div", { class: "gear__ref-item" }, [h("span", { class: "eyebrow", text: "Net height" }), h("strong", { text: ref.net })]),
          h("div", { class: "gear__ref-item" }, [h("span", { class: "eyebrow", text: "Ball" }), h("strong", { text: ref.ball })])
        ])
      ]);
    }

    // ---- Action bar ---------------------------------------------------------
    // Top-of-screen toolbar: every utility action for the plan, grouped together
    // so the bottom of the screen can hold a single, prominent primary CTA.
    function buildTopActions() {
      return h("div", { class: "today-toolbar", role: "group", "aria-label": "Plan actions" }, [
        utilBtn("Start", '<path d="M8 5v14l11-7z"/>', function () { if (RR.run) RR.run.start(currentSession, team); }),
        utilBtn("Edit plan", '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>', function () { editMode = true; paint(); }),
        utilBtn("Share", '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>', function () { if (RR.share) RR.share.session(currentSession, team); }),
        utilBtn("Print", '<path d="M6 9V3h12v6"/><rect x="6" y="13" width="12" height="8"/><path d="M6 17H3v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5h-3"/>', function () { if (RR.share) RR.share.printSession(currentSession, team); }),
        utilBtn("Regenerate", '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v5h-5"/>', regenerate)
      ]);
    }

    // Build a fresh plan for the day (kept pins survive). Shared by the toolbar.
    function regenerate() {
      var prev = currentSession;
      bumpRegen(team.name, nav.date, nav.slot);
      var force = getFocus(team.name, nav.date, nav.slot);
      var fresh = RR.generator.generateSession(team, nav.date, getRegen(team.name, nav.date, nav.slot), nav.slot, force ? { forceSkill: force } : null);
      fresh = applyPins(fresh, prev);
      var hasPins = fresh.blocks.some(function (b) { return b._pinned; });
      if (hasPins) savePlanned(team.name, nav.date, nav.slot, fresh); else clearPlanned(team.name, nav.date, nav.slot);
      paint(); ui.confirmToast(hasPins ? "Fresh plan — pinned drills kept." : "Fresh practice ready.");
    }

    function buildActions(completed, completion) {
      if (editMode) {
        var done = h("button", { type: "button", class: "btn btn-primary btn-block" }, ["Done editing"]);
        done.addEventListener("click", function () { editMode = false; paint(); });
        var reset = h("button", { type: "button", class: "btn btn-ghost btn-block" }, ["Reset to the generated plan"]);
        reset.addEventListener("click", function () {
          clearPlanned(team.name, nav.date, nav.slot); editMode = false; paint(); ui.confirmToast("Back to the generated plan.");
        });
        return h("div", { class: "today-actions" }, [done, reset]);
      }
      if (completed) return buildCompletedActions(completion);

      // Normal state: the bottom holds only the primary CTA — every utility
      // action now lives in the top toolbar (buildTopActions).
      var done2 = h("button", { type: "button", class: "btn btn-primary btn-block" }, ["Mark practice complete"]);
      done2.addEventListener("click", function () { openCompleteForm(); });
      return h("div", { class: "today-actions today-actions--cta" }, [done2]);
    }

    function utilBtn(label, svg, fn) {
      var b = h("button", { type: "button", class: "btn btn-ghost util-btn" }, [
        h("span", { "aria-hidden": "true", class: "btn__icon", html: ui.icon(svg, 18) }), label]);
      b.addEventListener("click", fn);
      return b;
    }

    // Inline completion form: attendance + a note, then log it.
    function openCompleteForm() {
      var existing = null;
      var att = (RR.roster && RR.roster.attendanceField) ? RR.roster.attendanceField(existing) : null;
      var notes = h("textarea", { class: "input complete__notes", rows: "3", placeholder: "How did it go? What to work on next time? (optional)" });
      var save = h("button", { type: "button", class: "btn btn-primary btn-block" }, ["Save — practice complete 🏐"]);
      save.addEventListener("click", function () {
        var present = att ? att.getValue() : null;
        saveCompletion(buildRecord(currentSession, present, notes.value.trim()));
        clearPlanned(team.name, nav.date, nav.slot);
        paint(); ui.confirmToast("Nice work — practice logged! 🏐");
      });
      var cancel = h("button", { type: "button", class: "btn btn-ghost btn-block" }, ["Cancel"]);
      cancel.addEventListener("click", function () { paint(); });

      bodyHost.appendChild(h("section", { class: "card complete", id: "complete-form" }, [
        ui.sectionTitle("Mark this practice complete", null, "h2"),
        att ? h("div", { class: "complete__att" }, [h("span", { class: "eyebrow", text: "Attendance" }), att.node]) : null,
        h("div", { class: "complete__notes-wrap" }, [h("span", { class: "eyebrow", text: "Practice note" }), notes]),
        save, cancel
      ]));
      var f = document.getElementById("complete-form"); if (f) f.scrollIntoView({ block: "nearest" });
    }

    function buildCompletedActions(completion) {
      var bits = [];
      var att = (RR.roster && RR.roster.summarizeAttendance) ? RR.roster.summarizeAttendance(completion.attendance) : "";
      if (att) bits.push(h("p", { class: "complete-log__att", text: att }));
      if (completion.notes) bits.push(h("p", { class: "complete-log__note", text: "“" + completion.notes + "”" }));

      var startBtn = h("button", { type: "button", class: "btn btn-ghost" }, [
        h("span", { "aria-hidden": "true", class: "btn__icon", html: ui.icon('<path d="M8 5v14l11-7z"/>', 18) }), "Run it again"]);
      startBtn.addEventListener("click", function () { if (RR.run) RR.run.start(currentSession, team); });
      var shareBtn = h("button", { type: "button", class: "btn btn-ghost" }, [
        h("span", { "aria-hidden": "true", class: "btn__icon", html: ui.icon('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>', 18) }), "Share"]);
      shareBtn.addEventListener("click", function () { if (RR.share) RR.share.session(currentSession, team); });
      var unmark = h("button", { type: "button", class: "btn btn-ghost" }, ["Unmark"]);
      unmark.addEventListener("click", function () { removeCompletion(team.name, nav.date, nav.slot); paint(); ui.confirmToast("Completion removed."); });

      return h("div", { class: "today-actions" }, [
        h("p", { class: "today-actions__note muted", text: "Logged to your History. Future practices avoid these drills for a while." }),
        h("div", { class: "complete-log" }, bits),
        h("div", { class: "today-actions__row" }, [startBtn, shareBtn, unmark])
      ]);
    }

    function buildRecord(session, present, notes) {
      return {
        teamName: team.name, teamId: RR.state.getActiveTeamId(),
        date: session.date, slot: session.slot || 0, programType: session.programType,
        campDay: isCamp ? P.campDayFor(plan, session.date) : null,
        phaseKey: session.phaseKey, phaseLabel: session.phaseLabel,
        skillFocus: session.skillFocus, intensity: session.intensity, totalMinutes: session.totalMinutes,
        dayType: session.dayType, sessionsPerDay: sessionsPerDay,
        drillIds: session.blocks.map(function (b) { return b.drill.id; }),
        attendance: present || null, notes: notes || "",
        completedAt: Date.now(), session: session
      };
    }
  }

  return {
    renderToday: renderToday,
    render: renderToday,
    goToDate: goToDate,
    planFromSnapshot: planFromSnapshot,
    removeCompletion: removeCompletion
  };
})();
