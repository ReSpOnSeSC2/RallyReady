// Verification harness (dev-only, NOT shipped in the app shell / sw cache).
// Loads the PURE engine modules into a sandboxed `window` and asserts the
// correctness invariants from the verification brief for BOTH a season team and
// a camp team. Run with: node scripts/verify.js
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

// --- Minimal browser-ish sandbox: window + a localStorage shim. ---
const store = {};
const localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }
};
// In a browser `window` IS the global object, and modules assign `window.RR`
// then read a bare `RR`. Mirror that by making the sandbox self-referential.
const sandbox = {
  localStorage, console, Math, Date, JSON,
  encodeURIComponent, parseInt, parseFloat, isNaN, Object, Array, String, Number
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

// The pure modules, in dependency order. (No DOM is touched at load time.)
const FILES = [
  "js/state.js",
  "js/drills.js", "js/drills-2.js", "js/drills-3.js", "js/drills-4.js",
  "js/drills-5.js", "js/drills-6.js", "js/drills-7.js", "js/drills-8.js", "js/drills-9.js",
  "js/coaching.js", "js/periodization.js", "js/team.js", "js/generator.js"
];
for (const f of FILES) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
}
const RR = sandbox.RR;

// --- tiny test plumbing ---
let pass = 0, fail = 0;
const fails = [];
function ok(cond, msg) { if (cond) { pass++; } else { fail++; fails.push(msg); } }
function avg(a) { return a.length ? a.reduce((p, q) => p + q, 0) / a.length : 0; }

const P = RR.periodization, G = RR.generator;

// Persist a team so RR.team.* reads it (RR.team.programWindow uses RR.state).
// Clearing savedSessions gives each team a clean History to build on.
function useTeam(team) { RR.state.update({ team, savedSessions: [] }); }

// Simulate the coach tapping "Mark complete": append the session to History in
// the same shape today.js writes, so the generator's recent-repeat avoidance
// (recentDrillIds -> savedSessions) has something to look back on. This is the
// real day-to-day flow — generate, run, mark complete, then the next day.
function markComplete(team, s) {
  const saved = (RR.state.getState().savedSessions || []).slice();
  saved.push({
    teamName: team.name, date: s.date, slot: s.slot || 0,
    drillIds: s.blocks.map((b) => b.drill.id)
  });
  RR.state.update({ savedSessions: saved });
}

// =====================================================================
// CORRECTNESS — SEASON (team A)
// =====================================================================
const teamA = {
  name: "Test Spikers A", ageGroup: "11-12 (Foundations)", programType: "season",
  practiceStart: "2026-08-03",            // 8 weeks before the opener
  seasonStart: "2026-09-28", practicesPerWeek: 3, sessionMinutes: 60, emphasis: ["Passing"]
};
useTeam(teamA);
(function seasonChecks() {
  const plan = P.computePlan(teamA);
  ok(plan && plan.type === "season", "A: season plan builds");
  const bandA = RR.team.ageRange(teamA.ageGroup);

  // PASS 1 — validation: walk EVERY calendar day from practiceStart through 2
  // weeks in-season (a superset of the real schedule). History-independent
  // properties: no empty blocks, totals, age band, difficulty window, intensity
  // arc, weekly-skill constancy. No marking needed — these hold per generation.
  const end = P.addDays(plan.seasonStart, 14);
  let iso = plan.startDate;
  const byPhase = {};
  let allBlocksFilled = true, allTotalsOk = true, ageOk = true, diffOk = true, videoOk = true;
  const weekSkill = {};            // week index -> skillFocus, to test weekly constancy
  let n = 0;

  while (iso <= end) {
    const s = G.generateSession(teamA, iso, 0, 0);
    if (!s) { allBlocksFilled = false; iso = P.addDays(iso, 1); continue; }
    const ph = P.phaseForDate(plan, iso);

    s.blocks.forEach((b) => {
      if (!b.drill || !b.drill.id) allBlocksFilled = false;
      if (!b.drill.videoSearchUrl || !/youtube\.com\/results\?search_query=/.test(b.drill.videoSearchUrl)) videoOk = false;
      // age band overlap
      if (!(b.drill.ageMin <= bandA.max && b.drill.ageMax >= bandA.min)) ageOk = false;
      // skill blocks must sit within the phase difficulty window (warm/cool exempt)
      const kind = b._req && b._req.kind;
      if (kind !== "warmup" && kind !== "cooldown") {
        if (b.drill.difficulty < ph.difficultyMin || b.drill.difficulty > ph.difficultyMax) diffOk = false;
      }
    });
    const expected = Math.max(5, Math.round(teamA.sessionMinutes * (ph.eases ? ph.volumeFactor : 1) / 5) * 5);
    if (s.totalMinutes !== expected) allTotalsOk = false;

    (byPhase[ph.key] = byPhase[ph.key] || []).push(s.intensity);

    // weekly skill constancy: key the week by 7-day bucket from practiceStart
    if (iso < plan.seasonStart) {
      const wk = Math.floor(P.daysBetween(plan.startDate, iso) / 7);
      if (weekSkill[wk] === undefined) weekSkill[wk] = s.skillFocus;
      else if (weekSkill[wk] !== s.skillFocus) weekSkill[wk] = "__VARIES__";
    }
    iso = P.addDays(iso, 1); n++;
  }

  ok(allBlocksFilled, "A: no empty blocks across the whole season");
  ok(allTotalsOk, "A: every session total == session length (taper shorter by volumeFactor)");
  ok(ageOk, "A: every selected drill overlaps the team age band");
  ok(diffOk, "A: every skill-block drill within the phase difficulty range");
  ok(videoOk, "A: every drill carries a YouTube SEARCH url");

  // Intensity arc: rises Foundation->Development->Peak, dips in Taper, maintenance in-season.
  const f = avg(byPhase.foundation), d = avg(byPhase.development), pk = avg(byPhase.peak),
    tp = avg(byPhase.taper), inS = avg(byPhase.inseason);
  ok(f < d && d < pk, `A: intensity rises F(${f.toFixed(1)})<D(${d.toFixed(1)})<P(${pk.toFixed(1)})`);
  ok(tp < pk, `A: intensity drops in taper T(${tp.toFixed(1)})<P(${pk.toFixed(1)})`);
  ok(inS >= 5 && inS <= 7, `A: in-season sits in maintenance range (${inS.toFixed(1)})`);

  // Skill of the week constant within a week, changes between weeks.
  const weeks = Object.keys(weekSkill).map(Number).sort((a, b) => a - b);
  const constant = weeks.every((w) => weekSkill[w] !== "__VARIES__");
  ok(constant, "A: skill of the week is constant within each week");
  let changes = 0;
  for (let i = 1; i < weeks.length; i++) if (weekSkill[weeks[i]] !== weekSkill[weeks[i - 1]]) changes++;
  ok(changes >= Math.floor(weeks.length / 2), `A: skill of the week changes between weeks (${changes}/${weeks.length - 1})`);

  // PASS 2 — rotation: generate the REAL practice schedule (3×/week) and mark each
  // complete as a coach would, so the generator's recent-repeat avoidance has
  // History to work from. Then assert: across ANY 4 consecutive practice sessions,
  // rotating skill blocks don't repeat a drill (the Ball-Control anchor may recur).
  // 3 practices/week => offsets 0,2,4 within each 7-day block (e.g. Mon/Wed/Fri).
  RR.state.update({ savedSessions: [] });
  const PRACTICE_OFFSETS = [0, 2, 4];     // matches practicesPerWeek = 3
  const practiceSeq = [];
  let pIso = plan.startDate;
  while (pIso <= end) {
    const off = ((P.daysBetween(plan.startDate, pIso) % 7) + 7) % 7;
    if (PRACTICE_OFFSETS.indexOf(off) !== -1) {
      const s = G.generateSession(teamA, pIso, 0, 0);
      practiceSeq.push(s);
      markComplete(teamA, s);
    }
    pIso = P.addDays(pIso, 1);
  }
  let rotationOk = true;
  for (let i = 0; i + 3 < practiceSeq.length; i++) {
    const window4 = practiceSeq.slice(i, i + 4);
    const seen = {};
    window4.forEach((s) => s.blocks.forEach((b) => {
      const kind = b._req && b._req.kind;
      if (kind === "skill") {           // rotating skill blocks
        if (b.drill.skill === "Ball Control") return;   // anchor staple may recur
        if (seen[b.drill.id]) rotationOk = false;
        seen[b.drill.id] = true;
      }
    }));
  }
  ok(rotationOk, `A: rotating skill blocks don't repeat across any 4 consecutive practice sessions (${practiceSeq.length} sessions @ 3×/week)`);

  // Reset History so the determinism/swap checks below start clean.
  RR.state.update({ savedSessions: [] });

  // Regenerate yields a different valid session; determinism holds.
  const base = G.generateSession(teamA, plan.startDate, 0, 0);
  const same = G.generateSession(teamA, plan.startDate, 0, 0);
  const regen = G.generateSession(teamA, plan.startDate, 1, 0);
  ok(JSON.stringify(base) === JSON.stringify(same), "A: deterministic for identical inputs");
  ok(JSON.stringify(base) !== JSON.stringify(regen), "A: Regenerate yields a different session");
  ok(regen.totalMinutes === base.totalMinutes && regen.blocks.length === base.blocks.length,
    "A: regenerated session is still valid (same length/shape)");

  // Swap changes only one block.
  const swapIdx = 1;
  const swapped = G.swapBlock(base, swapIdx, teamA);
  ok(swapped.blocks[swapIdx].drill.id !== base.blocks[swapIdx].drill.id, "A: Swap changes the target block");
  let othersIntact = true;
  base.blocks.forEach((b, k) => { if (k !== swapIdx && b.drill.id !== swapped.blocks[k].drill.id) othersIntact = false; });
  ok(othersIntact, "A: Swap changes ONLY one block");
  ok(swapped.blocks[swapIdx].minutes === base.blocks[swapIdx].minutes, "A: Swap preserves the block's minutes");

  console.log(`SEASON: ${n} sessions; intensities F=${f.toFixed(1)} D=${d.toFixed(1)} P=${pk.toFixed(1)} T=${tp.toFixed(1)} In=${inS.toFixed(1)}`);
})();

// =====================================================================
// CORRECTNESS — CAMP (team B)
// =====================================================================
const teamB = {
  name: "Test Camp B", ageGroup: "8-10 (FUNdamentals)", programType: "camp",
  campStart: "2026-07-06", campDays: 5, sessionsPerDay: 2, sessionMinutes: 45, emphasis: ["Setting"]
};
useTeam(teamB);
(function campChecks() {
  const plan = P.computePlan(teamB);
  ok(plan && plan.type === "camp", "B: camp plan builds");
  const bandB = RR.team.ageRange(teamB.ageGroup);

  const byPhase = {};
  const dayMeta = {};       // day -> {skill, slot0sig, slot1sig}
  const seq = [];           // flat sequence of sessions (day, slot) for rotation test
  let allBlocksFilled = true, allTotalsOk = true, ageOk = true, diffOk = true, videoOk = true,
    campPref = true, slotsDiffer = true;

  for (let d = 1; d <= teamB.campDays; d++) {
    const iso = P.addDays(plan.startDate, d - 1);
    const ph = P.phaseForDate(plan, iso);
    const sigs = [];
    let daySkill = null;
    for (let slot = 0; slot < teamB.sessionsPerDay; slot++) {
      const s = G.generateSession(teamB, iso, 0, slot);
      if (!s) { allBlocksFilled = false; continue; }
      seq.push(s);
      daySkill = s.skillFocus;
      s.blocks.forEach((b) => {
        if (!b.drill || !b.drill.id) allBlocksFilled = false;
        if (!b.drill.videoSearchUrl || !/youtube\.com\/results\?search_query=/.test(b.drill.videoSearchUrl)) videoOk = false;
        if (!(b.drill.ageMin <= bandB.max && b.drill.ageMax >= bandB.min)) ageOk = false;
        const kind = b._req && b._req.kind;
        if (kind !== "warmup" && kind !== "cooldown") {
          if (b.drill.difficulty < ph.difficultyMin || b.drill.difficulty > ph.difficultyMax) diffOk = false;
        }
        // camp blocks should PREFER campFriendly drills — assert the dominant share.
      });
      const expected = Math.max(5, Math.round(teamB.sessionMinutes * (ph.eases ? ph.volumeFactor : 1) / 5) * 5);
      if (s.totalMinutes !== expected) allTotalsOk = false;
      (byPhase[ph.key] = byPhase[ph.key] || []).push(s.intensity);
      sigs.push(JSON.stringify(s.blocks.map((b) => b.drill.id)));
      markComplete(teamB, s);   // log each slot so the next slot/day avoids repeats
    }
    if (teamB.sessionsPerDay > 1 && sigs[0] === sigs[1]) slotsDiffer = false;
    dayMeta[d] = { skill: daySkill };
  }

  // camp-friendly preference: across all camp drills (excluding warm/cool staples,
  // which are their own pool), the majority should be campFriendly.
  let campTot = 0, campFriendlyCount = 0;
  seq.forEach((s) => s.blocks.forEach((b) => {
    const kind = b._req && b._req.kind;
    if (kind === "skill" || kind === "game") { campTot++; if (b.drill.campFriendly) campFriendlyCount++; }
  }));
  campPref = campFriendlyCount / campTot >= 0.6;

  ok(allBlocksFilled, "B: no empty blocks across every camp day and slot");
  ok(allTotalsOk, "B: every session total correct (showcase lighter by volumeFactor)");
  ok(ageOk, "B: every selected drill overlaps the camp age band");
  ok(diffOk, "B: every skill-block drill within the phase difficulty range");
  ok(videoOk, "B: every drill carries a YouTube SEARCH url");
  ok(slotsDiffer, "B: the two daily slots differ");
  ok(campPref, `B: camp blocks prefer campFriendly drills (${campFriendlyCount}/${campTot})`);

  // Intensity rises Welcome->Build then eases on Showcase/last day.
  const w = avg(byPhase.welcome), bd = avg(byPhase.build), sh = avg(byPhase.showcase);
  ok(w < bd, `B: intensity rises Welcome(${w.toFixed(1)})<Build(${bd.toFixed(1)})`);
  ok(sh <= bd, `B: intensity eases on Showcase(${sh.toFixed(1)})<=Build(${bd.toFixed(1)})`);

  // skill of the day constant within a day, changes across days.
  let acrossChanges = 0;
  for (let d = 2; d <= teamB.campDays; d++) if (dayMeta[d].skill !== dayMeta[d - 1].skill) acrossChanges++;
  ok(acrossChanges >= Math.floor((teamB.campDays - 1) / 2), `B: skill of the day changes across days (${acrossChanges}/${teamB.campDays - 1})`);

  // Across any 4 consecutive sessions (day x slot order), rotating blocks don't repeat.
  let rotationOk = true;
  for (let i = 0; i + 3 < seq.length; i++) {
    const window4 = seq.slice(i, i + 4);
    const seen = {};
    window4.forEach((s) => s.blocks.forEach((b) => {
      const kind = b._req && b._req.kind;
      if (kind === "skill" || kind === "game") {
        if (b.drill.skill === "Ball Control") return;     // anchor may recur
        if (seen[b.drill.id]) rotationOk = false;
        seen[b.drill.id] = true;
      }
    }));
  }
  ok(rotationOk, "B: rotating blocks don't repeat across any 4 consecutive sessions");

  // Regenerate + Swap for the camp team too.
  const iso1 = plan.startDate;
  const base = G.generateSession(teamB, iso1, 0, 0);
  const regen = G.generateSession(teamB, iso1, 1, 0);
  ok(JSON.stringify(base) !== JSON.stringify(regen), "B: Regenerate yields a different session");
  const swapped = G.swapBlock(base, 1, teamB);
  ok(swapped.blocks[1].drill.id !== base.blocks[1].drill.id, "B: Swap changes the target block");
  let othersIntact = true;
  base.blocks.forEach((b, k) => { if (k !== 1 && b.drill.id !== swapped.blocks[k].drill.id) othersIntact = false; });
  ok(othersIntact, "B: Swap changes ONLY one block");

  console.log(`CAMP: ${seq.length} sessions; intensities W=${w.toFixed(1)} B=${bd.toFixed(1)} S=${sh.toFixed(1)}`);
})();

// =====================================================================
// Extra: short camps (1,2,3 days) and a long camp must all generate.
// =====================================================================
(function clampChecks() {
  [1, 2, 3, 7, 30].forEach((days) => {
    const t = { name: "Clamp " + days, ageGroup: "13-14 (Developing)", programType: "camp",
      campStart: "2026-07-06", campDays: days, sessionsPerDay: 1, sessionMinutes: 60, emphasis: [] };
    useTeam(t);
    const plan = P.computePlan(t);
    let okAll = !!plan;
    for (let d = 1; d <= days; d++) {
      const s = G.generateSession(t, P.addDays(plan.startDate, d - 1), 0, 0);
      if (!s || s.blocks.some((b) => !b.drill || !b.drill.id)) okAll = false;
    }
    ok(okAll, `camp clamp ${days}d: every day generates a full session`);
  });
  // short season (< 3 weeks) compresses without Peak and still generates.
  const t = { name: "Short Season", ageGroup: "15-16 (Competitive)", programType: "season",
    practiceStart: "2026-08-03", seasonStart: "2026-08-19", practicesPerWeek: 4, sessionMinutes: 90, emphasis: [] };
  useTeam(t);
  const plan = P.computePlan(t);
  let okAll = !!plan && !plan.phases.some((p) => p.key === "peak");
  let iso = plan.startDate;
  while (iso <= plan.seasonStart) {
    const s = G.generateSession(t, iso, 0, 0);
    if (!s || s.blocks.some((b) => !b.drill || !b.drill.id)) okAll = false;
    iso = P.addDays(iso, 1);
  }
  ok(okAll, "short season (<3wk) compresses (no Peak) and generates every date");
})();

// =====================================================================
// Library sanity: ids unique, every drill has a search url.
// =====================================================================
(function libraryChecks() {
  const ids = {};
  let dupe = false, allUrls = true;
  RR.drills.forEach((d) => { if (ids[d.id]) dupe = true; ids[d.id] = true;
    if (!/youtube\.com\/results\?search_query=/.test(d.videoSearchUrl || "")) allUrls = false; });
  ok(!dupe, "library: all drill ids unique");
  ok(allUrls, "library: every drill has a YouTube SEARCH url");
  console.log(`LIBRARY: ${RR.drills.length} drills loaded`);
})();

// =====================================================================
// NEW FEATURES — game schedule, focus override, set-a-specific-drill
// =====================================================================
(function featureChecks() {
  const teamC = {
    name: "Test Games C", ageGroup: "13-14 (Developing)", programType: "season",
    practiceStart: "2026-08-03", seasonStart: "2026-09-07", practicesPerWeek: 3, practiceDays: [1, 3, 5],
    games: [{ date: "2026-09-18", opponent: "Rivals" }], sessionMinutes: 75, emphasis: []
  };
  useTeam(teamC);
  const planC = P.computePlan(teamC);
  ok(planC && planC.games && planC.games.length === 2, "C: plan carries opener + scheduled game");

  const gc = P.gameContext(planC, "2026-09-17");
  ok(gc.isDayBeforeGame, "C: day before a game is detected");
  ok(gc.next && gc.next.opponent === "Rivals", "C: next-game opponent surfaced");

  // The day before a match is eased (shorter) vs a normal in-season day.
  const eve = G.generateSession(teamC, "2026-09-17", 0, 0);
  const norm = G.generateSession(teamC, "2026-09-16", 0, 0);
  ok(eve.totalMinutes < norm.totalMinutes, `C: day-before-game session eased (${eve.totalMinutes} < ${norm.totalMinutes})`);

  // Coach focus override drives the session's skill.
  const fo = G.generateSession(teamC, "2026-09-16", 0, 0, { forceSkill: "Blocking" });
  ok(fo.skillFocus === "Blocking" && fo.forcedSkill === "Blocking", "C: forceSkill overrides the focus");

  // setBlockDrill swaps one block to a chosen drill, leaving others intact.
  const baseC = G.generateSession(teamC, "2026-09-09", 0, 0);
  const chosen = RR.drills.find((d) => d.skill === "Setting" && !d.isGame);
  const sb = G.setBlockDrill(baseC, 1, chosen);
  ok(sb.blocks[1].drill.id === chosen.id, "C: setBlockDrill places the chosen drill");
  let intact = true;
  baseC.blocks.forEach((b, k) => { if (k !== 1 && b.drill.id !== sb.blocks[k].drill.id) intact = false; });
  ok(intact, "C: setBlockDrill leaves other blocks intact");

  console.log("FEATURES: game-aware easing, focus override, set-block-drill ok");
})();

console.log("\n──────────────────────────────────────────");
if (fail) {
  console.log(`RESULT: ${pass} passed, ${fail} FAILED`);
  fails.forEach((m) => console.log("  ✗ " + m));
  process.exit(1);
} else {
  console.log(`RESULT: ALL ${pass} CHECKS PASSED`);
}
