import { policyQuestions, QUESTION_DRAFT_NOTICE, type PolicyQuestion } from "./question-ledger.ts";
import { policyAnswerOptions, type CandidatePolicyAnswerRecord } from "./policy.ts";

export type QuestionId = string;
export type Question = PolicyQuestion;
export const questions = policyQuestions;
export const answerOptions = policyAnswerOptions;
export type CandidateId = string;
export interface Candidate {
  readonly id: CandidateId;
  readonly name: string;
  readonly kana: string;
  readonly age: number | null;
  readonly party: string | null;
  readonly status: string | null;
  readonly district: string | null;
  readonly policyAnswers: Readonly<Record<string, CandidatePolicyAnswerRecord>>;
}
/** Add only checked, publication-approved real records. No sample candidates. */
export const candidates: readonly Candidate[] = [];
export const questionDraftNotice = QUESTION_DRAFT_NOTICE;
