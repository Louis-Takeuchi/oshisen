import { pageMetadata } from "../../lib/seo";
import { InformationNeeds } from "../../components/information-needs";
export const metadata = pageMetadata("/interests", {
  title: "知りたいことから選ぶ",
  description:
    "気になる政策テーマと知りたい情報の種類を選び、オシセンで見る場所を探します。選んだテーマや情報から関連ページをご案内します。",
  index: false,
});
export default function Page() {
  return <InformationNeeds />;
}
