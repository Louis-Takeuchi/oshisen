/**
 * 「オシセン 掲載データ入力シート」のCSV書き出しを読むための共通処理。
 * 1行目の列名（英字）を取り込みの目印にする。「text_normal（ふつう）」のような
 * 注記付きの列名は、全角括弧の前までを列キーとして扱う。
 */
import { readFileSync, existsSync } from "node:fs";

export function parseCsv(text) {
  const source = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += char;
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim().length > 0));
}

export function normalizeHeader(name) {
  return name.replace(/^\uFEFF/, "").split("（")[0].split("(")[0].trim();
}

/** CSVを {列キー: 値} の配列にする。ファイルが無いときは null を返す。 */
export function readSheetCsv(path) {
  if (!existsSync(path)) return null;
  const rows = parseCsv(readFileSync(path, "utf8"));
  if (rows.length === 0) return [];
  const headers = rows[0].map(normalizeHeader);
  return rows.slice(1).map((cells) => {
    const record = {};
    headers.forEach((header, index) => {
      if (header) record[header] = (cells[index] ?? "").trim();
    });
    return record;
  });
}

export function isApproved(value) {
  return String(value ?? "").trim().toUpperCase() === "TRUE";
}

export function toInt(value) {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isInteger(parsed) ? parsed : null;
}
