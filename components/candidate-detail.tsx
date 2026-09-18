"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { questions, type Candidate } from "../lib/data";
import { comparePolicyAnswers } from "../lib/policy";
import { trackEvent } from "../lib/analytics";
import { candidateResources } from "../lib/resources";
import { ExternalResourceLink } from "./external-resource-link";
import { Portrait } from "./candidate-row";
import { useDiagnosis } from "./session";
import { CandidateActions } from "./candidate-actions";
import { PriorityThemeSummary } from "./priority-themes";
import { PolicyAnswerComparison } from "./policy-answer-comparison";
import { QuestionHelp } from "./question-help";
import { InterviewStories } from "./interview-stories";
import type { PublicInterviewBlock } from "../lib/interviews";
export function CandidateDetail({
  candidate,
  interviewBlocks = [],
}: {
  candidate: Candidate;
  interviewBlocks?: readonly PublicInterviewBlock[];
}) {
  const { state } = useDiagnosis();
  const [differences, setDifferences] = useState(false);
  const resources = candidateResources[candidate.id];
  useEffect(() => {
    trackEvent("candidate_view", { candidateId: candidate.id });
  }, [candidate.id]);
  const visibleQuestions = questions.filter(
    (q) =>
      !differences ||
      comparePolicyAnswers(
        q,
        state.answers[q.id],
        candidate.policyAnswers[q.id],
        candidate.id,
      ).status === "different",
  );
  return (
    <main id="main" className="container detail-page">
      <Link href="/candidates" className="quiet-link">
        ← 候補者一覧
      </Link>
      <section className="candidate-hero">
        <Portrait name={candidate.name} large />
        <div>
          <p className="eyebrow">{candidate.kana}</p>
          <h1>{candidate.name}</h1>
          <p className="candidate-meta">
            {candidate.party ?? "所属は未掲載"} /{" "}
            {candidate.district ?? "選挙区は未掲載"}
          </p>
          <nav className="candidate-anchor-nav" aria-label="候補者の情報">
            <a href="#policy">政策を見る ↓</a>
            <a href="#humanity">本人の言葉を見る ↓</a>
          </nav>
          <CandidateActions candidate={candidate} />
          <PriorityThemeSummary
            candidate={candidate}
            onNavigate={() => setDifferences(false)}
          />
        </div>
      </section>
      <section className="detail-section" id="policy">
        <p className="eyebrow">P / 政策への回答</p>
        <h2>答えと、その理由を見る。</h2>
        <p>同じ質問・選択肢・補足の版への本人回答だけを照合します。</p>
        <label className="policy-filter">
          <input
            type="checkbox"
            checked={differences}
            onChange={(e) => setDifferences(e.target.checked)}
          />{" "}
          自分と違う選択肢だった質問だけ見る
        </label>
        {visibleQuestions.map((q) => (
          <article key={q.id} id={`policy-${q.id}`} className="answer-review">
            <p className="eyebrow">{q.theme}</p>
            <h3>{q.text}</h3>
            <QuestionHelp question={q} />
            <PolicyAnswerComparison
              question={q}
              candidate={candidate}
              userRecord={state.answers[q.id]}
            />
          </article>
        ))}
        {!visibleQuestions.length && (
          <p className="empty-notice">この条件で表示できる回答はありません。</p>
        )}
      </section>
      <section className="detail-section" id="humanity">
        <p className="eyebrow">H / 本人の言葉</p>
        <h2>どんな経験をして、どう考えた？</h2>
        <p>
          {interviewBlocks.length
            ? "本人の経験・選択・理由を、共通の項目で見てみましょう。"
            : "インタビューはまだ掲載していません。経験・判断の理由を共通の質問で聞いていきます。"}
        </p>
        <InterviewStories
          blocks={interviewBlocks}
          subjectId={candidate.id}
          compact
        />
      </section>
      <section className="detail-section">
        <h2>もっと詳しく見る</h2>
        <p>本人の発信や一次情報へ。</p>
        <div className="source-links">
          {resources?.links.map((resource) => (
            <ExternalResourceLink
              key={resource.url}
              href={resource.url}
              kind={resource.kind}
              candidateId={candidate.id}
              className="source-link"
            >
              {resource.label} ↗
            </ExternalResourceLink>
          ))}
          {!resources?.links.length && (
            <p>確認済みのリンクはまだありません。</p>
          )}
          {resources?.interview && (
            <ExternalResourceLink
              href={resources.interview.url}
              kind="youtube"
              candidateId={candidate.id}
            >
              {resources.interview.title} ↗
            </ExternalResourceLink>
          )}
        </div>
      </section>
      <Link href="/method" className="inline-link">
        回答と出典の扱いについて →
      </Link>
    </main>
  );
}
