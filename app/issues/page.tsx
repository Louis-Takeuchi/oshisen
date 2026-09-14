import type { Metadata } from "next";
import { IssueExplorer } from "../../components/issue-explorer";
import { getIssueQuestion, resolveIssueTheme } from "../../lib/issues";

export const metadata: Metadata = {
  title: "争点から見る",
  description:
    "公共交通、教育、子育てなど、気になるテーマから候補者の考え方を見比べる体験用デモ。実在の候補者・政策・本人の回答を示すものではありません。",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string | string[] }>;
}) {
  const { theme } = await searchParams;
  return (
    <IssueExplorer
      theme={resolveIssueTheme(theme)}
      invalidTheme={theme !== undefined && !getIssueQuestion(theme)}
    />
  );
}
