"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { questions } from "../lib/data";
import { trackEvent } from "../lib/analytics";
import { emptyDiagnosis, useDiagnosis } from "./session";
export function DiagnosisStart() {
  const { state, ready, save } = useDiagnosis();
  const router = useRouter();
  const hasProgress = ready && Object.keys(state.answers).length > 0;
  function start() {
    save(emptyDiagnosis());
    trackEvent("diagnosis_start");
    router.push("/questions");
  }
  return (
    <main id="main" className="container diagnosis-start">
      <p className="eyebrow">あなたの考えから、はじめよう。</p>
      <h1>
        まずは、あなたの考えを
        <br className="desktop-only" />
        教えてください。
      </h1>
      <p className="lead">
        正解はありません。
        <br />
        「どちらかといえば」で答えて大丈夫です。
      </p>
      <div className="start-facts">
        <div>
          <span>質問</span>
          <strong>{questions.length}問</strong>
        </div>
        <div>
          <span>答え方</span>
          <strong>5つの選択肢</strong>
        </div>
        <div>
          <span>迷ったら</span>
          <strong>スキップもできます</strong>
        </div>
      </div>
      <div className="notice">
        <span className="outline-label">デモ診断</span>
        <p>
          質問は制作中の案です。結果は計算の仕組みを体験するための参考値で、実在の候補者の政策は反映していません。
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
            前回の結果を見る →
          </Link>
        )}
      </div>
      <p className="caption">
        回答によって特定候補への投票を勧めるものではありません。
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
