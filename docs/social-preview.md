# オシセン：ロゴとPOPデザイン

## 使用中の素材

- `public/brand-logo.png`：2172 × 724px、透過PNG。添付の手描きロゴを参照し、imagegenの背景・余白調整で用意。元添付を単純トリミングしたファイルではなく、画像ツールによる調整版です。
- `public/favicon.ico`：同じロゴ全体を白い正方形に収めた16・32・48px。
- `public/apple-touch-icon.png`、`public/icon-192.png`、`public/icon-512.png`：同じロゴ全体からのサイズ変換。
- `public/og.png`：1733 × 907px。サイトと同じ青・黄・ピンク、太い丸文字、黄色い影を使った共有カード。

以前の吹き出し＋きらめきのアイコンと、それを描くコードは置き換え済みです。旧吹き出し版の別バックアップはプロジェクト内に残していません。アイコンの再生成は `npm run icons:generate`。参照URLは `logo-2` で更新しています。

横長のロゴ全体を使用する指定を優先し、ファビコンにも略字や別のマークを追加していません。小さなタブでは文字自体は読み取りにくくなります。

## UI方針

- 青 `#0649ef`、黄 `#ffe56b`、ピンク `#ed377c`、紙色 `#fffdf7`、本文 `#172145`。
- POPな丸枠・黄色マーカー・ずらした影。文章と操作ボタンは傾けない。
- 候補者は同じカード・配色で扱い、賛否を善悪の色に置き換えない。一致度の計算、候補者の順序、保存機能は維持。
- 共通テーマ：`app/pop-theme.css`。ホーム：`app/home-pop.module.css`。比較・保存・争点・出典も同じトークンを使用。
- 通常テキストと選択状態の配色は4.5:1以上のコントラストを自動検査。動きを減らす設定・キーボードフォーカス・狭い画面を考慮。

## 画像の制作記録

内蔵 `image_gen` を使用。ロゴの背景調整1回、共有カード生成1回。CLI/APIキーによる生成は使用していません。日本語本文、ロゴの文字・ハート・配色、画像端の欠けがないことを画像で確認しました。ブラウザによる画面操作・スクリーンショットの検証はこの変更では行っていません。

ロゴ生成元：`/Users/louistakeuchi/.codex/generated_images/01a09e16-1e18-72c0-af7c-9becd8246422/exec-b77e539b-c3a2-4587-82fa-1cfaaca49af0.png`

共有カード生成元：`/Users/louistakeuchi/.codex/generated_images/01a09e16-1e18-72c0-af7c-9becd8246422/exec-8d03016d-1fc2-4624-994a-fb4743be6434.png`

### ロゴ調整の最終プロンプト

```text
Use case: background-extraction. Asset type: production website brand logo. Image 1 is the EDIT TARGET: the user's uploaded Japanese hand-painted オシセン! wordmark. Make a clean tightly framed version on a genuinely transparent background. Preserve the EXACT original handwritten blue lettering, exact Japanese characters オ シ セ ン !, the small magenta hand-drawn heart beside the exclamation, original yellow offset strokes and little black/yellow accent rays. Do NOT redesign, retype, simplify, invent a new symbol, add a speech bubble, or change the original arrangement. Only remove the large blank white margins and white background, preserving the authentic brush shapes and colors faithfully. Entire original wordmark and all accent strokes must remain uncropped. Output one wide landscape image, around 3:1 aspect ratio, tightly framed with modest ~4% clear edge space. This is a standalone logo asset, no mockup, no extra words.
```

### 共有カードの最終プロンプト

```text
Use case: ads-marketing. Asset type: complete social sharing card for neutral Japanese candidate-discovery website オシセン, landscape aspect ratio 1.91:1. Input image1 is the brand logo to faithfully reuse, not redesign: handwritten electric blue オシセン! with yellow offset strokes and small pink heart. Create a cohesive polished Japanese POP editorial card, warm white (#fffdf7) base, blue (#0649ef), sunshine yellow (#ffe56b), occasional pink (#ed377c), dark navy (#172145). Main headline exactly 「政治家の気にピ、つくってみない？」 large bold friendly Japanese rounded typography over two lines, with yellow marker underline beneath 気にピ. Supporting line exactly 「政策で出会い、人柄で興味を深める。」. Place the provided full logo clearly in the upper area, headline central/left, use small CSS-like sticker motifs, loose ink accent rays and playful numbered circles 01 02 03 toward bottom as restrained graphic decoration. Include small footer label exactly 「オシセン / プロトタイプ」. Keep comfortable safe margins on every edge, large legible text for link unfurls. No people, no candidate faces, no invented policy positions, no voting endorsement, no additional logos, no additional text, no speech bubble icon. This should look like the actual website: chunky rounded cards, yellow hard offset shadows, bold blue primary actions, pink tiny accent. Complete final artwork with all typography as one flat image, no device mockup. Output around1200x630orhigher sameaspect.
```
