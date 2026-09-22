import type { ModelPart } from '../../world/model/geometry-types.js';
import { part, branch } from '../../world/model/recipes/primitives.js';
import { TOUR_COLORS as C } from '../assets/palette.js';
import type { TourAsset } from '../types.js';
import type { AuthoredPart } from './types.js';
import { villagePart } from './village-models.js';

export function onggiParts(): readonly AuthoredPart[] {
  return [
    villagePart('onggi-terrace', 0.16, 1.65),
    villagePart('onggi-large', 0.9, 0.75, { offset: { x: -0.38, y: 0.16, z: -0.2 } }),
    villagePart('onggi-medium', 0.62, 0.54, { offset: { x: 0.37, y: 0.16, z: -0.2 } }),
    villagePart('onggi-small', 0.4, 0.4, { offset: { x: 0.08, y: 0.16, z: 0.36 } }),
    villagePart('onggi-small', 0.33, 0.34, { offset: { x: -0.4, y: 0.16, z: 0.35 } }),
  ];
}

export function villageDetails(id: string, fallback: TourAsset): readonly ModelPart[] {
  const scale = fallback.scale;
  switch (id) {
    case 'campfire':
      return fallback.recipe.parts.filter((item) => item.color === C.red || item.color === C.glow);
    case 'houseWinter':
    case 'houseBWinter':
    case 'barnWinter':
      return fallback.recipe.parts.filter(
        (item) => item.color === C.snow && item.primitive === 'sphere',
      );
    case 'fountain':
    case 'frozenFountain': {
      const ice = id === 'frozenFountain';
      const surfaces = [
        [0.194, 1.89],
        [0.518, 0.767],
      ].map(([height, diameter]) =>
        part(
          'cylinder',
          ice ? C.ice : C.water,
          [0, height / scale, 0],
          [diameter / scale, 0.01 / scale, diameter / scale],
          [0, 0, 0],
          ice ? 0.28 : 0.2,
        ),
      );
      if (ice) return surfaces;
      return [
        ...surfaces,
        ...Array.from({ length: 6 }, (_, index) => {
          const angle = (index * Math.PI) / 3;
          return branch(
            [(Math.cos(angle) * 0.25) / scale, 0.535 / scale, (Math.sin(angle) * 0.25) / scale],
            [(Math.cos(angle) * 0.7) / scale, 0.21 / scale, (Math.sin(angle) * 0.7) / scale],
            0.022 / scale,
            C.waterLight,
          );
        }),
      ];
    }
    case 'torch':
      return [
        part('cone', C.red, [0, 2.02 / scale, 0], [0.22 / scale, 0.4 / scale, 0.22 / scale]),
        part('cone', C.glow, [0, 2.03 / scale, 0], [0.11 / scale, 0.31 / scale, 0.11 / scale]),
      ];
    case 'iceCreamCart':
      return [
        part('box', C.cream, [0, 0.91 / scale, 0], [0.6 / scale, 0.08 / scale, 0.5 / scale]),
        ...[C.cream, C.pink, C.wood].map((color, index) =>
          part(
            'sphere',
            color,
            [((index - 1) * 0.19) / scale, 1.01 / scale, 0],
            [0.18 / scale, 0.16 / scale, 0.18 / scale],
          ),
        ),
      ];
    default:
      return [];
  }
}
