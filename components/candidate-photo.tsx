import Image from "next/image";
import type { Candidate2026 } from "../lib/candidates2026.ts";
import styles from "./candidates2026.module.css";

/** 全員同じサイズの正方形。写真が未提供の候補者は同じ枠で「準備中」を表示する。 */
export function CandidatePhoto({
  candidate,
  size = 120,
}: {
  candidate: Candidate2026;
  size?: number;
}) {
  if (!candidate.photoFilename)
    return (
      <span
        className={styles.photoPlaceholder}
        style={{ width: size, height: size }}
        role="img"
        aria-label={`${candidate.name}：候補者写真は準備中`}
      >
        写真は
        <br />
        準備中
      </span>
    );
  return (
    <Image
      src={`/candidates/${candidate.photoFilename}`}
      alt={`${candidate.name}の写真`}
      width={size}
      height={size}
      className={styles.photo}
      unoptimized
    />
  );
}
