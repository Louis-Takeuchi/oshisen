"use client";
import {
  nonAnswerKinds,
  nonAnswerLabels,
  scaleAxisLabels,
  scaleLabels,
  scaleValues,
  type NonAnswerKind,
  type ScaleValue,
  type UserAnswer,
} from "../lib/election2026.ts";
import styles from "./scale-seven.module.css";

/**
 * 7段階（1〜7）の回答入力。横一列の丸。候補者と同じ尺度。
 * 丸のタップ範囲は44px以上。選んだら下に文言（やや賛成 など）を表示する。
 */
export function ScaleSevenInput({
  name,
  answer,
  onAnswer,
  onNonAnswer,
}: {
  name: string;
  answer?: UserAnswer;
  onAnswer: (value: ScaleValue) => void;
  onNonAnswer: (kind: NonAnswerKind) => void;
}) {
  const selectedValue = answer?.status === "answered" ? answer.value : null;
  const selectedKind = answer?.status === "non-answer" ? answer.kind : null;
  return (
    <div className={styles.scaleBlock}>
      <fieldset className={styles.scaleFieldset}>
        <legend className="sr-only">
          1（強く反対）から7（強く賛成）の7段階で選んでください
        </legend>
        <div className={styles.dotsRow} role="radiogroup" aria-label="7段階の回答">
          {scaleValues.map((value) => (
            <label
              key={value}
              className={`${styles.dotCell} ${
                selectedValue === value ? styles.dotSelected : ""
              }`}
            >
              <input
                type="radio"
                name={name}
                checked={selectedValue === value}
                onChange={() => onAnswer(value)}
                aria-label={`${value} ${scaleLabels[value]}`}
              />
              <span className={styles.dot} aria-hidden="true">
                {value}
              </span>
            </label>
          ))}
        </div>
        <div className={styles.axisLabels} aria-hidden="true">
          <span>{scaleAxisLabels.min}</span>
          <span>{scaleAxisLabels.middle}</span>
          <span>{scaleAxisLabels.max}</span>
        </div>
      </fieldset>
      <p className={styles.selectedLabel} role="status">
        {selectedValue !== null
          ? `あなたの選択：${scaleLabels[selectedValue]}（${selectedValue}）`
          : selectedKind !== null
            ? `あなたの選択：${nonAnswerLabels[selectedKind]}`
            : " "}
      </p>
      <div className={styles.nonAnswerRow}>
        {nonAnswerKinds.map((kind) => (
          <button
            key={kind}
            type="button"
            className={`${styles.nonAnswerButton} ${
              selectedKind === kind ? styles.nonAnswerSelected : ""
            }`}
            aria-pressed={selectedKind === kind}
            onClick={() => onNonAnswer(kind)}
          >
            {nonAnswerLabels[kind]}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * 候補者の位置の表示用（読み取り専用）。
 * 本人の位置を塗りつぶし、利用者が答えていればその位置を別の色の輪で示す。
 */
export function ScaleSevenDots({
  value,
  userValue,
  candidateName,
  size = "small",
}: {
  value: ScaleValue;
  userValue?: ScaleValue | null;
  candidateName?: string;
  size?: "small" | "large";
}) {
  return (
    <span
      className={`${styles.readonlyRow} ${size === "large" ? styles.readonlyLarge : ""}`}
      role="img"
      aria-label={`${candidateName ? `${candidateName}：` : ""}${
        scaleLabels[value]
      }（7段階中 ${value}）${
        userValue
          ? `。あなたは ${scaleLabels[userValue]}（${userValue}）`
          : ""
      }`}
    >
      {scaleValues.map((position) => (
        <span
          key={position}
          aria-hidden="true"
          className={`${styles.readonlyDot} ${
            position === value ? styles.readonlyFilled : ""
          } ${position === userValue ? styles.readonlyUser : ""}`}
        >
          {size === "large" ? position : ""}
        </span>
      ))}
    </span>
  );
}
