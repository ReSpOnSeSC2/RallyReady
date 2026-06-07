// tts.js — read-aloud (text-to-speech) for the Tips screen (RR.tts).
//
// Built on the browser's native Web Speech API (window.speechSynthesis), so it has
// ZERO dependencies, works offline, and ships nothing to download. It is:
//   • language-aware — follows the app's current language (RR.i18n) and can speak a
//     mix of Romanian + English in one pass (the bilingual terms card);
//   • robust on long text — splits content into small sentence-sized utterances,
//     because several browsers silently truncate a single long one;
//   • single-track — one card plays at a time; starting another stops the first.
//
// Preferences (on/off + speed) live in RR.state.settings.tts and are read
// defensively, so an older save whose settings predate this feature still works.
window.RR = window.RR || {};

RR.tts = (function () {
  "use strict";

  var synth = (typeof window !== "undefined") && window.speechSynthesis;

  function supported() {
    return !!synth && typeof window.SpeechSynthesisUtterance === "function";
  }

  // ---- preferences (persisted via RR.state) ---------------------------------
  var DEFAULTS = { enabled: true, rate: 1 };   // rate: 0.8 slow | 1 normal | 1.2 fast
  var RATES = { slow: 0.8, normal: 1, fast: 1.2 };

  function prefs() {
    var s = (RR.state && RR.state.getState) ? RR.state.getState() : {};
    return Object.assign({}, DEFAULTS, (s.settings && s.settings.tts) || {});
  }
  function savePrefs(patch) {
    if (!(RR.state && RR.state.update)) return;
    var s = RR.state.getState();
    var settings = Object.assign({}, s.settings);
    settings.tts = Object.assign({}, DEFAULTS, settings.tts || {}, patch);
    RR.state.update({ settings: settings });
  }

  function isEnabled() { return prefs().enabled !== false; }
  function setEnabled(on) { savePrefs({ enabled: !!on }); }

  function clampRate(r) { r = Number(r); return (r >= 0.5 && r <= 2) ? r : 1; }
  function getRate() { return clampRate(prefs().rate); }
  function setRate(r) { savePrefs({ rate: clampRate(r) }); }

  // ---- voices ---------------------------------------------------------------
  // Voices populate asynchronously in some browsers, so cache them and refresh on
  // the voiceschanged event; the first utterance then still gets the best match.
  var voices = [];
  function loadVoices() { try { voices = synth.getVoices() || []; } catch (e) { voices = []; } }
  if (supported()) {
    loadVoices();
    try { synth.addEventListener("voiceschanged", loadVoices); } catch (e) {}
  }

  var TAG = { en: "en-US", ro: "ro-RO" };   // short app lang -> BCP-47 tag
  function pickVoice(lang) {
    if (!voices.length) loadVoices();
    var pref = (lang === "ro") ? "ro" : "en";
    var match = null;
    for (var i = 0; i < voices.length; i++) {
      var vl = (voices[i].lang || "").toLowerCase().replace("_", "-");
      if (vl.indexOf(pref) === 0) {
        match = voices[i];
        if (voices[i].default) break;   // prefer the OS default voice for the language
      }
    }
    return match;
  }

  function appLang() {
    return (RR.i18n && RR.i18n.getLang) ? RR.i18n.getLang() : "en";
  }

  // ---- segmentation ---------------------------------------------------------
  // Break content into small {text, lang} chunks. Sentences first (so prosody is
  // natural and browsers don't truncate), then any over-long run is split again on
  // clause boundaries so a single huge sentence can't get cut off either.
  var MAX = 200;
  function splitLong(s) {
    if (s.length <= MAX) return [s];
    var out = [], rest = s;
    while (rest.length > MAX) {
      var win = rest.slice(0, MAX);
      var cut = win.lastIndexOf(", ");
      if (cut < MAX * 0.5) cut = win.lastIndexOf(" ");
      cut = (cut <= 0) ? MAX : cut + 1;
      out.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut);
    }
    if (rest.trim()) out.push(rest.trim());
    return out;
  }
  function chunkText(text) {
    var sentences = String(text).replace(/\s+/g, " ").trim()
      .match(/[^.!?…]+[.!?…]+|\S[^.!?…]*$/g) || [];
    var out = [];
    sentences.forEach(function (s) {
      splitLong(s.trim()).forEach(function (c) { if (c) out.push(c); });
    });
    return out;
  }
  function toSegments(content) {
    var defLang = appLang();
    var raw = Array.isArray(content) ? content : [{ text: content, lang: defLang }];
    var out = [];
    raw.forEach(function (seg) {
      if (!seg) return;
      var lang = seg.lang || defLang;
      var text = (seg.text == null ? "" : String(seg.text)).trim();
      if (!text) return;
      chunkText(text).forEach(function (c) { out.push({ text: c, lang: lang }); });
    });
    return out;
  }

  // ---- playback -------------------------------------------------------------
  // One job at a time. `token` lets a superseded queue (after a new speak/cancel)
  // recognise it is stale, so a late utterance event never fires the wrong onEnd.
  var token = 0;
  var active = null;          // truthy while a job is running

  // Chrome can pause long synthesis; a gentle periodic resume keeps chunks flowing.
  var keepAlive = null;
  function startKeepAlive() {
    stopKeepAlive();
    keepAlive = setInterval(function () {
      if (!active) { stopKeepAlive(); return; }
      try { if (synth.paused) synth.resume(); } catch (e) {}
    }, 5000);
  }
  function stopKeepAlive() {
    if (keepAlive) { clearInterval(keepAlive); keepAlive = null; }
  }

  function stopInternal() {
    token++;
    active = null;
    stopKeepAlive();
    try { synth.cancel(); } catch (e) {}
  }

  function cancel() { var had = !!active; stopInternal(); return had; }
  function speaking() { return !!active; }

  function speak(content, opts) {
    if (!supported()) return false;
    opts = opts || {};
    stopInternal();                       // interrupt whatever was playing
    var segments = toSegments(content);
    if (!segments.length) return false;

    var my = ++token;
    var rate = getRate();
    active = true;
    startKeepAlive();

    function finish() {
      if (my !== token) return;           // superseded — stay silent
      active = null;
      stopKeepAlive();
      if (typeof opts.onEnd === "function") opts.onEnd();
    }

    var i = 0;
    function next() {
      if (my !== token) return;
      if (i >= segments.length) { finish(); return; }
      var seg = segments[i++];
      var u = new window.SpeechSynthesisUtterance(seg.text);
      u.rate = rate;
      u.lang = TAG[seg.lang] || TAG.en;
      var v = pickVoice(seg.lang);
      if (v) u.voice = v;
      u.onend = next;
      u.onerror = finish;                 // one bad chunk must not wedge the queue
      try { synth.speak(u); } catch (e) { finish(); }
    }

    if (typeof opts.onStart === "function") opts.onStart();
    next();
    return true;
  }

  // Never let audio outlive the view: stop on tab hide, page unload, and on any
  // in-app route change (the app is hash-routed, so leaving Tips fires hashchange).
  if (supported()) {
    try {
      window.addEventListener("pagehide", stopInternal);
      window.addEventListener("hashchange", stopInternal);
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stopInternal();
      });
    } catch (e) {}
  }

  return {
    supported: supported,
    speak: speak,
    cancel: cancel,
    speaking: speaking,
    isEnabled: isEnabled,
    setEnabled: setEnabled,
    getRate: getRate,
    setRate: setRate,
    RATES: RATES
  };
})();
