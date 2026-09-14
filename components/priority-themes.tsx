"use client";
import Link from "next/link";
import { useState } from "react";
import { questions, demoAnswerFixtures, type Candidate } from "../lib/data";
import { isAnswerValue } from "../lib/matching";
import { useConsideration } from "./use-consideration";
import { useDiagnosis } from "./session";
import styles from "./consideration.module.css";

export function PriorityThemePicker() {
  const { ready, priorityIds, togglePriority } = useConsideration();
  const [message, setMessage] = useState("");
  return (
    <section
      className={styles.priorityPicker}
      aria-labelledby="priority-heading"
    >
      <p className="eyebrow">一致度とは別の、あなたの視点。</p>
      <h2 id="priority-heading">特に気になるテーマは？</h2>
      <p>
        任意で3つまで。テーマを選んでも、政策一致度・候補者の表示順は変わりません。
      </p>
      <fieldset>
        <legend>
          重視するテーマ <span>{priorityIds.length} / 3</span>
        </legend>
        <div className={styles.themeChoices}>
          {questions.map((question) => (
            <label key={question.id}>
              <input
                type="checkbox"
                checked={priorityIds.includes(question.id)}
                disabled={!ready}
                onChange={() => setMessage(togglePriority(question.id).message)}
              />
              {question.theme}
            </label>
          ))}
        </div>
      </fieldset>
      <p className="caption">
        選択はこのタブ内だけに保存されます。選ばなくても診断・比較を利用できます。
      </p>
      <p className={styles.actionMessage} role="status">
        {message}
      </p>
    </section>
  );
}

export function PriorityThemeSummary({
  candidate,
  onNavigate,
}: {
  candidate: Candidate;
  onNavigate?: () => void;
}) {
  const { priorityIds, ready } = useConsideration();
  const diagnosis = useDiagnosis();
  if (
    !ready ||
    !diagnosis.ready ||
    !diagnosis.state.complete ||
    !priorityIds.length
  )
    return null;
  return (
    <div className={styles.prioritySummary}>
      <p>
        あなたが重視したテーマでは <small>デモ</small>
      </p>
      <ul>
        {questions
          .filter((question) => priorityIds.includes(question.id))
          .map((question) => {
            const yours = diagnosis.state.answers[question.id];
            const theirs = demoAnswerFixtures[candidate.id][question.id];
            const comparable = isAnswerValue(yours) && isAnswerValue(theirs);
            const label = !comparable
              ? "比較できません"
              : Math.abs(yours - theirs) <= 1
                ? "近い"
                : "異なる";
            return (
              <li key={question.id}>
                <Link
                  href={`/candidates/${candidate.id}#policy-${question.id}`}
                  onClick={onNavigate}
                >
                  {question.theme}
                </Link>
                <span>{label}</span>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
