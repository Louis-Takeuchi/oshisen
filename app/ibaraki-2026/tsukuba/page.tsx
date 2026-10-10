import Link from "next/link";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { questions } from "../../../lib/data";
import { electionHubPath, issuePagePath } from "../../../lib/issue-content";
import { project } from "../../../lib/project";
import { pageMetadata } from "../../../lib/seo";
import styles from "./election.module.css";

export const metadata = pageMetadata(electionHubPath, {
  title: "2026年 茨城県議会議員選挙 つくば市選挙区",
  description:
    "2026年茨城県議会議員選挙・つくば市選挙区に向けたオシセンの案内。公共交通、教育、子育てなど8つのテーマの設問案、情報の見方、掲載方針を紹介します。候補者情報・本人回答・Podcastは準備中です。",
  index: true,
});

export default function ElectionPage() {
  return (
    <main id="main" className={`container document-page ${styles.page}`}>
      <Breadcrumbs
        items={[
          { label: "オシセン", href: "/" },
          { label: "2026年 茨城県議選・つくば市選挙区", href: electionHubPath },
        ]}
      />
      <p className="eyebrow">政策の問いから、本人のことばへ。</p>
      <h1>
        {project.electionYear}年 {project.electionName}
        <br />
        つくば市選挙区
      </h1>
      <p className="lead">
        オシセンは、つくば市選挙区を対象に、候補者の政策への回答と、その理由や経験を知るための情報を準備しています。
        いまは8つのテーマの設問案と、情報をどのように確認・掲載するかを公開しています。
      </p>

      <div className={styles.status}>
        <strong className={styles.statusLabel}>{project.status}</strong>
        <p>
          候補者情報・本人回答はまだ掲載していません。Podcast取材も未実施です。
          政策の質問は操作を試すための草案で、現行の制度・予算・県の権限や出典は確認中です。
        </p>
      </div>

      <section className={styles.section} aria-labelledby="scope-heading">
        <h2 id="scope-heading">対象としている選挙・地域</h2>
        <p>
          オシセンの実証プロジェクトは、2026年の茨城県議会議員選挙・つくば市選挙区と土浦市選挙区の両地域を対象に準備を進めています。
          このページでは、つくば市選挙区でのオシセンの取り組みを紹介しています。投票日や立候補者の確定情報は、選挙管理委員会の公式発表をご確認ください。
        </p>
        <dl className={styles.facts}>
          <div>
            <dt>対象選挙</dt>
            <dd>
              {project.electionYear}年 {project.electionName}
            </dd>
          </div>
          <div>
            <dt>対象地域</dt>
            <dd>茨城県 つくば市選挙区</dd>
          </div>
          <div>
            <dt>公開している情報</dt>
            <dd>政策の設問案、質問台帳、回答の見方、掲載・公平性の方針</dd>
          </div>
        </dl>
        <p>
          投票日や投票方法を調べたい方は、
          <Link href="/tsukuba/elections" className="text-link">
            つくば市の選挙ガイド
          </Link>
          へ。市長選・市議選と県議選の違い、日程・投票所・選挙公報・結果の公式確認先を案内しています。
        </p>
      </section>

      <section className={styles.section} aria-labelledby="issues-heading">
        <h2 id="issues-heading">政策の8テーマ</h2>
        <p>
          何を尋ねるのか、言葉の意味、考えるポイント、公開前に確認することをテーマごとに整理しています。
          県政の一部のテーマを取り上げた設問案として公開しています。今後、制度や出典の確認とともに、取り上げる範囲を見直す予定です。
        </p>
        <ul className={styles.themeList}>
          {questions.map((question) => (
            <li key={question.id}>
              <Link
                href={issuePagePath(question.id)}
                className={styles.themeCard}
              >
                <h3>{question.theme}</h3>
                <p>{question.context}</p>
                <span className={styles.cardLink}>
                  設問案と確認することを見る <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="preparation-heading">
        <h2 id="preparation-heading">候補者情報の公開準備</h2>
        <p>
          今後、候補者へ共通の質問を行い、本人の回答と、その理由・条件・出典を確認してから掲載する予定です。
          本人の立場と確認状況が混同されないよう、本人回答・公開資料・未回答を区別して掲載します。
        </p>
        <ul>
          <li>同じ質問に対する政策の回答と、その理由・条件</li>
          <li>共通インタビューで本人が話した経験や判断の理由</li>
          <li>発言の前後が分かる文字起こし、Podcastの該当箇所・全編</li>
          <li>公式情報へのリンク、出典・確認日</li>
        </ul>
        <p>
          利用者が自分で投票について考えられるよう、本人の政策回答を一問ずつ、その理由とともに見比べられる形で掲載する予定です。
        </p>
        <div className={styles.relatedLinks}>
          <Link href="/stories">本人に尋ねる共通の質問 →</Link>
          <Link href="/method">回答・比較の仕組み →</Link>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="read-more-heading">
        <h2 id="read-more-heading">情報の見方・掲載方針</h2>
        <p>
          設問の採用理由や確認中の事項は質問台帳へ、掲載・編集の共通基準は中立性ポリシーへ。
          質問に答える前に、仕組みを確かめることもできます。
        </p>
        <div className={styles.relatedLinks}>
          <Link href="/issues">争点・設問案の一覧 →</Link>
          <Link href="/policy-register">政策の質問台帳 →</Link>
          <Link href="/sources">情報源・掲載状況 →</Link>
          <Link href="/neutrality">中立性ポリシー →</Link>
          <Link href="/diagnosis">質問の操作を試す →</Link>
          <Link href="/about">オシセンについて →</Link>
          <Link href="/guides/high-school-election">
            高校生と選挙のガイド →
          </Link>
        </div>
      </section>
    </main>
  );
}
