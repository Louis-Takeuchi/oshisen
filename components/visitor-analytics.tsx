"use client";

import { Analytics } from "@vercel/analytics/react";
import { usePathname } from "next/navigation";
import {
  beforeSendVisitorAnalytics,
  visitorAnalyticsPath,
} from "../lib/visitor-analytics";
import { useCanSendVisitorAnalytics } from "./use-visitor-analytics";

export function VisitorAnalytics({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const canSend = useCanSendVisitorAnalytics();
  const path = pathname ? visitorAnalyticsPath(pathname) : null;
  if (!enabled || !canSend || !path) return null;

  return (
    <Analytics
      // Remount on a real page change, including candidate A -> candidate B.
      // Only the constant, redacted path/route enters the SDK's event queue.
      key={pathname}
      path={path}
      route={path}
      framework="next"
      mode="production"
      debug={false}
      basePath={process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH}
      configString={process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_CLIENT_CONFIG}
      beforeSend={beforeSendVisitorAnalytics}
    />
  );
}
