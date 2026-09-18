"use client";
import Link from "next/link";
import { candidates, questions } from "../lib/data";
import { policyAnswerLabel } from "../lib/policy";
import { useDiagnosis } from "./session";
import { CandidateRow } from "./candidate-row";
import { PriorityThemePicker } from "./priority-themes";
import { QuestionHelp } from "./question-help";
export function Results() {
  const { state, ready } = useDiagnosis();
  if (!ready)
    return (
      <main id="main" className="container page-main" aria-busy="true">
        <p>回答を読み込んでいます。</p>
      </main>
    );
  if (!state.complete)
    return (
      <main id="main" className="container empty-page">
        <p className="eyebrow">あなたの回答</p>
        <h1>まずは、あなたの考えから。</h1>
        <p>質問に答えると、選んだ回答をここで見返せます。</p>
        <Link href="/diagnosis" className="button primary">
          質問へ進む →
        </Link>
      </main>
    );
  const count = (status: string) =>
    questions.filter((q) => state.answers[q.id]?.answer.status === status)
      .length;
  return (
    <main id="main" className="container results-page">
      <div className="page-topline">
        <p className="eyebrow">POLICY / あなたの回答</p>
        <Link href="/questions" className="quiet-link">
          回答を見直す ↗
        </Link>
      </div>
      <h1>
        同じ答えも、違う答えも。
        <br className="mobile-only" />
        理由まで見てみよう。
      </h1>
      <p className="lead">候補者の本人回答がそろったら、質問ごとに並べます。</p>
      <div className="notice">
        <span className="outline-label">掲載準備中</span>
        <p>
          現在は自分の回答を見返せます。総合一致率や、おすすめ順位は出しません。
        </p>
      </div>
      <p className="answer-counts">
        回答 {count("answered")}問 / 判断保留 {count("undecided")}問 / スキップ{" "}
        {count("skipped")}問
      </p>
      <section aria-label="質問ごとの回答">
        {questions.map((q) => (
          <article key={q.id} className="answer-review">
            <p className="eyebrow">{q.theme} / 質問案</p>
            <h2>{q.text}</h2>
            <p className="your-answer">
              あなた：{policyAnswerLabel(state.answers[q.id]?.answer)}
            </p>
            <QuestionHelp question={q} />
            <Link href={`/issues?theme=${q.id}`} className="inline-link">
              このテーマを見る →
            </Link>
          </article>
        ))}
      </section>
      <PriorityThemePicker />
      {candidates.length ? (
        [...candidates]
          .sort((a, b) => a.kana.localeCompare(b.kana, "ja"))
          .map((candidate) => (
            <CandidateRow key={candidate.id} candidate={candidate} />
          ))
      ) : (
        <div className="empty-notice">
          <h2>候補者の回答は、これから。</h2>
          <p>同じ質問への本人回答を確認してから掲載します。</p>
        </div>
      )}
      <div className="exploration-links">
        <Link href="/stories">本人の言葉から知る →</Link>
        <Link href="/interests">知りたいことを選ぶ →</Link>
        <Link href="/method">回答の照合について →</Link>
      </div>
    </main>
  );
}
