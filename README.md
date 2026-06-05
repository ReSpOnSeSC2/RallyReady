# RallyReady

A youth volleyball practice generator for coaches. RallyReady helps a coach
plan a full season and generate a ready-to-run practice for any given day,
matched to the team's age group and where they are in the season.

## Highlights

- **Installable PWA** — add it to an Android home screen and it runs like a real app.
- **Fully offline** — a service worker caches everything, so it works with no connection after the first load.
- **On-device only** — all data is saved locally with `localStorage`. No backend, no login, no network calls at runtime.
- **Mobile-first** — designed for a ~390px phone screen, with big, thumb-friendly tap targets.

## Tech

Plain HTML, CSS, and vanilla JavaScript. No frameworks, no build step, no npm
packages. Every module attaches to a single global namespace object, `RR`.

## Run it

Because the app uses a service worker, serve it over `http(s)` or `localhost`
(service workers do not run from `file://`). For example, from this folder:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/` on your phone or browser. To install on
Android, open it in Chrome and choose "Add to Home screen".

## Project structure

```
rallyready/
  index.html            App shell; loads modules in dependency order.
  manifest.webmanifest  PWA metadata (name, colors, icons, display mode).
  sw.js                 Service worker; caches the app shell for offline use.
  css/styles.css        Design tokens (:root) and base styles.
  js/state.js           localStorage load/save and default data.
  js/drills.js          Drill library data.
  js/coaching.js        Coaching tips and age-group reference data.
  js/periodization.js   Season phases and the intensity curve.
  js/generator.js       Practice-session generation engine.
  js/ui.js              Shared render helpers (cards, badges, etc.).
  js/app.js             Boot, hash router, and bottom tab bar.
  icons/                App icons.
```

## Data

All data lives in the browser's `localStorage` on the coach's device and
persists across app restarts. Nothing is sent anywhere.
