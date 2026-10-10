"use client";

import Link from "next/link";
import { orderedCandidates } from "../lib/candidate-order";
import { CandidateOrderNote } from "./candidate-order-note";
import { useState } from "react";
import { interviewGuide, type PublicInterviewBlock } from "../lib/interviews";
import { SourceBlock } from "./interview-source-block";
import styles from "./research-workbench.module.css";

/** The server page must pass only getPublicInterviewBlocks output. No registry import here. */
export function InterviewStories({
  blocks,
  subjectId,
  compact = false,
}: {
  blocks: readonly PublicInterviewBlock[];
  subjectId?: string;
  compact?: boolean;
}) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const candidateIds = orderedCandidates.map((candidate) => candidate.id);
  const subjectRank = (id: string) => {
    const index = candidateIds.indexOf(id);
    return index < 0 ? candidateIds.length : index;
  };
  const subjects = [
    ...new Map(
      blocks.map((block) => [block.subjectId, block.subjectLabel]),
    ).entries(),
  ].sort(
    (left, right) =>
      subjectRank(left[0]) - subjectRank(right[0]) ||
      left[1].localeCompare(right[1], "ja") ||
      left[0].localeCompare(right[0]),
  );
  const activeSubject = subjectId ?? selectedSubject;
  const visibleBlocks = blocks.filter(
    (block) => !activeSubject || block.subjectId === activeSubject,
  );
  return (
    <div className={styles.publicStories}>
      {blocks.length > 0 && !subjectId && (
        <label className={styles.subjectSelect}>
          誰の話を読む？
          <select
            value={selectedSubject}
            onChange={(event) => setSelectedSubject(event.target.value)}
          >
            <option value="">掲載されている全員</option>
            {subjects.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
      )}
      <nav className={styles.links} aria-label="本人の話の項目へ">
        {interviewGuide.map((question) => (
          <a key={question.id} href={`#${question.id}`}>
            {question.title} ↓
          </a>
        ))}
      </nav>
      <div className={styles.guide}>
        {interviewGuide.map((question) => {
          const items = visibleBlocks
            .filter((block) => block.questionId === question.id)
            .sort(
              (left, right) =>
                subjects.findIndex(([id]) => id === left.subjectId) -
                  subjects.findIndex(([id]) => id === right.subjectId) ||
                left.interviewOrder - right.interviewOrder ||
                left.id.localeCompare(right.id),
            );
          return (
            <section key={question.id} id={question.id}>
              <span className={styles.guideNumber}>{question.id}</span>
              <div>
                {compact ? (
                  <h3>{question.title}</h3>
                ) : (
                  <h2>{question.title}</h2>
                )}
                <p>{question.question}</p>
                {items.length > 0 ? (
                  <div className={styles.interview}>
                    {items.map((block) => (
                      <SourceBlock key={block.id} block={block} />
                    ))}
                  </div>
                ) : (
                  <p className={styles.note}>
                    {blocks.length === 0 && !subjectId
                      ? "取材前・回答未掲載"
                      : "この項目の承認済みの回答はまだ掲載していません。"}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
      {subjectId && (
        <Link href="/stories" className="text-link">
          ほかの人の話も見る →
        </Link>
      )}
      {blocks.length > 0 && !subjectId && (
        <>
          {subjects.some(([id]) => candidateIds.includes(id)) && (
            <CandidateOrderNote ids={subjects.map(([id]) => id)} />
          )}
          {subjects.some(([id]) => !candidateIds.includes(id)) && (
            <p className={styles.note}>
              候補者一覧に未登録の話者は、候補者の後に氏名の文字順で表示しています。
            </p>
          )}
        </>
      )}
      {blocks.length > 0 && (
        <p className={styles.note}>
          経験の有無と掲載状況が混同されないよう、回答を確認できた項目と、まだ掲載に至っていない項目を区別しています。
        </p>
      )}
    </div>
  );
}
