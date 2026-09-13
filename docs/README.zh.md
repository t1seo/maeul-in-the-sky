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

## 村庄包含的内容

- 使用 100 级高度的确定性等距 Terrain
- 与日历对应的四季和 68 个已注册季节资源 ID
- 程序生成的河流、池塘、森林、天气和环境动画
- 193 个普通资源 ID：189 个 classic 和 4 个原创韩国村庄资源
- Rare、Epic、Legendary 三个等级的 30 种 Epic Wonders
- 带无障碍标题、描述和减少动态效果支持的深色与浅色 SVG
- 北半球与南半球的季节映射
- 可见的贡献日期、活跃天数、连续贡献、最活跃月份和 Wonder 数量
- banner/card 布局、full/subtle/off 动效、静态 PNG 和可缩放浏览器探索器
- 带版本的设置与快照、多年份比较和本地认证预览

README 预览和 6 张预设图片使用固定种子的**合成数据**，显示 **2025-01-05 至 2026-01-03 提供的 364 天**。它们不是抓取的真实账户，也不是完整的 2025 日历。sparse/max 预览使用独立固定模式；原始基准 fixture 保持不变，以便复现比较。

## 选择村庄预设

预设只改变出现的资源，不会改变贡献数、高度或颜色。

|                                                         Nature                                                          |                                                           Balanced                                                            |                                                               Civilization                                                                |
| :---------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------: |
| [![Nature 预设](demo/assets/preset-nature-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=nature&mode=dark) | [![Balanced 预设](demo/assets/preset-balanced-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=balanced&mode=dark) | [![Civilization 预设](demo/assets/preset-civilization-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=civilization&mode=dark) |
|                                                    更多森林和开阔地                                                     |                                                    自然、农场与城镇的平衡                                                     |                                                         日常活跃日也出现更多建筑                                                          |
|                                                    `preset: nature`                                                     |                                                      `preset: balanced`                                                       |                                                          `preset: civilization`                                                           |

## 快速开始

### 1. 添加 Action

用于 GitHub 个人资料时，请在与用户名同名的仓库中添加 `.github/workflows/maeul-sky.yml`。

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
| `density`        | 1 到 10 的高级建筑密度覆盖值              | 预设值                |
| `config`         | 版本 1 设置 JSON 路径                     | 无                    |
| `input`          | 快照 JSON 路径；跳过网络请求              | 无                    |
| `write_snapshot` | 写出可复用快照                            | `false`               |
| `motion`         | `full`、`subtle`、`off`                   | `full`                |
| `layout`         | `banner` 或 `card`                        | `banner`              |
| `village_style`  | `classic` 或 `korean`                     | `classic`             |
| `layout_seed`    | 可选的确定性布局种子                      | 用户名/年份/日期身份  |
| `normalization`  | `relative`、`fixed`、多年份专用 `shared`  | `relative`            |
| `max_count`      | `fixed` 使用的正最大值                    | 无                    |
| `format`         | `svg`、`png`、`both`                      | `svg`                 |
| `scale`          | 静态 PNG 倍率 1 到 4                      | `2`                   |
| `years`          | 2 到 5 个不同年份                         | 无                    |

默认输出为 `dark_svg_path` 和 `light_svg_path`。对应运行还会提供 `dark_png_path`、`light_png_path`、`snapshot_path`、`archive_path`、`comparison_dark_svg_path` 和 `comparison_light_svg_path`。

```yaml
- uses: t1seo/maeul-in-the-sky@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    username: octocat
    preset: nature
    hemisphere: south
    title: 'Octocat’s coding village'
```

只有需要比三个预设更精细的控制时才使用 `density`。较高的值会让建筑出现在活动量较低的单元，较低的值会保留更多自然景观。

## Terrain Generation 原理

贡献强度会根据用户自身的活动范围进行相对归一化。即使不同用户的贡献数量不同，每个人最忙碌的日子都可能形成城市。

| 贡献模式 | Terrain 结果                 |
| -------- | ---------------------------- |
| 无活动   | 水域和空地                   |
| 少量活动 | 岸边、草地和小型植被         |
| 持续活动 | 森林和农场                   |
| 高活动   | 村庄和城镇                   |
| 峰值活动 | 城市、高塔和 Wonder 候选位置 |

贡献数决定地形高度。输入日期按真实 UTC 星期和周日开头的周定位，包括不完整周和缺口。缺失日期不会被补造，已知 0 次的日期仍是真实的零值日。装饰不会增加贡献数。

### Epic Wonders

高活动 Terrain 中可以发现 30 种特殊地标。

- **Rare 14 种：** 富士山、巨型红杉、斗兽场、珊瑚礁等
- **Epic 10 种：** 极光、泰姬陵、冰川峰、生物发光池等
- **Legendary 6 种：** 浮空岛、龙巢、世界树、远古传送门等

Wonder 的选择会考虑当前单元的活动量、附近单元的丰富程度和整体贡献统计。为了保持清晰，最多放置三个，并保持一定间距。

## 探索与设置

在[演示](https://t1seo.github.io/maeul-in-the-sky/)中选择预设、用户名/年份/标题和半球。高级设置包括密度、动效、banner/card、classic/korean 风格、高度比例和布局种子。修改示例设置不会抓取账户。要使用真实数值，请导入快照或使用下面的本地服务。

选择日期可查看贡献数、Biome 和放置对象。探索器显示来源、准确日期范围、总数、活跃天数、连续贡献及高度/季节图例，并支持缩放、重置、键盘平移、Escape 和焦点返回。[Wonder 图鉴](https://t1seo.github.io/maeul-in-the-sky/#wonders)显示已发现/未发现状态和真实门槛。满足资格并不保证被选中；间距、周围 Terrain、概率和最多三个的预算也会生效。

设置区可以下载设置 JSON、工作流和 README 片段。生成的工作流发布到 `output` 分支，README 片段也指向该分支。包含 `${{` 的标题或布局种子可能被 GitHub 当作 Actions 表达式，因此不能导出到工作流，但仍可用于图片和 JSON。

## CLI

需要 Node.js 20 或更高版本。以下新选项目前属于 **Unreleased**；从源码使用时，请先运行 `npm install && npm run build`，再把 `npx --yes maeul-in-the-sky` 替换为 `node dist/index.js`。

```bash
GITHUB_TOKEN="$(gh auth token)" npx --yes maeul-in-the-sky \
  --user octocat --preset civilization --output ./terrain

npx --yes maeul-in-the-sky --input village.snapshot.json \
  --layout card --village-style korean --motion off --format both --scale 2 \
  --write-snapshot --output ./terrain

GITHUB_TOKEN="$(gh auth token)" npx --yes maeul-in-the-sky \
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
| `--normalization`                 | `relative` / `fixed` / 仅归档可用 `shared`               |
| `--max-count`                     | 正有限最大值；`fixed` 必填                               |
| `--layout-seed`                   | 可选确定性种子覆盖值                                     |
| `--format`                        | `svg` / `png` / `both`；默认 `svg`                       |
| `--scale`                         | PNG 整数倍率 1 到 4；默认 2                              |
| `--help`, `-h`; `--version`, `-V` | 显示帮助与版本                                           |

请通过 `npx --yes maeul-in-the-sky --help` 查看已安装版本的真实参数，通过 `npx --yes maeul-in-the-sky preview --help` 查看本地服务参数。默认值是 `terrain`、`balanced`、密度 `5`、`north`、`classic`、`full`、`banner`、相对 P90 和最近 52 周。优先级为：显式 CLI/Action/UI 值 → 加载的设置 → 所选预设默认值 → 库默认值。单次渲染中，`--config` 优先于快照设置，二者不会按字段合并。只显式选择 preset 不会覆盖已保存 density。format 与 PNG scale 不属于保存的渲染设置。

默认仍只写出 `maeul-in-the-sky-{dark,light}.svg` 两个文件。PNG 和快照仅在请求时添加。`--format png` 时 SVG 路径结果为空字符串。

### 本地预览自己的账户

```bash
GITHUB_TOKEN="$(gh auth token)" npx --yes maeul-in-the-sky preview --port 4318
```

打开 `http://127.0.0.1:4318/` 并选择 **Fetch contributions**。服务只绑定 loopback，只读取服务器环境中的令牌。浏览器没有令牌输入框；不要把令牌放入链接、JSON 或表单。公开静态演示只导入 JSON，不连接 localhost。本地进程会缓存账户/年份响应 5 分钟，最多 32 项。

## 保存的数据、比较与隐私

设置（`maeul-settings`）、快照（`maeul-snapshot`）和归档（`maeul-archive`）使用 `schemaVersion: 1`。解析器会重新计算统计，拒绝不支持的版本、重复/无效日期和无效数值/选项。导入上限为 2 MiB、总计 20,000 天、20 个快照。

可以比较同一账户的 2 到 5 个年份。默认共享比例会汇总所选快照中的正数并计算 P90，把该最大值作为固定归一化写入归档 manifest，因此相同数值具有相同 level/height。显式固定最大值优先。CLI 归档包含每年图片/快照、`archive.json` 和纵向堆叠的 dark/light 比较 SVG。

设置链接只包含用户名/标题等配置，不包含数值、令牌或快照 payload。快照和归档含令牌可见的每日日期与数值，可能暴露私有活动总数，分享前请检查。来源标签不是 GitHub 来源的密码学证明。SVG 只包含日期和数值，不含仓库名、活动详情、可执行脚本或外部资源。

## 布局、动效与稳定性

dark/light 会给同一个已准备 scene 着色，因此 Terrain、普通资源和 Wonder 的 geometry 一致。layout version 1 使用标准化用户名、可选 `layoutSeed` 和绝对日期。固定归一化及周围 context 不变时，移动窗口中的内部重叠日期会保留地形和普通放置，但屏幕位置会移动。相对 P90 可能改变高度，邻接条件和全局 Wonder 预算可能改变选择。不同设置、范围或未来 layout version 不保证逐像素一致。

相对归一化使用正数 P90 和平方根映射得到 level 1 到 99，0 保持 0。固定模式使用 `maxCount`。韩国风格添加 `hanok`、`pavilion`、`stoneWall`、`onggi` 和符合条件的邻里路径，但不会修改数值或 Wonder 条件。

banner/card 都保留提供的完整日期范围。`full` 开启全部环境效果，`subtle` 只保留慢云和轻柔水面，`off` 省略 CSS animation/keyframe 与 SMIL。reduced-motion 会选择完整的静态 fallback。PNG 始终以 `motion: off`、不透明背景和 1 到 4 倍（默认 2）重新渲染，因此是静态图片。

## JavaScript 与浏览器 API

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

Node entry 支持 ESM/CommonJS 以及文件系统、网络、PNG adapter。`maeul-in-the-sky/browser` ESM entry 不包含 Node 文件系统、token client 或 WASM rasterizer，并导出 `renderTerrain`、`prepareTerrainScene`、`renderTerrainScene`、解析器、设置、快照/归档 helper 和目录。浏览器与 Node 输入均接受 `style` 或 `villageStyle`；两个值不一致时会报错。版本 1 设置使用 `style` 序列化。在同一文档内嵌多个 scene 时请使用不同 namespace。

自定义 Theme 的归档比较会在本地解析 SVG 和 CSS，支持命名空间前缀和字符引用。嵌入各行时会移除 XML 声明和 DOCTYPE。不会加载外部 DTD 或自定义实体；格式错误的 XML 或不支持的引用会在写入归档文件之前抛出 `InputValidationError`。 若为引用添加前缀后产生值冲突，使 CSS 属性选择器无法保持原来的匹配与不匹配关系，也会在写入前以同一错误拒绝。

本地样式表的选择器仅作用于对应年份的行，使通用选择器也保持该行的绘制引用。这是 SVG 合成，而非完整的 CSS 隔离：导入的样式表、关键帧和字体等全局名称，以及依赖外部文档结构的选择器仍遵循现有 CSS 语义。自定义主题应使用唯一名称和自包含的样式。

## 目录与可复现预览

[交互式目录](demo/catalog/index.html)分别统计普通资源 **193 = classic 189 + korean 4** 与 Wonder **30 = Rare 14 + Epic 10 + Legendary 6**。普通资源中 68 个为季节型，125 个适用于所有季节。variant 和放置 instance 不增加 ID 总数。[在线 Wonder 图鉴](https://t1seo.github.io/maeul-in-the-sky/#wonders)显示真实发现状态和条件。

生成脚本使用固定 seed 与 UTC 日期。记录的新输入 SVG 优化实验在 6 个捕获 SVG 上减少了 16.54% 到 17.06% 的 gzip 大小，并出现少量 subpixel 差异。它不能证明渲染速度或 FPS 提升，也没有测量之后的所有预览。详情见[测量的渲染与 SVG 大小](demo/performance.md)。

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

## 许可证

[MIT](../LICENSE) © [t1seo](https://github.com/t1seo)
