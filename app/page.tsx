import Link from "next/link";
import Image from "next/image";
import { projectLabel } from "../lib/project";
import styles from "./home-pop.module.css";

export default function Home() {
  return (
    <main id="main" className={styles.home}>
      <section className="container home-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="blue-dot" aria-hidden="true" />
            {projectLabel}
          </p>
          <h1>
            政治家の<span className="marked">気にピ</span>、<br />
            つくってみない？
          </h1>
          <p className="hero-description">
            政策の回答を、一問ずつ。
            <br />
            その理由や経験は、本人のことばから。
          </p>
          <div className="hero-actions">
            <Link href="/diagnosis" className="button primary">
              政策の質問を試す <span aria-hidden="true">→</span>
            </Link>
            <Link className="text-link" href="/stories">
              本人の話から見る <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <p className="hero-note">
            答えが同じでも、理由は違うかも。
            <br />
            気になったら、元の発言まで。
          </p>
        </div>
        <aside className="hero-editorial" aria-label="オシセンで知ること">
          <div className={styles.logoStage}>
            <span className={styles.spark} aria-hidden="true">
              ✦
            </span>
            <Image
              src="/brand-logo.png"
              alt="オシセン！"
              width={900}
              height={300}
              unoptimized
              priority
              className={styles.heroLogo}
            />
            <span className={styles.logoDot} aria-hidden="true" />
          </div>
          <div className="editorial-top">
            <span>政治家との出会い方を、変える。</span>
            <span>01 — 03</span>
          </div>
          <div className="editorial-line">
            <span className="small-index">01</span>
            <div>
              <h2>どんな政策？</h2>
              <p>ひとつの質問を、同じ条件で。</p>
            </div>
            <span className="editorial-arrow" aria-hidden="true">
              ↗
            </span>
          </div>
          <div className="editorial-line">
            <span className="small-index">02</span>
            <div>
              <h2>どうして、そう考えた？</h2>
              <p>経験や判断の理由を、本人のことばで。</p>
            </div>
            <span className="editorial-arrow" aria-hidden="true">
              ↗
            </span>
          </div>
          <div className="editorial-line">
            <span className="small-index">03</span>
            <div>
              <h2>もっと知りたい。</h2>
              <p>本人の話と、一次情報へ。</p>
            </div>
            <span className="editorial-arrow" aria-hidden="true">
              ↗
            </span>
          </div>
          <div className="editorial-bottom">
            <span>回答から、理由へ。理由から、元の発言へ。</span>
            <span className="wordmark-small">オシセン</span>
          </div>
        </aside>
      </section>
      <div className="container prototype-strip">
        <span className="outline-label">プロトタイプ</span>
        <p>
          つくば市選挙区での実証に向けて準備中です。候補者情報は未掲載、Podcast取材はこれからです。
        </p>
        <Link href="/sources">掲載情報について ↗</Link>
      </div>
      <section className="container how-section">
        <div className="section-heading">
          <p className="eyebrow">オシセンの使い方</p>
          <h2>答えだけで、終わらない。</h2>
        </div>
        <ol className="steps">
          <li>
            <span>01</span>
            <div>
              <h3>質問に答える</h3>
              <p>「今は判断できない」でも大丈夫。</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>一問ずつ、見比べる</h3>
              <p>同じ回答も、違う回答も、そのまま。</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>
                気になった人を、
                <br />
                もう少し見る
              </h3>
              <p>経験、選択、理由。元の発言へ。</p>
            </div>
          </li>
        </ol>
      </section>
      <section className="container home-explore">
        <div className="section-heading">
          <p className="eyebrow">気になるところから。</p>
          <h2>入口は、ひとつじゃない。</h2>
        </div>
        <div className="explore-grid">
          <Link href="/stories">
            <span className="small-index">01</span>
            <h3>本人の話から</h3>
            <p>経験や判断の理由を知るための、共通の質問。</p>
            <span aria-hidden="true">→</span>
          </Link>
          <Link href="/interests">
            <span className="small-index">02</span>
            <h3>知りたいことから</h3>
            <p>テーマや情報の種類を選んで、入口を探す。</p>
            <span aria-hidden="true">→</span>
          </Link>
          <Link href="/issues">
            <span className="small-index">03</span>
            <h3>政策の問いから</h3>
            <p>公共交通、教育、医療。まずは問いを読む。</p>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      <section className="concept-section">
        <div className="container concept-grid">
          <div>
            <p className="eyebrow">オシセンが大切にしていること</p>
            <h2>
              政策だけじゃ、
              <br />
              わからないこともある。
            </h2>
            <Link href="/about" className="text-link">
              オシセンについて →
            </Link>
          </div>
          <div className="concept-body">
            <p>候補者を選ぶとき、政策は大事です。</p>
            <p>
              でも、
              <br />
              どんな経験をしてきたのか。
              <br />
              どんなことで迷うのか。
              <br />
              どういう基準で決断するのか。
            </p>
            <p>
              そんな情報を知ることで、
              <br />
              政策の見え方が少し変わるかもしれません。
            </p>
            <p>
              オシセンでは、政策の回答を一問ずつ見比べます。
              <br className="desktop-only" />
              そして、経験や判断の理由を元の発言につなぎます。
            </p>
          </div>
        </div>
      </section>
      <section className="container candidate-entrance">
        <div>
          <p className="eyebrow">本人の話から、知ってみる</p>
          <h2>
            「この人、誰だろう」
            <br />
            からでも。
          </h2>
          <p>質問への回答なしでも見られます。いまは取材前の準備中です。</p>
        </div>
        <Link href="/stories" className="entrance-link">
          本人の話から見る <span aria-hidden="true">↗</span>
        </Link>
      </section>
      <section className="container trust-row">
        <p>
          知るための材料を、
          <br />
          <strong>自分で確かめられるように。</strong>
        </p>
        <div>
          <p>
            候補者の総合点や、人柄の点数はつけません。
            <br />
            オシセンは、特定の候補者への投票を推奨・依頼しません。
          </p>
          <Link href="/method" className="text-link">
            回答と情報の見方 →
          </Link>
        </div>
      </section>
    </main>
  );
}
