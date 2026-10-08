import Link from "next/link";
import { pageMetadata, siteDescription } from "../lib/seo";
import { OrganizationData } from "../components/organization-data";
import { HomeTitle } from "../components/home-title";
import { ServiceIntroduction } from "../components/service-introduction";
import { projectLabel } from "../lib/project";
import styles from "./home-pop.module.css";

export const metadata = pageMetadata("/", {
  title: "オシセン｜政治家の政策・人柄を知るサービス",
  description: siteDescription,
  index: true,
});

export default function Home() {
  return (
    <main id="main" className={styles.home}>
      <OrganizationData website />
      <HomeTitle />
      <ServiceIntroduction />
      <section className={styles.menuSection} aria-labelledby="menu-title">
        <div className={styles.sectionHeading}>
          <h2 id="menu-title">利用メニュー</h2>
          <p>現在公開している質問や、取材予定の項目を確認できます。</p>
        </div>
        <div className={styles.menuGrid}>
          <Link href="/diagnosis">
            <span className={styles.menuNumber}>01</span>
            <h3>政策の質問</h3>
            <p>8つのテーマへの回答と見直し</p>
            <span className={styles.menuArrow} aria-hidden="true">
              ↗
            </span>
          </Link>
          <Link href="/stories">
            <span className={styles.menuNumber}>02</span>
            <h3>インタビュー項目</h3>
            <p>経験や判断の理由についての共通6問</p>
            <span className={styles.menuArrow} aria-hidden="true">
              ↗
            </span>
          </Link>
          <Link href="/issues">
            <span className={styles.menuNumber}>03</span>
            <h3>政策テーマ</h3>
            <p>質問の内容・用語・主な論点</p>
            <span className={styles.menuArrow} aria-hidden="true">
              ↗
            </span>
          </Link>
        </div>
        <Link href="/interests" className={styles.moreLink}>
          関心のあるテーマの選択 <span aria-hidden="true">→</span>
        </Link>
      </section>
      <section className={styles.statusSection} aria-labelledby="status-title">
        <div className={styles.statusIntro}>
          <span className={styles.statusLabel}>プロトタイプ</span>
          <h2 id="status-title">公開状況</h2>
          <p>{projectLabel}</p>
          <p>
            つくば市選挙区での実証に向けて準備中です。
            <br />
            候補者情報は未掲載、Podcast取材はこれからです。
          </p>
          <Link href="/ibaraki-2026/tsukuba" className={styles.moreLink}>
            対象選挙の詳細 <span aria-hidden="true">→</span>
          </Link>
        </div>
        <dl className={styles.statusList}>
          <div>
            <dt>政策の質問</dt>
            <dd>
              <strong>8問</strong>
              <span>草案を公開中</span>
            </dd>
          </div>
          <div>
            <dt>候補者情報</dt>
            <dd>
              <strong>0件</strong>
              <span>掲載準備中</span>
            </dd>
          </div>
          <div>
            <dt>Podcast取材</dt>
            <dd>
              <strong>準備中</strong>
              <span>取材前</span>
            </dd>
          </div>
        </dl>
      </section>
      <section className={styles.policySection} aria-labelledby="policy-title">
        <h2 id="policy-title">掲載方針</h2>
        <p>
          本人の回答と出典を確認して掲載します。
          <br />
          特定の候補者への投票を推奨・依頼するサービスではありません。
        </p>
        <div>
          <Link href="/method">
            回答の比較方法 <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/sources">
            情報源・公平性 <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/about">
            運営情報 <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
