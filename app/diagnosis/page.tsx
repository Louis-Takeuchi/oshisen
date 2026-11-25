import { pageMetadata } from "../../lib/seo";
import { DiagnosisStart } from "../../components/diagnosis-start";
export const metadata = pageMetadata("/diagnosis", {
  title: "政策の質問をはじめる",
  description:
    "候補者と同じ政策の質問（共通6問＋選挙区2問・7段階）に答え、一問ずつ見直すための入口です。候補者の回答は12月4日以降に並びます。",
  index: false,
});
export default function Page() {
  return <DiagnosisStart />;
}
