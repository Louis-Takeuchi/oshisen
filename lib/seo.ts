import type { Metadata } from "next";
import { resolveSiteOrigin } from "./site-origin.ts";

export const PUBLIC_SITE_URL = "https://www.oshisen.com";
export const siteTitle = "オシセン｜高校生にもわかる選挙と政策・つくば市から";
export const siteDescription =
  "高校生のはじめての選挙から、つくば市の選挙情報まで。オシセンは投票の基本と政策の見方を紹介し、2026年茨城県議会議員選挙・つくば市選挙区に向けて、候補者の政策・人柄を知る情報を準備しています。";

/** Canonicals never follow a preview host or an untrusted Host header. */
export function publicSiteOrigin(): URL {
  return resolveSiteOrigin(
    new Headers(),
    process.env.SITE_URL || PUBLIC_SITE_URL,
  );
}

export function isSearchIndexingEnabled(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    process.env.VERCEL_ENV !== "preview" &&
    process.env.VERCEL_ENV !== "development"
  );
}

export const publicPagePaths = [
  "/",
  "/about",
  "/method",
  "/sources",
  "/privacy",
  "/issues",
  "/stories",
  "/policy-register",
  "/guides/high-school-election",
  "/tsukuba/elections",
  "/ibaraki-2026/tsukuba",
] as const;

export function pageMetadata(
  path: string,
  options: {
    title: string;
    description: string;
    index?: boolean;
    image?: string;
  },
): Metadata {
  const origin = publicSiteOrigin();
  const url = new URL(path, origin).href;
  const title = options.title.includes("オシセン")
    ? options.title
    : `${options.title}｜オシセン`;
  const image = new URL(options.image || "/og.png?v=logo-2", origin).href;
  return {
    title: { absolute: title },
    description: options.description,
    alternates: { canonical: url },
    // Indexable pages inherit the request-time deployment policy from the root.
    // This prevents a page from overriding noindex on a Vercel preview.
    ...(options.index ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      type: "website",
      locale: "ja_JP",
      siteName: "オシセン",
      url,
      title,
      description: options.description,
      images: [
        {
          url: image,
          alt: title,
          ...(!options.image ? { width: 1733, height: 907 } : {}),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: options.description,
      images: [image],
    },
  };
}

/** Escape '<' so authored content cannot close a JSON-LD script element. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
