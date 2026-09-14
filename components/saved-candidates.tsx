"use client";
import Link from "next/link";
import { useState } from "react";
import { candidates, demoAnswerFixtures } from "../lib/data";
import { calculateMatch } from "../lib/matching";
import { useConsideration } from "./use-consideration";
import { useDiagnosis } from "./session";
import { CandidateRow } from "./candidate-row";
import styles from "./consideration.module.css";

export function SavedCandidates() {
  const { savedIds, ready, storageAvailable, clearSaved } = useConsideration();
  const diagnosis = useDiagnosis();
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <main id="main" className="container page-main">
      <p className="eyebrow">気になった人を、もう少し考える。</p>
      <h1>気になる候補</h1>
      <p className="lead">
        保存は支持や投票先の表明ではありません。
        <br />
        あとで見返したい人を、ここに。
      </p>
      <div className="notice">
        <span className="outline-label">このブラウザ内だけ</span>
        <p>
          ログイン不要です。同じ端末・ブラウザではタブを閉じても残ります。共有端末では使い終わったら削除してください。端末をまたいだ同期・サーバーへの送信はありません。
        </p>
      </div>
      <p className="caption">
        掲載候補は仮名、政策比較は確認用のデモです。保存順ではなく五十音順で表示します。
      </p>
      {storageAvailable === false && (
        <p role="status" className="empty-notice">
          ブラウザに保存できていません。現在の画面内だけで保持しています。
        </p>
      )}
      {!ready ? (
        <p aria-busy="true">保存した候補を確認しています。</p>
      ) : (
        <>
          <div className={styles.savedTools}>
            <p>{savedIds.length}人を保存</p>
            <Link className="text-link" href="/compare">
              候補者を比較する →
            </Link>
          </div>
          {!savedIds.length ? (
            <div className="empty-notice">
              <h2>まだ保存した候補はいません。</h2>
              <p>候補者の「気になる候補に追加」から保存できます。</p>
              <Link className="button primary" href="/candidates">
                候補者を見る →
              </Link>
              <Link className="text-link" href="/issues">
                争点から探す →
              </Link>
            </div>
          ) : (
            candidates
              .filter((candidate) => savedIds.includes(candidate.id))
              .map((candidate) => (
                <CandidateRow
                  key={candidate.id}
                  candidate={candidate}
                  match={
                    diagnosis.ready && diagnosis.state.complete
                      ? calculateMatch(
                          diagnosis.state.answers,
                          demoAnswerFixtures[candidate.id],
                        )
                      : undefined
                  }
                />
              ))
          )}
          {!!savedIds.length && (
            <div className={styles.clearSaved}>
              {confirming ? (
                <>
                  <p>
                    保存した候補をすべて外しますか？
                    診断回答・比較の選択は残ります。
                  </p>
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => {
                      setMessage(clearSaved().message);
                      setConfirming(false);
                    }}
                  >
                    すべて外す
                  </button>
                  <button
                    className="quiet-link"
                    type="button"
                    onClick={() => setConfirming(false)}
                  >
                    キャンセル
                  </button>
                </>
              ) : (
                <button
                  className="quiet-link"
                  type="button"
                  onClick={() => setConfirming(true)}
                >
                  保存した候補をすべて外す
                </button>
              )}
            </div>
          )}
          <p role="status">{message}</p>
        </>
      )}
      <div className="closing-note">
        <Link className="inline-link" href="/privacy#data-controls">
          保存と削除について →
        </Link>
      </div>
    </main>
  );
}
