"use client";
import Link from "next/link";
import { useState } from "react";
import { questions, type Candidate } from "../lib/data";
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
      <h2 id="priority-heading">どのテーマが気になる？</h2>
      <p>
        任意で3つまで。選んだテーマへの案内に使います。政策の回答照合や候補者の並び順には使いません。
      </p>
      <fieldset>
        <legend>
          知りたいテーマ <span>{priorityIds.length} / 3</span>
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
        テーマの選択はこのタブ内に保存されます。選ばなくても利用できます。
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
  if (!ready || !priorityIds.length) return null;
  return (
    <div className={styles.prioritySummary}>
      <p>知りたいテーマへ</p>
      <ul>
        {questions
          .filter((q) => priorityIds.includes(q.id))
          .map((q) => (
            <li key={q.id}>
              <Link
                href={`/candidates/${candidate.id}#policy-${q.id}`}
                onClick={onNavigate}
              >
                {q.theme} →
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
