"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  answerOptions,
  demoAnswerFixtures,
  questions,
  type Candidate,
} from "../lib/data";
import { calculateMatch } from "../lib/matching";
import { trackEvent } from "../lib/analytics";
import { useBrowserReady, useVariant } from "./use-local-settings";
import { candidateResources, isSafeResourceUrl } from "../lib/resources";
import { ExternalResourceLink } from "./external-resource-link";
import { Portrait } from "./candidate-row";
import { useDiagnosis } from "./session";
function responseLabel(value: number | null | undefined) {
  return answerOptions.find((o) => o.value === value)?.label || "回答なし";
}
export function CandidateDetail({ candidate }: { candidate: Candidate }) {
  const { state, ready } = useDiagnosis();
  const [differences, setDifferences] = useState(false);
  const humanity = useVariant() !== "policy";
  const browserReady = useBrowserReady();
  const [shareMessage, setShareMessage] = useState("");
  const policyRef = useRef<HTMLElement>(null),
    humanityRef = useRef<HTMLElement>(null);
  const diagnosed = ready && state.complete;
  const fixture = demoAnswerFixtures[candidate.id];
  const match = calculateMatch(state.answers, fixture);
  const resources = candidateResources[candidate.id];
  useEffect(() => {
    trackEvent("candidate_view", { candidateId: candidate.id });
  }, [candidate.id]);
  useEffect(() => {
    if (!browserReady) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackEvent(
              entry.target.id === "policy"
                ? "policy_detail_view"
                : "humanity_view",
              { candidateId: candidate.id },
            );
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0 },
    );
    if (policyRef.current) observer.observe(policyRef.current);
    if (humanityRef.current) observer.observe(humanityRef.current);
    return () => observer.disconnect();
  }, [candidate.id, humanity, browserReady]);
  async function share() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/candidates/${candidate.id}`,
      );
      setShareMessage("ページのURLをコピーしました。");
    } catch {
      setShareMessage("ブラウザのアドレスからページURLをコピーできます。");
    }
  }
  const visibleQuestions = questions.filter(
    (q) =>
      !differences ||
      (state.answers[q.id] != null &&
        fixture[q.id] != null &&
        Math.abs(state.answers[q.id]! - fixture[q.id]!) > 1),
  );
  return (
    <main id="main" className="container detail-page">
      <div className="page-topline">
        <Link href="/candidates" className="quiet-link">
          ← 候補者一覧
        </Link>
        <span className="outline-label">仮名・デモ</span>
      </div>
      <section className="candidate-hero">
        <Portrait name={candidate.name} large />
        <div>
          <p className="eyebrow">{candidate.kana}</p>
          <h1>{candidate.name}</h1>
          <p className="candidate-meta">所属・年齢・現新別：未登録</p>
          <p className="caption">このページは候補者詳細のサンプルです。</p>
          <nav className="candidate-anchor-nav" aria-label="候補者の情報">
            <a href="#policy">政策を見る ↓</a>
            {humanity && <a href="#humanity">人となりを見る ↓</a>}
          </nav>
        </div>
        {diagnosed && (
          <div className="match-display hero-match">
            <span>
              あなたとの政策一致度 <small>デモ</small>
            </span>
            <strong>
              {match.score ?? "—"}
              <em>{match.score !== null && "%"}</em>
            </strong>
            <small>{match.comparedCount}問を比較した参考値</small>
          </div>
        )}
      </section>
      <section className="profile-section">
        <h2>基本プロフィール</h2>
        <dl className="profile-grid">
          <div>
            <dt>選挙区</dt>
            <dd>未登録</dd>
          </div>
          <div>
            <dt>所属</dt>
            <dd>未登録</dd>
          </div>
          <div>
            <dt>年齢・現新別</dt>
            <dd>未登録</dd>
          </div>
        </dl>
      </section>
      <section className="detail-section" id="policy" ref={policyRef}>
        <div className="section-heading">
          <p className="eyebrow">まずは、政策から。</p>
          <h2>同じ考えも、違う考えも。</h2>
          <p>テーマごとに比べると、一致度の理由が見えてきます。</p>
        </div>
        <div className="notice">
          <span className="outline-label">比較のデモ</span>
          <p>
            候補者側の数値は計算確認用です。{candidate.name}
            の政策・発言を示すものではありません。実際の候補者回答は未掲載です。
          </p>
        </div>
        {!diagnosed && (
          <p className="before-diagnosis">
            <Link href="/diagnosis" className="inline-link">
              診断に答える →
            </Link>{" "}
            あなたの回答と確認用データを並べて比較できます。
          </p>
        )}
        {diagnosed && (
          <div className="policy-controls">
            <span className="caption">
              比較できた質問：{match.comparedCount} / {questions.length}
            </span>
            <label>
              <input
                type="checkbox"
                checked={differences}
                onChange={(e) => setDifferences(e.target.checked)}
              />
              考えが違ったテーマだけ見る
            </label>
          </div>
        )}
        <div className="policy-comparison">
          {visibleQuestions.map((q) => {
            const yours = diagnosed ? state.answers[q.id] : null;
            const theirs = diagnosed ? fixture[q.id] : null;
            const distance =
              yours == null || theirs == null ? null : Math.abs(yours - theirs);
            return (
              <article className="policy-row" key={q.id}>
                <div className="policy-question">
                  <span className="theme-label">{q.theme}</span>
                  <h3>{q.text}</h3>
                  <details>
                    <summary>この質問について</summary>
                    <p>{q.context}</p>
                  </details>
                </div>
                <div className="comparison-answers">
                  <div>
                    <span>あなた</span>
                    <p>{diagnosed ? responseLabel(yours) : "診断前"}</p>
                  </div>
                  <div>
                    <span>
                      候補者側 <small>確認用</small>
                    </span>
                    <p>
                      {diagnosed ? responseLabel(theirs) : "実際の回答は未掲載"}
                    </p>
                  </div>
                </div>
                {diagnosed && (
                  <span
                    className={`comparison-status ${distance !== null && distance <= 1 ? "close" : ""}`}
                  >
                    {distance === null
                      ? "比較なし"
                      : distance <= 1
                        ? "近い"
                        : "異なる"}
                  </span>
                )}
              </article>
            );
          })}
          {visibleQuestions.length === 0 && (
            <p className="empty-notice">
              比較できた質問の中に、考えが違ったテーマはありません。
            </p>
          )}
        </div>
        <p className="caption">
          「近い」は選択肢の差が0〜1段階、「異なる」は2〜4段階。人柄は一致度に含みません。
        </p>
        <Link className="text-link" href="/method">
          計算方法を詳しく見る →
        </Link>
      </section>
      {humanity && (
        <section
          className="detail-section humanity-section"
          id="humanity"
          ref={humanityRef}
        >
          <p className="eyebrow">政策から、少し離れて。</p>
          <h2>この人、どんな人？</h2>
          <p>
            考え方や日常について聞いてみる。
            <br />
            本人の言葉を知るための、インタビュー項目です。
          </p>
          <div className="interview-questions">
            {[
              "休みが1日あったら？",
              "これまでで一番大きかった失敗は？",
              "判断に迷ったとき、最後に信じるものは？",
            ].map((q, i) => (
              <article key={q}>
                <span className="small-index">
                  Q{String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{q}</h3>
                  <p>本人の回答はまだ掲載していません。</p>
                  <span className="caption">質問例</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      {humanity && (
        <section className="detail-section">
          <p className="eyebrow">歩んできた道</p>
          <h2>これまでの経歴</h2>
          <div className="empty-editorial">
            <p>経歴情報は未掲載です。</p>
            <span className="caption">
              候補者本人の回答や一次情報を確認して掲載します。
            </span>
          </div>
        </section>
      )}
      {humanity && (
        <section className="detail-section">
          <p className="eyebrow">Podcast / Interview</p>
          <h2>
            本人のことばを、
            <br className="mobile-only" />
            もう少し聞く。
          </h2>
          <div className="video-feature">
            {resources.interview?.thumbnailUrl &&
            isSafeResourceUrl(resources.interview.thumbnailUrl) ? (
              // Verified thumbnail only; no embedded player or third-party script.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="video-thumbnail"
                src={resources.interview.thumbnailUrl}
                alt={resources.interview.title}
                loading="lazy"
                width={640}
                height={360}
              />
            ) : (
              <div className="video-placeholder">
                <span>オシセン / インタビュー</span>
                <strong>
                  その人の話を、
                  <br />
                  その人の言葉で。
                </strong>
                <small>
                  {resources.interview
                    ? resources.interview.durationLabel
                    : "動画は未掲載"}
                </small>
              </div>
            )}
            <div>
              {resources.interview &&
              isSafeResourceUrl(resources.interview.url) ? (
                <>
                  <span className="outline-label">インタビュー</span>
                  <h3>{resources.interview.title}</h3>
                  <p>{resources.interview.description}</p>
                  <p className="caption">{resources.interview.durationLabel}</p>
                  <ExternalResourceLink
                    href={resources.interview.url}
                    kind="youtube"
                    candidateId={candidate.id}
                    className="button secondary"
                  >
                    YouTubeで見る ↗
                  </ExternalResourceLink>
                </>
              ) : (
                <>
                  <span className="outline-label">公開準備中</span>
                  <h3>
                    政治家になる前、
                    <br />
                    何をしていましたか？
                  </h3>
                  <p>
                    インタビューのテーマ例です。動画を掲載する際は、概要と実際の動画尺を表示します。
                  </p>
                  <button className="button secondary" disabled>
                    YouTubeで見る ↗
                  </button>
                  <p className="caption">動画公開後、YouTubeに移動します。</p>
                </>
              )}
            </div>
          </div>
        </section>
      )}
      <section className="detail-section">
        <p className="eyebrow">一次情報へ</p>
        <h2>もっと詳しく見る</h2>
        <p>気になったことは、本人の発信や公的な情報でも。</p>
        <div className="source-links">
          {resources.links.length > 0
            ? resources.links.map((resource) => (
                <ExternalResourceLink
                  key={resource.url}
                  href={resource.url}
                  kind={resource.kind}
                  candidateId={candidate.id}
                  className="source-link"
                >
                  <span>{resource.label}</span>
                  <span aria-hidden="true">↗</span>
                </ExternalResourceLink>
              ))
            : [
                "候補者公式サイト",
                "選挙公報",
                "X",
                "Instagram",
                "YouTube",
                "議会での発言",
              ].map((label) => (
                <div key={label}>
                  <span>{label}</span>
                  <span className="caption">リンク未登録</span>
                </div>
              ))}
        </div>
        <p className="caption">
          確認できたURLのみ掲載します。このサンプルには外部リンクを設定していません。
        </p>
      </section>
      <section className="detail-source">
        <h2>このページの情報源</h2>
        <dl>
          <div>
            <dt>候補者情報</dt>
            <dd>未取得・未掲載</dd>
          </div>
          <div>
            <dt>比較データ</dt>
            <dd>操作・計算確認用の数値（実際の政策ではありません）</dd>
          </div>
          <div>
            <dt>取材・更新日</dt>
            <dd>実在候補者の取材は未実施</dd>
          </div>
        </dl>
        <Link href="/sources" className="text-link">
          情報源・公平性について →
        </Link>
      </section>
      <div className="detail-bottom">
        <Link className="text-link" href="/candidates">
          ← ほかの候補者を見る
        </Link>
        <div>
          <button className="text-link" onClick={share}>
            このページのURLをコピー ↗
          </button>
          <p className="caption" role="status">
            {shareMessage}
          </p>
        </div>
      </div>
    </main>
  );
}
