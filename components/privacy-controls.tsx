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
export function PrivacyControls() {
  const consent = useConsent();
  const [message, setMessage] = useState("");
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
        回答内容・一致度は記録しません。サーバーへの送信も行いません。
      </p>
      <div className="control-buttons">
        <button className="button secondary" onClick={download}>
          操作記録を書き出す
        </button>
        <button
          className="button secondary"
          onClick={() => {
            setAnalyticsConsent(false);
            eraseAnalytics();
            notifySettingsChange();
            clearDiagnosis();
            setMessage("このタブの回答と操作記録を削除しました。");
          }}
        >
          回答と操作記録を削除
        </button>
      </div>
      <p role="status">{message}</p>
    </div>
  );
}
