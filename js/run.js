// run.js — in-practice "Run mode" (RR.run).
//
// A full-screen overlay that walks a coach through a generated practice one block
// at a time, with a per-block countdown timer. The point is durability: once the
// whistle blows and the gym is loud, the coach shouldn't be scrolling a long plan
// — they get the current block, big and clear, with a timer that nudges them on.
//
// PURE runtime UI: it reads a session object and drives a timer. No persistence,
// no planning logic, no network. Everything is guarded so a malformed session
// simply does nothing rather than throwing on the gym floor.
window.RR = window.RR || {};

RR.run = (function () {
  "use strict";

  var h = RR.ui.h;

  // ---- Small inline icons (24x24 stroked paths fed to RR.ui.icon) -----------
  var ICON = {
    close:   '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
    pause:   '<path d="M8 5v14"/><path d="M16 5v14"/>',
    play:    '<path d="M7 5l12 7-12 7z"/>',
    prev:    '<path d="M15 6l-6 6 6 6"/>',
    next:    '<path d="M9 6l6 6-6 6"/>',
    reset:   '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
    check:   '<path d="M20 6L9 17l-5-5"/>'
  };

  // ---- Role -> intensity hue. Blocks carry a free-text `role`, so we sniff a
  // keyword to pick a fixed badge colour (navy text on each clears AA). Anything
  // we don't recognise falls back to "mid" so it still reads as a real badge.
  function roleColor(role) {
    var r = String(role || "").toLowerCase();
    if (/warm|activ|prep/.test(r)) return "easy";
    if (/cool|stretch|taper|recover/.test(r)) return "taper";
    if (/game|play|scrim|compet/.test(r)) return "mid";
    return "hard"; // skill / technical work
  }

  // ---- One gentle WebAudio beep, created lazily on a user gesture so phones
  // that block autoplay don't error. Never throws: a missing chime is fine.
  var audioCtx = null;
  function ensureAudio() {
    if (audioCtx) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    } catch (e) { audioCtx = null; }
  }
  function beep() {
    try {
      if (!audioCtx) return;
      if (audioCtx.state === "suspended") audioCtx.resume();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      var t = audioCtx.currentTime;
      // Quick fade in/out so it's a soft chirp, not a click.
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
      osc.start(t);
      osc.stop(t + 0.16);
    } catch (e) { /* audio blocked — silent is acceptable */ }
  }

  // A short physical nudge plus the chime, used at each block's end.
  function cueEnd() {
    try { if (navigator.vibrate) navigator.vibrate([120, 60, 120]); } catch (e) {}
    beep();
  }

  // MM:SS from a whole number of seconds (never negative).
  function fmtClock(secs) {
    secs = Math.max(0, Math.round(secs));
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    return (m < 10 ? "0" + m : "" + m) + ":" + (s < 10 ? "0" + s : "" + s);
  }

  // ======================================================================= //
  //  STATE                                                                  //
  // ======================================================================= //
  // A single live instance at a time. `els` caches the few nodes the timer
  // mutates each tick so we don't rebuild the DOM every second.
  var S = null;

  // ---- Open the overlay for a session. No-op on a missing/empty plan. ------
  function start(session, team) {
    if (!session || !Array.isArray(session.blocks) || !session.blocks.length) return;
    if (S) close(); // never stack overlays

    // Normalise per-block durations to whole minutes (>= 1) so the timer is sane.
    var blocks = session.blocks.map(function (b) {
      var mins = Math.max(1, Math.round(Number(b && b.minutes) || 1));
      return { src: b || {}, minutes: mins };
    });

    S = {
      session: session,
      team: team || {},
      blocks: blocks,
      index: 0,
      remaining: blocks[0].minutes * 60, // seconds left on the current block
      paused: false,
      finished: false,
      timer: null,
      root: null,
      els: {}
    };

    // Audio needs a user gesture to start; opening Run mode is that gesture.
    ensureAudio();

    buildShell();
    document.body.classList.add("rr-run-open");
    document.addEventListener("keydown", onKey, true);
    renderBlock();
    startTicking();
  }

  // ---- Build the static overlay scaffold once; renderBlock() fills the body.
  function buildShell() {
    var session = S.session;

    var header = h("div", { class: "rr-run__header" }, [
      h("div", { class: "rr-run__meta" }, [
        h("span", { class: "eyebrow", text: headerDateText(session) }),
        h("p", { class: "rr-run__metaline", text: headerSubText(session) })
      ]),
      h("button", {
        type: "button", class: "rr-run__close",
        "aria-label": "Close Run mode",
        onclick: close,
        html: RR.ui.icon(ICON.close, 22)
      })
    ]);

    // The body is replaced wholesale each time we move to a new block.
    var body = h("div", { class: "rr-run__body" });
    S.els.body = body;

    var panel = h("div", {
      class: "rr-run__panel", role: "dialog", "aria-modal": "true",
      "aria-label": "Practice run mode"
    }, [header, body]);

    // The scrim is inert: clicking it must NOT close (avoid losing the plan
    // mid-practice with a stray tap). Only the × / Done close.
    var root = h("div", { class: "rr-run", "aria-hidden": "false" }, [
      h("div", { class: "rr-run__scrim" }),
      panel
    ]);

    S.root = root;
    document.body.appendChild(root);
  }

  function headerDateText(session) {
    var d = "";
    try { if (RR.ui.fmtFull) d = RR.ui.fmtFull(session.date); } catch (e) {}
    return d || "Practice";
  }
  function headerSubText(session) {
    var bits = [];
    if (session.skillFocus) bits.push("Skill: " + session.skillFocus);
    if (session.totalMinutes) bits.push(session.totalMinutes + " min");
    return bits.join("  •  ");
  }

  // ======================================================================= //
  //  RENDER — current block (or the complete state)                         //
  // ======================================================================= //
  function renderBlock() {
    if (!S) return;
    var body = S.els.body;
    body.textContent = "";

    if (S.finished) {
      body.appendChild(renderComplete());
      return;
    }

    var entry = S.blocks[S.index];
    var b = entry.src;
    var drill = b.drill || {};
    var total = S.blocks.length;
    var stepNum = S.index + 1;

    // --- Counter + role badge + title (the only aria-live region) -----------
    var counter = h("p", { class: "rr-run__counter", text: "Block " + stepNum + " of " + total });
    var badge = RR.ui.badge(b.role || "Block", roleColor(b.role));
    var title = h("h2", { class: "rr-run__title", text: b.title || drill.name || "Block " + stepNum });

    var headline = h("div", {
      class: "rr-run__headline", "aria-live": "polite"
    }, [counter, h("div", { class: "rr-run__badgerow" }, [badge]), title]);

    // --- Big countdown + thin progress bar ---------------------------------
    var clock = h("div", {
      class: "rr-run__clock", "aria-hidden": "true", text: fmtClock(S.remaining)
    });
    S.els.clock = clock;

    var fill = h("div", { class: "rr-run__progfill" });
    S.els.fill = fill;
    var prog = h("div", {
      class: "rr-run__prog", role: "progressbar",
      "aria-valuemin": "0", "aria-valuemax": "100"
    }, [fill]);
    S.els.prog = prog;

    var clockLabel = h("span", { class: "rr-run__clocklabel", "aria-hidden": "true",
      text: entry.minutes + " min block" });

    // --- +1 / −1 minute, flanking the clock --------------------------------
    var minus = h("button", {
      type: "button", class: "rr-run__adjust", "aria-label": "Subtract one minute",
      onclick: function () { adjustMinutes(-1); }, text: "−1 min"
    });
    var plus = h("button", {
      type: "button", class: "rr-run__adjust", "aria-label": "Add one minute",
      onclick: function () { adjustMinutes(1); }, text: "+1 min"
    });
    var clockBox = h("div", { class: "rr-run__clockbox" }, [
      clock, clockLabel, prog,
      h("div", { class: "rr-run__adjustrow" }, [minus, plus])
    ]);

    // --- Setup / steps / cues ----------------------------------------------
    var detail = h("div", { class: "rr-run__detail" }, [
      section("Setup", h("p", { class: "rr-run__text", text: drill.setup || "—" })),
      section("Run it", h("ol", { class: "rr-run__steps" },
        (drill.steps || []).map(function (s) { return h("li", { text: s }); }))),
      section("Say this", h("ul", { class: "rr-run__cues" },
        (drill.cues || []).map(function (c) { return h("li", { text: c }); })))
    ]);

    // --- Transport controls -------------------------------------------------
    var isLast = S.index === total - 1;

    var pauseBtn = h("button", {
      type: "button", class: "rr-run__ctrl",
      "aria-label": S.paused ? "Resume timer" : "Pause timer",
      onclick: togglePause,
      html: RR.ui.icon(S.paused ? ICON.play : ICON.pause, 24)
    });
    S.els.pauseBtn = pauseBtn;

    var prevBtn = h("button", {
      type: "button", class: "rr-run__ctrl",
      "aria-label": "Previous block",
      disabled: S.index === 0 ? true : null,
      onclick: prevBlock,
      html: RR.ui.icon(ICON.prev, 24)
    });

    var resetBtn = h("button", {
      type: "button", class: "rr-run__ctrl",
      "aria-label": "Reset this block's timer",
      onclick: resetBlock,
      html: RR.ui.icon(ICON.reset, 22)
    });

    var nextBtn = h("button", {
      type: "button",
      class: "rr-run__ctrl rr-run__ctrl--primary",
      "aria-label": isLast ? "Finish practice" : "Next block",
      onclick: isLast ? finishNow : nextBlock,
      html: isLast
        ? RR.ui.icon(ICON.check, 24)
        : RR.ui.icon(ICON.next, 24)
    });

    var controls = h("div", { class: "rr-run__controls" }, [
      prevBtn, resetBtn, pauseBtn, nextBtn
    ]);

    body.appendChild(headline);
    body.appendChild(clockBox);
    body.appendChild(controls);
    body.appendChild(detail);

    // Sync the visual progress + paused styling for the freshly built nodes.
    updateClockUI();
    syncPausedClass();
  }

  function section(label, content) {
    return h("div", { class: "rr-run__section" }, [
      h("span", { class: "eyebrow", text: label }),
      content
    ]);
  }

  // The celebratory final state.
  function renderComplete() {
    return h("div", { class: "rr-run__done", "aria-live": "polite" }, [
      h("div", { class: "rr-run__done-emoji", "aria-hidden": "true", text: "🏐" }),
      h("h2", { class: "rr-run__done-title", text: "Practice complete 🏐" }),
      h("p", { class: "rr-run__done-sub",
        text: "Nice work — that's the whole plan. Cool down and check in with the team." }),
      h("button", {
        type: "button", class: "btn btn-primary rr-run__done-btn",
        "aria-label": "Close Run mode", text: "Done", onclick: close
      })
    ]);
  }

  // ======================================================================= //
  //  TIMER                                                                   //
  // ======================================================================= //
  function startTicking() {
    stopTicking();
    if (S.paused || S.finished) return;
    S.timer = setInterval(tick, 1000);
  }
  function stopTicking() {
    if (S && S.timer) { clearInterval(S.timer); S.timer = null; }
  }

  function tick() {
    if (!S || S.paused || S.finished) return;
    S.remaining -= 1;
    if (S.remaining <= 0) {
      S.remaining = 0;
      updateClockUI();
      cueEnd();
      advanceFromTimer();
      return;
    }
    updateClockUI();
  }

  // When the running clock hits zero: either roll to the next block, or — on the
  // last block — land on the "complete" state.
  function advanceFromTimer() {
    if (S.index < S.blocks.length - 1) {
      S.index += 1;
      S.remaining = S.blocks[S.index].minutes * 60;
      renderBlock();
      startTicking();
    } else {
      enterFinished();
    }
  }

  function enterFinished() {
    stopTicking();
    S.finished = true;
    renderBlock();
  }

  // Only repaints the cheap, per-tick nodes (clock text + progress width),
  // leaving the rest of the DOM untouched so we don't churn the layout.
  function updateClockUI() {
    if (!S || !S.els.clock) return;
    S.els.clock.textContent = fmtClock(S.remaining);
    var entry = S.blocks[S.index];
    var total = entry.minutes * 60;
    var elapsed = total - S.remaining;
    var pct = total > 0 ? Math.max(0, Math.min(100, (elapsed / total) * 100)) : 0;
    if (S.els.fill) S.els.fill.style.width = pct.toFixed(1) + "%";
    if (S.els.prog) S.els.prog.setAttribute("aria-valuenow", Math.round(pct));
  }

  // ======================================================================= //
  //  CONTROLS                                                               //
  // ======================================================================= //
  function togglePause() {
    if (!S || S.finished) return;
    S.paused = !S.paused;
    if (S.paused) stopTicking();
    else startTicking();
    // Update just the pause button's icon + label without a full re-render.
    if (S.els.pauseBtn) {
      S.els.pauseBtn.innerHTML = RR.ui.icon(S.paused ? ICON.play : ICON.pause, 24);
      S.els.pauseBtn.setAttribute("aria-label", S.paused ? "Resume timer" : "Pause timer");
    }
    syncPausedClass();
  }
  function syncPausedClass() {
    if (!S || !S.root) return;
    S.root.classList.toggle("is-paused", !!S.paused);
  }

  function prevBlock() {
    if (!S || S.finished) return;
    if (S.index === 0) { resetBlock(); return; }
    S.index -= 1;
    S.remaining = S.blocks[S.index].minutes * 60;
    renderBlock();
    startTicking();
  }

  function nextBlock() {
    if (!S || S.finished) return;
    if (S.index >= S.blocks.length - 1) { finishNow(); return; }
    S.index += 1;
    S.remaining = S.blocks[S.index].minutes * 60;
    renderBlock();
    startTicking();
  }

  function finishNow() {
    if (!S) return;
    enterFinished();
  }

  function resetBlock() {
    if (!S || S.finished) return;
    S.remaining = S.blocks[S.index].minutes * 60;
    updateClockUI();
  }

  // Adjust the CURRENT block's length on the fly. We change both the block's
  // total minutes and the remaining time by the same delta, so the progress bar
  // stays honest. Floor of 1 minute, and never below 1s remaining.
  function adjustMinutes(delta) {
    if (!S || S.finished) return;
    var entry = S.blocks[S.index];
    var newMins = Math.max(1, entry.minutes + delta);
    if (newMins === entry.minutes) return; // already at the 1-min floor
    entry.minutes = newMins;
    S.remaining = Math.max(1, S.remaining + delta * 60);
    // The "N min block" caption changes, so re-render the block label + clock.
    renderBlock();
    if (!S.paused) startTicking();
  }

  // ======================================================================= //
  //  CLOSE                                                                  //
  // ======================================================================= //
  function onKey(e) {
    if (!S) return;
    if (e.key === "Escape" || e.key === "Esc") {
      e.preventDefault();
      close();
    }
  }

  function close() {
    stopTicking();
    document.removeEventListener("keydown", onKey, true);
    document.body.classList.remove("rr-run-open");
    if (S && S.root && S.root.parentNode) {
      S.root.parentNode.removeChild(S.root);
    }
    S = null;
  }

  return { start: start };
})();
