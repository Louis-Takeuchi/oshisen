// Deterministic delivery conversion only; preserve the approved source artwork and icons.
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const sourceUrl = new URL("../public/brand-logo.png", import.meta.url);
const outputUrl = new URL("../public/brand-logo.webp", import.meta.url);
const source = await readFile(sourceUrl);
const sourceMetadata = await sharp(source).metadata();
if (
  sourceMetadata.format !== "png" ||
  !sourceMetadata.width ||
  !sourceMetadata.height
) {
  throw new Error("public/brand-logo.png must be the approved PNG logo.");
}

const output = await sharp(source)
  .resize({ width: 1080, withoutEnlargement: true })
  .toColourspace("srgb")
  .webp({ quality: 90, alphaQuality: 100, effort: 6 })
  .toBuffer();
await writeFile(outputUrl, output);
const { width, height } = await sharp(output).metadata();
console.log(
  `brand-logo.webp: ${width}×${height}, ${output.byteLength} bytes; ` +
    `${(100 * (1 - output.byteLength / source.byteLength)).toFixed(1)}% smaller than the unchanged PNG.`,
);
