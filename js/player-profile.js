// player-profile.js — the 1-on-1 player profile sub-screen (RR.playerProfile).
//
// The deep view for ONE player, reached from the Players grid (#player). It's the
// coach's 1-on-1 hub:
//   • header — photo/avatar (change/remove), name, number, position(s)
//   • position — assign / switch the primary + optional secondary position
//   • play details — dominant hand, height, birthday/age (volleyball context)
//   • skill tracker — 0–5 per core skill, with a season trend
//   • focus goals — coach-set targets the player can tick off
//   • coaching notes — a timestamped log (add / edit / delete)
//   • attendance — present at X of Y completed practices
// Everything persists through RR.roster (player fields) and RR.photos (the image
// store); only semantic tokens + fixed avatar/skill hues are used, so both themes
// pass contrast.
window.RR = window.RR || {};

RR.playerProfile = (function () {
  "use strict";

  var ui = RR.ui;
  var h = ui.h;

  // The six core skills the app teaches (match the drill library's categories).
  var SKILLS = ["Serving", "Passing", "Setting", "Hitting", "Blocking", "Defense"];
  var SKILL_MAX = 5;

  var currentId = null;   // which player the screen is showing

  // Called by the Players grid before navigating to #player.
  function open(id) { currentId = id; }

  function render(host) {
    var player = currentId && RR.roster.getPlayer(currentId);

    var back = h("a", { class: "btn btn-ghost pl-back", href: "#players" }, [
      h("span", { "aria-hidden": "true", html: ui.icon('<path d="M15 18l-6-6 6-6"/>', 18) }),
      "All players"
    ]);
    host.appendChild(back);

    if (!player) {
      host.appendChild(ui.emptyState({
        title: "Player not found",
        blurb: "This player may have been removed. Head back to your squad.",
        btnLabel: "Back to Players", hash: "#players"
      }));
      return;
    }

    host.appendChild(headerCard(player, host));
    host.appendChild(positionCard(player, host));
    host.appendChild(detailsCard(player, host));
    host.appendChild(skillsCard(player, host));
    host.appendChild(goalsCard(player, host));
    host.appendChild(notesCard(player, host));
    host.appendChild(attendanceCard(player));
  }

  function refresh(host) { host.innerHTML = ""; render(host); }

  // Re-read the player and re-render just one card in place would be ideal, but a
  // full refresh keeps every derived bit (counts, trend, sort) honest and simple.
  function save(id, patch, host) {
    RR.roster.updatePlayer(id, patch);
    refresh(host);
  }

  // ---- Header (photo + identity) -------------------------------------------
  function headerCard(player, host) {
    var avatar = RR.photos.avatar(player, 96);

    var photoActions = h("div", { class: "pp-photo__actions" }, [
      photoBtn(RR.photos.has(player.id) ? "Change photo" : "Add photo", function () {
        RR.players.pickPhoto(function (dataUrl) {
          if (!RR.photos.set(player.id, dataUrl)) {
            ui.confirmToast("Couldn’t save the photo — storage is full.");
            return;
          }
          RR.roster.updatePlayer(player.id, { hasPhoto: true });
          refresh(host);
        });
      })
    ]);
    if (RR.photos.has(player.id)) {
      photoActions.appendChild(photoBtn("Remove", function () {
        RR.photos.remove(player.id);
        RR.roster.updatePlayer(player.id, { hasPhoto: false });
        refresh(host);
      }, true));
    }

    var meta = [];
    if (player.number) meta.push(h("span", { class: "pp-id__num", text: "#" + player.number }));
    if (player.position) {
      var coach = RR.positions && RR.positions.isCoachable(player.position);
      var chip = coach
        ? h("a", { class: "pp-id__pos pp-id__pos--link", href: "#positions",
            "aria-label": "Coaching for " + player.position }, [player.position, " →"])
        : h("span", { class: "pp-id__pos", text: player.position });
      if (coach) chip.addEventListener("click", function () {
        if (RR.positionsScreen && RR.positionsScreen.focus) RR.positionsScreen.focus(player.position);
      });
      meta.push(chip);
    }
    if (player.position2) meta.push(h("span", { class: "pp-id__pos2 muted", text: "2nd: " + player.position2 }));

    return h("section", { class: "card pp-header" }, [
      h("div", { class: "pp-photo" }, [h("span", { class: "pp-photo__frame" }, [avatar]), photoActions]),
      h("div", { class: "pp-id" }, [
        h("h2", { class: "pp-id__name", text: player.name }),
        h("div", { class: "pp-id__meta" }, meta)
      ])
    ]);
  }

  function photoBtn(label, fn, danger) {
    var b = h("button", { type: "button",
      class: "btn btn-ghost pp-photo__btn" + (danger ? " btn-danger" : "") }, [label]);
    b.addEventListener("click", fn);
    return b;
  }

  // ---- Position (primary + optional secondary) ------------------------------
  // Lets a coach assign or switch a player's position after they've been added —
  // the add form's position is optional, so this is where "No position yet" gets
  // fixed. Writes straight to RR.roster, so the squad's "By position" grouping,
  // the header chips and position-based drill picks all update on save.
  function positionCard(player, host) {
    var card = h("section", { class: "card pp-position" });
    var editing = false;

    function paint() {
      card.innerHTML = "";
      var editBtn = h("button", { type: "button", class: "btn-ghost pp-iconbtn",
        "aria-label": editing ? "Stop editing position" : "Edit position" },
        [h("span", { "aria-hidden": "true", html: ui.icon(editing
          ? '<path d="M18 6 6 18M6 6l12 12"/>'
          : '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>', 18) })]);
      editBtn.addEventListener("click", function () { editing = !editing; paint(); });
      card.appendChild(ui.sectionTitle("Position", editBtn, "h2"));
      card.appendChild(editing ? positionEditor() : positionView());
    }

    function positionView() {
      if (!player.position) {
        return h("p", { class: "muted",
          text: "No position set yet — assign one so this player shows up in the right group and gets role-specific drills. Tap edit to choose." });
      }
      var chips = [posChip(player.position, false)];
      if (player.position2) chips.push(posChip(player.position2, true));
      return h("div", { class: "pp-position__chips" }, chips);
    }

    // A position pill; the primary one links into Position coaching when the role
    // is coachable (mirrors the header chip), so the card is also a jump-off point.
    function posChip(pos, secondary) {
      var label = secondary ? [h("span", { class: "pp-position__tag muted", text: "2nd" }), pos] : [pos];
      if (!secondary && RR.positions && RR.positions.isCoachable(pos)) {
        var link = h("a", { class: "pp-position__chip pp-position__chip--link", href: "#positions",
          "aria-label": "Coaching for " + pos }, [pos, " →"]);
        link.addEventListener("click", function () {
          if (RR.positionsScreen && RR.positionsScreen.focus) RR.positionsScreen.focus(pos);
        });
        return link;
      }
      return h("span", { class: "pp-position__chip" + (secondary ? " pp-position__chip--2nd" : "") }, label);
    }

    function positionEditor() {
      var primary = RR.roster.positionSelect(player.position || "", "Primary position");
      var secondary = secondarySelect(player.position2 || "");

      var saveBtn = h("button", { type: "button", class: "btn btn-primary pp-position__save" }, ["Save position"]);
      saveBtn.addEventListener("click", function () {
        var pos = primary.value || "";
        var pos2 = secondary.value || "";
        // A secondary only makes sense alongside a (different) primary.
        if (!pos || pos2 === pos) pos2 = "";
        save(player.id, { position: pos, position2: pos2 }, host);
      });

      return h("div", { class: "pp-position__form" }, [
        h("div", { class: "field" }, [
          h("label", { class: "field-label", text: "Primary position" }), primary
        ]),
        h("div", { class: "field" }, [
          h("label", { class: "field-label", text: "Secondary position (optional)" }), secondary
        ]),
        saveBtn
      ]);
    }

    paint();
    return card;
  }

  // A secondary-position <select>: a "None" blank plus the real coachable roles
  // (no "Not sure yet" — a backup spot should be a concrete position).
  function secondarySelect(value) {
    var sel = h("select", { class: "input", "aria-label": "Secondary position (optional)" });
    sel.appendChild(h("option", { value: "", text: "None", selected: !value }));
    ((RR.positions && RR.positions.LIST) || []).forEach(function (pos) {
      sel.appendChild(h("option", { value: pos, text: pos, selected: pos === value }));
    });
    return sel;
  }

  // ---- Play details (hand / height / birthday) ------------------------------
  function detailsCard(player, host) {
    var card = h("section", { class: "card pp-details" });
    var editing = false;

    function paint() {
      card.innerHTML = "";
      var editBtn = h("button", { type: "button", class: "btn-ghost pp-iconbtn",
        "aria-label": editing ? "Stop editing details" : "Edit play details" },
        [h("span", { "aria-hidden": "true", html: ui.icon(editing
          ? '<path d="M18 6 6 18M6 6l12 12"/>'
          : '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>', 18) })]);
      editBtn.addEventListener("click", function () { editing = !editing; paint(); });
      card.appendChild(ui.sectionTitle("Play details", editBtn, "h2"));
      card.appendChild(editing ? detailsEditor() : detailsView());
    }

    function detailsView() {
      var rows = [
        ["Dominant hand", player.hand || "—"],
        ["Height", heightLabel(player.heightIn)],
        ["Birthday", player.birthday ? (ui.fmtFull(player.birthday) + ageSuffix(player.birthday)) : "—"]
      ];
      // Nothing set yet → a gentle prompt instead of a wall of dashes.
      if (!player.hand && !player.heightIn && !player.birthday) {
        return h("p", { class: "muted", text: "Add the player’s hand, height and birthday — useful context when picking positions. Tap edit to start." });
      }
      return h("dl", { class: "pp-dl" }, rows.map(function (r) {
        return h("div", { class: "pp-dl__row" }, [
          h("dt", { text: r[0] }), h("dd", { text: r[1] })
        ]);
      }));
    }

    function detailsEditor() {
      var hand = h("select", { class: "input", "aria-label": "Dominant hand" });
      ["", "Right", "Left"].forEach(function (v) {
        hand.appendChild(h("option", { value: v, text: v || "Dominant hand", selected: (player.hand || "") === v }));
      });
      var ft = numInput(Math.floor((player.heightIn || 0) / 12) || "", "Feet", 0, 8);
      var inch = numInput((player.heightIn ? player.heightIn % 12 : "") , "Inches", 0, 11);
      var bday = h("input", { type: "date", class: "input datefield", value: player.birthday || "",
        "aria-label": "Birthday" });

      var saveBtn = h("button", { type: "button", class: "btn btn-primary pp-details__save" }, ["Save details"]);
      saveBtn.addEventListener("click", function () {
        var f = parseInt(ft.value, 10), i = parseInt(inch.value, 10);
        var heightIn = (isNaN(f) && isNaN(i)) ? null : (((isNaN(f) ? 0 : f) * 12) + (isNaN(i) ? 0 : i));
        save(player.id, {
          hand: hand.value || "",
          heightIn: heightIn,
          birthday: bday.value || ""
        }, host);
      });

      return h("div", { class: "pp-details__form" }, [
        h("div", { class: "field" }, [h("label", { class: "field-label", text: "Dominant hand" }), hand]),
        h("div", { class: "field" }, [
          h("span", { class: "field-label", text: "Height" }),
          h("div", { class: "pp-height" }, [
            ft, h("span", { class: "pp-height__u", text: "ft" }),
            inch, h("span", { class: "pp-height__u", text: "in" })
          ])
        ]),
        h("div", { class: "field" }, [h("label", { class: "field-label", text: "Birthday" }), bday]),
        saveBtn
      ]);
    }

    paint();
    return card;
  }

  function numInput(value, label, min, max) {
    return h("input", { type: "number", class: "input pp-num", inputmode: "numeric",
      value: (value === 0 ? "0" : (value || "")), min: String(min), max: String(max),
      "aria-label": label, placeholder: label });
  }
  function heightLabel(inches) {
    if (!inches) return "—";
    return Math.floor(inches / 12) + "'" + (inches % 12) + '"';
  }
  function ageSuffix(iso) {
    var d = parseISO(iso); if (!d) return "";
    var now = new Date();
    var age = now.getFullYear() - d.getFullYear();
    var m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return (age >= 0 && age < 100) ? "  ·  Age " + age : "";
  }
  function parseISO(iso) {
    if (!iso) return null;
    var p = String(iso).split("-");
    return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null;
  }

  // ---- Skill tracker --------------------------------------------------------
  function skillsCard(player, host) {
    var skills = player.skills || {};
    var log = Array.isArray(player.skillLog) ? player.skillLog : [];
    var card = h("section", { class: "card pp-skills" }, [
      ui.sectionTitle("Skill tracker", trendBadge(skills, log), "h2"),
      h("p", { class: "muted pp-skills__hint", text: "Tap to rate each skill 0–5. We log it so you can see growth over the season." })
    ]);

    SKILLS.forEach(function (skill) {
      card.appendChild(skillRow(player, skill, skills[skill] || 0, host));
    });
    return card;
  }

  function skillRow(player, skill, value, host) {
    var color = ui.skillColor(skill);
    var dotsWrap = h("div", { class: "pp-skill__dots", role: "group",
      "aria-label": skill + " rating, " + value + " of " + SKILL_MAX });
    for (var i = 1; i <= SKILL_MAX; i++) {
      (function (n) {
        var on = n <= value;
        var dot = h("button", { type: "button",
          class: "pp-skill__dot dot " + (on ? "dot--on dot--" + color : "dot--off"),
          "aria-label": "Set " + skill + " to " + n, "aria-pressed": on ? "true" : "false" });
        dot.addEventListener("click", function () {
          // Tapping the current value again clears back to that minus one (so you
          // can lower a rating); otherwise set to the tapped value.
          var next = (n === value) ? n - 1 : n;
          applySkill(player, skill, next, host);
        });
        dotsWrap.appendChild(dot);
      })(i);
    }
    return h("div", { class: "pp-skill" }, [
      h("span", { class: "pp-skill__name", text: skill }),
      dotsWrap,
      h("span", { class: "pp-skill__val", text: value + "/" + SKILL_MAX })
    ]);
  }

  function applySkill(player, skill, value, host) {
    var skills = Object.assign({}, player.skills || {});
    skills[skill] = Math.max(0, Math.min(SKILL_MAX, value));
    var log = recordSnapshot(player.skillLog, skills);
    save(player.id, { skills: skills, skillLog: log }, host);
  }

  // Keep one snapshot per calendar day (today's is replaced as ratings change),
  // capped to the most recent 24, so the trend has history without unbounded growth.
  function recordSnapshot(log, skills) {
    log = Array.isArray(log) ? log.slice() : [];
    var today = isoToday();
    var copy = JSON.parse(JSON.stringify(skills));
    if (log.length && log[log.length - 1].date === today) {
      log[log.length - 1] = { date: today, skills: copy };
    } else {
      log.push({ date: today, skills: copy });
    }
    if (log.length > 24) log = log.slice(log.length - 24);
    return log;
  }

  function isoToday() {
    var d = new Date();
    function p(n) { return (n < 10 ? "0" : "") + n; }
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  // Overall improvement since the earliest snapshot that predates today.
  function trendBadge(skills, log) {
    if (!log || log.length < 2) return null;
    var first = log[0];
    if (first.date === isoToday()) return null;
    var nowSum = 0, thenSum = 0;
    SKILLS.forEach(function (s) {
      nowSum += (skills[s] || 0);
      thenSum += (first.skills && first.skills[s]) || 0;
    });
    var delta = nowSum - thenSum;
    if (delta <= 0) return null;
    return h("span", { class: "pill pp-trend",
      text: "▲ +" + delta + " since " + ui.fmtShort(first.date) });
  }

  // ---- Focus goals ----------------------------------------------------------
  function goalsCard(player, host) {
    var goals = Array.isArray(player.goals) ? player.goals : [];
    var card = h("section", { class: "card pp-goals" }, [ui.sectionTitle("Focus goals", null, "h2")]);

    var input = h("input", { type: "text", class: "input", placeholder: "e.g. Land 7/10 overhand serves",
      "aria-label": "New focus goal" });
    function add() {
      var text = input.value.trim();
      if (!text) { input.focus(); return; }
      var next = goals.concat([{ id: RR.state.genId("goal"), text: text, done: false }]);
      save(player.id, { goals: next }, host);
    }
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); add(); } });
    var addBtn = h("button", { type: "button", class: "btn btn-primary pp-goals__add",
      "aria-label": "Add goal" }, [h("span", { "aria-hidden": "true", html: ui.icon('<path d="M12 5v14M5 12h14"/>', 18) })]);
    addBtn.addEventListener("click", add);
    card.appendChild(h("div", { class: "pp-goals__add-row" }, [input, addBtn]));

    if (!goals.length) {
      card.appendChild(h("p", { class: "muted", text: "No goals yet — set one or two clear targets for this player." }));
      return card;
    }

    var ul = h("ul", { class: "list pp-goal-list" });
    goals.forEach(function (g) { ul.appendChild(goalRow(player, goals, g, host)); });
    card.appendChild(ul);
    return card;
  }

  function goalRow(player, goals, g, host) {
    var toggle = h("button", { type: "button",
      class: "pp-goal__check" + (g.done ? " is-done" : ""),
      role: "checkbox", "aria-checked": g.done ? "true" : "false",
      "aria-label": (g.done ? "Mark not done: " : "Mark done: ") + g.text },
      [h("span", { "aria-hidden": "true", html: ui.icon('<path d="M5 12l5 5L20 7"/>', 16) })]);
    toggle.addEventListener("click", function () {
      var next = goals.map(function (x) { return x.id === g.id ? Object.assign({}, x, { done: !x.done }) : x; });
      save(player.id, { goals: next }, host);
    });
    var del = h("button", { type: "button", class: "btn-ghost pp-iconbtn pp-iconbtn--danger",
      "aria-label": "Delete goal: " + g.text },
      [h("span", { "aria-hidden": "true", html: ui.icon('<path d="M4 7h16M9 7V5h6v2M7 7l1 13h8l1-13"/>', 16) })]);
    del.addEventListener("click", function () {
      save(player.id, { goals: goals.filter(function (x) { return x.id !== g.id; }) }, host);
    });
    return h("li", { class: "row pp-goal" + (g.done ? " is-done" : "") }, [
      toggle,
      h("span", { class: "pp-goal__text", text: g.text }),
      del
    ]);
  }

  // ---- Coaching notes -------------------------------------------------------
  function notesCard(player, host) {
    var notes = Array.isArray(player.notes) ? player.notes.slice() : [];
    notes.sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
    var card = h("section", { class: "card pp-notes" }, [ui.sectionTitle("Coaching notes", null, "h2")]);

    var ta = h("textarea", { class: "input pp-notes__input", rows: "2",
      placeholder: "Add a note — what to praise, what to work on…", "aria-label": "New coaching note" });
    var addBtn = h("button", { type: "button", class: "btn btn-primary pp-notes__add" }, ["Add note"]);
    addBtn.addEventListener("click", function () {
      var text = ta.value.trim();
      if (!text) { ta.focus(); return; }
      var next = (player.notes || []).concat([{ id: RR.state.genId("note"), ts: Date.now(), text: text }]);
      save(player.id, { notes: next }, host);
    });
    card.appendChild(h("div", { class: "pp-notes__add-row" }, [ta, addBtn]));

    if (!notes.length) {
      card.appendChild(h("p", { class: "muted", text: "No notes yet — jot the first one after practice." }));
      return card;
    }
    var list = h("ul", { class: "pp-note-list" });
    notes.forEach(function (n) { list.appendChild(noteRow(player, n, host)); });
    card.appendChild(list);
    return card;
  }

  function noteRow(player, note, host) {
    var li = h("li", { class: "pp-note" });

    function viewMode() {
      li.innerHTML = "";
      li.appendChild(h("div", { class: "pp-note__head" }, [
        h("time", { class: "pp-note__ts", text: noteDate(note.ts) }),
        h("div", { class: "pp-note__tools" }, [
          iconBtn('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>', "Edit note", editMode),
          iconBtn('<path d="M4 7h16M9 7V5h6v2M7 7l1 13h8l1-13"/>', "Delete note", function () {
            save(player.id, { notes: (player.notes || []).filter(function (x) { return x.id !== note.id; }) }, host);
          }, true)
        ])
      ]));
      li.appendChild(h("p", { class: "pp-note__text", text: note.text }));
    }
    function editMode() {
      li.innerHTML = "";
      var ta = h("textarea", { class: "input pp-note__edit", rows: "3", "aria-label": "Edit note" });
      ta.value = note.text;
      var saveB = h("button", { type: "button", class: "btn btn-primary pp-note__savebtn" }, ["Save"]);
      saveB.addEventListener("click", function () {
        var text = ta.value.trim();
        if (!text) { ta.focus(); return; }
        save(player.id, {
          notes: (player.notes || []).map(function (x) {
            return x.id === note.id ? Object.assign({}, x, { text: text, ts: x.ts || Date.now() }) : x;
          })
        }, host);
      });
      var cancelB = h("button", { type: "button", class: "btn btn-ghost" }, ["Cancel"]);
      cancelB.addEventListener("click", viewMode);
      li.appendChild(ta);
      li.appendChild(h("div", { class: "pp-note__editactions" }, [cancelB, saveB]));
      ta.focus();
    }
    function iconBtn(path, label, fn, danger) {
      var b = h("button", { type: "button", class: "btn-ghost pp-iconbtn" + (danger ? " pp-iconbtn--danger" : ""),
        "aria-label": label }, [h("span", { "aria-hidden": "true", html: ui.icon(path, 16) })]);
      b.addEventListener("click", fn);
      return b;
    }

    viewMode();
    return li;
  }

  function noteDate(ts) {
    if (!ts) return "";
    var d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  // ---- Attendance -----------------------------------------------------------
  function attendanceCard(player) {
    var att = RR.roster.attendanceHistory(player.id);
    var card = h("section", { class: "card pp-att" }, [ui.sectionTitle("Attendance", null, "h2")]);
    if (!att.total) {
      card.appendChild(h("p", { class: "muted",
        text: "No completed practices yet. Mark a practice complete on the Today tab to start tracking attendance." }));
      return card;
    }
    var pct = Math.round(att.rate * 100);
    card.appendChild(h("p", { class: "pp-att__summary" }, [
      h("strong", { text: "Present at " + att.present + " of " + att.total + " practices" }),
      h("span", { class: "muted", text: "  ·  " + pct + "%" })
    ]));
    var recent = h("ul", { class: "pp-att__recent" }, att.recent.map(function (r) {
      return h("li", { class: "pp-att__chip " + (r.present ? "is-present" : "is-absent"),
        title: (r.present ? "Present" : "Absent") + " — " + ui.fmtFull(r.date) }, [
        h("span", { class: "pp-att__dot", "aria-hidden": "true" }),
        h("span", { text: ui.fmtShort(r.date) }),
        h("span", { class: "pp-att__sr", text: r.present ? " present" : " absent" })
      ]);
    }));
    card.appendChild(h("p", { class: "eyebrow", text: "Most recent" }));
    card.appendChild(recent);
    return card;
  }

  return {
    open: open,
    render: render,
    refresh: refresh
  };
})();
