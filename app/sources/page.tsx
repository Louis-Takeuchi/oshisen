import { pageMetadata } from "../../lib/seo";
import Link from "next/link";
import { projectLabel } from "../../lib/project";

export const metadata = pageMetadata("/sources", {
  title: "情報源・掲載状況",
  description:
    "現在掲載している情報の出所、候補者情報・本人回答・インタビュー動画の準備状況と、原資料の確認先を案内します。",
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
            候補者の皆さんに送った質問と同じ「候補者送付版（2026年10月30日）」の8問（共通6問＋選挙区2問）を公開しています。文言は送付した原文のままです。
          </dd>
          <dt>候補者の氏名・写真・経歴・政策回答</dt>
          <dd>
            12月4日（告示日）の立候補届出の確認後、立候補届出順に一斉公開します。実在する候補者の情報と本人の回答を確認してから掲載します。
          </dd>
          <dt>インタビュー動画・共通質問</dt>
          <dd>
            候補者の皆さんへのインタビュー収録を進めています。動画は12月4日（告示日）以降、立候補届出順に公開します。収録前の方の発言は掲載しません。
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
          政策の質問は、1問ずつのページに「この質問の解説」（今どうなっているか・よい点・心配な点・ことば・出典）を、確認を終えたものから掲載します。
          質問の版の記録は質問台帳で確認できます。
        </p>
        <ul>
          <li>
            <Link href="/issues" className="text-link">
              政策の質問一覧（候補者送付版） →
            </Link>
          </li>
          <li>
            <Link href="/policy-register" className="text-link">
              質問台帳・版の記録 →
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
        <p>
          政策回答、人となり回答、インタビュー動画への参加状況はそれぞれ区別し、
          「未依頼」「依頼中」「未回答」「一部回答」「確認中」「公開済み」「本人から不参加の連絡」など、確認できた状態を表示します。
          連絡が取れないことを回答拒否とは扱わず、不参加の理由や未回答の政策的立場を推測しません。
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
            <Link href="/neutrality#outreach" className="text-link">
              ご案内の順序・回答期間について →
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
