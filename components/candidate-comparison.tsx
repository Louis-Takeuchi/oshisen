"use client";
import Link from "next/link";
import { candidates, questions } from "../lib/data";
import { useConsideration } from "./use-consideration";
import { useDiagnosis } from "./session";
import { CandidateActions } from "./candidate-actions";
import { PolicyAnswerComparison } from "./policy-answer-comparison";
import { QuestionHelp } from "./question-help";
export function CandidateComparison() {
  const { compareIds, ready, priorityIds } = useConsideration();
  const { state } = useDiagnosis();
  const selected = [...candidates]
    .filter((c) => compareIds.includes(c.id))
    .sort((a, b) => a.kana.localeCompare(b.kana, "ja"))
    .slice(0, 2);
  return (
    <main id="main" className="container page-main">
      <p className="eyebrow">同じ問いから、考え方を見る。</p>
      <h1>2人の回答を見比べる</h1>
      <p className="lead">選択肢だけでなく、理由や条件、出典まで。</p>
      {!ready ? (
        <p aria-busy="true">選択を確認しています。</p>
      ) : (
        <>
          {selected.length < 2 && (
            <div className="empty-notice">
              <h2>
                {candidates.length
                  ? "比較する2人を選んでください。"
                  : "候補者の回答は掲載準備中です。"}
              </h2>
              <p>回答がそろったら、同じ質問への本人回答を並べます。</p>
              <Link href="/candidates" className="text-link">
                候補者を見る →
              </Link>
            </div>
          )}
          <div className="comparison-selection">
            {selected.map((c) => (
              <div key={c.id}>
                <h2>{c.name}</h2>
                <CandidateActions candidate={c} />
              </div>
            ))}
          </div>
          {selected.length === 2 && (
            <>
              {priorityIds.length > 0 && (
                <nav
                  className="exploration-links"
                  aria-label="知りたいテーマへ"
                >
                  {questions
                    .filter((q) => priorityIds.includes(q.id))
                    .map((q) => (
                      <a key={q.id} href={`#compare-${q.id}`}>
                        {q.theme} ↓
                      </a>
                    ))}
                </nav>
              )}
              {questions.map((q) => (
                <section
                  className="answer-review"
                  key={q.id}
                  id={`compare-${q.id}`}
                >
                  <p className="eyebrow">{q.theme}</p>
                  <h2>{q.text}</h2>
                  <QuestionHelp question={q} />
                  <div className="comparison-columns">
                    {selected.map((c) => (
                      <PolicyAnswerComparison
                        key={c.id}
                        question={q}
                        candidate={c}
                        userRecord={state.answers[q.id]}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}
        </>
      )}
      <div className="exploration-links">
        <Link href="/stories">経験や判断の理由を知る →</Link>
        <Link href="/issues">政策のテーマを見る →</Link>
      </div>
      <p className="caption">
        候補者の列は五十音順。総合点や、優劣を示す順位はつけません。
      </p>
    </main>
  );
}
