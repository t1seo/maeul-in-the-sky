import { describe, expect, it } from 'vitest';
import { InstancedMesh, Matrix4, Vector3 } from 'three';
import { TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { defaultWorldView } from '../../../src/world/model/index.js';
import { createSeasonalLife } from '../../../src/world/three/seasonal-life.js';
import { disposeObjectTree } from '../../../src/world/three/resources.js';

function batch(life: ReturnType<typeof createSeasonalLife>, name: string) {
  const found = life.group.getObjectByName(name);
  if (!(found instanceof InstancedMesh)) throw new TypeError(`Expected ${name} instances`);
  return found;
}

describe('localized seasonal life', () => {
  it.each(['spring', 'summer', 'autumn', 'winter'] as const)(
    'uses seasonal petals, leaves and butterflies for %s',
    (seasonOverride) => {
      const life = createSeasonalLife(TINY_WORLD_SCENE);
      life.update({ ...defaultWorldView(TINY_WORLD_SCENE), seasonOverride, weather: 'clear' }, 4);
      expect(batch(life, 'seasonal-petals').count > 0).toBe(
        seasonOverride === 'spring' || seasonOverride === 'autumn',
      );
      expect(batch(life, 'butterfly-wings').count > 0).toBe(
        seasonOverride === 'spring' || seasonOverride === 'summer',
      );
      disposeObjectTree(life.group);
    },
  );

  it('moves real wings and falling petals deterministically while preserving a paused pose', () => {
    const life = createSeasonalLife(TINY_WORLD_SCENE);
    const view = {
      ...defaultWorldView(TINY_WORLD_SCENE),
      seasonOverride: 'spring',
      weather: 'clear',
    } as const;
    life.update(view, 2);
    const wings = batch(life, 'butterfly-wings');
    const before = wings.instanceMatrix.array.slice();
    life.update(view, 2);
    expect(wings.instanceMatrix.array).toEqual(before);
    life.update(view, 2.25);
    expect(wings.instanceMatrix.array).not.toEqual(before);
    const matrix = new Matrix4();
    wings.getMatrixAt(0, matrix);
    const position = new Vector3().setFromMatrixPosition(matrix);
    expect(Math.abs(position.x)).toBeLessThan(6);
    expect(position.y).toBeGreaterThan(0.4);
    disposeObjectTree(life.group);
  });

  it('reduces counts on mobile quality and shelters butterflies during manual precipitation', () => {
    const life = createSeasonalLife(TINY_WORLD_SCENE);
    const view = {
      ...defaultWorldView(TINY_WORLD_SCENE),
      seasonOverride: 'spring',
      weather: 'clear',
    } as const;
    life.update(view, 0);
    const high = batch(life, 'butterfly-wings').count;
    life.update({ ...view, quality: 'low' }, 0);
    expect(batch(life, 'butterfly-wings').count).toBeLessThan(high);
    expect(batch(life, 'seasonal-petals').count).toBeLessThan(40);
    life.update({ ...view, weather: 'rain' }, 0);
    expect(batch(life, 'butterfly-wings').visible).toBe(false);
    disposeObjectTree(life.group);
  });
});
