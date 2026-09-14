"use client";
import { useSyncExternalStore } from "react";
import { getAnalyticsConsent, getVariant } from "../lib/analytics";
const changeEvent = "oshisen:settings-change";
function subscribe(callback: () => void) {
  window.addEventListener(changeEvent, callback);
  window.addEventListener("popstate", callback);
  return () => {
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("popstate", callback);
  };
}
export function notifySettingsChange() {
  window.dispatchEvent(new Event(changeEvent));
}
export function useVariant() {
  return useSyncExternalStore(
    subscribe,
    getVariant,
    () => "policy-humanity" as const,
  );
}
export function useConsent() {
  return useSyncExternalStore(subscribe, getAnalyticsConsent, () => false);
}
export function useBrowserReady() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
