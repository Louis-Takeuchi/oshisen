"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="container empty-page">
      <p className="eyebrow">うまく読み込めませんでした</p>
      <h1>もう一度、試してみてください。</h1>
      <p>通信状況を確認して、再読み込みしてください。</p>
      <button type="button" className="button primary" onClick={reset}>
        もう一度読み込む →
      </button>
      <Link className="quiet-link" href="/">
        ホームに戻る
      </Link>
    </main>
  );
}
