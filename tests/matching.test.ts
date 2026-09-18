import assert from "node:assert/strict";
import { test } from "node:test";
import { questions } from "../lib/data.ts";
import {
  candidates,
  demoAnswerFixtures,
  type AnswerMap,
} from "./fixtures/legacy-data.ts";
import { calculateMatch } from "./helpers/legacy-matching.ts";
import {
  eraseAnalytics,
  exportAnalytics,
  getAnalyticsConsent,
  getVariant,
  setAnalyticsConsent,
  trackEvent,
  type AnalyticsMetadata,
} from "../lib/analytics.ts";

function answers(value: 0 | 1 | 2 | 3 | 4): AnswerMap {
  return Object.fromEntries(questions.map((question) => [question.id, value]));
}

test("equal weighting produces 100, 50 and 0 at the scale boundaries", () => {
  assert.equal(calculateMatch(answers(4), answers(4)).score, 100);
  assert.equal(calculateMatch(answers(4), answers(2)).score, 50);
  assert.equal(calculateMatch(answers(4), answers(0)).score, 0);
  assert.equal(calculateMatch(answers(0), answers(4)).score, 0);
});

test("null and absent answers are omitted; a neutral answer still counts", () => {
  const result = calculateMatch(
    { transport: 4, education: 2, childcare: null, healthcare: 0 },
    { transport: 0, education: 2, childcare: 4, healthcare: null },
  );
  assert.equal(result.score, 50);
  assert.equal(result.comparedCount, 2);
  assert.equal(result.totalCount, 8);
  assert.deepEqual(result.closeThemes, ["教育"]);
  assert.deepEqual(result.differentThemes, ["公共交通"]);
});

test("no comparable information is unavailable, never a false 0 percent", () => {
  const result = calculateMatch({ transport: null }, { transport: 4 });
  assert.equal(result.score, null);
  assert.equal(result.comparedCount, 0);
  assert.deepEqual(result.closeThemes, []);
  assert.deepEqual(result.differentThemes, []);
});

test("explanations separate distance 0–1 from 2–4 and rounding happens once", () => {
  const result = calculateMatch(
    { transport: 4, education: 4, childcare: 4 },
    { transport: 4, education: 3, childcare: 2 },
  );
  assert.equal(result.score, 75);
  assert.deepEqual(result.closeThemes, ["公共交通", "教育"]);
  assert.deepEqual(result.differentThemes, ["子育て"]);
  assert.equal(
    calculateMatch(
      { transport: 4, education: 4, childcare: 4 },
      { transport: 4, education: 4, childcare: 3 },
    ).score,
    92,
  );
});

test("invalid and unknown inputs cannot contribute to or distort the score", () => {
  const invalid = {
    transport: Number.NaN,
    education: 5,
    childcare: -1,
    healthcare: 2.5,
    disaster: "4",
    unknown: 4,
  } as unknown as AnswerMap;
  assert.equal(
    calculateMatch(invalid, { ...answers(4), unknown: 4 }).score,
    null,
  );
  assert.equal(calculateMatch({ unknown: 4 }, { unknown: 4 }).comparedCount, 0);
});

test("every candidate is fictional with unknown facts; fixtures remain separate", () => {
  assert.deepEqual(
    candidates.map((candidate) => candidate.kana),
    ["さとう みさき", "たかはし けん", "たなか あや", "やまだ たろう"],
  );
  for (const candidate of candidates) {
    assert.equal(candidate.isFictional, true);
    assert.equal(candidate.age, null);
    assert.equal(candidate.party, null);
    assert.equal(candidate.status, null);
    assert.equal(candidate.district, null);
    assert.equal(calculateMatch(answers(2), candidate.answers).score, null);
    assert.equal(
      calculateMatch(answers(2), demoAnswerFixtures[candidate.id])
        .comparedCount,
      8,
    );
  }
});

test("local analytics require consent, strip answer data and unpublished IDs, ignore legacy variants and erase", () => {
  const stored = new Map<string, string>();
  const sessionStorage = {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => stored.set(key, value),
    removeItem: (key: string) => stored.delete(key),
  };
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const browser = { sessionStorage, location: { search: "" } };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: browser,
  });
  try {
    assert.equal(getAnalyticsConsent(), false);
    assert.equal(getVariant(), "standard");
    assert.equal(trackEvent("diagnosis_start"), false);
    assert.equal(stored.size, 0);

    browser.location.search = "?variant=policy";
    assert.equal(getVariant(), "standard");
    assert.equal(
      stored.size,
      0,
      "a legacy query parameter cannot create an experiment assignment or storage",
    );
    assert.equal(setAnalyticsConsent(true), true);
    browser.location.search = "";
    assert.equal(
      getVariant(),
      "standard",
      "ordinary browsing remains outside the research conditions",
    );

    assert.equal(
      trackEvent("diagnosis_answer", {
        candidateId: "sato-misaki",
        questionId: "transport",
        answer: 4,
        score: 92,
        answers: { transport: 4 },
      } as AnalyticsMetadata),
      true,
    );
    const data = JSON.parse(exportAnalytics());
    assert.equal(data.schemaVersion, 2);
    assert.equal(data.events.length, 1);
    assert.deepEqual(Object.keys(data.events[0]).sort(), [
      "event",
      "questionId",
      "timestamp",
      "variant",
    ]);
    assert.equal(data.events[0].variant, "standard");
    assert.equal(data.events[0].candidateId, undefined);
    assert.equal(data.containsPolicyAnswers, false);

    stored.set("unrelated.key", "preserve");
    eraseAnalytics();
    assert.equal(getAnalyticsConsent(), false);
    assert.equal(trackEvent("diagnosis_complete"), false);
    assert.deepEqual(JSON.parse(exportAnalytics()).events, []);
    assert.deepEqual([...stored.keys()], ["unrelated.key"]);
  } finally {
    if (originalWindow)
      Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
});

test("unavailable browser storage does not interrupt the diagnosis", () => {
  assert.equal(getAnalyticsConsent(), false);
  assert.equal(getVariant(), "standard");
  assert.equal(setAnalyticsConsent(true), false);
  assert.equal(
    trackEvent("candidate_view", { candidateId: "sato-misaki" }),
    false,
  );
  assert.deepEqual(JSON.parse(exportAnalytics()).events, []);
});
