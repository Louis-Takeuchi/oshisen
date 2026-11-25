"use client";
import Link from "next/link";
import { KikumaruNote } from "./kikumaru";
import { useRouter } from "next/navigation";
import { trackEvent } from "../lib/analytics";
import {
  emptyQuestionSession,
  useQuestionSession,
} from "./question-session";

export function DiagnosisStart() {
  const { state, ready, save } = useQuestionSession();
  const router = useRouter();
  const hasProgress = ready && Object.keys(state.answers).length > 0;
  function start() {
    save(emptyQuestionSession());
    trackEvent("diagnosis_start");
    router.push("/questions");
  }
  return (
    <main id="main" className="container diagnosis-start">
      <p className="eyebrow">政策への回答</p>
      <h1>政策の質問</h1>
      <KikumaruNote>
        <p className="lead">
          正解はありません。
          <br />
          「どちらかといえば」で答えて大丈夫です。
        </p>
      </KikumaruNote>
      <div className="start-facts">
        <div>
          <span>質問</span>
          <strong>共通6問＋選挙区2問</strong>
        </div>
        <div>
          <span>答え方</span>
          <strong>7段階（候補者と同じ）</strong>
        </div>
        <div>
          <span>迷ったら</span>
          <strong>保留・スキップできます</strong>
        </div>
      </div>
      <div className="notice">
        <span className="outline-label">候補者と同じ質問</span>
        <p>
          候補者にも同じ質問をしています。回答は12月4日から並びます。はじめに選挙区（つくば市／土浦市）を選びます。
        </p>
      </div>
      <div className="start-actions">
        {hasProgress && !state.complete && (
          <Link className="button primary" href="/questions">
            続きから答える →
          </Link>
        )}
        <button
          className={`button ${hasProgress && !state.complete ? "secondary" : "primary"}`}
          onClick={start}
        >
          {hasProgress ? "最初からやり直す" : "質問をはじめる"}
          <span aria-hidden="true">→</span>
        </button>
        {state.complete && (
          <Link href="/results" className="text-link">
            前回の回答を見る →
          </Link>
        )}
      </div>
      <p className="caption">
        自分の考えを整理し、投票について考えるきっかけとして使えます。
      </p>
      <p className="caption">
        回答はこのタブ内に保存されます。
        <Link href="/privacy" className="inline-link">
          データの扱いについて
        </Link>
      </p>
    </main>
  );
}
