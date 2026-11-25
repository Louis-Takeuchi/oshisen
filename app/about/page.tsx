import { OrganizationData } from "../../components/organization-data";
import { pageMetadata } from "../../lib/seo";
import Link from "next/link";
import { TeamSection } from "../../components/team-section";
import { OfficialContacts } from "../../components/official-contacts";
import { contactEmail, contactMailto } from "../../lib/site-contact";
import { teamMembers } from "../../lib/team";
import { projectLabel } from "../../lib/project";
import publicationRules from "../../lib/publication-rules.json";
import styles from "./about.module.css";

export const metadata = pageMetadata("/about", {
  title: "オシセンとは｜2026年茨城県議選での実証プロジェクト",
  description:
    "オシセンが目指すこと、代表のRyo（大屋諒）と共同代表のLouis（竹内琉瑛）、2026年茨城県議選・つくば市選挙区・土浦市選挙区で準備する実証プロジェクトを紹介します。",
  index: true,
});

export default function AboutPage() {
  return (
    <main id="main" className={`container document-page ${styles.page}`}>
      <OrganizationData />
      <p className="eyebrow">サービス・運営情報</p>
      <h1>オシセンについて</h1>
      <p className="lead">
        オシセンは、政策への回答と本人へのインタビューを通じて、政治家を知るためのサービスです。
        2026年茨城県議選・つくば市選挙区・土浦市選挙区を対象に、取材と掲載の準備を進めています。
      </p>

      <nav className={styles.jumpLinks} aria-label="このページの目次">
        <a href="#team">
          運営メンバー <span aria-hidden="true">↓</span>
        </a>
        <a href="#team-qa">
          メンバーのQ&A <span aria-hidden="true">↓</span>
        </a>
        <a href="#our-idea">
          サービスの目的 <span aria-hidden="true">↓</span>
        </a>
        <a href="#operations">
          運営情報 <span aria-hidden="true">↓</span>
        </a>
        <a href="#publication-rules">
          候補者向け掲載規約 <span aria-hidden="true">↓</span>
        </a>
        <a href="#contact">
          公式SNS・お問い合わせ <span aria-hidden="true">↓</span>
        </a>
      </nav>

      <TeamSection />

      <section className="document-section" id="our-idea">
        <h2>サービスの目的</h2>
        <p>
          候補者の政策への賛否だけでなく、その考えに至った経験や判断の理由を伝えることが目的です。
          政策への回答とインタビューを別々の情報として掲載し、利用者が自分で判断するための材料を提供します。
        </p>
        <p>
          インタビューの要約には、本人の発言や原音へのリンクを付ける予定です。
          気になった内容を、前後の文脈も含めて確認できる形を目指しています。
        </p>
      </section>

      <section className="document-section">
        <h2>主な機能</h2>
        <ol>
          <li>質問に答えて、政策について自分の考えを整理する。</li>
          <li>候補者の回答と、一問ずつ見比べる。</li>
          <li>経験、選択、判断の理由、その判断の条件を知る。</li>
          <li>元の発言や一次資料へ進み、文脈を確かめる。</li>
        </ol>
        <p>
          政策の回答と、本人が語った経験は、それぞれ別の情報として扱います。
          本人の話から利用者が理解を深められるよう、発言の背景や判断の理由を添えて紹介する予定です。
          質問に答えずに「本人の話から見る」入口も使えます。
        </p>
        <Link href="/stories" className="text-link">
          本人の話から見る <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="document-section" id="project">
        <h2>つくば市・土浦市での実証プロジェクト</h2>
        <p>
          同じ取材内容でも、共通の項目で整理すると、発言とその根拠をつかみやすくなるのか。
          {projectLabel}を対象に、この問いを確かめる準備を進めています。
        </p>
        <p>
          候補者の皆さんへのインタビュー収録を進めています。候補者の回答と動画は、12月4日（告示日）以降、立候補届出順に公開します。
          研究参加の募集や本番の研究データ収集は、まだ始めていません。効果を示す研究結果もありません。
          訪問数の集計と、研究のための計測は分けて扱います。
        </p>
        <Link href="/research" className="text-link">
          研究の準備を見る <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="document-section">
        <h2>中立性と運営方針</h2>
        <p>
          掲載・質問・比較・編集の共通基準と、完全に自己資金で運営する方針を、中立性ポリシーにまとめています。
        </p>
        <Link href="/neutrality" className="text-link">
          中立性ポリシーを読む <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section
        className="document-section"
        id="publication-rules"
        aria-labelledby="publication-rules-title"
      >
        <h2 id="publication-rules-title">候補者・立候補予定者の方へ</h2>
        <p>
          取材への参加、コンテンツの利用、公開前の確認、訂正・異議申立ての条件を、掲載規約にまとめています。
        </p>
        <p>
          ご案内は、メール・電話・X（旧Twitter）などの公開連絡先を確認できた方から順次お送りしています。
          連絡先の公開状況や確認時期によって、ご案内の時期が異なる場合があります。現職・新人や党派による優先順位は設けません。
          まだ案内が届いていない対象の方は、運営窓口までご連絡ください。
        </p>
        <p>
          <Link href="/neutrality#outreach" className="text-link">
            ご案内の順序・回答期間について <span aria-hidden="true">→</span>
          </Link>
        </p>
        <h3>{publicationRules.title}</h3>
        <p>{publicationRules.edition}</p>
        <p>
          つくば市選挙区・土浦市選挙区を対象とする統一改訂案です。適用開始日と必要な手続は第28条、旧版で成立した同意の扱いは第27条をご確認ください。
        </p>
        <p>
          政策アンケート8問、人となりに関する質問6問、Podcastへの出演、政策一致度の数値照合への参加は、それぞれ選択できます。
          一部の質問への回答も受け付け、全14問への回答やPodcast出演を他の確認済み情報の掲載条件とはしません。
          数値照合には、回答掲載とは別に本人の明示的な同意と所定の算出条件が必要です。
        </p>
        <p>
          PDF・{publicationRules.pages}ページ（
          {Math.ceil(publicationRules.bytes / 1024)} KB）
        </p>
        <p>
          <a
            href={publicationRules.href}
            type="application/pdf"
            className="text-link"
          >
            掲載規約を読む（PDF） <span aria-hidden="true">→</span>
          </a>
        </p>
        <p>
          <a href={publicationRules.href} download className="text-link">
            PDFをダウンロード <span aria-hidden="true">↓</span>
          </a>
        </p>
      </section>

      <section className="document-section" id="operations">
        <h2>運営情報</h2>
        <dl>
          <div>
            <dt>プロジェクト</dt>
            <dd>オシセン / Phase 0</dd>
          </div>
          {teamMembers.map((member) => (
            <div key={member.id}>
              <dt>{member.role}</dt>
              <dd>
                <a href={`#team-${member.id}`} className="text-link">
                  {member.name}（{member.fullName}）
                </a>
                <span className={styles.operationRoles}>
                  担当：
                  {member.responsibilities.map(({ label }) => label).join("・")}
                </span>
              </dd>
            </div>
          ))}
          <div>
            <dt>法人・団体の情報</dt>
            <dd>法人・団体としての名称等は未掲載です。</dd>
          </div>
          <div>
            <dt>問い合わせ・訂正窓口</dt>
            <dd>
              <a href={contactMailto} className="text-link">
                {contactEmail}
              </a>
              <span className={styles.operationRoles}>
                メールでお問い合わせを受け付けています。
              </span>
            </dd>
          </div>
        </dl>
        <p>
          運営メンバーの紹介と、候補者の掲載・評価は分けて扱います。
          運営者個人の好みによって扱いが変わらないよう、回答の照合や候補者の表示順には共通の基準を設けています。
        </p>
      </section>

      <section
        id="contact"
        className={styles.contactSection}
        aria-labelledby="contact-title"
      >
        <p className="eyebrow">連絡先</p>
        <h2 id="contact-title">公式SNS・お問い合わせ</h2>
        <p className={styles.contactIntro}>
          公式Instagram・Xはこちらから。
          <br />
          お問い合わせや掲載内容の訂正のご連絡は、メールで受け付けています。
        </p>
        <OfficialContacts />
        <p className={styles.contactNote}>
          訂正のご連絡には、対象ページのURLと該当箇所を添えてください。
          メールは、ご自身のメールアプリで内容を確認してから送信する方式です。診断回答や結果は自動添付の対象から除外しています。
        </p>
      </section>
    </main>
  );
}
