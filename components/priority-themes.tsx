"use client";
import Link from "next/link";
import { useState } from "react";
import {
  questionPath,
  questionTagLabel,
  sentQuestions,
} from "../lib/election2026.ts";
import { useConsideration } from "./use-consideration";
import styles from "./consideration.module.css";
export function PriorityThemePicker() {
  const { ready, priorityIds, togglePriority } = useConsideration();
  const [message, setMessage] = useState("");
  return (
    <section
      className={styles.priorityPicker}
      aria-labelledby="priority-heading"
    >
      <p className="eyebrow">N / 知りたいことから。</p>
      <h2 id="priority-heading">関心のある質問</h2>
      <p>
        任意で3つまで選べます。気になる情報に進みやすいよう、選んだ質問への案内に使っています。
      </p>
      <fieldset>
        <legend>
          知りたい質問 <span>{priorityIds.length} / 3</span>
        </legend>
        <div className={styles.themeChoices}>
          {sentQuestions.map((question) => (
            <label key={question.id}>
              <input
                type="checkbox"
                checked={priorityIds.includes(question.id)}
                disabled={!ready}
                onChange={() => setMessage(togglePriority(question.id).message)}
              />
              {questionTagLabel(question)}
            </label>
          ))}
        </div>
      </fieldset>
      <p className="caption">
        選択はこのタブ内に保存されます。選ばなくても利用できます。
      </p>
      <p className={styles.actionMessage} role="status">
        {message}
      </p>
    </section>
  );
}
export function PriorityThemeSummary({
  candidateId,
  onNavigate,
}: {
  candidateId?: string;
  onNavigate?: () => void;
}) {
  const { priorityIds, ready } = useConsideration();
  if (!ready || !priorityIds.length) return null;
  return (
    <div className={styles.prioritySummary}>
      <p>知りたい質問へ</p>
      <ul>
        {sentQuestions
          .filter((question) => priorityIds.includes(question.id))
          .map((question) => (
            <li key={question.id}>
              <Link
                href={
                  candidateId
                    ? `/candidates/${candidateId}#policy-${question.id}`
                    : questionPath(question)
                }
                onClick={onNavigate}
              >
                {question.themeLabel} →
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
