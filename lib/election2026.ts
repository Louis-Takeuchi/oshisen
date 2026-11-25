import { generatedQuestions } from "./generated/sheet-data.ts";

/**
 * 2026年茨城県議選・候補者送付版の質問と7段階回答の定義。
 * 文言は候補者に送った質問票と同一で、一字一句変更しない（lib/generated/sheet-data.ts 経由）。
 * 候補者どうしの総合点・一致度・おすすめ順位は作らない。比較は1問ずつ。
 */
export type District = "tsukuba" | "tsuchiura";
export type QuestionScope = "common" | District;
/** 利用者の選挙区の選択。「どちらでもない・わからない」= "undecided"。 */
export type DistrictChoice = District | "undecided";

export const districts: readonly District[] = ["tsukuba", "tsuchiura"];

export const districtNames: Record<District, string> = {
  tsukuba: "つくば市",
  tsuchiura: "土浦市",
};

export const districtLabels: Record<District, string> = {
  tsukuba: "つくば市選挙区",
  tsuchiura: "土浦市選挙区",
};

export const scopeLabels: Record<QuestionScope, string> = {
  common: "共通",
  tsukuba: "つくば市",
  tsuchiura: "土浦市",
};

export interface SentQuestion {
  readonly id: string;
  /** /q/[slug] 用の小文字ID（例：p01）。 */
  readonly slug: string;
  readonly scope: QuestionScope;
  readonly order: number;
  readonly themeLabel: string;
  /** 候補者に送った原文。 */
  readonly text: string;
  /** 日本語レベル切り替え用（ふつう／やさしい）。 */
  readonly textNormal: string;
  readonly textEasy: string;
  readonly version: string;
}

/** 質問の版（データ上の識別子）。 */
export const SENT_QUESTION_VERSION = "候補者送付版（2026-10-30）";
/** 質問の版（画面表示用）。 */
export const SENT_QUESTION_VERSION_LABEL = "候補者送付版（2026年10月30日）";
/** 7段階の選択肢の版。保存データの照合に使う。 */
export const SCALE_VERSION = "agree-7-sent-2026-10-30";

function isQuestionScope(value: string): value is QuestionScope {
  return value === "common" || value === "tsukuba" || value === "tsuchiura";
}

export const sentQuestions: readonly SentQuestion[] = generatedQuestions.map(
  (row) => {
    if (!isQuestionScope(row.scope))
      throw new Error(`質問 ${row.questionId} の scope が不正です: ${row.scope}`);
    return {
      id: row.questionId,
      slug: row.questionId.toLowerCase(),
      scope: row.scope,
      order: row.order,
      themeLabel: row.themeLabel,
      text: row.text,
      textNormal: row.textNormal,
      textEasy: row.textEasy,
      version: row.version,
    };
  },
);

export const commonQuestions: readonly SentQuestion[] = sentQuestions.filter(
  (question) => question.scope === "common",
);

export function districtQuestions(
  district: District,
): readonly SentQuestion[] {
  return sentQuestions.filter((question) => question.scope === district);
}

/** 回答フローで出す質問。選挙区を選ばない場合は共通6問のみ。並びは order 順。 */
export function questionsForDistrict(
  choice: DistrictChoice,
): readonly SentQuestion[] {
  const list =
    choice === "undecided"
      ? [...commonQuestions]
      : sentQuestions.filter(
          (question) =>
            question.scope === "common" || question.scope === choice,
        );
  return list.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

export function getSentQuestion(idOrSlug: string): SentQuestion | undefined {
  const needle = idOrSlug.toUpperCase();
  return sentQuestions.find((question) => question.id === needle);
}

/** 質問タグの表示（例：共通｜路線バス）。 */
export function questionTagLabel(question: SentQuestion): string {
  return `${scopeLabels[question.scope]}｜${question.themeLabel}`;
}

/** /q/[slug] のパス。 */
export function questionPath(question: Pick<SentQuestion, "slug">): string {
  return `/q/${question.slug}`;
}

/** 質問ごとのシェア画像（scripts/generate-share-images.mjs が生成）。 */
export function questionShareImagePath(
  question: Pick<SentQuestion, "slug">,
): string {
  return `/share/q-${question.slug}.png?v=1`;
}

/* ------------------------------------------------------------------ */
/* 7段階の回答（候補者と同じ尺度）                                        */
/* ------------------------------------------------------------------ */

export type ScaleValue = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const scaleValues: readonly ScaleValue[] = [1, 2, 3, 4, 5, 6, 7];

/** 7段階の文言（全レベル共通。意味をそろえるため切り替えない）。 */
export const scaleLabels: Record<ScaleValue, string> = {
  1: "強く反対",
  2: "反対",
  3: "やや反対",
  4: "賛成でも反対でもない",
  5: "やや賛成",
  6: "賛成",
  7: "強く賛成",
};

/** 横一列の丸の端・中央の下に出す目盛りの文言。 */
export const scaleAxisLabels = {
  min: "強く反対",
  middle: "どちらでもない",
  max: "強く賛成",
} as const;

export function isScaleValue(value: unknown): value is ScaleValue {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 7
  );
}

export function scaleLabel(value: ScaleValue): string {
  return scaleLabels[value];
}

/* ------------------------------------------------------------------ */
/* 回答以外の選択（利用者）                                              */
/* ------------------------------------------------------------------ */

export type NonAnswerKind =
  | "insufficient-info"
  | "premise-objection"
  | "skip";

export const nonAnswerKinds: readonly NonAnswerKind[] = [
  "insufficient-info",
  "premise-objection",
  "skip",
];

export const nonAnswerLabels: Record<NonAnswerKind, string> = {
  "insufficient-info": "判断材料が足りない",
  "premise-objection": "設問の前提に異議がある",
  skip: "答えない（スキップ）",
};

export function isNonAnswerKind(value: unknown): value is NonAnswerKind {
  return (
    value === "insufficient-info" ||
    value === "premise-objection" ||
    value === "skip"
  );
}

/** 候補者の非回答の表示（シートの non_answer 列の値をそのまま表示に使う）。 */
export const candidateNonAnswerLabels: readonly string[] = [
  "判断材料が足りない",
  "設問の前提に異議がある",
  "回答しない",
  "未回答",
];

/* ------------------------------------------------------------------ */
/* 利用者の回答レコード                                                  */
/* ------------------------------------------------------------------ */

export type UserAnswer =
  | { readonly status: "answered"; readonly value: ScaleValue }
  | { readonly status: "non-answer"; readonly kind: NonAnswerKind };

export interface UserAnswerRecord {
  readonly questionId: string;
  readonly questionVersion: string;
  readonly scaleVersion: string;
  readonly answer: UserAnswer;
}

export function isUserAnswer(value: unknown): value is UserAnswer {
  if (!value || typeof value !== "object") return false;
  const answer = value as Record<string, unknown>;
  if (answer.status === "answered")
    return isScaleValue(answer.value) && answer.kind === undefined;
  if (answer.status === "non-answer")
    return isNonAnswerKind(answer.kind) && answer.value === undefined;
  return false;
}

export function createUserAnswerRecord(
  question: SentQuestion,
  answer: UserAnswer,
): UserAnswerRecord {
  return {
    questionId: question.id,
    questionVersion: question.version,
    scaleVersion: SCALE_VERSION,
    answer,
  };
}

export function hasMatchingVersion(
  question: SentQuestion,
  record: Pick<
    UserAnswerRecord,
    "questionId" | "questionVersion" | "scaleVersion"
  >,
): boolean {
  return (
    record.questionId === question.id &&
    record.questionVersion === question.version &&
    record.scaleVersion === SCALE_VERSION
  );
}

/** 「やや賛成（5）」のような表示。非回答は文言のみ。 */
export function userAnswerLabel(answer?: UserAnswer): string {
  if (!answer || !isUserAnswer(answer)) return "未回答";
  if (answer.status === "answered")
    return `${scaleLabels[answer.value]}（${answer.value}）`;
  return nonAnswerLabels[answer.kind];
}
