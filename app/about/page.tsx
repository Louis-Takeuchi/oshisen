import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "オシセンについて",
  description:
    "政治家との出会い方を、変える。政策を入口に、候補者本人のことばと一次情報へつなぐオシセンの考え方。",
};

export default function AboutPage() {
  return (
    <main id="main" className="container document-page">
      <p className="eyebrow">オシセンについて</p>
      <h1>
        政治家との出会い方を、
        <br />
        変える。
      </h1>
      <p className="lead">
        政策で出会い、人柄で興味を深め、一次情報へ。
        オシセンは、候補者を知るきっかけをつくるサービスです。
      </p>

      <section className="document-section">
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
          まず、自分と政策の近い候補者を知る。気になったら、その人自身まで。
          本人の長い話を聞いたり、公式サイトや選挙公報を読んだりする入口をつくります。
        </p>
      </section>

      <section className="document-section">
        <h2>政策から、もう一歩先へ。</h2>
        <ol>
          <li>質問に答えて、政策について自分の考えを整理する。</li>
          <li>近かった論点も、違った論点も確かめる。</li>
          <li>候補者の経験や判断のしかたを、本人のことばで知る。</li>
          <li>インタビューや公式情報へ進み、自分で考える材料を増やす。</li>
        </ol>
        <p>
          人柄は、政策についてさらに調べるきっかけです。
          人柄の回答で相性を採点したり、政策一致度を変えたりすることはありません。
          診断を受けずに、候補者を見ることもできます。
        </p>
        <Link href="/candidates" className="text-link">
          候補者を見る <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="document-section">
        <h2>Phase 0で、確かめたいこと。</h2>
        <p>
          政策に加えて候補者の経験や考え方を知ると、もう少し調べてみたくなるのか。
          2026年
          茨城県議会議員選挙を対象とする実証プロジェクトとして、この仮説を検討しています。
        </p>
        <p>
          現在は画面と操作を確かめるプロトタイプです。実在する候補者の情報は掲載していません。
          同意した場合の行動記録も、お使いのブラウザ内で動作を確認するためのものです。
          利用者全体を集計する調査や、効果を実証した研究は実施していません。
        </p>
        <Link href="/privacy" className="text-link">
          データの扱いを読む <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="document-section">
        <h2>投票先を決めるのは、あなたです。</h2>
        <p>
          オシセンは、特定の候補者への投票を推奨・依頼するサービスではありません。
          政策一致度は、限られた質問への回答の近さであり、候補者の優劣を示すものではありません。
        </p>
        <p>
          本番の掲載では、候補者本人の回答や一次情報を確認し、出典と確認日を示す方針です。
          現在の確認状況や公開前の準備項目は、情報源・公平性のページに掲載しています。
        </p>
        <Link href="/sources" className="text-link">
          情報源・公平性を読む <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="document-section">
        <h2>運営について</h2>
        <dl>
          <dt>プロジェクト</dt>
          <dd>オシセン / Phase 0</dd>
          <dt>運営主体・責任者</dt>
          <dd>未確定。公開前に明記します。</dd>
          <dt>問い合わせ・訂正窓口</dt>
          <dd>準備中。現在、このサイトに送信フォームや受付先はありません。</dd>
        </dl>
      </section>
    </main>
  );
}
