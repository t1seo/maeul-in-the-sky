import { getSeasonalPalette100 } from '../../themes/terrain/palette.js';
import type { TerrainPalette100 } from '../../themes/terrain/palette.js';
import type { WorldScene, WorldSeason, WorldView } from '../model/types.js';
import { seasonForMonth } from '../model/seasons.js';
import { lerpColor } from '../../utils/color.js';

export type MapPalette = {
  readonly skyTop: string;
  readonly skyBottom: string;
  readonly horizon: string;
  readonly ink: string;
  readonly muted: string;
  readonly ground: readonly [string, string, string];
  readonly cliff: readonly [string, string];
  readonly water: string;
  readonly foam: string;
  readonly sand: string;
  readonly path: string;
  readonly foliage: TerrainPalette100;
};

const SEASONS = {
  spring: { ground: ['#a8c78d', '#bad69b', '#94ba7d'], week: 17 },
  summer: { ground: ['#82ad70', '#9ac27f', '#729c65'], week: 30 },
  autumn: { ground: ['#b2b879', '#c7bf86', '#9ea267'], week: 43 },
  winter: { ground: ['#d4e1d9', '#e7eee6', '#b8cfc5'], week: 4 },
} as const;

export function mapPalette(season: WorldSeason, lighting: WorldView['lighting']): MapPalette {
  const colors = SEASONS[season];
  const foliage = getSeasonalPalette100(lighting === 'night' ? 'dark' : 'light', colors.week);
  const base = {
    ground: colors.ground,
    foliage,
    cliff: ['#927b60', '#6d6656'],
    water: '#68b6b7',
    foam: '#d7eee3',
    sand: '#d7c797',
    path: '#cabc95',
  } satisfies Pick<MapPalette, 'ground' | 'foliage' | 'cliff' | 'water' | 'foam' | 'sand' | 'path'>;
  switch (lighting) {
    case 'day':
      return {
        ...base,
        skyTop: '#c5dddd',
        skyBottom: '#f0eedb',
        horizon: '#f7f2da',
        ink: '#2c4e4f',
        muted: '#657d73',
      };
    case 'sunset':
      return {
        ...base,
        skyTop: '#adbdc8',
        skyBottom: '#f0c7a5',
        horizon: '#ffe2af',
        ink: '#574f57',
        muted: '#8e7365',
        cliff: ['#a28168', '#766075'],
        water: '#91b5b6',
      };
    case 'night':
      return {
        ...base,
        skyTop: '#142b41',
        skyBottom: '#345768',
        horizon: '#7998a0',
        ink: '#e2eee0',
        muted: '#a5c4bf',
        ground: [
          lerpColor(colors.ground[0], '#193d4b', 0.62),
          lerpColor(colors.ground[1], '#193d4b', 0.62),
          lerpColor(colors.ground[2], '#193d4b', 0.62),
        ],
        cliff: ['#4c565b', '#39474d'],
        water: '#376d83',
        foam: '#6d9ba6',
        sand: '#7a8574',
        path: '#7d8772',
      };
  }
}

export function regionPalettes(
  scene: WorldScene,
  view: WorldView,
): ReadonlyMap<string, MapPalette> {
  return new Map(
    scene.regions.map((region) => [
      region.id,
      mapPalette(seasonForMonth(scene, view, region.monthKey), view.lighting),
    ]),
  );
}
