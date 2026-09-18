import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createInterviewTemplate,
  getPublishableInterviewBlocks,
  getPublicInterviewBlocks,
  interviewContentKey,
  interviewGuide,
  interviewPublicationIssues,
  interviewSegmentUrl,
  isInterviewDate,
  isInterviewSourceUrl,
  validateInterviewDocument,
  type InterviewDocument,
  type InterviewReviewKind,
  type RecordedInterviewBlock,
} from "../lib/interviews.ts";
import { publishedInterviewDocument } from "../lib/published-interviews.ts";

function recorded(): RecordedInterviewBlock {
  return {
    id: "test-H01",
    subjectId: "test-only",
    subjectLabel: "TEST ONLY",
    questionId: "H01",
    interviewOrder: 0,
    availability: "recorded",
    fields: {
      experience: {
        status: "stated",
        text: "TEST SUMMARY",
        segmentIds: ["test-segment"],
      },
      action: { status: "not_mentioned" },
      reason: { status: "not_mentioned" },
      conditions: { status: "not_mentioned" },
    },
    segments: [
      {
        id: "test-segment",
        quote: "TEST QUOTE",
        contextBefore: "BEFORE",
        contextAfter: "AFTER",
        startSeconds: 12,
        endSeconds: 30,
        fullUrl: "https://example.invalid/audio.mp3",
        transcriptUrl: "https://example.invalid/transcript",
        informationKind: "recollection",
      },
    ],
    recordedOn: "2000-01-01",
    answeredOn: "2000-01-01",
    version: "v1",
    corrections: [],
    relatedPolicyQuestionIds: ["P01"],
    reviews: {},
  };
}
function approve(block: RecordedInterviewBlock): RecordedInterviewBlock {
  const contentKey = interviewContentKey(block);
  return {
    ...block,
    reviews: Object.fromEntries(
      (
        ["audio", "context", "speaker", "publication"] as InterviewReviewKind[]
      ).map((kind) => [
        kind,
        { reviewer: `test-${kind}`, checkedOn: "2000-01-02", contentKey },
      ]),
    ),
  };
}
const documentOf = (block: RecordedInterviewBlock): InterviewDocument => ({
  schemaVersion: "1.0",
  blocks: [block],
});

test("the six-question template contains no invented person or response", () => {
  assert.equal(interviewGuide.length, 6);
  const template = createInterviewTemplate();
  assert.equal(validateInterviewDocument(template).valid, true);
  assert.equal(
    template.blocks.every(
      (block) =>
        block.availability === "not_recorded" && block.subjectId === "",
    ),
    true,
  );
  assert.deepEqual(getPublishableInterviewBlocks(template), []);
  assert.deepEqual(publishedInterviewDocument.blocks, []);
});
test("draft text cannot be displayed before every independent review", () => {
  const block = recorded();
  assert.equal(validateInterviewDocument(documentOf(block)).valid, true);
  assert.equal(getPublishableInterviewBlocks(documentOf(block)).length, 0);
  const approved = approve(block);
  assert.equal(getPublishableInterviewBlocks(documentOf(approved)).length, 1);
  for (const kind of ["audio", "context", "speaker", "publication"] as const) {
    const modified = structuredClone(approved);
    delete modified.reviews[kind];
    assert.equal(getPublishableInterviewBlocks(documentOf(modified)).length, 0);
  }
});
test("changing a word, source, date, version or correction invalidates the old approvals", () => {
  const block = approve(recorded());
  const mutations: ((block: RecordedInterviewBlock) => void)[] = [
    (value) => {
      value.fields.reason = {
        status: "stated",
        text: "NEW TEXT",
        segmentIds: ["test-segment"],
      };
    },
    (value) => {
      value.segments[0].quote = "CHANGED";
    },
    (value) => {
      value.segments[0].fullUrl = "https://example.invalid/changed";
    },
    (value) => {
      value.segments[0].contextBefore = "CHANGED";
    },
    (value) => {
      value.segments[0].startSeconds = 13;
    },
    (value) => {
      value.recordedOn = "2000-01-02";
    },
    (value) => {
      value.version = "v2";
    },
    (value) => {
      value.corrections.push({
        version: "v2",
        correctedOn: "2000-01-02",
        reason: "TEST CORRECTION",
      });
    },
    (value) => {
      value.relatedPolicyQuestionIds = ["P02"];
    },
  ];
  for (const mutate of mutations) {
    const modified = structuredClone(block);
    mutate(modified);
    assert.equal(getPublishableInterviewBlocks(documentOf(modified)).length, 0);
  }
});
test("content keys are independent of property insertion order and reviews", () => {
  const block = recorded();
  const reversed = Object.fromEntries(
    Object.entries(block).reverse(),
  ) as unknown as RecordedInterviewBlock;
  assert.equal(interviewContentKey(block), interviewContentKey(reversed));
  assert.equal(interviewContentKey(block), interviewContentKey(approve(block)));
});
test("unrecorded, unmentioned and malformed missing data are distinguished", () => {
  const noMention = recorded();
  noMention.availability = "not_mentioned";
  noMention.fields.experience = { status: "not_mentioned" };
  assert.equal(validateInterviewDocument(documentOf(noMention)).valid, true);
  assert.equal(
    getPublishableInterviewBlocks(documentOf(approve(noMention))).length,
    1,
  );
  assert.equal(
    validateInterviewDocument({
      schemaVersion: "1.0",
      blocks: [
        {
          ...noMention,
          fields: {
            ...noMention.fields,
            reason: { status: "not_mentioned", text: "INVENTED" },
          },
        },
      ],
    }).valid,
    false,
  );
  assert.equal(
    validateInterviewDocument({
      schemaVersion: "1.0",
      blocks: [
        {
          ...createInterviewTemplate().blocks[0],
          segments: recorded().segments,
        },
      ],
    }).valid,
    false,
  );
});
test("every summary must point to an existing source segment", () => {
  const block = recorded();
  block.fields.experience = {
    status: "stated",
    text: "TEST",
    segmentIds: ["missing"],
  };
  assert.equal(validateInterviewDocument(documentOf(block)).valid, false);
  block.fields.experience = { status: "stated", text: "TEST", segmentIds: [] };
  assert.equal(validateInterviewDocument(documentOf(block)).valid, false);
});
test("unsafe sources, inverted timestamps and nonexistent calendar dates fail closed", () => {
  for (const url of [
    "javascript:alert(1)",
    "http://example.invalid",
    "https://user:pw@example.invalid",
    " https://example.invalid",
    "https://examp\nle.invalid",
    "https://example.invalid\\bad",
  ])
    assert.equal(isInterviewSourceUrl(url), false);
  assert.equal(isInterviewSourceUrl("https://example.invalid/full"), true);
  for (const date of ["2000-02-30", "1900-02-29", "9999-01-01", "2000-1-1"])
    assert.equal(isInterviewDate(date), false);
  assert.equal(isInterviewDate("2000-02-29"), true);
  for (const [startSeconds, endSeconds] of [
    [-1, 10],
    [10, 10],
    [11, 10],
    [0, Infinity],
    [0, 86401],
  ]) {
    const block = recorded();
    Object.assign(block.segments[0], { startSeconds, endSeconds });
    assert.equal(validateInterviewDocument(documentOf(block)).valid, false);
  }
});
test("duplicate block/segment ids and inconsistent subject labels are rejected", () => {
  const block = recorded();
  assert.equal(
    validateInterviewDocument({ schemaVersion: "1.0", blocks: [block, block] })
      .valid,
    false,
  );
  const different = { ...block, id: "other", subjectLabel: "OTHER NAME" };
  assert.equal(
    validateInterviewDocument({
      schemaVersion: "1.0",
      blocks: [block, different],
    }).valid,
    false,
  );
  block.segments.push({ ...block.segments[0] });
  assert.equal(validateInterviewDocument(documentOf(block)).valid, false);
});
test("context reviewer must differ and checks cannot predate the recording", () => {
  const same = approve(recorded());
  same.reviews.context!.reviewer = same.reviews.audio!.reviewer;
  assert.equal(interviewPublicationIssues(same).length > 0, true);
  const early = approve(recorded());
  early.reviews.publication!.checkedOn = "1999-12-31";
  assert.equal(interviewPublicationIssues(early).length > 0, true);
  const outOfOrder = approve(recorded());
  outOfOrder.reviews.context!.checkedOn = "2000-01-03";
  assert.equal(interviewPublicationIssues(outOfOrder).length > 0, true);
});
test("malformed documents and malformed nested content never become public blocks", () => {
  for (const value of [
    null,
    [],
    {},
    { schemaVersion: "2.0", blocks: [] },
    { schemaVersion: "1.0", blocks: [null] },
    { schemaVersion: "1.0", blocks: [{ ...recorded(), fields: null }] },
  ])
    assert.equal(validateInterviewDocument(value).valid, false);
  assert.deepEqual(
    getPublishableInterviewBlocks({
      schemaVersion: "1.0",
      blocks: [
        { ...recorded(), fields: null } as unknown as RecordedInterviewBlock,
      ],
    }),
    [],
  );
});

test("source deep links retain full audio and only use supported timestamp formats", () => {
  const segment = recorded().segments[0];
  assert.equal(
    interviewSegmentUrl(segment),
    "https://example.invalid/audio.mp3#t=12,30",
  );
  assert.equal(
    interviewSegmentUrl({
      ...segment,
      fullUrl: "https://youtu.be/abcdefghijk",
    }),
    "https://www.youtube.com/watch?v=abcdefghijk&t=12s",
  );
  assert.equal(
    interviewSegmentUrl({
      ...segment,
      fullUrl: "https://example.invalid/podcast",
    }),
    null,
  );
  assert.equal(
    interviewSegmentUrl({ ...segment, fullUrl: "javascript:alert(1)" }),
    null,
  );
  assert.equal(interviewSegmentUrl({ ...segment, endSeconds: 1 }), null);
});

test("public projection excludes draft text and internal reviewer records before client serialization", () => {
  const approved = approve(recorded());
  const draft = { ...recorded(), id: "draft-H02", questionId: "H02" as const };
  const document: InterviewDocument = {
    schemaVersion: "1.0",
    blocks: [approved, draft],
  };
  const publicBlocks = getPublicInterviewBlocks(document);
  assert.equal(publicBlocks.length, 1);
  assert.equal(Object.hasOwn(publicBlocks[0], "reviews"), false);
  assert.equal(JSON.stringify(publicBlocks).includes("contentKey"), false);
  assert.equal(
    JSON.stringify(publicBlocks).includes("test-publication"),
    false,
  );
  assert.equal(publicBlocks[0].segments[0].quote, approved.segments[0].quote);
  assert.deepEqual(getPublicInterviewBlocks(document, "other-subject"), []);
  assert.equal(
    getPublicInterviewBlocks(document, approved.subjectId).length,
    1,
  );
});
