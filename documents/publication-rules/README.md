# 候補者向け掲載規約の更新

現在の配布原本は、ユーザーから提供された [provided-v2.3.pdf](provided-v2.3.pdf)（統一改訂案 v2.3、2026年10月26日作成）です。本文・体裁を変更せず、そのままサイトで配布します。[content.md](content.md) は原本の全文照合用の転記です。

## 提供PDFの更新

1. 新しい提供PDFをこのディレクトリに保存し、`document.json` の `sourcePdf` を更新します。
2. `content.md` にタイトル、版・作成日、対象、全条項を転記します。原本の文字・句読点を保持し、紙面上の折り返しだけをつなぎます。見出しに `#` / `##` を付け、条項の番号・ピリオドは保持します。
3. `document.json` の条数・項数・附則の有無を確認します。現在は第1〜28条・計125項・附則なしです。
4. `npm run documents:preview` を実行します。全文照合・フォント検証の後、原本を配布先へコピーし、メタデータと全ページの画像を出力します。
5. 新しいPDFのページ数に対応する `tmp/pdfs/publication-rules/review-*.png` を確認します。
6. 原本・転記・設定・公開PDF・メタデータを同じ変更に含め、通常のサイト公開手順で反映します。

```sh
npm run documents:build    # 原本の検証・配布・メタデータ更新
npm run documents:preview  # 上記に加え、全ページをPNG化
npm run documents:check    # 配布漏れ・本文やPDFの変更を検知（Nodeのみ）
```

`sourcePdf` の指定中はTypstで再組版しません。提供PDFの用紙サイズ、ページ割り、番号、本文中の記号をそのまま保持します。現在のPDFはLetter・12ページです。全文照合で除外するのは転記に追加した見出し記号と空白・改行だけです。文中の `**` やバッククォートも原本にある文字として照合します。

サイトの `build` / `build:vercel` は `documents:check` を先に実行します。入力・スクリプトのハッシュと、提供原本・配布PDFのバイト単位の一致を検証するため、旧版に戻ったり配布ファイルだけが変わったりするとビルドが停止します。通常のWebビルドにTypstやPopplerは不要です。

## ファイルの役割

| ファイル | 役割 |
| --- | --- |
| `provided-v2.3.pdf` | ユーザー提供の配布原本 |
| `content.md` | 原本の全文照合用の転記 |
| `document.json` | 配布ファイル名、原本、想定条数・項数、附則の有無 |
| `design-spec.md` / `layout.typ` / `fonts/` | Markdownから再組版する場合の既存設定・書体 |
| `../../scripts/publication-rules.mjs` | 検証、配布、プレビューの処理 |
| `../../lib/publication-rules.json` | 自動生成するタイトル、版・日付、ページ数、容量、URL、検証ハッシュ |
| `../../public/documents/oshisen-candidate-publication-rules-2026.pdf` | サイトが配布するPDF。Git管理対象 |

同じ配布PDFを `output/pdf/` にも出力します。Webサイトから配信するのは `public/documents/` の1ファイルです。ページ数・容量・版・日付は自動生成されたメタデータを参照します。

## 実行環境

- Node.js：プロジェクトの指定バージョン
- Poppler：`pdfinfo`、`pdffonts`、`pdftotext`、`pdftoppm`
- Typst **0.15.1**：`sourcePdf` を使わずMarkdownから再組版する場合のみ

macOSでは `brew install poppler` で検証ツールを導入できます。

## Markdownから再組版する場合

本文改訂・再組版が必要になった場合は、`document.json` から `sourcePdf` を外し、`content.md` を正本として編集します。原稿形式は「`# タイトル`、対象選挙・版・日付（末尾の「作成」は任意）、対象地域・前文、`## 第n条 見出し`、`1. 本文`」の段落形式です。附則がある場合は `## 附則（改定案）` と連番の項を用います。設定の条数・項数・附則も更新します。

このモードでは、同梱のNoto Sans JP / Noto Serif JPと `layout.typ` によりA4に組版し、項番号の構文用ピリオド、太字・引用・見出し記号を除いて全文照合します。埋め込みフォント、PDFタグ、A4、自動ページ番号も検証します。新しいMarkdown構文を追加する場合は、組版と照合の両方に対応が必要です。`npm run documents:preview` 後に全ページを目視確認してください。

フォントの再配布条件は `fonts/OFL-NotoSansJP.txt`、`fonts/OFL-NotoSerifJP.txt` にあります。フォントは2026年10月10日にGoogle Fonts公式リポジトリから取得したものです。生成時の通信や外部Typstパッケージは不要です。

## 配信と改訂履歴

固定URLは `/documents/oshisen-candidate-publication-rules-2026.pdf` です。フッター、`/about#publication-rules`、`/neutrality#section-13`、`/method#numeric-comparison` から参照します。デプロイ後は固定URLのPDFと版・日付を確認してください。旧版はGitの履歴から取得できます。

本リポジトリの本番はREADMEのVercel公開手順に従います。PDFの検証・配布処理やローカルビルド自体は、本番公開を実行しません。
