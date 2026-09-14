import assert from "node:assert/strict";
import { test } from "node:test";
import { answerOptions, questions, type AnswerMap } from "../lib/data.ts";
import {
  answerLabel,
  comparisonRows,
  selectComparisonCandidates,
} from "../lib/comparison.ts";

test("comparison preserves published question order and both sides of the scale", () => {
  const rows = comparisonRows(
    { transport: 4, education: 0, childcare: 3, healthcare: 2 },
    { transport: 0, education: 4, childcare: 2, healthcare: 2 },
  );
  assert.deepEqual(
    rows.map((row) => row.question.id),
    questions.map((q) => q.id),
  );
  assert.deepEqual(
    rows.slice(0, 4).map((row) => row.distance),
    [4, 4, 1, 0],
  );
  assert.deepEqual(
    rows.slice(0, 4).map((row) => row.isDifferent),
    [true, true, false, false],
  );
});

test("two-step differences are included without treating missing as disagreement", () => {
  const rows = comparisonRows(
    { transport: 3, education: null, childcare: 0, healthcare: 2 },
    { transport: 1, education: 4, childcare: null },
  );
  assert.equal(rows[0].distance, 2);
  assert.equal(rows[0].isDifferent, true);
  for (const row of rows.slice(1)) {
    assert.equal(row.distance, null);
    assert.equal(row.isDifferent, false);
  }
  assert.equal(rows[1].left, null);
  assert.equal(rows[1].right, 4);
  assert.equal(rows[2].left, 0, "zero is a valid response, not missing");
});

test("invalid answers and unknown question ids never become valid policy positions", () => {
  const invalid = {
    transport: 5,
    education: -1,
    childcare: 2.5,
    healthcare: "4",
    disaster: Number.NaN,
    environment: false,
    unknown: 4,
  } as unknown as AnswerMap;
  const rows = comparisonRows(invalid, invalid);
  assert.equal(rows.length, questions.length);
  assert.ok(rows.every((row) => row.left === null && row.right === null));
  assert.ok(rows.every((row) => row.distance === null && !row.isDifferent));
});

test("candidate columns use canonical kana order, de-duplicate, and cap at two", () => {
  assert.deepEqual(
    selectComparisonCandidates(["takahashi-ken", "sato-misaki"]).map(
      (c) => c.id,
    ),
    ["sato-misaki", "takahashi-ken"],
  );
  assert.deepEqual(
    selectComparisonCandidates(["unknown", "tanaka-aya", "tanaka-aya"]).map(
      (c) => c.id,
    ),
    ["tanaka-aya"],
  );
  assert.deepEqual(
    selectComparisonCandidates([
      "yamada-taro",
      "takahashi-ken",
      "sato-misaki",
    ]).map((c) => c.id),
    ["sato-misaki", "takahashi-ken"],
  );
  assert.deepEqual(selectComparisonCandidates([]), []);
});

test("comparison labels use the same five response options as the questionnaire", () => {
  for (const option of answerOptions)
    assert.equal(answerLabel(option.value), option.label);
  for (const value of [null, undefined, 5, -1, "4"])
    assert.equal(answerLabel(value), "未掲載");
});
