# オシセン

2026年 茨城県議会議員選挙を想定した Phase 0 の体験用プロトタイプです。
「政策 → 候補者 → 人となり → 深掘り → 一次情報」の順で、候補者を知る入口を作ります。

## 現在の内容

- TOP、診断開始、8問の回答、結果、候補者一覧・詳細、理念、仕組み、情報源・公平性、プライバシー。
- 5段階の回答、スキップ、前の質問への移動、同一タブ内での再開・見直し。
- 等重みの政策一致度、比較した質問数、近いテーマ・違ったテーマ、表示境界の同点者を含む結果。
- 五十音順の候補者一覧、氏名検索、個別ページのURLコピー・メタデータ。
- 任意のローカル行動記録、書き出し・削除、A/Bの表示切り替え。
- 青・白の「オ」ファビコン、スマホ保存用アイコン、共有カード、読み込みエラー時の再試行画面。

掲載されている4名は、要求定義で指定された仮名です。写真・所属・年齢・経歴・本人の発言は未登録です。
`lib/data.ts` の `candidates[].answers` は未回答のまま保持し、`demoAnswerFixtures` を操作・計算確認専用に分離しています。
数値は実際の候補者の政策や回答を示しません。外部リンクと動画も確認済み素材がないため未登録です。

## Vercelで公開する

このリポジトリは **Vercel用のNext.js** と、既存の **Sites用のvinext** の両方に対応しています。
アプリの画面とデータは共通です。Vercelへの公開操作は手動で行ってください。

1. Vercelで `Louis-Takeuchi/oshisen` をImportする。
2. Production Branchは `main`、Root Directoryはリポジトリのルート（未指定）にする。
3. Framework Presetは **Next.js**、Node.js Versionは **24.x** を選ぶ。
4. Build Commandは `npm run build:vercel`、Install Commandは `npm ci`。`vercel.json` に設定済みです。
5. Output Directoryは **Next.jsの既定値のまま**。`dist` や `public` に変更しない。
6. Deployする。追加のAPIキー・DB・環境変数は不要です。

独自ドメインが決まったら、必要に応じて環境変数 `SITE_URL=https://公開ドメイン` をProductionだけに設定して再デプロイします。
未設定時の共有画像URLはアクセス先ホストから生成されるため、VercelのPreview URLでも動きます。設定例は `.env.example` にあります。
既存のSitesの閲覧制限はVercelには引き継がれません。Vercel側の公開範囲・Deployment Protectionを確認してください。

```sh
npm ci
npm run dev:vercel
# 本番相当のビルド・配信チェック（公開操作は行いません）
npm run build:vercel
npm run test:vercel
# 本番相当のサーバーを自分で開く場合
npm run start:vercel
```

ローカルとVercelのビルドを揃えるため、Next.js標準のWebpackビルドを明示しています。
VercelにCloudflare Workerの `worker/index.ts` や `dist/` を指定する必要はありません。
設定の根拠：[VercelのNext.js対応](https://vercel.com/docs/frameworks/full-stack/nextjs)、[vercel.jsonの設定](https://vercel.com/docs/project-configuration/vercel-json)。

## Sitesでの開発と共通検証

Node.js 22.13以降が必要です。

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm run build
npm test
```

`npm test` のルート検査は直前の `dist/` を使います。コード変更後は先にビルドしてください。
マッチング・保存・行動記録はNodeのテスト、ページは配信用WorkerへのHTTPリクエストで検証します。
Sitesの公開用ビルドでは、ブラウザで診断開始・回答選択・戻る・スキップ・結果表示・候補者詳細への移動を確認済みです。
本番だけ画面移動が失敗する問題を防ぐため、ブラウザの起動コードと遅延読み込みする画面移動処理を分離し、生成コードの回帰検査も行います。
Vercel用は `npm run test:vercel` がNext.jsの本番サーバーを一時起動し、全ページ・404・アイコン・共有画像・配信用設定を検査します。
両ビルドが生成するルート型の競合を避けるため、`npm run typecheck` はNext.jsのルート型を再生成してから型検査します。
ファビコン類の再生成は `npm run icons:generate`。外部フォント・画像サービス・APIキーは不要です。

2026-09-14時点で `npm audit --omit=dev` の実行時依存関係は既知の脆弱性0件です。
既存のSites用ツール等の開発用依存関係には監査警告が残っています。今回、既存配信環境を大きく変更する一括更新は行っていません。

## データと計測

回答はブラウザの `sessionStorage` に保存します。保存できない環境ではページ内メモリを使います。
サーバー送信、アカウントへの紐付け、自動共有はありません。
操作記録は `/privacy#data-controls` で同意した場合のみ同じタブ内に保存し、回答の選択値・一致度は記録しません。

実験表示を確認するには `/privacy?variant=policy` または `/privacy?variant=policy-humanity` で操作記録を有効にします。
同意時の表示条件は削除するまで保持します。前者は結果・詳細の人柄、経歴、インタビュー部分を非表示にします。
現在はローカルの動作確認用であり、参加者間の集計や実証の効果測定は行いません。

## 本番データへの接続

- 設問・本人回答・出典の取得方法と更新・訂正手順を確定する。
- 候補者の掲載資格、選挙区、氏名、写真、所属、経歴を一次情報で確認する。
- デモ専用の型と計算経路を本番データ用に切り替え、未回答は未回答として扱う。
- `lib/resources.ts` に確認済みHTTPSリンクとインタビュー情報を登録する。リンクコンポーネントは種別別イベントに対応済み。
- 候補者写真が揃ったら、同じ寸法・画角で配置し、候補者ごとのOG画像を設定する。
- 運営・問い合わせ情報、計測の収集目的・保存期間・同意手順を確定する。

サイトはプロトタイプのため検索エンジンへのインデックスを無効にしています。
本番データを掲載して検索公開する際は、`app/layout.tsx` のrobots設定、`public/robots.txt`、`next.config.ts` の `X-Robots-Tag` を合わせて見直してください。
検索抑制はアクセス制限ではありません。デモ回答のままで実在候補者との一致度として公開しないでください。
Social preview の制作記録は `docs/social-preview.md` にあります。
