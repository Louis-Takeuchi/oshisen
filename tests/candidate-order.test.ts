import assert from "node:assert/strict";
import { test } from "node:test";
import type { Candidate } from "../lib/data.ts";
import {
  getCandidateOrderGroups,
  type OfficialCandidateOrder,
} from "../lib/candidate-order.ts";

const candidate = (
  id: string,
  kana: string,
  district = "つくば市選挙区",
): Candidate => ({
  id,
  name: id,
  kana,
  district,
  age: null,
  party: null,
  status: null,
  policyAnswers: {},
});
const records = [
  candidate("a", "あ"),
  candidate("b", "い"),
  candidate("c", "う"),
];
const official: OfficialCandidateOrder = {
  district: "つくば市選挙区",
  candidateIds: ["c", "unlisted", "b", "a"],
  sourceUrl: "https://example.invalid/official-list",
  verifiedAt: "2026-10-10",
};

test("official filing order wins over names and survives search/save/compare filtering", () => {
  const groups = getCandidateOrderGroups(records, [official]);
  assert.deepEqual(
    groups[0].candidates.map((item) => item.id),
    ["c", "b", "a"],
  );
  assert.deepEqual(groups[0].official, official);
  const filtered = groups[0].candidates.filter((item) =>
    ["a", "c"].includes(item.id),
  );
  assert.deepEqual(
    filtered.map((item) => item.id),
    ["c", "a"],
  );
  assert.deepEqual(
    records.map((item) => item.id),
    ["a", "b", "c"],
  );
});

test("partial, duplicate or unverified lists keep the whole district provisional", () => {
  for (const orders of [
    [],
    [{ ...official, candidateIds: ["c", "a"] }],
    [{ ...official, candidateIds: ["c", "b", "a", "a"] }],
    [{ ...official, sourceUrl: "javascript:alert(1)" }],
    [{ ...official, sourceUrl: "https://user:password@example.invalid" }],
    [{ ...official, verifiedAt: "" }],
    [{ ...official, verifiedAt: "2026-02-30" }],
    [official, official],
  ]) {
    const [group] = getCandidateOrderGroups([...records].reverse(), orders);
    assert.equal(group.official, undefined);
    assert.deepEqual(
      group.candidates.map((item) => item.id),
      ["a", "b", "c"],
    );
  }
});

test("districts retain project order and each district resolves its own filing order", () => {
  const groups = getCandidateOrderGroups(
    [
      candidate("t2", "い", "土浦市選挙区"),
      ...records,
      candidate("t1", "あ", "土浦市選挙区"),
    ],
    [official],
  );
  assert.deepEqual(
    groups.map((group) => group.district),
    ["つくば市選挙区", "土浦市選挙区"],
  );
  assert.deepEqual(
    groups.flatMap((group) => group.candidates.map((item) => item.id)),
    ["c", "b", "a", "t1", "t2"],
  );
  assert.equal(groups[1].official, undefined);
  assert.deepEqual(getCandidateOrderGroups([], [official]), []);
});
