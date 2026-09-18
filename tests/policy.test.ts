import assert from "node:assert/strict";
import { test } from "node:test";
import {
  comparePolicyAnswers as comparePolicyAnswersForPublication,
  createPolicyAnswerRecord,
  hasPublishedPolicyEvidence,
  isUserPolicyAnswer,
  policyAnswerLabel,
  type CandidatePolicyAnswerRecord,
  type PolicyAnswerRecord,
  type PolicyAnswerValue,
  type PolicyQuestionDefinition,
  type UserPolicyAnswer,
} from "../lib/policy.ts";
import {
  getPolicyQuestion,
  getQuestionLedgerEntry,
  policyQuestions,
  questionLedger,
} from "../lib/question-ledger.ts";

const question = policyQuestions[0];
const neutral: UserPolicyAnswer = { status: "answered", value: 2 };

/** Existing tests compare the same explicit fixture candidate by default. */
function comparePolicyAnswers(
  definition: PolicyQuestionDefinition,
  userRecord?: PolicyAnswerRecord,
  candidateRecord?: CandidatePolicyAnswerRecord,
  expectedCandidateId = "test-candidate",
) {
  return comparePolicyAnswersForPublication(
    definition,
    userRecord,
    candidateRecord,
    expectedCandidateId,
  );
}

function user(answer: UserPolicyAnswer = neutral): PolicyAnswerRecord {
  return createPolicyAnswerRecord(question, answer);
}

/** Test data only; no candidate or person is represented by these records. */
function candidate(
  override: Partial<CandidatePolicyAnswerRecord> = {},
): CandidatePolicyAnswerRecord {
  return {
    ...user(),
    candidateId: "test-candidate",
    verification: "published",
    provenance: "candidate_answer",
    answeredAt: "2026-09-01",
    publishedAt: "2026-09-02",
    sources: [
      {
        id: "test-submission",
        label: "Test response",
        kind: "candidate_answer",
      },
    ],
    ...override,
  };
}

test("all 25 choice pairs report exact equality without distances or aggregate scores", () => {
  for (const left of [0, 1, 2, 3, 4] as const) {
    for (const right of [0, 1, 2, 3, 4] as const) {
      const result = comparePolicyAnswers(
        question,
        user({ status: "answered", value: left }),
        candidate({ answer: { status: "answered", value: right } }),
      );
      assert.equal(result.status, left === right ? "same" : "different");
      assert.equal(result.userAnswer?.status, "answered");
      assert.deepEqual(result.candidateAnswer, {
        status: "answered",
        value: right,
      });
      assert.equal("score" in result, false);
      assert.equal("distance" in result, false);
      assert.equal("rank" in result, false);
    }
  }
});

test("neutral, undecided, skipped and absent user answers remain distinct", () => {
  assert.equal(
    comparePolicyAnswers(question, user(), candidate()).status,
    "same",
  );
  for (const reason of [undefined, "needs-information", "thinking"] as const) {
    const answer: UserPolicyAnswer = {
      status: "undecided",
      ...(reason ? { reason } : {}),
    };
    const result = comparePolicyAnswers(question, user(answer), candidate());
    assert.equal(result.status, "user-undecided");
    assert.deepEqual(result.userAnswer, answer);
  }
  assert.equal(
    comparePolicyAnswers(question, user({ status: "skipped" }), candidate())
      .status,
    "user-skipped",
  );
  const absent = comparePolicyAnswers(question, undefined, candidate());
  assert.equal(absent.status, "user-unanswered");
  assert.equal(absent.userAnswer, undefined);
  assert.equal(policyAnswerLabel(neutral), "賛成でも反対でもない");
  assert.equal(policyAnswerLabel({ status: "undecided" }), "今は判断できない");
  assert.equal(policyAnswerLabel({ status: "skipped" }), "スキップ");
  assert.equal(policyAnswerLabel(), "未回答");
});

test("missing, pending, undecided and skipped candidate responses are separate", () => {
  assert.equal(
    comparePolicyAnswers(question, user()).status,
    "candidate-unanswered",
  );
  assert.equal(
    comparePolicyAnswers(
      question,
      user(),
      candidate({ verification: "unanswered" }),
    ).status,
    "candidate-unanswered",
  );
  assert.equal(
    comparePolicyAnswers(
      question,
      user(),
      candidate({ verification: "pending" }),
    ).status,
    "pending",
  );
  assert.equal(
    comparePolicyAnswers(question, user(), candidate({ answer: undefined }))
      .status,
    "candidate-unanswered",
  );
  assert.equal(
    comparePolicyAnswers(
      question,
      user(),
      candidate({ answer: { status: "undecided" } }),
    ).status,
    "candidate-undecided",
  );
  assert.equal(
    comparePolicyAnswers(
      question,
      user(),
      candidate({ answer: { status: "skipped" } }),
    ).status,
    "candidate-skipped",
  );
});

test("both side states survive when several missingness conditions coexist", () => {
  const result = comparePolicyAnswers(
    question,
    user({ status: "undecided", reason: "thinking" }),
    candidate({ verification: "pending" }),
  );
  assert.equal(result.status, "pending");
  assert.equal(result.userState, "undecided");
  assert.equal(result.candidateState, "pending");
  assert.deepEqual(result.userAnswer, {
    status: "undecided",
    reason: "thinking",
  });
  const missing = comparePolicyAnswers(question);
  assert.equal(missing.userState, "unanswered");
  assert.equal(missing.candidateState, "unanswered");
});

test("question, wording, scale and context identity are independently required for both sides", () => {
  for (const key of [
    "questionId",
    "questionVersion",
    "scaleVersion",
    "contextVersion",
  ] as const) {
    const badUser = { ...user(), [key]: "another-version" };
    const fromUser = comparePolicyAnswers(question, badUser, candidate());
    assert.equal(fromUser.status, "version-mismatch", key);
    assert.equal(fromUser.userState, "version-mismatch");
    assert.equal(fromUser.userAnswer, undefined);
    const fromCandidate = comparePolicyAnswers(
      question,
      user(),
      candidate({ [key]: "another-version" }),
    );
    assert.equal(fromCandidate.status, "version-mismatch", key);
    assert.equal(fromCandidate.candidateAnswer, undefined);
    assert.deepEqual(fromCandidate.sources, []);
  }
  const emptyVersion = { ...question, contextVersion: "" };
  assert.equal(
    comparePolicyAnswers(
      emptyVersion,
      { ...user(), contextVersion: "" },
      candidate({ contextVersion: "" }),
    ).status,
    "version-mismatch",
  );
});

test("version checks happen before pending publication checks", () => {
  const result = comparePolicyAnswers(
    question,
    user(),
    candidate({ verification: "pending", scaleVersion: "old-scale" }),
  );
  assert.equal(result.status, "version-mismatch");
  assert.equal(result.candidateAnswer, undefined);
});

test("unpublished answers, reasons, conditions and sources never leak through comparison", () => {
  for (const verification of ["pending", "unanswered"] as const) {
    const result = comparePolicyAnswers(
      question,
      user(),
      candidate({
        verification,
        reason: "Private draft",
        conditions: "Private condition",
      }),
    );
    assert.equal(result.candidateAnswer, undefined);
    assert.equal(result.reason, undefined);
    assert.equal(result.conditions, undefined);
    assert.deepEqual(result.sources, []);
  }
});

test("past statements and editorial inferences cannot replace this questionnaire's own answer", () => {
  for (const provenance of ["public_statement", "editorial_summary"] as const) {
    const result = comparePolicyAnswers(
      question,
      user(),
      candidate({ provenance, reason: "Not a submitted answer" }),
    );
    assert.equal(result.status, "not-candidate-answer");
    assert.equal(result.candidateAnswer, undefined);
    assert.equal(result.reason, undefined);
    assert.deepEqual(result.sources, []);
  }
});

test("publication needs dates and a traceable submitted response, not merely a published flag", () => {
  for (const patch of [
    { answeredAt: undefined },
    { publishedAt: undefined },
    { answeredAt: "2026-02-31" },
    { publishedAt: "not-a-date" },
    { publishedAt: "2026-08-31" },
    { sources: undefined },
    { sources: [] },
    {
      sources: [
        {
          id: "x",
          label: "Official material",
          kind: "official_record" as const,
        },
      ],
    },
    {
      sources: [
        { id: "", label: "Response", kind: "candidate_answer" as const },
      ],
    },
    {
      sources: [
        {
          id: "x",
          label: "Response",
          kind: "candidate_answer" as const,
          url: "javascript:alert(1)",
        },
      ],
    },
    {
      sources: [
        {
          id: "x",
          label: "Response",
          kind: "candidate_answer" as const,
          url: "https://user:pass@example.invalid",
        },
      ],
    },
  ]) {
    const record = candidate(patch);
    assert.equal(hasPublishedPolicyEvidence(record), false);
    const result = comparePolicyAnswers(question, user(), record);
    assert.equal(result.status, "pending");
    assert.equal(result.candidateAnswer, undefined);
  }
});

test("a published choice retains its reason, conditions and original source without scoring them", () => {
  const submitted = candidate({
    reason: "Test reason",
    conditions: "Test limitation",
  });
  const result = comparePolicyAnswers(question, user(), submitted);
  assert.equal(result.status, "same");
  assert.equal(result.reason, submitted.reason);
  assert.equal(result.conditions, submitted.conditions);
  assert.deepEqual(result.sources, submitted.sources);
  const anotherReason = comparePolicyAnswers(question, user(), {
    ...submitted,
    reason: "Different test reason",
  });
  assert.equal(anotherReason.status, result.status);
});

test("invalid input cannot become neutral or comparable", () => {
  for (const value of [-1, 5, 2.5, Number.NaN, "2", null]) {
    const invalid = {
      status: "answered",
      value,
    } as unknown as UserPolicyAnswer;
    assert.equal(isUserPolicyAnswer(invalid), false);
    assert.equal(
      comparePolicyAnswers(question, user(invalid), candidate()).status,
      "invalid-answer",
    );
    const result = comparePolicyAnswers(
      question,
      user(),
      candidate({ answer: invalid }),
    );
    assert.equal(result.status, "invalid-answer");
    assert.equal(result.candidateAnswer, undefined);
  }
  for (const invalid of [
    { status: "undecided", value: 2 },
    { status: "undecided", reason: "neutral" },
    { status: "skipped", value: 2 },
    {},
    null,
  ]) {
    assert.equal(isUserPolicyAnswer(invalid), false);
  }
});

test("reordering questions preserves original answer pairing by ID and version", () => {
  const users = new Map(
    policyQuestions.map((entry, index) => [
      entry.id,
      createPolicyAnswerRecord(entry, {
        status: "answered",
        value: (index % 5) as PolicyAnswerValue,
      }),
    ]),
  );
  const submissions = new Map(
    policyQuestions.map((entry) => [
      entry.id,
      candidate({ ...users.get(entry.id)! }),
    ]),
  );
  const compare = (entries: typeof policyQuestions) =>
    Object.fromEntries(
      entries.map((entry) => [
        entry.id,
        comparePolicyAnswers(
          entry,
          users.get(entry.id),
          submissions.get(entry.id),
        ),
      ]),
    );
  assert.deepEqual(
    compare([...policyQuestions].reverse()),
    compare(policyQuestions),
  );
  assert.deepEqual(
    [...users.values()].map((entry) => entry.answer),
    policyQuestions.map((_, index) => ({
      status: "answered",
      value: index % 5,
    })),
  );
});

test("adding another candidate cannot affect the original candidate's comparison", () => {
  const records = [
    candidate({ candidateId: "test-a" }),
    candidate({
      candidateId: "test-b",
      answer: { status: "answered", value: 0 },
    }),
  ];
  const before = records.map((entry) =>
    comparePolicyAnswers(question, user(), entry, entry.candidateId),
  );
  const after = [
    ...records,
    candidate({
      candidateId: "test-c",
      answer: { status: "answered", value: 4 },
    }),
  ].map((entry) =>
    comparePolicyAnswers(question, user(), entry, entry.candidateId),
  );
  assert.deepEqual(after.slice(0, 2), before);
});

test("all sixteen ledger entries stay visibly unverified; only the previous eight are previewed", () => {
  assert.equal(questionLedger.length, 16);
  assert.equal(policyQuestions.length, 8);
  assert.equal(new Set(questionLedger.map((entry) => entry.id)).size, 16);
  for (const entry of questionLedger) {
    assert.equal(entry.status, "draft");
    assert.equal(entry.verification, "unverified");
    assert.equal(entry.selection.status, "held");
    assert.ok(entry.selection.reason);
    assert.ok(entry.pendingChecks.length > 0);
    assert.ok(entry.sections.terms.length > 0);
    assert.ok(entry.sections.currentState.includes("未確認"));
    assert.ok(entry.sections.discussion.length > 0);
    assert.deepEqual(entry.sections.sources, []);
    assert.equal(entry.reviewedAt, null);
    assert.equal(entry.baselineDate, null);
    assert.ok(
      entry.questionVersion && entry.scaleVersion && entry.contextVersion,
    );
  }
  assert.ok(
    policyQuestions.every((entry) => entry.origin === "legacy-prototype"),
  );
  assert.equal(getPolicyQuestion("proposal-transport"), undefined);
  assert.equal(
    getQuestionLedgerEntry("proposal-transport")?.origin,
    "research-proposal",
  );
  assert.equal(getPolicyQuestion("unknown"), undefined);
});

test("future answer, publication and source-check dates cannot authorize publication", () => {
  const now = Date.parse("2026-09-18T12:00:00Z");
  const today = "2026-09-18";
  assert.equal(
    hasPublishedPolicyEvidence(
      candidate({ answeredAt: today, publishedAt: today }),
      now,
    ),
    true,
  );
  assert.equal(
    hasPublishedPolicyEvidence(
      candidate({
        answeredAt: "2026-09-18T11:00:00Z",
        publishedAt: "2026-09-18T12:00:00Z",
      }),
      now,
    ),
    true,
  );
  for (const patch of [
    { answeredAt: "2026-09-19", publishedAt: "2026-09-19" },
    { publishedAt: "2026-09-19" },
    { answeredAt: "2026-09-18T12:00:01Z", publishedAt: "2026-09-18T12:00:01Z" },
    { publishedAt: "2026-09-18T12:00:01Z" },
    { publishedAt: "2026-09-18T24:00:00Z" },
    {
      sources: [
        {
          id: "test",
          label: "Test source",
          kind: "candidate_answer" as const,
          checkedAt: "2026-09-19",
        },
      ],
    },
    {
      sources: [
        {
          id: "test",
          label: "Test source",
          kind: "candidate_answer" as const,
          checkedAt: "2026-02-30",
        },
      ],
    },
    {
      sources: [
        {
          id: "test",
          label: "Test source",
          kind: "candidate_answer" as const,
          checkedAt: "not-a-date",
        },
      ],
    },
  ]) {
    assert.equal(hasPublishedPolicyEvidence(candidate(patch), now), false);
  }
  assert.equal(hasPublishedPolicyEvidence(candidate(), Number.NaN), false);

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const result = comparePolicyAnswers(
    question,
    user(),
    candidate({ publishedAt: tomorrow, reason: "Not public yet" }),
  );
  assert.equal(result.status, "pending");
  assert.equal(result.candidateAnswer, undefined);
  assert.equal(result.reason, undefined);
  assert.deepEqual(result.sources, []);
});

test("policy source links require an unambiguous HTTPS destination without credentials", () => {
  for (const url of [
    "https://example.invalid/response",
    "https://example.invalid/response?part=1#answer",
  ]) {
    assert.equal(
      hasPublishedPolicyEvidence(
        candidate({
          sources: [
            { id: "test", label: "Test source", kind: "candidate_answer", url },
          ],
        }),
      ),
      true,
    );
  }
  for (const url of [
    "http://example.invalid/response",
    "//example.invalid/response",
    "javascript:alert(1)",
    "https://user:pass@example.invalid/response",
    "https://user@example.invalid/response",
    " https://example.invalid/response",
    "https://example.invalid/response ",
    "https://exam\nple.invalid/response",
    "https:\\example.invalid/response",
    "https:///",
    "",
  ]) {
    const result = comparePolicyAnswers(
      question,
      user(),
      candidate({
        sources: [
          { id: "test", label: "Test source", kind: "candidate_answer", url },
        ],
      }),
    );
    assert.equal(result.status, "pending", url);
    assert.deepEqual(result.sources, []);
  }
});

test("the candidate identity must match the requested page before exposing any answer", () => {
  const record = candidate({
    reason: "A person's own reason",
    conditions: "A person's condition",
  });
  const wrongPerson = comparePolicyAnswersForPublication(
    question,
    user(),
    record,
    "another-candidate",
  );
  const unknownPerson = comparePolicyAnswersForPublication(
    question,
    user(),
    record,
  );
  const emptyPerson = comparePolicyAnswersForPublication(
    question,
    user(),
    record,
    "",
  );
  const missingIdentity = comparePolicyAnswersForPublication(
    question,
    user(),
    {
      ...record,
      candidateId: undefined,
    } as unknown as CandidatePolicyAnswerRecord,
    "test-candidate",
  );
  for (const result of [
    wrongPerson,
    unknownPerson,
    emptyPerson,
    missingIdentity,
  ]) {
    assert.equal(result.status, "invalid-answer");
    assert.equal(result.candidateState, "invalid-answer");
    assert.equal(result.candidateAnswer, undefined);
    assert.equal(result.reason, undefined);
    assert.equal(result.conditions, undefined);
    assert.deepEqual(result.sources, []);
  }
  assert.equal(
    comparePolicyAnswersForPublication(
      question,
      user(),
      record,
      record.candidateId,
    ).status,
    "same",
  );
  assert.equal(
    hasPublishedPolicyEvidence({ ...record, candidateId: "" }),
    false,
  );
});
