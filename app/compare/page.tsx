import type { Metadata } from "next";
import { CandidateComparison } from "../../components/candidate-comparison";

export const metadata: Metadata = {
  title: "候補者を比較する",
  description:
    "同じ質問への本人回答を、理由・条件・出典と一緒に見比べます。候補者情報は掲載準備中です。",
};

export default function Page() {
  return <CandidateComparison />;
}
