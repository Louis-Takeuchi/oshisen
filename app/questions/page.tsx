import { pageMetadata } from "../../lib/seo";
import { Questionnaire } from "../../components/questionnaire";
export const metadata = pageMetadata("/questions", {
  title: "政策の質問に答える",
  description:
    "候補者と同じ政策の質問に、7段階で一問ずつ答えます。判断保留・スキップを区別し、回答はこのブラウザのタブ内だけに保存します。",
  index: false,
});
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ level?: string | string[] }>;
}) {
  const { level } = await searchParams;
  return <Questionnaire urlLevel={typeof level === "string" ? level : null} />;
}
