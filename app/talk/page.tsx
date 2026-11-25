import Link from "next/link";
import { pageMetadata } from "../../lib/seo";
import { hasPublishedCandidates } from "../../lib/candidates2026";
import { TalkList } from "../../components/talk-list";

export const metadata = pageMetadata("/talk", {
  title: "インタビュー動画「オシセン！トーク」",
  description:
    "候補者お一人ずつを高校生の聞き手が訪ね、一対一で話を聞くインタビュー番組「オシセン！トーク」。動画は12月4日（告示日）以降、選挙区ごとに立候補届出順で公開します。",
  index: true,
});

export default function TalkPage() {
  return (
    <main id="main" className="container document-page">
      <p className="eyebrow">本人の話を、動画で。</p>
      <h1>インタビュー動画「オシセン！トーク」</h1>
      <p className="lead">
        オシセン！トークは、候補者お一人ずつのもとを高校生の聞き手が訪ね、一対一で話を聞くインタビュー番組です。
      </p>
      <section className="document-section">
        <h2>番組について</h2>
        <p>
          学生時代、これまでの人生、政治に関わったきっかけ、人生の後悔、2100年の日本、大切にしているもの。全員に同じ6つの質問を軸に約50分お話を伺い、約35分の本編にまとめています。最後の「県政と今後の展望」は原則ノーカットです。
        </p>
        <p>
          動画は12月4日（告示日）以降、選挙区ごとに立候補届出順で公開します。
        </p>
        {!hasPublishedCandidates && (
          <div className="notice">
            <span className="outline-label">12月4日から公開</span>
            <p>
              現在、候補者の皆さんへのインタビュー収録を進めています。公開のお知らせは、Instagram・X・YouTubeでもお届けします。
            </p>
          </div>
        )}
        <p>
          <Link href="/stories" className="text-link">
            共通の質問項目を見る →
          </Link>
        </p>
      </section>
      {hasPublishedCandidates && <TalkList />}
    </main>
  );
}
