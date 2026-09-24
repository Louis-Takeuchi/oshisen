# 候補者・Podcast公開時のSEOデータ

現時点では `lib/data.ts` の候補者、`lib/published-interviews.ts` の取材ブロック・エピソードは空です。SEO実装のための架空の候補者・回答・動画は追加しません。

## 候補者

既存の `Candidate.id` が `/candidates/[id]` の固定URLです。名前の変更に合わせてIDを変更しないでください。`seo` は任意で、`title`、`description`、`ogImage` を指定できます。

`candidateSeo(candidate)` は `{ title, description, image? }` を返します。タイトル・説明文の指定が空なら氏名・選挙・選挙区から生成します。画像は同一サイト内の `/` で始まるパス、またはHTTPS URLを受け付けます。指定がなければページ側の共通画像を使います。文言は実際の掲載内容に合わせ、未収録のインタビューや未掲載の経歴が読めるとは約束しません。

`isCandidateIndexable(candidate)` は次をすべて満たすときだけ `true` を返します。

- `publication.status` が `published`。編集担当者が実在する人物の掲載を承認した後で設定します。
- `publication.profileSourceUrl` が本人・選挙管理委員会などの確認済み一次資料のHTTPS URL。
- `publication.verifiedAt` と `publication.publishedAt` が過去または当日の実在する日付（`YYYY-MM-DD`）で、確認日が公開日以前。
- 安定した英数字・ハイフン・アンダースコアのIDと、空でない氏名がある。

この関数はURLの構文と公開状態を確認します。URLに実際に書かれた内容の確認や本人の同定を代行しません。候補者の新規追加時・訂正時には一次資料を確認し、必要な承認後に日付と状態を更新してください。情報の再確認が必要になった場合は `draft` に戻します。`publication` のない既存形式のレコードは自動でindex対象になりません。

候補者ページのrobots設定とサイトマップの両方で同じ関数を使います。政策回答の公開可否は引き続き `lib/policy.ts` の確認条件に従い、候補者プロフィールの承認で未確認回答を公開しないでください。

## Podcast・本人インタビュー

`InterviewEpisode` は、研究用の `InterviewDocument` を変更せず、公開エピソード単位の情報を保持する型です。

| 項目                                | 内容                                     |
| ----------------------------------- | ---------------------------------------- |
| `id` / `candidateId`                | 固定エピソードID・候補者ID               |
| `title` / `description`             | 実際の内容に即したタイトルと説明         |
| `publicationStatus` / `publishedAt` | 下書き・公開状態と公開日（`YYYY-MM-DD`） |
| `youtubeUrl` / `audioUrl`           | 公開済み原音の実URL                      |
| `thumbnailUrl` / `durationSeconds`  | 承認済み画像と実際の再生時間             |
| `transcriptUrl` / `transcript`      | 文字起こしのURL、開始秒・終了秒付き本文  |
| `chapters`                          | 見出し・開始秒・対応する共通質問ID       |
| `blockIds`                          | 承認済みの取材ブロックへの参照           |
| `seo`                               | 任意のタイトル・説明・共有画像の上書き   |

`interviewSeo(episode)` は `{ title, description, image? }` を返すメタデータ生成用関数です。公開承認や検索対象化は行いません。`publishedInterviewEpisodes` への登録だけでページは生成されません。

将来エピソードページを実装するときは、既存の `getPublishableInterviewBlocks()` による原音・文脈・本人・公開の確認を維持し、全文文字起こしとチャプターも実際の録音に照合してください。研究ファイルの検証と公開エピソードの編集は別です。

現時点で `VideoObject` は出力しません。一般公開され、ページ上で実際に視聴できる動画と確認済みの公開日・サムネイルが揃ってから実装します。未収録・非公開動画用のダミーURLや構造化データは使いません。

検証：`node --test tests/publication-seo.test.ts tests/interviews.test.ts tests/research-study.test.ts`

## ロゴの配信サイズ

`components/brand-logo.tsx` は共有ヘッダー・フッターとトップのロゴを `<picture>` で表示します。対応ブラウザでは `public/brand-logo.webp` を使い、PNGをフォールバックとして残します。元画像・アイコン・表示寸法・alt・CSSは変更しません。優先する画像は eager/high priority で読み込み、PNGを別途preloadして二重取得しないようにします。

再生成は `node scripts/generate-logo-webp.mjs`。承認済みの `public/brand-logo.png` 全体を縦横比・透明部分を維持して幅1080px、WebP品質90で変換します。切り抜き・再描画・元ファイルの上書きは行いません。
