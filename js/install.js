// install.js — "Add to Home Screen" helper (RR.install).
//
// Captures the browser's beforeinstallprompt so we can offer a small, on-brand,
// DISMISSABLE "Install RallyReady" banner on the Today screen instead of relying
// on the browser's mini-infobar. The banner:
//   • only appears when the browser actually offers an install (deferred prompt),
//   • hides once the app is installed (appinstalled) or already running standalone,
//   • stays hidden after the user dismisses it (persisted in RR.state),
//   • is built from semantic tokens and is keyboard-accessible.
//
// Opening the install prompt is a user action, not a runtime network call, so it
// never violates the offline rule.
window.RR = window.RR || {};

RR.install = (function () {
  "use strict";

  // The stashed beforeinstallprompt event (usable exactly once).
  var deferred = null;
  // The Today screen hands us a container to paint into; it changes whenever
  // Today re-renders, so we keep a reference and repaint it on every event.
  var currentHost = null;
  // Set once the app is installed this session (in addition to the persisted /
  // display-mode checks below).
  var installedThisSession = false;

  // Running as an installed app? Then there's nothing to offer.
  function isStandalone() {
    return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      window.navigator.standalone === true;
  }

  // Did the user dismiss the banner before? Persisted so we don't nag.
  function dismissed() {
    return !!RR.state.getState().installDismissed;
  }

  // Only show when the browser offered a prompt and none of the "hide" cases apply.
  function available() {
    return !!deferred && !installedThisSession && !isStandalone() && !dismissed();
  }

  // Build the banner content (or null when there's nothing to show).
  function build() {
    if (!available()) return null;
    var h = RR.ui.h;

    var installBtn = h("button", {
      type: "button", class: "btn btn-primary install-card__cta"
    }, [
      h("span", {
        "aria-hidden": "true", class: "btn__icon",
        html: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>'
      }),
      "Install"
    ]);
    installBtn.addEventListener("click", promptInstall);

    var dismissBtn = h("button", {
      type: "button", class: "install-card__dismiss", "aria-label": "Dismiss install banner"
    }, [h("span", {
      "aria-hidden": "true",
      html: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>'
    })]);
    dismissBtn.addEventListener("click", function () {
      RR.state.update({ installDismissed: true });
      paint();
    });

    return h("section", { class: "install-card", role: "region", "aria-label": "Install RallyReady" }, [
      h("span", {
        class: "install-card__icon", "aria-hidden": "true",
        html: '<svg viewBox="0 0 32 32" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="16" r="13"/><path d="M16 3c-3.6 4-4.6 9-1 13"/><path d="M5.5 9c4.6 2.6 9.8 3 15.6 1.4"/><path d="M7 24.5c2-5.2 6.1-8.2 12.2-8.6"/></svg>'
      }),
      h("div", { class: "install-card__body" }, [
        h("p", { class: "install-card__title", text: "Install RallyReady" }),
        h("p", { class: "install-card__sub", text: "Add it to your home screen for one-tap, offline access." })
      ]),
      installBtn,
      dismissBtn
    ]);
  }

  // Clear and rebuild whatever container Today most recently gave us.
  function paint() {
    if (!currentHost) return;
    currentHost.innerHTML = "";
    var node = build();
    if (node) currentHost.appendChild(node);
  }

  // Fire the real browser install prompt (one-shot).
  function promptInstall() {
    if (!deferred) return;
    var evt = deferred;
    deferred = null;            // the event can only be used once
    evt.prompt();
    var choice = evt.userChoice;
    if (choice && typeof choice.then === "function") {
      choice.then(function (res) {
        if (res && res.outcome === "accepted") installedThisSession = true;
        paint();
      });
    } else {
      paint();
    }
  }

  // Public: Today calls this with a fresh container on every render.
  function mount(host) {
    currentHost = host;
    paint();
  }

  // ---- Wire up the browser events (registered immediately at load) ----------
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();         // suppress the default mini-infobar; we show our own
    deferred = e;
    paint();
  });

  window.addEventListener("appinstalled", function () {
    installedThisSession = true;
    deferred = null;
    paint();
  });

  return { mount: mount };
})();
