// drills-ui.js — the Drills browser screen (RR.drillsScreen.renderDrills).
//
// A searchable, filterable library of RR.drills. It holds NO drill data of its
// own (that lives in js/drills*.js) and NO planning logic — it only presents the
// catalog and a per-drill detail view, composing the shared RR.ui helpers
// (drillCard, drillDetail, badge, emptyState, …). Every colour is a semantic
// token except the fixed intensity hues carried by the shared badge/dot classes,
// so it reads correctly in BOTH light and dark themes.
//
// PROGRAM MODEL (docs/program-model.md): nothing here is season-only. The age
// auto-filter uses RR.team.ageRange, and the optional "camp-friendly" chip
// defaults ON when the team's programType is "camp".
window.RR = window.RR || {};

RR.drillsScreen = (function () {
  "use strict";

  var ui = RR.ui;
  var h = ui.h;

  // Difficulty tiers (1–5 collapsed into three coach-friendly bands). Each chip
  // shows a dot in its hue, but the LABEL carries the meaning (never colour alone).
  var DIFF_TIERS = [
    { id: "beginner",     label: "Beginner",     color: "easy", min: 1, max: 2 },
    { id: "intermediate", label: "Intermediate", color: "mid",  min: 3, max: 3 },
    { id: "advanced",     label: "Advanced",     color: "hard", min: 4, max: 5 }
  ];

  // Preferred display order for the skill-category chips; any categories present
  // in the data but missing here are appended afterwards, so nothing is dropped.
  var SKILL_ORDER = [
    "Warmup", "Ball Control", "Passing", "Setting", "Serving",
    "Hitting", "Blocking", "Defense", "Team Play", "Cooldown"
  ];

  // ---- Persistent filter state (module scope, so it survives route changes) --
  // The selected DRILL is intentionally NOT persisted: each fresh navigation to
  // the screen resets to the list (see renderDrills). Only the filters stick.
  var filters = {
    query: "",
    skills: [],        // selected skill categories (empty = all)
    tiers: [],         // selected difficulty tier ids (empty = all)
    showAllAges: false,
    campOnly: false,
    _key: null         // detects a team change to recompute camp-default
  };

  // Build the ordered, de-duplicated list of skill categories from the data.
  function skillCategories() {
    var seen = {}, present = [];
    (RR.drills || []).forEach(function (d) {
      if (!seen[d.skill]) { seen[d.skill] = true; present.push(d.skill); }
    });
    var ordered = SKILL_ORDER.filter(function (s) { return seen[s]; });
    present.forEach(function (s) { if (ordered.indexOf(s) === -1) ordered.push(s); });
    return ordered;
  }

  // A drill matches the team's age band when its [ageMin,ageMax] intersects it.
  function inAgeBand(drill, band) {
    return drill.ageMin <= band.max && drill.ageMax >= band.min;
  }

  // Apply every active filter and return the matching drills (data order kept).
  function applyFilters(team) {
    var band = team ? RR.team.ageRange(team.ageGroup) : null;
    var q = filters.query.trim().toLowerCase();
    var tierRanges = DIFF_TIERS.filter(function (t) { return filters.tiers.indexOf(t.id) !== -1; });

    return (RR.drills || []).filter(function (d) {
      if (band && !filters.showAllAges && !inAgeBand(d, band)) return false;
      if (filters.campOnly && !d.campFriendly) return false;
      if (filters.skills.length && filters.skills.indexOf(d.skill) === -1) return false;
      if (tierRanges.length) {
        var ok = tierRanges.some(function (t) { return d.difficulty >= t.min && d.difficulty <= t.max; });
        if (!ok) return false;
      }
      if (q && d.name.toLowerCase().indexOf(q) === -1 &&
          d.skill.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  // Has the coach narrowed anything? Drives the "Clear filters" affordance and
  // the empty-state copy.
  function anyFilterActive() {
    return !!(filters.query.trim() || filters.skills.length || filters.tiers.length ||
      filters.campOnly || filters.showAllAges);
  }

  function clearFilters(team) {
    filters.query = "";
    filters.skills = [];
    filters.tiers = [];
    // Reset the toggles to their program-aware defaults rather than blindly off.
    filters.showAllAges = false;
    filters.campOnly = !!(team && team.programType === "camp");
  }

  // ======================================================================= //
  //  Screen                                                                 //
  // ======================================================================= //
  function renderDrills(host) {
    var team = (RR.state && RR.state.getState().team) || null;
    var hasTeam = !!(RR.team && RR.team.isSetUp && RR.team.isSetUp(team));

    // Give each team a clean, program-aware slate: the first time we see a given
    // team (or when its program type / age band changes underneath us), reset the
    // filters — which also defaults the camp-friendly chip ON for a camp. Within a
    // single team the filters persist across route changes (see `filters`).
    var key = team ? (team.name + "|" + team.programType + "|" + team.ageGroup) : "noteam";
    if (filters._key !== key) {
      filters._key = key;
      clearFilters(team);
    }

    var selected = null;   // the drill being viewed in detail (resets each visit)

    // Intro line (program-aware, full --text so it passes AA on --bg).
    host.appendChild(h("p", { class: "screen-sub drills-intro", text: hasTeam
      ? ("Find the right activity for any skill — tuned to " + ui.programLabel(team) + ", " + team.ageGroup + ".")
      : "Browse the full drill library. Set up your team to tune it to their age and program." }));

    var controlsHost = h("div", { class: "drills-controls" });
    var bodyHost = h("div", { class: "drills-body" });
    host.appendChild(controlsHost);
    host.appendChild(bodyHost);

    buildControls();
    paint();

    // ---- Filter controls ----------------------------------------------------
    function buildControls() {
      controlsHost.innerHTML = "";

      // Text search (labelled input + a leading search glyph).
      var search = h("input", {
        class: "input drills-search__input", type: "search", id: "drills-search",
        value: filters.query, placeholder: "Search drills by name…",
        autocomplete: "off", "aria-label": "Search drills by name"
      });
      search.addEventListener("input", function () {
        filters.query = search.value;
        paint(true);   // keep focus in the search box while typing
      });
      controlsHost.appendChild(h("div", { class: "drills-search" }, [
        h("span", { class: "drills-search__icon", "aria-hidden": "true",
          html: ui.icon('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>', 18) }),
        search
      ]));

      // Skill-category chips.
      controlsHost.appendChild(filterGroup("Skill", skillCategories().map(function (skill) {
        return chip(skill, filters.skills.indexOf(skill) !== -1, function (on) {
          toggleIn(filters.skills, skill, on); paint();
        }, ui.skillColor(skill));
      })));

      // Difficulty chips.
      controlsHost.appendChild(filterGroup("Difficulty", DIFF_TIERS.map(function (t) {
        return chip(t.label, filters.tiers.indexOf(t.id) !== -1, function (on) {
          toggleIn(filters.tiers, t.id, on); paint();
        }, t.color);
      })));

      // Toggle chips: age band + camp-friendly. The age toggle only appears once a
      // team (with an age band) exists; the camp chip is always offered.
      var toggles = [];
      if (hasTeam) {
        toggles.push(chip("Show all ages", filters.showAllAges, function (on) {
          filters.showAllAges = on; paint();
        }));
      }
      toggles.push(chip("Camp-friendly", filters.campOnly, function (on) {
        filters.campOnly = on; paint();
      }));
      controlsHost.appendChild(filterGroup("Filters", toggles));
    }

    // A titled row of chips.
    function filterGroup(label, chips) {
      var labelId = "drills-fg-" + label.toLowerCase();
      return h("div", { class: "drills-fgroup" }, [
        h("span", { class: "eyebrow", id: labelId, text: label }),
        h("div", { class: "chips drills-chips", role: "group", "aria-labelledby": labelId }, chips)
      ]);
    }

    // A toggle chip. The selected state is shown by the shared ".chip.is-on"
    // styles (a ✓ glyph + tinted fill), so it never rests on colour alone.
    // An optional colour dot precedes the label as a category cue.
    function chip(label, on, onToggle, color) {
      var kids = [];
      if (color) kids.push(h("span", { class: "chip__dot dot--" + color, "aria-hidden": "true" }));
      kids.push(h("span", { text: label }));
      var b = h("button", {
        type: "button", class: "chip" + (on ? " is-on" : ""),
        "aria-pressed": on ? "true" : "false"
      }, kids);
      b.addEventListener("click", function () {
        var now = b.getAttribute("aria-pressed") !== "true";
        b.classList.toggle("is-on", now);
        b.setAttribute("aria-pressed", now ? "true" : "false");
        onToggle(now);
      });
      return b;
    }

    function toggleIn(arr, value, on) {
      var i = arr.indexOf(value);
      if (on && i === -1) arr.push(value);
      else if (!on && i !== -1) arr.splice(i, 1);
    }

    // ---- Paint either the results list or the detail view -------------------
    // keepFocus: true while typing in search so we don't steal focus back.
    function paint(keepFocus) {
      bodyHost.innerHTML = "";
      controlsHost.hidden = !!selected;

      if (selected) { bodyHost.appendChild(detailView(selected)); return; }

      var results = applyFilters(team);

      // Results count + a Clear affordance when anything is narrowed.
      var countRow = h("div", { class: "drills-count" }, [
        h("span", { class: "drills-count__num", "aria-live": "polite",
          text: results.length + (results.length === 1 ? " drill" : " drills") })
      ]);
      if (anyFilterActive()) {
        var clear = h("button", { type: "button", class: "drills-clear" }, ["Clear filters"]);
        clear.addEventListener("click", function () {
          clearFilters(team); buildControls(); paint();
        });
        countRow.appendChild(clear);
      }
      bodyHost.appendChild(countRow);

      if (!results.length) {
        bodyHost.appendChild(ui.emptyState({
          title: "No drills match",
          blurb: anyFilterActive()
            ? "Try removing a filter or searching a different skill — the full library is still here."
            : "No drills are available right now."
        }));
        if (anyFilterActive()) {
          var reset = h("button", { type: "button", class: "btn btn-primary drills-empty__cta" }, ["Clear filters"]);
          reset.addEventListener("click", function () { clearFilters(team); buildControls(); paint(); });
          bodyHost.querySelector(".empty").appendChild(reset);
        }
        return;
      }

      var list = h("div", { class: "drills-list" }, results.map(function (d) {
        return ui.drillCard(d, { onOpen: openDrill });
      }));
      bodyHost.appendChild(list);

      if (keepFocus) {
        var s = controlsHost.querySelector(".drills-search__input");
        if (s && document.activeElement !== s) { /* leave focus where it is */ }
      }
    }

    function openDrill(drill) {
      selected = drill;
      paint();
      // Move focus to the detail heading so screen readers announce the change.
      var head = bodyHost.querySelector(".drill-detail__name");
      if (head) { head.setAttribute("tabindex", "-1"); head.focus(); }
      window.scrollTo(0, 0);
    }

    function detailView(drill) {
      var back = h("button", { type: "button", class: "btn btn-ghost drills-back" }, [
        h("span", { "aria-hidden": "true", class: "drills-back__icon",
          html: ui.icon('<path d="M15 6l-6 6 6 6"/>', 18) }),
        "All drills"
      ]);
      back.addEventListener("click", function () {
        selected = null;
        paint();
        // Return focus to the screen title for a predictable reading order.
        var title = document.querySelector(".screen-title");
        if (title) title.focus();
        window.scrollTo(0, 0);
      });
      return h("div", { class: "drills-detail-wrap" }, [back, ui.drillDetail(drill)]);
    }
  }

  return {
    renderDrills: renderDrills,
    render: renderDrills   // alias used by the router
  };
})();
