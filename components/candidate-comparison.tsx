"use client";
import Link from "next/link";
import { useState } from "react";
import {
  candidateAnswerStateLabel,
  candidatesInDistrict,
  getCandidate2026,
  getCandidatePolicyAnswer,
  hasPublishedCandidates,
} from "../lib/candidates2026.ts";
import {
  districtLabels,
  districts,
  questionTagLabel,
  questionsForDistrict,
  scaleLabels,
  type District,
} from "../lib/election2026.ts";
import { useSavedDistrictDefault } from "./question-session";
import { ScaleSevenDots } from "./scale-seven";
import { truncateReason } from "./question-candidate-answers";
import styles from "./candidates2026.module.css";

/**
 * 2人を比べる（P3-4）。同じ選挙区から2人を選び、8問を上から順に左右に並べる。
 * 初期表示は空欄（届出番号1番・2番を自動で選ばない）。
 */
export function CandidateComparison() {
  const defaultDistrict = useSavedDistrictDefault();
  const [selected, setSelected] = useState<District | null>(null);
  const district = selected ?? defaultDistrict;
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");
  const list = candidatesInDistrict(district);
  const left = leftId ? getCandidate2026(leftId) : undefined;
  const right = rightId ? getCandidate2026(rightId) : undefined;
  const pair = [left, right].filter(
    (candidate): candidate is NonNullable<typeof candidate> =>
      Boolean(candidate),
  );
  const questions = questionsForDistrict(district);
  function changeDistrict(next: District) {
    setSelected(next);
    setLeftId("");
    setRightId("");
  }
  return (
    <main id="main" className="container page-main">
      <p className="eyebrow">政策への回答</p>
      <h1>2人の回答を比べる</h1>
      <p className="lead">
        同じ選挙区から2人を選ぶと、8問を上から順に左右に並べます。比べるのは1問ずつです。
      </p>
      {!hasPublishedCandidates ? (
        <div className="empty-notice">
          <h2>候補者回答の掲載準備</h2>
          <p>
            候補者の回答は12月4日（告示日）以降、立候補届出順に掲載します。そろった選挙区から、ここで2人ずつ見比べられます。
          </p>
          <Link href="/diagnosis" className="text-link">
            先に自分の回答を試す →
          </Link>
        </div>
      ) : (
        <>
          <div
            className={styles.districtTabs}
            role="group"
            aria-label="選挙区の切り替え"
          >
            {districts.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={district === value}
                className={district === value ? styles.activeTab : undefined}
                onClick={() => changeDistrict(value)}
              >
                {districtLabels[value]}
              </button>
            ))}
          </div>
          <div className={styles.compareSelects}>
            {(
              [
                ["1人目", leftId, setLeftId, rightId],
                ["2人目", rightId, setRightId, leftId],
              ] as const
            ).map(([label, value, setValue, otherId]) => (
              <label key={label}>
                {label}
                <select
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                >
                  <option value="">選んでください（届出順）</option>
                  {list.map((candidate) => (
                    <option
                      key={candidate.id}
                      value={candidate.id}
                      disabled={candidate.id === otherId}
                    >
                      {candidate.filingOrder}. {candidate.name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          {pair.length === 2 ? (
            questions.map((question) => (
              <section
                className="answer-review"
                key={question.id}
                id={`compare-${question.id}`}
              >
                <p className="eyebrow">{questionTagLabel(question)}</p>
                <h2>{question.text}</h2>
                <div className={styles.compareColumns}>
                  {pair.map((candidate) => {
                    const answer = getCandidatePolicyAnswer(
                      candidate.id,
                      question.id,
                    );
                    return (
                      <div key={candidate.id} className={styles.compareCell}>
                        <p className={styles.compareName}>
                          {candidate.filingOrder}. {candidate.name}
                        </p>
                        {answer && answer.value !== null ? (
                          <>
                            <div className={styles.policyPosition}>
                              <ScaleSevenDots
                                value={answer.value}
                                candidateName={candidate.name}
                              />
                              <span className={styles.policyPositionLabel}>
                                {scaleLabels[answer.value]}（{answer.value}）
                              </span>
                            </div>
                            {answer.reason && (
                              <p className="caption">
                                {truncateReason(answer.reason)}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className={styles.policyNonAnswer}>
                            {candidateAnswerStateLabel(answer)}
                          </p>
                        )}
                        <Link
                          href={`/candidates/${candidate.id}#policy-${question.id}`}
                          className={styles.compareLink}
                        >
                          全文を読む →
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          ) : (
            <div className="empty-notice">
              <p>
                上の2つの欄から、同じ選挙区の候補者を2人選んでください。届出順に並んでいます。
              </p>
            </div>
          )}
        </>
      )}
      <div className="exploration-links">
        <Link href="/candidates">候補者一覧へ →</Link>
        <Link href="/talk">インタビュー動画へ →</Link>
      </div>
    </main>
  );
}
