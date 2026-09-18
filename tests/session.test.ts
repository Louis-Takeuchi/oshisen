import assert from "node:assert/strict";
import { test } from "node:test";
import { questions } from "../lib/data.ts";
import {
  clearDiagnosis,
  emptyDiagnosis,
  readDiagnosis,
  writeDiagnosis,
  type DiagnosisState,
  diagnosisKey,
  sanitizeDiagnosis,
} from "../components/session.ts";

import {
  createPolicyAnswerRecord,
  type UserPolicyAnswer,
} from "../lib/policy.ts";
const record = (id: string, value: number | null) =>
  createPolicyAnswerRecord(
    questions.find((q) => q.id === id)!,
    value === null
      ? { status: "skipped" }
      : ({ status: "answered", value } as UserPolicyAnswer),
  );

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
          transport: record("transport", 0),
          education: record("education", 4),
          childcare: record("childcare", null),
          healthcare: 7,
          disaster: "3",
          unknown: 4,
        },
        index: 999,
        complete: true,
      }),
    );
    assert.deepEqual(readDiagnosis(), {
      answers: {
        transport: record("transport", 0),
        education: record("education", 4),
        childcare: record("childcare", null),
      },
      index: 7,
      complete: false,
    });
  });
});

test("explicit skips count toward completion but do not become neutral answers", () => {
  withSession(({ stored }) => {
    const answers = Object.fromEntries(
      questions.map((question) => [question.id, record(question.id, null)]),
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
      answers: {
        transport: record("transport", 4),
        education: record("education", null),
      },
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
      answers: { transport: record("transport", 0) },
      index: 1,
      complete: false,
    };
    const after: DiagnosisState = {
      answers: {
        transport: record("transport", 4),
        education: record("education", 2),
      },
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
      answers: { transport: record("transport", 2) },
      index: 1,
      complete: false,
    };
    writeDiagnosis(next);
    assert.deepEqual(readDiagnosis(), next);
    clearDiagnosis();
    assert.deepEqual(readDiagnosis(), emptyDiagnosis());
  });
});

test("failed deletion clears memory without restoring stale saved answers or touching unrelated keys", () => {
  withSession(({ stored, storage, notifications }) => {
    const saved: DiagnosisState = {
      answers: {
        transport: record("transport", 4),
        education: record("education", 1),
      },
      index: 2,
      complete: false,
    };
    stored.set("unrelated.preference", "preserve");
    writeDiagnosis(saved);
    assert.deepEqual(readDiagnosis(), saved);
    const persisted = stored.get(diagnosisKey);
    const removeItem = storage.removeItem;
    storage.removeItem = () => {
      throw new Error("Storage deletion is blocked");
    };
    try {
      notifications.length = 0;
      assert.equal(clearDiagnosis(), false);
      assert.equal(stored.get(diagnosisKey), persisted);
      assert.deepEqual(readDiagnosis(), emptyDiagnosis());
      assert.deepEqual(readDiagnosis(), emptyDiagnosis());
      assert.deepEqual(notifications, ["oshisen:diagnosis-change"]);
      assert.equal(stored.get("unrelated.preference"), "preserve");

      storage.removeItem = removeItem;
      assert.deepEqual(
        readDiagnosis(),
        emptyDiagnosis(),
        "recovering storage access must not revive the previously cleared answers",
      );
      assert.equal(clearDiagnosis(), true);
      assert.deepEqual(readDiagnosis(), emptyDiagnosis());
      assert.deepEqual([...stored], [["unrelated.preference", "preserve"]]);
    } finally {
      storage.removeItem = removeItem;
    }
  });
});

test("old numeric records and stale question, scale or help versions cannot migrate", () => {
  for (const version of ["questionVersion", "scaleVersion", "contextVersion"]) {
    const stale = { ...record("transport", 2), [version]: "old" };
    assert.deepEqual(
      sanitizeDiagnosis({ answers: { transport: stale }, complete: true })
        .answers,
      {},
    );
  }
  withSession(({ stored }) => {
    stored.set(
      "oshisen:diagnosis:v1",
      JSON.stringify({ answers: { transport: 2 }, complete: true }),
    );
    assert.deepEqual(readDiagnosis(), emptyDiagnosis());
    stored.set(diagnosisKey, JSON.stringify({ answers: { transport: 2 } }));
    assert.deepEqual(readDiagnosis().answers, {});
    clearDiagnosis();
    assert.equal(stored.has("oshisen:diagnosis:v1"), false);
  });
});

test("neutral, undecided, skipped and unanswered keep different meanings and strip free text", () => {
  const answers = {
    transport: record("transport", 2),
    education: {
      ...createPolicyAnswerRecord(questions[1], {
        status: "undecided",
        reason: "needs-information",
      }),
      privateNote: "secret",
    },
    childcare: record("childcare", null),
  };
  const state = sanitizeDiagnosis({ answers, complete: true });
  assert.deepEqual(state.answers.transport.answer, {
    status: "answered",
    value: 2,
  });
  assert.deepEqual(state.answers.education.answer, {
    status: "undecided",
    reason: "needs-information",
  });
  assert.deepEqual(state.answers.childcare.answer, { status: "skipped" });
  assert.equal(state.answers.healthcare, undefined);
  assert.equal(state.complete, false);
  assert.equal(JSON.stringify(state).includes("secret"), false);
});
