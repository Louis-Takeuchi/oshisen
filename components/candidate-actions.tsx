"use client";
import { useState } from "react";
import type { Candidate } from "../lib/data";
import { trackEvent } from "../lib/analytics";
import { useConsideration } from "./use-consideration";
import styles from "./consideration.module.css";

export function CandidateActions({ candidate }: { candidate: Candidate }) {
  const { ready, savedIds, compareIds, toggleSaved, toggleCompare } =
    useConsideration();
  const [message, setMessage] = useState("");
  const saved = savedIds.includes(candidate.id);
  const comparing = compareIds.includes(candidate.id);
  return (
    <div className={styles.actions}>
      <div className={styles.actionButtons}>
        <button
          type="button"
          aria-pressed={saved}
          disabled={!ready}
          aria-label={`${candidate.name}を${saved ? "気になる候補から外す" : "気になる候補に追加"}`}
          onClick={() => {
            const result = toggleSaved(candidate.id);
            setMessage(result.message);
            if (result.ok)
              trackEvent(saved ? "candidate_unsave" : "candidate_save", {
                candidateId: candidate.id,
              });
          }}
        >
          {saved ? "✓ 気になる候補に保存済み" : "＋ 気になる候補に追加"}
        </button>
        <button
          type="button"
          aria-pressed={comparing}
          disabled={!ready}
          aria-label={`${candidate.name}を${comparing ? "比較から外す" : "比較に追加"}`}
          onClick={() => {
            const result = toggleCompare(candidate.id);
            setMessage(result.message);
          }}
        >
          {comparing ? "✓ 比較する候補" : "＋ 比較に追加"}
        </button>
      </div>
      <p className={styles.saveNote}>
        保存はこのブラウザ内のみ・支持の表明ではありません。
      </p>
      <p className={styles.actionMessage} role="status">
        {message}
      </p>
    </div>
  );
}
