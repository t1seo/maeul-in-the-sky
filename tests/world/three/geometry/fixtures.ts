import { TINY_WORLD_SCENE } from '../../../../src/world/model/fixture.js';
import { defaultWorldView } from '../../../../src/world/model/index.js';
import type { WorldFrame, WorldScene } from '../../../../src/world/model/types.js';

export const scene: WorldScene = TINY_WORLD_SCENE;
export const view = { ...defaultWorldView(scene), motion: 'off' as const };

export function frameFor(world = scene, cursorDate = world.range.to): WorldFrame {
  return {
    cursorDate,
    season: 'summer',
    days: world.days.filter((day) => day.date <= cursorDate),
    terrain: world.terrain,
    entities: world.entities.filter((entity) => entity.visibleFrom <= cursorDate),
    routes: world.routes.filter((route) => route.visibleFrom <= cursorDate),
    actors: [],
    events: [],
    discoveries: [],
    stats: {
      totalContributions: 5,
      activeDays: 1,
      observedDays: 2,
      missingDays: 0,
      currentStreak: 0,
      longestStreak: 1,
    },
  };
}
