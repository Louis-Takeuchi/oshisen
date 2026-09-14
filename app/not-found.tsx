import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="container empty-page">
      <p className="eyebrow">ページが見つかりません</p>
      <h1>
        ここには、
        <br />
        まだ情報がありません。
      </h1>
      <p>候補者一覧から、もう一度探してみてください。</p>
      <Link className="button primary" href="/candidates">
        候補者を見る →
      </Link>
    </main>
  );
}
