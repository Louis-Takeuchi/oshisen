import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import sharp from "sharp";
import {
  importTeamPhoto,
  stripJpegPrivateMetadata,
} from "../scripts/import-team-photo.mjs";

test("published team portraits retain their original dimensions without private metadata", async () => {
  for (const [member, width, height] of [
    ["oya", 815, 930],
    ["takeuchi", 814, 1440],
  ] as const) {
    const image = await readFile(
      new URL(`../public/team/${member}.jpg`, import.meta.url),
    );
    const metadata = await sharp(image).metadata();
    assert.equal(metadata.format, "jpeg", member);
    assert.equal(metadata.width, width, member);
    assert.equal(metadata.height, height, member);
    assert.equal(metadata.exif, undefined, member);
    assert.equal(metadata.xmp, undefined, member);
    assert.equal(metadata.iptc, undefined, member);
    // Also detects comment or private application segments sharp does not expose.
    assert.deepEqual(stripJpegPrivateMetadata(image), image, member);
    assert.ok((await sharp(image).raw().toBuffer()).length > 0, member);
  }
});

test("metadata stripping preserves all existing JPEG bytes and decoded pixels", async () => {
  const image = await readFile(
    new URL("../public/team/oya.jpg", import.meta.url),
  );
  const segment = (marker: number, text: string) => {
    const payload = Buffer.from(text);
    const header = Buffer.from([0xff, marker, 0, 0]);
    header.writeUInt16BE(payload.length + 2, 2);
    return Buffer.concat([header, payload]);
  };
  const annotated = Buffer.concat([
    image.subarray(0, 2),
    segment(0xe1, "Exif\0\0sample private data"),
    segment(0xe1, "http://ns.adobe.com/xap/1.0/\0sample XMP data"),
    segment(0xed, "Photoshop 3.0\0sample IPTC data"),
    segment(0xfe, "sample private comment"),
    image.subarray(2),
  ]);
  const stripped = stripJpegPrivateMetadata(annotated);
  assert.deepEqual(stripped, image);
  assert.deepEqual(
    await sharp(stripped).raw().toBuffer(),
    await sharp(image).raw().toBuffer(),
  );
});

test("JPEG metadata stripping rejects incomplete files, invalid segments and trailing data", async () => {
  const image = await readFile(
    new URL("../public/team/oya.jpg", import.meta.url),
  );
  for (const invalid of [
    Buffer.alloc(0),
    Buffer.from("not a JPEG"),
    Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
    Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0, 1]),
    Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0, 10, 1]),
    image.subarray(0, image.length - 2),
    Buffer.concat([image, Buffer.from("trailing data")]),
  ]) {
    assert.throws(() => stripJpegPrivateMetadata(invalid), /valid JPEG/);
  }
});

test("portrait import accepts only the two fixed member IDs and never overwrites files", async () => {
  await assert.rejects(importTeamPhoto("unused", "../outside"), /Member must/);
  await assert.rejects(
    importTeamPhoto(
      new URL("../public/team/oya.jpg", import.meta.url).pathname,
      "oya",
    ),
    { code: "EEXIST" },
  );
});
