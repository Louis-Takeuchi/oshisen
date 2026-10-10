import { pageMetadata } from "../../lib/seo";
import Link from "next/link";
import { projectLabel } from "../../lib/project";

export const metadata = pageMetadata("/sources", {
  title: "情報源・掲載状況",
  description:
    "現在掲載している情報の出所、候補者情報・本人回答・Podcastの準備状況と、原資料の確認先を案内します。",
  index: true,
});

export default function SourcesPage() {
  return (
    <main id="main" className="container document-page">
      <p className="eyebrow">情報源・掲載状況</p>
      <h1>情報源・掲載状況</h1>
      <p className="lead">
        現在掲載している情報と、その出所・確認状況を案内します。
        掲載や編集に共通する方針は、中立性ポリシーにまとめています。
      </p>

      <section className="document-section">
        <h2>公開中の情報</h2>
        <p>
          {projectLabel}
          での実証に向けたプロトタイプです。候補者情報はまだ掲載していません。
        </p>
        <dl>
          <dt>政策の質問</dt>
          <dd>
            操作を試すための8問の草案を公開しています。制度・権限・文言の確認と事前テストを経て、本番の質問を確定する予定です。
          </dd>
          <dt>候補者の氏名・写真・経歴・政策回答</dt>
          <dd>
            現在は掲載準備中です。実在する候補者の情報と本人の回答を確認してから掲載します。
          </dd>
          <dt>Podcast・共通インタビュー</dt>
          <dd>
            取材はこれからです。収録済みの内容と誤解されないよう、現在は共通質問と掲載予定の形式を案内しています。
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
        <h2>原資料の確認先</h2>
        <p>
          政策の設問案は、各テーマのページに参考資料と確認状況を掲載しています。
          設問を作った理由や、公開前に確認する事項は質問台帳で確認できます。
        </p>
        <ul>
          <li>
            <Link href="/issues" className="text-link">
              政策テーマごとの設問案・出典 →
            </Link>
          </li>
          <li>
            <Link href="/policy-register" className="text-link">
              質問台帳・確認中の事項 →
            </Link>
          </li>
          <li>
            <Link href="/stories" className="text-link">
              共通インタビューの質問・掲載状況 →
            </Link>
          </li>
        </ul>
        <p>
          候補者の本人回答・インタビューは未掲載のため、回答原文、収録音声、文字起こしへのリンクはまだありません。
          掲載後は各回答・発言に添えた出典から確認できます。
        </p>
      </section>

      <section className="document-section">
        <h2>掲載・編集の方針とお問い合わせ</h2>
        <p>
          掲載対象、出典の扱い、質問、表示順、取材・編集に共通する基準は、中立性ポリシーをご参照ください。
        </p>
        <ul>
          <li>
            <Link href="/neutrality" className="text-link">
              中立性ポリシー →
            </Link>
          </li>
          <li>
            <Link href="/neutrality#section-13" className="text-link">
              確認・訂正・異議申立てに関する資料の案内 →
            </Link>
          </li>
          <li>
            <Link href="/about#contact" className="text-link">
              お問い合わせ →
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
