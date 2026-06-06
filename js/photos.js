// photos.js — player photo pipeline + store (RR.photos).
//
// Photos are a coach convenience (recognise the squad at a glance), so they must
// work with NO backend and fully OFFLINE. We keep them OUT of the main app state
// blob (rallyready.v1) — which is serialised on every single state write — and in
// a DEDICATED localStorage key, so adding a photo never bloats or slows ordinary
// saves. Each upload is downscaled and centre-cropped to a small square JPEG via
// <canvas> before storage, so a full roster of photos stays well within the
// ~5 MB localStorage budget. No image ever leaves the device.
window.RR = window.RR || {};

RR.photos = (function () {
  "use strict";

  var STORAGE_KEY = "rallyready.photos.v1";
  var SIZE = 256;          // stored square edge in px — sharp on retina, tiny on disk
  var QUALITY = 0.72;      // JPEG quality: a good size/clarity balance for faces

  // In-memory mirror of { [playerId]: dataURL }, loaded once and kept in step.
  var map = load();

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) || {}) : {};
    } catch (e) {
      return {};   // blocked / corrupt storage — start empty, app still runs
    }
  }

  // Persist the map. Returns false on quota/again-private failures so callers can
  // tell the coach instead of silently dropping the photo.
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      return true;
    } catch (e) {
      return false;
    }
  }

  // ---- Reads ----------------------------------------------------------------
  function get(id) { return (id && map[id]) || null; }
  function has(id) { return !!(id && map[id]); }

  // ---- Writes ---------------------------------------------------------------
  // Store an already-prepared square data URL (used by the cropper, which has
  // already drawn to a canvas). Returns true on success, false if storage is full.
  function set(id, dataUrl) {
    if (!id || !dataUrl) return false;
    map[id] = dataUrl;
    if (persist()) return true;
    delete map[id];          // roll back the in-memory change to match disk
    return false;
  }

  function remove(id) {
    if (id && map[id]) { delete map[id]; persist(); }
  }

  // Read an image File, downscale + centre-crop to a SIZE×SIZE JPEG, and resolve
  // with the data URL. Rejects if the file isn't a decodable image. Pure client
  // side: FileReader + Image + canvas, no network.
  function processFile(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) {
        reject(new Error("Not an image file."));
        return;
      }
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error("Couldn't read that file.")); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error("Couldn't open that image.")); };
        img.onload = function () { resolve(squareDataUrl(img, 1, 0.5, 0.5)); };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Draw `img` into a SIZE×SIZE canvas, cover-cropped. `zoom` (>=1) scales in;
  // focusX/focusY (0..1) choose which part of the image stays centred when the
  // cover crop or zoom overflows — that's what the cropper's drag/zoom adjust.
  function squareDataUrl(img, zoom, focusX, focusY) {
    zoom = zoom || 1;
    focusX = (focusX == null) ? 0.5 : focusX;
    focusY = (focusY == null) ? 0.5 : focusY;

    var canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    var ctx = canvas.getContext("2d");

    // Base "cover" scale fills the square; zoom magnifies beyond that.
    var cover = Math.max(SIZE / img.width, SIZE / img.height) * zoom;
    var dw = img.width * cover;
    var dh = img.height * cover;
    // Position so the chosen focus point sits where it should; clamp so we never
    // expose blank canvas edges.
    var dx = clamp((SIZE - dw) * focusX, SIZE - dw, 0);
    var dy = clamp((SIZE - dh) * focusY, SIZE - dh, 0);

    ctx.drawImage(img, dx, dy, dw, dh);
    return canvas.toDataURL("image/jpeg", QUALITY);
  }

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  // Convenience used by the Players grid: read a file straight to storage.
  // Resolves true on success, rejects with a friendly Error otherwise.
  function setFromFile(id, file) {
    return processFile(file).then(function (dataUrl) {
      if (!set(id, dataUrl)) {
        throw new Error("Couldn't save the photo — device storage is full.");
      }
      return true;
    });
  }

  // ---- Backup hooks (RR.state export/import bundles these) ------------------
  function all() { return JSON.parse(JSON.stringify(map)); }
  function replaceAll(next) {
    map = (next && typeof next === "object") ? JSON.parse(JSON.stringify(next)) : {};
    persist();
  }

  // ---- Avatar node ----------------------------------------------------------
  // avatar(player, size) -> a decorative node: the photo when present, otherwise
  // a tinted initials circle. The player's NAME is always shown as real text
  // beside this, so the avatar is aria-hidden (it adds no new information).
  function avatar(player, size) {
    size = size || 48;
    var id = player && player.id;
    var src = get(id);
    if (src) {
      var img = document.createElement("img");
      img.className = "pl-avatar pl-avatar--photo";
      img.src = src;
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      img.width = size; img.height = size;
      img.style.width = size + "px";
      img.style.height = size + "px";
      return img;
    }
    var span = document.createElement("span");
    span.className = "pl-avatar pl-avatar--initials";
    span.setAttribute("aria-hidden", "true");
    span.textContent = initials(player && player.name);
    span.style.width = size + "px";
    span.style.height = size + "px";
    span.style.fontSize = Math.round(size * 0.4) + "px";
    // A stable hue per name (OKLCH, fixed lightness/chroma so navy text always
    // clears AA — these read the same in light and dark, like the intensity hues).
    span.style.setProperty("--avatar-hue", String(hueFor(player && player.name)));
    return span;
  }

  function initials(name) {
    var parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  // Deterministic 0–359 hue from a name, so a given player keeps one colour.
  function hueFor(name) {
    var s = String(name || "");
    var hash = 0;
    for (var i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) % 360;
    return hash;
  }

  return {
    get: get,
    has: has,
    set: set,
    remove: remove,
    processFile: processFile,
    squareDataUrl: squareDataUrl,
    setFromFile: setFromFile,
    avatar: avatar,
    initials: initials,
    all: all,
    replaceAll: replaceAll,
    SIZE: SIZE
  };
})();
