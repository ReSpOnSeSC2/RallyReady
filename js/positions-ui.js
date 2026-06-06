// positions-ui.js — the Position Coaching screen (RR.positionsScreen, #positions).
//
// A sub-screen of Players: how to coach each position, tuned to the team. It
// shows an age-appropriate emphasis note, the squad grouped by position (with
// gaps flagged), and a per-position GUIDE — responsibilities, "say this" cues,
// common mistakes + fixes, a rotation/overlap court diagram (via RR.diagram), the
// players on THIS team in that role, and real recommended drills pulled live from
// the library (RR.positions.recommendedDrills → RR.ui.drillCard/drillDetail).
//
// Reached with a specific role from the Players grid / a profile (focus(pos)), or
// at the overview from the Tips card. Semantic tokens + fixed hues only.
window.RR = window.RR || {};

RR.positionsScreen = (function () {
  "use strict";

  var ui = RR.ui;
  var h = ui.h;

  var pending = null;   // a role to open on the next render (deep link)

  // Other screens call this just before navigating to #positions.
  function focus(pos) { pending = pos; }

  // A collapsible section card (keyboard-operable button header + panel), so a
  // position guide stays a short, scannable page — open only the part you're
  // coaching. Mirrors the Tips screen's disclosure pattern.
  var discSeq = 0;
  function discloseCard(title, content, open) {
    var pid = "posdisc-" + (++discSeq);
    var chev = h("span", { class: "pos-disc__chev" + (open ? " is-open" : ""), "aria-hidden": "true",
      html: ui.icon('<path d="M6 9l6 6 6-6"/>', 18) });
    var toggle = h("button", { type: "button", class: "pos-disc__toggle",
      "aria-expanded": open ? "true" : "false", "aria-controls": pid }, [
      h("span", { class: "pos-disc__title", text: title }), chev
    ]);
    var panel = h("div", { class: "pos-disc__panel", id: pid }, [content]);
    if (!open) panel.hidden = true;
    toggle.addEventListener("click", function () {
      var o = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", o ? "true" : "false");
      panel.hidden = !o;
      chev.classList.toggle("is-open", o);
    });
    return h("section", { class: "card pos-disc" }, [toggle, panel]);
  }

  function render(host) {
    // Local view state: which guide is open, and any drill opened from it.
    var view = { pos: pending, drill: null };
    pending = null;

    var team = (RR.state && RR.state.getState().team) || null;

    var back = h("a", { class: "btn btn-ghost pl-back", href: "#players" }, [
      h("span", { "aria-hidden": "true", html: ui.icon('<path d="M15 18l-6-6 6-6"/>', 18) }),
      "Players"
    ]);
    host.appendChild(back);

    var body = h("div", { class: "pos-body" });
    host.appendChild(body);
    paint();

    function paint() {
      body.innerHTML = "";
      if (view.pos && view.drill) { body.appendChild(drillView(view.drill)); return; }
      if (view.pos) { body.appendChild(guideView(view.pos)); return; }
      body.appendChild(overview());
      window.scrollTo(0, 0);
    }

    // ---- Overview -----------------------------------------------------------
    function overview() {
      var wrap = h("div", {});
      wrap.appendChild(h("p", { class: "screen-sub",
        text: "How to coach every position — tuned to your team’s age, with drills from the library." }));

      // Age-appropriate emphasis (broad at young ages, specialise later).
      var emph = RR.positions.ageEmphasis(team);
      wrap.appendChild(h("section", { class: "card pos-emph" }, [
        h("span", { class: "eyebrow", text: emph.stage }),
        h("p", { class: "pos-emph__text", text: emph.text })
      ]));

      // Age-gated practice breakout opt-in (13+ only — younger teams should keep
      // rotating everyone, so the toggle isn't even offered).
      var bc = breakoutCard();
      if (bc) wrap.appendChild(bc);

      // Squad by position (only when there's a roster to group).
      var roster = RR.roster.getSortedRoster();
      if (roster.length) wrap.appendChild(squadByPosition(roster));

      // Every position guide, as a tappable list.
      var list = h("div", { class: "pos-cards" }, RR.positions.LIST.map(function (pos) {
        return positionTile(pos);
      }));
      wrap.appendChild(h("section", { class: "card pos-guides" }, [
        ui.sectionTitle("Position guides", null, "h2"),
        list
      ]));

      // Lineup builder entry.
      var lineupBtn = h("a", { class: "btn btn-ghost btn-block pos-lineup-link", href: "#lineup" }, [
        h("span", { class: "btn__icon", "aria-hidden": "true",
          html: ui.icon('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 12h16M9 3v18"/>', 18) }),
        "Build your starting lineup"
      ]);
      wrap.appendChild(lineupBtn);
      return wrap;
    }

    // The opt-in that adds a short "position breakout" block to generated
    // practices. Only offered at 13+, where specialising is age-appropriate; it
    // writes team.positionBreakout, which the Today screen reads.
    function breakoutCard() {
      if (!team || !(RR.team && RR.team.ageRange)) return null;
      var band = RR.team.ageRange(team.ageGroup);
      if (!band || band.min < 13) return null;

      var on = !!team.positionBreakout;
      var toggle = h("button", { type: "button",
        class: "pos-breakout__toggle chip" + (on ? " is-on" : ""),
        role: "switch", "aria-checked": on ? "true" : "false",
        text: on ? "On" : "Off" });
      toggle.addEventListener("click", function () {
        var t = JSON.parse(JSON.stringify(team));
        t.positionBreakout = !on;
        RR.state.update({ team: t });
        team = t;
        paint();
      });
      return h("section", { class: "card pos-breakout" }, [
        h("div", { class: "card-head" }, [
          h("h2", { text: "Position breakout in practices" }),
          toggle
        ]),
        h("p", { class: "muted",
          text: "When on, your Today practice plan adds a short position-breakout block so players can work their specialist skills. Best for older teams — turn it off to keep everyone developing every skill." })
      ]);
    }

    function positionTile(pos) {
      var g = RR.positions.get(pos);
      var tile = h("button", { type: "button", class: "pos-tile",
        "aria-label": "Open the " + pos + " guide" }, [
        h("span", { class: "pos-tile__abbr", "aria-hidden": "true", text: g.abbr }),
        h("span", { class: "pos-tile__text" }, [
          h("span", { class: "pos-tile__name", text: pos }),
          h("span", { class: "pos-tile__tag muted", text: g.tagline })
        ]),
        h("span", { class: "pos-tile__chev", "aria-hidden": "true", html: ui.icon('<path d="M9 6l6 6-6 6"/>', 18) })
      ]);
      tile.addEventListener("click", function () { view.pos = pos; view.drill = null; paint(); });
      return tile;
    }

    function squadByPosition(roster) {
      var card = h("section", { class: "card pos-squad" }, [ui.sectionTitle("Your squad by position", null, "h2")]);
      RR.positions.LIST.forEach(function (pos) {
        var players = roster.filter(function (p) { return p.position === pos; });
        var names = players.length
          ? players.map(function (p) { return p.name; }).join(", ")
          : "No one yet";
        var row = h("button", { type: "button", class: "row pos-squad__row",
          "aria-label": "Open the " + pos + " guide (" + (players.length || "no") + " players)" }, [
          h("span", { class: "pos-squad__main" }, [
            h("span", { class: "pos-squad__pos", text: pos }),
            h("span", { class: "pos-squad__names " + (players.length ? "" : "muted"), text: names })
          ]),
          players.length
            ? h("span", { class: "pill", text: String(players.length) })
            : h("span", { class: "pos-squad__gap", text: "gap" })
        ]);
        row.addEventListener("click", function () { view.pos = pos; view.drill = null; paint(); });
        card.appendChild(row);
      });
      // Players still exploring.
      var exploring = roster.filter(function (p) {
        return !p.position || !RR.positions.isCoachable(p.position);
      });
      if (exploring.length) {
        card.appendChild(h("p", { class: "muted pos-squad__exploring",
          text: "Still exploring: " + exploring.map(function (p) { return p.name; }).join(", ") }));
      }
      return card;
    }

    // ---- One position guide -------------------------------------------------
    function guideView(pos) {
      var g = RR.positions.get(pos);
      var wrap = h("div", { class: "pos-guide" });

      var toOverview = h("button", { type: "button", class: "btn btn-ghost drills-back" }, [
        h("span", { "aria-hidden": "true", html: ui.icon('<path d="M15 6l-6 6 6 6"/>', 18) }),
        "All positions"
      ]);
      toOverview.addEventListener("click", function () { view.pos = null; view.drill = null; paint(); });
      wrap.appendChild(toOverview);

      // Header
      wrap.appendChild(h("section", { class: "card pos-head" }, [
        h("div", { class: "pos-head__top" }, [
          h("span", { class: "pos-head__abbr", "aria-hidden": "true", text: g.abbr }),
          h("div", {}, [
            h("h2", { class: "pos-head__name", text: pos }),
            h("p", { class: "pos-head__tag muted", text: g.tagline })
          ])
        ]),
        h("p", { class: "pos-head__blurb", text: g.blurb }),
        h("div", { class: "pos-head__skills" }, g.focusSkills.map(function (s) {
          return ui.badge(s, ui.skillColor(s));
        }))
      ]));

      // Age emphasis (compact, reminds the coach how much to specialise).
      var emph = RR.positions.ageEmphasis(team);
      wrap.appendChild(h("section", { class: "card pos-emph pos-emph--compact" }, [
        h("span", { class: "eyebrow", text: emph.stage }),
        h("p", { class: "pos-emph__text", text: emph.text })
      ]));

      // Detail sections are collapsible so the guide opens as a short, scannable
      // page (≤3 screens). Responsibilities starts open; the rest are closed.
      wrap.appendChild(discloseCard("Responsibilities", h("div", { class: "pos-resp" }, [
        respBlock("Front row", g.responsibilities.front),
        respBlock("Back row", g.responsibilities.back)
      ]), true));

      wrap.appendChild(discloseCard("Say this",
        h("ul", { class: "pos-cuelist" }, g.cues.map(function (c) { return h("li", { text: c }); })), false));

      wrap.appendChild(discloseCard("Common mistakes & fixes",
        h("ul", { class: "pos-mistakelist" }, g.mistakes.map(function (m) {
          return h("li", { class: "pos-mistake" }, [
            h("span", { class: "pos-mistake__miss" }, [
              h("span", { class: "pos-mistake__tag", text: "Watch for" }), " " + m.miss
            ]),
            h("span", { class: "pos-mistake__fix" }, [
              h("span", { class: "pos-mistake__tag pos-mistake__tag--fix", text: "Fix" }), " " + m.fix
            ])
          ]);
        })), false));

      // Rotation & overlap (note + court diagram).
      var rotContent = h("div", { class: "pos-rot" }, [h("p", { class: "pos-rot__note", text: g.rotation })]);
      if (RR.diagram && RR.diagram.figure) {
        var fig = RR.diagram.figure(RR.positions.rotationSpec(pos), { fallbackTitle: "Where the " + g.abbr + " starts" });
        if (fig) rotContent.appendChild(h("div", { class: "pos-rot__fig" }, [fig]));
      }
      wrap.appendChild(discloseCard("Rotation & overlap", rotContent, false));

      // Players on this team in this role (kept visible — short and useful).
      var here = RR.roster.getSortedRoster().filter(function (p) { return p.position === pos; });
      if (here.length) {
        wrap.appendChild(h("section", { class: "card pos-players" }, [
          ui.sectionTitle(here.length === 1 ? "Your " + g.abbr : "Your " + g.abbr + "s", null, "h2"),
          h("div", { class: "pos-players__grid" }, here.map(function (p) { return playerChip(p); }))
        ]));
      }

      // Recommended drills (real, age-tuned) — collapsed to keep the page short.
      wrap.appendChild(discloseCard("Drills for this position", drillsContent(pos), false));

      // Watch-how link.
      wrap.appendChild(h("div", { class: "pos-watch" }, [ui.watchLink(g.videoUrl, "Watch how to play " + pos.toLowerCase())]));
      return wrap;
    }

    function respBlock(label, items) {
      return h("div", { class: "pos-resp__block" }, [
        h("span", { class: "eyebrow", text: label }),
        h("ul", { class: "pos-resp__list" }, items.map(function (t) { return h("li", { text: t }); }))
      ]);
    }

    function playerChip(p) {
      var chip = h("button", { type: "button", class: "pos-playerchip",
        "aria-label": "Open " + p.name + "’s profile" }, [
        RR.photos.avatar(p, 36),
        h("span", { class: "pos-playerchip__name", text: p.name })
      ]);
      chip.addEventListener("click", function () {
        if (RR.playerProfile && RR.playerProfile.open) { RR.playerProfile.open(p.id); location.hash = "#player"; }
      });
      return chip;
    }

    function drillsContent(pos) {
      var drills = RR.positions.recommendedDrills(pos, team);
      if (!drills.length) {
        return h("p", { class: "muted", text: "No matching drills for this age band yet — browse the full library on the Drills tab." });
      }
      return h("div", { class: "pos-drills" }, [
        h("p", { class: "muted pos-drills__hint",
          text: "Tap a drill for the full setup, cues and video. These work the skills this position lives in." }),
        h("div", { class: "drills-list pos-drills__list" }, drills.map(function (d) {
          return ui.drillCard(d, { onOpen: function (drill) { view.drill = drill; paint(); window.scrollTo(0, 0); } });
        }))
      ]);
    }

    // ---- A drill opened from a guide ---------------------------------------
    function drillView(drill) {
      var wrap = h("div", { class: "drills-detail-wrap" });
      var back = h("button", { type: "button", class: "btn btn-ghost drills-back" }, [
        h("span", { "aria-hidden": "true", html: ui.icon('<path d="M15 6l-6 6 6 6"/>', 18) }),
        "Back to " + view.pos
      ]);
      back.addEventListener("click", function () { view.drill = null; paint(); window.scrollTo(0, 0); });
      wrap.appendChild(back);
      wrap.appendChild(ui.drillDetail(drill, {}));
      return wrap;
    }
  }

  return {
    render: render,
    focus: focus
  };
})();
