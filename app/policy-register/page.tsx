import { pageMetadata } from "../../lib/seo";
import Link from "next/link";
import {
  SCALE_VERSION,
  SENT_QUESTION_VERSION,
  SENT_QUESTION_VERSION_LABEL,
  questionPath,
  questionTagLabel,
  sentQuestions,
} from "../../lib/election2026";

export const metadata = pageMetadata("/policy-register", {
  title: "政策の質問台帳・候補者送付版",
  description:
    "2026年茨城県議選に向けて候補者に送付した政策の質問（共通6問＋選挙区2問）の台帳です。質問文の原文、対象選挙区、7段階の選択肢の版を記録しています。",
  index: true,
});

export default function Page() {
  return (
    <main id="main" className="container page-main">
      <p className="eyebrow">P / QUESTION REGISTER</p>
      <h1>政策質問の台帳</h1>
      <p className="lead">
        候補者の皆さんに送付した質問の記録です。サイトに掲載する質問文は、この台帳の原文と常に一致させます。
      </p>
      <div className="notice">
        <span className="outline-label">{SENT_QUESTION_VERSION_LABEL}</span>
        <p>
          2026年10月30日に確定し、候補者へ送付した版です。共通6問＋選挙区2問（つくば市・土浦市）の計10問で、回答は7段階（1 強く反対〜7
          強く賛成）＋理由（400〜600字）。文言は一字一句変更しません。
        </p>
      </div>
      <p className="caption">
        台帳：{SENT_QUESTION_VERSION} ／ 選択肢：{SCALE_VERSION}
      </p>
      {sentQuestions.map((question) => (
        <article key={question.id} id={question.id} className="answer-review">
          <p className="eyebrow">
            {question.id} / {questionTagLabel(question)}
          </p>
          <h2>{question.text}</h2>
          <p className="caption">
            対象：{questionTagLabel(question)}（表示順 {question.order}）／ 版：
            {question.version}
          </p>
          <Link href={questionPath(question)} className="inline-link">
            この質問のページを見る →
          </Link>
        </article>
      ))}
      <section className="document-section">
        <h2>旧版について</h2>
        <p>
          2026年9月18日版の8テーマの草案（研究用）は、候補者送付版の確定に伴い掲載を終了しました。旧版の質問文はサイトには表示せず、記録はリポジトリの資料（docs/question-ledger.md）として保管しています。旧版への回答は、新しい版の回答とは照合しません。
        </p>
      </section>
      <div className="exploration-links">
        <Link href="/diagnosis">質問に答える →</Link>
        <Link href="/method">設計の考え方を見る →</Link>
      </div>
    </main>
  );
}
