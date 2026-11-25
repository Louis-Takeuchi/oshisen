import type { MetadataRoute } from "next";
import { questionPath, sentQuestions } from "../lib/election2026";
import { candidates2026, isDemoData } from "../lib/candidates2026";
import {
  isSearchIndexingEnabled,
  publicPagePaths,
  publicSiteOrigin,
} from "../lib/seo";

export const dynamic = "force-dynamic";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isSearchIndexingEnabled()) return [];
  // 架空データのデモ表示中は、候補者ページをサイトマップに載せない。
  const indexableCandidates = isDemoData ? [] : candidates2026;
  const paths = [
    ...publicPagePaths,
    ...sentQuestions.map((question) => questionPath(question)),
    ...(indexableCandidates.length ? ["/candidates"] : []),
    ...indexableCandidates.map((candidate) => `/candidates/${candidate.id}`),
  ];
  return paths.map((path) => ({ url: new URL(path, publicSiteOrigin()).href }));
}
