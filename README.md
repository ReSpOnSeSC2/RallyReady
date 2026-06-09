# RallyReady 🏐

**A practice planner for youth volleyball coaches.** Tell RallyReady your team's
age group and dates, and it builds you a ready-to-run plan — either for a **full
season** (it ramps practices up to your first game, then keeps them sharp) or for
a **1–30 day summer camp** (a fun day-by-day arc from welcome to a final showcase).
Every day it hands you a complete session — warm-up, skill blocks, a game, and a
cool-down — with the right net height, the right ball, simple coaching cues, and a
"Watch how" video link for each drill. It runs on your phone, works with **no
internet** after the first load, needs **no account or login**, and keeps
everything **on your device**.

---

## What you need

Nothing to buy, nothing to install, no sign-up. RallyReady is just a folder of
files that runs in a normal web browser (Chrome, Safari, Edge, Firefox).

---

## Run it on a computer to test

The quickest peek: double-click **`index.html`** and it opens in your browser.

For the **full** experience — including offline mode and "Add to Home screen" —
the app has to be served from a web address, not opened as a file. (Browsers only
allow the offline feature on a real `http(s)` address or on `localhost`, **not**
on a `file://` path.) The easiest way is a one-line local server. Open a terminal
in the `rallyready` folder and run **one** of these:

```
python3 -m http.server 8000
```
```
npx serve
```

Then open the address it prints (for Python that's **`http://localhost:8000/`**)
in your browser. That's the real thing, offline mode and all.

---

## Put it online for free (so your phone can use it)

You want a real web link so you can open it on your phone and install it. Two easy
options, no cost:

**Option A — Netlify Drop (about one minute, no account needed).**
1. Go to **[netlify.com/drop](https://app.netlify.com/drop)** in your browser.
2. Drag the whole **`rallyready`** folder onto the page.
3. Netlify gives you a public **`https://…`** link. That's it — open that link on
   your phone.

**Option B — GitHub Pages (free, good if your files already live on GitHub).**
Put the project in a GitHub repository, then in the repo go to **Settings →
Pages**, choose your main branch as the source, and save. After a minute GitHub
publishes it at a `https://yourname.github.io/…` address you can open anywhere.

Either way you end up with a normal web link. Bookmark it or, better, install it
(next section).

---

## Install it on an Android phone

1. Open your RallyReady web link in **Chrome** on the phone.
2. Tap the **⋮** menu (top-right).
3. Tap **Add to Home screen** (sometimes shown as **Install app**) and confirm.

Now RallyReady sits on your home screen with its own icon and opens full-screen
like a normal app. After you've opened it once, it **works without internet** —
perfect for a gym with bad signal. (On an iPhone it's similar: open the link in
Safari, tap the **Share** button, then **Add to Home Screen**.)

---

## Light & dark

RallyReady automatically follows your phone's light-or-dark setting, so it just
looks right. Want to override it? Tap the **sun / moon** button in the top-right
corner to flip it yourself. Your choice is **remembered** the next time you open
the app.

---

## English & Romanian

RallyReady speaks **English and Romanian**. Tap the **EN / RO flag toggle** in the
top-right corner (next to the sun/moon button) to switch the whole app instantly —
no reload. On a Romanian-language phone it opens in Romanian automatically; either
way your choice is **remembered** next time. The Romanian is natural, spoken
coaching language, with volleyball terms as they're used in Romania (fileu, preluare,
ridicare, atac, blocaj, extremă/central/opus/libero). The **Tips** tab also includes
a **"US vs. Romania: what's different"** section and a **Romanian ↔ English terms**
reference, for a coach who learned the game in Romania and is now coaching here.

## Using it day to day

1. **Open the app.** The bottom of the screen has five tabs: **Today, Season,
   Drills, Tips, Team.**
2. **Set up your Team** (you only do this once). Tap the **Team** tab and fill in:
   - Your team **name** and **age group** (this sets the drills, net height, and ball).
   - **Program type** — pick **Season** or **Summer camp**:
     - **Season:** your practice start date, your first-game date, which weekdays
       you practise on, and your **game schedule** (add every match — practices
       then ramp toward the next game and ease the day before).
     - **Summer camp:** the camp start date, how many days (1–30), and how many
       sessions per day.
   - **Session length**, your **squad size** and the **equipment you have**
     (so drills suit your group and your gym), and optionally any **skills to emphasize**.

   It saves as you type — there's no Save button to forget. Coach more than one team?
   Use **Your teams** at the top of the screen to add and switch between them, and
   **Backup & restore** at the bottom to export everything to a file (or move it to a new phone).
3. **Go to Today.** RallyReady shows you a complete session for today, ready to run:
   the phase, the "skill of the week" (or "skill of the day" at camp), how intense
   it should be, the time, every drill with steps and coaching cues, and the gear
   you'll need. Each drill and game also spells out **how it's organized** — whether
   everyone goes at once or takes turns, how to group the squad, and **who keeps the
   score** — and the ones where position matters include a **top-down court diagram**
   showing where players stand and where the ball goes.
4. **Make it yours.** Change **Today's focus** to any skill from the picker, or tap
   **Edit plan** to retime blocks (±5 min), reorder them, add or remove a block, **pin**
   a drill you love (so **Regenerate** keeps it), **swap** a drill, or **choose** a
   specific one from the library. Tap **Coaching cues** to see what to say, or
   **Watch how** for a video search. Want a whole fresh plan? Tap **Regenerate**.
5. **Run it.** Tap **Start** for a full-screen, block-by-block **practice timer** that
   counts each block down and chimes when it's time to move on. Tap **Share** to text
   the plan to yourself or an assistant, or **Print** a carry sheet for your clipboard.
6. **Mark complete.** When you're done, tap **Mark practice complete**, take quick
   **attendance**, and jot a **note** ("serve receive still shaky"). It's saved to your
   **History** — re-open or **copy a great practice forward** to another date anytime —
   and future practices avoid repeating those drills for a while so things stay fresh.

**Running a camp?** The Today screen counts your days for you — it shows **"Day X
of N"** at the top. If you run **two sessions a day**, you'll see a **Session 1 / 2
(AM / PM)** toggle to switch between them. And the **Season** tab becomes your
**camp plan**: a day-by-day strip from Welcome through the final Showcase, with a
marker on today.

**The other tabs:**
- **Season** — your whole plan at a glance: an intensity chart and a card for each
  phase explaining the focus and the why, plus a **Share** button. (For a camp this is
  your camp plan.)
- **Drills** — browse the full library; search and filter by skill, difficulty, age,
  or **camp-friendly**; **★ favorite** the ones you love (favorites get picked more
  often); and **add your own drills**, which join the library and your plans.
- **Tips** — short, practical coaching guidance, plus what to expect at each age
  group and a plain-English glossary.

**Reached from the Today header:**
- **Schedule** — the next few weeks of practices (and games) at a glance; tap any day
  to open its plan.
- **History** — every completed practice, with attendance and notes.

**Reached from the Team screen:**
- **Roster** — add your players (name, jersey number, position); attendance on the
  Today screen then uses them.

---

## Troubleshooting

- **"Add to Home screen" / install isn't offered.** You're probably viewing the
  files directly (a `file://` address). Use a real web link instead — put it online
  with Netlify Drop, or run the one-line local server above and use
  `http://localhost:8000/`.
- **It won't open offline.** Open it online **once** first (while you have signal)
  so it can save itself to your phone. After that it works with no connection.
- **"Watch how" links don't open.** Those are the only part that needs the
  internet — they open a YouTube search in a new tab. With no signal the rest of
  the app still works fine; the videos just won't load until you're back online.
- **I changed my team but Today looks the same.** Tap the **Today** tab again to
  refresh it. If you switched between Season and Summer camp, both the Today and
  Season screens follow the new choice.
- **My data disappeared.** RallyReady saves everything in *this* browser on *this*
  device. Using a different browser, a private/incognito window, or clearing your
  browser data will start you fresh. Installing it to your home screen and using
  that icon keeps everything in one place.
- **I updated the files but see the old version.** The app caches itself for
  offline use. Close it completely and reopen, or refresh the page, and it will
  pick up the new version.

---

## For the curious (how it's built)

Plain HTML, CSS, and vanilla JavaScript — **no frameworks, no build step, no npm
packages**, and no servers or databases. Everything you do is stored locally in
your browser with `localStorage`, and a service worker (`sw.js`) caches the app so
it runs offline. Drill videos are real YouTube **search** links (so they never go
stale or point to the wrong clip), and opening one is just you tapping a link — the
app itself never calls the network while you use it.

```
rallyready/
  index.html            The app; loads the modules in order.
  manifest.webmanifest  App name, colors, and icons for installing.
  sw.js                 Offline cache (the service worker).
  css/                  Styles and the light/dark design tokens.
  js/                   The app: team setup, season/camp planning,
                        the practice generator, drills, tips, and screens.
                        diagram.js + format.js + extras-*.js add the
                        "how it's organized" read-out and the SVG court diagrams.
  icons/                App icons.
  images/               The illustrated court diagrams the app ships.
                        (Full-resolution sources live NEXT TO this folder, in
                        rallyready-design-assets/ — kept out of the app and out
                        of git so deploys and clones stay small.)
  scripts/              Developer self-tests: verify.js (planning engine),
                        verify-feed.js (Ideas feed), verify-sw.js (offline
                        cache list), verify-i18n.js (EN/RO dictionaries).
```

Want to check the engine yourself? With Node installed, run `node scripts/verify.js`
from the project folder — it generates full seasons and camps and confirms every
session is valid. The other three checks run the same way, and all four run
automatically on every push via GitHub Actions (`.github/workflows/verify.yml`).
