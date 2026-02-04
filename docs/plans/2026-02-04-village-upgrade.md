# Village Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand terrain from 10 to 100 levels with 38 asset types, redesigned clouds, and polished SVG micro-illustrations that form a living civilization.

**Architecture:** Anchor-based color/height interpolation replaces discrete arrays. Each level 0-99 gets smooth-interpolated colors and heights from ~12 anchor points. Asset pools map level ranges to biome-appropriate decorations with neighbor richness bonuses.

**Tech Stack:** TypeScript, pure inline SVG, SMIL animate, CSS @keyframes. No JS, no external resources.

---

### Task 1: Add Level100 system to shared.ts

**Files:**
- Modify: `src/themes/shared.ts`

**Step 1: Write failing test**

```typescript
// tests/themes/shared.test.ts
import { describe, it, expect } from 'vitest';
import { computeLevel100, enrichGridCells100 } from '../../src/themes/shared.js';

describe('computeLevel100', () => {
  it('returns 0 for zero contributions', () => {
    expect(computeLevel100(0, 20)).toBe(0);
  });

  it('returns 1 for minimal contribution', () => {
    expect(computeLevel100(1, 100)).toBeGreaterThanOrEqual(1);
    expect(computeLevel100(1, 100)).toBeLessThan(10);
  });

  it('returns 99 for max contributions', () => {
    expect(computeLevel100(100, 100)).toBe(99);
  });

  it('spreads low values across more levels (log curve)', () => {
    const low = computeLevel100(5, 100);
    const mid = computeLevel100(50, 100);
    const high = computeLevel100(95, 100);
    expect(low).toBeGreaterThan(0);
    expect(mid).toBeGreaterThan(low);
    expect(high).toBeGreaterThan(mid);
    // Log curve: low values get more spread
    expect(low).toBeGreaterThan(15);
  });

  it('handles maxCount of 1', () => {
    expect(computeLevel100(1, 1)).toBe(99);
  });
});
```

**Step 2:** Run: `npx vitest run tests/themes/shared.test.ts` → Expected: FAIL

**Step 3: Implement**

Add to `src/themes/shared.ts`:

```typescript
export type Level100 = number;

export interface GridCell100 extends GridCell {
  level100: Level100;
}

export function computeLevel100(count: number, maxCount: number): Level100 {
  if (count === 0) return 0;
  if (maxCount <= 0) return 1;
  const ratio = clamp(count / maxCount, 0, 1);
  const curved = Math.log(1 + ratio * 99) / Math.log(100);
  return clamp(Math.round(curved * 98) + 1, 1, 99) as Level100;
}

export function enrichGridCells100(
  cells: GridCell[],
  data: ContributionData,
): GridCell100[] {
  let maxCount = 0;
  for (const week of data.weeks) {
    for (const day of week.days) {
      if (day.count > maxCount) maxCount = day.count;
    }
  }
  return cells.map(cell => ({
    ...cell,
    level100: computeLevel100(cell.count, maxCount),
  }));
}
```

**Step 4:** Run: `npx vitest run tests/themes/shared.test.ts` → Expected: PASS

**Step 5:** Commit: `git add src/themes/shared.ts tests/themes/shared.test.ts && git commit -m "feat: add Level100 system with log-curve distribution"`

---

### Task 2: Redesign palette.ts with anchor interpolation

**Files:**
- Modify: `src/themes/terrain/palette.ts`

**Step 1: Write failing test**

```typescript
// tests/themes/palette.test.ts
import { describe, it, expect } from 'vitest';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';

describe('TerrainPalette100', () => {
  const dark = getTerrainPalette100('dark');
  const light = getTerrainPalette100('light');

  it('returns flat height for ocean levels', () => {
    expect(dark.getHeight(0)).toBe(0);
    expect(dark.getHeight(5)).toBe(0);
  });

  it('returns increasing heights for land levels', () => {
    const h20 = dark.getHeight(20);
    const h50 = dark.getHeight(50);
    const h90 = dark.getHeight(90);
    expect(h20).toBeGreaterThan(0);
    expect(h50).toBeGreaterThan(h20);
    expect(h90).toBeGreaterThan(h50);
  });

  it('interpolates colors smoothly', () => {
    const e0 = dark.getElevation(0);
    const e50 = dark.getElevation(50);
    const e99 = dark.getElevation(99);
    expect(e0.top).not.toBe(e50.top);
    expect(e50.top).not.toBe(e99.top);
  });

  it('cloud has fill and stroke for visibility', () => {
    expect(dark.cloud.fill).toBeTruthy();
    expect(dark.cloud.stroke).toBeTruthy();
    expect(light.cloud.fill).toBeTruthy();
    expect(light.cloud.opacity).toBeGreaterThan(0.3);
  });

  it('has expanded asset colors', () => {
    expect(dark.assets.deer).toBeTruthy();
    expect(dark.assets.castle).toBeTruthy();
    expect(dark.assets.flower).toBeTruthy();
    expect(dark.assets.seagull).toBeTruthy();
  });
});
```

**Step 2:** Run test → FAIL

**Step 3: Implement** — Full palette.ts rewrite with:
- `ColorAnchor[]` and `HeightAnchor[]` arrays (12 anchors each)
- `interpolateAnchors()` and `interpolateHeight()` functions using `lerp`
- `TerrainPalette100` interface with `getElevation(level)` and `getHeight(level)` methods
- `cloud: { fill, stroke, opacity }` replacing single string
- Expanded `AssetColors` with 25+ new fields (deer, horse, flower, mushroom, rock, tent, castle, tower, market, etc.)
- Both dark and light mode anchor definitions

**Step 4:** Run test → PASS

**Step 5:** Commit: `git add src/themes/terrain/palette.ts tests/themes/palette.test.ts && git commit -m "feat: anchor-based 100-level color interpolation palette"`

---

### Task 3: Update blocks.ts for Level100

**Files:**
- Modify: `src/themes/terrain/blocks.ts`

**Step 1:** Update `IsoCell` to carry `level100` and pre-computed `colors: ElevationColors`

**Step 2:** Update `toIsoCells()` to accept `GridCell100[]` and `TerrainPalette100`, call `palette.getHeight(cell.level100)` and `palette.getElevation(cell.level100)`

**Step 3:** Update `renderBlock()` to use `cell.colors` directly

**Step 4:** Run: `npx tsc --noEmit` → PASS

**Step 5:** Commit: `git add src/themes/terrain/blocks.ts && git commit -m "feat: update isometric blocks for 100-level system"`

---

### Task 4: Redesign clouds in effects.ts

**Files:**
- Modify: `src/themes/terrain/effects.ts`

**Step 1:** Rewrite `renderClouds()`:
- 4 composite clouds, each 3-5 overlapping ellipses
- Y-squashed ×0.5 for isometric perspective
- Thin `stroke` for edge visibility in light mode
- SMIL `<animateTransform type="translate">` for drift (4 animated elements)

**Step 2:** Update `renderTerrainCSS()` and `renderAnimatedOverlays()` to use `level100` ranges:
- Water: `level100 <= 5`
- Town sparkle: `level100 >= 90`

**Step 3:** Add CSS keyframes for windmill rotation and flag wave

**Step 4:** Run example generation → verify clouds visible in both modes

**Step 5:** Commit: `git add src/themes/terrain/effects.ts && git commit -m "feat: composite multi-circle clouds + level100 effects"`

---

### Task 5: Implement all 38 asset types

**Files:**
- Modify: `src/themes/terrain/assets.ts`

This is the largest task. Asset redesign principles:
- **Silhouette-first**: recognizable as solid black fill
- **Color as identifier**: brown=cow, white=sheep, yellow=chicken, red comb=chicken
- **One distinguishing detail**: antlers=deer, horizontal tail=whale, vertical tail=fish
- **Scale**: 3-12px wide, 4-15px tall

**Step 1:** Expand `AssetType` to 38 types

**Step 2:** Implement SVG renderers for 20 new assets:
- Water: `fishSchool`, `seagull`, `dock`, `waves` (redesign `whale` and `fish`)
- Nature: `flower`, `mushroom`, `rock`, `boulder`, `stump`, `willow`, `palm`
- Animals: `deer`, `horse`, `bird`, `scarecrow`
- Buildings: `tent`, `hut`, `market`, `inn`, `blacksmith`, `castle`, `tower`, `bridge`
- Decorations: `cart`, `barrel`, `torch`, `cobblePath`, `smoke`

**Step 3:** Redesign existing assets:
- `whale`: rounder body, HORIZONTAL tail fluke, water spout (3 diverging lines)
- `fish`: slender body, VERTICAL tail fin
- `sheep`: rounder fluffy body (circle, not ellipse)
- `cow`: distinctive spots, proper head shape
- `chicken`: red comb pixel (key identifier)
- `house`/`church`/`windmill`: improved 3-face isometric shading

**Step 4:** Replace `getLevelPool()` with `getLevelPool100()` — 20 level ranges mapping to biome-appropriate asset pools

**Step 5:** Update `computeRichness()` to use `level100` (divide by 99 instead of 9)

**Step 6:** Update `selectAssets()` to use `getLevelPool100()`, handle animated smoke with budget cap

**Step 7:** Commit: `git add src/themes/terrain/assets.ts && git commit -m "feat: 38 asset types with silhouette-first micro SVG design"`

---

### Task 6: Wire everything in index.ts

**Files:**
- Modify: `src/themes/terrain/index.ts`

**Step 1:** Update imports:
- `enrichGridCells100` from shared
- `getTerrainPalette100` from palette

**Step 2:** Update `renderMode()`:
- Use `enrichGridCells100()` instead of `enrichGridCells()`
- Use `getTerrainPalette100()` instead of `getTerrainPalette()`
- Sample 5 anchor levels for ThemePalette bridge: `[0, 20, 45, 70, 95]`

**Step 3:** Run: `npx tsc --noEmit` → PASS

**Step 4:** Commit: `git add src/themes/terrain/index.ts && git commit -m "feat: wire 100-level system into terrain renderer"`

---

### Task 7: Generate examples and visual verification

**Step 1:** Run: `npx tsx scripts/generate-examples.ts`

**Step 2:** Open `preview.html` — verify:
- Clouds visible in both dark and light modes
- Ocean tiles (level 0) show fish, whales, boats
- Land tiles show progressive civilization
- Sparse data looks like beautiful archipelago
- Dense data looks like thriving civilization
- No visual artifacts or overflow

**Step 3:** Test with sparse mock data (simulate year start):
- Modify `generate-examples.ts` temporarily to generate data where first 40 weeks have few contributions
- Verify the sparse region looks attractive (ocean with scattered islands)

**Step 4:** Run: `npx vitest run` — all tests pass

**Step 5:** Final commit: `git add -A && git commit -m "feat: visual polish and example generation"`

---

### Animation Budget Ledger

| Effect | Type | Max Count | Budget |
|--------|------|-----------|--------|
| Clouds | SMIL animateTransform | 4 | 4 |
| Water shimmer | CSS @keyframes | 15 | 15 |
| Town sparkle | CSS @keyframes | 10 | 10 |
| Chimney smoke | SMIL animate | 5 | 5 |
| Windmill rotation | SMIL animateTransform | 4 | 4 |
| Flag wave | CSS @keyframes | 4 | 4 |
| **Total** | | | **42/50** |

---

### Asset Type Reference (38 total)

| Category | Assets | Levels |
|----------|--------|--------|
| Water | whale, fish, fishSchool, boat, seagull, dock, waves | 0-5 |
| Shore | rock, boulder, flower, bush | 6-15 |
| Grassland | pine, deciduous, mushroom, stump, deer | 16-30 |
| Forest | willow, palm, bird | 31-60 |
| Farm | wheat, fence, scarecrow, barn, sheep, cow, chicken, horse | 61-80 |
| Village | tent, hut, house, houseB, church, windmill, well | 81-90 |
| Town | market, inn, blacksmith, castle, tower, bridge | 91-99 |
| Decorations | cart, barrel, torch, flag, cobblePath, smoke | cross-level |
