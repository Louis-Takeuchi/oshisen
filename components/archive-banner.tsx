"use client";
import { usePathname } from "next/navigation";
import { ARCHIVE_BANNER_TEXT, showsArchiveBanner } from "../lib/site-phase.ts";
import styles from "./archive-banner.module.css";

/** 12/14以降、候補者情報・動画・回答のページ上部に出すアーカイブ表示（lib/site-phase.ts で切り替え）。 */
export function ArchiveBanner() {
  const pathname = usePathname();
  if (!pathname || !showsArchiveBanner(pathname)) return null;
  return (
    <p className={styles.banner} role="note">
      {ARCHIVE_BANNER_TEXT}
    </p>
  );
}
