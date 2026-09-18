import type { Metadata } from "next";
import { InformationNeeds } from "../../components/information-needs";
export const metadata: Metadata = {
  title: "知りたいことから",
  description:
    "テーマや情報の種類を選び、気になる問いへ。回答照合や候補者の順位には使いません。",
};
export default function Page() {
  return <InformationNeeds />;
}
