import { type Candidate, type Question } from "../lib/data";
import {
  comparePolicyAnswers,
  policyAnswerLabel,
  policyComparisonLabels,
  type PolicyAnswerRecord,
} from "../lib/policy";
import { isSafeResourceUrl } from "../lib/resources";
export function PolicyAnswerComparison({
  question,
  candidate,
  userRecord,
}: {
  question: Question;
  candidate: Candidate;
  userRecord?: PolicyAnswerRecord;
}) {
  const comparison = comparePolicyAnswers(
    question,
    userRecord,
    candidate.policyAnswers[question.id],
    candidate.id,
  );
  const stateLabel = (state: string, who: "あなた" | "候補者") => {
    if (state === "version-mismatch")
      return "質問・選択肢・補足の版が異なります";
    if (state === "invalid-answer") return "回答を確認できません";
    if (state === "pending") return "本人回答を確認中";
    if (state === "not-candidate-answer")
      return "今回の質問への本人回答ではありません";
    return who === "あなた" ? "未回答" : "本人回答は未掲載";
  };
  return (
    <div className="per-question-comparison">
      <dl>
        <div>
          <dt>あなた</dt>
          <dd>
            {comparison.userAnswer
              ? policyAnswerLabel(comparison.userAnswer)
              : stateLabel(comparison.userState, "あなた")}
          </dd>
        </div>
        <div>
          <dt>{candidate.name}</dt>
          <dd>
            {comparison.candidateAnswer
              ? policyAnswerLabel(comparison.candidateAnswer)
              : stateLabel(comparison.candidateState, "候補者")}
          </dd>
        </div>
      </dl>
      <p className="comparison-label">
        {policyComparisonLabels[comparison.status]}
      </p>
      {comparison.reason && (
        <p>
          <strong>本人の理由</strong>
          <br />
          {comparison.reason}
        </p>
      )}
      {comparison.conditions && (
        <p>
          <strong>条件・留保</strong>
          <br />
          {comparison.conditions}
        </p>
      )}
      {comparison.sources.length > 0 && (
        <ul>
          {comparison.sources.map((source) => (
            <li key={source.id}>
              {source.url && isSafeResourceUrl(source.url) ? (
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.label} ↗
                </a>
              ) : (
                source.label
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
