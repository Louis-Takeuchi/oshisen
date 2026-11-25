import {
  EXPLAINER_FOOTNOTE,
  getApprovedExplainer,
} from "../lib/explainers.ts";
import { explainerLevel, type QuestionLevel } from "../lib/question-levels.ts";
import styles from "./question-explainer.module.css";

/**
 * 「この質問の解説」（開閉式）。
 * explainers タブで approved=TRUE の質問だけ表示し、それ以外は欄ごと非表示。
 * 見出しの文言と並び順は固定（P1-7）。
 */
export function QuestionExplainer({
  questionId,
  level,
}: {
  questionId: string;
  level: QuestionLevel;
}) {
  const explainer = getApprovedExplainer(questionId);
  if (!explainer) return null;
  const textLevel = explainerLevel(level);
  return (
    <details className={`question-context ${styles.explainer}`}>
      <summary>この質問の解説</summary>
      <h3 className={styles.heading}>何を聞いている？</h3>
      <p className={styles.body}>{explainer.summary[textLevel]}</p>
      <h3 className={styles.heading}>今どうなっている？</h3>
      <p className={styles.body}>{explainer.now[textLevel]}</p>
      <div className={styles.prosCons}>
        <section className={`${styles.pointBox} ${styles.prosBox}`}>
          <h3 className={styles.pointHeading}>
            よい点として挙げられること（メリット）
          </h3>
          <ul>
            {explainer.pros[textLevel].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className={`${styles.pointBox} ${styles.consBox}`}>
          <h3 className={styles.pointHeading}>
            心配な点として挙げられること（デメリット）
          </h3>
          <ul>
            {explainer.cons[textLevel].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
      {explainer.terms.length > 0 && (
        <>
          <h3 className={styles.heading}>ことば</h3>
          <dl className={styles.terms}>
            {explainer.terms.map((item, index) => (
              <div key={`${item.term}-${index}`}>
                {item.term && <dt>{item.term}</dt>}
                <dd>{item.description}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
      {explainer.sources.length > 0 && (
        <>
          <h3 className={styles.heading}>出典</h3>
          <ul className={styles.sources}>
            {explainer.sources.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {url}
                  <span className="sr-only">（新しいタブで開きます）</span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className={styles.footnote}>{EXPLAINER_FOOTNOTE}</p>
    </details>
  );
}
