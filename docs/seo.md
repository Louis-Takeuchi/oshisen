# 検索公開の運用

正規URLは `https://www.oshisen.com`。`lib/seo.ts` をcanonical・OGP・構造化データ・robots・サイトマップの共通設定とします。`SITE_URL` を変更するときは本番のHTTPS正規ドメインを指定し、Vercelのドメイン転送も合わせて変更してください。現在、HTTPと非wwwからの永久転送はVercelで動作しています。末尾スラッシュはNext.jsが除去します。308は301同様の永久転送です。

## インデックス対象

| 対象                                                                       | 方針                                           |
| -------------------------------------------------------------------------- | ---------------------------------------------- |
| `/`、`/about`、`/method`、`/sources`、`/privacy`                           | index                                          |
| `/issues`、`/stories`、`/policy-register`                                  | 準備状況・草案・未検証の状態を明示してindex    |
| `/guides/high-school-election`、`/tsukuba/elections`                       | 出典付きの選挙入門・地域の情報案内としてindex |
| `/ibaraki-2026/tsukuba`、配下の8テーマ                                     | プロジェクト案内と設問案としてindex            |
| `/research`                                                                | 手元のJSONを確認する作業画面のためnoindex      |
| `/diagnosis`、`/questions`、`/results`、`/compare`、`/saved`、`/interests` | アプリ操作・個人の状態を表示するためnoindex    |
| `/candidates`、`/candidates/[id]`                                          | 公開確認が完了した実在データだけindex。現在0件 |

すべてfollowを許可します。robots.txtではクロールを許可して、ページのnoindexを読めるようにします。Vercel Preview・Developmentと開発サーバーでは公開ページもnoindexになり、サイトマップは空です。Sites側の閲覧制限はそのまま維持します。

`/issues?theme=...` は既存の操作画面として維持し、canonicalを `/issues` に統一します。テーマの説明を検索から読むURLは選挙ハブ配下に固定します。新しい候補者・Podcastの公開手順は [seo-publication.md](seo-publication.md) を参照してください。

サイトマップにはindex対象の正規URLだけを含めます。更新日を毎回現在時刻にする擬似的なlastmodは出力しません。OrganizationとWebSiteはホーム、OrganizationはAbout、BreadcrumbListは選挙ガイド・選挙ハブとテーマ詳細へ出力します。未公開の動画や候補者の構造化データは出力しません。

## 検索する人に合わせた入口

| 検索の例 | 主な入口 | 読者が確認できること |
| --- | --- | --- |
| 高校生 選挙、18歳 選挙、初めての投票 | `/guides/high-school-election` | 投票資格、投票の流れ、政策を読む観点、18歳未満でもできる学び |
| つくば市 選挙、つくば市 選挙 投票所 | `/tsukuba/elections` | 選挙の種類、公式の日程・投票所・期日前投票・結果の確認先 |
| 2026 茨城県議会議員選挙 つくば市 | `/ibaraki-2026/tsukuba` | 対象選挙、日程を確認するガイドへの入口、8つの政策テーマ、掲載準備状況 |

トップの見える本文、ガイドカード、フッターから各入口へリンクし、ガイド同士と選挙ハブにも関連リンクを置きます。本文と対応する固有のtitle・description、正規URL、パンくずを出力します。meta keywordsや隠しテキストの追加、類似記事の量産は行いません。

ガイド内の制度・日程は自治体・選挙管理委員会の一次情報を確認し、本文から出典をたどれるようにします。記載日程が過去になった場合は、過去の選挙と明示するか最新の公式案内に更新してください。運営者の年齢・学校・実績など、確認していない属性を検索対策のために補いません。候補者本人の回答が公開できた段階で、[掲載手順](seo-publication.md)に沿って独自の取材内容を充実させます。

方針の根拠は[GoogleのSEOスターターガイド](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)。上位表示や反映時期の保証はなく、内容と検索意図が合っているかを公開後のデータで確かめます。

## Search Consoleと本番反映

2026-09-24に `oshisen.com` のドメインプロパティへのアクセスと登録済み状態を確認しました。確認時点でサイトマップの送信は0件です。ドメイン登録のやり直しやDNS変更は不要です。

1. 修正をVercel Productionへ反映する（ビルド: `npm run build:vercel`）。
2. `https://www.oshisen.com/robots.txt` がAllow、`/sitemap.xml` が200で19件の正規URLを返すことを確認する（候補者情報が未掲載の時点）。トップ等にnoindex/X-Robots-Tagが残っていないか確認する。
3. Search Consoleのサイトマップへ `https://www.oshisen.com/sitemap.xml` を送信する。
4. `/`、`/guides/high-school-election`、`/tsukuba/elections`、`/ibaraki-2026/tsukuba` のURL検査で「公開URLをテスト」。取得可能・インデックス許可・ユーザー指定canonicalを確認してインデックス登録をリクエストする。
5. 公開日を記録し、数週間単位で検索パフォーマンスを前期間と比較する。上記のURLと「高校生」「つくば」「県議」などのクエリで絞り、表示回数・クリック・CTR・平均掲載順位を見る。再送信を繰り返しても処理は早まりません。

「リダイレクトがあります」「適切なcanonicalのある代替ページ」は正規URLが正しければ正常です。「クロール済み・未登録」は技術設定だけで解消を保証できないため、対象URLの本文・重複・内部リンクを確認します。Googleが登録する時期は指定できません。

通常の訪問集計と研究の操作記録は分離したままです。新規テーマページは `/ibaraki-2026/tsukuba/issues/[theme]` にまとめ、個別の関心テーマやクエリ文字列を外部集計へ送りません。

## 検証

`npm run build:vercel` → `npm run test:vercel` で実際のHTTPレスポンス、19ページの固有title/description・canonical・index可否、除外ページ、プレビュー、サイトマップと各URLの整合、JSON-LD、404、転送を検証します。選挙ガイドの本文・公式出典・内部リンクが初回HTMLに含まれることも確認します。Sites互換性は `npm run build` → `npm test`、型・Lintは `npm run typecheck` と `npm run lint` で確認します。

2026-09-24の実装確認では、両ビルド、単体135件、Vercel HTTP 17件、Sitesルート10件、型検査とLintが成功しました。Chromeの390px幅で選挙ハブ・公共交通詳細・質問台帳に横方向のはみ出しがないこと、ページ移動と台帳アンカー、WebPロゴの読み込みを確認しています。本番への反映・サイトマップ送信・Googleの公開URLテストは別工程です。

2026-10-08のガイド追加では、両ビルド、単体135件、Vercel HTTP 19件、Sitesルート11件、型検査とLintが成功しました。Chromeでホームから高校生ガイド、つくば市ガイドへの移動と目次リンクを確認し、390px幅で両ガイド・ホームに横方向のはみ出しがないことを確認しています。本番の読み取り確認では既存17ページのサイトマップと主要ページのindex許可は正常でした。この変更のデプロイ、Search Consoleの送信・登録リクエストは未実施です。

参考: [Googleのnoindex仕様](https://developers.google.com/search/docs/crawling-indexing/block-indexing)、[正規URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)、[再クロールの依頼](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)、[Organization](https://developers.google.com/search/docs/appearance/structured-data/organization)、[パンくず](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)。
