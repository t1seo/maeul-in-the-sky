import { describe, expect, it } from 'vitest';
import { assertSceneComplexity } from '../../../src/world/model/complexity.js';
import { buildWorld } from '../../../src/world/model/build.js';
import { TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { parseWorldScene } from '../../../src/world/model/parse.js';
import { railSleeperCount } from '../../../src/world/model/route-detail.js';
import { inputFor, sequence } from './helpers.js';

describe('world rendering work budget', () => {
  const recipe = TINY_WORLD_SCENE.modelRecipes[0];
  const detailedRecipe = {
    ...recipe,
    parts: Array.from({ length: 256 }, () => recipe.parts[0]),
  };
  const entity = { ...TINY_WORLD_SCENE.entities[0], modelKey: recipe.key };
  const work = {
    ...TINY_WORLD_SCENE,
    modelRecipes: [detailedRecipe],
    entities: Array.from({ length: 520 }, () => entity),
    actors: [],
  };

  it('counts recipe references, including actors, before expanding geometry', () => {
    expect(() => assertSceneComplexity(work)).not.toThrow();
    expect(() =>
      assertSceneComplexity({
        ...work,
        actors: [{ ...TINY_WORLD_SCENE.actors[0], modelKey: recipe.key }],
      }),
    ).toThrow('too detailed');
  });

  it('checks imported work before cross-reference traversal or rendering', () => {
    expect(() => parseWorldScene({ ...work, entities: [...work.entities, entity] })).toThrow(
      'too detailed',
    );
  });

  it('uses the shared rail spacing rule instead of a declared route length', () => {
    const from = { x: 0, y: 0, z: 0 };
    expect(railSleeperCount(from, from)).toBe(0);
    expect(railSleeperCount(from, { x: 0.24, y: 10, z: 0 })).toBe(1);
    expect(railSleeperCount(from, { x: 0.25, y: 0, z: 0 })).toBe(2);
    const route = {
      id: 'rail:budget',
      kind: 'rail' as const,
      nodeIds: [],
      length: 0,
      visibleFrom: '2024-02-28',
      loop: false,
      points: [from, { x: 60, y: 0, z: 0 }],
    };
    expect(() => assertSceneComplexity({ ...work, routes: [route] })).toThrow('too detailed');
    expect(() =>
      assertSceneComplexity({ ...work, routes: [{ ...route, kind: 'walk' }] }),
    ).not.toThrow();
  });

  it('rejects unresolved models and excessive landscape work', () => {
    expect(() => assertSceneComplexity({ ...work, modelRecipes: [] })).toThrow('recipe is missing');
    expect(() =>
      assertSceneComplexity({
        ...TINY_WORLD_SCENE,
        entities: [],
        actors: [],
        terrain: {
          ...TINY_WORLD_SCENE.terrain,
          tiles: Array.from({ length: 100_001 }, () => TINY_WORLD_SCENE.terrain.tiles[0]),
        },
      }),
    ).toThrow('landscape detail');
  });

  it('preserves a dense 790-day generated world and its portable roundtrip', () => {
    const records = sequence('2024-01-01', 790, 50);
    const input = inputFor(records, 2024, { from: '2024-01-01', to: '2026-02-28' });
    const scene = buildWorld(input);
    expect(scene.days).toHaveLength(790);
    expect(() => assertSceneComplexity(scene)).not.toThrow();
    expect(parseWorldScene(scene).entities).toEqual(scene.entities);
  });
});
