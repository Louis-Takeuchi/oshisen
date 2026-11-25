import { generatedExplainers } from "./generated/sheet-data.ts";
import { isSafeResourceUrl } from "./resources.ts";

/**
 * 「この質問の解説」。シートの explainers タブで approved=TRUE の質問だけ表示する。
 * caution 列は運営用メモのため、生成データに含めず表示もしない。
 */
export interface QuestionExplainerContent {
  readonly questionId: string;
  /** 何を聞いている？ */
  readonly summary: { readonly normal: string; readonly easy: string };
  /** 今どうなっている？ */
  readonly now: { readonly normal: string; readonly easy: string };
  /** よい点として挙げられること（メリット）。行ごとの箇条書き。 */
  readonly pros: { readonly normal: readonly string[]; readonly easy: readonly string[] };
  /** 心配な点として挙げられること（デメリット）。行ごとの箇条書き。 */
  readonly cons: { readonly normal: readonly string[]; readonly easy: readonly string[] };
  /** ことば（レベル共通）。「用語：説明」の行の配列。 */
  readonly terms: readonly { readonly term: string; readonly description: string }[];
  /** 出典（レベル共通）。安全なURLのみ。 */
  readonly sources: readonly string[];
}

/** 「・」始まりの複数行テキストを箇条書きの配列にする。 */
function splitBullets(value: string): readonly string[] {
  return value
    .split("\n")
    .map((line) => line.trim().replace(/^[・•]\s*/, ""))
    .filter((line) => line.length > 0);
}

function splitTerms(
  value: string,
): readonly { term: string; description: string }[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const separator = line.indexOf("：");
      if (separator <= 0) return { term: "", description: line };
      return {
        term: line.slice(0, separator),
        description: line.slice(separator + 1),
      };
    });
}

function splitSources(value: string): readonly string[] {
  return value
    .split(/\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && isSafeResourceUrl(line));
}

const approvedExplainers: ReadonlyMap<string, QuestionExplainerContent> =
  new Map(
    generatedExplainers.map((row) => [
      row.questionId,
      {
        questionId: row.questionId,
        summary: { normal: row.summaryNormal, easy: row.summaryEasy },
        now: { normal: row.nowNormal, easy: row.nowEasy },
        pros: {
          normal: splitBullets(row.prosNormal),
          easy: splitBullets(row.prosEasy),
        },
        cons: {
          normal: splitBullets(row.consNormal),
          easy: splitBullets(row.consEasy),
        },
        terms: splitTerms(row.terms),
        sources: splitSources(row.sources),
      },
    ]),
  );

/** 承認済みの解説だけを返す。未承認の質問は undefined（解説欄ごと非表示）。 */
export function getApprovedExplainer(
  questionId: string,
): QuestionExplainerContent | undefined {
  return approvedExplainers.get(questionId);
}

export const EXPLAINER_FOOTNOTE =
  "この解説はオシセンが公開資料をもとに書いたものです。候補者の回答ではありません。";
