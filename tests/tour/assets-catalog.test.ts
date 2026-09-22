import { describe, expect, it, vi } from 'vitest';
import { ASSET_CATALOG } from '../../src/themes/terrain/assets/catalog.js';
import { EPIC_CATALOG } from '../../src/themes/terrain/epics/catalog.js';
import { createTourAsset, TourAssetError } from '../../src/tour/assets/index.js';
import { NATURE_DEFINITIONS } from '../../src/tour/assets/definitions-nature.js';

const CATALOG = [...ASSET_CATALOG, ...EPIC_CATALOG];

describe('complete tour catalog', () => {
  it.each(CATALOG)('$id produces bounded finite geometry when requested', ({ id }) => {
    // Given one of the 240 source catalog IDs.
    // When it becomes a tour asset.
    const asset = createTourAsset(id, 0, 'spring');
    // Then every opaque primitive is renderable and the model is a real miniature.
    expect(asset.recipe.parts.length).toBeGreaterThan(0);
    expect(asset.recipe.parts.length).toBeLessThanOrEqual(220);
    expect(asset.scale).toBeGreaterThan(0);
    for (const part of asset.recipe.parts) {
      expect(
        [part.position, part.rotation, part.size].flatMap(Object.values).every(Number.isFinite),
      ).toBe(true);
      expect(Object.values(part.size).every((value) => value > 0)).toBe(true);
      expect(part.color).toMatch(/^#[\da-f]{6}$/i);
      expect(part.opacity).toBe(1);
    }
  });

  it('preserves original variant identity when a recipe family repeats', () => {
    // Given two source variants that share a three-way base family.
    // When both tour identities are created.
    const keys = [0, 3, 99, Number.MAX_SAFE_INTEGER].map(
      (variant) => createTourAsset('hanok', variant, 'summer').recipe.key,
    );
    // Then instancing cannot collapse distinct source identities.
    expect(new Set(keys).size).toBe(4);
  });

  it.each(['constructor', '__proto__', '', 'hanokAlmost'])(
    'rejects unknown catalog %j with a typed error',
    (id) => {
      expect(() => createTourAsset(id, 0, 'summer')).toThrow(TourAssetError);
    },
  );

  it.each([NaN, Infinity, -1, 0.5, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid variant %j with a typed error',
    (variant) => {
      expect(() => createTourAsset('hanok', variant, 'summer')).toThrow(TourAssetError);
    },
  );

  it('rejects an accidentally empty recipe instead of making an invisible object', () => {
    const build = vi.spyOn(NATURE_DEFINITIONS.pine, 'build').mockReturnValue([]);
    try {
      expect(() => createTourAsset('pine', 0, 'summer')).toThrow(
        new TourAssetError('empty-recipe', 'pine', 0),
      );
    } finally {
      build.mockRestore();
    }
  });

  it('uses a walkable trunk footprint when a broadleaf canopy is wide', () => {
    const asset = createTourAsset('ancientOak', 0, 'summer');
    expect(asset.collider?.halfX).toBeGreaterThan(0.15);
    expect(asset.collider?.halfX).toBeLessThan(0.8);
  });

  it('uses building metres when a life-size hanok is placed', () => {
    const asset = createTourAsset('hanok', 0, 'summer');
    expect(asset.scale).toBeGreaterThanOrEqual(3.2);
    expect(asset.collider?.halfX).toBeGreaterThan(0.9);
    expect(asset.collider?.halfX).toBeLessThan(1.5);
  });
});
