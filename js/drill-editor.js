// drill-editor.js — the "your own drill" form (RR.drillEditor.render).
//
// Coaches have go-to drills RallyReady doesn't ship. This renders an add/edit
// form for a coach-authored drill; on save it persists through RR.state
// (addCustomDrill / updateCustomDrill), which merges it into the live RR.drills
// library so it shows up in the browser AND can be picked by the generator.
//
// PRESENTATION ONLY: no persistence logic of its own beyond calling RR.state.
// Colours are semantic tokens (styles in css/features.css) so it reads in both
// themes. The "Watch how" link is derived from the name via RR.drillVideoSearch,
// keeping the LINKS standard (a YouTube SEARCH, never a guessed id).
window.RR = window.RR || {};

RR.drillEditor = (function () {
  "use strict";

  var h = RR.ui.h;

  var SKILLS = ["Warmup", "Ball Control", "Passing", "Setting", "Serving",
    "Hitting", "Blocking", "Defense", "Team Play", "Cooldown"];
  var EQUIPMENT = [
    { token: "balls", label: "Volleyballs" }, { token: "net", label: "Net" },
    { token: "cones", label: "Cones" }, { token: "wall", label: "A wall" },
    { token: "bands", label: "Resistance bands" }, { token: "mini bands", label: "Mini bands" },
    { token: "agility ladder", label: "Agility ladder" }, { token: "jump ropes", label: "Jump ropes" },
    { token: "medicine ball", label: "Medicine ball" }, { token: "reaction ball", label: "Reaction ball" },
    { token: "hoops", label: "Hoops / targets" }, { token: "foam roller", label: "Foam roller" },
    { token: "box", label: "Plyo box" }, { token: "mats", label: "Mats" }
  ];
  var AGES = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  // The empty drill the form starts from when adding a new one.
  function blank() {
    return {
      name: "", skill: "Passing", ageMin: 8, ageMax: 18, difficulty: 2,
      minPlayers: 2, durationMin: 10, isGame: false, isStaple: false, campFriendly: false,
      equipment: ["balls"], setup: "", steps: [], cues: [], easier: "", harder: ""
    };
  }

  // Split a textarea into trimmed, non-empty lines (steps / cues).
  function lines(text) {
    return String(text || "").split("\n")
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length; });
  }

  // render(host, opts) — opts.drill (edit) or none (add); opts.onSave(id), opts.onCancel().
  function render(host, opts) {
    opts = opts || {};
    var editing = !!opts.drill;
    var form = Object.assign(blank(), opts.drill ? JSON.parse(JSON.stringify(opts.drill)) : {});
    if (!Array.isArray(form.equipment)) form.equipment = [];

    function labelled(text, control, hint) {
      var id = "de-" + text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      control.id = control.id || id;
      var kids = [h("label", { for: control.id, text: text })];
      if (hint) kids.push(h("p", { class: "field-hint", text: hint }));
      kids.push(control);
      return h("div", { class: "field" }, kids);
    }

    function input(key, attrs) {
      var el = h("input", Object.assign({ class: "input", value: form[key] != null ? form[key] : "" }, attrs || {}));
      el.addEventListener("input", function () { form[key] = el.value; });
      return el;
    }
    function area(key, rows) {
      var el = h("textarea", { class: "input de-area", rows: String(rows || 3) });
      el.value = Array.isArray(form[key]) ? form[key].join("\n") : (form[key] || "");
      el.addEventListener("input", function () { form[key] = el.value; });
      return el;
    }
    function num(key, min, max) {
      var el = h("input", { class: "input", type: "number", min: String(min), max: String(max),
        value: String(form[key]), inputmode: "numeric" });
      el.addEventListener("input", function () {
        var v = parseInt(el.value, 10); if (!isNaN(v)) form[key] = v;
      });
      return el;
    }
    function ageSelect(key) {
      var sel = h("select", { class: "input" });
      AGES.forEach(function (a) { sel.appendChild(h("option", { value: String(a), text: String(a), selected: form[key] === a })); });
      sel.addEventListener("change", function () { form[key] = parseInt(sel.value, 10); });
      return sel;
    }
    function skillSelect() {
      var sel = h("select", { class: "input" });
      SKILLS.forEach(function (s) { sel.appendChild(h("option", { value: s, text: s, selected: form.skill === s })); });
      sel.addEventListener("change", function () { form.skill = sel.value; });
      return sel;
    }
    function diffSeg() {
      var group = h("div", { class: "segmented", role: "radiogroup", "aria-label": "Difficulty" });
      [1, 2, 3, 4, 5].forEach(function (d) {
        var on = form.difficulty === d;
        var b = h("button", { type: "button", class: "seg" + (on ? " is-on" : ""),
          role: "radio", "aria-checked": on ? "true" : "false", text: String(d) });
        b.addEventListener("click", function () {
          form.difficulty = d;
          Array.prototype.forEach.call(group.children, function (c, i) {
            var sel = (i + 1) === d;
            c.classList.toggle("is-on", sel); c.setAttribute("aria-checked", sel ? "true" : "false");
          });
        });
        group.appendChild(b);
      });
      return group;
    }
    function equipChips() {
      var row = h("div", { class: "chips", role: "group" });
      EQUIPMENT.forEach(function (item) {
        var on = form.equipment.indexOf(item.token) !== -1;
        var b = h("button", { type: "button", class: "chip" + (on ? " is-on" : ""),
          "aria-pressed": on ? "true" : "false", text: item.label });
        b.addEventListener("click", function () {
          var i = form.equipment.indexOf(item.token);
          if (i === -1) form.equipment.push(item.token); else form.equipment.splice(i, 1);
          var nowOn = form.equipment.indexOf(item.token) !== -1;
          b.classList.toggle("is-on", nowOn); b.setAttribute("aria-pressed", nowOn ? "true" : "false");
        });
        row.appendChild(b);
      });
      return row;
    }
    function checkbox(key, text) {
      var wrap = h("label", { class: "de-check" });
      var box = h("input", { type: "checkbox" });
      box.checked = !!form[key];
      box.addEventListener("change", function () { form[key] = box.checked; });
      wrap.appendChild(box);
      wrap.appendChild(h("span", { text: text }));
      return wrap;
    }

    var nameInput = input("name", { type: "text", maxlength: "60", placeholder: "e.g. Queen of the Court" });
    var errEl = h("p", { class: "field-error", role: "alert", hidden: true }, [
      h("span", { text: "Give your drill a name and pick a skill." })
    ]);

    var formEl = h("form", { class: "team-form de-form", novalidate: "novalidate",
      onsubmit: function (e) { e.preventDefault(); save(); } }, [
      labelled("Drill name", nameInput),
      errEl,
      labelled("Skill", skillSelect(), "Which category it belongs to."),
      h("div", { class: "de-grid" }, [
        labelled("Youngest age", ageSelect("ageMin")),
        labelled("Oldest age", ageSelect("ageMax"))
      ]),
      labelled("Difficulty", diffSeg(), "1 = beginner, 5 = advanced."),
      h("div", { class: "de-grid" }, [
        labelled("Min players", num("minPlayers", 1, 30)),
        labelled("Minutes", num("durationMin", 5, 60))
      ]),
      h("div", { class: "de-flags" }, [checkbox("isGame", "It's a game"), checkbox("campFriendly", "Camp-friendly")]),
      labelled("Equipment", equipChips()),
      labelled("Setup", area("setup", 3), "How to set the court / players up."),
      labelled("Steps", area("steps", 5), "How to run it — one step per line."),
      labelled("Coaching cues", area("cues", 4), "What to say — one cue per line."),
      h("div", { class: "de-grid" }, [
        labelled("Make it easier", area("easier", 2)),
        labelled("Make it harder", area("harder", 2))
      ])
    ]);

    var saveBtn = h("button", { type: "button", class: "btn btn-primary" }, [editing ? "Save changes" : "Add drill"]);
    saveBtn.addEventListener("click", save);
    var cancelBtn = h("button", { type: "button", class: "btn btn-ghost" }, ["Cancel"]);
    cancelBtn.addEventListener("click", function () { if (opts.onCancel) opts.onCancel(); });

    host.appendChild(h("section", { class: "card de-card" }, [
      RR.ui.sectionTitle(editing ? "Edit your drill" : "Add your own drill", null, "h2"),
      formEl,
      h("div", { class: "de-actions" }, [cancelBtn, saveBtn])
    ]));

    function save() {
      var name = (form.name || "").trim();
      if (!name || !form.skill) { errEl.hidden = false; nameInput.focus(); return; }
      if (form.ageMin > form.ageMax) { var t = form.ageMin; form.ageMin = form.ageMax; form.ageMax = t; }
      var drill = {
        name: name, skill: form.skill,
        ageMin: form.ageMin, ageMax: form.ageMax, difficulty: form.difficulty,
        minPlayers: form.minPlayers || 1, durationMin: form.durationMin || 10,
        isGame: !!form.isGame, isStaple: false, campFriendly: !!form.campFriendly,
        equipment: form.equipment.slice(),
        setup: (form.setup || "").trim(),
        steps: lines(form.steps), cues: lines(form.cues),
        easier: (form.easier || "").trim() || "Slow it down or shorten it.",
        harder: (form.harder || "").trim() || "Add a target, a score, or game speed.",
        videoSearchUrl: (RR.drillVideoSearch ? RR.drillVideoSearch(name)
          : "https://www.youtube.com/results?search_query=" + encodeURIComponent("how to " + name + " volleyball"))
      };
      var id;
      if (editing) { id = opts.drill.id; RR.state.updateCustomDrill(id, drill); }
      else { id = RR.state.addCustomDrill(drill); }
      RR.ui.confirmToast(editing ? "Drill updated." : "Drill added to your library. 🏐");
      if (opts.onSave) opts.onSave(id);
    }
  }

  return { render: render };
})();
