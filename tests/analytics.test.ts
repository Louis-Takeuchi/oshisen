import assert from "node:assert/strict";
import { test } from "node:test";
import {
  analyticsEvents,
  eraseAnalytics,
  exportAnalytics,
  getAnalyticsConsent,
  getVariant,
  setAnalyticsConsent,
  trackEvent,
  type AnalyticsEvent,
  type AnalyticsEventName,
  type AnalyticsMetadata,
} from "../lib/analytics.ts";

function withBrowser(
  run: (browser: {
    stored: Map<string, string>;
    location: { search: string };
    storage: {
      getItem: (key: string) => string | null;
      setItem: (key: string, value: string) => void;
      removeItem: (key: string) => void;
    };
  }) => void,
) {
  const stored = new Map<string, string>();
  const location = { search: "" };
  const storage = {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => {
      stored.set(key, value);
    },
    removeItem: (key: string) => {
      stored.delete(key);
    },
  };
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { sessionStorage: storage, location },
  });
  try {
    run({ stored, location, storage });
  } finally {
    if (originalWindow)
      Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
}

function events(): AnalyticsEvent[] {
  return JSON.parse(exportAnalytics()).events;
}

test("all ten required event types can be recorded only after consent", () => {
  withBrowser(({ stored }) => {
    for (const event of analyticsEvents) assert.equal(trackEvent(event), false);
    assert.equal(stored.size, 0);
    assert.equal(setAnalyticsConsent(true), true);
    for (const event of analyticsEvents) assert.equal(trackEvent(event), true);
    assert.deepEqual(
      events().map((item) => item.event),
      [...analyticsEvents],
    );
    assert.equal(trackEvent("arbitrary_event" as AnalyticsEventName), false);
    assert.equal(events().length, analyticsEvents.length);
  });
});

test("a consenting experiment assignment survives navigation and conflicting URLs", () => {
  withBrowser(({ location, stored }) => {
    location.search = "?variant=policy";
    assert.equal(getVariant(), "policy");
    assert.equal(
      stored.size,
      0,
      "query-only previews do not store without consent",
    );
    setAnalyticsConsent(true);
    trackEvent("diagnosis_start");
    location.search = "";
    assert.equal(getVariant(), "policy");
    location.search = "?variant=policy-humanity";
    assert.equal(
      getVariant(),
      "policy",
      "a later URL cannot contaminate the assignment",
    );
    setAnalyticsConsent(true);
    trackEvent("candidate_view");
    assert.deepEqual(
      events().map((item) => item.variant),
      ["policy", "policy"],
    );
    eraseAnalytics();
    assert.equal(getVariant(), "policy-humanity");
    setAnalyticsConsent(true);
    trackEvent("diagnosis_start");
    assert.equal(
      events()[0].variant,
      "policy-humanity",
      "erasing permits a new assignment",
    );
  });
});

test("consenting without an explicit variant remains in the default group", () => {
  withBrowser(({ location }) => {
    location.search = "?variant=unexpected";
    setAnalyticsConsent(true);
    assert.equal(getVariant(), "policy-humanity");
    location.search = "?variant=policy";
    assert.equal(getVariant(), "policy-humanity");
  });
});

test("no answer, score, URL or free-text field is accepted even at runtime", () => {
  withBrowser(() => {
    setAnalyticsConsent(true);
    trackEvent("diagnosis_answer", {
      candidateId: "https://example.test/private?answer=4",
      questionId: "answer=4",
      answer: 4,
      score: 100,
      note: "private note",
    } as AnalyticsMetadata);
    assert.deepEqual(Object.keys(events()[0]).sort(), [
      "event",
      "timestamp",
      "variant",
    ]);
    assert.equal(exportAnalytics().includes("private"), false);
  });
});

test("malformed and tampered stored events are sanitized when exported", () => {
  withBrowser(({ stored }) => {
    setAnalyticsConsent(true);
    stored.set("oshisen.analytics.events.v1", "broken-json");
    assert.deepEqual(events(), []);
    stored.set(
      "oshisen.analytics.events.v1",
      JSON.stringify([
        null,
        {
          event: "diagnosis_start",
          timestamp: "not-a-date",
          variant: "policy",
        },
        {
          event: "unknown",
          timestamp: "2026-01-01T00:00:00.000Z",
          variant: "policy",
        },
        {
          event: "diagnosis_answer",
          timestamp: "2026-01-01T00:00:00.000Z",
          variant: "policy",
          questionId: "transport",
          answer: 4,
          score: 100,
        },
      ]),
    );
    assert.equal(events().length, 1);
    assert.deepEqual(Object.keys(events()[0]).sort(), [
      "event",
      "questionId",
      "timestamp",
      "variant",
    ]);
  });
});

test("event history is bounded and revoking consent removes experiment and events", () => {
  withBrowser(({ stored }) => {
    setAnalyticsConsent(true);
    for (let index = 0; index < 510; index++)
      trackEvent("diagnosis_answer", { questionId: "transport" });
    assert.equal(events().length, 500);
    stored.set("oshisen:diagnosis:v1", "unrelated diagnosis state");
    setAnalyticsConsent(false);
    assert.equal(getAnalyticsConsent(), false);
    assert.deepEqual(events(), []);
    assert.deepEqual([...stored.keys()], ["oshisen:diagnosis:v1"]);
  });
});

test("storage failures return a truthful failure without crashing the interaction", () => {
  withBrowser(({ storage }) => {
    storage.setItem = () => {
      throw new Error("Storage is unavailable");
    };
    assert.equal(setAnalyticsConsent(true), false);
    assert.equal(getAnalyticsConsent(), false);
    assert.equal(trackEvent("diagnosis_start"), false);
    assert.deepEqual(events(), []);
  });
});
