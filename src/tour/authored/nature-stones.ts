import { TOUR_COLORS as C } from '../assets/palette.js';
import type { AuthoredMapping } from './types.js';
import { naturePart } from './nature-models.js';

const ROCKS = ['Rock_Medium_1', 'Rock_Medium_2', 'Rock_Medium_3'] as const;
const ROCKY = new Set([
  'rock',
  'boulder',
  'alpineRocks',
  'snowCoveredRock',
  'tidePools',
  'lotusPond',
  'willowPond',
  'frozenPond',
  'hotSpring',
  'geyser',
  'bioluminescentPool',
]);
const STONE_COLORS = new Set<string>([C.stone, C.stoneLight]);
const PURE_ROCKS = new Set(['rock', 'boulder', 'alpineRocks', 'snowCoveredRock']);

export const natureStone: AuthoredMapping = (placement, fallback) => {
  const id = placement.source.catalogId;
  if (id === 'cobblePath') {
    return {
      parts: fallback.recipe.parts.map((part) =>
        naturePart('Pebble_Round_1', part.size.y * fallback.scale, part.size.x * fallback.scale, {
          offset: {
            x: part.position.x * fallback.scale,
            y: 0,
            z: part.position.z * fallback.scale,
          },
          yaw: part.rotation.y,
        }),
      ),
      retainedParts: [],
    };
  }
  if (!ROCKY.has(id)) return null;
  const pure = PURE_ROCKS.has(id);
  const stones = fallback.recipe.parts.filter(
    (part) => STONE_COLORS.has(part.color) || (pure && part.color === C.stoneDark),
  );
  const selected = new Set(stones);
  return {
    parts: stones.map((part, index) =>
      naturePart(
        ROCKS[(index + placement.source.variant) % 3],
        part.size.y * fallback.scale,
        Math.max(part.size.x, part.size.z) * fallback.scale,
        {
          offset: {
            x: part.position.x * fallback.scale,
            y: Math.max(0, part.position.y - part.size.y / 2) * fallback.scale,
            z: part.position.z * fallback.scale,
          },
          yaw: part.rotation.y,
        },
      ),
    ),
    retainedParts: fallback.recipe.parts.filter((part) =>
      pure ? part.color === C.snow : !selected.has(part),
    ),
  };
};
