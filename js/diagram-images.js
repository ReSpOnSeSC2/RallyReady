// diagram-images.js — RR.diagramImages: the AI-illustrated diagram manifest.
//
// Maps a diagram "template key" to a vetted, optimized illustration that the
// renderers (RR.diagram.figure in js/diagram.js, RR.tipsVisuals in
// js/tips-visuals.js) show IN PLACE OF the schematic SVG. Keys come from:
//   • the court builders (js/extras-build.js) — each builder tags its spec with
//     `template: "<name>"` (serveTargets, acrossNet, …);
//   • a per-spec `img: "<key>"` override for hand-built scenes (e.g. freeball);
//   • the Tips skill set (js/tips-visuals.js) — keys "tips:<skill>";
//   • the position rotation spec (js/positions.js) — keys "rotation:<abbr>".
//
// A diagram is "in the image program" when its spec carries a `template` or
// `img` key. If we have a file for that key → show the picture. If it's in the
// program but the picture isn't generated yet → show FALLBACK (a labelled
// placeholder, or the original SVG). Specs with NO key (the live lineup builder,
// bespoke one-off drill scenes) always keep their SVG and are never touched.
//
// OFFLINE-SAFE: just a data map + tiny helpers, no network. The images
// themselves are runtime-cached by the service worker on first view.
window.RR = window.RR || {};

RR.diagramImages = (function () {
  "use strict";

  var BASE = "images/diagrams/";

  // What to show for a program diagram whose image isn't generated yet:
  //   "placeholder" — a small "illustration coming soon" card (keeps the
  //                   title, caption and legend so the meaning still reads);
  //   "svg"         — fall back to the original schematic SVG.
  // The full image set is now complete, so any NEW un-illustrated program
  // diagram shows a placeholder TODO. Call setFallback("svg") to fall back to
  // the schematic SVG instead.
  var FALLBACK = "placeholder";

  // key -> { file, alt }. ONLY list images that actually exist on disk, so
  // has()/get() are the single source of truth for "do we have this picture?".
  var MAP = {
    // ---- Part 1 — court templates (top-down) ----
    "serveTargets":  { file: "court-serve-targets.png",  alt: "Top-down court: three servers behind the near end line firing across the net into two highlighted target zones marked 1 and 5." },
    "acrossNet":     { file: "court-across-net.png",     alt: "Top-down court: a small-sided game with your team (coral) on the near side, the other team (teal) across the net, and grey players waiting off the sideline." },
    "circlePass":    { file: "court-circle-pass.png",    alt: "Players standing in a wide ring keeping one ball alive around the circle." },
    "pairsRows":     { file: "court-pairs-rows.png",     alt: "Pairs of players facing each other across the net, sending one ball back and forth." },
    "stations":      { file: "court-stations.png",       alt: "A two-by-two grid of numbered skill stations with an arrow showing the rotation order." },
    "coachFeed":     { file: "court-coach-feed.png",     alt: "Top-down half-court: a coach at the net feeding balls down to a line of back-court defenders." },
    "wall":          { file: "court-wall.png",           alt: "Players in a row facing a wall, rebounding a ball off it and resetting." },
    "feedLine":      { file: "court-feed-line.png",      alt: "A feeder sending a ball to the front player, who plays it to a target and jogs to the back of the waiting line." },
    "lanes":         { file: "court-lanes.png",          alt: "Players moving baseline to baseline in parallel warm-up lanes." },
    "approachPath":  { file: "court-approach-path.png",  alt: "Top-down court: one hitter's approach footwork into the net, the set arriving, and the swing over the net." },
    "basePositions": { file: "court-base-positions.png", alt: "Top-down half-court: the six base defensive positions with a coach attacking from across the net." },
    "freeball":      { file: "court-free-ball.png",      alt: "A three-on-three free-ball rally: the coach tosses a free ball and your side runs pass, set, then hit over the net." },
    "rotateIn":      { file: "court-king-queen.png",     alt: "Top-down court: King/Queen of the Court — your reigning team (coral) on the near side from behind, challengers (teal) across the net facing you, the scoring half tinted green, win/lose rotation arrows, and a queue of waiting teams." },

    // ---- Part 2 — Tips motion scenes (side view) ----
    "tips:blocking": { file: "tips-blocking.png", alt: "Side view: a blocker pressing both hands over the net to turn the attack straight back down." },
    "tips:setting":  { file: "tips-setting.png",  alt: "Side view: a setter taking the ball high in a relaxed triangle above the forehead and pushing it out to the hitter." },
    "tips:digging":  { file: "tips-digging.png",  alt: "Side view: a defender staying low with a flat platform to lift a hard-driven attack back up." },
    "tips:serving":  { file: "tips-serving.png",  alt: "Side view: a player serving overhand, the ball arcing up and over the net into a target on the far court." },
    "tips:passing":  { file: "tips-passing.png",  alt: "Side view: a player low with a flat forearm platform, popping an incoming serve up to a target." },
    "tips:hitting":  { file: "tips-hitting.png",  alt: "Side view: a player's approach footwork and jump, spiking the ball sharply down over the net into a target." },
    "tips:rotate":   { file: "tips-rotate.png",   alt: "Top-down half-court labeled NET: six position circles (front 4 3 2, back 5 6 1) with a looping arrow showing the clockwise rotation order 1, 6, 5, 4, 3, 2." },
    "tips:breathe":  { file: "tips-breathe.png",  alt: "A calm set of concentric coral and teal rings with the lowercase word breathe at the center — a reset-breath cue." },
    "tips:practice-flow": { file: "tips-practice-flow.png", alt: "A five-block practice timeline left to right: warm-up, two skill blocks, a game, then a cool-down, with time tick marks beneath." },

    // ---- Part 3 — position rotation zones (top-down half-court) ----
    "rotation:base": { file: "rotation-base.png", alt: "Top-down half-court labeled NET: the six rotation-zone circles in standard layout (front 4 3 2, back 5 6 1), all neutral grey." },
    "rotation:S":    { file: "rotation-setter.png",   alt: "Rotation zones with zone 1 (back-right) highlighted coral and labeled S — the setter's base." },
    "rotation:OH":   { file: "rotation-outside.png",  alt: "Rotation zones with zone 4 (front-left) highlighted coral and labeled OH — the outside hitter's base." },
    "rotation:OPP":  { file: "rotation-opposite.png", alt: "Rotation zones with zone 2 (front-right) highlighted coral and labeled OPP — the opposite's base." },
    "rotation:MB":   { file: "rotation-middle.png",   alt: "Rotation zones with zone 3 (front-center) highlighted coral and labeled MB — the middle blocker's base." },
    "rotation:L":    { file: "rotation-libero.png",   alt: "Rotation zones with zone 6 (back-center) highlighted coral and labeled L — the libero's base." },
    "rotation:DS":   { file: "rotation-ds.png",       alt: "Rotation zones with zone 5 (back-left) highlighted coral and labeled DS — the defensive specialist's base." },

    // ---- Part 4 — Tips tactics (top-down court strategy) ----
    "tactic:serve-receive": { file: "tactic-serve-receive.png", alt: "Top-down court: a five-player W serve-receive formation passing the serve up to the setter target near the net." },
    "tactic:transition":    { file: "tactic-transition.png",    alt: "Top-down court: defense-to-offense transition — block, pull off the net, approach, and swing back over." }

    // Pending: tactic:offense-systems (4-2/6-2/5-1). team-defense and
    // serve-with-purpose reuse basePositions / serveTargets above.
  };

  function get(key) {
    if (!key) return null;
    var m = MAP[key];
    return m ? { src: BASE + m.file, alt: m.alt } : null;
  }
  function has(key) { return !!(key && MAP[key]); }

  // Resolve how a spec should render: "img" (we have a picture), "placeholder"
  // / "svg" (in the program, picture pending), or "svg" (not in the program).
  function resolve(spec) {
    if (!spec) return { kind: "svg" };
    var key = spec.img || spec.template || null;
    if (!key) return { kind: "svg" };               // not part of the image program
    if (has(key)) return { kind: "img", key: key, image: get(key) };
    return { kind: FALLBACK === "svg" ? "svg" : "placeholder", key: key };
  }

  return {
    BASE: BASE,
    get FALLBACK() { return FALLBACK; },
    setFallback: function (v) { FALLBACK = (v === "svg") ? "svg" : "placeholder"; },
    MAP: MAP,
    get: get,
    has: has,
    resolve: resolve
  };
})();
