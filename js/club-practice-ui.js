// Mobile-first practice builder and courtside plan view.
window.RR = window.RR || {};

RR.clubPracticeUI = (function () {
  "use strict";

  var h = RR.ui.h;
  var draft = { age: "", minutes: "", variation: 0, plan: null, page: "builder", returnPage: "builder" };
  var glyphs = {
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    back: '<path d="M20 12H5m6 6-6-6 6-6"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    bookmark: '<path d="M6 5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v15l-6-4-6 4z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
    play: '<path d="m8 5 11 7-11 7z"/>',
    repeat: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M7 8a6 6 0 0 1 10-2l3 3M4 15l3 3a6 6 0 0 0 10-2"/>',
    edit: '<path d="M12 5H5v14h14v-7M11 13l1-4 6-6 3 3-6 6-4 1Z"/>',
    share: '<path d="M12 15V3m-4 4 4-4 4 4M6 11H4v9h16v-9h-2"/>',
    print: '<path d="M7 8V3h10v5M7 17H4V8h16v9h-3M7 14h10v7H7zM16 11h1"/>',
    trash: '<path d="M4 6h16M9 6V3h6v3m-9 0 1 14h10l1-14M10 10v6m4-6v6"/>'
  };

  function icon(key, className) {
    return h("span", { class: className || "cp-icon", html: RR.ui.icon(glyphs[key], 20) });
  }

  function button(label, key, action, onClick, options) {
    options = options || {};
    return h("button", {
      type: options.type || "button",
      class: "cp-button" + (options.className ? " " + options.className : ""),
      "data-action": action,
      "aria-label": options.iconOnly ? label : null,
      title: options.iconOnly ? label : null,
      onclick: onClick
    }, [key ? icon(key) : null, options.iconOnly ? null : h("span", { text: label })]);
  }

  function heading(text, id) {
    return h("h1", { id: id, class: "screen-title cp-title", tabindex: "-1", text: text });
  }

  function paragraph(className, text) {
    return h("p", { class: className, text: text });
  }

  function duration(minutes) {
    return h("span", { class: "cp-duration" }, [h("span", { text: minutes }), " ", h("span", { text: "min" })]);
  }

  function heroContent(title, lead, controls) {
    return h("header", { class: "cp-hero" }, [
      h("div", { class: "cp-court", "aria-hidden": "true" }, h("span")),
      h("div", { class: "cp-hero__copy" }, [
        heading(title, "club-practice-title"),
        paragraph("cp-hero__lead", lead),
        controls
      ])
    ]);
  }

  function references() {
    return h("details", { class: "cp-references" }, [
      h("summary", null, [h("span", { text: "Coaching references" }), icon("chevron")]),
      h("ul", null, RR.clubPractice.sources.map(function (source) {
        return h("li", null, h("a", { href: source.url, target: "_blank", rel: "noopener", text: source.label }));
      }))
    ]);
  }

  function builder(navigation) {
    var engine = RR.clubPractice;
    var ageOptions = h("div", { class: "cp-age-options" }, engine.ageGroups.map(function (age, index) {
      var id = "club-practice-age-" + age;
      var radio = h("input", {
        type: "radio", name: "club-age", id: id, value: age, required: index === 0,
        checked: draft.age === age,
        onchange: function () { draft.age = age; }
      });
      return h("div", { class: "cp-age-option" }, [radio, h("label", { for: id, text: age })]);
    }));

    var timeInput = h("input", {
      id: "club-practice-minutes", class: "cp-minute-input", type: "number", inputmode: "numeric",
      name: "club-minutes", min: engine.minMinutes, max: engine.maxMinutes, step: "1", required: true,
      value: draft.minutes, placeholder: "–", "aria-describedby": "club-practice-time-help"
    });
    var presets = engine.durationOptions.map(function (minutes) {
      return h("button", {
        class: "cp-preset", type: "button", "data-duration": minutes, "aria-pressed": Number(draft.minutes) === minutes ? "true" : "false",
        onclick: function () {
          timeInput.value = minutes;
          timeInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }, duration(minutes));
    });
    var error = paragraph("cp-form-error", "");
    error.setAttribute("role", "alert");
    timeInput.addEventListener("input", function () {
      draft.minutes = timeInput.value;
      presets.forEach(function (preset) {
        preset.setAttribute("aria-pressed", String(Number(draft.minutes) === Number(preset.dataset.duration)));
      });
      error.textContent = "";
    });

    var heroActions = [button("Saved practices", "bookmark", "saved", navigation.saved, { className: "cp-button--hero" })];
    if (draft.plan) heroActions.push(button("Back to practice", "back", "resume", navigation.resume, { className: "cp-button--hero" }));

    return [
      heroContent("Club Practice", "A full volleyball practice for your team, built around the time you have.",
        h("div", { class: "cp-hero__actions" }, heroActions)),
      h("form", {
        class: "cp-form",
        onsubmit: function (event) {
          event.preventDefault();
          if (!navigation.generate()) error.textContent = "Choose an age group and enter a valid practice length.";
        }
      }, [
        h("div", { class: "cp-form__fields" }, [
          h("fieldset", { class: "cp-field" }, [h("legend", { text: "Age group" }), ageOptions]),
          h("div", { class: "cp-field cp-time-field" }, [
            h("div", { class: "cp-time-field__top" }, [
              h("label", { for: "club-practice-minutes", text: "Time available" }),
              h("div", { class: "cp-time-input-wrap" }, [timeInput, h("span", { text: "min", "aria-hidden": "true" })])
            ]),
            h("div", { class: "cp-presets", role: "group", "aria-label": "Time presets" }, presets),
            h("p", { id: "club-practice-time-help", class: "cp-hint" }, [
              h("span", { text: "Pick a time or enter your own" }), " (", engine.minMinutes, "–", engine.maxMinutes, " ", h("span", { text: "min" }), ")."
            ])
          ])
        ]),
        error,
        h("div", { class: "cp-form__footer" },
          button("Generate practice", "arrow", "generate", null, { type: "submit", className: "cp-button--primary cp-generate" }))
      ]),
      references()
    ];
  }

  function brief(plan) {
    var objectives = plan.objectives || [];
    var gear = plan.equipment || [];
    var adaptations = plan.adaptations || [];
    return h("details", { class: "cp-brief", open: window.matchMedia && window.matchMedia("(min-width: 860px)").matches }, [
      h("summary", null, [
        h("span", null, [h("span", { class: "cp-brief__title", text: "Practice brief" }),
          h("span", { class: "cp-brief__caption", text: "Objectives, equipment, and attendance adjustments" })]),
        icon("chevron", "cp-chevron")
      ]),
      h("div", { class: "cp-brief__body" }, [
        plan.coachNote ? paragraph("cp-coach-note", plan.coachNote) : null,
        plan.setup ? h("section", { class: "cp-brief__section" }, [h("h3", { text: "Before practice" }), paragraph("cp-brief__text", plan.setup)]) : null,
        objectives.length ? h("section", { class: "cp-brief__section" }, [
          h("h3", { text: "Success targets" }),
          h("dl", null, objectives.map(function (item) { return [h("dt", { text: item.label }), h("dd", { text: item.target })]; }))
        ]) : null,
        gear.length ? h("section", { class: "cp-brief__section" }, [
          h("h3", { text: "Equipment" }), h("ul", { class: "cp-equipment" }, gear.map(function (item) { return h("li", { text: item }); }))
        ]) : null,
        adaptations.length ? h("section", { class: "cp-brief__section" }, [
          h("h3", { text: "Adjust for your gym" }),
          h("dl", null, adaptations.map(function (item) { return [h("dt", { text: item.label }), h("dd", { text: item.description })]; }))
        ]) : null
      ])
    ]);
  }

  function blockSection(title, content) {
    if (!content || (Array.isArray(content) && !content.length)) return null;
    return h("section", { class: "cp-block__section" }, [h("h3", { text: title }),
      typeof content === "string" ? paragraph(null, content) : content]);
  }

  function items(tag, contents) {
    if (!contents || !contents.length) return null;
    return h(tag, null, contents.map(function (line) { return h("li", { text: line }); }));
  }

  function drillGear(gear) {
    return (gear || []).map(function (item) {
      var label = RR.ui.equipLabel(item);
      return RR.i18n ? RR.i18n.t(label) : label;
    }).join(", ");
  }

  var openDisclosures = new Set();

  function rememberDisclosure(details, key) {
    if (!key) return details;
    details.open = openDisclosures.has(key);
    details.addEventListener("toggle", function () {
      if (!details.isConnected) return;
      if (details.open) openDisclosures.add(key);
      else openDisclosures.delete(key);
    });
    return details;
  }

  function coachingDetails(drill, key) {
    var notes = Array.isArray(drill.coaching) ? drill.coaching : [];
    if (!notes.length && !drill.easier && !drill.harder && !drill.equipment.length) return null;
    return rememberDisclosure(h("details", { class: "cp-coaching" }, [
      h("summary", null, [h("span", { text: "Coaching details" }), icon("chevron", "cp-chevron")]),
      h("div", { class: "cp-coaching__body" }, [
        notes.length ? h("dl", { class: "cp-coaching__notes" }, notes.map(function (item) {
          return [h("dt", { text: item.label }), h("dd", { text: item.text })];
        })) : null,
        drill.easier || drill.harder ? h("div", { class: "cp-adjustments" }, [
          blockSection("Make it easier", drill.easier), blockSection("Increase the challenge", drill.harder)
        ]) : null,
        blockSection("Equipment", drillGear(drill.equipment))
      ])
    ]), key);
  }

  function blockDetails(plan, block) {
    var drill = block.drill;
    var role = block.role || "";
    var map = RR.clubPracticeCourt && RR.clubPracticeCourt.figure(plan, block, plan.language);
    var details = h("details", { class: "cp-block", "data-role": role.toLowerCase(), "data-block-key": block.blockKey }, [
      h("summary", { class: "cp-block__summary" }, [
        h("span", { class: "cp-block__clock" }, duration(block.startMinute + "–" + block.endMinute)),
        h("span", { class: "cp-block__identity" }, [
          h("span", { class: "cp-block__role", text: role }),
          h("span", { class: "cp-block__title", text: block.title || drill.name })
        ]),
        h("span", { class: "cp-block__minutes" }, duration(block.minutes)),
        icon("chevron", "cp-chevron")
      ]),
      h("div", { class: "cp-block__body" }, [
        block.why ? paragraph("cp-block__why", block.why) : null,
        map,
        blockSection("Set up", drill.setup),
        blockSection("Run it", items("ol", drill.steps)),
        blockSection("Scoring and success", drill.scoring),
        blockSection("Coach cues", items("ul", drill.cues)),
        coachingDetails(drill, block.id + "-coaching")
      ])
    ]);
    return h("li", null, rememberDisclosure(details, block.id));
  }

  function timeline(plan) {
    return h("section", { class: "cp-timeline", "aria-labelledby": "club-practice-timeline" }, [
      h("div", { class: "cp-timeline__header" }, [
        h("h2", { id: "club-practice-timeline", text: "Timeline" }),
        h("span", { class: "cp-timeline__total" }, [icon("clock"), duration(plan.totalMinutes)])
      ]),
      paragraph("cp-timeline__hint", "Open a drill for the court map and steps."),
      h("ol", { class: "cp-block-list" }, plan.blocks.map(function (block) { return blockDetails(plan, block); }))
    ]);
  }

  function result(plan, actions, navigation) {
    var saved = actions.isSaved && actions.isSaved(plan);
    var status = h("p", { class: "cp-sr-only", role: "status" });
    var saveButton = actions.onSave ? button(saved ? "Saved" : "Save", saved ? "check" : "bookmark", "save", function () {
      if (!actions.onSave(plan)) return;
      saveButton.replaceChildren(icon("check"), h("span", { text: "Saved" }));
      saveButton.disabled = true;
      status.textContent = "Practice saved.";
    }) : null;
    if (saved && saveButton) saveButton.disabled = true;

    return [
      h("div", { class: "cp-plan-tools" }, [
        button("Change inputs", "edit", "edit", navigation.edit, { className: "cp-button--quiet" }),
        button("Saved practices", "bookmark", "saved", navigation.saved, { className: "cp-button--quiet" })
      ]),
      h("header", { class: "cp-plan-header" }, [
        h("div", { class: "cp-court", "aria-hidden": "true" }, h("span")),
        h("div", { class: "cp-plan-header__content" }, [
          h("p", { class: "cp-plan-header__meta" }, [h("span", { text: plan.ageGroup }), h("span", { "aria-hidden": "true", text: "•" }), duration(plan.totalMinutes)]),
          heading(plan.title || plan.skillFocus, "club-practice-plan-title"),
          plan.focusReminder ? paragraph("cp-hero__lead", plan.focusReminder) : null,
          button("Another practice", "repeat", "another", navigation.another, { className: "cp-button--hero" })
        ])
      ]),
      h("div", { class: "cp-dock", role: "group", "aria-label": "Practice actions" }, [
        actions.onRun ? button("Run practice", "play", "run", function () { actions.onRun(plan); }, { className: "cp-button--primary cp-dock__run" }) : null,
        saveButton,
        actions.onShare ? button("Share practice", "share", "share", function () { actions.onShare(plan); }, { iconOnly: true }) : null,
        actions.onPrint ? button("Print practice", "print", "print", function () { actions.onPrint(plan); }, { iconOnly: true }) : null,
        status
      ]),
      h("div", { class: "cp-plan-layout" }, [brief(plan), timeline(plan)])
    ];
  }

  function savedView(actions, navigation, language) {
    var plans = actions.savedPlans ? actions.savedPlans() : [];
    return [
      heroContent("Saved practices", "Reopen a plan whenever you’re ready to coach it.",
        button(draft.returnPage === "result" ? "Back to practice" : "Back to builder", "back", "back", navigation.back, { className: "cp-button--hero" })),
      plans.length ? h("ul", { class: "cp-saved-list" }, plans.map(function (stored) {
        var plan = RR.clubPractice.localize(stored, language);
        return h("li", { class: "cp-saved-item" }, [
          h("button", { class: "cp-button cp-saved-item__open", type: "button", "data-action": "reopen", onclick: function () { navigation.reopen(plan); } }, [
            h("span", null, [
              h("span", { class: "cp-saved-item__meta" }, [plan.ageGroup, " · ", duration(plan.totalMinutes)]),
              h("span", { class: "cp-saved-item__name", text: plan.title || plan.skillFocus })
            ]), icon("arrow")
          ]),
          button((language === "ro" ? "Șterge " : "Remove ") + (plan.title || plan.skillFocus), "trash", "remove", function () {
            if (actions.onRemove && actions.onRemove(plan)) navigation.removed();
          }, { iconOnly: true, className: "cp-saved-item__remove" })
        ]);
      })) : paragraph("cp-empty", "Practices you save will appear here.")
    ];
  }

  function render(host, actions) {
    actions = actions || {};
    var root = h("section", { class: "cp" });
    host.appendChild(root);

    function generate(variation) {
      var plan = RR.clubPractice.generate(draft.age, Number(draft.minutes), variation);
      if (!plan) return false;
      draft.plan = plan;
      draft.variation = variation;
      draft.page = "result";
      paint(true);
      return true;
    }

    function goSaved() {
      draft.returnPage = draft.page;
      draft.page = "saved";
      paint(true);
    }

    function openPlan(plan) {
      draft.age = plan.ageGroup;
      draft.minutes = String(plan.totalMinutes);
      draft.variation = plan.variation || 0;
      draft.plan = plan;
      draft.page = "result";
      paint(true);
    }

    function paint(focus) {
      var language = RR.i18n ? RR.i18n.getLang() : "en";
      var plan = draft.page === "result" ? RR.clubPractice.localize(draft.plan, language) : null;
      var content;
      root.classList.toggle("cp--result", Boolean(plan));
      if (plan) {
        content = result(plan, actions, {
          edit: function () { draft.page = "builder"; paint(true); },
          saved: goSaved,
          another: function () { generate((draft.variation + 1) % RR.clubPractice.variantCount); }
        });
      } else if (draft.page === "saved") {
        content = savedView(actions, {
          back: function () { draft.page = draft.returnPage; paint(true); },
          reopen: openPlan,
          removed: function () { paint(true); }
        }, language);
      } else {
        content = builder({
          saved: goSaved,
          resume: function () { openPlan(draft.plan); },
          generate: function () { return generate(0); }
        });
      }
      root.replaceChildren.apply(root, content);
      if (actions.onPlanChange) actions.onPlanChange(plan);
      if (focus) {
        window.scrollTo(0, 0);
        root.querySelector("h1").focus({ preventScroll: true });
      }
    }

    paint(false);
  }

  if (RR.i18n) RR.i18n.add({
    "Club Practice": "Antrenament de club",
    "A full volleyball practice for your team, built around the time you have.": "Un antrenament complet de volei pentru echipa ta, adaptat la timpul disponibil.",
    "Saved practices": "Antrenamente salvate",
    "Time available": "Timp disponibil",
    "Time presets": "Durate prestabilite",
    "Pick a time or enter your own": "Alege o durată sau introdu durata dorită",
    "Generate practice": "Generează antrenamentul",
    "Choose an age group and enter a valid practice length.": "Alege grupa de vârstă și introdu o durată validă.",
    "Coaching references": "Resurse pentru antrenori",
    "Change inputs": "Schimbă opțiunile",
    "Another practice": "Alt antrenament",
    "Practice actions": "Acțiuni pentru antrenament",
    "Run practice": "Pornește",
    "Practice saved.": "Antrenament salvat.",
    "Share practice": "Distribuie antrenamentul",
    "Print practice": "Printează antrenamentul",
    "Practice brief": "Rezumatul antrenamentului",
    "Objectives, equipment, and attendance adjustments": "Obiective, echipament și adaptări după numărul de jucători",
    "Before practice": "Înainte de antrenament",
    "Success targets": "Obiective măsurabile",
    "Adjust for your gym": "Adaptări pentru sală",
    "Timeline": "Desfășurare",
    "Open a drill for the court map and steps.": "Deschide un exercițiu pentru schema terenului și pași.",
    "Coaching details": "Detalii pentru antrenor",
    "Set up": "Așezare pe teren",
    "Objective": "Obiectiv",
    "Serve": "Serviciu",
    "Team play": "Joc de echipă",
    "Water break": "Pauză de apă",
    "Pressure": "Joc sub presiune",
    "Compete": "Joc cu punctaj",
    "Scoring and success": "Punctaj și criterii de reușită",
    "Coach cues": "Indicații pentru jucători",
    "Increase the challenge": "Crește dificultatea",
    "Reopen a plan whenever you're ready to coach it.": "Redeschide un plan când ești gata să conduci antrenamentul.",
    "Back to builder": "Înapoi la configurare",
    "Back to practice": "Înapoi la antrenament",
    "Practices you save will appear here.": "Antrenamentele pe care le salvezi vor apărea aici."
  });

  return { render: render, coachingDetails: coachingDetails };
})();
