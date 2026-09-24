import type { Candidate, PublicationSeo } from "./data.ts";
import {
  isInterviewDate,
  isInterviewSourceUrl,
  type InterviewEpisode,
} from "./interviews.ts";

export interface PublicationMetadata {
  readonly title: string;
  readonly description: string;
  readonly image?: string;
}

const textOr = (value: string | undefined, fallback: string): string =>
  value?.trim() || fallback;

function seoImage(value: string | undefined): string | undefined {
  if (!value || value !== value.trim()) return undefined;
  // A single slash starts a same-origin asset; reject protocol-relative and escaped URLs.
  if (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    isInterviewSourceUrl(`https://local.invalid${value}`)
  )
    return value;
  if (isInterviewSourceUrl(value)) return value;
  return undefined;
}

function metadata(
  seo: PublicationSeo | undefined,
  title: string,
  description: string,
): PublicationMetadata {
  const image = seoImage(seo?.ogImage);
  return {
    title: textOr(seo?.title, title),
    description: textOr(seo?.description, description),
    ...(image ? { image } : {}),
  };
}

/** Defaults name only the information the candidate page is designed to present. */
export function candidateSeo(candidate: Candidate): PublicationMetadata {
  const district = candidate.district?.trim() || "つくば市選挙区";
  return metadata(
    candidate.seo,
    `${candidate.name}｜政策回答・本人のことば｜2026年茨城県議選 ${district}｜オシセン！`,
    `2026年茨城県議会議員選挙・${district}の${candidate.name}について、政策への本人回答、経験や判断の理由、一次情報を確認できます。未回答・未掲載の情報は区別して表示します。`,
  );
}

/** Explicit approval and verified source data are required before sitemap/index inclusion. */
export function isCandidateIndexable(candidate: Candidate): boolean {
  const publication = candidate.publication;
  return Boolean(
    publication?.status === "published" &&
    /^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(candidate.id) &&
    candidate.name.trim() &&
    isInterviewSourceUrl(publication.profileSourceUrl) &&
    isInterviewDate(publication.verifiedAt) &&
    isInterviewDate(publication.publishedAt) &&
    publication.verifiedAt <= publication.publishedAt,
  );
}

/** Metadata template only; this does not approve an episode or generate video structured data. */
export function interviewSeo(episode: InterviewEpisode): PublicationMetadata {
  return metadata(
    episode.seo,
    `${episode.title}｜本人インタビュー｜オシセン！`,
    episode.description,
  );
}
