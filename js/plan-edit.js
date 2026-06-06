// plan-edit.js — make a generated practice the coach's own (RR.planEdit).
//
// The generator produces a great first draft; real coaches tweak it. This module
// holds the PURE transforms that turn one session into an edited copy — retime a
// block, pin a drill, add / remove / reorder blocks, or drop a specific drill
// into a block — plus the small edit-mode UI the Today screen composes. It never
// persists anything itself: Today saves the returned session as a "planned"
// snapshot so edits survive reloads.
window.RR = window.RR || {};

RR.planEdit = (function () {
  "use strict";

  var h = RR.ui.h;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function sum(blocks) { return blocks.reduce(function (a, b) { return a + (b.minutes || 0); }, 0); }
  function retotal(s) { s.totalMinutes = sum(s.blocks); return s; }

  // ---- PURE TRANSFORMS (return a NEW session) -------------------------------

  // Nudge one block's minutes by ±5 (floor 5); the session total follows.
  function retime(session, index, delta) {
    var s = clone(session);
    var b = s.blocks[index];
    if (!b) return session;
    b.minutes = Math.max(5, (b.minutes || 5) + delta);
    return retotal(s);
  }

  // Pin / unpin a block so Regenerate keeps its drill (Today re-applies pins).
  function togglePin(session, index) {
    var s = clone(session);
    var b = s.blocks[index];
    if (b) b._pinned = !b._pinned;
    return s;
  }

  function removeBlock(session, index) {
    var s = clone(session);
    if (s.blocks.length <= 1) return session;   // keep at least one block
    s.blocks.splice(index, 1);
    return retotal(s);
  }

  function moveBlock(session, index, dir) {
    var s = clone(session);
    var to = index + dir;
    if (to < 0 || to >= s.blocks.length) return session;
    var tmp = s.blocks[index];
    s.blocks[index] = s.blocks[to];
    s.blocks[to] = tmp;
    return s;
  }

  // Age + (already-used) aware candidate pool for a given role, so an added block
  // or a picker offers sensible, non-duplicate drills.
  function poolFor(team, kind, skill, usedIds) {
    var band = RR.team.ageRange(team.ageGroup);
    return (RR.drills || []).filter(function (d) {
      if (usedIds && usedIds[d.id]) return false;
      if (!(d.ageMin <= band.max && d.ageMax >= band.min)) return false;
      if (kind === "warmup") return d.skill === "Warmup";
      if (kind === "cooldown") return d.skill === "Cooldown";
      if (kind === "game") return !!d.isGame;
      if (skill) return d.skill === skill;
      return d.skill !== "Warmup" && d.skill !== "Cooldown" && !d.isGame;
    });
  }

  function usedMap(session) {
    var m = {};
    session.blocks.forEach(function (b) { if (b.drill) m[b.drill.id] = true; });
    return m;
  }

  // Add a new block of `kind` (warmup|skill|game|cooldown) with an optional skill.
  function addBlock(session, kind, skill) {
    var s = clone(session);
    var team = (RR.state.getState().team) || {};
    var pool = poolFor(team, kind, skill, usedMap(s));
    if (!pool.length) pool = poolFor(team, kind, skill, null);   // allow a repeat rather than fail
    if (!pool.length) return session;
    var drill = pool[0];
    var labels = { warmup: "Warm-up", skill: "Skill Block", game: "Game", cooldown: "Cool-down" };
    var block = {
      role: (labels[kind] || "Block") + (skill ? " — " + skill : ""),
      title: drill.name, minutes: kind === "warmup" || kind === "cooldown" ? 10 : 15,
      drill: clone(drill), why: "Added by you.",
      _pool: pool.map(function (d) { return d.id; }), _offset: 0,
      _req: { kind: kind, skill: skill || drill.skill }, _pinned: false
    };
    // Cool-downs sit last; warm-ups first; everything else before the cool-down.
    if (kind === "cooldown") s.blocks.push(block);
    else if (kind === "warmup") s.blocks.unshift(block);
    else {
      var lastIsCool = s.blocks.length && s.blocks[s.blocks.length - 1]._req &&
        s.blocks[s.blocks.length - 1]._req.kind === "cooldown";
      s.blocks.splice(lastIsCool ? s.blocks.length - 1 : s.blocks.length, 0, block);
    }
    return retotal(s);
  }

  // ---- DRILL PICKER (choose a specific drill into a block) ------------------
  // A lightweight modal listing drills that fit the block's role; onPick(drill).
  function openPicker(opts) {
    opts = opts || {};
    var team = (RR.state.getState().team) || {};
    var pool = poolFor(team, opts.kind, opts.skill, null);

    var listHost = h("div", { class: "pick__list" });
    function paintList(q) {
      listHost.innerHTML = "";
      var ql = (q || "").trim().toLowerCase();
      var items = pool.filter(function (d) { return !ql || d.name.toLowerCase().indexOf(ql) !== -1; });
      if (!items.length) {
        listHost.appendChild(h("p", { class: "muted pick__empty", text: "No matching drills." }));
        return;
      }
      items.slice(0, 60).forEach(function (d) {
        var row = h("button", { type: "button", class: "row pick__row" }, [
          h("span", { class: "pick__name", text: d.name }),
          h("span", { class: "pick__meta muted", text: RR.ui.difficultyWord(d.difficulty) + " · " + (d.durationMin || 10) + " min" })
        ]);
        row.addEventListener("click", function () { close(); if (opts.onPick) opts.onPick(d); });
        listHost.appendChild(row);
      });
    }

    var search = h("input", { class: "input", type: "search", placeholder: "Search drills…", "aria-label": "Search drills" });
    search.addEventListener("input", function () { paintList(search.value); });

    var closeBtn = h("button", { type: "button", class: "pick__close", "aria-label": "Close" },
      [h("span", { "aria-hidden": "true", html: RR.ui.icon('<path d="M6 6l12 12M18 6L6 18"/>', 22) })]);
    var sheet = h("div", { class: "pick__sheet", role: "dialog", "aria-modal": "true", "aria-label": "Choose a drill" }, [
      h("div", { class: "pick__head" }, [h("h3", { text: "Choose a drill" }), closeBtn]),
      search, listHost
    ]);
    var overlay = h("div", { class: "pick__overlay" }, [sheet]);

    function close() {
      document.removeEventListener("keydown", onKey);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.addEventListener("keydown", onKey);

    document.body.appendChild(overlay);
    paintList("");
    search.focus();
  }

  // ---- EDIT-MODE BLOCK UI ---------------------------------------------------
  // editableBlock(session, index, api) -> a card with retime, pin, swap, choose,
  // move and remove controls. api = { update(newSession) }. The owner (Today)
  // persists api.update's result and re-renders.
  function editableBlock(session, index, api) {
    var block = session.blocks[index];
    var kd = RR.ui.kindOf(block);

    function tool(label, svg, fn, extraClass) {
      var b = h("button", { type: "button", class: "pe-tool" + (extraClass ? " " + extraClass : ""), "aria-label": label }, [
        h("span", { "aria-hidden": "true", html: RR.ui.icon(svg, 18) })
      ]);
      b.addEventListener("click", fn);
      return b;
    }

    var minus = tool("Subtract 5 minutes", '<path d="M5 12h14"/>', function () { api.update(retime(session, index, -5)); });
    var plus = tool("Add 5 minutes", '<path d="M12 5v14M5 12h14"/>', function () { api.update(retime(session, index, 5)); });

    var pinBtn = tool(block._pinned ? "Unpin drill" : "Pin drill (kept on Regenerate)",
      '<path d="M12 17v5"/><path d="M9 3h6l-1 7 3 3H7l3-3z"/>',
      function () { api.update(togglePin(session, index)); }, block._pinned ? "is-on" : "");

    var swapBtn = tool("Swap for the next option",
      '<path d="M3 7h13l-3-3"/><path d="M21 17H8l3 3"/>',
      function () { api.update(RR.generator.swapBlock(session, index)); });

    var pickBtn = tool("Choose a specific drill",
      '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
      function () {
        openPicker({
          kind: block._req && block._req.kind, skill: block._req && block._req.skill,
          onPick: function (d) { api.update(RR.generator.setBlockDrill(session, index, d)); }
        });
      });

    var up = tool("Move up", '<path d="M12 19V5"/><path d="M6 11l6-6 6 6"/>', function () { api.update(moveBlock(session, index, -1)); });
    var down = tool("Move down", '<path d="M12 5v14"/><path d="M6 13l6 6 6-6"/>', function () { api.update(moveBlock(session, index, 1)); });
    var del = tool("Remove block", '<path d="M4 7h16"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M7 7l1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12"/>',
      function () { api.update(removeBlock(session, index)); }, "pe-tool--danger");

    return h("article", { class: "card pe-block" }, [
      h("header", { class: "pe-block__head" }, [
        RR.ui.badge(kd.label, kd.color),
        h("div", { class: "pe-block__time" }, [minus, h("span", { class: "pe-block__min", text: block.minutes + " min" }), plus])
      ]),
      h("h3", { class: "pe-block__title", text: block.title }),
      h("p", { class: "pe-block__role muted", text: block.role }),
      h("div", { class: "pe-block__tools" }, [swapBtn, pickBtn, pinBtn, up, down, del])
    ]);
  }

  return {
    retime: retime, togglePin: togglePin, removeBlock: removeBlock,
    moveBlock: moveBlock, addBlock: addBlock,
    openPicker: openPicker, editableBlock: editableBlock
  };
})();
