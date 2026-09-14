// Import a supplied portrait without editing, cropping, or re-encoding its pixels.
// Only EXIF/XMP, IPTC and comment segments are removed before publication.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const teamDirectory = new URL("../public/team/", import.meta.url);
const members = new Set(["oya", "takeuchi"]);
const privateMarkers = new Set([0xe1, 0xed, 0xfe]);

/**
 * Preserve JPEG image and colour-profile segments byte-for-byte, including
 * progressive scans. Reject malformed or trailing data instead of guessing.
 * @param {Buffer} source
 * @returns {Buffer}
 */
export function stripJpegPrivateMetadata(source) {
  const malformed = () => new Error("A complete, valid JPEG file is required.");
  if (source.length < 4 || source[0] !== 0xff || source[1] !== 0xd8) {
    throw malformed();
  }

  const segments = [source.subarray(0, 2)];
  let offset = 2;
  let hasScan = false;

  while (offset < source.length) {
    const markerStart = offset;
    if (source[offset++] !== 0xff) throw malformed();
    while (source[offset] === 0xff) offset++;
    if (offset >= source.length) throw malformed();
    const marker = source[offset++];

    if (marker === 0xd9) {
      if (!hasScan || offset !== source.length) throw malformed();
      segments.push(source.subarray(markerStart, offset));
      return Buffer.concat(segments);
    }
    if (
      marker === 0x00 ||
      marker === 0xd8 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      throw malformed();
    }
    if (marker === 0x01) {
      segments.push(source.subarray(markerStart, offset));
      continue;
    }
    if (offset + 2 > source.length) throw malformed();
    const length = source.readUInt16BE(offset);
    if (length < 2 || offset + length > source.length) throw malformed();
    offset += length;
    if (!privateMarkers.has(marker)) {
      segments.push(source.subarray(markerStart, offset));
    }

    if (marker === 0xda) {
      hasScan = true;
      const scanStart = offset;
      while (offset < source.length) {
        if (source[offset] !== 0xff) {
          offset++;
          continue;
        }
        const possibleMarker = offset;
        while (source[offset] === 0xff) offset++;
        if (offset >= source.length) throw malformed();
        const next = source[offset];
        if (next === 0x00 || (next >= 0xd0 && next <= 0xd7)) {
          offset++;
          continue;
        }
        offset = possibleMarker;
        break;
      }
      segments.push(source.subarray(scanStart, offset));
    }
  }
  throw malformed();
}

/** @param {string} sourcePath @param {string} memberId */
export async function importTeamPhoto(sourcePath, memberId) {
  if (!members.has(memberId)) {
    throw new Error("Member must be oya or takeuchi.");
  }
  const original = await readFile(sourcePath);
  const originalMetadata = await sharp(original).metadata();
  if (
    originalMetadata.format !== "jpeg" ||
    !originalMetadata.width ||
    !originalMetadata.height ||
    (originalMetadata.orientation !== undefined &&
      originalMetadata.orientation !== 1)
  ) {
    throw new Error(
      "Use a JPEG portrait already stored in its upright orientation.",
    );
  }
  const published = stripJpegPrivateMetadata(original);
  const publishedMetadata = await sharp(published).metadata();
  if (
    publishedMetadata.width !== originalMetadata.width ||
    publishedMetadata.height !== originalMetadata.height ||
    publishedMetadata.exif ||
    publishedMetadata.xmp ||
    publishedMetadata.iptc
  ) {
    throw new Error("Portrait dimensions or metadata validation failed.");
  }
  const [before, after] = await Promise.all([
    sharp(original).raw().toBuffer(),
    sharp(published).raw().toBuffer(),
  ]);
  if (!before.equals(after)) {
    throw new Error("Portrait pixels changed; no file was written.");
  }

  await mkdir(teamDirectory, { recursive: true });
  const filename = `${memberId}.jpg`;
  // Exclusive creation protects both existing public files and the originals.
  await writeFile(new URL(filename, teamDirectory), published, { flag: "wx" });
  return {
    path: `public/team/${filename}`,
    width: publishedMetadata.width,
    height: publishedMetadata.height,
    bytes: published.length,
  };
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const [, , sourcePath, memberId, extra] = process.argv;
  if (!sourcePath || !memberId || extra) {
    throw new Error(
      "Usage: node scripts/import-team-photo.mjs <source.jpg> <oya|takeuchi>",
    );
  }
  const imported = await importTeamPhoto(sourcePath, memberId);
  console.log(
    `${imported.path}: ${imported.width} x ${imported.height}, ${imported.bytes} bytes; metadata stripped, pixels unchanged.`,
  );
}
