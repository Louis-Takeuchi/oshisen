"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { answerOptions, questions } from "../lib/data";
import { createPolicyAnswerRecord, type UserPolicyAnswer } from "../lib/policy";
import { trackEvent } from "../lib/analytics";
import { useDiagnosis } from "./session";
import { QuestionHelp } from "./question-help";
export function Questionnaire() {
  const { state, ready, save } = useDiagnosis();
  const router = useRouter();
  const heading = useRef<HTMLHeadingElement>(null);
  const [notice, setNotice] = useState("");
  const question = questions[state.index];
  const answer = state.answers[question.id]?.answer;
  useEffect(() => {
    if (ready) heading.current?.focus();
  }, [state.index, ready]);
  function choose(value: UserPolicyAnswer) {
    save({
      ...state,
      complete: false,
      answers: {
        ...state.answers,
        [question.id]: createPolicyAnswerRecord(question, value),
      },
    });
    setNotice("");
  }
  function advance(skip = false) {
    const selected: UserPolicyAnswer | undefined = skip
      ? { status: "skipped" }
      : answer;
    if (!selected) {
      setNotice("選択肢を選ぶか、スキップしてください。");
      return;
    }
    const answers = {
      ...state.answers,
      [question.id]: createPolicyAnswerRecord(question, selected),
    };
    trackEvent(
      selected.status === "skipped"
        ? "diagnosis_skip"
        : selected.status === "undecided"
          ? "diagnosis_undecided"
          : "diagnosis_answer",
      { questionId: question.id },
    );
    if (state.index === questions.length - 1) {
      save({ ...state, answers, index: state.index, complete: true });
      trackEvent("diagnosis_complete");
      router.push("/results");
    } else save({ ...state, answers, index: state.index + 1, complete: false });
  }
  if (!ready)
    return (
      <main id="main" className="question-page" aria-busy="true">
        <p>回答を読み込んでいます。</p>
      </main>
    );
  return (
    <main id="main" className="question-page">
      {!!state.staleQuestionIds?.length && (
        <p role="status" className="notice">
          質問や補足が更新されたため、以前の回答の一部は照合に使っていません。今の質問でもう一度選んでください。
        </p>
      )}
      <div className="question-progress">
        <span>あなたの考えを教えてください</span>
        <span>
          <strong>{String(state.index + 1).padStart(2, "0")}</strong> /{" "}
          {String(questions.length).padStart(2, "0")}
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="回答の進み具合"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={state.index}
      >
        <span style={{ width: `${(state.index / questions.length) * 100}%` }} />
      </div>
      <div className="question-content" key={question.id}>
        <p className="eyebrow">
          {question.theme}
          <span className="question-draft">確認中の質問案</span>
        </p>
        <h1 ref={heading} tabIndex={-1}>
          {question.text}
        </h1>
        <QuestionHelp question={question} />
        <fieldset className="answer-options">
          <legend className="sr-only">今の考えを選んでください</legend>
          {answerOptions.map((option) => (
            <label
              key={option.value}
              className={`answer-option ${answer?.status === "answered" && answer.value === option.value ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="answer"
                checked={
                  answer?.status === "answered" && answer.value === option.value
                }
                onChange={() =>
                  choose({ status: "answered", value: option.value })
                }
              />
              <span className="radio-mark" aria-hidden="true" />
              <span>{option.label}</span>
            </label>
          ))}
          <label
            className={`answer-option ${answer?.status === "undecided" ? "selected" : ""}`}
          >
            <input
              type="radio"
              name="answer"
              checked={answer?.status === "undecided"}
              onChange={() => choose({ status: "undecided" })}
            />
            <span className="radio-mark" aria-hidden="true" />
            <span>今は判断できない</span>
          </label>
        </fieldset>
        {answer?.status === "undecided" && (
          <label className="undecided-reason">
            よければ、理由も（任意）
            <select
              value={answer.reason ?? ""}
              onChange={(event) =>
                choose({
                  status: "undecided",
                  ...(event.target.value
                    ? {
                        reason: event.target.value as
                          "needs-information" | "thinking",
                      }
                    : {}),
                })
              }
            >
              <option value="">選ばない</option>
              <option value="needs-information">情報が足りない</option>
              <option value="thinking">考えがまとまっていない</option>
            </select>
          </label>
        )}
        <p className="form-message" role="status">
          {notice}
        </p>
        <div className="question-actions">
          <button
            className="quiet-link"
            disabled={state.index === 0}
            onClick={() => {
              setNotice("");
              save({ ...state, index: state.index - 1, complete: false });
            }}
          >
            ← 戻る
          </button>
          <button
            className="button primary"
            disabled={!answer}
            onClick={() => advance()}
          >
            {state.index === questions.length - 1
              ? "回答を見返す"
              : "次の質問へ"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
        <button className="skip-answer" onClick={() => advance(true)}>
          この質問はスキップする →
        </button>
      </div>
      <p className="caption quiz-footer">
        「賛成でも反対でもない」「判断できない」「スキップ」は別々に扱います。総合点は出しません。
      </p>
    </main>
  );
}
