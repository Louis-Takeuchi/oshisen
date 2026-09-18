"use client";

import Link from "next/link";
import {
  informationKindLabels,
  interviewFieldLabels,
  interviewGuide,
  interviewSegmentUrl,
  type InterviewFieldKey,
  type PublicInterviewBlock,
} from "../lib/interviews";
import type { StudyAction } from "../lib/research-study";
import styles from "./research-workbench.module.css";

function timeLabel(value: number) {
  return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
}
export function SourceBlock({
  block,
  record,
}: {
  block: PublicInterviewBlock;
  record?: (action: StudyAction, id: string) => void;
}) {
  return (
    <article className={styles.block}>
      <p className={styles.kicker}>
        {block.questionId} / {block.subjectLabel}
      </p>
      <h4>
        {interviewGuide.find((item) => item.id === block.questionId)?.title}
      </h4>
      {block.availability === "not_mentioned" && (
        <p className={styles.note}>
          今回の回答では言及なし。経験がないという意味ではありません。
        </p>
      )}
      <dl className={styles.fields}>
        {(
          Object.entries(interviewFieldLabels) as [InterviewFieldKey, string][]
        ).map(([key, label]) => {
          const field = block.fields[key];
          return (
            <div key={key}>
              <dt>{label}</dt>
              <dd>
                {field.status === "stated"
                  ? field.text
                  : "今回の回答では言及なし"}
                {field.status === "stated" && (
                  <small>
                    編集部要約 · 根拠：{field.segmentIds.join("、")}
                  </small>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
      <details
        onToggle={(event) => {
          if (event.currentTarget.open) record?.("context_open", block.id);
        }}
      >
        <summary>本人の言葉と前後の文脈を読む</summary>
        {block.segments.map((segment) => (
          <section className={styles.segment} key={segment.id}>
            <p className={styles.kicker}>
              {segment.id} · {informationKindLabels[segment.informationKind]}
            </p>
            {segment.contextBefore && <p>{segment.contextBefore}</p>}
            <blockquote>{segment.quote}</blockquote>
            {segment.contextAfter && <p>{segment.contextAfter}</p>}
            <p>
              原音 {timeLabel(segment.startSeconds)}〜
              {timeLabel(segment.endSeconds)}
            </p>
            <div className={styles.links}>
              {interviewSegmentUrl(segment) && (
                <a
                  href={interviewSegmentUrl(segment)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    record?.("source_open", `${block.id}:${segment.id}:audio`)
                  }
                >
                  原音の該当箇所を開く ↗
                </a>
              )}
              <a
                href={segment.fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  record?.(
                    "full_source_open",
                    `${block.id}:${segment.id}:audio`,
                  )
                }
              >
                原音の全編を開く ↗
              </a>
              <a
                href={segment.transcriptUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  record?.(
                    "source_open",
                    `${block.id}:${segment.id}:transcript`,
                  )
                }
              >
                文字起こしを開く ↗
              </a>
            </div>
          </section>
        ))}
      </details>
      <p className={styles.meta}>
        収録 {block.recordedOn} · 回答 {block.answeredOn} · 公開版{" "}
        {block.version}
      </p>
      <p className={styles.meta}>
        原音照合・別担当者の文脈確認・本人の趣旨確認・公開承認の記録あり。出来事全体の独立した事実確認を意味しません。
      </p>
      {block.relatedPolicyQuestionIds.length > 0 && (
        <div className={styles.links}>
          {block.relatedPolicyQuestionIds.map((id) => (
            <Link
              key={id}
              href={`/policy-register#${encodeURIComponent(id)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => record?.("policy_open", `${block.id}:${id}`)}
            >
              関連する政策設問 {id} →
            </Link>
          ))}
        </div>
      )}
      {block.corrections.length > 0 && (
        <details>
          <summary>訂正・追記の履歴</summary>
          <ul>
            {block.corrections.map((correction, index) => (
              <li key={`${correction.version}-${index}`}>
                {correction.correctedOn} · {correction.version} ·{" "}
                {correction.reason}
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}
