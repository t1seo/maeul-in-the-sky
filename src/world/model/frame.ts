import { sampleActor } from './actors.js';
import { calendarSeason, worldDateSchema } from './dates.js';
import { WorldModelError } from './errors.js';
import type { WorldDay, WorldFrame, WorldScene, WorldStats, WorldView } from './types.js';

function statistics(days: readonly WorldDay[]): WorldStats {
  let totalContributions = 0;
  let activeDays = 0;
  let observedDays = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  for (const day of days) {
    switch (day.kind) {
      case 'missing':
        currentStreak = 0;
        break;
      case 'observed':
        observedDays += 1;
        totalContributions += day.count;
        if (day.count > 0) {
          activeDays += 1;
          currentStreak += 1;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else currentStreak = 0;
        break;
    }
  }
  return {
    totalContributions,
    activeDays,
    observedDays,
    missingDays: days.length - observedDays,
    currentStreak,
    longestStreak,
  };
}

export function frameWorld(scene: WorldScene, view: WorldView): WorldFrame {
  if (!worldDateSchema.safeParse(view.cursorDate).success || !Number.isFinite(view.elapsedSeconds))
    throw new WorldModelError(
      'INVALID_INPUT',
      'World view requires a real cursor date and finite time',
    );
  const cursorDate = view.cursorDate;
  const days = scene.days.filter((day) => day.date <= cursorDate);
  const events = scene.events.filter(
    (event) =>
      event.startsOn <= cursorDate && (event.endsOn === undefined || event.endsOn >= cursorDate),
  );
  const activeEvents = new Set(events.map((event) => event.anchorId));
  const entities = scene.entities.filter(
    (entity) =>
      entity.visibleFrom <= cursorDate &&
      (entity.kind !== 'festival' || activeEvents.has(entity.id)),
  );
  const routes = scene.routes.filter((route) => route.visibleFrom <= cursorDate);
  const routeById = new Map(routes.map((route) => [route.id, route]));
  const elapsed = Math.max(0, view.elapsedSeconds);
  const actors = scene.actors.flatMap((actor) => {
    const route = routeById.get(actor.routeId);
    return actor.visibleFrom <= cursorDate && route
      ? [{ ...actor, ...sampleActor(actor, route, elapsed) }]
      : [];
  });
  return {
    cursorDate,
    season:
      view.seasonOverride === 'calendar'
        ? calendarSeason(cursorDate, scene.settings.hemisphere)
        : view.seasonOverride,
    days,
    terrain: {
      ...scene.terrain,
      tiles: scene.terrain.tiles.map((tile) =>
        tile.date && tile.date > cursorDate ? { ...tile, activityHeight: 0 } : tile,
      ),
    },
    entities,
    routes,
    actors,
    events,
    discoveries: scene.discoveries.filter((discovery) => discovery.availableFrom <= cursorDate),
    stats: statistics(days),
  };
}
