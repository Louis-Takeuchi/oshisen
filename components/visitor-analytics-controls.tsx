"use client";

import { useState } from "react";
import {
  getVisitorAnalyticsStatus,
  setVisitorAnalyticsEnabled,
} from "../lib/visitor-analytics";
import { useVisitorAnalyticsStatus } from "./use-visitor-analytics";

export function VisitorAnalyticsControls() {
  const status = useVisitorAnalyticsStatus();
  const [message, setMessage] = useState("");

  function toggle(enabled: boolean) {
    const saved = setVisitorAnalyticsEnabled(enabled);
    setMessage(
      !saved
        ? "設定を保存できませんでした。このページでは計測を停止しています。次回以降も停止するには、ブラウザの追跡拒否設定をご利用ください。"
        : enabled && getVisitorAnalyticsStatus() === "enabled"
          ? "訪問数の集計を有効にしました。本番サイトでの以後の訪問が対象です。"
          : "このブラウザからの訪問数の集計を停止しました。診断や候補者の保存は引き続き使えます。",
    );
  }

  return (
    <div className="privacy-controls">
      <label className="consent-label">
        <input
          type="checkbox"
          checked={status === "enabled"}
          disabled={status === "browser-disabled" || status === "unavailable"}
          onChange={(event) => toggle(event.target.checked)}
          aria-describedby="visitor-analytics-help"
        />
        <span>訪問数・ページ閲覧数の集計を有効にする</span>
      </label>
      <p className="caption" id="visitor-analytics-help">
        Vercelへの訪問計測です。初期設定は有効です。停止してもサイトの機能は変わりません。
        設定はこのブラウザの同じサイトに保存され、他のタブにも反映します。
      </p>
      {status === "browser-disabled" && (
        <p className="caption">
          ブラウザの追跡拒否設定（DNT / GPC）に従って、訪問計測を停止しています。
        </p>
      )}
      {status === "unavailable" && (
        <p className="caption">
          設定を確認できるまで計測しません。ブラウザの保存領域を利用できない場合も計測を停止します。
        </p>
      )}
      <p className="caption">
        下の回答・操作記録の削除では、この設定は維持します。
        ブラウザからサイトデータ自体を消した場合は初期設定に戻ります。
        停止前に集計済みのデータを、この画面から削除することはできません。
      </p>
      <p role="status">{message}</p>
    </div>
  );
}
