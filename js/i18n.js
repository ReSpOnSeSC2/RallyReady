// i18n.js — runtime localization layer (RR.i18n).
//
// RallyReady was written with its English copy inline across ~50 modules, so we
// localize WITHOUT rewriting every screen: a dictionary maps each English string
// to natural, spoken Romanian, and a DOM walker swaps the text in place after the
// app renders. A MutationObserver keeps later renders (modals, toasts, the run
// timer, dynamically built cards) translated too. Every swap is reversible — we
// stash the original English on the node — so flipping the flag toggle back to
// English restores it exactly, with no reload.
//
// Anything not yet in the dictionary simply stays English (graceful fallback),
// so the app never breaks on an untranslated string.
//
// Loads right after state.js so the rest of the app can read RR.i18n; the
// dictionary files (i18n-ui.js, i18n-content.js, i18n-positions.js) register
// onto it as they load, and app.js calls RR.i18n.init() on boot.
window.RR = window.RR || {};

RR.i18n = (function () {
  "use strict";

  var LANGS = ["en", "ro"];

  // The dictionary: exact English string -> Romanian. Filled by the i18n-*.js
  // files via add(). Keyed on the trimmed English text.
  var DICT = { ro: {} };

  // Pattern rules for strings assembled at runtime (numbers, names, dates).
  // Each is { re: RegExp, ro: function(matchArray) -> string }. Tried only when
  // no exact match exists. Filled by addPatterns() + a built-in core set below.
  var PATTERNS = { ro: [] };

  // ---- public registration API (used by the dictionary files) ---------------
  function add(map, lang) {
    lang = lang || "ro";
    DICT[lang] = DICT[lang] || {};
    if (map) Object.keys(map).forEach(function (k) { DICT[lang][k] = map[k]; });
    return RR.i18n;
  }
  function addPatterns(list, lang) {
    lang = lang || "ro";
    PATTERNS[lang] = PATTERNS[lang] || [];
    (list || []).forEach(function (p) { PATTERNS[lang].push(p); });
    return RR.i18n;
  }

  // ---- current language ------------------------------------------------------
  // Stored in app state (persisted). First-run default follows the device:
  // a Romanian-locale phone opens in Romanian, everyone else in English. Either
  // way the flag toggle wins and the choice is remembered.
  function deviceDefault() {
    try {
      var list = navigator.languages || [navigator.language || ""];
      for (var i = 0; i < list.length; i++) {
        if (String(list[i]).toLowerCase().indexOf("ro") === 0) return "ro";
      }
    } catch (e) {}
    return "en";
  }
  function getLang() {
    var s = (RR.state && RR.state.getState) ? RR.state.getState() : {};
    var l = s.lang;
    if (LANGS.indexOf(l) === -1) l = deviceDefault();
    return l;
  }

  // Normalize quote style so dictionary keys (authored with straight quotes) match
  // source text regardless of whether it uses straight or curly quotes. Dashes and
  // ellipses are left intact (they carry layout meaning and feed the pattern rules).
  function canon(s) {
    return s
      .replace(/[“”„‟]/g, '"')   // “ ” „ ‟ -> "
      .replace(/[‘’‚‛]/g, "'")   // ‘ ’ ‚ ‛ -> '
      .replace(/ /g, " ");                        // nbsp -> space
  }

  // ---- translation lookup ----------------------------------------------------
  function translate(raw) {
    var lang = getLang();
    if (lang === "en" || raw == null) return raw;
    var str = String(raw);
    // Preserve surrounding whitespace so layout (e.g. " · ") is untouched.
    var lead = (str.match(/^\s*/) || [""])[0];
    var trail = (str.match(/\s*$/) || [""])[0];
    var core = str.slice(lead.length, str.length - trail.length);
    if (!core) return raw;

    var dict = DICT[lang] || {};
    var key = canon(core);
    if (Object.prototype.hasOwnProperty.call(dict, key)) {
      return lead + dict[key] + trail;
    }
    var pats = PATTERNS[lang] || [];
    for (var i = 0; i < pats.length; i++) {
      var m = pats[i].re.exec(key);   // canon form, so quote style never blocks a match
      if (m) return lead + pats[i].ro(m) + trail;
    }
    return raw;   // untranslated -> leave English
  }
  // Public helper for code paths that build strings deliberately.
  function t(raw) { return translate(raw); }

  // ======================================================================= //
  //  DOM WALKER                                                             //
  // ======================================================================= //
  // Reversible swaps: we remember each node's original English the first time we
  // see it, then render either the English (lang "en") or the Romanian (lang
  // "ro"). Because the very first paint is always English, the stored original
  // is always English.
  var ORIG_TEXT = new WeakMap();          // textNode -> original English
  var ORIG_ATTR = new WeakMap();          // element  -> { attrName: originalEnglish }
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEMPLATE: 1, CODE: 1 };
  // Attributes that carry user-visible text. We deliberately skip <input>/<textarea>
  // .value (that's the user's own data), translating only placeholder/labels.
  var ATTRS = ["placeholder", "title", "aria-label", "aria-description", "alt"];

  function translateTextNode(node) {
    var src = ORIG_TEXT.has(node) ? ORIG_TEXT.get(node) : node.nodeValue;
    if (!ORIG_TEXT.has(node)) {
      // Only bother tracking nodes that have real, non-whitespace content.
      if (!src || !src.trim()) return;
      ORIG_TEXT.set(node, src);
    }
    var lang = getLang();
    var out = lang === "en" ? src : translate(src);
    if (node.nodeValue !== out) node.nodeValue = out;
  }

  function translateAttrs(el) {
    var lang = getLang();
    var store = ORIG_ATTR.get(el);
    for (var i = 0; i < ATTRS.length; i++) {
      var name = ATTRS[i];
      var cur = el.getAttribute(name);
      var known = store && Object.prototype.hasOwnProperty.call(store, name);
      if (cur == null && !known) continue;
      if (!known) {
        if (cur == null || !cur.trim()) continue;
        if (!store) { store = {}; ORIG_ATTR.set(el, store); }
        store[name] = cur;
      }
      var src = store[name];
      var out = lang === "en" ? src : translate(src);
      if (el.getAttribute(name) !== out) el.setAttribute(name, out);
    }
  }

  function walk(node) {
    if (!node) return;
    if (node.nodeType === 3) { translateTextNode(node); return; }
    if (node.nodeType !== 1) return;                       // skip comments etc.
    if (SKIP_TAGS[node.tagName]) return;
    // Skip SVG subtrees: their text is data-driven (diagrams) and path data must
    // never be touched. Authors can also opt a node out with data-no-i18n.
    if (node.namespaceURI === "http://www.w3.org/2000/svg") return;
    if (node.getAttribute && node.getAttribute("data-no-i18n") != null) return;
    translateAttrs(node);
    for (var c = node.firstChild; c; c = c.nextSibling) walk(c);
  }

  // ======================================================================= //
  //  OBSERVER + APPLY                                                       //
  // ======================================================================= //
  var observer = null;
  var busy = false;

  function startObserver() {
    if (observer || typeof MutationObserver === "undefined") return;
    observer = new MutationObserver(function (muts) {
      if (busy) return;
      apply(function () {
        for (var i = 0; i < muts.length; i++) {
          var m = muts[i];
          if (m.type === "characterData") { translateTextNode(m.target); }
          else if (m.type === "childList") {
            for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
          }
        }
      });
    });
    connect();
  }
  function connect() {
    if (observer) observer.observe(document.body, {
      childList: true, subtree: true, characterData: true
    });
  }
  // Run `fn` with the observer detached so our own DOM writes don't re-trigger it
  // (which would otherwise loop). Idempotent walks make re-entry harmless anyway.
  function apply(fn) {
    if (busy) { fn(); return; }
    busy = true;
    if (observer) observer.disconnect();
    try { fn(); } finally { connect(); busy = false; }
  }
  function applyAll() { apply(function () { walk(document.body); }); }

  // ======================================================================= //
  //  FLAG TOGGLE (US / RO)                                                  //
  // ======================================================================= //
  // A small two-flag segmented control that lives in the app header next to the
  // light/dark button. The active language is highlighted; tapping the other
  // flag switches instantly (no reload).
  function flagSVG(which) {
    if (which === "ro") {
      // Romania: three vertical bands — blue, yellow, red.
      return '<svg class="flag" viewBox="0 0 24 16" width="24" height="16" aria-hidden="true" focusable="false">' +
        '<rect width="8" height="16" x="0" fill="#002B7F"/>' +
        '<rect width="8" height="16" x="8" fill="#FCD116"/>' +
        '<rect width="8" height="16" x="16" fill="#CE1126"/>' +
        '<rect width="24" height="16" fill="none" stroke="rgba(0,0,0,.18)"/></svg>';
    }
    // United States: simplified stars-and-stripes (recognizable at icon size).
    var stripes = "";
    for (var i = 0; i < 7; i++) {
      stripes += '<rect x="0" y="' + (i * 16 / 13) + '" width="24" height="' + (16 / 13) +
        '" fill="' + (i % 2 === 0 ? "#B22234" : "#FFFFFF") + '"/>';
    }
    return '<svg class="flag" viewBox="0 0 24 16" width="24" height="16" aria-hidden="true" focusable="false">' +
      '<rect width="24" height="16" fill="#FFFFFF"/>' + stripes +
      '<rect width="11" height="' + (16 * 7 / 13) + '" fill="#3C3B6E"/>' +
      '<g fill="#FFFFFF">' +
        '<circle cx="2.2" cy="1.6" r=".7"/><circle cx="5.5" cy="1.6" r=".7"/><circle cx="8.8" cy="1.6" r=".7"/>' +
        '<circle cx="3.8" cy="3.7" r=".7"/><circle cx="7.1" cy="3.7" r=".7"/>' +
        '<circle cx="2.2" cy="5.8" r=".7"/><circle cx="5.5" cy="5.8" r=".7"/><circle cx="8.8" cy="5.8" r=".7"/>' +
      '</g>' +
      '<rect width="24" height="16" fill="none" stroke="rgba(0,0,0,.18)"/></svg>';
  }

  var LABELS = {
    en: { en: "English", ro: "Romanian", aria: "Language", switchTo: "Switch to Romanian" },
    ro: { en: "Engleză", ro: "Română", aria: "Limbă", switchTo: "Schimbă în engleză" }
  };

  function buildToggle() {
    var header = document.querySelector(".appbar");
    if (!header || document.getElementById("langToggle")) return;
    var wrap = document.createElement("div");
    wrap.id = "langToggle";
    wrap.className = "lang-toggle";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("data-no-i18n", "");   // labels handled manually below

    function makeBtn(lang, flagKey, label) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "lang-opt";
      b.setAttribute("data-lang", lang);
      b.innerHTML = flagSVG(flagKey) + '<span class="lang-opt__txt">' + label + "</span>";
      b.addEventListener("click", function () { setLang(lang); });
      return b;
    }
    wrap.appendChild(makeBtn("en", "us", "EN"));
    wrap.appendChild(makeBtn("ro", "ro", "RO"));

    // Insert before the theme toggle so the order reads: [EN|RO]  [sun/moon].
    var theme = document.getElementById("themeToggle");
    if (theme && theme.parentNode === header) header.insertBefore(wrap, theme);
    else header.appendChild(wrap);
    paintToggle();
  }

  function paintToggle() {
    var wrap = document.getElementById("langToggle");
    if (!wrap) return;
    var lang = getLang();
    var L = LABELS[lang] || LABELS.en;
    wrap.setAttribute("aria-label", L.aria);
    var opts = wrap.querySelectorAll(".lang-opt");
    for (var i = 0; i < opts.length; i++) {
      var on = opts[i].getAttribute("data-lang") === lang;
      opts[i].classList.toggle("is-on", on);
      opts[i].setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  // ---- switch language -------------------------------------------------------
  function setLang(lang) {
    if (LANGS.indexOf(lang) === -1) return;
    if (RR.state && RR.state.update) RR.state.update({ lang: lang });
    document.documentElement.setAttribute("lang", lang);
    paintToggle();
    // Rebuild the current screen (fresh English markup) then re-translate, so
    // every dynamic, code-built string flips cleanly in both directions.
    if (RR.app && RR.app.route) RR.app.route();
    applyAll();
  }

  // ---- boot ------------------------------------------------------------------
  function init() {
    document.documentElement.setAttribute("lang", getLang());
    buildToggle();
    startObserver();
    applyAll();   // translate the static header/tab-bar already in the document
  }

  return {
    init: init,
    t: t,
    add: add,
    addPatterns: addPatterns,
    getLang: getLang,
    setLang: setLang,
    applyAll: applyAll,
    DICT: DICT
  };
})();

// ---------------------------------------------------------------------------
// Core pattern rules for runtime-assembled strings (numbers, names, dates).
// These live here (not in the dictionary files) because they're engine-level.
// Skill / position / phase names are translated by re-using the exact dictionary
// via RR.i18n.t(), so an interpolated skill flips too.
// ---------------------------------------------------------------------------
(function () {
  var t = RR.i18n.t;
  // Romanian count agreement helper: 1 -> singular, else plural (good enough for
  // the small counts the UI shows; we skip the formal "de" for 20+).
  function plural(n, one, many) { return n + " " + (Number(n) === 1 ? one : many); }

  RR.i18n.addPatterns([
    // --- generic counts ---
    { re: /^(\d+) min$/, ro: function (m) { return m[1] + " min"; } },
    { re: /^(\d+) minutes$/, ro: function (m) { return m[1] + " minute"; } },
    { re: /^(\d+) drill$/, ro: function (m) { return m[1] + " exercițiu"; } },
    { re: /^(\d+) drills$/, ro: function (m) { return m[1] + " exerciții"; } },
    { re: /^(\d+) player$/, ro: function (m) { return m[1] + " jucător"; } },
    { re: /^(\d+) players$/, ro: function (m) { return m[1] + " jucători"; } },
    { re: /^(\d+)\+ players$/, ro: function (m) { return m[1] + "+ jucători"; } },
    { re: /^(\d+) team$/, ro: function (m) { return m[1] + " echipă"; } },
    { re: /^(\d+) teams$/, ro: function (m) { return m[1] + " echipe"; } },
    { re: /^(\d+) day$/, ro: function (m) { return m[1] + " zi"; } },
    { re: /^(\d+) days$/, ro: function (m) { return m[1] + " zile"; } },
    { re: /^(\d+) week$/, ro: function (m) { return m[1] + " săptămână"; } },
    { re: /^(\d+) weeks$/, ro: function (m) { return m[1] + " săptămâni"; } },
    { re: /^(\d+) scheduled$/, ro: function (m) { return m[1] + " programate"; } },

    // --- ages / steps / sessions / days ---
    { re: /^Ages (.+)$/, ro: function (m) { return "Vârste " + m[1]; } },
    { re: /^Step (\d+)$/, ro: function (m) { return "Pasul " + m[1]; } },
    { re: /^Session (\d+)$/, ro: function (m) { return "Sesiunea " + m[1]; } },
    { re: /^Day (\d+) of (\d+)$/, ro: function (m) { return "Ziua " + m[1] + " din " + m[2]; } },
    { re: /^Camp Day (\d+)$/, ro: function (m) { return "Ziua " + m[1] + " de tabără"; } },
    { re: /^Block (\d+) of (\d+)$/, ro: function (m) { return "Blocul " + m[1] + " din " + m[2]; } },
    { re: /^Block (\d+)$/, ro: function (m) { return "Blocul " + m[1]; } },

    // --- season / camp window labels ---
    { re: /^(\d+)-week season$/, ro: function (m) { return "sezon de " + m[1] + " săptămâni"; } },
    { re: /^(\d+)-day camp$/, ro: function (m) { return "tabără de " + m[1] + " zile"; } },

    // --- intensity ---
    { re: /^(\d+) \/ 10$/, ro: function (m) { return m[1] + " / 10"; } },
    { re: /^(\d+)\/10$/, ro: function (m) { return m[1] + "/10"; } },

    // --- interpolated skill / position names (re-use the dictionary) ---
    { re: /^Focus set to (.+)\.$/, ro: function (m) { return "Accent pus pe " + t(m[1]) + "."; } },
    { re: /^Open the (.+) guide$/, ro: function (m) { return "Deschide ghidul: " + t(m[1]); } },
    { re: /^Watch how to play (.+)$/, ro: function (m) { return "Vezi cum se joacă pe " + t(m[1]); } },
    { re: /^Watch (.+)$/, ro: function (m) { return "Vezi " + t(m[1]); } },
    { re: /^Coaching for (.+)$/, ro: function (m) { return "Antrenament pentru " + t(m[1]); } },

    // --- "X min block" / "X min total" ---
    { re: /^(\d+) min block$/, ro: function (m) { return "bloc de " + m[1] + " min"; } },
    { re: /^(\d+) min total$/, ro: function (m) { return m[1] + " min în total"; } }
  ]);
}());
