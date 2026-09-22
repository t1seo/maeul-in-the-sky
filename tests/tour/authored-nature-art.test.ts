import { describe, expect, it } from 'vitest';
import { createTourAsset } from '../../src/tour/assets/catalog.js';
import { TOUR_COLORS as C } from '../../src/tour/assets/palette.js';
import { natureAsset } from '../../src/tour/authored/nature.js';
import type { TourPlacement } from '../../src/tour/types.js';
import type { WorldSeason } from '../../src/world/model/geometry-types.js';

function mapped(catalogId: string, variant = 0, season: WorldSeason = 'summer') {
  const placement: TourPlacement = {
    source: {
      id: `art:${catalogId}`,
      catalogId,
      variant,
      anchorDate: '2026-06-18',
      week: 18,
      day: 4,
      cx: 0,
      cy: 0,
      footprint: { x: 0, y: 0, width: 1, height: 1 },
      drawOrder: 18,
      animated: false,
    },
    position: { x: 72, y: 0, z: 16 },
    season,
    kind: 'asset',
  };
  const fallback = createTourAsset(catalogId, variant, season);
  return { fallback, result: natureAsset(placement, fallback) };
}

describe('nature close-up art regressions', () => {
  it.each(['rock', 'boulder', 'alpineRocks', 'snowCoveredRock'])(
    'removes floating old moss from %s',
    (id) => {
      // Given every old boulder, ridge and arch composition.
      for (const variant of [0, 1, 2]) {
        // When irregular textured stones replace their primitive surfaces.
        const { result } = mapped(id, variant);
        // Then only real snow may remain attached; old moss discs and strata cannot hover.
        expect(result?.retainedParts.every((part) => part.color === C.snow)).toBe(true);
      }
    },
  );

  it.each(['bush', 'berryBush', 'ancientOak', 'worldTree', 'tallGrass', 'palm'])(
    'keeps %s summer foliage green with a nonblack AO floor',
    (id) => {
      // Given source foliage with red, mint or black colors that clash with the summer forest.
      const summer = mapped(id).result;
      // When displayed as summer vegetation under physical lighting.
      const autumn = mapped(id, 0, 'autumn').result;
      // Then summer receives the leaf-only tint shader while autumn retains its seasonal policy.
      expect(summer?.parts[0].foliageColor).toMatch(/^#[a-f\d]{6}$/i);
      expect(summer?.parts[0].foliageMaterials?.every((name) => !name.startsWith('Bark'))).toBe(
        true,
      );
      expect(autumn?.parts[0].foliageColor).toBeUndefined();
      if (id === 'palm') {
        expect(summer?.parts[0].foliageMaterials).toEqual(['leafsGreen']);
        expect(summer?.parts[0].foliageColor).toBe('#648a3a');
      }
    },
  );

  it.each(['appleTree', 'berryBush'])('fits %s fruit inside its replacement canopy', (id) => {
    // Given fruit distributed over the old rounded primitive canopy.
    const { fallback, result } = mapped(id);
    const original = fallback.recipe.parts.filter(
      (part) => part.primitive === 'sphere' && (part.color === C.red || part.color === C.gold),
    );
    // When attached to a narrower external tree or shrub.
    const fruit = result?.retainedParts ?? [];
    // Then each fruit keeps its identity but moves inward and becomes appropriately smaller.
    expect(fruit).toHaveLength(original.length);
    for (const [index, item] of fruit.entries()) {
      expect(item.color).toBe(original[index].color);
      expect(Math.hypot(item.position.x, item.position.z)).toBeLessThan(
        Math.hypot(original[index].position.x, original[index].position.z),
      );
      expect(item.size.x).toBeLessThan(original[index].size.x);
    }
  });

  it('keeps the orchard crate fruit at ground level when canopy fruit is fitted', () => {
    // Given an orchard containing tree fruit and three apples in a crate.
    const { fallback, result } = mapped('orchard', 2);
    const crate = fallback.recipe.parts.filter((part) => part.position.z === 0.32);
    // When the separate tree canopies receive attached fruit.
    const attached = result?.retainedParts ?? [];
    // Then the complete crate composition remains untouched.
    expect(attached).toEqual(expect.arrayContaining(crate));
    expect(attached.filter((part) => part.primitive === 'sphere')).toHaveLength(19);
  });
});
