import type { CandidateId, QuestionId } from "../lib/data";
import {
  formatVideoTimestamp,
  getPolicyEvidence,
  getVerifiedPolicyVideoUrl,
} from "../lib/policy-evidence";
import { ExternalResourceLink } from "./external-resource-link";
import styles from "./policy-evidence.module.css";

const provenanceLabels = {
  candidate_answer: "候補者本人の回答",
  public_document: "公開資料の原文",
  editorial_summary: "編集部による要約",
} as const;

export interface PolicyEvidenceProps {
  readonly candidateId: CandidateId;
  readonly questionId: QuestionId;
}

export function PolicyEvidence({
  candidateId,
  questionId,
}: PolicyEvidenceProps) {
  const evidence = getPolicyEvidence(candidateId, questionId);
  const videoUrl = evidence ? getVerifiedPolicyVideoUrl(evidence.video) : null;

  return (
    <details className={styles.evidence}>
      <summary className={styles.summary}>この政策の情報源・本人の説明</summary>
      {!evidence ? (
        <div className={styles.content}>
          <p className={styles.label}>一次情報は未掲載です。</p>
          <p className={styles.note}>
            候補者本人の回答や、確認済みの資料はまだ掲載していません。
            比較に使う数値は動作確認用のデモで、候補者の政策や発言を表すものではありません。
          </p>
        </div>
      ) : (
        <div className={styles.content}>
          <p className={styles.label}>
            {provenanceLabels[evidence.provenance]}
          </p>
          {evidence.provenance === "editorial_summary" ? (
            <p className={styles.statement}>{evidence.text}</p>
          ) : (
            <blockquote className={styles.statement} cite={evidence.source.url}>
              {evidence.text}
            </blockquote>
          )}
          {evidence.provenance === "editorial_summary" && (
            <p className={styles.note}>
              本人の発言そのものではなく、下記の資料をもとに編集部が整理した内容です。
            </p>
          )}
          <dl className={styles.metadata}>
            <div>
              <dt>情報源</dt>
              <dd>{evidence.source.label}</dd>
            </div>
            <div>
              <dt>資料名</dt>
              <dd>{evidence.source.title}</dd>
            </div>
            {evidence.answeredOn && (
              <div>
                <dt>回答日</dt>
                <dd>
                  <time dateTime={evidence.answeredOn}>
                    {evidence.answeredOn}
                  </time>
                </dd>
              </div>
            )}
            <div>
              <dt>資料の公開日</dt>
              <dd>
                {evidence.publishedOn ? (
                  <time dateTime={evidence.publishedOn}>
                    {evidence.publishedOn}
                  </time>
                ) : (
                  "確認できていません"
                )}
              </dd>
            </div>
            <div>
              <dt>確認日</dt>
              <dd>
                <time dateTime={evidence.checkedOn}>{evidence.checkedOn}</time>
              </dd>
            </div>
          </dl>
          <ExternalResourceLink
            href={evidence.source.url}
            kind={evidence.source.kind}
            candidateId={candidateId}
            className={styles.sourceLink}
          >
            元の資料を確認する <span aria-hidden="true">↗</span>
            <span className="sr-only">
              （外部サイトを新しいタブで開きます）
            </span>
          </ExternalResourceLink>
          {videoUrl && evidence.video && (
            <div className={styles.video}>
              <p className={styles.label}>なぜそう考える？</p>
              <p className={styles.note}>{evidence.video.title}</p>
              <ExternalResourceLink
                href={videoUrl}
                kind="youtube"
                candidateId={candidateId}
                className={styles.sourceLink}
              >
                本人が話している部分を見る <span aria-hidden="true">↗</span>
                <span className="sr-only">
                  （YouTubeを新しいタブで開きます）
                </span>
              </ExternalResourceLink>
              <p className={styles.note}>
                YouTube / {formatVideoTimestamp(evidence.video.startSeconds)}
                から再生
                {evidence.video.checkedOn && (
                  <>
                    {" "}
                    / 確認日：
                    <time dateTime={evidence.video.checkedOn}>
                      {evidence.video.checkedOn}
                    </time>
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </details>
  );
}
