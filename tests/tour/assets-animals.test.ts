import { describe, expect, it } from 'vitest';
import { createTourAsset } from '../../src/tour/assets/index.js';
import { TOUR_COLORS as C } from '../../src/tour/assets/palette.js';

const ANIMALS = [
  'cow',
  'deer',
  'rabbit',
  'sheep',
  'lamb',
  'goat',
  'horse',
  'donkey',
  'pigpen',
  'fox',
  'squirrel',
] as const;
const BIRDS = ['bird', 'chicken', 'owl', 'seagull', 'robinBird', 'winterBird', 'heron'] as const;
const partsOf = (id: string) => createTourAsset(id, 0, 'summer').recipe.parts;

describe('recognizable animal construction', () => {
  it.each([{ ids: ANIMALS }, { ids: BIRDS }])(
    'keeps every species recognizable without its name or paint',
    ({ ids }) => {
      // Given mammals or birds that share the same village.
      // When names, scales and material colors are removed from their recipes.
      const silhouettes = ids.map((id) =>
        JSON.stringify(
          partsOf(id).map(({ primitive, position, size, rotation }) => ({
            primitive,
            position,
            size,
            rotation,
          })),
        ),
      );
      // Then no two species have the same body construction.
      expect(new Set(silhouettes).size).toBe(ids.length);
    },
  );

  it('gives a cow a broad pink muzzle, several dark patches and horizontal ears', () => {
    const parts = partsOf('cow');
    expect(parts.some((p) => p.color === C.pink && p.position.x > 0.2 && p.size.z > 0.14)).toBe(
      true,
    );
    expect(
      parts.filter((p) => p.color === C.charcoal && p.size.x > 0.08 && p.position.y > 0.2).length,
    ).toBeGreaterThanOrEqual(3);
    expect(
      parts.filter(
        (p) => p.position.y > 0.4 && p.size.z > p.size.y * 2 && Math.abs(p.position.z) > 0.08,
      ).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it('gives rabbits long paired ears, round hind haunches and a cotton tail', () => {
    const parts = partsOf('rabbit');
    expect(
      parts.filter((p) => p.position.y > 0.3 && p.size.y > 0.16 && p.size.y > p.size.x * 3).length,
    ).toBeGreaterThanOrEqual(2);
    expect(parts.some((p) => p.position.x < 0 && p.size.y > 0.17 && p.size.z > 0.1)).toBe(true);
    expect(parts.some((p) => p.color === C.cream && p.position.x < -0.13 && p.size.y > 0.06)).toBe(
      true,
    );
  });

  it('gives sheep a fleece silhouette with a separate dark face', () => {
    const parts = partsOf('sheep');
    expect(
      parts.filter((p) => p.color === C.cream && p.primitive === 'sphere').length,
    ).toBeGreaterThanOrEqual(10);
    expect(parts.some((p) => p.color === C.charcoal && p.position.x > 0.15 && p.size.y > 0.1)).toBe(
      true,
    );
  });

  it('separates a deer’s branching antlers from a goat’s horns and beard', () => {
    const deer = partsOf('deer');
    const goat = partsOf('goat');
    expect(
      deer.filter((p) => p.primitive === 'cylinder' && p.position.y > 0.55).length,
    ).toBeGreaterThanOrEqual(6);
    expect(
      goat.some((p) => p.primitive === 'cone' && p.rotation.z === Math.PI && p.position.x > 0.2),
    ).toBe(true);
  });

  it('gives donkeys visibly longer ears than horses', () => {
    const earLength = (id: string) =>
      Math.max(
        ...partsOf(id)
          .filter((p) => p.position.y > 0.5 && p.size.x < 0.09)
          .map((p) => p.size.y),
      );
    expect(earLength('donkey')).toBeGreaterThan(earLength('horse') * 1.6);
  });

  it('gives foxes a white-tipped brush and squirrels a high curled tail', () => {
    expect(
      partsOf('fox').some((p) => p.color === C.cream && p.position.x < -0.2 && p.size.x > 0.1),
    ).toBe(true);
    expect(
      partsOf('squirrel').filter((p) => p.position.x < -0.1 && p.position.y > 0.25).length,
    ).toBeGreaterThanOrEqual(3);
  });

  it('gives chickens a comb and owls two large forward-facing eyes', () => {
    expect(partsOf('chicken').some((p) => p.color === C.red && p.position.y > 0.3)).toBe(true);
    expect(
      partsOf('owl').filter((p) => p.color === C.gold && p.position.x > 0.05 && p.size.y > 0.04)
        .length,
    ).toBeGreaterThanOrEqual(2);
  });

  it('keeps the cardinal crest on the red winter bird without floating it over brown variants', () => {
    const crests = (variant: number) =>
      createTourAsset('winterBird', variant, 'winter').recipe.parts.filter(
        (p) => p.primitive === 'cone' && p.position.y > 0.32,
      );
    expect(crests(0)).toHaveLength(1);
    expect(crests(1)).toHaveLength(0);
    expect(crests(2)).toHaveLength(0);
  });

  it.each([...ANIMALS, ...BIRDS])('%s stays detailed but bounded for instanced rendering', (id) => {
    for (const variant of [0, 1, 2, 99]) {
      const asset = createTourAsset(id, variant, 'autumn');
      expect(asset.recipe.parts.length).toBeGreaterThanOrEqual(15);
      expect(asset.recipe.parts.length).toBeLessThanOrEqual(160);
      expect(asset.collider).toBeNull();
      expect(asset.recipe.parts.every((p) => p.opacity === 1)).toBe(true);
    }
  });
});
