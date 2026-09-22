import { TOUR_COLORS as C } from '../assets/palette.js';
import type { TourPlacement } from '../types.js';
import type { AuthoredMapping, AuthoredPart } from './types.js';
import { natureStone } from './nature-stones.js';

const FOLIAGE = {
  willow: ['DarkGreen'],
  cattail: ['lambert2SG'],
  lilypad: ['Green'],
  palm: ['leafsGreen'],
} as const;
type Species = keyof typeof FOLIAGE;
const SUMMER_GREENS: Readonly<Partial<Record<Species, string>>> = {
  palm: '#648a3a',
};

function plant(
  species: Species,
  height: number,
  maxSpan: number,
  placement: TourPlacement,
  options: Partial<AuthoredPart> = {},
): AuthoredPart {
  const summerColor = placement.season === 'summer' ? SUMMER_GREENS[species] : undefined;
  return {
    file: `nature/${species}.glb`,
    height,
    maxSpan,
    season: placement.season,
    wind: species === 'cattail' || species === 'lilypad' ? 'grass' : 'tree',
    foliageMaterials: FOLIAGE[species],
    ...(summerColor ? { foliageColor: summerColor } : {}),
    ...options,
  };
}

export const natureWetland: AuthoredMapping = (placement, fallback) => {
  const id = placement.source.catalogId;
  const variant = placement.source.variant % 3;
  if (id === 'willow' || id === 'palm') {
    return {
      parts: [
        plant(id, 3.4 + variant * 0.15, id === 'willow' ? 3.1 : 2.8, placement, {
          yaw: variant * 1.4,
        }),
      ],
      retainedParts: [],
    };
  }
  if (id === 'reeds' || id === 'cattail' || id === 'reedMarsh') {
    const count = id === 'reedMarsh' ? 3 : 2 + (variant % 2);
    return {
      parts: Array.from({ length: count }, (_, index) =>
        plant('cattail', 1.25 + index * 0.14, 0.64, placement, {
          offset: { x: Math.cos(index * 2.4) * 0.34, y: 0, z: Math.sin(index * 2.4) * 0.34 },
          yaw: index + variant,
        }),
      ),
      retainedParts: fallback.recipe.parts.filter((part) => part.color === C.water),
    };
  }
  if (id === 'lily' || id === 'pondLily') {
    return {
      parts: [
        plant('lilypad', 0.3, 0.9, placement, {
          offset: { x: 0, y: 0.025, z: 0 },
          yaw: variant * 1.4,
        }),
      ],
      retainedParts: [],
    };
  }
  if (id !== 'lotusPond' && id !== 'willowPond' && id !== 'tidePools') return null;
  const stones = natureStone(placement, fallback);
  if (!stones) return null;
  const willow = id === 'willowPond';
  const scale = fallback.scale * (willow ? 0.7 : 1);
  const origin = { x: willow ? 0.15 * fallback.scale : 0, z: willow ? 0.05 * fallback.scale : 0 };
  const parts: AuthoredPart[] = [...stones.parts];
  for (let index = 0; index < 2 + variant; index += 1) {
    const angle = (index * Math.PI * 2) / (3 + variant) + 0.5;
    parts.push(
      plant('lilypad', 0.075 * scale, 0.18 * scale, placement, {
        offset: {
          x: origin.x + Math.cos(angle) * 0.2 * scale,
          y: 0.12 * scale,
          z: origin.z + Math.sin(angle) * 0.2 * scale,
        },
        yaw: index + variant,
      }),
    );
  }
  parts.push(
    plant('cattail', 0.34 * scale, 0.2 * scale, placement, {
      offset: { x: origin.x - 0.19 * scale, y: 0.1 * scale, z: origin.z - 0.23 * scale },
      yaw: variant,
    }),
  );
  if (willow)
    parts.push(
      plant('willow', 2.9, 2.5, placement, {
        offset: { x: -0.23 * fallback.scale, y: 0, z: -0.09 * fallback.scale },
      }),
    );
  return {
    parts,
    retainedParts: stones.retainedParts.filter(
      (part) => part.color === C.water || part.color === C.stoneDark,
    ),
  };
};
