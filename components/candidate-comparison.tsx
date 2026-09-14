"use client";

import { useState } from "react";
import Link from "next/link";
import { candidates, demoAnswerFixtures, questions } from "../lib/data";
import {
  answerLabel,
  comparisonRows,
  selectComparisonCandidates,
} from "../lib/comparison";
import { calculateMatch, isAnswerValue } from "../lib/matching";
import { useDiagnosis } from "./session";
import { useConsideration } from "./use-consideration";
import { PriorityThemeSummary } from "./priority-themes";
import styles from "./comparison.module.css";

type Filter = "all" | "different" | "unavailable";

export function CandidateComparison() {
  const { compareIds, ready, toggleCompare, clearCompare } = useConsideration();
  const diagnosis = useDiagnosis();
  const [filter, setFilter] = useState<Filter>("all");
  const [message, setMessage] = useState("");
  const selected = selectComparisonCandidates(compareIds);
  const [left, right] = selected;
  const rows =
    left && right
      ? comparisonRows(
          demoAnswerFixtures[left.id],
          demoAnswerFixtures[right.id],
        )
      : [];
  const different = rows.filter((row) => row.isDifferent);
  const unavailable = rows.filter((row) => row.distance === null);
  const visible = rows.filter((row) =>
    filter === "different"
      ? row.isDifferent
      : filter === "unavailable"
        ? row.distance === null
        : true,
  );
  const hasDiagnosis = diagnosis.ready && diagnosis.state.complete;

  return (
    <main id="main" className={`container page-main ${styles.page}`}>
      <div className="page-topline">
        <p className="eyebrow">似ているところも、違うところも。</p>
        <Link href="/candidates" className="quiet-link">
          候補者一覧へ →
        </Link>
      </div>
      <h1>この2人、何が違う？</h1>
      <p className="lead">
        同じ質問への答えを、横に並べて。
        <br />
        数字の先にある考えを、あなた自身で確かめよう。
      </p>
      <div className={`notice ${styles.notice}`}>
        <span className="outline-label">比較デモ</span>
        <p>
          掲載名はすべて架空です。表の回答・一致度は、比較方法を試すための確認用数値です。
          実在の候補者の政策・本人の回答ではありません。本人回答と一次情報は未掲載です。
        </p>
      </div>

      {!ready ? (
        <p className={styles.loading} aria-busy="true">
          比較する候補者を読み込んでいます。
        </p>
      ) : (
        <>
          <fieldset
            className={styles.selection}
            aria-describedby="compare-help"
          >
            <legend>比較する2人を選ぶ</legend>
            <p id="compare-help" className="caption">
              仮名の五十音順です。一致度による並べ替えはしていません。
              2人選んだ後は、どちらかの選択を外すと入れ替えられます。
            </p>
            <div className={styles.choices}>
              {candidates.map((candidate) => {
                const checked = compareIds.includes(candidate.id);
                return (
                  <label
                    key={candidate.id}
                    className={`${styles.choice} ${checked ? styles.checked : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!checked && selected.length >= 2}
                      onChange={() => {
                        setMessage(toggleCompare(candidate.id).message);
                        setFilter("all");
                      }}
                    />
                    <span>
                      {candidate.name}
                      <small>（仮名）</small>
                    </span>
                  </label>
                );
              })}
            </div>
            <div className={styles.selectionFooter}>
              <span className="caption">{selected.length} / 2人を選択</span>
              {selected.length > 0 && (
                <button
                  type="button"
                  className="quiet-link"
                  onClick={() => {
                    setMessage(clearCompare().message);
                    setFilter("all");
                  }}
                >
                  比較の選択を解除
                </button>
              )}
            </div>
          </fieldset>
          <p role="status" className={styles.status}>
            {message}
          </p>
          {selected.length < 2 ? (
            <section className={styles.empty} aria-labelledby="compare-empty">
              <p className="eyebrow">比較は、診断なしでも。</p>
              <h2 id="compare-empty">
                {selected.length === 0
                  ? "まずは、気になる2人を。"
                  : "もう1人選ぶと、並べて見られます。"}
              </h2>
              <p>
                上の候補者から2人を選ぶと、8つの政策と特に違った政策を表示します。
                診断済みなら、あなたとの一致度も確認できます。
              </p>
              <Link href="/issues" className="text-link">
                争点から候補者を探す →
              </Link>
            </section>
          ) : (
            <section
              className={styles.comparison}
              aria-labelledby="comparison-title"
            >
              <div className={styles.sectionHeading}>
                <div>
                  <p className="eyebrow">同じ質問で見比べる</p>
                  <h2 id="comparison-title">政策の比較</h2>
                </div>
                <Link href="/method" className="inline-link">
                  一致度の計算方法 ↗
                </Link>
              </div>
              <div className={styles.summary}>
                <p>
                  <strong>{different.length}テーマ</strong>
                  で、確認用の回答に2段階以上の違いがあります。
                </p>
                <p className="caption">
                  比較できる政策 {rows.length - unavailable.length} /{" "}
                  {questions.length}問。
                  「特に違った政策」は5段階の回答で2段階以上離れたものです。
                  未掲載は違いにも中立にも数えません。違いは候補者の優劣を示しません。
                </p>
              </div>
              <div
                className={styles.filters}
                role="group"
                aria-label="政策の表示を絞り込む"
              >
                {(
                  [
                    ["all", `すべて（${rows.length}）`],
                    ["different", `特に違った政策（${different.length}）`],
                    [
                      "unavailable",
                      `比較できない政策（${unavailable.length}）`,
                    ],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={filter === value}
                    className={styles.filter}
                    onClick={() => setFilter(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p
                id="comparison-scroll-hint"
                className={`caption ${styles.scrollHint}`}
              >
                表が収まらないときは、横にスクロールしてご覧ください。
              </p>
              <div
                role="region"
                aria-label="2人の政策比較表"
                aria-describedby="comparison-scroll-hint"
                // A named scroll region must be focusable for keyboard scrolling.
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                tabIndex={0}
                className={styles.tableScroller}
              >
                <table className={styles.table}>
                  <caption>
                    架空の候補者の確認用数値による比較。本人の回答ではありません。
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">同じ質問への回答</th>
                      {selected.map((candidate) => (
                        <th scope="col" key={candidate.id}>
                          <Link href={`/candidates/${candidate.id}`}>
                            {candidate.name} ↗
                          </Link>
                          <span>仮名 / 確認用数値</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={styles.scoreRow}>
                      <th scope="row">
                        あなたとの政策一致度
                        <span>全問を同じ重さで計算</span>
                      </th>
                      {selected.map((candidate) => {
                        const match = hasDiagnosis
                          ? calculateMatch(
                              diagnosis.state.answers,
                              demoAnswerFixtures[candidate.id],
                            )
                          : null;
                        return (
                          <td key={candidate.id}>
                            <strong className={styles.score}>
                              {match?.score != null ? `${match.score}%` : "—"}
                            </strong>
                            <span>
                              {match
                                ? match.comparedCount > 0
                                  ? `比較できた設問 ${match.comparedCount} / ${match.totalCount}問`
                                  : "共通する有効回答がなく計算できません"
                                : "診断後に表示します"}
                            </span>
                            <PriorityThemeSummary candidate={candidate} />
                          </td>
                        );
                      })}
                    </tr>
                    {visible.map((row) => (
                      <tr
                        key={row.question.id}
                        className={
                          row.isDifferent ? styles.differentRow : undefined
                        }
                      >
                        <th scope="row">
                          <Link
                            href={`/issues?theme=${row.question.id}`}
                            className={styles.themeLink}
                          >
                            {row.question.theme} ↗
                          </Link>
                          <span className={styles.question}>
                            {row.question.text}
                          </span>
                          {row.isDifferent && (
                            <span className={styles.differenceLabel}>
                              2人の回答に{row.distance}段階の違い
                            </span>
                          )}
                          {hasDiagnosis && (
                            <span className={styles.userAnswer}>
                              あなた：
                              {isAnswerValue(
                                diagnosis.state.answers[row.question.id],
                              )
                                ? answerLabel(
                                    diagnosis.state.answers[row.question.id],
                                  )
                                : "未回答（比較対象外）"}
                            </span>
                          )}
                        </th>
                        <td>{answerLabel(row.left)}</td>
                        <td>{answerLabel(row.right)}</td>
                      </tr>
                    ))}
                    {visible.length === 0 && (
                      <tr>
                        <td colSpan={3} className={styles.noRows}>
                          {filter === "different"
                            ? "確認用の回答では、2段階以上離れた政策はありません。"
                            : "確認用数値は全8問そろっています。候補者本人の実際の回答は、すべて未掲載です。"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {!hasDiagnosis && (
                <p className={styles.diagnosisInvite}>
                  <Link href="/diagnosis" className="inline-link">
                    診断して、あなたの考えとも比べる →
                  </Link>
                </p>
              )}
              <div className={styles.sourceNote}>
                <h3>数字の次は、本人の説明へ。</h3>
                <p>
                  このデモでは本人の回答・原文・動画をまだ掲載していません。
                  本番では、各政策の出典や本人の説明を確認できるようにします。
                </p>
                <div className={styles.detailLinks}>
                  {selected.map((candidate) => (
                    <Link
                      href={`/candidates/${candidate.id}#policy`}
                      className="text-link"
                      key={candidate.id}
                    >
                      {candidate.name}の政策と情報源 →
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
      <p className={`caption ${styles.privacyNote}`}>
        比較する組み合わせはこのブラウザ内だけで保持し、URLや外部には送りません。
        <Link href="/privacy" className="inline-link">
          保存情報の扱い
        </Link>
      </p>
    </main>
  );
}
