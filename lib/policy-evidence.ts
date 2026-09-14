import {
  candidates,
  questions,
  type CandidateId,
  type QuestionId,
} from "./data.ts";
import { isSafeResourceUrl, type ResourceKind } from "./resources.ts";

/** Calendar dates only; runtime validation also rejects impossible dates. */
export type EvidenceDate = `${number}-${number}-${number}`;

export interface PolicySource {
  readonly label: string;
  readonly title: string;
  readonly url: string;
  readonly kind: ResourceKind;
}

interface EvidenceContent {
  readonly source: PolicySource;
  readonly text: string;
}

/** Direct answers, quoted documents and editorial summaries remain distinct. */
export type PolicyContent = EvidenceContent &
  (
    | {
        readonly provenance: "candidate_answer";
        readonly answeredOn: EvidenceDate;
        readonly publishedOn: EvidenceDate | null;
      }
    | {
        readonly provenance: "public_document";
        readonly answeredOn: null;
        readonly publishedOn: EvidenceDate | null;
      }
    | {
        readonly provenance: "editorial_summary";
        readonly answeredOn: null;
        readonly publishedOn: EvidenceDate | null;
      }
  );

interface PolicyVideoContent {
  readonly title: string;
  readonly url: string;
  readonly startSeconds: number;
  readonly publishedOn: EvidenceDate | null;
}

export type PolicyVideo = PolicyVideoContent &
  (
    | {
        readonly verification: "pending";
        readonly checkedOn: EvidenceDate | null;
      }
    | { readonly verification: "verified"; readonly checkedOn: EvidenceDate }
  );

export type VerifiedPolicyEvidence = PolicyContent & {
  readonly verification: "verified";
  readonly checkedOn: EvidenceDate;
  readonly video?: PolicyVideo;
};

export type PolicyEvidenceEntry =
  | { readonly verification: "unavailable" }
  | (PolicyContent & {
      readonly verification: "pending";
      readonly checkedOn: EvidenceDate | null;
      readonly video?: PolicyVideo;
    })
  | VerifiedPolicyEvidence;

export type PolicyEvidenceRegistry = Readonly<
  Record<
    CandidateId,
    Readonly<Partial<Record<QuestionId, PolicyEvidenceEntry>>>
  >
>;

/**
 * Intentionally empty. A numerical fixture is never evidence, a candidate
 * answer, or permission to invent a source. Register verified material here.
 */
export const policyEvidence: PolicyEvidenceRegistry = {
  "sato-misaki": {},
  "takahashi-ken": {},
  "tanaka-aya": {},
  "yamada-taro": {},
};

export const MAX_VIDEO_START_SECONDS = 24 * 60 * 60;

const knownCandidateIds = new Set(candidates.map(({ id }) => id));
const knownQuestionIds = new Set(questions.map(({ id }) => id));
const resourceKinds: readonly ResourceKind[] = [
  "youtube",
  "official_site",
  "election_notice",
  "social",
  "assembly",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isEvidenceDate(value: unknown): value is EvidenceDate {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const year = Number(value.slice(0, 4));
  if (year < 1900 || year > 9999) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function isCheckedDate(value: unknown): value is EvidenceDate {
  return (
    isEvidenceDate(value) && value <= new Date().toISOString().slice(0, 10)
  );
}

function hasValidDates(value: Record<string, unknown>): boolean {
  if (!isCheckedDate(value.checkedOn)) return false;
  for (const key of ["answeredOn", "publishedOn"] as const) {
    const date = value[key];
    if (date !== null && (!isEvidenceDate(date) || date > value.checkedOn))
      return false;
  }
  return true;
}

export function isPublishablePolicyEvidence(
  value: unknown,
): value is VerifiedPolicyEvidence {
  if (
    !isRecord(value) ||
    value.verification !== "verified" ||
    !hasText(value.text)
  )
    return false;
  const source = value.source;
  if (
    !isRecord(source) ||
    !hasText(source.label) ||
    !hasText(source.title) ||
    !hasText(source.url) ||
    !isSafeResourceUrl(source.url) ||
    !resourceKinds.includes(source.kind as ResourceKind) ||
    !hasValidDates(value)
  )
    return false;
  if (value.provenance === "candidate_answer")
    return isEvidenceDate(value.answeredOn);
  return (
    (value.provenance === "public_document" ||
      value.provenance === "editorial_summary") &&
    value.answeredOn === null
  );
}

/** Unknown, absent and unverified references all have the same public result. */
export function getPolicyEvidence(
  candidateId: string,
  questionId: string,
  registry: PolicyEvidenceRegistry = policyEvidence,
): VerifiedPolicyEvidence | null {
  if (
    !knownCandidateIds.has(candidateId as CandidateId) ||
    !knownQuestionIds.has(questionId as QuestionId) ||
    !Object.hasOwn(registry, candidateId)
  )
    return null;
  const entries = registry[candidateId as CandidateId];
  if (!entries || !Object.hasOwn(entries, questionId)) return null;
  const entry = entries[questionId as QuestionId];
  return isPublishablePolicyEvidence(entry) ? entry : null;
}

/**
 * Canonicalizes only HTTPS YouTube watch/short URLs. Existing query/fragment
 * data never reaches the generated URL, and this function makes no requests.
 */
export function buildYouTubeTimestampUrl(
  value: string,
  startSeconds: number,
): string | null {
  if (
    typeof value !== "string" ||
    value !== value.trim() ||
    [...value].some(
      (character) =>
        character.charCodeAt(0) < 32 ||
        character.charCodeAt(0) === 127 ||
        character === "\\",
    ) ||
    !Number.isInteger(startSeconds) ||
    startSeconds < 0 ||
    startSeconds > MAX_VIDEO_START_SECONDS ||
    !isSafeResourceUrl(value)
  )
    return null;
  try {
    const url = new URL(value);
    if (url.port !== "") return null;
    let videoId: string | null = null;
    if (url.hostname === "youtube.com" || url.hostname === "www.youtube.com") {
      if (
        url.pathname !== "/watch" ||
        url.searchParams.getAll("v").length !== 1
      )
        return null;
      videoId = url.searchParams.get("v");
    } else if (url.hostname === "youtu.be") {
      videoId = url.pathname.slice(1);
    } else return null;
    if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) return null;
    return `https://www.youtube.com/watch?v=${videoId}&t=${startSeconds}s`;
  } catch {
    return null;
  }
}

/** A valid URL alone is not editorial verification. Gate video independently. */
export function getVerifiedPolicyVideoUrl(value: unknown): string | null {
  if (
    !isRecord(value) ||
    value.verification !== "verified" ||
    !hasText(value.title) ||
    typeof value.url !== "string" ||
    typeof value.startSeconds !== "number" ||
    !isCheckedDate(value.checkedOn) ||
    (value.publishedOn !== null &&
      (!isEvidenceDate(value.publishedOn) ||
        value.publishedOn > value.checkedOn))
  )
    return null;
  return buildYouTubeTimestampUrl(value.url, value.startSeconds);
}

export function formatVideoTimestamp(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > MAX_VIDEO_START_SECONDS)
    return "";
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = String(value % 60).padStart(2, "0");
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`
    : `${minutes}:${seconds}`;
}
