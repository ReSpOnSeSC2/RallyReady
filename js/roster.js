// roster.js — the "Roster & attendance" screen (RR.roster).
//
// Manage the active team's players (add / edit / remove; name + optional jersey
// number + optional position) and expose the helpers the Today screen uses to
// take attendance when a practice is marked complete.
//
// Persistence goes through RR.state: a player lives on `team.roster` as
// { id, name, number, position }. We always read the freshest team, clone before
// mutating, keep `team.rosterSize` in step with the squad, and write the WHOLE
// team back with RR.state.update({ team }). No mock data — an empty roster shows
// a friendly, inviting empty state.
window.RR = window.RR || {};

RR.roster = (function () {
  "use strict";

  var h = RR.ui.h;

  // Positions offered in the editor selects. The leading "" is "no position yet".
  var POSITIONS = [
    "", "Setter", "Outside hitter", "Opposite",
    "Middle blocker", "Libero", "Defensive specialist", "Not sure yet"
  ];

  // ------------------------------------------------------------------ icons --
  var ICON_ADD = '<path d="M12 5v14"/><path d="M5 12h14"/>';
  var ICON_EDIT = '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>';
  var ICON_REMOVE = '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/>';
  var ICON_SAVE = '<path d="M5 12l5 5L20 7"/>';
  var ICON_CANCEL = '<path d="M18 6 6 18"/><path d="M6 6l12 12"/>';

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

  // ------------------------------------------------------- screen rendering --
  function renderRoster(host) {
    host.innerHTML = "";

    // Gate: a team must exist before there's anything to roster.
    if (!(RR.team && RR.team.isSetUp && RR.team.isSetUp())) {
      host.appendChild(RR.ui.emptyState({
        title: "Set up your team first",
        blurb: "Add your team on the Team tab, then build your roster here.",
        btnLabel: "Set up your team",
        hash: "#team"
      }));
      return;
    }

    host.appendChild(h("p", { class: "screen-sub",
      text: "Add the players on your squad. Numbers and positions are optional — a name is all you need." }));

    host.appendChild(buildAddCard(host));
    host.appendChild(buildListCard(host));
  }

  // Re-render the whole screen in place (after any roster change) so the count,
  // sort order and empty states all stay truthful.
  function refresh(host) { renderRoster(host); }

  // ---- Add-player form ------------------------------------------------------
  function buildAddCard(host) {
    var nameInput = h("input", {
      type: "text", class: "input", id: "roster-add-name",
      placeholder: "Player name", autocomplete: "off", "aria-label": "Player name"
    });
    var numberInput = h("input", {
      type: "text", class: "input", inputmode: "numeric", maxlength: "3",
      placeholder: "No.", "aria-label": "Jersey number (optional)"
    });
    numberInput.addEventListener("input", function () {
      var cleaned = cleanNumber(numberInput.value);
      if (cleaned !== numberInput.value) numberInput.value = cleaned;
    });
    var positionSelect = buildPositionSelect("");

    function submit() {
      var name = nameInput.value.trim();
      if (!name) { nameInput.focus(); return; }   // name required; ignore empties

      var team = cloneTeam();
      if (!team) return;
      team.roster.push({
        id: RR.state.genId("player"),
        name: name,
        number: cleanNumber(numberInput.value),
        position: positionSelect.value || ""
      });
      persistTeam(team);
      RR.ui.confirmToast("Player added.");
      refresh(host);
      // After re-render the old nodes are gone; focus the fresh name field.
      var fresh = document.getElementById("roster-add-name");
      if (fresh) fresh.focus();
    }

    // Enter anywhere in the name/number fields submits the form.
    [nameInput, numberInput].forEach(function (el) {
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); submit(); }
      });
    });

    var addBtn = h("button", {
      type: "button", class: "btn btn-primary roster-add__btn",
      "aria-label": "Add player to roster"
    }, [
      h("span", { class: "roster-ico", "aria-hidden": "true", html: RR.ui.icon(ICON_ADD, 18) }),
      "Add player"
    ]);
    addBtn.addEventListener("click", submit);

    return h("section", { class: "card roster-add" }, [
      RR.ui.sectionTitle("Add a player", null, "h2"),
      h("div", { class: "roster-add__grid" }, [
        h("div", { class: "field roster-add__name" }, [
          h("label", { for: "roster-add-name", text: "Name" }),
          nameInput
        ]),
        h("div", { class: "field roster-add__num" }, [
          h("label", { class: "field-label", text: "Number" }),
          numberInput
        ]),
        h("div", { class: "field roster-add__pos" }, [
          h("label", { class: "field-label", text: "Position" }),
          positionSelect
        ])
      ]),
      addBtn
    ]);
  }

  function buildPositionSelect(value) {
    var sel = h("select", { class: "input", "aria-label": "Position (optional)" });
    POSITIONS.forEach(function (p) {
      sel.appendChild(h("option", {
        value: p,
        text: p === "" ? "Position (optional)" : p,
        selected: p === value
      }));
    });
    return sel;
  }

  // ---- Roster list ----------------------------------------------------------
  function buildListCard(host) {
    var team = activeTeam();
    var players = sortedRoster(team);

    var headerRight = players.length
      ? h("span", { class: "pill", text: players.length + (players.length === 1 ? " player" : " players") })
      : null;

    var card = h("section", { class: "card roster-list" }, [
      RR.ui.sectionTitle("Your roster", headerRight, "h2")
    ]);

    if (!players.length) {
      card.appendChild(h("p", { class: "muted roster-empty",
        text: "No players yet — add your first above." }));
      return card;
    }

    var ul = h("ul", { class: "list roster-ul" });
    players.forEach(function (player) {
      ul.appendChild(buildPlayerRow(player, host));
    });
    card.appendChild(ul);
    return card;
  }

  // One roster row, in display mode. Edit swaps it in place for an editor row.
  function buildPlayerRow(player, host) {
    var li = h("li", { class: "row roster-row" });

    var badge = player.number
      ? h("span", { class: "roster-badge", "aria-hidden": "true", text: player.number })
      : h("span", { class: "roster-badge roster-badge--empty", "aria-hidden": "true", text: "–" });

    var nameLine = [h("span", { class: "roster-row__name", text: player.name })];
    if (player.position) {
      nameLine.push(h("span", { class: "muted roster-row__pos", text: player.position }));
    }

    var numberLabel = player.number ? ("number " + player.number) : "no number";
    var info = h("div", { class: "roster-row__info" }, [
      badge,
      h("div", { class: "roster-row__text" }, nameLine)
    ]);

    var editBtn = h("button", {
      type: "button", class: "btn-ghost roster-iconbtn",
      "aria-label": "Edit " + player.name + " (" + numberLabel + ")"
    }, [h("span", { "aria-hidden": "true", html: RR.ui.icon(ICON_EDIT, 18) })]);
    editBtn.addEventListener("click", function () {
      var editor = buildEditorRow(player, host);
      li.replaceWith(editor);
      var input = editor.querySelector(".roster-edit__name");
      if (input) input.focus();
    });

    var removeBtn = h("button", {
      type: "button", class: "btn-ghost roster-iconbtn roster-iconbtn--danger",
      "aria-label": "Remove " + player.name + " from roster"
    }, [h("span", { "aria-hidden": "true", html: RR.ui.icon(ICON_REMOVE, 18) })]);
    removeBtn.addEventListener("click", function () {
      if (!window.confirm("Remove " + player.name + " from the roster?")) return;
      var team = cloneTeam();
      if (!team) return;
      team.roster = team.roster.filter(function (p) { return p.id !== player.id; });
      persistTeam(team);
      RR.ui.confirmToast("Player removed.");
      refresh(host);
    });

    li.appendChild(info);
    li.appendChild(h("div", { class: "roster-row__actions" }, [editBtn, removeBtn]));
    return li;
  }

  // Inline editor for one player: name + number + position with Save / Cancel.
  function buildEditorRow(player, host) {
    var li = h("li", { class: "row roster-row roster-row--editing" });

    var nameInput = h("input", {
      type: "text", class: "input roster-edit__name", value: player.name || "",
      autocomplete: "off", "aria-label": "Player name"
    });
    var numberInput = h("input", {
      type: "text", class: "input roster-edit__num", inputmode: "numeric", maxlength: "3",
      value: player.number || "", placeholder: "No.", "aria-label": "Jersey number (optional)"
    });
    numberInput.addEventListener("input", function () {
      var cleaned = cleanNumber(numberInput.value);
      if (cleaned !== numberInput.value) numberInput.value = cleaned;
    });
    var positionSelect = buildPositionSelect(player.position || "");
    positionSelect.classList.add("roster-edit__pos");

    function save() {
      var name = nameInput.value.trim();
      if (!name) { nameInput.focus(); return; }   // name stays required on edit
      var team = cloneTeam();
      if (!team) return;
      team.roster = team.roster.map(function (p) {
        if (p.id !== player.id) return p;
        return {
          id: p.id,
          name: name,
          number: cleanNumber(numberInput.value),
          position: positionSelect.value || ""
        };
      });
      persistTeam(team);
      RR.ui.confirmToast("Player updated.");
      refresh(host);
    }
    function cancel() { refresh(host); }

    nameInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); save(); }
      else if (e.key === "Escape") { e.preventDefault(); cancel(); }
    });

    var saveBtn = h("button", {
      type: "button", class: "btn btn-primary roster-iconbtn",
      "aria-label": "Save changes to " + player.name
    }, [h("span", { "aria-hidden": "true", html: RR.ui.icon(ICON_SAVE, 18) })]);
    saveBtn.addEventListener("click", save);

    var cancelBtn = h("button", {
      type: "button", class: "btn-ghost roster-iconbtn",
      "aria-label": "Cancel editing " + player.name
    }, [h("span", { "aria-hidden": "true", html: RR.ui.icon(ICON_CANCEL, 18) })]);
    cancelBtn.addEventListener("click", cancel);

    li.appendChild(h("div", { class: "roster-edit__fields" }, [
      nameInput,
      h("div", { class: "roster-edit__meta" }, [numberInput, positionSelect])
    ]));
    li.appendChild(h("div", { class: "roster-row__actions" }, [saveBtn, cancelBtn]));
    return li;
  }

  // =================================================================== //
  //  ATTENDANCE HELPERS — consumed by the Today "mark complete" flow.   //
  // =================================================================== //

  // attendanceField(existing) -> { node, getValue }
  //   node      — a DOM node of present/absent toggle chips, one per player.
  //               Everyone defaults to present unless `existing` (an array of
  //               present player ids) says otherwise.
  //   getValue() — returns an array of PRESENT player ids.
  // When the roster is empty: node is a muted hint and getValue() returns null.
  function attendanceField(existing) {
    var players = sortedRoster(activeTeam());

    if (!players.length) {
      return {
        node: h("p", { class: "muted roster-att__hint",
          text: "Add players on the Roster screen to take attendance." }),
        getValue: function () { return null; }
      };
    }

    // First-time (no saved attendance) defaults everyone to present; otherwise we
    // honour exactly what was recorded before.
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

  return {
    render: renderRoster,
    renderRoster: renderRoster,
    getRoster: getRoster,
    attendanceField: attendanceField,
    summarizeAttendance: summarizeAttendance
  };
})();
