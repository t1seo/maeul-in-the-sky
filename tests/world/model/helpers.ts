import { resolveRenderSettings } from '../../../src/core/settings/resolve.js';
import { defaultWorldSettings } from '../../../src/world/model/index.js';
import type { WorldInput } from '../../../src/world/model/types.js';

export function inputFor(
  records: readonly (readonly [string, number])[],
  year = 2024,
  range?: WorldInput['range'],
): WorldInput {
  const snapshot: WorldInput['snapshot'] = {
    schemaVersion: 1,
    kind: 'maeul-snapshot',
    username: 'test-village',
    year,
    weeks: records.map(([date, count]) => ({ firstDay: date, days: [{ date, count, level: 0 }] })),
    settings: resolveRenderSettings({ style: 'korean' }),
    source: { kind: 'sample' },
  };
  return {
    snapshot,
    settings: defaultWorldSettings(snapshot),
    repositories: [],
    ...(range ? { range } : {}),
  };
}

export function sequence(
  from: string,
  count: number,
  contributions = 1,
): readonly (readonly [string, number])[] {
  const start = Date.parse(`${from}T00:00:00Z`);
  return Array.from(
    { length: count },
    (_, index) =>
      [new Date(start + index * 86_400_000).toISOString().slice(0, 10), contributions] as const,
  );
}
