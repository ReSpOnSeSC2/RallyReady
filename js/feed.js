// feed.js — the Ideas feed (RR.feed).
//
// Practice, reimagined as a PULL experience: a scrollable feed of coaching
// inspiration a coach browses before practice — mini practice-flows, drill
// spotlights, bite-size tips, fun challenges, mindset nuggets and themed
// collections — instead of a generated plan to run live. It draws on the same
// libraries the rest of the app already has (RR.drills, RR.coaching.tips) plus
// its own curated content layer (js/feed-data*.js), and is ADDITIVE: the classic
// planner + timer stay reachable on #today, untouched.
//
// PURE presentation + light composition. Every colour is a SEMANTIC token (see
// css/feed.css) so it reads in BOTH light and dark themes; interactive controls
// are real <button>s (keyboard + :focus-visible for free). No nested cards.
window.RR = window.RR || {};

RR.feed = (function () {
  "use strict";

  // Cached at load (feed.js loads after ui.js). The wrapper keeps load-time safe
  // even if RR.ui isn't present yet (e.g. a bare sandbox), since h() only runs
  // when a screen actually renders.
  var ui = RR.ui;
  function h(tag, props, kids) { return ui.h(tag, props, kids); }

  // ======================================================================= //
  //  Content layer                                                          //
  // ======================================================================= //
  // Curated feed content lives here and in js/feed-data*.js. Each data file
  // calls RR.feed.add({...}) to concatenate onto these arrays — mirroring how
  // coaching-tips-*.js extend RR.coaching via addTips(). At compose time (Prompt
  // 4) the feed ALSO pulls drill spotlights from RR.drills and tip cards from
  // RR.coaching.tips, so this layer only holds the bespoke item types.
  //
  // Item shapes (see js/feed-data.js for the authored set):
  //   idea      { id, type:"idea", title, theme, skill, vibe, ageMin, ageMax,
  //               minutes, goal, tipRef?, blocks:[{ role, minutes, drillId }] }
  //   challenge { id, type:"challenge", title, body, skill?, vibe, ageMin, ageMax }
  //   mindset   { id, type:"mindset", title, body, tipRef?, ageMin, ageMax }
  //   theme     { id, type:"theme", title, blurb, filter:{skill?|vibe?}, sampleDrillIds?[] }
  // vibe ∈ fun | skill-builder | quick | game-day.
  var data = { ideas: [], challenges: [], mindset: [], themes: [] };

  // PUBLIC: append curated content. `partial` is an object whose keys match
  // `data` (ideas/challenges/mindset/themes); each present array is appended in
  // place, so RR.feed.data keeps its identity and additions are visible at once.
  function add(partial) {
    if (!partial) return;
    Object.keys(data).forEach(function (k) {
      if (Array.isArray(partial[k])) {
        partial[k].forEach(function (item) { data[k].push(item); });
      }
    });
  }

  // ======================================================================= //
  //  Small glyphs + helpers                                                 //
  // ======================================================================= //
  // Stroked 24x24 line glyphs (rendered via ui.icon). Filled variants set the
  // fill on the path so a "saved" heart reads solid, exactly like the fav star.
  var BULB = '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.4 1 2.5h6c0-1.1.3-1.9 1-2.5A6 6 0 0 0 12 3z"/>';
  var HEART = '<path d="M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.66-3.4 6.74-8.55 11.49z"/>';
  var HEART_FILLED = '<path d="M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.66-3.4 6.74-8.55 11.49z" fill="currentColor" stroke="none"/>';
  var CHEV_DOWN = '<path d="M6 9l6 6 6-6"/>';
  var CHEV_RIGHT = '<path d="M9 6l6 6-6 6"/>';
  var ARROW_LEFT = '<path d="M15 6l-6 6 6 6"/>';
  var SHARE = '<path d="M12 16V4"/><path d="M8 8l4-4 4 4"/><path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"/>';
  var PRINTER = '<path d="M7 9V3h10v6"/><path d="M7 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7z"/>';

  function drillById(id) {
    var list = RR.drills || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function tipFor(ref) {
    return (ref && RR.coaching && RR.coaching.tipById) ? RR.coaching.tipById(ref) : null;
  }

  var VIBE_LABEL = { fun: "Fun", "skill-builder": "Skill builder", quick: "Quick", "game-day": "Game day" };
  function vibeLabel(v) { return VIBE_LABEL[v] || v; }
  var KIND_LABEL = { idea: "Practice idea", drill: "Drill spotlight", tip: "Coaching tip",
    challenge: "Challenge", mindset: "Mindset", theme: "Collection" };

  var seq = 0;   // unique-id counter for collapsible regions

  // ---- View + filter state (module scope, survives route changes) ---------
  var hostEl = null;       // #screen — OWNED by app.js (holds the screen-head: title + page guide)
  var feedRoot = null;     // our own container INSIDE #screen; we clear/rebuild THIS, never #screen
  var current = { mode: "feed", drill: null };   // "feed" list OR an inline drill detail
  var filters = { skill: null, vibe: null, themeId: null, saved: false };
  var batch = 0;                                              // "More ideas" page
  var chipsOpen = false;                                      // chip-bar disclosure (persists across nav)
  var onSaveToggle = null;                                    // set in render(): re-filter the Saved view
  var VIBES = ["fun", "skill-builder", "quick", "game-day"];
  var SKILL_CHIPS = ["Ball Control", "Passing", "Setting", "Serving", "Hitting", "Blocking", "Defense", "Team Play"];

  // ======================================================================= //
  //  Age tuning — NO team setup required, the feed just asks for an age      //
  // ======================================================================= //
  // The ONLY input the Ideas feed needs, and it is fully self-contained: the
  // chosen band lives in RR.state.feedAgeGroup and is read/written ONLY here, so
  // the age feature is strictly scoped to this screen — it never reads or changes
  // the team, and no other screen consumes it. Default null = "All ages".
  function resolvedAgeGroup() {
    var st = (RR.state && RR.state.getState()) || {};
    return st.feedAgeGroup || null;   // null = all ages; team setup is irrelevant here
  }
  function resolvedBand() {
    var ag = resolvedAgeGroup();
    return (ag && RR.team && RR.team.ageRange) ? RR.team.ageRange(ag) : null;
  }
  function setFeedAgeGroup(ag) {
    if (RR.state && RR.state.update) RR.state.update({ feedAgeGroup: ag || null });
  }

  // ======================================================================= //
  //  Shared card pieces                                                     //
  // ======================================================================= //
  // A small eyebrow row: the card KIND chip, plus optional vibe / theme tag /
  // minutes. Keeps every card's top line visually consistent.
  function metaRow(kind, opts) {
    opts = opts || {};
    var kids = [h("span", { class: "feed-kind feed-kind--" + kind, text: KIND_LABEL[kind] || kind })];
    if (opts.vibe) kids.push(h("span", { class: "feed-vibe feed-vibe--" + opts.vibe, text: vibeLabel(opts.vibe) }));
    if (opts.theme) kids.push(h("span", { class: "feed-tag", text: opts.theme }));
    if (opts.minutes != null) kids.push(h("span", { class: "feed-mins", text: opts.minutes + " min" }));
    return h("div", { class: "feed-meta" }, kids);
  }

  function isSaved(item) {
    return !!(RR.state && RR.state.isSavedIdea && RR.state.isSavedIdea(item.id));
  }
  // A heart toggle that saves a feed item — separate from drill favorites (which
  // keep their star). Persists via RR.state.toggleSavedIdea (added in Prompt 5);
  // until then it is inert but harmless (no throw, just no persistence).
  function saveButton(item) {
    var saved = isSaved(item);
    var btn = h("button", { type: "button", class: "feed-save" + (saved ? " is-on" : ""),
      "aria-pressed": saved ? "true" : "false",
      "aria-label": saved ? "Remove “" + item.title + "” from saved" : "Save “" + item.title + "”" });
    function paintHeart() { btn.innerHTML = ui.icon(saved ? HEART_FILLED : HEART, 20); }
    paintHeart();
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!(RR.state && RR.state.toggleSavedIdea)) return;
      saved = RR.state.toggleSavedIdea(item.id);
      btn.classList.toggle("is-on", saved);
      btn.setAttribute("aria-pressed", saved ? "true" : "false");
      paintHeart();
      if (onSaveToggle) onSaveToggle(item, saved);
    });
    return btn;
  }

  // A one-line tip "hook" that links to the Tips tab (resolved from a tipRef).
  function tipHookLine(t) {
    return h("a", { class: "feed-tiphook", href: "#tips" }, [
      h("span", { class: "feed-tiphook__icon", "aria-hidden": "true", html: ui.icon(BULB, 16) }),
      h("span", { class: "feed-tiphook__text", text: t.title })
    ]);
  }

  function feedFooter(actions) { return h("div", { class: "feed-card__foot" }, actions); }

  // Net/ball reference for the carry sheet: the real team if one is set up, else a
  // minimal stand-in carrying just the chosen age group — so the sheet still shows
  // the right net height + ball WITHOUT requiring team setup.
  function shareTeam() {
    var t = (RR.state && RR.state.getState().team) || null;
    var ag = resolvedAgeGroup();   // the feed's chosen age (null = All ages)
    // Match the carry sheet's net/ball to the age the coach is browsing; keep the
    // team name when there is one. With "All ages", use the team's own reference.
    if (ag) return { name: t ? t.name : undefined, ageGroup: ag };
    return t;
  }
  // Build a share-compatible session from a mini-flow, resolving each block's
  // drillId to the full drill so the carry sheet carries setup/steps/cues/gear.
  function ideaToSession(idea) {
    return {
      skillFocus: idea.skill,
      totalMinutes: idea.minutes,
      blocks: (idea.blocks || []).map(function (b) {
        var d = drillById(b.drillId);
        return { role: b.role, title: d ? d.name : b.drillId, minutes: b.minutes, drill: d || {} };
      })
    };
  }
  // RR.share.session / printSession are already null-tolerant — no changes there.
  function shareIdea(idea) { if (RR.share && RR.share.session) RR.share.session(ideaToSession(idea), shareTeam()); }
  function printIdea(idea) { if (RR.share && RR.share.printSession) RR.share.printSession(ideaToSession(idea), shareTeam()); }
  // Footer actions use the app's shared .btn .btn-ghost (ink outline + hard
  // offset shadow), so Share/Print match every other button in RallyReady.
  function actButton(label, glyph, idea, fn) {
    var btn = h("button", { type: "button", class: "btn btn-ghost feed-act" }, [
      h("span", { class: "btn__icon", "aria-hidden": "true", html: ui.icon(glyph, 18) }),
      h("span", { text: label })
    ]);
    btn.addEventListener("click", function (e) { e.stopPropagation(); fn(idea); });
    return btn;
  }
  function shareButton(idea) { return actButton("Share", SHARE, idea, shareIdea); }
  function printButton(idea) { return actButton("Print", PRINTER, idea, printIdea); }

  // The block list of a mini-flow, resolved to real drill names + minutes.
  function flowList(idea) {
    return h("ul", { class: "feed-flow" }, (idea.blocks || []).map(function (b) {
      var d = drillById(b.drillId);
      return h("li", { class: "feed-flow__row" }, [
        h("span", { class: "feed-flow__role", text: b.role }),
        h("span", { class: "feed-flow__name", text: d ? d.name : b.drillId }),
        h("span", { class: "feed-flow__min", text: b.minutes + " min" })
      ]);
    }));
  }

  // Collapsible "how to run it" — each block's drill steps, folded away by
  // default. Built inline (a button + hideable panel), NOT RR.ui.disclosure,
  // which would nest a card inside this card (forbidden by the design rules).
  function stepsDisclosure(idea) {
    var pid = "feed-steps-" + (++seq);
    var panel = h("div", { class: "feed-steps", id: pid });
    (idea.blocks || []).forEach(function (b) {
      var d = drillById(b.drillId);
      if (!d) return;
      panel.appendChild(h("div", { class: "feed-steps__block" }, [
        h("span", { class: "eyebrow", text: d.name + " · " + b.minutes + " min" }),
        h("ol", { class: "feed-steps__list" }, (d.steps || []).map(function (s) { return h("li", { text: s }); }))
      ]));
    });
    panel.hidden = true;
    var chev = h("span", { class: "feed-steps__chev", "aria-hidden": "true", html: ui.icon(CHEV_DOWN, 18) });
    var label = h("span", { text: "Show how to run it" });
    var toggle = h("button", { type: "button", class: "feed-steps__toggle",
      "aria-expanded": "false", "aria-controls": pid }, [label, chev]);
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      panel.hidden = !open;
      chev.classList.toggle("is-open", open);
      label.textContent = open ? "Hide steps" : "Show how to run it";
    });
    return h("div", { class: "feed-steps__wrap" }, [toggle, panel]);
  }

  // ======================================================================= //
  //  Card renderers — one per feed item type                                //
  // ======================================================================= //
  function ideaCard(idea) {
    var kids = [
      metaRow("idea", { vibe: idea.vibe, theme: idea.theme, minutes: idea.minutes }),
      h("h3", { class: "feed-card__title", text: idea.title }),
      h("p", { class: "feed-card__goal", text: idea.goal }),
      flowList(idea)
    ];
    var t = tipFor(idea.tipRef);
    if (t) kids.push(tipHookLine(t));
    kids.push(stepsDisclosure(idea));
    kids.push(feedFooter([shareButton(idea), printButton(idea), saveButton(idea)]));
    return h("section", { class: "card feed-card feed-card--idea" }, kids);
  }

  // A drill spotlight reuses the shared Drills card; tapping opens the full
  // drill detail in a lightweight inline panel (no separate route needed).
  // opts.onOpen lets the deck (js/feed-deck.js) supply its own detail view —
  // the default repaints THIS module's browse root.
  function drillSpotlightCard(drill, opts) {
    return ui.drillCard(drill, { onOpen: (opts && opts.onOpen) || openDrillDetail });
  }

  // A compact tip card: icon chip + title + first 1–2 points. The body is a real
  // link to the Tips tab (the big tap target); the save heart sits beside it.
  function tipCard(t) {
    var pts = (t.points || []).slice(0, 2);
    var body = h("a", { class: "feed-tip__link", href: "#tips",
      "aria-label": "Open “" + t.title + "” in Tips" }, [
      h("div", { class: "feed-tip__head" }, [
        h("span", { class: "feed-tip__chip", "aria-hidden": "true", html: ui.icon(BULB, 18) }),
        h("h3", { class: "feed-card__title", text: t.title })
      ]),
      h("ul", { class: "feed-tip__points" }, pts.map(function (p) { return h("li", { text: p }); }))
    ]);
    return h("section", { class: "card feed-card feed-card--tip" }, [
      metaRow("tip", {}),
      body,
      feedFooter([h("a", { class: "feed-link", href: "#tips" }, ["Open in Tips →"]), saveButton(t)])
    ]);
  }

  function challengeCard(c) {
    var kids = [
      metaRow("challenge", { vibe: c.vibe, theme: c.skill || null }),
      h("h3", { class: "feed-card__title", text: c.title }),
      h("p", { class: "feed-card__body", text: c.body })
    ];
    var t = tipFor(c.tipRef);
    if (t) kids.push(tipHookLine(t));
    kids.push(feedFooter([saveButton(c)]));
    return h("section", { class: "card feed-card feed-card--challenge" }, kids);
  }

  function mindsetCard(m) {
    var kids = [
      metaRow("mindset", {}),
      h("h3", { class: "feed-card__title", text: m.title }),
      h("p", { class: "feed-card__body", text: m.body })
    ];
    var t = tipFor(m.tipRef);
    if (t) kids.push(tipHookLine(t));
    kids.push(feedFooter([saveButton(m)]));
    return h("section", { class: "card feed-card feed-card--mindset" }, kids);
  }

  // A theme/collection card: tapping "See ideas" applies its filter to the feed.
  function themeCard(t) {
    var cta = h("button", { type: "button", class: "btn btn-ghost feed-theme__cta" }, [
      h("span", { text: "See ideas" }),
      h("span", { class: "btn__icon feed-theme__chev", "aria-hidden": "true", html: ui.icon(CHEV_RIGHT, 16) })
    ]);
    cta.addEventListener("click", function () { applyThemeFilter(t); });
    return h("section", { class: "card feed-card feed-card--theme" }, [
      metaRow("theme", (t.filter && t.filter.vibe) ? { vibe: t.filter.vibe } : {}),
      h("h3", { class: "feed-card__title", text: t.title }),
      h("p", { class: "feed-card__goal", text: t.blurb }),
      feedFooter([cta])
    ]);
  }

  // Dispatcher: pick a renderer by item.type. A raw drill (from RR.drills) has
  // no `type`, so it falls through to the spotlight renderer. `opts` is only
  // meaningful for drills (see drillSpotlightCard); other cards ignore it.
  function renderItem(item, opts) {
    if (!item) return document.createComment("empty");
    switch (item.type) {
      case "idea": return ideaCard(item);
      case "challenge": return challengeCard(item);
      case "mindset": return mindsetCard(item);
      case "theme": return themeCard(item);
      case "tip": return tipCard(item);
      case "drill": return drillSpotlightCard(item, opts);
      default: return drillSpotlightCard(item, opts);
    }
  }

  // Applying a theme's filter narrows the feed to that skill/vibe (Prompt 4/5).
  function applyThemeFilter(theme) {
    filters.themeId = (theme && theme.id) || null;
    filters.skill = null;
    filters.vibe = null;
    filters.saved = false;
    batch = 0;
    paint();
    window.scrollTo(0, 0);
  }

  // ======================================================================= //
  //  Composer — variety, age-tuning, freshness                              //
  // ======================================================================= //
  // A tiny self-contained PRNG (do NOT depend on generator.js). FNV-1a hash +
  // mulberry32 give a deterministic, seedable shuffle so the feed order is stable
  // within a day and refreshes on a new day or a higher "More ideas" batch.
  var REFRESH = '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v5h-5"/>';
  var PAGE = 9;        // items revealed per "More ideas" batch
  var DRILL_CAP = 12;  // cap drill spotlights so they never drown out the curated mix
  var TIP_CAP = 8;     // cap tip cards likewise
  var seqCache = { key: null, list: [] };

  function dateSeedStr() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }
  function hashStr(s) {
    var x = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); }
    return x >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function seededShuffle(arr, rnd) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function overlapsAge(item, band) {
    if (!band) return true;
    if (item.ageMin == null || item.ageMax == null) return true;   // ageless items always pass
    return item.ageMin <= band.max && item.ageMax >= band.min;
  }
  // Map the four vibes onto a raw drill, so a vibe filter (e.g. a "Just play"
  // theme → game-day) still surfaces relevant drill spotlights.
  function drillMatchesVibe(d, vibe) {
    if (!vibe) return true;
    if (vibe === "game-day") return !!d.isGame;
    if (vibe === "quick") return (d.durationMin || 10) <= 8;
    if (vibe === "fun") return !!d.campFriendly;
    if (vibe === "skill-builder") return !d.isGame && d.skill !== "Warmup" && d.skill !== "Cooldown";
    return true;
  }
  // Does a candidate survive the active age band + skill/vibe filters? Items with
  // no skill/vibe (mindset, tips, themes) are intentionally dropped once a skill
  // or vibe filter is active, so a focused view stays focused.
  function candidateMatches(item, type, band, filters) {
    if (!overlapsAge(item, band)) return false;
    if (filters.skill) {
      var sk = (type === "drill" || type === "idea" || type === "challenge") ? item.skill : null;
      if (sk !== filters.skill) return false;
    }
    if (filters.vibe) {
      if (type === "drill") { if (!drillMatchesVibe(item, filters.vibe)) return false; }
      else if (type === "idea" || type === "challenge") { if (item.vibe !== filters.vibe) return false; }
      else return false;
    }
    return true;
  }

  function drillCandidates(band, filters) {
    return (RR.drills || []).filter(function (d) {
      // Skip warm-up / cool-down spotlights unless the feed is themed to them.
      if ((d.skill === "Warmup" || d.skill === "Cooldown") && filters.skill !== d.skill) return false;
      return candidateMatches(d, "drill", band, filters);
    });
  }
  function tipCandidates(filters) {
    if (filters.skill || filters.vibe) return [];   // tips carry no skill/vibe
    var tips = (RR.coaching && RR.coaching.tips) || [];
    return tips.map(function (t) {
      return { type: "tip", id: "tipcard-" + t.id, title: t.title, points: t.points, icon: t.icon, tipId: t.id };
    });
  }

  // Spread every type EVENLY across the sequence (a stratified interleave), so
  // each page carries a real mix and ideas/challenges aren't buried under the
  // larger drill/tip pools. Each item gets a fractional position within its own
  // pool (jittered by the seeded rng); sorting by that position interlaces the
  // types proportionally. A light single pass then breaks any same-type neighbours
  // that remain, so no two same-type cards sit adjacent.
  function interleave(pools, rnd) {
    var items = [];
    Object.keys(pools).forEach(function (type) {
      var arr = pools[type], n = arr.length;
      for (var i = 0; i < n; i++) items.push({ pos: (i + rnd()) / n, type: type, item: arr[i] });
    });
    items.sort(function (a, b) { return a.pos - b.pos; });
    for (var i = 1; i < items.length; i++) {
      if (items[i].type === items[i - 1].type) {
        for (var j = i + 1; j < items.length; j++) {
          if (items[j].type !== items[i - 1].type) {
            var tmp = items[i]; items[i] = items[j]; items[j] = tmp;
            break;
          }
        }
      }
    }
    return items.map(function (x) { return x.item; });
  }

  function filterKey(filters) {
    return (resolvedAgeGroup() || "all-ages") +
      "|" + (filters.skill || "") + "|" + (filters.vibe || "") + "|" + (filters.saved ? "saved" : "");
  }

  // Build (and cache) the full, filtered, interleaved, date-seeded sequence. Cache
  // key folds in the chosen age group, the filters and the day, so it rebuilds
  // exactly when any change — and stays identical on a same-day reload.
  function buildSequence(filters) {
    var band = resolvedBand();
    var rnd = mulberry32(hashStr(dateSeedStr() + "|" + filterKey(filters)));
    var pools = {
      idea: data.ideas.filter(function (it) { return candidateMatches(it, "idea", band, filters); }),
      challenge: data.challenges.filter(function (it) { return candidateMatches(it, "challenge", band, filters); }),
      mindset: data.mindset.filter(function (it) { return candidateMatches(it, "mindset", band, filters); }),
      theme: data.themes.filter(function (it) { return candidateMatches(it, "theme", band, filters); }),
      drill: drillCandidates(band, filters),
      tip: tipCandidates(filters)
    };
    Object.keys(pools).forEach(function (k) { pools[k] = seededShuffle(pools[k], rnd); });
    pools.drill = pools.drill.slice(0, DRILL_CAP);
    pools.tip = pools.tip.slice(0, TIP_CAP);
    return interleave(pools, rnd);
  }
  function fullSequence(filters) {
    var key = filterKey(filters) + "|" + dateSeedStr();
    if (seqCache.key !== key) seqCache = { key: key, list: buildSequence(filters) };
    return seqCache.list;
  }

  // PUBLIC-ish: the feed as composed for `batch` (cumulative — pages 0..batch).
  function composeFeed(filters, batch) {
    var list = fullSequence(filters);
    return list.slice(0, Math.min((batch + 1) * PAGE, list.length));
  }

  // The deck: the daily hand for the one-card-at-a-time view (js/feed-deck.js).
  // Same pools and seeded machinery as the browse feed, but UNFILTERED (age
  // tuning only) and with NO theme cards — a collection's "See ideas" applies a
  // browse filter, which is meaningless one card at a time. The "|deck|" seed
  // marker keeps the deal's order different from the same-day browse order. The
  // deck UI shows DECK_SIZE cards per deal; "Deal me more" walks further into
  // this one sequence, so there are no same-day repeats.
  var DECK_SIZE = 12;       // cards per deal
  var DECK_DRILL_CAP = 8;   // tighter caps than the feed so every deal stays mixed
  var DECK_TIP_CAP = 6;
  var deckCache = { key: null, list: [] };
  function deckSequence() {
    var key = dateSeedStr() + "|deck|" + (resolvedAgeGroup() || "all-ages");
    if (deckCache.key === key) return deckCache.list;
    var band = resolvedBand();
    var rnd = mulberry32(hashStr(key));
    var none = { skill: null, vibe: null, saved: false };
    var pools = {
      idea: data.ideas.filter(function (it) { return candidateMatches(it, "idea", band, none); }),
      challenge: data.challenges.filter(function (it) { return candidateMatches(it, "challenge", band, none); }),
      mindset: data.mindset.filter(function (it) { return candidateMatches(it, "mindset", band, none); }),
      drill: drillCandidates(band, none),
      tip: tipCandidates(none)
    };
    Object.keys(pools).forEach(function (k) { pools[k] = seededShuffle(pools[k], rnd); });
    pools.drill = pools.drill.slice(0, DECK_DRILL_CAP);
    pools.tip = pools.tip.slice(0, DECK_TIP_CAP);
    deckCache = { key: key, list: interleave(pools, rnd) };
    return deckCache.list;
  }

  // ======================================================================= //
  //  Inline drill detail (opened from a spotlight card)                     //
  // ======================================================================= //
  function openDrillDetail(drill) {
    current = { mode: "drill", drill: drill };
    paint();
    var head = feedRoot.querySelector(".drill-detail__name");
    if (head) { head.setAttribute("tabindex", "-1"); head.focus(); }
    window.scrollTo(0, 0);
  }
  function detailView(drill) {
    var back = h("button", { type: "button", class: "btn btn-ghost feed-back" }, [
      h("span", { "aria-hidden": "true", class: "feed-back__icon", html: ui.icon(ARROW_LEFT, 18) }),
      "Back to ideas"
    ]);
    back.addEventListener("click", function () {
      current = { mode: "feed", drill: null };
      paint();
      var title = document.querySelector(".screen-title");
      if (title) title.focus();
      window.scrollTo(0, 0);
    });
    return h("div", { class: "feed-detail-wrap" }, [back, ui.drillDetail(drill)]);
  }

  // ======================================================================= //
  //  Filter chip bar + Saved view                                           //
  // ======================================================================= //
  // The composer takes a resolved { skill, vibe, saved }. A selected theme chip
  // resolves to its underlying skill/vibe here, so themes, skills and vibes are
  // three alternative lenses (picking one clears the others).
  function effectiveFilter() {
    if (filters.themeId) {
      var t = null;
      for (var i = 0; i < data.themes.length; i++) if (data.themes[i].id === filters.themeId) { t = data.themes[i]; break; }
      var f = (t && t.filter) || {};
      return { skill: f.skill || null, vibe: f.vibe || null, saved: false };
    }
    return { skill: filters.skill, vibe: filters.vibe, saved: false };
  }

  // The Saved collection: saved curated items + saved tip cards + favourited
  // drills (drills keep their existing star, per the brief).
  function savedSequence() {
    var items = [];
    data.ideas.concat(data.challenges, data.mindset).forEach(function (it) {
      if (RR.state.isSavedIdea(it.id)) items.push(it);
    });
    ((RR.coaching && RR.coaching.tips) || []).forEach(function (t) {
      if (RR.state.isSavedIdea("tipcard-" + t.id)) {
        items.push({ type: "tip", id: "tipcard-" + t.id, title: t.title, points: t.points, icon: t.icon, tipId: t.id });
      }
    });
    (RR.drills || []).forEach(function (d) {
      if (RR.state.isFavorite && RR.state.isFavorite(d.id)) items.push(d);
    });
    return items;
  }

  // PUBLIC: point the browse view at the Saved collection BEFORE navigating to
  // #ideas-browse (the deck's "See saved" uses this; the route change repaints).
  function showSaved() {
    filters.skill = null; filters.vibe = null; filters.themeId = null; filters.saved = true;
    batch = 0;
  }

  function activeFilterCount() {
    return (filters.skill ? 1 : 0) + (filters.vibe ? 1 : 0) + (filters.themeId ? 1 : 0) + (filters.saved ? 1 : 0);
  }
  function refilter() { batch = 0; paint(); window.scrollTo(0, 0); }
  function clearFilters() { filters.skill = null; filters.vibe = null; filters.themeId = null; filters.saved = false; refilter(); }
  // Skill / vibe / theme are mutually exclusive lenses; Saved is its own view.
  function selectSkill(s) { filters.skill = filters.skill === s ? null : s; filters.vibe = null; filters.themeId = null; filters.saved = false; refilter(); }
  function selectVibe(v) { filters.vibe = filters.vibe === v ? null : v; filters.skill = null; filters.themeId = null; filters.saved = false; refilter(); }
  function selectTheme(id) { filters.themeId = filters.themeId === id ? null : id; filters.skill = null; filters.vibe = null; filters.saved = false; refilter(); }
  function toggleSavedFilter() { var on = !filters.saved; filters.skill = null; filters.vibe = null; filters.themeId = null; filters.saved = on; refilter(); }

  // A toggle chip (reuses the shared .chip / .chip__dot styling from css/drills.css).
  function chip(label, on, onClick, color) {
    var kids = [];
    if (color) kids.push(h("span", { class: "chip__dot dot--" + color, "aria-hidden": "true" }));
    kids.push(h("span", { text: label }));
    var b = h("button", { type: "button", class: "chip" + (on ? " is-on" : ""), "aria-pressed": on ? "true" : "false" }, kids);
    b.addEventListener("click", function () { onClick(); });
    return b;
  }
  function chipGroup(label, chips) {
    var id = "feed-fg-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return h("div", { class: "drills-fgroup" }, [
      h("span", { class: "eyebrow", id: id, text: label }),
      h("div", { class: "chips drills-chips", role: "group", "aria-labelledby": id }, chips)
    ]);
  }
  function buildChipToggle(panel) {
    var n = activeFilterCount();
    var count = h("span", { class: "drills-filters__count", text: String(n), "aria-hidden": "true" });
    if (!n) count.hidden = true;
    var chev = h("span", { class: "drills-filters__chev" + (chipsOpen ? " is-open" : ""), "aria-hidden": "true", html: ui.icon(CHEV_DOWN, 18) });
    var btn = h("button", { type: "button", class: "drills-filters__toggle",
      "aria-expanded": chipsOpen ? "true" : "false", "aria-controls": "feed-filters" }, [
      h("span", { class: "drills-filters__toggle-icon", "aria-hidden": "true", html: ui.icon('<path d="M4 6h16M7 12h10M10 18h4"/>', 18) }),
      h("span", { class: "drills-filters__label", text: "Filter ideas" }),
      count, chev
    ]);
    btn.addEventListener("click", function () {
      chipsOpen = !chipsOpen;
      panel.hidden = !chipsOpen;
      btn.setAttribute("aria-expanded", chipsOpen ? "true" : "false");
      chev.classList.toggle("is-open", chipsOpen);
    });
    return btn;
  }
  // The chip bar: a "Filter ideas" disclosure (collapsed by default) holding skill,
  // vibe, collection (theme) and Saved chips, plus a Clear affordance.
  function buildChipBar() {
    var panel = h("div", { class: "drills-filters feed-chip-panel", id: "feed-filters" });
    panel.appendChild(chipGroup("Skill", SKILL_CHIPS.map(function (s) {
      return chip(s, filters.skill === s, function () { selectSkill(s); }, ui.skillColor(s));
    })));
    panel.appendChild(chipGroup("Vibe", VIBES.map(function (v) {
      return chip(vibeLabel(v), filters.vibe === v, function () { selectVibe(v); });
    })));
    panel.appendChild(chipGroup("Collections", data.themes.map(function (t) {
      return chip(t.title, filters.themeId === t.id, function () { selectTheme(t.id); });
    })));
    panel.appendChild(chipGroup("Show", [chip("♥ Saved", filters.saved, function () { toggleSavedFilter(); })]));
    panel.hidden = !chipsOpen;

    var wrap = h("div", { class: "feed-filters-wrap" }, [buildChipToggle(panel), panel]);
    if (activeFilterCount()) {
      var clear = h("button", { type: "button", class: "feed-clear" }, ["Clear filters"]);
      clear.addEventListener("click", clearFilters);
      wrap.appendChild(clear);
    }
    return wrap;
  }
  function emptySaved() {
    return ui.emptyState({
      title: "No saved ideas yet",
      blurb: "Tap the ♥ on any card to save it here — and star a drill to keep it too."
    });
  }

  // ======================================================================= //
  //  Paint + entry point                                                    //
  // ======================================================================= //
  function introLine() {
    return h("p", { class: "screen-sub feed-intro",
      text: "Fresh coaching ideas to pull from before practice — drill spotlights, " +
            "mini practice-flows, quick challenges and bite-size tips, tuned to your team." });
  }

  // The quiet escape hatch back to the classic, generated plan + run-mode timer
  // (js/today.js — unchanged). The feed is home base; this is always one tap away.
  function plannerLink() {
    return h("a", { class: "feed-planner-link", href: "#today" }, [
      h("span", { text: "Open the full planner & timer" }),
      h("span", { class: "feed-planner-link__arrow", "aria-hidden": "true", text: " →" })
    ]);
  }

  // The age picker — the only setup the feed needs. A labelled native select that
  // reuses the app's .age-picker + .input styling (identical to the Tips screen),
  // so it matches the rest of RallyReady exactly. The deck passes its own
  // onChange (reset position + repaint its root); with no args the browse view's
  // default behaviour is unchanged.
  function agePicker(onChange) {
    var current = resolvedAgeGroup() || "";
    var bands = (RR.team && RR.team.AGE_GROUPS) || [];
    var sel = h("select", { class: "input age-select", id: "feed-age-select",
      "aria-label": "Show coaching ideas for an age group" },
      [h("option", { value: "", text: "All ages", selected: current === "" })].concat(
        bands.map(function (b) { return h("option", { value: b, text: b, selected: b === current }); })
      ));
    sel.addEventListener("change", function () {
      setFeedAgeGroup(sel.value || null);
      if (onChange) { onChange(); return; }
      batch = 0;
      paint();
      window.scrollTo(0, 0);
    });
    return h("div", { class: "age-picker feed-age" }, [
      h("label", { class: "eyebrow", for: "feed-age-select", text: "Coaching age group" }),
      sel
    ]);
  }

  // Tie the always-on "Fresh coaching ideas" intro to the page-guide "About this
  // page" control: opening About hides the intro (the panel covers the same
  // ground), closing it brings the intro back. The page-guide lives in the
  // app-owned screen-head, so we observe its info button from here.
  function aboutInfoBtn() { return document.querySelector(".page-guide__info"); }
  function syncIntroToAbout() {
    var intro = feedRoot && feedRoot.querySelector(".feed-intro");
    if (!intro) return;
    var info = aboutInfoBtn();
    intro.hidden = !!(info && info.getAttribute("aria-expanded") === "true");
  }
  function wireAboutToggle() {
    var info = aboutInfoBtn();
    if (!info || info._feedIntroWired) return;   // wire once per app-built head
    info._feedIntroWired = true;
    // Registered AFTER page-guide's own click handler, so aria-expanded is already
    // updated when this runs.
    info.addEventListener("click", syncIntroToAbout);
  }

  function emptyFeed() {
    return ui.emptyState({
      title: "Nothing matches yet",
      blurb: "Try clearing a filter — the full feed of ideas, drills, challenges and tips is still here."
    });
  }

  function renderRange(listEl, seqList, start, end) {
    for (var i = start; i < end; i++) listEl.appendChild(renderItem(seqList[i]));
  }

  // "More ideas ↻" — reveal the next batch by APPENDING (so scroll position and
  // any expanded cards are preserved). Removes itself once the feed is exhausted.
  function moreButton(listEl, seqList) {
    var btn = h("button", { type: "button", class: "btn btn-ghost feed-more" }, [
      h("span", { class: "feed-more__icon btn__icon", "aria-hidden": "true", html: ui.icon(REFRESH, 18) }),
      h("span", { text: "More ideas" })
    ]);
    btn.addEventListener("click", function () {
      var start = (batch + 1) * PAGE;
      batch++;
      var end = Math.min((batch + 1) * PAGE, seqList.length);
      renderRange(listEl, seqList, start, end);
      if (end >= seqList.length && btn.parentNode) btn.parentNode.removeChild(btn);
    });
    return btn;
  }

  function paintFeed() {
    // Saved is its own view (all saved items, no pagination); otherwise the
    // composed, filtered, paginated feed.
    var seqList = filters.saved ? savedSequence() : fullSequence(effectiveFilter());
    if (!seqList.length) { feedRoot.appendChild(filters.saved ? emptySaved() : emptyFeed()); return; }
    var listEl = h("div", { class: "feed-list" });
    feedRoot.appendChild(listEl);
    if (filters.saved) { renderRange(listEl, seqList, 0, seqList.length); return; }
    renderRange(listEl, seqList, 0, Math.min((batch + 1) * PAGE, seqList.length));
    if ((batch + 1) * PAGE < seqList.length) feedRoot.appendChild(moreButton(listEl, seqList));
  }

  // We clear/rebuild feedRoot (our own div) — NOT #screen — so the app-rendered
  // screen-head (title + "About this page" guide) is preserved on every repaint.
  function paint() {
    if (!feedRoot) return;
    feedRoot.innerHTML = "";

    // An opened drill takes over the feed area (with a Back affordance).
    if (current.mode === "drill" && current.drill) {
      feedRoot.appendChild(detailView(current.drill));
      return;
    }

    // Browse is now the secondary view (#ideas-browse); the deck on #ideas is
    // home base, so offer the way back before anything else.
    feedRoot.appendChild(h("a", { class: "feed-planner-link feed-deck-return", href: "#ideas" }, [
      h("span", { class: "feed-planner-link__arrow", "aria-hidden": "true", text: "← " }),
      h("span", { text: "Back to today's deck" })
    ]));
    feedRoot.appendChild(introLine());
    feedRoot.appendChild(agePicker());
    feedRoot.appendChild(plannerLink());
    feedRoot.appendChild(buildChipBar());
    paintFeed();
    syncIntroToAbout();   // honor the "About this page" toggle's current state
  }

  // The full feed, now the BROWSE view on #ideas-browse — everything it always
  // was (filters, themes, Saved, "More ideas"), reached from the deck.
  function renderBrowse(host) {
    hostEl = host;
    current = { mode: "feed", drill: null };
    // In the Saved view, un-saving a card should remove it immediately.
    onSaveToggle = function (item, saved) { if (filters.saved) paint(); };
    // Our own container appended INTO #screen (below the app's screen-head),
    // so paint() can rebuild freely without wiping the title/page guide.
    feedRoot = h("div", { class: "feed-root" });
    host.appendChild(feedRoot);
    wireAboutToggle();
    paint();
  }

  // #ideas (the default route) renders the one-card-at-a-time deck. If
  // feed-deck.js ever failed to load, fall back to the browse feed rather than
  // a blank screen (the same philosophy as app.js's fallbackCard).
  function render(host) {
    if (RR.feedDeck && RR.feedDeck.render) { RR.feedDeck.render(host); return; }
    renderBrowse(host);
  }

  return {
    render: render,               // the deck (default #ideas view)
    renderBrowse: renderBrowse,   // the full feed (#ideas-browse)
    renderItem: renderItem,       // per-type card dispatcher (reused by the deck)
    deckSequence: deckSequence,   // the daily deck composition
    DECK_SIZE: DECK_SIZE,
    agePicker: agePicker,
    showSaved: showSaved,
    data: data,   // { ideas, challenges, mindset, themes } — read by the composer
    add: add      // public extension point used by js/feed-data*.js
  };
})();
