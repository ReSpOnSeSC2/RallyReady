// generate-icons.js — LOCAL, offline PWA icon generator (no internet, no npm).
//
// Builds the three app icons under ../icons from pure math using only Node's
// built-in `zlib` (for PNG compression) and `fs`. It rasterizes simple vector
// primitives — a rounded coral tile, a white volleyball line motif, and a bold
// white "RR" wordmark — with 4x4 supersampled anti-aliasing, then encodes a
// valid 8-bit RGBA PNG by hand.
//
//   node scripts/generate-icons.js
//
// Outputs:
//   icons/icon-192.png          rounded square, purpose "any"
//   icons/icon-512.png          rounded square, purpose "any"
//   icons/icon-512-maskable.png full-bleed square, purpose "maskable"
//
// This is a build-time tool, NOT part of the shipped app (the app stays vanilla
// HTML/CSS/JS with no build step); the committed PNGs are what the PWA uses.
"use strict";

const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

// ---- Brand colour (exact value from the brief) ----------------------------
const CORAL = [255, 107, 53]; // #FF6B35
const WHITE = [255, 255, 255];

// ======================================================================== //
//  Geometry — all in a normalized [0,1] x [0,1] square, y pointing DOWN.    //
//  A point is "white" if it lands on the ball ring, a seam, or an R glyph.  //
// ======================================================================== //

// Volleyball centre + radius, sitting in the upper portion of the tile.
const BALL = { cx: 0.5, cy: 0.355, r: 0.165, stroke: 0.027 };

// Three curved seams: arcs of circles whose nearest approach bulges toward the
// ball centre, giving the classic 3-panel volleyball look (120° apart).
const SEAMS = [90, 210, 330].map(function (deg) {
  const a = (deg * Math.PI) / 180;
  const dist = 0.30; // how far each arc's centre sits from the ball centre
  const rho = 0.235; // each arc's radius (dist - rho = bulge toward centre)
  return {
    cx: BALL.cx + dist * Math.cos(a),
    cy: BALL.cy + dist * Math.sin(a),
    r: rho,
    half: 0.0115 // half stroke width
  };
});

function dist(x, y, cx, cy) {
  const dx = x - cx, dy = y - cy;
  return Math.sqrt(dx * dx + dy * dy);
}

// Shortest distance from point (px,py) to segment A->B.
function distToSegment(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay;
  const wx = px - ax, wy = py - ay;
  const len2 = vx * vx + vy * vy;
  let t = len2 ? (wx * vx + wy * vy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * vx, cy = ay + t * vy;
  return dist(px, py, cx, cy);
}

// One bold "R" in its own [0,1] glyph box (y down): a left stem, a top bowl
// (an annulus clipped at mid-height), and a diagonal leg.
function inGlyphR(lx, ly) {
  if (lx < 0 || lx > 1 || ly < 0 || ly > 1) return false;

  // Left vertical stem.
  if (lx <= 0.30) return true;

  // Top bowl: ring between an outer and inner circle, clipped to the top half.
  const dOuter = dist(lx, ly, 0.30, 0.30);
  if (dOuter <= 0.42 && dist(lx, ly, 0.30, 0.30) >= 0.16 && ly <= 0.55) return true;

  // Diagonal leg from the stem/bowl junction down to the baseline.
  if (distToSegment(lx, ly, 0.30, 0.52, 0.74, 1.0) <= 0.16) return true;

  return false;
}

// The "RR" wordmark: two R glyphs centred below the ball.
const WORD = (function () {
  const top = 0.55, height = 0.265;
  const gw = height * 0.66;   // glyph width derived from its height
  const gap = 0.045;
  const total = 2 * gw + gap;
  const left = 0.5 - total / 2;
  return { top: top, height: height, gw: gw, gap: gap, left: left };
})();

function inWordmark(x, y) {
  if (y < WORD.top || y > WORD.top + WORD.height) return false;
  const ly = (y - WORD.top) / WORD.height;
  for (let i = 0; i < 2; i++) {
    const gx = WORD.left + i * (WORD.gw + WORD.gap);
    if (x >= gx && x <= gx + WORD.gw) {
      if (inGlyphR((x - gx) / WORD.gw, ly)) return true;
    }
  }
  return false;
}

// Is this point part of the white motif (ball ring OR seam OR wordmark)?
function isWhite(x, y) {
  // Ball ring (outline).
  const dBall = dist(x, y, BALL.cx, BALL.cy);
  if (Math.abs(dBall - BALL.r) <= BALL.stroke / 2) return true;

  // Seams — only the portion that falls comfortably inside the ring.
  if (dBall <= BALL.r - BALL.stroke * 0.9) {
    for (let i = 0; i < SEAMS.length; i++) {
      const s = SEAMS[i];
      if (Math.abs(dist(x, y, s.cx, s.cy) - s.r) <= s.half) return true;
    }
  }

  // Wordmark.
  if (inWordmark(x, y)) return true;

  return false;
}

// Rounded-square signed-distance test for the "any" tiles (radius as a fraction
// of the tile). Returns true when the point is inside the rounded square.
function insideRoundedSquare(x, y, radius) {
  const qx = Math.abs(x - 0.5) - (0.5 - radius);
  const qy = Math.abs(y - 0.5) - (0.5 - radius);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const d = outside + Math.min(Math.max(qx, qy), 0) - radius;
  return d <= 0;
}

// Straight RGBA (a in 0..1) for a single sample point, compositing white motif
// over the coral tile. `maskable` fills the whole square; otherwise a rounded
// square with transparent corners.
function sampleColor(x, y, maskable) {
  const onTile = maskable ? true : insideRoundedSquare(x, y, 0.22);
  if (!onTile) return [0, 0, 0, 0];
  if (isWhite(x, y)) return [WHITE[0], WHITE[1], WHITE[2], 1];
  return [CORAL[0], CORAL[1], CORAL[2], 1];
}

// ======================================================================== //
//  Rasterizer — 4x4 supersampling, premultiplied averaging for clean edges. //
// ======================================================================== //
function render(size, maskable) {
  const SS = 4;                       // samples per axis
  const buf = Buffer.alloc(size * size * 4);
  const step = 1 / (size * SS);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let aR = 0, aG = 0, aB = 0, aA = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const nx = (px * SS + sx + 0.5) * step;
          const ny = (py * SS + sy + 0.5) * step;
          const c = sampleColor(nx, ny, maskable);
          aR += c[0] * c[3];
          aG += c[1] * c[3];
          aB += c[2] * c[3];
          aA += c[3];
        }
      }
      const n = SS * SS;
      const off = (py * size + px) * 4;
      if (aA > 0) {
        buf[off] = Math.round(aR / aA);
        buf[off + 1] = Math.round(aG / aA);
        buf[off + 2] = Math.round(aB / aA);
        buf[off + 3] = Math.round((aA / n) * 255);
      } // else stays fully transparent (0,0,0,0)
    }
  }
  return buf;
}

// ======================================================================== //
//  Minimal PNG encoder (8-bit RGBA, filter 0) using zlib + a CRC32 table.   //
// ======================================================================== //
const CRC_TABLE = (function () {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // colour type 6 = truecolour + alpha
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  // Prefix each scanline with filter byte 0 (none).
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

// ======================================================================== //
//  Write the three icons.                                                  //
// ======================================================================== //
const outDir = path.join(__dirname, "..", "icons");
fs.mkdirSync(outDir, { recursive: true });

const targets = [
  { file: "icon-192.png", size: 192, maskable: false },
  { file: "icon-512.png", size: 512, maskable: false },
  { file: "icon-512-maskable.png", size: 512, maskable: true }
];

targets.forEach(function (t) {
  const png = encodePNG(t.size, render(t.size, t.maskable));
  const dest = path.join(outDir, t.file);
  fs.writeFileSync(dest, png);
  console.log("wrote " + dest + " (" + png.length + " bytes)");
});
