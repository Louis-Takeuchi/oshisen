"use client";
import Link from "next/link";
import {
  districtNames,
  districtQuestions,
  questionPath,
  questionTagLabel,
  questionsForDistrict,
  userAnswerLabel,
} from "../lib/election2026.ts";
import { KikumaruLoading } from "./kikumaru";
import { useQuestionSession } from "./question-session";
import { QuestionLevelSwitch, useQuestionLevel } from "./question-level";
import { QuestionText } from "./question-text";
import { QuestionExplainer } from "./question-explainer";
import { QuestionCandidateAnswers } from "./question-candidate-answers";
import { PriorityThemePicker } from "./priority-themes";

export function Results({ urlLevel }: { urlLevel?: string | null }) {
  const { state, ready } = useQuestionSession();
  const { level, setLevel } = useQuestionLevel(urlLevel);
  if (!ready)
    return (
      <main id="main" className="container page-main" aria-busy="true">
        <KikumaruLoading message="回答を読み込んでいます。" />
      </main>
    );
  if (!state.district || Object.keys(state.answers).length === 0)
    return (
      <main id="main" className="container empty-page">
        <p className="eyebrow">あなたの回答</p>
        <h1>回答の見直し</h1>
        <p>質問に答えると、選んだ回答をここで見返せます。</p>
        <Link href="/diagnosis" className="button primary">
          質問へ進む →
        </Link>
      </main>
    );
  const flow = questionsForDistrict(state.district);
  const count = (predicate: (label: string) => boolean) =>
    flow.filter((question) => {
      const answer = state.answers[question.id]?.answer;
      if (!answer)
        return predicate("unanswered");
      return predicate(
        answer.status === "answered" ? "answered" : answer.kind,
      );
    }).length;
  return (
    <main id="main" className="container results-page">
      <div className="page-topline">
        <p className="eyebrow">POLICY / あなたの回答</p>
        <Link href="/questions" className="quiet-link">
          回答を見直す ↗
        </Link>
      </div>
      <h1>回答の見直し・比較</h1>
      <p className="lead">
        候補者の本人回答は12月4日（告示日）以降、質問ごとに並べて見比べられます。
      </p>
      <div className="notice">
        <span className="outline-label">告示後に掲載</span>
        <p>
          自分の考えを一問ずつ確かめられるよう、選んだ回答を質問ごとに表示しています。候補者の回答は12月4日（告示日）以降、立候補届出順に各質問の下へ並びます。
        </p>
      </div>
      <QuestionLevelSwitch level={level} onChange={setLevel} />
      <p className="answer-counts">
        回答 {count((s) => s === "answered")}問 / 判断材料が足りない{" "}
        {count((s) => s === "insufficient-info")}問 / 設問の前提に異議{" "}
        {count((s) => s === "premise-objection")}問 / スキップ{" "}
        {count((s) => s === "skip" || s === "unanswered")}問
      </p>
      <section aria-label="質問ごとの回答">
        {flow.map((question) => (
          <article key={question.id} className="answer-review">
            <p className="eyebrow">{questionTagLabel(question)}</p>
            <QuestionText question={question} level={level} as="h2" />
            <p className="your-answer">
              あなた：{userAnswerLabel(state.answers[question.id]?.answer)}
            </p>
            <QuestionExplainer questionId={question.id} level={level} />
            <QuestionCandidateAnswers question={question} headingLevel="h3" />
            <Link href={questionPath(question)} className="inline-link">
              この質問のページで見る →
            </Link>
          </article>
        ))}
      </section>
      {state.district === "undecided" && (
        <section className="empty-notice" aria-label="選挙区ごとの質問">
          <h2>選挙区ごとの2問にも答えられます</h2>
          <p>
            共通の6問に加えて、各選挙区には地域の2問があります。気になる選挙区の質問へどうぞ。
          </p>
          <div className="exploration-links">
            {(["tsukuba", "tsuchiura"] as const).map((district) => (
              <span key={district}>
                {districtNames[district]}の2問：
                {districtQuestions(district).map((question) => (
                  <Link
                    key={question.id}
                    href={questionPath(question)}
                    style={{ marginLeft: 12 }}
                  >
                    {question.themeLabel} →
                  </Link>
                ))}
              </span>
            ))}
          </div>
        </section>
      )}
      <PriorityThemePicker />
      <div className="exploration-links">
        <Link href="/candidates">候補者の一覧へ →</Link>
        <Link href="/talk">インタビュー動画へ →</Link>
        <Link href="/method">回答の照合について →</Link>
      </div>
    </main>
  );
}
