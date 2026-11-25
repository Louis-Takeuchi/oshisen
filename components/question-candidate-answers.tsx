"use client";
import Link from "next/link";
import { useState } from "react";
import {
  districtLabels,
  districts,
  scaleLabels,
  type District,
  type SentQuestion,
} from "../lib/election2026.ts";
import {
  candidateAnswerStateLabel,
  candidatesInDistrict,
  getCandidatePolicyAnswer,
  hasPublishedCandidates,
} from "../lib/candidates2026.ts";
import { useQuestionSession } from "./question-session";
import { ScaleSevenDots } from "./scale-seven";
import styles from "./question-candidate-answers.module.css";

export const PRE_ANNOUNCEMENT_ROW_NOTICE =
  "候補者の回答は12月4日（告示日）以降、届出順にここに並びます";

/** 理由の冒頭は全員同じ80字で切る。 */
export function truncateReason(text: string, limit = 80): string {
  const characters = Array.from(text.replace(/\s+/g, " ").trim());
  if (characters.length <= limit) return characters.join("");
  return `${characters.slice(0, limit).join("")}…`;
}

/**
 * 質問ごとに候補者の回答を届出順で1行ずつ並べる（P3-3）。
 * 告示前（公開候補者0人）は案内の枠だけを出す。
 * 非回答は丸を出さず文言で表示し、行は消さない。並べ替え機能は作らない。
 */
export function QuestionCandidateAnswers({
  question,
  headingLevel = "h2",
}: {
  question: SentQuestion;
  headingLevel?: "h2" | "h3";
}) {
  const { state } = useQuestionSession();
  const [selected, setSelected] = useState<District | null>(null);
  const defaultDistrict: District =
    question.scope !== "common"
      ? question.scope
      : state.district === "tsuchiura"
        ? "tsuchiura"
        : "tsukuba";
  const district = selected ?? defaultDistrict;
  const setDistrict = setSelected;
  const Heading = headingLevel;

  if (!hasPublishedCandidates)
    return (
      <div className={styles.preNotice}>
        <p>{PRE_ANNOUNCEMENT_ROW_NOTICE}</p>
      </div>
    );

  const list = candidatesInDistrict(district);
  const userAnswer = state.answers[question.id]?.answer;
  const userValue =
    userAnswer?.status === "answered" ? userAnswer.value : null;

  return (
    <section className={styles.answers} aria-label="候補者の回答">
      <div className={styles.answersHead}>
        <Heading className={styles.answersTitle}>候補者の回答（届出順）</Heading>
        {question.scope === "common" ? (
          <div
            className={styles.districtSwitch}
            role="group"
            aria-label="選挙区の切り替え"
          >
            {districts.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={district === value}
                className={district === value ? styles.activeDistrict : ""}
                onClick={() => setDistrict(value)}
              >
                {districtLabels[value]}
              </button>
            ))}
          </div>
        ) : (
          <p className={styles.districtNote}>{districtLabels[district]}</p>
        )}
      </div>
      {list.length === 0 ? (
        <div className={styles.preNotice}>
          <p>{PRE_ANNOUNCEMENT_ROW_NOTICE}</p>
        </div>
      ) : (
        <ol className={styles.rows}>
          {list.map((candidate) => {
            const answer = getCandidatePolicyAnswer(candidate.id, question.id);
            const stateLabel = candidateAnswerStateLabel(answer);
            return (
              <li key={candidate.id} className={styles.row}>
                <div className={styles.rowHead}>
                  <span className={styles.filingOrder}>
                    {candidate.filingOrder}
                  </span>
                  <Link
                    href={`/candidates/${candidate.id}`}
                    className={styles.name}
                  >
                    {candidate.name}
                  </Link>
                </div>
                {answer && answer.value !== null ? (
                  <div className={styles.answerBody}>
                    <div className={styles.dotsLine}>
                      <ScaleSevenDots
                        value={answer.value}
                        userValue={userValue}
                        candidateName={candidate.name}
                      />
                      <span className={styles.valueLabel}>
                        {scaleLabels[answer.value]}（{answer.value}）
                      </span>
                    </div>
                    {answer.reason && (
                      <details className={styles.reason}>
                        <summary>
                          <span className={styles.reasonExcerpt}>
                            {truncateReason(answer.reason)}
                          </span>
                          <span className={styles.readAll}>全文を読む</span>
                        </summary>
                        <p className={styles.reasonFull}>{answer.reason}</p>
                      </details>
                    )}
                  </div>
                ) : (
                  <p className={styles.nonAnswer}>{stateLabel}</p>
                )}
              </li>
            );
          })}
        </ol>
      )}
      {userValue !== null && list.length > 0 && (
        <p className={styles.legend}>
          <span className={styles.legendUser} aria-hidden="true" />
          あなたの回答の位置
        </p>
      )}
    </section>
  );
}
