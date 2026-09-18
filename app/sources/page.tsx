import type { Metadata } from "next";
import Link from "next/link";
import { projectLabel } from "../../lib/project";
import { contactEmail, contactMailto } from "../../lib/site-contact";

export const metadata: Metadata = {
  title: "情報源・公平性",
  description:
    "候補者情報の掲載状況、元の発言への導線、本人回答・引用・編集部要約の区別、掲載と確認の方針を公開します。",
};

export default function SourcesPage() {
  return (
    <main id="main" className="container document-page">
      <p className="eyebrow">情報源・公平性</p>
      <h1>
        その話の、
        <br />
        もとまでたどる。
      </h1>
      <p className="lead">
        誰が、いつ、どんな場面で話したのか。
        短く読む入口から、発言の前後まで戻れるようにします。
      </p>

      <section className="document-section">
        <h2>いま掲載しているもの</h2>
        <p>
          {projectLabel}
          での実証に向けたプロトタイプです。候補者情報はまだ掲載していません。
        </p>
        <dl>
          <dt>政策の質問</dt>
          <dd>
            操作を試すための8問の草案です。制度・権限・文言の確認と事前テストを終えた確定質問ではありません。
          </dd>
          <dt>候補者の氏名・写真・経歴・政策回答</dt>
          <dd>未掲載です。仮名の候補者や、架空の回答で補いません。</dd>
          <dt>Podcast・共通インタビュー</dt>
          <dd>
            取材はこれからです。共通質問と掲載の形式を準備しています。本人の発言や収録済みのような見せ方は作りません。
          </dd>
          <dt>候補者の公式サイト・SNS・選挙公報</dt>
          <dd>
            リンクは未登録です。確認した一次情報を、取材内容と区別して掲載する方針です。
          </dd>
          <dt>運営メンバーの写真・プロフィール</dt>
          <dd>
            運営者が提供した写真・担当情報・本人の回答を掲載しています。候補者情報とは別です。
          </dd>
          <dt>オシセンの公式SNS・問い合わせ先</dt>
          <dd>
            運営者が案内した公式Instagram・Xとメールアドレスを掲載しています。
            <Link href="/about#contact" className="text-link">
              公式SNS・お問い合わせを見る →
            </Link>
          </dd>
        </dl>
      </section>

      <section className="document-section">
        <h2>本人のことばと、編集した文章を分ける。</h2>
        <ul>
          <li>本人回答、本人の回顧、公式記録、編集部要約を区別します。</li>
          <li>
            引用には元の発言区間を、要約には確認できる原文を結び付けます。
          </li>
          <li>
            経験・選択・本人が挙げた理由・条件を残し、性格を推測して書き足しません。
          </li>
          <li>
            短い要点だけでなく、前後の文字起こし、Podcastの該当箇所と全編へ進めるようにします。
          </li>
          <li>
            今回の回答で語られなかった内容を「その経験がない」とは扱いません。
          </li>
        </ul>
        <p>
          本人がそのように説明したことと、出来事を独立した資料で確認できたことは別です。
          「本人確認済み」の一言で、すべての事実を検証済みとはしません。
        </p>
      </section>

      <section className="document-section">
        <h2>同じ問いを、同じ条件で。</h2>
        <ul>
          <li>政策は、同じ版の質問文・条件・選択肢・補足説明で尋ねます。</li>
          <li>
            インタビューは、共通6問と追加質問の方針、収録・確認条件をそろえます。
          </li>
          <li>回答は一問ずつ示し、総合一致率や人物の順位にはまとめません。</li>
          <li>
            通常の候補者一覧・比較は五十音順を基本とし、好みや閲覧履歴による優先表示はしません。
          </li>
          <li>
            未回答、確認中、版の不一致を分け、過去の発言から回答を補いません。
          </li>
          <li>同じ掲載項目を使い、取得できない情報も共通の形式で示します。</li>
        </ul>
        <p>
          オシセンは、特定の候補者への投票を推奨・依頼するサービスではありません。
        </p>
        <Link href="/method" className="text-link">
          回答と情報の見方を読む →
        </Link>
      </section>

      <section className="document-section">
        <h2>取材後に、公開まで確認すること。</h2>
        <p>
          収録から文字起こしを作り、原音と照合します。要点を整理した後は、別担当者が文脈を確認し、本人にも発言趣旨の確認を依頼する計画です。
          AIを下書きに使う場合も、原文・原音の確認を省略せず、承認済みの版だけを公開します。
        </p>
        <p>
          収録日・回答日・公開版、確認の種類、訂正・追記を記録します。
          掲載対象の確定基準、依頼と確認の担当、更新頻度、訂正手順、管理責任者は正式公開前に決めます。
          研究の効果は未検証です。
        </p>
        <Link href="/research" className="text-link">
          研究と編集の準備を見る →
        </Link>
      </section>

      <section className="document-section">
        <h2>お問い合わせ・訂正依頼</h2>
        <p>
          ご連絡は{" "}
          <a href={contactMailto} className="text-link">
            {contactEmail}
          </a>{" "}
          へ。
          対象ページのURLと該当箇所、確認できる資料があればそのURLをお知らせください。
          政策回答や投票先など、お問い合わせに不要な情報は記載しないでください。
        </p>
        <Link href="/about#contact" className="text-link">
          運営情報・お問い合わせを見る →
        </Link>
      </section>
    </main>
  );
}
