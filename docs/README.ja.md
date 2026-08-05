<div align="center">

# Maeul in the Sky · 天空の村

**GitHub のコントリビューションから、生きたアイソメトリックの村を作ります。**

[![npm version](https://img.shields.io/npm/v/maeul-in-the-sky?color=cb3837&logo=npm)](https://www.npmjs.com/package/maeul-in-the-sky)
[![CI](https://github.com/t1seo/maeul-in-the-sky/actions/workflows/ci.yml/badge.svg)](https://github.com/t1seo/maeul-in-the-sky/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)

[English](../README.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [中文](README.zh.md)

<br />

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../.github/assets/preview-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="../.github/assets/preview-light.svg">
  <img alt="GitHub Contribution Calendar から作られたアイソメトリックの村" src="../.github/assets/preview-dark.svg" width="840">
</picture>

[**プリセットデモ**](https://t1seo.github.io/maeul-in-the-sky/) · [クイックスタート](#クイックスタート) · [npm](https://www.npmjs.com/package/maeul-in-the-sky) · [ショーケース](../SHOWCASE.md)

</div>

Maeul（마을）は韓国語で「村」という意味です。Contribution Calendar の一日一日が空に浮かぶ Terrain の一部になり、静かな日は水や草地に、活発な日は森、農場、村、都市、珍しい Wonder に変わります。

出力は独立した 2 つの SVG です。プロフィール README で GitHub のカラーモードに合わせて切り替わり、クライアント側の JavaScript は必要ありません。

## 村に含まれるもの

- 100 段階の標高を持つ決定論的なアイソメトリック Terrain
- カレンダーに沿った四季と 48 種類の季節アセット
- 自動生成される川、池、森、天候、環境アニメーション
- 木や農場から塔や動物まで、118 種類の Terrain アセット
- Rare、Epic、Legendary の 30 種類の Epic Wonders
- アクセシブルなタイトルと説明、視差効果を減らす設定に対応したダーク・ライト SVG
- 北半球と南半球の季節配置
- 対象期間、活動日数、ストリーク、最も活発な月、発見した Wonder 数

## 村のプリセット

プリセットは表示されるアセットを変えます。コントリビューション数、標高、色は変えません。

| Nature | Balanced | Civilization |
|:---:|:---:|:---:|
| [![Nature プリセット](demo/assets/preset-nature-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=nature&mode=dark) | [![Balanced プリセット](demo/assets/preset-balanced-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=balanced&mode=dark) | [![Civilization プリセット](demo/assets/preset-civilization-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=civilization&mode=dark) |
| 森と開けた土地を多く | 自然、農場、町のバランス | 普段の活動日にも建物を多く |
| `preset: nature` | `preset: balanced` | `preset: civilization` |

## クイックスタート

### 1. Action を追加

GitHub プロフィールで使う場合は、ユーザー名と同じ名前のリポジトリに `.github/workflows/maeul-sky.yml` を追加します。

```yaml
name: Update Maeul in the Sky

on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - uses: t1seo/maeul-in-the-sky@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          preset: balanced

      - uses: stefanzweifel/git-auto-commit-action@v7
        with:
          commit_message: 'chore: update Maeul in the Sky'
```

GitHub ユーザー名の既定値はリポジトリ所有者です。別のユーザーの Terrain を作る場合だけ `username` を指定してください。

### 2. 一度実行

**Actions → Update Maeul in the Sky → Run workflow** を開きます。最初の実行で次のファイルが作られます。

- `maeul-in-the-sky-dark.svg`
- `maeul-in-the-sky-light.svg`

コミットが拒否された場合は、**Settings → Actions → General → Workflow permissions** で読み取り・書き込み権限を許可してください。

### 3. README に追加

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./maeul-in-the-sky-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./maeul-in-the-sky-light.svg">
  <img alt="自分の GitHub コントリビューション村" src="./maeul-in-the-sky-dark.svg" width="100%">
</picture>
```

## Action の入力

| 入力 | 説明 | 既定値 |
|---|---|---|
| `username` | Contribution Calendar を取得する GitHub ユーザー | リポジトリ所有者 |
| `github_token` | GitHub GraphQL API トークン | `${{ github.token }}` |
| `theme` | Theme レンダラー | `terrain` |
| `title` | SVG のタイトル | `@username` |
| `output_dir` | 2 つの SVG を保存するディレクトリ | `./` |
| `year` | 暦年。省略すると直近 52 週間 | 直近 52 週間 |
| `hemisphere` | 季節配置: `north` または `south` | `north` |
| `preset` | `nature`、`balanced`、`civilization` | `balanced` |
| `density` | 1 から 10 の高度な建物密度上書き | プリセット値 |

出力 `dark_svg_path` と `light_svg_path` には生成されたファイルパスが入ります。

```yaml
- uses: t1seo/maeul-in-the-sky@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    username: octocat
    preset: nature
    hemisphere: south
    title: 'Octocat’s coding village'
```

3 つのプリセットより細かく調整したい場合だけ `density` を使います。値を高くすると活動量が低いセルにも建物が現れ、低くすると自然が多く残ります。

## Terrain Generation の仕組み

コントリビューション強度は、そのユーザー自身の活動範囲で相対的に正規化されます。人数によって件数が違っても、それぞれの忙しい日は都市になり得ます。

| 活動パターン | Terrain の結果 |
|---|---|
| 活動なし | 水と空き地 |
| 少ない活動 | 岸、草地、小さな植物 |
| 継続的な活動 | 森と農場 |
| 高い活動 | 村と町 |
| 最大の活動 | 都市、塔、Wonder 候補 |

継続すると島が広がり、一日の強度が各セルを発展させます。ユーザー名、Contribution Calendar、年、半球、密度が同じなら配置も同じです。

### Epic Wonders

活発な Terrain では 30 種類の特別なランドマークを発見できます。

- **Rare 14 種類:** 富士山、巨大セコイア、コロッセオ、サンゴ礁など
- **Epic 10 種類:** オーロラ、タージ・マハル、氷河峰、生物発光の池など
- **Legendary 6 種類:** 浮島、ドラゴンの巣、世界樹、古代ポータルなど

Wonder の選択には、そのセルの活動量、周辺セルの豊かさ、全体の統計が使われます。読みやすさを保つため、間隔を空けて最大 3 つまで配置されます。

## CLI

Node.js 20 以降と GitHub トークンが必要です。

```bash
GITHUB_TOKEN="$(gh auth token)" npx --yes maeul-in-the-sky \
  --user octocat \
  --preset civilization \
  --output ./terrain
```

全オプションは `npx --yes maeul-in-the-sky --help` で確認できます。`--year` を省略すると直近 52 週間を使います。

## JavaScript API

```bash
npm install maeul-in-the-sky
```

```js
import { generateTerrain } from 'maeul-in-the-sky';

const result = await generateTerrain({
  username: 'octocat',
  token: process.env.GITHUB_TOKEN,
  preset: 'balanced',
  outputDir: './terrain',
});

console.log(result.darkPath, result.lightPath);
```

`fetchContributions`、`computeStats`、Theme レジストリ、プリセット一覧も公開しています。ESM と CommonJS の両方に TypeScript 宣言が含まれます。

## データとアクセシビリティ

- 毎回 GitHub GraphQL API からコントリビューションデータを直接取得します。
- 分析、ユーザーデータベース、テレメトリー送信はありません。
- SVG には集計値と日付だけが入り、リポジトリ名や個別の詳細は入りません。
- 見えるデータの範囲はトークン権限に従います。必要最小限の権限を使ってください。
- SVG は `<title>`、`<desc>`、`role="img"` を含み、モーションを減らす設定では静止表示になります。

## トラブルシューティング

- **SVG をコミットできない:** `contents: write` と Workflow permissions の読み取り・書き込み許可を確認してください。
- **別のアカウントが表示される:** `username` を設定してください。定期実行でもリポジトリ所有者が既定値です。
- **期間が今年 1 月からではない:** 正常です。`year` を省略すると GitHub プロフィールと同じ直近 52 週間を使います。
- **アニメーションしない:** OS のモーションを減らす設定や Markdown ホストの制限が考えられます。Terrain は静止画でも完全に表示されます。
- **非公開コントリビューションがない:** 指定したトークンから見えるデータだけを含められます。

その他は[サポート](../SUPPORT.md)を確認するか、[Issue を作成](https://github.com/t1seo/maeul-in-the-sky/issues/new/choose)してください。

## コミュニティ

- [ショーケース](../SHOWCASE.md)にプロフィールを共有
- [コントリビューションガイド](../CONTRIBUTING.md)
- [セキュリティポリシー](../SECURITY.md)
- [行動規範](../CODE_OF_CONDUCT.md)

## ライセンス

[MIT](../LICENSE) © [t1seo](https://github.com/t1seo)
