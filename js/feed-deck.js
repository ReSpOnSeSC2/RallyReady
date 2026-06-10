// feed-deck.js — the Ideas deck (RR.feedDeck): the default #ideas view.
//
// One card at a time instead of an endless feed. A finite, daily-dealt hand of
// cards drawn from the same pools as the browse feed (composed by
// RR.feed.deckSequence — seeded, age-tuned, theme-free), flipped like a deck:
// swipe RIGHT to save a card, swipe LEFT to skip it. The ✗ Skip / ♥ Save
// buttons (and the arrow keys) do exactly what the swipes do, so mouse,
// keyboard and screen-reader coaches get the same deck. The full filterable
// feed stays one tap away on #ideas-browse — nothing was removed, just demoted.
//
// PURE presentation: composition lives in feed.js, and saving uses the same
// savedIdeas/favorites the feed already uses, so the deck and the browse view
// can never disagree about what's saved.
window.RR = window.RR || {};

RR.feedDeck = (function () {
  "use strict";

  var ui = RR.ui;
  function h(tag, props, kids) { return ui.h(tag, props, kids); }

  // Glyphs (24x24 stroked paths, rendered via ui.icon — same set as feed.js).
  var HEART = '<path d="M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.66-3.4 6.74-8.55 11.49z"/>';
  var HEART_FILLED = '<path d="M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.66-3.4 6.74-8.55 11.49z" fill="currentColor" stroke="none"/>';
  var CROSS = '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>';
  var UNDO = '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>';
  var ARROW_LEFT = '<path d="M15 6l-6 6 6 6"/>';
  var REFRESH = '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v5h-5"/>';

  // ---- Position state (module scope) ----------------------------------------
  // Survives tab switches like the feed's own filters/batch; resets on a new
  // day, an age change, or a reload (the reload re-deals IDENTICAL content —
  // the sequence is seeded — so starting back at card 1 costs nothing).
  var pos = { key: null, index: 0, deals: 1 };
  var view = { mode: "deck", drill: null };   // "deck" OR an inline drill detail
  var deckRoot = null;     // our container INSIDE #screen (never the screen-head)
  var liveEl = null;       // polite live region for Saved/Skipped announcements
  var committing = false;  // a fling is in flight; ignore further input
  var lastDir = 0;         // -1 skipped, +1 saved — only used to reset cleanly

  function deckKey() {
    var d = new Date();
    var st = (RR.state && RR.state.getState()) || {};
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() +
      "|" + (st.feedAgeGroup || "all-ages");
  }
  function shownCount(list) {
    return Math.min(((RR.feed && RR.feed.DECK_SIZE) || 12) * pos.deals, list.length);
  }
  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  function announce(msg) { if (liveEl) liveEl.textContent = msg; }

  // ---- Saving ----------------------------------------------------------------
  // Saved-ness mirrors savedSequence() in feed.js: a raw drill (no item.type)
  // keeps its favorites star; every curated/tip card uses savedIdeas.
  function isItemSaved(item) {
    if (!RR.state || !item) return false;
    if (!item.type) return !!(RR.state.isFavorite && RR.state.isFavorite(item.id));
    return !!(RR.state.isSavedIdea && RR.state.isSavedIdea(item.id));
  }
  // A right swipe ENSURES saved — it never un-saves (the card's own heart/star
  // handles that), so re-swiping an already-loved card can't lose it.
  function saveItem(item) {
    if (!RR.state || isItemSaved(item)) return;
    if (!item.type) { if (RR.state.toggleFavorite) RR.state.toggleFavorite(item.id); }
    else if (RR.state.toggleSavedIdea) RR.state.toggleSavedIdea(item.id);
  }

  // ---- Commit (the ONE path for swipe, buttons and keys) ----------------------
  // dir +1 = save, -1 = skip. `refocus` keeps keyboard flow on the equivalent
  // control after the repaint; swipes pass false so focus is never stolen.
  function commit(dir, item, cardEl, refocus) {
    if (committing) return;
    committing = true;
    if (dir > 0) saveItem(item);
    lastDir = dir;
    announce(dir > 0 ? "Saved" : "Skipped");
    function advance() {
      pos.index++;
      paint();
      if (refocus) {
        var btn = deckRoot.querySelector(dir > 0 ? ".deck-btn--save" : ".deck-btn--skip") ||
                  deckRoot.querySelector(".deck-end__actions .btn");
        if (btn) btn.focus();
      }
    }
    if (reducedMotion() || !cardEl || !cardEl.isConnected) { advance(); return; }
    // Fling the card off-screen, then advance. transitionend is the happy path;
    // the timeout is the safety net (e.g. the tab was hidden mid-animation).
    var w = (cardEl.offsetWidth || 320) + 80;
    cardEl.classList.add("deck-card--fling");
    cardEl.style.transform = "translateX(" + (dir * w) + "px) rotate(" + (dir * 14) + "deg)";
    cardEl.style.opacity = "0";
    var done = false;
    function finish() { if (done) return; done = true; advance(); }
    cardEl.addEventListener("transitionend", finish);
    setTimeout(finish, 300);
  }
  function commitFromButtons(dir, item) {
    commit(dir, item, deckRoot && deckRoot.querySelector(".deck-card"), true);
  }

  // ---- Swipe gesture ----------------------------------------------------------
  // Pointer events on the stage. The gesture only ENGAGES on a clearly
  // horizontal drag (past a small slop, and more sideways than vertical) — a
  // vertical drag belongs to the page scroll (touch-action: pan-y leaves that
  // to the browser), and tiny jitters belong to taps on the card's own
  // controls (expand steps, share, the heart). Capture starts only after the
  // gesture engages, so normal clicks are never hijacked.
  function wireSwipe(wrapEl, cardEl, hintSave, hintSkip, item) {
    var drag = null;   // { id, x0, y0, dx, active, dead, w, t0 }

    wrapEl.addEventListener("pointerdown", function (e) {
      if (committing || e.button) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0,
               active: false, dead: false, w: wrapEl.offsetWidth || 320, t0: Date.now() };
    });
    wrapEl.addEventListener("pointermove", function (e) {
      if (!drag || drag.dead || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.active) {
        if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { drag.dead = true; return; }
        if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        drag.active = true;
        wrapEl.classList.add("deck-stage--dragging");
        if (wrapEl.setPointerCapture) { try { wrapEl.setPointerCapture(e.pointerId); } catch (err) {} }
      }
      drag.dx = dx;
      cardEl.style.transform = "translateX(" + dx + "px) rotate(" + (dx * 0.05) + "deg)";
      var k = Math.min(1, Math.abs(dx) / (drag.w * 0.35));
      hintSave.style.opacity = dx > 0 ? String(k) : "0";
      hintSkip.style.opacity = dx < 0 ? String(k) : "0";
    });
    function release(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag; drag = null;
      wrapEl.classList.remove("deck-stage--dragging");
      if (!d.active) return;
      var ms = Math.max(1, Date.now() - d.t0);
      var flick = Math.abs(d.dx) > 60 && (Math.abs(d.dx) / ms) > 0.5;
      if (Math.abs(d.dx) > d.w * 0.35 || flick) {
        commit(d.dx > 0 ? 1 : -1, item, cardEl, false);
      } else {
        // Below the threshold: snap back (the transition comes from CSS once
        // --dragging is off) and fade the hints away.
        cardEl.style.transform = "";
        hintSave.style.opacity = "0";
        hintSkip.style.opacity = "0";
      }
    }
    wrapEl.addEventListener("pointerup", release);
    wrapEl.addEventListener("pointercancel", release);
  }

  // ArrowLeft / ArrowRight flip the deck from the keyboard. Wired on the deck
  // root, so it only fires while focus is inside the deck — and never while
  // the focus sits in the age <select> (arrows change its options there).
  function onKeydown(e) {
    if (view.mode !== "deck" || committing) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    var t = e.target;
    if (t && (t.tagName === "SELECT" || t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
    var list = RR.feed.deckSequence();
    if (pos.index >= shownCount(list)) return;
    e.preventDefault();
    commit(e.key === "ArrowRight" ? 1 : -1, list[pos.index], deckRoot.querySelector(".deck-card"), true);
  }

  // ---- Pieces ------------------------------------------------------------------
  function stage(list) {
    var item = list[pos.index];
    var hintSave = h("span", { class: "deck-hint deck-hint--save", "aria-hidden": "true", text: "♥ Save" });
    var hintSkip = h("span", { class: "deck-hint deck-hint--skip", "aria-hidden": "true", text: "Skip" });
    var card = h("div", { class: "deck-card" },
      [RR.feed.renderItem(item, { onOpen: openDrillDetail }), hintSave, hintSkip]);
    var wrap = h("div", { class: "deck-stage" }, [card]);
    wireSwipe(wrap, card, hintSave, hintSkip, item);
    return wrap;
  }

  function progressRow(shown) {
    // Digits for the eye ("3 / 12" needs no translation); words for the ear.
    return h("p", { class: "deck-progress" }, [
      h("span", { "aria-hidden": "true", text: (pos.index + 1) + " / " + shown }),
      h("span", { class: "deck-sr", text: "Card " + (pos.index + 1) + " of " + shown })
    ]);
  }

  function controlsRow(item) {
    var saved = isItemSaved(item);
    var back = h("button", { type: "button", class: "btn btn-ghost deck-btn deck-btn--undo",
      "aria-label": "Back one card", disabled: pos.index === 0 }, [
      h("span", { class: "btn__icon", "aria-hidden": "true", html: ui.icon(UNDO, 18) }),
      h("span", { text: "Back" })
    ]);
    back.addEventListener("click", function () {
      if (committing || !pos.index) return;
      pos.index--; lastDir = 0; paint();
      var b = deckRoot.querySelector(".deck-btn--undo");
      if (b) b.focus();
    });

    var skip = h("button", { type: "button", class: "btn btn-ghost deck-btn deck-btn--skip" }, [
      h("span", { class: "btn__icon", "aria-hidden": "true", html: ui.icon(CROSS, 18) }),
      h("span", { class: "deck-btn__label", text: "Skip" })
    ]);
    skip.addEventListener("click", function () { commitFromButtons(-1, item); });

    var save = h("button", { type: "button", class: "btn btn-primary deck-btn deck-btn--save",
      "aria-pressed": saved ? "true" : "false" }, [
      h("span", { class: "btn__icon", "aria-hidden": "true", html: ui.icon(saved ? HEART_FILLED : HEART, 18) }),
      h("span", { class: "deck-btn__label", text: saved ? "Saved" : "Save" })
    ]);
    save.addEventListener("click", function () { commitFromButtons(1, item); });

    return h("div", { class: "deck-controls" }, [back, skip, save]);
  }

  // The deck's Save button and the card's own heart/star both write the same
  // state, so ONE module-level subscription keeps them in step both ways (a
  // per-render subscription would leak — notify() fires on every state write).
  function syncSaveButton() {
    var btn = deckRoot.querySelector(".deck-btn--save");
    if (!btn || !RR.feed) return;
    var list = RR.feed.deckSequence();
    if (pos.index >= shownCount(list)) return;
    var saved = isItemSaved(list[pos.index]);
    btn.setAttribute("aria-pressed", saved ? "true" : "false");
    var ic = btn.querySelector(".btn__icon");
    if (ic) ic.innerHTML = ui.icon(saved ? HEART_FILLED : HEART, 18);
    var lab = btn.querySelector(".deck-btn__label");
    if (lab) lab.textContent = saved ? "Saved" : "Save";
  }
  if (RR.state && RR.state.subscribe) {
    RR.state.subscribe(function () {
      if (deckRoot && deckRoot.isConnected && view.mode === "deck" && !committing) syncSaveButton();
    });
  }

  function endCard(list, shown) {
    var savedCount = 0;
    for (var i = 0; i < shown; i++) if (isItemSaved(list[i])) savedCount++;
    var kids = [
      h("h3", { class: "feed-card__title", text: "That's the deck for today" }),
      h("p", { class: "feed-card__body", text: savedCount
        ? "You saved " + savedCount + (savedCount === 1 ? " idea." : " ideas.")
        : "Nothing saved this time — deal more or browse the full feed." }),
      h("p", { class: "feed-card__body", text: "New cards tomorrow — same time, fresh mix." })
    ];
    var actions = [];
    if (shown < list.length) {
      var more = h("button", { type: "button", class: "btn btn-primary deck-end__btn" }, [
        h("span", { class: "btn__icon", "aria-hidden": "true", html: ui.icon(REFRESH, 18) }),
        h("span", { text: "Deal me more" })
      ]);
      more.addEventListener("click", function () { pos.deals++; lastDir = 0; paint(); window.scrollTo(0, 0); });
      actions.push(more);
    }
    var seeSaved = h("button", { type: "button", class: "btn btn-ghost deck-end__btn" },
      [h("span", { text: "See saved" })]);
    seeSaved.addEventListener("click", function () {
      if (RR.feed.showSaved) RR.feed.showSaved();
      location.hash = "#ideas-browse";
    });
    actions.push(seeSaved);
    actions.push(h("a", { class: "btn btn-ghost deck-end__btn", href: "#ideas-browse", text: "Browse all ideas" }));
    var back = h("button", { type: "button", class: "btn btn-ghost deck-end__btn" },
      [h("span", { text: "Back one card" })]);
    back.addEventListener("click", function () {
      if (!pos.index) return;
      pos.index--; lastDir = 0; paint();
    });
    actions.push(back);
    kids.push(h("div", { class: "deck-end__actions" }, actions));
    return h("section", { class: "card feed-card deck-end" }, kids);
  }

  // Inline drill detail — same takeover pattern as detailView() in feed.js, but
  // it returns to the deck at the SAME card.
  function openDrillDetail(drill) {
    view = { mode: "drill", drill: drill };
    paint();
    var head = deckRoot.querySelector(".drill-detail__name");
    if (head) { head.setAttribute("tabindex", "-1"); head.focus(); }
    window.scrollTo(0, 0);
  }
  function detailView(drill) {
    var back = h("button", { type: "button", class: "btn btn-ghost feed-back" }, [
      h("span", { "aria-hidden": "true", class: "feed-back__icon", html: ui.icon(ARROW_LEFT, 18) }),
      "Back to the deck"
    ]);
    back.addEventListener("click", function () {
      view = { mode: "deck", drill: null };
      paint();
      var title = document.querySelector(".screen-title");
      if (title) title.focus();
      window.scrollTo(0, 0);
    });
    return h("div", { class: "feed-detail-wrap" }, [back, ui.drillDetail(drill)]);
  }

  // The quiet escape hatches: the full feed and the classic planner + timer.
  function footerLinks() {
    return h("div", { class: "deck-footer" }, [
      h("a", { class: "feed-planner-link deck-browse-link", href: "#ideas-browse" }, [
        h("span", { text: "Browse all ideas" }),
        h("span", { class: "feed-planner-link__arrow", "aria-hidden": "true", text: " →" })
      ]),
      h("a", { class: "feed-planner-link", href: "#today" }, [
        h("span", { text: "Open the full planner & timer" }),
        h("span", { class: "feed-planner-link__arrow", "aria-hidden": "true", text: " →" })
      ])
    ]);
  }

  // Tie the intro line to the page-guide "About this page" control, exactly
  // like the browse feed does (the panel covers the same ground).
  function aboutInfoBtn() { return document.querySelector(".page-guide__info"); }
  function syncIntroToAbout() {
    var intro = deckRoot && deckRoot.querySelector(".feed-intro");
    if (!intro) return;
    var info = aboutInfoBtn();
    intro.hidden = !!(info && info.getAttribute("aria-expanded") === "true");
  }
  function wireAboutToggle() {
    var info = aboutInfoBtn();
    if (!info || info._deckIntroWired) return;   // wire once per app-built head
    info._deckIntroWired = true;
    info.addEventListener("click", syncIntroToAbout);
  }

  // ---- Paint + entry point -----------------------------------------------------
  function paint() {
    if (!deckRoot) return;
    committing = false;
    deckRoot.innerHTML = "";

    if (view.mode === "drill" && view.drill) {
      deckRoot.appendChild(detailView(view.drill));
      return;
    }

    deckRoot.appendChild(h("p", { class: "screen-sub feed-intro",
      text: "One card at a time — today's picks, fresh each day." }));
    deckRoot.appendChild(RR.feed.agePicker(function () {
      pos = { key: deckKey(), index: 0, deals: 1 };
      lastDir = 0;
      paint();
      window.scrollTo(0, 0);
    }));

    var list = RR.feed.deckSequence();
    var shown = shownCount(list);
    if (pos.index > shown) pos.index = shown;

    if (!list.length) {
      // An extreme age band can empty every pool; offer the full feed instead.
      deckRoot.appendChild(ui.emptyState({
        title: "Nothing in the deck",
        blurb: "Try a different age group — or browse the full feed of ideas, drills, challenges and tips.",
        btnLabel: "Browse all ideas", hash: "#ideas-browse"
      }));
    } else if (pos.index >= shown) {
      deckRoot.appendChild(endCard(list, shown));
    } else {
      deckRoot.appendChild(stage(list));
      deckRoot.appendChild(progressRow(shown));
      deckRoot.appendChild(controlsRow(list[pos.index]));
      deckRoot.appendChild(h("p", { class: "deck-swipe-tip", text: "Swipe right to save, left to skip." }));
    }
    deckRoot.appendChild(footerLinks());
    syncIntroToAbout();
  }

  function render(host) {
    var key = deckKey();
    if (pos.key !== key) pos = { key: key, index: 0, deals: 1 };   // new day / age → fresh deal
    view = { mode: "deck", drill: null };
    lastDir = 0;
    // Our own container appended INTO #screen (below the app's screen-head),
    // so paint() can rebuild freely without wiping the title/page guide. The
    // live region sits OUTSIDE the repaint area so announcements survive it.
    deckRoot = h("div", { class: "feed-root deck" });
    deckRoot.addEventListener("keydown", onKeydown);
    host.appendChild(deckRoot);
    liveEl = h("div", { class: "deck-sr", "aria-live": "polite" });
    host.appendChild(liveEl);
    wireAboutToggle();
    paint();
  }

  return { render: render };
})();
