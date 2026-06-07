// RallyReady service worker.
// Caches the app shell so the app loads and runs fully OFFLINE after first visit,
// while staying fresh online: navigations are network-first and static assets are
// stale-while-revalidate (see the fetch handler), so a deployed update shows up on
// the next launch rather than being pinned to the cache.
// Bump CACHE_VERSION whenever any cached file changes to force clients to update.
const CACHE_VERSION = "rallyready-v34";

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
  "./fonts/bricolage-grotesque.var.woff2",
  "./fonts/hanken-grotesk.var.woff2",
  "./css/styles.css",
  "./css/page-guide.css",
  "./css/team.css",
  "./css/tips.css",
  "./css/tips-visuals.css",
  "./css/today.css",
  "./css/drills.css",
  "./css/features.css",
  "./css/roster.css",
  "./css/players.css",
  "./css/positions.css",
  "./css/calendar.css",
  "./css/run.css",
  "./css/diagram.css",
  "./css/print.css",
  "./js/state.js",
  "./js/i18n.js",
  "./js/i18n-ui.js",
  "./js/i18n-content.js",
  "./js/i18n-content2.js",
  "./js/i18n-positions.js",
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
  "./js/tts.js",
  "./js/coaching.js",
  "./js/tips-tts.js",
  "./js/terms.js",
  "./js/tips-visuals.js",
  "./js/positions-data.js",
  "./js/positions.js",
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
  "./js/photos.js",
  "./js/install.js",
  "./js/teams-ui.js",
  "./js/games-ui.js",
  "./js/drill-editor.js",
  "./js/plan-edit.js",
  "./js/run.js",
  "./js/share.js",
  "./js/roster.js",
  "./js/players-ui.js",
  "./js/player-profile.js",
  "./js/positions-ui.js",
  "./js/lineup.js",
  "./js/calendar.js",
  "./js/team.js",
  "./js/season.js",
  "./js/today.js",
  "./js/history.js",
  "./js/drills-ui.js",
  "./js/page-guide.js",
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

// Freshness-first strategy, so a deployed update is picked up promptly instead
// of being masked by the cache. Only same-origin GETs are handled; anything else
// is left to the browser. Every successful same-origin response is written back
// to the cache, so the app still loads and runs fully OFFLINE after first visit.
function cachePut(req, res) {
  // Only cache complete, same-origin 200s (skip opaque/partial/range responses).
  if (res && res.ok && res.type === "basic") {
    const copy = res.clone();
    caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
  }
  return res;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // SPA navigations (address bar, refresh, deep link): NETWORK-FIRST, so an
  // online launch always gets the latest shell. Fall back to the cached shell
  // when offline, so any route still loads with no connection.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => cachePut(req, res))
        .catch(() =>
          caches.match(req).then((hit) =>
            hit || caches.match("./index.html").then((shell) => shell || caches.match("./"))
          )
        )
    );
    return;
  }

  // Static assets (JS/CSS/icons): STALE-WHILE-REVALIDATE. Serve the cached copy
  // instantly (fast, offline-safe) while fetching a fresh one in the background
  // and updating the cache — so the very next load runs the latest code even if
  // a release ever ships without a CACHE_VERSION bump. Uncached → wait on network.
  event.respondWith(
    caches.match(req).then((hit) => {
      const network = fetch(req)
        .then((res) => cachePut(req, res))
        .catch(() => hit);   // offline: fall back to whatever we cached
      return hit || network;
    })
  );
});
