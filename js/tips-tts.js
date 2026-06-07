// tips-tts.js — the Tips-screen UI for read-aloud (RR.tipsTTS).
//
// The speech ENGINE is RR.tts (js/tts.js); this module is only the on-screen glue:
//   • listenButton(getContent) — the per-card "Listen / Stop" pill, which reveals
//     a small Slow / Normal / Fast speed popup beside it WHILE it is reading.
// There is no global on/off switch: tapping a card's speaker is all it takes to
// hear it, and the speed control lives on the speaker itself (not at the top of
// the screen), so adjusting pace never means scrolling away from the card.
// Kept in its own file so coaching.js stays well under the project's 800-line
// ceiling, and so the speech engine and its Tips UI stay cleanly separated.
//
// Rendering reuses RR.ui.h (resolved lazily, since ui.js loads after this file but
// every call here happens at render time, long after boot).
window.RR = window.RR || {};

RR.tipsTTS = (function () {
  "use strict";

  function h() { return RR.ui.h.apply(null, arguments); }

  function supported() { return !!(RR.tts && RR.tts.supported()); }

  // ---- icons ----------------------------------------------------------------
  function speakerSvg() {
    return "<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' " +
           "stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>" +
           "<path d='M11 5 6 9H3v6h3l5 4z'/><path d='M15.5 8.5a5 5 0 0 1 0 7'/>" +
           "<path d='M18.5 5.5a9 9 0 0 1 0 13'/></svg>";
  }
  function stopSvg() {
    return "<svg viewBox='0 0 24 24' width='18' height='18' fill='currentColor' aria-hidden='true'>" +
           "<rect x='6' y='6' width='12' height='12' rx='2'/></svg>";
  }

  // Translate a UI string at set-time. The i18n DOM walker observes text/child
  // changes but not attribute changes, so aria-labels are localized here instead.
  function tt(s) { return (RR.i18n && RR.i18n.t) ? RR.i18n.t(s) : s; }

  // Only one card plays at a time. When a new card starts, this resets the
  // previously-playing button's UI so it can never get stuck on "Stop".
  var stopCurrentUI = null;
  function resetCurrent() {
    if (stopCurrentUI) { stopCurrentUI(); stopCurrentUI = null; }
  }

  // A speed popup (Slow / Normal / Fast) built fresh each time it opens, so it
  // always reflects the current persisted rate. Rate changes apply live: the
  // engine reads getRate() per chunk, so the rest of the read-aloud speeds up or
  // slows down from the next sentence on — no need to restart the card.
  function buildSpeed(into) {
    var rates = RR.tts.RATES;
    into.innerHTML = "";
    into.appendChild(h("span", { class: "tip__speed-label", text: "Speed" }));
    into.appendChild(RR.ui.segmented({
      options: [
        { value: rates.slow, label: "Slow" },
        { value: rates.normal, label: "Normal" },
        { value: rates.fast, label: "Fast" }
      ],
      value: RR.tts.getRate(),
      onSelect: function (v) { RR.tts.setRate(v); }
    }));
  }

  // A pill button that reads its card aloud. `getContent` is called lazily on
  // click, so it always reflects the current language/state — it returns either a
  // string or an array of {text, lang} segments (the bilingual terms card). While
  // it is reading, a Slow/Normal/Fast popup sits beside it for on-the-fly pacing.
  function listenButton(getContent) {
    var btn = h("button", {
      type: "button", class: "tip__listen-btn", "aria-pressed": "false", "aria-label": tt("Listen")
    }, [
      h("span", { class: "tip__listen-ic", "aria-hidden": "true", html: speakerSvg() }),
      h("span", { class: "tip__listen-txt", text: "Listen" })
    ]);
    var pop = h("div", { class: "tip__speed", role: "group", "aria-label": tt("Speed") });
    pop.hidden = true;
    var wrap = h("span", { class: "tip__listen" }, [btn, pop]);

    function setPlaying(on) {
      btn.classList.toggle("is-playing", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.setAttribute("aria-label", tt(on ? "Stop" : "Listen"));
      btn.querySelector(".tip__listen-ic").innerHTML = on ? stopSvg() : speakerSvg();
      btn.querySelector(".tip__listen-txt").textContent = on ? "Stop" : "Listen";
      if (on) { buildSpeed(pop); pop.hidden = false; }
      else { pop.hidden = true; pop.innerHTML = ""; }
    }

    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-playing")) {   // tap again to stop
        RR.tts.cancel();
        setPlaying(false);
        stopCurrentUI = null;
        return;
      }
      resetCurrent();                               // stop whatever else was playing
      stopCurrentUI = function () { setPlaying(false); };
      var started = RR.tts.speak(getContent(), {
        onStart: function () { setPlaying(true); },
        onEnd: function () { setPlaying(false); stopCurrentUI = null; }
      });
      if (!started) { setPlaying(false); stopCurrentUI = null; }
    });

    return wrap;
  }

  // Romanian for the read-aloud UI. The i18n DOM walker translates the visible
  // text nodes once these are registered; aria-labels go through tt() at set-time.
  if (RR.i18n) {
    RR.i18n.add({
      "Speed": "Viteză",
      "Slow": "Lent",
      "Normal": "Normal",
      "Fast": "Rapid",
      "Listen": "Ascultă",
      "Stop": "Oprește"
    });
  }

  return { supported: supported, listenButton: listenButton };
})();
