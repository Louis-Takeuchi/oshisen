import Link from "next/link";
import { pageMetadata } from "../../lib/seo";
import { contactEmail, contactMailto } from "../../lib/site-contact";
import publicationRules from "../../lib/publication-rules.json";
import styles from "./neutrality.module.css";

export const metadata = pageMetadata("/neutrality", {
  title: "中立性ポリシー",
  description:
    "オシセンの中立性に関する基本方針。掲載・質問・比較・取材編集・運営の独立性・データの扱い・訂正の基準を公開します。",
  index: true,
});

export default function NeutralityPage() {
  return (
    <main id="main" className={`container document-page ${styles.page}`}>
      <p className="eyebrow">運営方針</p>
      <h1>オシセン 中立性ポリシー</h1>
      <p className={styles.version}>
        第1版｜<time dateTime="2026-10-10">2026年10月10日</time>作成
        <br />
        オシセン運営チーム
      </p>
      <div className={styles.introduction}>
        <p>
          オシセンは、政策に関する質問や政治家へのインタビューを通じて、市民が政治家の考えや人柄を知り、自分の価値観に照らして政治について考えるためのサービスです。
        </p>
        <p>
          私たちは、異なる立場の政治家と市民が、互いの考えに触れられる場をつくります。そのために、情報の収集、質問の設計、比較、編集、発信の各段階で共通の基準を設け、判断の根拠を説明できる運営を行います。
        </p>
        <p>
          本ポリシーは、オシセンのウェブサイト、マッチング機能、Podcast、動画、公式SNS、広報資料、およびこれらに関わる取材・編集・運営に適用します。以下、これらを「本サービス」とし、掲載対象となる議員、候補者その他の政治家を「政治家」と表記します。
        </p>
      </div>
      <nav
        className={`document-section ${styles.contents}`}
        aria-labelledby="contents-title"
      >
        <h2 id="contents-title">目次</h2>
        <ol>
          <li>
            <a href="#section-1" className="text-link">
              中立性の基本方針
            </a>
          </li>
          <li>
            <a href="#section-2" className="text-link">
              掲載対象と参加機会
            </a>
          </li>
          <li>
            <a href="#section-3" className="text-link">
              質問と争点の選定
            </a>
          </li>
          <li>
            <a href="#section-4" className="text-link">
              回答・発言・出典の扱い
            </a>
          </li>
          <li>
            <a href="#section-5" className="text-link">
              マッチングの方法と結果の意味
            </a>
          </li>
          <li>
            <a href="#section-6" className="text-link">
              政策との相性と、人柄・価値観の紹介
            </a>
          </li>
          <li>
            <a href="#section-7" className="text-link">
              表示順と紹介機会
            </a>
          </li>
          <li>
            <a href="#section-8" className="text-link">
              Podcast・取材・編集
            </a>
          </li>
          <li>
            <a href="#section-9" className="text-link">
              未回答・不参加・情報不足
            </a>
          </li>
          <li>
            <a href="#section-10" className="text-link">
              協力・出演と支持表明の関係
            </a>
          </li>
          <li>
            <a href="#section-11" className="text-link">
              運営の独立性と資金の扱い
            </a>
          </li>
          <li>
            <a href="#section-12" className="text-link">
              利用者の回答とデータ
            </a>
          </li>
          <li>
            <a href="#section-13" className="text-link">
              確認・訂正・異議申立て
            </a>
          </li>
          <li>
            <a href="#section-14" className="text-link">
              検証と見直し
            </a>
          </li>
          <li>
            <a href="#section-15" className="text-link">
              お問い合わせ
            </a>
          </li>
        </ol>
      </nav>
      <section
        className="document-section"
        id="section-1"
        aria-labelledby="section-1-title"
      >
        <h2 id="section-1-title">1. 中立性の基本方針</h2>
        <p>
          オシセンにおける中立性とは、党派や運営との関係にかかわらず共通の基準で政治家を扱い、利用者が自ら判断するための情報と、その比較方法を明らかにすることです。
        </p>
        <p>
          政策上の意見は、その背景や理由とともに紹介します。事実関係は、一次資料や確認可能な根拠に照らして確かめます。意見の違いを尊重することと、情報の正確さを確保することを両立させます。
        </p>
        <p>
          運営は、掲載対象、質問、計算方法、編集内容を本ポリシーに基づいて決定します。利用者の支持や投票の判断は、利用者自身に委ねます。
        </p>
      </section>
      <section
        className="document-section"
        id="section-2"
        aria-labelledby="section-2-title"
      >
        <h2 id="section-2-title">2. 掲載対象と参加機会</h2>
        <p>
          掲載対象は、地域、選挙、議会、在職・立候補の状況など、確認可能な条件によって定めます。各企画では、対象範囲、情報の基準日、掲載状況を明示します。
        </p>
        <p>
          回答や取材を依頼する際は、対象となる政治家に対して、共通の案内内容、回答期間、参加条件を用います。知名度、所属政党、当選回数、運営との親交にかかわらず、同じ条件で参加を受け付けます。
        </p>
        <p>
          制作上の制約などにより対象を絞る場合は、選定理由と掲載範囲を説明します。対象者の一部を掲載している段階では、その範囲が利用者に伝わるように表示します。
        </p>
      </section>
      <section
        className="document-section"
        id="section-3"
        aria-labelledby="section-3-title"
      >
        <h2 id="section-3-title">3. 質問と争点の選定</h2>
        <p>
          政策に関する質問は、市民生活との関わり、対象となる議会や政治家の権限、社会的な争点、立場の違いを理解するうえでの有用性を踏まえて選定します。
        </p>
        <p>質問の設計では、次の基準を用います。</p>
        <ul>
          <li>
            一つの質問で扱う論点を明確にし、複数の主張をまとめて賛否を求める表現を避けます。
          </li>
          <li>
            特定の回答へ誘導したり、一方の立場が不利に受け取られたりしないよう、質問文と選択肢を点検し、各立場を同じ精度で記述します。
          </li>
          <li>
            賛否だけでは表しにくい立場については、条件や理由を示す補足回答の機会を設けます。
          </li>
          <li>
            質問群全体を確認し、特定の政策分野や立場に偏りがある場合は、対象範囲と選定理由を説明します。
          </li>
        </ul>
        <p>
          質問や選択肢を変更した場合は、その内容と適用時点を示します。比較に用いる回答は、同じ設問・条件に基づくものを使用します。
        </p>
      </section>
      <section
        className="document-section"
        id="section-4"
        aria-labelledby="section-4-title"
      >
        <h2 id="section-4-title">4. 回答・発言・出典の扱い</h2>
        <p>
          政治家本人から得た回答、公開資料からの引用、運営による要約は、それぞれの性質が分かる形で表示します。情報には、出典、回答日または確認日を付し、当時の立場と現在の立場を区別できるようにします。
        </p>
        <p>
          文章の整理や要約を行う際は、主張の条件、理由、留保を保ちます。短い紹介文から、元の回答や発言の文脈を確認できるようにします。
        </p>
        <p>
          政党の方針と個々の政治家の回答は、発言主体を区別して扱います。公開資料をマッチングに使用する場合は、資料の選定方法、回答への対応付け、確認状況を示し、本人が直接回答した情報と識別できるようにします。
        </p>
        <p>
          AIを情報整理や要約に利用する場合も、公開内容は運営が原資料と照合し、出典と編集の責任を持ちます。
        </p>
      </section>
      <section
        className="document-section"
        id="section-5"
        aria-labelledby="section-5-title"
      >
        <h2 id="section-5-title">5. マッチングの方法と結果の意味</h2>
        <p>
          マッチングでは、利用者と政治家の回答を、公開した共通の方法で比較します。結果の説明には、次の事項を含めます。
        </p>
        <ul>
          <li>比較に用いる質問と回答データ</li>
          <li>回答同士の近さを判定する方法と、一致度の計算方法</li>
          <li>質問ごとの重みと、利用者が重みを変更できる場合の反映方法</li>
          <li>未回答、判断を保留した回答、比較が難しい回答の扱い</li>
          <li>数値を表示するために必要な情報量と、比較に使った回答数</li>
          <li>同点の扱い、結果の基準日、計算方法の版</li>
        </ul>
        <p>
          同じ入力と同じデータには、同じ計算方法を適用します。計算方法を改定する際は、変更内容と適用時点を公表し、比較対象に共通して反映します。
        </p>
        <p>
          一致度を表示する際は、政治家の能力、実績、人格、適性の総合評価と混同されないよう、比較した質問、計算方法、情報の不足、数値に反映される範囲を結果とともに説明します。
        </p>
        <Link href="/method#calculation" className="text-link">
          現在の比較機能と回答の見方 →
        </Link>
      </section>
      <section
        className="document-section"
        id="section-6"
        aria-labelledby="section-6-title"
      >
        <h2 id="section-6-title">6. 政策との相性と、人柄・価値観の紹介</h2>
        <p>
          政治家の人柄や価値観は、本人が語る経験、問題意識、活動の動機、判断に至る過程などを通じて紹介します。利用者が発言や活動に触れ、自分なりに理解を深められる構成を大切にします。
        </p>
        <p>
          政策の一致度と、人柄・価値観を知るための情報は、それぞれの意味が分かる形で示します。複数の要素を組み合わせて相性を表示する場合は、用いた項目、情報源、重み、算出方法を説明します。
        </p>
        <p>
          表情、声、話し方は、受け取る人や状況によって印象が変わります。その印象が誠実さや人格の評価に結び付かないよう、人物紹介は確認可能な事実と本人の言葉を中心に構成します。
        </p>
      </section>
      <section
        className="document-section"
        id="section-7"
        aria-labelledby="section-7-title"
      >
        <h2 id="section-7-title">7. 表示順と紹介機会</h2>
        <p>
          候補者の表示順は、対象となる選挙・選挙区ごとに、選挙管理委員会が公表する候補者一覧の「立候補届出順（届出順）」に合わせます。候補者一覧、検索結果、比較画面などで候補者を並べる際は、この順序を共通して用います。
        </p>
        <p>
          表示順の根拠となる公式資料と確認日を明示します。立候補届出順が確定・公表される前は、その時点で用いる表示基準を説明し、公表後に公式の届出順へ更新します。
        </p>
        <Link href="/method#display-order" className="text-link">
          現在の表示順の確認方法 →
        </Link>
        <p>
          トップページ、特集、公式SNSなどで紹介する対象は、企画との関連性、情報の新しさ、紹介機会の偏りを踏まえて選定します。紹介対象と選定理由を記録し、特定の政治家や党派への露出が継続的に集中していないかを確認します。
        </p>
        <p>
          掲載順位、一致度、紹介機会、編集上の評価は、それぞれの公開基準によって決定します。取材への協力や運営との個人的な関係によって扱いに偏りが生じないよう、公開した共通基準に沿って判断します。
        </p>
      </section>
      <section
        className="document-section"
        id="section-8"
        aria-labelledby="section-8-title"
      >
        <h2 id="section-8-title">8. Podcast・取材・編集</h2>
        <p>
          取材では、企画の目的、主な質問、収録時間の目安、公開媒体、編集方針を事前に伝えます。政治家を比較する企画では共通の質問を軸とし、個別の経歴や回答に応じた追加質問は、考えや背景を明確にするために行います。
        </p>
        <p>編集には、次の基準を適用します。</p>
        <ul>
          <li>発言の趣旨と、理解に必要な前後関係を保ちます。</li>
          <li>
            省略や抜粋によって、元の発言と異なる意味が生じないよう確認します。
          </li>
          <li>
            見出し、サムネイル、字幕、音楽、映像表現にも共通の基準を用い、特定の出演者への好悪を強める演出を避けます。
          </li>
          <li>
            要約や紹介文は、内容との対応を確認し、本人の発言と運営の説明を区別します。
          </li>
        </ul>
        <p>
          公開前の本人確認は、発言の趣旨、引用、事実関係の正確さを確かめるために行います。質問構成、他の出演者の扱い、比較方法については、本ポリシーと各企画の共通基準に基づいて運営が判断します。
        </p>
      </section>
      <section
        className="document-section"
        id="section-9"
        aria-labelledby="section-9-title"
      >
        <h2 id="section-9-title">9. 未回答・不参加・情報不足</h2>
        <p>
          回答が得られていない場合、出演に至っていない場合、情報を確認できない場合は、確認できた状況をそのまま表示します。参加しない理由を公表する際は、本人の説明と公表の意向を確認します。
        </p>
        <p>
          未回答が本人の政策的な立場と誤解されないよう、回答が得られていない状態として表示し、比較や計算での扱いを説明します。
        </p>
        <p>
          回答や出演の有無だけで誠実さや政策への姿勢が判断されないよう、確認できた参加状況と情報量を示します。比較に使った回答数や確認状況を添え、掲載情報が増えた際には同じ基準で更新します。
        </p>
      </section>
      <section
        className="document-section"
        id="section-10"
        aria-labelledby="section-10-title"
      >
        <h2 id="section-10-title">10. 協力・出演と支持表明の関係</h2>
        <p>
          オシセンへの回答、取材協力、出演は、市民に情報を届けるための協力として扱います。協力した政治家と運営は、それぞれ独立した立場を保ちます。
        </p>
        <p>
          掲載や出演が双方の支持・推薦や投票の呼びかけと受け取られないよう、市民への情報提供を目的とした協力であることを明示します。
        </p>
        <p>
          氏名、写真、発言、出演実績を広報に使用する際は、利用目的と範囲を事前に説明します。紹介文には協力の事実を正確に記し、提携、推薦、後援などの関係を表示する場合は、その内容について別途確認を得ます。
        </p>
      </section>
      <section
        className="document-section"
        id="section-11"
        aria-labelledby="section-11-title"
      >
        <h2 id="section-11-title">11. 運営の独立性と資金の扱い</h2>
        <div className={styles.fundingStatement}>
          <p>
            <strong>オシセンは、完全に自己資金で運営します。</strong>
          </p>
          <p>
            <strong>
              寄付、協賛、広告その他の支援は、一切受け付けません。
            </strong>
          </p>
        </div>
        <p>
          本サービスの運営に必要な費用は、すべて運営メンバー自身が負担します。外部からの資金提供や支援を受けず、広告・協賛の募集や掲載も行いません。
        </p>
        <p>
          運営主体、運営責任者、連絡先を公開し、運営の判断に影響し得る政治団体等との関係について説明します。
        </p>
        <p>
          運営メンバー個人の政治的な意見や活動と、本サービスの編集判断を区別します。特定の政治家や団体との雇用、報酬、政治活動、親族関係など、判断に影響し得る関係がある場合は、その関係を運営内で申告し、当該判断を別の担当者が確認する体制を確保します。サービスの独立性に関わる関係は、必要な範囲で公表します。
        </p>
      </section>
      <section
        className="document-section"
        id="section-12"
        aria-labelledby="section-12-title"
      >
        <h2 id="section-12-title">12. 利用者の回答とデータ</h2>
        <p>
          利用者が安心して自分の考えを回答できるよう、取得する情報、利用目的、保存期間、外部への提供範囲を、利用者が確認できる形で示します。データの取得と利用は、説明した目的に必要な範囲に限定します。
        </p>
        <p>
          回答や政治的関心に関するデータは、利用者への結果提供や、説明した範囲でのサービス改善に用います。個人への政治的な働きかけに利用されないよう、個人を識別できる回答や関心情報は、政治家、政党、選挙活動の関係者への提供対象から除外します。
        </p>
        <p>
          集計結果を公表・提供する場合は、少数の回答や他の情報との組み合わせから個人が推定される可能性を確認し、集計単位や公開範囲を調整します。また、回答者の集計を示す際は、対象、期間、回答数、収集方法を添え、地域住民全体や有権者全体の意見との違いが分かるようにします。
        </p>
        <Link href="/privacy" className="text-link">
          現在の保存範囲・集計・停止・削除方法 →
        </Link>
      </section>
      <section
        className="document-section"
        id="section-13"
        aria-labelledby="section-13-title"
      >
        <h2 id="section-13-title">13. 確認・訂正・異議申立て</h2>
        <p>
          確認・訂正・異議申立ての手順や対応方針については、別資料をご参照ください。
        </p>
        <p>{publicationRules.edition}</p>
        <a
          href={publicationRules.href}
          type="application/pdf"
          className="text-link"
        >
          候補者向け取材コンテンツ取扱掲載規約（PDF・{publicationRules.pages}
          ページ） →
        </a>
      </section>
      <section
        className="document-section"
        id="section-14"
        aria-labelledby="section-14-title"
      >
        <h2 id="section-14-title">14. 検証と見直し</h2>
        <p>
          運営は、質問の偏り、掲載範囲、情報量の差、紹介機会、計算結果、寄せられた指摘を、企画の公開時と更新時に確認します。質問や計算方法を変更する際は、特定の立場や回答状況に有利・不利な影響が生じていないかを点検します。
        </p>
        <p>
          改善が必要な場合は、変更の理由と内容を記録し、関係する説明や表示にも反映します。本ポリシーを改定した際は、改定日、主な変更点、適用時点を公開します。
        </p>
      </section>
      <section
        className="document-section"
        id="section-15"
        aria-labelledby="section-15-title"
      >
        <h2 id="section-15-title">15. お問い合わせ</h2>
        <p>
          本ポリシー、掲載内容、取材・編集、マッチング、データの扱いに関するお問い合わせは、公式サイトに掲載するオシセン運営チームの連絡先で受け付けます。
        </p>
        <p>
          ご連絡の際は、対象のページやコンテンツ、確認したい点、関連する資料をお知らせください。運営が内容を確認し、対応方針をご案内します。
        </p>
        <p>
          お問い合わせ先：
          <a href={contactMailto} className="text-link">
            {contactEmail}
          </a>
        </p>
        <Link href="/about#contact" className="text-link">
          運営情報・お問い合わせを見る →
        </Link>
      </section>
      <div className={`document-section ${styles.related}`}>
        <Link href="/method" className="text-link">
          現在の回答と情報の見方 →
        </Link>
        <Link href="/privacy" className="text-link">
          プライバシー・データの扱い →
        </Link>
        <a href="#contents-title" className="text-link">
          目次に戻る ↑
        </a>
      </div>
    </main>
  );
}
