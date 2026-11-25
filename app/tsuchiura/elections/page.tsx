import Link from "next/link";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { pageMetadata } from "../../../lib/seo";
import styles from "../../tsukuba/elections/guide.module.css";

const official = {
  city: "https://www.city.tsuchiura.lg.jp/shisei/senkyo/",
  kengisen2026:
    "https://www.city.tsuchiura.lg.jp/shisei/senkyo/news/page023365.html",
  system: "https://www.city.tsuchiura.lg.jp/shisei/senkyo/seido/",
  pollingPlaces: "https://www.city.tsuchiura.lg.jp/shisei/senkyo/page000765.html",
  earlyVoting:
    "https://www.city.tsuchiura.lg.jp/shisei/senkyo/tohyo-shoseido/page000761.html",
  results: "https://www.city.tsuchiura.lg.jp/shisei/senkyo/senkyonokiroku/",
  prefecture:
    "https://www.pref.ibaraki.jp/somu/shichoson/senkyo/senkan/index2.html",
  prefecturalElection:
    "https://www.pref.ibaraki.jp/somu/shichoson/senkyo/senkan/r8kengisen/r8kengi.html",
} as const;

export const metadata = pageMetadata("/tsuchiura/elections", {
  title: "土浦市の選挙ガイド｜日程・投票所・候補者情報の調べ方",
  description:
    "土浦市の選挙を調べる入口。市長選・市議選と茨城県議選の違い、2026年県議選の日程、投票所・期日前投票・候補者情報・選挙結果の公式確認先、政策の見比べ方を案内します。",
  index: true,
});

export default function TsuchiuraElectionsPage() {
  return (
    <main id="main" className={`container document-page ${styles.page}`}>
      <Breadcrumbs
        items={[
          { label: "オシセン", href: "/" },
          { label: "土浦市の選挙ガイド", href: "/tsuchiura/elections" },
        ]}
      />
      <p className="eyebrow">地域の選挙を調べる</p>
      <h1>
        土浦市の選挙ガイド
        <span className={styles.subtitle}>
          日程・投票所・候補者情報の調べ方
        </span>
      </h1>
      <p className="lead">
        土浦市で投票する選挙には、市長選挙・市議会議員選挙のほか、茨城県の選挙や国政選挙があります。
        調べたい選挙を確かめて、日程や投票方法の公式情報と、政策を考える材料へ進みましょう。
      </p>
      <p className={styles.byline}>
        <span>
          作成：<Link href="/about">オシセン（運営者情報）</Link>
        </span>
        <span>
          公式情報の確認日：<time dateTime="2026-11-25">2026年11月25日</time>
        </span>
      </p>

      <nav className={styles.contents} aria-label="このページの目次">
        <a href="#schedule">選挙の日程</a>
        <a href="#election-types">選挙の種類</a>
        <a href="#voting">投票所・期日前投票</a>
        <a href="#candidates">候補者・選挙公報</a>
        <a href="#results">選挙結果</a>
        <a href="#compare">政策の見比べ方</a>
      </nav>

      <section className="document-section" id="schedule">
        <h2>土浦市で行われる選挙の日程は？</h2>
        <p>
          土浦市は、2026年（令和8年）の茨城県議会議員一般選挙について、投票日を
          <strong>12月13日（日）</strong>
          、告示日（立候補届出日）を12月4日（金）と案内しています。
          市が案内する期日前投票の期間は12月5日（土）〜12月12日（土）です。会場ごとの受付時間は市の案内で確認してください。
        </p>
        <p>
          出典：
          <a href={official.kengisen2026} className="text-link">
            土浦市「令和8年12月13日（日曜日）は茨城県議会議員一般選挙の投票日です！」
          </a>
        </p>
        <p>
          この県議選は、土浦市長選挙・土浦市議会議員選挙とは別の選挙です。
          今後の選挙の告知は
          <a href={official.city} className="text-link">
            土浦市の選挙情報
          </a>
          と
          <a href={official.prefecture} className="text-link">
            茨城県選挙管理委員会
          </a>
          で確認できます。検索結果では、選挙名と実施年まで確かめましょう。
        </p>
        <div className={styles.notice}>
          <h3>当日の投票は18時までです</h3>
          <p>
            土浦市の案内では、今回の県議選の投票日当日の投票時間は午前7時から午後6時までです。
            期日前投票の受付時間とは異なるため、届いた投票所入場券と最新の市の案内を確認してください。
          </p>
          <a href={official.kengisen2026} className="text-link">
            土浦市の今回の選挙の案内を見る
          </a>
        </div>
      </section>

      <section className="document-section" id="election-types">
        <h2>市長選・市議選・県議選は何が違う？</h2>
        <p>
          「土浦市の選挙」という言葉だけでは、どの役職を選ぶ選挙かは決まりません。
          まず正式な選挙名を確認すると、候補者情報や結果を取り違えずに探せます。
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption>土浦市で投票する主な選挙と選ぶ人</caption>
            <thead>
              <tr>
                <th scope="col">選挙の名前</th>
                <th scope="col">選ぶ人</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">土浦市長選挙</th>
                <td>土浦市の市長</td>
              </tr>
              <tr>
                <th scope="row">土浦市議会議員選挙</th>
                <td>土浦市議会の議員</td>
              </tr>
              <tr>
                <th scope="row">茨城県知事選挙</th>
                <td>茨城県の知事</td>
              </tr>
              <tr>
                <th scope="row">茨城県議会議員選挙</th>
                <td>
                  茨城県議会の議員。オシセンの対象は、つくば市選挙区・土浦市選挙区です。
                </td>
              </tr>
              <tr>
                <th scope="row">衆議院議員選挙・参議院議員選挙</th>
                <td>国会の議員</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          選挙の種類や投票できる条件は、
          <a href={official.system} className="text-link">
            土浦市「選挙制度と投票の方法」
          </a>
          にまとまっています。住所を移した場合などは、選挙の種類によって確認する条件が異なります。
        </p>
      </section>

      <section className="document-section" id="voting">
        <h2>投票所・期日前投票はどこで確認する？</h2>
        <h3>投票日当日の投票所</h3>
        <p>
          当日は、投票所入場券に書かれた投票所を確認します。
          市の「投票区及び投票所」では、投票所の場所と対象地区を調べられます。
          投票所が変わる地区もあるため、過去の案内をそのまま使わず、今回の入場券と照らし合わせましょう。
        </p>
        <a href={official.pollingPlaces} className="text-link">
          土浦市「投票区及び投票所」を見る →
        </a>
        <h3>学校・仕事・旅行などで当日に行けない場合</h3>
        <p>
          投票日に学業や仕事などの予定がある場合には、期日前投票という方法があります。
          会場・開設日・受付時間は、今回の選挙の案内や投票所入場券で確認してください。
          土浦市外に滞在している場合の不在者投票や、投票の際の支援についても、市の案内から確認できます。
        </p>
        <a href={official.earlyVoting} className="text-link">
          土浦市「期日前投票」を確認する →
        </a>
        <p>
          18歳を迎える高校生や、初めて投票する方には、
          <Link href="/guides/high-school-election" className="text-link">
            高校生と選挙のガイド
          </Link>
          でも、選挙権や情報の調べ方を紹介しています。
        </p>
      </section>

      <section className="document-section" id="candidates">
        <h2>候補者情報・選挙公報を探す</h2>
        <p>
          まず市・県の選挙ページで、対象の選挙名・実施年・選挙区を確かめます。
          候補者一覧や選挙公報が公開されたら、その選挙のページから確認しましょう。
          過去の立候補歴や、立候補予定という報道だけで、今回の正式な候補者一覧を判断しないことが大切です。
        </p>
        <div className={styles.links}>
          <a href={official.kengisen2026}>土浦市の今回の選挙の案内 →</a>
          <a href={official.prefecturalElection}>
            2026年茨城県議選の公式情報 →
          </a>
        </div>
        <p>
          候補者本人のサイトや発言を読むときも、公開日・対象の選挙・元の文章や動画を確認します。
          短い切り抜きだけでは分からない、条件や理由まで読むと、政策の違いを整理しやすくなります。
        </p>
      </section>

      <section className="document-section" id="results">
        <h2>土浦市の選挙結果・投票率を調べる</h2>
        <p>
          土浦市の「選挙の記録」から、各選挙の結果を確認できます。
          得票数や投票率を比べるときは、実施日と集計対象をそろえ、速報か確定結果かも確認しましょう。
        </p>
        <a href={official.results} className="text-link">
          土浦市「選挙の記録」で結果を調べる →
        </a>
      </section>

      <section className="document-section" id="compare">
        <h2>土浦の暮らしから、政策を見比べる</h2>
        <p>
          路線バス、桜川の氾濫対策、霞ヶ浦の水質など、気になることを入口にして、候補者の考えを同じ項目で整理してみましょう。
          市と県のどちらが関わる政策なのかを確かめることも、地域の選挙を考える手がかりになります。
        </p>
        <ol>
          <li>
            <strong>知りたいテーマを決める。</strong>
            通学・通勤の移動など、暮らしの中で気になることを言葉にします。
          </li>
          <li>
            <strong>本人の一次情報を読む。</strong>
            選挙公報や公式サイト、発言の全文から、そのテーマについての説明を探します。
          </li>
          <li>
            <strong>理由と実現の条件を比べる。</strong>
            何を変えるのか、なぜ必要なのか、誰が担うのか、予算や時期はどう考えているのかを整理します。
          </li>
          <li>
            <strong>分からない部分を残す。</strong>
            説明が見つからないことと、反対していることは別です。推測で回答を埋めず、確認したいこととして残します。
          </li>
        </ol>
        <p>
          オシセンでは、2026年茨城県議選・土浦市選挙区に向けて、候補者に送った政策の質問（共通6問＋土浦市の2問）を公開しています。
          候補者の回答とインタビュー動画は、12月4日（告示日）以降、立候補届出順に公開します。
          利用者が自分で投票について考えられるよう、政策の問いと情報の見方を紹介しています。
        </p>
        <div className={styles.links}>
          <Link href="/ibaraki-2026/tsuchiura">
            2026年茨城県議選・土浦市選挙区の取り組み →
          </Link>
          <Link href="/tsukuba/elections">つくば市の選挙ガイド →</Link>
          <Link href="/issues">政策の質問一覧 →</Link>
          <Link href="/method">政策回答の比較方法 →</Link>
          <Link href="/sources">情報源・掲載状況 →</Link>
          <Link href="/neutrality">中立性ポリシー →</Link>
        </div>
      </section>
    </main>
  );
}
