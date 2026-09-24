import {
  policyQuestions,
  QUESTION_DRAFT_NOTICE,
  type PolicyQuestion,
} from "./question-ledger.ts";
import {
  policyAnswerOptions,
  type CandidatePolicyAnswerRecord,
} from "./policy.ts";

export type QuestionId = string;
export type Question = PolicyQuestion;
export const questions = policyQuestions;
export const answerOptions = policyAnswerOptions;
export type CandidateId = string;
export interface PublicationSeo {
  readonly title?: string;
  readonly description?: string;
  /** A root-relative asset path or an absolute HTTPS URL. */
  readonly ogImage?: string;
}
export interface CandidatePublication {
  /** Set published only after verifying the real person's profile and approving publication. */
  readonly status: "draft" | "published";
  /** Date-only values (YYYY-MM-DD), consistent with the interview registry. */
  readonly verifiedAt?: string;
  readonly publishedAt?: string;
  /** Primary source used to verify the profile; checking the URL's contents is editorial work. */
  readonly profileSourceUrl?: string;
}
export interface Candidate {
  /** The existing id remains the stable /candidates/[id] URL slug. */
  readonly id: CandidateId;
  readonly name: string;
  readonly kana: string;
  readonly age: number | null;
  readonly party: string | null;
  readonly status: string | null;
  readonly district: string | null;
  readonly policyAnswers: Readonly<Record<string, CandidatePolicyAnswerRecord>>;
  readonly seo?: PublicationSeo;
  readonly publication?: CandidatePublication;
}
/** Add only checked, publication-approved real records. No sample candidates. */
export const candidates: readonly Candidate[] = [];
export const questionDraftNotice = QUESTION_DRAFT_NOTICE;
