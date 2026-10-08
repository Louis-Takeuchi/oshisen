import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { SiteShell } from "../components/site-shell";
import { VisitorAnalytics } from "../components/visitor-analytics";
import {
  isSearchIndexingEnabled,
  publicSiteOrigin,
  siteDescription,
  siteTitle,
} from "../lib/seo";
import { isVisitorAnalyticsDeployment } from "../lib/visitor-analytics";
import "./globals.css";
import "./pop-theme.css";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffdf7",
  colorScheme: "light",
};
export async function generateMetadata(): Promise<Metadata> {
  // Request-time metadata keeps preview deployments noindex at runtime.
  await headers();
  const origin = publicSiteOrigin();
  return {
    metadataBase: origin,
    applicationName: "オシセン",
    referrer: "origin",
    icons: {
      icon: [
        {
          url: "/favicon.ico?v=logo-2",
          sizes: "16x16 32x32 48x48",
          type: "image/x-icon",
        },
        { url: "/icon-192.png?v=logo-2", sizes: "192x192", type: "image/png" },
      ],
      apple: [
        {
          url: "/apple-touch-icon.png?v=logo-2",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    manifest: "/site.webmanifest?v=logo-2",
    appleWebApp: { title: "オシセン" },
    formatDetection: { telephone: false },
    title: {
      default: siteTitle,
      template: "%s｜オシセン",
    },
    description: siteDescription,
    robots: { index: isSearchIndexingEnabled(), follow: true },
    verification: process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : undefined,
    openGraph: {
      type: "website",
      locale: "ja_JP",
      siteName: "オシセン",
      title: siteTitle,
      description: siteDescription,
      images: [
        {
          url: new URL("/og.png?v=logo-2", origin).href,
          width: 1733,
          height: 907,
          alt: siteTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      images: [new URL("/og.png?v=logo-2", origin).href],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <SiteShell>{children}</SiteShell>
        <VisitorAnalytics
          enabled={isVisitorAnalyticsDeployment(
            process.env.NODE_ENV,
            process.env.VERCEL_ENV,
          )}
        />
      </body>
    </html>
  );
}
