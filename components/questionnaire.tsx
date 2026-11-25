"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserAnswerRecord,
  districtNames,
  questionTagLabel,
  questionsForDistrict,
  type DistrictChoice,
  type NonAnswerKind,
  type ScaleValue,
} from "../lib/election2026.ts";
import { trackEvent } from "../lib/analytics";
import { KikumaruLoading, KikumaruNote } from "./kikumaru";
import { useQuestionSession } from "./question-session";
import { QuestionLevelSwitch, useQuestionLevel } from "./question-level";
import { QuestionText } from "./question-text";
import { QuestionExplainer } from "./question-explainer";
import { ScaleSevenInput } from "./scale-seven";
import styles from "./questionnaire.module.css";

const districtChoices: readonly {
  readonly value: DistrictChoice;
  readonly label: string;
  readonly note: string;
}[] = [
  {
    value: "tsukuba",
    label: "つくば市",
    note: "共通6問＋つくば市の2問（全8問）",
  },
  {
    value: "tsuchiura",
    label: "土浦市",
    note: "共通6問＋土浦市の2問（全8問）",
  },
  {
    value: "undecided",
    label: "どちらでもない・わからない",
    note: "共通の6問に答えます",
  },
];

export function Questionnaire({ urlLevel }: { urlLevel?: string | null }) {
  const { state, ready, save } = useQuestionSession();
  const { level, setLevel } = useQuestionLevel(urlLevel);
  const router = useRouter();
  const heading = useRef<HTMLHeadingElement>(null);
  const [notice, setNotice] = useState("");
  const flow = state.district ? questionsForDistrict(state.district) : [];
  const index = Math.min(state.index, Math.max(flow.length - 1, 0));
  const question = flow[index];
  const answer = question ? state.answers[question.id]?.answer : undefined;
  useEffect(() => {
    if (ready && question) heading.current?.focus();
  }, [index, ready, question]);

  if (!ready)
    return (
      <main id="main" className="question-page" aria-busy="true">
        <KikumaruLoading message="回答を読み込んでいます。" />
      </main>
    );

  if (!state.district)
    return (
      <main id="main" className="question-page">
        <div className="question-content">
          <p className="eyebrow">はじめる前に</p>
          <h1 className={styles.districtHeading}>
            お住まいの選挙区を選んでください
          </h1>
          <p className={styles.districtLead}>
            選挙区によって、共通の6問に加えて出る2問が変わります。選んだ内容はこのブラウザのタブ内にだけ保存します。
          </p>
          <div className={styles.districtButtons}>
            {districtChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                className={styles.districtButton}
                onClick={() => {
                  save({
                    ...state,
                    district: choice.value,
                    index: 0,
                    complete: false,
                  });
                  trackEvent("diagnosis_start");
                }}
              >
                <strong>{choice.label}</strong>
                <span>{choice.note}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    );

  if (!question) return null;

  function choose(value: ScaleValue) {
    save({
      ...state,
      complete: false,
      answers: {
        ...state.answers,
        [question.id]: createUserAnswerRecord(question, {
          status: "answered",
          value,
        }),
      },
    });
    setNotice("");
  }

  function chooseNonAnswer(kind: NonAnswerKind) {
    save({
      ...state,
      complete: false,
      answers: {
        ...state.answers,
        [question.id]: createUserAnswerRecord(question, {
          status: "non-answer",
          kind,
        }),
      },
    });
    setNotice("");
  }

  function advance() {
    if (!answer) {
      setNotice(
        "7段階のどれかを選ぶか、下の「判断材料が足りない」「設問の前提に異議がある」「答えない（スキップ）」から選んでください。",
      );
      return;
    }
    trackEvent(
      answer.status === "non-answer" ? "diagnosis_skip" : "diagnosis_answer",
      { questionId: question.id },
    );
    if (index === flow.length - 1) {
      save({ ...state, index, complete: true });
      trackEvent("diagnosis_complete");
      router.push("/results");
    } else save({ ...state, index: index + 1, complete: false });
  }

  return (
    <main id="main" className="question-page">
      <div className="question-progress">
        <span>あなたの考えを教えてください</span>
        <span>
          <strong>{String(index + 1).padStart(2, "0")}</strong> /{" "}
          {String(flow.length).padStart(2, "0")}
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="回答の進み具合"
        aria-valuemin={0}
        aria-valuemax={flow.length}
        aria-valuenow={index}
      >
        <span style={{ width: `${(index / flow.length) * 100}%` }} />
      </div>
      <div className="question-content" key={question.id}>
        <p className="eyebrow">{questionTagLabel(question)}</p>
        <QuestionLevelSwitch level={level} onChange={setLevel} />
        <QuestionText question={question} level={level} headingRef={heading} />
        <p className={styles.sameQuestionNote}>
          候補者にも、この文のまま聞いています（7段階＋理由400〜600字）
        </p>
        <QuestionExplainer questionId={question.id} level={level} />
        <ScaleSevenInput
          name={`answer-${question.id}`}
          answer={answer}
          onAnswer={choose}
          onNonAnswer={chooseNonAnswer}
        />
        <p className="form-message" role="status">
          {notice}
        </p>
        <div className="question-actions">
          <button
            className="quiet-link"
            disabled={index === 0}
            onClick={() => {
              setNotice("");
              save({ ...state, index: index - 1, complete: false });
            }}
          >
            ← 戻る
          </button>
          <button className="button primary" onClick={() => advance()}>
            {index === flow.length - 1 ? "回答を見返す" : "次の質問へ"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
        {index === 0 && (
          <button
            className={styles.changeDistrict}
            type="button"
            onClick={() =>
              save({ ...state, district: null, index: 0, complete: false })
            }
          >
            選挙区を選び直す（今は{" "}
            {state.district === "undecided"
              ? "どちらでもない・わからない"
              : districtNames[state.district]}
            ）
          </button>
        )}
      </div>
      <div className={styles.quizFooterNote}>
        <KikumaruNote>
          <p className="caption">
            回答の意味をそのまま残せるよう、「賛成でも反対でもない」「判断材料が足りない」「設問の前提に異議がある」「答えない（スキップ）」を区別して、選んだ内容を質問ごとに表示します。
          </p>
        </KikumaruNote>
      </div>
    </main>
  );
}
