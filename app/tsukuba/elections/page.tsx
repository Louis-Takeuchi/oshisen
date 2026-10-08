import Link from "next/link";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { electionHubPath } from "../../../lib/issue-content";
import { pageMetadata } from "../../../lib/seo";
import styles from "./guide.module.css";

const official = {
  city: "https://www.city.tsukuba.lg.jp/shisei/senkyo/index.html",
  system: "https://www.city.tsukuba.lg.jp/shisei/senkyo/1002454.html",
  pollingPlaces: "https://www.city.tsukuba.lg.jp/shisei/senkyo/1002455.html",
  pollingHours: "https://www.city.tsukuba.lg.jp/shisei/senkyo/29440.html",
  results:
    "https://www.city.tsukuba.lg.jp/shisei/senkyo/kakonosenkyo/index.html",
  prefecture:
    "https://www.pref.ibaraki.jp/somu/shichoson/senkyo/senkan/index2.html",
  prefecturalElection:
    "https://www.pref.ibaraki.jp/somu/shichoson/senkyo/senkan/r8kengisen/r8kengi.html",
} as const;

export const metadata = pageMetadata("/tsukuba/elections", {
  title: "つくば市の選挙ガイド｜日程・投票所・候補者情報の調べ方",
  description:
    "つくば市の選挙を調べる入口。市長選・市議選と茨城県議選の違い、2026年県議選の日程、投票所・期日前投票・候補者情報・選挙結果の公式確認先、政策の見比べ方を案内します。",
  index: true,
});

export default function TsukubaElectionsPage() {
  return (
    <main id="main" className={`container document-page ${styles.page}`}>
      <Breadcrumbs
        items={[
          { label: "オシセン", href: "/" },
          { label: "つくば市の選挙ガイド", href: "/tsukuba/elections" },
        ]}
      />
      <p className="eyebrow">地域の選挙を調べる</p>
      <h1>
        つくば市の選挙ガイド
        <span className={styles.subtitle}>
          日程・投票所・候補者情報の調べ方
        </span>
      </h1>
      <p className="lead">
        つくば市で投票する選挙には、市長選挙・市議会議員選挙のほか、茨城県の選挙や国政選挙があります。
        調べたい選挙を確かめて、日程や投票方法の公式情報と、政策を考える材料へ進みましょう。
      </p>
      <p className={styles.byline}>
        <span>
          作成：<Link href="/about">オシセン（運営者情報）</Link>
        </span>
        <span>
          公式情報の確認日：<time dateTime="2026-10-08">2026年10月8日</time>
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
        <h2>つくば市で行われる選挙の日程は？</h2>
        <p>
          茨城県選挙管理委員会は、2026年の茨城県議会議員一般選挙の投票日を
          <strong>12月13日（日）</strong>と案内しています。
          県が案内する期日前投票の期間は12月5日（土）〜12月12日（土）ですが、一部の投票所では異なります。
          つくば市内の会場ごとの日程・時間は、市が公表する今回の選挙の案内で確認してください。
        </p>
        <p>
          出典：
          <a href={official.prefecturalElection} className="text-link">
            茨城県「2026年茨城県議会議員一般選挙 各種情報」
          </a>
        </p>
        <p>
          この県議選は、つくば市長選挙・つくば市議会議員選挙とは別の選挙です。
          今後の選挙の告知は
          <a href={official.city} className="text-link">
            つくば市の選挙情報
          </a>
          と
          <a href={official.prefecture} className="text-link">
            茨城県選挙管理委員会
          </a>
          で確認できます。検索結果では、選挙名と実施年まで確かめましょう。
        </p>
        <div className={styles.notice}>
          <h3>つくば市の当日投票は、終了時刻の変更に注意</h3>
          <p>
            つくば市は、2026年度以降に行う選挙から、市内のすべての当日投票所の終了時刻を18時に変更する方針を公表しています。
            期日前投票の時間とは異なるため、届いた投票所入場整理券と最新の市の案内を確認してください。
          </p>
          <a href={official.pollingHours} className="text-link">
            つくば市「投票日当日の投票終了時刻を18時に変更します」
          </a>
        </div>
      </section>

      <section className="document-section" id="election-types">
        <h2>市長選・市議選・県議選は何が違う？</h2>
        <p>
          「つくば市の選挙」という言葉だけでは、どの役職を選ぶ選挙かは決まりません。
          まず正式な選挙名を確認すると、候補者情報や結果を取り違えずに探せます。
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption>つくば市で投票する主な選挙と選ぶ人</caption>
            <thead>
              <tr>
                <th scope="col">選挙の名前</th>
                <th scope="col">選ぶ人</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">つくば市長選挙</th>
                <td>つくば市の市長</td>
              </tr>
              <tr>
                <th scope="row">つくば市議会議員選挙</th>
                <td>つくば市議会の議員</td>
              </tr>
              <tr>
                <th scope="row">茨城県知事選挙</th>
                <td>茨城県の知事</td>
              </tr>
              <tr>
                <th scope="row">茨城県議会議員選挙</th>
                <td>
                  茨城県議会の議員。オシセンの対象は、つくば市選挙区です。
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
            つくば市「選挙のしくみ」
          </a>
          にまとまっています。住所を移した場合などは、選挙の種類によって確認する条件が異なります。
        </p>
      </section>

      <section className="document-section" id="voting">
        <h2>投票所・期日前投票はどこで確認する？</h2>
        <h3>投票日当日の投票所</h3>
        <p>
          当日は、投票所入場整理券に書かれた投票所を確認します。
          市の投票所一覧では、投票所の住所と対象地区を調べられます。
          過去の選挙の案内をそのまま使わず、今回の入場整理券と照らし合わせましょう。
        </p>
        <a href={official.pollingPlaces} className="text-link">
          つくば市「投票所一覧」を見る →
        </a>
        <h3>学校・仕事・旅行などで当日に行けない場合</h3>
        <p>
          投票日に学業や仕事などの予定がある場合には、期日前投票という方法があります。
          会場・開設日・受付時間は、今回の選挙の案内や投票所入場整理券で確認してください。
          つくば市外に滞在している場合の不在者投票や、投票の際の支援についても、市の案内から確認できます。
        </p>
        <a href={official.system} className="text-link">
          つくば市「選挙のしくみ」で投票方法を確認する →
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
          <a href={official.city}>つくば市の選挙情報 →</a>
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
        <h2>つくば市の選挙結果・投票率を調べる</h2>
        <p>
          つくば市の「過去の選挙」から、各選挙の結果を確認できます。
          2024年10月27日の市長選・市議選、2025年9月7日の県議会議員つくば市選挙区補欠選挙などは、別々の記録です。
          得票数や投票率を比べるときは、実施日と集計対象をそろえ、速報か確定結果かも確認しましょう。
        </p>
        <a href={official.results} className="text-link">
          つくば市「過去の選挙」で結果を調べる →
        </a>
      </section>

      <section className="document-section" id="compare">
        <h2>つくばの暮らしから、政策を見比べる</h2>
        <p>
          公共交通、教育、子育てなど、気になることを入口にして、候補者の考えを同じ項目で整理してみましょう。
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
          オシセンでは、2026年茨城県議選・つくば市選挙区に向けて、8つのテーマの設問案と掲載方針を公開しています。
          候補者情報・本人回答・Podcastは取材と掲載の準備中です。
          特定の候補者を推薦せず、利用者が自分で考えるための材料を整えることを目指しています。
        </p>
        <div className={styles.links}>
          <Link href={electionHubPath}>
            2026年茨城県議選・つくば市選挙区の取り組み →
          </Link>
          <Link href="/issues">政策の8テーマと設問案 →</Link>
          <Link href="/method">政策回答の比較方法 →</Link>
          <Link href="/sources">情報源・公平性・掲載方針 →</Link>
        </div>
      </section>
    </main>
  );
}
