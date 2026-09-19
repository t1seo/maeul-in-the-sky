import { describe, expect, it } from 'vitest';
import { TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { parseWorldScene } from '../../../src/world/model/parse.js';

describe('frozen world boundary', () => {
  it('restores a frozen JSON scene without rerunning generation', () => {
    const value: unknown = JSON.parse(JSON.stringify(TINY_WORLD_SCENE));
    const scene = parseWorldScene(value);
    expect(scene).toEqual(TINY_WORLD_SCENE);
    expect(scene).not.toBe(value);
  });

  it.each([
    { schemaVersion: 2 },
    { generatorVersion: 2 },
    { modelVersion: 2 },
    { days: [{ kind: 'observed', date: '2024-02-30', count: 1 }] },
    { bounds: { min: { x: NaN, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } } },
    { settings: { ...TINY_WORLD_SCENE.settings, heightScale: { kind: 'fixed', maxCount: 10 } } },
    { unexpectedScript: '<script>invalid</script>' },
    { sourceDigest: 'x'.repeat(10000) },
  ])('rejects unsupported or malformed scene fields: %j', (patch) => {
    const value = { ...TINY_WORLD_SCENE, ...patch };
    expect(() => parseWorldScene(value)).toThrow();
  });

  it.each(['islandId', 'regionId', 'modelKey', 'parentId'] as const)(
    'rejects a dangling entity %s reference',
    (field) => {
      const entity = TINY_WORLD_SCENE.entities[0];
      const value = {
        ...TINY_WORLD_SCENE,
        entities: [{ ...entity, [field]: 'missing:reference' }],
      };
      expect(() => parseWorldScene(value)).toThrow();
    },
  );

  it('rejects duplicate identities and tile ownership', () => {
    const value = {
      ...TINY_WORLD_SCENE,
      entities: [...TINY_WORLD_SCENE.entities, ...TINY_WORLD_SCENE.entities],
    };
    expect(() => parseWorldScene(value)).toThrow();
    expect(() =>
      parseWorldScene({
        ...TINY_WORLD_SCENE,
        regions: [...TINY_WORLD_SCENE.regions, ...TINY_WORLD_SCENE.regions],
      }),
    ).toThrow();
  });

  it('rejects a parent cycle', () => {
    const entity = TINY_WORLD_SCENE.entities[0];
    expect(() =>
      parseWorldScene({ ...TINY_WORLD_SCENE, entities: [{ ...entity, parentId: entity.id }] }),
    ).toThrow();
  });

  it('rejects dated tiles that disagree with observed records', () => {
    const day = TINY_WORLD_SCENE.days[0];
    const value = {
      ...TINY_WORLD_SCENE,
      days: [{ ...day, tileId: TINY_WORLD_SCENE.days[1].tileId }, TINY_WORLD_SCENE.days[1]],
    };
    expect(() => parseWorldScene(value)).toThrow();
  });

  it('rejects discoveries before their entity is available', () => {
    const discovery = TINY_WORLD_SCENE.discoveries[0];
    expect(() =>
      parseWorldScene({
        ...TINY_WORLD_SCENE,
        discoveries: [{ ...discovery, availableFrom: '2024-01-01' }],
      }),
    ).toThrow();
  });

  it('rejects unknown primitives, external resources and non-finite model dimensions', () => {
    const recipe = TINY_WORLD_SCENE.modelRecipes[0];
    const part = recipe.parts[0];
    for (const change of [
      { primitive: 'script' },
      { textureUrl: 'https://example.com/texture' },
      { size: { x: Infinity, y: 1, z: 1 } },
    ]) {
      expect(() =>
        parseWorldScene({
          ...TINY_WORLD_SCENE,
          modelRecipes: [{ ...recipe, parts: [{ ...part, ...change }] }],
        }),
      ).toThrow();
    }
  });

  it('rejects oversized and cyclic native input before schema traversal', () => {
    const cycle: { self?: unknown } = {};
    cycle.self = cycle;
    expect(() => parseWorldScene(cycle)).toThrow();
    expect(() =>
      parseWorldScene({
        ...TINY_WORLD_SCENE,
        modelRecipes: Array.from({ length: 10000 }, () => TINY_WORLD_SCENE.modelRecipes[0]),
      }),
    ).toThrow();
  });
});
