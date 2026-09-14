"use client";

import type { ReactNode } from "react";
import { trackEvent, type AnalyticsEventName } from "../lib/analytics";
import type { CandidateId } from "../lib/data";
import { isSafeResourceUrl, type ResourceKind } from "../lib/resources";

export interface ExternalResourceLinkProps {
  readonly href: string;
  readonly kind: ResourceKind;
  readonly candidateId: CandidateId;
  readonly children: ReactNode;
  readonly className?: string;
}

const clickEvents: Readonly<Partial<Record<ResourceKind, AnalyticsEventName>>> =
  {
    youtube: "youtube_click",
    official_site: "official_site_click",
    election_notice: "election_notice_click",
    social: "social_click",
  };

export function ExternalResourceLink({
  href,
  kind,
  candidateId,
  children,
  className,
}: ExternalResourceLinkProps) {
  if (!isSafeResourceUrl(href)) {
    return (
      <span className={className} aria-disabled="true">
        {children}
      </span>
    );
  }

  function recordClick() {
    const event = clickEvents[kind];
    if (event) trackEvent(event, { candidateId });
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={recordClick}
    >
      {children}
    </a>
  );
}
