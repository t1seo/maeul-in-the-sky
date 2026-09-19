import { Color } from 'three';
import { seasonForMonth, weatherForMonth } from '../../model/seasons.js';
import type { WorldScene, WorldSeason, WorldTile, WorldView } from '../../model/types.js';

const greens = {
  spring: '#9aba76',
  summer: '#81a66e',
  autumn: '#b99b63',
  winter: '#d5dfdb',
} as const;
const surfaces = {
  rock: '#9b9992',
  sand: '#d8c6a4',
  water: '#599d9e',
  path: '#c4ad88',
  field: '#a1ac65',
} as const;
const foliage = {
  spring: new Color('#a6c97b'),
  summer: new Color('#80a462'),
  autumn: new Color('#d99447'),
  winter: new Color('#c9dad8'),
} as const;

export function regionSeasons(
  scene: WorldScene,
): (regionId: string, view: WorldView) => WorldSeason {
  const months = new Map(scene.regions.map((region) => [region.id, region.monthKey]));
  const cache = new Map<string, WorldSeason>();
  return (regionId, view) => {
    const month = months.get(regionId) ?? view.cursorDate.slice(0, 7);
    const key = `${view.seasonOverride}:${month}`;
    const cached = cache.get(key);
    if (cached) return cached;
    const season = seasonForMonth(scene, view, month);
    cache.set(key, season);
    return season;
  };
}

export function groundColor(
  tile: WorldTile,
  season: WorldSeason,
  weather: WorldView['weather'],
): Color {
  const color = new Color(tile.surface === 'grass' ? greens[season] : surfaces[tile.surface]);
  if (weather === 'snow' && tile.surface !== 'water') color.lerp(new Color('#edf0e9'), 0.65);
  if (weather === 'rain' && tile.surface !== 'water') color.multiplyScalar(0.94);
  return color;
}

export function regionWeather(scene: WorldScene) {
  const months = new Map(scene.regions.map((region) => [region.id, region.monthKey]));
  const cache = new Map<string, ReturnType<typeof weatherForMonth>>();
  return (regionId: string, view: WorldView) => {
    const month = months.get(regionId) ?? view.cursorDate.slice(0, 7);
    const key = `${view.seasonOverride}:${view.weather}:${month}`;
    const cached = cache.get(key);
    if (cached) return cached;
    const weather = weatherForMonth(scene, view, month);
    cache.set(key, weather);
    return weather;
  };
}

export function recipeColor(
  base: Color,
  seasonal: boolean,
  season: WorldSeason,
  weather: WorldView['weather'],
): Color {
  const color = base.clone();
  if (seasonal && season !== 'summer')
    color.lerp(foliage[season], season === 'spring' ? 0.3 : 0.78);
  if (seasonal && weather === 'snow') color.lerp(foliage.winter, 0.8);
  return color;
}
