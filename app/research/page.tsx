import type { Metadata } from "next";
import Link from "next/link";
import { ResearchWorkbench } from "../../components/research-workbench";

export const metadata: Metadata = {
  title: "研究の準備・表示確認",
  description:
    "共通取材の準備と、同じ承認済み情報のB/C表示をローカルで確認する画面。研究参加や実データ収集はまだ開始していません。",
  robots: { index: false, follow: false },
};
export default function ResearchPage() {
  return (
    <main id="main" className="container document-page">
      <p className="eyebrow">RESEARCH / 準備中</p>
      <h1>
        同じ話を、
        <br />
        伝わる形にできるか。
      </h1>
      <p className="lead">
        本人が何を話し、何を理由に挙げたのか。共通の項目で見比べると、発言と根拠をつかみやすくなるのかを確かめたい。
      </p>
      <section className="document-section">
        <h2>いまは研究の準備段階です。</h2>
        <p>
          2026年茨城県議選のつくば市選挙区を対象に準備しています。ヒアリングは未実施で、候補者データも登録していません。このページは取材の形式と表示の確認用です。通常のサイト利用とは分けています。
        </p>
        <p>
          主要な評価項目は、内容と根拠の両方を正しく把握できた課題の割合を、参加者ごとに見る案です。画面を参照した理解、後からの記憶、分かったという感覚は分けて扱います。
        </p>
        <p>
          本番の募集・割り付け・データ送信はありません。実施前に、研究計画、課題と採点基準、同意・管理体制を確定します。
        </p>
        <Link href="/stories" className="text-link">
          共通の取材項目を見る →
        </Link>
      </section>
      <ResearchWorkbench />
    </main>
  );
}
