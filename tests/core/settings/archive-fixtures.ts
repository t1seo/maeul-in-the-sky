import { parseSnapshot } from '../../../src/core/settings/parse.js';

export function annualSnapshot(
  year: number,
  counts: readonly number[] = [1, 10],
  username = 'octocat',
) {
  return parseSnapshot({
    schemaVersion: 1,
    kind: 'maeul-snapshot',
    username,
    year,
    weeks: counts.map((count, index) => ({
      firstDay: `${year}-01-01`,
      days: [
        {
          date: `${year}-01-${String(index + 1).padStart(2, '0')}`,
          count,
          level: count > 0 ? 1 : 0,
        },
      ],
    })),
    settings: {},
    source: { kind: 'sample' },
  });
}
