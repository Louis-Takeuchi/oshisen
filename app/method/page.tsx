import type { Metadata } from "next";
import Link from "next/link";
import { projectLabel } from "../../lib/project";
import { contactEmail, contactMailto } from "../../lib/site-contact";

export const metadata: Metadata = {
  title: "回答と情報の見方",
  description:
    "政策は一問ずつ照合し、経験・判断理由は元の発言へつなぎます。質問の版、判断保留、未回答、出典の扱いを説明します。",
};

export default function MethodPage() {
  return (
    <main id="main" className="container document-page">
      <p className="eyebrow">回答と情報の見方</p>
      <h1>
        同じ答え。
        <br />
        でも、理由も同じ？
      </h1>
      <p className="lead">
        政策への回答は、一問ずつ。その理由や経験は、本人の発言から。
        どこまで分かり、何がまだ分からないのかも示します。
      </p>

      <section className="document-section">
        <h2>いまは、取材・掲載の準備中です。</h2>
        <p>
          {projectLabel}
          を対象に準備しています。候補者情報・本人回答は未掲載で、Podcast取材も未実施です。
          現在の8問は操作を試すための草案です。制度や県の権限、用語を確認し、事前テストを経て確定します。
        </p>
        <Link href="/policy-register" className="text-link">
          質問台帳を見る →
        </Link>
      </section>

      <section className="document-section" id="calculation">
        <h2>回答を、一問ずつ見比べる。</h2>
        <p>
          同じ質問文・条件・選択肢・補足説明の版に対する回答を並べます。
          公開できる本人回答を確認したうえで、選択肢が同じなら「同じ回答」、異なれば「違う回答」と表示します。
          総合一致率や候補者の順位にはまとめません。
        </p>
        <p>
          「同じ回答」は、その一問で同じ選択肢を選んだという意味です。
          理由や将来の行動、人となりまで同じだという意味ではありません。
          一問だけ回答した場合も、その一問の原回答として扱います。
        </p>
        <ul>
          <li>質問や説明の版が違う回答は、自動で照合しません。</li>
          <li>
            過去の発言や公開資料から、今回の本人回答を推測して埋めません。
          </li>
          <li>理由・条件・出典を、回答と一緒に確認できる形にします。</li>
        </ul>
      </section>

      <section className="document-section">
        <h2>「分からない」を、賛否に置き換えない。</h2>
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
            本人の回答がない状態と、公開前の確認中を分けます。中立の回答にはしません。
          </dd>
        </dl>
      </section>

      <section className="document-section" id="comparison">
        <h2>三つの情報を、混ぜない。</h2>
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
          本人の経験を性格の点数にしたり、知りたいテーマを候補者との相性に換算したりしません。
          通常の候補者一覧・比較は、氏名の読みの五十音順を基本とします。
          閲覧履歴や関心によって、特定候補者を優先する並べ替えはしません。
        </p>
        <Link href="/interests" className="text-link">
          知りたいことから見る →
        </Link>
      </section>

      <section className="document-section">
        <h2>短く読む入口と、文脈に戻る出口。</h2>
        <p>
          取材では共通の6問を使い、必要に応じて具体的な場面や条件を聞きます。
          公開時は「経験・選択・理由・条件」を整理し、本人の引用、前後の文字起こし、Podcastの該当箇所と全編につなぎます。
        </p>
        <p>
          引用と編集部の要約は区別します。「本人がそう語ったこと」と、その出来事を外部資料で確認できたことも別です。
          言及がない場合は「今回の回答では言及なし」とし、その人に経験がないとは決めつけません。
        </p>
        <Link href="/stories" className="text-link">
          共通の質問を見る →
        </Link>
      </section>

      <section className="document-section">
        <h2>質問も、見直せるように。</h2>
        <p>
          住民が知りたいことと、議会・予算・行政計画などの情報を突き合わせ、設問候補を作ります。
          一問でひとつの判断を尋ね、用語、現状・県との関係、主な論点、出典を分けて示します。
        </p>
        <p>
          質問台帳には採用理由、採用しなかった理由、確認する事項、版を残します。
          回答が集まることと、意図した意味で理解されることは別です。公開前に、自分の言葉で説明してもらう事前テストを行う計画です。
          現在の8問が県政全体を網羅するとは説明しません。
        </p>
        <Link href="/policy-register" className="text-link">
          設問候補と確認することを見る →
        </Link>
      </section>

      <section className="document-section">
        <h2>この形式で、伝わりやすくなるか。</h2>
        <p>
          同じ取材内容を「取材順」と「共通形式」で見せ、発言内容と根拠を把握しやすくなるかを確かめる計画です。
          政治家の人格や、投票先を当てる研究ではありません。効果はまだ検証していません。
        </p>
        <Link href="/research" className="text-link">
          研究の準備を見る →
        </Link>
      </section>

      <section className="document-section">
        <h2>掲載・訂正について</h2>
        <p>
          取材後は原音・原文を確認し、別担当者の文脈確認と本人による発言趣旨の確認を分けて記録する方針です。
          AIを下書きに使う場合も、そのまま公開せず、承認済みの文章を掲載します。
          確認体制、更新頻度、訂正の手順は正式公開前に確定します。
        </p>
        <p>
          ご質問や訂正依頼は{" "}
          <a href={contactMailto} className="text-link">
            {contactEmail}
          </a>{" "}
          へ。
          対象ページのURLと該当箇所をお知らせください。政策回答や投票先の送付は必要ありません。
        </p>
        <Link href="/sources" className="text-link">
          情報源・公平性を読む →
        </Link>
      </section>
    </main>
  );
}
