// A small code-native monogram: the site's blue and a geometric katakana オ.
// No remote fonts or image service is needed to reproduce these brand assets.
import { writeFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";

const output = new URL("../public/", import.meta.url);
const blue = [36, 85, 255];
const strokes = [
  [7, 12, 25, 12],
  [20, 7, 20, 25],
  [20, 25, 16, 25],
  [19, 13, 7, 23],
];

function onStroke(x, y, [x1, y1, x2, y2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const t = Math.max(
    0,
    Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)),
  );
  return Math.hypot(x - x1 - t * dx, y - y1 - t * dy) <= 1.6;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const bytes = Buffer.concat([Buffer.from(type), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(bytes));
  return Buffer.concat([length, bytes, crc]);
}

function png(size) {
  const samples = 4;
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let white = 0;
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const px = ((x + (sx + 0.5) / samples) * 32) / size;
          const py = ((y + (sy + 0.5) / samples) * 32) / size;
          if (strokes.some((stroke) => onStroke(px, py, stroke))) white++;
        }
      }
      const mix = white / (samples * samples);
      const offset = y * (size * 4 + 1) + 1 + x * 4;
      for (let c = 0; c < 3; c++)
        raw[offset + c] = Math.round(blue[c] * (1 - mix) + 255 * mix);
      raw[offset + 3] = 255;
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const sizes = [16, 32, 48];
const images = sizes.map(png);
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
sizes.forEach((size, i) => {
  const start = 6 + i * 16;
  directory[start] = directory[start + 1] = size;
  directory.writeUInt16LE(1, start + 4);
  directory.writeUInt16LE(32, start + 6);
  directory.writeUInt32LE(images[i].length, start + 8);
  directory.writeUInt32LE(offset, start + 12);
  offset += images[i].length;
});
await writeFile(
  new URL("favicon.ico", output),
  Buffer.concat([directory, ...images]),
);
for (const [name, size] of [
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
]) {
  await writeFile(new URL(name, output), png(size));
}
console.log(
  "Generated favicon (16/32/48), Apple touch icon (180), and web icons (192/512).",
);
