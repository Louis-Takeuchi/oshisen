import assert from "node:assert/strict";
import { test } from "node:test";
import { candidates, demoAnswerFixtures, questions } from "../lib/data.ts";
import {
  classifyIssueAnswer,
  getIssueQuestion,
  groupCandidatesByIssue,
  resolveIssueTheme,
} from "../lib/issues.ts";

test("issue themes accept only a known scalar question identifier", () => {
  for (const question of questions) {
    assert.equal(getIssueQuestion(question.id), question);
    assert.equal(resolveIssueTheme(question.id), question.id);
  }
  for (const invalid of [
    "",
    "unknown",
    "__proto__",
    "constructor",
    ["education"],
    null,
    undefined,
    4,
  ]) {
    assert.equal(getIssueQuestion(invalid), undefined);
    assert.equal(resolveIssueTheme(invalid), "transport");
    assert.deepEqual(groupCandidatesByIssue(invalid, candidates), []);
  }
});

test("five exact answer values map into three stances, not rankings", () => {
  assert.equal(classifyIssueAnswer(4), "agree");
  assert.equal(classifyIssueAnswer(3), "agree");
  assert.equal(classifyIssueAnswer(2), "neutral");
  assert.equal(classifyIssueAnswer(1), "disagree");
  assert.equal(classifyIssueAnswer(0), "disagree");
});

test("missing or invalid answers are unknown, never neutral", () => {
  for (const value of [
    null,
    undefined,
    "2",
    "4",
    true,
    false,
    5,
    -1,
    2.5,
    Number.NaN,
    Infinity,
    {},
    [],
  ]) {
    assert.equal(classifyIssueAnswer(value), "unknown");
  }
  const groups = groupCandidatesByIssue("transport", candidates, {
    "sato-misaki": { transport: 2 },
    "takahashi-ken": { transport: "2" },
    "tanaka-aya": { transport: null },
  });
  assert.deepEqual(
    groups
      .find((group) => group.id === "neutral")
      ?.members.map((member) => member.candidate.id),
    ["sato-misaki"],
  );
  const unknown = groups.find((group) => group.id === "unknown")!;
  assert.equal(unknown.members.length, 3);
  assert.ok(unknown.members.every((member) => member.answer === null));
});

test("actual candidate records remain unknown unless fixtures are explicitly supplied", () => {
  const actual = groupCandidatesByIssue("transport", candidates);
  assert.equal(
    actual.find((group) => group.id === "unknown")?.members.length,
    4,
  );
  assert.ok(
    actual
      .filter((group) => group.id !== "unknown")
      .every((group) => !group.members.length),
  );
  const demo = groupCandidatesByIssue(
    "transport",
    candidates,
    demoAnswerFixtures,
  );
  assert.deepEqual(
    demo.map((group) => group.members.length),
    [2, 1, 1, 0],
  );
  assert.ok(
    candidates.every((candidate) => candidate.answers.transport === null),
  );
});

test("every candidate occurs once per theme and groups keep kana order without mutating inputs", () => {
  const reversed = [...candidates].reverse();
  const originalIds = reversed.map((candidate) => candidate.id);
  for (const question of questions) {
    const groups = groupCandidatesByIssue(
      question.id,
      reversed,
      demoAnswerFixtures,
    );
    const memberIds = groups.flatMap((group) =>
      group.members.map((member) => member.candidate.id),
    );
    assert.equal(memberIds.length, candidates.length);
    assert.equal(new Set(memberIds).size, candidates.length);
    for (const group of groups) {
      const names = group.members.map((member) => member.candidate.kana);
      assert.deepEqual(
        names,
        [...names].sort((a, b) => a.localeCompare(b, "ja")),
      );
    }
  }
  assert.deepEqual(
    reversed.map((candidate) => candidate.id),
    originalIds,
  );
});

test("empty input preserves all four descriptive groups without invented members", () => {
  const groups = groupCandidatesByIssue("education", [], demoAnswerFixtures);
  assert.deepEqual(
    groups.map((group) => group.id),
    ["agree", "neutral", "disagree", "unknown"],
  );
  assert.ok(groups.every((group) => group.members.length === 0));
});
