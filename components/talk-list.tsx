"use client";
import Link from "next/link";
import { useState } from "react";
import {
  candidatesInDistrict,
  mainVideoFor,
  videosFor,
  youtubeVideoId,
} from "../lib/candidates2026.ts";
import {
  districtLabels,
  districts,
  type District,
} from "../lib/election2026.ts";
import { useSavedDistrictDefault } from "./question-session";
import { YouTubeEmbed } from "./youtube-embed";
import styles from "./candidates2026.module.css";

function videoTypeLabel(videoType: string): string {
  if (videoType === "flash" || videoType.includes("フラッシュ"))
    return "1分間フラッシュ";
  if (videoType === "clip" || videoType.includes("切り抜き")) return "切り抜き";
  if (videoType === "main" || videoType === "本編") return "本編";
  return videoType;
}

/**
 * 告示後のインタビュー動画一覧（P3-5）。選挙区の切り替え＋届出順のカード。
 * 動画がまだない候補者のカードも出し、「公開準備中」と表示する（届出順の位置を空けない）。
 */
export function TalkList() {
  const defaultDistrict = useSavedDistrictDefault();
  const [selected, setSelected] = useState<District | null>(null);
  const district = selected ?? defaultDistrict;
  const setDistrict = setSelected;
  const list = candidatesInDistrict(district);
  return (
    <section aria-label="候補者ごとのインタビュー動画">
      <div
        className={styles.districtTabs}
        role="group"
        aria-label="選挙区の切り替え"
      >
        {districts.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={district === value}
            className={district === value ? styles.activeTab : undefined}
            onClick={() => setDistrict(value)}
          >
            {districtLabels[value]}
          </button>
        ))}
      </div>
      <p className={styles.orderNote}>
        選挙区ごとの立候補届出順に表示しています。
      </p>
      {list.length === 0 ? (
        <div className="empty-notice">
          <p>この選挙区の候補者情報は、確認でき次第掲載します。</p>
        </div>
      ) : (
        list.map((candidate) => {
          const main = mainVideoFor(candidate.id);
          const links = videosFor(candidate.id).filter(
            (video) => video !== main,
          );
          const mainId = main ? youtubeVideoId(main.youtubeUrl) : null;
          return (
            <article
              key={candidate.id}
              id={candidate.id}
              className={styles.card}
              aria-label={`${candidate.name}のインタビュー動画`}
            >
              <div className={styles.cardHead}>
                <span
                  className={styles.filingBadge}
                  aria-label={`届出番号${candidate.filingOrder}`}
                >
                  {candidate.filingOrder}
                </span>
                <div className={styles.cardBody}>
                  <p className={styles.kana}>
                    {candidate.nameKana || " "}
                  </p>
                  <h2 className={styles.cardName}>{candidate.name}</h2>
                </div>
              </div>
              {main && mainId ? (
                <div style={{ marginTop: 16 }}>
                  <YouTubeEmbed
                    videoId={mainId}
                    title={main.title || `${candidate.name}（本編）`}
                    chapters={main.chapters}
                  />
                </div>
              ) : (
                <p className={styles.policyNonAnswer}>公開準備中</p>
              )}
              <div className={styles.cardButtons}>
                {links.map((video) => (
                  <a
                    key={video.youtubeUrl}
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {videoTypeLabel(video.videoType)}
                    {video.title ? `：${video.title}` : ""} ↗
                  </a>
                ))}
                <Link
                  href={`/candidates/${candidate.id}`}
                  className={styles.primaryAction}
                >
                  回答を見る →
                </Link>
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}
