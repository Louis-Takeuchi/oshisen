import assert from "node:assert/strict";
import { test } from "node:test";
import { questions } from "../lib/data.ts";
import {
  clearDiagnosis,
  emptyDiagnosis,
  readDiagnosis,
  writeDiagnosis,
  type DiagnosisState,
} from "../components/session.ts";

const diagnosisKey = "oshisen:diagnosis:v1";

function withSession(
  run: (session: {
    stored: Map<string, string>;
    notifications: string[];
    storage: {
      getItem: (key: string) => string | null;
      setItem: (key: string, value: string) => void;
      removeItem: (key: string) => void;
    };
  }) => void,
) {
  const stored = new Map<string, string>();
  const notifications: string[] = [];
  const storage = {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => {
      stored.set(key, value);
    },
    removeItem: (key: string) => {
      stored.delete(key);
    },
  };
  const originals = new Map(
    ["window", "sessionStorage"].map(
      (key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const,
    ),
  );
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: storage,
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      dispatchEvent: (event: Event) => {
        notifications.push(event.type);
      },
    },
  });
  clearDiagnosis();
  notifications.length = 0;
  try {
    run({ stored, notifications, storage });
  } finally {
    clearDiagnosis();
    for (const [key, original] of originals) {
      if (original) Object.defineProperty(globalThis, key, original);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
}

test("fresh and malformed saved diagnosis state start empty", () => {
  withSession(({ stored }) => {
    assert.deepEqual(readDiagnosis(), emptyDiagnosis());
    stored.set(diagnosisKey, "not-json");
    assert.deepEqual(readDiagnosis(), emptyDiagnosis());
  });
});

test("restored answers are validated and incomplete data cannot claim completion", () => {
  withSession(({ stored }) => {
    stored.set(
      diagnosisKey,
      JSON.stringify({
        answers: {
          transport: 0,
          education: 4,
          childcare: null,
          healthcare: 7,
          disaster: "3",
          unknown: 4,
        },
        index: 999,
        complete: true,
      }),
    );
    assert.deepEqual(readDiagnosis(), {
      answers: { transport: 0, education: 4, childcare: null },
      index: 7,
      complete: false,
    });
  });
});

test("explicit skips count toward completion but do not become neutral answers", () => {
  withSession(({ stored }) => {
    const answers = Object.fromEntries(
      questions.map((question) => [question.id, null]),
    );
    stored.set(
      diagnosisKey,
      JSON.stringify({ answers, index: 7, complete: true }),
    );
    assert.deepEqual(readDiagnosis(), { answers, index: 7, complete: true });
  });
});

test("answers and position persist on a successful write and clear together", () => {
  withSession(({ stored, notifications }) => {
    const next: DiagnosisState = {
      answers: { transport: 4, education: null },
      index: 2,
      complete: false,
    };
    writeDiagnosis(next);
    assert.deepEqual(readDiagnosis(), next);
    assert.deepEqual(JSON.parse(stored.get(diagnosisKey)!), next);
    assert.deepEqual(notifications, ["oshisen:diagnosis-change"]);
    clearDiagnosis();
    assert.deepEqual(readDiagnosis(), emptyDiagnosis());
    assert.equal(stored.has(diagnosisKey), false);
  });
});

test("a failed storage write keeps newest answers instead of restoring stale saved progress", () => {
  withSession(({ storage }) => {
    const before: DiagnosisState = {
      answers: { transport: 0 },
      index: 1,
      complete: false,
    };
    const after: DiagnosisState = {
      answers: { transport: 4, education: 2 },
      index: 2,
      complete: false,
    };
    writeDiagnosis(before);
    storage.setItem = () => {
      throw new Error("Quota exceeded");
    };
    writeDiagnosis(after);
    assert.deepEqual(readDiagnosis(), after);
  });
});

test("fully blocked storage retains session progress in memory", () => {
  withSession(({ storage }) => {
    storage.getItem = () => {
      throw new Error("Access denied");
    };
    storage.setItem = () => {
      throw new Error("Access denied");
    };
    const next: DiagnosisState = {
      answers: { transport: 2 },
      index: 1,
      complete: false,
    };
    writeDiagnosis(next);
    assert.deepEqual(readDiagnosis(), next);
    clearDiagnosis();
    assert.deepEqual(readDiagnosis(), emptyDiagnosis());
  });
});
