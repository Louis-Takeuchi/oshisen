"use client";
import Link from "next/link";
import {
  type Candidate2026,
  mainVideoFor,
} from "../lib/candidates2026.ts";
import { districtLabels } from "../lib/election2026.ts";
import { CandidatePhoto } from "./candidate-photo";
import { CandidateSaveButton } from "./candidate-actions";
import styles from "./candidates2026.module.css";

/**
 * 候補者カード（P3-1）。届出番号・写真（正方形）・氏名・ふりがな・年齢・党派・現新元・掲載状況。
 * 全候補者で同じ枠・同じ写真サイズ。
 */
export function CandidateRow({
  candidate,
  showDistrict = false,
}: {
  candidate: Candidate2026;
  showDistrict?: boolean;
}) {
  const hasVideo = Boolean(mainVideoFor(candidate.id));
  return (
    <article className={styles.card} aria-label={candidate.name}>
      <div className={styles.cardHead}>
        <span
          className={styles.filingBadge}
          aria-label={`届出番号${candidate.filingOrder}`}
        >
          {candidate.filingOrder}
        </span>
        <CandidatePhoto candidate={candidate} size={104} />
        <div className={styles.cardBody}>
          <p className={styles.kana}>{candidate.nameKana || " "}</p>
          <h2 className={styles.cardName}>
            <Link href={`/candidates/${candidate.id}`}>{candidate.name}</Link>
          </h2>
          <p className={styles.cardMeta}>
            {showDistrict && <span>{districtLabels[candidate.district]}</span>}
            <span>
              {candidate.age !== null
                ? `${candidate.age}歳（投票日時点）`
                : "年齢：確認中"}
            </span>
            <span>{candidate.partyLabel || "党派：確認中"}</span>
            <span>{candidate.incumbency || ""}</span>
          </p>
          <span
            className={`${styles.statusLabel} ${
              candidate.participationStatus === "公開済み"
                ? styles.statusPublished
                : ""
            }`}
          >
            {candidate.participationStatus}
          </span>
        </div>
      </div>
      <div className={styles.cardButtons}>
        <Link
          href={`/candidates/${candidate.id}`}
          className={styles.primaryAction}
        >
          回答を見る →
        </Link>
        <Link href={`/talk#${candidate.id}`}>
          動画を見る{hasVideo ? "" : "（公開準備中）"} →
        </Link>
        <CandidateSaveButton candidate={candidate} />
      </div>
    </article>
  );
}
