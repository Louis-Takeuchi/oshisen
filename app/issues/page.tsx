import { pageMetadata } from "../../lib/seo";
import { IssueExplorer } from "../../components/issue-explorer";
import { getIssueQuestion, resolveIssueTheme } from "../../lib/issues";

export const metadata = pageMetadata("/issues", {
  title: "茨城県議選の争点から見る｜2026年つくば市選挙区・土浦市選挙区",
  description:
    "2026年茨城県議選・つくば市選挙区・土浦市選挙区に向け、公共交通・教育・子育てなど8つのテーマから政策の問いを考えます。設問は確認中の草案で、候補者回答は未掲載です。",
  index: true,
});

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
