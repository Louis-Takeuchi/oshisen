import { pageMetadata } from "../../lib/seo";
import { CandidateComparison } from "../../components/candidate-comparison";

export const metadata = pageMetadata("/compare", {
  title: "2人の政策回答を比較する",
  description:
    "候補者2人の政策回答とその理由を一問ずつ見比べる画面です。現在は候補者情報の取材・掲載を準備中です。",
  index: false,
});

export default function Page() {
  return <CandidateComparison />;
}
