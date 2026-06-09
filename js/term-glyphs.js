// term-glyphs.js — RR.termGlyphs: tiny inline-SVG glyphs for the glossary.
//
// The Tips glossary defines a lot of SPATIAL ideas in words (shot angles, the
// attack line, a seam, the approach…). A tiny schematic court/arrow glyph next
// to those terms makes them click instantly — "show, don't just tell". These
// are crisp inline SVG (sharp at thumbnail size, re-theme in dark mode) rather
// than raster images. Colours come from the same brand tokens the court
// diagrams use (--coral = your team, --teal = the other team/block, --slate =
// neutral), so a glyph always reads the same as the big diagrams.
//
// Keyed by a slug of the glossary term (parentheticals stripped), so coaching.js
// can look one up with RR.termGlyphs.for(term). No DOM dependencies, no network.
window.RR = window.RR || {};

RR.termGlyphs = (function () {
  "use strict";

  var VB = "0 0 48 40";

  // The shared arrowhead marker — injected ONCE into the page (a 0-size svg) so
  // every glyph can reference url(#tg-ah) without colliding ids.
  function defs() {
    return '<svg class="tg-defs" width="0" height="0" aria-hidden="true" focusable="false">' +
      '<defs><marker id="tg-ah" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="5.5" ' +
      'markerHeight="5.5" orient="auto-start-reverse">' +
      '<path d="M0 0L10 5L0 10z" class="tg-ah-fill"/></marker></defs></svg>';
  }

  // ---- primitives (all in the 48x40 user space) ----
  var COURT = '<rect class="tg-court" x="5" y="5" width="38" height="30" rx="3"/>';
  var NET   = '<line class="tg-net" x1="5" y1="5" x2="43" y2="5"/>';
  function dot(cls, x, y, r) { return '<circle class="' + cls + '" cx="' + x + '" cy="' + y + '" r="' + (r || 3) + '"/>'; }
  function a(x, y, r) { return dot("tg-a", x, y, r); }   // your player (coral)
  function b(x, y, r) { return dot("tg-b", x, y, r); }   // block / other (teal)
  function n(x, y, r) { return dot("tg-n", x, y, r); }   // neutral (slate)
  function arr(d) { return '<path class="tg-arr" d="' + d + '" marker-end="url(#tg-ah)"/>'; }
  function foot(x, y) { return '<ellipse class="tg-foot" cx="' + x + '" cy="' + y + '" rx="3" ry="1.8"/>'; }
  function ball(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<circle r="3.2" class="tg-ball-face"/>' +
      '<path class="tg-ball-seam" d="M-3 -0.6 q 3 1.8 6 0"/>' +
      '<path class="tg-ball-seam" d="M0 -3 q 1.6 3 0 6"/></g>';
  }

  // ---- the glyphs (keyed by term slug) ----
  var G = {
    // shot angles (top-down: net at top, attacker on the near/bottom side)
    "cross-court-attack": COURT + NET + a(35, 29) + arr("M34 27 L13 9"),
    "line-shot":          COURT + NET + a(35, 29) + arr("M36 27 L38 10"),
    "cut-shot":           COURT + NET + a(34, 13) + arr("M32 15 Q 16 18 8 25"),
    "dink":               COURT + NET + b(20, 8) + b(27, 8) + a(23, 29) + arr("M23 27 Q 25 6 31 14"),
    "roll-shot":          COURT + NET + b(20, 8) + b(27, 8) + a(23, 30) + arr("M23 28 C 22 2 37 4 35 17"),
    "off-speed-shot":     COURT + NET + a(24, 30) + arr("M24 28 Q 18 12 33 12"),
    "tool":               COURT + NET + b(21, 8) + b(28, 8) + a(24, 31) + arr("M24 29 L24.5 11 L43 6"),

    // court geography
    "attack-line":        COURT + NET + '<line class="tg-line" x1="5" y1="16" x2="43" y2="16"/>' + a(24, 27),
    "seam":               COURT + NET + n(16, 25) + n(32, 25) + arr("M24 7 L24 21"),
    "pipe":               COURT + NET + a(24, 30) + arr("M24 28 L24 9"),
    "antenna":            '<line class="tg-net" x1="6" y1="13" x2="42" y2="13"/>' +
                          '<line class="tg-rod" x1="11" y1="5" x2="11" y2="22"/>' +
                          '<line class="tg-rod" x1="37" y1="5" x2="37" y2="22"/>' + ball(24, 13),

    // movement / footwork
    "approach":           COURT + NET + foot(11, 31) + foot(19, 29) + foot(27, 31) + arr("M32 30 Q 38 18 38 10"),
    "slide":              COURT + NET + arr("M11 12 Q 26 7 36 12") + a(37, 13),
    "rotation":           COURT + n(15, 15, 2.4) + n(24, 15, 2.4) + n(33, 15, 2.4) +
                          n(15, 28, 2.4) + n(24, 28, 2.4) + n(33, 28, 2.4) + arr("M36 29 Q 42 21 37 14"),

    // at the net
    "roof":               COURT + NET + b(22, 7) + b(28, 7) + arr("M35 4 L26 8 L25 24"),
    "dump":               COURT + NET + a(19, 11) + arr("M20 10 Q 26 3 31 13")
  };
  // synonyms → same glyph
  G["block"] = G["roof"];
  G["setter-dump"] = G["dump"];

  function slug(term) {
    return String(term == null ? "" : term)
      .toLowerCase()
      .replace(/\(.*?\)/g, " ")        // drop parentheticals e.g. "Dink (tip)"
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  function has(term) { return !!G[slug(term)]; }
  function forTerm(term) {
    var inner = G[slug(term)];
    if (!inner) return null;
    return '<svg class="tg" viewBox="' + VB + '" role="img" aria-hidden="true" focusable="false">' + inner + "</svg>";
  }

  return { defs: defs, "for": forTerm, has: has, slug: slug, GLYPHS: G };
})();
