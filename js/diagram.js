// diagram.js — tiny declarative court-diagram engine (RR.diagram).
//
// Turns a compact, data-only spec into an accessible inline-SVG figure: a
// top-down volleyball court with player spots, ball/movement arrows, target
// zones, cones and a net. It exists so a coach can SEE where people stand and
// where the ball goes, instead of decoding a paragraph — the #1 thing missing
// from a text-only drill card.
//
// OFFLINE-SAFE: pure SVG built from a string, no images, no network. Colours
// come from CSS classes (styled in css/diagram.css) so the diagram re-themes in
// dark mode and always meets contrast — never hard-coded hex here.
//
// COORDINATES: a stylised grid in "court units", x→right, y→down (near side at
// the bottom). It is schematic, not to FIVB scale, so each diagram can choose a
// width/height that reads well on a ~360px phone. The engine keeps the x and y
// scale equal, so circles stay round and arrows keep their angle.
window.RR = window.RR || {};

RR.diagram = (function () {
  "use strict";

  // Target on-screen size budget (px). We fit the spec's unit grid inside this
  // box at a single shared scale, so tall (full-court) diagrams stay phone-sized.
  var MAX_W = 300;
  var MAX_H = 380;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  // Serialise an attribute map into a string. Numbers are rounded to 0.1px so the
  // markup stays small and stable.
  function attrs(map) {
    var out = "";
    for (var k in map) {
      if (!map.hasOwnProperty(k) || map[k] == null) continue;
      var v = map[k];
      if (typeof v === "number") v = Math.round(v * 10) / 10;
      out += " " + k + '="' + esc(v) + '"';
    }
    return out;
  }
  function el(tag, map, inner) {
    return "<" + tag + attrs(map) + ">" + (inner || "") + "</" + tag + ">";
  }
  function selfEl(tag, map) { return "<" + tag + attrs(map) + "/>"; }

  // ---- The single arrowhead marker set, shared by every path ----------------
  function defs() {
    function marker(id, cls) {
      return el("marker", {
        id: id, viewBox: "0 0 10 10", refX: 8, refY: 5,
        markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse"
      }, selfEl("path", { d: "M0 0L10 5L0 10z", class: cls }));
    }
    return el("defs", {},
      marker("dgm-arrow-ball", "dgm-arrowhead dgm-arrowhead--ball") +
      marker("dgm-arrow-move", "dgm-arrowhead dgm-arrowhead--move") +
      marker("dgm-arrow-serve", "dgm-arrowhead dgm-arrowhead--serve"));
  }

  // ---- A small volleyball glyph (the app motif) for "ball" markers ----------
  function ballGlyph(cx, cy, r) {
    return el("g", { class: "dgm-ball", transform: "translate(" + r2(cx) + " " + r2(cy) + ")" }, [
      selfEl("circle", { r: r, class: "dgm-ball__face" }),
      selfEl("path", { class: "dgm-ball__seam", d: "M" + (-r) + " " + (-r * 0.2) + "q" + r + " " + (r * 0.6) + " " + (2 * r) + " 0" }),
      selfEl("path", { class: "dgm-ball__seam", d: "M0 " + (-r) + "q" + (r * 0.5) + " " + r + " 0 " + (2 * r) })
    ].join(""));
  }
  function r2(n) { return Math.round(n * 10) / 10; }

  // ---- Build the SVG markup string from a spec ------------------------------
  function svgMarkup(spec) {
    var w = spec.w || 9, hUnits = spec.h || 12;
    // One shared scale that fits the unit grid inside the screen budget.
    var scale = Math.min(MAX_W / w, MAX_H / hUnits);
    var PAD = 16;
    var pw = w * scale + PAD * 2;
    var ph = hUnits * scale + PAD * 2;
    function px(x) { return PAD + x * scale; }
    function py(y) { return PAD + y * scale; }
    var pieces = [defs()];

    // Court rectangles (one or many). Default: the whole grid is the court.
    var courts = spec.court || [{ x: 0, y: 0, w: w, h: hUnits }];
    if (!Array.isArray(courts)) courts = [courts];
    courts.forEach(function (c) {
      pieces.push(selfEl("rect", {
        x: px(c.x), y: py(c.y), width: c.w * scale, height: c.h * scale,
        rx: 4, class: "dgm-court"
      }));
    });

    // Shaded target / good / avoid zones (carry a label).
    (spec.zones || []).forEach(function (z) {
      pieces.push(selfEl("rect", {
        x: px(z.x), y: py(z.y), width: z.w * scale, height: z.h * scale,
        rx: 3, class: "dgm-zone dgm-zone--" + (z.tone || "target")
      }));
      if (z.label) {
        pieces.push(el("text", {
          x: px(z.x + z.w / 2), y: py(z.y + z.h / 2),
          class: "dgm-zonelabel", "text-anchor": "middle", "dominant-baseline": "central"
        }, esc(z.label)));
      }
    });

    // Net (a thick dashed line with end posts) + 3m / attack lines.
    if (spec.net != null) {
      pieces.push(selfEl("line", {
        x1: px(0), y1: py(spec.net), x2: px(w), y2: py(spec.net), class: "dgm-net"
      }));
      pieces.push(selfEl("circle", { cx: px(0), cy: py(spec.net), r: 3.2, class: "dgm-post" }));
      pieces.push(selfEl("circle", { cx: px(w), cy: py(spec.net), r: 3.2, class: "dgm-post" }));
    }
    (spec.lines || []).forEach(function (ln) {
      if (ln.y != null) pieces.push(selfEl("line", {
        x1: px(0), y1: py(ln.y), x2: px(w), y2: py(ln.y), class: "dgm-line"
      }));
      if (ln.x != null) pieces.push(selfEl("line", {
        x1: px(ln.x), y1: py(0), x2: px(ln.x), y2: py(hUnits), class: "dgm-line"
      }));
    });

    // Paths: ball flight (solid), movement (dashed), serve (solid accent).
    // Labels are collected and drawn in a final overlay pass (after the player
    // discs) so a disc can never paint over — and clip — the start of a label
    // whose path begins on a player. They keep their own CSS halo for contrast.
    var pathLabels = [];
    (spec.paths || []).forEach(function (p) {
      var k = p.kind || "ball";
      var a = p.from, b = p.to;
      var d, apexX, apexY;
      if (p.curve) {
        // A simple quadratic bow so two arrows between the same spots don't overlap.
        var mx = (a[0] + b[0]) / 2 + (p.curve) * (b[1] - a[1]) * 0.4;
        var my = (a[1] + b[1]) / 2 - (p.curve) * (b[0] - a[0]) * 0.4;
        d = "M" + px(a[0]) + " " + py(a[1]) + "Q" + px(mx) + " " + py(my) +
            " " + px(b[0]) + " " + py(b[1]);
        // Apex of the quadratic at t=0.5 (in unit space) — the bowed middle,
        // which is further from the endpoints (and their discs) than the chord.
        apexX = 0.25 * a[0] + 0.5 * mx + 0.25 * b[0];
        apexY = 0.25 * a[1] + 0.5 * my + 0.25 * b[1];
      } else {
        d = "M" + px(a[0]) + " " + py(a[1]) + "L" + px(b[0]) + " " + py(b[1]);
        apexX = (a[0] + b[0]) / 2;
        apexY = (a[1] + b[1]) / 2;
      }
      pieces.push(selfEl("path", {
        d: d, class: "dgm-path dgm-path--" + k, "marker-end": "url(#dgm-arrow-" + k + ")"
      }));
      if (p.label) {
        // Nudge the label off the path, perpendicular to its direction, so it
        // sits in open space beside the line instead of straddling a disc.
        // Bias the offset upward for shallow paths so labels read above them.
        var dx = b[0] - a[0], dy = b[1] - a[1];
        var len = Math.hypot(dx, dy) || 1;
        var nx = -dy / len, ny = dx / len;            // unit perpendicular
        if (ny > 0) { nx = -nx; ny = -ny; }           // keep the nudge upward
        pathLabels.push(el("text", {
          x: px(apexX) + nx * 11, y: py(apexY) + ny * 11 - 2,
          class: "dgm-pathlabel", "text-anchor": "middle"
        }, esc(p.label)));
      }
    });

    // Cones (small triangles).
    (spec.cones || []).forEach(function (c) {
      var s = scale * 0.34;
      var cx = px(c.x), cy = py(c.y);
      pieces.push(selfEl("path", {
        d: "M" + cx + " " + (cy - s) + "L" + (cx + s) + " " + (cy + s) +
           "L" + (cx - s) + " " + (cy + s) + "z", class: "dgm-cone"
      }));
    });

    // Loose balls drawn as the volleyball glyph.
    (spec.balls || []).forEach(function (bl) {
      pieces.push(ballGlyph(px(bl.x), py(bl.y), Math.max(6, scale * 0.32)));
    });

    // Players: a coloured disc + short label, optional tiny role note beneath.
    var r = Math.max(11, scale * 0.42);
    (spec.players || []).forEach(function (pl) {
      var cx = px(pl.x), cy = py(pl.y);
      var team = pl.team || "n";
      pieces.push(selfEl("circle", { cx: cx, cy: cy, r: r, class: "dgm-player dgm-player--" + team }));
      if (pl.label != null && pl.label !== "") {
        pieces.push(el("text", {
          x: cx, y: cy, class: "dgm-playerlabel dgm-playerlabel--" + team,
          "text-anchor": "middle", "dominant-baseline": "central"
        }, esc(pl.label)));
      }
      if (pl.note) {
        pieces.push(el("text", {
          x: cx, y: cy + r + 9, class: "dgm-playernote", "text-anchor": "middle"
        }, esc(pl.note)));
      }
    });

    // Path labels overlay everything else (their halo keeps them legible), so a
    // disc or note drawn after a path can never clip the label's text.
    pathLabels.forEach(function (t) { pieces.push(t); });

    return el("svg", {
      viewBox: "0 0 " + r2(pw) + " " + r2(ph),
      class: "dgm-svg", "aria-hidden": "true", focusable: "false",
      preserveAspectRatio: "xMidYMid meet"
    }, pieces.join(""));
  }

  // ---- Public: build a <figure> node from a spec ----------------------------
  // The figure carries role="img" + (title +) caption as its accessible name, so
  // a screen reader gets the same meaning the sighted coach reads.
  //   opts.fallbackTitle — used as the step heading when the spec has no title
  //   of its own (e.g. auto "Step 2" for a multi-part drill).
  function figure(spec, opts) {
    if (!spec) return null;
    opts = opts || {};
    var title = spec.title || opts.fallbackTitle || null;
    var fig = document.createElement("figure");
    fig.className = "dgm";
    fig.setAttribute("role", "img");
    var label = (title ? title + ". " : "") + (spec.caption || "");
    if (label) fig.setAttribute("aria-label", label);
    if (title) {
      var head = document.createElement("p");
      head.className = "dgm__title";
      head.textContent = title;
      fig.appendChild(head);
    }

    // Prefer a vetted AI illustration. Otherwise show a placeholder (this diagram
    // is part of the image program but its picture isn't generated yet) or the
    // schematic SVG (specs with no template/img — the live lineup builder and
    // bespoke one-off scenes — always keep their SVG).
    var mode = (RR.diagramImages && RR.diagramImages.resolve)
      ? RR.diagramImages.resolve(spec) : { kind: "svg" };

    if (mode.kind === "img") {
      var box = document.createElement("div");
      box.className = "dgm__canvas dgm__canvas--img";
      var img = document.createElement("img");
      img.className = "dgm__img";
      img.src = mode.image.src;
      img.alt = mode.image.alt || label || "Court diagram";
      img.loading = "lazy";
      img.decoding = "async";
      box.appendChild(img);
      fig.appendChild(box);
      // The illustration has its legend baked in — skip the DOM legend.
    } else if (mode.kind === "placeholder") {
      fig.appendChild(placeholder());
      if (spec.legend && spec.legend.length) fig.appendChild(legend(spec.legend));
    } else {
      var holder = document.createElement("div");
      holder.className = "dgm__canvas";
      holder.innerHTML = svgMarkup(spec);
      fig.appendChild(holder);
      if (spec.legend && spec.legend.length) fig.appendChild(legend(spec.legend));
    }

    if (spec.caption) {
      var cap = document.createElement("figcaption");
      cap.className = "dgm__cap";
      cap.textContent = spec.caption;
      fig.appendChild(cap);
    }
    return fig;
  }

  // A small "illustration coming soon" stand-in for a program diagram whose
  // picture isn't generated yet. The surrounding title/caption/legend still
  // carry the meaning, so nothing is lost while the image set is completed.
  function placeholder() {
    var box = document.createElement("div");
    box.className = "dgm__canvas dgm__placeholder";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML =
      "<svg viewBox='0 0 24 24' class='dgm__ph-icon' focusable='false' aria-hidden='true'>" +
      "<rect x='3' y='4' width='18' height='16' rx='2'/>" +
      "<circle cx='8.5' cy='9.5' r='1.6'/>" +
      "<path d='M21 15l-5-5L5 20'/></svg>" +
      "<span class='dgm__ph-text'>Illustration coming soon</span>";
    return box;
  }

  // A small key (swatch + word) for diagrams whose colours carry meaning.
  function legend(items) {
    var wrap = document.createElement("ul");
    wrap.className = "dgm__legend";
    items.forEach(function (it) {
      var li = document.createElement("li");
      li.className = "dgm__legend-item";
      var dot = document.createElement("span");
      dot.className = "dgm__swatch dgm__swatch--" + (it.tone || "n");
      dot.setAttribute("aria-hidden", "true");
      li.appendChild(dot);
      li.appendChild(document.createTextNode(it.text));
      wrap.appendChild(li);
    });
    return wrap;
  }

  return { figure: figure, svgMarkup: svgMarkup };
})();
