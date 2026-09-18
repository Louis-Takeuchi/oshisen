"use client";
import { useEffect, useState } from "react";
import { questions } from "../lib/data.ts";
import {
  createPolicyAnswerRecord,
  hasMatchingPolicyVersion,
  isUserPolicyAnswer,
  type PolicyAnswerRecord,
} from "../lib/policy.ts";
export type DiagnosisState = {
  answers: Record<string, PolicyAnswerRecord>;
  index: number;
  complete: boolean;
  staleQuestionIds?: string[];
};
export const diagnosisKey = "oshisen:diagnosis:v2";
export const emptyDiagnosis = (): DiagnosisState => ({
  answers: {},
  index: 0,
  complete: false,
});
let memoryState: DiagnosisState | null = null;
/** Old midpoint answers are ambiguous and must never migrate to neutral answers. */
export function sanitizeDiagnosis(raw: unknown): DiagnosisState {
  if (!raw || typeof raw !== "object") return emptyDiagnosis();
  const saved = raw as Record<string, unknown>;
  const records =
    saved.answers && typeof saved.answers === "object"
      ? (saved.answers as Record<string, unknown>)
      : {};
  const answers: DiagnosisState["answers"] = {};
  const stale = new Set<string>(
    Array.isArray(saved.staleQuestionIds)
      ? saved.staleQuestionIds.filter(
          (id): id is string =>
            typeof id === "string" && questions.some((q) => q.id === id),
        )
      : [],
  );
  for (const q of questions) {
    const value = records[q.id];
    if (!value || typeof value !== "object") continue;
    const record = value as PolicyAnswerRecord;
    if (!hasMatchingPolicyVersion(q, record)) {
      stale.add(q.id);
      continue;
    }
    if (!isUserPolicyAnswer(record.answer)) continue;
    stale.delete(q.id);
    const answer = record.answer;
    // Pick allowed fields, never persist imported free text or extra identifiers.
    answers[q.id] = createPolicyAnswerRecord(
      q,
      answer.status === "answered"
        ? { status: "answered", value: answer.value }
        : answer.status === "undecided"
          ? {
              status: "undecided",
              ...(answer.reason ? { reason: answer.reason } : {}),
            }
          : { status: "skipped" },
    );
  }
  return {
    answers,
    ...(stale.size ? { staleQuestionIds: [...stale] } : {}),
    index: Math.min(
      questions.length - 1,
      Math.max(0, Number.isInteger(saved.index) ? (saved.index as number) : 0),
    ),
    complete:
      saved.complete === true &&
      questions.every((q) => Object.hasOwn(answers, q.id)),
  };
}
export function readDiagnosis(): DiagnosisState {
  if (memoryState) return sanitizeDiagnosis(memoryState);
  try {
    return sanitizeDiagnosis(
      JSON.parse(sessionStorage.getItem(diagnosisKey) || "null"),
    );
  } catch {
    return emptyDiagnosis();
  }
}
export function writeDiagnosis(state: DiagnosisState) {
  memoryState = sanitizeDiagnosis(state);
  try {
    sessionStorage.setItem(diagnosisKey, JSON.stringify(memoryState));
  } catch {
    /* In-memory fallback. */
  }
  window.dispatchEvent(new Event("oshisen:diagnosis-change"));
}
export function clearDiagnosis() {
  memoryState = emptyDiagnosis();
  let cleared = true;
  for (const key of [diagnosisKey, "oshisen:diagnosis:v1"]) {
    try {
      sessionStorage.removeItem(key);
    } catch {
      cleared = false;
    }
  }
  if (cleared) memoryState = null;
  window.dispatchEvent(new Event("oshisen:diagnosis-change"));
  return cleared;
}
export function useDiagnosis() {
  const [state, setState] = useState<DiagnosisState>(emptyDiagnosis);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const update = () => {
      setState(readDiagnosis());
      setReady(true);
    };
    update();
    window.addEventListener("oshisen:diagnosis-change", update);
    return () => window.removeEventListener("oshisen:diagnosis-change", update);
  }, []);
  return {
    state,
    ready,
    save: (next: DiagnosisState) => {
      const clean = sanitizeDiagnosis(next);
      setState(clean);
      writeDiagnosis(clean);
    },
  };
}
