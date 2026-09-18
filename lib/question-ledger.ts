import {
  POLICY_SCALE_VERSION,
  type PolicyQuestionDefinition,
  type PolicySource,
} from "./policy.ts";

export interface PolicyQuestionSections {
  readonly terms: readonly {
    readonly term: string;
    readonly description: string;
  }[];
  readonly currentState: string;
  readonly discussion: readonly string[];
  readonly sources: readonly PolicySource[];
}

export interface PolicyQuestion extends PolicyQuestionDefinition {
  readonly theme: string;
  readonly text: string;
  /** A short draft explanation, not a verified description of current policy. */
  readonly context: string;
  readonly sections: PolicyQuestionSections;
  readonly status: "draft" | "approved" | "retired";
  readonly verification: "unverified" | "verified";
  readonly origin: "legacy-prototype" | "research-proposal";
  readonly preview: boolean;
  readonly selection: {
    readonly status: "held" | "adopted" | "rejected";
    readonly reason: string;
  };
  readonly pendingChecks: readonly string[];
  readonly reviewedAt: string | null;
  readonly baselineDate: string | null;
}

export const QUESTION_LEDGER_VERSION = "question-ledger-2026-09-18-v1";
export const QUESTION_DRAFT_NOTICE =
  "この8問は操作を試すための草案です。茨城県の制度・予算・権限、質問の伝わり方は確認中です。候補者本人の回答はまだ掲載していません。";

type DraftInput = Pick<
  PolicyQuestion,
  "id" | "theme" | "text" | "context" | "pendingChecks"
> & {
  readonly terms: PolicyQuestionSections["terms"];
  readonly discussion: readonly string[];
};

function draft(
  input: DraftInput,
  origin: PolicyQuestion["origin"],
): PolicyQuestion {
  const { terms, discussion, ...question } = input;
  return {
    ...question,
    questionVersion: "draft-2026-09-18-v1",
    scaleVersion: POLICY_SCALE_VERSION,
    contextVersion: "draft-help-2026-09-18-v1",
    sections: {
      terms,
      currentState:
        "現行の制度・予算・計画、県が判断できる範囲は未確認です。確認後に対象と基準時点を明記します。",
      discussion,
      sources: [],
    },
    status: "draft",
    verification: "unverified",
    origin,
    preview: origin === "legacy-prototype",
    selection: {
      status: "held",
      reason:
        origin === "legacy-prototype"
          ? "既存の操作体験を残すための草案。現状・出典の確認と認知インタビューを経るまで公開研究の共通設問としては採用しません。"
          : "研究設計案から登録した設問候補。対象制度・基準・出典の確認と事前テストを終えていないため保留しています。",
    },
    reviewedAt: null,
    baselineDate: null,
  };
}

/** A versioned snapshot: editing live UI copy must not rewrite previous answers. */
const existingDrafts: readonly DraftInput[] = [
  {
    id: "transport",
    theme: "公共交通",
    text: "公共交通への行政支援を、今より増やすべきだと思う。",
    context:
      "路線バスや地域鉄道などへの支援を想定した設問案です。移動手段の確保と、費用負担やほかの施策との配分をどう考えるかを尋ねます。具体的な路線や予算額を前提にはしていません。",
    terms: [
      {
        term: "行政支援",
        description:
          "この案では公共交通への財政的な支援を想定しています。県・市町村の分担や支援の種類は未確定です。",
      },
    ],
    discussion: [
      "移動手段を確保すること",
      "費用負担と、ほかの施策との予算配分",
    ],
    pendingChecks: [
      "行政の範囲と県の役割",
      "対象制度・現行予算",
      "『今より』の基準時点",
      "支援の対象と方法",
    ],
  },
  {
    id: "education",
    theme: "教育",
    text: "県立高校では、共通の学習内容に加えて、学校ごとの特色ある教育に予算を配分するべきだと思う。",
    context:
      "学校ごとの専門科目や地域と連携した学習を想定した設問案です。選べる学びの幅と、学校間の教育機会の均等をどう考えるかを尋ねます。",
    terms: [
      {
        term: "特色ある教育",
        description:
          "この案では専門科目や地域と連携した学習を想定しています。対象の授業や費用は未確定です。",
      },
    ],
    discussion: ["選べる学びの幅", "学校間の教育機会と予算配分"],
    pendingChecks: [
      "対象となる教育内容と費用",
      "現行の予算配分",
      "基準時点",
      "県・学校の判断範囲",
    ],
  },
  {
    id: "childcare",
    theme: "子育て",
    text: "県の子育て費用の支援は、所得にかかわらず広く届けることを優先するべきだと思う。",
    context:
      "限られた予算での支援の配分を尋ねる設問案です。対象を広げる方法と、経済的な負担が大きい世帯に支援を集中する方法には、それぞれ異なる考え方があります。",
    terms: [
      {
        term: "子育て費用の支援",
        description:
          "対象にする制度と費用は未確定です。すべての支援を一括して尋ねてよいかも確認します。",
      },
    ],
    discussion: [
      "所得にかかわらず対象を広げること",
      "負担が大きい世帯への支援の集中",
    ],
    pendingChecks: [
      "対象制度と県・市町村の分担",
      "現行の所得要件",
      "比較する予算の範囲",
      "基準時点",
    ],
  },
  {
    id: "healthcare",
    theme: "地域医療",
    text: "県は、医療機能を拠点に集めることより、各地域の医療機関を維持する支援を優先するべきだと思う。",
    context:
      "身近な場所での受診のしやすさと、医療従事者や設備を集めることによる体制の充実について尋ねる設問案です。実際には地域や診療分野によって条件が異なります。",
    terms: [
      {
        term: "医療機能を拠点に集める",
        description:
          "この案では医療従事者や設備を集める方針を想定しています。診療分野・地域の範囲は未確定です。",
      },
    ],
    discussion: [
      "身近な場所で受診できること",
      "医療従事者や設備を集めた体制づくり",
    ],
    pendingChecks: [
      "対象の地域・診療分野",
      "現行の医療計画",
      "県の支援手段と権限",
      "両方の支援を同時に行う余地",
    ],
  },
  {
    id: "disaster",
    theme: "防災・インフラ",
    text: "県のインフラ予算は、新しい施設の整備より、既存施設の点検や修繕を優先するべきだと思う。",
    context:
      "道路や橋、公共施設などの整備方針を尋ねる設問案です。今ある施設を保つ必要性と、新たな地域の需要に応える必要性をどう考えるかを尋ねます。",
    terms: [
      {
        term: "インフラ予算",
        description:
          "この案では道路・橋・公共施設などの費用を想定しています。県が管理する対象と予算の範囲は未確定です。",
      },
    ],
    discussion: ["今ある施設を安全に使い続けること", "新たな需要への対応"],
    pendingChecks: [
      "県が管理する施設の範囲",
      "維持更新計画と現行予算",
      "優先の意味と比較条件",
      "基準時点",
    ],
  },
  {
    id: "environment",
    theme: "環境・エネルギー",
    text: "県は、再生可能エネルギー施設の設置について、自然環境や景観を守る条件を厳しくするべきだと思う。",
    context:
      "施設の立地条件を想定した設問案です。再生可能エネルギーの導入の進めやすさと、自然環境や地域の景観への配慮をどう考えるかを尋ねます。特定の計画を評価するものではありません。",
    terms: [
      {
        term: "設置の条件",
        description:
          "この案では自然環境や景観に関する立地条件を想定しています。現行条件と、県が変更できる範囲は未確認です。",
      },
    ],
    discussion: [
      "再生可能エネルギーを導入すること",
      "自然環境や地域の景観への影響",
    ],
    pendingChecks: [
      "対象施設と現行条件",
      "国・県・市町村の権限",
      "『厳しく』の基準",
      "基準時点",
    ],
  },
  {
    id: "agriculture",
    theme: "農業",
    text: "県の農業支援は、経営規模の拡大より、小規模な農家の事業継続を優先するべきだと思う。",
    context:
      "農業支援の重点を尋ねる設問案です。地域で営農を続けることと、経営の集約による生産体制の整備をどう考えるかを尋ねます。農業の種類や地域によって必要な支援は異なります。",
    terms: [
      {
        term: "小規模な農家",
        description:
          "経営規模をどう区切るかは未確定です。作物や地域による違いも含めて定義を確認します。",
      },
    ],
    discussion: ["地域で営農を続けること", "経営の集約と生産体制の整備"],
    pendingChecks: [
      "経営規模の定義",
      "対象の支援制度と作物",
      "現行の県の方針・予算",
      "基準時点",
    ],
  },
  {
    id: "administration",
    theme: "行政サービス",
    text: "県の行政手続きは、オンライン化を進めても、対面の窓口を維持するべきだと思う。",
    context:
      "行政サービスの提供方法を尋ねる設問案です。対面で相談できる機会と、窓口の運営費用や手続きの効率をどう考えるかを尋ねます。",
    terms: [
      {
        term: "対面の窓口",
        description:
          "この案では来庁して手続きや相談をする窓口を想定しています。対象手続きと相談の範囲は未確定です。",
      },
    ],
    discussion: [
      "対面で手続きや相談ができること",
      "窓口の運営費用や手続きの効率",
    ],
    pendingChecks: [
      "県の対象手続き",
      "現行のオンライン・対面対応",
      "利用状況と費用",
      "基準時点",
    ],
  },
];

/** New wording is held separately; no automatic replacement of live drafts. */
const proposedDrafts: readonly DraftInput[] = [
  {
    id: "proposal-transport",
    theme: "公共交通",
    text: "県は、運賃収入だけでは維持できない地域公共交通への財政支援を拡大すべきだ。",
    context:
      "研究設計案から登録した未確定の質問です。『拡大』の比較基準や対象制度は確認していません。",
    terms: [
      {
        term: "地域公共交通",
        description: "対象となる交通手段・路線・地域は未確定です。",
      },
    ],
    discussion: ["地域の移動手段の維持", "財政負担と役割分担"],
    pendingChecks: [
      "対象制度",
      "現行予算",
      "県・市町村・事業者の役割",
      "基準時点",
    ],
  },
  {
    id: "proposal-education",
    theme: "教育",
    text: "県立高校の再編では、小規模校の統合を進めるべきだ。",
    context:
      "研究設計案から登録した未確定の質問です。対象校や現行計画を確認した質問ではありません。",
    terms: [
      {
        term: "小規模校",
        description: "生徒数・学級数など、規模を区切る基準は未確定です。",
      },
    ],
    discussion: ["学校の体制と学べる内容", "通学の条件と地域で学べる機会"],
    pendingChecks: ["『小規模』の定義", "現行計画", "対象範囲", "通学条件"],
  },
  {
    id: "proposal-healthcare",
    theme: "医療",
    text: "県の医療機関への支援は、人口に比べて医師が少ない地域に重点配分すべきだ。",
    context:
      "研究設計案から登録した未確定の質問です。医師数の比較指標や県の支援手段は確認していません。",
    terms: [
      {
        term: "重点配分",
        description: "どの予算・支援を、何と比べて多く配分するかは未確定です。",
      },
    ],
    discussion: [
      "医療へのアクセスが限られる地域への支援",
      "支援先を判断する指標と配分方法",
    ],
    pendingChecks: ["支援の種類", "比較指標", "県が判断できる範囲", "基準時点"],
  },
  {
    id: "proposal-employment",
    theme: "仕事",
    text: "県が企業に補助金を出す際は、県内の雇用を一定期間維持することを条件にすべきだ。",
    context:
      "研究設計案から登録した未確定の質問です。現在の補助金の要件を確認した質問ではありません。",
    terms: [
      {
        term: "一定期間",
        description:
          "条件を適用する年数や途中で満たせなくなった場合の扱いは未確定です。",
      },
    ],
    discussion: ["支援による雇用の継続", "企業の事情や例外をどう扱うか"],
    pendingChecks: ["対象補助金", "期間", "例外", "現在の要件"],
  },
  {
    id: "proposal-disaster",
    theme: "防災",
    text: "県は、災害リスクの高い区域からの住み替え費用を支援すべきだ。",
    context:
      "研究設計案から登録した未確定の質問です。対象区域や既存の支援制度は確認していません。",
    terms: [
      {
        term: "災害リスクの高い区域",
        description: "対象とする災害と区域の判断基準は未確定です。",
      },
    ],
    discussion: ["暮らしの安全と住み替えの選択", "費用の負担と支援の対象"],
    pendingChecks: ["区域の定義", "既存制度", "対象者", "費用負担の範囲"],
  },
  {
    id: "proposal-environment",
    theme: "環境",
    text: "県が管理する建物の電力調達では、再生可能エネルギーの割合を調達条件に含めるべきだ。",
    context:
      "研究設計案から登録した未確定の質問です。現在の調達条件や費用・供給状況は確認していません。",
    terms: [
      {
        term: "調達条件",
        description:
          "この案では電力の契約時の条件を想定しています。対象建物と必要な割合は未確定です。",
      },
    ],
    discussion: ["公共施設で使う電力の選び方", "費用や供給の条件"],
    pendingChecks: ["調達対象", "割合", "現行条件", "費用・供給に関する資料"],
  },
  {
    id: "proposal-administration",
    theme: "行政手続き",
    text: "県の行政手続きでは、オンライン申請に加えて紙の申請方法も残すべきだ。",
    context:
      "研究設計案から登録した未確定の質問です。紙での申請と対面相談は別の扱いとして検討します。",
    terms: [
      {
        term: "紙の申請方法",
        description:
          "この案では紙の書類による申請を想定しています。提出方法と対象手続きは未確定です。",
      },
    ],
    discussion: ["申請方法を選べること", "処理にかかる負担や運営費用"],
    pendingChecks: ["対象手続き", "現行の対応", "利用状況", "基準時点"],
  },
  {
    id: "proposal-participation",
    theme: "住民参加",
    text: "県は、若者から受けた政策提案について、採用・不採用の理由を公開すべきだ。",
    context:
      "研究設計案から登録した未確定の質問です。提案の受付方法や現行の公表方法は確認していません。",
    terms: [
      {
        term: "若者から受けた政策提案",
        description: "対象年齢、提案の受付方法、公開の範囲は未確定です。",
      },
    ],
    discussion: [
      "提案がどう扱われたかを知ること",
      "理由の公表に伴う負担と個人情報への配慮",
    ],
    pendingChecks: [
      "提案を受け付ける仕組み",
      "対象年齢",
      "既存の公表方法",
      "提案者の情報の扱い",
    ],
  },
];

export const questionLedger: readonly PolicyQuestion[] = [
  ...existingDrafts.map((question) => draft(question, "legacy-prototype")),
  ...proposedDrafts.map((question) => draft(question, "research-proposal")),
];

/** The eight existing questions remain an explicitly unverified interaction preview. */
export const policyQuestions: readonly PolicyQuestion[] = questionLedger.filter(
  (question) => question.preview,
);

export function getPolicyQuestion(id: string): PolicyQuestion | undefined {
  return policyQuestions.find((question) => question.id === id);
}

export function getQuestionLedgerEntry(id: string): PolicyQuestion | undefined {
  return questionLedger.find((question) => question.id === id);
}
