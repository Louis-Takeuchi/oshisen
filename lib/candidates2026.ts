import {
  generatedBackgroundAnswers,
  generatedCandidates,
  generatedCorrections,
  generatedPolicyAnswers,
  generatedVideos,
  type GeneratedCandidate,
} from "./generated/sheet-data.ts";
import {
  districts,
  getSentQuestion,
  isScaleValue,
  type District,
  type ScaleValue,
} from "./election2026.ts";
import { isSafeResourceUrl } from "./resources.ts";

/**
 * 2026年茨城県議選の候補者データ（シートの approved=TRUE 行のみが元データ）。
 * - どの画面でも選挙区ごとの立候補届出順。一致度・閲覧数・五十音などで並べ替えない。
 * - 本人の回答はそのまま掲載し、要約や評価を加えない。
 */

export interface Candidate2026 {
  readonly id: string;
  readonly district: District;
  readonly filingOrder: number;
  readonly name: string;
  readonly nameKana: string;
  readonly partyLabel: string;
  /** 現・新・元 */
  readonly incumbency: string;
  /** 投票日（2026-12-13）時点の年齢。全員そろうまで null。 */
  readonly age: number | null;
  /** public/candidates/ 配下のファイル名。未提供なら null。 */
  readonly photoFilename: string | null;
  readonly profile: string;
  readonly urls: {
    readonly official?: string;
    readonly x?: string;
    readonly instagram?: string;
    readonly youtube?: string;
    readonly facebook?: string;
  };
  readonly participationStatus: string;
  readonly updatedAt: string;
}

export interface CandidatePolicyAnswer {
  readonly candidateId: string;
  readonly questionId: string;
  /** 7段階の位置。非回答のときは null。 */
  readonly value: ScaleValue | null;
  /** 「判断材料が足りない」「設問の前提に異議がある」「回答しない」など。未回答は空文字。 */
  readonly nonAnswer: string;
  /** 理由の全文。改行も含めて入力どおりに表示する。 */
  readonly reason: string;
  readonly answeredOn: string;
}

export interface CandidateBackgroundAnswer {
  readonly candidateId: string;
  readonly itemId: string;
  readonly answerType: string;
  readonly text: string;
}

export interface CandidateCorrection {
  readonly candidateId: string;
  readonly target: string;
  readonly date: string;
  readonly type: string;
  readonly text: string;
}

export interface CandidateVideo {
  readonly candidateId: string;
  readonly videoType: string;
  readonly youtubeUrl: string;
  readonly title: string;
  readonly duration: string;
  readonly chapters: readonly { readonly time: string; readonly label: string }[];
  readonly publishAt: string;
}

/** 掲載状況ラベル。「拒否」という言葉は使わない。 */
export function participationStatusLabel(status: string): string {
  switch (status) {
    case "一部回答":
    case "確認中":
    case "公開済み":
    case "本人から不参加の連絡":
      return status;
    case "未回答":
    case "未依頼":
    case "依頼中":
    default:
      return "未回答";
  }
}

function isDistrict(value: string): value is District {
  return (districts as readonly string[]).includes(value);
}

function safeUrl(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed && isSafeResourceUrl(trimmed) ? trimmed : undefined;
}

function toCandidate(row: GeneratedCandidate): Candidate2026 | null {
  if (!row.candidateId.trim() || !row.name.trim()) return null;
  if (!isDistrict(row.district)) return null;
  if (
    row.filingOrder === null ||
    !Number.isInteger(row.filingOrder) ||
    row.filingOrder < 1
  )
    return null;
  return {
    id: row.candidateId,
    district: row.district,
    filingOrder: row.filingOrder,
    name: row.name,
    nameKana: row.nameKana,
    partyLabel: row.partyLabel,
    incumbency: row.incumbency,
    age:
      row.age !== null && Number.isInteger(row.age) && row.age > 0
        ? row.age
        : null,
    photoFilename: /^[\w.-]+\.(?:jpg|jpeg|png|webp)$/i.test(row.photoFilename)
      ? row.photoFilename
      : null,
    profile: row.profile,
    urls: {
      official: safeUrl(row.urlOfficial),
      x: safeUrl(row.urlX),
      instagram: safeUrl(row.urlInstagram),
      youtube: safeUrl(row.urlYoutube),
      facebook: safeUrl(row.urlFacebook),
    },
    participationStatus: participationStatusLabel(row.participationStatus),
    updatedAt: row.updatedAt,
  };
}

/** 届出順。表示順はこの並びを常に使う。 */
export const candidates2026: readonly Candidate2026[] = generatedCandidates
  .map(toCandidate)
  .filter((candidate): candidate is Candidate2026 => candidate !== null)
  .sort(
    (a, b) =>
      districts.indexOf(a.district) - districts.indexOf(b.district) ||
      a.filingOrder - b.filingOrder ||
      a.id.localeCompare(b.id),
  );

export const candidateIds2026: readonly string[] = candidates2026.map(
  (candidate) => candidate.id,
);

export function getCandidate2026(id: string): Candidate2026 | undefined {
  return candidates2026.find((candidate) => candidate.id === id);
}

export function candidatesInDistrict(
  district: District,
): readonly Candidate2026[] {
  return candidates2026.filter(
    (candidate) => candidate.district === district,
  );
}

const knownCandidate = (candidateId: string) =>
  candidateIds2026.includes(candidateId);

/** 候補者の政策回答。value と non_answer は片方だけ。両方空は「未回答」として扱う。 */
export const candidatePolicyAnswers: readonly CandidatePolicyAnswer[] =
  generatedPolicyAnswers
    .filter(
      (row) =>
        knownCandidate(row.candidateId) &&
        getSentQuestion(row.questionId) !== undefined,
    )
    .map((row) => {
      const value = isScaleValue(row.value) ? row.value : null;
      const nonAnswer = value === null ? row.nonAnswer.trim() : "";
      return {
        candidateId: row.candidateId,
        questionId: row.questionId.toUpperCase(),
        value,
        nonAnswer,
        reason: row.reason,
        answeredOn: row.answeredOn,
      };
    });

export function getCandidatePolicyAnswer(
  candidateId: string,
  questionId: string,
): CandidatePolicyAnswer | undefined {
  return candidatePolicyAnswers.find(
    (answer) =>
      answer.candidateId === candidateId && answer.questionId === questionId,
  );
}

/** 非回答・未回答の表示文言。回答行がない場合は「未回答」。 */
export function candidateAnswerStateLabel(
  answer: CandidatePolicyAnswer | undefined,
): string {
  if (!answer) return "未回答";
  if (answer.value !== null) return "";
  return answer.nonAnswer || "未回答";
}

export const candidateBackgroundAnswers: readonly CandidateBackgroundAnswer[] =
  generatedBackgroundAnswers.filter((row) => knownCandidate(row.candidateId));

export function getBackgroundAnswer(
  candidateId: string,
  itemId: string,
): CandidateBackgroundAnswer | undefined {
  return candidateBackgroundAnswers.find(
    (answer) => answer.candidateId === candidateId && answer.itemId === itemId,
  );
}

export const candidateCorrections: readonly CandidateCorrection[] =
  generatedCorrections.filter((row) => knownCandidate(row.candidateId));

export function correctionsFor(
  candidateId: string,
): readonly CandidateCorrection[] {
  return candidateCorrections.filter(
    (correction) => correction.candidateId === candidateId,
  );
}

function parseChapters(
  raw: string,
): readonly { time: string; label: string }[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const match = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+)$/);
      return match ? { time: match[1], label: match[2] } : null;
    })
    .filter((chapter): chapter is { time: string; label: string } =>
      Boolean(chapter),
    );
}

/** YouTubeのURLから動画IDを取り出す（youtube.com/watch?v=、youtu.be/、shorts/ に対応）。 */
export function youtubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    const host = parsed.hostname.replace(/^www\./, "");
    let id = "";
    if (host === "youtu.be") id = parsed.pathname.slice(1);
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (parsed.pathname === "/watch") id = parsed.searchParams.get("v") ?? "";
      else {
        const match = parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/);
        id = match?.[1] ?? "";
      }
    } else return null;
    return /^[\w-]{6,20}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export const candidateVideos: readonly CandidateVideo[] = generatedVideos
  .filter(
    (row) =>
      knownCandidate(row.candidateId) &&
      youtubeVideoId(row.youtubeUrl) !== null,
  )
  .map((row) => ({
    candidateId: row.candidateId,
    videoType: row.videoType,
    youtubeUrl: row.youtubeUrl,
    title: row.title,
    duration: row.duration,
    chapters: parseChapters(row.chapters),
    publishAt: row.publishAt,
  }));

export function videosFor(candidateId: string): readonly CandidateVideo[] {
  return candidateVideos.filter((video) => video.candidateId === candidateId);
}

export function mainVideoFor(candidateId: string): CandidateVideo | undefined {
  return videosFor(candidateId).find(
    (video) => video.videoType === "main" || video.videoType === "本編",
  );
}

/** 候補者情報が1人でも公開されているか（12/4以降の一斉公開後に true になる）。 */
export const hasPublishedCandidates = candidates2026.length > 0;

/**
 * 経験と判断の背景（H01〜H04）と最優先にすること（F01）の設問。
 * 設問文は候補者送付版の質問票の原文を転記する（転記までは見出しのみ表示）。
 */
export const backgroundItems: readonly {
  readonly id: string;
  readonly title: string;
  readonly text: string;
}[] = [
  { id: "H01", title: "経験と判断の背景 1", text: "" },
  { id: "H02", title: "経験と判断の背景 2", text: "" },
  { id: "H03", title: "経験と判断の背景 3", text: "" },
  { id: "H04", title: "経験と判断の背景 4", text: "" },
  { id: "F01", title: "最優先にすること", text: "" },
];
