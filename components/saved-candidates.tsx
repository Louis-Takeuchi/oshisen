"use client";
import Link from "next/link";
import { CandidateOrderNote } from "./candidate-order-note";
import { KikumaruLoading } from "./kikumaru";
import { useState } from "react";
import { orderedCandidates as candidates } from "../lib/candidate-order";
import { useConsideration } from "./use-consideration";
import { CandidateRow } from "./candidate-row";
import styles from "./consideration.module.css";

export function SavedCandidates() {
  const { savedIds, ready, storageAvailable, clearSaved } = useConsideration();
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <main id="main" className="container page-main">
      <p className="eyebrow">気になった人を、もう少し考える。</p>
      <h1>気になる候補</h1>
      <p className="lead">
        あとで情報を読み返せるよう、気になる候補をこのブラウザに保存できます。
        <br />
        あとで見返したい人を、ここに。
      </p>
      <div className="notice">
        <span className="outline-label">このブラウザ内だけ</span>
        <p>
          ログイン不要です。保存先をこのブラウザに限定し、端末間の同期やサーバー送信の対象から除外しています。タブを閉じても残るため、共有端末では使い終わったら削除してください。
        </p>
      </div>
      <CandidateOrderNote ids={savedIds} />
      {storageAvailable === false && (
        <p role="status" className="empty-notice">
          ブラウザに保存できていません。現在の画面内だけで保持しています。
        </p>
      )}
      {!ready ? (
        <KikumaruLoading message="保存した候補を確認しています。" />
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
              <h2>保存した候補者：0人</h2>
              <p>候補者の「気になる候補に追加」から保存できます。</p>
              <Link className="button primary" href="/candidates">
                候補者を見る →
              </Link>
              <Link className="text-link" href="/issues">
                争点から探す →
              </Link>
            </div>
          ) : (
            [...candidates]
              .filter((candidate) => savedIds.includes(candidate.id))
              .map((candidate) => (
                <CandidateRow key={candidate.id} candidate={candidate} />
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
