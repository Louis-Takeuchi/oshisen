import { pageMetadata } from "../../lib/seo";
import { Results } from "../../components/results";
export const metadata = pageMetadata("/results", {
  title: "あなたの政策回答",
  description:
    "このタブで回答した政策の質問を一問ずつ見直します。候補者の順位や総合一致率は表示しません。",
  index: false,
});
export default function Page() {
  return <Results />;
}
