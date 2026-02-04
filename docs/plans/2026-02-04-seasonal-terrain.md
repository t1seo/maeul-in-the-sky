# Seasonal Terrain System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Divide the 52-week contribution grid into 8 seasonal zones so the terrain visually transitions through winter → spring → summer → autumn, with 4 distinct peak seasons and 4 smooth transition bands between them. Support Northern/Southern hemisphere via CLI flag.

**Architecture:** Each week maps to a `SeasonZone` (0–7). The zone determines terrain colors, asset pools, and effects. A `seasonalPalette()` wraps the existing `getTerrainPalette100()` and tints all colors per-zone. Transition zones (1, 3, 5, 7) lerp between their neighboring peak seasons. Contribution intensity still drives elevation/height, but color hue and asset selection also depend on the week's season. Southern hemisphere shifts weeks by +26 (mod 52).

**Tech Stack:** TypeScript, SVG generation, seeded RNG (existing), color interpolation (existing `lerp`/`clamp` utils)

---

## Hemisphere Support

```
--hemisphere north|south  (CLI flag, default: north)
hemisphere: north|south   (GitHub Action input, default: north)
```

**Northern (default):** Week 0 (Jan) = Winter
**Southern:** Week 0 (Jan) = Summer → internally shifts week by +26 before zone lookup

Implementation: `getSeasonZone(week, hemisphere)` — if south, `week = (week + 26) % 52` before zone lookup.

---

## Seasonal Zone Layout (Northern Hemisphere)

```
Week:     0────6  7───12  13───19  20───25  26───32  33───38  39───45  46───51
Zone:        0       1        2        3        4        5        6        7
Season:  WINTER  W→Sp    SPRING  Sp→Su   SUMMER  Su→Au   AUTUMN  Au→W
```

| Zone | Weeks | Season | Visual Character |
|------|-------|--------|------------------|
| 0 | 0–6 | **Winter** | Snow-covered ground, frozen ponds, bare trees with snow, snowmen, igloos |
| 1 | 7–12 | Winter→Spring | Melting snow patches, first green shoots, crocus flowers, mud puddles |
| 2 | 13–19 | **Spring** | Cherry blossom trees in full bloom, tulips, butterflies, baby lambs, nests |
| 3 | 20–25 | Spring→Summer | Deepening greens, falling petals, warming yellows, beach setup |
| 4 | 26–32 | **Summer** | Beach parasols, sunbathers, lush deep green, palm trees, ice cream carts |
| 5 | 33–38 | Summer→Autumn | First yellow leaves, cooling colors, harvest begins |
| 6 | 39–45 | **Autumn** | Vivid red/orange/gold maple trees, fallen leaves, pumpkins, harvest festival |
| 7 | 46–51 | Autumn→Winter | Bare branches, gray skies, first snow flurries, frost on ground |

---

## New Seasonal Assets — Complete List (48 new types)

### Winter Assets (12 new)

| Type | Description | Variants |
|------|-------------|----------|
| `snowPine` | Pine with white snow caps on each tier | (0) light snow, (1) heavy snow, (2) frosted blue |
| `snowDeciduous` | Bare branches with snow clumps | (0) single tree, (1) thin/tall, (2) wide/old |
| `snowman` | Classic 3-circle with hat, scarf, carrot nose | (0) classic, (1) with broom, (2) melting |
| `snowdrift` | Mounded snow pile on ground | (0) small, (1) large, (2) wind-shaped |
| `igloo` | Small ice-block dome shelter | (0) classic, (1) with entrance, (2) half-built |
| `frozenPond` | Ice surface with crack lines | (0) solid, (1) with cracks, (2) thin ice |
| `icicle` | Hanging ice formations | (0) single, (1) cluster, (2) thick |
| `sled` | Wooden sled | (0) empty, (1) with gifts, (2) with runner marks |
| `snowCoveredRock` | Rock with white top | (0) small, (1) large, (2) boulder |
| `bareBush` | Leafless bush with frost | (0) small, (1) wide, (2) with berries |
| `winterBird` | Bird on snowy branch (cardinal/robin) | (0) cardinal red, (1) robin, (2) sparrow |
| `firewood` | Stacked chopped logs with snow on top | (0) small pile, (1) large stack, (2) in shelter |

### Spring Assets (12 new)

| Type | Description | Variants |
|------|-------------|----------|
| `cherryBlossom` | Full cherry blossom tree, pink clouds of petals | (0) full bloom pink, (1) early bloom (sparse), (2) white variety |
| `cherryBlossomSmall` | Smaller/younger cherry blossom | (0) sapling, (1) bush-sized, (2) weeping style |
| `cherryPetals` | Falling petal cluster (ground decoration) | (0) scattered, (1) piled, (2) swirling |
| `tulip` | Tall tulip flower | (0) red, (1) yellow, (2) purple |
| `tulipField` | Cluster of 3–5 tulips together | (0) mixed colors, (1) single color row, (2) with greenery |
| `sprout` | New green shoot from ground | (0) single, (1) pair, (2) with tiny leaf |
| `nest` | Bird nest with eggs | (0) 2 eggs, (1) 3 eggs, (2) with baby bird |
| `lamb` | Baby sheep, fluffy and small | (0) standing, (1) playing, (2) with mother |
| `crocus` | Early spring flower pushing through soil | (0) purple, (1) yellow, (2) white |
| `rainPuddle` | Small rain puddle with ripples | (0) small, (1) with reflection, (2) in mud |
| `birdhouse` | Wooden birdhouse on post | (0) classic, (1) painted, (2) with bird |
| `gardenBed` | Small raised garden with seedlings | (0) just planted, (1) sprouts showing, (2) with fence |

### Summer Assets (12 new)

| Type | Description | Variants |
|------|-------------|----------|
| `parasol` | Beach umbrella / parasol | (0) red/white stripe, (1) blue solid, (2) yellow/green |
| `beachTowel` | Towel laid on ground | (0) striped, (1) solid, (2) with sunglasses |
| `sandcastle` | (enhanced) Larger summer sandcastle | (0) simple, (1) with flag, (2) elaborate |
| `surfboard` | Standing surfboard | (0) classic, (1) short, (2) with palm design |
| `iceCreamCart` | Small wheeled cart with umbrella | (0) classic, (1) with flag, (2) popsicle sign |
| `hammock` | Hammock between two posts/trees | (0) empty, (1) with person silhouette, (2) with blanket |
| `sunflower` | Tall sunflower | (0) single, (1) pair, (2) field cluster |
| `watermelon` | Watermelon slice on ground | (0) whole, (1) half, (2) slice |
| `sprinkler` | Lawn sprinkler spraying water | (0) rotating, (1) oscillating, (2) with rainbow |
| `lemonade` | Lemonade stand | (0) small stand, (1) with sign, (2) with cups |
| `fireflies` | Cluster of tiny glowing dots (evening/dusk) | (0) few, (1) many, (2) jar |
| `swimmingPool` | Small blue rectangle pool | (0) simple, (1) with float, (2) with diving board |

### Autumn Assets (12 new)

| Type | Description | Variants |
|------|-------------|----------|
| `autumnMaple` | Maple tree with vivid red leaves | (0) bright red, (1) deep crimson, (2) orange-red |
| `autumnOak` | Oak with golden-brown leaves | (0) golden, (1) brown, (2) mixed gold-green |
| `autumnBirch` | Birch with yellow leaves | (0) bright yellow, (1) pale gold, (2) half-bare |
| `autumnGinkgo` | Ginkgo tree with fan-shaped yellow leaves | (0) full yellow, (1) half-fallen, (2) golden carpet |
| `fallenLeaves` | Pile of fallen leaves on ground | (0) red/orange mix, (1) yellow/brown mix, (2) scattered |
| `leafSwirl` | Small tornado of leaves in air | (0) warm colors, (1) mostly red, (2) mostly gold |
| `acorn` | Small acorn on ground | (0) single, (1) pair, (2) with cap separated |
| `cornStalk` | Dried corn stalk bundle | (0) single, (1) bundle of 3, (2) with ears |
| `scarecrowAutumn` | Scarecrow with autumn hat and leaf | (0) classic, (1) with crow, (2) with pumpkin head |
| `harvestBasket` | Basket overflowing with produce | (0) apples, (1) mixed vegetables, (2) grapes |
| `hotDrink` | Steaming mug on surface | (0) coffee, (1) with steam swirl, (2) pumpkin spice |
| `autumnWreath` | Decorative wreath on door/wall | (0) leaf wreath, (1) with berries, (2) with ribbon |

---

## New Seasonal Palette Colors (per mode)

### Winter Colors

```typescript
// Dark mode
snowCap: '#e8eef5',           // Snow on surfaces
snowGround: '#d8e2ee',        // Snow-covered ground tint
ice: '#a0c0e0',               // Ice surface
icicle: '#b0d4f0',            // Hanging ice
frozenWater: '#6090b8',       // Frozen pond
igloo: '#dce8f2',             // Ice blocks
sledWood: '#8a5a30',          // Sled body
sledRunner: '#607080',        // Sled metal
scarfRed: '#cc3030',          // Snowman scarf
snowmanCoal: '#2a2a2a',       // Eyes, buttons
snowmanCarrot: '#e07020',     // Nose
winterBirdRed: '#cc3030',     // Cardinal
winterBirdBrown: '#8a6040',   // Robin
firewoodLog: '#6a4020',       // Chopped logs
bareBranch: '#6a5a4a',        // Bare tree branches
frostWhite: '#e0e8f0',        // Frost on surfaces
```

### Spring Colors

```typescript
cherryPetalPink: '#f5a0b8',   // Cherry blossom pink
cherryPetalWhite: '#f8e0e8',  // White cherry variety
cherryTrunk: '#6a4030',       // Cherry tree trunk
cherryBranch: '#7a5040',      // Cherry branches
tulipRed: '#e04050',          // Red tulip
tulipYellow: '#f0d040',       // Yellow tulip
tulipPurple: '#9050c0',       // Purple tulip
tulipStem: '#5a9a40',         // Tulip stem
sproutGreen: '#80d050',       // New growth green
nestBrown: '#7a5530',         // Nest twigs
eggBlue: '#a8d8e8',           // Robin eggs
eggWhite: '#f0ece0',          // White eggs
crocusPurple: '#8040b0',      // Crocus purple
crocusYellow: '#e8c830',      // Crocus yellow
lambWool: '#f0ece5',          // Baby sheep
birdhouseWood: '#a07040',     // Birdhouse
gardenSoil: '#5a4030',        // Garden bed soil
```

### Summer Colors

```typescript
parasolRed: '#e04040',        // Red parasol
parasolBlue: '#4080d0',       // Blue parasol
parasolYellow: '#e8c820',     // Yellow parasol
parasolStripe: '#ffffff',     // White stripes
beachTowelA: '#e05050',       // Towel color A
beachTowelB: '#4090d0',       // Towel color B
sandcastleWall: '#d8c090',    // Sand structure
surfboardBody: '#e0e0e0',     // Board color
surfboardStripe: '#e04040',   // Board design
iceCreamCart: '#f0e8d0',      // Cart body
iceCreamUmbrella: '#e04040',  // Cart umbrella
hammockFabric: '#d09050',     // Hammock cloth
sunflowerPetal: '#f0c820',    // Sunflower yellow
sunflowerCenter: '#5a3a20',   // Sunflower center
watermelonRind: '#40a040',    // Green rind
watermelonFlesh: '#e04040',   // Red flesh
watermelonSeed: '#2a2a2a',    // Black seeds
lemonadeStand: '#f0d880',     // Stand wood
sprinklerMetal: '#8090a0',    // Sprinkler
poolWater: '#60b8e0',         // Pool blue
poolEdge: '#c0c8d0',         // Pool border
```

### Autumn Colors

```typescript
mapleRed: '#c83020',          // Red maple
mapleCrimson: '#a02020',      // Deep crimson maple
mapleOrange: '#d07020',       // Orange maple
oakGold: '#c8a030',           // Golden oak
oakBrown: '#8a6030',          // Brown oak
birchYellow: '#d8c040',       // Yellow birch
ginkgoYellow: '#d8c830',      // Ginkgo yellow
fallenLeafRed: '#c04030',     // Red fallen leaf
fallenLeafOrange: '#d08030',  // Orange fallen leaf
fallenLeafGold: '#d0a030',    // Gold fallen leaf
fallenLeafBrown: '#8a5a30',   // Brown fallen leaf
acornBody: '#8a6030',         // Acorn nut
acornCap: '#5a3820',          // Acorn cap
cornStalk: '#c8a860',         // Dried corn
cornEar: '#d8c060',           // Corn ear
harvestApple: '#c83030',      // Red apple
harvestGrape: '#6030a0',      // Purple grape
hotDrinkMug: '#c8a060',       // Mug color
hotDrinkSteam: '#d0d8e0',     // Steam
wreathGreen: '#507038',       // Wreath base
wreathBerry: '#c03030',       // Wreath berries
```

---

## Seasonal Color Tinting System

The base palette (current) is treated as "summer". Other seasons tint the terrain block colors:

| Season | Effect on Terrain Blocks |
|--------|--------------------------|
| **Winter** | Desaturate 35%, blend 35% toward white (#eef2f8), reduce green channel 40% |
| **Spring** | Boost saturation 15%, slight green boost (+15%), pink warmth (+5 R) |
| **Summer** | No change (base palette) |
| **Autumn** | Warmth +20 (R up, B down), reduce green 30%, boost saturation 5% |
| **Transitions** | Lerp between neighboring season tints based on position within zone |

---

## Files Modified

| File | Changes |
|------|---------|
| `src/themes/terrain/seasons.ts` | **NEW** — Zone mapping (with hemisphere), tint system, blend interpolation, seasonal pool overrides |
| `src/themes/terrain/palette.ts` | `getSeasonalPalette100()` wrapper, tint helpers, ~80 new seasonal color entries |
| `src/themes/terrain/assets.ts` | 48 new seasonal SVG renderers (each with 3 variants = 144 visuals), seasonal pool override application, `renderSeasonalTerrainAssets()` |
| `src/themes/terrain/blocks.ts` | `renderSeasonalTerrainBlocks()`, frozen/seasonal water colors, snow-covered ground tint |
| `src/themes/terrain/effects.ts` | `renderSnowParticles()`, `renderFallingLeaves()`, `renderFallingPetals()` (spring), seasonal cloud tint |
| `src/themes/terrain/index.ts` | Per-week palette array, wire seasonal renderers and effects, hemisphere option |
| `src/index.ts` | Add `--hemisphere` CLI option |
| `action.yml` | Add `hemisphere` input |
| `src/action.ts` | Read hemisphere input |
| `src/core/types.ts` | Add `hemisphere` to `ThemeOptions` |
| `tests/themes/seasons.test.ts` | **NEW** — Zone mapping, hemisphere flip, blend, tint tests |

---

## Implementation Order

### Phase 1 — Foundation (seasons.ts + types)
1. Create `seasons.ts` with zone mapping, hemisphere support, tint system
2. Add `hemisphere` to `ThemeOptions` in `types.ts`
3. Add `--hemisphere` to CLI (`index.ts`), Action (`action.ts`, `action.yml`)
4. Write `tests/themes/seasons.test.ts`

### Phase 2 — Palette + Blocks (color infrastructure)
5. Add ~80 seasonal color entries to `palette.ts`
6. Implement `getSeasonalPalette100()` wrapper in `palette.ts`
7. Implement `renderSeasonalTerrainBlocks()` in `blocks.ts` with frozen water + snow ground

### Phase 3 — Assets (bulk SVG work)
8. Add 48 new types to `AssetType` union
9. Write 12 winter SVG renderers (snowPine, snowman, igloo, etc.)
10. Write 12 spring SVG renderers (cherryBlossom, tulip, lamb, etc.)
11. Write 12 summer SVG renderers (parasol, beachTowel, surfboard, etc.)
12. Write 12 autumn SVG renderers (autumnMaple, autumnOak, fallenLeaves, etc.)
13. Implement `getSeasonalPoolOverrides()` and wire into `selectAssets()`

### Phase 4 — Effects + Assembly
14. Add snow particles, falling petals, falling leaves to `effects.ts`
15. Wire everything through `index.ts` (per-week palette, seasonal renderers, effects)

### Phase 5 — Polish
16. Regenerate case studies, visual tuning
17. Full type check + test suite + build

## Verification

1. `npx tsc --noEmit` — type check after each phase
2. `npx vitest run` — all tests pass
3. `npx tsx scripts/generate-cases.ts` — regenerate visuals
4. Visual inspection across all 7 cases in both modes — verify 4 seasons clearly distinguishable
5. Test `--hemisphere south` produces flipped seasons (January = summer)
