import { CIRCLE_ISLAND, CIRCLE_SEASONS, circlePoint } from './circular-layout.js';
import type { WorldWaterway } from './types.js';

export function circularWaterways(): readonly WorldWaterway[] {
  return CIRCLE_SEASONS.flatMap((season): readonly WorldWaterway[] => {
    const point = (u: number, v: number, y = 0) => circlePoint(season, u, v, y);
    const mouth = point(9.5, 31);
    const river = Array.from({ length: 20 }, (_, index) => point(9.5, 11.5 + index));
    const pond = Array.from({ length: 13 }, (_, index) => {
      const angle = (index / 12) * Math.PI * 2;
      return point(9.5 + Math.cos(angle) * 1.1, 11.5 + Math.sin(angle) * 1.1);
    });
    return [
      {
        id: `water:seasonal-circle:${season}:river`,
        islandId: CIRCLE_ISLAND,
        kind: 'river',
        points: [...river, mouth],
        width: 0.78,
      },
      {
        id: `water:seasonal-circle:${season}:pond`,
        islandId: CIRCLE_ISLAND,
        kind: 'pond',
        points: pond,
        width: 0.78,
      },
      {
        id: `water:seasonal-circle:${season}:waterfall`,
        islandId: CIRCLE_ISLAND,
        kind: 'waterfall',
        points: [mouth, { ...mouth, y: -9 }],
        width: 0.78,
      },
    ];
  });
}
