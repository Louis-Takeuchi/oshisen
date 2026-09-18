import Link from "next/link";
import { type Candidate } from "../lib/data";
import { CandidateActions } from "./candidate-actions";
import { PriorityThemeSummary } from "./priority-themes";
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
    </div>
  );
}
export function CandidateRow({ candidate }: { candidate: Candidate }) {
  return (
    <article className="candidate-row">
      <Portrait name={candidate.name} />
      <div className="candidate-summary">
        <p className="caption">{candidate.district ?? "選挙区は確認中"}</p>
        <h2>
          <Link href={`/candidates/${candidate.id}`}>{candidate.name}</Link>
        </h2>
        <p className="candidate-meta">{candidate.party ?? "所属は未掲載"}</p>
        <PriorityThemeSummary candidate={candidate} />
        <CandidateActions candidate={candidate} />
      </div>
      <div className="candidate-row-end">
        <Link className="text-link" href={`/candidates/${candidate.id}`}>
          この人を知る →
        </Link>
      </div>
    </article>
  );
}
