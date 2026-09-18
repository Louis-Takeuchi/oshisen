/** Historical algorithm retained only for regression tests; never import into the app. */
import { questions } from "../../lib/data.ts";
import type { AnswerMap, AnswerValue } from "../fixtures/legacy-data.ts";

export interface MatchResult {
  /** Null means there is no valid shared answer, not zero agreement. */
  readonly score: number | null;
  readonly comparedCount: number;
  readonly totalCount: number;
  readonly closeThemes: readonly string[];
  readonly differentThemes: readonly string[];
}

export function isAnswerValue(value: unknown): value is AnswerValue {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 4
  );
}

/**
 * Equal-weight mean proximity on the five-option scale:
 * round(100 × (1 − sum(abs(user − candidate)) / (4 × shared answers))).
 * Only the published question ids participate. Null/undefined/invalid answers
 * are omitted for both parties, and coverage must be displayed with the score.
 * Distance 0–1 is "close"; distance 2–4 is "different" for explanatory labels.
 * No demographic, personality, engagement, or political-preference weighting.
 */
export function calculateMatch(
  userAnswers: AnswerMap,
  candidateAnswers: AnswerMap,
): MatchResult {
  let totalDistance = 0;
  let comparedCount = 0;
  const closeThemes: string[] = [];
  const differentThemes: string[] = [];

  for (const question of questions) {
    const user = userAnswers[question.id];
    const candidate = candidateAnswers[question.id];
    if (!isAnswerValue(user) || !isAnswerValue(candidate)) continue;

    const distance = Math.abs(user - candidate);
    totalDistance += distance;
    comparedCount += 1;
    if (distance <= 1) closeThemes.push(question.theme);
    else differentThemes.push(question.theme);
  }

  return {
    score:
      comparedCount === 0
        ? null
        : Math.round(100 * (1 - totalDistance / (4 * comparedCount))),
    comparedCount,
    totalCount: questions.length,
    closeThemes,
    differentThemes,
  };
}
