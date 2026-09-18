import type { Metadata } from "next";
import Link from "next/link";
import { TeamSection } from "../../components/team-section";
import { OfficialContacts } from "../../components/official-contacts";
import { contactEmail, contactMailto } from "../../lib/site-contact";
import { teamMembers } from "../../lib/team";
import { projectLabel } from "../../lib/project";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "オシセンについて",
  description:
    "代表のRyo（大屋涼）と共同代表のLouis（竹内琉瑛）。オシセンをつくる2人の担当と人となりを、写真と本人のことばで紹介します。",
};

export default function AboutPage() {
  return (
    <main id="main" className={`container document-page ${styles.page}`}>
      <p className="eyebrow">オシセンについて</p>
      <h1>
        政治家との出会い方を、
        <br />
        変える。
      </h1>
      <p className="lead">
        政策の回答から、経験や判断の理由へ。そして、元の発言へ。
        オシセンは、候補者を知るきっかけをつくるサービスです。
      </p>

      <nav className={styles.jumpLinks} aria-label="このページの目次">
        <a href="#team">
          つくっている2人 <span aria-hidden="true">↓</span>
        </a>
        <a href="#team-qa">
          人となりのQ&A <span aria-hidden="true">↓</span>
        </a>
        <a href="#our-idea">
          オシセンの考え方 <span aria-hidden="true">↓</span>
        </a>
        <a href="#operations">
          運営情報 <span aria-hidden="true">↓</span>
        </a>
        <a href="#contact">
          公式SNS・お問い合わせ <span aria-hidden="true">↓</span>
        </a>
      </nav>

      <TeamSection />

      <section className="document-section" id="our-idea">
        <h2>
          「今回、誰が気になる？」が、
          <br />
          ふつうに交わされる社会へ。
        </h2>
        <p>
          候補者を選ぶとき、政策は大事です。でも、どんな経験をしてきたのか。
          どんなことで迷うのか。どういう基準で決断するのか。
          そんな情報を知ることで、政策の見え方が少し変わるかもしれません。
        </p>
        <p>
          同じ政策の回答でも、理由まで同じとは限りません。
          どんな場面で、何を選び、なぜそう考えたのか。
          本人の話を、前後の文脈まで確かめられる入口をつくります。
        </p>
      </section>

      <section className="document-section">
        <h2>政策から、もう一歩先へ。</h2>
        <ol>
          <li>質問に答えて、政策について自分の考えを整理する。</li>
          <li>候補者の回答と、一問ずつ見比べる。</li>
          <li>経験、選択、判断の理由、その判断の条件を知る。</li>
          <li>元の発言や一次資料へ進み、文脈を確かめる。</li>
        </ol>
        <p>
          政策の回答と、本人が語った経験は、それぞれ別の情報として扱います。
          人柄の点数や候補者の総合点はつけません。
          質問に答えずに「本人の話から見る」入口も使えます。
        </p>
        <Link href="/stories" className="text-link">
          本人の話から見る <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="document-section">
        <h2>Phase 0で、確かめたいこと。</h2>
        <p>
          同じ取材内容でも、共通の項目で整理すると、発言とその根拠をつかみやすくなるのか。
          {projectLabel}を対象に、この問いを確かめる準備を進めています。
        </p>
        <p>
          現在は質問や画面を確かめるプロトタイプです。候補者情報は未掲載で、Podcast取材もこれからです。
          研究参加の募集や本番の研究データ収集は、まだ始めていません。効果を示す研究結果もありません。
          訪問数の集計と、研究のための計測は分けて扱います。
        </p>
        <Link href="/research" className="text-link">
          研究の準備を見る <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="document-section">
        <h2>投票先を決めるのは、あなたです。</h2>
        <p>
          オシセンは、特定の候補者への投票を推奨・依頼するサービスではありません。
          一問への回答が同じでも、人物全体が似ているとは限りません。
          どの情報をどう受け止めるかは、利用者自身が判断します。
        </p>
        <p>
          本番の掲載では、候補者本人の回答や一次情報を確認し、出典と確認日を示す方針です。
          現在の確認状況や公開前の準備項目は、情報源・公平性のページに掲載しています。
        </p>
        <Link href="/sources" className="text-link">
          情報源・公平性を読む <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="document-section" id="operations">
        <h2>運営について</h2>
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
          運営者の性格や好みを、回答の照合や候補者の表示順に反映することはありません。
        </p>
      </section>

      <section
        id="contact"
        className={styles.contactSection}
        aria-labelledby="contact-title"
      >
        <p className="eyebrow">KEEP IN TOUCH / つながる</p>
        <h2 id="contact-title">オシセンと、つながろう。</h2>
        <p className={styles.contactIntro}>
          公式Instagram・Xはこちらから。
          <br />
          お問い合わせや掲載内容の訂正のご連絡は、メールで受け付けています。
        </p>
        <OfficialContacts />
        <p className={styles.contactNote}>
          訂正のご連絡には、対象ページのURLと該当箇所を添えてください。
          このサイトからメールを自動送信したり、診断回答や結果を添付したりすることはありません。
        </p>
      </section>
    </main>
  );
}
