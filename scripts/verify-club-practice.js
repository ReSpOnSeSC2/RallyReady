// Dev-only checks. Run with: node scripts/verify-club-practice.js
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const STORAGE_KEY = "rallyready.v1";

function loadApp(storage) {
  const context = vm.createContext({ console, localStorage: storage });
  context.window = context;
  for (const name of ["state.js", "club-practice-themes-1.js", "club-practice-themes-2.js", "club-practice.js"]) {
    const source = fs.readFileSync(path.join(ROOT, "js", name), "utf8");
    vm.runInContext(source, context, { filename: name });
  }
  return context.RR;
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function checkTextFields(value, keys, label) {
  for (const key of keys) {
    assert.ok(hasText(value[key]), `${label} includes ${key}`);
  }
}

function checkTextList(list, minimum, label) {
  assert.ok(Array.isArray(list) && list.length >= minimum, `${label} has at least ${minimum} entries`);
  assert.ok(list.every(hasText), `${label} entries are readable text`);
}

function checkPlan(plan, age, minutes, label) {
  assert.ok(plan, `${label} generates a plan`);
  assert.equal(plan.ageGroup, age, `${label} uses the requested age`);
  assert.equal(plan.totalMinutes, minutes, `${label} uses the exact available time`);
  assert.equal(plan.kind, "club-practice", `${label} is recognized by native Run and Print actions`);
  checkTextFields(plan, ["id", "themeKey", "title", "skillFocus", "phaseLabel", "dayType", "coachNote", "focusReminder", "setup"], label);
  checkTextList(plan.equipment, 1, `${label} equipment checklist`);
  assert.ok(plan.objectives.length >= 2, `${label} offers a way to measure the session`);
  for (const objective of plan.objectives) {
    checkTextFields(objective, ["label", "target"], `${label} objective`);
  }
  assert.ok(plan.adaptations.length >= 2, `${label} offers gym and attendance adaptations`);
  for (const adaptation of plan.adaptations) {
    checkTextFields(adaptation, ["label", "description"], `${label} adaptation`);
  }
  assert.ok(plan.blocks.length >= 4, `${label} has a complete practice sequence`);
  assert.match(plan.blocks[0].role, /warm|activ/i, `${label} opens with a warm-up`);
  assert.match(plan.blocks.at(-1).role, /cool|close|recover|reflect/i, `${label} ends with a closing block`);
  assert.ok(plan.blocks.some((block) => /water|break/i.test(block.role)), `${label} includes a hydration break`);
  assert.ok(plan.blocks.some((block) => /compete|competition|game|scrim|play/i.test(block.role)), `${label} includes game play`);
  const ids = new Set();
  let elapsed = 0;
  for (const block of plan.blocks) {
    const blockLabel = `${label} ${block.title}`;
    checkTextFields(block, ["id", "blockKey", "role", "title", "why"], blockLabel);
    assert.ok(!ids.has(block.id), `${blockLabel} has a unique block ID`);
    ids.add(block.id);
    assert.ok(Number.isInteger(block.minutes) && block.minutes >= 1, `${blockLabel} is a valid timer block`);
    assert.equal(block.startMinute, elapsed, `${blockLabel} starts after the previous block`);
    elapsed += block.minutes;
    assert.equal(block.endMinute, elapsed, `${blockLabel} includes its time in the running total`);
    assert.ok(block.drill, `${blockLabel} provides the drill used by RallyReady Run mode`);
    checkTextFields(block.drill, ["id", "name", "skill", "setup"], `${blockLabel} drill`);
    if (!/water|break|cool|close|recover|reflect/i.test(block.role)) {
      checkTextFields(block.drill, ["scoring", "easier", "harder"], `${blockLabel} drill`);
    }
    checkTextList(block.drill.steps, 2, `${blockLabel} execution steps`);
    checkTextList(block.drill.cues, 1, `${blockLabel} coach cues`);
    checkTextList(block.drill.equipment, 0, `${blockLabel} equipment`);
    assert.ok(Array.isArray(block.drill.coaching) && block.drill.coaching.length, `${blockLabel} detailed guide`);
    block.drill.coaching.forEach((note) => checkTextFields(note, ["label", "text"], `${blockLabel} note`));
  }
  assert.equal(elapsed, minutes, `${label} has no gaps or minutes outside the budget`);
}

const records = new Map();
let rejectWrites = false;
const storage = {
  getItem(key) { return records.get(key) ?? null; },
  setItem(key, value) {
    if (rejectWrites) throw new Error("Quota exceeded");
    records.set(key, value);
  }
};

const { clubPractice, state } = loadApp(storage);
const { ageGroups, minMinutes, maxMinutes, variantCount, generate, localize } = clubPractice;
assert.deepEqual(plain(ageGroups), ["13U", "14U", "15U", "16U"]);
assert.equal(minMinutes, 30);
assert.equal(maxMinutes, 180);
assert.ok(Number.isInteger(variantCount) && variantCount >= 6, "at least six practice themes");

const planIds = new Set();
for (const age of ageGroups) {
  for (let minutes = minMinutes; minutes <= maxMinutes; minutes++) {
    const themes = new Set();
    const drillSequences = new Set();
    for (let variant = 0; variant < variantCount; variant++) {
      const plan = generate(age, minutes, variant);
      checkPlan(plan, age, minutes, `${age} / ${minutes} min / theme ${variant + 1}`);
      const romanian = generate(age, minutes, variant, "ro");
      checkPlan(romanian, age, minutes, `${age} / ${minutes} min / theme ${variant + 1} / RO`);
      assert.equal(plan.language, "en");
      assert.equal(romanian.language, "ro");
      assert.equal(romanian.id, plan.id, "language switches preserve the saved plan ID");
      assert.notEqual(romanian.title, plan.title);
      assert.notEqual(romanian.setup, plan.setup);
      assert.deepEqual(plain(romanian.objectives.map((item) => item.target.split(" · ")[0])),
        plain(plan.objectives.map((item) => item.target.split(" · ")[0])), "scoring targets match across languages");
      for (const [index, block] of plan.blocks.entries()) {
        const translation = romanian.blocks[index];
        assert.equal(translation.blockKey, block.blockKey);
        assert.equal(translation.minutes, block.minutes);
        assert.notEqual(translation.drill.setup, block.drill.setup);
        assert.equal(translation.drill.steps.length, block.drill.steps.length);
        assert.ok(translation.drill.steps.every((step, stepIndex) => step !== block.drill.steps[stepIndex]));
        assert.equal(translation.drill.coaching.length, block.drill.coaching.length);
        assert.ok(translation.drill.coaching.every((note, noteIndex) => note.text !== block.drill.coaching[noteIndex].text));
      }
      assert.ok(!planIds.has(plan.id), `distinct shelf key for ${age} / ${minutes} min / theme ${variant + 1}`);
      planIds.add(plan.id);
      themes.add(plan.skillFocus);
      drillSequences.add(plan.blocks.map((block) => block.drill.name).join("|"));
    }
    assert.equal(themes.size, variantCount, `${age} / ${minutes} min offers distinct training focuses`);
    assert.equal(drillSequences.size, variantCount, `${age} / ${minutes} min varies the drill sequence`);
  }
}

const designsByTheme = new Map();
for (const age of ageGroups) {
  for (let variant = 0; variant < variantCount; variant++) {
    const plan = generate(age, 90, variant);
    if (!designsByTheme.has(plan.skillFocus)) designsByTheme.set(plan.skillFocus, new Set());
    designsByTheme.get(plan.skillFocus).add(JSON.stringify({
      objectives: plan.objectives,
      drills: plan.blocks.map(({ drill }) => [drill.steps, drill.scoring])
    }));
  }
}
for (const [focus, designs] of designsByTheme) {
  assert.equal(designs.size, ageGroups.length, `${focus} changes coaching content across ages`);
}

const first = generate("13U", 67, 0);
const second = generate("16U", 120, 2);
assert.deepEqual(ageGroups.map((age) => generate(age, 90, 0).themeKey).join(","),
  "first-contact,side-out,attack-choice,transition", "each age keeps its starter focus");
assert.deepEqual(plain(first), plain(generate("13U", 67, 0)), "the same inputs reproduce the plan and shelf key");
const oldSnapshot = plain(first);
delete oldSnapshot.language;
delete oldSnapshot.themeKey;
oldSnapshot.title = "Win the First Contact";
assert.deepEqual(plain(localize(oldSnapshot, "ro")), plain(generate("13U", 67, 0, "ro")),
  "plans saved before the rewrite get the translated instructions and diagrams");
assert.deepEqual(plain(localize(localize(first, "ro"), "en")), plain(first), "language toggles in both directions");
for (const badAge of ["12U", "17U", "", null]) {
  assert.equal(generate(badAge, 60, 0), null, `unsupported age ${badAge} is rejected`);
}
for (const badMinutes of [0, minMinutes - 1, maxMinutes + 1, 60.5, NaN, Infinity, null]) {
  assert.equal(generate("13U", badMinutes, 0), null, `invalid duration ${badMinutes} is rejected`);
}
console.log(`Club Practice generation passed for ${planIds.size} age, time and theme combinations in both languages.`);

assert.deepEqual(plain(state.getClubPractices()), [], "a new coach has an empty shelf");
assert.equal(state.saveClubPractice(first), true, "saving works without team setup");
assert.equal(state.isClubPracticeSaved(first.id), true, "saved status reflects the plan ID");
state.saveClubPractice(first);
assert.equal(state.getClubPractices().length, 1, "saving the same plan never duplicates it");
assert.equal(state.saveClubPractice(second), true, "a different plan can be saved independently");

let reloaded = loadApp(storage).state;
assert.equal(reloaded.isClubPracticeSaved(first.id), true, "saved plans survive reloading the app");
const shelf = reloaded.getClubPractices();
const restoredFirst = shelf.find((plan) => plan.id === first.id);
assert.deepEqual(plain(restoredFirst.blocks), plain(first.blocks), "stored plan retains its detailed run instructions");
restoredFirst.blocks[0].drill.steps[0] = "Changed by the caller";
assert.deepEqual(plain(reloaded.getClubPractices().find((plan) => plan.id === first.id).blocks), plain(first.blocks), "reading the shelf does not mutate state");

const backup = reloaded.exportData();
assert.equal(reloaded.removeClubPractice(first.id), true, "a saved plan can be removed");
assert.equal(reloaded.isClubPracticeSaved(first.id), false, "removed plan disappears from the shelf");
assert.equal(loadApp(storage).state.isClubPracticeSaved(first.id), false, "removal persists across reloads");
assert.equal(reloaded.importData(backup).ok, true, "a native backup can be restored");
assert.equal(reloaded.isClubPracticeSaved(first.id), true, "backup retains the complete saved shelf");

const invalidPlan = plain(first);
delete invalidPlan.objectives;
assert.equal(reloaded.saveClubPractice(invalidPlan), false, "incomplete plans cannot enter the shelf");
const mixedBackup = JSON.parse(backup);
mixedBackup.data.clubPractices.push(invalidPlan, plain(first));
assert.equal(reloaded.importData(mixedBackup).ok, true, "a backup with one bad record can still restore");
assert.equal(reloaded.getClubPractices().length, 2, "restore rejects invalid records and duplicates");

const priorStorage = records.get(STORAGE_KEY);
const third = generate("15U", 83, 1);
rejectWrites = true;
assert.equal(reloaded.saveClubPractice(third), false, "storage failure is reported to the planner");
assert.equal(reloaded.isClubPracticeSaved(third.id), false, "a failed save does not update the shelf");
assert.equal(reloaded.removeClubPractice(first.id), false, "failed removal is reported to the planner");
assert.equal(reloaded.isClubPracticeSaved(first.id), true, "a failed removal keeps the original plan");
assert.equal(records.get(STORAGE_KEY), priorStorage, "failed edits leave persisted data intact");
rejectWrites = false;

const legacy = { schemaVersion: 1, team: { name: "Original Team" }, savedSessions: [{ teamName: "Original Team", date: "2026-11-01" }] };
assert.equal(reloaded.importData(JSON.stringify(legacy)).ok, true, "backups from before Club Practice still load");
reloaded = loadApp(storage).state;
assert.deepEqual(plain(reloaded.getClubPractices()), [], "legacy backups gain an empty practice shelf");
assert.equal(reloaded.getState().team.name, legacy.team.name, "legacy team migration still runs");
assert.deepEqual(plain(reloaded.getState().savedSessions), legacy.savedSessions, "legacy History records are kept");
console.log("Club Practice persistence, backup restore, failed writes and legacy migration passed.");
