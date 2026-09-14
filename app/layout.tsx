import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteShell } from "../components/site-shell";
import "./globals.css";
export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol =
    host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https";
  const origin = new URL(`${protocol}://${host}`);
  return {
    metadataBase: origin,
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
          url: new URL("/og.png", origin).href,
          width: 1731,
          height: 909,
          alt: "オシセン｜政治家の気にピ、つくってみない？",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "政治家の気にピ、つくってみない？",
      description: "まずは政策から。気になったら、その人自身まで。",
      images: [new URL("/og.png", origin).href],
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
