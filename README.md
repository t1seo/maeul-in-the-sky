<div align="center">

# Maeul in the Sky

**Build a living isometric village from your GitHub contributions.**

[![npm version](https://img.shields.io/npm/v/maeul-in-the-sky?color=cb3837&logo=npm)](https://www.npmjs.com/package/maeul-in-the-sky)
[![npm downloads](https://img.shields.io/npm/dt/maeul-in-the-sky?color=cb3837&logo=npm)](https://www.npmjs.com/package/maeul-in-the-sky)
[![CI](https://github.com/t1seo/maeul-in-the-sky/actions/workflows/ci.yml/badge.svg)](https://github.com/t1seo/maeul-in-the-sky/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English](README.md) · [한국어](docs/README.ko.md) · [日本語](docs/README.ja.md) · [中文](docs/README.zh.md)

<br />

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/preview-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset=".github/assets/preview-light.svg">
  <img alt="An animated isometric village built from a GitHub Contribution Calendar" src=".github/assets/preview-dark.svg" width="840">
</picture>

[**Try the preset demo**](https://t1seo.github.io/maeul-in-the-sky/) · [Quick start](#quick-start) · [npm](https://www.npmjs.com/package/maeul-in-the-sky) · [Showcase](SHOWCASE.md)

</div>

Maeul (마을) means “village” in Korean. Each day in your Contribution Calendar becomes part of a floating Terrain: quiet days form water and open land, while active days grow forests, farms, villages, cities, and rare wonders.

The output is a pair of standalone SVG files. They work in profile READMEs, switch with GitHub’s color mode, and require no client-side JavaScript.

## What your village includes

- Deterministic isometric Terrain with 100 elevation levels
- Four calendar-aligned seasons and 48 seasonal assets
- Procedural rivers, ponds, forests, weather, and ambient animation
- 118 terrain asset types, from trees and farms to towers and animals
- 30 discoverable Epic Wonders across Rare, Epic, and Legendary tiers
- Dark and light SVGs with accessible titles, descriptions, and reduced-motion support
- Northern and Southern Hemisphere season mapping
- Visible contribution range, active days, streaks, busiest month, and Wonder count

## Choose a village preset

Presets change which assets appear. They do not change your contribution counts, elevation, or colors.

| Nature | Balanced | Civilization |
|:---:|:---:|:---:|
| [![Nature preset](docs/demo/assets/preset-nature-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=nature&mode=dark) | [![Balanced preset](docs/demo/assets/preset-balanced-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=balanced&mode=dark) | [![Civilization preset](docs/demo/assets/preset-civilization-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=civilization&mode=dark) |
| More forests and open land | Nature, farms, and towns | More buildings on everyday active days |
| `preset: nature` | `preset: balanced` | `preset: civilization` |

## Quick start

### 1. Add the Action

For a GitHub profile, use the repository whose name matches your username. Add `.github/workflows/maeul-sky.yml`:

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

The repository owner is used as the GitHub username. Set `username` explicitly when the Terrain should represent someone else.

### 2. Run it once

Open **Actions → Update Maeul in the Sky → Run workflow**. The first run creates:

- `maeul-in-the-sky-dark.svg`
- `maeul-in-the-sky-light.svg`

If the commit step is denied, open **Settings → Actions → General → Workflow permissions** and allow read and write permissions.

### 3. Add it to your README

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./maeul-in-the-sky-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./maeul-in-the-sky-light.svg">
  <img alt="My GitHub contribution village" src="./maeul-in-the-sky-dark.svg" width="100%">
</picture>
```

## Action reference

| Input | Description | Default |
|---|---|---|
| `username` | GitHub user whose Contribution Calendar is used | Repository owner |
| `github_token` | Token used for the GitHub GraphQL API | `${{ github.token }}` |
| `theme` | Theme renderer | `terrain` |
| `title` | SVG title | `@username` |
| `output_dir` | Directory for both SVG files | `./` |
| `year` | Calendar year; omit for the rolling last 52 weeks | Rolling 52 weeks |
| `hemisphere` | Seasonal mapping: `north` or `south` | `north` |
| `preset` | `nature`, `balanced`, or `civilization` | `balanced` |
| `density` | Advanced building-density override from 1 to 10 | Preset value |

Outputs: `dark_svg_path` and `light_svg_path` contain the generated file paths.

### Common customizations

```yaml
- uses: t1seo/maeul-in-the-sky@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    username: octocat
    preset: nature
    hemisphere: south
    title: 'Octocat’s coding village'
```

Use `density` only when you want finer control than the three presets. A higher value places buildings on lower-activity cells; a lower value leaves more nature. The allowed range is 1 to 10.

## How Terrain Generation works

Contribution intensity is normalized against your own activity. A busy day for you can become a city even if another person has a different number of contributions.

| Contribution pattern | Terrain result |
|---|---|
| No activity | Water and open space |
| Light activity | Shore, grass, and small vegetation |
| Regular activity | Forests and farms |
| High activity | Villages and towns |
| Peak activity | Cities, towers, and Wonder candidates |

Consistency expands the island. Intensity develops individual cells. The same username, Contribution Calendar, year, hemisphere, and density always produce the same placement.

### Epic Wonders

High-activity Terrain can reveal one of 30 special landmarks:

- **Rare (14):** Mount Fuji, Giant Sequoia, Colosseum, Coral Reef, and more
- **Epic (10):** Aurora, Taj Mahal, Glacier Peak, Bioluminescent Pool, and more
- **Legendary (6):** Floating Island, Dragon Nest, World Tree, Ancient Portal, and more

Wonder selection considers the cell’s activity, the richness of nearby cells, and overall contribution statistics. Up to three Wonders are placed with spacing rules so they remain meaningful and readable.

## CLI

Node.js 20 or newer is required. GitHub’s GraphQL API requires a token for normal CLI use.

```bash
GITHUB_TOKEN="$(gh auth token)" npx --yes maeul-in-the-sky \
  --user octocat \
  --preset civilization \
  --output ./terrain
```

Run `npx --yes maeul-in-the-sky --help` for every option. Omit `--year` for a rolling 52-week range.

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

The package also exports `fetchContributions`, `computeStats`, the theme registry, and the preset catalog. Both ESM and CommonJS builds include TypeScript declarations.

## Data and accessibility

- Contribution data is requested directly from GitHub’s GraphQL API during each run.
- Maeul in the Sky has no analytics, account database, or telemetry endpoint.
- The generated SVG contains aggregate counts and dates, not repository names or contribution details.
- Data visibility follows the supplied token. Use the minimum token permissions appropriate for your repository.
- SVGs include `<title>`, `<desc>`, `role="img"`, and a static presentation when reduced motion is requested.

## Troubleshooting

### The Action cannot commit the SVG files

Confirm that the workflow has `contents: write` and that repository Workflow permissions allow read and write access. Protected branches may require a separate pull-request strategy.

### The wrong account is shown

Set the `username` input. Scheduled workflows now default to the repository owner rather than the actor who last edited or triggered the workflow.

### The date range is not the current calendar year

That is expected when `year` is omitted. The default matches GitHub’s rolling 52-week profile view. Set `year: 2025`, for example, to render one calendar year.

### The SVG does not animate

The operating system’s reduced-motion preference intentionally disables animation. Some Markdown hosts also restrict SVG animation; the Terrain remains fully visible as a static image.

### Private contributions are missing

The generated result can only include contributions visible to the supplied token. Do not broaden token permissions unless you understand and accept that access.

For other problems, check [Support](SUPPORT.md) or [open an issue](https://github.com/t1seo/maeul-in-the-sky/issues/new/choose).

## Community

- Share a profile in the [Showcase](SHOWCASE.md)
- Read the [contribution guide](CONTRIBUTING.md)
- Report vulnerabilities through the [security policy](SECURITY.md)
- Follow the [code of conduct](CODE_OF_CONDUCT.md)

## License

[MIT](LICENSE) © [t1seo](https://github.com/t1seo)
