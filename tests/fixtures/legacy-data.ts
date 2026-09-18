/** Historical test fixtures only. Never import this module from app/ or lib/. */
import { questions, type Candidate, type CandidateId } from "../../lib/data.ts";

export type AnswerValue = 0 | 1 | 2 | 3 | 4;
export type AnswerMap = Readonly<
  Record<string, AnswerValue | null | undefined>
>;

export interface LegacyCandidate extends Candidate {
  readonly isFictional: true;
  readonly answers: AnswerMap;
}

const unanswered: AnswerMap = Object.freeze(
  Object.fromEntries(questions.map((question) => [question.id, null])),
);

export const candidates: readonly LegacyCandidate[] = [
  { id: "sato-misaki", name: "佐藤 美咲", kana: "さとう みさき" },
  { id: "takahashi-ken", name: "高橋 健", kana: "たかはし けん" },
  { id: "tanaka-aya", name: "田中 彩", kana: "たなか あや" },
  { id: "yamada-taro", name: "山田 太郎", kana: "やまだ たろう" },
].map((entry) => ({
  ...entry,
  id: entry.id as CandidateId,
  isFictional: true,
  age: null,
  party: null,
  status: null,
  district: null,
  answers: unanswered,
  policyAnswers: {},
}));

/**
 * Numerical fixtures used exclusively to demonstrate the comparison UI.
 * They are not candidate responses, policy information, or public-source data.
 * Keep this separate from candidates[].answers so unavailable facts remain null.
 */
export const demoAnswerFixtures: Readonly<Record<CandidateId, AnswerMap>> = {
  "sato-misaki": {
    transport: 4,
    education: 3,
    childcare: 4,
    healthcare: 2,
    disaster: 3,
    environment: 1,
    agriculture: 2,
    administration: 3,
  },
  "takahashi-ken": {
    transport: 2,
    education: 4,
    childcare: 1,
    healthcare: 1,
    disaster: 3,
    environment: 2,
    agriculture: 1,
    administration: 2,
  },
  "tanaka-aya": {
    transport: 3,
    education: 2,
    childcare: 3,
    healthcare: 4,
    disaster: 2,
    environment: 4,
    agriculture: 3,
    administration: 4,
  },
  "yamada-taro": {
    transport: 1,
    education: 1,
    childcare: 2,
    healthcare: 3,
    disaster: 4,
    environment: 3,
    agriculture: 4,
    administration: 1,
  },
};
