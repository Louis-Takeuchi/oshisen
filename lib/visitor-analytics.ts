/** Aggregate visits only; deliberately independent of the local experiment log. */
export const VISITOR_PREFERENCE_KEY = "oshisen.visitor-analytics.disabled.v1";
const changeEvent = "oshisen:visitor-analytics-change";
const stoppedInMemory = new WeakSet<Window>();

export type VisitorAnalyticsStatus =
  "enabled" | "disabled" | "browser-disabled" | "unavailable";

const publicPaths = new Set([
  "/",
  "/diagnosis",
  "/questions",
  "/results",
  "/candidates",
  "/compare",
  "/saved",
  "/issues",
  "/about",
  "/method",
  "/sources",
  "/privacy",
  "/interests",
  "/stories",
  "/policy-register",
]);

export function isVisitorAnalyticsDeployment(
  nodeEnv: string | undefined,
  vercelEnv: string | undefined,
): boolean {
  return nodeEnv === "production" && vercelEnv === "production";
}

/** Never return an arbitrary path, candidate identifier, theme or query string. */
export function visitorAnalyticsPath(pathname: string): string | null {
  const path = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  if (publicPaths.has(path)) return path;
  if (/^\/candidates\/[^/?#]+$/.test(path)) return "/candidates/[id]";
  return null;
}

/** beforeSend cannot redact the SDK's separate referrer field. Fail closed. */
export function hasSafeAnalyticsReferrer(referrer: string): boolean {
  if (!referrer) return true;
  try {
    const url = new URL(referrer);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      !url.username &&
      !url.password &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

export function getVisitorAnalyticsStatus(): VisitorAnalyticsStatus {
  if (typeof window === "undefined") return "unavailable";
  const browser = window.navigator as Navigator & {
    globalPrivacyControl?: boolean;
  };
  const doNotTrack =
    browser.doNotTrack ??
    (window as Window & { doNotTrack?: string }).doNotTrack;
  if (
    browser.globalPrivacyControl === true ||
    doNotTrack === "1" ||
    doNotTrack === "yes"
  ) {
    return "browser-disabled";
  }
  if (stoppedInMemory.has(window)) return "disabled";
  try {
    const value = window.localStorage.getItem(VISITOR_PREFERENCE_KEY);
    if (value === "1") return "disabled";
    return value === null || value === "0" ? "enabled" : "unavailable";
  } catch {
    return "unavailable";
  }
}

/** False means persistence failed. A failed write always stops this document. */
export function setVisitorAnalyticsEnabled(enabled: boolean): boolean {
  if (typeof window === "undefined") return false;
  stoppedInMemory.add(window);
  let saved = false;
  try {
    window.localStorage.setItem(VISITOR_PREFERENCE_KEY, enabled ? "0" : "1");
    saved = true;
    stoppedInMemory.delete(window);
  } catch {
    // Keep the in-memory stop even if a previously enabled preference remains.
  }
  window.dispatchEvent(new Event(changeEvent));
  return saved;
}

export function subscribeVisitorAnalytics(callback: () => void): () => void {
  function onStorage(event: StorageEvent) {
    if (event.key === VISITOR_PREFERENCE_KEY || event.key === null) callback();
  }
  window.addEventListener(changeEvent, callback);
  window.addEventListener("storage", onStorage);
  window.addEventListener("focus", callback);
  window.addEventListener("pageshow", callback);
  return () => {
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("focus", callback);
    window.removeEventListener("pageshow", callback);
  };
}

export function canSendVisitorAnalytics(): boolean {
  return (
    getVisitorAnalyticsStatus() === "enabled" &&
    typeof document !== "undefined" &&
    hasSafeAnalyticsReferrer(document.referrer)
  );
}

/** Re-read preferences for EVERY event: unmounting the SDK does not unload it. */
export function beforeSendVisitorAnalytics(event: {
  type: string;
  url: string;
}): { type: "pageview"; url: string } | null {
  if (!canSendVisitorAnalytics() || event.type !== "pageview") return null;
  try {
    const url = new URL(event.url);
    if (url.origin !== window.location.origin || url.username || url.password)
      return null;
    const path = visitorAnalyticsPath(url.pathname);
    if (!path) return null;
    // Construct a fresh object so no extra event fields can be forwarded.
    return { type: "pageview", url: `${url.origin}${path}` };
  } catch {
    return null;
  }
}
