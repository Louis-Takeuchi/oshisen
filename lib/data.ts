/** Draft content for a demonstrator. No entry describes a real candidate. */
export type AnswerValue = 0 | 1 | 2 | 3 | 4;
export type AnswerMap = Readonly<
  Record<string, AnswerValue | null | undefined>
>;

export type QuestionId =
  | "transport"
  | "education"
  | "childcare"
  | "healthcare"
  | "disaster"
  | "environment"
  | "agriculture"
  | "administration";

export interface Question {
  readonly id: QuestionId;
  readonly theme: string;
  readonly text: string;
  readonly context: string;
}

export const questions: readonly Question[] = [
  {
    id: "transport",
    theme: "公共交通",
    text: "公共交通への行政支援を、今より増やすべきだと思う。",
    context:
      "路線バスや地域鉄道などへの支援を想定した設問案です。移動手段の確保と、費用負担やほかの施策との配分をどう考えるかを尋ねます。具体的な路線や予算額を前提にはしていません。",
  },
  {
    id: "education",
    theme: "教育",
    text: "県立高校では、共通の学習内容に加えて、学校ごとの特色ある教育に予算を配分するべきだと思う。",
    context:
      "学校ごとの専門科目や地域と連携した学習を想定した設問案です。選べる学びの幅と、学校間の教育機会の均等をどう考えるかを尋ねます。",
  },
  {
    id: "childcare",
    theme: "子育て",
    text: "県の子育て費用の支援は、所得にかかわらず広く届けることを優先するべきだと思う。",
    context:
      "限られた予算での支援の配分を尋ねる設問案です。対象を広げる方法と、経済的な負担が大きい世帯に支援を集中する方法には、それぞれ異なる考え方があります。",
  },
  {
    id: "healthcare",
    theme: "地域医療",
    text: "県は、医療機能を拠点に集めることより、各地域の医療機関を維持する支援を優先するべきだと思う。",
    context:
      "身近な場所での受診のしやすさと、医療従事者や設備を集めることによる体制の充実について尋ねる設問案です。実際には地域や診療分野によって条件が異なります。",
  },
  {
    id: "disaster",
    theme: "防災・インフラ",
    text: "県のインフラ予算は、新しい施設の整備より、既存施設の点検や修繕を優先するべきだと思う。",
    context:
      "道路や橋、公共施設などの整備方針を尋ねる設問案です。今ある施設を保つ必要性と、新たな地域の需要に応える必要性をどう考えるかを尋ねます。",
  },
  {
    id: "environment",
    theme: "環境・エネルギー",
    text: "県は、再生可能エネルギー施設の設置について、自然環境や景観を守る条件を厳しくするべきだと思う。",
    context:
      "施設の立地条件を想定した設問案です。再生可能エネルギーの導入の進めやすさと、自然環境や地域の景観への配慮をどう考えるかを尋ねます。特定の計画を評価するものではありません。",
  },
  {
    id: "agriculture",
    theme: "農業",
    text: "県の農業支援は、経営規模の拡大より、小規模な農家の事業継続を優先するべきだと思う。",
    context:
      "農業支援の重点を尋ねる設問案です。地域で営農を続けることと、経営の集約による生産体制の整備をどう考えるかを尋ねます。農業の種類や地域によって必要な支援は異なります。",
  },
  {
    id: "administration",
    theme: "行政サービス",
    text: "県の行政手続きは、オンライン化を進めても、対面の窓口を維持するべきだと思う。",
    context:
      "行政サービスの提供方法を尋ねる設問案です。対面で相談できる機会と、窓口の運営費用や手続きの効率をどう考えるかを尋ねます。",
  },
];

export interface AnswerOption {
  readonly value: AnswerValue;
  readonly label: string;
}

export const answerOptions: readonly AnswerOption[] = [
  { value: 4, label: "強くそう思う" },
  { value: 3, label: "ややそう思う" },
  { value: 2, label: "どちらともいえない" },
  { value: 1, label: "あまりそう思わない" },
  { value: 0, label: "まったくそう思わない" },
];

export type CandidateId =
  "sato-misaki" | "takahashi-ken" | "tanaka-aya" | "yamada-taro";

export interface Candidate {
  readonly id: CandidateId;
  readonly name: string;
  readonly kana: string;
  readonly isFictional: true;
  readonly age: null;
  readonly party: null;
  readonly status: null;
  readonly district: null;
  /** Actual candidate answers are deliberately unavailable. */
  readonly answers: AnswerMap;
}

const unanswered: AnswerMap = Object.freeze(
  Object.fromEntries(questions.map((question) => [question.id, null])),
);

export const candidates: readonly Candidate[] = [
  { id: "sato-misaki", name: "佐藤 美咲", kana: "さとう みさき" },
  { id: "takahashi-ken", name: "高橋 健", kana: "たかはし けん" },
  { id: "tanaka-aya", name: "田中 彩", kana: "たなか あや" },
  { id: "yamada-taro", name: "山田 太郎", kana: "やまだ たろう" },
].map((entry) => ({
  ...entry,
  id: entry.id as CandidateId,
  isFictional: true,
  age: null,
  party: null,
  status: null,
  district: null,
  answers: unanswered,
}));

/**
 * Numerical fixtures used exclusively to demonstrate the comparison UI.
 * They are not candidate responses, policy information, or public-source data.
 * Keep this separate from candidates[].answers so unavailable facts remain null.
 */
export const demoAnswerFixtures: Readonly<Record<CandidateId, AnswerMap>> = {
  "sato-misaki": {
    transport: 4,
    education: 3,
    childcare: 4,
    healthcare: 2,
    disaster: 3,
    environment: 1,
    agriculture: 2,
    administration: 3,
  },
  "takahashi-ken": {
    transport: 2,
    education: 4,
    childcare: 1,
    healthcare: 1,
    disaster: 3,
    environment: 2,
    agriculture: 1,
    administration: 2,
  },
  "tanaka-aya": {
    transport: 3,
    education: 2,
    childcare: 3,
    healthcare: 4,
    disaster: 2,
    environment: 4,
    agriculture: 3,
    administration: 4,
  },
  "yamada-taro": {
    transport: 1,
    education: 1,
    childcare: 2,
    healthcare: 3,
    disaster: 4,
    environment: 3,
    agriculture: 4,
    administration: 1,
  },
};

export const demoNotice =
  "体験用のデモです。掲載名はすべて架空で、回答は計算方法を試すためのサンプルです。実在の候補者・政策・本人の回答を示すものではありません。";

export const questionDraftNotice =
  "全8問は体験用の設問案です。公開版では質問の妥当性・中立性を確認し、候補者本人への同一質問と一次情報の確認を経て掲載します。";
