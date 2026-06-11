# RallyReady — Enhancement Prompts 11–15 (the "over the top" pack)

A review of the program as it stands, five add-ons that close its remaining gaps,
and a drop-in build prompt for each. Paste the prompts one at a time, in order,
waiting for each to finish — exactly like Prompts 3–10. Each prompt is
self-contained and repeats the shared rules so it can be run cold.

---

## Where the program stands today

RallyReady is already unusually complete for a no-build, offline PWA: a
periodized generator for seasons **and** camps, a 100+ drill library with real
content, a run-mode timer, roster/photos/skills/attendance/goals, position
coaching, a lineup builder, an ideas feed, full EN/RO i18n, dark/light themes,
and print/share sheets. The architecture is disciplined (pure-logic modules,
one state contract, files under 800 lines).

What's missing is everything **around** the practice:

1. **The game itself.** Coaches schedule games in RallyReady, the calendar
   shows "day before game" — and then the app goes silent on game day. The
   lineup builder already knows the starting six; nothing uses it live.
2. **Data safety.** Everything lives in one browser's localStorage. A cleared
   cache, a lost phone, or a new device erases a whole season of rosters,
   notes, and history. For "production ready" this is the gap.
3. **Feedback loops.** The app collects skill ratings, attendance, and
   completed sessions — and never reflects any of it back. The generator
   plans forward but never learns from what actually happened.
4. **Parents.** Youth coaching is half logistics. Coaches re-type the schedule
   into group chats every week; RallyReady already has every date.
5. **The kids.** Camps end in a Showcase, the docs promise "awards" — but
   there is nothing to hand a 9-year-old. Recognition is what makes players
   beg their parents to come back.

Prompts 11–15 below fix exactly these five, in the order a coach feels them.

---

## Prompt 11 — Game Day mode (live match companion)

```
RULES — apply on this and every step (RallyReady Standards A–F):
- Vanilla HTML/CSS/JS only; no frameworks/build/npm. PWA, fully offline, localStorage
  only, no runtime network calls. No placeholders/TODO/lorem/mock/stubs. No file over
  800 lines. Mobile-first ~390px, centered 480px. Tap targets >=48px (game-day tap
  targets >=56px — the coach is standing courtside, half-watching the ball), semantic
  HTML, visible :focus-visible.
- THEMES: semantic tokens only; verify every screen in BOTH light and dark. OKLCH for
  new colors, hover only via @media (hover:hover), honor prefers-reduced-motion.
- CONTRAST: every text/UI pair passes WCAG AA in BOTH themes.
- I18N: every new user-facing string goes through RR.i18n with natural EN and RO
  translations (use the established Romanian volleyball vocabulary: fileu, preluare,
  ridicare, atac, blocaj, rotație, serviciu).
- PROGRAM MODEL: games exist only for programType "season" (team.games[]). Camps show
  a friendly "camps don't have match days" empty state via RR.team.emptyStateCard.

Build js/gameday.js (RR.gameday — pure match-state logic, no DOM) and
js/gameday-ui.js (the screen + courtside overlay). RallyReady already knows the
team's games (team.games[]), the roster (team.roster), and the starting six
(team.lineup, zones 1-6). Game Day turns that into a live courtside companion a
volunteer parent-coach can run one-handed.

ENTRY POINTS:
- Calendar and Today already surface upcoming games; add a "Game day" button on any
  game row whose date is today or in the past-but-unlogged, and a Games section row
  on the Players tab ("Run game day").

js/gameday.js — RR.gameday, PURE functions over a match object (deterministic,
serializable, no Date.now() inside reducers — timestamps passed in):

newMatch(team, game) -> match object:
  { id, teamId, opponent, date, startingLineup (from team.lineup, editable before
    first serve), sets: [], current: { setNumber, usScore, themScore, rotation
    (1-6, our position-1 server), servingTeam, onCourt: [playerIds by zone],
    bench: [playerIds], playLog: [] }, playerMinutes: {playerId -> sets played},
    finished: false }
applyEvent(match, event) -> NEW match (immutable update). Events:
  { type: "point", us: true|false }            — score + auto-rotation: when WE win
      the serve back, rotate our six clockwise (zone 2->1->6->5->4->3->2) and update
      whose turn it is to serve. This is the #1 thing new coaches get wrong; the
      app must do it for them and show "Next server: <name>".
  { type: "sub", out: playerId, in: playerId } — swap court/bench, keep zone.
  { type: "timeout", us: true|false }
  { type: "setEnd" }                            — archive current set (rally scoring,
      25 points win-by-2 default; 15 for a deciding set; both editable in a small
      settings row), reset scores, alternate first server, increment each on-court
      player's playerMinutes.
  { type: "tally", playerId, stat }             — OPTIONAL one-tap stat counters, max
      six stats so it stays courtside-simple: ace, serveError, kill, goodPass, block,
      dig. No rally-by-rally entry, no required input — a coach who only taps the
      score buttons still gets a complete result.
  { type: "undo" }                              — every event is undoable (keep the
      event log; undo pops it and replays. The log IS the persistence format).
fairPlay(match, team) -> per-player sets-played summary with the least-played
  players flagged. Youth leagues have play-time rules and parents have eyes; make
  the "who hasn't played yet" answer one glance.
summary(match) -> { result ("W 3-1"), setScores, perPlayer tallies, leaders (most
  aces / kills / goodPasses), fairPlay }.

js/gameday-ui.js — two layers:
1) PRE-GAME sheet: confirm opponent/date, review/adjust the starting six on the
   same court diagram the Lineup screen uses (reuse RR.lineup's renderer — do not
   duplicate it), pick the bench order. One big "Start match" button.
2) LIVE overlay (same pattern as run.js's full-screen overlay): giant score
   buttons (+1 Us / +1 Them, each >=72px tall), current set + set scores strip,
   rotation diagram with the server highlighted and "Next server: <name>",
   Sub / Timeout / Undo / End set buttons, and a collapsible stat-tally tray
   (a row of player chips x the six stat buttons). Survives screen-lock and
   backgrounding exactly like run.js (re-sync from persisted event log on
   visibilitychange; persist the event log to state on EVERY event — a dead
   battery must not lose the match).
3) POST-GAME: summary card (result, set scores, leaders, fair-play table) with
   two actions: "Save to history" (append to a new state collection
   savedMatches[], capped like savedSessions, and write a dated coaching note
   onto each leader's player profile, e.g. "vs Eagles: 5 aces") and "Share"
   (route through RR.share with a parent-friendly plain-text recap).

STATE (js/state.js): add savedMatches[] and liveMatch (nullable; the in-progress
event log) to the v2 schema with a gentle migration. History screen: matches
appear inline with practices, badged "Match", tappable to reopen the summary.

The whole flow must be runnable with a thumb, outdoors, in sunlight, in under
3 taps per rally. Pure logic in gameday.js with zero DOM so it is unit-testable
by scripts/verify.js (add assertions: rotation order, win-by-2, undo symmetry).
Under 800 lines per file. Verify in BOTH themes.
```

---

## Prompt 12 — Backup, restore & coach-to-coach handoff (the data-safety net)

```
RULES — RallyReady Standards A–F (vanilla JS, no build, offline, localStorage only,
no placeholders, <800 lines/file, mobile-first, >=48px targets, semantic tokens,
WCAG AA in both themes, EN/RO i18n for every new string, honor
prefers-reduced-motion). NETWORK: still zero runtime network calls — backup is a
FILE the coach owns, never a cloud.

Build js/backup.js (RR.backup — pure serialize/merge logic) and a "Backup &
sharing" section on the Teams screen. Today one cleared browser cache erases a
coach's whole season. Fix that, and make "give my assistant coach the team" a
two-tap move.

js/backup.js — RR.backup:

exportAll() -> a single self-describing JSON file:
  { app: "rallyready", kind: "full-backup", schema: 2, exportedAt, locale,
    state: <the entire rallyready.v1 payload>, photos: <rallyready.photos.v1> }
  Serialize via a Blob + a[download]; filename "rallyready-backup-YYYY-MM-DD.json".
  Photos are already 256px JPEGs so a full backup stays small; if the JSON exceeds
  ~8MB, offer "backup without photos" instead of failing.
exportTeam(teamId) -> { kind: "team-share", schema: 2, team: <deep copy>,
  photos: <only that team's roster photos>, savedSessions/savedMatches/planned
  Sessions/focusOverrides filtered to that team, customDrills referenced by its
  planned sessions }. Filename "rallyready-team-<slug>-YYYY-MM-DD.json".
inspect(parsedJson) -> a validation report BEFORE anything is written:
  { ok, kind, schema, teamNames, counts {players, sessions, matches, photos},
    sizeWarning?, errors[] }. Reject anything that isn't a rallyready file with a
  plain-language reason. NEVER write state from an uninspected file.
importFile(parsedJson, mode) -> applies it:
  - kind "full-backup": mode "replace" (with an explicit typed-confirmation step:
    the coach types REPLACE) or mode "merge" (teams matched by id; incoming team
    ids that collide but differ get a new id and a "(imported)" suffix — never
    silently overwrite a different team that happens to share an id).
  - kind "team-share": always additive. If a team with the same id exists, ask:
    "Update my copy" (overwrite that team + its sessions) or "Keep both".
  - Photos merge into rallyready.photos.v1 respecting the existing ~5MB budget;
    if over budget, import data first and report how many photos were skipped.
  - Schema versions: accept schema <= current and run the existing v1->v2
    migration path; refuse newer schemas with "made by a newer RallyReady".
All pure except the final state write; verify.js gets round-trip assertions
(export -> inspect -> import("merge") into empty state == original).

UI — "Backup & sharing" card on the Teams screen:
- "Download full backup" button + a quiet caption showing last-backup date
  (store lastBackupAt in settings).
- "Restore from file": file input (accept .json) -> inspect() -> a review sheet
  (what's inside, what will happen) -> confirm. Restore NEVER auto-applies.
- Per-team row action "Share team with another coach" -> exportTeam, routed
  through navigator.share with the file when supported (mobile: lands straight
  in Messages/WhatsApp), download fallback otherwise.
- GENTLE NUDGE, not a nag: if the coach has >=10 saved sessions and lastBackupAt
  is null or >30 days old, show a dismissible one-line banner on Teams only
  ("It's been a while — download a backup?"). Dismissal persists 30 days.
- Receiving side: opening a shared file goes through the SAME inspect/confirm
  flow. An assistant coach with a fresh install ends up with the full team —
  roster, photos, plan edits, history — in two taps.

This feature is the difference between a demo and a tool people trust with a
season. Treat every write as precious: inspect first, confirm always, merge
conservatively, and never let an import throw the app into a broken state
(wrap the apply step; on any error, restore the pre-import snapshot and say so).
Under 800 lines per file. Verify in BOTH themes.
```

---

## Prompt 13 — Season Pulse (the insights dashboard that closes the loop)

```
RULES — RallyReady Standards A–F (vanilla JS, no build, offline, localStorage only,
no placeholders, <800 lines/file, mobile-first, >=48px targets, semantic tokens
only, WCAG AA in both themes, EN/RO i18n for every new string, OKLCH for new
colors, charts must honor prefers-reduced-motion — no gratuitous animation).
PROGRAM MODEL: works for BOTH program types; a camp gets a compact day-arc
version. All charts are inline SVG built from semantic tokens (reuse the
patterns from season.js's curve) — no chart libraries.

Build js/pulse.js (RR.pulse — pure analytics, no DOM) and a "Pulse" screen
(linked from Season and from the team header). RallyReady already RECORDS
everything — completed sessions, per-block minutes, attendance, per-player 0-5
skill ratings, goals — and reflects none of it back. Pulse is the mirror, and
it feeds one concrete signal back into the generator.

js/pulse.js — RR.pulse, pure functions over (team, savedSessions, savedMatches):

skillBalance(team, sessions, windowDays=28) ->
  minutes actually spent per skill (sum block minutes by the block's drill skill)
  vs. the curriculum's intended share for the current phase, as
  [{ skill, actualMinutes, actualPct, intendedPct, delta }]. Flag any skill
  >10 points under its intended share as "neglected".
attendancePulse(team, sessions) ->
  { teamRatePct, trend ("up"|"down"|"steady" over last 4 vs prior 4),
    perPlayer: [{ playerId, presentOf, ratePct, streak }] , atRisk: players
    whose last 3 are absences }.
playerMovement(team) ->
  for each player, the skills the coach has re-rated this season (ratings already
  persist on the roster): [{ playerId, improved: [skills], stalled: [skills rated
  <=2 with no change in 28 days] }]. No invented numbers — only what the coach
  actually entered; if ratings are sparse, say so honestly ("Rate skills on
  player profiles to see movement").
practiceRhythm(team, sessions) ->
  sessions completed vs scheduled in the program window, current completion
  streak, busiest weekday.
suggestedFocus(team, sessions) ->
  THE feedback loop: the single most-neglected skill (from skillBalance) IF its
  delta exceeds the threshold, else null. Plain-language reason attached
  ("Serving has had 12 min in 4 weeks; the plan intended ~25%").

GENERATOR HOOK (small, surgical): when RR.pulse.suggestedFocus() returns a skill
and the coach has NOT set a manual focusOverride for that date, the generator's
existing emphasis boost treats that skill as if it were in team.emphasis for
Skill Block B selection only. Today's hero area shows a quiet, dismissible chip:
"Pulse: leaning into Serving — it's been under-practiced". Dismissing it stores
a per-week mute. The coach always wins: manual focus overrides beat Pulse, and
Pulse never changes the skill-of-the-week curriculum, only the complementary
block. Document the precedence rule in docs/program-model.md.

PULSE SCREEN (renderPulse()):
- Hero: one-sentence team summary chosen by simple rules ("On track: 9 of 10
  practices run, attendance steady, passing improving.") — honest, never peppy
  filler when the data is thin.
- "Skill diet" card: horizontal stacked bar of actual minutes per skill with the
  intended share as a subtle tick per segment; neglected skills called out in a
  one-line caption with a "Plan a session around it" button (sets a
  focusOverride for the next unplanned date and jumps to Today).
- Attendance card: rate, trend arrow, and the at-risk list ("check in with…").
- Player movement card: improved list with up-chips, stalled list with a
  "Pick a goal" shortcut into that player's profile.
- Rhythm card: streak + completion. For CAMPS: replace rhythm/attendance trend
  with a Day 1..N completion strip and per-day energy (intensity actually run).
- Every card states its window ("last 4 weeks") and degrades gracefully at
  every data volume: 0 sessions -> a friendly "complete your first practice"
  empty state; 1-3 sessions -> show what exists, no trends, no fake confidence.

All math in pulse.js with zero DOM so scripts/verify.js can assert it (add
fixtures: a synthetic 6-week season's sessions -> known balances/trends).
Under 800 lines per file. Verify in BOTH themes.
```

---

## Prompt 14 — Family Hub (the parent-facing layer: calendar files & weekly recaps)

```
RULES — RallyReady Standards A–F (vanilla JS, no build, offline, localStorage only,
no runtime network calls, no placeholders, <800 lines/file, mobile-first,
>=48px targets, semantic tokens, WCAG AA both themes, EN/RO i18n — and note:
parent-facing TEXT must be generated in the app's current language, so a
Romanian coach sends Romanian recaps). PRIVACY: parent-facing output NEVER
includes other children's skill ratings, attendance records, or coach notes —
only schedule, team-level recap, and (in the per-player letter) that one
player's own positives.

Build js/family.js (RR.family — pure text/ICS builders) plus a "Family" section
on the Teams screen and share buttons where they belong. Coaches re-type the
schedule into a group chat every single week; RallyReady already knows every
date. Give them a one-tap version of the three messages every team parent gets.

js/family.js — RR.family, PURE builders (no DOM):

scheduleICS(team) -> a real RFC 5545 .ics string covering the program window:
  every scheduled practice (from practiceDays/practicesPerWeek or camp
  days x sessionsPerDay) as a VEVENT with the session length, plus every game
  in team.games[] (90 min default) titled "🏐 <Team> vs <Opponent>". Stable
  deterministic UIDs (team id + date + slot) so re-importing UPDATES instead of
  duplicating. Correct CRLF line endings, line folding at 75 octets, escaped
  text, VTIMEZONE-free floating local times (youth sports happen in local time).
  Download as "<team>-schedule.ics" AND offer navigator.share with the file —
  on phones this drops straight into the group chat, and every parent's
  calendar app opens it natively. This single feature makes coaches install
  the app; treat the ICS correctness as production code (verify.js: parse the
  output back, assert event counts, UID stability across two calls, folding).
weekAhead(team, fromDate) -> plain-text "This week" message: each upcoming
  session with day/date/time-length, skill focus from the existing curriculum
  ("Tuesday we're working on serving"), game days with opponent + a
  what-to-bring line (water, knee pads, ball type from referenceFor()).
practiceRecap(team, savedSession) -> parent-friendly text recap of a COMPLETED
  practice: what the team worked on (skill focus + block titles translated out
  of coach-speak), one "ask your player about…" line built from the session's
  game block, next session's date. NO attendance, NO names, NO ratings.
seasonLetter(team, player) -> end-of-season/end-of-camp one-pager FOR ONE
  family: their player's positions played, practices attended (their own count
  only), goals completed, and the coach's pick of that player's strongest skill
  (highest current rating) phrased warmly. Built from real data; if data is
  thin, shorter letter — never invented praise.

UI:
- Teams screen "Family" card: "Share schedule (.ics)", "This week's message"
  (preview -> edit-in-place textarea -> share/copy via the existing RR.share
  fallback pattern), and during the last 7 days of the program window a
  "Season letters" row that walks the roster one player at a time
  (preview -> share -> next).
- Today screen, after "Mark complete": a quiet "Send parents a recap" action on
  the completion toast/History row -> practiceRecap preview -> share.
- Every preview is EDITABLE before sending — the coach's voice, not the app's.
- All sharing reuses RR.share's plumbing (Web Share -> clipboard -> download);
  no new share code paths.

Under 800 lines per file. Verify in BOTH themes and BOTH languages.
```

---

## Prompt 15 — Awards & Challenges kit (make the kids beg to come back)

```
RULES — RallyReady Standards A–F (vanilla JS, no build, offline, localStorage only,
no placeholders, <800 lines/file, mobile-first, >=48px targets, semantic tokens,
WCAG AA in both themes, EN/RO i18n for every string including certificate text,
OKLCH, prefers-reduced-motion). PRINT: certificates are the one place RallyReady
goes BIG — they print on full LETTER/A4 landscape via css/print.css patterns
(extend the existing #rr-print-area approach; screen preview is a scaled card).
AGE TONE: copy adapts to the age band — playful for 8-10, earned-respect for
15+. No participation-trophy snark, no babying teenagers.

Build js/awards.js (RR.awards — data + pure builders) and js/awards-ui.js (the
screens + print templates). Camps already END in a Showcase phase that promises
"awards"; the youngest bands run on recognition. Close the loop between what the
app tracks and what a kid takes home on the fridge.

js/awards.js — RR.awards:

AWARD CATALOG (data, fully written, both languages): ~16 awards in three groups:
  - Skill awards tied to tracked skills ("Service Ace" — Serving, "Wall of the
    Net" — Blocking, "Floor General" — Setting, "Iron Libero" — Defense, …),
    each with a 1-line citation template ("for fearless serving all camp long").
  - Character awards ("Best Teammate", "Most Improved", "Coach's Award",
    "Energy Award", "Bravest Play") — these are the ones that matter at 8-10.
  - Auto-suggested awards computed from REAL data, offered, never imposed:
    perfect attendance (attendance records), "Most Improved" candidates
    (largest skill-rating gains), "Goal Getter" (most goals completed),
    plus match leaders (aces/kills/digs from savedMatches if Prompt 11 ran —
    feature-detect RR.gameday; degrade silently if absent).
suggestAwards(team, sessions, matches) -> [{ awardId, playerId, reason }] from
  the data above; every suggestion carries its plain-language evidence
  ("attended 12 of 12") so the coach can trust it or override it.
certificate(team, player, award, dateLabel) -> a render-spec object the UI
  turns into a print-perfect landscape certificate: app wordmark, team name,
  player name LARGE, award title, citation line (editable), date, a
  "Coach ____________" signature line, and a tasteful court-line border drawn
  with the existing diagram primitives (reuse js/diagram.js — no new art
  pipeline, no clip-art, no emoji on the printed page).

CHALLENGE LADDER (the practice-to-practice hook):
  ~12 measurable, age-banded personal-best challenges as data: "Serve streak"
  (consecutive in-court serves), "Pepper count" (continuous pepper touches with
  a partner), "Wall touches in 60s", "Passing target hits out of 10", etc.,
  each with { id, name, skill, ageMin, ageMax, unit, direction ("higher"),
  howToRun (2-3 coach sentences), recordPrompt }. Per-player bests persist on
  the player object as bests: { challengeId: { value, date } }.
  - Player profile gains a "Personal bests" card (current best per attempted
    challenge + new-best entry that celebrates: "New best! 7 -> 11 🏐" — screen
    only, subtle, reduced-motion-safe).
  - Run mode gains an OPTIONAL "challenge break": when a session block's skill
    matches a challenge, the block footer offers "Run the <name> challenge
    (3 min)" with the howToRun text and a quick best-entry grid for present
    players. Entirely skippable; never auto-inserted into the plan.

AWARDS SCREEN (linked from Players, and surfaced with a banner on Today during
a camp's Showcase phase / a season's final week):
  1) Pick moment ("End of camp", "End of season", "Player of the week").
  2) Suggestions list (from suggestAwards, evidence shown) + full catalog to
     assign manually; one award per player nudge for the 8-10 band ("3 players
     have nothing yet"), no such nudge for 15+.
  3) Review grid -> "Print all" (one certificate per page, both themes
     irrelevant here: print is ink-on-white, design for that) and "Share"
     per-certificate as text fallback for families who weren't there.
  Player of the week (seasons): a lightweight weekly pick stored per week,
  shown as a chip on that player's profile and roster card for the week.

Persist assignments in state as awards: [{ awardId, playerId, dateLabel,
citation, moment }] on the team. verify.js: suggestion math fixtures + ICS-style
determinism (same inputs -> same suggestions). Under 800 lines per file.
Verify print output on Letter AND A4, and the screens in BOTH themes.
```

---

## Suggested build order & why

| # | Prompt | What it buys you | Builds on |
|---|--------|-----------------|-----------|
| 1 | **12 — Backup & handoff** | Trust. Do this first: every other feature creates more data worth losing. | state.js, share.js |
| 2 | **11 — Game Day mode** | The biggest "wow" — the app stops at the gym door today. | lineup.js, run.js, history |
| 3 | **13 — Season Pulse** | Makes the data the coach already enters pay rent; generator gets smarter. | savedSessions, skills, attendance |
| 4 | **14 — Family Hub** | The .ics share alone is a reason to install; recaps make coaches look great. | team.games, curriculum, share.js |
| 5 | **15 — Awards & Challenges** | Retention. Kids who get certificates come back next season — with friends. | skills, attendance, matches, print.css |

Each one composes with the others (matches feed Pulse and Awards; Pulse feeds
the generator; everything new is covered by Backup), but every prompt also
stands alone and degrades gracefully if its neighbors were never built.
