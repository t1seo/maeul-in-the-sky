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
- カレンダーに沿った四季と登録済み季節アセット ID 68 個
- 自動生成される川、池、森、天候、環境アニメーション
- 通常アセット ID 193 個: classic 189 個とオリジナルの韓国村アセット 4 個
- Rare、Epic、Legendary の 30 種類の Epic Wonders
- アクセシブルなタイトルと説明、視差効果を減らす設定に対応したダーク・ライト SVG
- 北半球と南半球の季節配置
- 対象期間、活動日数、ストリーク、最も活発な月、発見した Wonder 数
- banner/card レイアウト、full/subtle/off モーション、静的 PNG、ズーム可能なブラウザ探索
- バージョン付き設定・スナップショット、複数年比較、ローカル認証プレビュー

README プレビューと 6 枚のプリセット画像は、固定シードの**合成データ**を使い、**2025-01-05 から 2026-01-03 までの提供済み 364 日**を表示します。取得した実アカウントでも完全な 2025 年カレンダーでもありません。sparse/max プレビューは別の固定パターンで、元のベンチマーク fixture は再現可能な比較のため変更しません。

## 村のプリセット

プリセットは表示されるアセットを変えます。コントリビューション数、標高、色は変えません。

|                                                            Nature                                                             |                                                              Balanced                                                               |                                                                  Civilization                                                                   |
| :---------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------: |
| [![Nature プリセット](demo/assets/preset-nature-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=nature&mode=dark) | [![Balanced プリセット](demo/assets/preset-balanced-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=balanced&mode=dark) | [![Civilization プリセット](demo/assets/preset-civilization-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=civilization&mode=dark) |
|                                                     森と開けた土地を多く                                                      |                                                      自然、農場、町のバランス                                                       |                                                           普段の活動日にも建物を多く                                                            |
|                                                       `preset: nature`                                                        |                                                         `preset: balanced`                                                          |                                                             `preset: civilization`                                                              |

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
  <source media="(prefers-color-scheme: dark)" srcset="./maeul-in-the-sky-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="./maeul-in-the-sky-light.svg" />
  <img alt="自分の GitHub コントリビューション村" src="./maeul-in-the-sky-dark.svg" width="100%" />
</picture>
```

## Action の入力

| 入力             | 説明                                             | 既定値                     |
| ---------------- | ------------------------------------------------ | -------------------------- |
| `username`       | Contribution Calendar を取得する GitHub ユーザー | リポジトリ所有者           |
| `github_token`   | GitHub GraphQL API トークン                      | `${{ github.token }}`      |
| `theme`          | Theme レンダラー                                 | `terrain`                  |
| `title`          | SVG のタイトル                                   | `@username`                |
| `output_dir`     | 2 つの SVG を保存するディレクトリ                | `./`                       |
| `year`           | 暦年。省略すると直近 52 週間                     | 直近 52 週間               |
| `hemisphere`     | 季節配置: `north` または `south`                 | `north`                    |
| `preset`         | `nature`、`balanced`、`civilization`             | `balanced`                 |
| `density`        | 1 から 10 の高度な建物密度上書き                 | プリセット値               |
| `config`         | バージョン 1 設定 JSON のパス                    | なし                       |
| `input`          | スナップショット JSON。ネットワーク要求を省略    | なし                       |
| `write_snapshot` | 再利用可能なスナップショットを書く               | `false`                    |
| `motion`         | `full`、`subtle`、`off`                          | `full`                     |
| `layout`         | `banner` または `card`                           | `banner`                   |
| `village_style`  | `classic` または `korean`                        | `classic`                  |
| `layout_seed`    | 任意の決定論的レイアウトシード                   | ユーザー名/年/日付の識別子 |
| `normalization`  | `relative`、`fixed`、複数年専用 `shared`         | `relative`                 |
| `max_count`      | `fixed` 用の正の最大値                           | なし                       |
| `format`         | `svg`、`png`、`both`                             | `svg`                      |
| `scale`          | 静的 PNG の倍率 1〜4                             | `2`                        |
| `years`          | 重複しない 2〜5 年                               | なし                       |

既定出力は `dark_svg_path` と `light_svg_path` です。該当する実行では `dark_png_path`、`light_png_path`、`snapshot_path`、`archive_path`、`comparison_dark_svg_path`、`comparison_light_svg_path` も返します。

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

| 活動パターン | Terrain の結果        |
| ------------ | --------------------- |
| 活動なし     | 水と空き地            |
| 少ない活動   | 岸、草地、小さな植物  |
| 継続的な活動 | 森と農場              |
| 高い活動     | 村と町                |
| 最大の活動   | 都市、塔、Wonder 候補 |

件数が地形の高さを決めます。入力日付は、部分週や欠落期間も含め、実際の UTC 曜日と日曜始まりの週に配置されます。欠落日は作らず、既知の 0 件日は実際の 0 日として保持します。装飾がコントリビューションを増やすことはありません。

### Epic Wonders

活発な Terrain では 30 種類の特別なランドマークを発見できます。

- **Rare 14 種類:** 富士山、巨大セコイア、コロッセオ、サンゴ礁など
- **Epic 10 種類:** オーロラ、タージ・マハル、氷河峰、生物発光の池など
- **Legendary 6 種類:** 浮島、ドラゴンの巣、世界樹、古代ポータルなど

Wonder の選択には、そのセルの活動量、周辺セルの豊かさ、全体の統計が使われます。読みやすさを保つため、間隔を空けて最大 3 つまで配置されます。

## 探索とセットアップ

[デモ](https://t1seo.github.io/maeul-in-the-sky/)でプリセット、ユーザー名/年/タイトル、半球を選べます。詳細設定には密度、モーション、banner/card、classic/korean、高さスケール、レイアウトシードがあります。サンプル設定を変えてもアカウントは取得しません。実データにはスナップショットのインポートか、後述のローカルサービスを使ってください。

日付を選ぶと件数、Biome、配置を確認できます。探索画面は出典、正確な日付範囲、合計、活動日数、連続日数、高さ/季節凡例を表示します。ズーム、リセット、キーボード移動、Escape、フォーカス復帰に対応します。[Wonder 図鑑](https://t1seo.github.io/maeul-in-the-sky/#wonders)は発見/未発見と実際の条件を示します。条件を満たしても選択は保証されず、間隔、周辺 Terrain、確率、最大 3 個の予算も適用されます。

セットアップ欄から設定 JSON、ワークフロー、README 断片をダウンロードできます。生成ワークフローは `output` ブランチへ公開し、README 断片もそこを参照します。`${{` を含むタイトルやレイアウトシードは GitHub Actions 式として評価され得るためワークフローへ出力できませんが、画像と JSON では使用できます。

## CLI

Node.js 20 以上が必要です。以下の新オプションは現在 **Unreleased** です。ソース checkout では `npm install && npm run build` の後、`npx --yes maeul-in-the-sky` を `node dist/index.js` に置き換えてください。

```bash
GITHUB_TOKEN="$(gh auth token)" npx --yes maeul-in-the-sky \
  --user octocat --preset civilization --output ./terrain

npx --yes maeul-in-the-sky --input village.snapshot.json \
  --layout card --village-style korean --motion off --format both --scale 2 \
  --write-snapshot --output ./terrain

GITHUB_TOKEN="$(gh auth token)" npx --yes maeul-in-the-sky \
  --user octocat --years 2024,2025 --normalization shared --output ./archive
```

| CLI フラグ                        | 値と動作                                                      |
| --------------------------------- | ------------------------------------------------------------- |
| `--user`, `-u`                    | アカウント。input/config から推論可能                         |
| `--token`                         | 生成用トークン。明示した `--token` が `GITHUB_TOKEN` より優先 |
| `--theme`, `-t`                   | `terrain`                                                     |
| `--title`                         | 既定 `@username`                                              |
| `--output`, `-o`                  | 既定は現在のディレクトリ                                      |
| `--year`, `-y`                    | 暦年。省略時は直近 52 週                                      |
| `--years`                         | カンマ区切りの重複しない 2〜5 年。`--year` と競合             |
| `--preset`                        | `nature`(密度 2)、`balanced`(5)、`civilization`(9)            |
| `--density`                       | 整数 1〜10                                                    |
| `--hemisphere`                    | `north` / `south`                                             |
| `--config`                        | 設定 JSON パス                                                |
| `--input`                         | スナップショット/アーカイブ JSON。ネットワークなし            |
| `--write-snapshot [path]`         | 任意パスにスナップショットを書く。既定 off                    |
| `--motion`                        | `full` / `subtle` / `off`                                     |
| `--layout`                        | `banner`(840×240) / `card`(420×360)                           |
| `--style`, `--village-style`      | `classic` / `korean`                                          |
| `--normalization`                 | `relative` / `fixed` / アーカイブ専用 `shared`                |
| `--max-count`                     | 正の有限最大値。`fixed` では必須                              |
| `--layout-seed`                   | 任意の決定論的シード上書き                                    |
| `--format`                        | `svg` / `png` / `both`。既定 `svg`                            |
| `--scale`                         | PNG 倍率の整数 1〜4。既定 2                                   |
| `--help`, `-h`; `--version`, `-V` | ヘルプとバージョンを表示                                      |

インストール済み版の実際のフラグは `npx --yes maeul-in-the-sky --help`、ローカルサービスは `npx --yes maeul-in-the-sky preview --help` で確認してください。既定値は `terrain`、`balanced`、密度 `5`、`north`、`classic`、`full`、`banner`、相対 P90、直近 52 週です。優先順位は明示した CLI/Action/UI 値 → 読み込んだ設定 → 選択プリセットの既定 → ライブラリ既定です。単一レンダーでは `--config` がスナップショット設定より優先され、フィールド単位ではマージしません。明示したプリセットだけでは保存済み密度を置き換えません。format と PNG scale は保存するレンダー設定ではありません。

既定では引き続き `maeul-in-the-sky-{dark,light}.svg` の 2 ファイルだけを書きます。PNG とスナップショットは要求時だけ追加されます。`--format png` では SVG パス結果は空文字列です。

### 自分のアカウントをローカルでプレビュー

```bash
GITHUB_TOKEN="$(gh auth token)" npx --yes maeul-in-the-sky preview --port 4318
```

`http://127.0.0.1:4318/` を開き、**Fetch contributions** を選びます。サービスは loopback のみに bind し、サーバー環境のトークンだけを読みます。ブラウザにトークン入力欄はなく、リンク、JSON、フォームへトークンを置かないでください。公開静的デモは JSON のみをインポートし、localhost へ接続しません。ローカルプロセスはアカウント/年の応答を 5 分、最大 32 件キャッシュします。

## 保存データ、比較、プライバシー

設定 (`maeul-settings`)、スナップショット (`maeul-snapshot`)、アーカイブ (`maeul-archive`) は `schemaVersion: 1` です。parser は統計を再計算し、未対応バージョン、重複/不正日付、不正な件数/設定を拒否します。インポート上限は 2 MiB、合計 20,000 日、スナップショット 20 個です。

同一アカウントの 2〜5 年を比較できます。既定の共有スケールは選択スナップショットの正の件数を pool して P90 を求め、その最大値を固定正規化として manifest に保存します。同じ件数は同じ level/height になります。明示的な固定最大値が優先します。CLI アーカイブには年別画像/スナップショット、`archive.json`、縦積みの dark/light 比較 SVG が含まれます。

設定リンクにはユーザー名/タイトルなどの設定だけが入り、件数、トークン、スナップショット payload は入りません。スナップショット/アーカイブにはトークンから見えた日別日付と件数があり、非公開活動の合計を示す可能性があるため共有前に確認してください。出典ラベルは GitHub 由来の暗号学的証明ではありません。SVG は日付と件数だけを含み、リポジトリ名、活動詳細、実行スクリプト、外部リソースを含みません。

## レイアウト、モーション、安定性

dark/light は 1 回準備した scene を着色するため、Terrain、通常アセット、Wonder の geometry が一致します。layout version 1 は正規化ユーザー名、任意の `layoutSeed`、絶対日付を使います。固定正規化と周辺 context が不変なら、移動した期間の内部重複日は地形と通常配置を維持しますが画面位置は移動します。相対 P90 は高さを変え、隣接条件と全体 Wonder 予算は選択を変えることがあります。設定、範囲、将来の layout version が異なる場合、同一 pixel は保証しません。

相対正規化は正の P90 と平方根 mapping で level 1〜99 を作り、0 は 0 のままです。固定 mode は `maxCount` を使います。韓国スタイルは `hanok`、`pavilion`、`stoneWall`、`onggi` と適格な近隣 path を追加しますが、件数や Wonder 条件は変更しません。

banner/card はどちらも提供期間全体を保持します。`full` は全 ambient effect、`subtle` は遅い雲と穏やかな水、`off` は CSS animation/keyframe と SMIL を省略します。reduced-motion は完全な静的 fallback を選びます。PNG は常に `motion: off`、不透明背景、倍率 1〜4 (既定 2) で再レンダーした静止画像です。

## JavaScript とブラウザ API

```bash
npm install maeul-in-the-sky
```

```js
import { generateArchive, generateTerrain } from 'maeul-in-the-sky';

const result = await generateTerrain({
  username: 'octocat',
  token: process.env.GITHUB_TOKEN,
  preset: 'balanced',
  layout: 'card',
  villageStyle: 'korean',
  motion: 'off',
  format: 'both',
  writeSnapshot: true,
  outputDir: './terrain',
});

console.log(result.darkPath, result.lightPath, result.darkPngPath, result.snapshotPath);

await generateArchive({
  username: 'octocat',
  token: process.env.GITHUB_TOKEN,
  years: [2024, 2025],
  normalization: 'shared',
  outputDir: './archive',
});
```

Node entry は ESM/CommonJS と filesystem/network/PNG adapter を提供します。`maeul-in-the-sky/browser` ESM entry は Node filesystem、token client、WASM rasterizer を含まず、`renderTerrain`、`prepareTerrainScene`、`renderTerrainScene`、parser、settings、snapshot/archive helper、catalog を export します。ブラウザーと Node の入力は `style` と `villageStyle` に対応し、両方の値が異なる場合はエラーになります。バージョン 1 の設定は `style` でシリアライズします。同じ文書へ複数 scene を inline する場合は別 namespace を使ってください。

カスタム Theme のアーカイブ比較では SVG と CSS をローカルで解析し、名前空間の接頭辞と文字参照に対応します。各行を埋め込む際に XML 宣言と DOCTYPE を除去します。外部 DTD とカスタム実体は読み込まず、不正な XML や未対応の参照はアーカイブファイルを書き込む前に `InputValidationError` を返します。 参照への接頭辞の付与で値が衝突し、CSS 属性セレクターが元の一致・不一致を区別できなくなる場合も、書き込み前に同じエラーで拒否します。

ローカルスタイルシートのセレクターは対象年の行に限定され、汎用セレクターでもその行の描画参照を維持します。これは SVG の合成であり、CSS 全体のカプセル化ではありません。読み込んだスタイルシート、キーフレームやフォントなどのグローバル名、外部ドキュメント構造に依存するセレクターは既存の CSS の意味に従います。カスタムテーマでは名前を一意にし、スタイルを自己完結させてください。

## カタログと再現可能なプレビュー

[インタラクティブカタログ](demo/catalog/index.html)は通常アセット **193 = classic 189 + korean 4** と Wonder **30 = Rare 14 + Epic 10 + Legendary 6** を別々に集計します。通常アセットの 68 個は季節型、125 個は全季節型です。variant と配置 instance は ID 数を増やしません。[オンライン Wonder 図鑑](https://t1seo.github.io/maeul-in-the-sky/#wonders)では実際の発見状態と条件を確認できます。

生成スクリプトは固定 seed と UTC 日付を使います。記録済みの新規入力 SVG 最適化実験では、キャプチャした 6 SVG の gzip が 16.54〜17.06% 小さくなり、小さな subpixel 差がありました。これはレンダー速度や FPS 向上を証明せず、以後の全プレビューを測定した結果でもありません。詳細は[測定済みレンダーと SVG サイズ](demo/performance.md)を参照してください。

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
