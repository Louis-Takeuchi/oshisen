import { pageMetadata } from "../../../lib/seo";
import { ElectionHub, electionHubPaths } from "../../../components/election-hub";

export const metadata = pageMetadata(electionHubPaths.tsukuba, {
  title: "2026年 茨城県議会議員選挙 つくば市選挙区",
  description:
    "2026年茨城県議会議員選挙・つくば市選挙区に向けたオシセンの案内。候補者に送った政策の質問（共通6問＋つくば市の2問）、情報の見方、掲載方針を紹介します。候補者の回答と動画は12月4日（告示日）以降、届出順に公開します。",
  index: true,
});

export default function ElectionPage() {
  return <ElectionHub district="tsukuba" />;
}
