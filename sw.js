// RallyReady service worker.
// Install one coherent release of the app before claiming any page. Keep its
// HTML and scripts together until the next worker activates and reloads the page.
// On release, advance this version, the HTML marker, and the URLs of changed shell files.
const CACHE_VERSION = "rallyready-v94";
const RELEASE = CACHE_VERSION.split("-v")[1];
// Large demos are warmed after activation and reused by later shell releases.
// Change this cache name if bundled media changes at an existing URL.
const MEDIA_CACHE = "rallyready-media-v1";
const LEGACY_MEDIA_RELEASES = [90, 91];

// Core app files are installed together. Demonstration assets listed here are
// cached on demand and warmed separately, so they never delay a shell update.
const APP_SHELL = [
  "./index.html?v=94",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
  "./fonts/bricolage-grotesque.var.woff2",
  "./fonts/hanken-grotesk.var.woff2",
  "./images/drill-motion/attack-atlas.webp",
  "./images/drill-motion/band-atlas.webp",
  "./images/drill-motion/block-atlas.webp",
  "./images/drill-motion/cooldown-atlas.webp",
  "./images/drill-motion/defense-atlas.webp",
  "./images/drill-motion/footwork-atlas.webp",
  "./images/drill-motion/jump-atlas.webp",
  "./images/drill-motion/medicine-atlas.webp",
  "./images/drill-motion/pass-atlas.webp",
  "./images/drill-motion/recovery-atlas.webp",
  "./images/drill-motion/run-atlas.webp",
  "./images/drill-motion/serve-atlas.webp",
  "./images/drill-motion/set-atlas.webp",
  "./images/drill-motion/underhand-atlas.webp",
  "./images/drill-motion/warmup-atlas.webp",
  "./images/drill-motion/scene-box-mat-grid.webp",
  "./images/drill-motion/scene-defense-grid.webp",
  "./images/drill-motion/scene-defense-pro-grid.png",
  "./images/drill-motion/scene-equipment-grid.webp",
  "./images/drill-motion/scene-jump-band-grid.webp",
  "./images/drill-motion/scene-locomotion-grid.webp",
  "./images/drill-motion/scene-power-grid.webp",
  "./images/drill-motion/scene-recovery-grid.webp",
  "./images/drill-motion/scene-roster-grid.webp",
  "./images/drill-motion/scene-serving-attack-grid.webp",
  "./images/drill-motion/scene-specialized-grid.webp",
  "./images/drill-motion/scene-volleyball-grid.webp",
  "./models/coachcam/rolls-and-sprawls.glb",
  "./models/coachcam/coachcam-library.glb",
  "./vendor/three/three.core.min.js",
  "./vendor/three/three.module.min.js",
  "./vendor/three/addons/loaders/GLTFLoader.js",
  "./vendor/three/addons/utils/BufferGeometryUtils.js",
  "./vendor/three/addons/utils/SkeletonUtils.js",
  "./css/styles.css?v=93",
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
  "./css/run.css?v=93",
  "./css/diagram.css",
  "./css/drill-animation.css",
  "./css/drill-human-motion.css",
  "./css/drill-choreography.css",
  "./css/coachcam-3d.css",
  "./css/feed.css?v=93",
  "./css/club-practice.css?v=93",
  "./css/club-practice-court.css?v=94",
  "./css/print.css?v=93",
  "./js/state.js?v=93",
  "./js/i18n.js?v=93",
  "./js/i18n-ui.js?v=93",
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
  "./js/term-glyphs.js",
  "./js/coaching.js",
  "./js/coaching-tips-2.js",
  "./js/coaching-tips-3.js",
  "./js/tips-tts.js",
  "./js/terms.js",
  "./js/tips-visuals.js",
  "./js/positions-data.js",
  "./js/positions.js",
  "./js/periodization.js",
  "./js/generator.js",
  "./js/diagram-images.js",
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
  "./js/drill-human-motion.js",
  "./js/drill-choreography.js",
  "./js/coachcam-3d.js",
  "./js/coachcam-equipment-3d.js",
  "./js/coachcam-variants.js",
  "./js/coachcam-library-3d.js",
  "./js/drill-animation.js",
  "./js/ui.js",
  "./js/photos.js",
  "./js/install.js",
  "./js/teams-ui.js",
  "./js/games-ui.js",
  "./js/drill-editor.js",
  "./js/plan-edit.js",
  "./js/run.js?v=93",
  "./js/share.js?v=93",
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
  "./js/feed.js?v=93",
  "./js/feed-data.js?v=93",
  "./js/feed-deck.js?v=93",
  "./js/club-practice-themes-1.js?v=93",
  "./js/club-practice-themes-2.js?v=93",
  "./js/club-practice.js?v=94",
  "./js/club-practice-court.js?v=94",
  "./js/club-practice-ui.js?v=93",
  "./js/app.js?v=93"
];

const scope = new URL(self.registration.scope);
const documentUrl = new URL(`index.html?v=${RELEASE}`, scope);
const shellUrls = APP_SHELL.map((path) => new URL(path, scope));

function isMedia(url) {
  return url.origin === scope.origin && url.pathname.startsWith(scope.pathname) &&
    /^(images|models|vendor)\//.test(url.pathname.slice(scope.pathname.length));
}

const mediaUrls = shellUrls.filter(isMedia);
const coreUrls = new Set(shellUrls.filter((url) => !isMedia(url)).map((url) => url.href));

async function installShell() {
  const cache = await caches.open(CACHE_VERSION);
  const request = new Request(documentUrl, { cache: "reload" });
  const html = await fetch(request);
  if (!html.ok || !(await html.clone().text()).includes(`<meta name="rallyready-release" content="${RELEASE}" />`)) {
    throw new Error("RallyReady shell release is unavailable");
  }
  const files = [...coreUrls].filter((url) => url !== documentUrl.href);
  await cache.addAll(files.map((url) => new Request(url, { cache: "reload" })));
  await cache.put(request, html);
  await self.skipWaiting();
}

self.addEventListener("install", (event) => event.waitUntil(installShell()));

function shellCacheRelease(name) {
  const match = /^rallyready-v(\d+)$/.exec(name);
  return match ? Number(match[1]) : 0;
}

async function activateShell() {
  const keys = await caches.keys();
  // Compatible combined caches survive until their media has been copied locally.
  await Promise.all(keys.filter((name) => {
    const release = shellCacheRelease(name);
    return release > 0 && release < Number(RELEASE) && !LEGACY_MEDIA_RELEASES.includes(release);
  }).map((name) => caches.delete(name)));
  await self.clients.claim();
}

self.addEventListener("activate", (event) => event.waitUntil(activateShell()));

async function legacyMediaCaches() {
  const keys = await caches.keys();
  return keys.filter((name) => LEGACY_MEDIA_RELEASES.includes(shellCacheRelease(name)))
    .sort((a, b) => shellCacheRelease(b) - shellCacheRelease(a));
}

async function serveMedia(request) {
  const cache = await caches.open(MEDIA_CACHE);
  const hit = await cache.match(request, { ignoreVary: true });
  if (hit) return hit;

  for (const name of await legacyMediaCaches()) {
    const old = await caches.match(request, { cacheName: name, ignoreVary: true });
    if (old) return old;
  }

  const migrated = await cache.match(request, { ignoreVary: true });
  if (migrated) return migrated;

  const response = await fetch(request);
  if (response.status === 200 && response.type === "basic") {
    await cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

async function warmMedia() {
  const cache = await caches.open(MEDIA_CACHE);
  for (const name of await legacyMediaCaches()) {
    const old = await caches.open(name);
    const requests = await old.keys();
    await Promise.all(requests.filter((request) => isMedia(new URL(request.url))).map(async (request) => {
      if (await cache.match(request, { ignoreVary: true })) return;
      const response = await old.match(request, { ignoreVary: true });
      if (response) await cache.put(request, response);
    }));
    await caches.delete(name);
  }
  await Promise.allSettled(mediaUrls.map((url) => serveMedia(new Request(url))));
}

let warmingMedia;
self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "RALLYREADY_WARM_MEDIA") return;
  if (!warmingMedia) {
    warmingMedia = warmMedia().catch((error) => console.warn("RallyReady: media cache update failed", error))
      .finally(() => { warmingMedia = null; });
  }
  event.waitUntil(warmingMedia);
});

async function serveShell(request, key) {
  const cache = await caches.open(CACHE_VERSION);
  return await cache.match(key, { ignoreVary: true }) || fetch(request);
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== scope.origin) return;

  if (request.mode === "navigate" && (url.pathname === scope.pathname || url.pathname === documentUrl.pathname)) {
    event.respondWith(serveShell(request, documentUrl.href));
  } else if (coreUrls.has(url.href)) {
    event.respondWith(serveShell(request, url.href));
  } else if (isMedia(url)) {
    event.respondWith(serveMedia(request));
  }
});
