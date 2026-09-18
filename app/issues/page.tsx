import type { Metadata } from "next";
import { IssueExplorer } from "../../components/issue-explorer";
import { getIssueQuestion, resolveIssueTheme } from "../../lib/issues";

export const metadata: Metadata = {
  title: "争点から見る",
  description:
    "公共交通、教育、子育てなど、気になるテーマから政策の問いを考えます。設問は確認中の草案で、候補者の本人回答は未掲載です。",
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
