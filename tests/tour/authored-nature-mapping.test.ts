import { describe, expect, it } from 'vitest';
import { createTourAsset } from '../../src/tour/assets/catalog.js';
import { natureAsset } from '../../src/tour/authored/nature.js';
import type { TourPlacement } from '../../src/tour/types.js';
import type { WorldSeason } from '../../src/world/model/geometry-types.js';
import { TOUR_COLORS as C } from '../../src/tour/assets/palette.js';

function placement(catalogId: string, variant = 0, season: WorldSeason = 'summer'): TourPlacement {
  return {
    source: {
      id: `day:${catalogId}`,
      catalogId,
      anchorDate: '2026-06-18',
      week: 18,
      day: 4,
      cx: 0,
      cy: 0,
      footprint: { x: 0, y: 0, width: 1, height: 1 },
      drawOrder: 18,
      variant,
      animated: false,
    },
    position: { x: 72, y: 0, z: 16 },
    season,
    kind: 'asset',
  };
}

const MATCHING = [
  'pine',
  'deciduous',
  'gardenTree',
  'ancientOak',
  'deadTree',
  'bareBush',
  'snowPine',
  'snowDeciduous',
  'christmasTree',
  'autumnMaple',
  'autumnOak',
  'cedarGrove',
  'cherryBlossom',
  'cherryBlossomSmall',
  'cherryBlossomFull',
  'cherryBlossomBranch',
  'peachBlossom',
  'appleTree',
  'oliveTree',
  'lemonTree',
  'orangeTree',
  'pearTree',
  'peachTree',
  'orchard',
  'berryBush',
  'bush',
  'seedling',
  'fern',
  'tallGrass',
  'sprout',
  'flower',
  'wildflowerPatch',
  'wildflowerMeadow',
  'flowerBed',
  'park',
  'mushroom',
  'rock',
  'boulder',
  'alpineRocks',
  'snowCoveredRock',
  'cobblePath',
  'tidePools',
  'lotusPond',
  'willowPond',
  'frozenPond',
  'worldTree',
  'sakuraEternal',
  'aurora',
  'hotSpring',
  'geyser',
  'bioluminescentPool',
] as const;

describe('authored nature semantic mapping', () => {
  it.each(MATCHING)('replaces matching %s with grounded authored components', (id) => {
    // Given a dated placement and its established procedural asset.
    const source = placement(id, 2);
    const fallback = createTourAsset(id, 2, 'summer');
    const before = JSON.stringify({ source, fallback });
    // When the authored nature layer resolves that source identity.
    const result = natureAsset(source, fallback);
    // Then it uses local named models without moving or mutating the source asset.
    expect(result?.parts.length).toBeGreaterThan(0);
    expect(result?.parts.every((part) => part.file.startsWith('nature/'))).toBe(true);
    expect(result?.parts.every((part) => part.height > 0 && part.maxSpan > 0)).toBe(true);
    expect(result?.collider ?? fallback.collider).toEqual(fallback.collider);
    expect(JSON.stringify({ source, fallback })).toBe(before);
  });

  it.each([
    'birch',
    'autumnBirch',
    'autumnGinkgo',
    'kelp',
    'ricePaddy',
    'riceTerrace',
    'sunflower',
    'tulip',
    'crocus',
    'coral',
    'hanok',
    'squirrel',
  ])('retains distinct %s when no matching model exists', (id) => {
    // Given a species or composite not represented by this source collection.
    const source = placement(id);
    // When nature replacements are requested.
    const result = natureAsset(source, createTourAsset(id, 0, 'summer'));
    // Then a generic tree or flower cannot erase its semantic identity.
    expect(result).toBeNull();
  });

  it.each(['snowPine', 'snowDeciduous', 'christmasTree'])(
    'honors %s snow independently of cell season',
    (id) => {
      // Given a snow reward in an imported summer scene.
      const source = placement(id, 0, 'summer');
      // When its plant model is selected.
      const result = natureAsset(source, createTourAsset(id, 0, 'summer'));
      // Then only foliage receives the snow season and bark remains independently shaded.
      expect(result?.parts[0].season).toBe('winter');
      expect(result?.parts[0].foliageMaterials?.every((name) => !name.startsWith('Bark'))).toBe(
        true,
      );
    },
  );

  it.each(['cherryBlossom', 'cherryBlossomSmall', 'peachBlossom', 'sakuraEternal'])(
    'keeps %s pink rather than tinting its trunk',
    (id) => {
      // Given a flower-bearing tree, even during an autumn lighting preview.
      const source = placement(id, 0, 'autumn');
      // When the authored model's material policy is resolved.
      const result = natureAsset(source, createTourAsset(id, 0, 'autumn'));
      // Then its explicit blossom color affects named leaf surfaces only.
      expect(result?.parts[0].foliageColor).toMatch(/^#[a-f\d]{6}$/i);
      expect(result?.parts[0].foliageMaterials).toEqual(
        expect.arrayContaining([expect.stringMatching(/^Leaves_/)]),
      );
      expect(result?.parts[0].foliageMaterials?.some((name) => name.includes('Bark'))).toBe(false);
    },
  );

  it.each(['appleTree', 'orchard', 'berryBush'])(
    'preserves fruit identity and count in %s composites',
    (id) => {
      // Given the original independently modeled fruit spheres.
      const source = placement(id, 1);
      const fallback = createTourAsset(id, 1, 'summer');
      const fruit = fallback.recipe.parts.filter(
        (part) => part.primitive === 'sphere' && (part.color === C.red || part.color === C.gold),
      );
      // When the tree/bush body is replaced.
      const result = natureAsset(source, fallback);
      // Then fruit keeps its count and color with no duplicated primitive canopy.
      expect(fruit.length).toBeGreaterThan(0);
      expect(
        result?.retainedParts
          .filter((part) => part.primitive === 'sphere')
          .map((part) => part.color),
      ).toEqual(fruit.map((part) => part.color));
      expect(result?.retainedParts.length).toBeLessThan(fallback.recipe.parts.length);
    },
  );

  it.each(['tidePools', 'lotusPond', 'willowPond', 'hotSpring', 'geyser', 'bioluminescentPool'])(
    'preserves water while upgrading %s stones',
    (id) => {
      // Given an original water-bearing composite.
      const source = placement(id);
      const fallback = createTourAsset(id, 0, 'summer');
      const water = fallback.recipe.parts.filter((part) =>
        [C.water, C.waterLight, C.jade].some((color) => color === part.color),
      );
      // When only matching rocky components are upgraded.
      const result = natureAsset(source, fallback);
      // Then all water and unrelated plants remain procedural at their original transform.
      expect(water.length).toBeGreaterThan(0);
      expect(result?.retainedParts).toEqual(expect.arrayContaining(water));
      expect(result?.parts.some((part) => part.node?.startsWith('Rock_') && !part.wind)).toBe(true);
    },
  );

  it('keeps grove and meadow groups distinct from their single-plant counterparts', () => {
    // Given a four-tree grove and a meadow reward.
    const grove = placement('cedarGrove', 2);
    const meadow = placement('wildflowerMeadow', 2);
    // When each group is resolved.
    const result = [grove, meadow].map((item) =>
      natureAsset(item, createTourAsset(item.source.catalogId, 2, 'summer')),
    );
    // Then the composition contains separate, offset authored plants.
    expect(result[0]?.parts).toHaveLength(4);
    expect(result[1]?.parts.length).toBeGreaterThan(4);
    expect(new Set(result[0]?.parts.map((part) => JSON.stringify(part.offset))).size).toBe(4);
  });
});
