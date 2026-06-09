# RallyReady — AI Build Prompts: rebuild "Practice" as a Coaching **Ideas Feed**

A ready-to-run **prompt book** for rebuilding the Practice section. Hand these
prompts to a coding agent (Claude Code, etc.) **one at a time, in order**. Each
prompt is self-contained, names the real files and APIs, and ends with
acceptance criteria so you can confirm it landed before moving on.

## Why we're rebuilding it

The current Practice screen (`js/today.js`, the **Today** tab) auto-*generates* a
plan and is built around running practice live off a phone with a countdown
timer (`js/run.js`). The target coach avoids it. She loves **Drills** and **Tips**
because they're *content libraries she pulls from* — browse, learn, get ideas,
no setup, no data entry, no phone-in-hand.

**The redesign:** turn Practice into the thing she already loves — a **scrollable
feed of coaching inspiration** she pulls from before practice: mini practice
ideas, drill spotlights, bite-size tips, fun challenges, mindset nuggets, and
themed collections. Pull, not push. The natural trio becomes **Drills = the
moves · Tips = the wisdom · Ideas = inspiration that puts them together.**

---

## Prompt 0 — Shared context & guardrails (prepend to every prompt)

> You are working in **RallyReady**, a dependency-free vanilla-JS PWA (no build
> step, no framework). Every module is an IIFE that attaches to the single global
> `window.RR`. Scripts load in dependency order from `index.html`; the service
> worker `sw.js` precaches the app shell.
>
> **House style (match it exactly):**
> - Build DOM with the hyperscript helper `RR.ui.h(tag, props, kids)` (and
>   `RR.ui.icon`, `badge`, `dots`, `sectionTitle`, `drillCard`, `drillDetail`,
>   `emptyState`). No JSX, no templating, no innerHTML for content.
> - **CSS uses only the semantic tokens** in `css/styles.css` (`--bg`, `--surface`,
>   `--text`, `--text-muted`, `--primary`, `--primary-tint`, `--focus`, `--line`,
>   spacing `--sp-*`, radii, `--tap-min`). Must read correctly in **light and dark**.
> - **No nested cards.** Real `<button>`s for interactive controls (keyboard +
>   `:focus-visible` for free). Respect `prefers-reduced-motion`. Tap targets ≥ 48px.
> - Keep **every file under ~800 lines**; split data across numbered files like
>   `drills-2..11.js` / `coaching-tips-2..3.js` do.
> - State lives in `RR.state` (`getState()` returns a clone; `update(patch)` merges +
>   persists to `localStorage` + notifies `subscribe` listeners).
>
> **Guardrails — do NOT break these:**
> - **Do not modify `js/run.js`** (the timer) or the generation logic in
>   `js/generator.js`. They stay as-is.
> - **Keep the existing planner reachable.** Leave `js/today.js` and the `#today`
>   route working untouched; the feed links to it as a quiet "full planner" option.
> - Additive only: other screens (Drills, Tips, Season, Players, History, Calendar)
>   must keep working exactly as before.
> - After each prompt: `node --check` any changed JS, and (where practical) load the
>   module(s) in a tiny `globalThis.window` sandbox to confirm no load-time errors.
>
> **Reference data shapes you'll use:**
> - A **drill** (`RR.drills[i]`): `{ id, name, skill, ageMin, ageMax, difficulty,
>   durationMin, isGame, campFriendly, equipment[], setup, steps[], cues[], easier,
>   harder, videoSearchUrl }`. Skills: `Warmup, Ball Control, Passing, Setting,
>   Serving, Hitting, Blocking, Defense, Team Play, Cooldown`.
> - A **tip** (`RR.coaching.tips[i]`): `{ id, title, icon, category, points[] }`;
>   look one up with `RR.coaching.tipById(id)`.
> - **Team**: `RR.state.getState().team` (may be null); `RR.team.ageRange(ageGroup)
>   → {min,max}`, `RR.team.AGE_GROUPS`, `RR.team.isSetUp(team)`.
> - **Share/print** (already null-tolerant): `RR.share.session(session, team)`,
>   `RR.share.printSession(session, team)`. A "session" is `{ date?, skillFocus?,
>   totalMinutes?, blocks:[{ role, title, minutes, drill }] }`.

---

## Prompt 1 — Stand up the `Ideas` tab and an empty feed screen

> **Goal:** add a new route/tab `#ideas` rendered by a new `RR.feed` module, and
> make it the app's default landing screen. Leave the classic planner on `#today`.
>
> 1. Create **`js/feed.js`** → `RR.feed` with `render(host)` that, for now, appends
>    a `screen-sub` intro line and an `RR.ui.emptyState`-style placeholder
>    ("Your coaching ideas will appear here"). Export `{ render }`.
> 2. **`index.html`**: load `js/feed.js` after `js/ui.js` and the data/feature
>    modules but before `js/app.js`. Change the **first tab bar `<a>`** from
>    `href="#today"` to `href="#ideas"`, label `Today` → `Ideas`, and give it a
>    fresh lightbulb/sparkle SVG icon (24×24, stroke, matching the others).
> 3. **`js/app.js`**: add `ideas: { title: "Ideas", blurb: "Fresh practice ideas,
>    drills, challenges and coaching tips — tuned to your team." }` to `SCREENS`;
>    add `else if (routeId === "ideas" && RR.feed) RR.feed.render(host);` in
>    `renderScreen` (do **not** add it to the team-gated `today/season/history`
>    branch — the feed works with no team). Set `DEFAULT_ROUTE = "ideas"`. In
>    `updateTabs`, map `today`, `history`, `calendar` → parent tab `"ideas"`.
> 4. **`js/page-guide.js`**: add an `ideas` explainer entry.
> 5. **`sw.js`**: add `./js/feed.js` to the precache list and bump `CACHE_VERSION`.
>
> **Acceptance:** App opens on the **Ideas** tab showing the placeholder. `#today`
> still renders the old planner + timer. Schedule/History light up the Ideas tab.
> No console errors; `node --check js/feed.js js/app.js` passes.

---

## Prompt 2 — The feed content data layer (`js/feed-data*.js`)

> **Goal:** define the curated content the feed draws from, separate from drills
> and tips (which it also pulls from).
>
> 1. In `feed.js`, add `RR.feed.data = { ideas: [], challenges: [], mindset: [],
>    themes: [] }` and a public `RR.feed.add(partial)` that concatenates arrays
>    onto it (mirroring how `coaching-tips-*.js` use `addTips`).
> 2. Create **`js/feed-data.js`** (split into `-2` if it nears 800 lines) that calls
>    `RR.feed.add({...})` with a starter set (aim ~8 of each). Shapes:
>    - **idea / mini-flow** — share/print friendly (blocks reference drills by id):
>      `{ id, type:"idea", title, theme, skill, vibe, ageMin, ageMax, minutes,
>      goal, tipRef?, blocks:[{ role, minutes, drillId }] }`
>    - **challenge** — `{ id, type:"challenge", title, body, skill?, vibe, ageMin,
>      ageMax }`
>    - **mindset** — `{ id, type:"mindset", title, body, tipRef?, ageMin, ageMax }`
>    - **theme** — `{ id, type:"theme", title, blurb, filter:{skill?|vibe?},
>      sampleDrillIds?[] }`
>    - `vibe` ∈ `fun | skill-builder | quick | game-day`. Pick `drillId`s that
>      exist in `RR.drills`; pick `tipRef`s that exist via `RR.coaching.tipById`.
> 3. Load the new file(s) in `index.html` right after `feed.js`; add to `sw.js`
>    precache and bump the version.
>
> **Acceptance:** In a sandbox, after loading `feed.js` + `feed-data.js`,
> `RR.feed.data.ideas.length` etc. are populated; every `drillId`/`sampleDrillIds`
> resolves in `RR.drills`; every `tipRef` resolves via `RR.coaching.tipById`. Add a
> tiny validator script (or inline node check) that asserts this.

---

## Prompt 3 — Card renderers (one per feed item type)

> **Goal:** render each item type as a distinct, tappable card.
>
> In `feed.js` add internal renderers returning DOM via `RR.ui.h`:
> - `drillSpotlightCard(drill)` — reuse `RR.ui.drillCard(drill, { onOpen })`; tapping
>   opens the existing Drills detail (navigate to `#drills` and focus that drill, or
>   open `RR.ui.drillDetail` in a lightweight panel).
> - `ideaCard(idea)` — eyebrow (theme/vibe), title, `goal`, the block list resolved
>   to drill names + minutes, and a one-line tip if `tipRef` is set. Expand/collapse
>   for the steps; a footer row (Save / Share — wired in later prompts).
> - `tipCard(tip)` — compact: icon chip + title + first 1–2 `points`; tapping deep-
>   links to the Tips tab (`#tips`).
> - `challengeCard(challenge)` and `mindsetCard(mindset)` — punchy title + body, with
>   a subtle type label; mindset/challenge may show a `tipRef` link.
> - `themeCard(theme)` — title + blurb + a "see ideas" affordance that applies the
>   theme's `filter` to the feed.
> - A dispatcher `renderItem(item)` that picks the renderer by `item.type` (treat a
>   raw drill as `type:"drill"`).
>
> **Acceptance:** A temporary `render()` that maps a hand-picked array of one of each
> type through `renderItem` shows all six cards without errors, in light and dark.

---

## Prompt 4 — The composer: variety, age-tuning, freshness, "More ideas"

> **Goal:** assemble the real feed — interleaved types, tuned to the team, fresh by
> day, with a "More ideas" button.
>
> 1. Add `composeFeed(team, filters, batch)`:
>    - Gather candidates: `data.ideas/challenges/mindset/themes`, **drill
>      spotlights** from `RR.drills` (filtered to the team's age band via
>      `RR.team.ageRange` when a team exists; skip Warmup/Cooldown unless themed),
>      and **tip cards** from `RR.coaching.tips`.
>    - Filter by the team's age band and any active `filters` (skill / theme / vibe).
>    - **Interleave by type** so no two same-type cards sit adjacent, and order with
>      a **small seeded shuffle**: seed from today's date string + `batch` (a tiny
>      local PRNG — do NOT depend on `generator.js`). Same day = stable order; a new
>      day or a higher `batch` = a fresh mix.
> 2. `render(host)` paints the composed list and a **"More ideas ↻"** button that
>    increments `batch` and appends the next shuffled slice.
> 3. Works with **no team** (general inspiration, all ages).
>
> **Acceptance:** The Ideas tab shows a varied, scrolling feed; "More ideas" appends
> a different batch; reloading the same day keeps order stable; setting up a team (or
> changing its age) changes which cards surface.

---

## Prompt 5 — Filter chips + Saved ideas

> **Goal:** lightweight filtering and a personal "Saved" collection.
>
> 1. **`js/state.js`**: add `savedIdeas: []` with `isSavedIdea(id)` /
>    `toggleSavedIdea(id)`, mirroring the existing `favorites` API. (Keep separate
>    from drill favorites.)
> 2. In `feed.js`, add a collapsible **chip bar** (reuse the chip pattern/markup from
>    `js/drills-ui.js` + `css/drills.css`): skill, theme, vibe, and a **Saved** chip.
>    Persist the open/active state across navigations like `drills-ui` does.
> 3. Add a **save (heart) button** to every card → `RR.state.toggleSavedIdea(item.id)`;
>    the **Saved** chip filters the feed to saved items (drills can reuse their
>    existing favorite state).
>
> **Acceptance:** Chips narrow the feed and clear cleanly; saving a card moves it
> under **Saved**; saved state survives a reload.

---

## Prompt 6 — Carry it to the gym: print/share + the quiet planner link + tips woven in

> **Goal:** let her prep then put the phone down, and connect the feed to Tips and
> the classic planner.
>
> 1. **Share/print an idea**: build a share-compatible session from a mini-flow
>    (`{ skillFocus: idea.skill, totalMinutes: idea.minutes, blocks: idea.blocks
>    resolved to { role, title, minutes, drill } }`) and wire the card's Share /
>    Print to `RR.share.session(session, team)` / `RR.share.printSession(session,
>    team)` (both already defensive — no changes to `share.js`).
> 2. **Tips woven in**: resolve every `tipRef` via `RR.coaching.tipById(id)` and show
>    its one-line hook on the card, linking to `#tips`. Tip and mindset cards are
>    first-class feed items already (Prompt 3/4).
> 3. **Quiet planner link**: add a small header/footer link **"Open the full planner
>    & timer →"** → `#today` (the unchanged classic experience).
>
> **Acceptance:** Printing/sharing an idea yields a clean carry sheet; tip links open
> the Tips tab; the planner link opens the old plan + working timer.

---

## Prompt 7 — Styling & polish (`css/feed.css`)

> **Goal:** make the feed feel like a feed.
>
> Create `css/feed.css` (load it in `index.html`; add to `sw.js` precache + bump
> version): vertical scroll with generous spacing; a distinct, recognizable style per
> card type (idea / drill / tip / challenge / mindset / theme); the chip bar; the
> save heart; the "More ideas" button. Semantic tokens only; verify light + dark and
> `prefers-reduced-motion`. Keep each card flat (no nested cards) and tappable.
>
> **Acceptance:** The feed looks polished and consistent in both themes; no layout
> breakage on a 320px-wide phone; keyboard focus rings are visible on every control.

---

## Prompt 8 — QA pass & acceptance checklist

> **Goal:** confirm the whole thing and that nothing regressed.
>
> - `node --check` all new/changed JS; load `feed.js` + `feed-data*.js` in a sandbox
>   and assert every `drillId`/`tipRef` resolves, no dupe ids.
> - `node scripts/verify.js` still passes (generator untouched).
> - Manual: app opens on **Ideas**; feed is varied, age-tuned, fresh, filterable,
>   saveable; share/print works; tip links and the planner link work; the **timer**
>   still launches from `#today`; Drills/Tips/Season/Players/History unaffected.
> - Confirm `sw.js` lists every new asset and `CACHE_VERSION` was bumped.
>
> **Acceptance:** All boxes checked; open a draft PR summarizing the feed.

---

## Notes & options to decide as you go
- **Tab name/icon**: defaulting to **"Ideas"** — could be "Inspire"/"Coach".
- **Content volume**: ship a solid first batch of each item type, then grow the
  `feed-data*.js` files over time (the composer scales automatically).
- **Saved vs favorites**: kept separate (saved *ideas* vs favorite *drills*); can be
  unified later.
- **Out of scope here**: Romanian translation of new feed copy (the i18n engine
  degrades gracefully); revisit via `i18n-content*.js` later.
