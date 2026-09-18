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

test("all supported event types including candidate saves require consent", () => {
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

test("normal browsing ignores legacy experiment URLs and never assigns a study arm", () => {
  withBrowser(({ location, stored }) => {
    stored.set("oshisen.analytics.consent.v1", "true");
    stored.set("oshisen.analytics.variant.v1", "policy");
    assert.equal(getAnalyticsConsent(), false);
    for (const variant of ["policy", "policy-humanity", "B", "C"]) {
      location.search = `?variant=${variant}`;
      assert.equal(getVariant(), "standard");
    }
    setAnalyticsConsent(true);
    trackEvent("diagnosis_start");
    assert.equal(events()[0].variant, "standard");
    eraseAnalytics();
    assert.equal(stored.size, 0);
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
    stored.set("oshisen.analytics.events.v2", "broken-json");
    assert.deepEqual(events(), []);
    stored.set(
      "oshisen.analytics.events.v2",
      JSON.stringify([
        null,
        {
          event: "diagnosis_start",
          timestamp: "not-a-date",
          variant: "standard",
        },
        {
          event: "unknown",
          timestamp: "2026-01-01T00:00:00.000Z",
          variant: "standard",
        },
        {
          event: "diagnosis_answer",
          timestamp: "2026-01-01T00:00:00.000Z",
          variant: "standard",
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

test("failed deletion revokes consent in memory until a successful explicit opt-in", () => {
  withBrowser(({ stored, storage }) => {
    stored.set("oshisen:diagnosis:v1", "unrelated diagnosis state");
    stored.set("unrelated.preference", "preserve");
    assert.equal(setAnalyticsConsent(true), true);
    assert.equal(trackEvent("diagnosis_start"), true);
    assert.equal(events().length, 1);
    const persisted = [...stored];
    const removeItem = storage.removeItem;
    storage.removeItem = () => {
      throw new Error("Storage deletion is blocked");
    };
    try {
      assert.equal(eraseAnalytics(), false);
      assert.deepEqual([...stored], persisted);
      assert.equal(getAnalyticsConsent(), false);
      assert.equal(trackEvent("candidate_view"), false);
      assert.deepEqual(events(), []);
      assert.deepEqual(
        [...stored],
        persisted,
        "revoked recording must not append events even when stale consent remains readable",
      );

      assert.equal(setAnalyticsConsent(true), true);
      assert.equal(getAnalyticsConsent(), true);
      assert.equal(trackEvent("diagnosis_complete"), true);
      assert.equal(events().at(-1)?.event, "diagnosis_complete");
      assert.equal(
        stored.get("oshisen:diagnosis:v1"),
        "unrelated diagnosis state",
      );
      assert.equal(stored.get("unrelated.preference"), "preserve");

      storage.removeItem = removeItem;
      assert.equal(eraseAnalytics(), true);
      assert.equal(getAnalyticsConsent(), false);
      assert.deepEqual(
        [...stored],
        [
          ["oshisen:diagnosis:v1", "unrelated diagnosis state"],
          ["unrelated.preference", "preserve"],
        ],
      );
    } finally {
      storage.removeItem = removeItem;
      eraseAnalytics();
    }
  });
});
