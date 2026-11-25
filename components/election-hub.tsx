import Link from "next/link";
import { Breadcrumbs } from "./breadcrumbs";
import {
  SENT_QUESTION_VERSION_LABEL,
  commonQuestions,
  districtLabels,
  districtNames,
  districtQuestions,
  questionPath,
  type District,
} from "../lib/election2026";
import { project } from "../lib/project";
import styles from "../app/ibaraki-2026/tsukuba/election.module.css";

export const electionHubPaths: Record<District, string> = {
  tsukuba: "/ibaraki-2026/tsukuba",
  tsuchiura: "/ibaraki-2026/tsuchiura",
};

export const electionGuidePaths: Record<District, string> = {
  tsukuba: "/tsukuba/elections",
  tsuchiura: "/tsuchiura/elections",
};

/** 県議選・選挙区ハブ。つくば市・土浦市で同じ構成（選挙区の間で扱いをそろえる）。 */
export function ElectionHub({ district }: { district: District }) {
  const name = districtNames[district];
  const label = districtLabels[district];
  const hubPath = electionHubPaths[district];
  const otherDistrict: District =
    district === "tsukuba" ? "tsuchiura" : "tsukuba";
  const questions = [...commonQuestions, ...districtQuestions(district)].sort(
    (a, b) => a.order - b.order || a.id.localeCompare(b.id),
  );
  return (
    <main id="main" className={`container document-page ${styles.page}`}>
      <Breadcrumbs
        items={[
          { label: "オシセン", href: "/" },
          { label: `2026年 茨城県議選・${label}`, href: hubPath },
        ]}
      />
      <p className="eyebrow">政策の問いから、本人のことばへ。</p>
      <h1>
        {project.electionYear}年 {project.electionName}
        <br />
        {label}
      </h1>
      <p className="lead">
        オシセンは、{label}
        を対象に、候補者の政策への回答と、その理由や経験を知るための情報を準備しています。
        いまは候補者に送った政策の質問（共通6問＋{name}
        の2問）と、情報をどのように確認・掲載するかを公開しています。
      </p>

      <div className={styles.status}>
        <strong className={styles.statusLabel}>{project.status}</strong>
        <p>
          候補者の皆さんへのインタビュー収録を進めています。候補者情報・本人回答・動画は、12月4日（告示日）以降、立候補届出順に公開します。
          政策の質問は{SENT_QUESTION_VERSION_LABEL}で、候補者に送った文のままです。
        </p>
      </div>

      <section className={styles.section} aria-labelledby="scope-heading">
        <h2 id="scope-heading">対象としている選挙・地域</h2>
        <p>
          オシセンの実証プロジェクトは、2026年の茨城県議会議員選挙・つくば市選挙区と土浦市選挙区の両地域を対象に準備を進めています。
          このページでは、{label}
          でのオシセンの取り組みを紹介しています。投票日や立候補者の確定情報は、選挙管理委員会の公式発表をご確認ください。
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
            <dd>茨城県 {label}</dd>
          </div>
          <div>
            <dt>公開している情報</dt>
            <dd>政策の質問（候補者送付版）、質問台帳、回答の見方、掲載・公平性の方針</dd>
          </div>
        </dl>
        <p>
          投票日や投票方法を調べたい方は、
          <Link href={electionGuidePaths[district]} className="text-link">
            {name}の選挙ガイド
          </Link>
          へ。日程・投票所・選挙公報・結果の公式確認先を案内しています。
        </p>
      </section>

      <section className={styles.section} aria-labelledby="issues-heading">
        <h2 id="issues-heading">政策の質問（共通6問＋{name}の2問）</h2>
        <p>
          候補者の皆さんに送った質問と同じ文です。1問ずつ開いて、自分でも答えられます。候補者の回答は12月4日（告示日）以降、立候補届出順に各質問のページへ並びます。
        </p>
        <ul className={styles.themeList}>
          {questions.map((question) => (
            <li key={question.id}>
              <Link
                href={questionPath(question)}
                className={styles.themeCard}
              >
                <h3>{question.themeLabel}</h3>
                <p>{question.textNormal}</p>
                <span className={styles.cardLink}>
                  この質問を見る・答える <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="preparation-heading">
        <h2 id="preparation-heading">候補者情報の公開準備</h2>
        <p>
          候補者へ共通の質問を行い、本人の回答と、その理由を確認してから掲載します。
          本人の立場と確認状況が混同されないよう、本人回答・公開資料・未回答を区別して掲載します。
        </p>
        <ul>
          <li>同じ質問に対する政策の回答（7段階）と、その理由</li>
          <li>共通インタビュー「オシセン！トーク」で本人が話した経験や判断の理由</li>
          <li>インタビュー動画の本編・1分間フラッシュ・切り抜き</li>
          <li>公式情報へのリンク、出典・確認日</li>
        </ul>
        <p>
          利用者が自分で投票について考えられるよう、本人の政策回答を一問ずつ、その理由とともに見比べられる形で掲載します。
        </p>
        <div className={styles.relatedLinks}>
          <Link href="/talk">インタビュー動画「オシセン！トーク」 →</Link>
          <Link href="/stories">本人に尋ねる共通の質問 →</Link>
          <Link href="/method">回答・比較の仕組み →</Link>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="read-more-heading">
        <h2 id="read-more-heading">情報の見方・掲載方針</h2>
        <p>
          質問の版の記録は質問台帳へ、掲載・編集の共通基準は中立性ポリシーへ。
          質問に答える前に、仕組みを確かめることもできます。
        </p>
        <div className={styles.relatedLinks}>
          <Link href="/issues">政策の質問一覧 →</Link>
          <Link href="/policy-register">政策の質問台帳 →</Link>
          <Link href="/sources">情報源・掲載状況 →</Link>
          <Link href="/neutrality">中立性ポリシー →</Link>
          <Link href="/diagnosis">質問に答える →</Link>
          <Link href="/about">オシセンについて →</Link>
          <Link href={electionHubPaths[otherDistrict]}>
            {districtLabels[otherDistrict]}のページ →
          </Link>
          <Link href="/guides/high-school-election">
            高校生と選挙のガイド →
          </Link>
        </div>
      </section>
    </main>
  );
}
