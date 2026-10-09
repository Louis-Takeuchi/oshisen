"use client";

import Link from "next/link";
import { KikumaruNote } from "../components/kikumaru";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="container empty-page">
      <p className="eyebrow">うまく読み込めませんでした</p>
      <h1>うまく読み込めませんでした</h1>
      <KikumaruNote>
        <p>通信状況を確認して、もう一度お試しください。</p>
      </KikumaruNote>
      <button type="button" className="button primary" onClick={reset}>
        もう一度読み込む →
      </button>
      <Link className="quiet-link" href="/">
        ホームに戻る
      </Link>
    </main>
  );
}
