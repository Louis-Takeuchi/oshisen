import type { PolicyQuestion } from "./question-ledger.ts";

/** Stable public URLs; questionnaire versions remain in the question ledger. */
export const electionHubPath = "/ibaraki-2026/tsukuba";

export function issuePagePath(theme: string): string {
  return `${electionHubPath}/issues/${encodeURIComponent(theme)}`;
}

export function issuePageDescription(question: PolicyQuestion): string {
  return `2026年茨城県議選・つくば市選挙区に向けた、${question.theme}の設問案。${question.context}制度・出典は確認中で、候補者本人の回答は未掲載です。`;
}
