import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fixtureSnapshot, improvementFixtures, FIXTURE_SETTINGS } from '../qa/fixtures.js';
import { parseSnapshot } from '../../src/core/settings/parse.js';

const directory = resolve('tests/fixtures/improvements');
await mkdir(directory, { recursive: true });
const fixtures = improvementFixtures();
for (const [name, data] of Object.entries(fixtures)) {
  const snapshot = fixtureSnapshot(data);
  parseSnapshot(snapshot);
  await writeFile(resolve(directory, `${name}.json`), `${JSON.stringify(snapshot, null, 2)}\n`);
}
for (const [name, settings] of [
  ['fixed-max-2025', { ...FIXTURE_SETTINGS, normalization: { kind: 'fixed', maxCount: 20 } }],
  [
    'malicious-title',
    {
      ...FIXTURE_SETTINGS,
      title: '<script>alert("x")</script> & "quoted" ${{ secrets.GITHUB_TOKEN }}',
    },
  ],
] as const) {
  const snapshot = fixtureSnapshot(fixtures['mixed-2025'], settings);
  parseSnapshot(snapshot);
  await writeFile(resolve(directory, `${name}.json`), `${JSON.stringify(snapshot, null, 2)}\n`);
}
const archive = {
  schemaVersion: 1,
  kind: 'maeul-archive',
  snapshots: ['full-2024', 'year-2025'].map((name) => fixtureSnapshot(fixtures[name])),
  comparison: { normalization: { kind: 'fixed', maxCount: 20 }, years: [2024, 2025] },
};
await writeFile(
  resolve(directory, 'two-year-archive.json'),
  `${JSON.stringify(archive, null, 2)}\n`,
);
await writeFile(
  resolve(directory, 'malformed.json'),
  '{"schemaVersion":999,"kind":"maeul-snapshot","username":"benchmark"}\n',
);
console.log(`Wrote ${Object.keys(fixtures).length + 4} fixtures to ${directory}`);
