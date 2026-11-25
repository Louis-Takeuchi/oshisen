import { pageMetadata } from "../../lib/seo";
import { hasPublishedCandidates } from "../../lib/candidates2026";
import { CandidateList } from "../../components/candidate-list";
export function generateMetadata() {
  return pageMetadata("/candidates", {
    title: "候補者情報｜2026年茨城県議選・つくば市選挙区・土浦市選挙区",
    description: hasPublishedCandidates
      ? "2026年茨城県議会議員選挙・つくば市選挙区・土浦市選挙区の候補者一覧です。選挙区ごとの立候補届出順に、政策の回答とインタビュー動画を紹介します。"
      : "2026年茨城県議会議員選挙・つくば市選挙区・土浦市選挙区の候補者情報を掲載するページです。候補者の情報と回答は、12月4日（告示日）以降、立候補届出順に公開します。",
    index: hasPublishedCandidates,
  });
}
export default function Page() {
  return <CandidateList />;
}
