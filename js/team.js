// team.js — the Team setup screen and the data it produces.
//
// This is the ONLY setup a coach does, and it drives the whole app: age group,
// season dates, cadence, and skill emphasis all flow from here. The form is
// friendly and auto-saving — every change is written straight through RR.state
// and confirmed with a "Saved ✓" cue, so there is no Save button to forget.
//
// Other screens read the helpers exposed here (hasTeam, isSetUp, prepWeeks,
// referenceFor) so they can tailor themselves or show a "set up your team"
// empty state when nothing exists yet.
window.RR = window.RR || {};

RR.team = (function () {
  "use strict";

  // ---- Choices the form offers ---------------------------------------------
  // Age bands carry their developmental label because they change drills, net
  // height, and ball. The exact strings double as the keys into reference data.
  var AGE_GROUPS = [
    "8-10 (FUNdamentals)",
    "11-12 (Foundations)",
    "13-14 (Developing)",
    "15-16 (Competitive)",
    "17-18 (Advanced)"
  ];
  var SESSION_LENGTHS = [30, 45, 60, 75, 90, 120];   // minutes
  var SESSIONS_PER_DAY = [1, 2, 3, 4];               // camp: sessions in a day

  // Weekdays for the season "which days?" picker. The index matches JS
  // Date.getDay() (0 = Sunday … 6 = Saturday) so downstream date math is trivial.
  var WEEKDAYS = [
    { i: 0, short: "Sun", label: "Sunday" },
    { i: 1, short: "Mon", label: "Monday" },
    { i: 2, short: "Tue", label: "Tuesday" },
    { i: 3, short: "Wed", label: "Wednesday" },
    { i: 4, short: "Thu", label: "Thursday" },
    { i: 5, short: "Fri", label: "Friday" },
    { i: 6, short: "Sat", label: "Saturday" }
  ];
  // Sensible default day spreads per practice-count — they avoid back-to-back
  // days where possible and mirror common youth-club schedules. Used as a
  // fallback for teams saved before the day picker existed.
  var DEFAULT_PRACTICE_DAYS = {
    1: [2], 2: [2, 4], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 4, 5],
    6: [1, 2, 3, 4, 5, 6], 7: [0, 1, 2, 3, 4, 5, 6]
  };
  var MAX_PRACTICE_DAYS = 7;                          // a coach can practise any/every day of the week
  var CAMP_MAX_DAYS = 30;                             // camps run 1–30 days
  var SKILLS = ["Passing", "Setting", "Serving", "Hitting", "Blocking", "Defense", "Teamwork"];

  // Typical squad sizes — drives drill selection so a plan suits how many players
  // actually show up (a drill needing 12 won't land on a team of 8).
  var ROSTER_SIZES = [6, 8, 10, 12, 14, 16, 18, 20, 24];
  // "Extra" gear the coach may or may not own. Balls, a net, cones and a wall are
  // assumed available everywhere, so they're not listed; a drill that needs one
  // of THESE is only offered when the coach has ticked it. Tokens match the
  // drill library's `equipment` strings exactly so the generator can filter on them.
  var EQUIPMENT_EXTRAS = [
    { token: "bands", label: "Resistance bands" },
    { token: "mini bands", label: "Mini bands" },
    { token: "agility ladder", label: "Agility ladder" },
    { token: "jump ropes", label: "Jump ropes" },
    { token: "medicine ball", label: "Medicine ball" },
    { token: "reaction ball", label: "Reaction ball" },
    { token: "hoops", label: "Hoops / targets" },
    { token: "foam roller", label: "Foam roller" },
    { token: "box", label: "Plyo box / step" },
    { token: "mats", label: "Tumbling mats" }
  ];

  // A coach runs either a full season or a short summer-camp-style block.
  var PROGRAM_TYPES = [
    { value: "season", label: "Season" },
    { value: "camp",   label: "Summer camp" }
  ];

  // Safe fallback for net height + ball, used until RR.coaching.reference is
  // built (see Prompt 5). Values follow USA Volleyball age-appropriate guidance
  // (girls'/women's progression — the common youth-club default).
  var REFERENCE_FALLBACK = {
    "8-10 (FUNdamentals)": { net: "6'6\" (2.00 m)",  ball: "Lightweight (foam / Volley-Lite)" },
    "11-12 (Foundations)": { net: "7'0\" (2.13 m)",  ball: "Lightweight (Volley-Lite)" },
    "13-14 (Developing)":  { net: "7'4⅛\" (2.24 m)", ball: "Regulation indoor" },
    "15-16 (Competitive)": { net: "7'4⅛\" (2.24 m)", ball: "Regulation indoor" },
    "17-18 (Advanced)":    { net: "7'4⅛\" (2.24 m)", ball: "Regulation indoor" }
  };

  // The shape of a team, with sensible starting values for an unset team.
  // Two program types share most fields; only the schedule block differs.
  var DEFAULT_FORM = {
    name: "",
    ageGroup: "",
    programType: "season",   // "season" | "camp"
    // Season schedule:
    practiceStart: "",       // "YYYY-MM-DD" — when practices begin
    seasonStart: "",         // "YYYY-MM-DD" — first game / season opener
    practicesPerWeek: 2,
    practiceDays: [2, 4],    // which weekdays (0=Sun…6=Sat) practices land on
    // Camp schedule (summer-camp-style 1–30 day program):
    campStart: "",           // "YYYY-MM-DD" — day one of camp
    campDays: 5,             // length in days (1–30)
    sessionsPerDay: 2,
    games: [],               // season match schedule: [{date, opponent}]
    // Shared:
    sessionMinutes: 60,      // length of one practice/session
    rosterSize: 12,          // how many players, so drills suit the group size
    equipment: [],           // EXTRA gear on hand (tokens from EQUIPMENT_EXTRAS)
    emphasis: []             // subset of SKILLS, lightly weights drill selection
  };

  // ---- Tiny helpers ---------------------------------------------------------
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // Minimal hyperscript: h("div", {class:"x", onclick:fn}, [children]).
  function h(tag, props, kids) {
    var node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v == null || v === false) return;
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else if (k === "html") node.innerHTML = v;
        else if (k.slice(0, 2) === "on" && typeof v === "function") {
          node.addEventListener(k.slice(2).toLowerCase(), v);
        } else {
          node.setAttribute(k, v === true ? "" : v);
        }
      });
    }
    append(node, kids);
    return node;
  }
  function append(node, kids) {
    if (kids == null) return;
    if (Array.isArray(kids)) { kids.forEach(function (k) { append(node, k); }); }
    else if (kids instanceof Node) { node.appendChild(kids); }
    else { node.appendChild(document.createTextNode(String(kids))); }
  }

  // Lay short controls (dates, selects) side by side so they don't each eat a
  // full row; CSS collapses them back to one column on very narrow phones.
  function fieldRow() {
    return h("div", { class: "field-row" }, Array.prototype.slice.call(arguments).filter(Boolean));
  }

  // Parse "YYYY-MM-DD" as a LOCAL date (avoids the UTC off-by-one of new Date(str)).
  function parseDate(s) {
    if (!s) return NaN;
    var p = String(s).split("-");
    if (p.length !== 3) return NaN;
    return new Date(+p[0], +p[1] - 1, +p[2]).getTime();
  }

  // "YYYY-MM-DD" + N days -> "YYYY-MM-DD" (local), for camp end-date math.
  function addDays(s, days) {
    var ms = parseDate(s);
    if (isNaN(ms)) return "";
    var d = new Date(ms);
    d.setDate(d.getDate() + days);
    var mm = ("0" + (d.getMonth() + 1)).slice(-2);
    var dd = ("0" + d.getDate()).slice(-2);
    return d.getFullYear() + "-" + mm + "-" + dd;
  }

  // ---- Derived data the rest of the app can use -----------------------------
  function getTeam() {
    var t = RR.state.getState().team;
    if (!t) return null;
    var merged = Object.assign({}, DEFAULT_FORM, t);
    // Teams saved before the day picker existed have no practiceDays — derive a
    // matching set from their chosen count so their plan doesn't silently change.
    if (!Array.isArray(t.practiceDays) || !t.practiceDays.length) {
      merged.practiceDays = practiceDaysFor({ practicesPerWeek: merged.practicesPerWeek });
    }
    return merged;
  }

  // Season: both dates present and the opener strictly after practices begin.
  // ISO date strings compare correctly with <, so no parsing needed here.
  function datesValid(t) {
    return !!(t && t.practiceStart && t.seasonStart && t.seasonStart > t.practiceStart);
  }
  // Camp: a start date and a length within 1–30 days.
  function campValid(t) {
    return !!(t && t.campStart && t.campDays >= 1 && t.campDays <= CAMP_MAX_DAYS);
  }
  // The right schedule check for the team's program type.
  function scheduleValid(t) {
    return t && t.programType === "camp" ? campValid(t) : datesValid(t);
  }

  // A team counts as "set up" once it has the essentials every screen relies on.
  function isSetUp(t) {
    t = t || getTeam();
    return !!(t && t.name && String(t.name).trim() && t.ageGroup && scheduleValid(t));
  }
  function hasTeam() { return isSetUp(); }

  // The required fields a coach hasn't filled in yet, as human-readable labels
  // (matching the form's own labels). Mirrors isSetUp's rules exactly so the
  // "what's left" notice never disagrees with whether a plan can be generated.
  // Returns [] once the team is fully set up.
  function missingRequired(t) {
    t = t || getTeam();
    var miss = [];
    if (!t || !t.name || !String(t.name).trim()) miss.push("Team name");
    if (!t || !t.ageGroup) miss.push("Age group");
    if (t && t.programType === "camp") {
      if (!t.campStart) miss.push("Camp start date");
    } else {
      if (!t || !t.practiceStart) miss.push("Practice start date");
      if (!t || !t.seasonStart) miss.push("First game / season start");
    }
    return miss;
  }

  // Whole weeks of preparation between the first practice and the opener (season only).
  function prepWeeks(t) {
    t = t || getTeam();
    if (!datesValid(t)) return null;
    var days = (parseDate(t.seasonStart) - parseDate(t.practiceStart)) / 86400000;
    return Math.max(1, Math.round(days / 7));
  }

  // The chosen practice weekdays (0–6), de-duped and sorted. Falls back to a
  // sensible spread for the team's "practices per week" when none were picked yet
  // (e.g. teams saved before the day picker existed), so the schedule still works.
  function practiceDaysFor(t) {
    t = t || getTeam();
    var raw = (t && Array.isArray(t.practiceDays)) ? t.practiceDays : [];
    var days = raw
      .filter(function (d) { return typeof d === "number" && d >= 0 && d <= 6; })
      .filter(function (d, i, a) { return a.indexOf(d) === i; })
      .sort(function (a, b) { return a - b; });
    if (!days.length) {
      var n = (t && t.practicesPerWeek) || 2;
      days = (DEFAULT_PRACTICE_DAYS[n] || DEFAULT_PRACTICE_DAYS[2]).slice();
    }
    return days;
  }

  // Age band -> numeric {min,max}, parsed from labels like "11-12 (Foundations)".
  // Used by the drill library / generator (Prompts 4, 6, 8) to age-filter drills.
  function ageRange(ageGroup) {
    var m = /^(\d+)\s*-\s*(\d+)/.exec(ageGroup || "");
    return m ? { min: +m[1], max: +m[2] } : { min: 8, max: 18 };
  }

  // Normalized program window so downstream modules (periodization, generator,
  // Today/Season screens) can treat a SEASON and a CAMP uniformly: both reduce to
  // a dated window with a length and a cadence. Returns null until the schedule
  // is valid. See docs/program-model.md.
  function programWindow(t) {
    t = t || getTeam();
    if (!t || !scheduleValid(t)) return null;
    if (t.programType === "camp") {
      return {
        type: "camp",
        startDate: t.campStart,
        endDate: addDays(t.campStart, Math.max(0, t.campDays - 1)),
        lengthDays: t.campDays,
        sessionsPerDay: t.sessionsPerDay,
        sessionsPerWeek: null,
        label: t.campDays + "-day camp"
      };
    }
    var weeks = prepWeeks(t);
    return {
      type: "season",
      startDate: t.practiceStart,
      endDate: t.seasonStart,
      lengthDays: Math.round((parseDate(t.seasonStart) - parseDate(t.practiceStart)) / 86400000),
      sessionsPerDay: null,
      sessionsPerWeek: t.practicesPerWeek,
      practiceDays: practiceDaysFor(t),
      prepWeeks: weeks,
      // The full match schedule (sorted, blanks removed), so the in-season planner
      // can build toward each game. The opener (seasonStart) is implied as game 1.
      games: (RR.gamesEditor ? RR.gamesEditor.clean(t.games) : (t.games || [])),
      label: weeks + "-week season"
    };
  }

  // Net height + ball for an age group. Prefers RR.coaching.reference (Prompt 5),
  // and falls back to the built-in table so the summary always has real values.
  function referenceFor(ageGroup) {
    var ref = RR.coaching && RR.coaching.reference;
    var r = (ref && ref[ageGroup]) || REFERENCE_FALLBACK[ageGroup];
    if (!r) return { net: "—", ball: "—" };
    return { net: r.net || r.netHeight || "—", ball: r.ball || "—" };
  }

  // Format an ISO date for humans, e.g. "Aug 20, 2026".
  function prettyDate(s) {
    var ms = parseDate(s);
    if (isNaN(ms)) return "";
    return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  // ---- The screen -----------------------------------------------------------
  function renderTeam(host) {
    // The multi-team switcher sits above the form; backup/restore goes at the
    // very bottom (see below). Switching or restoring re-renders the whole
    // screen so the form reflects the new team.
    var rerender = function () {
      if (RR.app && RR.app.route) RR.app.route();   // re-render the whole screen
    };
    if (RR.teamsUI) {
      RR.teamsUI.render(host, { onChange: rerender });
    }

    // Working copy of the team. The DOM inputs are the source of truth while
    // editing; we mirror their values here and persist the whole object on change.
    var form = getTeam() || clone(DEFAULT_FORM);

    var savedCue, seasonInput, seasonError, noticeHost, summaryHost, scheduleHost, nameTimer;

    // Persist the current form through RR.state, then re-validate, confirm, and
    // refresh the summary. This is the single auto-save path for every field.
    function commit() {
      RR.state.update({ team: clone(form) });
      // First save: adopt the id RR.state assigned, so later edits update THIS
      // team instead of creating a new one on every keystroke.
      if (!form.id) { var at = RR.state.getActiveTeamId && RR.state.getActiveTeamId(); if (at) form.id = at; }
      validate();
      flashSaved();
      refreshSummary();
    }

    function flashSaved() {
      if (!savedCue) return;
      savedCue.classList.add("is-show");
      clearTimeout(flashSaved._t);
      flashSaved._t = setTimeout(function () { savedCue.classList.remove("is-show"); }, 1600);
    }

    // Gentle, non-blocking date check: the opener must come after practices begin.
    // Camp mode has no date-order rule, so it's always considered valid here.
    function validate() {
      if (form.programType === "camp") return true;
      var bad = !!(form.practiceStart && form.seasonStart && form.seasonStart <= form.practiceStart);
      if (seasonError) seasonError.classList.toggle("is-show", bad);
      if (seasonInput) {
        seasonInput.setAttribute("aria-invalid", bad ? "true" : "false");
        // Nudge native date pickers toward valid choices, too.
        if (form.practiceStart) seasonInput.setAttribute("min", form.practiceStart);
      }
      return !bad;
    }

    // ----- Build the form -----
    var intro = h("p", { class: "screen-sub team-intro",
      text: "The only setup RallyReady needs. Change anything anytime — it saves as you go." });

    savedCue = h("span", { class: "save-cue", "aria-live": "polite" }, [
      "Saved",
      h("span", { class: "save-cue__check", "aria-hidden": "true", text: "✓" })
    ]);

    // Schedule fields depend on program type, so they live in their own host and
    // are re-rendered when the coach switches between Season and Summer camp.
    scheduleHost = h("div", { class: "schedule-host" });
    renderSchedule();

    // Real <form> for semantics; we auto-save, so submit is a no-op.
    var formEl = h("form", { class: "team-form", novalidate: "novalidate",
      onsubmit: function (e) { e.preventDefault(); } }, [
      // Team name (debounced so typing doesn't flash "Saved" on every keystroke).
      field("Team name", inputText()),
      // Age group — drives drills, net height, and ball.
      field("Age group", ageSelect(), "Changes drills, net height, and ball."),
      // Program type — a full season or a short summer-camp-style block.
      field("Program type", RR.ui.segmented({
        options: PROGRAM_TYPES,
        value: form.programType,
        onSelect: function (v) { form.programType = v; renderSchedule(); commit(); }
      }), "A full season, or a 1–30 day camp.", true),
      // Program-specific schedule (dates + cadence) renders here.
      scheduleHost,
      // Shared, secondary settings (sensible defaults) tuck behind a disclosure so
      // the form stays short — open it to fine-tune session length, squad size,
      // gear on hand, and skill emphasis.
      RR.ui.disclosure("More options (optional)", h("div", { class: "team-optional" }, [
        field("Session length", RR.ui.segmented({
          options: SESSION_LENGTHS.map(function (n) { return { value: n, label: String(n) }; }),
          value: form.sessionMinutes,
          onSelect: function (v) { form.sessionMinutes = v; commit(); },
          suffix: "min"
        }), "Minutes per session.", true),
        field("Squad size", rosterSizeSelect(),
          "Roughly how many players — drills are picked to suit the group."),
        field("Equipment on hand", equipmentRow(),
          "Balls, a net and cones are assumed. Tick any extras you have so drills can use them.", true),
        field("Skill emphasis", chipRow(),
          "Optional — weights which skills get featured.", true)
      ]), false, true)
    ]);

    // The form body (savedCue + fields), not wrapped in its own card here so it
    // can sit either in an open card (a new team) or inside a collapsed disclosure
    // (a team that's ALREADY set up — returning coaches want the summary first,
    // with the long form tucked behind one tap). This keeps the screen short.
    var setUpAtRender = isSetUp(form);
    var formBody = h("div", { class: "team-form-body" }, [
      h("div", { class: "team-saverow" }, [savedCue]),
      formEl
    ]);
    var formContainer = setUpAtRender
      ? RR.ui.disclosure("Edit team setup", formBody, false)
      : h("section", { class: "card" }, [
          h("div", { class: "card-head" }, [h("h2", { text: "Team setup" })]),
          formBody
        ]);

    // "What's left to fill in" (noticeHost) sits ABOVE the form for a new team so
    // a coach sees up front what still blocks plan generation. Once set up, the
    // at-a-glance summary leads and the editor collapses below it.
    noticeHost = h("div", { class: "notice-host" });
    summaryHost = h("div", { class: "summary-host" });

    if (setUpAtRender) append(host, [intro, summaryHost, formContainer, noticeHost]);
    else append(host, [intro, noticeHost, formContainer, summaryHost]);

    // Backup & restore lives at the foot of the screen, below the form.
    if (RR.teamsUI && RR.teamsUI.renderBackup) {
      RR.teamsUI.renderBackup(host, { onChange: rerender });
    }

    refreshSummary();
    validate();

    // ----- Field builders -----
    // Wraps a control with a label + optional hint. Native inputs/selects use
    // <label for>; groups (radiogroup / chip group) can't, so they get an
    // aria-labelledby pointing at a visible label, plus aria-describedby for hints.
    function field(labelText, control, hint, isGroup) {
      var base = "f-" + labelText.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      var kids = [];
      if (isGroup) {
        var labelId = base + "-label";
        kids.push(h("span", { class: "field-label", id: labelId, text: labelText }));
        control.setAttribute("aria-labelledby", labelId);
      } else {
        control.id = control.id || base;
        kids.push(h("label", { for: control.id, text: labelText }));
      }
      if (hint) {
        var hintId = base + "-hint";
        kids.push(h("p", { class: "field-hint", id: hintId, text: hint }));
        control.setAttribute("aria-describedby", hintId);
      }
      kids.push(control);
      return h("div", { class: "field" }, kids);
    }

    // Small warning glyph for the inline error (coral carries the "error" signal;
    // the message text stays full-contrast --text so it passes AA in both themes).
    function warnIcon() {
      return h("span", { class: "field-error__icon", "aria-hidden": "true",
        html: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>' });
    }

    function inputText() {
      var input = h("input", {
        class: "input", type: "text", value: form.name || "",
        placeholder: "e.g. Northside Spikers", autocomplete: "off", maxlength: "60"
      });
      input.addEventListener("input", function () {
        form.name = input.value;
        clearTimeout(nameTimer);
        nameTimer = setTimeout(commit, 350);
      });
      input.addEventListener("blur", function () { clearTimeout(nameTimer); form.name = input.value; commit(); });
      return input;
    }

    function ageSelect() {
      var sel = h("select", { class: "input" });
      sel.appendChild(h("option", { value: "", text: "Select an age group…", disabled: true, selected: !form.ageGroup }));
      AGE_GROUPS.forEach(function (g) {
        sel.appendChild(h("option", { value: g, text: g, selected: form.ageGroup === g }));
      });
      sel.addEventListener("change", function () { form.ageGroup = sel.value; commit(); });
      return sel;
    }

    function dateInput(key) {
      var input = h("input", {
        class: "input datefield", type: "date", value: form[key] || "",
        "data-placeholder": "Choose a date"
      });
      // A native empty date field reads as a blank box, so flag the empty state:
      // CSS shows a "Choose a date" prompt until a real date is picked.
      function syncEmpty() { input.classList.toggle("is-empty", !input.value); }
      syncEmpty();
      input.addEventListener("input", syncEmpty);
      input.addEventListener("change", function () { form[key] = input.value; syncEmpty(); commit(); });
      return input;
    }

    // Season date gets its own builder so we can attach the inline error message
    // and wire it to the input via aria-describedby (announced when it appears).
    function seasonField() {
      seasonInput = dateInput("seasonStart");
      seasonInput.id = "f-season";
      var hintId = "f-season-hint";
      var errId = "f-season-error";
      seasonInput.setAttribute("aria-describedby", hintId + " " + errId);
      seasonError = h("p", { class: "field-error", id: errId, role: "alert" }, [
        warnIcon(),
        h("span", { text: "Your season opener should fall after practices begin — try a later date." })
      ]);
      return h("div", { class: "field" }, [
        h("label", { for: "f-season", text: "First game / season start" }),
        h("p", { class: "field-hint", id: hintId, text: "Your season opener." }),
        seasonInput,
        seasonError
      ]);
    }

    // Builds the program-specific schedule fields into scheduleHost. Called once
    // at render and again whenever the coach flips between Season and Summer camp.
    function renderSchedule() {
      scheduleHost.innerHTML = "";
      if (form.programType === "camp") {
        seasonInput = null;            // no season date-order validation in camp mode
        seasonError = null;
        append(scheduleHost, [
          fieldRow(
            field("Camp start date", dateInput("campStart"), "Day one of camp."),
            field("Camp length", campDaysSelect(), "How many days it runs (1–30).")
          ),
          field("Sessions per day", RR.ui.segmented({
            options: SESSIONS_PER_DAY.map(function (n) { return { value: n, label: String(n) }; }),
            value: form.sessionsPerDay,
            onSelect: function (v) { form.sessionsPerDay = v; commit(); }
          }), null, true)
        ]);
      } else {
        append(scheduleHost, [
          fieldRow(
            field("Practice start date", dateInput("practiceStart"), "When your practices begin."),
            seasonField()
          ),
          field("Which days?", weekdayPicker(),
            "Tap the days you practice — your plan only fills these.", true),
          field("Game schedule", RR.gamesEditor
            ? RR.gamesEditor.build(form, commit)
            : h("p", { class: "muted", text: "—" }),
            "Add your matches. Practices ramp toward the next game and ease the day before.", true)
        ]);
      }
    }

    // Season weekday picker — the single source of practice cadence. Toggling a
    // day keeps practicesPerWeek in step (the count == the days chosen).
    function weekdayPicker() {
      var current = practiceDaysFor(form);
      var row = h("div", { class: "chips weekdays", role: "group" });
      WEEKDAYS.forEach(function (d) {
        var on = current.indexOf(d.i) !== -1;
        var btn = h("button", {
          type: "button", class: "chip chip--day" + (on ? " is-on" : ""),
          "aria-pressed": on ? "true" : "false",
          "aria-label": d.label, "data-weekday": String(d.i), text: d.short
        });
        btn.addEventListener("click", function () { toggleDay(d.i); });
        row.appendChild(btn);
      });
      return row;
    }

    function toggleDay(i) {
      var days = practiceDaysFor(form);
      var at = days.indexOf(i);
      if (at !== -1) {
        if (days.length <= 1) return;                       // keep at least one day
        days.splice(at, 1);
      } else {
        if (days.length >= MAX_PRACTICE_DAYS) days.shift();  // cap at 7; drop the earliest
        days.push(i);
      }
      days.sort(function (a, b) { return a - b; });
      form.practiceDays = days;
      form.practicesPerWeek = days.length;                  // count follows the chosen days
      commit();
      renderSchedule();
      var el = scheduleHost.querySelector('[data-weekday="' + i + '"]');
      if (el) el.focus();
    }

    // 1–30 days as a native select — clearer than a 30-wide segmented control.
    function campDaysSelect() {
      var sel = h("select", { class: "input" });
      for (var d = 1; d <= CAMP_MAX_DAYS; d++) {
        sel.appendChild(h("option", { value: String(d), text: d + (d === 1 ? " day" : " days"),
          selected: form.campDays === d }));
      }
      sel.addEventListener("change", function () { form.campDays = parseInt(sel.value, 10); commit(); });
      return sel;
    }

    // Squad size — a native select (clearer than a 9-wide segmented control).
    function rosterSizeSelect() {
      var sel = h("select", { class: "input" });
      ROSTER_SIZES.forEach(function (n) {
        var label = n + (n === ROSTER_SIZES[ROSTER_SIZES.length - 1] ? "+ players" : " players");
        sel.appendChild(h("option", { value: String(n), text: label, selected: form.rosterSize === n }));
      });
      sel.addEventListener("change", function () { form.rosterSize = parseInt(sel.value, 10); commit(); });
      return sel;
    }

    // Extra-equipment toggles. Tokens match the drill library so the generator can
    // exclude drills needing gear the coach doesn't have.
    function equipmentRow() {
      var row = h("div", { class: "chips", role: "group" });
      EQUIPMENT_EXTRAS.forEach(function (item) {
        var on = (form.equipment || []).indexOf(item.token) !== -1;
        var b = h("button", {
          type: "button", class: "chip" + (on ? " is-on" : ""),
          "aria-pressed": on ? "true" : "false", text: item.label
        });
        b.addEventListener("click", function () {
          if (!Array.isArray(form.equipment)) form.equipment = [];
          var i = form.equipment.indexOf(item.token);
          if (i === -1) form.equipment.push(item.token); else form.equipment.splice(i, 1);
          var nowOn = form.equipment.indexOf(item.token) !== -1;
          b.classList.toggle("is-on", nowOn);
          b.setAttribute("aria-pressed", nowOn ? "true" : "false");
          commit();
        });
        row.appendChild(b);
      });
      return row;
    }

    function chipRow() {
      var row = h("div", { class: "chips", role: "group" });
      SKILLS.forEach(function (skill) {
        var on = form.emphasis.indexOf(skill) !== -1;
        var b = h("button", {
          type: "button", class: "chip" + (on ? " is-on" : ""),
          "aria-pressed": on ? "true" : "false", text: skill
        });
        b.addEventListener("click", function () {
          var i = form.emphasis.indexOf(skill);
          if (i === -1) form.emphasis.push(skill); else form.emphasis.splice(i, 1);
          var nowOn = form.emphasis.indexOf(skill) !== -1;
          b.classList.toggle("is-on", nowOn);
          b.setAttribute("aria-pressed", nowOn ? "true" : "false");
          commit();
        });
        row.appendChild(b);
      });
      return row;
    }

    // ----- Summary card -----
    // Only shown once the team is fully set up and valid, so it never displays
    // half-finished or contradictory information.
    function refreshSummary() {
      noticeHost.innerHTML = "";
      summaryHost.innerHTML = "";
      if (!isSetUp(form)) {
        // Tell the coach up front exactly which required fields are still blank,
        // rather than leaving the summary silently hidden. The prominent notice
        // sits above the form (noticeHost); the card lives in teamsUI.
        if (RR.teamsUI && RR.teamsUI.setupChecklistCard) {
          noticeHost.appendChild(RR.teamsUI.setupChecklistCard(form));
        }
        return;
      }

      var ref = referenceFor(form.ageGroup);
      var isCamp = form.programType === "camp";

      // The hero line and the cadence cells differ by program type; net height,
      // ball, and emphasis are shared.
      var hero, cadenceCells;
      if (isCamp) {
        var days = form.campDays;
        hero = [
          h("span", { class: "summary-hero__num", text: String(days) }),
          h("span", { class: "summary-hero__unit", text: (days === 1 ? "day of camp" : "days of camp") }),
          h("span", { class: "summary-hero__date", text: "Starts · " + prettyDate(form.campStart) })
        ];
        cadenceCells = [
          summaryItem("Sessions / day", form.sessionsPerDay + "×"),
          summaryItem("Total sessions", String(days * form.sessionsPerDay)),
          summaryItem("Session", form.sessionMinutes + " min")
        ];
      } else {
        var weeks = prepWeeks(form);
        hero = [
          h("span", { class: "summary-hero__num", text: String(weeks) }),
          h("span", { class: "summary-hero__unit", text: weeks === 1 ? "week to first game" : "weeks to first game" }),
          h("span", { class: "summary-hero__date", text: "Opener · " + prettyDate(form.seasonStart) })
        ];
        var dayNames = practiceDaysFor(form).map(function (d) { return WEEKDAYS[d].short; }).join(" · ");
        cadenceCells = [
          summaryItem("Practices / week", form.practicesPerWeek + "×"),
          summaryItem("Practice days", dayNames),
          summaryItem("Session", form.sessionMinutes + " min")
        ];
      }

      var extraCells = [
        summaryItem("Net height", ref.net, true),
        summaryItem("Ball", ref.ball, true),
        summaryItem("Squad", form.rosterSize + " players"),
        summaryItem("Emphasis", form.emphasis.length ? form.emphasis.join(", ") : "Balanced")
      ];
      if (!isCamp) {
        var nGames = (RR.gamesEditor ? RR.gamesEditor.clean(form.games) : (form.games || [])).length;
        extraCells.push(summaryItem("Games", nGames ? String(nGames) + " scheduled" : "Opener only"));
      }
      var grid = cadenceCells.concat(extraCells);

      var rosterLink = h("a", { class: "btn btn-ghost btn-block summary__roster", href: "#players" }, [
        h("span", { "aria-hidden": "true", class: "btn__icon",
          html: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3.3 2.7-5.5 5.5-5.5s5.5 2.2 5.5 5.5"/><path d="M16.4 5.2a3.2 3.2 0 0 1 0 5.8"/><path d="M17.6 14.9c2.3.5 3.9 2.4 3.9 5.1"/></svg>' }),
        "Manage players & attendance"
      ]);

      summaryHost.appendChild(h("section", { class: "card summary" }, [
        h("div", { class: "card-head" }, [
          h("h2", { text: form.name }),
          h("span", { class: "pill", text: form.ageGroup })
        ]),
        h("div", { class: "summary-hero" }, hero),
        h("div", { class: "summary-grid" }, grid),
        rosterLink
      ]));
    }

    function summaryItem(label, value, accent) {
      return h("div", { class: "summary-item" + (accent ? " summary-item--accent" : "") }, [
        h("span", { class: "summary-item__label", text: label }),
        h("span", { class: "summary-item__value", text: value })
      ]);
    }

  }

  // ---- Reusable empty state for Today / Season ------------------------------
  // A friendly nudge with a button that routes to the Team screen.
  function emptyStateCard(opts) {
    opts = opts || {};
    return h("section", { class: "card empty empty-team" }, [
      h("span", { class: "pill empty-team__tag", text: "1-minute setup" }),
      h("h2", { text: opts.title || "Set up your team first" }),
      h("p", { class: "muted", text: opts.blurb ||
        "Tell RallyReady your team’s age group and season dates, and every practice will be tailored to them." }),
      h("a", { class: "btn btn-primary", href: "#team", text: "Set up your team" })
    ]);
  }

  return {
    renderTeam: renderTeam,
    render: renderTeam,            // alias used by the router
    emptyStateCard: emptyStateCard,
    hasTeam: hasTeam,
    isSetUp: isSetUp,
    missingRequired: missingRequired,  // required fields still blank (human labels)
    prepWeeks: prepWeeks,          // season-only; null for camps
    programWindow: programWindow,  // normalized season|camp window for downstream modules
    practiceDaysFor: practiceDaysFor,  // chosen weekdays (0–6), with a safe fallback
    ageRange: ageRange,            // {min,max} parsed from the age band
    referenceFor: referenceFor,
    AGE_GROUPS: AGE_GROUPS,
    PROGRAM_TYPES: PROGRAM_TYPES,
    WEEKDAYS: WEEKDAYS,
    SKILLS: SKILLS
  };
})();
