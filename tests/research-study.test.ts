import assert from "node:assert/strict";
import { test } from "node:test";
import {
  balancedSubjectOrder,
  buildInterviewPresentation,
  createLocalStudySession,
  recordStudyEvent,
  revokeStudyConsent,
  samePresentationMaterial,
  scoreParticipantUnderstanding,
  summarizeSourceAccess,
  type ComprehensionTask,
} from "../lib/research-study.ts";
import type { RecordedInterviewBlock } from "../lib/interviews.ts";
const block = (
  id: string,
  subjectId: string,
  questionId: "H01" | "H02",
  interviewOrder: number,
): RecordedInterviewBlock => ({
  id,
  subjectId,
  subjectLabel: subjectId,
  questionId,
  interviewOrder,
  availability: "recorded",
  fields: {
    experience: {
      status: "stated",
      text: `TEST ONLY ${id}`,
      segmentIds: ["s1"],
    },
    action: { status: "not_mentioned" },
    reason: { status: "not_mentioned" },
    conditions: { status: "not_mentioned" },
  },
  segments: [
    {
      id: "s1",
      quote: "TEST QUOTE",
      contextBefore: "BEFORE",
      contextAfter: "AFTER",
      startSeconds: 1,
      endSeconds: 2,
      fullUrl: "https://example.invalid/audio",
      transcriptUrl: "https://example.invalid/transcript",
      informationKind: "self_report",
    },
  ],
  version: "test",
  recordedOn: "2000-01-01",
  answeredOn: "2000-01-01",
  corrections: [],
  reviews: {},
  relatedPolicyQuestionIds: [],
});

test("B and C preserve every selected block without editing, truncating or duplicating it", () => {
  const blocks = [
    block("a2", "a", "H02", 0),
    block("b1", "b", "H01", 0),
    block("a1", "a", "H01", 1),
    block("c1", "c", "H01", 0),
  ];
  const b = buildInterviewPresentation(blocks, "B", ["a", "b"]);
  const c = buildInterviewPresentation(blocks, "C", ["a", "b"]);
  assert.deepEqual(
    b[0].blocks.map((item) => item.id),
    ["a2", "a1"],
  );
  assert.deepEqual(
    c[0].blocks.map((item) => item.id),
    ["a1", "b1"],
  );
  assert.equal(samePresentationMaterial(b, c), true);
  assert.equal(c[0].blocks[0], blocks[2]);
  const changed = structuredClone(c);
  changed[0].blocks[0].segments[0].quote = "CHANGED";
  assert.equal(samePresentationMaterial(b, changed), false);
  assert.equal(blocks[2].segments[0].quote, "TEST QUOTE");
});
test("balanced order is stable within an allocation and gives each subject each position", () => {
  assert.deepEqual(
    [0, 1, 2].map((index) => balancedSubjectOrder(["a", "b", "c"], index)[0]),
    ["a", "b", "c"],
  );
  assert.deepEqual(
    balancedSubjectOrder(["a", "b", "c"], 1),
    balancedSubjectOrder(["a", "b", "c"], 1),
  );
  assert.deepEqual(balancedSubjectOrder([], 0), []);
  assert.throws(() => balancedSubjectOrder(["a"], -1));
});
test("no recording before consent; withdrawal removes the local record", () => {
  const session = createLocalStudySession("test-session", "B");
  assert.equal(recordStudyEvent(session, "source_open", "s1", 1), session);
  const consented = { ...session, consented: true };
  const withEvent = recordStudyEvent(consented, "source_open", "s1", 12);
  assert.equal(withEvent.events.length, 1);
  assert.equal(consented.events.length, 0);
  assert.deepEqual(revokeStudyConsent(withEvent).events, []);
  assert.equal(revokeStudyConsent(withEvent).consented, false);
});
test("free browsing, instructed access and same-information repeat clicks stay separate", () => {
  let session = { ...createLocalStudySession("test", "C"), consented: true };
  session = recordStudyEvent(session, "source_open", "s1", 1);
  session = recordStudyEvent(session, "source_open", "s1", 2);
  session = { ...session, phase: "comprehension_task" };
  session = recordStudyEvent(session, "source_open", "s1", 3);
  assert.equal(session.events[0].repeat, false);
  assert.equal(session.events[1].repeatWithinPhase, true);
  assert.equal(session.events[2].repeat, true);
  assert.equal(session.events[2].repeatWithinPhase, false);
  assert.deepEqual(summarizeSourceAccess(session.events, "free_browse"), {
    clicks: 2,
    uniqueInformationCount: 1,
    repeatClicks: 1,
  });
  assert.deepEqual(
    summarizeSourceAccess(session.events, "comprehension_task"),
    { clicks: 1, uniqueInformationCount: 1, repeatClicks: 0 },
  );
});
test("invalid events and missing consent do not create records", () => {
  const session = { ...createLocalStudySession("test", "B"), consented: true };
  for (const elapsed of [-1, NaN, Infinity])
    assert.equal(
      recordStudyEvent(session, "source_open", "s1", elapsed),
      session,
    );
  assert.equal(recordStudyEvent(session, "source_open", " ", 1), session);
});
const tasks: ComprehensionTask[] = [
  { id: "t1", correctAnswerId: "a1", acceptableEvidenceSets: [["s1"]] },
  { id: "t2", correctAnswerId: "a2", acceptableEvidenceSets: [["s2", "s3"]] },
  { id: "t3", correctAnswerId: "unknown", acceptableEvidenceSets: [[]] },
];
test("participant score needs both correct content and evidence and counts missing tasks", () => {
  const result = scoreParticipantUnderstanding("p1", tasks, [
    {
      participantId: "p1",
      taskId: "t1",
      answerId: "a1",
      evidenceSegmentIds: ["s1"],
    },
    {
      participantId: "p1",
      taskId: "t2",
      answerId: "a2",
      evidenceSegmentIds: ["s2"],
    },
    {
      participantId: "p2",
      taskId: "t3",
      answerId: "unknown",
      evidenceSegmentIds: [],
    },
  ]);
  assert.equal(result.correctContentAndEvidence, 1);
  assert.equal(result.ratio, 1 / 3);
  assert.equal(result.answeredTasks, 2);
  assert.deepEqual(result.missingTaskIds, ["t3"]);
});
test("evidence order is irrelevant but extra evidence does not automatically earn credit", () => {
  assert.equal(
    scoreParticipantUnderstanding(
      "p1",
      [tasks[1]],
      [
        {
          participantId: "p1",
          taskId: "t2",
          answerId: "a2",
          evidenceSegmentIds: ["s3", "s2"],
        },
      ],
    ).ratio,
    1,
  );
  assert.equal(
    scoreParticipantUnderstanding(
      "p1",
      [tasks[0]],
      [
        {
          participantId: "p1",
          taskId: "t1",
          answerId: "a1",
          evidenceSegmentIds: ["s1", "unrelated"],
        },
      ],
    ).ratio,
    0,
  );
  assert.equal(scoreParticipantUnderstanding("p1", [], []).ratio, null);
});
test("duplicate responses require an explicit resolution rather than inflating the score", () => {
  const response = {
    participantId: "p1",
    taskId: "t1",
    answerId: "a1",
    evidenceSegmentIds: ["s1"],
  };
  assert.throws(() =>
    scoreParticipantUnderstanding("p1", tasks, [response, response]),
  );
  assert.throws(() =>
    scoreParticipantUnderstanding("p1", [tasks[0], tasks[0]], []),
  );
});
