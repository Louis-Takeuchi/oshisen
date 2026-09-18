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
      {!!state.staleQuestionIds?.length && (
        <p role="status" className="notice">
          質問や補足が更新されたため、以前の回答の一部は照合に使っていません。
        </p>
      )}
      <div className="start-facts">
        <div>
          <span>質問</span>
          <strong>{questions.length}問</strong>
        </div>
        <div>
          <span>答え方</span>
          <strong>5段階＋判断保留</strong>
        </div>
        <div>
          <span>迷ったら</span>
          <strong>保留・スキップできます</strong>
        </div>
      </div>
      <div className="notice">
        <span className="outline-label">質問の操作体験</span>
        <p>
          全8問は確認中の草案です。候補者本人の回答はまだありません。自分の回答を見返すところまで試せます。
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
