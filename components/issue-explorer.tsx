"use client";

import Link from "next/link";
import {
  answerOptions,
  candidates,
  demoAnswerFixtures,
  demoNotice,
  questionDraftNotice,
  questions,
  type QuestionId,
} from "../lib/data";
import { getIssueQuestion, groupCandidatesByIssue } from "../lib/issues";
import { CandidateActions } from "./candidate-actions";
import styles from "./issues.module.css";

export function IssueExplorer({
  theme,
  invalidTheme = false,
}: {
  theme: QuestionId;
  invalidTheme?: boolean;
}) {
  const question = getIssueQuestion(theme) ?? questions[0];
  const groups = groupCandidatesByIssue(
    question.id,
    candidates,
    demoAnswerFixtures,
  );

  return (
    <main id="main" className="container page-main">
      <p className="eyebrow">気になる問題から、一人ひとりへ。</p>
      <h1>争点から見る</h1>
      <p className="lead">
        名前を知らなくても、気になるテーマから。
        <br />
        同じ問いへの考え方を、並べて見てみよう。
      </p>
      <div className="notice">
        <span className="outline-label">サンプル回答・デモ</span>
        <p>{demoNotice}</p>
      </div>

      <nav className={styles.themeNav} aria-label="気になるテーマから選ぶ">
        <h2>気になるテーマは？</h2>
        <ul className={styles.themeList}>
          {questions.map((item, index) => (
            <li key={item.id}>
              <Link
                href={`/issues?theme=${item.id}`}
                aria-current={item.id === question.id ? "page" : undefined}
                className={styles.themeLink}
              >
                <span className={styles.themeNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{item.theme}</span>
                {item.id === question.id && (
                  <span className={styles.selectedLabel}>選択中</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {invalidTheme && (
        <p className={styles.invalidNotice} role="status">
          指定されたテーマが見つからないため、公共交通を表示しています。
          上のテーマから選び直せます。
        </p>
      )}

      <section className={styles.question} aria-labelledby="issue-question">
        <p className="eyebrow">{question.theme} / 設問案</p>
        <h2 id="issue-question">{question.text}</h2>
        <p className={styles.context}>{question.context}</p>
        <details className={styles.draftDetails}>
          <summary>この設問と表示のルール</summary>
          <p>{questionDraftNotice}</p>
          <p>
            同じ設問への5段階のサンプル回答を3つに分けています。
            「回答未確認」は「どちらともいえない」とは別に表示します。
            各グループ内は仮名の五十音順で、一致度や保存数による並べ替えはしません。
            この分類は候補者全体の政治的立場や、政策の優劣を示すものではありません。
          </p>
        </details>
      </section>

      <p className={styles.groupRule}>
        サンプル回答で分類 / {candidates.length}名 /
        各グループ内は仮名の五十音順
      </p>
      <div className={styles.groups}>
        {groups.map((group) => (
          <section
            key={group.id}
            className={`${styles.group} ${group.id === "unknown" ? styles.unknownGroup : ""}`}
            aria-labelledby={`issue-group-${group.id}`}
          >
            <div className={styles.groupHeading}>
              <h3 id={`issue-group-${group.id}`}>{group.label}</h3>
              <span className={styles.count}>{group.members.length}名</span>
            </div>
            <p className={styles.groupDescription}>{group.description}</p>
            {group.members.length ? (
              <ul className={styles.candidateList}>
                {group.members.map(({ candidate, answer }) => (
                  <li key={candidate.id} className={styles.candidate}>
                    <p className="caption">仮名・サンプル</p>
                    <h4>
                      <Link
                        href={`/candidates/${candidate.id}#policy-${question.id}`}
                      >
                        {candidate.name}
                      </Link>
                    </h4>
                    <p className={styles.answer}>
                      <span>サンプル回答</span>
                      {answer === null
                        ? "未確認"
                        : answerOptions.find(
                            (option) => option.value === answer,
                          )?.label}
                    </p>
                    <Link
                      className={`text-link ${styles.policyLink}`}
                      href={`/candidates/${candidate.id}#policy-${question.id}`}
                    >
                      政策を詳しく見る
                      <span aria-hidden="true">→</span>
                      <span className="sr-only">
                        （{candidate.name}・{question.theme}）
                      </span>
                    </Link>
                    <CandidateActions candidate={candidate} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyGroup}>
                {group.id === "unknown"
                  ? "このテーマでは全員分のサンプル回答があります。実際の本人回答は全員未登録です。"
                  : "このサンプルでは該当する候補者がいません。"}
              </p>
            )}
          </section>
        ))}
      </div>

      <div className="closing-note">
        <div>
          <p>気になる2人を選んで、ほかのテーマも比べてみよう。</p>
          <p className="caption">
            比較への追加や保存は、投票先の選択ではありません。
          </p>
        </div>
        <Link className="button secondary" href="/compare">
          候補者を比較する <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
