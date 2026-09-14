"use client";
import { useEffect, useState } from "react";
import { questions, type AnswerValue } from "../lib/data.ts";
export type DiagnosisState = {
  answers: Record<string, AnswerValue | null>;
  index: number;
  complete: boolean;
};
const key = "oshisen:diagnosis:v1";
export const emptyDiagnosis = (): DiagnosisState => ({
  answers: {},
  index: 0,
  complete: false,
});
let memoryState: DiagnosisState | null = null;
export function readDiagnosis(): DiagnosisState {
  if (memoryState) return memoryState;
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || "null");
    if (!saved || typeof saved !== "object")
      return memoryState ?? emptyDiagnosis();
    const answers: DiagnosisState["answers"] = {};
    for (const q of questions) {
      const value = saved.answers?.[q.id];
      if (
        value === null ||
        (Number.isInteger(value) && value >= 0 && value <= 4)
      )
        answers[q.id] = value;
    }
    return {
      answers,
      index: Math.min(
        questions.length - 1,
        Math.max(0, Number.isInteger(saved.index) ? saved.index : 0),
      ),
      complete:
        saved.complete === true && questions.every((q) => q.id in answers),
    };
  } catch {
    return memoryState ?? emptyDiagnosis();
  }
}
export function writeDiagnosis(state: DiagnosisState) {
  memoryState = state;
  try {
    sessionStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* Memory keeps the flow usable if tab storage is blocked. */
  }
  window.dispatchEvent(new Event("oshisen:diagnosis-change"));
}
export function clearDiagnosis() {
  memoryState = emptyDiagnosis();
  let cleared = false;
  try {
    sessionStorage.removeItem(key);
    cleared = true;
    memoryState = null;
  } catch {
    /* Storage may be unavailable. */
  }
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
      setState(next);
      writeDiagnosis(next);
    },
  };
}
