import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../../../../components/breadcrumbs";
import { questions } from "../../../../../lib/data";
import {
  electionHubPath,
  issuePageDescription,
  issuePagePath,
} from "../../../../../lib/issue-content";
import { getIssueQuestion } from "../../../../../lib/issues";
import { isSafeResourceUrl } from "../../../../../lib/resources";
import { pageMetadata } from "../../../../../lib/seo";
import styles from "../../election.module.css";

type Props = { params: Promise<{ theme: string }> };

export function generateStaticParams() {
  return questions.map((question) => ({ theme: question.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { theme } = await params;
  const question = getIssueQuestion(theme);
  if (!question) notFound();

  return pageMetadata(issuePagePath(question.id), {
    title: `${question.theme}の争点・設問案｜2026年茨城県議選 つくば市選挙区`,
    description: issuePageDescription(question),
    index: true,
  });
}

export default async function IssuePage({ params }: Props) {
  const { theme } = await params;
  const question = getIssueQuestion(theme);
  if (!question) notFound();

  return (
    <main id="main" className={`container document-page ${styles.page}`}>
      <Breadcrumbs
        items={[
          { label: "オシセン", href: "/" },
          { label: "2026年 茨城県議選・つくば市選挙区", href: electionHubPath },
          { label: "争点・設問案", href: "/issues" },
          { label: question.theme, href: issuePagePath(question.id) },
        ]}
      />
      <p className="eyebrow">争点・設問案 / {question.theme}</p>
      <h1>
        {question.theme}
        <span className={styles.subtitle}>
          2026年 茨城県議選・つくば市選挙区
        </span>
      </h1>
      <p className="lead">{question.context}</p>

      <div className={styles.status}>
        <strong className={styles.statusLabel}>確認中の設問案</strong>
        <p>
          これは操作を試すための草案です。制度・予算・県の権限や出典は確認中で、正式な共通設問としてはまだ採用していません。
          候補者本人の回答も未掲載です。
        </p>
      </div>

      <section className={styles.section} aria-labelledby="question-heading">
        <h2 id="question-heading">オシセンの設問案</h2>
        <div className={styles.question}>
          <p>{question.text}</p>
          <p className={styles.version}>質問の版：{question.questionVersion}</p>
        </div>
        <p>
          この文への考えを「賛成」から「反対」までの5段階で尋ねます。
          「今は判断できない」や「スキップ」も選べます。判断を保留したことを、賛成・反対や中立に置き換えません。
        </p>
        <Link href="/method" className="text-link">
          回答の選択肢・比較の仕組み →
        </Link>
      </section>

      <section className={styles.section} aria-labelledby="discussion-heading">
        <h2 id="discussion-heading">この問いで考えるポイント</h2>
        <ul>
          {question.sections.discussion.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <p>
          ここに挙げた視点だけで賛否が決まるわけではありません。
          対象や費用、具体的な条件によって考えが変わることもあるため、本人の回答を掲載するときは理由・条件も一緒に示す方針です。
        </p>
      </section>

      <section className={styles.section} aria-labelledby="terms-heading">
        <h2 id="terms-heading">設問で使う言葉</h2>
        <dl className={styles.terms}>
          {question.sections.terms.map((item) => (
            <div key={item.term}>
              <dt>{item.term}</dt>
              <dd>{item.description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="prefecture-heading">
        <h2 id="prefecture-heading">県政との関係と、確認すること</h2>
        <p>{question.sections.currentState}</p>
        <ul>
          {question.pendingChecks.map((check) => (
            <li key={check}>{check}</li>
          ))}
        </ul>
        <p>{question.selection.reason}</p>
        <Link href={`/policy-register#${question.id}`} className="text-link">
          この設問の台帳・採否の理由を見る →
        </Link>
      </section>

      <section className={styles.section} aria-labelledby="answers-heading">
        <h2 id="answers-heading">候補者の本人回答</h2>
        <p>
          現在は取材・掲載準備中です。この質問に対する候補者本人の回答は、まだ掲載していません。
          同じ質問への回答を確認してから、理由・条件・出典と一緒に掲載します。
        </p>
        <p>
          本人が回答していない内容を、過去の発言や資料から推測して埋めることはありません。
        </p>
      </section>

      <section className={styles.section} aria-labelledby="sources-heading">
        <h2 id="sources-heading">情報源と確認状況</h2>
        {question.sections.sources.length ? (
          <ul>
            {question.sections.sources.map((source) => (
              <li key={source.id}>
                {source.url && isSafeResourceUrl(source.url) ? (
                  <a href={source.url} className="text-link">
                    {source.label}
                  </a>
                ) : (
                  source.label
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>
            この設問について、確認済みの出典はまだありません。
            現在の政策・制度や候補者の立場を示す資料として扱わず、質問づくりの途中経過として公開しています。
            確認した資料・基準時点は、質問台帳とあわせて掲載する方針です。
          </p>
        )}
        <div className={styles.relatedLinks}>
          <Link href="/sources">情報源・公平性・訂正の方針 →</Link>
          <Link href="/research">設問づくり・研究の準備 →</Link>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="related-heading">
        <h2 id="related-heading">ほかのテーマも見る</h2>
        <nav className={styles.relatedLinks} aria-label="ほかの争点・設問案">
          {questions
            .filter((item) => item.id !== question.id)
            .map((item) => (
              <Link key={item.id} href={issuePagePath(item.id)}>
                {item.theme} →
              </Link>
            ))}
        </nav>
        <div className={styles.relatedLinks}>
          <Link href={electionHubPath}>
            2026年 茨城県議選・つくば市選挙区の案内 →
          </Link>
          <Link href="/issues">争点・設問案の一覧 →</Link>
          <Link href="/diagnosis">自分でも質問に答える →</Link>
        </div>
      </section>
    </main>
  );
}
