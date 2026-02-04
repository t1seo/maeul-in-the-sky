# Asset Expansion Design — 2× Visual Variety + Randomization

## Goal

Double the asset count from 58 → ~118 distinct types, add ~108 variant skins across 32 existing types, and introduce per-year randomization so identical contributions produce different-looking worlds. Additionally: remove waterfalls, add more animated assets, and improve water tile rendering.

**Total distinct visuals: ~226** (up from 58).

---

## 1. New Asset Types (60 new)

### Water (9-22) — 8 new
| Type | Description |
|------|-------------|
| `kelp` | Underwater seaweed strands |
| `coral` | Branching coral formation |
| `jellyfish` | Translucent bell shape |
| `turtle` | Sea turtle swimming |
| `buoy` | Floating navigation marker |
| `sailboat` | Larger boat with two sails |
| `lighthouse` | Tall beacon on rock |
| `crab` | Small crustacean |

### Shore/Wetland (23-30) — 8 new
| Type | Description |
|------|-------------|
| `driftwood` | Curved log on shore |
| `sandcastle` | Tiny sand structure |
| `tidePools` | Small water pools with pebbles |
| `heron` | Tall wading bird |
| `shellfish` | Cluster of shells |
| `cattail` | Tall shore grass |
| `frog` | Small amphibian |
| `lily` | Water lily on shore |

### Grassland (31-42) — 8 new
| Type | Description |
|------|-------------|
| `rabbit` | Small animal, ears up |
| `fox` | Seated fox with bushy tail |
| `butterfly` | Wing pair with dots |
| `beehive` | Hanging from branch |
| `wildflowerPatch` | Cluster of mixed small flowers |
| `tallGrass` | Tufts of long grass |
| `birch` | White-bark tree |
| `haybale` | Rolled hay cylinder |

### Forest (43-65) — 8 new
| Type | Description |
|------|-------------|
| `owl` | Perched on branch, big eyes |
| `squirrel` | On tree trunk |
| `moss` | Ground cover cluster |
| `fern` | Frond cluster |
| `deadTree` | Bare branches |
| `log` | Fallen tree trunk |
| `berryBush` | Bush with red dots |
| `spider` | Web between branches |

### Farm (66-78) — 7 new
| Type | Description |
|------|-------------|
| `silo` | Tall cylindrical grain storage |
| `pigpen` | Pig in enclosure |
| `trough` | Animal water trough |
| `haystack` | Tall stacked hay |
| `orchard` | Fruit tree with dots |
| `beeFarm` | Stacked box hives |
| `pumpkin` | Orange gourd patch |

### Village (79-90) — 8 new
| Type | Description |
|------|-------------|
| `tavern` | Building with mug sign |
| `bakery` | Building with chimney |
| `stable` | Horse shelter |
| `garden` | Fenced flower plot |
| `laundry` | Clothesline between posts |
| `doghouse` | Small shelter with dog |
| `shrine` | Small roadside monument |
| `wagon` | Larger covered wagon |

### Town/City (91-99) — 8 new
| Type | Description |
|------|-------------|
| `cathedral` | Larger than church, rose window |
| `library` | Building with book sign |
| `clocktower` | Tower with clock face |
| `statue` | Figure on pedestal |
| `park` | Bench + tree + path combo |
| `warehouse` | Large rectangular building |
| `gatehouse` | Archway entrance |
| `manor` | Large house with garden wall |

### Cross-level Decorations — 5 new
| Type | Description |
|------|-------------|
| `signpost` | Directional sign on post |
| `lantern` | Hanging light |
| `woodpile` | Stacked logs |
| `puddle` | Small water reflection |
| `campfire` | Fire ring with flame |

---

## 2. SVG Variants (~108 skins across 32 types)

Each variant is selected by seeded RNG (variant 0, 1, or 2).

### Trees (6 types × 3 = 18 skins)
- **pine**: (0) tall/narrow, (1) short/bushy, (2) wind-bent
- **deciduous**: (0) round crown, (1) oval tall, (2) multi-branch spread
- **willow**: (0) classic droop, (1) short wide, (2) gnarled trunk
- **palm**: (0) straight, (1) curved, (2) pair
- **gardenTree**: (0) round, (1) cone topiary, (2) flowering pink
- **birch** (new): (0) single, (1) cluster of 3, (2) leaning

### Animals (8 types × 3 = 24 skins)
- **sheep**: (0) standing, (1) lying, (2) grazing
- **cow**: (0) left-facing, (1) right-facing, (2) grazing
- **deer**: (0) alert, (1) grazing, (2) walking
- **horse**: (0) standing, (1) walking, (2) rearing
- **chicken**: (0) pecking, (1) standing, (2) with chicks
- **rabbit** (new): (0) sitting, (1) hopping, (2) pair
- **fox** (new): (0) sitting, (1) curled, (2) trotting
- **bird**: (0) V-shape, (1) perched, (2) pair

### Buildings (6 types × 3 = 18 skins)
- **house**: (0) red roof, (1) blue roof, (2) green roof+garden
- **houseB**: (0) current, (1) wide/low, (2) with balcony
- **hut**: (0) square, (1) round, (2) with porch
- **market**: (0) current, (1) with cart, (2) open stall
- **inn**: (0) current, (1) with dormer, (2) outdoor seating
- **church**: (0) cross, (1) bell tower, (2) small chapel

### Water (4 types × 3 = 12 skins)
- **boat**: (0) rowboat, (1) sailboat, (2) fishing boat
- **fish**: (0) single, (1) pair, (2) striped large
- **whale**: (0) current, (1) diving, (2) baby
- **seagull**: (0) V-wings, (1) sitting, (2) pair

### Farm (4 types × 3 = 12 skins)
- **wheat**: (0) current, (1) ripe golden, (2) harvested stubble
- **fence**: (0) horizontal, (1) L-corner, (2) gate
- **barn**: (0) current, (1) large red, (2) small shed
- **scarecrow**: (0) current, (1) with crow, (2) tattered

### Decorations (5 types × 3 = 15 skins)
- **torch**: (0) wall-mount, (1) ground stake, (2) streetlamp
- **barrel**: (0) single, (1) stacked pair, (2) on side
- **flag**: (0) red, (1) blue pennant, (2) banner
- **cobblePath**: (0) scattered, (1) lined, (2) crossroads
- **rock**: (0) angular, (1) rounded, (2) flat/stacked

### Nature (4 types × 3 = 12 skins)
- **flower**: (0) red/pink, (1) yellow, (2) purple cluster
- **bush**: (0) round, (1) wide/flat, (2) flowering
- **mushroom**: (0) red cap, (1) brown cluster, (2) tall/thin
- **stump**: (0) current, (1) with mushrooms, (2) mossy

---

## 3. Randomization System

### Seed Architecture
```
baseSeed     = hash(username + mode)          // existing
biomeSeed    = baseSeed + 7919                // existing
assetSeed    = baseSeed                       // existing
variantSeed  = hash(username + String(year))  // NEW
```

- `variantSeed` controls: variant selection (0/1/2), micro-position jitter
- Changes per year → same graph looks consistent all year, new look each January
- Base terrain (colors, heights) stays determined by contribution level, not RNG

### Data Flow
```
PlacedAsset {
  cell, type, cx, cy, ox, oy,
  variant: number  // NEW: 0, 1, or 2
}
```

`selectAssets()` uses `variantSeed` to pick variant for each placed asset.

### Renderer Pattern
```ts
function svgPine(x: number, y: number, c: AssetColors, v: number): string {
  if (v === 1) return /* short/bushy */;
  if (v === 2) return /* wind-bent */;
  return /* classic tall */;
}
```

---

## 4. Remove Waterfalls

Delete `renderWaterfalls()` from `effects.ts` and all references in `index.ts`.

**What to remove:**
- `effects.ts`: Delete the entire `renderWaterfalls` function (~80 lines)
- `index.ts`: Remove import of `renderWaterfalls`, remove `waterfalls` variable and layer
- Update animation budget comment (frees ~4 SMIL slots)

**Reason:** The waterfall effect doesn't render well at the isometric scale. Removing it simplifies the rendering pipeline and frees animation budget for more impactful animations below.

---

## 5. More Animated Assets

Removing waterfalls frees ~4 SMIL slots. Current budget: ~42/50. After removal: ~38/50 → **12 slots available**.

### New Animations by Category

**Water zone — animated sea life:**
| Asset | Animation | Type | Slots |
|-------|-----------|------|-------|
| `jellyfish` | Gentle vertical bobbing | SMIL `animate cy` | 1 |
| `turtle` | Slow horizontal drift | SMIL `animateTransform translate` | 1 |
| `waves` | Enhanced: undulating path | SMIL `animate d` | 1 |

**Nature — subtle movement:**
| Asset | Animation | Type | Slots |
|-------|-----------|------|-------|
| `butterfly` | Fluttering wing + drift path | SMIL `animateTransform` | 1 |
| `tallGrass` | Gentle sway (wind) | CSS `@keyframes` | 0 (CSS) |
| `cattail` | Slight sway like tallGrass | CSS `@keyframes` | 0 (CSS) |
| `campfire` | Flickering flame opacity | SMIL `animate opacity` | 1 |

**Farm/Village — life:**
| Asset | Animation | Type | Slots |
|-------|-----------|------|-------|
| `laundry` | Clothesline sway in wind | CSS `@keyframes` | 0 (CSS) |
| `bakery` | Rising smoke from chimney | SMIL `animate cy+opacity` | 2 |

**Town — activity:**
| Asset | Animation | Type | Slots |
|-------|-----------|------|-------|
| `clocktower` | Pendulum swing or clock hand | SMIL `animateTransform rotate` | 1 |
| `flag` (enhanced) | More dynamic wave | Already exists (CSS) | 0 |

**Existing assets — upgrade to animated:**
| Asset | Animation | Type | Slots |
|-------|-----------|------|-------|
| `seagull` | Slow circular glide | SMIL `animateMotion` | 1 |
| `bird` | Slow drift across sky | SMIL `animateTransform translate` | 1 |

**Budget after additions:**
```
Existing (no waterfall):    ~38
New SMIL animations:        ~10
New CSS animations:          3 (free — no SMIL budget cost)
Total:                      ~48/50
```

### Animation Implementation Pattern
```ts
// SMIL-animated assets get animation inline in SVG
function svgJellyfish(x: number, y: number, c: AssetColors, v: number): string {
  return `<g transform="translate(${x},${y})">`
    + `<ellipse cx="0" cy="-2" rx="2" ry="1.5" fill="${c.jellyfish}" opacity="0.7">`
    + `<animate attributeName="cy" values="-2;-3;-2" dur="3s" repeatCount="indefinite"/>`
    + `</ellipse>`
    + /* tentacles... */
    + `</g>`;
}

// CSS-animated assets use class names
function svgTallGrass(x: number, y: number, c: AssetColors, v: number): string {
  return `<g transform="translate(${x},${y})" class="sway-gentle">`
    + /* grass blades... */
    + `</g>`;
}
```

CSS keyframes added to `renderTerrainCSS()`:
```css
@keyframes sway-gentle {
  0% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
  100% { transform: rotate(-2deg); }
}
@keyframes sway-slow {
  0% { transform: rotate(-1deg); }
  50% { transform: rotate(1deg); }
  100% { transform: rotate(-1deg); }
}
```

### Animation Budget Control
Add per-type animation budget tracking in `selectAssets()`:
```ts
const animBudget = {
  smil: { remaining: 10 },  // max new SMIL animations
  css: { remaining: 8 },    // max new CSS-animated assets
};
```
When budget is exhausted, animated assets fall back to their static variant (variant 0).

---

## 6. Water Tile Appearance Improvement

Current water tiles are a flat blue-tinted polygon with a single-color overlay. They need more visual depth.

### Changes

**6a. Multi-layer water surface on top face (blocks.ts):**

Replace the single flat top face polygon for water cells with a layered composition:

```
Layer 1: Base water color (darker blue, the blended block color)
Layer 2: Lighter inner diamond (slightly inset, lighter blue, 0.3 opacity)
Layer 3: Specular highlight (small bright ellipse, off-center, 0.15 opacity)
```

This creates a sense of depth — dark water base, lighter surface, bright reflection spot.

**6b. Enhanced water overlay with gradient feel (effects.ts):**

Replace the single-color diamond overlay with a two-tone approach:
- Outer edge of diamond: darker blue (river/pond edge)
- Inner area: lighter blue (water surface)

Implementation: two nested diamond polygons instead of one.

**6c. Improved ripple lines (effects.ts):**

Current ripples are 2 identical wavy paths per cell. Improve:
- 3 ripple lines per cell, varied curve amplitude
- Lines follow the isometric diamond orientation (not just horizontal)
- Staggered horizontal positions using seeded RNG
- Thinner strokes for subtlety (0.2-0.35px)

**6d. Water depth variation by level (blocks.ts):**

Water cells at different contribution levels should look slightly different:
- Level 9-14 (shallow): lighter blue, more transparent (oasis/lagoon feel)
- Level 15-22 (deep): darker blue, less transparent (ocean depth)
- River/pond cells at high levels: medium blue (flowing river)

Implementation: vary `blendWithWater` strength based on level.

```ts
function getWaterBlendStrength(level: number, isRiver: boolean): number {
  if (isRiver) return 0.40;  // consistent river look
  if (level <= 14) return 0.25;  // shallow: subtle blend
  return 0.45;  // deep: strong blend
}
```

**6e. Side face water tinting (blocks.ts):**

For water cells with height > 0 (elevated rivers/ponds), the side faces should also show a water gradient — darker at bottom, lighter near the top face — to suggest water depth on the cliff side.

---

## 7. Files Modified

| File | Changes |
|------|---------|
| `palette.ts` | ~30 new color entries in AssetColors (incl. jellyfish, coral, etc.) |
| `assets.ts` | 60 new types, 108 variant branches, variant field, updated pools, animated renderers |
| `effects.ts` | Delete `renderWaterfalls`, enhanced ripples, new CSS keyframes for sway animations |
| `blocks.ts` | Multi-layer water surface, depth-varied blending, side face water tint |
| `index.ts` | Remove waterfall wiring, pass year to variantSeed |

## 8. Implementation Order

| File | Changes |
|------|---------|
| `palette.ts` | ~30 new color entries in AssetColors |
| `assets.ts` | 60 new types, 108 variant branches, variant field, updated pools |
| `index.ts` | Pass year to variantSeed computation |

Phase 1 — **Cleanup & Water** (foundation):
1. Remove waterfalls (effects.ts, index.ts)
2. Improve water tile rendering (blocks.ts, effects.ts)

Phase 2 — **Infrastructure** (variant system):
3. Add variant field to PlacedAsset, update selectAssets() with variantSeed
4. Wire variantSeed through index.ts (uses data.year)
5. Add new color entries to palette.ts (~30 new)

Phase 3 — **New Assets** (bulk work):
6. Expand AssetType union with 60 new types
7. Update getLevelPool100() and blendWithBiome() with new types
8. Write ~60 new svgXxx() renderer functions
9. Add animated renderers (jellyfish, butterfly, campfire, etc.)
10. Add new CSS keyframes (sway-gentle, sway-slow) to effects.ts

Phase 4 — **Variants** (visual variety):
11. Add variant logic to 32 existing renderers
12. Test variant selection produces visual variety across case studies

Phase 5 — **Polish**:
13. Animation budget enforcement in selectAssets()
14. Visual tuning pass on all 7 case studies

## 9. Verification

1. `npx tsc --noEmit` — type check after each phase
2. `npx vitest run` — all tests pass
3. `npx tsx scripts/generate-cases.ts` — regenerate visuals
4. Visual inspection across all 7 case studies in both modes
5. Animation budget audit: confirm ≤ 50 SMIL animations in densest case (Maximum Density)
