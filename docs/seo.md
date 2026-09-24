# 検索公開の運用

正規URLは `https://www.oshisen.com`。`lib/seo.ts` をcanonical・OGP・構造化データ・robots・サイトマップの共通設定とします。`SITE_URL` を変更するときは本番のHTTPS正規ドメインを指定し、Vercelのドメイン転送も合わせて変更してください。現在、HTTPと非wwwからの永久転送はVercelで動作しています。末尾スラッシュはNext.jsが除去します。308は301同様の永久転送です。

## インデックス対象

| 対象                                                                       | 方針                                           |
| -------------------------------------------------------------------------- | ---------------------------------------------- |
| `/`、`/about`、`/method`、`/sources`、`/privacy`                           | index                                          |
| `/issues`、`/stories`、`/policy-register`                                  | 準備状況・草案・未検証の状態を明示してindex    |
| `/ibaraki-2026/tsukuba`、配下の8テーマ                                     | プロジェクト案内と設問案としてindex            |
| `/research`                                                                | 手元のJSONを確認する作業画面のためnoindex      |
| `/diagnosis`、`/questions`、`/results`、`/compare`、`/saved`、`/interests` | アプリ操作・個人の状態を表示するためnoindex    |
| `/candidates`、`/candidates/[id]`                                          | 公開確認が完了した実在データだけindex。現在0件 |

すべてfollowを許可します。robots.txtではクロールを許可して、ページのnoindexを読めるようにします。Vercel Preview・Developmentと開発サーバーでは公開ページもnoindexになり、サイトマップは空です。Sites側の閲覧制限はそのまま維持します。

`/issues?theme=...` は既存の操作画面として維持し、canonicalを `/issues` に統一します。テーマの説明を検索から読むURLは選挙ハブ配下に固定します。新しい候補者・Podcastの公開手順は [seo-publication.md](seo-publication.md) を参照してください。

サイトマップにはindex対象の正規URLだけを含めます。更新日を毎回現在時刻にする擬似的なlastmodは出力しません。OrganizationとWebSiteはホーム、OrganizationはAbout、BreadcrumbListは選挙ハブとテーマ詳細へ出力します。未公開の動画や候補者の構造化データは出力しません。

## Search Consoleと本番反映

2026-09-24に `oshisen.com` のドメインプロパティへのアクセスと登録済み状態を確認しました。確認時点でサイトマップの送信は0件です。ドメイン登録のやり直しやDNS変更は不要です。

1. 修正をVercel Productionへ反映する（ビルド: `npm run build:vercel`）。
2. `https://www.oshisen.com/robots.txt` がAllow、`/sitemap.xml` が200で17件の正規URLを返すことを確認する。トップ等にnoindex/X-Robots-Tagが残っていないか確認する。
3. Search Consoleのサイトマップへ `https://www.oshisen.com/sitemap.xml` を送信する。
4. `/`、`/about`、`/method`、`/sources`、`/ibaraki-2026/tsukuba` のURL検査で「公開URLをテスト」。取得可能・インデックス許可・ユーザー指定canonicalを確認してインデックス登録をリクエストする。
5. 数日以降、インデックス状況、検索クエリ、表示回数・クリック・CTR・順位を確認する。再送信を繰り返しても処理は早まりません。

「リダイレクトがあります」「適切なcanonicalのある代替ページ」は正規URLが正しければ正常です。「クロール済み・未登録」は技術設定だけで解消を保証できないため、対象URLの本文・重複・内部リンクを確認します。Googleが登録する時期は指定できません。

通常の訪問集計と研究の操作記録は分離したままです。新規テーマページは `/ibaraki-2026/tsukuba/issues/[theme]` にまとめ、個別の関心テーマやクエリ文字列を外部集計へ送りません。

## 検証

`npm run build:vercel` → `npm run test:vercel` で実際のHTTPレスポンス、17ページの固有title/description・canonical・index可否、除外ページ、プレビュー、サイトマップと各URLの整合、JSON-LD、404、転送を検証します。Sites互換性は `npm run build` → `npm test`、型・Lintは `npm run typecheck` と `npm run lint` で確認します。

2026-09-24の実装確認では、両ビルド、単体135件、Vercel HTTP 17件、Sitesルート10件、型検査とLintが成功しました。Chromeの390px幅で選挙ハブ・公共交通詳細・質問台帳に横方向のはみ出しがないこと、ページ移動と台帳アンカー、WebPロゴの読み込みを確認しています。本番への反映・サイトマップ送信・Googleの公開URLテストは別工程です。

参考: [Googleのnoindex仕様](https://developers.google.com/search/docs/crawling-indexing/block-indexing)、[正規URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)、[再クロールの依頼](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)、[Organization](https://developers.google.com/search/docs/appearance/structured-data/organization)、[パンくず](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)。
