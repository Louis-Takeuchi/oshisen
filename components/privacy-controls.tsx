"use client";
import { useState } from "react";
import {
  eraseAnalytics,
  exportAnalytics,
  getAnalyticsConsent,
  setAnalyticsConsent,
} from "../lib/analytics";
import { clearDiagnosis } from "./session";
import { useConsent, notifySettingsChange } from "./use-local-settings";
import { useConsideration } from "./use-consideration";
export function PrivacyControls() {
  const consent = useConsent();
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const { clearAll } = useConsideration();
  function eraseAll() {
    const analyticsCleared = eraseAnalytics();
    notifySettingsChange();
    const diagnosisCleared = clearDiagnosis();
    const considerationCleared = clearAll();
    setConfirming(false);
    setMessage(
      analyticsCleared && diagnosisCleared && considerationCleared.ok
        ? "気になる候補・このタブの回答・比較・知りたいテーマ・操作記録を削除し、記録への同意も取り消しました。"
        : "画面内のデータを解除し操作記録を停止しましたが、保存領域の削除を確認できません。ブラウザのサイトデータ設定から削除してください。",
    );
  }
  function toggle(value: boolean) {
    setAnalyticsConsent(value);
    notifySettingsChange();
    setMessage(
      value && !getAnalyticsConsent()
        ? "このブラウザでは保存を有効にできませんでした。操作記録は停止したままです。"
        : value
          ? "このタブ内で、以後の操作記録を有効にしました。"
          : "操作記録を停止しました。",
    );
  }
  function download() {
    const blob = new Blob([exportAnalytics()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "oshisen-local-events.json";
    a.click();
    URL.revokeObjectURL(url);
    setMessage("このタブの操作記録を書き出しました。");
  }
  return (
    <div className="privacy-controls">
      <label className="consent-label">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => toggle(e.target.checked)}
        />
        <span>このタブ内の操作記録を有効にする（任意）</span>
      </label>
      <p className="caption">
        回答内容は操作記録に含めません。サーバーへの送信も行いません。
      </p>
      <div className="control-buttons">
        <button className="button secondary" onClick={download}>
          操作記録を書き出す
        </button>
        <button
          className="button secondary"
          onClick={() => setConfirming(true)}
        >
          回答・候補・操作記録を削除
        </button>
      </div>
      {confirming && (
        <div className="delete-confirmation">
          <p>
            気になる候補と、このタブの回答・比較・知りたいテーマ・操作記録を削除します。この操作は元に戻せません。
            訪問計測の設定は維持し、Vercelで集計済みのデータは削除しません。
          </p>
          <button type="button" className="button secondary" onClick={eraseAll}>
            削除する
          </button>
          <button
            type="button"
            className="quiet-link"
            onClick={() => setConfirming(false)}
          >
            キャンセル
          </button>
        </div>
      )}
      <p role="status">{message}</p>
    </div>
  );
}
