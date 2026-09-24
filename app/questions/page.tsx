import { pageMetadata } from "../../lib/seo";
import { Questionnaire } from "../../components/questionnaire";
export const metadata = pageMetadata("/questions", {
  title: "政策の質問に答える",
  description:
    "政策への考えを一問ずつ選びます。判断保留・スキップを区別し、回答はこのブラウザのタブ内だけに保存します。",
  index: false,
});
export default function Page() {
  return <Questionnaire />;
}
