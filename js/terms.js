// terms.js — a bilingual Romanian <-> English volleyball-terms reference (RR.terms).
//
// Built for a coach who learned and played the game in Romania: it maps the words
// she grew up with to the English ones she'll hear in a US gym, both directions.
// The Tips screen (coaching.js renderTips) composes RR.terms.content() into its
// own disclosure card so it matches the rest of the accordion.
//
// The term pairs are intentionally literal data, so the i18n DOM walker is told to
// skip the list (data-no-i18n) — only the heading/intro are localized.
window.RR = window.RR || {};

RR.terms = (function () {
  "use strict";

  // { ro: how it's said in Romania, en: the US/English word(s), note?: a nuance }
  var PAIRS = [
    // — the basics —
    { ro: "volei", en: "volleyball" },
    { ro: "fileu", en: "net" },
    { ro: "teren", en: "court" },
    { ro: "minge", en: "ball / volleyball" },
    { ro: "antrenament", en: "practice / training" },
    { ro: "antrenor / antrenoare", en: "coach" },
    { ro: "exercițiu", en: "drill" },
    { ro: "echipă", en: "team" },
    { ro: "jucător / jucătoare", en: "player" },
    { ro: "meci", en: "match / game" },
    { ro: "set", en: "set", note: "Atenție: în engleză „set” înseamnă și ridicarea, nu doar setul din meci." },
    { ro: "punct", en: "point" },
    { ro: "rotație", en: "rotation" },
    { ro: "zonă", en: "zone" },
    { ro: "linia întâi", en: "front row" },
    { ro: "linia a doua", en: "back row" },
    { ro: "schimbare", en: "substitution / sub" },
    { ro: "arbitru", en: "referee / official" },
    { ro: "căpitan", en: "captain" },
    { ro: "time-out (timp de odihnă)", en: "timeout" },
    { ro: "formație de start", en: "lineup / starting six" },
    { ro: "antenă", en: "antenna" },

    // — skills & actions —
    { ro: "serviciu", en: "serve" },
    { ro: "serviciu de jos", en: "underhand serve" },
    { ro: "serviciu de sus", en: "overhand / topspin serve" },
    { ro: "serviciu plutit", en: "float serve" },
    { ro: "serviciu din săritură", en: "jump serve" },
    { ro: "preluare", en: "pass / dig / reception", note: "Un singur cuvânt în română acoperă mai multe în engleză." },
    { ro: "preluarea serviciului", en: "serve receive / reception" },
    { ro: "preluare din atac", en: "dig" },
    { ro: "platforma brațelor", en: "platform / forearm pass" },
    { ro: "ridicare", en: "set" },
    { ro: "ridicare scurtă / minge rapidă", en: "quick set" },
    { ro: "atac", en: "attack / spike / hit" },
    { ro: "lovitură de atac", en: "swing" },
    { ro: "elan", en: "approach (footwork)" },
    { ro: "blocaj", en: "block" },
    { ro: "minge plasată", en: "tip / dink" },
    { ro: "minge cu efect (liftată)", en: "roll shot" },
    { ro: "minge ușoară", en: "free ball" },
    { ro: "atacul ridicătorului", en: "setter dump" },
    { ro: "as", en: "ace" },
    { ro: "efect liftat", en: "topspin" },
    { ro: "poziție de bază", en: "ready position" },
    { ro: "recâștigarea serviciului", en: "side-out" },

    // — positions —
    { ro: "ridicător / coordonator", en: "setter" },
    { ro: "extremă (zona 4)", en: "outside hitter" },
    { ro: "opus / universal", en: "opposite / right-side" },
    { ro: "central", en: "middle blocker" },
    { ro: "libero", en: "libero" },
    { ro: "specialist în apărare", en: "defensive specialist (DS)" },

    // — youth / Romania-specific —
    { ro: "minivolei", en: "mini-volleyball (small-sided youth)" },
    { ro: "tabără (de vară)", en: "summer camp" },
    { ro: "cantonament", en: "training camp" },
    { ro: "joc-școală", en: "scrimmage" }
  ];

  // The inner content node the Tips screen drops into a disclosure card.
  function content() {
    var doc = document;
    function el(tag, cls, txt) {
      var n = doc.createElement(tag);
      if (cls) n.className = cls;
      if (txt != null) n.textContent = txt;
      return n;
    }
    var wrap = el("div", "rr-terms");

    var intro = el("p", "muted rr-terms__intro",
      "What you learned back home, mapped to the words you'll hear here — it works both ways.");
    wrap.appendChild(intro);

    // The pair list is literal data — skip it in the translator so the English
    // column never gets "translated" back into Romanian.
    var list = el("ul", "rr-bi");
    list.setAttribute("data-no-i18n", "");
    PAIRS.forEach(function (p) {
      var li = el("li", "rr-bi__row");
      var pair = el("div", "rr-bi__pair");
      pair.appendChild(el("span", "rr-bi__ro", p.ro));
      pair.appendChild(el("span", "rr-bi__arrow", "↔"));
      pair.appendChild(el("span", "rr-bi__en", p.en));
      li.appendChild(pair);
      if (p.note) li.appendChild(el("span", "rr-bi__note", p.note));
      list.appendChild(li);
    });
    wrap.appendChild(list);
    return wrap;
  }

  // Localize the heading + intro used around the reference.
  if (RR.i18n) {
    RR.i18n.add({
      "Romanian ↔ English terms": "Română ↔ Engleză (termeni)",
      "What you learned back home, mapped to the words you'll hear here — it works both ways.":
        "Ce ai învățat acasă, pus față în față cu cuvintele pe care le auzi aici — în ambele sensuri."
    });
  }

  return { content: content, PAIRS: PAIRS };
})();
