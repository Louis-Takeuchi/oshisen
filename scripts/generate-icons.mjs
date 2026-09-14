// Delivery-size conversions of the user's complete handwritten logo.
// Keep every letter, the yellow offset and the heart; do not draw a new icon.
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const publicDirectory = new URL("../public/", import.meta.url);
const logoUrl = new URL("brand-logo.png", publicDirectory);
const faviconSizes = [16, 32, 48];
const pngOutputs = [
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
];

/** @param {Buffer} source @param {number} size */
export async function renderLogoIcon(source, size) {
  if (!Number.isInteger(size) || size < 1 || size > 4096) {
    throw new RangeError("Icon size must be an integer between 1 and 4096.");
  }
  return sharp(source)
    .resize(size, size, {
      fit: "contain",
      position: "centre",
      background: "#ffffff",
    })
    .flatten({ background: "#ffffff" })
    .toColourspace("srgb")
    .ensureAlpha()
    .png()
    .toBuffer();
}

/** @param {readonly { size: number, png: Buffer }[]} images */
export function createIco(images) {
  const directory = Buffer.alloc(6 + images.length * 16);
  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(images.length, 4);
  let offset = directory.length;
  images.forEach(({ size, png }, index) => {
    if (!Number.isInteger(size) || size < 1 || size > 256) {
      throw new RangeError("ICO dimensions must be between 1 and 256.");
    }
    const start = 6 + index * 16;
    directory[start] = directory[start + 1] = size === 256 ? 0 : size;
    directory.writeUInt16LE(1, start + 4);
    directory.writeUInt16LE(32, start + 6);
    directory.writeUInt32LE(png.length, start + 8);
    directory.writeUInt32LE(offset, start + 12);
    offset += png.length;
  });
  return Buffer.concat([directory, ...images.map(({ png }) => png)]);
}

export async function generateIcons() {
  // Read and decode the real source before writing any delivery assets.
  const source = await readFile(logoUrl);
  const metadata = await sharp(source).metadata();
  if (metadata.format !== "png" || !metadata.width || !metadata.height) {
    throw new Error(
      "public/brand-logo.png must contain the approved PNG logo.",
    );
  }
  const faviconImages = await Promise.all(
    faviconSizes.map(async (size) => ({
      size,
      png: await renderLogoIcon(source, size),
    })),
  );
  const pngImages = await Promise.all(
    pngOutputs.map(async ([name, size]) => ({
      name: String(name),
      png: await renderLogoIcon(source, Number(size)),
    })),
  );
  await writeFile(
    new URL("favicon.ico", publicDirectory),
    createIco(faviconImages),
  );
  for (const { name, png } of pngImages) {
    await writeFile(new URL(name, publicDirectory), png);
  }
  console.log(
    "Generated 16/32/48, 180, 192 and 512px icons from the complete brand-logo.png artwork.",
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await generateIcons();
}
