import type { MetadataRoute } from "next";
import { candidates, questions } from "../lib/data";
import { isCandidateIndexable } from "../lib/publication-seo";
import {
  isSearchIndexingEnabled,
  publicPagePaths,
  publicSiteOrigin,
} from "../lib/seo";

export const dynamic = "force-dynamic";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isSearchIndexingEnabled()) return [];
  const published = candidates.filter((candidate) =>
    isCandidateIndexable(candidate),
  );
  const paths = [
    ...publicPagePaths,
    ...questions.map(
      (question) => `/ibaraki-2026/tsukuba/issues/${question.id}`,
    ),
    ...(published.length ? ["/candidates"] : []),
    ...published.map((candidate) => `/candidates/${candidate.id}`),
  ];
  return paths.map((path) => ({ url: new URL(path, publicSiteOrigin()).href }));
}
