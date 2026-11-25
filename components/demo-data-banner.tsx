import { DEMO_DATA_BANNER_TEXT, isDemoData } from "../lib/candidates2026.ts";
import styles from "./demo-data-banner.module.css";

/**
 * 架空データ（候補者A〜D）をビルドに含めて公開しているあいだ、全ページ上部に出す告知。
 * データ由来（generatedDataSource）に連動して自動表示されるため、
 * `npm run data:import` で実データに戻せば消える。
 */
export function DemoDataBanner() {
  if (!isDemoData) return null;
  return (
    <p className={styles.banner} role="note">
      <span className={styles.label}>デモ表示中</span>
      {DEMO_DATA_BANNER_TEXT}
    </p>
  );
}
