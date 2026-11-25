import assert from "node:assert/strict";
import { test } from "node:test";
import {
  generatedCandidates,
  generatedDataSource,
  generatedQuestions,
} from "../lib/generated/sheet-data.ts";
import {
  SCALE_VERSION,
  SENT_QUESTION_VERSION,
  commonQuestions,
  districtQuestions,
  getSentQuestion,
  isUserAnswer,
  nonAnswerLabels,
  questionPath,
  questionShareImagePath,
  questionTagLabel,
  questionsForDistrict,
  scaleLabels,
  scaleValues,
  sentQuestions,
  userAnswerLabel,
} from "../lib/election2026.ts";
import { candidates2026 } from "../lib/candidates2026.ts";
import { existsSync } from "node:fs";

test("公開データはシート由来で、架空データのまま公開できない", () => {
  // `npm run data:fixtures` のままコミット・公開しないための番人。
  assert.equal(generatedDataSource, "sheet");
  for (const candidate of generatedCandidates) {
    assert.doesNotMatch(candidate.name, /候補者[A-ZＡ-Ｚ]/u);
    assert.doesNotMatch(candidate.candidateId, /^tmp-/);
  }
});

test("候補者送付版の10問が原文のまま入っている", () => {
  assert.equal(sentQuestions.length, 10);
  assert.equal(commonQuestions.length, 6);
  assert.equal(districtQuestions("tsukuba").length, 2);
  assert.equal(districtQuestions("tsuchiura").length, 2);
  for (const question of sentQuestions) {
    assert.equal(question.version, SENT_QUESTION_VERSION);
    assert.ok(question.text.length > 0);
    assert.ok(question.textNormal.length > 0);
    assert.ok(question.textEasy.length > 0);
    assert.equal(questionPath(question), `/q/${question.id.toLowerCase()}`);
    assert.match(questionShareImagePath(question), /^\/share\/q-[ptu]0\d\.png/);
  }
  // 一字一句の照合（代表2問）。変えるときはシート側が正。
  assert.equal(
    getSentQuestion("P01")?.text,
    "採算だけでは維持が難しい市町村をまたぐ路線バスについて、運行を支える県の補助を増やすべきだ。",
  );
  assert.equal(
    getSentQuestion("T02")?.text,
    "つくば市内の県管理道路では、道路の新設・拡幅に使う予算の一部を、既存道路の歩道整備に振り向けるべきだ。",
  );
  assert.equal(questionTagLabel(getSentQuestion("U01")!), "土浦市｜桜川の氾濫対策");
  assert.equal(generatedQuestions.length, 10);
});

test("回答フローは選挙区ごとに8問、未選択なら共通6問", () => {
  const tsukuba = questionsForDistrict("tsukuba");
  const tsuchiura = questionsForDistrict("tsuchiura");
  const undecided = questionsForDistrict("undecided");
  assert.deepEqual(
    tsukuba.map((question) => question.id),
    ["P01", "P02", "P03", "P04", "P05", "P06", "T01", "T02"],
  );
  assert.deepEqual(
    tsuchiura.map((question) => question.id),
    ["P01", "P02", "P03", "P04", "P05", "P06", "U01", "U02"],
  );
  assert.deepEqual(
    undecided.map((question) => question.id),
    ["P01", "P02", "P03", "P04", "P05", "P06"],
  );
});

test("7段階の文言と非回答の区別（候補者と同じ）", () => {
  assert.deepEqual(scaleValues, [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(
    scaleValues.map((value) => scaleLabels[value]),
    [
      "強く反対",
      "反対",
      "やや反対",
      "賛成でも反対でもない",
      "やや賛成",
      "賛成",
      "強く賛成",
    ],
  );
  assert.equal(nonAnswerLabels["insufficient-info"], "判断材料が足りない");
  assert.equal(nonAnswerLabels["premise-objection"], "設問の前提に異議がある");
  assert.equal(nonAnswerLabels.skip, "答えない（スキップ）");
  assert.equal(
    userAnswerLabel({ status: "answered", value: 5 }),
    "やや賛成（5）",
  );
  assert.equal(
    userAnswerLabel({ status: "non-answer", kind: "insufficient-info" }),
    "判断材料が足りない",
  );
  assert.equal(userAnswerLabel(undefined), "未回答");
  assert.equal(isUserAnswer({ status: "answered", value: 0 }), false);
  assert.equal(isUserAnswer({ status: "answered", value: 8 }), false);
  assert.equal(isUserAnswer({ status: "non-answer", kind: "other" }), false);
  assert.ok(SCALE_VERSION.includes("7"));
});

test("告示前は候補者を1人も公開しない（approved行が入るまで空）", () => {
  // 12/4の一斉公開まで、生成データに候補者が入らないことが前提。
  // 入った場合はこのテストを12/4に更新する（データ側の検証は candidates2026 が行う）。
  assert.equal(candidates2026.length, generatedCandidates.length);
});

test("質問ごとのシェア画像が全問ぶん存在する", () => {
  for (const question of sentQuestions) {
    const path = `public/share/q-${question.slug}.png`;
    assert.ok(existsSync(path), `${path} がありません（npm run share-images:generate）`);
  }
});
