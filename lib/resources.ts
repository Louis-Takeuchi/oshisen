import type { CandidateId } from "./data";

export type ResourceKind =
  "youtube" | "official_site" | "election_notice" | "social" | "assembly";

/** Add entries only after checking the destination against a primary source. */
export interface CandidateResourceLink {
  readonly label: string;
  readonly url: string;
  readonly kind: ResourceKind;
}

export interface InterviewResource {
  readonly title: string;
  readonly description: string;
  readonly durationLabel: string;
  /** Null until an approved, verified thumbnail is available. */
  readonly thumbnailUrl: string | null;
  readonly url: string;
}

export interface CandidateResources {
  readonly links: readonly CandidateResourceLink[];
  readonly interview?: InterviewResource | null;
}

/** No source, interview, thumbnail, or quote is invented for the demo names. */
export const candidateResources: Readonly<
  Record<CandidateId, CandidateResources>
> = {};

/** A URL check prevents unsafe navigation; editorial source checking is separate. */
export function isSafeResourceUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.length > 0 &&
      url.username === "" &&
      url.password === ""
    );
  } catch {
    return false;
  }
}
