"use client";
import { useState } from "react";
import styles from "./youtube-embed.module.css";

function chapterSeconds(time: string): number {
  const parts = time.split(":").map((part) => Number.parseInt(part, 10));
  if (parts.some((part) => Number.isNaN(part))) return 0;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

/**
 * YouTube動画の埋め込み（youtube-nocookie.com）。
 * 表示を軽くし外部への送信を減らすため、最初はサムネイル画像だけを出して、
 * タップしたら読み込む。章リンクはタップでその時刻から再生する。
 */
export function YouTubeEmbed({
  videoId,
  title,
  chapters = [],
}: {
  videoId: string;
  title: string;
  chapters?: readonly { readonly time: string; readonly label: string }[];
}) {
  const [startAt, setStartAt] = useState<number | null>(null);
  const playing = startAt !== null;
  return (
    <div className={styles.embed}>
      {playing ? (
        <iframe
          className={styles.frame}
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0${
            startAt ? `&start=${startAt}` : ""
          }`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="origin"
        />
      ) : (
        <button
          type="button"
          className={styles.poster}
          onClick={() => setStartAt(0)}
          aria-label={`動画を再生：${title}`}
        >
          {/* 再生までYouTubeを読み込まない。サムネイルのみ取得する。 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            width={480}
            height={360}
          />
          <span className={styles.playBadge} aria-hidden="true">
            ▶ タップして再生
          </span>
        </button>
      )}
      {chapters.length > 0 && (
        <div className={styles.chapters}>
          <p className={styles.chaptersLabel}>章から見る（タップでその時刻から再生）</p>
          <ul>
            {chapters.map((chapter) => (
              <li key={`${chapter.time}-${chapter.label}`}>
                <button
                  type="button"
                  onClick={() => setStartAt(chapterSeconds(chapter.time))}
                >
                  <span className={styles.chapterTime}>{chapter.time}</span>
                  {chapter.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
