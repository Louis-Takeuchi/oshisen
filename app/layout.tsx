import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { SiteShell } from "../components/site-shell";
import { resolveSiteOrigin } from "../lib/site-origin";
import "./globals.css";
import "./pop-theme.css";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffdf7",
  colorScheme: "light",
};
export async function generateMetadata(): Promise<Metadata> {
  const origin = resolveSiteOrigin(await headers(), process.env.SITE_URL);
  return {
    metadataBase: origin,
    applicationName: "オシセン",
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
      default: "オシセン｜政策で出会い、人柄で興味を深める",
      template: "%s｜オシセン",
    },
    description:
      "いくつかの質問に答えると、あなたと政策の近い候補者を知れる。2026 茨城県議会議員選挙を想定した、オシセンのプロトタイプ。",
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      locale: "ja_JP",
      siteName: "オシセン",
      title: "政治家の気にピ、つくってみない？",
      description: "まずは政策から。気になったら、その人自身まで。",
      images: [
        {
          url: new URL("/og.png?v=logo-2", origin).href,
          width: 1733,
          height: 907,
          alt: "オシセン｜政治家の気にピ、つくってみない？",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "政治家の気にピ、つくってみない？",
      description: "まずは政策から。気になったら、その人自身まで。",
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
      </body>
    </html>
  );
}
