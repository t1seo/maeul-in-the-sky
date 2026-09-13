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
│       ├── assets/        # 193 ordinary catalog IDs and modular renderers
│       └── epics/         # 30 separately counted Wonder gates/renderers
├── demo/                  # Portable enhanced demo controllers
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
- **Season rotation**: Legacy helpers retain `computeSeasonRotation(oldestDate, hemisphere)` for caller-provided week grids
- **Hemisphere**: Southern hemisphere adds +26 to rotation (6-month shift)
- **Seeded RNG**: Scene identities derive from layout version, normalized username, optional layout seed, and absolute dates/weeks; lighting mode never changes placements
- **Biome map**: `Map<"week,day", BiomeContext>` — rivers follow noise-based paths, ponds form at low points

## Commands

```bash
npm run build        # Build with tsup (outputs dist/)
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
- Catalog: 193 ordinary IDs (189 classic + 4 Korean), including 68 seasonal IDs; 30 Wonders are counted separately
- Animation budget: 50 max (water 15, sparkle 10, clouds 2, windmills 4, flags 4)
