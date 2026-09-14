import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import sharp from "sharp";
import { createIco, renderLogoIcon } from "../scripts/generate-icons.mjs";

test("wide artwork fits completely with white space instead of cropping either edge", async () => {
  const width = 120;
  const height = 40;
  const raw = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = x < width / 2 ? [36, 85, 255, 255] : [255, 90, 170, 255];
      raw.set(color, (y * width + x) * 4);
    }
  }
  const source = await sharp(raw, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();
  const icon = await renderLogoIcon(source, 180);
  const { data, info } = await sharp(icon)
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert.equal(info.width, 180);
  assert.equal(info.height, 180);
  assert.equal(info.channels, 4);
  const pixel = (x: number, y: number) => [
    ...data.subarray((y * info.width + x) * 4, (y * info.width + x) * 4 + 4),
  ];
  assert.deepEqual(pixel(0, 90), [36, 85, 255, 255]);
  assert.deepEqual(pixel(179, 90), [255, 90, 170, 255]);
  assert.deepEqual(pixel(0, 0), [255, 255, 255, 255]);
  assert.deepEqual(pixel(179, 179), [255, 255, 255, 255]);
});

test("ICO container retains each supplied PNG at the declared size", async () => {
  const source = await sharp({
    create: { width: 60, height: 20, channels: 4, background: "#2455ff" },
  })
    .png()
    .toBuffer();
  const images = await Promise.all(
    [16, 32, 48].map(async (size) => ({
      size,
      png: await renderLogoIcon(source, size),
    })),
  );
  const ico = createIco(images);
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), images.length);
  for (const [index, { size, png }] of images.entries()) {
    const entry = 6 + index * 16;
    assert.equal(ico[entry], size);
    assert.equal(ico[entry + 1], size);
    const length = ico.readUInt32LE(entry + 8);
    const offset = ico.readUInt32LE(entry + 12);
    assert.deepEqual(ico.subarray(offset, offset + length), png);
  }
});

test("published icon assets are conversions of the complete current user logo", async () => {
  const source = await readFile(
    new URL("../public/brand-logo.png", import.meta.url),
  );
  for (const [name, size] of [
    ["apple-touch-icon.png", 180],
    ["icon-192.png", 192],
    ["icon-512.png", 512],
  ] as const) {
    const published = await readFile(
      new URL(`../public/${name}`, import.meta.url),
    );
    const expected = await renderLogoIcon(source, size);
    const metadata = await sharp(published).metadata();
    assert.equal(metadata.width, size, name);
    assert.equal(metadata.height, size, name);
    assert.deepEqual(
      await sharp(published).raw().toBuffer(),
      await sharp(expected).raw().toBuffer(),
      name,
    );
  }
  const ico = await readFile(new URL("../public/favicon.ico", import.meta.url));
  for (const [index, size] of [16, 32, 48].entries()) {
    const entry = 6 + index * 16;
    const length = ico.readUInt32LE(entry + 8);
    const offset = ico.readUInt32LE(entry + 12);
    const expected = await renderLogoIcon(source, size);
    assert.deepEqual(
      await sharp(ico.subarray(offset, offset + length))
        .raw()
        .toBuffer(),
      await sharp(expected).raw().toBuffer(),
      `${size}px favicon`,
    );
  }
});
