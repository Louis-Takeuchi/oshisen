/**
 * シェア画像（OGP）の生成（要件定義P2-1・P3-6）。
 *
 *   npm run share-images:generate            … 質問カード10枚 → public/share/q-*.png
 *   npm run share-images:generate -- --candidates
 *     … 候補者カード（approved 済みの data/sheet/candidates.csv から）→ public/share/candidate-*.png
 *
 * 質問カード：ロゴ＋テーマ表示＋質問文（ふつう）＋「あなたならどう答える？」。
 * 候補者カード：全員同じテンプレート（ロゴ・選挙区・届出番号・氏名・「政策の回答とインタビュー」）。
 * 写真は使わない（全員の条件をそろえるため）。
 * 生成したPNGはリポジトリにコミットして配信する（実行環境のフォント差異を避けるため、
 * 文字を含む画像はこのスクリプトを macOS 上で実行して作る）。
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { isApproved, readSheetCsv } from "./lib/sheet-csv.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "share");
mkdirSync(outDir, { recursive: true });

const logoDataUri = `data:image/png;base64,${readFileSync(
  path.join(root, "public", "brand-logo.png"),
).toString("base64")}`;

const scopeLabels = { common: "共通", tsukuba: "つくば市", tsuchiura: "土浦市" };
const districtLabels = { tsukuba: "つくば市選挙区", tsuchiura: "土浦市選挙区" };

const FONT_FAMILY =
  "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif";

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/** 日本語テキストを1行あたりの文字数で折り返す（禁則は行頭の句読点のみ簡易処理）。 */
function wrapJapanese(text, perLine, maxLines) {
  const characters = Array.from(text);
  const lines = [];
  let line = "";
  for (const character of characters) {
    line += character;
    if (Array.from(line).length >= perLine) {
      lines.push(line);
      line = "";
    }
  }
  if (line) lines.push(line);
  for (let i = 1; i < lines.length; i++) {
    while (lines[i] && "、。）」』・ー".includes(lines[i][0])) {
      lines[i - 1] += lines[i][0];
      lines[i] = lines[i].slice(1);
    }
  }
  const kept = lines.filter((entry) => entry.length > 0).slice(0, maxLines);
  if (lines.filter((entry) => entry.length > 0).length > maxLines) {
    const last = Array.from(kept[maxLines - 1]);
    kept[maxLines - 1] = last.slice(0, Math.max(1, last.length - 1)).join("") + "…";
  }
  return kept;
}

function frame(inner) {
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#fffefa"/>
  <circle cx="1120" cy="60" r="150" fill="#fff8d5"/>
  <circle cx="60" cy="590" r="130" fill="#edf2ff"/>
  <rect x="36" y="36" width="1128" height="558" rx="34" fill="#ffffff" stroke="#101736" stroke-width="5"/>
  <rect x="48" y="48" width="1128" height="558" rx="34" fill="none" stroke="#ffea32" stroke-width="6" opacity="0.9"/>
  ${inner}
</svg>`;
}

function questionSvg(question) {
  const tag = `${scopeLabels[question.scope] ?? question.scope}｜${question.theme_label}`;
  const text = question["text_normal"] ?? question.text;
  const length = Array.from(text).length;
  const [fontSize, perLine, maxLines] =
    length <= 64 ? [46, 19, 4] : length <= 100 ? [38, 23, 5] : [33, 27, 5];
  const lines = wrapJapanese(text, perLine, maxLines);
  const lineHeight = Math.round(fontSize * 1.62);
  const textStartY = 268;
  const textSvg = lines
    .map(
      (line, index) =>
        `<text x="96" y="${textStartY + index * lineHeight}" font-family="${FONT_FAMILY}" font-size="${fontSize}" font-weight="700" fill="#101736">${escapeXml(line)}</text>`,
    )
    .join("\n  ");
  const tagWidth = 60 + Array.from(tag).length * 30;
  return frame(`
  <image href="${logoDataUri}" x="88" y="76" width="252" height="84" preserveAspectRatio="xMinYMid meet"/>
  <text x="1104" y="128" text-anchor="end" font-family="${FONT_FAMILY}" font-size="26" font-weight="600" fill="#596079">2026 茨城県議会議員選挙</text>
  <rect x="92" y="180" width="${tagWidth}" height="52" rx="26" fill="#edf2ff" stroke="#004dff" stroke-width="3"/>
  <text x="${92 + tagWidth / 2}" y="216" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="28" font-weight="800" fill="#004dff">${escapeXml(tag)}</text>
  ${textSvg}
  <text x="96" y="548" font-family="${FONT_FAMILY}" font-size="24" font-weight="600" fill="#596079">候補者にも、この文のまま聞いています（7段階）</text>
  <text x="1104" y="552" text-anchor="end" font-family="${FONT_FAMILY}" font-size="38" font-weight="800" fill="#ff2383">あなたならどう答える？</text>
`);
}

function candidateSvg(candidate) {
  const district = districtLabels[candidate.district] ?? candidate.district;
  const name = candidate.name;
  const nameSize = Array.from(name).length <= 6 ? 96 : Array.from(name).length <= 9 ? 76 : 58;
  return frame(`
  <image href="${logoDataUri}" x="88" y="76" width="252" height="84" preserveAspectRatio="xMinYMid meet"/>
  <text x="1104" y="128" text-anchor="end" font-family="${FONT_FAMILY}" font-size="26" font-weight="600" fill="#596079">2026 茨城県議会議員選挙</text>
  <rect x="92" y="190" width="330" height="54" rx="27" fill="#edf2ff" stroke="#004dff" stroke-width="3"/>
  <text x="257" y="227" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="28" font-weight="800" fill="#004dff">${escapeXml(district)}</text>
  <circle cx="134" cy="330" r="40" fill="#fff8d5" stroke="#101736" stroke-width="4"/>
  <text x="134" y="346" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="44" font-weight="800" fill="#101736">${escapeXml(String(candidate.filing_order ?? ""))}</text>
  <text x="208" y="300" font-family="${FONT_FAMILY}" font-size="24" font-weight="600" fill="#596079">届出番号${escapeXml(String(candidate.filing_order ?? ""))}</text>
  <text x="208" y="${300 + nameSize * 0.9}" font-family="${FONT_FAMILY}" font-size="${nameSize}" font-weight="800" fill="#101736">${escapeXml(name)}</text>
  <text x="96" y="548" font-family="${FONT_FAMILY}" font-size="36" font-weight="800" fill="#004dff">政策の回答とインタビュー</text>
  <text x="1104" y="548" text-anchor="end" font-family="${FONT_FAMILY}" font-size="24" font-weight="600" fill="#596079">www.oshisen.com</text>
`);
}

async function renderTo(filename, svg) {
  const file = path.join(outDir, filename);
  const png = await sharp(Buffer.from(svg), { density: 72 }).png().toBuffer();
  writeFileSync(file, png);
  console.log(`generate-share-images: wrote public/share/${filename}`);
}

const candidatesMode = process.argv.includes("--candidates");

if (candidatesMode) {
  const rows = readSheetCsv(path.join(root, "data", "sheet", "candidates.csv"));
  if (!rows) {
    console.error(
      "generate-share-images: data/sheet/candidates.csv がありません（候補者カードは12/4の取り込み後に生成します）。",
    );
    process.exit(1);
  }
  const approved = rows.filter((row) => isApproved(row.approved));
  for (const candidate of approved) {
    await renderTo(
      `candidate-${candidate.candidate_id}.png`,
      candidateSvg(candidate),
    );
  }
  if (approved.length === 0)
    console.warn("generate-share-images: approved=TRUE の候補者がいません。");
} else {
  const rows = readSheetCsv(path.join(root, "data", "sheet", "questions.csv"));
  if (!rows) {
    console.error("generate-share-images: data/sheet/questions.csv がありません。");
    process.exit(1);
  }
  for (const question of rows) {
    await renderTo(
      `q-${question.question_id.toLowerCase()}.png`,
      questionSvg(question),
    );
  }
}
