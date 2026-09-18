"use client";
import { candidates, questions } from "./data.ts";

/** Opt-in, tab-local prototype event recording. This module makes no requests. */
export const analyticsEvents = [
  "diagnosis_start",
  "diagnosis_answer",
  "diagnosis_complete",
  "diagnosis_skip",
  "diagnosis_undecided",
  "candidate_compare_add",
  "candidate_compare_remove",
  "candidate_view",
  "candidate_save",
  "candidate_unsave",
  "policy_detail_view",
  "humanity_view",
  "youtube_click",
  "official_site_click",
  "election_notice_click",
  "social_click",
] as const;

export type AnalyticsEventName = (typeof analyticsEvents)[number];
export type ExperimentVariant = "standard";

export interface AnalyticsMetadata {
  readonly candidateId?: string;
  readonly questionId?: string;
}

export interface AnalyticsEvent extends AnalyticsMetadata {
  readonly event: AnalyticsEventName;
  readonly timestamp: string;
  readonly variant: ExperimentVariant;
}

const CONSENT_KEY = "oshisen.analytics.consent.v2";
const EVENTS_KEY = "oshisen.analytics.events.v2";
const VARIANT_KEY = "oshisen.analytics.variant.v2";
const MAX_EVENTS = 500;
let consentRevokedInMemory = false;
const candidateIds = new Set(candidates.map((c) => c.id));
const questionIds = new Set(questions.map((q) => q.id));

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function read(key: string): string | null {
  try {
    return getStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function isVariant(value: unknown): value is ExperimentVariant {
  return value === "standard";
}

export function getAnalyticsConsent(): boolean {
  if (consentRevokedInMemory) return false;
  return read(CONSENT_KEY) === "true";
}

/** Normal browsing is never assigned to the B/C research preparation. */
export function getVariant(): ExperimentVariant {
  return "standard";
}

/** Revoking consent also removes the events and saved experiment assignment. */
export function setAnalyticsConsent(consent: boolean): boolean {
  if (!consent) {
    eraseAnalytics();
    return !getAnalyticsConsent();
  }
  const storage = getStorage();
  if (!storage) return false;
  try {
    const variant = getVariant();
    storage.setItem(CONSENT_KEY, "true");
    storage.setItem(VARIANT_KEY, variant);
    consentRevokedInMemory = false;
    return true;
  } catch {
    eraseAnalytics();
    return false;
  }
}

function cleanEvent(value: unknown): AnalyticsEvent | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (
    !analyticsEvents.includes(raw.event as AnalyticsEventName) ||
    typeof raw.timestamp !== "string" ||
    !Number.isFinite(Date.parse(raw.timestamp)) ||
    !isVariant(raw.variant)
  )
    return null;

  // Pick fields explicitly: policy answers, scores, URLs and free text never pass.
  const event: AnalyticsEvent = {
    event: raw.event as AnalyticsEventName,
    timestamp: new Date(raw.timestamp).toISOString(),
    variant: raw.variant,
    ...(typeof raw.candidateId === "string" && candidateIds.has(raw.candidateId)
      ? { candidateId: raw.candidateId }
      : {}),
    ...(typeof raw.questionId === "string" && questionIds.has(raw.questionId)
      ? { questionId: raw.questionId }
      : {}),
  };
  return event;
}

function readEvents(): AnalyticsEvent[] {
  if (!getAnalyticsConsent()) return [];
  try {
    const raw: unknown = JSON.parse(read(EVENTS_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .slice(-MAX_EVENTS)
      .map(cleanEvent)
      .filter((event): event is AnalyticsEvent => event !== null);
  } catch {
    return [];
  }
}

/** Only explicit consent permits recording; values of policy answers are excluded. */
export function trackEvent(
  name: AnalyticsEventName,
  metadata: AnalyticsMetadata = {},
): boolean {
  if (!getAnalyticsConsent()) return false;
  const event = cleanEvent({
    event: name,
    timestamp: new Date().toISOString(),
    variant: getVariant(),
    candidateId: metadata.candidateId,
    questionId: metadata.questionId,
  });
  if (!event) return false;
  try {
    const storage = getStorage();
    if (!storage) return false;
    storage.setItem(VARIANT_KEY, event.variant);
    storage.setItem(
      EVENTS_KEY,
      JSON.stringify([...readEvents(), event].slice(-MAX_EVENTS)),
    );
    return true;
  } catch {
    return false;
  }
}

/** Downloading/sharing this JSON is a separate, explicit action in the UI. */
export function exportAnalytics(): string {
  return JSON.stringify(
    {
      schemaVersion: 2,
      scope: "this-tab-only",
      containsPolicyAnswers: false,
      events: readEvents(),
    },
    null,
    2,
  );
}

/** Deletes only this module's three keys; diagnosis answers are not stored here. */
export function eraseAnalytics(): boolean {
  consentRevokedInMemory = true;
  const storage = getStorage();
  if (!storage) return false;
  let erased = true;
  for (const key of [
    CONSENT_KEY,
    EVENTS_KEY,
    VARIANT_KEY,
    "oshisen.analytics.consent.v1",
    "oshisen.analytics.events.v1",
    "oshisen.analytics.variant.v1",
  ]) {
    try {
      storage.removeItem(key);
    } catch {
      erased = false;
      // A browser can deny storage access; recording then remains unavailable.
    }
  }
  return erased;
}
