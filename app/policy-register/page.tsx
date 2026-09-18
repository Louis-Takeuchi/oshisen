import type { Metadata } from "next";
import Link from "next/link";
import {
  questionLedger,
  QUESTION_LEDGER_VERSION,
} from "../../lib/question-ledger";
import { QuestionHelp } from "../../components/question-help";
export const metadata: Metadata = {
  title: "政策の質問台帳",
  description:
    "質問案、採否の理由、確認が必要な点、設問・選択肢・補足の版を公開します。",
};
export default function Page() {
  return (
    <main id="main" className="container page-main">
      <p className="eyebrow">P / QUESTION REGISTER</p>
      <h1>何を聞くかも、確かめる。</h1>
      <p className="lead">今ある8問も、新しい8つの案も、まだ草案です。</p>
      <div className="notice">
        <p>
          現在の制度や県の権限、質問の受け取られ方を確認してから採用を決めます。保留は、その政策への賛否を表すものではありません。
        </p>
      </div>
      <p className="caption">台帳：{QUESTION_LEDGER_VERSION}</p>
      {questionLedger.map((q, index) => (
        <article
          key={q.id}
          id={
            q.origin === "research-proposal"
              ? `P${String(index - 7).padStart(2, "0")}`
              : q.id
          }
          className="answer-review"
        >
          {q.origin === "research-proposal" && <span id={q.id} />}
          <p className="eyebrow">
            {q.id} / {q.theme} /{" "}
            {q.origin === "legacy-prototype"
              ? "操作体験の草案"
              : "新しい設問案"}
          </p>
          <h2>{q.text}</h2>
          <p>
            <strong>
              {q.selection.status === "adopted"
                ? "採用"
                : q.selection.status === "rejected"
                  ? "不採用"
                  : "保留"}
            </strong>
            ：{q.selection.reason}
          </p>
          <h3>確認すること</h3>
          <ul>
            {q.pendingChecks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
          <QuestionHelp question={q} />
        </article>
      ))}
      <div className="exploration-links">
        <Link href="/diagnosis">質問の操作を試す →</Link>
        <Link href="/method">設計の考え方を見る →</Link>
      </div>
    </main>
  );
}
