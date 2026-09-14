import assert from "node:assert/strict";
import { test } from "node:test";
import { candidates, questions } from "../lib/data.ts";
import {
  MAX_VIDEO_START_SECONDS,
  buildYouTubeTimestampUrl,
  formatVideoTimestamp,
  getPolicyEvidence,
  getVerifiedPolicyVideoUrl,
  isEvidenceDate,
  isPublishablePolicyEvidence,
  policyEvidence,
  type PolicyEvidenceRegistry,
  type VerifiedPolicyEvidence,
} from "../lib/policy-evidence.ts";

/** Test fixtures only. These values are never registered as public content. */
const verified: VerifiedPolicyEvidence = {
  verification: "verified",
  provenance: "candidate_answer",
  text: "TEST ONLY",
  source: {
    label: "TEST SOURCE",
    title: "TEST DOCUMENT",
    url: "https://example.invalid/policy",
    kind: "official_site",
  },
  answeredOn: "2000-02-28",
  publishedOn: "2000-02-29",
  checkedOn: "2000-03-01",
};

test("all current candidate/question pairs lack real evidence", () => {
  for (const candidate of candidates) {
    for (const question of questions) {
      assert.equal(getPolicyEvidence(candidate.id, question.id), null);
    }
    assert.deepEqual(policyEvidence[candidate.id], {});
  }
});

test("lookup requires a known candidate, known question and an own reference", () => {
  const registry: PolicyEvidenceRegistry = {
    ...policyEvidence,
    "sato-misaki": { transport: verified },
  };
  assert.equal(
    getPolicyEvidence("sato-misaki", "transport", registry),
    verified,
  );
  for (const id of ["unknown", "constructor", "__proto__", ""]) {
    assert.equal(getPolicyEvidence(id, "transport", registry), null);
    assert.equal(getPolicyEvidence("sato-misaki", id, registry), null);
  }
  assert.equal(getPolicyEvidence("sato-misaki", "education", registry), null);
  assert.equal(getPolicyEvidence("yamada-taro", "transport", registry), null);
  const inherited = {
    ...policyEvidence,
    "sato-misaki": Object.create({ transport: verified }),
  };
  assert.equal(getPolicyEvidence("sato-misaki", "transport", inherited), null);
});

test("verification, provenance and source fields are required before publication", () => {
  assert.equal(isPublishablePolicyEvidence(verified), true);
  for (const entry of [
    null,
    {},
    { verification: "unavailable" },
    { ...verified, verification: "pending" },
    { ...verified, provenance: "inferred" },
    { ...verified, text: "  " },
    { ...verified, source: undefined },
    { ...verified, source: { ...verified.source, title: "" } },
    { ...verified, source: { ...verified.source, kind: "unknown" } },
    { ...verified, source: { ...verified.source, url: "javascript:alert(1)" } },
    {
      ...verified,
      source: { ...verified.source, url: "https://user:pass@example.invalid" },
    },
    { ...verified, answeredOn: null },
    { ...verified, provenance: "public_document", answeredOn: "2000-01-01" },
    { ...verified, provenance: "editorial_summary", answeredOn: "2000-01-01" },
  ])
    assert.equal(isPublishablePolicyEvidence(entry), false);
  for (const provenance of ["public_document", "editorial_summary"]) {
    assert.equal(
      isPublishablePolicyEvidence({
        ...verified,
        provenance,
        answeredOn: null,
      }),
      true,
    );
  }
});

test("calendar validation rejects invalid, missing, future or inconsistent checked dates", () => {
  assert.equal(isEvidenceDate("2000-02-29"), true);
  for (const date of [
    "1900-02-29",
    "2001-02-29",
    "2000-04-31",
    "2000-13-01",
    "2000-01-00",
    "2000-1-1",
    "yesterday",
    "2000-01-01T00:00:00Z",
    null,
  ]) {
    assert.equal(isEvidenceDate(date), false);
  }
  for (const entry of [
    { ...verified, checkedOn: null },
    { ...verified, checkedOn: "9999-01-01" },
    { ...verified, checkedOn: "2000-02-01" },
    { ...verified, answeredOn: "2000-04-31" },
    { ...verified, publishedOn: "2000-03-02" },
    { ...verified, publishedOn: undefined },
  ])
    assert.equal(isPublishablePolicyEvidence(entry), false);
  assert.equal(
    isPublishablePolicyEvidence({ ...verified, publishedOn: null }),
    true,
  );
});

test("YouTube timestamp links canonicalize supported hosts and discard tracking data", () => {
  const expected = "https://www.youtube.com/watch?v=abcdefghijk&t=125s";
  for (const url of [
    "https://youtube.com/watch?v=abcdefghijk",
    "https://www.youtube.com/watch?v=abcdefghijk&list=discard&t=1#discard",
    "https://youtu.be/abcdefghijk?si=discard",
  ])
    assert.equal(buildYouTubeTimestampUrl(url, 125), expected);
  assert.equal(
    buildYouTubeTimestampUrl("https://youtu.be/abcdefghijk", 0),
    "https://www.youtube.com/watch?v=abcdefghijk&t=0s",
  );
  assert.equal(
    buildYouTubeTimestampUrl(
      "https://youtu.be/abcdefghijk",
      MAX_VIDEO_START_SECONDS,
    ),
    `https://www.youtube.com/watch?v=abcdefghijk&t=${MAX_VIDEO_START_SECONDS}s`,
  );
});

test("YouTube links reject spoofed, credentialed, non-watch and invalid URLs", () => {
  for (const url of [
    "http://youtube.com/watch?v=abcdefghijk",
    "javascript:alert(1)",
    "//youtube.com/watch?v=abcdefghijk",
    "https://youtube.com.evil.invalid/watch?v=abcdefghijk",
    "https://youtube.com@evil.invalid/watch?v=abcdefghijk",
    "https://user:pass@youtube.com/watch?v=abcdefghijk",
    "https://youtube.com./watch?v=abcdefghijk",
    "https://youtube.com:444/watch?v=abcdefghijk",
    "https://m.youtube.com/watch?v=abcdefghijk",
    "https://youtube.com/redirect?v=abcdefghijk",
    "https://youtube.com/embed/abcdefghijk",
    "https://youtube.com/watch?v=abcdefghijk&v=12345678901",
    "https://youtube.com/watch",
    "https://youtu.be/short",
    "https://youtu.be/abcdefghijkl",
    "https://youtu.be/abcdefghijk/extra",
    "https://youtu.be/abcdefghij%2F",
    " https://youtu.be/abcdefghijk",
    "https://you\ntube.com/watch?v=abcdefghijk",
    "https://youtube.com\\@evil.invalid/watch?v=abcdefghijk",
  ])
    assert.equal(buildYouTubeTimestampUrl(url, 0), null, url);
  for (const seconds of [-1, 1.5, NaN, Infinity, MAX_VIDEO_START_SECONDS + 1]) {
    assert.equal(
      buildYouTubeTimestampUrl("https://youtu.be/abcdefghijk", seconds),
      null,
    );
  }
});

test("video verification is independent; missing and unchecked video stay hidden", () => {
  const video = {
    verification: "verified",
    title: "TEST VIDEO",
    url: "https://youtu.be/abcdefghijk",
    startSeconds: 65,
    publishedOn: null,
    checkedOn: "2000-01-01",
  };
  assert.equal(
    getVerifiedPolicyVideoUrl(video),
    "https://www.youtube.com/watch?v=abcdefghijk&t=65s",
  );
  for (const value of [
    undefined,
    null,
    {},
    { ...video, verification: "pending" },
    { ...video, checkedOn: null },
    { ...video, publishedOn: "2000-01-02" },
    { ...video, title: "" },
    { ...video, startSeconds: "65" },
    { ...video, url: "https://example.invalid" },
  ]) {
    assert.equal(getVerifiedPolicyVideoUrl(value), null);
  }
  assert.equal(
    isPublishablePolicyEvidence({
      ...verified,
      video: { ...video, verification: "pending" },
    }),
    true,
  );
});

test("timestamp labels are legible and reject invalid ranges", () => {
  assert.equal(formatVideoTimestamp(0), "0:00");
  assert.equal(formatVideoTimestamp(65), "1:05");
  assert.equal(formatVideoTimestamp(3661), "1:01:01");
  assert.equal(formatVideoTimestamp(-1), "");
  assert.equal(formatVideoTimestamp(1.5), "");
});
