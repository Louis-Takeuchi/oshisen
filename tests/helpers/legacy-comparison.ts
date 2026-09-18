/** Historical distance-based comparison retained only for regression tests. */
import {
  answerOptions,
  questions,
  type Candidate,
  type Question,
} from "../../lib/data.ts";
import type { AnswerMap, AnswerValue } from "../fixtures/legacy-data.ts";
import { isAnswerValue } from "./legacy-matching.ts";

export interface PolicyComparisonRow {
  readonly question: Question;
  readonly left: AnswerValue | null;
  readonly right: AnswerValue | null;
  /** A missing answer is unavailable, never a neutral position or disagreement. */
  readonly distance: number | null;
  readonly isDifferent: boolean;
}

/** Keep the published question order; do not sort by engagement or user views. */
export function comparisonRows(
  leftAnswers: AnswerMap,
  rightAnswers: AnswerMap,
): readonly PolicyComparisonRow[] {
  return questions.map((question) => {
    const leftValue = leftAnswers[question.id];
    const rightValue = rightAnswers[question.id];
    const left = isAnswerValue(leftValue) ? leftValue : null;
    const right = isAnswerValue(rightValue) ? rightValue : null;
    const distance =
      left === null || right === null ? null : Math.abs(left - right);
    return {
      question,
      left,
      right,
      distance,
      isDifferent: distance !== null && distance >= 2,
    };
  });
}

/** Unknown ids and duplicates cannot create a column; columns use kana order. */
export function selectComparisonCandidates(
  ids: readonly string[],
  entries: readonly Candidate[] = [],
): readonly Candidate[] {
  return [...entries]
    .sort((a, b) => a.kana.localeCompare(b.kana, "ja"))
    .filter((candidate) => ids.includes(candidate.id))
    .slice(0, 2);
}

export function answerLabel(value: unknown): string {
  return (
    answerOptions.find((option) => option.value === value)?.label ?? "未掲載"
  );
}
