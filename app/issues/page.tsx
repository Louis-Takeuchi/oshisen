import Link from "next/link";
import { pageMetadata } from "../../lib/seo";
import {
  SENT_QUESTION_VERSION_LABEL,
  commonQuestions,
  districtNames,
  districtQuestions,
  questionPath,
  scopeLabels,
} from "../../lib/election2026";
import styles from "./issues-list.module.css";

export const metadata = pageMetadata("/issues", {
  title: "政策の質問一覧｜2026年茨城県議選・つくば市選挙区・土浦市選挙区",
  description:
    "2026年茨城県議選・つくば市選挙区・土浦市選挙区の候補者に送った政策の質問（共通6問＋選挙区2問）の一覧です。候補者にも同じ質問をしています。回答は12月4日（告示日）以降、届出順に並びます。",
  index: true,
});

export default function Page() {
  const groups = [
    { heading: `${scopeLabels.common}の質問（6問）`, questions: commonQuestions },
    {
      heading: `${districtNames.tsukuba}の質問（2問）`,
      questions: districtQuestions("tsukuba"),
    },
    {
      heading: `${districtNames.tsuchiura}の質問（2問）`,
      questions: districtQuestions("tsuchiura"),
    },
  ];
  return (
    <main id="main" className="container page-main">
      <p className="eyebrow">気になるテーマから。</p>
      <h1>政策の質問一覧</h1>
      <p className="lead">
        候補者の皆さんに送った質問と同じ文です。1問ずつ開いて、自分でも答えられます。
      </p>
      <div className="notice">
        <span className="outline-label">{SENT_QUESTION_VERSION_LABEL}</span>
        <p>
          候補者にも同じ質問をしています（7段階＋理由400〜600字）。候補者の回答は12月4日（告示日）以降、立候補届出順に各質問のページへ並びます。
        </p>
      </div>
      {groups.map((group) => (
        <section
          key={group.heading}
          className={styles.group}
          aria-label={group.heading}
        >
          <h2 className={styles.groupHeading}>{group.heading}</h2>
          <ul className={styles.list}>
            {group.questions.map((question) => (
              <li key={question.id}>
                <Link href={questionPath(question)} className={styles.card}>
                  <span className={styles.tag}>
                    {scopeLabels[question.scope]}｜{question.themeLabel}
                  </span>
                  <span className={styles.text}>{question.textNormal}</span>
                  <span className={styles.cardLink}>
                    この質問を見る・答える <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <div className="exploration-links">
        <Link href="/diagnosis">最初から全部の質問に答える →</Link>
        <Link href="/method">回答と情報の見方 →</Link>
        <Link href="/policy-register">質問の台帳を見る →</Link>
      </div>
    </main>
  );
}
