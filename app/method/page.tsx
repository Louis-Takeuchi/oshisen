import { pageMetadata } from "../../lib/seo";
import Link from "next/link";

export const metadata = pageMetadata("/method", {
  title: "政策回答の照合と情報の見方",
  description:
    "政策の回答を一問ずつ照合する仕組み、質問の版、判断保留・未回答・出典の扱いを説明します。現在は自分の回答を質問ごとに見返せます。",
  index: true,
});

export default function MethodPage() {
  return (
    <main id="main" className="container document-page">
      <p className="eyebrow">回答と情報の見方</p>
      <h1>回答の比較方法</h1>
      <p className="lead">
        現在のサイトでの回答方法と、情報の読み方を説明します。
        掲載・比較・編集に関する共通の基準は、中立性ポリシーをご参照ください。
      </p>

      <p>
        <Link href="/neutrality" className="text-link">
          中立性ポリシー →
        </Link>
      </p>
      <p>
        現在は8問の草案に回答し、自分の考えを見返せます。候補者の本人回答は掲載準備中です。
        <Link href="/sources" className="text-link">
          情報源・掲載状況を見る →
        </Link>
      </p>

      <section className="document-section" id="calculation">
        <h2>質問ごとの回答比較</h2>
        <p>
          同じ質問文・条件・選択肢・補足説明の版に対する回答を並べます。
          公開できる本人回答を確認したうえで、選択肢が同じなら「同じ回答」、異なれば「違う回答」と表示します。
          現在は、利用者自身が考えを確かめられるよう、回答を一問ずつ見返す機能を公開しています。
        </p>
        <p>
          「同じ回答」は、その一問で同じ選択肢を選んだという意味です。
          回答の意味が広く受け取られすぎないよう、比較の対象をその質問の選択肢に限定しています。理由や条件は、本人回答の掲載時に添える予定です。
          一問だけ回答した場合も、その一問の原回答として扱います。
        </p>
        <ul>
          <li>
            同じ条件で比較できるよう、質問や説明の版が一致する回答だけを照合対象にしています。
          </li>
          <li>
            過去の発言が今回の回答と混同されないよう、掲載時には本人から得た回答と公開資料の引用を区別します。
          </li>
          <li>理由・条件・出典を、回答と一緒に確認できる形にします。</li>
        </ul>
      </section>

      <section className="document-section">
        <h2>判断保留・未回答の扱い</h2>
        <p>
          回答は「賛成」から「反対」までの5段階です。
          真ん中の「賛成でも反対でもない」は、ひとつの回答です。
          「今は判断できない」や、質問を飛ばす「スキップ」とは分けます。
        </p>
        <dl>
          <dt>賛成でも反対でもない</dt>
          <dd>中立の立場を選んだ回答です。</dd>
          <dt>今は判断できない</dt>
          <dd>
            判断を保留した状態です。情報不足か、考えがまとまっていないかは任意で残せます。
          </dd>
          <dt>スキップ</dt>
          <dd>この質問への回答を飛ばした状態です。</dd>
          <dt>候補者の未回答・確認中</dt>
          <dd>
            本人の立場と誤解されないよう、掲載時には「未回答」と「公開前の確認中」を区別して示します。
          </dd>
        </dl>
      </section>

      <section className="document-section" id="comparison">
        <h2>取り扱う情報の種類</h2>
        <dl>
          <dt>P：政策への回答</dt>
          <dd>候補者と利用者に同じ問いを尋ね、一問ずつ見比べます。</dd>
          <dt>H：本人の話</dt>
          <dd>
            共通インタビューから、経験・選択・本人が述べた理由・条件を整理します。
          </dd>
          <dt>N：知りたいこと</dt>
          <dd>
            利用者が選ぶ最大3テーマや情報の種類を、見る場所への案内に使います。
          </dd>
        </dl>
        <p>
          本人の話は、経験や判断の背景を知るための情報として紹介する予定です。
          利用者の関心は関連ページへの案内に使い、候補者の表示順には全員共通の基準を設けています。
        </p>
        <Link href="/interests" className="text-link">
          知りたいことから見る →
        </Link>
      </section>

      <section className="document-section">
        <h2>インタビューの構成と出典</h2>
        <p>
          取材では共通の6問を使い、必要に応じて具体的な場面や条件を聞きます。
          公開時は「経験・選択・理由・条件」を整理し、本人の引用、前後の文字起こし、Podcastの該当箇所と全編につなぎます。
        </p>
        <p>
          引用と編集部の要約は区別します。「本人がそう語ったこと」と、その出来事を外部資料で確認できたことも別です。
          言及の有無が経験そのものの有無と混同されないよう、掲載時には「今回の回答では言及なし」と表示します。
        </p>
        <Link href="/stories" className="text-link">
          共通の質問を見る →
        </Link>
      </section>

      <section className="document-section" id="display-order">
        <h2>候補者の表示順の確認</h2>
        <p>
          一覧・検索・比較・保存した候補者・本人の話は、選挙区ごとに同じ順序で表示します。
          立候補届出順を確認できた選挙区は、選挙管理委員会の公式資料に基づいて並べます。
          各画面の表示順の案内から、根拠となる資料と確認日を確認できます。
        </p>
        <p>
          公式の届出順の公表・確認前は、その選挙区内を氏名の読みの五十音順で仮表示し、その旨を明記します。
          一部の候補者だけ届出順を確認できた場合も、選挙区内の掲載候補者全員を確認するまでは仮表示を続けます。
          検索や保存・比較の選択で候補者を絞っても、元の順序を保ちます。
        </p>
        <p>
          複数の選挙区を表示する場合は、この企画の対象地域の案内順（つくば市選挙区、土浦市選挙区）にまとめます。
        </p>
        <Link href="/neutrality#section-7" className="text-link">
          表示順と紹介機会の方針 →
        </Link>
      </section>

      <section className="document-section">
        <h2>質問・研究の詳しい情報</h2>
        <ul>
          <li>
            <Link href="/policy-register" className="text-link">
              設問の採用理由・版・確認中の事項 →
            </Link>
          </li>
          <li>
            <Link href="/research" className="text-link">
              表示方法の研究・準備状況 →
            </Link>
          </li>
        </ul>
      </section>

      <section className="document-section">
        <h2>方針とお問い合わせ</h2>
        <ul>
          <li>
            <Link href="/neutrality#section-8" className="text-link">
              取材・編集の共通基準 →
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
