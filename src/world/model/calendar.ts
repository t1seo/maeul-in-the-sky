import { datesIn, shiftDate } from './dates.js';
import type { PreparedWorldInput } from './input.js';
import type { WorldConsistency, WorldDay } from './types.js';

export function consistencyAt(
  date: string,
  observations: ReadonlyMap<string, number>,
): WorldConsistency {
  let activeDays = 0;
  let observedDays = 0;
  for (let offset = 0; offset < 28; offset += 1) {
    const key = shiftDate(date, -offset);
    const count = key === undefined ? undefined : observations.get(key);
    if (count !== undefined) observedDays += 1;
    if (count !== undefined && count > 0) activeDays += 1;
  }
  return {
    activeDays,
    observedDays,
    complete: observedDays === 28,
    tier: activeDays >= 20 ? 3 : activeDays >= 12 ? 2 : activeDays >= 5 ? 1 : 0,
  };
}

export function rewardTier(count: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (count >= 50) return 5;
  if (count >= 25) return 4;
  if (count >= 10) return 3;
  if (count >= 5) return 2;
  return count > 0 ? 1 : 0;
}

export function prepareDays(input: PreparedWorldInput): readonly WorldDay[] {
  const counts = new Map(
    input.snapshot.weeks.flatMap((week) => week.days).map((day) => [day.date, day.count]),
  );
  const history = new Map(
    [...(input.contextDays ?? []), ...input.snapshot.weeks.flatMap((week) => week.days)].map(
      (day) => [day.date, day.count],
    ),
  );
  return datesIn(input.range).map((date): WorldDay => {
    const common = { id: `day:${date}`, date, tileId: `tile:${date}`, monthKey: date.slice(0, 7) };
    const count = counts.get(date);
    return count === undefined
      ? { ...common, kind: 'missing' }
      : {
          ...common,
          kind: 'observed',
          count,
          rewardTier: rewardTier(count),
          consistency: consistencyAt(date, history),
        };
  });
}
