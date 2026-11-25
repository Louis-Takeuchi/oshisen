"use client";
import Link from "next/link";
import { useState } from "react";
import {
  candidatesInDistrict,
  hasPublishedCandidates,
} from "../lib/candidates2026.ts";
import {
  districtLabels,
  districts,
  type District,
} from "../lib/election2026.ts";
import { project, projectDistrictLabel } from "../lib/project";
import { KikumaruNote } from "./kikumaru";
import { CandidateRow } from "./candidate-row";
import { useSavedDistrictDefault } from "./question-session";
import styles from "./candidates2026.module.css";

/**
 * 候補者一覧（P3-1）。選挙区の切り替え＋届出順のカード。
 * 最初に開く選挙区は、利用者が質問で選んだ選挙区（未選択ならつくば市）。
 */
export function CandidateList() {
  const defaultDistrict = useSavedDistrictDefault();
  const [selected, setSelected] = useState<District | null>(null);
  const district = selected ?? defaultDistrict;
  const setDistrict = setSelected;
  const list = candidatesInDistrict(district);
  return (
    <main id="main" className="container page-main">
      <p className="eyebrow">まずは、一人ひとりを知る。</p>
      <h1>候補者一覧</h1>
      <p className="lead">
        {project.electionYear}年 {project.electionName} / {projectDistrictLabel}
      </p>
      {!hasPublishedCandidates ? (
        <div className="empty-notice">
          <KikumaruNote panel>
            <div>
              <span className="outline-label">12月4日から掲載</span>
              <h2>候補者情報の掲載準備</h2>
              <p>
                候補者の情報と回答は、12月4日（告示日）の立候補届出の確認後、立候補届出順に一斉公開します。今は、候補者と同じ政策の質問を試せます。
              </p>
            </div>
          </KikumaruNote>
        </div>
      ) : (
        <>
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
            選挙区ごとの立候補届出順に表示しています。届出をした候補者は、オシセンへの回答がない方も全員掲載します。
          </p>
          {list.length ? (
            list.map((candidate) => (
              <CandidateRow key={candidate.id} candidate={candidate} />
            ))
          ) : (
            <div className="empty-notice">
              <p>この選挙区の候補者情報は、確認でき次第掲載します。</p>
            </div>
          )}
        </>
      )}
      <div className="exploration-links">
        <Link href="/diagnosis">政策の質問に答える →</Link>
        <Link href="/talk">インタビュー動画を見る →</Link>
        <Link href="/saved">気になる候補を見る →</Link>
      </div>
    </main>
  );
}
