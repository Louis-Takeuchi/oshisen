import type { Metadata } from "next";
import { CandidateComparison } from "../../components/candidate-comparison";

export const metadata: Metadata = {
  title: "候補者を比較する",
  description:
    "気になる2人の政策を同じ質問で並べて、似ているところと異なるところを確かめる。架空の候補者と確認用数値による体験版です。",
};

export default function Page() {
  return <CandidateComparison />;
}
