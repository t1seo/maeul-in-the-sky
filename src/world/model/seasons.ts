import { calendarSeason, worldDateSchema } from './dates.js';
import { WorldModelError } from './errors.js';
import type { WorldScene, WorldSeason, WorldView } from './types.js';

export function seasonForMonth(scene: WorldScene, view: WorldView, monthKey: string): WorldSeason {
  const date = `${monthKey}-15`;
  if (!worldDateSchema.safeParse(date).success)
    throw new WorldModelError('INVALID_INPUT', 'Expected a YYYY-MM calendar month');
  return view.seasonOverride === 'calendar'
    ? calendarSeason(date, scene.settings.hemisphere)
    : view.seasonOverride;
}

export function weatherForMonth(
  scene: WorldScene,
  view: WorldView,
  monthKey: string,
): 'clear' | 'rain' | 'snow' {
  if (view.weather !== 'seasonal') return view.weather;
  switch (seasonForMonth(scene, view, monthKey)) {
    case 'summer':
      return 'rain';
    case 'winter':
      return 'snow';
    case 'spring':
    case 'autumn':
      return 'clear';
  }
}
