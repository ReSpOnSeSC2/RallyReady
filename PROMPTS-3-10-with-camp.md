# RallyReady — Build Prompts 3–10 + Verification (with Season **and** Summer-camp support)

These are drop-in replacements for the original Prompts 3–10 and the Verification
prompt. They add the **program type** the coach now chooses on the Team screen:
a full **Season** *or* a **Summer camp** (1–30 day program). Paste them one at a time,
in order, waiting for each to finish — exactly as before.

Everything else (Prompts 0, 1, 2 and the "Shared Standards A–F") is unchanged. The only
new idea is that downstream screens read a single normalized contract instead of
assuming a season. That contract is documented in **`docs/program-model.md`** and is
already implemented by `RR.team`. Quick recap so each prompt is self-contained:

> **PROGRAM MODEL (shared — see `docs/program-model.md`).** `team.programType` is
> `"season"` or `"camp"`. Season uses `practiceStart`, `seasonStart`, `practicesPerWeek`;
> camp uses `campStart`, `campDays` (1–30), `sessionsPerDay` (1–4). Both share
> `ageGroup`, `sessionMinutes`, `emphasis[]`. Consume `RR.team.programWindow(team)` →
> `{type, startDate, endDate, lengthDays, sessionsPerWeek|sessionsPerDay, prepWeeks?, label}`
> and branch on `.type` only where the plan shape truly differs. Also available:
> `RR.team.hasTeam()`, `prepWeeks()` (null for camps), `ageRange(ageGroup)→{min,max}`,
> `referenceFor(ageGroup)→{net,ball}`, `emptyStateCard({title,blurb})`.

---

## Prompt 3 — Periodization engine + Season/Camp screen (the "pro" ramp & taper)

```
RULES — apply on this and every step (RallyReady Standards A–F):
- Vanilla HTML/CSS/JS only; no frameworks/build/npm. PWA, fully offline, localStorage
  only, no runtime network calls. No placeholders/TODO/lorem/mock/stubs. No file over
  800 lines. Mobile-first ~390px, centered 480px. Tap targets >=48px, semantic HTML,
  visible :focus-visible.
- THEMES: semantic tokens only so this works in BOTH light and dark. Phase colors use
  --i-easy/mid/hard/taper; any text on those segments uses navy and must pass contrast;
  the "Today" marker stays clearly visible in both themes.
- IMPECCABLE: OKLCH for new colors, tinted neutrals, no AI-slop tells, hover only via
  @media (hover:hover), honor prefers-reduced-motion, ~1.25 type steps.
- CONTRAST: every text/UI pair passes WCAG AA in BOTH themes.
- PROGRAM MODEL: build the plan from RR.team.programWindow(team) and support BOTH a
  Season and a Summer camp (see docs/program-model.md). Never assume a season.

Build js/periodization.js and the Season screen. This is the brain that makes practices
get progressively harder and then ease off — for a full season AND for a short camp.

js/periodization.js — RR.periodization, PURE functions (no DOM):

computePlan(team) -> a plan derived from RR.team.programWindow(team):
  - If window.type === "season": prepWeeks = window.prepWeeks. Divide the prep window
    into PHASES by fraction of the timeline (clamp if short; if prepWeeks < 3, compress
    to Foundation 40% / Development 40% / Taper 20% and skip Peak):
        FOUNDATION  : first 30%        | targetIntensity 3/10 | difficulty 1-2
        DEVELOPMENT : next 35% (to 65%)| targetIntensity 5/10 | difficulty 2-3
        PEAK        : next 25% (to 90%)| targetIntensity 8/10 | difficulty 3-4
        TAPER       : final 10% (min 7 days) | intensity 7/10, volume -40% | difficulty
                      2-3, no new complex material, confidence games
        IN-SEASON   : any date after seasonStart | intensity 5-7 undulating, maintenance
  - If window.type === "camp": build a DAY-INDEXED arc over days 1..campDays (no taper,
    no in-season — the last day IS the celebration). Clamp for short camps:
        WELCOME     : first ~30% (>= day 1) | intensity 3/10 | difficulty 1-2 |
                      orientation, ball-handling, games, names & rituals
        BUILD       : middle ~45%           | intensity 5-6/10 | difficulty 2-3 |
                      core skills, themed "skill of the day", small-sided games
        SHOWCASE    : final ~25% incl. last day | intensity 6/10, volume -25% |
                      difficulty 2-3 | favorite games, mini-tournament, awards
      (1-day camp -> a single blended phase; 2-3 day camp -> one phase per day.)
  - Each phase object: key, label, startDate, endDate, dayStart..dayEnd (camp) or
    weekStart..weekEnd (season), targetIntensity, difficultyMin, difficultyMax,
    volumeFactor (1.0; taper 0.6; showcase 0.75), focusSummary (one plain sentence),
    and a short coach-friendly "why".

phaseForDate(plan, date) -> the phase containing that date (season: by date; camp: by
  the camp day number, clamped to 1..campDays).
intensityForDate(plan, date) -> 1-10 using the phase target plus a small within-week
  (season) or within-camp (camp) undulation so consecutive sessions aren't identical;
  alternate Technical/Competitive/Mixed day types and nudge +/-1.
dayType(plan, team, date) -> "Technical" | "Competitive" | "Mixed", rotating.
skillFocus(plan, team, date) -> the primary skill to feature: per WEEK for a season
  ("skill of the week", constant within a week) and per DAY for a camp ("skill of the
  day"). Rotate a phase-appropriate curriculum, e.g.:
    Season Foundation:  [Passing, Serving, Ball Control, Setting]
    Season Development: [Serve Receive, Setting, Hitting Approach, Defense, Serving]
    Season Peak:        [Serve Receive Systems, Attacking, Defense/Transition, Serving Pressure, Team Play]
    Season In-season:   [Serve Receive, Attacking, Defense, Serving, Team Play]
    Camp Welcome:       [Ball Control, Passing, Serving]
    Camp Build:         [Passing, Setting, Hitting Approach, Serving, Defense]
    Camp Showcase:      [Team Play, Serving, Attacking]
  (Keep skillOfWeek as an alias of skillFocus for back-compat if helpful.)

Season/Camp screen (renderSeason()):
- SEASON: a clean horizontal TIMELINE/curve from practice start to first game showing
  the four phases as colored segments (--i-easy/mid/hard/taper), intensity rising then
  dipping at the taper. Mark "Today".
- CAMP: a Day 1…N strip (one cell per camp day, colored by camp phase) with intensity
  rising then easing on the final showcase day. Mark "Today" (the current camp day).
- Heading reads "Season plan" or "Camp plan" from team.programType; if no team, show
  RR.team.emptyStateCard.
- A card per phase: label, date/day range, one-line focus, intensity dots (1-10), and
  the coach-friendly "why". Highlight the current phase. Don't nest cards inside cards.
- The curve/strip, segment labels, and Today marker must all read clearly in BOTH
  themes (semantic tokens for axes/labels/marker; --i-* hues stay fixed).

Pure logic only in periodization.js. Under 800 lines each. Verify in BOTH themes.
```

---

## Prompt 4 — The drill library (REAL content, age-tagged; serves seasons and camps)

```
RULES — RallyReady Standards A–F. DATA-only file (no DOM, no theming), but respect the
LINKS standard: each drill's video link is a deterministic YouTube SEARCH url, never a
guessed id and never an embed.

Build js/drills.js as RR.drills: an array of REAL volleyball drills with full, accurate,
coach-usable detail. NO placeholders. Write genuine instructions and cues for every
drill. This data powers the generator for BOTH season practices and camp sessions, so
make sure there is deep coverage of warm-ups, ball-control staples, and FUN games (camps
lean games-heavy and mixed-age).

Each drill object MUST have this shape:
  {
    id: "kebab-id",
    name: "Plain English name",
    skill: one of ["Warmup","Ball Control","Passing","Setting","Serving",
                   "Hitting","Blocking","Defense","Team Play","Cooldown"],
    ageMin: 8, ageMax: 18,           // realistic range this drill suits
    difficulty: 1-5,
    minPlayers: number,
    durationMin: typical minutes,
    isStaple: true/false,            // anchor routines that should recur
    isGame: true/false,              // competitive/game-like application
    campFriendly: true/false,        // great for camps: high-energy, easy to run,
                                     //   works with mixed ages / big groups
    equipment: ["balls","net",...],
    setup: "one or two sentences",
    steps: ["step 1","step 2", ...],
    cues: ["short coaching cue", ...],
    easier: "how to simplify for younger/struggling players",
    harder: "how to progress for older/advanced players",
    videoSearchUrl: "https://www.youtube.com/results?search_query=" +
                    encodeURIComponent("how to " + name + " volleyball")
  }

Generate videoSearchUrl from the drill name with a small helper (a SEARCH url, never a
specific video id, never an embed). Set campFriendly = true for warm-ups, ball-handling,
cooperative/small-sided games, and station-style drills that suit big mixed-age groups;
ensure at least ~12 campFriendly games/staples across the library so short camps never
run dry.

INCLUDE AT LEAST THESE REAL DRILLS (write full detail for each; add more that are
genuine and correct):
  [keep the full original list: WARMUP, BALL CONTROL / PASSING, SETTING, SERVING,
   HITTING, BLOCKING, DEFENSE, TEAM PLAY / GAMES, COOLDOWN — exactly as in the original
   Prompt 4, with correct technique and realistic timing.]

If this file would exceed 800 lines, split into js/drills.js and js/drills-2.js, both
loaded in index.html in order, with RR.drills the concatenation of both. Reply with the
count of drills per skill category AND the count of campFriendly drills.
```

---

## Prompt 5 — Coaching tips + age reference data (+ running a camp)

```
RULES — RallyReady Standards A–F. REAL, correct content. Tips screen uses semantic
tokens, works in BOTH themes, keyboard-operable disclosure, :focus-visible.

Build js/coaching.js as RR.coaching with: practical guidance, an age reference table,
and camp-specific guidance. Use REAL youth-coaching best practices (aligned with USA
Volleyball's youth philosophy) and REAL equipment specs.

RR.coaching.tips = array of { title, icon, points:[...] }. Cover at minimum the original
sections: "Run a great practice", "How to talk to players", "Handle mistakes & build
confidence", "Keep order & energy", "Keep it FUN", "Safety", "Talk to parents".
ADD one more section:
  - "Running a camp": high energy and structure; theme each day; short rotations and
    stations so big/mixed-age groups always have a ball; open with names + a hook and
    close each day with a game and a high-five tunnel; build to a final-day mini-
    tournament + awards; plan for 2 sessions/day (e.g., AM technical, PM games) with
    water/shade breaks; keep instructions <30s, then play.

RR.coaching.byAge = guidance keyed by the five age bands (4-6 concrete sentences each on
attention span, what to emphasize, how to modify, tone) — as in the original Prompt 5.

RR.coaching.reference = age-band equipment facts (REAL values — these MUST match the
shape RR.team.referenceFor reads, i.e. an object keyed by the exact age-band strings,
each { net, ball }):
  - "8-10 (FUNdamentals)":  net ~6 ft (some programs 5-6 ft for the youngest);
                            lightweight/soft youth ball.
  - "11-12 (Foundations)":  net ~7 ft; lightweight ("Volley-Lite" style) official-size
                            ball (~25% lighter, ~7.0-7.7 oz).
  - "13-14 (Developing)":   net 7 ft 4 1/8 in (2.24 m); standard official ball.
  - "15-16 (Competitive)":  net 7 ft 4 1/8 in (2.24 m); official ball.
  - "17-18 (Advanced)":     net 7 ft 4 1/8 in (2.24 m); official ball.
  Add a one-line note: always confirm exact net height with your league. (Once this
  exists, RR.team.referenceFor uses it automatically and the built-in fallback is unused.)

Tips screen (renderTips()): a clean, scannable accordion/card list of RR.coaching.tips.
At the top, show byAge guidance for the CURRENT team's age band and a small reference
card (net + ball) for that band. If team.programType === "camp", surface the "Running a
camp" tips first. Don't nest cards inside cards. Under 800 lines. Verify BOTH themes.
```

---

## Prompt 6 — Session generator engine (fresh but consistent; season OR camp)

```
RULES — RallyReady Standards A–F. PURE logic (no DOM, no theming). Carry each drill's
videoSearchUrl through untouched.
PROGRAM MODEL: generate for BOTH a season and a camp via RR.team.programWindow + the
season/camp phase model from RR.periodization (see docs/program-model.md).

Build js/generator.js as RR.generator. Produce a complete, ready-to-run session for any
date (and, for camps, any session slot), balancing CONSISTENCY (anchors + skill focus)
with FRESHNESS (rotating drills, no repeats), scaling difficulty to the phase. Pure logic.

KEY BEHAVIORS:
1. Deterministic: generateSession(team, date, regenCount=0, slot=0) returns the same
   session for the same (team, date, regenCount, slot). Seed a small RNG (mulberry32)
   from a hash of team.name + ISO date + regenCount + slot. So "today" is stable,
   Regenerate (increment regenCount) differs, tomorrow differs, and — for camps with
   sessionsPerDay > 1 — each slot (0..sessionsPerDay-1) differs (e.g., AM vs PM).
   For seasons, slot is always 0.
2. Use RR.periodization for phase, target intensity, difficulty range, volume factor,
   day type, and skill focus (skill of the week for seasons; skill of the day for camps).
3. Build a block plan scaled to team.sessionMinutes, rounding each block to 5-minute
   increments so the total equals the session length:
     SEASON:
       - Warm-up & Ball Handling ~15% (STAPLE)
       - Skill Block A ~25% (the skill focus - primary)
       - Skill Block B ~20% (complementary rotating skill)
       - Competitive Game ~30% (isGame; cooperative scoring in Foundation, competitive
         in Peak/in-season)
       - Cool-down & Coach Talk ~10% (STAPLE)
       TAPER: drop Skill Block B, shorten via volumeFactor, game = fun confidence
       favorite. Always keep warm-up and cool-down.
     CAMP (games-forward, broad exposure; prefer campFriendly drills):
       - Warm-up & Ball Handling ~15% (STAPLE)
       - Skill Block (skill of the day) ~25%
       - Game/Application ~35% (isGame; cooperative in Welcome, competitive by Showcase)
       - Mini-game or Station rotation ~15% (second fun block; drop it if sessionMinutes
         <= 45 and fold the time into the game)
       - Cool-down & Coach Talk ~10% (STAPLE)
       SHOWCASE phase: make the main game a favorite / mini-tournament and keep it light.
4. Drill selection per block: filter RR.drills by
     - age within RR.team.ageRange(team.ageGroup) [ageMin..ageMax],
     - difficulty within the phase [min,max],
     - skill matching the block's role,
     - NOT used in the last N sessions (history from RR.state; N=4; for camps, count
       sessions across days AND slots),
     - for CAMP blocks, prefer campFriendly === true (boost weight; don't hard-require).
   Then weighted-random pick with the seeded RNG (lightly boost team.emphasis skills).
   If the pool is empty, relax "recently used" first, then difficulty by 1, then the
   campFriendly preference. NEVER return an empty block.
5. CONSISTENCY anchors: the warm-up staple, one ball-control anchor (Partner Passing or
   Pepper) in most non-taper/non-showcase sessions, and the cool-down recur — but rotate
   their variations so they still feel fresh.
6. Return a session object:
     { date, slot, programType, phaseLabel, dayType, skillFocus, intensity (1-10),
       totalMinutes, blocks:[ { role, title, minutes, drill (full, incl videoSearchUrl),
       why } ], coachNote (1-2 sentence phase-appropriate tip from RR.coaching),
       focusReminder }
   (Keep skillOfWeek as an alias of skillFocus on the returned object if useful.)
7. Also expose swapBlock(session, blockIndex, team) -> a new session with just that one
   block replaced by the next eligible drill (deterministic via an internal offset),
   everything else intact.

Write commented-out self-checks I can run in the console: generate a full SEASON of dates
AND a full CAMP (every day x every slot) and assert no block is ever empty, totals equal
session length (minus taper/showcase volume), and intensity rises then eases at
taper/showcase. Under 800 lines.
```

---

## Prompt 7 — Today screen (the main thing she uses) + History (season **and** camp)

```
RULES — RallyReady Standards A–F. Wired to the real generator and real state. RR.ui
helpers to stay lean. Tap targets >=48px, semantic HTML, move focus to the screen title
on navigation. THEMES both. LINKS: each block shows a "Watch how" link from
drill.videoSearchUrl (new tab, rel="noopener"; never embedded; must not break offline).
PROGRAM MODEL: the Today screen adapts to team.programType (see docs/program-model.md).

Build the Today screen (renderToday()) — what she opens before every practice — plus a
History log. Use RR.generator. Put reusable render helpers into js/ui.js (RR.ui). Wire
#today to renderToday(). If no team, show RR.team.emptyStateCard routed to #team.

TODAY SCREEN:
- Top control:
    * SEASON: a date control defaulting to today, "< Prev / Next >" + a date picker.
    * CAMP: a camp-DAY control ("Day X of N", "< Prev / Next >" clamped to 1..campDays),
      and — when team.sessionsPerDay > 1 — a session-slot toggle (e.g., "Session 1 / 2"
      or AM/PM) that re-generates for that slot.
- A hero summary card: the phase as a colored badge (season phase OR camp phase:
  Welcome/Build/Showcase), day type, the skill focus labeled "Skill of the Week"
  (season) or "Skill of the Day" (camp), intensity as filled dots out of 10, total
  practice time, and — for camps — a "Day X of N" line.
- The coachNote shown in a friendly highlighted callout.
- Each block as a clear card in order: colored role label + title + minutes; "Setup",
  "Run it" (numbered steps), "Say this" (cues), Equipment, and a "Watch how" link;
  collapsed by default to Setup + steps with a "Coaching cues" toggle (real <button>,
  keyboard-operable); a small "Swap" button on rotating blocks calling
  RR.generator.swapBlock and re-rendering just that card.
- Buttons: "Regenerate practice" (increment regenCount for that date+slot) and "Mark
  practice complete" (save to history with drills used + slot, so future sessions avoid
  recent repeats; celebratory confirmToast).
- A compact "Equipment for today" (deduped across blocks) and the correct net height +
  ball for the age band (RR.team.referenceFor).

HISTORY:
- Reachable from the Today header: reverse-chronological list of completed sessions
  showing date (or camp Day X, slot), phase, skill focus, and drills used. Tap to view
  that full session again. Allow "unmark" to remove a completion.

Everything wired to real state and the real generator. No placeholders. Under 800 lines
(use RR.ui helpers). Verify BOTH themes and a camp AND a season render with no blank state.
```

---

## Prompt 8 — Drills browser, shared UI helpers, polish (season/camp aware)

```
RULES — RallyReady Standards A–F. THEMES both; explicit light+dark test. No nested cards.
Selected chips show state WITHOUT relying on color alone and pass contrast in both themes.
LINKS standard for drill detail. PROGRAM MODEL: anything that says "season" must also work
for a camp (use programWindow / programType).

Finish the remaining screen and tighten the app.

DRILLS SCREEN (renderDrills()):
- Searchable, filterable library of RR.drills: filter chips by skill category and by
  difficulty; text search by name. Selected chips show a non-color cue (check/fill) and
  pass contrast in both themes.
- Auto-filter to the current team's age band (RR.team.ageRange) by default, with a
  "show all ages" toggle. Add an optional "camp-friendly" filter chip (drill.campFriendly)
  and default it ON when team.programType === "camp".
- Each result is a tappable card -> detail view: setup, steps, cues, equipment, age
  range, difficulty dots, easier/harder, and the "Watch how" link.

js/ui.js (RR.ui) shared, theme-aware helpers (extract duplicated markup):
  badge(label, colorVar), intensityDots(n), blockCard(block), drillCard(drill),
  sectionTitle(), emptyState(msg, btnLabel, hash), confirmToast(msg),
  programLabel(team) [returns RR.team.programWindow(team)?.label or a friendly default].
  Refactor Today/Drills/Tips/Season/Team to use these so no file exceeds 800 lines.

POLISH PASS:
  - Friendly empty states everywhere (no team, no history, no search results) — and the
    Season/Today empty/edge states must read correctly for BOTH a season and a camp.
  - Smooth active-tab states; subtle non-bounce button press (respect prefers-reduced-
    motion). The hash router never shows a blank screen on any route (incl. back/forward,
    and switching a team between season and camp).
  - Re-confirm 48px targets, labelled inputs, :focus-visible rings, WCAG AA in BOTH
    light and dark.
  - Tiny "?" help affordance on Today explaining the flow in one short sentence
    (mention it works for a season or a camp).
  - QC with `npx impeccable detect .` if available; resolve real findings. The "system
    font" and "cream background (#FFF9F4)" flags are intentional brief requirements — do
    NOT "fix" them.
Reply with every file and its line count to prove all are under 800 lines.
```

---

## Prompt 9 — App icons + install experience (unchanged behavior; keep precache in step)

```
RULES — RallyReady Standards A–F. Generate icons LOCALLY (no internet). Install button
uses semantic tokens, legible in both themes, :focus-visible, hover only via
@media (hover:hover), real dismiss, honor prefers-reduced-motion.

Make it installable with a real icon — no external services.
1. Generate PWA icons locally into icons/: icon-192.png, icon-512.png, and
   icon-512-maskable.png. Design: flat coral (#FF6B35) rounded square, simple white
   volleyball line motif + bold white "RR". Use a small LOCAL script (Node canvas, or an
   SVG you rasterize, or hand-built SVG -> PNG). If PNG isn't possible, ship crisp SVG
   icons referenced in the manifest with proper type.
2. Update manifest.webmanifest with all icon sizes and "purpose":"any maskable".
3. "Add to Home Screen" helper: listen for beforeinstallprompt; show a small, dismissable,
   design-system-styled "Install RallyReady" button on the Today screen; hide once
   installed (appinstalled / display-mode: standalone).
4. Re-confirm the service worker precaches the icons and ALL shell files — keep the
   precache list in step with the files that now exist (index.html, css/styles.css,
   js/state.js, drills.js[, drills-2.js], coaching.js, periodization.js, generator.js,
   ui.js, team.js, app.js, manifest, icons). Bump the cache version. Describe how to
   verify a full no-network load in Android Chrome DevTools (Application > Service
   Workers > Offline).
Keep files under 800 lines. Reply with confirmation and the manifest contents.
```

---

## Prompt 10 — README + how to host and install (mention both program types)

```
RULES — Plain language for a non-technical reader. Accurate to what was built. No
placeholders. Vanilla, offline PWA, no logins.

Write README.md for a non-technical user. Plain language, short steps. Include:
  - One-paragraph "what this app does" — note it builds a plan for EITHER a full season
    OR a 1–30 day summer camp.
  - "Run it on a computer to test" (open index.html or a one-line local server; service
    worker / install only work over http(s) or localhost, not file://).
  - "Put it online for free": drag-drop the rallyready folder onto Netlify Drop
    (netlify.com/drop) for a public https link in under a minute. Mention GitHub Pages.
  - "Install on an Android phone": open the link in Chrome, menu -> Add to Home screen /
    Install app.
  - "Light & dark": follows the phone setting automatically; sun/moon toggle overrides;
    choice is remembered.
  - "Using it day to day":
       open app -> Team (one-time setup; pick **Season** or **Summer camp**) -> Today ->
       run the session -> Mark complete. For a camp, Today shows "Day X of N" and, if you
       run two sessions a day, a Session 1/2 toggle; the Season tab shows your camp plan.
  - A short troubleshooting list.
Keep it friendly and skimmable.
```

---

## Verification prompt — prove it actually works (run this last)

```
RULES — Everything stays vanilla HTML/CSS/JS, PWA, fully offline, localStorage only, no
runtime network calls, no file over 800 lines, no placeholders/TODO/lorem/mock/stubs.

Do a full verification pass and FIX anything that fails. Give a PASS/FAIL checklist.

CORRECTNESS — SEASON:
1. Sample team A (ages 11-12, Season, practice start 8 weeks before first game, 3x/week,
   60 min). Generate a session for every practice date from practice start through 2
   weeks in-season. Assert: no empty blocks; total minutes == session length (taper may
   be shorter by volumeFactor); average intensity RISES Foundation->Development->Peak then
   DROPS in Taper then sits in the maintenance range in-season; skill of the week is
   constant within a week and changes between weeks; across any 4 consecutive sessions
   rotating blocks don't repeat a drill (anchors/staples may recur).
CORRECTNESS — CAMP:
1b. Sample team B (ages 8-10, Summer camp, campDays 5, sessionsPerDay 2, 45 min).
    Generate every session for every camp day AND every slot. Assert: no empty blocks;
    totals correct (showcase may be lighter by volumeFactor); average intensity RISES
    Welcome->Build then EASES on the Showcase/last day; "skill of the day" is constant
    within a day and changes across days; the two daily slots differ; across any 4
    consecutive sessions rotating blocks don't repeat (anchors may recur); camp blocks
    prefer campFriendly drills.
2. Selected drills stay within each phase's difficulty range AND within the team's age
   band (RR.team.ageRange) — for both teams.
3. Regenerate yields a different valid session; Swap changes only one block — both teams.

FUNCTION & DATA:
4. Every button on every screen does something real; state persists after reload. Switch
   the team between Season and Summer camp and confirm the Today/Season screens follow.
5. Grep the whole project for "TODO","lorem","placeholder","mock","FIXME","sample text"
   — ZERO. Remove any by implementing real content.
6. NO file exceeds 800 lines (print line counts).
7. Offline: with network off, the app still loads and generates sessions (season + camp).
8. Every drill "Watch how" link is a valid YouTube SEARCH url, new tab, rel="noopener";
   network off doesn't break loading or generation.

THEMING & DESIGN (both light and dark):
9. Theme toggle switches light/dark, persists across reload, follows OS with no saved
   choice, and there is NO flash of the wrong theme on load.
10. Re-render every screen (Today, Season/Camp plan, Drills, Tips, Team, History, empty
    states) for BOTH a season team AND a camp team, in BOTH themes; no hard-coded colors
    leak; nothing invisible.
11. Contrast: every text/UI pair passes WCAG AA in BOTH themes (4.5 body, 3.0 large/
    UI/icons/focus). Spot-check the intensity colors carry navy text and the season
    curve / camp-day strip labels + Today marker are legible in both. Compute and report
    ratios.
12. Run `npx impeccable detect .` if available; resolve real findings. Only acceptable
    remaining flags: the system font stack and the cream background (#FFF9F4) — do NOT
    "fix" those.

ACCESSIBILITY/UX:
13. Inputs labelled; :focus-visible visible; hover only on hover-capable devices;
    prefers-reduced-motion honored; tap targets >= 48px; no blank screens on any route
    for either program type.

Report the checklist, fix every FAIL, and re-run until all PASS.
```

---

### What changed vs. the original pack (summary)

- **New shared contract** (`docs/program-model.md`, implemented by `RR.team`): the team
  carries `programType` plus camp fields; `programWindow()` normalizes season vs camp.
- **Prompt 3**: periodization + Season screen now build a **camp day-arc**
  (Welcome → Build → Showcase) alongside the season phases, and the screen renders a
  **Day 1…N camp strip** when `programType === "camp"`.
- **Prompt 4**: drills gain a `campFriendly` flag; ensure deep game/staple coverage.
- **Prompt 5**: adds a "Running a camp" tips section; `reference` keyed to the exact age
  bands so `RR.team.referenceFor` consumes it.
- **Prompt 6**: generator seeds on a **session slot** and has a games-forward **camp
  block plan**; prefers `campFriendly` drills; "skill of the day" for camps.
- **Prompt 7**: Today navigates by **camp day** + **session slot**; hero shows camp phase
  and "Day X of N".
- **Prompt 8**: Drills browser gains a camp-friendly filter; `RR.ui.programLabel`; polish
  checks both program types.
- **Prompts 9–10 & Verification**: precache list, README, and tests all cover camp.
