"use client";
import type { ReactNode } from "react";
import { questionTextForLevel, type QuestionLevel } from "../lib/question-levels.ts";
import type { SentQuestion } from "../lib/election2026.ts";
import styles from "./question-text.module.css";

/**
 * レベル（やさしい／ふつう／原文）に応じた質問文。
 * 「やさしい」「ふつう」のときは、すぐ下から候補者が答えた原文を開ける。
 */
export function QuestionText({
  question,
  level,
  as: Heading = "h1",
  headingRef,
}: {
  question: SentQuestion;
  level: QuestionLevel;
  as?: "h1" | "h2" | "p";
  headingRef?: React.Ref<HTMLHeadingElement>;
}) {
  const text = questionTextForLevel(question, level);
  const heading: ReactNode =
    Heading === "h1" ? (
      <h1
        ref={headingRef}
        tabIndex={-1}
        className={level === "easy" ? styles.easyText : undefined}
      >
        {text}
      </h1>
    ) : Heading === "h2" ? (
      <h2 className={level === "easy" ? styles.easyText : undefined}>{text}</h2>
    ) : (
      <p
        className={`${styles.plainText} ${level === "easy" ? styles.easyText : ""}`}
      >
        {text}
      </p>
    );
  return (
    <div className={styles.block}>
      {heading}
      {level !== "original" && (
        <details className={styles.originalDetails}>
          <summary>候補者が答えた原文を見る</summary>
          <p className={styles.originalText}>{question.text}</p>
        </details>
      )}
    </div>
  );
}
