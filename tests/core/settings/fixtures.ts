export function snapshotFixture(year = 2024) {
  return {
    schemaVersion: 1,
    kind: 'maeul-snapshot',
    username: 'octocat',
    year,
    weeks: [
      {
        firstDay: `${year}-02-25`,
        days: [
          { date: `${year}-02-29`, count: 10, level: 4 },
          { date: `${year}-02-27`, count: 0, level: 0 },
          { date: `${year}-02-28`, count: 2, level: 1 },
        ],
      },
    ],
    settings: { preset: 'nature', title: '<svg onload="bad()"> & ${{ inert }}' },
    source: { kind: 'github', fetchedAt: '2024-03-01T01:00:00+01:00' },
  };
}
