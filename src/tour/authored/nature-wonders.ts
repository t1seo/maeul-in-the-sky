import { TOUR_COLORS as C } from '../assets/palette.js';
import type { AuthoredMapping } from './types.js';
import { naturePart } from './nature-models.js';

export const natureWonder: AuthoredMapping = (placement, fallback) => {
  const id = placement.source.catalogId;
  if (id === 'worldTree') {
    return {
      parts: [naturePart('TwistedTree_1', 6.5, 5.4, { season: placement.season, wind: 'tree' })],
      retainedParts: fallback.recipe.parts.filter((part) => part.color === C.glow),
    };
  }
  if (id === 'sakuraEternal') {
    return {
      parts: [
        naturePart('TwistedTree_1', 5.5, 4.6, {
          season: 'spring',
          wind: 'tree',
          foliageColor: '#efbdd0',
        }),
      ],
      retainedParts: fallback.recipe.parts.filter(
        (part) => part.primitive === 'sphere' && part.size.y === 0.013,
      ),
    };
  }
  if (id === 'aurora') {
    return {
      parts: [
        naturePart('Pine_1', 2.8, 1.8, {
          offset: { x: -0.27 * fallback.scale, y: 0, z: -0.09 * fallback.scale },
          season: 'winter',
          wind: 'tree',
        }),
        naturePart('Pine_5', 2.1, 1.5, {
          offset: { x: 0.29 * fallback.scale, y: 0, z: 0.03 * fallback.scale },
          season: 'winter',
          wind: 'tree',
        }),
      ],
      retainedParts: fallback.recipe.parts.filter(
        (part) => part.color === C.jade || part.color === C.violet,
      ),
    };
  }
  return null;
};
