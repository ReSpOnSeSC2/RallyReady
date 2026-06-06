// ui.js — shared, theme-aware render helpers used across every screen (RR.ui).
//
// Screens stay lean by composing these instead of repeating markup: a tiny
// hyperscript, intensity dots, phase/category badges, the drill SUMMARY card and
// drill DETAIL view, the Today practice-block card, friendly empty states,
// section titles, the celebratory toast, and a couple of program-aware labels.
//
// PURE presentation only — no planning logic, no persistence. All colours come
// from semantic tokens, except the fixed intensity hues (--i-easy/mid/hard/taper
// via the .badge--*/.dot--* classes) which always carry navy text, so everything
// reads correctly in BOTH light and dark themes.
window.RR = window.RR || {};

RR.ui = (function () {
  "use strict";

  // ---- Tiny hyperscript: h("div", {class:"x", onclick:fn}, [children]) -------
  // One shared implementation so screens don't each redefine their own.
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

  // Inline SVG glyph helper (24x24 stroked line icons), used by several cards.
  function icon(paths, size) {
    size = size || 18;
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size +
      '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true" focusable="false">' + paths + '</svg>';
  }

  // ---- Intensity dots — N filled out of `max`, coloured by phase hue ---------
  // The dots are decorative (aria-hidden); a visible "N / max" text beside them
  // carries the meaning, so nothing rests on colour alone.
  function dots(n, color, max) {
    max = max || 10;
    var wrap = h("div", { class: "dots", "aria-hidden": "true" });
    for (var i = 1; i <= max; i++) {
      wrap.appendChild(h("span", {
        class: "dot " + (i <= n ? "dot--on dot--" + color : "dot--off")
      }));
    }
    return wrap;
  }
  // Friendlier alias requested by the shared-helpers brief: intensityDots(n).
  function intensityDots(n, color, max) { return dots(n, color, max); }

  // ---- Phase / category badge — fixed intensity hue with navy text -----------
  function badge(text, color) {
    return h("span", { class: "badge" + (color ? " badge--" + color : ""), text: text });
  }

  // ---- Section title — a card header row (title + optional right-hand node) --
  // Centralises the ".card-head" pattern used by Team / Season / Tips / Drills.
  function sectionTitle(text, right, tag) {
    return h("div", { class: "card-head" }, [
      h(tag || "h2", { text: text }),
      right || null
    ]);
  }

  // ---- External reference link (RallyReady E) -------------------------------
  // Opens in a new tab with rel="noopener". Opening it is a user action, not a
  // runtime network call, so it never violates the offline rule.
  function watchLink(url, label) {
    return h("a", {
      class: "watch", href: url, target: "_blank", rel: "noopener"
    }, [
      h("span", { class: "watch__icon", "aria-hidden": "true",
        html: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' }),
      h("span", { text: label || "Watch how" })
    ]);
  }

  // ---- Friendly empty state --------------------------------------------------
  // emptyState(msg, btnLabel, hash)  — or  emptyState({title, blurb, tag, btnLabel, hash}).
  // Renders a centred ".card empty" with an optional call-to-action link.
  function emptyState(msg, btnLabel, hash) {
    var o = (msg && typeof msg === "object") ? msg
      : { blurb: msg, btnLabel: btnLabel, hash: hash };
    var kids = [];
    if (o.tag) kids.push(h("span", { class: "pill empty__tag", text: o.tag }));
    if (o.title) kids.push(h("h2", { text: o.title }));
    if (o.blurb) kids.push(h("p", { class: "muted", text: o.blurb }));
    if (o.btnLabel && o.hash) {
      kids.push(h("a", { class: "btn btn-primary empty__cta", href: o.hash, text: o.btnLabel }));
    }
    return h("section", { class: "card empty" }, kids);
  }

  // ---- Program-aware labels (season OR camp) --------------------------------
  // programLabel(team) -> RR.team.programWindow(team).label, or a friendly default
  // so callers always have something sensible to show (never a blank).
  function programLabel(team) {
    team = team || (RR.state && RR.state.getState().team) || null;
    var win = (RR.team && RR.team.programWindow) ? RR.team.programWindow(team) : null;
    if (win && win.label) return win.label;
    if (team && team.programType === "camp") return "Your camp";
    return "Your season";
  }

  // ======================================================================= //
  //  DRILL CARDS                                                            //
  // ======================================================================= //

  // Skill categories map to a fixed intensity hue so a category always reads the
  // same colour (navy text on each clears AA). Anything unlisted falls back to mid.
  var SKILL_COLOR = {
    "Warmup": "easy", "Ball Control": "easy", "Cooldown": "taper",
    "Passing": "mid", "Setting": "mid", "Serving": "mid",
    "Hitting": "hard", "Blocking": "hard", "Defense": "hard", "Team Play": "taper"
  };
  function skillColor(skill) { return SKILL_COLOR[skill] || "mid"; }

  // Difficulty (1–5) -> hue for the difficulty dots, easy→hard as it rises.
  function difficultyColor(d) {
    if (d <= 2) return "easy";
    if (d === 3) return "mid";
    return "hard";
  }
  // Plain-English difficulty word, so meaning never rests on the dots alone.
  function difficultyWord(d) {
    if (d <= 2) return "Beginner";
    if (d === 3) return "Intermediate";
    return "Advanced";
  }
  // Human age-range string from a drill's [ageMin, ageMax].
  function ageRangeText(drill) {
    return "Ages " + drill.ageMin + "–" + drill.ageMax;
  }

  // Friendly equipment label. Tokens are already human phrases; we mostly just
  // present them nicely (with a few volleyball-specific niceties).
  var EQUIP = { balls: "Volleyballs", net: "Net", wall: "A wall", cones: "Cones", bands: "Resistance bands" };
  function equipLabel(token) {
    if (EQUIP[token]) return EQUIP[token];
    return token.charAt(0).toUpperCase() + token.slice(1);
  }

  // A small "Camp-friendly" marker (icon + word) so the flag never rests on colour.
  function campTag() {
    // A tent with a centre entrance (the inner "V") so it reads as a camp tent,
    // not a warning triangle.
    return h("span", { class: "drill-tag drill-tag--camp" }, [
      h("span", { "aria-hidden": "true", class: "drill-tag__icon",
        html: icon('<path d="M2 20h20"/><path d="M12 4 4 20"/><path d="M12 4l8 16"/><path d="M12 12l-3 8"/><path d="M12 12l3 8"/>', 14) }),
      "Camp-friendly"
    ]);
  }

  // A star toggle that marks a drill as a coach favorite. It's its OWN button
  // (never nested inside another button), self-updates on click, and persists via
  // RR.state. opts.onToggle(isFav) lets a screen react (e.g. re-filter).
  function favStar(drill, opts) {
    opts = opts || {};
    var fav = !!(RR.state && RR.state.isFavorite && RR.state.isFavorite(drill.id));
    var btn = h("button", {
      type: "button", class: "favstar" + (fav ? " is-on" : ""),
      "aria-pressed": fav ? "true" : "false",
      "aria-label": fav ? "Remove “" + drill.name + "” from favorites" : "Add “" + drill.name + "” to favorites"
    });
    function paint() {
      btn.innerHTML = icon(fav
        ? '<path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 17.9 6.7 20l1-5.8L3.5 9.7l5.9-.9z" fill="currentColor" stroke="none"/>'
        : '<path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 17.9 6.7 20l1-5.8L3.5 9.7l5.9-.9z"/>', 20);
    }
    paint();
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!(RR.state && RR.state.toggleFavorite)) return;
      fav = RR.state.toggleFavorite(drill.id);
      btn.classList.toggle("is-on", fav);
      btn.setAttribute("aria-pressed", fav ? "true" : "false");
      paint();
      if (opts.onToggle) opts.onToggle(fav);
    });
    return btn;
  }

  // drillCard(drill, opts) — a tappable SUMMARY card for the Drills browser.
  //   opts.onOpen(drill)   — called when the card is activated.
  //   opts.onFav(isFav)    — called when the star is toggled.
  // The card body is a <button>; the favorite star is a sibling overlay so we
  // never nest one interactive control inside another.
  function drillCard(drill, opts) {
    opts = opts || {};
    var meta = [
      badge(drill.skill, skillColor(drill.skill)),
      h("span", { class: "drill-card__age", text: ageRangeText(drill) })
    ];
    if (drill.custom) meta.push(h("span", { class: "drill-tag drill-tag--custom", text: "Your drill" }));
    if (drill.campFriendly) meta.push(campTag());

    var card = h("button", {
      type: "button", class: "card drill-card",
      "aria-label": drill.name + " — " + drill.skill + ", " + difficultyWord(drill.difficulty)
    }, [
      h("div", { class: "drill-card__top" }, meta),
      h("h3", { class: "drill-card__name", text: drill.name }),
      h("div", { class: "drill-card__foot" }, [
        h("span", { class: "drill-card__diff" }, [
          h("span", { class: "eyebrow", text: difficultyWord(drill.difficulty) }),
          dots(drill.difficulty, difficultyColor(drill.difficulty), 5)
        ]),
        h("span", { class: "drill-card__time", text: (drill.durationMin || 10) + " min" }),
        h("span", { class: "drill-card__chev", "aria-hidden": "true",
          html: icon('<path d="M9 6l6 6-6 6"/>', 18) })
      ])
    ]);
    if (opts.onOpen) card.addEventListener("click", function () { opts.onOpen(drill); });
    return h("div", { class: "drill-card-wrap" }, [
      card,
      favStar(drill, { onToggle: opts.onFav })
    ]);
  }

  // A labelled detail block: an eyebrow + content node, reused across the detail
  // view (Setup, Run it, Say this, …).
  function detailSection(label, content) {
    return h("div", { class: "drill-detail__section" }, [
      h("span", { class: "eyebrow", text: label }),
      content
    ]);
  }

  // ---- "How it's organized" — grouping / flow / tracking / where / aim ------
  // Answers the question text alone left open: does everyone go at once or take
  // turns, and who keeps score? Built by RR.format (derived per drill, with
  // authored overrides for games). Returns null if the engine isn't present.
  function organizeList(drill) {
    if (!RR.format || !drill) return null;
    var rows = RR.format.rows(drill);
    if (!rows.length) return null;
    return h("ul", { class: "organize" }, rows.map(function (r) {
      return h("li", { class: "organize__row" }, [
        h("span", { class: "organize__label", text: r.label }),
        h("span", { class: "organize__text", text: r.text })
      ]);
    }));
  }
  function organizeSection(drill) {
    var list = organizeList(drill);
    return list ? detailSection("How it's organized", list) : null;
  }

  // ---- Court diagram figures (or null) --------------------------------------
  // A top-down SVG of where players stand and where the ball goes. A drill may
  // have several (one per step), so this returns a wrapper holding every figure;
  // multi-step sets get auto "Step N" headings when the author didn't name them.
  function diagramFigures(drill) {
    if (!RR.format || !RR.diagram || !drill) return null;
    var specs = RR.format.diagrams(drill);
    if (!specs.length) return null;
    var multi = specs.length > 1;
    var wrap = h("div", { class: "drill-diagrams" + (multi ? " drill-diagrams--multi" : "") });
    specs.forEach(function (spec, i) {
      var fig = RR.diagram.figure(spec, multi ? { fallbackTitle: "Step " + (i + 1) } : null);
      if (fig) wrap.appendChild(fig);
    });
    return wrap.childNodes.length ? wrap : null;
  }
  // Back-compat alias (single wrapper of all figures).
  function diagramFigure(drill) { return diagramFigures(drill); }

  // drillDetail(drill) — the full read-out for one drill: setup, steps, cues,
  // equipment, age range, difficulty dots, easier/harder, and the "Watch how"
  // link. Used by the Drills browser's detail view. No nested cards.
  function drillDetail(drill, opts) {
    opts = opts || {};
    var stats = h("div", { class: "drill-detail__stats" }, [
      h("div", { class: "drill-detail__stat" }, [
        h("span", { class: "eyebrow", text: "Difficulty" }),
        h("div", { class: "drill-detail__diff" }, [
          dots(drill.difficulty, difficultyColor(drill.difficulty), 5),
          h("span", { class: "drill-detail__diff-word", text: difficultyWord(drill.difficulty) })
        ])
      ]),
      h("div", { class: "drill-detail__stat" }, [
        h("span", { class: "eyebrow", text: "Age range" }),
        h("strong", { text: ageRangeText(drill) })
      ]),
      h("div", { class: "drill-detail__stat" }, [
        h("span", { class: "eyebrow", text: "Time" }),
        h("strong", { text: (drill.durationMin || 10) + " min" })
      ])
    ]);

    var sections = [
      detailSection("Setup", h("p", { text: drill.setup }))
    ];
    // The "how it's organized" read-out and the court diagram sit right after
    // Setup — that's exactly when a coach is picturing how to run it.
    var org = organizeSection(drill);
    if (org) sections.push(org);
    var fig = diagramFigure(drill);
    if (fig) sections.push(h("div", { class: "drill-detail__section drill-detail__diagram" }, [
      h("span", { class: "eyebrow", text: "On the court" }), fig
    ]));
    sections.push(
      detailSection("Run it", h("ol", { class: "drill-detail__steps" },
        (drill.steps || []).map(function (s) { return h("li", { text: s }); }))),
      detailSection("Say this", h("ul", { class: "drill-detail__cues" },
        (drill.cues || []).map(function (c) { return h("li", { text: c }); })))
    );

    if (drill.equipment && drill.equipment.length) {
      sections.push(detailSection("Equipment",
        h("p", { text: drill.equipment.map(equipLabel).join(", ") })));
    } else {
      sections.push(detailSection("Equipment",
        h("p", { class: "muted", text: "Just a net and volleyballs." })));
    }

    // Easier / harder adjustments, side by side.
    sections.push(h("div", { class: "drill-detail__adjust" }, [
      h("div", { class: "drill-detail__adjust-col" }, [
        h("span", { class: "eyebrow", text: "Make it easier" }),
        h("p", { text: drill.easier })
      ]),
      h("div", { class: "drill-detail__adjust-col" }, [
        h("span", { class: "eyebrow", text: "Make it harder" }),
        h("p", { text: drill.harder })
      ])
    ]));

    var head = [
      h("div", { class: "drill-detail__headrow" }, [
        h("div", { class: "drill-detail__badges" }, (function () {
          var b = [badge(drill.skill, skillColor(drill.skill))];
          if (drill.custom) b.push(h("span", { class: "drill-tag drill-tag--custom", text: "Your drill" }));
          if (drill.campFriendly) b.push(campTag());
          return b;
        })()),
        favStar(drill)
      ]),
      h("h2", { class: "drill-detail__name", text: drill.name })
    ];

    var footer = [watchLink(drill.videoSearchUrl, "Watch how")];
    // Coach-authored drills can be edited or removed right from the detail view.
    if (drill.custom && (opts.onEdit || opts.onDelete)) {
      var ctl = [];
      if (opts.onEdit) {
        var ed = h("button", { type: "button", class: "btn btn-ghost" }, [
          h("span", { "aria-hidden": "true", class: "btn__icon", html: icon('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>', 18) }), "Edit drill"]);
        ed.addEventListener("click", function () { opts.onEdit(drill); });
        ctl.push(ed);
      }
      if (opts.onDelete) {
        var del = h("button", { type: "button", class: "btn btn-ghost btn-danger" }, [
          h("span", { "aria-hidden": "true", class: "btn__icon", html: icon('<path d="M4 7h16"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M7 7l1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12"/>', 18) }), "Delete"]);
        del.addEventListener("click", function () { opts.onDelete(drill); });
        ctl.push(del);
      }
      footer.push(h("div", { class: "drill-detail__custom-ctl" }, ctl));
    }

    return h("section", { class: "card drill-detail" }, [
      h("div", { class: "drill-detail__head" }, head),
      stats,
      h("div", { class: "drill-detail__body" }, sections),
      footer
    ]);
  }

  // ======================================================================= //
  //  TODAY PRACTICE-BLOCK CARD                                              //
  // ======================================================================= //

  // A block's role kind -> a fixed intensity colour + short category word, so
  // every block gets a coloured role label that always carries navy text.
  var KIND = {
    warmup:   { color: "easy",  label: "Warm-up" },
    skill:    { color: "hard",  label: "Skill" },
    game:     { color: "mid",   label: "Game" },
    cooldown: { color: "taper", label: "Cool-down" }
  };
  function kindOf(block) {
    var k = (block._req && block._req.kind) || "skill";
    return KIND[k] || KIND.skill;
  }

  // blockCard(block, opts) — one practice block as a card. Collapsed by default to
  // Setup + steps (+ Watch how); a real toggle button reveals the "Say this" cues
  // and equipment. The expand/collapse is self-contained presentation.
  //   opts.index      — used to build a unique id for the collapsible region.
  //   opts.swappable  — when true, adds a "Swap" button that calls opts.onSwap().
  //   opts.onSwap()   — app-level handler (the owner re-renders + replaces).
  function blockCard(block, opts) {
    opts = opts || {};
    var drill = block.drill;
    var kd = kindOf(block);
    var moreId = "block-more-" + (opts.index || 0);

    var head = h("header", { class: "block__head" }, [
      badge(kd.label, kd.color),
      h("span", { class: "block__min", text: block.minutes + " min" })
    ]);

    var setup = h("div", { class: "block__section" }, [
      h("span", { class: "eyebrow", text: "Setup" }),
      h("p", { text: drill.setup })
    ]);
    // How the squad is organized (who goes when, who keeps score) + the court
    // diagram, inline so a coach can run the block without expanding anything.
    var orgList = organizeList(drill);
    var fig = diagramFigure(drill);
    var orgBlock = orgList ? h("div", { class: "block__section block__organize" }, [
      h("span", { class: "eyebrow", text: "How it's organized" }),
      orgList
    ]) : null;
    var figBlock = fig ? h("div", { class: "block__section block__diagram" }, [
      h("span", { class: "eyebrow", text: "On the court" }), fig
    ]) : null;
    var runit = h("div", { class: "block__section" }, [
      h("span", { class: "eyebrow", text: "Run it" }),
      h("ol", { class: "block__steps" }, (drill.steps || []).map(function (s) {
        return h("li", { text: s });
      }))
    ]);

    var more = h("div", { class: "block__more", id: moreId, hidden: true }, [
      h("div", { class: "block__section" }, [
        h("span", { class: "eyebrow", text: "Say this" }),
        h("ul", { class: "block__cues" }, (drill.cues || []).map(function (c) {
          return h("li", { text: c });
        }))
      ]),
      (drill.equipment && drill.equipment.length)
        ? h("div", { class: "block__section" }, [
            h("span", { class: "eyebrow", text: "Equipment" }),
            h("p", { text: drill.equipment.map(equipLabel).join(", ") })
          ])
        : null
    ]);

    var toggle = h("button", {
      type: "button", class: "block__toggle", "aria-expanded": "false", "aria-controls": moreId
    }, [h("span", { class: "block__toggle-label", text: "Coaching cues" })]);
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
      more.hidden = open;
      toggle.querySelector(".block__toggle-label").textContent = open ? "Coaching cues" : "Hide cues";
    });

    var tools = [toggle];
    if (opts.swappable && typeof opts.onSwap === "function") {
      var swap = h("button", { type: "button", class: "block__swap js-swap" }, [
        h("span", { "aria-hidden": "true", class: "block__swap-icon",
          html: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h13l-3-3"/><path d="M21 17H8l3 3"/></svg>' }),
        "Swap"
      ]);
      swap.addEventListener("click", function () { opts.onSwap(); });
      tools.push(swap);
    }

    return h("article", { class: "card block" }, [
      head,
      h("p", { class: "block__role", text: block.role }),
      h("h3", { class: "block__title", text: block.title }),
      h("p", { class: "block__why", text: block.why }),
      setup,
      orgBlock,
      figBlock,
      runit,
      watchLink(drill.videoSearchUrl, "Watch how"),
      h("div", { class: "block__tools" }, tools),
      more
    ]);
  }

  // ---- Date formatting (display only) ---------------------------------------
  function parseISO(iso) {
    if (!iso) return null;
    var p = String(iso).split("-");
    return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null;
  }
  function fmtFull(iso) {   // "Fri, Aug 14, 2026"
    var d = parseISO(iso);
    return d ? d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "";
  }
  function fmtShort(iso) {  // "Aug 14"
    var d = parseISO(iso);
    return d ? d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";
  }

  // ---- Celebratory toast -----------------------------------------------------
  // A polite live-region message that fades in then auto-dismisses. One shared
  // node is reused so repeated calls don't stack up.
  var toastNode = null, toastTimer = null;
  function confirmToast(message) {
    if (!toastNode) {
      toastNode = h("div", { class: "rr-toast", role: "status", "aria-live": "polite" });
      document.body.appendChild(toastNode);
    }
    toastNode.textContent = message;
    void toastNode.offsetWidth;   // force reflow so the transition restarts reliably
    toastNode.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastNode.classList.remove("is-show"); }, 2600);
  }

  return {
    h: h,
    append: append,
    icon: icon,
    dots: dots,
    intensityDots: intensityDots,
    badge: badge,
    sectionTitle: sectionTitle,
    watchLink: watchLink,
    emptyState: emptyState,
    programLabel: programLabel,
    // drill + block builders
    skillColor: skillColor,
    difficultyColor: difficultyColor,
    difficultyWord: difficultyWord,
    ageRangeText: ageRangeText,
    equipLabel: equipLabel,
    favStar: favStar,
    drillCard: drillCard,
    drillDetail: drillDetail,
    organizeList: organizeList,
    organizeSection: organizeSection,
    diagramFigure: diagramFigure,
    diagramFigures: diagramFigures,
    kindOf: kindOf,
    blockCard: blockCard,
    // dates + toast
    fmtFull: fmtFull,
    fmtShort: fmtShort,
    confirmToast: confirmToast
  };
})();
