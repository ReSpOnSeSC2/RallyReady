// tips-tts.js — the Tips-screen UI for read-aloud (RR.tipsTTS).
//
// The speech ENGINE is RR.tts (js/tts.js); this module is only the on-screen glue:
//   • listenButton(getContent) — the per-card "Listen / Stop" pill;
//   • bar(host)                — the top-of-screen on/off switch + speed selector.
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

  // A pill button that reads its card aloud. `getContent` is called lazily on
  // click, so it always reflects the current language/state — it returns either a
  // string or an array of {text, lang} segments (the bilingual terms card).
  function listenButton(getContent) {
    var btn = h("button", {
      type: "button", class: "tip__listen", "aria-pressed": "false", "aria-label": tt("Listen")
    }, [
      h("span", { class: "tip__listen-ic", "aria-hidden": "true", html: speakerSvg() }),
      h("span", { class: "tip__listen-txt", text: "Listen" })
    ]);

    function setPlaying(on) {
      btn.classList.toggle("is-playing", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.setAttribute("aria-label", tt(on ? "Stop" : "Listen"));
      btn.querySelector(".tip__listen-ic").innerHTML = on ? stopSvg() : speakerSvg();
      btn.querySelector(".tip__listen-txt").textContent = on ? "Stop" : "Listen";
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

    return btn;
  }

  // The read-aloud controls at the top of the screen: an on/off switch (which
  // shows/hides every per-card Listen button via `host`) and a speed selector.
  function bar(host) {
    var rates = RR.tts.RATES;
    var enabled = RR.tts.isEnabled();

    var sw = h("button", {
      type: "button", class: "tts-switch" + (enabled ? " is-on" : ""),
      role: "switch", "aria-checked": enabled ? "true" : "false"
    }, [
      h("span", { class: "tts-switch__track", "aria-hidden": "true" }, [h("span", { class: "tts-switch__thumb" })]),
      h("span", { class: "tts-switch__label", text: "Read aloud" })
    ]);
    sw.addEventListener("click", function () {
      var on = sw.getAttribute("aria-checked") !== "true";
      sw.setAttribute("aria-checked", on ? "true" : "false");
      sw.classList.toggle("is-on", on);
      RR.tts.setEnabled(on);
      host.classList.toggle("tts-off", !on);
      if (!on) { RR.tts.cancel(); resetCurrent(); }
    });

    var speed = RR.ui.segmented({
      options: [
        { value: rates.slow, label: "Slow" },
        { value: rates.normal, label: "Normal" },
        { value: rates.fast, label: "Fast" }
      ],
      value: RR.tts.getRate(),
      onSelect: function (v) { RR.tts.setRate(v); }
    });

    return h("section", { class: "card tts-bar" }, [
      h("div", { class: "tts-bar__row" }, [
        h("span", { class: "tts-bar__icon", "aria-hidden": "true", html: speakerSvg() }), sw
      ]),
      h("div", { class: "tts-bar__row tts-bar__speed" }, [
        h("span", { class: "tts-bar__label", text: "Speed" }), speed
      ])
    ]);
  }

  // Romanian for the read-aloud UI. The i18n DOM walker translates the visible
  // text nodes once these are registered; aria-labels go through tt() at set-time.
  if (RR.i18n) {
    RR.i18n.add({
      "Read aloud": "Citește cu voce tare",
      "Speed": "Viteză",
      "Slow": "Lent",
      "Normal": "Normal",
      "Fast": "Rapid",
      "Listen": "Ascultă",
      "Stop": "Oprește"
    });
  }

  return { supported: supported, listenButton: listenButton, bar: bar };
})();
