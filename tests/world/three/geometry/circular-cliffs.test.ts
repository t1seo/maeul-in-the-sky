import { expect, test } from 'vitest';
import { buildWorld } from '../../../../src/world/model/index.js';
import { createCliffs } from '../../../../src/world/three/geometry/cliffs.js';
import { terrainPatches } from '../../../../src/world/three/geometry/terrain-grid.js';
import { inputFor } from '../../model/helpers.js';

test('gives the broad circle a substantial rocky underside above its waterfall ends', () => {
  const source = inputFor([['2024-02-29', 5]]);
  const scene = buildWorld({
    ...source,
    settings: { ...source.settings, layout: 'seasonal-circle' },
  });

  const cliffs = createCliffs(scene, terrainPatches(scene.terrain.tiles, 0)).build();

  expect(cliffs.boundingBox?.min.y).toBeLessThan(-5);
  expect(cliffs.boundingBox?.min.y).toBeGreaterThan(-9);
  const positions = cliffs.getAttribute('position');
  const deepRim = Array.from({ length: positions.count }, (_, index) => index).filter(
    (index) =>
      Math.hypot(positions.getX(index), positions.getZ(index)) > 30 && positions.getY(index) < -2.5,
  );
  expect(deepRim.length).toBeGreaterThan(100);
  expect(positions.count / 3).toBeLessThan(3000);
  cliffs.dispose();
});

test('preserves the existing underside depth for legacy landforms', () => {
  const scene = buildWorld(inputFor([['2024-02-29', 5]]));

  const cliffs = createCliffs(scene, terrainPatches(scene.terrain.tiles, 0)).build();

  expect(cliffs.boundingBox?.min.y).toBe(-2.5);
  cliffs.dispose();
});
