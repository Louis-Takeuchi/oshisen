import { pageMetadata } from "../../lib/seo";
import { DiagnosisStart } from "../../components/diagnosis-start";
export const metadata = pageMetadata("/diagnosis", {
  title: "政策の質問をはじめる",
  description:
    "政策の質問に答え、一問ずつ見直すための入口です。質問は草案で、候補者の本人回答を取得してから同じ問いで照合します。",
  index: false,
});
export default function Page() {
  return <DiagnosisStart />;
}
