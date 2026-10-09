import Link from "next/link";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { electionHubPath } from "../../../lib/issue-content";
import { project, projectDistrictLabel } from "../../../lib/project";
import { pageMetadata } from "../../../lib/seo";
import { teamMembers } from "../../../lib/team";
import styles from "./guide.module.css";

export const metadata = pageMetadata("/guides/high-school-election", {
  title: "高校生と選挙｜18歳からの投票・政策の調べ方",
  description:
    "高校生は何歳から選挙で投票できる？18歳選挙権と選挙人名簿、期日前投票、18歳未満からできる学び、政策を読む手順を公的情報とともに紹介。つくば市の選挙を知る入口も案内します。",
  index: true,
});

const sources = {
  eligibility:
    "https://www.pref.ibaraki.jp/somu/shichoson/senkyo/senkan/shikumi/shikumi-1.html",
  system: "https://www.city.tsukuba.lg.jp/shisei/senkyo/1002454.html",
  questions:
    "https://www.city.tsukuba.lg.jp/soshikikarasagasu/senkyokanriiinkaijimukyoku/gyomuannai/1/1/1018315.html",
  voting:
    "https://www.pref.ibaraki.jp/somu/shichoson/senkyo/senkan/qa/touhyou.html",
  beforeEighteen: "https://www.town.ibaraki-yachiyo.lg.jp/page/page000590.html",
};

export default function HighSchoolElectionPage() {
  return (
    <main id="main" className={`container document-page ${styles.page}`}>
      <Breadcrumbs
        items={[
          { label: "オシセン", href: "/" },
          {
            label: "高校生と選挙",
            href: "/guides/high-school-election",
          },
        ]}
      />
      <p className="eyebrow">はじめて選挙を調べる人へ</p>
      <h1>
        高校生と選挙
        <span className={styles.subtitle}>18歳からの投票と、政策の調べ方</span>
      </h1>
      <p className="lead">
        「高校生でも投票できる？」「候補者の政策は、どこから読めばいい？」
        選挙を知るための基本と、自分の考えを整理する手順をまとめました。
        まだ投票できる年齢でなくても、身近なテーマから学び始められます。
      </p>

      <nav className={styles.contents} aria-label="このページの目次">
        <a href="#eligibility">高校生は投票できる？</a>
        <a href="#voting">はじめての投票の疑問</a>
        <a href="#before-eighteen">18歳未満からできること</a>
        <a href="#reading-policies">政策を読む4つの手順</a>
        <a href="#oshisen">つくば市・土浦市とオシセン</a>
      </nav>

      <section className="document-section" aria-labelledby="eligibility">
        <h2 id="eligibility">高校生は何歳から選挙で投票できる？</h2>
        <div className={styles.answer}>
          <strong>
            高校生でも、満18歳以上で選挙権があり、選挙人名簿に登録されていれば投票できます。
          </strong>
          <p>
            高校を卒業したかどうかではなく、年齢・国籍・住所などの条件で決まります。
            選挙権は満18歳以上の日本国民に認められ、地方選挙には住所の要件もあります。
            詳細は<a href={sources.system}>つくば市「選挙のしくみ」</a>
            で確認できます。
          </p>
        </div>
        <p>
          投票には「選挙人名簿」への登録が必要です。登録には、住民票が作成された日
          （転入した場合は転入届をした日）から、同じ市区町村の住民基本台帳に引き続き3か月以上登録されていることなどの条件があります。
          <a href={sources.eligibility}>茨城県「18歳になったら投票できる？」</a>
          が登録の基本を説明しています。
        </p>
        <p>
          誕生日が投票日の近くにある人や、進学などで引っ越した人は、
          対象となる生年月日と登録先を、その選挙の公式案内で確かめてください。
          引っ越した場合の扱いは選挙の種類によって異なります。
          <a href={sources.questions}>つくば市の投票に関するQ&A</a>
          にも案内があります。
        </p>
      </section>

      <section className="document-section" aria-labelledby="voting">
        <h2 id="voting">はじめての投票で気になること</h2>
        <h3>投票日に学校などの予定があるときは？</h3>
        <p>
          学業や仕事、旅行などで投票日に投票所へ行けない場合は、期日前投票を利用できます。
          受付期間・場所・時間は選挙や投票所ごとに確認します。
          <a href={sources.system}>つくば市の期日前投票の案内</a>
          を参照してください。
        </p>
        <p>
          選挙の投票日には満18歳になるものの、投票しようとする時点では17歳の場合は、
          期日前投票ではなく不在者投票の方法になります。
          <a href={sources.beforeEighteen}>八千代町の不在者投票の説明</a>
          にもこの区別が掲載されています。手続きや受付場所は、自分の選挙人名簿がある自治体に確認してください。
        </p>

        <h3>投票所の入場券をなくしてしまったら？</h3>
        <p>
          入場券が届いていなかったり、なくしたりしても、選挙人名簿に登録されていれば投票できます。
          つくば市は、本人であることを確認できるものを持参し、投票所の係員に申し出るよう案内しています。
          <a href={sources.system}>つくば市の入場券に関する説明</a>
          で確認できます。
        </p>

        <h3>初めてで手順が分からないときは？</h3>
        <p>
          入場券や自治体の案内で、自分の投票所と開設時間を確かめます。
          当日は受付の係員に、初めてで手順を確認したいことを伝えられます。
          文字を書くことなどに支援が必要な場合は、代理投票などの制度があります。
          <a href={sources.system}>つくば市の投票支援の案内</a>
          も参考にしてください。
        </p>
      </section>

      <section className="document-section" aria-labelledby="before-eighteen">
        <h2 id="before-eighteen">18歳未満の高校生が、選挙を学ぶには</h2>
        <p>
          まずは通学の交通、学校での学び、地域の施設など、気になることを一つ選んでみます。
          自治体の説明や議会の記録を読んだり、授業で扱ったテーマを調べたりすると、
          身近な出来事と政策のつながりが見えてきます。
        </p>
        <p>
          自分の考えをメモし、友人や家族がどう考えているかを聞くことも、学ぶきっかけになります。
          意見が違ったら、結論だけでなく「何を大切にしているのか」「どの情報を見たのか」を尋ねてみましょう。
          分からない点は、すぐに賛成・反対を決めず、調べたいこととして残せます。
        </p>
        <p>
          投票する人に同伴する18歳未満の子どもは、投票所に入ることができます。
          家族などと一緒に投票所の流れを知る機会にもなります。
          <a href={sources.questions}>
            つくば市のQ&A「投票所にこどもを連れて行くことは可能ですか」
          </a>
          に案内があります。
        </p>
      </section>

      <section className="document-section" aria-labelledby="reading-policies">
        <h2 id="reading-policies">候補者の政策を読む、4つの手順</h2>
        <p>
          全部の政策を一度に理解する必要はありません。一つのテーマを、同じ観点で見比べるところから始められます。
        </p>
        <ol className={styles.steps}>
          <li>
            <h3>身近な疑問を、具体的にする</h3>
            <p>
              「交通が気になる」から「帰宅する時間帯に、どんな移動手段があるとよいか」へ。
              自分が知りたいことを短い文章にします。
            </p>
          </li>
          <li>
            <h3>誰が、何を決める選挙かを確かめる</h3>
            <p>
              市長・市議会、県知事・県議会、国会議員では役割が異なります。
              気になる政策について、国・県・市などのどこが担当し、誰との協力が必要なのかを調べます。
            </p>
          </li>
          <li>
            <h3>選挙公報や本人の説明を、同じ問いで読む</h3>
            <p>
              「何をするのか」「なぜ必要か」「費用や実施時期は」「どんな条件があるか」を確認します。
              選挙公報は候補者の政見や経歴を知るための資料です。 茨城県は
              <a href={sources.voting}>公式サイトでの選挙公報の掲載</a>
              を案内しています。
              公開されたら、各候補者の説明に同じ問いを当ててみます。
            </p>
          </li>
          <li>
            <h3>元の情報を確かめ、分からない点も残す</h3>
            <p>
              短い動画や要約で気になった発言は、元の資料や発言全体、公開された日付を確認します。
              回答が見つからないときは「不明」と記録し、賛成・反対を推測で補いません。
              自分と同じ結論でも、理由や条件が同じとは限りません。
            </p>
          </li>
        </ol>
        <Link href="/sources" className="text-link">
          オシセンの情報源・公平性の方針を見る →
        </Link>
      </section>

      <section className="document-section" aria-labelledby="oshisen">
        <h2 id="oshisen">つくば市・土浦市の政治家を知る入口として</h2>
        <p>
          オシセンは、{project.electionYear}年の{project.electionName}・
          {projectDistrictLabel}
          を対象に、政策への回答と本人へのインタビューを伝える準備を進めています。
          現在公開しているのは、政策の設問案や情報の見方、掲載方針です。
          候補者情報・本人回答は未掲載で、Podcast取材も準備中です。
        </p>
        <p>
          いまは、<Link href="/issues">政策の8つのテーマと設問案</Link>
          を、自分が何を知りたいか整理するきっかけとして読めます。
          設問は検討中の草案で、制度や出典は確認中です。
          オシセンは候補者に総合点や順位をつけず、特定の候補者への投票を勧めません。
        </p>
        <p>
          運営は
          {teamMembers
            .map((member) => `${member.role}の${member.fullName}`)
            .join("と")}
          です。
          <Link href="/about#team">担当業務と運営メンバーの紹介</Link>
          を公開しています。
        </p>
        <div className={styles.relatedLinks}>
          <Link href="/tsukuba/elections">
            つくば市の選挙・投票情報を調べる →
          </Link>
          <Link href={electionHubPath}>
            2026年 茨城県議選・つくば市選挙区のプロジェクト →
          </Link>
        </div>
      </section>
    </main>
  );
}
