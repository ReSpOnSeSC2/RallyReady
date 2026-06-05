// season.js — the Season / Camp screen (RR.season.renderSeason).
//
// This screen VISUALISES the plan that js/periodization.js computes; it holds no
// planning logic of its own. It adapts to team.programType:
//   • Season -> a horizontal intensity curve across the four prep phases
//               (Foundation→Development→Peak→Taper) from the first practice to the
//               opener, with a "Today" marker, then an In-season card.
//   • Camp   -> a Day 1…N strip (one cell per day, coloured by camp phase) whose
//               heights rise then ease on the final Showcase day.
// Below the chart, one card per phase explains the focus, intensity and the "why".
//
// All colours come from semantic tokens except the fixed intensity hues
// (--i-easy/mid/hard/taper), so it reads correctly in BOTH light and dark themes.
window.RR = window.RR || {};

RR.season = (function () {
  "use strict";

  var P = RR.periodization;
  var SVGNS = "http://www.w3.org/2000/svg";

  // ---- Tiny DOM helpers (mirrors team.js; RR.ui helpers arrive in Prompt 8) --
  function h(tag, props, kids) {
    var node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v == null || v === false) return;
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else if (k === "html") node.innerHTML = v;
        else if (k.slice(0, 2) === "on" && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
        else node.setAttribute(k, v === true ? "" : v);
      });
    }
    append(node, kids);
    return node;
  }
  function append(node, kids) {
    if (kids == null) return;
    if (Array.isArray(kids)) kids.forEach(function (k) { append(node, k); });
    else if (kids instanceof Node) node.appendChild(kids);
    else node.appendChild(document.createTextNode(String(kids)));
  }
  function svg(tag, attrs, kids) {
    var el = document.createElementNS(SVGNS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    if (kids) (Array.isArray(kids) ? kids : [kids]).forEach(function (c) { if (c) el.appendChild(c); });
    return el;
  }

  // ---- Date formatting (display only; date math lives in RR.periodization) ---
  function pIso(iso) {
    if (!iso) return null;
    var p = String(iso).split("-");
    return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null;
  }
  function prettyDate(iso) {
    var d = pIso(iso);
    return d ? d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "";
  }
  function prettyShort(iso) {
    var d = pIso(iso);
    return d ? d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";
  }
  function plural(n, word) { n = Math.max(0, n); return n + " " + word + (n === 1 ? "" : "s"); }

  // ======================================================================= //
  //  "Today" context — where the team is right now                          //
  // ======================================================================= //
  function computeToday(plan) {
    var todayISO = P.toISO(new Date());
    var DB = P.daysBetween;
    var cur = P.phaseForDate(plan, todayISO);
    var info = { currentKey: cur ? cur.key : null, show: true, pos: 0, label: "Today", statusText: "" };

    if (plan.type === "camp") {
      var N = plan.lengthDays;
      var raw = DB(plan.startDate, todayISO) + 1;          // raw day number (may be <1 or >N)
      var day = Math.max(1, Math.min(N, raw));
      info.pos = ((day - 0.5) / N) * 100;
      if (raw < 1) {
        info.label = "Soon";
        info.statusText = "Camp starts in " + plural(DB(todayISO, plan.startDate), "day") + " — " + prettyDate(plan.startDate) + ".";
      } else if (raw > N) {
        info.label = "Wrapped";
        info.statusText = "Camp's a wrap — nice work! It ran " + prettyShort(plan.startDate) + " – " + prettyShort(plan.endDate) + ".";
      } else {
        info.statusText = "Today is Day " + day + " of " + N + " · " + cur.label + " phase.";
      }
      return info;
    }

    // Season
    var L = plan.lengthDays;
    if (todayISO < plan.startDate) {
      info.pos = 0; info.label = "Soon";
      info.statusText = "Practices start in " + plural(DB(todayISO, plan.startDate), "day") + " — " + prettyDate(plan.startDate) + ".";
    } else if (todayISO >= plan.seasonStart) {
      info.show = false;                                    // prep window is behind us
      info.statusText = "Your season is underway — In-season maintenance. First game was " + prettyDate(plan.seasonStart) + ".";
    } else {
      info.pos = Math.max(0, Math.min(100, (DB(plan.startDate, todayISO) / L) * 100));
      info.statusText = "You're in the " + cur.label + " phase · " + plural(DB(todayISO, plan.seasonStart), "day") + " to your first game (" + prettyDate(plan.seasonStart) + ").";
    }
    return info;
  }

  // ======================================================================= //
  //  The chart (season curve / camp strip)                                  //
  // ======================================================================= //
  // Coordinate space: 1000 wide so x maps cleanly to percentages for the HTML
  // overlays; the SVG scales to the container width with a fixed aspect ratio.
  var VBW = 1000, VBH = 320, TOP = 30, BASE = 300, USABLE = BASE - TOP;

  function chartSegments(plan) {
    var segs = [];
    if (plan.type === "camp") {
      var N = plan.lengthDays;
      for (var d = 1; d <= N; d++) {
        var iso = P.addDays(plan.startDate, d - 1);
        segs.push({ x0: (d - 1) / N * VBW, x1: d / N * VBW, intensity: P.intensityForDate(plan, iso), color: P.phaseForDate(plan, iso).color });
      }
    } else {
      var L = plan.lengthDays;
      plan.phases.forEach(function (ph) {
        if (ph.key === "inseason") return;                  // timeline runs to the opener only
        segs.push({ x0: ph.startOffset / L * VBW, x1: ph.endOffset / L * VBW, intensity: ph.targetIntensity, color: ph.color });
      });
    }
    return segs;
  }

  function buildChart(plan, today) {
    var segs = chartSegments(plan);
    var gap = segs.length > 14 ? 2 : (segs.length > 6 ? 3 : 6);
    var s = svg("svg", { viewBox: "0 0 " + VBW + " " + VBH, class: "chart__svg", "aria-hidden": "true" });

    // baseline
    s.appendChild(svg("line", { x1: 0, y1: BASE + 0.5, x2: VBW, y2: BASE + 0.5, class: "chart__baseline" }));

    // phase/day columns (heights = intensity) + collect tops for the curve
    var pts = [];
    segs.forEach(function (seg) {
      var w = Math.max(1, (seg.x1 - seg.x0) - gap);
      var x = seg.x0 + gap / 2;
      var hgt = Math.max(8, (Math.min(10, seg.intensity) / 10) * USABLE);
      var y = BASE - hgt;
      s.appendChild(svg("rect", { x: x.toFixed(1), y: y.toFixed(1), width: w.toFixed(1), height: hgt.toFixed(1), rx: 5, class: "chart__bar chart__bar--" + seg.color }));
      pts.push([(seg.x0 + seg.x1) / 2, y]);
    });

    // connecting "curve" across the tops + nodes (the readable intensity profile)
    if (pts.length > 1) {
      var dpath = "M" + pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" L");
      s.appendChild(svg("path", { d: dpath, class: "chart__curve", fill: "none" }));
    }
    pts.forEach(function (p) { s.appendChild(svg("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 8, class: "chart__node" })); });

    var label = plan.type === "camp"
      ? "Camp intensity rising from Welcome through Build, then easing for the Showcase on the final day."
      : "Season intensity rising through Foundation, Development and Peak, then easing for the Taper before the first game.";
    var wrap = h("div", { class: "chart", role: "img", "aria-label": label }, [s]);

    // "Today" marker (HTML overlay so the text stays crisp in both themes)
    if (today.show) {
      wrap.appendChild(h("div", { class: "chart__today", style: "left:" + today.pos.toFixed(2) + "%" }, [
        h("span", { class: "chart__today-flag", text: today.label })
      ]));
    }
    return wrap;
  }

  // Phase labels under the chart (double as the colour legend), widths matched
  // to each phase's share of the timeline.
  function buildPhaseRow(plan) {
    var row = h("div", { class: "chart__phases" });
    var items = [];
    if (plan.type === "camp") {
      var N = plan.lengthDays;
      plan.phases.forEach(function (ph) {
        items.push({ label: ph.label, color: ph.color, w: (ph.dayEnd - ph.dayStart + 1) / N * 100 });
      });
    } else {
      var L = plan.lengthDays;
      plan.phases.forEach(function (ph) {
        if (ph.key === "inseason") return;
        items.push({ label: ph.label, color: ph.color, w: (ph.endOffset - ph.startOffset) / L * 100 });
      });
    }
    items.forEach(function (it) {
      row.appendChild(h("span", { class: "chart__phase", style: "flex:0 1 " + it.w.toFixed(2) + "%" }, [
        h("i", { class: "chart__swatch chart__swatch--" + it.color, "aria-hidden": "true" }),
        h("span", { class: "chart__phase-name", text: it.label })
      ]));
    });
    return row;
  }

  function buildAxis(plan) {
    var left, right;
    if (plan.type === "camp") {
      left = "Day 1 · " + prettyShort(plan.startDate);
      right = "Day " + plan.lengthDays + " · " + prettyShort(plan.endDate);
    } else {
      left = prettyShort(plan.startDate);
      right = prettyShort(plan.seasonStart) + " · 1st game";
    }
    return h("div", { class: "chart__axis" }, [
      h("span", { text: left }),
      h("span", { text: right })
    ]);
  }

  function buildOverview(plan, today) {
    return h("section", { class: "card plan-overview" }, [
      h("div", { class: "plan-overview__head" }, [
        h("h2", { text: plan.type === "camp" ? "Camp day by day" : "Season intensity" }),
        h("span", { class: "badge", text: plan.label })
      ]),
      buildChart(plan, today),
      buildPhaseRow(plan),
      buildAxis(plan)
    ]);
  }

  // ======================================================================= //
  //  Phase cards                                                            //
  // ======================================================================= //
  function intensityDots(n, color) {
    var wrap = h("div", { class: "dots", "aria-hidden": "true" });
    for (var i = 1; i <= 10; i++) {
      wrap.appendChild(h("span", { class: "dot " + (i <= n ? "dot--on dot--" + color : "dot--off") }));
    }
    return wrap;
  }

  function phaseRangeText(plan, ph) {
    if (plan.type === "camp") {
      if (ph.dayStart === ph.dayEnd) return "Day " + ph.dayStart + " · " + prettyShort(ph.startDate);
      return "Days " + ph.dayStart + "–" + ph.dayEnd + " · " + prettyShort(ph.startDate) + " – " + prettyShort(ph.endDate);
    }
    if (ph.key === "inseason") return "From " + prettyDate(ph.startDate) + " (first game) onward";
    var days = ph.endOffset - ph.startOffset;
    var dur = days < 14 ? plural(days, "day") : Math.round(days / 7) + " weeks";
    return prettyShort(ph.startDate) + " – " + prettyShort(ph.endDate) + " · " + dur;
  }

  function phaseCard(plan, ph, isCurrent) {
    var card = h("section", { class: "card phase-card" + (isCurrent ? " is-current" : "") }, [
      h("div", { class: "phase-card__head" }, [
        h("span", { class: "phase-dot phase-dot--" + ph.color, "aria-hidden": "true" }),
        h("h3", { text: ph.label }),
        isCurrent ? h("span", { class: "pill phase-now", text: "Now" }) : null
      ]),
      h("p", { class: "phase-card__range", text: phaseRangeText(plan, ph) }),
      h("p", { class: "phase-card__focus", text: ph.focusSummary }),
      h("div", { class: "phase-card__intensity" }, [
        h("span", { class: "phase-card__intensity-label", text: "Intensity" }),
        intensityDots(ph.targetIntensity, ph.color),
        h("span", { class: "phase-card__intensity-num", text: ph.targetIntensity + " / 10" })
      ]),
      h("div", { class: "phase-card__why" }, [
        h("span", { class: "eyebrow", text: "Why it matters" }),
        h("p", { text: ph.why })
      ])
    ]);
    if (isCurrent) card.setAttribute("aria-current", "true");
    return card;
  }

  // ======================================================================= //
  //  Entry point                                                            //
  // ======================================================================= //
  function renderSeason(host) {
    var team = (RR.state && RR.state.getState().team) || null;
    var plan = P.computePlan(team);

    // The screen owns its heading text (the tab still reads "Season").
    var titleEl = host.querySelector(".screen-title");
    if (titleEl) titleEl.textContent = (team && team.programType === "camp") ? "Camp plan" : "Season plan";

    if (!plan) {
      host.appendChild(RR.team.emptyStateCard({
        title: "Set up your team first",
        blurb: "Add your season dates or camp length and RallyReady maps out the whole plan for you — phase by phase."
      }));
      return;
    }

    var today = computeToday(plan);
    host.appendChild(h("p", { class: "screen-sub season-status", text: today.statusText }));
    host.appendChild(buildOverview(plan, today));
    plan.phases.forEach(function (ph) {
      host.appendChild(phaseCard(plan, ph, ph.key === today.currentKey));
    });
  }

  return {
    renderSeason: renderSeason,
    render: renderSeason   // alias used by the router
  };
})();
