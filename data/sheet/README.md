# 掲載データの取り込み（オシセン 掲載データ入力シート → サイト）

データの正本は Google スプレッドシート
**「オシセン 掲載データ入力シート（2026茨城県議選）」**（オシセンフォルダ）です。
大屋さんが入力し、竹内が以下の手順でサイトに取り込みます（手で打ち込まない）。

## 日常の反映手順（告示後は毎日18時に1回）

1. 大屋さんから「反映お願い」の連絡を受ける（17時までの入力分が対象）。
2. シートの各タブを「ファイル → ダウンロード → カンマ区切り（.csv）」で書き出し、
   このフォルダに **タブ名そのまま** で保存する：
   - `questions.csv` / `explainers.csv` / `candidates.csv` / `policy_answers.csv`
   - `background_answers.csv` / `corrections.csv` / `videos.csv`
   - ※ `news` タブはサイト側の `lib/news.ts` で管理する（取り込み対象外）
3. `npm run data:import` を実行 → `lib/generated/sheet-data.ts` が再生成される。
   - **approved=TRUE の行だけ**が出力される。FALSE に戻せば次の反映で消える（掲載停止）。
   - `caution`・`internal_note`・`note` などの運営用メモ列は出力されない。
   - `questions` の文言は一字一句そのまま取り込まれる。
4. 候補者の写真：Drive「候補者写真」フォルダの `candidate_id.jpg` を
   `public/candidates/` にコピーする（正方形・本人単独・加工なし）。
5. 候補者ページのシェア画像：`npm run share-images:generate -- --candidates`
   （質問カードを作り直すときは `npm run share-images:generate`）。
6. `npm test && npm run typecheck && npm run build` で確認してデプロイする。

## 12/4（告示日）の一斉公開

1. 大屋さんの合図を待つ（公開時刻は12/1までに連絡が来る）。
2. シート側で candidate_id が仮ID（`tmp-…`）から「選挙区-届出番号」
   （例 `tsukuba-01`）へ付け直され、approved=TRUE になっていることを確認する。
   仮IDのまま approved=TRUE の行があると `npm run data:import` は失敗する。
3. 上の反映手順をそのまま実行する。candidates が1人でも入ると、
   候補者一覧・候補者ページ・/q の比較行・/talk が自動で公開状態になる。

## 架空データでの動作確認（12/3まで）

- `npm run data:fixtures` → 候補者A〜D（2選挙区）の架空データが
  `lib/generated/sheet-data.ts` に入り、全画面をローカルで確認できる。
- **架空データはサイトに公開しない。** 確認が終わったら必ず
  `npm run data:import` で戻す。`generatedDataSource` が `"fixtures"` のままだと
  `npm test` が失敗して、ビルド前に気づける。

## コミットのルール

- このフォルダのCSVは **`questions.csv` 以外コミットしない**（.gitignore 済み）。
  explainers の下書きや候補者の実データ・運営メモを、公開リポジトリに
  置かないための措置。サイトに出る内容は `lib/generated/sheet-data.ts`
  （approved のみ・メモ列なし）としてコミットされる。

## 12/4までに竹内側で埋める残り

- **H01〜H04・F01の設問文の原文**：候補者送付版の質問票から
  `lib/candidates2026.ts` の `backgroundItems` の `text` に転記する
  （転記までは候補者ページに見出しだけが出る）。
- **候補者ページのシェア画像**：12/4の取り込み後に
  `npm run share-images:generate -- --candidates` で生成してコミットする。

## SNS流入（UTM）の計測

- SNSに貼るリンクには `?utm_source=instagram&utm_campaign=（投稿名）` を付ける。
- 計測（Vercel Web Analytics）には utm_source / utm_medium / utm_campaign /
  utm_content / utm_term の5項目だけを通し、他のクエリ・回答内容・個人を特定
  できる情報は送らない（lib/visitor-analytics.ts）。
- 初回に1度だけ確認：本番URLに `?utm_source=test&utm_campaign=utm-check` を
  付けて開き、Vercelのダッシュボード（Analytics → フィルタ）でUTMが見えるか
  確かめる。

## 12/12 18時〜投票終了

新規掲載・更新は行わない。例外は誤り・権利問題による緊急の非表示
（大屋さん連絡・堀下さん承認 → approved=FALSE → 随時反映）のみ。

## 12/14以降（アーカイブ表示）

`lib/site-phase.ts` の `sitePhase` を `"archive"` に変える（1行）。
候補者情報・動画・回答の全ページ上部にアーカイブ文言が出る。
ページは2030年12月31日まで公開を続ける。
