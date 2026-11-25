"use client";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  DEFAULT_QUESTION_LEVEL,
  QUESTION_LEVEL_STORAGE_KEY,
  parseQuestionLevel,
  questionLevelLabels,
  questionLevels,
  type QuestionLevel,
} from "../lib/question-levels.ts";
import styles from "./question-level.module.css";

/** 画面間で同期する現在のレベル。localStorageが使えないときは画面内だけで保持する。 */
let memoryLevel: QuestionLevel | null = null;
const subscribers = new Set<() => void>();

function readStoredLevel(): QuestionLevel {
  if (memoryLevel) return memoryLevel;
  try {
    const stored = parseQuestionLevel(
      window.localStorage.getItem(QUESTION_LEVEL_STORAGE_KEY),
    );
    return stored ?? DEFAULT_QUESTION_LEVEL;
  } catch {
    return DEFAULT_QUESTION_LEVEL;
  }
}

function storeLevel(level: QuestionLevel) {
  memoryLevel = level;
  try {
    window.localStorage.setItem(QUESTION_LEVEL_STORAGE_KEY, level);
  } catch {
    /* localStorageが使えないときは画面内だけ。 */
  }
  subscribers.forEach((callback) => callback());
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

/**
 * 日本語レベル（やさしい／ふつう／原文）。
 * URLの ?level= が付いていれば、それを優先して適用する（SNSから「やさしい」で開くため）。
 */
export function useQuestionLevel(urlLevel?: string | null) {
  const level = useSyncExternalStore(
    subscribe,
    readStoredLevel,
    () => DEFAULT_QUESTION_LEVEL,
  );
  const fromUrl = parseQuestionLevel(urlLevel ?? null);
  useEffect(() => {
    if (fromUrl) storeLevel(fromUrl);
  }, [fromUrl]);
  const setLevel = useCallback((next: QuestionLevel) => storeLevel(next), []);
  return { level: fromUrl ?? level, setLevel };
}

export function QuestionLevelSwitch({
  level,
  onChange,
}: {
  level: QuestionLevel;
  onChange: (level: QuestionLevel) => void;
}) {
  return (
    <div className={styles.switch} role="group" aria-label="日本語のレベル">
      <span className={styles.switchLabel}>ことばのレベル</span>
      <div className={styles.options}>
        {questionLevels.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={level === option}
            className={level === option ? styles.active : undefined}
            onClick={() => onChange(option)}
          >
            {questionLevelLabels[option]}
          </button>
        ))}
      </div>
    </div>
  );
}
