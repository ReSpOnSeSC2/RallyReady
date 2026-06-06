// history.js — the completed-practice log (RR.history.render).
//
// Every practice the coach marks complete is saved (by js/today.js) with a full
// session snapshot, plus attendance and any notes. This screen lists them newest
// first, lets the coach re-open one on Today, copy a good practice forward to a
// future date (so winners can be re-run), and remove mistakes.
//
// PRESENTATION ONLY — all reads/writes go through RR.state + RR.today helpers.
window.RR = window.RR || {};

RR.history = (function () {
  "use strict";

  var ui = RR.ui;
  var h = ui.h;
  var P = RR.periodization;

  function slotLabel(slot, count) {
    if (count === 2) return ["AM", "PM"][slot] || ("Session " + (slot + 1));
    return "Session " + (slot + 1);
  }

  function allSaved() { return (RR.state.getState().savedSessions || []).slice(); }

  function renderHistory(host) {
    var team = RR.state.getState().team;

    host.appendChild(h("p", { class: "screen-sub", text:
      "Every practice you've marked complete — newest first. Re-open one, or copy a good one to a future date." }));

    var listHost = h("div", { class: "history-host" });
    host.appendChild(listHost);
    paintHistory();

    function paintHistory() {
      listHost.innerHTML = "";
      var recs = allSaved().filter(function (s) {
        return team && (s.teamName == null || s.teamName === team.name);
      });
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
      var primary = rec.programType === "camp"
        ? ("Camp Day " + rec.campDay + (rec.sessionsPerDay > 1 ? " · " + slotLabel(rec.slot || 0, rec.sessionsPerDay) : ""))
        : ui.fmtFull(rec.date);

      var drills = (rec.session && rec.session.blocks || []).map(function (b) { return b.title; });
      var bits = [rec.skillFocus, rec.totalMinutes + " min"];
      var att = (RR.roster && RR.roster.summarizeAttendance) ? RR.roster.summarizeAttendance(rec.attendance) : "";
      if (att) bits.push(att);
      var sub = bits.join(" · ") + (drills.length ? " · " + drills.join(", ") : "");

      var open = h("button", { type: "button", class: "row history-open" }, [
        h("span", { class: "history-open__main" }, [
          h("span", { class: "history-open__date", text: primary }),
          h("span", { class: "history-open__sub muted", text: sub }),
          rec.notes ? h("span", { class: "history-open__note", text: "“" + rec.notes + "”" }) : null
        ]),
        ui.badge(rec.phaseLabel, color)
      ]);
      open.addEventListener("click", function () {
        if (RR.today && RR.today.goToDate) RR.today.goToDate(rec.date, rec.slot || 0);
        else location.hash = "#today";
      });

      var copy = h("button", {
        type: "button", class: "history-copy", "aria-label": "Copy this practice to another date"
      }, [h("span", { "aria-hidden": "true",
        html: ui.icon('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>', 18) })]);
      copy.addEventListener("click", function () { copyToDate(rec); });

      var del = h("button", {
        type: "button", class: "history-del", "aria-label": "Remove this completion"
      }, [h("span", { "aria-hidden": "true",
        html: ui.icon('<path d="M4 7h16"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M7 7l1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12"/>', 18) })]);
      del.addEventListener("click", function () {
        if (RR.today && RR.today.removeCompletion) RR.today.removeCompletion(rec.teamName, rec.date, rec.slot || 0);
        paintHistory();
        ui.confirmToast("Removed from History.");
      });

      return h("li", { class: "history-item" }, [open, h("div", { class: "history-item__tools" }, [copy, del])]);
    }

    // Copy a logged practice forward to a date the coach picks, as an editable
    // "planned" session on Today (so a great practice can be re-run).
    function copyToDate(rec) {
      var iso = window.prompt("Copy this practice to which date? (YYYY-MM-DD)", P.toISO(new Date()));
      if (!iso) return;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) { ui.confirmToast("Please use the format YYYY-MM-DD."); return; }
      if (RR.today && RR.today.planFromSnapshot) {
        RR.today.planFromSnapshot(rec.session, iso, rec.slot || 0);
        ui.confirmToast("Copied to " + ui.fmtShort(iso) + ".");
        if (RR.today.goToDate) RR.today.goToDate(iso, rec.slot || 0);
      }
    }
  }

  return { render: renderHistory, renderHistory: renderHistory };
})();
