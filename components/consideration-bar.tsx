"use client";
import Link from "next/link";
import { useState } from "react";
import { candidates } from "../lib/data";
import { useConsideration } from "./use-consideration";
import styles from "./consideration.module.css";

export function ConsiderationBar() {
  const { ready, compareIds, toggleCompare, clearCompare } = useConsideration();
  const [message, setMessage] = useState("");
  if (!ready || (compareIds.length === 0 && !message)) return null;
  return (
    <aside className={styles.compareBar} aria-label="比較する候補者">
      <div className="container">
        <div className={styles.barSelection}>
          <span>
            比較する候補 <strong>{compareIds.length} / 2人</strong>
          </span>
          <div className={styles.selectedNames}>
            {candidates
              .filter((candidate) => compareIds.includes(candidate.id))
              .map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => {
                    const result = toggleCompare(candidate.id);
                    setMessage(
                      result.persisted === false ? result.message : "",
                    );
                  }}
                  aria-label={`${candidate.name}を比較から外す`}
                >
                  {candidate.name}
                  <span aria-hidden="true"> ×</span>
                </button>
              ))}
          </div>
          {message && (
            <p role="status">
              {message}{" "}
              <button type="button" onClick={() => setMessage("")}>
                閉じる
              </button>
            </p>
          )}
        </div>
        <div className={styles.barLinks}>
          <Link className="button primary small" href="/compare">
            {compareIds.length === 2 ? "2人を比較する →" : "もう1人を選ぶ →"}
          </Link>
          <button
            className="quiet-link"
            type="button"
            onClick={() => {
              const result = clearCompare();
              setMessage(result.ok ? "" : result.message);
            }}
          >
            選択をクリア
          </button>
        </div>
      </div>
    </aside>
  );
}
