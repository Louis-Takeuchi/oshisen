/** Operator-provided facts only. This is NOT candidate or matching data. */
export const teamQuestions = [
  { id: "personality", label: "自分の性格を、ひと言で表すと？" },
  { id: "day-off", label: "休みが1日あったら？" },
  { id: "favorite", label: "最近、ハマっていることは？" },
  { id: "decision", label: "判断に迷ったとき、最後に信じるものは？" },
  { id: "failure", label: "これまでで一番大きかった失敗は？" },
  { id: "motivation", label: "オシセンをつくろうと思ったきっかけは？" },
  { id: "partner", label: "一緒につくる相手の、ここがいいなと思うところは？" },
] as const;

export type TeamQuestionId = (typeof teamQuestions)[number]["id"];
export type TeamMemberId = "oya" | "takeuchi";

export interface TeamMember {
  readonly id: TeamMemberId;
  readonly name: string;
  readonly fullName: string;
  readonly role: "代表" | "共同代表";
  readonly headline: string;
  readonly responsibilities: readonly {
    readonly label: string;
    readonly description: string;
  }[];
  readonly photo: {
    readonly src: string;
    readonly width: number;
    readonly height: number;
    readonly position: string;
  };
  /** Publish only answers supplied/approved by this member; never infer them. */
  readonly answers: Readonly<Partial<Record<TeamQuestionId, string>>>;
}

export const teamMembers: readonly TeamMember[] = [
  {
    id: "oya",
    name: "Ryo",
    fullName: "大屋涼",
    role: "代表",
    headline: "企画から、取材の現場へ。",
    responsibilities: [
      { label: "企画", description: "コンテンツや取材の企画づくり" },
      { label: "取材", description: "候補者への取材・インタビュー" },
      { label: "営業", description: "プロジェクトの提案・対外折衝" },
    ],
    photo: {
      src: "/team/oya.jpg",
      width: 815,
      height: 930,
      position: "50% 28%",
    },
    answers: {
      personality: "クレイジーネゴシエーター",
      "day-off": "政策提言立案",
      favorite: "サッカー観戦、ランニング",
    },
  },
  {
    id: "takeuchi",
    name: "Louis",
    fullName: "竹内琉瑛",
    role: "共同代表",
    headline: "アイデアを、使えるかたちに。",
    responsibilities: [
      { label: "開発", description: "サイトの機能づくり・実装" },
      { label: "デザイン", description: "見た目と使いやすさの設計" },
      { label: "研究", description: "体験の検証・研究設計" },
    ],
    photo: {
      src: "/team/takeuchi.jpg",
      width: 814,
      height: 1440,
      position: "50% 32%",
    },
    answers: {
      personality: "見習い科学哲学者",
      "day-off": "本と論文を読む",
      favorite: "認知科学、AI開発、日本古代史探究",
    },
  },
];

export function getTeamAnswer(
  member: TeamMember,
  questionId: TeamQuestionId,
): string | null {
  return member.answers[questionId]?.trim() || null;
}
