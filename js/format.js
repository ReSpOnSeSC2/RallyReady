// format.js — "How it's organized" for every drill (RR.format).
//
// The drill cards explained WHAT to do but never HOW the team is set up: does
// everyone go at once or one at a time? who counts the score? where do people
// stand? This module answers that for ALL 215 drills.
//
// It works in two tiers (the "smart-tiered" approach):
//   1. derive(d)  — a real, specific organization read-out built from the drill's
//      own attributes (player count, equipment, game-vs-drill, duration). Never a
//      placeholder; every drill gets a concrete answer.
//   2. overrides  — hand-authored detail in RR.extras[id].format for the games
//      and position-critical drills, merged OVER the derived defaults.
//
// Pure data/logic. Rendering lives in js/ui.js (organizeSection).
window.RR = window.RR || {};

RR.format = (function () {
  "use strict";

  function has(d, item) { return !!(d.equipment && d.equipment.indexOf(item) !== -1); }

  // Derive a {grouping, flow, tracking, space, aim} read-out from real fields.
  function derive(d) {
    var mp = d.minPlayers || 1;
    var net = has(d, "net"), wall = has(d, "wall"), balls = has(d, "balls");
    var o = {};

    // --- Grouping: how the squad splits up --------------------------------
    if (mp <= 1) {
      o.grouping = wall
        ? "On your own — every player takes a spot along the wall so the whole team goes at once."
        : "On your own — spread out so everyone works at the same time. Pair up to feed or shag balls if you can.";
    } else if (mp === 2) {
      o.grouping = "In pairs. Split the squad into twos; odd player out joins a trio or rotates in.";
    } else if (mp === 3) {
      o.grouping = "In groups of three.";
    } else if (mp <= 5) {
      o.grouping = "In small groups of " + mp + ".";
    } else {
      o.grouping = d.isGame
        ? "Two teams on the court; any extra players wait just off the court and rotate in."
        : "As a full team in one court formation.";
    }

    // --- Flow: simultaneous vs. taking turns -------------------------------
    if (d.isGame) {
      o.flow = mp <= 2
        ? "Head-to-head — winner keeps playing, loser swaps with someone waiting."
        : "Everyone is in the game; rotate positions so no one is parked in one spot.";
    } else if (mp <= 3) {
      o.flow = (net && balls)
        ? "All groups work at the same time — no lines. Shag and reset between rounds so reps stay high."
        : "All groups work at the same time — no standing in line.";
    } else {
      o.flow = "Run it as one group; rotate players through each role so everyone gets reps.";
    }

    // --- Tracking: who is responsible for the count ------------------------
    o.tracking = d.isGame
      ? "Players call their own score out loud; the coach confirms the result and keeps the running total."
      : "Players count their own reps; the coach circulates, watches technique, and feeds the cues below.";

    // --- Space: where it happens ------------------------------------------
    o.space = net ? "At the net, using the full court width."
      : wall ? "Against a flat wall with room to move."
      : "Any open area — no net needed.";

    // --- Aim: a concrete time / target so it doesn't drift -----------------
    var min = d.durationMin || 10;
    o.aim = d.isGame
      ? "Play about " + min + " min, then crown a winner or log the team's best score for next time."
      : "About " + min + " min of work — chase clean, repeatable reps rather than rushing.";

    return o;
  }

  // Merge authored overrides (if any) over the derived defaults.
  function fields(d) {
    var base = derive(d);
    var ov = (RR.extras && RR.extras[d.id] && RR.extras[d.id].format) || null;
    if (ov) for (var k in ov) if (ov.hasOwnProperty(k) && ov[k]) base[k] = ov[k];
    return base;
  }

  // Ordered, labelled rows for rendering (blanks dropped).
  var ROWS = [
    { key: "grouping", label: "Grouping" },
    { key: "flow",     label: "How it runs" },
    { key: "tracking", label: "Tracking" },
    { key: "space",    label: "Where" },
    { key: "aim",      label: "Aim for" }
  ];
  function rows(d) {
    var f = fields(d);
    return ROWS.filter(function (r) { return !!f[r.key]; })
      .map(function (r) { return { label: r.label, text: f[r.key] }; });
  }

  // The court diagram spec for this drill, if one was authored.
  function diagram(d) {
    return (RR.extras && RR.extras[d.id] && RR.extras[d.id].diagram) || null;
  }

  return { rows: rows, fields: fields, diagram: diagram };
})();
