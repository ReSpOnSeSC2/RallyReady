# RallyReady — Program model (shared contract)

The Team screen (Prompt 2, `js/team.js` → `RR.team`) is the single place the coach
configures the app. It now supports **two program types**, and everything
downstream (periodization, generator, Today/Season screens, verification) must read
from this one contract so a **Season** and a **Summer camp** are handled uniformly.

## Team object (persisted via `RR.state`, key `rallyready.v1`)

```js
team = {
  name: "Northside Spikers",
  ageGroup: "11-12 (Foundations)",   // one of the five bands
  programType: "season" | "camp",

  // Season schedule (used when programType === "season")
  practiceStart: "YYYY-MM-DD",       // when practices begin
  seasonStart:   "YYYY-MM-DD",       // first game / season opener (must be > practiceStart)
  practicesPerWeek: 1..5,

  // Camp schedule (used when programType === "camp")
  campStart: "YYYY-MM-DD",           // day one of camp
  campDays: 1..30,                   // length in days
  sessionsPerDay: 1..4,

  // Shared
  sessionMinutes: 30|45|60|75|90|120,
  emphasis: ["Passing", ...]         // subset of skills; lightly weights selection
}
```

Age bands: `"8-10 (FUNdamentals)"`, `"11-12 (Foundations)"`, `"13-14 (Developing)"`,
`"15-16 (Competitive)"`, `"17-18 (Advanced)"`.

## `RR.team` API (already implemented — downstream code should consume these)

| Function | Returns |
|---|---|
| `RR.team.hasTeam()` / `isSetUp(team?)` | `true` once name + ageGroup + a **valid schedule** exist |
| `RR.team.prepWeeks(team?)` | whole prep weeks (season) — **`null` for camps** |
| `RR.team.ageRange(ageGroup)` | `{min, max}` parsed from the band, e.g. `{min:11,max:12}` |
| `RR.team.referenceFor(ageGroup)` | `{net, ball}` (prefers `RR.coaching.reference`, else fallback) |
| `RR.team.programWindow(team?)` | **the normalization key** (below), or `null` if not set up |
| `RR.team.emptyStateCard({title, blurb})` | the "set up your team first" card |

### `programWindow(team)` — treat season and camp the same

```js
// Season:
{ type:"season", startDate, endDate /* = seasonStart */, lengthDays,
  sessionsPerWeek, sessionsPerDay:null, prepWeeks, label:"8-week season" }

// Camp:
{ type:"camp",   startDate, endDate /* = campStart + (campDays-1) */, lengthDays /* = campDays */,
  sessionsPerWeek:null, sessionsPerDay, label:"5-day camp" }
```

Downstream modules should derive their dated window from `programWindow()` and branch
on `.type` only where the **shape of the plan** genuinely differs (phase arc, how a
date maps to a slot). Net height, ball, age logic, drills, session length, emphasis,
and the offline/theme rules are **identical** for both.

## How each program type periodizes (for Prompts 3, 6, 7)

**Season** (unchanged): Foundation → Development → Peak → Taper across the prep
window, then In-season maintenance after `seasonStart`. Intensity rises then dips at
the taper.

**Camp** (1–30 days): a self-contained arc keyed to the **camp day** (1..campDays),
not weeks. Recommended model (clamp for short camps):

| Camp phase | Span | Intensity | Difficulty | Focus |
|---|---|---|---|---|
| Welcome & FUNdamentals | first ~30% (≥ day 1) | 3/10 | 1–2 | orientation, ball-handling, lots of games, names/rituals |
| Build & Develop | middle ~45% | 5–6/10 | 2–3 | core skills, themed "skill of the day", small-sided games |
| Showcase & Celebrate | final ~25% (incl. last day) | 6/10, lighter volume | 2–3 | favorite games, mini-tournament, awards, high-fives |

- 1-day camp → one blended session (intro + skills + games + celebrate).
- 2–3 day camp → Welcome / Build / Showcase = one phase per day.
- If `sessionsPerDay > 1`, each day has that many distinct sessions (e.g. AM technical,
  PM games). The generator seeds on `(team, date, slot, regenCount)` so slots differ.

A camp has **no Taper/In-season**; the last day *is* the celebration. There is no
"first game" — the framing is "Day X of N".

## UI adaptation summary

- **Season tab / `renderSeason()`**: a season shows the phase timeline to first game;
  a camp shows a **Day 1…N strip** colored by camp phase, with a "Today" marker.
  Heading reads "Season plan" or "Camp plan" from `programType`.
- **Today / `renderToday()`**: a season navigates by date with phase + "Skill of the
  Week"; a camp navigates by **camp day** (and a session-slot toggle when
  `sessionsPerDay > 1`), showing camp phase + "Skill of the Day" and "Day X of N".
- Empty states, net/ball reference, equipment, and theming are shared.
