import {
  questions,
  type AnswerValue,
  type Candidate,
  type CandidateId,
  type QuestionId,
} from "./data.ts";

export type IssueStance = "agree" | "neutral" | "disagree" | "unknown";

export type IssueAnswerLookup = Readonly<
  Partial<Record<CandidateId, Readonly<Record<string, unknown>>>>
>;

export interface IssueGroup {
  readonly id: IssueStance;
  readonly label: string;
  readonly description: string;
  readonly members: readonly {
    readonly candidate: Candidate;
    readonly answer: AnswerValue | null;
  }[];
}

export function getIssueQuestion(value: unknown) {
  return typeof value === "string"
    ? questions.find((question) => question.id === value)
    : undefined;
}

export function resolveIssueTheme(value: unknown): QuestionId {
  return getIssueQuestion(value)?.id ?? "transport";
}

/** A missing or invalid answer is never treated as a neutral response. */
export function classifyIssueAnswer(value: unknown): IssueStance {
  switch (value) {
    case 4:
    case 3:
      return "agree";
    case 2:
      return "neutral";
    case 1:
    case 0:
      return "disagree";
    default:
      return "unknown";
  }
}

/**
 * Only known questions are grouped. Callers must explicitly supply demo
 * fixtures; without them, the candidates' actual answer records are used.
 * No diagnosis answers, scores, preferences, or weighting affect this order.
 */
export function groupCandidatesByIssue(
  questionId: unknown,
  entries: readonly Candidate[],
  answersByCandidate?: IssueAnswerLookup,
): readonly IssueGroup[] {
  const question = getIssueQuestion(questionId);
  if (!question) return [];

  const groups: IssueGroup[] = [
    {
      id: "agree",
      label: "そう思う寄り",
      description: "「強くそう思う」「ややそう思う」",
      members: [],
    },
    {
      id: "neutral",
      label: "どちらともいえない",
      description: "「どちらともいえない」と回答",
      members: [],
    },
    {
      id: "disagree",
      label: "そう思わない寄り",
      description: "「あまりそう思わない」「まったくそう思わない」",
      members: [],
    },
    {
      id: "unknown",
      label: "回答未確認",
      description: "回答がない場合や、回答を確認できない場合。中立とは別です。",
      members: [],
    },
  ];

  const members = [...entries]
    .sort((a, b) => a.kana.localeCompare(b.kana, "ja"))
    .map((candidate) => {
      const answerRecord = answersByCandidate
        ? answersByCandidate[candidate.id]
        : candidate.answers;
      const value = answerRecord?.[question.id];
      const stance = classifyIssueAnswer(value);
      return {
        candidate,
        answer: stance === "unknown" ? null : (value as AnswerValue),
        stance,
      };
    });

  return groups.map((group) => ({
    ...group,
    members: members
      .filter((member) => member.stance === group.id)
      .map(({ candidate, answer }) => ({ candidate, answer })),
  }));
}
