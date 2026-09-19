# Maeul in the Sky

Animated isometric terrain SVG generator for GitHub contribution graphs.

- **Package**: `maeul-in-the-sky`
- **CLI**: `maeul-sky`
- **SVG output**: `maeul-in-the-sky-dark.svg`, `maeul-in-the-sky-light.svg`

## Architecture

```
src/
├── api/
│   ├── client.ts          # Typed GitHub GraphQL client facade
│   ├── request.ts         # Retry, timeout, and transport policy
│   ├── response.ts        # GraphQL response parsing
│   └── queries.ts         # GraphQL query strings
├── core/
│   ├── types.ts           # Shared type definitions
│   ├── calendar.ts        # Canonical Sunday-based calendar normalization
│   ├── stats.ts           # Contribution statistics (streaks, totals)
│   ├── settings/          # Versioned settings/snapshot schemas and parsers
│   └── archive/           # Portable multi-year comparison helpers
├── themes/
│   ├── registry.ts        # Theme registration system
│   ├── shared.ts          # Grid layout, enrichment, title/stats bar
│   └── terrain/           # Isometric terrain theme
│       ├── index.ts       # Portable scene/render entry point
│       ├── scene/         # Deterministic preparation, metadata, and layouts
│       ├── blocks.ts      # Compatibility facade for isometric block modules
│       ├── palette.ts     # Compatibility facade for palette modules
│       ├── seasons.ts     # 4-season system (8 zones, tinting, asset overrides)
│       ├── biomes.ts      # Procedural biome generation (rivers, ponds, forests)
│       ├── effects/       # Clouds, celestials, water overlays, and particles
│       ├── assets/        # 210 ordinary catalog IDs and modular renderers
│       └── epics/         # 30 separately counted Wonder gates/renderers
├── demo/                  # Portable enhanced demo controllers
├── world/                 # Separate 2D/3D world explorer
│   ├── model/             # Deterministic frozen scenes, dated frames and model recipes
│   ├── data/              # World files, local library, public metadata and visits
│   ├── map/               # Interactive SVG map and standalone postcards
│   ├── three/             # Lazy WebGL renderer, procedural geometry and GLB export
│   └── app/               # Explorer controls, replay and personal journals
├── preview/               # Loopback-only authenticated preview service
├── output/                # SVG/snapshot files and static PNG adapter
├── archive/               # Node multi-year archive generator
├── browser.ts             # Browser-safe public entry
├── utils/
│   ├── math.ts            # seededRandom, lerp, clamp
│   ├── color.ts           # Color manipulation
│   └── noise.ts           # Simplex noise wrapper
├── cli/                   # Commander CLI and Action adapter logic
├── index.ts               # CLI entry
├── action.ts              # GitHub Action adapter
├── generate/              # Input/options/output orchestration
└── generate.ts            # Terrain Generation facade
```

## Key Concepts

- **100-level system**: Contribution counts map to levels 0-99 for fine-grained terrain
- **Isometric projection**: `isoX = originX + (week - day) * THW`, `isoY = originY + (week + day) * THH`
- **Projection**: Prepared scenes fit their complete calendar bounds into banner/card viewports; the legacy block helper retains caller-supplied origins such as x=405
- **Contribution Calendar**: Sunday-based weeks with date-positioned days; edge weeks may be partial
- **Season zones**: Prepared scenes derive the 8 zones (0-7) from each absolute UTC date relative to December 1, including supported years 1–9999
- **Calendar rewards**: Dated primary assets and consistency effects use calendar seasons (December–February winter in the north, shifted six months in the south), independently of gradual terrain color transitions
- **Season rotation**: Legacy helpers retain `computeSeasonRotation(oldestDate, hemisphere)` for caller-provided week grids
- **Hemisphere**: Southern hemisphere adds +26 to rotation (6-month shift)
- **Seeded RNG**: Scene identities derive from layout version, normalized username, optional layout seed, and absolute dates/weeks; lighting mode never changes placements
- **Biome map**: `Map<"week,day", BiomeContext>` — rivers follow noise-based paths, ponds form at low points

## Commands

```bash
npm run build        # Build with tsup (outputs dist/)
npm run build:world  # Bundle the separate explorer into docs/demo/world/app/
npm run dev          # Watch mode
npm test             # Run vitest
npm run lint         # ESLint
npm run typecheck    # TypeScript --noEmit
npm run test:artifact # Build, pack, install, and smoke-test every public adapter
```

## Scripts

```bash
npx tsx scripts/generate-preview.ts    # Generate README preview SVGs (.github/assets/)
npx tsx scripts/generate-demo.ts       # Generate six demo preset SVGs (docs/demo/assets/)
npx tsx scripts/generate-examples.ts   # Generate example SVGs (examples/)
npx tsx scripts/generate-cases.ts      # Generate case study SVGs (examples/cases/)
npx tsx scripts/generate-catalog.ts docs/demo/catalog # Generate registry catalog sheets
```

## Testing

- Tests in `tests/` mirror `src/` structure
- Vitest runs Node tests and a real Chromium browser project, merging both into the existing coverage thresholds; install Chromium with `npx playwright install chromium`
- The additional `world-browser` project covers real map/WebGL behavior. Browser files run serially to avoid competing software GPU contexts; do not overlap separate WebGL test processes.
- Season tests use specific week numbers mapped to expected zones

## Conventions

- Gitmoji commit style: `emoji type: message`
- **Always update CHANGELOG.md** when committing notable changes (new features, fixes, breaking changes)
- **Always create/update GitHub release** after pushing version changes: `gh release create vX.Y.Z` with notes matching CHANGELOG. Update the floating `v1` tag to point to the latest release.
- TypeScript strict mode
- ESM modules (`"type": "module"` in package.json)
- No default exports — named exports only
- Built-in themes are registered explicitly by `themes/registry.ts`
- No horizontal rules (`---`) in README files

## Rendering Pipeline

1. Validate a Terrain Generation request
2. Fetch and normalize its Contribution Calendar
3. Compute complete contribution statistics
4. Resolve versioned render settings and normalization
5. Prepare one deterministic scene with isometric cells, biomes, ordinary assets, Wonders, neighborhoods, and metadata
6. Shade the prepared scene into matching dark/light SVGs
7. Optionally rerender with motion off for static PNG and serialize a snapshot
8. For archive requests, reuse one fixed comparison scale for two to five annual scenes
9. Create output directories and write the requested SVG, PNG, snapshot, and archive files

## Important Constants

- SVG viewport: 840 x 240
- `THW = 8` (tile half-width), `THH = 3.5` (tile half-height)
- Grid: all supplied Sunday-based weeks and available days, including partial edge weeks
- Catalog: 210 ordinary IDs (197 classic + 13 Korean), including 68 seasonal IDs; 30 Wonders are counted separately, for 240 total IDs
- Culture (`classic`/`korean`) and art style (`miniature`/`pixel`) are independent; existing settings default to miniature
- Pixel sprites are generated offline for all 240 IDs and 660 variant slots; run `npm run generate:pixel` after artwork changes, then `npm run check:pixel`
- Layout version 3 derives daily rewards from raw contribution counts at 0/1/5/10/25/50; decoration density does not lower a reward tier or replace its guaranteed primary asset
- New nature IDs have three geometric variants; composition remains date-stable and nature-led at high daily tiers
- Consistency effects use trailing 28 calendar days, active thresholds 5/12/20, observed-day metadata, and at most 10 groups replacing town sparkles; old v1/v2 prepared scenes remain renderable
- Animation budget: 50 max (water 15, sparkle 10, clouds 2, windmills 4, flags 4)

## World Explorer Contracts

- `/world/` is a separate experience. The existing CLI, Action and public browser entry do not import Three.js; the explorer loads it only when 3D is selected.
- Preserve full absolute dates and year-month identities, observed zero versus missing days, and fixed dated positions. World replay hides future rewards while retaining the frozen scene.
- Scene/model/document versions are validated. World files are limited to 8 MiB and 800 reserved calendar days; existing snapshots/archives retain their 2 MiB limit. The local library keeps at most 20 revisions.
- Public project metadata comes from GitHub; daily totals must never be presented as per-repository contributions. Personal bookmarks and discovery journals stay outside exported documents.
- `seasonForMonth` and `weatherForMonth` own hemisphere/override rules. Each renderer uses one elapsed clock; off/subtle/reduced/hidden/offscreen modes retain their current pose without advancing it.
- Renderers implement `src/world/model/renderer-types.ts`, mount replacements before disposing the current view, discard stale asynchronous results, and dispose all owned resources. Water and path geometry retain model route heights of 0 and 0.5 respectively.
- Frozen primitive recipes support genuine GLB export; the exported model is a keepsake, with no claim of certified 3D-print readiness.
