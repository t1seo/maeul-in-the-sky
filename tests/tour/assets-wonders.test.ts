import { describe, expect, it } from 'vitest';
import { EPIC_CATALOG } from '../../src/themes/terrain/epics/catalog.js';
import { createTourAsset } from '../../src/tour/assets/index.js';

describe('recognisable tour Wonders', () => {
  it('keeps thirty distinct silhouettes when names and material colors are removed', () => {
    // Given the complete Wonder catalog.
    // When geometry-only recipes are compared.
    const shapes = EPIC_CATALOG.map(({ id }) =>
      JSON.stringify(
        createTourAsset(id, 0, 'summer').recipe.parts.map(
          ({ primitive, position, rotation, size }) => ({ primitive, position, rotation, size }),
        ),
      ),
    );
    // Then no landmark is replaced by a generic pagoda or monument.
    expect(new Set(shapes).size).toBe(30);
  });

  it('keeps minarets around the dome when the Taj Mahal is built', () => {
    const { parts } = createTourAsset('tajMahal', 0, 'summer').recipe;
    expect(
      parts.filter(
        (part) =>
          part.primitive === 'cylinder' &&
          Math.abs(part.position.x) > 0.3 &&
          Math.abs(part.position.z) > 0.3,
      ).length,
    ).toBeGreaterThanOrEqual(4);
    expect(parts.some((part) => part.primitive === 'sphere' && part.position.y > 0.5)).toBe(true);
  });

  it('keeps a clear gate centre when the torii is viewed at ground level', () => {
    const asset = createTourAsset('torii', 0, 'spring');
    expect(asset.collider).toBeNull();
    expect(
      asset.recipe.parts.filter(
        (part) => part.primitive === 'cylinder' && Math.abs(part.position.x) > 0.2,
      ).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it('changes seasonal foliage when the same tree enters autumn', () => {
    const summer = createTourAsset('ancientOak', 0, 'summer').recipe;
    const autumn = createTourAsset('ancientOak', 0, 'autumn').recipe;
    expect(autumn.parts.map((part) => part.color)).not.toEqual(
      summer.parts.map((part) => part.color),
    );
  });
});
