"use client";
import { useState } from "react";
import Link from "next/link";
import { candidates, demoAnswerFixtures } from "../lib/data";
import { calculateMatch } from "../lib/matching";
import { useDiagnosis } from "./session";
import { CandidateRow } from "./candidate-row";
export function CandidateList() {
  const { state, ready } = useDiagnosis();
  const [search, setSearch] = useState("");
  const term = search.replace(/\s/g, "");
  const filtered = candidates.filter(
    (c) =>
      c.name.replace(/\s/g, "").includes(term) ||
      c.kana.replace(/\s/g, "").includes(term),
  );
  return (
    <main id="main" className="container page-main">
      <p className="eyebrow">まずは、一人ひとりを知る。</p>
      <h1>候補者を見る</h1>
      <p className="lead">
        政策から、人となりまで。
        <br />
        気になった人のページを、開いてみてください。
      </p>
      <div className="notice">
        <span className="outline-label">プロトタイプ</span>
        <p>
          ここに掲載している4名はすべて仮名です。写真・所属・経歴などの実在候補者情報は未掲載です。
        </p>
      </div>
      <div className="list-tools">
        <p className="caption" role="status">
          仮名の五十音順 / {filtered.length}名
        </p>
        <label className="search-field">
          <span className="sr-only">候補者名を検索</span>
          <input
            type="search"
            value={search}
            placeholder="名前で探す"
            onChange={(e) => setSearch(e.target.value)}
          />
          <span aria-hidden="true">⌕</span>
        </label>
      </div>
      <div className="exploration-links" aria-label="別の探し方">
        <Link href="/issues">争点から見る →</Link>
        <Link href="/compare">2人の政策を比較する →</Link>
        <Link href="/saved">気になる候補を見る →</Link>
      </div>
      <div>
        {filtered.map((candidate) => (
          <CandidateRow
            key={candidate.id}
            candidate={candidate}
            match={
              ready && state.complete
                ? calculateMatch(
                    state.answers,
                    demoAnswerFixtures[candidate.id],
                  )
                : undefined
            }
          />
        ))}
        {filtered.length === 0 && (
          <div className="empty-notice">
            <h2>該当する候補者が見つかりません。</h2>
            <p>名前やひらがなを変えて検索してください。</p>
            <button className="text-link" onClick={() => setSearch("")}>
              検索をクリアする →
            </button>
          </div>
        )}
      </div>
      <div className="closing-note">
        <p>自分の考えと、比べてみたい？</p>
        <Link className="button primary" href="/diagnosis">
          診断をはじめる →
        </Link>
      </div>
    </main>
  );
}
