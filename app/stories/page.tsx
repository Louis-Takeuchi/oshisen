import { pageMetadata } from "../../lib/seo";
import Link from "next/link";
import {
  flashChallengeSeconds,
  flashQuestionGroups,
  getPublicInterviewBlocks,
} from "../../lib/interviews";
import { publishedInterviewDocument } from "../../lib/published-interviews";
import { InterviewStories } from "../../components/interview-stories";

export const metadata = pageMetadata("/stories", {
  title: "本人インタビュー・Podcastと共通質問",
  description:
    "学生時代や政治へのきっかけなど、人となりを聞くオシセンの共通インタビュー6問と、1分間フラッシュの共通20問を紹介します。2026年茨城県議選に向けて取材・Podcast掲載を準備中です。",
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
        <p>
          最初の回答は1分を目安にお願いし、回答に応じて「当時はどのような状況でしたか」「なぜそう考えましたか」「その経験は現在の活動につながっていますか」といったさら問いで掘り下げます。
        </p>
      </section>
      <InterviewStories blocks={blocks} />
      <section className="document-section">
        <h2>オシセン！1分間フラッシュ（共通20問）</h2>
        <p>
          共通6問の対談のあとに、{flashChallengeSeconds}
          秒間で何問答えられるかに挑戦する一問一答を行います。全候補者に下記の20問を同じ順番・同じ制限時間で出題し、答えにくい質問は「パス」と言って次へ進めます。
        </p>
        <p>
          到達しなかった質問やパスの数を、候補者の能力・人物の評価には用いません。公開する動画では、挑戦の{flashChallengeSeconds}
          秒間を原則一続きで見せ、質問や回答を編集で付け足したり、順番を入れ替えたりしません。
        </p>
        {(() => {
          let questionNumber = 0;
          return flashQuestionGroups.map((group) => {
            const start = questionNumber + 1;
            questionNumber += group.questions.length;
            return (
              <div key={group.category}>
                <h3>{group.category}</h3>
                <ol start={start}>
                  {group.questions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ol>
              </div>
            );
          });
        })()}
      </section>
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
