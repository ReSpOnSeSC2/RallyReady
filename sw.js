// RallyReady service worker.
// Caches the app shell so the app loads and runs fully OFFLINE after first visit.
// Bump CACHE_VERSION whenever any cached file changes to force clients to update.
const CACHE_VERSION = "rallyready-v21";

// Core files that make up the offline app shell. Everything here is fetched and
// cached up front on install, so the app loads with NO network after first visit.
// Keep this list in step with the files that actually exist.
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
  "./css/styles.css",
  "./css/tips.css",
  "./css/today.css",
  "./css/drills.css",
  "./css/features.css",
  "./css/roster.css",
  "./css/calendar.css",
  "./css/run.css",
  "./css/diagram.css",
  "./css/print.css",
  "./js/state.js",
  "./js/drills.js",
  "./js/drills-2.js",
  "./js/drills-3.js",
  "./js/drills-4.js",
  "./js/drills-5.js",
  "./js/drills-6.js",
  "./js/drills-7.js",
  "./js/drills-8.js",
  "./js/drills-9.js",
  "./js/drills-10.js",
  "./js/drills-11.js",
  "./js/coaching.js",
  "./js/periodization.js",
  "./js/generator.js",
  "./js/diagram.js",
  "./js/format.js",
  "./js/extras-build.js",
  "./js/extras-data.js",
  "./js/extras-data-2.js",
  "./js/extras-data-3.js",
  "./js/extras-data-4.js",
  "./js/extras-data-5.js",
  "./js/extras-data-6.js",
  "./js/extras-data-7.js",
  "./js/extras-data-8.js",
  "./js/extras-data-9.js",
  "./js/extras-data-10.js",
  "./js/extras-data-11.js",
  "./js/extras-data-12.js",
  "./js/ui.js",
  "./js/install.js",
  "./js/teams-ui.js",
  "./js/games-ui.js",
  "./js/drill-editor.js",
  "./js/plan-edit.js",
  "./js/run.js",
  "./js/share.js",
  "./js/roster.js",
  "./js/calendar.js",
  "./js/team.js",
  "./js/season.js",
  "./js/today.js",
  "./js/history.js",
  "./js/drills-ui.js",
  "./js/app.js"
];

// Pre-cache the shell as soon as the worker installs.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  // Activate this worker immediately instead of waiting for old tabs to close.
  self.skipWaiting();
});

// Clean up any caches from previous versions when the new worker activates.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Cache-first strategy: serve from cache, fall back to the network when needed.
// This keeps everything working with no connection after the first visit. Only
// same-origin GETs are handled; anything else is left to the browser.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // SPA navigations (address bar, refresh, deep link) resolve to the cached
  // shell when offline, so any route loads with no network.
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match(req).then((hit) =>
        hit ||
        fetch(req).catch(() =>
          caches.match("./index.html").then((shell) => shell || caches.match("./"))
        )
      )
    );
    return;
  }

  // Static assets: cache-first, then network. Newly fetched same-origin files
  // are added to the cache so subsequent loads are instant and offline-safe.
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);   // offline and uncached: let the request fail gracefully
    })
  );
});
