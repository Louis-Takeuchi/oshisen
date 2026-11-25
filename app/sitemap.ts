import type { MetadataRoute } from "next";
import { questionPath, sentQuestions } from "../lib/election2026";
import { candidates2026 } from "../lib/candidates2026";
import {
  isSearchIndexingEnabled,
  publicPagePaths,
  publicSiteOrigin,
} from "../lib/seo";

export const dynamic = "force-dynamic";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isSearchIndexingEnabled()) return [];
  const paths = [
    ...publicPagePaths,
    ...sentQuestions.map((question) => questionPath(question)),
    ...(candidates2026.length ? ["/candidates"] : []),
    ...candidates2026.map((candidate) => `/candidates/${candidate.id}`),
  ];
  return paths.map((path) => ({ url: new URL(path, publicSiteOrigin()).href }));
}
