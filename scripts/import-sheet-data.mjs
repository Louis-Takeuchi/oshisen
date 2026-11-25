/**
 * オシセン 掲載データ入力シート（2026茨城県議選）の取り込み（要件定義P2-7）。
 *
 * 使い方：
 *   1. Google スプレッドシートの各タブを「ファイル → ダウンロード → CSV」で書き出し、
 *      data/sheet/<タブ名>.csv として保存する（questions.csv / explainers.csv /
 *      candidates.csv / policy_answers.csv / background_answers.csv /
 *      corrections.csv / videos.csv）。news はサイト側 lib/news.ts で管理する。
 *   2. `npm run data:import` を実行すると lib/generated/sheet-data.ts を再生成する。
 *   3. 確認用の架空データで動かすときだけ `npm run data:fixtures`。
 *      確認が終わったら必ず `npm run data:import` で戻す（fixtures のままでは
 *      `npm test` が失敗し、公開できない）。
 *
 * ルール：
 *   - approved 列を持つタブは approved=TRUE の行だけを出力する（FALSEに戻せば次の生成で消える）。
 *   - caution・internal_note・note などの運営用メモ列は出力しない。
 *   - questions の文言は一字一句そのまま。検証で崩れを検出したら失敗させる。
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isApproved, readSheetCsv, toInt } from "./lib/sheet-csv.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sheetDir = path.join(root, "data", "sheet");
const outputPath = path.join(root, "lib", "generated", "sheet-data.ts");
const useFixtures = process.argv.includes("--fixtures");

function fail(message) {
  console.error(`import-sheet-data: ${message}`);
  process.exit(1);
}

function requireColumns(rows, columns, file) {
  if (rows.length === 0) return;
  for (const column of columns) {
    if (!(column in rows[0])) fail(`${file} に列 ${column} がありません。`);
  }
}

const questionRows = readSheetCsv(path.join(sheetDir, "questions.csv"));
if (!questionRows)
  fail(
    "data/sheet/questions.csv がありません。シートの questions タブをCSVで書き出して置いてください。",
  );
requireColumns(
  questionRows,
  ["question_id", "scope", "order", "theme_label", "text", "version", "text_normal", "text_easy"],
  "questions.csv",
);

const questions = questionRows.map((row) => {
  const questionId = row.question_id.toUpperCase();
  if (!/^[PTU]\d{2}$/.test(questionId))
    fail(`questions.csv の question_id が不正です: ${row.question_id}`);
  if (!["common", "tsukuba", "tsuchiura"].includes(row.scope))
    fail(`questions.csv の scope が不正です: ${row.scope}`);
  const order = toInt(row.order);
  if (order === null) fail(`questions.csv の order が不正です: ${row.order}`);
  for (const key of ["theme_label", "text", "version", "text_normal", "text_easy"]) {
    if (!row[key]) fail(`questions.csv の ${questionId} に ${key} がありません。`);
  }
  return {
    questionId,
    scope: row.scope,
    order,
    themeLabel: row.theme_label,
    text: row.text,
    version: row.version,
    textNormal: row.text_normal,
    textEasy: row.text_easy,
  };
});
if (questions.length !== 10)
  fail(`questions.csv は10問のはずですが ${questions.length} 問でした。`);

function readTab(name, columns) {
  const rows = readSheetCsv(path.join(sheetDir, `${name}.csv`));
  if (!rows) {
    console.warn(`import-sheet-data: data/sheet/${name}.csv が無いため0件として扱います。`);
    return [];
  }
  requireColumns(rows, columns, `${name}.csv`);
  return rows;
}

let explainers = readTab("explainers", ["question_id", "approved"])
  .filter((row) => isApproved(row.approved))
  .map((row) => ({
    questionId: row.question_id.toUpperCase(),
    summaryNormal: row.summary_normal ?? "",
    summaryEasy: row.summary_easy ?? "",
    nowNormal: row.now_normal ?? "",
    nowEasy: row.now_easy ?? "",
    prosNormal: row.pros_normal ?? "",
    prosEasy: row.pros_easy ?? "",
    consNormal: row.cons_normal ?? "",
    consEasy: row.cons_easy ?? "",
    terms: row.terms ?? "",
    sources: row.sources ?? "",
  }));

let candidates = readTab("candidates", ["candidate_id", "approved"])
  .filter((row) => isApproved(row.approved))
  .map((row) => ({
    candidateId: row.candidate_id,
    district: row.district ?? "",
    filingOrder: toInt(row.filing_order),
    name: row.name ?? "",
    nameKana: row.name_kana ?? "",
    partyLabel: row.party_label ?? "",
    incumbency: row.incumbency ?? "",
    photoFilename: row.photo_filename ?? "",
    profile: row.profile ?? "",
    urlOfficial: row.url_official ?? "",
    urlX: row.url_x ?? "",
    urlInstagram: row.url_instagram ?? "",
    urlYoutube: row.url_youtube ?? "",
    urlFacebook: row.url_facebook ?? "",
    participationStatus: row.participation_status ?? "",
    age: toInt(row.age),
    updatedAt: row.updated_at ?? "",
  }));

let policyAnswers = readTab("policy_answers", ["candidate_id", "question_id", "approved"])
  .filter((row) => isApproved(row.approved))
  .map((row) => ({
    candidateId: row.candidate_id,
    questionId: row.question_id.toUpperCase(),
    value: toInt(row.value),
    nonAnswer: row.non_answer ?? "",
    reason: row.reason ?? "",
    answeredOn: row.answered_on ?? "",
  }));

let backgroundAnswers = readTab("background_answers", ["candidate_id", "item_id", "approved"])
  .filter((row) => isApproved(row.approved))
  .map((row) => ({
    candidateId: row.candidate_id,
    itemId: row.item_id.toUpperCase(),
    answerType: row.answer_type ?? "",
    text: row.text ?? "",
  }));

let corrections = readTab("corrections", ["candidate_id", "approved"])
  .filter((row) => isApproved(row.approved))
  .map((row) => ({
    candidateId: row.candidate_id,
    target: row.target ?? "",
    date: row.date ?? "",
    type: row.type ?? "",
    text: row.text ?? "",
  }));

let videos = readTab("videos", ["candidate_id", "youtube_url", "approved"])
  .filter((row) => isApproved(row.approved))
  .map((row) => ({
    candidateId: row.candidate_id,
    videoType: row.video_type ?? "",
    youtubeUrl: row.youtube_url ?? "",
    title: row.title ?? "",
    duration: row.duration ?? "",
    chapters: row.chapters ?? "",
    publishAt: row.publish_at ?? "",
  }));

let source = "sheet";
if (useFixtures) {
  const fixtures = await import("./fixtures/fixture-election-data.mjs");
  source = "fixtures";
  candidates = fixtures.fixtureCandidates;
  policyAnswers = fixtures.fixturePolicyAnswers;
  backgroundAnswers = fixtures.fixtureBackgroundAnswers;
  corrections = fixtures.fixtureCorrections;
  videos = fixtures.fixtureVideos;
  console.warn(
    "import-sheet-data: 架空データ（候補者A〜D）を書き込みました。確認後は必ず `npm run data:import` で戻してください。架空データはサイトに公開しないこと。",
  );
}

// 告示前の安全確認：candidates.csv に tmp- の仮IDが残ったまま approved=TRUE に
// なっていないか（候補者IDは12/4に「選挙区-届出番号」へ付け直してから公開する）。
for (const candidate of candidates) {
  if (source === "sheet" && candidate.candidateId.startsWith("tmp-"))
    fail(
      `candidates.csv に仮ID（${candidate.candidateId}）のまま approved=TRUE の行があります。12/4の届出確認後に本IDへ付け直してから取り込んでください。`,
    );
}

const literal = (value) => JSON.stringify(value);

function rowsToTs(rows, indent = "  ") {
  if (rows.length === 0) return "[]";
  const body = rows
    .map(
      (row) =>
        `${indent}{\n` +
        Object.entries(row)
          .map(([key, value]) => `${indent}  ${key}: ${literal(value)},`)
          .join("\n") +
        `\n${indent}}`,
    )
    .join(",\n");
  return `[\n${body},\n]`;
}

const output = `// AUTO-GENERATED by scripts/import-sheet-data.mjs — DO NOT EDIT BY HAND.
// 出典：Google スプレッドシート「オシセン 掲載データ入力シート（2026茨城県議選）」の
// CSV書き出し（data/sheet/*.csv）。文言は一字一句、シートのまま取り込みます。
// approved 列を持つタブは approved=TRUE の行だけをここに出力します（FALSEに戻せば次の生成で消えます）。
// caution・internal_note・note などの運営用メモ列は出力しません。

/** "sheet" = data/sheet のCSV由来。"fixtures" = 架空データ（ローカル確認専用・公開禁止）。 */
export const generatedDataSource: "sheet" | "fixtures" = ${literal(source)};

export interface GeneratedQuestion {
  readonly questionId: string;
  readonly scope: string;
  readonly order: number;
  readonly themeLabel: string;
  readonly text: string;
  readonly version: string;
  readonly textNormal: string;
  readonly textEasy: string;
}

export interface GeneratedExplainer {
  readonly questionId: string;
  readonly summaryNormal: string;
  readonly summaryEasy: string;
  readonly nowNormal: string;
  readonly nowEasy: string;
  readonly prosNormal: string;
  readonly prosEasy: string;
  readonly consNormal: string;
  readonly consEasy: string;
  readonly terms: string;
  readonly sources: string;
}

export interface GeneratedCandidate {
  readonly candidateId: string;
  readonly district: string;
  readonly filingOrder: number | null;
  readonly name: string;
  readonly nameKana: string;
  readonly partyLabel: string;
  readonly incumbency: string;
  readonly photoFilename: string;
  readonly profile: string;
  readonly urlOfficial: string;
  readonly urlX: string;
  readonly urlInstagram: string;
  readonly urlYoutube: string;
  readonly urlFacebook: string;
  readonly participationStatus: string;
  readonly age: number | null;
  readonly updatedAt: string;
}

export interface GeneratedPolicyAnswer {
  readonly candidateId: string;
  readonly questionId: string;
  readonly value: number | null;
  readonly nonAnswer: string;
  readonly reason: string;
  readonly answeredOn: string;
}

export interface GeneratedBackgroundAnswer {
  readonly candidateId: string;
  readonly itemId: string;
  readonly answerType: string;
  readonly text: string;
}

export interface GeneratedCorrection {
  readonly candidateId: string;
  readonly target: string;
  readonly date: string;
  readonly type: string;
  readonly text: string;
}

export interface GeneratedVideo {
  readonly candidateId: string;
  readonly videoType: string;
  readonly youtubeUrl: string;
  readonly title: string;
  readonly duration: string;
  readonly chapters: string;
  readonly publishAt: string;
}

export const generatedQuestions: readonly GeneratedQuestion[] = ${rowsToTs(questions)};

// explainers タブ：approved=TRUE の行のみ。
export const generatedExplainers: readonly GeneratedExplainer[] = ${rowsToTs(explainers)};

// candidates タブ：approved=TRUE の行のみ（告示前は実在の候補者情報を公開しません）。
export const generatedCandidates: readonly GeneratedCandidate[] = ${rowsToTs(candidates)};

// policy_answers タブ：approved=TRUE の行のみ。
export const generatedPolicyAnswers: readonly GeneratedPolicyAnswer[] = ${rowsToTs(policyAnswers)};

// background_answers タブ：approved=TRUE の行のみ。
export const generatedBackgroundAnswers: readonly GeneratedBackgroundAnswer[] = ${rowsToTs(backgroundAnswers)};

// corrections タブ：approved=TRUE の行のみ。
export const generatedCorrections: readonly GeneratedCorrection[] = ${rowsToTs(corrections)};

// videos タブ：approved=TRUE の行のみ。
export const generatedVideos: readonly GeneratedVideo[] = ${rowsToTs(videos)};
`;

writeFileSync(outputPath, output);
console.log(
  `import-sheet-data: lib/generated/sheet-data.ts を更新しました（source=${source}, questions=${questions.length}, explainers=${explainers.length}, candidates=${candidates.length}, policy_answers=${policyAnswers.length}, background_answers=${backgroundAnswers.length}, corrections=${corrections.length}, videos=${videos.length}）。`,
);
