import { pageMetadata } from "../../lib/seo";
import { Results } from "../../components/results";
export const metadata = pageMetadata("/results", {
  title: "あなたの政策回答",
  description:
    "このタブで回答した政策の質問を一問ずつ見直します。候補者の回答は12月4日（告示日）以降、質問ごとに並びます。",
  index: false,
});
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ level?: string | string[] }>;
}) {
  const { level } = await searchParams;
  return <Results urlLevel={typeof level === "string" ? level : null} />;
}
