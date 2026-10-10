import { pageMetadata } from "../../lib/seo";
import { Results } from "../../components/results";
export const metadata = pageMetadata("/results", {
  title: "あなたの政策回答",
  description:
    "このタブで回答した政策の質問を一問ずつ見直します。選んだ回答を質問ごとに確かめられます。",
  index: false,
});
export default function Page() {
  return <Results />;
}
