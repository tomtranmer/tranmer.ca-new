// Generates the site's favicon and app icon set ("Signal Blue": the TWS power
// mark, white on a blue gradient). Run with `npm run icons` after changing the
// design below; outputs are committed.
//
//   app/favicon.ico                 16/32/48, heavy stroke for small sizes
//   app/icon.svg                    browser tab icon (Next adds the <link>)
//   app/apple-icon.png              180, full-bleed square (iOS rounds it)
//   public/icons/pwa/icon-{192,512}.png           rounded tile, purpose "any"
//   public/icons/pwa/icon-{192,512}-maskable.png  full bleed, mark in safe zone
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = (p) => path.join(ROOT, p);

// The power mark on a 512 canvas: an open ring plus a round-capped stem.
function mark(weight) {
  const r = 142, cx = 256, cy = 280, gap = (38 * Math.PI) / 180;
  const x1 = (cx + r * Math.sin(gap)).toFixed(1);
  const x2 = (cx - r * Math.sin(gap)).toFixed(1);
  const y = (cy - r * Math.cos(gap)).toFixed(1);
  return (
    `<path d="M${x1} ${y}A${r} ${r} 0 1 1 ${x2} ${y}" fill="none" stroke="#fff" stroke-width="${weight}"/>` +
    `<line x1="256" y1="96" x2="256" y2="${cy - 18}" stroke="#fff" stroke-width="${weight}" stroke-linecap="round"/>`
  );
}

// small: heavier stroke and a larger mark so the ring stays open at 16px.
// radius: tile corner radius (0 for full-bleed icons the platform masks).
function icon({ small = false, radius = 112 }) {
  const weight = small ? 76 : 56;
  const scale = small ? 0.84 : 0.74;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#4f8ff7"/><stop offset="1" stop-color="#1d4ed8"/>` +
    `</linearGradient></defs>` +
    `<rect width="512" height="512" rx="${radius}" fill="url(#g)"/>` +
    `<g transform="translate(256 262) scale(${scale}) translate(-256 -262)">${mark(weight)}</g>` +
    `</svg>`
  );
}

const png = (svg, size) =>
  sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

// ICO container holding PNG images (supported by every current browser).
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + dir.length;
  images.forEach(({ size, data }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt16LE(1, o + 4); // colour planes
    dir.writeUInt16LE(32, o + 6); // bits per pixel
    dir.writeUInt32LE(data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...images.map((i) => i.data)]);
}

const tile = icon({});
const smallTile = icon({ small: true, radius: 104 });
const fullBleed = icon({ radius: 0 });

fs.writeFileSync(out("app/icon.svg"), smallTile + "\n");
fs.writeFileSync(
  out("app/favicon.ico"),
  ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(smallTile, size) })))),
);
fs.writeFileSync(out("app/apple-icon.png"), await png(fullBleed, 180));
for (const size of [192, 512]) {
  fs.writeFileSync(out(`public/icons/pwa/icon-${size}.png`), await png(tile, size));
  fs.writeFileSync(out(`public/icons/pwa/icon-${size}-maskable.png`), await png(fullBleed, size));
}
console.log("Icons written.");
