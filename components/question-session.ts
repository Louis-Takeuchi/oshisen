"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { District } from "../lib/election2026.ts";
import {
  createUserAnswerRecord,
  getSentQuestion,
  hasMatchingVersion,
  isUserAnswer,
  questionsForDistrict,
  sentQuestions,
  type DistrictChoice,
  type UserAnswerRecord,
} from "../lib/election2026.ts";

/**
 * 候補者送付版（2026-10-30）・7段階の回答セッション。
 * 保存キーを v3 に変更し、旧版（v1/v2：5段階の草案）の回答は読み込まない。
 * 回答はこのブラウザのタブ内（sessionStorage）だけに保存し、サーバーへは送らない。
 */
export type QuestionSessionState = {
  district: DistrictChoice | null;
  answers: Record<string, UserAnswerRecord>;
  index: number;
  complete: boolean;
};

export const questionSessionKey = "oshisen:diagnosis:v3";
const legacyKeys = ["oshisen:diagnosis:v1", "oshisen:diagnosis:v2"] as const;
const changeEvent = "oshisen:diagnosis-change";

export const emptyQuestionSession = (): QuestionSessionState => ({
  district: null,
  answers: {},
  index: 0,
  complete: false,
});

let memoryState: QuestionSessionState | null = null;

function isDistrictChoice(value: unknown): value is DistrictChoice {
  return value === "tsukuba" || value === "tsuchiura" || value === "undecided";
}

/** 旧版・壊れたデータ・版違いの回答は取り込まない。 */
export function sanitizeQuestionSession(raw: unknown): QuestionSessionState {
  if (!raw || typeof raw !== "object") return emptyQuestionSession();
  const saved = raw as Record<string, unknown>;
  const district = isDistrictChoice(saved.district) ? saved.district : null;
  const records =
    saved.answers && typeof saved.answers === "object"
      ? (saved.answers as Record<string, unknown>)
      : {};
  const answers: QuestionSessionState["answers"] = {};
  for (const question of sentQuestions) {
    const value = records[question.id];
    if (!value || typeof value !== "object") continue;
    const record = value as UserAnswerRecord;
    if (!hasMatchingVersion(question, record)) continue;
    if (!isUserAnswer(record.answer)) continue;
    const answer = record.answer;
    // 保存するフィールドを限定し、持ち込まれた余分な値を永続化しない。
    answers[question.id] = createUserAnswerRecord(
      question,
      answer.status === "answered"
        ? { status: "answered", value: answer.value }
        : { status: "non-answer", kind: answer.kind },
    );
  }
  const flowLength = district
    ? questionsForDistrict(district).length
    : sentQuestions.length;
  const flow = district ? questionsForDistrict(district) : [];
  return {
    district,
    answers,
    index: Math.min(
      Math.max(flowLength - 1, 0),
      Math.max(0, Number.isInteger(saved.index) ? (saved.index as number) : 0),
    ),
    complete:
      saved.complete === true &&
      district !== null &&
      flow.every((question) => Object.hasOwn(answers, question.id)),
  };
}

export function readQuestionSession(): QuestionSessionState {
  if (memoryState) return sanitizeQuestionSession(memoryState);
  try {
    return sanitizeQuestionSession(
      JSON.parse(sessionStorage.getItem(questionSessionKey) || "null"),
    );
  } catch {
    return emptyQuestionSession();
  }
}

export function writeQuestionSession(state: QuestionSessionState) {
  memoryState = sanitizeQuestionSession(state);
  try {
    sessionStorage.setItem(questionSessionKey, JSON.stringify(memoryState));
  } catch {
    /* 保存できない環境では画面内だけで保持する。 */
  }
  window.dispatchEvent(new Event(changeEvent));
}

export function clearQuestionSession() {
  memoryState = emptyQuestionSession();
  let cleared = true;
  for (const key of [questionSessionKey, ...legacyKeys]) {
    try {
      sessionStorage.removeItem(key);
    } catch {
      cleared = false;
    }
  }
  if (cleared) memoryState = null;
  window.dispatchEvent(new Event(changeEvent));
  return cleared;
}

export function useQuestionSession() {
  const [state, setState] = useState<QuestionSessionState>(
    emptyQuestionSession,
  );
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const update = () => {
      setState(readQuestionSession());
      setReady(true);
    };
    update();
    window.addEventListener(changeEvent, update);
    return () => window.removeEventListener(changeEvent, update);
  }, []);
  return {
    state,
    ready,
    save: (next: QuestionSessionState) => {
      const clean = sanitizeQuestionSession(next);
      setState(clean);
      writeQuestionSession(clean);
    },
  };
}

function subscribeToSession(callback: () => void) {
  window.addEventListener(changeEvent, callback);
  return () => window.removeEventListener(changeEvent, callback);
}

/**
 * 候補者一覧・動画・比較の初期選挙区：利用者が質問で選んだ選挙区（未選択ならつくば市）。
 * SSRでは「つくば市」を返し、クライアントで保存値に同期する。
 */
export function useSavedDistrictDefault(): District {
  return useSyncExternalStore(
    subscribeToSession,
    () => (readQuestionSession().district === "tsuchiura" ? "tsuchiura" : "tsukuba"),
    () => "tsukuba",
  );
}

/** /q/[ID] から1問だけ答えたときに使う（進行位置は変えない）。 */
export function saveSingleAnswer(
  questionId: string,
  record: UserAnswerRecord,
) {
  const question = getSentQuestion(questionId);
  if (!question) return;
  const current = readQuestionSession();
  writeQuestionSession({
    ...current,
    complete: false,
    answers: { ...current.answers, [question.id]: record },
  });
}
