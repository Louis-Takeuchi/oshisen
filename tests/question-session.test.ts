import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clearQuestionSession,
  emptyQuestionSession,
  questionSessionKey,
  readQuestionSession,
  sanitizeQuestionSession,
  writeQuestionSession,
  type QuestionSessionState,
} from "../components/question-session.ts";
import {
  SCALE_VERSION,
  createUserAnswerRecord,
  getSentQuestion,
} from "../lib/election2026.ts";

function withSession(
  run: (session: {
    stored: Map<string, string>;
    notifications: string[];
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
  clearQuestionSession();
  notifications.length = 0;
  try {
    run({ stored, notifications });
  } finally {
    clearQuestionSession();
    for (const [key, original] of originals) {
      if (original) Object.defineProperty(globalThis, key, original);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
}

const record = (id: string, value: 1 | 2 | 3 | 4 | 5 | 6 | 7) =>
  createUserAnswerRecord(getSentQuestion(id)!, { status: "answered", value });

test("保存キーはv3で、旧版（v1・v2）の回答は読み込まない", () => {
  assert.equal(questionSessionKey, "oshisen:diagnosis:v3");
  withSession(({ stored }) => {
    stored.set(
      "oshisen:diagnosis:v2",
      JSON.stringify({
        answers: {
          transport: {
            questionId: "transport",
            questionVersion: "draft-2026-09-18-v1",
            scaleVersion: "agreement-5-v1",
            contextVersion: "draft-help-2026-09-18-v1",
            answer: { status: "answered", value: 4 },
          },
        },
        index: 3,
        complete: false,
      }),
    );
    assert.deepEqual(readQuestionSession(), emptyQuestionSession());
    clearQuestionSession();
    assert.equal(stored.has("oshisen:diagnosis:v2"), false, "旧キーは削除する");
  });
});

test("選挙区と7段階の回答を保存し、復元時に検証する", () => {
  withSession(({ stored }) => {
    const state: QuestionSessionState = {
      district: "tsuchiura",
      answers: {
        P01: record("P01", 6),
        U01: record("U01", 2),
      },
      index: 1,
      complete: false,
    };
    writeQuestionSession(state);
    const restored = sanitizeQuestionSession(
      JSON.parse(stored.get(questionSessionKey)!),
    );
    assert.equal(restored.district, "tsuchiura");
    assert.deepEqual(restored.answers.P01.answer, {
      status: "answered",
      value: 6,
    });
    assert.equal(restored.answers.P01.scaleVersion, SCALE_VERSION);
    assert.equal(restored.index, 1);
  });
});

test("壊れたデータ・版違い・範囲外の値は取り込まない", () => {
  const broken = sanitizeQuestionSession({
    district: "mito",
    answers: {
      P01: {
        questionId: "P01",
        questionVersion: "違う版",
        scaleVersion: SCALE_VERSION,
        answer: { status: "answered", value: 6 },
      },
      P02: {
        questionId: "P02",
        questionVersion: getSentQuestion("P02")!.version,
        scaleVersion: SCALE_VERSION,
        answer: { status: "answered", value: 9 },
      },
      P03: {
        questionId: "P03",
        questionVersion: getSentQuestion("P03")!.version,
        scaleVersion: SCALE_VERSION,
        answer: { status: "non-answer", kind: "premise-objection" },
      },
    },
    index: 99,
    complete: true,
  });
  assert.equal(broken.district, null);
  assert.deepEqual(Object.keys(broken.answers), ["P03"]);
  assert.equal(broken.complete, false);
  assert.deepEqual(sanitizeQuestionSession(null), emptyQuestionSession());
  assert.deepEqual(sanitizeQuestionSession("x"), emptyQuestionSession());
});

test("completeは選挙区のフロー全問に回答があるときだけ", () => {
  const answers: QuestionSessionState["answers"] = {};
  for (const id of ["P01", "P02", "P03", "P04", "P05", "P06"]) {
    answers[id] = record(id, 4);
  }
  const incomplete = sanitizeQuestionSession({
    district: "tsukuba",
    answers,
    index: 7,
    complete: true,
  });
  assert.equal(incomplete.complete, false, "T01・T02が未回答");
  const undecided = sanitizeQuestionSession({
    district: "undecided",
    answers,
    index: 5,
    complete: true,
  });
  assert.equal(undecided.complete, true, "共通6問のみで完了");
});
