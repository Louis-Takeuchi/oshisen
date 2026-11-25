/**
 * サイトの運用フェーズ。切り替えはこの1か所だけ。
 * - "pre"     : 告示（12/4）前。実在の候補者の名前・写真・回答・動画は出さない。
 * - "live"    : 告示後〜投票終了。毎日18時の反映で候補者データを更新する。
 * - "archive" : 12/14以降。候補者情報・動画・回答の全ページ上部にアーカイブ表示を出す。
 *               ページは2030年12月31日まで公開を続ける（規約の公開期間）。
 */
export type SitePhase = "pre" | "live" | "archive";

export const sitePhase: SitePhase = "pre";

export const ARCHIVE_BANNER_TEXT =
  "この情報は、2026年12月13日投票の茨城県議会議員選挙の時点のものです（アーカイブ）。";

/** アーカイブ表示を出す対象（候補者情報・動画・回答のページ）。 */
export function showsArchiveBanner(pathname: string): boolean {
  if (sitePhase !== "archive") return false;
  return (
    pathname === "/talk" ||
    pathname === "/compare" ||
    pathname === "/saved" ||
    pathname === "/results" ||
    pathname === "/candidates" ||
    pathname.startsWith("/candidates/") ||
    pathname.startsWith("/q/")
  );
}
