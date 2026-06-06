// lineup.js — the starting-lineup builder (RR.lineup, #lineup).
//
// A sub-screen of Players: drop your six on-court players into the rotation zones
// and see them on a court diagram. Persists as team.lineup ({ zone -> playerId }),
// so it survives reloads and rides along in the backup. Reuses RR.diagram for the
// court and RR.photos for initials. A player can only occupy one zone at a time.
// Semantic tokens + the fixed diagram hues only, so both themes pass contrast.
window.RR = window.RR || {};

RR.lineup = (function () {
  "use strict";

  var ui = RR.ui;
  var h = ui.h;

  // Court zones (net at the top). Front row: 4-3-2; back row: 5-6-1.
  var ZONES = [
    { z: 1, x: 7.1, y: 7, row: "back",  label: "Zone 1 · back-right (serves first)" },
    { z: 2, x: 7.1, y: 3, row: "front", label: "Zone 2 · front-right" },
    { z: 3, x: 4.5, y: 3, row: "front", label: "Zone 3 · front-middle" },
    { z: 4, x: 1.9, y: 3, row: "front", label: "Zone 4 · front-left" },
    { z: 5, x: 1.9, y: 7, row: "back",  label: "Zone 5 · back-left" },
    { z: 6, x: 4.5, y: 7, row: "back",  label: "Zone 6 · back-middle" }
  ];
  // Render the selects in a natural reading order (front row first, then back).
  var SELECT_ORDER = [4, 3, 2, 5, 6, 1];

  function activeTeam() { return (RR.state && RR.state.getState().team) || null; }
  function cloneTeam() {
    var t = activeTeam();
    return t ? JSON.parse(JSON.stringify(t)) : null;
  }
  function getLineup() {
    var t = activeTeam();
    return (t && t.lineup && typeof t.lineup === "object") ? t.lineup : {};
  }
  function setZone(zone, playerId) {
    var team = cloneTeam();
    if (!team) return;
    var lineup = (team.lineup && typeof team.lineup === "object") ? team.lineup : {};
    // A player can only stand in one zone — clear them from any other first.
    if (playerId) {
      Object.keys(lineup).forEach(function (z) { if (lineup[z] === playerId) delete lineup[z]; });
      lineup[zone] = playerId;
    } else {
      delete lineup[zone];
    }
    team.lineup = lineup;
    RR.state.update({ team: team });
  }
  function clearLineup() {
    var team = cloneTeam();
    if (!team) return;
    team.lineup = {};
    RR.state.update({ team: team });
  }

  function render(host) {
    if (!(RR.team && RR.team.isSetUp && RR.team.isSetUp())) {
      host.appendChild(ui.emptyState({
        title: "Set up a team first",
        blurb: "Create your team on the Teams tab and add players, then build a lineup here.",
        btnLabel: "Go to Teams", hash: "#team"
      }));
      return;
    }

    var back = h("a", { class: "btn btn-ghost pl-back", href: "#players" }, [
      h("span", { "aria-hidden": "true", html: ui.icon('<path d="M15 18l-6-6 6-6"/>', 18) }),
      "Players"
    ]);
    host.appendChild(back);

    var roster = RR.roster.getSortedRoster();
    if (!roster.length) {
      host.appendChild(ui.emptyState({
        title: "No players yet",
        blurb: "Add players to your squad first, then place them into the rotation here.",
        btnLabel: "Add players", hash: "#players"
      }));
      return;
    }

    host.appendChild(h("p", { class: "screen-sub",
      text: "Place your starting six. Numbers are the rotation zones — players rotate clockwise 1→6." }));

    var body = h("div", { class: "lineup-body" });
    host.appendChild(body);
    paint();

    function paint() {
      body.innerHTML = "";
      body.appendChild(courtCard());
      body.appendChild(slotsCard());
      body.appendChild(h("section", { class: "card lineup-tips" }, [
        h("span", { class: "eyebrow", text: "Overlap basics" }),
        h("p", { class: "muted", text: "At the moment the server contacts the ball, each player must be in their rotational order: front-row players ahead of their back-row partner, and right/centre/left in order across each row. Once the ball is served, players can move anywhere." })
      ]));
      var clear = h("button", { type: "button", class: "btn btn-ghost btn-block lineup-clear" }, ["Clear lineup"]);
      clear.addEventListener("click", function () {
        if (window.confirm("Clear the whole lineup?")) { clearLineup(); paint(); }
      });
      body.appendChild(clear);
    }

    function courtCard() {
      var lineup = getLineup();
      var players = ZONES.map(function (zoneDef) {
        var id = lineup[zoneDef.z];
        var p = id && playerById(roster, id);
        return {
          x: zoneDef.x, y: zoneDef.y,
          team: p ? (zoneDef.row === "front" ? "a" : "b") : "n",
          label: p ? (p.number || RR.photos.initials(p.name)) : String(zoneDef.z),
          note: p ? firstName(p.name) : "Zone " + zoneDef.z
        };
      });
      var spec = {
        w: 9, h: 9, net: 1.2, lines: [{ y: 4.2 }], players: players,
        legend: [
          { tone: "a", text: "Front row" },
          { tone: "b", text: "Back row" },
          { tone: "n", text: "Empty zone" }
        ],
        caption: "Net at the top. Discs show each zone’s player (number or initials)."
      };
      var card = h("section", { class: "card lineup-court" }, [ui.sectionTitle("On the court", null, "h2")]);
      if (RR.diagram && RR.diagram.figure) {
        var fig = RR.diagram.figure(spec);
        if (fig) card.appendChild(h("div", { class: "lineup-court__fig" }, [fig]));
      }
      return card;
    }

    function slotsCard() {
      var lineup = getLineup();
      var card = h("section", { class: "card lineup-slots" }, [ui.sectionTitle("Assign zones", null, "h2")]);
      SELECT_ORDER.forEach(function (zoneNum) {
        var def = zoneFor(zoneNum);
        var sel = h("select", { class: "input", "aria-label": def.label });
        sel.appendChild(h("option", { value: "", text: "— empty —", selected: !lineup[zoneNum] }));
        roster.forEach(function (p) {
          sel.appendChild(h("option", {
            value: p.id,
            text: (p.number ? "#" + p.number + " " : "") + p.name + (p.position ? " · " + RR.positions.abbr(p.position) : ""),
            selected: lineup[zoneNum] === p.id
          }));
        });
        sel.addEventListener("change", function () { setZone(zoneNum, sel.value || null); paint(); });
        card.appendChild(h("div", { class: "field lineup-slot" }, [
          h("label", { class: "field-label", text: def.label }), sel
        ]));
      });
      return card;
    }
  }

  function zoneFor(z) {
    for (var i = 0; i < ZONES.length; i++) if (ZONES[i].z === z) return ZONES[i];
    return ZONES[0];
  }
  function playerById(roster, id) {
    for (var i = 0; i < roster.length; i++) if (roster[i].id === id) return roster[i];
    return null;
  }
  function firstName(name) { return String(name || "").trim().split(/\s+/)[0] || ""; }

  return { render: render };
})();
