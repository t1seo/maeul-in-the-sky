import { TOUR_COLORS as C } from '../assets/palette.js';
import type { TourPlacement } from '../types.js';
import type { AuthoredMapping, AuthoredPart } from './types.js';
import { naturePart } from './nature-models.js';
import { fitNatureFruit } from './nature-fruit.js';

const FRUIT_TREES = new Set([
  'appleTree',
  'oliveTree',
  'lemonTree',
  'orangeTree',
  'pearTree',
  'peachTree',
]);
const MEADOWS = new Set(['wildflowerPatch', 'wildflowerMeadow', 'flowerBed', 'park']);

function flowerGroup(placement: TourPlacement, small: boolean): readonly AuthoredPart[] {
  const variant = placement.source.variant % 3;
  const count = (small ? 3 : 5) + variant;
  const blooms = Array.from({ length: count }, (_, index) => {
    const angle = index * 2.399 + variant * 0.3;
    const radius = (index % 2 ? 0.7 : 0.4) * (small ? 0.55 : 1);
    return naturePart(
      index % 2 ? 'Flower_4_Single' : 'Flower_3_Single',
      (0.7 + (index % 3) * 0.15) * (small ? 0.55 : 1),
      small ? 0.3 : 0.5,
      {
        offset: { x: Math.cos(angle) * radius, y: 0.035, z: Math.sin(angle) * radius },
        yaw: angle,
        season: placement.season,
        wind: 'flower',
      },
    );
  });
  return [
    ...blooms,
    ...[-1, 1].map((side) =>
      naturePart('Grass_Common_Short', small ? 0.2 : 0.4, 0.4, {
        offset: { x: side * 0.55, y: 0.025, z: side * 0.42 },
        yaw: side,
        season: placement.season,
        wind: 'grass',
      }),
    ),
  ];
}

export const natureGarden: AuthoredMapping = (placement, fallback) => {
  const id = placement.source.catalogId;
  const variant = placement.source.variant % 3;
  const season = placement.season;
  const fruit = fallback.recipe.parts.filter(
    (part) => part.primitive === 'sphere' && (part.color === C.red || part.color === C.gold),
  );
  if (FRUIT_TREES.has(id)) {
    return {
      parts: [
        naturePart('CommonTree_5', (0.8 + variant * 0.07) * 1.035 * fallback.scale, 2.2, {
          season,
          wind: 'tree',
        }),
      ],
      retainedParts: fruit.map((part) => fitNatureFruit(part)),
    };
  }
  if (id === 'berryBush') {
    return {
      parts: [naturePart('Bush_Common', 0.86, 1.4, { season, wind: 'shrub' })],
      retainedParts: fruit.map((part) => fitNatureFruit(part)),
    };
  }
  if (id === 'orchard' || id === 'cedarGrove') {
    const count = 2 + variant;
    const orchard = id === 'orchard';
    const parts = Array.from({ length: count }, (_, index) => {
      const angle =
        (index * Math.PI * 2) / count + (orchard ? variant * 0.2 : 0.4 + variant * 0.25);
      const radius = (orchard ? 0.25 : 0.24) * fallback.scale;
      const height = orchard
        ? (0.62 + (index % 2) * 0.12) * 1.035
        : (0.56 + (index % 2) * 0.18) * 1.1;
      return naturePart(
        orchard ? 'CommonTree_5' : index % 2 ? 'Pine_5' : 'Pine_1',
        height * fallback.scale,
        1.9,
        {
          offset: { x: Math.cos(angle) * radius, y: 0, z: Math.sin(angle) * radius },
          yaw: angle,
          season,
          wind: 'tree',
        },
      );
    });
    const attached = fruit.map((part, index) => {
      if (index >= count * 4) return part;
      const angle = (Math.floor(index / 4) * Math.PI * 2) / count + variant * 0.2;
      return fitNatureFruit(part, { x: Math.cos(angle) * 0.25, z: Math.sin(angle) * 0.25 });
    });
    return {
      parts,
      retainedParts: orchard
        ? [...attached, ...fallback.recipe.parts.filter((part) => part.primitive === 'box')]
        : [],
    };
  }
  if (id === 'flower' || MEADOWS.has(id)) {
    return {
      parts: flowerGroup(placement, id === 'flower'),
      retainedParts: fallback.recipe.parts.filter(
        (part) => part.primitive === 'sphere' && part.position.y === 0.022 && part.size.y === 0.035,
      ),
    };
  }
  if (id === 'fern' || id === 'sprout') {
    return {
      parts: [
        naturePart('Fern_1', id === 'sprout' ? 0.25 : 0.65, id === 'sprout' ? 0.55 : 1.55, {
          season,
          wind: 'shrub',
          yaw: variant * 1.7,
        }),
      ],
      retainedParts: [],
    };
  }
  if (id === 'tallGrass') {
    return {
      parts: Array.from({ length: 3 }, (_, index) =>
        naturePart('Grass_Common_Tall', 0.75 + index * 0.16, 0.62, {
          offset: { x: Math.cos(index * 2.4) * 0.3, y: 0, z: Math.sin(index * 2.4) * 0.3 },
          yaw: index + variant,
          season,
          wind: 'grass',
        }),
      ),
      retainedParts: [],
    };
  }
  if (id === 'mushroom') {
    return {
      parts: [naturePart('Mushroom_Common', 0.46 + variant * 0.08, 1.2, { yaw: variant * 1.4 })],
      retainedParts: [],
    };
  }
  return null;
};
