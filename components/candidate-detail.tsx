"use client";
import Link from "next/link";
import {
  backgroundItems,
  candidateAnswerStateLabel,
  correctionsFor,
  getBackgroundAnswer,
  getCandidatePolicyAnswer,
  videosFor,
  youtubeVideoId,
  type Candidate2026,
} from "../lib/candidates2026.ts";
import {
  districtLabels,
  questionPath,
  questionTagLabel,
  questionsForDistrict,
  scaleLabels,
} from "../lib/election2026.ts";
import { CandidatePhoto } from "./candidate-photo";
import { CandidateSaveButton } from "./candidate-actions";
import { ScaleSevenDots } from "./scale-seven";
import { YouTubeEmbed } from "./youtube-embed";
import styles from "./candidates2026.module.css";

function videoTypeLabel(videoType: string): string {
  if (videoType === "main" || videoType === "本編") return "本編";
  if (videoType === "flash" || videoType.includes("フラッシュ"))
    return "1分間フラッシュ";
  if (videoType === "clip" || videoType.includes("切り抜き")) return "切り抜き";
  return videoType;
}

const officialLinkLabels = [
  ["official", "公式サイト"],
  ["x", "X"],
  ["instagram", "Instagram"],
  ["youtube", "YouTube"],
  ["facebook", "Facebook"],
] as const;

/** 候補者ページ（P3-2）。全員同じ構成・同じ並び順。 */
export function CandidateDetail({ candidate }: { candidate: Candidate2026 }) {
  const questions = questionsForDistrict(candidate.district);
  const videos = videosFor(candidate.id);
  const mainVideo = videos.find((video) => videoTypeLabel(video.videoType) === "本編");
  const otherVideos = videos.filter((video) => video !== mainVideo);
  const corrections = correctionsFor(candidate.id);
  const officialLinks: { key: string; label: string; href: string }[] = [];
  for (const [key, label] of officialLinkLabels) {
    const href = candidate.urls[key];
    if (href) officialLinks.push({ key, label, href });
  }
  return (
    <main id="main" className="container detail-page">
      <Link href="/candidates" className="quiet-link">
        ← 候補者一覧
      </Link>
      <section className={styles.detailHero} aria-label="候補者の基本情報">
        <span
          className={styles.filingBadge}
          aria-label={`届出番号${candidate.filingOrder}`}
        >
          {candidate.filingOrder}
        </span>
        <CandidatePhoto candidate={candidate} size={140} />
        <div className={styles.detailHeroBody}>
          <p className={styles.kana}>{candidate.nameKana || " "}</p>
          <h1 className={styles.detailName}>{candidate.name}</h1>
          <p className={styles.cardMeta}>
            <span>
              {candidate.age !== null
                ? `${candidate.age}歳（投票日時点）`
                : "年齢：確認中"}
            </span>
            <span>{candidate.partyLabel || "党派：確認中"}</span>
            <span>{candidate.incumbency}</span>
            <span>{districtLabels[candidate.district]}</span>
          </p>
          <span className={styles.statusLabel}>
            {candidate.participationStatus}
          </span>
          <div className={styles.cardButtons}>
            <CandidateSaveButton candidate={candidate} />
          </div>
        </div>
      </section>

      <section className="detail-section" id="policy">
        <p className="eyebrow">P / 政策への回答（8問）</p>
        <h2>政策の回答</h2>
        <p>
          候補者に送った質問の原文と、本人の回答（7段階の位置と理由の全文）をそのまま掲載しています。
        </p>
        {questions.map((question) => {
          const answer = getCandidatePolicyAnswer(candidate.id, question.id);
          return (
            <article
              key={question.id}
              id={`policy-${question.id}`}
              className={styles.policyItem}
            >
              <p className="eyebrow">{questionTagLabel(question)}</p>
              <h3 className={styles.policyQuestionText}>{question.text}</h3>
              {answer && answer.value !== null ? (
                <>
                  <div className={styles.policyPosition}>
                    <ScaleSevenDots
                      value={answer.value}
                      candidateName={candidate.name}
                      size="large"
                    />
                    <span className={styles.policyPositionLabel}>
                      {scaleLabels[answer.value]}（{answer.value}）
                    </span>
                  </div>
                  {answer.reason && (
                    <p className={styles.reasonFull}>{answer.reason}</p>
                  )}
                </>
              ) : (
                <p className={styles.policyNonAnswer}>
                  {candidateAnswerStateLabel(answer)}
                </p>
              )}
              <Link
                href={questionPath(question)}
                className={styles.compareLink}
              >
                この質問でほかの候補者と比べる →
              </Link>
            </article>
          );
        })}
      </section>

      <section className="detail-section" id="background">
        <p className="eyebrow">H / 経験と判断の背景</p>
        <h2>経験と判断の背景・最優先にすること</h2>
        {backgroundItems.map((item) => {
          const answer = getBackgroundAnswer(candidate.id, item.id);
          const oral = answer?.answerType.includes("口頭");
          return (
            <article
              key={item.id}
              id={`background-${item.id}`}
              className={styles.backgroundItem}
            >
              <h3>
                {item.id === "F01" ? "最優先にすること" : item.title}
                <span className="caption">（{item.id}）</span>
              </h3>
              {item.text && (
                <p className={styles.backgroundQuestion}>{item.text}</p>
              )}
              {answer && answer.text ? (
                <p className={styles.reasonFull}>{answer.text}</p>
              ) : oral ? (
                <p className={styles.policyNonAnswer}>
                  口頭回答のため記入なし。インタビュー動画で話しています。
                </p>
              ) : (
                <p className={styles.policyNonAnswer}>未回答</p>
              )}
            </article>
          );
        })}
      </section>

      <section className="detail-section" id="video">
        <p className="eyebrow">インタビュー動画</p>
        <h2>オシセン！トーク</h2>
        {mainVideo ? (
          <YouTubeEmbed
            videoId={youtubeVideoId(mainVideo.youtubeUrl)!}
            title={mainVideo.title || `${candidate.name}（本編）`}
            chapters={mainVideo.chapters}
          />
        ) : (
          <p className={styles.policyNonAnswer}>
            この候補者の動画は公開準備中です。公開済みの動画は
            <Link href="/talk" className="inline-link">
              インタビュー動画の一覧
            </Link>
            で確認できます。
          </p>
        )}
        {otherVideos.length > 0 && (
          <div className={styles.officialLinks}>
            {otherVideos.map((video) => (
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
          </div>
        )}
      </section>

      <section className="detail-section" id="official">
        <h2>本人の公式情報</h2>
        {officialLinks.length ? (
          <div className={styles.officialLinks}>
            {officialLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        ) : (
          <p className={styles.policyNonAnswer}>
            確認済みの公式リンクはまだありません。
          </p>
        )}
      </section>

      {corrections.length > 0 && (
        <section className="detail-section" id="corrections">
          <h2>訂正・本人追記の履歴</h2>
          <p>元の回答は消さずに残し、変更の内容と日付をここに記録します。</p>
          <ul className={styles.corrections}>
            {corrections.map((correction, index) => (
              <li key={`${correction.date}-${index}`}>
                <strong>{correction.date}</strong>（{correction.type}／
                {correction.target}）：{correction.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className={styles.updatedNote}>
        最終更新：{candidate.updatedAt || "—"}。
        本人の回答をそのまま掲載しています。要約や評価は加えていません。
      </p>
    </main>
  );
}
