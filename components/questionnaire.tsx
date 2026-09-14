"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { answerOptions, questions, type AnswerValue } from "../lib/data";
import { trackEvent } from "../lib/analytics";
import { useDiagnosis } from "./session";
export function Questionnaire() {
  const { state, ready, save } = useDiagnosis();
  const router = useRouter();
  const heading = useRef<HTMLHeadingElement>(null);
  const [notice, setNotice] = useState("");
  const question = questions[state.index];
  const answer = state.answers[question.id];
  useEffect(() => {
    if (ready) heading.current?.focus();
  }, [state.index, ready]);
  function choose(value: AnswerValue) {
    save({
      ...state,
      complete: false,
      answers: { ...state.answers, [question.id]: value },
    });
    setNotice("");
  }
  function advance(skip = false) {
    if (!skip && answer == null) {
      setNotice("選択肢を選ぶか、スキップしてください。");
      return;
    }
    const answers = { ...state.answers, [question.id]: skip ? null : answer! };
    trackEvent("diagnosis_answer", { questionId: question.id });
    if (state.index === questions.length - 1) {
      save({ answers, index: state.index, complete: true });
      trackEvent("diagnosis_complete");
      router.push("/results");
    } else save({ answers, index: state.index + 1, complete: false });
  }
  if (!ready)
    return (
      <main id="main" className="question-page" aria-busy="true">
        <p>回答を読み込んでいます。</p>
      </main>
    );
  return (
    <main id="main" className="question-page">
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
          <span className="question-draft">質問案</span>
        </p>
        <h1 ref={heading} tabIndex={-1}>
          {question.text}
        </h1>
        <details className="question-context">
          <summary>この質問について</summary>
          <p>{question.context}</p>
        </details>
        <fieldset className="answer-options">
          <legend className="sr-only">
            あなたの考えに近い回答を選んでください
          </legend>
          {answerOptions.map((option) => (
            <label
              key={option.value}
              className={`answer-option ${answer === option.value ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="answer"
                value={option.value}
                checked={answer === option.value}
                onChange={() => choose(option.value)}
              />
              <span className="radio-mark" aria-hidden="true" />
              <span>{option.label}</span>
              {answer === option.value && (
                <span className="selected-label">選択中</span>
              )}
            </label>
          ))}
        </fieldset>
        <p className="form-message" role="status">
          {notice}
        </p>
        <div className="question-actions">
          <button
            className="quiet-link"
            disabled={state.index === 0}
            onClick={() =>
              save({ ...state, index: state.index - 1, complete: false })
            }
          >
            ← 戻る
          </button>
          <button
            className="button primary"
            disabled={answer == null}
            onClick={() => advance()}
          >
            {state.index === questions.length - 1 ? "結果を見る" : "次の質問へ"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
        <button className="skip-answer" onClick={() => advance(true)}>
          この質問はスキップする →
        </button>
      </div>
      <p className="caption quiz-footer">
        スキップした質問は、一致度の計算に含めません。
      </p>
    </main>
  );
}
