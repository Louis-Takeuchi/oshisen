"use client";
import { useState } from "react";
import type { Candidate2026 } from "../lib/candidates2026.ts";
import { trackEvent } from "../lib/analytics";
import { useConsideration } from "./use-consideration";
import styles from "./candidates2026.module.css";
import considerationStyles from "./consideration.module.css";

/** 「気になる」ボタン（/saved に保存。保存先はこのブラウザ内だけ）。 */
export function CandidateSaveButton({
  candidate,
}: {
  candidate: Candidate2026;
}) {
  const { ready, savedIds, toggleSaved } = useConsideration();
  const [message, setMessage] = useState("");
  const saved = savedIds.includes(candidate.id);
  return (
    <>
      <button
        type="button"
        aria-pressed={saved}
        disabled={!ready}
        className={saved ? styles.savedActive : undefined}
        aria-label={`${candidate.name}を${saved ? "気になる候補から外す" : "気になる候補に保存"}`}
        onClick={() => {
          const result = toggleSaved(candidate.id);
          setMessage(result.message);
          if (result.ok)
            trackEvent(saved ? "candidate_unsave" : "candidate_save", {
              candidateId: candidate.id,
            });
        }}
      >
        {saved ? "✓ 気になる" : "＋ 気になる"}
      </button>
      {message && (
        <span
          className={considerationStyles.actionMessage}
          role="status"
        >
          {message}
        </span>
      )}
    </>
  );
}
