import type { SentQuestion } from "./election2026.ts";

/**
 * 日本語のレベル切り替え（やさしい／ふつう／原文）。
 * 候補者が答えたのは「原文」なので、どのレベルからも原文に戻れるようにする。
 * 候補者の回答文と7段階の選択肢の文言は、レベルによって切り替えない。
 */
export type QuestionLevel = "easy" | "normal" | "original";

export const questionLevels: readonly QuestionLevel[] = [
  "easy",
  "normal",
  "original",
];

export const questionLevelLabels: Record<QuestionLevel, string> = {
  easy: "やさしい",
  normal: "ふつう",
  original: "原文",
};

/** 最初は「ふつう」。 */
export const DEFAULT_QUESTION_LEVEL: QuestionLevel = "normal";

/** 選んだレベルの保存先（localStorage。使えないときは画面内だけ）。 */
export const QUESTION_LEVEL_STORAGE_KEY = "oshisen:question-level:v1";

export function isQuestionLevel(value: unknown): value is QuestionLevel {
  return value === "easy" || value === "normal" || value === "original";
}

/** URL の ?level=easy／normal／original を解釈する（不正値は無視）。 */
export function parseQuestionLevel(value: unknown): QuestionLevel | null {
  if (typeof value !== "string") return null;
  return isQuestionLevel(value) ? value : null;
}

export function questionTextForLevel(
  question: Pick<SentQuestion, "text" | "textNormal" | "textEasy">,
  level: QuestionLevel,
): string {
  if (level === "easy") return question.textEasy;
  if (level === "normal") return question.textNormal;
  return question.text;
}

/** 解説の「原文」レベルは「ふつう」と同じ中身を表示する。 */
export function explainerLevel(level: QuestionLevel): "easy" | "normal" {
  return level === "easy" ? "easy" : "normal";
}
