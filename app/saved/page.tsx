import type { Metadata } from "next";
import { SavedCandidates } from "../../components/saved-candidates";
export const metadata: Metadata = {
  title: "気になる候補",
  description:
    "このブラウザに保存した候補者を見返して、政策を比較できます。保存は支持や投票先の表明ではありません。",
};
export default function Page() {
  return <SavedCandidates />;
}
