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
- 与日历对应的四季和 48 种季节资源
- 程序生成的河流、池塘、森林、天气和环境动画
- 从树木、农场到高塔、动物的 118 种 Terrain 资源
- Rare、Epic、Legendary 三个等级的 30 种 Epic Wonders
- 带无障碍标题、描述和减少动态效果支持的深色与浅色 SVG
- 北半球与南半球的季节映射
- 可见的贡献日期、活跃天数、连续贡献、最活跃月份和 Wonder 数量

## 选择村庄预设

预设只改变出现的资源，不会改变贡献数、高度或颜色。

| Nature | Balanced | Civilization |
|:---:|:---:|:---:|
| [![Nature 预设](demo/assets/preset-nature-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=nature&mode=dark) | [![Balanced 预设](demo/assets/preset-balanced-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=balanced&mode=dark) | [![Civilization 预设](demo/assets/preset-civilization-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=civilization&mode=dark) |
| 更多森林和开阔地 | 自然、农场与城镇的平衡 | 日常活跃日也出现更多建筑 |
| `preset: nature` | `preset: balanced` | `preset: civilization` |

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
  <source media="(prefers-color-scheme: dark)" srcset="./maeul-in-the-sky-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./maeul-in-the-sky-light.svg">
  <img alt="我的 GitHub 贡献村庄" src="./maeul-in-the-sky-dark.svg" width="100%">
</picture>
```

## Action 输入

| 输入 | 说明 | 默认值 |
|---|---|---|
| `username` | 获取 Contribution Calendar 的 GitHub 用户 | 仓库所有者 |
| `github_token` | GitHub GraphQL API 令牌 | `${{ github.token }}` |
| `theme` | Theme 渲染器 | `terrain` |
| `title` | SVG 标题 | `@username` |
| `output_dir` | 保存两个 SVG 的目录 | `./` |
| `year` | 日历年份；省略时使用最近 52 周 | 最近 52 周 |
| `hemisphere` | 季节映射：`north` 或 `south` | `north` |
| `preset` | `nature`、`balanced` 或 `civilization` | `balanced` |
| `density` | 1 到 10 的高级建筑密度覆盖值 | 预设值 |

输出 `dark_svg_path` 和 `light_svg_path` 包含生成文件的路径。

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

| 贡献模式 | Terrain 结果 |
|---|---|
| 无活动 | 水域和空地 |
| 少量活动 | 岸边、草地和小型植被 |
| 持续活动 | 森林和农场 |
| 高活动 | 村庄和城镇 |
| 峰值活动 | 城市、高塔和 Wonder 候选位置 |

持续贡献会扩大岛屿，单日强度会发展各个单元。用户名、Contribution Calendar、年份、半球和密度相同时，布局也相同。

### Epic Wonders

高活动 Terrain 中可以发现 30 种特殊地标。

- **Rare 14 种：** 富士山、巨型红杉、斗兽场、珊瑚礁等
- **Epic 10 种：** 极光、泰姬陵、冰川峰、生物发光池等
- **Legendary 6 种：** 浮空岛、龙巢、世界树、远古传送门等

Wonder 的选择会考虑当前单元的活动量、附近单元的丰富程度和整体贡献统计。为了保持清晰，最多放置三个，并保持一定间距。

## CLI

需要 Node.js 20 或更高版本以及 GitHub 令牌。

```bash
GITHUB_TOKEN="$(gh auth token)" npx --yes maeul-in-the-sky \
  --user octocat \
  --preset civilization \
  --output ./terrain
```

运行 `npx --yes maeul-in-the-sky --help` 查看全部选项。省略 `--year` 时使用最近 52 周。

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

该包还导出 `fetchContributions`、`computeStats`、Theme 注册表和预设目录。ESM 与 CommonJS 构建都包含 TypeScript 类型声明。

## 数据与无障碍

- 每次运行都直接从 GitHub GraphQL API 请求贡献数据。
- 不包含分析、用户数据库或遥测端点。
- SVG 只包含汇总数字和日期，不包含仓库名称或单次贡献详情。
- 数据可见范围由所提供的令牌决定。请使用满足需求的最小权限。
- SVG 包含 `<title>`、`<desc>`、`role="img"`，系统请求减少动态效果时会静态显示。

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
