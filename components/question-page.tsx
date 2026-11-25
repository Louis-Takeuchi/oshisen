"use client";
import Link from "next/link";
import { useState } from "react";
import {
  createUserAnswerRecord,
  getSentQuestion,
  questionTagLabel,
  type NonAnswerKind,
  type ScaleValue,
} from "../lib/election2026.ts";
import { trackEvent } from "../lib/analytics";
import {
  saveSingleAnswer,
  useQuestionSession,
} from "./question-session";
import { QuestionLevelSwitch, useQuestionLevel } from "./question-level";
import { QuestionText } from "./question-text";
import { QuestionExplainer } from "./question-explainer";
import { ScaleSevenInput } from "./scale-seven";
import { QuestionCandidateAnswers } from "./question-candidate-answers";
import styles from "./questionnaire.module.css";

/** /q/[質問ID]：1問ずつ直接開けるページ。開いたその場で回答できる。 */
export function QuestionPage({
  questionId,
  urlLevel,
}: {
  questionId: string;
  urlLevel?: string | null;
}) {
  const question = getSentQuestion(questionId);
  const { state, ready } = useQuestionSession();
  const { level, setLevel } = useQuestionLevel(urlLevel);
  const [saved, setSaved] = useState(false);
  if (!question) return null;
  const answer = ready ? state.answers[question.id]?.answer : undefined;

  function choose(value: ScaleValue) {
    saveSingleAnswer(
      question!.id,
      createUserAnswerRecord(question!, { status: "answered", value }),
    );
    trackEvent("diagnosis_answer", { questionId: question!.id });
    setSaved(true);
  }

  function chooseNonAnswer(kind: NonAnswerKind) {
    saveSingleAnswer(
      question!.id,
      createUserAnswerRecord(question!, { status: "non-answer", kind }),
    );
    trackEvent("diagnosis_skip", { questionId: question!.id });
    setSaved(true);
  }

  return (
    <main id="main" className="container page-main">
      <p className="eyebrow">{questionTagLabel(question)}</p>
      <QuestionLevelSwitch level={level} onChange={setLevel} />
      <QuestionText question={question} level={level} />
      <p className={styles.sameQuestionNote}>
        候補者にも、この文のまま聞いています（7段階＋理由400〜600字）
      </p>
      <QuestionExplainer questionId={question.id} level={level} />
      <section aria-label="あなたの回答">
        <h2 className={styles.singleAnswerHeading}>あなたならどう答える？</h2>
        <ScaleSevenInput
          name={`single-${question.id}`}
          answer={answer}
          onAnswer={choose}
          onNonAnswer={chooseNonAnswer}
        />
        <p className="caption" role="status">
          {saved
            ? "回答をこのブラウザのタブ内に保存しました。ほかの質問にも続けて答えられます。"
            : "回答はこのブラウザのタブ内にだけ保存され、サーバーには送られません。"}
        </p>
        <div className="exploration-links">
          <Link href="/diagnosis">最初から全部の質問に答える →</Link>
          <Link href="/issues">質問の一覧を見る →</Link>
          <Link href="/results">自分の回答を見返す →</Link>
        </div>
      </section>
      <QuestionCandidateAnswers question={question} />
    </main>
  );
}
