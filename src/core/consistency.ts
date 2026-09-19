import type { ConsistencyProgress, ConsistencyTier, SceneCell } from './scene-types.js';

const DAY_MS = 86_400_000;
export const CONSISTENCY_WINDOW_DAYS = 28;
export const CONSISTENCY_MINIMUMS = [0, 5, 12, 20] as const;

function consistencyTier(activeDays: number): ConsistencyTier {
  if (activeDays >= CONSISTENCY_MINIMUMS[3]) return 3;
  if (activeDays >= CONSISTENCY_MINIMUMS[2]) return 2;
  if (activeDays >= CONSISTENCY_MINIMUMS[1]) return 1;
  return 0;
}

export function consistencyByDate(
  cells: readonly Pick<SceneCell, 'date' | 'count'>[],
): ReadonlyMap<string, ConsistencyProgress> {
  const days = [...cells]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((cell) => ({ ...cell, timestamp: Date.parse(`${cell.date}T00:00:00.000Z`) }));
  const result = new Map<string, ConsistencyProgress>();
  let first = 0;
  let activeDays = 0;
  for (const [index, day] of days.entries()) {
    const cutoff = day.timestamp - (CONSISTENCY_WINDOW_DAYS - 1) * DAY_MS;
    while (days[first].timestamp < cutoff) {
      if (days[first].count > 0) activeDays--;
      first++;
    }
    if (day.count > 0) activeDays++;
    result.set(day.date, {
      activeDays,
      observedDays: index - first + 1,
      tier: day.count > 0 ? consistencyTier(activeDays) : 0,
    });
  }
  return result;
}
