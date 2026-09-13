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
- Four calendar-aligned seasons and 68 registered seasonal asset IDs
- Procedural rivers, ponds, forests, weather, and ambient animation
- 193 ordinary asset IDs: 189 classic and 4 original Korean village assets
- 30 discoverable Epic Wonders across Rare, Epic, and Legendary tiers
- Dark and light SVGs with accessible titles, descriptions, and reduced-motion support
- Northern and Southern Hemisphere season mapping
- Visible contribution range, active days, streaks, busiest month, and Wonder count
- Banner/card layouts, full/subtle/off motion, static PNG, and a zoomable browser explorer
- Versioned settings, contribution snapshots, multi-year comparisons, and local authenticated preview

The README previews and six preset images use seeded **synthetic data**, with 364 supplied days from **2025-01-05 to 2026-01-03**. They are examples, not a fetched account or a complete 2025 calendar. Sparse and maximum previews use separate seeded patterns; the original benchmark fixtures remain frozen for reproducible comparisons.

## Choose a village preset

Presets change which assets appear. They do not change your contribution counts, elevation, or colors.

|                                                             Nature                                                             |                                                               Balanced                                                               |                                                                   Civilization                                                                   |
| :----------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------: |
| [![Nature preset](docs/demo/assets/preset-nature-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=nature&mode=dark) | [![Balanced preset](docs/demo/assets/preset-balanced-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=balanced&mode=dark) | [![Civilization preset](docs/demo/assets/preset-civilization-dark.svg)](https://t1seo.github.io/maeul-in-the-sky/?preset=civilization&mode=dark) |
|                                                   More forests and open land                                                   |                                                       Nature, farms, and towns                                                       |                                                      More buildings on everyday active days                                                      |
|                                                        `preset: nature`                                                        |                                                          `preset: balanced`                                                          |                                                              `preset: civilization`                                                              |

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
  <source media="(prefers-color-scheme: dark)" srcset="./maeul-in-the-sky-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="./maeul-in-the-sky-light.svg" />
  <img alt="My GitHub contribution village" src="./maeul-in-the-sky-dark.svg" width="100%" />
</picture>
```

## Action reference

| Input            | Description                                              | Default                     |
| ---------------- | -------------------------------------------------------- | --------------------------- |
| `username`       | GitHub user whose Contribution Calendar is used          | Repository owner            |
| `github_token`   | Token used for the GitHub GraphQL API                    | `${{ github.token }}`       |
| `theme`          | Theme renderer                                           | `terrain`                   |
| `title`          | SVG title                                                | `@username`                 |
| `output_dir`     | Directory for both SVG files                             | `./`                        |
| `year`           | Calendar year; omit for the rolling last 52 weeks        | Rolling 52 weeks            |
| `hemisphere`     | Seasonal mapping: `north` or `south`                     | `north`                     |
| `preset`         | `nature`, `balanced`, or `civilization`                  | `balanced`                  |
| `density`        | Advanced building-density override from 1 to 10          | Preset value                |
| `config`         | Version-1 settings JSON path                             | None                        |
| `input`          | Snapshot JSON path; skips the network request            | None                        |
| `write_snapshot` | Write a reusable snapshot: `true` or `false`             | `false`                     |
| `motion`         | `full`, `subtle`, or `off`                               | `full`                      |
| `layout`         | `banner` or `card`                                       | `banner`                    |
| `village_style`  | `classic` or `korean`                                    | `classic`                   |
| `layout_seed`    | Optional deterministic layout override                   | Username/year/date identity |
| `normalization`  | `relative`, `fixed`, or `shared` for multi-year archives | `relative`                  |
| `max_count`      | Positive fixed-scale maximum; requires `fixed`           | None                        |
| `format`         | `svg`, `png`, or `both`                                  | `svg`                       |
| `scale`          | Static PNG scale from 1 to 4                             | `2`                         |
| `years`          | Two to five distinct comma-separated years               | None                        |

Outputs: `dark_svg_path` and `light_svg_path` contain the default generated paths. Optional and archive runs also expose `dark_png_path`, `light_png_path`, `snapshot_path`, `archive_path`, `comparison_dark_svg_path`, and `comparison_light_svg_path` when applicable.

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

| Contribution pattern | Terrain result                        |
| -------------------- | ------------------------------------- |
| No activity          | Water and open space                  |
| Light activity       | Shore, grass, and small vegetation    |
| Regular activity     | Forests and farms                     |
| High activity        | Villages and towns                    |
| Peak activity        | Cities, towers, and Wonder candidates |

Counts determine terrain height. Supplied dates keep their actual UTC weekday and Sunday-based week, including partial weeks and gaps. Missing dates remain absent; known zero-count dates remain real zero days. Decorations never add contributions.

### Epic Wonders

High-activity Terrain can reveal one of 30 special landmarks:

- **Rare (14):** Mount Fuji, Giant Sequoia, Colosseum, Coral Reef, and more
- **Epic (10):** Aurora, Taj Mahal, Glacier Peak, Bioluminescent Pool, and more
- **Legendary (6):** Floating Island, Dragon Nest, World Tree, Ancient Portal, and more

Wonder selection considers the cell’s activity, the richness of nearby cells, and overall contribution statistics. Up to three Wonders are placed with spacing rules so they remain meaningful and readable.

## Explore and set up

Open the [demo](https://t1seo.github.io/maeul-in-the-sky/) to choose a preset, username/year/title and hemisphere. Advanced controls cover density, motion, banner/card, classic/Korean style, height scale and layout seed. Changing sample settings does not fetch an account. Import a snapshot for actual counts, or use the local service below.

Select a date to inspect its count, biome and placements. The explorer displays source, exact dates, total, active days, streak and a height/season legend. Zoom supports +/−/reset, keyboard panning, Escape and focus return. The [Wonder encyclopedia](https://t1seo.github.io/maeul-in-the-sky/#wonders) shows discovered/locked landmarks and their actual gates. Eligibility does not guarantee selection: spacing, neighboring terrain, chance and the maximum-three budget also apply.

The setup section downloads settings JSON, a workflow and a README snippet. Its workflow publishes to the `output` branch and its snippet points there, as an alternative to the main-branch quick start above. Only the publication job receives `contents: write`. Titles or layout seeds containing `${{` cannot be exported to a workflow because GitHub evaluates Actions expressions; they remain valid in images and JSON.

## CLI

Node.js 20 or newer is required. The new options in this checkout are **Unreleased**; packaged commands require a release containing them. For current source, run `npm install` and `npm run build`, then replace `npx --yes maeul-in-the-sky` below with `node dist/index.js`.

```bash
GITHUB_TOKEN="$(gh auth token)" npx --yes maeul-in-the-sky \
  --user octocat --preset civilization --output ./terrain

npx --yes maeul-in-the-sky --input village.snapshot.json \
  --layout card --village-style korean --motion off --format both --scale 2 \
  --write-snapshot --output ./terrain

GITHUB_TOKEN="$(gh auth token)" npx --yes maeul-in-the-sky \
  --user octocat --years 2024,2025 --normalization shared --output ./archive
```

| CLI flag                          | Action input     | Values / behavior                                                          |
| --------------------------------- | ---------------- | -------------------------------------------------------------------------- |
| `--user`, `-u`                    | `username`       | Account inferred from input/config; Action otherwise uses repository owner |
| `--token`                         | `github_token`   | Generation token; explicit `--token` overrides `GITHUB_TOKEN`              |
| `--theme`, `-t`                   | `theme`          | `terrain`                                                                  |
| `--title`                         | `title`          | Default `@username`                                                        |
| `--output`, `-o`                  | `output_dir`     | Default current directory                                                  |
| `--year`, `-y`                    | `year`           | Calendar year; omit for rolling 52 weeks                                   |
| `--years`                         | `years`          | 2–5 distinct comma-separated years; conflicts with `--year`                |
| `--preset`                        | `preset`         | `nature` (density 2), `balanced` (5), `civilization` (9)                   |
| `--density`                       | `density`        | Integer 1–10                                                               |
| `--hemisphere`                    | `hemisphere`     | `north` / `south`                                                          |
| `--config`                        | `config`         | Settings JSON path                                                         |
| `--input`                         | `input`          | Snapshot/archive JSON path; no network                                     |
| `--write-snapshot [path]`         | `write_snapshot` | CLI optional path; Action `true`/`false`; default off                      |
| `--motion`                        | `motion`         | `full` / `subtle` / `off`                                                  |
| `--layout`                        | `layout`         | `banner` (840×240) / `card` (420×360)                                      |
| `--style`, `--village-style`      | `village_style`  | `classic` / `korean`                                                       |
| `--normalization`                 | `normalization`  | `relative` / `fixed` / `shared` (archive only)                             |
| `--max-count`                     | `max_count`      | Positive finite maximum; required with `fixed`, invalid without it         |
| `--layout-seed`                   | `layout_seed`    | Optional deterministic seed override                                       |
| `--format`                        | `format`         | `svg` / `png` / `both`; default `svg`                                      |
| `--scale`                         | `scale`          | Integer PNG scale 1–4; default 2                                           |
| `--help`, `-h`; `--version`, `-V` | —                | CLI help/version                                                           |

Run `npx --yes maeul-in-the-sky --help` and `npx --yes maeul-in-the-sky preview --help` for your installed version. Invalid/conflicting options fail with field-specific errors.

Defaults remain `terrain`, `balanced`, density `5`, `north`, `classic`, `full`, `banner`, relative P90 and a rolling range. Render settings resolve in this order: explicit CLI/Action/UI field → loaded settings → selected preset defaults → library defaults. In single-render CLI/API calls, `--config` supplies loaded settings in preference to snapshot settings; they are not merged field by field. An explicit preset alone does not replace saved density. Omitted flags do not override saved settings. Format and PNG scale are output options, not saved render settings.

The default still writes `maeul-in-the-sky-dark.svg` and `maeul-in-the-sky-light.svg`. Optional output adds matching `.png` files and `maeul-in-the-sky.snapshot.json`. With `--format png`, SVG path results are empty strings. Additional Action outputs are `dark_png_path`, `light_png_path`, `snapshot_path`, `archive_path`, `comparison_dark_svg_path` and `comparison_light_svg_path`.

### Local preview with your account

```bash
GITHUB_TOKEN="$(gh auth token)" npx --yes maeul-in-the-sky preview --port 4318
```

Open `http://127.0.0.1:4318/` and select **Fetch contributions**. The service binds loopback only and reads its token from the server environment. There is no browser token field: do not place tokens in links, JSON or forms. The static public demo imports JSON and never contacts your localhost service. Missing credentials produce an actionable error; upstream errors are sanitized. The local process caches account/year responses for five minutes, up to 32 entries.

## Saved data, comparisons and privacy

Settings (`kind: maeul-settings`), snapshots (`maeul-snapshot`) and archives (`maeul-archive`) use `schemaVersion: 1`. Settings contain username, optional year and render settings. Snapshots add year, date/count/level weeks and `source.kind` (`github`, `import`, `sample`), with optional `fetchedAt`. Parsers recompute statistics, reject unsupported versions, duplicate/invalid dates and invalid counts/options, and limit imports to 2 MiB and 20,000 days across at most 20 snapshots.

**Save current year** stores a snapshot in this browser's local storage. Replacing a saved username/year requires confirmation. Compare 2–5 years of one account: the default pools positive counts across selected snapshots, takes their P90 and stores that common maximum as fixed normalization in the archive manifest. Equal counts then have equal levels/heights. An explicit fixed maximum overrides it; individual relative views remain available outside comparisons. CLI archives contain year directories with images/snapshots, `archive.json` and two vertically stacked `maeul-in-the-sky-comparison-{dark,light}.svg` files. Replay with `--input archive.json`; `--normalization shared` recomputes the pooled scale.

Settings links contain configuration, including username/title, but no counts, token or snapshot payload. They do not fetch the named account. Snapshots/archives contain daily counts and dates and may reveal private activity totals visible to your token; review them before sharing. Source labels record provenance, not cryptographic proof of GitHub origin. There is no analytics, account database or telemetry endpoint. Network generation contacts GitHub directly; imports work offline. SVGs contain dates/counts, not repository names or contribution details, and no executable scripts or external resources.

## Layout, motion and stable villages

Dark and light shade one prepared scene with matching geometry, ordinary assets and Wonders. Layout version 1 uses normalized username, optional `layoutSeed` and absolute dates for deterministic random identities. With fixed normalization and unchanged local context, overlapping interior dates retain terrain and ordinary placements when a rolling range shifts; screen positions move with the window. Relative P90 can change heights, neighbors can change eligibility, and the global Wonder budget can change selections. Different settings/ranges or future layout versions need not produce identical pixels. Source timestamps do not affect placement.

Relative normalization uses the positive-count P90 and a square-root mapping to levels 1–99; zero stays 0. Fixed mode uses `maxCount`. Seasons follow real dates and hemisphere. Korean style adds original `hanok`, `pavilion`, `stoneWall` and `onggi` artwork and paths between eligible neighborhood buildings. Quiet scenes never receive invented activity.

Both banner and card retain the full supplied period. Card places larger statistics around fitted terrain. API `width`/`height` set display dimensions; `layout` sets the logical viewBox. SVGs retain accessible title/description. `full` enables ambient effects; `subtle` limits motion to slow clouds and gentle water; `off` omits CSS animations/keyframes and SMIL. Reduced-motion preference selects a visible static fallback. PNG always rerenders with `motion: off`, an opaque mode background and scale 1–4 (default 2); it is static. Node uses bundled resvg WASM and Noto Sans KR; browser export uses SVG/canvas, so rasterization and available fonts can differ.

## JavaScript and browser API

```bash
npm install maeul-in-the-sky
```

```js
import { generateTerrain, generateArchive } from 'maeul-in-the-sky';

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

The Node entry supports ESM/CommonJS and filesystem/network/PNG adapters. The ESM entry `maeul-in-the-sky/browser` exports portable rendering, parsers, settings, snapshot/archive helpers, catalogs and TypeScript types without Node filesystem, token client or WASM rasterizer dependencies. Given JSON from your file input:

```js
import {
  parseSnapshot,
  snapshotToContributionData,
  renderTerrain,
  prepareTerrainScene,
  renderTerrainScene,
} from 'maeul-in-the-sky/browser';

export function renderSavedVillage(snapshotJson) {
  const snapshot = parseSnapshot(snapshotJson);
  const data = snapshotToContributionData(snapshot);
  const options = { ...snapshot.settings, style: 'korean', layout: 'card', motion: 'off' };
  const { dark, light, metadata } = renderTerrain(data, options);
  const scene = prepareTerrainScene(data, options);
  const inlineDark = renderTerrainScene(scene, 'dark', { namespace: 'profile-village' });
  return { dark, light, metadata, inlineDark };
}
```

`renderTerrain` returns SVGs and metadata covering dates, statistics, normalization and actual placements. `TerrainScene` is JSON-safe. Use distinct namespaces for multiple identical inline scenes. Portable and Node inputs accept `style` or `villageStyle`; conflicting aliases are rejected. Canonical v1 settings serialize as `style`. Types `TerrainRenderOptions` and `TerrainSceneRenderOptions` are exported. Existing `Theme.render` still returns only `{ dark, light }`.

Custom Theme archive comparisons parse SVG and CSS locally, including namespace prefixes and character references. XML declarations and DOCTYPEs are removed when embedding each row. External DTDs and custom entities are not loaded; malformed XML or unsupported references raise `InputValidationError` before archive files are written. If adding prefixes makes reference values indistinguishable so a CSS attribute selector cannot preserve its original matches, the same error is raised before writing.

Local stylesheet selectors are restricted to their annual row so generic rules keep row-specific paint references. This is SVG composition, not a CSS encapsulation boundary: imported styles, global names such as keyframes and fonts, and selectors that depend on an external document retain their existing CSS semantics. Custom themes should keep those names unique and their styling self-contained.

## Catalog and reproducible previews

The [interactive catalog](docs/demo/catalog/index.html) groups assets by domain, season and style, with separate Wonder tiers. Counts and SVG/PNG sheets come from the renderer registries: **193 ordinary IDs = 189 classic + 4 Korean**; 68 ordinary IDs are seasonal and 125 are all-season. **30 Wonders = 14 Rare + 10 Epic + 6 Legendary**, counted separately. Variants/instances do not increase ID totals.

```bash
npx tsx scripts/generate-preview.ts
npx tsx scripts/generate-demo.ts
npx tsx scripts/generate-examples.ts
npx tsx scripts/generate-cases.ts
npx tsx scripts/generate-catalog.ts docs/demo/catalog
```

Generators use fixed seeds and UTC dates. The early-activity case supplies known zeros after five active weeks; it is not a partial import. Offline previews use guarded geometry/path optimization. The recorded fresh-input experiment saved 16.54–17.06% gzip on six captured SVGs, with small subpixel differences; it does not prove faster rendering or an FPS gain and does not measure every later preview. See [measured rendering and SVG size](docs/demo/performance.md) for inputs, rejected approaches and limits.

## Troubleshooting

- **Action publication denied:** check the job's `contents: write`, repository workflow permissions and branch protections.
- **Wrong account or dates:** set `username`/`--user` and `year`/`--year`; a sample stays a sample until data is loaded.
- **No motion:** check `motion`, reduced-motion preference and the host's SVG policy. Static terrain remains visible.
- **Private activity missing:** only counts visible to the supplied token are available.
- **Import fails:** use version-1 JSON, unique valid dates and nonnegative integer counts within the limits above.
- **Local fetch fails:** set `GITHUB_TOKEN` in the server environment and open its exact loopback URL.

See [Support](SUPPORT.md) or [open an issue](https://github.com/t1seo/maeul-in-the-sky/issues/new/choose).

## Community

- Share a profile in the [Showcase](SHOWCASE.md)
- Read the [contribution guide](CONTRIBUTING.md)
- Report vulnerabilities through the [security policy](SECURITY.md)
- Follow the [code of conduct](CODE_OF_CONDUCT.md)

## License

[MIT](LICENSE) © [t1seo](https://github.com/t1seo)
