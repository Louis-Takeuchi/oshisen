"use client";

import { useSyncExternalStore } from "react";
import {
  canSendVisitorAnalytics,
  getVisitorAnalyticsStatus,
  subscribeVisitorAnalytics,
  type VisitorAnalyticsStatus,
} from "../lib/visitor-analytics";

export function useVisitorAnalyticsStatus() {
  return useSyncExternalStore(
    subscribeVisitorAnalytics,
    getVisitorAnalyticsStatus,
    (): VisitorAnalyticsStatus => "unavailable",
  );
}

export function useCanSendVisitorAnalytics() {
  return useSyncExternalStore(
    subscribeVisitorAnalytics,
    canSendVisitorAnalytics,
    () => false,
  );
}
