import type { Question } from "../lib/data";
import { isSafeResourceUrl } from "../lib/resources";
export function QuestionHelp({ question }: { question: Question }) {
  return (
    <details className="question-context policy-help">
      <summary>言葉・背景・論点・出典を見る</summary>
      <p>{question.context}</p>
      <h3>言葉の意味</h3>
      <dl>
        {question.sections.terms.map((item) => (
          <div key={item.term}>
            <dt>{item.term}</dt>
            <dd>{item.description}</dd>
          </div>
        ))}
      </dl>
      <h3>今の状況と、県ができること</h3>
      <p>{question.sections.currentState}</p>
      <h3>考えるポイント</h3>
      <ul>
        {question.sections.discussion.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h3>出典</h3>
      {question.sections.sources.length ? (
        <ul>
          {question.sections.sources.map((source) => (
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
      ) : (
        <p>確認済みの出典はまだありません。この質問は草案です。</p>
      )}
      <p className="caption">
        質問 {question.questionVersion} / 選択肢 {question.scaleVersion} / 補足{" "}
        {question.contextVersion}
      </p>
    </details>
  );
}
