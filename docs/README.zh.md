<div align="center">

# Maeul in the Sky · 天空之村

**用您的 GitHub 贡献记录建造一座生动的等距村庄。**

[![npm version](https://img.shields.io/npm/v/maeul-in-the-sky?color=cb3837&logo=npm)](https://www.npmjs.com/package/maeul-in-the-sky)
[![CI](https://github.com/t1seo/maeul-in-the-sky/actions/workflows/ci.yml/badge.svg)](https://github.com/t1seo/maeul-in-the-sky/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)

[English](../README.md) · [한국어](README.ko.md) · [日本語](README.ja.md) · [中文](README.zh.md)

<br />

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../.github/assets/preview-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="../.github/assets/preview-light.svg">
  <img alt="由 GitHub Contribution Calendar 建造的等距村庄" src="../.github/assets/preview-dark.svg" width="840">
</picture>

[**体验预设演示**](https://t1seo.github.io/maeul-in-the-sky/) · [快速开始](#快速开始) · [npm](https://www.npmjs.com/package/maeul-in-the-sky) · [展示区](../SHOWCASE.md)

</div>

Maeul（마을）在韩语中意为“村庄”。Contribution Calendar 中的每一天都会成为空中 Terrain 的一部分：平静的日子形成水域和空地，活跃的日子长出森林、农场、村庄、城市和稀有 Wonder。

输出是两个独立的 SVG 文件，可在个人资料 README 中随 GitHub 配色自动切换，不需要客户端 JavaScript。

**本文面向当前 `main`。** 下述资源、四季、每日成长和画风改进尚未包含在已发布的 npm `1.4.0` 或当前 `v1` Action 标签中。本次更新面向 `main` 和 GitHub Pages 演示；Action 请使用 `@main`，CLI/API 请使用下方源码构建示例。

## 村庄包含的内容

- 使用 100 级高度的确定性等距 Terrain
- 通过枝叶、花朵、轮廓和材质颜色区分的日历四季
- 程序生成的河流、池塘、森林、天气和环境动画
- 210 个普通资源 ID：197 个 classic + 13 个 korean，其中季节型 68 个、全年型 142 个
- Rare、Epic、Legendary 三个等级的 30 种 Epic Wonders
- 重绘原有资源，新增 9 个韩国乡村和 8 个自然景观 ID，总计 240 个
- 独立于文化的 miniature/pixel 画风，以及基于原始贡献数的每日奖励
- 带无障碍标题、描述和减少动态效果支持的深色与浅色 SVG
- 北半球与南半球的季节映射
- 可见的贡献日期、活跃天数、连续贡献、最活跃月份和 Wonder 数量
- banner/card 布局、full/subtle/off 动效、静态 PNG 和可缩放浏览器探索器
- 带版本的设置与快照、多年份比较和本地认证预览

README 预览和 6 张预设图片使用固定种子的**合成数据**，显示 **2025-01-05 至 2026-01-03 提供的 364 天**。它们不是抓取的真实账户，也不是完整的 2025 日历。sparse/max 预览使用独立固定模式；原始基准 fixture 保持不变，以便复现比较。

## 选择村庄预设

预设改变额外装饰的组合，不会改变贡献数、高度、颜色或每日奖励等级。

|                                                         Nature                                                          |                                                           Balanced                                                            |                                                               Civilization                                                                |
| :---------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------: |
| [![Nature 预设](demo/assets/preset-nature-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=nature&mode=dark) | [![Balanced 预设](demo/assets/preset-balanced-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=balanced&mode=dark) | [![Civilization 预设](demo/assets/preset-civilization-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=civilization&mode=dark) |
|                                                    少量装饰，保留更多空间                                                     |                                                    适量的额外装饰                                                     |                                                         活跃日的装饰更加丰富                                                          |
|                                                    `preset: nature`                                                     |                                                      `preset: balanced`                                                       |                                                          `preset: civilization`                                                           |

## 快速开始

### 1. 添加 Action

用于 GitHub 个人资料时，请在与用户名同名的仓库中添加 `.github/workflows/maeul-sky.yml`。

新功能示例使用 `@main`；当前 `v1` 仍指向旧提交 `1d514430`。要复现同一版本，请把会随更新移动的 `@main` 替换为您已验证的完整提交 SHA。

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

      - uses: t1seo/maeul-in-the-sky@main
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          preset: balanced

      - uses: stefanzweifel/git-auto-commit-action@v7
        with:
          commit_message: 'chore: update Maeul in the Sky'
```

默认 GitHub 用户名是仓库所有者。只有在生成其他用户的 Terrain 时才需要设置 `username`。

### 2. 手动运行一次

打开 **Actions → Update Maeul in the Sky → Run workflow**。首次运行会创建：

- `maeul-in-the-sky-dark.svg`
- `maeul-in-the-sky-light.svg`

如果提交步骤被拒绝，请在 **Settings → Actions → General → Workflow permissions** 中允许读写权限。

### 3. 添加到 README

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./maeul-in-the-sky-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="./maeul-in-the-sky-light.svg" />
  <img alt="我的 GitHub 贡献村庄" src="./maeul-in-the-sky-dark.svg" width="100%" />
</picture>
```

## Action 输入

| 输入             | 说明                                      | 默认值                |
| ---------------- | ----------------------------------------- | --------------------- |
| `username`       | 获取 Contribution Calendar 的 GitHub 用户 | 仓库所有者            |
| `github_token`   | GitHub GraphQL API 令牌                   | `${{ github.token }}` |
| `theme`          | Theme 渲染器                              | `terrain`             |
| `title`          | SVG 标题                                  | `@username`           |
| `output_dir`     | 保存两个 SVG 的目录                       | `./`                  |
| `year`           | 日历年份；省略时使用最近 52 周            | 最近 52 周            |
| `hemisphere`     | 季节映射：`north` 或 `south`              | `north`               |
| `preset`         | `nature`、`balanced` 或 `civilization`    | `balanced`            |
| `density`        | 1 到 10 的额外装饰组合覆盖值              | 预设值                |
| `config`         | 版本 1 设置 JSON 路径                     | 无                    |
| `input`          | 快照 JSON 路径；跳过网络请求              | 无                    |
| `write_snapshot` | 写出可复用快照                            | `false`               |
| `motion`         | `full`、`subtle`、`off`                   | `full`                |
| `layout`         | `banner` 或 `card`                        | `banner`              |
| `village_style`  | 文化：`classic` 或 `korean`                | `classic`             |
| `art_style`      | 独立画风：`miniature` 或 `pixel`           | `miniature`           |
| `layout_seed`    | 可选的确定性布局种子                      | 用户名/年份/日期身份  |
| `normalization`  | `relative`、`fixed`、多年份专用 `shared`  | `relative`            |
| `max_count`      | `fixed` 使用的正最大值                    | 无                    |
| `format`         | `svg`、`png`、`both`                      | `svg`                 |
| `scale`          | 静态 PNG 倍率 1 到 4                      | `2`                   |
| `years`          | 2 到 5 个不同年份                         | 无                    |

默认输出为 `dark_svg_path` 和 `light_svg_path`。对应运行还会提供 `dark_png_path`、`light_png_path`、`snapshot_path`、`archive_path`、`comparison_dark_svg_path` 和 `comparison_light_svg_path`。

```yaml
- uses: t1seo/maeul-in-the-sky@main
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    username: octocat
    preset: nature
    village_style: korean
    art_style: pixel
    hemisphere: south
    title: 'Octocat’s coding village'
```

`density`（1 到 10）调整额外装饰。可见变化取决于可用空间和每日成长阶段，不会降低每日奖励等级，也不会取消正贡献日期的主要资源保障。

## Terrain Generation 原理

高度仍默认使用 `relative`（正贡献数的 P90 与平方根映射），`fixed` 使用 `maxCount`。每日成长独立于高度，依据 Contribution Calendar 的原始贡献数，而不只是提交数。

| 每日贡献数 | 奖励等级 |
| ---------- | -------- |
| 0          | 0，无奖励 |
| 1–4        | 1        |
| 5–9        | 2        |
| 10–24      | 3        |
| 25–49      | 4        |
| 50 及以上  | 5        |

正贡献日期保证有主要资源，或由 Wonder 占据该位置，并保留等级标记。高等级使用更成熟、符合文化与 Biome 的轮廓。等级不受其他日期、归一化和密度影响，也不会在当日贡献增加时下降。Wonder 出现时等级标记仍保留，但整个随机场景、额外装饰或全局 Wonder 选择不保证单调增加。这是视觉奖励规则，不是 GitHub 官方分类或代码质量评分。

贡献数决定地形高度。输入日期按真实 UTC 星期和周日开头的周定位，包括不完整周和缺口。缺失日期不会被补造，已知 0 次的日期仍是真实的零值日。装饰不会增加贡献数。

### Epic Wonders

高活动 Terrain 中可以发现 30 种特殊地标。

- **Rare 14 种：** 富士山、巨型红杉、斗兽场、珊瑚礁等
- **Epic 10 种：** 极光、泰姬陵、冰川峰、生物发光池等
- **Legendary 6 种：** 浮空岛、龙巢、世界树、远古传送门等

Wonder 的选择会考虑当前单元的活动量、附近单元的丰富程度和整体贡献统计。为了保持清晰，最多放置三个，并保持一定间距。

## 探索与设置

在[演示](https://t1seo.github.io/maeul-in-the-sky/)中选择预设、用户名/年份/标题和半球。还可选择密度、动效、banner/card、classic/korean 文化、miniature/pixel 画风、高度比例和布局种子。文化与画风可独立组合。修改示例设置不会抓取账户。要使用真实数值，请导入快照或使用下面的本地服务。

选择日期可查看贡献数、奖励等级、Biome 和放置对象。探索器显示来源、准确日期范围、总数、活跃天数、连续贡献及高度/季节图例，并支持缩放、重置、键盘平移、Escape 和焦点返回。[Wonder 图鉴](https://t1seo.github.io/maeul-in-the-sky/#wonders)显示已发现/未发现状态和真实门槛。满足资格并不保证被选中；间距、周围 Terrain、概率和最多三个的预算也会生效。

设置区可以下载设置 JSON、工作流和 README 片段。生成的工作流使用 `t1seo/maeul-in-the-sky@main` 发布到 `output` 分支，README 片段也指向该分支。需要复现版本时，请固定已验证的完整提交 SHA。包含 `${{` 的标题或布局种子可能被 GitHub 当作 Actions 表达式，因此不能导出到工作流，但仍可用于图片和 JSON。

## CLI

需要 Node.js 20 或更高版本。以下示例面向**当前 `main`、尚未发布到 npm 的功能**，请先构建源码。

```bash
git clone --branch main https://github.com/t1seo/maeul-in-the-sky.git
cd maeul-in-the-sky
npm ci
npx tsx scripts/pixel/generate.ts --check
npm run build
```

```bash
GITHUB_TOKEN="$(gh auth token)" node dist/index.js \
  --user octocat --preset civilization --output ./terrain

node dist/index.js --input village.snapshot.json \
  --layout card --village-style korean --art-style pixel --motion off --format both --scale 2 \
  --write-snapshot --output ./terrain

GITHUB_TOKEN="$(gh auth token)" node dist/index.js \
  --user octocat --years 2024,2025 --normalization shared --output ./archive
```

| CLI 参数                          | 值与行为                                                 |
| --------------------------------- | -------------------------------------------------------- |
| `--user`, `-u`                    | 账户；可从 input/config 推断                             |
| `--token`                         | 生成令牌；显式 `--token` 优先于 `GITHUB_TOKEN`           |
| `--theme`, `-t`                   | `terrain`                                                |
| `--title`                         | 默认 `@username`                                         |
| `--output`, `-o`                  | 默认当前目录                                             |
| `--year`, `-y`                    | 日历年份；省略时最近 52 周                               |
| `--years`                         | 逗号分隔的 2 到 5 个不同年份；与 `--year` 冲突           |
| `--preset`                        | `nature`（密度 2）、`balanced`（5）、`civilization`（9） |
| `--density`                       | 整数 1 到 10                                             |
| `--hemisphere`                    | `north` / `south`                                        |
| `--config`                        | 设置 JSON 路径                                           |
| `--input`                         | 快照/归档 JSON；不联网                                   |
| `--write-snapshot [path]`         | 在可选路径写快照；默认关闭                               |
| `--motion`                        | `full` / `subtle` / `off`                                |
| `--layout`                        | `banner`（840×240）/ `card`（420×360）                   |
| `--style`, `--village-style`      | `classic` / `korean`                                     |
| `--art-style`                     | `miniature` / `pixel`；独立画风，默认 `miniature`         |
| `--normalization`                 | `relative` / `fixed` / 仅归档可用 `shared`               |
| `--max-count`                     | 正有限最大值；`fixed` 必填                               |
| `--layout-seed`                   | 可选确定性种子覆盖值                                     |
| `--format`                        | `svg` / `png` / `both`；默认 `svg`                       |
| `--scale`                         | PNG 整数倍率 1 到 4；默认 2                              |
| `--help`, `-h`; `--version`, `-V` | 显示帮助与版本                                           |

请通过 `node dist/index.js --help` 和 `node dist/index.js preview --help` 查看当前源码的参数。默认值是 `terrain`、`balanced`、密度 `5`、`north`、`classic`、`full`、`banner`、相对 P90、最近 52 周，画风默认 `miniature`。优先级为：显式 CLI/Action/UI 值 → 加载的设置 → 所选预设默认值 → 库默认值。单次渲染中，`--config` 优先于快照设置，二者不会按字段合并。只显式选择 preset 不会覆盖已保存 density。format 与 PNG scale 不属于保存的渲染设置。

默认仍只写出 `maeul-in-the-sky-{dark,light}.svg` 两个文件。PNG 和快照仅在请求时添加。`--format png` 时 SVG 路径结果为空字符串。

### 本地预览自己的账户

```bash
GITHUB_TOKEN="$(gh auth token)" node dist/index.js preview --port 4318
```

打开 `http://127.0.0.1:4318/` 并选择 **Fetch contributions**。服务只绑定 loopback，只读取服务器环境中的令牌。浏览器没有令牌输入框；不要把令牌放入链接、JSON 或表单。公开静态演示只导入 JSON，不连接 localhost。本地进程会缓存账户/年份响应 5 分钟，最多 32 项。

## 保存的数据、比较与隐私

设置（`maeul-settings`）、快照（`maeul-snapshot`）和归档（`maeul-archive`）使用 `schemaVersion: 1`。解析器会重新计算统计，拒绝不支持的版本、重复/无效日期和无效数值/选项。导入上限为 2 MiB、总计 20,000 天、20 个快照。

文件格式版本仍为 1。文化保存为 `style: classic | korean`，画风保存为 `artStyle: miniature | pixel`；旧设置缺少 `artStyle` 时使用 `miniature`。设置、快照、分享链接和归档均保留这两项。

可以比较同一账户的 2 到 5 个年份。默认共享比例会汇总所选快照中的正数并计算 P90，把该最大值作为固定归一化写入归档 manifest，因此相同数值具有相同 level/height。显式固定最大值优先。CLI 归档包含每年图片/快照、`archive.json` 和纵向堆叠的 dark/light 比较 SVG。

设置链接只包含用户名/标题等配置，不包含数值、令牌或快照 payload。快照和归档含令牌可见的每日日期与数值，可能暴露私有活动总数，分享前请检查。来源标签不是 GitHub 来源的密码学证明。SVG 只包含日期和数值，不含仓库名、活动详情、可执行脚本或外部资源。

## 布局、动效与稳定性

dark/light 为同一准备好的 scene 着色。新输出使用 `layoutVersion: 3`，依据标准化用户名、可选 `layoutSeed` 和绝对日期。旧版 1、2 的预生成 scene 仍可渲染；重新生成采用版本 3 的 seed，资源、biome 和 Wonder 布局会变化。固定归一化及周围条件不变时，移动窗口的内部重叠日期保留地形和普通放置，屏幕位置会移动。相对 P90、邻接条件和全局 Wonder 预算仍可能带来变化；不同设置、范围和布局版本不保证逐像素一致。

相对归一化得到 level 1 到 99，0 保持 0。季节依据日期和半球，以春花新叶、盛夏绿荫、秋叶收获、冬雪枯枝及材质颜色区分。韩国风格在原有 4 个 ID 上新增 `choga`、`jangseung`、`sotdae`、`riceTerrace`、`koreanWatermill`、`hanokGate`、`kimchiGarden`、`stoneBridge`、`hanokEstate`。高等级普通奖励结合丰富自然景观和少量韩国建筑，不改变贡献数或 Wonder 条件。

切换画风保留 ID、日期、贡献数和奖励等级。默认 `miniature` 使用细致的 SVG 原画；`pixel` 使用编译到 **0.5 SVG 单位逻辑网格**的真实 SVG 路径，有限调色板仍随季节与 dark/light 改变。像素资源渲染无需运行时 Resvg 或外部位图。场景适配缩放或外部非整数缩放时，不保证与物理屏幕像素精确对齐。

banner/card 都保留提供的完整日期范围。`full` 开启全部环境效果，`subtle` 只保留慢云和轻柔水面，`off` 省略 CSS animation/keyframe 与 SMIL。reduced-motion 会选择完整的静态 fallback。PNG 始终以 `motion: off`、不透明背景和 1 到 4 倍（默认 2）重新渲染，因此是静态图片。

布局以自然景观为主，建筑和船只作为少量点缀。新增 8 种自然资源，每种提供 3 种不同轮廓。最近 28 个日历日内的活动日达到 5、12、20 天时，季节效果更加丰富。只统计提供的日期，并单独记录观测天数；效果最多 10 组，关闭动态时仍保留静态奖励形状。

## JavaScript 与浏览器 API

公开 npm 包仍是**不含上述改进的旧版 1.4.0**。

```bash
npm install maeul-in-the-sky@1.4.0
```

要使用**当前 `main` API**，请先构建上述源码，再从仓库根目录的 `.mjs` 文件运行以下示例。

```js
import { generateArchive, generateTerrain } from './dist/lib.js';

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

源码构建提供 Node 入口 `dist/lib.js`（ESM）、`dist/lib.cjs`（CommonJS）和浏览器入口 `dist/browser.js`（ESM）。浏览器入口不包含 Node 文件系统、token client 或 WASM rasterizer，提供渲染、解析器、设置、快照/归档 helper 和目录。文化输入支持 `style` 或 `villageStyle`，值冲突时报错，保存名称为 `style`；画风为 `artStyle`。同一文档中的多个 scene 请使用不同 namespace。

自定义 Theme 的归档比较会在本地解析 SVG 和 CSS，支持命名空间前缀和字符引用。嵌入各行时会移除 XML 声明和 DOCTYPE。不会加载外部 DTD 或自定义实体；格式错误的 XML 或不支持的引用会在写入归档文件之前抛出 `InputValidationError`。 若为引用添加前缀后产生值冲突，使 CSS 属性选择器无法保持原来的匹配与不匹配关系，也会在写入前以同一错误拒绝。

本地样式表的选择器仅作用于对应年份的行，使通用选择器也保持该行的绘制引用。这是 SVG 合成，而非完整的 CSS 隔离：导入的样式表、关键帧和字体等全局名称，以及依赖外部文档结构的选择器仍遵循现有 CSS 语义。自定义主题应使用唯一名称和自包含的样式。

## 目录与可复现预览

[交互式目录](https://t1seo.github.io/maeul-in-the-sky/catalog/)支持 miniature/pixel 切换，包含全部 13 个韩国 ID。普通资源 **210 = classic 197 + korean 13**（季节型 68、全年型 142）与 Wonder **30 = Rare 14 + Epic 10 + Legendary 6** 分开统计，总计 **240 ID**。变体、画风和放置数量不增加 ID 总数。

修改原画后请重新生成像素资源，并在测试或构建前运行 `--check` 检查漂移。其他生成命令请参阅[贡献指南](../CONTRIBUTING.md)。

```bash
npx tsx scripts/pixel/generate.ts
npx tsx scripts/pixel/generate.ts --check
npx tsx scripts/generate-catalog.ts docs/demo/catalog
```

生成脚本使用固定 seed 与 UTC 日期。之前 6 个 SVG 的 gzip 缩减 16.54% 到 17.06% 是本次原画更新前的记录，不是新资源的体积、渲染速度或 FPS 测量值。条件与限制见[历史测量](demo/performance.md)。

## 故障排查

- **无法提交 SVG：** 检查工作流是否有 `contents: write`，并确认仓库 Workflow permissions 允许读写。
- **显示了错误的账户：** 设置 `username`。定时运行也默认使用仓库所有者。
- **日期范围不是本年 1 月开始：** 这是正常行为。省略 `year` 时会像 GitHub 个人资料一样使用最近 52 周。
- **SVG 没有动画：** 系统可能启用了减少动态效果，或 Markdown 平台限制 SVG 动画。Terrain 仍会完整静态显示。
- **缺少私有贡献：** 只能包含所提供令牌可见的贡献。

其他问题请查看[支持说明](../SUPPORT.md)或[提交 Issue](https://github.com/t1seo/maeul-in-the-sky/issues/new/choose)。

## 社区

- 在[展示区](../SHOWCASE.md)分享个人资料
- 阅读[贡献指南](../CONTRIBUTING.md)
- 查看[安全策略](../SECURITY.md)
- 遵守[行为准则](../CODE_OF_CONDUCT.md)

## 赞助

[![Buy me a coffee](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=taewonseo&button_colour=e3e7ef&font_colour=262626&font_family=Inter&outline_colour=262626&coffee_colour=a0522d)](https://www.buymeacoffee.com/taewonseo)

## 许可证

[MIT](../LICENSE) © [t1seo](https://github.com/t1seo)
