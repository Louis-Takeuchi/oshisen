import { pageMetadata } from "../../lib/seo";
import { candidates } from "../../lib/data";
import { isCandidateIndexable } from "../../lib/publication-seo";
import { CandidateList } from "../../components/candidate-list";
export function generateMetadata() {
  const index = candidates.some((candidate) => isCandidateIndexable(candidate));
  return pageMetadata("/candidates", {
    title: "候補者情報｜2026年茨城県議選・つくば市選挙区・土浦市選挙区",
    description: index
      ? "2026年茨城県議会議員選挙・つくば市選挙区・土浦市選挙区の候補者について、確認済みの政策回答・理由・本人の一次情報を紹介します。"
      : "2026年茨城県議会議員選挙・つくば市選挙区・土浦市選挙区の候補者情報を掲載するページです。現在は取材・掲載準備中で、候補者情報は未掲載です。",
    index,
  });
}
export default function Page() {
  return <CandidateList />;
}
