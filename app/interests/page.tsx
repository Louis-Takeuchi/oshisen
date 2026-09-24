import { pageMetadata } from "../../lib/seo";
import { InformationNeeds } from "../../components/information-needs";
export const metadata = pageMetadata("/interests", {
  title: "知りたいことから選ぶ",
  description:
    "気になる政策テーマと知りたい情報の種類を選び、オシセンで見る場所を探します。選択を候補者への評価や順位には使いません。",
  index: false,
});
export default function Page() {
  return <InformationNeeds />;
}
