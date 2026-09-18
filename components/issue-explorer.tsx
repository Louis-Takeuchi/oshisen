"use client";
import Link from "next/link";
import {
  candidates,
  questionDraftNotice,
  questions,
  type QuestionId,
} from "../lib/data";
import { getIssueQuestion } from "../lib/issues";
import { QuestionHelp } from "./question-help";
import { PolicyAnswerComparison } from "./policy-answer-comparison";
import { useDiagnosis } from "./session";
import styles from "./issues.module.css";
export function IssueExplorer({
  theme,
  invalidTheme = false,
}: {
  theme: QuestionId;
  invalidTheme?: boolean;
}) {
  const question = getIssueQuestion(theme) ?? questions[0];
  const { state } = useDiagnosis();
  return (
    <main id="main" className="container page-main">
      <p className="eyebrow">気になるテーマから。</p>
      <h1>争点から見る</h1>
      <p className="lead">同じ問いへの考え方を、理由と一緒に。</p>
      <div className="notice">
        <span className="outline-label">確認中の質問案</span>
        <p>{questionDraftNotice}</p>
      </div>
      <nav className={styles.themeNav} aria-label="気になるテーマから選ぶ">
        <h2>気になるテーマは？</h2>
        <ul className={styles.themeList}>
          {questions.map((q, i) => (
            <li key={q.id}>
              <Link
                href={`/issues?theme=${q.id}`}
                aria-current={q.id === question.id ? "page" : undefined}
                className={styles.themeLink}
              >
                <span className={styles.themeNumber}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{q.theme}</span>
                {q.id === question.id && (
                  <span className={styles.selectedLabel}>選択中</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {invalidTheme && (
        <p role="status">
          指定されたテーマが見つからないため、公共交通を表示しています。
        </p>
      )}
      <section className={styles.question}>
        <p className="eyebrow">{question.theme} / 設問案</p>
        <h2>{question.text}</h2>
        <QuestionHelp question={question} />
      </section>
      {candidates.length ? (
        [...candidates]
          .sort((a, b) => a.kana.localeCompare(b.kana, "ja"))
          .map((candidate) => (
            <article className="answer-review" key={candidate.id}>
              <h2>
                <Link
                  href={`/candidates/${candidate.id}#policy-${question.id}`}
                >
                  {candidate.name} →
                </Link>
              </h2>
              <PolicyAnswerComparison
                question={question}
                candidate={candidate}
                userRecord={state.answers[question.id]}
              />
            </article>
          ))
      ) : (
        <div className="empty-notice">
          <h2>本人の回答は、まだありません。</h2>
          <p>
            同じ質問への回答を確認してから、理由・条件・出典と一緒に掲載します。
          </p>
        </div>
      )}
      <div className="exploration-links">
        <Link href="/diagnosis">自分でも質問に答える →</Link>
        <Link href="/policy-register">質問の台帳を見る →</Link>
        <Link href="/stories">本人の経験や考え方を知る →</Link>
      </div>
    </main>
  );
}
