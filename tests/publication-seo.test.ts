import assert from "node:assert/strict";
import { test } from "node:test";
import { candidates, type Candidate } from "../lib/data.ts";
import type { InterviewEpisode } from "../lib/interviews.ts";
import { publishedInterviewEpisodes } from "../lib/published-interviews.ts";
import {
  candidateSeo,
  interviewSeo,
  isCandidateIndexable,
} from "../lib/publication-seo.ts";

const candidate: Candidate = {
  id: "test-only",
  name: "TEST ONLY",
  kana: "TEST ONLY",
  age: null,
  party: null,
  status: null,
  district: "つくば市選挙区",
  policyAnswers: {},
};
const approved: Candidate = {
  ...candidate,
  publication: {
    status: "published",
    verifiedAt: "2000-01-01",
    publishedAt: "2000-01-02",
    profileSourceUrl: "https://example.invalid/primary-source",
  },
};

test("empty registries and legacy records remain excluded from candidate indexing", () => {
  assert.deepEqual(candidates, []);
  assert.deepEqual(publishedInterviewEpisodes, []);
  assert.equal(isCandidateIndexable(candidate), false);
  assert.equal(isCandidateIndexable(approved), true);
  assert.equal(
    isCandidateIndexable({
      ...approved,
      publication: { ...approved.publication!, status: "draft" },
    }),
    false,
  );
});

test("published candidates need checked source data and valid dates in order", () => {
  for (const publication of [
    { status: "published" as const },
    { ...approved.publication!, verifiedAt: undefined },
    { ...approved.publication!, publishedAt: undefined },
    { ...approved.publication!, verifiedAt: "2000-02-30" },
    { ...approved.publication!, verifiedAt: "2000-01-03" },
    { ...approved.publication!, publishedAt: "9999-01-01" },
    { ...approved.publication!, profileSourceUrl: undefined },
    { ...approved.publication!, profileSourceUrl: "javascript:alert(1)" },
    {
      ...approved.publication!,
      profileSourceUrl: "https://user:password@example.invalid",
    },
  ]) {
    assert.equal(isCandidateIndexable({ ...approved, publication }), false);
  }
  assert.equal(isCandidateIndexable({ ...approved, id: "../other" }), false);
  assert.equal(isCandidateIndexable({ ...approved, name: " " }), false);
});

test("candidate metadata has defaults and optional editorial overrides", () => {
  const defaults = candidateSeo(candidate);
  assert.match(defaults.title, /TEST ONLY.*2026年茨城県議選.*つくば市選挙区/);
  assert.match(defaults.description, /TEST ONLY.*未回答・未掲載/);
  assert.equal(defaults.image, undefined);
  assert.deepEqual(
    candidateSeo({
      ...candidate,
      seo: {
        title: "  TITLE  ",
        description: "DESCRIPTION",
        ogImage: "/candidate.png",
      },
    }),
    { title: "TITLE", description: "DESCRIPTION", image: "/candidate.png" },
  );
  assert.deepEqual(
    candidateSeo({ ...candidate, seo: { title: " ", description: "" } }),
    defaults,
  );
});

test("social images accept local assets or HTTPS sources and reject unsafe URLs", () => {
  for (const ogImage of [
    "https://example.invalid/image.png",
    "/images/candidate.png?v=1",
  ]) {
    assert.equal(
      candidateSeo({ ...candidate, seo: { ogImage } }).image,
      ogImage,
    );
  }
  for (const ogImage of [
    "javascript:alert(1)",
    "http://example.invalid/image.png",
    "//example.invalid/image.png",
    "/\\example.invalid/image.png",
    " /image.png",
    "/image\n.png",
  ]) {
    assert.equal(
      candidateSeo({ ...candidate, seo: { ogImage } }).image,
      undefined,
    );
  }
});

test("episode metadata supports real transcript and chapter fields without publishing drafts", () => {
  const episode: InterviewEpisode = {
    id: "test-only",
    candidateId: candidate.id,
    title: "TEST INTERVIEW",
    description: "TEST DESCRIPTION",
    publicationStatus: "draft",
    transcript: [],
    chapters: [],
    blockIds: [],
  };
  assert.deepEqual(interviewSeo(episode), {
    title: "TEST INTERVIEW｜本人インタビュー｜オシセン！",
    description: "TEST DESCRIPTION",
  });
  assert.deepEqual(publishedInterviewEpisodes, []);
});
