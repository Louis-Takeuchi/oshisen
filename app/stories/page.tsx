import { pageMetadata } from "../../lib/seo";
import Link from "next/link";
import { getPublicInterviewBlocks } from "../../lib/interviews";
import { publishedInterviewDocument } from "../../lib/published-interviews";
import { InterviewStories } from "../../components/interview-stories";

export const metadata = pageMetadata("/stories", {
  title: "本人インタビュー・Podcastと共通質問",
  description:
    "政策回答の背景にある経験や判断の理由を聞く、オシセンの共通インタビュー6問を紹介します。2026年茨城県議選に向けて取材・Podcast掲載を準備中です。",
  index: true,
});
export default function StoriesPage() {
  const blocks = getPublicInterviewBlocks(publishedInterviewDocument);
  return (
    <main id="main" className="container document-page">
      <p className="eyebrow">本人の話から見る</p>
      <h1>本人インタビュー</h1>
      <p className="lead">
        何を経験して、どう選んだのか。政策の賛否だけではわからない話を、本人に聞きます。質問への回答を終えなくても、ここから知ることができます。
      </p>
      <section className="document-section">
        <h2>{blocks.length ? "公開インタビュー" : "取材・掲載の準備状況"}</h2>
        {blocks.length ? (
          <p>
            短い要約から、本人の言葉と元の音声まで。気になる項目や、知りたい人を選んで読めます。
          </p>
        ) : (
          <p>
            2026年茨城県議選のつくば市選挙区・土浦市選挙区を対象に準備しています。ヒアリングはまだ実施していません。候補者情報や、仮の発言は掲載していません。
          </p>
        )}
        <p>
          {blocks.length
            ? "共通する6つの項目で整理します。"
            : "全員に同じ6つの項目を聞く予定です。"}
          話し方の印象だけで人物が判断されないよう、経験や判断の背景を本人の言葉とともに紹介する方針です。
        </p>
      </section>
      <InterviewStories blocks={blocks} />
      <section className="document-section">
        <h2>インタビューの掲載形式</h2>
        <p>
          本人が語った経験、選択・行動、理由、条件を分けて示します。要約から本人の言葉、その前後の文脈、Podcastの全編へ進める形で掲載します。
        </p>
        <p>
          聞けなかったことや、回答で触れられなかったことは、そのまま示します。本人の説明と、運営による要約も分けます。
        </p>
        <Link href="/questions" className="text-link">
          政策の質問を見てみる →
        </Link>
        <br />
        <Link href="/neutrality#section-8" className="text-link">
          取材・編集の共通基準を読む →
        </Link>
      </section>
    </main>
  );
}
