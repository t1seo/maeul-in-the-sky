# Maeul asset catalog

These sheets are generated from the same typed registries used by the Terrain renderer. They document catalog IDs, not the number of visible instances in one scene.

Browse the [interactive catalog](index.html) to filter the original renderer artwork by season, family, and style, or switch between dark and light palettes.

## Exact registry totals

| Catalog                         | Count |
| ------------------------------- | ----: |
| Ordinary assets                 |   193 |
| Classic ordinary assets         |   189 |
| Original Korean ordinary assets |     4 |
| Seasonal ordinary assets        |    68 |
| All-season ordinary assets      |   125 |
| Wonders, counted separately     |    30 |
| Rare Wonders                    |    14 |
| Epic Wonders                    |    10 |
| Legendary Wonders               |     6 |

Variants, animation states, and repeated scene placements do not increase these totals. The Korean catalog contains the original `hanok`, `pavilion`, `stoneWall`, and `onggi` renderers.

## Generated sheets

| Group           | Dark                                              | Light                                               |
| --------------- | ------------------------------------------------- | --------------------------------------------------- |
| Ordinary assets | [SVG](assets-dark.svg) · [PNG](assets-dark.png)   | [SVG](assets-light.svg) · [PNG](assets-light.png)   |
| Korean village  | [SVG](korean-dark.svg) · [PNG](korean-dark.png)   | [SVG](korean-light.svg) · [PNG](korean-light.png)   |
| Wonders         | [SVG](wonders-dark.svg) · [PNG](wonders-dark.png) | [SVG](wonders-light.svg) · [PNG](wonders-light.png) |

The machine-readable [catalog.json](catalog.json) contains the same counts and public metadata. Preview poses are static and use catalog bounds plus the registered seasonal palette.

The [online Wonder encyclopedia](https://t1seo.github.io/maeul-in-the-sky/#wonders) shows actual discovered and locked states for the currently loaded scene. Eligibility does not guarantee placement because spacing, neighborhood context, chance, and the maximum-three Wonder budget also apply.

Regenerate this directory with:

```bash
npm run generate:catalog
```

CI and release workflows can detect registry or generated-art drift without rewriting files:

```bash
npx tsx scripts/catalog/check-generated.ts docs/demo/catalog
```
