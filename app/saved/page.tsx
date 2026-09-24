import { pageMetadata } from "../../lib/seo";
import { SavedCandidates } from "../../components/saved-candidates";
export const metadata = pageMetadata("/saved", {
  title: "気になる候補",
  description:
    "このブラウザに保存した気になる候補者を確認する画面です。保存内容は端末間で同期されません。",
  index: false,
});
export default function Page() {
  return <SavedCandidates />;
}
