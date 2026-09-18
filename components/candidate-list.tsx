"use client";
import { useState } from "react";
import Link from "next/link";
import { candidates } from "../lib/data";
import { project } from "../lib/project";
import { CandidateRow } from "./candidate-row";
export function CandidateList() {
  const [search, setSearch] = useState("");
  const term = search.replace(/\s/g, "");
  const filtered = [...candidates]
    .sort((a, b) => a.kana.localeCompare(b.kana, "ja"))
    .filter(
      (c) =>
        c.name.replace(/\s/g, "").includes(term) ||
        c.kana.replace(/\s/g, "").includes(term),
    );
  return (
    <main id="main" className="container page-main">
      <p className="eyebrow">まずは、一人ひとりを知る。</p>
      <h1>候補者を見る</h1>
      <p className="lead">
        {project.electionYear}年 {project.electionName} / {project.district}
      </p>
      {!candidates.length ? (
        <div className="empty-notice">
          <span className="outline-label">掲載準備中</span>
          <h2>候補者の情報は、これから。</h2>
          <p>
            本人の回答や取材内容を確認してから掲載します。今は、政策の質問や共通の取材ガイドを試せます。
          </p>
        </div>
      ) : (
        <>
          <div className="list-tools">
            <p className="caption" role="status">
              五十音順 / {filtered.length}名
            </p>
            <label className="search-field">
              <span className="sr-only">候補者名を検索</span>
              <input
                type="search"
                value={search}
                placeholder="名前で探す"
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
          {filtered.map((candidate) => (
            <CandidateRow key={candidate.id} candidate={candidate} />
          ))}
          {!filtered.length && (
            <div className="empty-notice">
              <p>該当する候補者が見つかりません。</p>
              <button className="text-link" onClick={() => setSearch("")}>
                検索をクリアする →
              </button>
            </div>
          )}
        </>
      )}
      <div className="exploration-links">
        <Link href="/diagnosis">政策の質問を試す →</Link>
        <Link href="/stories">本人の言葉から知る →</Link>
        <Link href="/interests">知りたいことを選ぶ →</Link>
      </div>
    </main>
  );
}
