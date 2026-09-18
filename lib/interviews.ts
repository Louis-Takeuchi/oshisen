/** Common interview guide. These are questions, never invented answers. */
export const interviewGuide = [
  {
    id: "H01",
    title: "取り組みの背景",
    question:
      "今取り組んでいる課題に関わるきっかけになった経験を、一つ教えてください。",
    retain: "経験と現在の取り組みについて、本人が説明する関係",
  },
  {
    id: "H02",
    title: "判断と選択",
    question:
      "二つ以上の目標を同時には満たせず、何かを選ぶ必要があった経験を教えてください。そのとき何を重視しましたか。",
    retain: "状況、選択肢、選択、理由",
  },
  {
    id: "H03",
    title: "意見の相違",
    question:
      "自分と異なる意見に接した具体的な場面と、その後の対応を教えてください。",
    retain: "意見の違いと、本人が説明する対応",
  },
  {
    id: "H04",
    title: "想定外への対応",
    question:
      "取り組みが想定どおりに進まなかった例と、その後どうしたかを教えてください。",
    retain: "当初の想定、経過、対応、振り返り",
  },
  {
    id: "H05",
    title: "考えの変化・継続",
    question:
      "新しい情報や経験に接して、自分の考えを見直した場面はありますか。変えた場合も変えなかった場合も、その理由を教えてください。",
    retain: "新しい情報、考慮したこと、変更・維持の理由",
  },
  {
    id: "H06",
    title: "暮らしとの接点",
    question:
      "日々の暮らしや地域での経験のうち、今の取り組みにつながっているものがあれば教えてください。",
    retain: "日常の経験と活動の関係",
  },
] as const;
export type InterviewQuestionId = (typeof interviewGuide)[number]["id"];
export const interviewFollowups = [
  "いつごろのことですか。",
  "その中で、ご本人は何をしましたか。",
  "別の選択肢はありましたか。",
  "その判断が当てはまる条件はありますか。",
] as const;
export const interviewFieldLabels = {
  experience: "本人が語った経験",
  action: "そのときの選択・行動",
  reason: "本人が挙げた理由",
  conditions: "条件・留保",
} as const;
export type InterviewFieldKey = keyof typeof interviewFieldLabels;
export type InterviewField =
  | { status: "stated"; text: string; segmentIds: string[] }
  | { status: "not_mentioned" };
export type InformationKind =
  "self_report" | "recollection" | "official_record" | "editorial_summary";
export const informationKindLabels: Record<InformationKind, string> = {
  self_report: "本人回答",
  recollection: "本人の回顧",
  official_record: "公式記録",
  editorial_summary: "編集部要約",
};
export interface SourceSegment {
  id: string;
  quote: string;
  contextBefore: string;
  contextAfter: string;
  startSeconds: number;
  endSeconds: number;
  fullUrl: string;
  transcriptUrl: string;
  informationKind: InformationKind;
}
export interface InterviewCorrection {
  version: string;
  correctedOn: string;
  reason: string;
}
export const interviewReviewLabels = {
  audio: "原音との照合",
  context: "別担当者による文脈確認",
  speaker: "本人による発言趣旨の確認",
  publication: "公開承認",
} as const;
export type InterviewReviewKind = keyof typeof interviewReviewLabels;
export interface InterviewReview {
  reviewer: string;
  checkedOn: string;
  contentKey: string;
}
interface BaseBlock {
  id: string;
  subjectId: string;
  subjectLabel: string;
  questionId: InterviewQuestionId;
  interviewOrder: number;
}
export interface UnrecordedInterviewBlock extends BaseBlock {
  availability: "not_recorded";
}
export interface RecordedInterviewBlock extends BaseBlock {
  availability: "recorded" | "not_mentioned";
  fields: Record<InterviewFieldKey, InterviewField>;
  segments: SourceSegment[];
  relatedPolicyQuestionIds: string[];
  recordedOn: string;
  answeredOn: string;
  version: string;
  corrections: InterviewCorrection[];
  reviews: Partial<Record<InterviewReviewKind, InterviewReview>>;
}
export type InterviewBlock = UnrecordedInterviewBlock | RecordedInterviewBlock;
export interface InterviewDocument {
  schemaVersion: "1.0";
  blocks: InterviewBlock[];
}
export interface InterviewValidation {
  valid: boolean;
  errors: string[];
  document: InterviewDocument | null;
}
const hasText = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const validId = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(value);
export function isInterviewDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    value >= "1900-01-01" &&
    value <= new Date().toISOString().slice(0, 10)
  );
}
export function isInterviewSourceUrl(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    value !== value.trim() ||
    [...value].some(
      (character) =>
        character.charCodeAt(0) <= 32 ||
        character.charCodeAt(0) === 127 ||
        character === "\\",
    )
  )
    return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !!url.hostname &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
/** Deep links only for formats that support a known time-fragment convention. */
export function interviewSegmentUrl(segment: SourceSegment): string | null {
  if (
    !isInterviewSourceUrl(segment.fullUrl) ||
    !Number.isFinite(segment.startSeconds) ||
    !Number.isFinite(segment.endSeconds) ||
    segment.startSeconds < 0 ||
    segment.endSeconds <= segment.startSeconds ||
    segment.endSeconds > 86400
  )
    return null;
  const url = new URL(segment.fullUrl);
  const videoId =
    url.hostname === "youtu.be"
      ? url.pathname.slice(1)
      : ["youtube.com", "www.youtube.com"].includes(url.hostname) &&
          url.pathname === "/watch" &&
          url.searchParams.getAll("v").length === 1
        ? url.searchParams.get("v")
        : null;
  if (videoId && /^[\w-]{11}$/.test(videoId))
    return `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(segment.startSeconds)}s`;
  if (/\.(mp3|mp4|m4a|ogg|wav|webm)$/i.test(url.pathname)) {
    url.hash = `t=${segment.startSeconds},${segment.endSeconds}`;
    return url.href;
  }
  return null;
}
function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (isRecord(value))
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stable(value[key])]),
    );
  return value;
}
/** Approval is bound to every content/source/version field. This is not an authentication signature. */
export function interviewContentKey(block: RecordedInterviewBlock): string {
  const { reviews: _reviews, ...content } = block;
  void _reviews;
  return JSON.stringify(stable(content));
}
function validateBlock(value: unknown, index: number): string[] {
  const prefix = `blocks[${index}]`;
  if (!isRecord(value)) return [`${prefix}: オブジェクトが必要です。`];
  const errors: string[] = [];
  const error = (text: string) => errors.push(`${prefix}: ${text}`);
  if (!validId(value.id))
    error("id は英数字・ハイフン・アンダースコアで指定してください。");
  if (!interviewGuide.some((item) => item.id === value.questionId))
    error("questionId は H01〜H06 です。");
  if (
    !Number.isInteger(value.interviewOrder) ||
    Number(value.interviewOrder) < 0
  )
    error("interviewOrder は0以上の整数です。");
  if (value.availability === "not_recorded") {
    if (
      typeof value.subjectId !== "string" ||
      typeof value.subjectLabel !== "string"
    )
      error("未収録でも subjectId と subjectLabel の欄が必要です。");
    if (
      Object.keys(value).some(
        (key) =>
          ![
            "id",
            "subjectId",
            "subjectLabel",
            "questionId",
            "interviewOrder",
            "availability",
          ].includes(key),
      )
    )
      error("未収録のブロックに発言や承認情報を入れないでください。");
    return errors;
  }
  if (
    value.availability !== "recorded" &&
    value.availability !== "not_mentioned"
  )
    error("availability が不正です。");
  if (!validId(value.subjectId) || !hasText(value.subjectLabel))
    error("収録済みの情報には subjectId と subjectLabel が必要です。");
  if (!isInterviewDate(value.recordedOn) || !isInterviewDate(value.answeredOn))
    error("収録日・回答日は実在する過去または当日の日付が必要です。");
  if (!hasText(value.version)) error("公開版を指定してください。");
  const segmentIds = new Set<string>();
  if (!Array.isArray(value.segments) || value.segments.length === 0)
    error("言及の有無を確認した元の発言区間が必要です。");
  else
    value.segments.forEach((segment, segmentIndex) => {
      if (!isRecord(segment)) {
        error(`segments[${segmentIndex}] が不正です。`);
        return;
      }
      if (!validId(segment.id) || segmentIds.has(segment.id))
        error("発言区間IDは重複のないIDにしてください。");
      else segmentIds.add(segment.id);
      if (
        !hasText(segment.quote) ||
        typeof segment.contextBefore !== "string" ||
        typeof segment.contextAfter !== "string"
      )
        error("原文と前後の文字起こし欄が必要です。");
      if (
        !Number.isFinite(segment.startSeconds) ||
        !Number.isFinite(segment.endSeconds) ||
        Number(segment.startSeconds) < 0 ||
        Number(segment.endSeconds) <= Number(segment.startSeconds) ||
        Number(segment.endSeconds) > 86400
      )
        error("原音の開始・終了時刻が不正です。");
      if (
        !isInterviewSourceUrl(segment.fullUrl) ||
        !isInterviewSourceUrl(segment.transcriptUrl)
      )
        error("原音全編と文字起こしに安全なHTTPS URLが必要です。");
      if (
        !Object.hasOwn(informationKindLabels, String(segment.informationKind))
      )
        error("情報の種類が不正です。");
    });
  if (!isRecord(value.fields))
    error("経験・選択・理由・条件の4項目が必要です。");
  else
    for (const key of Object.keys(interviewFieldLabels)) {
      const field = value.fields[key];
      if (
        !isRecord(field) ||
        (field.status !== "stated" && field.status !== "not_mentioned")
      ) {
        error(`${key} の言及状態が不正です。`);
        continue;
      }
      if (field.status === "not_mentioned") {
        if (Object.keys(field).some((key) => key !== "status"))
          error(`${key}: 未言及の内容を補完しないでください。`);
      } else {
        if (
          !hasText(field.text) ||
          !Array.isArray(field.segmentIds) ||
          !field.segmentIds.length ||
          field.segmentIds.some(
            (id) => typeof id !== "string" || !segmentIds.has(id),
          )
        )
          error(`${key}: 要約と対応する発言区間IDが必要です。`);
        if (value.availability === "not_mentioned")
          error("ブロック全体が未言及の場合、要約を登録できません。");
      }
    }
  if (
    !Array.isArray(value.relatedPolicyQuestionIds) ||
    value.relatedPolicyQuestionIds.some((id) => !validId(id))
  )
    error("関連する政策設問IDは配列で指定してください。");
  if (!Array.isArray(value.corrections))
    error("訂正履歴を配列で用意してください。");
  else
    value.corrections.forEach((correction) => {
      if (
        !isRecord(correction) ||
        !hasText(correction.version) ||
        !isInterviewDate(correction.correctedOn) ||
        !hasText(correction.reason)
      )
        error("訂正には版・日付・内容が必要です。");
    });
  if (!isRecord(value.reviews))
    error("確認記録を用意してください。未確認なら空のオブジェクトにします。");
  else
    for (const [kind, review] of Object.entries(value.reviews)) {
      if (
        !Object.hasOwn(interviewReviewLabels, kind) ||
        !isRecord(review) ||
        !hasText(review.reviewer) ||
        !isInterviewDate(review.checkedOn) ||
        !hasText(review.contentKey)
      )
        error("確認記録には確認者・日付・確認した内容キーが必要です。");
    }
  return errors;
}
export function validateInterviewDocument(value: unknown): InterviewValidation {
  if (
    !isRecord(value) ||
    value.schemaVersion !== "1.0" ||
    !Array.isArray(value.blocks)
  )
    return {
      valid: false,
      errors: ["schemaVersion: 1.0 と blocks 配列が必要です。"],
      document: null,
    };
  if (value.blocks.length > 200)
    return {
      valid: false,
      errors: ["一度に読み込めるのは200ブロックまでです。"],
      document: null,
    };
  const errors = value.blocks.flatMap(validateBlock);
  const ids = new Set<string>();
  const subjectLabels = new Map<string, string>();
  for (const block of value.blocks)
    if (isRecord(block)) {
      if (typeof block.id === "string" && ids.has(block.id))
        errors.push(`ブロックID ${block.id} が重複しています。`);
      if (typeof block.id === "string") ids.add(block.id);
      if (hasText(block.subjectId) && hasText(block.subjectLabel)) {
        if (
          subjectLabels.has(block.subjectId) &&
          subjectLabels.get(block.subjectId) !== block.subjectLabel
        )
          errors.push(`subjectId ${block.subjectId} の表示名が一致しません。`);
        subjectLabels.set(block.subjectId, block.subjectLabel);
      }
    }
  return {
    valid: !errors.length,
    errors,
    document: errors.length ? null : (value as unknown as InterviewDocument),
  };
}
export function interviewPublicationIssues(block: InterviewBlock): string[] {
  const errors = validateBlock(block, 0);
  if (errors.length) return errors;
  if (block.availability === "not_recorded") return [...errors, "未収録です。"];
  const contentKey = interviewContentKey(block);
  for (const [key, label] of Object.entries(interviewReviewLabels)) {
    const review = block.reviews?.[key as InterviewReviewKind];
    if (!review || review.contentKey !== contentKey)
      errors.push(`${label}が未完了、または確認後に内容が変わっています。`);
    else if (
      review.checkedOn < block.recordedOn ||
      review.checkedOn < block.answeredOn ||
      block.corrections.some(
        (correction) => correction.correctedOn > review.checkedOn,
      )
    )
      errors.push(`${label}の日付が収録・回答・訂正より前です。`);
  }
  if (block.reviews?.audio?.reviewer === block.reviews?.context?.reviewer)
    errors.push("文脈確認は原音照合とは別の担当者が行います。");
  const publicationDate = block.reviews.publication?.checkedOn;
  if (
    publicationDate &&
    Object.entries(block.reviews).some(
      ([kind, review]) =>
        kind !== "publication" && review.checkedOn > publicationDate,
    )
  )
    errors.push("公開承認は原音・文脈・本人の確認後に行います。");
  return errors;
}
export function getPublishableInterviewBlocks(
  document: InterviewDocument,
): RecordedInterviewBlock[] {
  if (!validateInterviewDocument(document).valid) return [];
  return document.blocks.filter(
    (block): block is RecordedInterviewBlock =>
      block.availability !== "not_recorded" &&
      interviewPublicationIssues(block).length === 0,
  );
}
export function createInterviewTemplate(): InterviewDocument {
  return {
    schemaVersion: "1.0",
    blocks: interviewGuide.map((question, index) => ({
      id: `draft-${question.id}`,
      subjectId: "",
      subjectLabel: "",
      questionId: question.id,
      interviewOrder: index,
      availability: "not_recorded",
    })),
  };
}
/** Only approved content may cross into public client props; reviewer records stay server-side. */
export type PublicInterviewBlock = Omit<RecordedInterviewBlock, "reviews">;
export function getPublicInterviewBlocks(
  document: InterviewDocument,
  subjectId?: string,
): PublicInterviewBlock[] {
  return getPublishableInterviewBlocks(document)
    .filter((block) => subjectId === undefined || block.subjectId === subjectId)
    .map((block) => {
      const { reviews: _reviews, ...publicContent } = block;
      void _reviews;
      return publicContent;
    });
}
