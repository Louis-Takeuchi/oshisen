"use client";
import Link from "next/link";
import { KikumaruLoading } from "./kikumaru";
import { useState } from "react";
import { candidates2026 } from "../lib/candidates2026.ts";
import { useConsideration } from "./use-consideration";
import { CandidateRow } from "./candidate-row";
import styles from "./consideration.module.css";

/** 気になる候補（P3-4）。候補者IDでこのブラウザ内だけに保存し、届出順で表示する。 */
export function SavedCandidates() {
  const { savedIds, ready, storageAvailable, clearSaved } = useConsideration();
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const saved = candidates2026.filter((candidate) =>
    savedIds.includes(candidate.id),
  );
  return (
    <main id="main" className="container page-main">
      <p className="eyebrow">気になった人を、もう少し考える。</p>
      <h1>気になる候補</h1>
      <p className="lead">
        あとで情報を読み返せるよう、気になる候補をこのブラウザに保存できます。
        <br />
        保存した候補者は、選挙区ごとの届出順で表示します。
      </p>
      <div className="notice">
        <span className="outline-label">このブラウザ内だけ</span>
        <p>
          ログイン不要です。保存先をこのブラウザに限定し、端末間の同期やサーバー送信の対象から除外しています。タブを閉じても残るため、共有端末では使い終わったら削除してください。
        </p>
      </div>
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
              2人の回答を比べる →
            </Link>
          </div>
          {!saved.length ? (
            <div className="empty-notice">
              <h2>保存した候補者：0人</h2>
              <p>
                候補者カードの「気になる」から保存できます。候補者情報は12月4日（告示日）以降、届出順に掲載します。
              </p>
              <Link className="button primary" href="/candidates">
                候補者を見る →
              </Link>
              <Link className="text-link" href="/issues">
                質問から探す →
              </Link>
            </div>
          ) : (
            saved.map((candidate) => (
              <CandidateRow
                key={candidate.id}
                candidate={candidate}
                showDistrict
              />
            ))
          )}
          {!!savedIds.length && (
            <div className={styles.clearSaved}>
              {confirming ? (
                <>
                  <p>
                    保存した候補をすべて外しますか？
                    質問への回答は残ります。
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
