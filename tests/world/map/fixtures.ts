import { TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { defaultWorldView } from '../../../src/world/model/index.js';
import type { WorldFrame, WorldScene } from '../../../src/world/model/types.js';

export const mapScene: WorldScene = {
  ...TINY_WORLD_SCENE,
  entities: TINY_WORLD_SCENE.entities.map((entity) => ({ ...entity, catalogId: 'pine' })),
};
export const mapView = { ...defaultWorldView(mapScene), motion: 'off' as const };
export const mapFrame: WorldFrame = {
  cursorDate: mapView.cursorDate,
  season: 'winter',
  days: mapScene.days,
  terrain: mapScene.terrain,
  entities: mapScene.entities,
  routes: [],
  actors: [],
  events: [],
  discoveries: mapScene.discoveries,
  stats: {
    totalContributions: 5,
    activeDays: 1,
    observedDays: 2,
    missingDays: 0,
    currentStreak: 0,
    longestStreak: 1,
  },
};
