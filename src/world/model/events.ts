import { entityOnTile } from './assets.js';
import { calendarSeason, shiftDate } from './dates.js';
import { monthTile } from './settlement.js';
import type { MonthTerrain } from './terrain.js';
import type {
  WorldDay,
  WorldDiscovery,
  WorldEntity,
  WorldEvent,
  WorldModelFamily,
  WorldSettings,
} from './types.js';

function festivalKind(
  date: string,
  tier: number,
  settings: WorldSettings,
): Extract<WorldEvent['kind'], WorldModelFamily> {
  if (tier === 2) return 'market';
  switch (calendarSeason(date, settings.hemisphere)) {
    case 'spring':
      return tier === 1 ? 'blossoms' : 'lanterns';
    case 'summer':
      return 'lanterns';
    case 'autumn':
      return 'harvest';
    case 'winter':
      return 'snow-lights';
  }
}

export function prepareRewards(
  days: readonly WorldDay[],
  months: readonly MonthTerrain[],
  settings: WorldSettings,
  seed: string,
): {
  readonly entities: readonly WorldEntity[];
  readonly events: readonly WorldEvent[];
} {
  const entities: WorldEntity[] = [];
  const events: WorldEvent[] = [];
  const earned = new Set<string>();
  let total = 0;
  for (const day of days) {
    if (day.kind !== 'observed') continue;
    const month = months.find((month) => month.monthKey === day.monthKey);
    if (!month) continue;
    total += day.count;
    const tier = day.consistency.tier;
    const festivalId = `festival:${day.monthKey}:${tier}`;
    if (day.count > 0 && tier > 0 && !earned.has(festivalId)) {
      earned.add(festivalId);
      const kind = festivalKind(day.date, tier, settings);
      const entity = entityOnTile(
        festivalId,
        'festival',
        monthTile(month, 2 + tier, 9),
        kind,
        day.date,
        seed,
        { date: day.date },
      );
      entities.push(entity);
      events.push({
        id: `event:${festivalId}`,
        kind,
        anchorId: entity.id,
        startsOn: day.date,
        endsOn: shiftDate(day.date, 6) ?? '9999-12-31',
        evidence: {
          kind: 'consistency',
          activeDays: day.consistency.activeDays,
          observedDays: day.consistency.observedDays,
        },
      });
    }
    for (const [index, threshold] of [100, 500, 1000].entries()) {
      const id = `wonder:contributions:${threshold}`;
      if (total < threshold || earned.has(id)) continue;
      earned.add(id);
      const entity = entityOnTile(
        id,
        'wonder',
        monthTile(month, 6 + index, 0),
        index === 0 ? 'monument' : index === 1 ? 'pagoda' : 'pavilion',
        day.date,
        seed,
        { date: day.date, catalogId: index === 0 ? 'statue' : index === 1 ? 'shrine' : 'pavilion' },
      );
      entities.push(entity);
      events.push({
        id: `event:${id}`,
        kind: 'milestone',
        anchorId: id,
        startsOn: day.date,
        evidence: { kind: 'contributions', total: threshold },
      });
    }
  }
  return { entities, events };
}

export function discoveriesFor(entities: readonly WorldEntity[]): readonly WorldDiscovery[] {
  return entities
    .filter((entity) => ['asset', 'wonder', 'release', 'repository'].includes(entity.kind))
    .map((entity) => ({
      id: `discovery:${entity.id}`,
      entityId: entity.id,
      ...(entity.catalogId ? { catalogId: entity.catalogId } : {}),
      title: entity.catalogId?.replace(/([a-z])([A-Z])/g, '$1 $2') ?? entity.kind,
      description:
        entity.kind === 'release'
          ? `Public release ${entity.releaseId} of repository ${entity.repoId}, published on ${entity.visibleFrom}.`
          : entity.kind === 'repository'
            ? `Public repository ${entity.repoId}; metadata is current at retrieval, not historical contribution attribution.`
            : `A ${entity.kind} available from ${entity.visibleFrom}; its position is fixed for this world.`,
      availableFrom: entity.visibleFrom,
    }));
}
