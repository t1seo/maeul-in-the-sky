import type { ModelPart } from '../../world/model/geometry-types.js';
import { branch, part, radial, type Variant } from '../../world/model/recipes/primitives.js';
import { cow, goat, pig, sheep } from './animal-farm.js';
import { deer, fox, rabbit, squirrel } from './animal-wild.js';
import { horse, donkey } from './animal-equine.js';
import { TOUR_COLORS as C } from './palette.js';

export { bird, chicken, heron, owl, robin, seagull, winterBird } from './animal-birds.js';
export { lamb } from './animal-farm.js';

const MAMMALS = { cow, deer, rabbit, fox, sheep, horse, donkey, pig, goat, squirrel } as const;
export type AnimalKind = keyof typeof MAMMALS;

export function quadruped(kind: AnimalKind, variant: Variant): readonly ModelPart[] {
  return MAMMALS[kind](variant);
}

export function butterfly(variant: Variant): readonly ModelPart[] {
  return Array.from({ length: 2 + variant }, (_, index) => {
    const [x, y, z] = radial(index, 3, 0.14, 0.14 + index * 0.1);
    return [
      part('cylinder', C.charcoal, [x, y, z], [0.009, 0.06, 0.009], [Math.PI / 2, 0, 0]),
      ...[-1, 1].map((side) =>
        part(
          'sphere',
          index % 2 ? C.lotus : C.gold,
          [x + side * 0.038, y + 0.01, z],
          [0.07, 0.016, 0.083],
          [0, 0, side * 0.35],
        ),
      ),
    ];
  }).flat();
}

export function spider(variant: Variant): readonly ModelPart[] {
  const parts: ModelPart[] = [part('sphere', C.charcoal, [0, 0.04, 0], [0.082, 0.05, 0.1])];
  for (let leg = 0; leg < 8; leg += 1)
    parts.push(
      branch([0, 0.04, 0], radial(leg, 8, 0.105, 0.018, variant * 0.1), 0.009, C.charcoal),
    );
  return parts;
}
