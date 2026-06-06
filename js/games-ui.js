// games-ui.js — the season game-schedule editor (RR.gamesEditor.build).
//
// A real season is more than one opener: it's a string of matches. The coach
// adds each game's date (and optional opponent) here; js/periodization.js reads
// team.games to ramp in-season intensity toward the next match and ease the day
// before it. Camps have no match schedule, so this is season-only.
//
// It edits the Team form's working copy by reference (form.games) and calls the
// form's commit() on every change, so it rides the same auto-save path as every
// other field — no separate persistence, no risk of clobbering the form.
window.RR = window.RR || {};

RR.gamesEditor = (function () {
  "use strict";

  var h = RR.ui.h;

  // A trash-can glyph reads as "delete" far more clearly than a bare minus.
  var ICON_TRASH = '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/>';

  function parseISO(s) {
    if (!s) return NaN;
    var p = String(s).split("-");
    return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]).getTime() : NaN;
  }
  function pretty(s) {
    var ms = parseISO(s);
    return isNaN(ms) ? "" : new Date(ms).toLocaleDateString(undefined,
      { weekday: "short", month: "short", day: "numeric" });
  }

  // Keep games sorted by date and free of blank rows before persisting.
  function clean(games) {
    return (games || [])
      .filter(function (g) { return g && g.date; })
      .sort(function (a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
  }

  // build(form, commit) -> a DOM node (a labelled field) for the schedule editor.
  function build(form, commit) {
    if (!Array.isArray(form.games)) form.games = [];
    var listHost = h("div", { class: "games__list" });

    function repaint() {
      listHost.innerHTML = "";
      var games = form.games;
      if (!games.length) {
        listHost.appendChild(h("p", { class: "games__empty muted", text:
          "No games added yet. Your first-game date above is the opener — add the rest so practices build toward each match." }));
      }
      games.forEach(function (g, i) {
        var dateIn = h("input", { class: "input datefield games__date", type: "date", value: g.date || "",
          "data-placeholder": "Choose date", "aria-label": "Game date" });
        // Native empty date fields read as a blank box, so flag the empty state:
        // CSS shows the "Choose date" prompt inside the box until a date is picked,
        // matching the season-start field instead of a separate caption above it.
        function syncEmpty() { dateIn.classList.toggle("is-empty", !dateIn.value); }
        syncEmpty();
        dateIn.addEventListener("change", function () {
          form.games[i].date = dateIn.value; syncEmpty();
          form.games = clean(form.games); commit(); repaint();
        });
        var dateField = h("label", { class: "games__field games__field--date" }, [dateIn]);

        var oppIn = h("input", { class: "input games__opp", type: "text", value: g.opponent || "",
          placeholder: "vs. (optional)", maxlength: "40", "aria-label": "Opponent" });
        oppIn.addEventListener("input", function () { form.games[i].opponent = oppIn.value; });
        oppIn.addEventListener("blur", function () { commit(); });
        var oppField = h("label", { class: "games__field games__field--opp" }, [
          h("span", { class: "games__label", text: "Opponent" }),
          oppIn
        ]);

        var rm = h("button", { type: "button", class: "games__del", "aria-label": "Remove game" },
          [h("span", { "aria-hidden": "true",
            html: RR.ui.icon(ICON_TRASH, 18) })]);
        rm.addEventListener("click", function () {
          form.games.splice(i, 1); commit(); repaint();
        });

        // Fields and the delete button share the top line; the resolved date
        // (when set) confirms below on its own line so nothing crowds.
        listHost.appendChild(h("div", { class: "games__row" }, [
          h("div", { class: "games__row-fields" }, [dateField, oppField]),
          rm,
          g.date ? h("span", { class: "games__when muted", text: pretty(g.date) }) : null
        ]));
      });
    }

    var add = h("button", { type: "button", class: "btn btn-ghost btn-block games__add" }, [
      h("span", { "aria-hidden": "true", class: "btn__icon", html: RR.ui.icon('<path d="M12 5v14M5 12h14"/>', 18) }),
      "Add a game"
    ]);
    add.addEventListener("click", function () {
      form.games.push({ date: "", opponent: "" });
      repaint();
      var inputs = listHost.querySelectorAll(".games__date");
      var last = inputs[inputs.length - 1];
      if (last) last.focus();
    });

    repaint();
    return h("div", { class: "games-editor" }, [listHost, add]);
  }

  return { build: build, clean: clean };
})();
