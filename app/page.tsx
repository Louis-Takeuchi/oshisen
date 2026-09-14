import Link from "next/link";

export default function Home() {
  return (
    <main id="main">
      <section className="container home-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="blue-dot" />
            2026 茨城県議会議員選挙
          </p>
          <h1>
            政治家の<span className="marked">気にピ</span>、<br />
            つくってみない？
          </h1>
          <p className="hero-description">
            いくつかの質問に答えると、
            <br />
            あなたと政策の近い候補者が見つかります。
          </p>
          <div className="hero-actions">
            <Link href="/diagnosis" className="button primary">
              診断をはじめる <span aria-hidden="true">→</span>
            </Link>
            <Link className="text-link" href="/candidates">
              候補者から見る <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <p className="hero-note">
            まずは政策から。
            <br />
            気になったら、その人自身まで。
          </p>
        </div>
        <aside className="hero-editorial" aria-label="オシセンで知ること">
          <div className="editorial-top">
            <span>政治家との出会い方を、変える。</span>
            <span>01 — 03</span>
          </div>
          <div className="editorial-line">
            <span className="small-index">01</span>
            <div>
              <h2>どんな政策？</h2>
              <p>暮らしのことから、考えてみる。</p>
            </div>
            <span className="editorial-arrow" aria-hidden="true">
              ↗
            </span>
          </div>
          <div className="editorial-line">
            <span className="small-index">02</span>
            <div>
              <h2>どんな人？</h2>
              <p>言葉や経験から、その人を知る。</p>
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
            <span>政策で出会い、人柄で興味を深める。</span>
            <span className="wordmark-small">オシセン</span>
          </div>
        </aside>
      </section>
      <div className="container prototype-strip">
        <span className="outline-label">プロトタイプ</span>
        <p>
          操作を体験するためのデモです。候補者は仮名、診断結果は確認用データです。
        </p>
        <Link href="/sources">掲載情報について ↗</Link>
      </div>
      <section className="container how-section">
        <div className="section-heading">
          <p className="eyebrow">オシセンの使い方</p>
          <h2>まずは、あなたの考えから。</h2>
        </div>
        <ol className="steps">
          <li>
            <span>01</span>
            <div>
              <h3>質問に答える</h3>
              <p>「どちらかといえば」で大丈夫。</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>近い候補者を知る</h3>
              <p>同じ考えも、違う考えも。</p>
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
              <p>政策の先に、その人の言葉。</p>
            </div>
          </li>
        </ol>
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
              オシセンでは、まず政策との一致度を示した上で、
              <br className="desktop-only" />
              候補者本人について知るための情報も掲載します。
            </p>
          </div>
        </div>
      </section>
      <section className="container candidate-entrance">
        <div>
          <p className="eyebrow">候補者から、知ってみる</p>
          <h2>
            「この人、誰だろう」
            <br />
            からでも。
          </h2>
          <p>診断を受けなくても、候補者のページを見られます。</p>
        </div>
        <Link href="/candidates" className="entrance-link">
          全候補者を見る <span aria-hidden="true">↗</span>
        </Link>
      </section>
      <section className="container trust-row">
        <p>
          考えが近いことと、
          <br />
          <strong>投票先を決めることは、別のこと。</strong>
        </p>
        <div>
          <p>
            政策一致度は、候補者の優劣を示すものではありません。
            <br />
            オシセンは、特定の候補者への投票を推奨・依頼しません。
          </p>
          <Link href="/method" className="text-link">
            マッチングの仕組み →
          </Link>
        </div>
      </section>
    </main>
  );
}
