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

[**SVG 村スタジオ**](https://t1seo.github.io/maeul-in-the-sky/) · [3D ツアー](https://t1seo.github.io/maeul-in-the-sky/tour/) · [クイックスタート](#クイックスタート) · [npm](https://www.npmjs.com/package/maeul-in-the-sky) · [ショーケース](../SHOWCASE.md)

</div>

Maeul（마을）は韓国語で「村」という意味です。Contribution Calendar の一日一日が空に浮かぶ Terrain の一部になり、静かな日は水や草地に、活発な日は森、農場、村、都市、珍しい Wonder に変わります。

出力は独立した 2 つの SVG です。プロフィール README で GitHub のカラーモードに合わせて切り替わり、クライアント側の JavaScript は必要ありません。

**バージョン 2.1.0** では、歩ける 3D カレンダー村、精細な外部の動物・景観モデル、地図ナビゲーションの改善、読みやすい日別詳細パネルを追加しました。標準表示は従来のカレンダー型 SVG です。地形実験は[別のアーカイブ](https://github.com/t1seo/maeul-in-the-sky/tree/archive/civilization-terrain-2026-09-21)に保存されています。[変更履歴](../CHANGELOG.md#210---2026-09-22)もご覧ください。

**1.x からの移行:** `ContributionData` を直接作成する場合は、追加された必須統計フィールドを含めるために `stats: computeStats(weeks)` を使ってください。新しいシーンはレイアウトバージョン 3 と更新済みアートを使用します。保存済みのバージョン 1・2 のシーンも引き続き対応します。

## カレンダーの村を歩く

[3D ツアー](https://t1seo.github.io/maeul-in-the-sky/tour/)では、同じ日付の村を Three.js で探索できます。メニューは英語で、動物・樹木・建物・小物と一部の Wonder に外部制作者のモデルを使用します。初期表示にはサンプルデータであることを明記しています。

[![精細な動物と景観を備えた 3D カレンダー村](../.github/screenshots/tour-assets/after.png)](https://t1seo.github.io/maeul-in-the-sky/tour/?snapshot=https%3A%2F%2Fraw.githubusercontent.com%2Ft1seo%2Ft1seo%2Fmain%2Fmaeul-in-the-sky.snapshot.json)

- **WASD** で歩き、**Q/E** または左右キーでその場で回転し、ドラッグで視点を動かします。タッチ操作にも対応します。
- 地図、または歩行中の地面をクリックすると、近くの安全な陸地へ移動します。正方形タイルの半透明地図は左右どちらの下隅にも配置でき、コンパスは実際の視線方向を示します。
- 季節ごとの視点、自動ツアー、昼・夕暮れ・夜を選べます。動物・風・水のアニメーションはモーション低減設定に従います。日別詳細パネルは不透明で、開いている間は紹介文と統計を隠します。

ローカルのモデルライブラリには **動物 24 種と GLB ファイル 65 個**が含まれます。[クレジット](https://t1seo.github.io/maeul-in-the-sky/tour/credits.html)に制作者・ライセンス・改変内容を記載しています。[全 240 ID の対応表](demo/tour/models/coverage.md)では、外部モデル 95 ID、既存の詳細と組み合わせた 31 ID、維持した 114 ID を区別しています。地形・水・道・環境効果はカレンダーの動作を維持します。モデルと帰属情報は Pages と npm プレビューに同梱され、実行時に外部モデル CDN を利用しません。

自分の村を開くには、Action のステップでスナップショット出力を有効にし、生成された `maeul-in-the-sky.snapshot.json` を SVG と一緒にコミットしてください。

```yaml
- uses: t1seo/maeul-in-the-sky@v2.1.0
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    write_snapshot: 'true'
```

次の URL の `USERNAME` を GitHub ユーザー名に置き換えます。

```text
https://t1seo.github.io/maeul-in-the-sky/tour/?snapshot=https%3A%2F%2Fraw.githubusercontent.com%2FUSERNAME%2FUSERNAME%2Fmain%2Fmaeul-in-the-sky.snapshot.json
```

例はクイックスタートの `main` ブランチを使用しています。スタジオで生成したワークフローは `output` に公開するため、実際の公開ブランチとファイルパスに合わせて URL を変更してください。

README の既存の `<picture>…</picture>` を `<a href="TOUR_URL">…</a>` で囲むと、GitHub 上の SVG をクリックして同じ記録の村へ移動できます。明暗の画像 URL はそのまま使えます。[実際のプロフィールの村を訪れる](https://t1seo.github.io/maeul-in-the-sky/tour/?snapshot=https%3A%2F%2Fraw.githubusercontent.com%2Ft1seo%2Ft1seo%2Fmain%2Fmaeul-in-the-sky.snapshot.json)。

日付・貢献数・配置 ID・季節の水域・獲得した Wonder を保ち、元の絵を 3D で表現します。未獲得の家や Wonder は追加しません。水で分かれた場所には地図や季節の視点から移動できます。GitHub raw / Pages の公開 HTTPS スナップショット（最大 2 MiB、800 日間）に対応し、無効な URL はサンプルに置き換えずエラーを表示します。

## 村に含まれるもの

- 100 段階の標高を持つ決定論的なアイソメトリック Terrain
- 葉、花、シルエット、素材の色で区別できるカレンダーに沿った四季
- 自動生成される川、池、森、天候、環境アニメーション
- 通常アセット ID 210 個: classic 197 個 + korean 13 個（季節型 68 個、通年型 142 個）
- Rare、Epic、Legendary の 30 種類の Epic Wonders
- 既存の絵を刷新し、韓国の農村 9 ID と自然景観 8 ID を追加した計 240 ID
- 文化と独立した miniature/pixel の画風と、元の貢献数に基づく日別報酬
- アクセシブルなタイトルと説明、視差効果を減らす設定に対応したダーク・ライト SVG
- 北半球と南半球の季節配置
- 対象期間、活動日数、ストリーク、最も活発な月、発見した Wonder 数
- banner/card レイアウト、full/subtle/off モーション、静的 PNG、ズーム可能なブラウザ探索
- バージョン付き設定・スナップショット、複数年比較、ローカル認証プレビュー

README プレビューと 6 枚のプリセット画像は、固定シードの**合成データ**を使い、**2025-01-05 から 2026-01-03 までの提供済み 364 日**を表示します。取得した実アカウントでも完全な 2025 年カレンダーでもありません。sparse/max プレビューは別の固定パターンで、元のベンチマーク fixture は再現可能な比較のため変更しません。

## 村のプリセット

プリセットは追加装飾の構成を変えます。コントリビューション数、標高、色、日別報酬の段階は変えません。

|                                                            Nature                                                             |                                                              Balanced                                                               |                                                                  Civilization                                                                   |
| :---------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------: |
| [![Nature プリセット](demo/assets/preset-nature-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=nature&mode=dark) | [![Balanced プリセット](demo/assets/preset-balanced-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=balanced&mode=dark) | [![Civilization プリセット](demo/assets/preset-civilization-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=civilization&mode=dark) |
|                                                     装飾を抑え、余白を多く                                                      |                                                      毎日の自然景観に程よい装飾                                                       |                                                           同じ日別景観に豊かな装飾                                                            |
|                                                       `preset: nature`                                                        |                                                         `preset: balanced`                                                          |                                                             `preset: civilization`                                                              |

## クイックスタート

### 1. Action を追加

GitHub プロフィールで使う場合は、ユーザー名と同じ名前のリポジトリに `.github/workflows/maeul-sky.yml` を追加します。

例では `@v2.1.0` を固定します。互換性のある更新を追従するには `@v2` を使ってください。`@v1` は以前のメジャーバージョンを維持します。不変の参照が必要な場合は、検証済みの完全なコミット SHA を固定してください。

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

      - uses: t1seo/maeul-in-the-sky@v2.1.0
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
| `density`        | 1 から 10 の追加装飾の構成上書き                 | プリセット値               |
| `config`         | バージョン 1 設定 JSON のパス                    | なし                       |
| `input`          | スナップショット JSON。ネットワーク要求を省略    | なし                       |
| `write_snapshot` | 再利用可能なスナップショットを書く               | `false`                    |
| `motion`         | `full`、`subtle`、`off`                          | `full`                     |
| `layout`         | `banner` または `card`                           | `banner`                   |
| `village_style`  | 文化: `classic` または `korean`                   | `classic`                  |
| `art_style`      | 独立した画風: `miniature` または `pixel`          | `miniature`                |
| `layout_seed`    | 任意の決定論的レイアウトシード                   | ユーザー名/年/日付の識別子 |
| `normalization`  | `relative`、`fixed`、複数年専用 `shared`         | `relative`                 |
| `max_count`      | `fixed` 用の正の最大値                           | なし                       |
| `format`         | `svg`、`png`、`both`                             | `svg`                      |
| `scale`          | 静的 PNG の倍率 1〜4                             | `2`                        |
| `years`          | 重複しない 2〜5 年                               | なし                       |

既定出力は `dark_svg_path` と `light_svg_path` です。該当する実行では `dark_png_path`、`light_png_path`、`snapshot_path`、`archive_path`、`comparison_dark_svg_path`、`comparison_light_svg_path` も返します。

```yaml
- uses: t1seo/maeul-in-the-sky@v2.1.0
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    username: octocat
    preset: nature
    village_style: korean
    art_style: pixel
    hemisphere: south
    title: 'Octocat’s coding village'
```

`density`（1〜10）は追加装飾を調整します。見た目の変化は空きスペースと日別の成長段階によって異なり、日別報酬の段階や正の件数の日の主アセット保証は変えません。

## Terrain Generation の仕組み

高さの既定値は引き続き `relative`（正の件数の P90 と平方根 mapping）で、`fixed` は `maxCount` を使います。日別成長はこれと独立し、コミット数だけではなく Contribution Calendar の元の貢献数で決まります。

| 一日の貢献数 | 報酬段階 |
| ------------ | -------- |
| 0            | 0、報酬なし |
| 1–4          | 1        |
| 5–9          | 2        |
| 10–24        | 3        |
| 25–49        | 4        |
| 50 以上      | 5        |

正の件数の日には主アセット、またはその場所の Wonder が付き、段階表示も残ります。高い段階ほど文化と Biome に合う発達した形になります。段階は他の日の件数、正規化、密度に左右されず、その日の件数を増やしても下がりません。Wonder があっても段階表示は残りますが、追加装飾や全体の Wonder 選択まで単調に増える保証ではありません。GitHub の公式分類やコード品質の評価ではありません。

件数が地形の高さを決めます。入力日付は、部分週や欠落期間も含め、実際の UTC 曜日と日曜始まりの週に配置されます。欠落日は作らず、既知の 0 件日は実際の 0 日として保持します。装飾がコントリビューションを増やすことはありません。

### Epic Wonders

活発な Terrain では 30 種類の特別なランドマークを発見できます。

- **Rare 14 種類:** 富士山、巨大セコイア、コロッセオ、サンゴ礁など
- **Epic 10 種類:** オーロラ、タージ・マハル、氷河峰、生物発光の池など
- **Legendary 6 種類:** 浮島、ドラゴンの巣、世界樹、古代ポータルなど

Wonder の選択には、そのセルの活動量、周辺セルの豊かさ、全体の統計が使われます。読みやすさを保つため、間隔を空けて最大 3 つまで配置されます。

## 探索とセットアップ

[デモ](https://t1seo.github.io/maeul-in-the-sky/)でプリセット、ユーザー名/年/タイトル、半球を選べます。密度、モーション、banner/card、classic/korean の文化、miniature/pixel の画風、高さスケール、レイアウトシードも選べます。文化と画風は自由に組み合わせられます。サンプル設定を変えてもアカウントは取得しません。実データにはスナップショットのインポートか、後述のローカルサービスを使ってください。

日付を選ぶと件数、報酬段階、Biome、配置を確認できます。探索画面は出典、正確な日付範囲、合計、活動日数、連続日数、高さ/季節凡例を表示します。ズーム、リセット、キーボード移動、Escape、フォーカス復帰に対応します。[Wonder 図鑑](https://t1seo.github.io/maeul-in-the-sky/#wonders)は発見/未発見と実際の条件を示します。条件を満たしても選択は保証されず、間隔、周辺 Terrain、確率、最大 3 個の予算も適用されます。

セットアップ欄から設定 JSON、ワークフロー、README 断片をダウンロードできます。生成ワークフローは `t1seo/maeul-in-the-sky@v2.1.0` で `output` ブランチへ公開し、README 断片もそこを参照します。再現性が必要なら検証済みの完全なコミット SHA に固定してください。`${{` を含むタイトルやレイアウトシードは GitHub Actions 式として評価され得るためワークフローへ出力できませんが、画像と JSON では使用できます。

## CLI

Node.js 20 以上が必要です。以下のコマンドは、公開済みの 2.1.0 CLI を `npx` で実行します。

<details>
<summary>ソースからビルドする（任意）</summary>

```bash
git clone --branch v2.1.0 https://github.com/t1seo/maeul-in-the-sky.git
cd maeul-in-the-sky
npm ci
npx tsx scripts/pixel/generate.ts --check
npm run build
```

</details>

```bash
GITHUB_TOKEN="$(gh auth token)" npx --package=maeul-in-the-sky@2.1.0 maeul-sky \
  --user octocat --preset civilization --output ./terrain

npx --package=maeul-in-the-sky@2.1.0 maeul-sky --input village.snapshot.json \
  --layout card --village-style korean --art-style pixel --motion off --format both --scale 2 \
  --write-snapshot --output ./terrain

GITHUB_TOKEN="$(gh auth token)" npx --package=maeul-in-the-sky@2.1.0 maeul-sky \
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
| `--art-style`                     | `miniature` / `pixel`。文化と独立した画風、既定 `miniature`     |
| `--normalization`                 | `relative` / `fixed` / アーカイブ専用 `shared`                |
| `--max-count`                     | 正の有限最大値。`fixed` では必須                              |
| `--layout-seed`                   | 任意の決定論的シード上書き                                    |
| `--format`                        | `svg` / `png` / `both`。既定 `svg`                            |
| `--scale`                         | PNG 倍率の整数 1〜4。既定 2                                   |
| `--help`, `-h`; `--version`, `-V` | ヘルプとバージョンを表示                                      |

この checkout のフラグは `npx --package=maeul-in-the-sky@2.1.0 maeul-sky --help`、ローカルサービスは `npx --package=maeul-in-the-sky@2.1.0 maeul-sky preview --help` で確認してください。既定値は `terrain`、`balanced`、密度 `5`、`north`、`classic`、`full`、`banner`、相対 P90、直近 52 週、画風は `miniature` です。優先順位は明示した CLI/Action/UI 値 → 読み込んだ設定 → 選択プリセットの既定 → ライブラリ既定です。単一レンダーでは `--config` がスナップショット設定より優先され、フィールド単位ではマージしません。明示したプリセットだけでは保存済み密度を置き換えません。format と PNG scale は保存するレンダー設定ではありません。

既定では引き続き `maeul-in-the-sky-{dark,light}.svg` の 2 ファイルだけを書きます。PNG とスナップショットは要求時だけ追加されます。`--format png` では SVG パス結果は空文字列です。

### 自分のアカウントをローカルでプレビュー

```bash
GITHUB_TOKEN="$(gh auth token)" npx --package=maeul-in-the-sky@2.1.0 maeul-sky preview --port 4318
```

`http://127.0.0.1:4318/` を開き、**Fetch contributions** を選びます。サービスは loopback のみに bind し、サーバー環境のトークンだけを読みます。ブラウザにトークン入力欄はなく、リンク、JSON、フォームへトークンを置かないでください。公開静的デモは JSON のみをインポートし、localhost へ接続しません。ローカルプロセスはアカウント/年の応答を 5 分、最大 32 件キャッシュします。

## 保存データ、比較、プライバシー

設定 (`maeul-settings`)、スナップショット (`maeul-snapshot`)、アーカイブ (`maeul-archive`) は `schemaVersion: 1` です。parser は統計を再計算し、未対応バージョン、重複/不正日付、不正な件数/設定を拒否します。インポート上限は 2 MiB、合計 20,000 日、スナップショット 20 個です。

形式のバージョンは 1 のままです。文化は `style: classic | korean`、画風は `artStyle: miniature | pixel` で保存し、旧設定で `artStyle` がなければ `miniature` を使います。設定・スナップショット、共有リンク、アーカイブにも両方を保持します。

同一アカウントの 2〜5 年を比較できます。既定の共有スケールは選択スナップショットの正の件数を pool して P90 を求め、その最大値を固定正規化として manifest に保存します。同じ件数は同じ level/height になります。明示的な固定最大値が優先します。CLI アーカイブには年別画像/スナップショット、`archive.json`、縦積みの dark/light 比較 SVG が含まれます。

設定リンクにはユーザー名/タイトルなどの設定だけが入り、件数、トークン、スナップショット payload は入りません。スナップショット/アーカイブにはトークンから見えた日別日付と件数があり、非公開活動の合計を示す可能性があるため共有前に確認してください。出典ラベルは GitHub 由来の暗号学的証明ではありません。SVG は日付と件数だけを含み、リポジトリ名、活動詳細、実行スクリプト、外部リソースを含みません。

## レイアウト、モーション、安定性

dark/light は同じ準備済み scene を着色します。新しい出力は `layoutVersion: 3` で、正規化ユーザー名、任意の `layoutSeed`、絶対日付を使います。旧バージョン 1・2 の準備済み scene も描画できます。再生成時はバージョン 3 の seed によりアセット・biome・Wonder の配置が変わります。固定正規化と周辺条件が不変なら、移動した期間の内部重複日は地形と通常配置を維持しますが画面位置は移動します。相対 P90、隣接条件、全体 Wonder 予算による変化や、異なる設定・範囲・バージョン間の pixel 一致は保証しません。

相対正規化は level 1〜99 を作り、0 は 0 のままです。季節は日付と半球に従い、春の花と新芽、夏の緑、秋の紅葉と収穫、冬の雪と裸枝を形と素材色で区別します。韓国風は既存 4 ID に `choga`、`jangseung`、`sotdae`、`riceTerrace`、`koreanWatermill`、`hanokGate`、`kimchiGarden`、`stoneBridge`、`hanokEstate` を追加します。高段階の通常報酬は豊かな自然景観と少数の韓国建築を組み合わせ、件数や Wonder 条件は変えません。

画風を変えても ID・日付・件数・報酬段階は同じです。既定の `miniature` は細かな SVG 原画、`pixel` は **0.5 SVG 単位の論理格子**にコンパイルした SVG path です。限定パレットは季節と dark/light に追従し、ピクセルアセットの実行時描画に Resvg や外部画像は不要です。scene の縮尺調整や外部の非整数倍率では、物理ピクセルへの整列は保証しません。

banner/card はどちらも提供期間全体を保持します。`full` は全 ambient effect、`subtle` は遅い雲と穏やかな水、`off` は CSS animation/keyframe と SMIL を省略します。reduced-motion は完全な静的 fallback を選びます。PNG は常に `motion: off`、不透明背景、倍率 1〜4 (既定 2) で再レンダーした静止画像です。

自然景観を主役とし、建物や船は少数のアクセントとして配置します。新しい自然アセット 8 種には各 3 種の形状があります。直近 28 暦日の活動日が 5・12・20 日に達すると季節の効果が豊かになります。提供された日付のみを数え、観測日数を別に記録します。効果は最大 10 群で、モーションを止めても静止画として残ります。

## JavaScript とブラウザ API

Node とブラウザ API を含むリリース済みパッケージをインストールします。

```bash
npm install maeul-in-the-sky@2.1.0
```

パッケージをインストールしたプロジェクトの `.mjs` ファイルで、以下の例を実行してください。

```js
import { generateArchive, generateTerrain } from 'maeul-in-the-sky';

const result = await generateTerrain({
  username: 'octocat',
  token: process.env.GITHUB_TOKEN,
  preset: 'balanced',
  layout: 'card',
  style: 'korean',
  artStyle: 'pixel',
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

ソースビルドは Node 用 `dist/lib.js`（ESM）と `dist/lib.cjs`（CommonJS）、ブラウザ用 `dist/browser.js`（ESM）を提供します。ブラウザ entry は Node filesystem、token client、WASM rasterizer を含まず、描画、parser、settings、snapshot/archive helper、catalog を export します。文化の入力は `style` または `villageStyle`、保存名は `style` です。両方の値が異なるとエラーになります。画風は `artStyle` です。同じ文書の複数 scene には別 namespace を使ってください。

カスタム Theme のアーカイブ比較では SVG と CSS をローカルで解析し、名前空間の接頭辞と文字参照に対応します。各行を埋め込む際に XML 宣言と DOCTYPE を除去します。外部 DTD とカスタム実体は読み込まず、不正な XML や未対応の参照はアーカイブファイルを書き込む前に `InputValidationError` を返します。 参照への接頭辞の付与で値が衝突し、CSS 属性セレクターが元の一致・不一致を区別できなくなる場合も、書き込み前に同じエラーで拒否します。

ローカルスタイルシートのセレクターは対象年の行に限定され、汎用セレクターでもその行の描画参照を維持します。これは SVG の合成であり、CSS 全体のカプセル化ではありません。読み込んだスタイルシート、キーフレームやフォントなどのグローバル名、外部ドキュメント構造に依存するセレクターは既存の CSS の意味に従います。カスタムテーマでは名前を一意にし、スタイルを自己完結させてください。

## カタログと再現可能なプレビュー

[インタラクティブカタログ](https://t1seo.github.io/maeul-in-the-sky/catalog/)は miniature/pixel を切り替えられ、韓国の全 13 ID を含みます。通常 **210 = classic 197 + korean 13**（季節型 68、通年型 142）と Wonder **30 = Rare 14 + Epic 10 + Legendary 6** を別集計し、合計は **240 ID** です。variant・画風・配置数は ID 数を増やしません。

原画変更後はピクセルアセットを再生成し、テストやビルド前に `--check` で差分を検出してください。その他の生成コマンドは[貢献ガイド](../CONTRIBUTING.md)を参照してください。

```bash
npx tsx scripts/pixel/generate.ts
npx tsx scripts/pixel/generate.ts --check
npx tsx scripts/generate-catalog.ts docs/demo/catalog
```

生成スクリプトは固定 seed と UTC 日付を使います。以前の 6 SVG での gzip 削減率 16.54〜17.06% は今回の原画更新前の記録で、新アセットのサイズ・描画速度・FPS の測定値ではありません。条件と限界は[過去の測定](demo/performance.md)を参照してください。

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

## 支援

[![Buy me a coffee](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=taewonseo&button_colour=e3e7ef&font_colour=262626&font_family=Inter&outline_colour=262626&coffee_colour=a0522d)](https://www.buymeacoffee.com/taewonseo)

## ライセンス

[MIT](../LICENSE) © [t1seo](https://github.com/t1seo)

外部の 3D モデルには各制作者のライセンスが適用されます。[モデルのクレジットとライセンスファイル](https://t1seo.github.io/maeul-in-the-sky/tour/credits.html)をご確認ください。
