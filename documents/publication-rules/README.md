# 候補者向け掲載規約の更新

本文の正本は [content.md](content.md)、紙面の設定は [layout.typ](layout.typ) です。本文をTypstに転記せず、TypstがMarkdownを直接読みます。原稿にある「正式案 v1.0」もそのまま表示しています。

## 通常の更新

1. `content.md` の本文を編集します。改訂する場合は2段落目の版・日付も更新します。
2. `npm run documents:preview` を実行します。PDFの再生成、全文照合、ページ画像の出力まで行います。
3. `tmp/pdfs/publication-rules/review-*.png` の全ページで文字、行間、改ページを確認します。ページ数が減った場合、以前の余分な画像ではなく、新しいPDFのページ数までを確認してください。
4. 原稿・レイアウト・公開PDF・`lib/publication-rules.json` を同じ変更に含め、通常のサイト公開手順でデプロイします。

```sh
npm run documents:build    # PDF生成＋全文・条項数・埋め込みフォントの検証
npm run documents:preview  # 上記に加え、全ページをPNG化して目視確認
npm run documents:check    # 再生成漏れ・PDFの改変を検知（Nodeのみで動作）
```

サイトの `build` / `build:vercel` は `documents:check` を先に実行します。本文・Typst・フォント・生成スクリプトを変更して再生成を忘れると、サイトのビルドが停止します。通常のWebビルドではTypstやPopplerを必要としません。

## ファイルの役割

| ファイル | 役割 |
| --- | --- |
| `content.md` | ユーザー提供Markdownの正本。初回取り込み時は元ファイルとバイト単位で同一 |
| `design-spec.md` | 提供されたデザイン要件の原本 |
| `layout.typ` | A4の余白、書体、サイズ、行間、項番号、ページ番号、リンクの組版 |
| `document.json` | 配布ファイル名、想定条数・項数、Typstのバージョン |
| `fonts/` | 再現性のため同梱したNoto Sans JP / Noto Serif JPとOFLライセンス |
| `../../scripts/publication-rules.mjs` | 生成、本文照合、配布、プレビューの処理 |
| `../../lib/publication-rules.json` | 自動生成。タイトル、版・日付、ページ数、容量、URL、検証ハッシュ |
| `../../public/documents/oshisen-candidate-publication-rules-2026.pdf` | サイトが配布するPDF。Git管理対象 |

ダウンロード用の同じPDFを `output/pdf/` にも出力します。Webサイトから配信するのは `public/documents/` の1ファイルだけです。版・日付・容量・ページ数は自動生成されたメタデータをサイトが参照するため、画面の手修正は不要です。

## 組版環境

- Node.js：プロジェクトの指定バージョン
- Typst：**0.15.1**（`typst --version` で確認）
- Poppler：`pdfinfo`、`pdffonts`、`pdftotext`、`pdftoppm`

macOSでは `brew install typst poppler` で導入できます。Typstを更新する際は `document.json` の版も変更し、全ページを再確認してください。フォントは同梱しており、追加インストールや生成時の通信は不要です。外部Typstパッケージも使用しません。

Typstだけで開く場合は、プロジェクトにこのディレクトリ全体を含め、`fonts/` のNoto書体を読み込んで `layout.typ` をコンパイルします。公開用PDFへの反映には上記コマンドを使用してください。

```sh
typst compile --root documents/publication-rules \
  --font-path documents/publication-rules/fonts \
  --ignore-system-fonts --ignore-embedded-fonts \
  documents/publication-rules/layout.typ /tmp/publication-rules.pdf
```

## 原稿形式と検証

原稿は「`# タイトル`、版・日付、前文、`## 第n条 見出し`、`1. 本文`、附則」の段落形式を維持してください。段落の区切りは空行です。原稿は文字列として扱い、Typstコードとして評価しません。新しいMarkdown装飾・脚注・表の追加時は、組版・検証処理を明示的に対応させてください。

現在は第1〜28条・計110項を検証します。内容の改訂で数が変わる場合のみ、内容確認とともに `document.json` の期待値を更新します。本文の途中への手動改行や改ページ指定は不要です。項は必要に応じてページをまたぎ、Typstの孤立行制御と見出しの追従設定で見出しだけが残ることを防ぎます。

全文照合で除外するのはMarkdownの見出し記号、空白・改行、自動フッターだけです。条番号、項番号、句読点、URL、メールアドレス、日付・時刻は照合対象です。日本語フォントの埋め込み・サブセット・Unicode対応、A4、PDFタグ、自動ページ番号も検査します。見た目の確認は自動検査とは別に全ページで行います。

## 配信と改訂履歴

固定URLは `/documents/oshisen-candidate-publication-rules-2026.pdf` です。フッター、`/about#publication-rules`、`/neutrality#section-13` から参照します。デプロイ後は固定URLのPDFと版・日付を確認してください。配布済みの旧版が必要な場合はGitの履歴からその版のPDFを取得できます。同意書等から特定版を恒久参照する運用に変える際は、別名の保存版PDFも追加してください。

本リポジトリの本番はREADMEのVercel公開手順に従います。PDF生成やローカルビルド自体は本番公開を実行しません。

## 書体と実装参照

2026年10月10日にGoogle Fonts公式リポジトリから取得した可変フォントをそのまま同梱しています。再配布条件は `fonts/OFL-NotoSansJP.txt`、`fonts/OFL-NotoSerifJP.txt` にあります。

- [Noto Sans JP](https://github.com/google/fonts/tree/main/ofl/notosansjp)
- [Noto Serif JP](https://github.com/google/fonts/tree/main/ofl/notoserifjp)
- [Typstの段落設定](https://typst.app/docs/reference/model/par/)
- [Typstの番号付きリスト](https://typst.app/docs/reference/model/enum/)
- [Typstの孤立行制御](https://typst.app/docs/reference/text/text/#parameters-costs)
