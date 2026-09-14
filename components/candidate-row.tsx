import Link from "next/link";
import { type Candidate } from "../lib/data";
import type { calculateMatch } from "../lib/matching";
export function Portrait({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) {
  return (
    <div
      className={`portrait-placeholder ${large ? "large" : ""}`}
      role="img"
      aria-label={`${name}：候補者写真は未掲載`}
    >
      <span>
        写真は
        <br />
        未掲載
      </span>
      <small>仮名・デモ</small>
    </div>
  );
}
export function CandidateRow({
  candidate,
  match,
}: {
  candidate: Candidate;
  match?: ReturnType<typeof calculateMatch>;
}) {
  return (
    <article className="candidate-row">
      <Portrait name={candidate.name} />
      <div className="candidate-summary">
        <p className="caption">候補者サンプル / 仮名</p>
        <h2>
          <Link href={`/candidates/${candidate.id}`}>{candidate.name}</Link>
        </h2>
        <p className="candidate-meta">所属・年齢・現新別：未登録</p>
        {match && match.score !== null && (
          <div className="theme-tags" aria-label="近かったテーマ">
            {match.closeThemes.length ? (
              match.closeThemes
                .slice(0, 3)
                .map((theme) => <span key={theme}>{theme}</span>)
            ) : (
              <span className="plain-tag">近かったテーマなし</span>
            )}
          </div>
        )}
      </div>
      <div className="candidate-row-end">
        {match && (
          <div className="match-display">
            <span>
              政策一致度 <small>デモ</small>
            </span>
            <strong>
              {match.score === null ? "—" : match.score}
              <em>{match.score !== null ? "%" : ""}</em>
            </strong>
            <small>{match.comparedCount}問を比較した参考値</small>
          </div>
        )}
        <Link className="text-link" href={`/candidates/${candidate.id}`}>
          この候補者を見る <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
