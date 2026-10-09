import Link from "next/link";
import { KikumaruNote } from "../components/kikumaru";
export default function NotFound() {
  return (
    <main id="main" className="container empty-page">
      <p className="eyebrow">ページが見つかりません</p>
      <h1>ページが見つかりません</h1>
      <KikumaruNote>
        <p>
          お探しのページが見つかりませんでした。
          候補者一覧から、もう一度探してみてください。
        </p>
      </KikumaruNote>
      <Link className="button primary" href="/candidates">
        候補者を見る →
      </Link>
    </main>
  );
}
