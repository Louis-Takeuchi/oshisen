import { isSafeResourceUrl } from "./resources.ts";

/**
 * Per-question policy comparison. There is deliberately no aggregate score,
 * distance, weighting, candidate sorting, or inference from interview content.
 */
export type PolicyAnswerValue = 0 | 1 | 2 | 3 | 4;

export type UserPolicyAnswer =
  | { readonly status: "answered"; readonly value: PolicyAnswerValue }
  | {
      readonly status: "undecided";
      readonly reason?: "needs-information" | "thinking";
    }
  | { readonly status: "skipped" };

export interface PolicyQuestionDefinition {
  readonly id: string;
  readonly questionVersion: string;
  readonly scaleVersion: string;
  readonly contextVersion: string;
}

export interface PolicyRecordVersion {
  readonly questionId: string;
  readonly questionVersion: string;
  readonly scaleVersion: string;
  readonly contextVersion: string;
}

export interface PolicyAnswerRecord extends PolicyRecordVersion {
  readonly answer: UserPolicyAnswer;
}

export interface PolicySource {
  readonly id: string;
  readonly label: string;
  readonly url?: string;
  readonly kind: "candidate_answer" | "official_record" | "published_material";
  readonly checkedAt?: string;
}

export interface CandidatePolicyAnswerRecord extends PolicyRecordVersion {
  readonly candidateId: string;
  readonly verification: "unanswered" | "pending" | "published";
  readonly provenance:
    "candidate_answer" | "public_statement" | "editorial_summary";
  readonly answer?: UserPolicyAnswer;
  readonly reason?: string;
  readonly conditions?: string;
  readonly sources?: readonly PolicySource[];
  readonly answeredAt?: string;
  readonly publishedAt?: string;
}

export const POLICY_SCALE_VERSION = "agreement-5-v1";

export const policyAnswerOptions: readonly {
  readonly value: PolicyAnswerValue;
  readonly label: string;
}[] = [
  { value: 4, label: "賛成" },
  { value: 3, label: "どちらかといえば賛成" },
  { value: 2, label: "賛成でも反対でもない" },
  { value: 1, label: "どちらかといえば反対" },
  { value: 0, label: "反対" },
];

export type PolicyAnswerState =
  | UserPolicyAnswer["status"]
  | "unanswered"
  | "version-mismatch"
  | "invalid-answer";

export type CandidatePolicyAnswerState =
  PolicyAnswerState | "pending" | "not-candidate-answer";

export type PolicyComparisonStatus =
  | "same"
  | "different"
  | "user-unanswered"
  | "user-undecided"
  | "user-skipped"
  | "candidate-unanswered"
  | "candidate-undecided"
  | "candidate-skipped"
  | "pending"
  | "not-candidate-answer"
  | "version-mismatch"
  | "invalid-answer";

export interface PolicyComparison {
  readonly questionId: string;
  readonly status: PolicyComparisonStatus;
  /** Both states are retained even when neither side can be compared. */
  readonly userState: PolicyAnswerState;
  readonly candidateState: CandidatePolicyAnswerState;
  readonly userAnswer?: UserPolicyAnswer;
  /** Only the same-version, published, directly submitted answer is exposed. */
  readonly candidateAnswer?: UserPolicyAnswer;
  readonly reason?: string;
  readonly conditions?: string;
  readonly sources: readonly PolicySource[];
}

export function isUserPolicyAnswer(value: unknown): value is UserPolicyAnswer {
  if (!value || typeof value !== "object") return false;
  const answer = value as Record<string, unknown>;
  if (answer.status === "answered") {
    return (
      typeof answer.value === "number" &&
      Number.isInteger(answer.value) &&
      answer.value >= 0 &&
      answer.value <= 4
    );
  }
  if (answer.status === "undecided") {
    return (
      answer.value === undefined &&
      (answer.reason === undefined ||
        answer.reason === "needs-information" ||
        answer.reason === "thinking")
    );
  }
  return answer.status === "skipped" && answer.value === undefined;
}

/** Check all four identities; matching blanks never count as a version. */
export function hasMatchingPolicyVersion(
  question: PolicyQuestionDefinition,
  record: PolicyRecordVersion,
): boolean {
  return (
    Boolean(
      question.id &&
      question.questionVersion &&
      question.scaleVersion &&
      question.contextVersion,
    ) &&
    record.questionId === question.id &&
    record.questionVersion === question.questionVersion &&
    record.scaleVersion === question.scaleVersion &&
    record.contextVersion === question.contextVersion
  );
}

export function createPolicyAnswerRecord(
  question: PolicyQuestionDefinition,
  answer: UserPolicyAnswer,
): PolicyAnswerRecord {
  return {
    questionId: question.id,
    questionVersion: question.questionVersion,
    scaleVersion: question.scaleVersion,
    contextVersion: question.contextVersion,
    answer,
  };
}

export function policyAnswerLabel(answer?: UserPolicyAnswer): string {
  if (!answer) return "未回答";
  if (!isUserPolicyAnswer(answer)) return "回答を確認できません";
  if (answer.status === "skipped") return "スキップ";
  if (answer.status === "undecided") {
    if (answer.reason === "needs-information")
      return "今は判断できない（情報が足りない）";
    if (answer.reason === "thinking")
      return "今は判断できない（考えがまとまっていない）";
    return "今は判断できない";
  }
  return policyAnswerOptions.find((option) => option.value === answer.value)!
    .label;
}

export const policyComparisonLabels: Readonly<
  Record<PolicyComparisonStatus, string>
> = {
  same: "同じ回答",
  different: "違う回答",
  "user-unanswered": "あなたは未回答",
  "user-undecided": "あなたは判断保留",
  "user-skipped": "あなたはスキップ",
  "candidate-unanswered": "本人回答は未掲載",
  "candidate-undecided": "候補者は判断保留",
  "candidate-skipped": "候補者はスキップ",
  pending: "本人回答を確認中",
  "not-candidate-answer": "今回の質問への本人回答ではありません",
  "version-mismatch": "質問・選択肢・補足の版が異なります",
  "invalid-answer": "回答を確認できません",
};

function userState(
  question: PolicyQuestionDefinition,
  record?: PolicyAnswerRecord,
): PolicyAnswerState {
  if (!record) return "unanswered";
  if (!hasMatchingPolicyVersion(question, record)) return "version-mismatch";
  return isUserPolicyAnswer(record.answer)
    ? record.answer.status
    : "invalid-answer";
}

function candidateState(
  question: PolicyQuestionDefinition,
  record?: CandidatePolicyAnswerRecord,
  expectedCandidateId?: string,
): CandidatePolicyAnswerState {
  if (!record) return "unanswered";
  if (!hasMatchingPolicyVersion(question, record)) return "version-mismatch";
  if (
    typeof record.candidateId !== "string" ||
    !record.candidateId.trim() ||
    !expectedCandidateId ||
    record.candidateId !== expectedCandidateId
  )
    return "invalid-answer";
  if (record.verification === "unanswered") return "unanswered";
  if (record.verification === "pending") return "pending";
  if (record.verification !== "published") return "invalid-answer";
  if (record.provenance !== "candidate_answer") return "not-candidate-answer";
  if (!hasPublishedPolicyEvidence(record)) return "pending";
  if (!record.answer) return "unanswered";
  return isUserPolicyAnswer(record.answer)
    ? record.answer.status
    : "invalid-answer";
}

function isSafePolicySourceUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  if (
    Array.from(value).some((character) => {
      const code = character.charCodeAt(0);
      return code <= 32 || code === 127 || code === 92;
    })
  )
    return false;
  return isSafeResourceUrl(value);
}

/**
 * An editor's publication flag alone is insufficient. The answer needs dated
 * provenance back to the submitted response. A source may be an internal,
 * stable document ID; do not make a private response URL public by default.
 */
export function hasPublishedPolicyEvidence(
  record: CandidatePolicyAnswerRecord,
  now: number = Date.now(),
): boolean {
  if (!Number.isFinite(now)) return false;
  if (typeof record.candidateId !== "string" || !record.candidateId.trim())
    return false;
  const isoDate =
    /^\d{4}-\d{2}-\d{2}(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?Z)?$/;
  const validDate = (value: string | undefined): value is string => {
    if (
      !value ||
      !isoDate.test(value) ||
      !Number.isFinite(Date.parse(value)) ||
      Date.parse(value) > now
    )
      return false;
    const day = value.slice(0, 10);
    return new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) === day;
  };
  if (
    !validDate(record.answeredAt) ||
    !validDate(record.publishedAt) ||
    Date.parse(record.publishedAt) < Date.parse(record.answeredAt)
  )
    return false;
  const sources = record.sources;
  return Boolean(
    Array.isArray(sources) &&
    sources.length &&
    sources.every(
      (source) =>
        source &&
        typeof source === "object" &&
        typeof source.id === "string" &&
        source.id.trim() &&
        typeof source.label === "string" &&
        source.label.trim() &&
        ["candidate_answer", "official_record", "published_material"].includes(
          source.kind,
        ) &&
        (source.url === undefined || isSafePolicySourceUrl(source.url)) &&
        (source.checkedAt === undefined || validDate(source.checkedAt)),
    ) &&
    sources.some((source) => source.kind === "candidate_answer"),
  );
}

function comparisonStatus(
  user: PolicyAnswerState,
  candidate: CandidatePolicyAnswerState,
  userAnswer?: UserPolicyAnswer,
  candidateAnswer?: UserPolicyAnswer,
): PolicyComparisonStatus {
  if (user === "version-mismatch" || candidate === "version-mismatch")
    return "version-mismatch";
  if (user === "invalid-answer" || candidate === "invalid-answer")
    return "invalid-answer";
  if (candidate === "pending" || candidate === "not-candidate-answer")
    return candidate;
  if (candidate === "unanswered") return "candidate-unanswered";
  if (user === "unanswered") return "user-unanswered";
  if (user === "undecided") return "user-undecided";
  if (user === "skipped") return "user-skipped";
  if (candidate === "undecided") return "candidate-undecided";
  if (candidate === "skipped") return "candidate-skipped";
  if (
    userAnswer?.status !== "answered" ||
    candidateAnswer?.status !== "answered"
  )
    return "invalid-answer";
  return userAnswer.value === candidateAnswer.value ? "same" : "different";
}

/** Never reconstruct a missing answer from another question or public statement. */
export function comparePolicyAnswers(
  question: PolicyQuestionDefinition,
  userRecord?: PolicyAnswerRecord,
  candidateRecord?: CandidatePolicyAnswerRecord,
  expectedCandidateId?: string,
): PolicyComparison {
  const user = userState(question, userRecord);
  const candidate = candidateState(
    question,
    candidateRecord,
    expectedCandidateId,
  );
  const userAnswer =
    user === "answered" || user === "undecided" || user === "skipped"
      ? userRecord?.answer
      : undefined;
  const publishable =
    candidate === "answered" ||
    candidate === "undecided" ||
    candidate === "skipped";
  const candidateAnswer = publishable ? candidateRecord?.answer : undefined;

  return {
    questionId: question.id,
    status: comparisonStatus(user, candidate, userAnswer, candidateAnswer),
    userState: user,
    candidateState: candidate,
    ...(userAnswer ? { userAnswer } : {}),
    ...(candidateAnswer ? { candidateAnswer } : {}),
    ...(publishable && candidateRecord?.reason !== undefined
      ? { reason: candidateRecord.reason }
      : {}),
    ...(publishable && candidateRecord?.conditions !== undefined
      ? { conditions: candidateRecord.conditions }
      : {}),
    sources: publishable ? (candidateRecord?.sources ?? []) : [],
  };
}
