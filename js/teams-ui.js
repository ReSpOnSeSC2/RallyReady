// teams-ui.js — the multi-team switcher (top of the Team screen,
// RR.teamsUI.render) and the Backup & restore card (bottom of the screen,
// RR.teamsUI.renderBackup).
//
// A coach often runs more than one team (a 12s AND a 14s, club + school). This
// surfaces every saved team, lets the coach switch the one the whole app plans
// for, add a new one, or remove one — and back everything up to / restore from a
// plain JSON file (no backend, fully offline).
//
// PRESENTATION ONLY: all persistence lives in RR.state (teams[], activeTeamId,
// exportData/importData). Colours are semantic tokens so it reads in both themes.
window.RR = window.RR || {};

RR.teamsUI = (function () {
  "use strict";

  var ui = RR.ui;
  var h = ui.h;

  // A friendly, program-aware one-liner describing a team in the switcher list.
  function teamSubtitle(t) {
    if (!t) return "";
    var win = RR.team.programWindow(t);
    var label = win ? win.label : (t.programType === "camp" ? "Camp" : "Season");
    return (t.ageGroup || "No age set") + " · " + label;
  }

  // Trigger a client-side file download for `text` (used by Export).
  function download(filename, text) {
    var blob = new Blob([text], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = h("a", { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function render(host, opts) {
    opts = opts || {};
    var onChange = typeof opts.onChange === "function" ? opts.onChange : function () {};

    var teams = RR.state.getTeams();
    var activeId = RR.state.getActiveTeamId();

    // ---- Team switcher (only meaningful once there's at least one team) ------
    if (teams.length) {
      var list = h("ul", { class: "list teamswitch__list" }, teams.map(function (t) {
        var isActive = t.id === activeId;
        var pickBtn = h("button", {
          type: "button", class: "row teamswitch__pick" + (isActive ? " is-active" : ""),
          "aria-pressed": isActive ? "true" : "false"
        }, [
          h("span", { class: "teamswitch__main" }, [
            h("span", { class: "teamswitch__name", text: t.name || "Untitled team" }),
            h("span", { class: "teamswitch__sub muted", text: teamSubtitle(t) })
          ]),
          isActive
            ? h("span", { class: "pill teamswitch__now", text: "Active" })
            : h("span", { class: "teamswitch__go", "aria-hidden": "true", html: ui.icon('<path d="M9 6l6 6-6 6"/>', 18) })
        ]);
        pickBtn.addEventListener("click", function () {
          if (!isActive) { RR.state.setActiveTeam(t.id); onChange(); }
        });

        var del = h("button", {
          type: "button", class: "teamswitch__del", "aria-label": "Remove " + (t.name || "team")
        }, [h("span", { "aria-hidden": "true",
          html: ui.icon('<path d="M4 7h16"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M7 7l1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12"/>', 18) })]);
        del.addEventListener("click", function () {
          if (teams.length <= 1) {
            ui.confirmToast("Keep at least one team — edit this one instead.");
            return;
          }
          if (window.confirm("Remove “" + (t.name || "this team") + "” and its history? This can't be undone.")) {
            RR.state.removeTeam(t.id);
            onChange();
          }
        });

        return h("li", { class: "teamswitch__item" }, [pickBtn, del]);
      }));

      var addBtn = h("button", { type: "button", class: "btn btn-ghost btn-block teamswitch__add" }, [
        h("span", { "aria-hidden": "true", class: "btn__icon", html: ui.icon('<path d="M12 5v14M5 12h14"/>', 18) }),
        "Add another team"
      ]);
      addBtn.addEventListener("click", function () {
        RR.state.addTeam({ name: "", ageGroup: "", programType: "season",
          practicesPerWeek: 2, practiceDays: [2, 4], sessionsPerDay: 2,
          campDays: 5, sessionMinutes: 60, emphasis: [] });
        onChange();
      });

      host.appendChild(h("section", { class: "card teamswitch" }, [
        ui.sectionTitle("Your teams",
          h("span", { class: "pill", text: teams.length + (teams.length === 1 ? " team" : " teams") }),
          "h2"),
        list,
        addBtn
      ]));
    }
  }

  // ---- Backup & restore -----------------------------------------------------
  // Its own card so the Team screen can mount it at the very bottom, below the
  // setup form, rather than competing with the form for the top of the page.
  function renderBackup(host, opts) {
    opts = opts || {};
    var onChange = typeof opts.onChange === "function" ? opts.onChange : function () {};

    var exportBtn = h("button", { type: "button", class: "btn btn-ghost backup__btn" }, [
      h("span", { "aria-hidden": "true", class: "btn__icon", html: ui.icon('<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/>', 18) }),
      "Export backup"
    ]);
    exportBtn.addEventListener("click", function () {
      var stamp = new Date().toISOString().slice(0, 10);
      download("rallyready-backup-" + stamp + ".json", RR.state.exportData());
      ui.confirmToast("Backup downloaded.");
    });

    var fileInput = h("input", { type: "file", accept: "application/json,.json", class: "backup__file", hidden: true });
    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        if (!window.confirm("Restore from this file? It replaces all teams and history on this device.")) {
          fileInput.value = ""; return;
        }
        var res = RR.state.importData(String(reader.result));
        fileInput.value = "";
        if (res.ok) { ui.confirmToast("Backup restored. 🏐"); onChange(); }
        else { ui.confirmToast(res.error || "Couldn't read that file."); }
      };
      reader.readAsText(file);
    });
    var importBtn = h("button", { type: "button", class: "btn btn-ghost backup__btn" }, [
      h("span", { "aria-hidden": "true", class: "btn__icon", html: ui.icon('<path d="M12 15V3"/><path d="M7 8l5-5 5 5"/><path d="M5 21h14"/>', 18) }),
      "Restore backup"
    ]);
    importBtn.addEventListener("click", function () { fileInput.click(); });

    host.appendChild(h("section", { class: "card backup" }, [
      ui.sectionTitle("Backup & restore", null, "h2"),
      h("p", { class: "field-hint", text:
        "Everything lives on this device. Export a file to keep it safe or move it to another phone, then restore it there." }),
      h("div", { class: "backup__row" }, [exportBtn, importBtn, fileInput])
    ]));
  }

  // ---- "What's left" checklist card -----------------------------------------
  // Shown in place of the at-a-glance summary until every required field is
  // filled in, so a coach is told exactly what to complete before a plan can be
  // generated — rather than the summary just silently staying hidden. The list
  // of missing fields (and the rules) come from RR.team so the two never drift.
  function setupChecklistCard(team) {
    var miss = (RR.team.missingRequired ? RR.team.missingRequired(team) : []);
    // Every required field is present but the team still isn't set up: the only
    // remaining cause is a season opener on/before the practice start. Name it so
    // the list is never empty and the coach knows what to fix.
    var dateOrderIssue = !miss.length && !RR.team.isSetUp(team);

    function item(label) {
      return h("li", { class: "setup-check__item" }, [
        h("span", { class: "setup-check__dot", "aria-hidden": "true" }),
        h("span", { text: label })
      ]);
    }
    var items = miss.map(item);
    if (dateOrderIssue) items.push(item("A season opener that falls after practices begin"));

    var lead = items.length === 1
      ? "Finish this to generate your plan:"
      : "Finish these to generate your plan:";

    return h("section", { class: "card setup-check", role: "status" }, [
      h("div", { class: "card-head" }, [
        h("div", { class: "setup-check__head" }, [
          h("span", { class: "setup-check__icon", "aria-hidden": "true",
            html: ui.icon('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>', 20) }),
          h("h2", { text: "Almost ready" })
        ]),
        h("span", { class: "pill setup-check__tag", text: "Plan not ready yet" })
      ]),
      h("p", { class: "muted setup-check__lead", text: lead }),
      h("ul", { class: "setup-check__list" }, items)
    ]);
  }

  return { render: render, renderBackup: renderBackup, setupChecklistCard: setupChecklistCard };
})();
